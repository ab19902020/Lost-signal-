import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';

// The surface, across the day.
//
// Lighting is the one thing in this project that cannot be asserted — there is
// no number that says whether a compound looks like the end of the world — so
// this shoots it at the hours that matter and prints what the sky and the grade
// were actually set to for each frame. The numbers are the useful half: they
// caught a grade that was being damped toward its target and never arriving,
// so every capture was of a look the game does not apply.
//
// Build with the debug handle left in and serve that, not the dev server:
//   NODE_ENV=development npx vite build --mode development --outDir dist-look
//   npx vite preview --port 4175 --outDir dist-look

const [url, outDir] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
    '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion'],
});
const page = await browser.newPage({ viewport: { width: 1100, height: 620 } });
page.on('pageerror', (e) => console.log('PAGEERROR', String(e).slice(0, 200)));
const cdp = await page.context().newCDPSession(page);
cdp.on('Page.screencastFrame', ({ sessionId }) => cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {}));
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 1, maxWidth: 64, maxHeight: 64, everyNthFrame: 1 });

const t0 = Date.now();
const lap = (m) => console.log(`${((Date.now() - t0) / 1000).toFixed(0)}s  ${m}`);
await page.goto(url, { waitUntil: 'load', timeout: 180000 });
await page.evaluate(() => globalThis.__lsBoot());
await page.waitForFunction(() => globalThis.__ls && !document.getElementById('start')?.disabled,
  null, { timeout: 300000, polling: 200 });
await page.evaluate(() => globalThis.__ls.start());
await page.waitForFunction(() => globalThis.__ls?.debug?.().started === true, null,
  { timeout: 60000, polling: 200 });
lap('started');

const readings = [];
const shot = async (name) => {
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(`${outDir}/${name}.png`, Buffer.from(data, 'base64'));
  readings.push(await page.evaluate(([name]) => {
    const ls = globalThis.__ls;
    const sky = ls.game.sky;
    const grade = ls.grade();
    return {
      name,
      clock: document.getElementById('clockStat')?.textContent,
      day: +sky.state.dayFactor.toFixed(2),
      sun: +sky.sun.intensity.toFixed(2),
      fill: +sky.ambient.intensity.toFixed(2),
      moon: +sky.moon.intensity.toFixed(2),
      // Key over fill. This ratio is the look: raise the fill on its own and
      // every low sun stops raking and the ground goes the colour of the sky.
      keyFill: +(sky.sun.intensity / Math.max(0.01, sky.ambient.intensity)).toFixed(2),
      exposure: +ls.exposure().toFixed(3),
      tone: +grade.tone.toFixed(3),
      contrast: +grade.contrast.toFixed(3),
      saturation: +grade.saturation.toFixed(3),
    };
  }, [name]));
  lap(`shot ${name}`);
};

await page.evaluate(() => { globalThis.__ls.world('outside'); globalThis.__ls.simulate(60); });

for (const [name, t, x, z, yaw, weather] of [
  ['far-road', 0.40, 6, 240, 0.15, 0.10],
  ['far-road-back', 0.40, 6, 300, 3.2, 0.10],
  ['low-sun-road', 0.32, 2, 26, Math.PI, 0.10],
  ['low-sun-gate', 0.315, 0, 12, Math.PI, 0.10],
  ['noon-yard', 0.50, 0, -6, Math.PI, 0.10],
  ['noon-fence', 0.50, -9, -13, 2.35, 0.10],
  ['noon-sunward', 0.50, -6, -2, -1.15, 0.10],
  ['gold-hour', 0.70, 0, 4, Math.PI, 0.10],
  ['dusk', 0.765, 1, 8, 3.0, 0.10],
  ['night', 0.94, 0, -6, Math.PI, 0.10],
  ['overcast-noon', 0.50, 0, -6, Math.PI, 0.85],
]) {
  await page.evaluate(([t, x, z, yaw, weather]) => {
    const ls = globalThis.__ls;
    ls.time(t);
    ls.weather(weather);
    ls.moveTo(x, z);
    ls.look(yaw, -0.04);
    ls.simulate(260);
  }, [t, x, z, yaw, weather]);
  await page.waitForTimeout(4000);
  await shot(name);
}

for (const r of readings) {
  console.log(`  ${r.name.padEnd(15)} ${String(r.clock).padEnd(6)} day=${String(r.day).padEnd(5)}`
    + ` sun=${String(r.sun).padEnd(5)} fill=${String(r.fill).padEnd(5)} key/fill=${String(r.keyFill).padEnd(6)}`
    + ` moon=${String(r.moon).padEnd(5)} exp=${String(r.exposure).padEnd(6)}`
    + ` tone=${String(r.tone).padEnd(6)} con=${String(r.contrast).padEnd(6)} sat=${r.saturation}`);
}
await cdp.send('Page.stopScreencast').catch(() => {});
await browser.close();

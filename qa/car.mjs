// Look at the car, and look at it while its wheels are turning.
//
// Roundness is a number the wheel QA already asserts; this is the other half:
// the shots that show whether the tyre stays in its arch through a revolution
// and whether the body still reads as a Ford Escort after the proportions were
// corrected.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';

const [url, outDir] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 900, height: 620 } });
page.on('pageerror', (error) => console.error('PAGEERROR', String(error).slice(0, 300)));
await page.goto(url, { waitUntil: 'load', timeout: 120000 });
await page.waitForFunction(() => globalThis.__ready === true, null, { timeout: 120000 });
console.log(JSON.stringify(await page.evaluate(() => ({
  size: globalThis.__model.size, min: globalThis.__model.min,
  nodes: globalThis.__model.nodes,
})), null, 1));

const SHOTS = [
  ['three-quarter', 34, 11, 8.4],
  ['side', 90, 3, 8.6],
  ['front', 178, 5, 7.6],
  ['rear', 2, 5, 7.6],
  ['front-wheel', 118, 2, 2.6],
  ['rear-wheel', 52, 2, 2.6],
];
for (const [name, azimuth, elevation, distance] of SHOTS) {
  await page.evaluate(([a, e, d]) => globalThis.__view(a, e, d, 0.7), [azimuth, elevation, distance]);
  await page.waitForTimeout(260);
  writeFileSync(`${outDir}/${name}.png`, Buffer.from(await page.screenshot({ type: 'png' })));
  console.error(`  shot ${name}`);
}

// A wheel that is not round shows it here: the same close crop at four points
// through one revolution. A trued wheel is indistinguishable frame to frame.
for (let step = 0; step < 4; step++) {
  const angle = step * Math.PI / 2 / 2;
  await page.evaluate((radians) => {
    for (const tag of ['LF', 'RF', 'LR', 'RR']) globalThis.__spin(`Car_Wheel_${tag}`, 'x', radians);
  }, angle);
  await page.evaluate(() => globalThis.__view(118, 2, 2.6, 0.7));
  await page.waitForTimeout(220);
  writeFileSync(`${outDir}/spin-${step}.png`, Buffer.from(await page.screenshot({ type: 'png' })));
  console.error(`  shot spin-${step}`);
}
// And the same car with every map stripped. A scan has two kinds of defect —
// torn geometry and a mis-sampled atlas — and they look identical until the
// texture is off, at which point holes read as holes.
await page.evaluate(() => {
  for (const tag of ['LF', 'RF', 'LR', 'RR']) globalThis.__spin(`Car_Wheel_${tag}`, 'x', 0);
  globalThis.__flat(true);
});
for (const [name, azimuth, elevation, distance] of [
  ['flat-side', 90, 3, 8.6], ['flat-quarter', 34, 11, 8.4], ['flat-close', 118, 2, 2.6],
]) {
  await page.evaluate(([a, e, d]) => globalThis.__view(a, e, d, 0.7), [azimuth, elevation, distance]);
  await page.waitForTimeout(240);
  writeFileSync(`${outDir}/${name}.png`, Buffer.from(await page.screenshot({ type: 'png' })));
  console.error(`  shot ${name}`);
}
await browser.close();

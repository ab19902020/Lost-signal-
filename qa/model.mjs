// Look at a model.
//
// The aeroplane is the one asset in the project whose whole job is to be
// looked at from outside, so judging it from the numbers is judging the wrong
// thing. This puts it on a turntable under a three-point light and shoots it
// from the angles that show up a bad shape: the three-quarter, the side, the
// nose, the plan and the belly.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';

const [url, outDir] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 900, height: 620 } });
page.on('pageerror', (e) => console.error('PAGEERROR', String(e).slice(0, 300)));
await page.goto(url, { waitUntil: 'load', timeout: 120000 });
await page.waitForFunction(() => globalThis.__ready === true, null, { timeout: 120000 });
console.log(JSON.stringify(await page.evaluate(() => ({
  size: globalThis.__model.size, min: globalThis.__model.min,
  nodes: globalThis.__model.nodes.length,
})), null, 1));

const SHOTS = [
  ['three-quarter', 38, 14, 15.5],
  ['front-quarter', 145, 10, 14.5],
  ['side', 90, 4, 15.0],
  ['nose', 178, 6, 12.0],
  ['plan', 0, 78, 17.0],
  ['low-rear', -35, 6, 13.5],
  ['gear', 60, -2, 7.0],
  ['cabin', 118, 26, 6.4],
];
for (const [name, az, el, dist] of SHOTS) {
  await page.evaluate(([a, e, d]) => globalThis.__view(a, e, d), [az, el, dist]);
  await page.waitForTimeout(320);
  writeFileSync(`${outDir}/${name}.png`,
    Buffer.from((await page.screenshot({ type: 'png' }))));
  console.error(`  shot ${name}`);
}
// And with the surfaces deflected, which is the other half of whether the
// hinges are in the right place.
await page.evaluate(() => {
  globalThis.__spin('Aileron_L', 'x', 0.42);
  globalThis.__spin('Aileron_R', 'x', -0.42);
  globalThis.__spin('Elevator', 'x', -0.40);
  globalThis.__spin('Rudder', 'y', -0.44);
  globalThis.__spin('Wheel_Nose', 'y', 0.44);
});
await page.evaluate(() => globalThis.__view(52, 22, 14.5));
await page.waitForTimeout(320);
writeFileSync(`${outDir}/deflected.png`, Buffer.from(await page.screenshot({ type: 'png' })));
console.error('  shot deflected');
await browser.close();

// Does the engine sound like it is working, or only like it is revving?
//
// Two oscillators at the firing frequency is a drone. It changes pitch with
// the revs and nothing else, so a car pulling hard up a hill sounds exactly
// like the same car coasting down one - and that is what this one did.
//
// What makes an engine sound like an engine is the harmonics above the firing
// frequency: the orders come up hard under load and fall away the moment you
// lift. Their pitch follows the revs, their level follows the accelerator, and
// nothing about that is audible in a screenshot. So it is read off the live
// audio graph instead: same revs, different throttle, and the question is
// whether anything at all is different.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const url = process.argv[2] || 'http://127.0.0.1:5173/Lost-signal-/';
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
    '--autoplay-policy=no-user-gesture-required'],
});
const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
page.on('pageerror', (error) => console.error('PAGEERROR', String(error).slice(0, 300)));
await page.goto(url, { waitUntil: 'load', timeout: 180000 });
await page.waitForFunction(() => typeof globalThis.__lsBoot === 'function', null, { timeout: 180000 });
await page.evaluate(() => globalThis.__lsBoot());
await page.waitForFunction(() => globalThis.__ls, null, { timeout: 180000 });
await page.evaluate(() => globalThis.__ls.start());
await page.waitForTimeout(1200);

const result = await page.evaluate(async () => {
  const ls = globalThis.__ls;
  ls.world('outside');
  ls.simulate(1 / 60);
  // The hook starts the engine itself, so this does not depend on being able
  // to open a car door in a headless browser.
  ls.engineAt(0, 0, 0.1);
  await new Promise((resolve) => setTimeout(resolve, 60));
  if (!ls.engineVoice()) return { error: 'the engine never started' };

  // Hold the engine at a rev point and settle the audio graph, then read it.
  const at = async (speedRatio, throttle, rpm) => {
    for (let step = 0; step < 40; step++) {
      ls.engineAt(speedRatio, throttle, rpm);
      await new Promise((resolve) => setTimeout(resolve, 12));
    }
    return ls.engineVoice();
  };
  const idle = await at(0, 0, 0.10);
  // Sampled across the idle rather than at two points a whole cycle apart:
  // the hunt is periodic, so two readings can easily land on the same phase.
  const idleFiring = [];
  for (let step = 0; step < 24; step++) {
    ls.engineAt(0, 0, 0.10);
    await new Promise((resolve) => setTimeout(resolve, 14));
    idleFiring.push(ls.engineVoice().firing);
  }
  const cruise = await at(0.45, 0.05, 0.55);   // same revs, shut throttle
  const pulling = await at(0.45, 1.0, 0.55);   // same revs, full throttle
  return { idle, idleSwing: +(Math.max(...idleFiring) - Math.min(...idleFiring)).toFixed(2),
    cruise, pulling };
});
await browser.close();
if (result.error) { console.error(result.error); process.exit(1); }
console.log(JSON.stringify(result, null, 1));

const sum = (voice) => voice.orders.reduce((total, order) => total + order.gain, 0);
assert.ok(result.pulling.orders.length >= 3,
  'the engine has no harmonics above its firing frequency; it is a drone');
for (const order of result.pulling.orders) {
  const expected = result.pulling.firing * order.multiple;
  assert.ok(Math.abs(order.hz - expected) / expected < 0.05,
    `the ${order.multiple}x order is at ${order.hz} Hz, not ${expected.toFixed(0)}`);
}
assert.ok(sum(result.pulling) > sum(result.cruise) * 3,
  `at the same revs, full throttle is only ${(sum(result.pulling) / sum(result.cruise)).toFixed(1)}x `
  + 'the harmonic content of a shut throttle; the engine does not sound loaded');
assert.ok(result.pulling.level > result.cruise.level,
  'on overrun it is no quieter than it is under power');
assert.ok(result.pulling.induction > result.cruise.induction,
  'the induction does not open with the throttle');
// The idle hunts a little rather than holding one note.
assert.ok(result.idleSwing > 0.15,
  `the idle holds within ${result.idleSwing} Hz of one note; a four-cylinder hunts more`);
console.log('Engine voice QA passed: the orders track the revs and are voiced by the '
  + 'accelerator, the throttle opens the induction, overrun goes quiet and the idle hunts.');

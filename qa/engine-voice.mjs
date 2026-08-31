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
  const at = async (speedRatio, throttle, rpm, brakes = null) => {
    for (let step = 0; step < 40; step++) {
      ls.engineAt(speedRatio, throttle, rpm, brakes);
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

  // The pedal. There was no braking sound of any kind: you could stand on it
  // from seventy and the only thing that changed was the engine note.
  const rolling = await at(0.10, 0, 0.20, { pedal: 0, slide: 0 });
  const braking = await at(0.10, 0, 0.20, { pedal: 1, slide: 0 });
  const stopped = await at(0, 0, 0.10, { pedal: 1, slide: 0 });
  const sliding = await at(0.45, 0, 0.50, { pedal: 1, slide: 0.9 });

  // And the two vehicles, which used to be one vehicle twice. Each is started
  // on its own voice and held at the same fraction of its own rev range, so
  // what is compared is the engine rather than how hard it is being driven.
  const voices = {};
  for (let index = 0; index < ls.game.vehicles.length; index++) {
    const name = ls.engineFor(index);
    if (voices[name]) continue;
    voices[name] = {
      idle: await at(0.01, 0, 0.02),
      top: await at(0.9, 1, 1.0),
      // Same revs, different road speed: what follows the wheels and what
      // follows the engine.
      slowAtRevs: await at(0.08, 0.5, 0.5),
      fastAtRevs: await at(0.90, 0.5, 0.5),
    };
  }
  return { idle, idleSwing: +(Math.max(...idleFiring) - Math.min(...idleFiring)).toFixed(2),
    cruise, pulling, rolling, braking, stopped, sliding, voices };
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
// Brakes.
assert.ok(result.rolling.squeal < 0.001,
  `the brakes squeal at ${result.rolling.squeal} with nobody on the pedal`);
assert.ok(result.braking.squeal > 0.004,
  `standing on the brakes at walking pace produced ${result.braking.squeal} of squeal`);
assert.ok(result.stopped.squeal < 0.001,
  `the brakes go on squealing at ${result.stopped.squeal} after the car has stopped`);
assert.ok(result.sliding.scrub > result.rolling.scrub + 0.004,
  `a sliding tyre scrubs at ${result.sliding.scrub} and a rolling one at ${result.rolling.scrub}`);

// Two vehicles, two engines.
const heard = Object.entries(result.voices);
assert.ok(heard.length >= 2, `only ${heard.length} vehicle voice(s) to compare`);
for (const [name, rows] of heard) {
  assert.ok(rows.top.firing > rows.idle.firing * 2,
    `${name} only goes from ${rows.idle.firing} Hz to ${rows.top.firing} Hz across its rev range`);
}
const tops = heard.map(([, rows]) => rows.top.firing);
assert.ok(Math.max(...tops) > Math.min(...tops) * 1.3,
  `every vehicle tops out within a whisker of ${Math.min(...tops).toFixed(0)} Hz; `
  + 'they are all running the same engine');
const diesel = heard.find(([, rows]) => rows.idle.clatter);
assert.ok(diesel, 'no vehicle has an injector clatter; the lorry is a petrol car');
assert.ok(Math.abs(diesel[1].top.clatter.hz - diesel[1].top.firing) < diesel[1].top.firing * 0.05,
  `${diesel[0]}'s clatter runs at ${diesel[1].top.clatter.hz} Hz while it fires at `
  + `${diesel[1].top.firing} Hz; a knock happens on a stroke, not on a timer`);
assert.ok(!diesel[1].top.turbo, `${diesel[0]} has a turbo whistle on a diesel lorry`);

// Combustion, not oscillators.
//
// An engine built out of sawtooth and triangle waves is a synthesiser playing
// a note: the pitch tracks the revs and nothing else ever changes. A real one
// is a train of bangs, one per firing stroke, through a pipe that rings - so
// the pulse train has to run at the firing frequency and not near it.
for (const [name, rows] of heard) {
  for (const [where, row] of Object.entries(rows)) {
    assert.ok(row.pulse, `${name} has no combustion at ${where}; it is an oscillator`);
    assert.ok(Math.abs(row.pulse.hz - row.firing) < Math.max(2, row.firing * 0.05),
      `${name} fires at ${row.firing} Hz at ${where} and bangs at ${row.pulse.hz} Hz`);
  }
  assert.ok(rows.top.pulse.gain > rows.idle.pulse.gain * 3,
    `${name}'s combustion is ${rows.top.pulse.gain} pulling and ${rows.idle.pulse.gain} `
    + 'at idle; it is not working any harder');
}
// Two pipes, an octave apart. A lorry's silencer is the size of a bin.
const pipes = heard.map(([, rows]) => rows.idle.pulse.pipe);
assert.ok(Math.max(...pipes) > Math.min(...pipes) * 1.5,
  `every exhaust resonates within a whisker of ${Math.min(...pipes)} Hz`);

// Transmission whine belongs to the lorry, and follows the road rather than
// the engine - which is why it stays put through a gear change.
const singing = heard.filter(([, rows]) => rows.top.whine > 0.002);
const quiet = heard.filter(([, rows]) => !(rows.top.whine > 0.002));
assert.ok(singing.length >= 1, 'nothing has a transmission whine');
assert.ok(quiet.length >= 1,
  'every vehicle has a straight-cut gearbox singing in it, including the hatchback');
assert.ok(singing.every(([, rows]) => rows.top.clatter),
  'something with no injectors has a lorry gearbox in it');
const [whiner, whineRows] = singing[0];
assert.ok(whineRows.fastAtRevs.whine > whineRows.slowAtRevs.whine * 2,
  `${whiner} whines at ${whineRows.slowAtRevs.whine} crawling and `
  + `${whineRows.fastAtRevs.whine} at speed on the same revs; it is following the engine`);

console.log('Engine voice QA passed: the orders track the revs and are voiced by the '
  + 'accelerator, the throttle opens the induction, overrun goes quiet, the idle hunts, '
  + 'the brakes squeal only while slowing, both engines run on combustion pulses at '
  + 'their own firing frequency, and the lorry is a diesel with a gearbox that sings.');

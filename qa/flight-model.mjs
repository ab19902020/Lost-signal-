// Does the aeroplane go where its nose is pointing?
//
// The complaint was that it flew sideways, and it did: the upload's fuselage
// runs across the model while the flight controller flies down -Z, so the
// aircraft crossed the sky at ninety degrees to itself. The propeller could
// not turn either - there was no propeller, only a blade fused into the same
// mesh as the wings.
//
// A flight model that passes "it climbs, it turns, it lands" can still be
// flying crabwise the whole time, which is what the old test did. So this
// measures the angle between where the nose points and where the aeroplane is
// actually going, which is the number the complaint was about.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const url = process.argv[2] || 'http://127.0.0.1:5173/Lost-signal-/';
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
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
  const V3 = ls.body.position.constructor;
  ls.world('outside');
  ls.simulate(1 / 60);
  const plane = ls.game.aircraft?.[0];
  if (!plane) return { error: 'no aircraft in the world' };
  const rig = plane.root.userData.rig || null;
  const prop = plane.root.getObjectByName('Plane_Prop');
  const disc = plane.root.getObjectByName('Disc_Blur');
  const body = plane.root.getObjectByName('Plane_Body');

  // Parked: nobody aboard, so nothing should be turning.
  const parkedFrom = prop ? prop.rotation.z : null;
  for (let frame = 0; frame < 60; frame++) ls.simulate(1 / 60);
  const parkedSpin = prop ? Math.abs(prop.rotation.z - parkedFrom) : null;

  ls.fly(0);
  ls.simulate(1 / 60);

  // Where the propeller sits, in the aeroplane's own frame, and how big a
  // disc it sweeps. A propeller on the tail is not a propeller.
  const propLocal = prop ? prop.position.clone() : null;
  const length = (() => {
    const box = ls.bounds(body || plane.root);
    return { x: +(box.max.x - box.min.x).toFixed(2), z: +(box.max.z - box.min.z).toFixed(2) };
  })();

  // Take off and settle into a straight climb, then measure sideslip: the
  // angle between the nose and the velocity, in the horizontal plane.
  // Full power down the runway, rotate, then hold a gentle climb. Positive
  // pitch on this stick is nose-up.
  ls.stick(0, 0, 0, 1, false);
  for (let frame = 0; frame < 60 * 6; frame++) ls.simulate(1 / 60);
  ls.stick(0.55, 0, 0, 1, false);
  for (let frame = 0; frame < 60 * 5; frame++) ls.simulate(1 / 60);
  ls.stick(0.22, 0, 0, 1, false);
  for (let frame = 0; frame < 60 * 6; frame++) ls.simulate(1 / 60);

  const sample = () => {
    const nose = new V3(0, 0, -1).applyQuaternion(plane.state.quaternion);
    const track = plane.state.velocity.clone();
    const flat = (vector) => { const out = vector.clone(); out.y = 0; return out.normalize(); };
    const noseFlat = flat(nose);
    const trackFlat = flat(track);
    const cross = noseFlat.x * trackFlat.z - noseFlat.z * trackFlat.x;
    const dot = noseFlat.dot(trackFlat);
    return {
      slipDegrees: +(Math.abs(Math.atan2(cross, dot)) * 180 / Math.PI).toFixed(2),
      bank: +(Math.atan2(
        new V3(1, 0, 0).applyQuaternion(plane.state.quaternion).y,
        new V3(0, 1, 0).applyQuaternion(plane.state.quaternion).y) * 180 / Math.PI).toFixed(1),
      kts: +(plane.state.airspeed * 1.94384).toFixed(1),
      altitude: +plane.state.altitude.toFixed(1),
    };
  };
  const straight = [];
  for (let step = 0; step < 6; step++) {
    for (let frame = 0; frame < 30; frame++) ls.simulate(1 / 60);
    straight.push(sample());
  }
  // One frame, because the blades are deliberately kept slow enough not to
  // alias and the angle wraps at a full turn: sampled over half a second the
  // difference is meaningless.
  const spinning = prop ? prop.rotation.z : null;
  ls.simulate(1 / 60);
  const flyingSpin = prop ? Math.abs(prop.rotation.z - spinning) : null;
  const discOn = disc ? disc.visible && disc.material.opacity : null;

  // A turn: roll and hold. It should come round in the direction of roll, and
  // it should still be pointing where it is going while it does it.
  // A turn the way a pilot flies one: roll in, then hold the bank with a
  // little back pressure rather than winding the stick over and leaving it.
  ls.stick(0.10, 0.85, 0, 1, false);
  for (let frame = 0; frame < 60 * 1.4; frame++) ls.simulate(1 / 60);
  const before = new V3(0, 0, -1).applyQuaternion(plane.state.quaternion);
  ls.stick(0.14, 0.10, 0, 1, false);
  for (let frame = 0; frame < 60 * 5; frame++) ls.simulate(1 / 60);
  const after = new V3(0, 0, -1).applyQuaternion(plane.state.quaternion);
  const turned = Math.atan2(before.x * after.z - before.z * after.x,
    before.x * after.x + before.z * after.z) * 180 / Math.PI;
  const turning = sample();

  return {
    rig, length,
    prop: propLocal ? { x: +propLocal.x.toFixed(2), y: +propLocal.y.toFixed(2),
      z: +propLocal.z.toFixed(2) } : null,
    parkedSpin: parkedSpin === null ? null : +parkedSpin.toFixed(4),
    flyingSpin: flyingSpin === null ? null : +flyingSpin.toFixed(3),
    discOn: discOn === null ? null : +Number(discOn).toFixed(3),
    straight, turning, turned: +turned.toFixed(1),
  };
});
await browser.close();
if (result.error) { console.error(result.error); process.exit(1); }
console.log(JSON.stringify(result, null, 1));

assert.ok(result.rig, 'the supplied aeroplane was never rigged');
assert.equal(result.rig.fuselage, 'X',
  `the fuselage was read as running along ${result.rig.fuselage}`);
assert.ok(result.length.z > result.length.x * 0.7 && result.length.z > 7,
  `the aeroplane is ${result.length.z} m long and ${result.length.x} m across; `
  + 'it is still lying across its own direction of flight');

assert.ok(result.prop, 'the propeller was never separated from the airframe');
assert.ok(result.prop.z < -2.5,
  `the propeller is at z ${result.prop.z}; it is not on the nose`);
assert.ok(Math.abs(result.prop.x) < 0.5,
  `the propeller is ${result.prop.x} m off the centreline`);
assert.ok(result.parkedSpin < 1e-6,
  'a parked aeroplane with nobody in it is turning its propeller');
assert.ok(result.flyingSpin > 0.08,
  `the propeller turned ${result.flyingSpin} rad in a frame under power`);
assert.ok(result.discOn > 0.05, 'the propeller disc never appears under power');

// The number the complaint was about.
const worst = Math.max(...result.straight.map((row) => row.slipDegrees));
assert.ok(worst < 6,
  `flying straight and level it is crabbing ${worst}° off its own nose`);
assert.ok(result.straight.every((row) => row.kts > 40),
  'it will not hold flying speed in a straight climb');
assert.ok(Math.abs(result.turned) > 40,
  `five seconds of held roll turned it ${result.turned}° at ${result.turning.bank}° `
  + 'of bank; a banked aeroplane comes round faster than that');
assert.ok(result.turning.slipDegrees < 8,
  `in a turn it is crabbing ${result.turning.slipDegrees}° off its nose`);
console.log('Flight model QA passed: the aeroplane points where it is going, '
  + 'on the ground and in a turn, and its propeller turns on the nose.');

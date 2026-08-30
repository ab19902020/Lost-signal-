// Which way round is it?
//
// The Bedford shipped facing backwards. Its rig turned the model a quarter
// turn to put the long axis down Z, which is right, and never asked which end
// of that axis was the front, which put the cab at the back. Everything then
// agreed with everything else: the truck drove smoothly, steered smoothly and
// went the wrong way, cab last, steering on the rear axle. No test caught it
// because every test asked whether the vehicle moved, and it moved.
//
// So this asks the only question that matters and asks it three ways, off
// landmarks the controller does not get a vote on:
//
//   - the cab is at the front, so the steering wheel is forward of centre;
//   - the steered wheels are at the front, so they are forward of centre too;
//   - driving forward takes the vehicle towards the cab, not away from it.
//
// It also checks that the driver is in the driving seat, which is the other
// half of the same mistake: the truck is left-hand drive and its spec had him
// sitting on the right, a metre from a steering wheel he could not reach, with
// both car thieves queueing at a door that was not there.
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

const result = await page.evaluate(() => {
  const ls = globalThis.__ls;
  ls.world('outside');
  ls.simulate(1 / 60);
  const rows = [];
  for (let index = 0; index < ls.game.vehicles.length; index++) {
    const vehicle = ls.game.vehicles[index];
    const rig = ls.vehicleRig(index);
    const state = vehicle.state;
    // Drive it out of its own heading and see which way the body went. Its
    // parking heading is arbitrary, so the travel is resolved back into the
    // body's own frame: -Z is towards the cab.
    const from = { x: state.x, z: state.z, heading: state.heading };
    state.occupied = true;
    for (let step = 0; step < 90; step++) vehicle.update(1 / 60, { throttle: 1, steer: 0 });
    const dx = state.x - from.x;
    const dz = state.z - from.z;
    // Forward for a heading h is (-sin h, -cos h).
    const forward = dx * -Math.sin(from.heading) + dz * -Math.cos(from.heading);
    const sideways = dx * Math.cos(from.heading) + dz * -Math.sin(from.heading);

    // Now check that only the front pair answers the steering, read off the
    // kingpin groups themselves.
    for (let step = 0; step < 30; step++) vehicle.update(1 / 60, { throttle: 0, steer: 1 });
    const steered = ls.vehicleRig(index).steer || {};
    for (let step = 0; step < 30; step++) vehicle.update(1 / 60, { throttle: 0, steer: 0 });
    state.speed = 0;
    state.x = from.x; state.z = from.z; state.heading = from.heading;
    state.occupied = false;
    rows.push({ ...rig, travel: { forward: +forward.toFixed(2), sideways: +sideways.toFixed(2) }, steered });
  }
  return rows;
});
await browser.close();
console.log(JSON.stringify(result, null, 1));

for (const row of result) {
  const tags = Object.keys(row.wheels);
  assert.ok(tags.length >= 4, `${row.name} has ${tags.length} rigged wheels; a vehicle needs four`);
  assert.ok(tags.includes('LF') && tags.includes('RF'),
    `${row.name} has no front axle: ${tags.join(', ') || 'nothing'}`);

  // The cab is the front. A steering wheel behind the middle of the body means
  // the model was turned round, whatever the rest of it says.
  if (row.steeringWheel) {
    assert.ok(row.steeringWheel[2] < 0,
      `${row.name}'s steering wheel is at z ${row.steeringWheel[2]}, behind the middle of it: `
      + 'the cab is at the back, so the model is facing the wrong way');
  }
  const front = (row.wheels.LF[2] + row.wheels.RF[2]) / 2;
  const rest = tags.filter((tag) => tag !== 'LF' && tag !== 'RF');
  const back = rest.reduce((sum, tag) => sum + row.wheels[tag][2], 0) / rest.length;
  assert.ok(front < back,
    `${row.name}'s steered wheels are at z ${front.toFixed(2)} and the rest at ${back.toFixed(2)}: `
    + 'the steering is on the back axle');
  if (row.steeringWheel) {
    assert.ok(row.steeringWheel[2] < back,
      `${row.name}'s driver sits behind the rear axle`);
  }

  // And it actually goes that way.
  assert.ok(row.travel.forward > 1,
    `${row.name} travelled ${row.travel.forward} m towards its own nose under full throttle`);
  assert.ok(Math.abs(row.travel.sideways) < row.travel.forward * 0.1,
    `${row.name} crabbed ${row.travel.sideways} m sideways over ${row.travel.forward} m`);

  // Only the front wheels turn, and they turn the same way as each other.
  for (const tag of ['LF', 'RF']) {
    assert.ok(row.steered[tag] !== null && row.steered[tag] !== undefined,
      `${row.name}'s ${tag} wheel has no kingpin: it cannot steer`);
    assert.ok(Math.abs(row.steered[tag]) > 0.05,
      `${row.name}'s ${tag} wheel sat at ${row.steered[tag]} rad on full lock`);
  }
  assert.equal(Math.sign(row.steered.LF), Math.sign(row.steered.RF),
    `${row.name}'s front wheels steer against each other`);
  // Ackermann: the inside wheel takes more lock than the outside one.
  assert.ok(Math.abs(row.steered.LF) !== Math.abs(row.steered.RF),
    `${row.name}'s front wheels take equal lock; they are a pair of casters`);
  for (const tag of rest) {
    assert.ok(row.steered[tag] === null || row.steered[tag] === undefined,
      `${row.name}'s ${tag} wheel is on a kingpin; only the front pair steers`);
  }

  // The driver is in the driving seat, on the side the wheel is.
  const [ex, ey, ez] = row.eye;
  assert.ok(Math.abs(ex) < row.body[0] / 2 && ey < row.body[1] && ez < 0,
    `${row.name}'s driver's eye ${row.eye} is not inside the cab (body ${row.body})`);
  if (row.steeringWheel) {
    assert.ok(Math.sign(ex) === Math.sign(row.steeringWheel[0]) || Math.abs(row.steeringWheel[0]) < 0.1,
      `${row.name} seats its driver at x ${ex} and puts the steering wheel at `
      + `x ${row.steeringWheel[0]}: he is in the passenger seat`);
    assert.ok(ez > row.steeringWheel[2],
      `${row.name}'s driver sits in front of the steering wheel`);
  }
  assert.ok(Math.sign(row.door[0]) === Math.sign(ex),
    `${row.name}'s driver's door is on the opposite side to its driver`);

  // The tyres roll at the speed of the road under them, which they only do if
  // the controller's radius is the radius of the thing on the screen.
  const measured = tags.reduce((sum, tag) => sum + row.wheels[tag][3], 0) / tags.length;
  assert.ok(Math.abs(measured - row.wheelRadius) < row.wheelRadius * 0.08,
    `${row.name} rolls on ${row.wheelRadius} m wheels and shows ${measured.toFixed(3)} m ones`);
  // Steering geometry is built on the wheelbase, so it has to be the wheelbase.
  // On a bogie that is the front axle to the middle of the pair behind it.
  const bogie = rest.reduce((sum, tag) => sum + row.wheels[tag][2], 0) / rest.length;
  assert.ok(Math.abs((bogie - front) - row.wheelbase) < 0.25,
    `${row.name} steers on a ${row.wheelbase} m wheelbase and measures `
    + `${(bogie - front).toFixed(2)} m`);
}
console.log(`Vehicle facing QA passed: ${result.length} vehicles, all of them nose-first, `
  + 'steering at the front, driver at the wheel.');

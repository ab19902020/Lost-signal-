import { chromium } from 'playwright';

// The estate car at the gate, driven. Everything here is checked through the
// same debug handle the game exposes to the other harnesses: get in, hold the
// pedals, read the state back off the car.

async function pumpFrames(page) {
  const client = await page.context().newCDPSession(page);
  client.on('Page.screencastFrame', ({ sessionId }) => {
    client.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });
  await client.send('Page.startScreencast', { format: 'jpeg', quality: 1, maxWidth: 64, maxHeight: 64, everyNthFrame: 1 });
  return () => client.send('Page.stopScreencast').catch(() => {});
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion'],
});
const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
const errors = [];
page.on('pageerror', e => errors.push(String(e).slice(0, 200)));
page.on('crash', () => errors.push('PAGE CRASHED'));
const stopPump = await pumpFrames(page);
await page.goto(process.argv[2], { waitUntil: 'load', timeout: 90000 });
await page.evaluate(() => globalThis.__lsBoot());
await page.waitForFunction(() => globalThis.__ls && !document.getElementById('start')?.disabled,
  null, { timeout: 90000, polling: 100 });
await page.evaluate(() => globalThis.__ls.start());
await page.waitForTimeout(800);
await page.waitForFunction(() => globalThis.__ls?.debug?.().started === true, null,
  { timeout: 30000, polling: 100 });

const results = {};
const failures = [];
const step = () => {};
const check = (name, condition, detail) => {
  if (!condition) failures.push(`${name}: ${detail}`);
};

// The car exists as a vehicle, not a prop.
step('parked');
results.parked = await page.evaluate(() => {
  const ls = globalThis.__ls;
  ls.world('outside');
  ls.simulate(20);
  return ls.vehicles();
});
check('vehicle present', results.parked.length > 0, 'no vehicles in the world');
check('starts parked', results.parked[0]?.occupied === false, 'the car is already occupied');

// Getting in.
step('entered');
results.entered = await page.evaluate(() => {
  const ls = globalThis.__ls;
  const ok = ls.drive(0);
  ls.simulate(4);
  return { ok, driving: ls.driving(), body: ls.body.position.toArray().map(v => +v.toFixed(2)) };
});
check('gets in', results.entered.ok === true, 'drive(0) refused');
check('driving state', !!results.entered.driving, 'no car reported after getting in');

// Two seconds of full throttle in a straight line. The car must move, forwards,
// along its own nose, and the wheels must turn while it does.
step('throttle');
results.throttle = await page.evaluate(() => {
  const ls = globalThis.__ls;
  const car = ls.game.vehicles[0];
  // Out in the middle of the yard, pointed at the east fence: a clear run with
  // nothing in it for twenty metres.
  car.state.x = -2;
  car.state.z = 0;
  car.state.heading = -Math.PI / 2;
  car.state.speed = 0;
  ls.simulate(2);
  const before = ls.driving();
  ls.pedals(1, 0);
  ls.simulate(120);
  ls.pedals(0, 0);
  const after = ls.driving();
  const dx = after.x - before.x;
  const dz = after.z - before.z;
  return {
    travelled: +Math.hypot(dx, dz).toFixed(2),
    speed: after.speed,
    spin: +(after.spin - before.spin).toFixed(2),
    // Positive means it went where its nose was pointing.
    forwardness: +((dx * -Math.sin(before.heading) + dz * -Math.cos(before.heading))
      / Math.max(0.001, Math.hypot(dx, dz))).toFixed(3),
    headingDrift: +Math.abs(after.heading - before.heading).toFixed(4),
  };
});
check('accelerates', results.throttle.travelled > 8,
  `only ${results.throttle.travelled} m in two seconds`);
check('drives forwards', results.throttle.forwardness > 0.98,
  `travel is ${results.throttle.forwardness} along the nose`);
check('wheels turn', Math.abs(results.throttle.spin) > 5,
  `wheel spin moved ${results.throttle.spin} rad`);
check('tracks straight', results.throttle.headingDrift < 0.02,
  `heading wandered ${results.throttle.headingDrift} rad with no steering`);

// Steering. Full lock for two seconds must bend the heading and the car must
// end up somewhere other than straight ahead.
step('steering');
results.steering = await page.evaluate(() => {
  const ls = globalThis.__ls;
  const before = ls.driving();
  ls.pedals(1, 1);
  ls.simulate(120);
  ls.pedals(0, 0);
  const after = ls.driving();
  return {
    turned: +(after.heading - before.heading).toFixed(3),
    steer: after.steer,
  };
});
check('steers', Math.abs(results.steering.turned) > 0.3,
  `heading moved ${results.steering.turned} rad on full lock`);

// Braking, then reverse.
step('braking');
results.braking = await page.evaluate(() => {
  const ls = globalThis.__ls;
  ls.pedals(0, 0, true);
  ls.simulate(180);
  const stopped = ls.driving().speed;
  ls.pedals(-1, 0);
  ls.simulate(90);
  const reversing = ls.driving().speed;
  ls.pedals(0, 0);
  ls.simulate(120);
  return { stopped, reversing, coasted: ls.driving().speed };
});
check('handbrake stops it', Math.abs(results.braking.stopped) < 0.05,
  `still doing ${results.braking.stopped} m/s on the handbrake`);
check('reverses', results.braking.reversing < -1,
  `reverse reached ${results.braking.reversing} m/s`);
check('coasts to a stop', Math.abs(results.braking.coasted) < 0.8,
  `still doing ${results.braking.coasted} m/s after two seconds off the pedals`);

// The fence is solid to a car. Aim it at the perimeter and hold the throttle
// down for long enough to be well past it, then check it is still inside.
step('fence');
results.fence = await page.evaluate(() => {
  const ls = globalThis.__ls;
  const car = ls.game.vehicles[0];
  // The same clear lane the throttle test used, run all the way to the east
  // fence at x = 20 and held there.
  car.state.x = -2;
  car.state.z = 0;
  car.state.heading = -Math.PI / 2;
  car.state.speed = 0;
  ls.pedals(1, 0);
  ls.simulate(600);
  ls.pedals(0, 0);
  return { x: +car.state.x.toFixed(2), z: +car.state.z.toFixed(2) };
});
check('the fence stops a car', results.fence.x > 12 && results.fence.x < 20,
  `ended at x=${results.fence.x}; the east fence is at 20`);

// A shut gate is a wall; an open one is the way to the road.
step('gate');
results.gate = await page.evaluate(async () => {
  const ls = globalThis.__ls;
  const car = ls.game.vehicles[0];
  const runAtGate = () => {
    car.state.x = 0;
    car.state.z = 10;
    car.state.heading = Math.PI;   // nose at the gate
    car.state.speed = 0;
    ls.pedals(1, 0);
    ls.simulate(300);
    ls.pedals(0, 0);
    return +car.state.z.toFixed(2);
  };
  ls.gate(false);
  ls.simulate(60);
  const shut = runAtGate();
  const open = ls.gate(true);
  ls.simulate(300);        // the leaves take a few seconds to run back
  const through = runAtGate();
  return { shut, open, through, leaf: +ls.game.gateIsOpen() };
});
check('a shut gate stops a car', results.gate.shut < 16,
  `drove to z=${results.gate.shut} through a shut gate`);
check('an open gate lets it out', results.gate.through > 24,
  `only reached z=${results.gate.through} with the gate open`);

// Getting out puts the player on the ground, next to the car, not inside it.
step('exit');
results.exit = await page.evaluate(() => {
  const ls = globalThis.__ls;
  const car = ls.game.vehicles[0];
  ls.park();
  ls.simulate(10);
  const p = ls.body.position;
  return {
    driving: ls.driving(),
    occupied: car.state.occupied,
    distance: +Math.hypot(p.x - car.state.x, p.z - car.state.z).toFixed(2),
    grounded: ls.body.grounded,
  };
});
check('gets out', results.exit.driving === null, 'still driving after park()');
check('car is free', results.exit.occupied === false, 'the car thinks it is still occupied');
check('stands beside the car', results.exit.distance > 1 && results.exit.distance < 4,
  `player is ${results.exit.distance} m from the car`);

// A parked car is something you have to walk around.
step('solid');
results.solid = await page.evaluate(() => {
  const ls = globalThis.__ls;
  const car = ls.game.vehicles[0];
  ls.simulate(4);
  const inside = ls.game.colliders.outside.contains(car.state.x, car.state.z, 0.36, 0.3, 1.7);
  const clear = ls.game.colliders.outside.contains(
    car.state.x + 4.5, car.state.z, 0.36, 0.3, 1.7);
  return { inside, clear };
});
check('parked car is solid', results.solid.inside === true,
  'the player can walk straight through the parked car');
check('collider is car-sized', results.solid.clear === false,
  'the car collider reaches 4.5 m to the side');

console.log(JSON.stringify(results, null, 1));
if (failures.length) {
  console.error('FAILURES:\n  ' + failures.join('\n  '));
}
if (errors.length) console.error('ERRORS:', [...new Set(errors)].join(' | '));
await stopPump();
await browser.close();
process.exit(failures.length || errors.length ? 1 : 0);

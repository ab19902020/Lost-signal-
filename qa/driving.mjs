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
const page = await browser.newPage({ viewport: { width: 640, height: 400 } });
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
// Progress, on stderr: this harness runs a few thousand simulation steps under
// software rendering, and a silent run is indistinguishable from a hung one.
let stepAt = Date.now();
const step = (name) => {
  const now = Date.now();
  console.error(`  ${name} (+${((now - stepAt) / 1000).toFixed(1)}s)`);
  stepAt = now;
};
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

// Steering. Full lock for two seconds must bend the heading, and it must bend
// it the way the driver asked: right lock puts the car to the right of where
// its nose was pointing. Getting this backwards is invisible to a test that
// only measures how much it turned.
step('steering');
results.steering = await page.evaluate(() => {
  const ls = globalThis.__ls;
  const lock = (steer) => {
    const car = ls.game.vehicles[0];
    car.state.x = -2;
    car.state.z = 0;
    car.state.heading = -Math.PI / 2;
    car.state.speed = 0;
    car.state.steer = 0;
    ls.simulate(2);
    const before = ls.driving();
    ls.pedals(1, steer);
    ls.simulate(120);
    ls.pedals(0, 0);
    const after = ls.driving();
    const dx = after.x - before.x;
    const dz = after.z - before.z;
    return {
      turned: +(after.heading - before.heading).toFixed(3),
      // Positive is to the driver's right of the heading they set off on.
      lateral: +(dx * Math.cos(before.heading) - dz * Math.sin(before.heading)).toFixed(2),
      wheel: +ls.game.vehicles[0].state.steer.toFixed(3),
    };
  };
  return { right: lock(1), left: lock(-1) };
});
check('steers', Math.abs(results.steering.right.turned) > 0.3,
  `heading moved ${results.steering.right.turned} rad on full lock`);
check('right lock goes right', results.steering.right.lateral > 1.5,
  `right lock put the car ${results.steering.right.lateral} m to its right`);
check('left lock goes left', results.steering.left.lateral < -1.5,
  `left lock put the car ${results.steering.left.lateral} m to its right`);
check('front wheels follow the turn',
  results.steering.right.wheel < 0 && results.steering.left.wheel > 0,
  `wheels at ${results.steering.right.wheel} / ${results.steering.left.wheel} rad`);

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

// The gate. A locked one is a wall; an automatic one reads the approach,
// runs back before you get there, and shuts again once the drive is clear.
step('gate');
results.gate = await page.evaluate(async () => {
  const ls = globalThis.__ls;
  const car = ls.game.vehicles[0];
  const park = (z, frames = 420) => {
    car.state.x = 0;
    car.state.z = z;
    car.state.heading = Math.PI;
    car.state.speed = 0;
    ls.simulate(frames);
    return ls.gate().travel;
  };
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

  // Locked: the leaves stay across the road however close you get.
  ls.gate('lock');
  const lockedNear = park(9, 300);
  const shut = runAtGate();

  // Automatic, and nothing near it: shut.
  ls.gate('auto');
  const away = park(-14, 420);

  // Automatic, and something sitting on the approach: open, unprompted.
  const sensed = park(9, 300);
  const through = runAtGate();

  // Clear of it: the gate closes behind.
  const behind = park(64, 420);
  return {
    shut, through,
    lockedNear: +lockedNear.toFixed(3),
    away: +away.toFixed(3),
    sensed: +sensed.toFixed(3),
    behind: +behind.toFixed(3),
    mode: ls.gate().mode,
  };
});
check('a locked gate stays shut', results.gate.lockedNear < 0.02,
  `locked leaves ran to ${results.gate.lockedNear} with a car on the loop`);
check('a locked gate stops a car', results.gate.shut < 16,
  `drove to z=${results.gate.shut} through a locked gate`);
check('an empty drive leaves it shut', results.gate.away < 0.02,
  `gate sat at ${results.gate.away} with nothing near it`);
check('it opens on approach', results.gate.sensed > 0.98,
  `gate only reached ${results.gate.sensed} with a car on the loop`);
check('an open gate lets it out', results.gate.through > 24,
  `only reached z=${results.gate.through} with the gate open`);
check('it closes behind you', results.gate.behind < 0.02,
  `gate sat at ${results.gate.behind} once the drive was clear`);

// The same loop reads someone on foot.
step('gate on foot');
results.gateWalk = await page.evaluate(async () => {
  const ls = globalThis.__ls;
  const car = ls.game.vehicles[0];
  ls.park();
  ls.simulate(4);
  car.state.x = 26;
  car.state.z = -20;            // the car well out of the way
  ls.gate('auto');
  ls.moveTo(0, -16);
  ls.simulate(420);
  const away = ls.gate().travel;
  ls.moveTo(0, 8);
  ls.simulate(300);
  const near = ls.gate().travel;
  ls.moveTo(0, -22);
  ls.simulate(480);
  const after = +ls.gate().travel.toFixed(3);
  // Put the car and the driver back where the rest of the run expects them.
  car.state.x = -2;
  car.state.z = 0;
  car.state.heading = 0;
  car.state.speed = 0;
  ls.drive(0);
  ls.simulate(6);
  return { away: +away.toFixed(3), near: +near.toFixed(3), after };
});
check('a walker opens it', results.gateWalk.near > 0.98,
  `gate reached ${results.gateWalk.near} with someone standing on the loop`);
check('it shuts behind a walker', results.gateWalk.after < 0.02,
  `gate sat at ${results.gateWalk.after} after they walked away`);

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

// The controller. Chromium has no gamepad emulation and CDP does not expose
// one, but navigator.getGamepads is the only thing the game reads — so a plain
// object carrying the standard mapping is, as far as Shelter 47 is concerned,
// a DualSense.
step('gamepad');
results.gamepad = await page.evaluate(() => {
  const ls = globalThis.__ls;
  const buttons = Array.from({ length: 18 }, () => ({ pressed: false, touched: false, value: 0 }));
  const fake = {
    id: 'DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)',
    index: 0, connected: true, mapping: 'standard', timestamp: 0,
    axes: [0, 0, 0, 0], buttons,
    vibrationActuator: { playEffect: () => Promise.resolve('complete') },   // haptics, accepted and ignored
  };
  const original = navigator.getGamepads?.bind(navigator);
  navigator.getGamepads = () => [fake];
  const stick = (lx = 0, ly = 0, rx = 0, ry = 0) => { fake.axes = [lx, ly, rx, ry]; };
  const hold = (index, value = 1) => { buttons[index].pressed = value > .5; buttons[index].value = value; };
  const clear = () => { stick(); for (const b of buttons) { b.pressed = false; b.value = 0; } };

  try {
    ls.park();
    ls.world('outside');
    ls.simulate(20);
    const seen = ls.pad();

    // Walking, then looking — measured apart, because a stick that walks and a
    // stick that turns at the same time walk the player round in a circle and
    // leave them back where they started.
    ls.moveTo(-6, -6);
    ls.look(0, 0);
    ls.simulate(10);
    const from = ls.body.position.clone();
    stick(0, -1, 0, 0);
    ls.simulate(90);
    const walked = +ls.body.position.distanceTo(from).toFixed(2);
    clear();
    ls.simulate(10);

    const yawFrom = ls.aim2().yaw;
    stick(0, 0, 0.9, 0);
    ls.simulate(60);
    const turned = +(ls.aim2().yaw - yawFrom).toFixed(3);
    clear();
    ls.simulate(10);

    // Driving. R2 is the throttle and the left stick is the lock.
    const car = ls.game.vehicles[0];
    car.state.x = -2; car.state.z = 0; car.state.heading = -Math.PI / 2;
    car.state.speed = 0; car.state.steer = 0;
    ls.drive(0);
    ls.simulate(6);
    hold(7, 1);                     // R2 down
    ls.simulate(90);
    const throttled = +car.state.speed.toFixed(2);
    stick(1, 0, 0, 0);              // full right lock
    const headingFrom = car.state.heading;
    ls.simulate(90);
    const steered = +(car.state.heading - headingFrom).toFixed(3);
    clear();
    hold(1, 1);                     // Circle: get out
    ls.simulate(4);
    hold(1, 0);
    ls.simulate(4);
    const out = ls.driving();
    clear();
    ls.simulate(4);
    return {
      connected: seen.connected, dualsense: seen.dualsense,
      walked, turned, throttled, steered, out,
    };
  } finally {
    if (original) navigator.getGamepads = original;
  }
});
check('a pad is picked up', results.gamepad.connected === true, 'the game never saw the controller');
check('it knows a DualSense', results.gamepad.dualsense === true,
  'a DualSense id was not recognised');
check('the left stick walks', results.gamepad.walked > 2,
  `the stick moved the player ${results.gamepad.walked} m in a second and a half`);
check('the right stick looks', Math.abs(results.gamepad.turned) > 0.5,
  `the stick turned the head ${results.gamepad.turned} rad`);
check('R2 is the throttle', results.gamepad.throttled > 5,
  `full trigger reached ${results.gamepad.throttled} m/s`);
check('the stick steers right', results.gamepad.steered < -0.3,
  `right lock moved the heading ${results.gamepad.steered} rad`);
check('circle gets out', results.gamepad.out === null, 'still driving after Circle');

console.log(JSON.stringify(results, null, 1));
if (failures.length) {
  console.error('FAILURES:\n  ' + failures.join('\n  '));
}
if (errors.length) console.error('ERRORS:', [...new Set(errors)].join(' | '));
await stopPump();
await browser.close();
process.exit(failures.length || errors.length ? 1 : 0);

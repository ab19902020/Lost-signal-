import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';

// Can it fly?
//
// A flight model is the one thing in this project that cannot be judged from a
// screenshot: an aeroplane that looks right sitting on the runway may refuse to
// leave it, climb without thrust, or keep flying at zero airspeed. So this puts
// it through the things that have to be true — it rolls when the throttle is
// open, it leaves the ground somewhere sensible, it climbs, it comes back down
// when the power is off, it stalls when it is flown too slowly, and it is on
// the ground and stopped at the end of it.
//
// Needs a build with the debug handle left in:
//   NODE_ENV=development npx vite build --mode development --outDir dist-look
//   npx vite preview --port 4175 --outDir dist-look

const [url, outDir] = process.argv.slice(2);
if (outDir) mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
    '--disable-background-timer-throttling', '--disable-renderer-backgrounding'],
});
const page = await browser.newPage({ viewport: { width: 960, height: 560 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e).slice(0, 220)));
const cdp = await page.context().newCDPSession(page);
cdp.on('Page.screencastFrame', ({ sessionId }) => cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {}));
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 1, maxWidth: 64, maxHeight: 64, everyNthFrame: 1 });

await page.goto(url, { waitUntil: 'load', timeout: 180000 });
// __lsBoot is published while main.js evaluates, which can finish after the
// load event. Waiting for it beats racing it.
await page.waitForFunction(() => typeof globalThis.__lsBoot === 'function', null,
  { timeout: 90000, polling: 50 });
await page.evaluate(() => globalThis.__lsBoot());
await page.waitForFunction(() => globalThis.__ls && !document.getElementById('start')?.disabled,
  null, { timeout: 300000, polling: 200 });
await page.evaluate(() => globalThis.__ls.start());
await page.waitForFunction(() => globalThis.__ls?.debug?.().started === true, null,
  { timeout: 60000, polling: 200 });

const results = await page.evaluate(() => {
  const ls = globalThis.__ls;
  ls.world('outside');
  ls.simulate(20);
  const out = {};
  const plane = ls.game.aircraft?.[0];
  if (!plane) return { missing: true };

  // Can you get there?
  //
  // The airfield was visible from the compound and unreachable: the strip was
  // collided as one object, which is a box the size of the airfield standing
  // between the player and the aeroplane. Walking the whole way takes minutes,
  // so this steps a probe along the route and asks the collision set whether a
  // person could stand at each point. One blocked point in open field is a
  // wall.
  const c = ls.game.colliders.outside;
  const target = plane.state.position;
  const from = { x: 46, z: -40 };
  const blocked = [];
  const STEPS = 120;
  for (let i = 1; i <= STEPS; i++) {
    const t = i / STEPS;
    const x = from.x + (target.x - from.x) * t;
    const z = from.z + (target.z - from.z) * t;
    // Only the fuselage is meant to be solid. This exclusion used to be nine
    // metres, which quietly stepped over the entire region the collider was
    // wrong in: the route came up clean while the aeroplane was still walled
    // off by its own hull and could not be boarded from anywhere.
    if (Math.hypot(x - target.x, z - target.z) < 1.6) continue;
    if (c.contains(x, z, 0.36, 0.3, 1.7)) blocked.push([+x.toFixed(1), +z.toFixed(1)]);
  }
  out.route = { blocked: blocked.length, first: blocked[0] || null,
    to: [+target.x.toFixed(1), +target.z.toFixed(1)] };

  // Can you actually get in?
  //
  // Reaching the aeroplane is not the same as boarding it. The prompt only
  // appears within about three metres of something you are looking at, so a
  // collider that holds the player further out than that makes the aeroplane
  // scenery. Walk the ring around it and ask, from each standing position,
  // whether the game offers to let you fly.
  const boarding = [];
  const heading = plane.heading();
  for (let i = 0; i < 24; i++) {
    const angle = i * Math.PI / 12;
    for (const reach of [2.0, 2.6, 3.4, 4.6]) {
      const x = target.x + Math.sin(angle) * reach;
      const z = target.z + Math.cos(angle) * reach;
      if (c.contains(x, z, 0.36, 0.3, 1.7)) continue;      // cannot stand here
      ls.moveTo(x, z);
      // Face it: the game's own convention, negated on both axes.
      ls.look(Math.atan2(-(target.x - x), -(target.z - z)), -0.10);
      ls.simulate(2);
      if (/FLY/.test(ls.prompt() || '')) {
        boarding.push({ angle: +(angle * 180 / Math.PI).toFixed(0), reach });
        break;
      }
    }
  }
  out.boarding = { positions: boarding.length, sample: boarding.slice(0, 4),
    heading: +heading.toFixed(2) };

  // If none of them worked, say why rather than just that it did not.
  if (!boarding.length) {
    const x = target.x - 2.6, z = target.z;
    ls.moveTo(x, z);
    ls.look(Math.atan2(-(target.x - x), -(target.z - z)), -0.10);
    ls.simulate(2);
    const cam = ls.game.camera.getWorldPosition(new ls.THREE.Vector3());
    const root = plane.root.getWorldPosition(new ls.THREE.Vector3());
    const ray = new ls.THREE.Raycaster();
    ray.far = 3.15;
    ray.setFromCamera({ x: 0, y: 0 }, ls.game.camera);
    out.why = {
      standing: [+x.toFixed(2), +z.toFixed(2)],
      camera: [+cam.x.toFixed(2), +cam.y.toFixed(2), +cam.z.toFixed(2)],
      root: [+root.x.toFixed(2), +root.y.toFixed(2), +root.z.toFixed(2)],
      rootDistance: +cam.distanceTo(root).toFixed(2),
      withinFilter: cam.distanceToSquared(root) <= 18,
      hits: ray.intersectObject(plane.root, true).length,
      nearestHit: +(ray.intersectObject(plane.root, true)[0]?.distance ?? -1).toFixed(2),
      registered: ls.game.interactions.includes(plane.root),
      world: plane.root.userData.interaction?.world ?? null,
      prompt: ls.prompt(),
    };
  }

  // And the propeller must be still on a parked, empty aeroplane.
  ls.simulate(60);
  const propNode = plane.root.getObjectByName('Plane_Prop');
  const discNode = plane.root.getObjectByName('Disc_Blur');
  out.parkedProp = {
    spin: +(propNode?.rotation.z ?? -1).toFixed(4),
    disc: discNode?.visible ?? null,
  };

  // And the strip itself must not be solid: standing on the runway is the
  // normal case, not an obstacle.
  out.onStrip = c.contains(target.x + 40, target.z, 0.36, 0.3, 1.7);

  out.townsfolk = (ls.game.townsfolk || []).map((person) => ({
    name: person.name,
    alive: person.userData.alive !== false,
    at: [+person.position.x.toFixed(0), +person.position.z.toFixed(0)],
  }));

  out.parked = {
    grounded: plane.state.grounded,
    speed: +plane.state.airspeed.toFixed(2),
    y: +plane.state.position.y.toFixed(2),
  };

  ls.fly(0);
  ls.simulate(4);
  out.boarded = ls.flying();

  // Under power, the blades must turn — but not so fast that they alias. A
  // two-blade propeller repeats every 180 degrees, so anything approaching
  // half a turn per frame crawls, stops and runs backwards on screen, which
  // is exactly what it did at 190 rad/s.
  ls.stick(0, 0, 0, 1);
  ls.simulate(120);
  const propWas = propNode.rotation.z;
  ls.simulate(1);
  let step = propNode.rotation.z - propWas;
  if (step < -Math.PI) step += Math.PI * 2;          // it wraps every turn
  out.runningProp = {
    stepDegrees: +(step * 180 / Math.PI).toFixed(1),
    disc: discNode?.visible ?? null,
    discOpacity: +(discNode?.material?.opacity ?? -1).toFixed(3),
  };
  ls.stick(0, 0, 0, 0);
  ls.simulate(200);

  // Full throttle down the strip. Hold the stick neutral: it must roll
  // straight and stay on the ground until it has the speed to leave it.
  ls.stick(0, 0, 0, 1);
  const roll = [];
  for (let i = 0; i < 12; i++) {
    ls.simulate(30);
    roll.push({ t: +((i + 1) * 0.5).toFixed(1), kts: +(plane.state.airspeed * 1.94384).toFixed(1),
      grounded: plane.state.grounded });
  }
  out.groundRoll = roll;
  out.rolledStraight = +Math.abs(plane.state.position.z - (-180)).toFixed(1);

  // Ease back and it should fly.
  ls.stick(0.55, 0, 0, 1);
  out.rotating = [];
  for (let i = 0; i < 8; i++) { ls.simulate(30); out.rotating.push(ls.flying()); }
  out.rotate = {
    airborne: !plane.state.grounded,
    kts: +(plane.state.airspeed * 1.94384).toFixed(1),
    altitudeFt: +(plane.state.altitude * 3.28084).toFixed(0),
  };

  // Climb away for a while. Half back stick, which is a climb attitude rather
  // than the neutral one that only accelerates.
  ls.stick(0.45, 0, 0, 1);
  ls.simulate(600);
  out.climb = {
    airborne: !plane.state.grounded,
    kts: +(plane.state.airspeed * 1.94384).toFixed(1),
    altitudeFt: +(plane.state.altitude * 3.28084).toFixed(0),
  };

  // A turn: roll right and it must change heading without falling out of it.
  const before = plane.heading();
  ls.stick(0.30, 0.7, 0, 1);
  ls.simulate(300);
  let turned = plane.heading() - before;
  turned = Math.atan2(Math.sin(turned), Math.cos(turned));
  out.turn = { radians: +turned.toFixed(2), altitudeFt: +(plane.state.altitude * 3.28084).toFixed(0),
    airborne: !plane.state.grounded };

  // Hold the nose up with no power and it has to stall rather than hang there.
  ls.stick(1, 0, 0, 0);
  ls.simulate(420);
  out.stall = { stalled: plane.state.stalled,
    kts: +(plane.state.airspeed * 1.94384).toFixed(1),
    sink: +plane.state.velocity.y.toFixed(2) };

  // And it must come back down and stop, not fly on for ever. Brakes on, the
  // way anyone lands it.
  ls.stick(0, 0, 0, 0, true);
  ls.simulate(3000);
  out.landed = { grounded: plane.state.grounded,
    kts: +(plane.state.airspeed * 1.94384).toFixed(1) };
  return out;
});

const failures = [];
if (results.missing) failures.push('there is no aircraft in the world');
else {
  const r = results;
  if (r.route.blocked > 0) {
    failures.push(`something blocks the way to the aircraft at ${r.route.blocked} of 120 points`
      + ` along the route, first at ${r.route.first}`);
  }
  if (r.onStrip) failures.push('the runway itself is solid — you cannot stand on it');
  if (r.boarding.positions === 0) {
    failures.push('you cannot get in it: no standing position anywhere around the'
      + ' aircraft offers the prompt to board');
  } else if (r.boarding.positions < 8) {
    failures.push(`only ${r.boarding.positions} of 24 approaches let you board it`);
  }
  if (r.parkedProp.spin !== 0) {
    failures.push(`the propeller turns on a parked, empty aircraft (${r.parkedProp.spin} rad)`);
  }
  if (r.parkedProp.disc) failures.push('the propeller blur disc shows with the engine off');
  if (r.runningProp.stepDegrees <= 0.5) {
    failures.push(`the propeller barely moves under power (${r.runningProp.stepDegrees} deg/frame)`);
  }
  if (r.runningProp.stepDegrees > 60) {
    failures.push(`the propeller turns ${r.runningProp.stepDegrees} deg a frame, which strobes`);
  }
  if (!r.runningProp.disc) failures.push('no propeller disc at full power');
  if (r.runningProp.discOpacity >= 0.95) failures.push('the propeller disc is opaque');
  if (r.townsfolk.length < 2) failures.push(`only ${r.townsfolk.length} townsfolk in the world`);
  if (!r.parked.grounded) failures.push('it does not start on the ground');
  if (r.parked.speed > 0.1) failures.push(`it is moving while parked (${r.parked.speed} m/s)`);
  if (!r.boarded) failures.push('could not get into it');
  const left = r.groundRoll.find((step) => !step.grounded);
  if (r.groundRoll[r.groundRoll.length - 1].kts < 45) {
    failures.push(`it will not accelerate — ${r.groundRoll[r.groundRoll.length - 1].kts} kts after six seconds`);
  }
  if (left && left.kts < 35) failures.push(`it left the ground at ${left.kts} kts, which is nothing`);
  if (r.rolledStraight > 8) failures.push(`it wandered ${r.rolledStraight} m off the centreline`);
  if (!r.rotate.airborne) failures.push('it will not rotate — still on the ground with the stick back');
  if (!r.climb.airborne) failures.push('it came back down while climbing under power');
  if (r.climb.altitudeFt < 200) failures.push(`it only reached ${r.climb.altitudeFt} ft under full power`);
  if (Math.abs(r.turn.radians) < 0.4) failures.push(`a full roll input turned it ${r.turn.radians} rad`);
  if (!r.stall.stalled && r.stall.kts > 55) failures.push('holding the nose up with no power neither stalled nor slowed it');
  if (r.stall.sink > 0.5) failures.push('it climbs with the engine off');
  if (!r.landed.grounded) failures.push('it never came back down');
  if (r.landed.kts > 12) failures.push(`it did not stop rolling (${r.landed.kts} kts)`);
}
for (const error of new Set(errors)) failures.push(`uncaught: ${error}`);

console.log(JSON.stringify(results, null, 1));

if (outDir) {
  // Put it back where it belongs first. The run above lands it wherever the
  // last stall left it, which after fifty seconds of flying is a long way from
  // the airfield. Everything below reads the aeroplane's own position rather
  // than a hard-coded one, so moving the airstrip cannot quietly point the
  // camera at an empty field again.
  const reset = () => {
    const ls = globalThis.__ls;
    const plane = ls.game.aircraft[0];
    plane.state.position.set(110, 1.36, -180);
    plane.state.velocity.set(0, 0, 0);
    plane.state.quaternion.setFromAxisAngle(new ls.THREE.Vector3(0, 1, 0), -Math.PI / 2);
    plane.state.throttle = 0;
    ls.stick(0, 0, 0, 0);
    ls.simulate(20);
    return plane;
  };
  const frame = (offsetX, offsetZ, pitch = -0.06) => {
    const ls = globalThis.__ls;
    const plane = ls.game.aircraft[0];
    const p = plane.state.position;
    const x = p.x + offsetX, z = p.z + offsetZ;
    // Put them on the ground, not at whatever height they were left at when
    // they climbed out of an aeroplane at seven hundred feet.
    const ground = ls.game.colliders.outside.floorAt(x, z, 2.2, 60) ?? 0;
    ls.moveTo(x, z, ground + 0.1);
    ls.look(Math.atan2(-(p.x - x), -(p.z - z)), pitch);
    ls.simulate(30);
  };

  for (const [name, setup] of [
    ['on-the-numbers', () => {
      const ls = globalThis.__ls;
      ls.park();
      // Both take numbers: the time is a fraction of the day and the weather
      // is how much cloud. Passing hours and the word 'clear' clamps to NaN
      // and every sky value downstream goes with it — the world renders black
      // while the HUD carries on as though nothing is wrong.
      ls.time(0.5);
      ls.weather(0);
      globalThis.__reset();
      globalThis.__frame(7.5, 6.5, -0.03);
    }],
    ['at-the-door', () => {
      globalThis.__reset();
      globalThis.__frame(-2.4, 0.4, -0.02);
    }],
    ['under-power', () => {
      const ls = globalThis.__ls;
      const plane = globalThis.__reset();
      plane.state.throttle = 1;
      plane.state.occupied = true;    // the engine only runs with a pilot in it
      ls.simulate(90);
      plane.state.occupied = false;
      globalThis.__frame(6.0, -7.0, -0.02);
      plane.state.occupied = true;
      plane.state.throttle = 1;
      ls.simulate(2);
    }],
    ['airborne', () => {
      const ls = globalThis.__ls;
      ls.fly(0);
      const plane = ls.game.aircraft[0];
      plane.state.position.set(110, 1.36, -180);
      plane.state.velocity.set(0, 0, 0);
      plane.state.quaternion.setFromAxisAngle(new ls.THREE.Vector3(0, 1, 0), -Math.PI / 2);
      ls.stick(0, 0, 0, 1); ls.simulate(300);
      ls.stick(0.45, 0.10, 0, 1); ls.simulate(360);
    }],
  ]) {
    await page.evaluate(`globalThis.__reset = ${reset.toString()};
      globalThis.__frame = ${frame.toString()};`);
    await page.evaluate(setup);
    await page.waitForTimeout(2600);
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(`${outDir}/${name}.png`, Buffer.from(data, 'base64'));
    console.error(`  shot ${name}`);
  }
}

await cdp.send('Page.stopScreencast').catch(() => {});
await browser.close();
if (failures.length) {
  console.error('Flight QA failed:\n  ' + failures.join('\n  '));
  process.exit(1);
}
console.log('Flight QA passed: it rolls, rotates, climbs, turns, stalls and lands.');

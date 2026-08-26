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

  out.parked = {
    grounded: plane.state.grounded,
    speed: +plane.state.airspeed.toFixed(2),
    y: +plane.state.position.y.toFixed(2),
  };

  ls.fly(0);
  ls.simulate(4);
  out.boarded = ls.flying();

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
  out.rolledStraight = +Math.abs(plane.state.position.z - (-58)).toFixed(1);

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

  // And it must come back down and stop, not fly on for ever.
  ls.stick(0, 0, 0, 0);
  ls.simulate(3000);
  out.landed = { grounded: plane.state.grounded,
    kts: +(plane.state.airspeed * 1.94384).toFixed(1) };
  return out;
});

const failures = [];
if (results.missing) failures.push('there is no aircraft in the world');
else {
  const r = results;
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
  // Put it back on the numbers first. The run above lands it wherever the
  // last stall left it, which after fifty seconds of flying is a long way from
  // the airfield and off the end of the terrain.
  const reset = () => {
    const ls = globalThis.__ls;
    const plane = ls.game.aircraft[0];
    plane.state.position.set(-14, 1.36, -58);
    plane.state.velocity.set(0, 0, 0);
    plane.state.quaternion.setFromAxisAngle(new ls.THREE.Vector3(0, 1, 0), -Math.PI / 2);
    ls.stick(0, 0, 0, 0);
    ls.simulate(30);
  };
  for (const [name, setup] of [
    ['on-the-numbers', () => {
      const ls = globalThis.__ls;
      ls.stick(0, 0, 0, 0);
      ls.simulate(400);
      ls.park();
      const plane = ls.game.aircraft[0];
      plane.state.position.set(-14, 1.36, -58);
      plane.state.velocity.set(0, 0, 0);
      plane.state.quaternion.setFromAxisAngle(new ls.THREE.Vector3(0, 1, 0), -Math.PI / 2);
      ls.simulate(10);
      ls.moveTo(-30, -50);
      ls.look(-1.15, -0.06);
      ls.simulate(20);
    }],
    ['airborne', () => {
      const ls = globalThis.__ls;
      ls.fly(0);
      const plane = ls.game.aircraft[0];
      plane.state.position.set(-14, 1.36, -58);
      plane.state.velocity.set(0, 0, 0);
      plane.state.quaternion.setFromAxisAngle(new ls.THREE.Vector3(0, 1, 0), -Math.PI / 2);
      ls.stick(0, 0, 0, 1); ls.simulate(300);
      ls.stick(0.45, 0.10, 0, 1); ls.simulate(300);
    }],
  ]) {
    await page.evaluate(setup);
    await page.waitForTimeout(2500);
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

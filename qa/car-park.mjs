// Can the car actually be driven out of where it is parked?
//
// It could not. The Escort sits between two lines of road barrier, and the gap
// between them is 3.2 m: the car's own collision probe is 0.82 m of radius
// down a 4 m spine, so it needs 3.28 m to pass. Forty millimetres short, in a
// place nothing else in the game ever tests, and the result is a car that
// looks parked and behaves like a car in a crate.
//
// "Invisible walls" is what that feels like from inside it, and no amount of
// looking at the yard shows it to you. So this floods the compound with the
// car's own collision test and asks whether the gate is reachable from the
// driver's seat.
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
  const out = {};
  for (const vehicle of ls.game.vehicles) {
    const state = vehicle.state;
    const start = { x: state.x, z: state.z, y: state.y };
    // Take its own hull off the set, the way sitting in it does, or the car is
    // the first thing its own escape route runs into.
    state.occupied = true;
    vehicle.update(1 / 60, { throttle: 0, steer: 0 });
    const colliders = ls.game.colliders.outside;
    // The car's own test: a 0.82 m probe at ride height. Half a metre of grid
    // is finer than the gaps that matter.
    // Each vehicle's own probe, not the Escort's. A four-tonne truck is half a
    // metre wider on each side and a gap the car walks through is a gap the
    // truck wedges in.
    const STEP = 0.5;
    const radius = vehicle.spec?.probeRadius ?? 0.82;
    const free = (x, z) => !colliders.contains(x, z, radius, start.y + 0.30, start.y + 1.45);
    const key = (x, z) => `${Math.round(x / STEP)},${Math.round(z / STEP)}`;
    const seen = new Set();
    const queue = [[start.x, start.z]];
    seen.add(key(start.x, start.z));
    let reachedGate = false;
    let cells = 0;
    // The gate is at z = 17 on the centreline; getting to its throat is
    // getting out.
    while (queue.length && cells < 60000) {
      const [x, z] = queue.shift();
      cells++;
      if (Math.abs(x) < 2.5 && z > 15) { reachedGate = true; break; }
      for (const [dx, dz] of [[STEP, 0], [-STEP, 0], [0, STEP], [0, -STEP]]) {
        const nx = x + dx;
        const nz = z + dz;
        if (nx < -30 || nx > 30 || nz < -30 || nz > 30) continue;
        const at = key(nx, nz);
        if (seen.has(at) || !free(nx, nz)) continue;
        seen.add(at);
        queue.push([nx, nz]);
      }
    }
    // Both doors, and the standing room in front of each. A car with a door
    // inside a road barrier is a car one of the two men can never board, and
    // the theft then waits for a man who is never coming - which is what "one
    // gets there first and the other takes all day" looks like from outside.
    const person = (point) => point
      && !colliders.contains(point.x, point.z, 0.40, start.y + 0.18, start.y + 1.62);
    const doors = {
      driver: person(vehicle.boardingPoint('driver')),
      passenger: person(vehicle.boardingPoint('passenger')),
      doorstep: person(vehicle.doorstep()),
    };
    out[vehicle.root.name] = {
      at: [+start.x.toFixed(1), +start.z.toFixed(1)],
      probe: radius,
      parkedOnAWall: !free(start.x, start.z),
      doors,
      reachable: seen.size,
      reachedGate,
    };
    state.occupied = false;
  }
  return out;
});
await browser.close();
console.log(JSON.stringify(result, null, 1));

for (const [name, row] of Object.entries(result)) {
  assert.ok(!row.parkedOnAWall, `${name} is parked inside something solid`);
  for (const [side, clear] of Object.entries(row.doors)) {
    assert.ok(clear, `${name}'s ${side} is inside something solid; nobody can board it there`);
  }
  assert.ok(row.reachedGate,
    `${name} cannot reach the gate from where it is parked (${row.reachable} cells reachable)`);
}
console.log('Car park QA passed: every vehicle can be driven off its parking spot '
  + 'and out through the gate.');

// A car and a person, in both directions.
//
// Everything that moves in this world walks around the collision set, and the
// collision set is boxes that were placed once and never move. People are not
// in it. So the car drove through the two men in the yard as though they were
// fog, and when they took it, it drove through the player the same way - which
// made the one moment the whole theft builds to, them coming back down the
// road at you, completely harmless.
//
// This drives the real car at a real man at a real speed and asks what
// happened to him, then does it the other way round.
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
  const car = ls.game.vehicles[0];
  const agents = ls.game.townEnemies.agents;
  const events = [];
  for (const kind of ['lostsignal:runover', 'lostsignal:playerrunover']) {
    addEventListener(kind, (event) => events.push({ kind, ...event.detail }));
  }
  // Drive the car by hand rather than through the world loop. A parked car
  // handed idle controls brakes itself to a stop in a tenth of a second, which
  // is correct of it and useless here - a car has to be driven at someone.
  // "Occupied" keeps the world's own loop from stepping it a second time.
  car.state.occupied = true;
  const drive = (frames, throttle = 1) => {
    for (let frame = 0; frame < frames; frame++) car.update(1 / 60, { throttle, steer: 0 });
  };
  // A body hit by a car is thrown, and being thrown takes time. The world's
  // own loop is what carries it through the air, so the flight has to be
  // stepped before anything asks where he landed - the car is occupied, so
  // this does not drive it a second time.
  const settle = (frames = 90, watch = null) => {
    let peak = watch ? watch.root.position.y : 0;
    for (let frame = 0; frame < frames; frame++) {
      ls.simulate(1 / 60);
      if (watch) peak = Math.max(peak, watch.root.position.y);
    }
    return +peak.toFixed(2);
  };
  // Heading 0 puts the nose down -Z, so a target in front is at a lower z.
  const lay = (speed, across) => {
    car.state.x = -24.5; car.state.z = 60; car.state.heading = 0;
    car.state.speed = speed; car.state.y = 0;
    return { x: -24.5 + across, z: 60 - 7 };
  };

  // 1. A man standing three metres to one side is not run over.
  const beside = lay(11, 3.0);
  agents[0].root.position.set(beside.x, 0, beside.z);
  agents[0].downed = 0; agents[0].dead = false;
  drive(70);
  const missed = { downed: +(agents[0].downed || 0).toFixed(2), dead: agents[0].dead };

  // 2. Straight at him at walking-shunt speed: knocked down, not killed.
  const slow = lay(4.2, 0);
  agents[0].root.position.set(slow.x, 0, slow.z);
  agents[0].downed = 0; agents[0].dead = false;
  const before = agents[0].root.position.clone();
  drive(90, 0.12);
  const peak = settle(120, agents[0]);
  const clipped = {
    downed: +(agents[0].downed || 0).toFixed(2), dead: agents[0].dead,
    thrown: +agents[0].root.position.distanceTo(before).toFixed(2),
    peak, landed: +agents[0].root.position.y.toFixed(2),
  };

  // 3. Straight at the other one at thirty miles an hour: he stays down.
  // The first man is still lying where the last test left him, which is the
  // same piece of road this one uses - and a body on the tarmac is a collider,
  // so it stopped the second one's flight dead and made a hard hit look like a
  // soft one. Move him out of the way first.
  agents[0].root.position.set(-24.5, 0, 96);
  agents[0].collider.cx = agents[0].root.position.x;
  agents[0].collider.cz = agents[0].root.position.z;
  const fast = lay(14, 0);
  agents[1].root.position.set(fast.x, 0, fast.z);
  agents[1].dead = false; agents[1].downed = 0;
  const hard = agents[1].root.position.clone();
  drive(70);
  const fastPeak = settle(120, agents[1]);
  const flattened = {
    dead: agents[1].dead,
    thrown: +agents[1].root.position.distanceTo(hard).toFixed(2),
    peak: fastPeak,
  };

  // 4. The other way round: the car is being driven, and not by him. This is
  // the getaway and the gloating passes - the whole point of which is that the
  // car is out there with two men in it and you are on foot in front of it.
  const wasHealth = ls.state().health;
  const at = lay(14, 0);
  ls.moveTo(at.x, at.z, 0);
  ls.simulate(1 / 60);
  car.state.z = 60; car.state.speed = 14;
  const stood = ls.body.position.clone();
  drive(70);
  for (let frame = 0; frame < 20; frame++) ls.simulate(1 / 60);
  const player = {
    health: ls.state().health, wasHealth,
    thrown: +ls.body.position.distanceTo(stood).toFixed(2),
  };
  // 5. And then can it move?
  //
  // This is what the whole thing is for. Running a man down used to leave the
  // vehicle stuck on the spot: his body stayed in the collision set as a solid
  // box in front of the bumper, and a car cannot drive through a wall. Every
  // vehicle gets hit-then-drive-on, because the bug was found in the truck and
  // fixed in the car.
  const afterwards = [];
  for (let index = 0; index < ls.game.vehicles.length; index++) {
    const vehicle = ls.game.vehicles[index];
    const victim = agents[index % agents.length];
    victim.dead = false;
    victim.downed = 0;
    victim.flung = null;
    victim.collider.enabled = true;
    victim.root.userData.alive = true;
    // Each vehicle gets its own lane. Run three of them down the same one and
    // the second is blocked by the first, which is correct of it and nothing
    // to do with the body.
    const lane = -24.5 + index * 14;
    vehicle.state.occupied = true;
    vehicle.state.x = lane;
    vehicle.state.z = 140;
    vehicle.state.heading = 0;
    vehicle.state.speed = 12;
    vehicle.state.y = 0;
    victim.root.position.set(lane, 0, 140 - 9);
    victim.collider.cx = lane;
    victim.collider.cz = 140 - 9;
    const from = vehicle.state.z;
    for (let frame = 0; frame < 60; frame++) {
      vehicle.update(1 / 60, { throttle: 1, steer: 0 });
    }
    const struckAt = vehicle.state.z;
    // Let the body land and settle wherever it is going to.
    for (let frame = 0; frame < 150; frame++) ls.simulate(1 / 60);
    // Then ask the vehicle to carry on, from a standing start, over the spot.
    vehicle.state.speed = 0;
    const restarted = vehicle.state.z;
    for (let frame = 0; frame < 120; frame++) {
      vehicle.update(1 / 60, { throttle: 1, steer: 0 });
    }
    afterwards.push({
      name: vehicle.root.name,
      hit: +(from - struckAt).toFixed(2),
      drove: +(restarted - vehicle.state.z).toFixed(2),
      speed: +vehicle.state.speed.toFixed(2),
    });
    vehicle.state.occupied = false;
    vehicle.state.speed = 0;
  }

  return { missed, clipped, flattened, player, afterwards, events };
});
await browser.close();
console.log(JSON.stringify(result, null, 1));

assert.equal(result.missed.dead, false,
  'a man standing three metres to one side was run over by a car that missed him');
assert.equal(result.missed.downed, 0,
  'a man standing three metres to one side was knocked down by a car that missed him');

assert.equal(result.clipped.dead, false,
  'four metres a second killed him; that is a walking-pace shunt');
assert.ok(result.clipped.downed > 0,
  'the car drove through him at four metres a second and he stayed on his feet');
assert.ok(result.clipped.thrown > 0.5,
  `he was moved ${result.clipped.thrown} m by being hit; he should go over the bonnet`);
// Thrown, not teleported. He used to jump two and a half metres down the road
// in a single frame, which reads as a glitch rather than as an impact.
assert.ok(result.clipped.peak > 0.25,
  `he never left the ground: the highest he got was ${result.clipped.peak} m`);
assert.ok(result.clipped.landed < 0.25,
  `he finished the flight ${result.clipped.landed} m in the air`);

assert.equal(result.flattened.dead, true,
  'fourteen metres a second - over thirty miles an hour - left him standing');
// Hit harder, thrown further. A car at thirty does not put somebody down where
// it found them.
assert.ok(result.flattened.thrown > result.clipped.thrown,
  `thirty miles an hour threw him ${result.flattened.thrown} m and a walking shunt `
  + `threw him ${result.clipped.thrown} m`);
assert.ok(result.flattened.peak > result.clipped.peak,
  `thirty miles an hour lifted him ${result.flattened.peak} m and a walking shunt `
  + `lifted him ${result.clipped.peak} m`);

assert.ok(result.player.health < result.player.wasHealth - 40,
  `the stolen car hit the player at speed and cost him ${
    (result.player.wasHealth - result.player.health).toFixed(0)} health`);
assert.ok(result.player.thrown > 0.6,
  `the player was moved ${result.player.thrown} m by a car at thirteen metres a second`);
assert.ok(result.events.some((event) => event.kind === 'lostsignal:runover'),
  'nothing announced that a man had been run over');

// Every vehicle can drive away from what it just hit.
for (const row of result.afterwards) {
  assert.ok(row.hit > 4,
    `${row.name} only covered ${row.hit} m on its run at him; it never got there`);
  assert.ok(row.drove > 6,
    `${row.name} moved ${row.drove} m from a standing start after running a man over; `
    + 'it is stuck on the body');
  assert.ok(row.speed > 4,
    `${row.name} was doing ${row.speed} m/s after running a man over and holding the `
    + 'throttle for two seconds');
}
assert.ok(result.events.some((event) => event.kind === 'lostsignal:playerrunover'),
  'nothing announced that the player had been run over');
console.log('Run-over QA passed: the car misses who it misses, knocks down who it clips, '
  + 'kills who it hits at speed, does the same to the player when they are driving, '
  + 'and drives away from every body it leaves.');

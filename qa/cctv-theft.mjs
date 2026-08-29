// The theft, watched from the camera desk.
//
// Two complaints, one cause. "They stole my car but I only saw it once" and
// "I could not see it on the CCTV" are the same bug: the world only ran the
// surface when the player's body was standing on it. Sitting in the shelter
// watching the yard on a monitor froze the yard - the men stopped, the car
// stopped, and the one event the cameras exist to show you happened to an
// empty compound while you stared at it.
//
// So this drives the real game the way a player watches it: body in the
// bunker, main gate camera up, nothing else. It asserts the men are simulated
// AND drawn for the camera, that the car is actually driven away, and that
// they come back down the road afterwards to gloat within sight of the lens.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const url = process.argv[2] || 'http://127.0.0.1:5173/Lost-signal-/';
const budget = Number(process.env.CCTV_SECONDS || 420);

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

const result = await page.evaluate(async (seconds) => {
  const ls = globalThis.__ls;
  const enemies = ls.game.townEnemies;
  if (!enemies) return { error: 'no town enemies in the world' };

  // Sit down at the desk: body in the shelter, main gate camera up. Nothing
  // here touches the world directly - it is the same two calls the player's
  // own keypresses make.
  ls.world('bunker');
  ls.openCam(0);
  const taunts = [];
  addEventListener('lostsignal:cartaunt', (event) => taunts.push({
    pass: event.detail.pass, line: event.detail.line,
    gate: +Math.hypot(event.detail.vehicle.state.x,
      event.detail.vehicle.state.z - 18).toFixed(1),
  }));

  const camera = ls.game.cctvCameras[0];
  const lens = camera.getWorldPosition(ls.game.camera.position.clone());
  const start = enemies.agents.map((a) => a.root.position.clone());
  let drawnWhileWatching = 0;
  let movedWhileWatching = 0;
  let nearestPass = Infinity;
  const passes = {};
  let events = { stolen: false, escaped: false };
  const previous = enemies.agents.map((a) => a.root.position.clone());
  const frames = 60 * seconds;
  for (let frame = 0; frame < frames; frame++) {
    ls.simulate(1 / 60);
    for (let i = 0; i < enemies.agents.length; i++) {
      const agent = enemies.agents[i];
      if (agent.model.visible) drawnWhileWatching++;
      movedWhileWatching += agent.root.position.distanceTo(previous[i]);
      previous[i].copy(agent.root.position);
    }
    const theft = ls.game.carTheft();
    events.stolen ||= theft.stolen;
    events.escaped ||= theft.escaped;
    if (theft.pass) {
      // Per pass: how close they came, and whether they left again afterwards.
      // A car that comes down the road and parks at the gate is not gloating,
      // it is stuck, and the two look identical in a single distance reading.
      const row = passes[theft.pass] || (passes[theft.pass] = { near: Infinity, out: 0 });
      if (theft.taunting) row.near = Math.min(row.near, theft.gate);
      // Only count the run back out once they have actually been close, or the
      // four hundred metres they started the pass at reads as leaving again.
      if (row.near < 60) row.out = Math.max(row.out, theft.gate);
      nearestPass = Math.min(nearestPass, row.near);
    }
    // Give the browser a breath every simulated second so the page stays
    // responsive and the run does not trip the evaluate timeout.
    if (frame % 60 === 59) await new Promise((r) => setTimeout(r, 0));
    if (taunts.length >= 2 && (passes[2]?.out || 0) > 150) break;
  }
  const theft = ls.game.carTheft();
  return {
    lens: [+lens.x.toFixed(1), +lens.z.toFixed(1)],
    drawnWhileWatching, movedWhileWatching: +movedWhileWatching.toFixed(1),
    walked: enemies.agents.map((a, i) => +a.root.position.distanceTo(start[i]).toFixed(1)),
    events, theft, taunts, nearestPass: +nearestPass.toFixed(1),
    passes: Object.fromEntries(Object.entries(passes).map(([pass, row]) => [pass, {
      near: +row.near.toFixed(1), out: +row.out.toFixed(1) }])),
    cctv: ls.debug().cctv,
  };
}, budget);

await browser.close();
if (result.error) { console.error(result.error); process.exit(1); }
console.log(JSON.stringify(result, null, 2));

assert.ok(result.cctv, 'the camera desk was not actually up');
assert.ok(result.movedWhileWatching > 40,
  `the attackers barely moved while being watched (${result.movedWhileWatching} m)`);
assert.ok(result.drawnWhileWatching > 600,
  `the attackers were hardly ever drawn for the camera (${result.drawnWhileWatching} agent-frames)`);
assert.ok(result.events.stolen, 'the car was never stolen while watched from the desk');
assert.ok(result.events.escaped, 'the stolen car never got away while watched from the desk');
assert.ok(result.taunts.length >= 2,
  `they came back to gloat ${result.taunts.length} time(s); it has to keep happening`);
assert.ok(result.nearestPass < 45,
  `the gloating pass never came near the compound (closest ${result.nearestPass} m)`);
assert.ok(result.nearestPass > 4,
  `the gloating pass drove into the compound instead of past it (${result.nearestPass} m)`);
for (const [pass, row] of Object.entries(result.passes)) {
  assert.ok(row.out > 120,
    `pass ${pass} came to ${row.near} m and never left again (got back to ${row.out} m)`);
}
console.log('CCTV theft QA passed: the yard runs and is drawn for the camera, '
  + 'the car is taken and driven off, and they come back past the gate to gloat.');

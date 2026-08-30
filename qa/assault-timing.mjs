// Do the two of them turn up together, and this side of teatime?
//
// Three things made the theft feel like waiting for a bus. They spawned in
// cover beside the buildings at the far end of the road, three hundred metres
// behind the first waypoint of their own assault route, and spent forty-five
// seconds running to the start line. The route itself then began at 430 m. And
// their plans ran from a 0.78 pace to a 1.14, which over that distance is the
// difference between arriving and arriving half a minute later - so one man
// reached the gate alone and started on it while the other was still coming.
//
// The variety in how they come is worth keeping; the wait is not. They start
// on the road at the head of their own route now, the route is a third of the
// length, the paces are closer together, and - the part that actually fixes
// it - the first man to the fence holds there for his mate rather than going
// in on his own. This measures all of that from the running game.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const url = process.argv[2] || 'http://127.0.0.1:5173/Lost-signal-/';
const runs = Number(process.argv[3] || 3);
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
page.on('pageerror', (error) => console.error('PAGEERROR', String(error).slice(0, 300)));

const results = [];
for (let run = 0; run < runs; run++) {
  await page.goto(url, { waitUntil: 'load', timeout: 180000 });
  await page.waitForFunction(() => typeof globalThis.__lsBoot === 'function', null, { timeout: 180000 });
  await page.evaluate(() => globalThis.__lsBoot());
  await page.waitForFunction(() => globalThis.__ls, null, { timeout: 180000 });
  await page.evaluate(() => globalThis.__ls.start());
  await page.waitForTimeout(900);
  results.push(await page.evaluate(async () => {
    const ls = globalThis.__ls;
    ls.world('outside');
    ls.simulate(1 / 60);
    const agents = ls.game.townEnemies.agents;
    const at = {};
    const mark = {};
    const player = ls.body.position.clone();
    const startedOut = agents.map((agent) =>
      +Math.hypot(agent.root.position.x, agent.root.position.z - 18).toFixed(0));
    for (let frame = 0; frame < 60 * 170; frame++) {
      ls.game.update(1 / 60, 'outside', player);
      for (const agent of agents) {
        const name = agent.root.name;
        at[name] = at[name] || {};
        if (at[name][agent.state] === undefined) at[name][agent.state] = +(frame / 60).toFixed(1);
      }
      const theft = ls.game.carTheft();
      if (theft.stolen && mark.stolen === undefined) mark.stolen = +(frame / 60).toFixed(1);
      if (theft.escaped) { mark.escaped = +(frame / 60).toFixed(1); break; }
      if (frame % 600 === 599) await new Promise((resolve) => setTimeout(resolve, 0));
    }
    const boarded = Object.values(at).map((row) => row.boarding);
    return {
      plans: ls.game.townEnemies.plans().map((row) => row.plan).join(' + '),
      startedOut,
      boarded,
      boardSpread: boarded.every((value) => value !== undefined)
        ? +(Math.max(...boarded) - Math.min(...boarded)).toFixed(1) : null,
      stolen: mark.stolen ?? null,
      escaped: mark.escaped ?? null,
    };
  }));
}
await browser.close();
console.log(JSON.stringify(results, null, 1));

for (const row of results) {
  assert.ok(row.startedOut.every((metres) => metres > 120 && metres < 320),
    `they start ${row.startedOut.join(' and ')} m out; they should come down the road, `
    + 'not from the next county and not from the fence');
  assert.ok(row.boarded.every((value) => value !== undefined),
    `on ${row.plans}, one of them never got in the car`);
  assert.ok(row.boardSpread <= 8,
    `on ${row.plans} they boarded ${row.boardSpread} s apart; they are supposed to rally first`);
  assert.ok(row.stolen !== null && row.stolen < 135,
    `on ${row.plans} the car was not taken until ${row.stolen} s`);
}
const worst = Math.max(...results.map((row) => row.stolen));
console.log(`Assault timing QA passed: over ${runs} runs they board within `
  + `${Math.max(...results.map((row) => row.boardSpread))} s of each other and the car is `
  + `gone by ${worst} s at the latest.`);

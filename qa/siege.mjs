// Watch the real siege, in the real compound, for a real minute.
//
// qa/enemy-brain.mjs proves the brain in a yard built to catch it out. This
// runs the actual game world - the gate, the barrier line, the car, the props,
// the other attacker - and reports what the two of them actually did, because
// "they run into things and get stuck" is a claim about this compound and not
// about a test fixture.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';

const url = process.argv[2] || 'http://127.0.0.1:5173/Lost-signal-/';
const outDir = process.argv[3] || 'qa/out/siege';
const runs = Number(process.argv[4] || 3);
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
page.on('pageerror', (error) => console.error('PAGEERROR', String(error).slice(0, 300)));

const all = [];
for (let run = 0; run < runs; run++) {
  await page.goto(url, { waitUntil: 'load', timeout: 180000 });
  await page.waitForFunction(() => typeof globalThis.__lsBoot === 'function', null, { timeout: 180000 });
  await page.evaluate(() => globalThis.__lsBoot());
  await page.waitForFunction(() => globalThis.__ls, null, { timeout: 180000 });
  await page.evaluate(() => globalThis.__ls.start());
  await page.waitForTimeout(1200);
  await page.evaluate((seconds) => { globalThis.__siegeSeconds = seconds; },
    Number(process.env.SIEGE_SECONDS || 90));

  const result = await page.evaluate(() => {
    const ls = globalThis.__ls;
    ls.world('outside');
    const enemies = ls.game.townEnemies;
    if (!enemies) return { error: 'no town enemies in the world' };
    const player = ls.body.position.clone();
    const track = new Map(enemies.agents.map((agent) => [agent.root.name, {
      plan: agent.plan.key, states: new Set(), travelled: 0, worstStall: 0, stall: 0,
      start: agent.root.position.clone(), replans: 0, unstick: 0,
    }]));
    const previous = new Map(enemies.agents.map((agent) =>
      [agent.root.name, agent.root.position.clone()]));

    // The attackers start half a kilometre down the road, so the siege needs
    // real minutes to reach the gate. Stepped by hand so the result does not
    // depend on how fast this machine renders.
    const seconds = Number(globalThis.__siegeSeconds || 90);
    for (let frame = 0; frame < 60 * seconds; frame++) {
      enemies.update(1 / 60, player, true);
      for (const agent of enemies.agents) {
        const row = track.get(agent.root.name);
        const moved = agent.root.position.distanceTo(previous.get(agent.root.name));
        previous.get(agent.root.name).copy(agent.root.position);
        row.travelled += moved;
        row.states.add(agent.state);
        const trying = !!(agent.target || agent.destination) && !agent.holding
          && !['breach_gate', 'breach_silo', 'silo_breached'].includes(agent.state);
        row.stall = moved < 0.0015 && trying ? row.stall + 1 / 60 : 0;
        row.worstStall = Math.max(row.worstStall, row.stall);
        row.replans = agent.replans;
        row.unstick = agent.unstickAttempts;
      }
    }
    return {
      agents: [...track.entries()].map(([name, row]) => ({
        name, plan: row.plan, states: [...row.states],
        travelled: +row.travelled.toFixed(1),
        worstStall: +row.worstStall.toFixed(2),
        reached: +row.start.distanceTo(
          enemies.agents.find((agent) => agent.root.name === name).root.position).toFixed(1),
        replans: row.replans, unstick: row.unstick,
      })),
    };
  });
  all.push(result);
  console.error(`  run ${run + 1} of ${runs}`);
}

let worst = 0;
for (const [index, run] of all.entries()) {
  if (run.error) { console.log(`  run ${index + 1}: ${run.error}`); continue; }
  for (const agent of run.agents) {
    worst = Math.max(worst, agent.worstStall);
    console.log(`  run ${index + 1} ${agent.name.padEnd(17)} ${agent.plan.padEnd(11)} `
      + `walked ${String(agent.travelled).padStart(6)} m, ${agent.reached} m from where it started, `
      + `worst stall ${agent.worstStall.toFixed(2)} s, ${agent.replans} replans, `
      + `${agent.unstick} break-outs`);
    console.log(`      states: ${agent.states.join(' -> ')}`);
  }
}
writeFileSync(`${outDir}/report.json`, JSON.stringify(all, null, 1));
await browser.close();
console.log(`\nworst stall across ${runs} runs: ${worst.toFixed(2)} s`);
if (worst > 2.0) {
  console.error('FAIL: an attacker spent over two seconds going nowhere while trying to move');
  process.exit(1);
}

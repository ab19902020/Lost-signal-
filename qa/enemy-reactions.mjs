// Do they react to anything, or only to arriving?
//
// A round that did not kill one of them used to do nothing at all. He took it
// in silence and carried on walking to the car, which is the single most
// obviously wrong thing an attacker can do and most of what "they have
// terrible NPC brains" means. Neither did his mate learn anything from it -
// he was looking at the car, and nobody told him.
//
// Three reactions, three measurements: a man who is shot goes to ground and
// stops closing; his partner becomes alert without being shot at himself; and
// the survivor of a pair stops waiting at the fence for somebody who is dead.
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
  const agents = ls.game.townEnemies.agents;
  const player = ls.body.position.clone();
  const gate = { x: 0, z: 17 };
  const toGate = (agent) => Math.hypot(agent.root.position.x - gate.x,
    agent.root.position.z - gate.z);

  // Let them get well down the road first, so they are committed and moving.
  for (let frame = 0; frame < 60 * 25; frame++) ls.game.update(1 / 60, 'outside', player);
  const shot = agents[0];
  const mate = agents[1];
  const before = { shotAt: +toGate(shot).toFixed(1), mateAt: +toGate(mate).toFixed(1),
    mateAlerted: !!mate.alerted, mateWary: +(mate.wary || 0).toFixed(1) };

  // How much ground he covers, unshot, as the baseline.
  //
  // This used to measure how much closer to the gate he got in two seconds,
  // which is the wrong question twice over. Each man draws a plan at random,
  // and a bounding advance spends part of every cycle standing still and
  // looking, while a hook deliberately swings wide - so a perfectly healthy
  // attacker could post two seconds of no progress, or of negative progress,
  // and the check called it a man who was not attacking. What suppression
  // actually changes is whether he is moving at all, so that is what is
  // measured, over long enough to cover a whole bounding cycle.
  const walked = (frames) => {
    let covered = 0;
    let last = shot.root.position.clone();
    const from = toGate(shot);
    for (let frame = 0; frame < frames; frame++) {
      ls.game.update(1 / 60, 'outside', player);
      covered += shot.root.position.distanceTo(last);
      last = shot.root.position.clone();
    }
    const seconds = frames / 60;
    return { ground: +(covered / seconds).toFixed(2),
      closing: +((from - toGate(shot)) / seconds).toFixed(2) };
  };
  const unshot = walked(60 * 6);
  const unshotRate = unshot.closing;
  const closedUnshot = +(before.shotAt - toGate(shot)).toFixed(2);

  // Now shoot him, from somewhere he can place.
  const from = shot.root.position.clone();
  shot.takeFire(from.x + 24, from.z + 24, true);
  const reacted = { suppressed: +(shot.suppressed || 0).toFixed(1),
    mateAlerted: !!mate.alerted, mateWary: +(mate.wary || 0).toFixed(1) };
  const wasAt = toGate(shot);
  // Inside the suppression, which lasts three and a half seconds.
  const suppressed = walked(180);
  const shotRate = suppressed.closing;
  const closedShot = +(wasAt - toGate(shot)).toFixed(2);
  const held = shot.holding;

  // And with his mate dead, the survivor should not sit at the fence waiting.
  for (let frame = 0; frame < 60 * 60; frame++) {
    ls.game.update(1 / 60, 'outside', player);
    if (agents.every((agent) => agent.state === 'assault_rally'
      || agent.state === 'breach_gate' || agent.state === 'to_car')) break;
  }
  const survivor = agents.find((agent) => agent !== mate);
  mate.kill();
  const soloedAfterDeath = !!survivor.soloed;
  const rallyIgnored = survivor.squadRallied();
  return { before, closedUnshot, unshot, reacted, closedShot, suppressed, held,
    unshotRate, shotRate, soloedAfterDeath, rallyIgnored };
});
await browser.close();
console.log(JSON.stringify(result, null, 1));

assert.ok(result.unshot.ground > 1.2,
  `unshot he covered ${result.unshot.ground} m/s of ground; he is standing still`);
assert.ok(result.reacted.suppressed > 1,
  'being shot did not put his head down at all');
// He does not stop moving when a round goes past - he moves to cover, and does
// it faster than he was advancing. What changes is the direction: he gives
// ground instead of taking it.
//
// The obvious check - "he was closing on the gate before and is not now" -
// tests the wrong half. Each man draws a plan at random, and a hook swings
// deliberately wide, so a healthy attacker's progress towards the gate over
// any given six seconds is anywhere from four metres a second to nothing at
// all. What is not a lottery is what a round does to him.
assert.ok(result.shotRate < -1,
  `shot, he went on closing on the gate at ${result.shotRate} m/s; he should be `
  + 'backing off it');
assert.ok(result.shotRate < result.unshotRate - 2,
  `shot, he closed at ${result.shotRate} m/s against ${result.unshotRate} m/s unshot; `
  + 'a round through him changes nothing');
assert.equal(result.held, 'suppressed',
  `after a round he is doing "${result.held}" rather than keeping his head down`);
// Both men are alerted from the moment the siege starts - they are attacking,
// not patrolling - so "alerted" is not the signal. What he learns from his
// mate being shot at is where the shooting is and to stop strolling, and that
// is what wariness measures.
assert.equal(result.before.mateWary, 0,
  'the other one was already jumpy before a shot was fired');
assert.ok(result.reacted.mateWary > 5,
  `the other one is ${result.reacted.mateWary} s wary after his mate was shot at; `
  + 'nobody told him');
assert.ok(result.soloedAfterDeath,
  'the survivor does not know his partner is dead');
assert.ok(result.rallyIgnored,
  'the survivor is still waiting at the fence to rally with a dead man');
console.log('Enemy reaction QA passed: a round puts him behind something and stops him '
  + 'closing, his mate hears about it, and the survivor stops waiting for the dead.');

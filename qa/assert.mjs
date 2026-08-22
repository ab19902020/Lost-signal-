#!/usr/bin/env node
// Runs the QA harnesses and turns their readings into pass/fail, so the checks
// that caught real regressions (a world on its side, untextured concrete, a
// rifle that fired blanks) run on every push instead of by hand.
import { execFileSync } from 'node:child_process';

const url = process.argv[2] || 'http://127.0.0.1:5173/Lost-signal-/';
const run = (script) => {
  const stdout = execFileSync('node', [script, url], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
  const start = stdout.indexOf('{');
  if (start < 0) throw new Error(`${script} produced no readings`);
  return JSON.parse(stdout.slice(start));
};

const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

const physics = run('qa/physics.mjs');
const combat = run('qa/combat.mjs');

// The player has to be stopped by the room and by the props standing in it.
check(physics.backWall.z <= 6.6, 'player walked through the shelter wall');
check(physics.storageRack.x <= 5.4, 'player walked through the storage rack');
check(physics.crouch.eye < physics.standBackUp.eye, 'crouch did not lower the view');
check(physics.standBackUp.eye > 1.6, 'player never stood back up');
check(physics.world.wildlife > 0 && physics.world.zombies > 0, 'the surface is empty');
check(physics.world.bunkerColliders > 5, 'the shelter has no collision volumes');

// A 1x1 map is three.js substituting a placeholder for a texture that failed to
// load — which is exactly how the shelter once shipped untextured.
for (const texture of physics.textures) {
  check(texture.size !== '1x1', `${texture.material} fell back to a placeholder texture`);
}

check(combat.zombieDown, 'rifle did not down an infected');
check(combat.hareDown, 'rifle did not down a hare');
check(Math.abs(combat.collapsedRoll) > 1.4, 'a downed creature did not collapse');
check(combat.breached > 0, 'an open blast door was never breached');
check(combat.healthDropped, 'an intruder inside the shelter did no harm');

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed:`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log('\nAll gameplay checks passed.');

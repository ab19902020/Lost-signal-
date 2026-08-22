#!/usr/bin/env node
// Runs the QA harnesses and turns their readings into pass/fail, so the checks
// that caught real regressions (a world on its side, untextured concrete, a
// rifle that fired blanks) run on every push instead of by hand.
import { execFileSync } from 'node:child_process';

const url = process.argv[2] || 'http://127.0.0.1:5173/Lost-signal-/';
const run = (script) => {
  const stdout = execFileSync('node', [script, url], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
  // Take the JSON object only. Anything a harness prints around it is
  // commentary, not readings.
  const start = stdout.indexOf('{');
  const end = stdout.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error(`${script} produced no readings:\n${stdout}`);
  try {
    return JSON.parse(stdout.slice(start, end + 1));
  } catch (error) {
    throw new Error(`${script} produced unparsable readings (${error.message}):\n${stdout}`);
  }
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
check(physics.world.wildlife > 0, 'the surface has no wildlife');
check(physics.world.bunkerColliders > 5, 'the shelter has no collision volumes');

// A 1x1 map is three.js substituting a placeholder for a texture that failed to
// load — which is exactly how the shelter once shipped untextured.
for (const texture of physics.textures) {
  check(texture.size !== '1x1', `${texture.material} fell back to a placeholder texture`);
}

if (physics.silo.present) {
  check(physics.silo.arrival.grounded, 'arriving in the silo did not land on the top landing');
  check(physics.silo.arrival.y > 40, `silo arrival was at y=${physics.silo.arrival.y}, not the top landing`);
  // The shaft is crossed by a landing on every level, so a fall can legitimately
// end on one. What matters is that the well is open rather than solid.
check(physics.silo.overCentre.y < physics.silo.arrival.y - 25,
  `stepping into the light well fell only ${(physics.silo.arrival.y - physics.silo.overCentre.y).toFixed(1)} m`);
  check(physics.silo.overCentre.grounded, 'the player never landed after falling down the well');
  check(physics.silo.interactions >= 3, 'the silo has nothing in it to interact with');
} else {
  console.error('note: silo assets are not present in this checkout, skipping silo checks');
}

check(combat.deerDown, 'rifle did not down a deer');
check(combat.hareDown, 'rifle did not down a hare');
check(Math.abs(combat.collapsedRoll) > 1.4, 'a downed animal did not collapse');
check(combat.residents >= 10, `the silo has ${combat.residents} residents, expected at least 10`);
check(combat.residentsMoved > 0, 'no resident moved along their gallery');
check(combat.residentLevels > 1, 'every resident is on the same level');
check(combat.residentLevels <= 6, 'residents are spread too thin to meet');
check(combat.residentLines === combat.residents, 'a resident has nothing to say');
check(combat.speakPrompt, 'standing beside a resident offered no way to speak to them');

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed:`);
  for (const failure of failures) console.error(`  - ${failure}`);
  // Print what the run actually measured, so a failure is diagnosable from
  // the CI log alone.
  console.error('\nphysics:', JSON.stringify(physics));
  console.error('combat:', JSON.stringify(combat));
  process.exit(1);
}
console.log('\nAll gameplay checks passed.');

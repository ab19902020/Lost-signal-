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
// Nothing lives on the surface: the world ended and took the animals with it.
check(physics.world.wildlife === 0,
  `the surface has ${physics.world.wildlife} animals on it and should have none`);
check(physics.world.bunkerColliders > 5, 'the shelter has no collision volumes');

// A 1x1 map is three.js substituting a placeholder for a texture that failed to
// load — which is exactly how the shelter once shipped untextured.
for (const texture of physics.textures) {
  check(texture.size !== '1x1', `${texture.material} fell back to a placeholder texture`);
}

if (physics.silo.present) {
  check(physics.silo.arrival.grounded, 'arriving in the silo did not land on the top landing');
  // Seven residential levels of four metres, with the secure unit above them.
  check(physics.silo.arrival.y > 24, `silo arrival was at y=${physics.silo.arrival.y}, not the top landing`);
  // The shaft is crossed by a landing on every level, so a fall can legitimately
  // end on one. What matters is that the well is open rather than solid.
  check(physics.silo.arrival.y - physics.silo.overCentre.y > 20,
    `stepping into the light well fell only ${(physics.silo.arrival.y - physics.silo.overCentre.y).toFixed(1)} m`);
  check(physics.silo.overCentre.grounded, 'the player never landed after falling down the well');
  // The great stair has to be a stair. Its treads were once authored radially
  // and collided tangentially, which looked right and could not be walked.
  const descent = physics.silo.stairTop - physics.silo.stairFoot.y;
  check(descent > 4, `walking the stair descended ${descent.toFixed(1)} m, less than one level`);
  check(physics.silo.stairFoot.grounded, 'the player did not stay on their feet down the stair');
  check(physics.silo.stairFoot.radius > 1.2 && physics.silo.stairFoot.radius < 6.0,
    `walking the stair ended at radius ${physics.silo.stairFoot.radius}, off the flight`);
  for (const entry of physics.silo.stairEntries || []) {
    check(entry.radius < 5.55,
      `level ${entry.level}: balustrade blocked entry to the descending flight at radius ${entry.radius}`);
    check(entry.grounded, `level ${entry.level}: entering the descending flight left the player airborne`);
    check(Math.abs(entry.y - entry.level * 4) < 0.7,
      `level ${entry.level}: entering the stair changed level to y=${entry.y}`);
  }
  for (const lane of physics.silo.topTransition || []) {
    check(lane.minimumY > 27.5,
      `top landing lane ${lane.offset} fell to y=${lane.minimumY}`);
    check(lane.grounded, `top landing lane ${lane.offset} did not remain grounded`);
    check(lane.x < 5.1, `top landing lane ${lane.offset} stopped before the final stair join`);
  }
  // ...and the stair has to join every floor. Walking straight off the foot of
  // a flight should cross the landing and put you out on the walkway. An
  // unbroken gallery railing runs across the mouth of the landing and the walk
  // stops dead at the well edge — which is how the secure unit at the top came
  // to be a level you could see and never reach.
  for (const floor of physics.silo.floors) {
    check(floor.radius > 15,
      `level ${floor.level}: walking off the stair stopped at radius ${floor.radius}, short of the walkway`);
    check(floor.grounded, `level ${floor.level}: walking off the stair did not end on the floor`);
    check(Math.abs(floor.drop) < 1.0, `level ${floor.level}: walking off the stair changed level`);
  }
  check(physics.silo.homeEntry.closedBlocked, 'a closed quarters door has no collision');
  check(physics.silo.homeEntry.radius > 24.0,
    `player stopped at r=${physics.silo.homeEntry.radius} at the opened quarters hall barrier`);
  check(physics.silo.homeEntry.grounded, 'entering an opened quarters left the player airborne');
  check(physics.silo.sofaUse.present, 'the apartments expose no sofa interaction');
  check(physics.silo.sofaUse.satDown, 'using an apartment sofa did not seat the player');
  check(physics.silo.sofaUse.seatedEye < 1.3, 'the sofa interaction left the camera at standing height');
  check(physics.silo.sofaUse.stoodUp, 'using the control again did not stand up from the sofa');
  check(physics.silo.furnitureJump.present, 'the apartments expose no physical dining table');
  check(physics.silo.furnitureJump.rise > 0.65,
    `silo jump rose only ${physics.silo.furnitureJump.rise} m`);
  check(physics.silo.furnitureJump.atop, 'low apartment furniture did not provide a landing surface');
  check(physics.silo.furnitureJump.landed, 'the player did not return to a grounded state after jumping');
  check(physics.silo.aim.active, 'rifle aim mode did not engage');
  check(physics.silo.aim.fov < 56, `rifle aim FOV stayed at ${physics.silo.aim.fov}°`);
  check(physics.silo.aim.centred, 'rifle did not centre under the crosshair while aiming');
  check(Math.abs(physics.silo.aim.rifleYaw - Math.PI / 2) < .03,
    `rifle is still sideways (${physics.silo.aim.rifleYaw} rad yaw)`);
  check(physics.silo.tunnelEntry.closedBlocked, 'the closed arched bulkhead has no collision');
  check(physics.silo.tunnelEntry.doorMesh, 'the animated arched bulkhead asset did not load');
  check(physics.silo.tunnelEntry.radius > 24.0,
    `player stopped at r=${physics.silo.tunnelEntry.radius} before entering the maintenance room`);
  check(physics.silo.tunnelEntry.grounded, 'bulkhead traversal left the player airborne');
  check(physics.silo.lightStability.active >= 5, 'the silo light pool never illuminated the current floor');
  check(physics.silo.lightStability.spread < 0.08,
    `stationary silo lighting flickered by ${physics.silo.lightStability.spread.toFixed(3)} intensity units`);
  check(physics.silo.lightMotion.distance > 6,
    `moving light test travelled only ${physics.silo.lightMotion.distance.toFixed(1)} m`);
  check(physics.silo.lightMotion.hotSwaps === 0,
    `${physics.silo.lightMotion.hotSwaps} silo light slot(s) moved while still illuminated`);
  check(physics.silo.lightMotion.maxSlotStep < 2.6,
    `moving silo light changed by ${physics.silo.lightMotion.maxSlotStep.toFixed(2)} intensity units in one frame`);
  check(physics.silo.homes >= 70,
    `the enlarged silo contains only ${physics.silo.homes} family homes`);
  check(physics.silo.seats === physics.silo.homes * 2,
    `${physics.silo.homes} homes expose only ${physics.silo.seats} usable seats`);
  check(physics.silo.furnitureColliders >= physics.silo.homes * 21,
    `the apartments expose only ${physics.silo.furnitureColliders} furniture colliders`);
  check(physics.silo.doorArcs >= physics.silo.homes + 7,
    `the silo has only ${physics.silo.doorArcs} stateful door colliders`);
  check(physics.silo.interactions >= physics.silo.homes * 3 + 7,
    `the silo exposes only ${physics.silo.interactions} interactions; quarters or sofas are missing`);
} else {
  console.error('note: silo assets are not present in this checkout, skipping silo checks');
}

check(combat.residents >= 20, `the silo has ${combat.residents} residents, expected at least 20`);
check(combat.residentsMoved > 0, 'no resident moved along their gallery');
check(combat.residentLevels > 1, 'every resident is on the same level');
check(combat.residentLevels <= 6, 'residents are spread too thin to meet');
check(combat.residentLines === combat.residents, 'a resident has nothing to say');
// Twenty of the same person is the most obviously artificial thing in a game,
// so the silo has to be drawing them from more than one build.
check(combat.residentBuilds >= 6,
  `residents are drawn from ${combat.residentBuilds} body build(s), expected 6`);
check(combat.speakPrompt, 'standing beside a resident offered no way to speak to them');
check(combat.residentCollision?.distance >= combat.residentCollision?.minimum - .03,
  `the player passed through a resident (${combat.residentCollision?.distance} m separation)`);
check(combat.residentsOffGallery === 0,
  `${combat.residentsOffGallery} residents walked through a gallery wall or balustrade`);

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

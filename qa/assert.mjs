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
const weapons = run('qa/weapons.mjs');

// The player has to be stopped by the room and by the props standing in it.
check(physics.backWall.z <= 6.6, 'player walked through the shelter wall');
check(physics.storageRack.x <= 5.4, 'player walked through the storage rack');
check(physics.crouch.eye < physics.standBackUp.eye, 'crouch did not lower the view');
check(physics.standBackUp.eye > 1.6, 'player never stood back up');
// Nothing lives on the surface: the world ended and took the animals with it.
check(physics.world.wildlife === 0,
  `the surface has ${physics.world.wildlife} animals on it and should have none`);
check(physics.world.bunkerColliders > 5, 'the shelter has no collision volumes');

check(physics.armory?.present, 'the walk-in armoury did not load');
if (physics.armory?.present) {
  check(physics.armory.weapons === 29,
    `the armoury displays ${physics.armory.weapons} of the 29 racked models`);
  check(physics.armory.shutDoorZ < 0.25,
    `the shut armoury door let the player reach z=${physics.armory.shutDoorZ}`);
  check(physics.armory.doorOffset < -1.65,
    `the armoury door moved only ${physics.armory.doorOffset} m into its pocket`);
  check(physics.armory.openDoorZ > 2.0,
    `the open armoury stopped the player at z=${physics.armory.openDoorZ}`);
  check(physics.armory.openDoorZ < 4.45,
    `the player walked through the armoury back wall to z=${physics.armory.openDoorZ}`);
  check(physics.armory.staticColliders >= 15,
    `the armoury exposes only ${physics.armory.staticColliders} solid fittings`);
  check(physics.armory.character && physics.armory.characterHeight > 1.7,
    'the supplied full-height Adventurer character is missing');
  check(physics.armory.characterAnimations >= 24,
    'the supplied Adventurer animation set is not active');
  check(physics.armory.characterCollision >= .64,
    `the player passed through the quartermaster (${physics.armory.characterCollision} m)`);
  check(physics.armory.rifleIssued && !physics.armory.rifleVisibleOnRack,
    'taking the service rifle did not remove it from its wall mount');
  check(physics.armory.armed && physics.armory.magazine === 30,
    `the issued rifle loaded ${physics.armory.magazine} rounds instead of 30`);
}

// A 1x1 map is three.js substituting a placeholder for a texture that failed to
// load — which is exactly how the shelter once shipped untextured.
for (const texture of physics.textures) {
  check(texture.size !== '1x1', `${texture.material} fell back to a placeholder texture`);
}
for (const texture of physics.siloTextures || []) {
  check(texture.size !== '1x1', `${texture.material} fell back to a placeholder texture in the silo`);
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
  // The exact yaw is the viewmodel's business — it is measured from the model
  // now, not assumed — but the weapon still has to be turned onto the firing
  // line rather than lying across the bottom of the screen.
  // Which Euler angle the rifle ends up at is no longer meaningful: the
  // viewmodel measures each model and derives the rotation that points it
  // downrange, so a quarter turn either way is equally correct. What the
  // weapon is actually doing is checked properly in qa/weapons.mjs, against
  // every weapon in the collection rather than this one.
  check(Math.abs(physics.silo.aim.rifleYaw) > 0.01,
    'the held rifle was left at its authored orientation');
  check(/^Equipped_armory/.test(physics.silo.aim.rifleName || ''),
    `the held model is ${physics.silo.aim.rifleName}, not a weapon off the armoury wall`);
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

// The top of the silo is a secure unit with people posted on it: a sentry on
// the door, a dog on a beat, and the infirmary the shelter's CONDITION readout
// has always implied existed.
if (combat.garrison) {
  check(combat.garrison.sentry, 'no sentry is posted on the secure gallery');
  check(combat.garrison.sentryY > 27, `the sentry stands at y=${combat.garrison.sentryY}, not the top level`);
  check(combat.garrison.dog, 'the patrol dog is missing');
  check(combat.garrison.dogWalked > 1,
    `the patrol dog moved ${combat.garrison.dogWalked} m in five seconds`);
  check(combat.garrison.dogRadius > 13.5 && combat.garrison.dogRadius < 19.5,
    `the patrol dog walked off the gallery to radius ${combat.garrison.dogRadius}`);
  check(combat.garrison.kit >= 10,
    `the infirmary is stocked with only ${combat.garrison.kit} items`);
  const treatment = combat.garrison.treatment || {};
  check(treatment.offered, 'the infirmary offers no way to treat an injury');
  check(treatment.after > treatment.hurt,
    `treatment left condition at ${treatment.after}% after a wound took it to ${treatment.hurt}%`);
  check(treatment.dosesLeft === 2,
    `the infirmary has ${treatment.dosesLeft} courses left after one treatment, expected 2`);
} else {
  console.error('note: the silo garrison did not build, skipping its checks');
}

// The armoury shipped for three releases with twenty-five weapons on the walls
// and one of them working. Every usable weapon has to come off its rack, hang
// in the player's hands as its own model, put a round downrange, mark what it
// hits and load again.
check(weapons.takeInteractions === weapons.expected,
  `${weapons.takeInteractions} of ${weapons.expected} racked weapons can be taken`);
check(weapons.inspectInteractions === 3,
  `${weapons.inspectInteractions} bench fittings offer an inspect interaction, expected 3`);
check(!weapons.issuedThroughShutDoor, 'a weapon was issued through the shut armoury door');
check(weapons.racked.length === 0, `rack handover failed: ${weapons.racked.join('; ')}`);
check(weapons.sameModel.length === 0,
  `the viewmodel did not swap: ${weapons.sameModel.join('; ')}`);
// Pointing a muzzle at the player's own face is the single worst thing a
// first-person weapon can do, and with twenty-six of them from four packs it
// is not something a per-weapon flag was ever going to get right.
check(weapons.backwards.length === 0,
  `these weapons are held pointing backwards: ${weapons.backwards.join('; ')}`);
check(weapons.fired.length === 0, `a weapon fired blanks: ${weapons.fired.join('; ')}`);
check(weapons.rolled.length === 0,
  `these weapons are held on their side: ${weapons.rolled.join('; ')}`);
check(weapons.stubby.length === 0,
  `these weapons are not held along their long axis: ${weapons.stubby.join('; ')}`);
// Everything in a class is carried at the same size. Per-model scales guessed
// at conversion time had the Mossberg at two fifths the size of the other
// shotguns and the AKM short of every other rifle.
{
  const byLength = new Map();
  for (const [key, length] of weapons.lengths || []) byLength.set(key, length);
  const classes = {
    rifle: ['armoryAssault01', 'armoryAssault02', 'armoryAssault03', 'armoryBullpup', 'armoryAkm'],
    shotgun: ['armoryShotgun01', 'armoryShotgun02', 'armoryShotgunShort',
      'armoryShotgunSawed', 'armoryMossberg'],
    sniper: ['armorySniper01', 'armorySniper02', 'armorySniper03', 'armorySniper04'],
    handgun: ['armoryPistol01', 'armoryPistol02', 'armoryPistol03', 'armoryPistol04',
      'armoryGlock', 'armoryRevolver01', 'armoryRevolver02', 'armoryRevolver03'],
  };
  for (const [name, keys] of Object.entries(classes)) {
    const lengths = keys.map((key) => byLength.get(key)).filter((v) => v != null);
    if (lengths.length < 2) continue;
    const spread = Math.max(...lengths) - Math.min(...lengths);
    check(spread < 0.08,
      `${name}s are carried at lengths ${Math.min(...lengths)}–${Math.max(...lengths)} m`);
  }
}
check(weapons.noDecal.length === 0,
  `these weapons left no mark on the wall they hit: ${weapons.noDecal.join(', ')}`);
check(weapons.badReload.length === 0, `a weapon failed to reload: ${weapons.badReload.join('; ')}`);
check(weapons.distinctNames === weapons.expected,
  `only ${weapons.distinctNames} of ${weapons.expected} weapons are named separately in the HUD`);
check(weapons.automatic?.autoLeft < weapons.automatic?.autoMagazine - 3,
  `holding the trigger on an automatic fired ${weapons.automatic?.autoMagazine - weapons.automatic?.autoLeft} round(s)`);
check(weapons.automatic?.semiLeft === weapons.automatic?.semiMagazine,
  'holding the trigger emptied a semi-automatic');
check(weapons.marks > 0, 'no bullet marks were laid down over the whole run');
check(weapons.liveMarks > 0, 'bullet marks did not stay on the wall while the player was there');

// Shooting a person kills them, and the body ends up on the deck they were
// standing on rather than snapping upright or dropping through the gallery.
check(weapons.person?.down, 'shooting a resident did not kill them');
check(weapons.person?.tipped > 1.4, `a downed resident tipped only ${weapons.person?.tipped} rad`);
check(Math.abs((weapons.person?.startY ?? 0) - (weapons.person?.endY ?? 99)) < 1,
  `a downed resident fell from y=${weapons.person?.startY} to y=${weapons.person?.endY}`);
check(weapons.quartermaster?.down, 'the quartermaster cannot be brought down');
check(weapons.quartermaster?.tipped > 1.4,
  `the downed quartermaster tipped only ${weapons.quartermaster?.tipped} rad`);

// Recoil. Every firearm has to move the sight, none of them the same amount,
// and none of them may hand the whole thing back for free.
const kicks = Object.entries(weapons.recoil || {});
check(kicks.length > 20, `only ${kicks.length} weapons reported a recoil profile`);
for (const [key, r] of kicks) {
  check(r.rise > 0.0008, `${key} barely moves the sight (${r.rise})`);
  // The weapon returns most of it; what is left is the player's to correct.
  check(r.left > 0.0002 && r.left < r.rise,
    `${key} leaves ${r.left} of ${r.rise} for the player to correct`);
}
const rises = kicks.map(([, r]) => r.rise);
check(Math.max(...rises) / Math.min(...rises) > 6,
  `the whole armoury recoils within ${(Math.max(...rises) / Math.min(...rises)).toFixed(1)}x of itself`);
// The suppressed SMG is the softest thing in the collection and the .50 the
// hardest; if that has inverted, the profiles have been shuffled.
const softest = kicks.reduce((a, b) => (a[1].rise <= b[1].rise ? a : b))[0];
const hardest = kicks.reduce((a, b) => (a[1].rise >= b[1].rise ? a : b))[0];
check(softest === 'armorySmg02', `${softest} is now the softest-recoiling weapon`);
check(hardest === 'armorySniper04' || hardest === 'armoryShotgunSawed',
  `${hardest} is now the hardest-recoiling weapon`);
// The AKM's character is that it goes the same way every time.
const akm = weapons.recoil?.armoryAkm;
check(akm && Math.abs(akm.pull) > 0.0002, `the AKM has no consistent pull (${akm?.pull})`);

// Gore. A round through a person throws blood downrange and marks what was
// stood behind them; it used to produce seven small cubes and nothing else.
const gore = weapons.gore || {};
check(gore.spray > 10, `a shotgun into a resident threw ${gore.spray} particles`);
check(gore.spatter > 3, `${gore.spatter} blood marks left by six shotgun rounds into someone`);

// The silo's envelope. The level ring leaves the service bay's facade out for
// the tunnel arch to stand in; nothing filled the rest of that bay, so the top
// landing — the first thing the player sees coming down from the shelter — had
// a five-metre hole in its wall onto the shaft.
const envelope = physics.envelope || {};
check(envelope.floorHoles === 0,
  `${envelope.floorHoles} places in the silo where the walkway has no floor: ${(envelope.worst || []).join(', ')}`);
check(envelope.wallGaps === 0,
  `${envelope.wallGaps} places in the silo where you can see through the wall: ${(envelope.worst || []).join(', ')}`);

// The dog. He walks the way he is pointing, he comes when he is called, and
// once he is yours he heels.
const dogged = combat.garrison || {};
check((dogged.dogFacing ?? -1) > 0.7,
  `the dog walks at ${dogged.dogFacing} to his own nose — he is moonwalking again`);
check(dogged.dogCame && dogged.dogCame.to < 3 && dogged.dogCame.from > 8,
  `called from ${dogged.dogCame?.from} m, the dog got to ${dogged.dogCame?.to} m`);
check(dogged.dogTrust >= 1, `the dog will not be won over (trust ${dogged.dogTrust})`);
check(dogged.dogFollows === 'following', `a bonded dog is "${dogged.dogFollows}", not following`);
check((dogged.dogHeel ?? 99) < 4,
  `the dog stayed ${dogged.dogHeel} m behind when the player walked off`);

// The surface. What used to be out there was a skirt, twenty-six flat "far
// field" rectangles and fourteen "grass patches", each a hard-edged block of
// one colour — a jigsaw from any height. It is one vertex-coloured mesh now,
// with the countryside instanced on top of it.
const country = physics.country || {};
check(country.jigsaw === 0,
  `${country.jigsaw} flat-colour ground rectangles are back on the surface`);
check(country.field?.vertexColours === true,
  'the ground is not carrying its tone in vertex colours');
check((country.field?.spread ?? 0) > 0.1,
  `the ground's tone barely varies (spread ${country.field?.spread})`);
check(country.hedges > 90, `only ${country.hedges} hedge sections in the fields`);
// These floors are set for the mobile tier, which plants 22% of the full
// countryside. The reduced density is intentional: it keeps the Android build
// inside its frame budget while the instanced field still reads as planted.
check(country.tufts >= 250, `only ${country.tufts} grass tufts on the surface`);
check(country.trees >= 40, `only ${country.trees} trees in the country`);
check(country.scattered > 800,
  `only ${country.scattered} scattered instances outside`);
// Instancing is the whole reason the count can be that high.
check(country.instanced >= 20 && country.scattered / country.instanced > 20,
  `the countryside is not instanced (${country.instanced} meshes for ${country.scattered} copies)`);

// Sound. Every weapon has to make its own noise, with a real transient on the
// front of it, and the room it is fired in has to be audible in the result.
const audio = weapons.audio || {};
const spaces = audio.__spaces || {};
const shots = Object.entries(audio).filter(([key]) => key !== '__spaces');
check(shots.length === weapons.expected,
  `only ${shots.length} of ${weapons.expected} weapons rendered a shot`);
for (const [key, shot] of shots) {
  if (!shot) { failures.push(`${key} rendered no shot at all`); continue; }
  check(shot.peak > 0.02, `${key} fires almost silently (peak ${shot.peak})`);
  check(shot.attack <= 0.02, `${key} has no transient (peak at ${shot.attack}s)`);
  check(shot.tail > 0.08, `${key} stops dead (tail ${shot.tail}s)`);
}
const fingerprint = new Set(shots.map(([, s]) => s && `${s.peak}:${s.rms}:${s.tail}`));
check(fingerprint.size >= shots.length - 1,
  `${shots.length - fingerprint.size + 1} weapons render an identical shot`);
check(spaces.silo && spaces.bunker && spaces.silo.tail > spaces.bunker.tail * 1.5,
  'the silo does not ring longer than the shelter');
check(spaces.outside && spaces.bunker && spaces.outside.tail > spaces.bunker.tail,
  'the open compound does not carry further than the shelter');
// Three rooms, three lengths of tail, in the order the geometry implies: a
// concrete cell, then an open field, then sixty metres of steel shaft.
check(spaces.silo && spaces.outside && spaces.silo.tail > spaces.outside.tail * 1.5,
  'the silo does not ring longer than the open compound');

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed:`);
  for (const failure of failures) console.error(`  - ${failure}`);
  // Print what the run actually measured, so a failure is diagnosable from
  // the CI log alone.
  console.error('\nphysics:', JSON.stringify(physics));
  console.error('combat:', JSON.stringify(combat));
  console.error('weapons:', JSON.stringify(weapons));
  process.exit(1);
}
console.log('\nAll gameplay checks passed.');

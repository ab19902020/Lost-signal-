import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as THREE from 'three';
import { CharacterBody, ColliderSet } from '../src/physics.js';
import { buildSilo, SILO } from '../src/silo.js';
import { ARMORY_WEAPON_KEYS } from '../src/armory.js';
import { WEAPONS, USABLE_WEAPON_KEYS, DEFAULT_WEAPON, createLoadout, shotInterval } from '../src/weapons.js';

// Build the authored collision without loading a renderer or any GLBs. This is
// deliberately runnable anywhere `npm run build` runs, including before a
// browser is installed in CI.
const scene = new THREE.Scene();
const colliders = new ColliderSet();
const interactionNames = [];
const placedAssets = [];
const assets = {
  habShell: {}, habLevel: {}, habStair: {}, habCrown: {}, habSump: {},
  habLanding: {}, habTopLanding: {}, habApartment: {}, habDoor: {},
  habTunnel: {}, habBulkheadDoor: {},
};
const silo = buildSilo({
  scene,
  colliders,
  // Stubs stand in for the GLBs; what matters is that every branch of the
  // builder runs, including the ones that only fire when an asset is present.
  assets,
  place: (asset, _parent, position = [0, 0, 0], rotation = [0, 0, 0]) => {
    const root = new THREE.Group();
    root.position.set(...position);
    root.rotation.set(...rotation);
    placedAssets.push(asset);
    return root;
  },
  addInteraction: (_object, name) => interactionNames.push(name),
});
assert.ok(silo, 'silo collision did not build');
assert.ok(placedAssets.includes(assets.habTopLanding),
  'the secure stair head did not use its fully guarded landing asset');

// Via contains() rather than by scanning boxes: the silo's circular surfaces —
// the walkway, its railing, the wall of front doors — are ring colliders now,
// and a check that only looked at boxes would not see any of them.
const solidAt = (x, y, z) => colliders.contains(x, z, 0, y - 0.01, y + 0.01) &&
  !colliders.boxes.some(({ box, climbable }) => climbable &&
    x >= box.min.x && x <= box.max.x && y >= box.min.y && y <= box.max.y &&
    z >= box.min.z && z <= box.max.z);

const turn = SILO.stairTurn / SILO.stairSteps;
const landingRadius = SILO.stairRadius + 0.16;
const landingOpeningAngle = Math.asin(SILO.landingHalf / landingRadius);
for (let level = 0; level < SILO.levels; level++) {
  const base = level * SILO.levelHeight;
  const footAngle = level * SILO.stairTurn;
  const headAngle = footAngle + (SILO.stairSteps - 1) * turn;
  const middleAngle = footAngle + Math.floor(SILO.stairSteps / 2) * turn;

  assert.equal(solidAt(
    Math.cos(footAngle) * landingRadius, base + 0.62,
    Math.sin(footAngle) * landingRadius), false,
  `level ${level}: balustrade blocks the foot landing`);
  assert.equal(solidAt(
    Math.cos(headAngle) * landingRadius, base + SILO.levelHeight - 0.35,
    Math.sin(headAngle) * landingRadius), false,
  `level ${level + 1}: balustrade blocks entry to the descending flight`);
  assert.equal(solidAt(
    Math.cos(middleAngle) * landingRadius, base + SILO.levelHeight / 2 + 0.55,
    Math.sin(middleAngle) * landingRadius), true,
  `level ${level}: unguarded outer edge in the middle of the flight`);

  // The balustrade must begin immediately outside the exact landing opening,
  // not two or three complete treads later. This is the gap visible in the
  // supplied mobile recording.
  for (const angle of [landingOpeningAngle + 0.035,
    SILO.stairTurn - landingOpeningAngle - 0.035]) {
    const step = Math.round(angle / turn) % SILO.stairSteps;
    const guardY = base + step * (SILO.levelHeight / SILO.stairSteps) + 0.58;
    assert.equal(solidAt(
      Math.cos(angle) * landingRadius, guardY,
      Math.sin(angle) * landingRadius), true,
    `level ${level}: stair guard does not meet the landing at ${(angle * 180 / Math.PI).toFixed(1)} degrees`);
  }
}

const PLAYER_RADIUS = 0.34;

// The floor bridge must stay continuous from the stair edge, over the landing,
// and onto every gallery—including the secure level at the top.
for (let level = 0; level <= SILO.levels; level++) {
  const y = level * SILO.levelHeight;
  for (const radius of [1.65, 2.5, 3.5, 4.7, 5.3, 5.55, 7, 9, 11, 12.8, 13.2, 14, 16, 18.5]) {
    const floor = colliders.floorAt(radius, 0, 0.24, y + 0.36);
    assert.ok(floor >= y - 0.03 && floor <= y + 0.34,
      `level ${level}: floor gap at radius ${radius} (floor ${floor})`);
  }
}

// The secure top landing must be safe across its full 3.6 m width, not only on
// the narrow diagonal where the last helical tread happens to overlap it.
const topY = SILO.levels * SILO.levelHeight;
for (const z of [-1.35, -0.7, 0, 0.7, 1.35]) {
  for (const x of [5.35, 4.7, 3.6, 2.4, 1.65]) {
    const floor = colliders.floorAt(x, z, PLAYER_RADIUS, topY + 0.36);
    assert.ok(Math.abs(floor - topY) < 0.1,
      `secure landing gap at x=${x}, z=${z} (floor ${floor})`);
  }
}
// One long edge of the head platform is a drop into the shaft and the other is
// the mouth of the only flight the player can walk down. Sealing both — which
// is what shipped — walled the stair off entirely from the level the player
// spawns on. Outboard of the stair's own balustrade both edges stay solid.
for (const x of [6.2, 8.5, 11.4]) {
  for (const side of [-1, 1]) {
    assert.equal(colliders.contains(x, side * SILO.landingHalf, 0.08,
      topY + .25, topY + 1.14), true,
    `secure landing side rail is open at x=${x}, side=${side}`);
  }
}
// Sampled inside the stair's circular balustrade, which legitimately guards
// the outer edge of the arrival tread at a radius of about 5.5 m.
for (const x of [2.4, 3.3, 4.4]) {
  assert.equal(colliders.contains(x, SILO.landingHalf, 0.08,
    topY + .25, topY + 1.14), true,
  `secure landing is unguarded over the shaft at x=${x}`);
  assert.equal(colliders.contains(x, -SILO.landingHalf, 0.08,
    topY + .25, topY + 1.14), false,
  `secure landing rail is barricading the descending flight at x=${x}`);
}
assert.equal(colliders.contains(SILO.landingInner + .15, 0, 0.08,
  topY + .25, topY + 1.14), true,
'secure landing inner edge has no cross rail');
assert.equal(colliders.contains(2.4, 0, PLAYER_RADIUS,
  topY + .20, topY + 1.70), false,
'secure landing rail blocks its usable centre lane');

// The whole point of the stair. Walk the player from the head platform, where
// they arrive, onto the treads and down the helix under the same CharacterBody
// the game uses. A guard rail across the top flight passes every static probe
// above and still leaves the player standing on the landing for good.
{
  const stairMid = SILO.stairColumn + (SILO.stairRadius - SILO.stairColumn) / 2;
  const walker = new CharacterBody();
  walker.teleport(8, topY + 0.05, 0);
  const desired = new THREE.Vector3();
  let lowest = topY;
  for (let frame = 0; frame < 60 * 45; frame++) {
    const { x, y, z } = walker.position;
    const radius = Math.hypot(x, z);
    let tx;
    let tz;
    if (radius > stairMid + 0.15 && y > topY - 0.5) {
      tx = stairMid;             // in along the landing centre line
      tz = 0;
    } else {
      const heading = Math.atan2(z, x) - 0.28;   // then round and down
      tx = Math.cos(heading) * stairMid;
      tz = Math.sin(heading) * stairMid;
    }
    desired.set(tx - x, 0, tz - z);
    if (desired.lengthSq() > 0) desired.setLength(2.6);
    walker.step(1 / 60, desired, colliders);
    lowest = Math.min(lowest, walker.position.y);
  }
  assert.ok(lowest < topY - SILO.levelHeight * 4,
    `the spiral stair is blocked: the player got from y=${topY} only down to y=${lowest.toFixed(2)}`);
  assert.ok(walker.grounded, 'walking the spiral stair ended with the player airborne');
}

// You have to be able to walk the whole ring, on every level. The walkway used
// to be collided as one axis-aligned box per bay, and a box drawn round a slab
// that is wide along the ring and thin through it is metres bigger than the
// slab — better than a third of every walkway was solid to the player and
// invisible on screen, leaving a single walkable lane down the middle.
// Both long sides of every landing are physical guards from the circular stair
// newels out to the gallery. Inside that join the same two edges are the broad
// arrival/departure mouths of the helical stair, so putting straight rails
// there would barricade the treads instead of protecting them.
for (let level = 0; level <= SILO.levels; level++) {
  const y = level * SILO.levelHeight;
  for (const radius of [2.1, 3.5, 6.0, 9.0, 12.7]) {
    if (radius >= SILO.stairRadius + .4) {
      for (const side of [-1, 1]) {
        assert.equal(colliders.contains(radius, -side * SILO.landingHalf, 0.12,
          y + 0.40, y + 1.15), true,
        `level ${level}: landing side ${side} is unguarded at radius ${radius}`);
      }
    }
    // Inside the stair radius, overlapping climbable treads intentionally
    // register in the cheap contains() query. The player controller steps onto
    // them; the unobstructed flat centre is asserted from the stair edge out.
    if (radius >= SILO.stairRadius + .4) {
      assert.equal(colliders.contains(radius, 0, PLAYER_RADIUS,
        y + 0.20, y + 1.70), false,
      `level ${level}: landing centre is blocked at radius ${radius}`);
    }
  }
}

for (let level = 0; level <= SILO.levels; level++) {
  const y = level * SILO.levelHeight;
  const blocked = [];
  for (let step = 0; step < 180; step++) {
    const angle = (step / 180) * Math.PI * 2;
    for (const radius of [13.6, 14.8, 16.3, 17.8, 18.6]) {
      if (colliders.contains(Math.cos(angle) * radius, Math.sin(angle) * radius,
        PLAYER_RADIUS, y + 0.2, y + 1.7)) {
        blocked.push(`${(angle * 180 / Math.PI).toFixed(0)}deg r${radius}`);
      }
    }
  }
  assert.equal(blocked.length, 0,
    `level ${level}: walkway blocked at ${blocked.length} of 900 samples, e.g. ${blocked.slice(0, 4).join(', ')}`);
}

// Both ends of the shaft have to be closed. Looking up and looking down used
// to finish on a blank disc, which is the most obviously unfinished thing a
// silo can do; the head is a coffered slab and the floor is a stepped drain,
// and both carry collision so neither is a hole you fall out of the world
// through.
const crownY = SILO.levels * SILO.levelHeight + SILO.levelHeight;
assert.ok(colliders.contains(0, 0, 0.34, crownY - 0.2, crownY + 0.4),
  'the head of the shaft is open');
assert.ok(colliders.contains(4, 4, 0.34, crownY - 0.2, crownY + 0.4),
  'the head of the shaft is open away from the axis');
assert.ok(colliders.floorAt(0, 0, 0.34, 1.0) > -0.2,
  'the floor of the shaft has no surface to stand on');

// Navigation: every front door must really open for the player capsule. Point
// samples inside rooms once missed a narrow/misaligned threshold because they
// never actually crossed it, so this drives the same CharacterBody used in play
// from the gallery into all 77 family homes.
let doorwaysTraversed = 0;
for (let level = 0; level < SILO.levels; level++) {
  const y = level * SILO.levelHeight;
  for (const bay of silo.homeBays[level]) {
    const angle = (bay * Math.PI * 2) / SILO.segments;
    const doorRadius = SILO.deckOuter - .30;
    silo.setHomeDoor(level, bay, false);
    assert.equal(colliders.contains(Math.cos(angle) * doorRadius, Math.sin(angle) * doorRadius,
      PLAYER_RADIUS, y + .2, y + 1.7), true,
    `level ${level} bay ${bay}: closed quarters door has no collision`);
    silo.setHomeDoor(level, bay, true);
    assert.equal(colliders.contains(Math.cos(angle) * doorRadius, Math.sin(angle) * doorRadius,
      PLAYER_RADIUS, y + .2, y + 1.7), false,
    `level ${level} bay ${bay}: open quarters door still blocks its threshold`);

    const body = new CharacterBody();
    // The dining setting is solid now, so follow the deliberately authored
    // circulation lane just left of it instead of demanding a route through
    // the middle of the table.
    const lane = -.45;
    body.teleport(Math.cos(angle) * 18.15 + Math.sin(angle) * lane, y + .02,
      Math.sin(angle) * 18.15 - Math.cos(angle) * lane);
    const desired = new THREE.Vector3(Math.cos(angle) * 2.55, 0, Math.sin(angle) * 2.55);
    for (let frame = 0; frame < 180; frame++) body.step(1 / 60, desired, colliders);
    const reached = Math.hypot(body.position.x, body.position.z);
    assert.ok(reached > silo.apartmentMid - .25,
      `level ${level} bay ${bay}: capsule stopped at r=${reached.toFixed(2)} at the old hall barrier`);
    assert.ok(body.grounded, `level ${level} bay ${bay}: entering the home left the player airborne`);
    doorwaysTraversed++;
  }
}

// Every room beyond those thresholds has to be standable.
// A home is a hall, a kitchen, a living room and two bedrooms behind their own
// portals, and a partition placed a few centimetres wrong seals one of them off
// without anything looking wrong from the walkway.
const ROOMS = [
  ['hall', 0, -4.1], ['kitchen', -3.2, -1.0], ['living', -.7, -.3],
  ['bedroom A', -4.15, 3.0], ['bedroom B', 4.1, 2.0],
];
let roomsChecked = 0;
for (let level = 0; level < SILO.levels; level++) {
  const y = level * SILO.levelHeight;
  for (const bay of silo.homeBays[level]) {
    const angle = (bay * Math.PI * 2) / SILO.segments;
    for (const [name, lx, lz] of ROOMS) {
      const radius = silo.apartmentMid + lz;
      const x = Math.cos(angle) * radius + Math.sin(angle) * lx;
      const z = Math.sin(angle) * radius - Math.cos(angle) * lx;
      assert.equal(colliders.contains(x, z, PLAYER_RADIUS, y + 0.2, y + 1.7), false,
        `level ${level} bay ${bay}: the ${name} is blocked`);
      const floor = colliders.floorAt(x, z, PLAYER_RADIUS, y + 0.4);
      assert.ok(Math.abs(floor - y) < 0.1,
        `level ${level} bay ${bay}: the ${name} has no floor (${floor} vs ${y})`);
      roomsChecked++;
    }
  }
}

assert.equal(silo.sofas.length, doorwaysTraversed,
  `only ${silo.sofas.length} of ${doorwaysTraversed} quarters have a usable sofa`);
assert.equal(interactionNames.filter((name) => name.startsWith('SIT ON SOFA')).length,
  doorwaysTraversed, 'not every apartment sofa exposes a USE interaction');
assert.equal(silo.seats.length, doorwaysTraversed * 2,
  'every family home should offer both sofa and dining seating');
assert.equal(silo.furnitureColliders.length, doorwaysTraversed * 21,
  'the major furniture in every family home is not fully physical');

// Low furniture blocks a standing capsule, then catches it on top after a
// jump/fall. Tall furniture remains a full-height blocker.
const table = silo.furnitureColliders.find((entry) => entry.name === 'dining-table_0_0');
const wardrobe = silo.furnitureColliders.find((entry) => entry.name === 'wardrobe_0_0');
assert.ok(table && wardrobe, 'representative apartment furniture collision is missing');
const insideTable = new THREE.Vector3(table.cx, 0, table.cz);
assert.equal(colliders.resolve(insideTable, PLAYER_RADIUS, 0, 1.78, .34), true,
  'the dining table can be walked through');
assert.ok(Math.hypot(insideTable.x - table.cx, insideTable.z - table.cz) > .2,
  'the dining table did not push the capsule out');
assert.equal(colliders.contains(wardrobe.cx, wardrobe.cz, PLAYER_RADIUS, .2, 1.7), true,
  'the wardrobe can be walked through');
const landingProbe = new CharacterBody();
landingProbe.teleport(table.cx, 1.18, table.cz);
landingProbe.grounded = false;
landingProbe.velocity.y = -1;
for (let frame = 0; frame < 90; frame++) {
  landingProbe.step(1 / 60, new THREE.Vector3(), colliders);
}
assert.ok(Math.abs(landingProbe.position.y - table.maxY) < .04 && landingProbe.grounded,
  'a jumping player cannot land on top of low apartment furniture');

// The landmark arch is always a real passage. Its bulkhead blocks the far end
// while shut, then opens into the maintenance room behind it on every level.
for (let level = 0; level < SILO.levels; level++) {
  const y = level * SILO.levelHeight;
  const angle = (silo.tunnelBay * Math.PI * 2) / SILO.segments;
  const entry = SILO.deckOuter - 0.30;
  assert.equal(colliders.contains(Math.cos(angle) * entry, Math.sin(angle) * entry,
    PLAYER_RADIUS, y + 0.2, y + 1.7), false,
  `level ${level}: the landmark arch is blocked at its entrance`);
  silo.setTunnelDoor(level, false);
  assert.equal(colliders.contains(Math.cos(angle) * silo.tunnelDoorRadius,
    Math.sin(angle) * silo.tunnelDoorRadius, PLAYER_RADIUS, y + .2, y + 1.7), true,
  `level ${level}: shut service bulkhead has no collision`);
  silo.setTunnelDoor(level, true);
  assert.equal(colliders.contains(Math.cos(angle) * silo.tunnelDoorRadius,
    Math.sin(angle) * silo.tunnelDoorRadius, PLAYER_RADIUS, y + .2, y + 1.7), false,
  `level ${level}: open service bulkhead still blocks the passage`);

  const body = new CharacterBody();
  body.teleport(Math.cos(angle) * 18.1, y + .02, Math.sin(angle) * 18.1);
  const desired = new THREE.Vector3(Math.cos(angle) * 2.7, 0, Math.sin(angle) * 2.7);
  for (let frame = 0; frame < 185; frame++) body.step(1 / 60, desired, colliders);
  const reached = Math.hypot(body.position.x, body.position.z);
  assert.ok(reached > silo.tunnelDoorRadius + .8,
    `level ${level}: capsule stopped at r=${reached.toFixed(2)} before the maintenance room`);
  assert.ok(body.grounded, `level ${level}: maintenance-room traversal left the player airborne`);
}

// A merge once pasted the silo event block four times. Besides opening CCTV
// repeatedly it paid out hydroponics four times and replaced the cache message
// with three "empty" messages, so duplicate game-event registrations fail the
// build before they can ship again.
const mainSource = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');
const registrations = [...mainSource.matchAll(/addEventListener\('lostsignal:([^']+)'/g)]
  .map((match) => match[1]);
const counts = new Map();
for (const event of registrations) counts.set(event, (counts.get(event) || 0) + 1);
for (const [event, count] of counts) {
  assert.equal(count, 1, `lostsignal:${event} is registered ${count} times`);
}
assert.ok(!mainSource.includes('TWELVE LEVELS BELOW'), 'silo copy disagrees with its seven levels');
for (const id of ['jumpBtn', 'aimBtn']) {
  assert.ok(mainSource.includes(`getElementById('${id}')`), `${id} is not wired to gameplay`);
}
assert.ok(mainSource.includes('jump: wantsJump'), 'jump input is not reaching the character body');

// The supplied pack is intentionally complete: dropping near-duplicate weapon
// files makes the new room look dressed in a screenshot while silently failing
// the user's request to see the whole collection on its walls.
assert.equal(ARMORY_WEAPON_KEYS.length, 29, 'the armoury does not enumerate every racked model');
assert.equal(new Set(ARMORY_WEAPON_KEYS).size, 29, 'an armoury wall slot repeats a weapon model');
const assetsSource = await readFile(new URL('../src/assets.js', import.meta.url), 'utf8');
for (const key of ARMORY_WEAPON_KEYS) {
  assert.ok(assetsSource.includes(`${key}:`), `the asset loader does not publish ${key}`);
}
assert.ok(assetsSource.includes('legacyOrientation: false'),
  'the supplied Y-up models are still being passed through the legacy rotation fix');
assert.ok(mainSource.includes('MAGAZINE_SIZE = 30'), 'the service rifle still uses the old five-round magazine');

// The armoury issued one weapon out of twenty-five for three releases. Every
// rack slot now has to be a catalogue entry, and everything that is not bench
// hardware has to be a thing the player can actually hold and fire.
for (const key of ARMORY_WEAPON_KEYS) {
  assert.ok(WEAPONS[key], `${key} hangs on the wall with no catalogue entry`);
}
for (const key of Object.keys(WEAPONS)) {
  assert.ok(ARMORY_WEAPON_KEYS.includes(key), `${key} is in the catalogue but on no rack`);
}
assert.equal(USABLE_WEAPON_KEYS.length, 26,
  'the armoury does not offer every usable weapon');
assert.ok(USABLE_WEAPON_KEYS.includes(DEFAULT_WEAPON), 'the default weapon is not usable');
assert.ok(USABLE_WEAPON_KEYS.some((key) => WEAPONS[key].kind === 'melee'),
  'there is no blade in the collection');

const fireVoices = new Set();
const reloadPrints = new Set();
for (const key of USABLE_WEAPON_KEYS) {
  const weapon = WEAPONS[key];
  assert.ok(weapon.name && weapon.family, `${key} has no name or family`);
  assert.ok(weapon.damage > 0, `${key} does no damage`);
  assert.ok(weapon.rpm > 0 && shotInterval(weapon) > 0, `${key} has no rate of fire`);
  assert.ok(weapon.view?.scale > 0 && weapon.view.offset?.length === 3,
    `${key} has no first-person placement`);
  const fire = weapon.audio?.fire;
  assert.ok(fire, `${key} has no firing voice`);
  // Every one of them has to sound like itself. Fingerprinting the whole voice
  // catches a copy-paste that changes the name and nothing you can hear.
  fireVoices.add([fire.bodyHz, fire.bodyEndHz, fire.bodyDecay, fire.crackHz,
    fire.crackQ, fire.crackDecay, fire.tailHz, fire.tailDecay, fire.tailLevel,
    fire.level].join(','));
  const reload = weapon.audio?.reload;
  assert.ok(Array.isArray(reload) && reload.length >= 2,
    `${key} has no reload sequence`);
  for (const click of reload) {
    assert.ok(click.at >= 0 && click.hz > 0 && click.decay > 0,
      `${key} has a malformed reload click`);
  }
  reloadPrints.add(reload.map((c) => `${c.at.toFixed(3)}:${Math.round(c.hz)}`).join('|'));
  if (weapon.kind === 'melee') continue;
  assert.ok(weapon.magazine > 0 && weapon.reserve > 0, `${key} carries no ammunition`);
  assert.ok(weapon.reloadTime > 0, `${key} reloads instantly`);
}
assert.equal(fireVoices.size, USABLE_WEAPON_KEYS.length,
  `only ${fireVoices.size} of ${USABLE_WEAPON_KEYS.length} weapons have their own firing sound`);
assert.equal(reloadPrints.size, USABLE_WEAPON_KEYS.length,
  `only ${reloadPrints.size} of ${USABLE_WEAPON_KEYS.length} weapons have their own reload sound`);

// Ammunition belongs to the weapon, not to the player. Swapping to a revolver
// and back must not silently refill the rifle you half emptied.
const ammoPool = createLoadout();
ammoPool.for('armoryAssault01').magazine = 4;
ammoPool.for('armoryRevolver01').magazine = 1;
assert.equal(ammoPool.for('armoryAssault01').magazine, 4, 'the loadout forgot a part-spent magazine');
assert.equal(ammoPool.for('armoryRevolver01').magazine, 1, 'the loadout mixed two weapons together');
const restored = createLoadout();
restored.restore(ammoPool.snapshot());
assert.equal(restored.for('armoryAssault01').magazine, 4, 'a saved run loses its part-spent magazine');
ammoPool.resupply('armoryAssault01');
assert.equal(ammoPool.for('armoryAssault01').magazine, WEAPONS.armoryAssault01.magazine,
  'resupply does not refill a magazine');

// Everything the collection needs from the rest of the code, checked from the
// source rather than from a browser: the take interaction on every rack slot,
// the swap in the viewmodel, the marks on the wall and a person who goes down.
const armorySource = await readFile(new URL('../src/armory.js', import.meta.url), 'utf8');
assert.ok(/addInteraction\(root, `TAKE \$\{label\}`/.test(armorySource),
  'the armoury does not offer to hand over each racked weapon');
assert.ok(armorySource.includes('downQuartermaster'),
  'the quartermaster cannot be brought down');
const worldSource = await readFile(new URL('../src/world_blender.js', import.meta.url), 'utf8');
const playerCharacterSource = await readFile(
  new URL('../src/player_character.js', import.meta.url), 'utf8');
assert.ok(worldSource.includes('function setWeapon('),
  'the first-person viewmodel cannot swap weapons');
assert.ok(mainSource.includes('createDecalField'), 'shots leave no marks on the world');
assert.ok(mainSource.includes('resolvePersonHit'), 'shooting a person does nothing');
assert.ok(/targetFov = aiming \? \(weapon\?\.zoom \?\?/.test(mainSource),
  'aiming does not use the held weapon\'s optic');
// Aiming is looking through the weapon's own irons, not shoving it at a
// crosshair: the pose is derived from where the sights actually are.
assert.ok(worldSource.includes('function measureSights('),
  'weapons do not report where their sights are');
assert.ok(mainSource.includes('function poseOnSights('),
  'aiming does not align the weapon on its own sight line');
assert.ok(mainSource.includes('game.heldSights?.()'),
  'the aim pose ignores the held weapon\'s sights');
// A weapon climbs. Rotating the view model the other way pointed every barrel
// in the game at the ground on every shot.
assert.ok(/rotateX\(recoil \* \.5 \+ recoilPunch \* \.085\)/.test(mainSource),
  'recoil drives the muzzle down instead of up');
const creatureSource = await readFile(new URL('../src/creatures.js', import.meta.url), 'utf8');
assert.ok(creatureSource.includes('this.groundY - eased * this.dropHeight'),
  'a body dropped on an upper gallery falls through it');

// The playable protagonist is a real skinned model, not a primitive or a
// billboard. The source upload is too expensive for a phone, so the runtime
// asset must retain its humanoid rig while staying inside the mobile budget.
const characterFile = await readFile(new URL(
  '../public/assets/supplied/main_character.glb', import.meta.url));
assert.equal(characterFile.readUInt32LE(0), 0x46546c67, 'main character is not a GLB');
assert.ok(characterFile.length < 5 * 1024 * 1024,
  `main character is not mobile-ready (${(characterFile.length / 1024 / 1024).toFixed(1)} MB)`);
const characterJsonLength = characterFile.readUInt32LE(12);
const characterDocument = JSON.parse(characterFile.subarray(20, 20 + characterJsonLength)
  .toString('utf8').trimEnd());
assert.ok(characterDocument.skins?.[0]?.joints?.length >= 40,
  'main character lost its humanoid skeleton');
const characterBones = new Set((characterDocument.nodes || []).map((node) => node.name));
for (const bone of ['Head', 'Spine01', 'L_Upperarm', 'R_Upperarm', 'L_Thigh', 'R_Thigh']) {
  assert.ok(characterBones.has(bone), `main character is missing ${bone}`);
}
const characterPrimitive = characterDocument.meshes?.[0]?.primitives?.[0];
const characterTriangles = Math.floor(
  characterDocument.accessors?.[characterPrimitive?.indices]?.count / 3);
assert.ok(characterTriangles >= 200000,
  `main character dropped below the high-detail target (${characterTriangles} triangles)`);
assert.ok(characterDocument.extensionsUsed?.includes('EXT_meshopt_compression'),
  'main character geometry is not Meshopt-compressed');
assert.equal(characterDocument.animations?.length, 9,
  `rugged main character lost animations (${characterDocument.animations?.length || 0}/9)`);
for (const [index, animation] of characterDocument.animations.entries()) {
  assert.ok(animation.channels?.length >= 100,
    `rugged main character animation ${index} lost its humanoid tracks`);
}
assert.ok(worldSource.includes('createPlayerCharacter'),
  'the supplied rugged character is not the playable actor');
assert.ok(playerCharacterSource.includes('new THREE.AnimationMixer(model)')
  && playerCharacterSource.includes('PLAYER_ANIMATIONS'),
  'the rugged character does not play its authored animation set');
// Matched without the closing bracket: the solver takes a carry weight now,
// and a test that pins an argument list breaks every time the thing it is
// guarding is improved.
assert.ok(playerCharacterSource.includes("solveArm('R', pose.right, pose.rightPole")
  && playerCharacterSource.includes("solveArm('L', pose.left, pose.leftPole")
  && worldSource.includes("family: family || 'rifle'"),
  'third-person guns are not placed into both animated hands by weapon family');
// The three carry stances, and the blend between them.
for (const marker of ['CARRY_STANCES', 'slungTransform', 'handsTransform', "SLUNG_KIND"]) {
  assert.ok(playerCharacterSource.includes(marker),
    `the character lost its weapon carry stances (${marker})`);
}
assert.ok(mainSource.includes('function updateThirdPersonCamera(')
  && mainSource.includes('function toggleCameraMode('),
  'first/third-person camera switching is missing');
const htmlSource = await readFile(new URL('../index.html', import.meta.url), 'utf8');
assert.ok(htmlSource.includes('id="viewBtn"'), 'mobile has no camera view button');

console.log(`Unit QA passed: ${USABLE_WEAPON_KEYS.length} usable weapons with distinct voices, `
  + `${colliders.boxes.length} boxes + ${colliders.rings.length} rings + `
  + `${colliders.arcs.length} door arcs + ${colliders.orientedBoxes.length} oriented walls, `
  + `walkway clear on all ${SILO.levels + 1} levels, `
  + `${doorwaysTraversed} front doors traversed and ${roomsChecked} rooms reachable, `
  + `${counts.size} unique game events, ${characterTriangles} triangle main character with 9 animations.`);

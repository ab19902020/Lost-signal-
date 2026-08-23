import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as THREE from 'three';
import { CharacterBody, ColliderSet } from '../src/physics.js';
import { buildSilo, SILO } from '../src/silo.js';

// Build the authored collision without loading a renderer or any GLBs. This is
// deliberately runnable anywhere `npm run build` runs, including before a
// browser is installed in CI.
const scene = new THREE.Scene();
const colliders = new ColliderSet();
const silo = buildSilo({
  scene,
  colliders,
  // Stubs stand in for the GLBs; what matters is that every branch of the
  // builder runs, including the ones that only fire when an asset is present.
  assets: {
    habShell: {}, habLevel: {}, habStair: {}, habCrown: {}, habSump: {},
    habApartment: {}, habDoor: {}, habTunnel: {}, habBulkheadDoor: {},
  },
  place: () => new THREE.Group(),
  addInteraction: () => {},
});
assert.ok(silo, 'silo collision did not build');

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

// The floor bridge must stay continuous from the stair edge, over the landing,
// and onto every gallery—including the secure level at the top.
for (let level = 0; level <= SILO.levels; level++) {
  const y = level * SILO.levelHeight;
  for (const radius of [5.55, 7, 9, 11, 12.8, 13.2, 14, 16, 18.5]) {
    const floor = colliders.floorAt(radius, 0, 0.24, y + 0.36);
    assert.ok(floor >= y - 0.03 && floor <= y + 0.34,
      `level ${level}: floor gap at radius ${radius} (floor ${floor})`);
  }
}

// You have to be able to walk the whole ring, on every level. The walkway used
// to be collided as one axis-aligned box per bay, and a box drawn round a slab
// that is wide along the ring and thin through it is metres bigger than the
// slab — better than a third of every walkway was solid to the player and
// invisible on screen, leaving a single walkable lane down the middle.
const PLAYER_RADIUS = 0.34;

// Both long sides of every landing are physical guards, while the 3.6 m centre
// route remains open from the gallery to the stair.
for (let level = 0; level <= SILO.levels; level++) {
  const y = level * SILO.levelHeight;
  for (const radius of [6.0, 9.0, 12.7]) {
    for (const side of [-1, 1]) {
      assert.equal(colliders.contains(radius, -side * SILO.landingHalf, 0.12,
        y + 0.40, y + 1.15), true,
      `level ${level}: landing side ${side} is unguarded at radius ${radius}`);
    }
    assert.equal(colliders.contains(radius, 0, PLAYER_RADIUS,
      y + 0.20, y + 1.70), false,
    `level ${level}: landing centre is blocked at radius ${radius}`);
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
// from the gallery into all 119 homes.
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
    body.teleport(Math.cos(angle) * 18.15, y + .02, Math.sin(angle) * 18.15);
    const desired = new THREE.Vector3(Math.cos(angle) * 2.55, 0, Math.sin(angle) * 2.55);
    for (let frame = 0; frame < 95; frame++) body.step(1 / 60, desired, colliders);
    const reached = Math.hypot(body.position.x, body.position.z);
    assert.ok(reached > SILO.deckOuter + .45,
      `level ${level} bay ${bay}: capsule stopped at r=${reached.toFixed(2)} before entering the home`);
    assert.ok(body.grounded, `level ${level} bay ${bay}: entering the home left the player airborne`);
    doorwaysTraversed++;
  }
}

// Every room beyond those thresholds has to be standable.
// A home is a hall, a kitchen, a living room and two bedrooms behind their own
// portals, and a partition placed a few centimetres wrong seals one of them off
// without anything looking wrong from the walkway.
const ROOMS = [
  ['hall', 0, -4.1], ['kitchen', -2.0, -1.9], ['living', 1.6, -1.0],
  ['bedroom A', -1.7, 3.2], ['bedroom B', 1.7, 3.2],
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

console.log(`Unit QA passed: ${colliders.boxes.length} boxes + ${colliders.rings.length} rings + `
  + `${colliders.arcs.length} door arcs + ${colliders.orientedBoxes.length} oriented walls, `
  + `walkway clear on all ${SILO.levels + 1} levels, `
  + `${doorwaysTraversed} front doors traversed and ${roomsChecked} rooms reachable, `
  + `${counts.size} unique game events.`);

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as THREE from 'three';
import { ColliderSet } from '../src/physics.js';
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
  assets: { habShell: {}, habLevel: {}, habStair: {}, habCrown: {}, habSump: {} },
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

console.log(`Unit QA passed: ${colliders.boxes.length} boxes + ${colliders.rings.length} rings, `
  + `walkway clear on all ${SILO.levels + 1} levels, ${counts.size} unique game events.`);

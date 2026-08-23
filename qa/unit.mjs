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
  assets: { habShell: {}, habLevel: {}, habStair: {} },
  place: () => new THREE.Group(),
  addInteraction: () => {},
});
assert.ok(silo, 'silo collision did not build');

const solidAt = (x, y, z) => colliders.boxes.some(({ box, climbable }) =>
  !climbable && x >= box.min.x && x <= box.max.x &&
  y >= box.min.y && y <= box.max.y && z >= box.min.z && z <= box.max.z);

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

console.log(`Unit QA passed: ${colliders.boxes.length} silo colliders, ${counts.size} unique game events.`);

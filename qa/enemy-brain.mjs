// The two attackers, put through a yard with things in it.
//
// The complaint was specific and it was fair: they ran into things and stopped,
// and they did the same thing every game. Both are testable. Getting stuck is
// "went nowhere for a while with somewhere to be"; sameness is "ran the same
// plan and took the same path from the same start".
import assert from 'assert';
import { readFile } from 'fs/promises';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { ColliderSet } from '../src/physics.js';
import { createTownEnemies } from '../src/town_enemies.js';
import { createNavigator } from '../src/navigation.js';

// three's loader reaches for browser globals when a GLB carries textures.
globalThis.self = globalThis;
globalThis.createImageBitmap = async () => ({ width: 1, height: 1, close() {} });

await MeshoptDecoder.ready;
const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);
async function loadGLB(relative) {
  const bytes = await readFile(new URL(relative, import.meta.url));
  const data = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  return new Promise((resolve, reject) => loader.parse(data, '', resolve, reject));
}
const assets = {
  enemyOldManBlack: await loadGLB('../public/assets/supplied/enemy_old_man_black.glb'),
  enemyOldManRed: await loadGLB('../public/assets/supplied/enemy_old_man_red.glb'),
};

// A yard worth getting stuck in: a wall across the direct line with one gap in
// it, a couple of blocks past that, and the objective on the far side. The old
// cover-graph planner could not solve this at all unless somebody had placed a
// waypoint in the gap.
function buildYard() {
  const colliders = new ColliderSet();
  const wall = (minX, maxX, minZ, maxZ) => colliders.addBox(new THREE.Box3(
    new THREE.Vector3(minX, 0, minZ), new THREE.Vector3(maxX, 2.4, maxZ)));
  wall(-9, -1.2, -2, -1.4);
  wall(1.2, 9, -2, -1.4);       // the gap is the 2.4 m between them
  wall(-3.4, -1.8, -7, -6.4);
  wall(2.0, 4.2, -6, -5.4);
  wall(-1.0, 0.6, -10.5, -9.9);
  return colliders;
}

// The navigator on its own: it has to find the gap.
{
  const colliders = buildYard();
  const navigator = createNavigator({ colliders });
  const route = navigator.path(new THREE.Vector3(0, 0, 6), new THREE.Vector3(0, 0, -12));
  assert.ok(route && route.length, 'the navigator could not find the gap in the wall');
  const end = route[route.length - 1];
  assert.ok(Math.hypot(end.x - 0, end.z + 12) < 1.2,
    `the route stopped ${Math.hypot(end.x, end.z + 12).toFixed(2)} m short of the goal`);
  for (const point of route) {
    const floor = colliders.floorAt(point.x, point.z, 0.36, 40);
    assert.ok(!colliders.contains(point.x, point.z, 0.36, floor + 0.18, floor + 1.62),
      `the route runs through a wall at ${point.x.toFixed(1)}, ${point.z.toFixed(1)}`);
  }
  // And it refuses rather than inventing a way through a sealed box.
  const sealed = new ColliderSet();
  sealed.addBox(new THREE.Box3(new THREE.Vector3(-40, 0, -6), new THREE.Vector3(40, 3, -5)));
  const blocked = createNavigator({ colliders: sealed })
    .path(new THREE.Vector3(0, 0, 4), new THREE.Vector3(0, 0, -20), { maxExpansions: 900 });
  assert.equal(blocked, null, 'the navigator claimed a route through a sealed wall');
}

function runSiege(seed, { frames = 60 * 40, player = new THREE.Vector3(40, 0, 40) } = {}) {
  const scene = new THREE.Scene();
  const colliders = buildYard();
  let gateOpen = false;
  let gateIntegrity = 60;
  let siloIntegrity = 60;
  const enemies = createTownEnemies({
    scene, colliders, assets, seed,
    mission: {
      gateTarget: new THREE.Vector3(0, 0, -1.7),
      siloTarget: new THREE.Vector3(0, 0, -12),
      gateIsPassable: () => gateOpen,
      damageGate: (damage) => {
        gateIntegrity = Math.max(0, gateIntegrity - damage);
        gateOpen ||= gateIntegrity <= 0;
        return gateOpen;
      },
      damageSilo: (damage) => {
        siloIntegrity = Math.max(0, siloIntegrity - damage);
        return siloIntegrity <= 0;
      },
    },
    entries: [
      {
        asset: 'enemyOldManBlack', style: 'black', name: 'Black',
        position: [-6, 0, 9], heading: 0, patrol: [[-6, 9]],
        cover: [[-7, 2], [7, 2], [7, -9], [-7, -9]],
        assaultRoute: [[0, 7], [0, 3], [0, -0.6]], yardRoute: [[0, -4], [0, -9]],
      },
      {
        asset: 'enemyOldManRed', style: 'red', name: 'Red',
        position: [6, 0, 9], heading: 0, patrol: [[6, 9]],
        cover: [[-7, 2], [7, 2], [7, -9], [-7, -9]],
        assaultRoute: [[0, 7], [0, 3], [0, -0.6]], yardRoute: [[0, -4], [0, -9]],
      },
    ],
  });

  const trails = new Map(enemies.agents.map((agent) => [agent.root.name, []]));
  const wedged = new Map(enemies.agents.map((agent) => [agent.root.name, 0]));
  const previous = new Map(enemies.agents.map((agent) =>
    [agent.root.name, agent.root.position.clone()]));
  const still = new Map(enemies.agents.map((agent) => [agent.root.name, 0]));

  for (let frame = 0; frame < frames; frame++) {
    enemies.update(1 / 60, player, true);
    for (const agent of enemies.agents) {
      const name = agent.root.name;
      const moved = agent.root.position.distanceTo(previous.get(name));
      previous.set(name, agent.root.position.clone());
      // Standing still on purpose (bounding, watching, striking a door) is
      // fine. Standing still while trying to walk somewhere is the bug.
      // Standing still on purpose - a bound, a standoff, striking a door - is
      // a decision. Standing still while trying to walk somewhere is the bug.
      const trying = !!(agent.target || agent.destination) && !agent.holding
        && agent.state !== 'breach_gate'
        && agent.state !== 'breach_silo' && agent.state !== 'silo_breached';
      still.set(name, moved < 0.0015 && trying ? still.get(name) + 1 / 60 : 0);
      wedged.set(name, Math.max(wedged.get(name), still.get(name)));
      if (frame % 12 === 0) trails.get(name).push(agent.root.position.clone());
    }
  }
  return { enemies, trails, wedged, gateOpen, siloIntegrity };
}

// Nobody spends their afternoon against a wall.
for (const seed of [1, 2, 3, 4, 5, 6]) {
  const { enemies, wedged } = runSiege(seed);
  for (const agent of enemies.agents) {
    const stuck = wedged.get(agent.root.name);
    assert.ok(stuck < 2.0,
      `seed ${seed}: ${agent.root.name} (${agent.plan.key}) spent ${stuck.toFixed(1)} s `
      + `going nowhere while trying to move`);
  }
}

// They get in. Different plans take different times, so the assertion is that
// the siege resolves, not that it resolves on a particular frame.
{
  const arrivals = [];
  for (const seed of [11, 12, 13, 14]) {
    const { enemies } = runSiege(seed, { frames: 60 * 90 });
    const reached = enemies.agents.filter((agent) =>
      ['breach_silo', 'silo_breached'].includes(agent.state)).length;
    arrivals.push(reached);
  }
  assert.ok(arrivals.some((count) => count > 0),
    `no attacker reached the silo door in any run (${arrivals.join(', ')})`);
}

// And it is a different afternoon each time. Same start, same yard, same
// objective - the plans and the paths have to differ.
{
  const plans = new Set();
  const shapes = new Set();
  for (const seed of [21, 22, 23, 24, 25, 26, 27, 28]) {
    const { enemies, trails } = runSiege(seed, { frames: 60 * 18 });
    plans.add(enemies.plans().map((entry) => entry.plan).join('+'));
    for (const [, trail] of trails) {
      shapes.add(trail.map((point) => `${point.x.toFixed(0)},${point.z.toFixed(0)}`).join('|'));
    }
  }
  assert.ok(plans.size >= 4,
    `eight runs produced only ${plans.size} plan pairings: the siege is still on rails`);
  assert.ok(shapes.size >= 8,
    `eight runs produced only ${shapes.size} distinct paths`);
}

// The same seed twice is the same siege, or none of the above means anything.
{
  const a = runSiege(99, { frames: 60 * 12 });
  const b = runSiege(99, { frames: 60 * 12 });
  assert.deepEqual(a.enemies.plans(), b.enemies.plans(), 'a seeded siege is not repeatable');
}

console.log('Enemy brain QA passed: routes around obstacles, never wedges, '
  + 'varies its plan and its path run to run, and repeats exactly when seeded.');

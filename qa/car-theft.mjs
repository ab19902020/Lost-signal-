// The two men take the car, and the player takes it back.
//
// This is a sequence with a lot of joints in it - approach, gate, doors,
// boarding, driving, being shot at, being recovered - and every joint is
// somewhere it can stall. The test drives the whole thing in a bare world so
// each stage has to actually be reached rather than assumed.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { ColliderSet } from '../src/physics.js';
import { createTownEnemies } from '../src/town_enemies.js';
import { createVehicle } from '../src/vehicle.js';
import { createCarThief } from '../src/car_thief.js';
import { cloneGLTF } from '../src/assets.js';

globalThis.self = globalThis;
globalThis.createImageBitmap = async () => ({ width: 1, height: 1, close() {} });
await MeshoptDecoder.ready;
const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);
const load = async (relative) => {
  const bytes = await readFile(new URL(relative, import.meta.url));
  const data = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  return new Promise((resolve, reject) => loader.parse(data, '', resolve, reject));
};
const assets = {
  enemyOldManBlack: await load('../public/assets/supplied/enemy_old_man_black.glb'),
  enemyOldManRed: await load('../public/assets/supplied/enemy_old_man_red.glb'),
  carDrivable: await load('../public/assets/supplied/ford_escort_rs_turbo.glb'),
};

function buildScene(seed) {
  const scene = new THREE.Scene();
  const colliders = new ColliderSet();
  const place = (gltf, parent, position, rotation) => {
    const root = cloneGLTF(gltf);
    root.position.set(...position);
    root.rotation.set(...rotation);
    parent.add(root);
    return root;
  };
  const car = createVehicle({
    scene, colliders, assets, place,
    position: [5, 0, -9], heading: Math.PI, name: 'Escort', label: 'ESCORT',
  });
  assert.ok(car, 'the vehicle did not build');

  const theft = { aboard: new Set(), stolen: false, escaped: false, driver: null, thief: null };
  const seat = (role) => new THREE.Vector3(role === 'driver' ? 0.4 : -0.4, 0.55, -0.28)
    .applyAxisAngle(new THREE.Vector3(0, 1, 0), car.state.heading)
    .add(new THREE.Vector3(car.state.x, car.state.y, car.state.z));

  let enemies = null;
  const mission = {
    gateTarget: new THREE.Vector3(0, 0, 6),
    gateIsPassable: () => true,
    boardingPoint: (role) => car.boardingPoint(role),
    seatPosition: (agent) => seat(agent.role),
    readyToDrive: (agent) => (enemies?.agents || []).filter((o) => o !== agent)
      .every((o) => o.dead || o.state === 'boarding' || o.state === 'riding'),
    board: (agent) => {
      theft.aboard.add(agent.root.name);
      if (agent.role === 'driver') theft.driver = agent;
      const living = (enemies?.agents || []).filter((o) => !o.dead);
      if (living.every((o) => theft.aboard.has(o.root.name)) && !theft.stolen) {
        theft.stolen = true;
        car.occupied = true;
        theft.thief = createCarThief({
          vehicle: car,
          route: [[0, 10], [0, 40], [0, 110], [0, 200], [0, 320]],
        });
      }
      return true;
    },
    driverDown: (agent) => {
      if (theft.driver === agent) { theft.driver = null; theft.thief?.halt(); }
      const heir = (enemies?.agents || []).find((o) => !o.dead && o !== agent);
      if (heir) heir.role = 'driver';
    },
  };

  enemies = createTownEnemies({
    scene, colliders, assets, seed, mission,
    entries: [
      { asset: 'enemyOldManBlack', style: 'black', name: 'Black',
        position: [-3, 0, 26], heading: 0, patrol: [[-3, 26]], cover: [[-8, 20], [8, 20]],
        assaultRoute: [[0, 20], [0, 12]], yardRoute: [[0, 0]] },
      { asset: 'enemyOldManRed', style: 'red', name: 'Red',
        position: [3, 0, 26], heading: 0, patrol: [[3, 26]], cover: [[-8, 20], [8, 20]],
        assaultRoute: [[0, 20], [0, 12]], yardRoute: [[0, 0]] },
    ],
  });
  return { scene, colliders, car, theft, enemies };
}

function run(seed, { seconds = 70, killDriverAt = null } = {}) {
  const world = buildScene(seed);
  const player = new THREE.Vector3(60, 0, 60);
  const states = new Map(world.enemies.agents.map((a) => [a.root.name, new Set()]));
  let killed = false;
  let fastest = 0;
  for (let frame = 0; frame < 60 * seconds; frame++) {
    world.enemies.update(1 / 60, player, true);
    if (world.theft.stolen && world.theft.thief) {
      world.car.update(1 / 60, world.theft.thief.update(1 / 60));
    } else {
      world.car.update(1 / 60, { throttle: 0, steer: 0 });
    }
    if (killDriverAt !== null && !killed && world.theft.stolen
      && Math.abs(world.car.state.z) > killDriverAt) {
      killed = true;
      world.enemies.down(world.theft.driver.root);
    }
    for (const agent of world.enemies.agents) states.get(agent.root.name).add(agent.state);
    if (world.theft.stolen) fastest = Math.max(fastest, Math.abs(world.car.state.speed));
  }
  if (process.env.THEFT_DEBUG) {
    console.error('debug', JSON.stringify({
      stolen: world.theft.stolen, aboard: [...world.theft.aboard],
      speed: +world.car.state.speed.toFixed(2), occupied: world.car.state.occupied,
      pos: [+world.car.state.x.toFixed(1), +world.car.state.z.toFixed(1)],
      remaining: world.theft.thief?.remaining ?? null,
      states: [...states].map(([n, set]) => `${n}:${[...set].join('/')}`),
    }));
  }
  return { ...world, states, fastest,
    travelled: Math.hypot(world.car.state.x, world.car.state.z) };
}

// They take it, and they take it together.
{
  const result = run(7);
  const roles = result.enemies.agents.map((a) => a.role).sort();
  assert.deepEqual(roles, ['driver', 'passenger'], `roles were ${roles.join(', ')}`);
  for (const agent of result.enemies.agents) {
    const seen = states => [...states].join(' -> ');
    assert.ok(result.states.get(agent.root.name).has('to_car'),
      `${agent.root.name} never went for the car: ${seen(result.states.get(agent.root.name))}`);
    assert.equal(agent.state, 'riding',
      `${agent.root.name} ended ${agent.state} rather than in the car`);
    assert.equal(agent.model.visible, false, `${agent.root.name} is still standing in the yard`);
  }
  assert.ok(result.theft.stolen, 'nobody drove it away');
  assert.ok(result.travelled > 60,
    `the stolen car only got ${result.travelled.toFixed(0)} m from the compound`);
  // It gets up to a road speed at some point in the getaway; where it ends up
  // depends on how long the route is, and this one runs out.
  assert.ok(result.fastest > 12,
    `the getaway never got above ${result.fastest.toFixed(1)} m/s`);
}

// Shoot the driver and it stops. This is the player's answer to the theft, so
// it has to work.
{
  const result = run(7, { killDriverAt: 45, seconds: 80 });
  assert.ok(result.theft.stolen, 'the car was never stolen, so the driver was never shot');
  assert.ok(Math.abs(result.car.state.speed) < 1.2,
    `the car kept going at ${result.car.state.speed.toFixed(1)} m/s with its driver shot`);
}

// Kill one before they reach the car and the other still takes it: the plan
// does not depend on one particular man surviving.
{
  const world = buildScene(3);
  const player = new THREE.Vector3(60, 0, 60);
  let downed = false;
  for (let frame = 0; frame < 60 * 70; frame++) {
    world.enemies.update(1 / 60, player, true);
    if (world.theft.stolen && world.theft.thief) {
      world.car.update(1 / 60, world.theft.thief.update(1 / 60));
    } else {
      world.car.update(1 / 60, { throttle: 0, steer: 0 });
    }
    if (!downed && frame > 60 * 3) {
      downed = true;
      world.enemies.down(world.enemies.agents[0].root);
    }
  }
  assert.ok(world.theft.stolen, 'killing one of them stopped the other taking the car');
  assert.equal(world.enemies.agents[1].state, 'riding',
    `the survivor ended ${world.enemies.agents[1].state}`);
}

// The driver on its own: it follows a route rather than driving into things.
{
  const world = buildScene(1);
  // Somebody is in it: a car with nobody in it keeps its own hull on the
  // collision set and cannot drive through the box that represents it.
  world.car.occupied = true;
  const thief = createCarThief({
    vehicle: world.car,
    route: [[0, 10], [30, 60], [0, 120], [-30, 180], [0, 240]],
  });
  for (let frame = 0; frame < 60 * 45; frame++) {
    world.car.update(1 / 60, thief.update(1 / 60));
  }
  assert.ok(thief.done || Math.hypot(world.car.state.x, world.car.state.z - 240) < 25,
    `the driver finished ${Math.hypot(world.car.state.x, world.car.state.z - 240).toFixed(0)} m `
    + `from the end of a route with two bends in it`);
}

console.log('Car theft QA passed: both men board, one drives, the getaway runs, '
  + 'shooting the driver stops it, and losing one of them does not stop the other.');

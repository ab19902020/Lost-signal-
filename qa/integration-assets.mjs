import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { ColliderSet } from '../src/physics.js';
import { createTownEnemies } from '../src/town_enemies.js';
import { cloneGLTF } from '../src/assets.js';
import { createAircraft } from '../src/aircraft.js';
import {
  GUN_SAMPLE_URLS,
  fireSampleForWeapon,
  reloadSamplesForWeapon,
} from '../src/gun_samples.js';
import { createVehicle, VEHICLE_SPEC } from '../src/vehicle.js';

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

const enemyAssets = {};
for (const [key, label, path] of [
  ['enemyOldManBlack', 'black town enemy', '../public/assets/supplied/enemy_old_man_black.glb'],
  ['enemyOldManRed', 'red town enemy', '../public/assets/supplied/enemy_old_man_red.glb'],
]) {
  const gltf = await loadGLB(path);
  enemyAssets[key] = gltf;
  assert.equal(gltf.animations.length, 9, `${label} does not expose all nine animations`);
  assert.ok(gltf.animations.every((clip) => clip.duration > 0 && clip.tracks.length >= 30),
    `${label} has an empty animation clip`);
  let skinned = null;
  gltf.scene.traverse((part) => { if (part.isSkinnedMesh) skinned = part; });
  assert.ok(skinned?.skeleton?.bones?.length >= 35, `${label} is not attached to its humanoid rig`);
}

// Drive both real mixers through stand, patrol, perception, cover and the red
// character's genuine melee. This catches an asset that merely contains clips
// but cannot bind or move at runtime.
const enemyAttacks = [];
globalThis.window = { dispatchEvent: (event) => {
  if (event?.type === 'lostsignal:enemyattack') enemyAttacks.push(event.detail?.enemy?.name);
} };
globalThis.CustomEvent ||= class CustomEvent { constructor(type, init) {
  this.type = type; this.detail = init?.detail;
} };
const enemyScene = new THREE.Scene();
const enemyColliders = new ColliderSet();
const enemies = createTownEnemies({
  scene: enemyScene,
  colliders: enemyColliders,
  assets: enemyAssets,
  entries: [
    { asset: 'enemyOldManBlack', style: 'black', name: 'Black_Test',
      position: [0, 0, 0], heading: 0, patrol: [[0, -3], [2, -3]],
      cover: [[-4, -4], [4, -4], [4, 4], [-4, 4]] },
    { asset: 'enemyOldManRed', style: 'red', name: 'Red_Test',
      position: [4, 0, 0], heading: 0, patrol: [[4, -3], [6, -3]],
      cover: [[-4, -4], [4, -4], [4, 4], [-4, 4]] },
  ],
});
assert.equal(enemies.agents.length, 2);
for (const agent of enemies.agents) {
  const expected = agent.style === 'black'
    ? ['laugh', 'flee', 'dance', 'foldArms', 'stairsUp', 'clap', 'fall', 'turn',
      'run', 'walk', 'melee', 'stand']
    : ['climb', 'run', 'walk', 'turn', 'gesture', 'fall', 'dance', 'melee', 'jump', 'stand'];
  assert.deepEqual(new Set(Object.keys(agent.actions)), new Set(expected),
    `${agent.root.name} did not map its complete nine-clip bank`);
  assert.equal(agent.hitVolumes.length, 3,
    `${agent.root.name} does not use mobile ballistics hit volumes`);
  for (const name of expected) {
    const clip = agent.clips[name];
    assert.ok(clip?.duration > 0 && clip.tracks.length >= 30,
      `${agent.root.name} ${name} is not a usable skeletal clip`);
    agent.play(name, 1, 0);
    agent.mixer.update(Math.min(.05, clip.duration / 4));
    assert.ok(agent.currentAction.time > 0,
      `${agent.root.name} ${name} did not advance through its mixer`);
  }
  agent.play('stand', 1, 0);
}
for (let frame = 0; frame < 60; frame++) {
  enemies.update(1 / 60, new THREE.Vector3(100, 0, 100), true);
}
assert.ok(enemies.agents.every((agent) => agent.root.position.z < -0.3),
  'town enemy walk clips played but the agents did not patrol');
for (const agent of enemies.agents) {
  const nearbyPlayer = agent.root.position.clone().add(new THREE.Vector3(4, 0, 0));
  for (let frame = 0; frame < 30; frame++) enemies.update(1 / 60, nearbyPlayer, true);
  assert.ok(['flee', 'run'].includes(agent.current),
    `${agent.root.name} did not select a locomotion clip under threat (${agent.current})`);
  assert.ok(['evade', 'seek_cover', 'hide', 'observe'].includes(agent.state),
    `${agent.root.name} did not make a cover decision (${agent.state})`);
  assert.ok(!['dance', 'laugh', 'clap', 'foldArms', 'gesture'].includes(agent.current),
    `${agent.root.name} used a staged performance as normal AI (${agent.current})`);
}

const blackAgent = enemies.agents.find((agent) => agent.style === 'black');
const redAgent = enemies.agents.find((agent) => agent.style === 'red');
for (let frame = 0; frame < 45; frame++) {
  const player = redAgent.root.position.clone().add(new THREE.Vector3(.55, 0, 0));
  enemies.update(1 / 60, player, true);
}
assert.equal(redAgent.current, 'melee', 'the cornered red enemy did not use its real melee clip');
assert.ok(enemyAttacks.includes(redAgent.root.name), 'the red enemy brain never dispatched its melee hit');
assert.notEqual(blackAgent.current, 'clap', 'the black enemy still treats clapping as an attack');

// Characters outside the simulation bubble must remain exactly at their
// authored spawn. Activating one may start its brain, but may not jump it to a
// route destination or advance an invisible performance sequence.
const dormantScene = new THREE.Scene();
const dormantGame = createTownEnemies({
  scene: dormantScene,
  colliders: new ColliderSet(),
  assets: enemyAssets,
  entries: [{
    asset: 'enemyOldManBlack', style: 'black', name: 'Black_Dormant_Test',
    position: [0, 0, 0], heading: 0, patrol: [[0, -3], [2, -3]],
    cover: [[-4, -4], [4, -4], [4, 4], [-4, 4]],
  }],
});
const dormantAgent = dormantGame.agents[0];
const authoredSpawn = dormantAgent.root.position.clone();
for (let frame = 0; frame < 60 * 5; frame++) {
  dormantGame.update(1 / 60, new THREE.Vector3(500, 0, 500), true);
}
assert.ok(dormantAgent.root.position.equals(authoredSpawn),
  'a distant town enemy advanced invisibly before activation');
assert.equal(dormantAgent.model.visible, false,
  'a distant dormant town enemy was rendered');
dormantGame.update(1 / 60, new THREE.Vector3(184, 0, 0), true);
assert.ok(dormantAgent.root.position.distanceTo(authoredSpawn) <= 0.08,
  'a town enemy teleported when entering its activation range');
assert.ok(!['dance', 'laugh', 'clap', 'foldArms', 'gesture'].includes(dormantAgent.current),
  `a town enemy activated into a staged performance (${dormantAgent.current})`);

// Put a building directly between an alerted old man and his best hiding
// point. He must take the clear perimeter route instead of running into the
// wall, giving up, and pretending to hide in plain sight.
const hideScene = new THREE.Scene();
const hideColliders = new ColliderSet();
hideColliders.addBox(new THREE.Box3(
  new THREE.Vector3(-1, 0, -2), new THREE.Vector3(1, 3, 2),
));
const hideGame = createTownEnemies({
  scene: hideScene,
  colliders: hideColliders,
  assets: enemyAssets,
  navigationObstacles: [new THREE.Box3(
    new THREE.Vector3(-1, 0, -2), new THREE.Vector3(1, 3, 2),
  )],
  entries: [{
    asset: 'enemyOldManBlack', style: 'black', name: 'Black_Hide_Route',
    position: [3, 0, 0], heading: 0,
    patrol: [[3, -3], [3, 3]],
    cover: [[-2.2, -3], [2.2, -3], [2.2, 3], [-2.2, 3],
      [0, -3], [2.2, 0], [0, 3], [-2.2, 0]],
  }],
});
const hidePlayer = new THREE.Vector3(6, 0, 0);
let sawConcealedState = false;
let detour = 0;
let stagedBrainAction = null;
for (let frame = 0; frame < 60 * 12; frame++) {
  hideGame.update(1 / 60, hidePlayer, true);
  const agent = hideGame.agents[0];
  sawConcealedState ||= agent.state === 'hide';
  detour = Math.max(detour, Math.abs(agent.root.position.z));
  if (['dance', 'laugh', 'clap', 'foldArms', 'gesture'].includes(agent.current)) {
    stagedBrainAction = agent.current;
  }
}
assert.equal(sawConcealedState, true,
  'an alerted town enemy never reached a hiding place behind the test building');
assert.ok(detour > 2.25,
  `the hiding enemy did not route around the building (detour ${detour.toFixed(2)} m)`);
assert.equal(stagedBrainAction, null,
  `the hiding brain selected staged animation ${stagedBrainAction}`);

// The game entries use a different brain from the legacy cover sandbox above:
// leave town, take a route around the uploaded building, breach the perimeter,
// cross the yard and attack the silo. Exercise that complete state machine in
// a compact test arena so a regression cannot turn it back into random patrol.
const siegeScene = new THREE.Scene();
const siegeColliders = new ColliderSet();
const siegeBuilding = new THREE.Box3(
  new THREE.Vector3(-1, 0, -1), new THREE.Vector3(1, 3, 3),
);
siegeColliders.addBox(siegeBuilding.clone());
let testGateIntegrity = 22;
let testSiloIntegrity = 14;
let testGateOpen = false;
const siege = createTownEnemies({
  scene: siegeScene,
  colliders: siegeColliders,
  assets: enemyAssets,
  navigationObstacles: [siegeBuilding],
  mission: {
    gateTarget: new THREE.Vector3(0, 0, -6.8),
    siloTarget: new THREE.Vector3(0, 0, -11),
    gateIsPassable: () => testGateOpen,
    damageGate: (damage) => {
      testGateIntegrity = Math.max(0, testGateIntegrity - damage);
      testGateOpen ||= testGateIntegrity <= 0;
      return testGateOpen;
    },
    damageSilo: (damage) => {
      testSiloIntegrity = Math.max(0, testSiloIntegrity - damage);
      return testSiloIntegrity <= 0;
    },
  },
  entries: [{
    asset: 'enemyOldManBlack', style: 'black', name: 'Black_Siege_Test',
    position: [3, 0, 3], heading: 0,
    patrol: [[3, 0]],
    cover: [[-2.2, -2], [2.2, -2], [2.2, 4], [-2.2, 4]],
    assaultRoute: [[0, -3], [0, -6]],
    yardRoute: [[0, -9]],
  }],
});
const siegeStates = new Set();
let siegeStagedAction = null;
for (let frame = 0; frame < 60 * 18; frame++) {
  siege.update(1 / 60, new THREE.Vector3(30, 0, 30), true);
  const agent = siege.agents[0];
  siegeStates.add(agent.state);
  if (['dance', 'laugh', 'clap', 'foldArms', 'gesture'].includes(agent.current)) {
    siegeStagedAction = agent.current;
  }
}
const siegeAgent = siege.agents[0];
assert.equal(siegeAgent.state, 'silo_breached',
  `silo assault stalled in ${siegeAgent.state}`);
assert.ok(['breach_gate', 'assault_yard', 'breach_silo'].every((state) => siegeStates.has(state)),
  `silo assault skipped mission states: ${[...siegeStates].join(', ')}`);
assert.ok(siegeAgent.breachHits >= 4, 'attacker never struck the gate and silo door');
assert.equal(siegeStagedAction, null,
  `silo attacker selected staged animation ${siegeStagedAction}`);
assert.ok(siegeAgent.maxFrameTravel < .08,
  `visible silo attacker teleported ${siegeAgent.maxFrameTravel.toFixed(3)} m in one frame`);
for (const agent of enemies.agents) {
  assert.ok(agent.maxFrameTravel <= 0.08,
    `${agent.root.name} teleported ${agent.maxFrameTravel.toFixed(3)} m in one frame while ${agent.maxFrameTravelState}: ${JSON.stringify(agent.maxFrameTravelDebug)}`);
}

for (const agent of enemies.agents) assert.equal(enemies.down(agent.root), true);
for (let frame = 0; frame < 60 * 4; frame++) {
  enemies.update(1 / 60, new THREE.Vector3(0, 0, 0), true);
}
for (const agent of enemies.agents) {
  const box = new THREE.Box3().setFromObject(agent.root, true);
  const size = box.getSize(new THREE.Vector3());
  assert.equal(agent.deathSettled, true, `${agent.root.name} never settled after its fall`);
  assert.ok(size.y < 1.0, `${agent.root.name} corpse remained ${size.y.toFixed(2)} m tall`);
  assert.ok(Math.abs(box.min.y - .025) < .08,
    `${agent.root.name} corpse floats/sinks at y=${box.min.y.toFixed(2)}`);
}

const staticAssets = {};
for (const [key, label, path] of [
  ['rafAircraft', 'RAF aircraft', '../public/assets/supplied/raf_aircraft.glb'],
  ['townBuildingRuin', 'blown-out house', '../public/assets/supplied/town_building_brick.glb'],
  ['townBuildingClinic', 'abandoned clinic', '../public/assets/supplied/town_building_redbrick.glb'],
]) {
  const gltf = await loadGLB(path);
  staticAssets[key] = gltf;
  let meshes = 0;
  gltf.scene.traverse((part) => { if (part.isMesh) meshes++; });
  assert.ok(meshes > 0, `${label} contains no renderable mesh`);
}
const worldSource = await readFile(new URL('../src/world_blender.js', import.meta.url), 'utf8');
assert.equal((worldSource.match(/placeTownBuilding\(assets\./g) || []).length, 2,
  'the road end must contain exactly the clinic and ruined house');
assert.ok(!worldSource.includes('assets.distantTown'),
  'the old procedural block town is still spawned');
assert.ok(worldSource.includes('addBallisticProxy(root, name)'),
  'the uploaded building scans still take full triangle raycasts');
assert.ok(worldSource.includes("root.userData.collisionKind = 'oriented-perimeter'"),
  'the rotated town scans still create oversized invisible AABB barriers');
assert.ok(worldSource.includes('assaultRoute: assaultRoad(')
  && worldSource.includes('damageGate') && worldSource.includes('damageSilo'),
  'the two old men are not assigned the road-to-silo assault mission');
const escortSpawn = worldSource.match(/position:\s*\[([\d.-]+),\s*([\d.-]+),\s*([\d.-]+)\],\s*heading:\s*Math\.PI,\s*\n\s*name:\s*'Ford_Escort_RS_Turbo'/);
assert.ok(escortSpawn, 'the supplied Ford Escort is not spawned in the town world');
const escortPosition = new THREE.Vector3(...escortSpawn.slice(1).map(Number));
const outsideSiloSpawn = new THREE.Vector3(0, 0, -12.15);
assert.ok(escortPosition.distanceTo(outsideSiloSpawn) < 7,
  `the Ford Escort is ${escortPosition.distanceTo(outsideSiloSpawn).toFixed(1)} m from the silo exit instead of immediately outside`);

const car = await loadGLB('../public/assets/supplied/ford_escort_rs_turbo.glb');
for (const name of [
  'Car_SteeringWheel', 'Car_Wheel_LF', 'Car_Wheel_RF', 'Car_Wheel_LR', 'Car_Wheel_RR',
]) {
  assert.ok(car.scene.getObjectByName(name), `uploaded Ford rig is missing ${name}`);
}
const carBounds = new THREE.Box3().setFromObject(car.scene, true);
const carSize = carBounds.getSize(new THREE.Vector3());
// A published Escort RS Turbo is 4.05 m long, 1.64 m wide and 1.39 m tall. The
// rig used to force the scan onto a fixed box with three different axis
// scales, which hit the nominal length by shearing the car — and every wheel
// with it, into a 5% ellipse. The correction is derived from the wheels being
// round, so the dimensions now have to land on the real car, not on the box.
assert.ok(carSize.x > 1.7 && carSize.x < 1.8,
  `uploaded Ford width is wrong (${carSize.x.toFixed(2)} m)`);
assert.ok(carSize.z > 4.0 && carSize.z < 4.15,
  `uploaded Ford length is wrong (${carSize.z.toFixed(2)} m)`);
assert.ok(carSize.y > 1.36 && carSize.y < 1.45,
  `uploaded Ford height is wrong (${carSize.y.toFixed(2)} m)`);
let carTriangles = 0;
car.scene.traverse((part) => {
  if (!part.isMesh) return;
  carTriangles += (part.geometry.index?.count || part.geometry.attributes.position.count) / 3;
});
// The upper bound carries the seam repair: decimating the 1.95-million-triangle
// upload tore 40,657 open edges into the body, and closing those holes costs
// about 60,000 patch triangles. Re-rigging from the original scan with a
// seam-aware decimation is what brings this back down.
assert.ok(carTriangles > 230_000 && carTriangles < 320_000,
  `uploaded Ford rig missed its mobile detail budget (${Math.round(carTriangles)} triangles)`);
assert.equal(VEHICLE_SPEC.drivenAxle, 'front');
assert.equal(VEHICLE_SPEC.make, 'Ford');
assert.match(VEHICLE_SPEC.model, /Escort RS Turbo/);
assert.equal(VEHICLE_SPEC.gears.length, 5);
assert.ok(VEHICLE_SPEC.topSpeed >= 55, 'RS Turbo tune cannot reach its intended top speed');

const placeAsset = (asset, parent, position, rotation, scale) => {
  const root = cloneGLTF(asset);
  root.position.set(...position);
  root.rotation.set(...rotation);
  root.scale.setScalar(scale);
  parent.add(root);
  return root;
};

// Exercise the real car model and controller, including the visible linkage.
const carScene = new THREE.Scene();
const testCar = createVehicle({
  scene: carScene,
  colliders: new ColliderSet(),
  assets: { carDrivable: car },
  place: placeAsset,
});
let escortMaterial = null;
testCar.root.traverse((part) => {
  const materials = Array.isArray(part.material) ? part.material : [part.material];
  escortMaterial ||= materials.find((material) =>
    material?.name === 'Ford_Escort_Supplied_PBR') || null;
});
assert.ok(escortMaterial?.map && escortMaterial?.normalMap && escortMaterial?.roughnessMap,
  'the uploaded Ford did not retain its supplied base-colour/normal/PBR maps');
const wheelNames = ['LF', 'RF', 'LR', 'RR'];
for (const tag of wheelNames) {
  const wheel = testCar.root.getObjectByName(`Car_Wheel_${tag}`);
  assert.ok(Math.abs(wheel.rotation.y) < 1e-6,
    `${tag} wheel is not straight when parked`);
}
const steeringWheel = testCar.root.getObjectByName('Car_SteeringWheel');
const steeringWheelRest = steeringWheel.rotation.z;
testCar.occupied = true;
for (let frame = 0; frame < 60; frame++) {
  testCar.update(1 / 60, { throttle: 1, steer: 0.65 });
}
const leftLock = testCar.root.getObjectByName('Car_Wheel_LF_Steer').rotation.y;
const rightLock = testCar.root.getObjectByName('Car_Wheel_RF_Steer').rotation.y;
assert.ok(Math.abs(leftLock) > 0.1 && Math.abs(rightLock) > 0.1,
  'front wheels did not steer with the control input');
assert.equal(Math.sign(leftLock), Math.sign(rightLock),
  'the front wheels steer in opposite directions');
assert.ok(Math.abs(rightLock) > Math.abs(leftLock),
  'Ackermann steering did not give the inside right wheel more lock');
for (const tag of wheelNames) {
  assert.ok(Math.abs(testCar.root.getObjectByName(`Car_Wheel_${tag}_Spin`).rotation.x) > 1,
    `${tag} wheel mesh did not roll through its independent hub pivot`);
}
for (const tag of ['LR', 'RR']) {
  assert.ok(Math.abs(testCar.root.getObjectByName(`Car_Wheel_${tag}`).rotation.y) < 1e-6,
    `${tag} rear wheel steers even though the car is front-steer only`);
}
assert.ok(Math.abs(steeringWheel.rotation.z - steeringWheelRest) > 0.3,
  'the visible steering wheel did not follow the front wheels');
for (let frame = 0; frame < 60 * 17; frame++) {
  testCar.update(1 / 60, { throttle: 1, steer: 0 });
}
assert.equal(testCar.gear, 5, 'the RS Turbo did not shift through all five gears');
assert.ok(testCar.speed > 50, `the RS Turbo topped out too early at ${testCar.speed.toFixed(1)} m/s`);
assert.ok(testCar.state.frontWheelSpin > testCar.state.rearWheelSpin,
  'the front driven axle has no launch slip relative to the free rear axle');

// The supplied visual is attached to the existing six-degree flight model.
// Climb, descent and turn are simulated here rather than inferred from keys.
const planeScene = new THREE.Scene();
const testPlane = createAircraft({
  scene: planeScene,
  colliders: new ColliderSet(),
  assets: { rafAircraft: staticAssets.rafAircraft },
  place: placeAsset,
  label: 'RAF TEST AIRCRAFT',
});
testPlane.occupied = true;
let maximumAltitude = 0;
for (let frame = 0; frame < 60 * 20; frame++) {
  const seconds = frame / 60;
  testPlane.update(1 / 60, {
    throttle: 1,
    pitch: seconds > 4 && seconds < 11 ? 0.8 : seconds < 14 ? -0.35 : 0,
    roll: seconds > 9 && seconds < 15 ? 0.25 : 0,
    yaw: seconds > 12 && seconds < 16 ? 0.2 : 0,
  });
  maximumAltitude = Math.max(maximumAltitude, testPlane.altitude);
}
assert.ok(maximumAltitude > 10, `RAF aircraft did not climb (max ${maximumAltitude.toFixed(1)} m)`);
assert.ok(testPlane.altitude < maximumAltitude * 0.5, 'RAF aircraft did not respond to nose-down input');
assert.ok(Math.abs(testPlane.heading()) > 0.05, 'RAF aircraft did not turn left/right');

assert.equal(fireSampleForWeapon({ family: 'shotgun', kind: 'firearm' }), 'fire20Gauge');
assert.equal(fireSampleForWeapon({ family: 'pistol', kind: 'firearm' }), 'fire9mm');
assert.equal(fireSampleForWeapon({ family: 'rifle', kind: 'firearm' }), 'fire308');
assert.equal(fireSampleForWeapon({ family: 'smg', kind: 'firearm', quiet: true }), null);
assert.deepEqual(reloadSamplesForWeapon({
  name: 'AKM', family: 'rifle', kind: 'firearm', reloadTime: 2.3,
}).map(({ key }) => key), ['akOut', 'akIn']);
assert.deepEqual(reloadSamplesForWeapon({
  name: 'BOLT-ACTION RIFLE', family: 'sniper', kind: 'firearm', reloadTime: 2.9,
}).map(({ key }) => key), ['boltOut', 'boltIn']);

for (const url of Object.values(GUN_SAMPLE_URLS)) {
  const relative = `../public/${url.replace(/^\//, '')}`;
  const info = await stat(new URL(relative, import.meta.url));
  assert.ok(info.size > 8_000, `${url} is missing or truncated`);
}

console.log('Integrated asset QA passed: route-planned silo assault, flat deaths, two-building road end, clean user-supplied FWD Escort rig, RAF aircraft and weapon audio.');

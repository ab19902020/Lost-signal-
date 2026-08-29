import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import {
  createPlayerCharacter,
  PLAYER_ANIMATIONS,
  PLAYER_EXTRA_ANIMATIONS,
} from '../src/player_character.js';

// AnimationMixer and the arm solver do not need decoded texture pixels. This
// image stand-in lets Node parse embedded PBR textures while the test focuses
// on locomotion, the motionless stand, aim convergence and grip placement.
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
const [gltf, motionGltf] = await Promise.all([
  loadGLB('../public/assets/supplied/main_character.glb'),
  loadGLB('../public/assets/supplied/enemy_old_man_black.glb'),
]);
const character = createPlayerCharacter(gltf, motionGltf);
const player = new THREE.Group();
const scene = new THREE.Scene();
scene.add(player);
player.add(character.root);

const expectedAnimations = new Set([
  ...Object.keys(PLAYER_ANIMATIONS),
  ...Object.keys(PLAYER_EXTRA_ANIMATIONS),
  'stairsDown', 'stand', 'hold', 'crouch', 'seat',
]);
assert.deepEqual(new Set(character.animationNames()), expectedAnimations,
  'the runtime did not map both nine-clip character motion banks');
assert.equal(character.model.name, 'MainCharacter_Rugged');
for (const name of ['walk', 'run', 'stairsUp', 'stairsDown']) {
  assert.ok(Number.isFinite(character.travelSpeed(name)) && character.travelSpeed(name) > 0.1,
    `${name} stride speed was not measured from authored root motion`);
}
assert.notEqual(character.actions.walk, character.actions.quickStep,
  'the protagonist walk was replaced by a town character motion');
assert.notEqual(character.actions.run, character.actions.runNatural,
  'the protagonist run was replaced by a town character motion');
assert.equal(character.clips.walk.duration, gltf.animations[PLAYER_ANIMATIONS.walk].duration,
  'the protagonist is not using its own authored walk');
assert.equal(character.clips.run.duration, gltf.animations[PLAYER_ANIMATIONS.run].duration,
  'the protagonist is not using its own authored run');

function update(state, frames = 4) {
  for (let frame = 0; frame < frames; frame++) character.update(1 / 60, state);
}

const standing = { yaw: 0, speed: 0, grounded: true };
update(standing, 20);
assert.equal(character.animationState(), 'stand', 'standing still selected a moving clip');
const stillHand = character.model.getObjectByName('L_Hand');
const before = stillHand.getWorldPosition(new THREE.Vector3());
update(standing, 120);
const after = stillHand.getWorldPosition(new THREE.Vector3());
assert.ok(before.distanceTo(after) < 1e-6, 'the neutral standing pose moves or dances');

update({ ...standing, dancing: true }, 4);
assert.equal(character.animationState(), 'dance', 'explicit D-pad dance state did not select the dance');
const danceStart = stillHand.getWorldPosition(new THREE.Vector3());
update({ ...standing, dancing: true }, 90);
const danceLater = stillHand.getWorldPosition(new THREE.Vector3());
assert.ok(danceStart.distanceTo(danceLater) > 0.08, 'the dance clip did not move the body');
update(standing, 20);
assert.equal(character.animationState(), 'stand', 'the dance continued after its D-pad state was released');

for (const [name, state, minimumRate] of [
  ['walk', { yaw: 0, speed: 2, grounded: true }, 0.64],
  ['run', { yaw: 0, speed: 4.8, running: true, grounded: true }, 0.64],
]) {
  update(state);
  assert.equal(character.animationState(), name, `${name} input selected the wrong clip`);
  assert.ok(character.actions[name].getEffectiveTimeScale() > minimumRate,
    `${name} is not retimed to match physical movement speed`);
}

// The authored run contains a flight phase, but this game controller moves a
// capsule over the floor. A bounded presentation offset keeps the boots close
// to that capsule instead of letting the whole mesh hover above it.
let highestSupportFoot = -Infinity;
let lowestGroundCorrection = Infinity;
const leftFootPoint = new THREE.Vector3();
const rightFootPoint = new THREE.Vector3();
for (let frame = 0; frame < 180; frame++) {
  update({ yaw: 0, speed: 4.8, running: true, grounded: true }, 1);
  const supportY = Math.min(
    character.rig.bones.get('L_Foot').getWorldPosition(leftFootPoint).y,
    character.rig.bones.get('R_Foot').getWorldPosition(rightFootPoint).y,
  );
  highestSupportFoot = Math.max(highestSupportFoot, supportY);
  lowestGroundCorrection = Math.min(lowestGroundCorrection, character.groundOffset());
}
assert.ok(highestSupportFoot < 0.25,
  `the run cycle still lifts both feet ${highestSupportFoot.toFixed(3)} m above the floor`);
assert.ok(lowestGroundCorrection < -0.07 && lowestGroundCorrection >= -0.101,
  `the run grounding correction is unsafe (${lowestGroundCorrection.toFixed(3)} m)`);

for (const [name, state] of [
  ['jump', { yaw: 0, speed: 2, grounded: false, verticalSpeed: 3 }],
  ['fall', { yaw: 0, speed: 2, grounded: false, verticalSpeed: -3 }],
]) {
  update(state);
  assert.equal(character.animationState(), name, `${name} input selected the wrong clip`);
}

update({ yaw: 0, speed: 1, grounded: true, climbing: true }, 1);
assert.equal(character.animationState(), 'climb', 'a step-up did not select the climb clip');
assert.ok(character.actions.climb.getEffectiveTimeScale() > 3.5,
  'the climb clip cannot complete inside the physical step window');
update(standing, 55);
assert.equal(character.animationState(), 'stand', 'the climb override did not finish');

for (const [name, stairDirection] of [['stairsUp', 1], ['stairsDown', -1]]) {
  update({ ...standing, speed: 1.1, stairDirection }, 1);
  assert.equal(character.animationState(), name, `${name} terrain did not select its stair cycle`);
  update(standing, 24);
  assert.equal(character.animationState(), 'stand', `${name} continued after leaving the stairs`);
}

const gun = new THREE.Group();
gun.add(new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.18, 0.80),
  new THREE.MeshStandardMaterial()));
const aimTarget = new THREE.Vector3(0.85, 1.45, -22);
character.setWeapon(gun, { family: 'rifle' });
character.setWeaponVisible(true);
// Bringing a rifle up takes about half a second, so the harness has to give
// it half a second before judging where the hands are.
update({ ...standing, armed: true, aiming: true, aimTarget }, 90);
assert.equal(character.animationState(), 'hold',
  'standing with a gun played an authored gesture instead of the stable hold');

function assertGrip(label, limit = 0.012) {
  for (const [hand, error] of Object.entries(character.gripError())) {
    assert.equal(typeof error, 'number', `${label} did not solve the ${hand} hand`);
    assert.ok(error < limit,
      `${label} ${hand} hand missed its grip by ${error.toFixed(4)} m`);
  }
  return character.gripError();
}

function assertAim(label) {
  character.root.updateWorldMatrix(true, true);
  const muzzle = character.muzzleWorldPosition(new THREE.Vector3());
  const forward = new THREE.Vector3(0, 0, -1)
    .applyQuaternion(character.weaponMount.getWorldQuaternion(new THREE.Quaternion()));
  const wanted = aimTarget.clone().sub(muzzle).normalize();
  assert.ok(forward.dot(wanted) > 0.995, `${label} muzzle does not converge on the crosshair target`);
}

assertGrip('rifle');
assertAim('rifle');
for (const side of ['L', 'R']) {
  const shoulder = character.rig.bones.get(`${side}_Upperarm`)
    .getWorldPosition(new THREE.Vector3());
  const elbow = character.rig.bones.get(`${side}_Forearm`)
    .getWorldPosition(new THREE.Vector3());
  assert.ok(elbow.y < shoulder.y - 0.10,
    `${side} firearm elbow folds upward into the shoulder`);
  assert.ok(side === 'R' ? elbow.x > shoulder.x + 0.08 : elbow.x > shoulder.x + 0.03,
    `${side} firearm elbow crossed or collapsed into the torso`);
}
// The three ways a weapon is carried. This is the part the player reads off
// the character at a glance, and getting it wrong is what put the barrel
// through his own chest while sprinting.
const mountLocal = new THREE.Vector3();
const muzzleForward = new THREE.Vector3();
function carryReport() {
  character.root.updateWorldMatrix(true, true);
  mountLocal.copy(character.weaponMount.getWorldPosition(new THREE.Vector3()));
  character.root.worldToLocal(mountLocal);
  // Measured against the spine, not the feet: a sprinting man leans a long way
  // forward, so everything about him is forward of his own origin and that
  // tells you nothing about whether the rifle is inside his back.
  const spine = character.root.worldToLocal(
    character.rig.bones.get('Spine02').getWorldPosition(new THREE.Vector3()));
  muzzleForward.set(0, 0, -1)
    .applyQuaternion(character.weaponMount.getWorldQuaternion(new THREE.Quaternion()));
  return {
    carry: character.carry(), blend: character.carryBlend(), mountLocal, muzzleForward,
    behindSpine: mountLocal.z - spine.z,
  };
}

// Sprinting: on the back, out of the hands, and behind the chest rather than
// through it. The character faces -Z, so anything the far side of the spine
// has a positive local Z.
update({ yaw: 0, speed: 5.4, running: true, grounded: true, armed: true, aimTarget }, 40);
assert.equal(character.animationState(), 'run', 'sprinting with a rifle left the run cycle');
let report = carryReport();
assert.equal(report.carry, 'slung',
  `a sprinting rifle is ${report.carry}, not slung (${JSON.stringify(report.blend)})`);
// A torso is about 0.2 m thick, so anything less than that behind the spine is
// still inside the man wearing it.
// A torso is about 0.2 m thick, so anything less than that behind the spine is
// still inside the man wearing it.
assert.ok(report.behindSpine > 0.16,
  `the slung rifle sits ${report.behindSpine.toFixed(3)} m behind the spine, which is inside his back`);
assert.equal(character.gripError().right, null,
  'the hands are still solved onto a weapon that is on the back');
// And the arms are the run animation's again, not frozen in a firing stance.
// The measure that means something is the comparison: a man sprinting with a
// rifle on his back should swing his arms about as freely as a man sprinting
// with nothing, because that is the whole reason to sling it.
function sprintArmSwing(state) {
  const samples = [];
  const point = new THREE.Vector3();
  for (let frame = 0; frame < 60; frame++) {
    update({ yaw: 0, speed: 5.4, running: true, grounded: true, ...state }, 1);
    samples.push(character.rig.bones.get('R_Hand').getWorldPosition(point).clone());
  }
  let widest = 0;
  for (const a of samples) for (const b of samples) widest = Math.max(widest, a.distanceTo(b));
  return widest;
}
const freeSwing = sprintArmSwing({});
const slungSwing = sprintArmSwing({ armed: true, aimTarget });
assert.ok(slungSwing > freeSwing * 0.7,
  `sprinting with a slung rifle swings the arms ${(slungSwing * 1000).toFixed(0)} mm `
  + `against ${(freeSwing * 1000).toFixed(0)} mm empty-handed: the firing stance is still locked on`);

// Walking: in both hands, at low ready, muzzle below the horizon.
update({ yaw: 0, speed: 2, grounded: true, armed: true, aimTarget }, 40);
assert.equal(character.animationState(), 'walk', 'walking with a rifle left the walk cycle');
report = carryReport();
assert.equal(report.carry, 'ready',
  `a walking rifle is ${report.carry}, not at the ready (${JSON.stringify(report.blend)})`);
assert.ok(report.muzzleForward.y < -0.12,
  `the low-ready muzzle points ${report.muzzleForward.y.toFixed(3)} up rather than down`);
assertGrip('walking rifle at the ready');

// Aiming: up into the shoulder and onto the crosshair, whatever the legs do.
for (const [name, state] of [
  ['hold', { ...standing, armed: true, aiming: true, aimTarget }],
  ['walk', { yaw: 0, speed: 2, grounded: true, armed: true, aiming: true, aimTarget }],
  ['run', { yaw: 0, speed: 4.8, running: true, grounded: true, armed: true, aiming: true, aimTarget }],
  ['jump', {
    yaw: 0, speed: 2, grounded: false, verticalSpeed: 3, armed: true, aiming: true, aimTarget,
  }],
]) {
  // Settle the aim standing still, then start moving - which is the order it
  // happens in play, and which stops the test judging the clamped last frame
  // of a jump that has been held for a second and a half.
  update({ ...standing, armed: true, aiming: true, aimTarget }, 90);
  update(state, 12);
  assert.equal(character.animationState(), name);
  assert.equal(character.carry(), 'aimed', `aiming while ${name} did not bring the weapon up`);
  assertGrip(`aimed rifle (${name})`);
  assertAim(`aimed rifle (${name})`);
}

// Firing from the hip brings it up on its own: a tracer leaving the crosshair
// while the muzzle points at the floor is wrong in a way players feel.
update({ yaw: 0, speed: 2, grounded: true, armed: true, aimTarget, recoil: 0.6 }, 90);
assert.equal(character.carry(), 'aimed', 'firing from the hip did not bring the weapon up');

for (const family of ['sniper', 'shotgun', 'smg', 'pistol', 'revolver']) {
  character.setWeapon(gun, { family });
  update({ ...standing, armed: true, aiming: true, aimTarget }, 90);
  assertGrip(family);
  assertAim(family);
  // Every family has somewhere to put the weapon when its owner runs.
  update({ yaw: 0, speed: 5.4, running: true, grounded: true, armed: true, aimTarget }, 40);
  assert.equal(character.carry(), 'slung', `a sprinting ${family} stayed in the hands`);
}

character.setWeapon(gun, { family: 'rifle' });
update({ ...standing, armed: true, aiming: true, aimTarget }, 90);
update({ ...standing, armed: true, aiming: true, aimTarget, crouching: true }, 90);
assertGrip('crouched rifle');
update({ ...standing, armed: true, aiming: true, aimTarget, seated: true }, 90);
assertGrip('seated rifle');

character.setWeapon(gun, { family: 'blade' });
update({ ...standing, armed: true, aiming: true, aimTarget }, 90);
assert.equal(character.animationState(), 'hold', 'a held blade loops the attack animation');
assert.ok(character.triggerAction('melee'), 'the melee action could not be triggered');
update({ ...standing, armed: true, aiming: true, aimTarget });
assert.equal(character.animationState(), 'melee', 'an attack did not select the melee clip');
assert.ok(character.gripError().right < 0.012, 'the melee hand missed the blade grip');
assert.equal(character.gripError().left, null, 'the free melee hand should not target the blade');

character.setWeaponVisible(false);
update(standing, 30);
const height = character.bounds().getSize(new THREE.Vector3()).y;
assert.ok(height > 1.70 && height < 1.90, `rugged character is ${height.toFixed(2)} m tall`);
console.log('Player character QA passed: motionless stand, D-pad-only dance, natural walk/run/stairs, slung/ready/aimed weapon carry and converged firearm aim.');

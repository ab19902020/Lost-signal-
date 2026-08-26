import * as THREE from 'three';
import { cloneGLTF } from './assets.js';

// The supplied Tripo character has a complete 41-bone humanoid skin, but it
// does not contain animation clips. This controller keeps that authored rig
// intact and layers a light procedural locomotion pass over its bind pose, so
// the third-person player walks, runs, crouches and leaves the ground instead
// of sliding through the world as a frozen model.

const CHARACTER_HEIGHT = 1.78;
const _box = new THREE.Box3();
const _size = new THREE.Vector3();
const _delta = new THREE.Quaternion();
const _axisX = new THREE.Vector3(1, 0, 0);
const _axisY = new THREE.Vector3(0, 1, 0);
const _axisZ = new THREE.Vector3(0, 0, 1);

function collectBindPose(root) {
  const bones = new Map();
  const bind = new Map();
  root.traverse((part) => {
    if (!part.isBone) return;
    bones.set(part.name, part);
    bind.set(part.name, part.quaternion.clone());
  });
  return { bones, bind };
}

function layerRotation(rig, name, x = 0, y = 0, z = 0) {
  const bone = rig.bones.get(name);
  const base = rig.bind.get(name);
  if (!bone || !base) return;
  bone.quaternion.copy(base);
  if (x) {
    _delta.setFromAxisAngle(_axisX, x);
    bone.quaternion.multiply(_delta);
  }
  if (y) {
    _delta.setFromAxisAngle(_axisY, y);
    bone.quaternion.multiply(_delta);
  }
  if (z) {
    _delta.setFromAxisAngle(_axisZ, z);
    bone.quaternion.multiply(_delta);
  }
}

function cloneWeapon(source) {
  if (!source) return null;
  const copy = source.clone(true);
  copy.traverse((part) => {
    if (!part.isMesh) return;
    part.castShadow = true;
    part.receiveShadow = false;
  });
  return copy;
}

export function createPlayerCharacter(gltf) {
  const root = new THREE.Group();
  root.name = 'MainCharacter_Rig';

  const model = cloneGLTF(gltf);
  model.name = 'MainCharacter_Military';
  // Tripo exports this rig facing +Z. Lost Signal's neutral heading faces -Z,
  // so turn only the authored model; the controller root remains in the same
  // coordinate system as movement, weapons and the camera.
  model.rotation.y = Math.PI;
  root.add(model);

  model.updateMatrixWorld(true);
  _box.setFromObject(model);
  _box.getSize(_size);
  const scale = CHARACTER_HEIGHT / Math.max(_size.y, 0.001);
  model.scale.multiplyScalar(scale);
  model.updateMatrixWorld(true);
  _box.setFromObject(model);
  model.position.y -= _box.min.y;

  model.traverse((part) => {
    if (!part.isMesh && !part.isSkinnedMesh) return;
    part.castShadow = true;
    part.receiveShadow = true;
    part.frustumCulled = true;
    const materials = Array.isArray(part.material) ? part.material : [part.material];
    for (const material of materials) {
      if (!material) continue;
      if (material.map) {
        material.map.colorSpace = THREE.SRGBColorSpace;
        material.map.anisotropy = 8;
      }
      if (material.normalMap) material.normalMap.anisotropy = 8;
      if (material.roughnessMap) material.roughnessMap.anisotropy = 8;
    }
  });

  const rig = collectBindPose(model);
  const weaponMount = new THREE.Group();
  weaponMount.name = 'MainCharacter_WeaponMount';
  // The prepared weapon models point down local -Z, matching this controller.
  // The mount sits between the hands and moves with the whole actor. Bone-level
  // hand IK can replace this later without changing the view/carry API.
  weaponMount.position.set(0.24, 1.12, -0.24);
  weaponMount.rotation.set(-0.05, 0, -0.035);
  root.add(weaponMount);

  let weapon = null;
  let elapsed = 0;
  let visible = true;
  let weaponVisible = false;
  let obstructed = false;

  function syncVisibility() {
    root.visible = visible && !obstructed;
    weaponMount.visible = root.visible && weaponVisible && !!weapon;
  }

  function setWeapon(source) {
    if (weapon) weaponMount.remove(weapon);
    weapon = cloneWeapon(source);
    if (weapon) weaponMount.add(weapon);
    syncVisibility();
    return weapon;
  }

  function update(dt, state = {}) {
    elapsed += dt;
    const speed = Math.max(0, state.speed || 0);
    const running = !!state.running;
    const crouching = !!state.crouching;
    const seated = !!state.seated;
    const grounded = state.grounded !== false;
    const armed = !!state.armed;
    const moving = speed > 0.08;

    root.rotation.y = state.yaw || 0;
    const cadence = running ? 10.2 : 7.1;
    const strideAmount = moving ? Math.min(1, speed / (running ? 4.8 : 2.5)) : 0;
    const phase = (state.distance || elapsed * speed) * cadence;
    const stride = Math.sin(phase) * strideAmount;
    const liftL = Math.max(0, -Math.sin(phase)) * strideAmount;
    const liftR = Math.max(0, Math.sin(phase)) * strideAmount;
    const idle = Math.sin(elapsed * 1.65);

    let thighL = stride * (running ? 0.62 : 0.43);
    let thighR = -stride * (running ? 0.62 : 0.43);
    let calfL = liftL * (running ? 0.72 : 0.42);
    let calfR = liftR * (running ? 0.72 : 0.42);
    let waist = idle * 0.012;
    let drop = 0;

    if (seated) {
      thighL = 1.10;
      thighR = 1.10;
      calfL = -1.24;
      calfR = -1.24;
      waist += 0.10;
      drop = 0.43;
    } else if (crouching) {
      thighL += 0.55;
      thighR += 0.55;
      calfL -= 0.76;
      calfR -= 0.76;
      waist += 0.12;
      drop = 0.31;
    } else if (!grounded) {
      thighL = 0.20;
      thighR = -0.08;
      calfL = -0.30;
      calfR = -0.18;
    }

    layerRotation(rig, 'L_Thigh', thighL);
    layerRotation(rig, 'R_Thigh', thighR);
    layerRotation(rig, 'L_Calf', calfL);
    layerRotation(rig, 'R_Calf', calfR);
    layerRotation(rig, 'L_Foot', -thighL * 0.14 - calfL * 0.24);
    layerRotation(rig, 'R_Foot', -thighR * 0.14 - calfR * 0.24);
    layerRotation(rig, 'Waist', waist, armed ? 0 : stride * 0.025, 0);
    layerRotation(rig, 'Spine01', idle * 0.008 + (armed ? -0.035 : 0), 0, -stride * 0.018);
    layerRotation(rig, 'Spine02', idle * 0.006, 0, stride * 0.012);

    // Unarmed arms counter-swing the legs. With a weapon drawn they settle
    // into a compact two-handed ready pose so the rifle does not float beside
    // a pair of fully swinging arms.
    const armSwing = armed ? 0 : stride * (running ? 0.48 : 0.31);
    layerRotation(rig, 'L_Upperarm', armed ? -0.40 : -armSwing, armed ? -0.10 : 0, armed ? -0.08 : 0);
    layerRotation(rig, 'R_Upperarm', armed ? -0.33 : armSwing, armed ? 0.08 : 0, armed ? 0.06 : 0);
    layerRotation(rig, 'L_Forearm', armed ? -0.72 : 0);
    layerRotation(rig, 'R_Forearm', armed ? -0.64 : 0);
    layerRotation(rig, 'Head', idle * 0.004, -(state.lookYawOffset || 0) * 0.16, 0);

    root.position.y = -drop + (moving && grounded ? Math.abs(Math.sin(phase)) * 0.012 : idle * 0.003);
    weaponMount.position.y = 1.12 - drop * 0.62;
    weaponMount.rotation.x = armed ? -0.08 : -0.05;
    syncVisibility();
  }

  return {
    root,
    model,
    weaponMount,
    rig,
    update,
    setWeapon,
    setVisible(value) { visible = !!value; syncVisibility(); },
    setWeaponVisible(value) { weaponVisible = !!value; syncVisibility(); },
    setObstructed(value) { obstructed = !!value; syncVisibility(); },
    bounds() {
      model.updateMatrixWorld(true);
      return _box.setFromObject(model).clone();
    },
  };
}

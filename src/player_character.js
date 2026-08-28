import * as THREE from 'three';
import { cloneGLTF } from './assets.js';

// Tripo exported descriptive motion as anonymous NlaTrack.* clips. The rugged
// model's first bank contains the essential traversal and combat motions.
export const PLAYER_ANIMATIONS = Object.freeze({
  climb: 0,
  run: 1,
  walk: 2,
  turn: 3,
  gesture: 4,
  fall: 5,
  dance: 6,
  melee: 7,
  jump: 8,
});

// The newly supplied nine-clip bank names its motions in the uploaded filename
// rather than inside glTF. Its skeleton uses the same bone names, so rotation
// tracks retarget cleanly onto the rugged protagonist. Translation and scale
// tracks are deliberately discarded during retargeting: those describe the
// source old man's proportions, not the protagonist's.
export const PLAYER_EXTRA_ANIMATIONS = Object.freeze({
  laugh: 0,
  flee: 1,
  danceAlt: 2,
  foldArms: 3,
  stairsUp: 4,
  clap: 5,
  fallQuick: 6,
  quickStep: 7,
  runNatural: 8,
});

const CHARACTER_HEIGHT = 1.78;
const CLIMB_WINDOW = 0.82;
const _box = new THREE.Box3();
const _size = new THREE.Vector3();
const _end = new THREE.Vector3();
const _joint = new THREE.Vector3();
const _toEnd = new THREE.Vector3();
const _toTarget = new THREE.Vector3();
const _target = new THREE.Vector3();
const _shoulder = new THREE.Vector3();
const _elbow = new THREE.Vector3();
const _hand = new THREE.Vector3();
const _direction = new THREE.Vector3();
const _poleTarget = new THREE.Vector3();
const _poleDirection = new THREE.Vector3();
const _desiredElbow = new THREE.Vector3();
const _leftFoot = new THREE.Vector3();
const _rightFoot = new THREE.Vector3();
const _mountWorld = new THREE.Vector3();
const _parentWorld = new THREE.Quaternion();
const _parentInverse = new THREE.Quaternion();
const _worldAim = new THREE.Quaternion();
const _fullDelta = new THREE.Quaternion();
const _worldDelta = new THREE.Quaternion();
const _localDelta = new THREE.Quaternion();
const _identity = new THREE.Quaternion();
const _layer = new THREE.Quaternion();
const _lookMatrix = new THREE.Matrix4();
const _axisX = new THREE.Vector3(1, 0, 0);
const _worldUp = new THREE.Vector3(0, 1, 0);

const LOOP_ONCE = new Set(['climb', 'gesture', 'fall', 'melee', 'jump']);
const NO_VERTICAL_ROOT = new Set(['climb', 'fall', 'jump']);
const GROUND_CONTACT_STATES = new Set(['stand', 'hold', 'walk', 'run', 'turn']);
const FOOT_PLANT_HEIGHT = 0.045;

// Every prepared weapon points down local -Z. Each profile defines a stable
// shoulder position, actual hand contacts and an approximate muzzle. The gun
// is aimed first; the arms are then solved onto it. That order is important:
// moving the weapon to follow swinging hands is what made the previous pose
// wander away from the crosshair.
const WEAPON_POSES = Object.freeze({
  rifle: {
    position: [0.12, 1.24, -0.36], rotation: [-0.035, 0, -0.015],
    right: [0.13, -0.02, 0.16], left: [-0.12, 0.01, -0.08], muzzle: [0, 0.015, -0.56],
    rightPole: [0.46, 1.12, 0.10], leftPole: [-0.43, 1.10, -0.08],
  },
  sniper: {
    position: [0.11, 1.25, -0.39], rotation: [-0.03, 0, -0.015],
    right: [0.13, -0.025, 0.19], left: [-0.13, 0.005, -0.055], muzzle: [0, 0.015, -0.74],
    rightPole: [0.47, 1.12, 0.11], leftPole: [-0.45, 1.09, -0.10],
  },
  shotgun: {
    position: [0.11, 1.23, -0.38], rotation: [-0.04, 0, -0.018],
    right: [0.13, -0.02, 0.18], left: [-0.13, 0.005, -0.06], muzzle: [0, 0.015, -0.64],
    rightPole: [0.47, 1.10, 0.11], leftPole: [-0.45, 1.08, -0.10],
  },
  smg: {
    position: [0.11, 1.22, -0.33], rotation: [-0.045, 0, -0.018],
    right: [0.12, -0.015, 0.13], left: [-0.11, 0.015, -0.06], muzzle: [0, 0.015, -0.49],
    rightPole: [0.45, 1.09, 0.11], leftPole: [-0.41, 1.07, -0.06],
  },
  pistol: {
    position: [0.03, 1.29, -0.43], rotation: [-0.025, 0, 0],
    right: [0.07, -0.045, 0.055], left: [-0.065, -0.035, 0.02], muzzle: [0, 0.01, -0.27],
    rightPole: [0.43, 1.08, 0.04], leftPole: [-0.38, 1.07, 0.00],
  },
  revolver: {
    position: [0.03, 1.29, -0.43], rotation: [-0.025, 0, 0],
    right: [0.07, -0.045, 0.055], left: [-0.065, -0.035, 0.02], muzzle: [0, 0.01, -0.27],
    rightPole: [0.43, 1.08, 0.04], leftPole: [-0.38, 1.07, 0.00],
  },
  blade: {
    position: [0.20, 1.08, -0.30], rotation: [-0.16, 0.04, 0.18],
    right: [0.02, -0.04, 0.13], left: null, muzzle: [0, 0, -0.27],
    rightPole: [0.48, 0.98, 0.14], leftPole: null,
  },
});

function collectRig(root) {
  const bones = new Map();
  root.traverse((part) => {
    if (part.isBone) bones.set(part.name, part);
  });
  return { bones };
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

function authoredTravelSpeed(source) {
  const track = source.tracks.find((entry) => /Hip\.position$/.test(entry.name));
  if (!track || source.duration <= 0) return 1;
  const stride = track.getValueSize();
  const last = track.values.length - stride;
  // The source is Z-up: X/Y are travel and Z is height.
  return Math.hypot(
    track.values[last] - track.values[0],
    track.values[last + 1] - track.values[1],
  ) / source.duration;
}

/** Remove baked travel while retaining grounded vertical body motion. */
function inPlaceClip(source, name, hipBindPosition) {
  const clip = source.clone();
  clip.name = name;
  for (const track of clip.tracks) {
    if (/Hip\.position$/.test(track.name)) {
      const stride = track.getValueSize();
      const sourceZ = track.values[2];
      for (let offset = 0; offset < track.values.length; offset += stride) {
        track.values[offset] = hipBindPosition.x;
        track.values[offset + 1] = hipBindPosition.y;
        track.values[offset + 2] = NO_VERTICAL_ROOT.has(name)
          ? hipBindPosition.z
          : hipBindPosition.z + track.values[offset + 2] - sourceZ;
      }
    }
    if (name === 'turn' && /Hip\.quaternion$/.test(track.name)) {
      const stride = track.getValueSize();
      const first = Array.from(track.values.slice(0, stride));
      for (let offset = 0; offset < track.values.length; offset += stride) {
        for (let i = 0; i < stride; i++) track.values[offset + i] = first[i];
      }
    }
  }
  clip.resetDuration();
  return clip;
}

/** Retarget a compatible humanoid clip without importing another body's size. */
function retargetInPlaceClip(source, name, hipBindPosition) {
  const clip = inPlaceClip(source, name, hipBindPosition);
  clip.tracks = clip.tracks.filter((track) =>
    /\.quaternion$/.test(track.name) || /^(Root|Hip)\.position$/.test(track.name));
  return clip;
}

/** A real reversed stair cycle, rather than a negative-time action at frame 0. */
function reverseClip(source, name) {
  const clip = source.clone();
  clip.name = name;
  clip.tracks = clip.tracks.map((track) => {
    const stride = track.getValueSize();
    const times = new track.times.constructor(track.times.length);
    const values = new track.values.constructor(track.values.length);
    for (let index = 0; index < track.times.length; index++) {
      const from = track.times.length - 1 - index;
      times[index] = source.duration - track.times[from];
      values.set(track.values.subarray(from * stride, from * stride + stride), index * stride);
    }
    return new track.constructor(track.name, times, values, track.getInterpolation());
  });
  clip.resetDuration();
  return clip;
}

/** Make a truly motionless pose from one authored frame. */
function stillClip(source, name, time = 0) {
  const tracks = source.tracks.map((track) => {
    const stride = track.getValueSize();
    const sample = track.createInterpolant(new Float32Array(stride)).evaluate(time);
    const values = new Float32Array(stride * 2);
    values.set(sample, 0);
    values.set(sample, stride);
    return new track.constructor(
      track.name,
      new Float32Array([0, 1]),
      values,
      track.getInterpolation(),
    );
  });
  return new THREE.AnimationClip(name, 1, tracks);
}

/** Apply a pose adjustment to static quaternion tracks once, not every frame. */
function posedStillClip(source, name, rotations) {
  const clip = source.clone();
  clip.name = name;
  const current = new THREE.Quaternion();
  const delta = new THREE.Quaternion();
  for (const track of clip.tracks) {
    const match = /^(.+)\.quaternion$/.exec(track.name);
    const rotation = match && rotations[match[1]];
    if (!rotation) continue;
    delta.setFromEuler(new THREE.Euler(...rotation, 'XYZ'));
    for (let offset = 0; offset < track.values.length; offset += 4) {
      current.fromArray(track.values, offset).multiply(delta).normalize();
      current.toArray(track.values, offset);
    }
  }
  return clip;
}

function configureAction(action, name) {
  action.enabled = true;
  action.clampWhenFinished = LOOP_ONCE.has(name);
  action.setLoop(LOOP_ONCE.has(name) ? THREE.LoopOnce : THREE.LoopRepeat,
    LOOP_ONCE.has(name) ? 1 : Infinity);
  return action;
}

export function createPlayerCharacter(gltf, motionGltf = null) {
  if (!gltf?.animations || gltf.animations.length < 9) {
    throw new Error(`Rugged protagonist requires 9 animations; found ${gltf?.animations?.length || 0}.`);
  }

  const root = new THREE.Group();
  root.name = 'MainCharacter_Rig';

  const model = cloneGLTF(gltf);
  model.name = 'MainCharacter_Rugged';
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
  const plantedModelY = model.position.y;

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

  const rig = collectRig(model);
  const mixer = new THREE.AnimationMixer(model);
  const clips = {};
  const actions = {};
  const travelSpeeds = {};
  const hipBindPosition = rig.bones.get('Hip')?.position.clone() || new THREE.Vector3();
  for (const [name, index] of Object.entries(PLAYER_ANIMATIONS)) {
    travelSpeeds[name] = authoredTravelSpeed(gltf.animations[index]);
    clips[name] = inPlaceClip(gltf.animations[index], name, hipBindPosition);
    actions[name] = configureAction(mixer.clipAction(clips[name]), name);
  }
  if (motionGltf?.animations?.length >= 9) {
    for (const [name, index] of Object.entries(PLAYER_EXTRA_ANIMATIONS)) {
      const source = motionGltf.animations[index];
      travelSpeeds[name] = authoredTravelSpeed(source);
      clips[name] = retargetInPlaceClip(source, name, hipBindPosition);
      actions[name] = configureAction(mixer.clipAction(clips[name]), name);
    }
    // Never replace this model's traversal with locomotion authored for one
    // of the town characters.  The previous mapping substituted a 13-second
    // stationary gesture for `run`, which is why sprinting looked frozen.
    // The protagonist now always keeps its own run, walk, climb and jump.
    // The compatible extra bank remains available for explicit gestures only.
    clips.stairsUp = clips.climb;
    clips.stairsDown = reverseClip(clips.climb, 'stairsDown');
    actions.stairsUp = actions.climb;
    actions.stairsDown = configureAction(mixer.clipAction(clips.stairsDown), 'stairsDown');
    travelSpeeds.stairsUp = travelSpeeds.climb;
    travelSpeeds.stairsDown = travelSpeeds.climb;
  } else {
    // A missing optional bank never removes traversal. The authored climb is a
    // much better fallback than freezing halfway down a staircase.
    clips.stairsUp = clips.climb;
    clips.stairsDown = reverseClip(clips.climb, 'stairsDown');
    actions.stairsUp = actions.climb;
    actions.stairsDown = configureAction(mixer.clipAction(clips.stairsDown), 'stairsDown');
    travelSpeeds.stairsUp = travelSpeeds.climb;
    travelSpeeds.stairsDown = travelSpeeds.climb;
  }
  // The dance begins in a clean neutral stance. Sampling that frame gives us
  // a natural stand without playing a single frame of the dance itself.
  clips.stand = stillClip(clips.dance, 'stand', 0);
  clips.hold = clips.stand.clone();
  clips.hold.name = 'hold';
  clips.crouch = posedStillClip(clips.stand, 'crouch', {
    L_Thigh: [0.48, 0, 0], R_Thigh: [0.48, 0, 0],
    L_Calf: [-0.70, 0, 0], R_Calf: [-0.70, 0, 0], Waist: [0.10, 0, 0],
  });
  clips.seat = posedStillClip(clips.stand, 'seat', {
    L_Thigh: [1.04, 0, 0], R_Thigh: [1.04, 0, 0],
    L_Calf: [-1.20, 0, 0], R_Calf: [-1.20, 0, 0], Waist: [0.10, 0, 0],
  });
  actions.stand = configureAction(mixer.clipAction(clips.stand), 'stand');
  actions.hold = configureAction(mixer.clipAction(clips.hold), 'hold');
  actions.crouch = configureAction(mixer.clipAction(clips.crouch), 'crouch');
  actions.seat = configureAction(mixer.clipAction(clips.seat), 'seat');

  // Firearms use a procedural upper-body layer. Capture the neutral authored
  // frame once, then restore it after the locomotion mixer so a running arm
  // swing never becomes the starting point for the grip solver. Legs retain
  // the real walk/run/jump clips; the torso and arms become a stable two-hand
  // shooting pose on top of them.
  const neutralUpperBody = new Map();
  const UPPER_BODY_WEIGHTS = Object.freeze({
    Waist: 0.32, Spine01: 0.58, Spine02: 0.82,
    L_Clavicle: 1, R_Clavicle: 1,
    L_Upperarm: 1, R_Upperarm: 1,
    L_Forearm: 1, R_Forearm: 1,
    L_Hand: 1, R_Hand: 1,
  });
  for (const track of clips.stand.tracks) {
    const match = /^(.+)\.quaternion$/.exec(track.name);
    if (!match || !(match[1] in UPPER_BODY_WEIGHTS)) continue;
    neutralUpperBody.set(match[1], new THREE.Quaternion().fromArray(track.values, 0));
  }

  const weaponMount = new THREE.Group();
  weaponMount.name = 'MainCharacter_WeaponMount';
  root.add(weaponMount);

  let weapon = null;
  let weaponFamily = 'rifle';
  let visible = true;
  let weaponVisible = false;
  let obstructed = false;
  let currentState = null;
  let currentAction = null;
  let climbTimer = 0;
  let stairTimer = 0;
  let stairState = null;
  let forcedAction = null;
  let forcedTimer = 0;
  let groundOffset = 0;
  const gripError = { right: null, left: null };

  function syncVisibility() {
    root.visible = visible && !obstructed;
    weaponMount.visible = root.visible && weaponVisible && !!weapon;
  }

  function setWeapon(source, descriptor = {}) {
    if (weapon) weaponMount.remove(weapon);
    weapon = cloneWeapon(source);
    weaponFamily = descriptor.family || 'rifle';
    if (weapon) weaponMount.add(weapon);
    syncVisibility();
    return weapon;
  }

  function animationRate(name, state) {
    if (name === 'run' || name === 'walk') {
      return THREE.MathUtils.clamp((state.speed || 0) / Math.max(0.15, travelSpeeds[name]), 0.65, 4.2);
    }
    if (name === 'climb') return clips.climb.duration / CLIMB_WINDOW;
    if (name === 'stairsUp' || name === 'stairsDown') {
      return THREE.MathUtils.clamp((state.speed || 1.1) / Math.max(0.45,
        travelSpeeds[name] || 1.1), 0.72, 2.2);
    }
    if (name === 'jump') return 1.12;
    if (name === 'dance') return 1;
    return 1;
  }

  function chooseState(state) {
    if (state.climbing) climbTimer = CLIMB_WINDOW;
    if (climbTimer > 0) return 'climb';
    if (state.stairDirection) {
      stairState = state.stairDirection < 0 ? 'stairsDown' : 'stairsUp';
      stairTimer = 0.34;
    }
    if (stairTimer > 0 && stairState) return stairState;
    if (forcedAction && forcedTimer > 0) return forcedAction;
    if (!state.grounded) return (state.verticalSpeed || 0) >= -0.15 ? 'jump' : 'fall';
    const speed = Math.max(0, state.speed || 0);
    if (!state.seated && speed > 0.11) return state.running ? 'run' : 'walk';
    if (state.seated) return 'seat';
    if (state.crouching) return 'crouch';
    if (state.dancing && !state.armed && !state.seated) return 'dance';
    return state.armed ? 'hold' : 'stand';
  }

  function playState(name, state) {
    const next = actions[name];
    const rate = animationRate(name, state);
    if (currentState === name) {
      next.setEffectiveTimeScale(rate);
      return;
    }
    const previous = currentAction;
    currentState = name;
    currentAction = next;
    next.reset();
    next.enabled = true;
    next.setEffectiveWeight(1);
    next.setEffectiveTimeScale(rate);
    next.fadeIn(name === 'jump' || name === 'fall' ? 0.07 : 0.13);
    next.play();
    previous?.fadeOut(name === 'jump' || name === 'fall' ? 0.07 : 0.13);
  }

  function applyUpperBodyHold(state) {
    if (!state.armed || !weapon || weaponFamily === 'blade' || currentState === 'melee') return;
    for (const [name, weight] of Object.entries(UPPER_BODY_WEIGHTS)) {
      const bone = rig.bones.get(name);
      const neutral = neutralUpperBody.get(name);
      if (bone && neutral) bone.quaternion.slerp(neutral, weight);
    }
  }

  function rotateJointToward(joint, end, wanted, maximum = Infinity) {
    joint.updateWorldMatrix(true, true);
    joint.getWorldPosition(_joint);
    end.getWorldPosition(_end);
    _toEnd.copy(_end).sub(_joint);
    _toTarget.copy(wanted).sub(_joint);
    if (_toEnd.lengthSq() < 1e-8 || _toTarget.lengthSq() < 1e-8) return;
    _fullDelta.setFromUnitVectors(_toEnd.normalize(), _toTarget.normalize());
    const angle = 2 * Math.acos(THREE.MathUtils.clamp(_fullDelta.w, -1, 1));
    _worldDelta.copy(_fullDelta);
    if (angle > maximum) _worldDelta.copy(_identity).slerp(_fullDelta, maximum / angle);
    joint.parent.getWorldQuaternion(_parentWorld);
    _parentInverse.copy(_parentWorld).invert();
    _localDelta.copy(_parentInverse).multiply(_worldDelta).multiply(_parentWorld);
    joint.quaternion.premultiply(_localDelta).normalize();
  }

  /** Analytic two-bone arm placement with a stable elbow pole. */
  function solveArm(side, localTarget, localPole) {
    if (!localTarget) return null;
    const hand = rig.bones.get(`${side}_Hand`);
    const forearm = rig.bones.get(`${side}_Forearm`);
    const upperarm = rig.bones.get(`${side}_Upperarm`);
    const clavicle = rig.bones.get(`${side}_Clavicle`);
    if (!hand || !forearm || !upperarm || !clavicle) return null;
    _target.fromArray(localTarget);
    weaponMount.localToWorld(_target);

    // Let the shoulder girdle contribute a small, human reach toward the gun.
    // It is deliberately limited: the previous iterative solver could rotate
    // the clavicle without restraint and pull the shoulder across the neck.
    rotateJointToward(clavicle, upperarm, _target, 0.24);

    upperarm.updateWorldMatrix(true, true);
    upperarm.getWorldPosition(_shoulder);
    forearm.getWorldPosition(_elbow);
    hand.getWorldPosition(_hand);
    const upperLength = Math.max(0.001, _shoulder.distanceTo(_elbow));
    const lowerLength = Math.max(0.001, _elbow.distanceTo(_hand));
    _direction.copy(_target).sub(_shoulder);
    const rawDistance = _direction.length();
    if (rawDistance < 1e-5) return _hand.distanceTo(_target);
    _direction.multiplyScalar(1 / rawDistance);
    const distance = THREE.MathUtils.clamp(rawDistance,
      Math.abs(upperLength - lowerLength) + 0.002,
      upperLength + lowerLength - 0.003);

    _poleTarget.fromArray(localPole || (side === 'R'
      ? [0.45, 1.10, 0.08] : [-0.42, 1.09, -0.06]));
    _poleTarget.y += groundOffset;
    root.localToWorld(_poleTarget);
    _toTarget.copy(_poleTarget).sub(_shoulder);
    _poleDirection.copy(_toTarget)
      .addScaledVector(_direction, -_toTarget.dot(_direction));
    if (_poleDirection.lengthSq() < 1e-7) {
      _poleDirection.set(side === 'R' ? 1 : -1, -0.2, 0);
        root.localToWorld(_poleDirection).sub(root.getWorldPosition(_joint));
      _poleDirection.addScaledVector(_direction, -_poleDirection.dot(_direction));
    }
    _poleDirection.normalize();
    const along = (upperLength * upperLength - lowerLength * lowerLength
      + distance * distance) / (2 * distance);
    const bend = Math.sqrt(Math.max(0.0001, upperLength * upperLength - along * along));
    _desiredElbow.copy(_shoulder).addScaledVector(_direction, along)
      .addScaledVector(_poleDirection, bend);

    rotateJointToward(upperarm, forearm, _desiredElbow);
    upperarm.updateWorldMatrix(true, true);
    rotateJointToward(forearm, hand, _target);
    hand.updateWorldMatrix(true, false);
    hand.getWorldPosition(_end);
    return _end.distanceTo(_target);
  }

  function updateGroundContact(dt, state, animation) {
    const left = rig.bones.get('L_Foot');
    const right = rig.bones.get('R_Foot');
    const planted = state.grounded !== false && !state.seated && !state.crouching
      && GROUND_CONTACT_STATES.has(animation) && left && right;
    if (planted) {
      root.updateWorldMatrix(true, true);
      left.getWorldPosition(_leftFoot);
      right.getWorldPosition(_rightFoot);
      root.worldToLocal(_leftFoot);
      root.worldToLocal(_rightFoot);
      const lowest = Math.min(_leftFoot.y, _rightFoot.y);
      const target = THREE.MathUtils.clamp(
        groundOffset + FOOT_PLANT_HEIGHT - lowest, -0.095, 0.045);
      groundOffset = THREE.MathUtils.damp(groundOffset, target, 52, dt);
    } else {
      groundOffset = THREE.MathUtils.damp(groundOffset, 0, 18, dt);
    }
    model.position.y = plantedModelY + groundOffset;
    return groundOffset;
  }

  function updateWeaponPose(state) {
    const pose = WEAPON_POSES[weaponFamily] || WEAPON_POSES.rifle;
    weaponMount.position.fromArray(pose.position);
    // `root.position.y` already lowers the whole character for crouching and
    // sitting. Lowering the mount a second time dragged the gun below the
    // chest and forced the arms into an impossible reach.
    weaponMount.position.y += groundOffset;

    if (state.aimTarget?.isVector3) {
      root.updateWorldMatrix(true, false);
      _mountWorld.copy(weaponMount.position);
      root.localToWorld(_mountWorld);
      if (_mountWorld.distanceToSquared(state.aimTarget) > 1e-6) {
        _lookMatrix.lookAt(_mountWorld, state.aimTarget, _worldUp);
        _worldAim.setFromRotationMatrix(_lookMatrix);
        root.getWorldQuaternion(_parentWorld);
        weaponMount.quaternion.copy(_parentWorld).invert().multiply(_worldAim);
      }
    } else {
      weaponMount.rotation.set(...pose.rotation);
    }

    // A short, procedural recoil is part of the holding pose. It moves the
    // visible third-person muzzle without changing where the round is traced.
    const kick = THREE.MathUtils.clamp(state.recoil || 0, 0, 1.4);
    if (kick > 0) {
      weaponMount.position.y += kick * 0.018;
      weaponMount.position.z += kick * 0.035;
      _layer.setFromAxisAngle(_axisX, kick * 0.13);
      weaponMount.quaternion.multiply(_layer);
    }

    if (!state.armed || !weaponVisible || !weapon) {
      gripError.right = gripError.left = null;
      return;
    }
    root.updateWorldMatrix(true, true);
    gripError.right = solveArm('R', pose.right, pose.rightPole);
    gripError.left = solveArm('L', pose.left, pose.leftPole);
  }

  function update(dt, state = {}) {
    climbTimer = Math.max(0, climbTimer - dt);
    stairTimer = Math.max(0, stairTimer - dt);
    forcedTimer = Math.max(0, forcedTimer - dt);
    if (forcedTimer === 0) forcedAction = null;
    root.rotation.y = state.yaw || 0;

    const animation = chooseState(state);
    playState(animation, state);
    mixer.update(dt);

    let drop = 0;
    if (state.seated) {
      drop = 0.38;
    } else if (state.crouching) {
      drop = 0.18;
    }
    root.position.y = -drop;
    updateGroundContact(dt, state, animation);
    applyUpperBodyHold(state);
    updateWeaponPose(state);
    syncVisibility();
  }

  playState('stand', { speed: 0 });

  return {
    root,
    model,
    weaponMount,
    rig,
    mixer,
    clips,
    actions,
    update,
    setWeapon,
    triggerAction(name) {
      if (!actions[name] || !LOOP_ONCE.has(name)) return false;
      forcedAction = name;
      forcedTimer = Math.max(0.12, clips[name].duration / Math.max(1, animationRate(name, {})));
      return true;
    },
    muzzleWorldPosition(out = new THREE.Vector3()) {
      const pose = WEAPON_POSES[weaponFamily] || WEAPON_POSES.rifle;
      out.fromArray(pose.muzzle);
      weaponMount.updateWorldMatrix(true, false);
      return weaponMount.localToWorld(out);
    },
    animationNames: () => Object.keys(clips),
    animationState: () => currentState,
    weaponFamily: () => weaponFamily,
    gripError: () => ({ ...gripError }),
    groundOffset: () => groundOffset,
    travelSpeed: (name) => travelSpeeds[name] ?? null,
    setVisible(value) { visible = !!value; syncVisibility(); },
    setWeaponVisible(value) { weaponVisible = !!value; syncVisibility(); },
    setObstructed(value) { obstructed = !!value; syncVisibility(); },
    bounds() {
      model.updateMatrixWorld(true);
      return _box.setFromObject(model).clone();
    },
  };
}

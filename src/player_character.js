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

// Below this much of the weapon in the hands, the hands are off it entirely.
const GRIP_RELEASE = 0.55;
// Above this the walk cycle is being asked to do a job the run cycle is for.
const WALK_TO_RUN = 1.55;
const WALK_RATE_LIMITS = Object.freeze([0.72, 1.55]);
const RUN_RATE_LIMITS = Object.freeze([0.70, 1.95]);
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
const _armRest = [new THREE.Quaternion(), new THREE.Quaternion()];
const _slungPosition = new THREE.Vector3();
const _slungQuaternion = new THREE.Quaternion();
const _handsPosition = new THREE.Vector3();
const _handsQuaternion = new THREE.Quaternion();
const _readyQuaternion = new THREE.Quaternion();
const _boneMatrix = new THREE.Matrix4();
const _stanceEuler = new THREE.Euler();

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

// How a weapon is carried, and it is never only one way.
//
// The game had a single pose per weapon: chest height, pointing where the
// player looked, arms solved onto it whatever the body was doing. Running with
// a rifle therefore locked the torso in a firing stance over a sprinting pair
// of legs, and the barrel swung through the character's own chest. A soldier
// carries a rifle three ways, and which one tells you what they are about to
// do - so the game should too.
//
// Each stance is expressed as an offset from the family's aimed pose, so
// adding a weapon family means describing it once.
const CARRY_STANCES = Object.freeze({
  // Slung: running. The weapon rides the back on its sling, both hands are
  // free to swing, and the upper body is given back to the run animation.
  slung: {
    // Relative to the upper spine, so it rides the torso rather than floating
    // behind a body that is leaning into its stride.
    bone: 'Spine02',
    rifle: { position: [-0.04, -0.02, 0.21], rotation: [0.22, 0.16, -1.98] },
    pistol: { position: [0.19, -0.36, 0.10], rotation: [0.12, 0.18, -0.40] },
    blade: { position: [0.21, -0.36, 0.09], rotation: [0.08, 0.10, -0.30] },
  },
  // Low ready: walking and standing. In both hands, tucked in against the
  // chest, muzzle down and off the line of anyone in front.
  ready: {
    offset: [-0.02, -0.07, 0.15], rotation: [-0.52, 0.16, 0.05],
    pistolOffset: [-0.01, -0.10, 0.13], pistolRotation: [-0.62, 0.10, 0.03],
  },
});

// Which stance a family slings like. Long guns go on the back; anything short
// goes on the hip.
const SLUNG_KIND = Object.freeze({
  rifle: 'rifle', sniper: 'rifle', shotgun: 'rifle', smg: 'rifle',
  pistol: 'pistol', revolver: 'pistol', blade: 'blade',
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
  // How much of the weapon's weight is in the hands (0 = slung on the body)
  // and how far up into the shoulder it has come.
  let hands = 1;
  let aimBlend = 0;
  let holdWeight = 1;
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
      // A cycle stretched past about twice its authored speed stops reading as
      // the same gait, so the rate is held inside the band where it does and
      // the remainder is allowed to show as a little foot slide. That is a far
      // smaller sin than fast-forward.
      const [slowest, fastest] = name === 'run' ? RUN_RATE_LIMITS : WALK_RATE_LIMITS;
      return THREE.MathUtils.clamp(
        (state.speed || 0) / Math.max(0.15, travelSpeeds[name]), slowest, fastest);
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
    // Pick the cycle by how fast they are actually going, not by whether the
    // sprint key is down. The default outdoor speed is 3.05 m/s - a jog - and
    // it was playing a walk cycle authored at 1 m/s three times too fast,
    // which is what made the locomotion look like a wind-up toy. The run cycle
    // strides at 2.36 m/s and covers that speed at a natural rate.
    if (!state.seated && speed > 0.11) {
      return speed >= WALK_TO_RUN || state.running ? 'run' : 'walk';
    }
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

  function applyUpperBodyHold(state, hold) {
    if (!state.armed || !weapon || weaponFamily === 'blade' || currentState === 'melee') return;
    // `hold` is how much of the character is holding the weapon. At zero the
    // gun is on their back and the run animation owns the arms completely,
    // which is the whole point: a sprinting figure swings its arms.
    if (hold <= 0.001) return;
    for (const [name, weight] of Object.entries(UPPER_BODY_WEIGHTS)) {
      const bone = rig.bones.get(name);
      const neutral = neutralUpperBody.get(name);
      if (bone && neutral) bone.quaternion.slerp(neutral, weight * hold);
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
  function solveArm(side, localTarget, localPole, weight = 1) {
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

    // Solve, then ease the result back toward the animated arm by however much
    // of the weapon's weight the character is actually taking. Without this the
    // hands snap onto the gun the instant a sprint ends.
    _armRest[0].copy(upperarm.quaternion);
    _armRest[1].copy(forearm.quaternion);
    rotateJointToward(upperarm, forearm, _desiredElbow);
    upperarm.updateWorldMatrix(true, true);
    rotateJointToward(forearm, hand, _target);
    if (weight < 0.999) {
      upperarm.quaternion.slerp(_armRest[0], 1 - weight);
      forearm.quaternion.slerp(_armRest[1], 1 - weight);
      upperarm.updateWorldMatrix(true, true);
    }
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

  // A damped blend approaches its target and never arrives, so a weapon that
  // is "aimed" stays a thousandth short of aimed for ever and the sights never
  // quite line up. Land it.
  function settle(value) {
    if (value > 0.998) return 1;
    if (value < 0.002) return 0;
    return value;
  }

  /** Where the weapon rides when it is on the body rather than in the hands. */
  function slungTransform() {
    const kind = SLUNG_KIND[weaponFamily] || 'rifle';
    const stance = CARRY_STANCES.slung[kind] || CARRY_STANCES.slung.rifle;
    const bone = rig.bones.get(CARRY_STANCES.slung.bone);

    // The spine gives the height and the lean - so the weapon rides the torso
    // rather than floating behind a body bent into its stride - but the offset
    // itself is in the character's own frame. A spine bone's local axes run
    // along the bone, and treating them as forward and back is what put the
    // rifle inside the ribcage.
    if (bone) {
      bone.updateWorldMatrix(true, false);
      bone.getWorldPosition(_slungPosition);
      root.worldToLocal(_slungPosition);
    } else {
      _slungPosition.set(0, 1.32, 0);
    }
    _slungPosition.x += stance.position[0];
    _slungPosition.y += stance.position[1] + groundOffset;
    // The character faces -Z, so behind them is +Z.
    _slungPosition.z += stance.position[2];

    _stanceEuler.set(...stance.rotation);
    _slungQuaternion.setFromEuler(_stanceEuler);
  }

  /** The two-handed pose, from low ready through to fully aimed. */
  function handsTransform(state, pose, aim) {
    const short = weaponFamily === 'pistol' || weaponFamily === 'revolver';
    const stance = CARRY_STANCES.ready;
    const offset = short ? stance.pistolOffset : stance.offset;
    const tilt = short ? stance.pistolRotation : stance.rotation;

    _handsPosition.fromArray(pose.position);
    // Low ready pulls the weapon in against the chest and drops the muzzle;
    // aiming pushes it back out onto the line of sight. Blending the two is
    // what makes bringing a gun up read as a movement rather than a snap.
    _handsPosition.x += offset[0] * (1 - aim);
    _handsPosition.y += offset[1] * (1 - aim);
    _handsPosition.z += offset[2] * (1 - aim);
    _handsPosition.y += groundOffset;

    _stanceEuler.set(...pose.rotation);
    _handsQuaternion.setFromEuler(_stanceEuler);
    if (state.aimTarget?.isVector3 && aim > 0.001) {
      root.updateWorldMatrix(true, false);
      _mountWorld.copy(_handsPosition);
      root.localToWorld(_mountWorld);
      if (_mountWorld.distanceToSquared(state.aimTarget) > 1e-6) {
        _lookMatrix.lookAt(_mountWorld, state.aimTarget, _worldUp);
        _worldAim.setFromRotationMatrix(_lookMatrix);
        root.getWorldQuaternion(_parentWorld);
        _worldAim.premultiply(_parentInverse.copy(_parentWorld).invert());
        _handsQuaternion.slerp(_worldAim, aim);
      }
    }
    if (aim < 0.999) {
      _stanceEuler.set(tilt[0] * (1 - aim), tilt[1] * (1 - aim), tilt[2] * (1 - aim));
      _handsQuaternion.multiply(_readyQuaternion.setFromEuler(_stanceEuler));
    }
  }

  /**
   * Decide where the weapon is between the back and the shoulder, and how much
   * of it is in the hands. Run before the upper-body hold, because the hold is
   * worth exactly as much as the grip is.
   */
  function updateCarryBlend(dt, state) {
    // Three states, and the difference between them is what the player reads
    // off another figure at fifty metres: gun on the back means running, gun
    // in both hands means walking up on something, gun in the shoulder means
    // about to fire.
    // Firing counts as aiming whatever the sights are doing: a shot from the
    // hip still comes up onto the target, and a muzzle pointing at the floor
    // while the tracer leaves the crosshair is the sort of detail that makes a
    // game feel wrong without the player being able to say why.
    const firing = (state.recoil || 0) > 0.02;
    // Sitting down does not put a weapon away - someone in a chair with a
    // rifle across their knees is still holding it - so only running slings it.
    const wantsHands = !!state.armed && (!state.running || firing);
    const wantsAim = !!state.aiming || firing;
    hands = settle(THREE.MathUtils.damp(hands, wantsHands || wantsAim ? 1 : 0,
      wantsHands || wantsAim ? 9 : 12, dt));
    aimBlend = settle(THREE.MathUtils.damp(aimBlend, wantsAim ? 1 : 0, wantsAim ? 14 : 10, dt));
    // How much the hands are actually on the weapon, which is not the same as
    // where the weapon is. Letting go happens early and fast: a rifle going
    // onto its sling is released and then travels, and hands that follow it
    // all the way there sweep across the body and cross over each other.
    const reach = THREE.MathUtils.clamp((hands - GRIP_RELEASE) / (1 - GRIP_RELEASE), 0, 1);
    holdWeight = reach * reach * (3 - 2 * reach);
  }

  function updateWeaponPose(state) {
    const pose = WEAPON_POSES[weaponFamily] || WEAPON_POSES.rifle;
    const aim = aimBlend * hands;
    const grip = holdWeight;

    handsTransform(state, pose, aim);
    if (hands > 0.999) {
      weaponMount.position.copy(_handsPosition);
      weaponMount.quaternion.copy(_handsQuaternion);
    } else {
      slungTransform();
      weaponMount.position.copy(_slungPosition).lerp(_handsPosition, hands);
      weaponMount.quaternion.copy(_slungQuaternion).slerp(_handsQuaternion, hands);
    }

    // A short, procedural recoil is part of the holding pose. It moves the
    // visible third-person muzzle without changing where the round is traced.
    const kick = THREE.MathUtils.clamp(state.recoil || 0, 0, 1.4) * hands;
    if (kick > 0) {
      weaponMount.position.y += kick * 0.018;
      weaponMount.position.z += kick * 0.035;
      _layer.setFromAxisAngle(_axisX, kick * 0.13);
      weaponMount.quaternion.multiply(_layer);
    }

    if (!state.armed || !weaponVisible || !weapon || grip <= 0.02) {
      gripError.right = gripError.left = null;
      return;
    }
    root.updateWorldMatrix(true, true);
    gripError.right = solveArm('R', pose.right, pose.rightPole, grip);
    gripError.left = solveArm('L', pose.left, pose.leftPole, grip);
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
    // The blend runs first: it decides how much of the weapon is in the hands,
    // and that is what the upper-body hold is worth this frame. Then the hold
    // sets the firing stance, and the solver puts the hands on the weapon.
    updateCarryBlend(dt, state);
    applyUpperBodyHold(state, holdWeight);
    updateWeaponPose(state);
    syncVisibility();
  }

  /**
   * How fast a locomotion cycle actually carries the character, measured from
   * its own feet.
   *
   * This used to be read off the Hip translation track, first sample to last.
   * For a cycle authored in place - which these are - that displacement is
   * noise, and it came out at 0.64 m/s for a walk. The game walks at 2 m/s, so
   * the clip was driven at 3.1 times its natural speed: a stroll played at a
   * scuttle, with the feet skating over the ground because the stride was
   * never as long as the distance covered. Watching the planted foot travel
   * backwards through the character over one cycle gives the real stride, and
   * the real stride is what the playback rate has to match.
   */
  function measureStride(name) {
    const clip = clips[name];
    if (!clip || clip.duration <= 0) return travelSpeeds[name] || 1;
    const left = rig.bones.get('L_Foot');
    const right = rig.bones.get('R_Foot');
    if (!left || !right) return travelSpeeds[name] || 1;

    const restore = [];
    for (const [key, action] of Object.entries(actions)) {
      restore.push([action, action.enabled, action.weight]);
      action.stop();
      action.enabled = key === name;
      action.setEffectiveWeight(key === name ? 1 : 0);
      action.setEffectiveTimeScale(1);
      if (key === name) action.play();
    }

    const steps = 72;
    const point = new THREE.Vector3();
    let stride = 0;
    let previous = null;
    let previousSide = null;
    for (let step = 0; step <= steps; step++) {
      mixer.setTime((step / steps) * clip.duration);
      model.updateMatrixWorld(true);
      const lowLeft = root.worldToLocal(left.getWorldPosition(point.clone()));
      const lowRight = root.worldToLocal(right.getWorldPosition(point.clone()));
      const side = lowLeft.y <= lowRight.y ? 'L' : 'R';
      const foot = side === 'L' ? lowLeft : lowRight;
      // Only while the same foot stays down: the swap from one foot to the
      // other is not stride, it is the other leg arriving.
      if (previous && side === previousSide) stride += Math.max(0, foot.z - previous.z);
      previous = foot;
      previousSide = side;
    }

    for (const [action, enabled, weight] of restore) {
      action.stop();
      action.enabled = enabled;
      action.setEffectiveWeight(weight);
    }
    mixer.setTime(0);
    return stride > 0.05 ? stride / clip.duration : (travelSpeeds[name] || 1);
  }

  for (const name of ['walk', 'run', 'stairsUp', 'stairsDown', 'flee']) {
    if (clips[name]) travelSpeeds[name] = measureStride(name);
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
    // What the weapon is doing, for the QA harness and the HUD.
    carry: () => (hands < 0.35 ? 'slung' : aimBlend * hands > 0.6 ? 'aimed' : 'ready'),
    carryBlend: () => ({ hands: +hands.toFixed(3), aim: +aimBlend.toFixed(3) }),
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

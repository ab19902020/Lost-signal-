import * as THREE from 'three';
import { cloneGLTF } from './assets.js';
import { createNavigator } from './navigation.js';

const HEIGHT = 1.78;
const DETECT = 96;
const FORGET = 138;
const ACTIVATE = 185;
const MEMORY_SECONDS = 12;
const CORNERED_RANGE = 1.45;
const PANIC_RANGE = 6.5;
const ASSAULT_RENDER_DISTANCE = 230;
// A man sitting in a car is smaller on screen than a man running at you, but
// he is the one you are trying to shoot, so he is drawn a good way out.
const RIDER_RENDER_DISTANCE = 190;
const ASSAULT_RUN_SPEED = 3.35;
const STRATEGIC_RUN_SPEED = 8.0;
const PERSONALITY = Object.freeze({
  black: Object.freeze({ courage: 0.24, patience: 1.25, pace: 0.92 }),
  red: Object.freeze({ courage: 0.46, patience: 0.82, pace: 1.04 }),
});

// How each attacker goes about it, drawn fresh every time the world is built.
//
// The siege used to be one script: both men ran down the middle of the road at
// the same speed, hit the gate, walked their own lane across the yard and hit
// the door. It was the same every game and it read as two things on rails.
// A plan changes where they come from, how they move while they do it, and
// what they do when the player turns up - so two playthroughs are not the same
// afternoon twice.
const ASSAULT_PLANS = Object.freeze([
  {
    key: 'rush', lane: 0.0, pace: 1.14, bound: 0, standoff: 0,
    contact: 'charge', label: 'straight up the middle at a run',
  },
  {
    key: 'left-hook', lane: -1.0, pace: 1.0, bound: 0, standoff: 0,
    contact: 'flank', label: 'wide on the left and in at the corner',
  },
  {
    key: 'right-hook', lane: 1.0, pace: 1.0, bound: 0, standoff: 0,
    contact: 'flank', label: 'wide on the right and in at the corner',
  },
  {
    key: 'bounding', lane: -0.5, pace: 0.92, bound: 1, standoff: 0,
    contact: 'cover', label: 'short rushes with a look between each',
  },
  {
    key: 'patient', lane: 0.7, pace: 0.86, bound: 1, standoff: 26,
    contact: 'cover', label: 'holds off and waits for the yard to go quiet',
  },
  {
    key: 'creep', lane: -0.8, pace: 0.78, bound: 0, standoff: 0,
    contact: 'cover', label: 'walks the whole way in and keeps to the edges',
  },
]);

// Long enough that a plan is a plan rather than a twitch, short enough that a
// bound reads as a decision.
const BOUND_RUN = 2.6;
const BOUND_LOOK = 1.1;
// Travelled less than this in this long, while it had somewhere to be? Stuck.
const STUCK_TRAVEL = 0.22;
const STUCK_SECONDS = 0.9;
// Close enough that the player is the problem rather than the car.
const CONTACT_RANGE = 15;
// How long one of them will stand at a door before giving up on his mate and
// driving off without him.
const BOARD_PATIENCE = 9;
const _box = new THREE.Box3();
const _size = new THREE.Vector3();
const _toward = new THREE.Vector3();
const _sample = new THREE.Vector3();

function segmentHitsBounds(a, b, box, radius) {
  let first = 0;
  let last = 1;
  for (const axis of ['x', 'z']) {
    const start = a[axis];
    const direction = b[axis] - start;
    const minimum = box.min[axis] - radius;
    const maximum = box.max[axis] + radius;
    if (Math.abs(direction) < 1e-7) {
      if (start < minimum || start > maximum) return false;
      continue;
    }
    let enter = (minimum - start) / direction;
    let leave = (maximum - start) / direction;
    if (enter > leave) [enter, leave] = [leave, enter];
    first = Math.max(first, enter);
    last = Math.min(last, leave);
    if (first > last) return false;
  }
  return last >= 0 && first <= 1;
}

// The supplied people are intentionally high-detail skinned meshes. Raycasting
// all 235k triangles every pellet froze phones, especially with a shotgun. The
// invisible body volumes follow the root and give ballistics three useful hit
// regions while the authored mesh remains purely visual.
const hitMaterial = new THREE.MeshBasicMaterial({ visible: false });
const hitGeometries = Object.freeze({
  head: new THREE.SphereGeometry(.23, 8, 6),
  torso: new THREE.BoxGeometry(.54, .76, .34),
  hips: new THREE.BoxGeometry(.48, .52, .32),
});

export const TOWN_ENEMY_ANIMATIONS = Object.freeze({
  black: Object.freeze({
    // The upload's NlaTrack order is not its filename order. Motion analysis
    // identifies the travelling flee/run takes at 1/8 and the full-body fall
    // at 6; the previous 5-as-run mapping was a stationary 13-second gesture.
    laugh: 0, flee: 1, dance: 2, foldArms: 3, stairsUp: 4,
    clap: 5, fall: 6, turn: 7, run: 8,
  }),
  red: Object.freeze({
    climb: 0, run: 1, walk: 2, turn: 3, gesture: 4,
    fall: 5, dance: 6, melee: 7, jump: 8,
  }),
});

function authoredTravelSpeed(source) {
  const track = source.tracks.find((entry) => /Hip\.position$/.test(entry.name));
  if (!track || source.duration <= 0) return 1;
  const stride = track.getValueSize();
  const last = track.values.length - stride;
  return Math.hypot(
    track.values[last] - track.values[0],
    track.values[last + 1] - track.values[1],
  ) / source.duration;
}

function inPlace(source, name, hipBind) {
  const clip = source.clone();
  clip.name = name;
  for (const track of clip.tracks) {
    if (!/Hip\.position$/.test(track.name)) continue;
    const stride = track.getValueSize();
    const z = track.values[2];
    for (let offset = 0; offset < track.values.length; offset += stride) {
      track.values[offset] = hipBind.x;
      track.values[offset + 1] = hipBind.y;
      track.values[offset + 2] = hipBind.z + track.values[offset + 2] - z;
    }
  }
  return clip;
}

function stillClip(source, name) {
  const tracks = source.tracks.map((track) => {
    const stride = track.getValueSize();
    const sample = track.createInterpolant(new Float32Array(stride)).evaluate(0);
    const values = new Float32Array(stride * 2);
    values.set(sample); values.set(sample, stride);
    return new track.constructor(track.name, new Float32Array([0, 1]), values,
      track.getInterpolation());
  });
  return new THREE.AnimationClip(name, 1, tracks);
}

function addHitVolumes(root) {
  const volumes = [
    ['Enemy_Hit_Head', hitGeometries.head, [0, 1.56, 0]],
    ['Enemy_Hit_Torso', hitGeometries.torso, [0, 1.12, 0]],
    ['Enemy_Hit_Hips', hitGeometries.hips, [0, .64, 0]],
  ].map(([name, geometry, position]) => {
    const mesh = new THREE.Mesh(geometry, hitMaterial);
    mesh.name = name;
    mesh.position.set(...position);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.userData.hitProxy = true;
    root.add(mesh);
    return mesh;
  });
  root.userData.hitVolumes = volumes;
  return volumes;
}

function prepareModel(gltf, style, lowCost = false, sharedMelee = null) {
  const root = new THREE.Group();
  const model = cloneGLTF(gltf);
  model.rotation.y = Math.PI; // Tripo's neutral heading is +Z; agents use -Z.
  root.add(model);
  model.updateMatrixWorld(true);
  _box.setFromObject(model); _box.getSize(_size);
  const scale = HEIGHT / Math.max(0.001, _size.y);
  model.scale.multiplyScalar(scale);
  model.updateMatrixWorld(true);
  _box.setFromObject(model);
  model.position.y -= _box.min.y;
  model.traverse((part) => {
    if (!part.isMesh && !part.isSkinnedMesh) return;
    part.castShadow = !lowCost;
    part.receiveShadow = true;
    // Expand the animated bound instead of disabling culling outright. With
    // culling off, both 235k-triangle people were drawn even when the player
    // was looking back at the silo half a kilometre away.
    if (part.isSkinnedMesh && part.computeBoundingSphere) {
      part.computeBoundingSphere();
      if (part.boundingSphere) part.boundingSphere.radius *= 1.45;
    } else {
      part.geometry?.computeBoundingSphere();
      if (part.geometry?.boundingSphere) part.geometry.boundingSphere.radius *= 1.25;
    }
    part.frustumCulled = true;
  });

  const hip = model.getObjectByName('Hip');
  const map = TOWN_ENEMY_ANIMATIONS[style];
  const mixer = new THREE.AnimationMixer(model);
  const clips = {};
  const actions = {};
  const travelSpeeds = {};
  for (const [name, index] of Object.entries(map)) {
    const source = gltf.animations[index];
    travelSpeeds[name] = authoredTravelSpeed(source) * scale;
    clips[name] = inPlace(source, name, hip?.position || new THREE.Vector3());
    const action = mixer.clipAction(clips[name]);
    action.enabled = true;
    if (name === 'fall' || name === 'melee' || name === 'clap' || name === 'laugh'
      || name === 'gesture' || name === 'turn') {
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
    }
    actions[name] = action;
  }
  if (style === 'black') {
    // Track 4 is a clean planted stepping cycle. Reuse it for ordinary patrol
    // while preserving the source take under its stairsUp name as well.
    clips.walk = clips.stairsUp.clone();
    clips.walk.name = 'walk';
    actions.walk = mixer.clipAction(clips.walk);
    actions.walk.enabled = true;
    travelSpeeds.walk = travelSpeeds.stairsUp;
    // Both uploads share the same named humanoid rig. The black-coated man has
    // no attack take, so retarget the red-coated man's real melee clip rather
    // than turning a clap or laugh into a fake combat animation.
    if (sharedMelee) {
      clips.melee = inPlace(sharedMelee, 'melee', hip?.position || new THREE.Vector3());
      actions.melee = mixer.clipAction(clips.melee);
      actions.melee.enabled = true;
      actions.melee.setLoop(THREE.LoopOnce, 1);
      actions.melee.clampWhenFinished = true;
      travelSpeeds.melee = 0;
    }
  }
  // A frozen first frame from the walk is a neutral planted stance. The old
  // red stand was sampled from its dance clip and visibly posed between beats.
  clips.stand = stillClip(clips.walk, 'stand');
  actions.stand = mixer.clipAction(clips.stand);
  actions.stand.enabled = true;
  return { root, model, mixer, clips, actions, travelSpeeds };
}

// --- Sitting in the car ----------------------------------------------------
//
// Neither upload has a seated take, and there is no honest way to fake one out
// of a walk cycle. So the pose is built: hips folded forward, knees folded
// down, spine settled back, and for whoever has the wheel, hands out in front
// of him.
//
// Which way a joint folds cannot be hardcoded, because it depends on how the
// rig was authored and these two came out of a generator. So it is measured
// once per skeleton: nudge the joint, see which way its child actually went,
// and keep the axis and the sign that moved it the right way. A pose that
// calibrates itself is a pose that survives the next upload.
const SEAT_POSE = Object.freeze({
  // Every one of these was read off the rig rather than guessed: swept through
  // its range with the foot, the knee and the hand measured at each step, and
  // set where they land on the floor pan and the wheel.
  hip: 1.42,      // radians of thigh flexion - thighs come up to horizontal
  knee: 0.35,     // shins forward into the footwell, soles on the floor
  lean: 0.14,     // settled back into the seat rather than sitting bolt upright
  shoulder: 0.75, // driver: arms out towards the wheel
  elbow: 0.35,
  restShoulder: 0.30, // passenger: hands in his lap, not on anything
  restElbow: 0.95,
  adduct: 0.52,   // and both of them keep their elbows inside the car
});
const _seatPoint = new THREE.Vector3();
const _hingeFrom = new THREE.Vector3();
const _hingeTo = new THREE.Vector3();
const _hingeAxis = new THREE.Vector3();

// The local axis of `bone` that swings `child` along `want`, and which sign of
// rotation does it. Returns null when the bone has nothing to measure against.
function hinge(bone, child, want) {
  if (!bone || !child) return null;
  const rest = bone.quaternion.clone();
  let best = null;
  for (let axis = 0; axis < 3; axis++) {
    for (const sign of [1, -1]) {
      bone.quaternion.copy(rest);
      _hingeAxis.set(axis === 0 ? 1 : 0, axis === 1 ? 1 : 0, axis === 2 ? 1 : 0);
      bone.updateWorldMatrix(true, true);
      child.getWorldPosition(_hingeFrom);
      bone.rotateOnAxis(_hingeAxis, sign * 0.35);
      bone.updateWorldMatrix(true, true);
      child.getWorldPosition(_hingeTo);
      const moved = _hingeTo.sub(_hingeFrom).dot(want);
      if (!best || moved > best.moved) best = { axis, sign, moved };
    }
  }
  bone.quaternion.copy(rest);
  bone.updateWorldMatrix(true, true);
  if (!best || best.moved < 1e-4) return null;
  return { bone, rest, axis: new THREE.Vector3(
    best.axis === 0 ? 1 : 0, best.axis === 1 ? 1 : 0, best.axis === 2 ? 1 : 0), sign: best.sign };
}

class TownEnemy {
  constructor({ gltf, style, scene, colliders, position, heading, name, patrol,
    cover = [], navigationObstacles = [], lowCost = false, sharedMelee = null,
    assaultRoute = [], yardRoute = [], mission = {}, navigator = null,
    plan = ASSAULT_PLANS[0], squad = null }) {
    Object.assign(this, prepareModel(gltf, style, lowCost, sharedMelee));
    this.style = style;
    this.root.name = name;
    this.root.position.set(...position);
    this.root.rotation.y = heading;
    this.home = new THREE.Vector3(...position);
    this.patrol = patrol.map(([x, z]) => new THREE.Vector3(x, position[1], z));
    this.cover = cover.map(([x, z]) => new THREE.Vector3(x, position[1], z));
    this.navigationObstacles = navigationObstacles.filter(Boolean).map((box) => box.clone());
    // Push the whole approach sideways by the plan's lane. Computed against
    // each segment rather than a fixed axis, so a route that bends round the
    // countryside keeps its offset relative to the road rather than sliding
    // into the ditch on one side of it.
    this.assaultRoute = assaultRoute.map(([x, z], index) => {
      const point = new THREE.Vector3(x, position[1], z);
      if (!plan.lane || assaultRoute.length < 2) return point;
      const other = assaultRoute[Math.min(index + 1, assaultRoute.length - 1)]
        === assaultRoute[index] ? assaultRoute[index - 1] : assaultRoute[Math.min(index + 1, assaultRoute.length - 1)];
      const dx = other[0] - x;
      const dz = other[1] - z;
      const length = Math.hypot(dx, dz) || 1;
      // Perpendicular, and gently faded out at the end so both lanes still
      // arrive at the gate rather than at the fence either side of it.
      const taper = 1 - index / Math.max(1, assaultRoute.length - 1);
      point.x += (-dz / length) * plan.lane * 5.5 * taper;
      point.z += (dx / length) * plan.lane * 5.5 * taper;
      return point;
    });
    this.yardRoute = yardRoute.map(([x, z]) => new THREE.Vector3(x, position[1], z));
    this.mission = mission;
    this.navigator = navigator;
    this.plan = plan;
    this.squad = squad;
    // Bounding: run for a while, then stop and look. Started off-phase so two
    // attackers running the same plan do not move as one animal.
    this.boundTimer = 0;
    this.bounding = false;
    this.contactTarget = null;
    this.contactTimer = 0;
    this.holding = null;
    this.carDoor = null;
    this.boardTimer = 0;
    // Who takes the wheel. Assigned by the squad so there is exactly one of
    // each, and reassigned if the driver is shot before he reaches the door.
    this.role = 'passenger';
    this.stuckWatch = new THREE.Vector3(...position);
    this.stuckWatchTimer = 0;
    this.unstickAttempts = 0;
    this.replans = 0;
    // Seconds left flat on the deck after a car hit him.
    this.downed = 0;
    this.assaulting = this.assaultRoute.length > 0;
    this.assaultIndex = 0;
    this.yardIndex = 0;
    this.avoidTarget = null;
    this.breachHits = 0;
    this.patrolIndex = 0;
    this.coverIndex = -1;
    this.coverCooldowns = new Float32Array(this.cover.length);
    this.target = null;
    this.destination = null;
    this.route = [];
    this.stuckTimer = 0;
    this.current = null;
    this.currentAction = null;
    this.attackCooldown = 0;
    this.alerted = this.assaulting;
    this.dead = false;
    this.deathTimer = 0;
    this.deathSettled = false;
    this.state = this.assaulting ? 'assault_road' : 'patrol';
    this.stateTimer = 0.4;
    this.thinkTimer = 0;
    this.memoryTimer = 0;
    this.lastSeen = this.home.clone();
    this.canSeePlayer = false;
    this.activated = this.assaulting;
    this.decisionCount = 0;
    this.maxFrameTravel = 0;
    this.maxFrameTravelState = this.state;
    this.seed = [...name].reduce((value, character) =>
      (Math.imul(value ^ character.charCodeAt(0), 16777619) >>> 0), 2166136261);
    this.personality = PERSONALITY[style] || PERSONALITY.red;
    this.colliders = colliders;
    this.collider = colliders.addOrientedBox({
      cx: position[0], cz: position[2], halfX: .33, halfZ: .33,
      rotationY: heading, minY: position[1], maxY: position[1] + HEIGHT,
    });
    this.root.userData.kind = 'enemy';
    this.root.userData.alive = true;
    this.root.userData.hp = 120;
    this.root.userData.enemyAgent = this;
    this.root.userData.animationNames = Object.keys(this.actions);
    this.hitVolumes = addHitVolumes(this.root);
    this.model.visible = false;
    scene.add(this.root);
    this.play('stand', 1, 0);
  }

  random() {
    this.seed = (Math.imul(this.seed, 1664525) + 1013904223) >>> 0;
    return this.seed / 4294967296;
  }

  play(name, rate = 1, fade = .16) {
    const next = this.actions[name] || this.actions.stand;
    if (this.current === name) {
      next.setEffectiveTimeScale(rate);
      return;
    }
    const previous = this.currentAction;
    this.current = name;
    this.currentAction = next;
    next.reset().setEffectiveTimeScale(rate).fadeIn(fade).play();
    previous?.fadeOut(fade);
  }

  replay(name, rate = 1, fade = .08) {
    const next = this.actions[name] || this.actions.stand;
    const previous = this.currentAction;
    this.current = name;
    this.currentAction = next;
    next.enabled = true;
    next.reset().setEffectiveTimeScale(rate).fadeIn(fade).play();
    if (previous && previous !== next) previous.fadeOut(fade);
  }

  playTravel(name, speed, multiplier = 1, fade = .16) {
    const authored = Math.max(.18, this.travelSpeeds[name] || speed);
    const rate = THREE.MathUtils.clamp(speed / authored, .72, 2.25) * multiplier;
    this.play(name, rate, fade);
  }

  syncCollider() {
    this.collider.cx = this.root.position.x;
    this.collider.cz = this.root.position.z;
    this.collider.minY = this.root.position.y;
    this.collider.maxY = this.root.position.y + HEIGHT;
    this.collider.cos = Math.cos(this.root.rotation.y);
    this.collider.sin = Math.sin(this.root.rotation.y);
  }

  segmentBlocked(a, b, radius = .06, spacing = .8, includeWorld = true) {
    // Check the two building navigation bounds first, then the real world.
    // The old early return ignored the gate and every yard obstacle whenever
    // building bounds existed, so a route looked clear until the character's
    // feet physically hit an unplanned wall.
    if (this.navigationObstacles.some((box) => segmentHitsBounds(a, b, box, radius))) {
      return true;
    }
    if (this.navigationObstacles.length && !includeWorld) return false;
    _toward.copy(b).sub(a); _toward.y = 0;
    const distance = _toward.length();
    if (distance < .02) return false;
    _toward.multiplyScalar(1 / distance);
    this.collider.enabled = false;
    let blocked = false;
    const samples = Math.min(160, Math.max(2, Math.ceil(distance / spacing)));
    for (let index = 1; index < samples; index++) {
      _sample.copy(a).addScaledVector(_toward, distance * index / samples);
      if (this.colliders.contains(_sample.x, _sample.z, radius,
        this.root.position.y + .12, this.root.position.y + 1.62)) {
        blocked = true;
        break;
      }
    }
    this.collider.enabled = true;
    return blocked;
  }

  lineBlocked(a, b) {
    // Building bounds are sufficient for long-range sight. At contact range,
    // include the real gate/yard collision so nobody punches through a leaf.
    return this.segmentBlocked(a, b, .06, .8, a.distanceToSquared(b) < 16);
  }

  movementBlocked(a, b) {
    if (this.navigationObstacles.length) {
      return this.navigationObstacles.some((box) => segmentHitsBounds(a, b, box, .32));
    }
    return this.segmentBlocked(a, b, .32, .42);
  }

  /**
   * A route to somewhere, by whatever means will actually find one.
   *
   * The grid search is the one that works: it goes around things, and it does
   * not need anybody to have placed a waypoint near the obstacle first. The
   * cover graph is kept behind it because it is cheap and it encodes where the
   * good hiding places are, which a grid knows nothing about.
   */
  planRoute(destination) {
    if (!destination) return [];
    if (this.navigator) {
      this.collider.enabled = false;
      const route = this.navigator.path(this.root.position, destination);
      this.collider.enabled = true;
      if (route && route.length) return route;
    }
    return this.planCoverRoute(destination);
  }

  /** Shortest clear route over the perimeter cover graph. */
  planCoverRoute(destination) {
    if (!destination) return [];
    const points = [this.root.position, ...this.cover];
    let goal = this.cover.indexOf(destination) + 1;
    if (goal <= 0) {
      points.push(destination);
      goal = points.length - 1;
    }
    const costs = new Float64Array(points.length).fill(Infinity);
    const previous = new Int32Array(points.length).fill(-1);
    const visited = new Uint8Array(points.length);
    costs[0] = 0;

    for (let pass = 0; pass < points.length; pass++) {
      let current = -1;
      for (let index = 0; index < points.length; index++) {
        if (!visited[index] && (current < 0 || costs[index] < costs[current])) current = index;
      }
      if (current < 0 || !Number.isFinite(costs[current])) break;
      if (current === goal) break;
      visited[current] = 1;
      for (let next = 1; next < points.length; next++) {
        if (visited[next] || next === current) continue;
        const length = points[current].distanceTo(points[next]);
        if (length < .1 || this.movementBlocked(points[current], points[next])) continue;
        const candidate = costs[current] + length;
        if (candidate < costs[next]) {
          costs[next] = candidate;
          previous[next] = current;
        }
      }
    }

    if (!Number.isFinite(costs[goal])) return [];
    const route = [];
    for (let at = goal; at > 0; at = previous[at]) {
      route.push(points[at].clone());
      if (previous[at] < 0) return [];
    }
    return route.reverse();
  }

  chooseCover(playerPosition, wantHidden = true) {
    if (!this.cover.length) return this.patrol[this.patrolIndex];
    let best = null;
    let bestIndex = -1;
    let bestScore = -Infinity;
    for (let index = 0; index < this.cover.length; index++) {
      if (index === this.coverIndex && this.cover.length > 1) continue;
      const point = this.cover[index];
      const fromPlayer = point.distanceTo(playerPosition);
      if (fromPlayer < 4.5) continue;
      const travel = point.distanceTo(this.root.position);
      const hidden = this.lineBlocked(point, playerPosition);
      const recentPenalty = this.coverCooldowns[index] > 0 ? 18 : 0;
      const score = (hidden === wantHidden ? 55 : 0) + fromPlayer * .24 - travel * .36
        - recentPenalty + ((index * 17 + this.decisionCount * 11) % 9) * .05;
      if (score > bestScore) {
        bestScore = score;
        best = point;
        bestIndex = index;
      }
    }
    if (!best) return this.patrol[this.patrolIndex];
    this.coverIndex = bestIndex;
    this.coverCooldowns[bestIndex] = 5 + this.random() * 4;
    return best;
  }

  beginRelocate(playerPosition, urgent = false) {
    this.destination = this.chooseCover(playerPosition, true);
    this.route = this.planRoute(this.destination);
    this.target = this.route.shift() || this.destination?.clone() || null;
    this.stuckTimer = 0;
    this.state = urgent ? 'evade' : 'seek_cover';
    this.stateTimer = urgent ? 4.8 : 7.2;
    this.decisionCount++;
  }

  beginRoute(destination, state, seconds = 6) {
    this.destination = destination?.clone?.() || null;
    this.route = this.planRoute(this.destination);
    this.target = this.route.shift() || this.destination?.clone?.() || null;
    this.stuckTimer = 0;
    this.state = state;
    this.stateTimer = seconds;
    this.decisionCount++;
  }

  face(target, dt, response = 9) {
    _toward.copy(target).sub(this.root.position); _toward.y = 0;
    if (_toward.lengthSq() < 1e-6) return;
    const yaw = Math.atan2(-_toward.x, -_toward.z);
    const delta = Math.atan2(Math.sin(yaw - this.root.rotation.y),
      Math.cos(yaw - this.root.rotation.y));
    this.root.rotation.y += delta * (1 - Math.exp(-dt * response));
  }

  chooseDetour(target) {
    _toward.copy(target).sub(this.root.position); _toward.y = 0;
    if (_toward.lengthSq() < .01) return null;
    _toward.normalize();
    const preferredSide = this.style === 'black' ? 1 : -1;
    const candidates = [
      preferredSide * .55, -preferredSide * .55,
      preferredSide * 1.0, -preferredSide * 1.0,
      preferredSide * 1.42, -preferredSide * 1.42,
    ];
    let best = null;
    let bestScore = Infinity;
    this.collider.enabled = false;
    for (const angle of candidates) {
      const sin = Math.sin(angle); const cos = Math.cos(angle);
      const x = _toward.x * cos - _toward.z * sin;
      const z = _toward.x * sin + _toward.z * cos;
      for (const reach of [1.15, 1.9, 2.8]) {
        const candidate = new THREE.Vector3(
          this.root.position.x + x * reach,
          this.root.position.y,
          this.root.position.z + z * reach,
        );
        if (this.colliders.contains(candidate.x, candidate.z, .34,
          candidate.y + .12, candidate.y + 1.62)) continue;
        const score = candidate.distanceToSquared(target) + Math.abs(angle) * 1.4 + reach * .08;
        if (score < bestScore) { bestScore = score; best = candidate; }
      }
    }
    this.collider.enabled = true;
    return best;
  }

  faceAndMove(target, speed, dt) {
    if (!target) return true;
    const moveTarget = this.avoidTarget || target;
    // `face()` uses the same scratch vector as movement. Turn first, then
    // calculate the unit travel direction so facing cannot replace it with
    // the full-length target delta (which previously produced visible jumps).
    this.face(moveTarget, dt);
    _toward.copy(moveTarget).sub(this.root.position); _toward.y = 0;
    const distance = _toward.length();
    if (distance < .12 && this.avoidTarget) {
      this.avoidTarget = null;
      return false;
    }
    if (distance < .02) return true;
    _toward.multiplyScalar(1 / distance);
    const step = Math.min(distance, speed * dt);
    const nextX = this.root.position.x + _toward.x * step;
    const nextZ = this.root.position.z + _toward.z * step;
    this.collider.enabled = false;
    const blocked = this.colliders.contains(nextX, nextZ, .31,
      this.root.position.y + .12, this.root.position.y + 1.62);
    let moved = !blocked;
    let moveX = nextX;
    let moveZ = nextZ;
    if (blocked) {
      // Axis separation provides natural wall sliding if another character
      // temporarily obstructs a route that was clear when it was planned.
      const tryX = !this.colliders.contains(nextX, this.root.position.z, .31,
        this.root.position.y + .12, this.root.position.y + 1.62);
      const tryZ = !this.colliders.contains(this.root.position.x, nextZ, .31,
        this.root.position.y + .12, this.root.position.y + 1.62);
      if (tryX || tryZ) {
        moved = true;
        if (!tryX) moveX = this.root.position.x;
        if (!tryZ) moveZ = this.root.position.z;
      }
    }
    this.collider.enabled = true;
    if (moved) {
      this.root.position.x = moveX;
      this.root.position.z = moveZ;
      this.root.position.y = this.colliders.floorAt(moveX, moveZ, .28,
        this.root.position.y + 2.5);
      this.stuckTimer = 0;
    } else {
      this.stuckTimer += dt;
      if (this.stuckTimer > .18 && !this.avoidTarget) {
        this.avoidTarget = this.chooseDetour(target);
      }
      if (this.stuckTimer > .9 && !this.avoidTarget) {
        // The old code asked the cover graph for a new route and, when it
        // returned nothing - which it did whenever no authored waypoint had a
        // clear line - carried on pushing at the same obstacle for the rest of
        // the game. There is no path back to that behaviour now: the search
        // that goes around things is tried first, and if even that fails the
        // agent breaks contact with whatever it is against and tries again
        // from somewhere else.
        const reroute = this.planRoute(this.destination || target);
        if (reroute.length) {
          this.route = reroute;
          this.target = this.route.shift() || target;
          this.replans++;
        } else {
          this.breakLoose();
        }
        this.stuckTimer = 0;
      }
    }
    this.syncCollider();
    return !this.avoidTarget && distance <= .38;
  }

  /**
   * Back out of whatever has hold of it and go somewhere else for a moment.
   *
   * Being genuinely unable to route anywhere is rare and always transient -
   * two characters in a doorway, a gate closing on somebody, a corner the grid
   * rounded off. What matters is that it ends, so the agent steps away from
   * the obstruction rather than leaning on it.
   */
  breakLoose() {
    this.unstickAttempts++;
    const away = Math.atan2(
      this.root.position.x - (this.avoidTarget || this.target || this.home).x,
      this.root.position.z - (this.avoidTarget || this.target || this.home).z);
    const spread = (this.random() - .5) * 2.2;
    const reach = 1.6 + this.random() * 2.4;
    const candidate = new THREE.Vector3(
      this.root.position.x + Math.sin(away + spread) * reach,
      this.root.position.y,
      this.root.position.z + Math.cos(away + spread) * reach);
    this.collider.enabled = false;
    const blocked = this.colliders.contains(candidate.x, candidate.z, .34,
      candidate.y + .12, candidate.y + 1.62);
    this.collider.enabled = true;
    this.avoidTarget = blocked ? null : candidate;
    this.route = [];
    this.stuckTimer = 0;
  }

  /** Has it stopped getting anywhere? Measured over a window, not a frame. */
  watchForWedge(dt) {
    this.stuckWatchTimer += dt;
    if (this.stuckWatchTimer < STUCK_SECONDS) return false;
    const travelled = this.root.position.distanceTo(this.stuckWatch);
    this.stuckWatch.copy(this.root.position);
    this.stuckWatchTimer = 0;
    // Standing still on purpose is not being stuck.
    const wants = !!(this.target || this.destination) && !this.holding;
    return wants && travelled < STUCK_TRAVEL;
  }

  followRoute(speed, dt) {
    if (!this.target) return true;
    if (!this.faceAndMove(this.target, speed, dt)) return false;
    if (this.route.length) {
      this.target = this.route.shift();
      return false;
    }
    this.target = null;
    this.destination = null;
    return true;
  }

  followAssaultLegs(points, indexKey, speed, dt) {
    const index = this[indexKey];
    if (index >= points.length) return true;
    if (!this.target) {
      this.destination = points[index].clone();
      // Every leg is routed now, not only the first. Authored waypoints are a
      // line somebody drew on a map; the yard has a car, a barrier line and
      // another attacker in it, and walking a drawn line through those is what
      // left them leaning on the scenery.
      this.route = this.planRoute(this.destination);
      this.target = this.route.shift() || this.destination.clone();
      this.avoidTarget = null;
    }
    if (!this.followRoute(speed, dt)) return false;
    this[indexKey]++;
    this.target = null;
    this.destination = null;
    this.avoidTarget = null;
    return this[indexKey] >= points.length;
  }

  strike(target, kind, damage, dt) {
    if (target) this.face(target, dt, 13);
    this.play('melee', 1.08, .08);
    if (this.attackCooldown > 0) return false;
    this.attackCooldown = kind === 'player' ? 1.25 : 1.0;
    this.breachHits++;
    this.replay('melee', 1.08, .04);
    if (kind === 'player') {
      window.dispatchEvent(new CustomEvent('lostsignal:enemyattack', {
        detail: { damage, enemy: this.root },
      }));
      return false;
    }
    const callback = kind === 'gate' ? this.mission.damageGate : this.mission.damageSilo;
    if (callback) return !!callback(damage, this.root);
    window.dispatchEvent(new CustomEvent(`lostsignal:${kind}attack`, {
      detail: { damage, enemy: this.root },
    }));
    return false;
  }

  updateAssault(dt, playerPosition, active, distance) {
    // Flat on his back after a car went over him. Nothing else runs until he
    // is up again, and while he is down he is not wedged, he is winded.
    if (this.downed > 0) {
      this.downed -= dt;
      this.holding = 'downed';
      if (this.downed <= 0) {
        this.play('stand', 1, 0.18);
        this.thinkTimer = 0;
      }
      return;
    }
    // Defend themselves if the player physically intercepts them, then resume
    // the same mission leg. There is no random flee/dance state in the siege
    // brain, so an old man cannot forget the silo and sprint in circles.
    if (active && distance < CORNERED_RANGE
      && !this.lineBlocked(this.root.position, playerPosition)) {
      this.strike(playerPosition, 'player', 8, dt);
      return;
    }

    // Standing still on purpose is a decision, not a wedge, and the two have
    // to be told apart or every deliberate pause reads as a fault.
    this.holding = null;
    if (this.watchForWedge(dt)) this.breakLoose();

    // What each of them does about the player, and what the other one does
    // about that. Two attackers who both charge are one attacker twice.
    if (active && this.canSeePlayer && distance < CONTACT_RANGE
      && this.state !== 'silo_breached') {
      const mine = this.squad && (!this.squad.engaged || this.squad.engaged === this.root.name);
      if (this.squad && mine) this.squad.engaged = this.root.name;
      const behaviour = mine ? this.plan.contact : 'press';
      if (behaviour === 'charge') {
        this.playTravel('run', 3.5 * this.personality.pace, 1.04, .1);
        this.faceAndMove(playerPosition, 3.5 * this.personality.pace, dt);
        return;
      }
      if (behaviour === 'flank' || behaviour === 'press') {
        // Come at them from the side rather than up the middle: a point off
        // the player's shoulder, on whichever side this one is already nearer.
        if (!this.contactTarget || this.contactTimer <= 0) {
          const side = Math.sign(this.root.position.x - playerPosition.x) || 1;
          const swing = 5.5 + this.random() * 3.5;
          this.contactTarget = new THREE.Vector3(
            playerPosition.x + side * swing,
            this.root.position.y,
            playerPosition.z + (this.random() - .5) * swing);
          this.route = this.planRoute(this.contactTarget);
          this.contactTimer = 2.4 + this.random() * 1.6;
        }
        this.contactTimer -= dt;
        const speed = 3.1 * this.personality.pace * this.plan.pace;
        this.playTravel('run', speed, 1, .12);
        if (this.followRoute(speed, dt)) this.contactTimer = 0;
        return;
      }
      if (behaviour === 'cover') {
        // Break the line and wait. The player loses track of one of them,
        // which is worth more to the pair than another body in the open.
        if (!this.contactTarget || this.contactTimer <= 0) {
          this.contactTarget = this.chooseCover(playerPosition, true);
          this.route = this.planRoute(this.contactTarget);
          this.contactTimer = 3 + this.random() * 2.5;
        }
        this.contactTimer -= dt;
        const speed = 2.6 * this.personality.pace;
        this.playTravel('run', speed, 1, .12);
        if (this.followRoute(speed, dt)) {
          this.play('stand', 1, .2);
          this.face(playerPosition, dt, 3);
        }
        return;
      }
    } else if (this.squad && this.squad.engaged === this.root.name) {
      this.squad.engaged = null;
      this.contactTarget = null;
      this.contactTimer = 0;
    }

    const visible = this.model.visible;
    const roadSpeed = (visible ? ASSAULT_RUN_SPEED : STRATEGIC_RUN_SPEED)
      * this.personality.pace * this.plan.pace;

    // Bounding: run, then stop and look at where you are going. It is what
    // makes one attacker read as careful and the other as reckless, and it is
    // the difference between two figures crossing a field and two figures
    // advancing across it.
    if (this.plan.bound && visible && this.state !== 'breach_gate'
      && this.state !== 'breach_silo' && this.state !== 'silo_breached') {
      this.boundTimer -= dt;
      if (this.boundTimer <= 0) {
        this.bounding = !this.bounding;
        this.boundTimer = this.bounding
          ? BOUND_RUN * (0.7 + this.random() * 0.7)
          : BOUND_LOOK * (0.6 + this.random() * 1.1);
      }
      if (!this.bounding) {
        this.holding = 'bound';
        this.play('stand', 1, .2);
        // Look where the trouble is, not where the feet are going.
        this.face(this.canSeePlayer ? playerPosition
          : (this.mission.siloTarget || this.lastSeen), dt, 3);
        return;
      }
    }

    // A patient plan will not walk into an occupied yard. It holds at its
    // standoff until the player is out of sight, which turns the siege into
    // something the player can affect by where they stand.
    if (this.plan.standoff && this.canSeePlayer && distance < this.plan.standoff
      && this.state === 'assault_road') {
      this.holding = 'standoff';
      this.play('stand', 1, .18);
      this.face(playerPosition, dt, 3.2);
      return;
    }

    if (this.state === 'assault_road') {
      if (visible) this.playTravel('run', roadSpeed, 1, .12);
      if (this.followAssaultLegs(this.assaultRoute, 'assaultIndex', roadSpeed, dt)) {
        this.state = 'breach_gate';
        this.target = null;
        this.destination = null;
      }
    } else if (this.state === 'to_car') {
      // The car is what they came for. Each man has his own door, so they do
      // not arrive at the same handle and shove each other.
      const door = this.mission.boardingPoint?.(this.role);
      if (!door) { this.state = 'assault_yard'; return; }
      const gap = this.root.position.distanceTo(door);
      // Re-route while the car is still where it was; a car that has moved
      // makes every waypoint behind it wrong.
      if (!this.target || this.carDoor === null || this.carDoor.distanceTo(door) > 1.5) {
        this.carDoor = door.clone();
        this.destination = door.clone();
        this.route = this.planRoute(this.destination);
        this.target = this.route.shift() || this.destination.clone();
      }
      const speed = (visible ? 3.3 : 5.2) * this.personality.pace * this.plan.pace;
      if (visible) this.playTravel('run', speed, 1, .1);
      if (gap < 1.15 || this.followRoute(speed, dt)) {
        this.state = 'boarding';
        this.target = null;
        this.destination = null;
      }
    } else if (this.state === 'boarding') {
      // Waiting at the door for the other one. A driver who pulls away while
      // his mate is still crossing the yard is not two men stealing a car.
      this.holding = 'boarding';
      this.play('stand', 1, .16);
      const door = this.mission.boardingPoint?.(this.role);
      if (door) this.face(door, dt, 5);
      this.boardTimer += dt;
      if (this.mission.readyToDrive?.(this) || this.boardTimer > BOARD_PATIENCE) {
        if (this.mission.board?.(this)) {
          this.state = 'riding';
          this.model.visible = false;
          // A man in the car is not also a bollard beside it. Leaving their
          // colliders at the doors meant the car's own body was blocked by its
          // occupants and it could not pull away.
          this.collider.enabled = false;
        }
      }
    } else if (this.state === 'riding') {
      this.holding = 'riding';
      // Carried by the car, sitting in it, facing the way it is going. The body
      // still tracks the seat so a shot through the window finds the man in it,
      // but it is not in the way of the car it is sitting in.
      const seat = this.mission.seatPosition?.(this);
      if (seat) this.root.position.copy(seat);
      const facing = this.mission.seatHeading?.(this);
      if (facing !== undefined && facing !== null) this.root.rotation.y = facing;
      this.collider.cx = this.root.position.x;
      this.collider.cz = this.root.position.z;
      this.collider.minY = this.root.position.y;
      this.collider.maxY = this.root.position.y + HEIGHT;
    } else if (this.state === 'breach_gate') {
      if (this.mission.gateIsPassable?.()) {
        // Through the gate, and then straight for the car. Breaking into the
        // shelter was never the plan: the shelter has nothing they can drive.
        this.state = this.mission.boardingPoint ? 'to_car' : 'assault_yard';
        this.target = null;
        this.destination = null;
      } else {
        const target = this.mission.gateTarget || this.yardRoute[0];
        this.strike(target, 'gate', 11, dt);
      }
    } else if (this.state === 'assault_yard') {
      const speed = (visible ? 3.05 : 4.5) * this.personality.pace;
      if (visible) this.playTravel('run', speed, 1, .1);
      if (this.followAssaultLegs(this.yardRoute, 'yardIndex', speed, dt)) {
        this.state = 'breach_silo';
        this.target = null;
        this.destination = null;
      }
    } else if (this.state === 'breach_silo') {
      const target = this.mission.siloTarget || this.root.position;
      if (this.strike(target, 'silo', 7, dt)) {
        this.state = 'silo_breached';
        this.root.userData.completedAssault = true;
      }
    } else if (this.state === 'silo_breached') {
      this.play('stand', 1, .12);
      if (this.mission.siloTarget) this.face(this.mission.siloTarget, dt, 2.5);
    } else {
      this.state = 'assault_road';
      this.target = null;
      this.destination = null;
    }
  }

  decide(playerPosition, distance) {
    this.thinkTimer = 0.18 + this.random() * 0.17;
    const committed = this.stateTimer > 0;

    if (!this.alerted) {
      if (!committed || !['patrol', 'idle'].includes(this.state)) {
        this.state = this.random() < 0.24 ? 'idle' : 'patrol';
        this.stateTimer = this.state === 'idle' ? 0.7 + this.random() * 1.5 : 4.5;
        this.target = this.state === 'patrol' ? this.patrol[this.patrolIndex] : null;
      }
      return;
    }

    // Finish a sensible committed move instead of changing its mind every
    // render frame. Immediate danger is the only thing allowed to interrupt.
    if (committed && this.target && ['evade', 'seek_cover', 'observe', 'investigate']
      .includes(this.state) && !(this.canSeePlayer && distance < PANIC_RANGE)) return;
    if (committed && this.state === 'hide' && !this.canSeePlayer) return;

    if (this.style === 'red' && this.canSeePlayer && distance < CORNERED_RANGE) {
      this.state = 'defend';
      this.stateTimer = 0.46;
      this.target = null;
      return;
    }

    const courage = this.personality.courage;
    const danger = THREE.MathUtils.clamp((22 - distance) / 22, 0, 1);
    const memory = THREE.MathUtils.clamp(this.memoryTimer / MEMORY_SECONDS, 0, 1);
    const concealed = this.lineBlocked(this.root.position,
      this.canSeePlayer ? playerPosition : this.lastSeen);
    const expiredHide = this.state === 'hide' && !committed;
    const utilities = {
      evade: this.canSeePlayer
        ? 0.58 + danger * (0.82 - courage * 0.25) + (concealed ? -0.3 : 0.28)
        : -1,
      hide: concealed
        ? 0.42 + memory * 0.22 + (1 - courage) * 0.34 - (expiredHide ? 0.44 : 0)
        : -1,
      observe: !this.canSeePlayer && concealed && memory > 0
        ? 0.34 + courage * 0.48 + (expiredHide ? 0.22 : 0)
        : -1,
      investigate: !this.canSeePlayer && memory > 0
        ? 0.38 + courage * 0.42 + (concealed ? 0 : 0.14)
        : -1,
      patrol: memory <= 0 ? 0.72 : 0.02,
    };
    // A tiny seeded preference makes the two old men disagree without making
    // either one random or frame-rate dependent.
    utilities.observe += (this.random() - 0.5) * 0.08;
    utilities.investigate += (this.random() - 0.5) * 0.08;
    const choice = Object.entries(utilities)
      .reduce((best, entry) => entry[1] > best[1] ? entry : best)[0];

    if (choice === 'evade') {
      this.beginRelocate(playerPosition, distance < PANIC_RANGE * 1.35);
    } else if (choice === 'hide') {
      this.state = 'hide';
      this.stateTimer = (2.0 + this.random() * 2.4) * this.personality.patience;
      this.target = null;
      this.destination = null;
    } else if (choice === 'observe') {
      const vantage = this.chooseCover(this.lastSeen, false);
      if (vantage && vantage.distanceTo(this.root.position) > 0.65) {
        this.beginRoute(vantage, 'observe', 4.8);
      } else {
        this.state = 'hide';
        this.stateTimer = 0.8 + this.random();
      }
    } else if (choice === 'investigate') {
      if (this.lastSeen.distanceTo(this.root.position) > 0.8) {
        this.beginRoute(this.lastSeen, 'investigate', 7.2);
      } else {
        this.state = 'search';
        this.stateTimer = 1.1 + this.random() * 1.8;
        this.target = null;
      }
    } else {
      this.alerted = false;
      this.state = 'patrol';
      this.stateTimer = 3.2;
      this.target = this.patrol[this.patrolIndex];
    }
  }

  // Measured once, the first time this man sits down. Rotating a bone before
  // its rest pose is known would bake the nudge into the pose.
  calibrateSeat() {
    if (this.seatJoints) return this.seatJoints;
    const bone = (name) => this.model.getObjectByName(name);
    // Every test below is made in world space, because that is the space the
    // bones report their children in, so "forward" has to be this man's
    // forward and not the world's. Agents face -Z inside their own root.
    this.root.updateMatrixWorld(true);
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.root.quaternion).normalize();
    const back = forward.clone().negate();
    this.seatJoints = {
      // Hips fold so the knees come forward. Knees fold so the feet go back -
      // not down: from a standing leg the foot is already directly under the
      // knee and no rotation on earth will take it lower, which is why asking
      // for "down" here found no axis at all and left him standing up in his
      // seat with his legs through the floor.
      hips: ['L', 'R'].map((side) => hinge(bone(`${side}_Thigh`), bone(`${side}_Calf`), forward)),
      knees: ['L', 'R'].map((side) => hinge(bone(`${side}_Calf`), bone(`${side}_Foot`), back)),
      lean: hinge(bone('Spine01'), bone('Head'), back),
      // Flexion alone leaves both men sitting with their arms out sideways, in
      // the pose the model was uploaded in - the driver's right hand ended up
      // outside the car, through the door. So each shoulder gets a second
      // rotation that brings the arm back in against the ribs, on whichever
      // axis actually moves that elbow towards this man's own centreline.
      arms: ['L', 'R'].map((side) => {
        const upper = bone(`${side}_Upperarm`);
        const inward = new THREE.Vector3();
        if (upper) {
          upper.getWorldPosition(inward);
          inward.subVectors(this.root.position, inward).setY(0).normalize();
        }
        return {
          shoulder: hinge(upper, bone(`${side}_Forearm`), forward),
          adduct: hinge(upper, bone(`${side}_Forearm`), inward),
          elbow: hinge(bone(`${side}_Forearm`), bone(`${side}_Hand`), forward),
        };
      }),
      hipRise: HEIGHT * 0.53,
      crownRise: HEIGHT * 0.78,
    };

    // Measure the pose we are about to use, not the standing one, and measure
    // the top of his head rather than the bone in it. The Head bone sits at the
    // base of the skull; going by that put both men's hair through the roof
    // while every number said they were safely inside it.
    this.root.updateMatrixWorld(true);
    const head = bone('Head');
    const standing = head
      ? head.getWorldPosition(_seatPoint).y - this.root.position.y : HEIGHT * 0.87;
    const crown = Math.max(0, HEIGHT - standing);
    this.applySeatedPose(this.role === 'driver');
    this.model.updateMatrixWorld(true);
    const hip = bone('Hip');
    if (hip) this.seatJoints.hipRise = hip.getWorldPosition(_seatPoint).y - this.root.position.y;
    if (head) {
      this.seatJoints.crownRise =
        head.getWorldPosition(_seatPoint).y - this.root.position.y + crown;
    }
    return this.seatJoints;
  }

  // Fold him into the seat. Runs after the mixer, because the mixer would
  // otherwise write the standing pose straight back over it.
  applySeatedPose(driving) {
    const joints = this.calibrateSeat();
    const bend = (joint, angle) => {
      if (!joint) return;
      joint.bone.quaternion.copy(joint.rest);
      joint.bone.rotateOnAxis(joint.axis, joint.sign * angle);
    };
    for (const joint of joints.hips) bend(joint, SEAT_POSE.hip);
    for (const joint of joints.knees) bend(joint, SEAT_POSE.knee);
    bend(joints.lean, SEAT_POSE.lean);
    for (const arm of joints.arms) {
      // The shoulder takes two turns, so it is reset once and then rotated
      // twice; bend() on its own would throw the first one away.
      if (arm.shoulder || arm.adduct) {
        const upper = (arm.shoulder || arm.adduct).bone;
        upper.quaternion.copy((arm.shoulder || arm.adduct).rest);
        if (arm.shoulder) {
          upper.rotateOnAxis(arm.shoulder.axis,
            arm.shoulder.sign * (driving ? SEAT_POSE.shoulder : SEAT_POSE.restShoulder));
        }
        if (arm.adduct) upper.rotateOnAxis(arm.adduct.axis, arm.adduct.sign * SEAT_POSE.adduct);
      }
      bend(arm.elbow, driving ? SEAT_POSE.elbow : SEAT_POSE.restElbow);
    }
  }

  seatRise() { return this.calibrateSeat().hipRise; }

  // How far the top of his head stands above his own origin once he is folded
  // into the seat. This is what has to fit under the roof.
  seatCrown() { return this.calibrateSeat().crownRise; }

  settleDeath() {
    if (this.deathSettled) return;
    this.deathSettled = true;
    if (this.currentAction) this.currentAction.paused = true;
    // The black character's corrected fall take already ends flat; the red
    // character's compatible take ends crouched. Only tip a body that is still
    // tall, otherwise a good authored fall is accidentally stood on its side.
    this.root.updateMatrixWorld(true);
    _box.setFromObject(this.root, true);
    _box.getSize(_size);
    if (_size.y > 1.0) this.model.rotation.x += Math.PI / 2;
    this.root.updateMatrixWorld(true);
    _box.setFromObject(this.root, true);
    if (Number.isFinite(_box.min.y)) this.root.position.y += .025 - _box.min.y;
    this.root.userData.deathSettled = true;
  }

  // `viewer` is wherever the picture is being taken from — the player's own
  // eyes normally, a CCTV camera when he is watching one from the bunker.
  // Only drawing and dormancy key off it; every decision still keys off the
  // real player, because that is who they are actually reacting to.
  update(dt, playerPosition, active, viewer = playerPosition) {
    dt = Math.min(dt, 0.05);
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    this.stateTimer = Math.max(0, this.stateTimer - dt);
    this.thinkTimer = Math.max(0, this.thinkTimer - dt);
    for (let index = 0; index < this.coverCooldowns.length; index++) {
      this.coverCooldowns[index] = Math.max(0, this.coverCooldowns[index] - dt);
    }
    if (this.dead) {
      this.model.visible = active;
      if (!this.deathSettled) {
        this.deathTimer += dt;
        this.mixer.update(dt);
        const duration = this.clips.fall.duration / 1.15;
        if (this.deathTimer >= duration) this.settleDeath();
      }
      return;
    }

    const distance = this.root.position.distanceTo(playerPosition);
    const viewDistance = viewer === playerPosition
      ? distance : this.root.position.distanceTo(viewer);
    if (this.assaulting) {
      // Inside the car they are not standing in the yard. The body still
      // exists and still moves with the car, so it can still be shot at.
      // Sitting in the car counts as being on screen: the point of cutting the
      // windows open is that you can see who is in there. They are only culled
      // when the car itself is too far off to make them out.
      this.model.visible = active && viewDistance < (this.state === 'riding'
        ? RIDER_RENDER_DISTANCE : ASSAULT_RENDER_DISTANCE);
      const beforeX = this.root.position.x;
      const beforeZ = this.root.position.z;
      this.updateAssault(dt, playerPosition, active, distance);
      const travelled = Math.hypot(this.root.position.x - beforeX,
        this.root.position.z - beforeZ);
      if (travelled > this.maxFrameTravel) {
        this.maxFrameTravel = travelled;
        this.maxFrameTravelState = this.state;
        this.maxFrameTravelDebug = {
          from: [beforeX, beforeZ],
          to: [this.root.position.x, this.root.position.z],
          target: this.target ? [this.target.x, this.target.z] : null,
          dt,
        };
      }
      if (this.model.visible) {
        this.mixer.update(dt);
        // After the mixer, never before: a clip written on top of the seated
        // pose puts him back on his feet inside the car.
        if (this.state === 'riding') this.applySeatedPose(this.role === 'driver');
      }
      return;
    }
    if (!active) {
      this.model.visible = false;
      return;
    }

    // Distant agents are dormant at their authored spawn, not invisibly
    // walking around. When they first enter range they therefore appear where
    // they were placed instead of seeming to teleport in from a simulation the
    // player could not see.
    if (!this.activated) {
      if (Math.min(distance, viewDistance) > ACTIVATE) {
        this.model.visible = false;
        return;
      }
      this.activated = true;
      this.thinkTimer = this.random() * 0.16;
    }
    this.model.visible = viewDistance < 215 || this.alerted;
    if (!this.model.visible) return;

    this.canSeePlayer = distance < DETECT
      && !this.lineBlocked(this.root.position, playerPosition);
    const canHearPlayer = distance < 9;
    if (this.canSeePlayer || canHearPlayer) {
      this.alerted = true;
      this.memoryTimer = MEMORY_SECONDS;
      this.lastSeen.copy(playerPosition);
    } else {
      this.memoryTimer = Math.max(0, this.memoryTimer - dt);
      if (this.memoryTimer <= 0 && distance > FORGET) this.alerted = false;
    }

    if (this.thinkTimer <= 0) this.decide(playerPosition, distance);

    const beforeX = this.root.position.x;
    const beforeZ = this.root.position.z;
    if (this.state === 'patrol') {
      const target = this.target || this.patrol[this.patrolIndex];
      this.target = target;
      this.playTravel('walk', 0.70 * this.personality.pace, 0.96);
      if (this.faceAndMove(target, 0.70 * this.personality.pace, dt)) {
        this.patrolIndex = (this.patrolIndex + 1) % this.patrol.length;
        this.target = null;
        this.state = 'idle';
        this.stateTimer = 0.65 + this.random() * 1.45;
        this.thinkTimer = Math.min(this.thinkTimer, 0.1);
      }
    } else if (this.state === 'idle') {
      this.play('stand', 1, .18);
      const look = this.alerted ? this.lastSeen : this.patrol[this.patrolIndex];
      if (look) this.face(look, dt, 2.2);
    } else if (this.state === 'evade' || this.state === 'seek_cover') {
      const urgent = this.state === 'evade';
      const motion = this.style === 'black' && urgent ? 'flee' : 'run';
      const speed = (urgent ? 3.45 : 2.55) * this.personality.pace;
      this.playTravel(motion, speed, urgent ? 1.04 : 1);
      if (this.followRoute(speed, dt)) {
        this.state = 'hide';
        this.stateTimer = (1.8 + this.random() * 2.6) * this.personality.patience;
        this.thinkTimer = Math.min(this.thinkTimer, 0.12);
      }
    } else if (this.state === 'hide') {
      this.play('stand', 1, .18);
      this.face(this.lastSeen, dt, 2.6);
    } else if (this.state === 'observe') {
      if (this.target) {
        this.playTravel('walk', 0.78 * this.personality.pace, .94);
        if (this.followRoute(0.78 * this.personality.pace, dt)) {
          this.stateTimer = 0.55 + this.random() * 0.9;
          this.thinkTimer = Math.min(this.thinkTimer, 0.1);
        }
      } else {
        this.play('stand', 1, .14);
        this.face(this.lastSeen, dt, 4.5);
      }
    } else if (this.state === 'investigate') {
      if (this.target) {
        this.playTravel('walk', 1.02 * this.personality.pace, 1);
        if (this.followRoute(1.02 * this.personality.pace, dt)) {
          this.state = 'search';
          this.stateTimer = 1.0 + this.random() * 1.7;
          this.thinkTimer = Math.min(this.thinkTimer, 0.1);
        }
      } else {
        this.state = 'search';
        this.stateTimer = 0.8;
      }
    } else if (this.state === 'search') {
      this.play('stand', 1, .16);
      this.face(this.lastSeen, dt, 2.0);
    } else if (this.state === 'defend') {
      this.face(playerPosition, dt, 12);
      this.play('melee', 1.12, .08);
      if (this.attackCooldown <= 0) {
        this.attackCooldown = 1.35;
        window.dispatchEvent(new CustomEvent('lostsignal:enemyattack', {
          detail: { damage: 9, enemy: this.root },
        }));
      }
    } else {
      this.state = 'idle';
      this.stateTimer = 0.5;
      this.play('stand', 1, .12);
    }

    const travelled = Math.hypot(this.root.position.x - beforeX,
      this.root.position.z - beforeZ);
    if (travelled > this.maxFrameTravel) {
      this.maxFrameTravel = travelled;
      this.maxFrameTravelState = this.state;
      this.maxFrameTravelDebug = {
        from: [beforeX, beforeZ],
        to: [this.root.position.x, this.root.position.z],
        target: this.target ? [this.target.x, this.target.z] : null,
        dt,
      };
    }
    this.mixer.update(dt);
  }

  // Hit by a car. Fast enough and he is dead where he lands; slower and he is
  // knocked off his feet and gets up angry. Either way he goes over the bonnet
  // rather than standing there taking it.
  struck(speed, dirX, dirZ, lethal) {
    if (this.dead || this.state === 'riding' || this.state === 'boarding') return false;
    const throwBy = Math.min(2.6, 0.5 + speed * 0.22);
    this.root.position.x += dirX * throwBy;
    this.root.position.z += dirZ * throwBy;
    this.collider.cx = this.root.position.x;
    this.collider.cz = this.root.position.z;
    this.route = [];
    this.target = null;
    this.destination = null;
    window.dispatchEvent(new CustomEvent('lostsignal:runover', {
      detail: { name: this.root.name, speed: +speed.toFixed(1), lethal: !!lethal },
    }));
    if (lethal) return this.kill();
    // Winded, not dead: he loses his footing, his plan and several seconds.
    this.downed = Math.max(this.downed || 0, 1.4 + speed * 0.12);
    this.stateTimer = this.downed;
    this.thinkTimer = this.downed;
    this.alerted = true;
    this.play('fall', 1.15, 0.06);
    return true;
  }

  kill() {
    if (this.dead) return false;
    this.dead = true;
    // If the man with the keys goes down, his mate moves across.
    if (this.squad?.driver === this.root.name) {
      this.squad.driver = null;
      this.mission.driverDown?.(this);
    }
    this.root.userData.alive = false;
    this.collider.enabled = false;
    for (const volume of this.hitVolumes) {
      volume.visible = false;
      volume.removeFromParent();
    }
    this.play('fall', 1.15, .06);
    return true;
  }
}

export function createTownEnemies({ scene, colliders, assets, entries,
  navigationObstacles = [], lowCost = false, mission = {}, seed = null }) {
  const agents = [];
  const sharedMelee = assets.enemyOldManRed?.animations?.[TOWN_ENEMY_ANIMATIONS.red.melee] || null;
  // One navigator for the squad: the walkability of a cell is a fact about the
  // world, not about who is asking, so the cache is worth sharing.
  const navigator = createNavigator({ colliders });
  // What the two of them know about each other. Two attackers who both charge
  // are one attacker twice; two who notice the other is busy are a pair.
  const squad = { engaged: null, breached: false, lanes: new Set(), driver: null };

  // A seed the caller can pin for a test and leave alone in the game, so the
  // siege is a different afternoon each time it is played and the same one
  // every time it is asserted.
  let draw = (seed === null ? (Math.random() * 4294967296) >>> 0 : seed) >>> 0;
  const nextRandom = () => {
    draw = (Math.imul(draw, 1664525) + 1013904223) >>> 0;
    return draw / 4294967296;
  };

  const pool = [...ASSAULT_PLANS];
  for (const entry of entries) {
    const gltf = assets[entry.asset];
    if (!gltf?.animations?.length) continue;
    // Drawn without replacement, so the two of them never run the same plan
    // shoulder to shoulder.
    const pick = pool.length ? Math.floor(nextRandom() * pool.length) % pool.length : 0;
    const plan = pool.length ? pool.splice(pick, 1)[0] : ASSAULT_PLANS[0];
    const agent = new TownEnemy({
      gltf, scene, colliders, navigationObstacles, lowCost, sharedMelee, mission,
      navigator, plan, squad, ...entry,
    });
    // One driver, one passenger. Whoever is drawn first takes the wheel; if he
    // is shot before he gets to it, the other one moves across.
    if (!squad.driver) { squad.driver = agent.root.name; agent.role = 'driver'; }
    agents.push(agent);
  }
  return {
    agents,
    navigator,
    plans: () => agents.map((agent) => ({ name: agent.root.name, plan: agent.plan.key })),
    roots: agents.map((agent) => agent.root),
    update(dt, playerPosition, active = true, viewer = playerPosition) {
      for (const agent of agents) agent.update(dt, playerPosition, active, viewer);
    },
    down(root) { return root?.userData?.enemyAgent?.kill?.() ?? false; },
    animationSummary() {
      return agents.map((agent) => ({
        name: agent.root.name, style: agent.style,
        animations: Object.keys(agent.actions), animation: agent.current,
        state: agent.state, dead: agent.dead, settled: agent.deathSettled,
        assaultIndex: agent.assaultIndex, yardIndex: agent.yardIndex,
        breachHits: agent.breachHits, plan: agent.plan.key,
        replans: agent.replans, unstick: agent.unstickAttempts,
      }));
    },
  };
}

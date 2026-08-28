import * as THREE from 'three';
import { cloneGLTF } from './assets.js';

const HEIGHT = 1.78;
const DETECT = 96;
const FORGET = 138;
const ACTIVATE = 185;
const MEMORY_SECONDS = 12;
const CORNERED_RANGE = 1.45;
const PANIC_RANGE = 6.5;
const PERSONALITY = Object.freeze({
  black: Object.freeze({ courage: 0.24, patience: 1.25, pace: 0.92 }),
  red: Object.freeze({ courage: 0.46, patience: 0.82, pace: 1.04 }),
});
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

function prepareModel(gltf, style, lowCost = false) {
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
  }
  // A frozen first frame from the walk is a neutral planted stance. The old
  // red stand was sampled from its dance clip and visibly posed between beats.
  clips.stand = stillClip(clips.walk, 'stand');
  actions.stand = mixer.clipAction(clips.stand);
  actions.stand.enabled = true;
  return { root, model, mixer, clips, actions, travelSpeeds };
}

class TownEnemy {
  constructor({ gltf, style, scene, colliders, position, heading, name, patrol,
    cover = [], navigationObstacles = [], lowCost = false }) {
    Object.assign(this, prepareModel(gltf, style, lowCost));
    this.style = style;
    this.root.name = name;
    this.root.position.set(...position);
    this.root.rotation.y = heading;
    this.home = new THREE.Vector3(...position);
    this.patrol = patrol.map(([x, z]) => new THREE.Vector3(x, position[1], z));
    this.cover = cover.map(([x, z]) => new THREE.Vector3(x, position[1], z));
    this.navigationObstacles = navigationObstacles.filter(Boolean).map((box) => box.clone());
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
    this.alerted = false;
    this.dead = false;
    this.deathTimer = 0;
    this.deathSettled = false;
    this.state = 'patrol';
    this.stateTimer = 0.4;
    this.thinkTimer = 0;
    this.memoryTimer = 0;
    this.lastSeen = this.home.clone();
    this.canSeePlayer = false;
    this.activated = false;
    this.decisionCount = 0;
    this.maxFrameTravel = 0;
    this.maxFrameTravelState = 'patrol';
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

  segmentBlocked(a, b, radius = .06, spacing = .8) {
    // The hide graph only cares about the two town buildings. Testing their
    // bounds analytically avoids walking thousands of unrelated countryside
    // colliders every time an enemy chooses its next hiding place.
    if (this.navigationObstacles.length) {
      return this.navigationObstacles.some((box) => segmentHitsBounds(a, b, box, radius));
    }
    _toward.copy(b).sub(a); _toward.y = 0;
    const distance = _toward.length();
    if (distance < 1) return false;
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
    return this.segmentBlocked(a, b, .06, .8);
  }

  movementBlocked(a, b) {
    return this.segmentBlocked(a, b, .32, .42);
  }

  /** Shortest clear route over the perimeter cover graph. */
  planRoute(destination) {
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

  faceAndMove(target, speed, dt) {
    if (!target) return true;
    // `face()` uses the same scratch vector as movement. Turn first, then
    // calculate the unit travel direction so facing cannot replace it with
    // the full-length target delta (which previously produced visible jumps).
    this.face(target, dt);
    _toward.copy(target).sub(this.root.position); _toward.y = 0;
    const distance = _toward.length();
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
      this.root.rotation.y += (this.style === 'black' ? 1 : -1) * 1.15 * dt;
      this.stuckTimer += dt;
      if (this.stuckTimer > .35) {
        this.route = this.planRoute(this.destination);
        this.target = this.route.shift() || null;
        this.stuckTimer = 0;
      }
    }
    this.syncCollider();
    return distance <= .38;
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

  update(dt, playerPosition, active) {
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
    if (!active) {
      this.model.visible = false;
      return;
    }

    const distance = this.root.position.distanceTo(playerPosition);
    // Distant agents are dormant at their authored spawn, not invisibly
    // walking around. When they first enter range they therefore appear where
    // they were placed instead of seeming to teleport in from a simulation the
    // player could not see.
    if (!this.activated) {
      if (distance > ACTIVATE) {
        this.model.visible = false;
        return;
      }
      this.activated = true;
      this.thinkTimer = this.random() * 0.16;
    }
    this.model.visible = distance < 215 || this.alerted;
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

  kill() {
    if (this.dead) return false;
    this.dead = true;
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
  navigationObstacles = [], lowCost = false }) {
  const agents = [];
  for (const entry of entries) {
    const gltf = assets[entry.asset];
    if (!gltf?.animations?.length) continue;
    agents.push(new TownEnemy({
      gltf, scene, colliders, navigationObstacles, lowCost, ...entry,
    }));
  }
  return {
    agents,
    roots: agents.map((agent) => agent.root),
    update(dt, playerPosition, active = true) {
      for (const agent of agents) agent.update(dt, playerPosition, active);
    },
    down(root) { return root?.userData?.enemyAgent?.kill?.() ?? false; },
    animationSummary() {
      return agents.map((agent) => ({
        name: agent.root.name, style: agent.style,
        animations: Object.keys(agent.actions), animation: agent.current,
        state: agent.state, dead: agent.dead, settled: agent.deathSettled,
      }));
    },
  };
}

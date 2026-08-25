import * as THREE from 'three';
import { cloneGLTF, findNamed } from './assets.js';
import {
  createResidentHuman,
  HUMAN_BUILD_PRESETS,
  humanClip,
} from './humans.js';

// Wildlife and infected. The models are Blender GLBs with named limb nodes
// pivoted at their joints, so the runtime only rotates those nodes — no
// runtime geometry, in line with the world rule.

const UP = new THREE.Vector3(0, 1, 0);
const _toPlayer = new THREE.Vector3();
const _step = new THREE.Vector3();

function collectLimbs(root, names) {
  const limbs = {};
  for (const [key, node] of Object.entries(names)) {
    const found = findNamed(root, node);
    if (found) limbs[key] = { node: found, rest: found.rotation.x };
  }
  return limbs;
}

function swing(limbs, keys, phase, amount) {
  keys.forEach((key, index) => {
    const limb = limbs[key];
    if (!limb) return;
    limb.node.rotation.x = limb.rest + Math.sin(phase + index * Math.PI) * amount;
  });
}

class Creature {
  constructor(root, kind, options = {}) {
    this.dying = 0;
    this.stagger = 0;
    this.detourTimer = 0;
    this.detourHeading = 0;
    this.root = root;
    this.kind = kind;
    this.speed = options.speed ?? 1.6;
    this.turnRate = options.turnRate ?? 2.4;
    this.radius = options.radius ?? 0.4;
    this.phase = Math.random() * Math.PI * 2;
    this.heading = Math.random() * Math.PI * 2;
    this.state = 'idle';
    this.timer = Math.random() * 4;
    root.userData.kind = kind;
    root.userData.alive = true;
  }

  get position() { return this.root.position; }

  // Anything shot folds over instead of snapping to a right angle: legs give
  // out, the body drops and the whole thing tips onto its side.
  collapse(dt) {
    this.dying = Math.min(1, this.dying + dt * 2.2);
    const eased = this.dying * this.dying * (3 - 2 * this.dying);
    this.root.rotation.z = eased * (Math.PI / 2) * this.fallDirection;
    // Relative to the floor the body was standing on. Absolute zero here put
    // every resident shot on an upper gallery through it and into the shaft.
    this.root.position.y = this.groundY - eased * this.dropHeight;
    for (const limb of Object.values(this.limbs || {})) {
      limb.node.rotation.x = THREE.MathUtils.lerp(limb.node.rotation.x, limb.rest + 0.4, dt * 4);
    }
  }

  kill() {
    if (this.root.userData.alive === false) return false;
    this.root.userData.alive = false;
    this.fallDirection = Math.random() < 0.5 ? -1 : 1;
    this.groundY = this.root.position.y;
    const box = new THREE.Box3().setFromObject(this.root);
    this.dropHeight = Math.max(0, (box.max.y - box.min.y) * 0.22);
    return true;
  }

  // Set a heading unless a detour is in progress. Callers that re-aim every
  // frame — anything chasing the player or drawn to the open blast door —
  // would otherwise steer straight back into whatever just blocked them and
  // stand there grinding against it.
  steer(heading) {
    if (this.detourTimer <= 0) this.heading = heading;
  }

  // Shared locomotion: face the heading, walk forward, refuse to walk into
  // anything the player would also collide with.
  advance(dt, speed, colliders) {
    if (this.detourTimer > 0) {
      this.detourTimer -= dt;
      this.heading = this.detourHeading;
    }
    const target = this.heading;
    let delta = ((target - this.root.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    this.root.rotation.y += THREE.MathUtils.clamp(delta, -this.turnRate * dt, this.turnRate * dt);

    _step.set(Math.sin(this.root.rotation.y), 0, Math.cos(this.root.rotation.y)).multiplyScalar(speed * dt);
    const nextX = this.root.position.x + _step.x;
    const nextZ = this.root.position.z + _step.z;
    // Collision lives at the creature's actual storey. The old absolute
    // 0.25–1.2 m span worked for surface wildlife and silently let residents
    // on every upper gallery walk through its wall and balustrade.
    const feetY = this.root.position.y + 0.05;
    const headY = feetY + (this.kind === 'resident' ? 1.72 : 1.15);
    if (colliders.contains(nextX, nextZ, this.radius, feetY, headY)) {
      // Slide around the obstacle for a moment rather than reversing into the
      // open and immediately turning back into it.
      this.detourTimer = 0.8 + Math.random() * 0.7;
      this.detourHeading = this.heading + (Math.random() < 0.5 ? -1 : 1) * (Math.PI / 2.1);
      return 0;
    }
    this.root.position.x = nextX;
    this.root.position.z = nextZ;
    return speed;
  }
}

class Prey extends Creature {
  constructor(root, kind, options) {
    super(root, kind, options);
    this.limbs = collectLimbs(root, kind === 'deer' ? {
      legFL: 'Deer_LegFL', legFR: 'Deer_LegFR', legBL: 'Deer_LegBL', legBR: 'Deer_LegBR',
      head: 'Deer_Head', neck: 'Deer_Neck', tail: 'Deer_Tail',
    } : {
      legFL: 'Rabbit_LegFL', legFR: 'Rabbit_LegFR', legBL: 'Rabbit_LegBL', legBR: 'Rabbit_LegBR',
      head: 'Rabbit_Head',
    });
    this.fleeRange = kind === 'deer' ? 11 : 7;
    this.grazeHeight = this.limbs.head?.rest ?? 0;
  }

  update(dt, playerPosition, colliders) {
    if (this.root.userData.alive === false) return;
    this.timer -= dt;
    _toPlayer.subVectors(playerPosition, this.root.position);
    const distance = _toPlayer.length();

    if (distance < this.fleeRange) {
      this.state = 'flee';
      this.steer(Math.atan2(-_toPlayer.x, -_toPlayer.z));
      this.timer = 2.5;
    } else if (this.timer <= 0) {
      this.state = Math.random() < 0.45 ? 'graze' : 'wander';
      if (this.state === 'wander') this.heading = Math.random() * Math.PI * 2;
      this.timer = 2 + Math.random() * 5;
    }

    const speed = this.state === 'flee' ? this.speed * 2.6 : (this.state === 'graze' ? 0 : this.speed);
    const moved = speed > 0 ? this.advance(dt, speed, colliders) : 0;
    this.phase += moved * (this.kind === 'rabbit' ? 7 : 4) * dt;

    swing(this.limbs, ['legFL', 'legBR'], this.phase, moved * 0.16);
    swing(this.limbs, ['legFR', 'legBL'], this.phase + Math.PI, moved * 0.16);

    // Grazing dips the head; fleeing raises it and flags the tail.
    if (this.limbs.head) {
      const dip = this.state === 'graze' ? 0.9 : (this.state === 'flee' ? -0.18 : 0.1);
      this.limbs.head.node.rotation.x = THREE.MathUtils.damp(
        this.limbs.head.node.rotation.x, this.limbs.head.rest + dip, 3, dt);
    }
    if (this.limbs.tail) {
      this.limbs.tail.node.rotation.x = this.limbs.tail.rest
        + Math.sin(this.phase * 2.2) * (this.state === 'flee' ? 0.5 : 0.12);
    }
    // Rabbits hop rather than walk.
    if (this.kind === 'rabbit') {
      this.root.position.y = Math.max(0, Math.sin(this.phase) * 0.09 * (moved > 0 ? 1 : 0));
    }
  }
}

// Residents of Silo 47. They walk their gallery, stop to look over the rail,
// and have something to say if you ask. They are not a threat — nobody in the
// silo knows what ended the world, and nothing followed them down.
const RESIDENT_LINES = [
  'Level six is out of filters again. Nobody upstairs wants to hear it.',
  'You are the one from the shelter. We wondered if anyone was still up there.',
  'Three hundred of us. Three hundred and one, if you are staying.',
  'My grandmother was born on this level. She never saw the outside either.',
  'They will not say what the secure unit is for. That is how you know.',
  'Hydroponics is short again this quarter. We are all short this quarter.',
  'The stair goes all the way down. Do not take it in the dark.',
  'You get used to the hum. It is when it stops that you should worry.',
  'Someone painted the sky on four. It is not right, but it is something.',
  'Whatever happened up there, it happened fast. That is all anyone agrees on.',
];

class Resident extends Creature {
  constructor(root, options) {
    super(root, 'resident', options);
    this.limbs = collectLimbs(root, {
      legL: 'Resident_Leg_-1', legR: 'Resident_Leg_1',
      shinL: 'Resident_Shin_-1', shinR: 'Resident_Shin_1',
      armL: 'Resident_Arm_-1', armR: 'Resident_Arm_1',
      foreL: 'Resident_Forearm_-1', foreR: 'Resident_Forearm_1',
      torso: 'Resident_Torso', head: 'Resident_Head',
    });
    this.eyes = [findNamed(root, 'Resident_EyeWhite_-1'), findNamed(root, 'Resident_EyeWhite_1')]
      .filter(Boolean);
    this.line = options.line ?? RESIDENT_LINES[0];
    this.homeY = options.homeY ?? 0;
    this.radius = options.radius ?? 0.34;
    this.state = 'stroll';
    this.greeting = 0;
    this.panic = 0;
    this.mixer = null;
    this.humanActions = {};
    this.humanAction = null;
    this.wavePlaying = false;
    this.wasGreeting = false;

    // Revision-seven people carry a real skeleton and authored motion. Keep
    // the old named-pivot animation below as a fallback for partial checkouts,
    // but drive every high-detail resident with the rig it was built around.
    if (options.gltf?.animations?.length) {
      this.mixer = new THREE.AnimationMixer(root);
      for (const name of ['Idle', 'Walk', 'Wave']) {
        const clip = humanClip(options.gltf, name);
        if (clip) this.humanActions[name.toLowerCase()] = this.mixer.clipAction(clip);
      }
      const wave = this.humanActions.wave;
      if (wave) {
        wave.setLoop(THREE.LoopOnce, 1);
        wave.clampWhenFinished = true;
        this.mixer.addEventListener('finished', (event) => {
          if (event.action !== wave) return;
          this.wavePlaying = false;
          this.playHumanAction('idle', .18);
        });
      }
      this.playHumanAction('idle', 0);
    }
  }

  playHumanAction(name, fade = .2) {
    const next = this.humanActions[name];
    if (!next || next === this.humanAction) return;
    next.enabled = true;
    next.reset().fadeIn(fade).play();
    this.humanAction?.fadeOut(fade);
    this.humanAction = next;
  }

  // Somebody just fired, or fell, within earshot. Three hundred people live
  // here and none of them stand and watch: they break away from the noise.
  alarm(position, level = 1) {
    this.panic = Math.max(this.panic, level);
    this.heading = Math.atan2(this.root.position.x - position.x,
      this.root.position.z - position.z);
    this.detourTimer = 0;
    this.state = 'flee';
    this.timer = 3 + Math.random() * 3;
  }

  update(dt, playerPosition, colliders) {
    if (this.root.userData.alive === false) return;
    _toPlayer.subVectors(playerPosition, this.root.position);
    const distance = _toPlayer.length();
    const sameLevel = Math.abs(playerPosition.y - this.root.position.y) < 2.2;

    if (this.panic > 0) {
      this.panic = Math.max(0, this.panic - dt * 0.28);
      this.timer -= dt;
      this.greeting = 0;
      // Run the gallery away from the shot rather than into the balustrade.
      const tangent = Math.atan2(this.root.position.x, this.root.position.z) + Math.PI / 2;
      const away = Math.atan2(this.root.position.x - playerPosition.x,
        this.root.position.z - playerPosition.z);
      const along = Math.cos(away - tangent) >= 0 ? tangent : tangent + Math.PI;
      this.steer(along);
      const fled = this.advance(dt, this.speed * 2.35, colliders);
      this.phase += (fled > 0 ? fled * 3.2 : 0.6) * dt;
      this.root.position.y = this.homeY;
      this.animate(dt, fled, 0);
      if (this.timer <= 0 && this.panic <= 0.05) this.state = 'stroll';
      return;
    }

    this.timer -= dt;
    if (distance < 3.4 && sameLevel) {
      // Turn to face whoever just walked up.
      this.state = 'greet';
      this.greeting = Math.min(1, this.greeting + dt * 3);
      this.steer(Math.atan2(_toPlayer.x, _toPlayer.z));
    } else {
      this.greeting = Math.max(0, this.greeting - dt * 2);
      if (this.timer <= 0) {
        this.state = Math.random() < 0.35 ? 'rest' : 'stroll';
        if (this.state === 'stroll') {
          // Walk the gallery: follow the ring rather than crossing the well.
          this.orbitDirection = Math.random() < 0.5 ? 0 : Math.PI;
        }
        this.timer = 3 + Math.random() * 7;
      }
    }

    if (this.state === 'stroll') {
      const tangent = Math.atan2(this.root.position.x, this.root.position.z) + Math.PI / 2;
      this.steer(tangent + (this.orbitDirection || 0));
    }

    const speed = this.state === 'stroll' ? this.speed : 0;
    const moved = speed > 0 ? this.advance(dt, speed, colliders) : 0;
    this.phase += (moved > 0 ? moved * 2.9 : 0.6) * dt;

    // Residents stay on their own gallery; the stair is the player's problem.
    this.root.position.y = this.homeY;
    this.animate(dt, moved, this.greeting);
  }

  // The walk cycle and the face. Split out of update() because a fleeing
  // resident takes a different route through the state machine and still has
  // to move their legs.
  animate(dt, moved, greeting) {
    if (this.mixer) {
      const greetingNow = greeting > .18;
      if (moved > .02) {
        this.wavePlaying = false;
        this.playHumanAction('walk', .16);
        this.humanActions.walk?.setEffectiveTimeScale(
          THREE.MathUtils.clamp(.72 + moved * .36, .72, 1.35));
      } else if (greetingNow && !this.wasGreeting && this.humanActions.wave) {
        this.wavePlaying = true;
        this.playHumanAction('wave', .15);
      } else if (!this.wavePlaying) {
        this.playHumanAction('idle', .22);
      }
      this.mixer.update(dt);
      this.wasGreeting = greetingNow;
      return;
    }

    swing(this.limbs, ['legL'], this.phase, moved * 0.14);
    swing(this.limbs, ['legR'], this.phase + Math.PI, moved * 0.14);
    swing(this.limbs, ['shinL'], this.phase + 1.1, moved * 0.07);
    swing(this.limbs, ['shinR'], this.phase + Math.PI + 1.1, moved * 0.07);
    swing(this.limbs, ['armL'], this.phase + Math.PI, moved * 0.12);
    swing(this.limbs, ['armR'], this.phase, moved * 0.12);
    swing(this.limbs, ['foreL'], this.phase + Math.PI, moved * 0.045);
    swing(this.limbs, ['foreR'], this.phase, moved * 0.045);

    // A resident who notices the player raises a forearm and settles their
    // stance instead of continuing the same mannequin walk cycle while they
    // speak. The motion is deliberately restrained for the confined silo.
    if (this.limbs.armR) {
      const target = this.limbs.armR.rest - greeting * 0.54;
      this.limbs.armR.node.rotation.x = THREE.MathUtils.damp(
        this.limbs.armR.node.rotation.x, target, 7, dt);
    }
    if (this.limbs.foreR) {
      const target = this.limbs.foreR.rest - greeting * 0.82;
      this.limbs.foreR.node.rotation.x = THREE.MathUtils.damp(
        this.limbs.foreR.node.rotation.x, target, 8, dt);
    }
    if (this.limbs.torso) {
      this.limbs.torso.node.rotation.z = Math.sin(this.phase * 0.5) * 0.03 * (moved > 0 ? 1 : 0.3);
    }
    if (this.limbs.head) {
      // Idling, they look around; greeting, they look at you.
      const idle = Math.sin(this.phase * 0.4) * 0.3;
      this.limbs.head.node.rotation.y = THREE.MathUtils.lerp(idle, 0, greeting);
      this.limbs.head.node.rotation.x = Math.sin(this.phase * 0.7) * 0.018
        - greeting * 0.035;
    }
    // Short, infrequent blinks keep the new close-up eyes alive without a
    // morph-target rig or another per-character animation mixer.
    const blink = Math.pow(Math.max(0, Math.sin(this.phase * 0.53 + this.root.id)), 22);
    for (const eye of this.eyes) eye.scale.y = 1 - blink * 0.86;
  }
}

// Blue-noise-ish scatter: keep trying random spots until one is clear of props
// and far enough from the shelter entrance that nothing spawns on the player.
function findSpawn(colliders, radius, bounds, avoid) {
  for (let attempt = 0; attempt < 60; attempt++) {
    const x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
    const z = bounds.minZ + Math.random() * (bounds.maxZ - bounds.minZ);
    if (colliders.contains(x, z, radius + 0.5, 0.2, 1.6)) continue;
    if (avoid.some(p => Math.hypot(p.x - x, p.z - z) < p.r)) continue;
    return { x, z };
  }
  return null;
}

export const RESIDENT_BUILDS = HUMAN_BUILD_PRESETS;

export function populateSilo({ scene, colliders, assets, walkable, count = 20 }) {
  const residents = [];
  const agents = [];
  const byRoot = new Map();
  const availableBuilds = RESIDENT_BUILDS.filter((preset) => assets[preset.asset]);
  if (!availableBuilds.length || !walkable?.length) {
    return { residents, agents, byRoot, update: () => {}, resolvePlayer: () => false,
             agentFor: () => null, alarm: () => 0 };
  }

  // Spread over the upper galleries rather than one per level: a silo of three
  // hundred should look inhabited from the first landing you reach, not offer
  // one person every forty metres of stair.
  const occupied = Math.min(4, walkable.length);
  for (let i = 0; i < count; i++) {
    const ring = walkable[walkable.length - 1 - (i % occupied)];
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.6;
    // Walk the builds rather than picking at random, so twenty residents are
    // never eleven of one body and one of another.
    const built = createResidentHuman(assets, i);
    if (!built) continue;
    const { root, gltf } = built;
    root.position.set(Math.cos(angle) * ring.radius, ring.y, Math.sin(angle) * ring.radius);
    root.rotation.y = Math.atan2(-Math.cos(angle), -Math.sin(angle));
    root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    scene.add(root);
    const agent = new Resident(root, {
      speed: 0.85 + Math.random() * 0.35,
      turnRate: 2.6,
      homeY: ring.y,
      line: RESIDENT_LINES[i % RESIDENT_LINES.length],
      gltf,
    });
    agents.push(agent);
    residents.push(root);
    byRoot.set(root, agent);
    root.userData.resident = agent;
  }

  const agentFor = (root) => byRoot.get(root) || null;

  /**
   * A shot, or a body hitting the deck. Everyone on the same gallery within
   * `radius` breaks away from it; the count is what the caller reports.
   */
  function alarm(position, radius = 22) {
    let heard = 0;
    for (const agent of agents) {
      if (agent.root.userData.alive === false) continue;
      if (Math.abs(agent.root.position.y - position.y) > 2.4) continue;
      const distance = Math.hypot(agent.root.position.x - position.x,
        agent.root.position.z - position.z);
      if (distance > radius) continue;
      agent.alarm(position, 1 - distance / (radius * 2));
      heard++;
    }
    return heard;
  }

  function update(dt, world, playerPosition) {
    if (world !== 'silo') {
      // A body that started falling has to finish falling, even if the player
      // walked out of the silo while it was still on its way down.
      for (const agent of agents) if (agent.dying > 0 && agent.dying < 1) agent.collapse(dt);
      return;
    }
    for (const agent of agents) {
      if (agent.root.userData.alive === false) {
        if (agent.dying < 1) agent.collapse(dt);
        continue;
      }
      agent.update(dt, playerPosition, colliders);
    }

    // Keep them out of each other on a busy gallery.
    for (let i = 0; i < agents.length; i++) {
      if (agents[i].root.userData.alive === false) continue;
      for (let j = i + 1; j < agents.length; j++) {
        if (agents[j].root.userData.alive === false) continue;
        const a = agents[i].root.position;
        const b = agents[j].root.position;
        if (Math.abs(a.y - b.y) > 1) continue;
        const dx = b.x - a.x;
        const dz = b.z - a.z;
        const minimum = agents[i].radius + agents[j].radius;
        const distanceSq = dx * dx + dz * dz;
        if (distanceSq >= minimum * minimum || distanceSq < 1e-6) continue;
        const distance = Math.sqrt(distanceSq);
        const push = (minimum - distance) * 0.5;
        a.x -= (dx / distance) * push; a.z -= (dz / distance) * push;
        b.x += (dx / distance) * push; b.z += (dz / distance) * push;
      }
    }
  }

  // Residents are moving actors, so static level collision cannot represent
  // them. Resolve the player capsule against their current positions after
  // movement instead: people feel like people, not ghosts, while still being
  // free to walk their gallery routes.
  function resolvePlayer(position, radius = 0.34, height = 1.78) {
    let corrected = false;
    for (const agent of agents) {
      // You can step over the dead. Only people still on their feet push back.
      if (agent.root.userData.alive === false) continue;
      const other = agent.root.position;
      if (Math.abs(position.y - other.y) > Math.max(1.25, height * .75)) continue;
      let dx = position.x - other.x;
      let dz = position.z - other.z;
      const minimum = radius + agent.radius + .04;
      let distance = Math.hypot(dx, dz);
      if (distance >= minimum) continue;
      if (distance < 1e-5) {
        const fallback = agent.root.id * 1.618;
        dx = Math.cos(fallback);
        dz = Math.sin(fallback);
        distance = 1;
      }
      const push = minimum - distance;
      position.x += dx / distance * push;
      position.z += dz / distance * push;
      corrected = true;
    }
    if (corrected) {
      colliders.resolve(position, radius, position.y, position.y + height, 0);
    }
    return corrected;
  }

  return { residents, agents, byRoot, agentFor, alarm, update, resolvePlayer };
}

export function createCreatureSystem({ scene, colliders, assets, counts = {}, wildlife: spawnWildlife = true }) {
  const wildlife = [];
  // The surface is dead. Nothing walks it, and the system is asked to build
  // nothing rather than being handed a count of zero in four places.
  if (!spawnWildlife) {
    return { wildlife, agents: [], update: () => {} };
  }
  const agents = [];
  const byRoot = new Map();
  const bounds = { minX: -17.5, maxX: 17.5, minZ: -24, maxZ: 15.5 };
  const avoid = [{ x: 0, z: -13, r: 7 }];

  const spawn = (gltf, kind, options) => {
    if (!gltf) return null;
    const point = findSpawn(colliders, options.radius ?? 0.4, bounds, avoid);
    if (!point) return null;
    const root = cloneGLTF(gltf);
    root.position.set(point.x, 0, point.z);
    root.rotation.y = Math.random() * Math.PI * 2;
    root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    scene.add(root);
    const agent = new Prey(root, kind, options);
    agents.push(agent);
    byRoot.set(root, agent);
    wildlife.push(root);
    return agent;
  };

  for (let i = 0; i < (counts.deer ?? 3); i++) spawn(assets.deer, 'deer', { speed: 1.9, radius: 0.55 });
  for (let i = 0; i < (counts.rabbit ?? 5); i++) spawn(assets.rabbit, 'rabbit', { speed: 1.5, radius: 0.22, turnRate: 4 });

  function agentFor(root) {
    return byRoot.get(root) || null;
  }

  // Keep bodies out of each other. With a handful of animals the pairwise pass
  // is far cheaper than any spatial index would be to maintain.
  function separate() {
    for (let i = 0; i < agents.length; i++) {
      const a = agents[i];
      if (a.root.userData.alive === false) continue;
      for (let j = i + 1; j < agents.length; j++) {
        const b = agents[j];
        if (b.root.userData.alive === false) continue;
        const dx = b.root.position.x - a.root.position.x;
        const dz = b.root.position.z - a.root.position.z;
        const minimum = a.radius + b.radius;
        const distanceSq = dx * dx + dz * dz;
        if (distanceSq >= minimum * minimum || distanceSq < 1e-6) continue;
        const distance = Math.sqrt(distanceSq);
        const push = (minimum - distance) * 0.5;
        const nx = dx / distance;
        const nz = dz / distance;
        a.root.position.x -= nx * push;
        a.root.position.z -= nz * push;
        b.root.position.x += nx * push;
        b.root.position.z += nz * push;
      }
    }
  }

  function update(dt, world, playerPosition) {
    // Wildlife only runs while the player is on the surface; indoors the only
    // thing left to advance is a collapse already in progress.
    if (world !== 'outside') {
      for (const agent of agents) if (agent.dying > 0 && agent.dying < 1) agent.collapse(dt);
      return;
    }
    for (const agent of agents) {
      if (agent.root.userData.alive === false) {
        if (agent.dying < 1) agent.collapse(dt);
        continue;
      }
      agent.update(dt, playerPosition, colliders);
    }
    separate();
  }

  return { wildlife, agents, update, agentFor, byRoot };
}

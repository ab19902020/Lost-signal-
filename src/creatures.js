import * as THREE from 'three';
import { cloneGLTF, findNamed } from './assets.js';

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

  // A downed animal folds over instead of snapping to a right angle: legs give
  // out, the body drops and the whole thing tips onto its side.
  collapse(dt) {
    this.dying = Math.min(1, this.dying + dt * 2.2);
    const eased = this.dying * this.dying * (3 - 2 * this.dying);
    this.root.rotation.z = eased * (Math.PI / 2) * this.fallDirection;
    this.root.position.y = -eased * this.dropHeight;
    for (const limb of Object.values(this.limbs || {})) {
      limb.node.rotation.x = THREE.MathUtils.lerp(limb.node.rotation.x, limb.rest + 0.4, dt * 4);
    }
  }

  kill() {
    if (this.root.userData.alive === false) return false;
    this.root.userData.alive = false;
    this.fallDirection = Math.random() < 0.5 ? -1 : 1;
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
      torso: 'Resident_Torso', head: 'Resident_Head',
    });
    this.line = options.line ?? RESIDENT_LINES[0];
    this.homeY = options.homeY ?? 0;
    this.radius = options.radius ?? 0.34;
    this.state = 'stroll';
    this.greeting = 0;
  }

  update(dt, playerPosition, colliders) {
    if (this.root.userData.alive === false) return;
    _toPlayer.subVectors(playerPosition, this.root.position);
    const distance = _toPlayer.length();
    const sameLevel = Math.abs(playerPosition.y - this.root.position.y) < 2.2;

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

    swing(this.limbs, ['legL'], this.phase, moved * 0.14);
    swing(this.limbs, ['legR'], this.phase + Math.PI, moved * 0.14);
    swing(this.limbs, ['shinL'], this.phase + 1.1, moved * 0.07);
    swing(this.limbs, ['shinR'], this.phase + Math.PI + 1.1, moved * 0.07);
    swing(this.limbs, ['armL'], this.phase + Math.PI, moved * 0.12);
    swing(this.limbs, ['armR'], this.phase, moved * 0.12);
    if (this.limbs.torso) {
      this.limbs.torso.node.rotation.z = Math.sin(this.phase * 0.5) * 0.03 * (moved > 0 ? 1 : 0.3);
    }
    if (this.limbs.head) {
      // Idling, they look around; greeting, they look at you.
      const idle = Math.sin(this.phase * 0.4) * 0.3;
      this.limbs.head.node.rotation.y = THREE.MathUtils.lerp(idle, 0, this.greeting);
    }
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

// Place residents around a gallery ring at a given height.
// Ten identical people on one gallery reads as a copy-paste, not a community.
// Each resident gets their own jacket, trousers, hair and skin tone, cloned off
// the shared materials so the change is per-figure.
const JACKETS = [0x3f4a52, 0x4a4038, 0x2f4442, 0x53433f, 0x38414f, 0x4d4a3a, 0x424a44, 0x554440];
const TROUSERS = [0x2b2f36, 0x35302b, 0x232a2c, 0x3a352f, 0x2a2d33];
const HAIRS = [0x171310, 0x2e2118, 0x4a3626, 0x6b6259, 0x0f0d0c, 0x3d2b1c];
const SKINS = [0x8a6650, 0xb08968, 0x6b4a36, 0xc79c78, 0x53382a, 0x9c7355];

export function dressPerson(root, index) {
  const pick = (list, salt) => list[(index * 7 + salt) % list.length];
  const swatch = {
    HabJacket: pick(JACKETS, 0),
    HabTrouser: pick(TROUSERS, 3),
    HabHair: pick(HAIRS, 5),
    HabSkin: pick(SKINS, 1),
  };
  const cloned = new Map();
  root.traverse((o) => {
    if (!o.isMesh) return;
    const materials = Array.isArray(o.material) ? o.material : [o.material];
    const swapped = materials.map((m) => {
      const colour = m && swatch[m.name];
      if (colour === undefined) return m;
      let copy = cloned.get(m.name);
      if (!copy) {
        copy = m.clone();
        copy.color.setHex(colour);
        cloned.set(m.name, copy);
      }
      return copy;
    });
    o.material = Array.isArray(o.material) ? swapped : swapped[0];
  });
  return root;
}

// The six builds of person the Blender kit ships. Twenty residents drawn from
// six bodies and a palette of cloth, hair and skin read as twenty people; one
// body recoloured twenty times reads as one person cloned.
export const RESIDENT_BUILDS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function populateSilo({ scene, colliders, assets, walkable, count = 20 }) {
  const residents = [];
  const agents = [];
  const builds = RESIDENT_BUILDS.map((k) => assets[`resident${k}`]).filter(Boolean);
  if (!builds.length || !walkable?.length) return { residents, agents, update: () => {} };

  // Spread over the upper galleries rather than one per level: a silo of three
  // hundred should look inhabited from the first landing you reach, not offer
  // one person every forty metres of stair.
  const occupied = Math.min(4, walkable.length);
  for (let i = 0; i < count; i++) {
    const ring = walkable[walkable.length - 1 - (i % occupied)];
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.6;
    // Walk the builds rather than picking at random, so twenty residents are
    // never eleven of one body and one of another.
    const root = dressPerson(cloneGLTF(builds[i % builds.length]), i);
    root.position.set(Math.cos(angle) * ring.radius, ring.y, Math.sin(angle) * ring.radius);
    root.rotation.y = Math.atan2(-Math.cos(angle), -Math.sin(angle));
    root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    scene.add(root);
    const agent = new Resident(root, {
      speed: 0.85 + Math.random() * 0.35,
      turnRate: 2.6,
      homeY: ring.y,
      line: RESIDENT_LINES[i % RESIDENT_LINES.length],
    });
    agents.push(agent);
    residents.push(root);
    root.userData.resident = agent;
  }

  function update(dt, world, playerPosition) {
    if (world !== 'silo') return;
    for (const agent of agents) agent.update(dt, playerPosition, colliders);

    // Keep them out of each other on a busy gallery.
    for (let i = 0; i < agents.length; i++) {
      for (let j = i + 1; j < agents.length; j++) {
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

  return { residents, agents, update };
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

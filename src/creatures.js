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

  // Shared locomotion: face the heading, walk forward, refuse to walk into
  // anything the player would also collide with.
  advance(dt, speed, colliders) {
    const target = this.heading;
    let delta = ((target - this.root.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    this.root.rotation.y += THREE.MathUtils.clamp(delta, -this.turnRate * dt, this.turnRate * dt);

    _step.set(Math.sin(this.root.rotation.y), 0, Math.cos(this.root.rotation.y)).multiplyScalar(speed * dt);
    const nextX = this.root.position.x + _step.x;
    const nextZ = this.root.position.z + _step.z;
    if (colliders.contains(nextX, nextZ, this.radius, 0.25, 1.2)) {
      this.heading += Math.PI * (0.6 + Math.random() * 0.5);
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
      this.heading = Math.atan2(-_toPlayer.x, -_toPlayer.z);
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

class Infected extends Creature {
  constructor(root, options) {
    super(root, 'zombie', options);
    this.limbs = collectLimbs(root, {
      legL: 'Infected_Leg_-1', legR: 'Infected_Leg_1',
      shinL: 'Infected_Shin_-1', shinR: 'Infected_Shin_1',
      armL: 'Infected_Arm_-1', armR: 'Infected_Arm_1',
      torso: 'Infected_Torso', head: 'Infected_Head',
    });
    root.userData.hp = options.hp ?? 3;
    this.senseRange = options.senseRange ?? 22;
    this.attackRange = options.attackRange ?? 1.5;
    this.attackCooldown = 0;
  }

  update(dt, playerPosition, colliders, onAttack) {
    if (this.root.userData.alive === false) return;
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    _toPlayer.subVectors(playerPosition, this.root.position);
    const distance = _toPlayer.length();

    if (distance < this.senseRange) {
      this.state = distance < this.attackRange ? 'attack' : 'pursue';
      this.heading = Math.atan2(_toPlayer.x, _toPlayer.z);
    } else {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.state = Math.random() < 0.5 ? 'idle' : 'shamble';
        if (this.state === 'shamble') this.heading = Math.random() * Math.PI * 2;
        this.timer = 3 + Math.random() * 6;
      }
    }

    let speed = 0;
    if (this.state === 'pursue') speed = this.speed * (distance < 8 ? 1.45 : 1);
    else if (this.state === 'shamble') speed = this.speed * 0.42;

    const moved = speed > 0 ? this.advance(dt, speed, colliders) : 0;
    this.phase += (moved > 0 ? moved * 2.6 : 0.9) * dt;

    if (this.state === 'attack' && this.attackCooldown === 0) {
      this.attackCooldown = 1.35;
      onAttack?.(this);
    }

    const lurch = this.state === 'attack' ? 0.9 : 0.34;
    swing(this.limbs, ['legL'], this.phase, moved * 0.13);
    swing(this.limbs, ['legR'], this.phase + Math.PI, moved * 0.13);
    swing(this.limbs, ['shinL'], this.phase + 1.1, moved * 0.08);
    swing(this.limbs, ['shinR'], this.phase + Math.PI + 1.1, moved * 0.08);
    // Arms stay raised ahead of the body, which is what makes it read as
    // infected rather than as a person out for a walk.
    if (this.limbs.armL) this.limbs.armL.node.rotation.x = this.limbs.armL.rest - 1.15 - Math.sin(this.phase) * lurch * 0.2;
    if (this.limbs.armR) this.limbs.armR.node.rotation.x = this.limbs.armR.rest - 1.05 + Math.sin(this.phase) * lurch * 0.2;
    if (this.limbs.torso) this.limbs.torso.node.rotation.z = Math.sin(this.phase * 0.5) * 0.09;
    if (this.limbs.head) this.limbs.head.node.rotation.y = Math.sin(this.phase * 0.33) * 0.28;
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

export function createCreatureSystem({ scene, colliders, assets, counts = {} }) {
  const wildlife = [];
  const zombies = [];
  const agents = [];
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
    const agent = kind === 'zombie' ? new Infected(root, options) : new Prey(root, kind, options);
    agents.push(agent);
    (kind === 'zombie' ? zombies : wildlife).push(root);
    return agent;
  };

  for (let i = 0; i < (counts.deer ?? 3); i++) spawn(assets.deer, 'deer', { speed: 1.9, radius: 0.55 });
  for (let i = 0; i < (counts.rabbit ?? 5); i++) spawn(assets.rabbit, 'rabbit', { speed: 1.5, radius: 0.22, turnRate: 4 });
  for (let i = 0; i < (counts.zombie ?? 4); i++) spawn(assets.infected, 'zombie', { speed: 1.15, radius: 0.4, hp: 3 });

  // Keep bodies out of each other. With a dozen agents the pairwise pass is
  // far cheaper than any spatial index would be to maintain.
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

  function update(dt, world, playerPosition, onAttack) {
    // Creatures only exist on the surface; skip the whole system indoors.
    if (world !== 'outside') return;
    for (const agent of agents) {
      if (agent.root.userData.alive === false) continue;
      if (agent instanceof Infected) agent.update(dt, playerPosition, colliders, onAttack);
      else agent.update(dt, playerPosition, colliders);
    }
    separate();
  }

  return { wildlife, zombies, agents, update };
}

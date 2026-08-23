import * as THREE from 'three';

// Lost Signal physics.
//
// The world rule keeps every *visible* object in Blender, so collision volumes
// are derived from the bounds of those Blender meshes instead of being hand
// authored as magic rectangles. Colliders are axis-aligned boxes tested against
// a vertical capsule (a circle in XZ plus a height span), which gives us wall
// sliding, walk-under clearance for ceiling pipes, and step-up onto low props.

const EPSILON = 1e-4;
const TAU = Math.PI * 2;
const normaliseAngle = (a) => ((a % TAU) + TAU) % TAU;
const _box = new THREE.Box3();
const _size = new THREE.Vector3();

export class ColliderSet {
  constructor(bounds = null) {
    this.boxes = [];
    // Rings: the silo is a body of revolution, and its two circular walls and
    // its walkways are not boxes. Approximating them with one axis-aligned box
    // per bay put metres of invisible collision into the walkway — an
    // axis-aligned box round a slab that is wide along the ring and thin
    // through it is far larger than the slab. A ring is exact, and one test.
    this.rings = [];
    this.bounds = bounds;
  }

  /**
   * A band of revolution about the Y axis: solid between two radii, over a
   * height span, except inside the angular gaps.
   *
   * `gaps` are [centre, halfWidth] pairs in radians — a doorway, or the
   * opening a stair landing needs in the gallery railing. A capsule passes
   * through a gap only if the whole of it fits, so a gap narrower than the
   * player is still a wall.
   */
  addRing({ innerRadius, outerRadius, minY, maxY, gaps = [], climbable = false }) {
    const ring = {
      r0: Math.min(innerRadius, outerRadius),
      r1: Math.max(innerRadius, outerRadius),
      minY, maxY, climbable,
      gaps: gaps.map(([centre, half]) => [normaliseAngle(centre), Math.abs(half)]),
    };
    this.rings.push(ring);
    return ring;
  }

  // Is this angle far enough inside one of the ring's gaps for a capsule of
  // `margin` radians to pass?
  static _inGap(ring, angle, margin) {
    for (const [centre, half] of ring.gaps) {
      if (half <= margin) continue;
      let d = normaliseAngle(angle) - centre;
      if (d > Math.PI) d -= Math.PI * 2;
      if (d < -Math.PI) d += Math.PI * 2;
      if (Math.abs(d) <= half - margin) return true;
    }
    return false;
  }

  // Register the world-space bounds of a placed Blender object.
  addObject(root, options = {}) {
    root.updateWorldMatrix(true, true);
    _box.setFromObject(root);
    if (!isFinite(_box.min.x) || _box.isEmpty()) return null;
    return this.addBox(_box.clone(), options);
  }

  addBox(box, options = {}) {
    const { shrink = 0, climbable = false } = options;
    if (shrink) {
      box.min.x += shrink; box.max.x -= shrink;
      box.min.z += shrink; box.max.z -= shrink;
      if (box.min.x >= box.max.x || box.min.z >= box.max.z) return null;
    }
    box.getSize(_size);
    if (_size.x < 0.02 || _size.z < 0.02) return null;
    const collider = { box, climbable };
    this.boxes.push(collider);
    return collider;
  }

  // Height of the highest climbable surface under the given circle, or 0.
  floorAt(x, z, radius, maxHeight) {
    let floor = 0;
    for (const { box, climbable } of this.boxes) {
      if (!climbable) continue;
      if (box.max.y > maxHeight || box.max.y <= floor) continue;
      if (x < box.min.x - radius || x > box.max.x + radius) continue;
      if (z < box.min.z - radius || z > box.max.z + radius) continue;
      floor = box.max.y;
    }
    for (const ring of this.rings) {
      if (!ring.climbable) continue;
      if (ring.maxY > maxHeight || ring.maxY <= floor) continue;
      const d = Math.hypot(x, z);
      if (d < ring.r0 - radius || d > ring.r1 + radius) continue;
      if (ColliderSet._inGap(ring, Math.atan2(z, x), radius / Math.max(d, 0.01))) continue;
      floor = ring.maxY;
    }
    return floor;
  }

  // Push a capsule out of every box it overlaps. Resolving along the shallowest
  // axis is what makes the player slide along a wall instead of sticking to it.
  resolve(position, radius, feetY, headY, stepHeight = 0) {
    let corrected = false;
    for (let pass = 0; pass < 3; pass++) {
      let moved = false;
      for (const { box, climbable } of this.boxes) {
        if (box.max.y <= feetY + EPSILON || box.min.y >= headY - EPSILON) continue;
        if (climbable && box.max.y <= feetY + stepHeight + EPSILON) continue;

        const closestX = Math.max(box.min.x, Math.min(position.x, box.max.x));
        const closestZ = Math.max(box.min.z, Math.min(position.z, box.max.z));
        const dx = position.x - closestX;
        const dz = position.z - closestZ;
        const distSq = dx * dx + dz * dz;
        if (distSq >= radius * radius) continue;

        if (distSq > EPSILON) {
          // Outside the box footprint: push straight out along the contact normal.
          const dist = Math.sqrt(distSq);
          const push = radius - dist;
          position.x += (dx / dist) * push;
          position.z += (dz / dist) * push;
        } else {
          // Centre is inside the footprint: escape via the nearest face.
          const left = position.x - box.min.x;
          const right = box.max.x - position.x;
          const back = position.z - box.min.z;
          const front = box.max.z - position.z;
          const min = Math.min(left, right, back, front);
          if (min === left) position.x = box.min.x - radius;
          else if (min === right) position.x = box.max.x + radius;
          else if (min === back) position.z = box.min.z - radius;
          else position.z = box.max.z + radius;
        }
        moved = true;
        corrected = true;
      }
      for (const ring of this.rings) {
        if (ring.maxY <= feetY + EPSILON || ring.minY >= headY - EPSILON) continue;
        if (ring.climbable && ring.maxY <= feetY + stepHeight + EPSILON) continue;
        const d = Math.hypot(position.x, position.z);
        if (d < ring.r0 - radius || d > ring.r1 + radius) continue;
        const angle = Math.atan2(position.z, position.x);
        if (ColliderSet._inGap(ring, angle, radius / Math.max(d, 0.01))) continue;
        // Out through the nearer face of the band.
        const target = (d - ring.r0 < ring.r1 - d) ? ring.r0 - radius : ring.r1 + radius;
        if (target <= 0) continue;
        position.x = Math.cos(angle) * target;
        position.z = Math.sin(angle) * target;
        moved = true;
        corrected = true;
      }
      if (!moved) break;
    }

    if (this.bounds) {
      const b = this.bounds;
      const x = THREE.MathUtils.clamp(position.x, b.minX + radius, b.maxX - radius);
      const z = THREE.MathUtils.clamp(position.z, b.minZ + radius, b.maxZ - radius);
      if (x !== position.x || z !== position.z) corrected = true;
      position.x = x;
      position.z = z;
    }
    return corrected;
  }

  // Cheap point query kept for AI and for the legacy blocked() signature.
  contains(x, z, radius = 0, feetY = 0.1, headY = 1.8) {
    if (this.bounds) {
      const b = this.bounds;
      if (x < b.minX + radius || x > b.maxX - radius) return true;
      if (z < b.minZ + radius || z > b.maxZ - radius) return true;
    }
    for (const { box } of this.boxes) {
      if (box.max.y <= feetY || box.min.y >= headY) continue;
      if (x > box.min.x - radius && x < box.max.x + radius &&
          z > box.min.z - radius && z < box.max.z + radius) return true;
    }
    for (const ring of this.rings) {
      if (ring.climbable) continue;
      if (ring.maxY <= feetY || ring.minY >= headY) continue;
      const d = Math.hypot(x, z);
      if (d < ring.r0 - radius || d > ring.r1 + radius) continue;
      if (ColliderSet._inGap(ring, Math.atan2(z, x), radius / Math.max(d, 0.01))) continue;
      return true;
    }
    return false;
  }
}

// Player capsule state and integration. Kept separate from input handling so the
// same controller can drive the player and, later, any AI that needs to respect
// world collision.
export class CharacterBody {
  constructor(options = {}) {
    this.radius = options.radius ?? 0.34;
    this.standHeight = options.standHeight ?? 1.78;
    this.crouchHeight = options.crouchHeight ?? 1.14;
    this.eyeOffset = options.eyeOffset ?? -0.11;
    this.stepHeight = options.stepHeight ?? 0.34;
    this.gravity = options.gravity ?? -18.5;
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.height = this.standHeight;
    this.crouching = false;
    this.grounded = true;
    this.groundY = 0;
    this.landingImpact = 0;
    this.distanceWalked = 0;
  }

  get eyeHeight() {
    return this.height + this.eyeOffset;
  }

  // desired is the horizontal velocity the input layer wants this frame.
  step(dt, desired, colliders, options = {}) {
    const { crouch = false, jump = false, jumpSpeed = 4.4 } = options;

    const targetHeight = crouch ? this.crouchHeight : this.standHeight;
    if (targetHeight > this.height) {
      // Only stand back up if there is headroom for it.
      const head = this.position.y + targetHeight;
      const clear = !colliders.contains(this.position.x, this.position.z, this.radius * 0.9,
        this.position.y + this.height, head);
      if (clear) this.height = THREE.MathUtils.damp(this.height, targetHeight, 12, dt);
    } else {
      this.height = THREE.MathUtils.damp(this.height, targetHeight, 14, dt);
    }
    this.crouching = crouch;

    // Ground acceleration is snappier than air control, which is what makes
    // movement feel like a person rather than a floating camera.
    const control = this.grounded ? 13 : 2.6;
    this.velocity.x = THREE.MathUtils.damp(this.velocity.x, desired.x, control, dt);
    this.velocity.z = THREE.MathUtils.damp(this.velocity.z, desired.z, control, dt);

    if (jump && this.grounded) {
      this.velocity.y = jumpSpeed;
      this.grounded = false;
    }
    this.velocity.y += this.gravity * dt;

    const before = { x: this.position.x, z: this.position.z };
    this.position.x += this.velocity.x * dt;
    this.position.z += this.velocity.z * dt;
    this.position.y += this.velocity.y * dt;

    const feet = this.position.y;
    const head = this.position.y + this.height;
    colliders.resolve(this.position, this.radius, feet, head, this.stepHeight);

    // Kill the velocity component that a wall just absorbed so we do not keep
    // building speed into geometry.
    const actualX = (this.position.x - before.x) / Math.max(dt, EPSILON);
    const actualZ = (this.position.z - before.z) / Math.max(dt, EPSILON);
    if (Math.abs(actualX) < Math.abs(this.velocity.x)) this.velocity.x = actualX;
    if (Math.abs(actualZ) < Math.abs(this.velocity.z)) this.velocity.z = actualZ;

    this.groundY = colliders.floorAt(this.position.x, this.position.z, this.radius, this.position.y + this.stepHeight);
    if (this.position.y <= this.groundY + EPSILON) {
      if (!this.grounded && this.velocity.y < -2.2) this.landingImpact = Math.min(1, -this.velocity.y / 9);
      this.position.y = this.groundY;
      this.velocity.y = 0;
      this.grounded = true;
    } else {
      this.grounded = false;
    }

    this.landingImpact = THREE.MathUtils.damp(this.landingImpact, 0, 7, dt);
    if (this.grounded) {
      this.distanceWalked += Math.hypot(this.position.x - before.x, this.position.z - before.z);
    }
    return this;
  }

  get horizontalSpeed() {
    return Math.hypot(this.velocity.x, this.velocity.z);
  }

  teleport(x, y, z) {
    this.position.set(x, y, z);
    this.velocity.set(0, 0, 0);
    this.grounded = true;
    this.landingImpact = 0;
    return this;
  }
}

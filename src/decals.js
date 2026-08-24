import * as THREE from 'three';

// Bullet marks.
//
// A round that hits concrete has to leave something behind, or the rifle reads
// as a noise-maker. These are camera-facing-free quads laid flat on whatever
// was hit, drawn from a fixed pool: the shelter is a closed space the player
// walks back through, so marks persist while they are in the room and then
// fade, rather than accumulating into a permanent scab of draw calls.

const POOL = 64;
const LIFE = 34;      // seconds a mark stays at full strength
const FADE = 7;       // seconds it takes to disappear at the end of that

// The texture is drawn once, in code. The project ships no image assets, and a
// hole is a dark core, a bright chipped lip and a little radial cracking.
function holeTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);
  const half = size / 2;

  // Chipped surround: a soft, uneven bloom of pale dust.
  const dust = ctx.createRadialGradient(half, half, size * 0.10, half, half, half);
  dust.addColorStop(0, 'rgba(60,56,52,0.95)');
  dust.addColorStop(0.45, 'rgba(96,90,84,0.5)');
  dust.addColorStop(1, 'rgba(120,114,108,0)');
  ctx.fillStyle = dust;
  ctx.beginPath();
  ctx.arc(half, half, half, 0, Math.PI * 2);
  ctx.fill();

  // Radial cracks, so no two marks read as the same rubber stamp once they are
  // rotated against each other on a wall.
  ctx.strokeStyle = 'rgba(38,34,31,0.8)';
  for (let i = 0; i < 9; i++) {
    const angle = (i / 9) * Math.PI * 2 + Math.random() * 0.4;
    const length = size * (0.16 + Math.random() * 0.26);
    ctx.lineWidth = 1 + Math.random();
    ctx.beginPath();
    ctx.moveTo(half + Math.cos(angle) * size * 0.1, half + Math.sin(angle) * size * 0.1);
    ctx.lineTo(half + Math.cos(angle) * length, half + Math.sin(angle) * length);
    ctx.stroke();
  }

  // The hole itself.
  const core = ctx.createRadialGradient(half, half, 0, half, half, size * 0.19);
  core.addColorStop(0, 'rgba(6,5,4,1)');
  core.addColorStop(0.7, 'rgba(14,11,9,0.95)');
  core.addColorStop(1, 'rgba(30,25,21,0)');
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(half, half, size * 0.19, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const TINTS = {
  // Concrete and steel chip pale; flesh does not, so a round that passes
  // through someone marks the wall behind them differently. A heavy round
  // burns as well as breaks, and a blade leaves a bright scrape.
  hole: 0xb9b3a8,
  scorch: 0x2a2521,
  gouge: 0xcfc7b8,
  blood: 0x6d1410,
};

// Past this width a round is not making a hole any more, it is making a
// crater: a wider scorch goes down first and the hole sits in the middle of it.
const CRATER_CALIBRE = 0.12;

export function createDecalField() {
  // `document` only exists in the browser, and qa/unit.mjs builds the world
  // without one. A field with no pool is inert rather than a crash.
  if (typeof document === 'undefined') {
    return { add: () => null, update: () => {}, clear: () => {}, count: () => 0, total: () => 0 };
  }

  const geometry = new THREE.PlaneGeometry(1, 1);
  const texture = holeTexture();
  const pool = [];
  for (let i = 0; i < POOL; i++) {
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      // Marks sit a few millimetres proud of the surface they are on. The
      // offset alone loses to depth precision at range; the bias finishes it.
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4,
      toneMapped: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = `Bullet_Mark_${i}`;
    mesh.visible = false;
    mesh.frustumCulled = true;
    mesh.renderOrder = 3;
    pool.push({ mesh, material, scene: null, life: 0, strength: 0 });
  }

  let next = 0;
  // Monotonic: how many marks this run has laid down in total. `count()`
  // saturates once the pool wraps, which makes it useless for asking whether a
  // particular shot marked anything.
  let placed = 0;
  const _normal = new THREE.Vector3();
  const _look = new THREE.Vector3();

  /**
   * Mark a surface. `normal` is the world-space face normal from the raycast;
   * pass the hit's `face.normal` transformed into world space, or nothing at
   * all and the mark simply faces the shooter.
   */
  function add(scene, point, normal, { kind = 'hole', size = 0.11 } = {}) {
    if (!scene || !point) return null;
    // A heavy round scorches a patch of wall before it punches through it.
    if (kind === 'hole' && size >= CRATER_CALIBRE) {
      mark(scene, point, normal, 'scorch', size * 2.1, 0.30);
    }
    return mark(scene, point, normal, kind, size,
      kind === 'blood' ? 0.72 : (kind === 'gouge' ? 0.6 : 0.95));
  }

  function mark(scene, point, normal, kind, size, strength) {
    const slot = pool[next];
    next = (next + 1) % POOL;
    placed++;

    if (slot.scene && slot.scene !== scene) slot.scene.remove(slot.mesh);
    if (slot.mesh.parent !== scene) scene.add(slot.mesh);
    slot.scene = scene;

    _normal.copy(normal && normal.lengthSq() > 1e-6 ? normal : _normal.set(0, 1, 0));
    _normal.normalize();
    slot.mesh.position.copy(point).addScaledVector(_normal, 0.006);
    _look.copy(slot.mesh.position).add(_normal);
    slot.mesh.lookAt(_look);
    // Roll each mark, so a burst into one wall is not six identical stamps.
    slot.mesh.rotateZ(Math.random() * Math.PI * 2);

    const scale = size * (0.82 + Math.random() * 0.42);
    // A blade does not make a round hole; it drags one.
    slot.mesh.scale.set(kind === 'gouge' ? scale * 0.34 : scale, scale, 1);
    slot.material.color.setHex(TINTS[kind] ?? TINTS.hole);
    slot.strength = strength;
    slot.material.opacity = slot.strength;
    slot.mesh.visible = true;
    slot.life = LIFE;
    return slot.mesh;
  }

  function update(dt) {
    for (const slot of pool) {
      if (slot.life <= 0) continue;
      slot.life -= dt;
      if (slot.life <= 0) {
        slot.mesh.visible = false;
        slot.material.opacity = 0;
        continue;
      }
      slot.material.opacity = slot.strength * Math.min(1, slot.life / FADE);
    }
  }

  function clear() {
    for (const slot of pool) {
      slot.life = 0;
      slot.mesh.visible = false;
      slot.material.opacity = 0;
    }
  }

  const count = () => pool.filter((slot) => slot.life > 0).length;

  return { add, update, clear, count, total: () => placed, pool };
}

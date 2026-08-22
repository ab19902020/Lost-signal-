import * as THREE from 'three';

// Silo 47-A, directly beneath the shelter.
//
// The chamber, catwalk, stairs, missile and console are Blender GLBs. What is
// authored here is collision and light — the catwalk's own bounding box spans
// deck *and* railing, which would read as a solid wall, so the deck is a
// climbable box and the railing a separate solid one. The stairs get one
// climbable box per tread, each within the player's step height, which is what
// lets a capsule with gravity walk down them.

export const SILO = {
  radius: 5.6,
  height: 17,
  catwalkY: 7.2,
  wallSegments: 16,
  catwalkSegments: 8,
  stairSteps: 24,
  stairRun: 0.3,
};

const box = (minX, minY, minZ, maxX, maxY, maxZ) =>
  new THREE.Box3(new THREE.Vector3(minX, minY, minZ), new THREE.Vector3(maxX, maxY, maxZ));

// A box of the given half-extents, rotated about Y and pushed out to `distance`.
// Axis-aligned bounds of a rotated slab are conservative, which is exactly what
// a wall wants to be.
function ringBox(angle, distance, halfWidth, halfDepth, minY, maxY) {
  const cx = Math.cos(angle) * distance;
  const cz = Math.sin(angle) * distance;
  const ex = Math.abs(Math.cos(angle)) * halfDepth + Math.abs(Math.sin(angle)) * halfWidth;
  const ez = Math.abs(Math.sin(angle)) * halfDepth + Math.abs(Math.cos(angle)) * halfWidth;
  return box(cx - ex, minY, cz - ez, cx + ex, maxY, cz + ez);
}

export function buildSilo({ scene, colliders, place, addInteraction, assets }) {
  if (!assets.siloChamber) return null;

  const { radius, height, catwalkY, wallSegments, catwalkSegments, stairSteps, stairRun } = SILO;

  scene.background = new THREE.Color(0x07090a);
  scene.fog = new THREE.FogExp2(0x0d1112, 0.021);

  place(assets.siloChamber, scene, [0, 0, 0], [0, 0, 0], 1, { world: 'silo', collide: false });

  // Wall ring: one conservative box per panel, so the room is an enclosure
  // rather than a rectangle the player can walk into the corners of.
  for (let i = 0; i < wallSegments; i++) {
    const angle = (i * Math.PI * 2) / wallSegments;
    colliders.addBox(ringBox(angle, radius + 0.45, 1.2, 0.5, -0.5, height + 1), {});
  }

  // Catwalk ring at the service level, plus its railing.
  const catwalkRadius = radius - 0.95;
  for (let i = 0; i < catwalkSegments; i++) {
    const angle = (i * Math.PI * 2) / catwalkSegments;
    const x = Math.cos(angle) * catwalkRadius;
    const z = Math.sin(angle) * catwalkRadius;
    place(assets.siloCatwalk, scene, [x, catwalkY, z], [0, -angle + Math.PI / 2, 0], 1,
      { world: 'silo', collide: false });
    colliders.addBox(ringBox(angle, catwalkRadius, 1.62, 0.9, catwalkY - 0.3, catwalkY + 0.06),
      { climbable: true });
    colliders.addBox(ringBox(angle, catwalkRadius - 0.82, 1.62, 0.09, catwalkY + 0.06, catwalkY + 1.15), {});
  }

  // Stairs down to the silo floor, one collider per tread.
  const stairAngle = Math.PI * 0.5;
  const stairOrigin = new THREE.Vector3(
    Math.cos(stairAngle) * (catwalkRadius - 0.3), 0, Math.sin(stairAngle) * (catwalkRadius - 0.3));
  place(assets.siloStairs, scene, [stairOrigin.x, 0, stairOrigin.z], [0, -stairAngle - Math.PI / 2, 0], 1,
    { world: 'silo', collide: false });
  const rise = catwalkY / stairSteps;
  for (let i = 0; i < stairSteps; i++) {
    const along = (i + 0.5) * stairRun;
    const x = stairOrigin.x - Math.sin(stairAngle + Math.PI / 2) * along;
    const z = stairOrigin.z - Math.cos(stairAngle + Math.PI / 2) * along;
    const top = catwalkY - (i + 1) * rise;
    colliders.addBox(box(x - 0.8, top - 0.6, z - 0.28, x + 0.8, top, z + 0.28), { climbable: true });
  }

  // The missile, its mount and the umbilical tower.
  const missile = place(assets.siloMissile, scene, [0, 0, 0], [0, 0, 0], 1,
    { world: 'silo', collide: false });
  colliders.addBox(box(-1.7, 0, -1.7, 1.7, 13.9, 1.7), {});
  colliders.addBox(box(2.2, 0, -0.4, 3.0, 11.7, 0.4), {});
  addInteraction(missile, 'DECOMMISSIONED WARHEAD', 'silo',
    () => window.dispatchEvent(new CustomEvent('lostsignal:missile')));

  // Launch control, on the floor facing the missile.
  const console3d = place(assets.siloConsole, scene, [-3.4, 0, 2.6], [0, -0.9, 0], 1, { world: 'silo' });
  addInteraction(console3d, 'LAUNCH CONTROL', 'silo',
    () => window.dispatchEvent(new CustomEvent('lostsignal:launchconsole')));

  // The supply cache, tucked under the stairs where it is worth finding.
  const cache = place(assets.siloCache, scene, [3.6, 0, 2.9], [0, -2.2, 0], 1, { world: 'silo' });
  addInteraction(cache, 'SUPPLY CACHE', 'silo',
    () => window.dispatchEvent(new CustomEvent('lostsignal:cache')));

  // The way back up: the access shaft the player came down, at the far side of
  // the catwalk from the stairs.
  const shaftAngle = Math.PI * 1.5;
  const shaftX = Math.cos(shaftAngle) * (catwalkRadius + 0.72);
  const shaftZ = Math.sin(shaftAngle) * (catwalkRadius + 0.72);
  if (assets.accessControl) {
    const panel = place(assets.accessControl, scene,
      [shaftX, catwalkY + 0.95, shaftZ], [0, -shaftAngle + Math.PI / 2, 0], 0.7,
      { world: 'silo', collide: false });
    addInteraction(panel, 'ACCESS SHAFT — CLIMB TO SHELTER', 'silo',
      () => window.dispatchEvent(new CustomEvent('lostsignal:ascend')));
  }

  // --- Lighting ------------------------------------------------------------
  // A silo is lit from the gantry down: hard pools on the missile skin, deep
  // shadow in the trench, and one failing amber lamp at the service level.
  scene.add(new THREE.HemisphereLight(0x66757e, 0x141716, 0.85));
  scene.add(new THREE.AmbientLight(0x505a5f, 0.4));

  const lamps = [];
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI * 2) / 4 + Math.PI / 8;
    const lamp = new THREE.PointLight(0xd8e2e0, 210, 18, 2);
    lamp.position.set(Math.cos(angle) * (radius - 1.1), catwalkY + 2.4, Math.sin(angle) * (radius - 1.1));
    scene.add(lamp);
    lamps.push({ light: lamp, base: 210, phase: i * 1.9, failing: i === 1 });
  }

  // Work lights at the mount, so the floor of the shaft is somewhere you can
  // actually see the missile you walked all the way down to.
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3 + 0.6;
    const work = new THREE.PointLight(0xffd9a8, 38, 11, 2);
    work.position.set(Math.cos(angle) * 3.4, 2.1, Math.sin(angle) * 3.4);
    scene.add(work);
  }

  const floodTop = new THREE.SpotLight(0xbfd2e2, 2600, 30, 0.8, 0.55, 2);
  floodTop.position.set(0, height - 0.6, 0);
  floodTop.target.position.set(0, 0, 0);
  scene.add(floodTop, floodTop.target);

  const trench = new THREE.PointLight(0xff5a2a, 26, 9, 2);
  trench.position.set(0, 0.6, 0);
  scene.add(trench);

  const consoleGlow = new THREE.PointLight(0x9fe8bb, 16, 5, 2);
  consoleGlow.position.set(-3.4, 1.5, 2.4);
  scene.add(consoleGlow);

  // Dust falling through the flood beam sells the depth of the shaft.
  const motes = 260;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(motes * 3);
  const speeds = new Float32Array(motes);
  for (let i = 0; i < motes; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * (radius - 0.6);
    positions[i * 3] = Math.cos(angle) * distance;
    positions[i * 3 + 1] = Math.random() * height;
    positions[i * 3 + 2] = Math.sin(angle) * distance;
    speeds[i] = 0.12 + Math.random() * 0.4;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const dust = new THREE.Points(geometry, new THREE.PointsMaterial({
    color: 0xcfd8d4, size: 0.026, transparent: true, opacity: 0.3, depthWrite: false,
  }));
  scene.add(dust);

  const spawn = new THREE.Vector3(shaftX * 0.86, catwalkY + 0.08, shaftZ * 0.86);

  let elapsed = 0;
  function update(dt) {
    elapsed += dt;
    for (const lamp of lamps) {
      const hum = 1 + Math.sin(elapsed * 1.3 + lamp.phase) * 0.04;
      const stutter = lamp.failing && Math.sin(elapsed * 13.7) * Math.sin(elapsed * 2.7) > 0.7 ? 0.2 : 1;
      lamp.light.intensity = lamp.base * hum * stutter;
    }
    trench.intensity = 24 + Math.sin(elapsed * 2.3) * 5;

    const array = geometry.attributes.position.array;
    for (let i = 0; i < motes; i++) {
      array[i * 3 + 1] -= speeds[i] * dt;
      if (array[i * 3 + 1] < 0.1) array[i * 3 + 1] = SILO.height;
    }
    geometry.attributes.position.needsUpdate = true;
  }

  return { spawn, update, missile, console3d, cache };
}

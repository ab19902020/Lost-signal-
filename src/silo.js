import * as THREE from 'three';

// Silo 47 — a habitation silo, not a weapons one.
//
// Twelve residential levels and a secure unit on top, stacked around an open
// light well with a spiral stair running down it. Three hundred people live
// here. Nobody in the silo knows why the world above ended.
//
// The Blender kit is one level ring, one stair flight and one shell, joined
// into single meshes and instanced up the shaft — twelve galleries built from
// two hundred separate objects each would be thousands of draw calls. What is
// authored here is collision and light: a joined ring's bounding box would fill
// the whole level including the open well, so decks are per-bay boxes with a
// real hole in the middle, and the stair gets one box per tread.

export const SILO = {
  shellRadius: 17.4,
  wellRadius: 5.4,
  deckOuter: 16.4,
  levelHeight: 3.6,
  levels: 12,
  segments: 16,
  stairRadius: 4.1,
  stairSteps: 24,
  stairTurn: THREE.MathUtils.degToRad(200),
};

const box = (minX, minY, minZ, maxX, maxY, maxZ) =>
  new THREE.Box3(new THREE.Vector3(minX, minY, minZ), new THREE.Vector3(maxX, maxY, maxZ));

// Conservative axis-aligned bounds for a slab standing at `distance` from the
// axis, rotated to face the centre.
function ringBox(angle, distance, halfWidth, halfDepth, minY, maxY) {
  const cx = Math.cos(angle) * distance;
  const cz = Math.sin(angle) * distance;
  const ex = Math.abs(Math.cos(angle)) * halfDepth + Math.abs(Math.sin(angle)) * halfWidth;
  const ez = Math.abs(Math.sin(angle)) * halfDepth + Math.abs(Math.cos(angle)) * halfWidth;
  return box(cx - ex, minY, cz - ez, cx + ex, maxY, cz + ez);
}

export function buildSilo({ scene, colliders, place, addInteraction, assets }) {
  if (!assets.habShell || !assets.habLevel || !assets.habStair) return null;

  const {
    shellRadius, wellRadius, deckOuter, levelHeight, levels, segments,
    stairRadius, stairSteps, stairTurn,
  } = SILO;

  const shaftHeight = levels * levelHeight;
  const bay = (Math.PI * (deckOuter + wellRadius) / 2) / segments;
  const deckMid = (deckOuter + wellRadius) / 2;
  const deckHalf = (deckOuter - wellRadius) / 2;

  scene.background = new THREE.Color(0x080a0b);
  scene.fog = new THREE.FogExp2(0x0e1213, 0.0085);

  place(assets.habShell, scene, [0, 0, 0], [0, 0, 0], 1, { world: 'silo', collide: false });

  // Outer shell: an enclosure of flat panels rather than a rectangle.
  for (let i = 0; i < segments * 2; i++) {
    const angle = (i * Math.PI * 2) / (segments * 2);
    colliders.addBox(ringBox(angle, shellRadius + 0.6, bay + 0.4, 0.7, -1, shaftHeight + levelHeight * 2), {});
  }

  const levelY = (index) => index * levelHeight;
  const gallery = [];

  for (let level = 0; level < levels; level++) {
    const y = levelY(level);
    place(assets.habLevel, scene, [0, y, 0], [0, 0, 0], 1, { world: 'silo', collide: false });

    for (let i = 0; i < segments; i++) {
      const angle = (i * Math.PI * 2) / segments;
      // Deck: walkable, with the light well left open through the middle.
      colliders.addBox(ringBox(angle, deckMid, bay + 0.12, deckHalf, y - 0.3, y + 0.02),
        { climbable: true });
      // Apartment frontage, and the gallery railing over the well.
      colliders.addBox(ringBox(angle, deckOuter - 0.3, bay + 0.1, 0.34, y, y + levelHeight), {});
      colliders.addBox(ringBox(angle, wellRadius, bay + 0.12, 0.1, y + 0.02, y + 1.15), {});
    }
    gallery.push({ level, y });
  }

  // The spiral stair, one flight per level, each rotated on from the last.
  for (let level = 0; level < levels; level++) {
    const base = levelY(level);
    const spin = level * stairTurn;
    place(assets.habStair, scene, [0, base, 0], [0, -spin, 0], 1, { world: 'silo', collide: false });

    const rise = levelHeight / stairSteps;
    for (let i = 0; i < stairSteps; i++) {
      const angle = spin + (i * stairTurn) / stairSteps;
      const top = base + i * rise + 0.04;
      colliders.addBox(ringBox(angle, stairRadius, 0.9, 0.32, top - 0.5, top), { climbable: true });
    }
    // The stair's own central column is solid.
    colliders.addBox(box(-(stairRadius - 0.95), base, -(stairRadius - 0.95),
      stairRadius - 0.95, base + levelHeight, stairRadius - 0.95), {});
  }

  // --- Fittings -------------------------------------------------------------
  // Hydroponics and mess tables, spread so no two levels read the same.
  const dress = [];
  for (let level = 0; level < levels; level++) {
    const y = levelY(level);
    if (assets.habHydroponics && level % 3 === 1) {
      for (let i = 0; i < 3; i++) {
        const angle = (i * Math.PI * 2) / 3 + level * 0.4;
        const radius = deckOuter - 2.6;
        const rack = place(assets.habHydroponics, scene,
          [Math.cos(angle) * radius, y, Math.sin(angle) * radius], [0, -angle + Math.PI / 2, 0], 1,
          { world: 'silo' });
        if (i === 0) {
          addInteraction(rack, `HYDROPONICS — LEVEL ${levels - level}`, 'silo',
            () => window.dispatchEvent(new CustomEvent('lostsignal:hydroponics', { detail: { level: levels - level } })));
        }
        dress.push(rack);
      }
    }
    if (assets.habCommons && level % 3 === 2) {
      for (let i = 0; i < 2; i++) {
        const angle = (i * Math.PI) + level * 0.7;
        const radius = deckOuter - 3.4;
        dress.push(place(assets.habCommons, scene,
          [Math.cos(angle) * radius, y, Math.sin(angle) * radius], [0, -angle, 0], 1,
          { world: 'silo' }));
      }
    }
    if (assets.habDirectory && level % 2 === 0) {
      const angle = level * 0.9;
      const radius = wellRadius + 1.1;
      place(assets.habDirectory, scene,
        [Math.cos(angle) * radius, y, Math.sin(angle) * radius], [0, -angle + Math.PI / 2, 0], 1,
        { world: 'silo', collide: false });
    }
  }

  // --- The secure unit ------------------------------------------------------
  // Top landing, above the residential levels. The CCTV console watches it.
  const topY = levelY(levels);
  place(assets.habLevel, scene, [0, topY, 0], [0, 0, 0], 1, { world: 'silo', collide: false });
  for (let i = 0; i < segments; i++) {
    const angle = (i * Math.PI * 2) / segments;
    colliders.addBox(ringBox(angle, deckMid, bay + 0.12, deckHalf, topY - 0.3, topY + 0.02),
      { climbable: true });
    colliders.addBox(ringBox(angle, deckOuter - 0.3, bay + 0.1, 0.34, topY, topY + levelHeight), {});
    colliders.addBox(ringBox(angle, wellRadius, bay + 0.12, 0.1, topY + 0.02, topY + 1.15), {});
  }

  const secureAngle = Math.PI * 0.25;
  const secureRadius = deckOuter - 0.9;
  const securePosition = new THREE.Vector3(
    Math.cos(secureAngle) * secureRadius, topY, Math.sin(secureAngle) * secureRadius);
  let secureDoor = null;
  if (assets.habSecureDoor) {
    secureDoor = place(assets.habSecureDoor, scene,
      [securePosition.x, topY, securePosition.z], [0, -secureAngle + Math.PI / 2, 0], 1,
      { world: 'silo', collide: false });
    addInteraction(secureDoor, 'SECURE UNIT — ENTRANCE', 'silo',
      () => window.dispatchEvent(new CustomEvent('lostsignal:secureunit')));
  }

  // The way back up to the shelter, on the top landing.
  const shaftAngle = Math.PI * 1.25;
  const shaftPosition = new THREE.Vector3(
    Math.cos(shaftAngle) * (deckOuter - 1.0), topY, Math.sin(shaftAngle) * (deckOuter - 1.0));
  if (assets.accessControl) {
    const panel = place(assets.accessControl, scene,
      [shaftPosition.x, topY + 1.05, shaftPosition.z], [0, -shaftAngle + Math.PI / 2, 0], 0.75,
      { world: 'silo', collide: false });
    addInteraction(panel, 'ACCESS SHAFT — CLIMB TO SHELTER', 'silo',
      () => window.dispatchEvent(new CustomEvent('lostsignal:ascend')));
  }

  const cache = assets.siloCache ? place(assets.siloCache, scene,
    [Math.cos(2.1) * (deckOuter - 2.2), 0, Math.sin(2.1) * (deckOuter - 2.2)], [0, -2.1, 0], 1,
    { world: 'silo' }) : null;
  if (cache) {
    addInteraction(cache, 'SILO STORES', 'silo',
      () => window.dispatchEvent(new CustomEvent('lostsignal:cache')));
  }

  // --- Lighting -------------------------------------------------------------
  // A silo is lit level by level. Strip lights over the doors give each gallery
  // its own band of light, and the well between them stays dim, which is what
  // sells the drop.
  scene.add(new THREE.HemisphereLight(0x5a6a70, 0x141614, 0.55));
  scene.add(new THREE.AmbientLight(0x49535a, 0.3));

  const strips = [];
  for (let level = 0; level <= levels; level++) {
    const y = levelY(level) + levelHeight - 0.5;
    const count = 4;
    for (let i = 0; i < count; i++) {
      const angle = (i * Math.PI * 2) / count + level * 0.5;
      const light = new THREE.PointLight(0xffe9c8, 34, 13, 2);
      light.position.set(Math.cos(angle) * (deckOuter - 2.2), y, Math.sin(angle) * (deckOuter - 2.2));
      scene.add(light);
      strips.push({ light, base: 34, phase: level * 1.3 + i, failing: (level * count + i) % 11 === 3 });
    }
  }

  // A single hard light at the very top of the well, so looking up reads as a
  // long way from the surface and looking down reads as a long way to fall.
  const crown = new THREE.SpotLight(0xd6e6f2, 2400, shaftHeight + 12, 0.5, 0.7, 2);
  crown.position.set(0, topY + levelHeight - 0.4, 0);
  crown.target.position.set(0, 0, 0);
  scene.add(crown, crown.target);

  const secureGlow = new THREE.PointLight(0xff6a4a, 12, 6, 2);
  secureGlow.position.copy(securePosition).setY(topY + 1.6);
  scene.add(secureGlow);

  // Dust in the well.
  const motes = 420;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(motes * 3);
  const speeds = new Float32Array(motes);
  for (let i = 0; i < motes; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * (deckOuter - 0.5);
    positions[i * 3] = Math.cos(angle) * distance;
    positions[i * 3 + 1] = Math.random() * (shaftHeight + levelHeight);
    positions[i * 3 + 2] = Math.sin(angle) * distance;
    speeds[i] = 0.1 + Math.random() * 0.36;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const dust = new THREE.Points(geometry, new THREE.PointsMaterial({
    color: 0xd2dad6, size: 0.03, transparent: true, opacity: 0.26, depthWrite: false,
  }));
  scene.add(dust);

  // The player arrives on the top landing, at the head of the stair.
  const spawn = new THREE.Vector3(
    Math.cos(shaftAngle) * (deckOuter - 2.6), topY + 0.06, Math.sin(shaftAngle) * (deckOuter - 2.6));

  // Where residents can walk: the mid-radius of each gallery.
  const walkable = [];
  for (let level = 0; level < levels; level++) {
    walkable.push({ y: levelY(level) + 0.02, radius: deckMid });
  }

  let elapsed = 0;
  function update(dt) {
    elapsed += dt;
    for (const strip of strips) {
      const hum = 1 + Math.sin(elapsed * 1.4 + strip.phase) * 0.035;
      const stutter = strip.failing && Math.sin(elapsed * 12.3 + strip.phase) * Math.sin(elapsed * 2.9) > 0.72
        ? 0.15 : 1;
      strip.light.intensity = strip.base * hum * stutter;
    }
    secureGlow.intensity = 10 + Math.sin(elapsed * 1.7) * 3;

    const array = geometry.attributes.position.array;
    const ceiling = shaftHeight + levelHeight;
    for (let i = 0; i < motes; i++) {
      array[i * 3 + 1] -= speeds[i] * dt;
      if (array[i * 3 + 1] < 0.1) array[i * 3 + 1] = ceiling;
    }
    geometry.attributes.position.needsUpdate = true;
  }

  return { spawn, update, walkable, secureDoor, securePosition, topY, shaftHeight };
}

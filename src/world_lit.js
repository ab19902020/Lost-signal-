import * as THREE from 'three';
import { createGameWorld as createBaseWorld } from './world_blender.js';

// Runtime lighting and material grading only. Visible world geometry stays in
// the Blender GLBs; this layer owns every light parameter in the shelter so
// there is exactly one place that decides how the room reads.
//
// Art direction: a lived-in post-apocalyptic shelter. Grimy, cool concrete lit
// by a handful of failing fluorescents, with warm practical pools at the work
// stations. Gloomy, but never a black screen — the Blender detail has to read.
//
// Three.js lights are photometric: point/spot intensity is candela and falls
// off with distance squared, so a ceiling fixture 2 m above head height wants
// tens of candela, not hundreds.

const PALETTE = {
  darkSteel: 0x2f3532,
  steel: 0x474d48,
  brushed: 0x6a706a,
  green: 0x36483a,
  concrete: 0x4e5049,
  fabric: 0x424940,
  rubber: 0x191c1a,
  wood: 0x4c3729,
  warning: 0x7c4030,
  deck: 0x585b52,
};

function gradeMaterials(scene) {
  const colors = Object.fromEntries(
    Object.entries(PALETTE).map(([k, v]) => [k, new THREE.Color(v)]),
  );
  scene.traverse((object) => {
    if (!object.isMesh) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const m of materials) {
      if (!m?.color || m.userData.lsGraded) continue;
      m.userData.lsGraded = true;
      const name = (m.name || '').toLowerCase();

      if (name.includes('darksteel')) m.color.copy(colors.darkSteel);
      else if (name.includes('brushed')) m.color.copy(colors.brushed);
      else if (name.includes('steel')) m.color.copy(colors.steel);
      else if (name.includes('militarygreen') || name.includes('greenpaint')) m.color.copy(colors.green);
      else if (name.includes('plate')) m.color.copy(colors.deck);
      else if (name.includes('concrete')) m.color.copy(colors.concrete);
      else if (name.includes('fabric')) m.color.copy(colors.fabric);
      else if (name.includes('rubber')) m.color.copy(colors.rubber);
      else if (name.includes('wood')) m.color.copy(colors.wood);
      else if (name.includes('warningred')) m.color.copy(colors.warning);
      else {
        // Lift crushed blacks so ordinary surfaces still show their shape,
        // but leave emissive screens and signage alone.
        const emissive = m.emissive ? Math.max(m.emissive.r, m.emissive.g, m.emissive.b) : 0;
        const luma = m.color.r * 0.2126 + m.color.g * 0.7152 + m.color.b * 0.0722;
        if (emissive < 0.08 && luma < 0.06) m.color.lerp(colors.darkSteel, 0.55);
      }

      // The diamond-plate floor shipped as polished metal, which turned every
      // fixture into a star-shaped specular smear across the room. A worn steel
      // deck is rough and only faintly metallic.
      if (name.includes('plate')) {
        if ('roughness' in m) m.roughness = 0.94;
        if ('metalness' in m) m.metalness = 0.22;
      } else {
        if ('roughness' in m) m.roughness = THREE.MathUtils.clamp(m.roughness ?? 0.6, 0.42, 0.98);
        if ('metalness' in m && m.metalness > 0.8) m.metalness = 0.7;
      }
      if (m.normalScale) m.normalScale.multiplyScalar(0.65);
      // Emissive fittings carry the room when their point light is culled, so
      // a strip light forty metres away still reads as a strip light.
      // Fittings carry the room when their point light is culled, so a strip
      // light forty metres away still reads as one. Lit windows are held lower:
      // a wall of them at full strength blows out to white up close.
      if (m.emissive && Math.max(m.emissive.r, m.emissive.g, m.emissive.b) > 0.05) {
        const window = name.includes('window');
        m.emissiveIntensity = window ? 0.42 : Math.max(m.emissiveIntensity ?? 1, 1.5);
      }
      m.needsUpdate = true;
    }
  });
}

export function createGameWorld(assets) {
  const game = createBaseWorld(assets);
  const { bunker, outside } = game;

  bunker.background = new THREE.Color(0x0d1010);
  bunker.fog = new THREE.FogExp2(0x171b19, 0.019);
  gradeMaterials(bunker);
  gradeMaterials(outside);
  if (game.silo) gradeMaterials(game.silo);

  // --- Shelter ambience -----------------------------------------------------
  // A weak sky/ground term stands in for concrete bounce. Everything else in
  // the room is a real fixture the player can see.
  const bounce = new THREE.HemisphereLight(0x8b978f, 0x24261f, 0.72);
  bunker.add(bounce);
  const fill = new THREE.AmbientLight(0x5a635c, 0.3);
  bunker.add(fill);

  // --- Ceiling fluorescents -------------------------------------------------
  // game.bunkerLights are the point lights sitting inside the Blender fixtures.
  const tubes = game.bunkerLights.map((light, index) => {
    light.color.setHex(0xdfe6df);
    light.intensity = 48;
    light.distance = 13;
    light.decay = 2;
    light.castShadow = index % 2 === 0;
    if (light.castShadow) {
      light.shadow.mapSize.set(1024, 1024);
      light.shadow.bias = -0.0009;
      light.shadow.normalBias = 0.022;
      light.shadow.camera.near = 0.25;
      light.shadow.camera.far = 12;
    }
    // A downward cone under each fixture reads as a real fluorescent pool.
    const pool = new THREE.SpotLight(0xeef2e6, 28, 11, 0.95, 0.62, 2);
    pool.position.copy(light.position);
    pool.target.position.set(light.position.x * 0.6, 0, light.position.z * 0.6);
    bunker.add(pool, pool.target);
    return { light, pool, base: 48, poolBase: 28, phase: index * 1.7, failing: index === 2 };
  });

  // --- Practicals -----------------------------------------------------------
  const practical = (hex, intensity, distance, position) => {
    const light = new THREE.PointLight(hex, intensity, distance, 2);
    light.position.set(...position);
    bunker.add(light);
    return light;
  };
  practical(0xffd9a0, 22, 4.6, [2.45, 1.55, -2.95]);   // terminal glow
  practical(0xbfe2d6, 20, 4.4, [-3.15, 1.55, -2.95]);  // CCTV monitor wall
  practical(0xffc27a, 14, 3.8, [4.60, 1.35, 4.75]);    // generator panel
  practical(0xffce8a, 11, 3.4, [-5.95, 1.45, 0.60]);   // vault interior
  practical(0xa8d8bb, 10, 3.6, [-4.85, 1.30, 6.35]);   // breaker cabinet

  // The emergency lamp is a restrained warm warning light, not a red wash.
  const emergency = game.emergency;
  emergency.color.setHex(0xff6a3a);
  emergency.intensity = 14;
  emergency.distance = 7.5;
  emergency.decay = 2;

  // --- Exterior -------------------------------------------------------------
  // The compound stays moonlit and hostile, but its perimeter, rubble and
  // approach must remain readable. A lighter sky/fog value provides distant
  // silhouette separation while a modest ambient term lifts only the faces
  // the moon cannot reach.
  outside.background = new THREE.Color(0x1a2831);
  outside.fog = new THREE.FogExp2(0x22343d, 0.0125);
  outside.traverse((object) => {
    if (object.isHemisphereLight) {
      object.color.setHex(0x819caf);
      object.groundColor.setHex(0x29332f);
      object.intensity = 2.15;
    }
    if (object.isDirectionalLight) {
      object.color.setHex(0xc0d3df);
      object.intensity = 3.4;
      object.shadow.bias = -0.0012;
      object.shadow.normalBias = 0.03;
    }
    if (object.isSpotLight) {
      object.color.setHex(0xe6efe2);
      object.intensity = 230;
      object.distance = 40;
      object.decay = 2;
      object.penumbra = 0.5;
      object.angle = 0.72;
    }
  });
  outside.add(new THREE.AmbientLight(0x536875, 0.38));

  const baseUpdate = game.update.bind(game);
  let elapsed = 0;
  game.update = (dt, ...rest) => {
    baseUpdate(dt, ...rest);
    elapsed += dt;

    // Slow ballast hum on every tube, plus one fixture that is on its way out.
    for (const tube of tubes) {
      const hum = 1 + Math.sin(elapsed * (1.6 + tube.phase * 0.1) + tube.phase) * 0.03;
      let factor = hum;
      if (tube.failing) {
        const stutter = Math.sin(elapsed * 17.3) * Math.sin(elapsed * 2.1);
        factor = hum * (stutter > 0.72 ? 0.25 : 1);
      }
      tube.light.intensity = tube.base * factor;
      tube.pool.intensity = tube.poolBase * factor;
    }

    emergency.intensity = 12 + Math.sin(elapsed * 1.9) * 3;
  };

  return game;
}

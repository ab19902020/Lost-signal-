import * as THREE from 'three';
import { createGameWorld as createBaseWorld } from './world_blender.js';

// Runtime lighting/material grading only. Visible world geometry remains Blender GLB.
// Art direction: grounded post-apocalyptic survival shelter — readable, worn,
// industrial and dirty rather than gothic/near-black horror.
export function createGameWorld(assets) {
  const game = createBaseWorld(assets);
  const { bunker } = game;

  // A bunker should be gloomy, but it should still be a place someone lives in.
  // Lift the black floor and greatly reduce fog so the Blender work is visible.
  bunker.background = new THREE.Color(0x171b18);
  bunker.fog = new THREE.FogExp2(0x252a25, 0.0045);

  const palette = {
    darkSteel: new THREE.Color(0x2b302d),
    steel: new THREE.Color(0x505751),
    brushed: new THREE.Color(0x747a72),
    green: new THREE.Color(0x34483a),
    concrete: new THREE.Color(0x62645d),
    fabric: new THREE.Color(0x3d443d),
    rubber: new THREE.Color(0x171a18),
    wood: new THREE.Color(0x493426),
    warning: new THREE.Color(0x763c2d),
  };

  // Re-grade Blender materials away from crushed black / gothic metal.
  bunker.traverse((object) => {
    if (!object.isMesh) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.filter(Boolean).forEach((m) => {
      const n = (m.name || '').toLowerCase();
      if (!m.color) return;

      if (n.includes('darksteel')) m.color.copy(palette.darkSteel);
      else if (n.includes('brushed')) m.color.copy(palette.brushed);
      else if (n === 'steel' || n.includes('steel')) m.color.copy(palette.steel);
      else if (n.includes('militarygreen')) m.color.copy(palette.green);
      else if (n.includes('concrete')) m.color.copy(palette.concrete);
      else if (n.includes('fabric')) m.color.copy(palette.fabric);
      else if (n.includes('rubber')) m.color.copy(palette.rubber);
      else if (n.includes('darkwood')) m.color.copy(palette.wood);
      else if (n.includes('warningred')) m.color.copy(palette.warning);
      else {
        // Protect emissive screens, but prevent ordinary surfaces from being
        // literally black in normal shelter lighting.
        const emissivePower = m.emissive ? Math.max(m.emissive.r, m.emissive.g, m.emissive.b) : 0;
        const lum = m.color.r * 0.2126 + m.color.g * 0.7152 + m.color.b * 0.0722;
        if (emissivePower < 0.08 && lum < 0.075) m.color.lerp(palette.darkSteel, 0.58);
      }

      if ('roughness' in m) m.roughness = Math.max(m.roughness ?? 0.5, 0.48);
      if ('metalness' in m && m.metalness > 0.75) m.metalness = 0.68;
      m.needsUpdate = true;
    });
  });

  let oldEmergency = null;
  const originalCeilingPoints = [];

  // Rebalance the base-world lights to modern Three.js photometric values.
  bunker.traverse((object) => {
    if (object.isHemisphereLight) {
      object.color.setHex(0xd4d8cf);
      object.groundColor.setHex(0x4a4e46);
      object.intensity = 1.45;
    }
    if (object.isAmbientLight) {
      object.color.setHex(0x9aa096);
      object.intensity = 0.72;
    }
    if (object.isPointLight) {
      const c = object.color;
      const red = c.r > c.g * 1.8 && c.r > c.b * 1.8;
      if (red) {
        oldEmergency = object;
        object.color.setHex(0xd87545);
        object.intensity = 26;
        object.distance = 8;
        object.decay = 2;
      } else {
        object.color.setHex(0xe2e5dc);
        object.intensity = 105;
        object.distance = 10.5;
        object.decay = 2;
        originalCeilingPoints.push(object);
      }
    }
  });

  // Broad cool-grey bounce — like light reflecting from concrete and painted steel.
  const roomFill = new THREE.HemisphereLight(0xd9ddd4, 0x4b5048, 0.88);
  bunker.add(roomFill);

  const serviceBounce = new THREE.DirectionalLight(0xc7cbc1, 1.15);
  serviceBounce.position.set(-3.5, 6.0, 5.0);
  bunker.add(serviceBounce);

  const rearBounce = new THREE.DirectionalLight(0x9da99f, 0.55);
  rearBounce.position.set(5.0, 4.0, -5.5);
  bunker.add(rearBounce);

  // Practical fluorescent pools under the actual Blender ceiling fixtures.
  // Neutral white, not green horror light.
  const fixturePositions = [[-3.4,-3.6],[3.4,-3.6],[-3.4,2.35],[3.4,2.35]];
  const practicalSpots = [];
  fixturePositions.forEach(([x,z], index) => {
    const spot = new THREE.SpotLight(0xf2f0df, 330, 12.5, 0.95, 0.78, 2);
    spot.position.set(x, 3.56, z);
    spot.target.position.set(x * 0.72, 0.15, z * 0.72);
    spot.castShadow = index === 0 || index === 3;
    if (spot.castShadow) {
      spot.shadow.mapSize.set(768,768);
      spot.shadow.bias = -0.00022;
      spot.shadow.camera.near = 0.35;
      spot.shadow.camera.far = 13;
    }
    bunker.add(spot, spot.target);
    practicalSpots.push(spot);

    // Very broad weak bounce around each fixture.
    const bounce = new THREE.PointLight(0xd7d7ca, 38, 6.8, 2);
    bounce.position.set(x, 2.55, z);
    bunker.add(bounce);
  });

  // Work areas get believable task lighting instead of theatrical colour pools.
  const deskTask = new THREE.PointLight(0xe8e4cf, 54, 5.8, 2);
  deskTask.position.set(2.35, 2.1, -2.85);
  bunker.add(deskTask);

  const cctvTask = new THREE.PointLight(0xd8ded5, 46, 5.5, 2);
  cctvTask.position.set(-3.15, 2.05, -2.9);
  bunker.add(cctvTask);

  const generatorTask = new THREE.PointLight(0xe2c791, 32, 4.8, 2);
  generatorTask.position.set(4.7, 1.75, 4.8);
  bunker.add(generatorTask);

  const vaultTask = new THREE.PointLight(0xe4cf9b, 30, 4.6, 2);
  vaultTask.position.set(-5.55, 1.9, 0.65);
  bunker.add(vaultTask);

  // Soft daylight contamination from the blast-door end. This makes the shelter
  // feel connected to a ruined outside world instead of a gothic crypt.
  const doorLeak = new THREE.SpotLight(0xc5d1cb, 85, 11, 0.78, 0.82, 2);
  doorLeak.position.set(0, 2.85, -6.65);
  doorLeak.target.position.set(0, 0.8, -2.0);
  bunker.add(doorLeak, doorLeak.target);

  const baseUpdate = game.update.bind(game);
  let elapsed = 0;
  game.update = (dt, ...args) => {
    baseUpdate(dt, ...args);
    elapsed += dt;

    // Emergency light is now a restrained warm warning lamp.
    if (oldEmergency) oldEmergency.intensity = 24 + Math.sin(elapsed * 1.25) * 1.6;

    // Tiny fluorescent ballast variation; no horror flickering or blackouts.
    practicalSpots.forEach((spot, i) => {
      spot.intensity = 330 + Math.sin(elapsed * (0.7 + i * 0.05) + i) * 4;
    });

    originalCeilingPoints.forEach((light) => {
      if (light.intensity < 80) light.intensity = 105;
    });
  };

  return game;
}

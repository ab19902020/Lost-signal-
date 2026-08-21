import * as THREE from 'three';
import { createGameWorld as createBaseWorld } from './world_blender.js';

// Runtime lighting only. All visible bunker architecture/props remain Blender GLBs.
export function createGameWorld(assets) {
  const game = createBaseWorld(assets);
  const { bunker, camera } = game;

  // Lift the room out of crushed blacks without flattening the horror contrast.
  bunker.background = new THREE.Color(0x080c0a);
  bunker.fog = new THREE.FogExp2(0x0a0f0c, 0.0105);

  // Rebalance legacy low-intensity lights for the modern physically-correct
  // Three.js light model. Values such as 7.5 are effectively candle-level.
  let emergency = null;
  const legacyCeilingPoints = [];
  bunker.traverse((object) => {
    if (object.isHemisphereLight) object.intensity = Math.max(object.intensity, 1.05);
    if (object.isAmbientLight) object.intensity = Math.max(object.intensity, 0.62);
    if (object.isPointLight) {
      const c = object.color;
      const redEmergency = c.r > c.g * 1.8 && c.r > c.b * 1.8;
      if (redEmergency) {
        emergency = object;
        object.intensity = 95;
        object.distance = Math.max(object.distance || 0, 11);
        object.decay = 2;
      } else if (object.intensity < 40) {
        object.intensity = 85;
        object.distance = Math.max(object.distance || 0, 9.5);
        object.decay = 2;
        legacyCeilingPoints.push(object);
      }
    }
  });

  // Soft global bounce. This keeps concrete and Blender bevels readable while
  // preserving deep corners and shadow pockets.
  const bouncedKey = new THREE.DirectionalLight(0xa7c0b3, 1.55);
  bouncedKey.position.set(-3.5, 5.5, 4.0);
  bunker.add(bouncedKey);

  const bouncedRim = new THREE.DirectionalLight(0x6e8fa0, 0.72);
  bouncedRim.position.set(5.0, 3.0, -5.5);
  bunker.add(bouncedRim);

  // Actual pools beneath the four Blender ceiling fixtures.
  const fixturePositions = [[-3.4,-3.6],[3.4,-3.6],[-3.4,2.35],[3.4,2.35]];
  const fixtureSpots = [];
  fixturePositions.forEach(([x,z], index) => {
    const spot = new THREE.SpotLight(0xe4f7e9, 620, 12.5, 0.82, 0.72, 2);
    spot.position.set(x, 3.58, z);
    spot.target.position.set(x * 0.82, 0.10, z * 0.82);
    spot.castShadow = index === 0 || index === 3;
    if (spot.castShadow) {
      spot.shadow.mapSize.set(768, 768);
      spot.shadow.bias = -0.00028;
      spot.shadow.camera.near = 0.3;
      spot.shadow.camera.far = 13;
    }
    bunker.add(spot, spot.target);
    fixtureSpots.push(spot);

    // Small indirect fill around each lamp stops ceilings/walls becoming voids.
    const bounce = new THREE.PointLight(0xb7d3c1, 32, 5.5, 2);
    bounce.position.set(x, 2.75, z);
    bunker.add(bounce);
  });

  // Functional pools around important interaction zones.
  const deskFill = new THREE.PointLight(0xa9d7bb, 42, 5.5, 2);
  deskFill.position.set(2.3, 2.05, -2.9);
  bunker.add(deskFill);

  const cctvFill = new THREE.PointLight(0x7dbb98, 34, 5.2, 2);
  cctvFill.position.set(-3.15, 2.0, -2.8);
  bunker.add(cctvFill);

  const vaultFill = new THREE.PointLight(0xe0a365, 28, 4.2, 2);
  vaultFill.position.set(-5.45, 1.95, 0.7);
  bunker.add(vaultFill);

  // Very subtle eye-adaptation light attached to the player camera. It is not a
  // flashlight; it just prevents nearby PBR assets from collapsing to black.
  const eyeFill = new THREE.PointLight(0xbdd7ca, 24, 4.0, 2);
  eyeFill.position.set(0, -0.04, -0.18);
  camera.add(eyeFill);

  const baseUpdate = game.update.bind(game);
  let elapsed = 0;
  game.update = (dt, ...args) => {
    baseUpdate(dt, ...args);
    elapsed += dt;

    // The base world animates its original emergency light using legacy values;
    // overwrite that animation at the correct photometric scale.
    if (emergency) emergency.intensity = 88 + Math.sin(elapsed * 2.1) * 8;

    // Gentle fluorescent instability, not full blackouts.
    fixtureSpots.forEach((spot, i) => {
      const drift = Math.sin(elapsed * (1.7 + i * 0.11) + i * 1.9) * 9;
      spot.intensity = 620 + drift;
    });

    legacyCeilingPoints.forEach((light) => {
      if (light.intensity < 20) light.intensity = 72;
    });
  };

  return game;
}

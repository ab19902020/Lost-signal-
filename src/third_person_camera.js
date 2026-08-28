import * as THREE from 'three';

const _euler = new THREE.Euler(0, 0, 0, 'YXZ');

/**
 * Compose an over-shoulder camera in player-local space.
 *
 * The crosshair ray passes through the shoulder anchor, not through the player
 * pivot. This keeps the actor to the left of the reticle and gives the gun a
 * clear centre-screen target, matching the geometry used by GTA-style cameras.
 */
export function composeShoulderCamera({
  yaw,
  pitch,
  target,
  distance,
  shoulder,
}, {
  quaternion,
  forward,
  right,
  anchor,
  camera,
}) {
  _euler.set(pitch, yaw, 0);
  quaternion.setFromEuler(_euler);
  forward.set(0, 0, -1).applyQuaternion(quaternion);
  right.set(1, 0, 0).applyQuaternion(quaternion);
  anchor.copy(target).addScaledVector(right, shoulder);
  camera.copy(anchor).addScaledVector(forward, -distance);
  return { quaternion, forward, right, anchor, camera };
}

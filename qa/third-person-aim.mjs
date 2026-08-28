import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as THREE from 'three';
import { composeShoulderCamera } from '../src/third_person_camera.js';

const target = new THREE.Vector3(0, 1.55, 0);
const frame = {
  quaternion: new THREE.Quaternion(),
  forward: new THREE.Vector3(),
  right: new THREE.Vector3(),
  anchor: new THREE.Vector3(),
  camera: new THREE.Vector3(),
};

composeShoulderCamera({
  yaw: 0,
  pitch: 0,
  target,
  distance: 2.75,
  shoulder: 1.02,
}, frame);

const camera = new THREE.PerspectiveCamera(54, 2048 / 616, 0.15, 2600);
camera.position.copy(frame.camera);
camera.quaternion.copy(frame.quaternion);
camera.updateMatrixWorld(true);
camera.updateProjectionMatrix();

const playerOnScreen = target.clone().project(camera);
const crosshairAnchor = frame.anchor.clone().project(camera);
assert.ok(playerOnScreen.x < -0.18,
  `aim camera leaves the player under the crosshair (NDC x=${playerOnScreen.x.toFixed(3)})`);
assert.ok(Math.abs(crosshairAnchor.x) < 1e-6 && Math.abs(crosshairAnchor.y) < 1e-6,
  'the centre-screen ray does not pass through the shoulder aim anchor');

// Rear-wall collision may shorten the boom, but must not scale away the
// shoulder offset. This is the exact regression shown in the supplied phone
// screenshots.
composeShoulderCamera({
  yaw: 0,
  pitch: 0,
  target,
  distance: 0.72,
  shoulder: 1.02,
}, frame);
camera.position.copy(frame.camera);
camera.quaternion.copy(frame.quaternion);
camera.updateMatrixWorld(true);
const closePlayer = target.clone().project(camera);
assert.ok(closePlayer.x < -0.55,
  'a shortened camera boom collapsed the shoulder and covered the reticle');

const mainSource = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
assert.ok(mainSource.includes('crosshairTarget(world')
  && mainSource.includes('setShotRay(world')
  && mainSource.includes('muzzleWorldPosition?.(_shotOrigin)'),
  'third-person rounds do not converge from the visible muzzle to the crosshair');
assert.ok(mainSource.includes('cameraSegmentClear(thirdPersonTarget, thirdPersonAnchor')
  && mainSource.includes('cameraSegmentClear(thirdPersonAnchor, thirdPersonDesired'),
  'shoulder clearance and rear-boom clearance are not independent');
assert.match(html, /body\.aiming\.first-person #crosshair\{display:none\}/,
  'aiming still hides the crosshair in third person');

console.log('Third-person aim QA passed: shoulder framing stays clear and muzzle ballistics converge on the crosshair.');

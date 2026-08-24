import * as THREE from 'three';
import { cloneGLTF, findNamed } from './assets.js';

// The top of Silo 47 is a secure unit, and until now it was a locked door on an
// empty gallery. This is what is actually posted up there: a soldier on the
// door, a working dog walking the ring with him, and the infirmary the shelter
// has been quietly assuming exists every time the player takes a hit.

const clipNamed = (gltf, ...wanted) => {
  const clips = gltf?.animations || [];
  for (const name of wanted) {
    const clip = clips.find((candidate) => candidate.name.toLowerCase().endsWith(name));
    if (clip) return clip;
  }
  return clips[0] || null;
};

// The medical bench: what is on it, how far along, which way it faces, and how
// tall the real thing is. The survival pack is authored several times life size
// — a first aid kit came out taller than the person reaching for it — so every
// piece is fitted to a stated height rather than trusted.
const BENCH_KIT = [
  ['survivalFirstAid', -0.82, 0.9, 0.28],
  ['survivalFirstAid', -0.54, 2.6, 0.28],
  ['survivalWaterBottle', -0.28, 0.4, 0.26],
  ['survivalCan', -0.06, 1.7, 0.13],
  ['survivalPot', 0.14, 0.2, 0.18],
  ['survivalPan', 0.36, 2.2, 0.10],
  ['survivalMatchbox', 0.54, 1.1, 0.06],
  ['survivalBattery', 0.70, 0.5, 0.15],
  ['survivalTorch', 0.88, 2.9, 0.27],
];

const FLOOR_KIT = [
  ['survivalBackpack', -1.85, 1.4, 0.54],
  ['survivalGasCan', 1.62, 0.6, 0.36],
  ['survivalPropaneTank', 1.98, 2.4, 0.62],
];

export function buildGarrison({ scene, colliders, assets, place, addInteraction, silo }) {
  if (!silo) return null;
  const { topY, deckOuter } = silo;
  const mixers = [];

  // --- The sentry ----------------------------------------------------------
  // Posted beside the secure unit's door, facing whoever comes up the stair.
  let sentry = null;
  if (assets.soldier) {
    const angle = Math.PI * 0.25 + 0.16;
    const radius = deckOuter - 1.55;
    sentry = cloneGLTF(assets.soldier);
    sentry.name = 'Secure_Unit_Sentry';
    sentry.position.set(Math.cos(angle) * radius, topY + 0.02, Math.sin(angle) * radius);
    // Face in off the wall, across the gallery toward the stair landing.
    sentry.rotation.y = Math.atan2(-Math.cos(angle), -Math.sin(angle)) + Math.PI / 2;
    sentry.userData.kind = 'sentry';
    sentry.userData.alive = true;
    scene.add(sentry);
    const clip = clipNamed(assets.soldier, 'idle', 'mixamo.com');
    if (clip) {
      const mixer = new THREE.AnimationMixer(sentry);
      mixer.clipAction(clip).play();
      mixers.push(mixer);
    }
    colliders.addOrientedBox({
      cx: sentry.position.x, cz: sentry.position.z,
      halfX: .34, halfZ: .34, minY: topY, maxY: topY + 1.86,
    });
    addInteraction(sentry, 'SECURE UNIT SENTRY', 'silo', () => {
      window.dispatchEvent(new CustomEvent('lostsignal:sentry', {
        detail: { line: 'Nobody goes through that door without the unit commander. '
          + 'Walk the ring, talk to whoever will talk to you, and stay off the stair rail.' },
      }));
    });
  }

  // --- The dog -------------------------------------------------------------
  // A working animal on a beat, not a decoration: he walks an arc of the top
  // gallery, stops, looks around, and walks back.
  let dog = null;
  let dogMixer = null;
  let dogWalk = null;
  let dogIdle = null;
  const dogPath = { radius: deckOuter - 2.9, from: Math.PI * 0.55, to: Math.PI * 1.35 };
  let dogAt = dogPath.from;
  let dogDirection = 1;
  let dogRest = 0;
  if (assets.germanShepherd) {
    dog = cloneGLTF(assets.germanShepherd);
    dog.name = 'Patrol_Dog';
    dog.position.set(Math.cos(dogAt) * dogPath.radius, topY + 0.02,
      Math.sin(dogAt) * dogPath.radius);
    dog.userData.kind = 'dog';
    dog.userData.alive = true;
    scene.add(dog);
    dogMixer = new THREE.AnimationMixer(dog);
    const walkClip = clipNamed(assets.germanShepherd, 'walk');
    const idleClip = clipNamed(assets.germanShepherd, 'idle_2', 'idle');
    if (walkClip) dogWalk = dogMixer.clipAction(walkClip);
    if (idleClip) dogIdle = dogMixer.clipAction(idleClip);
    dogWalk?.play();
    mixers.push(dogMixer);
    addInteraction(dog, 'PATROL DOG', 'silo', () => {
      window.dispatchEvent(new CustomEvent('lostsignal:dog', {
        detail: { line: 'He works the top ring on his own. Nobody has told him the world ended.' },
      }));
    });
  }

  // --- The infirmary -------------------------------------------------------
  // A bench against the outer wall, a quarter of the ring round from the
  // secure door, stocked out of the survival pack.
  const medicalAngle = Math.PI * 0.75;
  const medicalRadius = deckOuter - 1.15;
  const medicalCentre = new THREE.Vector3(
    Math.cos(medicalAngle) * medicalRadius, topY, Math.sin(medicalAngle) * medicalRadius);
  const tangent = new THREE.Vector3(-Math.sin(medicalAngle), 0, Math.cos(medicalAngle));
  const inward = new THREE.Vector3(-Math.cos(medicalAngle), 0, -Math.sin(medicalAngle));
  const facing = -medicalAngle + Math.PI / 2;
  const kitRoots = [];

  const benchTop = topY + 0.92;
  let bench = null;
  if (assets.bench) {
    bench = place(assets.bench, scene,
      medicalCentre.toArray(), [0, facing, 0], 1, { world: 'silo' });
  }

  // Scale a placed item to its real height and stand it on the given surface.
  const _fitBox = new THREE.Box3();
  const _fitSize = new THREE.Vector3();
  const standOn = (root, surfaceY, height) => {
    root.updateWorldMatrix(true, true);
    _fitBox.setFromObject(root).getSize(_fitSize);
    if (_fitSize.y > 1e-4) root.scale.multiplyScalar(height / _fitSize.y);
    root.updateWorldMatrix(true, true);
    _fitBox.setFromObject(root);
    root.position.y += surfaceY - _fitBox.min.y;
    return root;
  };

  const stationed = (key, offset, spin, outward, surfaceY, height) => {
    if (!assets[key]) return;
    const point = medicalCentre.clone()
      .addScaledVector(tangent, offset)
      .addScaledVector(inward, outward);
    point.y = surfaceY;
    const root = place(assets[key], scene, point.toArray(), [0, facing + spin, 0], 1,
      { world: 'silo', collide: false });
    kitRoots.push(standOn(root, surfaceY, height));
  };

  for (const [key, offset, spin, height] of BENCH_KIT) {
    stationed(key, offset, spin, 0.16, benchTop, height);
  }
  for (const [key, offset, spin, height] of FLOOR_KIT) {
    stationed(key, offset, spin, 0.58, topY + 0.02, height);
  }

  // Supplies run out. Three courses of treatment, and then the bay is a room
  // with empty boxes in it — which is the only version of a medical bay that
  // means anything in a survival game.
  let doses = 3;
  const primary = kitRoots[0] || bench;
  if (primary) {
    addInteraction(primary, 'INFIRMARY — TREAT INJURIES', 'silo', () => {
      window.dispatchEvent(new CustomEvent('lostsignal:medical', {
        detail: { remaining: doses > 0 ? --doses : 0, empty: doses <= 0 },
      }));
    });
  }

  const lamp = new THREE.PointLight(0xdff0e6, 16, 9.5, 2.0);
  lamp.position.copy(medicalCentre).setY(topY + 2.5).addScaledVector(inward, 0.4);
  scene.add(lamp);

  const _dogTarget = new THREE.Vector3();

  function update(dt) {
    for (const mixer of mixers) mixer.update(dt);
    if (!dog) return;
    if (dogRest > 0) {
      dogRest -= dt;
      if (dogRest <= 0) {
        dogIdle?.fadeOut(.25);
        dogWalk?.reset().fadeIn(.25).play();
      }
      return;
    }
    // Angular speed that reads as a walk at this radius, not a slide.
    dogAt += dogDirection * (0.95 / dogPath.radius) * dt;
    if (dogAt >= dogPath.to || dogAt <= dogPath.from) {
      dogAt = THREE.MathUtils.clamp(dogAt, dogPath.from, dogPath.to);
      dogDirection *= -1;
      dogRest = 2.4 + Math.random() * 2.6;
      dogWalk?.fadeOut(.25);
      dogIdle?.reset().fadeIn(.25).play();
    }
    _dogTarget.set(Math.cos(dogAt) * dogPath.radius, topY + 0.02,
      Math.sin(dogAt) * dogPath.radius);
    dog.position.copy(_dogTarget);
    // Quaternius animals face local +Z, so the heading is the tangent.
    dog.rotation.y = Math.atan2(-Math.sin(dogAt) * dogDirection, Math.cos(dogAt) * dogDirection)
      + Math.PI;
  }

  return {
    sentry, dog, bench, kitRoots, lamp, update,
    dosesRemaining: () => doses,
    medicalCentre,
  };
}

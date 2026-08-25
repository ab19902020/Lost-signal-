import * as THREE from 'three';
import { cloneGLTF, findNamed } from './assets.js';
import { dressHuman, HUMAN_BUILD_PRESETS } from './humans.js';

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
    dressHuman(sentry, 2, {
      preset: HUMAN_BUILD_PRESETS[2],
      id: 'secure-unit-sentry-high',
      morph: 'Athletic',
      morphStrength: .72,
      top: 0x303f35,
      bottom: 0x252d28,
      shoes: 0x151817,
    });
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
  // A working animal on a beat, not a decoration. He walks an arc of the
  // gallery, stops, looks around, and walks back — and if you are decent to
  // him, he stops doing that and comes with you instead.
  const { levelHeight, levels, wellRadius, stairRadius } = silo;
  const RING_INNER = wellRadius + 1.5;
  const RING_OUTER = deckOuter - 1.1;
  const DOG_RADIUS = deckOuter - 2.9;
  const WALK_SPEED = 0.95;
  // A dog crossing a gallery to somebody who called him does not amble. He
  // used to drop to a walk six metres out, which put thirty metres of gallery
  // beyond him inside any reasonable wait.
  const TROT_SPEED = 3.15;
  const STAIR_SPEED = 2.1;

  let dog = null;
  let dogMixer = null;
  const dogClips = {};
  let dogAction = null;
  // Which way the model's nose points when its own rotation is zero. Measured
  // rather than assumed: the patrol used to add a hard-coded half turn and the
  // dog walked the entire ring backwards for it.
  let dogFacing = 0;
  const dogPath = { from: Math.PI * 0.55, to: Math.PI * 1.35 };
  const dog_ = {
    level: levels,
    angle: dogPath.from,
    direction: 1,
    rest: 0,
    // 0 is a working dog who does not know you; 1 is your dog.
    trust: 0,
    state: 'patrol',      // patrol | coming | following | sitting | stairs
    stair: null,
    say: 0,
  };

  const clipFor = (...names) => {
    for (const name of names) {
      const clip = clipNamed(assets.germanShepherd, name);
      if (clip && clip.name.toLowerCase().endsWith(name)) return clip;
    }
    return null;
  };

  // The clips were authored at one pace. Scaling them by how much ground he is
  // actually covering is the difference between a dog running and a dog
  // skating along the deck in a running pose.
  const CLIP_PACE = { walk: 1.0, run: 3.4 };

  function playDog(name, fade = 0.25, speed = 0) {
    const next = dogClips[name];
    if (next && speed && CLIP_PACE[name]) {
      next.timeScale = THREE.MathUtils.clamp(speed / CLIP_PACE[name], 0.55, 1.9);
    }
    if (!next || next === dogAction) return;
    next.reset().fadeIn(fade).play();
    dogAction?.fadeOut(fade);
    dogAction = next;
  }

  // The offset that turns "where this model's nose points" into a heading.
  function measureFacing(root, front = 'Head', back = 'Tail1') {
    const nose = root.getObjectByName(front);
    const rear = root.getObjectByName(back);
    if (!nose || !rear) return 0;
    root.updateWorldMatrix(true, true);
    const forward = nose.getWorldPosition(new THREE.Vector3())
      .sub(rear.getWorldPosition(new THREE.Vector3()));
    forward.y = 0;
    if (forward.lengthSq() < 1e-6) return 0;
    return Math.atan2(forward.x, forward.z) - root.rotation.y;
  }

  if (assets.germanShepherd) {
    dog = cloneGLTF(assets.germanShepherd);
    dog.name = 'Patrol_Dog';
    dog.position.set(Math.cos(dog_.angle) * DOG_RADIUS, topY + 0.02,
      Math.sin(dog_.angle) * DOG_RADIUS);
    dog.userData.kind = 'dog';
    dog.userData.alive = true;
    scene.add(dog);
    dogMixer = new THREE.AnimationMixer(dog);
    for (const [key, ...names] of [
      ['walk', 'walk'], ['run', 'run'], ['idle', 'idle_2', 'idle'],
      ['sit', 'idle_2_headlow', 'eating'],
    ]) {
      const clip = clipFor(...names);
      if (clip) dogClips[key] = dogMixer.clipAction(clip);
    }
    playDog('walk', 0);
    mixers.push(dogMixer);
    dogFacing = measureFacing(dog);
    addInteraction(dog, 'CALL THE DOG', 'silo', () => useDog());
  }

  // What the prompt says depends on what he thinks of you and how close he is.
  function dogPromptName() {
    if (!dog) return 'PATROL DOG';
    if (dog_.near) return dog_.trust >= 1 ? 'GOOD DOG' : 'STROKE THE DOG';
    return dog_.trust >= 1 ? 'CALL HIM ON' : 'CALL THE DOG';
  }

  const DOG_LINES = {
    call: 'He looks up, decides you are worth crossing the gallery for, and comes.',
    stroke: [
      'He submits to it for exactly as long as it suits him, then leans in.',
      'The tail goes. Somebody used to do this every day and then stopped.',
      'He puts his head against your leg and stays there.',
    ],
    bonded: 'He falls in at your heel. Wherever you are going, he is going.',
    good: 'He already knows. He does not mind hearing it again.',
  };

  function useDog() {
    if (!dog) return;
    if (dog_.near) {
      // Stroking him is what actually earns it.
      const before = dog_.trust;
      dog_.trust = Math.min(1, dog_.trust + 0.34);
      dog_.state = 'sitting';
      dog_.say = 2.6;
      const line = before >= 1 ? DOG_LINES.good
        : dog_.trust >= 1 ? DOG_LINES.bonded
          : DOG_LINES.stroke[Math.min(DOG_LINES.stroke.length - 1, Math.round(before * 3))];
      window.dispatchEvent(new CustomEvent('lostsignal:dog', {
        detail: { line, trust: dog_.trust, bonded: dog_.trust >= 1 },
      }));
      return;
    }
    dog_.trust = Math.min(1, dog_.trust + 0.06);
    dog_.state = 'coming';
    window.dispatchEvent(new CustomEvent('lostsignal:dog', {
      detail: { line: DOG_LINES.call, trust: dog_.trust, bonded: dog_.trust >= 1 },
    }));
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
  const _dogHeading = new THREE.Vector3();

  // Shortest way round a circle, which is the difference between a dog walking
  // three metres to you and a dog walking the long way round the well.
  const wrapAngle = (a) => {
    let v = a % (Math.PI * 2);
    if (v > Math.PI) v -= Math.PI * 2;
    if (v < -Math.PI) v += Math.PI * 2;
    return v;
  };

  // Point him along a world direction, allowing for however the model was
  // authored, and turn at a dog's rate rather than snapping.
  function faceAlong(x, z, dt, rate = 9) {
    if (Math.abs(x) < 1e-5 && Math.abs(z) < 1e-5) return;
    const want = Math.atan2(x, z) - dogFacing;
    dog.rotation.y += wrapAngle(want - dog.rotation.y) * Math.min(1, rate * dt);
  }

  function dogLevelY(level) {
    return level * levelHeight + 0.02;
  }

  function updateDog(dt, playerPosition) {
    if (!dog) return;
    if (dog_.say > 0) dog_.say -= dt;

    const player = playerPosition;
    const playerLevel = player
      ? THREE.MathUtils.clamp(Math.round(player.y / levelHeight), 0, levels) : dog_.level;
    const playerAngle = player ? Math.atan2(player.z, player.x) : 0;
    const playerRing = player ? Math.hypot(player.x, player.z) : 0;
    dog_.near = false;
    if (player) {
      dog_.near = dog.position.distanceTo(player) < 2.6
        && Math.abs(dog.position.y - player.y) < 2.2;
    }
    dog.userData.interaction.name = dogPromptName();

    // Bonded, and you have gone somewhere he is not: take the stair.
    const wantsToFollow = dog_.state === 'following' || dog_.state === 'coming';
    if (wantsToFollow && dog_.state !== 'stairs' && playerLevel !== dog_.level && player) {
      dog_.stair = { from: dog_.level, to: playerLevel, t: 0 };
      dog_.state = 'stairs';
    }

    if (dog_.state === 'stairs' && dog_.stair) {
      // Down the helix rather than through the floor. He appears on the stair
      // because that is the only way between two levels of this silo.
      const { from, to } = dog_.stair;
      dog_.stair.t = Math.min(1, dog_.stair.t + dt * STAIR_SPEED / Math.max(1, Math.abs(to - from) * 4));
      const t = dog_.stair.t;
      const level = from + (to - from) * t;
      const angle = from * Math.PI * 2 + (to - from) * Math.PI * 2 * t;
      dog.position.set(Math.cos(angle) * stairRadius, dogLevelY(level),
        Math.sin(angle) * stairRadius);
      faceAlong(-Math.sin(angle) * Math.sign(to - from), Math.cos(angle) * Math.sign(to - from), dt, 6);
      playDog('run');
      if (t >= 1) {
        dog_.level = to;
        dog_.angle = angle;
        dog_.state = dog_.trust >= 1 ? 'following' : 'patrol';
        dog_.stair = null;
      }
      return;
    }

    // Coming when called, or heeling once he is yours.
    if ((dog_.state === 'coming' || dog_.state === 'following') && player
      && playerLevel === dog_.level) {
      const gap = dog.position.distanceTo(player);
      if (gap < (dog_.state === 'following' ? 2.0 : 1.5)) {
        // Close enough. Sit down and look at you.
        playDog(dog_.state === 'following' ? 'idle' : 'sit');
        faceAlong(player.x - dog.position.x, player.z - dog.position.z, dt, 5);
        if (dog_.state === 'coming' && dog_.trust >= 1) dog_.state = 'following';
        return;
      }
      // He runs the ring, not through the well and not through the wall.
      const ring = THREE.MathUtils.clamp(playerRing, RING_INNER, RING_OUTER);
      const step = wrapAngle(playerAngle - dog_.angle);
      const speed = gap > 3 ? TROT_SPEED : WALK_SPEED;
      const advance = Math.sign(step) * Math.min(Math.abs(step), (speed / ring) * dt);
      dog_.angle += advance;
      const radius = THREE.MathUtils.damp(
        Math.hypot(dog.position.x, dog.position.z), ring, 2.4, dt);
      dog.position.set(Math.cos(dog_.angle) * radius, dogLevelY(dog_.level),
        Math.sin(dog_.angle) * radius);
      faceAlong(player.x - dog.position.x, player.z - dog.position.z, dt, 7);
      playDog(speed > WALK_SPEED ? 'run' : 'walk', 0.25, speed);
      return;
    }

    if (dog_.state === 'sitting') {
      playDog('sit');
      if (player) faceAlong(player.x - dog.position.x, player.z - dog.position.z, dt, 5);
      if (dog_.say <= 0) dog_.state = dog_.trust >= 1 ? 'following' : 'patrol';
      return;
    }

    // The beat. Unchanged in shape, but he walks it nose-first now.
    if (dog_.rest > 0) {
      dog_.rest -= dt;
      playDog('idle');
      if (dog_.rest <= 0) playDog('walk');
      return;
    }
    dog_.angle += dog_.direction * (WALK_SPEED / DOG_RADIUS) * dt;
    if (dog_.angle >= dogPath.to || dog_.angle <= dogPath.from) {
      dog_.angle = THREE.MathUtils.clamp(dog_.angle, dogPath.from, dogPath.to);
      dog_.direction *= -1;
      dog_.rest = 2.4 + Math.random() * 2.6;
      playDog('idle');
      return;
    }
    playDog('walk', 0.25, WALK_SPEED);
    _dogTarget.set(Math.cos(dog_.angle) * DOG_RADIUS, dogLevelY(dog_.level),
      Math.sin(dog_.angle) * DOG_RADIUS);
    dog.position.copy(_dogTarget);
    _dogHeading.set(-Math.sin(dog_.angle) * dog_.direction, 0,
      Math.cos(dog_.angle) * dog_.direction);
    faceAlong(_dogHeading.x, _dogHeading.z, dt, 8);
  }

  function update(dt, playerPosition) {
    for (const mixer of mixers) mixer.update(dt);
    updateDog(dt, playerPosition);
  }

  return {
    sentry, dog, bench, kitRoots, lamp, update,
    dosesRemaining: () => doses,
    medicalCentre,
    dogState: () => ({ ...dog_, facing: dogFacing,
      clips: Object.keys(dogClips) }),
    callDog: () => useDog(),
  };
}

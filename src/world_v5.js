import * as THREE from 'three';
import { createGameWorld as createLegacyWorld } from './world_blender.js';
import { cloneGLTF, findNamed } from './assets.js';

// Shelter 47 V5.2
// One integrated Blender bunker, plus runtime gameplay/lighting/weather systems.
export function createGameWorld(assets) {
  const game = createLegacyWorld(assets);
  const { bunker, outside, player, camera, interactions } = game;

  const baseUpdate = game.update.bind(game);
  const baseBlocked = game.blocked.bind(game);
  const baseSetArmed = game.setArmed.bind(game);
  const baseSetWorld = game.setWorld.bind(game);

  // Keep exterior interactions from the proven outside scene. The old component
  // bunker is removed completely and replaced by the single Blender room.
  const exteriorInteractions = interactions.filter(
    (o) => o.userData.interaction?.world === 'outside'
  );
  interactions.length = 0;
  interactions.push(...exteriorInteractions);

  bunker.clear();
  bunker.add(player);
  bunker.background = new THREE.Color(0x171b18);
  bunker.fog = new THREE.FogExp2(0x1d211d, 0.0032);

  const room = cloneGLTF(assets.roomV5);
  room.name = 'Shelter47_V5_IntegratedRoom';
  bunker.add(room);
  room.updateMatrixWorld(true);

  // Ensure the circular pressure door remains at the game's -Z end.
  const blastDoor = findNamed(room, 'BlastDoor_Door');
  if (blastDoor) {
    const doorWorld = blastDoor.getWorldPosition(new THREE.Vector3());
    if (doorWorld.z > 0) {
      room.rotation.y = Math.PI;
      room.updateMatrixWorld(true);
    }
  }

  // Keep Blender materials, but prevent Blender's render-light setup from being
  // doubled by the mobile Three.js lighting rig. This was the source of the
  // blown-out white V5 screenshot.
  room.traverse((o) => {
    if (o.isLight) {
      o.visible = false;
      return;
    }
    if (!o.isMesh) return;
    o.castShadow = true;
    o.receiveShadow = true;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) {
      if (!m) continue;
      if (m.color) {
        const emissivePower = m.emissive
          ? Math.max(m.emissive.r, m.emissive.g, m.emissive.b)
          : 0;
        const lum = m.color.r * .2126 + m.color.g * .7152 + m.color.b * .0722;
        if (emissivePower < .04 && lum < .018) {
          m.color.lerp(new THREE.Color(0x272b27), .28);
        }
      }
      // Clamp exported Blender fixture/screen emission. Screens remain visible,
      // but no material is allowed to flood the whole shelter with white light.
      if ('emissiveIntensity' in m && m.emissiveIntensity > 1.65) {
        m.emissiveIntensity = 1.65;
      }
      if ('roughness' in m) m.roughness = Math.max(m.roughness ?? .55, .42);
      m.needsUpdate = true;
    }
  });

  // -------------------------------------------------------------------------
  // BUNKER LIGHTING — balanced practical illumination.
  // -------------------------------------------------------------------------
  bunker.add(new THREE.HemisphereLight(0xc9cec6, 0x343832, .68));
  bunker.add(new THREE.AmbientLight(0xa1a69d, .16));

  const practicalSpots = [];
  const zRows = [-5.05, -1.70, 1.70, 5.05];
  for (const z of zRows) {
    for (const x of [-2.25, 2.25]) {
      const spot = new THREE.SpotLight(0xe9e7db, 92, 10.8, 1.0, .90, 2);
      spot.position.set(x, 3.47, z);
      spot.target.position.set(x * .72, .05, z * .72);
      spot.castShadow = (x < 0 && z < -4) || (x > 0 && z > 4);
      if (spot.castShadow) {
        spot.shadow.mapSize.set(640, 640);
        spot.shadow.bias = -0.0002;
        spot.shadow.camera.near = .3;
        spot.shadow.camera.far = 11;
      }
      bunker.add(spot, spot.target);
      practicalSpots.push(spot);
    }
  }

  const centreBounce = new THREE.PointLight(0xc8ccc4, 9, 9.5, 2);
  centreBounce.position.set(0, 2.1, .2);
  bunker.add(centreBounce);

  const cctvTask = new THREE.PointLight(0xbccdc4, 8, 4.5, 2);
  cctvTask.position.set(-4.35, 1.8, -1.7);
  bunker.add(cctvTask);

  const commsTask = new THREE.PointLight(0xd0c7a8, 7, 4.2, 2);
  commsTask.position.set(4.15, 1.75, 4.25);
  bunker.add(commsTask);

  const doorTask = new THREE.PointLight(0xb46a47, 6, 3.8, 2);
  doorTask.position.set(1.3, 1.6, -6.15);
  bunker.add(doorTask);

  const dustCount = 170;
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = (Math.random() - .5) * 11.6;
    dustPos[i * 3 + 1] = .25 + Math.random() * 3.35;
    dustPos[i * 3 + 2] = (Math.random() - .5) * 13.2;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      color: 0xd4d6ce,
      size: .012,
      transparent: true,
      opacity: .08,
      depthWrite: false,
    })
  );
  bunker.add(dust);

  // -------------------------------------------------------------------------
  // Bind gameplay directly to visible Blender objects.
  // -------------------------------------------------------------------------
  function register(object, name, onUse) {
    if (!object) {
      console.warn(`[Shelter47 V5] interaction target missing: ${name}`);
      return null;
    }
    object.userData.interaction = { name, world: 'bunker', onUse };
    interactions.push(object);
    return object;
  }

  const cctvConsole = findNamed(room, 'CCTV_Console');
  register(cctvConsole, 'CCTV SURVEILLANCE', () =>
    window.dispatchEvent(new CustomEvent('lostsignal:cctv'))
  );

  const computerScreen = findNamed(room, 'Computer_Screen');
  register(computerScreen, 'COMPUTER TERMINAL', () =>
    window.dispatchEvent(new CustomEvent('lostsignal:computer'))
  );

  const radioBody = findNamed(room, 'Radio_Body');
  register(radioBody, 'SHORTWAVE RADIO', () =>
    window.dispatchEvent(new CustomEvent('lostsignal:radio'))
  );

  const generatorBody = findNamed(room, 'Generator_Body');
  register(generatorBody, 'DIESEL GENERATOR', () =>
    window.dispatchEvent(new CustomEvent('lostsignal:generator'))
  );

  const vaultDoor = findNamed(room, 'GunVault_Door');
  const rifleDisplay = findNamed(room, 'Rifle_Display');
  let vaultOpen = false;
  let armedFromV5 = false;
  const vaultInteraction = register(vaultDoor, 'GUN VAULT', () => {
    if (!vaultOpen) {
      vaultOpen = true;
      if (vaultInteraction) vaultInteraction.userData.interaction.name = 'TAKE SURVIVAL RIFLE';
      window.dispatchEvent(new CustomEvent('lostsignal:vaultopen'));
    } else if (!armedFromV5) {
      armedFromV5 = true;
      if (vaultInteraction) vaultInteraction.userData.interaction.name = 'ARMORY — EMPTY';
      window.dispatchEvent(new CustomEvent('lostsignal:takegun'));
    }
  });

  const blastWheel = findNamed(room, 'BlastDoor_Wheel') || blastDoor;
  let doorOpen = false;
  const doorInteraction = register(blastWheel, 'BLAST DOOR', () => {
    if (!doorOpen) {
      doorOpen = true;
      if (doorInteraction) doorInteraction.userData.interaction.name = 'EXIT TO SURFACE';
      window.dispatchEvent(new CustomEvent('lostsignal:door', { detail: { open: true } }));
    } else {
      window.dispatchEvent(new CustomEvent('lostsignal:surface', { detail: { allowed: true } }));
    }
  });

  const doorClosedX = blastDoor?.position.x ?? 0;
  const vaultClosedRotation = vaultDoor?.rotation.y ?? 0;

  // Authored-room collision: wall equipment is solid, central aisle remains clear.
  game.blocked = (world, x, z) => {
    if (world !== 'bunker') return baseBlocked(world, x, z);
    if (x < -6.02 || x > 6.02 || z < -6.86 || z > 6.86) return true;
    if (x < -4.72 && z > -6.20 && z < 6.20) return true;
    if (x > 4.72 && z > -6.20 && z < 6.20) return true;
    return false;
  };

  // -------------------------------------------------------------------------
  // SMART CONTEXT INTERACTION
  // Direct aim gets priority, but the player no longer needs pixel-perfect
  // positioning. Nearby objects inside a forgiving forward cone are selectable.
  // -------------------------------------------------------------------------
  const interactionRay = new THREE.Raycaster();
  const camPos = new THREE.Vector3();
  const camDir = new THREE.Vector3();
  const targetPos = new THREE.Vector3();
  const toTarget = new THREE.Vector3();
  const box = new THREE.Box3();

  game.nearestInteraction = (world) => {
    const candidates = interactions.filter(
      (o) => o.visible !== false && o.userData.interaction?.world === world
    );
    if (!candidates.length) return null;

    // Exact centre-screen ray gets first choice and has a longer reach.
    interactionRay.far = 4.4;
    interactionRay.setFromCamera({ x: 0, y: 0 }, camera);
    const hits = interactionRay.intersectObjects(candidates, true);
    if (hits.length) {
      let o = hits[0].object;
      while (o && !o.userData.interaction) o = o.parent;
      if (o?.userData.interaction) return o.userData.interaction;
    }

    camera.getWorldPosition(camPos);
    camera.getWorldDirection(camDir);
    let best = null;
    let bestScore = Infinity;

    for (const o of candidates) {
      box.setFromObject(o);
      if (!box.isEmpty()) box.getCenter(targetPos);
      else o.getWorldPosition(targetPos);

      toTarget.copy(targetPos).sub(camPos);
      const dist = toTarget.length();
      if (dist > 3.75) continue;
      const vertical = Math.abs(targetPos.y - camPos.y);
      if (vertical > 2.25) continue;

      toTarget.normalize();
      const facing = camDir.dot(toTarget);
      // Very close objects work even from the side; farther objects need only
      // be generally in front of the player, not exactly under the crosshair.
      const minFacing = dist < 1.35 ? -0.20 : dist < 2.25 ? 0.05 : 0.28;
      if (facing < minFacing) continue;

      const score = dist + (1 - facing) * 1.85 + vertical * .18;
      if (score < bestScore) {
        bestScore = score;
        best = o.userData.interaction;
      }
    }
    return best;
  };

  game.setArmed = (value) => {
    baseSetArmed(value);
    if (rifleDisplay) rifleDisplay.visible = !value;
  };

  game.setWorld = (world) => {
    baseSetWorld(world);
    if (world === 'bunker') player.position.set(0, 0, -5.72);
  };

  game.doorOpen = () => doorOpen;
  game.roomV5 = room;

  // -------------------------------------------------------------------------
  // PLAYER FLASHLIGHT — useful both in equipment shadows and outdoors at night.
  // -------------------------------------------------------------------------
  const flashlight = new THREE.SpotLight(0xe9eee7, 70, 22, .34, .50, 1.7);
  flashlight.position.set(.08, -.08, .05);
  flashlight.visible = false;
  const flashlightTarget = new THREE.Object3D();
  flashlightTarget.position.set(0, -.08, -6);
  camera.add(flashlight, flashlightTarget);
  flashlight.target = flashlightTarget;
  game.setFlashlight = (value) => { flashlight.visible = !!value; };

  // -------------------------------------------------------------------------
  // EXTERIOR ENVIRONMENT — actual day/night + weather + readable yard.
  // -------------------------------------------------------------------------
  // Disable the very weak legacy exterior lights. We retain all Blender meshes.
  outside.traverse((o) => {
    if (o.isLight) o.visible = false;
  });

  const skyHemi = new THREE.HemisphereLight(0xb9c8cf, 0x262b27, 1.0);
  const skyAmbient = new THREE.AmbientLight(0x7d8987, .22);
  const sun = new THREE.DirectionalLight(0xffefd0, 1.6);
  const moon = new THREE.DirectionalLight(0x9db5c7, .32);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -36;
  sun.shadow.camera.right = 36;
  sun.shadow.camera.top = 36;
  sun.shadow.camera.bottom = -36;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 80;
  moon.castShadow = false;
  outside.add(skyHemi, skyAmbient, sun, moon);

  // Yard floodlights become dominant only at dusk/night. Their fixtures already
  // exist as Blender meshes in the legacy outside scene.
  const yardFloodlights = [];
  const floodPositions = [
    [-14, 4.35, -20], [14, 4.35, -20],
    [-14, 4.35, 11], [14, 4.35, 11],
  ];
  for (const [x, y, z] of floodPositions) {
    const light = new THREE.SpotLight(0xd9e7ec, 0, 38, .58, .52, 1.7);
    light.position.set(x, y, z);
    light.target.position.set(x * .28, 0, z * .28);
    light.castShadow = false;
    outside.add(light, light.target);
    yardFloodlights.push(light);
  }

  const gateLamp = new THREE.PointLight(0xffb35f, 0, 16, 2);
  gateLamp.position.set(0, 3.4, 15.5);
  outside.add(gateLamp);

  const lightning = new THREE.HemisphereLight(0xe8f4ff, 0x5b6570, 0);
  outside.add(lightning);

  // The legacy outside already contains one InstancedMesh rain field. We control
  // its visibility/intensity instead of adding duplicate rain geometry.
  let legacyRain = null;
  outside.traverse((o) => {
    if (!legacyRain && o.isInstancedMesh) legacyRain = o;
  });

  const weatherModes = ['OVERCAST', 'RAIN', 'CLEAR', 'STORM'];
  let weatherIndex = 0;
  let weather = weatherModes[weatherIndex];
  let weatherTimer = 0;
  let environmentElapsed = 0;
  // Start in late afternoon so the first surface visit is immediately readable.
  let timeHours = 16.35;
  const HOURS_PER_REAL_SECOND = 24 / (12 * 60); // full day every 12 real minutes
  let lightningEnergy = 0;

  const dayBg = new THREE.Color(0x78858a);
  const duskBg = new THREE.Color(0x4e5960);
  const nightBg = new THREE.Color(0x091015);
  const dayFog = new THREE.Color(0x697477);
  const nightFog = new THREE.Color(0x11191d);
  const tempColor = new THREE.Color();

  function smoothstep(a, b, v) {
    const t = THREE.MathUtils.clamp((v - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function updateEnvironment(dt) {
    environmentElapsed += dt;
    timeHours = (timeHours + dt * HOURS_PER_REAL_SECOND) % 24;
    weatherTimer += dt;
    if (weatherTimer > 88) {
      weatherTimer = 0;
      weatherIndex = (weatherIndex + 1) % weatherModes.length;
      weather = weatherModes[weatherIndex];
    }

    const angle = ((timeHours - 6) / 24) * Math.PI * 2;
    const elevation = Math.sin(angle);
    const day = smoothstep(-.16, .22, elevation);
    const dusk = 1 - smoothstep(.05, .34, Math.abs(elevation));
    const night = 1 - day;

    const cloudy = weather === 'OVERCAST' || weather === 'RAIN' || weather === 'STORM';
    const storm = weather === 'STORM';
    const wet = weather === 'RAIN' || storm;

    // Sky / fog colour.
    tempColor.copy(nightBg).lerp(dayBg, day);
    if (dusk > .15) tempColor.lerp(duskBg, dusk * .30);
    if (cloudy) tempColor.multiplyScalar(.82);
    outside.background.copy(tempColor);

    tempColor.copy(nightFog).lerp(dayFog, day);
    if (cloudy) tempColor.multiplyScalar(.86);
    outside.fog.color.copy(tempColor);
    outside.fog.density = storm ? .024 : weather === 'RAIN' ? .018 : cloudy ? .013 : .009;

    // Sun/moon travel across the sky.
    const az = angle * .72;
    sun.position.set(Math.cos(az) * 32, Math.max(2, elevation * 34), Math.sin(az) * 28);
    moon.position.set(-sun.position.x, Math.max(8, -elevation * 30), -sun.position.z);
    sun.intensity = Math.max(0, day * (cloudy ? .85 : 2.0));
    moon.intensity = night * (cloudy ? .28 : .50);
    skyHemi.intensity = .24 + day * (cloudy ? .72 : 1.18);
    skyAmbient.intensity = .12 + day * .24 + night * .08;

    skyHemi.color.setHex(day > .35 ? (cloudy ? 0xa9b2b4 : 0xc8d8dd) : 0x718896);
    skyHemi.groundColor.setHex(day > .35 ? 0x3e443d : 0x1e2523);

    const flood = smoothstep(.78, .18, day);
    yardFloodlights.forEach((l) => { l.intensity = 155 * flood; });
    gateLamp.intensity = 55 * flood;

    if (legacyRain) {
      legacyRain.visible = wet;
      if (legacyRain.material) {
        legacyRain.material.opacity = storm ? .28 : .18;
        legacyRain.material.needsUpdate = true;
      }
    }

    // Occasional storm flash, never continuous strobing.
    lightningEnergy = THREE.MathUtils.damp(lightningEnergy, 0, 8, dt);
    if (storm && Math.random() < dt * .045) lightningEnergy = 2.8 + Math.random() * 2.4;
    lightning.intensity = lightningEnergy;
  }

  game.getEnvironmentStatus = () => ({
    timeHours,
    weather,
    isNight: timeHours < 6.5 || timeHours > 19.5,
  });

  // Exposure target is intentionally scene-specific. Interior no longer shares
  // the same exposure as a dark outdoor yard.
  game.getExposure = (world) => {
    if (world === 'bunker') return .82;
    const status = game.getEnvironmentStatus();
    return status.isNight ? 1.02 : .92;
  };

  let elapsed = 0;
  game.update = (dt, ...args) => {
    baseUpdate(dt, ...args);
    elapsed += dt;
    updateEnvironment(dt);

    if (blastDoor) {
      blastDoor.position.x = THREE.MathUtils.damp(
        blastDoor.position.x,
        doorClosedX + (doorOpen ? 3.35 : 0),
        3.7,
        dt
      );
    }
    if (blastWheel && blastWheel !== blastDoor && doorOpen) blastWheel.rotation.z += dt * 1.15;
    if (vaultDoor) {
      vaultDoor.rotation.y = THREE.MathUtils.damp(
        vaultDoor.rotation.y,
        vaultClosedRotation + (vaultOpen ? -1.48 : 0),
        4.8,
        dt
      );
    }

    dust.rotation.y += dt * .006;
    centreBounce.intensity = 8.6 + Math.sin(elapsed * .38) * .35;
    practicalSpots.forEach((spot, i) => {
      spot.intensity = 92 + Math.sin(elapsed * (.55 + i * .018) + i * .7) * 1.2;
    });
  };

  player.position.set(0, 0, 5.05);
  return game;
}

import * as THREE from 'three';
import { createGameWorld as createLegacyWorld } from './world_blender.js';
import { cloneGLTF, findNamed } from './assets.js';

// Shelter 47 V5 integration layer.
// The old component-built bunker is used only to retain the proven exterior,
// CCTV cameras, weapon viewmodel and survival plumbing. The visible bunker is
// completely replaced by the single Blender-authored V5 room GLB.
export function createGameWorld(assets) {
  const game = createLegacyWorld(assets);
  const { bunker, player, interactions } = game;

  const baseUpdate = game.update.bind(game);
  const baseBlocked = game.blocked.bind(game);
  const baseSetArmed = game.setArmed.bind(game);
  const baseSetWorld = game.setWorld.bind(game);

  // Keep exterior interactions (return-to-shelter panel), discard every old
  // bunker interaction because its visible prop is about to be removed.
  const exteriorInteractions = interactions.filter(
    (o) => o.userData.interaction?.world === 'outside'
  );
  interactions.length = 0;
  interactions.push(...exteriorInteractions);

  // Remove every old bunker prop/light in one operation, then restore the
  // player/camera and add the integrated Blender scene.
  bunker.clear();
  bunker.add(player);
  bunker.background = new THREE.Color(0x111410);
  bunker.fog = new THREE.FogExp2(0x171a16, 0.0052);

  const room = cloneGLTF(assets.roomV5);
  room.name = 'Shelter47_V5_IntegratedRoom';
  bunker.add(room);
  room.updateMatrixWorld(true);

  // Blender is Z-up and the exporter maps the authored bunker depth to glTF Z.
  // Always orient the circular blast door toward the game's -Z end so the
  // existing first-person spawn direction remains intuitive.
  const blastDoor = findNamed(room, 'BlastDoor_Door');
  if (blastDoor) {
    const doorWorld = blastDoor.getWorldPosition(new THREE.Vector3());
    if (doorWorld.z > 0) {
      room.rotation.y = Math.PI;
      room.updateMatrixWorld(true);
    }
  }

  // Keep materials authored in Blender. Only enforce runtime shadow flags and
  // keep extreme black non-emissive surfaces from crushing to zero on phones.
  room.traverse((o) => {
    if (o.isLight) {
      // Blender QA uses render-only lights. Runtime lighting below is tuned for
      // Three.js/mobile so imported punctual lights are disabled for consistency.
      o.visible = false;
      return;
    }
    if (!o.isMesh) return;
    o.castShadow = true;
    o.receiveShadow = true;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) {
      if (!m || !m.color) continue;
      const emissivePower = m.emissive
        ? Math.max(m.emissive.r, m.emissive.g, m.emissive.b)
        : 0;
      const lum = m.color.r * .2126 + m.color.g * .7152 + m.color.b * .0722;
      if (emissivePower < .04 && lum < .018) {
        m.color.lerp(new THREE.Color(0x272b27), .32);
        m.needsUpdate = true;
      }
    }
  });

  // -------------------------------------------------------------------------
  // Runtime lighting: broad readable civil-defence lighting, not a single
  // bright patch surrounded by black. Eight practical pools mirror the two
  // rows of fluorescent fixtures authored in Blender.
  // -------------------------------------------------------------------------
  bunker.add(new THREE.HemisphereLight(0xd7ddd4, 0x3e423a, 1.18));
  bunker.add(new THREE.AmbientLight(0xaeb4aa, .34));

  const practicalSpots = [];
  const zRows = [-5.05, -1.70, 1.70, 5.05];
  for (const z of zRows) {
    for (const x of [-2.25, 2.25]) {
      const spot = new THREE.SpotLight(0xf0efe5, 245, 11.5, 1.02, .86, 2);
      spot.position.set(x, 3.52, z);
      spot.target.position.set(x * .82, .12, z * .82);
      // Two shadowed key fixtures give depth without making mobile render eight
      // full shadow maps every frame.
      spot.castShadow = (x < 0 && z < -4) || (x > 0 && z > 4);
      if (spot.castShadow) {
        spot.shadow.mapSize.set(768, 768);
        spot.shadow.bias = -0.00022;
        spot.shadow.camera.near = .25;
        spot.shadow.camera.far = 12;
      }
      bunker.add(spot, spot.target);
      practicalSpots.push(spot);
    }
  }

  const centreBounce = new THREE.PointLight(0xd3d7cf, 32, 10.5, 2);
  centreBounce.position.set(0, 2.05, 0);
  bunker.add(centreBounce);

  const cctvTask = new THREE.PointLight(0xc9d9ce, 24, 5.4, 2);
  cctvTask.position.set(-4.05, 2.0, -1.8);
  bunker.add(cctvTask);

  const commsTask = new THREE.PointLight(0xdad2b4, 21, 5.2, 2);
  commsTask.position.set(4.0, 2.0, 4.25);
  bunker.add(commsTask);

  const doorTask = new THREE.PointLight(0xc47b55, 17, 4.8, 2);
  doorTask.position.set(1.45, 1.75, -6.25);
  bunker.add(doorTask);

  // Fine dust gives light volumes some atmosphere without obscuring furniture.
  const dustCount = 220;
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
      color: 0xd8d9cf,
      size: .014,
      transparent: true,
      opacity: .12,
      depthWrite: false,
    })
  );
  bunker.add(dust);

  // -------------------------------------------------------------------------
  // Bind gameplay directly to visible named Blender objects.
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
  register(cctvConsole, 'CCTV SURVEILLANCE', () => {
    window.dispatchEvent(new CustomEvent('lostsignal:cctv'));
  });

  const computerScreen = findNamed(room, 'Computer_Screen');
  register(computerScreen, 'COMPUTER TERMINAL', () => {
    window.dispatchEvent(new CustomEvent('lostsignal:computer'));
  });

  const radioBody = findNamed(room, 'Radio_Body');
  register(radioBody, 'SHORTWAVE RADIO', () => {
    window.dispatchEvent(new CustomEvent('lostsignal:radio'));
  });

  const generatorBody = findNamed(room, 'Generator_Body');
  register(generatorBody, 'DIESEL GENERATOR', () => {
    window.dispatchEvent(new CustomEvent('lostsignal:generator'));
  });

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

  // Animation baselines are captured after orientation has been fixed.
  const doorClosedX = blastDoor?.position.x ?? 0;
  const vaultClosedRotation = vaultDoor?.rotation.y ?? 0;

  // V5 collision is deliberately based on the authored perimeter layout. The
  // central circulation zone stays clear while wall furniture remains solid.
  game.blocked = (world, x, z) => {
    if (world !== 'bunker') return baseBlocked(world, x, z);
    if (x < -6.02 || x > 6.02 || z < -6.86 || z > 6.86) return true;
    // Dense equipment banks along both walls. Keeping the player outside these
    // strips prevents walking through consoles while still allowing use from
    // roughly 1.1–1.4 metres away.
    if (x < -4.62 && z > -6.15 && z < 6.15) return true;
    if (x > 4.62 && z > -6.15 && z < 6.15) return true;
    return false;
  };

  game.setArmed = (value) => {
    baseSetArmed(value);
    if (rifleDisplay) rifleDisplay.visible = !value;
  };

  game.setWorld = (world) => {
    baseSetWorld(world);
    if (world === 'bunker') {
      // Return just inside the pressure door, looking into the shelter.
      player.position.set(0, 0, -5.72);
    }
  };

  game.doorOpen = () => doorOpen;
  game.roomV5 = room;

  let elapsed = 0;
  game.update = (dt, ...args) => {
    // Retains exterior rain and weapon/exterior animation from the proven V3
    // world. Detached V3 bunker nodes update harmlessly off-scene.
    baseUpdate(dt, ...args);
    elapsed += dt;

    if (blastDoor) {
      blastDoor.position.x = THREE.MathUtils.damp(
        blastDoor.position.x,
        doorClosedX + (doorOpen ? 3.35 : 0),
        3.7,
        dt
      );
    }
    if (blastWheel && blastWheel !== blastDoor && doorOpen) {
      blastWheel.rotation.z += dt * 1.15;
    }
    if (vaultDoor) {
      vaultDoor.rotation.y = THREE.MathUtils.damp(
        vaultDoor.rotation.y,
        vaultClosedRotation + (vaultOpen ? -1.48 : 0),
        4.8,
        dt
      );
    }

    dust.rotation.y += dt * .006;
    centreBounce.intensity = 31 + Math.sin(elapsed * .38) * 1.1;
    practicalSpots.forEach((spot, i) => {
      // Ballast drift only — never enough to plunge the room into darkness.
      spot.intensity = 245 + Math.sin(elapsed * (.55 + i * .018) + i * .7) * 2.4;
    });
  };

  // The original V3 spawn already sits on the centreline at z=+5, facing -Z.
  // Keep it: after auto-orienting the door this matches the Blender QA spawn.
  player.position.set(0, 0, 5.05);

  return game;
}

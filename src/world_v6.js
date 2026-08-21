import * as THREE from 'three';
import { createGameWorld as createV5World } from './world_v5.js';
import { cloneGLTF, findNamed } from './assets.js';

// Shelter 47 V6
// - keeps the validated integrated V5 bunker
// - replaces the placeholder exterior with our authored Blender V6 compound
// - adds our own Blender vegetation/wildlife
// - promotes bunker survival props from decoration into gameplay objects
export function createGameWorld(assets) {
  const game = createV5World(assets);
  const { bunker, player, camera, interactions } = game;
  const baseBlocked = game.blocked.bind(game);
  const baseUpdate = game.update.bind(game);

  // -----------------------------------------------------------------------
  // Generic interaction helpers
  // -----------------------------------------------------------------------
  function removeInteraction(object) {
    const i = interactions.indexOf(object);
    if (i >= 0) interactions.splice(i, 1);
  }

  function register(object, name, world, onUse) {
    if (!object) return null;
    object.userData.interaction = { name, world, onUse };
    if (!interactions.includes(object)) interactions.push(object);
    return object;
  }

  function allPrefix(root, prefix) {
    const out = [];
    root?.traverse((o) => {
      if (o.name === prefix || o.name.startsWith(`${prefix}.`) || o.name.startsWith(`${prefix}_`)) out.push(o);
    });
    return out;
  }

  function pickup(object, actionName, id, label, quantity = 1) {
    if (!object) return;
    register(object, actionName, 'bunker', () => {
      removeInteraction(object);
      object.visible = false;
      window.dispatchEvent(new CustomEvent('lostsignal:pickup', {
        detail: { id, label, quantity },
      }));
    });
  }

  // -----------------------------------------------------------------------
  // Make the integrated bunker function like a survival room rather than a
  // static display scene.
  // -----------------------------------------------------------------------
  const room = game.roomV5;

  allPrefix(room, 'Paper').forEach((o, i) =>
    pickup(o, 'READ / TAKE NOTE', `note_${i + 1}`, `Shelter note ${i + 1}`)
  );

  allPrefix(room, 'RationBox').forEach((o) =>
    pickup(o, 'TAKE RATION PACK', 'ration', 'Ration pack')
  );

  allPrefix(room, 'JerryCan').forEach((o) =>
    pickup(o, 'TAKE FUEL CAN', 'fuel', 'Diesel fuel can')
  );

  const extinguisher = findNamed(room, 'Extinguisher');
  pickup(extinguisher, 'TAKE EXTINGUISHER', 'extinguisher', 'Fire extinguisher');

  const firstAid = findNamed(room, 'FirstAidCabinet');
  if (firstAid) {
    let looted = false;
    register(firstAid, 'OPEN FIRST AID CABINET', 'bunker', () => {
      if (looted) {
        window.dispatchEvent(new CustomEvent('lostsignal:inspect', { detail: { text: 'FIRST AID CABINET — EMPTY' } }));
        return;
      }
      looted = true;
      firstAid.userData.interaction.name = 'FIRST AID CABINET — EMPTY';
      window.dispatchEvent(new CustomEvent('lostsignal:pickup', {
        detail: { id: 'medkit', label: 'Trauma medical kit', quantity: 1 },
      }));
    });
  }

  allPrefix(room, 'SupplyCrate').forEach((crate, i) => {
    let searched = false;
    register(crate, 'SEARCH SUPPLY CRATE', 'bunker', () => {
      if (searched) {
        window.dispatchEvent(new CustomEvent('lostsignal:inspect', { detail: { text: 'SUPPLY CRATE — EMPTY' } }));
        return;
      }
      searched = true;
      crate.userData.interaction.name = 'SUPPLY CRATE — EMPTY';
      const loot = i % 3 === 0
        ? { id: 'batteries', label: 'Utility batteries', quantity: 2 }
        : i % 3 === 1
          ? { id: 'ammo', label: 'Rifle cartridges', quantity: 5 }
          : { id: 'cloth', label: 'Repair cloth', quantity: 2 };
      window.dispatchEvent(new CustomEvent('lostsignal:pickup', { detail: loot }));
    });
  });

  allPrefix(room, 'LockerDoor').forEach((door, i) => {
    let searched = false;
    register(door, `SEARCH LOCKER ${i + 1}`, 'bunker', () => {
      if (searched) {
        window.dispatchEvent(new CustomEvent('lostsignal:inspect', { detail: { text: `LOCKER ${i + 1} — EMPTY` } }));
        return;
      }
      searched = true;
      door.userData.interaction.name = `LOCKER ${i + 1} — EMPTY`;
      const loot = i === 0
        ? { id: 'water', label: 'Sealed water bottle', quantity: 2 }
        : i === 1
          ? { id: 'batteries', label: 'Utility batteries', quantity: 2 }
          : i === 2
            ? { id: 'cloth', label: 'Repair cloth', quantity: 2 }
            : { id: 'flare', label: 'Emergency flare', quantity: 1 };
      window.dispatchEvent(new CustomEvent('lostsignal:pickup', { detail: loot }));
    });
  });

  const statusBoard = findNamed(room, 'StatusBoard');
  register(statusBoard, 'READ SHELTER STATUS', 'bunker', () => {
    window.dispatchEvent(new CustomEvent('lostsignal:inspect', {
      detail: { text: 'SHELTER 47\nPOWER 87%\nAIR SCRUBBERS NOMINAL\nWATER 19 DAYS\nSURVIVORS REGISTERED: 1' },
    }));
  });

  allPrefix(room, 'BunkMattress').forEach((bed) => {
    register(bed, 'REST ON BUNK', 'bunker', () => {
      window.dispatchEvent(new CustomEvent('lostsignal:rest', { detail: { hours: 6 } }));
    });
  });

  // -----------------------------------------------------------------------
  // Replace the old exterior scene completely. The camera/player are not
  // children of that old scene while the player is inside, so nothing visual
  // from the placeholder exterior survives this swap.
  // -----------------------------------------------------------------------
  for (let i = interactions.length - 1; i >= 0; i--) {
    if (interactions[i].userData.interaction?.world === 'outside') interactions.splice(i, 1);
  }

  const outside = new THREE.Scene();
  outside.name = 'Shelter47_Exterior_V6';
  outside.background = new THREE.Color(0x6f7775);
  outside.fog = new THREE.FogExp2(0x717977, .009);
  game.outside = outside;

  const yard = cloneGLTF(assets.yardV6);
  yard.name = 'Shelter47_Yard_V6';
  outside.add(yard);
  yard.updateMatrixWorld(true);

  // Blender Y is converted to glTF -Z. Auto-orient the authored surface bunker
  // so it sits at the game's -Z end, matching the bunker blast door/camera map.
  const surfaceBunker = findNamed(yard, 'SurfaceBunker_Main');
  if (surfaceBunker) {
    const p = surfaceBunker.getWorldPosition(new THREE.Vector3());
    if (p.z > 0) {
      yard.rotation.y = Math.PI;
      yard.updateMatrixWorld(true);
    }
  }

  yard.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true;
    o.receiveShadow = true;
  });

  // -----------------------------------------------------------------------
  // Blender vegetation. Grass geometry is authored in Blender; runtime uses
  // instancing to make that authored geometry dense enough for mobile without
  // thousands of draw calls.
  // -----------------------------------------------------------------------
  function randomGroundPosition(inner = true) {
    for (let tries = 0; tries < 100; tries++) {
      const x = (Math.random() - .5) * (inner ? 37 : 64);
      const z = -29 + Math.random() * (inner ? 48 : 62);
      if (Math.abs(x) < 5.4 && z > -27 && z < 18) continue; // keep road visible
      if (Math.abs(x) < 7 && z > -22 && z < -12) continue; // bunker footprint
      return { x, z };
    }
    return { x: 10, z: 8 };
  }

  assets.grassV6.scene.updateMatrixWorld(true);
  const grassSources = [];
  assets.grassV6.scene.traverse((o) => {
    if (o.isMesh && grassSources.length < 7) grassSources.push(o);
  });
  const grassInstances = [];
  grassSources.forEach((source, variant) => {
    const geometry = source.geometry.clone();
    geometry.applyMatrix4(source.matrixWorld);
    const count = 150;
    const inst = new THREE.InstancedMesh(geometry, source.material, count);
    inst.name = `AuthoredGrass_${variant}`;
    inst.castShadow = false;
    inst.receiveShadow = true;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      const spot = randomGroundPosition(true);
      p.set(spot.x, .16 + Math.random() * .025, spot.z);
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * Math.PI * 2);
      const k = .72 + Math.random() * .72;
      s.set(k, .80 + Math.random() * .75, k);
      m.compose(p, q, s);
      inst.setMatrixAt(i, m);
    }
    inst.instanceMatrix.needsUpdate = true;
    outside.add(inst);
    grassInstances.push(inst);
  });

  function placeNature(gltf, count, scaleRange, outer = false) {
    const roots = [];
    for (let i = 0; i < count; i++) {
      const o = cloneGLTF(gltf);
      const spot = randomGroundPosition(!outer);
      o.position.set(spot.x, .14, spot.z);
      o.rotation.y = Math.random() * Math.PI * 2;
      const k = scaleRange[0] + Math.random() * (scaleRange[1] - scaleRange[0]);
      o.scale.setScalar(k);
      o.traverse((n) => {
        if (n.isMesh) {
          n.castShadow = true;
          n.receiveShadow = true;
        }
      });
      outside.add(o);
      roots.push(o);
    }
    return roots;
  }

  const pines = placeNature(assets.pineV6, 24, [.72, 1.35], true);
  const bushes = placeNature(assets.bushV6, 30, [.62, 1.25], false);
  const rocks = placeNature(assets.rockV6, 22, [.55, 1.35], false);

  // -----------------------------------------------------------------------
  // Authored Blender wildlife. These are our own meshes. Until the next Blender
  // rigging pass, gait/alert animation is driven through the authored named
  // leg/ear nodes rather than downloading another third-party animal model.
  // -----------------------------------------------------------------------
  game.wildlife.length = 0;
  game.zombies.length = 0;

  function namedPrefix(root, prefix) {
    const out = [];
    root.traverse((o) => {
      if (o.name.startsWith(prefix)) out.push(o);
    });
    return out;
  }

  function spawnWildlife(gltf, kind, x, z, scale, radiusX, radiusZ, speed) {
    const root = cloneGLTF(gltf);
    root.position.set(x, .16, z);
    root.scale.setScalar(scale);
    root.userData.kind = kind;
    root.userData.alive = true;
    root.userData.harvested = false;
    root.userData.cx = x;
    root.userData.cz = z;
    root.userData.rx = radiusX;
    root.userData.rz = radiusZ;
    root.userData.speed = speed;
    root.userData.phase = Math.random() * Math.PI * 2;
    root.userData.legs = namedPrefix(root, kind === 'deer' ? 'Deer_' : 'Rabbit_Paw');
    root.userData.ears = namedPrefix(root, kind === 'deer' ? 'Deer_Ear' : 'Rabbit_Ear');
    root.userData.baseY = root.position.y;
    root.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    outside.add(root);
    game.wildlife.push(root);
    return root;
  }

  spawnWildlife(assets.deerV6, 'deer', -11, 7, .92, 4.0, 3.1, .17);
  spawnWildlife(assets.deerV6, 'deer', 12, -2, .82, 3.5, 3.0, .19);
  spawnWildlife(assets.deerV6, 'deer', 10, 12, .88, 3.0, 2.8, .18);
  spawnWildlife(assets.rabbitV6, 'rabbit', -9, 11, .90, 2.1, 1.5, .36);
  spawnWildlife(assets.rabbitV6, 'rabbit', 8, 7, .82, 1.8, 1.4, .40);
  spawnWildlife(assets.rabbitV6, 'rabbit', -12, -7, .86, 2.0, 1.5, .38);
  spawnWildlife(assets.rabbitV6, 'rabbit', 13, -10, .78, 1.7, 1.3, .42);

  // -----------------------------------------------------------------------
  // Yard interactions
  // -----------------------------------------------------------------------
  const returnPanel = findNamed(yard, 'ReturnPanel') || findNamed(yard, 'ReturnPanel_Screen');
  register(returnPanel, 'RETURN TO SHELTER', 'outside', () => {
    window.dispatchEvent(new CustomEvent('lostsignal:return'));
  });

  const gateL = findNamed(yard, 'MainGateLeaf_-1');
  const gateR = findNamed(yard, 'MainGateLeaf_1');
  let gateOpen = false;
  const gateTarget = gateL || gateR;
  const gateInteraction = register(gateTarget, 'OPEN MAIN GATE', 'outside', () => {
    gateOpen = !gateOpen;
    gateInteraction.userData.interaction.name = gateOpen ? 'CLOSE MAIN GATE' : 'OPEN MAIN GATE';
    window.dispatchEvent(new CustomEvent('lostsignal:inspect', {
      detail: { text: gateOpen ? 'PERIMETER GATE OPEN' : 'PERIMETER GATE SECURED' },
    }));
  });
  const gateLBase = gateL?.position.x ?? 0;
  const gateRBase = gateR?.position.x ?? 0;

  const guardDoor = findNamed(yard, 'GuardDoor');
  let guardOpen = false;
  const guardInteraction = register(guardDoor, 'OPEN GUARD BOOTH', 'outside', () => {
    guardOpen = !guardOpen;
    guardInteraction.userData.interaction.name = guardOpen ? 'CLOSE GUARD BOOTH' : 'OPEN GUARD BOOTH';
  });
  const guardBase = guardDoor?.position.x ?? 0;

  allPrefix(yard, 'FuelDrum').forEach((drum) => {
    register(drum, 'CHECK FUEL DRUM', 'outside', () => {
      window.dispatchEvent(new CustomEvent('lostsignal:inspect', {
        detail: { text: 'DIESEL DRUM — WEATHERED / APPROX. 40% REMAINING' },
      }));
    });
  });

  // -----------------------------------------------------------------------
  // Day/night/weather for the actual V6 yard. CCTV uses this exact same scene.
  // -----------------------------------------------------------------------
  const hemi = new THREE.HemisphereLight(0xd7e0df, 0x1c211c, .82);
  outside.add(hemi);
  const ambient = new THREE.AmbientLight(0xaab1ad, .17);
  outside.add(ambient);

  const sun = new THREE.DirectionalLight(0xfff0d5, 2.5);
  sun.position.set(-30, 45, 18);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -42;
  sun.shadow.camera.right = 42;
  sun.shadow.camera.top = 42;
  sun.shadow.camera.bottom = -42;
  sun.shadow.bias = -.0002;
  outside.add(sun);

  const moon = new THREE.DirectionalLight(0x9fb8cf, .62);
  moon.position.set(28, 34, -15);
  outside.add(moon);

  const floodPositions = [
    [-14, 5.45, -20], [14, 5.45, -20], [-14, 5.45, 11], [14, 5.45, 11],
  ];
  const floodlights = floodPositions.map(([x, y, z], i) => {
    const l = new THREE.SpotLight(0xe4eef0, 520, 38, .70, .72, 1.55);
    l.position.set(x, y, z);
    l.target.position.set(x * .28, 0, z * .25);
    l.castShadow = i < 2;
    if (l.castShadow) {
      l.shadow.mapSize.set(768, 768);
      l.shadow.bias = -.00025;
    }
    outside.add(l, l.target);
    return l;
  });

  const gateLights = [-4.4, 4.4].map((x) => {
    const l = new THREE.SpotLight(0xffe6b8, 280, 24, .68, .78, 1.5);
    l.position.set(x, 4.05, 16.4);
    l.target.position.set(x * .35, 0, 8);
    outside.add(l, l.target);
    return l;
  });

  const skyUniforms = {
    top: { value: new THREE.Color(0x66757b) },
    bottom: { value: new THREE.Color(0x9da3a0) },
  };
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(130, 28, 18),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: skyUniforms,
      vertexShader: 'varying vec3 vP; void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader: 'varying vec3 vP; uniform vec3 top; uniform vec3 bottom; void main(){float h=clamp(normalize(vP).y*.65+.35,0.0,1.0);gl_FragColor=vec4(mix(bottom,top,h),1.0);}',
    })
  );
  outside.add(sky);

  const rainCount = 520;
  const rainGeo = new THREE.PlaneGeometry(.014, .62);
  const rainMat = new THREE.MeshBasicMaterial({
    color: 0xc6d6dc,
    transparent: true,
    opacity: .22,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const rain = new THREE.InstancedMesh(rainGeo, rainMat, rainCount);
  const rainData = [];
  const rainMatrix = new THREE.Matrix4();
  for (let i = 0; i < rainCount; i++) {
    const p = new THREE.Vector3((Math.random() - .5) * 68, 2 + Math.random() * 20, -32 + Math.random() * 66);
    rainData.push({ p, v: 9 + Math.random() * 9 });
    rainMatrix.makeRotationZ(-.07);
    rainMatrix.setPosition(p);
    rain.setMatrixAt(i, rainMatrix);
  }
  outside.add(rain);

  const lightning = new THREE.PointLight(0xddeeff, 0, 120, 1.0);
  lightning.position.set(0, 30, 0);
  outside.add(lightning);

  let simMinutes = 18 * 60 + 20;
  let elapsedV6 = 0;
  let weather = 'OVERCAST';
  let weatherClock = 0;
  let nextWeatherAt = 72;
  const weatherOrder = ['OVERCAST', 'RAIN', 'CLEAR', 'OVERCAST', 'STORM', 'RAIN'];
  let weatherIndex = 0;

  function daylightFor(minutes) {
    const hour = (minutes / 60) % 24;
    // smooth daylight from ~05:30 to ~20:30
    const angle = ((hour - 6) / 12) * Math.PI;
    return THREE.MathUtils.clamp(Math.sin(angle), 0, 1);
  }

  function updateEnvironment(dt) {
    // One full game day in roughly 12 real minutes.
    simMinutes = (simMinutes + dt * 2.0) % 1440;
    weatherClock += dt;
    if (weatherClock > nextWeatherAt) {
      weatherClock = 0;
      weatherIndex = (weatherIndex + 1) % weatherOrder.length;
      weather = weatherOrder[weatherIndex];
      nextWeatherAt = 55 + Math.random() * 55;
    }

    const day = daylightFor(simMinutes);
    const night = 1 - day;
    const hour = simMinutes / 60;
    const sunA = ((hour - 6) / 24) * Math.PI * 2;
    sun.position.set(Math.cos(sunA) * 42, Math.max(-8, Math.sin(sunA) * 48), Math.sin(sunA) * 28);
    sun.intensity = (.12 + day * 2.7) * (weather === 'CLEAR' ? 1.12 : weather === 'STORM' ? .38 : .72);
    moon.intensity = .12 + night * .72;
    hemi.intensity = .22 + day * .75;
    ambient.intensity = .10 + day * .14;

    const overcast = weather === 'OVERCAST' || weather === 'RAIN' || weather === 'STORM';
    const topDay = new THREE.Color(overcast ? 0x657277 : 0x668aab);
    const bottomDay = new THREE.Color(overcast ? 0x969b98 : 0xb5b6a5);
    const topNight = new THREE.Color(0x07111a);
    const bottomNight = new THREE.Color(0x16202a);
    skyUniforms.top.value.copy(topNight).lerp(topDay, day);
    skyUniforms.bottom.value.copy(bottomNight).lerp(bottomDay, day);
    outside.background.copy(skyUniforms.bottom.value);

    const fogColor = new THREE.Color(0x182125).lerp(new THREE.Color(overcast ? 0x7b8583 : 0x96a1a1), day);
    outside.fog.color.copy(fogColor);
    outside.fog.density = weather === 'STORM' ? .018 : weather === 'RAIN' ? .013 : overcast ? .0105 : .0075;

    const practical = .16 + night * .84;
    floodlights.forEach((l) => { l.intensity = 90 + practical * 720; });
    gateLights.forEach((l) => { l.intensity = 55 + practical * 360; });

    rain.visible = weather === 'RAIN' || weather === 'STORM';
    rainMat.opacity = weather === 'STORM' ? .34 : .21;
    if (rain.visible) {
      for (let i = 0; i < rainCount; i++) {
        const d = rainData[i];
        d.p.y -= d.v * dt;
        d.p.x -= (weather === 'STORM' ? 3.3 : 1.2) * dt;
        if (d.p.y < .04) {
          d.p.set((Math.random() - .5) * 68, 12 + Math.random() * 12, -32 + Math.random() * 66);
        }
        rainMatrix.makeRotationZ(weather === 'STORM' ? -.18 : -.07);
        rainMatrix.setPosition(d.p);
        rain.setMatrixAt(i, rainMatrix);
      }
      rain.instanceMatrix.needsUpdate = true;
    }

    if (weather === 'STORM' && Math.random() < dt * .07) {
      lightning.intensity = 38;
    } else {
      lightning.intensity = THREE.MathUtils.damp(lightning.intensity, 0, 11, dt);
    }
  }

  game.environment = () => ({
    timeMinutes: simMinutes,
    weather,
    daylight: daylightFor(simMinutes),
    night: 1 - daylightFor(simMinutes),
  });
  game.advanceTime = (minutes) => {
    simMinutes = (simMinutes + minutes) % 1440;
  };

  // Flashlight from V5 was attached to the same camera and remains valid.

  // Reparent correctly between the integrated bunker and the new V6 exterior.
  game.setWorld = (world) => {
    player.parent?.remove(player);
    if (world === 'outside') {
      outside.add(player);
      player.position.set(0, 0, -12.0);
    } else {
      bunker.add(player);
      player.position.set(0, 0, -5.72);
    }
  };

  // V6 yard movement: player stays inside the secured compound for this pass.
  // Gate opening is functional/visual; beyond-fence terrain is still visible to
  // CCTV and animals and becomes traversable in the next terrain expansion.
  game.blocked = (world, x, z) => {
    if (world !== 'outside') return baseBlocked(world, x, z);
    if (x < -19.25 || x > 19.25 || z < -25.8 || z > 16.9) return true;
    if (x > -5.4 && x < 5.4 && z > -21.0 && z < -12.8) return true; // surface bunker
    if (x > -15.2 && x < -11.2 && z > 10.6 && z < 14.3) return true; // guard booth
    return false;
  };

  const prevNearest = game.nearestInteraction.bind(game);
  game.nearestInteraction = (world) => prevNearest(world);

  // CCTV framing retuned for the authored V6 yard.
  const cctvTargets = [
    new THREE.Vector3(0, 1.1, 18),
    new THREE.Vector3(15, 1.3, 5),
    new THREE.Vector3(0, .8, -3),
    new THREE.Vector3(0, .5, -4),
  ];
  const cctvPositions = [
    [0, 4.4, -12.3],
    [18.2, 5.1, 9.8],
    [-17.2, 4.5, -8.5],
    [-18.5, 11.5, 20.5],
  ];
  game.cctvCameras.forEach((c, i) => {
    c.position.set(...cctvPositions[i]);
    c.lookAt(cctvTargets[i]);
    c.near = .08;
    c.far = 180;
    c.updateProjectionMatrix();
  });
  game.cctvBaseRot = game.cctvCameras.map((c) => c.rotation.clone());

  // -----------------------------------------------------------------------
  // V6 update: preserve bunker door/vault effects from V5, then animate the
  // authored yard, weather, animals and interactable exterior doors.
  // -----------------------------------------------------------------------
  game.update = (dt, currentWorld, playerPosition) => {
    baseUpdate(dt, currentWorld, playerPosition);
    elapsedV6 += dt;
    updateEnvironment(dt);

    if (gateL) gateL.position.x = THREE.MathUtils.damp(gateL.position.x, gateLBase + (gateOpen ? -4.0 : 0), 4.2, dt);
    if (gateR) gateR.position.x = THREE.MathUtils.damp(gateR.position.x, gateRBase + (gateOpen ? 4.0 : 0), 4.2, dt);
    if (guardDoor) guardDoor.position.x = THREE.MathUtils.damp(guardDoor.position.x, guardBase + (guardOpen ? 1.0 : 0), 4.5, dt);

    const playerPos = playerPosition || player.position;
    for (const animal of game.wildlife) {
      const u = animal.userData;
      if (!u.alive) continue;

      let speed = u.speed;
      const dxp = animal.position.x - playerPos.x;
      const dzp = animal.position.z - playerPos.z;
      const playerDist = Math.hypot(dxp, dzp);
      if (currentWorld === 'outside' && playerDist < (u.kind === 'deer' ? 9 : 5)) {
        const inv = 1 / Math.max(.01, playerDist);
        u.cx += dxp * inv * dt * (u.kind === 'deer' ? .9 : .55);
        u.cz += dzp * inv * dt * (u.kind === 'deer' ? .9 : .55);
        speed *= u.kind === 'deer' ? 2.3 : 2.7;
      }

      const a = elapsedV6 * speed + u.phase;
      const nx = THREE.MathUtils.clamp(u.cx + Math.cos(a) * u.rx, -17.0, 17.0);
      const nz = THREE.MathUtils.clamp(u.cz + Math.sin(a) * u.rz, -23.0, 15.2);
      const odx = nx - animal.position.x;
      const odz = nz - animal.position.z;
      animal.position.x = THREE.MathUtils.damp(animal.position.x, nx, 1.9, dt);
      animal.position.z = THREE.MathUtils.damp(animal.position.z, nz, 1.9, dt);
      if (Math.abs(odx) + Math.abs(odz) > .0005) animal.rotation.y = Math.atan2(odx, odz);

      const gait = Math.sin(elapsedV6 * (u.kind === 'deer' ? 7.2 : 10.5) + u.phase);
      animal.position.y = u.baseY + (u.kind === 'rabbit' ? Math.max(0, gait) * .055 : Math.abs(gait) * .014);
      u.legs.forEach((leg, i) => {
        leg.rotation.x = gait * (i % 2 ? -.18 : .18);
      });
      u.ears.forEach((ear, i) => {
        ear.rotation.z = Math.sin(elapsedV6 * 2.0 + i) * .055;
      });
    }
  };

  game.yardV6 = yard;
  game.grassInstances = grassInstances;
  game.v6Nature = { pines, bushes, rocks };

  return game;
}

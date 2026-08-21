import * as THREE from 'three';
import { cloneGLTF, findNamed, findPrefix } from './assets.js';

export function createGameWorld(assets) {
  const bunker = new THREE.Scene();
  const outside = new THREE.Scene();
  bunker.name = 'Shelter47_AAA_Interior';
  outside.name = 'Shelter47_AAA_Exterior';
  bunker.background = new THREE.Color(0x111411);
  bunker.fog = new THREE.FogExp2(0x151814, .018);
  outside.background = new THREE.Color(0x687174);
  outside.fog = new THREE.FogExp2(0x687174, .012);

  const player = new THREE.Group();
  player.name = 'Player';
  const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, .04, 180);
  camera.position.set(0, 1.67, 0);
  camera.rotation.order = 'YXZ';
  player.add(camera);
  bunker.add(player);
  player.position.set(0, 0, 2.7);

  const interactions = [];
  const wildlife = [];
  const zombies = [];

  const room = cloneGLTF(assets.interiorAAA);
  room.name = 'AAA_Interior';
  bunker.add(room);
  const yard = cloneGLTF(assets.exteriorAAA);
  yard.name = 'AAA_Exterior';
  outside.add(yard);

  room.traverse((o) => {
    if (o.isLight) o.visible = false;
    if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
  });
  yard.traverse((o) => {
    if (o.isLight) o.visible = false;
    if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
  });

  function register(o, name, world, onUse) {
    if (!o) return null;
    o.userData.interaction = { name, world, onUse };
    if (!interactions.includes(o)) interactions.push(o);
    return o;
  }
  function pickup(o, name, id, label, qty = 1) {
    if (!o) return;
    register(o, name, 'bunker', () => {
      interactions.splice(interactions.indexOf(o), 1);
      o.visible = false;
      dispatchEvent(new CustomEvent('lostsignal:pickup', { detail: { id, label, quantity: qty } }));
    });
  }

  // --- Interior gameplay bound to visible Blender objects ---
  register(findNamed(room, 'INTERACT_CCTV'), 'CCTV SURVEILLANCE', 'bunker', () => dispatchEvent(new CustomEvent('lostsignal:cctv')));
  register(findNamed(room, 'INTERACT_Computer'), 'COMPUTER TERMINAL', 'bunker', () => dispatchEvent(new CustomEvent('lostsignal:computer')));
  register(findNamed(room, 'INTERACT_Radio'), 'SHORTWAVE RADIO', 'bunker', () => dispatchEvent(new CustomEvent('lostsignal:radio')));
  register(findNamed(room, 'INTERACT_Generator'), 'DIESEL GENERATOR', 'bunker', () => dispatchEvent(new CustomEvent('lostsignal:generator')));
  register(findNamed(room, 'INTERACT_Bed'), 'REST ON BUNK', 'bunker', () => dispatchEvent(new CustomEvent('lostsignal:rest', { detail: { hours: 6 } })));
  findPrefix(room, 'INTERACT_Locker_').forEach((o, i) => {
    let searched = false;
    register(o, `SEARCH LOCKER ${i + 1}`, 'bunker', () => {
      if (searched) return dispatchEvent(new CustomEvent('lostsignal:inspect', { detail: { text: `LOCKER ${i + 1} — EMPTY` } }));
      searched = true;
      dispatchEvent(new CustomEvent('lostsignal:pickup', { detail: i ? { id: 'batteries', label: 'Utility batteries', quantity: 2 } : { id: 'water', label: 'Sealed water bottle', quantity: 2 } }));
    });
  });
  findPrefix(room, 'INTERACT_SupplyCrate_').forEach((o, i) => {
    let searched = false;
    register(o, 'SEARCH SUPPLY CRATE', 'bunker', () => {
      if (searched) return dispatchEvent(new CustomEvent('lostsignal:inspect', { detail: { text: 'SUPPLY CRATE — EMPTY' } }));
      searched = true;
      const loot = i % 3 === 0 ? { id: 'ration', label: 'Ration pack', quantity: 1 } : i % 3 === 1 ? { id: 'ammo', label: 'Rifle cartridges', quantity: 5 } : { id: 'cloth', label: 'Repair cloth', quantity: 2 };
      dispatchEvent(new CustomEvent('lostsignal:pickup', { detail: loot }));
    });
  });
  findPrefix(room, 'PICKUP_Note_').forEach((o, i) => pickup(o, 'READ / TAKE NOTE', `note_${i + 1}`, `Shelter note ${i + 1}`));
  pickup(findNamed(room, 'INTERACT_Medkit'), 'TAKE TRAUMA KIT', 'medkit', 'Trauma medical kit');

  // Armory is Blender-authored from the previous pack and tucked beside the workstation.
  const vault = cloneGLTF(assets.vault);
  vault.name = 'AAA_Armory';
  vault.position.set(4.0, 0, 2.2);
  vault.rotation.y = Math.PI;
  vault.scale.setScalar(.9);
  bunker.add(vault);
  const vaultDoor = findNamed(vault, 'VaultDoor') || findNamed(vault, 'GunVault_Door') || vault;
  const rifleDisplay = cloneGLTF(assets.rifle);
  rifleDisplay.name = 'RifleDisplay';
  rifleDisplay.position.set(4.0, .9, 2.0);
  rifleDisplay.rotation.set(0, Math.PI / 2, -0.12);
  rifleDisplay.scale.setScalar(.62);
  bunker.add(rifleDisplay);
  let vaultOpen = false, armed = false;
  const vaultInt = register(vaultDoor, 'GUN VAULT', 'bunker', () => {
    if (!vaultOpen) {
      vaultOpen = true;
      vaultInt.name = 'TAKE SURVIVAL RIFLE';
      dispatchEvent(new CustomEvent('lostsignal:vaultopen'));
    } else if (!armed) {
      armed = true;
      vaultInt.name = 'ARMORY — EMPTY';
      dispatchEvent(new CustomEvent('lostsignal:takegun'));
    }
  });

  // Blast door: move only the visible leaf, leaving its frame fixed.
  const doorGroup = findNamed(room, 'INTERACT_BlastDoor');
  const doorLeaf = findNamed(room, 'Door47') || doorGroup;
  const doorClosedX = doorLeaf?.position.x ?? 0;
  let doorOpen = false;
  const doorInt = register(doorGroup, 'BLAST DOOR', 'bunker', () => {
    if (!doorOpen) {
      doorOpen = true;
      doorInt.name = 'EXIT TO SURFACE';
      dispatchEvent(new CustomEvent('lostsignal:door', { detail: { open: true } }));
    } else dispatchEvent(new CustomEvent('lostsignal:surface', { detail: { allowed: true } }));
  });

  // --- Exterior interaction ---
  const returnPanel = findNamed(yard, 'ReturnPanel');
  register(returnPanel, 'RETURN TO SHELTER', 'outside', () => dispatchEvent(new CustomEvent('lostsignal:return')));
  const gateL = findNamed(yard, 'INTERACT_MainGate_Left');
  const gateR = findNamed(yard, 'INTERACT_MainGate_Right');
  let gateOpen = false;
  const gateInt = register(gateL, 'OPEN MAIN GATE', 'outside', () => {
    gateOpen = !gateOpen;
    gateInt.name = gateOpen ? 'CLOSE MAIN GATE' : 'OPEN MAIN GATE';
    dispatchEvent(new CustomEvent('lostsignal:inspect', { detail: { text: gateOpen ? 'PERIMETER GATE OPEN' : 'PERIMETER GATE SECURED' } }));
  });
  findPrefix(yard, 'INTERACT_Crate_').forEach((o) => register(o, 'SEARCH YARD CRATE', 'outside', () => dispatchEvent(new CustomEvent('lostsignal:inspect', { detail: { text: 'WEATHER-DAMAGED SUPPLY CRATE — MOST CONTENTS SPOILED' } }))));

  // --- Wildlife and infected, all Blender-authored ---
  function spawnAnimal(gltf, kind, x, z, scale, rx, rz, speed) {
    const root = cloneGLTF(gltf);
    root.position.set(x, .03, z);
    root.scale.setScalar(scale);
    Object.assign(root.userData, { kind, alive: true, harvested: false, cx: x, cz: z, rx, rz, speed, phase: Math.random() * Math.PI * 2, baseY: .03 });
    root.userData.legs = findPrefix(root, kind === 'deer' ? 'Deer_Leg' : 'Rabbit_Paw');
    root.userData.ears = findPrefix(root, kind === 'deer' ? 'Deer_Ear' : 'Rabbit_Ear');
    root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    outside.add(root); wildlife.push(root); return root;
  }
  spawnAnimal(assets.deerAAA, 'deer', -9, -2, .92, 4.2, 3.0, .18);
  spawnAnimal(assets.deerAAA, 'deer', 9, 8, .82, 3.5, 2.8, .20);
  spawnAnimal(assets.rabbitAAA, 'rabbit', -4, 5, .95, 2.0, 1.5, .38);
  spawnAnimal(assets.rabbitAAA, 'rabbit', 6, 2, .88, 1.8, 1.4, .42);
  spawnAnimal(assets.rabbitAAA, 'rabbit', 12, -9, .82, 1.7, 1.4, .40);

  function spawnZombie(x, z, ax, az, bx, bz, delay = 0) {
    const root = cloneGLTF(assets.infectedAAA);
    root.position.set(x, .28, z);
    root.scale.setScalar(.92 + Math.random() * .10);
    Object.assign(root.userData, { kind: 'zombie', alive: true, hp: 2, pathA: [ax, az], pathB: [bx, bz], t: Math.random(), dir: 1, speed: .025 + Math.random() * .008, activeAt: delay });
    outside.add(root); zombies.push(root); return root;
  }
  spawnZombie(-16, 11, -16, 11, 12, 11, 3);
  spawnZombie(16, -4, 16, -4, 16, 12, 28);
  spawnZombie(-17, -13, -17, -13, -17, 8, 52);

  // --- First-person Blender rifle ---
  const weaponView = new THREE.Group();
  const gun = cloneGLTF(assets.rifle);
  gun.scale.setScalar(.82);
  gun.rotation.y = Math.PI;
  weaponView.add(gun);
  weaponView.position.set(.22, -.48, -.38);
  weaponView.visible = false;
  camera.add(weaponView);

  // --- Balanced practical bunker lighting matching the approved image ---
  bunker.add(new THREE.HemisphereLight(0xc8c9bd, 0x262821, .55));
  bunker.add(new THREE.AmbientLight(0x777970, .12));
  const bunkerSpots = [];
  for (const x of [-3, -1, 1, 3]) {
    const l = new THREE.SpotLight(0xffe6b9, 58, 8, 1.0, .85, 2);
    l.position.set(x, 3.0, .2); l.target.position.set(x * .6, .2, -.2); l.castShadow = x === -1 || x === 1;
    if (l.castShadow) l.shadow.mapSize.set(768, 768);
    bunker.add(l, l.target); bunkerSpots.push(l);
  }
  const cctvWarm = new THREE.PointLight(0xff9f52, 13, 4.4, 2); cctvWarm.position.set(3.1, 1.45, -1.8); bunker.add(cctvWarm);
  const bedFill = new THREE.PointLight(0xe5c68e, 7, 3.8, 2); bedFill.position.set(-3.5, 1.45, 1.4); bunker.add(bedFill);

  // --- Day/night/weather and floodlights ---
  const hemi = new THREE.HemisphereLight(0xc5ced0, 0x2b302a, 1.0);
  const ambient = new THREE.AmbientLight(0x707a78, .20);
  const sun = new THREE.DirectionalLight(0xe9e1cf, 1.35); sun.castShadow = true; sun.shadow.mapSize.set(1536, 1536); sun.shadow.camera.left = -32; sun.shadow.camera.right = 32; sun.shadow.camera.top = 32; sun.shadow.camera.bottom = -32;
  const moon = new THREE.DirectionalLight(0x94afc4, .26);
  outside.add(hemi, ambient, sun, moon);
  const yardLights = [];
  for (const [x,z] of [[4.5,-2],[-13,-8],[13,10]]) {
    const s = new THREE.SpotLight(0xe5edf0, 0, 35, .56, .58, 1.8); s.position.set(x, 7.5, z); s.target.position.set(x * .3, 0, z * .3); outside.add(s, s.target); yardLights.push(s);
  }
  const gateLamp = new THREE.PointLight(0xffaf57, 0, 14, 2); gateLamp.position.set(0, 3, 14); outside.add(gateLamp);
  let timeHours = 14.53, weather = 'OVERCAST', weatherTimer = 0, elapsed = 0;
  const modes = ['OVERCAST','RAIN','CLEAR','STORM']; let modeIndex = 0;
  const dayBg = new THREE.Color(0x7a8587), nightBg = new THREE.Color(0x0b1217), fogDay = new THREE.Color(0x6d7677), fogNight = new THREE.Color(0x11191c), tmp = new THREE.Color();
  function updateEnvironment(dt) {
    timeHours = (timeHours + dt * (24 / (14 * 60))) % 24;
    weatherTimer += dt;
    if (weatherTimer > 95) { weatherTimer = 0; modeIndex = (modeIndex + 1) % modes.length; weather = modes[modeIndex]; }
    const angle = ((timeHours - 6) / 24) * Math.PI * 2;
    const elev = Math.sin(angle); const day = THREE.MathUtils.clamp((elev + .18) / .42, 0, 1); const night = 1 - day;
    const cloudy = weather !== 'CLEAR';
    tmp.copy(nightBg).lerp(dayBg, day); if (cloudy) tmp.multiplyScalar(.84); outside.background.copy(tmp);
    tmp.copy(fogNight).lerp(fogDay, day); if (cloudy) tmp.multiplyScalar(.90); outside.fog.color.copy(tmp); outside.fog.density = weather === 'STORM' ? .026 : weather === 'RAIN' ? .020 : cloudy ? .013 : .008;
    sun.position.set(Math.cos(angle) * 30, Math.max(2, elev * 34), Math.sin(angle) * 28); moon.position.copy(sun.position).multiplyScalar(-1); moon.position.y = Math.max(7, -elev * 30);
    sun.intensity = day * (cloudy ? .95 : 1.75); moon.intensity = night * .42; hemi.intensity = .24 + day * (cloudy ? .80 : 1.2); ambient.intensity = .10 + day * .24;
    yardLights.forEach((l) => l.intensity = 110 * night); gateLamp.intensity = 42 * night;
  }

  // --- CCTV cameras: same exterior world as player ---
  const cctvCameras = [new THREE.PerspectiveCamera(48,16/9,.1,180),new THREE.PerspectiveCamera(50,16/9,.1,180),new THREE.PerspectiveCamera(48,16/9,.1,180),new THREE.PerspectiveCamera(42,16/9,.1,200)];
  const camTargets = [new THREE.Vector3(0,1.4,15),new THREE.Vector3(-7,1,-3),new THREE.Vector3(16,1,2),new THREE.Vector3(-7,1,-4)];
  cctvCameras[0].position.set(0,4.4,8); cctvCameras[1].position.set(-13,4.2,5); cctvCameras[2].position.set(15,4,-9); cctvCameras[3].position.set(-16,10,15); cctvCameras.forEach((c,i) => c.lookAt(camTargets[i]));
  const cctvBaseRot = cctvCameras.map((c) => c.rotation.clone());

  // Smart interactions: ray first, forgiving cone second.
  const ray = new THREE.Raycaster(); const cp = new THREE.Vector3(), cd = new THREE.Vector3(), tp = new THREE.Vector3(), to = new THREE.Vector3(), box = new THREE.Box3();
  function nearestInteraction(world) {
    const candidates = interactions.filter((o) => o.visible !== false && o.userData.interaction?.world === world);
    ray.far = 4.4; ray.setFromCamera({x:0,y:0}, camera);
    const hits = ray.intersectObjects(candidates, true);
    if (hits.length) { let o = hits[0].object; while (o && !o.userData.interaction) o = o.parent; if (o?.userData.interaction) return o.userData.interaction; }
    camera.getWorldPosition(cp); camera.getWorldDirection(cd); let best = null, score = 999;
    for (const o of candidates) {
      box.setFromObject(o); box.isEmpty() ? o.getWorldPosition(tp) : box.getCenter(tp); to.copy(tp).sub(cp); const d = to.length(); if (d > 3.8) continue; to.normalize(); const f = cd.dot(to); if (f < (d < 1.4 ? -.15 : d < 2.3 ? .05 : .28)) continue; const s = d + (1-f)*1.8; if (s < score) { score=s; best=o.userData.interaction; }
    }
    return best;
  }

  function setWorld(world) {
    if (player.parent) player.parent.remove(player);
    if (world === 'outside') { outside.add(player); player.position.set(-7,0,-1.0); }
    else { bunker.add(player); player.position.set(0,0,2.7); }
  }
  function blocked(world, x, z) {
    if (world === 'bunker') {
      if (x < -4.55 || x > 4.55 || z < -3.15 || z > 3.15) return true;
      if (x < -2.4 && z > .2) return true;
      if (x > 3.75 && z > 1.25) return true;
      return false;
    }
    return x < -18.5 || x > 18.5 || z < -17.5 || z > 14.5;
  }
  function setArmed(v) { weaponView.visible = v; rifleDisplay.visible = !v; }
  function playGun(kind) { if (kind === 'reload') weaponView.rotation.z = -.06; }

  const flashlight = new THREE.SpotLight(0xe9eee7, 64, 22, .34, .50, 1.7); flashlight.position.set(.08,-.08,.05); flashlight.visible=false; const ft = new THREE.Object3D(); ft.position.set(0,-.08,-6); camera.add(flashlight,ft); flashlight.target=ft;
  function setFlashlight(v) { flashlight.visible = !!v; }

  function update(dt) {
    elapsed += dt; updateEnvironment(dt);
    if (doorLeaf) doorLeaf.position.x = THREE.MathUtils.damp(doorLeaf.position.x, doorClosedX + (doorOpen ? 2.35 : 0), 4.0, dt);
    if (gateL && gateR) { gateL.position.x = THREE.MathUtils.damp(gateL.position.x, gateOpen ? -2.35 : -1.25, 4, dt); gateR.position.x = THREE.MathUtils.damp(gateR.position.x, gateOpen ? 2.35 : 1.25, 4, dt); }
    bunkerSpots.forEach((l,i) => l.intensity = 56 + Math.sin(elapsed*.32+i)*1.0);
    for (const w of wildlife) {
      if (!w.userData.alive) continue;
      const u=w.userData, a=elapsed*u.speed+u.phase; const ox=w.position.x, oz=w.position.z; w.position.x=u.cx+Math.cos(a)*u.rx; w.position.z=u.cz+Math.sin(a)*u.rz; const dx=w.position.x-ox,dz=w.position.z-oz; if (Math.abs(dx)+Math.abs(dz)>.0001) w.rotation.y=Math.atan2(-dz,dx);
      const gait=Math.sin(elapsed*(u.kind==='rabbit'?8:5)+u.phase); (u.legs||[]).forEach((l,i)=>l.rotation.y=gait*(i%2?-.22:.22)); (u.ears||[]).forEach((e,i)=>e.rotation.x=Math.sin(elapsed*2+i)*.05); if(u.kind==='rabbit') w.position.y=u.baseY+Math.max(0,gait)*.05;
    }
    for (const z of zombies) {
      const u=z.userData; z.visible=elapsed>=u.activeAt; if(!z.visible||!u.alive) continue; u.t+=dt*u.speed*u.dir; if(u.t>1){u.t=1;u.dir=-1}else if(u.t<0){u.t=0;u.dir=1}; z.position.x=THREE.MathUtils.lerp(u.pathA[0],u.pathB[0],u.t); z.position.z=THREE.MathUtils.lerp(u.pathA[1],u.pathB[1],u.t); z.rotation.y=Math.atan2(-(u.pathB[1]-u.pathA[1])*u.dir,(u.pathB[0]-u.pathA[0])*u.dir); z.rotation.z=Math.sin(elapsed*3+u.t*4)*.018;
    }
    weaponView.rotation.z = THREE.MathUtils.damp(weaponView.rotation.z,0,10,dt);
  }

  return {
    bunker,outside,player,camera,interactions,wildlife,zombies,cctvCameras,cctvBaseRot,weaponView,
    blocked,nearestInteraction,setWorld,setArmed,playGun,update,setFlashlight,
    doorOpen:()=>doorOpen,
    getEnvironmentStatus:()=>({timeHours,weather,isNight:timeHours<6.5||timeHours>19.5}),
    getExposure:(world)=>world==='bunker'?.82:((timeHours<6.5||timeHours>19.5)?1.02:.90),
  };
}

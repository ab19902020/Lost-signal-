import * as THREE from 'three';
import { cloneGLTF, findNamed } from './assets.js';
import { ColliderSet } from './physics.js';

// V3 WORLD RULE:
// No visible architecture/props are authored with Three.js geometry.
// Three.js geometry below is limited to particles/effects. All physical world
// objects are Blender-authored GLBs loaded through assets.js.
export function createGameWorld(assets) {
  const bunker = new THREE.Scene();
  bunker.background = new THREE.Color(0x030504);
  bunker.fog = new THREE.FogExp2(0x050807, 0.019);

  const outside = new THREE.Scene();
  outside.background = new THREE.Color(0x06090a);
  outside.fog = new THREE.FogExp2(0x0b1010, 0.020);

  const player = new THREE.Group();
  const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.035, 180);
  camera.rotation.order = 'YXZ';
  camera.position.set(0, 1.67, 0);
  player.add(camera);
  player.position.set(0, 0, 5.0);
  bunker.add(player);

  const interactions = [];
  const wildlife = [];
  const zombies = [];
  const colliders = {
    bunker: new ColliderSet({ minX: -6.55, maxX: 6.55, minZ: -6.85, maxZ: 6.85 }),
    outside: new ColliderSet({ minX: -19.2, maxX: 19.2, minZ: -26.0, maxZ: 17.2 }),
  };
  const bunkerLights = [];

  function addInteraction(object, name, world, onUse) {
    object.userData.interaction = { name, world, onUse };
    interactions.push(object);
  }

  // Collision comes from the placed Blender geometry itself, so props can never
  // drift away from their hand-typed blocking rectangle again.
  function place(gltf, parent, pos, rot = [0,0,0], scale = 1, options = {}) {
    const root = cloneGLTF(gltf);
    root.position.set(...pos);
    root.rotation.set(...rot);
    root.scale.setScalar(scale);
    parent.add(root);
    const world = options.world ?? (parent === outside ? 'outside' : 'bunker');
    if (options.collide !== false && colliders[world]) {
      colliders[world].addObject(root, {
        shrink: options.shrink ?? 0.04,
        climbable: options.climbable ?? false,
      });
    }
    return root;
  }

  // ---------------------------------------------------------------------------
  // BUNKER — 100% BLENDER VISIBLE GEOMETRY
  // ---------------------------------------------------------------------------
  place(assets.environment, bunker, [0,0,0], [0,0,0], 1, { collide: false });

  // Lighting is runtime because it is an effect, not visible geometry.
  bunker.add(new THREE.HemisphereLight(0x52655c, 0x040504, 0.42));
  bunker.add(new THREE.AmbientLight(0x26342d, 0.28));

  const emergency = new THREE.PointLight(0xff2818, 2.5, 8.5, 2.0);
  emergency.position.set(0, 3.35, 6.0);
  bunker.add(emergency);

  const fixturePositions = [[-3.4,-3.6],[3.4,-3.6],[-3.4,2.35],[3.4,2.35]];
  for (const [x,z] of fixturePositions) {
    place(assets.ceilingLight, bunker, [x,3.76,z], [0,0,0], 1, { collide: false });
    const light = new THREE.PointLight(0xd9f0df, 7.5, 8.6, 1.7);
    light.position.set(x,3.40,z);
    light.castShadow = true;
    light.shadow.mapSize.set(768,768);
    light.shadow.bias = -0.00035;
    bunker.add(light);
    bunkerLights.push(light);
  }

  // Industrial service systems
  place(assets.pipes, bunker, [6.25,.14,-4.8], [0,Math.PI,0]);
  place(assets.pipes, bunker, [-6.25,.14,1.8], [0,0,0]);

  const ventilation = place(assets.ventilation, bunker, [5.20,0,-4.85], [0,-Math.PI/2,0], .88);
  addInteraction(ventilation,'AIR FILTRATION UNIT','bunker',()=>window.dispatchEvent(new CustomEvent('lostsignal:generator')));

  place(assets.electrical, bunker, [-4.85,.10,6.88], [0,0,0], .90);
  place(assets.lockers, bunker, [-2.55,0,6.55], [0,0,0], .84);
  place(assets.bench, bunker, [2.35,0,6.30], [0,Math.PI,0], .88);

  // Low crates and cans can be stepped onto rather than walked into.
  place(assets.clutter, bunker, [4.45,0,2.80], [0,-Math.PI/2,0], .92, { climbable: true });
  place(assets.statusBoard, bunker, [0,1.15,7.17], [0,Math.PI,0], .90, { collide: false });

  // Physical security cameras, all Blender GLBs.
  const bunkerCameraPlacements = [
    [[-5.9,3.15,-6.55],[0,.60,0]],
    [[5.9,3.15,-6.55],[0,-.60,0]],
    [[-5.9,3.15,6.55],[0,2.48,0]],
    [[5.9,3.15,6.55],[0,-2.48,0]],
  ];
  bunkerCameraPlacements.forEach(([p,r])=>place(assets.wallCamera,bunker,p,r,.72,{ collide: false }));

  // Desk and workstation
  const desk = place(assets.desk, bunker, [2.5,0,-3.2]);
  const terminalScreen = findNamed(desk,'Terminal_Screen') || desk;
  addInteraction(terminalScreen,'COMPUTER TERMINAL','bunker',()=>window.dispatchEvent(new CustomEvent('lostsignal:computer')));

  const radio = place(assets.radio, bunker, [3.55,1.10,-2.85], [0,0,0], .92, { collide: false });
  addInteraction(radio,'SHORTWAVE RADIO','bunker',()=>window.dispatchEvent(new CustomEvent('lostsignal:radio')));

  // CCTV console and operator chair
  const cctvConsole = place(assets.cctv, bunker, [-3.15,0,-3.18]);
  addInteraction(cctvConsole,'CCTV SURVEILLANCE','bunker',()=>window.dispatchEvent(new CustomEvent('lostsignal:cctv')));
  place(assets.chair, bunker, [-3.15,0,-1.45], [0,0,0], 1, { climbable: true });

  // Bed and survival storage
  place(assets.bed, bunker, [-4.75,0,4.10], [0,0,0], 1, { climbable: true });
  place(assets.storage, bunker, [5.90,0,1.45], [0,Math.PI/2,0], .92);
  place(assets.storage, bunker, [5.90,0,-1.10], [0,Math.PI/2,0], .92);

  // Generator
  const generator = place(assets.generator, bunker, [4.60,0,4.95], [0,0,0], .90);
  addInteraction(generator,'DIESEL GENERATOR','bunker',()=>window.dispatchEvent(new CustomEvent('lostsignal:generator')));

  // Gun vault + rifle display
  const vault = place(assets.vault, bunker, [-6.38,0,.60], [0,Math.PI/2,0]);
  const vaultDoor = findNamed(vault,'GunVault_Door');
  const rifleDisplay = place(assets.rifle, vault, [0.0,1.52,-.30], [0,0,-.08], .80, { collide: false });
  let vaultOpen = false;
  addInteraction(vault,'GUN VAULT','bunker',()=>{
    if (!vaultOpen) {
      vaultOpen = true;
      window.dispatchEvent(new CustomEvent('lostsignal:vaultopen'));
    } else {
      window.dispatchEvent(new CustomEvent('lostsignal:takegun'));
    }
  });

  // Blast door + fully Blender-built access control panel. The leaf slides
  // inside the wall line, so the room bounds already keep the player out of it.
  const blast = place(assets.blastDoor, bunker, [0,0,-7.30], [0,0,0], 1, { collide: false });
  const blastLeaf = findNamed(blast,'BlastDoor_Door');
  const wheel = findNamed(blast,'DoorWheel_Rim') || blast;
  let doorOpen = false;
  addInteraction(wheel,'BLAST DOOR','bunker',()=>{
    doorOpen = !doorOpen;
    window.dispatchEvent(new CustomEvent('lostsignal:door',{detail:{open:doorOpen}}));
  });

  const exitPanel = place(assets.accessControl, bunker, [-1.82,.60,-6.96], [0,0,0], .62, { collide: false });
  addInteraction(exitPanel,'SURFACE ACCESS','bunker',()=>window.dispatchEvent(new CustomEvent('lostsignal:surface',{detail:{allowed:doorOpen}})));

  // Dust is an effect and is intentionally generated in Three.js.
  const dustCount = 300;
  const dustGeo = new THREE.BufferGeometry();
  const dustPositions = new Float32Array(dustCount*3);
  for (let i=0;i<dustCount;i++) {
    dustPositions[i*3]=(Math.random()-.5)*13;
    dustPositions[i*3+1]=.3+Math.random()*3.5;
    dustPositions[i*3+2]=(Math.random()-.5)*14;
  }
  dustGeo.setAttribute('position',new THREE.BufferAttribute(dustPositions,3));
  const dust = new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0xd7dfd9,size:.018,transparent:true,opacity:.19,depthWrite:false}));
  bunker.add(dust);

  // ---------------------------------------------------------------------------
  // EXTERIOR — ALSO BLENDER VISIBLE GEOMETRY
  // ---------------------------------------------------------------------------
  place(assets.exteriorGround, outside, [0,0,0], [0,0,0], 1, { collide: false });
  place(assets.exteriorEntrance, outside, [0,0,-17], [0,0,0], 1, { shrink: 0.12 });

  outside.add(new THREE.HemisphereLight(0x405155,0x050706,.52));
  const moon = new THREE.DirectionalLight(0xa6bdc9,2.65);
  moon.position.set(-25,28,12);
  moon.castShadow = true;
  moon.shadow.mapSize.set(1024,1024);
  moon.shadow.camera.left=-45;
  moon.shadow.camera.right=45;
  moon.shadow.camera.top=45;
  moon.shadow.camera.bottom=-45;
  outside.add(moon);

  // Reusable 4m Blender fence modules form the perimeter.
  for (let x=-18; x<=18; x+=4) {
    place(assets.fence,outside,[x,0,-27],[0,0,0]);
  }
  for (let z=-23; z<=15; z+=4) {
    place(assets.fence,outside,[-20,0,z],[0,Math.PI/2,0]);
    place(assets.fence,outside,[20,0,z],[0,Math.PI/2,0]);
  }
  for (let x=-18; x<=-6; x+=4) place(assets.fence,outside,[x,0,18],[0,0,0]);
  for (let x=6; x<=18; x+=4) place(assets.fence,outside,[x,0,18],[0,0,0]);
  place(assets.gate,outside,[0,0,18],[0,0,0]);

  // Exterior lighting fixtures are Blender models; only emitted light is runtime.
  const floodPositions=[[-14,0,-20],[14,0,-20],[-14,0,11],[14,0,11]];
  floodPositions.forEach(([x,y,z])=>{
    place(assets.floodlight,outside,[x,y,z],[0,0,0],1,{ shrink: 0.1 });
    const l=new THREE.SpotLight(0xdbeaf0,4.5,34,.62,.45,1.6);
    l.position.set(x,4.35,z);
    l.target.position.set(x*.35,0,z*.35);
    outside.add(l,l.target);
  });

  // Exterior Blender dressing
  [[-16,0,-6,0],[16,0,1,1.1],[-12,0,13,-.5],[11,0,-22,.7]].forEach(([x,y,z,r])=>place(assets.deadTree,outside,[x,y,z],[0,r,0],.9));
  [[-8,0,-9,0],[8,0,-8,.2],[-7,0,8,-.1],[7,0,7,.1]].forEach(([x,y,z,r])=>place(assets.barrier,outside,[x,y,z],[0,r,0],.9));
  [[-11,0,-14,0],[11,0,-14,.7],[-15,0,5,.2],[13,0,12,-.5],[4,0,2,.4]].forEach(([x,y,z,r])=>place(assets.rubble,outside,[x,y,z],[0,r,0],1,{ climbable: true }));

  // Surface access uses the same Blender keypad asset.
  const returnPanel = place(assets.accessControl,outside,[-2.15,.55,-13.55],[0,0,0],.64,{ collide: false });
  addInteraction(returnPanel,'RETURN TO SHELTER','outside',()=>window.dispatchEvent(new CustomEvent('lostsignal:return')));

  // Rain is an atmospheric effect, not physical world geometry.
  const rainCount=320;
  const rainGeo=new THREE.PlaneGeometry(.012,.44);
  const rainMat=new THREE.MeshBasicMaterial({color:0xaec1cb,transparent:true,opacity:.16,depthWrite:false,side:THREE.DoubleSide});
  const rain=new THREE.InstancedMesh(rainGeo,rainMat,rainCount);
  const rainData=[];
  const rainMatrix=new THREE.Matrix4();
  for(let i=0;i<rainCount;i++){
    const p=new THREE.Vector3((Math.random()-.5)*55,3+Math.random()*18,-30+Math.random()*58);
    rainData.push({p,v:7+Math.random()*7});
    rainMatrix.makeRotationZ(-.08);
    rainMatrix.setPosition(p);
    rain.setMatrixAt(i,rainMatrix);
  }
  rain.frustumCulled=false;
  outside.add(rain);

  // Blender rifle as first-person viewmodel.
  const weaponView = new THREE.Group();
  camera.add(weaponView);
  weaponView.position.set(.32,-.38,-.72);
  weaponView.rotation.set(-.04,-.08,0);
  weaponView.visible=false;
  const rifle = cloneGLTF(assets.rifle);
  rifle.rotation.set(0,Math.PI,0);
  rifle.scale.setScalar(.78);
  rifle.position.set(.15,-.02,0);
  weaponView.add(rifle);

  // CCTV cameras look at the Blender exterior scene.
  const cctvCameras=[
    new THREE.PerspectiveCamera(48,16/9,.1,160),
    new THREE.PerspectiveCamera(50,16/9,.1,160),
    new THREE.PerspectiveCamera(48,16/9,.1,160),
    new THREE.PerspectiveCamera(42,16/9,.1,190),
  ];
  const targets=[
    new THREE.Vector3(0,1.5,18),
    new THREE.Vector3(20,1.6,-4),
    new THREE.Vector3(2,1.1,-5),
    new THREE.Vector3(0,1,-4),
  ];
  cctvCameras[0].position.set(0,4.2,-12);
  cctvCameras[1].position.set(17,4.5,10);
  cctvCameras[2].position.set(-16,4,-10);
  cctvCameras[3].position.set(-18,11,20);
  cctvCameras.forEach((c,i)=>c.lookAt(targets[i]));
  const cctvBaseRot=cctvCameras.map(c=>c.rotation.clone());

  const spawnPoints = {
    bunker: new THREE.Vector3(0,0,-5.4),
    outside: new THREE.Vector3(0,0,-12.15),
  };

  function setWorld(world) {
    if (player.parent) player.parent.remove(player);
    (world==='outside' ? outside : bunker).add(player);
    player.position.copy(spawnPoints[world] || spawnPoints.bunker);
    return player.position;
  }

  function blocked(world,x,z,radius=0.34,feetY=0.35,headY=1.7) {
    const set = colliders[world];
    return set ? set.contains(x,z,radius,feetY,headY) : false;
  }

  function nearestInteraction(world) {
    const ray=new THREE.Raycaster();
    ray.far=2.7;
    ray.setFromCamera({x:0,y:0},camera);
    const candidates=interactions.filter(o=>o.userData.interaction?.world===world);
    const hits=ray.intersectObjects(candidates,true);
    if(!hits.length)return null;
    let o=hits[0].object;
    while(o&&!o.userData.interaction)o=o.parent;
    return o?.userData.interaction||null;
  }

  function setArmed(v) {
    weaponView.visible=v;
    rifleDisplay.visible=!v;
  }

  function playGun(kind) {
    if(kind==='reload') weaponView.rotation.z=-.05;
  }

  let elapsed=0;
  function update(dt) {
    elapsed += dt;
    if (blastLeaf) blastLeaf.position.x = THREE.MathUtils.damp(blastLeaf.position.x,doorOpen?3.55:0,3.4,dt);
    if (vaultDoor) vaultDoor.rotation.y = THREE.MathUtils.damp(vaultDoor.rotation.y,vaultOpen?-1.68:0,5.0,dt);
    dust.rotation.y += dt*.008;

    for(let i=0;i<rainData.length;i++){
      const d=rainData[i];
      d.p.y-=d.v*dt;
      d.p.x-=.85*dt;
      if(d.p.y<.05){
        d.p.y=10+Math.random()*13;
        d.p.x=(Math.random()-.5)*55;
        d.p.z=-30+Math.random()*58;
      }
      rainMatrix.makeRotationZ(-.08);
      rainMatrix.setPosition(d.p);
      rain.setMatrixAt(i,rainMatrix);
    }
    rain.instanceMatrix.needsUpdate=true;

    if(bunkerLights.length && Math.random()<.0015){
      const l=bunkerLights[Math.floor(Math.random()*bunkerLights.length)];
      const v=l.intensity;
      l.intensity=.25;
      setTimeout(()=>l.intensity=v,65);
    }
    emergency.intensity=2.2+Math.sin(elapsed*2.1)*.25;
  }

  return {
    bunker,outside,player,camera,interactions,wildlife,zombies,cctvCameras,cctvBaseRot,
    weaponView,blocked,colliders,spawnPoints,nearestInteraction,setWorld,setArmed,playGun,update,
    bunkerLights,emergency,
    doorOpen:()=>doorOpen,
  };
}

import * as THREE from 'three';
import { cloneGLTF, findNamed } from './assets.js';

export function createGameWorld(assets) {
  const bunker = new THREE.Scene();
  bunker.background = new THREE.Color(0x050807);
  bunker.fog = new THREE.FogExp2(0x050807, 0.025);

  const outside = new THREE.Scene();
  outside.background = new THREE.Color(0x070a0a);
  outside.fog = new THREE.FogExp2(0x101616, 0.018);

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
  const blockers = { bunker: [], outside: [] };
  const mixers = [];
  const bunkerLights = [];

  const tx = assets.textures;
  const concrete = new THREE.MeshStandardMaterial({
    map: tx.concreteColor,
    normalMap: tx.concreteNormal,
    roughnessMap: tx.concreteRoughness,
    roughness: 0.92,
    normalScale: new THREE.Vector2(0.72, 0.72),
    color: 0x777b76,
  });
  const concreteDark = concrete.clone();
  concreteDark.color.setHex(0x424743);
  const plate = new THREE.MeshStandardMaterial({
    map: tx.plateColor,
    normalMap: tx.plateNormal,
    roughnessMap: tx.plateRoughness,
    metalness: 0.58,
    roughness: 0.48,
    normalScale: new THREE.Vector2(1.0, 1.0),
  });
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x0d1210, metalness: 0.82, roughness: 0.36 });
  const steel = new THREE.MeshStandardMaterial({ color: 0x4b5550, metalness: 0.75, roughness: 0.35 });
  const greenGlow = new THREE.MeshStandardMaterial({ color: 0x07150b, emissive: 0x2eff70, emissiveIntensity: 1.8, roughness: 0.35 });

  function mesh(geo, mat, pos, rot = [0,0,0], parent = bunker, shadows = true) {
    const o = new THREE.Mesh(geo, mat);
    o.position.set(...pos);
    o.rotation.set(...rot);
    o.castShadow = shadows;
    o.receiveShadow = shadows;
    parent.add(o);
    return o;
  }
  const box = (size, pos, mat = steel, rot = [0,0,0], parent = bunker) => mesh(new THREE.BoxGeometry(...size), mat, pos, rot, parent);

  function addInteraction(object, name, world, onUse) {
    object.userData.interaction = { name, world, onUse };
    interactions.push(object);
  }
  function addBlocker(world, x1, x2, z1, z2) { blockers[world].push({ x1, x2, z1, z2 }); }
  function place(gltf, parent, pos, rot = [0,0,0], scale = 1) {
    const root = cloneGLTF(gltf);
    root.position.set(...pos);
    root.rotation.set(...rot);
    root.scale.setScalar(scale);
    parent.add(root);
    return root;
  }

  // --- BUNKER ARCHITECTURE: PBR shell, recesses, floor channels, ceiling ribs ---
  box([14.2,.34,15.2],[0,-.17,0],concreteDark);
  box([14.2,.34,15.2],[0,4.22,0],concreteDark);
  box([.40,4.7,15.2],[-7.1,2,0],concrete);
  box([.40,4.7,15.2],[7.1,2,0],concrete);
  box([14.2,4.7,.40],[0,2,-7.6],concrete);
  box([14.2,4.7,.40],[0,2,7.6],concrete);
  mesh(new THREE.PlaneGeometry(13.0,14.0), plate, [0,.025,0],[-Math.PI/2,0,0]);
  for (let z=-6.8; z<=6.8; z+=2.2) box([13.8,.18,.17],[0,4.0,z],darkMetal);
  for (let x=-6.2; x<=6.2; x+=3.1) box([.13,.16,14.0],[x,3.98,0],darkMetal);

  // floor trench / drainage channels
  box([1.20,.055,12.8],[-5.85,.055,0],darkMetal);
  for (let z=-6.0; z<=6.0; z+=.22) box([1.06,.045,.07],[-5.85,.09,z],steel);

  // cold bounced bunker light + emergency red spill
  bunker.add(new THREE.HemisphereLight(0x64756b,0x090b09,.60));
  bunker.add(new THREE.AmbientLight(0x405049,.42));
  const emergency = new THREE.PointLight(0xff2418,2.3,8,2);
  emergency.position.set(0,3.4,6.0);
  bunker.add(emergency);

  // Blender ceiling fixtures repeated around the room
  const fixturePositions = [[-3.4,-3.5],[3.4,-3.5],[-3.4,2.4],[3.4,2.4]];
  for (const [x,z] of fixturePositions) {
    const fixture = place(assets.ceilingLight,bunker,[x,3.78,z],[0,0,0],1);
    const light = new THREE.PointLight(0xd8f4df,8.2,8.2,1.8);
    light.position.set(x,3.45,z);
    light.castShadow = true;
    light.shadow.mapSize.set(768,768);
    light.shadow.bias = -0.00035;
    bunker.add(light);
    bunkerLights.push(light);
  }

  // Blender pipe clusters
  place(assets.pipes,bunker,[6.25,.15,-4.8],[0,Math.PI,0],1);
  place(assets.pipes,bunker,[-6.25,.15,1.8],[0,0,0],1);

  // Desk and workstation
  const desk = place(assets.desk,bunker,[2.5,0,-3.2],[0,0,0],1);
  const terminalScreen = findNamed(desk,'Terminal_Screen') || desk;
  addInteraction(terminalScreen,'COMPUTER TERMINAL','bunker',()=>window.dispatchEvent(new CustomEvent('lostsignal:computer')));
  addBlocker('bunker',0.0,4.8,-4.2,-2.1);

  // Radio is now its own Blender asset
  const radio = place(assets.radio,bunker,[3.55,1.10,-2.85],[0,0,0],.92);
  addInteraction(radio,'SHORTWAVE RADIO','bunker',()=>window.dispatchEvent(new CustomEvent('lostsignal:radio')));

  // CCTV console and operator chair
  const cctvConsole = place(assets.cctv,bunker,[-3.15,0,-3.18],[0,0,0],1);
  addInteraction(cctvConsole,'CCTV SURVEILLANCE','bunker',()=>window.dispatchEvent(new CustomEvent('lostsignal:cctv')));
  place(assets.chair,bunker,[-3.15,0,-1.45],[0,0,0],1);
  addBlocker('bunker',-5.5,-.6,-4.25,-2.0);

  // Bed and survival storage
  place(assets.bed,bunker,[-4.75,0,4.10],[0,0,0],1);
  addBlocker('bunker',-5.9,-3.5,2.0,6.45);
  place(assets.storage,bunker,[5.90,0,2.45],[0,Math.PI/2,0],1);
  place(assets.storage,bunker,[5.90,0,-.40],[0,Math.PI/2,0],1);
  addBlocker('bunker',5.0,6.7,-2.0,4.0);

  // Blender generator
  const generator = place(assets.generator,bunker,[4.80,0,5.0],[0,0,0],1);
  addInteraction(generator,'DIESEL GENERATOR','bunker',()=>window.dispatchEvent(new CustomEvent('lostsignal:generator')));
  addBlocker('bunker',3.8,6.35,4.0,6.1);

  // Blender gun vault + Blender rifle display
  const vault = place(assets.vault,bunker,[-6.40,0,.60],[0,Math.PI/2,0],1);
  const vaultDoor = findNamed(vault,'GunVault_Door');
  const rifleDisplay = place(assets.rifle,vault,[0.0,1.52,-.30],[0,0,-.08],.80);
  let vaultOpen = false;
  addInteraction(vault,'GUN VAULT','bunker',()=>{
    if (!vaultOpen) {
      vaultOpen = true;
      window.dispatchEvent(new CustomEvent('lostsignal:vaultopen'));
    } else {
      window.dispatchEvent(new CustomEvent('lostsignal:takegun'));
    }
  });
  addBlocker('bunker',-6.75,-5.55,-.25,1.45);

  // Blender blast door
  const blast = place(assets.blastDoor,bunker,[0,0,-7.30],[0,0,0],1);
  const blastLeaf = findNamed(blast,'BlastDoor_Door');
  const wheel = findNamed(blast,'DoorWheel_Rim') || blast;
  let doorOpen = false;
  addInteraction(wheel,'BLAST DOOR','bunker',()=>{
    doorOpen = !doorOpen;
    window.dispatchEvent(new CustomEvent('lostsignal:door',{detail:{open:doorOpen}}));
  });
  const exitPanel = box([.42,.66,.12],[-1.82,1.26,-6.98],darkMetal);
  box([.17,.17,.03],[-1.82,1.39,-6.91],greenGlow);
  addInteraction(exitPanel,'SURFACE ACCESS','bunker',()=>window.dispatchEvent(new CustomEvent('lostsignal:surface',{detail:{allowed:doorOpen}})));

  // Dust motes help sell the lighting volume without costly volumetrics
  const dustCount = 260;
  const dustGeo = new THREE.BufferGeometry();
  const dustPositions = new Float32Array(dustCount*3);
  for (let i=0;i<dustCount;i++) {
    dustPositions[i*3]=(Math.random()-.5)*13;
    dustPositions[i*3+1]=.3+Math.random()*3.5;
    dustPositions[i*3+2]=(Math.random()-.5)*14;
  }
  dustGeo.setAttribute('position',new THREE.BufferAttribute(dustPositions,3));
  const dust = new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0xd7dfd9,size:.018,transparent:true,opacity:.20,depthWrite:false}));
  bunker.add(dust);

  // --- OUTSIDE: intentionally lightweight for this pass; no bad free creatures are loaded. ---
  mesh(new THREE.PlaneGeometry(220,220),new THREE.MeshStandardMaterial({color:0x202721,roughness:.98}),[0,0,0],[-Math.PI/2,0,0],outside);
  mesh(new THREE.PlaneGeometry(11,50),new THREE.MeshStandardMaterial({color:0x292c2a,roughness:.90}),[0,.025,-4],[-Math.PI/2,0,0],outside);
  outside.add(new THREE.HemisphereLight(0x3c4b4c,0x080a08,.58));
  const moon = new THREE.DirectionalLight(0x9fb8c9,2.8);
  moon.position.set(-25,28,12);
  moon.castShadow = true;
  moon.shadow.mapSize.set(1024,1024);
  moon.shadow.camera.left=-45;moon.shadow.camera.right=45;moon.shadow.camera.top=45;moon.shadow.camera.bottom=-45;
  outside.add(moon);

  // bunker entrance structure
  box([10,3.2,7],[0,1.6,-17],concrete,[0,0,0],outside);
  const returnPanel = box([.48,.72,.12],[-2.2,1.28,-13.28],darkMetal,[0,0,0],outside);
  box([.18,.18,.03],[-2.2,1.42,-13.20],greenGlow,[0,0,0],outside);
  addInteraction(returnPanel,'RETURN TO SHELTER','outside',()=>window.dispatchEvent(new CustomEvent('lostsignal:return')));
  addBlocker('outside',-5.4,5.4,-21,-13.1);

  // perimeter fence silhouette; Blender exterior kit will replace this in the next pass
  function fencePanel(x1,z1,x2,z2){
    const dx=x2-x1,dz=z2-z1,len=Math.hypot(dx,dz),ang=Math.atan2(dx,dz),steps=Math.ceil(len/3);
    for(let i=0;i<=steps;i++){
      const t=i/steps;
      const post=mesh(new THREE.CylinderGeometry(.055,.06,2.7,10),steel,[x1+dx*t,1.35,z1+dz*t],[0,0,0],outside);
      post.castShadow=true;
    }
    for(const y of [.28,1.36,2.54]) box([.045,.045,len],[(x1+x2)/2,y,(z1+z2)/2],steel,[0,ang,0],outside);
  }
  fencePanel(-20,-27,20,-27);fencePanel(-20,-27,-20,18);fencePanel(20,-27,20,18);fencePanel(-20,18,-4.5,18);fencePanel(4.5,18,20,18);

  // rain for CCTV atmosphere
  const rainCount=300;
  const rainGeo=new THREE.PlaneGeometry(.012,.44);
  const rainMat=new THREE.MeshBasicMaterial({color:0xaec1cb,transparent:true,opacity:.16,depthWrite:false,side:THREE.DoubleSide});
  const rain=new THREE.InstancedMesh(rainGeo,rainMat,rainCount);
  const rainData=[],rainMatrix=new THREE.Matrix4();
  for(let i=0;i<rainCount;i++){
    const p=new THREE.Vector3((Math.random()-.5)*55,3+Math.random()*18,-30+Math.random()*58);
    rainData.push({p,v:7+Math.random()*7});
    rainMatrix.makeRotationZ(-.08);rainMatrix.setPosition(p);rain.setMatrixAt(i,rainMatrix);
  }
  rain.frustumCulled=false;outside.add(rain);

  // Blender rifle as first-person viewmodel
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

  const cctvCameras=[new THREE.PerspectiveCamera(48,16/9,.1,160),new THREE.PerspectiveCamera(50,16/9,.1,160),new THREE.PerspectiveCamera(48,16/9,.1,160),new THREE.PerspectiveCamera(42,16/9,.1,190)];
  const targets=[new THREE.Vector3(0,1.5,18),new THREE.Vector3(20,1.6,-4),new THREE.Vector3(2,1.1,-5),new THREE.Vector3(0,1,-4)];
  cctvCameras[0].position.set(0,4.2,-12);cctvCameras[1].position.set(17,4.5,10);cctvCameras[2].position.set(-16,4,-10);cctvCameras[3].position.set(-18,11,20);cctvCameras.forEach((c,i)=>c.lookAt(targets[i]));
  const cctvBaseRot=cctvCameras.map(c=>c.rotation.clone());

  function setWorld(world) {
    if (player.parent) player.parent.remove(player);
    if (world==='outside') { outside.add(player); player.position.set(0,0,-12.15); }
    else { bunker.add(player); player.position.set(0,0,-6.0); }
  }
  function blocked(world,x,z) {
    if (world==='bunker' && (x<-6.5||x>6.5||z<-6.8||z>6.8)) return true;
    if (world==='outside' && (x<-19.1||x>19.1||z<-25.9||z>17.1)) return true;
    return blockers[world].some(b=>x>b.x1&&x<b.x2&&z>b.z1&&z<b.z2);
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
    // Blender rifle is static for this pass; recoil is handled by main.js.
    if(kind==='reload') weaponView.rotation.z=-.05;
  }

  let elapsed=0;
  function update(dt,world) {
    elapsed += dt;
    if (blastLeaf) blastLeaf.position.x = THREE.MathUtils.damp(blastLeaf.position.x,doorOpen?3.55:0,3.4,dt);
    if (vaultDoor) vaultDoor.rotation.y = THREE.MathUtils.damp(vaultDoor.rotation.y,vaultOpen?-1.68:0,5.0,dt);
    dust.rotation.y += dt*.008;
    for(let i=0;i<rainData.length;i++){
      const d=rainData[i];
      d.p.y-=d.v*dt;d.p.x-=.85*dt;
      if(d.p.y<.05){d.p.y=10+Math.random()*13;d.p.x=(Math.random()-.5)*55;d.p.z=-30+Math.random()*58;}
      rainMatrix.makeRotationZ(-.08);rainMatrix.setPosition(d.p);rain.setMatrixAt(i,rainMatrix);
    }
    rain.instanceMatrix.needsUpdate=true;
    if(Math.random()<.0015){const l=bunkerLights[Math.floor(Math.random()*bunkerLights.length)],v=l.intensity;l.intensity=.25;setTimeout(()=>l.intensity=v,65);}
    emergency.intensity=2.1+Math.sin(elapsed*2.1)*.25;
  }

  return {
    bunker,outside,player,camera,interactions,wildlife,zombies,cctvCameras,cctvBaseRot,
    weaponView,blocked,nearestInteraction,setWorld,setArmed,playGun,update,
    doorOpen:()=>doorOpen,
  };
}

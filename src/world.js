import * as THREE from 'three';
import { cloneGLTF, fitToHeight, pickClip, createMixer } from './assets.js';

export function createGameWorld(assets) {
  const bunker = new THREE.Scene();
  bunker.background = new THREE.Color(0x111613);
  bunker.fog = new THREE.Fog(0x111613, 10, 34);

  const outside = new THREE.Scene();
  outside.background = new THREE.Color(0x35413f);
  outside.fog = new THREE.Fog(0x46514e, 25, 130);

  const player = new THREE.Group();
  const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.04, 180);
  camera.rotation.order = 'YXZ';
  camera.position.set(0, 1.67, 0);
  player.add(camera);
  player.position.set(0, 0, 5.1);
  bunker.add(player);

  const interactions = [];
  const wildlife = [];
  const zombies = [];
  const mixers = [];
  const blockers = { bunker: [], outside: [] };

  const tx = assets.textures;
  const concrete = new THREE.MeshStandardMaterial({ map: tx.concreteColor, normalMap: tx.concreteNormal, roughnessMap: tx.concreteRoughness, roughness: 0.9, normalScale: new THREE.Vector2(0.58, 0.58) });
  const concreteDark = concrete.clone(); concreteDark.color.setHex(0x707670);
  const plate = new THREE.MeshStandardMaterial({ map: tx.plateColor, normalMap: tx.plateNormal, roughnessMap: tx.plateRoughness, metalness: 0.48, roughness: 0.55, normalScale: new THREE.Vector2(0.9, 0.9) });
  const steel = new THREE.MeshStandardMaterial({ color: 0x555f59, metalness: 0.72, roughness: 0.38 });
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x111613, metalness: 0.78, roughness: 0.45 });
  const greenPaint = new THREE.MeshStandardMaterial({ color: 0x2d4935, metalness: 0.3, roughness: 0.66 });
  const redPaint = new THREE.MeshStandardMaterial({ color: 0x762721, metalness: 0.22, roughness: 0.65 });
  const wood = new THREE.MeshStandardMaterial({ color: 0x573923, roughness: 0.74 });
  const fabric = new THREE.MeshStandardMaterial({ color: 0x4c5850, roughness: 0.95 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x121513, roughness: 0.95 });
  const greenGlow = new THREE.MeshStandardMaterial({ color: 0x102116, emissive: 0x4cff7e, emissiveIntensity: 1.7, roughness: 0.4 });
  const amberGlow = new THREE.MeshStandardMaterial({ color: 0x2b1c08, emissive: 0xffa431, emissiveIntensity: 1.45, roughness: 0.4 });
  const redGlow = new THREE.MeshStandardMaterial({ color: 0x260706, emissive: 0xff3a2e, emissiveIntensity: 1.5, roughness: 0.4 });

  function mesh(geo, mat, pos, rot = [0,0,0], parent = bunker, shadow = true) {
    const o = new THREE.Mesh(geo, mat);
    o.position.set(...pos); o.rotation.set(...rot);
    o.castShadow = shadow; o.receiveShadow = shadow;
    parent.add(o); return o;
  }
  const box = (size, pos, mat = steel, rot = [0,0,0], parent = bunker) => mesh(new THREE.BoxGeometry(...size), mat, pos, rot, parent);
  const cyl = (r1, r2, h, pos, mat = steel, rot = [0,0,0], parent = bunker, seg = 20) => mesh(new THREE.CylinderGeometry(r1,r2,h,seg), mat, pos, rot, parent);
  const sphere = (r, pos, mat, parent = bunker, sx = 20, sy = 14) => mesh(new THREE.SphereGeometry(r,sx,sy), mat, pos, [0,0,0], parent);
  function addInteraction(object, name, world, onUse) {
    object.userData.interaction = { name, world, onUse };
    interactions.push(object);
  }
  function addBlocker(world, x1, x2, z1, z2) { blockers[world].push({x1,x2,z1,z2}); }

  // BUNKER SHELL
  box([14,.32,15],[0,-.16,0],concreteDark);
  box([14,.30,15],[0,4.18,0],concreteDark);
  box([.38,4.6,15],[-7,2,0],concrete);
  box([.38,4.6,15],[7,2,0],concrete);
  box([14,4.6,.38],[0,2,-7.5],concrete);
  box([14,4.6,.38],[0,2,7.5],concrete);
  mesh(new THREE.PlaneGeometry(12.7,13.7), plate, [0,.025,0],[-Math.PI/2,0,0],bunker);
  for(let z=-6.7;z<7;z+=2.25) box([13.7,.18,.16],[0,4.0,z],darkMetal);

  bunker.add(new THREE.HemisphereLight(0xb9cec0,0x20231f,1.25));
  bunker.add(new THREE.AmbientLight(0x83998a,.78));
  const bunkerLights=[];
  function stripLight(x,z,intensity=10){
    box([2.55,.13,.46],[x,3.88,z],darkMetal);
    box([2.16,.045,.23],[x,3.78,z],new THREE.MeshStandardMaterial({color:0xe7f1e9,emissive:0xe4fff0,emissiveIntensity:2.4,roughness:.2}));
    const l=new THREE.PointLight(0xdff8e6,intensity,8,1.7);l.position.set(x,3.45,z);l.castShadow=true;l.shadow.mapSize.set(512,512);bunker.add(l);bunkerLights.push(l);
  }
  stripLight(-3.4,-3.4);stripLight(3.4,-3.4);stripLight(-3.4,2.5,9);stripLight(3.4,2.5,9);

  // Industrial pipes
  for(let i=0;i<3;i++) cyl(.065,.065,13.1,[6.55,3.05+i*.25,0],i===0?redPaint:steel,[Math.PI/2,0,0],bunker,12);
  for(const [x,z] of [[-5.9,-4.7],[-5.9,-1.0],[5.85,-4.2]]){
    cyl(.18,.18,2.5,[x,3.4,z],steel,[Math.PI/2,0,0],bunker,20);
    mesh(new THREE.TorusGeometry(.36,.18,12,28,Math.PI/2),steel,[x,3.4,z+1.23],[0,0,0],bunker);
  }

  // MAIN DESK + COMPUTER + RADIO
  const desk = new THREE.Group();desk.position.set(2.5,0,-3.25);bunker.add(desk);
  box([4.3,.17,1.45],[0,1.02,0],wood,[0,0,0],desk);
  box([.16,1.0,1.2],[-1.8,.5,0],darkMetal,[0,0,0],desk);box([.16,1.0,1.2],[1.8,.5,0],darkMetal,[0,0,0],desk);
  box([1.1,.76,1.05],[1.2,.56,0],steel,[0,0,0],desk);
  const monitor = new THREE.Group();monitor.position.set(-.58,1.13,-.18);desk.add(monitor);
  box([1.6,1.03,.16],[0,.56,0],darkMetal,[0,0,0],monitor);
  const computerScreen=box([1.34,.78,.025],[0,.57,.09],greenGlow,[0,0,0],monitor);
  box([.12,.43,.1],[0,-.13,0],darkMetal,[0,0,0],monitor);box([.72,.06,.45],[0,-.34,.04],darkMetal,[0,0,0],monitor);
  addInteraction(computerScreen,'COMPUTER TERMINAL','bunker',()=>window.dispatchEvent(new CustomEvent('lostsignal:computer')));
  box([1.38,.07,.48],[-.62,1.15,.43],darkMetal,[-.08,0,0],desk);
  const radioBody=box([1.2,.55,.52],[1.02,1.42,-.12],greenPaint,[0,0,0],desk);
  box([.48,.22,.025],[.78,1.48,.17],amberGlow,[0,0,0],desk);
  for(let i=0;i<3;i++)cyl(.085,.085,.05,[1.25+i*.22,1.34,.18],darkMetal,[Math.PI/2,0,0],desk,16);
  cyl(.012,.012,1.12,[1.5,2.07,-.12],steel,[0,0,-.12],desk,8);
  addInteraction(radioBody,'SHORTWAVE RADIO','bunker',()=>window.dispatchEvent(new CustomEvent('lostsignal:radio')));
  addBlocker('bunker',0,4.8,-4.2,-2.15);

  // CCTV STATION
  const cctvDesk=new THREE.Group();cctvDesk.position.set(-3.15,0,-3.18);bunker.add(cctvDesk);
  const cctvBase=box([4.3,.17,1.45],[0,1.02,0],darkMetal,[0,0,0],cctvDesk);
  box([.17,1.0,1.2],[-1.75,.5,0],steel,[0,0,0],cctvDesk);box([.17,1.0,1.2],[1.75,.5,0],steel,[0,0,0],cctvDesk);
  for(let i=0;i<4;i++){const x=-.92+(i%2)*1.85,y=1.55+Math.floor(i/2)*1.05;box([1.67,.94,.15],[x,y,-.48],darkMetal,[0,0,0],cctvDesk);box([1.43,.72,.02],[x,y,-.39],greenGlow,[0,0,0],cctvDesk)}
  addInteraction(cctvBase,'CCTV SURVEILLANCE','bunker',()=>window.dispatchEvent(new CustomEvent('lostsignal:cctv')));
  addBlocker('bunker',-5.5,-.6,-4.2,-2.1);

  // Chair at CCTV
  const chair=new THREE.Group();chair.position.set(-3.15,0,-1.4);bunker.add(chair);
  box([1.0,.16,1.0],[0,.76,0],rubber,[0,0,0],chair);box([1.0,1.12,.16],[0,1.38,.43],rubber,[-.12,0,0],chair);cyl(.11,.11,.7,[0,.36,0],darkMetal,[0,0,0],chair,12);

  // Bed
  const bed=new THREE.Group();bed.position.set(-4.75,0,4.15);bunker.add(bed);
  box([2.05,.25,4.2],[0,.43,0],darkMetal,[0,0,0],bed);box([1.9,.28,3.85],[0,.66,0],fabric,[0,0,0],bed);box([1.65,.22,.8],[0,.86,-1.35],new THREE.MeshStandardMaterial({color:0x92978e,roughness:.96}),[0,0,0],bed);
  addBlocker('bunker',-5.9,-3.55,2.0,6.45);

  // Generator
  const generator=new THREE.Group();generator.position.set(4.9,0,5.0);bunker.add(generator);
  const genBody=box([2.7,1.65,1.35],[0,.9,0],greenPaint,[0,0,0],generator);
  box([2.48,.65,.06],[0,1.0,-.71],darkMetal,[0,0,0],generator);
  for(let x=-.95;x<1;x+=.23)box([.095,.5,.03],[x,1.0,-.75],steel,[0,0,0],generator);
  box([.12,.12,.025],[.57,1.43,-.76],greenGlow,[0,0,0],generator);box([.12,.12,.025],[.78,1.43,-.76],amberGlow,[0,0,0],generator);box([.12,.12,.025],[.99,1.43,-.76],redGlow,[0,0,0],generator);
  addInteraction(genBody,'DIESEL GENERATOR','bunker',()=>window.dispatchEvent(new CustomEvent('lostsignal:generator')));
  addBlocker('bunker',4.0,6.45,4.0,6.0);

  // ARMORY / GUN VAULT
  const vault=new THREE.Group();vault.position.set(-6.45,0,.55);vault.rotation.y=Math.PI/2;bunker.add(vault);
  box([1.55,2.75,.72],[0,1.38,0],darkMetal,[0,0,0],vault);box([1.38,2.55,.57],[0,1.38,.02],steel,[0,0,0],vault);
  const vaultDoor=new THREE.Group();vaultDoor.position.set(-.69,0,.37);vault.add(vaultDoor);
  const vaultDoorMesh=box([1.38,2.55,.12],[.69,1.38,0],steel,[0,0,0],vaultDoor);
  cyl(.13,.13,.08,[1.03,1.38,.09],darkMetal,[Math.PI/2,0,0],vaultDoor,18);
  const rifleDisplay=cloneGLTF(assets.rifle);fitToHeight(rifleDisplay,1.0);rifleDisplay.rotation.set(0,Math.PI/2,-.12);rifleDisplay.position.set(-.55,.82,.46);vault.add(rifleDisplay);
  let vaultOpen=false;
  addInteraction(vaultDoorMesh,'GUN VAULT','bunker',()=>{
    if(!vaultOpen){vaultOpen=true;window.dispatchEvent(new CustomEvent('lostsignal:vaultopen'));return}
    window.dispatchEvent(new CustomEvent('lostsignal:takegun'));
  });
  addBlocker('bunker',-6.7,-5.6,-.2,1.4);

  // BLAST DOOR
  box([3.05,3.05,.08],[0,1.52,-7.30],new THREE.MeshStandardMaterial({color:0x050706,roughness:.98}));
  const blast=new THREE.Group();blast.position.set(0,0,-7.28);bunker.add(blast);
  const blastPanel=box([3.5,3.3,.38],[0,1.6,0],steel,[0,0,0],blast);box([3.0,2.85,.08],[0,1.6,.23],darkMetal,[0,0,0],blast);
  for(let y=.45;y<3;y+=.48)box([2.7,.08,.11],[0,y,.31],steel,[0,0,0],blast);
  const wheel=cyl(.46,.46,.11,[.95,1.62,.45],redPaint,[Math.PI/2,0,0],blast,24);
  let doorOpen=false;
  addInteraction(wheel,'BLAST DOOR','bunker',()=>{doorOpen=!doorOpen;window.dispatchEvent(new CustomEvent('lostsignal:door',{detail:{open:doorOpen}}))});
  const exitPanel=box([.42,.66,.12],[-1.78,1.28,-6.96],darkMetal);box([.18,.18,.035],[-1.78,1.39,-6.88],greenGlow);
  addInteraction(exitPanel,'SURFACE ACCESS','bunker',()=>window.dispatchEvent(new CustomEvent('lostsignal:surface',{detail:{allowed:doorOpen}})));

  // OUTSIDE ENVIRONMENT
  mesh(new THREE.PlaneGeometry(220,220,1,1),new THREE.MeshStandardMaterial({color:0x3f4b40,roughness:.96}),[0,0,0],[-Math.PI/2,0,0],outside);
  mesh(new THREE.PlaneGeometry(11,47),new THREE.MeshStandardMaterial({color:0x4e5350,roughness:.92}),[0,.025,-4],[-Math.PI/2,0,0],outside);
  outside.add(new THREE.HemisphereLight(0xcbd6d2,0x242b27,1.35));
  const sun=new THREE.DirectionalLight(0xe7eef0,3.1);sun.position.set(-25,30,18);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-45;sun.shadow.camera.right=45;sun.shadow.camera.top=45;sun.shadow.camera.bottom=-45;outside.add(sun);

  const bunkerTop=new THREE.Group();bunkerTop.position.set(0,0,-17);outside.add(bunkerTop);
  box([10,3.2,7],[0,1.6,0],concrete,[0,0,0],bunkerTop);box([4.0,2.55,.35],[0,1.3,3.58],steel,[0,0,0],bunkerTop);
  const returnPanel=box([.48,.72,.12],[-2.2,1.28,3.74],darkMetal,[0,0,0],bunkerTop);box([.18,.18,.03],[-2.2,1.42,3.82],greenGlow,[0,0,0],bunkerTop);
  addInteraction(returnPanel,'RETURN TO SHELTER','outside',()=>window.dispatchEvent(new CustomEvent('lostsignal:return')));
  addBlocker('outside',-5.4,5.4,-21,-13.25);

  function fencePanel(x1,z1,x2,z2){
    const dx=x2-x1,dz=z2-z1,len=Math.hypot(dx,dz),steps=Math.ceil(len/2.6),ang=Math.atan2(dx,dz);
    for(let i=0;i<=steps;i++){const t=i/steps;cyl(.055,.06,2.7,[x1+dx*t,1.35,z1+dz*t],steel,[0,0,0],outside,8)}
    for(const y of [.25,1.35,2.55])box([.045,.045,len],[(x1+x2)/2,y,(z1+z2)/2],steel,[0,ang,0],outside);
    const positions=[];
    for(let i=0;i<=Math.floor(len/.42);i++){const t=i/Math.floor(len/.42),x=x1+dx*t,z=z1+dz*t;positions.push(x,.25,z,x,2.55,z)}
    for(let y=.35;y<2.5;y+=.40)positions.push(x1,y,z1,x2,y,z2);
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));outside.add(new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0x8d9990,transparent:true,opacity:.62})));
  }
  fencePanel(-20,-27,20,-27);fencePanel(-20,-27,-20,18);fencePanel(20,-27,20,18);fencePanel(-20,18,-4.5,18);fencePanel(4.5,18,20,18);
  for(const x of [-4.5,4.5])cyl(.10,.10,3,[x,1.5,18],steel,[0,0,0],outside,10);
  box([4.25,2.3,.10],[-2.3,1.35,18],steel,[0,0,0],outside);box([4.25,2.3,.10],[2.3,1.35,18],steel,[0,0,0],outside);
  box([3.5,2.7,3.2],[-13,1.35,13],concrete,[0,0,0],outside);box([1.6,.9,.03],[-13,1.7,11.38],greenGlow,[0,0,0],outside);

  // Trees: rounded branch trunks with clustered canopies. The real wildlife now carries the focal detail.
  const trunkMat=new THREE.MeshStandardMaterial({color:0x3b2a20,roughness:.96});
  const leafMats=[0x1f3426,0x29442f,0x345138].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:.95}));
  function tree(x,z,s=1){
    const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=Math.random()*6.28;outside.add(g);
    cyl(.20*s,.32*s,4*s,[0,2*s,0],trunkMat,[0,0,(Math.random()-.5)*.08],g,12);
    for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.random()*.3;const branch=cyl(.06*s,.11*s,1.35*s,[Math.cos(a)*.35*s,3.0*s+i*.2*s,Math.sin(a)*.35*s],trunkMat,[0,0,Math.PI/2-.3],g,9);branch.rotation.y=-a}
    const lm=leafMats[Math.floor(Math.random()*leafMats.length)];
    for(const [cx,cy,cz,sc] of [[0,4.5,0,1.45],[.8,4.75,.25,1.05],[-.75,4.7,-.2,1.12],[.2,5.55,0,1.0]]){const f=mesh(new THREE.IcosahedronGeometry(sc*s,2),lm,[cx*s,cy*s,cz*s],[Math.random(),Math.random(),Math.random()],g);f.scale.y=.78}
  }
  for(let i=0;i<46;i++){let x,z;do{x=(Math.random()-.5)*110;z=(Math.random()-.5)*115}while(x>-25&&x<25&&z>-33&&z<24);tree(x,z,.70+Math.random()*.55)}
  [[-15,5],[15,7],[-14,-10],[14,-8],[-10,22],[12,24]].forEach(([x,z])=>tree(x,z,.8));

  // Instanced grass
  const grassGeo=new THREE.ConeGeometry(.07,.5,5);const grassMat=new THREE.MeshStandardMaterial({color:0x415b43,roughness:.98});const grass=new THREE.InstancedMesh(grassGeo,grassMat,300);const gm=new THREE.Matrix4();
  for(let i=0;i<300;i++){let x,z;do{x=(Math.random()-.5)*38;z=-25+Math.random()*41}while(Math.abs(x)<6.4);const sc=.5+Math.random()*.9;gm.compose(new THREE.Vector3(x,.25*sc,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,Math.random()*6.28,(Math.random()-.5)*.12)),new THREE.Vector3(sc,sc,sc));grass.setMatrixAt(i,gm)}outside.add(grass);

  // Optional real props
  if(assets.container){const o=cloneGLTF(assets.container);fitToHeight(o,2.7);o.position.set(-13,0,-2);o.rotation.y=.18;outside.add(o)}
  if(assets.barrel){const template=cloneGLTF(assets.barrel);fitToHeight(template,1.0);for(const [x,z] of [[-10,-6],[13,10],[7,-22]]){const o=template.clone(true);o.position.set(x,0,z);outside.add(o)}}
  if(assets.cinderblock){const template=cloneGLTF(assets.cinderblock);fitToHeight(template,.28);for(let i=0;i<12;i++){const o=template.clone(true);o.position.set(7+Math.random()*5,0,-8+Math.random()*7);o.rotation.y=Math.random()*6.28;outside.add(o)}}

  // REAL ANIMATED WILDLIFE
  function animal(kind,gltf,x,z,height,rx,rz,speed){
    const root=cloneGLTF(gltf);fitToHeight(root,height);root.position.set(x,0,z);root.rotation.y=Math.random()*6.28;outside.add(root);
    const clip=pickClip(gltf,/walk|run|move|locomotion/i,0);const mixer=createMixer(root,clip,kind==='rabbit'?1.35:.95);mixers.push(mixer);
    root.userData={kind,alive:true,cx:x,cz:z,rx,rz,speed,phase:Math.random()*6.28,mixer,baseY:root.position.y,harvested:false};wildlife.push(root);return root;
  }
  animal('deer',assets.deer,-7,8,1.65,5.5,4,.075);animal('deer',assets.deer,11,-2,1.55,4.5,3.5,.08);animal('deer',assets.deer,-12,-14,1.45,5,4,.072);animal('deer',assets.deer,8,13,1.58,4.2,3.4,.078);
  animal('rabbit',assets.rabbit,5,12,.48,2.4,1.8,.17);animal('rabbit',assets.rabbit,-10,3,.45,2,1.7,.18);animal('rabbit',assets.rabbit,15,-12,.44,2.1,1.6,.19);animal('rabbit',assets.rabbit,-6,-21,.46,2.2,1.8,.18);

  function infected(x,z,a,b,delay){
    const root=cloneGLTF(assets.zombie);fitToHeight(root,1.88);root.position.set(x,0,z);outside.add(root);const clip=pickClip(assets.zombie,/walk|run|move/i,0);const mixer=createMixer(root,clip,1.1);mixers.push(mixer);
    root.userData={kind:'zombie',alive:true,hp:2,pathA:a,pathB:b,t:Math.random(),dir:1,speed:.024+Math.random()*.009,activeAt:delay,mixer};zombies.push(root);return root;
  }
  infected(-29,23,[-29,23],[29,23],4);infected(24,-25,[24,-25],[24,18],28);infected(-25,-6,[-25,-6],[-25,18],58);

  // Rifle viewmodel uses the same repo asset.
  const weaponView=new THREE.Group();camera.add(weaponView);weaponView.position.set(.28,-.46,-.55);weaponView.visible=false;
  const rifle=cloneGLTF(assets.rifle);fitToHeight(rifle,.55);rifle.rotation.set(0,Math.PI,Math.PI/2);rifle.position.set(.1,0,0);weaponView.add(rifle);
  const gunMixer=new THREE.AnimationMixer(rifle);mixers.push(gunMixer);

  // CCTV cameras
  const cctvCameras=[new THREE.PerspectiveCamera(48,16/9,.1,160),new THREE.PerspectiveCamera(50,16/9,.1,160),new THREE.PerspectiveCamera(48,16/9,.1,160),new THREE.PerspectiveCamera(42,16/9,.1,190)];
  const targets=[new THREE.Vector3(0,1.5,18),new THREE.Vector3(20,1.6,-4),new THREE.Vector3(2,1.1,-5),new THREE.Vector3(0,1,-4)];
  cctvCameras[0].position.set(0,4.2,-12);cctvCameras[1].position.set(17,4.5,10);cctvCameras[2].position.set(-16,4,-10);cctvCameras[3].position.set(-18,11,20);cctvCameras.forEach((c,i)=>c.lookAt(targets[i]));
  const cctvBaseRot=cctvCameras.map(c=>c.rotation.clone());

  // Rain
  const rainCount=420;const rainGeo=new THREE.PlaneGeometry(.014,.48);const rainMat=new THREE.MeshBasicMaterial({color:0xc7d8df,transparent:true,opacity:.20,depthWrite:false,side:THREE.DoubleSide});const rain=new THREE.InstancedMesh(rainGeo,rainMat,rainCount);const rainData=[],rainMatrix=new THREE.Matrix4();
  for(let i=0;i<rainCount;i++){const p=new THREE.Vector3((Math.random()-.5)*55,3+Math.random()*18,-30+Math.random()*58);rainData.push({p,v:7+Math.random()*7});rainMatrix.makeRotationZ(-.08);rainMatrix.setPosition(p);rain.setMatrixAt(i,rainMatrix)}rain.frustumCulled=false;outside.add(rain);

  function setWorld(world){
    if(player.parent)player.parent.remove(player);
    if(world==='outside'){outside.add(player);player.position.set(0,0,-12.2)}else{bunker.add(player);player.position.set(0,0,-6.0)}
  }
  function blocked(world,x,z){
    if(world==='bunker'&&(x<-6.5||x>6.5||z<-6.8||z>6.8))return true;
    if(world==='outside'&&(x<-19.1||x>19.1||z<-25.9||z>17.1))return true;
    return blockers[world].some(b=>x>b.x1&&x<b.x2&&z>b.z1&&z<b.z2);
  }
  function nearestInteraction(world){
    const ray=new THREE.Raycaster();ray.far=2.7;ray.setFromCamera({x:0,y:0},camera);const candidates=interactions.filter(o=>o.userData.interaction?.world===world);const hits=ray.intersectObjects(candidates,true);if(!hits.length)return null;let o=hits[0].object;while(o&&!o.userData.interaction)o=o.parent;return o?.userData.interaction||null;
  }
  function setArmed(v){weaponView.visible=v;if(!v)rifleDisplay.visible=true;else rifleDisplay.visible=false}
  function playGun(kind){const clip=pickClip(assets.rifle,kind==='reload'?/reload/i:/shoot|fire|recoil/i,0);if(!clip)return;gunMixer.stopAllAction();const a=gunMixer.clipAction(clip);a.setLoop(THREE.LoopOnce,1);a.clampWhenFinished=true;a.reset().play()}

  let zombieTime=0;
  function update(dt,world,playerPos){
    zombieTime+=dt;
    blast.position.x=THREE.MathUtils.damp(blast.position.x,doorOpen?3.7:0,3.5,dt);
    vaultDoor.rotation.y=THREE.MathUtils.damp(vaultDoor.rotation.y,vaultOpen?-1.72:0,5,dt);
    for(const m of mixers)m.update(dt);
    for(const w of wildlife){if(!w.userData.alive)continue;const u=w.userData,a=zombieTime*u.speed+u.phase;let nx=u.cx+Math.cos(a)*u.rx,nz=u.cz+Math.sin(a)*u.rz;const dx=w.position.x-playerPos.x,dz=w.position.z-playerPos.z,dist=Math.hypot(dx,dz);if(world==='outside'&&dist<9&&dist>.01){const flee=(9-dist)*.5;nx+=(dx/dist)*flee;nz+=(dz/dist)*flee}nx=Math.max(-18,Math.min(18,nx));nz=Math.max(-25,Math.min(16.3,nz));const ox=w.position.x,oz=w.position.z;w.position.x=nx;w.position.z=nz;if(Math.abs(nx-ox)+Math.abs(nz-oz)>.0001)w.rotation.y=Math.atan2(nx-ox,nz-oz);w.position.y=u.baseY}
    for(const z of zombies){const u=z.userData;z.visible=zombieTime>=u.activeAt;if(!z.visible||!u.alive)continue;u.t+=dt*u.speed*u.dir;if(u.t>=1){u.t=1;u.dir=-1}else if(u.t<=0){u.t=0;u.dir=1}const [ax,az]=u.pathA,[bx,bz]=u.pathB;z.position.x=THREE.MathUtils.lerp(ax,bx,u.t);z.position.z=THREE.MathUtils.lerp(az,bz,u.t);z.rotation.y=Math.atan2((bx-ax)*u.dir,(bz-az)*u.dir)}
    for(let i=0;i<rainData.length;i++){const d=rainData[i];d.p.y-=d.v*dt;d.p.x-=1.1*dt;if(d.p.y<.05){d.p.y=10+Math.random()*13;d.p.x=(Math.random()-.5)*55;d.p.z=-30+Math.random()*58}rainMatrix.makeRotationZ(-.08);rainMatrix.setPosition(d.p);rain.setMatrixAt(i,rainMatrix)}rain.instanceMatrix.needsUpdate=true;
    if(Math.random()<.002){const l=bunkerLights[Math.floor(Math.random()*bunkerLights.length)],v=l.intensity;l.intensity=.4;setTimeout(()=>l.intensity=v,70)}
  }

  return { bunker,outside,player,camera,interactions,wildlife,zombies,cctvCameras,cctvBaseRot,weaponView,blocked,nearestInteraction,setWorld,setArmed,playGun,update,doorOpen:()=>doorOpen };
}

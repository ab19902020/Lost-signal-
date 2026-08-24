import * as THREE from 'three';
import { cloneGLTF, findNamed } from './assets.js';
import { ColliderSet } from './physics.js';
import { createCreatureSystem, populateSilo } from './creatures.js';
import { buildSilo } from './silo.js';
import { buildArmory } from './armory.js';
import { buildGarrison } from './garrison.js';
import { WEAPONS, DEFAULT_WEAPON } from './weapons.js';

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

  // Silo 47-A, reached through the hatch in the shelter floor.
  const silo = new THREE.Scene();

  const player = new THREE.Group();
  const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.035, 180);
  const _cullPoint = new THREE.Vector3();   // reused: light culling runs every frame
  const _interactionPoint = new THREE.Vector3();
  const _interactionCamera = new THREE.Vector3();
  camera.rotation.order = 'YXZ';
  camera.position.set(0, 1.67, 0);
  player.add(camera);
  player.position.set(0, 0, 5.0);
  bunker.add(player);

  const interactions = [];
  const colliders = {
    bunker: new ColliderSet({ minX: -6.55, maxX: 6.55, minZ: -6.85, maxZ: 6.85 }),
    outside: new ColliderSet({ minX: -19.2, maxX: 19.2, minZ: -26.0, maxZ: 17.2 }),
    // The silo's enclosure is its ring of wall panels, not a rectangle.
    silo: new ColliderSet(null),
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
    const world = options.world ?? (parent === outside ? 'outside' : (parent === silo ? 'silo' : 'bunker'));
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

  // Lighting is runtime because it is an effect, not visible geometry. Only the
  // fixtures that exist as Blender models are created here; every intensity,
  // colour and animation is owned by the lighting layer in world_lit.js.
  const emergency = new THREE.PointLight(0xff6a3a, 3.2, 7.5, 2.0);
  emergency.position.set(0, 3.35, 6.0);
  bunker.add(emergency);

  const fixturePositions = [[-3.4,-3.6],[3.4,-3.6],[-3.4,2.35],[3.4,2.35]];
  for (const [x,z] of fixturePositions) {
    place(assets.ceilingLight, bunker, [x,3.76,z], [0,0,0], 1, { collide: false });
    const light = new THREE.PointLight(0xdfe6df, 16, 11, 2);
    light.position.set(x,3.40,z);
    bunker.add(light);
    bunkerLights.push(light);
  }

  // Industrial service systems
  place(assets.pipes, bunker, [6.25,.14,-4.8], [0,Math.PI,0]);
  place(assets.pipes, bunker, [-6.25,.14,1.8], [0,0,0]);

  const ventilation = place(assets.ventilation, bunker, [5.20,0,-4.85], [0,-Math.PI/2,0], .88);
  addInteraction(ventilation,'AIR FILTRATION UNIT','bunker',()=>window.dispatchEvent(new CustomEvent('lostsignal:filtration')));

  place(assets.electrical, bunker, [-4.85,.10,6.88], [0,0,0], .90);
  place(assets.lockers, bunker, [-2.55,0,6.55], [0,0,0], .84);
  place(assets.bench, bunker, [4.85,0,6.25], [0,Math.PI,0], .88);

  // Low crates and cans can be stepped onto rather than walked into.
  place(assets.clutter, bunker, [-4.55,0,2.55], [0,Math.PI/2,0], .92, { climbable: true });
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
  place(assets.bed, bunker, [.70,0,5.55], [0,Math.PI/2,0], 1, { climbable: true });
  place(assets.storage, bunker, [5.90,0,-1.10], [0,Math.PI/2,0], .92);
  place(assets.storage, bunker, [-5.90,0,-1.35], [0,-Math.PI/2,0], .92);

  // Generator
  const generator = place(assets.generator, bunker, [-4.60,0,4.72], [0,0,0], .90);
  addInteraction(generator,'DIESEL GENERATOR','bunker',()=>window.dispatchEvent(new CustomEvent('lostsignal:generator')));

  // The former cupboard-sized gun vault is now a room the player can enter.
  // All 25 supplied weapon models are mounted inside and the supplied animated
  // Adventurer runs the issue counter.
  const armory = buildArmory({
    assets, scene: bunker, colliders: colliders.bunker, place, addInteraction,
  });
  if (armory?.lights?.length) bunkerLights.push(...armory.lights);

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

  // Floor hatch down to the silo. It has to be unsealed before it will open,
  // which is one more thing the shelter asks you to do before it lets you out.
  let hatchOpen = false;
  let hatchHinge = null;
  const siloWorld = assets.habShell ? buildSilo({
    scene: silo,
    colliders: colliders.silo,
    place,
    addInteraction,
    assets,
  }) : null;

  const residents = siloWorld ? populateSilo({
    scene: silo,
    colliders: colliders.silo,
    assets,
    walkable: siloWorld.walkable,
    count: 20,
  }) : null;

  // Who is posted on the secure gallery, and the infirmary they keep there.
  const garrison = siloWorld ? buildGarrison({
    scene: silo,
    colliders: colliders.silo,
    assets,
    place,
    addInteraction,
    silo: siloWorld,
  }) : null;

  if (siloWorld) {
    const hatch = place(assets.accessHatch, bunker, [-1.75,0,3.35], [0,0,0], 1, { climbable: true });
    const hatchWheel = findNamed(hatch,'Hatch_Wheel') || hatch;
    const hatchVoid = findNamed(hatch, 'Hatch_Void');
    if (hatchVoid?.isMesh) {
      // This represents empty depth, not painted metal: keep it black under
      // the shelter's bright practical lights even if the GLB is rebuilt by an
      // older Blender version with slightly different material conversion.
      // The authored ring is a solid cylinder whose top face is y=.15. Lift
      // the dark centre past it so the ring remains a rim, not a grey cover.
      hatchVoid.position.y = Math.max(hatchVoid.position.y, .165);
      hatchVoid.material = new THREE.MeshBasicMaterial({ color: 0x000000, toneMapped: false });
    }

    // The exported pieces stay separate so the lid, bolts and wheel can move as
    // one assembly. Reparent them around the rear rim while preserving their
    // authored transforms; the dark throat in the GLB remains fixed below.
    const lidParts = [];
    hatch.traverse((part) => {
      if (/^Hatch_(Lid|Bolt_|Wheel$|Spoke_|Hub$)/.test(part.name)) lidParts.push(part);
    });
    if (lidParts.length) {
      hatchHinge = new THREE.Group();
      hatchHinge.name = 'Hatch_Hinge';
      hatchHinge.position.set(0, 0, 0.84);
      hatch.add(hatchHinge);
      hatch.updateWorldMatrix(true, true);
      for (const part of lidParts) hatchHinge.attach(part);
    }

    addInteraction(hatchWheel,'SILO ACCESS HATCH','bunker',()=>{
      hatchOpen = !hatchOpen;
      window.dispatchEvent(new CustomEvent('lostsignal:hatch',{detail:{open:hatchOpen}}));
    });
    addInteraction(hatch,'DESCEND TO SILO','bunker',()=>{
      window.dispatchEvent(new CustomEvent('lostsignal:descend',{detail:{allowed:hatchOpen}}));
    });
  }

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

  // The compound reads as night, not as a void. The old sky term was almost
  // black against an almost-black ground, so the surface had no shape at all
  // until you walked into a floodlight.
  outside.add(new THREE.HemisphereLight(0x4b6068,0x14120e,.86));
  const moon = new THREE.DirectionalLight(0xa6bdc9,3.1);
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

  // --- Surface dressing ----------------------------------------------------
  // What used to stand inside the wire was four copies of one bare Blender
  // trunk, scattered across the yard. From eye level they read as loose planks
  // lying about rather than as anything that had ever grown, so the trees are
  // now a real treeline of five dead forms standing OUTSIDE the fence, where a
  // treeline belongs, and the yard is dressed with what a shelter compound
  // would actually have in it.
  const deadTrees = [assets.deadTree01, assets.deadTree02, assets.deadTree03,
    assets.deadTree04, assets.deadTree05].filter(Boolean);
  if (deadTrees.length) {
    const treeLine = [
      [-30, -34, .4, .95], [-14, -35, 2.1, .8], [4, -37, 1.2, 1.05], [22, -34, 3.4, .85],
      [-34, -18, .9, .9], [-36, 2, 2.6, 1.0], [-33, 20, 1.7, .8], [-28, 32, 4.2, .95],
      [30, -20, 5.1, .85], [34, -2, .3, 1.0], [32, 17, 2.9, .9], [26, 30, 1.4, .8],
      [-10, 33, 3.7, .95], [10, 35, .6, .9],
    ];
    treeLine.forEach(([x, z, r, scale], i) =>
      place(deadTrees[i % deadTrees.length], outside, [x, 0, z], [0, r, 0], scale,
        { collide: false }));
  } else {
    [[-16,0,-6,0],[16,0,1,1.1],[-12,0,13,-.5],[11,0,-22,.7]].forEach(([x,y,z,r])=>place(assets.deadTree,outside,[x,y,z],[0,r,0],.9));
  }
  [[-8,0,-9,0],[8,0,-8,.2],[-7,0,8,-.1],[7,0,7,.1]].forEach(([x,y,z,r])=>place(assets.barrier,outside,[x,y,z],[0,r,0],.9));
  [[-11,0,-14,0],[11,0,-14,.7],[-15,0,5,.2],[13,0,12,-.5]].forEach(([x,y,z,r])=>place(assets.rubble,outside,[x,y,z],[0,r,0],1,{ climbable: true }));

  // The compound runs on its own power. A field of eight arrays fills the east
  // side of the yard, angled off the fence line, which is what the shelter's
  // POWER reading has been quietly claiming all along.
  const solarArrays = [];
  if (assets.solarArray) {
    // The array ships with a pale cast plinth, which at night was the brightest
    // thing in the compound. Weather it down once and share the result.
    const weathered = new Map();
    const weather = (material) => {
      if (!material) return material;
      if (weathered.has(material)) return weathered.get(material);
      const copy = material.clone();
      // Leave the cells alone: dark glass is what a panel is supposed to be.
      if (copy.color && copy.color.getHex() > 0x333333) copy.color.multiplyScalar(0.42);
      copy.roughness = Math.max(copy.roughness ?? .7, .82);
      weathered.set(material, copy);
      return copy;
    };
    for (let row = 0; row < 3; row++) {
      for (let column = 0; column < 2; column++) {
        const array = place(assets.solarArray, outside,
          [11.4 + column * 5.7, 0, -17.4 + row * 6.6], [0, -0.18 + row * 0.05, 0], 1,
          { shrink: 0.1 });
        array.traverse((part) => {
          if (!part.isMesh) return;
          part.material = Array.isArray(part.material)
            ? part.material.map(weather) : weather(part.material);
        });
        solarArrays.push(array);
      }
    }
    // One low spill under the field so it reads at night without adding a
    // second floodlight rig.
    const glow = new THREE.PointLight(0x8fb3c4, 4.5, 24, 2.0);
    glow.position.set(14.2, 3.6, -8.4);
    outside.add(glow);
  }

  // Yard clutter. Everything here is collided, so the compound is somewhere you
  // pick your way through rather than an empty slab with scenery painted on it.
  const dress = (asset, entries, options = {}) => {
    if (!asset) return;
    for (const [x, z, r, scale = 1] of entries) {
      place(asset, outside, [x, 0, z], [0, r, 0], scale, options);
    }
  };
  dress(assets.propContainer, [[-15.4, -17.2, .12], [-15.8, 8.4, -.06]]);
  dress(assets.propContainerRed, [[-15.2, -4.6, .04]]);
  dress(assets.propTruck, [[7.4, 12.6, 2.62], [-9.2, -21.4, .38]]);
  dress(assets.propWaterTower, [[-17.6, -25.4, .5]], { shrink: 0.35 });
  dress(assets.propBarrel, [
    [-6.2, -16.4, .3], [-5.4, -17.1, 1.2], [-6.9, -17.6, 2.4],
    [9.6, -3.2, .8], [10.3, -3.9, 2.1], [-12.4, 14.6, .4], [12.8, 6.4, 1.7],
  ]);
  dress(assets.propPallet, [[-4.4, 9.2, .2], [-3.6, 9.9, 1.1], [8.2, -10.4, 2.7]]);
  dress(assets.propPalletBroken, [[-4.9, 10.8, 2.2], [13.4, 15.2, .6]]);
  dress(assets.propPipes, [[-13.2, -10.6, 1.55], [-12.4, -9.4, 1.62]]);
  dress(assets.propCinderBlock, [
    [3.4, -13.6, .4], [3.9, -13.2, 1.9], [3.6, -13.9, 2.8], [-9.8, 4.2, .7],
  ], { collide: false });
  dress(assets.propWheels, [[6.2, 15.4, .3], [-11.6, -6.2, 1.4]]);
  dress(assets.propTrashBags, [[-2.6, 13.8, .9], [2.2, 14.4, 2.6], [-14.6, 17.2, .2]],
    { collide: false });
  dress(assets.propBarrier, [
    [-2.4, -8.6, 0], [-1.2, -8.6, 0], [1.2, -8.6, 0], [2.4, -8.6, 0],
    [-2.4, 16.2, 0], [2.4, 16.2, 0],
  ]);
  dress(assets.propCone, [
    [-3.6, -7.4, 0], [3.6, -7.4, 0], [0, 16.9, 0], [-6.2, 4.8, 0], [6.4, 1.2, 0],
  ], { collide: false });
  dress(assets.propStreetLight, [[-9.4, 16.8, 1.6], [9.4, -16.8, -1.5]], { shrink: 0.2 });
  dress(assets.propTownSign, [[0, 21.6, 0]], { shrink: 0.2 });
  dress(assets.propChest, [[4.6, -4.2, .6], [-7.8, 11.4, 2.3]]);

  // The people who did not get inside. Nothing graphic: shapes under weighted
  // tarpaulins, and one who sat down against the compound wall in a hooded
  // coat and did not get up. They are what makes the surface read as after
  // rather than as empty.
  if (assets.remainsCovered) {
    [[-6.4, 0, -12.8, 0.4], [9.2, 0, -5.6, -1.1], [-13.5, 0, 3.2, 2.2],
     [5.8, 0, 15.4, 0.9]].forEach(([x, y, z, r]) =>
      place(assets.remainsCovered, outside, [x, y, z], [0, r, 0], 1, { collide: false }));
  }
  if (assets.remainsSlumped) {
    [[-8.9, 0, -8.2, 0.35], [12.4, 0, 9.1, -2.4], [2.6, 0, -19.2, 3.0]].forEach(([x, y, z, r]) =>
      place(assets.remainsSlumped, outside, [x, y, z], [0, r, 0], 1, { collide: false }));
  }

  // Surface access uses the same Blender keypad asset.
  const returnPanel = place(assets.accessControl,outside,[-2.15,.55,-13.55],[0,0,0],.64,{ collide: false });
  addInteraction(returnPanel,'RETURN TO SHELTER','outside',()=>window.dispatchEvent(new CustomEvent('lostsignal:return')));

  // Nothing lives up here. Whatever ended the world took the animals with it,
  // and a deer picking its way through the compound said the opposite of every
  // other thing on the surface. The creature system stays wired so the silo's
  // residents keep working; it is simply given nothing to put outside.
  const creatures = createCreatureSystem({
    scene: outside,
    colliders: colliders.outside,
    assets,
    wildlife: false,
  });
  const wildlife = creatures.wildlife;

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

  // The held weapon, as a first-person viewmodel. `weaponView` carries the
  // sway, bob and recoil the player controller drives; the model inside it is
  // swapped whenever they take something else off the wall, so switching from
  // a rifle to a revolver does not reset the rig mid-stride.
  const weaponView = new THREE.Group();
  camera.add(weaponView);
  weaponView.position.set(.32,-.38,-.72);
  weaponView.rotation.set(-.04,-.08,0);
  weaponView.visible=false;
  // A second group carries the reload gesture on its own, so a magazine change
  // reads as the weapon moving in the hands rather than the camera lurching.
  const weaponAction = new THREE.Group();
  weaponView.add(weaponAction);
  let heldModel = null;
  let heldKey = null;

  // A pair of hands behind the weapon. The supplied FPS rigs ship one arm mesh
  // posed twice — once around a rifle, once around a handgun — with idle, shoot
  // and reload takes on a real skeleton, so the player's hands move with the
  // action rather than a floating gun drifting in front of the camera.
  const ARM_RIGS = {
    rifle: 'fpsArmsRifle', smg: 'fpsArmsRifle', shotgun: 'fpsArmsRifle',
    sniper: 'fpsArmsRifle', pistol: 'fpsArmsPistol', revolver: 'fpsArmsPistol',
    blade: 'fpsArmsPistol',
  };
  // The rigs are authored at their own scale and are not centred on anything.
  // A bounding box is no help either — these are skinned meshes whose bind pose
  // is nothing like the pose they are drawn in — so each rig is scaled
  // explicitly and then slid until a named bone lands on the weapon's grip.
  const ARM_VIEW = {
    fpsArmsRifle: { scale: 0.030, grip: 'HandL', at: [0.02, -0.01, 0.04], rotation: [0, 0, 0] },
    fpsArmsPistol: { scale: 0.028, grip: 'HandL', at: [0.02, 0.00, 0.02], rotation: [0, 0, 0] },
  };
  const _gripWorld = new THREE.Vector3();
  const _gripLocal = new THREE.Vector3();
  const _weaponBox = new THREE.Box3();
  const _weaponSize = new THREE.Vector3();
  const armRigs = new Map();
  let arms = null;
  let armMixer = null;
  let armClips = null;
  let armIdle = null;

  function armRigFor(assetKey) {
    if (armRigs.has(assetKey)) return armRigs.get(assetKey);
    const gltf = assets[assetKey];
    if (!gltf) {
      armRigs.set(assetKey, null);
      return null;
    }
    const view = ARM_VIEW[assetKey];
    const root = cloneGLTF(gltf);
    root.name = `Fps_${assetKey}`;
    root.rotation.set(...view.rotation);
    root.scale.setScalar(view.scale);
    root.visible = false;
    // Skinned arms move a long way from their bind pose, so nothing about them
    // can be culled against it.
    root.traverse((part) => { if (part.isMesh) part.frustumCulled = false; });
    weaponAction.add(root);
    weaponAction.updateWorldMatrix(true, true);
    const grip = findNamed(root, view.grip);
    if (grip) {
      grip.getWorldPosition(_gripWorld);
      weaponAction.worldToLocal(_gripLocal.copy(_gripWorld));
      root.position.set(view.at[0] - _gripLocal.x, view.at[1] - _gripLocal.y,
        view.at[2] - _gripLocal.z);
    }
    const mixer = new THREE.AnimationMixer(root);
    const clips = {};
    for (const clip of gltf.animations || []) {
      const action = mixer.clipAction(clip);
      clips[clip.name.toLowerCase()] = action;
    }
    const rig = { root, mixer, clips };
    mixer.addEventListener('finished', (event) => {
      if (rig !== arms || !armIdle || event.action === armIdle) return;
      event.action.fadeOut(.14);
      armIdle.reset().fadeIn(.14).play();
    });
    armRigs.set(assetKey, rig);
    return rig;
  }

  function setArms(family) {
    const rig = armRigFor(ARM_RIGS[family] || 'fpsArmsRifle');
    if (arms === rig) return;
    if (arms) {
      arms.root.visible = false;
      arms.mixer.stopAllAction();
    }
    arms = rig;
    armMixer = rig?.mixer || null;
    armClips = rig?.clips || null;
    armIdle = armClips?.idle || null;
    if (!rig) return;
    rig.root.visible = true;
    armIdle?.reset().play();
  }

  /** Play one of the rig's takes once, then settle back to idle. */
  function playArms(name, seconds) {
    const action = armClips?.[name];
    if (!action) return;
    action.reset();
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    // Stretch or squeeze the take to the length the game gives the action, so a
    // three-second pump reload is not a half-second mime repeated six times.
    const clipLength = action.getClip().duration || 1;
    action.timeScale = seconds > 0 ? clipLength / seconds : 1;
    armIdle?.fadeOut(.12);
    action.fadeIn(.10).play();
  }

  function setWeapon(key) {
    if (heldKey === key && heldModel) return heldModel;
    if (heldModel) {
      weaponAction.remove(heldModel);
      heldModel = null;
    }
    const source = (key && assets[key]) || armory?.weaponAsset || assets.rifle;
    if (!source) { heldKey = null; return null; }
    heldKey = key && assets[key] ? key : null;
    const model = cloneGLTF(source);
    const view = WEAPONS[heldKey]?.view
      || { scale: armory?.weaponAsset ? .16 : .78, offset: [armory?.weaponAsset ? -.04 : 0, armory?.weaponAsset ? -.08 : -.02, 0] };
    // Point the barrel where the crosshair points. Most of the packs lay a
    // weapon along +X, but not all of them, and a converted model can carry a
    // residual node rotation of its own — so measure the model's longest
    // horizontal axis in its own root space rather than assuming one. `flip`
    // is the one thing measurement cannot settle: which end is the muzzle.
    model.rotation.set(0, 0, 0);
    model.updateWorldMatrix(true, true);
    _weaponBox.setFromObject(model).getSize(_weaponSize);
    const alongX = _weaponSize.x >= _weaponSize.z;
    const yaw = (alongX ? Math.PI / 2 : Math.PI) + (view.flip ? Math.PI : 0);
    model.rotation.set(0, yaw, 0);
    model.scale.setScalar(view.scale);
    model.position.set(...view.offset);
    model.name = `Equipped_${heldKey || 'Rifle'}`;
    weaponAction.add(model);
    heldModel = model;
    setArms(WEAPONS[heldKey]?.family);
    return model;
  }
  setWeapon(DEFAULT_WEAPON);

  // CCTV cameras look at the Blender exterior scene.
  const cctvCameras=[
    new THREE.PerspectiveCamera(48,16/9,.1,160),
    new THREE.PerspectiveCamera(50,16/9,.1,160),
    new THREE.PerspectiveCamera(48,16/9,.1,160),
    new THREE.PerspectiveCamera(42,16/9,.1,190),
    // The fifth feed looks down the silo's top landing at the secure unit.
    new THREE.PerspectiveCamera(56,16/9,.1,90),
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
  if (siloWorld) {
    const secure = siloWorld.securePosition;
    cctvCameras[4].position.set(secure.x * .55, siloWorld.topY + 2.9, secure.z * .55);
    targets.push(secure.clone().setY(siloWorld.topY + 1.2));
  } else {
    cctvCameras[4].position.set(0, 3, 0);
    targets.push(new THREE.Vector3(0, 1, -4));
  }
  cctvCameras.forEach((c,i)=>c.lookAt(targets[i]));
  const cctvBaseRot=cctvCameras.map(c=>c.rotation.clone());
  const cctvScenes=['outside','outside','outside','outside','silo'];

  const scenes = { bunker, outside, silo };
  const spawnPoints = {
    bunker: new THREE.Vector3(0,0,-5.4),
    outside: new THREE.Vector3(0,0,-12.15),
    // Arriving in the silo puts the player on the secure gallery beside the
    // access shaft, a long way above the lowest residential level.
    silo: siloWorld ? siloWorld.spawn.clone() : new THREE.Vector3(0,0,0),
  };

  function setWorld(world) {
    if (player.parent) player.parent.remove(player);
    (scenes[world] || bunker).add(player);
    player.position.copy(spawnPoints[world] || spawnPoints.bunker);
    return player.position;
  }

  function blocked(world,x,z,radius=0.34,feetY=0.35,headY=1.7) {
    const set = colliders[world];
    return set ? set.contains(x,z,radius,feetY,headY) : false;
  }

  function nearestInteraction(world) {
    const ray=new THREE.Raycaster();
    ray.far=3.15;
    ray.setFromCamera({x:0,y:0},camera);
    camera.getWorldPosition(_interactionCamera);
    // The silo now has a real interaction on every quarters door. Raycasting
    // all 84 furnished meshes every frame is needless work on a phone; reject
    // anything whose hinge/root is not even within reach first.
    const candidates=interactions.filter((o) => {
      if (o.userData.interaction?.world !== world) return false;
      o.getWorldPosition(_interactionPoint);
      return _interactionPoint.distanceToSquared(_interactionCamera) <= 18;
    });
    const hits=ray.intersectObjects(candidates,true);
    if(!hits.length)return null;
    let o=hits[0].object;
    while(o&&!o.userData.interaction)o=o.parent;
    return o?.userData.interaction||null;
  }

  /**
   * `value` is the key of the weapon in the player's hands, or a falsy value
   * when they are carrying nothing. `true` is still accepted, and means the
   * default service rifle, so saved runs and the QA harness keep working.
   */
  function setArmed(value) {
    const key = value === true ? DEFAULT_WEAPON : (value || null);
    weaponView.visible = !!key;
    if (key) setWeapon(key);
    if (arms) arms.root.visible = !!key;
    armory?.setEquipped(key);
    return key;
  }

  // How a reload looks depends on what is being reloaded: a magazine drops out
  // of the bottom of the weapon, a pump gun is worked fore and aft, a bolt is
  // rolled right and thrown, a cylinder swings left. One shared timer, four
  // gestures, so twenty-two weapons never all mime the same magazine change.
  let actionTimer = 0;
  let actionLength = 0;
  let actionStyle = 'magazine';
  const ACTION_STYLE = {
    rifle: 'magazine', smg: 'magazine', pistol: 'magazine',
    shotgun: 'pump', sniper: 'magazine', revolver: 'cylinder', blade: 'stow',
  };

  function playGun(kind, seconds = 0) {
    if (kind === 'shoot') {
      playArms('shoot', 0.16);
      return;
    }
    if (kind !== 'reload') return;
    const weapon = WEAPONS[heldKey];
    actionStyle = weapon?.family === 'sniper' && /bolt|materiel/i.test(weapon.name)
      ? 'bolt'
      : (ACTION_STYLE[weapon?.family] || 'magazine');
    actionLength = Math.max(.25, seconds || weapon?.reloadTime || 1.2);
    actionTimer = actionLength;
    playArms('reload', actionLength);
  }

  function updateAction(dt) {
    armMixer?.update(dt);
    let x = 0, y = 0, z = 0, pitch = 0, roll = 0;
    if (actionTimer > 0) {
      actionTimer = Math.max(0, actionTimer - dt);
      // A single 0..1..0 arc over the length of the reload.
      const t = 1 - actionTimer / actionLength;
      const arc = Math.sin(Math.PI * Math.min(1, t));
      const beat = Math.sin(Math.PI * 2 * Math.min(1, t));
      if (actionStyle === 'pump') {
        z = arc * .10 + beat * .05;
        pitch = arc * .12;
      } else if (actionStyle === 'bolt') {
        roll = -arc * .40;
        z = beat * .045;
        pitch = arc * .10;
      } else if (actionStyle === 'cylinder') {
        roll = arc * .62;
        y = -arc * .07;
      } else if (actionStyle === 'stow') {
        y = -arc * .22;
        pitch = arc * .55;
      } else {
        y = -arc * .13;
        roll = -arc * .30;
        pitch = arc * .16;
      }
    }
    weaponAction.position.set(
      THREE.MathUtils.damp(weaponAction.position.x, x, 18, dt),
      THREE.MathUtils.damp(weaponAction.position.y, y, 18, dt),
      THREE.MathUtils.damp(weaponAction.position.z, z, 18, dt));
    weaponAction.rotation.x = THREE.MathUtils.damp(weaponAction.rotation.x, pitch, 18, dt);
    weaponAction.rotation.z = THREE.MathUtils.damp(weaponAction.rotation.z, roll, 18, dt);
  }

  function setDoorOpen(open) {
    doorOpen = !!open;
  }

  function setHatchOpen(open) {
    hatchOpen = !!open;
  }

  let elapsed=0;
  function update(dt, world = 'bunker', playerPosition = player.position) {
    elapsed += dt;
    // Cull the silo's lights around the camera rather than the body. In play
    // they are the same place; with the debug free camera they are not, and a
    // room the camera is standing in went dark because the body was elsewhere.
    if (world === 'silo') {
      siloWorld?.update(dt, camera.getWorldPosition(_cullPoint));
      garrison?.update(dt);
    }
    creatures.update(dt, world, playerPosition);
    residents?.update(dt, world, playerPosition);
    armory?.update(dt);
    updateAction(dt);
    if (blastLeaf) blastLeaf.position.x = THREE.MathUtils.damp(blastLeaf.position.x,doorOpen?3.55:0,3.4,dt);
    if (hatchHinge) hatchHinge.rotation.x = THREE.MathUtils.damp(
      hatchHinge.rotation.x, hatchOpen ? 1.38 : 0, 5.2, dt);
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

  }

  return {
    assets,
    bunker,outside,silo,scenes,player,camera,interactions,wildlife,residents,cctvCameras,cctvBaseRot,
    weaponView,weaponAction,blocked,colliders,spawnPoints,creatures,cctvScenes,nearestInteraction,setWorld,setArmed,
    playGun,setWeapon,setDoorOpen,setHatchOpen,update,
    heldWeapon:()=>heldKey,
    bunkerLights,emergency,siloWorld,armory,garrison,
    doorOpen:()=>doorOpen,
    hatchOpen:()=>hatchOpen,
  };
}

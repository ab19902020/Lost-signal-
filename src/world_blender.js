import * as THREE from 'three';
import { cloneGLTF, findNamed } from './assets.js';
import { ColliderSet } from './physics.js';
import { createCreatureSystem, populateSilo } from './creatures.js';
import { buildSilo } from './silo.js';
import { buildArmory } from './armory.js';
import { buildGarrison } from './garrison.js';
import { createRange } from './range.js';
import { createSky } from './sky.js';
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
  // The surface had no sky and a near-black fog at twice the density it needed,
  // so anything more than about thirty metres out — the fence, the treeline,
  // the far end of the compound — fell into a void with a hard edge where the
  // floodlights stopped. It now runs a real clock: sun, moon, stars and
  // weather, with the fog tracking the horizon so distance is haze, not void.
  outside.fog = new THREE.FogExp2(0x141d26, 0.0095);

  // Silo 47-A, reached through the hatch in the shelter floor.
  const silo = new THREE.Scene();

  const player = new THREE.Group();
  // The far plane used to sit at 180 m, which was fine for a compound with
  // nothing beyond its fence. It now has to reach a sky and a town on the
  // horizon, so it goes out to nine hundred; the near plane comes back a
  // fraction to keep the depth buffer's ratio sane.
  // Near plane at 0.05 with a far plane at 900 is an eighteen-thousand to one
  // depth range, and the precision that leaves at three hundred metres is
  // measured in metres — so every flat layer of ground fought every other one
  // and the whole surface strobed. The viewmodel's nearest point sits about
  // 0.17 m from the eye, so 0.15 is as far out as the near plane can go, and
  // it buys three times the precision everywhere.
  const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.15, 900);
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
    // The surface used to be a hard box the size of the compound, which is why
    // walking out of the gate put you straight back inside it. The world now
    // runs from the compound to the town, so the bound is the edge of the
    // ground itself; what actually stops the player is the fence, and where
    // the fence is down, nothing does.
    outside: new ColliderSet({ minX: -320, maxX: 140, minZ: -70, maxZ: 540 }),
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
  const groundRoot = place(assets.exteriorGround, outside, [0,0,0], [0,0,0], 1, { collide: false });
  // The sun's shadow camera covers ninety metres of compound. The skirt and the
  // far fields run to five hundred, so most of their area lies outside that
  // frustum entirely — where the shadow lookup clamps and the result crawls
  // across acres of flat ground as the light moves. Nothing that far out can
  // receive a shadow worth having, so it does not ask for one.
  groundRoot.traverse((part) => {
    if (!part.isMesh) return;
    if (/^(ExteriorSkirt|FarField_)/.test(part.name)) part.receiveShadow = false;
    // Flat ground never casts anything either; only the props on it do.
    part.castShadow = false;
  });
  place(assets.exteriorEntrance, outside, [0,0,-17], [0,0,0], 1, { shrink: 0.12 });

  // Sun, moon, stars, cloud and rain, all on the shelter's own clock. The
  // surface used to be one fixed night with a single hard moonlight in it.
  // Thirty minutes to the day. At four the sun crossed the sky fast enough to
  // watch: shadows crawled across the yard while the player stood still, and
  // every edge in the compound shimmered as the shadow map chased it. Half an
  // hour still gets you dawn, noon, dusk and night in one sitting without the
  // surface being visibly in motion when nothing is moving.
  const sky = createSky({ scene: outside, dayLength: 1800, startAt: 0.30 });

  // The perimeter. Four-metre bays of security fence: footings, line posts,
  // top rail, tension wire, chain link and three strands of barbed wire on
  // angled outriggers. It is not a new fence — fifteen years of weather and
  // whatever came through it have left bays leaning, torn and flat, and where
  // it is down is where anything gets in.
  const BREACH = new Set(['N:-2', 'W:3', 'S:-4']);
  const LEANING = new Set(['N:2', 'E:-3', 'E:2', 'W:-2', 'S:3']);
  // One bay in five carries the warning plate, as a real run does.
  const SIGNED = new Set(['N:-4', 'N:1', 'E:-1', 'E:4', 'W:-5', 'W:1', 'S:4']);
  const fenceBay = (run, index, position, rotation) => {
    const key = `${run}:${index}`;
    const asset = BREACH.has(key) ? (assets.fenceDown || assets.fence)
      : LEANING.has(key) ? (assets.fenceTorn || assets.fence)
        : SIGNED.has(key) ? (assets.fenceSigned || assets.fence)
          : assets.fence;
    // A flattened bay is not a wall: leave the gap in the collision too.
    place(asset, outside, position, rotation, 1, { collide: !BREACH.has(key) });
  };
  for (let i = -4; i <= 4; i++) fenceBay('N', i, [i * 4, 0, -27], [0, 0, 0]);
  for (let i = -5; i <= 4; i++) {
    fenceBay('W', i, [-20, 0, i * 4 - 5], [0, Math.PI / 2, 0]);
    fenceBay('E', i, [20, 0, i * 4 - 5], [0, Math.PI / 2, 0]);
  }
  for (let i = -4; i <= -2; i++) fenceBay('S', i, [i * 4 - 2, 0, 18], [0, 0, 0]);
  for (let i = 2; i <= 4; i++) fenceBay('S', i, [i * 4 - 2, 0, 18], [0, 0, 0]);
  place(assets.gate,outside,[0,0,18],[0,0,0]);

  // Exterior lighting fixtures are Blender models; only emitted light is runtime.
  const floodPositions=[[-14,0,-20],[14,0,-20],[-14,0,11],[14,0,11]];
  const floodLights=[];
  floodPositions.forEach(([x,y,z])=>{
    place(assets.floodlight,outside,[x,y,z],[0,0,0],1,{ shrink: 0.1 });
    const l=new THREE.SpotLight(0xdbeaf0,4.5,34,.62,.45,1.6);
    l.position.set(x,4.35,z);
    l.target.position.set(x*.35,0,z*.35);
    outside.add(l,l.target);
    floodLights.push(l);
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
  let solarGlow = null;
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
    solarGlow = new THREE.PointLight(0x8fb3c4, 4.5, 24, 2.0);
    solarGlow.position.set(14.2, 3.6, -8.4);
    outside.add(solarGlow);
  }

  // The yard, laid out as a yard rather than scattered.
  //
  // Everything up here has a job and a place to be: stores along the north
  // wall, vehicles parked at the gate, the range down the west side and the
  // solar field down the east. The middle stays clear — it is the apron the
  // shelter's stair comes up onto, and the route between the gate and the door
  // has to read at a glance. Loose props dropped at random across the whole
  // compound looked like a scrapyard, not a place anyone was keeping.
  const dress = (asset, entries, options = {}) => {
    if (!asset) return;
    for (const [x, z, r, scale = 1] of entries) {
      place(asset, outside, [x, 0, z], [0, r, 0], scale, options);
    }
  };

  // North wall: the stores yard. Containers in a line, tower behind them.
  dress(assets.propContainer, [[-13.6, -23.4, 0], [-6.4, -23.4, 0]]);
  dress(assets.propContainerRed, [[0.8, -23.4, 0]]);
  dress(assets.propWaterTower, [[10.4, -24.6, .35]], { shrink: 0.35 });
  dress(assets.propBarrel, [
    [-15.2, -20.4, .3], [-14.4, -20.9, 1.2], [-15.6, -21.3, 2.4],
    [4.6, -21.6, .8], [5.4, -22.1, 2.1],
  ]);
  dress(assets.propPipes, [[-2.4, -20.8, 0], [-1.6, -21.4, 0]]);

  // Gate end: what came in and never went out again.
  dress(assets.propTruck, [[6.8, 13.8, 3.02], [-6.8, 13.8, 3.02]]);
  dress(assets.propPallet, [[10.6, 9.4, .2], [11.4, 10.1, 1.1]]);
  dress(assets.propPalletBroken, [[10.1, 11.0, 2.2]]);
  dress(assets.propWheels, [[12.4, 12.2, .3]]);
  dress(assets.propTrashBags, [[-10.4, 12.2, .9], [-11.2, 13.0, 2.6]], { collide: false });
  dress(assets.propTownSign, [[0, 21.6, 0]], { shrink: 0.2 });

  // Cars. Two wrecks that were abandoned in the yard, and one at the gate that
  // still has glass in it — the one that will eventually be worth the drive.
  dress(assets.estateCar, [[-12.2, 6.4, 1.42], [13.2, -6.8, 2.86]], { shrink: 0.05 });
  const gateCar = assets.estateCar ? place(assets.estateCar, outside,
    [2.8, 0, 16.2], [0, Math.PI * 0.02, 0], 1, { shrink: 0.05 }) : null;
  if (gateCar) {
    gateCar.name = 'Gate_Estate_Car';
    addInteraction(gateCar, 'ESTATE CAR — NOT RUNNING', 'outside',
      () => window.dispatchEvent(new CustomEvent('lostsignal:car')));
  }

  // --- The road out -------------------------------------------------------
  // A B-road running from the gate to the town, half a kilometre of it, laid as
  // forty-metre sections. Nothing has maintained it for fifteen years: about
  // one length in four is cratered or lifted, and what was on it when it
  // happened is still on it.
  const TOWN_BEARING = -0.42;
  const roadDirection = new THREE.Vector3(Math.sin(TOWN_BEARING), 0, Math.cos(TOWN_BEARING));
  const roadPoint = (distance, across = 0) => [
    roadDirection.x * distance + Math.cos(TOWN_BEARING) * across,
    0,
    18 + roadDirection.z * distance - Math.sin(TOWN_BEARING) * across,
  ];
  if (assets.road) {
    const DAMAGED = new Set([2, 5, 6, 9, 11]);
    for (let section = 0; section < 12; section++) {
      const asset = DAMAGED.has(section) ? (assets.roadDamaged || assets.road) : assets.road;
      place(asset, outside, roadPoint(20 + section * 40), [0, TOWN_BEARING, 0], 1,
        { collide: false });
    }
  }

  // What is still on it. Wrecks nose to tail where the queue stopped, debris
  // where something came down, and the traffic furniture that was already
  // there when it did.
  const alongRoad = (asset, entries, options = {}) => {
    if (!asset) return;
    for (const [distance, across, spin, scale = 1] of entries) {
      place(asset, outside, roadPoint(distance, across),
        [0, TOWN_BEARING + spin, 0], scale, options);
    }
  };
  alongRoad(assets.wreckCar, [
    [26, -1.6, 0.06], [34, 1.5, -0.22], [48, -1.4, 1.62], [63, 1.7, 0.10],
    [96, -1.5, 0.34], [104, 1.6, 2.90], [148, -1.7, 0.18], [206, 1.5, -0.42],
    [268, -1.4, 1.20], [352, 1.6, 0.28],
  ], { collide: false });
  alongRoad(assets.propTruck, [[74, -1.8, 0.24], [318, 1.9, 2.68]], { collide: false });
  alongRoad(assets.debrisField, [
    [40, 5.5, 0.4], [88, -6.0, 1.9], [132, 6.5, 0.8], [190, -5.5, 2.6],
    [244, 6.0, 1.3], [300, -6.5, 0.5], [386, 5.0, 2.1],
  ], { collide: false });
  alongRoad(assets.propBarrier, [
    [18, -1.2, 0], [18, 0.2, 0], [18, 1.6, 0],
    [176, -1.0, 0.3], [176, 0.6, -0.2],
  ], { collide: false });
  alongRoad(assets.propCone, [
    [22, -2.6, 0], [30, 2.5, 0], [120, -2.4, 0], [232, 2.6, 0],
  ], { collide: false });
  alongRoad(assets.propStreetLight, [
    [44, 5.0, 1.57], [124, -5.0, -1.57], [204, 5.0, 1.57], [284, -5.0, -1.57],
    [364, 5.0, 1.57],
  ], { shrink: 0.2, collide: false });
  alongRoad(assets.propTrashBags, [[58, 4.4, 0.6], [212, -4.6, 2.2]], { collide: false });
  // Dead hedgerow along the road, which is what a Berkshire lane actually has.
  if (deadTrees.length) {
    for (let i = 0; i < 22; i++) {
      const distance = 34 + i * 19;
      const side = i % 2 ? 1 : -1;
      place(deadTrees[i % deadTrees.length], outside,
        roadPoint(distance, side * (8.5 + (i % 3) * 1.4)),
        [0, i * 1.1, 0], 0.85 + (i % 4) * 0.08, { collide: false });
    }
  }

  // The town, on the horizon to the south-west past the gate. Not a place you
  // can walk into yet — it is six hundred metres of dead field away, drawn as
  // the silhouette it would be at that range, so there is somewhere to go.
  const townMaterials = [];
  if (assets.distantTown) {
    const town = place(assets.distantTown, outside, [-210, 0, 470], [0, -0.42, 0], 1,
      { collide: false });
    town.name = 'Distant_Town';
    // It sits far beyond the fog's useful range — at half a kilometre the
    // exponential fog is total, and the town would simply be the fog colour.
    // Take it out of the fog and apply aerial perspective by hand instead, so
    // it washes toward whatever the horizon is doing at that hour.
    town.traverse((part) => {
      if (!part.isMesh) return;
      part.material = part.material.clone();
      part.material.fog = false;
      part.castShadow = false;
      part.receiveShadow = false;
      part.material.userData.baseColor = part.material.color.clone();
      townMaterials.push(part.material);
    });
  }
  dress(assets.propStreetLight, [[-4.2, 17.2, 1.6], [4.2, 17.2, -1.6]], { shrink: 0.2 });

  // The route from the gate to the shelter door, marked out rather than
  // obstructed: cones down one side, a barrier line short of the entrance.
  dress(assets.propCone, [
    [-3.2, 14.0, 0], [-3.2, 9.0, 0], [-3.2, 4.0, 0],
    [3.2, 14.0, 0], [3.2, 9.0, 0], [3.2, 4.0, 0],
  ], { collide: false });
  dress(assets.propBarrier, [[-2.6, -8.4, 0], [-1.3, -8.4, 0], [1.3, -8.4, 0], [2.6, -8.4, 0]]);
  dress(assets.propChest, [[-4.8, -7.6, .6]]);

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

  // Somewhere to find out what the armoury's twenty-six weapons actually do.
  const range = createRange({
    scene: outside,
    colliders: colliders.outside,
    assets,
    place,
    addInteraction,
  });

  // Nothing on the surface should read as a hole cut in the picture. A few of
  // the supplied props are painted so dark that under a moon they came out as
  // flat black rectangles — an army truck at the gate looked like a missing
  // wall. Lift the floor on albedo without touching anything already visible.
  const lifted = new Map();
  const liftFromBlack = (material) => {
    if (!material?.color) return material;
    if (lifted.has(material)) return lifted.get(material);
    const luminance = material.color.r * 0.29 + material.color.g * 0.59 + material.color.b * 0.12;
    if (luminance >= 0.055) {
      lifted.set(material, material);
      return material;
    }
    const copy = material.clone();
    copy.color.addScalar(0.055 - luminance);
    lifted.set(material, copy);
    return copy;
  };
  outside.traverse((part) => {
    if (!part.isMesh) return;
    part.material = Array.isArray(part.material)
      ? part.material.map(liftFromBlack) : liftFromBlack(part.material);
  });

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
  rain.visible=false;
  outside.add(rain);

  // Dust on the wind. Dry Berkshire pasture with nothing holding it down: the
  // air over the compound is never clean, and it is what sells the floodlight
  // beams and the low sun.
  const outdoorDustCount = 420;
  const outdoorDustGeo = new THREE.BufferGeometry();
  const outdoorDustPositions = new Float32Array(outdoorDustCount * 3);
  const outdoorDustDrift = [];
  for (let i = 0; i < outdoorDustCount; i++) {
    outdoorDustPositions[i * 3] = (Math.random() - .5) * 64;
    outdoorDustPositions[i * 3 + 1] = Math.random() * 9;
    outdoorDustPositions[i * 3 + 2] = (Math.random() - .5) * 70;
    outdoorDustDrift.push(.25 + Math.random() * .7);
  }
  outdoorDustGeo.setAttribute('position', new THREE.BufferAttribute(outdoorDustPositions, 3));
  const outdoorDust = new THREE.Points(outdoorDustGeo, new THREE.PointsMaterial({
    color: 0xcfc6b2, size: .035, transparent: true, opacity: .22, depthWrite: false,
  }));
  outdoorDust.frustumCulled = false;
  outside.add(outdoorDust);

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

  // Scratch working space for measuring the held model.
  // How long each class of weapon is held at, in metres down the firing line.
  // A viewmodel is deliberately larger than life — that is standard — but it
  // has to be consistently so, and the per-model scales guessed at conversion
  // time were not: they left the Mossberg at two fifths the size of the other
  // shotguns and the AKM short of every other rifle.
  const HELD_LENGTH = {
    rifle: 0.86, smg: 0.74, shotgun: 0.95, sniper: 1.15,
    pistol: 0.40, revolver: 0.40, blade: 0.36,
  };
  // Where the centre of the held model sits relative to the rig point. A long
  // gun is carried further forward so its butt does not swing through the
  // camera; a handgun is held closer in.
  const HELD_NUDGE = {
    rifle: [0, 0.09, -0.10], smg: [0, 0.08, -0.08], shotgun: [0, 0.09, -0.12],
    sniper: [0, 0.09, -0.16], pistol: [0, 0.02, -0.02], revolver: [0, 0.02, -0.02],
    blade: [0.01, 0.03, -0.02],
  };
  const _weaponBox = new THREE.Box3();
  const _weaponSize = new THREE.Vector3();
  const _weaponCentre = new THREE.Vector3();
  const _vertex = new THREE.Vector3();

  /**
   * Which way the barrel points, decided from the model rather than a table.
   *
   * The packs do not agree on an axis, some carry a residual node rotation from
   * conversion, and there are twenty-six of them — a per-weapon flag was always
   * going to be wrong somewhere, and pointing a muzzle at the player's own face
   * is the worst way to find out. Every firearm is back-heavy: stock, grip,
   * magazine and action are all behind the barrel. So weigh the vertices. The
   * mass centroid sits behind the middle of the bounding box, and the muzzle is
   * the other way.
   *
   * Returns a unit vector along the model's own axes, or null if the model has
   * no usable geometry.
   */
  /**
   * Where the weight sits along the firing line, as a signed fraction of the
   * model's length: positive means the mass is behind the middle, which is
   * what a correctly-pointed weapon looks like.
   *
   * Falls back to which half is deeper — the back of a weapon carries a stock
   * or a grip hanging off the line of the barrel, the muzzle end is just
   * barrel — for models too symmetric along their length to read, which is
   * most handguns.
   */
  function massBias(model) {
    model.updateWorldMatrix(true, true);
    _weaponBox.setFromObject(model);
    _weaponBox.getSize(_weaponSize);
    _weaponBox.getCenter(_weaponCentre);
    const span = _weaponSize.z;
    if (span < 1e-5) return 1;

    let total = 0;
    let sum = 0;
    let lowDepth = 0;
    let highDepth = 0;
    for (const mesh of collectMeshes(model)) {
      const position = mesh.geometry?.attributes?.position;
      if (!position) continue;
      const stride = Math.max(1, Math.floor(position.count / 400));
      for (let i = 0; i < position.count; i += stride) {
        _vertex.fromBufferAttribute(position, i).applyMatrix4(mesh.matrixWorld);
        sum += _vertex.z;
        total++;
        const drop = Math.abs(_vertex.y - _weaponCentre.y);
        if (_vertex.z < _weaponCentre.z) lowDepth = Math.max(lowDepth, drop);
        else highDepth = Math.max(highDepth, drop);
      }
    }
    if (!total) return 1;
    const bias = (sum / total - _weaponCentre.z) / span;
    if (Math.abs(bias) >= 0.02) return bias;
    return (highDepth - lowDepth) || 1;
  }

  function collectMeshes(root) {
    const meshes = [];
    root.traverse((part) => { if (part.isMesh || part.isSkinnedMesh) meshes.push(part); });
    return meshes;
  }
  /**
   * Which way the barrel points, decided from the model rather than a table.
   *
   * The packs do not agree on an axis, some carry a residual node rotation from
   * conversion, and there are twenty-six of them — a per-weapon flag was always
   * going to be wrong somewhere, and pointing a muzzle at the player's own face
   * is the worst way to find out. Every firearm is back-heavy: stock, grip,
   * magazine and action are all behind the barrel. So weigh the vertices. The
   * mass centroid sits behind the middle of the bounding box, and the muzzle is
   * the other way.
   *
   * Returns a unit vector along the model's own axes, or null if the model has
   * no usable geometry.
   */
  function muzzleAxis(model) {
    model.updateWorldMatrix(true, true);
    _weaponBox.setFromObject(model);
    _weaponBox.getSize(_weaponSize);
    _weaponBox.getCenter(_weaponCentre);
    const axis = _weaponSize.x >= _weaponSize.z ? 'x' : 'z';
    const span = _weaponSize[axis];
    if (span < 1e-5) return null;

    let total = 0;
    let sum = 0;
    // ...and how deep each half is. The back of a weapon carries a stock or a
    // grip hanging off the line of the barrel; the muzzle end is just barrel.
    let lowHeight = 0;
    let highHeight = 0;
    for (const mesh of collectMeshes(model)) {
      const position = mesh.geometry?.attributes?.position;
      if (!position) continue;
      // A few hundred vertices are plenty to find a centre of mass, and keep a
      // weapon swap off the frame budget.
      const stride = Math.max(1, Math.floor(position.count / 400));
      for (let i = 0; i < position.count; i += stride) {
        _vertex.fromBufferAttribute(position, i).applyMatrix4(mesh.matrixWorld);
        sum += _vertex[axis];
        total++;
        const drop = Math.abs(_vertex.y - _weaponCentre.y);
        if (_vertex[axis] < _weaponCentre[axis]) lowHeight = Math.max(lowHeight, drop);
        else highHeight = Math.max(highHeight, drop);
      }
    }
    if (!total) return null;
    const bias = (sum / total - _weaponCentre[axis]) / span;
    // A pistol is near enough symmetric along its length for the weighing to
    // say nothing, so fall back to which half is deeper.
    const heavyEnd = Math.abs(bias) >= 0.02
      ? Math.sign(bias)
      : Math.sign(highHeight - lowHeight);
    if (!heavyEnd) return null;
    const direction = new THREE.Vector3();
    direction[axis] = -heavyEnd;
    return direction;
  }

  function collectMeshes(root) {
    const meshes = [];
    root.traverse((part) => { if (part.isMesh || part.isSkinnedMesh) meshes.push(part); });
    return meshes;
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
    // Four packs, four conventions, and some models carry a residual rotation
    // from conversion. Rather than a table of per-weapon fudges, the model is
    // measured and turned until it is held the way a weapon is held: barrel
    // down the firing line, sights up, and the same size as everything else in
    // its class.
    // The packs disagree about which axis a weapon lies on, which way along it
    // the muzzle is, which way is up, and how big a unit is — and some models
    // carry a residual rotation from conversion on top of that. Rather than a
    // table of per-weapon fudges, the model is measured and turned until it is
    // held the way a weapon is held.
    model.rotation.set(0, 0, 0);
    model.scale.setScalar(1);
    // These four steps each assume the ones before it have already happened,
    // so they have to compose in that order. Three.js's default XYZ Euler
    // applies Z first, which meant the roll in step 3 was being applied before
    // the yaw in step 2 — and the combat knife came out pointing at the sky,
    // three metres tall, whatever the steps said. ZYX applies X, then Y, then
    // Z, which is the order they are written in.
    model.rotation.order = 'ZYX';

    // 1. Put the longest axis on the firing line, whichever it started on.
    //    The combat knife's is vertical, which no amount of yaw would fix.
    measureHeld(model);
    if (_weaponSize.x >= _weaponSize.y && _weaponSize.x >= _weaponSize.z) {
      model.rotation.y = Math.PI / 2;
    } else if (_weaponSize.y >= _weaponSize.x && _weaponSize.y >= _weaponSize.z) {
      model.rotation.x = -Math.PI / 2;
    }
    measureHeld(model);

    // 2. Point it away. Every firearm is back-heavy — stock, grip, magazine
    //    and action all sit behind the barrel — and a blade's handle outweighs
    //    its blade, so the light end is the end that goes downrange. `flip`
    //    remains a last-resort override for a model too symmetric to read.
    const backHeavy = massBias(model);
    if ((backHeavy < 0) !== !!view.flip) model.rotation.y += Math.PI;
    measureHeld(model);

    // 3. Roll: a weapon is taller than it is wide, so anything measuring wider
    //    than tall is lying on its side. Rolling about the firing line cannot
    //    disturb what steps 1 and 2 established.
    if (_weaponSize.x > _weaponSize.y * 1.15) {
      model.rotation.z = Math.PI / 2;
      measureHeld(model);
    }

    // 4. Scale to the length its class is held at, rather than to a number
    //    guessed per model at conversion time — that guess had the Mossberg at
    //    two fifths the size of the other shotguns. Two passes so it lands
    //    exactly whatever scale the model arrived with.
    const family = WEAPONS[heldKey]?.family;
    const wanted = HELD_LENGTH[family];
    if (wanted) {
      for (let pass = 0; pass < 2 && _weaponSize.z > 1e-4; pass++) {
        model.scale.multiplyScalar(wanted / _weaponSize.z);
        measureHeld(model);
      }
    } else {
      model.scale.setScalar(view.scale);
    }

    // 5. Sit it on the rig point. With every weapon now scaled to its class,
    //    the per-model offsets guessed alongside the old per-model scales no
    //    longer meant anything — they left the AKM and the scout rifle half
    //    out of frame while the Mossberg sat square. Centring the measured
    //    model and nudging by class frames all twenty-six the same way.
    _weaponBox.getCenter(_weaponCentre);
    const nudge = HELD_NUDGE[family] || HELD_NUDGE.rifle;
    model.position.set(nudge[0] - _weaponCentre.x, nudge[1] - _weaponCentre.y,
      nudge[2] - _weaponCentre.z);
    model.name = `Equipped_${heldKey || 'Rifle'}`;
    weaponAction.add(model);
    heldModel = model;
    return model;
  }

  /** The model's extents in the rig's own frame, with its current transform. */
  function measureHeld(model) {
    model.updateWorldMatrix(true, true);
    _weaponBox.setFromObject(model);
    _weaponBox.getSize(_weaponSize);
    return _weaponSize;
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
    if (kind === 'shoot') return;
    if (kind !== 'reload') return;
    const weapon = WEAPONS[heldKey];
    actionStyle = weapon?.family === 'sniper' && /bolt|materiel/i.test(weapon.name)
      ? 'bolt'
      : (ACTION_STYLE[weapon?.family] || 'magazine');
    actionLength = Math.max(.25, seconds || weapon?.reloadTime || 1.2);
    actionTimer = actionLength;
  }

  function updateAction(dt) {
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
    if (world === 'outside') range?.update(dt);
    // Time passes wherever the player is standing. The sky is a few dozen
    // sums and a handful of uniform writes, so it runs every frame and the
    // surface is never waiting at the moment you left it.
    sky.update(dt);
    creatures.update(dt, world, playerPosition);
    residents?.update(dt, world, playerPosition);
    armory?.update(dt);
    updateAction(dt);
    if (blastLeaf) blastLeaf.position.x = THREE.MathUtils.damp(blastLeaf.position.x,doorOpen?3.55:0,3.4,dt);
    if (hatchHinge) hatchHinge.rotation.x = THREE.MathUtils.damp(
      hatchHinge.rotation.x, hatchOpen ? 1.38 : 0, 5.2, dt);
    dust.rotation.y += dt*.008;

    // Weather. The rain is the sky's, not a permanent fixture of the surface.
    if (world === 'outside') {
      // Two per cent of a rainstorm is not rain, it is three hundred streaks
      // twitching over a dry compound. Hold the rain back until there is
      // actually weather to show.
      rain.visible = sky.state.rain > 0.12;
      rainMat.opacity = 0.05 + sky.state.rain * 0.20;
      // Compound lighting is on a photocell, like every real yard light: it
      // burns through the night and shuts off when there is daylight to see by.
      // Dust settles in the wet and lifts when it is dry and bright.
      const array = outdoorDustGeo.attributes.position.array;
      for (let i = 0; i < outdoorDustCount; i++) {
        array[i * 3] += outdoorDustDrift[i] * dt * 1.6;
        array[i * 3 + 1] += Math.sin(elapsed * .6 + i) * dt * .08;
        if (array[i * 3] > 32) {
          array[i * 3] = -32;
          array[i * 3 + 2] = (Math.random() - .5) * 70;
        }
      }
      outdoorDustGeo.attributes.position.needsUpdate = true;
      outdoorDust.material.opacity = .06 + (1 - sky.state.rain) * .18 * (.4 + sky.state.dayFactor * .6);
      const night = 1 - sky.state.dayFactor;
      for (const light of floodLights) light.intensity = 4.5 * night;
      if (range?.lamp) range.lamp.intensity = 5.5 * night;
      if (solarGlow) solarGlow.intensity = 4.5 * night;
      // Aerial perspective on the town: half a kilometre of air takes most of
      // the colour out of it and leaves whatever the horizon is doing.
      const horizon = sky.uniforms.horizon.value;
      for (const material of townMaterials) {
        material.color.copy(material.userData.baseColor).lerp(horizon, 0.58);
      }
    }
    if (!rain.visible) return;
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
    bunkerLights,emergency,siloWorld,armory,garrison,range,sky,floodLights,
    doorOpen:()=>doorOpen,
    hatchOpen:()=>hatchOpen,
  };
}

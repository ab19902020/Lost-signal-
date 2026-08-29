import * as THREE from 'three';
import { cloneGLTF, findNamed } from './assets.js';
import { ColliderSet } from './physics.js';
import { createCreatureSystem, populateSilo } from './creatures.js';
import { buildSilo } from './silo.js';
import { buildArmory } from './armory.js';
import { buildGarrison } from './garrison.js';
import { createRange } from './range.js';
import { createSky } from './sky.js';
import { createVehicle, SEAT_HEIGHT, SEAT_X, SEAT_Z, CABIN_HEADROOM } from './vehicle.js';
import { createCarThief } from './car_thief.js';
import { createAircraft } from './aircraft.js';
import { createPlayerCharacter } from './player_character.js';
import { createTownEnemies } from './town_enemies.js';
import { WEAPONS, DEFAULT_WEAPON } from './weapons.js';

// V3 WORLD RULE:
// No visible architecture/props are authored with Three.js geometry.
// Three.js geometry below is limited to particles/effects. All physical world
// objects are Blender-authored GLBs loaded through assets.js.
export function createGameWorld(assets, options = {}) {
  // How much of the countryside to plant. A phone gets a third of it; the
  // layout is identical either way, so nothing moves between tiers — there is
  // simply less of it.
  const foliage = options.foliage ?? 1;
  const bunker = new THREE.Scene();
  bunker.background = new THREE.Color(0x030504);
  bunker.fog = new THREE.FogExp2(0x050807, 0.019);

  const outside = new THREE.Scene();
  // The surface had no sky and a near-black fog at twice the density it needed,
  // so anything more than about thirty metres out — the fence, the treeline,
  // the far end of the compound — fell into a void with a hard edge where the
  // floodlights stopped. It now runs a real clock: sun, moon, stars and
  // weather, with the fog tracking the horizon so distance is haze, not void.
  outside.fog = new THREE.FogExp2(0x141d26, 0.0008);

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
  const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.15, 2600);
  const _cullPoint = new THREE.Vector3();   // reused: light culling runs every frame
  const _interactionPoint = new THREE.Vector3();
  const _interactionCamera = new THREE.Vector3();
  camera.rotation.order = 'YXZ';
  camera.position.set(0, 1.67, 0);
  player.add(camera);
  const playerCharacter = createPlayerCharacter(assets.playerCharacter, assets.enemyOldManBlack);
  player.add(playerCharacter.root);
  player.position.set(0, 0, 5.0);
  bunker.add(player);

  const interactions = [];
  const colliders = {
    bunker: new ColliderSet({ minX: -6.55, maxX: 6.55, minZ: -6.85, maxZ: 6.85 }),
    // The surface used to be a hard box the size of the compound, which is why
    // walking out of the gate put you straight back inside it. Then it was a
    // box drawn around the compound, the road and the town — which was fine
    // until there was an airfield, and then it was an invisible wall between
    // the player and an aeroplane they could see. What actually stops anyone
    // is the fence, and where the fence is down, nothing does; this is only
    // the edge of the ground itself, and it is now a long way out on every
    // side, because the point of having something with a wing on it is being
    // able to go somewhere with it.
    outside: new ColliderSet({ minX: -1000, maxX: 1000, minZ: -1000, maxZ: 1100 }),
    // The silo's enclosure is its ring of wall panels, not a rectangle.
    silo: new ColliderSet(null),
  };
  const bunkerLights = [];

  function addInteraction(object, name, world, onUse) {
    object.userData.interaction = { name, world, onUse };
    interactions.push(object);
  }

  // --- Scattering the countryside ------------------------------------------
  // A field needs hundreds of things standing in it, and hundreds of cloned
  // glTF subtrees is hundreds of draw calls. Everything scattered by the dozen
  // or more goes through one InstancedMesh per source mesh instead, with the
  // asset's own internal transform folded into every instance matrix.
  const _instanceMatrix = new THREE.Matrix4();
  const _instancePosition = new THREE.Vector3();
  const _instanceQuaternion = new THREE.Quaternion();
  const _instanceScale = new THREE.Vector3();

  /**
   * Scatter one asset across the surface as instanced geometry.
   *
   * `placements` are [x, z, rotationY, scale, tiltX, tiltZ] — a lean is what
   * stops a hundred copies of one bush reading as a hundred copies of one bush.
   */
  function scatter(gltf, placements, options = {}) {
    if (!gltf || !placements.length) return null;
    const source = cloneGLTF(gltf);
    source.updateMatrixWorld(true);
    const group = new THREE.Group();
    group.name = options.name || 'Scatter';
    const meshes = [];
    source.traverse((o) => { if (o.isMesh) meshes.push(o); });
    for (const mesh of meshes) {
      const local = mesh.matrixWorld.clone();
      const instanced = new THREE.InstancedMesh(mesh.geometry, mesh.material, placements.length);
      instanced.name = `${group.name}_${mesh.name}`;
      instanced.castShadow = options.castShadow ?? false;
      instanced.receiveShadow = options.receiveShadow ?? true;
      // The instances cover the whole map; the source geometry's bounding
      // sphere describes one of them, so three would cull the entire field the
      // moment the camera turned away from wherever the asset's origin is.
      instanced.frustumCulled = false;
      placements.forEach(([x, z, spin = 0, scale = 1, tiltX = 0, tiltZ = 0], index) => {
        _instancePosition.set(x, options.y ?? 0, z);
        _instanceQuaternion.setFromEuler(new THREE.Euler(tiltX, spin, tiltZ, 'ZYX'));
        _instanceScale.setScalar(scale);
        _instanceMatrix.compose(_instancePosition, _instanceQuaternion, _instanceScale);
        _instanceMatrix.multiply(local);
        instanced.setMatrixAt(index, _instanceMatrix);
      });
      instanced.instanceMatrix.needsUpdate = true;
      group.add(instanced);
    }
    outside.add(group);
    return group;
  }

  // Which asset each loaded glTF came from, so a placed prop can carry the name
  // of the thing it is. Without it the world is three hundred anonymous groups
  // and no harness can ask how tall the chair is.
  const assetNames = new Map();
  for (const [key, value] of Object.entries(assets)) {
    if (value && typeof value === 'object' && !assetNames.has(value)) assetNames.set(value, key);
  }
  const propName = (gltf) => {
    const key = assetNames.get(gltf);
    return key ? `Prop_${key[0].toUpperCase()}${key.slice(1)}` : 'Prop';
  };

  // --- Life size ------------------------------------------------------------
  //
  // The architecture and the outdoor props were tuned against real dimensions;
  // the furniture never was, and it came out of Blender at roughly twice life
  // size. The operator chair was 2.03 m tall with a 1.29 m seat - a throne -
  // standing next to a correctly proportioned 1.78 m man, which is exactly
  // what "he looks too small next to the chair" means. Nothing was wrong with
  // the man.
  //
  // Measuring a whole model is the wrong question for anything with a stalk on
  // it: the desk is "1.14 m tall" only because a monitor stands on it, and the
  // CCTV console because a pendant light hangs over it. What a person reads is
  // the surface they would touch, so where a model names one, the target is the
  // height of that surface in life - a desk worktop at 0.74 m, a task chair
  // seat at 0.47 m, a workbench at 0.92 m - and the rest follows from it.
  //
  // These sizes are absolute. The scale argument at the call site was tuned
  // against the old oversized baseline, so for anything listed here it is
  // deliberately ignored rather than compounded.
  const LIFE_SIZE = Object.freeze({
    chair:        { ref: 'Chair_Seat', top: 0.47 },
    cctv:         { ref: 'Desk_0', top: 0.74 },
    desk:         { ref: 'Desk_Top', top: 0.74 },
    bench:        { ref: 'BenchTop', top: 0.92 },
    generator:    { ref: 'Generator_Frame', top: 1.58 },
    radio:        { ref: 'Radio_Body', top: 0.28 },
    // The one model that is not merely large but out of proportion: a 4.2 m
    // long double bed with a nearly correct frame height. It needs two numbers.
    bed:          { ref: 'Mattress', top: 0.55, length: 2.05 },
    lockers:      { height: 1.95 },
    storage:      { height: 2.10 },
    clutter:      { height: 0.86 },
    electrical:   { height: 2.05 },
    ventilation:  { height: 2.35 },
    accessControl:{ height: 0.45 },
    statusBoard:  { height: 1.05 },
    habDirectory: { height: 1.90 },
    siloCache:    { height: 0.85 },
    rangeTarget:  { height: 1.80 },
    wallCamera:   { height: 0.22 },
    propBarrel:   { height: 0.88 },
    propBarrier:  { height: 1.05 },
  });
  const _lifeBox = new THREE.Box3();
  const _lifeSize = new THREE.Vector3();
  const lifeScales = new Map();

  // Measured once per asset, not once per placement: the shelter alone places
  // some of these six times. Returns null for anything not on the list, which
  // then keeps the scale its call site asked for.
  function lifeScale(gltf) {
    if (lifeScales.has(gltf)) return lifeScales.get(gltf);
    const want = LIFE_SIZE[assetNames.get(gltf)];
    let factor = null;
    const scene = gltf?.scene ?? gltf;
    if (want && scene) {
      scene.updateMatrixWorld(true);
      let subject = scene;
      if (want.ref) {
        scene.traverse((part) => { if (part.name === want.ref) subject = part; });
      }
      _lifeBox.setFromObject(subject);
      _lifeBox.getSize(_lifeSize);
      const vertical = want.top ? want.top / Math.max(_lifeBox.max.y, 1e-4)
        : want.height / Math.max(_lifeSize.y, 1e-4);
      if (want.length) {
        const along = want.length / Math.max(_lifeSize.x, _lifeSize.z, 1e-4);
        factor = new THREE.Vector3(along, vertical, along);
      } else {
        factor = new THREE.Vector3(vertical, vertical, vertical);
      }
    }
    lifeScales.set(gltf, factor);
    return factor;
  }

  // Collision comes from the placed Blender geometry itself, so props can never
  // drift away from their hand-typed blocking rectangle again.
  function place(gltf, parent, pos, rot = [0,0,0], scale = 1, options = {}) {
    const root = cloneGLTF(gltf);
    // glTF roots arrive called "Scene" or "Root_Scene". Overwrite that with the
    // name of the asset, so what is in the world says what it is.
    root.name = options.name || propName(gltf);
    root.position.set(...pos);
    root.rotation.set(...rot);
    const life = lifeScale(gltf);
    if (life) root.scale.copy(life); else root.scale.setScalar(scale);
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

  // The uploaded building scans contain hundreds of thousands of triangles.
  // They stay intact for rendering, while gun rays use one invisible bounds
  // mesh apiece. This turns a shotgun impact from millions of triangle tests
  // into twelve, without putting any generated geometry on screen.
  const ballisticProxyMaterial = new THREE.MeshBasicMaterial({ visible: false });
  function addBallisticProxy(root, name) {
    root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const centre = box.getCenter(new THREE.Vector3());
    if (box.isEmpty() || size.lengthSq() < .01) return null;
    root.traverse((part) => {
      if (part.isMesh || part.isSkinnedMesh) part.userData.skipBallistics = true;
    });
    const proxy = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z),
      ballisticProxyMaterial);
    proxy.name = `${name}_BallisticProxy`;
    proxy.position.copy(centre);
    proxy.userData.ballisticProxy = true;
    proxy.userData.ballisticProxyFor = name;
    proxy.castShadow = false;
    proxy.receiveShadow = false;
    outside.add(proxy);
    return proxy;
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

  // Sits on the desk, so it moves with the desk's worktop rather than at a
  // height that was only ever right for the oversized one.
  const radio = place(assets.radio, bunker, [3.55,.75,-2.85], [0,0,0], 1, { collide: false });
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

  const exitPanel = place(assets.accessControl, bunker, [-1.82,1.12,-6.96], [0,0,0], 1, { collide: false });
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
  // Flat ground never casts anything; only the props standing on it do. It
  // used to be a stack of coplanar layers, and half of them had to opt out of
  // receiving shadows as well because the lookup crawled where they ran past
  // the sun's ninety-metre shadow frustum. It is one mesh now, so there is
  // nothing to fight and nothing to opt out.
  groundRoot.traverse((part) => { if (part.isMesh) part.castShadow = false; });
  place(assets.exteriorEntrance, outside, [0,0,-17], [0,0,0], 1, { shrink: 0.12 });

  // Sun, moon, stars, cloud and rain, all on the shelter's own clock. The
  // surface used to be one fixed night with a single hard moonlight in it.
  // Thirty minutes to the day. At four the sun crossed the sky fast enough to
  // watch: shadows crawled across the yard while the player stood still, and
  // every edge in the compound shimmered as the shadow map chased it. Half an
  // hour still gets you dawn, noon, dusk and night in one sitting without the
  // surface being visibly in motion when nothing is moving.
  const sky = createSky({
    scene: outside,
    dayLength: 1800,
    startAt: 0.30,
    shadowSize: options.quality === 'mobile' ? 1024 : 2048,
  });

  // The perimeter. Four-metre bays of security fence: footings, line posts,
  // top rail, tension wire, chain link and three strands of barbed wire on
  // angled outriggers. It is not a new fence — fifteen years of weather and
  // whatever came through it have left bays leaning, torn and flat, and where
  // it is down is where anything gets in.
  const GATE_Z = 17;
  const GATE_SLIDE = 4.05;      // how far each leaf runs out behind the fence
  const GATE_RATE = 0.52;       // fraction of the travel per second
  const GATE_SENSE = 12;        // metres up the drive the loop reads
  const GATE_LEAD = 2.6;        // seconds of closing speed it looks ahead
  const GATE_LANE = 6.5;        // half-width of the approach corridor
  const GATE_DWELL = 2.4;       // seconds held open after the drive clears
  let gateOpen = false;
  let gateSlide = 0;
  let gateMode = 'auto';        // auto | hold | lock
  let gateDwell = 0;
  let gateRoot = null;
  let gateSensed = false;
  let gateIntegrity = 160;
  let siloIntegrity = 180;
  let siloBreached = false;
  const gateLeaves = [];
  const _gateWas = new THREE.Vector3();
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
  // Four metres a bay, and the compound is forty by forty-four, so the runs
  // close on each other at the corners instead of stopping a bay short. The
  // yard used to be open at all four corners and either side of the gate: you
  // could walk out of the compound without ever touching the fence.
  for (let i = -5; i <= 4; i++) fenceBay('N', i, [i * 4 + 2, 0, -27], [0, 0, 0]);
  for (let i = -5; i <= 5; i++) {
    fenceBay('W', i, [-20, 0, i * 4 - 5], [0, Math.PI / 2, 0]);
    fenceBay('E', i, [20, 0, i * 4 - 5], [0, Math.PI / 2, 0]);
  }
  // The south run closes on the gate posts at x = ±4.
  for (let i = -5; i <= -2; i++) fenceBay('S', i, [i * 4 + 2, 0, GATE_Z], [0, 0, 0]);
  for (let i = 2; i <= 5; i++) fenceBay('S', i, [i * 4 - 2, 0, GATE_Z], [0, 0, 0]);
  buildGate();

  // The gate. It is the only way out by road, so it opens: two cantilever
  // leaves that run back behind the fence line, with their collision going
  // with them. The posts stay solid whatever the leaves are doing.
  function buildGate() {
    const root = place(assets.gate, outside, [0, 0, GATE_Z], [0, 0, 0], 1, { collide: false });
    root.name = 'Perimeter_Gate';
    for (const x of [-4, 4]) {
      colliders.outside.addOrientedBox({
        cx: x, cz: GATE_Z, halfX: 0.34, halfZ: 0.34, minY: 0, maxY: 3.45,
      });
    }
    for (const [tag, side] of [['L', -1], ['R', 1]]) {
      const leaf = findNamed(root, `Gate_Leaf_${tag}`);
      if (!leaf) continue;
      gateLeaves.push({
        leaf,
        side,
        rest: leaf.position.x,
        collider: colliders.outside.addOrientedBox({
          cx: leaf.position.x, cz: GATE_Z + leaf.position.z,
          halfX: 1.99, halfZ: 0.16, minY: 0.12, maxY: 2.66,
        }),
      });
    }
    gateRoot = root;
    // The switch on the post is a mode switch, not a button: the gate runs
    // itself, and the three positions are the three things a gate on a road
    // has to be able to be.
    addInteraction(root, gateLabel(), 'outside', () => {
      gateMode = gateMode === 'auto' ? 'hold' : (gateMode === 'hold' ? 'lock' : 'auto');
      gateDwell = 0;
      root.userData.interaction.name = gateLabel();
      window.dispatchEvent(new CustomEvent('lostsignal:gatemode', { detail: { mode: gateMode } }));
    });
  }

  function gateLabel() {
    return gateMode === 'auto' ? 'PERIMETER GATE — AUTO · HOLD OPEN'
      : gateMode === 'hold' ? 'PERIMETER GATE — HELD OPEN · LOCK SHUT'
        : 'PERIMETER GATE — LOCKED SHUT · SET AUTO';
  }

  function setGateMode(mode) {
    if (mode !== 'auto' && mode !== 'hold' && mode !== 'lock') return gateMode;
    if (gateIntegrity <= 0) return gateMode;
    gateMode = mode;
    gateDwell = 0;
    if (gateRoot?.userData.interaction) gateRoot.userData.interaction.name = gateLabel();
    return gateMode;
  }

  function damageGate(amount, enemy) {
    if (gateSlide > .82 || gateIntegrity <= 0) return gateIntegrity <= 0;
    gateIntegrity = Math.max(0, gateIntegrity - Math.max(0, amount));
    window.dispatchEvent(new CustomEvent('lostsignal:gateattack', {
      detail: { integrity: gateIntegrity, maximum: 160, enemy },
    }));
    if (gateIntegrity <= 0) {
      // A breached cantilever gate cannot magically lock again. Run the
      // damaged leaves open so the assault path and the visible prop agree.
      gateMode = 'hold';
      gateDwell = GATE_DWELL;
      if (gateRoot?.userData.interaction) gateRoot.userData.interaction.name = gateLabel();
      window.dispatchEvent(new CustomEvent('lostsignal:gatebreach', {
        detail: { enemy },
      }));
      return true;
    }
    return false;
  }

  function damageSilo(amount, enemy) {
    if (siloBreached) return true;
    siloIntegrity = Math.max(0, siloIntegrity - Math.max(0, amount));
    window.dispatchEvent(new CustomEvent('lostsignal:siloattack', {
      detail: { integrity: siloIntegrity, maximum: 180, enemy },
    }));
    if (siloIntegrity <= 0) {
      siloBreached = true;
      window.dispatchEvent(new CustomEvent('lostsignal:silobreach', {
        detail: { enemy },
      }));
    }
    return siloBreached;
  }

  // The induction loop. A gate on a road opens because something is coming up
  // to it, not because somebody got out and pressed a button, so it reads the
  // approach corridor and — because a car at forty covers the whole sensing
  // range in the time the leaves take to run back — reads how fast whatever
  // is on it is closing, and starts that much earlier.
  function gateSenses(dt, subject) {
    if (!subject) { gateSensed = false; return false; }
    const lateral = Math.abs(subject.x);
    const along = subject.z - GATE_Z;
    let closing = 0;
    if (gateSensed && dt > 1e-5) closing = (Math.abs(_gateWas.z - GATE_Z) - Math.abs(along)) / dt;
    _gateWas.copy(subject);
    gateSensed = true;
    if (lateral > GATE_LANE) return false;
    const trip = GATE_SENSE + THREE.MathUtils.clamp(closing, 0, 26) * GATE_LEAD;
    return Math.abs(along) < trip;
  }

  function updateGate(dt, subject) {
    if (!gateLeaves.length) return;
    // Read the loop even when the gate is locked, so the tracked position
    // stays current and unlocking it does not register a phantom sprint.
    const sensed = gateSenses(dt, subject);
    const near = gateMode !== 'lock' && sensed;
    // Hold it open for a beat after the drive clears, so it does not start
    // shutting on the back bumper of a car that is still in the throat.
    gateDwell = near ? GATE_DWELL : Math.max(0, gateDwell - dt);
    const want = gateMode === 'lock' ? false : (gateMode === 'hold' || near || gateDwell > 0);
    if (want !== gateOpen) {
      gateOpen = want;
      window.dispatchEvent(new CustomEvent('lostsignal:gate', {
        detail: { open: gateOpen, auto: gateMode === 'auto' },
      }));
    }
    const target = gateOpen ? 1 : 0;
    if (Math.abs(gateSlide - target) < 0.0005) {
      gateSlide = target;
      return;
    }
    // A powered gate runs at a fixed speed rather than easing in, so it is
    // driven at a rate instead of damped toward the end stop.
    gateSlide = THREE.MathUtils.clamp(gateSlide + Math.sign(target - gateSlide) * dt * GATE_RATE, 0, 1);
    for (const { leaf, side, rest, collider } of gateLeaves) {
      leaf.position.x = rest + side * GATE_SLIDE * gateSlide;
      collider.cx = leaf.position.x;
    }
  }

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
  // The five dead forms the whole countryside is planted from. They used to be
  // a hand-typed ring of fourteen just outside the wire; they are now scattered
  // by the hundred out to four hundred metres, out of the hedgerows they would
  // actually have grown in. See countryside(), below.
  const deadTrees = [assets.deadTree01, assets.deadTree02, assets.deadTree03,
    assets.deadTree04, assets.deadTree05].filter(Boolean);
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
  // On the verge, not in the road: it used to stand on the centre line just
  // outside the gate, which is a bollard as far as anything driving out is
  // concerned.
  dress(assets.propTownSign, [[6.4, 21.2, 0.22]], { shrink: 0.2 });

  // Cars. Two wrecks were abandoned in the yard; the owner's uploaded Escort
  // beside the shelter is the live test car and is immediately reachable.
  dress(assets.estateCar, [[-12.2, 6.4, 1.42], [13.2, -6.8, 2.86]], { shrink: 0.05 });
  // The gate car is the one that still runs. It is a live vehicle, not a prop:
  // its own body collides with the world, and it comes off the collision set
  // the moment somebody is sitting in it.
  const vehicles = [];
  const gateCar = createVehicle({
    scene: outside, colliders: colliders.outside, assets, place, addInteraction,
    // Directly in the player's first outdoor sightline. The central route is
    // still clear, but the supplied Escort is now only a few steps in front
    // and to the right of the silo exit instead of disappearing into the yard.
    position: [4.8, 0, -8.8], heading: Math.PI,
    name: 'Ford_Escort_RS_Turbo', label: 'FORD ESCORT RS TURBO',
  });
  if (gateCar) vehicles.push(gateCar);

  // --- The airstrip -------------------------------------------------------
  // Four hundred metres of tarmac in the fields east of the compound, laid
  // across the road's line rather than along it so the two never argue about
  // the same ground, with a light single parked on the threshold pointing down
  // it. The road goes to the town; this goes anywhere.
  // Well clear of the compound. Laid at 176 it reached back to x = -40, which
  // put four hundred metres of runway straight through the yard — and the box
  // that was collided around it was an invisible wall across the whole east
  // side of the map.
  const AIRSTRIP_AT = [300, 0, -180];
  const AIRSTRIP_HEADING = Math.PI / 2;
  const aircraft = [];
  if (assets.airstrip) {
    // Never collided as one object: it is flat, and a box around it is a wall
    // the size of the airfield. Only the hangar is something to walk into.
    const strip = place(assets.airstrip, outside, AIRSTRIP_AT, [0, AIRSTRIP_HEADING, 0], 1,
      { collide: false });
    // Walls and drums are solid, one box each so each box is the size of the
    // thing it is around. The roof is not: there is nothing up there to walk
    // into, and a box around it would be a ceiling over the apron.
    strip.traverse((part) => {
      if (part.isMesh && /^Hangar_(Wall|Back|Drum)/.test(part.name)) {
        colliders.outside.addObject(part, { shrink: .1 });
      }
    });
  }
  const strip = createAircraft({
    scene: outside, colliders: colliders.outside, assets, place, addInteraction,
    // On the numbers at the western threshold, lined up down the strip.
    position: [AIRSTRIP_AT[0] - 190, 0, AIRSTRIP_AT[2]],
    heading: -Math.PI / 2,
    name: 'Airstrip_RAF_Aircraft', label: 'RAF AIRCRAFT',
  });
  if (strip) aircraft.push(strip);

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

  // The road ends at exactly the two requested uploads: the blown-out house
  // and the abandoned clinic. The old procedural block town and its third
  // duplicate building are deliberately absent.
  const townBuildings = [];
  function addBuildingPerimeter(root, worldBounds) {
    // A world AABB around a rotated building fills the four empty corner
    // wedges with collision. Those wedges were the invisible walls trapping
    // the old men in town. Measure the upload in the building's own frame and
    // register four thin, rotated perimeter strips instead.
    const inverseRoot = root.matrixWorld.clone().invert();
    const relative = new THREE.Matrix4();
    const localBounds = new THREE.Box3();
    const corner = new THREE.Vector3();
    root.traverse((part) => {
      if (!part.isMesh && !part.isSkinnedMesh) return;
      part.geometry?.computeBoundingBox();
      const bounds = part.geometry?.boundingBox;
      if (!bounds || bounds.isEmpty()) return;
      relative.multiplyMatrices(inverseRoot, part.matrixWorld);
      for (const x of [bounds.min.x, bounds.max.x]) {
        for (const y of [bounds.min.y, bounds.max.y]) {
          for (const z of [bounds.min.z, bounds.max.z]) {
            localBounds.expandByPoint(corner.set(x, y, z).applyMatrix4(relative));
          }
        }
      }
    });
    if (localBounds.isEmpty()) return;
    const centre = localBounds.getCenter(new THREE.Vector3());
    const size = localBounds.getSize(new THREE.Vector3());
    const worldScale = root.getWorldScale(new THREE.Vector3());
    const halfX = size.x * worldScale.x * .5;
    const halfZ = size.z * worldScale.z * .5;
    const thickness = THREE.MathUtils.clamp(Math.min(halfX, halfZ) * .12, .38, .68);
    const localThicknessX = thickness / Math.max(.001, worldScale.x);
    const localThicknessZ = thickness / Math.max(.001, worldScale.z);
    const minY = worldBounds.min.y + .02;
    const maxY = Math.min(worldBounds.max.y, minY + 4.6);
    const addStrip = (dx, dz, stripHalfX, stripHalfZ) => {
      const at = root.localToWorld(new THREE.Vector3(centre.x + dx, centre.y, centre.z + dz));
      colliders.outside.addOrientedBox({
        cx: at.x, cz: at.z, halfX: stripHalfX, halfZ: stripHalfZ,
        rotationY: root.rotation.y, minY, maxY,
      });
    };
    addStrip(-(size.x - localThicknessX) * .5, 0, thickness * .5, halfZ);
    addStrip(+(size.x - localThicknessX) * .5, 0, thickness * .5, halfZ);
    addStrip(0, -(size.z - localThicknessZ) * .5, halfX, thickness * .5);
    addStrip(0, +(size.z - localThicknessZ) * .5, halfX, thickness * .5);
    root.userData.collisionKind = 'oriented-perimeter';
    root.userData.collisionStrips = 4;
  }

  function placeTownBuilding(asset, at, rotation, height, name) {
    if (!asset) return null;
    const root = place(asset, outside, at, [0, rotation, 0], 1, { collide: false });
    root.name = name;
    root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    root.scale.multiplyScalar(height / Math.max(0.1, size.y));
    root.updateMatrixWorld(true);
    box.setFromObject(root);
    root.position.y -= box.min.y;
    root.updateMatrixWorld(true);
    box.setFromObject(root);
    root.userData.worldBounds = box.clone();
    root.traverse((part) => {
      if (!part.isMesh && !part.isSkinnedMesh) return;
      // A 400k-triangle scan in the sun's shadow pass was almost as expensive
      // as drawing the whole countryside a second time.
      part.castShadow = false;
      part.receiveShadow = true;
    });
    addBuildingPerimeter(root, box);
    addBallisticProxy(root, name);
    townBuildings.push(root);
    return root;
  }
  const ruinedHouse = placeTownBuilding(assets.townBuildingRuin, roadPoint(466, 15),
    TOWN_BEARING + Math.PI * .52, 14.5, 'Road_End_Ruined_House');
  const clinic = placeTownBuilding(assets.townBuildingClinic, roadPoint(493, -15),
    TOWN_BEARING - Math.PI * .47, 13.2, 'Road_End_Clinic');
  if (ruinedHouse) ruinedHouse.userData.renderDistance = 430;
  if (clinic) clinic.userData.renderDistance = 900;

  // Cover points sit just beyond each building's actual final bounds. The AI
  // uses the collider line between these points and the player to decide when
  // it is hidden, so it moves around the architecture instead of through it.
  function coverAround(root, margin = 2.1) {
    const box = root?.userData?.worldBounds;
    if (!box) return [];
    const x0 = box.min.x - margin; const x1 = box.max.x + margin;
    const z0 = box.min.z - margin; const z1 = box.max.z + margin;
    const xm = (x0 + x1) * .5; const zm = (z0 + z1) * .5;
    return [[x0, z0], [x1, z0], [x1, z1], [x0, z1],
      [xm, z0], [x1, zm], [xm, z1], [x0, zm]];
  }
  const ruinCover = coverAround(ruinedHouse);
  const clinicCover = coverAround(clinic);
  const allCover = [...ruinCover, ...clinicCover];
  const enemySpawn = ([x, z]) => [x, 0, z];
  function concealedApproachSpawn(root, points, fallback) {
    const box = root?.userData?.worldBounds;
    if (!box || !points.length) return fallback;
    const approachAt = roadPoint(420);
    const approach = new THREE.Vector3(approachAt[0], 1.15, approachAt[2]);
    const origin = new THREE.Vector3();
    const direction = new THREE.Vector3();
    const hit = new THREE.Vector3();
    const ray = new THREE.Ray();
    let best = null;
    let bestDistance = -Infinity;
    for (const point of points) {
      origin.set(point[0], 1.15, point[1]);
      direction.copy(approach).sub(origin);
      const distance = direction.length();
      if (distance < 0.1) continue;
      ray.set(origin, direction.multiplyScalar(1 / distance));
      if (!ray.intersectBox(box, hit) || hit.distanceTo(origin) >= distance - 0.1) continue;
      if (distance > bestDistance) { bestDistance = distance; best = point; }
    }
    return best || fallback;
  }
  const blackAt = enemySpawn(concealedApproachSpawn(ruinedHouse, ruinCover, ruinCover[0])
    || [roadPoint(470, 5)[0], roadPoint(470, 5)[2]]);
  const redAt = enemySpawn(concealedApproachSpawn(clinic, clinicCover, clinicCover[2])
    || [roadPoint(492, -5)[0], roadPoint(492, -5)[2]]);
  const xz = ([x, , z]) => [x, z];
  const assaultRoad = (lane) => [430, 395, 355, 315, 275, 235, 195, 155, 118, 82, 50, 24, 8]
    .map((distance) => xz(roadPoint(distance, lane)))
    .concat([[lane * .55, 19.35]]);
  // The centre of the apron is deliberately blocked by the visible barrier
  // line. Each attacker owns a side lane through the yard, then crosses back
  // to a separate striking position at the shelter entrance.
  const blackYardRoute = [
    [-.7, 14.0], [-5.7, 10.8], [-6.4, 3.0], [-6.4, -9.8], [-4.8, -12.0], [-1.15, -13.0],
  ];
  const redYardRoute = [
    [.7, 14.0], [5.8, 10.6], [7.2, 3.0], [7.2, -10.0], [4.8, -12.0], [1.15, -13.0],
  ];
  // --- The car theft -------------------------------------------------------
  //
  // What the two men on the road are actually here for. The shelter has thick
  // doors and nothing they can drive; the Escort is sitting in the yard with
  // the keys in it. So they come for the car, one takes the wheel and one
  // rides, and the player has to go and get it back.
  const theft = {
    aboard: new Set(),
    stolen: false,
    escaped: false,
    driver: null,
    thief: null,
    // The gloating passes: which one we are on, whether one is running, and
    // how long until the next.
    pass: 0,
    taunting: false,
    shouted: false,
    tauntTimer: null,
  };
  // Right-hand drive, so the driver is on +X. The height is worked out from the
  // man rather than typed: what has to land on the cushion is his hip joint,
  // and an agent's origin is under his feet, so the offset is the seat minus
  // however far his hips stand above his boots.
  const seatOffsets = { driver: new THREE.Vector3(SEAT_X, 0, SEAT_Z),
    passenger: new THREE.Vector3(-SEAT_X, 0, SEAT_Z) };
  const _seatPoint = new THREE.Vector3();
  const _seatUp = new THREE.Vector3(0, 1, 0);

  // Two constraints, and the tighter of the two wins: his hips belong on the
  // cushion, and the top of his head has to stay under the roof. These two men
  // are different heights and sit differently, so which constraint binds is
  // not the same for both of them.
  function carSeat(agent) {
    if (!gateCar) return null;
    const offset = seatOffsets[agent.role] || seatOffsets.passenger;
    const onCushion = SEAT_HEIGHT + 0.05 - (agent.seatRise?.() ?? 0.95);
    const underRoof = (gateCar.headroom ?? CABIN_HEADROOM) - (agent.seatCrown?.() ?? 1.35);
    return _seatPoint.copy(offset).applyAxisAngle(_seatUp, gateCar.state.heading)
      .add(new THREE.Vector3(gateCar.state.x,
        gateCar.state.y + Math.min(onCushion, underRoof), gateCar.state.z));
  }

  function beginGetaway() {
    if (theft.stolen || !gateCar) return;
    theft.stolen = true;
    gateCar.state.lights = true;
    // Somebody is in it now, which takes its own hull off the collision set -
    // a car cannot drive through the box that represents it standing still.
    gateCar.occupied = true;
    // Out through the gate and back up the road they came in on: the way out
    // is the way in, which is also the only road on the map.
    theft.thief = createCarThief({ vehicle: gateCar, route: getawayRoute() });
    theft.pass = 0;
    theft.taunting = false;
    theft.shouted = false;
    theft.tauntTimer = null;
    window.dispatchEvent(new CustomEvent('lostsignal:carstolen', {
      detail: { vehicle: gateCar } }));
  }

  // --- Coming back to gloat ------------------------------------------------
  //
  // Losing the car once, at night, while you were somewhere else, is a thing
  // you can miss entirely - and several people did. So they do not vanish up
  // the road for good. They turn round, come back down past the gate with the
  // horn going, shout something at you, and leave again. It gives the theft a
  // second and a third showing, it puts the car back inside rifle range, and
  // it is what two men who have just taken your only car would actually do.
  const TAUNT_LINES = Object.freeze([
    'NICE MOTOR! WE\u2019LL LOOK AFTER IT!',
    'THANKS FOR THE KEYS, GRANDAD!',
    'STILL WALKING? SHOULD HAVE LOCKED IT!',
    'WAVE GOODBYE TO YOUR ESCORT!',
    'WE\u2019LL BRING IT BACK. PROBABLY NOT.',
  ]);
  const TAUNT_FIRST_WAIT = 16;   // seconds after the getaway before pass one
  const TAUNT_WAIT = 26;         // and between the passes after that
  const TAUNT_SHOUT_RANGE = 62;  // how close they get before they start
  const TAUNT_TURN_AT = 21;      // where on the road the U-turn is centred
  const TAUNT_TURN_RADIUS = 6.5; // the Escort's own lock is good for 3.5 m

  // Up the road and away. The getaway starts inside the compound and has to
  // come out through the gate first; a gloating pass is already out there, so
  // it only wants the road.
  const outboundRoute = (from = 0) => [40, 90, 150, 220, 300, 380, 460]
    .filter((distance) => distance > from).map((distance) => xz(roadPoint(distance, 0)));
  const getawayRoute = () => [[0, 14], [0, 24], ...outboundRoute()];

  // A half circle laid on the road surface, entered heading in and left
  // heading out. Pure pursuit cannot invent a U-turn out of two opposed
  // waypoints, but it follows an arc drawn for it perfectly well.
  function turnaround(at, radius, across = -3.0) {
    const points = [];
    for (let step = 1; step <= 6; step++) {
      const angle = (Math.PI * step) / 6;
      points.push(xz(roadPoint(at - radius * Math.sin(angle),
        across + radius - radius * Math.cos(angle))));
    }
    return points;
  }

  function beginTaunt() {
    if (!gateCar || !theft.stolen) return;
    const here = Math.hypot(gateCar.state.x, gateCar.state.z - 18);
    theft.pass = (theft.pass || 0) + 1;
    theft.taunting = true;
    theft.shouted = false;
    theft.thief = createCarThief({
      vehicle: gateCar,
      route: [
        // Back down the road, the arc outside the gate, and away again.
        ...[380, 300, 220, 150, 90, 46, 32].filter((distance) => distance < here - 12)
          .map((distance) => xz(roadPoint(distance, -3.0))),
        ...turnaround(TAUNT_TURN_AT, TAUNT_TURN_RADIUS),
        ...outboundRoute(TAUNT_TURN_AT + 14),
      ],
      cruise: 19,
    });
  }

  // Runs whenever the surface is live, driven or watched. Owns the phase the
  // stolen car is in: away, coming back, shouting, leaving again.
  function updateTheft(dt, viewer) {
    if (!theft.stolen || !theft.thief || !gateCar) return;
    if (theft.thief.halted) return; // driver shot; it goes nowhere.
    if (!theft.thief.done) {
      if (theft.taunting && !theft.shouted && viewer
        && Math.hypot(gateCar.state.x - viewer.x, gateCar.state.z - viewer.z)
          < TAUNT_SHOUT_RANGE) {
        theft.shouted = true;
        window.dispatchEvent(new CustomEvent('lostsignal:cartaunt', {
          detail: {
            vehicle: gateCar,
            pass: theft.pass,
            line: TAUNT_LINES[(theft.pass - 1) % TAUNT_LINES.length],
          },
        }));
      }
      return;
    }
    // Out of road. Wait a while, then come back down it.
    theft.taunting = false;
    theft.tauntTimer = (theft.tauntTimer ?? (theft.pass ? TAUNT_WAIT : TAUNT_FIRST_WAIT)) - dt;
    if (theft.tauntTimer > 0) return;
    theft.tauntTimer = TAUNT_WAIT;
    beginTaunt();
  }

  const carMission = {
    boardingPoint: (role) => (gateCar ? gateCar.boardingPoint(role) : null),
    seatPosition: (agent) => carSeat(agent),
    // Facing the way the car is going, not the way he was walking when he
    // got in.
    seatHeading: () => (gateCar ? gateCar.state.heading : null),
    // Wait for the other one unless he is dead or has given up.
    readyToDrive: (agent) => {
      const others = townEnemies?.agents?.filter((other) => other !== agent) || [];
      return others.every((other) => other.dead || other.state === 'boarding'
        || other.state === 'riding');
    },
    board: (agent) => {
      if (theft.escaped || !gateCar) return false;
      theft.aboard.add(agent.root.name);
      if (agent.role === 'driver') theft.driver = agent;
      // One man can drive off alone; two is the plan.
      const living = townEnemies?.agents?.filter((other) => !other.dead) || [];
      if (living.every((other) => theft.aboard.has(other.root.name))) beginGetaway();
      return true;
    },
    // The man with the keys is shot: whoever is left takes the wheel, and if
    // that was the man driving, the car stops where it is.
    driverDown: (agent) => {
      if (theft.driver === agent) {
        theft.driver = null;
        theft.thief?.halt();
        window.dispatchEvent(new CustomEvent('lostsignal:cardriverdown', {
          detail: { vehicle: gateCar } }));
      }
      const heir = townEnemies?.agents?.find((other) => !other.dead && other !== agent);
      if (heir) heir.role = 'driver';
    },
  };

  const townEnemies = createTownEnemies({
    scene: outside,
    colliders: colliders.outside,
    assets,
    navigationObstacles: [
      ruinedHouse?.userData?.worldBounds,
      clinic?.userData?.worldBounds,
    ],
    mission: {
      gateTarget: new THREE.Vector3(0, 0, GATE_Z),
      siloTarget: new THREE.Vector3(0, 0, -16.6),
      gateIsPassable: () => gateSlide > .82,
      damageGate,
      damageSilo,
      ...carMission,
    },
    lowCost: options.quality === 'mobile',
    entries: [
      {
        asset: 'enemyOldManBlack', style: 'black', name: 'Town_Enemy_Black',
        position: blackAt, heading: TOWN_BEARING + Math.PI,
        patrol: ruinCover.slice(0, 4), cover: allCover,
        assaultRoute: assaultRoad(-1.15), yardRoute: blackYardRoute,
      },
      {
        asset: 'enemyOldManRed', style: 'red', name: 'Town_Enemy_Red',
        position: redAt, heading: TOWN_BEARING,
        patrol: clinicCover.slice(0, 4), cover: allCover,
        assaultRoute: assaultRoad(1.15), yardRoute: redYardRoute,
      },
    ],
  });
  // Preserve the public world API used by combat and existing saves while the
  // old static residents become actual animated hostiles.
  // Getting back in is getting it back. Everyone still aboard is thrown out,
  // which is the only sensible thing that can happen to them at that point.
  window.addEventListener('lostsignal:drive', (event) => {
    if (!theft.stolen || event.detail?.vehicle !== gateCar) return;
    theft.stolen = false;
    theft.thief = null;
    theft.driver = null;
    theft.taunting = false;
    theft.tauntTimer = null;
    gateCar.occupied = true;
    for (const agent of townEnemies.agents) {
      if (!theft.aboard.has(agent.root.name)) continue;
      agent.state = 'assault_road';
      agent.model.visible = !agent.dead;
      agent.route = [];
      agent.target = null;
    }
    theft.aboard.clear();
    window.dispatchEvent(new CustomEvent('lostsignal:carrecovered', {
      detail: { vehicle: gateCar, escaped: theft.escaped } }));
  });

  const townsfolk = townEnemies.roots;
  const downTownsfolk = (root) => townEnemies.down(root);

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

  // --- The countryside ------------------------------------------------------
  // Everything outside the wire, laid out by the same noise the ground's own
  // colour is baked from, so where it is rank is where the brambles are and
  // where it burned off is where nothing much grows.
  //
  // It used to be twenty-six flat rectangles of "far field" and a treeline of
  // fourteen. From the gate the country read as a green tablecloth; from the
  // air it read as a jigsaw. This is hedgerows on a field grid, and a few
  // thousand things standing in the fields between them.
  function countryside() {
    // The same lattice noise the ground is coloured with, so the scatter and
    // the tone agree. Ported deliberately literally from the generator.
    const hash2 = (ix, iz, seed) => {
      let h = (Math.imul(ix, 374761393) + Math.imul(iz, 668265263)
        + Math.imul(seed, 2246822519)) >>> 0;
      h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
      return ((h ^ (h >>> 16)) & 0xFFFFFF) / 0xFFFFFF;
    };
    const valueNoise = (x, z, scale, seed) => {
      const fx = x / scale;
      const fz = z / scale;
      const ix = Math.floor(fx);
      const iz = Math.floor(fz);
      const tx = fx - ix;
      const tz = fz - iz;
      const sx = tx * tx * (3 - 2 * tx);
      const sz = tz * tz * (3 - 2 * tz);
      const a = hash2(ix, iz, seed);
      const b = hash2(ix + 1, iz, seed);
      const c = hash2(ix, iz + 1, seed);
      const d = hash2(ix + 1, iz + 1, seed);
      return (a * (1 - sx) + b * sx) * (1 - sz) + (c * (1 - sx) + d * sx) * sz;
    };
    const fbm = (x, z, scale, seed, octaves = 4) => {
      let total = 0;
      let amplitude = 1;
      let norm = 0;
      for (let o = 0; o < octaves; o++) {
        total += valueNoise(x, z, scale / (2 ** o), seed + o * 17) * amplitude;
        norm += amplitude;
        amplitude *= 0.5;
      }
      return total / norm;
    };
    const rankness = (x, z) => fbm(x + 2200, z - 1700, 54, 9137);
    const dryness = (x, z) => fbm(x, z, 78, 4181);

    // One stream, so the world is the same every session.
    let seedState = 0x9e3779b9;
    const random = () => {
      seedState = (seedState + 0x6d2b79f5) >>> 0;
      let t = seedState;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const between = (low, high) => low + random() * (high - low);

    // --- Where things may not go -------------------------------------------
    const roadOrigin = new THREE.Vector2(0, 18);
    const roadAxis = new THREE.Vector2(roadDirection.x, roadDirection.z);
    const _toPoint = new THREE.Vector2();
    // Distance from the carriageway, or Infinity off either end of it.
    const offRoad = (x, z) => {
      _toPoint.set(x - roadOrigin.x, z - roadOrigin.y);
      const along = _toPoint.dot(roadAxis);
      if (along < -14 || along > 500) return Infinity;
      return Math.abs(_toPoint.x * roadAxis.y - _toPoint.y * roadAxis.x);
    };
    // The compound, its approach, and the firing range down the west side.
    const inCompound = (x, z, margin = 0) =>
      x > -24 - margin && x < 24 + margin && z > -31 - margin && z < 21 + margin;
    const clear = (x, z, verge = 7, margin = 3) =>
      !inCompound(x, z, margin) && offRoad(x, z) > verge;

    // --- Hedgerows ----------------------------------------------------------
    // A jittered grid of field boundaries. Berkshire fields are irregular but
    // they are not random: they meet at corners and they run for a while.
    const HEDGE_LENGTH = 12;
    const hedgeNear = [];
    const hedgeFar = [];
    const gates = [];
    const hedgeTrees = [];
    const FIELD = 152;
    // Past this the fog has the country anyway, and every twelve metres of
    // hedge is another instance in the pass.
    const REACH = 268;
    const lines = [];
    for (let index = -3; index <= 3; index++) {
      // Boundaries wander: a hedge that is dead straight for four hundred
      // metres is a runway, not a field edge.
      const drift = (t) => (fbm(index * 91 + t * 0.004, index * 37, 0.9, 55 + index) - 0.5) * 26;
      lines.push({ axis: 'x', at: index * FIELD + (hash2(index, 7, 3) - 0.5) * 40, drift });
      lines.push({ axis: 'z', at: index * FIELD + (hash2(index, 11, 5) - 0.5) * 40, drift });
    }
    for (const line of lines) {
      // Each run gets one or two gaps in it, and a gate in one of them.
      const gapAt = between(-REACH, REACH);
      const gapWidth = between(9, 26);
      let gated = false;
      for (let t = -REACH; t < REACH; t += HEDGE_LENGTH) {
        const wander = line.drift(t);
        const x = line.axis === 'x' ? line.at + wander : t;
        const z = line.axis === 'x' ? t : line.at + wander;
        if (Math.hypot(x, z - 40) > REACH) continue;
        if (!clear(x, z, 11, 8)) continue;
        // Two boundaries meeting stacked four hedges on one spot, which read
        // as a heap rather than as a corner. One run gives way at a crossing.
        if (line.axis === 'z' && lines.some((other) => other.axis === 'x'
          && Math.abs(x - (other.at + other.drift(z))) < 7)) continue;
        if (Math.abs(t - gapAt) < gapWidth) {
          if (!gated && Math.abs(t - gapAt) < HEDGE_LENGTH * 0.5) {
            gated = true;
            gates.push([x, z, line.axis === 'x' ? Math.PI / 2 : 0, 1]);
          }
          continue;
        }
        // A hedge is never quite on the line and never quite level.
        const spin = (line.axis === 'x' ? Math.PI / 2 : 0) + between(-0.05, 0.05);
        const placement = [x + between(-0.7, 0.7), z + between(-0.7, 0.7), spin,
          between(0.86, 1.2), between(-0.03, 0.03), between(-0.04, 0.04)];
        (Math.hypot(x, z) < 90 ? hedgeNear : hedgeFar).push(placement);
        // Trees grow out of hedgerows, which is where every tree in a field
        // that has not been planted actually is.
        if (random() < 0.16) {
          hedgeTrees.push([x + between(-1.6, 1.6), z + between(-1.6, 1.6),
            between(0, Math.PI * 2), between(0.8, 1.5)]);
        }
      }
    }
    // Two levels of detail, split by distance rather than by camera: the
    // hedges you can walk up to are the full build, the two hundred behind
    // them are a quarter of the blocks and identical in silhouette.
    const hedgeFactor = THREE.MathUtils.lerp(.42, 1, foliage);
    const withinBudget = (items, factor) => items.filter((_, index) =>
      ((index * 421 + 173) % 997) / 997 < factor);
    const nearHedges = withinBudget(hedgeNear, hedgeFactor);
    const farHedges = withinBudget(hedgeFar, hedgeFactor);
    const budgetGates = withinBudget(gates, Math.max(.62, hedgeFactor));
    scatter(assets.hedgerow, nearHedges, { name: 'Hedge_Near', castShadow: true });
    scatter(assets.hedgerowFar || assets.hedgerow, farHedges,
      { name: 'Hedge_Far', castShadow: false });
    scatter(assets.hedgeGap, budgetGates, { name: 'Field_Gates', castShadow: true });

    // --- What stands in the fields ------------------------------------------
    // Rejection sampling against the noise: brambles take the rank ground,
    // scrub thins out where it burned off, and nothing grows on the road.
    const sample = (count, reach, accept, { near = 0, spacing = 0 } = {}) => {
      const out = [];
      const spacingSquared = spacing * spacing;
      for (let tries = 0; tries < count * 16 && out.length < count; tries++) {
        const angle = random() * Math.PI * 2;
        // Square-root weighting gives an even area density; biasing it inward
        // puts the detail where the player can actually see it.
        const radius = near + (reach - near) * Math.sqrt(random()) ** 1.35;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius + 20;
        if (!accept(x, z)) continue;
        // Bushes that land on top of each other stop reading as bushes and
        // start reading as one lumpy mass, which is what a field of brambles
        // must not look like.
        if (spacingSquared && out.some(([ox, oz]) =>
          (ox - x) ** 2 + (oz - z) ** 2 < spacingSquared)) continue;
        out.push([x, z]);
      }
      return out;
    };

    // Brambles: thickest on the rank ground, and they crowd the hedge lines.
    const scrub = sample(Math.round(460 * foliage), 300,
      (x, z) => clear(x, z, 9) && random() < 0.25 + rankness(x, z) * 1.5,
      { spacing: 3.4 })
      .map(([x, z]) => [x, z, random() * Math.PI * 2, between(0.7, 1.6),
        between(-0.06, 0.06), between(-0.06, 0.06)]);
    scatter(assets.scrub, scrub, { name: 'Scrub', castShadow: false });

    // Seeded grass. Only the near field: it is what stops the ground reading
    // as a painted bedsheet underfoot, and past thirty metres it is a texture.
    const tufts = [];
    for (let tries = 0; tries < 5200 && tufts.length < Math.round(1150 * foliage); tries++) {
      const angle = random() * Math.PI * 2;
      const radius = 5 + 118 * Math.sqrt(random()) ** 1.6;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius - 4;
      // Inside the wire it grows too — it is a field with a shelter in it —
      // but not on the track, the apron or the yard.
      const onTrack = Math.abs(x) < 4.2 && z > -16 && z < 19;
      const onYard = z < -18.4 && z > -26.8 && x > -21 && x < 13;
      if (onTrack || onYard || offRoad(x, z) < 5.4) continue;
      if (random() > 0.35 + rankness(x, z) * 1.1 - dryness(x, z) * 0.4) continue;
      tufts.push([x, z, random() * Math.PI * 2, between(0.7, 1.5),
        between(-0.1, 0.1), between(-0.1, 0.1)]);
    }
    scatter(assets.grassTuft, tufts, { name: 'Grass_Tufts', castShadow: false });

    // Trees. The hedgerow ones, plus copses where the ground is rank.
    const copse = sample(Math.round(120 * foliage), 420,
      (x, z) => clear(x, z, 13) && random() < rankness(x, z) * 1.7,
      { spacing: 5.5 })
      .map(([x, z]) => [x, z, random() * Math.PI * 2, between(0.75, 1.6)]);
    const standing = [...withinBudget(hedgeTrees, hedgeFactor), ...copse];
    if (deadTrees.length) {
      // Five different dead forms, dealt out so no two neighbours match.
      deadTrees.forEach((tree, index) => {
        scatter(tree, standing.filter((_, i) => i % deadTrees.length === index),
          { name: `Dead_Trees_${index}`, castShadow: false });
      });
    } else {
      scatter(assets.deadTree, standing, { name: 'Dead_Trees', castShadow: false });
    }

    // Everything else lying about out there.
    const lay = (asset, count, reach, name, options = {}) => {
      const placements = sample(Math.round(count * foliage), reach,
        (x, z) => clear(x, z, options.verge ?? 9, options.margin ?? 4),
        { spacing: options.spacing ?? 6 })
        .map(([x, z]) => [x, z, random() * Math.PI * 2,
          between(options.min ?? 0.85, options.max ?? 1.25),
          between(-0.05, 0.05), between(-0.05, 0.05)]);
      scatter(asset, placements, { name, castShadow: options.castShadow ?? false });
      return placements;
    };
    lay(assets.fallenTree, 46, 380, 'Fallen_Trees', { min: 0.8, max: 1.35 });
    lay(assets.spoilHeap, 26, 400, 'Spoil_Heaps', { min: 0.7, max: 1.5 });
    lay(assets.fieldDebris, 140, 330, 'Field_Debris', { min: 0.8, max: 1.4 });
    lay(assets.farmWreck, 9, 320, 'Farm_Wrecks', { min: 0.9, max: 1.1, verge: 16 });
    lay(assets.rubble, 40, 300, 'Field_Rubble', { min: 0.7, max: 1.3 });

    // Telegraph poles follow the road, because that is what they follow.
    if (assets.telegraphPole) {
      const poles = [];
      for (let i = 0; i < 26; i++) {
        const distance = 26 + i * 18.5;
        const side = i % 2 ? 1 : -1;
        const [x, , z] = roadPoint(distance, side * between(8.2, 9.6));
        poles.push([x, z, TOWN_BEARING + between(-0.05, 0.05), between(0.92, 1.06),
          between(-0.03, 0.03), between(-0.03, 0.03)]);
      }
      scatter(assets.telegraphPole, poles, { name: 'Telegraph_Poles', castShadow: false });
    }
    return { hedges: nearHedges.length + farHedges.length, gates: budgetGates.length,
      scrub: scrub.length, tufts: tufts.length, trees: standing.length };
  }
  const country = countryside();

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
    // Except where the black is the point. See CABIN_DARK in vehicle.js.
    if (material.userData?.lsKeepDark) return material;
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
  const returnPanel = place(assets.accessControl,outside,[-2.15,1.12,-13.55],[0,0,0],1,{ collide: false });
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
  const rainCount=options.quality === 'mobile' ? 160 : 320;
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
  // There were four hundred motes drifting over the compound. They read as
  // specks on the lens rather than as air, and at night they caught the moon
  // and looked like snow. The atmosphere is in the sky's own scatter and the
  // fog now, which is where it belongs.

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

  // First- and third-person are two presentations of the same player state.
  // The main controller decides which mode is effective (a telescopic scope
  // temporarily uses the first-person eye), while this layer keeps the body,
  // held world weapon and camera viewmodel mutually consistent.
  let playerViewMode = 'third';
  let playerVisualActive = true;
  let playerVisualObstructed = false;
  let weaponPresented = false;

  function syncPlayerPresentation() {
    const thirdPerson = playerViewMode === 'third';
    playerCharacter.setVisible(thirdPerson && playerVisualActive);
    playerCharacter.setObstructed(playerVisualObstructed);
    playerCharacter.setWeaponVisible(thirdPerson && playerVisualActive && weaponPresented);
    weaponView.visible = !thirdPerson && playerVisualActive && weaponPresented;
  }

  function setViewMode(mode) {
    playerViewMode = mode === 'first' ? 'first' : 'third';
    syncPlayerPresentation();
    return playerViewMode;
  }

  function setPlayerVisualActive(value) {
    playerVisualActive = !!value;
    syncPlayerPresentation();
  }

  function setPlayerVisualObstructed(value) {
    playerVisualObstructed = !!value;
    syncPlayerPresentation();
  }

  function setWeaponVisible(value) {
    weaponPresented = !!value;
    syncPlayerPresentation();
  }

  // The held weapon carries its own floor of light.
  //
  // Lit by the world alone it was a black cut-out at any hour the sun was
  // behind the player — no receiver, no sights, nothing to aim with. A pair of
  // lights on their own layer is the obvious answer and it does not work:
  // three.js gathers a light if its layers match the *camera*, and after that
  // it lights everything in the pass, so a viewmodel key washed out the whole
  // compound behind it. Instead each held weapon's own materials get a small
  // emissive floor mixed from their base colour, which lifts the thing in the
  // player's hands off black and reaches nothing else at all.
// A share of the material's own colour plus a flat floor. A share alone does
// nothing for a phosphate receiver, whose albedo is about five per cent to
// begin with — sixteen per cent of almost nothing is still almost nothing.
  const VIEWMODEL_GLOW = 0.38;
  const VIEWMODEL_FLOOR = [0.013, 0.014, 0.017];
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
  let heldSights = null;

  function setWeapon(key) {
    if (heldKey === key && heldModel) return heldModel;
    if (heldModel) {
      weaponAction.remove(heldModel);
      heldModel = null;
      heldSights = null;
      playerCharacter.setWeapon(null);
    }
    const source = (key && assets[key]) || armory?.weaponAsset || assets.rifle;
    if (!source) { heldKey = null; playerCharacter.setWeapon(null); return null; }
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
    model.traverse((part) => {
      if (!part.isMesh || !part.material) return;
      const materials = Array.isArray(part.material) ? part.material : [part.material];
      part.material = materials.map((source) => {
        if (!source.emissive) return source;
        const lit = source.clone();
        lit.emissive.setRGB(
          lit.color.r * VIEWMODEL_GLOW + VIEWMODEL_FLOOR[0],
          lit.color.g * VIEWMODEL_GLOW + VIEWMODEL_FLOOR[1],
          lit.color.b * VIEWMODEL_GLOW + VIEWMODEL_FLOOR[2]);
        return lit;
      });
      if (!Array.isArray(part.material)) part.material = part.material;
      else if (part.material.length === 1) part.material = part.material[0];
    });
    weaponAction.add(model);
    heldModel = model;
    playerCharacter.setWeapon(model, {
      key: heldKey,
      family: family || 'rifle',
    });
    heldSights = measureSights(model);
    return model;
  }

  // Where the eye has to be to look through this weapon's sights.
  //
  // Every model carries its irons as real geometry, but the families name them
  // differently and two do not have separate parts at all: a shotgun is aimed
  // off a bead and a rib, a revolver down a groove in the top strap. So the
  // pair is resolved by name where names exist and measured off the top of the
  // weapon where they do not. The result is two points in the rig's own frame,
  // and the line joining them is the line the eye has to be on.
  const REAR_SIGHT = /^Aim_Rear$|Irons_RearAperture|^Sight_Rear$|RearNotch/;
  const FRONT_SIGHT = /^Aim_Front$|Irons_FrontPost|^Sight_Front$|Bead_Post/;
  const _sightBox = new THREE.Box3();
  const _sightLocal = new THREE.Matrix4();
  const _sightCorner = new THREE.Vector3();

  function namedPart(model, pattern) {
    let found = null;
    // Not isMesh: the aim points are empties, which arrive as bare Object3Ds.
    model.traverse((part) => {
      if (!found && pattern.test(part.name)) found = part;
    });
    return found;
  }

  /**
   * The model's extents in the rig's own frame.
   *
   * Box3.setFromObject gives a world-space box, and its min and max corners
   * put through worldToLocal are just two arbitrary corners of it — under any
   * rotation the transformed "min" can sit further down an axis than the
   * transformed "max". That is what flipped some weapons end for end when they
   * were raised: front and rear came out swapped, the sight line reversed, and
   * the aim pose dutifully turned the weapon around to point at the player.
   */
  function localBounds(model, target) {
    target.makeEmpty();
    _sightLocal.copy(weaponView.matrixWorld).invert();
    model.traverse((part) => {
      if (!part.isMesh || !part.geometry) return;
      if (!part.geometry.boundingBox) part.geometry.computeBoundingBox();
      const box = part.geometry.boundingBox;
      if (!box) return;
      const m = _sightCorner;
      for (let corner = 0; corner < 8; corner++) {
        m.set(corner & 1 ? box.max.x : box.min.x,
          corner & 2 ? box.max.y : box.min.y,
          corner & 4 ? box.max.z : box.min.z);
        m.applyMatrix4(part.matrixWorld).applyMatrix4(_sightLocal);
        target.expandByPoint(m);
      }
    });
    return target;
  }

  function measureSights(model) {
    // Measure with the action rig at rest. It carries the reload animation,
    // and a weapon measured mid-cycle would have its sight line baked with a
    // bolt throw in it.
    const keepPosition = weaponAction.position.clone();
    const keepRotation = weaponAction.rotation.clone();
    weaponAction.position.set(0, 0, 0);
    weaponAction.rotation.set(0, 0, 0);
    weaponAction.updateWorldMatrix(true, true);
    try {
      const centreOf = (part) => {
        if (!part) return null;
        const point = new THREE.Vector3();
        // An aim marker is an empty and has no geometry to take a centre from.
        if (part.isMesh && part.geometry) _sightBox.setFromObject(part).getCenter(point);
        else part.getWorldPosition(point);
        return weaponView.worldToLocal(point);
      };
      let rear = centreOf(namedPart(model, REAR_SIGHT));
      let front = centreOf(namedPart(model, FRONT_SIGHT));
      // The rig holds every weapon muzzle down -Z, so the front sight is always
      // the one further down -Z. If a pair says otherwise the pair is wrong,
      // whatever it is called, and aiming down it would spin the weapon round.
      if (rear && front && front.z > rear.z) { const swap = rear; rear = front; front = swap; }
      if (rear && front && rear.z - front.z > 0.02) return { rear, front, measured: true };
      rear = front = null;

      // Nothing named, or only the front bead. The weapon is held muzzle down
      // -Z, so its own extents give the rest: the sight line runs along the top
      // of it, from the back of the receiver to just short of the muzzle.
      localBounds(model, _sightBox);
      const top = _sightBox.max.y - (_sightBox.max.y - _sightBox.min.y) * 0.06;
      const x = (_sightBox.min.x + _sightBox.max.x) / 2;
      const length = Math.abs(_sightBox.max.z - _sightBox.min.z);
      if (!front) front = new THREE.Vector3(x, top, _sightBox.min.z + length * 0.08);
      if (!rear) rear = new THREE.Vector3(x, front.y, _sightBox.max.z - length * 0.28);
      return { rear, front, measured: false };
    } finally {
      weaponAction.position.copy(keepPosition);
      weaponAction.rotation.copy(keepRotation);
      weaponAction.updateWorldMatrix(true, true);
    }
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
    // In third person the eye is on a three-metre boom, so a camera-relative
    // ray needs to travel through that boom before it reaches the thing in
    // front of the player. Reach is still validated from the body below.
    ray.far=playerViewMode === 'third' ? 6.4 : 3.15;
    ray.setFromCamera({x:0,y:0},camera);
    camera.getWorldPosition(_interactionCamera);
    // The silo now has a real interaction on every quarters door. Raycasting
    // all 84 furnished meshes every frame is needless work on a phone; reject
    // anything whose hinge/root is not even within reach first.
    const candidates=interactions.filter((o) => {
      if (o.userData.interaction?.world !== world) return false;
      o.getWorldPosition(_interactionPoint);
      const cameraReach = playerViewMode === 'third' ? 48 : 18;
      if (_interactionPoint.distanceToSquared(_interactionCamera) > cameraReach) return false;
      const dx = _interactionPoint.x - player.position.x;
      const dz = _interactionPoint.z - player.position.z;
      return dx * dx + dz * dz <= 12.25
        && Math.abs(_interactionPoint.y - player.position.y) <= 3.1;
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
    if (key) setWeapon(key);
    weaponPresented = !!key;
    syncPlayerPresentation();
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

  // A parked car still gets stepped: it settles onto the ground and holds
  // its collider in place. Nothing is asking it to move.
  const IDLE_CONTROLS = Object.freeze({ throttle: 0, steer: 0, brake: false });

  // --- Who is in front of the car ------------------------------------------
  //
  // The collision set is boxes that were placed once and never move, so nobody
  // walking around is in it: the car drove straight through the two men in the
  // yard, and their car drove straight through the player. Every vehicle asks
  // this for the people near it, and gets the same answer whether the player
  // is driving or being driven at.
  const _victimPoint = new THREE.Vector3();
  const playerVictim = {
    id: 'player',
    radius: 0.38,
    get position() { return player.position; },
    struck(speed, dirX, dirZ, lethal) {
      window.dispatchEvent(new CustomEvent('lostsignal:playerrunover', {
        detail: { speed: +speed.toFixed(1), lethal: !!lethal, dirX, dirZ },
      }));
    },
  };
  // Which car, if any, the player is sitting in. Not the same question as
  // which car is occupied: the one the two men stole is occupied as well, and
  // it is the one most likely to run him down.
  let playerDriving = null;
  let playerSeatedIn = false;
  window.addEventListener('lostsignal:drive', (event) => {
    playerDriving = event.detail?.vehicle || null;
    playerSeatedIn = false;
  });

  function bystandersFor(vehicle) {
    if (playerDriving) {
      // The event fires on the door handle, a frame before the seat is taken,
      // so wait to see him in it before believing he has got out of it.
      if (playerDriving.state.occupied) playerSeatedIn = true;
      else if (playerSeatedIn) { playerDriving = null; playerSeatedIn = false; }
    }
    const out = [];
    // Every car except the one he is driving. Inside it is the one place a car
    // cannot run you over.
    if (playerDriving !== vehicle) out.push(playerVictim);
    for (const agent of townEnemies?.agents || []) {
      if (agent.dead || agent.state === 'riding' || agent.state === 'boarding') continue;
      out.push({
        id: agent.root.name,
        radius: 0.36,
        position: agent.root.position,
        struck: (speed, dirX, dirZ, lethal) => agent.struck(speed, dirX, dirZ, lethal),
      });
    }
    for (const creature of creatures?.wildlife || []) {
      if (creature.userData?.alive === false) continue;
      out.push({
        id: creature,
        radius: 0.4,
        position: creature.getWorldPosition(_victimPoint),
        struck: () => creatures.agentFor?.(creature)?.kill?.(),
      });
    }
    return out;
  }
  for (const vehicle of vehicles) vehicle.setBystanders?.(() => bystandersFor(vehicle));

  let elapsed=0;
  function update(dt, world = 'bunker', playerPosition = player.position, observed = null) {
    elapsed += dt;
    // A world is live if the player is in it or a camera is pointed at it.
    // Everything below that used to test `world === 'outside'` was really
    // asking "is anyone looking at the surface", and the answer was wrong for
    // the whole time the player was sitting at the camera desk watching it.
    const watchingOutside = observed?.world === 'outside';
    const outsideLive = world === 'outside' || watchingOutside;
    const outsideViewer = watchingOutside && observed.position
      ? observed.position : playerPosition;
    // Cull the silo's lights around the camera rather than the body. In play
    // they are the same place; with the debug free camera they are not, and a
    // room the camera is standing in went dark because the body was elsewhere.
    if (world === 'silo') {
      siloWorld?.update(dt, camera.getWorldPosition(_cullPoint));
      garrison?.update(dt, playerPosition);
    }
    if (outsideLive) range?.update(dt);
    updateGate(dt, world === 'outside' ? playerPosition : null);
    // Vehicles settle onto the ground and keep their collider in step whether
    // anyone is driving or not, so a parked car is still something you have to
    // walk around.
    for (const vehicle of vehicles) {
      if (!outsideLive) continue;
      // "Occupied" means somebody is in it, and a stolen car has two somebodies
      // in it - which is exactly why it needs updating. Only the car the player
      // is driving is updated elsewhere.
      const stolen = theft.stolen && vehicle === gateCar && theft.thief;
      if (vehicle.state.occupied && !stolen) continue;
      // A stolen car is driven, not parked. The controls come from the same
      // place the player's do, so it handles the same and stops the same way.
      if (stolen) {
        vehicle.update(dt, theft.thief.update(dt));
        if (!theft.escaped && (theft.thief.done
          || Math.hypot(vehicle.state.x, vehicle.state.z) > 430)) {
          theft.escaped = true;
          window.dispatchEvent(new CustomEvent('lostsignal:carescaped', {
            detail: { vehicle } }));
        }
        updateTheft(dt, outsideViewer);
      } else {
        vehicle.update(dt, IDLE_CONTROLS);
      }
    }
    for (const plane of aircraft) {
      if (outsideLive && !plane.state.occupied) plane.update(dt, IDLE_CONTROLS);
    }
    // Time passes wherever the player is standing. The sky is a few dozen
    // sums and a handful of uniform writes, so it runs every frame and the
    // surface is never waiting at the moment you left it.
    sky.update(dt, outsideLive ? outsideViewer : null);
    creatures.update(dt, world, playerPosition);
    residents?.update(dt, world, playerPosition);
    // The attackers keep going, and stay drawn, for whoever is watching -
    // which on the camera desk is a lens on a pole three hundred metres from
    // the player's body.
    townEnemies.update(dt, playerPosition, outsideLive, outsideViewer);
    if (outsideLive) {
      for (const building of townBuildings) {
        const reach = building.userData.renderDistance || 900;
        const dx = building.position.x - outsideViewer.x;
        const dz = building.position.z - outsideViewer.z;
        building.visible = dx * dx + dz * dz <= reach * reach;
      }
    }
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
      const night = 1 - sky.state.dayFactor;
      for (const light of floodLights) light.intensity = 4.5 * night;
      if (range?.lamp) range.lamp.intensity = 5.5 * night;
      if (solarGlow) solarGlow.intensity = 4.5 * night;
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
    weaponView,weaponAction,playerCharacter,blocked,colliders,spawnPoints,creatures,cctvScenes,nearestInteraction,setWorld,setArmed,
    setViewMode,setWeaponVisible,setPlayerVisualActive,setPlayerVisualObstructed,
    playGun,setWeapon,setDoorOpen,setHatchOpen,update,
    heldWeapon:()=>heldKey,
    heldSights:()=>heldSights,
    bunkerLights,emergency,siloWorld,armory,garrison,range,sky,floodLights,vehicles,aircraft,
    townBuildings,townEnemies,townsfolk,downTownsfolk,country,
    gateIsOpen:()=>gateOpen,
    gateTravel:()=>gateSlide,
    gateMode:()=>gateMode,
    gateIntegrity:()=>gateIntegrity,
    carTheft: () => ({
      stolen: theft.stolen, escaped: theft.escaped,
      aboard: [...theft.aboard],
      driver: theft.driver?.root.name || null,
      pass: theft.pass, taunting: theft.taunting,
      gate: gateCar
        ? +Math.hypot(gateCar.state.x, gateCar.state.z - 18).toFixed(1) : null,
      distance: gateCar ? +Math.hypot(gateCar.state.x, gateCar.state.z).toFixed(1) : null,
      speed: gateCar ? +gateCar.state.speed.toFixed(1) : null,
    }),
    siloIntegrity:()=>siloIntegrity,
    siloBreached:()=>siloBreached,
    setGateMode,
    doorOpen:()=>doorOpen,
    hatchOpen:()=>hatchOpen,
  };
}

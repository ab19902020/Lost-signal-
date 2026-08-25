import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';

const BASE = globalThis.__LS_BASE__ || import.meta.env?.BASE_URL || '/';
const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);

// Lost Signal V3 rule: every visible world object is a Blender-exported GLB.
const bunkerUrls = {
  environment: `${BASE}assets/blender/bunker_environment_v3.glb`,
  desk: `${BASE}assets/blender/desk_station.glb`,
  radio: `${BASE}assets/blender/radio.glb`,
  cctv: `${BASE}assets/blender/cctv_console_v2.glb`,
  vault: `${BASE}assets/blender/gun_vault_v2.glb`,
  rifle: `${BASE}assets/blender/hunting_rifle.glb`,
  armory: `${BASE}assets/blender/walk_in_armory_v1.glb`,
  generator: `${BASE}assets/blender/generator.glb`,
  bed: `${BASE}assets/blender/bed.glb`,
  chair: `${BASE}assets/blender/chair.glb`,
  storage: `${BASE}assets/blender/storage_rack.glb`,
  blastDoor: `${BASE}assets/blender/blast_door_v2.glb`,
  pipes: `${BASE}assets/blender/pipe_cluster.glb`,
  ceilingLight: `${BASE}assets/blender/ceiling_light.glb`,
  ventilation: `${BASE}assets/blender/ventilation_unit_v3.glb`,
  electrical: `${BASE}assets/blender/electrical_wall_v3.glb`,
  lockers: `${BASE}assets/blender/locker_bank_v3.glb`,
  bench: `${BASE}assets/blender/maintenance_bench_v3.glb`,
  clutter: `${BASE}assets/blender/survival_clutter_v3.glb`,
  statusBoard: `${BASE}assets/blender/status_board_v3.glb`,
  accessControl: `${BASE}assets/blender/access_control_v3.glb`,
  wallCamera: `${BASE}assets/blender/wall_camera_v3.glb`,
};

// User-supplied weapon assets. These GLBs already use glTF's Y-up convention,
// unlike the earliest Lost Signal Blender exports, so they must not pass
// through the legacy quarter-turn correction.
const suppliedUrls = {
  // The armoury is built rather than bought. The pack models were 240 to
  // 5,000 triangles and this is the geometry the player looks at more than any
  // other in the game; these are 5,600 to 16,600, with rails, irons, brakes,
  // ejection ports, checkered grips and magazines that have floor plates.
  // See blender/generate_weapons_v1.py.
  armoryAssault01: `${BASE}assets/blender/weapon_assault_rifle_01_v1.glb`,
  armoryAssault02: `${BASE}assets/blender/weapon_assault_rifle_02_v1.glb`,
  armoryAssault03: `${BASE}assets/blender/weapon_assault_rifle_03_v1.glb`,
  armoryBayonet: `${BASE}assets/blender/weapon_bayonet_v1.glb`,
  armoryBipod: `${BASE}assets/supplied/bipod.glb`,
  armoryBullpup: `${BASE}assets/blender/weapon_bullpup_rifle_v1.glb`,
  armoryPistol01: `${BASE}assets/blender/weapon_pistol_01_v1.glb`,
  armoryPistol02: `${BASE}assets/blender/weapon_pistol_02_v1.glb`,
  armoryPistol03: `${BASE}assets/blender/weapon_pistol_03_v1.glb`,
  armoryPistol04: `${BASE}assets/blender/weapon_pistol_04_v1.glb`,
  armoryRevolver01: `${BASE}assets/blender/weapon_revolver_01_v1.glb`,
  armoryRevolver02: `${BASE}assets/blender/weapon_revolver_02_v1.glb`,
  armoryRevolver03: `${BASE}assets/blender/weapon_revolver_03_v1.glb`,
  armoryScope: `${BASE}assets/supplied/scope.glb`,
  armoryShotgunSawed: `${BASE}assets/blender/weapon_shotgun_sawed_off_v1.glb`,
  armoryShotgunShort: `${BASE}assets/blender/weapon_shotgun_short_stock_v1.glb`,
  armoryShotgun01: `${BASE}assets/blender/weapon_shotgun_01_v1.glb`,
  armoryShotgun02: `${BASE}assets/blender/weapon_shotgun_02_v1.glb`,
  armorySniper01: `${BASE}assets/blender/weapon_sniper_rifle_01_v1.glb`,
  armorySniper02: `${BASE}assets/blender/weapon_sniper_rifle_02_v1.glb`,
  armorySniper03: `${BASE}assets/blender/weapon_sniper_rifle_03_v1.glb`,
  armorySniper04: `${BASE}assets/blender/weapon_sniper_rifle_04_v1.glb`,
  armorySmg01: `${BASE}assets/blender/weapon_smg_01_v1.glb`,
  armorySmg02: `${BASE}assets/blender/weapon_smg_02_v1.glb`,
  armoryTripod: `${BASE}assets/supplied/tripod.glb`,
};

// The visible human foundation. These are continuous, deformation-ready
// basemeshes rather than assembled primitives: 43,666 / 45,782 triangles,
// 53-bone rigs, coordinated body morphs, full facial/hand geometry, embedded
// material maps and authored Idle/Walk/Wave clips. Every resident, crowd
// member, sentry and quartermaster is derived from one of these two assets.
const humanUrls = {
  humanMale: `${BASE}assets/characters/resident_male_high_v1.glb`,
  humanFemale: `${BASE}assets/characters/resident_female_high_v1.glb`,
};

// The supplied model packs, converted from their FBX/OBJ sources by
// tools/convert-supplied-packs.sh. Loaded best-effort like the silo: a
// checkout without them still boots, it just runs a barer compound.
const packUrls = {
  // Weapons the FPS pack adds to the armoury wall.
  armoryAkm: `${BASE}assets/blender/weapon_akm_v1.glb`,
  armoryMossberg: `${BASE}assets/blender/weapon_mossberg_590a1_v1.glb`,
  armoryGlock: `${BASE}assets/blender/weapon_glock_19_v1.glb`,
  armoryCombatKnife: `${BASE}assets/blender/weapon_combat_knife_v1.glb`,
  // The surface.
  solarArray: `${BASE}assets/supplied/solar_array.glb`,
  deadTree01: `${BASE}assets/supplied/dead_tree_01.glb`,
  deadTree02: `${BASE}assets/supplied/dead_tree_02.glb`,
  deadTree03: `${BASE}assets/supplied/dead_tree_03.glb`,
  deadTree04: `${BASE}assets/supplied/dead_tree_04.glb`,
  deadTree05: `${BASE}assets/supplied/dead_tree_05.glb`,
  propBarrel: `${BASE}assets/supplied/prop_barrel.glb`,
  propContainer: `${BASE}assets/supplied/prop_container.glb`,
  propContainerRed: `${BASE}assets/supplied/prop_container_red.glb`,
  propPallet: `${BASE}assets/supplied/prop_pallet.glb`,
  propPalletBroken: `${BASE}assets/supplied/prop_pallet_broken.glb`,
  propCinderBlock: `${BASE}assets/supplied/prop_cinder_block.glb`,
  propPipes: `${BASE}assets/supplied/prop_pipes.glb`,
  propBarrier: `${BASE}assets/supplied/prop_barrier.glb`,
  propCone: `${BASE}assets/supplied/prop_cone.glb`,
  propStreetLight: `${BASE}assets/supplied/prop_street_light.glb`,
  propTownSign: `${BASE}assets/supplied/prop_town_sign.glb`,
  propWaterTower: `${BASE}assets/supplied/prop_water_tower.glb`,
  propWheels: `${BASE}assets/supplied/prop_wheels.glb`,
  propTrashBags: `${BASE}assets/supplied/prop_trash_bags.glb`,
  propChest: `${BASE}assets/supplied/prop_chest.glb`,
  propTruck: `${BASE}assets/supplied/prop_truck.glb`,
  // The working dog left on the surface roster. Human roles now use the
  // deformation-ready character foundation above.
  germanShepherd: `${BASE}assets/supplied/german_shepherd.glb`,
  // The medical bay and its stores.
  survivalFirstAid: `${BASE}assets/supplied/survival_first_aid_kit.glb`,
  survivalWaterBottle: `${BASE}assets/supplied/survival_water_bottle.glb`,
  survivalGasCan: `${BASE}assets/supplied/survival_gas_can.glb`,
  survivalBattery: `${BASE}assets/supplied/survival_battery.glb`,
  survivalCan: `${BASE}assets/supplied/survival_can.glb`,
  survivalPot: `${BASE}assets/supplied/survival_pot.glb`,
  survivalPan: `${BASE}assets/supplied/survival_pan.glb`,
  survivalBackpack: `${BASE}assets/supplied/survival_backpack.glb`,
  survivalTorch: `${BASE}assets/supplied/survival_torch.glb`,
  survivalMatchbox: `${BASE}assets/supplied/survival_matchbox.glb`,
  survivalPropaneTank: `${BASE}assets/supplied/survival_propane_tank.glb`,
  survivalShovel: `${BASE}assets/supplied/survival_shovel.glb`,
  survivalAxe: `${BASE}assets/supplied/survival_axe.glb`,
  survivalRadio: `${BASE}assets/supplied/survival_radio.glb`,
};

export const PACK_ASSET_KEYS = Object.keys(packUrls);

// Creatures are loaded best-effort: the game still boots if the asset workflow
// has not published them yet, it just runs with an empty surface.
const creatureUrls = {
  deer: `${BASE}assets/blender/deer_v3.glb`,
  rabbit: `${BASE}assets/blender/rabbit_v3.glb`,
};

// The silo beneath the shelter. Loaded best-effort like the creatures, so a
// checkout without the generated assets still boots into the bunker.
const siloUrls = {
  habShell: `${BASE}assets/blender/hab_shell_v4.glb`,
  habLevel: `${BASE}assets/blender/hab_level_v4.glb`,
  habStair: `${BASE}assets/blender/hab_stair_v4.glb`,
  habHydroponics: `${BASE}assets/blender/hab_hydroponics_v4.glb`,
  habCommons: `${BASE}assets/blender/hab_commons_v4.glb`,
  habSecureDoor: `${BASE}assets/blender/hab_secure_door_v4.glb`,
  habDirectory: `${BASE}assets/blender/hab_directory_v4.glb`,
  habLanding: `${BASE}assets/blender/hab_landing_v4.glb`,
  habTopLanding: `${BASE}assets/blender/hab_top_landing_v1.glb`,
  habApartment: `${BASE}assets/blender/hab_apartment_v4.glb`,
  habDoor: `${BASE}assets/blender/hab_door_v4.glb`,
  habCrown: `${BASE}assets/blender/hab_crown_v5.glb`,
  habSump: `${BASE}assets/blender/hab_sump_v5.glb`,
  habTunnel: `${BASE}assets/blender/hab_tunnel_v6.glb`,
  habBulkheadDoor: `${BASE}assets/blender/hab_bulkhead_door_v6.glb`,
  accessHatch: `${BASE}assets/blender/access_hatch_v3.glb`,
  siloCache: `${BASE}assets/blender/silo_cache_v3.glb`,
};

const exteriorUrls = {
  exteriorGround: `${BASE}assets/blender/exterior_ground_v3.glb`,
  exteriorEntrance: `${BASE}assets/blender/exterior_entrance_v3.glb`,
  fence: `${BASE}assets/blender/perimeter_fence_v3.glb`,
  fenceSigned: `${BASE}assets/blender/perimeter_fence_signed_v1.glb`,
  fenceTorn: `${BASE}assets/blender/perimeter_fence_damaged_v1.glb`,
  fenceDown: `${BASE}assets/blender/perimeter_fence_down_v1.glb`,
  gate: `${BASE}assets/blender/perimeter_gate.glb`,
  floodlight: `${BASE}assets/blender/floodlight.glb`,
  deadTree: `${BASE}assets/blender/dead_tree.glb`,
  remainsCovered: `${BASE}assets/blender/remains_covered_v1.glb`,
  remainsSlumped: `${BASE}assets/blender/remains_slumped_v1.glb`,
  barrier: `${BASE}assets/blender/concrete_barrier_v3.glb`,
  rubble: `${BASE}assets/blender/rubble_cluster_v3.glb`,
  rangeTarget: `${BASE}assets/blender/range_target_v1.glb`,
  distantTown: `${BASE}assets/blender/distant_town_v1.glb`,
  road: `${BASE}assets/blender/road_section_v1.glb`,
  roadDamaged: `${BASE}assets/blender/road_section_damaged_v1.glb`,
  wreckCar: `${BASE}assets/blender/wreck_car_v1.glb`,
  debrisField: `${BASE}assets/blender/debris_field_v1.glb`,
  estateCar: `${BASE}assets/blender/estate_car_v1.glb`,
  // The same car with its wheels left as separate objects, hub origins and
  // all, so one of them can be driven instead of parked.
  carDrivable: `${BASE}assets/blender/car_drivable_v1.glb`,
  // The countryside. Everything here is scattered in the dozens or the
  // hundreds through instanced draws, so each one is built to a budget.
  hedgerow: `${BASE}assets/blender/hedgerow_v1.glb`,
  hedgerowFar: `${BASE}assets/blender/hedgerow_far_v1.glb`,
  hedgeGap: `${BASE}assets/blender/hedge_gap_v1.glb`,
  scrub: `${BASE}assets/blender/scrub_v1.glb`,
  grassTuft: `${BASE}assets/blender/grass_tuft_v1.glb`,
  fallenTree: `${BASE}assets/blender/fallen_tree_v1.glb`,
  spoilHeap: `${BASE}assets/blender/spoil_heap_v1.glb`,
  telegraphPole: `${BASE}assets/blender/telegraph_pole_v1.glb`,
  farmWreck: `${BASE}assets/blender/farm_wreck_v1.glb`,
  fieldDebris: `${BASE}assets/blender/field_debris_v1.glb`,
};

// Assets exported before the up-axis fix carry the authored Y-up world rotated
// onto -Z. Corrected exports ship an LS_ORIENT_YUP marker, so anything without
// one is rotated back into place at load time and both generations render right.
const ORIENTATION_MARKER = 'LS_ORIENT_YUP';

function orientToYUp(scene) {
  const marker = findNamed(scene, ORIENTATION_MARKER);
  if (marker) {
    marker.parent?.remove(marker);
    return scene;
  }
  // The correction lives on an inner group. The returned root keeps an identity
  // transform so callers stay free to set position/rotation/scale on it, which
  // is exactly what place() does for every prop in the world.
  const pivot = new THREE.Group();
  pivot.name = 'LS_LegacyOrientation';
  pivot.rotation.x = Math.PI / 2;
  pivot.add(scene);
  const root = new THREE.Group();
  root.name = 'LS_AssetRoot';
  root.add(pivot);
  return root;
}

// Blender's box unwrap gives every face the full 0..1 UV range, so a 1K
// concrete map stretched across a 13 m floor smears into giant diamonds.
// Rescaling the mesh's own UVs keeps one texture instance shared across the
// scene while giving each surface a consistent texel density.
const TILE_METRES = 2.2;
const _tileBox = new THREE.Box3();
const _tileSize = new THREE.Vector3();

function retileUVs(mesh) {
  const geometry = mesh.geometry;
  const uv = geometry?.attributes?.uv;
  if (!uv || geometry.userData.lsRetiled) return;
  geometry.userData.lsRetiled = true;

  // A world-scale cube projection from Blender already runs past the unit
  // square. Rescaling that would tile it a second time.
  let maxUV = 0;
  for (let i = 0; i < uv.count; i++) {
    maxUV = Math.max(maxUV, Math.abs(uv.getX(i)), Math.abs(uv.getY(i)));
    if (maxUV > 1.05) return;
  }

  geometry.computeBoundingBox();
  _tileBox.copy(geometry.boundingBox);
  _tileBox.getSize(_tileSize);
  mesh.updateWorldMatrix(true, false);
  const scale = new THREE.Vector3().setFromMatrixScale(mesh.matrixWorld);
  const extents = [_tileSize.x * scale.x, _tileSize.y * scale.y, _tileSize.z * scale.z]
    .sort((a, b) => b - a);

  // A box unwrap gives every face its own 0..1 island, so there is no single
  // world axis that maps to U. Scaling both axes by the same factor — derived
  // from the surface's area — keeps the texture square. Scaling them
  // independently by sorted extents smeared tall thin surfaces like the silo's
  // wall panels into vertical streaks.
  const repeat = THREE.MathUtils.clamp(
    Math.round(Math.sqrt(extents[0] * extents[1]) / TILE_METRES), 1, 24);
  if (repeat === 1) return;

  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, uv.getX(i) * repeat, uv.getY(i) * repeat);
  }
  uv.needsUpdate = true;
}

function prepare(root, options = {}) {
  root.traverse((o) => {
    if (!o.isMesh && !o.isSkinnedMesh) return;
    o.castShadow = true;
    o.receiveShadow = true;
    const materials = Array.isArray(o.material) ? o.material : [o.material];
    let textured = false;
    for (const m of materials) {
      if (!m) continue;
      for (const slot of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap']) {
        const texture = m[slot];
        if (!texture) continue;
        textured = true;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.anisotropy = 8;
        if (slot === 'map') texture.colorSpace = THREE.SRGBColorSpace;
      }
      if ('roughness' in m && m.roughness == null) m.roughness = .65;
      // Alpha-tested cut-outs — the chain link — need a much lower cutoff than
      // the half the glTF default gives them. Wire is a thin minority of the
      // texture's pixels, so its lower mips average well below 0.5 and the
      // fence simply stops existing about thirty metres out. Cut low and let
      // distance thin it instead of deleting it.
      if (m.alphaTest > 0) {
        m.alphaTest = 0.12;
        m.depthWrite = true;
        if (m.map) m.map.anisotropy = 16;
      }
    }
    // Retiling is for Blender's world-scale box unwraps. A model that shares
    // one palette atlas across its whole mesh has no repeating surface to
    // retile: scaling its UVs walks every face onto a neighbouring swatch,
    // which is how a solar array came out white and a dead tree came out grey.
    if (textured && options.retile !== false) retileUVs(o);
  });
  return root;
}

async function loadModel(url, options = {}) {
  const gltf = await loader.loadAsync(url);
  gltf.scene = options.legacyOrientation === false ? gltf.scene : orientToYUp(gltf.scene);
  prepare(gltf.scene, options);
  if (options.fitHeight) {
    // Height fitting changes the content transform. Keep that transform on an
    // inner node so gameplay can put the returned root at an exact floor point
    // without overwriting the correction that put the character's soles at 0.
    const content = fitToHeight(gltf.scene, options.fitHeight);
    const fitted = new THREE.Group();
    fitted.name = 'LS_FittedHumanRoot';
    fitted.add(content);
    gltf.scene = fitted;
  }
  return gltf;
}

async function loadSet(entries, assets, onItem, options = {}) {
  await Promise.all(entries.map(async ([key, url]) => {
    assets[key] = await loadModel(url, options);
    onItem(key);
  }));
}

export async function loadGameAssets(onProgress = () => {}) {
  await MeshoptDecoder.ready;
  const assets = {};
  const bunkerEntries = Object.entries(bunkerUrls);
  const exteriorEntries = Object.entries(exteriorUrls);
  const suppliedEntries = Object.entries(suppliedUrls);
  const humanEntries = Object.entries(humanUrls);
  const total = bunkerEntries.length + exteriorEntries.length + suppliedEntries.length
    + humanEntries.length;
  let loaded = 0;
  const tick = (key) => {
    loaded += 1;
    onProgress(`Blender asset: ${key}`, loaded, total);
  };

  // Everything loads in parallel. No third-party animal/zombie downloads and no runtime
  // texture pack round-trip: the Blender GLBs carry their authored materials.
  await Promise.all([
    loadSet(bunkerEntries, assets, tick),
    loadSet(exteriorEntries, assets, tick),
    loadSet(suppliedEntries, assets, tick, { legacyOrientation: false, retile: false }),
    loadSet(humanEntries, assets, tick,
      { legacyOrientation: false, retile: false, fitHeight: 1.82 }),
  ]);

  // Existing gameplay systems keep their role keys, but the visible model and
  // animation source now come from the high-detail human foundation. Aliasing
  // avoids downloading and parsing the same multi-megabyte GLB more than once.
  assets.adventurer = assets.humanMale;
  assets.soldier = assets.humanMale;
  assets.infected = assets.humanMale;

  await Promise.all([
    ...Object.entries({ ...creatureUrls, ...siloUrls }).map(async ([key, url]) => {
      try {
        assets[key] = await loadModel(url);
      } catch (error) {
        console.warn(`Optional asset unavailable (${key}); that part of the world stays sealed until the Blender workflow publishes it.`, error);
      }
    }),
    // The converted packs are Y-up glTF like the rest of assets/supplied.
    ...Object.entries(packUrls).map(async ([key, url]) => {
      try {
        assets[key] = await loadModel(url, { legacyOrientation: false, retile: false });
      } catch (error) {
        console.warn(`Supplied pack asset unavailable (${key}); the compound runs without it.`, error);
      }
    }),
  ]);

  onProgress('Complete Blender world ready', total, total);
  return assets;
}

export async function loadExteriorAssets(onProgress = () => {}) {
  await MeshoptDecoder.ready;
  const assets = {};
  const entries = Object.entries(exteriorUrls);
  let loaded = 0;
  await loadSet(entries, assets, (key) => {
    loaded += 1;
    onProgress(`Blender exterior: ${key}`, loaded, entries.length);
  });
  return assets;
}

export function cloneGLTF(gltf) {
  return clone(gltf.scene);
}

export function fitToHeight(root, height) {
  root.updateMatrixWorld(true);
  let box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  root.scale.multiplyScalar(height / Math.max(size.y, 0.001));
  root.updateMatrixWorld(true);
  box = new THREE.Box3().setFromObject(root);
  root.position.y -= box.min.y;
  return root;
}

export function findNamed(root, name) {
  let found = null;
  root.traverse(o => { if (!found && o.name === name) found = o; });
  return found;
}

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

// User-supplied Quaternius assets. These GLBs already use glTF's Y-up
// convention, unlike the earliest Lost Signal Blender exports, so they must
// not pass through the legacy quarter-turn correction.
const suppliedUrls = {
  adventurer: `${BASE}assets/supplied/adventurer.glb`,
  armoryAssault01: `${BASE}assets/supplied/assault_rifle_01.glb`,
  armoryAssault02: `${BASE}assets/supplied/assault_rifle_02.glb`,
  armoryAssault03: `${BASE}assets/supplied/assault_rifle_03.glb`,
  armoryBayonet: `${BASE}assets/supplied/bayonet.glb`,
  armoryBipod: `${BASE}assets/supplied/bipod.glb`,
  armoryBullpup: `${BASE}assets/supplied/bullpup.glb`,
  armoryPistol01: `${BASE}assets/supplied/pistol_01.glb`,
  armoryPistol02: `${BASE}assets/supplied/pistol_02.glb`,
  armoryPistol03: `${BASE}assets/supplied/pistol_03.glb`,
  armoryPistol04: `${BASE}assets/supplied/pistol_04.glb`,
  armoryRevolver01: `${BASE}assets/supplied/revolver_01.glb`,
  armoryRevolver02: `${BASE}assets/supplied/revolver_02.glb`,
  armoryRevolver03: `${BASE}assets/supplied/revolver_03.glb`,
  armoryScope: `${BASE}assets/supplied/scope.glb`,
  armoryShotgunSawed: `${BASE}assets/supplied/shotgun_sawed_off.glb`,
  armoryShotgunShort: `${BASE}assets/supplied/shotgun_short_stock.glb`,
  armoryShotgun01: `${BASE}assets/supplied/shotgun_01.glb`,
  armoryShotgun02: `${BASE}assets/supplied/shotgun_02.glb`,
  armorySniper01: `${BASE}assets/supplied/sniper_rifle_01.glb`,
  armorySniper02: `${BASE}assets/supplied/sniper_rifle_02.glb`,
  armorySniper03: `${BASE}assets/supplied/sniper_rifle_03.glb`,
  armorySniper04: `${BASE}assets/supplied/sniper_rifle_04.glb`,
  armorySmg01: `${BASE}assets/supplied/submachine_gun_01.glb`,
  armorySmg02: `${BASE}assets/supplied/submachine_gun_02.glb`,
  armoryTripod: `${BASE}assets/supplied/tripod.glb`,
};

// The supplied model packs, converted from their FBX/OBJ sources by
// tools/convert-supplied-packs.sh. Loaded best-effort like the silo: a
// checkout without them still boots, it just runs a barer compound.
const packUrls = {
  // Weapons the FPS pack adds to the armoury wall.
  armoryAkm: `${BASE}assets/supplied/akm.glb`,
  armoryMossberg: `${BASE}assets/supplied/mossberg_590a1.glb`,
  armoryGlock: `${BASE}assets/supplied/glock_19.glb`,
  armoryCombatKnife: `${BASE}assets/supplied/combat_knife.glb`,
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
  // The two people left on the surface roster.
  soldier: `${BASE}assets/supplied/soldier.glb`,
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
  // Six revision-six people: denser silhouettes, readable faces, hands and
  // footwear. Twenty residents still rotate through all six builds and the
  // runtime palette, so the added detail never turns into clone repetition.
  residentA: `${BASE}assets/blender/resident_a_v6.glb`,
  residentB: `${BASE}assets/blender/resident_b_v6.glb`,
  residentC: `${BASE}assets/blender/resident_c_v6.glb`,
  residentD: `${BASE}assets/blender/resident_d_v6.glb`,
  residentE: `${BASE}assets/blender/resident_e_v6.glb`,
  residentF: `${BASE}assets/blender/resident_f_v6.glb`,
  residentStillA: `${BASE}assets/blender/resident_still_a_v6.glb`,
  residentStillB: `${BASE}assets/blender/resident_still_b_v6.glb`,
  residentStillC: `${BASE}assets/blender/resident_still_c_v6.glb`,
  residentStillD: `${BASE}assets/blender/resident_still_d_v6.glb`,
  residentStillE: `${BASE}assets/blender/resident_still_e_v6.glb`,
  residentStillF: `${BASE}assets/blender/resident_still_f_v6.glb`,
  accessHatch: `${BASE}assets/blender/access_hatch_v3.glb`,
  siloCache: `${BASE}assets/blender/silo_cache_v3.glb`,
};

const exteriorUrls = {
  exteriorGround: `${BASE}assets/blender/exterior_ground_v3.glb`,
  exteriorEntrance: `${BASE}assets/blender/exterior_entrance_v3.glb`,
  fence: `${BASE}assets/blender/perimeter_fence_v3.glb`,
  gate: `${BASE}assets/blender/perimeter_gate.glb`,
  floodlight: `${BASE}assets/blender/floodlight.glb`,
  deadTree: `${BASE}assets/blender/dead_tree.glb`,
  remainsCovered: `${BASE}assets/blender/remains_covered_v1.glb`,
  remainsSlumped: `${BASE}assets/blender/remains_slumped_v1.glb`,
  barrier: `${BASE}assets/blender/concrete_barrier_v3.glb`,
  rubble: `${BASE}assets/blender/rubble_cluster_v3.glb`,
  rangeTarget: `${BASE}assets/blender/range_target_v1.glb`,
  distantTown: `${BASE}assets/blender/distant_town_v1.glb`,
  estateCar: `${BASE}assets/blender/estate_car_v1.glb`,
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
  const total = bunkerEntries.length + exteriorEntries.length + suppliedEntries.length;
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
  ]);

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

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
  habApartment: `${BASE}assets/blender/hab_apartment_v4.glb`,
  habDoor: `${BASE}assets/blender/hab_door_v4.glb`,
  habCrown: `${BASE}assets/blender/hab_crown_v5.glb`,
  habSump: `${BASE}assets/blender/hab_sump_v5.glb`,
  habTunnel: `${BASE}assets/blender/hab_tunnel_v5.glb`,
  // Six builds of person. Twenty residents drawn from six bodies and a
  // palette of cloth, hair and skin read as twenty people.
  residentA: `${BASE}assets/blender/resident_a_v5.glb`,
  residentB: `${BASE}assets/blender/resident_b_v5.glb`,
  residentC: `${BASE}assets/blender/resident_c_v5.glb`,
  residentD: `${BASE}assets/blender/resident_d_v5.glb`,
  residentE: `${BASE}assets/blender/resident_e_v5.glb`,
  residentF: `${BASE}assets/blender/resident_f_v5.glb`,
  residentStillA: `${BASE}assets/blender/resident_still_a_v5.glb`,
  residentStillB: `${BASE}assets/blender/resident_still_b_v5.glb`,
  residentStillC: `${BASE}assets/blender/resident_still_c_v5.glb`,
  residentStillD: `${BASE}assets/blender/resident_still_d_v5.glb`,
  residentStillE: `${BASE}assets/blender/resident_still_e_v5.glb`,
  residentStillF: `${BASE}assets/blender/resident_still_f_v5.glb`,
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

function prepare(root) {
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
    if (textured) retileUVs(o);
  });
  return root;
}

async function loadModel(url) {
  const gltf = await loader.loadAsync(url);
  gltf.scene = orientToYUp(gltf.scene);
  prepare(gltf.scene);
  return gltf;
}

async function loadSet(entries, assets, onItem) {
  await Promise.all(entries.map(async ([key, url]) => {
    assets[key] = await loadModel(url);
    onItem(key);
  }));
}

export async function loadGameAssets(onProgress = () => {}) {
  await MeshoptDecoder.ready;
  const assets = {};
  const bunkerEntries = Object.entries(bunkerUrls);
  const exteriorEntries = Object.entries(exteriorUrls);
  const total = bunkerEntries.length + exteriorEntries.length;
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
  ]);

  await Promise.all(Object.entries({ ...creatureUrls, ...siloUrls }).map(async ([key, url]) => {
    try {
      assets[key] = await loadModel(url);
    } catch (error) {
      console.warn(`Optional asset unavailable (${key}); that part of the world stays sealed until the Blender workflow publishes it.`, error);
    }
  }));

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

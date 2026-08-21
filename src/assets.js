import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';

const BASE = globalThis.__LS_BASE__ || import.meta.env.BASE_URL;
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

const exteriorUrls = {
  exteriorGround: `${BASE}assets/blender/exterior_ground_v3.glb`,
  exteriorEntrance: `${BASE}assets/blender/exterior_entrance_v3.glb`,
  fence: `${BASE}assets/blender/perimeter_fence_v3.glb`,
  gate: `${BASE}assets/blender/perimeter_gate.glb`,
  floodlight: `${BASE}assets/blender/floodlight.glb`,
  deadTree: `${BASE}assets/blender/dead_tree.glb`,
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
  const corrected = new THREE.Group();
  corrected.name = 'LS_LegacyOrientation';
  corrected.rotation.x = Math.PI / 2;
  corrected.add(scene);
  return corrected;
}

function prepare(root) {
  root.traverse((o) => {
    if (!o.isMesh && !o.isSkinnedMesh) return;
    o.castShadow = true;
    o.receiveShadow = true;
    const materials = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of materials) {
      if (!m) continue;
      if (m.map) {
        m.map.colorSpace = THREE.SRGBColorSpace;
        m.map.anisotropy = 8;
      }
      if (m.normalMap) m.normalMap.anisotropy = 8;
      if ('roughness' in m && m.roughness == null) m.roughness = .65;
    }
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

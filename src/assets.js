import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';

const BASE = globalThis.__LS_BASE__ || import.meta.env.BASE_URL;
const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);

// V5 integrated bunker plus the existing component set that still supports
// proven weapon/survival plumbing while the migration completes.
const bunkerUrls = {
  roomV5: `${BASE}assets/blender/shelter47_room_v5.glb`,
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
  // Legacy set remains temporarily because the V5 compatibility layer creates
  // its exterior before V6 replaces it. It is not displayed by V6.
  exteriorGround: `${BASE}assets/blender/exterior_ground_v3.glb`,
  exteriorEntrance: `${BASE}assets/blender/exterior_entrance_v3.glb`,
  fence: `${BASE}assets/blender/perimeter_fence_v3.glb`,
  gate: `${BASE}assets/blender/perimeter_gate.glb`,
  floodlight: `${BASE}assets/blender/floodlight.glb`,
  deadTree: `${BASE}assets/blender/dead_tree.glb`,
  barrier: `${BASE}assets/blender/concrete_barrier_v3.glb`,
  rubble: `${BASE}assets/blender/rubble_cluster_v3.glb`,

  // Shelter 47 V6 exterior: all authored by blender/build_exterior_v6.py.
  yardV6: `${BASE}assets/blender/shelter47_yard_v6.glb`,
  grassV6: `${BASE}assets/blender/grass_clump_v6.glb`,
  pineV6: `${BASE}assets/blender/pine_tree_v6.glb`,
  bushV6: `${BASE}assets/blender/bush_v6.glb`,
  rockV6: `${BASE}assets/blender/rock_v6.glb`,
  deerV6: `${BASE}assets/blender/deer_v6.glb`,
  rabbitV6: `${BASE}assets/blender/rabbit_v6.glb`,
};

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

  await Promise.all([
    loadSet(bunkerEntries, assets, tick),
    loadSet(exteriorEntries, assets, tick),
  ]);

  onProgress('Complete authored Blender world ready', total, total);
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

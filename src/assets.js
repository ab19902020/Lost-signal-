import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';

const BASE = globalThis.__LS_BASE__ || import.meta.env.BASE_URL;
const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);

const bunkerUrls = {
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
};

const exteriorUrls = {
  gate: `${BASE}assets/blender/perimeter_gate.glb`,
  floodlight: `${BASE}assets/blender/floodlight.glb`,
  deadTree: `${BASE}assets/blender/dead_tree.glb`,
};

const textureUrls = {
  concreteColor: `${BASE}assets/textures/concrete__Concrete034_1K_Color.jpg`,
  concreteNormal: `${BASE}assets/textures/concrete__Concrete034_1K_NormalGL.jpg`,
  concreteRoughness: `${BASE}assets/textures/concrete__Concrete034_1K_Roughness.jpg`,
  plateColor: `${BASE}assets/textures/metal_floor_plate__DiamondPlate008C_1K_Color.jpg`,
  plateNormal: `${BASE}assets/textures/metal_floor_plate__DiamondPlate008C_1K_NormalGL.jpg`,
  plateRoughness: `${BASE}assets/textures/metal_floor_plate__DiamondPlate008C_1K_Roughness.jpg`,
};

function prepare(root) {
  root.traverse((o) => {
    if (!o.isMesh && !o.isSkinnedMesh) return;
    o.castShadow = true;
    o.receiveShadow = true;
    const materials = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of materials) {
      if (!m) continue;
      if ('roughness' in m) m.roughness = Math.max(0.32, m.roughness ?? 0.7);
      if (m.map) {
        m.map.colorSpace = THREE.SRGBColorSpace;
        m.map.anisotropy = 8;
      }
    }
  });
  return root;
}

async function loadModel(url) {
  const gltf = await loader.loadAsync(url);
  prepare(gltf.scene);
  return gltf;
}

export async function loadGameAssets(onProgress = () => {}) {
  await MeshoptDecoder.ready;
  const entries = Object.entries(bunkerUrls);
  const assets = {};

  onProgress('Loading bunker PBR materials', 1, 3);
  const texturesPromise = loadTextures();

  onProgress('Loading Blender bunker kit', 2, 3);
  const modelsPromise = Promise.all(entries.map(async ([key, url]) => {
    const gltf = await loadModel(url);
    assets[key] = gltf;
  }));

  await Promise.all([texturesPromise.then(t => { assets.textures = t; }), modelsPromise]);
  onProgress('Blender bunker ready', 3, 3);
  return assets;
}

export async function loadExteriorAssets(onProgress = () => {}) {
  await MeshoptDecoder.ready;
  const assets = {};
  const entries = Object.entries(exteriorUrls);
  await Promise.all(entries.map(async ([key, url], i) => {
    try {
      onProgress(`Loading exterior ${key}`, i + 1, entries.length);
      assets[key] = await loadModel(url);
    } catch (err) {
      console.warn(`Exterior Blender asset ${key} skipped`, err);
    }
  }));
  return assets;
}

async function loadTextures() {
  const tl = new THREE.TextureLoader();
  const load = async (url, srgb = false, rx = 1, ry = 1) => {
    const t = await tl.loadAsync(url);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rx, ry);
    t.anisotropy = 8;
    return t;
  };

  const [concreteColor, concreteNormal, concreteRoughness, plateColor, plateNormal, plateRoughness] = await Promise.all([
    load(textureUrls.concreteColor, true, 3, 3),
    load(textureUrls.concreteNormal, false, 3, 3),
    load(textureUrls.concreteRoughness, false, 3, 3),
    load(textureUrls.plateColor, true, 4, 7),
    load(textureUrls.plateNormal, false, 4, 7),
    load(textureUrls.plateRoughness, false, 4, 7),
  ]);
  return { concreteColor, concreteNormal, concreteRoughness, plateColor, plateNormal, plateRoughness };
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

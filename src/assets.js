import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';

const BASE = globalThis.__LS_BASE__ || import.meta.env.BASE_URL;
const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);

const urls = {
  interiorAAA: `${BASE}assets/blender/aaa/shelter47_aaa_interior.glb`,
  exteriorAAA: `${BASE}assets/blender/aaa/shelter47_aaa_exterior.glb`,
  deerAAA: `${BASE}assets/blender/aaa/deer_aaa.glb`,
  rabbitAAA: `${BASE}assets/blender/aaa/rabbit_aaa.glb`,
  infectedAAA: `${BASE}assets/blender/aaa/infected_aaa.glb`,
  rifle: `${BASE}assets/blender/hunting_rifle.glb`,
  vault: `${BASE}assets/blender/gun_vault_v2.glb`,
};

function prepare(root) {
  root.traverse((o) => {
    if (o.isLight) {
      o.castShadow = false;
      return;
    }
    if (!o.isMesh && !o.isSkinnedMesh) return;
    o.castShadow = true;
    o.receiveShadow = true;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) {
      if (!m) continue;
      if (m.map) { m.map.colorSpace = THREE.SRGBColorSpace; m.map.anisotropy = 8; }
      if (m.normalMap) m.normalMap.anisotropy = 8;
      if ('roughness' in m) m.roughness = Math.max(m.roughness ?? .55, .28);
      if ('emissiveIntensity' in m) m.emissiveIntensity = Math.min(m.emissiveIntensity ?? 1, 2.2);
      m.needsUpdate = true;
    }
  });
  return root;
}

async function loadOne(key, url, tick) {
  const gltf = await loader.loadAsync(url);
  prepare(gltf.scene);
  tick(key);
  return gltf;
}

export async function loadGameAssets(onProgress = () => {}) {
  await MeshoptDecoder.ready;
  const entries = Object.entries(urls);
  const assets = {};
  let loaded = 0;
  const tick = (key) => { loaded += 1; onProgress(`AAA Blender asset: ${key}`, loaded, entries.length); };
  await Promise.all(entries.map(async ([key, url]) => { assets[key] = await loadOne(key, url, tick); }));
  onProgress('AAA reference world ready', entries.length, entries.length);
  return assets;
}

export function cloneGLTF(gltf) { return clone(gltf.scene); }
export function findNamed(root, name) {
  let found = null;
  root?.traverse((o) => { if (!found && o.name === name) found = o; });
  return found;
}
export function findPrefix(root, prefix) {
  const out = [];
  root?.traverse((o) => { if (o.name === prefix || o.name.startsWith(prefix)) out.push(o); });
  return out;
}

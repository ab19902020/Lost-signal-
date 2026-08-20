import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';

const BASE = globalThis.__LS_BASE__ || import.meta.env.BASE_URL;
const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);

const urls = {
  deer: `${BASE}assets/wildlife/deer.glb`,
  rabbit: `${BASE}assets/wildlife/rabbit.glb`,
  zombie: `${BASE}assets/infected/zombie.glb`,
  rifle: `${BASE}assets/weapons/rifle.glb`,
  barrel: `${BASE}assets/props/barrel.glb`,
  container: `${BASE}assets/props/container.glb`,
  cinderblock: `${BASE}assets/props/cinderblock.glb`,
  blenderBlastDoor: `${BASE}assets/blender/blast_door.glb`,
  blenderGunVault: `${BASE}assets/blender/gun_vault.glb`,
  blenderCCTV: `${BASE}assets/blender/cctv_console.glb`,
  blenderGate: `${BASE}assets/blender/perimeter_gate.glb`,
  blenderFloodlight: `${BASE}assets/blender/floodlight.glb`,
  blenderDeadTree: `${BASE}assets/blender/dead_tree.glb`,
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
      if ('roughness' in m) m.roughness = Math.max(0.45, m.roughness ?? 0.75);
      if (m.map) {
        m.map.colorSpace = THREE.SRGBColorSpace;
        m.map.anisotropy = 8;
      }
    }
  });
  return root;
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

export async function loadGameAssets(onProgress = () => {}) {
  await MeshoptDecoder.ready;
  const required = ['deer', 'rabbit', 'zombie', 'rifle'];
  const optional = [
    'barrel', 'container', 'cinderblock',
    'blenderBlastDoor', 'blenderGunVault', 'blenderCCTV',
    'blenderGate', 'blenderFloodlight', 'blenderDeadTree'
  ];
  const assets = {};

  for (let i = 0; i < required.length; i++) {
    const key = required[i];
    onProgress(`Loading ${key.toUpperCase()} model`, i + 1, required.length + 1);
    const gltf = await loader.loadAsync(urls[key]);
    prepare(gltf.scene);
    assets[key] = gltf;
  }

  onProgress('Loading PBR materials', required.length + 1, required.length + 1);
  assets.textures = await loadTextures();

  await Promise.all(optional.map(async (key) => {
    try {
      const gltf = await loader.loadAsync(urls[key]);
      prepare(gltf.scene);
      assets[key] = gltf;
    } catch (err) {
      console.warn(`Optional asset ${key} skipped`, err);
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

export function pickClip(gltf, regex, fallback = 0) {
  return gltf.animations.find((clip) => regex.test(clip.name)) ?? gltf.animations[fallback] ?? null;
}

export function createMixer(root, clip, speed = 1) {
  const mixer = new THREE.AnimationMixer(root);
  if (clip) {
    const action = mixer.clipAction(clip);
    action.timeScale = speed;
    action.play();
    if (clip.duration) action.time = Math.random() * clip.duration;
  }
  return mixer;
}

import * as THREE from 'three';
import { cloneGLTF } from './assets.js';

// Lost Signal's close-range people share two production basemeshes rather than
// six low-detail procedural bodies. Each base has continuous deformation loops,
// a 53-bone rig, full hands and facial geometry, embedded skin/eye/hair maps,
// and coordinated Athletic/Lean/Heavy morph targets. The six presets below are
// deliberately different bodies, not six palette swaps of one silhouette.
export const HUMAN_BUILD_PRESETS = [
  { id: 'A-male-natural', asset: 'humanMale', gender: 'male', morph: null,
    height: 1.000, frame: 1.000, triangles: 45782 },
  { id: 'B-female-athletic', asset: 'humanFemale', gender: 'female', morph: 'Athletic',
    height: 1.015, frame: 1.015, triangles: 43666 },
  { id: 'C-male-lean', asset: 'humanMale', gender: 'male', morph: 'Lean',
    height: 1.035, frame: .965, triangles: 45782 },
  { id: 'D-female-natural', asset: 'humanFemale', gender: 'female', morph: null,
    height: .975, frame: .985, triangles: 43666 },
  { id: 'E-male-heavy', asset: 'humanMale', gender: 'male', morph: 'Heavy',
    height: .985, frame: 1.035, triangles: 45782 },
  { id: 'F-female-heavy', asset: 'humanFemale', gender: 'female', morph: 'Heavy',
    height: 1.025, frame: 1.025, triangles: 43666 },
];

const TOPS = [0x394b50, 0x4e433a, 0x304942, 0x51423f, 0x354454, 0x504d3d, 0x414b45, 0x57443f];
const BOTTOMS = [0x232832, 0x332e29, 0x20292c, 0x37322d, 0x282c34, 0x3a302a];
const HAIRS = [0x17110e, 0x302117, 0x513822, 0x716352, 0x0d0b0a, 0x442d1c];
const SKINS = [0xd59a73, 0xb87955, 0x8f5e42, 0xe3b08a, 0x68412f, 0xc68a65];
const SHOES = [0x181716, 0x292825, 0x171b21, 0x3a3028];

const pick = (list, index, salt) => list[(index * 7 + salt) % list.length];

function materialRole(material) {
  const tagged = material?.userData?.humanforge_role;
  if (tagged) return String(tagged).toLowerCase();
  const name = String(material?.name || '').toLowerCase();
  for (const role of ['eyebrows', 'eyelashes', 'eyes', 'hair', 'top', 'bottom',
    'shoes', 'skin', 'teeth', 'tongue']) {
    if (name.includes(role)) return role;
  }
  return name;
}

function tuneMaterial(material, role, palette) {
  if (!material) return material;
  const colour = palette[role];
  if (colour !== undefined && material.color) material.color.setHex(colour);
  material.metalness = 0;
  material.envMapIntensity = role === 'eyes' ? .58 : .72;

  if (role === 'skin') {
    material.roughness = .48;
    if ('clearcoat' in material) {
      material.clearcoat = .035;
      material.clearcoatRoughness = .48;
    }
  } else if (role === 'eyes') {
    material.roughness = .19;
    if ('clearcoat' in material) {
      material.clearcoat = .36;
      material.clearcoatRoughness = .18;
    }
    // MakeHuman's high-poly eyeballs use the texture alpha and a two-sided
    // corneal surface. Treating them like opaque clothing reveals the inner
    // sclera over the iris at conversation distance, producing glowing white
    // eyes under the armory key light. Preserve that specialised layering.
    material.transparent = true;
    material.alphaTest = 0;
    material.depthWrite = false;
    material.opacity = 1;
    material.side = THREE.DoubleSide;
  } else if (role === 'teeth') {
    material.roughness = .27;
  } else if (role === 'shoes') {
    material.roughness = .40;
  } else if (role === 'hair' || role === 'eyebrows' || role === 'eyelashes') {
    material.roughness = .62;
    // These maps really are cut-outs. The source marks every human material
    // as blended, which makes opaque skin and clothes fight the depth sorter.
    // Hair remains alpha-tested while every solid surface writes depth.
    material.transparent = false;
    material.alphaTest = role === 'eyelashes' ? .08 : .12;
    material.depthWrite = true;
    material.side = THREE.DoubleSide;
  } else if (role === 'top' || role === 'bottom') {
    material.roughness = .84;
  }

  if (!['hair', 'eyebrows', 'eyelashes', 'eyes'].includes(role)) {
    material.transparent = false;
    material.alphaTest = 0;
    material.depthWrite = true;
    material.opacity = 1;
    material.side = THREE.FrontSide;
  }

  for (const slot of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap']) {
    if (material[slot]) material[slot].anisotropy = 16;
  }
  material.needsUpdate = true;
  return material;
}

function applyMorph(root, morph, strength = 1) {
  root.traverse((object) => {
    const influences = object.morphTargetInfluences;
    const dictionary = object.morphTargetDictionary;
    if (!influences || !dictionary) return;
    influences.fill(0);
    const target = morph ? dictionary[morph] : undefined;
    if (target !== undefined) influences[target] = strength;
  });
}

/**
 * Give a cloned high-detail human one of the six resident identities.
 * Materials are cloned per person, while geometry, textures and skeleton data
 * stay shared. That keeps fifty visible people practical without reducing the
 * close-up mesh itself.
 */
export function dressHuman(root, index = 0, overrides = {}) {
  const preset = overrides.preset || HUMAN_BUILD_PRESETS[index % HUMAN_BUILD_PRESETS.length];
  const palette = {
    top: overrides.top ?? pick(TOPS, index, 0),
    bottom: overrides.bottom ?? pick(BOTTOMS, index, 3),
    hair: overrides.hair ?? pick(HAIRS, index, 5),
    eyebrows: overrides.hair ?? pick(HAIRS, index, 5),
    eyelashes: overrides.hair ?? pick(HAIRS, index, 5),
    skin: overrides.skin ?? pick(SKINS, index, 1),
    shoes: overrides.shoes ?? pick(SHOES, index, 2),
  };

  const materials = new Map();
  root.traverse((object) => {
    if (!object.isMesh && !object.isSkinnedMesh) return;
    object.castShadow = true;
    object.receiveShadow = true;
    const source = Array.isArray(object.material) ? object.material : [object.material];
    const styled = source.map((material) => {
      if (!material) return material;
      let copy = materials.get(material);
      if (!copy) {
        copy = material.clone();
        tuneMaterial(copy, materialRole(copy), palette);
        materials.set(material, copy);
      }
      return copy;
    });
    object.material = Array.isArray(object.material) ? styled : styled[0];
  });

  applyMorph(root, overrides.morph ?? preset.morph, overrides.morphStrength ?? 1);

  // Preserve the load-time height normalisation and apply variation relative
  // to it. Recording the base prevents a role restyle from multiplying scale.
  if (!root.userData.humanBaseScale) root.userData.humanBaseScale = root.scale.toArray();
  const [sx, sy, sz] = root.userData.humanBaseScale;
  root.scale.set(sx * (overrides.frame ?? preset.frame),
    sy * (overrides.height ?? preset.height), sz * (overrides.frame ?? preset.frame));
  root.userData.humanBuild = overrides.id || preset.id;
  root.userData.humanGender = preset.gender;
  root.userData.humanTriangles = preset.triangles;
  root.userData.humanTopology = 'continuous-deformation-loops';
  return root;
}

export function createResidentHuman(assets, index) {
  const preset = HUMAN_BUILD_PRESETS[index % HUMAN_BUILD_PRESETS.length];
  const gltf = assets[preset.asset] || assets.humanMale || assets.humanFemale;
  if (!gltf) return null;
  const root = dressHuman(cloneGLTF(gltf), index, { preset });
  root.name = `Resident_${preset.id}`;
  return { root, gltf, preset };
}

export function humanClip(gltf, wanted) {
  const target = wanted.toLowerCase();
  return gltf?.animations?.find((clip) => clip.name.toLowerCase() === target)
    || gltf?.animations?.find((clip) => clip.name.toLowerCase().endsWith(target))
    || null;
}

// Static crowd members are frozen at different instants of the authored idle,
// so the populated galleries do not contain thirty identical bind poses.
export function freezeHumanPose(root, gltf, time = 0) {
  const clip = humanClip(gltf, 'Idle');
  if (!clip) return null;
  const mixer = new THREE.AnimationMixer(root);
  const action = mixer.clipAction(clip);
  action.play();
  mixer.setTime(clip.duration > 0 ? time % clip.duration : 0);
  action.paused = true;
  root.userData.staticPoseMixer = mixer;
  return mixer;
}

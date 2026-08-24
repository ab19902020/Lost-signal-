import * as THREE from 'three';
import { cloneGLTF, findNamed } from './assets.js';

// The bunker starts as one 13 m room. This occupies its former loose-crate
// corner as a 4.6 x 4.1 m walk-in shop, leaving the hatch and all circulation
// routes clear.
export const ARMORY_ORIGIN = new THREE.Vector3(3.80, 0, 2.60);

const BACK_WALL = [
  'armoryAssault01', 'armoryAssault02',
  'armoryAssault03', 'armoryBullpup',
  'armoryShotgunSawed', 'armoryShotgunShort',
  'armoryShotgun01', 'armoryShotgun02',
  'armorySniper01', 'armorySniper02',
];

const LEFT_WALL = [
  'armoryPistol01', 'armoryPistol02', 'armoryPistol03', 'armoryPistol04',
  'armoryRevolver01', 'armoryRevolver02', 'armoryRevolver03',
];

const RIGHT_WALL = [
  'armorySniper03', 'armorySniper04',
  'armorySmg01', 'armorySmg02',
  'armoryBayonet', 'armoryBipod', 'armoryScope', 'armoryTripod',
];

export const ARMORY_WEAPON_KEYS = [...BACK_WALL, ...LEFT_WALL, ...RIGHT_WALL];

const _box = new THREE.Box3();
const _centre = new THREE.Vector3();
const _target = new THREE.Vector3();

function mountModel({ assets, scene, place }, key, position, rotation, scale) {
  const gltf = assets[key];
  if (!gltf) return null;
  // Place at the origin first, then move the actual geometry centre onto the
  // rack point. Quaternius models use sensible axes but different pivots.
  const root = place(gltf, scene, [0, 0, 0], rotation, scale, {
    world: 'bunker', collide: false,
  });
  root.name = `Armory_Display_${key}`;
  root.updateWorldMatrix(true, true);
  _box.setFromObject(root).getCenter(_centre);
  _target.copy(ARMORY_ORIGIN).add(new THREE.Vector3(...position));
  root.position.add(_target.sub(_centre));
  root.userData.armoryWeapon = key;
  return root;
}

function clipBySuffix(gltf, ...suffixes) {
  for (const suffix of suffixes) {
    const clip = gltf?.animations?.find((candidate) => candidate.name.endsWith(suffix));
    if (clip) return clip;
  }
  return gltf?.animations?.[0] || null;
}

export function buildArmory({ assets, scene, colliders, place, addInteraction }) {
  if (!assets.armory || !assets.armoryAssault01) return null;

  const shell = place(assets.armory, scene, ARMORY_ORIGIN.toArray(), [0, 0, 0], 1, {
    world: 'bunker', collide: false,
  });
  shell.name = 'Walk_In_Armoury';
  shell.updateWorldMatrix(true, true);

  let staticColliderCount = 0;
  shell.traverse((part) => {
    if (!part.isMesh || !/^Armory_(Floor|Wall_|Rack_|Counter_|Ammo_|Door_Header|Door_Jamb)/.test(part.name)) return;
    const collider = colliders.addObject(part, {
      shrink: part.name === 'Armory_Floor' ? 0 : .015,
      climbable: part.name === 'Armory_Floor' || /Counter_Top|Ammo_(Shelf|Crate)/.test(part.name),
    });
    if (collider) staticColliderCount++;
  });

  const doorParts = [];
  shell.traverse((part) => {
    if (/^Armory_Door_(Leaf|Inset|Window|Brace_)/.test(part.name)) {
      doorParts.push({ part, closedX: part.position.x });
    }
  });
  const doorLeaf = findNamed(shell, 'Armory_Door_Leaf');
  const keypad = findNamed(shell, 'Armory_Keypad');
  const doorCollider = doorLeaf ? colliders.addObject(doorLeaf, { shrink: .01 }) : null;
  let open = false;
  let doorOffset = 0;

  const toggleDoor = () => {
    open = !open;
    if (doorCollider) doorCollider.enabled = !open;
    window.dispatchEvent(new CustomEvent('lostsignal:vaultopen', { detail: { open } }));
  };
  if (doorLeaf) addInteraction(doorLeaf, 'ARMOURY SECURITY DOOR', 'bunker', toggleDoor);
  if (keypad) addInteraction(keypad, 'ARMOURY ACCESS KEYPAD', 'bunker', toggleDoor);

  const displayWeapons = [];
  for (let i = 0; i < BACK_WALL.length; i++) {
    const column = i % 2;
    const row = Math.floor(i / 2);
    const key = BACK_WALL[i];
    const longGun = !/Sawed/.test(key);
    const root = mountModel({ assets, scene, place }, key,
      [-1.12 + column * 2.24, .55 + row * .47, 1.75],
      [0, 0, 0], longGun ? .175 : .19);
    if (root) displayWeapons.push(root);
  }

  for (let i = 0; i < LEFT_WALL.length; i++) {
    const column = i % 2;
    const row = Math.floor(i / 2);
    const root = mountModel({ assets, scene, place }, LEFT_WALL[i],
      [-2.01, .65 + row * .69, -.84 + column * 1.68],
      [0, -Math.PI / 2, 0], .18);
    if (root) displayWeapons.push(root);
  }

  for (let i = 0; i < RIGHT_WALL.length; i++) {
    const column = i % 2;
    const row = Math.floor(i / 2);
    const key = RIGHT_WALL[i];
    const compact = /Bayonet|Bipod|Scope|Tripod/.test(key);
    const root = mountModel({ assets, scene, place }, key,
      [2.01, .65 + row * .69, .84 - column * 1.68],
      [0, Math.PI / 2, 0], compact ? .25 : .17);
    if (root) displayWeapons.push(root);
  }

  // The first model is also the weapon issued to the player. It remains a
  // genuine rack object until collected, instead of teleporting into their
  // hands merely because the room door opened.
  const primaryDisplay = displayWeapons.find((root) =>
    root.userData.armoryWeapon === 'armoryAssault01');
  let issued = false;
  if (primaryDisplay) {
    addInteraction(primaryDisplay, 'ISSUE SERVICE RIFLE', 'bunker', () => {
      if (!open) return;
      issued = true;
      primaryDisplay.visible = false;
      window.dispatchEvent(new CustomEvent('lostsignal:takegun'));
    });
  }

  // The supplied animated Adventurer becomes a named, solid quartermaster in
  // the room. Their neutral idle and one-shot wave use the authored skeleton,
  // so this is a character rather than a static shop mannequin.
  let quartermaster = null;
  let mixer = null;
  let idleAction = null;
  let waveAction = null;
  if (assets.adventurer) {
    quartermaster = cloneGLTF(assets.adventurer);
    quartermaster.name = 'Quartermaster_Adventurer';
    quartermaster.position.copy(ARMORY_ORIGIN).add(new THREE.Vector3(1.17, .01, 1.43));
    quartermaster.rotation.y = 0;
    quartermaster.userData.kind = 'quartermaster';
    scene.add(quartermaster);
    mixer = new THREE.AnimationMixer(quartermaster);
    const idleClip = clipBySuffix(assets.adventurer, '|Idle_Neutral', '|Idle');
    const waveClip = clipBySuffix(assets.adventurer, '|Wave', '|Interact');
    if (idleClip) {
      idleAction = mixer.clipAction(idleClip);
      idleAction.play();
    }
    if (waveClip) {
      waveAction = mixer.clipAction(waveClip);
      waveAction.setLoop(THREE.LoopOnce, 1);
      waveAction.clampWhenFinished = true;
      waveAction.enabled = true;
      mixer.addEventListener('finished', (event) => {
        if (event.action !== waveAction || !idleAction) return;
        waveAction.fadeOut(.18);
        idleAction.reset().fadeIn(.18).play();
      });
    }
    colliders.addOrientedBox({
      cx: quartermaster.position.x, cz: quartermaster.position.z,
      halfX: .34, halfZ: .34, minY: 0, maxY: 1.84,
    });
    addInteraction(quartermaster, 'QUARTERMASTER ELI', 'bunker', () => {
      if (waveAction) {
        idleAction?.fadeOut(.12);
        waveAction.reset().fadeIn(.12).play();
      }
      window.dispatchEvent(new CustomEvent('lostsignal:quartermaster', {
        detail: { line: open
          ? 'Everything on the wall is inventoried. Take the service rifle; the rest stays in the shelter.'
          : 'Use the access panel. Once that door clears its pocket, the whole armoury is yours to inspect.' },
      }));
    });
  }

  const lights = [];
  for (const z of [-.76, .76]) {
    const light = new THREE.PointLight(0xdaf4df, 12, 7.2, 2.0);
    light.position.copy(ARMORY_ORIGIN).add(new THREE.Vector3(0, 2.84, z));
    scene.add(light);
    lights.push(light);
  }

  function update(dt) {
    const target = open ? -1.84 : 0;
    doorOffset = THREE.MathUtils.damp(doorOffset, target, 7.2, dt);
    for (const entry of doorParts) entry.part.position.x = entry.closedX + doorOffset;
    mixer?.update(dt);
  }

  function setArmed(value) {
    issued = issued || !!value;
    if (primaryDisplay) primaryDisplay.visible = !issued;
  }

  return {
    shell, displayWeapons, primaryDisplay, quartermaster, lights,
    weaponAsset: assets.armoryAssault01,
    animationCount: assets.adventurer?.animations?.length ?? 0,
    staticColliderCount,
    doorCollider,
    setArmed, update,
    isOpen: () => open,
    isIssued: () => issued,
    open: () => { if (!open) toggleDoor(); },
  };
}

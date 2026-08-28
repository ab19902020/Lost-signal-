import * as THREE from 'three';
import { cloneGLTF, findNamed } from './assets.js';
import { WEAPONS, isUsable } from './weapons.js';

// The bunker starts as one 13 m room. This occupies its former loose-crate
// corner as a 4.6 x 4.1 m walk-in shop, leaving the hatch and all circulation
// routes clear.
export const ARMORY_ORIGIN = new THREE.Vector3(3.80, 0, 2.60);

// Three columns of long guns across the back rack, handguns and blades down
// the left, precision rifles and bench kit down the right. The back wall went
// from two columns to three and the side walls from four rows to five when the
// FPS pack added a rifle, a pump gun, a sidearm and a knife: the racks are
// 4.1 m by 2.6 m of pegboard and were only ever half used.
const BACK_WALL = [
  'armoryAssault01', 'armoryAssault02', 'armoryAssault03',
  'armoryBullpup', 'armoryAkm', 'armoryShotgunSawed',
  'armoryShotgunShort', 'armoryShotgun01', 'armoryShotgun02',
  'armoryMossberg', 'armorySniper01', 'armorySniper02',
];

const LEFT_WALL = [
  'armoryPistol01', 'armoryPistol02', 'armoryPistol03', 'armoryPistol04',
  'armoryGlock', 'armoryRevolver01', 'armoryRevolver02', 'armoryRevolver03',
  'armoryBayonet', 'armoryCombatKnife',
];

// The pegboard is 2.6 m tall, so the row pitch on each wall is whatever fits
// its own column count underneath that: five rows down the left at half a
// metre, four down the right and across the back at a little more.
const RIGHT_WALL = [
  'armorySniper03', 'armorySniper04',
  'armorySmg01', 'armorySmg02',
  'armoryBipod', 'armoryScope', 'armoryTripod',
];

export const ARMORY_WEAPON_KEYS = [...BACK_WALL, ...LEFT_WALL, ...RIGHT_WALL];

// How long each thing reads on the wall, in metres. Measured and fitted rather
// than scaled by a factor, so swapping the models out again cannot silently
// shrink the whole armoury to nothing.
function displayLength(key) {
  if (/Bipod|Scope|Tripod/.test(key)) return .24;
  if (/Bayonet|CombatKnife/.test(key)) return .33;
  if (/Pistol|Glock/.test(key)) return .30;
  if (/Revolver/.test(key)) return .34;
  if (/Smg/.test(key)) return .62;
  if (/ShotgunSawed/.test(key)) return .58;
  if (/Sniper/.test(key)) return 1.04;
  return .92;
}

const _box = new THREE.Box3();
const _centre = new THREE.Vector3();
const _target = new THREE.Vector3();
const _size = new THREE.Vector3();

// Raycasting a high-detail skinned mesh changes with its current animation and
// proved unreliable for Eli at conversational range. These invisible body
// volumes make hits deterministic without adding any visible geometry or an
// expensive per-pellet skin traversal.
const QUARTERMASTER_HIT_MATERIAL = new THREE.MeshBasicMaterial({ visible: false });
const QUARTERMASTER_HIT_PARTS = Object.freeze([
  ['Quartermaster_Hit_Head', new THREE.SphereGeometry(.24, 8, 6), [0, 1.59, 0]],
  ['Quartermaster_Hit_Torso', new THREE.BoxGeometry(.60, .82, .40), [0, 1.12, 0]],
  ['Quartermaster_Hit_Hips', new THREE.BoxGeometry(.52, .52, .36), [0, .62, 0]],
]);

function addQuartermasterHitVolumes(root) {
  const volumes = QUARTERMASTER_HIT_PARTS.map(([name, geometry, position]) => {
    const volume = new THREE.Mesh(geometry, QUARTERMASTER_HIT_MATERIAL);
    volume.name = name;
    volume.position.set(...position);
    volume.userData.hitProxy = true;
    volume.castShadow = false;
    volume.receiveShadow = false;
    root.add(volume);
    return volume;
  });
  root.userData.hitVolumes = volumes;
  return volumes;
}

function mountModel({ assets, scene, place }, key, position, rotation, length) {
  const gltf = assets[key];
  if (!gltf) return null;
  // Place at the origin first, then move the actual geometry centre onto the
  // rack point. Every weapon is authored muzzle-forward down +Z with +Y up, so
  // a rack turns the length along its own wall: the back wall wants a quarter
  // turn, the side walls leave the length on Z and only choose which way the
  // muzzles point.
  const root = place(gltf, scene, [0, 0, 0], rotation, 1, {
    world: 'bunker', collide: false,
  });
  root.name = `Armory_Display_${key}`;
  // Fit to a real length on the rack, measured, rather than to a hand-typed
  // scale factor. The factors that suited the pack models put the built ones
  // on the wall at eight centimetres, which is how an armoury holding
  // twenty-six weapons came to look like an empty room.
  root.updateWorldMatrix(true, true);
  _box.setFromObject(root).getSize(_size);
  const longest = Math.max(_size.x, _size.y, _size.z);
  if (longest > 1e-4) root.scale.setScalar(length / longest);
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
    const column = i % 3;
    const row = Math.floor(i / 3);
    const key = BACK_WALL[i];
    const root = mountModel({ assets, scene, place }, key,
      [-1.44 + column * 1.44, .58 + row * .55, 1.75],
      [0, -Math.PI / 2, 0], displayLength(key));
    if (root) displayWeapons.push(root);
  }

  for (let i = 0; i < LEFT_WALL.length; i++) {
    const column = i % 2;
    const row = Math.floor(i / 2);
    const key = LEFT_WALL[i];
    const root = mountModel({ assets, scene, place }, key,
      [-2.01, .50 + row * .50, -.84 + column * 1.68],
      [0, 0, 0], displayLength(key));
    if (root) displayWeapons.push(root);
  }

  for (let i = 0; i < RIGHT_WALL.length; i++) {
    const column = i % 2;
    const row = Math.floor(i / 2);
    const key = RIGHT_WALL[i];
    const root = mountModel({ assets, scene, place }, key,
      [2.01, .62 + row * .55, .84 - column * 1.68],
      [0, Math.PI, 0], displayLength(key));
    if (root) displayWeapons.push(root);
  }

  // Every rack slot is a real pickup. The room used to hold twenty-five models
  // and hand out exactly one of them, which made the other twenty-four scenery
  // in a room the player is explicitly invited to walk into and inspect. Each
  // stays a genuine rack object until collected, instead of teleporting into
  // their hands merely because the room door opened.
  const displayByKey = new Map();
  for (const root of displayWeapons) displayByKey.set(root.userData.armoryWeapon, root);
  const primaryDisplay = displayByKey.get('armoryAssault01') || null;
  let equipped = null;

  for (const root of displayWeapons) {
    const key = root.userData.armoryWeapon;
    const weapon = WEAPONS[key];
    const label = weapon?.name || 'WEAPON';
    if (!isUsable(key)) {
      // Optics and mounts are bench hardware. Reading the plate is the whole
      // interaction: nobody should end up carrying a tripod into the silo.
      addInteraction(root, `INSPECT ${label}`, 'bunker', () => {
        window.dispatchEvent(new CustomEvent('lostsignal:inspectkit', { detail: { key, name: label } }));
      });
      continue;
    }
    addInteraction(root, `TAKE ${label}`, 'bunker', () => {
      if (!open) {
        window.dispatchEvent(new CustomEvent('lostsignal:rackedlocked', { detail: { key, name: label } }));
        return;
      }
      window.dispatchEvent(new CustomEvent('lostsignal:takegun', { detail: { key, name: label } }));
    });
  }

  // The supplied animated Adventurer becomes a named, solid quartermaster in
  // the room. Their neutral idle and one-shot wave use the authored skeleton,
  // so this is a character rather than a static shop mannequin.
  let quartermaster = null;
  let mixer = null;
  let idleAction = null;
  let waveAction = null;
  let quartermasterCollider = null;
  // Eli is the only person in the shelter, and a round that reaches them has
  // to do what a round does. The authored skeleton has no death clip, so the
  // mixer stops and the whole figure topples on its own timer.
  let qmFall = 0;
  let qmDirection = 1;
  if (assets.adventurer) {
    quartermaster = cloneGLTF(assets.adventurer);
    quartermaster.name = 'Quartermaster_Adventurer';
    quartermaster.position.copy(ARMORY_ORIGIN).add(new THREE.Vector3(1.17, .01, 1.43));
    // Quaternius characters face local +Z (the backpack sits on -Z). The
    // armoury entrance is toward -Z, so turn Eli around to greet the player
    // instead of presenting the backpack at conversation distance.
    quartermaster.rotation.y = Math.PI;
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
    quartermasterCollider = colliders.addOrientedBox({
      cx: quartermaster.position.x, cz: quartermaster.position.z,
      halfX: .34, halfZ: .34, minY: 0, maxY: 1.84,
    });
    quartermaster.userData.kind = 'quartermaster';
    quartermaster.userData.alive = true;
    addQuartermasterHitVolumes(quartermaster);
    addInteraction(quartermaster, 'QUARTERMASTER ELI', 'bunker', () => {
      if (quartermaster.userData.alive === false) return;
      if (waveAction) {
        idleAction?.fadeOut(.12);
        waveAction.reset().fadeIn(.12).play();
      }
      window.dispatchEvent(new CustomEvent('lostsignal:quartermaster', {
        detail: { line: open
          ? 'Everything on the wall is inventoried and everything on it works. Take whatever you can carry — one at a time, and put the last one back on its hook.'
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

  function downQuartermaster() {
    if (!quartermaster || quartermaster.userData.alive === false) return false;
    quartermaster.userData.alive = false;
    qmDirection = Math.random() < .5 ? -1 : 1;
    idleAction?.stop();
    waveAction?.stop();
    if (quartermasterCollider) quartermasterCollider.enabled = false;
    return true;
  }

  function update(dt) {
    const target = open ? -1.84 : 0;
    doorOffset = THREE.MathUtils.damp(doorOffset, target, 7.2, dt);
    for (const entry of doorParts) entry.part.position.x = entry.closedX + doorOffset;
    if (quartermaster && quartermaster.userData.alive === false) {
      if (qmFall < 1) {
        qmFall = Math.min(1, qmFall + dt * 2.1);
        const eased = qmFall * qmFall * (3 - 2 * qmFall);
        quartermaster.rotation.z = eased * (Math.PI / 2) * qmDirection;
        quartermaster.position.y = .01 - eased * .28;
      }
      return;
    }
    mixer?.update(dt);
  }

  // The racks a weapon came off are empty while the player is carrying it, and
  // fill back up the moment they put it down. One slot, one model: the
  // collection on the walls always matches what is not on the player.
  function setEquipped(keys) {
    const carried = new Set(Array.isArray(keys) ? keys : (keys ? [keys] : []));
    equipped = carried.size ? [...carried][carried.size - 1] : null;
    for (const [slot, root] of displayByKey) root.visible = !carried.has(slot);
  }

  return {
    shell, displayWeapons, displayByKey, primaryDisplay, quartermaster, lights,
    weaponAsset: assets.armoryAssault01,
    animationCount: assets.adventurer?.animations?.length ?? 0,
    staticColliderCount,
    doorCollider,
    setEquipped, update, downQuartermaster,
    quartermasterAlive: () => quartermaster ? quartermaster.userData.alive !== false : false,
    isOpen: () => open,
    equippedKey: () => equipped,
    isIssued: () => equipped !== null,
    open: () => { if (!open) toggleDoor(); },
  };
}

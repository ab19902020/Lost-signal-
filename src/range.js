import * as THREE from 'three';
import { findNamed } from './assets.js';

// The compound's shooting range.
//
// The armoury issues twenty-six weapons and the surface had nothing to point
// any of them at. This is a firing line on the west side of the yard and a bank
// of falling-plate targets downrange: hit one and it swings back on its pivot
// and stays down; the control at the line stands them all up again. It exists
// so a player can take a weapon out of the shop and find out what it does.

const LANES = 6;
// The range runs down the west side of the compound, from a firing line near
// the gate end to plates out by the north wall. Nothing else is placed in this
// corridor: a shooting lane with a shipping container parked across it is not
// a shooting lane.
const LINE_Z = 12.0;         // where the shooter stands
const NEAR_Z = 2.0;          // the closest plate
const FIRST_X = -17.4;

export function createRange({ scene, colliders, assets, place, addInteraction }) {
  if (!assets.rangeTarget) return null;

  const targets = [];
  for (let lane = 0; lane < LANES; lane++) {
    // Staggered depth: six plates in a row is one distance, not a range.
    const z = NEAR_Z - lane * 3.1;
    const x = FIRST_X + (lane % 2) * 1.5;
    const root = place(assets.rangeTarget, scene, [x, 0, z], [0, Math.PI, 0], 1,
      { collide: false });
    root.name = `Range_Target_${lane}`;
    const pivot = findNamed(root, 'Target_Pivot');
    const plate = findNamed(root, 'Target_Plate');
    // The frame is solid; the plate is not, so a round that knocks it down is
    // not also stopped by a wall where the plate used to be.
    const stand = colliders.addOrientedBox({
      cx: x, cz: z, halfX: 0.56, halfZ: 0.42, minY: 0, maxY: 1.42,
    });
    const target = {
      lane, root, pivot, plate, stand,
      x, z,
      distance: +Math.hypot(x - FIRST_X, z - LINE_Z).toFixed(1),
      down: false,
      fall: 0,
    };
    // The face is a plate, a painted ring and a bull, all hanging off the
    // pivot. A round can land on any of them, so mark the whole moving
    // assembly rather than just the backing plate.
    (pivot || plate)?.traverse((part) => { part.userData.rangeTarget = target; });
    targets.push(target);
  }

  let hits = 0;
  let shots = 0;

  /** Knock a plate down. Returns false if it was already down. */
  function strike(target) {
    if (!target || target.down) return false;
    target.down = true;
    hits++;
    window.dispatchEvent(new CustomEvent('lostsignal:rangehit', {
      detail: { lane: target.lane, distance: target.distance, hits, standing: standing() },
    }));
    return true;
  }

  /** The target a hit object belongs to, if any. */
  function targetFor(object) {
    let node = object;
    while (node && !node.userData.rangeTarget) node = node.parent;
    return node?.userData.rangeTarget || null;
  }

  const standing = () => targets.filter((target) => !target.down).length;

  function reset() {
    for (const target of targets) target.down = false;
    window.dispatchEvent(new CustomEvent('lostsignal:rangereset', {
      detail: { hits, shots, standing: targets.length },
    }));
    hits = 0;
    shots = 0;
  }

  // The control and the bench stand beside the lane, not in it. Parked on the
  // firing point itself they filled the whole screen the moment the player
  // stepped up to shoot.
  const console_ = assets.accessControl ? place(assets.accessControl, scene,
    [FIRST_X + 3.2, 0.55, LINE_Z + 0.4], [0, -Math.PI / 2, 0], 0.64, { collide: false }) : null;
  if (console_) {
    console_.name = 'Range_Control';
    addInteraction(console_, 'RANGE CONTROL — RESET TARGETS', 'outside', reset);
  }
  if (assets.bench) {
    place(assets.bench, scene, [FIRST_X + 3.0, 0, LINE_Z + 1.9], [0, -Math.PI / 2, 0], 1, {});
  }
  const lamp = new THREE.SpotLight(0xdce9f0, 5.5, 42, 0.72, 0.5, 1.5);
  lamp.position.set(FIRST_X + 0.4, 5.4, LINE_Z + 1.2);
  lamp.target.position.set(FIRST_X + 0.4, 0, NEAR_Z - 7);
  scene.add(lamp, lamp.target);

  function update(dt) {
    for (const target of targets) {
      if (!target.pivot) continue;
      const want = target.down ? 1 : 0;
      if (Math.abs(target.fall - want) < 0.002) continue;
      target.fall = THREE.MathUtils.damp(target.fall, want, target.down ? 14 : 6, dt);
      // Back and over: a plate that is hit folds away from the shooter.
      target.pivot.rotation.x = target.fall * (Math.PI / 2) * 0.94;
    }
  }

  return {
    lamp,
    targets, update, reset, strike, targetFor,
    firingLine: new THREE.Vector3(FIRST_X + 0.4, 0, LINE_Z),
    standing,
    score: () => ({ hits, shots, standing: standing(), lanes: targets.length }),
    countShot: () => { shots++; },
  };
}

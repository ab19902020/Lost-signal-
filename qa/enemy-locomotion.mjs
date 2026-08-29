// Do the two attackers' feet match the ground they are covering?
//
// Their locomotion rate came from a reading of the Hip track that was wrong
// twice over: it compared the first key against the last, which on a clean
// walk cycle is nearly zero because the cycle returns to where it started, and
// it compared the x and y components - sideways and vertical - rather than the
// ground plane the man is crossing. Every clip therefore came back as walking
// at almost no speed at all, every rate slammed into the top of the clamp, and
// both men ran with their feet skating under them.
//
// This measures the same thing a viewer sees: with the body moving at the
// speed the brain asked for, how far does the planted foot slide across the
// ground it is supposed to be pushing against?
import assert from 'assert';
import { readFile } from 'fs/promises';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { ColliderSet } from '../src/physics.js';
import { createTownEnemies } from '../src/town_enemies.js';

globalThis.self = globalThis;
globalThis.createImageBitmap = async () => ({ width: 1, height: 1, close() {} });
await MeshoptDecoder.ready;
const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);
const loadGLB = async (relative) => {
  const bytes = await readFile(new URL(relative, import.meta.url));
  const data = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  return new Promise((resolve, reject) => loader.parse(data, '', resolve, reject));
};
const assets = {
  enemyOldManBlack: await loadGLB('../public/assets/supplied/enemy_old_man_black.glb'),
  enemyOldManRed: await loadGLB('../public/assets/supplied/enemy_old_man_red.glb'),
};

const scene = new THREE.Scene();
const enemies = createTownEnemies({
  scene, colliders: new ColliderSet(), assets,
  entries: [
    { asset: 'enemyOldManBlack', style: 'black', name: 'Black',
      position: [0, 0, 0], heading: 0, patrol: [[0, 0]], cover: [] },
    { asset: 'enemyOldManRed', style: 'red', name: 'Red',
      position: [4, 0, 0], heading: 0, patrol: [[4, 0]], cover: [] },
  ],
});

// The speeds the siege actually asks for: a patrol walk, and the run they
// close the last stretch of the yard at.
const CASES = [['walk', 0.72], ['run', 3.05]];
const _point = new THREE.Vector3();
const rows = [];

for (const agent of enemies.agents) {
  for (const [clip, speed] of CASES) {
    if (!agent.clips[clip]) continue;
    // Face -Z, which is forward for an agent, and walk him at `speed`.
    agent.root.position.set(0, 0, 0);
    agent.root.rotation.y = 0;
    // Start from nothing playing. A previous case left at weight zero is still
    // an action the mixer is blending, and measuring a cycle against a ghost of
    // the last one measures neither.
    for (const action of Object.values(agent.actions)) action.stop();
    agent.current = null;
    agent.currentAction = null;
    agent.playTravel(clip, speed, 1, 0);
    // Let the crossfade finish before measuring, or the first tenth of a
    // second is a blend and not the cycle.
    for (let frame = 0; frame < 30; frame++) agent.mixer.update(1 / 60);

    // Walk him for four seconds and record where his feet were.
    const dt = 1 / 60;
    const track = [];
    for (let frame = 0; frame < 240; frame++) {
      agent.root.position.z -= speed * dt;
      agent.mixer.update(dt);
      agent.root.updateMatrixWorld(true);
      const left = agent.model.getObjectByName('L_Foot').getWorldPosition(_point.clone());
      const right = agent.model.getObjectByName('R_Foot').getWorldPosition(new THREE.Vector3());
      const side = left.y <= right.y ? 'L' : 'R';
      track.push({ side, foot: side === 'L' ? left : right });
    }
    // Which foot is down cannot be told from a single frame: a run has a
    // flight phase where neither of them is, and calling the lower of two
    // airborne feet "planted" counts the whole swing as skating.
    const ground = Math.min(...track.map((entry) => entry.foot.y));
    // Net drift across each contact, not the length of the path the foot took
    // during it. Both uploads have a little jitter in the contact phase, and
    // summing every wobble reads a clean plant as a skid: what a viewer sees
    // is the anchor point moving from where it landed to where it left.
    const drifts = [];
    let contact = null;
    for (const entry of track) {
      const down = entry.foot.y < ground + 0.06;
      if (down && contact && entry.side === contact.side) {
        contact.end = entry.foot;
        contact.frames++;
      } else {
        if (contact && contact.frames > 4) {
          drifts.push(Math.hypot(contact.end.x - contact.start.x,
            contact.end.z - contact.start.z) / (contact.frames * dt));
        }
        contact = down ? { side: entry.side, start: entry.foot, end: entry.foot, frames: 1 } : null;
      }
    }
    if (contact && contact.frames > 4) {
      drifts.push(Math.hypot(contact.end.x - contact.start.x,
        contact.end.z - contact.start.z) / (contact.frames * dt));
    }
    const rate = drifts.length
      ? drifts.reduce((sum, value) => sum + value, 0) / drifts.length : 0;
    const planted = drifts.length;

    rows.push({ name: agent.root.name, clip, speed,
      authored: +agent.travelSpeeds[clip].toFixed(2), slip: +rate.toFixed(2),
      contacts: planted,
      timeScale: +agent.currentAction.getEffectiveTimeScale().toFixed(2) });
  }
}

for (const row of rows) {
  console.log(`  ${row.name.padEnd(6)} ${row.clip.padEnd(5)} at ${row.speed} m/s  `
    + `authored ${row.authored} m/s  foot slip ${row.slip} m/s  `
    + `(${row.contacts} contacts, rate ${row.timeScale})`);
}

for (const row of rows) {
  // A clip that measured as walking on the spot is the bug this replaced.
  assert.ok(row.authored > 0.3 && row.authored < 4.0,
    `${row.name}'s ${row.clip} is authored at ${row.authored} m/s, which is not a stride`);
  assert.ok(row.slip < (row.clip === 'walk' ? 0.15 : 0.55),
    `${row.name}'s feet skate ${row.slip} m/s under him at ${row.speed} m/s ${row.clip}`);
}
// The run has to be reachable inside the rate clamp, or the fix is cosmetic:
// a clip clamped at its limit slips however good the measurement was.
for (const row of rows.filter((entry) => entry.clip === 'run')) {
  assert.ok(row.speed / row.authored < 2.25,
    `${row.name} has to play his run at ${(row.speed / row.authored).toFixed(2)}x, `
    + 'which the clamp will not allow, so his feet cannot keep up');
}
console.log('Enemy locomotion QA passed: both men are authored at a real stride and '
  + 'their feet stay planted at the speeds the siege runs them at.');

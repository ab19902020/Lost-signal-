import { readFile } from 'node:fs/promises';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
globalThis.self = globalThis;
globalThis.createImageBitmap = async () => ({ width: 1, height: 1, close() {} });
await MeshoptDecoder.ready;
const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
const bytes = await readFile(process.argv[2]);
const gltf = await new Promise((ok, no) => loader.parse(
  bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '', ok, no));
gltf.scene.updateMatrixWorld(true);
const pts = [];
gltf.scene.traverse((o) => {
  if (!o.isMesh) return;
  const p = o.geometry.attributes.position; const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld); pts.push(v.clone()); }
});
const box = new THREE.Box3().setFromPoints(pts);
const size = box.getSize(new THREE.Vector3());
console.log('verts', pts.length, 'box', size.toArray().map(v=>v.toFixed(3)).join(' x '));
// Slice along each axis: how wide and how tall is the section at each station?
// Fine stations across the last fifth at each end of X, looking for a thin
// disc standing perpendicular to the fuselage - which is what a propeller is.
for (const [label, lo, hi] of [['nose-end +X', box.max.x - 0.20, box.max.x],
                               ['tail-end -X', box.min.x, box.min.x + 0.20]]) {
  console.log('--- ' + label + ' ---');
  const N = 20;
  for (let i = 0; i < N; i++) {
    const a = lo + (hi - lo) * (i / N), b = lo + (hi - lo) * ((i + 1) / N);
    const slice = pts.filter((p) => p.x >= a && p.x < b);
    if (!slice.length) { console.log(`  x ${a.toFixed(3)} empty`); continue; }
    const zs = slice.map(p=>p.z), ys = slice.map(p=>p.y);
    const cz = (Math.max(...zs)+Math.min(...zs))/2, cy = (Math.max(...ys)+Math.min(...ys))/2;
    const rad = Math.max(...slice.map(p=>Math.hypot(p.z-cz, p.y-cy)));
    console.log(`  x ${a.toFixed(3)}  zspan ${(Math.max(...zs)-Math.min(...zs)).toFixed(3)}`
      + `  yspan ${(Math.max(...ys)-Math.min(...ys)).toFixed(3)}  radius ${rad.toFixed(3)}  n ${slice.length}`);
  }
}
for (const axis of ['x','z']) {
  const other = axis === 'x' ? 'z' : 'x';
  const lo = box.min[axis], hi = box.max[axis];
  console.log(`--- stations along ${axis} (span ${other} / height y) ---`);
  const N = 14;
  for (let i = 0; i < N; i++) {
    const a = lo + (hi - lo) * (i / N), b = lo + (hi - lo) * ((i + 1) / N);
    const slice = pts.filter((p) => p[axis] >= a && p[axis] < b);
    if (!slice.length) { console.log(`  ${(i/N).toFixed(2)} empty`); continue; }
    const w = Math.max(...slice.map(p=>p[other])) - Math.min(...slice.map(p=>p[other]));
    const h = Math.max(...slice.map(p=>p.y)) - Math.min(...slice.map(p=>p.y));
    const top = Math.max(...slice.map(p=>p.y));
    console.log(`  ${(i/N).toFixed(2)}  span ${w.toFixed(3)}  height ${h.toFixed(3)}  top ${top.toFixed(3)}  n ${slice.length}`);
  }
}

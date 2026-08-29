// Measure every asset GLB at scale 1, so "how big is this thing in metres"
// stops being a guess.
import { readFile, readdir } from 'node:fs/promises';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
globalThis.self = globalThis;
globalThis.createImageBitmap = async () => ({ width: 1, height: 1, close() {} });
await MeshoptDecoder.ready;
const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);
const dirs = process.argv.slice(2);
const rows = [];
for (const dir of dirs) {
  for (const name of await readdir(dir)) {
    if (!name.endsWith('.glb')) continue;
    const bytes = await readFile(`${dir}/${name}`);
    const data = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    let gltf;
    try { gltf = await new Promise((ok, no) => loader.parse(data, '', ok, no)); }
    catch (e) { rows.push({ name, error: String(e).slice(0, 60) }); continue; }
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const size = box.getSize(new THREE.Vector3());
    rows.push({ file: `${dir.split('/').pop()}/${name}`,
      w: +size.x.toFixed(2), h: +size.y.toFixed(2), d: +size.z.toFixed(2) });
  }
}
rows.sort((a, b) => (b.h || 0) - (a.h || 0));
for (const r of rows) console.log(r.error ? `${r.file || r.name}  ERROR ${r.error}`
  : `${String(r.h).padStart(8)} m tall  ${String(r.w).padStart(8)} x ${String(r.d).padStart(8)}   ${r.file}`);

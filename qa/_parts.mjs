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
const scale = Number(process.argv[3] || 1);
gltf.scene.traverse((part) => {
  if (!part.isMesh && !part.isSkinnedMesh) return;
  const b = new THREE.Box3().setFromObject(part);
  const s = b.getSize(new THREE.Vector3());
  console.log(`${part.name.padEnd(30)} y ${(b.min.y*scale).toFixed(2).padStart(6)}..${(b.max.y*scale).toFixed(2).padStart(6)}   ${(s.x*scale).toFixed(2)} x ${(s.y*scale).toFixed(2)} x ${(s.z*scale).toFixed(2)}`);
});

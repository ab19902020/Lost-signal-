import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// The mobile floor-flash regression lives in authored geometry, not runtime
// JavaScript: eighteen deck boxes were enlarged until their top faces
// overlapped. Audit the generated GLB itself so rebuilding the assets can never
// silently reintroduce coplanar gallery surfaces.
const path = process.argv[2] || new URL('../public/assets/blender/hab_level_v4.glb', import.meta.url);
const file = await readFile(path);

assert.equal(file.readUInt32LE(0), 0x46546c67, 'hab level is not a GLB');
assert.equal(file.readUInt32LE(4), 2, 'hab level is not glTF 2.0');
assert.equal(file.readUInt32LE(8), file.length, 'hab level GLB length is corrupt');

let offset = 12;
let document;
let binary;
while (offset < file.length) {
  const length = file.readUInt32LE(offset);
  const type = file.readUInt32LE(offset + 4);
  const data = file.subarray(offset + 8, offset + 8 + length);
  if (type === 0x4e4f534a) document = JSON.parse(data.toString('utf8').trimEnd());
  if (type === 0x004e4942) binary = data;
  offset += 8 + length;
}
assert.ok(document && binary, 'hab level GLB is missing JSON or binary data');

const material = document.materials?.findIndex(({ name = '' }) => name === 'HabDeck');
assert.ok(material >= 0, 'hab level has no HabDeck material');

const component = {
  5120: { size: 1, get: 'getInt8' },
  5121: { size: 1, get: 'getUint8' },
  5122: { size: 2, get: 'getInt16' },
  5123: { size: 2, get: 'getUint16' },
  5125: { size: 4, get: 'getUint32' },
  5126: { size: 4, get: 'getFloat32' },
};
const width = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };

function accessorValues(index) {
  const accessor = document.accessors[index];
  assert.ok(accessor && !accessor.sparse, `unsupported accessor ${index}`);
  const view = document.bufferViews[accessor.bufferView];
  const format = component[accessor.componentType];
  const elements = width[accessor.type];
  assert.ok(view && format && elements, `unsupported accessor format ${index}`);
  const stride = view.byteStride || format.size * elements;
  const start = (view.byteOffset || 0) + (accessor.byteOffset || 0);
  const values = new Array(accessor.count);
  const data = new DataView(binary.buffer, binary.byteOffset, binary.byteLength);
  for (let i = 0; i < accessor.count; i++) {
    const row = new Array(elements);
    for (let j = 0; j < elements; j++) {
      const at = start + i * stride + j * format.size;
      row[j] = data[format.get](at, true);
    }
    values[i] = elements === 1 ? row[0] : row;
  }
  return values;
}

const subtract = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const magnitude = (v) => Math.hypot(v[0], v[1], v[2]);

let upwardArea = 0;
let upwardTriangles = 0;
for (const mesh of document.meshes || []) {
  for (const primitive of mesh.primitives || []) {
    if (primitive.material !== material) continue;
    assert.equal(primitive.mode ?? 4, 4, 'HabDeck is not a triangle mesh');
    const positions = accessorValues(primitive.attributes.POSITION);
    const indices = primitive.indices == null
      ? positions.map((_, index) => index)
      : accessorValues(primitive.indices);
    assert.equal(indices.length % 3, 0, 'HabDeck triangle index count is invalid');
    for (let i = 0; i < indices.length; i += 3) {
      const a = positions[indices[i]];
      const b = positions[indices[i + 1]];
      const c = positions[indices[i + 2]];
      const normal = cross(subtract(b, a), subtract(c, a));
      const twiceArea = magnitude(normal);
      if (!twiceArea || normal[1] / twiceArea < 0.985) continue;
      const meanY = (a[1] + b[1] + c[1]) / 3;
      if (meanY < -0.025) continue;
      upwardArea += twiceArea / 2;
      upwardTriangles++;
    }
  }
}

const expectedArea = Math.PI * (19.6 ** 2 - 13.0 ** 2);
const ratio = upwardArea / expectedArea;
assert.ok(upwardTriangles >= 72,
  `gallery deck has too few upward triangles (${upwardTriangles})`);
assert.ok(ratio >= 0.96 && ratio <= 1.025,
  `gallery deck top area is ${(ratio * 100).toFixed(2)}% of one annulus; ` +
  'coplanar floor overlap is likely');

console.log(`GLB floor QA passed: ${upwardTriangles} upward triangles, ` +
  `${upwardArea.toFixed(2)} m² (${(ratio * 100).toFixed(2)}% of one annulus).`);

import assert from 'node:assert/strict';
import fs from 'node:fs';

const ASSETS = [
  ['male', 'public/assets/characters/resident_male_high_v1.glb', 45000],
  ['female', 'public/assets/characters/resident_female_high_v1.glb', 43000],
];

function readGLB(path) {
  const bytes = fs.readFileSync(path);
  assert.equal(bytes.toString('ascii', 0, 4), 'glTF', `${path} is not a binary glTF`);
  let offset = 12;
  while (offset < bytes.length) {
    const length = bytes.readUInt32LE(offset);
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    if (type === 'JSON') {
      return {
        bytes: bytes.length,
        json: JSON.parse(bytes.toString('utf8', offset + 8, offset + 8 + length)
          .replace(/\0+$/u, '')),
      };
    }
    offset += 8 + length;
  }
  throw new Error(`${path} has no JSON chunk`);
}

for (const [label, path, floor] of ASSETS) {
  const { json, bytes } = readGLB(path);
  let triangles = 0;
  let vertices = 0;
  let skinnedPrimitives = 0;
  const morphNames = new Set();

  for (const mesh of json.meshes || []) {
    for (const name of mesh.extras?.targetNames || []) morphNames.add(name);
    for (const primitive of mesh.primitives || []) {
      assert.ok(primitive.indices !== undefined, `${label} contains an unindexed primitive`);
      assert.ok(primitive.attributes?.POSITION !== undefined,
        `${label} contains a primitive without positions`);
      triangles += Math.floor(json.accessors[primitive.indices].count / 3);
      vertices += json.accessors[primitive.attributes.POSITION].count;
      if (primitive.attributes.JOINTS_0 !== undefined
        && primitive.attributes.WEIGHTS_0 !== undefined) skinnedPrimitives++;
    }
  }

  const animations = new Set((json.animations || []).map((animation) => animation.name));
  const joints = Math.max(0, ...(json.skins || []).map((skin) => skin.joints?.length || 0));
  assert.ok(triangles >= floor,
    `${label} human has ${triangles.toLocaleString()} triangles; expected at least ${floor.toLocaleString()}`);
  assert.ok(vertices >= 23000, `${label} human has only ${vertices.toLocaleString()} vertices`);
  assert.ok(skinnedPrimitives >= 8, `${label} human has only ${skinnedPrimitives} skinned primitives`);
  assert.ok(joints >= 53, `${label} human has only ${joints} deform bones`);
  for (const target of ['Athletic', 'Lean', 'Heavy']) {
    assert.ok(morphNames.has(target), `${label} human is missing the ${target} body morph`);
  }
  for (const clip of ['Idle', 'Walk', 'Wave']) {
    assert.ok(animations.has(clip), `${label} human is missing the ${clip} animation`);
  }
  assert.ok((json.images || []).length >= 9,
    `${label} human has only ${(json.images || []).length} embedded material maps`);
  assert.ok(bytes > 4_000_000, `${label} human asset is unexpectedly small (${bytes} bytes)`);
  console.log(`HUMAN ${label}: ${triangles.toLocaleString()} tris, ${vertices.toLocaleString()} vertices, ${joints} bones`);
}

const assetsSource = fs.readFileSync('src/assets.js', 'utf8');
assert.match(assetsSource, /resident_male_high_v1\.glb/u);
assert.match(assetsSource, /resident_female_high_v1\.glb/u);
assert.doesNotMatch(assetsSource, /resident_[a-f]_v6\.glb/u,
  'runtime still references a low-detail resident mesh');
assert.doesNotMatch(assetsSource, /assets\/supplied\/(adventurer|soldier)\.glb/u,
  'a visible human role still references a low-detail supplied mesh');

const humansSource = fs.readFileSync('src/humans.js', 'utf8');
const presetCount = (humansSource.match(/id: '[A-F]-/gu) || []).length;
assert.equal(presetCount, 6, `expected six human build presets, found ${presetCount}`);

console.log('HUMAN TOPOLOGY OK');

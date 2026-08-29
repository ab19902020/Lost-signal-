import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const main = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');
const world = await readFile(new URL('../src/world_blender.js', import.meta.url), 'utf8');
const lighting = await readFile(new URL('../src/world_lit.js', import.meta.url), 'utf8');
const enemies = await readFile(new URL('../src/town_enemies.js', import.meta.url), 'utf8');
const assets = await readFile(new URL('../src/assets.js', import.meta.url), 'utf8');
const sky = await readFile(new URL('../src/sky.js', import.meta.url), 'utf8');

assert.ok(lighting.includes('createBaseWorld(assets, options)'),
  'the lighting wrapper drops the mobile world budget');
assert.match(main, /mobile:[\s\S]*?foliage:\s*0\.2[0-5][\s\S]*?post:\s*false/,
  'mobile does not use its low-density, direct-render path');
assert.ok(main.includes('else renderer.render(scene, game.camera)'),
  'mobile still pays for the full post-processing stack');
assert.ok(main.includes('function updateFrameBudget(dt)') && main.includes('fps < 52'),
  'mobile has no frame-budget governor for sustained load');
assert.ok(main.includes('firstWorldImpact(world') && world.includes('addBallisticProxy(root, name)'),
  'combat does not use the broad-phase/proxy path');
assert.ok(!main.includes('intersectObjects(worldGeometry(world), true'),
  'a shot still recursively raycasts the entire world');
// The cull is now against whoever is looking - the player's eyes, or a CCTV
// camera he is watching from the shelter - but it is still a cull, and the two
// distances it uses have to stay in the file for it to be one.
assert.ok(enemies.includes('root.userData.hitVolumes')
  && enemies.includes('Math.min(distance, viewDistance) > ACTIVATE')
  && enemies.includes('viewDistance < 215 || this.alerted')
  && enemies.includes('viewDistance < ASSAULT_RENDER_DISTANCE'),
  'high-detail enemies lack hit volumes or distance culling');
assert.equal((world.match(/placeTownBuilding\(assets\./g) || []).length, 2,
  'more than the two requested buildings are spawned');
assert.ok(!world.includes('assets.distantTown') && !assets.includes('distantTown:'),
  'the old block town is still loaded or spawned');
assert.ok(main.includes('essentialGunSamples') && main.includes('async function decodeGunSamples'),
  'gun samples still decode together during live play');
assert.match(sky, /scene\.fog\.density\s*=\s*0\.00065/,
  'clear exterior fog regressed to the blurry near-field value');

function glbTriangles(bytes) {
  assert.equal(bytes.readUInt32LE(0), 0x46546c67);
  const jsonLength = bytes.readUInt32LE(12);
  const document = JSON.parse(bytes.subarray(20, 20 + jsonLength)
    .toString('utf8').replace(/\0+$/, ''));
  return (document.meshes || []).reduce((sum, mesh) => sum
    + mesh.primitives.reduce((part, primitive) =>
      part + (document.accessors?.[primitive.indices]?.count || 0) / 3, 0), 0);
}

const ruin = glbTriangles(await readFile(new URL(
  '../public/assets/supplied/town_building_brick.glb', import.meta.url)));
const clinic = glbTriangles(await readFile(new URL(
  '../public/assets/supplied/town_building_redbrick.glb', import.meta.url)));
const escort = glbTriangles(await readFile(new URL(
  '../public/assets/supplied/ford_escort_rs_turbo.glb', import.meta.url)));
assert.ok(ruin > 400_000, 'performance regression fixture is no longer the high-detail ruin');
assert.ok(clinic < 10_000, `clinic should use the compact matching upload (${clinic} triangles)`);
// The Escort is the clean upload, not the photogrammetry scan: a modelled car
// whose wheels, lamps and trim are already separate shells. It costs about a
// sixtieth of what the scan cost and has no holes in it, which is the whole
// reason it replaced it.
assert.ok(escort > 3_000 && escort < 20_000,
  `supplied Ford should retain detail inside its mobile budget (${escort} triangles)`);

console.log(`Performance QA passed: direct mobile render, ${Math.round(ruin).toLocaleString()}-triangle ruin proxy, ${Math.round(clinic).toLocaleString()}-triangle clinic, ${Math.round(escort).toLocaleString()}-triangle rigged Ford, culled enemy skins and staged audio.`);

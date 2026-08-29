// Walk the map looking for walls that are not there.
//
// Every collider in the game comes from a piece of geometry, but not every
// collider is the shape of the geometry it came from. `addObject` takes an
// object's world axis-aligned bounds, so a rotated building, an L-shaped prop
// or a whole scanned house blocks the box that circumscribes it - and the
// difference between that box and the thing you can see is an invisible wall.
//
// This samples the floor of each world on a grid, asks the collision system
// where the player cannot stand, and then asks the scene whether there is
// anything there to see. Blocked with nothing in it is the bug.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';

const url = process.argv[2] || 'http://127.0.0.1:5173/Lost-signal-/';
const outDir = process.argv[3] || 'qa/out/walls';
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
page.on('pageerror', (error) => console.error('PAGEERROR', String(error).slice(0, 300)));
await page.goto(url, { waitUntil: 'load', timeout: 180000 });
await page.waitForFunction(() => typeof globalThis.__lsBoot === 'function', null, { timeout: 180000 });
await page.evaluate(() => globalThis.__lsBoot());
await page.waitForFunction(() => globalThis.__ls, null, { timeout: 180000 });
await page.evaluate(() => globalThis.__ls.start());
await page.waitForTimeout(1200);

const REGIONS = [
  // name, world, half-extent in x, half-extent in z, centre
  ['yard', 'outside', 44, 44, [0, 0]],
  // The road runs out to the town on a bearing, so it is sampled in three
  // blocks along it rather than as one enormous grid.
  ['road-near', 'outside', 46, 46, [-20, 90]],
  ['road-far', 'outside', 56, 56, [-105, 250]],
  ['town', 'outside', 70, 70, [-200, 455]],
  ['silo', 'silo', 32, 32, [0, 0]],
  // Sampled to the room, not past it: outside the shelter's own walls there is
  // nothing to see and nothing to walk on, and counting that as an invisible
  // wall would bury the real ones.
  ['bunker', 'bunker', 6.4, 6.7, [0, 0]],
];

// Every collider in every world, measured against what it encloses. This is
// the half of the audit that does not depend on being able to walk there: the
// town is half a kilometre down the road and nobody grids that.
const colliderAudit = await page.evaluate(() => {
  const { game, THREE } = globalThis.__ls;
  const box = new THREE.Box3();
  const out = [];
  for (const world of ['outside', 'silo', 'bunker']) {
    const scene = game.scenes?.[world] || game[world];
    const colliders = game.colliders?.[world];
    if (!scene || !colliders) continue;
    const solids = [];
    scene.updateMatrixWorld(true);
    scene.traverse((part) => {
      if (!part.isMesh && !part.isSkinnedMesh) return;
      if (!part.visible || part.userData.hitProxy || part.userData.ballisticProxy) return;
      if (part.material && part.material.visible === false) return;
      let hidden = false;
      part.traverseAncestors((parent) => { if (!parent.visible) hidden = true; });
      if (hidden) return;
      box.setFromObject(part, true);
      if (!Number.isFinite(box.min.x) || box.isEmpty()) return;
      solids.push([box.min.x, box.min.y, box.min.z, box.max.x, box.max.y, box.max.z]);
    });

    const offenders = [];
    for (const entry of colliders.boxes || []) {
      if (entry.enabled === false) continue;
      const b = entry.box;
      const width = b.max.x - b.min.x;
      const depth = b.max.z - b.min.z;
      if (width * depth < 0.25) continue;
      const stepX = Math.min(0.4, width / 6);
      const stepZ = Math.min(0.4, depth / 6);
      // Sample at the height a walking player's chest occupies inside the box.
      const y = Math.min(b.max.y - 0.05, b.min.y + 1.0);
      if (y < b.min.y) continue;
      let total = 0;
      let phantom = 0;
      for (let x = b.min.x + stepX / 2; x < b.max.x; x += stepX) {
        for (let z = b.min.z + stepZ / 2; z < b.max.z; z += stepZ) {
          total++;
          let seen = false;
          for (const solid of solids) {
            if (x < solid[0] - 0.15 || x > solid[3] + 0.15) continue;
            if (z < solid[2] - 0.15 || z > solid[5] + 0.15) continue;
            if (y < solid[1] - 0.15 || y > solid[4] + 0.15) continue;
            seen = true; break;
          }
          if (!seen) phantom++;
        }
      }
      if (!total) continue;
      const area = width * depth * (phantom / total);
      if (area < 1.0) continue;
      offenders.push({
        world, source: entry.source || '(unnamed)',
        size: [+width.toFixed(2), +(b.max.y - b.min.y).toFixed(2), +depth.toFixed(2)],
        at: [+((b.min.x + b.max.x) / 2).toFixed(1), +((b.min.z + b.max.z) / 2).toFixed(1)],
        phantomArea: +area.toFixed(1), phantomShare: +(phantom / total).toFixed(2),
      });
    }
    out.push(...offenders);
  }
  return out.sort((a, b) => b.phantomArea - a.phantomArea);
});

console.log(`Colliders that block floor with nothing in it (${colliderAudit.length}):`);
for (const offender of colliderAudit.slice(0, 25)) {
  console.log(`  ${offender.phantomArea.toFixed(1).padStart(7)} m2  ${(offender.phantomShare * 100).toFixed(0).padStart(3)}%  `
    + `${offender.world.padEnd(7)} ${offender.size.join(' x ').padEnd(22)} at ${offender.at.join(', ').padEnd(16)} ${offender.source}`);
}
const phantomTotal = colliderAudit.reduce((sum, offender) => sum + offender.phantomArea, 0);
console.log(`  total phantom floor: ${phantomTotal.toFixed(0)} m2\n`);

const findings = await page.evaluate((regions) => {
  const { game, THREE } = globalThis.__ls;
  const box = new THREE.Box3();
  const report = [];

  for (const [name, world, halfX, halfZ, centre] of regions) {
    const scene = game.scenes?.[world] || game[world];
    const colliders = game.colliders?.[world];
    if (!scene || !colliders) { report.push({ name, error: 'no world' }); continue; }

    // Everything the player can actually see, as world bounds. Hit proxies and
    // ballistic proxies are deliberately invisible and deliberately not walls.
    const solids = [];
    scene.updateMatrixWorld(true);
    scene.traverse((part) => {
      if (!part.isMesh && !part.isSkinnedMesh) return;
      if (!part.visible || part.userData.hitProxy || part.userData.ballisticProxy) return;
      if (part.material && part.material.visible === false) return;
      let hidden = false;
      part.traverseAncestors((parent) => { if (!parent.visible) hidden = true; });
      if (hidden) return;
      box.setFromObject(part, true);
      if (!Number.isFinite(box.min.x) || box.isEmpty()) return;
      solids.push([box.min.x, box.min.y, box.min.z, box.max.x, box.max.y, box.max.z]);
    });

    const step = 0.5;
    // The player is a 0.34 m capsule and stands off a wall by its radius, so a
    // sample that far out from real geometry is a shoulder against a wall, not
    // a phantom. Beyond that it is a wall you can feel and cannot see.
    const radius = 0.34;
    const margin = radius + 0.15;
    const blocked = [];
    let sampled = 0;
    let blockedCount = 0;
    for (let x = centre[0] - halfX; x <= centre[0] + halfX; x += step) {
      for (let z = centre[1] - halfZ; z <= centre[1] + halfZ; z += step) {
        sampled++;
        const floor = colliders.floorAt(x, z, radius, 60);
        if (!colliders.contains(x, z, radius, floor + 0.25, floor + 1.7)) continue;
        blockedCount++;
        const y = floor + 0.9;
        let seen = false;
        for (const solid of solids) {
          if (x < solid[0] - margin || x > solid[3] + margin) continue;
          if (z < solid[2] - margin || z > solid[5] + margin) continue;
          if (y < solid[1] - margin || y > solid[4] + margin) continue;
          seen = true;
          break;
        }
        if (!seen) blocked.push([+x.toFixed(2), +z.toFixed(2), +floor.toFixed(2)]);
      }
    }

    // Name the collider responsible for each empty block, so the report says
    // what to fix rather than only where it hurts.
    const culprits = new Map();
    for (const [x, z, floor] of blocked) {
      const y = floor + 0.9;
      let found = 'unattributed';
      for (const entry of colliders.boxes || []) {
        if (entry.enabled === false) continue;
        const b = entry.box;
        if (x < b.min.x - 0.34 || x > b.max.x + 0.34) continue;
        if (z < b.min.z - 0.34 || z > b.max.z + 0.34) continue;
        if (y < b.min.y || y > b.max.y) continue;
        found = `box ${[b.min.x, b.min.y, b.min.z].map((v) => v.toFixed(1)).join(',')}`
          + ` .. ${[b.max.x, b.max.y, b.max.z].map((v) => v.toFixed(1)).join(',')}`;
        break;
      }
      const distance = Math.hypot(x, z);
      if (found === 'unattributed') {
        for (const ring of colliders.rings || []) {
          if (y < ring.minY || y > ring.maxY) continue;
          if (distance < ring.r0 - 0.34 || distance > ring.r1 + 0.34) continue;
          found = `ring r ${ring.r0.toFixed(1)}..${ring.r1.toFixed(1)} y ${ring.minY.toFixed(1)}..${ring.maxY.toFixed(1)}`;
          break;
        }
      }
      if (found === 'unattributed') {
        for (const arc of colliders.arcs || []) {
          if (arc.enabled === false || y < arc.minY || y > arc.maxY) continue;
          if (distance < arc.r0 - 0.34 || distance > arc.r1 + 0.34) continue;
          found = `arc r ${arc.r0.toFixed(1)}..${arc.r1.toFixed(1)} y ${arc.minY.toFixed(1)}..${arc.maxY.toFixed(1)}`;
          break;
        }
      }
      if (found === 'unattributed') {
        for (const obb of colliders.orientedBoxes || []) {
          if (obb.enabled === false || y < obb.minY || y > obb.maxY) continue;
          if (Math.hypot(x - obb.cx, z - obb.cz) > Math.hypot(obb.halfX, obb.halfZ) + 0.34) continue;
          found = `oriented ${obb.cx.toFixed(1)},${obb.cz.toFixed(1)} half ${obb.halfX.toFixed(2)}x${obb.halfZ.toFixed(2)}`;
          break;
        }
      }
      if (found === 'unattributed' && colliders.bounds) {
        found = 'world bounds';
      }
      const entry = culprits.get(found) || { count: 0, sample: [x, z] };
      entry.count++;
      culprits.set(found, entry);
    }

    report.push({
      name, world, sampled, blockedCount, empty: blocked.length,
      culprits: [...culprits.entries()]
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 12)
        .map(([collider, entry]) => ({ collider, cells: entry.count, at: entry.sample })),
      cells: blocked,
    });
  }
  return report;
}, REGIONS);

let worst = 0;
for (const region of findings) {
  if (region.error) { console.log(`  ${region.name}: ${region.error}`); continue; }
  const share = region.blockedCount ? region.empty / region.blockedCount : 0;
  worst = Math.max(worst, region.empty);
  console.log(`  ${region.name.padEnd(8)} ${region.sampled} samples, `
    + `${region.blockedCount} blocked, ${region.empty} of those with nothing there `
    + `(${(share * 100).toFixed(1)}%)`);
  for (const culprit of region.culprits) {
    console.log(`      ${String(culprit.cells).padStart(5)} cells  ${culprit.collider}  near ${culprit.at.join(', ')}`);
  }
}
writeFileSync(`${outDir}/report.json`, JSON.stringify({ colliderAudit, findings }, null, 1));
await browser.close();
console.log(`\nwritten ${outDir}/report.json`);
if (process.env.STRICT && worst > 0) process.exit(1);

// Look at how the character carries a weapon.
//
// Three stances, and the whole point of them is what they look like: on the
// back at a sprint, at low ready on the move, in the shoulder when aiming.
// The numbers are asserted in qa/player-character.mjs; this is the half of it
// that has to be looked at, because "the gun goes inside his body" is not a
// measurement, it is a picture.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';

const url = process.argv[2] || 'http://127.0.0.1:5173/Lost-signal-/';
const outDir = process.argv[3] || 'qa/out/carry';
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 900, height: 620 } });
page.on('pageerror', (error) => console.error('PAGEERROR', String(error).slice(0, 300)));
await page.goto(url, { waitUntil: 'load', timeout: 180000 });
await page.waitForFunction(() => typeof globalThis.__lsBoot === 'function', null, { timeout: 180000 });
await page.evaluate(() => globalThis.__lsBoot());
await page.waitForFunction(() => globalThis.__ls, null, { timeout: 180000 });
await page.evaluate(() => globalThis.__ls.start());
await page.waitForTimeout(1500);

// Driven through the real input path, so what is photographed is what a
// player produces by pressing the keys - not a pose composed for the camera.
const STANCES = [
  ['idle', { keys: [], frames: 90 }],
  ['walking', { keys: ['KeyW'], frames: 90 }],
  ['sprinting', { keys: ['KeyW', 'ShiftLeft'], frames: 110 }],
  ['aiming', { keys: [], frames: 90, aim: true }],
  ['aiming-walk', { keys: ['KeyW'], frames: 90, aim: true }],
];

const report = [];
await page.evaluate(() => {
  const ls = globalThis.__ls;
  ls.world('outside');
  ls.arm();
  ls.view('third');
  // The compound at dawn is too dark to judge a silhouette by, and the spawn
  // is against a wall - which is a fine place to stand and a useless one to be
  // photographed in.
  ls.exposure(2.2);
  ls.moveTo(-13, 26);
  ls.look(Math.PI * 0.5, -0.05);
  ls.simulate(40);
});

for (const [name, plan] of STANCES) {
  const shot = await page.evaluate(([stance]) => {
    const ls = globalThis.__ls;
    ls.aim(!!stance.aim);
    if (stance.keys.length) ls.walkFrames(stance.frames, stance.keys);
    else ls.simulate(stance.frames);
    const character = ls.game.playerCharacter;
    character.root.updateWorldMatrix(true, true);
    const mount = character.weaponMount.getWorldPosition(new ls.THREE.Vector3());
    const local = character.root.worldToLocal(mount.clone());
    const spine = character.root.worldToLocal(
      character.rig.bones.get('Spine02').getWorldPosition(new ls.THREE.Vector3()));
    return {
      carry: character.carry(), blend: character.carryBlend(),
      behindSpine: +(local.z - spine.z).toFixed(3),
    };
  }, [plan]);
  await page.waitForTimeout(120);
  writeFileSync(`${outDir}/${name}.png`,
    Buffer.from(await page.screenshot({ type: 'png', timeout: 120000 })));
  report.push({ stance: name, ...shot });
  console.error(`  shot ${name} (${shot.carry})`);
}
await page.evaluate(() => globalThis.__ls.aim(false));

for (const row of report) {
  console.log(`  ${row.stance.padEnd(12)} ${row.carry.padEnd(6)} `
    + `hands ${String(row.blend.hands).padEnd(6)} aim ${String(row.blend.aim).padEnd(6)} `
    + `mount ${row.behindSpine >= 0 ? 'behind' : 'ahead of'} the spine `
    + `by ${Math.abs(row.behindSpine).toFixed(3)} m`);
}
await browser.close();

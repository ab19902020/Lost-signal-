// How big everything actually is, in metres, in the built world.
//
// "He looks too small next to the chair" is a claim about numbers, and the
// numbers were there to be read the whole time: the operator chair was two
// metres tall and one and a quarter wide, which is a throne, next to a man
// who is correctly 1.78 m. Eyeballing screenshots cannot tell you which of
// the two is wrong. Measuring both can.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const url = process.argv[2] || 'http://127.0.0.1:5173/Lost-signal-/';

// What each thing is in life, and how much slack to allow. Heights are the
// honest ones: a task chair is 1.15 m to the top of its headrest, a desk is
// 0.75 m to the worktop, a domestic door is 2.05 m.
const EXPECTED = [
  // [name, what, metres, slack]
  ['Prop_Chair', 'height', 1.15, 0.15],          // task chair, seat at 0.47
  ['Prop_Desk', 'height', 1.51, 0.20],           // worktop 0.74, monitor above
  ['Prop_Bench', 'height', 2.23, 0.25],          // bench at 0.92, pegboard over
  ['Prop_Lockers', 'height', 1.95, 0.15],
  ['Prop_Storage', 'height', 2.10, 0.20],
  ['Prop_Generator', 'height', 2.14, 0.25],
  ['Prop_Radio', 'height', 0.47, 0.10],
  ['Prop_Bed', 'height', 0.55, 0.12],
  ['Prop_Clutter', 'height', 0.86, 0.15],
  ['Prop_Electrical', 'height', 2.05, 0.20],
  ['Prop_Ventilation', 'height', 2.35, 0.25],
  ['Prop_AccessControl', 'height', 0.45, 0.10],
  ['Prop_WallCamera', 'height', 0.22, 0.06],
  ['Prop_HabDirectory', 'height', 1.90, 0.20],
  ['Prop_SiloCache', 'height', 0.85, 0.15],
  ['Prop_PropBarrel', 'height', 0.88, 0.12],
  ['Prop_PropBarrier', 'height', 1.05, 0.15],
  // The radio stands on the desk. If the desk is ever rescaled without the
  // things on it, this is what says so.
  ['Prop_Radio', 'base', 0.75, 0.06],
];

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

const measured = await page.evaluate(() => {
  const ls = globalThis.__ls;
  const out = {};
  const record = (name, object) => {
    const box = ls.bounds(object);
    if (box.isEmpty()) return;
    const size = box.getSize(box.max.clone());
    const row = { w: +size.x.toFixed(2), h: +size.y.toFixed(2), d: +size.z.toFixed(2),
      base: +box.min.y.toFixed(2), top: +box.max.y.toFixed(2) };
    // Several of these are placed more than once. One reading each is enough,
    // and the tallest is the one worth arguing about.
    if (!out[name] || out[name].h < row.h) out[name] = row;
  };
  for (const scene of Object.values(ls.game.scenes)) {
    scene.updateMatrixWorld(true);
    for (const child of scene.children) {
      if (!child.name || child.userData.ballisticProxy) continue;
      record(child.name.replace(/_?\d+$/, ''), child);
    }
  }
  const character = ls.game.playerCharacter;
  const player = character.bounds().getSize(ls.game.camera.position.clone());
  return {
    props: out,
    player: { w: +player.x.toFixed(2), h: +player.y.toFixed(2), d: +player.z.toFixed(2) },
  };
});
await browser.close();

const rows = Object.entries(measured.props)
  .sort(([, a], [, b]) => b.h - a.h)
  .map(([name, r]) => `${String(r.h).padStart(7)} m tall  y ${String(r.base).padStart(6)}..${String(r.top).padStart(6)}   ${name}`);
console.log(rows.join('\n'));
console.log(`\nplayer  ${measured.player.h} m tall, ${measured.player.w} x ${measured.player.d}\n`);

assert.ok(Math.abs(measured.player.h - 1.78) < 0.06,
  `the protagonist is ${measured.player.h} m tall, not 1.78 m`);

const wrong = [];
for (const [name, axis, want, slack] of EXPECTED) {
  const row = measured.props[name];
  if (!row) { wrong.push(`${name} is not in the world at all`); continue; }
  const got = axis === 'height' ? row.h : (axis === 'base' ? row.base : row.w);
  if (Math.abs(got - want) > slack) {
    wrong.push(axis === 'base'
      ? `${name} sits at y ${got}; it should rest at about ${want} m`
      : `${name} is ${got} m ${axis}; a real one is about ${want} m`);
  }
}
console.log(wrong.join('\n') || 'all measured props are life size');
if (!process.env.SCALE_REPORT) assert.deepEqual(wrong, [], `\n  ${wrong.join('\n  ')}\n`);
console.log('Scale QA passed: the protagonist is 1.78 m and the furniture he '
  + 'stands next to is the size furniture is.');

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';

// Aiming, checked on every weapon in the armoury.
//
// The aim pose is derived from where each model's sights actually are, so the
// thing that can go wrong is a weapon whose sights cannot be found or whose
// sight line comes out backwards — and either fault is invisible until you
// raise that particular weapon. This resolves all of them and reports the
// geometry, then photographs one of each family down the sights.
//
// Needs a build with the debug handle left in:
//   NODE_ENV=development npx vite build --mode development --outDir dist-look
//   npx vite preview --port 4175 --outDir dist-look

const [url, outDir] = process.argv.slice(2);
if (outDir) mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
    '--disable-background-timer-throttling', '--disable-renderer-backgrounding'],
});
const page = await browser.newPage({ viewport: { width: 900, height: 560 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
const cdp = await page.context().newCDPSession(page);
cdp.on('Page.screencastFrame', ({ sessionId }) => cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {}));
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 1, maxWidth: 64, maxHeight: 64, everyNthFrame: 1 });

await page.goto(url, { waitUntil: 'load', timeout: 180000 });
await page.evaluate(() => globalThis.__lsBoot());
await page.waitForFunction(() => globalThis.__ls && !document.getElementById('start')?.disabled,
  null, { timeout: 300000, polling: 200 });
await page.evaluate(() => globalThis.__ls.start());
await page.waitForFunction(() => globalThis.__ls?.debug?.().started === true, null,
  { timeout: 60000, polling: 200 });

await page.evaluate(() => { globalThis.__ls.world('outside'); globalThis.__ls.simulate(30); });

const rows = await page.evaluate(() => {
  const ls = globalThis.__ls;
  const out = [];
  for (const key of ls.weapons()) {
    if (!ls.usable(key)) continue;
    ls.arm(key);
    ls.simulate(4);
    const sights = ls.game.heldSights?.();
    if (!sights) { out.push({ key, found: false }); continue; }
    const axis = sights.front.clone().sub(sights.rear);
    out.push({
      key,
      found: true,
      measured: !!sights.measured,
      // The sight line must run toward the muzzle, which is -Z in the rig.
      forward: +(-axis.z).toFixed(4),
      // Sights sit on top of a weapon, and the two must be at the same height
      // or the eye cannot see the front one through the rear one.
      rise: +(sights.front.y - sights.rear.y).toFixed(4),
      drift: +(sights.front.x - sights.rear.x).toFixed(4),
      base: +axis.length().toFixed(4),
    });
  }
  return out;
});

// The fault that shipped: a weapon drawn while the rig was already rotated —
// which is what happens every time you switch weapons with the sights up —
// measured its own extents through a world-space box whose corners had been
// swapped by that rotation, so front and rear came out the wrong way round and
// the aim pose turned the weapon to point at the player. Draw every weapon
// again from a rotated, aiming rig and the line must come out the same way.
const whileAiming = await page.evaluate(() => {
  const ls = globalThis.__ls;
  const out = [];
  ls.aim(true);
  ls.simulate(40);
  for (const key of ls.weapons()) {
    if (!ls.usable(key)) continue;
    ls.arm(key);
    ls.simulate(30);
    const sights = ls.game.heldSights?.();
    out.push({ key, forward: sights ? +(sights.rear.z - sights.front.z).toFixed(4) : null });
  }
  ls.aim(false);
  ls.simulate(10);
  return out;
});

const failures = [];
for (const r of whileAiming) {
  if (r.forward === null) failures.push(`${r.key}: lost its sight line when drawn while aiming`);
  else if (r.forward <= 0) failures.push(`${r.key}: drawn while aiming, it points at the player (${r.forward})`);
}
for (const r of rows) {
  if (!r.found) { failures.push(`${r.key}: no sight line at all`); continue; }
  if (r.forward <= 0) failures.push(`${r.key}: sight line runs backwards (${r.forward})`);
  if (r.base < 0.04) failures.push(`${r.key}: sight base is only ${r.base} — too short to aim with`);
  // rise and drift are only worth asserting on a weapon whose sights were
  // found by name. The derived line is built level and centred by construction,
  // so checking it here would be checking this file against itself.
  if (r.measured && Math.abs(r.rise) > 0.02) {
    failures.push(`${r.key}: front sight sits ${r.rise} off the rear one`);
  }
  if (r.measured && Math.abs(r.drift) > 0.012) {
    failures.push(`${r.key}: sights are ${r.drift} out of line sideways`);
  }
}

// Getting into the car left the weapon hanging in the chase camera behind the
// boot, and holstering had no state of its own at all.
const stowed = await page.evaluate(() => {
  const ls = globalThis.__ls;
  ls.arm('armoryAssault01');
  ls.simulate(6);
  const drawn = ls.game.weaponView.visible;
  ls.holster(true);
  ls.simulate(6);
  const holstered = ls.game.weaponView.visible;
  ls.holster(false);
  ls.simulate(6);
  ls.drive(0);
  ls.simulate(10);
  const driving = ls.game.weaponView.visible;
  ls.park();
  ls.simulate(10);
  const afterDriving = ls.game.weaponView.visible;
  return { drawn, holstered, driving, afterDriving };
});
if (!stowed.drawn) failures.push('a drawn weapon is not on screen');
if (stowed.holstered) failures.push('a holstered weapon is still on screen');
if (stowed.driving) failures.push('the weapon is still on screen while driving');
if (!stowed.afterDriving) failures.push('the weapon did not come back out after driving');

const named = rows.filter((r) => r.measured).length;
console.log(JSON.stringify({ weapons: rows.length, named, derived: rows.length - named, rows }, null, 1));
if (!named) {
  // Not a failure — the derived line aims correctly — but worth saying out
  // loud, because it means the sight geometry the Blender generator builds is
  // not reaching the browser: the weapons are joined into a single mesh on
  // export, so every part name goes with it. Emitting the two sight points as
  // empties would let the eye line up on the actual post instead of along the
  // top of the receiver.
  console.error('NOTE: no weapon resolved its sights by name — all 26 are using the'
    + ' derived line off the receiver. The generator joins each weapon into one'
    + ' mesh, so Irons_RearAperture and friends do not survive export.');
}

if (outDir) {
  for (const key of ['armoryAssault01', 'armorySmg01', 'armoryShotgun01',
    'armoryPistol01', 'armoryRevolver01', 'armoryAkm']) {
    await page.evaluate(([key]) => {
      const ls = globalThis.__ls;
      ls.time(0.42);
      ls.weather(0.1);
      ls.moveTo(0, -4);
      ls.look(Math.PI, -0.03);
      ls.arm(key);
      ls.aim(true);
      ls.simulate(120);
    }, [key]);
    await page.waitForTimeout(2500);
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(`${outDir}/ads-${key}.png`, Buffer.from(data, 'base64'));
    console.error(`  shot ads-${key}`);
  }
}

for (const error of new Set(errors)) failures.push(`uncaught: ${error}`);
await cdp.send('Page.stopScreencast').catch(() => {});
await browser.close();
if (failures.length) {
  console.error('Sights QA failed:\n  ' + failures.join('\n  '));
  process.exit(1);
}
console.log(`Sights QA passed: ${rows.length} weapons aim down a real sight line `
  + `(${named} off named parts, ${rows.length - named} measured off the receiver).`);

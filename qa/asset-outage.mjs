// One file did not download. Does the shelter still open?
//
// It did not. Ninety-odd GLBs load before the game starts, in three parallel
// batches, and every one of them was mandatory - so a single 503 from the CDN
// on a single file put SHELTER STARTUP FAILED across the screen. The file it
// happened to be was an aeroplane parked on an airstrip four hundred metres
// from anything the player was about to do.
//
// Two answers. Transient failures are retried, which handles the overwhelming
// majority of them; and a short list of assets the world is built to survive
// without is allowed to stay missing. That list is only worth having if it is
// true, so this boots the real game with each of those files answering 503 and
// asserts the shelter opens anyway.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const url = process.argv[2] || 'http://127.0.0.1:5173/Lost-signal-/';

// Read the list out of the source rather than restating it here, so a key
// added to one and not the other cannot pass.
const source = readFileSync(new URL('../src/assets.js', import.meta.url), 'utf8');
const block = source.slice(source.indexOf('export const TOLERATED_ASSETS'));
const tolerated = [...block.slice(0, block.indexOf(']')).matchAll(/'([A-Za-z0-9_]+)'/g)]
  .map((match) => match[1]);
assert.ok(tolerated.length > 4, 'could not read TOLERATED_ASSETS out of src/assets.js');

// Which file each key comes from, so the outage can be aimed at a real URL.
const urls = new Map();
for (const [, key, file] of source.matchAll(/^\s*([A-Za-z0-9_]+):\s*`\$\{BASE\}([^`]+)`/gm)) {
  if (!urls.has(key)) urls.set(key, file);
}
for (const key of tolerated) {
  assert.ok(urls.has(key), `${key} is in TOLERATED_ASSETS but is not an asset`);
}

const pause = (ms) => new Promise((done) => setTimeout(done, ms));

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});

/** Boot the game with `blocked` answering 503, and report what happened. */
async function bootWithout(blocked) {
  const page = await browser.newPage({ viewport: { width: 640, height: 400 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error).slice(0, 200)));
  let refused = 0;
  if (blocked) {
    await page.route(`**/${blocked}*`, (route) => {
      refused++;
      return route.fulfill({ status: 503, body: 'Service Unavailable' });
    });
  }
  await page.goto(url, { waitUntil: 'load', timeout: 180000 });
  await page.waitForFunction(() => typeof globalThis.__lsBoot === 'function', null, { timeout: 180000 });
  let started = false;
  try {
    // __lsBoot resolves when the world is built, so a build that never
    // finishes never resolves. Nothing else here is unbounded, and one boot
    // hanging should cost this harness a failed row rather than the afternoon.
    await Promise.race([
      page.evaluate(() => globalThis.__lsBoot()),
      pause(240000).then(() => { throw new Error('__lsBoot did not return'); }),
    ]);
    await page.waitForFunction(() => globalThis.__ls, null, { timeout: 60000 });
    await page.evaluate(() => globalThis.__ls.start());
    await page.waitForTimeout(600);
    started = await page.evaluate(() => {
      const ls = globalThis.__ls;
      ls.world('outside');
      ls.simulate(30);
      return !!ls.game?.colliders?.outside;
    });
  } catch (error) {
    errors.push(`did not reach a running game: ${String(error).slice(0, 120)}`);
  }
  await page.close();
  return { started, refused, errors };
}

// The retry has to be doing its job, or every result below is really a test of
// whether the file was needed rather than of whether the outage was survived.
// Four refusals is the first request plus three retries.
const retried = await bootWithout(urls.get(tolerated[0]));
assert.ok(retried.refused >= 4,
  `a failing asset was requested ${retried.refused} time(s); it should be retried`);

// A boot is most of a minute under software rendering, so they run a few at a
// time rather than twenty-odd in a row.
const LANES = Number(process.env.OUTAGE_LANES || 2);
const rows = [];
const queue = [...tolerated];
await Promise.all(Array.from({ length: LANES }, async () => {
  for (let key = queue.shift(); key; key = queue.shift()) {
    const result = await bootWithout(urls.get(key));
    rows.push({ key, ...result });
    console.log(`${key.padEnd(20)} refused ${String(result.refused).padStart(2)}  `
      + `started ${result.started}  ${result.errors[0] || ''}`);
  }
}));
await browser.close();

for (const row of rows) {
  assert.ok(row.refused > 0, `${row.key}'s outage never took effect; the route did not match`);
  assert.ok(row.started,
    `the shelter did not open with ${row.key} missing: ${row.errors.join(' | ') || 'no error reported'}`);
}
console.log(`Asset outage QA passed: ${rows.length} assets can each fail to download `
  + 'and the game still starts.');

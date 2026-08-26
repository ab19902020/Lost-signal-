import { chromium } from 'playwright';

// Does the game start?
//
// Every other harness drives a dev build through __lsBoot(), which skips the
// welcome menu — so a crash on the path a real player takes, in a production
// bundle, was something nothing here ever exercised. A startup crash shipped
// that way once. This walks in through the front door: a production build, the
// menu clicked the way a person clicks it, and an assertion that the shelter
// actually opens rather than that the file was published.
//
// Point it at a `vite preview` of dist, not at the dev server.

const url = process.argv[2] || 'http://127.0.0.1:4173/Lost-signal-/';
const deadline = Number(process.env.BOOT_TIMEOUT_MS || 2_100_000);

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
    '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion'],
});
const page = await browser.newPage({ viewport: { width: 640, height: 400 } });
const errors = [];
page.on('pageerror', (e) => errors.push(`${e.message}\n${String(e.stack).split('\n').slice(0, 4).join('\n')}`));
page.on('crash', () => errors.push('PAGE CRASHED'));

// Headless Chromium parks requestAnimationFrame on an idle page; the screencast
// keeps it running so the renderer makes progress during the asset load.
const cdp = await page.context().newCDPSession(page);
cdp.on('Page.screencastFrame', ({ sessionId }) => cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {}));
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 1, maxWidth: 64, maxHeight: 64, everyNthFrame: 1 });

const started = Date.now();
const lap = (m) => console.error(`  ${((Date.now() - started) / 1000).toFixed(0)}s ${m}`);

await page.goto(url, { waitUntil: 'load', timeout: 180_000 });
lap('page loaded');

// NEW GAME by id, not by text: CONTINUE is present but disabled without a
// save, and clicking a disabled button does nothing at all — which a text
// search happily reports as a successful click.
const clicked = await page.evaluate(() => {
  const button = document.getElementById('openingNew') || document.getElementById('openingContinue');
  if (!button || button.disabled) return null;
  button.click();
  return button.id;
});
if (!clicked) {
  console.error('FAILURE: the welcome menu offered nothing that could be clicked');
  await browser.close();
  process.exit(1);
}
lap(`clicked #${clicked}`);

// The intro cutscene sits between the menu and the shelter. Skip it the way the
// button does, once it exists.
for (let i = 0; i < 30; i++) {
  const skipped = await page.evaluate(() => {
    const skip = document.getElementById('openingSkip');
    if (!skip || skip.offsetParent === null) return false;
    skip.click();
    return true;
  }).catch(() => false);
  if (skipped) { lap('skipped the intro'); break; }
  await page.waitForTimeout(1000);
}

let outcome = null;
while (Date.now() - started < deadline) {
  outcome = await page.evaluate(() => {
    const text = document.body.innerText.replace(/\s+/g, ' ');
    return {
      fatal: /STARTUP FAILED|ASSET LOAD FAILED|ENGINE FAILED/i.test(text)
        ? text.slice(0, 200) : null,
      // The HUD markup ships in index.html with placeholder values, so its mere
      // presence proves nothing. This line is written once, at the end of
      // prepare(), out of the quality tier the renderer actually chose — so it
      // cannot appear unless the world was built without throwing.
      playing: /DISPLAY$/.test((document.getElementById('backend')?.textContent || '').trim()),
      status: (document.getElementById('engineState')?.textContent || text).slice(0, 90),
    };
  }).catch(() => null);
  if (!outcome) break;
  if (outcome.fatal || outcome.playing) break;
  await page.waitForTimeout(5000);
}

const failures = [];
if (!outcome) failures.push('the page went away before the shelter opened');
else if (outcome.fatal) failures.push(`startup failed on screen: ${outcome.fatal}`);
else if (!outcome.playing) failures.push(`never reached the game (last status: ${outcome.status})`);
for (const error of new Set(errors)) failures.push(`uncaught: ${error}`);

await cdp.send('Page.stopScreencast').catch(() => {});
await browser.close();

if (failures.length) {
  console.error('Boot QA failed:\n  ' + failures.join('\n  '));
  process.exit(1);
}
console.log(`Boot QA passed: production build reached the game in ${((Date.now() - started) / 1000).toFixed(0)}s with no uncaught errors.`);

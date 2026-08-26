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

const clicked = await page.evaluate(() => {
  const button = [...document.querySelectorAll('button')]
    .find((b) => /new game|continue|enter shelter/i.test(b.textContent || ''));
  button?.click();
  return button?.textContent?.trim() || null;
});
if (!clicked) {
  console.error('FAILURE: the welcome menu offered nothing to click');
  await browser.close();
  process.exit(1);
}
lap(`clicked ${clicked}`);

let outcome = null;
while (Date.now() - started < deadline) {
  outcome = await page.evaluate(() => {
    const text = document.body.innerText.replace(/\s+/g, ' ');
    return {
      fatal: /STARTUP FAILED|ASSET LOAD FAILED|ENGINE FAILED/i.test(text)
        ? text.slice(0, 200) : null,
      // The HUD only exists once the world is built and the loop is running.
      playing: !!document.getElementById('hud') && !!document.querySelector('canvas')
        && (document.getElementById('dayStat')?.textContent || '') !== '',
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

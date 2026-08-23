import { chromium } from 'playwright';
const url = process.argv[2];
const out = process.argv[3];
const actions = (process.argv[4] || '').split('||').filter(Boolean);

// Headless Chromium only ticks requestAnimationFrame when the compositor is
// producing frames, so an idle page freezes the game loop mid-test. A tiny
// screencast keeps frames flowing for the whole run.
async function pumpFrames(page) {
  const client = await page.context().newCDPSession(page);
  client.on('Page.screencastFrame', ({ sessionId }) => {
    client.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });
  await client.send('Page.startScreencast', { format: 'jpeg', quality: 1, maxWidth: 64, maxHeight: 64, everyNthFrame: 1 });
  return () => client.send('Page.stopScreencast').catch(() => {});
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion'],
});
const size = process.env.QA_VIEWPORT === 'phone'
  ? { width: 844, height: 390 }
  : { width: 1280, height: 720 };
const page = await browser.newPage({ viewport: size, hasTouch: process.env.QA_VIEWPORT === 'phone', isMobile: process.env.QA_VIEWPORT === 'phone' });
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
page.on('pageerror', e => errors.push(String(e).slice(0, 200)));
const stopPump = await pumpFrames(page);
await page.goto(url, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => {
  const b = document.getElementById('start');
  return b && !b.disabled;
}, null, { timeout: 60000, polling: 100 }).catch(() => errors.push('TIMEOUT waiting for start button'));
console.error('boot:', await page.textContent('#engineState'));
await page.click('#start').catch(e => errors.push('click failed ' + e.message));
await page.waitForTimeout(1500);
await page.waitForFunction(() => globalThis.__ls?.debug?.().started === true, null,
  { timeout: 30000, polling: 100 });
for (const a of actions) {
  if (a.startsWith('key:')) { await page.keyboard.down(a.slice(4)); await page.waitForTimeout(500); await page.keyboard.up(a.slice(4)); }
  else if (a.startsWith('wait:')) await page.waitForTimeout(+a.slice(5));
  else if (a.startsWith('eval:')) await page.evaluate(a.slice(5));
  else if (a.startsWith('click:')) await page.click(a.slice(6)).catch(e => errors.push('click ' + a + ': ' + e.message));
}
await page.waitForTimeout(600);
// Software rendering: a heavy frame can take well over the 30 s default.
await page.screenshot({ path: out, timeout: 180000 });
console.error('state:', await page.evaluate(() => { const l = globalThis.__ls; return l ? JSON.stringify({ quality: l.quality.name, pos: l.body.position.toArray().map(v => +v.toFixed(2)), grounded: l.body.grounded }) : 'no hook'; }).catch(() => 'n/a'));
if (errors.length) console.error('ERRORS:', [...new Set(errors)].slice(0, 6).join(' | '));
console.error('shot ->', out);
await stopPump();
await browser.close();

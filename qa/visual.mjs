import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.argv[2] || 'http://127.0.0.1:5173/Lost-signal-/';
const outDir = process.argv[3] || 'qa/out/visual';
await mkdir(outDir, { recursive: true });

const withQuality = (url, tier) => {
  const parsed = new URL(url);
  parsed.searchParams.set('quality', tier);
  return parsed.href;
};

async function pumpFrames(page) {
  const client = await page.context().newCDPSession(page);
  client.on('Page.screencastFrame', ({ sessionId }) => {
    client.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });
  await client.send('Page.startScreencast', {
    format: 'jpeg', quality: 1, maxWidth: 64, maxHeight: 64, everyNthFrame: 1,
  });
  return () => client.send('Page.stopScreencast').catch(() => {});
}

async function boot(page, quality = 'high') {
  await page.goto(withQuality(baseUrl, quality), { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => {
    const button = document.getElementById('start');
    return button && !button.disabled && button.textContent.includes('ENTER');
  }, null, { timeout: 90000, polling: 100 });
  await page.evaluate(() => globalThis.__ls.start());
  await page.waitForFunction(() => globalThis.__ls?.debug?.().started === true, null,
    { timeout: 30000, polling: 100 });
  await page.evaluate(() => globalThis.__ls.simulate(90));
}

async function save(page, name) {
  await page.waitForTimeout(350);
  // Film grain makes PNG compression disproportionately expensive under
  // SwiftShader. A high-quality JPEG preserves the lighting/material review
  // while keeping the full silo from timing out during capture.
  const path = join(outDir, `${name}.jpg`);
  await page.screenshot({ path, type: 'jpeg', quality: 92, timeout: 180000 });
  console.log(`visual: ${path}`);
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: [
    '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
    '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion',
  ],
});

const errors = [];
// Balanced keeps the same authored materials, lighting, bloom and grading as
// the game while avoiding the extra ambient-occlusion pass that makes a suite
// of software-rendered CI screenshots needlessly slow.
const desktop = await browser.newPage({ viewport: { width: 1280, height: 720 } });
desktop.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text().slice(0, 240));
});
desktop.on('pageerror', (error) => errors.push(String(error).slice(0, 240)));
const stopDesktopPump = await pumpFrames(desktop);

await boot(desktop, 'balanced');
await save(desktop, '01-bunker-player-view');

await desktop.evaluate(() => {
  const ls = globalThis.__ls;
  ls.world('bunker');
  ls.simulate(30);
  ls.freecam(-5.6, 2.45, 5.7, 1.2, 1.2, -2.8, 66);
});
await save(desktop, '02-bunker-overview');

const hatchRotation = await desktop.evaluate(() => {
  const ls = globalThis.__ls;
  ls.world('bunker');
  ls.game.setHatchOpen(true);
  ls.simulate(120);
  const rotation = ls.game.bunker.getObjectByName('Hatch_Hinge')?.rotation.x || 0;
  ls.freecam(-3.9, 1.85, 4.9, -1.75, .65, 3.35, 56);
  return rotation;
});
if (hatchRotation < 1.2) throw new Error(`hatch lid did not open (${hatchRotation.toFixed(2)} rad)`);
await save(desktop, '03-open-silo-hatch');

await desktop.evaluate(() => {
  const ls = globalThis.__ls;
  ls.world('outside');
  ls.simulate(90);
  ls.freecam(-17, 8.5, 13.5, 0, 1.1, -8, 62);
});
await save(desktop, '04-surface-compound');

await desktop.evaluate(() => {
  const ls = globalThis.__ls;
  ls.world('silo');
  ls.simulate(120);
  ls.freecam(10.5, 32.5, 10.5, 0, 25.5, 0, 68);
});
await save(desktop, '05-silo-top-landing');

// A close, narrow view proves the upper landing really opens onto the last
// treads without asking SwiftShader to draw all 126 homes through the well.
await desktop.setViewportSize({ width: 960, height: 540 });
await desktop.evaluate(() => {
  const ls = globalThis.__ls;
  ls.world('silo');
  ls.simulate(90);
  ls.freecam(1.8, 9.2, -1.8, 8.7, 7.7, 0, 54);
});
await save(desktop, '06-silo-stair-and-landings');

await desktop.evaluate(() => {
  const ls = globalThis.__ls;
  ls.world('silo');
  ls.simulate(90);
  ls.freecam(15.2, 1.72, 0, 25.2, 1.55, 0, 62);
});
await save(desktop, '07-silo-home');

await stopDesktopPump();
await desktop.close();

const mobile = await browser.newPage({
  viewport: { width: 844, height: 390 },
  hasTouch: true,
  isMobile: true,
});
mobile.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text().slice(0, 240));
});
mobile.on('pageerror', (error) => errors.push(String(error).slice(0, 240)));
const stopMobilePump = await pumpFrames(mobile);
await boot(mobile, 'mobile');
const mobileOverlap = await mobile.evaluate(() => {
  const help = document.getElementById('helpBtn').getBoundingClientRect();
  const stats = document.getElementById('stats').getBoundingClientRect();
  return Math.max(0, Math.min(help.right, stats.right) - Math.max(help.left, stats.left)) *
    Math.max(0, Math.min(help.bottom, stats.bottom) - Math.max(help.top, stats.top));
});
if (mobileOverlap > 0) throw new Error(`mobile help button overlaps survival stats by ${mobileOverlap}px²`);
await save(mobile, '08-mobile-landscape');
await stopMobilePump();
await mobile.close();

await browser.close();

if (errors.length) {
  console.error('VISUAL ERRORS:', [...new Set(errors)].slice(0, 12).join(' | '));
  process.exitCode = 1;
}

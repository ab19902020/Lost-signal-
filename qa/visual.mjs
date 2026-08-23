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
  const shot = await page.screenshot({ path, type: 'jpeg', quality: 92, timeout: 180000 });
  console.log(`visual: ${path}`);
  return shot;
}

// A screenshot job that only proves a file exists can happily approve an
// image taken from inside a wall. Measure the exact JPEG that gets uploaded so
// a black frame or a room clipped to white fails CI with a useful number.
async function imageMetrics(page, shot) {
  return page.evaluate(async (encoded) => {
    const image = new Image();
    image.src = `data:image/jpeg;base64,${encoded}`;
    await image.decode();
    const probe = document.createElement('canvas');
    probe.width = 96;
    probe.height = 54;
    const context = probe.getContext('2d', { willReadFrequently: true });
    context.drawImage(image, 0, 0, probe.width, probe.height);
    const pixels = context.getImageData(0, 0, probe.width, probe.height).data;
    let total = 0;
    let dark = 0;
    let bright = 0;
    const count = pixels.length / 4;
    for (let i = 0; i < pixels.length; i += 4) {
      const luma = (pixels[i] * 0.2126 + pixels[i + 1] * 0.7152 + pixels[i + 2] * 0.0722) / 255;
      total += luma;
      if (luma <= 0.05) dark++;
      if (luma >= 0.90) bright++;
    }
    return { mean: total / count, dark: dark / count, bright: bright / count };
  }, shot.toString('base64'));
}

const visualErrors = [];
async function saveChecked(page, name, limits = {}) {
  const shot = await save(page, name);
  const metrics = await imageMetrics(page, shot);
  const report = Object.entries(metrics).map(([key, value]) => `${key}=${value.toFixed(3)}`).join(' ');
  console.log(`visual metrics ${name}: ${report}`);
  const checks = [
    ['mean', 'min', limits.minMean],
    ['mean', 'max', limits.maxMean],
    ['dark', 'max', limits.maxDark],
    ['bright', 'max', limits.maxBright],
  ];
  for (const [metric, direction, limit] of checks) {
    if (limit == null) continue;
    const failed = direction === 'min' ? metrics[metric] < limit : metrics[metric] > limit;
    if (failed) {
      visualErrors.push(`${name} ${metric} ${metrics[metric].toFixed(3)} ` +
        `${direction === 'min' ? '<' : '>'} ${limit.toFixed(3)}`);
    }
  }
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
await saveChecked(desktop, '01-bunker-player-view', { minMean: 0.10, maxBright: 0.07 });

await desktop.evaluate(() => {
  const ls = globalThis.__ls;
  ls.world('bunker');
  ls.simulate(30);
  ls.freecam(-5.6, 2.45, 5.7, 1.2, 1.2, -2.8, 66);
});
await saveChecked(desktop, '02-bunker-overview', { minMean: 0.12, maxBright: 0.07 });

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
await saveChecked(desktop, '03-open-silo-hatch', { minMean: 0.09, maxBright: 0.07 });

await desktop.evaluate(() => {
  const ls = globalThis.__ls;
  ls.world('outside');
  ls.simulate(90);
  ls.freecam(-17, 8.5, 13.5, 0, 1.1, -8, 62);
});
await saveChecked(desktop, '04-surface-compound', { minMean: 0.075, maxDark: 0.68 });

// The joined habitation rings are intentionally broad draw calls. A compact
// target and a finite review depth keep this shot representative of the top
// three landings without making CI rasterise the entire shaft in software.
await desktop.setViewportSize({ width: 800, height: 450 });
await desktop.evaluate(() => {
  const ls = globalThis.__ls;
  ls.world('silo');
  ls.simulate(120);
  // This proof image reviews the three upper connections, not the entire
  // seven-storey population. Keep the continuous shell for context but cull
  // placed content below level six; otherwise SwiftShader spends minutes
  // rasterising homes that sit behind the camera's far plane.
  const shellMesh = ls.game.silo.getObjectByName('HabShell');
  let shellRoot = shellMesh;
  while (shellRoot?.parent && shellRoot.parent !== ls.game.silo) shellRoot = shellRoot.parent;
  for (const child of ls.game.silo.children) {
    if (child === shellRoot || child === ls.game.camera || child.isLight || child.position.y >= 19.5) continue;
    child.visible = false;
  }
  // The crown slab spans y=32.0..33.1. The former y=32.5 camera was embedded
  // inside that concrete after the crown asset was added, producing a nearly
  // black image while the build still passed. This sits below the slab, over
  // the top gallery, and looks through the playable shaft volume. It also sits
  // just inside the well railing; from the walkway the nearest balustrade hid
  // almost half of the stair connection this image exists to review.
  ls.freecam(8.5, 30.1, 8.5, 0, 23.0, 0, 68);
  ls.game.camera.near = .12;
  ls.game.camera.far = 22;
  ls.game.camera.updateProjectionMatrix();
});
await saveChecked(desktop, '05-silo-stair-and-landings', { minMean: 0.055, maxDark: 0.82 });

// The wide shaft view above shows the stair/landing relationship. A second
// mid-well angle makes SwiftShader draw every joined level at once and can take
// minutes per frame, so the remaining silo view moves close to one home.
await desktop.setViewportSize({ width: 640, height: 360 });
await desktop.evaluate(() => {
  const ls = globalThis.__ls;
  ls.world('silo');
  ls.simulate(90);
  const home = ls.game.siloWorld.homes
    .filter((candidate) => Math.abs(candidate.position.y) < .1)
    .sort((a, b) => (Math.abs(a.position.z) + Math.abs(a.position.x - 24.6)) -
      (Math.abs(b.position.z) + Math.abs(b.position.x - 24.6)))[0];
  if (!home) throw new Error('no level-one home available for visual QA');
  home.visible = true;

  // Review the authored apartment itself. The gallery/stair shot already
  // covers the full environment; hiding unrelated rings here prevents a view
  // through the doorway from paying to draw the other 125 homes.
  for (const child of ls.game.silo.children) {
    if (child.isPointLight) {
      child.visible = child.position.y < 4.2 && child.position.x > 14 && Math.abs(child.position.z) < 9;
      continue;
    }
    if (child === home || child === ls.game.camera || child.isAmbientLight ||
        child.isHemisphereLight || child.isDirectionalLight) continue;
    child.visible = false;
  }
  // Bay zero rotates the apartment's local +X axis toward world -Z. Offset
  // onto the living-room portal instead of staring into the partition between
  // the kitchen and living openings.
  ls.freecam(20.35, 1.65, -1.95, 28.2, 1.45, -1.95, 58);
  ls.game.camera.far = 18;
  ls.game.camera.updateProjectionMatrix();
});
await saveChecked(desktop, '06-silo-home', { maxMean: 0.5, maxBright: 0.055 });

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
await saveChecked(mobile, '07-mobile-landscape', { minMean: 0.09, maxBright: 0.07 });
await stopMobilePump();
await mobile.close();

await browser.close();

if (errors.length || visualErrors.length) {
  console.error('VISUAL ERRORS:', [...new Set([...errors, ...visualErrors])].slice(0, 20).join(' | '));
  process.exitCode = 1;
}

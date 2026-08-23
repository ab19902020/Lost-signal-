import { chromium } from 'playwright';

// Exercises what a screenshot cannot show: that the rifle downs game on the
// surface, that a kill collapses rather than snapping to a right angle, and
// that the silo is populated with residents who answer when spoken to.
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
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
         '--disable-background-timer-throttling', '--disable-renderer-backgrounding'],
});
const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
const errors = [];
page.on('pageerror', e => errors.push(String(e).slice(0, 200)));
const stopPump = await pumpFrames(page);
await page.goto(process.argv[2], { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => {
  const b = document.getElementById('start');
  return b && !b.disabled;
}, null, { timeout: 60000, polling: 100 });
await page.evaluate(() => document.getElementById('start').click());
await page.waitForTimeout(400);
await page.waitForFunction(() => globalThis.__ls?.debug?.().started === true, null,
  { timeout: 30000, polling: 100 });

const results = await page.evaluate(async () => {
  const ls = globalThis.__ls;
  const out = {};

  ls.world('outside');
  ls.arm();
  ls.simulate(10);

  // A deer should take more than one round; a hare should take one.
  const deer = ls.game.wildlife.find(w => w.userData.kind === 'deer' && w.userData.alive !== false);
  out.foundDeer = !!deer;
  if (deer) {
    let shots = 0;
    const mark = { x: ls.body.position.x, z: ls.body.position.z - 6 };
    while (deer.userData.alive !== false && shots < 4) {
      deer.position.set(mark.x, 0, mark.z);
      // aimAt only sets yaw/pitch; the camera picks them up on the next
      // simulated frame, so the shot has to come after one.
      ls.aimAt({ x: mark.x, y: 1.0, z: mark.z });
      ls.simulate(1);
      deer.position.set(mark.x, 0, mark.z);
      ls.fire();
      shots++;
      ls.simulate(4);
    }
    out.deerShots = shots;
    out.deerDown = deer.userData.alive === false;
    ls.simulate(60);
    out.collapsedRoll = +deer.rotation.z.toFixed(2);
  }

  const hare = ls.game.wildlife.find(w => w.userData.kind === 'rabbit' && w.userData.alive !== false);
  if (hare) {
    ls.arm();
    let shots = 0;
    const mark = { x: ls.body.position.x, z: ls.body.position.z - 4 };
    while (hare.userData.alive !== false && shots < 6) {
      hare.position.set(mark.x, 0, mark.z);
      // Aim at the animal's actual centre rather than a guessed height: a hare
      // is twenty centimetres wide and the guess made the check flaky.
      hare.updateWorldMatrix(true, true);
      const bounds = ls.bounds(hare);
      ls.aimAt({ x: mark.x, y: (bounds.min.y + bounds.max.y) / 2, z: mark.z });
      ls.simulate(1);
      hare.position.set(mark.x, 0, mark.z);
      ls.fire();
      shots++;
      ls.simulate(4);
    }
    out.hareDown = hare.userData.alive === false;
    out.hareDebug = {
      pos: [+hare.position.x.toFixed(2), +hare.position.y.toFixed(2), +hare.position.z.toFixed(2)],
      player: [+ls.body.position.x.toFixed(2), +ls.body.position.z.toFixed(2)],
      parented: !!hare.parent,
    };
  }

  // The silo: residents should be walking their galleries, and standing next to
  // one should offer something to say.
  ls.world('silo');
  ls.simulate(30);
  const residents = ls.game.residents?.residents || [];
  out.residents = residents.length;
  if (residents.length) {
    const before = residents.map(r => ({ x: r.position.x, z: r.position.z }));
    ls.simulate(600);
    out.residentsMoved = residents.filter((r, i) =>
      Math.hypot(r.position.x - before[i].x, r.position.z - before[i].z) > 0.4).length;
    out.residentLevels = new Set(residents.map(r => Math.round(r.position.y))).size;
    out.residentLines = residents.filter(r => (r.userData.resident?.line || '').length > 10).length;
    const residentRadii = residents.map(r => Math.hypot(r.position.x, r.position.z));
    out.residentsOffGallery = residentRadii.filter(radius => radius < 13.2 || radius > 19.4).length;
    out.residentRadiusRange = [
      +Math.min(...residentRadii).toFixed(2),
      +Math.max(...residentRadii).toFixed(2),
    ];

    // Standing next to one should raise the prompt to speak.
    const target = residents[0];
    ls.body.teleport(target.position.x + 0.9, target.position.y, target.position.z);
    ls.simulate(1);
    ls.aimAt({ x: target.position.x, y: target.position.y + 1, z: target.position.z });
    ls.simulate(3);
    const prompt = document.getElementById('prompt');
    out.speakPrompt = (prompt.textContent || '').includes('RESIDENT');
    out.promptDebug = {
      text: prompt.textContent,
      on: prompt.classList.contains('on'),
      distance: +target.position.distanceTo(ls.game.player.position).toFixed(2),
      playerY: +ls.body.position.y.toFixed(2),
      targetY: +target.position.y.toFixed(2),
    };
  }
  out.ammoAfter = ls.state().ammo;
  return out;
});

console.log(JSON.stringify(results, null, 1));
if (errors.length) console.error('ERRORS:', [...new Set(errors)].join(' | '));
await stopPump();
await browser.close();

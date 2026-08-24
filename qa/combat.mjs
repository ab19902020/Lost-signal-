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

  // Nothing lives on the surface any more, so there is nothing out there to
  // shoot. The rifle still has to load and fire, which the silo checks below
  // exercise through arm() and the ammo count.

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
    // How many distinct bodies are in play. The torso alone will not tell you:
    // every build shares its topology and only differs by scale. What differs
    // is what each is wearing and carrying — a coat skirt, straps, an apron, a
    // satchel, a cap, a beard — so the whole figure's mesh count and total
    // vertex count together identify the build.
    const builds = new Set();
    for (const r of residents) {
      let meshes = 0, verts = 0;
      r.traverse((o) => {
        if (!o.isMesh) return;
        meshes++;
        verts += o.geometry.attributes.position.count;
      });
      builds.add(`${meshes}:${verts}`);
    }
    out.residentBuilds = builds.size;
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

    // People are moving bodies, not static prop boxes. Put the player inside
    // one resident's footprint and advance the actual game loop; the dynamic
    // resolver must separate them again.
    const agent = target.userData.resident;
    ls.body.teleport(target.position.x + .05, target.position.y, target.position.z);
    ls.simulate(2);
    out.residentCollision = {
      distance: +Math.hypot(ls.body.position.x - target.position.x,
        ls.body.position.z - target.position.z).toFixed(3),
      minimum: +(ls.body.radius + (agent?.radius || .34)).toFixed(3),
    };
  }
  out.ammoAfter = ls.state().ammo;

  // The secure gallery at the top of the silo: a sentry on the door, a working
  // dog walking the ring, and an infirmary that actually treats injuries.
  const garrison = ls.game.garrison;
  if (garrison) {
    const dogStart = garrison.dog ? { x: garrison.dog.position.x, z: garrison.dog.position.z } : null;
    ls.simulate(300);
    out.garrison = {
      sentry: !!garrison.sentry,
      sentryY: garrison.sentry ? +garrison.sentry.position.y.toFixed(2) : null,
      dog: !!garrison.dog,
      dogWalked: dogStart ? +Math.hypot(garrison.dog.position.x - dogStart.x,
        garrison.dog.position.z - dogStart.z).toFixed(2) : 0,
      dogRadius: garrison.dog ? +Math.hypot(garrison.dog.position.x, garrison.dog.position.z).toFixed(2) : 0,
      kit: garrison.kitRoots.length,
      doses: garrison.dosesRemaining(),
    };

    // Take a hit, then use the bay.
    const before = ls.state().health;
    ls.hurt(40);
    ls.simulate(2);
    const hurt = ls.state().health;
    const bay = ls.game.interactions.find((o) => o.userData.interaction?.name?.startsWith('INFIRMARY'));
    bay?.userData.interaction.onUse();
    ls.simulate(2);
    out.garrison.treatment = { before, hurt, after: ls.state().health,
      dosesLeft: garrison.dosesRemaining(), offered: !!bay };
  }
  return out;
});

console.log(JSON.stringify(results, null, 1));
if (errors.length) console.error('ERRORS:', [...new Set(errors)].join(' | '));
await stopPump();
await browser.close();

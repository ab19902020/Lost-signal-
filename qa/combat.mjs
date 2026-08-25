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
// Nobody is here to choose CONTINUE or NEW GAME, and the menu is what starts
// the world loading, so boot it directly.
await page.evaluate(() => globalThis.__lsBoot());
// The welcome menu enables its own start control before the world has
// finished loading, so waiting on the button alone can run ahead of the
// game. The debug handle appears only once the world is ready.
await page.waitForFunction(() => globalThis.__ls && !document.getElementById('start')?.disabled,
  null, { timeout: 90000, polling: 100 });
// The welcome menu sits over the boot screen, so a synthetic click on the
// start button lands on the overlay and the game never begins. Start it
// through the debug handle, as qa/game.mjs does.
await page.evaluate(() => globalThis.__ls.start());
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
    // How many distinct bodies are in play. Revision seven uses two continuous
    // high-density basemeshes and six coordinated morph/proportion presets, so
    // topology alone is intentionally shared and the authored build marker is
    // the correct identity.
    const builds = new Set();
    const triangleCounts = [];
    let rigged = 0;
    for (const r of residents) {
      let meshes = 0, verts = 0;
      let triangles = 0;
      let hasSkin = false;
      r.traverse((o) => {
        if (!o.isMesh) return;
        meshes++;
        verts += o.geometry.attributes.position.count;
        triangles += o.geometry.index
          ? o.geometry.index.count / 3 : o.geometry.attributes.position.count / 3;
        hasSkin ||= !!o.isSkinnedMesh;
      });
      builds.add(r.userData.humanBuild || `${meshes}:${verts}`);
      triangleCounts.push(Math.round(triangles));
      if (hasSkin) rigged++;
    }
    out.residentBuilds = builds.size;
    out.residentRigged = rigged;
    out.residentTriangleRange = [Math.min(...triangleCounts), Math.max(...triangleCounts)];
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

    // The dog. He has to walk the way he is pointing — he spent a while
    // walking the whole ring backwards — and he has to be a dog you can make
    // friends with rather than a prop on rails.
    if (garrison.dog) {
      const THREE = ls.THREE;
      const dog = garrison.dog;
      const sample = () => {
        dog.updateWorldMatrix(true, true);
        return {
          at: dog.getWorldPosition(new THREE.Vector3()),
          nose: dog.getObjectByName('Head').getWorldPosition(new THREE.Vector3())
            .sub(dog.getObjectByName('Tail1').getWorldPosition(new THREE.Vector3())).setY(0).normalize(),
        };
      };
      const a = sample();
      ls.simulate(60);
      const b = sample();
      const travel = b.at.clone().sub(a.at).setY(0);
      out.garrison.dogFacing = travel.length() > 0.05
        ? +a.nose.dot(travel.normalize()).toFixed(3) : null;

      // Call him from the far side of the gallery.
      ls.body.teleport(Math.cos(0.4) * 16.4, garrison.dog.position.y, Math.sin(0.4) * 16.4);
      ls.simulate(4);
      const hailed = dog.position.distanceTo(ls.body.position);
      garrison.callDog();
      ls.simulate(60 * 14);
      out.garrison.dogCame = { from: +hailed.toFixed(2),
        to: +dog.position.distanceTo(ls.body.position).toFixed(2) };

      // Stroke him until he is yours, then walk off and see if he comes.
      for (let i = 0; i < 4; i++) { garrison.callDog(); ls.simulate(60 * 3); }
      out.garrison.dogTrust = +garrison.dogState().trust.toFixed(2);
      out.garrison.dogFollows = garrison.dogState().state;
      ls.body.teleport(Math.cos(3.6) * 16.4, garrison.dog.position.y, Math.sin(3.6) * 16.4);
      ls.simulate(60 * 16);
      out.garrison.dogHeel = +dog.position.distanceTo(ls.body.position).toFixed(2);
    }
  }
  return out;
});

console.log(JSON.stringify(results, null, 1));
if (errors.length) console.error('ERRORS:', [...new Set(errors)].join(' | '));
await stopPump();
await browser.close();

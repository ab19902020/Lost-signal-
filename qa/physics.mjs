import { chromium } from 'playwright';

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
const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
const errors = [];
page.on('pageerror', e => errors.push(String(e).slice(0, 160)));
const stopPump = await pumpFrames(page);
await page.goto(process.argv[2], { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => { const b = document.getElementById('start'); return b && !b.disabled; }, null, { timeout: 60000, polling: 100 });
await page.evaluate(() => document.getElementById('start').click());
await page.waitForTimeout(800);
await page.waitForFunction(() => globalThis.__ls?.debug?.().started === true, null,
  { timeout: 30000, polling: 100 });

const setup = (x, z, yaw) => page.evaluate(([x, z, yaw]) => {
  globalThis.__ls.moveTo(x, z);
  globalThis.__ls.look(yaw, 0);
}, [x, z, yaw]);
const read = () => page.evaluate(() => {
  const b = globalThis.__ls.body;
  return { x: +b.position.x.toFixed(2), y: +b.position.y.toFixed(2), z: +b.position.z.toFixed(2),
           eye: +b.eyeHeight.toFixed(2), grounded: b.grounded };
});
// Headless Chromium does not run requestAnimationFrame on an idle page, so
// the simulation is advanced directly at a fixed timestep instead of waiting
// on the browser's frame clock.
const frames = (count) => page.evaluate((n) => globalThis.__ls.simulate(n), count);
const walk = async (count, keys = ['KeyW']) => {
  for (const k of keys) await page.keyboard.down(k);
  await frames(count);
  for (const k of keys) await page.keyboard.up(k);
  await frames(4);
};

const results = {};

// Walk into the shelter's back wall: the capsule must stop short of it.
await setup(0, 5.6, Math.PI);
await frames(2);
await walk(90);
results.backWall = await read();

// Walk into the storage rack standing against the east wall.
await setup(3.6, 1.45, -Math.PI / 2);
await frames(2);
await walk(90);
results.storageRack = await read();

// Sprint down the open middle of the room, then crouch under the desk line.
await setup(0, 5.5, Math.PI);
await frames(2);
await walk(45, ['KeyW', 'ShiftLeft']);
results.sprint = await read();
await walk(30, ['ControlLeft']);
results.crouch = await read();
await frames(30);
results.standBackUp = await read();

// The silo is the one place the player stands on authored collision rather
// than the ground plane, so it gets its own checks.
results.silo = await page.evaluate(async () => {
  const ls = globalThis.__ls;
  if (!ls.game.siloWorld) return { present: false };
  const settle = (frames) => ls.simulate(frames);

  ls.world('silo');
  settle(20);
  const arrival = { y: +ls.body.position.y.toFixed(2), grounded: ls.body.grounded };

  // Walk down the stair. This is the check that the great stair is a stair:
  // step onto the head of the flight and hold forward along the helix, and the
  // player should end up a level or more below, still on their feet.
  const head = ls.game.siloWorld;
  ls.body.teleport(0, arrival.y, -(head.stairRadius + head.stairColumn) / 2);
  settle(10);
  const stairTop = +ls.body.position.y.toFixed(2);
  let stairSteps = 0;
  for (let i = 0; i < 260; i++) {
    // Follow the helix: face along the tangent at wherever the player now is.
    const p = ls.body.position;
    ls.look(Math.atan2(-p.z, p.x), 0);   // clockwise: the direction the helix descends
    ls.walkFrames(4);
    if (ls.body.grounded) stairSteps++;
  }
  settle(20);   // let the last step land before reading
  const stairFoot = { y: +ls.body.position.y.toFixed(2), grounded: ls.body.grounded,
                      radius: +Math.hypot(ls.body.position.x, ls.body.position.z).toFixed(2),
                      groundedFrames: stairSteps };

  // Walk off the stair, across the landing, onto the floor. This is the join
  // the whole silo hangs on: the flight discharges at bay 0 on every level,
  // through a gap in its balustrade and a gap in the gallery railing.
  ls.world('silo');
  settle(20);
  const floorY = head.levelHeight * 3;
  ls.body.teleport((head.stairColumn + head.stairRadius) / 2, floorY + 0.4, 0);
  settle(20);
  const offStart = { y: +ls.body.position.y.toFixed(2),
                     radius: +Math.hypot(ls.body.position.x, ls.body.position.z).toFixed(2) };
  ls.look(-Math.PI / 2, 0);        // face straight out along the landing
  ls.walkFrames(420);
  settle(20);
  const ontoFloor = { y: +ls.body.position.y.toFixed(2), grounded: ls.body.grounded,
                      radius: +Math.hypot(ls.body.position.x, ls.body.position.z).toFixed(2) };

  // Step into the light well: the player should fall the full height of the
  // shaft and land at the bottom. The drop point is the open ring between the
  // great stair and the galleries, a quarter turn off the landings, which all
  // stack on the same bearing.
  ls.world('silo');
  settle(20);
  ls.body.teleport(0, ls.body.position.y, 9.0);
  settle(900);
  const overCentre = { y: +ls.body.position.y.toFixed(2), grounded: ls.body.grounded };

  return {
    present: true,
    arrival,
    stairTop,
    stairFoot,
    offStart,
    ontoFloor,
    overCentre,
    colliders: ls.game.colliders.silo.boxes.length,
    interactions: ls.game.interactions.filter(o => o.userData.interaction?.world === 'silo').length,
  };
});

// A 1x1 map means a texture failed to load and three substituted a placeholder.
results.textures = await page.evaluate(() => {
  const seen = [];
  globalThis.__ls.game.bunker.traverse((o) => {
    if (!o.isMesh) return;
    for (const m of (Array.isArray(o.material) ? o.material : [o.material])) {
      if (!m?.map || seen.some(e => e.material === m.name)) continue;
      seen.push({ material: m.name, size: `${m.map.image?.width}x${m.map.image?.height}` });
    }
  });
  return seen;
});

results.world = await page.evaluate(() => ({
  wildlife: globalThis.__ls.game.wildlife.length,
  residents: globalThis.__ls.game.residents?.residents.length ?? 0,
  bunkerColliders: globalThis.__ls.game.colliders.bunker.boxes.length,
  outsideColliders: globalThis.__ls.game.colliders.outside.boxes.length,
  siloColliders: globalThis.__ls.game.colliders.silo.boxes.length,
}));

console.log(JSON.stringify(results, null, 1));
if (errors.length) console.error('ERRORS:', [...new Set(errors)].join(' | '));
await stopPump();
await browser.close();

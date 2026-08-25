import { chromium } from 'playwright';
import { WEAPONS, USABLE_WEAPON_KEYS } from '../src/weapons.js';

// Takes every weapon in the armoury down off its rack and uses it.
//
// The room shipped with twenty-five models on the walls and exactly one of them
// working, so the check that matters is the boring one: for each of the
// twenty-two usable weapons, does the viewmodel swap, does a round leave the
// magazine, does a shot mark the wall it hit, and does a reload put the rounds
// back? Then, once, that shooting a person actually puts them on the deck.

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

const results = await page.evaluate(async ({ keys, catalogue }) => {
  const ls = globalThis.__ls;
  const THREE = ls.THREE;
  const out = { racked: [], fired: [], sameModel: [], backwards: [], rolled: [], stubby: [], lengths: [], noDecal: [],
    badReload: [], names: [] };

  // --- the racks: every usable model has to be a real interaction ----------
  const armory = ls.game.armory;
  const interactions = ls.game.interactions
    .filter((o) => o.userData.interaction?.world === 'bunker')
    .map((o) => o.userData.interaction.name);
  out.takeInteractions = interactions.filter((name) => name.startsWith('TAKE ')).length;
  out.inspectInteractions = interactions.filter((name) => name.startsWith('INSPECT ')).length;

  // Taking one off the wall while the door is shut must not hand it over.
  const lockedTake = armory.displayByKey.get('armoryRevolver01');
  lockedTake?.userData.interaction?.onUse();
  out.issuedThroughShutDoor = !!armory.equippedKey();
  armory.open();
  ls.simulate(60);

  // --- every weapon, in turn ----------------------------------------------
  ls.world('bunker');
  ls.simulate(10);
  for (const key of keys) {
    const spec = catalogue[key];
    armory.displayByKey.get(key)?.userData.interaction?.onUse();
    ls.simulate(4);
    const state = ls.weapon();
    out.names.push(state.name);
    if (state.key !== key) { out.racked.push(`${key}: equipped ${state.key}`); continue; }
    if (armory.displayByKey.get(key)?.visible) out.racked.push(`${key}: still on its rack`);
    if (!state.model || !state.model.includes(key)) {
      out.sameModel.push(`${key}: viewmodel is ${state.model}`);
    }

    // Which way the barrel is actually pointing.
    //
    // Every firearm is back-heavy — stock, grip, magazine and action all sit
    // behind the barrel — so a weapon held correctly has its centre of mass
    // behind the middle of its own bounding box along the firing line. This is
    // measured in the viewmodel rig's frame, where forward is always -Z,
    // rather than in world space where it would depend on which way the player
    // happened to be facing. Negative means looking down your own muzzle.
    const model = ls.game.weaponAction.children.find((c) => c.name.startsWith('Equipped_'));
    if (model) {
      const rig = ls.game.weaponAction;
      rig.updateMatrixWorld(true);
      const toRig = rig.matrixWorld.clone().invert();
      const v = new THREE.Vector3();
      const box = new THREE.Box3();
      let n = 0;
      let sum = 0;
      model.traverse((o) => {
        const attr = o.geometry?.attributes?.position;
        if (!attr) return;
        const toLocal = toRig.clone().multiply(o.matrixWorld);
        const step = Math.max(1, Math.floor(attr.count / 400));
        for (let i = 0; i < attr.count; i++) {
          v.fromBufferAttribute(attr, i).applyMatrix4(toLocal);
          box.expandByPoint(v);
          if (i % step === 0) { sum += v.z; n++; }
        }
      });
      const size = box.getSize(new THREE.Vector3());
      const centre = box.getCenter(new THREE.Vector3());
      const bias = n ? (sum / n - centre.z) / Math.max(size.z, 1e-4) : 0;
      // Below a couple of per cent the model is symmetric enough that the sign
      // means nothing; only a clear lean the wrong way is a fault.
      if (bias < -0.02) out.backwards.push(`${key}: ${bias.toFixed(3)}`);

      // Held the way a weapon is held: longest down the firing line, and
      // taller than it is wide. Wider than tall means it is lying on its side,
      // which is how the combat knife was carried for three releases.
      if (size.x > size.y * 1.15) {
        out.rolled.push(`${key}: ${size.x.toFixed(2)}w x ${size.y.toFixed(2)}h`);
      }
      if (size.z < Math.max(size.x, size.y)) {
        out.stubby.push(`${key}: ${size.z.toFixed(2)} long vs ${Math.max(size.x, size.y).toFixed(2)}`);
      }
      // ...and the same size as everything else in its class, so a Mossberg is
      // not carried at two fifths the size of the other shotguns.
      out.lengths.push([key, +size.z.toFixed(3)]);
    }

    // Point at the shelter's back wall and pull the trigger.
    ls.moveTo(0, 0);
    ls.look(Math.PI, 0);
    ls.simulate(4);
    const before = ls.weapon();
    const marksBefore = ls.marks();
    ls.fire();
    ls.simulate(4);
    const after = ls.weapon();
    // More rounds, each well after the slowest action in the collection has
    // cycled. Hip spread is wide enough that a shot can legitimately go out
    // through the armoury doorway and hit nothing at all — the snub revolver
    // threw two in a row past it and failed a run — so keep firing until one
    // of them marks the wall, or four have missed it.
    for (let round = 1; round < 4 && ls.marks() <= marksBefore; round++) {
      ls.simulate(100);
      ls.fire();
      ls.simulate(6);
    }
    if (spec.kind === 'melee') {
      if (after.ammo !== 0) out.fired.push(`${key}: a blade consumed ammunition`);
    } else if (after.ammo !== before.ammo - 1) {
      out.fired.push(`${key}: magazine went ${before.ammo} -> ${after.ammo}`);
      continue;
    }
    if (spec.kind !== 'melee' && ls.marks() <= marksBefore) out.noDecal.push(key);

    // ...and put the rounds back.
    if (spec.kind !== 'melee') {
      ls.reload();
      ls.simulate(Math.ceil((spec.reloadTime + 0.4) * 60));
      const reloaded = ls.weapon();
      if (reloaded.ammo !== spec.magazine) {
        out.badReload.push(`${key}: reloaded to ${reloaded.ammo}/${spec.magazine}`);
      }
    }
  }
  out.distinctNames = new Set(out.names).size;

  // Automatic fire: holding the trigger on an automatic empties it, and does
  // not on a revolver.
  ls.arm('armorySmg01');
  ls.hold(true);
  ls.simulate(60);
  const autoLeft = ls.weapon().ammo;
  ls.hold(false);
  ls.arm('armoryRevolver01');
  ls.hold(true);
  ls.simulate(60);
  const semiLeft = ls.weapon().ammo;
  ls.hold(false);
  out.automatic = {
    autoLeft, autoMagazine: catalogue.armorySmg01.magazine,
    semiLeft, semiMagazine: catalogue.armoryRevolver01.magazine,
  };

  // --- shooting a person ---------------------------------------------------
  ls.world('silo');
  ls.simulate(30);
  const residents = ls.game.residents.residents;
  const victim = residents[0];
  const startY = victim.position.y;
  ls.arm('armoryShotgun01');
  // Stay on them: the gallery empties after the first shot, so re-close the
  // range and re-aim each time rather than firing at where they used to be.
  for (let shot = 0; shot < 6 && victim.userData.alive !== false; shot++) {
    ls.body.teleport(victim.position.x + 2.2, victim.position.y, victim.position.z);
    ls.simulate(2);
    ls.aimAt({ x: victim.position.x, y: victim.position.y + 1.1, z: victim.position.z });
    ls.simulate(2);
    ls.fire();
    ls.simulate(45);   // longer than the slowest action in the collection
  }
  ls.simulate(120);
  out.person = {
    down: victim.userData.alive === false,
    tipped: +Math.abs(victim.rotation.z).toFixed(2),
    // A body that goes down on an upper gallery has to stay on that gallery.
    startY: +startY.toFixed(2),
    endY: +victim.position.y.toFixed(2),
    // ...and the neighbours do not stand there watching.
    fleeing: residents.filter((r) => (r.userData.resident?.panic ?? 0) > 0).length,
  };

  // The quartermaster is a person too.
  ls.world('bunker');
  ls.simulate(10);
  const eli = ls.game.armory.quartermaster;
  ls.arm('armoryRevolver03');
  for (let shot = 0; shot < 5 && eli.userData.alive !== false; shot++) {
    ls.body.teleport(eli.position.x, 0, eli.position.z - 1.6);
    ls.simulate(2);
    ls.aimAt({ x: eli.position.x, y: eli.position.y + 1.2, z: eli.position.z });
    ls.simulate(2);
    ls.fire();
    ls.simulate(45);
  }
  ls.simulate(90);
  out.quartermaster = {
    down: eli.userData.alive === false,
    tipped: +Math.abs(eli.rotation.z).toFixed(2),
  };
  out.marks = ls.marks();
  out.liveMarks = ls.decals();
  return out;
}, {
  keys: USABLE_WEAPON_KEYS,
  catalogue: Object.fromEntries(USABLE_WEAPON_KEYS.map((key) => [key, {
    kind: WEAPONS[key].kind,
    magazine: WEAPONS[key].magazine,
    reloadTime: WEAPONS[key].reloadTime,
  }])),
});

// What each gun actually sounds like. The harness cannot listen, so every
// weapon's shot is rendered offline and measured: a real report has a peak in
// the first few milliseconds, carries energy, and rings for as long as the room
// it was fired in. Two guns that measure identically are two guns that sound
// identical.
results.audio = await page.evaluate(async (keys) => {
  const ls = globalThis.__ls;
  const readings = {};
  for (const key of keys) readings[key] = await ls.renderShot(key, 'bunker');
  // The same rifle in all three spaces, to prove the room is doing something.
  // Three seconds, so the silo's tail is not clipped by the render window.
  readings.__spaces = {
    bunker: await ls.renderShot(keys[0], 'bunker', 3.2),
    silo: await ls.renderShot(keys[0], 'silo', 3.2),
    outside: await ls.renderShot(keys[0], 'outside', 3.2),
  };
  return readings;
}, USABLE_WEAPON_KEYS);

results.expected = USABLE_WEAPON_KEYS.length;
console.log(JSON.stringify(results, null, 1));
if (errors.length) console.error('ERRORS:', [...new Set(errors)].join(' | '));
await stopPump();
await browser.close();

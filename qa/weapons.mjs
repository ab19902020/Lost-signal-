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
await page.waitForFunction(() => {
  const b = document.getElementById('start');
  return b && !b.disabled;
}, null, { timeout: 60000, polling: 100 });
await page.evaluate(() => document.getElementById('start').click());
await page.waitForTimeout(400);
await page.waitForFunction(() => globalThis.__ls?.debug?.().started === true, null,
  { timeout: 30000, polling: 100 });

const results = await page.evaluate(async ({ keys, catalogue }) => {
  const ls = globalThis.__ls;
  const out = { racked: [], fired: [], sameModel: [], noArms: [], noDecal: [], badReload: [], names: [] };

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
    if (!state.arms) out.noArms.push(key);

    // Point at the shelter's back wall and pull the trigger.
    ls.moveTo(0, 0);
    ls.look(Math.PI, 0);
    ls.simulate(4);
    const before = ls.weapon();
    const marksBefore = ls.marks();
    ls.fire();
    ls.simulate(4);
    const after = ls.weapon();
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

results.expected = USABLE_WEAPON_KEYS.length;
console.log(JSON.stringify(results, null, 1));
if (errors.length) console.error('ERRORS:', [...new Set(errors)].join(' | '));
await stopPump();
await browser.close();

import { chromium } from 'playwright';

// Exercises the systems a screenshot cannot show: that a round actually kills
// an infected, that a kill collapses rather than snapping, and that leaving the
// blast door open eventually lets something into the shelter.
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
         '--disable-background-timer-throttling', '--disable-renderer-backgrounding'],
});
const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
const errors = [];
page.on('pageerror', e => errors.push(String(e).slice(0, 200)));
await page.goto(process.argv[2], { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => {
  const b = document.getElementById('start');
  return b && !b.disabled;
}, null, { timeout: 60000, polling: 100 });
await page.evaluate(() => document.getElementById('start').click());
await page.waitForTimeout(400);

const results = await page.evaluate(async () => {
  const ls = globalThis.__ls;
  const out = {};

  ls.world('outside');
  ls.arm();
  ls.simulate(10);

  // Walk a live infected into range, aim at its chest and shoot it down.
  const zombie = ls.game.zombies.find(z => z.userData.alive !== false);
  out.foundZombie = !!zombie;
  if (zombie) {
    zombie.position.set(ls.body.position.x, 0, ls.body.position.z - 6);
    ls.simulate(1);
    ls.aimAt(zombie.position.clone().setY(1.3));
    ls.simulate(1);
    out.startingHp = zombie.userData.hp;
    let shots = 0;
    while (zombie.userData.alive !== false && shots < 8) {
      ls.fire();
      shots++;
      ls.simulate(6);
    }
    out.shotsToKill = shots;
    out.zombieDown = zombie.userData.alive === false;
    ls.simulate(60);
    out.collapsedRoll = +zombie.rotation.z.toFixed(2);
  }

  // A hare should die to a single round.
  const hare = ls.game.wildlife.find(w => w.userData.kind === 'rabbit' && w.userData.alive !== false);
  if (hare) {
    // A hare bolts the moment the player is close, so re-acquire between
    // shots rather than assuming the first one connects.
    let hareShots = 0;
    while (hare.userData.alive !== false && hareShots < 4) {
      hare.position.set(ls.body.position.x, 0, ls.body.position.z - 4);
      // aimAt only sets yaw/pitch; the camera picks them up on the next
      // simulated frame, so the shot has to come after one.
      ls.aimAt(hare.position.clone().setY(0.20));
      ls.simulate(1);
      ls.fire();
      hareShots++;
      ls.simulate(4);
    }
    out.hareShots = hareShots;
    out.hareDown = hare.userData.alive === false;
  }

  // Open the blast door, go back inside and wait: something should come in.
  ls.world('bunker');
  ls.openDoor();
  out.doorOpen = ls.state().doorOpen;
  for (let i = 0; i < 90 && ls.state().breached === 0; i++) ls.simulate(60, 1 / 60);
  out.breached = ls.state().breached;

  // And it should be able to hurt you once it is inside.
  const intruder = ls.game.creatures.breached[0];
  if (intruder) {
    const before = ls.state().health;
    // Hold it at arm's length for long enough to clear a full attack cycle,
    // whatever phase its cooldown happened to be in when it came through.
    for (let i = 0; i < 6; i++) {
      intruder.root.position.set(ls.body.position.x, 0, ls.body.position.z - 1);
      ls.simulate(60);
    }
    out.intruder = {
      alive: intruder.root.userData.alive,
      state: intruder.state,
      inBunker: intruder.root.parent === ls.game.bunker,
      distance: +Math.hypot(
        intruder.root.position.x - ls.body.position.x,
        intruder.root.position.z - ls.body.position.z).toFixed(2),
    };
    out.healthDropped = ls.state().health < before;
    out.health = ls.state().health;
  }
  out.ammoAfter = ls.state().ammo;
  return out;
});

console.log(JSON.stringify(results, null, 1));
if (errors.length) console.log('ERRORS:', [...new Set(errors)].join(' | '));
await browser.close();

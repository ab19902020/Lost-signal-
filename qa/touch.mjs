// The controls themselves.
//
// Everything else in this project tests what the game does. This tests how you
// tell it to: whether the buttons on the glass and the buttons on a pad can
// actually reach the things they are supposed to reach. That gap is where the
// last round of faults lived — the aeroplane could be boarded on a phone and
// then not flown, because the throttle was on a key a phone does not have.
//
// So the flying test here does not call any debug hook that sets the controls.
// It dispatches pointer events at the on-screen lever and the thumb pad, the
// way a thumb does, and asks whether the aeroplane leaves the ground.
//
// Needs a build with the debug handle left in:
//   NODE_ENV=development npx vite build --mode development --outDir dist-look
//   npx vite preview --port 4175 --outDir dist-look
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';

const [url, outDir] = process.argv.slice(2);
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
    '--disable-background-timer-throttling', '--disable-renderer-backgrounding'],
});
// A phone, as far as the page is concerned: pointer:coarse is what puts the
// on-screen controls on the glass in the first place.
const page = await browser.newPage({
  viewport: { width: 900, height: 500 }, hasTouch: true, isMobile: true,
  deviceScaleFactor: 2,
});
const errors = [];
page.on('pageerror', (e) => errors.push(String(e).slice(0, 220)));
const cdp = await page.context().newCDPSession(page);
cdp.on('Page.screencastFrame', ({ sessionId }) => cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {}));
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 1, maxWidth: 64, maxHeight: 64, everyNthFrame: 1 });

await page.goto(url, { waitUntil: 'load', timeout: 180000 });
// __lsBoot is published while main.js evaluates, which can finish after the
// load event. Waiting for it beats racing it.
await page.waitForFunction(() => typeof globalThis.__lsBoot === 'function', null,
  { timeout: 90000, polling: 50 });
await page.evaluate(() => globalThis.__lsBoot());
await page.waitForFunction(() => globalThis.__ls && !document.getElementById('start')?.disabled,
  null, { timeout: 300000, polling: 200 });
await page.evaluate(() => globalThis.__ls.start());
await page.waitForFunction(() => globalThis.__ls?.debug?.().started === true, null,
  { timeout: 60000, polling: 200 });

const failures = [];
const check = (what, ok, why) => { if (!ok) failures.push(`${what}: ${why}`); };

// --- Is the on-screen kit actually on screen? -------------------------------
const shown = (selector) => page.evaluate((css) => {
  const el = document.querySelector(css);
  if (!el) return null;
  const box = el.getBoundingClientRect();
  return getComputedStyle(el).display !== 'none' && box.width > 0 && box.height > 0;
}, selector);

const onFoot = {
  controls: await shown('#controls'),
  movePad: await shown('#movePad'),
  flyPad: await shown('#flyPad'),
};
check('the on-screen controls are up on a touchscreen', onFoot.controls === true,
  'the #controls layer is not displayed');
check('the flight controls stay hidden on foot', onFoot.flyPad === false,
  'the throttle and pedals are on screen while walking');

// --- Fly it with nothing but fingers ----------------------------------------
//
// Put the player at the aeroplane, board it through the game's own interaction,
// then drive it entirely through pointer events on the on-screen controls.
const boarded = await page.evaluate(() => {
  const ls = globalThis.__ls;
  ls.world('outside');
  ls.simulate(20);
  const plane = ls.game.aircraft?.[0];
  if (!plane) return { missing: true };
  plane.state.position.set(110, 1.36, -180);
  plane.state.velocity.set(0, 0, 0);
  plane.state.quaternion.setFromAxisAngle(new ls.THREE.Vector3(0, 1, 0), -Math.PI / 2);
  ls.simulate(10);
  ls.fly(0);
  ls.simulate(6);
  return { flying: !!ls.flying(), throttle: ls.flying()?.throttle ?? -1 };
});
check('you can get into it', boarded.flying === true, 'boarding failed');

const inTheAir = {
  flyPad: await shown('#flyPad'),
  throttle: await shown('#throttleTrack'),
  rudderL: await shown('#rudderL'),
  brake: await shown('#flyBrake'),
  movePad: await shown('#movePad'),
  fire: await shown('#fire'),
  jump: await shown('#jumpBtn'),
};
check('the throttle lever appears in the air', inTheAir.throttle === true,
  'there is no on-screen throttle while flying');
check('the rudder pedals appear', inTheAir.rudderL === true, 'no rudder on screen');
check('the brakes appear', inTheAir.brake === true, 'no wheel brakes on screen');
check('the stick is still there', inTheAir.movePad === true, 'the thumb pad went away');
check('the walking buttons go away', inTheAir.jump === false,
  'JUMP is still on screen in an aeroplane');

// Drag the throttle lever to the top, with real pointer events.
const lever = await page.evaluate(() => {
  const box = document.getElementById('throttleTrack').getBoundingClientRect();
  return { x: box.left + box.width / 2, top: box.top + 6, bottom: box.bottom - 6 };
});
await page.mouse.move(lever.x, lever.bottom);
await page.mouse.down();
await page.mouse.move(lever.x, lever.top - 24, { steps: 8 });
await page.mouse.up();
await page.evaluate(() => globalThis.__ls.simulate(120));
const opened = await page.evaluate(() => ({
  throttle: +globalThis.__ls.flying().throttle.toFixed(2),
  label: document.getElementById('throttleText').textContent,
}));
check('dragging the lever opens the throttle', opened.throttle > 0.9,
  `the throttle is at ${opened.throttle} after dragging the lever to the stop`);
check('the lever reads back what it set', /100%/.test(opened.label),
  `the lever says "${opened.label}"`);

// Now roll. Nothing below sets a control directly; the throttle is being held
// open by the lever alone.
const roll = await page.evaluate(() => {
  const ls = globalThis.__ls;
  const out = [];
  for (let i = 0; i < 10; i++) {
    ls.simulate(30);
    out.push(+(ls.flying().airspeed * 1.94384).toFixed(1));
  }
  return out;
});
check('it accelerates on the on-screen throttle alone', roll[roll.length - 1] > 45,
  `six seconds at full lever reached ${roll[roll.length - 1]} kts`);

// Ease back on the thumb pad — a drag on the stick, held, the way a thumb does.
const stick = await page.evaluate(() => {
  const box = document.getElementById('movePad').getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2, r: box.height / 2 };
});
await page.mouse.move(stick.x, stick.y);
await page.mouse.down();
await page.mouse.move(stick.x, stick.y + stick.r * 0.62, { steps: 5 });
const climbed = await page.evaluate(() => {
  const ls = globalThis.__ls;
  const out = { pitchInput: 0, altitude: [] };
  for (let i = 0; i < 14; i++) {
    ls.simulate(30);
    out.altitude.push(+ls.flying().altitude.toFixed(1));
  }
  out.pitchInput = +(ls.game.mobileMove?.y ?? 0).toFixed(2);
  return out;
});
await page.mouse.up();
check('the thumb pad is the stick in the air', climbed.pitchInput > 0.3,
  `a drag down the pad gave ${climbed.pitchInput} of back stick`);
check('it flies off the on-screen controls', climbed.altitude[climbed.altitude.length - 1] > 30,
  `after seven seconds of back stick it is ${climbed.altitude[climbed.altitude.length - 1]} m up`);

// The pedals and the brakes have to reach the aeroplane too.
const pedals = await page.evaluate(async () => {
  const ls = globalThis.__ls;
  const press = (id, type) => {
    const el = document.getElementById(id);
    const box = el.getBoundingClientRect();
    el.dispatchEvent(new PointerEvent(type, {
      bubbles: true, cancelable: true, pointerId: 7, pointerType: 'touch',
      clientX: box.left + box.width / 2, clientY: box.top + box.height / 2,
    }));
  };
  press('rudderR', 'pointerdown');
  ls.simulate(24);
  const right = ls.game.aircraft[0].state.controls.yaw;
  press('rudderR', 'pointerup');
  press('rudderL', 'pointerdown');
  ls.simulate(30);
  const left = ls.game.aircraft[0].state.controls.yaw;
  press('rudderL', 'pointerup');
  ls.simulate(30);
  const centred = ls.game.aircraft[0].state.controls.yaw;
  press('flyBrake', 'pointerdown');
  ls.simulate(3);
  const braking = ls.flying().input.brake === true;
  press('flyBrake', 'pointerup');
  ls.simulate(3);
  const released = ls.flying().input.brake === true;
  return { right: +right.toFixed(2), left: +left.toFixed(2), centred: +centred.toFixed(2),
    braking, released };
});
check('the right pedal yaws right', pedals.right > 0.2, `right pedal gave ${pedals.right}`);
check('the left pedal yaws left', pedals.left < -0.2, `left pedal gave ${pedals.left}`);
check('letting go centres the rudder', Math.abs(pedals.centred) < 0.2,
  `the rudder stayed at ${pedals.centred} after the pedal was released`);
check('the brake button reaches the wheels', pedals.braking === true,
  'BRAKES did nothing');
check('and lets go', pedals.released === false, 'the brakes stayed on');

// --- Running -----------------------------------------------------------------
const landed = await page.evaluate(() => {
  const ls = globalThis.__ls;
  // Put it down first. leaveAircraft refuses at speed — "bring it to a stop" —
  // so park() on a flying aeroplane quietly does nothing, and everything after
  // it runs from the cockpit with the on-foot controls unreachable. That cost
  // an hour; it is asserted now.
  const plane = ls.game.aircraft[0];
  plane.state.position.set(110, 1.36, -180);
  plane.state.velocity.set(0, 0, 0);
  plane.state.throttle = 0;
  ls.simulate(10);
  ls.park();
  ls.simulate(6);
  return { out: !ls.flying(), flying: ls.debug().flying };
});
check('you can get back out of it', landed.out === true,
  'the aeroplane would not let the player out once stopped');

const running = await page.evaluate(() => {
  const ls = globalThis.__ls;
  ls.world('outside');
  ls.moveTo(-30, -40);
  ls.look(0, 0);
  ls.simulate(20);
  // Latch RUN the way the on-screen button does, then run for a full minute.
  const button = document.getElementById('sprintBtn');
  const box = button.getBoundingClientRect();
  button.dispatchEvent(new PointerEvent('pointerdown', {
    bubbles: true, cancelable: true, pointerId: 3, pointerType: 'touch',
    clientX: box.left + box.width / 2, clientY: box.top + box.height / 2,
  }));
  const samples = [];
  for (let leg = 0; leg < 6; leg++) {
    const from = ls.body.position.clone();
    ls.walkFrames(600, 'KeyW');           // ten seconds a leg, sixty in total
    samples.push(+(ls.body.position.distanceTo(from) / 10).toFixed(2));
  }
  return { legs: samples, stillLatched: document.getElementById('sprintBtn').classList.contains('on') };
});
const first = running.legs[0];
const last = running.legs[running.legs.length - 1];
check('running does not run out', last > first * 0.9,
  `the first ten seconds averaged ${first} m/s and the last ${last} m/s`
  + ` over a minute — ${JSON.stringify(running.legs)}`);
check('the RUN latch is still on after a minute', running.stillLatched === true,
  'the sprint button released itself');

// Aiming while the RUN latch is on has to work, and has to drop the run.
const aimWhileRunning = await page.evaluate(() => {
  const ls = globalThis.__ls;
  ls.arm();
  ls.simulate(6);
  const before = document.getElementById('sprintBtn').classList.contains('on');
  ls.aim(true);
  ls.simulate(4);
  const d = ls.debug();
  return { latchWas: before, aiming: d.aiming, latchNow: d.touchSprint, state: d };
});
check('you can aim with RUN latched on', aimWhileRunning.aiming === true,
  `asking to aim while the run latch was on did nothing — ${JSON.stringify(aimWhileRunning)}`);
check('aiming takes the run off', aimWhileRunning.latchNow === false,
  'the run latch survived aiming, so it would be stuck on for ever');

// --- A pad reaches everything ------------------------------------------------
const pad = await page.evaluate(() => {
  const ls = globalThis.__ls;
  const buttons = Array.from({ length: 18 }, () => ({ pressed: false, touched: false, value: 0 }));
  const fake = {
    id: 'DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)',
    index: 0, connected: true, mapping: 'standard', timestamp: 0,
    axes: [0, 0, 0, 0], buttons,
    vibrationActuator: { playEffect: () => Promise.resolve('complete') },
  };
  const original = navigator.getGamepads?.bind(navigator);
  navigator.getGamepads = () => [fake];
  const B = { cross: 0, circle: 1, square: 2, triangle: 3, l1: 4, r1: 5, l2: 6, r2: 7,
    options: 9, l3: 10, r3: 11, up: 12, down: 13, left: 14, right: 15, ps: 16, touchpad: 17 };
  const tap = (name, frames = 3) => {
    buttons[B[name]].pressed = true; buttons[B[name]].value = 1;
    ls.simulate(frames);
    buttons[B[name]].pressed = false; buttons[B[name]].value = 0;
    ls.simulate(frames);
  };
  const analogue = (name, value) => { buttons[B[name]].value = value; buttons[B[name]].pressed = value > .5; };
  const out = {};
  try {
    ls.world('outside');
    ls.simulate(20);
    out.onFoot = !ls.debug().flying && !ls.debug().driving;
    out.connected = !!ls.pad()?.connected;
    // A connected pad takes the thumb pads off the glass.
    out.hidThumbPads = getComputedStyle(document.getElementById('controls')).display === 'none';

    // The manual override puts them back, from the pad itself.
    tap('options');                         // open the manual
    out.manualOpen = document.getElementById('help').classList.contains('open');
    tap('square');                          // cycle the on-screen controls setting
    out.afterOverride = document.body.className.match(/touch-(on|off)/)?.[0] ?? null;
    tap('square'); tap('square');           // back round to auto
    out.backToAuto = !/touch-(on|off)/.test(document.body.className);
    tap('circle');                          // Circle closes the manual
    out.manualClosed = !document.getElementById('help').classList.contains('open');

    // On foot.
    ls.arm();
    ls.simulate(6);
    tap('r3');
    out.holster = ls.debug().holstered;
    out.afterR3 = ls.debug();
    tap('r3');
    analogue('l2', 1); ls.simulate(4);
    out.aim = ls.debug().aiming;
    analogue('l2', 0); ls.simulate(4);
    // The wheel is held open, not toggled: tapping L1 opens it and the release
    // immediately takes whatever is under the pointer. So hold it.
    buttons[B.l1].pressed = true; buttons[B.l1].value = 1;
    ls.simulate(4);
    out.wheel = ls.debug().wheelOpen;
    tap('circle');                          // close it without taking anything
    buttons[B.l1].pressed = false; buttons[B.l1].value = 0;
    ls.simulate(4);
    out.wheelClosed = ls.debug().wheelOpen === false;

    // In the air: the brakes were the gap.
    ls.game.aircraft[0].state.position.set(110, 1.36, -180);
    ls.game.aircraft[0].state.velocity.set(0, 0, 0);
    ls.simulate(6);
    ls.fly(0);
    ls.simulate(6);
    out.flying = !!ls.flying();
    analogue('cross', 1);
    ls.simulate(4);
    out.padBrake = ls.flying().input.brake === true;
    analogue('cross', 0);
    analogue('r2', 1); ls.simulate(60);
    out.padThrottle = +ls.flying().throttle.toFixed(2);
    analogue('r2', 0);
    buttons[B.r1].pressed = true; buttons[B.r1].value = 1;
    ls.simulate(4);
    out.padRudder = +ls.game.aircraft[0].state.controls.yaw.toFixed(2);
    buttons[B.r1].pressed = false; buttons[B.r1].value = 0;
    ls.simulate(4);
    return out;
  } finally {
    if (original) navigator.getGamepads = original;
  }
});
check('the pad tests run on foot', pad.onFoot === true,
  'the player was still in a vehicle, so the on-foot mappings were never reached');
check('the pad is seen', pad.connected === true, 'the game never saw the controller');
check('a pad takes the thumb pads off the glass', pad.hidThumbPads === true,
  'the on-screen controls stayed up with a controller connected');
check('Options opens the manual', pad.manualOpen === true, 'Options did nothing');
check('the on-screen controls can be forced back on from the pad',
  pad.afterOverride !== null, 'the override did not change anything');
check('and set back to automatic', pad.backToAuto === true,
  'cycling three times did not come back to auto');
check('Circle closes the manual', pad.manualClosed === true, 'Circle left the manual open');
check('R3 holsters', pad.holster === true, 'R3 did not holster the weapon');
check('L2 aims', pad.aim === true, 'L2 did not bring the sights up');
check('L1 opens the wheel', pad.wheel === true, 'L1 did not open the weapon wheel');
check('and letting go closes it', pad.wheelClosed === true, 'the wheel stayed open');
check('the pad flies it', pad.flying === true, 'could not board with a pad');
check('Cross is the wheel brakes', pad.padBrake === true,
  'Cross did nothing in the aeroplane — there is no way to stop after landing');
check('R2 is the throttle', pad.padThrottle > 0.5,
  `a second of R2 gave ${pad.padThrottle} throttle`);
check('R1 is the right rudder', pad.padRudder > 0.2,
  `R1 gave ${pad.padRudder} of rudder`);

// And a look at the glass itself, because a control that is present, wired and
// underneath the speed readout is still a control you cannot press.
if (outDir) {
  mkdirSync(outDir, { recursive: true });
  for (const [name, setup] of [
    ['on-foot', () => {
      const ls = globalThis.__ls;
      ls.time(0.5); ls.weather(0);
      ls.park(); ls.arm(); ls.moveTo(-30, -46); ls.look(0.5, -0.05); ls.simulate(30);
    }],
    ['flying', () => {
      const ls = globalThis.__ls;
      const plane = ls.game.aircraft[0];
      plane.state.position.set(110, 1.36, -180);
      plane.state.velocity.set(0, 0, 0);
      plane.state.quaternion.setFromAxisAngle(new ls.THREE.Vector3(0, 1, 0), -Math.PI / 2);
      ls.simulate(10);
      ls.fly(0);
      ls.stick(0.2, 0.1, 0, 0.72);
      ls.simulate(220);
    }],
  ]) {
    await page.evaluate(() => {
      const original = navigator.getGamepads?.bind(navigator);
      if (original) navigator.getGamepads = () => [];
      document.body.classList.remove('pad');
    });
    await page.evaluate(setup);
    await page.waitForTimeout(2200);
    writeFileSync(`${outDir}/${name}.png`, await page.screenshot({ type: 'png' }));
    console.error(`  shot ${name}`);
  }
}

for (const error of new Set(errors)) failures.push(`uncaught: ${error}`);

await cdp.send('Page.stopScreencast').catch(() => {});
await browser.close();
if (failures.length) {
  console.error('Controls QA failed:\n  ' + failures.join('\n  '));
  process.exit(1);
}
console.log('Controls QA passed: it flies on fingers alone, the run does not run out,'
  + ' and the pad reaches every control.');

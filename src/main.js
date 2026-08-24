import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { loadGameAssets } from './assets.js';
import { createGameWorld } from './world.js';
import { CharacterBody } from './physics.js';
import { GradeShader, CameraFeedShader } from './grade.js';
import { Survival, loadRun, saveRun, clearRun } from './survival.js';
import { WEAPONS, DEFAULT_WEAPON, createLoadout, shotInterval, isUsable, aimPose, hipPose }
  from './weapons.js';
import { createDecalField } from './decals.js';

const coarse = matchMedia('(pointer:coarse)').matches;
const boot = document.getElementById('boot');
const startButton = document.getElementById('start');
const engineState = document.getElementById('engineState');
const fatal = document.getElementById('fatal');
const fatalText = document.getElementById('fatalText');
const promptEl = document.getElementById('prompt');
const msgEl = document.getElementById('msg');
const backendEl = document.getElementById('backend');
const ammoEl = document.getElementById('ammo');
const foodEl = document.getElementById('foodStat');
const healthEl = document.getElementById('healthStat');
const motionEl = document.getElementById('motion');
const staminaBar = document.getElementById('staminaBar');
const staminaFill = document.getElementById('staminaFill');
const taskListEl = document.getElementById('taskList');
const dayEl = document.getElementById('dayStat');
const clockEl = document.getElementById('clockStat');
const skyEl = document.getElementById('skyStat');
const powerEl = document.getElementById('powerStat');
const waterEl = document.getElementById('waterStat');
const airEl = document.getElementById('airStat');

let renderer, composer, renderPass, bloomPass, gradePass, aoPass, feedComposer, feedPass, game;
let currentWorld = 'bunker';
let started = false;
let modal = false;
let cctv = false;
let currentCam = 0;
let yaw = 0;
let pitch = -0.03;
let armed = false;
// The service rifle's numbers. Everything else on the armoury wall carries its
// own, out of the catalogue, but this pair is what an unmodified run starts on
// and what a save file written before the collection existed restores to.
const MAGAZINE_SIZE = 30;
const INITIAL_RESERVE = 90;
// What the player is holding, and the rounds every weapon in the collection is
// carrying. A single global magazine count stopped describing the player the
// moment all twenty-two racked weapons became things you can pick up: swapping
// to the revolver and back must not quietly top the rifle up.
const loadout = createLoadout();
let weaponKey = DEFAULT_WEAPON;
let weapon = WEAPONS[DEFAULT_WEAPON];
let ammo = MAGAZINE_SIZE;
let reserve = INITIAL_RESERVE;
let reloading = false;
// Rate of fire, and whether the trigger is still down. Held fire only runs the
// automatics; everything else is one round per press, as its action dictates.
let shotCooldown = 0;
let triggerHeld = false;
const decals = createDecalField();
let health = 100;
const survival = new Survival();
let saveTimer = 0;
let clockTimer = 0;
let recovery = 0;
let hatchOpen = false;
let hurtFlash = 0;
let recoil = 0;
let sprinting = false;
let stamina = 1;
let seated = null;
let aiming = false;
let jumpQueued = false;
const touch = { sprint: false, crouch: false };
let breath = 0;
const body = new CharacterBody();
const clock = new THREE.Clock();
const keys = {};
const ray = new THREE.Raycaster();
let msgTimer = 0;

// The world the player is standing in: shelter, surface compound or silo.
function activeScene() {
  return game.scenes?.[currentWorld] || game.bunker;
}

function updateOrientation() {
  document.body.classList.toggle('portrait', innerHeight > innerWidth);
}
updateOrientation();
addEventListener('resize', updateOrientation);
addEventListener('orientationchange', () => setTimeout(updateOrientation, 160));

function flash(text, duration = 1800) {
  msgEl.textContent = text;
  msgEl.classList.add('on');
  clearTimeout(msgTimer);
  msgTimer = setTimeout(() => msgEl.classList.remove('on'), duration);
}

function fail(error) {
  console.error(error);
  fatal.style.display = 'flex';
  fatalText.textContent = `Game startup failed: ${error?.message || error}`;
  boot.style.display = 'none';
}

// One quality tier decides pixel ratio, shadow resolution and how much of the
// post stack we can afford, so a phone and a desktop run the same code path.
const TIERS = {
  // Mobile previously lost browser antialiasing when the composer rendered to
  // an unsampled target. SMAA costs one light fullscreen pass and removes the
  // crawling/blocky railing edges visible in the supplied Android recording.
  mobile: { name: 'mobile', pixelRatio: 1.5, shadows: THREE.PCFShadowMap, samples: 0, smaa: true, grain: 0.0, ao: false },
  balanced: { name: 'balanced', pixelRatio: 1.75, shadows: THREE.PCFSoftShadowMap, samples: 2, smaa: true, grain: 0.004, ao: false },
  high: { name: 'high', pixelRatio: 2, shadows: THREE.PCFSoftShadowMap, samples: 4, smaa: true, grain: 0.007, ao: true },
};
const quality = (() => {
  // ?quality=high forces a tier. A headless browser reports four cores and a
  // coarse pointer, so without this the screenshots that decide how the game
  // looks are always taken on the lowest settings.
  const forced = TIERS[new URLSearchParams(location.search).get('quality')];
  if (forced) return forced;
  const cores = navigator.hardwareConcurrency || 4;
  if (coarse || cores <= 4) return TIERS.mobile;
  if (cores <= 8) return TIERS.balanced;
  return TIERS.high;
})();

function createRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, quality.pixelRatio));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = quality.shadows;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.domElement.style.zIndex = '0';
  document.body.insertBefore(renderer.domElement, document.body.firstChild);
}

// The composer renders into its own target, which silently drops the context's
// antialiasing — so the render target has to be multisampled itself, with SMAA
// as the fallback where MSAA targets are too expensive.
function createComposer() {
  const size = new THREE.Vector2();
  renderer.getDrawingBufferSize(size);
  const target = new THREE.WebGLRenderTarget(size.x, size.y, {
    type: THREE.HalfFloatType,
    samples: quality.samples,
    colorSpace: THREE.LinearSRGBColorSpace,
  });

  composer = new EffectComposer(renderer, target);
  renderPass = new RenderPass(game.bunker, game.camera);
  composer.addPass(renderPass);

  // Ambient occlusion does most of the work of grounding objects in a room lit
  // by a handful of point lights: railings, deck edges and door recesses stop
  // floating. Desktop only — it is a second depth-normal pass per frame.
  if (quality.ao) {
    aoPass = new GTAOPass(game.bunker, game.camera, size.x, size.y);
    aoPass.output = GTAOPass.OUTPUT.Default;
    aoPass.updateGtaoMaterial({ radius: 0.55, distanceExponent: 1.4, thickness: 0.6, scale: 1.1 });
    composer.addPass(aoPass);
  }

  bloomPass = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.11, 0.34, 1.02);
  composer.addPass(bloomPass);

  gradePass = new ShaderPass(GradeShader);
  gradePass.uniforms.grain.value = quality.grain;
  composer.addPass(gradePass);

  composer.addPass(new OutputPass());
  if (quality.smaa && !quality.samples) composer.addPass(new SMAAPass(size.x, size.y));

  // The CCTV feed gets its own chain so the monitor look never touches the
  // first-person view.
  feedComposer = new EffectComposer(renderer, target.clone());
  feedComposer.addPass(new RenderPass(game.outside, game.cctvCameras[0]));
  feedPass = new ShaderPass(CameraFeedShader);
  feedComposer.addPass(feedPass);
  feedComposer.addPass(new OutputPass());
}

async function prepare() {
  try {
    createRenderer();
    engineState.textContent = 'Restoring Shelter 47 lighting, controls and life-support displays…';
    const assets = await loadGameAssets((label, step, total) => {
      engineState.textContent = `Bringing site systems online — ${step}/${total}`;
    });

    game = createGameWorld(assets);
    game.camera.rotation.order = 'YXZ';

    createComposer();
    body.teleport(game.player.position.x, 0, game.player.position.z);

    wireGameEvents();
    wireControls();

    // Dev-only handle so the visual QA harness can drive the camera without
    // synthesising pointer events. Stripped from production builds.
    if (import.meta.env.DEV) {
      globalThis.__ls = {
        game, body, quality, THREE,
        // Visual QA starts the simulation directly. The real button path still
        // exercises audio, fullscreen, orientation and pointer lock in the
        // interaction tests, without making screenshots depend on browser UI.
        start: () => beginGame({ restore: false }),
        look: (y, p = pitch) => { yaw = y; pitch = p; },
        moveTo: (x, z) => body.teleport(x, body.position.y, z),
        world: (name) => { currentWorld = name; const spawn = game.setWorld(name); body.teleport(spawn.x, spawn.y, spawn.z); },
        openCam: (i) => { currentCam = i; openCCTV(); },
        exposure: (v) => { renderer.toneMappingExposure = v; },
        simulate: (count = 1, dt = 1 / 60) => { for (let i = 0; i < count; i++) simulate(dt); },
        // Walk under the same input path the player uses, from inside an
        // evaluated block where synthetic key events are not available.
        walkFrames: (count = 1, code = 'KeyW', dt = 1 / 60) => {
          keys[code] = true;
          for (let i = 0; i < count; i++) simulate(dt);
          keys[code] = false;
        },
        arm: (key = DEFAULT_WEAPON) => {
          loadout.resupply(key);
          // Straight into the hands, without walking the carry rules: a test
          // that wants to fire all twenty-six should not have to put twenty-two
          // of them back first.
          if (!carried.includes(key)) {
            if (carried.length >= CARRY_SLOTS) carried[Math.max(0, carried.indexOf(weaponKey))] = key;
            else carried.push(key);
          }
          drawWeapon(key, { announce: false });
          return weaponKey;
        },
        // Every rack slot, so a harness can take each weapon down in turn and
        // fire it rather than testing the one the room happens to issue.
        weapons: () => Object.keys(WEAPONS),
        weapon: () => ({
          key: weaponKey, name: weapon?.name, family: weapon?.family,
          kind: weapon?.kind, automatic: !!weapon?.automatic,
          magazine: weapon?.magazine ?? 0, ammo, reserve,
          model: game.weaponAction?.children
            .find((child) => child.name.startsWith('Equipped_'))?.name ?? null,
        }),
        decals: () => decals.count(),
        marks: () => decals.total(),
        reload: () => reload(),
        // Take a wound, so the infirmary has something to treat.
        hurt: (amount = 30) => {
          health = Math.max(0, health - amount);
          hurtFlash = 1;
          recovery = 0;
          updateHealth();
          return health;
        },
        // Hold the trigger, as a finger does. Only the automatics keep firing.
        hold: (value = true) => { triggerHeld = !!value; },
        carried: () => [...carried],
        slot: (index) => selectSlot(index),
        cycle: (step = 1) => cycleWeapon(step),
        scoped: () => scoped,
        time: (value) => { game.sky?.setTimeOfDay(value); updateStats(); },
        weather: (value) => { game.sky?.setWeather(value); },
        sky: () => ({ ...game.sky?.state }),
        aim: (value = true) => setAiming(value),
        jump: () => queueJump(),
        aimAt: (target) => {
          const point = target.isVector3 ? target.clone() : new THREE.Vector3(target.x, target.y, target.z);
          const to = point.sub(game.camera.getWorldPosition(new THREE.Vector3()));
          yaw = Math.atan2(-to.x, -to.z);
          pitch = Math.atan2(to.y, Math.hypot(to.x, to.z));
        },
        fire: () => fire(),
        bounds: (object) => new THREE.Box3().setFromObject(object),
        openDoor: () => { const door = game.interactions.find(o => o.userData.interaction?.name === 'BLAST DOOR'); door?.userData.interaction.onUse(); },
        use: () => use(),
        state: () => ({ health, ammo, reserve, armed, aiming, seated: !!seated,
          weapon: weaponKey, weaponName: weapon?.name,
          survival: survival.snapshot, blackout: survival.blackout,
          doorOpen: game.doorOpen(), hatchOpen: game.hatchOpen?.() ?? false,
          residents: game.residents?.residents.length ?? 0,
          objectives: [...completed] }),
        newRun: () => clearRun(),
        survival,
        debug: () => ({ started, modal, cctv, keys: Object.keys(keys).filter(k => keys[k]), speed: body.horizontalSpeed }),
        boxes: (world = currentWorld) => game.colliders[world].boxes.map(({ box, climbable }) => ({
          climbable,
          min: box.min.toArray().map(v => +v.toFixed(2)),
          max: box.max.toArray().map(v => +v.toFixed(2)),
        })),
        freecam: (px, py, pz, tx, ty, tz, fov = 70) => {
          started = false;
          const cam = game.camera;
          cam.parent?.remove(cam);
          activeScene().add(cam);
          cam.position.set(px, py, pz);
          cam.rotation.set(0, 0, 0);
          cam.lookAt(tx, ty, tz);
          cam.fov = fov;
          cam.updateProjectionMatrix();
        },
      };
    }
    engineState.textContent = '✓ Shelter 47, walk-in armoury, habitation silo and service rifle loaded.';
    backendEl.textContent = `S47 INTERNAL // EXTERNAL LINK LOST // ${quality.name.toUpperCase()} DISPLAY`;
    startButton.disabled = false;
    startButton.textContent = 'ENTER SHELTER';
    renderer.setAnimationLoop(loop);
  } catch (err) {
    console.error(err);
    engineState.innerHTML = `<span style="color:#ff9b88">ASSET LOAD FAILED: ${String(err?.message || err)}</span><br>The project will not substitute primitive animals. Reload after the asset workflow finishes.`;
    startButton.disabled = false;
    startButton.textContent = 'RETRY ASSET LOAD';
    startButton.onclick = () => location.reload();
    renderer?.setAnimationLoop(() => renderer.clear());
  }
}

function wireGameEvents() {
  addEventListener('lostsignal:computer', () => openModal('computer'));
  addEventListener('lostsignal:radio', () => { openModal('radio'); setRadioNoise(0.2); });
  addEventListener('lostsignal:generator', () => {
    const result = survival.refuel();
    flash(result.reason, 2600);
    updateStats();
    if (result.ok) clickSound(180, .3, .06);
  });
  addEventListener('lostsignal:filtration', () => {
    const result = survival.serviceFilters();
    flash(result.reason, 2600);
    updateStats();
    if (result.ok) clickSound(340, .18, .05);
  });
  addEventListener('lostsignal:vaultopen', (event) => flash(event.detail?.open === false
    ? 'ARMOURY SECURITY DOOR CLOSED'
    : 'ARMOURY UNLOCKED — WALK IN AND INSPECT THE WALL RACKS'));
  addEventListener('lostsignal:takegun', (event) => {
    equipWeapon(event.detail?.key || DEFAULT_WEAPON);
  });
  addEventListener('lostsignal:rangehit', (event) => {
    const { distance, standing, hits } = event.detail;
    flash(standing > 0
      ? `PLATE DOWN AT ${distance} M — ${standing} STANDING`
      : `ALL PLATES DOWN — ${hits} FOR ${game.range.score().shots}`, 1600);
  });
  addEventListener('lostsignal:rangereset', (event) => {
    const { hits, shots } = event.detail;
    flash(shots > 0
      ? `RANGE RESET — LAST STRING ${hits} HITS FROM ${shots} ROUNDS`
      : 'RANGE RESET — SIX PLATES STANDING', 2400);
    clickSound(520, .08, .04);
  });
  addEventListener('lostsignal:sentry', (event) => {
    flash(event.detail?.line || '…', 5200);
    clickSound(300, .07, .035);
  });
  addEventListener('lostsignal:dog', (event) => {
    flash(event.detail?.line || '…', 4200);
    clickSound(520, .05, .03);
  });
  // The infirmary on the secure gallery. Three courses of treatment, and then
  // it is a bench with empty boxes on it.
  addEventListener('lostsignal:medical', (event) => {
    if (event.detail?.empty && health >= 100) {
      flash('INFIRMARY STORES ARE EMPTY', 2200);
      return;
    }
    if (event.detail?.empty) {
      flash('INFIRMARY STORES ARE EMPTY — NOTHING LEFT TO TREAT WITH', 2600);
      clickSound(140, .09, .045);
      return;
    }
    if (health >= 100) {
      flash('NO INJURIES TO TREAT', 1800);
      return;
    }
    health = Math.min(100, health + 45);
    recovery = 0;
    updateHealth();
    updateStats();
    flash(`TREATED — CONDITION ${Math.round(health)}%, `
      + `${event.detail.remaining} COURSE(S) LEFT`, 2800);
    clickSound(660, .12, .05);
    completeObjective('secure');
  });
  addEventListener('lostsignal:rackedlocked', (event) => {
    flash(`${event.detail?.name || 'THAT RACK'} IS BEHIND THE SECURITY DOOR`, 1800);
    clickSound(150, .07, .04);
  });
  addEventListener('lostsignal:inspectkit', (event) => {
    flash(`${event.detail?.name || 'BENCH KIT'} — BENCH FITTING, NOT A WEAPON`, 2000);
    clickSound(520, .05, .035);
  });
  addEventListener('lostsignal:door', (e) => flash(e.detail.open ? 'BLAST SEAL RELEASED' : 'BLAST SEAL LOCKED'));
  addEventListener('lostsignal:surface', (e) => {
    if (!e.detail.allowed) { flash('OPEN THE BLAST DOOR FIRST'); return; }
    currentWorld = 'outside';
    const spawn = game.setWorld('outside');
    body.teleport(spawn.x, spawn.y, spawn.z);
    yaw = Math.PI;
    pitch = -0.03;
    setOutdoorAudio(true);
    flash('SURFACE COMPOUND — PERIMETER FENCE ACTIVE', 2200);
  });
  addEventListener('lostsignal:return', () => {
    currentWorld = 'bunker';
    const spawn = game.setWorld('bunker');
    body.teleport(spawn.x, spawn.y, spawn.z);
    yaw = 0;
    pitch = -0.02;
    setOutdoorAudio(false);
    flash('SHELTER 47 — BLAST CHAMBER');
  });
  addEventListener('lostsignal:cctv', () => {
    openCCTV();
    completeObjective('cameras');
  });

  addEventListener('lostsignal:hatch', (e) => {
    hatchOpen = e.detail.open;
    flash(hatchOpen ? 'HATCH UNSEALED — SILO ACCESS OPEN' : 'HATCH RESEALED');
    clickSound(hatchOpen ? 210 : 160, .22, .06);
    completeObjective('hatch');
  });

  addEventListener('lostsignal:descend', (e) => {
    if (!e.detail.allowed) { flash('THE HATCH IS STILL SEALED — TURN THE WHEEL'); return; }
    enterWorld('silo', Math.PI * 0.5, -0.05);
    flash('SILO 47 — TOP LANDING · SEVEN RESIDENTIAL LEVELS BELOW', 3200);
    completeObjective('descend');
  });

  addEventListener('lostsignal:ascend', () => {
    enterWorld('bunker', 0, -0.02);
    flash('SHELTER 47 — BLAST CHAMBER');
  });

  addEventListener('lostsignal:quarters', (e) => {
    flash(e.detail.open
      ? `${e.detail.unit} — DOOR OPEN`
      : `${e.detail.unit} — DOOR CLOSED`, 1800);
  });

  addEventListener('lostsignal:sofa', (e) => {
    if (currentWorld !== 'silo') return;
    const { seat, stand, yaw: seatYaw, unit } = e.detail;
    seated = { stand: new THREE.Vector3(stand.x, stand.y, stand.z), yaw: seatYaw };
    body.teleport(seat.x, seat.y, seat.z);
    game.player.position.copy(body.position);
    yaw = seatYaw;
    pitch = 0.015;
    touch.sprint = false;
    touch.crouch = false;
    setAiming(false);
    document.getElementById('sprintBtn').classList.remove('on');
    document.getElementById('crouchBtn').classList.remove('on');
    flash(`${unit} — SEATED · USE AGAIN TO STAND`, 2600);
  });

  addEventListener('lostsignal:bulkhead', (e) => {
    flash(e.detail.open
      ? `LEVEL ${e.detail.level} SERVICE BULKHEAD OPEN — MAINTENANCE ROOM ACCESSIBLE`
      : `LEVEL ${e.detail.level} SERVICE BULKHEAD SEALED`, 2600);
  });

  addEventListener('lostsignal:hydroponics', (e) => {
    survival.resupply({ food: 2 });
    updateStats();
    flash(`LEVEL ${e.detail.level} HYDROPONICS — TWO DAYS OF GREENS`, 2800);
    completeObjective('hydroponics');
  });

  addEventListener('lostsignal:secureunit', () => {
    flash('SECURE UNIT — CARD READER REJECTS YOU. NOBODY WILL SAY WHAT IS BEHIND IT.', 4200);
    clickSound(150, .2, .05);
    completeObjective('secure');
  });

  addEventListener('lostsignal:resident', (e) => {
    flash(e.detail.line, 4200);
  });

  addEventListener('lostsignal:quartermaster', (e) => {
    flash(`QUARTERMASTER ELI: ${e.detail.line}`, 5200);
  });

  addEventListener('lostsignal:cache', () => {
    if (cacheEmptied) { flash('THE CACHE IS EMPTY'); return; }
    cacheEmptied = true;
    reserve += 60;
    survival.resupply({ food: 6, water: 8, fuel: 3, filters: 2 });
    updateAmmo();
    updateStats();
    flash('+60 ROUNDS · RATIONS · WATER · FUEL · FILTERS', 3600);
    clickSound(520, .12, .05);
    completeObjective('cache');
  });

  document.querySelectorAll('.modal .x').forEach((button) => {
    button.onclick = () => {
      button.parentElement.classList.remove('open');
      document.body.classList.remove('overlay-open');
      modal = false;
      setRadioNoise(0);
      clickSound(280);
    };
  });

  let freq = 104.30;
  const updateRadio = () => {
    document.getElementById('freq').textContent = `${freq.toFixed(2)} MHz`;
    const text = document.getElementById('radioText');
    if (freq > 105.77 && freq < 105.84) {
      text.innerHTML = '<span style="color:#ffd187">SIGNAL: VOICE CARRIER<br>STRENGTH: 67%<br><br>“…shelter… if anyone can hear… do not…”</span>';
      setRadioNoise(.035);
      beacon();
    } else {
      text.innerHTML = `SIGNAL: STATIC<br>STRENGTH: 0${2 + Math.floor(Math.random()*7)}%`;
      setRadioNoise(.20);
    }
  };
  document.getElementById('down').onclick = () => { freq = Math.max(88, freq - .05); updateRadio(); clickSound(420); };
  document.getElementById('up').onclick = () => { freq = Math.min(118, freq + .05); updateRadio(); clickSound(520); };
}

// Overlays own the screen: the shelter HUD is hidden behind them so readouts
// like the CCTV motion detector do not collide with the survival stats.
let cacheEmptied = false;

// A short, ordered chain so the shelter always has a next thing to do. Later
// objectives stay hidden until the ones before them are done, which keeps the
// list to a couple of lines instead of a wall of spoilers.
const OBJECTIVES = [
  { id: 'rifle', text: 'Enter the armoury and take a weapon off the wall' },
  { id: 'cameras', text: 'Sweep the CCTV feeds, including the silo' },
  { id: 'hatch', text: 'Unseal the hatch in the shelter floor' },
  { id: 'descend', text: 'Descend into Silo 47' },
  { id: 'resident', text: 'Speak to someone who lives down there' },
  { id: 'secure', text: 'Find the secure unit on the top landing' },
  { id: 'hydroponics', text: 'Reach the hydroponics levels' },
  { id: 'cache', text: 'Find the silo stores at the bottom' },
];
const completed = new Set();

function renderObjectives() {
  const pending = OBJECTIVES.filter(o => !completed.has(o.id));
  const shown = [
    ...OBJECTIVES.filter(o => completed.has(o.id)).slice(-2),
    ...pending.slice(0, 2),
  ];
  taskListEl.innerHTML = '';
  for (const objective of shown) {
    const item = document.createElement('li');
    item.textContent = objective.text;
    if (completed.has(objective.id)) item.className = 'done';
    taskListEl.appendChild(item);
  }
}

function completeObjective(id) {
  if (completed.has(id) || !OBJECTIVES.some(o => o.id === id)) return;
  completed.add(id);
  renderObjectives();
  clickSound(700, .09, .035);
  if (completed.size === OBJECTIVES.length) {
    setTimeout(() => flash('EVERY SYSTEM IN SHELTER 47 IS YOURS. THE SIGNAL IS STILL TRANSMITTING.', 5000), 2600);
  }
}

// Moving between the shelter, the surface and the silo is the same operation
// every time: reparent the player, drop the body at the new spawn, face them
// the right way.
function enterWorld(name, facing, tilt) {
  seated = null;
  setAiming(false);
  currentWorld = name;
  const spawn = game.setWorld(name);
  body.teleport(spawn.x, spawn.y, spawn.z);
  yaw = facing;
  pitch = tilt;
  setOutdoorAudio(name === 'outside');
}

function leaveSeat(showMessage = true) {
  if (!seated) return false;
  const { stand, yaw: standYaw } = seated;
  seated = null;
  body.teleport(stand.x, stand.y, stand.z);
  game.player.position.copy(body.position);
  yaw = standYaw;
  pitch = -0.02;
  if (showMessage) flash('STOOD UP');
  return true;
}

function toggleHelp(force) {
  const panel = document.getElementById('help');
  const open = force ?? !panel.classList.contains('open');
  panel.classList.toggle('open', open);
  document.body.classList.toggle('overlay-open', open);
  modal = open || cctv;
  if (open) setAiming(false);
  if (open) document.exitPointerLock?.();
  clickSound(open ? 480 : 300, .05, .03);
}

function openModal(id) {
  modal = true;
  setAiming(false);
  document.exitPointerLock?.();
  document.getElementById(id).classList.add('open');
  document.body.classList.add('overlay-open');
}

function nearestDownedAnimal() {
  if (currentWorld !== 'outside') return null;
  const forward = new THREE.Vector3(0,0,-1).applyEuler(game.camera.rotation).normalize();
  let best = null;
  let bestD = 2.5;
  for (const w of game.wildlife) {
    if (w.userData.alive !== false || w.userData.harvested) continue;
    const d = w.position.distanceTo(game.player.position);
    if (d >= bestD) continue;
    const dir = w.position.clone().sub(game.player.position).normalize();
    if (forward.dot(dir) < .15) continue;
    best = w;
    bestD = d;
  }
  return best;
}

function nearestResident() {
  if (currentWorld !== 'silo' || !game.residents) return null;
  const forward = new THREE.Vector3(0, 0, -1).applyEuler(game.camera.rotation).normalize();
  let best = null;
  let bestDistance = 2.6;
  for (const root of game.residents.residents) {
    const distance = root.position.distanceTo(game.player.position);
    if (distance >= bestDistance || Math.abs(root.position.y - game.player.position.y) >= 2.2) continue;
    const direction = root.position.clone().sub(game.player.position).normalize();
    if (forward.dot(direction) > 0.12) {
      best = root;
      bestDistance = distance;
    }
  }
  return best;
}

function use() {
  if (!started || modal || cctv) return;
  if (leaveSeat()) return;
  const interaction = game.nearestInteraction(currentWorld);
  if (interaction) {
    clickSound(420, .04, .035);
    interaction.onUse();
    return;
  }
  const resident = nearestResident();
  if (resident) {
    window.dispatchEvent(new CustomEvent('lostsignal:resident', {
      detail: { line: resident.userData.resident?.line || '…' },
    }));
    completeObjective('resident');
    return;
  }
  const downed = nearestDownedAnimal();
  if (downed) {
    downed.userData.harvested = true;
    const gain = downed.userData.kind === 'deer' ? 3 : 1;
    survival.resupply({ food: gain });
    updateStats();
    downed.parent?.remove(downed);
    flash(`${downed.userData.kind.toUpperCase()} HARVESTED — +${gain} DAYS FOOD`, 2200);
  }
}

// Looking down glass is a different act from lining up irons. The four
// precision rifles black out the frame, put a real reticle in the eyepiece and
// take the weapon out of the picture — you are looking through it, not at it.
const scopeRangeEl = document.getElementById('scopeRange');
let scoped = false;

function setScoped(value) {
  const next = !!value && !!weapon?.scope;
  if (scoped === next) return scoped;
  scoped = next;
  document.body.classList.toggle('scoped', scoped);
  if (game) game.weaponView.visible = armed && !scoped;
  if (scoped && scopeRangeEl) scopeRangeEl.textContent = `${weapon.scope} — ${weapon.name}`;
  return scoped;
}

function setAiming(value) {
  const next = !!value && armed && !reloading && !modal && !cctv && !seated && !sprinting;
  if (aiming === next) return aiming;
  aiming = next;
  document.body.classList.toggle('aiming', aiming);
  document.getElementById('aimBtn')?.classList.toggle('on', aiming);
  setScoped(aiming);
  return aiming;
}

function queueJump() {
  if (!started || modal || cctv) return false;
  if (seated) {
    leaveSeat();
    return false;
  }
  jumpQueued = true;
  setAiming(false);
  return true;
}

// A weapon's spread is quoted in normalised device coordinates, where 1.0 is
// half the screen. Multiplying up here keeps the catalogue's numbers readable
// (0.011 for a rifle, 0.098 for a sawn-off) while still opening a shotgun to a
// real cone rather than a slightly fat point.
const SPREAD_TO_NDC = 3;
const PERSON_KINDS = ['resident', 'quartermaster'];
const CREATURE_KINDS = ['deer', 'rabbit', 'zombie', ...PERSON_KINDS];
const _shotOrigin = new THREE.Vector3();
const _hitNormal = new THREE.Vector3();
const _normalMatrix = new THREE.Matrix3();

/** Put the player's ammunition back into the pool for the weapon they hold. */
function syncAmmo() {
  const pool = loadout.for(weaponKey);
  pool.magazine = ammo;
  pool.reserve = reserve;
}

/**
 * Take a weapon off the armoury wall. The one being put down keeps whatever is
 * left in it, and goes back on its own hook.
 */
// You carry a loadout, not one gun. Four slots: taking a fifth weapon puts
// down whatever is in your hands, which goes back on its own hook.
const CARRY_SLOTS = 4;
const carried = [];

/** Draw a weapon already on the player. */
function drawWeapon(key, { announce = true } = {}) {
  if (!isUsable(key) || !carried.includes(key)) return false;
  if (armed) syncAmmo();
  weaponKey = key;
  weapon = WEAPONS[key];
  const pool = loadout.for(key);
  ammo = pool.magazine;
  reserve = pool.reserve;
  armed = true;
  reloading = false;
  reloadTimer = 0;
  queuedReload = 0;
  shotCooldown = 0;
  setAiming(false);
  game.setArmed(key);
  game.armory?.setEquipped(carried);
  document.body.classList.add('armed');
  updateAmmo();
  if (announce) {
    flash(weapon.kind === 'melee'
      ? `${weapon.name} DRAWN`
      : `${weapon.name} — ${weapon.automatic ? 'AUTOMATIC' : 'SEMI-AUTOMATIC'}`, 2200);
    clickSound(360, .08, .05);
  }
  completeObjective('rifle');
  return true;
}

/** Take a weapon off the wall and onto the player, drawing it. */
function equipWeapon(key, { announce = true } = {}) {
  if (!isUsable(key)) return false;
  if (!carried.includes(key)) {
    if (carried.length >= CARRY_SLOTS) {
      // Full: what is in your hands goes back on its hook to make room.
      const droppedAt = Math.max(0, carried.indexOf(weaponKey));
      const dropped = carried[droppedAt];
      carried[droppedAt] = key;
      if (announce && dropped) flash(`${WEAPONS[dropped].name} RACKED`, 1600);
    } else {
      carried.push(key);
    }
  }
  return drawWeapon(key, { announce });
}

/** Switch between what is already on the player. */
function selectSlot(index) {
  const key = carried[index];
  if (!key || key === weaponKey || reloading || modal || cctv) return false;
  return drawWeapon(key, { announce: false }) && (flash(WEAPONS[key].name, 1200), true);
}

function cycleWeapon(step) {
  if (carried.length < 2) return false;
  const from = Math.max(0, carried.indexOf(weaponKey));
  const to = (from + step + carried.length * 2) % carried.length;
  return selectSlot(to);
}

/** Anything that can be shot in the world the player is standing in. */
function livingTargets() {
  const targets = [];
  for (const root of game.wildlife) {
    if (root.parent && root.userData.alive !== false) targets.push(root);
  }
  if (currentWorld === 'silo') {
    for (const root of game.residents?.residents || []) {
      if (root.parent && root.userData.alive !== false) targets.push(root);
    }
  }
  const eli = game.armory?.quartermaster;
  if (currentWorld === 'bunker' && eli?.parent && eli.userData.alive !== false) targets.push(eli);
  return targets;
}

function targetRootOf(object) {
  let node = object;
  while (node && !CREATURE_KINDS.includes(node.userData.kind)) node = node.parent;
  return node || null;
}

/** The world, minus the player and the marks already on it. */
function worldGeometry(world) {
  return world.children.filter((child) => child !== game.player && !child.userData.isDecal);
}

/**
 * One round (or one pellet). Returns true if it found something alive.
 * `spread` is the half-angle of the cone, already converted to NDC.
 */
function fireRound(world, spread, damage) {
  const jitter = spread > 0
    ? { x: (Math.random() * 2 - 1) * spread, y: (Math.random() * 2 - 1) * spread }
    : { x: 0, y: 0 };
  ray.setFromCamera(jitter, game.camera);
  ray.far = weapon.range ?? 90;

  const living = ray.intersectObjects(livingTargets(), true);
  const target = living.length ? targetRootOf(living[0].object) : null;
  const impact = ray.intersectObjects(worldGeometry(world), true)
    .find((hit) => hit.object.isMesh && hit.object.visible && !targetRootOf(hit.object));

  // Whichever came first. Checking the living list on its own let every weapon
  // shoot straight through the bulkhead it was pointed at.
  if (target && (!impact || living[0].distance <= impact.distance)) {
    resolveHit(target, living[0].point, damage);
    return true;
  }
  if (impact) {
    // A range plate is not scenery: it rings and folds away.
    const plate = game.range?.targetFor(impact.object);
    if (plate && game.range.strike(plate)) {
      burst(impact.point, 'dust', 5, 0.22);
      plateRingSound(plate.distance);
      return false;
    }
    burst(impact.point, 'dust', 4, 0.16);
    // A round has to leave a mark, or the whole collection reads as a set of
    // noise-makers. The face normal comes back in the hit object's local space.
    if (impact.face) {
      _normalMatrix.getNormalMatrix(impact.object.matrixWorld);
      _hitNormal.copy(impact.face.normal).applyMatrix3(_normalMatrix).normalize();
    } else {
      _hitNormal.copy(game.camera.getWorldPosition(_shotOrigin)).sub(impact.point).normalize();
    }
    // The mark matches what made it: buckshot leaves a scatter of small pits,
    // a .50 leaves a crater, a blade leaves a scrape.
    const mark = decals.add(world, impact.point, _hitNormal, {
      kind: weapon.kind === 'melee' ? 'gouge' : 'hole',
      size: weapon.calibre ?? 0.10,
    });
    if (mark) mark.userData.isDecal = true;
  }
  return false;
}

function fire() {
  if (!armed || reloading || modal || cctv || !started) return false;
  if (shotCooldown > 0) return false;
  if (weapon.kind === 'melee') return swing();
  if (ammo <= 0) {
    if (reserve > 0) reload();
    else clickSound(120, .05, .05);
    return false;
  }
  ammo--;
  syncAmmo();
  updateAmmo();
  shotCooldown = shotInterval(weapon);
  game.playGun('shoot');
  weaponFireSound(weapon);
  muzzleFlash(weapon);
  recoil = weapon.recoil ?? .18;

  // fire() runs from an input event, so the camera still holds last frame's
  // matrix. Aiming off by a frame of mouse movement is a miss at range.
  const world = activeScene();
  world.updateMatrixWorld();

  game.range?.countShot();
  const spread = (aiming ? (weapon.adsSpread ?? 0) : (weapon.spread ?? 0)) * SPREAD_TO_NDC;
  const pellets = Math.max(1, weapon.pellets ?? 1);
  let struck = false;
  for (let i = 0; i < pellets; i++) {
    struck = fireRound(world, spread, weapon.damage) || struck;
  }
  if (!struck && currentWorld !== 'outside' && !weapon.quiet) {
    flash('THE SHOT ECHOES THROUGH THE SHELTER', 900);
  }
  // Three hundred people live in the silo and none of them ignore gunfire.
  if (!weapon.quiet) alarmBystanders(1);

  if (ammo === 0 && reserve > 0) queuedReload = 0.45;
  return true;
}

/** The bayonet: no ammunition, short reach, and it still marks what it hits. */
function swing() {
  shotCooldown = shotInterval(weapon);
  recoil = weapon.recoil ?? .12;
  game.playGun('shoot');
  weaponFireSound(weapon);
  const world = activeScene();
  world.updateMatrixWorld();
  ray.setFromCamera({ x: 0, y: 0 }, game.camera);
  ray.far = weapon.reach ?? 2;
  const living = ray.intersectObjects(livingTargets(), true);
  const target = living.length ? targetRootOf(living[0].object) : null;
  if (target) {
    resolveHit(target, living[0].point, weapon.damage);
    alarmBystanders(0.6);
    return true;
  }
  // A swing that lands on a wall still scrapes it.
  const impact = ray.intersectObjects(worldGeometry(world), true)
    .find((hit) => hit.object.isMesh && hit.object.visible && !targetRootOf(hit.object));
  if (impact) {
    if (impact.face) {
      _normalMatrix.getNormalMatrix(impact.object.matrixWorld);
      _hitNormal.copy(impact.face.normal).applyMatrix3(_normalMatrix).normalize();
    } else {
      _hitNormal.copy(game.camera.getWorldPosition(_shotOrigin)).sub(impact.point).normalize();
    }
    const mark = decals.add(world, impact.point, _hitNormal,
      { kind: 'gouge', size: weapon.calibre ?? 0.08 });
    if (mark) mark.userData.isDecal = true;
    burst(impact.point, 'dust', 3, 0.10);
  }
  return false;
}

function alarmBystanders(level) {
  if (currentWorld !== 'silo') return 0;
  return game.residents?.alarm?.(game.player.position, 18 * level) ?? 0;
}

function resolveHit(target, point, damage = weapon?.damage ?? 34) {
  const kind = target.userData.kind;
  if (PERSON_KINDS.includes(kind)) return resolvePersonHit(target, point, damage);

  burst(point, 'blood', 8, 0.3);
  const agent = game.creatures.agentFor(target);

  if (kind !== 'zombie') {
    if (agent?.kill()) {
      flash(`${kind.toUpperCase()} DOWN — APPROACH TO HARVEST`, 1700);
    }
    return;
  }

  // Height above the infected's feet decides where the round landed.
  const headshot = point.y - target.position.y > 1.42;
  target.userData.hp = (target.userData.hp ?? 3) - (headshot ? 3 : 1);
  if (target.userData.hp <= 0) {
    if (agent?.kill()) flash(headshot ? 'HEADSHOT — INFECTED DOWN' : 'INFECTED DOWN', 1300);
    return;
  }
  if (agent) agent.stagger = agent.staggerTime;
  flash('INFECTED HIT', 700);
}

// Shooting someone is a thing the shelter lets you do, and it has to look like
// what it is: they take the round where it landed, and if it kills them they go
// down on the deck and stay there.
function resolvePersonHit(target, point, damage) {
  burst(point, 'blood', 9, 0.34);
  const headshot = point.y - target.position.y > 1.5;
  const multiplier = headshot ? (weapon?.headshot ?? 2.2) : 1;
  target.userData.hp = (target.userData.hp ?? 100) - damage * multiplier;
  const name = target.userData.kind === 'quartermaster' ? 'QUARTERMASTER ELI' : 'RESIDENT';

  if (target.userData.hp > 0) {
    flash(`${name} HIT`, 900);
    alarmBystanders(1);
    return;
  }

  const agent = game.residents?.agentFor?.(target);
  const downed = agent ? agent.kill() : game.armory?.downQuartermaster?.();
  if (downed !== false) {
    flash(headshot ? `${name} DOWN — HEADSHOT` : `${name} DOWN`, 2200);
    alarmBystanders(1.4);
  }
}

let reloadTimer = 0;
let queuedReload = 0;

function reload() {
  if (!armed || weapon.kind === 'melee') return;
  if (reloading || ammo >= weapon.magazine || reserve <= 0) return;
  setAiming(false);
  reloading = true;
  reloadTimer = weapon.reloadTime ?? 1.2;
  game.playGun('reload', reloadTimer);
  weaponReloadSound(weapon);
  flash('RELOADING…', Math.round(reloadTimer * 1000));
}

function updateReload(dt) {
  if (queuedReload > 0) {
    queuedReload -= dt;
    if (queuedReload <= 0) reload();
  }
  if (!reloading) return;
  reloadTimer -= dt;
  if (reloadTimer > 0) return;
  const take = Math.min(weapon.magazine - ammo, reserve);
  ammo += take;
  reserve -= take;
  reloading = false;
  syncAmmo();
  updateAmmo();
}

const slotsEl = document.getElementById('weaponSlots');

function updateAmmo() {
  const nameEl = document.getElementById('weaponName');
  if (nameEl) nameEl.textContent = armed ? weapon.name : 'UNARMED';
  ammoEl.textContent = !armed ? '—'
    : (weapon.kind === 'melee' ? 'BLADE' : `${ammo} / ${reserve}`);
  if (!slotsEl) return;
  // What else is on you, and which key draws it.
  slotsEl.innerHTML = '';
  carried.forEach((key, index) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = key === weaponKey ? 'slot on' : 'slot';
    chip.dataset.slot = String(index);
    chip.textContent = `${index + 1} ${WEAPONS[key].name}`;
    slotsEl.appendChild(chip);
  });
}

// A flat generator is not a number going red: the shelter goes dark, and the
// only thing still lit is the emergency lamp.
let blackoutLights = null;
function setBlackout(dark) {
  if (!blackoutLights) {
    blackoutLights = [];
    game.bunker.traverse((object) => {
      if (object.isPointLight && object !== game.emergency) blackoutLights.push({ light: object, base: object.intensity });
      if (object.isSpotLight) blackoutLights.push({ light: object, base: object.intensity });
    });
  }
  for (const entry of blackoutLights) entry.light.intensity = dark ? entry.base * 0.02 : entry.base;
  flash(dark ? 'THE GENERATOR HAS STOPPED — REFUEL IT' : 'POWER RESTORED', 3200);
  if (dark) hurtSound();
}

function persistRun() {
  saveRun({
    survival: survival.snapshot,
    elapsed: survival.elapsed,
    health, ammo, reserve, armed,
    weaponKey, carried: [...carried],
    loadout: (armed ? (syncAmmo(), loadout.snapshot()) : loadout.snapshot()),
    completed: [...completed],
    cacheEmptied,
    doorOpen: game.doorOpen?.() ?? false,
    hatchOpen: game.hatchOpen?.() ?? false,
  });
}

function restoreRun() {
  const saved = loadRun();
  if (!saved) return false;
  Object.assign(survival, saved.survival || {});
  survival.elapsed = saved.elapsed || 0;
  health = saved.health ?? 100;
  loadout.restore(saved.loadout);
  ammo = saved.ammo ?? MAGAZINE_SIZE;
  reserve = saved.reserve ?? INITIAL_RESERVE;
  cacheEmptied = !!saved.cacheEmptied;
  hatchOpen = !!saved.hatchOpen;
  game.setDoorOpen?.(!!saved.doorOpen);
  game.setHatchOpen?.(hatchOpen);
  for (const id of saved.completed || []) completed.add(id);
  if (saved.armed) {
    // Runs saved before the collection existed have no weapon key at all, and
    // restore holding the service rifle they were issued.
    const key = isUsable(saved.weaponKey) ? saved.weaponKey : DEFAULT_WEAPON;
    for (const held of saved.carried || [key]) {
      if (isUsable(held) && !carried.includes(held) && carried.length < CARRY_SLOTS) {
        carried.push(held);
      }
    }
    if (!carried.includes(key)) carried.push(key);
    if (!saved.loadout) {
      const pool = loadout.for(key);
      pool.magazine = ammo;
      pool.reserve = reserve;
    }
    equipWeapon(key, { announce: false });
  }
  updateAmmo();
  return true;
}

const statClass = (value, warn, bad) => (value <= bad ? 'bad' : (value <= warn ? 'warn' : 'ok'));

function updateStats() {
  dayEl.textContent = String(survival.day);
  const sky = game?.sky?.state;
  if (sky && clockEl) {
    const minutes = Math.floor(sky.timeOfDay * 24 * 60);
    clockEl.textContent = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:`
      + `${String(minutes % 60).padStart(2, '0')}`;
  }
  if (sky && skyEl) {
    skyEl.textContent = sky.label;
    skyEl.className = sky.rain > 0.45 ? 'warn' : 'ok';
  }
  powerEl.textContent = `${Math.round(survival.power)}%`;
  powerEl.className = statClass(survival.power, 35, 12);
  waterEl.textContent = `${Math.floor(survival.water)} DAYS`;
  waterEl.className = statClass(survival.water, 5, 1);
  airEl.textContent = `${Math.round(survival.air)}%`;
  airEl.className = statClass(survival.air, 30, 15);
  foodEl.textContent = `${Math.floor(survival.food)} DAYS`;
  foodEl.className = statClass(survival.food, 3, 1);
}

function updateHealth() {
  healthEl.textContent = `${Math.round(health)}%`;
  healthEl.className = health > 60 ? 'ok' : (health > 25 ? 'warn' : 'bad');
}

// Going down is not a game over: the survivor wakes back in the shelter having
// lost the day's foraging, which keeps a run going.
function collapse() {
  health = 45;
  survival.food = Math.max(0, survival.food - 2);
  updateHealth();
  updateStats();
  currentWorld = 'bunker';
  const spawn = game.setWorld('bunker');
  body.teleport(spawn.x, spawn.y, spawn.z);
  yaw = 0;
  pitch = -0.02;
  setOutdoorAudio(false);
  flash('YOU WOKE UP BACK IN THE SHELTER — TWO DAYS OF FOOD GONE', 3200);
}

// CCTV PTZ
const camPan = [0,0,0,0,0], camTilt = [0,0,0,0,0], camFov = [48,50,48,42,56];
const camSignal = [1, 0.82, 0.93, 0.66, 0.88];
let nightVision = false;
const camNames = ['MAIN GATE','EAST FENCE / WOODLINE','SERVICE YARD','TOWER OVERVIEW','SILO TOP — SECURE UNIT'];
function openCCTV() {
  cctv = true;
  modal = true;
  setAiming(false);
  document.exitPointerLock?.();
  document.getElementById('cctv').classList.add('open');
  document.body.classList.add('overlay-open');
  setOutdoorAudio(true);
  switchCam(currentCam);
}
function closeCCTV() {
  cctv = false;
  modal = false;
  document.getElementById('cctv').classList.remove('open');
  document.body.classList.remove('overlay-open');
  if (currentWorld !== 'outside') setOutdoorAudio(false);
}
function switchCam(i) {
  currentCam = i;
  if (cctv) setOutdoorAudio(i < 4);
  const strength = Math.round(camSignal[i] * 100);
  document.getElementById('camTitle').textContent =
    `CAM 0${i+1} // ${camNames[i]}  ·  SIG ${strength}%${nightVision ? '  ·  IR' : ''}`;
  updatePTZ();
  clickSound(650,.035,.025);
}

function toggleNightVision() {
  nightVision = !nightVision;
  document.getElementById('nightVision')?.classList.toggle('on', nightVision);
  switchCam(currentCam);
  clickSound(nightVision ? 880 : 420, .06, .03);
}
function updatePTZ() {
  const pan = Math.round(camPan[currentCam] * 180 / Math.PI);
  const tilt = Math.round(camTilt[currentCam] * 180 / Math.PI);
  document.getElementById('ptzReadout').textContent = `PTZ ${pan>=0?'+':''}${pan}° / ${tilt>=0?'+':''}${tilt}°   ZOOM ${(50/camFov[currentCam]).toFixed(1)}×`;
}
function zoom(delta) {
  camFov[currentCam] = Math.max(22, Math.min(70, camFov[currentCam] + delta));
  updatePTZ();
}
document.getElementById('exitCam').onclick = closeCCTV;
document.querySelectorAll('[data-c]').forEach(b => b.onclick = () => switchCam(+b.dataset.c));
document.getElementById('zoomIn').onclick = () => zoom(-6);
document.getElementById('zoomOut').onclick = () => zoom(6);
document.getElementById('ptzReset').onclick = () => { camPan[currentCam]=0; camTilt[currentCam]=0; camFov[currentCam]=[48,50,48,42,56][currentCam]; updatePTZ(); };
document.getElementById('nightVision')?.addEventListener('click', toggleNightVision);
const cctvFrame = document.querySelector('#cctv .frame');
let ptzId=null,ptzX=0,ptzY=0;
cctvFrame.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;ptzId=e.pointerId;ptzX=e.clientX;ptzY=e.clientY;cctvFrame.setPointerCapture?.(ptzId)});
cctvFrame.addEventListener('pointermove',e=>{if(e.pointerId!==ptzId)return;const dx=e.clientX-ptzX,dy=e.clientY-ptzY;ptzX=e.clientX;ptzY=e.clientY;camPan[currentCam]=Math.max(-1.35,Math.min(1.35,camPan[currentCam]-dx*.0033));camTilt[currentCam]=Math.max(-.7,Math.min(.6,camTilt[currentCam]-dy*.0028));updatePTZ()});
cctvFrame.addEventListener('pointerup',()=>ptzId=null);

function wireControls() {
  addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='KeyE'&&!e.repeat)use();if(e.code==='KeyR'&&!e.repeat)reload();if(e.code==='KeyF'&&!e.repeat){triggerHeld=true;fire()}if(e.code==='KeyQ'&&!e.repeat)setAiming(!aiming);if(/^Digit[1-4]$/.test(e.code)&&!e.repeat)selectSlot(+e.code.slice(5)-1);if(e.code==='Tab'){e.preventDefault();if(!e.repeat)cycleWeapon(1)}if(e.code==='KeyH'){e.preventDefault();toggleHelp()}if(e.code==='Space'){e.preventDefault();if(!e.repeat)queueJump()}if(e.code==='Escape'&&document.getElementById('help').classList.contains('open'))toggleHelp(false);else if(e.code==='Escape'&&cctv)closeCCTV();if(e.code==='KeyN'&&cctv)toggleNightVision()});
  addEventListener('keyup',e=>{keys[e.code]=false;if(e.code==='KeyF')triggerHeld=false});
  renderer.domElement.addEventListener('click',()=>{if(started&&!coarse&&!modal)Promise.resolve(renderer.domElement.requestPointerLock?.()).catch(()=>{})});
  renderer.domElement.addEventListener('pointerdown',(e)=>{if(!started||coarse||modal)return;if(e.button===2){e.preventDefault();setAiming(true)}else if(e.button===0&&document.pointerLockElement===renderer.domElement){triggerHeld=true;fire()}});
  renderer.domElement.addEventListener('pointerup',(e)=>{if(e.button===2)setAiming(false);if(e.button===0)triggerHeld=false});
  addEventListener('blur',()=>{triggerHeld=false});
  renderer.domElement.addEventListener('contextmenu',(e)=>e.preventDefault());
  addEventListener('mousemove',e=>{if(document.pointerLockElement===renderer.domElement&&!modal){
    // Glass slows the hand: at eight power a raw mouse delta throws the aim
    // clean off the target, which is what a magnified sight picture is for.
    const gain=scoped?(weapon?.zoom??52)/70:1;
    yaw-=e.movementX*.0022*gain;pitch=Math.max(-1.25,Math.min(1.15,pitch-e.movementY*.0018*gain))}});
  // The wheel changes weapons, as it does in every other shooter.
  renderer.domElement.addEventListener('wheel',(e)=>{
    if(!started||modal||cctv)return;
    e.preventDefault();
    cycleWeapon(e.deltaY>0?1:-1);
  },{passive:false});

  const move={x:0,y:0},pad=document.getElementById('movePad'),nub=document.getElementById('moveNub');
  let moveId=null,cx=0,cy=0;
  pad.addEventListener('pointerdown',e=>{moveId=e.pointerId;pad.setPointerCapture(moveId);const r=pad.getBoundingClientRect();cx=r.left+r.width/2;cy=r.top+r.height/2});
  pad.addEventListener('pointermove',e=>{if(e.pointerId!==moveId)return;let dx=e.clientX-cx,dy=e.clientY-cy;const lim=39,len=Math.hypot(dx,dy)||1,s=Math.min(1,lim/len);dx*=s;dy*=s;move.x=dx/lim;move.y=dy/lim;nub.style.transform=`translate(${dx}px,${dy}px)`});
  const clear=()=>{moveId=null;move.x=move.y=0;nub.style.transform='translate(0,0)'};pad.addEventListener('pointerup',clear);pad.addEventListener('pointercancel',clear);
  game.mobileMove=move;

  const look=document.getElementById('lookZone');let lookId=null,lx=0,ly=0;
  look.addEventListener('pointerdown',e=>{lookId=e.pointerId;look.setPointerCapture(lookId);lx=e.clientX;ly=e.clientY});
  look.addEventListener('pointermove',e=>{if(e.pointerId!==lookId||modal)return;const dx=e.clientX-lx,dy=e.clientY-ly;lx=e.clientX;ly=e.clientY;yaw-=dx*.004;pitch=Math.max(-1.25,Math.min(1.15,pitch-dy*.0031))});
  look.addEventListener('pointerup',()=>lookId=null);look.addEventListener('pointercancel',()=>lookId=null);
  document.getElementById('use').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();use()});
  const fireBtn=document.getElementById('fire');
  fireBtn.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();triggerHeld=true;fire()});
  const releaseTrigger=()=>{triggerHeld=false};
  fireBtn.addEventListener('pointerup',releaseTrigger);
  fireBtn.addEventListener('pointercancel',releaseTrigger);
  fireBtn.addEventListener('pointerleave',releaseTrigger);
  document.getElementById('reloadBtn').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();reload()});
  document.getElementById('jumpBtn').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();queueJump()});
  document.getElementById('aimBtn').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();setAiming(!aiming)});
  document.getElementById('weaponSlots')?.addEventListener('pointerdown',(e)=>{
    const chip=e.target.closest('.slot');
    if(!chip)return;
    e.preventDefault();e.stopPropagation();
    selectSlot(+chip.dataset.slot);
  });
  document.getElementById('helpBtn').addEventListener('click',()=>toggleHelp());
  document.querySelector('#help .x').addEventListener('click',()=>toggleHelp(false));

  // Sprint and crouch are latching toggles on touch: a phone has no spare
  // finger to hold a modifier while steering with both thumbs.
  const latch = (id, key) => {
    const button = document.getElementById(id);
    button.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      touch[key] = !touch[key];
      if (key === 'sprint' && touch.sprint) touch.crouch = false;
      if (key === 'crouch' && touch.crouch) touch.sprint = false;
      document.getElementById('sprintBtn').classList.toggle('on', touch.sprint);
      document.getElementById('crouchBtn').classList.toggle('on', touch.crouch);
      clickSound(key === 'sprint' ? 520 : 300, .04, .03);
    });
  };
  latch('sprintBtn', 'sprint');
  latch('crouchBtn', 'crouch');
}

const desiredVelocity = new THREE.Vector3();
const forwardAxis = new THREE.Vector3();
const rightAxis = new THREE.Vector3();

function updatePlayer(dt) {
  if (!started || modal) return;
  game.camera.rotation.y = yaw;
  game.camera.rotation.x = pitch;

  if (seated) {
    desiredVelocity.set(0, 0, 0);
    // A seat is itself solid. Keep the seated capsule at the authored pose
    // instead of resolving it out through the sofa on the next physics frame.
    body.velocity.set(0, 0, 0);
    body.grounded = true;
    game.player.position.set(body.position.x, body.position.y, body.position.z);
    game.camera.position.set(0, 1.18 + Math.sin(breath) * 0.003, 0);
    game.camera.rotation.z = 0;
    breath += dt * 0.55;
    sprinting = false;
    stamina = Math.min(1, stamina + dt / 4);
    staminaFill.style.transform = `scaleX(${stamina.toFixed(3)})`;
    staminaBar.classList.toggle('on', stamina < 0.995);
    return;
  }

  let strafe = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0) + (game.mobileMove?.x || 0);
  let forward = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0) - (game.mobileMove?.y || 0);
  const magnitude = Math.hypot(strafe, forward);
  if (magnitude > 1) { strafe /= magnitude; forward /= magnitude; }

  const crouching = !!keys.ControlLeft || !!keys.KeyC || touch.crouch;
  const wantsSprint = (!!keys.ShiftLeft || !!keys.ShiftRight || touch.sprint) && forward > 0.1 && !crouching;
  sprinting = wantsSprint && stamina > 0.05;
  if (sprinting && aiming) setAiming(false);

  // Sprinting drains stamina; standing still or walking refills it, with a
  // short recovery lag so a spent player cannot immediately sprint again.
  stamina = THREE.MathUtils.clamp(
    stamina + (sprinting ? -dt / 6.5 : dt / (stamina < 0.2 ? 9 : 5)), 0, 1);
  if (touch.sprint && stamina <= 0.02) {
    touch.sprint = false;
    document.getElementById('sprintBtn').classList.remove('on');
  }

  const base = currentWorld === 'outside' ? 3.05 : 2.55;
  const speed = base * (sprinting ? 1.72 : 1) * (crouching ? 0.48 : 1);

  forwardAxis.set(-Math.sin(yaw), 0, -Math.cos(yaw));
  rightAxis.set(Math.cos(yaw), 0, -Math.sin(yaw));
  desiredVelocity.copy(forwardAxis).multiplyScalar(forward * speed)
    .addScaledVector(rightAxis, strafe * speed);

  const wantsJump = jumpQueued;
  jumpQueued = false;
  body.step(dt, desiredVelocity, game.colliders[currentWorld], {
    crouch: crouching,
    jump: wantsJump,
    jumpSpeed: 5.8,
  });
  game.residents?.resolvePlayer?.(body.position, body.radius, body.height);
  game.player.position.set(body.position.x, body.position.y, body.position.z);

  // Head bob is driven by distance walked, not by wall-clock time, so it stops
  // dead when the player walks into geometry instead of bobbing on the spot.
  const speedRatio = THREE.MathUtils.clamp(body.horizontalSpeed / base, 0, 2);
  const bobPhase = body.distanceWalked * 3.4;
  const bobAmount = speedRatio * (sprinting ? 0.045 : 0.028) * (crouching ? 0.5 : 1);
  breath += dt * (sprinting ? 3.4 : 1.15);

  game.camera.position.y = body.eyeHeight
    + Math.sin(bobPhase) * bobAmount
    + Math.sin(breath) * 0.006
    - body.landingImpact * 0.22;
  game.camera.position.x = Math.cos(bobPhase * 0.5) * bobAmount * 0.55;
  game.camera.rotation.z = Math.cos(bobPhase * 0.5) * bobAmount * 0.22
    + (sprinting ? Math.sin(bobPhase * 0.5) * 0.012 : 0);

  footsteps(dt, speedRatio, crouching);

  staminaFill.style.transform = `scaleX(${stamina.toFixed(3)})`;
  staminaBar.classList.toggle('on', stamina < 0.995);
}

// Footsteps fire on distance travelled so their rhythm always matches the legs.
let nextStepAt = 0;
function footsteps(dt, speedRatio, crouching) {
  if (!body.grounded || speedRatio < 0.15) return;
  const stride = crouching ? 1.05 : (sprinting ? 1.05 : 0.78);
  if (body.distanceWalked < nextStepAt) return;
  nextStepAt = body.distanceWalked + stride;
  const outdoors = currentWorld === 'outside';
  footstepSound(outdoors, crouching ? 0.35 : (sprinting ? 1 : 0.7));
}

function updatePrompt() {
  if (!started || modal || cctv) { promptEl.classList.remove('on'); return; }
  if(seated){promptEl.textContent=`${coarse?'USE':'[ E ]'}  STAND UP`;promptEl.classList.add('on');return}
  const interaction=game.nearestInteraction(currentWorld);
  if(interaction){promptEl.textContent=`${coarse?'USE':'[ E ]'}  ${interaction.name}`;promptEl.classList.add('on');return}
  const person=nearestResident();
  if(person){promptEl.textContent=`${coarse?'USE':'[ E ]'}  SPEAK TO RESIDENT`;promptEl.classList.add('on');return}
  const animal=nearestDownedAnimal();
  if(animal){promptEl.textContent=`${coarse?'USE':'[ E ]'}  HARVEST ${animal.userData.kind.toUpperCase()}`;promptEl.classList.add('on');return}
  promptEl.classList.remove('on');
}

// Audio
let ac=null,master=null,radioGain=null,outdoorGain=null;
function noiseBuffer(seconds=2){const b=ac.createBuffer(1,ac.sampleRate*seconds,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return b}
function startAudio(){
  if(ac){ac.resume?.();return}
  ac=new(window.AudioContext||window.webkitAudioContext)();master=ac.createGain();master.gain.value=.3;master.connect(ac.destination);
  [47,94,141].forEach((freq,i)=>{const o=ac.createOscillator(),g=ac.createGain();o.type=i?'sine':'triangle';o.frequency.value=freq;g.gain.value=[.09,.03,.01][i];o.connect(g);g.connect(master);o.start()});
  const rn=ac.createBufferSource();rn.buffer=noiseBuffer();rn.loop=true;const rf=ac.createBiquadFilter();rf.type='bandpass';rf.frequency.value=1800;radioGain=ac.createGain();radioGain.gain.value=0;rn.connect(rf);rf.connect(radioGain);radioGain.connect(master);rn.start();
  const on=ac.createBufferSource();on.buffer=noiseBuffer(3);on.loop=true;const of=ac.createBiquadFilter();of.type='lowpass';of.frequency.value=900;outdoorGain=ac.createGain();outdoorGain.gain.value=0;on.connect(of);of.connect(outdoorGain);outdoorGain.connect(master);on.start();
  startAmbience();
}
// Machinery you can hear from across the room and lose behind a corner. These
// are plain gain ramps driven by distance rather than PositionalAudio, so they
// share the one AudioContext the rest of the game already uses.
const ambientSources = [];
function addAmbient(position, radius, build) {
  if (!ac) return;
  const gain = ac.createGain();
  gain.gain.value = 0;
  gain.connect(master);
  build(gain);
  ambientSources.push({ position: new THREE.Vector3(...position), radius, gain });
}

function startAmbience() {
  // Diesel generator: a low rumble with a lopsided beat, in the south-east corner.
  addAmbient([4.6, 1.2, 4.95], 7, (out) => {
    const osc = ac.createOscillator();
    const beat = ac.createOscillator();
    const beatGain = ac.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = 38;
    beat.frequency.value = 5.6;
    beatGain.gain.value = 9;
    beat.connect(beatGain);
    beatGain.connect(osc.frequency);
    const filter = ac.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 220;
    const level = ac.createGain();
    level.gain.value = .5;
    osc.connect(filter); filter.connect(level); level.connect(out);
    osc.start(); beat.start();
  });

  // Air filtration: filtered noise where the ventilation unit stands.
  addAmbient([5.2, 1.3, -4.85], 6, (out) => {
    const source = ac.createBufferSource();
    source.buffer = noiseBuffer(3);
    source.loop = true;
    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 640;
    filter.Q.value = .8;
    const level = ac.createGain();
    level.gain.value = .35;
    source.connect(filter); filter.connect(level); level.connect(out);
    source.start();
  });
}

function updateAmbience() {
  if (!ac || !game) return;
  const indoors = currentWorld === 'bunker' && !cctv;
  for (const source of ambientSources) {
    const distance = indoors ? source.position.distanceTo(game.player.position) : Infinity;
    const falloff = THREE.MathUtils.clamp(1 - distance / source.radius, 0, 1);
    source.gain.gain.setTargetAtTime(falloff * falloff * 0.09, ac.currentTime, .2);
  }
}

function setRadioNoise(v){if(radioGain&&ac)radioGain.gain.setTargetAtTime(v,ac.currentTime,.04)}
function setOutdoorAudio(on){if(outdoorGain&&ac)outdoorGain.gain.setTargetAtTime(on?.045:0,ac.currentTime,.15)}
function clickSound(freq=500,d=.05,vol=.04){if(!ac)return;const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();o.frequency.value=freq;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(master);o.start(t);o.stop(t+d+.01)}
function beacon(){clickSound(760,.25,.035)}
function hurtSound(){
  if(!ac)return;
  const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();
  o.type='square';
  o.frequency.setValueAtTime(140,t);
  o.frequency.exponentialRampToValueAtTime(62,t+.28);
  g.gain.setValueAtTime(.16,t);
  g.gain.exponentialRampToValueAtTime(.001,t+.3);
  o.connect(g);g.connect(master);o.start(t);o.stop(t+.31);
}
// Footsteps are filtered noise bursts: a dull thud on concrete indoors, a
// wetter, brighter scuff on the wrecked surface apron.
function footstepSound(outdoors, strength = 1) {
  if (!ac) return;
  const t = ac.currentTime;
  const source = ac.createBufferSource();
  source.buffer = noiseBuffer(.25);
  const filter = ac.createBiquadFilter();
  filter.type = outdoors ? 'bandpass' : 'lowpass';
  filter.frequency.value = outdoors ? 1400 + Math.random() * 700 : 320 + Math.random() * 140;
  filter.Q.value = outdoors ? 1.1 : .7;
  const gain = ac.createGain();
  const peak = (outdoors ? .05 : .07) * strength;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(peak, t + .008);
  gain.gain.exponentialRampToValueAtTime(.0006, t + .17);
  source.connect(filter); filter.connect(gain); gain.connect(master);
  source.start(t);
  source.stop(t + .2);
}
// Every weapon in the armoury has its own voice. A shot is three layers — the
// low blast of the muzzle, a band-passed crack for the report, and a filtered
// tail for the room — and each weapon's catalogue entry supplies all nine
// numbers, so a suppressed SMG and an anti-materiel rifle in the same corridor
// sound nothing like each other.
let shotNoise = null;
function shotNoiseBuffer() {
  if (!shotNoise) shotNoise = noiseBuffer(2);
  return shotNoise;
}

// A short burst of band-passed noise: the crack of a shot, or one click of a
// reload. Returns nothing — it schedules itself and tears itself down.
function noiseBurst({ at, hz, q, decay, level, type = 'bandpass' }) {
  const source = ac.createBufferSource();
  source.buffer = shotNoiseBuffer();
  source.loop = true;
  const filter = ac.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = hz;
  filter.Q.value = q;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(Math.max(.0008, level), at);
  gain.gain.exponentialRampToValueAtTime(.0006, at + decay);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  // Start somewhere random in the buffer, so repeat fire is not one loop.
  source.start(at, Math.random() * 1.4);
  source.stop(at + decay + .03);
}

function weaponFireSound(spec) {
  if (!ac || !master) return;
  const voice = spec?.audio?.fire;
  if (!voice) return;
  const t = ac.currentTime;

  const body = ac.createOscillator();
  body.type = 'sawtooth';
  body.frequency.setValueAtTime(voice.bodyHz, t);
  body.frequency.exponentialRampToValueAtTime(Math.max(20, voice.bodyEndHz), t + voice.bodyDecay);
  const bodyGain = ac.createGain();
  bodyGain.gain.setValueAtTime(voice.level * .78, t);
  bodyGain.gain.exponentialRampToValueAtTime(.0008, t + voice.bodyDecay + .04);
  body.connect(bodyGain);
  bodyGain.connect(master);
  body.start(t);
  body.stop(t + voice.bodyDecay + .06);

  noiseBurst({ at: t, hz: voice.crackHz, q: voice.crackQ,
    decay: voice.crackDecay, level: voice.level });
  noiseBurst({ at: t + .012, hz: voice.tailHz, q: .6,
    decay: voice.tailDecay, level: voice.level * voice.tailLevel, type: 'lowpass' });
}

// Steel at range: a bright ring, arriving late by however long the sound took
// to come back from the plate.
function plateRingSound(distance = 20) {
  if (!ac || !master) return;
  const at = ac.currentTime + Math.min(0.35, distance / 343);
  for (const [partial, level] of [[1, 0.16], [2.41, 0.09], [3.86, 0.05]]) {
    const osc = ac.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880 * partial, at);
    osc.frequency.exponentialRampToValueAtTime(860 * partial, at + 0.9);
    const gain = ac.createGain();
    gain.gain.setValueAtTime(level, at);
    gain.gain.exponentialRampToValueAtTime(0.0006, at + 0.9);
    osc.connect(gain);
    gain.connect(master);
    osc.start(at);
    osc.stop(at + 0.95);
  }
  noiseBurst({ at, hz: 2600, q: 1.4, decay: 0.05, level: 0.12 });
}

function weaponReloadSound(spec) {
  if (!ac || !master) return;
  const sequence = spec?.audio?.reload;
  if (!sequence) return;
  const t0 = ac.currentTime;
  for (const click of sequence) {
    const at = t0 + click.at;
    noiseBurst({ at, hz: click.hz, q: click.q, decay: click.decay, level: click.level * .5 });
    if (!click.tone) continue;
    // The metal underneath the click. A magazine catch and a cylinder latch
    // differ mostly in this, not in the noise on top of it.
    const osc = ac.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(click.tone, at);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, click.tone * .55), at + click.decay);
    const gain = ac.createGain();
    gain.gain.setValueAtTime(click.level * .16, at);
    gain.gain.exponentialRampToValueAtTime(.0005, at + click.decay);
    osc.connect(gain);
    gain.connect(master);
    osc.start(at);
    osc.stop(at + click.decay + .03);
  }
}
// A shot needs to leave a mark on the world: the room flashes, the barrel
// throws light, and whatever the round hit puffs.
let muzzleLight = null;
let muzzleTimer = 0;

function muzzleFlash(spec = weapon) {
  if (!muzzleLight) {
    muzzleLight = new THREE.PointLight(0xffd9a0, 0, 9, 2);
    muzzleLight.position.set(0.3, -0.25, -0.9);
    game.camera.add(muzzleLight);
  }
  // A can hides most of the flash; a sawn-off throws the room into daylight.
  const scale = spec?.quiet ? .28 : (spec?.family === 'shotgun' ? 1.5
    : (spec?.family === 'sniper' ? 1.3 : 1));
  muzzleTimer = 0.06;
  muzzleLight.intensity = 260 * scale;
}

const impactGeometry = new THREE.SphereGeometry(0.035, 6, 5);
const impactMaterials = {
  blood: new THREE.MeshBasicMaterial({ color: 0x7a1512 }),
  dust: new THREE.MeshBasicMaterial({ color: 0x9a9c92, transparent: true, opacity: 0.75 }),
};
const debris = [];

function burst(point, kind, count = 7, spread = 0.26) {
  const scene = activeScene();
  for (let i = 0; i < count; i++) {
    const particle = new THREE.Mesh(impactGeometry, impactMaterials[kind]);
    particle.position.copy(point);
    scene.add(particle);
    debris.push({
      mesh: particle,
      scene,
      life: 0.45 + Math.random() * 0.25,
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * spread * 8,
        Math.random() * spread * 6,
        (Math.random() - 0.5) * spread * 8),
    });
  }
}

function updateEffects(dt) {
  decals.update(dt);
  if (muzzleTimer > 0) {
    muzzleTimer -= dt;
    if (muzzleTimer <= 0 && muzzleLight) muzzleLight.intensity = 0;
  }
  for (let i = debris.length - 1; i >= 0; i--) {
    const particle = debris[i];
    particle.life -= dt;
    if (particle.life <= 0) {
      particle.scene.remove(particle.mesh);
      debris.splice(i, 1);
      continue;
    }
    particle.velocity.y -= 14 * dt;
    particle.mesh.position.addScaledVector(particle.velocity, dt);
  }
}

function bloodBurst(point){const g=new THREE.SphereGeometry(.05,8,6),m=new THREE.MeshBasicMaterial({color:0x771714});for(let i=0;i<7;i++){const p=new THREE.Mesh(g,m);p.position.copy(point).add(new THREE.Vector3((Math.random()-.5)*.25,(Math.random()-.5)*.25,(Math.random()-.5)*.25));game.outside.add(p);setTimeout(()=>game.outside.remove(p),450)}}

function beginGame({ restore = true } = {}) {
  if (!game || started) return;
  started = true;
  const resumed = restore && restoreRun();
  updateStats();updateAmmo();updateHealth();renderObjectives();
  document.body.classList.add('playing');boot.style.display='none';updateOrientation();
  setTimeout(()=>{renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);feedComposer.setSize(innerWidth,innerHeight);game.camera.aspect=innerWidth/innerHeight;game.camera.updateProjectionMatrix()},160);
  flash(resumed ? `RUN RESUMED — DAY ${survival.day}` : 'SHELTER 47 // REPOSITORY BUILD', resumed ? 2600 : 2200);
}

startButton.onclick=async()=>{
  if(!game){location.reload();return}
  startAudio();
  try{if(document.documentElement.requestFullscreen&&!document.fullscreenElement)await document.documentElement.requestFullscreen({navigationUI:'hide'}).catch(()=>{});if(screen.orientation?.lock)await screen.orientation.lock('landscape').catch(()=>{})}catch{}
  beginGame();
  // Requesting pointer lock without a trusted gesture rejects; that is normal
  // when the game is driven by a test harness and is not worth reporting.
  if(!coarse)Promise.resolve(renderer.domElement.requestPointerLock?.()).catch(()=>{});
};

// Weapon sway is driven by the body, so the rifle settles when the player does.
const weaponHip = new THREE.Vector3(.32, -.38, -.72);
// Centre the supplied rifle without lifting its receiver over the target. ADS
// keeps the stock low, then pitches the muzzle onto the firing ray below.
const weaponAim = new THREE.Vector3(.03, -.13, -.64);
const weaponTarget = new THREE.Vector3();

function updateWeapon(dt) {
  if (!armed) return;
  const blend = aiming ? 1 : 0;
  const sway = Math.min(body.horizontalSpeed / 3, 1) * (aiming ? .22 : 1);
  const bob = body.distanceWalked * 3.4;
  weaponHip.set(...hipPose(weapon));
  weaponAim.set(...aimPose(weapon));
  weaponTarget.lerpVectors(weaponHip, weaponAim, blend);
  weaponTarget.x += Math.cos(bob * .5) * .014 * sway;
  weaponTarget.y += Math.sin(bob) * .011 * sway + Math.sin(breath * .8) * .004 + recoil * .07;
  weaponTarget.z += recoil * .13 + (sprinting ? .05 : 0);
  game.weaponView.position.x = THREE.MathUtils.damp(game.weaponView.position.x, weaponTarget.x, 15, dt);
  game.weaponView.position.y = THREE.MathUtils.damp(game.weaponView.position.y, weaponTarget.y, 15, dt);
  game.weaponView.position.z = THREE.MathUtils.damp(game.weaponView.position.z, weaponTarget.z, 15, dt);
  game.weaponView.rotation.x = THREE.MathUtils.damp(game.weaponView.rotation.x,
    (aiming ? .13 : -.04) - recoil * .5 + (sprinting ? .22 : 0), 16, dt);
  game.weaponView.rotation.y = THREE.MathUtils.damp(game.weaponView.rotation.y,
    (aiming ? 0 : -.08) + Math.sin(bob * .5) * .02 * sway + (sprinting ? .3 : 0), 16, dt);
  game.weaponView.rotation.z = THREE.MathUtils.damp(game.weaponView.rotation.z,
    sprinting ? .24 : 0, 16, dt);
  // Optics differ. A scoped rifle pulls the frame in much further than a
  // pistol at arm's length, so the sight picture comes out of the catalogue.
  const targetFov = aiming ? (weapon?.zoom ?? 52) : 70;
  // A scoped rifle is never quite still, and magnification is what makes that
  // visible. Breathing walks the aim; holding it steady is the player's job.
  if (scoped) {
    const wander = Math.min(1, 0.35 + (1 - stamina) * 0.9);
    yaw += Math.sin(breath * 0.83) * 0.00028 * wander;
    pitch += Math.cos(breath * 0.61) * 0.00022 * wander;
  }
  const nextFov = THREE.MathUtils.damp(game.camera.fov, targetFov, 12, dt);
  if (Math.abs(nextFov - game.camera.fov) > .001) {
    game.camera.fov = nextFov;
    game.camera.updateProjectionMatrix();
  }
}

// Motion detection: anything alive inside the camera's frustum trips the
// indicator, which is what makes sweeping the cameras worth doing before
// opening the blast door.
const feedFrustum = new THREE.Frustum();
const feedMatrix = new THREE.Matrix4();
const feedPoint = new THREE.Vector3();

function detectMotion(camera) {
  feedMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  feedFrustum.setFromProjectionMatrix(feedMatrix);
  let contacts = 0;
  let hostile = false;
  const watched = game.cctvScenes?.[currentCam] === 'silo'
    ? (game.residents?.residents || [])
    : game.wildlife;
  for (const target of watched) {
    if (!target.parent || target.userData.alive === false) continue;
    feedPoint.copy(target.position);
    feedPoint.y += 0.9;
    if (!feedFrustum.containsPoint(feedPoint)) continue;
    contacts++;
  }
  return { contacts, hostile };
}

function renderCameraFeed() {
  const cam = game.cctvCameras[currentCam];
  cam.rotation.copy(game.cctvBaseRot[currentCam]);
  cam.rotation.y += camPan[currentCam];
  cam.rotation.x += camTilt[currentCam];
  cam.fov = camFov[currentCam];
  // The monitor is a fixed 16:9 window, so the feed must not inherit the
  // browser window's aspect or every camera looks stretched.
  cam.aspect = 16 / 9;
  cam.updateProjectionMatrix();
  // Four cameras watch the surface; the fifth is inside the silo.
  feedComposer.passes[0].scene = game.scenes[game.cctvScenes?.[currentCam] || 'outside'];
  feedComposer.passes[0].camera = cam;
  feedPass.uniforms.time.value = clock.elapsedTime;
  feedPass.uniforms.nightVision.value = nightVision ? 1 : 0;
  feedPass.uniforms.signal.value = camSignal[currentCam];
  cam.updateMatrixWorld();

  const { contacts, hostile } = detectMotion(cam);
  motionEl.textContent = contacts
    ? `MOTION ${contacts} CONTACT${contacts > 1 ? 'S' : ''}${hostile ? ' — HOSTILE' : ''}`
    : 'NO MOTION';
  motionEl.classList.toggle('alert', hostile);

  feedComposer.render();
}

// Simulation is kept separate from rendering so the visual QA harness can
// advance the world by a fixed timestep instead of depending on the browser's
// frame clock, which headless Chromium does not run on an idle page.
function simulate(dt) {
  updatePlayer(dt);
  activeScene().updateMatrixWorld();
  updatePrompt();
  game.update(dt, currentWorld, game.player.position);
  recoil = THREE.MathUtils.damp(recoil, 0, 13, dt);
  if (shotCooldown > 0) shotCooldown = Math.max(0, shotCooldown - dt);
  // Held fire runs the automatics only. Everything else in the collection is
  // one round per pull, which is what makes the revolver feel like a revolver.
  if (triggerHeld && armed && weapon?.automatic) fire();
  updateWeapon(dt);
  updateReload(dt);
  updateEffects(dt);
  updateAmbience();
  const tick = survival.tick(dt, { indoors: currentWorld !== 'outside' });
  if (tick.damage > 0) {
    health = Math.max(0, health - tick.damage);
    updateHealth();
    if (health <= 0) collapse();
  }
  if (tick.dayChanged) {
    updateStats();
    flash(`DAY ${survival.day} IN SHELTER 47`, 2600);
  }
  if (tick.blackoutChanged) setBlackout(survival.blackout);

  clockTimer += dt;
  if (clockTimer > 1) { clockTimer = 0; updateStats(); }

  saveTimer += dt;
  if (saveTimer > 5) { saveTimer = 0; persistRun(); }

  hurtFlash = THREE.MathUtils.damp(hurtFlash, 0, 1.6, dt);
  // Recovery only starts once nothing has hit you for a while, and only in the
  // shelter. Bleeding out on the surface is the player's problem.
  recovery += dt;
  if (health < 100 && currentWorld === 'bunker' && recovery > 6 && survival.strain === 0) {
    health = Math.min(100, health + dt * 1.6);
    updateHealth();
  }
}

function loop() {
  const dt = Math.min(clock.getDelta(), .05);
  if (!game) return;

  simulate(dt);

  if (cctv) {
    renderCameraFeed();
    return;
  }

  const scene = activeScene();
  renderPass.scene = scene;
  renderPass.camera = game.camera;
  if (aoPass) { aoPass.scene = scene; aoPass.camera = game.camera; }
  gradePass.uniforms.time.value = clock.elapsedTime;
  const wounded = THREE.MathUtils.clamp(1 - health / 100, 0, 1);
  gradePass.uniforms.damage.value = Math.max(hurtFlash * 0.8, wounded * 0.45);
  // Exhaustion desaturates and tightens the frame; bloom eases off outdoors
  // where there are no bright practicals to bleed.
  const spent = 1 - stamina;
  gradePass.uniforms.vignette.value = 0.44 + spent * 0.16;
  gradePass.uniforms.saturation.value = 0.96 - spent * 0.14;
  gradePass.uniforms.aberration.value = 0.0012 + spent * 0.001;
  bloomPass.strength = currentWorld === 'outside' ? 0.12 : 0.2;
  composer.render();
}

addEventListener('resize', () => {
  if (!renderer || !game) return;
  renderer.setSize(innerWidth, innerHeight);
  composer?.setSize(innerWidth, innerHeight);
  feedComposer?.setSize(innerWidth, innerHeight);
  game.camera.aspect = innerWidth / innerHeight;
  game.camera.updateProjectionMatrix();
});
prepare().catch(fail);

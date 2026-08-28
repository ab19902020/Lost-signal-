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
import { createOpeningExperience } from './opening.js';
import { createGamepad } from './gamepad.js';
import { composeShoulderCamera } from './third_person_camera.js';
import {
  GUN_SAMPLE_URLS,
  fireSampleForWeapon,
  reloadSamplesForWeapon,
} from './gun_samples.js';

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
const taskListEl = document.getElementById('taskList');
const dayEl = document.getElementById('dayStat');
const clockEl = document.getElementById('clockStat');
const skyEl = document.getElementById('skyStat');
const powerEl = document.getElementById('powerStat');
const waterEl = document.getElementById('waterStat');
const airEl = document.getElementById('airStat');

let resolveGameReady;
const gameReady = new Promise((resolve) => { resolveGameReady = resolve; });
let preparationStarted = false;
const opening = createOpeningExperience({
  hasSave: Boolean(loadRun()),
  onSequenceStart: ({ settings }) => {
    startAudio();
    if (master && ac) master.gain.setValueAtTime(0, ac.currentTime);
    if (settings.master <= 0) ac?.suspend?.();
  },
  onEnter: async ({ restore, settings }) => {
    opening.setLoadStatus('PREPARING SHELTER 47…');
    await ensureGameReady();
    if (!restore) clearRun();
    startAudio();
    if (master && ac) {
      master.gain.setTargetAtTime(.3 * settings.master / 100, ac.currentTime, .04);
    }
    beginGame({ restore });
  },
});
boot.style.display = 'none';

function ensureGameReady() {
  if (!preparationStarted) {
    preparationStarted = true;
    void prepare().catch(fail);
  }
  return gameReady;
}

// Dev-only. The welcome menu is what starts asset loading, so a page opened by
// a QA harness — with nobody to choose CONTINUE or NEW GAME — never builds the
// world and never publishes the __ls handle the harnesses drive. This boots it
// directly and leaves the menu path exactly as a player experiences it.
if (import.meta.env.DEV) {
  globalThis.__lsBoot = () => {
    // Take the menu down first. Its globe animates every frame, and leaving
    // it running through a headless asset load doubles the work a software
    // renderer has to do for the whole of it.
    opening.hide();
    return ensureGameReady();
  };
}

let renderer, composer, renderPass, bloomPass, gradePass, aoPass, feedComposer, feedPass, game;
let currentWorld = 'bunker';
let started = false;
let modal = false;
let cctv = false;
let currentCam = 0;
let yaw = 0;
let pitch = -0.03;
let cameraMode = 'third';
try {
  const savedView = localStorage.getItem('ls.cameraView');
  if (savedView === 'first' || savedView === 'third') cameraMode = savedView;
} catch { /* private browsing can disable storage */ }
let characterYaw = yaw;
let characterGroundY = 0;
let cameraBoom = 3.5;
let cameraShoulder = 0.72;
let danceActive = false;
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
// Recoil used to move the model and nothing else, so a .44 and a suppressed
// SMG aimed identically. A real kick throws the muzzle off the target and the
// player has to bring it back: `recoilPitch` is how far up the sight has been
// thrown, `recoilYaw` how far sideways, and `recoilSettle` is the part of it
// the weapon recovers on its own once the shooter stops firing.
let recoilRecover = 7.5;
let recoilPitch = 0;
let recoilYaw = 0;
let recoilSettlePitch = 0;
let recoilSettleYaw = 0;
let sprinting = false;
let seated = null;
// The car, while you are in it. Driving replaces walking outright: the
// capsule is parked at the seat, the weapon comes down and W/A/S/D go to
// the pedals instead of the legs.
let driving = null;
let flying = null;
let aiming = false;
let jumpQueued = false;
// The on-screen controls' own state. `throttle` is null until a finger has
// touched the lever, so the keyboard and the pad keep it until then.
const touch = { sprint: false, crouch: false, throttle: null, rudder: 0, brake: false };
let breath = 0;
const body = new CharacterBody();
const clock = new THREE.Clock();
const keys = {};
const ray = new THREE.Raycaster();

// The controller. Polled once a frame from simulate(), so it drives exactly
// the same code the keyboard does and cannot drift out of step with it.
// Named `gamepad`, not `pad`: wireControls() has its own `pad` — the on-screen
// movePad element — and a module-scope `pad` read from the top of that
// function resolves to the local one, in its dead zone, which is a startup
// crash rather than a shadowing warning.
const gamepad = createGamepad();
// Analogue movement and look, in the same shape mobile already supplies.
const padMove = { x: 0, y: 0 };
const padDrive = { active: false, throttle: 0, steer: 0, brake: false };
const padFly = { active: false, pitch: 0, roll: 0, yaw: 0, throttle: 0, brake: false };
let padCrouchHeld = false;
let padSprintLatch = false;
let padSprintWas = false;
let padAimWas = false;
let padTriggerHeld = false;
let msgTimer = 0;
// The iris. Walked toward whatever the world the player is standing in asks
// for, so a cut from the shelter to a noon compound is a settle, not a flash.
let exposure = 1;

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

function effectiveCameraMode() {
  // A telescopic optic uses the eye position even when the player's normal
  // preference is third person. Releasing aim returns to that preference.
  return scoped ? 'first' : cameraMode;
}

function syncCameraPresentation() {
  const mode = effectiveCameraMode();
  document.body.classList.toggle('first-person', mode === 'first');
  document.body.classList.toggle('third-person', mode === 'third');
  const button = document.getElementById('viewBtn');
  if (button) {
    button.textContent = cameraMode === 'third' ? 'VIEW 3P' : 'VIEW 1P';
    button.setAttribute('aria-label', cameraMode === 'third'
      ? 'Switch to first-person view' : 'Switch to third-person view');
  }
  if (!game) return mode;
  game.setViewMode?.(mode);
  game.setPlayerVisualActive?.(!driving && !flying);
  return mode;
}

function setCameraMode(mode, { announce = true } = {}) {
  const next = mode === 'first' ? 'first' : 'third';
  if (cameraMode === next) {
    syncCameraPresentation();
    return cameraMode;
  }
  cameraMode = next;
  cameraBoom = next === 'third' ? THIRD_PERSON_DISTANCE : 0;
  cameraShoulder = next === 'third' ? THIRD_PERSON_SHOULDER : 0;
  characterAimRefresh = 0;
  try { localStorage.setItem('ls.cameraView', cameraMode); } catch { /* optional preference */ }
  syncCameraPresentation();
  refreshWeaponView();
  if (announce) flash(cameraMode === 'third'
    ? 'THIRD-PERSON VIEW — GTA CAMERA'
    : 'FIRST-PERSON VIEW', 1500);
  return cameraMode;
}

function toggleCameraMode() {
  return setCameraMode(cameraMode === 'third' ? 'first' : 'third');
}

function fail(error) {
  console.error(error);
  opening.fail(error);
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
  // `foliage` is how much of the countryside gets planted. The layout is the
  // same at every tier — the same hedge lines, the same fields — there is
  // simply less standing in them.
  // Mobile draws directly to the browser's antialiased backbuffer. That is
  // both sharper and several full-screen passes cheaper than upscaling a
  // half-float composer target on a phone.
  mobile: { name: 'mobile', pixelRatio: 1.35, shadows: THREE.PCFShadowMap, samples: 0,
    smaa: false, grain: 0, ao: false, foliage: 0.22, post: false },
  balanced: { name: 'balanced', pixelRatio: 1.65, shadows: THREE.PCFSoftShadowMap, samples: 2,
    smaa: true, grain: 0.003, ao: false, foliage: 0.58, post: true },
  high: { name: 'high', pixelRatio: 2, shadows: THREE.PCFSoftShadowMap, samples: 4,
    smaa: true, grain: 0.006, ao: true, foliage: 1, post: true },
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
let activePixelRatio = Math.min(devicePixelRatio, quality.pixelRatio);
let frameBudgetTime = 0;
let frameBudgetFrames = 0;
let fastFrameWindows = 0;

function applyPixelRatio(ratio) {
  activePixelRatio = THREE.MathUtils.clamp(ratio, 1, Math.min(devicePixelRatio, quality.pixelRatio));
  renderer.setPixelRatio(activePixelRatio);
  renderer.setSize(innerWidth, innerHeight, false);
  if (quality.post) {
    composer?.setPixelRatio(activePixelRatio);
    composer?.setSize(innerWidth, innerHeight);
  }
  feedComposer?.setPixelRatio(activePixelRatio);
  feedComposer?.setSize(innerWidth, innerHeight);
}

function updateFrameBudget(dt) {
  if (quality.name !== 'mobile' || !started || cctv) return;
  if (document.hidden || dt >= .049) {
    frameBudgetTime = 0; frameBudgetFrames = 0; fastFrameWindows = 0;
    return;
  }
  frameBudgetTime += dt;
  frameBudgetFrames++;
  if (frameBudgetTime < 3) return;
  const fps = frameBudgetFrames / frameBudgetTime;
  const maximum = Math.min(devicePixelRatio, quality.pixelRatio);
  if (fps < 52 && activePixelRatio > 1.01) {
    applyPixelRatio(activePixelRatio - .12);
    fastFrameWindows = 0;
  } else if (fps > 59 && activePixelRatio < maximum - .01) {
    fastFrameWindows++;
    if (fastFrameWindows >= 2) {
      applyPixelRatio(activePixelRatio + .06);
      fastFrameWindows = 0;
    }
  } else {
    fastFrameWindows = 0;
  }
  frameBudgetTime = 0;
  frameBudgetFrames = 0;
}

function createRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', alpha: false });
  renderer.setPixelRatio(activePixelRatio);
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
  const target = new THREE.WebGLRenderTarget(quality.post ? size.x : 1,
    quality.post ? size.y : 1, {
    type: quality.post ? THREE.HalfFloatType : THREE.UnsignedByteType,
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

  gradePass = new ShaderPass(GradeShader);
  gradePass.uniforms.grain.value = quality.grain;
  if (quality.post) {
    bloomPass = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.11, 0.34, 1.02);
    composer.addPass(bloomPass);
    composer.addPass(gradePass);
    composer.addPass(new OutputPass());
    if (quality.smaa && !quality.samples) composer.addPass(new SMAAPass(size.x, size.y));
  } else {
    // The loop writes these two fields on every tier. A tiny value object keeps
    // that path branch-free without allocating bloom's pyramid of render targets.
    bloomPass = { strength: 0, threshold: 1 };
  }

  // The CCTV feed gets its own chain so the monitor look never touches the
  // first-person view.
  const feedTarget = new THREE.WebGLRenderTarget(size.x, size.y, {
    type: THREE.UnsignedByteType,
    samples: 0,
    colorSpace: THREE.LinearSRGBColorSpace,
  });
  feedComposer = new EffectComposer(renderer, feedTarget);
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
      opening.setLoadStatus(`BRINGING SITE SYSTEMS ONLINE — ${step}/${total}`);
    });

    game = createGameWorld(assets, { foliage: quality.foliage, quality: quality.name });
    game.camera.rotation.order = 'YXZ';
    syncCameraPresentation();

    createComposer();
    // Build the static ballistics lists while the loading screen is still up.
    // No trigger pull should pay for a full scene traversal.
    for (const scene of Object.values(game.scenes || {})) worldGeometry(scene);
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
        start: () => { opening.hide(); beginGame({ restore: false }); },
        look: (y, p = pitch) => { yaw = y; pitch = p; },
        view: (mode) => mode ? setCameraMode(mode, { announce: false }) : cameraMode,
        dance: (active = true) => setDancing(active, { announce: false }),
        character: () => ({
          name: game.playerCharacter?.model?.name ?? null,
          visible: game.playerCharacter?.root?.visible ?? false,
          weaponVisible: game.playerCharacter?.weaponMount?.visible ?? false,
          animation: game.playerCharacter?.animationState?.() ?? null,
          animations: game.playerCharacter?.animationNames?.() ?? [],
          weaponFamily: game.playerCharacter?.weaponFamily?.() ?? null,
          gripError: game.playerCharacter?.gripError?.() ?? null,
          bounds: game.playerCharacter?.bounds?.().getSize(new THREE.Vector3()).toArray()
            .map((value) => +value.toFixed(3)) ?? null,
        }),
        // The height is optional and defaults to keeping the one they have,
        // which is wrong after climbing out of an aeroplane at altitude:
        // a harness that only sets x and z then drops the player from
        // seven hundred feet and photographs the fall.
        moveTo: (x, z, y = body.position.y) => body.teleport(x, y, z),
        world: (name) => { currentWorld = name; const spawn = game.setWorld(name); body.teleport(spawn.x, spawn.y, spawn.z); setShotSpace(name); },
        openCam: (i) => { currentCam = i; openCCTV(); },
        exposure: (v) => {
          if (v !== undefined) { exposure = v; renderer.toneMappingExposure = v; }
          return renderer.toneMappingExposure;
        },
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
        usable: (key) => isUsable(key),
        // What the player is being offered where they stand and look. The
        // aeroplane was unreachable for a whole release because nothing
        // checked this: the route to it was clear and the prompt to board it
        // could still never appear.
        prompt: () => game.nearestInteraction(currentWorld)?.name ?? null,
        weapon: () => ({
          key: weaponKey, name: weapon?.name, family: weapon?.family,
          kind: weapon?.kind, automatic: !!weapon?.automatic,
          magazine: weapon?.magazine ?? 0, ammo, reserve,
          model: game.weaponAction?.children
            .find((child) => child.name.startsWith('Equipped_'))?.name ?? null,
        }),
        decals: () => decals.count(),
        // How much is in the air right now: gore, dust and sparks.
        particles: () => debris.length,
        marks: () => decals.total(),
        reload: () => reload(),
        // Render one shot into an offline context and measure it. A harness
        // cannot listen, but it can prove every gun makes a distinct sound
        // with a real transient on the front of it, in the room the player is
        // actually standing in.
        renderShot: async (key = weaponKey, world = currentWorld, seconds = 1.4) => {
          const spec = WEAPONS[key];
          if (!spec) return null;
          const live = { ac, master, shotDry, shotConvolver, shotWet, shotNoise, currentWorld };
          const rate = 44100;
          const offline = new OfflineAudioContext(2, Math.ceil(rate * seconds), rate);
          ac = offline;
          master = offline.createGain();
          master.gain.value = 1;
          master.connect(offline.destination);
          shotDry = null; shotConvolver = null; shotWet = null; shotNoise = null;
          const spaces = [...shotSpaceCache.entries()];
          shotSpaceCache.clear();
          currentWorld = world;
          let rendered;
          try {
            weaponFireSound(spec);
            rendered = await offline.startRendering();
          } finally {
            ac = live.ac; master = live.master;
            shotDry = live.shotDry; shotConvolver = live.shotConvolver;
            shotWet = live.shotWet; shotNoise = live.shotNoise;
            currentWorld = live.currentWorld;
            shotSpaceCache.clear();
            for (const [k, v] of spaces) shotSpaceCache.set(k, v);
          }
          const data = rendered.getChannelData(0);
          let peak = 0;
          let energy = 0;
          for (let i = 0; i < data.length; i++) {
            const v = Math.abs(data[i]);
            if (v > peak) peak = v;
            energy += data[i] * data[i];
          }
          let attack = 0;
          for (let i = 0; i < data.length; i++) {
            if (Math.abs(data[i]) >= peak * 0.9) { attack = i / rate; break; }
          }
          // Where the sound has fallen to a thousandth of its peak: how long
          // the room holds on to it.
          let tail = 0;
          for (let i = data.length - 1; i >= 0; i--) {
            if (Math.abs(data[i]) > peak * 0.001) { tail = i / rate; break; }
          }
          return {
            peak: +peak.toFixed(4),
            rms: +Math.sqrt(energy / data.length).toFixed(5),
            attack: +attack.toFixed(4),
            tail: +tail.toFixed(3),
          };
        },
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
        // What the sight is doing right now, so a harness can measure a
        // weapon's recoil rather than trusting the catalogue.
        recoil: () => ({
          pitch: +recoilPitch.toFixed(5), yaw: +recoilYaw.toFixed(5),
          burst: burstCount, punch: +recoilPunch.toFixed(3),
          roll: +recoilRoll.toFixed(5),
        }),
        // Driving, for the harness: get in, hold the pedals for a while, read
        // the speed off, get out.
        vehicles: () => (game.vehicles || []).map((v) => ({
          name: v.root.name,
          x: +v.state.x.toFixed(3), z: +v.state.z.toFixed(3),
          heading: +v.state.heading.toFixed(4),
          speed: +v.state.speed.toFixed(3),
          occupied: v.state.occupied,
        })),
        drive: (index = 0) => enterVehicle((game.vehicles || [])[index]),
        driving: () => (driving ? {
          name: driving.root.name,
          x: +driving.state.x.toFixed(3), z: +driving.state.z.toFixed(3),
          heading: +driving.state.heading.toFixed(4),
          speed: +driving.state.speed.toFixed(3),
          steer: +driving.state.steer.toFixed(4),
          spin: +driving.state.wheelSpin.toFixed(3),
        } : null),
        pedals: (throttle = 1, steer = 0, brake = false) => {
          keys.KeyW = throttle > 0;
          keys.KeyS = throttle < 0;
          keys.KeyD = steer > 0;
          keys.KeyA = steer < 0;
          keys.Space = !!brake;
        },
        park: () => leaveVehicle(false) || leaveAircraft(false),
        // Flying, for a harness: get in, hold the stick and the throttle, read
        // the state off the aeroplane.
        fly: (index = 0) => enterAircraft(game.aircraft?.[index]),
        flying: () => (flying ? {
          airspeed: +flying.state.airspeed.toFixed(3),
          altitude: +flying.state.altitude.toFixed(3),
          throttle: +flying.state.throttle.toFixed(3),
          grounded: flying.state.grounded,
          stalled: flying.state.stalled,
          alpha: +flying.state.alpha.toFixed(4),
          nose: +Math.asin(Math.max(-1, Math.min(1,
            new THREE.Vector3(0, 0, -1).applyQuaternion(flying.state.quaternion).y))).toFixed(4),
          vy: +flying.state.velocity.y.toFixed(3),
          controlPitch: +flying.state.controls.pitch.toFixed(3),
          // The inputs, as handed to the aeroplane. The brakes leave no trace
          // on its state — they are a deceleration applied and forgotten — so
          // there is otherwise no way to ask whether a control reached them.
          input: {
            throttle: +flyControls.throttle.toFixed(3),
            yaw: +flyControls.yaw.toFixed(3),
            pitch: +flyControls.pitch.toFixed(3),
            roll: +flyControls.roll.toFixed(3),
            brake: !!flyControls.brake,
          },
        } : null),
        stick: (pitchInput = 0, roll = 0, yawInput = 0, throttle = null, brake = false) => {
          keys.Space = !!brake;
          flyStick.pitch = pitchInput;
          flyStick.roll = roll;
          keys.KeyD = yawInput > 0;
          keys.KeyA = yawInput < 0;
          if (throttle !== null) flyControls.throttle = throttle;
          // The stick is held, not flicked: stop it self-centring under the
          // harness between one simulate() and the next.
          flyHeld = true;
        },
        // The controller, for a harness that fakes one with a virtual pad.
        pad: () => ({
          connected: gamepad.connected, id: gamepad.id, dualsense: gamepad.dualsense,
          move: { ...gamepad.state.move }, look: { ...gamepad.state.look },
          l2: gamepad.state.l2, r2: gamepad.state.r2,
          down: { ...gamepad.state.down },
          pressed: { ...gamepad.state.pressed },
        }),
        lights: (on) => (driving ? (on === undefined ? driving.toggleLights() : driving.setLights(on)) : null),
        horn: () => hornSound(),
        holster: (on) => setHolstered(on === undefined ? !holstered : on, { announce: false }),
        wheel: (open) => (open === false ? closeWheel(false) : openWheel()),
        // The perimeter gate runs itself off its approach loop; this sets the
        // mode switch on the post so a harness can pin it open or shut.
        gate: (mode) => {
          if (mode !== undefined) {
            game.setGateMode(mode === true ? 'hold' : (mode === false ? 'lock' : mode));
          }
          return { mode: game.gateMode(), open: game.gateIsOpen(), travel: game.gateTravel() };
        },
        aim2: () => ({ yaw, pitch }),
        time: (value) => { game.sky?.setTimeOfDay(value); updateStats(); },
        weather: (value) => { game.sky?.setWeather(value); },
        sky: () => ({ ...game.sky?.state }),
        // What the grade is actually set to, so a harness can read the look
        // instead of squinting at a screenshot of it.
        grade: () => ({
          tone: gradePass.uniforms.tone.value,
          contrast: gradePass.uniforms.contrast.value,
          saturation: gradePass.uniforms.saturation.value,
          vignette: gradePass.uniforms.vignette.value,
          lift: gradePass.uniforms.lift.value.toArray().map((v) => +v.toFixed(4)),
        }),
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
        debug: () => ({ started, modal, cctv, aiming, holstered, sprinting, armed,
          reloading, weaponKey, wheelOpen, touchSprint: touch.sprint, touchMode,
          cameraMode, effectiveCameraMode: effectiveCameraMode(), cameraBoom,
          helpOpen: helpOpen(), driving: !!driving, flying: !!flying, seated: !!seated,
          keys: Object.keys(keys).filter(k => keys[k]), speed: body.horizontalSpeed }),
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
        // Put the camera back on the player after a freecam look. Without this
        // a harness that framed a shot could never film the game again.
        play: () => {
          const cam = game.camera;
          cam.parent?.remove(cam);
          game.player.add(cam);
          cam.position.set(0, body.eyeHeight, 0);
          cam.rotation.set(pitch, yaw, 0);
          cam.fov = 70;
          cam.updateProjectionMatrix();
          started = true;
        },
      };
    }
    engineState.textContent = '✓ Shelter 47, walk-in armoury, habitation silo and service rifle loaded.';
    backendEl.textContent = `S47 INTERNAL // EXTERNAL LINK LOST // ${quality.name.toUpperCase()} DISPLAY`;
    startButton.disabled = false;
    startButton.textContent = 'ENTER SHELTER';
    opening.setReady();
    resolveGameReady();
    renderer.setAnimationLoop(loop);
  } catch (err) {
    console.error(err);
    opening.fail(err);
    engineState.innerHTML = `<span style="color:#ff9b88">ASSET LOAD FAILED: ${String(err?.message || err)}</span><br>The project will not substitute primitive animals. Reload after the asset workflow finishes.`;
    startButton.disabled = false;
    startButton.textContent = 'RETRY ASSET LOAD';
    startButton.onclick = () => location.reload();
    renderer?.setAnimationLoop(() => renderer.clear());
  }
}

function wireGameEvents() {
  let lastGateAttackNotice = -Infinity;
  let lastSiloAttackNotice = -Infinity;
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
    // He answers. A whine when he is still working you out, a bark once he
    // has decided.
    dogSound(event.detail?.bonded ? 'bark' : 'whine');
    if (event.detail?.bonded) completeObjective('dog');
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

  addEventListener('lostsignal:gate', (e) => {
    // The gate shuts itself once the drive is clear, and the drive is clear
    // the moment you go down the hatch. Nobody in the shelter can hear it.
    if (currentWorld !== 'outside') return;
    gateSound(e.detail.open);
    flash(e.detail.open
      ? 'PERIMETER GATE — LOOP DETECT · RUNNING BACK'
      : 'PERIMETER GATE — DRIVE CLEAR · CLOSING', 2200);
  });

  addEventListener('lostsignal:gatemode', (e) => {
    flash(e.detail.mode === 'auto' ? 'PERIMETER GATE SET TO AUTOMATIC'
      : e.detail.mode === 'hold' ? 'PERIMETER GATE HELD OPEN'
        : 'PERIMETER GATE LOCKED SHUT', 2400);
  });

  addEventListener('lostsignal:drive', (e) => {
    enterVehicle(e.detail?.vehicle);
  });

  addEventListener('lostsignal:fly', (e) => {
    enterAircraft(e.detail?.aircraft);
  });

  addEventListener('lostsignal:enemyattack', (event) => {
    if (!started || currentWorld !== 'outside' || driving || flying || health <= 0) return;
    const enemy = event.detail?.enemy;
    if (!enemy?.parent || enemy.userData.alive === false) return;
    damage(Math.max(1, event.detail?.damage || 7));
    flash('HOSTILE ATTACK — BREAK CONTACT OR RETURN FIRE', 1000);
  });

  addEventListener('lostsignal:gateattack', (event) => {
    const now = performance.now();
    if (now - lastGateAttackNotice < 2400) return;
    lastGateAttackNotice = now;
    const integrity = Math.max(0, event.detail?.integrity ?? 0);
    const maximum = Math.max(1, event.detail?.maximum ?? 100);
    flash(`SILO ALERT — HOSTILES ATTACKING PERIMETER GATE · ${Math.round(integrity / maximum * 100)}%`, 2200);
    clickSound(145, .16, .055);
  });

  addEventListener('lostsignal:gatebreach', () => {
    crashSound(.72);
    flash('PERIMETER BREACHED — HOSTILES INSIDE THE COMPOUND', 3600);
  });

  addEventListener('lostsignal:siloattack', (event) => {
    const now = performance.now();
    if (now - lastSiloAttackNotice < 2200) return;
    lastSiloAttackNotice = now;
    const integrity = Math.max(0, event.detail?.integrity ?? 0);
    const maximum = Math.max(1, event.detail?.maximum ?? 100);
    flash(`SHELTER DOOR UNDER ATTACK · INTEGRITY ${Math.round(integrity / maximum * 100)}%`, 2100);
    clickSound(112, .2, .06);
  });

  addEventListener('lostsignal:silobreach', () => {
    crashSound(1);
    flash('SILO SECURITY FAILED — THE ATTACKERS BROKE IN', 5000);
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
  { id: 'defend', text: 'Protect the silo from the two attackers coming down the road' },
  { id: 'cameras', text: 'Sweep the CCTV feeds, including the silo' },
  { id: 'hatch', text: 'Unseal the hatch in the shelter floor' },
  { id: 'descend', text: 'Descend into Silo 47' },
  { id: 'resident', text: 'Speak to someone who lives down there' },
  { id: 'secure', text: 'Find the secure unit on the top landing' },
  { id: 'hydroponics', text: 'Reach the hydroponics levels' },
  { id: 'cache', text: 'Find the silo stores at the bottom' },
  { id: 'drive', text: 'Get the estate car at the gate running and drive it' },
  { id: 'dog', text: 'Make friends with the dog on the top gallery' },
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
  leaveVehicle(false);
  seated = null;
  setAiming(false);
  currentWorld = name;
  const spawn = game.setWorld(name);
  body.teleport(spawn.x, spawn.y, spawn.z);
  yaw = facing;
  pitch = tilt;
  setOutdoorAudio(name === 'outside');
  setShotSpace(name);
}

// --- Driving ---------------------------------------------------------------
// Getting in parks the walking body under the car and hands W/A/S/D to the
// pedals. Getting out looks for a doorstep that is not inside anything and
// stands the player there.
const _carPoint = new THREE.Vector3();

function enterVehicle(vehicle) {
  if (!vehicle || driving || currentWorld !== 'outside') return false;
  // Both hands are on the wheel. The weapon goes away on the way in and comes
  // back out on the way out, unless it was already put away — in which case it
  // stays where the player left it.
  closeWheel(false);
  holsteredForDrive = armed && !holstered;
  if (holsteredForDrive) setHolstered(true, { announce: false });
  driving = vehicle;
  refreshWeaponView();
  vehicle.occupied = true;
  setAiming(false);
  setScoped(false);
  seated = null;
  sprinting = false;
  touch.sprint = false;
  touch.crouch = false;
  document.getElementById('sprintBtn').classList.remove('on');
  document.getElementById('crouchBtn').classList.remove('on');
  document.body.classList.add('driving');
  // The chase camera starts behind the nose. The car's heading and the
  // player's yaw are the same number: both are measured off -Z.
  yaw = vehicle.heading;
  pitch = CHASE_PITCH;
  startEngineAudio();
  flash(`${vehicle.label} — DRIVING · [ E ] TO GET OUT`, 3000);
  completeObjective('drive');
  return true;
}

function leaveVehicle(showMessage = true) {
  if (!driving) return false;
  const vehicle = driving;
  const step = vehicle.doorstep();
  driving = null;
  if (holsteredForDrive) { holsteredForDrive = false; setHolstered(false, { announce: false }); }
  refreshWeaponView();
  vehicle.occupied = false;
  document.body.classList.remove('driving');
  stopEngineAudio();
  body.teleport(step.x, step.y + 0.05, step.z);
  game.player.position.copy(body.position);
  game.camera.position.set(0, body.eyeHeight, 0);
  pitch = -0.02;
  if (showMessage) flash('OUT OF THE CAR');
  return true;
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

const helpOpen = () => document.getElementById('help').classList.contains('open');

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
  if (flying) { leaveAircraft(); return; }
  if (leaveVehicle()) return;
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
// The eyepiece opens and closes rather than snapping, which is what stops the
// transition reading as a black rectangle appearing.
let scopeOpen = 0;

function setScoped(value) {
  const next = !!value && !!weapon?.scope;
  if (scoped === next) return scoped;
  scoped = next;
  document.body.classList.toggle('scoped', scoped);
  refreshWeaponView();
  if (scoped && scopeRangeEl) scopeRangeEl.textContent = `${weapon.scope} — ${weapon.name}`;
  return scoped;
}

/** Stop sprinting, and put every control that latches it back to off. */
function releaseSprint() {
  sprinting = false;
  touch.sprint = false;
  padSprintLatch = padSprintWas = false;
  document.getElementById('sprintBtn')?.classList.remove('on');
}

function setAiming(value) {
  if (value) {
    setDancing(false, { announce: false });
    // Aiming is also the natural way to bring a holstered weapon back up,
    // including one put away automatically when the player started dancing.
    if (armed && holstered) setHolstered(false, { announce: false });
  }
  // Asking to aim while running stops the running, rather than the running
  // refusing the aim. RUN is a latch on touch and on the pad, so the old rule
  // made it possible to be stuck sprinting with the sights permanently
  // unavailable and no obvious reason why — and once sprint stopped being
  // limited by stamina, nothing ever released that latch on its own.
  if (value && (sprinting || touch.sprint)) releaseSprint();
  const next = !!value && armed && !reloading && !modal && !cctv && !seated && !driving;
  if (aiming === next) return aiming;
  aiming = next;
  characterAimRefresh = 0;
  document.body.classList.toggle('aiming', aiming);
  document.getElementById('aimBtn')?.classList.toggle('on', aiming);
  setScoped(aiming);
  return aiming;
}

function queueJump() {
  if (!started || modal || cctv || driving) return false;
  if (seated) {
    leaveSeat();
    return false;
  }
  jumpQueued = true;
  setDancing(false, { announce: false });
  setAiming(false);
  return true;
}

// A weapon's spread is quoted in normalised device coordinates, where 1.0 is
// half the screen. Multiplying up here keeps the catalogue's numbers readable
// (0.011 for a rifle, 0.098 for a sawn-off) while still opening a shotgun to a
// real cone rather than a slightly fat point.
const SPREAD_TO_NDC = 3;
const PERSON_KINDS = ['resident', 'quartermaster', 'enemy'];
const CREATURE_KINDS = ['deer', 'rabbit', 'zombie', ...PERSON_KINDS];
const _shotOrigin = new THREE.Vector3();
const _shotDirection = new THREE.Vector3();
const _shotJitter = new THREE.Vector2();
const _hitNormal = new THREE.Vector3();
const _normalMatrix = new THREE.Matrix3();
const _crosshairTarget = new THREE.Vector3();
const _ballisticTarget = new THREE.Vector3();
const _centreAim = Object.freeze({ x: 0, y: 0 });
const cameraAimRay = new THREE.Raycaster();
let characterAimRefresh = 0;

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

// Putting it away.
//
// A weapon was drawn or it did not exist, so there was no way to walk up to
// somebody with your hands empty, and getting into the car left a rifle
// hanging in the chase camera behind the boot. Holstered is a third state: the
// weapon is still on the player and still loaded, it is simply not out.
let holstered = false;
let holsteredForDrive = false;

/**
 * The one place that decides whether the weapon is on screen.
 *
 * Four things can take it off — not being armed at all, looking down a scope
 * (the optic replaces the view), having put it away, and driving — and they
 * were being written from four different places, so whichever ran last won.
 */
function refreshWeaponView() {
  const carrying = armed && !holstered;
  if (game) {
    syncCameraPresentation();
    game.setWeaponVisible?.(carrying && !scoped && !driving && !flying);
  }
  document.body.classList.toggle('armed', carrying);
  document.body.classList.toggle('holstered', armed && holstered);
}

function setHolstered(value, { announce = true } = {}) {
  const next = !!value && armed;
  if (holstered === next) return holstered;
  holstered = next;
  if (holstered) setAiming(false);
  refreshWeaponView();
  if (announce && armed) {
    flash(holstered ? `${weapon?.name || 'WEAPON'} HOLSTERED` : `${weapon?.name || 'WEAPON'} DRAWN`, 1400);
    clickSound(holstered ? 280 : 380, .07, .045);
  }
  return holstered;
}

/** D-pad dance: explicit, cancellable, and never mistaken for an idle. */
function setDancing(value, { announce = true } = {}) {
  const next = !!value && started && !modal && !cctv && !seated && !driving && !flying;
  if (next === danceActive) return danceActive;
  danceActive = next;
  if (danceActive) {
    setAiming(false);
    if (armed && !holstered) setHolstered(true, { announce: false });
  }
  if (announce) flash(danceActive ? 'DANCE — D-PAD DOWN TO STOP' : 'DANCE STOPPED', 1300);
  return danceActive;
}

function toggleDance() {
  return setDancing(!danceActive);
}

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
  danceActive = false;
  holstered = false;
  reloading = false;
  reloadTimer = 0;
  queuedReload = 0;
  shotCooldown = 0;
  setAiming(false);
  game.setArmed(key);
  game.armory?.setEquipped(carried);
  refreshWeaponView();
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
  const add = (root) => {
    if (!root?.parent || root.userData.alive === false) return;
    const volumes = root.userData.hitVolumes;
    if (volumes?.length) targets.push(...volumes.filter((volume) => volume.visible));
    else targets.push(root);
  };
  for (const root of game.wildlife) {
    add(root);
  }
  if (currentWorld === 'silo') {
    for (const root of game.residents?.residents || []) {
      add(root);
    }
  }
  if (currentWorld === 'outside') {
    for (const root of game.townsfolk || []) {
      add(root);
    }
  }
  const eli = game.armory?.quartermaster;
  if (currentWorld === 'bunker') add(eli);
  return targets;
}

function targetRootOf(object) {
  let node = object;
  while (node && !CREATURE_KINDS.includes(node.userData.kind)) node = node.parent;
  return node || null;
}

// Static mesh discovery happens once per scene. The old path recursively
// traversed every top-level world object for every pellet and then intersected
// the two uploaded building scans triangle-by-triangle. Bounds reject almost
// everything here; the scans themselves expose cheap ballistic proxies.
const worldMeshCache = new WeakMap();
const _ballisticCandidates = [];
const _ballisticHits = [];
const _ballisticSphere = new THREE.Sphere();
const _ballisticDelta = new THREE.Vector3();

function descendsFrom(node, ancestor) {
  for (let cursor = node; cursor; cursor = cursor.parent) {
    if (cursor === ancestor) return true;
  }
  return false;
}

function worldGeometry(world) {
  if (worldMeshCache.has(world)) return worldMeshCache.get(world);
  const meshes = [];
  world.traverse((part) => {
    if ((!part.isMesh && !part.isSkinnedMesh) || part.userData.isDecal
      || part.userData.skipBallistics || part.userData.hitProxy
      || targetRootOf(part) || descendsFrom(part, game.player)) return;
    if (part.isInstancedMesh && !part.userData.ballisticSolid) return;
    const materials = Array.isArray(part.material) ? part.material : [part.material];
    if (!part.userData.ballisticProxy && materials.every((material) => material?.visible === false)) return;
    if (part.isInstancedMesh) part.computeBoundingSphere();
    else if (!part.geometry?.boundingSphere) part.geometry?.computeBoundingSphere();
    meshes.push(part);
  });
  worldMeshCache.set(world, meshes);
  return meshes;
}

function canRayHitBounds(object, caster) {
  let sphere = null;
  if (object.isInstancedMesh) {
    if (!object.boundingSphere) object.computeBoundingSphere();
    sphere = object.boundingSphere;
  } else {
    if (!object.geometry?.boundingSphere) object.geometry?.computeBoundingSphere();
    sphere = object.geometry?.boundingSphere;
  }
  if (!sphere) return true;
  _ballisticSphere.copy(sphere).applyMatrix4(object.matrixWorld);
  _ballisticDelta.copy(_ballisticSphere.center).sub(caster.ray.origin);
  const along = _ballisticDelta.dot(caster.ray.direction);
  if (along < -_ballisticSphere.radius || along > caster.far + _ballisticSphere.radius) return false;
  return caster.ray.distanceSqToPoint(_ballisticSphere.center)
    <= _ballisticSphere.radius * _ballisticSphere.radius;
}

function firstWorldImpact(world, caster = ray) {
  _ballisticCandidates.length = 0;
  for (const object of worldGeometry(world)) {
    if (!object.visible || !canRayHitBounds(object, caster)) continue;
    _ballisticCandidates.push(object);
  }
  _ballisticHits.length = 0;
  caster.intersectObjects(_ballisticCandidates, false, _ballisticHits);
  return _ballisticHits.find((hit) => hit.object.userData.ballisticProxy
    || (hit.object.isMesh && hit.object.visible && !targetRootOf(hit.object)));
}

/**
 * Resolve what the centre-screen crosshair actually covers. The character and
 * weapon use this same point, so camera composition, visible muzzle and hit
 * detection cannot disagree about the target.
 */
function crosshairTarget(world, ndc = _centreAim, range = weapon?.range ?? 90, out = _crosshairTarget) {
  game.camera.updateWorldMatrix(true, false);
  cameraAimRay.setFromCamera(ndc, game.camera);
  cameraAimRay.far = range;
  const living = cameraAimRay.intersectObjects(livingTargets(), true)[0];
  const solid = firstWorldImpact(world, cameraAimRay);
  const hit = living && (!solid || living.distance <= solid.distance) ? living : solid;
  return hit ? out.copy(hit.point) : cameraAimRay.ray.at(range, out);
}

function animatedCrosshairTarget(dt) {
  characterAimRefresh -= dt;
  if (characterAimRefresh <= 0) {
    crosshairTarget(activeScene());
    // Exact ballistics are still resolved on every shot. The visible arm rig
    // only needs a 30 Hz target while aiming (15 Hz at the hip), which avoids
    // traversing the full bunker mesh sixty times a second on a phone.
    characterAimRefresh = aiming ? 1 / 30 : 1 / 15;
  }
  return _crosshairTarget;
}

/**
 * Third person uses a converging ballistic ray: first acquire the crosshair's
 * point from the shoulder camera, then trace from the visible muzzle to that
 * point. A wall beside the character can therefore block the gun even when
 * the camera can see around it, as it does in a modern over-shoulder shooter.
 */
function setShotRay(world, ndc, range) {
  if (effectiveCameraMode() !== 'third') {
    ray.setFromCamera(ndc, game.camera);
    ray.far = range;
    return;
  }
  crosshairTarget(world, ndc, range, _ballisticTarget);
  const muzzle = game.playerCharacter?.muzzleWorldPosition?.(_shotOrigin);
  if (!muzzle) {
    ray.setFromCamera(ndc, game.camera);
    ray.far = range;
    return;
  }
  _shotDirection.copy(_ballisticTarget).sub(muzzle);
  const distance = _shotDirection.length();
  if (distance < 1e-4) {
    ray.setFromCamera(ndc, game.camera);
    ray.far = range;
    return;
  }
  ray.set(muzzle, _shotDirection.multiplyScalar(1 / distance));
  ray.far = distance + 0.12;
}

/**
 * One round (or one pellet). Returns true if it found something alive.
 * `spread` is the half-angle of the cone, already converted to NDC.
 */
function fireRound(world, spread, damage, targets) {
  _shotJitter.set(spread > 0 ? (Math.random() * 2 - 1) * spread : 0,
    spread > 0 ? (Math.random() * 2 - 1) * spread : 0);
  setShotRay(world, _shotJitter, weapon.range ?? 90);

  const living = ray.intersectObjects(targets, true);
  const livingHit = living.find((hit) => targetRootOf(hit.object)?.userData.alive !== false);
  const target = livingHit ? targetRootOf(livingHit.object) : null;
  const impact = firstWorldImpact(world);

  // Whichever came first. Checking the living list on its own let every weapon
  // shoot straight through the bulkhead it was pointed at.
  if (target && (!impact || livingHit.distance <= impact.distance)) {
    // gore() re-uses this raycaster to throw spatter, so the round's own
    // direction has to be taken off it first.
    _shotDirection.copy(ray.ray.direction);
    resolveHit(target, livingHit.point, damage, _shotDirection);
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
      _hitNormal.copy(ray.ray.origin).sub(impact.point).normalize();
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
  setDancing(false, { announce: false });
  if (armed && holstered) setHolstered(false, { announce: false });
  if (!armed || reloading || modal || cctv || !started || driving || flying) return false;
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
  kick(weapon);

  // fire() runs from an input event, so the camera still holds last frame's
  // matrix. Aiming off by a frame of mouse movement is a miss at range.
  const world = activeScene();
  world.updateMatrixWorld();

  game.range?.countShot();
  const spread = (aiming ? (weapon.adsSpread ?? 0) : (weapon.spread ?? 0)) * SPREAD_TO_NDC;
  const pellets = Math.max(1, weapon.pellets ?? 1);
  const targets = livingTargets();
  let struck = false;
  for (let i = 0; i < pellets; i++) {
    struck = fireRound(world, spread, weapon.damage, targets) || struck;
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
  game.playerCharacter?.triggerAction?.('melee');
  game.playGun('shoot');
  weaponFireSound(weapon);
  const world = activeScene();
  world.updateMatrixWorld();
  setShotRay(world, _centreAim, weapon.reach ?? 2);
  const living = ray.intersectObjects(livingTargets(), true);
  const target = living.length ? targetRootOf(living[0].object) : null;
  if (target) {
    _shotDirection.copy(ray.ray.direction);
    resolveHit(target, living[0].point, weapon.damage, _shotDirection);
    alarmBystanders(0.6);
    return true;
  }
  // A swing that lands on a wall still scrapes it.
  const impact = firstWorldImpact(world);
  if (impact) {
    if (impact.face) {
      _normalMatrix.getNormalMatrix(impact.object.matrixWorld);
      _hitNormal.copy(impact.face.normal).applyMatrix3(_normalMatrix).normalize();
    } else {
      _hitNormal.copy(ray.ray.origin).sub(impact.point).normalize();
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

function resolveHit(target, point, damage = weapon?.damage ?? 34, direction = ray.ray.direction) {
  const kind = target.userData.kind;
  if (PERSON_KINDS.includes(kind)) return resolvePersonHit(target, point, damage, direction);

  // How much of a mess a round makes: a shotgun at close range is not a
  // nine-millimetre, and a pellet on its own is not the whole cartridge.
  const weight = goreWeight();
  const agent = game.creatures.agentFor(target);

  if (kind !== 'zombie') {
    gore(point, direction, weight, { fatal: true });
    if (agent?.kill()) {
      bloodPool(target);
      flash(`${kind.toUpperCase()} DOWN — APPROACH TO HARVEST`, 1700);
    }
    return;
  }

  // Height above the infected's feet decides where the round landed.
  const headshot = point.y - target.position.y > 1.42;
  gore(point, direction, weight * (headshot ? 1.7 : 1), { fatal: headshot });
  target.userData.hp = (target.userData.hp ?? 3) - (headshot ? 3 : 1);
  if (target.userData.hp <= 0) {
    if (agent?.kill()) {
      bloodPool(target);
      flash(headshot ? 'HEADSHOT — INFECTED DOWN' : 'INFECTED DOWN', 1300);
    }
    return;
  }
  if (agent) agent.stagger = agent.staggerTime;
  flash('INFECTED HIT', 700);
}

// Shooting someone is a thing the shelter lets you do, and it has to look like
// what it is: they take the round where it landed, and if it kills them they go
// down on the deck and stay there.
function resolvePersonHit(target, point, damage, direction = ray.ray.direction) {
  const headshot = point.y - target.position.y > 1.5;
  const multiplier = headshot ? (weapon?.headshot ?? 2.2) : 1;
  target.userData.hp = (target.userData.hp ?? 100) - damage * multiplier;
  const name = target.userData.kind === 'quartermaster' ? 'QUARTERMASTER ELI'
    : target.userData.kind === 'enemy' ? 'HOSTILE' : 'RESIDENT';
  const fatal = target.userData.hp <= 0;
  gore(point, direction, goreWeight() * (headshot ? 1.8 : 1), { fatal });

  if (!fatal) {
    flash(`${name} HIT`, 900);
    alarmBystanders(1);
    return;
  }

  // Three kinds of person, three places that know how to put one down: the
  // silo's own crowd, the quartermaster, and the two still in the town.
  const agent = game.residents?.agentFor?.(target);
  const downed = agent ? agent.kill()
    : (game.townsfolk?.includes(target) ? game.downTownsfolk(target)
      : game.armory?.downQuartermaster?.());
  if (downed !== false) {
    bloodPool(target);
    flash(headshot ? `${name} DOWN — HEADSHOT` : `${name} DOWN`, 2200);
    alarmBystanders(1.4);
    if (target.userData.kind === 'enemy'
      && game.townEnemies?.agents?.every((enemy) => enemy.dead)) {
      completeObjective('defend');
      setTimeout(() => flash('SILO DEFENDED — BOTH ATTACKERS ARE DOWN', 3600), 450);
    }
  }
}

/**
 * How much of a mess the weapon in hand makes of one hit.
 *
 * Calibre carries most of it, but a shotgun's damage is split across its
 * pellets, so each pellet has to throw a fraction or a cartridge of buckshot
 * paints the room.
 */
function goreWeight() {
  const calibre = weapon?.calibre ?? 0.09;
  const pellets = Math.max(1, weapon?.pellets ?? 1);
  if (weapon?.kind === 'melee') return 0.55;
  return THREE.MathUtils.clamp(calibre * 9 / Math.sqrt(pellets), 0.3, 2.2);
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

/**
 * Throw the sight off the target.
 *
 * Vertical kick is most of it and is consistent, so it can be learned and
 * pulled down against; the horizontal component is smaller and random, so a
 * long burst wanders. Aiming down the sights braces the weapon and cuts both.
 * Most of the throw settles back on its own, which is what lets a semi-
 * automatic be fired quickly without the aim climbing away entirely.
 */
// How many rounds have gone in quick succession, and the punch the weapon
// itself is still carrying. Burst count is what makes automatic fire feel like
// automatic fire: the fifth round has to cost more than the first, or holding
// the trigger is free.
let burstCount = 0;
let burstRest = 0;
let recoilPunch = 0;
let recoilRoll = 0;
const FALLBACK_KICK = {
  rise: .0058, swing: .0021, bias: 0, climb: .11, settle: .74,
  recover: 7.5, braced: .62, punch: 1, shove: .5, cap: 9,
};

function kick(spec) {
  const k = spec?.kick || FALLBACK_KICK;
  burstCount = Math.min(k.cap, burstCount + 1);
  burstRest = 0.26;
  // Each round in a burst stacks on the last, and the stack is what walks a
  // rifle off the target.
  const compound = 1 + (burstCount - 1) * k.climb;
  const braced = aiming ? k.braced : 1;
  const up = k.rise * compound * braced * (0.82 + Math.random() * 0.36);
  // A consistent pull plus a random component. The pull is the character: an
  // AKM goes right every time, a carbine wanders.
  const side = (k.bias * compound + (Math.random() * 2 - 1) * k.swing) * braced;

  recoilPitch += up;
  recoilYaw += side;
  // The share the weapon takes back on its own. The rest is the player's to
  // correct, which is what makes a heavy weapon feel heavy.
  recoilSettlePitch += up * k.settle;
  recoilSettleYaw += side * k.settle;
  recoilRecover = k.recover;
  pitch = Math.min(1.15, pitch + up);
  yaw += side;
  // The pad takes the same punch the camera does: a heavy rifle shoves and a
  // sub-gun buzzes, scaled by the profile rather than a fixed thump.
  gamepad.rumble(Math.min(1, k.punch * .55), Math.min(1, k.shove * .5 + .12),
    60 + Math.min(90, k.punch * 70));
  gamepad.kickTrigger(Math.min(1, .3 + k.punch * .3), 0, 50 + Math.min(60, k.punch * 40));

  // What the shooter feels: the weapon driven back into the shoulder, and the
  // whole picture rolled a little by a big cartridge.
  recoilPunch = Math.min(2.6, recoilPunch + k.punch * braced);
  recoilRoll += (Math.random() * 2 - 1) * k.shove * 0.010 * braced;
  recoil = Math.min(1.4, recoil + k.punch * 0.24);
}

function updateRecoil(dt) {
  // A burst is only a burst while the rounds keep coming. Let off the trigger
  // and the weapon settles back to its first-round behaviour.
  if (burstRest > 0) {
    burstRest -= dt;
    if (burstRest <= 0) burstCount = Math.max(0, burstCount - 1);
    if (burstCount > 0 && burstRest <= 0) burstRest = 0.16;
  }
  recoilPunch = THREE.MathUtils.damp(recoilPunch, 0, 11, dt);
  recoilRoll = THREE.MathUtils.damp(recoilRoll, 0, 8, dt);
  if (recoilSettlePitch === 0 && recoilSettleYaw === 0) return;
  // Recovery is a damped return of the portion the weapon takes back, applied
  // to the look angles so the sight physically walks back down.
  const rate = recoilRecover || 7.5;
  const nextPitch = THREE.MathUtils.damp(recoilSettlePitch, 0, rate, dt);
  const nextYaw = THREE.MathUtils.damp(recoilSettleYaw, 0, rate, dt);
  pitch -= recoilSettlePitch - nextPitch;
  yaw -= recoilSettleYaw - nextYaw;
  recoilSettlePitch = Math.abs(nextPitch) < 1e-5 ? 0 : nextPitch;
  recoilSettleYaw = Math.abs(nextYaw) < 1e-5 ? 0 : nextYaw;
  recoilPitch = THREE.MathUtils.damp(recoilPitch, 0, rate * 0.8, dt);
  recoilYaw = THREE.MathUtils.damp(recoilYaw, 0, rate * 0.8, dt);
}

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

// The on-screen throttle lever, painted from wherever the throttle actually
// is — the keys, the pad triggers and the lever itself all move the same
// number, so the lever has to follow it rather than own it.
const throttleFillEl = document.getElementById('throttleFill');
const throttleTextEl = document.getElementById('throttleText');
const throttleNotchEl = document.getElementById('throttleNotch');
let throttlePainted = -1;
function paintThrottle(value) {
  const shown = Math.round(value * 100);
  if (shown === throttlePainted) return;      // do not touch layout every frame
  throttlePainted = shown;
  if (throttleFillEl) throttleFillEl.style.height = `${shown}%`;
  if (throttleTextEl) throttleTextEl.textContent = `THR ${shown}%`;
  if (throttleNotchEl) throttleNotchEl.style.bottom = `${shown}%`;
}

// Whether the thumb pads are on the glass.
//
// 'auto' is the old behaviour and the default: they are there until a pad is
// plugged in, because a pad is a better set of on-screen controls than the
// on-screen controls. 'on' and 'off' are the manual override, for anyone who
// wants both at once or neither, and the choice is remembered.
const TOUCH_MODES = ['auto', 'on', 'off'];
let touchMode = 'auto';
try { touchMode = localStorage.getItem('ls.touchMode') || 'auto'; } catch { /* private mode */ }
if (!TOUCH_MODES.includes(touchMode)) touchMode = 'auto';

function applyTouchMode() {
  document.body.classList.toggle('touch-on', touchMode === 'on');
  document.body.classList.toggle('touch-off', touchMode === 'off');
  const button = document.getElementById('touchToggle');
  if (button) button.textContent = `ON-SCREEN CONTROLS: ${touchMode.toUpperCase()}`;
  try { localStorage.setItem('ls.touchMode', touchMode); } catch { /* private mode */ }
}

function cycleTouchMode() {
  touchMode = TOUCH_MODES[(TOUCH_MODES.indexOf(touchMode) + 1) % TOUCH_MODES.length];
  applyTouchMode();
  flash(touchMode === 'auto' ? 'ON-SCREEN CONTROLS FOLLOW THE CONTROLLER'
    : touchMode === 'on' ? 'ON-SCREEN CONTROLS ALWAYS ON'
      : 'ON-SCREEN CONTROLS OFF', 2000);
}

function wireControls() {
  applyTouchMode();
  document.getElementById('touchToggle')?.addEventListener('click', cycleTouchMode);
  // The pad announces itself rather than being found: the Gamepad API hides a
  // controller until it is used, so the first press is the connection.
  gamepad.on((event, detail) => {
    document.body.classList.toggle('pad', event === 'connected');
    if (event !== 'connected') { flash('CONTROLLER DISCONNECTED', 2200); return; }
    flash(`${detail.dualsense ? 'DUALSENSE' : 'CONTROLLER'} CONNECTED — OPTIONS FOR CONTROLS`, 3200);
    gamepad.rumble(.3, .5, 240);
  });
  addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'KeyE' && !e.repeat) use();
    if (e.code === 'KeyR' && !e.repeat) reload();
    if (e.code === 'KeyF' && !e.repeat) { triggerHeld = true; fire(); }
    if (e.code === 'KeyQ' && !e.repeat) setAiming(!aiming);
    if (e.code === 'KeyG' && !e.repeat) toggleDance();
    if (e.code === 'KeyV' && !e.repeat && !modal && !cctv && !driving && !flying) toggleCameraMode();
    if (/^Digit[1-4]$/.test(e.code) && !e.repeat) selectSlot(+e.code.slice(5) - 1);
    if (e.code === 'Tab') { e.preventDefault(); if (!e.repeat) openWheel(); }
    if (e.code === 'KeyX' && !e.repeat) setHolstered(!holstered);
    if (e.code === 'KeyH') { e.preventDefault(); toggleHelp(); }
    if (e.code === 'Space') { e.preventDefault(); if (!e.repeat) queueJump(); }
    if (e.code === 'Escape' && document.getElementById('help').classList.contains('open')) toggleHelp(false);
    else if (e.code === 'Escape' && cctv) closeCCTV();
    if (e.code === 'KeyN' && cctv) toggleNightVision();
    if (e.code === 'KeyL' && !e.repeat && driving) {
      const on = driving.toggleLights();
      flash(on ? 'HEADLAMPS ON' : 'HEADLAMPS OFF', 1200);
    }
    if (e.code === 'KeyB' && !e.repeat && driving) hornSound();
  });
  addEventListener('keyup',e=>{keys[e.code]=false;if(e.code==='KeyF')triggerHeld=false;if(e.code==='Tab')closeWheel(true)});
  renderer.domElement.addEventListener('click',()=>{if(started&&!coarse&&!modal)Promise.resolve(renderer.domElement.requestPointerLock?.()).catch(()=>{})});
  renderer.domElement.addEventListener('pointerdown',(e)=>{if(!started||coarse||modal)return;if(e.button===2){e.preventDefault();setAiming(true)}else if(e.button===0&&document.pointerLockElement===renderer.domElement){triggerHeld=true;fire()}});
  renderer.domElement.addEventListener('pointerup',(e)=>{if(e.button===2)setAiming(false);if(e.button===0)triggerHeld=false});
  addEventListener('blur',()=>{triggerHeld=false});
  renderer.domElement.addEventListener('contextmenu',(e)=>e.preventDefault());
  addEventListener('mousemove',e=>{if(wheelOpen){steerWheel(e.movementX,e.movementY);return}
    if(flying){flyHeld=false;flyStick.roll=THREE.MathUtils.clamp(flyStick.roll+e.movementX*.0050,-1,1);
      flyStick.pitch=THREE.MathUtils.clamp(flyStick.pitch+e.movementY*.0042,-1,1);return}
    if(document.pointerLockElement===renderer.domElement&&!modal){
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
  document.getElementById('viewBtn').addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCameraMode();
  });
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

  // Flying, on glass.
  //
  // The stick was already here — the left thumb pad becomes the stick the
  // moment you are in the air — but the throttle was on W and S, the rudder
  // on A and D and the brakes on the space bar, none of which a phone has. So
  // the aeroplane could be walked up to, boarded and then not flown.
  const track = document.getElementById('throttleTrack');
  const setThrottleFrom = (event) => {
    const box = track.getBoundingClientRect();
    // Up is more, which is the way a lever works and the opposite of the way
    // screen coordinates do.
    touch.throttle = THREE.MathUtils.clamp(
      (box.bottom - event.clientY) / box.height, 0, 1);
    paintThrottle(touch.throttle);
  };
  let throttleId = null;
  track?.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    event.stopPropagation();
    throttleId = event.pointerId;
    track.setPointerCapture?.(throttleId);
    setThrottleFrom(event);
    clickSound(360, .03, .03);
  });
  track?.addEventListener('pointermove', (event) => {
    if (event.pointerId !== throttleId) return;
    event.preventDefault();
    setThrottleFrom(event);
  });
  const dropThrottle = () => { throttleId = null; };
  track?.addEventListener('pointerup', dropThrottle);
  track?.addEventListener('pointercancel', dropThrottle);

  // Rudder and brakes are held, not latched: both are things you lean on for
  // a moment and let go of.
  const hold = (id, press, release) => {
    const button = document.getElementById(id);
    if (!button) return;
    const down = (event) => {
      event.preventDefault();
      event.stopPropagation();
      button.classList.add('on');
      press();
    };
    const up = () => { button.classList.remove('on'); release(); };
    button.addEventListener('pointerdown', down);
    button.addEventListener('pointerup', up);
    button.addEventListener('pointercancel', up);
    button.addEventListener('pointerleave', up);
  };
  hold('rudderL', () => { touch.rudder = -1; }, () => { if (touch.rudder < 0) touch.rudder = 0; });
  hold('rudderR', () => { touch.rudder = 1; }, () => { if (touch.rudder > 0) touch.rudder = 0; });
  hold('flyBrake', () => { touch.brake = true; }, () => { touch.brake = false; });

  // On a phone the wheel is opened by a button and closed by picking something
  // out of it, rather than held: there is no key to let go of.
  document.getElementById('wheelBtn')?.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (wheelOpen) closeWheel(false); else openWheel();
  });
  wheelEl?.addEventListener('pointerdown', (event) => {
    if (event.target === wheelEl) closeWheel(false);
  });
}

// One frame of the controller.
//
// Everything here calls the same functions the keyboard and the touch buttons
// call. A pad is a third way of asking for the things the game already does,
// not a second implementation of them — which is why a DualSense can be
// picked up mid-game and put down again without the game noticing.
//
//   Left stick   move / steer          Right stick  look
//   R2           fire / throttle       L2           aim / brake
//   Cross        jump / handbrake      Circle       crouch / get out
//   Square       use                   Triangle     reload / headlamps
//   L1 · R1      previous · next weapon
//   L3           sprint                R3           crouch toggle
//   D-pad ↓      dance                 D-pad ↑/←/→  weapon slots
//   Touchpad     first / third view    PS           release the mouse
function updatePad(dt) {
  const state = gamepad.poll(dt);
  if (!state.connected || !started) {
    // A pad that has been unplugged must not leave a held trigger or a stuck
    // throttle behind it.
    padMove.x = padMove.y = 0;
    padDrive.active = false;
    padDrive.throttle = padDrive.steer = 0;
    padDrive.brake = false;
    padFly.active = false;
    padFly.pitch = padFly.roll = padFly.yaw = padFly.throttle = 0;
    padFly.brake = false;
    if (!state.connected) {
      padCrouchHeld = false;
      padSprintLatch = padSprintWas = false;
      if (padTriggerHeld) { padTriggerHeld = false; triggerHeld = false; }
    }
    return;
  }

  // The camera desk is a screen, not a place: the pad drives the PTZ and gets
  // you back out of it.
  if (cctv) {
    padMove.x = padMove.y = 0;
    if (state.pressed.circle || state.pressed.options || state.pressed.touchpad) closeCCTV();
    if (state.pressed.triangle) toggleNightVision();
    if (state.pressed.square) {
      camPan[currentCam] = 0; camTilt[currentCam] = 0;
      camFov[currentCam] = [48, 50, 48, 42, 56][currentCam];
      updatePTZ();
    }
    if (state.pressed.r1) switchCam((currentCam + 1) % camNames.length);
    if (state.pressed.l1) switchCam((currentCam + camNames.length - 1) % camNames.length);
    if (state.pressed.up) zoom(-6);
    if (state.pressed.down) zoom(6);
    if (state.look.magnitude > 0) {
      camPan[currentCam] = THREE.MathUtils.clamp(camPan[currentCam] - state.look.x * 0.55, -1.35, 1.35);
      camTilt[currentCam] = THREE.MathUtils.clamp(camTilt[currentCam] - state.look.y * 0.5, -0.7, 0.6);
      updatePTZ();
    }
    return;
  }

  if (state.pressed.options) toggleHelp();
  if (state.pressed.ps) document.exitPointerLock?.();
  if (helpOpen()) {
    padMove.x = padMove.y = 0;
    if (state.pressed.circle || state.pressed.cross) toggleHelp(false);
    // The one setting in the game, reachable from the pad that turns it off.
    if (state.pressed.square || state.pressed.triangle) cycleTouchMode();
    return;
  }
  if (modal) { padMove.x = padMove.y = 0; return; }

  // L1 held is the wheel, steered with the right stick and taken by letting
  // go — the same gesture the mouse makes.
  if (state.pressed.l1 && !driving && !flying) openWheel();
  if (wheelOpen) {
    padMove.x = padMove.y = 0;
    if (state.look.magnitude > 0) steerWheel(state.look.x * 260, state.look.y * 260);
    if (state.released.l1 || state.pressed.cross) closeWheel(true);
    if (state.pressed.circle) closeWheel(false);
    return;
  }

  // Look. The right stick moves the head at a rate rather than by a delta, so
  // it is frame-rate independent, and it slows down behind glass exactly as
  // the mouse does.
  if (state.look.magnitude > 0) {
    const gain = scoped ? (weapon?.zoom ?? 52) / 70 : 1;
    yaw -= state.look.x * gain;
    pitch = THREE.MathUtils.clamp(pitch - state.look.y * gain * 0.82, -1.25, 1.15);
  }

  if (flying) {
    padMove.x = padMove.y = 0;
    // Left stick is the stick, the triggers are the throttle lever, and the
    // shoulders are the rudder pedals.
    padFly.active = true;
    padFly.roll = state.move.x;
    padFly.pitch = state.move.y;
    padFly.yaw = (state.down.r1 ? 1 : 0) - (state.down.l1 ? 1 : 0);
    padFly.throttle = state.r2 - state.l2;
    // Cross is the wheel brakes, which is the one control you need on the
    // ground and could not reach from the pad at all: without it you could
    // take off with a controller and then not stop after landing.
    padFly.brake = state.down.cross;
    if (state.pressed.circle || state.pressed.square) use();
    if (state.pressed.touchpad) openCCTV();
    return;
  }
  padFly.active = false;
  padFly.brake = false;

  if (driving) {
    padMove.x = padMove.y = 0;
    // Pedals are the triggers and steering is the stick, which is the whole
    // reason to drive with a pad: both are analogue, so part throttle and a
    // quarter of lock are things you can actually ask for.
    padDrive.throttle = state.r2 - state.l2;
    padDrive.steer = state.move.x;
    padDrive.brake = state.down.cross;
    padDrive.active = true;
    if (state.pressed.circle) use();
    if (state.pressed.triangle) {
      const on = driving.toggleLights();
      flash(on ? 'HEADLAMPS ON' : 'HEADLAMPS OFF', 1200);
    }
    if (state.pressed.square) hornSound();
    if (state.pressed.touchpad) openCCTV();
    return;
  }
  padDrive.active = false;

  padMove.x = state.move.x;
  padMove.y = state.move.y;
  if (state.move.magnitude > .16) setDancing(false, { announce: false });

  // Sprint is the stick click: press it while pushing the stick and it holds
  // until the stick comes back to centre, which is how a pad sprint has
  // worked since the first one. Written on the edge only, so the on-screen
  // sprint button and the pad are not fighting over the same flag every frame.
  if (state.pressed.l3 && state.move.magnitude > .2) padSprintLatch = true;
  if (state.move.magnitude < .2) padSprintLatch = false;
  if (padSprintLatch !== padSprintWas) {
    padSprintWas = padSprintLatch;
    touch.sprint = padSprintLatch;
    if (padSprintLatch) { touch.crouch = false; padCrouchHeld = false; }
  }

  if (state.pressed.circle) {
    padCrouchHeld = !padCrouchHeld;
    touch.crouch = padCrouchHeld;
    if (touch.crouch) { touch.sprint = false; padSprintLatch = padSprintWas = false; }
  }

  if (state.pressed.square) use();
  if (state.pressed.cross) queueJump();
  if (state.pressed.triangle) reload();
  if (state.pressed.r1) cycleWeapon(1);
  if (state.pressed.up) selectSlot(0);
  if (state.pressed.right) selectSlot(1);
  if (state.pressed.left) selectSlot(2);
  if (state.pressed.down) toggleDance();
  if (state.pressed.r3) setHolstered(!holstered);
  if (state.pressed.touchpad) toggleCameraMode();

  // L2 sights the weapon, R2 fires it. Both are analogue on a DualSense, so
  // the aim comes up progressively and the trigger has a real first stage.
  const wantAim = state.l2 > .38;
  if (wantAim !== padAimWas) { padAimWas = wantAim; setAiming(wantAim); }
  const squeezed = state.r2 > .55;
  if (squeezed && !padTriggerHeld) { triggerHeld = true; padTriggerHeld = true; fire(); }
  else if (!squeezed && padTriggerHeld) { padTriggerHeld = false; triggerHeld = false; }
}

// Two shadow floors: the surface's is the sky it stands under, the shelter's
// is the near-black the strip lights leave behind.
// A shadow floor, not a fog machine. At (0.062, 0.078, 0.098) this was adding
// a tenth of full brightness to every dark pixel in the frame — which is
// exactly what a haze filter does, and it sat over the whole surface and over
// everything seen through a scope as well. Shadow visibility is the fill
// light's job; this only stops black going dead.
const _liftOutside = new THREE.Color(0.016, 0.022, 0.030);
const _liftInside = new THREE.Color(0x0b1113);

// The weapon wheel.
//
// Held open rather than toggled, because that is what makes it quick: you push
// toward what you want and let go, and your thumb or your hand never leaves
// where it was. The first slot is always HOLSTER, so putting the weapon away
// is the same gesture as changing it rather than a separate control nobody
// would find.
const wheelEl = document.getElementById('wheel');
const wheelRing = document.getElementById('wheelRing');
const wheelName = document.getElementById('wheelName');
const wheelAmmo = document.getElementById('wheelAmmo');
let wheelOpen = false;
let wheelEntries = [];
let wheelChoice = 0;
let wheelAimX = 0;
let wheelAimY = 0;

function wheelPlacement(index, count) {
  // Straight up is the first slot, then clockwise.
  const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
  return { angle, x: 50 + Math.cos(angle) * 38, y: 50 + Math.sin(angle) * 38 };
}

function openWheel() {
  if (wheelOpen || !started || modal || cctv || reloading) return false;
  wheelEntries = [{ key: null, label: 'HOLSTER', detail: 'HANDS EMPTY' },
    ...carried.map((key) => ({
      key,
      label: WEAPONS[key]?.name || key,
      detail: WEAPONS[key]?.kind === 'melee' ? 'BLADE'
        : `${loadout.for(key).magazine} / ${loadout.for(key).reserve}`,
    }))];
  if (wheelEntries.length < 2) return false;
  wheelOpen = true;
  wheelAimX = wheelAimY = 0;
  const current = wheelEntries.findIndex((entry) => entry.key === weaponKey);
  wheelChoice = holstered || !armed ? 0 : Math.max(0, current);
  wheelRing.querySelectorAll('.wheel-slot').forEach((node) => node.remove());
  wheelEntries.forEach((entry, index) => {
    const node = document.createElement('div');
    node.className = 'wheel-slot';
    const place = wheelPlacement(index, wheelEntries.length);
    node.style.left = `${place.x}%`;
    node.style.top = `${place.y}%`;
    node.textContent = entry.label;
    node.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      event.stopPropagation();
      wheelChoice = index;
      paintWheel();
      closeWheel(true);
    });
    wheelRing.appendChild(node);
  });
  document.body.classList.add('wheel-open');
  paintWheel();
  clickSound(620, .05, .035);
  return true;
}

/** Push the wheel with a delta from the mouse or a stick. */
function steerWheel(dx, dy) {
  if (!wheelOpen) return;
  wheelAimX += dx;
  wheelAimY += dy;
  const reach = Math.hypot(wheelAimX, wheelAimY);
  // Under a short push there is no direction worth reading, so the highlight
  // stays where it was rather than flickering around the ring.
  if (reach < 26) return;
  const limit = 150;
  if (reach > limit) { wheelAimX *= limit / reach; wheelAimY *= limit / reach; }
  const angle = Math.atan2(wheelAimY, wheelAimX);
  let best = wheelChoice;
  let closest = Infinity;
  for (let index = 0; index < wheelEntries.length; index++) {
    let delta = wheelPlacement(index, wheelEntries.length).angle - angle;
    delta = Math.abs(Math.atan2(Math.sin(delta), Math.cos(delta)));
    if (delta < closest) { closest = delta; best = index; }
  }
  if (best !== wheelChoice) { wheelChoice = best; paintWheel(); clickSound(760, .03, .022); }
}

function paintWheel() {
  const slots = wheelRing.querySelectorAll('.wheel-slot');
  slots.forEach((node, index) => node.classList.toggle('on', index === wheelChoice));
  const entry = wheelEntries[wheelChoice];
  wheelName.textContent = entry?.label || '';
  wheelAmmo.textContent = entry?.detail || '';
}

function closeWheel(commit = true) {
  if (!wheelOpen) return;
  wheelOpen = false;
  document.body.classList.remove('wheel-open');
  const entry = wheelEntries[wheelChoice];
  if (!commit || !entry) return;
  if (!entry.key) setHolstered(true);
  else if (entry.key === weaponKey) setHolstered(false);
  else { drawWeapon(entry.key, { announce: false }); flash(entry.label, 1200); }
}

// Flying.
//
// The car is steered with the same keys you walk with and watched from behind.
// An aeroplane cannot be: pitch is a control, not a look, so while the wheels
// are off the ground the mouse is the stick and the camera simply follows.
// Throttle stays on W and S, the rudder on A and D, and the brakes on the same
// key the handbrake is on, so nothing has to be unlearned.
const flySpeedEl = document.getElementById('flySpeed');
const flyAltEl = document.getElementById('flyAlt');
const flyThrottleEl = document.getElementById('flyThrottle');
const flyWarnEl = document.getElementById('flyWarn');
const flyControls = { pitch: 0, roll: 0, yaw: 0, throttle: 0, brake: false };
const _planePoint = new THREE.Vector3();
const _planeEye = new THREE.Vector3();
const _chase = new THREE.Vector3();
const KNOTS = 1.94384;
const FEET = 3.28084;
let flyStick = { pitch: 0, roll: 0 };
let flyHeld = false;
let flyShake = 0;

function enterAircraft(aircraft) {
  if (!aircraft || flying || driving || currentWorld !== 'outside') return false;
  closeWheel(false);
  holsteredForDrive = armed && !holstered;
  if (holsteredForDrive) setHolstered(true, { announce: false });
  flying = aircraft;
  aircraft.occupied = true;
  setAiming(false);
  setScoped(false);
  seated = null;
  flyControls.throttle = 0;
  flyStick = { pitch: 0, roll: 0 };
  flyHeld = false;
  // Whatever was latched on foot has no meaning in the air, and CROUCH doubles
  // as the wheel brakes — climbing in with it held on would hold the brakes.
  releaseSprint();
  touch.crouch = false;
  document.getElementById('crouchBtn')?.classList.remove('on');
  resetFlightTouch();
  document.body.classList.add('flying');
  refreshWeaponView();
  startEngineAudio('aircraft');
  flash(coarse
    ? `${aircraft.label} — THR IS THE THROTTLE · LEFT PAD IS THE STICK · USE TO GET OUT`
    : `${aircraft.label} — W OPENS THE THROTTLE · MOUSE IS THE STICK · [ E ] TO GET OUT`,
  4200);
  return true;
}

/** Put the on-screen flight controls back to neutral. */
function resetFlightTouch() {
  touch.throttle = null;
  touch.rudder = 0;
  touch.brake = false;
  for (const id of ['rudderL', 'rudderR', 'flyBrake']) {
    document.getElementById(id)?.classList.remove('on');
  }
  paintThrottle(0);
}

function leaveAircraft(showMessage = true) {
  if (!flying) return false;
  const aircraft = flying;
  // Nobody steps out at ninety knots.
  if (!aircraft.grounded || aircraft.airspeed > 3) {
    if (showMessage) flash('BRING IT TO A STOP FIRST', 1800);
    return false;
  }
  const step = aircraft.doorstep();
  flying = null;
  aircraft.occupied = false;
  document.body.classList.remove('flying');
  resetFlightTouch();
  stopEngineAudio();
  if (holsteredForDrive) { holsteredForDrive = false; setHolstered(false, { announce: false }); }
  refreshWeaponView();
  body.teleport(step.x, step.y + 0.05, step.z);
  game.player.position.copy(body.position);
  game.camera.position.set(0, body.eyeHeight, 0);
  pitch = -0.02;
  if (showMessage) flash('OUT OF THE AIRCRAFT');
  return true;
}

function updateFlying(dt) {
  const aircraft = flying;
  // Throttle is a lever, not a pedal: it stays where it is put.
  const push = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0);
  flyControls.throttle = THREE.MathUtils.clamp(
    flyControls.throttle + push * dt * 0.55 + (padFly.active ? padFly.throttle * dt * 0.9 : 0), 0, 1);
  // The on-screen lever is absolute: it is where you last put it, and putting
  // it somewhere is one drag. Anything that moves the throttle another way —
  // the keys, the triggers — takes it back off the lever.
  if (touch.throttle !== null) {
    if (push || (padFly.active && padFly.throttle)) touch.throttle = null;
    else flyControls.throttle = touch.throttle;
  }
  flyControls.yaw = THREE.MathUtils.clamp(
    (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0) + touch.rudder
    + (padFly.active ? padFly.yaw : 0), -1, 1);
  flyControls.brake = !!keys.Space || touch.brake || touch.crouch
    || (padFly.active && padFly.brake);
  // The stick self-centres, so letting go lets the aeroplane settle.
  if (padFly.active) { flyStick.pitch = padFly.pitch; flyStick.roll = padFly.roll; }
  else if (!flyHeld) {
    flyStick.pitch = THREE.MathUtils.damp(flyStick.pitch, 0, 1.6, dt);
    flyStick.roll = THREE.MathUtils.damp(flyStick.roll, 0, 2.4, dt);
  }
  flyControls.pitch = THREE.MathUtils.clamp(flyStick.pitch + (game.mobileMove?.y || 0), -1, 1);
  flyControls.roll = THREE.MathUtils.clamp(flyStick.roll + (game.mobileMove?.x || 0), -1, 1);

  const speed = aircraft.update(dt, flyControls);

  // The walking body rides along underneath, so every distance test in the
  // game keeps working off one position.
  aircraft.position(_planePoint);
  body.teleport(_planePoint.x, _planePoint.y, _planePoint.z);
  body.velocity.set(0, 0, 0);
  body.grounded = true;
  game.player.position.copy(_planePoint);

  // A chase camera behind and above, rolled with the airframe so a turn reads
  // as a turn rather than as the world sliding sideways.
  aircraft.seat(_planeEye);
  const heading = aircraft.heading();
  yaw = heading;
  pitch = THREE.MathUtils.damp(pitch, -0.12, 4, dt);
  const bump = Math.min(1, speed / 70) * (aircraft.grounded ? 1 : 0.25);
  flyShake = THREE.MathUtils.damp(flyShake, bump, 4, dt);
  breath += dt * (1.4 + bump * 5);
  _chase.set(0, 0, 1).applyQuaternion(aircraft.state.quaternion).multiplyScalar(13.5);
  _chase.y += 3.6;
  game.camera.position.set(
    _chase.x + Math.sin(breath * 3.3) * 0.02 * flyShake,
    _chase.y + Math.sin(breath * 4.1) * 0.03 * flyShake,
    _chase.z);
  game.camera.quaternion.copy(aircraft.state.quaternion);
  game.camera.rotateX(-0.13);

  const hit = aircraft.takeImpact();
  if (hit > 1) {
    crashSound(Math.min(1, hit / 14));
    gamepad.rumble(Math.min(1, hit / 14), Math.min(1, hit / 11), 160 + hit * 12);
    if (hit > 9) damage(Math.round(hit - 7));
  }

  engineAudio(0.18 + flyControls.throttle * 0.82, flyControls.throttle);

  if (flySpeedEl) flySpeedEl.textContent = String(Math.round(speed * KNOTS));
  if (flyAltEl) flyAltEl.textContent = String(Math.max(0, Math.round(aircraft.altitude * FEET)));
  if (flyThrottleEl) flyThrottleEl.textContent = `${Math.round(flyControls.throttle * 100)}%`;
  paintThrottle(flyControls.throttle);
  if (flyWarnEl) {
    flyWarnEl.textContent = aircraft.stalled ? 'STALL'
      : (!aircraft.grounded && speed * KNOTS < 55 ? 'SPEED' : '');
  }

  sprinting = false;
}

const desiredVelocity = new THREE.Vector3();
const forwardAxis = new THREE.Vector3();
const rightAxis = new THREE.Vector3();
const thirdPersonTarget = new THREE.Vector3();
const thirdPersonAnchor = new THREE.Vector3();
const thirdPersonDesired = new THREE.Vector3();
const thirdPersonOffset = new THREE.Vector3();
const thirdPersonForward = new THREE.Vector3();
const thirdPersonRight = new THREE.Vector3();
const thirdPersonQuaternion = new THREE.Quaternion();

const THIRD_PERSON_DISTANCE = 3.5;
const THIRD_PERSON_AIM_DISTANCE = 2.75;
const THIRD_PERSON_SHOULDER = 0.72;
const THIRD_PERSON_AIM_SHOULDER = 1.02;
const CAMERA_COLLISION_RADIUS = 0.14;

function dampAngle(current, target, rate, dt) {
  const delta = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + delta * (1 - Math.exp(-rate * dt));
}

function updatePlayerCharacter(dt, {
  crouching = false,
  seated: isSeated = false,
  aimTarget = null,
} = {}) {
  if (!game.playerCharacter) return;
  const speed = isSeated ? 0 : body.horizontalSpeed;
  const groundDelta = body.groundY - characterGroundY;
  const climbed = body.grounded && speed > 0.05 && groundDelta > 0.24;
  const stairDirection = body.grounded && speed > 0.10 && Math.abs(groundDelta) > 0.025
    && Math.abs(groundDelta) <= 0.24 ? Math.sign(groundDelta) : 0;
  characterGroundY = body.groundY;
  if (speed > 0.11 || climbed || stairDirection) setDancing(false, { announce: false });
  // A holstered weapon should behave like empty hands: turn the actor into
  // the direction of travel instead of making them moonwalk while the camera
  // orbits independently.
  if (!(armed && !holstered) && speed > 0.08 && !isSeated) {
    const travelYaw = Math.atan2(-body.velocity.x, -body.velocity.z);
    characterYaw = dampAngle(characterYaw, travelYaw, sprinting ? 14 : 10, dt);
  } else {
    characterYaw = dampAngle(characterYaw, yaw, aiming ? 18 : 11, dt);
  }
  const lookOffset = Math.atan2(Math.sin(yaw - characterYaw), Math.cos(yaw - characterYaw));
  game.playerCharacter.update(dt, {
    yaw: characterYaw,
    lookYawOffset: lookOffset,
    speed,
    running: sprinting,
    crouching,
    grounded: body.grounded,
    verticalSpeed: body.velocity.y,
    climbing: climbed,
    stairDirection,
    distance: body.distanceWalked,
    armed: armed && !holstered,
    aiming,
    seated: isSeated,
    dancing: danceActive,
    aimTarget,
    recoil: recoil + recoilPunch * 0.18,
  });
}

function cameraSegmentClear(start, end, colliders, steps) {
  thirdPersonOffset.copy(end).sub(start);
  for (let step = 1; step <= steps; step++) {
    const fraction = step / steps;
    const localX = start.x + thirdPersonOffset.x * fraction;
    const localY = start.y + thirdPersonOffset.y * fraction;
    const localZ = start.z + thirdPersonOffset.z * fraction;
    if (colliders.contains(
      body.position.x + localX,
      body.position.z + localZ,
      CAMERA_COLLISION_RADIUS,
      body.position.y + localY - CAMERA_COLLISION_RADIUS,
      body.position.y + localY + CAMERA_COLLISION_RADIUS,
    )) return Math.max(0, (step - 1) / steps);
  }
  return 1;
}

function updateThirdPersonCamera(dt, targetHeight = body.eyeHeight) {
  const distance = aiming ? THIRD_PERSON_AIM_DISTANCE : THIRD_PERSON_DISTANCE;
  const requestedShoulder = aiming ? THIRD_PERSON_AIM_SHOULDER : THIRD_PERSON_SHOULDER;
  const cameraPitch = THREE.MathUtils.clamp(pitch, -0.78, 0.62);
  thirdPersonTarget.set(0, targetHeight - 0.12, 0);
  composeShoulderCamera({
    yaw,
    pitch: cameraPitch,
    target: thirdPersonTarget,
    distance,
    shoulder: requestedShoulder,
  }, {
    quaternion: thirdPersonQuaternion,
    forward: thirdPersonForward,
    right: thirdPersonRight,
    anchor: thirdPersonAnchor,
    camera: thirdPersonDesired,
  });

  // First clear the lateral shoulder move, then clear the rear boom from that
  // shoulder. Keeping these as two independent segments is what stops a wall
  // behind the camera collapsing the shoulder offset and putting the player
  // back under the centre-screen crosshair.
  const colliders = game.colliders[currentWorld];
  const shoulderClear = cameraSegmentClear(thirdPersonTarget, thirdPersonAnchor, colliders, 8);
  const allowedShoulder = requestedShoulder * shoulderClear;
  cameraShoulder = THREE.MathUtils.damp(cameraShoulder, allowedShoulder,
    allowedShoulder < cameraShoulder ? 24 : 12, dt);
  thirdPersonAnchor.copy(thirdPersonTarget).addScaledVector(thirdPersonRight, cameraShoulder);

  thirdPersonDesired.copy(thirdPersonAnchor).addScaledVector(thirdPersonForward, -distance);
  const boomClear = cameraSegmentClear(thirdPersonAnchor, thirdPersonDesired, colliders, 16);
  const allowedBoom = Math.max(0.34, distance * boomClear);
  cameraBoom = THREE.MathUtils.damp(cameraBoom, allowedBoom,
    allowedBoom < cameraBoom ? 24 : 9, dt);
  game.camera.position.copy(thirdPersonAnchor).addScaledVector(thirdPersonForward, -cameraBoom);
  game.camera.rotation.set(cameraPitch, yaw, recoilRoll * 0.18, 'YXZ');
  game.camera.updateWorldMatrix(true, false);
  game.setPlayerVisualObstructed?.(cameraBoom < 0.62);
}

function updateFirstPersonCamera(x, y, roll) {
  game.camera.position.set(x, y, 0);
  game.camera.rotation.set(pitch, yaw, roll, 'YXZ');
  game.setPlayerVisualObstructed?.(false);
}

function updatePlayer(dt) {
  if (!started || modal) return;
  game.camera.rotation.y = yaw;
  game.camera.rotation.x = pitch;

  if (flying) {
    updateFlying(dt);
    return;
  }

  if (driving) {
    updateDriving(dt);
    return;
  }

  if (seated) {
    desiredVelocity.set(0, 0, 0);
    // A seat is itself solid. Keep the seated capsule at the authored pose
    // instead of resolving it out through the sofa on the next physics frame.
    body.velocity.set(0, 0, 0);
    body.grounded = true;
    game.player.position.set(body.position.x, body.position.y, body.position.z);
    breath += dt * 0.55;
    sprinting = false;
    let aimTarget = null;
    if (effectiveCameraMode() === 'third') {
      updateThirdPersonCamera(dt, 1.18);
      if (armed && !holstered) aimTarget = animatedCrosshairTarget(dt);
    } else {
      updateFirstPersonCamera(0, 1.18 + Math.sin(breath) * 0.003, 0);
    }
    updatePlayerCharacter(dt, { seated: true, aimTarget });
    return;
  }

  let strafe = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0) + (game.mobileMove?.x || 0) + padMove.x;
  let forward = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0) - (game.mobileMove?.y || 0) - padMove.y;
  const magnitude = Math.hypot(strafe, forward);
  if (magnitude > 1) { strafe /= magnitude; forward /= magnitude; }

  const crouching = !!keys.ControlLeft || !!keys.KeyC || touch.crouch;
  // Run for as long as you like. There was a stamina meter that gave about ten
  // seconds of sprint and then cut it off, which on a map that is now two
  // kilometres across turned every journey into a series of ten-second dashes
  // separated by waiting. Nothing replaced it: no limp, no wheeze, no sway —
  // the tiredness effects went with the meter that drove them.
  sprinting = (!!keys.ShiftLeft || !!keys.ShiftRight || touch.sprint)
    && forward > 0.1 && !crouching;

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

  const eyeY = body.eyeHeight
    + Math.sin(bobPhase) * bobAmount
    + Math.sin(breath) * 0.006
    - body.landingImpact * 0.22;
  const eyeX = Math.cos(bobPhase * 0.5) * bobAmount * 0.55;
  const eyeRoll = Math.cos(bobPhase * 0.5) * bobAmount * 0.22
    + (sprinting ? Math.sin(bobPhase * 0.5) * 0.012 : 0)
    + recoilRoll;

  let aimTarget = null;
  if (effectiveCameraMode() === 'third') {
    updateThirdPersonCamera(dt, body.eyeHeight);
    if (armed && !holstered) aimTarget = animatedCrosshairTarget(dt);
  } else {
    updateFirstPersonCamera(eyeX, eyeY, eyeRoll);
  }
  updatePlayerCharacter(dt, { crouching, aimTarget });

  footsteps(dt, speedRatio, crouching);
}

// One frame behind the wheel. The car does the physics; this hands it the
// pedals, rides the seat and shakes the picture in proportion to what the
// suspension is doing.
const driveControls = { throttle: 0, steer: 0, brake: false };
const MPH = 2.23694;
const CHASE_DISTANCE = 6.4;
const CHASE_HEIGHT = 2.55;
const CHASE_PITCH = -0.215;   // enough to hold the car and the road ahead
const driveSpeedEl = document.getElementById('driveSpeed');
const driveGearEl = document.getElementById('driveGear');
let driveShake = 0;

function updateDriving(dt) {
  const vehicle = driving;
  // Keys are on or off; a pad is not. Whichever is asking for more wins, so
  // you can take a hand off the pad and finish the corner on the keyboard.
  const keyThrottle = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0) - (game.mobileMove?.y || 0);
  const keySteer = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0) + (game.mobileMove?.x || 0);
  driveControls.throttle = padDrive.active && Math.abs(padDrive.throttle) > Math.abs(keyThrottle)
    ? padDrive.throttle : keyThrottle;
  driveControls.steer = padDrive.active && Math.abs(padDrive.steer) > Math.abs(keySteer)
    ? padDrive.steer : keySteer;
  driveControls.brake = !!keys.Space || touch.crouch || (padDrive.active && padDrive.brake);

  const speed = vehicle.update(dt, driveControls);

  // The walking body rides along under the car so that stepping out, saving
  // and every distance test in the game keeps working on one position.
  vehicle.position(_carPoint);
  body.teleport(_carPoint.x, _carPoint.y, _carPoint.z);
  body.velocity.set(0, 0, 0);
  body.grounded = true;
  game.player.position.copy(_carPoint);

  // The camera rides behind the car. The shell has no modelled interior — it
  // is a solid body, and a seat-height eye is inside it looking at backfaces —
  // and a chase view puts the wheels, the steering and the body roll on screen
  // where the driver can read them.
  //
  // The player's yaw is still the camera's, so the mouse swings it around the
  // car; it drifts back behind the nose while the car is actually moving.
  let drift = yaw - vehicle.heading;
  drift -= Math.round(drift / (Math.PI * 2)) * Math.PI * 2;
  yaw = vehicle.heading
    + (Math.abs(speed) > 1.2 ? THREE.MathUtils.damp(drift, 0, 2.2, dt) : drift);
  pitch = THREE.MathUtils.damp(pitch, CHASE_PITCH, 4, dt);

  const bump = Math.min(1, Math.abs(speed) / vehicle.topSpeed);
  driveShake = THREE.MathUtils.damp(driveShake, bump, 4, dt);
  breath += dt * (1.2 + bump * 6);
  // Pull the camera in if the wall behind the car is closer than the boom.
  let boom = CHASE_DISTANCE;
  const colliders = game.colliders.outside;
  for (let step = 0; step < 3 && boom > 2.2; step++) {
    const cx = _carPoint.x + Math.sin(yaw) * boom;
    const cz = _carPoint.z + Math.cos(yaw) * boom;
    if (!colliders.contains(cx, cz, 0.45, _carPoint.y + 1.2, _carPoint.y + 2.6)) break;
    boom -= 1.4;
  }
  game.camera.position.set(
    Math.sin(yaw) * boom + Math.sin(breath * 3.1) * 0.012 * driveShake,
    CHASE_HEIGHT + Math.sin(breath * 4.7) * 0.018 * driveShake,
    Math.cos(yaw) * boom);
  game.camera.rotation.set(pitch, yaw, -vehicle.state.lean * 0.25);

  // Hitting something is felt, not just heard.
  const impact = vehicle.takeImpact();
  if (impact > 1.4) {
    crashSound(impact / vehicle.topSpeed);
    gamepad.rumble(Math.min(1, impact / 12), Math.min(1, impact / 9), 130 + impact * 14);
    pitch = THREE.MathUtils.clamp(pitch + impact * 0.008, -1.25, 1.15);
    if (impact > 8) damage(Math.round(impact - 6));
  }

  engineAudio(Math.abs(speed) / vehicle.topSpeed, driveControls.throttle,
    vehicle.gear, vehicle.rpm, vehicle.state.shifted);

  const mph = Math.round(Math.abs(speed) * MPH);
  if (driveSpeedEl) driveSpeedEl.textContent = String(mph);
  if (driveGearEl) {
    driveGearEl.textContent = driveControls.brake ? 'BRK'
      : speed < -0.2 ? 'R' : (speed > 0.2 ? String(vehicle.gear) : 'N');
  }

  sprinting = false;
}

// One place that takes health off the player, so a crash, a bite and a night
// without heat all leave through the same door.
function damage(amount) {
  if (amount <= 0) return health;
  health = Math.max(0, health - amount);
  gamepad.rumble(Math.min(1, .25 + amount / 34), Math.min(1, .4 + amount / 40), 180);
  hurtFlash = 1;
  recovery = 0;
  hurtSound();
  updateHealth();
  if (health <= 0) collapse();
  return health;
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
  if(driving){promptEl.textContent=`${coarse?'USE':'[ E ]'}  GET OUT`;promptEl.classList.add('on');return}
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
const gunSampleBuffers = new Map();
const gunSampleVoices = new Map();
let gunSampleLoadPromise = null;
let gunSampleRemainderPromise = null;
let gunSampleRemainderScheduled = false;
const essentialGunSamples = new Set(['fire308', 'fire20Gauge', 'fire9mm']);

async function decodeGunSamples(entries, context) {
  const failed = [];
  // Decode sequentially. Launching all eighteen MP3 decoders together stole
  // several frames from play on mid-range Android devices.
  for (const [key, url] of entries) {
    if (gunSampleBuffers.has(key)) continue;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`${response.status} ${url}`);
      const buffer = await context.decodeAudioData(await response.arrayBuffer());
      gunSampleBuffers.set(key, buffer);
    } catch (error) {
      failed.push(error);
    }
  }
  if (failed.length) console.warn(`${failed.length} uploaded gun samples could not be decoded.`);
}

function scheduleRemainingGunSamples() {
  if (!ac || gunSampleRemainderScheduled) return;
  gunSampleRemainderScheduled = true;
  const context = ac;
  const start = () => {
    const remaining = Object.entries(GUN_SAMPLE_URLS)
      .filter(([key]) => !essentialGunSamples.has(key));
    gunSampleRemainderPromise = decodeGunSamples(remaining, context);
  };
  if ('requestIdleCallback' in window) window.requestIdleCallback(start, { timeout: 4500 });
  else setTimeout(start, 2200);
}

function loadGunSamples() {
  if (!ac) return Promise.resolve();
  if (gunSampleLoadPromise) return gunSampleLoadPromise;
  const context = ac;
  const essential = Object.entries(GUN_SAMPLE_URLS)
    .filter(([key]) => essentialGunSamples.has(key));
  gunSampleLoadPromise = decodeGunSamples(essential, context)
    .finally(scheduleRemainingGunSamples);
  return gunSampleLoadPromise;
}

/** Play one decoded upload through the same direct/reverb bus as gun synthesis. */
function playGunSample(key, { delay = 0, gain = 0.65, rate = 1, maxVoices = 8 } = {}) {
  const buffer = gunSampleBuffers.get(key);
  if (!buffer || !ac) return false;
  ensureShotBus();
  const source = ac.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = rate;
  const level = ac.createGain();
  level.gain.value = gain;
  source.connect(level);
  level.connect(shotOut());

  const voices = gunSampleVoices.get(key) || [];
  while (voices.length >= maxVoices) {
    try { voices.shift().stop(); } catch { /* already ended */ }
  }
  voices.push(source);
  gunSampleVoices.set(key, voices);
  source.onended = () => {
    const active = gunSampleVoices.get(key);
    const index = active?.indexOf(source) ?? -1;
    if (index >= 0) active.splice(index, 1);
    source.disconnect();
    level.disconnect();
  };
  source.start(ac.currentTime + Math.max(0, delay));
  return true;
}

function noiseBuffer(seconds=2){const b=ac.createBuffer(1,ac.sampleRate*seconds,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return b}
function startAudio(){
  if(ac){ac.resume?.();void loadGunSamples();return}
  ac=new(window.AudioContext||window.webkitAudioContext)();master=ac.createGain();master.gain.value=.3*(opening.settings.master/100);master.connect(ac.destination);
  [47,94,141].forEach((freq,i)=>{const o=ac.createOscillator(),g=ac.createGain();o.type=i?'sine':'triangle';o.frequency.value=freq;g.gain.value=[.09,.03,.01][i];o.connect(g);g.connect(master);o.start()});
  const rn=ac.createBufferSource();rn.buffer=noiseBuffer();rn.loop=true;const rf=ac.createBiquadFilter();rf.type='bandpass';rf.frequency.value=1800;radioGain=ac.createGain();radioGain.gain.value=0;rn.connect(rf);rf.connect(radioGain);radioGain.connect(master);rn.start();
  const on=ac.createBufferSource();on.buffer=noiseBuffer(3);on.loop=true;const of=ac.createBiquadFilter();of.type='lowpass';of.frequency.value=900;outdoorGain=ac.createGain();outdoorGain.gain.value=0;on.connect(of);of.connect(outdoorGain);outdoorGain.connect(master);on.start();
  startAmbience();
  // Build the reusable gun buses and room response during the explicit start
  // gesture, not on the first trigger pull in live play.
  ensureShotBus();
  shotNoiseBuffer();
  void loadGunSamples();
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

// --- Engine ----------------------------------------------------------------
// Escort four-cylinder audio. Combustion, exhaust, valve train, induction and
// turbo are separate layers driven from actual 950–6450 rpm. Keeping the firing
// rate at rpm / 30 is what makes idle sound like a four-cylinder engine rather
// than the high electronic buzz produced by the old arbitrary oscillator map.
let engine = null;
let lastGearShiftSound = -Infinity;

function startEngineAudio(kind = 'car') {
  if (!ac || engine) return;
  const out = ac.createGain();
  out.gain.value = 0;
  const compressor = ac.createDynamicsCompressor();
  compressor.threshold.value = -18;
  compressor.knee.value = 12;
  compressor.ratio.value = 3.2;
  compressor.attack.value = .006;
  compressor.release.value = .16;
  out.connect(compressor); compressor.connect(master);

  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 520;
  filter.Q.value = .85;
  filter.connect(out);

  const block = [0, 1].map((i) => {
    const o = ac.createOscillator();
    o.type = i ? 'triangle' : 'sawtooth';
    o.frequency.value = 32;
    o.detune.value = i ? 7 : -7;
    const g = ac.createGain();
    g.gain.value = i ? 0.075 : 0.105;
    o.connect(g); g.connect(filter);
    o.start();
    return o;
  });
  const exhaust = ac.createOscillator();
  exhaust.type = 'sawtooth';
  exhaust.frequency.value = 16;
  const exhaustGain = ac.createGain();
  exhaustGain.gain.value = 0.075;
  exhaust.connect(exhaustGain); exhaustGain.connect(filter);
  exhaust.start();

  const induction = ac.createBufferSource();
  induction.buffer = noiseBuffer(2);
  induction.loop = true;
  const inductionFilter = ac.createBiquadFilter();
  inductionFilter.type = 'bandpass';
  inductionFilter.frequency.value = 700;
  inductionFilter.Q.value = 1.1;
  const inductionGain = ac.createGain();
  inductionGain.gain.value = 0;
  induction.connect(inductionFilter);
  inductionFilter.connect(inductionGain);
  inductionGain.connect(out);
  induction.start();

  // A small mechanical layer gives the belts/valvetrain something to do
  // between exhaust pulses; filtered low noise supplies body and road rumble.
  const mechanical = ac.createOscillator();
  mechanical.type = 'triangle';
  mechanical.frequency.value = 38;
  const mechanicalFilter = ac.createBiquadFilter();
  mechanicalFilter.type = 'bandpass';
  mechanicalFilter.frequency.value = 720;
  mechanicalFilter.Q.value = .7;
  const mechanicalGain = ac.createGain();
  mechanicalGain.gain.value = .018;
  mechanical.connect(mechanicalFilter);
  mechanicalFilter.connect(mechanicalGain); mechanicalGain.connect(out);
  mechanical.start();

  const rumble = ac.createBufferSource();
  rumble.buffer = noiseBuffer(2);
  rumble.loop = true;
  const rumbleFilter = ac.createBiquadFilter();
  rumbleFilter.type = 'lowpass';
  rumbleFilter.frequency.value = 115;
  rumbleFilter.Q.value = .65;
  const rumbleGain = ac.createGain();
  rumbleGain.gain.value = .012;
  rumble.connect(rumbleFilter); rumbleFilter.connect(rumbleGain); rumbleGain.connect(out);
  rumble.start();

  // An aeroplane adds the propeller: a blade-pass tone an order below the
  // engine note that beats against it, which is the whole character of a
  // piston single heard from behind. A car has no such thing.
  let prop = null;
  let propGain = null;
  let turbo = null;
  let turboGain = null;
  if (kind === 'aircraft') {
    prop = ac.createOscillator();
    prop.type = 'triangle';
    prop.frequency.value = 60;
    propGain = ac.createGain();
    propGain.gain.value = 0.07;
    const propBand = ac.createBiquadFilter();
    propBand.type = 'lowpass';
    propBand.frequency.value = 1400;
    prop.connect(propGain); propGain.connect(propBand); propBand.connect(out);
    prop.start();
  } else {
    // The RS Turbo's induction whistle lives above the four-cylinder block.
    // It follows load and boost rather than road speed, and falls away between
    // gears instead of becoming a permanent sine tone.
    turbo = ac.createOscillator();
    turbo.type = 'sine';
    turbo.frequency.value = 1050;
    turboGain = ac.createGain();
    turboGain.gain.value = 0;
    const turboBand = ac.createBiquadFilter();
    turboBand.type = 'bandpass';
    turboBand.frequency.value = 1800;
    turboBand.Q.value = 3.8;
    turbo.connect(turboGain); turboGain.connect(turboBand); turboBand.connect(out);
    turbo.start();
  }

  engine = { out, compressor, filter, block, exhaust, induction, inductionFilter,
    inductionGain, mechanical, mechanicalFilter, mechanicalGain,
    rumble, rumbleFilter, rumbleGain, prop, propGain, turbo, turboGain,
    kind, revs: 0, throttle: 0, lastPop: -Infinity };
  out.gain.setTargetAtTime(0.42, ac.currentTime, 0.35);
}

function stopEngineAudio() {
  if (!engine) return;
  const dying = engine;
  engine = null;
  const t = ac.currentTime;
  dying.out.gain.setTargetAtTime(0, t, 0.12);
  setTimeout(() => {
    for (const o of dying.block) { try { o.stop(); } catch { /* already stopped */ } }
    try { dying.exhaust.stop(); } catch { /* already stopped */ }
    try { dying.prop?.stop(); } catch { /* already stopped */ }
    try { dying.turbo?.stop(); } catch { /* already stopped */ }
    try { dying.mechanical?.stop(); } catch { /* already stopped */ }
    try { dying.rumble?.stop(); } catch { /* already stopped */ }
    try { dying.induction.stop(); } catch { /* already stopped */ }
    dying.out.disconnect();
    dying.compressor?.disconnect();
  }, 600);
}

function escortGearShiftSound(revs, load) {
  if (!ac || ac.currentTime - lastGearShiftSound < .12) return;
  const t = ac.currentTime;
  lastGearShiftSound = t;
  // Gear engagement under the bonnet, followed by the RS Turbo's short
  // compressor sigh as the throttle closes between ratios.
  noiseBurst({ at: t, hz: 520, q: 2.4, decay: .055, level: .065 + load * .025 });
  noiseBurst({ at: t + .018, hz: 2600 + revs * 1700, q: 2.8,
    decay: .16, level: .035 + load * .035, type: 'bandpass' });
  const whistle = ac.createOscillator();
  const whistleGain = ac.createGain();
  whistle.type = 'sine';
  whistle.frequency.setValueAtTime(2500 + revs * 1800, t);
  whistle.frequency.exponentialRampToValueAtTime(1150, t + .14);
  whistleGain.gain.setValueAtTime(.018 + load * .016, t);
  whistleGain.gain.exponentialRampToValueAtTime(.0005, t + .15);
  whistle.connect(whistleGain); whistleGain.connect(master);
  whistle.start(t); whistle.stop(t + .16);
}

function engineAudio(speedRatio, throttle, gear = null, rpm = null, shifted = false) {
  if (!engine || !ac) return;
  if (engine.kind === 'aircraft') return aircraftAudio(speedRatio, throttle);
  const revs = rpm == null ? 0.28 + speedRatio * 0.72 : THREE.MathUtils.clamp(rpm, 0, 1);
  const load = Math.min(1, Math.abs(throttle) * 0.7 + speedRatio * 0.5);
  const t = ac.currentTime;
  if (shifted) escortGearShiftSound(revs, load);
  const normalised = THREE.MathUtils.clamp((revs - .28) / .72, 0, 1);
  const engineRpm = 950 + normalised * 5500;
  const shiftDip = shifted ? 0.78 : 1;
  const firing = engineRpm / 30 * shiftDip;
  engine.block[0].frequency.setTargetAtTime(firing, t, 0.055);
  engine.block[1].frequency.setTargetAtTime(firing * 1.006, t, 0.06);
  engine.exhaust.frequency.setTargetAtTime(firing * .5, t, 0.065);
  engine.mechanical?.frequency.setTargetAtTime(engineRpm / 60 * 2.15, t, .07);
  engine.mechanicalFilter?.frequency.setTargetAtTime(560 + normalised * 1250, t, .09);
  engine.mechanicalGain?.gain.setTargetAtTime(.012 + normalised * .026, t, .1);
  engine.filter.frequency.setTargetAtTime(430 + normalised * 1750 + load * 620, t, 0.075);
  engine.inductionFilter?.frequency.setTargetAtTime(620 + normalised * 1850 + load * 500, t, .09);
  engine.inductionGain.gain.setTargetAtTime(0.008 + load * 0.052, t, 0.085);
  engine.rumbleGain?.gain.setTargetAtTime(.012 + load * .026 + speedRatio * .014, t, .12);
  if (engine.turbo) engine.turbo.frequency.setTargetAtTime(980 + normalised * 2150, t, 0.08);
  if (engine.turboGain) engine.turboGain.gain.setTargetAtTime(
    Math.max(0, normalised - 0.18) * load * (shifted ? 0.006 : 0.026), t,
    shifted ? 0.02 : 0.08);
  engine.out.gain.setTargetAtTime((0.34 + load * 0.23) * (shifted ? 0.84 : 1), t, 0.055);

  // One restrained exhaust cough on a high-rpm lift. It is event-driven, not
  // a random crackle loop, so coasting does not sound like continuous gunfire.
  if (engine.throttle > .58 && throttle < .12 && normalised > .48
    && t - engine.lastPop > .42) {
    engine.lastPop = t;
    noiseBurst({ at: t + .035, hz: 135, q: .8, decay: .105, level: .045,
      type: 'lowpass' });
    noiseBurst({ at: t + .04, hz: 720, q: 1.3, decay: .07, level: .018 });
  }
  engine.throttle = throttle;
  engine.revs = engineRpm;
}

/**
 * A piston single, which has no gearbox to change.
 *
 * The note climbs straight with the throttle instead of falling every time a
 * car would shift, and the propeller sits about a fifth below the engine and
 * beats against it — the slow throb that makes a light aircraft sound like a
 * light aircraft rather than like a lawnmower.
 */
function aircraftAudio(power, throttle) {
  const t = ac.currentTime;
  const revs = THREE.MathUtils.clamp(power, 0, 1);
  const base = 62 + revs * 88;
  for (const o of engine.block) o.frequency.setTargetAtTime(base, t, 0.14);
  engine.exhaust.frequency.setTargetAtTime(base * 0.5, t, 0.14);
  if (engine.prop) engine.prop.frequency.setTargetAtTime(base * 0.41, t, 0.16);
  if (engine.propGain) engine.propGain.gain.setTargetAtTime(0.03 + revs * 0.075, t, 0.14);
  engine.filter.frequency.setTargetAtTime(360 + revs * 1250, t, 0.14);
  // Slipstream: the faster it goes the more of the noise is air rather than
  // engine, which is what you hear when the throttle comes back in a glide.
  engine.inductionGain.gain.setTargetAtTime(0.018 + revs * 0.055, t, 0.14);
  engine.out.gain.setTargetAtTime(0.30 + revs * 0.34, t, 0.14);
}

// Two tonnes of estate car into a fence post.
function crashSound(strength = 1) {
  if (!ac) return;
  const t = ac.currentTime;
  const level = THREE.MathUtils.clamp(strength, 0.15, 1);
  noiseBurst({ at: t, hz: 180, q: 0.7, decay: 0.30 * level, level: 0.34 * level, type: 'lowpass' });
  noiseBurst({ at: t + 0.005, hz: 2400, q: 1.2, decay: 0.13, level: 0.13 * level });
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = 'triangle';
  o.frequency.setValueAtTime(120 * level + 40, t);
  o.frequency.exponentialRampToValueAtTime(38, t + 0.22);
  g.gain.setValueAtTime(0.22 * level, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
  o.connect(g); g.connect(master);
  o.start(t); o.stop(t + 0.27);
}

// The gate motor: a warning chirp, then the contactor thump and the long
// rumble of a cantilever leaf running out on its rollers.
function gateSound(opening = true) {
  if (!ac) return;
  const t = ac.currentTime;
  clickSound(opening ? 880 : 620, .09, .05);
  noiseBurst({ at: t + 0.16, hz: 90, q: 0.8, decay: 0.09, level: 0.20, type: 'lowpass' });
  const o = ac.createOscillator();
  const g = ac.createGain();
  const band = ac.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = 260;
  band.Q.value = 1.6;
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(46, t + 0.16);
  o.frequency.linearRampToValueAtTime(opening ? 62 : 52, t + 0.7);
  o.frequency.linearRampToValueAtTime(40, t + 2.0);
  g.gain.setValueAtTime(0.0001, t + 0.16);
  g.gain.linearRampToValueAtTime(0.075, t + 0.42);
  g.gain.setValueAtTime(0.075, t + 1.5);
  g.gain.exponentialRampToValueAtTime(0.0008, t + 2.1);
  o.connect(band); band.connect(g); g.connect(master);
  o.start(t + 0.16); o.stop(t + 2.15);
}

// The horn. Two detuned square waves through a resonant band, which is what a
// pair of horn trumpets a semitone apart actually sounds like.
let hornUntil = 0;
function hornSound() {
  if (!ac || ac.currentTime < hornUntil) return;
  const t = ac.currentTime;
  hornUntil = t + 0.30;
  const g = ac.createGain();
  const band = ac.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = 900;
  band.Q.value = 1.1;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.085, t + 0.02);
  g.gain.setValueAtTime(0.085, t + 0.22);
  g.gain.exponentialRampToValueAtTime(0.0008, t + 0.30);
  band.connect(g); g.connect(master);
  for (const hz of [420, 445]) {
    const o = ac.createOscillator();
    o.type = 'square';
    o.frequency.value = hz;
    o.connect(band);
    o.start(t); o.stop(t + 0.32);
  }
  gamepad.rumble(.22, .5, 220);
}

function setRadioNoise(v){if(radioGain&&ac)radioGain.gain.setTargetAtTime(v,ac.currentTime,.04)}
function setOutdoorAudio(on){if(outdoorGain&&ac)outdoorGain.gain.setTargetAtTime(on?.045:0,ac.currentTime,.15)}
function clickSound(freq=500,d=.05,vol=.04){if(!ac)return;const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();o.frequency.value=freq;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(master);o.start(t);o.stop(t+d+.01)}
function beacon(){clickSound(760,.25,.035)}
// The dog. A bark is two pitched noise bursts through a formant; a whine is one
// long one that slides. Neither is a sample; both are unmistakably a dog.
function dogSound(kind = 'bark') {
  if (!ac) return;
  const t = ac.currentTime;
  const shape = (at, hz, sweep, decay, level) => {
    const source = ac.createBufferSource();
    source.buffer = noiseBuffer(.6);
    const throat = ac.createBiquadFilter();
    throat.type = 'bandpass';
    throat.Q.value = 3.4;
    throat.frequency.setValueAtTime(hz, at);
    throat.frequency.exponentialRampToValueAtTime(Math.max(60, sweep), at + decay);
    const body = ac.createBiquadFilter();
    body.type = 'lowpass';
    body.frequency.value = hz * 3.2;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(.0008, at);
    gain.gain.exponentialRampToValueAtTime(level, at + decay * .12);
    gain.gain.exponentialRampToValueAtTime(.0006, at + decay);
    source.connect(throat); throat.connect(body); body.connect(gain); gain.connect(master);
    source.start(at); source.stop(at + decay + .05);
    const voice = ac.createOscillator();
    voice.type = 'sawtooth';
    voice.frequency.setValueAtTime(hz * .48, at);
    voice.frequency.exponentialRampToValueAtTime(Math.max(50, sweep * .48), at + decay);
    const voiceGain = ac.createGain();
    voiceGain.gain.setValueAtTime(.0008, at);
    voiceGain.gain.exponentialRampToValueAtTime(level * .5, at + decay * .12);
    voiceGain.gain.exponentialRampToValueAtTime(.0005, at + decay);
    voice.connect(voiceGain); voiceGain.connect(master);
    voice.start(at); voice.stop(at + decay + .05);
  };
  if (kind === 'bark') {
    shape(t, 620, 300, .16, .17);
    shape(t + .22, 560, 260, .18, .13);
  } else {
    shape(t, 480, 760, .52, .09);
  }
}
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

// --- The room a shot happens in --------------------------------------------
// Every gun in the game used to fire into a vacuum: a sawtooth and two filtered
// noise bursts, ending the moment the envelope did. What makes a gunshot sound
// real is mostly not the gun — it is the two-millisecond transient at the front
// of it and the room behind it, and the shelter, the silo and the compound are
// three completely different rooms.
const SHOT_SPACES = {
  // Concrete box, three metres to a wall. Short, hard, and it eats the top end.
  bunker: { seconds: 0.9, decay: 3.6, damp: 2400, wet: 0.46,
    taps: [[0.009, 0.55], [0.017, 0.44], [0.029, 0.34], [0.044, 0.22]] },
  // Sixty metres of open shaft with steel walkways all the way down it.
  silo: { seconds: 2.9, decay: 1.8, damp: 3600, wet: 0.66,
    taps: [[0.031, 0.6], [0.068, 0.48], [0.113, 0.4], [0.181, 0.32], [0.27, 0.24]] },
  // Nothing to reflect off but the fence, the shelter roof and the far
  // treeline, so it is one long thin slap and then the field.
  outside: { seconds: 1.7, decay: 5.4, damp: 1600, wet: 0.24,
    taps: [[0.085, 0.34], [0.168, 0.22], [0.312, 0.13]] },
};

let shotDry = null;
let shotConvolver = null;
let shotWet = null;
const shotSpaceCache = new Map();

// A procedural impulse response: exponentially decaying noise, damped by a
// one-pole low pass, with the early reflections written in as discrete taps.
function impulseResponse({ seconds, decay, damp, taps }) {
  const rate = ac.sampleRate;
  const length = Math.max(1, Math.floor(rate * seconds));
  const buffer = ac.createBuffer(2, length, rate);
  // One-pole coefficient for the damping corner, so the tail loses its top end
  // as it goes — which is what air and soft surfaces actually do to it.
  const k = Math.exp(-2 * Math.PI * damp / rate);
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    let last = 0;
    for (let i = 0; i < length; i++) {
      const t = i / length;
      const noise = (Math.random() * 2 - 1) * Math.pow(1 - t, decay);
      last = noise * (1 - k) + last * k;
      data[i] = last;
    }
    for (const [at, level] of taps) {
      const index = Math.floor(at * rate * (0.94 + Math.random() * 0.12));
      if (index < length) data[index] += level * (channel ? -1 : 1);
    }
  }
  return buffer;
}

function setShotSpace(world) {
  if (!ac || !shotConvolver) return;
  const space = SHOT_SPACES[world] || SHOT_SPACES.bunker;
  if (!shotSpaceCache.has(world)) shotSpaceCache.set(world, impulseResponse(space));
  shotConvolver.buffer = shotSpaceCache.get(world);
  shotWet.gain.setTargetAtTime(space.wet, ac.currentTime, 0.2);
}

function ensureShotBus() {
  if (shotDry || !ac) return;
  shotDry = ac.createGain();
  shotDry.gain.value = 1;
  shotDry.connect(master);
  shotConvolver = ac.createConvolver();
  shotConvolver.normalize = true;
  shotWet = ac.createGain();
  shotWet.gain.value = 0.4;
  shotConvolver.connect(shotWet);
  shotWet.connect(master);
  setShotSpace(currentWorld);
}

// One output per shot, fed to the room and to the direct path at once.
function shotOut() {
  const out = ac.createGain();
  out.gain.value = 1;
  out.connect(shotDry);
  out.connect(shotConvolver);
  return out;
}

// A soft-clip curve. An overdriven horn folds harmonics into the blast, and
// that fold is the difference between a crack and a buzz.
let shotShaper = null;
function shaperCurve() {
  if (shotShaper) return shotShaper;
  shotShaper = new Float32Array(1024);
  for (let i = 0; i < 1024; i++) {
    const x = (i / 1023) * 2 - 1;
    shotShaper[i] = Math.tanh(x * 2.6);
  }
  return shotShaper;
}

/**
 * A filtered noise burst on the shot bus, optionally sweeping its filter down
 * as it decays — which is how a blast rolls away rather than just stopping.
 */
function blastLayer(out, { at, hz, q, decay, level, type = 'bandpass', sweepTo = 0, hold = 0 }) {
  const source = ac.createBufferSource();
  source.buffer = shotNoiseBuffer();
  source.loop = true;
  const filter = ac.createBiquadFilter();
  filter.type = type;
  filter.frequency.setValueAtTime(hz, at);
  if (sweepTo) filter.frequency.exponentialRampToValueAtTime(Math.max(40, sweepTo), at + decay);
  filter.Q.value = q;
  const gain = ac.createGain();
  // Two-stage decay: real blasts drop most of their energy at once and then
  // trail. A single exponential reads as a synthesised whoosh.
  gain.gain.setValueAtTime(Math.max(.0008, level), at);
  if (hold) gain.gain.setValueAtTime(Math.max(.0008, level), at + hold);
  gain.gain.exponentialRampToValueAtTime(Math.max(.0006, level * 0.18), at + hold + decay * 0.22);
  gain.gain.exponentialRampToValueAtTime(.0005, at + hold + decay);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(out);
  source.start(at, Math.random() * 1.4);
  source.stop(at + hold + decay + .04);
}

/**
 * The brass hitting the ground.
 *
 * A case leaves the port, turns over in the air and lands about half a second
 * later, and on a hard floor it bounces twice more. Nobody would list it if
 * asked what a rifle sounds like, and every shot without it sounds like it was
 * fired in a vacuum. Shotguns and revolvers do not throw anything: a pump gun
 * ejects on the stroke, and a revolver keeps its brass until you tip it out.
 */
function casingSound(spec) {
  if (!ac || !master) return;
  const family = spec?.family;
  if (family === 'shotgun' || family === 'revolver' || spec?.kind === 'melee') return;
  const hard = currentWorld !== 'outside';
  const t = ac.currentTime;
  const size = family === 'sniper' ? 0.72 : family === 'pistol' ? 1.22 : 1.0;
  const bounces = hard ? 3 : 2;
  for (let i = 0; i < bounces; i++) {
    // Each bounce is quieter, later and a little higher than the one before.
    const at = t + 0.34 + i * (0.13 + Math.random() * 0.07) + Math.random() * 0.05;
    const level = (hard ? 0.052 : 0.030) * Math.pow(0.55, i);
    const hz = (2400 + Math.random() * 1500) * size * (1 + i * 0.14);
    noiseBurst({ at, hz, q: 9 + Math.random() * 7, decay: 0.055 - i * 0.012, level });
    // A ring on top of the tap, which is what makes it read as brass rather
    // than as a stone.
    const ring = ac.createOscillator();
    const gain = ac.createGain();
    ring.type = 'triangle';
    ring.frequency.value = hz * (1.6 + Math.random() * 0.5);
    gain.gain.setValueAtTime(level * 0.55, at);
    gain.gain.exponentialRampToValueAtTime(0.0004, at + 0.09);
    ring.connect(gain); gain.connect(master);
    ring.start(at); ring.stop(at + 0.10);
  }
}

/**
 * The action closing again.
 *
 * The sear before the primer was already there; this is the other half — the
 * bolt going back, the case leaving, and the next round being stripped off the
 * magazine — which arrives just late enough after the blast to be heard under
 * its tail.
 */
function actionCycleSound(spec) {
  if (!ac || !master || spec?.kind === 'melee') return;
  const t = ac.currentTime + 0.045;
  const heft = spec?.family === 'sniper' ? 1.5 : spec?.family === 'pistol' ? 0.7 : 1.0;
  noiseBurst({ at: t, hz: 1500 / heft, q: 3.4, decay: 0.035, level: 0.055 });
  noiseBurst({ at: t + 0.030 * heft, hz: 900 / heft, q: 2.6, decay: 0.045, level: 0.045 });
}

/**
 * The report coming back off the treeline.
 *
 * The convolution gives the space its character, but out in open country what
 * you actually hear is two discrete slaps — one off whatever is a hundred
 * metres away and a fainter one off whatever is three hundred — and no
 * reverb tail reproduces that. Indoors there is nothing far enough away for it,
 * so it does not run.
 */
function shotEchoes(spec) {
  if (!ac || !master || currentWorld !== 'outside') return;
  const voice = spec?.audio?.fire;
  if (!voice || voice.level < 0.22) return;
  const t = ac.currentTime;
  for (const [delay, level, hz] of [[0.21, 0.16, 900], [0.46, 0.075, 520]]) {
    noiseBurst({
      at: t + delay + Math.random() * 0.02,
      hz, q: 0.8, decay: 0.16 + delay, level: voice.level * level, type: 'lowpass',
    });
  }
}

function weaponFireSound(spec) {
  if (!ac || !master) return;
  const voice = spec?.audio?.fire;
  if (!voice) return;
  ensureShotBus();
  // Everything that happens because of the shot rather than during it.
  actionCycleSound(spec);
  casingSound(spec);
  shotEchoes(spec);
  const authentic = fireSampleForWeapon(spec);
  if (authentic && playGunSample(authentic, {
    gain: THREE.MathUtils.clamp(0.52 + voice.level * 0.32, 0.58, 0.88),
    rate: 0.975 + Math.random() * 0.05,
  })) return;
  const t = ac.currentTime;
  const out = shotOut();
  // No two rounds out of the same barrel are identical, and 950 rounds a
  // minute of one recorded sample is the most obviously fake thing in a game.
  const vary = 0.94 + Math.random() * 0.12;

  // 1. The transient. Six milliseconds of barely-filtered noise: the part the
  //    ear reads as "something exploded". Without it, everything below is a
  //    tone with a filter on it.
  if (voice.snapLevel > 0) {
    blastLayer(out, {
      at: t, hz: voice.snapHz * vary, q: 0.35, decay: 0.007,
      level: voice.level * voice.snapLevel, type: 'highpass',
    });
  }

  // 2. The muzzle blast, through a soft clip so the harmonics fold the way an
  //    overdriven horn's do.
  const body = ac.createOscillator();
  body.type = 'sawtooth';
  body.frequency.setValueAtTime(voice.bodyHz * vary, t);
  body.frequency.exponentialRampToValueAtTime(
    Math.max(20, voice.bodyEndHz * vary), t + voice.bodyDecay);
  const shaper = ac.createWaveShaper();
  shaper.curve = shaperCurve();
  shaper.oversample = '2x';
  const bodyGain = ac.createGain();
  bodyGain.gain.setValueAtTime(voice.level * .82, t);
  bodyGain.gain.exponentialRampToValueAtTime(voice.level * .12, t + voice.bodyDecay * .3);
  bodyGain.gain.exponentialRampToValueAtTime(.0008, t + voice.bodyDecay + .04);
  body.connect(shaper);
  shaper.connect(bodyGain);
  bodyGain.connect(out);
  body.start(t);
  body.stop(t + voice.bodyDecay + .06);

  // 3. The muzzle crack proper.
  blastLayer(out, {
    at: t, hz: voice.crackHz * vary, q: voice.crackQ,
    decay: voice.crackDecay, level: voice.level, sweepTo: voice.crackHz * .35,
  });

  // 4. The round going past — a supersonic bullet's own shock wave, a few
  //    milliseconds behind the muzzle and much higher. Subsonic weapons and
  //    anything with a can on it do not have one.
  if (voice.superLevel > 0) {
    blastLayer(out, {
      at: t + voice.superAt, hz: voice.superHz * vary, q: 2.4,
      decay: 0.028, level: voice.level * voice.superLevel, type: 'bandpass',
    });
  }

  // 5. The blast rolling away, sweeping down as it goes.
  blastLayer(out, {
    at: t + .012, hz: voice.tailHz, q: .6, decay: voice.tailDecay,
    level: voice.level * voice.tailLevel, type: 'lowpass', sweepTo: voice.tailHz * .28,
  });

  // 6. The sear letting go, a millisecond and a half before the primer. It is
  //    tiny and nobody notices it consciously; take it out and every shot
  //    starts a fraction too cleanly.
  if (voice.actionLevel > 0) {
    blastLayer(out, { at: Math.max(0, t - 0.0016), hz: voice.actionHz * 1.6, q: 5.0,
      decay: 0.006, level: voice.level * 0.10 });
  }

  // 7. The bottom end. A big cartridge is felt before it is heard, and a
  //    sine an octave under the blast is what carries that through a speaker
  //    that cannot reproduce the real thing.
  if (voice.level > 0.34) {
    const thump = ac.createOscillator();
    const thumpGain = ac.createGain();
    thump.type = 'sine';
    thump.frequency.setValueAtTime(voice.bodyHz * 0.46 * vary, t);
    thump.frequency.exponentialRampToValueAtTime(
      Math.max(24, voice.bodyEndHz * 0.40), t + voice.bodyDecay * 1.6);
    thumpGain.gain.setValueAtTime(voice.level * 0.5, t);
    thumpGain.gain.exponentialRampToValueAtTime(.0008, t + voice.bodyDecay * 1.8);
    thump.connect(thumpGain);
    thumpGain.connect(out);
    thump.start(t);
    thump.stop(t + voice.bodyDecay * 1.9);
  }

  // 8. The mechanism: a bolt or a slide cycling behind the shot. On the
  //    suppressed SMG it is the loudest thing in the list.
  if (voice.actionLevel > 0) {
    const at = t + voice.actionAt;
    blastLayer(out, {
      at, hz: voice.actionHz, q: 2.6, decay: 0.026,
      level: voice.level * voice.actionLevel,
    });
    blastLayer(out, {
      at: at + voice.actionSpread, hz: voice.actionHz * 0.62, q: 3.2, decay: 0.036,
      level: voice.level * voice.actionLevel * 0.7,
    });

    // 9. The case. It leaves the port, turns over, and hits the deck about a
    //    third of a second later, and then again, smaller. It is the most
    //    recognisable sound a firearm makes after the shot itself, and no
    //    amount of work on the blast substitutes for it.
    const brass = 0.26 + Math.random() * 0.14;
    for (let bounce = 0; bounce < 3; bounce++) {
      const when = at + brass + bounce * (0.085 + Math.random() * 0.06);
      const fade = 0.55 ** bounce;
      blastLayer(out, {
        at: when, hz: (2700 + Math.random() * 1400) * (1 + bounce * 0.18), q: 7.5,
        decay: 0.055 * fade + 0.010, level: voice.level * 0.10 * fade,
      });
      const ring = ac.createOscillator();
      const ringGain = ac.createGain();
      ring.type = 'triangle';
      ring.frequency.setValueAtTime((3200 + Math.random() * 900) * (1 + bounce * 0.2), when);
      ringGain.gain.setValueAtTime(voice.level * 0.045 * fade, when);
      ringGain.gain.exponentialRampToValueAtTime(.0004, when + 0.09 * fade + 0.02);
      ring.connect(ringGain);
      ringGain.connect(out);
      ring.start(when);
      ring.stop(when + 0.12);
    }
  }
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
  ensureShotBus();
  const recorded = reloadSamplesForWeapon(spec);
  if (recorded.length && recorded.every(({ key }) => gunSampleBuffers.has(key))) {
    for (const sample of recorded) {
      playGunSample(sample.key, {
        delay: sample.at,
        gain: sample.gain,
        rate: sample.rate,
        maxVoices: 8,
      });
    }
    return;
  }
  const t0 = ac.currentTime;
  // Reloading rings off the same walls the shot does. A magazine seated in the
  // silo and one seated in the shelter should not sound identical.
  const out = shotOut();
  for (const click of sequence) {
    const at = t0 + click.at;
    blastLayer(out, { at, hz: click.hz, q: click.q, decay: click.decay, level: click.level * .5 });
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
    gain.connect(out);
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
const MAX_DEBRIS = coarse ? 84 : 180;

function addDebris(entry) {
  while (debris.length >= MAX_DEBRIS) {
    const oldest = debris.shift();
    oldest?.scene?.remove(oldest.mesh);
  }
  debris.push(entry);
}

function burst(point, kind, count = 7, spread = 0.26) {
  const scene = activeScene();
  for (let i = 0; i < count; i++) {
    const particle = new THREE.Mesh(impactGeometry, impactMaterials[kind]);
    particle.position.copy(point);
    scene.add(particle);
    addDebris({
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

// --- Gore --------------------------------------------------------------
// Shooting a person used to produce seven three-centimetre cubes that fell for
// half a second. A round through someone throws a cone of blood out behind
// them, mists at the entry, spatters whatever is stood behind, and leaves a
// pool where they land.
const _gorePoint = new THREE.Vector3();
const _goreDir = new THREE.Vector3();
const _goreEnd = new THREE.Vector3();
const _goreNormal = new THREE.Vector3();
const bloodMistGeometry = new THREE.SphereGeometry(0.055, 6, 5);
const bloodMistMaterial = new THREE.MeshBasicMaterial({
  color: 0x8c1a13, transparent: true, opacity: 0.62, depthWrite: false,
});

/**
 * A round arriving in flesh.
 *
 * `direction` is the way the round was travelling; `weight` scales the whole
 * thing, so buckshot at three metres is not a nine-millimetre at forty.
 */
function gore(point, direction, weight = 1, { fatal = false } = {}) {
  const scene = activeScene();
  _goreDir.copy(direction).setY(direction.y * 0.35).normalize();

  // The mist at the entry wound: a puff that expands and fades on the spot.
  const mist = new THREE.Mesh(bloodMistGeometry, bloodMistMaterial.clone());
  mist.position.copy(point);
  mist.scale.setScalar(0.6 * weight);
  scene.add(mist);
  addDebris({
    mesh: mist, scene, life: 0.34, spawned: 0.34,
    velocity: new THREE.Vector3(_goreDir.x * 0.6, 0.25, _goreDir.z * 0.6),
    grow: 5.4 * weight, fade: true, gravity: 1.2,
  });

  // The spray. Weighted downrange, because that is where the round went.
  const drops = Math.round((fatal ? 26 : 15) * weight);
  for (let i = 0; i < drops; i++) {
    const drop = new THREE.Mesh(impactGeometry, impactMaterials.blood);
    drop.position.copy(point);
    drop.scale.setScalar(0.5 + Math.random() * 1.4);
    scene.add(drop);
    const cone = 0.55 + Math.random() * 0.75;
    addDebris({
      mesh: drop, scene,
      life: 0.7 + Math.random() * 0.9,
      velocity: new THREE.Vector3(
        _goreDir.x * (2.4 + Math.random() * 5.2) + (Math.random() - 0.5) * cone * 5,
        1.1 + Math.random() * 2.6,
        _goreDir.z * (2.4 + Math.random() * 5.2) + (Math.random() - 0.5) * cone * 5),
      gravity: 16,
      spin: (Math.random() - 0.5) * 14,
    });
  }

  // What is stood behind them wears it. One ray downrange, one straight down.
  spatter(scene, point, _goreDir, 3.4, 0.30 * weight, fatal ? 4 : 2);
  spatter(scene, point, _goreEnd.set(0, -1, 0), 2.6, 0.34 * weight, fatal ? 3 : 1);
}

/** Throw blood along a direction and mark whatever stops it. */
function spatter(scene, point, direction, reach, size, count) {
  if (count <= 0) return;
  for (let i = 0; i < count; i++) {
    _goreEnd.copy(direction)
      .add(_gorePoint.set((Math.random() - 0.5) * 0.55, (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.55))
      .normalize();
    ray.set(point, _goreEnd);
    ray.far = reach;
    const hit = firstWorldImpact(scene);
    if (!hit) continue;
    if (hit.face) {
      _normalMatrix.getNormalMatrix(hit.object.matrixWorld);
      _goreNormal.copy(hit.face.normal).applyMatrix3(_normalMatrix).normalize();
    } else {
      _goreNormal.copy(_goreEnd).negate();
    }
    const mark = decals.add(scene, hit.point, _goreNormal, {
      kind: 'blood', size: size * (0.7 + Math.random() * 0.9),
    });
    if (mark) mark.userData.isDecal = true;
  }
}

/** The pool under someone who is not getting up. */
function bloodPool(target) {
  const scene = activeScene();
  const base = target.position;
  for (let i = 0; i < 5; i++) {
    _gorePoint.set(base.x + (Math.random() - 0.5) * 1.5, base.y + 0.02,
      base.z + (Math.random() - 0.5) * 1.5);
    const mark = decals.add(scene, _gorePoint, _goreNormal.set(0, 1, 0), {
      kind: 'blood', size: 0.5 + Math.random() * 0.7,
    });
    if (mark) mark.userData.isDecal = true;
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
    particle.velocity.y -= (particle.gravity ?? 14) * dt;
    particle.mesh.position.addScaledVector(particle.velocity, dt);
    if (particle.grow) {
      particle.mesh.scale.addScalar(particle.grow * dt);
    }
    if (particle.spin) {
      particle.mesh.rotation.x += particle.spin * dt;
      particle.mesh.rotation.z += particle.spin * 0.7 * dt;
    }
    if (particle.fade && particle.mesh.material.transparent) {
      particle.mesh.material.opacity = 0.62 * (particle.life / (particle.spawned || 1));
    }
  }
}

function beginGame({ restore = true } = {}) {
  if (!game || started) return;
  opening.hide();
  started = true;
  const resumed = restore && restoreRun();
  updateStats();updateAmmo();updateHealth();renderObjectives();
  document.body.classList.add('playing');boot.style.display='none';updateOrientation();
  setTimeout(() => {
    renderer.setSize(innerWidth, innerHeight);
    if (quality.post) composer.setSize(innerWidth, innerHeight);
    feedComposer.setSize(innerWidth, innerHeight);
    game.camera.aspect = innerWidth / innerHeight;
    game.camera.updateProjectionMatrix();
  }, 160);
  flash(resumed ? `RUN RESUMED — DAY ${survival.day}` : 'SHELTER 47 // REPOSITORY BUILD', resumed ? 2600 : 2200);
}

startButton.onclick=async()=>{
  if(!game){location.reload();return}
  opening.hide();
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

// Looking through the sights.
//
// The old aim pose was three hand-typed numbers per family that shoved the
// weapon toward the middle of the screen and left the player a floating
// crosshair to aim with — the sights on top of the model were decoration, and
// on anything but the scoped rifles the receiver ended up filling the frame.
//
// The weapon knows where its own sights are. Given the two points, there is
// exactly one place to hold it: rotated so the line joining them runs straight
// down the camera's axis, and slid so the rear sight sits one eye relief in
// front of the eye. Then the rear notch, the front post and whatever is behind
// them all land on the same pixel, and aiming is looking rather than reading a
// crosshair. The stock ends up behind the near plane and is not drawn, which
// is also what you see over a real set of irons.
// How far in front of the eye the rear sight sits, by family. Not a style
// choice: it is where that class of weapon is actually held. A long gun is
// against the shoulder with the eye just behind the receiver; a handgun is out
// at arm's length, which is half a metre further away, and holding one at
// carbine distance put the cylinder of a revolver across the whole screen.
// The shotgun's rear reference is its receiver rather than a rear sight — it
// is aimed off a bead and a rib — so it needs the extra room to clear it.
const EYE_RELIEF = {
  rifle: .20, smg: .19, shotgun: .32, sniper: .20, pistol: .50, revolver: .52, blade: .34,
};

const _hipPosition = new THREE.Vector3();
const _aimPosition = new THREE.Vector3();
const _hipQuaternion = new THREE.Quaternion();
const _aimQuaternion = new THREE.Quaternion();
const _poseEuler = new THREE.Euler(0, 0, 0, 'ZYX');
const _sightAxis = new THREE.Vector3();
const _sightRight = new THREE.Vector3();
const _sightUp = new THREE.Vector3();
const _sightBasis = new THREE.Matrix4();
const _worldUp = new THREE.Vector3(0, 1, 0);
let aimBlend = 0;

/** The transform that puts this weapon's sight line on the camera's axis. */
function poseOnSights(sights, family) {
  _sightAxis.copy(sights.front).sub(sights.rear);
  if (_sightAxis.lengthSq() < 1e-8) return false;
  _sightAxis.normalize();
  _sightRight.crossVectors(_sightAxis, _worldUp);
  if (_sightRight.lengthSq() < 1e-8) _sightRight.set(1, 0, 0);
  _sightRight.normalize();
  _sightUp.crossVectors(_sightRight, _sightAxis).normalize();
  // The basis that maps the camera's axes onto the weapon's; the pose is its
  // inverse, which is what turns the weapon to face down the camera instead.
  _sightBasis.makeBasis(_sightRight, _sightUp, _sightAxis.clone().negate());
  _aimQuaternion.setFromRotationMatrix(_sightBasis).invert();
  const relief = EYE_RELIEF[family] ?? EYE_RELIEF.rifle;
  _aimPosition.copy(sights.rear).applyQuaternion(_aimQuaternion).negate();
  _aimPosition.z -= relief;
  return true;
}

function updateWeapon(dt) {
  if (!armed) return;
  const sway = Math.min(body.horizontalSpeed / 3, 1) * (aiming ? .22 : 1);
  const bob = body.distanceWalked * 3.4;

  // Where it hangs when nobody is aiming it.
  _hipPosition.set(...hipPose(weapon));
  _hipPosition.x += Math.cos(bob * .5) * .014 * sway;
  _hipPosition.y += Math.sin(bob) * .011 * sway + Math.sin(breath * .8) * .004;
  _hipPosition.z += sprinting ? .05 : 0;
  _poseEuler.set(-.04 + (sprinting ? .22 : 0),
    -.08 + Math.sin(bob * .5) * .02 * sway + (sprinting ? .3 : 0),
    sprinting ? .24 : 0);
  _hipQuaternion.setFromEuler(_poseEuler);

  // Where it goes when they are. A weapon whose sights could not be found
  // falls back to the old hand-set pose rather than to nothing.
  const sights = game.heldSights?.();
  if (!sights || !poseOnSights(sights, weapon?.family)) {
    _aimPosition.set(...aimPose(weapon));
    _poseEuler.set(.13, 0, 0);
    _aimQuaternion.setFromEuler(_poseEuler);
  }
  // Breathing still moves it, even braced — just far less than at the hip.
  _aimPosition.y += Math.sin(breath * .8) * .0016;

  aimBlend = THREE.MathUtils.damp(aimBlend, aiming ? 1 : 0, 14, dt);
  game.weaponView.position.lerpVectors(_hipPosition, _aimPosition, aimBlend);
  game.weaponView.quaternion.slerpQuaternions(_hipQuaternion, _aimQuaternion, aimBlend);

  // Recoil, on top of wherever the pose left it. A weapon climbs: the muzzle
  // goes up and the whole thing comes back into the shoulder. Rotating the
  // view model the other way had every shot in the game driving the barrel
  // into the ground while the camera lifted off it.
  game.weaponView.position.y += recoil * .07;
  game.weaponView.position.z += recoil * .13 + recoilPunch * .022;
  game.weaponView.rotateX(recoil * .5 + recoilPunch * .085);

  // Optics differ. A scoped rifle pulls the frame in much further than a
  // pistol at arm's length, so the sight picture comes out of the catalogue;
  // irons get a modest pull-in, enough to read the post without the world
  // lurching.
  const targetFov = aiming ? (weapon?.zoom ?? (sights ? 54 : 62)) : 70;
  // A scoped rifle is never quite still, and magnification is what makes that
  // visible. Breathing walks the aim; holding it steady is the player's job.
  if (scoped) {
    yaw += Math.sin(breath * 0.83) * 0.00028 * 0.35;
    pitch += Math.cos(breath * 0.61) * 0.00022 * 0.35;
  }
  const nextFov = THREE.MathUtils.damp(game.camera.fov, targetFov, 12, dt);
  if (Math.abs(nextFov - game.camera.fov) > .001) {
    game.camera.fov = nextFov;
    game.camera.updateProjectionMatrix();
  }
}

// --- The optic ------------------------------------------------------------
// The scope used to be a CSS overlay: a black panel with a circular mask that
// composited the wrong way round, so it blacked out the middle of the screen
// rather than the surround, and behind it the main camera simply narrowed its
// field of view. That is not a scope. It cannot magnify past what the screen
// is already showing, the eye box is a hole cut in a black rectangle, and the
// picture inside it is the same picture as outside it.
//
// This is an optic: a second camera on the same eye, with the objective's own
// field of view, rendered into its own target and drawn inside the eyepiece.
// The magnification is real, the sight picture is independent of the screen,
// and what surrounds it is the inside of a tube.
const SCOPE_SIZE = 1024;
let scopeTarget = null;
let scopeCamera = null;
let scopeScene = null;
let scopeQuad = null;
let scopeMaterial = null;

function ensureScope() {
  if (scopeTarget) return;
  scopeTarget = new THREE.WebGLRenderTarget(SCOPE_SIZE, SCOPE_SIZE, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    type: THREE.HalfFloatType,
    samples: quality.samples || 0,
  });
  // The target holds linear light: the composer owns the output conversion for
  // the main frame, and this quad is drawn straight to the framebuffer after
  // it, so the shader has to do its own encode on the way out.
  scopeTarget.texture.colorSpace = THREE.NoColorSpace;
  scopeCamera = new THREE.PerspectiveCamera(10, 1, 0.15, 900);
  scopeScene = new THREE.Scene();
  scopeMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      view: { value: scopeTarget.texture },
      aspect: { value: 1 },
      radius: { value: 0.38 },
      open: { value: 0 },
      // How far off centre the eye is. A scope shades to black the moment you
      // are not behind it, which is the whole reason a cheek weld exists.
      shadow: { value: 0 },
      mils: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
    `,
    fragmentShader: `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D view;
      uniform float aspect;
      uniform float radius;
      uniform float open;
      uniform float shadow;
      uniform float mils;

      void main() {
        vec2 centred = vUv - 0.5;
        centred.x *= aspect;
        float r = length(centred) / radius;

        // Outside the eyepiece is the inside of the tube. Not pitch black —
        // a shooter keeps some periphery — but dark enough that the eye goes
        // where the glass is.
        float inside = smoothstep(1.002, 0.986, r);
        // The objective's image is a disc; it does not fill a rectangle.
        vec2 lens = (centred / radius) * 0.5 + 0.5;
        vec3 image = texture2D(view, lens).rgb;

        // Eye relief: the further the eye is off axis, the more of the picture
        // is shadowed from the edge in.
        float relief = 1.0 - smoothstep(0.55 - shadow * 0.5, 1.0, r);
        // Vignette and the faint blue-green cast of coated glass.
        float edge = 1.0 - smoothstep(0.62, 1.0, r);
        image *= mix(0.24, 1.0, edge) * relief;
        image *= vec3(0.94, 1.0, 0.97);

        // Reticle: a fine duplex cross with mil marks down the lower stadia.
        float thin = 0.0016 / radius;
        float thick = 0.0052 / radius;
        vec2 a = abs(centred / radius);
        float cross = 0.0;
        cross = max(cross, step(a.x, thin) * step(a.y, 0.86));
        cross = max(cross, step(a.y, thin) * step(a.x, 0.86));
        // The heavy posts, which stop short of the middle.
        cross = max(cross, step(a.x, thick) * step(0.42, a.y) * step(a.y, 0.92));
        cross = max(cross, step(a.y, thick) * step(0.42, a.x) * step(a.x, 0.92));
        // Mil dots down the bottom stadium.
        for (int i = 1; i <= 4; i++) {
          float at = float(i) * 0.10;
          float w = 0.030 - float(i) * 0.004;
          cross = max(cross, step(a.x, w) * step(abs(-centred.y / radius - at), thin * 1.4));
        }
        vec3 colour = mix(image, vec3(0.02, 0.025, 0.022), cross * edge);

        // The housing's shadow just inside the rim.
        image *= 1.0 - smoothstep(0.90, 1.0, r) * 0.85;

        // A thread of light off the lens coating, top left.
        float glint = smoothstep(0.55, 0.0, length(centred / radius - vec2(-0.34, 0.30)));
        colour += vec3(0.10, 0.13, 0.11) * glint * 0.30 * edge;

        // Encode: this is drawn to the framebuffer by hand, after the post
        // stack has already had its say about the rest of the frame.
        colour = pow(max(colour, 0.0), vec3(1.0 / 2.2));
        vec3 surround = vec3(0.0);
        vec3 finalColour = mix(surround, colour, inside);
        float alpha = mix(0.90, 1.0, inside) * open;
        gl_FragColor = vec4(finalColour, alpha);
      }
    `,
  });
  scopeQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), scopeMaterial);
  scopeQuad.frustumCulled = false;
  scopeScene.add(scopeQuad);
}

/** Draw the optic over the finished frame. */
function renderScope(scene) {
  if (!scoped || !weapon?.zoom) return;
  ensureScope();
  const fov = weapon.opticFov ?? Math.max(3.2, 62 / (weapon.magnification ?? 4));
  if (Math.abs(scopeCamera.fov - fov) > 0.001) {
    scopeCamera.fov = fov;
    scopeCamera.updateProjectionMatrix();
  }
  // Same eye, same instant: the optic sees exactly what the shooter's eye is
  // pointed at, including the recoil the shot just put into it.
  game.camera.getWorldPosition(scopeCamera.position);
  game.camera.getWorldQuaternion(scopeCamera.quaternion);

  const wasVisible = game.weaponView.visible;
  game.weaponView.visible = false;
  const previousTarget = renderer.getRenderTarget();
  renderer.setRenderTarget(scopeTarget);
  renderer.clear();
  renderer.render(scene, scopeCamera);
  renderer.setRenderTarget(previousTarget);
  game.weaponView.visible = wasVisible;

  scopeMaterial.uniforms.aspect.value = innerWidth / innerHeight;
  scopeMaterial.uniforms.open.value = scopeOpen;
  // Recoil moves the eye behind the glass.
  scopeMaterial.uniforms.shadow.value = THREE.MathUtils.clamp(
    Math.abs(recoilPitch) * 5.0, 0, 0.9);
  const previousAutoClear = renderer.autoClear;
  renderer.autoClear = false;
  renderer.render(scopeScene, scopeCamera);
  renderer.autoClear = previousAutoClear;
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
  updatePad(dt);
  updatePlayer(dt);
  activeScene().updateMatrixWorld();
  updatePrompt();
  game.update(dt, currentWorld, game.player.position);
  recoil = THREE.MathUtils.damp(recoil, 0, 13, dt);
  updateRecoil(dt);
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
  updateFrameBudget(dt);

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
  // Bloom eases off outdoors, where there are no bright practicals to bleed.
  // The surface gets the grade; the shelter and the silo do not. Down there
  // the light comes out of fittings on the wall and the only honest thing to
  // do with it is leave it alone — run the split tone through a corridor and
  // the strip lights go orange while the concrete goes blue, which is a
  // different film entirely.
  const outdoors = currentWorld === 'outside';
  const daylight = outdoors ? (game.sky?.state.dayFactor ?? 0) : 0;
  const overcast = outdoors ? (game.sky?.state.cloud ?? 0) : 0;
  // Full strength in open sun, easing off after dark and under cloud, because
  // both of those take the gold key away and leave only the cold half — and a
  // split tone with one side missing is just a colour cast.
  const graded = daylight * (1 - overcast * 0.45);
  // Set, not damped. These follow dayFactor and cloud, which already move
  // slowly, so damping them only adds a lag that nothing asked for — and on a
  // slow renderer the lag never finishes converging, which quietly means the
  // grade you look at in a capture is not the grade the game applies.
  gradePass.uniforms.tone.value = outdoors ? 0.28 + graded * 0.38 : 0;
  gradePass.uniforms.contrast.value = outdoors ? 1.00 + graded * 0.04 : 1.025;
  gradePass.uniforms.saturation.value =
    outdoors ? 1.02 + graded * 0.16 : 0.96;
  // Outdoors the shadow floor is the sky, so it is blue and it is well off
  // zero; a corridor lit by its own fittings keeps the near-neutral one it
  // has always had. The vignette comes down out here too — half a stop of
  // corner falloff on top of a low sun was taking the edges of the frame out
  // entirely.
  gradePass.uniforms.lift.value.copy(outdoors ? _liftOutside : _liftInside);
  gradePass.uniforms.vignette.value = outdoors ? 0.17 : 0.44;
  // Aberration is a property of the lens, and it is fixed. Driven off a meter
  // that crept back up every frame it shifted every pixel by a fraction each
  // time, and the whole image crawled in concentric bands.
  // Exterior clarity is more important than a synthetic lens fringe. Even a
  // one-pixel RGB split made distant branches and roof lines read as blur.
  gradePass.uniforms.aberration.value = outdoors ? 0 : 0.00045;
  // The eye. Outdoors the surface says what it is stopped down to and the iris
  // walks there rather than jumping, so stepping out of the hatch at noon
  // opens on a bright frame that settles instead of a white one that stays.
  // The shelter and the silo are lit by their own fittings and want no
  // correction at all.
  const wantExposure = currentWorld === 'outside' ? (game.sky?.state.exposure ?? 1) : 1;
  exposure = THREE.MathUtils.damp(exposure, wantExposure, 1.9, dt);
  renderer.toneMappingExposure = exposure;
  // Bloom is for practicals — a strip light, a muzzle flash, the moon. Out in
  // daylight there is nothing to bleed and every bit of it lands on the sky,
  // so it comes down to a trace and only takes what is genuinely over white.
  bloomPass.strength = currentWorld === 'outside' ? 0.040 : 0.2;
  bloomPass.threshold = currentWorld === 'outside' ? 1.30 : 1.02;
  if (quality.post) composer.render();
  else renderer.render(scene, game.camera);
  // The optic goes over the finished frame, so the post stack grades the world
  // and not the inside of the tube.
  scopeOpen = THREE.MathUtils.damp(scopeOpen, scoped ? 1 : 0, 22, dt);
  if (scopeOpen > 0.002) renderScope(scene);
}

addEventListener('resize', () => {
  if (!renderer || !game) return;
  renderer.setSize(innerWidth, innerHeight);
  scopeTarget?.setSize(SCOPE_SIZE, SCOPE_SIZE);
  if (quality.post) composer?.setSize(innerWidth, innerHeight);
  feedComposer?.setSize(innerWidth, innerHeight);
  game.camera.aspect = innerWidth / innerHeight;
  game.camera.updateProjectionMatrix();
});
if (import.meta.env.DEV) void ensureGameReady();

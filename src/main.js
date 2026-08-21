import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { loadGameAssets } from './assets.js';
import { createGameWorld } from './world.js';

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
const timeEl = document.getElementById('timeStat');
const weatherEl = document.getElementById('weatherStat');
const useButton = document.getElementById('use');
const fireButton = document.getElementById('fire');
const reloadButton = document.getElementById('reload');
const sprintButton = document.getElementById('sprint');
const lightButton = document.getElementById('light');

let renderer, composer, renderPass, bloomPass, game;
let currentWorld = 'bunker';
let started = false;
let modal = false;
let cctv = false;
let currentCam = 0;
let yaw = 0;
let pitch = -0.03;
let armed = false;
let ammo = 5;
let reserve = 20;
let reloading = false;
let foodDays = 8;
let recoil = 0;
let flashlightOn = false;
let sprintHeld = false;
const velocity = new THREE.Vector3();
const clock = new THREE.Clock();
const keys = {};
const ray = new THREE.Raycaster();
let msgTimer = 0;
let environmentHudTimer = 0;
const gpPrev = new Array(20).fill(false);

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

function createRenderer() {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
    alpha: false,
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, coarse ? 1.6 : 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .84;
  renderer.domElement.style.zIndex = '0';
  document.body.insertBefore(renderer.domElement, document.body.firstChild);
}

async function prepare() {
  try {
    createRenderer();
    engineState.textContent = 'Meshopt ready. Loading integrated Blender world…';
    const assets = await loadGameAssets((label, step, total) => {
      engineState.textContent = `${label} — ${step}/${total}`;
    });

    game = createGameWorld(assets);
    game.camera.rotation.order = 'YXZ';

    composer = new EffectComposer(renderer);
    renderPass = new RenderPass(game.bunker, game.camera);
    bloomPass = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), .12, .28, 1.05);
    bloomPass.threshold = 1.05;
    bloomPass.strength = .12;
    bloomPass.radius = .28;
    composer.addPass(renderPass);
    composer.addPass(bloomPass);

    wireGameEvents();
    wireControls();
    engineState.textContent = '✓ Shelter 47 V5.2 ready — Blender room, weather and smart controls loaded.';
    backendEl.textContent = 'BLENDER V5.2 / DAY-NIGHT / WEATHER / SMART INTERACT';
    startButton.disabled = false;
    startButton.textContent = 'ENTER SHELTER';
    renderer.setAnimationLoop(loop);
  } catch (err) {
    console.error(err);
    engineState.innerHTML = `<span style="color:#ff9b88">ASSET LOAD FAILED: ${String(err?.message || err)}</span><br>Reload to retry the online Blender asset stream.`;
    startButton.disabled = false;
    startButton.textContent = 'RETRY ASSET LOAD';
    startButton.onclick = () => location.reload();
    renderer?.setAnimationLoop(() => renderer.clear());
  }
}

function wireGameEvents() {
  addEventListener('lostsignal:computer', () => openModal('computer'));
  addEventListener('lostsignal:radio', () => {
    openModal('radio');
    setRadioNoise(.2);
  });
  addEventListener('lostsignal:generator', () => flash('GENERATOR 61% LOAD // FUEL 73%'));
  addEventListener('lostsignal:vaultopen', () => flash('ARMORY UNLOCKED — USE AGAIN TO TAKE THE RIFLE'));
  addEventListener('lostsignal:takegun', () => {
    armed = true;
    game.setArmed(true);
    document.body.classList.add('armed');
    updateAmmo();
    flash('SURVIVAL RIFLE EQUIPPED', 2200);
    clickSound(360, .08, .05);
  });
  addEventListener('lostsignal:door', (e) =>
    flash(e.detail.open ? 'BLAST SEAL RELEASED — USE AGAIN TO EXIT' : 'BLAST SEAL LOCKED')
  );
  addEventListener('lostsignal:surface', (e) => {
    if (!e.detail.allowed) {
      flash('OPEN THE BLAST DOOR FIRST');
      return;
    }
    currentWorld = 'outside';
    game.setWorld('outside');
    yaw = Math.PI;
    pitch = -0.03;
    velocity.set(0, 0, 0);
    setOutdoorAudio(true);
    updateEnvironmentHud(true);
    flash('SURFACE COMPOUND — WEATHER SYSTEM ACTIVE', 2200);
  });
  addEventListener('lostsignal:return', () => {
    currentWorld = 'bunker';
    game.setWorld('bunker');
    yaw = 0;
    pitch = -0.02;
    velocity.set(0, 0, 0);
    setOutdoorAudio(false);
    flash('SHELTER 47 — BLAST CHAMBER');
  });
  addEventListener('lostsignal:cctv', openCCTV);

  document.querySelectorAll('.modal .x').forEach((button) => {
    button.onclick = () => {
      button.parentElement.classList.remove('open');
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
      text.innerHTML = `SIGNAL: STATIC<br>STRENGTH: 0${2 + Math.floor(Math.random() * 7)}%`;
      setRadioNoise(.20);
    }
  };
  document.getElementById('down').onclick = () => {
    freq = Math.max(88, freq - .05);
    updateRadio();
    clickSound(420);
  };
  document.getElementById('up').onclick = () => {
    freq = Math.min(118, freq + .05);
    updateRadio();
    clickSound(520);
  };
}

function openModal(id) {
  modal = true;
  document.exitPointerLock?.();
  document.getElementById(id).classList.add('open');
}

function nearestDownedAnimal() {
  if (currentWorld !== 'outside') return null;
  const forward = new THREE.Vector3(0, 0, -1).applyEuler(game.camera.rotation).normalize();
  let best = null;
  let bestD = 2.8;
  for (const w of game.wildlife) {
    if (w.userData.alive !== false || w.userData.harvested) continue;
    const d = w.position.distanceTo(game.player.position);
    if (d >= bestD) continue;
    const dir = w.position.clone().sub(game.player.position).normalize();
    if (forward.dot(dir) < -.05) continue;
    best = w;
    bestD = d;
  }
  return best;
}

function use() {
  if (!started || modal || cctv) return;
  const interaction = game.nearestInteraction(currentWorld);
  if (interaction) {
    clickSound(420, .04, .035);
    interaction.onUse();
    return;
  }
  const downed = nearestDownedAnimal();
  if (downed) {
    downed.userData.harvested = true;
    const gain = downed.userData.kind === 'deer' ? 3 : 1;
    foodDays += gain;
    foodEl.textContent = `${foodDays} DAYS`;
    game.outside.remove(downed);
    flash(`${downed.userData.kind.toUpperCase()} HARVESTED — +${gain} DAYS FOOD`, 2200);
  }
}

function fire() {
  if (!armed || reloading || modal || cctv) return;
  if (ammo <= 0) {
    reload();
    return;
  }
  ammo--;
  updateAmmo();
  game.playGun('shoot');
  gunshotSound();
  recoil = .18;

  if (currentWorld !== 'outside') {
    flash('THE SHOT ECHOES THROUGH THE SHELTER', 900);
    return;
  }

  ray.setFromCamera({ x: 0, y: 0 }, game.camera);
  ray.far = 90;
  const targets = [
    ...game.wildlife.filter((w) => w.parent && w.userData.alive !== false),
    ...game.zombies.filter((z) => z.parent && z.userData.alive !== false && z.visible !== false),
  ];
  const hits = ray.intersectObjects(targets, true);
  if (hits.length) {
    const hit = hits[0];
    let target = hit.object;
    while (target && !['deer', 'rabbit', 'zombie'].includes(target.userData.kind)) target = target.parent;
    if (target) {
      bloodBurst(hit.point);
      if (target.userData.kind === 'zombie') {
        const headshot = hit.point.y - target.position.y > 1.42;
        target.userData.hp -= headshot ? 2 : 1;
        if (target.userData.hp <= 0) {
          target.userData.alive = false;
          target.rotation.z = Math.PI / 2;
          flash(headshot ? 'HEADSHOT — INFECTED DOWN' : 'INFECTED DOWN', 1300);
        } else flash('INFECTED HIT', 700);
      } else {
        target.userData.alive = false;
        target.rotation.z = Math.PI / 2;
        flash(`${target.userData.kind.toUpperCase()} DOWN — APPROACH TO HARVEST`, 1700);
      }
    }
  }
  if (ammo === 0 && reserve > 0) setTimeout(reload, 450);
}

function reload() {
  if (reloading || ammo >= 5 || reserve <= 0 || !armed) return;
  reloading = true;
  reloadButton.textContent = '...';
  game.playGun('reload');
  flash('RELOADING…', 1200);
  clickSound(170, .1, .04);
  setTimeout(() => {
    const take = Math.min(5 - ammo, reserve);
    ammo += take;
    reserve -= take;
    reloading = false;
    reloadButton.textContent = 'RELOAD';
    updateAmmo();
    clickSound(310, .08, .04);
  }, 1200);
}

function updateAmmo() {
  ammoEl.textContent = `${ammo} / ${reserve}`;
}

function toggleFlashlight() {
  flashlightOn = !flashlightOn;
  game?.setFlashlight?.(flashlightOn);
  lightButton.classList.toggle('on', flashlightOn);
  lightButton.textContent = flashlightOn ? 'LIGHT ON' : 'LIGHT';
  clickSound(flashlightOn ? 620 : 340, .05, .028);
}

function contextAction(name = '') {
  const n = name.toUpperCase();
  if (n.includes('TAKE')) return 'TAKE';
  if (n.includes('EXIT')) return 'EXIT';
  if (n.includes('BLAST DOOR')) return 'OPEN';
  if (n.includes('GUN VAULT')) return 'OPEN';
  if (n.includes('CCTV')) return 'VIEW';
  if (n.includes('COMPUTER')) return 'ACCESS';
  if (n.includes('RADIO')) return 'TUNE';
  if (n.includes('GENERATOR')) return 'CHECK';
  if (n.includes('RETURN')) return 'ENTER';
  if (n.includes('HARVEST')) return 'HARVEST';
  return 'USE';
}

// CCTV PTZ
const camPan = [0, 0, 0, 0];
const camTilt = [0, 0, 0, 0];
const camFov = [48, 50, 48, 42];
const camNames = ['MAIN GATE', 'EAST FENCE / WOODLINE', 'SERVICE YARD', 'TOWER OVERVIEW'];

function openCCTV() {
  cctv = true;
  modal = true;
  document.exitPointerLock?.();
  document.getElementById('cctv').classList.add('open');
  setOutdoorAudio(true);
  switchCam(currentCam);
}
function closeCCTV() {
  cctv = false;
  modal = false;
  document.getElementById('cctv').classList.remove('open');
  if (currentWorld !== 'outside') setOutdoorAudio(false);
}
function switchCam(i) {
  currentCam = i;
  document.getElementById('camTitle').textContent = `CAM 0${i + 1} // ${camNames[i]}`;
  updatePTZ();
  clickSound(650, .035, .025);
}
function updatePTZ() {
  const pan = Math.round(camPan[currentCam] * 180 / Math.PI);
  const tilt = Math.round(camTilt[currentCam] * 180 / Math.PI);
  document.getElementById('ptzReadout').textContent = `PTZ ${pan >= 0 ? '+' : ''}${pan}° / ${tilt >= 0 ? '+' : ''}${tilt}°   ZOOM ${(50 / camFov[currentCam]).toFixed(1)}×`;
}
function zoom(delta) {
  camFov[currentCam] = Math.max(22, Math.min(70, camFov[currentCam] + delta));
  updatePTZ();
}
document.getElementById('exitCam').onclick = closeCCTV;
document.querySelectorAll('[data-c]').forEach((b) => (b.onclick = () => switchCam(+b.dataset.c)));
document.getElementById('zoomIn').onclick = () => zoom(-6);
document.getElementById('zoomOut').onclick = () => zoom(6);
document.getElementById('ptzReset').onclick = () => {
  camPan[currentCam] = 0;
  camTilt[currentCam] = 0;
  camFov[currentCam] = [48, 50, 48, 42][currentCam];
  updatePTZ();
};
const cctvFrame = document.querySelector('#cctv .frame');
let ptzId = null, ptzX = 0, ptzY = 0;
cctvFrame.addEventListener('pointerdown', (e) => {
  if (e.target.closest('button')) return;
  ptzId = e.pointerId;
  ptzX = e.clientX;
  ptzY = e.clientY;
  cctvFrame.setPointerCapture?.(ptzId);
});
cctvFrame.addEventListener('pointermove', (e) => {
  if (e.pointerId !== ptzId) return;
  const dx = e.clientX - ptzX;
  const dy = e.clientY - ptzY;
  ptzX = e.clientX;
  ptzY = e.clientY;
  camPan[currentCam] = Math.max(-1.35, Math.min(1.35, camPan[currentCam] - dx * .0033));
  camTilt[currentCam] = Math.max(-.7, Math.min(.6, camTilt[currentCam] - dy * .0028));
  updatePTZ();
});
cctvFrame.addEventListener('pointerup', () => (ptzId = null));

function wireControls() {
  addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'KeyE') use();
    if (e.code === 'KeyR') reload();
    if (e.code === 'KeyF') toggleFlashlight();
    if (e.code === 'Space') {
      e.preventDefault();
      fire();
    }
    if (e.code === 'Escape' && cctv) closeCCTV();
  });
  addEventListener('keyup', (e) => (keys[e.code] = false));

  renderer.domElement.addEventListener('click', () => {
    if (started && !coarse && !modal) renderer.domElement.requestPointerLock?.();
  });
  addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === renderer.domElement && !modal) {
      yaw -= e.movementX * .0022;
      pitch = Math.max(-1.25, Math.min(1.15, pitch - e.movementY * .0018));
    }
  });

  const move = { x: 0, y: 0 };
  const pad = document.getElementById('movePad');
  const nub = document.getElementById('moveNub');
  let moveId = null, cx = 0, cy = 0;
  pad.addEventListener('pointerdown', (e) => {
    moveId = e.pointerId;
    pad.setPointerCapture(moveId);
    const r = pad.getBoundingClientRect();
    cx = r.left + r.width / 2;
    cy = r.top + r.height / 2;
  });
  pad.addEventListener('pointermove', (e) => {
    if (e.pointerId !== moveId) return;
    let dx = e.clientX - cx;
    let dy = e.clientY - cy;
    const lim = 42;
    const len = Math.hypot(dx, dy) || 1;
    const s = Math.min(1, lim / len);
    dx *= s;
    dy *= s;
    move.x = Math.abs(dx) < 4 ? 0 : dx / lim;
    move.y = Math.abs(dy) < 4 ? 0 : dy / lim;
    nub.style.transform = `translate(${dx}px,${dy}px)`;
  });
  const clearPad = () => {
    moveId = null;
    move.x = move.y = 0;
    nub.style.transform = 'translate(0,0)';
  };
  pad.addEventListener('pointerup', clearPad);
  pad.addEventListener('pointercancel', clearPad);
  game.mobileMove = move;

  const look = document.getElementById('lookZone');
  let lookId = null, lx = 0, ly = 0;
  look.addEventListener('pointerdown', (e) => {
    lookId = e.pointerId;
    look.setPointerCapture(lookId);
    lx = e.clientX;
    ly = e.clientY;
  });
  look.addEventListener('pointermove', (e) => {
    if (e.pointerId !== lookId || modal) return;
    const dx = e.clientX - lx;
    const dy = e.clientY - ly;
    lx = e.clientX;
    ly = e.clientY;
    yaw -= dx * .00325;
    pitch = Math.max(-1.25, Math.min(1.15, pitch - dy * .00255));
  });
  const clearLook = () => (lookId = null);
  look.addEventListener('pointerup', clearLook);
  look.addEventListener('pointercancel', clearLook);

  useButton.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    use();
  });
  fireButton.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    fire();
  });
  reloadButton.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    reload();
  });
  lightButton.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFlashlight();
  });
  const sprintOn = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    sprintHeld = true;
    sprintButton.classList.add('held');
  };
  const sprintOff = () => {
    sprintHeld = false;
    sprintButton.classList.remove('held');
  };
  sprintButton.addEventListener('pointerdown', sprintOn);
  sprintButton.addEventListener('pointerup', sprintOff);
  sprintButton.addEventListener('pointercancel', sprintOff);
  sprintButton.addEventListener('pointerleave', (e) => {
    if (e.buttons === 0) sprintOff();
  });
}

function pollGamepad(dt) {
  const gp = navigator.getGamepads?.()[0];
  if (!gp) return { x: 0, y: 0, sprint: false };

  const dead = (v, d = .14) => (Math.abs(v) < d ? 0 : v);
  const lx = dead(gp.axes[0] || 0);
  const ly = dead(gp.axes[1] || 0);
  const rx = dead(gp.axes[2] || 0, .12);
  const ry = dead(gp.axes[3] || 0, .12);
  if (!modal) {
    yaw -= rx * 2.15 * dt;
    pitch = Math.max(-1.25, Math.min(1.15, pitch - ry * 1.75 * dt));
  }

  const pressed = (i) => !!gp.buttons[i]?.pressed;
  const edge = (i) => {
    const now = pressed(i);
    const hit = now && !gpPrev[i];
    gpPrev[i] = now;
    return hit;
  };
  if (edge(0)) use();
  if (edge(2)) reload();
  if (edge(3)) toggleFlashlight();
  if (edge(5) || edge(7)) fire();

  return { x: lx, y: ly, sprint: pressed(10) || pressed(4) };
}

function updatePlayer(dt) {
  if (!started || modal) return;
  const gp = pollGamepad(dt);
  game.camera.rotation.y = yaw;
  game.camera.rotation.x = pitch;

  let x = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0) + (game.mobileMove?.x || 0) + gp.x;
  let f = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0) - (game.mobileMove?.y || 0) - gp.y;
  const len = Math.hypot(x, f);
  if (len > 1) {
    x /= len;
    f /= len;
  }

  const fw = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
  const rt = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
  const sprinting = sprintHeld || keys.ShiftLeft || keys.ShiftRight || gp.sprint;
  const baseSpeed = currentWorld === 'outside' ? 3.25 : 2.7;
  const speed = baseSpeed * (sprinting ? 1.48 : 1);
  const target = fw.multiplyScalar(f * speed).add(rt.multiplyScalar(x * speed));

  velocity.x = THREE.MathUtils.damp(velocity.x, target.x, sprinting ? 9 : 12, dt);
  velocity.z = THREE.MathUtils.damp(velocity.z, target.z, sprinting ? 9 : 12, dt);

  let next = game.player.position.clone();
  next.x += velocity.x * dt;
  if (!game.blocked(currentWorld, next.x, next.z)) game.player.position.x = next.x;
  next = game.player.position.clone();
  next.z += velocity.z * dt;
  if (!game.blocked(currentWorld, next.x, next.z)) game.player.position.z = next.z;

  const moving = Math.abs(velocity.x) + Math.abs(velocity.z) > .25;
  const bobSpeed = sprinting ? 13 : 10;
  const bobAmount = sprinting ? .022 : .014;
  game.camera.position.y = 1.67 + (moving ? Math.sin(clock.elapsedTime * bobSpeed) * bobAmount : 0);
}

function updatePrompt() {
  if (!started || modal || cctv) {
    promptEl.classList.remove('on');
    useButton.classList.remove('targeted');
    useButton.textContent = 'USE';
    return;
  }

  const interaction = game.nearestInteraction(currentWorld);
  if (interaction) {
    const action = contextAction(interaction.name);
    promptEl.textContent = `${coarse ? action : '[ E ]'}  ${interaction.name}`;
    promptEl.classList.add('on');
    useButton.textContent = action;
    useButton.classList.add('targeted');
    return;
  }

  const animal = nearestDownedAnimal();
  if (animal) {
    promptEl.textContent = `${coarse ? 'HARVEST' : '[ E ]'}  HARVEST ${animal.userData.kind.toUpperCase()}`;
    promptEl.classList.add('on');
    useButton.textContent = 'HARVEST';
    useButton.classList.add('targeted');
    return;
  }

  promptEl.classList.remove('on');
  useButton.classList.remove('targeted');
  useButton.textContent = 'USE';
}

function updateEnvironmentHud(force = false) {
  if (!game?.getEnvironmentStatus) return;
  if (!force && environmentHudTimer < .18) return;
  environmentHudTimer = 0;
  const status = game.getEnvironmentStatus();
  const h = Math.floor(status.timeHours) % 24;
  const m = Math.floor((status.timeHours - Math.floor(status.timeHours)) * 60);
  timeEl.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  weatherEl.textContent = status.weather;
  weatherEl.className = status.weather === 'CLEAR' ? 'ok' : 'warn';
}

// Audio
let ac = null, master = null, radioGain = null, outdoorGain = null;
function noiseBuffer(seconds = 2) {
  const b = ac.createBuffer(1, ac.sampleRate * seconds, ac.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}
function startAudio() {
  if (ac) {
    ac.resume?.();
    return;
  }
  ac = new (window.AudioContext || window.webkitAudioContext)();
  master = ac.createGain();
  master.gain.value = .3;
  master.connect(ac.destination);
  [47, 94, 141].forEach((freq, i) => {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = i ? 'sine' : 'triangle';
    o.frequency.value = freq;
    g.gain.value = [.09, .03, .01][i];
    o.connect(g);
    g.connect(master);
    o.start();
  });
  const rn = ac.createBufferSource();
  rn.buffer = noiseBuffer();
  rn.loop = true;
  const rf = ac.createBiquadFilter();
  rf.type = 'bandpass';
  rf.frequency.value = 1800;
  radioGain = ac.createGain();
  radioGain.gain.value = 0;
  rn.connect(rf);
  rf.connect(radioGain);
  radioGain.connect(master);
  rn.start();

  const on = ac.createBufferSource();
  on.buffer = noiseBuffer(3);
  on.loop = true;
  const of = ac.createBiquadFilter();
  of.type = 'lowpass';
  of.frequency.value = 900;
  outdoorGain = ac.createGain();
  outdoorGain.gain.value = 0;
  on.connect(of);
  of.connect(outdoorGain);
  outdoorGain.connect(master);
  on.start();
}
function setRadioNoise(v) {
  if (radioGain && ac) radioGain.gain.setTargetAtTime(v, ac.currentTime, .04);
}
function setOutdoorAudio(on) {
  if (outdoorGain && ac) outdoorGain.gain.setTargetAtTime(on ? .05 : 0, ac.currentTime, .15);
}
function clickSound(freq = 500, d = .05, vol = .04) {
  if (!ac) return;
  const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
  o.frequency.value = freq;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(.001, t + d);
  o.connect(g);
  g.connect(master);
  o.start(t);
  o.stop(t + d + .01);
}
function beacon() {
  clickSound(760, .25, .035);
}
function gunshotSound() {
  if (!ac) return;
  const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(180, t);
  o.frequency.exponentialRampToValueAtTime(50, t + .1);
  g.gain.setValueAtTime(.28, t);
  g.gain.exponentialRampToValueAtTime(.001, t + .17);
  o.connect(g);
  g.connect(master);
  o.start(t);
  o.stop(t + .18);
}
function bloodBurst(point) {
  const g = new THREE.SphereGeometry(.05, 8, 6);
  const m = new THREE.MeshBasicMaterial({ color: 0x771714 });
  for (let i = 0; i < 7; i++) {
    const p = new THREE.Mesh(g, m);
    p.position.copy(point).add(new THREE.Vector3((Math.random() - .5) * .25, (Math.random() - .5) * .25, (Math.random() - .5) * .25));
    game.outside.add(p);
    setTimeout(() => game.outside.remove(p), 450);
  }
}

startButton.onclick = async () => {
  if (!game) {
    location.reload();
    return;
  }
  startAudio();
  try {
    if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
    }
    if (screen.orientation?.lock) await screen.orientation.lock('landscape').catch(() => {});
  } catch {}
  started = true;
  document.body.classList.add('playing');
  boot.style.display = 'none';
  updateOrientation();
  updateEnvironmentHud(true);
  setTimeout(() => {
    renderer.setSize(innerWidth, innerHeight);
    composer.setSize(innerWidth, innerHeight);
    game.camera.aspect = innerWidth / innerHeight;
    game.camera.updateProjectionMatrix();
  }, 160);
  if (!coarse) renderer.domElement.requestPointerLock?.();
  flash('SHELTER 47 // V5.2 ONLINE', 2200);
};

function loop() {
  const dt = Math.min(clock.getDelta(), .05);
  if (!game) return;

  environmentHudTimer += dt;
  updatePlayer(dt);
  updatePrompt();
  game.update(dt, currentWorld, game.player.position);
  updateEnvironmentHud();

  const targetExposure = game.getExposure?.(currentWorld) ?? .88;
  renderer.toneMappingExposure = THREE.MathUtils.damp(renderer.toneMappingExposure, targetExposure, 4.5, dt);

  recoil = THREE.MathUtils.damp(recoil, 0, 13, dt);
  if (armed) {
    game.weaponView.position.y = -.46 + Math.sin(clock.elapsedTime * 1.8) * .005 + recoil * .07;
    game.weaponView.position.z = -.55 + recoil * .13;
  }

  if (cctv) {
    const cam = game.cctvCameras[currentCam];
    cam.rotation.copy(game.cctvBaseRot[currentCam]);
    cam.rotation.y += camPan[currentCam];
    cam.rotation.x += camTilt[currentCam];
    cam.fov = camFov[currentCam];
    cam.aspect = innerWidth / innerHeight;
    cam.updateProjectionMatrix();
    renderer.render(game.outside, cam);
  } else {
    const scene = currentWorld === 'outside' ? game.outside : game.bunker;
    renderPass.scene = scene;
    renderPass.camera = game.camera;
    composer.render();
  }
}

addEventListener('resize', () => {
  if (!renderer || !game) return;
  renderer.setSize(innerWidth, innerHeight);
  composer?.setSize(innerWidth, innerHeight);
  game.camera.aspect = innerWidth / innerHeight;
  game.camera.updateProjectionMatrix();
});

prepare().catch(fail);

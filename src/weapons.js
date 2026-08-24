// The armoury's twenty-five supplied models, as things you can actually pick
// up and shoot.
//
// This file is deliberately data only — no THREE, no WebAudio — so the whole
// catalogue is verifiable from `npm run qa:unit` without a browser. The scene
// code reads `view` to hang a model off the camera, the shooting code reads
// the ballistics, and the audio code renders `audio` with oscillators and
// filtered noise. Nothing here streams a sample: the shelter ships no audio
// assets, and twenty-two distinct voices are cheaper to synthesise than to
// download.

// One reload is a sequence of mechanical transients. Each step is a short
// band-passed noise burst at `hz`, optionally with a tonal click, placed `at`
// seconds into the animation — which is what makes a revolver's cylinder read
// differently from a rifle's magazine even though both are "a reload".
const step = (at, hz, level = 0.5, decay = 0.05, q = 2.2, tone = 0) =>
  ({ at, hz, level, decay, q, tone });

// Magazine-fed: catch, magazine out, magazine seated, bolt released.
const magazineReload = (pitch = 1, length = 2.1) => [
  step(0.00, 1500 * pitch, 0.34, 0.035, 3.0, 900 * pitch),
  step(0.22 * length, 620 * pitch, 0.30, 0.10, 1.4),
  step(0.55 * length, 900 * pitch, 0.52, 0.09, 1.8, 320 * pitch),
  step(0.84 * length, 2200 * pitch, 0.46, 0.05, 3.4, 1400 * pitch),
];

// Shell-by-shell, then the action is worked closed.
const pumpReload = (pitch = 1, shells = 4, length = 3.0) => {
  const sequence = [];
  for (let i = 0; i < shells; i++) {
    sequence.push(step((0.06 + (i * 0.62) / shells) * length, 780 * pitch,
      0.34, 0.07, 1.9, 260 * pitch));
  }
  sequence.push(step(0.80 * length, 1250 * pitch, 0.5, 0.07, 2.2, 420 * pitch));
  sequence.push(step(0.92 * length, 1650 * pitch, 0.54, 0.06, 2.6, 300 * pitch));
  return sequence;
};

// Bolt up, bolt back, charger, bolt forward, bolt down.
const boltReload = (pitch = 1, length = 2.8) => [
  step(0.00, 1750 * pitch, 0.40, 0.045, 3.2, 780 * pitch),
  step(0.16 * length, 1100 * pitch, 0.34, 0.09, 1.6),
  step(0.42 * length, 700 * pitch, 0.30, 0.11, 1.5, 240 * pitch),
  step(0.72 * length, 1200 * pitch, 0.40, 0.08, 1.8),
  step(0.90 * length, 1950 * pitch, 0.46, 0.05, 3.4, 860 * pitch),
];

// Latch, crane out, ejector rod, rounds dropped in, crane shut.
const cylinderReload = (pitch = 1, length = 2.6) => [
  step(0.00, 2100 * pitch, 0.32, 0.035, 3.6, 1150 * pitch),
  step(0.14 * length, 520 * pitch, 0.26, 0.13, 1.2),
  step(0.34 * length, 1400 * pitch, 0.38, 0.07, 2.4, 640 * pitch),
  step(0.56 * length, 860 * pitch, 0.30, 0.10, 1.7),
  step(0.72 * length, 980 * pitch, 0.32, 0.09, 1.9),
  step(0.90 * length, 1750 * pitch, 0.50, 0.05, 3.0, 520 * pitch),
];

// The blade is not reloaded; the sound of it is the sheath.
const sheathReload = () => [
  step(0.00, 3200, 0.26, 0.14, 1.1),
  step(0.30, 2400, 0.22, 0.10, 1.3),
];

/**
 * A firing voice: a low body sweep for the muzzle blast, a band-passed crack
 * for the report, and a lowpassed tail for the room. Every weapon gets its own
 * numbers, so no two of them sound the same when you stand in the same corridor
 * and fire them one after another.
 */
const voice = ({ level, bodyHz, bodyEndHz, bodyDecay, crackHz, crackQ, crackDecay,
  tailHz, tailDecay, tailLevel }) => ({
  level, bodyHz, bodyEndHz, bodyDecay, crackHz, crackQ, crackDecay,
  tailHz, tailDecay, tailLevel,
});

const RIFLE_VOICE = (pitch = 1, level = 0.5) => voice({
  level,
  bodyHz: 210 * pitch, bodyEndHz: 52 * pitch, bodyDecay: 0.13,
  crackHz: 2600 * pitch, crackQ: 1.0, crackDecay: 0.075,
  tailHz: 1100 * pitch, tailDecay: 0.34, tailLevel: 0.30,
});

const SMG_VOICE = (pitch = 1, level = 0.4) => voice({
  level,
  bodyHz: 260 * pitch, bodyEndHz: 84 * pitch, bodyDecay: 0.07,
  crackHz: 3200 * pitch, crackQ: 1.5, crackDecay: 0.045,
  tailHz: 1500 * pitch, tailDecay: 0.18, tailLevel: 0.20,
});

const SHOTGUN_VOICE = (pitch = 1, level = 0.62) => voice({
  level,
  bodyHz: 150 * pitch, bodyEndHz: 34 * pitch, bodyDecay: 0.22,
  crackHz: 1500 * pitch, crackQ: 0.6, crackDecay: 0.14,
  tailHz: 700 * pitch, tailDecay: 0.55, tailLevel: 0.42,
});

const SNIPER_VOICE = (pitch = 1, level = 0.7) => voice({
  level,
  bodyHz: 175 * pitch, bodyEndHz: 40 * pitch, bodyDecay: 0.18,
  crackHz: 3600 * pitch, crackQ: 0.8, crackDecay: 0.10,
  tailHz: 820 * pitch, tailDecay: 0.85, tailLevel: 0.5,
});

const PISTOL_VOICE = (pitch = 1, level = 0.44) => voice({
  level,
  bodyHz: 300 * pitch, bodyEndHz: 96 * pitch, bodyDecay: 0.08,
  crackHz: 2900 * pitch, crackQ: 1.3, crackDecay: 0.055,
  tailHz: 1300 * pitch, tailDecay: 0.24, tailLevel: 0.24,
});

const REVOLVER_VOICE = (pitch = 1, level = 0.6) => voice({
  level,
  bodyHz: 190 * pitch, bodyEndHz: 46 * pitch, bodyDecay: 0.16,
  crackHz: 2100 * pitch, crackQ: 0.8, crackDecay: 0.11,
  tailHz: 900 * pitch, tailDecay: 0.62, tailLevel: 0.44,
});

const BLADE_VOICE = () => voice({
  level: 0.3,
  bodyHz: 520, bodyEndHz: 180, bodyDecay: 0.05,
  crackHz: 4200, crackQ: 2.6, crackDecay: 0.09,
  tailHz: 2600, tailDecay: 0.16, tailLevel: 0.14,
});

// `view` is how the model hangs off the camera: scale, then a small local
// offset. The scene code measures which way each model lies and turns its long
// axis onto the firing line; `flip` is for the handful that then point the
// wrong way down it.
const view = (scale, x = 0, y = 0, z = 0, flip = false) =>
  ({ scale, offset: [x, y, z], flip });

/**
 * The catalogue. `key` matches the asset key in assets.js and the rack slot in
 * armory.js, so a weapon added in one place is impossible to forget in the
 * others — qa/unit.mjs cross-checks all three lists.
 */
export const WEAPONS = {
  // --- Assault rifles ------------------------------------------------------
  armoryAssault01: {
    name: 'SERVICE RIFLE', family: 'rifle', kind: 'firearm', automatic: true,
    magazine: 30, reserve: 90, damage: 34, headshot: 2.6, rpm: 700,
    reloadTime: 2.1, spread: 0.011, adsSpread: 0.0035, range: 90, recoil: 0.18,
    view: view(0.16, -0.04, -0.08, 0),
    audio: { fire: RIFLE_VOICE(1.00), reload: magazineReload(1.00, 2.1) },
  },
  armoryAssault02: {
    name: 'CARBINE MK2', family: 'rifle', kind: 'firearm', automatic: true,
    magazine: 30, reserve: 120, damage: 29, headshot: 2.6, rpm: 820,
    reloadTime: 1.95, spread: 0.013, adsSpread: 0.004, range: 80, recoil: 0.15,
    view: view(0.155, -0.03, -0.075, 0),
    audio: { fire: RIFLE_VOICE(1.14, 0.46), reload: magazineReload(1.12, 1.95) },
  },
  armoryAssault03: {
    name: 'HEAVY RIFLE', family: 'rifle', kind: 'firearm', automatic: true,
    magazine: 20, reserve: 80, damage: 44, headshot: 2.5, rpm: 580,
    reloadTime: 2.45, spread: 0.014, adsSpread: 0.0045, range: 100, recoil: 0.26,
    view: view(0.17, -0.05, -0.085, 0),
    audio: { fire: RIFLE_VOICE(0.82, 0.58), reload: magazineReload(0.86, 2.45) },
  },
  armoryBullpup: {
    name: 'BULLPUP RIFLE', family: 'rifle', kind: 'firearm', automatic: true,
    magazine: 32, reserve: 128, damage: 31, headshot: 2.6, rpm: 780,
    reloadTime: 1.85, spread: 0.010, adsSpread: 0.003, range: 88, recoil: 0.16,
    view: view(0.16, -0.02, -0.08, 0),
    audio: { fire: RIFLE_VOICE(1.07, 0.48), reload: magazineReload(1.22, 1.85) },
  },

  armoryAkm: {
    name: 'AKM', family: 'rifle', kind: 'firearm', automatic: true,
    magazine: 30, reserve: 120, damage: 38, headshot: 2.5, rpm: 600,
    reloadTime: 2.3, spread: 0.016, adsSpread: 0.0055, range: 85, recoil: 0.24,
    view: view(0.155, -0.03, -0.08, 0),
    audio: { fire: RIFLE_VOICE(0.90, 0.56), reload: magazineReload(0.94, 2.3) },
  },

  // --- Shotguns ------------------------------------------------------------
  armoryShotgun01: {
    name: 'COMBAT SHOTGUN', family: 'shotgun', kind: 'firearm', automatic: false,
    magazine: 8, reserve: 32, damage: 17, headshot: 1.5, rpm: 95, pellets: 8,
    reloadTime: 3.0, spread: 0.055, adsSpread: 0.038, range: 34, recoil: 0.42,
    view: view(0.165, -0.04, -0.085, 0),
    audio: { fire: SHOTGUN_VOICE(1.00), reload: pumpReload(1.00, 4, 3.0) },
  },
  armoryShotgun02: {
    name: 'RIOT SHOTGUN', family: 'shotgun', kind: 'firearm', automatic: false,
    magazine: 6, reserve: 30, damage: 16, headshot: 1.5, rpm: 80, pellets: 9,
    reloadTime: 2.8, spread: 0.062, adsSpread: 0.044, range: 30, recoil: 0.45,
    view: view(0.165, -0.04, -0.085, 0),
    audio: { fire: SHOTGUN_VOICE(0.92, 0.66), reload: pumpReload(0.9, 3, 2.8) },
  },
  armoryShotgunShort: {
    name: 'SHORT-STOCK SHOTGUN', family: 'shotgun', kind: 'firearm', automatic: false,
    magazine: 5, reserve: 25, damage: 18, headshot: 1.5, rpm: 105, pellets: 9,
    reloadTime: 2.6, spread: 0.070, adsSpread: 0.052, range: 26, recoil: 0.48,
    view: view(0.175, -0.02, -0.08, 0),
    audio: { fire: SHOTGUN_VOICE(1.10, 0.60), reload: pumpReload(1.15, 3, 2.6) },
  },
  armoryShotgunSawed: {
    name: 'SAWED-OFF SHOTGUN', family: 'shotgun', kind: 'firearm', automatic: false,
    magazine: 2, reserve: 20, damage: 15, headshot: 1.4, rpm: 160, pellets: 12,
    reloadTime: 2.2, spread: 0.098, adsSpread: 0.080, range: 18, recoil: 0.55,
    view: view(0.20, 0.02, -0.07, 0),
    audio: { fire: SHOTGUN_VOICE(1.22, 0.68), reload: pumpReload(1.3, 2, 2.2) },
  },

  armoryMossberg: {
    name: 'MOSSBERG 590A1', family: 'shotgun', kind: 'firearm', automatic: false,
    magazine: 9, reserve: 36, damage: 17, headshot: 1.5, rpm: 88, pellets: 8,
    reloadTime: 3.2, spread: 0.058, adsSpread: 0.040, range: 32, recoil: 0.44,
    view: view(0.15, -0.03, -0.08, 0),
    audio: { fire: SHOTGUN_VOICE(0.86, 0.70), reload: pumpReload(0.82, 5, 3.2) },
  },

  // --- Precision rifles ----------------------------------------------------
  armorySniper01: {
    name: 'MARKSMAN RIFLE', family: 'sniper', kind: 'firearm', automatic: false,
    magazine: 10, reserve: 40, damage: 72, headshot: 3.0, rpm: 210,
    reloadTime: 2.5, spread: 0.010, adsSpread: 0.0012, range: 160, recoil: 0.34,
    zoom: 34, view: view(0.16, -0.05, -0.085, 0),
    audio: { fire: SNIPER_VOICE(1.00), reload: magazineReload(0.9, 2.5) },
  },
  armorySniper02: {
    name: 'BOLT-ACTION RIFLE', family: 'sniper', kind: 'firearm', automatic: false,
    magazine: 5, reserve: 30, damage: 115, headshot: 3.2, rpm: 45,
    reloadTime: 2.9, spread: 0.012, adsSpread: 0.0009, range: 190, recoil: 0.5,
    zoom: 26, view: view(0.165, -0.05, -0.09, 0),
    audio: { fire: SNIPER_VOICE(0.86, 0.76), reload: boltReload(0.9, 2.9) },
  },
  armorySniper03: {
    name: 'SCOUT RIFLE', family: 'sniper', kind: 'firearm', automatic: false,
    magazine: 8, reserve: 32, damage: 80, headshot: 3.0, rpm: 180,
    reloadTime: 2.4, spread: 0.011, adsSpread: 0.0014, range: 150, recoil: 0.36,
    zoom: 32, view: view(0.16, -0.04, -0.085, 0),
    audio: { fire: SNIPER_VOICE(1.12, 0.68), reload: magazineReload(1.05, 2.4) },
  },
  armorySniper04: {
    name: 'ANTI-MATERIEL RIFLE', family: 'sniper', kind: 'firearm', automatic: false,
    magazine: 5, reserve: 20, damage: 165, headshot: 2.6, rpm: 38,
    reloadTime: 3.4, spread: 0.014, adsSpread: 0.0011, range: 220, recoil: 0.7,
    zoom: 22, view: view(0.175, -0.06, -0.095, 0),
    audio: { fire: SNIPER_VOICE(0.66, 0.84), reload: boltReload(0.72, 3.4) },
  },

  // --- Submachine guns -----------------------------------------------------
  armorySmg01: {
    name: 'COMPACT SMG', family: 'smg', kind: 'firearm', automatic: true,
    magazine: 32, reserve: 160, damage: 21, headshot: 2.2, rpm: 900,
    reloadTime: 1.7, spread: 0.017, adsSpread: 0.007, range: 55, recoil: 0.11,
    view: view(0.18, -0.01, -0.075, 0),
    audio: { fire: SMG_VOICE(1.00), reload: magazineReload(1.25, 1.7) },
  },
  armorySmg02: {
    name: 'SUPPRESSED SMG', family: 'smg', kind: 'firearm', automatic: true,
    magazine: 30, reserve: 150, damage: 19, headshot: 2.2, rpm: 950,
    reloadTime: 1.75, spread: 0.015, adsSpread: 0.006, range: 50, recoil: 0.09,
    quiet: true, view: view(0.18, -0.02, -0.075, 0),
    audio: {
      // A can does not silence a gun, it removes the crack and shortens the
      // room. The mechanism is then the loudest part of the shot.
      fire: voice({
        level: 0.26,
        bodyHz: 340, bodyEndHz: 130, bodyDecay: 0.05,
        crackHz: 1200, crackQ: 2.4, crackDecay: 0.035,
        tailHz: 620, tailDecay: 0.10, tailLevel: 0.12,
      }),
      reload: magazineReload(1.32, 1.75),
    },
  },

  // --- Sidearms ------------------------------------------------------------
  armoryPistol01: {
    name: 'SIDEARM 9MM', family: 'pistol', kind: 'firearm', automatic: false,
    magazine: 15, reserve: 60, damage: 26, headshot: 2.4, rpm: 380,
    reloadTime: 1.55, spread: 0.016, adsSpread: 0.006, range: 45, recoil: 0.14,
    view: view(0.19, 0.02, -0.05, 0),
    audio: { fire: PISTOL_VOICE(1.00), reload: magazineReload(1.4, 1.55) },
  },
  armoryPistol02: {
    name: 'COMPACT PISTOL', family: 'pistol', kind: 'firearm', automatic: false,
    magazine: 12, reserve: 48, damage: 24, headshot: 2.4, rpm: 420,
    reloadTime: 1.45, spread: 0.019, adsSpread: 0.008, range: 38, recoil: 0.13,
    view: view(0.20, 0.03, -0.05, 0),
    audio: { fire: PISTOL_VOICE(1.16, 0.40), reload: magazineReload(1.52, 1.45) },
  },
  armoryPistol03: {
    name: 'SERVICE PISTOL', family: 'pistol', kind: 'firearm', automatic: false,
    magazine: 17, reserve: 68, damage: 27, headshot: 2.4, rpm: 360,
    reloadTime: 1.6, spread: 0.015, adsSpread: 0.0055, range: 48, recoil: 0.15,
    view: view(0.19, 0.02, -0.05, 0),
    audio: { fire: PISTOL_VOICE(0.92, 0.46), reload: magazineReload(1.3, 1.6) },
  },
  armoryPistol04: {
    name: 'HEAVY PISTOL', family: 'pistol', kind: 'firearm', automatic: false,
    magazine: 8, reserve: 40, damage: 48, headshot: 2.5, rpm: 260,
    reloadTime: 1.8, spread: 0.021, adsSpread: 0.008, range: 52, recoil: 0.3,
    view: view(0.20, 0.02, -0.05, 0),
    audio: { fire: PISTOL_VOICE(0.74, 0.56), reload: magazineReload(1.1, 1.8) },
  },

  armoryGlock: {
    name: 'GLOCK 19', family: 'pistol', kind: 'firearm', automatic: false,
    magazine: 15, reserve: 75, damage: 25, headshot: 2.4, rpm: 440,
    reloadTime: 1.4, spread: 0.017, adsSpread: 0.0058, range: 42, recoil: 0.12,
    view: view(0.205, 0.02, -0.05, 0),
    audio: { fire: PISTOL_VOICE(1.08, 0.42), reload: magazineReload(1.46, 1.4) },
  },

  // --- Revolvers -----------------------------------------------------------
  armoryRevolver01: {
    name: '.357 REVOLVER', family: 'revolver', kind: 'firearm', automatic: false,
    magazine: 6, reserve: 36, damage: 60, headshot: 2.6, rpm: 200,
    reloadTime: 2.6, spread: 0.018, adsSpread: 0.006, range: 60, recoil: 0.34,
    view: view(0.20, 0.02, -0.05, 0),
    audio: { fire: REVOLVER_VOICE(1.00), reload: cylinderReload(1.00, 2.6) },
  },
  armoryRevolver02: {
    name: 'SNUB REVOLVER', family: 'revolver', kind: 'firearm', automatic: false,
    magazine: 5, reserve: 30, damage: 52, headshot: 2.6, rpm: 230,
    reloadTime: 2.4, spread: 0.025, adsSpread: 0.010, range: 34, recoil: 0.32,
    view: view(0.21, 0.03, -0.05, 0),
    audio: { fire: REVOLVER_VOICE(1.18, 0.54), reload: cylinderReload(1.2, 2.4) },
  },
  armoryRevolver03: {
    name: '.44 REVOLVER', family: 'revolver', kind: 'firearm', automatic: false,
    magazine: 6, reserve: 30, damage: 76, headshot: 2.7, rpm: 165,
    reloadTime: 2.8, spread: 0.020, adsSpread: 0.0065, range: 68, recoil: 0.44,
    view: view(0.205, 0.02, -0.052, 0),
    audio: { fire: REVOLVER_VOICE(0.82, 0.66), reload: cylinderReload(0.86, 2.8) },
  },

  // --- Blade ---------------------------------------------------------------
  armoryBayonet: {
    name: 'BAYONET', family: 'blade', kind: 'melee',
    automatic: false, magazine: 0, reserve: 0, damage: 68, headshot: 1.8,
    rpm: 140, reloadTime: 0.45, reach: 2.05, recoil: 0.12,
    view: view(0.30, 0.06, -0.10, 0.06),
    audio: { fire: BLADE_VOICE(), reload: sheathReload() },
  },

  armoryCombatKnife: {
    name: 'COMBAT KNIFE', family: 'blade', kind: 'melee',
    automatic: false, magazine: 0, reserve: 0, damage: 74, headshot: 1.9,
    rpm: 165, reloadTime: 0.4, reach: 2.2, recoil: 0.14,
    view: view(0.30, 0.05, -0.09, 0.05),
    audio: {
      fire: voice({
        level: 0.32,
        bodyHz: 460, bodyEndHz: 150, bodyDecay: 0.055,
        crackHz: 3700, crackQ: 2.2, crackDecay: 0.10,
        tailHz: 2300, tailDecay: 0.19, tailLevel: 0.16,
      }),
      reload: [step(0.00, 2900, 0.28, 0.15, 1.2), step(0.26, 2100, 0.24, 0.11, 1.4)],
    },
  },

  // --- Bench attachments ---------------------------------------------------
  // Racked with the rest of the collection and worth reading the plate on, but
  // there is nothing to fire: taking one would leave the player holding a
  // tripod in a firefight.
  armoryScope: { name: 'RIFLE OPTIC', family: 'attachment', kind: 'attachment' },
  armoryBipod: { name: 'BIPOD', family: 'attachment', kind: 'attachment' },
  armoryTripod: { name: 'TRIPOD MOUNT', family: 'attachment', kind: 'attachment' },
};

/**
 * Where the weapon sits while the player is aiming down it. A rifle comes back
 * into the shoulder; a handgun is pushed out to arm's length in front of the
 * face. One pose for every weapon put the revolver low and off to the right
 * with the sights nowhere near the crosshair.
 */
const AIM_POSE = {
  rifle: [0.03, -0.13, -0.64],
  smg: [0.03, -0.12, -0.60],
  shotgun: [0.03, -0.14, -0.66],
  sniper: [0.02, -0.12, -0.62],
  pistol: [0.01, -0.16, -0.50],
  revolver: [0.01, -0.16, -0.52],
  blade: [0.18, -0.28, -0.58],
};

export const aimPose = (weapon) => AIM_POSE[weapon?.family] || AIM_POSE.rifle;

/** Everything you can actually hold and use. */
export const USABLE_WEAPON_KEYS = Object.keys(WEAPONS)
  .filter((key) => WEAPONS[key].kind !== 'attachment');

export const DEFAULT_WEAPON = 'armoryAssault01';

export const isUsable = (key) => !!WEAPONS[key] && WEAPONS[key].kind !== 'attachment';

/** Seconds between shots, from the catalogue's rounds per minute. */
export const shotInterval = (weapon) => 60 / Math.max(1, weapon?.rpm ?? 600);

/**
 * The per-weapon ammunition the player is carrying. Swapping to a revolver and
 * back must not silently refill the rifle, and every weapon has to remember the
 * rounds already spent out of it.
 */
export function createLoadout() {
  const state = new Map();
  return {
    /** The magazine/reserve pair for a weapon, created full on first sight. */
    for(key) {
      if (!state.has(key)) {
        const weapon = WEAPONS[key];
        state.set(key, {
          magazine: weapon?.magazine ?? 0,
          reserve: weapon?.reserve ?? 0,
        });
      }
      return state.get(key);
    },
    /** Refill everything — a fresh run, or the quartermaster resupplying. */
    resupply(key) {
      const weapon = WEAPONS[key];
      if (!weapon) return;
      state.set(key, { magazine: weapon.magazine ?? 0, reserve: weapon.reserve ?? 0 });
    },
    /** Persisted as a plain object so a run survives a reload. */
    snapshot() {
      return Object.fromEntries([...state].map(([key, ammo]) => [key, { ...ammo }]));
    },
    restore(data) {
      if (!data) return;
      for (const [key, ammo] of Object.entries(data)) {
        if (!WEAPONS[key] || !ammo) continue;
        state.set(key, {
          magazine: Math.max(0, Math.min(WEAPONS[key].magazine ?? 0, ammo.magazine | 0)),
          reserve: Math.max(0, ammo.reserve | 0),
        });
      }
    },
  };
}

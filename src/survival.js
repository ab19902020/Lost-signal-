// The shelter's life support.
//
// POWER, WATER, AIR and FOOD were fixed numbers painted on the HUD. They now
// drain on a clock, which is what turns the generator, the filtration unit and
// the water tank from scenery into a maintenance round the player has to walk.

export const DAY_SECONDS = 240;

const START = {
  day: 1,
  power: 87,
  air: 71,
  water: 19,
  food: 8,
  fuel: 6,
  filters: 4,
};

export class Survival {
  constructor(state = {}) {
    Object.assign(this, START, state);
    this.elapsed = 0;
    this.blackout = false;
    this.strain = 0;
  }

  get snapshot() {
    const { day, power, air, water, food, fuel, filters } = this;
    return { day, power, air, water, food, fuel, filters };
  }

  // Consumption is per in-game day, applied continuously so the readouts move
  // while you watch them rather than jumping at midnight.
  tick(dt, { indoors }) {
    this.elapsed += dt;
    const days = dt / DAY_SECONDS;

    this.power = Math.max(0, this.power - days * 7.5);
    this.air = Math.max(0, this.air - days * (indoors ? 9 : 4));
    this.water = Math.max(0, this.water - days);
    this.food = Math.max(0, this.food - days);

    // Filtration runs on shelter power; without it the air goes fast.
    if (this.power <= 0) this.air = Math.max(0, this.air - days * 14);

    const wasBlackout = this.blackout;
    this.blackout = this.power <= 0;

    // What actually hurts you: nothing to eat, nothing to drink, or nothing
    // worth breathing.
    let strain = 0;
    if (this.food <= 0) strain += 1;
    if (this.water <= 0) strain += 1;
    if (this.air < 25) strain += (25 - this.air) / 25;
    this.strain = strain;

    const previousDay = this.day;
    this.day = 1 + Math.floor(this.elapsed / DAY_SECONDS);

    return {
      dayChanged: this.day !== previousDay,
      blackoutChanged: this.blackout !== wasBlackout,
      damage: strain * dt * 1.4,
    };
  }

  refuel() {
    if (this.fuel <= 0) return { ok: false, reason: 'NO FUEL CANS LEFT' };
    if (this.power > 92) return { ok: false, reason: `GENERATOR AT ${Math.round(this.power)}% — NOT YET` };
    this.fuel -= 1;
    this.power = Math.min(100, this.power + 34);
    return { ok: true, reason: `GENERATOR REFUELLED — ${Math.round(this.power)}% · ${this.fuel} CANS LEFT` };
  }

  serviceFilters() {
    if (this.filters <= 0) return { ok: false, reason: 'NO SPARE FILTERS LEFT' };
    if (this.air > 90) return { ok: false, reason: `AIR AT ${Math.round(this.air)}% — FILTERS STILL GOOD` };
    this.filters -= 1;
    this.air = Math.min(100, this.air + 38);
    return { ok: true, reason: `FILTERS REPLACED — AIR ${Math.round(this.air)}% · ${this.filters} SPARE` };
  }

  resupply({ food = 0, water = 0, fuel = 0, filters = 0 }) {
    this.food += food;
    this.water += water;
    this.fuel += fuel;
    this.filters += filters;
  }
}

// Persisted so a run survives a reload, which matters most on a phone where
// switching apps can drop the page.
const STORAGE_KEY = 'lost-signal-run-v1';

export function loadRun() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveRun(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // A private window or a browser with site data blocked: the run simply
    // does not persist, which is not worth interrupting play for.
  }
}

export function clearRun() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to clear */
  }
}

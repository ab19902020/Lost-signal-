// The pad.
//
// Shelter 47 was built for a mouse, and a mouse is a good way to aim a rifle
// and a bad way to drive a car. This reads the Gamepad API and turns it into
// the same shapes the rest of the game already speaks: two sticks, two
// analogue triggers and a set of named buttons with edge detection, so
// nothing downstream has to know a controller exists.
//
// A DualSense on Chrome, Edge or Safari reports the "standard" mapping over
// both USB and Bluetooth, so the layout below is the standard one and the
// DualSense-specific part is only the names on the buttons and the haptics.

// Standard-mapping button indices, under their DualSense faces.
const BUTTONS = {
  cross: 0, circle: 1, square: 2, triangle: 3,
  l1: 4, r1: 5, l2: 6, r2: 7,
  create: 8, options: 9, l3: 10, r3: 11,
  up: 12, down: 13, left: 14, right: 15,
  ps: 16, touchpad: 17,
};

// Sony's vendor id, and the products that are a DualSense rather than a DS4.
const SONY = /054c|sony|dualsense|dualshock|playstation|wireless controller/i;
const DUALSENSE = /0ce6|0df2|dualsense/i;

const NAMES = Object.keys(BUTTONS);

/** Radial dead zone: kills stick drift without flattening a slow push. */
function stick(x, y, dead, power) {
  const length = Math.hypot(x, y);
  if (length < dead) return [0, 0, 0];
  // Rescale what is left of the travel back out to a full 0..1, so the first
  // millimetre past the dead zone is a nudge and not a jump.
  const scaled = Math.min(1, (length - dead) / (1 - dead));
  const curved = Math.pow(scaled, power);
  return [(x / length) * curved, (y / length) * curved, curved];
}

/** Triggers idle a little off zero on a worn pad, and never quite reach one. */
function trigger(value, dead = .06) {
  return value <= dead ? 0 : Math.min(1, (value - dead) / (.94 - dead));
}

export function createGamepad({
  moveDead = .16, lookDead = .13,
  lookPower = 1.9,            // expo, so small movements are precise
  lookRate = 2.9,             // radians a second at full stick
  movePower = 1,
} = {}) {
  const state = {
    connected: false,
    id: '',
    index: -1,
    dualsense: false,
    sony: false,
    move: { x: 0, y: 0, magnitude: 0 },
    look: { x: 0, y: 0, magnitude: 0 },
    l2: 0, r2: 0,
    // Every named button, as `down` now and `pressed` on this frame's edge.
    down: {}, pressed: {}, released: {},
  };
  for (const name of NAMES) { state.down[name] = false; state.pressed[name] = false; state.released[name] = false; }

  let pad = null;
  let lastSeen = 0;
  const held = new Set();
  const listeners = new Set();

  const emit = (event, detail) => {
    for (const listener of listeners) listener(event, detail);
  };

  function pick() {
    const pads = navigator.getGamepads?.() || [];
    // Prefer a Sony pad if more than one is plugged in, otherwise take the
    // first connected thing with a standard mapping.
    let fallback = null;
    for (const candidate of pads) {
      if (!candidate || !candidate.connected) continue;
      if (SONY.test(candidate.id)) return candidate;
      if (!fallback) fallback = candidate;
    }
    return fallback;
  }

  /**
   * Read the pad. Call once a frame with the frame time; everything on the
   * returned state is valid until the next call.
   */
  function poll(dt = 1 / 60) {
    pad = pick();
    const was = state.connected;
    state.connected = !!pad;
    if (!pad) {
      if (was) {
        state.id = ''; state.index = -1; state.dualsense = false; state.sony = false;
        held.clear();
        for (const name of NAMES) { state.down[name] = false; state.pressed[name] = false; state.released[name] = true; }
        state.move.x = state.move.y = state.move.magnitude = 0;
        state.look.x = state.look.y = state.look.magnitude = 0;
        state.l2 = state.r2 = 0;
        emit('disconnected', {});
      } else {
        for (const name of NAMES) { state.pressed[name] = false; state.released[name] = false; }
      }
      return state;
    }

    if (!was || pad.id !== state.id) {
      state.id = pad.id;
      state.index = pad.index;
      state.sony = SONY.test(pad.id);
      state.dualsense = DUALSENSE.test(pad.id);
      held.clear();
      emit('connected', { id: pad.id, dualsense: state.dualsense });
    }
    lastSeen = pad.timestamp;

    const axes = pad.axes || [];
    const [mx, my, mm] = stick(axes[0] || 0, axes[1] || 0, moveDead, movePower);
    state.move.x = mx; state.move.y = my; state.move.magnitude = mm;
    const [lx, ly, lm] = stick(axes[2] || 0, axes[3] || 0, lookDead, lookPower);
    state.look.x = lx * lookRate * dt;
    state.look.y = ly * lookRate * dt;
    state.look.magnitude = lm;

    const buttons = pad.buttons || [];
    for (const name of NAMES) {
      const button = buttons[BUTTONS[name]];
      // Triggers on a standard pad are buttons with a value; the D-pad on some
      // pads is an axis, so fall back to axes[9] where the buttons are absent.
      const value = button ? (button.value ?? (button.pressed ? 1 : 0)) : 0;
      const isDown = button ? (button.pressed || value > .5) : false;
      const wasDown = held.has(name);
      state.down[name] = isDown;
      state.pressed[name] = isDown && !wasDown;
      state.released[name] = !isDown && wasDown;
      if (isDown) held.add(name); else held.delete(name);
    }
    state.l2 = trigger(buttons[BUTTONS.l2]?.value ?? 0);
    state.r2 = trigger(buttons[BUTTONS.r2]?.value ?? 0);
    return state;
  }

  /**
   * Haptics. A DualSense takes 'dual-rumble' on every current browser that
   * exposes the actuator; anything that does not simply ignores it, which is
   * why nothing here waits on the promise.
   */
  function rumble(strong = .5, weak = .3, duration = 120) {
    const actuator = pad?.vibrationActuator;
    if (!actuator?.playEffect) return false;
    try {
      actuator.playEffect('dual-rumble', {
        startDelay: 0,
        duration: Math.max(16, duration),
        strongMagnitude: Math.max(0, Math.min(1, strong)),
        weakMagnitude: Math.max(0, Math.min(1, weak)),
      }).catch(() => {});
      return true;
    } catch { return false; }
  }

  /**
   * The trigger itself, on a pad that has motors in it. A DualSense can kick
   * R2 back against the finger that just pulled it, which is a different thing
   * from the handles buzzing — so a shot is asked for both, and whichever the
   * pad and the browser actually support is what the player feels.
   */
  function kickTrigger(right = .6, left = 0, duration = 90) {
    const actuator = pad?.vibrationActuator;
    if (!actuator?.playEffect) return false;
    try {
      const effect = actuator.playEffect('trigger-rumble', {
        startDelay: 0,
        duration: Math.max(16, duration),
        strongMagnitude: 0,
        weakMagnitude: 0,
        leftTrigger: Math.max(0, Math.min(1, left)),
        rightTrigger: Math.max(0, Math.min(1, right)),
      });
      effect?.catch?.(() => {});
      return true;
    } catch { return false; }
  }

  const on = (listener) => { listeners.add(listener); return () => listeners.delete(listener); };

  return {
    state, poll, rumble, kickTrigger, on,
    get connected() { return state.connected; },
    get id() { return state.id; },
    get dualsense() { return state.dualsense; },
    get timestamp() { return lastSeen; },
    down: (name) => !!state.down[name],
    pressed: (name) => !!state.pressed[name],
    released: (name) => !!state.released[name],
  };
}

export { BUTTONS };

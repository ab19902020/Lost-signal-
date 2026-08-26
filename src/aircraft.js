import * as THREE from 'three';
import { findNamed } from './assets.js';

// The aeroplane.
//
// The car is a heading and a speed, which is all a car needs. An aeroplane is
// not: it has to be able to be upside down, it has to fall out of the sky when
// it stops going fast enough, and it has to stop doing either of those the
// moment its wheels are on the ground. So this carries a real orientation as a
// quaternion, and forces rather than a speed — thrust down the nose, lift off
// the wing, drag against the airflow, and weight straight down.
//
// It is not a simulator. The numbers are a light single's numbers rounded off
// until it is forgiving: it self-levels in roll when you let go, it damps its
// own pitch, and the stall is a soft one that drops the nose rather than
// flicking a wing. What it will not do is let you fly at nothing — below about
// fifty knots the wing stops working, and the only way out of that is down.

const GRAVITY = 9.81;
const MASS = 1000;               // kg
const WING_AREA = 16.2;          // m²
const RHO = 1.225;               // kg/m³ at sea level

const MAX_THRUST = 5600;         // N at full throttle, static
const CL_SLOPE = 5.0;            // lift coefficient per radian of incidence
const CL_MAX = 1.42;
const ALPHA_STALL = 0.34;        // ~19°, where the wing lets go
const CD0 = 0.030;               // parasite drag
const INDUCED = 0.052;           // induced drag, off lift squared

// Control authority, in radians a second at the speed it is fully effective.
const PITCH_RATE = 0.52;
const ROLL_RATE = 1.55;
const YAW_RATE = 0.62;
// Longitudinal stability, and the incidence it settles at with the stick
// central. A tail is what stops an aeroplane pointing wherever it was last
// pushed: the further the wing is from its trimmed angle the harder the tail
// pushes back, so full back stick reaches the stall and stops there instead of
// standing the thing on its tail at seventy-seven degrees nose up.
const PITCH_STABILITY = 2.4;
const TRIM_ALPHA = 0.06;
const CONTROL_SPEED = 34;        // below this the surfaces go soft

const GEAR_HEIGHT = 1.36;        // wheels to the model's origin
const BRAKE = 5.2;               // m/s² on the wheel brakes
const ROLL_DRAG = 0.42;          // rolling resistance on grass and tarmac
const STEER_RATE = 0.62;         // nosewheel authority, taxiing

const EYE = new THREE.Vector3(-0.34, 0.58, -0.55);
const DOOR = new THREE.Vector3(-2.60, 0, -0.30);

const _up = new THREE.Vector3(0, 1, 0);

export function createAircraft({ scene, colliders, assets, place, addInteraction,
  position = [0, 0, 0], heading = 0, name = 'Aircraft', label = 'LIGHT AIRCRAFT' }) {
  const source = assets.lightAircraft;
  if (!source) return null;

  const root = place(source, scene, position, [0, heading, 0], 1, { collide: false });
  root.name = name;

  const prop = findNamed(root, 'Plane_Prop');
  const propDisc = findNamed(root, 'Disc_Blur');
  const aileronL = findNamed(root, 'Aileron_L');
  const aileronR = findNamed(root, 'Aileron_R');
  const elevator = findNamed(root, 'Elevator');
  const rudder = findNamed(root, 'Rudder');
  const noseWheel = findNamed(root, 'Wheel_Nose');
  const wheels = ['Wheel_Main_L', 'Wheel_Main_R', 'Wheel_Nose']
    .map((tag) => findNamed(root, tag)).filter(Boolean);
  const seat = findNamed(root, 'Seat_Pilot');
  const door = findNamed(root, 'Door_Pilot');

  const state = {
    position: new THREE.Vector3(position[0], position[1], position[2]),
    velocity: new THREE.Vector3(),
    quaternion: new THREE.Quaternion().setFromAxisAngle(_up, heading),
    throttle: 0,
    airspeed: 0,
    altitude: 0,
    alpha: 0,
    stalled: false,
    grounded: true,
    occupied: false,
    propSpin: 0,
    impact: 0,
    controls: { pitch: 0, roll: 0, yaw: 0 },
  };

  // Parked, it is something you walk around; flown, its own hull must not be
  // the first thing it hits.
  const hull = colliders.addOrientedBox({
    cx: state.position.x, cz: state.position.z,
    halfX: 5.8, halfZ: 4.4, rotationY: heading, minY: 0.2, maxY: 2.6,
  });

  const _forward = new THREE.Vector3();
  const _wingUp = new THREE.Vector3();
  const _right = new THREE.Vector3();
  const _force = new THREE.Vector3();
  const _lift = new THREE.Vector3();
  const _drag = new THREE.Vector3();
  const _turn = new THREE.Quaternion();
  const _flow = new THREE.Vector3();
  const _out = new THREE.Vector3();
  const _level = new THREE.Euler(0, 0, 0, 'YXZ');
  const _levelQuat = new THREE.Quaternion();

  const groundAt = (x, z) => colliders.floorAt(x, z, 2.2, state.position.y + 4);

  function axes() {
    _forward.set(0, 0, -1).applyQuaternion(state.quaternion);
    _wingUp.set(0, 1, 0).applyQuaternion(state.quaternion);
    _right.set(1, 0, 0).applyQuaternion(state.quaternion);
  }

  /** Model space to world, for a point on the airframe. */
  function toWorld(local, target = _out) {
    return target.copy(local).applyQuaternion(state.quaternion).add(state.position);
  }

  /**
   * One step of flight.
   *
   * `controls.pitch` and `.roll` are -1..1, `.yaw` is the rudder, `.throttle`
   * is 0..1 and `.brake` is the wheel brakes. Returns the airspeed in m/s.
   */
  function update(dt, controls = {}) {
    const wanted = THREE.MathUtils.clamp(controls.throttle ?? state.throttle, 0, 1);
    // A piston engine does not change its mind instantly.
    state.throttle = THREE.MathUtils.damp(state.throttle, wanted, 2.6, dt);
    state.controls.pitch = THREE.MathUtils.damp(state.controls.pitch,
      THREE.MathUtils.clamp(controls.pitch ?? 0, -1, 1), 9, dt);
    state.controls.roll = THREE.MathUtils.damp(state.controls.roll,
      THREE.MathUtils.clamp(controls.roll ?? 0, -1, 1), 9, dt);
    state.controls.yaw = THREE.MathUtils.damp(state.controls.yaw,
      THREE.MathUtils.clamp(controls.yaw ?? 0, -1, 1), 8, dt);

    axes();
    const speed = state.velocity.length();
    state.airspeed = speed;
    const ground = groundAt(state.position.x, state.position.z);
    state.altitude = state.position.y - GEAR_HEIGHT - ground;

    // Angle of attack: how far the airflow is below the nose. With no airflow
    // there is no angle and no lift, which is what keeps a parked aeroplane on
    // the ground.
    if (speed > 1.2) {
      _flow.copy(state.velocity).normalize();
      state.alpha = Math.asin(THREE.MathUtils.clamp(-_flow.dot(_wingUp), -1, 1));
    } else {
      state.alpha = 0;
    }

    // Lift. Past the stall the coefficient falls away instead of holding, so
    // pulling harder makes it worse — which is the one thing about a stall a
    // player has to feel.
    const over = Math.abs(state.alpha) - ALPHA_STALL;
    state.stalled = over > 0 && speed > 1.2;
    let cl = CL_SLOPE * state.alpha;
    // A gentle break. Losing the lift all at once is realistic and horrible to
    // fly; this bleeds it away so the nose drops, the speed builds and the wing
    // starts working again without the pilot having to know why.
    if (state.stalled) cl *= Math.max(0.42, 1 - over * 1.9);
    cl = THREE.MathUtils.clamp(cl, -CL_MAX, CL_MAX);

    const q = 0.5 * RHO * speed * speed;
    _force.set(0, -GRAVITY * MASS, 0);
    _force.addScaledVector(_forward, state.throttle * MAX_THRUST);
    _lift.copy(_wingUp).multiplyScalar(q * WING_AREA * cl);
    _force.add(_lift);
    if (speed > 0.05) {
      const cd = CD0 + INDUCED * cl * cl;
      _drag.copy(state.velocity).multiplyScalar(-q * WING_AREA * cd / speed);
      _force.add(_drag);
    }

    state.velocity.addScaledVector(_force, dt / MASS);

    // Control surfaces work on airflow, so they go soft as the speed comes off
    // and do nothing at all standing still.
    const bite = THREE.MathUtils.clamp(speed / CONTROL_SPEED, 0, 1.35);
    let pitch = state.controls.pitch * PITCH_RATE * bite;
    let roll = state.controls.roll * ROLL_RATE * bite;
    let yaw = state.controls.yaw * YAW_RATE * bite;

    if (state.grounded) {
      // On the wheels the nose gear steers and the wings are held level.
      yaw += state.controls.yaw * STEER_RATE * Math.min(1, speed / 12);
      roll = 0;
    } else {
      // Stability: it rolls level and trims itself in pitch if the pilot lets
      // go. Without this an arcade aeroplane wanders into the ground the moment
      // you look away from it — and without the pitch half, holding the stick
      // back walks the nose all the way round.
      const bank = Math.atan2(_right.y, _wingUp.y);
      roll -= bank * 1.35 * (1 - Math.abs(state.controls.roll));
      pitch -= (state.alpha - TRIM_ALPHA) * PITCH_STABILITY * bite;
      // A banked wing turns: that is what a rudder pedal is for on a real one
      // and what nobody wants to coordinate on a keyboard.
      yaw -= Math.sin(bank) * 0.42 * bite;
    }

    _turn.setFromAxisAngle(_right, pitch * dt);
    state.quaternion.premultiply(_turn);
    _turn.setFromAxisAngle(_forward, -roll * dt);
    state.quaternion.premultiply(_turn);
    _turn.setFromAxisAngle(_up, -yaw * dt);
    state.quaternion.premultiply(_turn);
    state.quaternion.normalize();

    state.position.addScaledVector(state.velocity, dt);

    // The ground.
    const floor = groundAt(state.position.x, state.position.z) + GEAR_HEIGHT;
    if (state.position.y <= floor) {
      const sink = -state.velocity.y;
      if (!state.grounded && sink > 7) state.impact = Math.max(state.impact, sink);
      state.position.y = floor;
      if (state.velocity.y < 0) state.velocity.y = 0;
      state.grounded = true;
      // Wings level on the wheels — but the nose is the pilot's. Slerping the
      // whole attitude to level held the pitch at zero too, so the wing never
      // got an angle of attack and the aeroplane would accelerate to a hundred
      // knots down the strip and never leave it. Roll goes, pitch stays, and
      // the nose is capped at the angle where the tail would hit the tarmac.
      axes();
      const facing = Math.atan2(-_forward.x, -_forward.z);
      const nose = THREE.MathUtils.clamp(Math.asin(
        THREE.MathUtils.clamp(_forward.y, -1, 1)), -0.06, 0.22);
      _level.set(nose, facing, 0, 'YXZ');
      _levelQuat.setFromEuler(_level);
      state.quaternion.slerp(_levelQuat, Math.min(1, dt * 8));
      // Rolling resistance, and the brakes.
      const decel = ROLL_DRAG + (controls.brake ? BRAKE : 0);
      const rolling = Math.hypot(state.velocity.x, state.velocity.z);
      if (rolling > 0.01) {
        const keep = Math.max(0, rolling - decel * dt) / rolling;
        state.velocity.x *= keep;
        state.velocity.z *= keep;
      }
      // Wheels do not slide sideways: what the aeroplane has across its own
      // axis is thrown away and what it has along it is kept.
      //
      // The direction has to be the *flattened* nose, normalised. Projecting
      // onto the raw forward vector cost a factor of cos² of the pitch angle
      // every frame — five per cent at a twelve degree nose-up — so the moment
      // the pilot rotated, the aeroplane went from fifty-five knots to nothing
      // in under a second and sat on the runway with the stick in its lap.
      const flat = Math.hypot(_forward.x, _forward.z);
      if (flat > 1e-4) {
        const nx = _forward.x / flat;
        const nz = _forward.z / flat;
        const along = state.velocity.x * nx + state.velocity.z * nz;
        state.velocity.x = nx * along;
        state.velocity.z = nz * along;
      }
    } else {
      state.grounded = false;
    }

    root.position.copy(state.position);
    root.quaternion.copy(state.quaternion);
    hull.cx = state.position.x;
    hull.cz = state.position.z;
    axes();
    const facing = Math.atan2(-_forward.x, -_forward.z);
    hull.cos = Math.cos(facing);
    hull.sin = Math.sin(facing);
    hull.enabled = !state.occupied && state.grounded;

    // The propeller, the surfaces and the nosewheel.
    state.propSpin += dt * (6 + state.throttle * 190);
    if (prop) prop.rotation.z = state.propSpin;
    const spinning = state.throttle > 0.22;
    if (propDisc) propDisc.visible = spinning;
    if (prop) prop.visible = !spinning || state.throttle < 0.5;
    if (aileronL) aileronL.rotation.x = state.controls.roll * 0.42;
    if (aileronR) aileronR.rotation.x = -state.controls.roll * 0.42;
    if (elevator) elevator.rotation.x = -state.controls.pitch * 0.40;
    if (rudder) rudder.rotation.y = -state.controls.yaw * 0.44;
    if (noseWheel) noseWheel.rotation.y = state.controls.yaw * 0.44;
    for (const wheel of wheels) wheel.rotation.x -= (state.grounded ? speed : 0) * dt * 2.6;

    return speed;
  }

  const pilotEye = (target = new THREE.Vector3()) => toWorld(EYE, target);

  /** Where the pilot stands when they climb out. */
  function doorstep() {
    const point = toWorld(door ? door.position : DOOR, new THREE.Vector3());
    for (let turn = 0; turn < 8 && colliders.contains(point.x, point.z, 0.36,
      point.y + 0.2, point.y + 1.7); turn++) {
      const angle = turn * (Math.PI / 4);
      point.set(state.position.x + Math.sin(angle) * 4.2, state.position.y,
        state.position.z + Math.cos(angle) * 4.2);
    }
    point.y = groundAt(point.x, point.z);
    return point;
  }

  function takeImpact() {
    const hit = state.impact;
    state.impact = 0;
    return hit;
  }

  const api = {
    root, state, update, doorstep, takeImpact,
    seat: pilotEye,
    get airspeed() { return state.airspeed; },
    get altitude() { return state.altitude; },
    get throttle() { return state.throttle; },
    get grounded() { return state.grounded; },
    get stalled() { return state.stalled; },
    get occupied() { return state.occupied; },
    set occupied(value) { state.occupied = !!value; hull.enabled = !value; },
    position: (target = new THREE.Vector3()) => target.copy(state.position),
    heading() { axes(); return Math.atan2(-_forward.x, -_forward.z); },
    label,
  };

  if (addInteraction) {
    addInteraction(root, `${label} — FLY`, 'outside', () => {
      window.dispatchEvent(new CustomEvent('lostsignal:fly', { detail: { aircraft: api } }));
    });
  }

  return api;
}

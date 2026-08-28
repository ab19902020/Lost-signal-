import * as THREE from 'three';
import { findNamed } from './assets.js';

// The car at the gate.
//
// Half a kilometre of road was built out to the town and nothing could use it.
// This is the thing that can: an arcade car, not a simulator — one rigid body
// with a heading, a speed and four wheels that turn — but one that obeys the
// same collision the player does, so it stops at the fence and cannot be
// driven through the shelter.
//
// The model is authored nose-down-Z, which is the same convention the player's
// yaw uses, so a heading is a heading whether you are walking or driving.

const WHEELBASE = 2.48;        // measured between the uploaded model's hubs
const TRACK = 1.44;            // hub-to-hub track measured from the upload
const WHEEL_RADIUS = 0.315;     // actual tyre radius after the clean extraction
const HALF_LENGTH = 2.10;
const HALF_WIDTH = 0.86;
// The body is tested as three circles down its spine rather than one big one:
// a single circle either lets the nose through the fence or refuses to fit
// through the gate.
const PROBE_Z = [-1.40, 0, 1.40];
const PROBE_RADIUS = 0.82;

const EYE = new THREE.Vector3(0.40, 1.30, -0.28);    // right-hand drive
const DOOR = new THREE.Vector3(1.62, 0, -0.20);      // out of the driver's side

// Mk III RS Turbo character: a light, quick front-driver with five close gears
// and a real 125-ish mph top end, rather than the forty-mph estate tune this
// controller originally carried. Values remain forgiving enough for a pad.
const TOP_SPEED = 57.0;        // m/s, 127.5 mph
const REVERSE_SPEED = 9.0;
const ENGINE = 9.1;            // first-gear acceleration at full boost
const BRAKE = 15.0;
const DRAG = 0.00125;          // balances top-gear power at maximum speed
const ROLL = 0.82;
const GEAR_LIMITS = [11.2, 20.1, 31.0, 43.5, TOP_SPEED];
const GEAR_TORQUE = [1.18, 1.02, 0.82, 0.63, 0.45];
const MAX_STEER = 0.62;        // radians of lock
const GRIP_SPEED = 8.5;        // above this, the lock is progressively wound off

export const VEHICLE_SPEC = Object.freeze({
  make: 'Ford',
  model: 'Escort RS Turbo',
  paint: 'supplied weathered black finish',
  drivenAxle: 'front',
  topSpeed: TOP_SPEED,
  reverseSpeed: REVERSE_SPEED,
  gears: Object.freeze([...GEAR_LIMITS]),
  maxSteer: MAX_STEER,
});

const UP = new THREE.Vector3(0, 1, 0);

export function createVehicle({ scene, colliders, assets, place, addInteraction,
  position = [0, 0, 0], heading = 0, name = 'Car', label = 'FORD ESCORT RS TURBO' }) {
  const source = assets.carDrivable || assets.estateCar;
  if (!source) return null;

  const root = place(source, scene, position, [0, heading, 0], 1, { collide: false });
  root.name = name;
  root.userData.make = VEHICLE_SPEC.make;
  root.userData.model = VEHICLE_SPEC.model;
  root.userData.drivenAxle = VEHICLE_SPEC.drivenAxle;

  // Keep the uploaded scan's actual PBR paint, trim, cabin and wheel texture.
  // Every moving part uses the same supplied material so the extracted pivots
  // remain visually continuous with the fused body.

  const shell = findNamed(root, 'Car_Shell');
  const steeringWheel = findNamed(root, 'Car_SteeringWheel');
  const steeringWheelRest = steeringWheel?.rotation.z || 0;
  const wheels = ['LF', 'RF', 'LR', 'RR']
    .map((tag) => findNamed(root, `Car_Wheel_${tag}`));

  // Each wheel gets two independent transform layers. The outer front layer
  // yaws around the kingpin; the inner layer rolls around the axle. Keeping
  // those transforms off the supplied mesh means its authored orientation is
  // never overwritten and steering cannot make a tyre wobble or cone.
  const wheelRigs = wheels.map((wheel, index) => {
    if (!wheel) return null;
    const parent = wheel.parent;
    const hub = wheel.position.clone();
    const steer = index < 2 ? new THREE.Group() : null;
    const spin = new THREE.Group();
    spin.name = `${wheel.name}_Spin`;
    if (steer) {
      steer.name = `${wheel.name}_Steer`;
      steer.position.copy(hub);
      parent.add(steer);
      steer.add(spin);
    } else {
      spin.position.copy(hub);
      parent.add(spin);
    }
    spin.add(wheel);
    wheel.position.set(0, 0, 0);
    return { wheel, steer, spin };
  });
  const [frontLeftRig, frontRightRig] = wheelRigs;

  // Lamps. The glass is modelled; the light and the glow are runtime, so a car
  // at night has beams on the road instead of two painted white circles.
  const headLamps = [];
  const tailLamps = [];
  root.traverse((part) => {
    if (!part.isMesh) return;
    if (/^Car_Headlamp_/.test(part.name)) headLamps.push(part);
    else if (/^Car_(Taillamp_|Backlight)/.test(part.name)) tailLamps.push(part);
  });
  for (const lamp of [...headLamps, ...tailLamps]) {
    if (lamp.material) lamp.material = lamp.material.clone();
  }
  const _glow = new THREE.Color();
  function setLampGlow(lamps, level, tint) {
    for (const lamp of lamps) {
      const material = lamp.material;
      if (!material || !material.emissive) continue;
      material.emissive.copy(_glow.set(tint));
      // Intensity only. `toneMapped` is part of three.js's program cache key,
      // so flipping it every time the brake lights come on would recompile the
      // lamp's shader at every junction.
      material.emissiveIntensity = level;
    }
  }
  const beams = [];
  for (const side of [-1, 1]) {
    const beam = new THREE.SpotLight(0xfff0d2, 26, 46, 0.44, 0.52, 1.4);
    beam.position.set(side * 0.62, 0.72, -2.02);
    beam.target.position.set(side * 0.30, -0.55, -18);
    // An invisible light is not in the render's light list at all, so a car
    // with its lamps off costs the scene nothing.
    beam.visible = false;
    root.add(beam, beam.target);
    beams.push(beam);
  }

  const state = {
    x: position[0], y: position[1], z: position[2],
    heading,
    speed: 0,
    steer: 0,
    leftSteer: 0,
    rightSteer: 0,
    wheelSpin: 0,
    frontWheelSpin: 0,
    rearWheelSpin: 0,
    gear: 1,
    rpm: 0.26,
    shifted: false,
    lean: 0,
    pitch: 0,
    slide: 0,
    lights: false,
    occupied: false,
    // Set when the car has just hit something, so the game can play the bang
    // and shake the camera. Read and cleared by takeImpact().
    impact: 0,
  };

  // Parked, the car is something you walk around. Driving, it is something you
  // are inside, so its own collider comes off — otherwise the world's first
  // obstacle is the car you are sitting in.
  const hull = colliders.addOrientedBox({
    cx: state.x, cz: state.z, halfX: HALF_WIDTH, halfZ: HALF_LENGTH,
    rotationY: heading, minY: 0.18, maxY: 1.62,
  });

  const _probe = new THREE.Vector3();
  const _forward = new THREE.Vector3();
  const _out = new THREE.Vector3();

  // Model space to world, for a point on the car.
  function toWorld(local, x = state.x, z = state.z, target = _out) {
    return target.copy(local).applyAxisAngle(UP, state.heading)
      .add(_probe.set(x, state.y, z));
  }

  const groundAt = (x, z) => colliders.floorAt(x, z, PROBE_RADIUS, state.y + 2.4);

  // Would the body be inside anything if it stood here on this heading?
  function blocked(x, z, facing = state.heading) {
    const sin = Math.sin(facing);
    const cos = Math.cos(facing);
    for (const offset of PROBE_Z) {
      const px = x - sin * offset;
      const pz = z - cos * offset;
      if (colliders.contains(px, pz, PROBE_RADIUS, state.y + 0.30, state.y + 1.45)) return true;
    }
    return false;
  }

  function syncHull() {
    hull.cx = state.x;
    hull.cz = state.z;
    // rotationY here follows the three.js convention the rest of the world
    // uses: it is the object's own rotation.y, and the set inverts it.
    hull.cos = Math.cos(state.heading);
    hull.sin = Math.sin(state.heading);
  }

  /**
   * One step of the car.
   *
   * `controls.throttle` is -1..1 (reverse to full), `controls.steer` is -1..1,
   * `controls.brake` is the handbrake. Returns the speed in m/s.
   */
  function update(dt, controls = {}) {
    const throttle = THREE.MathUtils.clamp(controls.throttle ?? 0, -1, 1);
    const steerInput = THREE.MathUtils.clamp(controls.steer ?? 0, -1, 1);
    const fast = Math.abs(state.speed);

    // Steering has weight: the wheels take a moment to come round, they
    // straighten on their own when the driver lets go, and the lock winds off
    // with speed so the car does not fold itself in half at forty.
    const lock = MAX_STEER * (fast > GRIP_SPEED
      ? THREE.MathUtils.lerp(1, 0.28, Math.min(1, (fast - GRIP_SPEED) / (TOP_SPEED - GRIP_SPEED)))
      : 1);
    // Positive steer means right. The heading here is the player's yaw, and
    // three.js yaw runs the angle *down* as you turn right, so the lock the
    // wheels take is the negative of the input. Doing it once here keeps the
    // body, the front wheels and the weight transfer all turning the same way.
    state.steer = THREE.MathUtils.damp(state.steer, -steerInput * lock,
      steerInput ? 9 : 6, dt);

    // Longitudinal forces. Throttle against travel is the brake pedal, which
    // is how every arcade car since Out Run has worked.
    const previousGear = state.gear;
    if (state.speed >= 0) {
      const found = GEAR_LIMITS.findIndex((limit) => fast <= limit);
      state.gear = found < 0 ? GEAR_LIMITS.length : found + 1;
    } else {
      state.gear = 0;
    }
    const gearIndex = Math.max(0, state.gear - 1);
    const gearFloor = gearIndex ? GEAR_LIMITS[gearIndex - 1] : 0;
    const gearCeiling = GEAR_LIMITS[gearIndex] || REVERSE_SPEED;
    const throughGear = THREE.MathUtils.clamp((fast - gearFloor)
      / Math.max(1, gearCeiling - gearFloor), 0, 1);
    state.rpm = state.gear === 0 ? 0.30 + fast / REVERSE_SPEED * 0.62
      : 0.28 + throughGear * 0.72;
    state.shifted = previousGear !== state.gear && previousGear > 0 && state.gear > 0;

    let accel;
    if (controls.brake) {
      accel = -Math.sign(state.speed) * BRAKE * (state.slide > .5 ? .62 : 1);
    } else if (throttle > 0) {
      // Only the front axle is powered. The low gears get the turbo shove;
      // higher gears trade it for the real car's long top end.
      accel = state.speed < -0.4 ? BRAKE
        : ENGINE * GEAR_TORQUE[gearIndex] * throttle * (1 - throughGear * 0.14);
    } else if (throttle < 0) {
      accel = state.speed > 0.4 ? -BRAKE : ENGINE * throttle * 0.55;
    } else {
      accel = -Math.sign(state.speed) * ROLL;
    }
    accel -= Math.sign(state.speed) * DRAG * state.speed * state.speed;
    const next = state.speed + accel * dt;
    // Rolling resistance and braking stop the car; they do not reverse it.
    state.speed = (throttle === 0 || controls.brake) && Math.sign(next) !== Math.sign(state.speed)
      ? 0
      : THREE.MathUtils.clamp(next, -REVERSE_SPEED, TOP_SPEED);

    // Handbrake. Locking the rears takes the back axle out of the equation, so
    // the car keeps rotating for a moment after the front wheels have stopped
    // asking it to. It only bites above walking pace — a handbrake on a
    // stationary car is a parking brake and nothing else.
    const wantSlide = controls.brake && fast > 4 ? 1 : 0;
    state.slide = THREE.MathUtils.damp(state.slide, wantSlide, wantSlide ? 7 : 2.4, dt);

    // A car turns because its front wheels point somewhere else, so the rate
    // depends on how fast it is going. Standing still it does not turn at all,
    // which is why you cannot spin it on the spot.
    const yawRate = Math.abs(state.speed) > 0.05
      ? (state.speed / WHEELBASE) * Math.tan(state.steer) * (1 + state.slide * 1.25)
      : 0;
    const facing = state.heading + yawRate * dt;

    _forward.set(-Math.sin(facing), 0, -Math.cos(facing));
    const travel = state.speed * dt;
    const travelFromX = state.x;
    const travelFromZ = state.z;
    const wantX = state.x + _forward.x * travel;
    const wantZ = state.z + _forward.z * travel;

    if (!blocked(wantX, wantZ, facing)) {
      state.x = wantX;
      state.z = wantZ;
      state.heading = facing;
    } else {
      // Try each axis on its own, so glancing the fence slides along it rather
      // than stopping dead.
      const slidX = !blocked(wantX, state.z, state.heading);
      const slidZ = !blocked(state.x, wantZ, state.heading);
      if (slidX) state.x = wantX;
      if (slidZ) state.z = wantZ;
      if (!slidX && !slidZ) {
        state.impact = Math.max(state.impact, Math.abs(state.speed));
        state.speed = 0;
      } else {
        state.speed *= 0.55;
      }
    }

    // Sit on whatever is under it, front and back, and let the nose ride up
    // and down with the slope.
    const front = groundAt(state.x - Math.sin(state.heading) * 1.46,
      state.z - Math.cos(state.heading) * 1.46);
    const rear = groundAt(state.x + Math.sin(state.heading) * 1.46,
      state.z + Math.cos(state.heading) * 1.46);
    state.y = THREE.MathUtils.damp(state.y, Math.max(front, rear), 12, dt);

    root.position.set(state.x, state.y, state.z);
    root.rotation.y = state.heading;
    syncHull();
    hull.enabled = !state.occupied;

    // Weight transfer, purely for the look of it: the shell rolls out of the
    // corner and squats under power.
    state.lean = THREE.MathUtils.damp(state.lean,
      -state.steer * (fast / TOP_SPEED) * 0.16 * (1 + state.slide * .5), 6, dt);
    state.pitch = THREE.MathUtils.damp(state.pitch, THREE.MathUtils.clamp(-accel * 0.006, -0.05, 0.05), 5, dt);
    if (shell) {
      shell.rotation.z = state.lean;
      shell.rotation.x = state.pitch;
    }

    // Wheels: the front pair point where the steering says, all four roll at
    // the speed the car is actually doing.
    const actualTravel = Math.hypot(state.x - travelFromX, state.z - travelFromZ)
      * Math.sign(travel || state.speed || 1);
    const rollingSpin = actualTravel / WHEEL_RADIUS;
    // Front-wheel drive: under boost the driven tyres turn a little faster
    // than the road while the rears remain free-rolling. It is subtle at speed
    // and visible pulling away on gravel.
    const driveSlip = Math.max(0, throttle) * Math.max(0, 1 - fast / 16) * 0.16;
    state.frontWheelSpin += rollingSpin * (1 + driveSlip);
    state.rearWheelSpin += rollingSpin;
    state.wheelSpin = state.rearWheelSpin; // retained for diagnostics/save QA
    wheelRigs.forEach((rig, i) => {
      if (rig) rig.spin.rotation.x = i < 2 ? state.frontWheelSpin : state.rearWheelSpin;
    });

    // Ackermann geometry: the inside wheel takes more lock than the outside
    // wheel, so both roll around the same corner instead of scrubbing sideways
    // as a pair of parallel casters. Straight input produces exact zero.
    const steerMagnitude = Math.abs(state.steer);
    if (steerMagnitude < 1e-5) {
      state.leftSteer = 0;
      state.rightSteer = 0;
    } else {
      const sign = Math.sign(state.steer);
      const turnRadius = WHEELBASE / Math.tan(steerMagnitude);
      const inside = Math.atan(WHEELBASE / Math.max(0.1, turnRadius - TRACK * .5));
      const outside = Math.atan(WHEELBASE / (turnRadius + TRACK * .5));
      state.leftSteer = sign * (sign > 0 ? inside : outside);
      state.rightSteer = sign * (sign < 0 ? inside : outside);
    }
    if (frontLeftRig?.steer) frontLeftRig.steer.rotation.y = state.leftSteer;
    if (frontRightRig?.steer) frontRightRig.steer.rotation.y = state.rightSteer;
    if (steeringWheel) {
      steeringWheel.rotation.z = steeringWheelRest
        - (state.steer / MAX_STEER) * 2.25;
    }

    const braking = !!controls.brake || (throttle < 0 && state.speed > 0.4);
    setLampGlow(tailLamps, state.lights ? (braking ? 2.6 : .55) : (braking ? 2.0 : 0), 0xff2a17);
    setLampGlow(headLamps, state.lights ? 2.2 : 0, 0xfff3d6);
    for (const beam of beams) beam.visible = state.lights;

    return state.speed;
  }

  /** Where the driver's head is, in world space. */
  const seat = (target = new THREE.Vector3()) => toWorld(EYE, state.x, state.z, target);

  /** Where the driver stands when they get out, clear of the car. */
  function doorstep() {
    const point = toWorld(DOOR, state.x, state.z, new THREE.Vector3());
    // Never put the player inside anything: walk out around the car if the
    // driver's side is against a wall.
    for (let turn = 0; turn < 8; turn++) {
      if (!colliders.contains(point.x, point.z, 0.36, point.y + 0.2, point.y + 1.7)) break;
      const angle = state.heading + (turn + 1) * (Math.PI / 4);
      point.set(state.x - Math.sin(angle) * 2.3, state.y, state.z - Math.cos(angle) * 2.3);
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
    root, state, update, seat, doorstep, takeImpact,
    get speed() { return state.speed; },
    get heading() { return state.heading; },
    get occupied() { return state.occupied; },
    get lights() { return state.lights; },
    setLights(on) { state.lights = !!on; return state.lights; },
    toggleLights() { state.lights = !state.lights; return state.lights; },
    set occupied(value) { state.occupied = !!value; hull.enabled = !value; },
    position: (target = new THREE.Vector3()) => target.set(state.x, state.y, state.z),
    topSpeed: TOP_SPEED,
    make: VEHICLE_SPEC.make,
    model: VEHICLE_SPEC.model,
    drivenAxle: 'front',
    get gear() { return state.gear; },
    get rpm() { return state.rpm; },
    label,
  };

  if (addInteraction) {
    addInteraction(root, `${label} — DRIVE`, 'outside', () => {
      window.dispatchEvent(new CustomEvent('lostsignal:drive', { detail: { vehicle: api } }));
    });
  }

  return api;
}

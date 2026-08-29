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

// Sideslip - the thing that was missing, and the reason it crabbed round a
// turn twenty degrees off its own nose.
//
// The model had lift, drag, thrust and weight and nothing at all across the
// aeroplane. Nothing resisted it sliding sideways through the air, and nothing
// pulled the nose back into the airflow when it did. So a banked wing hauled
// the aircraft round a corner while the fuselage carried on pointing where it
// had been pointing, which is what the complaint about flying sideways looks
// like once the model itself is the right way round.
//
// Both halves of the fix are the same piece of aeroplane. The fuselage side
// and the fin present an area to a crosswind: that gives a force opposing the
// slip, and because all of it is behind the centre of gravity it also gives a
// moment that swings the nose into the wind. A weathervane, which is exactly
// what a fin is.
const SIDE_AREA = 9.4;           // m² of fuselage flank and fin
const CY_SLIP = 1.15;            // side force per unit of sideslip
const WEATHERCOCK = 2.35;        // yaw rate into the airflow, rad/s per unit slip

// Held roll used to keep rolling: five seconds of stick put it at seventy-nine
// degrees of bank with the lift pointing sideways, the speed falling out of it
// and the aeroplane sliding down the sky. Past fifty degrees the roll gets
// progressively harder, so a held stick settles into a steep turn rather than
// carrying on round to inverted.
const BANK_SOFT = 0.87;          // radians, 50 degrees
const BANK_HOLD = 9.0;
// How hard it rolls itself level with the stick centred, and how quickly a
// held stick switches that off. The old levelling was so strong that holding
// a tenth of roll still rolled the aeroplane level: a bank could not be held,
// so a turn washed out into eighteen degrees in five seconds. Centred, it
// still picks the wings up on its own, which is the point of it.
const ROLL_LEVEL = 0.45;
const ROLL_HANDS_OFF = 3.5;

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
const RAF_EYE = new THREE.Vector3(0.0, 1.52, -0.38);
const RAF_DOOR = new THREE.Vector3(-1.55, 0, -0.10);
const _visualBox = new THREE.Box3();
const _visualSize = new THREE.Vector3();

const _up = new THREE.Vector3(0, 1, 0);

// --- Rigging the supplied aeroplane ----------------------------------------
//
// The upload is one unnamed mesh of 356,480 vertices. Nothing in it is named,
// nothing is separable, and it is not pointing where the flight model thinks
// it is: its fuselage runs along X while the controller flies down -Z, which
// is why the aeroplane crossed the sky sideways. Its propeller could not turn
// either, because there was no propeller - only a blade fused into the same
// mesh as the wings and the tail.
//
// Both are geometry problems, and the geometry answers them:
//
//   * The fuselage is the longer of the two horizontal axes; the wings span
//     the other.
//   * The tail end is thin across the fuselage and tall, because that is what
//     a fin is. The nose end finishes in something thinner still - a blade a
//     couple of centimetres thick and twenty tall, standing across the
//     airflow. That is the propeller, and the end it is on is the front.
//
// So the nose is found rather than assumed, and the blade at the front is
// lifted out into a node of its own with its pivot on the crankshaft axis.
// None of this touches the artwork: the same triangles are drawn, in two
// groups instead of one, the right way round.
const PROP_THIN = 0.075;      // of the fuselage length; a blade is thinner
const AIRCRAFT_LENGTH = 9.2;  // nose to tail, a compact single-seat fighter

function firstMesh(root) {
  let found = null;
  root.traverse((part) => { if (!found && part.isMesh && part.geometry) found = part; });
  return found;
}

// How far in from one end of the fuselage the section stays blade-thin.
function bladeDepth(points, axis, across, fromHigh, length) {
  const limit = length * PROP_THIN;
  const edge = fromHigh ? points.max[axis] : points.min[axis];
  const step = length / 200;
  let depth = 0;
  for (let index = 0; index < 40; index++) {
    const lo = fromHigh ? edge - (index + 1) * step : edge + index * step;
    const hi = lo + step;
    let low = Infinity;
    let high = -Infinity;
    for (let vertex = 0; vertex < points.count; vertex++) {
      const along = points.get(vertex, axis);
      if (along < lo || along >= hi) continue;
      const side = points.get(vertex, across);
      if (side < low) low = side;
      if (side > high) high = side;
    }
    if (!Number.isFinite(low)) continue;
    if (high - low > limit) break;
    // How deep we have got, measured from the end we started at - which is the
    // far side of this slab, not the near one.
    depth = Math.abs((fromHigh ? lo : hi) - edge);
  }
  return depth;
}

function rigSuppliedAircraft(root) {
  const mesh = firstMesh(root);
  const geometry = mesh?.geometry;
  const attribute = geometry?.attributes?.position;
  if (!attribute) return null;

  const points = {
    count: attribute.count,
    get: (index, axis) => attribute.getComponent(index, axis),
    min: [Infinity, Infinity, Infinity],
    max: [-Infinity, -Infinity, -Infinity],
  };
  for (let index = 0; index < attribute.count; index++) {
    for (let axis = 0; axis < 3; axis++) {
      const value = attribute.getComponent(index, axis);
      if (value < points.min[axis]) points.min[axis] = value;
      if (value > points.max[axis]) points.max[axis] = value;
    }
  }
  const extent = [0, 1, 2].map((axis) => points.max[axis] - points.min[axis]);

  // Which axis is the fuselage is not "the longer one" - on this aeroplane, as
  // on most, the wings are wider than the body is long. What tells them apart
  // is what is at the ends. A wingtip is a thin plate a couple of centimetres
  // deep; a tail carries a fin and a nose carries a propeller, and both of
  // those are tall. So the fuselage is the axis whose end sections stand up.
  const endHeight = (axis) => {
    const reach = extent[axis] * 0.06;
    let tallest = 0;
    for (const edge of [points.min[axis] + reach, points.max[axis] - reach]) {
      const low = edge === points.min[axis] + reach;
      let bottom = Infinity;
      let top = -Infinity;
      for (let vertex = 0; vertex < points.count; vertex++) {
        const along = points.get(vertex, axis);
        if (low ? along > edge : along < edge) continue;
        const height = points.get(vertex, 1);
        if (height < bottom) bottom = height;
        if (height > top) top = height;
      }
      if (Number.isFinite(bottom)) tallest = Math.max(tallest, top - bottom);
    }
    return tallest;
  };
  const fuselage = endHeight(0) >= endHeight(2) ? 0 : 2;
  const span = fuselage === 0 ? 2 : 0;
  const length = extent[fuselage];
  const front = bladeDepth(points, fuselage, span, true, length);
  const rear = bladeDepth(points, fuselage, span, false, length);
  const nosePositive = front >= rear;
  const propDepth = Math.max(front, rear);

  // Turn the nose to -Z, which is forward for everything else in the game.
  const visual = new THREE.Group();
  visual.name = 'RAF_Aircraft_Visual';
  for (const child of [...root.children]) visual.add(child);
  root.add(visual);
  visual.rotation.y = fuselage === 0
    ? (nosePositive ? Math.PI / 2 : -Math.PI / 2)
    : (nosePositive ? Math.PI : 0);
  root.updateMatrixWorld(true);
  _visualBox.setFromObject(visual);
  _visualBox.getSize(_visualSize);
  visual.scale.setScalar(AIRCRAFT_LENGTH / Math.max(0.1, _visualSize.z));
  root.updateMatrixWorld(true);
  _visualBox.setFromObject(visual);
  visual.position.y -= _visualBox.min.y - root.position.y;
  root.updateMatrixWorld(true);

  root.userData.rig = {
    fuselage: 'XYZ'[fuselage], span: 'XYZ'[span], nosePositive,
    frontBlade: +front.toFixed(4), rearBlade: +rear.toFixed(4),
    extent: extent.map((value) => +value.toFixed(3)),
  };
  if (propDepth < length * 0.02) return { visual, prop: null, propDisc: null };

  // Split the blade out. The body keeps the shared vertex buffers and only
  // drops the propeller's triangles from its index, so nothing is duplicated;
  // the propeller gets its own small buffer, already in the aeroplane's frame
  // and already relative to its hub, so turning it about Z turns it about the
  // crankshaft.
  const cut = nosePositive ? points.max[fuselage] - propDepth
    : points.min[fuselage] + propDepth;
  const isProp = (index) => (nosePositive
    ? attribute.getComponent(index, fuselage) >= cut
    : attribute.getComponent(index, fuselage) <= cut);
  const index = geometry.index;
  const total = index ? index.count : attribute.count;
  const bodyIndices = [];
  const propIndices = [];
  for (let triangle = 0; triangle < total; triangle += 3) {
    const a = index ? index.getX(triangle) : triangle;
    const b = index ? index.getX(triangle + 1) : triangle + 1;
    const c = index ? index.getX(triangle + 2) : triangle + 2;
    (isProp(a) && isProp(b) && isProp(c) ? propIndices : bodyIndices).push(a, b, c);
  }
  if (!propIndices.length) return { visual, prop: null, propDisc: null };

  const toWorldMatrix = mesh.matrixWorld.clone();
  const intoRoot = new THREE.Matrix4().copy(root.matrixWorld).invert().multiply(toWorldMatrix);
  const remap = new Map();
  const propPositions = [];
  const propNormals = [];
  const propUvs = [];
  const normalAttribute = geometry.attributes.normal;
  const uvAttribute = geometry.attributes.uv;
  const point = new THREE.Vector3();
  const normalMatrix = new THREE.Matrix3().getNormalMatrix(intoRoot);
  for (const vertex of propIndices) {
    if (remap.has(vertex)) continue;
    remap.set(vertex, remap.size);
    point.fromBufferAttribute(attribute, vertex).applyMatrix4(intoRoot);
    propPositions.push(point.x, point.y, point.z);
    if (normalAttribute) {
      point.fromBufferAttribute(normalAttribute, vertex).applyMatrix3(normalMatrix).normalize();
      propNormals.push(point.x, point.y, point.z);
    }
    if (uvAttribute) propUvs.push(uvAttribute.getX(vertex), uvAttribute.getY(vertex));
  }
  // The hub: the middle of the blade across the disc, at its aftmost station,
  // which is where a spinner meets the cowling.
  let hubX = 0;
  let hubY = 0;
  // With the nose down -Z, the aftmost station of the blade is its largest z:
  // that is where a spinner meets the cowling, and where the shaft is.
  let hubZ = -Infinity;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let vertex = 0; vertex < propPositions.length; vertex += 3) {
    minX = Math.min(minX, propPositions[vertex]);
    maxX = Math.max(maxX, propPositions[vertex]);
    minY = Math.min(minY, propPositions[vertex + 1]);
    maxY = Math.max(maxY, propPositions[vertex + 1]);
    hubZ = Math.max(hubZ, propPositions[vertex + 2]);
  }
  hubX = (minX + maxX) * 0.5;
  hubY = (minY + maxY) * 0.5;
  let radius = 0;
  for (let vertex = 0; vertex < propPositions.length; vertex += 3) {
    propPositions[vertex] -= hubX;
    propPositions[vertex + 1] -= hubY;
    propPositions[vertex + 2] -= hubZ;
    radius = Math.max(radius, Math.hypot(propPositions[vertex], propPositions[vertex + 1]));
  }

  geometry.setIndex(bodyIndices);
  mesh.name = 'Plane_Body';

  const propGeometry = new THREE.BufferGeometry();
  propGeometry.setAttribute('position',
    new THREE.Float32BufferAttribute(propPositions, 3));
  if (propNormals.length) {
    propGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(propNormals, 3));
  }
  if (propUvs.length) propGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(propUvs, 2));
  propGeometry.setIndex(propIndices.map((vertex) => remap.get(vertex)));
  propGeometry.computeBoundingSphere();
  const prop = new THREE.Mesh(propGeometry, mesh.material);
  prop.name = 'Plane_Prop';
  prop.position.set(hubX, hubY, hubZ);
  prop.castShadow = mesh.castShadow;
  root.add(prop);

  // What a turning propeller actually looks like: the blades, and the disc
  // they smear into. The disc fades up with power rather than switching on.
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(radius * 0.98, 24),
    new THREE.MeshBasicMaterial({
      color: 0x9aa3ad, transparent: true, opacity: 0, depthWrite: false,
      side: THREE.DoubleSide,
    }));
  disc.name = 'Disc_Blur';
  disc.position.set(hubX, hubY, hubZ - radius * 0.06);
  disc.visible = false;
  root.add(disc);
  return { visual, prop, propDisc: disc, radius };
}

export function createAircraft({ scene, colliders, assets, place, addInteraction,
  position = [0, 0, 0], heading = 0, name = 'Aircraft', label = 'LIGHT AIRCRAFT' }) {
  const suppliedAircraft = !!assets.rafAircraft;
  const source = assets.rafAircraft || assets.lightAircraft;
  if (!source) return null;

  const root = place(source, scene, position, [0, heading, 0], 1, { collide: false });
  root.name = name;

  if (suppliedAircraft) rigSuppliedAircraft(root);

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

  const gearHeight = suppliedAircraft ? 0 : GEAR_HEIGHT;
  const state = {
    position: new THREE.Vector3(position[0], position[1] + gearHeight, position[2]),
    velocity: new THREE.Vector3(),
    quaternion: new THREE.Quaternion().setFromAxisAngle(_up, heading),
    throttle: 0,
    airspeed: 0,
    altitude: 0,
    alpha: 0,
    slip: 0,
    stalled: false,
    grounded: true,
    occupied: false,
    propSpin: 0,
    impact: 0,
    controls: { pitch: 0, roll: 0, yaw: 0 },
  };
  root.position.copy(state.position);

  // Parked, it is something you walk around; flown, its own hull must not be
  // the first thing it hits.
  //
  // This used to be one box 11.6 m across, drawn round the wingtips — which
  // made the aeroplane unreachable. The prompt to get in reaches 3.15 m and
  // needs the player within 4.24 m of the model's origin, and the box held
  // them 6.16 m away from the centreline on every side, so there was no
  // standing position anywhere on the airfield from which you could board it.
  // What is actually solid is the fuselage. The wings sit 2.36 m off the
  // ground at the root and higher outboard, so you walk under them, which is
  // what you do to reach the door of a real high-wing single.
  const HULL_AT = new THREE.Vector3(0, 0, 0.75);   // fuselage centre, not the origin
  const hull = colliders.addOrientedBox({
    cx: state.position.x, cz: state.position.z,
    halfX: 0.82, halfZ: 4.15, rotationY: heading, minY: 0.2, maxY: 2.4,
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
  const _hullCentre = new THREE.Vector3();
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
    state.altitude = state.position.y - gearHeight - ground;

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

    // How much of the airflow is coming across the aeroplane rather than down
    // its nose. Zero in honest flight; large in a skid.
    const slip = speed > 1.2 ? THREE.MathUtils.clamp(_flow.dot(_right), -1, 1) : 0;
    state.slip = slip;
    if (slip) _force.addScaledVector(_right, -q * SIDE_AREA * CY_SLIP * slip);

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
      roll -= bank * ROLL_LEVEL
        * Math.max(0, 1 - Math.abs(state.controls.roll) * ROLL_HANDS_OFF);
      const steep = Math.abs(bank) - BANK_SOFT;
      if (steep > 0) roll -= Math.sign(bank) * steep * BANK_HOLD;
      pitch -= (state.alpha - TRIM_ALPHA) * PITCH_STABILITY * bite;
      // A banked wing turns, and the rate a coordinated turn needs is not a
      // matter of taste: it is g tan(bank) over the airspeed. The old constant
      // coefficient was right at exactly one bank angle and one speed and
      // over-yawed everywhere else, which put fifteen degrees of slip into a
      // medium turn all by itself. This is the rudder nobody wants to have to
      // coordinate on a keyboard, applied in the amount a rudder is worth.
      const turnRate = speed > 8
        ? GRAVITY * Math.tan(THREE.MathUtils.clamp(bank, -1.25, 1.25)) / speed : 0;
      yaw -= turnRate;
      // And the fin brings the nose back into the airflow, which is what stops
      // the turn being a slide. The sign matters more than the size: subtract
      // it instead of adding it and the fin drives the slip rather than
      // killing it, which is directional instability - the aeroplane departs
      // sideways, loses all its speed and falls out of the sky pointing eighty
      // degrees off its own flight path.
      //
      // Positive slip is airflow coming across from the right, and yaw is
      // applied about world up as -yaw, which swings the nose right for
      // positive yaw. So the nose chases the airflow when this is added.
      yaw += slip * WEATHERCOCK * bite;
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
    const floor = groundAt(state.position.x, state.position.z) + gearHeight;
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
    axes();
    toWorld(HULL_AT, _hullCentre);
    hull.cx = _hullCentre.x;
    hull.cz = _hullCentre.z;
    const facing = Math.atan2(-_forward.x, -_forward.z);
    hull.cos = Math.cos(facing);
    hull.sin = Math.sin(facing);
    hull.enabled = !state.occupied && state.grounded;

    // The propeller.
    //
    // Two things were wrong with it. It turned whether or not anybody was in
    // the aeroplane, so a parked one sat on the apron with its engine
    // apparently running; and it turned at up to 190 rad/s, which at sixty
    // frames a second is 181 degrees a frame. A two-blade propeller repeats
    // every 180, so the blades landed almost exactly back where they started
    // each frame and the whole thing crawled, stopped and ran backwards —
    // the wagon-wheel effect, and there is no frame rate at which it looks
    // like anything but a fault.
    //
    // So the blades never turn fast enough to alias, and the disc they blur
    // into fades up with the power rather than being switched on at a
    // threshold. Both are drawn at once, which is what a propeller under
    // power actually looks like.
    const running = state.occupied;
    if (running) {
      state.propSpin = (state.propSpin + dt * (9 + state.throttle * 17)) % (Math.PI * 2);
    }
    if (prop) {
      prop.rotation.z = state.propSpin;
      prop.visible = true;
    }
    const blur = running
      ? THREE.MathUtils.smoothstep(state.throttle, 0.10, 0.62) : 0;
    if (propDisc) {
      propDisc.visible = blur > 0.02;
      propDisc.traverse((part) => {
        if (part.material) {
          part.material.transparent = true;
          part.material.opacity = blur * 0.30;
          part.material.depthWrite = false;
        }
      });
    }
    if (aileronL) aileronL.rotation.x = state.controls.roll * 0.42;
    if (aileronR) aileronR.rotation.x = -state.controls.roll * 0.42;
    if (elevator) elevator.rotation.x = -state.controls.pitch * 0.40;
    if (rudder) rudder.rotation.y = -state.controls.yaw * 0.44;
    if (noseWheel) noseWheel.rotation.y = state.controls.yaw * 0.44;
    for (const wheel of wheels) wheel.rotation.x -= (state.grounded ? speed : 0) * dt * 2.6;

    return speed;
  }

  // The model carries an empty on the pilot's eye. Trust it over the
  // constant: the constant is only a fallback for a model that has not
  // got one, and a cabin that moves in Blender should not need a code
  // change here to keep the pilot's head in it.
  const eyeAt = seat ? seat.position.clone() : (suppliedAircraft ? RAF_EYE : EYE);
  const pilotEye = (target = new THREE.Vector3()) => toWorld(eyeAt, target);

  /** Where the pilot stands when they climb out. */
  function doorstep() {
    const point = toWorld(door ? door.position : (suppliedAircraft ? RAF_DOOR : DOOR),
      new THREE.Vector3());
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

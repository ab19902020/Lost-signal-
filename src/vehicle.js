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
const WHEEL_RADIUS = 0.281;     // the rigged tyre's actual radius, so the
                                // tread turns at the speed of the road under it
const HALF_LENGTH = 2.10;
const HALF_WIDTH = 0.86;
// The body is tested as three circles down its spine rather than one big one:
// a single circle either lets the nose through the fence or refuses to fit
// through the gate.
const PROBE_Z = [-1.40, 0, 1.40];
const PROBE_RADIUS = 0.82;

const _boardingLocal = new THREE.Vector3();

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

// Running someone over.
//
// The collision set is made of boxes that were placed once and never move, so
// people are not in it: the car drove through the two men in the yard and they
// drove through the player. A person is not scenery, though - hitting one is
// the most consequential thing a car in this game can do, in either direction.
//
// The test is a rectangle in the car's own frame rather than a circle around
// it. An Escort is four metres long and one and three quarters wide, and a man
// standing beside the door is not in the same danger as a man in front of the
// bumper.
const STRIKE_SPEED = 2.2;      // m/s; below walking pace it is a nudge
const STRIKE_LETHAL = 6.5;     // m/s, about fifteen miles an hour
const STRIKE_COOLDOWN = 0.85;  // seconds before the same body can be hit again

// The cabin the scan does not have.
//
// A photogrammetry car is a skin. Cut its windows open and you are looking at
// the inside of the far door, or straight out the other side, and anyone
// sitting in it reads as floating in a glass box. So the inside is built: a
// floor, a bulkhead behind the seats, a dash, and two seats to sit on. It is
// eighteen boxes and it never moves relative to the body, so it costs a draw
// call and nothing else - but it is the difference between glass you can see
// through and glass you can see nothing through.
// Very dark, and matte. Looking into a car from outside on a bright day, the
// interior reads as nearly black behind the glass - anything lighter than this
// turns the cabin into a stack of grey boxes sitting in a greenhouse.
const CABIN_DARK = new THREE.MeshStandardMaterial({
  name: 'Ford_Escort_Cabin', color: 0x0b0c0e, roughness: 0.97, metalness: 0.0,
});
const CABIN_TRIM = new THREE.MeshStandardMaterial({
  name: 'Ford_Escort_Trim', color: 0x121317, roughness: 0.94, metalness: 0.0,
});
// Two separate passes lift crushed blacks out of the surface so a dark prop
// under a moon does not read as a hole cut in the picture. Both are right for
// what they were written for and both are wrong here: an unlit cabin behind
// glass is meant to be nearly black, and lifting it is what turned the
// interior into a stack of grey boxes sitting in a greenhouse.
CABIN_DARK.userData.lsKeepDark = true;
CABIN_TRIM.userData.lsKeepDark = true;

// Where a person's backside goes, in the body's own frame. Right-hand drive:
// the driver sits on +X, which is the same side EYE and DOOR are on.
export const SEAT_HEIGHT = 0.52;
// How much headroom there is over a seat is not the height of the car. The
// Escort's highest point is over the rear of its roof; above the front seats
// the roof has already started to fall away towards the windscreen, and the
// difference is four and a half centimetres - which is exactly enough for two
// heads to come through it while every number says they are inside the car.
// So it is measured off the shell, over the seats, rather than assumed.
const HEAD_CLEARANCE = 0.03;
export let CABIN_HEADROOM = 1.34;
export const SEAT_Z = -0.16;
export const SEAT_X = 0.36;
const FLOOR = 0.26;
const CABIN_WIDTH = 1.24;
// Where the glass starts. Nothing solid goes above it but the wheel.
const BELTLINE = 0.76;
const WHEEL_Y = 0.85;
const WHEEL_Z = -0.50;
const WHEEL_RIM = 0.19;    // a 380 mm wheel, which is what the car had

function box(parent, material, [w, h, d], [x, y, z], tilt = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.rotation.x = tilt;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  // The interior is scenery, not cover: a round that goes through the window
  // should reach the man behind it, not stop on the dashboard in front of him.
  mesh.userData.skipBallistics = true;
  parent.add(mesh);
  return mesh;
}

// The lowest the roof gets anywhere a head might be: sampled over both seats
// and the space between them, straight off the shell's own triangles.
const _roofA = new THREE.Vector3();
const _roofB = new THREE.Vector3();
const _roofC = new THREE.Vector3();
function measureHeadroom(shell) {
  const geometry = shell?.geometry;
  const position = geometry?.attributes?.position;
  if (!position) return null;
  const index = geometry.index;
  const count = index ? index.count : position.count;
  // Where the tops of their heads actually are, in the body's own frame.
  const columns = [[SEAT_X, SEAT_Z], [-SEAT_X, SEAT_Z], [0, SEAT_Z],
    [SEAT_X, SEAT_Z - 0.12], [-SEAT_X, SEAT_Z - 0.12]];
  const roof = columns.map(() => -Infinity);
  for (let triangle = 0; triangle < count; triangle += 3) {
    const a = index ? index.getX(triangle) : triangle;
    const b = index ? index.getX(triangle + 1) : triangle + 1;
    const c = index ? index.getX(triangle + 2) : triangle + 2;
    _roofA.fromBufferAttribute(position, a);
    _roofB.fromBufferAttribute(position, b);
    _roofC.fromBufferAttribute(position, c);
    const minX = Math.min(_roofA.x, _roofB.x, _roofC.x);
    const maxX = Math.max(_roofA.x, _roofB.x, _roofC.x);
    const minZ = Math.min(_roofA.z, _roofB.z, _roofC.z);
    const maxZ = Math.max(_roofA.z, _roofB.z, _roofC.z);
    const top = Math.max(_roofA.y, _roofB.y, _roofC.y);
    for (let column = 0; column < columns.length; column++) {
      const [x, z] = columns[column];
      if (x < minX || x > maxX || z < minZ || z > maxZ) continue;
      if (top > roof[column]) roof[column] = top;
    }
  }
  const lowest = Math.min(...roof.filter(Number.isFinite));
  return Number.isFinite(lowest) ? lowest - HEAD_CLEARANCE : null;
}

function buildCabin(parent) {
  const cabin = new THREE.Group();
  cabin.name = 'Car_Cabin';
  // Everything here stops at the beltline.
  //
  // The first version built a full interior - seat backs, headrests, a
  // dashboard top, door cards to shoulder height - and it was a mistake you
  // could see from thirty metres. Cutting the windows open and then filling
  // them with grey blocks is worse than not cutting them: the car read as a
  // greenhouse with a stack of boxes in it, and the two men you had gone to
  // the trouble of seating were competing with furniture for the view.
  //
  // Below the glass it is doing the only job it needs to do, which is stop
  // you seeing daylight through the bottom of the car. Above the glass the
  // only things left are the two men and the wheel one of them is holding,
  // which is all there was ever any reason to see.
  const beam = (material, [w, h, d], [x, y, z], tilt = 0) => {
    const top = y + h / 2;
    return box(cabin, material, [w, h, d],
      [x, top > BELTLINE ? BELTLINE - h / 2 : y, z], tilt);
  };
  // Floor, transmission tunnel and the bulkhead behind the seats.
  beam(CABIN_DARK, [CABIN_WIDTH, 0.05, 2.05], [0, FLOOR, -0.10]);
  beam(CABIN_DARK, [0.26, 0.16, 1.90], [0, FLOOR + 0.07, -0.10]);
  beam(CABIN_DARK, [CABIN_WIDTH, 0.44, 0.07], [0, 0.54, 0.92]);
  // Dashboard and centre stack, up against the base of the windscreen.
  beam(CABIN_TRIM, [CABIN_WIDTH, 0.28, 0.34], [0, 0.62, -1.10]);
  beam(CABIN_DARK, [0.34, 0.26, 0.18], [0, 0.54, -0.96]);
  // Door cards, so the inside of a door is a door.
  for (const side of [-1, 1]) {
    beam(CABIN_TRIM, [0.05, 0.32, 1.30], [side * (CABIN_WIDTH * 0.5 - 0.02), 0.58, -0.30]);
  }
  // Seats: a cushion to sit on and as much back as fits under the glass.
  for (const side of [-1, 1]) {
    beam(CABIN_TRIM, [0.48, 0.12, 0.50], [side * SEAT_X, SEAT_HEIGHT - 0.06, SEAT_Z]);
    beam(CABIN_TRIM, [0.48, 0.34, 0.12], [side * SEAT_X, SEAT_HEIGHT + 0.14, SEAT_Z + 0.30], -0.16);
  }
  beam(CABIN_TRIM, [CABIN_WIDTH - 0.14, 0.12, 0.44], [0, SEAT_HEIGHT - 0.08, 0.62]);
  beam(CABIN_TRIM, [CABIN_WIDTH - 0.14, 0.30, 0.10], [0, SEAT_HEIGHT + 0.14, 0.86], -0.12);
  // The wheel is the one thing that belongs above the glass line, because a
  // driver with his hands on nothing is worse than no wheel at all. It goes
  // where his hands actually come to rest, measured off the seated pose,
  // rather than where a catalogue would put it.
  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.36, 8), CABIN_DARK);
  column.rotation.set(1.22, 0, 0);
  column.position.set(SEAT_X, 0.82, -0.64);
  column.userData.skipBallistics = true;
  cabin.add(column);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(WHEEL_RIM, 0.016, 6, 20), CABIN_DARK);
  rim.name = 'Car_SteeringWheel';
  rim.rotation.set(1.22, 0, 0);
  rim.position.set(SEAT_X, WHEEL_Y, WHEEL_Z);
  rim.userData.skipBallistics = true;
  cabin.add(rim);
  parent.add(cabin);
  return cabin;
}

// What makes one vehicle different from another.
//
// The controller is the same for anything with four wheels and a steering
// rack; the numbers are not. An eight-tonne army truck is three metres longer
// than the Escort, twice as wide across the probes, geared to a third of the
// speed and does not have a glasshouse worth cutting open. Everything the code
// used to take from a module constant now comes from here, and the Escort's
// own values are the defaults, so nothing about it changes.
export const ESCORT_SPEC = Object.freeze({
  halfLength: 2.10, halfWidth: 0.86,
  probeZ: Object.freeze([-1.40, 0, 1.40]), probeRadius: 0.82,
  wheelbase: 2.48, track: 1.44, wheelRadius: 0.281,
  topSpeed: TOP_SPEED, reverseSpeed: REVERSE_SPEED, engine: ENGINE, brake: BRAKE,
  drag: DRAG, roll: ROLL, gearLimits: GEAR_LIMITS, gearTorque: GEAR_TORQUE,
  maxSteer: MAX_STEER, gripSpeed: GRIP_SPEED,
  eye: Object.freeze([0.40, 1.30, -0.28]), door: Object.freeze([1.62, 0, -0.20]),
  hullMinY: 0.18, hullMaxY: 1.62,
  glass: true, cabin: true, lamps: true,
});

// The Bedford in the compound. Long, wide, tall, slow and geared like a lorry:
// it will not out-run anything, but nothing it hits is going to stop it.
//
// Every dimension here is read off the rigged model rather than off a
// specification sheet, because what the controller has to agree with is the
// thing on the screen. The first pass at this inherited the Escort's numbers
// wholesale and got two of them badly wrong: a wheelbase 17 cm shorter than
// the truck's, which made the steering geometry scrub, and a driver's seat on
// the right - the Bedford is left-hand drive, so the player sat in the
// passenger seat looking at a steering wheel a metre away, and both men who
// stole it queued at the wrong door.
//
// The rear pair is a bogie, so the wheelbase that matters for steering is from
// the front axle to the middle of the two behind it, not to the last one.
export const TRUCK_SPEC = Object.freeze({
  ...ESCORT_SPEC,
  halfLength: 3.55, halfWidth: 1.31,
  probeZ: Object.freeze([-2.40, -0.8, 0.8, 2.40]), probeRadius: 1.26,
  wheelbase: 4.22, track: 2.06, wheelRadius: 0.531,
  topSpeed: 24.0, reverseSpeed: 6.0, engine: 3.4, brake: 8.5,
  drag: 0.0030, roll: 1.35,
  gearLimits: Object.freeze([5.0, 9.0, 14.0, 19.0, 24.0]),
  gearTorque: Object.freeze([1.30, 1.05, 0.82, 0.62, 0.46]),
  maxSteer: 0.52, gripSpeed: 6.0,
  // Behind and above the wheel, which sits at (-0.37, 1.81, -1.58): high in a
  // cab whose roof rail is at 2.30, and on the left, where the wheel is.
  eye: Object.freeze([-0.42, 2.12, -1.16]), door: Object.freeze([-1.95, 0, -1.16]),
  hullMinY: 0.20, hullMaxY: 2.99,
  glass: false, cabin: false, lamps: false,
});

// --- Rigging the supplied truck --------------------------------------------
//
// The Bedford is in some ways a better model than the Escort: six wheels in
// named groups that say front, middle and back, a steering linkage, a steering
// wheel in the cab. What it does not share is the convention. It is authored
// nose-down-X, and everything that drives in this game drives down -Z.
//
// The first version of this turned it by shape alone - longest horizontal axis
// is the chassis, so give it a quarter turn - and that is half an answer. The
// long axis says which way a lorry lies. It says nothing whatever about which
// end of it is the front, and the quarter turn it picked put the nose at +Z.
// The result was a four-tonne truck of exactly the right shape, the right size
// and the right way up, which drove away tail-first with its steering on the
// back axle. Nothing in the code read as wrong. You had to sit in it.
//
// So the nose is found rather than assumed, and found twice over: the model
// names its own axles, and failing names, the front axle is the one with the
// shorter overhang beyond it, which is how every lorry ever built is laid out.
const _rigBox = new THREE.Box3();
const _rigSize = new THREE.Vector3();
const _rigCentre = new THREE.Vector3();
const _rigVertex = new THREE.Vector3();
const _rigDir = new THREE.Vector3();
const _rigTurn = new THREE.Quaternion();

const WHEEL_WORD = /wheel/i;
const SIDE_WORD = /left|right/i;
// Front first: the order is the order they sit on the chassis.
const AXLE_WORDS = [/front/i, /middle|mid\b/i, /back|rear/i];

// Every road wheel is the same shape wherever it is bolted: a disc, thin
// across the vehicle and round in the other two axes, low down, and out at the
// edge of the body. Each of those is doing work here. A steering linkage is
// thin and low and outboard but not round; a cab bulkhead is round and thin
// but neither low nor outboard. Take any one test away and something that is
// not a wheel gets spun.
function roadWheels(root) {
  _rigBox.setFromObject(root);
  const floor = _rigBox.min.y;
  const height = Math.max(0.5, _rigBox.max.y - _rigBox.min.y);
  const body = _rigBox.getCenter(new THREE.Vector3());
  const span = _rigBox.getSize(new THREE.Vector3());
  const found = [];
  root.traverse((part) => {
    if (!part.isMesh) return;
    // A wheel and its hub are two meshes and they have to turn together, so
    // what is collected is the outermost node that is only ever this wheel.
    let node = part;
    while (node.parent && node.parent !== root
      && WHEEL_WORD.test(node.parent.name || '')) node = node.parent;
    if (found.some((disc) => disc.node === node)) return;
    _rigBox.setFromObject(node);
    _rigBox.getSize(_rigSize);
    _rigBox.getCenter(_rigCentre);
    const thinX = _rigSize.x < Math.min(_rigSize.y, _rigSize.z) * 0.75;
    const thinZ = _rigSize.z < Math.min(_rigSize.x, _rigSize.y) * 0.75;
    if (thinX === thinZ) return;
    const axis = thinX ? 'x' : 'z';
    const across = thinX ? _rigSize.z : _rigSize.x;
    if (Math.abs(_rigSize.y - across) > Math.max(_rigSize.y, across) * 0.35) return;
    if (_rigSize.y < height * 0.20) return;
    if (_rigCentre.y - floor > height * 0.40) return;
    if (Math.abs(_rigCentre[axis] - body[axis]) < span[axis] * 0.20) return;
    found.push({ node, axis, x: _rigCentre.x, z: _rigCentre.z });
  });
  return found;
}

/** Which axle a node says it is on, walking up for an ancestor that says so. */
function axleIndex(node, root) {
  for (let up = node; up && up !== root; up = up.parent) {
    const name = up.name || '';
    if (!WHEEL_WORD.test(name) || !SIDE_WORD.test(name)) continue;
    const at = AXLE_WORDS.findIndex((word) => word.test(name));
    if (at >= 0) return at;
  }
  return -1;
}

// Wrap a disc in a group whose local Z is the disc's own axis, so the thing
// can be spun about it. The controller turns a steering wheel with
// rotation.z, which is true of the Escort's because the Escort's was built
// here; this is what makes it true of a wheel nobody in this codebase
// modelled, on a column raked at whatever angle its author liked.
function alignSpinner(disc, root, name) {
  const position = disc.geometry?.attributes?.position;
  const parent = disc.parent;
  if (!position || !parent) return null;
  root.updateMatrixWorld(true);
  const toRoot = new THREE.Matrix4().copy(root.matrixWorld).invert().multiply(disc.matrixWorld);
  // The axis of a disc is the direction its points are least spread along.
  // Sampling the sphere beats reaching for an eigen solver for one hoop.
  const SAMPLES = 128;
  let best = null;
  for (let i = 0; i < SAMPLES; i++) {
    const y = 1 - (i / (SAMPLES - 1)) * 2;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const turn = i * Math.PI * (3 - Math.sqrt(5));
    _rigDir.set(Math.cos(turn) * ring, y, Math.sin(turn) * ring);
    let low = Infinity;
    let high = -Infinity;
    for (let at = 0; at < position.count; at++) {
      const reach = _rigVertex.fromBufferAttribute(position, at).applyMatrix4(toRoot).dot(_rigDir);
      if (reach < low) low = reach;
      if (reach > high) high = reach;
    }
    if (!best || high - low < best.spread) best = { spread: high - low, axis: _rigDir.clone() };
  }
  if (!best) return null;
  // Point it at the driver, which is the way the Escort's own wheel faces, so
  // that one expression turns both of them the same way round.
  if (best.axis.z < 0) best.axis.negate();
  // The axis was measured in the vehicle's frame; the group lives in the
  // wheel's parent, which on a supplied model is some group of the author's.
  const intoParent = parent.getWorldQuaternion(new THREE.Quaternion()).invert()
    .multiply(root.getWorldQuaternion(_rigTurn));
  const spinner = new THREE.Group();
  spinner.name = name;
  spinner.position.copy(disc.position);
  spinner.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1),
    best.axis.applyQuaternion(intoParent).normalize());
  parent.add(spinner);
  spinner.add(disc);
  disc.position.set(0, 0, 0);
  disc.quaternion.premultiply(spinner.quaternion.clone().invert());
  return spinner;
}

export function rigSuppliedTruck(root, spec) {
  root.updateMatrixWorld(true);

  const visual = new THREE.Group();
  visual.name = 'Truck_Visual';
  for (const child of [...root.children]) visual.add(child);
  root.add(visual);
  root.updateMatrixWorld(true);

  const discs = roadWheels(visual);
  if (discs.length < 4) return null;

  // The axle line is the direction the hubs are strung out along, not the
  // bounding box - whose long axis on a lorry is the load bed, and on some
  // models the wing mirrors. Every wheel is thin across the vehicle, so the
  // wheels themselves say which way is along.
  const sideways = discs.filter((disc) => disc.axis === 'x').length > discs.length / 2 ? 'x' : 'z';
  const along = sideways === 'x' ? 'z' : 'x';
  const lengthwise = (disc) => disc[along];

  // Which end is the nose. Named axles answer it outright. Otherwise it is the
  // end whose outermost axle sits nearest the end of the bodywork, because a
  // lorry's front overhang is short and its rear overhang is not.
  const named = discs.map((disc) => axleIndex(disc.node, visual));
  const namedAll = named.every((at) => at >= 0) && Math.max(...named) > Math.min(...named);
  let noseSign;
  if (namedAll) {
    const frontmost = Math.min(...named);
    const mean = (want) => {
      const on = discs.filter((_, at) => (named[at] === frontmost) === want);
      return on.reduce((sum, disc) => sum + lengthwise(disc), 0) / Math.max(1, on.length);
    };
    noseSign = Math.sign(mean(true) - mean(false)) || -1;
  } else {
    _rigBox.setFromObject(visual);
    const low = Math.min(...discs.map(lengthwise));
    const high = Math.max(...discs.map(lengthwise));
    noseSign = (low - _rigBox.min[along]) <= (_rigBox.max[along] - high) ? -1 : 1;
  }

  // Turn the nose onto -Z. Written as a heading, so a model that is not axis
  // aligned to begin with lands square as well.
  visual.rotation.y = Math.atan2(along === 'x' ? noseSign : 0, along === 'z' ? -noseSign : 0);
  root.updateMatrixWorld(true);

  _rigBox.setFromObject(visual);
  _rigBox.getSize(_rigSize);
  visual.scale.setScalar((spec.halfLength * 2) / Math.max(0.5, _rigSize.z));
  root.updateMatrixWorld(true);
  _rigBox.setFromObject(visual);
  visual.position.y -= _rigBox.min.y - root.position.y;
  _rigBox.getCenter(_rigCentre);
  visual.position.x -= _rigCentre.x - root.position.x;
  visual.position.z -= _rigCentre.z - root.position.z;
  root.updateMatrixWorld(true);

  // Name the wheels for where they have ended up rather than for what the
  // author called them: the front axle is at -Z because the nose is, and the
  // driver's right is +X, because that is what +X is when you face -Z.
  const placed = discs.map((disc) => {
    _rigBox.setFromObject(disc.node);
    _rigBox.getCenter(_rigCentre);
    return {
      node: disc.node,
      x: _rigCentre.x - root.position.x,
      z: _rigCentre.z - root.position.z,
      radius: (_rigBox.max.y - _rigBox.min.y) * 0.5,
    };
  }).sort((a, b) => a.z - b.z);
  // An axle is a pair at the same station down the chassis: anything within a
  // wheel's radius of the last one is on it.
  const axles = [];
  for (const wheel of placed) {
    const axle = axles[axles.length - 1];
    if (axle && Math.abs(wheel.z - axle.z) < wheel.radius) { axle.wheels.push(wheel); continue; }
    axles.push({ z: wheel.z, wheels: [wheel] });
  }
  const tags = axles.length > 2 ? ['F', 'M', 'R'] : ['F', 'R'];
  axles.forEach((axle, at) => {
    const tag = tags[Math.min(at, tags.length - 1)];
    for (const wheel of axle.wheels) {
      wheel.node.name = `Car_Wheel_${wheel.x < 0 ? 'L' : 'R'}${tag}`;
    }
  });

  const hoop = findNamed(visual, 'steering_wheel') || findNamed(visual, 'SteeringWheel');
  if (hoop?.isMesh) alignSpinner(hoop, root, 'Car_SteeringWheel');

  // What the rig believed, kept for the harness that checks it drove the right
  // way out of the yard.
  root.userData.rig = {
    wheels: placed.length,
    axles: axles.length,
    wheelRadius: placed.reduce((sum, w) => sum + w.radius, 0) / placed.length,
    wheelbase: axles.length ? Math.abs(axles[axles.length - 1].z - axles[0].z) : 0,
    track: Math.max(...placed.map((w) => Math.abs(w.x))) * 2,
    along, noseSign, named: namedAll,
    steeringWheel: !!hoop,
  };
  return visual;
}

export function createVehicle({ scene, colliders, assets, place, addInteraction,
  position = [0, 0, 0], heading = 0, name = 'Car', label = 'FORD ESCORT RS TURBO',
  spec = ESCORT_SPEC, asset = null, rig = null }) {
  const source = asset ? assets[asset] : (assets.carDrivable || assets.estateCar);
  if (!source) return null;
  const HALF_LENGTH = spec.halfLength;
  const HALF_WIDTH = spec.halfWidth;
  const PROBE_Z = spec.probeZ;
  const PROBE_RADIUS = spec.probeRadius;
  const WHEELBASE = spec.wheelbase;
  const WHEEL_RADIUS = spec.wheelRadius;
  const TOP_SPEED = spec.topSpeed;
  const REVERSE_SPEED = spec.reverseSpeed;
  const ENGINE = spec.engine;
  const BRAKE = spec.brake;
  const DRAG = spec.drag;
  const ROLL = spec.roll;
  const GEAR_LIMITS = spec.gearLimits;
  const GEAR_TORQUE = spec.gearTorque;
  const MAX_STEER = spec.maxSteer;
  const GRIP_SPEED = spec.gripSpeed;
  const EYE = new THREE.Vector3(...spec.eye);
  const DOOR = new THREE.Vector3(...spec.door);

  const root = place(source, scene, position, [0, heading, 0], 1, { collide: false });
  root.name = name;
  root.userData.make = VEHICLE_SPEC.make;
  root.userData.model = VEHICLE_SPEC.model;
  root.userData.drivenAxle = VEHICLE_SPEC.drivenAxle;

  // Keep the uploaded scan's actual PBR paint, trim, cabin and wheel texture.
  // Every moving part uses the same supplied material so the extracted pivots
  // remain visually continuous with the fused body.

  // Anything that is not already built to the Escort's part names gets rigged
  // on the way in: turned to face down -Z, scaled, and its wheels named.
  if (rig) rig(root, spec);
  const shell = findNamed(root, 'Car_Shell') || root;
  // Four on a car, six on the Bedford. The first two are the steered pair and
  // everything after them just rolls, so a middle axle costs one more entry
  // here and nothing else anywhere.
  const wheels = ['LF', 'RF', 'LM', 'RM', 'LR', 'RR']
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

  // The glasshouse, cut out of the scan by tools/split_escort_glass.py. The
  // upload had the windows painted onto a closed shell, so there was nothing
  // to see through and no way to see who was driving your car away.
  const glass = spec.glass ? findNamed(root, 'Car_Glass') : null;
  if (glass?.material) {
    glass.material = glass.material.clone();
    glass.material.name = 'Ford_Escort_Glass';
    glass.material.transparent = true;
    // Glass does not occlude what is behind it, and a transparent surface that
    // writes depth hides the two men sitting the other side of it.
    glass.material.depthWrite = false;
    glass.material.side = THREE.DoubleSide;
    glass.castShadow = false;
    glass.receiveShadow = false;
    // Rounds go through a window; they do not stop at one. Ballistics skips it
    // so aiming at a head through the windscreen hits the head.
    glass.userData.skipBallistics = true;
    glass.userData.carGlass = true;
    glass.renderOrder = 2;
  }

  // Something to see when you look through it. The scan is a hollow skin, so
  // without this the cabin is a hole you can see the far door through, and two
  // men sitting in it would appear to float in mid-air.
  const cabin = spec.cabin ? buildCabin(shell || root) : null;
  const headroom = spec.cabin ? measureHeadroom(shell) : null;
  if (headroom) CABIN_HEADROOM = headroom;
  // The wheel comes from the cabin, so it has to be found after the cabin is
  // built. The scan has no interior of its own to take one from.
  const steeringWheel = findNamed(root, 'Car_SteeringWheel');
  const steeringWheelRest = steeringWheel?.rotation.z || 0;

  // Lamps. The glass is modelled; the light and the glow are runtime, so a car
  // at night has beams on the road instead of two painted white circles.
  const headLamps = [];
  const tailLamps = [];
  if (spec.lamps) root.traverse((part) => {
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
  for (const side of spec.lamps ? [-1, 1] : []) {
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
    rotationY: heading, minY: spec.hullMinY, maxY: spec.hullMaxY,
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

  // Who is standing where this car is going. The world supplies them; the car
  // does not know or care what they are, only where they are, how wide, and
  // what to call when it hits one.
  let bystanders = null;
  function setBystanders(source) { bystanders = source; }

  const struckRecently = new Map();

  function strike(dt) {
    for (const [victim, wait] of struckRecently) {
      if (wait <= dt) struckRecently.delete(victim); else struckRecently.set(victim, wait - dt);
    }
    const speed = Math.abs(state.speed);
    if (!bystanders || speed < STRIKE_SPEED) return;
    const list = bystanders();
    if (!list?.length) return;
    const sin = Math.sin(state.heading);
    const cos = Math.cos(state.heading);
    for (const victim of list) {
      const point = victim.position;
      if (!point || struckRecently.has(victim.id ?? victim)) continue;
      const dx = point.x - state.x;
      const dz = point.z - state.z;
      // Into the car's frame. The nose is at -Z, so a positive closing speed
      // and a negative local Z is the bumper.
      const across = dx * cos - dz * sin;
      const along = dx * sin + dz * cos;
      const radius = victim.radius ?? 0.34;
      if (Math.abs(across) > HALF_WIDTH + radius) continue;
      if (Math.abs(along) > HALF_LENGTH + radius) continue;
      // Standing on the roof is not being run over.
      if (Math.abs((point.y ?? state.y) - state.y) > 1.9) continue;
      struckRecently.set(victim.id ?? victim, STRIKE_COOLDOWN);
      // Away from the car, along whichever way it is travelling.
      const push = Math.sign(state.speed) || 1;
      victim.struck?.(speed, -sin * push, -cos * push, speed >= STRIKE_LETHAL);
      // Hitting a person is not hitting a wall: the car is checked, not
      // stopped, and the bang the player hears is a body rather than a fence.
      state.speed *= speed > STRIKE_LETHAL ? 0.86 : 0.62;
      state.impact = Math.max(state.impact, speed * 0.45);
    }
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

    strike(dt);

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
  /**
   * Where somebody stands to get in on one side or the other.
   *
   * The player only ever uses the driver's door, but the two men who steal the
   * car need one door each and they need to arrive at the right one, or they
   * both walk to the same handle and shove each other.
   */
  function boardingPoint(side = 'driver') {
    const local = _boardingLocal.copy(DOOR);
    if (side !== 'driver') local.x = -local.x;
    const point = toWorld(local, state.x, state.z, new THREE.Vector3());
    point.y = groundAt(point.x, point.z);
    return point;
  }

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
    root, state, update, seat, doorstep, boardingPoint, takeImpact, setBystanders,
    // Measured off this car's own roof, over its own seats.
    headroom: headroom || CABIN_HEADROOM,
    // What this vehicle is, so a harness can test it as itself rather than as
    // an Escort with a different body on it.
    spec,
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

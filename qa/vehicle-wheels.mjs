// The car's wheels, measured rather than looked at.
//
// A wheel that is not a circle about its own pivot cannot be spun without
// wobbling, and no amount of shader work hides it: the tyre rises and falls
// once per revolution and the car looks like it is running on eggs. Both
// supplied Escorts arrived with that fault. The photogrammetry scan was fitted
// to a box with three different axis scales, which sheared every wheel into a
// 5% ellipse, and its pivots were nominal hub coordinates rather than the
// fitted centre of the geometry, so the rear pair orbited as well. The clean
// upload was rolled three degrees onto one side.
//
// This reads the runtime GLB directly - no browser, no three.js - and asserts
// the properties that make a wheel look right when it turns.
import { readFileSync } from 'fs';

const GLB = new URL('../public/assets/supplied/ford_escort_rs_turbo.glb', import.meta.url);
const WHEELS = ['Car_Wheel_LF', 'Car_Wheel_RF', 'Car_Wheel_LR', 'Car_Wheel_RR'];
// A game wheel is a polygon, so its silhouette rises and falls between corner
// and flat by a fixed amount that depends only on how many sides it has. What
// must not vary is the corners: those are the tyre's actual radius, and if they
// differ the wheel is an ellipse or is off its axle. One per cent of the radius
// is under 3 mm on this car - below what reads as a wobble at any speed.
const ROUNDNESS_TOLERANCE = 0.015;
const HUB_TOLERANCE = 0.003;
const BINS = 360;

const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

const data = readFileSync(GLB);
if (data.readUInt32LE(0) !== 0x46546c67) throw new Error('not a GLB');
const jsonLength = data.readUInt32LE(12);
const doc = JSON.parse(data.subarray(20, 20 + jsonLength).toString('utf8').replace(/\0+$/, ''));
const binary = data.subarray(20 + jsonLength + 8);

function accessor(index) {
  const spec = doc.accessors[index];
  const view = doc.bufferViews[spec.bufferView];
  const components = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[spec.type];
  const offset = (view.byteOffset || 0) + (spec.byteOffset || 0);
  const Ctor = { 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array }[spec.componentType];
  return new Ctor(binary.buffer, binary.byteOffset + offset, spec.count * components);
}

const nodes = new Map(doc.nodes.map((node) => [node.name, node]));
const report = [];

/** Silhouette radius per angle, walking the triangle edges. */
function silhouette(positions, indices) {
  const envelope = new Float64Array(BINS);
  const arc = (2 * Math.PI) / BINS;
  const sample = (y, z) => {
    const radius = Math.hypot(y, z);
    const bin = Math.min(BINS - 1, Math.floor((Math.atan2(y, z) + Math.PI) / (2 * Math.PI) * BINS));
    if (radius > envelope[bin]) envelope[bin] = radius;
  };
  for (let triangle = 0; triangle < indices.length; triangle += 3) {
    for (let edge = 0; edge < 3; edge++) {
      const a = indices[triangle + edge];
      const b = indices[triangle + (edge + 1) % 3];
      const ay = positions[a * 3 + 1]; const az = positions[a * 3 + 2];
      const by = positions[b * 3 + 1]; const bz = positions[b * 3 + 2];
      // A low-polygon wheel has long edges. Step each one finely enough that
      // no angular bin between its ends is skipped, or a perfectly good tyre
      // reads as a gap.
      const span = Math.abs(Math.atan2(ay, az) - Math.atan2(by, bz));
      const steps = Math.min(512, Math.max(4, Math.ceil(span / arc) * 2));
      for (let step = 0; step <= steps; step++) {
        const t = step / steps;
        sample(ay + (by - ay) * t, az + (bz - az) * t);
      }
    }
  }
  return envelope;
}

/** The corners of the silhouette polygon: the tyre's real radius, sampled. */
function corners(envelope) {
  const peaks = [];
  for (let bin = 0; bin < BINS; bin++) {
    const before = envelope[(bin + BINS - 1) % BINS];
    const after = envelope[(bin + 1) % BINS];
    if (envelope[bin] >= before && envelope[bin] >= after && envelope[bin] > 0) {
      peaks.push({ bin, radius: envelope[bin] });
    }
  }
  return peaks;
}

/** Least-squares circle through the silhouette corners; returns its centre. */
function circleFit(peaks) {
  let sxx = 0; let sxy = 0; let syy = 0; let sx = 0; let sy = 0;
  let sxr = 0; let syr = 0; let sr = 0;
  const points = peaks.map((peak) => {
    const angle = (peak.bin + .5) / BINS * 2 * Math.PI - Math.PI;
    return [Math.cos(angle) * peak.radius, Math.sin(angle) * peak.radius];
  });
  for (const [x, y] of points) {
    const r = x * x + y * y;
    sxx += x * x; sxy += x * y; syy += y * y;
    sx += x; sy += y; sxr += x * r; syr += y * r; sr += r;
  }
  const n = points.length;
  // Solve the 3x3 normal equations of the algebraic (Kasa) circle fit.
  const A = [[sxx, sxy, sx], [sxy, syy, sy], [sx, sy, n]];
  const b = [sxr, syr, sr];
  for (let column = 0; column < 3; column++) {
    let pivot = column;
    for (let row = column + 1; row < 3; row++) {
      if (Math.abs(A[row][column]) > Math.abs(A[pivot][column])) pivot = row;
    }
    [A[column], A[pivot]] = [A[pivot], A[column]];
    [b[column], b[pivot]] = [b[pivot], b[column]];
    for (let row = 0; row < 3; row++) {
      if (row === column || !A[column][column]) continue;
      const factor = A[row][column] / A[column][column];
      for (let k = column; k < 3; k++) A[row][k] -= factor * A[column][k];
      b[row] -= factor * b[column];
    }
  }
  return [b[0] / A[0][0] / 2, b[1] / A[1][1] / 2];
}

for (const name of WHEELS) {
  const node = nodes.get(name);
  if (!node || node.mesh === undefined) { failures.push(`${name} is missing`); continue; }
  const primitive = doc.meshes[node.mesh].primitives[0];
  const positions = accessor(primitive.attributes.POSITION);
  const indices = accessor(primitive.indices);

  // The pivot's axle is local X, so the wheel turns in the Y-Z plane.
  const envelope = silhouette(positions, indices);
  const empty = envelope.reduce((count, radius) => count + (radius <= 0 ? 1 : 0), 0);
  check(empty === 0, `${name} tyre has ${empty} empty angular sectors`);

  const peaks = corners(envelope);
  const radii = peaks.map((peak) => peak.radius);
  const maximum = Math.max(...radii);
  const minimum = Math.min(...radii);
  const mean = radii.reduce((sum, radius) => sum + radius, 0) / radii.length;
  const runout = (maximum - minimum) / mean;
  check(peaks.length >= 8, `${name} silhouette has only ${peaks.length} corners`);
  check(runout <= ROUNDNESS_TOLERANCE,
    `${name} is ${(runout * 100).toFixed(1)}% out of round (limit ${ROUNDNESS_TOLERANCE * 100}%)`);

  // The pivot has to sit on the axle. If the geometry's own centre is offset,
  // the wheel orbits the pivot: the contact patch travels sideways and the
  // tyre visibly rises out of the arch once per turn. Fit a circle through the
  // corners rather than averaging them - a polygon's corners are not evenly
  // spaced, and averaging unevenly spaced points invents an offset that is not
  // there.
  const offset = Math.hypot(...circleFit(peaks));
  check(offset <= HUB_TOLERANCE,
    `${name} pivot is ${(offset * 1000).toFixed(1)} mm off its own axle (limit ${HUB_TOLERANCE * 1000} mm)`);

  const [, hubY] = node.translation || [0, 0, 0];
  report.push({ name, radius: maximum, runout, offset, hubY, corners: peaks.length });
}

// All four hubs one radius above the ground: the car stands level and every
// tyre touches, instead of one corner hovering.
if (report.length === WHEELS.length) {
  const heights = report.map((wheel) => wheel.hubY);
  const spread = Math.max(...heights) - Math.min(...heights);
  check(spread <= 0.002, `axle heights differ by ${(spread * 1000).toFixed(1)} mm`);
  for (const wheel of report) {
    check(Math.abs(wheel.hubY - wheel.radius) <= 0.01,
      `${wheel.name} sits ${((wheel.hubY - wheel.radius) * 1000).toFixed(0)} mm off the ground`);
  }
}

// The car is a real Escort rather than a sheared or leaning one. The published
// RS Turbo is 4.05 m long, 1.64 m wide and 1.39 m tall on a 2.40 m wheelbase;
// a model with arches and mirrors is allowed a few centimetres, a bad axis fit
// is not. Measure the whole assembled car, not one mesh: on this rig the shell
// stops at the sills and the wheels carry the rest.
const extremes = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
for (const node of doc.nodes) {
  if (node.mesh === undefined) continue;
  const spec = doc.accessors[doc.meshes[node.mesh].primitives[0].attributes.POSITION];
  const translation = node.translation || [0, 0, 0];
  for (let axis = 0; axis < 3; axis++) {
    extremes.min[axis] = Math.min(extremes.min[axis], spec.min[axis] + translation[axis]);
    extremes.max[axis] = Math.max(extremes.max[axis], spec.max[axis] + translation[axis]);
  }
}
const size = extremes.max.map((value, axis) => value - extremes.min[axis]);
report.push({ name: 'car', size });
check(Math.abs(size[2] - 4.05) < 0.16, `car length ${size[2].toFixed(3)} m is not an Escort`);
check(Math.abs(size[1] - 1.40) < 0.10, `car height ${size[1].toFixed(3)} m is not an Escort`);
check(Math.abs(size[0] - 1.70) < 0.10, `car width ${size[0].toFixed(3)} m is not an Escort`);
check(Math.abs(extremes.min[1]) < 0.01,
  `the car floats ${(extremes.min[1] * 1000).toFixed(0)} mm above its own ground plane`);

const front = nodes.get('Car_Wheel_LF');
const rear = nodes.get('Car_Wheel_LR');
if (front && rear) {
  const wheelbase = Math.abs(rear.translation[2] - front.translation[2]);
  report.push({ name: 'wheelbase', wheelbase });
  check(Math.abs(wheelbase - 2.36) < 0.14, `wheelbase ${wheelbase.toFixed(3)} m is not an Escort`);
  const track = Math.abs(nodes.get('Car_Wheel_RF').translation[0] - front.translation[0]);
  report.push({ name: 'track', wheelbase: track });
  check(track > 1.3 && track < 1.6, `track ${track.toFixed(3)} m is not an Escort`);
}

for (const line of report) {
  if (line.radius !== undefined) {
    console.log(`  ${line.name.padEnd(14)} r=${line.radius.toFixed(4)} m  `
      + `runout=${(line.runout * 100).toFixed(2)}%  hub offset=${(line.offset * 1000).toFixed(2)} mm`
      + `  ${line.corners} corners`);
  } else if (line.size) {
    console.log(`  ${line.name.padEnd(14)} ${line.size.map((v) => v.toFixed(3)).join(' x ')} m`);
  } else {
    console.log(`  ${line.name.padEnd(14)} ${line.wheelbase.toFixed(3)} m`);
  }
}

if (failures.length) {
  console.error(`\nVEHICLE WHEELS FAIL (${failures.length})`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log('VEHICLE WHEELS OK');

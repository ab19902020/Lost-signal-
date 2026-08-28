// The car's wheels, measured rather than looked at.
//
// A wheel that is not a circle about its own pivot cannot be spun without
// wobbling, and no amount of shader work hides it: the tyre rises and falls
// once per revolution and the car looks like it is running on eggs. The
// supplied scan arrived that way twice over — the rig fitted it to a fixed
// box with three different axis scales, which sheared every wheel into a 5%
// ellipse, and the pivots were nominal hub coordinates rather than the fitted
// centre of the geometry, so the rear pair orbited as well.
//
// This reads the runtime GLB directly (no browser, no three.js) and asserts
// the two properties that make a wheel look right when it turns.
import { readFileSync } from 'fs';

const GLB = new URL('../public/assets/supplied/ford_escort_rs_turbo.glb', import.meta.url);
const WHEELS = ['Car_Wheel_LF', 'Car_Wheel_RF', 'Car_Wheel_LR', 'Car_Wheel_RR'];
// A tyre reconstructed from photographs is never a perfect circle. Two per
// cent of the radius is about 6 mm on this car: below what reads as a wobble
// at any speed, and well inside what the scan itself can resolve. Before this
// was corrected the same measurement was 5.5%, and it showed.
const ROUNDNESS_TOLERANCE = 0.02;
const HUB_TOLERANCE = 0.002;

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

for (const name of WHEELS) {
  const node = nodes.get(name);
  if (!node || node.mesh === undefined) { failures.push(`${name} is missing`); continue; }
  const positions = accessor(doc.meshes[node.mesh].primitives[0].attributes.POSITION);

  // The pivot's axle is local X, so the wheel turns in the Y-Z plane. Walk the
  // triangle edges rather than the vertices: a decimated scan leaves whole
  // 2-degree sectors without a vertex on the tread crown, and reading those as
  // a dip would fail a perfectly round wheel. The edges cover every angle the
  // silhouette actually occupies.
  const indices = accessor(doc.meshes[node.mesh].primitives[0].indices);
  const bins = 180;
  const envelope = new Float64Array(bins);
  const at = (vertex, step) => {
    const y = positions[vertex * 3 + 1];
    const z = positions[vertex * 3 + 2];
    return [y, z, step];
  };
  for (let triangle = 0; triangle < indices.length; triangle += 3) {
    for (let edge = 0; edge < 3; edge++) {
      const [ay, az] = at(indices[triangle + edge]);
      const [by, bz] = at(indices[triangle + (edge + 1) % 3]);
      for (let step = 0; step <= 4; step++) {
        const t = step / 4;
        const y = ay + (by - ay) * t;
        const z = az + (bz - az) * t;
        const radius = Math.hypot(y, z);
        const bin = Math.min(bins - 1,
          Math.floor((Math.atan2(y, z) + Math.PI) / (2 * Math.PI) * bins));
        if (radius > envelope[bin]) envelope[bin] = radius;
      }
    }
  }
  let minimum = Infinity;
  let maximum = -Infinity;
  let sum = 0;
  let filled = 0;
  for (const radius of envelope) {
    if (radius <= 0) continue;
    sum += radius; filled++;
    if (radius < minimum) minimum = radius;
    if (radius > maximum) maximum = radius;
  }
  const mean = sum / Math.max(1, filled);
  const runout = (maximum - minimum) / mean;
  check(filled === bins, `${name} tyre has ${bins - filled} empty angular sectors`);
  check(runout <= ROUNDNESS_TOLERANCE,
    `${name} is ${(runout * 100).toFixed(1)}% out of round (limit ${ROUNDNESS_TOLERANCE * 100}%)`);

  // The pivot has to sit on the axle. If the geometry's own centre is offset,
  // the wheel orbits the pivot: the contact patch travels sideways and the
  // tyre visibly rises out of the arch once per turn.
  let cy = 0;
  let cz = 0;
  for (let bin = 0; bin < bins; bin++) {
    const angle = (bin + .5) / bins * 2 * Math.PI - Math.PI;
    cz += Math.cos(angle) * envelope[bin];
    cy += Math.sin(angle) * envelope[bin];
  }
  cy /= bins; cz /= bins;
  const offset = Math.hypot(cy, cz);
  check(offset <= HUB_TOLERANCE,
    `${name} pivot is ${(offset * 1000).toFixed(1)} mm off its own axle (limit ${HUB_TOLERANCE * 1000} mm)`);

  const [, hubY] = node.translation || [0, 0, 0];
  report.push({ name, radius: mean, runout, offset, hubY });
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

// The body is a real Escort rather than a sheared one. The published RS Turbo
// is 4.05 m long, 1.39 m tall on a 2.40 m wheelbase; a scan with mirrors and
// arches is allowed a few centimetres, a bad axis fit is not.
const shell = nodes.get('Car_Shell');
if (shell) {
  const spec = doc.accessors[doc.meshes[shell.mesh].primitives[0].attributes.POSITION];
  const size = spec.max.map((value, axis) => value - spec.min[axis]);
  report.push({ name: 'Car_Shell', size });
  check(Math.abs(size[2] - 4.05) < 0.16, `body length ${size[2].toFixed(3)} m is not an Escort`);
  check(Math.abs(size[1] - 1.40) < 0.10, `body height ${size[1].toFixed(3)} m is not an Escort`);
}
const front = nodes.get('Car_Wheel_LF');
const rear = nodes.get('Car_Wheel_LR');
if (front && rear) {
  const wheelbase = Math.abs(rear.translation[2] - front.translation[2]);
  check(Math.abs(wheelbase - 2.40) < 0.10, `wheelbase ${wheelbase.toFixed(3)} m is not an Escort`);
  report.push({ name: 'wheelbase', wheelbase });
}

for (const line of report) {
  if (line.radius !== undefined) {
    console.log(`  ${line.name.padEnd(14)} r=${line.radius.toFixed(4)} m  `
      + `runout=${(line.runout * 100).toFixed(2)}%  hub offset=${(line.offset * 1000).toFixed(2)} mm`);
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

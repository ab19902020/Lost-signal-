import * as THREE from 'three';

// Somebody else driving your car.
//
// The two men who come down the road are not besieging the shelter any more:
// they are here for the Escort, and once they are in it they have to be able
// to drive it away convincingly. This is the driver - a pure-pursuit
// controller that produces the same throttle and steering a player produces,
// so the car it drives is the same car with the same handling, and shooting
// its driver stops it the same way.

const _to = new THREE.Vector3();

function normaliseAngle(angle) {
  let value = angle;
  while (value > Math.PI) value -= Math.PI * 2;
  while (value < -Math.PI) value += Math.PI * 2;
  return value;
}

export function createCarThief({ vehicle, route = [], arrive = 7, cruise = 17 } = {}) {
  const points = route.map((point) => (point.isVector3
    ? point.clone() : new THREE.Vector3(point[0], 0, point[1])));
  let index = 0;
  let stopping = false;

  // How close counts as reaching a waypoint depends on how far apart they are.
  // A route laid out every sixty metres wants a generous capture; a turnaround
  // arc drawn every three wants a tight one, or the car ticks through the whole
  // arc in six frames without ever steering round it and carries on straight.
  const capture = points.map((point, at) => (at === 0 ? arrive
    : Math.max(1.5, Math.min(arrive, point.distanceTo(points[at - 1]) * 0.55))));

  // Driving past a waypoint counts as reaching it. Without this a car that ran
  // a corner wide turns back for a point it has already left behind.
  function cleared(gap) {
    if (index === 0 || gap > arrive * 2.4) return false;
    const here = points[index];
    const previous = points[index - 1];
    return (vehicle.state.x - here.x) * (here.x - previous.x)
      + (vehicle.state.z - here.z) * (here.z - previous.z) > 0;
  }

  function lookahead() {
    // Aim a little further along than the next waypoint once close to it, so
    // the car flows through a bend instead of pecking at each point in turn.
    const next = points[Math.min(index + 1, points.length - 1)];
    const here = points[Math.min(index, points.length - 1)];
    if (!here) return null;
    const distance = Math.hypot(here.x - vehicle.state.x, here.z - vehicle.state.z);
    const blendAt = Math.min(arrive * 1.6, capture[Math.min(index, capture.length - 1)] * 2.4);
    if (distance > blendAt || here === next) return here;
    return _to.copy(here).lerp(next, THREE.MathUtils.clamp(1 - distance / blendAt, 0, 0.7));
  }

  return {
    get done() { return index >= points.length; },
    get remaining() { return Math.max(0, points.length - index); },
    /** Stop driving and come to a halt where it is. */
    halt() { stopping = true; },
    get halted() { return stopping; },
    update(dt) {
      const { state } = vehicle;
      if (stopping || index >= points.length) {
        // Off the throttle and on the brake: a car whose driver has stopped
        // driving does not stand still, it rolls to a stop.
        return { throttle: Math.abs(state.speed) > 0.4 ? -0.5 : 0, steer: 0 };
      }
      const target = lookahead();
      const here = points[index];
      const gap = Math.hypot(here.x - state.x, here.z - state.z);
      if (gap < capture[index] || cleared(gap)) {
        index++;
        if (index >= points.length) return { throttle: 0, steer: 0 };
      }
      if (!target) return { throttle: 0, steer: 0 };

      const wanted = Math.atan2(-(target.x - state.x), -(target.z - state.z));
      const delta = normaliseAngle(wanted - state.heading);
      // Turning right runs the heading down, so a target to the right is a
      // negative delta and wants a positive steer.
      const steer = THREE.MathUtils.clamp(-delta * 1.9, -1, 1);

      // Slow for the corner and for the last waypoint, and never ask for more
      // than a road speed - this is an escape, not a lap record.
      const corner = 1 - Math.min(1, Math.abs(delta) / 0.9) * 0.75;
      const nearEnd = index >= points.length - 1 ? 0.55 : 1;
      const wantSpeed = cruise * corner * nearEnd;
      const throttle = state.speed > wantSpeed
        ? THREE.MathUtils.clamp((wantSpeed - state.speed) * 0.4, -1, 0)
        : THREE.MathUtils.clamp(0.35 + (wantSpeed - state.speed) * 0.25, 0.25, 1);
      return { throttle, steer };
    },
  };
}

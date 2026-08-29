import * as THREE from 'three';

// Navigation for characters that have to cross a compound full of things.
//
// The old route planner searched a graph of about sixteen hand-placed cover
// points. If no straight line between two of them was clear - which is most of
// the time once you are inside a yard with barriers, a car, a gate and each
// other in it - it returned no route at all, and the caller's fallback was to
// keep walking into whatever was in front of it. That is why the two old men
// spent the game wedged against the same barrier.
//
// This is a grid A*, but the grid is never built: cells are tested against the
// real collision system the first time the search reaches them, and cached.
// So the search cost is the size of the route, not the size of the world, and
// a route across the whole compound costs a few hundred collision tests once,
// rather than a graph that has to be authored and maintained by hand.

const NEIGHBOURS = [
  [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
  [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2],
];

export function createNavigator({
  colliders,
  cell = 0.7,
  radius = 0.36,
  feet = 0.18,
  head = 1.62,
  // A search that cannot find its goal must give up before it costs a frame.
  // Six thousand cells is a route about sixty metres long around an obstacle.
  budget = 6000,
} = {}) {
  const walkable = new Map();
  const key = (cx, cz) => `${cx},${cz}`;

  function clear(cx, cz) {
    const cached = walkable.get(key(cx, cz));
    if (cached !== undefined) return cached;
    const x = cx * cell;
    const z = cz * cell;
    const floor = colliders.floorAt(x, z, radius, 40);
    const open = !colliders.contains(x, z, radius, floor + feet, floor + head);
    walkable.set(key(cx, cz), open);
    return open;
  }

  /** Forget what was learned about an area whose contents have changed. */
  function invalidate() {
    walkable.clear();
  }

  function nearestOpen(cx, cz, reach = 4) {
    if (clear(cx, cz)) return [cx, cz];
    for (let ring = 1; ring <= reach; ring++) {
      for (let dx = -ring; dx <= ring; dx++) {
        for (let dz = -ring; dz <= ring; dz++) {
          if (Math.max(Math.abs(dx), Math.abs(dz)) !== ring) continue;
          if (clear(cx + dx, cz + dz)) return [cx + dx, cz + dz];
        }
      }
    }
    return null;
  }

  /**
   * A route from `from` to `to` as world-space points, or null.
   *
   * The start and goal are snapped to the nearest open cell, so standing half
   * inside a prop - which happens the moment two characters touch - does not
   * make the world unnavigable.
   */
  function path(from, to, { maxExpansions = budget } = {}) {
    const startCell = nearestOpen(Math.round(from.x / cell), Math.round(from.z / cell));
    const goalCell = nearestOpen(Math.round(to.x / cell), Math.round(to.z / cell));
    if (!startCell || !goalCell) return null;
    if (startCell[0] === goalCell[0] && startCell[1] === goalCell[1]) {
      return [new THREE.Vector3(to.x, from.y, to.z)];
    }

    const open = [{ cx: startCell[0], cz: startCell[1], g: 0, f: 0, from: null }];
    const best = new Map([[key(startCell[0], startCell[1]), open[0]]]);
    const done = new Set();
    let expansions = 0;

    const heuristic = (cx, cz) => {
      const dx = Math.abs(cx - goalCell[0]);
      const dz = Math.abs(cz - goalCell[1]);
      // Octile: the true cost of moving on a grid with diagonals.
      return Math.max(dx, dz) + (Math.SQRT2 - 1) * Math.min(dx, dz);
    };
    open[0].f = heuristic(startCell[0], startCell[1]);

    while (open.length && expansions < maxExpansions) {
      // A linear scan beats a heap up to a few thousand nodes and cannot get
      // its ordering wrong.
      let pick = 0;
      for (let index = 1; index < open.length; index++) {
        if (open[index].f < open[pick].f) pick = index;
      }
      const node = open.splice(pick, 1)[0];
      const nodeKey = key(node.cx, node.cz);
      if (done.has(nodeKey)) continue;
      done.add(nodeKey);
      expansions++;

      if (node.cx === goalCell[0] && node.cz === goalCell[1]) {
        const route = [];
        for (let step = node; step; step = step.from) {
          route.push(new THREE.Vector3(step.cx * cell, from.y, step.cz * cell));
        }
        route.reverse();
        route.shift();
        route.push(new THREE.Vector3(to.x, from.y, to.z));
        return smooth(route, from);
      }

      for (const [dx, dz, cost] of NEIGHBOURS) {
        const nx = node.cx + dx;
        const nz = node.cz + dz;
        if (done.has(key(nx, nz)) || !clear(nx, nz)) continue;
        // Never cut a corner diagonally through the gap between two solids.
        if (dx && dz && (!clear(node.cx + dx, node.cz) || !clear(node.cx, node.cz + dz))) continue;
        const g = node.g + cost;
        const existing = best.get(key(nx, nz));
        if (existing && existing.g <= g) continue;
        const next = { cx: nx, cz: nz, g, f: g + heuristic(nx, nz), from: node };
        best.set(key(nx, nz), next);
        open.push(next);
      }
    }
    return null;
  }

  /** Drop every waypoint the character can see past. */
  function smooth(route, from) {
    const out = [];
    let anchor = new THREE.Vector3(from.x, from.y, from.z);
    for (let index = 0; index < route.length; index++) {
      const last = index === route.length - 1;
      if (!last && segmentClear(anchor, route[index + 1])) continue;
      out.push(route[index]);
      anchor = route[index];
    }
    return out;
  }

  function segmentClear(a, b) {
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const distance = Math.hypot(dx, dz);
    if (distance < 1e-3) return true;
    const steps = Math.ceil(distance / (cell * 0.6));
    for (let step = 1; step <= steps; step++) {
      const t = step / steps;
      const x = a.x + dx * t;
      const z = a.z + dz * t;
      const floor = colliders.floorAt(x, z, radius, 40);
      if (colliders.contains(x, z, radius, floor + feet, floor + head)) return false;
    }
    return true;
  }

  return { path, segmentClear, invalidate, cell, radius };
}

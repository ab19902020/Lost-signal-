"""Repair the surface a vertex-cluster decimation tears out of a photo scan.

Reducing a 1.95-million-triangle reconstruction to something a phone can draw
means merging vertices, and the merge is keyed on more than position: two
vertices that sit on top of each other but face different ways, or land in
different islands of the UV atlas, have to stay separate or the texture
smears.  Two things follow, and both were plainly visible on the Ford Escort.

*   The surface stops sharing vertices along every one of those boundaries.
    Each side is averaged to its own cluster centre, the two drift apart by up
    to one cell, and the car ends up with a hairline crack across every panel.
*   Triangles whose three corners collapse into two clusters are dropped, and
    where several of those meet, the panel is left with an actual hole.  Under
    a light those read as hard dark flecks scattered over the bodywork — which
    is what made the supplied high-detail scan look damaged rather than
    detailed.

This mends both without touching the attributes that forced the split.  Rims
are welded to the rim facing them, so cracks close with the UVs untouched, and
the small holes that remain are filled with a fan whose texture coordinates are
interpolated from the hole's own edge.  Openings that are *meant* to be open —
a wheel arch, a window, the cut under the car — are recognised by their size
and left alone.

    python3 tools/mend_scan_seams.py public/assets/supplied/ford_escort_rs_turbo.glb
"""

from __future__ import annotations

import argparse
import json
from collections import defaultdict, deque
from pathlib import Path

import numpy as np

from rig_ford_escort import (
    ARRAY_BUFFER, ELEMENT_ARRAY_BUFFER, GlbBuilder, accessor_array, read_glb, write_glb,
)

# One decimation cell. Two sides of a crack cannot be further apart than the
# cell that split them, and nothing that is genuinely a separate surface on a
# car is this close to another surface facing the same way.
WELD_RADIUS = 0.026
# Rims that face away from each other belong to opposite sides of a panel, not
# to the two lips of one crack.
FACING_LIMIT = 0.35
# How far along its own rim a vertex is considered "itself". Without this the
# whole of an open edge collapses to a point.
RIM_EXCLUSION_STEPS = 6
# Passes of mutual-nearest pairing. Pairing only vertices that choose each
# other is what keeps a weld local: chaining everything within a radius into
# one group dragged whole panels across the car.
WELD_PASSES = 3
WELD_ROUNDS = 6
# A hole this big is a design feature. The largest thing the decimation
# actually punched through a panel is a few centimetres across; a window, a
# wheel arch or the open underside is an order of magnitude larger.
FILL_MAX_SPAN = 0.16
FILL_MAX_EDGES = 64
# Long cracks are not loops: they are two lips running side by side, and each
# lip belongs to the same sprawling boundary network as half the car. Those are
# closed edge by edge instead, by reaching across to the lip opposite. The
# reach is bounded so a window or a wheel arch, whose far side is a third of a
# metre away, is never bridged.
ZIP_REACH = 0.09
ZIP_MAX_AREA = 0.004


def site_indices(positions: np.ndarray) -> np.ndarray:
    """Map vertices onto shared positions, since seams duplicate them."""
    quantised = np.round(positions / 1e-5).astype(np.int64)
    _, inverse = np.unique(quantised, axis=0, return_inverse=True)
    return inverse


def open_edges_of(sites: np.ndarray, triangles: np.ndarray) -> np.ndarray:
    welded = sites[triangles]
    edges = np.sort(np.concatenate([welded[:, [0, 1]], welded[:, [1, 2]],
                                    welded[:, [2, 0]]]), axis=1)
    unique_edges, counts = np.unique(edges, axis=0, return_counts=True)
    return unique_edges[counts == 1]


def weld_rims(positions: np.ndarray, normals: np.ndarray,
              triangles: np.ndarray) -> tuple[np.ndarray, int]:
    """Snap the two lips of every decimation crack onto each other."""
    inverse = site_indices(positions)
    open_edges = open_edges_of(inverse, triangles)
    if not len(open_edges):
        return positions, 0

    sites = int(inverse.max()) + 1
    site_positions = np.zeros((sites, 3))
    site_positions[inverse] = positions
    site_normals = np.zeros((sites, 3))
    site_normals[inverse] = normals

    rim = np.unique(open_edges.reshape(-1))
    adjacency = defaultdict(list)
    for a, b in open_edges:
        adjacency[int(a)].append(int(b))
        adjacency[int(b)].append(int(a))

    # Everything within a few steps along a rim is the same edge of the same
    # hole and must never be welded to itself.
    excluded_sets = []
    for site in rim:
        excluded = {int(site)}
        frontier = deque([(int(site), 0)])
        while frontier:
            current, depth = frontier.popleft()
            if depth >= RIM_EXCLUSION_STEPS:
                continue
            for neighbour in adjacency[current]:
                if neighbour in excluded:
                    continue
                excluded.add(neighbour)
                frontier.append((neighbour, depth + 1))
        excluded_sets.append(excluded)

    neighbourhood = [(x, y, z) for x in (-1, 0, 1) for y in (-1, 0, 1) for z in (-1, 0, 1)]
    rim_positions = site_positions[rim].copy()
    rim_normals = site_normals[rim]
    joined = 0

    for _ in range(WELD_PASSES):
        keys = np.floor(rim_positions / WELD_RADIUS).astype(np.int64)
        buckets = defaultdict(list)
        for index, key in enumerate(map(tuple, keys)):
            buckets[key].append(index)

        nearest = np.full(len(rim), -1, dtype=np.int64)
        nearest_distance = np.full(len(rim), np.inf)
        for index in range(len(rim)):
            key = tuple(keys[index])
            position = rim_positions[index]
            normal = rim_normals[index]
            excluded = excluded_sets[index]
            for offset in neighbourhood:
                for other in buckets.get((key[0] + offset[0], key[1] + offset[1],
                                          key[2] + offset[2]), ()):
                    if other == index or int(rim[other]) in excluded:
                        continue
                    if np.dot(normal, rim_normals[other]) < FACING_LIMIT:
                        continue
                    distance = float(np.linalg.norm(position - rim_positions[other]))
                    if distance < nearest_distance[index] and distance <= WELD_RADIUS:
                        nearest_distance[index] = distance
                        nearest[index] = other

        # Only pairs that choose each other are welded, so a weld moves two
        # vertices half a gap and never propagates along a chain.
        pass_joined = 0
        for index in range(len(rim)):
            partner = nearest[index]
            if partner < 0 or partner < index or nearest[partner] != index:
                continue
            centre = (rim_positions[index] + rim_positions[partner]) * .5
            rim_positions[index] = centre
            rim_positions[partner] = centre
            pass_joined += 2
        joined += pass_joined
        if not pass_joined:
            break

    moved = positions.copy()
    for index, site in enumerate(rim):
        if not np.array_equal(rim_positions[index], site_positions[site]):
            moved[inverse == site] = rim_positions[index]
    return moved, joined


def fill_holes(positions: np.ndarray, normals: np.ndarray, uvs: np.ndarray,
               triangles: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, int]:
    """Close every small remaining hole with a fan to its own centre."""
    inverse = site_indices(positions)
    open_pairs = {tuple(edge) for edge in open_edges_of(inverse, triangles)}
    if not open_pairs:
        return positions, normals, uvs, triangles, 0

    # Group the open edges into holes, so each fill is anchored on the middle
    # of the hole it belongs to and a big opening can be recognised and skipped.
    parent: dict[int, int] = {}

    def find(node: int) -> int:
        parent.setdefault(node, node)
        while parent[node] != node:
            parent[node] = parent[parent[node]]
            node = parent[node]
        return node

    for a, b in open_pairs:
        left, right = find(int(a)), find(int(b))
        if left != right:
            parent[right] = left

    sites = int(inverse.max()) + 1
    site_positions = np.zeros((sites, 3))
    site_positions[inverse] = positions

    members = defaultdict(list)
    for site in parent:
        members[find(site)].append(site)
    edges_in_hole = defaultdict(int)
    for a, b in open_pairs:
        edges_in_hole[find(int(a))] += 1

    fillable = {}
    for root, sites_in_hole in members.items():
        if edges_in_hole[root] > FILL_MAX_EDGES:
            continue
        points = site_positions[sites_in_hole]
        span = float(np.linalg.norm(points.max(axis=0) - points.min(axis=0)))
        if span > FILL_MAX_SPAN:
            continue
        fillable[root] = points.mean(axis=0)

    if not fillable:
        return positions, normals, uvs, triangles, 0

    new_positions = [positions]
    new_normals = [normals]
    new_uvs = [uvs]
    added_positions = []
    added_normals = []
    added_uvs = []
    added_triangles = []
    next_index = len(positions)

    # A boundary edge runs a->b with the surface on its left, so the patch that
    # closes it is wound b->a->centre and faces the same way as its neighbours.
    for triangle in triangles:
        for corner in range(3):
            a = int(triangle[corner])
            b = int(triangle[(corner + 1) % 3])
            key = (min(inverse[a], inverse[b]), max(inverse[a], inverse[b]))
            if key not in open_pairs:
                continue
            root = find(int(inverse[a]))
            centre = fillable.get(root)
            if centre is None:
                continue
            # The new corner takes its texture coordinate from the two vertices
            # it joins, so the patch samples the paint around the hole instead
            # of an average of the whole rim.
            added_positions.append(centre)
            added_normals.append((normals[a] + normals[b]) * .5)
            added_uvs.append((uvs[a] + uvs[b]) * .5)
            added_triangles.append((b, a, next_index))
            next_index += 1

    if not added_triangles:
        return positions, normals, uvs, triangles, 0

    new_positions.append(np.array(added_positions, dtype=positions.dtype))
    new_normals.append(np.array(added_normals, dtype=normals.dtype))
    new_uvs.append(np.array(added_uvs, dtype=uvs.dtype))
    out_positions = np.concatenate(new_positions)
    out_normals = np.concatenate(new_normals)
    out_uvs = np.concatenate(new_uvs)
    out_triangles = np.concatenate([triangles, np.array(added_triangles, dtype=triangles.dtype)])
    return out_positions, out_normals, out_uvs, out_triangles, len(added_triangles)


def zip_holes(positions: np.ndarray, normals: np.ndarray, uvs: np.ndarray,
              triangles: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, int]:
    """Close each remaining open edge by reaching across to the lip opposite."""
    inverse = site_indices(positions)
    open_edges = open_edges_of(inverse, triangles)
    if not len(open_edges):
        return positions, normals, uvs, triangles, 0
    open_pairs = {tuple(edge) for edge in open_edges}

    sites = int(inverse.max()) + 1
    site_positions = np.zeros((sites, 3))
    site_positions[inverse] = positions
    site_normals = np.zeros((sites, 3))
    site_normals[inverse] = normals

    rim = np.unique(open_edges.reshape(-1))
    adjacency = defaultdict(list)
    for a, b in open_edges:
        adjacency[int(a)].append(int(b))
        adjacency[int(b)].append(int(a))

    def near_rim(site: int) -> set[int]:
        seen = {site}
        frontier = deque([(site, 0)])
        while frontier:
            current, depth = frontier.popleft()
            if depth >= RIM_EXCLUSION_STEPS:
                continue
            for neighbour in adjacency[current]:
                if neighbour in seen:
                    continue
                seen.add(neighbour)
                frontier.append((neighbour, depth + 1))
        return seen

    exclusion = {int(site): near_rim(int(site)) for site in rim}

    keys = np.floor(site_positions[rim] / ZIP_REACH).astype(np.int64)
    buckets = defaultdict(list)
    for index, key in enumerate(map(tuple, keys)):
        buckets[key].append(int(rim[index]))
    neighbourhood = [(x, y, z) for x in (-1, 0, 1) for y in (-1, 0, 1) for z in (-1, 0, 1)]

    added_positions = []
    added_normals = []
    added_uvs = []
    added_triangles = []
    next_index = len(positions)

    for triangle in triangles:
        for corner in range(3):
            a = int(triangle[corner])
            b = int(triangle[(corner + 1) % 3])
            site_a = int(inverse[a])
            site_b = int(inverse[b])
            if (min(site_a, site_b), max(site_a, site_b)) not in open_pairs:
                continue
            midpoint = (site_positions[site_a] + site_positions[site_b]) * .5
            normal = (site_normals[site_a] + site_normals[site_b]) * .5
            forbidden = exclusion[site_a] | exclusion[site_b]
            key = np.floor(midpoint / ZIP_REACH).astype(np.int64)
            best = -1
            best_distance = ZIP_REACH
            for offset in neighbourhood:
                for candidate in buckets.get((int(key[0]) + offset[0], int(key[1]) + offset[1],
                                              int(key[2]) + offset[2]), ()):
                    if candidate in forbidden:
                        continue
                    if float(np.dot(normal, site_normals[candidate])) < FACING_LIMIT:
                        continue
                    distance = float(np.linalg.norm(midpoint - site_positions[candidate]))
                    if distance < best_distance:
                        best_distance = distance
                        best = candidate
            if best < 0:
                continue
            edge = site_positions[site_b] - site_positions[site_a]
            reach = site_positions[best] - site_positions[site_a]
            area = float(np.linalg.norm(np.cross(edge, reach))) * .5
            if area > ZIP_MAX_AREA:
                continue
            # The patch borrows the texture coordinates of the edge it closes,
            # so it takes the colour of the paint beside the crack rather than
            # dragging a line across the atlas.
            added_positions.append(site_positions[best])
            added_normals.append(normal)
            added_uvs.append((uvs[a] + uvs[b]) * .5)
            added_triangles.append((b, a, next_index))
            next_index += 1

    if not added_triangles:
        return positions, normals, uvs, triangles, 0
    out_positions = np.concatenate([positions, np.array(added_positions, dtype=positions.dtype)])
    out_normals = np.concatenate([normals, np.array(added_normals, dtype=normals.dtype)])
    out_uvs = np.concatenate([uvs, np.array(added_uvs, dtype=uvs.dtype)])
    out_triangles = np.concatenate([triangles, np.array(added_triangles, dtype=triangles.dtype)])
    return out_positions, out_normals, out_uvs, out_triangles, len(added_triangles)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("glb", type=Path)
    parser.add_argument("--mesh", action="append", default=None,
                        help="mesh name to mend; repeatable, default every mesh")
    parser.add_argument("--rounds", type=int, default=WELD_ROUNDS,
                        help="weld rounds; each one re-reads the topology the last one closed")
    parser.add_argument("--no-fill", action="store_true")
    args = parser.parse_args()

    document, binary = read_glb(args.glb)
    builder = GlbBuilder()
    meshes = []
    for mesh in document["meshes"]:
        primitive = mesh["primitives"][0]
        positions = accessor_array(document, binary, primitive["attributes"]["POSITION"]).astype(np.float64)
        normals = accessor_array(document, binary, primitive["attributes"]["NORMAL"]).astype(np.float64)
        uvs = accessor_array(document, binary, primitive["attributes"]["TEXCOORD_0"]).astype(np.float32)
        triangles = accessor_array(document, binary, primitive["indices"]).reshape(-1, 3).astype(np.int64)

        if not args.mesh or mesh["name"] in args.mesh:
            before = len(open_edges_of(site_indices(positions), triangles))
            welded = 0
            for _ in range(args.rounds):
                # Each round re-derives the topology, so a crack closed by the
                # last one now reads as solid and its neighbours become reachable.
                positions, joined = weld_rims(positions, normals, triangles)
                welded += joined
                if not joined:
                    break
            filled = 0
            zipped = 0
            if not args.no_fill:
                positions, normals, uvs, triangles, filled = fill_holes(
                    positions, normals, uvs, triangles)
                positions, normals, uvs, triangles, zipped = zip_holes(
                    positions, normals, uvs, triangles)
            after = len(open_edges_of(site_indices(positions), triangles))
            print(f"  {mesh['name']:<20} open edges {before:6,} -> {after:6,}, "
                  f"{welded:6,} rim vertices welded, {filled:6,} fans, {zipped:6,} zips")

        meshes.append({
            "name": mesh["name"],
            "primitives": [{
                "attributes": {
                    "POSITION": builder.accessor(np.ascontiguousarray(positions.astype(np.float32)), "VEC3", ARRAY_BUFFER),
                    "NORMAL": builder.accessor(np.ascontiguousarray(normals.astype(np.float32)), "VEC3", ARRAY_BUFFER),
                    "TEXCOORD_0": builder.accessor(np.ascontiguousarray(uvs.astype(np.float32)), "VEC2", ARRAY_BUFFER),
                },
                "indices": builder.accessor(
                    np.ascontiguousarray(triangles.reshape(-1).astype(np.uint32)),
                    "SCALAR", ELEMENT_ARRAY_BUFFER),
                "material": primitive.get("material", 0),
                "mode": 4,
            }],
        })

    images = []
    for image in document.get("images", []):
        view = document["bufferViews"][image["bufferView"]]
        start = view.get("byteOffset", 0)
        images.append({
            "name": image.get("name", "texture"),
            "mimeType": image["mimeType"],
            "bufferView": builder.append_bytes(binary[start:start + view["byteLength"]]),
        })

    output = {
        "asset": {"version": "2.0", "generator": "Lost Signal scan seam mender"},
        "scene": document.get("scene", 0),
        "scenes": document["scenes"],
        "nodes": json.loads(json.dumps(document["nodes"])),
        "meshes": meshes,
        "materials": json.loads(json.dumps(document["materials"])),
        "samplers": document.get("samplers", [{}]),
        "textures": document.get("textures", []),
        "images": images,
        "accessors": builder.accessors,
        "bufferViews": builder.buffer_views,
        "buffers": [{"byteLength": len(builder.binary)}],
    }
    write_glb(args.glb, output, bytes(builder.binary))
    print(f"MENDED: {args.glb} ({args.glb.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()

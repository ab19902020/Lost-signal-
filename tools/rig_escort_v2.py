"""Rig the clean Ford Escort upload into a drivable runtime GLB.

The first supplied Escort was a photogrammetry scan: 1.95 million triangles in
one fused mesh, which had to be decimated to be drawable and tore itself apart
in the process.  This upload is the opposite — an already-clean 4,832-triangle
model whose wheels, lamps, mirrors and trim are *separate connected shells*.
Nothing needs decimating, so nothing gets torn: the rig is pure bookkeeping.

Three real defects in the upload are corrected on the way through.

*   It is rolled.  The right-hand wheels sit 33 mm higher than the left, a
    3.4 degree lean baked into the vertices, so the car parked itself on the
    camber of an imaginary road.  The roll and pitch are measured from the four
    wheel hubs and taken out.
*   It faces the wrong way.  Tripo's nose is +Z; Lost Signal drives down -Z.
*   Its proportions are an image-to-3D guess: too wide and too short for its
    height.  The body is scaled onto a real Escort's dimensions, and because
    that is a non-uniform scale, the wheels are rebuilt as separate uniform
    parts sized to the arch rather than squashed with the bodywork.

    python3 tools/rig_escort_v2.py SOURCE.glb \
        public/assets/supplied/ford_escort_rs_turbo.glb
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np

from rig_ford_escort import (
    ARRAY_BUFFER, ELEMENT_ARRAY_BUFFER, GlbBuilder, accessor_array, read_glb, write_glb,
)
from true_escort_wheels import fit_hub

# A published Escort RS Turbo. The upload is 1.64:1 wide-to-tall where the real
# car is 1.18:1, so these are a correction, not a preference.
TARGET_WIDTH = 1.72   # over the arches, which is what the model's widest is
TARGET_HEIGHT = 1.40
TARGET_LENGTH = 4.02
# The tyre has to live inside an arch that was stretched by a different factor
# from the one that stretched the wheel, so it is sized from the aperture with
# a little to spare rather than from a number.
ARCH_CLEARANCE = 0.97


def components(positions: np.ndarray, triangles: np.ndarray) -> np.ndarray:
    """Label every triangle with the connected shell it belongs to."""
    quantised = np.round(positions / 1e-6).astype(np.int64)
    _, inverse = np.unique(quantised, axis=0, return_inverse=True)
    parent = np.arange(int(inverse.max()) + 1)

    def find(node: int) -> int:
        while parent[node] != node:
            parent[node] = parent[parent[node]]
            node = parent[node]
        return node

    for triangle in inverse[triangles]:
        root = find(int(triangle[0]))
        for other in (find(int(triangle[1])), find(int(triangle[2]))):
            if other != root:
                parent[other] = root
    roots = np.array([find(node) for node in range(len(parent))])
    return roots[inverse][triangles[:, 0]]


def lathe_wheel(local: np.ndarray, radius: float, axis: int = 0) -> np.ndarray:
    """Turn a modelled wheel back into a wheel that was turned on a lathe.

    The upload's tyres are 4.5% taller than they are long and their outer
    surface scatters another 5% either side of that, with no pattern along the
    axle - it is modelling noise, not tread. A tyre is a surface of revolution,
    so every point of its crown belongs at one radius; putting them there is
    what stops the car bouncing once per wheel revolution. The correction fades
    out towards the rim so the hub cap, its bolts and the brake behind it keep
    the shape the model gave them.
    """
    plane = [index for index in range(3) if index != axis]
    offset = local[:, plane]
    distance = np.hypot(offset[:, 0], offset[:, 1])
    crown = distance > distance.max() * .88
    if crown.sum() < 8:
        raise ValueError("wheel has no measurable crown")

    corrected = local.copy()
    scale = radius / float(np.median(distance[crown]))
    corrected[:, plane[0]] = offset[:, 0] * scale
    corrected[:, plane[1]] = offset[:, 1] * scale
    distance = distance * scale

    reach = np.clip((distance / radius - .82) / .18, 0.0, 1.0)
    weight = reach * reach * (3.0 - 2.0 * reach)
    snapped = distance + (radius - distance) * weight
    ratio = snapped / np.maximum(distance, 1e-9)
    corrected[:, plane[0]] *= ratio
    corrected[:, plane[1]] *= ratio
    return corrected


def rotate(points: np.ndarray, axis: int, angle: float) -> np.ndarray:
    cos, sin = np.cos(angle), np.sin(angle)
    matrix = np.eye(3)
    a, b = [index for index in range(3) if index != axis]
    matrix[a, a] = cos; matrix[a, b] = -sin
    matrix[b, a] = sin; matrix[b, b] = cos
    return points @ matrix.T


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    document, binary = read_glb(args.source)
    primitive = document["meshes"][0]["primitives"][0]
    positions = accessor_array(document, binary, primitive["attributes"]["POSITION"]).astype(np.float64)
    normals = accessor_array(document, binary, primitive["attributes"]["NORMAL"]).astype(np.float64)
    uvs = accessor_array(document, binary, primitive["attributes"]["TEXCOORD_0"]).astype(np.float32)
    triangles = accessor_array(document, binary, primitive["indices"]).reshape(-1, 3).astype(np.int64)

    labels = components(positions, triangles)
    vertex_label = np.zeros(len(positions), dtype=labels.dtype)
    for label, triangle in zip(labels, triangles):
        vertex_label[triangle] = label

    def shell(label) -> np.ndarray:
        return positions[vertex_label == label]

    # A wheel is a thin disc, well off the centreline and well off the middle of
    # the car. Nothing else on the model is shaped remotely like that.
    wheels = []
    for label in np.unique(labels):
        points = shell(label)
        size = points.max(axis=0) - points.min(axis=0)
        centre = points.mean(axis=0)
        disc = size[0] < size[1] * .6 and size[0] < size[2] * .6
        if disc and abs(centre[0]) > .2 and abs(centre[2]) > .15 and len(points) > 40:
            wheels.append(label)
    if len(wheels) != 4:
        raise SystemExit(f"expected four wheel shells, found {len(wheels)}")

    def hub_of(label) -> np.ndarray:
        points = shell(label)
        centre_y, centre_z, _ = fit_hub(points[:, [1, 2]])
        return np.array([points[:, 0].mean(), centre_y, centre_z])

    hubs = {label: hub_of(label) for label in wheels}

    # Level it. The hubs of a car that is standing still are all the same height
    # as each other; these are not, which is the lean you can see in the render.
    left = [hub for hub in hubs.values() if hub[0] < 0]
    right = [hub for hub in hubs.values() if hub[0] > 0]
    roll = np.arctan2(np.mean([h[1] for h in right]) - np.mean([h[1] for h in left]),
                      np.mean([h[0] for h in right]) - np.mean([h[0] for h in left]))
    front = [hub for hub in hubs.values() if hub[2] > 0]
    rear = [hub for hub in hubs.values() if hub[2] < 0]
    pitch = np.arctan2(np.mean([h[1] for h in front]) - np.mean([h[1] for h in rear]),
                       np.mean([h[2] for h in front]) - np.mean([h[2] for h in rear]))
    print(f"upload leans {np.degrees(roll):+.2f} deg and pitches {np.degrees(pitch):+.2f} deg")

    positions[:] = rotate(rotate(positions, 2, -roll), 0, -pitch)
    normals[:] = rotate(rotate(normals, 2, -roll), 0, -pitch)
    # Tripo's nose is +Z. A half turn about the vertical puts it down -Z, which
    # is the direction everything else in Lost Signal calls forward.
    positions[:, 0] *= -1; positions[:, 2] *= -1
    normals[:, 0] *= -1; normals[:, 2] *= -1

    ground = positions[:, 1].min()
    positions[:, 1] -= ground
    extent = positions.max(axis=0) - positions.min(axis=0)
    scale = np.array([TARGET_WIDTH / extent[0], TARGET_HEIGHT / extent[1],
                      TARGET_LENGTH / extent[2]])
    print(f"upload {np.round(extent, 4).tolist()} -> "
          f"{np.round(extent * scale, 3).tolist()} m (scale {np.round(scale, 4).tolist()})")

    scaled = positions * scale
    scaled_normals = normals / scale
    scaled_normals /= np.maximum(np.linalg.norm(scaled_normals, axis=1, keepdims=True), 1e-9)

    # The arch is body, so it took the body's scale. Size the tyre to the hole
    # it has to turn inside rather than to a catalogue number.
    donor = max(wheels, key=lambda label: int((vertex_label == label).sum()))
    apertures = []
    for label in wheels:
        points = positions[vertex_label == label] * scale
        apertures.append((points[:, 1].max(), points[:, 2].max() - points[:, 2].min()))
    arch_height = min(top for top, _ in apertures)
    arch_length = min(length for _, length in apertures)
    radius = min(arch_height, arch_length) * .5 * ARCH_CLEARANCE
    print(f"arch aperture {arch_height:.3f} m tall by {arch_length:.3f} m long "
          f"-> {radius * 2:.3f} m wheel")

    donor_mask = vertex_label == donor
    donor_points = positions[donor_mask].copy()
    donor_hub_y, donor_hub_z, donor_radius = fit_hub(donor_points[:, [1, 2]])
    # Width follows the body so the track stays right; the rolling face is
    # scaled on its own so the wheel is a circle rather than the ellipse the
    # body's scale would have made of it.
    wheel_scale = radius / donor_radius
    local = np.column_stack((
        (donor_points[:, 0] - donor_points[:, 0].mean()) * scale[0],
        (donor_points[:, 1] - donor_hub_y) * wheel_scale,
        (donor_points[:, 2] - donor_hub_z) * wheel_scale,
    ))
    # The hub sits one radius above the road, so the crown has to reach exactly
    # that far or the car grinds into the ground or hovers over it.
    local = lathe_wheel(local, radius, axis=0)
    trued_radius = float(np.hypot(local[:, 1], local[:, 2]).max())
    donor_normals = scaled_normals[donor_mask]

    remap = np.full(len(positions), -1, dtype=np.int64)
    remap[donor_mask] = np.arange(int(donor_mask.sum()))
    donor_triangles = remap[triangles[labels == donor]]
    donor_uvs = uvs[donor_mask]

    right_local = local.copy(); right_local[:, 0] *= -1
    right_normals = donor_normals.copy(); right_normals[:, 0] *= -1
    right_triangles = donor_triangles[:, ::-1].copy()

    # Lamps become their own meshes under the names vehicle.js lights up, so the
    # car has headlamps at night instead of two painted circles.
    def named_shell(label) -> str:
        points = positions[vertex_label == label] * scale
        centre = points.mean(axis=0)
        nose = TARGET_LENGTH * .42
        # A lamp is out at the corner of the car. The grille, the badge and the
        # number plate are at the same end but on the centreline, and a glowing
        # number plate is not what anybody wants at night.
        if abs(centre[0]) < TARGET_WIDTH * .11:
            return "Car_Shell"
        if centre[2] < -nose and centre[1] < TARGET_HEIGHT * .55:
            return f"Car_Headlamp_{'L' if centre[0] < 0 else 'R'}"
        if centre[2] > nose:
            return f"Car_Taillamp_{'L' if centre[0] < 0 else 'R'}"
        return "Car_Shell"

    groups: dict[str, list] = {}
    for label in np.unique(labels):
        if label in wheels:
            continue
        groups.setdefault(named_shell(label), []).append(label)

    builder = GlbBuilder()
    meshes = []
    nodes = [{"name": "Ford_Escort_RS_Turbo", "children": [], "extras": {
        "make": "Ford", "model": "Escort RS Turbo", "drivenAxle": "front",
        "riggedFrom": "clean upload", "sourceTriangles": int(len(triangles)),
    }}]

    def add_mesh(points, part_normals, part_uvs, part_triangles, name: str) -> int:
        meshes.append({
            "name": name,
            "primitives": [{
                "attributes": {
                    "POSITION": builder.accessor(np.ascontiguousarray(points.astype(np.float32)), "VEC3", ARRAY_BUFFER),
                    "NORMAL": builder.accessor(np.ascontiguousarray(part_normals.astype(np.float32)), "VEC3", ARRAY_BUFFER),
                    "TEXCOORD_0": builder.accessor(np.ascontiguousarray(part_uvs.astype(np.float32)), "VEC2", ARRAY_BUFFER),
                },
                "indices": builder.accessor(
                    np.ascontiguousarray(part_triangles.reshape(-1).astype(np.uint32)),
                    "SCALAR", ELEMENT_ARRAY_BUFFER),
                "material": 0,
                "mode": 4,
            }],
        })
        return len(meshes) - 1

    # The lamps hang off the shell rather than the root: vehicle.js rolls and
    # pitches Car_Shell for weight transfer, and a headlamp that stayed behind
    # while the body leaned would tear itself out of the wing.
    shell_node = None
    for name, labels_in_group in sorted(groups.items(), key=lambda item: item[0] != "Car_Shell"):
        keep = np.isin(labels, labels_in_group)
        used = np.unique(triangles[keep].reshape(-1))
        remap = np.full(len(positions), -1, dtype=np.int64)
        remap[used] = np.arange(len(used))
        mesh_index = add_mesh(scaled[used], scaled_normals[used], uvs[used],
                              remap[triangles[keep]], name)
        index = len(nodes)
        nodes.append({"name": name, "mesh": mesh_index})
        if name == "Car_Shell":
            shell_node = index
            nodes[0]["children"].append(index)
        else:
            nodes[shell_node].setdefault("children", []).append(index)
    if shell_node is None:
        raise SystemExit("the upload produced no body shell")

    left_mesh = add_mesh(local, donor_normals, donor_uvs, donor_triangles, "Car_Wheel_Left")
    right_mesh = add_mesh(right_local, right_normals, donor_uvs, right_triangles, "Car_Wheel_Right")
    for label in sorted(wheels, key=lambda item: (hubs[item][2], hubs[item][0])):
        points = positions[vertex_label == label] * scale
        centre_y, centre_z, _ = fit_hub(points[:, [1, 2]])
        del centre_y
        centre_x = points[:, 0].mean()
        # Nose is -Z after the half turn, so the front pair are the negative
        # ones; left is -X because the car faces the way the player does.
        tag = ("F" if centre_z < 0 else "R")
        side = ("L" if centre_x < 0 else "R")
        nodes[0]["children"].append(len(nodes))
        nodes.append({
            "name": f"Car_Wheel_{side}{tag}",
            "mesh": right_mesh if centre_x > 0 else left_mesh,
            "translation": [float(centre_x), float(radius), float(centre_z)],
        })
    nodes.append({"name": "LS_ORIENT_YUP"})

    images = []
    for image in document.get("images", []):
        view = document["bufferViews"][image["bufferView"]]
        start = view.get("byteOffset", 0)
        images.append({
            "name": image.get("name", "Ford_Escort_Texture"),
            "mimeType": image["mimeType"],
            "bufferView": builder.append_bytes(binary[start:start + view["byteLength"]]),
        })

    material = json.loads(json.dumps(document["materials"][0]))
    material["name"] = "Ford_Escort_Supplied_PBR"
    material["doubleSided"] = False
    # The upload ships flat matte paint. A car body is a clear coat over colour:
    # a little metal and a lot less roughness is what makes it catch the sun.
    material.setdefault("pbrMetallicRoughness", {})["metallicFactor"] = 0.22
    material["pbrMetallicRoughness"]["roughnessFactor"] = 0.42

    output = {
        "asset": {"version": "2.0", "generator": "Lost Signal Escort rig v2"},
        "scene": 0,
        "scenes": [{"name": "Ford Escort RS Turbo", "nodes": [0, len(nodes) - 1]}],
        "nodes": nodes,
        "meshes": meshes,
        "materials": [material],
        "samplers": document.get("samplers", [{}]),
        "textures": document.get("textures", []),
        "images": images,
        "accessors": builder.accessors,
        "bufferViews": builder.buffer_views,
        "buffers": [{"byteLength": len(builder.binary)}],
    }
    write_glb(args.output, output, bytes(builder.binary))

    print(f"ESCORT RIGGED: {args.output}")
    for mesh in meshes:
        count = builder.accessors[mesh["primitives"][0]["indices"]]["count"] // 3
        print(f"  {mesh['name']:<20} {count:6,} triangles")
    print(f"  wheel radius {trued_radius:.4f} m, hubs at y {radius:.4f}")
    print(f"  bytes: {args.output.stat().st_size:,}")


if __name__ == "__main__":
    main()

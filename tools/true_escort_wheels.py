"""Correct the rigged Ford Escort's proportions and rebuild its four wheels.

Two defects were measurable in the checked-in runtime GLB and both showed up
the moment the car moved.

1.  ``rig_ford_escort.transform_model`` stretched the supplied scan onto a
    fixed 1.72 x 1.37 x 4.20 metre box with three *different* axis scales.  A
    scan is already proportional, so that non-uniform fit sheared the whole
    car: every wheel came out 5.3% shorter through the vertical than through
    the length, i.e. a visible ellipse that wobbled once per revolution.
2.  The wheel pivots were the nominal hub coordinates, not the fitted hub of
    the extracted geometry.  The rear pair sat 15-20 mm off their own axis, so
    they orbited as well as spun, and the reconstruction had left their
    outboard faces incomplete.

This tool works on the rigged GLB rather than the 1.95-million-triangle
upload, so it can be re-run on the checked-in asset:

    python3 tools/true_escort_wheels.py \
        public/assets/supplied/ford_escort_rs_turbo.glb

The aspect correction is derived from the car itself: a road wheel is round,
so the ratio between a wheel's vertical and longitudinal extent *is* the
shear, and it is split geometrically between the two axes so the car keeps
its overall size.  On the supplied scan that lands 4.09 m long, 1.40 m tall
on a 2.42 m wheelbase, all within about 1% of a real Escort RS Turbo.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np

from rig_ford_escort import (
    ARRAY_BUFFER, ELEMENT_ARRAY_BUFFER, GlbBuilder, accessor_array,
    matrix_column_major, read_glb, write_glb,
)

# The tyre wall, not the rim, defines a wheel's silhouette. Vertices inside
# this fraction of the fitted radius are structure (rim, spokes, brake) and
# are left exactly where the scan put them.
TYRE_SHOULDER = 0.62
# A scan's outer surface is noisy. Blend the per-angle envelope over this many
# degrees so truing removes the flat spot without chasing single stray points.
ENVELOPE_SMOOTH_DEGREES = 25.0
ENVELOPE_BINS = 180


def fit_hub(plane: np.ndarray) -> tuple[float, float, float]:
    """Least-squares centre and radius of a wheel's outer envelope.

    Fitting every vertex would drag the centre towards the dense rim face.
    Fitting the per-angle outermost points finds the tyre, which is the only
    part of the geometry that is actually a circle about the axle.
    """
    centre = np.array([
        (plane[:, 0].min() + plane[:, 0].max()) * .5,
        (plane[:, 1].min() + plane[:, 1].max()) * .5,
    ])
    radius = 0.0
    for _ in range(8):
        offset = plane - centre
        angle = np.arctan2(offset[:, 1], offset[:, 0])
        distance = np.hypot(offset[:, 0], offset[:, 1])
        envelope, angles = envelope_profile(angle, distance)
        keep = envelope > 0
        x = np.cos(angles[keep]) * envelope[keep]
        y = np.sin(angles[keep]) * envelope[keep]
        design = np.column_stack((x, y, np.ones(keep.sum())))
        solution, *_ = np.linalg.lstsq(design, x * x + y * y, rcond=None)
        shift = solution[:2] * .5
        radius = float(np.sqrt(solution[2] + shift @ shift))
        centre = centre + shift
    return float(centre[0]), float(centre[1]), radius


def envelope_profile(angle: np.ndarray, distance: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Outermost radius per angular bin, wrapped and smoothed."""
    bins = np.clip(((angle + np.pi) / (2 * np.pi) * ENVELOPE_BINS).astype(int),
                   0, ENVELOPE_BINS - 1)
    envelope = np.zeros(ENVELOPE_BINS)
    # Outermost radius per bin, read at the 99.5th percentile so one stray
    # spike from the reconstruction cannot define the tyre.
    for index in range(ENVELOPE_BINS):
        samples = distance[bins == index]
        if len(samples):
            envelope[index] = np.percentile(samples, 99.5)
    filled = envelope > 0
    if filled.any() and not filled.all():
        # A gap in the scan must not read as a small radius.
        positions = np.arange(ENVELOPE_BINS)
        envelope[~filled] = np.interp(
            positions[~filled], positions[filled], envelope[filled], period=ENVELOPE_BINS,
        )
    width = max(1, int(round(ENVELOPE_SMOOTH_DEGREES / 360.0 * ENVELOPE_BINS)))
    kernel = np.ones(width) / width
    smoothed = np.convolve(np.concatenate((envelope, envelope, envelope)), kernel, mode="same")
    envelope = smoothed[ENVELOPE_BINS:2 * ENVELOPE_BINS]
    angles = (np.arange(ENVELOPE_BINS) + .5) / ENVELOPE_BINS * 2 * np.pi - np.pi
    return envelope, angles


def revolution_profile(axial: np.ndarray, radius: np.ndarray,
                       slices: int = 48) -> tuple[np.ndarray, np.ndarray]:
    """The radius a wheel *should* have at each point along its axle.

    A wheel is a body of revolution: at a given distance along the axle every
    point of its outer surface is the same distance from the axis.  Taking the
    median of the outermost points in each axial slice recovers that profile —
    tread crown, shoulder and sidewall curve included — from a scan whose
    surface is dented, and it is immune to both the flat spot and the holes
    the reconstruction left behind.
    """
    edges = np.linspace(axial.min(), axial.max(), slices + 1)
    centres = (edges[:-1] + edges[1:]) * .5
    profile = np.zeros(slices)
    for index in range(slices):
        inside = (axial >= edges[index]) & (axial <= edges[index + 1])
        samples = radius[inside]
        if len(samples) < 8:
            continue
        # Only the outer surface defines the profile: the rim face, spokes and
        # brake sit at the same axial position but a much smaller radius, so
        # the surface is the top of the distribution, not its middle. The 92nd
        # percentile is the outside of the tyre without being the one stray
        # vertex the reconstruction pushed past it.
        profile[index] = np.percentile(samples, 92.0)
    known = profile > 0
    if not known.any():
        raise ValueError("wheel has no measurable outer surface")
    profile = np.interp(centres, centres[known], profile[known])
    # Three slices of smoothing keeps the shoulder curve and drops the sampling
    # noise that would otherwise be baked in as a ripple along the tread.
    padded = np.concatenate((profile[:1], profile, profile[-1:]))
    profile = (padded[:-2] + padded[1:-1] + padded[2:]) / 3.0
    return centres, profile


def true_wheel(positions: np.ndarray, axis: int = 0) -> tuple[np.ndarray, float, float, float]:
    """Centre a wheel on its own axle and turn its tyre back into a circle.

    Returns the recentred positions, the hub offset that was removed and the
    trued rolling radius.  ``axis`` indexes the axle direction; the other two
    axes are the rotation plane.
    """
    plane_axes = [index for index in range(3) if index != axis]
    plane = positions[:, plane_axes]
    centre_u, centre_v, fitted = fit_hub(plane)
    offset = plane - np.array([centre_u, centre_v])
    distance = np.hypot(offset[:, 0], offset[:, 1])
    axial = positions[:, axis]
    centres, profile = revolution_profile(axial, distance)
    ideal = np.interp(axial, centres, profile)

    # Pull the outer surface onto the profile the wheel would have if it were
    # turned on a lathe, fading to no change by the rim so spokes, hub and
    # brake face keep the shape the scan actually captured. How far out a
    # vertex sits is judged against that lathe profile, not against the
    # scanned surface: a vertex in the middle of a dent is still tyre, and
    # measuring it against the dent is what leaves the dent behind.
    reach = np.clip((distance / np.maximum(ideal, 1e-6) - TYRE_SHOULDER)
                    / (1.0 - TYRE_SHOULDER), 0.0, 1.0)
    weight = reach * reach * (3.0 - 2.0 * reach)
    trued_distance = distance + (ideal - distance) * weight
    # A dent may be deep but the correction is still bounded: no vertex is
    # allowed to move more than a tenth of the radius.
    trued_distance = np.clip(trued_distance, distance - fitted * .1, distance + fitted * .1)
    scale = trued_distance / np.maximum(distance, 1e-9)

    trued = positions.copy()
    trued[:, plane_axes[0]] = offset[:, 0] * scale
    trued[:, plane_axes[1]] = offset[:, 1] * scale
    return trued, centre_u, centre_v, float(profile.max())


def mirror(positions: np.ndarray, normals: np.ndarray, triangles: np.ndarray,
           axis: int = 0) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Mirror a part across an axis, restoring the winding order."""
    flipped_positions = positions.copy()
    flipped_normals = normals.copy()
    flipped_positions[:, axis] *= -1
    flipped_normals[:, axis] *= -1
    flipped_triangles = triangles[:, ::-1].copy()
    return flipped_positions, flipped_normals, flipped_triangles


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("glb", type=Path)
    parser.add_argument("--output", type=Path, default=None)
    args = parser.parse_args()
    output = args.output or args.glb

    document, binary = read_glb(args.glb)
    nodes = {node["name"]: node for node in document["nodes"]}
    parts = {}
    for name, node in nodes.items():
        if "mesh" not in node:
            continue
        primitive = document["meshes"][node["mesh"]]["primitives"][0]
        parts[name] = {
            "positions": accessor_array(document, binary, primitive["attributes"]["POSITION"]).astype(np.float64),
            "normals": accessor_array(document, binary, primitive["attributes"]["NORMAL"]).astype(np.float64),
            "uvs": accessor_array(document, binary, primitive["attributes"]["TEXCOORD_0"]).astype(np.float32),
            "triangles": accessor_array(document, binary, primitive["indices"]).reshape(-1, 3),
        }

    wheel_names = ["Car_Wheel_LF", "Car_Wheel_RF", "Car_Wheel_LR", "Car_Wheel_RR"]
    missing = [name for name in wheel_names + ["Car_Shell"] if name not in parts]
    if missing:
        raise SystemExit(f"{args.glb} is missing {', '.join(missing)}")

    # 1. Measure the shear. Each wheel is a circle in the Y-Z plane, so the
    #    ratio of its two extents is the shear the rig baked in.
    ratios = []
    for name in wheel_names:
        local = parts[name]["positions"]
        size = local.max(axis=0) - local.min(axis=0)
        ratios.append(size[2] / size[1])
    shear = float(np.median(ratios))
    # Split the correction between the two axes so the car keeps its size:
    # raising Y alone makes it too tall, shortening Z alone makes it too short.
    lift = float(np.sqrt(shear))
    correction = np.array([1.0, lift, 1.0 / lift])
    print(f"wheel Y:Z ratios {[round(value, 4) for value in ratios]} -> shear {shear:.4f}")
    print(f"aspect correction {correction.round(5).tolist()}")

    def to_world(name: str) -> np.ndarray:
        node = nodes[name]
        local = parts[name]["positions"]
        if "matrix" in node:
            matrix = np.array(node["matrix"], dtype=np.float64).reshape(4, 4).T
            return local @ matrix[:3, :3].T + matrix[:3, 3]
        return local + np.array(node.get("translation", [0, 0, 0]), dtype=np.float64)

    def world_normals(name: str) -> np.ndarray:
        node = nodes[name]
        normals = parts[name]["normals"]
        if "matrix" in node:
            matrix = np.array(node["matrix"], dtype=np.float64).reshape(4, 4).T
            normals = normals @ matrix[:3, :3].T
        return normals

    def correct_normals(normals: np.ndarray) -> np.ndarray:
        # Inverse transpose for a diagonal scale is the reciprocal scale.
        adjusted = normals / correction
        lengths = np.linalg.norm(adjusted, axis=1, keepdims=True)
        return adjusted / np.maximum(lengths, 1e-9)

    # 2. Build one canonical wheel. The front-left is the most complete
    #    capture: the rear pair are missing their outboard faces, which is why
    #    they measured 70 mm narrower than the front pair on a car whose four
    #    wheels are identical. Reusing the good one fixes the wobble and the
    #    hole in the same step, and halves the wheel vertex data.
    donor = "Car_Wheel_LF"
    donor_world = to_world(donor) * correction
    donor_normals = correct_normals(world_normals(donor))
    hub_x = float(nodes[donor]["translation"][0])
    centred, hub_y, hub_z, tyre_radius = true_wheel(
        donor_world - np.array([hub_x, 0.0, 0.0]), axis=0,
    )
    print(f"donor {donor}: hub=({hub_x:.4f}, {hub_y:.4f}, {hub_z:.4f}) radius={tyre_radius:.4f}")

    rear_world = to_world("Car_Wheel_LR") * correction
    rear_hub_y, rear_hub_z, rear_radius = fit_hub(rear_world[:, [1, 2]])
    print(f"rear hub measured at y={rear_hub_y:.4f} z={rear_hub_z:.4f} r={rear_radius:.4f}")

    # Both axles carry the same wheel, so both hubs sit one tyre radius above
    # the ground. Using the front hub height for all four is what makes the car
    # stand level instead of squatting by the 12 mm the two fits differ.
    # The whole car settles so the trued tyres stand on y = 0 rather than
    # hovering or sinking by whatever the correction moved the contact patch.
    settle = -(hub_y - tyre_radius)
    axle_height = tyre_radius
    print(f"ground settle {settle:+.4f} m")
    wheel_positions = [
        ("Car_Wheel_LF", [+hub_x, axle_height, hub_z], False),
        ("Car_Wheel_RF", [-hub_x, axle_height, hub_z], True),
        ("Car_Wheel_LR", [+hub_x, axle_height, rear_hub_z], False),
        ("Car_Wheel_RR", [-hub_x, axle_height, rear_hub_z], True),
    ]

    left_geometry = (centred.astype(np.float32), donor_normals.astype(np.float32),
                     parts[donor]["uvs"], parts[donor]["triangles"])
    right_positions, right_normals, right_triangles = mirror(
        centred, donor_normals, parts[donor]["triangles"],
    )
    right_geometry = (right_positions.astype(np.float32), right_normals.astype(np.float32),
                      parts[donor]["uvs"], right_triangles)

    # 3. Body and cabin move with the same settle so nothing shifts relative
    #    to the wheels.
    def body_geometry(name: str) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        world = to_world(name) * correction
        world[:, 1] += settle
        return (world.astype(np.float32), correct_normals(world_normals(name)).astype(np.float32),
                parts[name]["uvs"], parts[name]["triangles"])

    shell_geometry = body_geometry("Car_Shell")

    # 4. The steering wheel keeps a rigid frame so vehicle.js can still turn it
    #    about its column. The correction is a shear, so re-orthonormalise the
    #    frame and bake the residual into the vertices.
    steering_name = "Car_SteeringWheel"
    steering_node = nodes[steering_name]
    steering_world = to_world(steering_name) * correction
    steering_world[:, 1] += settle
    steering_centre = steering_world.mean(axis=0)
    matrix = np.array(steering_node["matrix"], dtype=np.float64).reshape(4, 4).T
    sheared = matrix[:3, :3] * correction[:, None]
    unitary, _, transposed = np.linalg.svd(sheared)
    steering_basis = unitary @ transposed
    if np.linalg.det(steering_basis) < 0:
        steering_basis[:, 2] *= -1
    steering_local = (steering_world - steering_centre) @ steering_basis
    steering_normals = correct_normals(world_normals(steering_name)) @ steering_basis
    steering_geometry = (
        steering_local.astype(np.float32),
        (steering_normals / np.maximum(np.linalg.norm(steering_normals, axis=1, keepdims=True), 1e-9)).astype(np.float32),
        parts[steering_name]["uvs"], parts[steering_name]["triangles"],
    )

    builder = GlbBuilder()

    def add_mesh(geometry, name: str) -> dict:
        positions, normals, uvs, triangles = geometry
        return {
            "name": name,
            "primitives": [{
                "attributes": {
                    "POSITION": builder.accessor(np.ascontiguousarray(positions), "VEC3", ARRAY_BUFFER),
                    "NORMAL": builder.accessor(np.ascontiguousarray(normals), "VEC3", ARRAY_BUFFER),
                    "TEXCOORD_0": builder.accessor(np.ascontiguousarray(uvs), "VEC2", ARRAY_BUFFER),
                },
                "indices": builder.accessor(
                    np.ascontiguousarray(triangles.reshape(-1).astype(np.uint32)),
                    "SCALAR", ELEMENT_ARRAY_BUFFER),
                "material": 0,
                "mode": 4,
            }],
        }

    meshes = [add_mesh(shell_geometry, "Car_Shell")]
    left_mesh = len(meshes); meshes.append(add_mesh(left_geometry, "Car_Wheel_Left"))
    right_mesh = len(meshes); meshes.append(add_mesh(right_geometry, "Car_Wheel_Right"))
    steering_mesh = len(meshes); meshes.append(add_mesh(steering_geometry, "Car_SteeringWheel"))

    out_nodes = [{
        "name": "Ford_Escort_RS_Turbo",
        "children": list(range(1, 7)),
        "extras": dict(nodes["Ford_Escort_RS_Turbo"].get("extras", {}), truedWheels=True),
    }, {"name": "Car_Shell", "mesh": 0}]
    for name, translation, mirrored in wheel_positions:
        out_nodes.append({
            "name": name,
            "mesh": right_mesh if mirrored else left_mesh,
            "translation": [float(value) for value in translation],
        })
    out_nodes.append({
        "name": steering_name,
        "mesh": steering_mesh,
        "matrix": matrix_column_major(steering_basis.astype(np.float32),
                                      steering_centre.astype(np.float32)),
    })
    out_nodes.append({"name": "LS_ORIENT_YUP"})

    images = []
    for image in document.get("images", []):
        view = document["bufferViews"][image["bufferView"]]
        start = view.get("byteOffset", 0)
        payload = binary[start:start + view["byteLength"]]
        images.append({
            "name": image.get("name", "Ford_Escort_Texture"),
            "mimeType": image["mimeType"],
            "bufferView": builder.append_bytes(payload),
        })

    out_document = {
        "asset": {"version": "2.0", "generator": "Lost Signal Ford Escort wheel truing tool"},
        "scene": 0,
        "scenes": [{"name": "Ford Escort RS Turbo", "nodes": [0, 7]}],
        "nodes": out_nodes,
        "meshes": meshes,
        "materials": json.loads(json.dumps(document["materials"])),
        "samplers": document.get("samplers", [{}]),
        "textures": document.get("textures", []),
        "images": images,
        "accessors": builder.accessors,
        "bufferViews": builder.buffer_views,
        "buffers": [{"byteLength": len(builder.binary)}],
    }
    write_glb(output, out_document, bytes(builder.binary))

    body = shell_geometry[0]
    print(f"ESCORT TRUED: {output}")
    print(f"  body: {(body.max(axis=0) - body.min(axis=0)).round(3).tolist()} m, "
          f"wheelbase {abs(hub_z - rear_hub_z):.3f} m")
    print(f"  wheel: radius {tyre_radius:.4f} m, {len(left_geometry[3]):,} triangles x4")
    print(f"  bytes: {output.stat().st_size:,}")


if __name__ == "__main__":
    main()

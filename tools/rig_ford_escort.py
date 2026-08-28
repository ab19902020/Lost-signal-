"""Turn the supplied fused Ford Escort scan into a driveable runtime GLB.

The Tripo export is one 1.95-million-triangle mesh: wheels, steering wheel,
body and cabin have no object pivots.  This converter preserves the supplied
PBR textures, builds a mobile-sized body, extracts four wheel copies around
their real hubs, and gives every moving part the exact node names consumed by
``src/vehicle.js``.

Usage:

    python3 tools/rig_ford_escort.py SOURCE.glb \
        public/assets/supplied/ford_escort_rs_turbo.glb

NumPy and Pillow are authoring-only dependencies.  The generated GLB is
checked in and browsers never run this converter.
"""

from __future__ import annotations

import argparse
import io
import json
import struct
from pathlib import Path

import numpy as np
from PIL import Image


ARRAY_BUFFER = 34962
ELEMENT_ARRAY_BUFFER = 34963
FLOAT = 5126
UNSIGNED_INT = 5125


def read_glb(path: Path) -> tuple[dict, bytes]:
    data = path.read_bytes()
    magic, version, length = struct.unpack_from("<4sII", data, 0)
    if magic != b"glTF" or version != 2 or length != len(data):
        raise ValueError(f"{path} is not a valid glTF 2.0 binary")
    json_length, json_type = struct.unpack_from("<II", data, 12)
    if json_type != 0x4E4F534A:
        raise ValueError("the first GLB chunk is not JSON")
    json_start = 20
    document = json.loads(data[json_start:json_start + json_length].rstrip(b" \0"))
    binary_header = json_start + json_length
    binary_length, binary_type = struct.unpack_from("<II", data, binary_header)
    if binary_type != 0x004E4942:
        raise ValueError("the second GLB chunk is not binary")
    binary_start = binary_header + 8
    return document, data[binary_start:binary_start + binary_length]


def accessor_array(document: dict, binary: bytes, accessor_index: int) -> np.ndarray:
    accessor = document["accessors"][accessor_index]
    view = document["bufferViews"][accessor["bufferView"]]
    components = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4}[accessor["type"]]
    dtype = {5123: "<u2", 5125: "<u4", 5126: "<f4"}[accessor["componentType"]]
    item_size = np.dtype(dtype).itemsize
    stride = view.get("byteStride", item_size * components)
    offset = view.get("byteOffset", 0) + accessor.get("byteOffset", 0)
    return np.ndarray(
        (accessor["count"], components), dtype=dtype, buffer=binary, offset=offset,
        strides=(stride, item_size),
    ).copy()


def transform_model(positions: np.ndarray, normals: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Bake the scan into a 4.20 x 1.72 x 1.37 metre, nose-down-Z car."""
    minimum = positions.min(axis=0)
    maximum = positions.max(axis=0)
    source_size = maximum - minimum
    scale = np.array([1.72 / source_size[0], 1.37 / source_size[1], 4.20 / source_size[2]])

    # A half-turn makes the source's +Z nose match Lost Signal's -Z forward.
    transformed = positions.copy()
    transformed[:, 0] = -positions[:, 0] * scale[0]
    transformed[:, 1] = (positions[:, 1] - minimum[1]) * scale[1]
    transformed[:, 2] = -positions[:, 2] * scale[2]

    # Non-uniform scale requires inverse-transpose normal transformation.
    transformed_normals = normals.copy()
    transformed_normals[:, 0] = -normals[:, 0] / scale[0]
    transformed_normals[:, 1] = normals[:, 1] / scale[1]
    transformed_normals[:, 2] = -normals[:, 2] / scale[2]
    lengths = np.linalg.norm(transformed_normals, axis=1, keepdims=True)
    transformed_normals /= np.maximum(lengths, 1e-8)
    return transformed.astype(np.float32), transformed_normals.astype(np.float32), scale


def compact_geometry(
    positions: np.ndarray,
    normals: np.ndarray,
    texcoords: np.ndarray,
    triangles: np.ndarray,
    step: float,
    normal_bins: int,
    uv_bins: int,
    centre: np.ndarray | None = None,
    basis: np.ndarray | None = None,
) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """Vertex-cluster a textured surface while retaining winding and UV seams."""
    used = np.unique(triangles.reshape(-1))
    local_positions = positions[used]
    local_normals = normals[used]
    local_uvs = texcoords[used]

    if centre is not None:
        local_positions = local_positions - centre
    if basis is not None:
        # Basis columns are the moving node's local X/Y/Z axes.
        local_positions = local_positions @ basis
        local_normals = local_normals @ basis

    remap_source = np.full(len(positions), -1, dtype=np.int32)
    remap_source[used] = np.arange(len(used), dtype=np.int32)
    local_triangles = remap_source[triangles]

    minimum = local_positions.min(axis=0)
    position_key = np.floor((local_positions - minimum) / step).astype(np.int32)
    normal_key = np.floor((local_normals + 1.0) * normal_bins / 2.0)
    normal_key = np.clip(normal_key, 0, normal_bins - 1).astype(np.int16)
    uv_key = np.floor(local_uvs * uv_bins).astype(np.int16)
    keys = np.concatenate((position_key, normal_key, uv_key), axis=1)
    _, inverse = np.unique(keys, axis=0, return_inverse=True)

    count = int(inverse.max()) + 1
    weights = np.bincount(inverse, minlength=count).astype(np.float64)

    def average(values: np.ndarray) -> np.ndarray:
        output = np.empty((count, values.shape[1]), dtype=np.float32)
        for axis in range(values.shape[1]):
            output[:, axis] = np.bincount(
                inverse, weights=values[:, axis], minlength=count,
            ) / weights
        return output

    out_positions = average(local_positions)
    out_normals = average(local_normals)
    out_normals /= np.maximum(np.linalg.norm(out_normals, axis=1, keepdims=True), 1e-8)
    out_uvs = average(local_uvs)

    out_triangles = inverse[local_triangles]
    valid = (
        (out_triangles[:, 0] != out_triangles[:, 1])
        & (out_triangles[:, 1] != out_triangles[:, 2])
        & (out_triangles[:, 0] != out_triangles[:, 2])
    )
    out_triangles = out_triangles[valid]
    canonical = np.sort(out_triangles, axis=1)
    _, first = np.unique(canonical, axis=0, return_index=True)
    out_triangles = out_triangles[np.sort(first)].astype(np.uint32)
    return out_positions, out_normals.astype(np.float32), out_uvs, out_triangles


def steering_basis(points: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    centre = points.mean(axis=0)
    covariance = np.cov((points - centre).T)
    _, vectors = np.linalg.eigh(covariance)
    local_z = vectors[:, 0]
    if local_z[2] < 0:
        local_z = -local_z
    local_x = np.array([1.0, 0.0, 0.0])
    local_x -= local_z * np.dot(local_x, local_z)
    local_x /= np.linalg.norm(local_x)
    local_y = np.cross(local_z, local_x)
    local_y /= np.linalg.norm(local_y)
    return centre.astype(np.float32), np.column_stack((local_x, local_y, local_z)).astype(np.float32)


class GlbBuilder:
    def __init__(self) -> None:
        self.binary = bytearray()
        self.buffer_views: list[dict] = []
        self.accessors: list[dict] = []

    def append_bytes(self, payload: bytes, target: int | None = None) -> int:
        while len(self.binary) % 4:
            self.binary.append(0)
        offset = len(self.binary)
        self.binary.extend(payload)
        view = {"buffer": 0, "byteOffset": offset, "byteLength": len(payload)}
        if target is not None:
            view["target"] = target
        self.buffer_views.append(view)
        return len(self.buffer_views) - 1

    def accessor(self, values: np.ndarray, kind: str, target: int) -> int:
        values = np.ascontiguousarray(values)
        view = self.append_bytes(values.tobytes(), target)
        component_type = FLOAT if values.dtype == np.float32 else UNSIGNED_INT
        accessor = {
            "bufferView": view,
            "componentType": component_type,
            "count": int(values.shape[0]),
            "type": kind,
        }
        if kind == "VEC3" and component_type == FLOAT:
            accessor["min"] = values.min(axis=0).astype(float).tolist()
            accessor["max"] = values.max(axis=0).astype(float).tolist()
        self.accessors.append(accessor)
        return len(self.accessors) - 1

    def mesh(self, geometry: tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray], name: str) -> dict:
        positions, normals, texcoords, triangles = geometry
        return {
            "name": name,
            "primitives": [{
                "attributes": {
                    "POSITION": self.accessor(positions, "VEC3", ARRAY_BUFFER),
                    "NORMAL": self.accessor(normals, "VEC3", ARRAY_BUFFER),
                    "TEXCOORD_0": self.accessor(texcoords.astype(np.float32), "VEC2", ARRAY_BUFFER),
                },
                "indices": self.accessor(triangles.reshape(-1), "SCALAR", ELEMENT_ARRAY_BUFFER),
                "material": 0,
                "mode": 4,
            }],
        }


def matrix_column_major(basis: np.ndarray, translation: np.ndarray) -> list[float]:
    matrix = np.eye(4, dtype=np.float32)
    matrix[:3, :3] = basis
    matrix[:3, 3] = translation
    return matrix.T.reshape(-1).astype(float).tolist()


def write_glb(output: Path, document: dict, binary: bytes) -> None:
    encoded_json = json.dumps(document, separators=(",", ":")).encode("utf8")
    encoded_json += b" " * ((4 - len(encoded_json) % 4) % 4)
    encoded_binary = binary + b"\0" * ((4 - len(binary) % 4) % 4)
    length = 12 + 8 + len(encoded_json) + 8 + len(encoded_binary)
    payload = bytearray(struct.pack("<4sII", b"glTF", 2, length))
    payload.extend(struct.pack("<II", len(encoded_json), 0x4E4F534A))
    payload.extend(encoded_json)
    payload.extend(struct.pack("<II", len(encoded_binary), 0x004E4942))
    payload.extend(encoded_binary)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes(payload)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    source_document, source_binary = read_glb(args.source)
    primitive = source_document["meshes"][0]["primitives"][0]
    source_positions = accessor_array(source_document, source_binary, primitive["attributes"]["POSITION"])
    source_normals = accessor_array(source_document, source_binary, primitive["attributes"]["NORMAL"])
    texcoords = accessor_array(source_document, source_binary, primitive["attributes"]["TEXCOORD_0"])
    source_indices = accessor_array(source_document, source_binary, primitive["indices"]).reshape(-1, 3)

    positions, normals, _ = transform_model(source_positions, source_normals)
    source_centres = source_positions[source_indices].mean(axis=1)
    transformed_centres = positions[source_indices].mean(axis=1)

    # The upload is one fused reconstruction, but its four real wheels are
    # cleanly separated in space.  Work in final metre coordinates so the
    # selection is circular on screen (the source axes have different scales).
    # A 325 mm radius reaches the outer tyre without swallowing the arch, and
    # the outboard cut keeps unrelated underbody triangles out of the pivot.
    source_wheels = [
        ("Car_Wheel_LF", -0.720, -1.253),
        ("Car_Wheel_RF", +0.720, -1.253),
        ("Car_Wheel_LR", -0.720, +1.228),
        ("Car_Wheel_RR", +0.720, +1.228),
    ]
    wheel_parts = []
    moving_mask = np.zeros(len(source_indices), dtype=bool)
    for name, centre_x, centre_z in source_wheels:
        radial = np.hypot(
            transformed_centres[:, 1] - 0.299,
            transformed_centres[:, 2] - centre_z,
        )
        side = np.sign(centre_x)
        mask = (side * transformed_centres[:, 0] > 0.505) & (radial < 0.325)
        moving_mask |= mask
        triangles = source_indices[mask]
        transformed_centre = np.array([centre_x, 0.299, centre_z], dtype=np.float32)
        geometry = compact_geometry(
            positions, normals, texcoords, triangles,
            # Wheels occupy the foreground while driving.  A 15 mm cluster
            # retains their round tyre wall, tread shoulder and spoke openings
            # without paying the upload's reconstruction density four times.
            step=0.015, normal_bins=3, uv_bins=28, centre=transformed_centre,
        )
        wheel_parts.append((name, transformed_centre, geometry, int(mask.sum())))

    steering_mask = (
        (source_centres[:, 0] > -0.140) & (source_centres[:, 0] < -0.030)
        & (source_centres[:, 1] > 0.155) & (source_centres[:, 1] < 0.265)
        & (source_centres[:, 2] > 0.025) & (source_centres[:, 2] < 0.110)
    )
    moving_mask |= steering_mask
    steering_triangles = source_indices[steering_mask]
    steering_points = positions[np.unique(steering_triangles)]
    steer_centre, steer_basis = steering_basis(steering_points)
    steering_geometry = compact_geometry(
        positions, normals, texcoords, steering_triangles,
        step=0.014, normal_bins=3, uv_bins=28,
        centre=steer_centre, basis=steer_basis,
    )

    # This is the crucial part of articulating a fused scan: moving surfaces
    # are removed from the shell.  The old export left all four original tyres
    # and the original steering wheel behind, then overlaid moving copies.  At
    # any steering angle the player therefore saw two intersecting wheel sets.
    shell_triangles = source_indices[~moving_mask]
    shell_geometry = compact_geometry(
        positions, normals, texcoords, shell_triangles,
        step=0.032, normal_bins=3, uv_bins=20,
    )

    builder = GlbBuilder()
    meshes = [builder.mesh(shell_geometry, "Car_Shell")]
    for name, _, geometry, _ in wheel_parts:
        meshes.append(builder.mesh(geometry, name))
    meshes.append(builder.mesh(steering_geometry, "Car_SteeringWheel"))

    nodes = [{
        "name": "Ford_Escort_RS_Turbo",
        "children": list(range(1, 7)),
        "extras": {
            "make": "Ford",
            "model": "Escort RS Turbo Cabriolet",
            "drivenAxle": "front",
            "riggedFromFusedUpload": True,
        },
    }, {
        "name": "Car_Shell",
        "mesh": 0,
    }]
    for mesh_index, (name, centre, _, _) in enumerate(wheel_parts, start=1):
        nodes.append({"name": name, "mesh": mesh_index, "translation": centre.astype(float).tolist()})
    nodes.append({
        "name": "Car_SteeringWheel",
        "mesh": len(meshes) - 1,
        "matrix": matrix_column_major(steer_basis, steer_centre),
    })
    nodes.append({"name": "LS_ORIENT_YUP"})

    # Keep the supplied PBR maps but cap them at 2K. Three decoded 4K JPEGs
    # consume roughly 144 MB of GPU texture memory on a phone; at 2K they use
    # one quarter of that while retaining the car's visible surface detail.
    images = []
    for image in source_document.get("images", []):
        source_view = source_document["bufferViews"][image["bufferView"]]
        start = source_view.get("byteOffset", 0)
        payload = source_binary[start:start + source_view["byteLength"]]
        with Image.open(io.BytesIO(payload)) as supplied:
            if max(supplied.size) > 2048:
                supplied.thumbnail((2048, 2048), Image.Resampling.LANCZOS)
                encoded = io.BytesIO()
                supplied.save(encoded, "JPEG", quality=91, optimize=True, subsampling=0)
                payload = encoded.getvalue()
        images.append({
            "name": image.get("name", "Ford_Escort_Texture"),
            "mimeType": image["mimeType"],
            "bufferView": builder.append_bytes(payload),
        })

    material = json.loads(json.dumps(source_document["materials"][0]))
    material["name"] = "Ford_Escort_Supplied_PBR"
    material.setdefault("pbrMetallicRoughness", {})["metallicFactor"] = 0.18
    material["pbrMetallicRoughness"]["roughnessFactor"] = 0.72

    output_document = {
        "asset": {"version": "2.0", "generator": "Lost Signal Ford Escort rig tool"},
        "scene": 0,
        "scenes": [{"name": "Ford Escort RS Turbo", "nodes": [0, 7]}],
        "nodes": nodes,
        "meshes": meshes,
        "materials": [material],
        "samplers": source_document.get("samplers", [{}]),
        "textures": source_document.get("textures", []),
        "images": images,
        "accessors": builder.accessors,
        "bufferViews": builder.buffer_views,
        "buffers": [{"byteLength": len(builder.binary)}],
    }
    write_glb(args.output, output_document, bytes(builder.binary))

    def triangle_count(geometry: tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]) -> int:
        return len(geometry[3])

    print(f"FORD ESCORT RIGGED: {args.output}")
    print(f"  source triangles: {len(source_indices):,}")
    print(f"  shell triangles: {triangle_count(shell_geometry):,}")
    for name, centre, geometry, selected in wheel_parts:
        print(
            f"  {name}: {triangle_count(geometry):,} triangles "
            f"from {selected:,}, centre={centre.round(3).tolist()}"
        )
    print(f"  steering: {triangle_count(steering_geometry):,} triangles")
    print(f"  runtime bytes: {args.output.stat().st_size:,}")


if __name__ == "__main__":
    main()

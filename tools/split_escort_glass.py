"""Split the Escort's glasshouse off the body so it can be seen through.

The upload is a photogrammetry scan: one closed shell with the windows painted
on it. There is no windscreen to look through, which is why you cannot see who
is driving your car away.

The scan's own texture will not tell you where the glass is. Its atlas has dark
islands all over it - the underbody, the arch liners, the shadow the car was
photographed in - and the brightness of the band between the beltline and the
roof is spread evenly from 0.1 to 0.95 with no gap in it anywhere. Every
threshold tried on colour either kept the sills or dropped the windscreen.

So this cuts by shape instead, and accepts what that costs. The glasshouse is
the band above the beltline and below the roof skin whose triangles face
outwards rather than up: on a real car that band is windows, with the pillars
between them. Taking all of it means the pillars turn to glass too. They are
two or three triangles wide on a 3,300 triangle scan, and against being able to
see who is driving your car, that is a trade worth making.

The band is then grouped by shared edges and small runs are dropped, because
the glasshouse is one connected surface and anything that comes back as a
handful of loose triangles is a mirror stalk or a door handle, not a window.

The result is a second mesh, Car_Glass, holding those triangles, and a body
with them removed. vehicle.js gives one a transparent material and the other
the paint, and the cabin behind them becomes something you can see into.
"""
from __future__ import annotations

import argparse
import io
import json
from collections import defaultdict
from pathlib import Path

import numpy as np
from PIL import Image

from rig_ford_escort import (
    ARRAY_BUFFER, ELEMENT_ARRAY_BUFFER, GlbBuilder, accessor_array, read_glb, write_glb,
)

BAND_LOW = 0.52       # bottom of the glasshouse, as a fraction of body height
BAND_HIGH = 0.95      # below the roof skin
FACING = 0.62         # |normal.y| above this is a roof or a sill, not a window
MIN_PATCH = 3         # a lone triangle is a misread; a run of three is surface
SAMPLES = np.array([[.6, .2, .2], [.2, .6, .2], [.2, .2, .6], [1 / 3, 1 / 3, 1 / 3],
                    [.45, .45, .1], [.1, .45, .45], [.45, .1, .45]])


def sample_texture(image: np.ndarray, uvs: np.ndarray, triangles: np.ndarray) -> np.ndarray:
    """Mean brightness of each triangle's own patch of the atlas."""
    height, width, _ = image.shape
    total = np.zeros(len(triangles))
    for weights in SAMPLES:
        point = (uvs[triangles] * weights[None, :, None]).sum(axis=1)
        x = np.clip((point[:, 0] * width).astype(int), 0, width - 1)
        y = np.clip(((1 - point[:, 1]) * height).astype(int), 0, height - 1)
        total += image[y, x].mean(axis=1)
    return total / len(SAMPLES)


def patches(triangles: np.ndarray, chosen: np.ndarray) -> list[np.ndarray]:
    """Group the chosen triangles into runs that share edges."""
    picked = np.where(chosen)[0]
    edges: dict[tuple[int, int], list[int]] = defaultdict(list)
    for index in picked:
        a, b, c = triangles[index]
        for edge in ((a, b), (b, c), (c, a)):
            edges[(min(edge), max(edge))].append(index)
    parent = {index: index for index in picked}

    def find(node: int) -> int:
        while parent[node] != node:
            parent[node] = parent[parent[node]]
            node = parent[node]
        return node

    for shared in edges.values():
        for other in shared[1:]:
            first, second = find(shared[0]), find(other)
            if first != second:
                parent[first] = second
    groups: dict[int, list[int]] = defaultdict(list)
    for index in picked:
        groups[find(index)].append(index)
    return [np.array(group) for group in groups.values()]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--report", type=Path, default=None)
    args = parser.parse_args()

    document, binary = read_glb(args.source)
    nodes = document["nodes"]
    if any(node.get("name") == "Car_Glass" for node in nodes):
        raise SystemExit(f"{args.source} already has its glass split out")
    shell_node = next(index for index, node in enumerate(nodes) if node["name"] == "Car_Shell")
    mesh_index = nodes[shell_node]["mesh"]
    primitive = document["meshes"][mesh_index]["primitives"][0]
    positions = accessor_array(document, binary, primitive["attributes"]["POSITION"]).astype(np.float64)
    normals = accessor_array(document, binary, primitive["attributes"]["NORMAL"]).astype(np.float64)
    uvs = accessor_array(document, binary, primitive["attributes"]["TEXCOORD_0"]).astype(np.float32)
    triangles = accessor_array(document, binary, primitive["indices"]).reshape(-1, 3).astype(np.int64)

    image_meta = document["images"][0]
    view = document["bufferViews"][image_meta["bufferView"]]
    start = view.get("byteOffset", 0)
    texture_bytes = binary[start:start + view["byteLength"]]
    image = np.asarray(Image.open(io.BytesIO(texture_bytes)).convert("RGB")).astype(np.float64) / 255.

    low, high = positions[:, 1].min(), positions[:, 1].max()
    centre = positions[triangles].mean(axis=1)
    fraction = (centre[:, 1] - low) / max(high - low, 1e-9)
    facing = normals[triangles].mean(axis=1)
    facing /= np.maximum(np.linalg.norm(facing, axis=1, keepdims=True), 1e-9)
    brightness = sample_texture(image, uvs, triangles)

    band = (fraction > BAND_LOW) & (fraction < BAND_HIGH) & (np.abs(facing[:, 1]) < FACING)
    if not band.any():
        raise SystemExit("no glasshouse band found on this shell")
    print(f"glasshouse band {band.sum()} triangles, median brightness "
          f"{np.median(brightness[band]):.3f} (recorded, not used to decide)")

    groups = sorted(patches(triangles, band), key=len, reverse=True)
    glass = np.zeros(len(triangles), dtype=bool)
    for group in groups:
        if len(group) >= MIN_PATCH:
            glass[group] = True
    print(f"{len(groups)} patches, {int(glass.sum())} triangles kept as glass "
          f"({sum(1 for g in groups if len(g) >= MIN_PATCH)} patches over {MIN_PATCH})")
    for group in groups[:8]:
        span = centre[group]
        print(f"  {len(group):4d} tris  x {span[:, 0].min():+.2f}..{span[:, 0].max():+.2f}"
              f"  y {span[:, 1].min():.2f}..{span[:, 1].max():.2f}"
              f"  z {span[:, 2].min():+.2f}..{span[:, 2].max():+.2f}"
              f"  {'GLASS' if len(group) >= MIN_PATCH else 'speck'}")
    if not glass.any():
        raise SystemExit("no window patch survived; the thresholds need revisiting")

    builder = GlbBuilder()
    meshes: list[dict] = []

    def add_mesh(part_triangles: np.ndarray, name: str, material: int) -> int:
        used = np.unique(part_triangles.reshape(-1))
        remap = np.full(len(positions), -1, dtype=np.int64)
        remap[used] = np.arange(len(used))
        meshes.append({"name": name, "primitives": [{
            "attributes": {
                "POSITION": builder.accessor(np.ascontiguousarray(positions[used].astype(np.float32)), "VEC3", ARRAY_BUFFER),
                "NORMAL": builder.accessor(np.ascontiguousarray(normals[used].astype(np.float32)), "VEC3", ARRAY_BUFFER),
                "TEXCOORD_0": builder.accessor(np.ascontiguousarray(uvs[used].astype(np.float32)), "VEC2", ARRAY_BUFFER),
            },
            "indices": builder.accessor(
                np.ascontiguousarray(remap[part_triangles].reshape(-1).astype(np.uint32)),
                "SCALAR", ELEMENT_ARRAY_BUFFER),
            "material": material,
            "mode": 4,
        }]})
        return len(meshes) - 1

    # Everything that was not one mesh already is copied across untouched; only
    # the shell is rebuilt, as a body with holes and the glass that fills them.
    old_to_new: dict[int, int] = {}
    for index, mesh in enumerate(document["meshes"]):
        if index == mesh_index:
            continue
        primitives = []
        for source in mesh["primitives"]:
            attributes = {}
            for key, accessor in source["attributes"].items():
                data = accessor_array(document, binary, accessor)
                kind = "VEC3" if data.ndim > 1 and data.shape[1] == 3 else "VEC2"
                attributes[key] = builder.accessor(
                    np.ascontiguousarray(data.astype(np.float32)), kind, ARRAY_BUFFER)
            indices = accessor_array(document, binary, source["indices"]).reshape(-1)
            primitives.append({
                "attributes": attributes,
                "indices": builder.accessor(
                    np.ascontiguousarray(indices.astype(np.uint32)), "SCALAR", ELEMENT_ARRAY_BUFFER),
                "material": source.get("material", 0),
                "mode": source.get("mode", 4),
            })
        meshes.append({"name": mesh.get("name", f"Mesh_{index}"), "primitives": primitives})
        old_to_new[index] = len(meshes) - 1

    body_mesh = add_mesh(triangles[~glass], "Car_Shell", 0)
    glass_mesh = add_mesh(triangles[glass], "Car_Glass", 1)

    new_nodes = json.loads(json.dumps(nodes))
    for node in new_nodes:
        if "mesh" in node:
            node["mesh"] = body_mesh if node["mesh"] == mesh_index else old_to_new[node["mesh"]]
    new_nodes.append({"name": "Car_Glass", "mesh": glass_mesh})
    new_nodes[shell_node].setdefault("children", []).append(len(new_nodes) - 1)

    materials = json.loads(json.dumps(document["materials"]))
    glass_material = json.loads(json.dumps(materials[0]))
    glass_material["name"] = "Ford_Escort_Glass"
    glass_material["alphaMode"] = "BLEND"
    glass_material["doubleSided"] = True
    pbr = glass_material.setdefault("pbrMetallicRoughness", {})
    pbr["baseColorFactor"] = [0.62, 0.68, 0.72, 0.34]
    pbr["metallicFactor"] = 0.0
    pbr["roughnessFactor"] = 0.08
    pbr.pop("baseColorTexture", None)
    materials.append(glass_material)

    images = []
    for image_entry in document.get("images", []):
        entry_view = document["bufferViews"][image_entry["bufferView"]]
        offset = entry_view.get("byteOffset", 0)
        images.append({
            "name": image_entry.get("name", "Ford_Escort_Texture"),
            "mimeType": image_entry["mimeType"],
            "bufferView": builder.append_bytes(binary[offset:offset + entry_view["byteLength"]]),
        })

    output = {
        "asset": {"version": "2.0", "generator": "Lost Signal Escort glass split"},
        "scene": document.get("scene", 0),
        "scenes": document["scenes"],
        "nodes": new_nodes,
        "meshes": meshes,
        "materials": materials,
        "samplers": document.get("samplers", [{}]),
        "textures": document.get("textures", []),
        "images": images,
        "accessors": builder.accessors,
        "bufferViews": builder.buffer_views,
        "buffers": [{"byteLength": len(builder.binary)}],
    }
    write_glb(args.output, output, bytes(builder.binary))
    print(f"GLASS SPLIT: {args.output}")
    for mesh in meshes:
        count = sum(builder.accessors[p["indices"]]["count"] for p in mesh["primitives"]) // 3
        print(f"  {mesh['name']:<20} {count:6,} triangles")
    if args.report:
        args.report.write_text(json.dumps({
            "band": int(band.sum()), "glass": int(glass.sum()),
            "patches": [int(len(group)) for group in groups if len(group) >= MIN_PATCH],
        }, indent=1))


if __name__ == "__main__":
    main()

"""Pad the gutters of a photo scan's UV atlas so its texture stops speckling.

A Tripo reconstruction charts its surface into tens of thousands of tiny UV
islands separated by unused gutter.  At full density that is invisible: every
triangle is a few pixels across and sits well inside its island.  After the
mesh is decimated for a phone, triangles are as large as the islands are, so
their corners land in the gutter and each one renders as a hard dark fleck.
On the Escort those flecks covered every panel and read as damage the car does
not have.

The mesh cannot be un-decimated, but the gutter can be filled.  This rasterises
the real UV layout, then floods the colour of each island outwards into the
empty space around it, so a triangle that overruns its island picks up the
paint next to it instead of the background of the atlas.  It is the standard
edge-padding a baked atlas normally ships with; this upload has none.

    python3 tools/pad_scan_atlas.py public/assets/supplied/ford_escort_rs_turbo.glb
"""

from __future__ import annotations

import argparse
import io
from pathlib import Path

import numpy as np
from PIL import Image

from rig_ford_escort import accessor_array, read_glb, write_glb

# How far the paint is pushed out from each island. The gutters in these
# uploads are a handful of pixels wide, and a decimated triangle overruns its
# island by about as much again.
PAD_PIXELS = 12


def coverage_mask(document: dict, binary: bytes, size: tuple[int, int]) -> np.ndarray:
    """Every texel any triangle in the file actually samples."""
    width, height = size
    covered = np.zeros((height, width), dtype=bool)
    for mesh in document["meshes"]:
        primitive = mesh["primitives"][0]
        uvs = accessor_array(document, binary, primitive["attributes"]["TEXCOORD_0"]).astype(np.float64)
        triangles = accessor_array(document, binary, primitive["indices"]).reshape(-1, 3)
        pixels = np.empty_like(uvs)
        pixels[:, 0] = uvs[:, 0] * width
        pixels[:, 1] = (1.0 - uvs[:, 1]) * height
        corners = pixels[triangles]
        # One pixel of slack in each direction: a texel is a square, and a
        # triangle that clips its corner still reads that whole texel.
        low = np.floor(corners.min(axis=1)).astype(int) - 1
        high = np.ceil(corners.max(axis=1)).astype(int) + 1
        np.clip(low[:, 0], 0, width - 1, out=low[:, 0])
        np.clip(high[:, 0], 0, width - 1, out=high[:, 0])
        np.clip(low[:, 1], 0, height - 1, out=low[:, 1])
        np.clip(high[:, 1], 0, height - 1, out=high[:, 1])
        for index in range(len(triangles)):
            covered[low[index, 1]:high[index, 1] + 1, low[index, 0]:high[index, 0] + 1] = True
    return covered


def flood(image: np.ndarray, covered: np.ndarray, passes: int) -> np.ndarray:
    """Push covered colour outwards one ring of texels at a time."""
    filled = image.astype(np.float32).copy()
    known = covered.copy()
    for _ in range(passes):
        weight = known.astype(np.float32)
        total = np.zeros_like(weight)
        accumulated = np.zeros_like(filled)
        for shift_y, shift_x in ((-1, 0), (1, 0), (0, -1), (0, 1),
                                 (-1, -1), (-1, 1), (1, -1), (1, 1)):
            shifted_weight = np.roll(np.roll(weight, shift_y, axis=0), shift_x, axis=1)
            shifted_colour = np.roll(np.roll(filled, shift_y, axis=0), shift_x, axis=1)
            total += shifted_weight
            accumulated += shifted_colour * shifted_weight[..., None]
        grow = (~known) & (total > 0)
        if not grow.any():
            break
        filled[grow] = accumulated[grow] / total[grow][..., None]
        known |= grow
    return np.clip(filled, 0, 255).astype(np.uint8)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("glb", type=Path)
    parser.add_argument("--passes", type=int, default=PAD_PIXELS)
    args = parser.parse_args()

    document, binary = read_glb(args.glb)
    payload = bytearray(binary)
    mask = None
    for image in document.get("images", []):
        view = document["bufferViews"][image["bufferView"]]
        start = view.get("byteOffset", 0)
        original = bytes(payload[start:start + view["byteLength"]])
        with Image.open(io.BytesIO(original)) as source:
            picture = source.convert("RGB")
        pixels = np.asarray(picture)
        if mask is None or mask.shape != pixels.shape[:2]:
            mask = coverage_mask(document, binary, picture.size)
            print(f"  atlas {picture.size[0]}x{picture.size[1]}: "
                  f"{mask.mean() * 100:.1f}% of texels are used")
        padded = flood(pixels, mask, args.passes)
        encoded = io.BytesIO()
        Image.fromarray(padded).save(encoded, "JPEG", quality=92, optimize=True, subsampling=0)
        replacement = encoded.getvalue()
        if len(replacement) > view["byteLength"]:
            # The buffer view cannot grow in place, so fall back on a quality
            # that fits rather than shifting every later view.
            for quality in (88, 84, 80, 74):
                encoded = io.BytesIO()
                Image.fromarray(padded).save(encoded, "JPEG", quality=quality,
                                             optimize=True, subsampling=0)
                replacement = encoded.getvalue()
                if len(replacement) <= view["byteLength"]:
                    break
        if len(replacement) > view["byteLength"]:
            raise SystemExit(f"{image['name']} will not fit its buffer view")
        payload[start:start + len(replacement)] = replacement
        view["byteLength"] = len(replacement)
        print(f"  {image['name']:<34} padded, {len(original):,} -> {len(replacement):,} bytes")

    write_glb(args.glb, document, bytes(payload))
    print(f"PADDED: {args.glb}")


if __name__ == "__main__":
    main()

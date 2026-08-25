"""Generate the two surfaces geometry does badly: tarmac and grass.

The project ships no painted textures — everything is authored geometry or one
of the shared CC0 PBR maps — but lane markings and a field are the two things
you cannot build out of boxes. Without them the compound is a set of untextured
coloured polygons with hard straight edges across it, which is exactly what it
looked like.

Every tile here is seamless: strokes that run off one edge are drawn again on
the opposite one.
"""
import math, os, random
from PIL import Image, ImageDraw

OUT = 'public/assets/textures'
os.makedirs(OUT, exist_ok=True)


def road(size=512):
    """One tile of two-lane British B-road: worn asphalt, centre line, edges."""
    random.seed(7)
    img = Image.new('RGB', (size, size), (56, 56, 58))
    px = img.load()
    # Aggregate speckle.
    for y in range(size):
        for x in range(size):
            n = random.randint(-16, 16)
            base = 56 + n
            px[x, y] = (base, base + 1, base + 2)
    d = ImageDraw.Draw(img)
    # Tar-band repairs and cracks running down the carriageway.
    for _ in range(9):
        x = random.randint(0, size)
        d.line([(x, 0), (x + random.randint(-40, 40), size)],
               fill=(40, 40, 42), width=random.randint(3, 9))
    # A dashed white centre line down the middle of the tile.
    for y in range(0, size, 128):
        d.rectangle([size // 2 - 5, y, size // 2 + 5, y + 70], fill=(196, 194, 184))
    # Worn edge lines.
    for x in (30, size - 30):
        d.rectangle([x - 4, 0, x + 4, size], fill=(150, 148, 138))
    img.save(f'{OUT}/road__Color.jpg', quality=88)
    print('road', size)


def _wrapped(draw, size, fn):
    """Draw the same shape at every wrap offset so the tile has no seam."""
    for dx in (-size, 0, size):
        for dy in (-size, 0, size):
            fn(draw, dx, dy)


def grass(name, base, blade, clump, seed, size=512, bare=0.0):
    """One tile of rough pasture: soil ground, blades over it, darker clumps.

    `base` is the soil showing through, `blade` the grass on top of it and
    `clump` the rank patches. Real pasture is thousands of near-vertical
    strokes over a mottled ground, and at the density the compound is seen from
    that is all it takes to stop reading as a flat coloured polygon.
    """
    random.seed(seed)
    img = Image.new('RGB', (size, size), base)
    px = img.load()
    # Mottled soil underneath, in soft blobs rather than per-pixel noise, which
    # would just alias into a shimmer at distance.
    for y in range(size):
        for x in range(size):
            n = random.randint(-9, 9)
            px[x, y] = (max(0, min(255, base[0] + n)),
                        max(0, min(255, base[1] + n)),
                        max(0, min(255, base[2] + n)))
    d = ImageDraw.Draw(img)
    # Rank clumps: darker, softer, larger than a blade.
    for _ in range(int(26 * (1 - bare))):
        cx, cy = random.randrange(size), random.randrange(size)
        r = random.randint(14, 42)
        shade = tuple(int(c * random.uniform(.82, 1.0)) for c in clump)
        _wrapped(d, size, lambda dr, dx, dy, cx=cx, cy=cy, r=r, shade=shade:
                 dr.ellipse([cx - r + dx, cy - r + dy, cx + r + dx, cy + r + dy], fill=shade))
    # Blades. Short, near-vertical, in every shade between soil and grass.
    for _ in range(int(size * 26 * (1 - bare))):
        x, y = random.randrange(size), random.randrange(size)
        length = random.randint(3, 11)
        lean = random.randint(-4, 4)
        mix = random.random()
        shade = tuple(int(blade[i] * (.62 + mix * .58)) for i in range(3))
        _wrapped(d, size, lambda dr, dx, dy, x=x, y=y, length=length, lean=lean, shade=shade:
                 dr.line([(x + dx, y + dy), (x + lean + dx, y - length + dy)], fill=shade))
    # A scatter of bare earth and dead stems, so it is not uniformly alive.
    for _ in range(70):
        x, y = random.randrange(size), random.randrange(size)
        r = random.randint(1, 4)
        shade = tuple(int(c * random.uniform(.7, 1.05)) for c in base)
        _wrapped(d, size, lambda dr, dx, dy, x=x, y=y, r=r, shade=shade:
                 dr.ellipse([x - r + dx, y - r + dy, x + r + dx, y + r + dy], fill=shade))
    img.save(f'{OUT}/{name}__Color.jpg', quality=86)
    print(name, size)


road()
# The compound's ground, in the four tones the field is laid out in.
# The three tones sit close together on purpose. Pulled apart they turned the
# compound into a jigsaw of hard-edged coloured rectangles; the variation has to
# come from the blades, not from the polygon each one is painted on.
grass('grass_meadow', (44, 52, 32), (96, 122, 58), (38, 52, 30), 11)
grass('grass_dry', (56, 57, 37), (124, 126, 74), (62, 62, 40), 29)
grass('grass_rank', (39, 47, 31), (80, 102, 50), (32, 44, 28), 47)
grass('earth', (58, 50, 40), (86, 74, 58), (46, 40, 32), 61, bare=.72)

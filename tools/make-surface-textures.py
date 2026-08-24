"""Generate the road surface the drive to the town needs.

The project ships no painted textures — everything is authored geometry or one
of the shared CC0 PBR maps — but tarmac with lane markings is the one thing
geometry does badly, and a road is half a kilometre of it.
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


road()

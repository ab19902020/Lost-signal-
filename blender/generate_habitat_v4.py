import bpy
import bmesh
import math
import os
from mathutils import Matrix, Vector

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'assets', 'blender')
TEX = os.path.join(ROOT, 'public', 'assets', 'textures')
os.makedirs(OUT, exist_ok=True)

# Silo 47 is a habitation silo: seven residential levels and a secure unit at
# the top, built around an open light well. Nobody in it knows why the world
# ended. Same authoring convention as the other generators — Y is up, +Z is
# depth, a cylinder's own axis is local Z so a vertical one needs UP.
ORIENTATION_MARKER = 'LS_ORIENT_YUP'
UP = (math.pi / 2, 0, 0)

# --- Silo dimensions, shared with the runtime -------------------------------
# Seven residential levels and a secure unit above them, around an open shaft.
# Every level is an unbroken circular walkway — nothing stands on it — and the
# outer wall of that walkway is nothing but front doors.
SHELL_RADIUS = 30.8      # the concrete shell, behind the back wall of the homes
WELL_RADIUS = 13.0       # the open shaft the walkways look down into
DECK_OUTER = 19.6        # 6.6 m of clear walkway, all the way round
LEVEL_HEIGHT = 4.0
LEVELS = 7               # residential levels
SEGMENTS = 18            # homes per level: 126 in all
STAIR_RADIUS = 5.4       # the great stair spirals down the middle of the shaft
STAIR_COLUMN = 1.2       # a slim service core, not a drum filling the well
STAIR_STEPS = 36         # a full turn per level, so every landing is above the last
APARTMENT_BACK = 29.6    # rear wall of every home: ten metres deep
DOOR_HALF = .62          # half-width of a doorway opening


def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)


def mat(name, color, metallic=0.0, roughness=0.7, emission=None, strength=0.0):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color, 1.0)
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    if emission:
        for key in ('Emission Color', 'Emission'):
            if key in bsdf.inputs:
                bsdf.inputs[key].default_value = (*emission, 1.0)
        if 'Emission Strength' in bsdf.inputs:
            bsdf.inputs['Emission Strength'].default_value = strength
    return m


def image_pbr(name, color_file, normal_file, rough_file, tint=(1, 1, 1, 1), metallic=0.0):
    existing = bpy.data.materials.get(name)
    if existing:
        return existing
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = tint
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = .82

    def image_node(filename, noncolor=False):
        path = os.path.join(TEX, filename)
        if not os.path.exists(path):
            return None
        node = nt.nodes.new('ShaderNodeTexImage')
        node.image = bpy.data.images.load(path, check_existing=True)
        if noncolor:
            node.image.colorspace_settings.name = 'Non-Color'
        return node

    c = image_node(color_file)
    n = image_node(normal_file, True)
    r = image_node(rough_file, True)
    if c:
        nt.links.new(c.outputs['Color'], bsdf.inputs['Base Color'])
    if r:
        nt.links.new(r.outputs['Color'], bsdf.inputs['Roughness'])
    if n:
        nm = nt.nodes.new('ShaderNodeNormalMap')
        nm.inputs['Strength'].default_value = .7
        nt.links.new(n.outputs['Color'], bsdf.inputs['Normal'])
        nt.links.new(nm.outputs['Normal'], bsdf.inputs['Normal'])
    return m


def has_image(material):
    if not material or not material.use_nodes:
        return False
    return any(n.type == 'TEX_IMAGE' for n in material.node_tree.nodes)


def world_uv(o, tile=2.2):
    """Project UVs from world coordinates: correct density and aspect at source."""
    if o.type != 'MESH' or not any(has_image(m) for m in o.data.materials):
        return o
    bpy.context.view_layer.objects.active = o
    o.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.cube_project(cube_size=tile, correct_aspect=True, scale_to_bounds=False)
    bpy.ops.object.mode_set(mode='OBJECT')
    return o


def bevel(o, width=.025, segments=2):
    if o.type != 'MESH' or not width:
        return o
    mod = o.modifiers.new('LS_Bevel', 'BEVEL')
    mod.width = width
    mod.segments = segments
    mod.limit_method = 'ANGLE'
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.modifier_apply(modifier=mod.name)
    for p in o.data.polygons:
        p.use_smooth = True
    return o


def cube(name, loc, half, material, rotation=(0, 0, 0), edge=.025):
    bpy.ops.mesh.primitive_cube_add(location=loc, rotation=rotation)
    o = bpy.context.object
    o.name = name
    o.scale = half
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(material)
    return world_uv(bevel(o, edge))


def cyl(name, loc, radius, depth, material, rotation=(0, 0, 0), verts=18, edge=.008):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=depth,
                                        location=loc, rotation=rotation)
    o = bpy.context.object
    o.name = name
    o.data.materials.append(material)
    # Cylinders need the same world-scale projection as boxes. Without UVs an
    # image material samples one texel, which is how the stair's column came to
    # be a black cylinder in the middle of the silo.
    return world_uv(bevel(o, edge))


def sphere(name, loc, radius, material, scale=(1, 1, 1), segments=14):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=radius, location=loc,
                                         segments=segments, ring_count=segments // 2)
    o = bpy.context.object
    o.name = name
    o.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(material)
    for p in o.data.polygons:
        p.use_smooth = True
    return o


def loft(name, rings, material, sides=10, subdiv=1, cap_start=True, cap_end=True):
    """Build a tapering tube through a stack of horizontal cross-sections.

    A ring is ((x, y, z), radius_x, radius_z). Consecutive rings are bridged
    with quads and the result is subdivision-smoothed, which is how you get a
    shoulder, a calf or a jawline out of a script — a stack of cylinders and
    boxes never reads as a person no matter how many pieces you use.
    """
    bm = bmesh.new()
    loops = []
    for (cx, cy, cz), rx, rz in rings:
        loop = []
        for i in range(sides):
            t = i * math.tau / sides
            loop.append(bm.verts.new((cx + math.cos(t) * rx, cy, cz + math.sin(t) * rz)))
        loops.append(loop)
    for lower, upper in zip(loops, loops[1:]):
        for i in range(sides):
            j = (i + 1) % sides
            bm.faces.new((lower[i], lower[j], upper[j], upper[i]))
    if cap_start:
        bm.faces.new(loops[0])
    if cap_end:
        bm.faces.new(loops[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    o = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(o)
    o.data.materials.append(material)
    if subdiv:
        bpy.context.view_layer.objects.active = o
        mod = o.modifiers.new('LS_Subsurf', 'SUBSURF')
        mod.levels = subdiv
        mod.render_levels = subdiv
        bpy.ops.object.modifier_apply(modifier=mod.name)
    for poly in o.data.polygons:
        poly.use_smooth = True
    return o


def parent_to(child, parent):
    """Nest one part under another, keeping it where it is.

    Exported as a glTF node hierarchy, so a shin swings from the knee of the
    thigh that carries it rather than from the figure's origin.
    """
    # The pivots are set immediately before this, and an object's matrix_world
    # is only recomputed when the view layer is evaluated. Reading it stale
    # bakes the wrong offset into the parent inverse and scatters the limbs.
    bpy.context.view_layer.update()
    child.parent = parent
    child.matrix_parent_inverse = parent.matrix_world.inverted()
    return child


def text_obj(name, text, loc, size, material, rotation=(0, math.pi, 0), extrude=.005):
    bpy.ops.object.text_add(location=loc, rotation=rotation)
    o = bpy.context.object
    o.name = name
    o.data.body = text
    o.data.align_x = 'CENTER'
    o.data.align_y = 'CENTER'
    o.data.size = size
    o.data.extrude = extrude
    o.data.materials.append(material)
    bpy.context.view_layer.objects.active = o
    o.select_set(True)
    bpy.ops.object.convert(target='MESH')
    return o


def set_pivot(o, pivot):
    """Move an object's origin without moving its geometry, so limbs hinge."""
    offset = o.location - Vector(pivot)
    o.data.transform(Matrix.Translation(offset))
    o.location = Vector(pivot)
    bpy.context.view_layer.update()
    return o


def limb(name, pivot, half, material, edge=.014):
    centre = (pivot[0], pivot[1] - half[1], pivot[2])
    return set_pivot(cube(name, centre, half, material, edge=edge), pivot)


def join_all(name):
    """Weld a whole assembly into one mesh.

    A residential level is well over a hundred pieces, and the silo instances
    twelve of them plus a stair per level. Joining each assembly keeps that to a
    handful of draw calls instead of thousands.
    """
    bpy.ops.object.select_all(action='DESELECT')
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    if not meshes:
        return None
    for o in meshes:
        o.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    bpy.ops.object.join()
    joined = bpy.context.object
    joined.name = name
    return joined


def add_orientation_marker():
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
    o = bpy.context.object
    o.name = ORIENTATION_MARKER
    o.empty_display_size = .01
    return o


def export(name):
    path = os.path.join(OUT, name)
    add_orientation_marker()
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', use_selection=True,
                              export_apply=True, export_yup=False,
                              export_keep_originals=True)
    print('EXPORT', path)


CONCRETE = image_pbr('HabConcrete', 'concrete__Concrete034_1K_Color.jpg',
                     'concrete__Concrete034_1K_NormalGL.jpg',
                     'concrete__Concrete034_1K_Roughness.jpg')
DECKPLATE = image_pbr('HabDeck', 'metal_floor_plate__DiamondPlate008C_1K_Color.jpg',
                      'metal_floor_plate__DiamondPlate008C_1K_NormalGL.jpg',
                      'metal_floor_plate__DiamondPlate008C_1K_Roughness.jpg', metallic=.45)
STEEL = mat('HabSteel', (.21, .23, .22), .78, .36)
BRUSHED = mat('HabBrushed', (.35, .37, .35), .72, .32)
DARK = mat('HabDarkSteel', (.06, .065, .062), .74, .42)
PAINT = mat('HabPaint', (.19, .24, .22), .10, .62)
DOORPAINT = mat('HabDoorPaint', (.15, .28, .30), .20, .48)
WARM = mat('HabWarmWood', (.30, .19, .11), 0, .68)
# Lit from inside: a wall of these is what makes the silo read as lived in.
WARMWINDOW = mat('HabWarmWindow', (.42, .27, .12), 0, .35, (1.0, .64, .30), 3.2)
CLOTH = mat('HabCloth', (.22, .24, .21), 0, .86)
BONE = mat('HabBone', (.68, .66, .60), 0, .88)
JACKET = mat('HabJacket', (.25, .28, .30), 0, .82)
TROUSER = mat('HabTrouser', (.17, .18, .21), 0, .86)
SKIN = mat('HabSkin', (.52, .38, .30), 0, .62)
HAIR = mat('HabHair', (.09, .07, .06), 0, .70)
GLASS = mat('HabGlass', (.05, .07, .08), .10, .10)
LEAF = mat('HabLeaf', (.10, .32, .12), 0, .64)
AMBER = mat('HabAmber', (.5, .33, .07), 0, .3, (1.0, .66, .16), 4.0)
GREENLIGHT = mat('HabGreenLight', (.10, .5, .24), 0, .3, (.20, 1.0, .48), 4.0)
REDLIGHT = mat('HabRedLight', (.5, .07, .05), 0, .3, (1.0, .14, .09), 4.0)
GROWLIGHT = mat('HabGrowLight', (.42, .18, .46), 0, .3, (.95, .35, 1.0), 6.0)
WHITELIGHT = mat('HabWhiteLight', (.5, .52, .5), 0, .25, (1.0, .96, .88), 2.4)
# Domestic light: warmer and softer than the strip lights on the walkways.
WARMLAMP = mat('HabWarmLamp', (.5, .42, .30), 0, .30, (1.0, .82, .55), 3.2)


def build_shell():
    """The outer concrete shell: forty-seven metres of silo wall."""
    clear_scene()
    height = LEVELS * LEVEL_HEIGHT + LEVEL_HEIGHT * 2
    panels = SEGMENTS * 2
    for i in range(panels):
        a = i * math.tau / panels
        x, z = math.cos(a) * (SHELL_RADIUS + .6), math.sin(a) * (SHELL_RADIUS + .6)
        cube(f'Shell_Panel_{i}', (x, height / 2, z),
             (math.pi * (SHELL_RADIUS + .6) / panels * 1.08, height / 2, .6), CONCRETE,
             rotation=(0, -a, 0), edge=.07)
        rib = a + math.tau / (panels * 2)
        cube(f'Shell_Rib_{i}', (math.cos(rib) * SHELL_RADIUS, height / 2, math.sin(rib) * SHELL_RADIUS),
             (.20, height / 2, .26), DARK, rotation=(0, -rib, 0), edge=.03)

    cube('Shell_Base', (0, -.5, 0), (SHELL_RADIUS + 1.4, .5, SHELL_RADIUS + 1.4), CONCRETE, edge=.1)
    cube('Shell_Cap', (0, height + .7, 0), (SHELL_RADIUS + 1.4, .7, SHELL_RADIUS + 1.4), CONCRETE, edge=.1)
    join_all('HabShell')
    export('hab_shell_v4.glb')


def arc_half(radius, overlap=1.06):
    """Half-width of one bay at a given radius.

    Every piece in the ring is a flat slab standing at its own radius, so they
    each need their own width. Sizing them all from one radius leaves metre-wide
    gaps between the outer apartment fronts and overlaps at the railing.
    """
    return math.pi * radius / SEGMENTS * overlap


def build_level():
    """One residential level: a narrow gallery ring against a dense facade.

    The reference silo reads as a wall of small dwellings — stacked units,
    pipes, vents, meter boxes and lit windows at different heights, broken up by
    heavy structural columns — not as flat painted panels.
    """
    clear_scene()
    step = math.tau / SEGMENTS
    deck_half = arc_half(DECK_OUTER)
    front_half = arc_half(DECK_OUTER - .35)
    rail_half = arc_half(WELL_RADIUS)
    mid = (DECK_OUTER + WELL_RADIUS) / 2
    depth = (DECK_OUTER - WELL_RADIUS) / 2

    for i in range(SEGMENTS):
        a = i * step
        x, z = math.cos(a) * mid, math.sin(a) * mid

        cube(f'Deck_{i}', (x, -.14, z), (deck_half, .14, depth), DECKPLATE, rotation=(0, -a, 0), edge=.03)
        # Balcony underside: ribbed, and visible from every level below.
        cube(f'Soffit_{i}', (x, -.30, z), (deck_half, .10, depth * .92), CONCRETE,
             rotation=(0, -a, 0), edge=.04)
        for r in range(3):
            cube(f'SoffitRib_{i}_{r}', (math.cos(a) * (WELL_RADIUS + 1.1 + r * 1.5), -.42,
                                        math.sin(a) * (WELL_RADIUS + 1.1 + r * 1.5)),
                 (deck_half * .92, .09, .12), DARK, rotation=(0, -a, 0), edge=.02)
        cube(f'Ceiling_{i}', (x, LEVEL_HEIGHT - .18, z), (deck_half, .18, depth), CONCRETE,
             rotation=(0, -a, 0), edge=.04)

        # --- Facade -----------------------------------------------------------
        # Built as two panels and a lintel around a real doorway, so a home is
        # somewhere you walk into rather than a painted rectangle.
        ox, oz = math.cos(a) * (DECK_OUTER - .35), math.sin(a) * (DECK_OUTER - .35)
        panel_half = (front_half - DOOR_HALF) / 2
        # Centred in the bay. It used to sit off to one side, which put it a
        # metre and a half away from the opening in the home's own front wall —
        # an open door that led into a wall.
        door_centre = 0
        for k in (-1, 1):
            offset = door_centre + k * (DOOR_HALF + panel_half)
            px = math.cos(a) * (DECK_OUTER - .35) + math.sin(a) * offset
            pz = math.sin(a) * (DECK_OUTER - .35) - math.cos(a) * offset
            cube(f'Front_{i}_{k}', (px, LEVEL_HEIGHT / 2, pz), (panel_half, LEVEL_HEIGHT / 2, .35),
                 PAINT, rotation=(0, -a, 0), edge=.04)
        lx = math.cos(a) * (DECK_OUTER - .35) + math.sin(a) * door_centre
        lz = math.sin(a) * (DECK_OUTER - .35) - math.cos(a) * door_centre
        cube(f'Lintel_{i}', (lx, (LEVEL_HEIGHT + 2.18) / 2, lz),
             (DOOR_HALF, (LEVEL_HEIGHT - 2.18) / 2, .35), PAINT, rotation=(0, -a, 0), edge=.04)
        cube(f'Reveal_{i}', (lx, 1.09, lz), (DOOR_HALF + .07, 1.09, .38), DARK,
             rotation=(0, -a, 0), edge=.02)

        def bay_point(offset, inset):
            """A point `offset` along the bay's chord, `inset` in from the wall."""
            return (math.cos(a) * (DECK_OUTER - inset) + math.sin(a) * offset,
                    math.sin(a) * (DECK_OUTER - inset) - math.cos(a) * offset)

        # A lit fanlight over the opening, and the unit's number plate.
        fx, fz = bay_point(door_centre, .30)
        cube(f'Fanlight_{i}', (fx, 2.42, fz), (DOOR_HALF * .82, .13, .05), WARMWINDOW,
             rotation=(0, -a, 0), edge=.012)
        nx, nz = bay_point(door_centre + DOOR_HALF + .28, .30)
        cube(f'Plate_{i}', (nx, 1.92, nz), (.13, .09, .02), AMBER, rotation=(0, -a, 0), edge=.006)

        # Two stacked dwellings' windows, warm from inside, with a shared sill.
        for row, (wy, wh) in enumerate(((1.22, .40), (2.28, .30))):
            for k in (-1, 1):
                wx, wz = bay_point(door_centre + k * (DOOR_HALF + panel_half) + k * .12, .30)
                cube(f'Win_{i}_{row}_{k}', (wx, wy, wz), (.34, wh, .04), WARMWINDOW,
                     rotation=(0, -a, 0), edge=.008)
                cube(f'WinFrame_{i}_{row}_{k}', (wx, wy, wz), (.40, wh + .07, .03), DARK,
                     rotation=(0, -a, 0), edge=.01)
                sx, sz = bay_point(door_centre + k * (DOOR_HALF + panel_half) + k * .12, .38)
                cube(f'WinSill_{i}_{row}_{k}', (sx, wy - wh - .09, sz), (.44, .05, .10), BRUSHED,
                     rotation=(0, -a, 0), edge=.012)

        # Service greeble: meter box, vent grille, riser pipes, cable run.
        mx, mz = bay_point(front_half * .80, .30)
        cube(f'Meter_{i}', (mx, 1.62, mz), (.20, .26, .09), BRUSHED, rotation=(0, -a, 0), edge=.02)
        cube(f'MeterFace_{i}', (mx, 1.62, mz - .0), (.14, .18, .10), DARK, rotation=(0, -a, 0), edge=.01)
        vx, vz = bay_point(front_half * .55, .30)
        cube(f'Vent_{i}', (vx, 2.72, vz), (.42, .22, .06), DARK, rotation=(0, -a, 0), edge=.015)
        for b in range(5):
            cube(f'VentBar_{i}_{b}', (vx, 2.60 + b * .06, vz), (.38, .015, .08), BRUSHED,
                 rotation=(0, -a, 0), edge=.004)
        for pi, po in enumerate((-.72, -.60)):
            px, pz = bay_point(front_half * po, .46)
            cyl(f'Riser_{i}_{pi}', (px, LEVEL_HEIGHT / 2, pz), .055, LEVEL_HEIGHT, BRUSHED,
                rotation=UP, verts=10)
        cx, cz = bay_point(front_half * .3, .52)
        cube(f'CableTray_{i}', (cx, LEVEL_HEIGHT - .46, cz), (front_half * .9, .05, .13), DARK,
             rotation=(0, -a, 0), edge=.015)

        # Strip lights across the width of the walkway. One row against the
        # doors left the outer half of a six-metre ring in the dark.
        for si, inset in enumerate((1.30, 3.40, 5.50)):
            lx, lz = bay_point(0, inset)
            span = arc_half(DECK_OUTER - inset) * .62
            cube(f'Strip_{i}_{si}', (lx, LEVEL_HEIGHT - .42, lz), (span, .05, .17), WHITELIGHT,
                 rotation=(0, -a, 0), edge=.015)
            cube(f'StripHood_{i}_{si}', (lx, LEVEL_HEIGHT - .31, lz), (span + .10, .08, .24), DARK,
                 rotation=(0, -a, 0), edge=.02)

        # --- Structure --------------------------------------------------------
        # The walkway is a clear circle: nothing stands on it. The structure
        # that used to be a pair of columns in the middle of the deck is a
        # pilaster built into the wall between two front doors instead, so you
        # can walk the whole ring without stepping round anything.
        ca = a + step / 2
        px, pz = math.cos(ca) * (DECK_OUTER - .48), math.sin(ca) * (DECK_OUTER - .48)
        cube(f'Pilaster_{i}', (px, LEVEL_HEIGHT / 2, pz), (.34, LEVEL_HEIGHT / 2, .22),
             CONCRETE, rotation=(0, -ca, 0), edge=.05)
        for cy in (.52, LEVEL_HEIGHT - .52):
            cube(f'PilasterBand_{i}_{cy:.1f}', (px, cy, pz), (.40, .09, .26),
                 BRUSHED, rotation=(0, -ca, 0), edge=.02)

        # --- Gallery railing --------------------------------------------------
        rx, rz = math.cos(a) * WELL_RADIUS, math.sin(a) * WELL_RADIUS
        cube(f'Kerb_{i}', (rx, .12, rz), (rail_half, .12, .09), CONCRETE, rotation=(0, -a, 0), edge=.02)
        for h in (.60, 1.08):
            cube(f'Rail_{i}_{h}', (rx, h, rz), (rail_half, .05, .05), BRUSHED,
                 rotation=(0, -a, 0), edge=.012)
        for k in range(5):
            offset = (k / 4 - .5) * 2 * rail_half
            px = math.cos(a) * WELL_RADIUS + math.sin(a) * offset
            pz = math.sin(a) * WELL_RADIUS - math.cos(a) * offset
            cube(f'Baluster_{i}_{k}', (px, .60, pz), (.035, .48, .035), BRUSHED, edge=.008)

    join_all('HabLevel')
    export('hab_level_v4.glb')


def build_stair():
    """One flight of the great stair, a full turn for a single level.

    A monumental spiral: four metres of tread from a slim service core out to a
    solid balustrade, wide enough for a crowd going both ways. A whole turn per
    level means every flight starts and finishes on the same bearing, so the
    landings stack one above the next and the stair is the same walk on every
    floor rather than a helix you have to hunt around.
    """
    clear_scene()
    turn = math.tau / STAIR_STEPS
    rise = LEVEL_HEIGHT / STAIR_STEPS
    inner, outer = STAIR_COLUMN, STAIR_RADIUS
    band = (outer - inner) / 2              # radial half-depth of one tread
    mid = inner + band
    going = turn * outer / 2 * 1.06         # tangential half-width, sized at the
                                            # outer edge so the wedges close up

    for i in range(STAIR_STEPS):
        a = i * turn
        x, z = math.cos(a) * mid, math.sin(a) * mid
        cube(f'Tread_{i}', (x, i * rise, z), (band, .085, going), CONCRETE,
             rotation=(0, -a, 0), edge=.02)
        cube(f'Riser_{i}', (x, i * rise - rise / 2, z), (band, rise / 2, .05), CONCRETE,
             rotation=(0, -a, 0), edge=.01)
        cube(f'Nose_{i}', (x, i * rise + .02, z), (band, .03, going * 1.02), DARK,
             rotation=(0, -a, 0), edge=.008)

        # Solid outer balustrade, capped with a steel handrail.
        ox, oz = math.cos(a) * (outer + .16), math.sin(a) * (outer + .16)
        cube(f'Balustrade_{i}', (ox, i * rise + .50, oz), (.16, .50, going * 1.04), CONCRETE,
             rotation=(0, -a, 0), edge=.03)
        cube(f'Handrail_{i}', (ox, i * rise + 1.06, oz), (.11, .05, going * 1.06), BRUSHED,
             rotation=(0, -a, 0), edge=.015)
        # ...and a rail on the core side, because the inside of a four-metre
        # tread is as long a drop as the outside.
        ix, iz = math.cos(a) * (inner + .12), math.sin(a) * (inner + .12)
        cube(f'InnerRail_{i}', (ix, i * rise + .98, iz), (.07, .045, going * 1.06), BRUSHED,
             rotation=(0, -a, 0), edge=.012)
        if i % 4 == 0:
            cube(f'InnerPost_{i}', (ix, i * rise + .50, iz), (.045, .50, .045), BRUSHED, edge=.01)
        if i % 9 == 0:
            lx, lz = math.cos(a) * (inner + .02), math.sin(a) * (inner + .02)
            cube(f'StairLamp_{i}', (lx, i * rise + 1.62, lz), (.07, .17, .10), WHITELIGHT,
                 rotation=(0, -a, 0), edge=.012)
            cube(f'StairLampHood_{i}', (lx, i * rise + 1.72, lz), (.10, .07, .16), DARK,
                 rotation=(0, -a, 0), edge=.015)

    # The service core the helix wraps: a slim shaft carrying the silo's risers,
    # the way the reference does it, rather than a drum that fills the well.
    cyl('StairCore', (0, LEVEL_HEIGHT / 2, 0), inner - .18, LEVEL_HEIGHT, CONCRETE,
        rotation=UP, verts=24, edge=.03)
    for i in range(7):
        a = i * math.tau / 7 + .35
        cyl(f'CorePipe_{i}', (math.cos(a) * (inner - .11), LEVEL_HEIGHT / 2, math.sin(a) * (inner - .11)),
            .048, LEVEL_HEIGHT, BRUSHED, rotation=UP, verts=8)
        for band_y in (.7, LEVEL_HEIGHT - .7):
            cube(f'PipeClamp_{i}_{band_y:.1f}',
                 (math.cos(a) * (inner - .11), band_y, math.sin(a) * (inner - .11)),
                 (.07, .04, .07), DARK, rotation=(0, -a, 0), edge=.008)
    for band_y in (.45, LEVEL_HEIGHT - .45):
        cyl(f'CoreBand_{band_y:.1f}', (0, band_y, 0), inner - .12, .18, BRUSHED,
            rotation=UP, verts=24, edge=.02)
    # A lit band at head height on every flight. Emissive costs nothing per
    # frame and stops the core reading as a hole punched in the silo.
    cyl('CoreGlow', (0, LEVEL_HEIGHT * .62, 0), inner - .15, .08, WHITELIGHT,
        rotation=UP, verts=24, edge=.01)
    join_all('HabStair')
    export('hab_stair_v4.glb')


def build_landing():
    """The platform where the stair meets a floor.

    Not a catwalk: it is as wide as the stair is, so stepping off the bottom
    tread puts you on a proper landing that carries you out to the walkway.
    """
    clear_scene()
    span = (WELL_RADIUS + .3 - STAIR_RADIUS) / 2
    half = 1.8
    cube('Landing_Deck', (0, -.09, 0), (half, .09, span), DECKPLATE, edge=.02)
    cube('Landing_Soffit', (0, -.26, 0), (half * .94, .10, span * .94), CONCRETE, edge=.03)
    for r in range(3):
        cube(f'Landing_Rib_{r}', (0, -.40, (r / 2 - .5) * span * 1.2), (half * .9, .08, .11),
             DARK, edge=.02)
    for side in (-1, 1):
        cube(f'Landing_Kerb_{side}', (side * half, .10, 0), (.07, .10, span), DARK, edge=.015)
        for h in (.58, 1.06):
            cube(f'Landing_Rail_{side}_{h}', (side * half, h, 0), (.05, .05, span), BRUSHED, edge=.012)
        for k in range(6):
            cube(f'Landing_Post_{side}_{k}', (side * half, .58, (k / 5 - .5) * 2 * span * .92),
                 (.04, .58, .04), BRUSHED, edge=.01)
    join_all('HabLanding')
    export('hab_landing_v4.glb')


def build_apartment():
    """A home. One of these sits behind every door in the silo.

    Laid out for a family: an entrance strip off the gallery, a living space
    with a table the family eats at, a galley kitchen down one wall, and a
    sleeping alcove with bunks behind a curtain. Built centred on the origin,
    facing -Z toward its own front door, so the runtime can rotate a copy into
    every bay.
    """
    clear_scene()
    # Sized from the bay: as wide as the narrow (front) end of the wedge, so
    # the rectangle fits inside it at every depth, and as deep as the gap
    # between the facade and the shell.
    width = 2 * arc_half(DECK_OUTER, overlap=1.0) - .3
    depth = APARTMENT_BACK - DECK_OUTER
    height = LEVEL_HEIGHT - .5
    half_w = width / 2
    half_d = depth / 2

    # --- Shell ---------------------------------------------------------------
    cube('Apt_Floor', (0, -.08, 0), (half_w, .08, half_d), WARM, edge=.02)
    cube('Apt_Ceiling', (0, height + .1, 0), (half_w, .10, half_d), CONCRETE, edge=.03)
    cube('Apt_Back', (0, height / 2, half_d), (half_w, height / 2, .18), CONCRETE, edge=.04)
    for side in (-1, 1):
        cube(f'Apt_Side_{side}', (side * half_w, height / 2, 0), (.18, height / 2, half_d),
             CONCRETE, edge=.04)
    # Front wall either side of the doorway, matching the facade's opening.
    panel = (half_w - DOOR_HALF) / 2
    for side in (-1, 1):
        cube(f'Apt_Front_{side}', (side * (DOOR_HALF + panel), height / 2, -half_d),
             (panel, height / 2, .18), PAINT, edge=.04)
    cube('Apt_FrontLintel', (0, (height + 2.18) / 2, -half_d),
         (DOOR_HALF, (height - 2.18) / 2, .18), PAINT, edge=.04)
    for i in range(6):
        cube(f'Apt_CeilBeam_{i}', (0, height - .06, -half_d + 1.0 + i * 1.35),
             (half_w - .2, .09, .13), DARK, edge=.02)
    cube('Apt_Skirting', (0, .09, half_d - .2), (half_w - .2, .09, .04), DARK, edge=.01)

    # --- Kitchen, down the left wall ----------------------------------------
    front = -half_d + 4.2
    cube('Apt_Counter', (-half_w + .55, .90, front - .6), (.42, .06, 2.1), BRUSHED, edge=.02)
    cube('Apt_CounterBody', (-half_w + .55, .44, front - .6), (.40, .44, 2.05), PAINT, edge=.03)
    for d in range(3):
        cube(f'Apt_Drawer_{d}', (-half_w + .14, .40 + d * .30, front - 1.4 + d * .1), (.02, .12, .55),
             DARK, edge=.01)
    cube('Apt_Sink', (-half_w + .55, .93, front + .35), (.30, .05, .40), STEEL, edge=.015)
    cyl('Apt_Tap', (-half_w + .78, 1.10, front + .35), .025, .34, BRUSHED, rotation=UP, verts=10)
    cube('Apt_Hob', (-half_w + .55, .97, front - 1.5), (.28, .03, .34), DARK, edge=.01)
    for r in range(2):
        for c in range(2):
            cyl(f'Apt_Ring_{r}_{c}', (-half_w + .40 + c * .30, .99, front - 1.66 + r * .30),
                .09, .02, STEEL, rotation=UP, verts=14)
    cube('Apt_Splashback', (-half_w + .20, 1.45, front - .6), (.04, .50, 2.05), STEEL, edge=.01)
    for shelf in range(2):
        cube(f'Apt_Shelf_{shelf}', (-half_w + .42, 2.05 + shelf * .42, front - .6), (.30, .04, 1.9),
             WARM, edge=.012)
        for j in range(6):
            cyl(f'Apt_Jar_{shelf}_{j}', (-half_w + .42, 2.19 + shelf * .42, front - 1.9 + j * .55),
                .07, .22, GLASS if j % 2 else BRUSHED, rotation=UP, verts=10)

    # --- The table the family eats at ---------------------------------------
    cube('Apt_Table', (.55, .74, front - .9), (1.05, .05, .62), WARM, edge=.02)
    for tx in (-.85, .85):
        for tz in (-.45, .45):
            cube(f'Apt_TableLeg_{tx}_{tz}', (.55 + tx, .36, front - .9 + tz), (.06, .36, .06), DARK, edge=.012)
    for side, sz in ((-1, -.95), (1, .95)):
        cube(f'Apt_Bench_{side}', (.55, .43, front - .9 + sz), (1.0, .05, .20), WARM, edge=.015)
        for bx in (-.75, .75):
            cube(f'Apt_BenchLeg_{side}_{bx}', (.55 + bx, .21, front - .9 + sz), (.05, .21, .16), DARK, edge=.01)
    for i, ox in enumerate((-.6, -.1, .45)):
        cyl(f'Apt_Bowl_{i}', (.55 + ox, .80, front - .9 + (i % 2) * .22), .10, .06, BRUSHED,
            rotation=UP, verts=14)
    # Two lamps: one over the table, one over the sleeping end. A ten-metre
    # room lit from one point is a lit corner and eight metres of dark.
    for name, lz in (('Table', front - .9), ('Back', half_d - 2.6)):
        cube(f'Apt_Lamp{name}', (.55, height - .28, lz), (.34, .06, .34), WARMLAMP, edge=.02)
        cube(f'Apt_LampShade{name}', (.55, height - .18, lz), (.40, .10, .40), DARK, edge=.03)
    # A reading light in the alcove, and the strip over the kitchen counter.
    cube('Apt_AlcoveLight', (half_w - .28, 2.30, half_d - 2.0), (.05, .10, .34), WARMLAMP, edge=.012)
    cube('Apt_CounterLight', (-half_w + .40, 1.98, front - .6), (.26, .04, 1.7), WARMLAMP, edge=.012)

    # --- Sleeping alcove, behind a curtain ----------------------------------
    # The back of the home is pinned to the rear wall, so a deeper bay gives
    # the family more living room rather than a corridor of dead floor.
    rear = half_d - 4.2
    cube('Apt_Divider', (half_w - 2.5, height / 2, rear + 1.1), (.10, height / 2, .9), PAINT, edge=.03)
    cube('Apt_Curtain', (half_w - 2.5, 1.55, rear + 2.4), (.06, 1.55, 1.5), CLOTH, edge=.02)
    for bunk in range(2):
        y = .55 + bunk * 1.15
        cube(f'Apt_BunkFrame_{bunk}', (half_w - 1.2, y, rear + 2.3), (1.05, .07, 1.85), STEEL, edge=.02)
        cube(f'Apt_Mattress_{bunk}', (half_w - 1.2, y + .14, rear + 2.3), (.95, .10, 1.75), CLOTH, edge=.05)
        cube(f'Apt_Pillow_{bunk}', (half_w - 1.2, y + .24, rear + 3.7), (.42, .09, .28), BONE, edge=.04)
        cube(f'Apt_Blanket_{bunk}', (half_w - 1.2, y + .22, rear + 1.7), (.93, .06, .90), PAINT, edge=.04)
    for px in (half_w - 2.2, half_w - .25):
        cube(f'Apt_BunkPost_{px:.1f}', (px, 1.35, rear + 1.4), (.06, 1.35, .06), STEEL, edge=.015)
        cube(f'Apt_BunkPost_b_{px:.1f}', (px, 1.35, rear + 3.9), (.06, 1.35, .06), STEEL, edge=.015)
    cube('Apt_Ladder_Rail', (half_w - 2.15, 1.0, rear + 1.5), (.04, 1.0, .04), BRUSHED, edge=.01)
    for r in range(3):
        cube(f'Apt_Ladder_Rung_{r}', (half_w - 1.75, .55 + r * .40, rear + 1.5), (.36, .03, .03),
             BRUSHED, edge=.008)

    # --- Living, and the small things that make it a home -------------------
    cube('Apt_Sofa_Base', (-1.4, .32, rear + 2.6), (1.0, .32, .48), PAINT, edge=.06)
    cube('Apt_Sofa_Back', (-1.4, .72, rear + 3.0), (1.0, .40, .16), PAINT, edge=.06)
    for cx in (-.5, .5):
        cube(f'Apt_Cushion_{cx}', (-1.4 + cx, .68, rear + 2.5), (.42, .10, .40), CLOTH, edge=.05)
    cube('Apt_Rug', (-1.0, .02, rear + 1.2), (1.5, .02, 1.1), CLOTH, edge=.01)
    cube('Apt_Chest', (-half_w + .6, .40, rear + 3.4), (.40, .40, .85), WARM, edge=.03)
    for i in range(3):
        cube(f'Apt_Crate_{i}', (-half_w + .7, .30 + i * .55, rear + 2.1), (.34, .26, .40),
             STEEL if i % 2 else PAINT, edge=.03)
    cube('Apt_Shelf_Tall', (half_w - .5, 1.30, front - 1.9), (.28, 1.30, .70), WARM, edge=.03)
    for b in range(4):
        cube(f'Apt_Books_{b}', (half_w - .5, .38 + b * .62, front - 1.9 + (b % 2) * .2),
             (.22, .16, .46), DOORPAINT if b % 2 else AMBER, edge=.01)
    # A child's drawing pinned by the door, and boots left in the entrance.
    cube('Apt_Drawing', (-DOOR_HALF - .5, 1.65, -half_d + .22), (.24, .30, .01), BONE, edge=.004)
    for bx in (DOOR_HALF + .35, DOOR_HALF + .62):
        cube(f'Apt_Boot_{bx:.2f}', (bx, .09, -half_d + .5), (.10, .09, .17), DARK, edge=.02)
    cube('Apt_Hook_Rail', (DOOR_HALF + .8, 1.85, -half_d + .22), (.55, .04, .06), BRUSHED, edge=.01)
    for c, cx in enumerate((-.3, .1, .45)):
        cube(f'Apt_Coat_{c}', (DOOR_HALF + .8 + cx, 1.40, -half_d + .30), (.16, .42, .09),
             CLOTH if c % 2 else PAINT, edge=.03)

    join_all('HabApartment')
    export('hab_apartment_v4.glb')


def build_door():
    """A single front door leaf, placed per bay so it can stand open.

    Built with its origin on the hinge rather than in the middle of the leaf,
    so an open door swings on its jamb instead of pivoting about its centre.
    """
    clear_scene()
    leaf = DOOR_HALF - .04
    cube('Door_Leaf', (leaf, 1.05, 0), (leaf, 1.05, .05), DOORPAINT, edge=.02)
    cube('Door_Kick', (leaf, .18, -.01), (leaf, .18, .06), BRUSHED, edge=.015)
    cube('Door_Rail', (leaf, 1.55, -.02), (leaf - .06, .05, .05), BRUSHED, edge=.01)
    cyl('Door_Handle', (leaf * 1.72, 1.05, -.10), .032, .20, BRUSHED, rotation=UP, verts=10)
    cube('Door_Plate', (leaf * 1.72, 1.30, -.06), (.07, .11, .02), BRUSHED, edge=.006)
    cube('Door_Hinge_lo', (.03, .55, .02), (.04, .09, .07), DARK, edge=.01)
    cube('Door_Hinge_hi', (.03, 1.65, .02), (.04, .09, .07), DARK, edge=.01)
    join_all('HabDoor')
    export('hab_door_v4.glb')


def build_hydroponics():
    """A grow rack. Three hundred people have to eat something."""
    clear_scene()
    cube('Hydro_Frame_L', (-1.15, .95, 0), (.06, .95, .55), BRUSHED, edge=.02)
    cube('Hydro_Frame_R', (1.15, .95, 0), (.06, .95, .55), BRUSHED, edge=.02)
    for tier in range(3):
        y = .42 + tier * .62
        cube(f'Hydro_Tray_{tier}', (0, y, 0), (1.15, .07, .52), STEEL, edge=.02)
        cube(f'Hydro_Water_{tier}', (0, y + .07, 0), (1.05, .015, .44), GLASS, edge=.005)
        for i in range(9):
            x = -.95 + i * .24
            sphere(f'Hydro_Plant_{tier}_{i}', (x, y + .22, 0), .13, LEAF, scale=(1, .85, .9))
            cube(f'Hydro_Stem_{tier}_{i}', (x, y + .12, 0), (.015, .09, .015), LEAF, edge=.004)
        if tier < 2:
            cube(f'Hydro_Lamp_{tier}', (0, y + .52, 0), (1.05, .035, .13), GROWLIGHT, edge=.01)
            cube(f'Hydro_LampHood_{tier}', (0, y + .58, 0), (1.10, .05, .18), DARK, edge=.015)
    cyl('Hydro_Pipe', (0, .95, -.5), .05, 1.9, BRUSHED, rotation=UP, verts=10)
    join_all('HabHydroponics')
    export('hab_hydroponics_v4.glb')


def build_commons():
    """Mess tables on the wide levels, where the silo actually feels inhabited."""
    clear_scene()
    cube('Commons_Table', (0, .74, 0), (1.6, .05, .55), WARM, edge=.02)
    for x in (-1.4, 1.4):
        cube(f'Commons_Leg_{x}', (x, .37, 0), (.07, .37, .45), STEEL, edge=.015)
    for side in (-1, 1):
        cube(f'Commons_Bench_{side}', (0, .43, side * .95), (1.55, .045, .22), WARM, edge=.015)
        for x in (-1.25, 1.25):
            cube(f'Commons_BenchLeg_{side}_{x}', (x, .21, side * .95), (.05, .21, .18), STEEL, edge=.01)
    for i, x in enumerate((-1.0, -.2, .7)):
        cyl(f'Commons_Mug_{i}', (x, .82, -.15 + i * .12), .055, .11, BRUSHED, rotation=UP, verts=12)
    cube('Commons_Tray', (.6, .78, .1), (.28, .02, .2), BRUSHED, edge=.008)
    join_all('HabCommons')
    export('hab_commons_v4.glb')


def build_secure_door():
    """The entrance to the secure unit at the top of the silo."""
    clear_scene()
    cube('Secure_Surround', (0, 1.75, 0), (2.1, 1.75, .32), CONCRETE, edge=.06)
    cube('Secure_Door', (0, 1.42, -.30), (1.25, 1.42, .12), STEEL, edge=.04)
    for i in range(7):
        cube(f'Secure_Rib_{i}', (0, .32 + i * .40, -.42), (1.20, .07, .04), DARK, edge=.012)
    cube('Secure_Jamb_L', (-1.42, 1.55, -.34), (.16, 1.55, .10), DARK, edge=.02)
    cube('Secure_Jamb_R', (1.42, 1.55, -.34), (.16, 1.55, .10), DARK, edge=.02)
    cube('Secure_Lintel', (0, 3.05, -.34), (1.58, .18, .10), DARK, edge=.02)
    cube('Secure_Reader', (1.72, 1.30, -.36), (.16, .24, .06), BRUSHED, edge=.015)
    cyl('Secure_ReaderLamp', (1.72, 1.44, -.43), .04, .03, REDLIGHT, verts=12)
    cube('Secure_Window', (0, 2.35, -.43), (.44, .20, .03), GLASS, edge=.008)
    cube('Secure_WindowFrame', (0, 2.35, -.42), (.52, .28, .02), DARK, edge=.01)
    text_obj('Secure_Sign', 'SECURE UNIT', (0, 3.42, -.36), .26, AMBER, rotation=(0, 0, 0), extrude=.01)
    text_obj('Secure_Notice', 'AUTHORISED PERSONNEL', (0, .78, -.44), .11, DARK,
             rotation=(0, 0, 0), extrude=.004)
    for i in range(9):
        a = i * math.tau / 9
        cube(f'Secure_Hazard_{i}', (-2.0 + i * .5, .06, -.55), (.22, .05, .16),
             AMBER if i % 2 == 0 else DARK, edge=.008)
    export('hab_secure_door_v4.glb')


def build_directory():
    """A level board, so a silo of twelve identical galleries is navigable."""
    clear_scene()
    cube('Directory_Board', (0, 1.35, 0), (.95, .70, .07), DARK, edge=.03)
    cube('Directory_Face', (0, 1.35, -.08), (.86, .62, .02), STEEL, edge=.01)
    text_obj('Directory_Title', 'SILO 47', (0, 1.82, -.11), .17, AMBER, rotation=(0, 0, 0), extrude=.006)
    text_obj('Directory_Body', 'RESIDENCE', (0, 1.48, -.11), .12, GREENLIGHT, rotation=(0, 0, 0), extrude=.004)
    text_obj('Directory_Count', 'POP 300', (0, 1.20, -.11), .12, GREENLIGHT, rotation=(0, 0, 0), extrude=.004)
    text_obj('Directory_Note', 'SECURE UNIT: TOP', (0, .95, -.11), .085, AMBER, rotation=(0, 0, 0), extrude=.003)
    cube('Directory_Post', (0, .48, .04), (.09, .48, .09), BRUSHED, edge=.02)
    cube('Directory_Foot', (0, .04, .04), (.30, .04, .30), DARK, edge=.01)
    join_all('HabDirectory')
    export('hab_directory_v4.glb')


# --- People ------------------------------------------------------------------
# The residents are the thing you stand closest to and look at longest, so they
# are built as lofted bodies rather than assembled from primitives: a torso that
# narrows at the waist and broadens across the chest, limbs that taper, a skull
# with a jaw. Every part is a smooth surface, and the joints nest, so a knee
# bends at the knee.

def _leg(prefix, side, jointed):
    # Every part runs past its joint and into the next one. Subdivision pulls a
    # capped tube's ends inward, so parts that merely met at the knee left a
    # visible gap there; overlapping them means the shrink happens inside the
    # neighbouring limb where nobody sees it.
    hip_x = side * .105
    thigh = loft(f'{prefix}_Leg_{side}', [
        ((hip_x, 1.04, 0), .112, .120),
        ((hip_x, .94, 0), .122, .132),
        ((hip_x, .84, 0), .114, .124),
        ((hip_x, .68, .004), .096, .106),
        ((hip_x, .56, .006), .080, .089),
        ((hip_x, .47, .006), .075, .084),
    ], TROUSER, sides=10)
    shin = loft(f'{prefix}_Shin_{side}', [
        ((hip_x, .63, .004), .074, .083),
        ((hip_x, .52, .002), .079, .088),
        ((hip_x, .43, -.008), .083, .095),
        ((hip_x, .30, .002), .060, .070),
        ((hip_x, .18, .010), .049, .057),
        ((hip_x, .11, .012), .046, .054),
    ], TROUSER, sides=10)
    boot = loft(f'{prefix}_Boot_{side}', [
        ((hip_x, .26, .008), .054, .060),
        ((hip_x, .16, .012), .062, .072),
        ((hip_x, .085, .028), .072, .112),
        ((hip_x, .035, .048), .074, .150),
        ((hip_x, .006, .052), .066, .148),
    ], DARK, sides=10)
    if jointed:
        set_pivot(thigh, (hip_x, .94, 0))
        set_pivot(shin, (hip_x, .54, 0))
        parent_to(boot, shin)
        parent_to(shin, thigh)
    return thigh


def _arm(prefix, side, jointed):
    sx = side * .205
    upper = loft(f'{prefix}_Arm_{side}', [
        ((sx * .92, 1.51, 0), .060, .064),
        ((sx, 1.44, 0), .072, .076),
        ((sx * 1.03, 1.34, 0), .065, .067),
        ((sx * 1.06, 1.20, .004), .056, .058),
        ((sx * 1.08, 1.10, .006), .051, .053),
        ((sx * 1.09, 1.03, .006), .049, .051),
    ], JACKET, sides=8)
    fore = loft(f'{prefix}_Forearm_{side}', [
        ((sx * 1.07, 1.17, .006), .049, .051),
        ((sx * 1.08, 1.09, .006), .053, .055),
        ((sx * 1.09, 1.00, .002), .048, .050),
        ((sx * 1.10, .90, .004), .039, .041),
        ((sx * 1.10, .82, .006), .034, .036),
    ], SKIN, sides=8)
    hand = loft(f'{prefix}_Hand_{side}', [
        ((sx * 1.10, .88, .006), .034, .036),
        ((sx * 1.10, .79, .012), .039, .053),
        ((sx * 1.10, .71, .014), .036, .051),
        ((sx * 1.10, .655, .008), .020, .032),
    ], SKIN, sides=8)
    cuff = loft(f'{prefix}_Cuff_{side}', [
        ((sx * 1.08, 1.14, .006), .058, .060),
        ((sx * 1.09, 1.02, .004), .054, .056),
    ], JACKET, sides=8, subdiv=0)
    if jointed:
        set_pivot(upper, (sx, 1.44, 0))
        set_pivot(fore, (sx * 1.08, 1.10, 0))
        parent_to(hand, fore)
        parent_to(cuff, fore)
        parent_to(fore, upper)
    return upper


def _head(prefix, jointed):
    head = loft(f'{prefix}_Head', [
        ((0, 1.455, 0), .062, .066),
        ((0, 1.520, 0), .066, .070),
        ((0, 1.560, .004), .076, .086),
        ((0, 1.600, .008), .088, .101),
        ((0, 1.648, .005), .098, .110),
        ((0, 1.698, 0), .099, .108),
        ((0, 1.740, -.005), .082, .092),
        ((0, 1.768, -.008), .046, .053),
    ], SKIN, sides=12)
    hair = loft(f'{prefix}_Hair', [
        ((0, 1.618, -.020), .104, .116),
        ((0, 1.660, -.016), .109, .120),
        ((0, 1.702, -.013), .108, .117),
        ((0, 1.744, -.014), .088, .098),
        ((0, 1.776, -.016), .050, .058),
    ], HAIR, sides=12)
    brow = cube(f'{prefix}_Brow', (0, 1.665, .090), (.066, .011, .024), HAIR, edge=.006)
    eyes = [sphere(f'{prefix}_Eye_{k}', (k * .036, 1.641, .088), .0145, DARK, segments=8)
            for k in (-1, 1)]
    nose = loft(f'{prefix}_Nose', [
        ((0, 1.646, .086), .017, .022),
        ((0, 1.619, .099), .021, .029),
        ((0, 1.601, .090), .016, .020),
    ], SKIN, sides=8)
    if jointed:
        set_pivot(head, (0, 1.50, 0))
        for part in (hair, brow, nose, *eyes):
            parent_to(part, head)
    return head


def humanoid(prefix, jointed):
    """One person, 1.76 m tall. Jointed for the ones that walk about."""
    torso = loft(f'{prefix}_Torso', [
        ((0, .80, 0), .150, .114),
        ((0, .88, 0), .168, .126),
        ((0, .99, 0), .157, .117),
        ((0, 1.10, -.002), .148, .107),
        ((0, 1.22, .004), .170, .120),
        ((0, 1.33, .006), .194, .131),
        ((0, 1.405, .002), .213, .126),
        ((0, 1.455, 0), .158, .112),
        ((0, 1.500, 0), .080, .082),
        ((0, 1.545, 0), .066, .068),
    ], JACKET, sides=12)
    belt = loft(f'{prefix}_Belt', [
        ((0, 1.055, -.002), .148, .108),
        ((0, 1.125, -.002), .150, .110),
    ], DARK, sides=12, subdiv=0)
    collar = loft(f'{prefix}_Collar', [
        ((0, 1.455, 0), .120, .095),
        ((0, 1.515, 0), .085, .080),
    ], DARK, sides=12, subdiv=0)
    badge = cube(f'{prefix}_Badge', (.125, 1.30, .120), (.038, .052, .008), AMBER, edge=.006)

    head = _head(prefix, jointed)
    arms = [_arm(prefix, side, jointed) for side in (-1, 1)]
    legs = [_leg(prefix, side, jointed) for side in (-1, 1)]

    if jointed:
        set_pivot(torso, (0, .92, 0))
        for part in (belt, collar, badge, head, *arms):
            parent_to(part, torso)
    return torso, legs


def build_resident():
    """A resident. Ten of these walk the galleries; three hundred live here."""
    clear_scene()
    humanoid('Resident', jointed=True)
    export('resident_v4.glb')


def build_resident_still():
    """A joined standing figure, for the crowds that line the galleries."""
    clear_scene()
    humanoid('Still', jointed=False)
    join_all('HabResidentStill')
    export('resident_still_v4.glb')


def build_access_hatch():
    """The hatch in the shelter floor, onto the silo's top landing."""
    clear_scene()
    cube('Hatch_Frame', (0, .06, 0), (1.05, .06, 1.05), DARK, edge=.03)
    cyl('Hatch_Ring', (0, .10, 0), .92, .10, BRUSHED, rotation=UP, verts=32, edge=.015)
    cyl('Hatch_Lid', (0, .17, 0), .84, .10, STEEL, rotation=UP, verts=32, edge=.02)
    for i in range(8):
        a = i * math.tau / 8
        cyl(f'Hatch_Bolt_{i}', (math.cos(a) * .70, .23, math.sin(a) * .70), .05, .05, DARK,
            rotation=UP, verts=10, edge=.006)
    bpy.ops.mesh.primitive_torus_add(location=(0, .30, 0), rotation=UP,
                                     major_radius=.34, minor_radius=.045,
                                     major_segments=28, minor_segments=10)
    wheel = bpy.context.object
    wheel.name = 'Hatch_Wheel'
    wheel.data.materials.append(REDLIGHT)
    for p in wheel.data.polygons:
        p.use_smooth = True
    for i in range(4):
        a = i * math.tau / 4
        cube(f'Hatch_Spoke_{i}', (math.cos(a) * .17, .30, math.sin(a) * .17), (.17, .025, .025),
             REDLIGHT, rotation=(0, -a, 0), edge=.006)
    cyl('Hatch_Hub', (0, .31, 0), .09, .09, DARK, rotation=UP, verts=16, edge=.006)
    for i in range(12):
        a = i * math.tau / 12
        cube(f'Hatch_Hazard_{i}', (math.cos(a) * .99, .13, math.sin(a) * .99), (.14, .03, .07),
             AMBER if i % 2 == 0 else DARK, rotation=(0, -a, 0), edge=.005)
    text_obj('Hatch_Label', 'SILO 47 ACCESS', (0, .13, -1.30), .15, AMBER,
             rotation=(-math.pi / 2, 0, 0), extrude=.004)
    export('access_hatch_v3.glb')


def build_supply_cache():
    clear_scene()
    cube('Cache_Pallet', (0, .07, 0), (.85, .07, .60), DARK, edge=.02)
    for i in range(4):
        cube(f'Cache_AmmoBox_{i}', (-.5 + (i % 2) * .55, .30 + (i // 2) * .34, -.16 + (i // 2) * .1),
             (.26, .16, .19), PAINT, edge=.03)
    for i in range(3):
        cube(f'Cache_RationBox_{i}', (.45, .22 + i * .28, .28), (.30, .14, .24), BRUSHED, edge=.025)
    cyl('Cache_Drum', (-.62, .38, .30), .26, .74, REDLIGHT, rotation=UP, verts=20, edge=.02)
    text_obj('Cache_Stencil', 'SILO STORES', (0, .62, -.61), .10, AMBER, extrude=.003)
    join_all('HabCache')
    export('silo_cache_v3.glb')


build_shell()
build_level()
build_stair()
build_landing()
build_apartment()
build_door()
build_hydroponics()
build_commons()
build_secure_door()
build_directory()
build_resident()
build_resident_still()
build_access_hatch()
build_supply_cache()
print('HABITAT DONE')

import bpy
import math
import os
from mathutils import Matrix, Vector

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'assets', 'blender')
TEX = os.path.join(ROOT, 'public', 'assets', 'textures')
os.makedirs(OUT, exist_ok=True)

# Silo 47 is a habitation silo: twelve residential levels and a secure unit at
# the top, built around an open light well. Nobody in it knows why the world
# ended. Same authoring convention as the other generators — Y is up, +Z is
# depth, a cylinder's own axis is local Z so a vertical one needs UP.
ORIENTATION_MARKER = 'LS_ORIENT_YUP'
UP = (math.pi / 2, 0, 0)

# --- Silo dimensions, shared with the runtime -------------------------------
SHELL_RADIUS = 17.4      # inner face of the outer shell
WELL_RADIUS = 5.4        # open light well down the middle
DECK_OUTER = 16.4
LEVEL_HEIGHT = 3.6
LEVELS = 12              # residential levels
SEGMENTS = 16            # apartment bays per level
STAIR_RADIUS = 4.1
STAIR_STEPS = 24         # per level


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
    return bevel(o, edge)


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
CLOTH = mat('HabCloth', (.22, .24, .21), 0, .86)
SKIN = mat('HabSkin', (.52, .38, .30), 0, .62)
HAIR = mat('HabHair', (.09, .07, .06), 0, .70)
GLASS = mat('HabGlass', (.05, .07, .08), .10, .10)
LEAF = mat('HabLeaf', (.10, .32, .12), 0, .64)
AMBER = mat('HabAmber', (.5, .33, .07), 0, .3, (1.0, .66, .16), 4.0)
GREENLIGHT = mat('HabGreenLight', (.10, .5, .24), 0, .3, (.20, 1.0, .48), 4.0)
REDLIGHT = mat('HabRedLight', (.5, .07, .05), 0, .3, (1.0, .14, .09), 4.0)
GROWLIGHT = mat('HabGrowLight', (.42, .18, .46), 0, .3, (.95, .35, 1.0), 6.0)
WHITELIGHT = mat('HabWhiteLight', (.5, .52, .5), 0, .25, (1.0, .96, .88), 5.5)


def build_shell():
    """The outer concrete shell: forty-seven metres of silo wall."""
    clear_scene()
    height = LEVELS * LEVEL_HEIGHT + LEVEL_HEIGHT * 2
    panels = SEGMENTS * 2
    for i in range(panels):
        a = i * math.tau / panels
        x, z = math.cos(a) * (SHELL_RADIUS + .6), math.sin(a) * (SHELL_RADIUS + .6)
        cube(f'Shell_Panel_{i}', (x, height / 2, z),
             (math.pi * SHELL_RADIUS / panels + .08, height / 2, .6), CONCRETE,
             rotation=(0, -a, 0), edge=.07)
        rib = a + math.tau / (panels * 2)
        cube(f'Shell_Rib_{i}', (math.cos(rib) * SHELL_RADIUS, height / 2, math.sin(rib) * SHELL_RADIUS),
             (.20, height / 2, .26), DARK, rotation=(0, -rib, 0), edge=.03)

    cube('Shell_Base', (0, -.5, 0), (SHELL_RADIUS + 1.4, .5, SHELL_RADIUS + 1.4), CONCRETE, edge=.1)
    cube('Shell_Cap', (0, height + .7, 0), (SHELL_RADIUS + 1.4, .7, SHELL_RADIUS + 1.4), CONCRETE, edge=.1)
    join_all('HabShell')
    export('hab_shell_v4.glb')


def build_level():
    """One residential level: deck, gallery railing and a ring of front doors."""
    clear_scene()
    step = math.tau / SEGMENTS
    bay = math.pi * (DECK_OUTER + WELL_RADIUS) / 2 / SEGMENTS

    for i in range(SEGMENTS):
        a = i * step
        mid = (DECK_OUTER + WELL_RADIUS) / 2
        x, z = math.cos(a) * mid, math.sin(a) * mid
        depth = (DECK_OUTER - WELL_RADIUS) / 2

        cube(f'Deck_{i}', (x, -.12, z), (bay + .10, .12, depth), DECKPLATE, rotation=(0, -a, 0), edge=.03)
        cube(f'Ceiling_{i}', (x, LEVEL_HEIGHT - .16, z), (bay + .10, .16, depth), CONCRETE,
             rotation=(0, -a, 0), edge=.04)

        # Apartment frontage against the outer wall: door, number plate, window.
        ox, oz = math.cos(a) * (DECK_OUTER - .3), math.sin(a) * (DECK_OUTER - .3)
        cube(f'Front_{i}', (ox, LEVEL_HEIGHT / 2, oz), (bay + .08, LEVEL_HEIGHT / 2, .30), PAINT,
             rotation=(0, -a, 0), edge=.04)
        dx, dz = math.cos(a) * (DECK_OUTER - .58), math.sin(a) * (DECK_OUTER - .58)
        cube(f'Door_{i}', (dx, 1.05, dz), (.52, 1.05, .06), DOORPAINT, rotation=(0, -a, 0), edge=.03)
        cube(f'DoorKick_{i}', (dx, .18, dz), (.52, .18, .08), BRUSHED, rotation=(0, -a, 0), edge=.02)
        cyl(f'DoorHandle_{i}', (math.cos(a) * (DECK_OUTER - .70) + math.sin(a) * .34,
                                1.05,
                                math.sin(a) * (DECK_OUTER - .70) - math.cos(a) * .34),
            .035, .22, BRUSHED, rotation=(0, -a, 0), verts=10)
        wx, wz = math.cos(a) * (DECK_OUTER - .56), math.sin(a) * (DECK_OUTER - .56)
        cube(f'Window_{i}', (wx + math.sin(a) * .95, 1.85, wz - math.cos(a) * .95),
             (.44, .40, .04), GLASS, rotation=(0, -a, 0), edge=.01)
        cube(f'WindowFrame_{i}', (wx + math.sin(a) * .95, 1.85, wz - math.cos(a) * .95),
             (.50, .46, .03), DARK, rotation=(0, -a, 0), edge=.012)

        # Gallery railing on the light-well edge.
        rx, rz = math.cos(a) * WELL_RADIUS, math.sin(a) * WELL_RADIUS
        for h in (.56, 1.06):
            cube(f'Rail_{i}_{h}', (rx, h, rz), (bay + .10, .045, .045), BRUSHED,
                 rotation=(0, -a, 0), edge=.012)
        cube(f'Kerb_{i}', (rx, .10, rz), (bay + .10, .10, .07), DARK, rotation=(0, -a, 0), edge=.015)
        for side in (-1, 1):
            px = math.cos(a) * WELL_RADIUS + math.sin(a) * side * bay
            pz = math.sin(a) * WELL_RADIUS - math.cos(a) * side * bay
            cube(f'Post_{i}_{side}', (px, .58, pz), (.05, .58, .05), BRUSHED, edge=.012)

        # A strip light over every second doorway.
        if i % 2 == 0:
            cube(f'Strip_{i}', (math.cos(a) * (DECK_OUTER - 1.5), LEVEL_HEIGHT - .38, math.sin(a) * (DECK_OUTER - 1.5)),
                 (.62, .05, .16), WHITELIGHT, rotation=(0, -a, 0), edge=.015)
            cube(f'StripHood_{i}', (math.cos(a) * (DECK_OUTER - 1.5), LEVEL_HEIGHT - .27, math.sin(a) * (DECK_OUTER - 1.5)),
                 (.70, .07, .22), DARK, rotation=(0, -a, 0), edge=.02)

        # Conduit and cable tray running the ceiling line.
        cyl(f'Conduit_{i}', (math.cos(a) * (DECK_OUTER - 2.4), LEVEL_HEIGHT - .5, math.sin(a) * (DECK_OUTER - 2.4)),
            .06, bay * 2.05, BRUSHED, rotation=(0, -a + math.pi / 2, 0), verts=10)

    join_all('HabLevel')
    export('hab_level_v4.glb')


def build_stair():
    """One spiral flight, rising a single level around the light well."""
    clear_scene()
    turn = math.radians(200) / STAIR_STEPS
    rise = LEVEL_HEIGHT / STAIR_STEPS
    for i in range(STAIR_STEPS):
        a = i * turn
        x, z = math.cos(a) * STAIR_RADIUS, math.sin(a) * STAIR_RADIUS
        cube(f'Tread_{i}', (x, i * rise, z), (.90, .04, .30), DECKPLATE, rotation=(0, -a, 0), edge=.012)
        cube(f'Riser_{i}', (x, i * rise - rise / 2, z), (.90, rise / 2, .03), DARK,
             rotation=(0, -a, 0), edge=.006)
        ox, oz = math.cos(a) * (STAIR_RADIUS + .88), math.sin(a) * (STAIR_RADIUS + .88)
        cube(f'RailPost_{i}', (ox, i * rise + .52, oz), (.035, .52, .035), BRUSHED, edge=.01)
        cube(f'RailTop_{i}', (ox, i * rise + 1.02, oz), (.05, .045, .33), BRUSHED,
             rotation=(0, -a, 0), edge=.012)
    cyl('StairColumn', (0, LEVEL_HEIGHT / 2, 0), STAIR_RADIUS - .95, LEVEL_HEIGHT, STEEL,
        rotation=UP, verts=28, edge=.02)
    join_all('HabStair')
    export('hab_stair_v4.glb')


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


def build_resident():
    """A resident. Ten of these walk the galleries; three hundred live here."""
    clear_scene()
    cube('Resident_Hips', (0, .90, 0), (.17, .12, .12), CLOTH, edge=.04)
    torso = cube('Resident_Torso', (0, 1.22, 0), (.20, .26, .13), CLOTH, edge=.05)
    set_pivot(torso, (0, .98, 0))
    cube('Resident_Chest', (0, 1.38, .02), (.185, .13, .12), CLOTH, edge=.05)
    cube('Resident_Collar', (0, 1.50, 0), (.13, .05, .11), DARK, edge=.02)
    cube('Resident_Badge', (.12, 1.34, .13), (.05, .07, .01), AMBER, edge=.006)

    head = sphere('Resident_Head', (0, 1.68, .01), .105, SKIN, scale=(.92, 1.04, .95))
    set_pivot(head, (0, 1.56, 0))
    sphere('Resident_Hair', (0, 1.73, -.01), .105, HAIR, scale=(.95, .78, .98))
    for side in (-1, 1):
        sphere(f'Resident_Eye_{side}', (side * .04, 1.70, .095), .015, DARK)
        arm = cube(f'Resident_Arm_{side}', (side * .245, 1.24, .01), (.055, .22, .06), CLOTH, edge=.02)
        set_pivot(arm, (side * .24, 1.45, 0))
        fore = cube(f'Resident_Forearm_{side}', (side * .25, .82, .02), (.048, .20, .055), SKIN, edge=.018)
        set_pivot(fore, (side * .25, 1.02, .01))
        limb(f'Resident_Leg_{side}', (side * .10, .86, 0), (.062, .25, .07), CLOTH, edge=.02)
        limb(f'Resident_Shin_{side}', (side * .10, .38, 0), (.052, .20, .06), CLOTH, edge=.018)
        cube(f'Resident_Boot_{side}', (side * .10, .05, .03), (.06, .05, .10), DARK, edge=.018)
    export('resident_v4.glb')


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
build_hydroponics()
build_commons()
build_secure_door()
build_directory()
build_resident()
build_access_hatch()
build_supply_cache()
print('HABITAT DONE')

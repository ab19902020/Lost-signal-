import bpy
import math
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'assets', 'blender')
TEX = os.path.join(ROOT, 'public', 'assets', 'textures')
os.makedirs(OUT, exist_ok=True)

# Same convention as the other generators: Y is up, +Z is depth, and the export
# keeps those axes. A cylinder's own axis is local Z, so a *vertical* cylinder
# needs rotation=(pi/2, 0, 0).
ORIENTATION_MARKER = 'LS_ORIENT_YUP'
UP = (math.pi / 2, 0, 0)


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
    m = bpy.data.materials.get(name)
    if m:
        return m
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
        nt.links.new(n.outputs['Color'], nm.inputs['Color'])
        nt.links.new(nm.outputs['Normal'], bsdf.inputs['Normal'])
    return m


def bevel(o, width=.03, segments=2):
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


def cube(name, loc, half, material, rotation=(0, 0, 0), edge=.03):
    bpy.ops.mesh.primitive_cube_add(location=loc, rotation=rotation)
    o = bpy.context.object
    o.name = name
    o.scale = half
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(material)
    return bevel(o, edge)


def cyl(name, loc, radius, depth, material, rotation=(0, 0, 0), verts=24, edge=.01):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=depth,
                                        location=loc, rotation=rotation)
    o = bpy.context.object
    o.name = name
    o.data.materials.append(material)
    return bevel(o, edge)


def cone(name, loc, radius, depth, material, rotation=(0, 0, 0), verts=24):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=radius, depth=depth,
                                    location=loc, rotation=rotation)
    o = bpy.context.object
    o.name = name
    o.data.materials.append(material)
    for p in o.data.polygons:
        p.use_smooth = True
    return o


def torus(name, loc, major, minor, material, rotation=(0, 0, 0), major_segments=32):
    bpy.ops.mesh.primitive_torus_add(location=loc, rotation=rotation,
                                     major_radius=major, minor_radius=minor,
                                     major_segments=major_segments, minor_segments=10)
    o = bpy.context.object
    o.name = name
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
    o.data.bevel_depth = .0015
    o.data.materials.append(material)
    bpy.context.view_layer.objects.active = o
    o.select_set(True)
    bpy.ops.object.convert(target='MESH')
    return o


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


CONCRETE = image_pbr('SiloConcrete', 'concrete__Concrete034_1K_Color.jpg',
                     'concrete__Concrete034_1K_NormalGL.jpg',
                     'concrete__Concrete034_1K_Roughness.jpg')
GRATE = image_pbr('SiloGrate', 'metal_floor_plate__DiamondPlate008C_1K_Color.jpg',
                  'metal_floor_plate__DiamondPlate008C_1K_NormalGL.jpg',
                  'metal_floor_plate__DiamondPlate008C_1K_Roughness.jpg', metallic=.5)
STEEL = mat('SiloSteel', (.20, .22, .21), .80, .34)
BRUSHED = mat('SiloBrushed', (.34, .36, .34), .74, .32)
DARK = mat('SiloDarkSteel', (.055, .06, .058), .76, .40)
GREEN = mat('SiloMilitaryGreen', (.07, .15, .09), .30, .58)
RED = mat('SiloWarningRed', (.34, .05, .04), .24, .50)
YELLOW = mat('SiloHazardYellow', (.42, .33, .05), .22, .52)
BONE = mat('SiloBone', (.44, .43, .40), .12, .55)
GLASS = mat('SiloGlass', (.04, .05, .05), .12, .12)
AMBER_GLOW = mat('SiloAmberGlow', (.5, .32, .06), 0, .3, (1.0, .62, .12), 5.0)
GREEN_GLOW = mat('SiloGreenGlow', (.08, .5, .22), 0, .3, (.16, 1.0, .44), 5.0)
RED_GLOW = mat('SiloRedGlow', (.5, .06, .05), 0, .3, (1.0, .12, .08), 5.0)

# Silo geometry constants shared by the chamber and the runtime placement.
SILO_RADIUS = 5.6
SILO_HEIGHT = 17.0
CATWALK_Y = 7.2
WALL_SEGMENTS = 16


def build_chamber():
    """The silo shell: floor, ring wall, ribs, ceiling blast doors, flame trench."""
    clear_scene()
    cube('Silo_FloorSlab', (0, -.3, 0), (SILO_RADIUS + .9, .3, SILO_RADIUS + .9), CONCRETE, edge=.1)
    cyl('Silo_FloorPad', (0, .02, 0), SILO_RADIUS, .05, GRATE, rotation=UP, verts=48, edge=.02)

    # Flame trench under the mount, and its grating.
    torus('Silo_Trench', (0, .07, 0), 2.4, .30, DARK, rotation=UP, major_segments=48)
    for i in range(28):
        a = i * math.tau / 28
        cube(f'Silo_TrenchBar_{i}', (math.cos(a) * 2.4, .18, math.sin(a) * 2.4),
             (.30, .02, .05), BRUSHED, rotation=(0, -a, 0), edge=.006)

    # The wall is built from flat panels so the room reads as a real silo and so
    # the runtime can derive one collision box per panel.
    for i in range(WALL_SEGMENTS):
        a = i * math.tau / WALL_SEGMENTS
        x, z = math.cos(a) * (SILO_RADIUS + .45), math.sin(a) * (SILO_RADIUS + .45)
        cube(f'Silo_WallPanel_{i}', (x, SILO_HEIGHT / 2, z),
             (1.16, SILO_HEIGHT / 2, .45), CONCRETE, rotation=(0, -a, 0), edge=.06)
        # Vertical stiffening rib on every panel joint.
        rx, rz = math.cos(a + math.tau / (WALL_SEGMENTS * 2)), math.sin(a + math.tau / (WALL_SEGMENTS * 2))
        cube(f'Silo_Rib_{i}', (rx * SILO_RADIUS, SILO_HEIGHT / 2, rz * SILO_RADIUS),
             (.16, SILO_HEIGHT / 2 - .4, .22), DARK,
             rotation=(0, -(a + math.tau / (WALL_SEGMENTS * 2)), 0), edge=.03)

    # Horizontal service bands.
    for y in (3.4, 10.6, 14.2):
        torus(f'Silo_Band_{y}', (0, y, 0), SILO_RADIUS + .06, .09, BRUSHED, rotation=UP, major_segments=48)

    # Ceiling: a concrete cap split by two sliding blast doors.
    for side in (-1, 1):
        cube(f'Silo_BlastDoor_{side}', (side * 3.0, SILO_HEIGHT + .35, 0),
             (2.85, .38, SILO_RADIUS + .9), CONCRETE, edge=.08)
        for i in range(6):
            cube(f'Silo_DoorRib_{side}_{i}', (side * 3.0, SILO_HEIGHT - .05, -4.6 + i * 1.85),
                 (2.7, .12, .16), DARK, edge=.03)

    # Cable runs and conduit climbing one wall.
    for i, x in enumerate((-.55, -.20, .15)):
        cyl(f'Silo_Conduit_{i}', (SILO_RADIUS - .25 + x * .1, SILO_HEIGHT / 2, x),
            .05, SILO_HEIGHT - 1.0, BRUSHED, rotation=UP, verts=14, edge=.006)

    # Hazard paint at the foot of the wall.
    for i in range(WALL_SEGMENTS * 2):
        a = i * math.tau / (WALL_SEGMENTS * 2)
        cube(f'Silo_Hazard_{i}', (math.cos(a) * (SILO_RADIUS - .02), .55, math.sin(a) * (SILO_RADIUS - .02)),
             (.28, .16, .04), YELLOW if i % 2 == 0 else DARK, rotation=(0, -a, 0), edge=.008)

    text_obj('Silo_Designation', 'SILO 47-A', (0, 2.6, -SILO_RADIUS + .12), .46, YELLOW,
             rotation=(0, 0, 0), extrude=.01)
    export('silo_chamber_v3.glb')


def build_catwalk():
    """One catwalk segment. Eight of these ring the silo at the service level."""
    clear_scene()
    cube('Catwalk_Deck', (0, 0, 0), (1.6, .05, .85), GRATE, edge=.02)
    for i in range(9):
        cube(f'Catwalk_Bar_{i}', (-1.4 + i * .35, .06, 0), (.05, .02, .82), DARK, edge=.005)
    cube('Catwalk_Kerb', (0, .10, .84), (1.6, .10, .04), DARK, edge=.01)
    # Outer railing.
    for i, y in enumerate((.52, 1.02)):
        cube(f'Catwalk_Rail_{i}', (0, y, -.82), (1.6, .045, .045), BRUSHED, edge=.012)
    for x in (-1.5, -.5, .5, 1.5):
        cube(f'Catwalk_Post_{x}', (x, .56, -.82), (.045, .56, .045), BRUSHED, edge=.012)
    # Bracket back to the wall.
    cube('Catwalk_Bracket', (0, -.22, .70), (1.5, .18, .10), DARK, rotation=(-.35, 0, 0), edge=.02)
    export('silo_catwalk_v3.glb')


def build_stairs():
    """A straight flight from the catwalk down to the silo floor."""
    clear_scene()
    steps = 24
    rise = CATWALK_Y / steps
    run = .30
    for i in range(steps):
        cube(f'Stair_Tread_{i}', (0, CATWALK_Y - (i + 1) * rise, i * run),
             (.72, .035, run / 2), GRATE, edge=.012)
        cube(f'Stair_Riser_{i}', (0, CATWALK_Y - (i + 1) * rise + rise / 2, i * run + run / 2),
             (.72, rise / 2, .02), DARK, edge=.006)
    for side in (-1, 1):
        # The stringer is a beam lying along the slope, so its half-extents are
        # measured along its own axis and then rotated — not the flight's
        # bounding box, which would inflate into a ten-metre diagonal slab.
        span = math.hypot(CATWALK_Y, steps * run) / 2 + .2
        cube(f'Stair_Stringer_{side}', (side * .76, CATWALK_Y / 2, steps * run / 2),
             (.06, .11, span), DARK,
             rotation=(math.atan2(CATWALK_Y, steps * run), 0, 0), edge=.02)
        for i in range(0, steps, 4):
            cube(f'Stair_Post_{side}_{i}', (side * .76, CATWALK_Y - (i + 1) * rise + .55, i * run),
                 (.04, .55, .04), BRUSHED, edge=.01)
    export('silo_stairs_v3.glb')


def build_missile():
    """The reason the silo exists. Eleven metres of decommissioned deterrent."""
    clear_scene()
    # Launch mount and umbilical.
    cyl('Missile_MountRing', (0, .28, 0), 1.35, .55, DARK, rotation=UP, verts=32, edge=.03)
    for i in range(6):
        a = i * math.tau / 6
        cube(f'Missile_MountLeg_{i}', (math.cos(a) * 1.55, .45, math.sin(a) * 1.55),
             (.14, .45, .22), STEEL, rotation=(0, -a, 0), edge=.02)

    cyl('Missile_Body', (0, 5.6, 0), .80, 9.0, BONE, rotation=UP, verts=32, edge=.02)
    torus('Missile_Seam_A', (0, 3.4, 0), .81, .035, BRUSHED, rotation=UP, major_segments=32)
    torus('Missile_Seam_B', (0, 7.2, 0), .81, .035, BRUSHED, rotation=UP, major_segments=32)
    cone('Missile_Nose', (0, 11.35, 0), .80, 2.5, BONE, rotation=UP, verts=32)
    cyl('Missile_Skirt', (0, .95, 0), .86, .55, DARK, rotation=UP, verts=32, edge=.02)
    for i in range(4):
        a = i * math.tau / 4
        cube(f'Missile_Fin_{i}', (math.cos(a) * 1.25, 1.5, math.sin(a) * 1.25),
             (.55, .95, .07), STEEL, rotation=(0, -a, 0), edge=.03)
    for i in range(3):
        cube(f'Missile_Band_{i}', (0, 2.2 + i * 3.1, -.82), (.44, .30, .03), RED, edge=.01)
    text_obj('Missile_Stencil', 'US AIR FORCE', (0, 8.6, -.83), .19, DARK,
             rotation=(0, 0, 0), extrude=.004)

    # Umbilical tower alongside, with swing arms into the body.
    cube('Umbilical_Mast', (2.6, 5.8, 0), (.34, 5.8, .34), STEEL, edge=.04)
    for i in range(5):
        y = 1.9 + i * 2.1
        cube(f'Umbilical_Arm_{i}', (1.75, y, 0), (.55, .09, .12), BRUSHED, edge=.02)
        cyl(f'Umbilical_Hose_{i}', (1.35, y - .12, 0), .07, .5, DARK, rotation=(0, math.pi / 2, 0), verts=12)
    for i in range(9):
        cube(f'Umbilical_Rung_{i}', (2.95, 1.1 + i * 1.25, 0), (.02, .02, .28), BRUSHED, edge=.004)
    export('silo_missile_v3.glb')


def build_console():
    """Launch control: two key slots, a status wall and a very committed lever."""
    clear_scene()
    cube('Launch_Desk', (0, .48, 0), (1.45, .48, .55), GREEN, edge=.06)
    cube('Launch_Top', (0, .99, 0), (1.50, .06, .60), BRUSHED, edge=.03)
    cube('Launch_Backboard', (0, 1.62, .42), (1.45, .58, .12), DARK, edge=.05)
    cube('Launch_Screen', (0, 1.66, .28), (1.16, .42, .03), GLASS, edge=.01)
    text_obj('Launch_ScreenText', 'ARMING SEQUENCE', (0, 1.78, .245), .13, GREEN_GLOW, extrude=.004)
    text_obj('Launch_ScreenState', 'KEYS: 0 / 2', (0, 1.55, .245), .11, AMBER_GLOW, extrude=.004)

    for side, name in ((-1, 'A'), (1, 'B')):
        cyl(f'Launch_KeySlot_{name}', (side * .92, 1.00, -.16), .11, .06, BRUSHED, rotation=UP, verts=20, edge=.008)
        cyl(f'Launch_KeyBarrel_{name}', (side * .92, 1.04, -.16), .045, .05, DARK, rotation=UP, verts=14, edge=.004)
        text_obj(f'Launch_KeyLabel_{name}', f'KEY {name}', (side * .92, 1.01, -.34), .07, YELLOW,
                 rotation=(-math.pi / 2, 0, 0), extrude=.002)

    # The lever, under a hinged guard.
    cube('Launch_LeverBase', (0, 1.02, -.20), (.20, .05, .16), DARK, edge=.02)
    cyl('Launch_Lever', (0, 1.24, -.24), .035, .42, RED, rotation=(-.35, 0, 0), verts=14)
    cyl('Launch_LeverKnob', (0, 1.44, -.31), .075, .09, RED, rotation=(-.35, 0, 0), verts=18)
    cube('Launch_Guard', (0, 1.30, -.20), (.26, .28, .02), YELLOW, rotation=(-.9, 0, 0), edge=.01)

    for i, x in enumerate((-.55, -.20, .15, .50)):
        material = GREEN_GLOW if i < 2 else (AMBER_GLOW if i == 2 else RED_GLOW)
        cyl(f'Launch_Lamp_{i}', (x, 1.06, .12), .05, .04, material, rotation=UP, verts=16, edge=.006)
    export('silo_console_v3.glb')


def build_hatch():
    """The floor hatch in the shelter that opens onto the silo access shaft."""
    clear_scene()
    cube('Hatch_Frame', (0, .06, 0), (1.05, .06, 1.05), DARK, edge=.03)
    cyl('Hatch_Ring', (0, .10, 0), .92, .10, BRUSHED, rotation=UP, verts=32, edge=.015)
    cyl('Hatch_Lid', (0, .17, 0), .84, .10, STEEL, rotation=UP, verts=32, edge=.02)
    for i in range(8):
        a = i * math.tau / 8
        cyl(f'Hatch_Bolt_{i}', (math.cos(a) * .70, .23, math.sin(a) * .70), .05, .05, DARK,
            rotation=UP, verts=10, edge=.006)
    torus('Hatch_Wheel', (0, .30, 0), .34, .045, RED, rotation=UP, major_segments=28)
    for i in range(4):
        a = i * math.tau / 4
        cube(f'Hatch_Spoke_{i}', (math.cos(a) * .17, .30, math.sin(a) * .17), (.17, .025, .025),
             RED, rotation=(0, -a, 0), edge=.006)
    cyl('Hatch_Hub', (0, .31, 0), .09, .09, DARK, rotation=UP, verts=16, edge=.006)
    for i in range(12):
        a = i * math.tau / 12
        cube(f'Hatch_Hazard_{i}', (math.cos(a) * .99, .13, math.sin(a) * .99), (.14, .03, .07),
             YELLOW if i % 2 == 0 else DARK, rotation=(0, -a, 0), edge=.005)
    text_obj('Hatch_Label', 'SILO ACCESS', (0, .13, -1.28), .16, YELLOW,
             rotation=(-math.pi / 2, 0, 0), extrude=.004)
    export('access_hatch_v3.glb')


def build_supply_cache():
    """Something worth the climb: ammunition and rations on a service pallet."""
    clear_scene()
    cube('Cache_Pallet', (0, .07, 0), (.85, .07, .60), DARK, edge=.02)
    for i in range(4):
        cube(f'Cache_AmmoBox_{i}', (-.5 + (i % 2) * .55, .30 + (i // 2) * .34, -.16 + (i // 2) * .1),
             (.26, .16, .19), GREEN, edge=.03)
        cube(f'Cache_AmmoLatch_{i}', (-.5 + (i % 2) * .55, .30 + (i // 2) * .34, -.36 + (i // 2) * .1),
             (.05, .05, .02), BRUSHED, edge=.006)
    for i in range(3):
        cube(f'Cache_RationBox_{i}', (.45, .22 + i * .28, .28), (.30, .14, .24), BONE, edge=.025)
    cyl('Cache_Drum', (-.62, .38, .30), .26, .74, RED, rotation=UP, verts=20, edge=.02)
    text_obj('Cache_Stencil', '5.56 / RATIONS', (0, .62, -.61), .10, YELLOW, extrude=.003)
    export('silo_cache_v3.glb')


build_chamber()
build_catwalk()
build_stairs()
build_missile()
build_console()
build_hatch()
build_supply_cache()
print('SILO DONE')

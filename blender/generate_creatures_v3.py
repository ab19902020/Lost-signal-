import bpy
import math
import os
from mathutils import Matrix, Vector

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'assets', 'blender')
os.makedirs(OUT, exist_ok=True)

# Same authoring convention as the other generators: Y is up, +Z is forward,
# and the export keeps those axes (see add_orientation_marker / export_yup).
ORIENTATION_MARKER = 'LS_ORIENT_YUP'


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


def smooth(o, bevel_width=.02):
    if o.type != 'MESH':
        return o
    if bevel_width:
        mod = o.modifiers.new('LS_Bevel', 'BEVEL')
        mod.width = bevel_width
        mod.segments = 2
        mod.limit_method = 'ANGLE'
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.modifier_apply(modifier=mod.name)
    for p in o.data.polygons:
        p.use_smooth = True
    return o


def cube(name, loc, half, material, rotation=(0, 0, 0), edge=.02):
    bpy.ops.mesh.primitive_cube_add(location=loc, rotation=rotation)
    o = bpy.context.object
    o.name = name
    o.scale = half
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(material)
    return smooth(o, edge)


def sphere(name, loc, radius, material, scale=(1, 1, 1), segments=16):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=radius, location=loc, segments=segments, ring_count=segments // 2)
    o = bpy.context.object
    o.name = name
    o.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(material)
    return smooth(o, 0)


def cyl(name, loc, radius, depth, material, rotation=(0, 0, 0), verts=14):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=depth, location=loc, rotation=rotation)
    o = bpy.context.object
    o.name = name
    o.data.materials.append(material)
    return smooth(o, .008)


def set_pivot(o, pivot):
    """Move an object's origin to `pivot` without moving the geometry.

    Limbs have to rotate about the joint they hang from, and the runtime
    animates these nodes directly, so the origin has to sit at the hip or
    shoulder rather than in the middle of the limb.
    """
    offset = o.location - Vector(pivot)
    o.data.transform(Matrix.Translation(offset))
    o.location = Vector(pivot)
    return o


def limb(name, pivot, half, material, edge=.015):
    """A limb hanging down from `pivot`, with its origin at the joint."""
    centre = (pivot[0], pivot[1] - half[1], pivot[2])
    o = cube(name, centre, half, material, edge=edge)
    return set_pivot(o, pivot)


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
                              export_apply=True, export_yup=False)
    print('EXPORT', path)


HIDE = mat('DeerHide', (.24, .15, .09), 0, .78)
HIDE_PALE = mat('DeerBelly', (.42, .33, .24), 0, .8)
ANTLER = mat('Antler', (.44, .40, .31), 0, .62)
FUR = mat('RabbitFur', (.34, .31, .27), 0, .85)
FUR_PALE = mat('RabbitBelly', (.52, .49, .44), 0, .86)
EYE = mat('CreatureEye', (.03, .02, .02), .1, .18)
FLESH = mat('InfectedFlesh', (.30, .29, .25), 0, .74)
CLOTH = mat('InfectedCloth', (.14, .16, .13), 0, .88)
BLOOD = mat('InfectedBlood', (.20, .04, .03), 0, .55)
EYE_GLOW = mat('InfectedEye', (.5, .45, .2), 0, .3, (.9, .72, .22), 2.6)


def build_deer():
    """A red deer, roughly 1.35 m at the shoulder, facing +Z."""
    clear_scene()
    body = sphere('Deer_Body', (0, .92, 0), .34, HIDE, scale=(.85, .82, 1.75))
    sphere('Deer_Belly', (0, .74, 0), .30, HIDE_PALE, scale=(.78, .55, 1.55))
    cube('Deer_Haunch', (0, .95, -.44), (.30, .28, .22), HIDE, edge=.09)
    cube('Deer_Shoulder', (0, .98, .40), (.29, .26, .22), HIDE, edge=.09)

    neck = cube('Deer_Neck', (0, 1.18, .58), (.13, .30, .13), HIDE, rotation=(-.55, 0, 0), edge=.05)
    set_pivot(neck, (0, .98, .48))
    head = sphere('Deer_Head', (0, 1.46, .86), .15, HIDE, scale=(.8, .82, 1.45))
    set_pivot(head, (0, 1.40, .74))
    cube('Deer_Muzzle', (0, 1.40, 1.06), (.065, .06, .10), HIDE_PALE, edge=.035)
    for side in (-1, 1):
        cube(f'Deer_Ear_{side}', (side * .13, 1.55, .80), (.035, .09, .05), HIDE,
             rotation=(0, 0, side * .5), edge=.02)
        sphere(f'Deer_Eye_{side}', (side * .105, 1.47, .94), .028, EYE)
        # Antlers: a main beam with three tines.
        cyl(f'Deer_Antler_{side}', (side * .09, 1.76, .74), .022, .48, ANTLER,
            rotation=(.35, 0, side * .38))
        for i, (h, angle) in enumerate(((.12, .9), (.26, .7), (.38, .5))):
            cyl(f'Deer_Tine_{side}_{i}', (side * (.13 + i * .04), 1.72 + h, .70 - i * .05),
                .014, .17, ANTLER, rotation=(angle, 0, side * .9))

    for name, x, z in (('FL', -.20, .42), ('FR', .20, .42), ('BL', -.20, -.44), ('BR', .20, -.44)):
        limb(f'Deer_Leg{name}', (x, .86, z), (.055, .43, .07), HIDE, edge=.025)
        limb(f'Deer_Hoof{name}', (x, .04, z), (.055, .04, .075), EYE, edge=.012)

    tail = cube('Deer_Tail', (0, 1.02, -.62), (.055, .10, .05), HIDE_PALE, edge=.03)
    set_pivot(tail, (0, 1.10, -.56))
    export('deer_v3.glb')


def build_rabbit():
    """A hare, roughly 0.32 m tall, facing +Z."""
    clear_scene()
    sphere('Rabbit_Body', (0, .17, 0), .11, FUR, scale=(.92, .95, 1.5))
    sphere('Rabbit_Belly', (0, .12, 0), .09, FUR_PALE, scale=(.85, .6, 1.3))
    head = sphere('Rabbit_Head', (0, .22, .16), .075, FUR, scale=(.95, .95, 1.05))
    set_pivot(head, (0, .19, .12))
    cube('Rabbit_Muzzle', (0, .20, .23), (.028, .024, .03), FUR_PALE, edge=.014)
    for side in (-1, 1):
        ear = cube(f'Rabbit_Ear_{side}', (side * .035, .34, .13), (.018, .075, .012), FUR,
                   rotation=(-.12, 0, side * .18), edge=.008)
        set_pivot(ear, (side * .035, .26, .14))
        sphere(f'Rabbit_Eye_{side}', (side * .055, .23, .20), .015, EYE)
    for name, x, z in (('FL', -.055, .09), ('FR', .055, .09)):
        limb(f'Rabbit_Leg{name}', (x, .13, z), (.02, .07, .025), FUR, edge=.01)
    for name, x, z in (('BL', -.062, -.07), ('BR', .062, -.07)):
        cube(f'Rabbit_Haunch{name}', (x, .13, z), (.032, .055, .06), FUR, edge=.025)
        limb(f'Rabbit_Leg{name}', (x, .10, z - .02), (.022, .06, .028), FUR, edge=.01)
    sphere('Rabbit_Tail', (0, .18, -.17), .032, FUR_PALE)
    export('rabbit_v3.glb')


def build_infected():
    """An infected survivor, 1.78 m, facing +Z, limbs pivoted for a walk cycle."""
    clear_scene()
    cube('Infected_Hips', (0, .92, 0), (.17, .12, .12), CLOTH, edge=.05)
    torso = cube('Infected_Torso', (0, 1.24, -.02), (.20, .26, .13), CLOTH, edge=.06)
    set_pivot(torso, (0, 1.00, 0))
    cube('Infected_Chest', (0, 1.38, .02), (.19, .14, .12), FLESH, edge=.06)
    cube('Infected_Wound', (.07, 1.30, .13), (.07, .09, .02), BLOOD, edge=.01)

    head = sphere('Infected_Head', (0, 1.68, .01), .105, FLESH, scale=(.92, 1.05, .95))
    set_pivot(head, (0, 1.56, 0))
    cube('Infected_Jaw', (0, 1.61, .07), (.055, .035, .05), FLESH, edge=.02)
    for side in (-1, 1):
        sphere(f'Infected_Eye_{side}', (side * .042, 1.71, .09), .018, EYE_GLOW)
        # Arms hang from the shoulder and swing from that pivot.
        arm = cube(f'Infected_Arm_{side}', (side * .25, 1.24, .04), (.055, .23, .06), CLOTH,
                   rotation=(-.28, 0, side * .06), edge=.025)
        set_pivot(arm, (side * .24, 1.46, 0))
        fore = cube(f'Infected_Forearm_{side}', (side * .27, .84, .18), (.048, .20, .055), FLESH,
                    rotation=(-.55, 0, 0), edge=.02)
        set_pivot(fore, (side * .26, 1.03, .10))
        cube(f'Infected_Hand_{side}', (side * .28, .64, .30), (.045, .05, .07), FLESH, edge=.02)

        leg = limb(f'Infected_Leg_{side}', (side * .10, .88, 0), (.062, .25, .07), CLOTH, edge=.025)
        shin = limb(f'Infected_Shin_{side}', (side * .10, .40, 0), (.052, .20, .06), CLOTH, edge=.02)
        cube(f'Infected_Boot_{side}', (side * .10, .05, .03), (.06, .05, .10), EYE, edge=.02)
    export('infected_v3.glb')


build_deer()
build_rabbit()
build_infected()
print('CREATURES DONE')

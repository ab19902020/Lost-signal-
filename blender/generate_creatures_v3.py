import bpy
import bmesh
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


def _loft(name, sections, material, axis, sides, subdiv):
    """Bridge a stack of elliptical cross-sections into one smooth surface.

    A section is ((x, y, z), half_a, half_b) — the two half-axes of the ellipse
    in the plane perpendicular to `axis`. Animals are not stacks of spheres and
    boxes: a body that tapers from chest to rump, a neck that swells where it
    meets the shoulder, a haunch that carries into the thigh, all need a
    surface that runs through them.
    """
    bm = bmesh.new()
    loops = []
    for (cx, cy, cz), ha, hb in sections:
        loop = []
        for i in range(sides):
            t = i * math.tau / sides
            a, b = math.cos(t) * ha, math.sin(t) * hb
            if axis == 'y':
                loop.append(bm.verts.new((cx + a, cy, cz + b)))
            else:                         # stacked along Z: a is X, b is Y
                loop.append(bm.verts.new((cx + a, cy + b, cz)))
        loops.append(loop)
    for lower, upper in zip(loops, loops[1:]):
        for i in range(sides):
            j = (i + 1) % sides
            bm.faces.new((lower[i], lower[j], upper[j], upper[i]))
    bm.faces.new(loops[0])
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


def loft_y(name, sections, material, sides=10, subdiv=1):
    """A tapering form stacked upward — a leg, a neck, a skull."""
    return _loft(name, sections, material, 'y', sides, subdiv)


def loft_z(name, sections, material, sides=12, subdiv=1):
    """A tapering form stacked along Z — the barrel of an animal's body."""
    return _loft(name, sections, material, 'z', sides, subdiv)


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
    """A red deer hind, about 1.3 m at the shoulder, facing +Z.

    Lofted rather than assembled: a barrel that is deepest at the chest and
    tucks up at the flank, a neck that swells where it leaves the shoulder, a
    wedge skull, and legs that taper from a heavy thigh to a fine cannon bone.
    """
    clear_scene()
    # Barrel, nose to tail along Z. Deep through the chest, tucked at the loin,
    # swelling again over the haunch.
    loft_z('Deer_Body', [
        ((0, .96, -.66), .10, .11),
        ((0, .99, -.50), .25, .27),
        ((0, .97, -.28), .30, .31),
        ((0, .94, -.05), .27, .30),
        ((0, .93, .18), .26, .31),
        ((0, .96, .40), .29, .32),
        ((0, 1.00, .56), .24, .26),
        ((0, 1.03, .66), .15, .16),
    ], HIDE, sides=14)
    # Pale underside.
    loft_z('Deer_Belly', [
        ((0, .72, -.40), .18, .05),
        ((0, .69, -.10), .21, .06),
        ((0, .69, .20), .21, .06),
        ((0, .73, .46), .18, .05),
    ], HIDE_PALE, sides=10)

    neck = loft_y('Deer_Neck', [
        ((0, .96, .52), .17, .19),
        ((0, 1.12, .58), .14, .16),
        ((0, 1.28, .66), .11, .13),
        ((0, 1.42, .74), .09, .10),
    ], HIDE, sides=12)
    set_pivot(neck, (0, .96, .52))

    head = loft_z('Deer_Head', [
        ((0, 1.46, .70), .085, .095),
        ((0, 1.47, .80), .10, .12),
        ((0, 1.45, .90), .085, .10),
        ((0, 1.42, 1.00), .058, .065),
        ((0, 1.41, 1.08), .045, .048),
    ], HIDE, sides=12)
    set_pivot(head, (0, 1.44, .72))
    muzzle = loft_z('Deer_Muzzle', [
        ((0, 1.41, 1.04), .046, .050),
        ((0, 1.40, 1.12), .040, .042),
    ], HIDE_PALE, sides=10)
    parts = [muzzle]
    for side in (-1, 1):
        ear = loft_y(f'Deer_Ear_{side}', [
            ((side * .10, 1.50, .76), .028, .020),
            ((side * .13, 1.60, .74), .048, .026),
            ((side * .15, 1.70, .73), .036, .020),
            ((side * .16, 1.75, .73), .012, .008),
        ], HIDE, sides=8)
        eye = sphere(f'Deer_Eye_{side}', (side * .085, 1.47, .88), .026, EYE)
        parts += [ear, eye]
    for part in parts:
        part.parent = head
        part.matrix_parent_inverse = head.matrix_world.inverted()

    # Legs: heavy thigh, fine cannon, a hoof. Front legs stand under the chest,
    # hind legs behind the haunch with a real hock angle.
    for name, x, z, top in (('FL', -.17, .40, .90), ('FR', .17, .40, .90),
                            ('BL', -.18, -.44, .93), ('BR', .18, -.44, .93)):
        back = name.startswith('B')
        leg = loft_y(f'Deer_Leg{name}', [
            ((x, top, z), .105, .13),
            ((x, top - .22, z + (-.03 if back else .01)), .075, .085),
            ((x, top - .42, z + (.05 if back else .0)), .045, .050),
            ((x, top - .62, z + (.02 if back else -.01)), .032, .034),
            ((x, .10, z), .030, .032),
        ], HIDE, sides=8)
        set_pivot(leg, (x, top, z))
        hoof = loft_y(f'Deer_Hoof{name}', [
            ((x, .11, z), .034, .036),
            ((x, .05, z + .01), .040, .050),
            ((x, .005, z + .02), .034, .046),
        ], EYE, sides=8)
        hoof.parent = leg
        hoof.matrix_parent_inverse = leg.matrix_world.inverted()

    tail = loft_y('Deer_Tail', [
        ((0, 1.02, -.66), .045, .035),
        ((0, .92, -.70), .050, .040),
        ((0, .84, -.72), .028, .022),
    ], HIDE_PALE, sides=8)
    set_pivot(tail, (0, 1.04, -.64))
    export('deer_v3.glb')


def build_rabbit():
    """A brown hare, about 0.34 m at the shoulder, facing +Z.

    A hare is not a ball with ears: the back arches over powerful haunches, the
    chest is narrow, the ears are long blades set back along the skull.
    """
    clear_scene()
    loft_z('Rabbit_Body', [
        ((0, .17, -.20), .045, .045),
        ((0, .19, -.13), .095, .105),
        ((0, .19, -.04), .105, .115),
        ((0, .175, .05), .092, .098),
        ((0, .165, .13), .075, .080),
        ((0, .17, .19), .052, .056),
    ], FUR, sides=12)
    loft_z('Rabbit_Belly', [
        ((0, .095, -.10), .062, .022),
        ((0, .088, .02), .068, .024),
        ((0, .095, .13), .050, .020),
    ], FUR_PALE, sides=10)

    head = loft_z('Rabbit_Head', [
        ((0, .205, .17), .052, .056),
        ((0, .208, .22), .062, .066),
        ((0, .200, .27), .050, .052),
        ((0, .193, .31), .032, .032),
    ], FUR, sides=12)
    set_pivot(head, (0, .20, .17))
    muzzle = loft_z('Rabbit_Muzzle', [
        ((0, .192, .30), .026, .026),
        ((0, .188, .335), .020, .019),
    ], FUR_PALE, sides=8)
    parts = [muzzle]
    for side in (-1, 1):
        # Long blades, laid back along the skull the way a running hare holds them.
        ear = loft_y(f'Rabbit_Ear_{side}', [
            ((side * .034, .235, .195), .020, .012),
            ((side * .046, .295, .165), .030, .015),
            ((side * .054, .355, .140), .026, .013),
            ((side * .058, .395, .125), .010, .006),
        ], FUR, sides=8)
        set_pivot(ear, (side * .034, .235, .195))
        eye = sphere(f'Rabbit_Eye_{side}', (side * .050, .215, .245), .014, EYE)
        parts += [ear, eye]
    for part in parts:
        part.parent = head
        part.matrix_parent_inverse = head.matrix_world.inverted()

    for name, x, z in (('FL', -.048, .09), ('FR', .048, .09)):
        leg = loft_y(f'Rabbit_Leg{name}', [
            ((x, .155, z), .034, .040),
            ((x, .095, z + .01), .022, .024),
            ((x, .040, z + .02), .016, .018),
            ((x, .008, z + .03), .016, .026),
        ], FUR, sides=8)
        set_pivot(leg, (x, .155, z))
    for name, x, z in (('BL', -.060, -.07), ('BR', .060, -.07)):
        leg = loft_y(f'Rabbit_Leg{name}', [
            ((x, .185, z), .058, .072),      # the haunch, carried into the leg
            ((x, .120, z - .02), .040, .050),
            ((x, .060, z + .01), .022, .030),
            ((x, .018, z + .05), .020, .056),
        ], FUR, sides=8)
        set_pivot(leg, (x, .185, z))
    loft_z('Rabbit_Tail', [
        ((0, .165, -.205), .030, .028),
        ((0, .160, -.245), .022, .020),
    ], FUR_PALE, sides=8)
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

"""The airstrip, and the aircraft on it.

A road out of the compound already goes somewhere. This is the other way out:
four hundred metres of cracked tarmac in the fields north-west of the shelter,
with a light aircraft parked on the apron that actually flies.

Two exports. The strip is scenery with one job — to be flat, long and readable
from the air, so it carries threshold bars, a centreline, edge markers and a
windsock, all of which are what tell you where the runway is when you are
turning back onto it at three hundred feet. The aircraft is a high-wing single
built as separate named parts, because the runtime has to spin the propeller,
turn the nosewheel and swing the control surfaces: a joined mesh cannot do any
of that.

Authored +Y up with the aircraft pointing down -Z, which is the direction the
rest of the game calls forward.
"""
import bpy
import bmesh
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'assets', 'blender')
os.makedirs(OUT, exist_ok=True)

ORIENTATION_MARKER = 'LS_ORIENT_YUP'


def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def mat(name, color, metallic=.0, roughness=.7):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color, 1.0)
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    return m


def _register(o, material, smooth=False):
    o.data.materials.append(material)
    if smooth:
        for p in o.data.polygons:
            p.use_smooth = True
    return o


def block(name, loc, half, material, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=2, location=loc, rotation=rotation)
    o = bpy.context.object
    o.name = name
    o.scale = half
    bpy.ops.object.transform_apply(scale=True)
    return _register(o, material)


def tube(name, loc, radius, length, material, rotation=(math.pi / 2, 0, 0), verts=20):
    """A cylinder lying along Y by default; Blender builds them along Z."""
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=length, location=loc,
                                        rotation=rotation, vertices=verts)
    o = bpy.context.object
    o.name = name
    return _register(o, material, smooth=True)


def cone(name, loc, radius, length, material, rotation=(math.pi / 2, 0, 0), verts=20):
    bpy.ops.mesh.primitive_cone_add(radius1=radius, radius2=0, depth=length,
                                    location=loc, rotation=rotation, vertices=verts)
    o = bpy.context.object
    o.name = name
    return _register(o, material, smooth=True)


def sphere(name, loc, radius, material, segments=18):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=radius, location=loc, segments=segments,
                                         ring_count=segments // 2)
    o = bpy.context.object
    o.name = name
    return _register(o, material, smooth=True)


def join_named(name, prefix):
    """Join every mesh whose name starts with `prefix` into one object."""
    meshes = [o for o in bpy.context.scene.objects
              if o.type == 'MESH' and o.name.startswith(prefix)]
    if not meshes:
        return None
    bpy.ops.object.select_all(action='DESELECT')
    for o in meshes:
        o.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    if len(meshes) > 1:
        bpy.ops.object.join()
    joined = bpy.context.object
    joined.name = name
    return joined


def triangles():
    return sum(sum(max(0, len(p.vertices) - 2) for p in o.data.polygons)
               for o in bpy.context.scene.objects if o.type == 'MESH')


def export(name):
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
    bpy.context.object.name = ORIENTATION_MARKER
    bpy.context.object.empty_display_size = .1
    bpy.ops.object.select_all(action='SELECT')
    path = os.path.join(OUT, name)
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', use_selection=True,
                              export_apply=True, export_yup=False)
    print(f'EXPORT {name} {triangles()} tris')
    return path


# --- The strip --------------------------------------------------------------

RUNWAY_LENGTH = 420.0
RUNWAY_WIDTH = 24.0


def build_airstrip():
    """Tarmac, markings, edge boards, a windsock and an open hangar."""
    tarmac = mat('Strip_Tarmac', (.030, .031, .033), roughness=.94)
    worn = mat('Strip_Worn', (.046, .045, .042), roughness=.92)
    paint = mat('Strip_Paint', (.230, .225, .205), roughness=.80)
    grass = mat('Strip_Verge', (.036, .048, .022), roughness=.96)
    steel = mat('Strip_Steel', (.070, .072, .076), metallic=.85, roughness=.52)
    rust = mat('Strip_Rust', (.086, .046, .026), roughness=.90)
    cloth = mat('Strip_Cloth', (.320, .120, .035), roughness=.85)

    half = RUNWAY_LENGTH / 2
    # The bed sits a hand's width above the field so the strip always reads as
    # a made surface rather than as paint lying on grass.
    block('Strip_Bed', (0, .04, 0), (RUNWAY_WIDTH / 2 + 4.0, .05, half + 6), grass)
    block('Strip_Tarmac', (0, .10, 0), (RUNWAY_WIDTH / 2, .05, half), tarmac)

    # Fifteen years of frost. Patches of a slightly different tone break up
    # four hundred metres of one colour, which from the air is the difference
    # between a runway and a black rectangle.
    for i in range(26):
        t = (i / 25.0 - .5) * RUNWAY_LENGTH * .94
        side = (-1) ** i
        block(f'Strip_Patch_{i}', (side * (2.4 + (i % 4) * 2.6), .108, t),
              (2.0 + (i % 3) * 1.1, .012, 5.0 + (i % 5) * 3.0), worn)

    # Centreline: thirty metre stripes with twenty metre gaps.
    stripes = int(RUNWAY_LENGTH // 50)
    for i in range(stripes):
        t = -half + 40 + i * 50
        block(f'Strip_Centre_{i}', (0, .116, t), (.45, .010, 15.0), paint)

    # Threshold bars at both ends, and a piano-key set inboard of each.
    for end, sign in (('N', -1), ('S', 1)):
        block(f'Strip_Thresh_{end}', (0, .116, sign * (half - 3.0)),
              (RUNWAY_WIDTH / 2 - 1.2, .010, 1.2), paint)
        for k in range(6):
            offset = (k - 2.5) * 3.2
            block(f'Strip_Key_{end}_{k}', (offset, .116, sign * (half - 12.0)),
                  (1.0, .010, 6.0), paint)

    # Edge boards every twenty metres, half of them knocked flat.
    marks = int(RUNWAY_LENGTH // 20)
    for i in range(marks + 1):
        t = -half + i * 20
        for side in (-1, 1):
            down = (i * 7 + (side > 0)) % 5 == 0
            y = .16 if not down else .10
            block(f'Strip_Edge_{i}_{"R" if side > 0 else "L"}',
                  (side * (RUNWAY_WIDTH / 2 + 1.1), y, t), (.10, .28, .55),
                  rust if down else paint,
                  rotation=(0, 0, math.pi / 2.4) if down else (0, 0, 0))

    # A windsock, because the one thing you want to know on approach is which
    # way the wind is going.
    mast_x = RUNWAY_WIDTH / 2 + 6.0
    mast_z = -half + 46
    tube('Strip_Mast', (mast_x, 3.0, mast_z), .09, 6.0, steel)
    block('Strip_MastFoot', (mast_x, .18, mast_z), (.55, .18, .55), steel)
    tube('Strip_SockRing', (mast_x + .55, 5.7, mast_z), .38, .06, steel,
         rotation=(0, math.pi / 2, 0), verts=18)
    for k in range(4):
        r = .36 - k * .055
        cone(f'Strip_Sock_{k}', (mast_x + 1.0 + k * .62, 5.7 - k * .10, mast_z),
             r, .62, cloth, rotation=(0, -math.pi / 2, 0), verts=14)

    # An open-fronted hangar on the apron, with the apron itself.
    ax, az = -(RUNWAY_WIDTH / 2 + 26), -half + 70
    block('Strip_Apron', (ax + 6, .09, az), (22.0, .04, 26.0), tarmac)
    for side in (-1, 1):
        block(f'Hangar_Wall_{"R" if side > 0 else "L"}',
              (ax - 8, 3.4, az + side * 11.0), (9.0, 3.4, .30), rust)
    block('Hangar_Back', (ax - 16.8, 3.4, az), (.30, 3.4, 11.0), rust)
    for i in range(9):
        block(f'Hangar_Roof_{i}', (ax - 16.5 + i * 2.1, 6.9 - abs(i - 4) * .22, az),
              (1.05, .12, 11.2), steel)
    for i in range(6):
        block(f'Hangar_Drum_{i}', (ax + 12 + (i % 3) * 2.2, .70, az + 14 + (i // 3) * 2.4),
              (.42, .62, .42), rust)

    # Two objects, not one. The strip is four hundred metres of flat tarmac and
    # must never be collided as a solid — a single box around it is an
    # invisible wall the size of the airfield, standing between the player and
    # the aeroplane. The hangar is the only thing out here you can walk into.
    # The hangar is left as separate parts on purpose. Joined, its bounding box
    # takes in the oil drums twelve metres away as well, and the one box that
    # covers all of it is seventy metres long and lies across the runway.
    join_named('Airstrip', 'Strip_')
    return export('airstrip_v1.glb')


# --- The aircraft -----------------------------------------------------------

def build_aircraft():
    """A high-wing single, with the parts the runtime has to move left loose."""
    import _aircraft_build
    plan = _aircraft_build.build(mat)

    # Everything that does not move becomes one mesh. Anything the runtime
    # animates has to survive as its own object, so the join is by prefix and
    # the movable parts are deliberately not named with it.
    for name in plan['movable']:
        assert bpy.data.objects.get(name), f'{name} was not built'

    # Where the pilot's eye goes, and where they get in. Empties, so the
    # runtime does not have to guess at either.
    for name, loc in (('Seat_Pilot', (-.34, .58, -.55)),
                      ('Door_Pilot', (-1.95, -.90, -.10))):
        bpy.ops.object.empty_add(type='PLAIN_AXES', location=loc)
        bpy.context.object.name = name
        bpy.context.object.empty_display_size = .12

    join_named('Plane_Hull', 'Hull_')
    return export('light_aircraft_v1.glb')


def main():
    clear_scene()
    build_airstrip()
    clear_scene()
    build_aircraft()
    print('AIRFIELD DONE')


if __name__ == '__main__':
    main()

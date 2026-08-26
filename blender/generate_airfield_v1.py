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
    skin = mat('Plane_Skin', (.360, .372, .360), metallic=.18, roughness=.44)
    trim = mat('Plane_Trim', (.150, .062, .030), metallic=.20, roughness=.50)
    glass = mat('Plane_Glass', (.055, .075, .085), metallic=.10, roughness=.14)
    metal = mat('Plane_Metal', (.105, .108, .112), metallic=.85, roughness=.38)
    tyre = mat('Plane_Tyre', (.022, .022, .024), roughness=.95)
    dark = mat('Plane_Dark', (.040, .042, .044), roughness=.70)

    # Fuselage: nose at -Z, tail at +Z.
    tube('Hull_Body', (0, 0, .40), .62, 3.60, skin, verts=26)
    cone('Hull_Nose', (0, 0, -1.70), .62, .90, skin, rotation=(-math.pi / 2, 0, 0), verts=26)
    # Tail cone tapers back to the fin.
    cone('Hull_Tail', (0, .10, 3.30), .58, 2.60, skin, rotation=(math.pi / 2, 0, 0), verts=22)
    block('Hull_Spine', (0, .58, 1.40), (.10, .16, 1.90), skin)

    # Cabin: a glasshouse, which is what a high-wing single mostly is.
    block('Hull_Cabin', (0, .52, -.10), (.60, .46, 1.10), glass)
    block('Hull_Screen', (0, .52, -1.16), (.52, .40, .16), glass,
          rotation=(-.42, 0, 0))
    for side in (-1, 1):
        block(f'Hull_Door_{"R" if side > 0 else "L"}', (side * .62, .30, -.10),
              (.03, .40, .90), trim)

    # Wing: one piece over the cabin, with struts down to the belly.
    block('Hull_Wing', (0, 1.06, -.30), (5.60, .10, .82), skin)
    block('Hull_WingRoot', (0, 1.00, -.30), (.70, .12, .90), skin)
    for side in (-1, 1):
        tag = 'R' if side > 0 else 'L'
        block(f'Hull_Strut_{tag}', (side * 2.10, .52, -.28), (.06, .58, .14), metal,
              rotation=(0, 0, side * .38))
        block(f'Hull_Tip_{tag}', (side * 5.62, 1.06, -.30), (.10, .09, .78), trim)
        # Navigation lights, red to port and green to starboard.
        sphere(f'Hull_Nav_{tag}', (side * 5.70, 1.08, -.30), .075,
               mat(f'Plane_Nav_{tag}', (.42, .04, .03) if side < 0 else (.04, .38, .10),
                   roughness=.30))

    # Tail feathers.
    block('Hull_Fin', (0, 1.50, 4.10), (.07, .90, .78), skin)
    block('Hull_FinCap', (0, 2.34, 4.16), (.08, .10, .60), trim)
    block('Hull_Stab', (0, .72, 4.24), (2.30, .07, .56), skin)

    # Control surfaces, kept separate so they can be moved.
    block('Aileron_L', (-4.30, 1.02, .42), (1.20, .05, .30), trim)
    block('Aileron_R', (4.30, 1.02, .42), (1.20, .05, .30), trim)
    block('Elevator', (0, .70, 4.86), (2.28, .05, .28), trim)
    block('Rudder', (0, 1.52, 4.94), (.06, .86, .34), trim)

    # Engine and propeller. The hub is at the nose; the blades are their own
    # object so the runtime can spin them.
    tube('Hull_Cowl', (0, 0, -2.02), .50, .34, metal, verts=24)
    tube('Prop_Hub', (0, 0, -2.24), .16, .22, metal, verts=18)
    for i in range(2):
        block(f'Prop_Blade_{i}', (0, 0, -2.26), (.055, 1.05, .10), dark,
              rotation=(0, 0, i * math.pi / 2))
    # A disc for when it is turning, hidden by the runtime until it is. Not
    # named Prop_, because the join below would swallow it and then hiding the
    # blades would hide the disc that replaces them — leaving an aeroplane at
    # full power with nothing on the front of it at all.
    tube('Disc_Blur', (0, 0, -2.26), 1.06, .02, mat('Plane_Disc', (.18, .18, .19),
                                                    roughness=.6), verts=28)

    # Undercarriage: two mains and a nosewheel, each on its own leg.
    for side in (-1, 1):
        tag = 'R' if side > 0 else 'L'
        block(f'Hull_Leg_{tag}', (side * .72, -.62, .10), (.09, .42, .12), metal,
              rotation=(0, 0, -side * .34))
        tube(f'Wheel_Main_{tag}', (side * 1.02, -1.00, .10), .34, .18, tyre,
             rotation=(0, math.pi / 2, 0), verts=20)
        tube(f'Hull_Hub_{tag}', (side * 1.02, -1.00, .10), .13, .20, metal,
             rotation=(0, math.pi / 2, 0), verts=14)
    block('Hull_NoseLeg', (0, -.62, -1.62), (.09, .44, .11), metal)
    tube('Wheel_Nose', (0, -1.02, -1.62), .27, .15, tyre,
         rotation=(0, math.pi / 2, 0), verts=18)

    # Where the pilot's eye goes, and where they get in. Empties, so the
    # runtime does not have to guess at either.
    for name, loc in (('Seat_Pilot', (-.34, .58, -.55)), ('Door_Pilot', (-1.70, -.30, -.30))):
        bpy.ops.object.empty_add(type='PLAIN_AXES', location=loc)
        bpy.context.object.name = name
        bpy.context.object.empty_display_size = .12

    # Everything that does not move becomes one mesh; the surfaces, the wheels
    # and the propeller stay their own objects.
    join_named('Plane_Hull', 'Hull_')
    join_named('Plane_Prop', 'Prop_')
    return export('light_aircraft_v1.glb')


def main():
    clear_scene()
    build_airstrip()
    clear_scene()
    build_aircraft()
    print('AIRFIELD DONE')


if __name__ == '__main__':
    main()

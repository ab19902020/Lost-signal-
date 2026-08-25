"""The armoury, built rather than bought.

The twenty-six weapons came out of an asset pack at between 240 and 5,000
triangles. They are also the geometry the player looks at more than anything
else in the game — a rifle sits in the middle of the screen for the whole
session — and at that range a pack model reads as exactly what it is: a flat
slab with a tube on it and a rail drawn on the top.

This is a parametric weapon works. Seven families, one honest build each, with
enough parameters that the twenty-six variants come out as real variations
rather than recolours: barrel length and profile, handguard style, stock type,
optic, magazine, finish. Every one carries the things a pack model never has —
a rail with its recoil slots, protected irons, a ported brake, an ejection port
with a dust cover, a charging handle, a trigger inside a real guard, checkering
on the grip, sling points, and a magazine with ribs and a floor plate.

Everything is authored pointing down +Z with +Y up, which is the convention the
runtime's held-weapon rig measures against.
"""
import bpy
import bmesh
import math
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'assets', 'blender')
os.makedirs(OUT, exist_ok=True)

ORIENTATION_MARKER = 'LS_ORIENT_YUP'


# --- Scene ------------------------------------------------------------------

def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def mat(name, color, metallic=.0, roughness=.5):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color, 1.0)
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    return m


# --- Primitives -------------------------------------------------------------

def _register(o, material, smooth=False):
    o.data.materials.append(material)
    if smooth:
        for p in o.data.polygons:
            p.use_smooth = True
    return o


def bevel(o, width=.0016, segments=2, angle=38):
    modifier = o.modifiers.new('Bevel', 'BEVEL')
    modifier.width = width
    modifier.segments = segments
    modifier.limit_method = 'ANGLE'
    modifier.angle_limit = math.radians(angle)
    bpy.context.view_layer.objects.active = o
    try:
        bpy.ops.object.modifier_apply(modifier='Bevel')
    except RuntimeError:
        o.modifiers.remove(modifier)
    return o


def block(name, loc, half, material, rotation=(0, 0, 0), edge=.0016, segments=2):
    bpy.ops.mesh.primitive_cube_add(location=loc, rotation=rotation)
    o = bpy.context.object
    o.name = name
    o.scale = half
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if edge:
        bevel(o, edge, segments)
    return _register(o, material)


def tube(name, loc, radius, length, material, rotation=(0, 0, 0), verts=28, edge=.0012):
    """A cylinder along Z, which is the weapon's own bore axis."""
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=length,
                                        location=loc, rotation=rotation)
    o = bpy.context.object
    o.name = name
    if edge:
        bevel(o, edge, 2)
    return _register(o, material, smooth=True)


def cone(name, loc, r0, r1, length, material, rotation=(0, 0, 0), verts=24):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r0, radius2=r1, depth=length,
                                    location=loc, rotation=rotation)
    o = bpy.context.object
    o.name = name
    return _register(o, material, smooth=True)


def ring(name, loc, major, minor, material, rotation=(0, 0, 0), segments=26):
    bpy.ops.mesh.primitive_torus_add(location=loc, rotation=rotation,
                                     major_radius=major, minor_radius=minor,
                                     major_segments=segments, minor_segments=10)
    o = bpy.context.object
    o.name = name
    return _register(o, material, smooth=True)


def hull(name, sections, material, sides=20, smooth=True, axis='z', power=2):
    """A swept form through a stack of cross-sections.

    A section is ((x, y, z), half_a, half_b). `axis` is the direction the form
    runs: 'z' for a receiver or a barrel, 'y' for anything that hangs — a grip,
    a magazine. Sweeping a grip along Z stacks all its rings in the same plane
    and the body disappears, leaving only whatever was bolted to it.
    """
    bm = bmesh.new()
    loops = []
    # power 2 is an ellipse; 4 and up is a rounded rectangle, which is what a
    # receiver, a magazine and a handguard actually are. An armoury built out
    # of ellipses reads as plumbing.
    def profile(t):
        c, s_ = math.cos(t), math.sin(t)
        if power == 2:
            return c, s_
        return (math.copysign(abs(c) ** (2 / power), c),
                math.copysign(abs(s_) ** (2 / power), s_))
    for (cx, cy, cz), ha, hb in sections:
        loop = []
        for i in range(sides):
            u, v = profile(i * math.tau / sides)
            if axis == 'z':
                loop.append(bm.verts.new((cx + u * ha, cy + v * hb, cz)))
            else:
                loop.append(bm.verts.new((cx + u * ha, cy, cz + v * hb)))
        loops.append(loop)
    for lower, upper in zip(loops, loops[1:]):
        for i in range(sides):
            j = (i + 1) % sides
            bm.faces.new((lower[i], lower[j], upper[j], upper[i]))
    bm.faces.new(loops[0])
    bm.faces.new(list(reversed(loops[-1])))
    me = bpy.data.meshes.new(f'{name}Mesh')
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    bpy.context.view_layer.objects.active = o
    return _register(o, material, smooth)


def join_all(name):
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
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
    bpy.context.object.empty_display_size = .01
    bpy.ops.object.select_all(action='SELECT')
    path = os.path.join(OUT, name)
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', use_selection=True,
                              export_apply=True, export_yup=False)
    print(f'EXPORT {name} {triangles()} tris')
    return path


# --- Finishes ---------------------------------------------------------------
# Four of them, so the armoury is not twenty-six of the same grey gun.

FINISHES = {
    'phosphate': dict(body=(.055, .056, .058), steel=(.105, .108, .112),
                      grip=(.030, .031, .032), furniture=(.048, .050, .046)),
    'parkerized': dict(body=(.042, .040, .036), steel=(.092, .088, .080),
                       grip=(.026, .024, .021), furniture=(.058, .046, .030)),
    'blued': dict(body=(.030, .032, .040), steel=(.120, .126, .140),
                  grip=(.024, .022, .026), furniture=(.036, .028, .020)),
    'desert': dict(body=(.122, .104, .070), steel=(.135, .130, .118),
                   grip=(.052, .045, .032), furniture=(.108, .092, .062)),
}


def palette(finish):
    f = FINISHES[finish]
    return dict(
        body=mat(f'Gun_{finish}_Body', f['body'], .42, .54),
        steel=mat(f'Gun_{finish}_Steel', f['steel'], .62, .34),
        grip=mat(f'Gun_{finish}_Grip', f['grip'], .04, .76),
        furniture=mat(f'Gun_{finish}_Furniture', f['furniture'], .08, .66),
        glass=mat('Gun_Glass', (.045, .075, .085), .30, .10),
        brass=mat('Gun_Brass', (.34, .24, .09), .90, .32),
        red=mat('Gun_Reticle', (.42, .035, .028), .0, .40),
    )


# --- Shared assemblies ------------------------------------------------------

def picatinny(name, z0, z1, y, half_width, M, tooth=.0095):
    """A rail, with its recoil slots. The single most recognisable thing on a
    modern weapon, and it is nothing but geometry."""
    length = abs(z1 - z0)
    base = .0042
    block(f'{name}_Base', (0, y + base / 2, (z0 + z1) / 2),
          (half_width, base / 2, length / 2), M['steel'], edge=.0008)
    count = max(3, int(length / tooth))
    pitch = length / count
    for i in range(count):
        z = min(z0, z1) + pitch * (i + .5)
        block(f'{name}_Tooth_{i}', (0, y + base + .0026, z),
              (half_width * 1.05, .0026, pitch * .30), M['steel'], edge=.0006, segments=1)
    # The bevelled shoulders a rail actually has.
    for side in (-1, 1):
        block(f'{name}_Shoulder_{side}', (side * half_width, y + base * .6, (z0 + z1) / 2),
              (.0012, base * .5, length / 2), M['body'], edge=.0005, segments=1)


def iron_sights(name, y, front_z, rear_z, M, hooded=True):
    """A protected post up front, a ladder aperture at the back."""
    block(f'{name}_FrontBase', (0, y + .006, front_z), (.0075, .006, .010),
          M['body'], edge=.0012)
    block(f'{name}_FrontPost', (0, y + .019, front_z), (.0016, .008, .0016),
          M['steel'], edge=.0004)
    for side in (-1, 1):
        block(f'{name}_FrontEar_{side}', (side * .0068, y + .020, front_z),
              (.0016, .011, .0022), M['body'], edge=.0006)
    if hooded:
        ring(f'{name}_FrontHood', (0, y + .022, front_z), .0080, .0014, M['body'],
             rotation=(math.pi / 2, 0, 0), segments=18)
    block(f'{name}_RearBase', (0, y + .006, rear_z), (.0090, .006, .012),
          M['body'], edge=.0012)
    ring(f'{name}_RearAperture', (0, y + .018, rear_z), .0055, .0016, M['steel'],
         rotation=(math.pi / 2, 0, 0), segments=18)
    for side in (-1, 1):
        block(f'{name}_RearEar_{side}', (side * .0088, y + .017, rear_z),
              (.0016, .010, .0026), M['body'], edge=.0006)
        tube(f'{name}_RearDrum_{side}', (side * .0110, y + .010, rear_z), .0034, .0034,
             M['steel'], rotation=(0, math.pi / 2, 0), verts=14, edge=.0004)


def muzzle_brake(name, z, radius, M, ports=5, length=.052):
    """The last thing on the weapon and the closest thing to the middle of the
    screen. It gets chambers, ports and a crown."""
    tube(f'{name}_Body', (0, 0, z + length / 2), radius * 1.7, length, M['steel'],
         verts=26, edge=.0010)
    for i in range(ports):
        at = z + length * (i + .7) / (ports + .6)
        for side in (-1, 1):
            block(f'{name}_Port_{i}_{side}',
                  (side * radius * 1.25, radius * .55, at),
                  (radius * .55, radius * .95, length * .045), M['body'],
                  edge=.0004, segments=1)
        block(f'{name}_TopPort_{i}', (0, radius * 1.45, at),
              (radius * .70, radius * .45, length * .045), M['body'],
              edge=.0004, segments=1)
    ring(f'{name}_Collar', (0, 0, z + .004), radius * 1.62, .0018, M['body'],
         rotation=(0, 0, 0), segments=22)
    tube(f'{name}_Crown', (0, 0, z + length - .003), radius * .78, .006, M['body'],
         verts=22, edge=.0004)


def trigger_group(name, z, y, M, guard_length=.048):
    """A trigger inside a guard you can see daylight through."""
    # Swept as an arc of segments, so there is a bow under the finger rather
    # than a flat plate hanging off the receiver.
    steps = 9
    for i in range(steps):
        t = i / (steps - 1)
        a = math.pi * (.12 + t * .76)
        block(f'{name}_Bow_{i}',
              (0, y - .006 - math.sin(a) * .022, z + math.cos(a) * guard_length * .48),
              (.0062, .0026, guard_length * .085), M['body'],
              rotation=(a - math.pi / 2, 0, 0), edge=.0008, segments=1)
    block(f'{name}_Front', (0, y - .012, z + guard_length / 2 - .002),
          (.0062, .013, .0030), M['body'], edge=.0012)
    block(f'{name}_Rear', (0, y - .012, z - guard_length / 2 + .002),
          (.0068, .013, .0038), M['body'], edge=.0012)
    block(f'{name}_Blade', (0, y - .015, z + .004), (.0022, .0105, .0030),
          M['steel'], rotation=(-.18, 0, 0), edge=.0008)


def pistol_grip(name, z, y, M, lean=.34, length=.088, checker=True):
    """A grip with a real rake to it, and checkering panels on the sides."""
    hull(f'{name}_Body', [
        ((0, y, z), .0125, .0155),
        ((0, y - length * .28, z + math.sin(lean) * length * .28), .0138, .0170),
        ((0, y - length * .62, z + math.sin(lean) * length * .62), .0140, .0168),
        ((0, y - length * .92, z + math.sin(lean) * length * .92), .0128, .0150),
    ], M['grip'], sides=20, axis='y', power=3.2)
    block(f'{name}_Cap', (0, y - length * .96, z + math.sin(lean) * length * .96),
          (.0140, .0028, .0160), M['body'], edge=.0012)
    if checker:
        # Two hundred little pyramids, small enough to read as a texture and
        # large enough to catch a highlight each.
        rows, cols = 11, 6
        for r in range(rows):
            for c in range(cols):
                t = .16 + (r / (rows - 1)) * .66
                gy = y - length * t
                gz = z + math.sin(lean) * length * t + (c / (cols - 1) - .5) * .019
                for side in (-1, 1):
                    block(f'{name}_Check_{r}_{c}_{side}', (side * .0136, gy, gz),
                          (.0011, .0013, .0013), M['grip'],
                          rotation=(math.pi / 4, 0, 0), edge=0)


def magazine(name, z, y, M, curve=.07, depth=.086, width=.0118, ribs=7):
    """A box magazine with a curve, witness ribs and a floor plate."""
    hull(f'{name}_Body', [
        ((0, y, z), width, .0205),
        ((0, y - depth * .34, z - math.sin(curve) * depth * .34), width * 1.02, .0210),
        ((0, y - depth * .70, z - math.sin(curve) * depth * .78), width * 1.02, .0206),
        ((0, y - depth, z - math.sin(curve) * depth * 1.20), width * .98, .0196),
    ], M['body'], sides=20, axis='y', power=6)
    for i in range(ribs):
        t = .16 + i * (.62 / max(1, ribs - 1))
        block(f'{name}_Rib_{i}', (0, y - depth * t, z - math.sin(curve) * depth * t * 1.1),
              (width * 1.03, .0011, .0175), M['body'], edge=.0004, segments=1)
    block(f'{name}_Floor', (0, y - depth * 1.03, z - math.sin(curve) * depth * 1.3),
          (width * 1.18, .0040, .0180), M['steel'], edge=.0012)
    block(f'{name}_Catch', (0, y - depth * .06, z + .0175),
          (width * .6, .0060, .0030), M['steel'], edge=.0008)


# --- The long arms ----------------------------------------------------------

def build_rifle(spec, M):
    """A service rifle: upper and lower receiver, barrel with a gas block, a
    vented handguard, a full-length rail, irons, a brake and a stock."""
    barrel = spec.get('barrel', .215)
    handguard = spec.get('handguard', .148)
    bore = spec.get('bore', .0052)

    # Upper receiver, with the raised feed ramp at the back.
    hull('Upper', [
        ((0, 0, -.070), .0155, .0175),
        ((0, 0, -.040), .0165, .0205),
        ((0, .0008, .010), .0168, .0208),
        ((0, .0008, .052), .0150, .0180),
        ((0, 0, .066), .0128, .0150),
    ], M['body'], sides=24, power=5)
    # Lower receiver, the magazine well and the trigger housing.
    hull('Lower', [
        ((0, -.0165, -.052), .0140, .0110),
        ((0, -.0180, -.010), .0148, .0135),
        ((0, -.0180, .030), .0146, .0130),
        ((0, -.0170, .056), .0132, .0105),
    ], M['body'], sides=24, power=5)
    block('Magwell', (0, -.0300, .014), (.0140, .0170, .0195), M['body'], edge=.0022)

    # Barrel: chamber, profile step, gas block, muzzle.
    tube('Barrel_Breech', (0, .0008, .078), bore * 2.6, .028, M['steel'], verts=24)
    tube('Barrel', (0, .0008, .078 + barrel / 2), bore * 1.75, barrel, M['steel'], verts=24)
    tube('Barrel_Step', (0, .0008, .078 + barrel * .52), bore * 2.1, .016, M['steel'], verts=24)
    gas_z = .078 + handguard * .86
    block('GasBlock', (0, .0100, gas_z), (.0075, .0090, .0110), M['steel'], edge=.0012)
    tube('GasTube', (0, .0165, .078 + handguard * .45), .0018, handguard * .82,
         M['steel'], verts=12, edge=0)

    # Handguard: a tube with real vent slots round it and a heat shield.
    hull('Handguard', [
        ((0, .0008, .080), .0165, .0165),
        ((0, .0008, .080 + handguard * .5), .0158, .0158),
        ((0, .0008, .080 + handguard), .0150, .0150),
    ], M['furniture'], sides=26, power=4)
    for i in range(9):
        z = .090 + i * (handguard - .020) / 8
        for k in range(6):
            a = math.tau * k / 6 + (i % 2) * .12
            block(f'Vent_{i}_{k}',
                  (math.cos(a) * .0158, .0008 + math.sin(a) * .0158, z),
                  (.0040, .0040, .0032), M['body'],
                  rotation=(0, 0, -a), edge=.0006, segments=1)
    for i in range(4):
        ring(f'Handguard_Band_{i}', (0, .0008, .086 + i * (handguard - .012) / 3),
             .0166, .0018, M['body'], segments=22)

    # Rail along the top, over the receiver and the handguard.
    picatinny('Rail', -.058, .078 + handguard * .96, .0206, .0092, M)

    iron_sights('Irons', .0250, .078 + handguard * .90, -.046, M)
    muzzle_brake('Muzzle', .078 + barrel, bore * 1.75, M,
                 ports=spec.get('ports', 5))

    # Controls: charging handle, ejection port and its dust cover, selector,
    # bolt catch, magazine release, forward assist.
    block('ChargingHandle', (0, .0175, -.062), (.0145, .0035, .0075), M['steel'], edge=.0010)
    block('ChargingLatch', (-.0140, .0175, -.066), (.0055, .0045, .0035), M['steel'], edge=.0010)
    block('EjectionPort', (.0170, .0060, .028), (.0022, .0075, .0165), M['body'], edge=.0010)
    block('DustCover', (.0182, -.0010, .028), (.0016, .0060, .0160), M['steel'], edge=.0008)
    tube('ForwardAssist', (.0160, .0110, .006), .0042, .0090, M['steel'],
         rotation=(0, math.pi / 2, 0), verts=14, edge=.0006)
    tube('Selector', (-.0150, -.0125, .038), .0050, .0060, M['steel'],
         rotation=(0, math.pi / 2, 0), verts=16, edge=.0006)
    block('SelectorLever', (-.0190, -.0125, .044), (.0035, .0022, .0075), M['steel'], edge=.0006)
    block('BoltCatch', (-.0165, -.0035, .022), (.0022, .0055, .0090), M['steel'], edge=.0008)
    tube('MagRelease', (.0155, -.0135, .026), .0042, .0055, M['steel'],
         rotation=(0, math.pi / 2, 0), verts=14, edge=.0006)

    trigger_group('Trigger', .046, -.0180, M)
    pistol_grip('Grip', .028, -.0300, M, lean=spec.get('grip_lean', .38))
    magazine('Mag', .014, -.0460, M, curve=spec.get('mag_curve', .12),
             depth=spec.get('mag_depth', .086), ribs=6)

    stock(spec.get('stock', 'collapsible'), -.070, .0008, M)
    for tag, z in (('Front', .078 + handguard * .55), ('Rear', -.058)):
        ring(f'Sling_{tag}', (0, -.0215, z), .0062, .0016, M['steel'],
             rotation=(0, math.pi / 2, 0), segments=16)


def stock(kind, z, y, M):
    """Fixed, collapsible or folding. The back half of the silhouette."""
    if kind == 'none':
        return
    if kind == 'collapsible':
        tube('Buffer', (0, y, z - .052), .0090, .105, M['body'], verts=20)
        hull('Stock', [
            ((0, y, z - .020), .0155, .0165),
            ((0, y - .0030, z - .060), .0165, .0195),
            ((0, y - .0060, z - .086), .0170, .0230),
            ((0, y - .0060, z - .098), .0165, .0225),
        ], M['furniture'], sides=22, power=4)
        block('Butt', (0, y - .0070, z - .102), (.0165, .0235, .0055), M['grip'], edge=.0020)
        for i in range(5):
            block(f'StockNotch_{i}', (0, y - .0180, z - .034 - i * .0140),
                  (.0060, .0028, .0038), M['body'], edge=.0006, segments=1)
        block('CheekRest', (0, y + .0155, z - .062), (.0110, .0055, .0280),
              M['furniture'], edge=.0018)
    elif kind == 'fixed':
        hull('Stock', [
            ((0, y, z - .012), .0160, .0180),
            ((0, y - .0080, z - .060), .0175, .0250),
            ((0, y - .0130, z - .110), .0180, .0290),
        ], M['furniture'], sides=22, power=4)
        block('Butt', (0, y - .0140, z - .116), (.0180, .0295, .0060), M['grip'], edge=.0022)
        for i in range(3):
            block(f'ButtRib_{i}', (0, y - .0140 + (i - 1) * .0130, z - .120),
                  (.0170, .0035, .0022), M['grip'], edge=.0006, segments=1)
    elif kind == 'folding':
        for side in (-1, 1):
            block(f'StockRail_{side}', (side * .0110, y - .0020, z - .058),
                  (.0028, .0040, .0480), M['steel'], edge=.0010)
        block('StockPlate', (0, y - .0040, z - .104), (.0125, .0210, .0048),
              M['grip'], edge=.0018)
        block('StockHinge', (0, y, z - .012), (.0130, .0110, .0075), M['steel'], edge=.0014)





# --- The rest of the families ----------------------------------------------

def build_smg(spec, M):
    """Short, fast, and built round the magazine in the grip or just ahead."""
    barrel = spec.get('barrel', .118)
    can = spec.get('suppressor', False)
    hull('Receiver', [
        ((0, 0, -.060), .0165, .0175),
        ((0, .0006, -.020), .0180, .0205),
        ((0, .0006, .034), .0178, .0200),
        ((0, 0, .052), .0150, .0165),
    ], M['body'], sides=24, power=5)
    for i in range(7):
        block(f'Vent_{i}', (0, .0210, -.030 + i * .0120), (.0115, .0022, .0038),
              M['body'], edge=.0005, segments=1)
    tube('Barrel', (0, .0006, .058 + barrel / 2), .0048, barrel, M['steel'], verts=22)
    if can:
        tube('Can', (0, .0006, .058 + barrel * .62), .0135, barrel * .78, M['body'], verts=26)
        for i in range(9):
            ring(f'Can_Band_{i}', (0, .0006, .026 + barrel * .28 + i * barrel * .072),
                 .0137, .0012, M['steel'], segments=20)
    else:
        muzzle_brake('Muzzle', .058 + barrel, .0048, M, ports=3, length=.030)
    picatinny('Rail', -.052, .046, .0208, .0085, M, tooth=.0085)
    iron_sights('Irons', .0250, .040, -.040, M, hooded=False)
    block('Charging', (-.0175, .0130, -.028), (.0075, .0032, .0110), M['steel'], edge=.0009)
    block('EjectionPort', (.0178, .0060, .014), (.0020, .0068, .0140), M['body'], edge=.0009)
    tube('Selector', (-.0165, -.0090, .022), .0042, .0055, M['steel'],
         rotation=(0, math.pi / 2, 0), verts=14, edge=.0005)
    trigger_group('Trigger', .026, -.0150, M, guard_length=.040)
    pistol_grip('Grip', .008, -.0250, M, lean=.30, length=.078)
    magazine('Mag', .034, -.0270, M, curve=.05, depth=.098, width=.0092, ribs=8)
    # A folding wire stock and a foregrip: what makes a submachine gun readable.
    for side in (-1, 1):
        block(f'Wire_{side}', (side * .0120, -.0040, -.088), (.0026, .0026, .0340),
              M['steel'], edge=.0008)
    block('WirePlate', (0, -.0060, -.120), (.0135, .0190, .0042), M['grip'], edge=.0016)
    hull('Foregrip', [
        ((0, -.0165, .046), .0105, .0115),
        ((0, -.0420, .048), .0115, .0125),
        ((0, -.0560, .048), .0100, .0110),
    ], M['grip'], sides=16, axis='y', power=3)
    for i in range(6):
        ring(f'Foregrip_Groove_{i}', (0, -.0230 - i * .0058, .047), .0118, .0014,
             M['body'], rotation=(math.pi / 2, 0, 0), segments=14)


def build_shotgun(spec, M):
    """Tube magazine, heat shield, pump, and a bead at the end of it."""
    barrel = spec.get('barrel', .245)
    hull('Receiver', [
        ((0, 0, -.056), .0175, .0195),
        ((0, .0008, -.016), .0190, .0225),
        ((0, .0008, .026), .0188, .0220),
        ((0, 0, .046), .0160, .0180),
    ], M['body'], sides=24, power=5)
    tube('Barrel', (0, .0060, .052 + barrel / 2), .0098, barrel, M['steel'], verts=24)
    tube('TubeMag', (0, -.0130, .052 + barrel * .46), .0086, barrel * .82, M['body'], verts=22)
    tube('TubeCap', (0, -.0130, .052 + barrel * .88), .0098, .014, M['steel'], verts=20)
    # Heat shield over the barrel, with real slots in the sides.
    for i in range(11):
        z = .066 + i * (barrel * .74) / 10
        block(f'Shield_{i}', (0, .0165, z), (.0092, .0030, .0060), M['steel'], edge=.0006)
        for side in (-1, 1):
            block(f'Shield_Leg_{i}_{side}', (side * .0098, .0110, z),
                  (.0026, .0060, .0055), M['steel'], edge=.0006, segments=1)
    # Pump, with the grooves that say pump.
    pump_z = .052 + barrel * .42
    hull('Pump', [
        ((0, -.0058, pump_z - .038), .0155, .0135),
        ((0, -.0058, pump_z), .0165, .0145),
        ((0, -.0058, pump_z + .038), .0155, .0135),
    ], M['furniture'], sides=22, power=4)
    for i in range(9):
        block(f'Pump_Groove_{i}', (0, -.0195, pump_z - .032 + i * .0080),
              (.0140, .0022, .0026), M['body'], edge=.0005, segments=1)
    block('Bead_Post', (0, .0175, .052 + barrel - .004), (.0016, .0055, .0016),
          M['steel'], edge=.0004)
    tube('Bead', (0, .0232, .052 + barrel - .004), .0026, .0026, M['brass'],
         rotation=(math.pi / 2, 0, 0), verts=12, edge=0)
    # Shell carrier down the side of the receiver: five loops with brass in them.
    for i in range(5):
        ring(f'Loop_{i}', (-.0195, -.0020, -.046 + i * .0175), .0075, .0016, M['furniture'],
             rotation=(0, math.pi / 2, 0), segments=14)
        tube(f'Shell_{i}', (-.0195, -.0020, -.046 + i * .0175), .0064, .0150, M['brass'],
             rotation=(0, math.pi / 2, 0), verts=14, edge=.0004)
    trigger_group('Trigger', .022, -.0175, M, guard_length=.044)
    if spec.get('grip', 'pistol') == 'pistol':
        pistol_grip('Grip', .004, -.0270, M, lean=.36, length=.086)
        stock(spec.get('stock', 'fixed'), -.056, .0008, M)
    else:
        # Sawn off: no stock, a bird's head grip and nothing else.
        hull('Wrist', [
            ((0, -.0180, -.056), .0140, .0165),
            ((0, -.0420, -.070), .0150, .0180),
            ((0, -.0620, -.082), .0130, .0150),
        ], M['furniture'], sides=18, axis='y', power=3)


def build_sniper(spec, M):
    """A precision rifle: heavy barrel, glass, a bolt and a bipod."""
    barrel = spec.get('barrel', .330)
    hull('Receiver', [
        ((0, 0, -.080), .0165, .0180),
        ((0, .0008, -.030), .0180, .0210),
        ((0, .0008, .034), .0176, .0205),
        ((0, 0, .056), .0150, .0170),
    ], M['body'], sides=24, power=5)
    tube('Barrel', (0, .0008, .062 + barrel / 2), .0092, barrel, M['steel'], verts=26)
    for i in range(7):
        ring(f'Flute_{i}', (0, .0008, .086 + i * barrel * .11), .0094, .0018,
             M['body'], segments=22)
    picatinny('Rail', -.070, .040, .0212, .0088, M)
    scope(spec, M, top=.0212)
    muzzle_brake('Muzzle', .062 + barrel, .0092, M, ports=6, length=.058)
    # Bolt, out to the side, with a knob you could actually grab.
    tube('Bolt_Shaft', (.0230, .0080, -.044), .0038, .0230, M['steel'],
         rotation=(0, math.pi / 2, 0), verts=14, edge=.0005)
    tube('Bolt_Knob', (.0360, .0080, -.044), .0078, .0110, M['steel'],
         rotation=(0, math.pi / 2, 0), verts=18, edge=.0008)
    tube('Bolt_Body', (0, .0080, -.058), .0090, .0400, M['steel'], verts=20, edge=.0006)
    trigger_group('Trigger', .038, -.0180, M)
    pistol_grip('Grip', .018, -.0290, M, lean=.30, length=.092)
    magazine('Mag', .006, -.0430, M, curve=.02, depth=.058, width=.0105, ribs=4)
    stock('fixed', -.080, .0008, M)
    # Bipod, folded down under the fore-end.
    for side in (-1, 1):
        block(f'Bipod_Leg_{side}', (side * .0130, -.0400, .080),
              (.0032, .0330, .0032), M['body'], rotation=(0, 0, side * .26), edge=.0007)
        block(f'Bipod_Foot_{side}', (side * .0225, -.0720, .080),
              (.0058, .0038, .0075), M['steel'], edge=.0010)
    block('Bipod_Mount', (0, -.0140, .080), (.0110, .0080, .0120), M['steel'], edge=.0014)
    block('CheekRiser', (0, .0175, -.058), (.0120, .0060, .0300), M['furniture'], edge=.0018)


def scope(spec, M, top):
    """Glass, turrets, rings and a sunshade."""
    z = spec.get('scope_at', -.010)
    body = spec.get('scope_body', .0170)
    length = spec.get('scope_length', .200)
    tube('Scope_Tube', (0, top + .034, z), body, length, M['body'], verts=30)
    tube('Scope_Bell', (0, top + .034, z + length * .44), body * 1.42, length * .22,
         M['body'], verts=30)
    tube('Scope_Ocular', (0, top + .034, z - length * .44), body * 1.28, length * .18,
         M['body'], verts=30)
    tube('Scope_Shade', (0, top + .034, z + length * .60), body * 1.44, length * .14,
         M['body'], verts=30)
    tube('Scope_Objective', (0, top + .034, z + length * .52), body * 1.34, .0035,
         M['glass'], verts=30, edge=0)
    tube('Scope_Eyepiece', (0, top + .034, z - length * .52), body * 1.20, .0030,
         M['glass'], verts=30, edge=0)
    for tag, dz in (('Front', length * .26), ('Rear', -length * .26)):
        block(f'Scope_Ring_{tag}', (0, top + .018, z + dz), (.0092, .0195, .0075),
              M['steel'], edge=.0014)
        for side in (-1, 1):
            tube(f'Scope_RingBolt_{tag}_{side}', (side * .0092, top + .006, z + dz),
                 .0026, .0030, M['steel'], rotation=(0, math.pi / 2, 0), verts=10, edge=0)
    # Turrets: elevation on top, windage on the side, both knurled.
    for tag, rot, offset in (('Elev', (0, 0, 0), (0, body + .008, 0)),
                             ('Wind', (0, math.pi / 2, 0), (body + .008, 0, 0))):
        cx, cy = offset[0], top + .034 + offset[1]
        tube(f'Scope_{tag}', (cx, cy, z), .0082, .0150, M['steel'],
             rotation=(math.pi / 2, 0, 0) if tag == 'Elev' else (0, math.pi / 2, 0),
             verts=20, edge=.0008)
        for i in range(12):
            a = i * math.tau / 12
            if tag == 'Elev':
                loc = (cx + math.cos(a) * .0082, cy, z + math.sin(a) * .0082)
            else:
                loc = (cx, cy + math.cos(a) * .0082, z + math.sin(a) * .0082)
            block(f'Scope_{tag}_Knurl_{i}', loc, (.0012, .0012, .0060), M['body'],
                  rotation=(0, 0, -a), edge=0)
        block(f'Scope_{tag}_Cap', (cx, cy + (.0100 if tag == 'Elev' else 0),
                                   z if tag == 'Elev' else z),
              (.0070, .0022, .0070), M['body'], edge=.0008)


def build_pistol(spec, M):
    """Slide, frame, and everything a pack model leaves off a handgun."""
    barrel = spec.get('barrel', .098)
    hull('Slide', [
        ((0, .0130, -.052), .0125, .0130),
        ((0, .0130, -.030), .0132, .0142),
        ((0, .0130, barrel * .70), .0130, .0140),
        ((0, .0130, barrel * .92), .0120, .0128),
    ], M['steel'], sides=22, power=6)
    # Serrations: two banks, which is what says "slide".
    for bank, base, count in (('Rear', -.048, 8), ('Front', barrel * .48, 5)):
        for i in range(count):
            block(f'Serration_{bank}_{i}', (0, .0130, base + i * .0072),
                  (.0134, .0110, .0018), M['body'], edge=.0005, segments=1)
    hull('Frame', [
        ((0, -.0040, -.048), .0115, .0110),
        ((0, -.0040, .012), .0120, .0118),
        ((0, -.0040, barrel * .62), .0112, .0102),
    ], M['body'], sides=20, power=5)
    tube('Barrel', (0, .0130, barrel * .96), .0052, .020, M['steel'], verts=20)
    tube('Bore', (0, .0130, barrel * 1.02), .0030, .008, M['grip'], verts=16, edge=0)
    # Dovetail sights.
    block('Sight_Rear', (0, .0272, -.046), (.0105, .0042, .0050), M['steel'], edge=.0008)
    for side in (-1, 1):
        block(f'Sight_RearBlade_{side}', (side * .0062, .0300, -.046),
              (.0034, .0032, .0044), M['body'], edge=.0006)
    block('Sight_Front', (0, .0278, barrel * .84), (.0022, .0048, .0038),
          M['steel'], edge=.0006)
    block('Sight_FrontDot', (0, .0300, barrel * .84 - .0034), (.0014, .0014, .0006),
          M['brass'], edge=0)
    # Hammer, safety, slide stop, take-down.
    if spec.get('hammer', True):
        block('Hammer', (0, .0180, -.060), (.0055, .0110, .0038), M['steel'],
              rotation=(.30, 0, 0), edge=.0010)
        block('Hammer_Spur', (0, .0270, -.066), (.0058, .0026, .0055), M['steel'], edge=.0012)
    block('Safety', (-.0122, .0035, -.038), (.0030, .0028, .0090), M['steel'], edge=.0006)
    block('SlideStop', (-.0120, .0010, -.014), (.0026, .0034, .0130), M['steel'], edge=.0006)
    tube('Takedown', (.0118, -.0020, .006), .0034, .0035, M['steel'],
         rotation=(0, math.pi / 2, 0), verts=12, edge=.0004)
    block('MagRelease', (.0118, -.0050, -.028), (.0028, .0048, .0048), M['steel'], edge=.0008)
    # Ejection port, cut into the slide.
    block('EjectionPort', (.0128, .0180, barrel * .18), (.0016, .0060, .0130),
          M['body'], edge=.0008)
    trigger_group('Trigger', -.016, -.0090, M, guard_length=.040)
    pistol_grip('Grip', -.048, -.0130, M, lean=.30, length=.082)
    magazine('Mag', -.048, -.0900, M, curve=.02, depth=.014, width=.0092, ribs=1)
    # An accessory rail under the dust cover, because it is 1990-something.
    picatinny('UnderRail', .010, barrel * .60, -.0165, .0062, M, tooth=.0070)


def build_revolver(spec, M):
    """Frame, cylinder with flutes and chambers, ejector rod, and a hammer."""
    barrel = spec.get('barrel', .112)
    hull('Frame', [
        ((0, .0060, -.058), .0130, .0165),
        ((0, .0060, -.016), .0138, .0180),
        ((0, .0060, .014), .0130, .0160),
    ], M['steel'], sides=22, power=5)
    # The barrel, with a full-length underlug: what a heavy revolver looks like.
    tube('Barrel', (0, .0120, .022 + barrel / 2), .0072, barrel, M['steel'], verts=24)
    block('Underlug', (0, .0020, .022 + barrel * .48), (.0072, .0072, barrel * .46),
          M['steel'], edge=.0014)
    block('TopStrap', (0, .0208, .022 + barrel * .46), (.0060, .0026, barrel * .46),
          M['steel'], edge=.0010)
    for i in range(9):
        block(f'Rib_{i}', (0, .0234, .026 + i * barrel * .10), (.0052, .0014, .0022),
              M['body'], edge=0, segments=1)
    # Cylinder.
    cyl_z = -.006
    radius = .0175
    tube('Cylinder', (0, .0090, cyl_z), radius, .0400, M['steel'], verts=32, edge=.0010)
    for i in range(6):
        a = i * math.tau / 6
        block(f'Flute_{i}', (math.cos(a) * radius * .86, .0090 + math.sin(a) * radius * .86,
                             cyl_z),
              (radius * .22, radius * .22, .0150), M['body'], rotation=(0, 0, -a),
              edge=.0009)
        tube(f'Chamber_{i}', (math.cos(a) * radius * .58, .0090 + math.sin(a) * radius * .58,
                              cyl_z + .0205),
             radius * .17, .0035, M['grip'], verts=12, edge=0)
    ring('Cylinder_Front', (0, .0090, cyl_z + .0200), radius * .98, .0016, M['body'], segments=26)
    ring('Cylinder_Rear', (0, .0090, cyl_z - .0200), radius * .98, .0016, M['body'], segments=26)
    tube('Ejector', (0, .0020, .022 + barrel * .52), .0034, barrel * .90, M['steel'], verts=16)
    block('EjectorHead', (0, .0020, .022 + barrel * .98), (.0048, .0048, .0050),
          M['steel'], edge=.0010)
    block('Latch', (-.0135, .0090, -.030), (.0030, .0060, .0120), M['steel'], edge=.0008)
    block('Hammer', (0, .0190, -.062), (.0058, .0125, .0040), M['steel'],
          rotation=(.28, 0, 0), edge=.0010)
    block('Hammer_Spur', (0, .0295, -.070), (.0062, .0028, .0060), M['steel'], edge=.0012)
    for i in range(5):
        block(f'Hammer_Check_{i}', (0, .0320, -.0730 + i * .0026), (.0050, .0010, .0010),
              M['body'], edge=0)
    trigger_group('Trigger', -.030, -.0080, M, guard_length=.044)
    pistol_grip('Grip', -.062, -.0110, M, lean=.42, length=.090)


def build_blade(spec, M):
    """A knife: a ground blade with a fuller, a guard, and a wrapped grip."""
    length = spec.get('blade', .175)
    hull('Blade', [
        ((0, 0, .010), .0032, .0125),
        ((0, 0, .010 + length * .30), .0038, .0170),
        ((0, 0, .010 + length * .70), .0032, .0155),
        ((0, 0, .010 + length * .94), .0018, .0080),
        ((0, 0, .010 + length), .0006, .0016),
    ], M['steel'], sides=14, power=4)
    for i in range(11):
        block(f'Fuller_{i}', (0, .0035, .028 + i * length * .062),
              (.0040, .0016, length * .030), M['body'], edge=.0005, segments=1)
    # Serrations along the spine, near the guard.
    for i in range(7):
        block(f'Serration_{i}', (0, .0140, .022 + i * .0075), (.0034, .0026, .0030),
              M['steel'], rotation=(0, 0, .4), edge=.0005)
    block('Guard', (0, .0010, .004), (.0090, .0180, .0055), M['body'], edge=.0016)
    block('Ricasso', (0, .0010, .012), (.0042, .0110, .0090), M['steel'], edge=.0010)
    # A wrapped grip: eighteen turns of cord.
    for i in range(18):
        ring(f'Wrap_{i}', (0, 0, -.006 - i * .0052), .0098, .0026, M['grip'], segments=14)
    block('Pommel', (0, 0, -.102), (.0092, .0125, .0060), M['steel'], edge=.0018)
    tube('Lanyard', (0, 0, -.108), .0022, .0060, M['grip'],
         rotation=(0, math.pi / 2, 0), verts=10, edge=0)


# --- The armoury -----------------------------------------------------------
# Twenty-six weapons out of seven builds. What varies is what would actually
# vary between two rifles in the same rack: barrel length, handguard, stock,
# optic, magazine, finish.

CATALOGUE = [
    # --- Rifles ---
    ('assault_rifle_01', build_rifle, 'phosphate',
     dict(barrel=.215, handguard=.148, stock='collapsible')),
    ('assault_rifle_02', build_rifle, 'phosphate',
     dict(barrel=.178, handguard=.118, stock='collapsible', ports=4, grip_lean=.34)),
    ('assault_rifle_03', build_rifle, 'parkerized',
     dict(barrel=.268, handguard=.186, stock='fixed', ports=6, mag_depth=.098)),
    ('bullpup_rifle', build_rifle, 'phosphate',
     dict(barrel=.238, handguard=.096, stock='none', ports=4, mag_depth=.078)),
    ('akm', build_rifle, 'parkerized',
     dict(barrel=.232, handguard=.132, stock='fixed', ports=3, mag_curve=.30,
          mag_depth=.096, grip_lean=.44)),
    # --- Shotguns ---
    ('shotgun_01', build_shotgun, 'blued', dict(barrel=.245, stock='fixed')),
    ('shotgun_02', build_shotgun, 'blued', dict(barrel=.268, stock='fixed')),
    ('shotgun_short_stock', build_shotgun, 'parkerized',
     dict(barrel=.196, stock='folding')),
    ('shotgun_sawed_off', build_shotgun, 'blued', dict(barrel=.118, grip='wrist')),
    ('mossberg_590a1', build_shotgun, 'parkerized', dict(barrel=.278, stock='fixed')),
    # --- Precision ---
    ('sniper_rifle_01', build_sniper, 'phosphate',
     dict(barrel=.310, scope_body=.0165, scope_length=.190)),
    ('sniper_rifle_02', build_sniper, 'blued',
     dict(barrel=.348, scope_body=.0180, scope_length=.215, scope_at=-.014)),
    ('sniper_rifle_03', build_sniper, 'desert',
     dict(barrel=.298, scope_body=.0158, scope_length=.178)),
    ('sniper_rifle_04', build_sniper, 'desert',
     dict(barrel=.392, scope_body=.0205, scope_length=.245, scope_at=-.018)),
    # --- Submachine guns ---
    ('smg_01', build_smg, 'phosphate', dict(barrel=.118)),
    ('smg_02', build_smg, 'blued', dict(barrel=.128, suppressor=True)),
    # --- Sidearms ---
    ('pistol_01', build_pistol, 'phosphate', dict(barrel=.098)),
    ('pistol_02', build_pistol, 'blued', dict(barrel=.082)),
    ('pistol_03', build_pistol, 'parkerized', dict(barrel=.104)),
    ('pistol_04', build_pistol, 'blued', dict(barrel=.112)),
    ('glock_19', build_pistol, 'phosphate', dict(barrel=.090, hammer=False)),
    ('revolver_01', build_revolver, 'blued', dict(barrel=.112)),
    ('revolver_02', build_revolver, 'steelgrey' if False else 'phosphate', dict(barrel=.062)),
    ('revolver_03', build_revolver, 'blued', dict(barrel=.152)),
    # --- Blades ---
    ('bayonet', build_blade, 'parkerized', dict(blade=.198)),
    ('combat_knife', build_blade, 'blued', dict(blade=.158)),
]


if __name__ == '__main__':
    import sys
    only = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    for stem, builder, finish, spec in CATALOGUE:
        if only and stem not in only:
            continue
        clear_scene()
        M = palette(finish)
        builder(spec, M)
        join_all(stem)
        export(f'weapon_{stem}_v1.glb')
    print('ARMOURY COMPLETE')

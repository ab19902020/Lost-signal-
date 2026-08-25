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


if __name__ == '__main__':
    import sys
    clear_scene()
    M = palette('phosphate')
    build_rifle(dict(), M)
    join_all('ServiceRifle')
    export('weapon_rifle_test.glb')

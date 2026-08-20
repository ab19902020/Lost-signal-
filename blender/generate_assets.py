import bpy
import math
import os
from mathutils import Vector

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'assets', 'blender')
os.makedirs(OUT, exist_ok=True)


def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for datablocks in (bpy.data.meshes, bpy.data.curves, bpy.data.materials):
        pass


def material(name, color, metallic=0.0, roughness=0.6, emission=None, emission_strength=0.0):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color, 1.0)
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    if emission is not None:
        # Blender 3.x and 4.x use different socket names.
        for socket_name in ('Emission', 'Emission Color'):
            if socket_name in bsdf.inputs:
                bsdf.inputs[socket_name].default_value = (*emission, 1.0)
        if 'Emission Strength' in bsdf.inputs:
            bsdf.inputs['Emission Strength'].default_value = emission_strength
    return m


def shade_smooth(obj):
    if obj.type == 'MESH':
        for p in obj.data.polygons:
            p.use_smooth = True


def add_bevel(obj, width=0.04, segments=3):
    mod = obj.modifiers.new('EdgeSoftening', 'BEVEL')
    mod.width = width
    mod.segments = segments
    mod.limit_method = 'ANGLE'
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=mod.name)
    shade_smooth(obj)


def cube(name, loc, scale, mat, bevel=0.04, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(location=loc, rotation=rotation)
    o = bpy.context.object
    o.name = name
    o.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if mat:
        o.data.materials.append(mat)
    if bevel:
        add_bevel(o, bevel, 3)
    return o


def cylinder(name, loc, radius, depth, mat, rotation=(0, 0, 0), vertices=32, bevel=0.02):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=loc, rotation=rotation)
    o = bpy.context.object
    o.name = name
    if mat:
        o.data.materials.append(mat)
    if bevel:
        add_bevel(o, bevel, 2)
    return o


def torus(name, loc, major, minor, mat, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, major_segments=40, minor_segments=12, location=loc, rotation=rotation)
    o = bpy.context.object
    o.name = name
    if mat:
        o.data.materials.append(mat)
    shade_smooth(o)
    return o


def cylinder_between(name, a, b, radius, mat, vertices=16):
    a, b = Vector(a), Vector(b)
    mid = (a + b) * 0.5
    direction = b - a
    length = direction.length
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=length, location=mid)
    o = bpy.context.object
    o.name = name
    o.rotation_mode = 'QUATERNION'
    o.rotation_quaternion = direction.to_track_quat('Z', 'Y')
    o.rotation_mode = 'XYZ'
    if mat:
        o.data.materials.append(mat)
    shade_smooth(o)
    return o


def export_glb(filename):
    path = os.path.join(OUT, filename)
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format='GLB',
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_materials='EXPORT',
    )
    print('Exported', path)


STEEL = material('LS_Steel', (0.22, 0.25, 0.23), metallic=0.78, roughness=0.34)
DARK_STEEL = material('LS_DarkSteel', (0.045, 0.055, 0.05), metallic=0.74, roughness=0.42)
GREEN = material('LS_GreenPaint', (0.08, 0.18, 0.11), metallic=0.30, roughness=0.58)
RED = material('LS_RedPaint', (0.34, 0.055, 0.04), metallic=0.22, roughness=0.55)
RUBBER = material('LS_Rubber', (0.025, 0.03, 0.028), metallic=0.0, roughness=0.92)
GLASS = material('LS_Glass', (0.16, 0.23, 0.19), metallic=0.05, roughness=0.16)
SCREEN = material('LS_Screen', (0.01, 0.04, 0.02), metallic=0.0, roughness=0.25, emission=(0.10, 0.82, 0.28), emission_strength=2.2)
AMBER = material('LS_Amber', (0.08, 0.025, 0.005), metallic=0.0, roughness=0.22, emission=(1.0, 0.36, 0.06), emission_strength=2.8)
WOOD = material('LS_DarkWood', (0.18, 0.075, 0.035), metallic=0.0, roughness=0.78)
BARK = material('LS_DeadBark', (0.11, 0.075, 0.05), metallic=0.0, roughness=0.95)


def build_blast_door():
    clear_scene()
    frame = cube('BlastDoor_Frame', (0, 1.65, 0.05), (1.95, 1.85, 0.16), DARK_STEEL, 0.10)
    door = cube('BlastDoor_Door', (0, 1.65, -0.08), (1.70, 1.60, 0.16), STEEL, 0.12)
    inset = cube('BlastDoor_Inset', (0, 1.65, -0.255), (1.47, 1.37, 0.035), DARK_STEEL, 0.06)
    for y in (0.55, 1.10, 1.65, 2.20, 2.75):
        cube(f'Brace_{y:.2f}', (0, y, -0.31), (1.32, 0.055, 0.06), STEEL, 0.025)
    # wheel and hub
    torus('DoorWheel_Rim', (0.82, 1.62, -0.42), 0.42, 0.045, RED, rotation=(math.pi/2, 0, 0))
    cylinder('DoorWheel_Hub', (0.82, 1.62, -0.42), 0.105, 0.12, DARK_STEEL, rotation=(math.pi/2, 0, 0), vertices=28)
    for i in range(8):
        a = i * math.pi / 4
        x1, y1 = 0.82 + math.cos(a)*0.09, 1.62 + math.sin(a)*0.09
        x2, y2 = 0.82 + math.cos(a)*0.38, 1.62 + math.sin(a)*0.38
        cylinder_between(f'WheelSpoke_{i}', (x1,y1,-0.42), (x2,y2,-0.42), 0.018, RED, 12)
    # bolts
    for sx in (-1,1):
        for sy in (0.52, 1.00, 1.48, 1.96, 2.44, 2.92):
            cylinder(f'Bolt_{sx}_{sy}', (sx*1.52, sy, -0.39), 0.045, 0.055, DARK_STEEL, rotation=(math.pi/2,0,0), vertices=16, bevel=0.008)
    # warning inset
    cube('WarningPanel', (-0.75, 2.75, -0.40), (0.46, 0.14, 0.018), RED, 0.018)
    export_glb('blast_door.glb')


def build_gun_vault():
    clear_scene()
    cube('GunVault_Body', (0, 1.45, 0), (0.84, 1.45, 0.42), DARK_STEEL, 0.11)
    cube('GunVault_Inner', (0, 1.45, -0.05), (0.70, 1.31, 0.36), GREEN, 0.06)
    door = cube('GunVault_Door', (-0.80, 1.45, 0.0), (0.08, 1.34, 0.40), STEEL, 0.07)
    cube('GunVault_Keypad', (-0.90, 1.60, -0.22), (0.045, 0.22, 0.12), DARK_STEEL, 0.025)
    for row in range(3):
        for col in range(3):
            cylinder(f'Key_{row}_{col}', (-0.95, 1.47+row*0.10, -0.29+col*0.09), 0.018, 0.018, AMBER, rotation=(0,math.pi/2,0), vertices=12, bevel=0.003)
    # interior rifle rack / shelves
    for y in (0.48, 0.74, 1.00):
        cube(f'AmmoShelf_{y}', (0.0, y, -0.28), (0.62, 0.035, 0.16), STEEL, 0.015)
    for x in (-0.36,0,0.36):
        torus(f'RifleClamp_{x}', (x, 1.65, -0.30), 0.07, 0.016, RUBBER, rotation=(math.pi/2,0,0))
    cube('VaultVent', (0.0, 2.62, 0.43), (0.46, 0.16, 0.018), DARK_STEEL, 0.015)
    for i in range(7):
        cube(f'VentSlot_{i}', (-0.36+i*0.12, 2.62, 0.455), (0.025,0.105,0.012), RUBBER, 0.004)
    export_glb('gun_vault.glb')


def build_cctv_console():
    clear_scene()
    # slanted control desk
    cube('Console_Base', (0, 0.72, 0.0), (2.15, 0.70, 0.68), DARK_STEEL, 0.12)
    cube('Console_DeskLip', (0, 1.34, -0.08), (2.0, 0.10, 0.72), STEEL, 0.06, rotation=(-0.14,0,0))
    # four independent monitor groups
    for i in range(4):
        col=i%2; row=i//2
        x=-0.92+col*1.84; y=1.72+row*0.92
        cube(f'MonitorHousing_{i+1}', (x,y,-0.46), (0.78,0.40,0.11), DARK_STEEL, 0.07)
        cube(f'MonitorScreen_{i+1}', (x,y,-0.585), (0.67,0.31,0.012), SCREEN, 0.025)
        cylinder(f'CamLED_{i+1}', (x+0.62,y+0.31,-0.61), 0.018, 0.018, RED, rotation=(math.pi/2,0,0), vertices=12, bevel=0.003)
    # keypad / joysticks
    for row in range(4):
        for col in range(7):
            cube(f'Button_{row}_{col}', (-1.42+col*0.22, 1.46, 0.18+row*0.13), (0.07,0.018,0.045), STEEL if (row+col)%3 else AMBER, 0.012, rotation=(-0.14,0,0))
    cylinder('PTZ_Joystick', (1.33, 1.62, 0.26), 0.055, 0.30, RUBBER, rotation=(0.15,0,0), vertices=20)
    torus('PTZ_JoystickBase', (1.33,1.48,0.26), 0.16,0.03,STEEL,rotation=(math.pi/2,0,0))
    export_glb('cctv_console.glb')


def build_perimeter_gate():
    clear_scene()
    # posts
    for x in (-4.7, 4.7):
        cylinder(f'GatePost_{x}', (x,1.7,0), 0.10, 3.4, DARK_STEEL, vertices=24)
        cylinder(f'PostCap_{x}', (x,3.45,0), 0.16, 0.10, STEEL, vertices=24)
    for side in (-1,1):
        cx = side*2.25
        cube(f'GateTop_{side}', (cx,2.95,0), (2.15,0.045,0.055), STEEL, 0.014)
        cube(f'GateBottom_{side}', (cx,0.35,0), (2.15,0.045,0.055), STEEL, 0.014)
        cube(f'GateOuter_{side}', (side*4.35,1.65,0), (0.055,1.30,0.055), STEEL, 0.014)
        cube(f'GateInner_{side}', (side*0.15,1.65,0), (0.055,1.30,0.055), STEEL, 0.014)
        # chain-link effect
        for j in range(11):
            x = side*(0.35+j*0.36)
            cylinder_between(f'WireV_{side}_{j}', (x,0.42,0), (x,2.88,0), 0.009, STEEL, 8)
        for j in range(7):
            y=0.55+j*0.34
            cylinder_between(f'WireH_{side}_{j}', (side*0.25,y,0), (side*4.22,y,0), 0.008, STEEL, 8)
    # razor / barbed top arcs
    for i in range(9):
        x=-4.0+i*1.0
        torus(f'WireLoop_{i}', (x,3.28,0), 0.25,0.012,STEEL,rotation=(math.pi/2,0,0))
    cube('RestrictedSign', (0,3.72,0), (1.15,0.26,0.05), RED, 0.025)
    export_glb('perimeter_gate.glb')


def build_floodlight():
    clear_scene()
    cylinder('FloodlightPole', (0,2.8,0), 0.075,5.6,DARK_STEEL,vertices=24)
    cube('Crossbar',(0,5.45,0),(0.72,0.055,0.06),STEEL,0.025)
    for x in (-0.43,0.43):
        cube(f'LampHousing_{x}',(x,5.28,-0.10),(0.30,0.20,0.16),DARK_STEEL,0.06,rotation=(-0.12,0,0))
        cube(f'LampLens_{x}',(x,5.24,-0.275),(0.25,0.15,0.012),GLASS,0.025,rotation=(-0.12,0,0))
        cube(f'LampGlow_{x}',(x,5.24,-0.290),(0.19,0.10,0.008),SCREEN,0.014,rotation=(-0.12,0,0))
    cylinder('PoleBase',(0,0.12,0),0.34,0.24,STEEL,vertices=32)
    for i in range(6):
        a=i*math.pi/3
        cylinder(f'BaseBolt_{i}',(math.cos(a)*0.22,0.25,math.sin(a)*0.22),0.035,0.08,DARK_STEEL,vertices=12,bevel=0.006)
    export_glb('floodlight.glb')


def build_dead_tree():
    clear_scene()
    # twisted trunk made from tapered-ish connected cylinders
    points=[(0,0,0),(0.06,1.1,0.02),(-0.10,2.25,0.06),(0.16,3.3,-0.04),(0.02,4.4,0.10)]
    for i in range(len(points)-1):
        cylinder_between(f'Trunk_{i}',points[i],points[i+1],0.34-i*0.045,BARK,18)
    branches=[
        ((-.05,2.0,.02),(-1.3,3.2,.30),0.16),
        ((.08,2.5,.02),(1.4,3.5,-.42),0.17),
        ((.12,3.15,.00),(.70,4.65,.55),0.13),
        ((.02,3.65,.06),(-.55,5.1,-.15),0.12),
        ((-1.3,3.2,.30),(-1.85,3.85,.48),0.08),
        ((1.4,3.5,-.42),(2.05,4.05,-.70),0.08),
        ((.70,4.65,.55),(1.18,5.35,.78),0.065),
        ((-.55,5.1,-.15),(-.95,5.75,-.30),0.06),
    ]
    for i,(a,b,r) in enumerate(branches):
        cylinder_between(f'Branch_{i}',a,b,r,BARK,14)
    # exposed roots
    for i in range(7):
        a=i*math.pi*2/7
        cylinder_between(f'Root_{i}',(0,.12,0),(math.cos(a)*(1.0+(i%2)*.3),-.04,math.sin(a)*(1.0+(i%3)*.15)),0.10,BARK,12)
    export_glb('dead_tree.glb')


build_blast_door()
build_gun_vault()
build_cctv_console()
build_perimeter_gate()
build_floodlight()
build_dead_tree()
print('Lost Signal Blender asset generation complete.')

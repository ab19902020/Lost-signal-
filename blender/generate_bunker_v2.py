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


def mat(name, color, metallic=0.0, roughness=0.6, emission=None, strength=0.0):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color, 1.0)
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    if emission:
        for key in ('Emission', 'Emission Color'):
            if key in bsdf.inputs:
                bsdf.inputs[key].default_value = (*emission, 1.0)
        if 'Emission Strength' in bsdf.inputs:
            bsdf.inputs['Emission Strength'].default_value = strength
    return m


def smooth(o):
    if o.type == 'MESH':
        for p in o.data.polygons:
            p.use_smooth = True


def bevel(o, width=0.04, segments=3):
    mod = o.modifiers.new('LS_Bevel', 'BEVEL')
    mod.width = width
    mod.segments = segments
    mod.limit_method = 'ANGLE'
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.modifier_apply(modifier=mod.name)
    smooth(o)


def cube(name, loc, half, material, rotation=(0,0,0), edge=0.04):
    bpy.ops.mesh.primitive_cube_add(location=loc, rotation=rotation)
    o = bpy.context.object
    o.name = name
    o.scale = half
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(material)
    if edge:
        bevel(o, edge, 3)
    return o


def cyl(name, loc, radius, depth, material, rotation=(0,0,0), verts=32, edge=0.015):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=depth, location=loc, rotation=rotation)
    o = bpy.context.object
    o.name = name
    o.data.materials.append(material)
    if edge:
        bevel(o, edge, 2)
    return o


def sphere(name, loc, radius, material, scale=(1,1,1)):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=radius, location=loc)
    o = bpy.context.object
    o.name = name
    o.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(material)
    smooth(o)
    return o


def torus(name, loc, major, minor, material, rotation=(0,0,0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, major_segments=48, minor_segments=16, location=loc, rotation=rotation)
    o = bpy.context.object
    o.name = name
    o.data.materials.append(material)
    smooth(o)
    return o


def between(name, a, b, radius, material, verts=16):
    a, b = Vector(a), Vector(b)
    d = b - a
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=d.length, location=(a+b)*0.5)
    o = bpy.context.object
    o.name = name
    o.rotation_mode = 'QUATERNION'
    o.rotation_quaternion = d.to_track_quat('Z','Y')
    o.rotation_mode = 'XYZ'
    o.data.materials.append(material)
    smooth(o)
    return o


# These scripts author with Y as the up axis (floor at y=0, ceiling at y=4.2),
# which is exactly the convention the Three.js runtime expects. Blender's glTF
# exporter otherwise assumes Z is up and rotates every asset 90 degrees on the
# way out, which shipped the whole world lying on its back. Exporting with
# export_yup=False keeps the authored axes, and the marker empty lets the loader
# tell a corrected asset from a legacy one.
ORIENTATION_MARKER = 'LS_ORIENT_YUP'


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
                              export_yup=False)
    print('EXPORT', path)


STEEL = mat('Steel', (0.19,0.22,0.20), .82, .30)
STEEL2 = mat('BrushedSteel', (0.34,0.37,0.34), .75, .34)
DARK = mat('DarkSteel', (0.035,0.045,0.040), .78, .38)
GREEN = mat('MilitaryGreen', (0.055,0.16,0.085), .32, .56)
RED = mat('WarningRed', (0.36,0.045,0.035), .22, .50)
WOOD = mat('DarkWood', (0.16,0.06,0.025), 0, .72)
RUBBER = mat('Rubber', (0.018,0.022,0.02), 0, .93)
FABRIC = mat('Fabric', (0.11,0.15,0.12), 0, .94)
SCREEN = mat('PhosphorScreen', (0.005,0.025,0.01), 0, .22, (0.05,1.0,0.20), 2.8)
AMBER = mat('AmberDisplay', (0.06,0.015,0.002), 0, .20, (1.0,.28,.02), 3.2)
WHITE = mat('ColdLamp', (.5,.58,.53), 0, .18, (.85,1.0,.9), 4.0)
CONCRETE = mat('Concrete', (.22,.23,.21), 0, .92)


def build_desk():
    clear_scene()
    cube('Desk_Top',(0,1.0,0),(2.15,.09,.72),WOOD,edge=.07)
    cube('Desk_LegL',(-1.78,.5,0),(.09,.5,.58),DARK,edge=.04)
    cube('Desk_LegR',(1.78,.5,0),(.09,.5,.58),DARK,edge=.04)
    cube('Desk_Drawers',(1.15,.55,0),(.52,.55,.52),STEEL2,edge=.07)
    for y in (.30,.52,.74):
        cube('Drawer_'+str(y),(1.15,y,-.535),(.44,.08,.02),DARK,edge=.012)
        cyl('DrawerHandle_'+str(y),(1.15,y,-.57),.025,.32,STEEL,rotation=(0,math.pi/2,0),verts=20)
    cube('Monitor_Housing',(-.62,1.68,-.18),(.82,.54,.10),DARK,edge=.075)
    cube('Terminal_Screen',(-.62,1.69,-.29),(.68,.40,.012),SCREEN,edge=.018)
    cube('Monitor_Stand',(-.62,1.20,-.10),(.09,.24,.07),DARK,edge=.025)
    cube('Monitor_Base',(-.62,1.04,-.04),(.42,.035,.27),DARK,edge=.025)
    cube('Keyboard',(-.62,1.12,.42),(.70,.04,.23),DARK,rotation=(-.08,0,0),edge=.03)
    for row in range(4):
        for col in range(12):
            cube('Key_%d_%d'%(row,col),(-1.15+col*.095,1.168,.30+row*.08),(.035,.012,.025),STEEL2,rotation=(-.08,0,0),edge=.006)
    cyl('Mug',(1.72,1.19,.22),.09,.22,STEEL2,verts=24)
    export('desk_station.glb')


def build_radio():
    clear_scene()
    cube('Radio_Body',(0,.30,0),(.68,.30,.30),GREEN,edge=.065)
    cube('Radio_Display',(-.24,.37,-.315),(.25,.12,.012),AMBER,edge=.015)
    for i in range(3):
        cyl('Radio_Knob%d'%i,(.16+i*.22,.25,-.335),.075,.055,DARK,verts=28)
    for i in range(9):
        cube('SpeakerSlot%d'%i,(-.57+i*.065,.18,-.337),(.012,.11,.012),DARK,edge=.004)
    cyl('Antenna',(0.52,1.0,.06),.011,1.25,STEEL2,rotation=(0,0,-.10),verts=10)
    export('radio.glb')


def build_cctv():
    """The control room console.

    A curved bank of screens wrapping round an arc desk, under a big round
    drum fixture — the room reads as a watch floor rather than a desk with four
    televisions on it. The arc is struck about the point the operator stands,
    so every screen faces them.
    """
    clear_scene()
    EYE = 1.30                       # where the operator stands, in +Z
    BRONZE = mat('ConsoleBronze', (0.10,0.075,0.05), .55, .42)
    # The drum is a metre across and hangs right over the desk. At the strength
    # the small lamps use it blows out the whole room and washes the screens
    # flat — in the reference the screens are the light and the room is dark.
    LAMP = mat('ConsoleLamp', (.24,.22,.18), 0, .24, (1.0,.90,.72), 0.85)
    FEED = mat('ConsoleFeed', (0.02,0.05,0.04), 0, .18, (0.42,0.88,0.62), 4.2)
    BLUE = mat('ConsoleBlue', (0.01,0.03,0.05), 0, .20, (0.24,0.62,1.0), 3.6)

    # --- Screen bank ---------------------------------------------------------
    for tier, (radius, y, tilt, count, hw, hh) in enumerate((
            (2.55, 1.62, -0.10, 7, .40, .25),
            (2.75, 2.30, -0.26, 7, .40, .25),
    )):
        for k in range(count):
            t = (k - (count - 1) / 2) * 0.285
            x = math.sin(t) * radius
            z = EYE - math.cos(t) * radius
            cube('ScreenFrame_%d_%d' % (tier, k), (x, y, z), (hw + .045, hh + .045, .075),
                 BRONZE, rotation=(tilt, t, 0), edge=.03)
            cube('Screen_%d_%d' % (tier, k),
                 (x + math.sin(t) * .05, y + math.sin(-tilt) * .05, z + math.cos(t) * .05),
                 (hw, hh, .012), FEED if (k + tier) % 3 else BLUE,
                 rotation=(tilt, t, 0), edge=.006)
            if (k + tier) % 4 == 0:
                cyl('ScreenLED_%d_%d' % (tier, k),
                    (x + math.sin(t) * .10, y - hh - .07, z + math.cos(t) * .10),
                    .014, .012, RED, rotation=(math.pi/2 + tilt, 0, 0), verts=10)
        # A bronze rail capping each tier, and the carcass behind it.
        for k in range(count - 1):
            t = (k - (count - 1) / 2 + .5) * 0.285
            cube('BankPost_%d_%d' % (tier, k),
                 (math.sin(t) * radius, y, EYE - math.cos(t) * radius),
                 (.035, hh + .06, .085), BRONZE, rotation=(tilt, t, 0), edge=.015)

    # --- Arc desk ------------------------------------------------------------
    for k in range(9):
        t = (k - 4) * 0.20
        x = math.sin(t) * 1.55
        z = EYE - math.cos(t) * 1.55
        cube('Desk_%d' % k, (x, .74, z), (.34, .04, .40), STEEL2, rotation=(0, t, 0), edge=.02)
        cube('DeskBody_%d' % k, (x, .37, z + .06), (.32, .37, .30), DARK, rotation=(0, t, 0), edge=.04)
        cube('DeskLip_%d' % k, (x + math.sin(t) * .38, .82, z + math.cos(t) * .38),
             (.34, .05, .05), BRONZE, rotation=(0, t, 0), edge=.015)
    for k, t in enumerate((-0.52, 0.0, 0.52)):
        x = math.sin(t) * 1.42
        z = EYE - math.cos(t) * 1.42
        cube('Keyboard_%d' % k, (x, .79, z + .10), (.24, .015, .10), DARK,
             rotation=(-.06, t, 0), edge=.008)
        for r in range(3):
            cube('Keys_%d_%d' % (k, r), (x, .805, z + .04 + r * .06), (.22, .006, .022),
                 STEEL2, rotation=(-.06, t, 0), edge=.003)
        cube('DeskPanel_%d' % k, (x, .80, z - .26), (.20, .012, .13), AMBER,
             rotation=(-.55, t, 0), edge=.006)

    # --- The drum overhead ---------------------------------------------------
    torus('DrumRim', (0, 2.92, EYE - .30), 1.05, .085, BRONZE, rotation=(math.pi/2, 0, 0))
    cyl('DrumShade', (0, 2.90, EYE - .30), 1.00, .22, LAMP, rotation=(math.pi/2, 0, 0), verts=40, edge=.02)
    cyl('DrumTop', (0, 3.05, EYE - .30), 1.02, .10, DARK, rotation=(math.pi/2, 0, 0), verts=40, edge=.02)
    for k in range(4):
        a = k * math.pi / 4
        cube('DrumBar_%d' % k, (0, 2.98, EYE - .30), (1.0, .045, .045), BRONZE,
             rotation=(0, a, 0), edge=.012)
    for k in range(3):
        a = k * math.tau / 3
        between('DrumHang_%d' % k, (math.cos(a) * .9, 3.05, EYE - .30 + math.sin(a) * .9),
                (math.cos(a) * .5, 3.6, EYE - .30 + math.sin(a) * .5), .014, DARK)

    # Small task pendants over the desk, as in the reference.
    for t in (-0.66, 0.0, 0.66):
        x = math.sin(t) * 1.95
        z = EYE - math.cos(t) * 1.95
        cyl('TaskRod_%d' % int(t * 100), (x, 2.72, z), .010, .70, DARK, rotation=(math.pi/2, 0, 0), verts=6)
        cyl('TaskShade_%d' % int(t * 100), (x, 2.33, z), .13, .11, BRONZE,
            rotation=(math.pi/2, 0, 0), verts=16, edge=.02)
        cyl('TaskGlow_%d' % int(t * 100), (x, 2.28, z), .105, .03, LAMP,
            rotation=(math.pi/2, 0, 0), verts=16, edge=.006)

    export('cctv_console_v2.glb')


def build_vault():
    clear_scene()
    cube('GunVault_Body',(0,1.45,0),(.86,1.45,.43),DARK,edge=.11)
    cube('GunVault_Inner',(0,1.45,-.05),(.70,1.30,.35),GREEN,edge=.055)
    cube('GunVault_Door',(-.80,1.45,.02),(.08,1.33,.40),STEEL2,edge=.065)
    cube('GunVault_Keypad',(-.90,1.55,-.22),(.04,.24,.14),DARK,edge=.025)
    for row in range(4):
        for col in range(3):
            cyl('Key_%d_%d'%(row,col),(-.945,1.40+row*.11,-.30+col*.09),.016,.015,AMBER,rotation=(0,math.pi/2,0),verts=12,edge=.003)
    for y in (.42,.66,.90):
        cube('AmmoShelf_'+str(y),(0,y,-.30),(.61,.03,.16),STEEL2,edge=.012)
    for x in (-.34,0,.34):
        torus('RifleClamp_'+str(x),(x,1.68,-.31),.07,.014,RUBBER,rotation=(math.pi/2,0,0))
    export('gun_vault_v2.glb')


def build_rifle():
    clear_scene()
    cube('Rifle_Stock',(-.48,.03,0),(.34,.10,.075),WOOD,rotation=(0,0,-.04),edge=.045)
    cube('Rifle_Receiver',(0,.04,0),(.27,.10,.08),STEEL,edge=.035)
    cyl('Rifle_Barrel',(.58,.05,0),.030,.92,STEEL,rotation=(0,math.pi/2,0),verts=28,edge=.006)
    cyl('Rifle_Muzzle',(1.05,.05,0),.045,.12,DARK,rotation=(0,math.pi/2,0),verts=24,edge=.008)
    cube('Rifle_Grip',(-.06,-.17,0),(.085,.22,.07),WOOD,rotation=(0,0,.26),edge=.035)
    cube('Rifle_Mag',(.13,-.14,0),(.07,.18,.07),DARK,rotation=(0,0,-.08),edge=.025)
    cyl('Scope_Main',(.15,.21,0),.055,.44,DARK,rotation=(0,math.pi/2,0),verts=28,edge=.008)
    cyl('Scope_Front',(.38,.21,0),.072,.08,DARK,rotation=(0,math.pi/2,0),verts=28,edge=.008)
    cyl('Scope_Rear',(-.08,.21,0),.070,.08,DARK,rotation=(0,math.pi/2,0),verts=28,edge=.008)
    cube('Scope_Rail',(.15,.135,0),(.28,.025,.045),STEEL2,edge=.008)
    torus('TriggerGuard',(-.03,-.075,0),.11,.018,STEEL,rotation=(math.pi/2,0,0))
    cyl('BoltHandle',(.05,.09,-.12),.018,.18,STEEL2,rotation=(math.pi/2,0,0),verts=16)
    sphere('BoltKnob',(.05,.09,-.22),.035,DARK)
    export('hunting_rifle.glb')


def build_generator():
    clear_scene()
    cube('Generator_Frame',(0,.88,0),(1.40,.88,.72),GREEN,edge=.13)
    cube('Generator_Vent',(0,1.02,-.75),(1.20,.35,.025),DARK,edge=.018)
    for x in [i*.22-1.0 for i in range(10)]:
        cube('Vent_'+str(x),(x,1.02,-.78),(.045,.28,.015),STEEL2,edge=.007)
    cube('Generator_Panel',(.72,1.38,-.77),(.42,.26,.025),DARK,edge=.025)
    for i,(x,m) in enumerate(((.52,SCREEN),(.72,AMBER),(.92,RED))):
        cyl('GenLED%d'%i,(x,1.42,-.81),.035,.018,m,verts=16)
    cyl('Generator_Exhaust',(-.93,1.82,.05),.10,.85,DARK,verts=22)
    torus('ExhaustBend',(-.65,2.22,.05),.28,.10,DARK,rotation=(math.pi/2,0,0))
    for x in (-.92,.92):
        cyl('Foot_'+str(x),(x,.05,-.48),.11,.12,RUBBER,verts=20)
        cyl('Foot2_'+str(x),(x,.05,.48),.11,.12,RUBBER,verts=20)
    export('generator.glb')


def build_bed():
    clear_scene()
    cube('Bed_Frame',(0,.46,0),(1.05,.12,2.10),DARK,edge=.055)
    cube('Mattress',(0,.68,0),(.96,.16,1.93),FABRIC,edge=.12)
    cube('Blanket',(0,.83,.38),(.92,.055,.95),GREEN,edge=.07)
    cube('Pillow',(0,.88,-1.35),(.72,.13,.36),FABRIC,edge=.14)
    for x in (-.94,.94):
        for z in (-1.90,1.90):
            cyl('BedLeg', (x,.22,z), .035,.44,STEEL2,verts=14)
    export('bed.glb')


def build_chair():
    clear_scene()
    cube('Chair_Seat',(0,.76,0),(.50,.08,.50),RUBBER,edge=.10)
    cube('Chair_Back',(0,1.43,.43),(.50,.58,.08),RUBBER,rotation=(-.12,0,0),edge=.11)
    cyl('Chair_Stem',(0,.40,0),.065,.65,DARK,verts=24)
    for i in range(5):
        a=i*math.tau/5
        between('Chair_Leg%d'%i,(0,.10,0),(math.sin(a)*.62,.08,math.cos(a)*.62),.035,DARK,12)
        cyl('Caster%d'%i,(math.sin(a)*.62,.03,math.cos(a)*.62),.055,.08,RUBBER,rotation=(math.pi/2,0,0),verts=16)
    export('chair.glb')


def build_storage():
    clear_scene()
    for x in (-.86,.86):
        for z in (-.30,.30):
            cube('RackPost',(x,1.42,z),(.045,1.42,.045),DARK,edge=.012)
    for y in (.24,.82,1.40,1.98,2.56):
        cube('Shelf_'+str(y),(0,y,0),(.96,.035,.38),STEEL2,edge=.018)
    for row,y in enumerate((.48,1.06,1.64,2.22)):
        for col in range(3):
            x=-.54+col*.54
            cube('SupplyCrate_%d_%d'%(row,col),(x,y,0),(.22,.15,.24),GREEN if (row+col)%2 else WOOD,edge=.035)
            cube('CrateLatch_%d_%d'%(row,col),(x,y,-.255),(.045,.025,.012),STEEL2,edge=.005)
    export('storage_rack.glb')


def build_door():
    clear_scene()
    cube('BlastDoor_Frame',(0,1.65,.05),(1.98,1.86,.17),DARK,edge=.11)
    cube('BlastDoor_Door',(0,1.65,-.12),(1.70,1.60,.16),STEEL2,edge=.12)
    cube('BlastDoor_Inset',(0,1.65,-.30),(1.48,1.37,.035),DARK,edge=.055)
    for y in (.55,1.1,1.65,2.2,2.75):
        cube('DoorBrace_'+str(y),(0,y,-.355),(1.32,.055,.055),STEEL2,edge=.022)
    torus('DoorWheel_Rim',(.82,1.62,-.43),.42,.045,RED)
    cyl('DoorWheel_Hub',(.82,1.62,-.43),.11,.12,DARK,verts=28)
    for i in range(8):
        a=i*math.tau/8
        between('Spoke%d'%i,(.82+math.cos(a)*.09,1.62+math.sin(a)*.09,-.43),(.82+math.cos(a)*.38,1.62+math.sin(a)*.38,-.43),.018,RED,12)
    for sx in (-1,1):
        for sy in (.52,1.0,1.48,1.96,2.44,2.92):
            cyl('DoorBolt', (sx*1.52,sy,-.40),.044,.055,DARK,verts=16,edge=.006)
    export('blast_door_v2.glb')


def build_pipes():
    clear_scene()
    for i,r in enumerate((.08,.10,.13)):
        x=-.35+i*.36
        cyl('Pipe%d'%i,(x,1.4,0),r,2.8,STEEL2 if i else RED,verts=28)
        torus('PipeElbow%d'%i,(x,2.80,.30),.30,r,STEEL2 if i else RED,rotation=(math.pi/2,0,0))
        cyl('PipeRun%d'%i,(x,2.80,.88),r,1.18,STEEL2 if i else RED,rotation=(math.pi/2,0,0),verts=28)
        torus('PipeClamp%d'%i,(x,1.20,0),r+.05,.018,DARK,rotation=(math.pi/2,0,0))
    export('pipe_cluster.glb')


def build_light():
    clear_scene()
    cube('Light_Housing',(0,0,0),(1.30,.10,.24),DARK,edge=.055)
    cube('Light_Lens',(0,-.10,0),(1.08,.025,.16),WHITE,edge=.035)
    for x in (-1.12,1.12):
        cube('Light_Clip'+str(x),(x,.02,0),(.08,.10,.20),STEEL2,edge=.025)
    export('ceiling_light.glb')


for fn in (build_desk,build_radio,build_cctv,build_vault,build_rifle,build_generator,build_bed,build_chair,build_storage,build_door,build_pipes,build_light):
    fn()

print('Lost Signal Blender bunker V2 complete.')

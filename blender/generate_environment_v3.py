import bpy
import math
import os
from mathutils import Vector

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'assets', 'blender')
TEX = os.path.join(ROOT, 'public', 'assets', 'textures')
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
        for key in ('Emission Color', 'Emission'):
            if key in bsdf.inputs:
                bsdf.inputs[key].default_value = (*emission, 1.0)
        if 'Emission Strength' in bsdf.inputs:
            bsdf.inputs['Emission Strength'].default_value = strength
    return m


def image_pbr(name, color_file, normal_file, rough_file, tint=(1,1,1,1), metallic=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = tint
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = .8
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
        nm.inputs['Strength'].default_value = .72
        nt.links.new(n.outputs['Color'], nm.inputs['Color'])
        nt.links.new(nm.outputs['Normal'], bsdf.inputs['Normal'])
    return m


def bevel(o, width=.04, segments=3):
    if o.type != 'MESH': return
    mod = o.modifiers.new('LS_Bevel', 'BEVEL')
    mod.width = width
    mod.segments = segments
    mod.limit_method = 'ANGLE'
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.modifier_apply(modifier=mod.name)
    for p in o.data.polygons: p.use_smooth = True


def has_image(material):
    if not material or not material.use_nodes:
        return False
    return any(n.type == 'TEX_IMAGE' for n in material.node_tree.nodes)


def world_uv(o, tile=2.2):
    """Project UVs from world coordinates so texel density and aspect are right.

    Blender's box unwrap gives every face the full 0..1 range whatever its size,
    so a 2 m x 17 m wall panel stretches its tiles into vertical streaks. A cube
    projection measured in metres fixes both density and aspect at the source.
    """
    if o.type != 'MESH' or not any(has_image(m) for m in o.data.materials):
        return o
    bpy.context.view_layer.objects.active = o
    o.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.cube_project(cube_size=tile, correct_aspect=True, scale_to_bounds=False)
    bpy.ops.object.mode_set(mode='OBJECT')
    return o


def cube(name, loc, half, material, rotation=(0,0,0), edge=.035):
    bpy.ops.mesh.primitive_cube_add(location=loc, rotation=rotation)
    o = bpy.context.object
    o.name = name
    o.scale = half
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(material)
    if edge: bevel(o, edge, 3)
    return world_uv(o)


def cyl(name, loc, radius, depth, material, rotation=(0,0,0), verts=32, edge=.012):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=depth, location=loc, rotation=rotation)
    o = bpy.context.object
    o.name = name
    o.data.materials.append(material)
    if edge: bevel(o, edge, 2)
    return o


def torus(name, loc, major, minor, material, rotation=(0,0,0), major_segments=40, minor_segments=12):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, major_segments=major_segments, minor_segments=minor_segments, location=loc, rotation=rotation)
    o = bpy.context.object
    o.name = name
    o.data.materials.append(material)
    for p in o.data.polygons: p.use_smooth = True
    return o


def between(name, a, b, radius, material, verts=16):
    a, b = Vector(a), Vector(b)
    d = b-a
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=d.length, location=(a+b)*.5)
    o = bpy.context.object
    o.name = name
    o.rotation_mode = 'QUATERNION'
    o.rotation_quaternion = d.to_track_quat('Z','Y')
    o.rotation_mode = 'XYZ'
    o.data.materials.append(material)
    for p in o.data.polygons: p.use_smooth = True
    return o


def text_obj(name, text, loc, size, material, rotation=(0,math.pi,0), extrude=.006):
    bpy.ops.object.text_add(location=loc, rotation=rotation)
    o = bpy.context.object
    o.name = name
    o.data.body = text
    o.data.align_x = 'CENTER'
    o.data.align_y = 'CENTER'
    o.data.size = size
    o.data.extrude = extrude
    o.data.bevel_depth = .002
    o.data.materials.append(material)
    bpy.context.view_layer.objects.active = o
    o.select_set(True)
    bpy.ops.object.convert(target='MESH')
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
    # export_keep_originals references the shared JPEGs in ../textures instead of
    # baking a private copy of every one into each GLB. The same six 1K maps were
    # embedded five times over, which was 10 MB of the asset payload and five
    # separate GPU uploads of identical images.
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', use_selection=True,
                              export_apply=True, export_yup=False,
                              export_keep_originals=True)
    print('EXPORT', path)


CONCRETE = image_pbr('ConcretePBR','concrete__Concrete034_1K_Color.jpg','concrete__Concrete034_1K_NormalGL.jpg','concrete__Concrete034_1K_Roughness.jpg')
PLATE = image_pbr('DiamondPlatePBR','metal_floor_plate__DiamondPlate008C_1K_Color.jpg','metal_floor_plate__DiamondPlate008C_1K_NormalGL.jpg','metal_floor_plate__DiamondPlate008C_1K_Roughness.jpg', metallic=.58)
STEEL = mat('SteelV3',(0.18,.21,.20),.82,.32)
BRUSHED = mat('BrushedSteelV3',(.34,.37,.35),.78,.30)
DARK = mat('DarkSteelV3',(.028,.035,.032),.84,.34)
GREEN = mat('ShelterGreenV3',(.045,.12,.065),.36,.52)
OLIVE = mat('OlivePaintV3',(.12,.16,.08),.22,.62)
RED = mat('EmergencyRedV3',(.44,.035,.025),.28,.48)
YELLOW = mat('HazardYellowV3',(.72,.43,.035),.18,.48)
RUBBER = mat('RubberV3',(.012,.015,.014),0,.94)
WHITE = mat('ColdWhiteV3',(.65,.70,.68),0,.30)
GLASS = mat('ScreenGlassV3',(.015,.025,.02),.08,.18)
GREEN_GLOW = mat('GreenGlowV3',(.005,.03,.008),0,.18,(.05,1.0,.18),4.0)
AMBER_GLOW = mat('AmberGlowV3',(.05,.015,.002),0,.18,(1.0,.32,.02),4.0)
RED_GLOW = mat('RedGlowV3',(.05,.002,.001),0,.18,(1.0,.03,.01),5.0)
BLUE = mat('MedicalBlueV3',(.035,.12,.22),.10,.55)
WOOD = mat('WorkbenchWoodV3',(.20,.08,.025),0,.72)


def bolt_grid(prefix, xs, ys, z, material=DARK, radius=.025):
    for ix,x in enumerate(xs):
        for iy,y in enumerate(ys):
            cyl(f'{prefix}_{ix}_{iy}',(x,y,z),radius,.035,material,verts=14,edge=.003)


def build_environment():
    clear_scene()
    # floor and ceiling are Blender-authored modules, not runtime planes
    cube('Bunker_FloorSlab',(0,-.18,0),(7.1,.18,7.6),CONCRETE,edge=.08)
    cube('Bunker_FloorPlate',(0,.015,0),(6.55,.045,7.05),PLATE,edge=.025)
    cube('Bunker_Ceiling',(0,4.20,0),(7.1,.20,7.6),CONCRETE,edge=.08)
    # segmented walls create shadow lines and depth
    for i,z in enumerate((-6.15,-3.05,0.05,3.15,6.20)):
        cube(f'WallLeft_{i}',(-7.02,2,z),(.22,2.18,1.50),CONCRETE,edge=.07)
        cube(f'WallRight_{i}',(7.02,2,z),(.22,2.18,1.50),CONCRETE,edge=.07)
    for i,x in enumerate((-5.55,-2.75,0,2.75,5.55)):
        cube(f'WallBack_{i}',(x,2,-7.50),(1.32,2.18,.22),CONCRETE,edge=.07)
        if abs(x) > 1.8:
            cube(f'WallFront_{i}',(x,2,7.50),(1.32,2.18,.22),CONCRETE,edge=.07)
    # blast-door concrete reveal and steel lintel
    cube('DoorRevealTop',(0,3.72,-7.34),(2.50,.34,.34),DARK,edge=.06)
    cube('DoorRevealL',(-2.18,1.72,-7.34),(.32,1.72,.34),DARK,edge=.06)
    cube('DoorRevealR',(2.18,1.72,-7.34),(.32,1.72,.34),DARK,edge=.06)
    # ceiling ribs and hanging cable trays
    for i,z in enumerate((-6.4,-4.3,-2.2,-.1,2.0,4.1,6.2)):
        cube(f'CeilingRib_{i}',(0,3.96,z),(6.70,.13,.11),DARK,edge=.025)
        for x in (-5.9,5.9):
            cube(f'RibFoot_{i}_{x}',(x,3.56,z),(.10,.50,.11),DARK,edge=.02)
    cube('CableTray_Main',(5.1,3.62,0),(.55,.08,6.85),BRUSHED,edge=.025)
    for z in [i*.48-6.5 for i in range(28)]:
        cube('CableTrayRung_'+str(round(z,2)),(5.1,3.72,z),(.55,.025,.025),DARK,edge=.006)
    for x,c in ((4.82,RED),(5.04,YELLOW),(5.27,STEEL)):
        cyl('UtilityCable_'+str(x),(x,3.76,0),.028,13.2,c,verts=16,edge=.004)
    # drainage channel + individually modelled steel grating
    cube('DrainTrench',(-5.80,.055,0),(.70,.08,6.45),DARK,edge=.015)
    for i,z in enumerate([-.0 + (-6.25 + j*.22) for j in range(58)]):
        cube(f'DrainBar_{i}',(-5.80,.13,z),(.62,.025,.026),BRUSHED,edge=.005)
    cube('DrainEdgeA',(-6.49,.14,0),(.035,.045,6.45),BRUSHED,edge=.008)
    cube('DrainEdgeB',(-5.11,.14,0),(.035,.045,6.45),BRUSHED,edge=.008)
    # lower wall impact rails and armoured panels
    for side in (-1,1):
        x=side*6.76
        cube('WallRail_'+str(side),(x,.48,0),(.12,.13,7.0),DARK,edge=.025)
        for iz,z in enumerate((-5.5,-2.7,.1,2.9,5.7)):
            cube(f'ArmorPanel_{side}_{iz}',(x-side*.03,1.70,z),(.045,.72,1.20),GREEN,edge=.035)
            bolt_grid(f'ArmorBolt_{side}_{iz}',[x-side*.075], [1.08,2.32], z-side*.01)
    # wall conduit ladders
    for x in (-5.4,-4.9,-4.4):
        cyl('ConduitVertical_'+str(x),(x,2.15,7.20),.035,3.4,BRUSHED,rotation=(math.pi/2,0,0),verts=18)
        torus('ConduitBend_'+str(x),(x,3.84,6.88),.32,.035,BRUSHED,rotation=(0,math.pi/2,0))
    # hazard stripes at doorway
    for i in range(10):
        material = YELLOW if i%2==0 else DARK
        cube(f'DoorHazardL_{i}',(-2.0,.32+i*.30,-7.03),(.10,.13,.035),material,rotation=(0,0,-.42),edge=.006)
        cube(f'DoorHazardR_{i}',(2.0,.32+i*.30,-7.03),(.10,.13,.035),material,rotation=(0,0,.42),edge=.006)
    export('bunker_environment_v3.glb')


def build_ventilation():
    clear_scene()
    cube('AHU_Body',(0,1.25,0),(1.45,1.15,.65),GREEN,edge=.12)
    cube('AHU_ServiceDoor',(-.58,1.30,-.68),(.56,.80,.035),DARK,edge=.035)
    bolt_grid('AHU_DoorBolt',[-1.05,-.12],[.62,1.98],-.72,STEEL,.022)
    # exposed fan face
    cyl('FanHousing',(.72,1.38,-.70),.53,.08,DARK,verts=48)
    cyl('FanHub',(.72,1.38,-.77),.11,.09,BRUSHED,verts=28)
    for i in range(8):
        a=i*math.tau/8
        blade=cube(f'FanBlade_{i}',(.72+math.cos(a)*.25,1.38+math.sin(a)*.25,-.78),(.24,.055,.018),BRUSHED,rotation=(0,0,a+.35),edge=.018)
    torus('FanGuard',(.72,1.38,-.79),.50,.022,BRUSHED,major_segments=48)
    # filter stack
    for i in range(4):
        cube(f'Filter_{i}',(-.70+i*.44,.42,-.69),(.18,.28,.035),WHITE,edge=.025)
        for j in range(6):
            cube(f'FilterPleat_{i}_{j}',(-.84+i*.44+j*.055,.42,-.73),(.012,.24,.01),DARK,edge=.002)
    # gauges
    for i,x in enumerate((-.72,-.30,.12)):
        cyl(f'Gauge_{i}',(x,2.05,-.70),.115,.055,BRUSHED,verts=32)
        cyl(f'GaugeGlass_{i}',(x,2.05,-.738),.085,.015,GLASS,verts=32)
        between(f'GaugeNeedle_{i}',(x,2.05,-.755),(x+.045,2.10,-.755),.008,RED,10)
    # ducts
    cube('DuctTop',(0,2.62,.10),(1.0,.22,.55),BRUSHED,edge=.08)
    cube('DuctRise',(0,3.12,.10),(.55,.55,.45),BRUSHED,edge=.08)
    for y in (2.58,3.0,3.52):
        torus('DuctBand_'+str(y),(0,y,.10),.58,.025,DARK,rotation=(math.pi/2,0,0),major_segments=36)
    export('ventilation_unit_v3.glb')


def build_electrical():
    clear_scene()
    cube('Elec_Backboard',(0,1.40,.08),(1.40,1.35,.08),DARK,edge=.06)
    cube('BreakerCabinet',(-.55,1.55,-.04),(.68,.92,.18),GREEN,edge=.07)
    cube('BreakerDoor',(-.55,1.55,-.245),(.61,.85,.025),BRUSHED,edge=.035)
    for row in range(5):
        for col in range(4):
            x=-1.0+col*.29; y=.95+row*.25
            cube(f'Breaker_{row}_{col}',(x,y,-.285),(.095,.07,.025),DARK,edge=.012)
            cube(f'BreakerToggle_{row}_{col}',(x,y+.02,-.32),(.028,.04,.018),RED if (row+col)%7==0 else WHITE,edge=.006)
    cube('MeterBox',(.60,1.82,-.06),(.52,.46,.18),GREEN,edge=.06)
    for i,x in enumerate((.34,.72)):
        cyl(f'Meter_{i}',(x,1.88,-.255),.14,.04,BRUSHED,verts=32)
        cyl(f'MeterFace_{i}',(x,1.88,-.282),.108,.012,GLASS,verts=32)
    cube('EmergencyIsolator',(.72,.88,-.10),(.34,.25,.20),YELLOW,edge=.06)
    cyl('IsolatorKnob',(.72,.88,-.34),.11,.08,RED,verts=28)
    for x in (-1.0,-.55,-.10,.36,.82,1.20):
        cyl('ElecConduit'+str(x),(x,3.10,.10),.034,2.2,BRUSHED,verts=18)
    text_obj('ElecLabel','POWER DISTRIBUTION',(0,.28,-.27),.19,YELLOW,rotation=(0,math.pi,0),extrude=.004)
    export('electrical_wall_v3.glb')


def build_lockers():
    clear_scene()
    for i in range(4):
        x=-1.17+i*.78
        cube(f'LockerBody_{i}',(x,1.18,0),(.37,1.18,.36),GREEN,edge=.055)
        cube(f'LockerDoor_{i}',(x,1.18,-.385),(.34,1.12,.025),STEEL,edge=.025)
        for j in range(5):
            cube(f'LockerVent_{i}_{j}',(x-.12+j*.06,1.95,-.42),(.018,.055,.009),DARK,edge=.002)
        cyl(f'LockerHandle_{i}',(x+.21,1.18,-.43),.018,.20,BRUSHED,rotation=(0,0,0),verts=12)
        cyl(f'LockerHingeA_{i}',(x-.31,.55,-.415),.025,.13,DARK,verts=14)
        cyl(f'LockerHingeB_{i}',(x-.31,1.80,-.415),.025,.13,DARK,verts=14)
    cube('LockerPlinth',(0,.08,0),(1.60,.08,.40),DARK,edge=.025)
    export('locker_bank_v3.glb')


def build_bench():
    clear_scene()
    cube('BenchTop',(0,1.0,0),(1.65,.10,.55),WOOD,edge=.06)
    for x in (-1.43,1.43):
        cube('BenchLeg'+str(x),(x,.49,0),(.09,.49,.45),DARK,edge=.035)
    cube('ToolBoard',(0,1.95,.43),(1.55,.72,.06),GREEN,edge=.05)
    # peg holes
    for r in range(7):
        for c in range(16):
            cyl(f'Peg_{r}_{c}',(-1.35+c*.18,1.42+r*.17,.355),.010,.012,DARK,verts=8,edge=.001)
    # vice
    cube('ViceBase',(-1.05,1.18,-.12),(.28,.12,.22),BRUSHED,edge=.045)
    cube('ViceJawA',(-1.05,1.34,-.30),(.27,.16,.06),DARK,edge=.025)
    cube('ViceJawB',(-1.05,1.34,-.02),(.27,.16,.06),DARK,edge=.025)
    between('ViceHandle',(-1.36,1.14,-.34),(-.78,1.14,-.34),.018,BRUSHED,14)
    # hanging tools
    for i,x in enumerate((-.70,-.35,0,.35,.70,.98)):
        between(f'ToolShaft_{i}',(x,1.60,.32),(x,2.25,.32),.020,BRUSHED,12)
        cube(f'ToolGrip_{i}',(x,1.56,.32),(.055,.15,.045),RUBBER,edge=.018)
    # drawers
    cube('BenchDrawerBox',(.82,.54,0),(.62,.44,.46),DARK,edge=.055)
    for i,y in enumerate((.25,.50,.75)):
        cube(f'BenchDrawer_{i}',(.82,y,-.48),(.55,.10,.025),GREEN,edge=.018)
        between(f'DrawerHandle_{i}',(.65,y,-.52),(.99,y,-.52),.012,BRUSHED,10)
    export('maintenance_bench_v3.glb')


def build_clutter():
    clear_scene()
    # fuel/water cans
    for i,(x,z,m) in enumerate(((-.95,0,RED),(-.35,.08,OLIVE),(.30,-.04,OLIVE))):
        cube(f'JerryCan_{i}',(x,.38,z),(.25,.36,.13),m,edge=.055)
        torus(f'JerryHandle_{i}',(x,.78,z),.13,.025,DARK,rotation=(math.pi/2,0,0),major_segments=24)
        cyl(f'JerryCap_{i}',(x+.16,.72,z-.12),.045,.06,BRUSHED,rotation=(math.pi/2,0,0),verts=18)
    # gas cylinders
    for i,x in enumerate((.90,1.30)):
        cyl(f'GasBottle_{i}',(x,.52,.10),.16,.88,BLUE if i else GREEN,verts=28,edge=.025)
        torus(f'GasShoulder_{i}',(x,.95,.10),.13,.03,BRUSHED,rotation=(math.pi/2,0,0))
        cyl(f'GasValve_{i}',(x,1.08,.10),.045,.15,BRUSHED,verts=16)
    # med box
    cube('MedCase',(-.05,.25,-.55),(.38,.24,.20),WHITE,edge=.055)
    cube('MedCrossV',(-.05,.25,-.765),(.055,.14,.012),RED,edge=.008)
    cube('MedCrossH',(-.05,.25,-.765),(.14,.055,.012),RED,edge=.008)
    # extinguisher
    cyl('ExtinguisherBody',(1.72,.48,-.55),.15,.72,RED,verts=30,edge=.025)
    cyl('ExtinguisherNeck',(1.72,.89,-.55),.06,.13,DARK,verts=18)
    between('ExtinguisherHose',(1.72,.91,-.55),(1.93,.60,-.68),.018,RUBBER,12)
    # ration crates
    for i in range(3):
        cube(f'RationCrate_{i}',(-1.25+i*.55,.22,.72),(.24,.20,.28),OLIVE,edge=.04)
        cube(f'RationBand_{i}',(-1.25+i*.55,.22,.43),(.05,.18,.012),YELLOW,edge=.005)
    export('survival_clutter_v3.glb')


def build_status():
    clear_scene()
    cube('StatusHousing',(0,1.0,0),(1.35,.72,.08),DARK,edge=.07)
    cube('StatusGlass',(0,1.0,-.095),(1.22,.60,.018),GLASS,edge=.025)
    text_obj('ShelterTitle','SHELTER 47',(0,1.42,-.125),.24,WHITE,rotation=(0,math.pi,0),extrude=.003)
    text_obj('Occupancy','OCCUPANCY  01',(0,1.05,-.125),.16,GREEN_GLOW,rotation=(0,math.pi,0),extrude=.003)
    text_obj('SystemLine','AIR  OK   WATER  OK   POWER  73%',(0,.75,-.125),.095,AMBER_GLOW,rotation=(0,math.pi,0),extrude=.002)
    for i,x in enumerate((-.92,-.62,-.32,.32,.62,.92)):
        cyl(f'StatusLED_{i}',(x,.48,-.13),.035,.018,GREEN_GLOW if i<4 else AMBER_GLOW,verts=16)
    export('status_board_v3.glb')


def build_access():
    clear_scene()
    cube('AccessBack',(0,.60,0),(.38,.60,.10),DARK,edge=.06)
    cube('AccessScreen',(0,.82,-.115),(.26,.15,.018),GLASS,edge=.02)
    text_obj('AccessText','SURFACE',(0,.82,-.14),.075,GREEN_GLOW,rotation=(0,math.pi,0),extrude=.002)
    for r in range(4):
        for c in range(3):
            x=-.15+c*.15; y=.36+r*.13
            cyl(f'AccessKey_{r}_{c}',(x,y,-.13),.037,.022,BRUSHED,verts=16)
    cube('CardSlot',(0,.17,-.13),(.18,.035,.018),AMBER_GLOW,edge=.008)
    cube('EmergencyCover',(0,1.18,-.12),(.27,.11,.025),RED,edge=.02)
    export('access_control_v3.glb')


def build_camera():
    clear_scene()
    cube('CameraBracket',(0,.20,.24),(.10,.22,.10),DARK,edge=.035)
    between('CameraArm',(0,.22,.12),(0,.40,-.18),.055,BRUSHED,18)
    cube('CameraBody',(0,.48,-.48),(.22,.16,.38),DARK,rotation=(-.10,0,0),edge=.07)
    cyl('CameraLens',(0,.48,-.88),.11,.08,BRUSHED,verts=36)
    cyl('CameraGlass',(0,.48,-.93),.075,.012,GLASS,verts=36)
    cyl('CameraLED',(.14,.56,-.89),.018,.015,RED_GLOW,verts=14)
    cube('CameraSunshade',(0,.67,-.54),(.28,.035,.46),DARK,rotation=(-.08,0,0),edge=.03)
    export('wall_camera_v3.glb')


def build_exterior_ground():
    clear_scene()
    cube('ExteriorSoil',(0,-.32,0),(28,.30,32),mat('Soil',(.075,.085,.065),0,.98),edge=.10)
    cube('Apron',(0,.01,-3),(10,.06,17),mat('Asphalt',(.08,.085,.08),0,.95),edge=.05)
    # cracked concrete slabs
    for i in range(-4,5):
        for j in range(-5,6):
            x=i*2.0+(j%2)*.12; z=j*2.3-2
            cube(f'ExteriorSlab_{i}_{j}',(x,.09,z),(.93,.055,1.05),CONCRETE,rotation=(0,(i+j)*.006,0),edge=.025)
    export('exterior_ground_v3.glb')


def build_entrance():
    clear_scene()
    cube('SurfaceBunker',(0,1.65,0),(5.0,1.65,3.4),CONCRETE,edge=.16)
    cube('EntranceCut',(0,1.48,-3.42),(2.35,1.42,.20),DARK,edge=.10)
    cube('EntranceLintel',(0,3.20,-3.70),(2.85,.28,.55),DARK,edge=.08)
    for x in (-2.45,2.45):
        cube('EntrancePier'+str(x),(x,1.48,-3.66),(.34,1.48,.48),DARK,edge=.08)
    for i in range(5):
        cube(f'EntranceStep_{i}',(0,.10+i*.11,-4.15-i*.25),(2.35,.10,1.00-i*.12),CONCRETE,edge=.035)
    text_obj('SurfaceLabel','SHELTER 47',(0,3.34,-4.02),.28,YELLOW,rotation=(0,math.pi,0),extrude=.006)
    # roof vents
    for x in (-2.8,2.8):
        cyl('RoofVent'+str(x),(x,3.85,.60),.32,.78,DARK,verts=28)
        torus('RoofVentCap'+str(x),(x,4.26,.60),.38,.08,BRUSHED,rotation=(math.pi/2,0,0))
    export('exterior_entrance_v3.glb')


def build_fence():
    clear_scene()
    # one 4m modular section with frame + diamond wire
    for x in (-2,2):
        cyl('FencePost'+str(x),(x,1.35,0),.075,2.70,STEEL,verts=18)
    between('FenceTop',(-2,2.62,0),(2,2.62,0),.035,STEEL,12)
    between('FenceBottom',(-2,.18,0),(2,.18,0),.035,STEEL,12)
    for i in range(-12,13):
        x=i*.17
        between('WireA'+str(i),(max(-2,x-1.0),.20,0),(min(2,x+1.0),2.60,0),.007,BRUSHED,6)
        between('WireB'+str(i),(max(-2,x-1.0),2.60,0),(min(2,x+1.0),.20,0),.007,BRUSHED,6)
    for x in (-2,2):
        between('BarbStem'+str(x),(x,2.68,0),(x,3.05,-.12),.025,STEEL,10)
    for k,z in enumerate((-.18,0,.18)):
        between('BarbWire'+str(k),(-2,3.02,z),(2,3.02,z),.008,STEEL,8)
    export('perimeter_fence_v3.glb')


def build_gate():
    clear_scene()
    for side in (-1,1):
        x=side*2.3
        cyl('GatePost'+str(side),(x,1.50,0),.12,3.0,DARK,verts=22)
    for side in (-1,1):
        cx=side*1.15
        cube('GateFrame'+str(side),(cx,1.38,0),(1.08,1.23,.055),STEEL,edge=.035)
        for i in range(9):
            x=cx-0.88+i*.22
            between(f'GateWire_{side}_{i}',(x,.24,-.06),(x,2.52,-.06),.008,BRUSHED,6)
        for j in range(7):
            y=.36+j*.32
            between(f'GateHoriz_{side}_{j}',(cx-1.0,y,-.06),(cx+1.0,y,-.06),.008,BRUSHED,6)
    cube('GateMotor',(2.75,.52,.25),(.38,.52,.35),GREEN,edge=.07)
    cyl('GateBeacon',(2.75,1.18,.25),.08,.16,RED_GLOW,verts=24)
    export('perimeter_gate.glb')


def build_floodlight():
    clear_scene()
    cyl('FloodMast',(0,2.3,0),.075,4.6,DARK,verts=20)
    cube('FloodCrossbar',(0,4.58,0),(.70,.055,.055),BRUSHED,edge=.015)
    for x in (-.48,.48):
        cube('FloodHousing'+str(x),(x,4.45,-.16),(.30,.22,.13),DARK,rotation=(-.18,0,0),edge=.055)
        cube('FloodLens'+str(x),(x,4.42,-.305),(.24,.16,.018),WHITE,rotation=(-.18,0,0),edge=.025)
    cube('FloodJunction',(0,1.0,.08),(.22,.30,.16),GREEN,edge=.045)
    export('floodlight.glb')


def build_tree():
    clear_scene()
    bark=mat('DeadBark',(.095,.055,.028),0,.96)
    cyl('TreeTrunk',(0,2.1,0),.28,4.2,bark,verts=14,edge=.015)
    branches=[((0,3.3,0),(-1.5,4.5,.2)),((0,3.55,0),(1.35,4.8,-.15)),((-.75,4.05,.1),(-1.6,5.1,.35)),((.65,4.05,-.08),(1.65,5.35,-.45)),((0,4.0,0),(.2,5.8,.4))]
    for i,(a,b) in enumerate(branches): between('DeadBranch'+str(i),a,b,.10 if i<2 else .065,bark,10)
    export('dead_tree.glb')


def build_barrier():
    clear_scene()
    cube('BarrierBase',(0,.46,0),(1.45,.46,.52),CONCRETE,edge=.10)
    cube('BarrierTop',(0,.93,0),(1.20,.13,.42),CONCRETE,edge=.08)
    for i,x in enumerate((-.88,-.44,0,.44,.88)):
        cube('BarrierStripe'+str(i),(x,.60,-.535),(.18,.20,.018),YELLOW if i%2==0 else DARK,rotation=(0,0,-.18),edge=.004)
    for x in (-1.15,1.15):
        cyl('Rebar'+str(x),(x,1.18,.10),.025,.60,STEEL,verts=10)
    export('concrete_barrier_v3.glb')


def build_rubble():
    clear_scene()
    for i,(x,z,s,r) in enumerate(((-.8,0,.55,.18),(-.2,.4,.34,-.22),(.45,-.2,.46,.31),(.9,.32,.28,-.12),(.15,-.65,.22,.42))):
        cube('Rubble_'+str(i),(x,s*.35,z),(s,s*.35,s*.65),CONCRETE,rotation=(r,r*.4,r*.2),edge=.025)
    for i in range(5):
        between('RubbleRebar'+str(i),(-.9+i*.38,.15,-.25),(-.55+i*.30,.65,.55),.018,STEEL,10)
    export('rubble_cluster_v3.glb')


for fn in (
    build_environment, build_ventilation, build_electrical, build_lockers,
    build_bench, build_clutter, build_status, build_access, build_camera,
    build_exterior_ground, build_entrance, build_fence, build_gate,
    build_floodlight, build_tree, build_barrier, build_rubble
):
    fn()

print('Lost Signal Blender environment V3 complete.')

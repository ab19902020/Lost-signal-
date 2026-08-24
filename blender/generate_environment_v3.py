import bpy
import bmesh
import math
import os
import random
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


def loft(name, sections, material, axis='y', sides=10, subdiv=1):
    """Bridge a stack of elliptical cross-sections into one smooth surface."""
    bm = bmesh.new()
    loops = []
    for (cx, cy, cz), ha, hb in sections:
        loop = []
        for i in range(sides):
            t = i * math.tau / sides
            a, b = math.cos(t) * ha, math.sin(t) * hb
            loop.append(bm.verts.new((cx + a, cy, cz + b) if axis == 'y'
                                     else (cx + a, cy + b, cz)))
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


def join_all(name):
    bpy.ops.object.select_all(action='DESELECT')
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    if not meshes:
        return None
    for o in meshes:
        o.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    bpy.ops.object.join()
    joined = bpy.context.object
    joined.name = name
    return joined


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
# The surface: everything up there has been bleached and dust-blown for years.
TARP = mat('TarpV3',(.30,.28,.24),0,.88)
CANVAS = mat('CanvasV3',(.24,.21,.17),0,.92)
COATCLOTH = mat('SurfaceCoatV3',(.14,.13,.11),0,.90)
BOOTLEATHER = mat('SurfaceBootV3',(.055,.048,.042),0,.86)
DUSTSTONE = mat('DustStoneV3',(.31,.28,.23),0,.94)


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
    """The ground the compound stands on.

    This is Berkshire, years after it happened. The grass came back — it always
    does — so what is underfoot is rough pasture gone to seed, not a car park.
    The eleven-by-nine grid of concrete slabs that used to cover the middle read
    as a field of black panels at night and had no business being there: the
    hard standing is now a single worn apron in front of the shelter door and a
    track running up to the gate, with grass either side of it.
    """
    clear_scene()
    grass = mat('MeadowGrass', (.105, .152, .078), 0, .96)
    grass_dry = mat('DryGrass', (.185, .188, .112), 0, .97)
    grass_dark = mat('RankGrass', (.072, .108, .058), 0, .96)
    soil = mat('BareEarth', (.128, .116, .098), 0, .98)
    asphalt = mat('WornAsphalt', (.115, .118, .116), 0, .93)

    # The field, and a wider skirt of it behind the fence so the ground runs
    # out past the wire instead of ending two metres beyond it.
    cube('ExteriorGrass', (0, -.30, 0), (30, .30, 34), grass, edge=.10)
    # The skirt has to reach the town now, because there is a road running out
    # to it. One quad: at this range the fog and the haze do the work, and the
    # alternative is a horizon that stops five hundred metres short of where
    # the player can see.
    cube('ExteriorSkirt', (0, -.38, 0), (460, .30, 560), grass, edge=.20)
    # Field boundaries out along the road, so the far country is not one flat
    # green. Berkshire is hedged fields, not prairie.
    random.seed(23)
    for i in range(26):
        fx = random.uniform(-380, 300)
        fz = random.uniform(-260, 500)
        if abs(fx) < 34 and abs(fz) < 34:
            continue
        cube(f'FarField_{i}', (fx, -.012, fz),
             (random.uniform(28, 74), .018, random.uniform(28, 74)),
             grass_dry if i % 2 else grass_dark,
             rotation=(0, random.uniform(0, 3.1), 0), edge=1.2)

    # Patchwork: rough pasture is never one tone. Big soft overlapping mats of
    # dry, rank and bare ground, all a couple of centimetres proud of the field.
    patches = [
        (-19, -22, 9.0, 7.0, grass_dry), (14, -17, 8.0, 9.5, grass_dark),
        (-22, 5, 7.5, 11.0, grass_dark), (17, 12, 9.5, 7.0, grass_dry),
        (-7, -27, 11.0, 5.5, grass_dry), (8, 24, 8.5, 6.0, grass_dark),
        (-26, -6, 8.0, 8.0, grass_dry), (24, 2, 7.0, 9.0, grass_dark),
        (-12, 20, 6.5, 6.0, grass_dry), (20, -27, 8.0, 6.0, grass_dry),
        (-40, -30, 22.0, 18.0, grass_dark), (44, -12, 20.0, 22.0, grass_dry),
        (-46, 18, 20.0, 20.0, grass_dry), (38, 30, 24.0, 18.0, grass_dark),
    ]
    for index, (x, z, sx, sz, material) in enumerate(patches):
        cube(f'GrassPatch_{index}', (x, -.005, z), (sx, .020, sz), material,
             rotation=(0, index * .27, 0), edge=.60)

    # Worn earth only where boots and wheels have actually killed the grass: a
    # single track from the gate to the shelter door, and the turning circle in
    # front of it. Anything wider than that and the compound stops being a field
    # with a shelter in it and goes back to being a car park.
    cube('GateTrack', (0, .006, 3.0), (3.1, .024, 15.0), soil, edge=.45)
    cube('DoorEarth', (0, .008, -12.2), (4.2, .026, 3.4), soil, edge=.42)
    cube('TruckStand', (8.6, .004, 13.4), (3.6, .020, 3.2), soil, rotation=(0, .18, 0), edge=.45)
    cube('TruckStand2', (-8.6, .004, 13.4), (3.6, .020, 3.2), soil, rotation=(0, -.14, 0), edge=.45)
    # ...and the stores yard along the north wall, where the containers sit.
    cube('StoresYard', (-4.0, .004, -22.6), (16.0, .020, 3.6), soil, edge=.50)

    # The hard standing that is left: one apron slab at the door, and the
    # track's asphalt where it comes through the gate.
    cube('Apron', (0, .05, -11.4), (4.6, .05, 3.6), asphalt, edge=.06)
    cube('GateApron', (0, .045, 16.4), (2.9, .045, 3.4), asphalt, edge=.06)
    for i in range(-2, 3):
        cube(f'ApronSlab_{i}', (i * 1.75, .105, -11.4), (.82, .05, 3.3), CONCRETE,
             rotation=(0, i * .004, 0), edge=.03)
    export('exterior_ground_v3.glb')


def build_road():
    """A section of the B-road that runs from the gate toward the town.

    One 40 m length, laid end to end by the scene code. Worn tarmac with a
    dashed centre line and edge markings from the generated map, a soft verge
    either side, and a kerb where the camber ends — an unmarked grey ribbon
    across a field reads as a mistake, not a road.
    """
    clear_scene()
    tarmac = image_pbr('RoadTarmac', 'road__Color.jpg',
                       'concrete__Concrete034_1K_NormalGL.jpg',
                       'concrete__Concrete034_1K_Roughness.jpg')
    verge = mat('RoadVerge', (.128, .116, .086), 0, .98)
    kerb = mat('RoadKerb', (.212, .208, .196), 0, .92)

    length = 20.0                       # half length: a 40 m section
    cube('Road_Surface', (0, .045, 0), (3.4, .045, length), tarmac, edge=.04)
    # A little camber, so the surface is not a perfectly flat plane.
    cube('Road_Crown', (0, .075, 0), (2.1, .022, length), tarmac, edge=.06)
    for side in (-1, 1):
        cube(f'Road_Kerb_{side}', (side * 3.56, .085, 0), (.18, .085, length), kerb, edge=.03)
        cube(f'Road_Verge_{side}', (side * 5.1, .02, 0), (1.4, .022, length), verge, edge=.35)
        # Marker posts every eight metres, as a rural B-road has.
        for i in range(-2, 3):
            cube(f'Road_Post_{side}_{i}', (side * 4.5, .48, i * 8.0), (.055, .48, .045),
                 WHITE, edge=.012)
            cube(f'Road_PostBand_{side}_{i}', (side * 4.5, .78, i * 8.0 - .048),
                 (.05, .09, .008), RED, edge=.004)
    export('road_section_v1.glb')


def build_road_damaged():
    """The same section, cratered and shoved. Nothing has maintained it."""
    clear_scene()
    tarmac = image_pbr('RoadTarmac', 'road__Color.jpg',
                       'concrete__Concrete034_1K_NormalGL.jpg',
                       'concrete__Concrete034_1K_Roughness.jpg')
    rubble = mat('RoadRubble', (.152, .146, .134), 0, .96)
    verge = mat('RoadVerge', (.128, .116, .086), 0, .98)
    kerb = mat('RoadKerb', (.212, .208, .196), 0, .92)

    length = 20.0
    cube('Road_Surface', (0, .045, 0), (3.4, .045, length), tarmac, edge=.04)
    for side in (-1, 1):
        cube(f'Road_Kerb_{side}', (side * 3.56, .085, 0), (.18, .085, length), kerb, edge=.03)
        cube(f'Road_Verge_{side}', (side * 5.1, .02, 0), (1.4, .022, length), verge, edge=.35)
    # A crater through one carriageway, with the spoil thrown out around it.
    cyl('Road_Crater', (-1.1, .01, -4.0), 2.3, .10, rubble, verts=18, edge=.06)
    for i in range(9):
        a = i * 0.7
        cube(f'Road_Spoil_{i}', (-1.1 + math.cos(a) * 2.7, .10, -4.0 + math.sin(a) * 2.7),
             (.34, .10, .28), rubble, rotation=(0, a, 0), edge=.05)
    # Slabs of the surface lifted and tipped.
    for i, (x, z, r) in enumerate(((1.9, 3.2, .34), (2.6, 6.4, -.5), (-2.4, 9.1, .22))):
        cube(f'Road_Slab_{i}', (x, .16, z), (1.05, .06, .85), tarmac,
             rotation=(r * .5, r, 0), edge=.04)
    export('road_section_damaged_v1.glb')


def build_wreck_car():
    """A burnt-out estate, the shape of the one at the gate.

    Every road out of anywhere has these on it. No glass, no wheels worth the
    name, the shell gone to oxide and the roof caved.
    """
    clear_scene()
    burnt = mat('WreckShell', (.062, .052, .046), .18, .88)
    rust = mat('WreckRust', (.128, .062, .032), .12, .94)
    ash = mat('WreckAsh', (.040, .038, .036), 0, .96)

    cube('Wreck_Body', (0, .68, 0), (.84, .30, 2.16), rust, edge=.10)
    cube('Wreck_Bonnet', (0, .88, -1.50), (.80, .10, .68), burnt,
         rotation=(-.06, 0, .04), edge=.07)
    # The cabin has gone in on itself.
    cube('Wreck_Cabin', (0, 1.12, .16), (.74, .22, 1.16), burnt,
         rotation=(.05, .03, -.06), edge=.09)
    cube('Wreck_Pillar_A', (-.72, 1.16, -.94), (.05, .26, .05), burnt,
         rotation=(-.34, 0, .18), edge=.02)
    cube('Wreck_Pillar_B', (.70, 1.10, -.94), (.05, .20, .05), burnt,
         rotation=(-.5, 0, -.3), edge=.02)
    cube('Wreck_Grille', (0, .80, -2.14), (.68, .14, .07), ash, edge=.03)
    for side in (-1, 1):
        cube(f'Wreck_Door_{side}', (side * .86, .74, .10), (.05, .26, .92), rust,
             rotation=(0, side * .12, 0), edge=.04)
    # Three wheels on the rims, one missing entirely.
    for sx, sz in ((-1, -1), (1, -1), (-1, 1)):
        cyl(f'Wreck_Rim_{sx}_{sz}', (sx * .82, .26, sz * 1.42), .26, .17, ash,
            rotation=(0, 0, math.pi / 2), verts=14, edge=.02)
    cube('Wreck_Axle', (.82, .22, 1.42), (.10, .07, .10), ash, edge=.02)
    # Scorch on the ground under it.
    cube('Wreck_Scorch', (0, .006, .2), (1.5, .008, 2.6), ash, edge=.6)
    join_all('WreckCar')
    export('wreck_car_v1.glb')


def build_debris_field():
    """A scatter of what is left lying about: masonry, twisted steel, ash."""
    clear_scene()
    rubble = mat('DebrisRubble', (.148, .142, .130), 0, .96)
    steel = mat('DebrisSteel', (.108, .098, .086), .40, .84)
    charred = mat('DebrisCharred', (.048, .044, .040), 0, .95)
    random.seed(11)
    for i in range(16):
        a = random.uniform(0, math.tau)
        r = random.uniform(.4, 3.4)
        cube(f'Debris_Block_{i}', (math.cos(a) * r, random.uniform(.06, .22),
             math.sin(a) * r), (random.uniform(.16, .48), random.uniform(.06, .22),
             random.uniform(.14, .40)), rubble if i % 3 else charred,
             rotation=(random.uniform(-.3, .3), a, random.uniform(-.2, .2)), edge=.05)
    for i in range(7):
        a = random.uniform(0, math.tau)
        r = random.uniform(.6, 3.2)
        between(f'Debris_Rebar_{i}', (math.cos(a) * r, .04, math.sin(a) * r),
                (math.cos(a) * r + random.uniform(-1.4, 1.4), random.uniform(.1, .8),
                 math.sin(a) * r + random.uniform(-1.4, 1.4)), .028, steel, 8)
    join_all('DebrisField')
    export('debris_field_v1.glb')


def build_distant_town():
    """The town on the horizon.

    Somewhere to be going. It is deliberately a silhouette and not a place: a
    church tower, a terrace, a mill chimney and a gasholder, read at six hundred
    metres through haze. Building it properly is a different job; this is so the
    player can stand at the gate and see where that job will be.
    """
    clear_scene()
    # Half a kilometre of air between here and there washes a lot of colour out
    # of a building. These are painted for that distance, not for close up:
    # anything darker read as a row of black cut-outs on the horizon.
    stone = mat('TownStone', (.315, .305, .285), 0, .95)
    brick = mat('TownBrick', (.330, .232, .190), 0, .94)
    slate = mat('TownSlate', (.170, .180, .196), 0, .88)
    steel = mat('TownSteel', (.250, .262, .262), .30, .70)

    # The church: a square tower with a stair turret, which is what you pick out
    # of an English skyline first.
    cube('Town_ChurchTower', (0, 13.0, 0), (3.4, 13.0, 3.4), stone, edge=.30)
    cube('Town_ChurchParapet', (0, 26.4, 0), (3.9, .9, 3.9), stone, edge=.20)
    for sx, sz in ((-3.0, -3.0), (3.0, -3.0), (-3.0, 3.0), (3.0, 3.0)):
        cube(f'Town_ChurchPinnacle_{sx:.0f}_{sz:.0f}', (sx, 28.2, sz), (.55, 1.9, .55),
             stone, edge=.12)
    cube('Town_ChurchNave', (0, 5.0, 11.0), (5.0, 5.0, 8.0), stone, edge=.30)
    cube('Town_ChurchRoof', (0, 11.4, 11.0), (5.3, 1.6, 8.2), slate,
         rotation=(0, 0, 0), edge=.25)

    # A terrace of houses running away from it, and a couple of blocks behind.
    for i in range(9):
        h = 4.6 + (i % 3) * .5
        cube(f'Town_Terrace_{i}', (-14.0 - i * 7.0, h, 6.0 + (i % 2) * 3.0),
             (3.4, h, 5.2), brick, edge=.25)
        cube(f'Town_TerraceRoof_{i}', (-14.0 - i * 7.0, h * 2 + 1.4, 6.0 + (i % 2) * 3.0),
             (3.6, 1.4, 5.4), slate, edge=.20)
    for i in range(6):
        h = 6.5 + (i % 4) * 1.8
        cube(f'Town_Block_{i}', (18.0 + i * 9.5, h, -4.0 + (i % 3) * 7.0),
             (4.2, h, 5.0), stone, edge=.30)

    # The mill chimney and the gasholder: the two things that survive.
    cyl('Town_Chimney', (46.0, 18.0, 16.0), 1.5, 36.0, brick, verts=16, edge=.10)
    cyl('Town_ChimneyCap', (46.0, 36.4, 16.0), 1.9, 1.2, stone, verts=16, edge=.08)
    cyl('Town_Gasholder', (-64.0, 8.5, 14.0), 9.0, 17.0, steel, verts=24, edge=.10)
    torus('Town_GasholderRing', (-64.0, 17.2, 14.0), 9.1, .35, steel,
          rotation=(math.pi / 2, 0, 0), major_segments=28)

    # A line of dead poplars along the road in, so the town does not sit on a
    # bare edge.
    for i in range(11):
        cyl(f'Town_Poplar_{i}', (-8.0 + i * 11.0, 5.0, -22.0 - (i % 3) * 2.0),
            .35, 10.0, mat('TownTimber', (.205, .186, .158), 0, .95), verts=8, edge=.04)

    join_all('DistantTown')
    export('distant_town_v1.glb')


def build_estate_car():
    """A period estate car, the kind that was on every Berkshire drive.

    Boxy, three-box-ish, steel wheels, roof rack. Two of them are wrecks in the
    compound and one at the gate still has glass in it: it is what the player
    will eventually drive to the town.
    """
    clear_scene()
    paint = mat('CarPaint', (.118, .132, .126), .25, .55)
    trim = mat('CarTrim', (.035, .038, .038), .30, .60)
    glassy = mat('CarGlass', (.045, .062, .068), .10, .22)
    tyre = mat('CarTyre', (.016, .017, .017), 0, .95)
    rim = mat('CarRim', (.24, .25, .25), .70, .40)
    lamp = mat('CarLamp', (.52, .50, .44), .20, .30)

    # Body: a long boxy shell with a stepped bonnet and a squared-off tail.
    cube('Car_Body', (0, .74, 0), (.84, .34, 2.20), paint, edge=.09)
    cube('Car_Bonnet', (0, .96, -1.52), (.80, .12, .70), paint, edge=.06)
    cube('Car_Cabin', (0, 1.28, .12), (.78, .32, 1.24), paint, edge=.08)
    cube('Car_Windscreen', (0, 1.30, -1.06), (.72, .30, .10), glassy,
         rotation=(-.42, 0, 0), edge=.02)
    cube('Car_Backlight', (0, 1.30, 1.32), (.72, .28, .10), glassy,
         rotation=(.38, 0, 0), edge=.02)
    for side in (-1, 1):
        cube(f'Car_SideGlass_{side}', (side * .79, 1.30, .16), (.03, .26, 1.10),
             glassy, edge=.02)
        cube(f'Car_Sill_{side}', (side * .86, .48, 0), (.05, .12, 2.00), trim, edge=.03)
        cube(f'Car_Mirror_{side}', (side * .95, 1.18, -.92), (.11, .06, .05), trim, edge=.02)
    cube('Car_Grille', (0, .86, -2.18), (.72, .16, .08), trim, edge=.02)
    cube('Car_BumperFront', (0, .62, -2.24), (.86, .11, .10), trim, edge=.03)
    cube('Car_BumperRear', (0, .62, 2.24), (.86, .11, .10), trim, edge=.03)
    for side in (-1, 1):
        cube(f'Car_Headlamp_{side}', (side * .52, .92, -2.20), (.20, .11, .06), lamp, edge=.02)
        cube(f'Car_Taillamp_{side}', (side * .60, .86, 2.22), (.16, .13, .05),
             mat('CarTail', (.32, .035, .028), .20, .40), edge=.02)
    # Roof rack: nobody in 1990 drove an estate without one.
    for z in (-.55, .55):
        between(f'Car_RackBar_{z:.2f}', (-.70, 1.64, z), (.70, 1.64, z), .028, trim, 10)
    for side in (-1, 1):
        for z in (-.55, .55):
            cube(f'Car_RackFoot_{side}_{z:.2f}', (side * .68, 1.58, z), (.05, .05, .05),
                 trim, edge=.01)
    # Wheels.
    for sx in (-1, 1):
        for sz in (-1, 1):
            x = sx * .84
            z = sz * 1.46
            cyl(f'Car_Tyre_{sx}_{sz}', (x, .34, z), .34, .21, tyre,
                rotation=(0, 0, math.pi / 2), verts=20, edge=.02)
            cyl(f'Car_Rim_{sx}_{sz}', (x + sx * .02, .34, z), .21, .19, rim,
                rotation=(0, 0, math.pi / 2), verts=14, edge=.015)
    join_all('EstateCar')
    export('estate_car_v1.glb')


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


def fence_bay(prefix, lean=0.0, torn=False, missing=False):
    """One 4 m bay of welded security mesh, built the way a real one is.

    Not chain link. This is 358 mesh — the close-mesh welded panel every UK
    military and utility site is fenced with — because it is what actually
    reads at every distance: a sharp rectangular grid of real bars in a real
    frame, rather than a masked texture that thins out to nothing in its lower
    mips, or a thicket of hairline cylinders that renders as scribble.

    `lean` tilts a bay something has shoved, `torn` cuts the mesh short and
    curls the cut ends back, `missing` leaves the frame standing empty.
    """
    tilt = (lean, 0, 0)
    drift = lean * .10

    # Concrete footings and a kerb, which is what stops anything being dug under.
    cube(f'{prefix}Kerb', (0, .09, 0), (2.0, .09, .13), CONCRETE, edge=.02)
    for x in (-2, 2):
        cube(f'{prefix}Footing{x}', (x, .13, 0), (.22, .13, .22), CONCRETE, edge=.03)
        # Square section posts. A round hairline post reads as a stick; 80 mm
        # RHS with a cap reads as a fence post.
        cube(f'{prefix}Post{x}', (x, 1.48, drift * .5), (.055, 1.36, .055),
             STEEL, rotation=tilt, edge=.012)
        cube(f'{prefix}Cap{x}', (x, 2.86, drift), (.075, .022, .075), BRUSHED,
             rotation=tilt, edge=.006)
        # Cleats: the panel bolts to the post through these.
        for y in (.62, 1.48, 2.34):
            cube(f'{prefix}Cleat{x}_{y:.2f}', (x - .06 * (1 if x > 0 else -1), y, drift),
                 (.035, .06, .022), DARK, rotation=tilt, edge=.006)

    if not missing:
        # The panel: a welded frame with a close rectangular mesh in it.
        left = -1.86
        right = .52 if torn else 1.86
        top = 2.62
        bottom = .26
        mid_x = (left + right) / 2
        half_x = (right - left) / 2
        mid_y = (top + bottom) / 2
        half_y = (top - bottom) / 2

        for y in (bottom, top):
            cube(f'{prefix}Frame_{y:.2f}', (mid_x, y, drift), (half_x, .028, .026),
                 STEEL, rotation=tilt, edge=.006)
        for x in (left, right):
            cube(f'{prefix}Stile_{x:.2f}', (x, mid_y, drift), (.028, half_y, .026),
                 STEEL, rotation=tilt, edge=.006)

        # Vertical wires at a close pitch — this is what makes it unclimbable
        # and what makes it read as mesh rather than as bars.
        count = max(2, int((right - left) / .118))
        step = (right - left) / count
        for i in range(1, count):
            x = left + i * step
            cube(f'{prefix}Wire_{i}', (x, mid_y, drift), (.0095, half_y, .0095),
                 BRUSHED, rotation=tilt, edge=.003)
        # Horizontals, welded behind them.
        rows = 8
        for j in range(1, rows):
            y = bottom + (top - bottom) * j / rows
            cube(f'{prefix}Rail_{j}', (mid_x, y, drift - .014), (half_x, .0095, .0095),
                 BRUSHED, rotation=tilt, edge=.003)

        if torn:
            # Where it has been cut, the mesh is peeled back on itself.
            for k in range(6):
                cube(f'{prefix}Peel_{k}', (.62 + k * .05, .62 + k * .18, .16 + k * .05),
                     (.012, .30, .010), BRUSHED,
                     rotation=(.5 + k * .06, .3, .22 + k * .05), edge=.003)

    # Barbed outriggers: three strands on a 45-degree arm, leaning outward.
    for x in (-2, 2):
        between(f'{prefix}Arm{x}', (x, 2.82, drift), (x, 3.22, drift - .40), .024, STEEL, 8)
    for k, (y, z) in enumerate(((2.94, -.12), (3.07, -.24), (3.20, -.37))):
        between(f'{prefix}Barb{k}', (-2, y, z + drift), (2, y, z + drift), .010, BRUSHED, 8)
        for i in range(9):
            bx = -1.78 + i * .445
            cube(f'{prefix}BarbKnot_{k}_{i}', (bx, y, z + drift), (.013, .034, .034),
                 BRUSHED, rotation=(0, 0, .8), edge=.004)


def build_fence():
    clear_scene()
    fence_bay('Fence_')
    join_all('PerimeterFence')
    export('perimeter_fence_v3.glb')


def build_fence_signed():
    """A bay carrying the warning plate. One in five, as a real run does."""
    clear_scene()
    fence_bay('FenceSign_')
    cube('FenceSign_Plate', (0, 1.86, -.06), (.40, .28, .012), YELLOW, edge=.008)
    cube('FenceSign_Band', (0, 2.06, -.075), (.36, .05, .006), DARK, edge=.004)
    text_obj('FenceSign_Text', 'MOD PROPERTY', (0, 1.78, -.078), .062, DARK, extrude=.004)
    join_all('PerimeterFenceSigned')
    export('perimeter_fence_signed_v1.glb')


def build_fence_damaged():
    """The same bay after fifteen years and something heavy going through it."""
    clear_scene()
    fence_bay('FenceTorn_', lean=.12, torn=True)
    join_all('PerimeterFenceTorn')
    export('perimeter_fence_damaged_v1.glb')


def build_fence_down():
    """A bay flattened outward, panel and all: this is how anything gets in."""
    clear_scene()
    for x in (-2, 2):
        cube(f'FenceDown_Footing{x}', (x, .13, 0), (.22, .13, .22), CONCRETE, edge=.03)
        cube(f'FenceDown_Stub{x}', (x, .22, .10), (.055, .26, .055), STEEL,
             rotation=(.9, 0, 0), edge=.012)
    cube('FenceDown_Kerb', (0, .09, 0), (2.0, .09, .13), CONCRETE, edge=.02)
    # The panel lying over, still on its posts, half sunk into the grass.
    for x in (-2, 2):
        cube(f'FenceDown_Post{x}', (x, .32, 1.36), (.055, 1.36, .055), STEEL,
             rotation=(1.36, 0, 0), edge=.012)
    for y in (.26, 2.62):
        cube(f'FenceDown_Frame_{y:.2f}', (0, .30 - (y - 1.44) * .19, 1.44 + (y - 1.44) * .96),
             (1.86, .028, .026), STEEL, rotation=(1.40, 0, 0), edge=.006)
    for i in range(1, 32):
        x = -1.86 + i * (3.72 / 32)
        cube(f'FenceDown_Wire_{i}', (x, .28, 1.44), (.0095, 1.18, .0095), BRUSHED,
             rotation=(1.40, 0, 0), edge=.003)
    for j in range(1, 8):
        offset = (j / 8 - .5) * 2.36
        cube(f'FenceDown_Rail_{j}', (0, .28 - offset * .17, 1.44 + offset * .97),
             (1.86, .0095, .0095), BRUSHED, rotation=(1.40, 0, 0), edge=.003)
    join_all('PerimeterFenceDown')
    export('perimeter_fence_down_v1.glb')


def build_gate():
    """A pair of chain-link leaves in a proper gate frame.

    Built to match the fence it hangs in: concrete-set gate posts with caps, a
    welded tube frame per leaf, the same masked mesh, a top rail carrying the
    barbed run across, and the motor and beacon on the drive side.
    """
    clear_scene()
    for side in (-1, 1):
        x = side * 2.3
        cube(f'GateFooting{side}', (x, .16, 0), (.30, .18, .30), CONCRETE, edge=.04)
        cyl(f'GatePost{side}', (x, 1.72, 0), .095, 3.10, STEEL, verts=18, edge=.012)
        cyl(f'GatePostCap{side}', (x, 3.32, 0), .11, .09, BRUSHED, verts=18)
        # The outriggers carry the barbed run straight over the opening.
        between(f'GateArm{side}', (x, 3.26, 0), (x, 3.62, -.34), .026, STEEL, 8)
    for k, (y, z) in enumerate(((3.34, -.10), (3.47, -.21), (3.60, -.33))):
        between(f'GateBarb{k}', (-2.3, y, z), (2.3, y, z), .009, BRUSHED, 8)

    for side in (-1, 1):
        cx = side * 1.15
        # Welded tube frame: stiles, rails and a diagonal brace, as a real
        # cantilever leaf has.
        for sx in (-1.10, 1.10):
            cyl(f'GateStile_{side}_{sx:.2f}', (cx + sx, 1.38, 0), .042, 2.46,
                STEEL, verts=12, edge=.008)
        for y in (.18, 1.38, 2.58):
            between(f'GateRail_{side}_{y:.2f}', (cx - 1.10, y, 0), (cx + 1.10, y, 0),
                    .038, STEEL, 10)
        between(f'GateBrace_{side}', (cx - 1.06, .24, .03), (cx + 1.06, 2.52, .03),
                .026, STEEL, 8)
        # The same welded mesh as the panels either side of it.
        for i in range(1, 19):
            x = cx - 1.06 + i * (2.12 / 19)
            cube(f'GateWire_{side}_{i}', (x, 1.38, -.05), (.0095, 1.16, .0095),
                 BRUSHED, edge=.003)
        for j in range(1, 8):
            y = .22 + j * (2.32 / 8)
            cube(f'GateMeshRail_{side}_{j}', (cx, y, -.065), (1.06, .0095, .0095),
                 BRUSHED, edge=.003)
        cube(f'GateHazard_{side}', (cx, .42, -.09), (1.02, .16, .015), YELLOW, edge=.006)

    cube('GateMotor', (2.78, .54, .34), (.36, .54, .34), GREEN, edge=.07)
    cube('GateMotorPlate', (2.78, .96, .00), (.30, .12, .04), BRUSHED, edge=.01)
    cyl('GateBeacon', (2.78, 1.22, .34), .08, .16, RED_GLOW, verts=24)
    cube('GateSign', (-2.30, 2.10, -.14), (.46, .30, .015), YELLOW,
         rotation=(0, 0, 0), edge=.008)
    text_obj('GateSignText', 'RESTRICTED', (-2.30, 2.10, -.17), .085, DARK, extrude=.004)
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


def build_range_target():
    """A falling-plate target on a stand.

    The armoury issues twenty-six weapons and the compound had nothing to point
    them at. This is what a shelter's range would actually use: a steel plate on
    a pivot with a painted bull, standing off a welded frame. The plate is its
    own object so the game can swing it back on a hit and stand it up again.
    """
    clear_scene()
    # Frame: two feet, two uprights, a cross member the plate hangs from.
    for x in (-.46, .46):
        cube(f'Target_Foot_{x:.2f}', (x, .06, 0), (.10, .06, .40), DARK, edge=.02)
        cube(f'Target_Post_{x:.2f}', (x, .72, 0), (.055, .66, .055), STEEL, edge=.015)
        between(f'Target_Brace_{x:.2f}', (x, .12, -.34), (x, .70, 0), .028, DARK, 10)
    cube('Target_Head', (0, 1.36, 0), (.52, .05, .06), STEEL, edge=.015)
    cube('Target_Plaque', (0, .30, -.07), (.20, .07, .012), YELLOW, edge=.004)

    # The plate. Its own pivot sits on the cross member, so the game only has to
    # rotate this object about X to knock it down.
    cube('Target_Plate', (0, -.34, 0), (.34, .34, .022), BRUSHED, edge=.012)
    cube('Target_Ring', (0, -.34, -.026), (.24, .24, .006), DARK, edge=.006)
    cube('Target_Bull', (0, -.34, -.034), (.09, .09, .006), RED, edge=.004)
    cyl('Target_Pivot', (0, 0, 0), .035, .74, DARK, rotation=(0, math.pi / 2, 0), verts=12)
    for name in ('Target_Plate', 'Target_Ring', 'Target_Bull', 'Target_Pivot'):
        bpy.data.objects[name].location.y += 1.36
    # Parent the face to the pivot so one rotation takes the whole plate.
    pivot = bpy.data.objects['Target_Pivot']
    for name in ('Target_Plate', 'Target_Ring', 'Target_Bull'):
        child = bpy.data.objects[name]
        child.parent = pivot
        child.matrix_parent_inverse = pivot.matrix_world.inverted()
    export('range_target_v1.glb')


def build_remains_covered():
    """Someone the survivors covered over and weighted down.

    Deliberately not graphic: a shape under a tarpaulin, stones on the hem to
    stop it blowing away, and one boot at the foot end. You know exactly what it
    is and you never see any of it.
    """
    clear_scene()
    # The form under the sheet, and the sheet over it a little larger.
    form = [
        ((0, .02, -.88), .16, .10),
        ((0, .05, -.70), .21, .17),
        ((0, .04, -.42), .17, .14),
        ((0, .05, -.10), .20, .16),
        ((0, .06, .26), .26, .20),
        ((0, .05, .56), .23, .18),
        ((0, .03, .80), .15, .12),
    ]
    loft('Remains_Form', form, CANVAS, axis='y', sides=10)
    loft('Remains_Tarp', [(c, a + .045, b + .05) for c, a, b in form], TARP,
         axis='y', sides=12)
    # Folds where the sheet is pulled over the shoulder and the hip.
    for i, z in enumerate((-.52, .04, .44)):
        cube(f'Remains_Fold_{i}', (0, .07, z), (.26, .022, .045), TARP,
             rotation=(0, .06 * (i - 1), 0), edge=.02)
    # Stones holding the hem down.
    for i, (x, z) in enumerate(((-.30, -.66), (.31, -.30), (-.32, .18), (.30, .58), (0, .92))):
        loft(f'Remains_Stone_{i}', [
            ((x, .0, z), .09, .075),
            ((x, .07, z), .10, .085),
            ((x, .13, z), .055, .045),
        ], DUSTSTONE, axis='y', sides=8)
    # A boot, out from under the foot end.
    loft('Remains_Boot', [
        ((.06, .02, .84), .075, .10),
        ((.06, .09, .90), .080, .12),
        ((.06, .14, .96), .062, .075),
    ], BOOTLEATHER, axis='y', sides=8)
    join_all('RemainsCovered')
    export('remains_covered_v1.glb')


def build_remains_slumped():
    """Someone who sat down against a wall and did not get up.

    Fully clothed, hood up, head bowed — a shape in a coat. Facing +Z, back
    against whatever it is placed in front of.
    """
    clear_scene()
    # Legs out in front, knees a little bent.
    for side in (-1, 1):
        loft(f'Slumped_Leg_{side}', [
            ((side * .13, .20, .06), .11, .13),
            ((side * .14, .17, .34), .10, .12),
            ((side * .15, .12, .62), .085, .10),
            ((side * .15, .09, .82), .075, .085),
        ], COATCLOTH, axis='y', sides=8)
        loft(f'Slumped_Boot_{side}', [
            ((side * .15, .04, .84), .078, .085),
            ((side * .15, .11, .92), .082, .105),
            ((side * .15, .16, .99), .060, .070),
        ], BOOTLEATHER, axis='y', sides=8)
    # Torso, leaning back into the wall.
    loft('Slumped_Torso', [
        ((0, .14, -.06), .22, .17),
        ((0, .38, -.10), .24, .18),
        ((0, .62, -.13), .26, .18),
        ((0, .82, -.15), .23, .16),
        ((0, .94, -.14), .15, .13),
    ], COATCLOTH, axis='y', sides=10)
    # Arms fallen into the lap.
    for side in (-1, 1):
        loft(f'Slumped_Arm_{side}', [
            ((side * .25, .82, -.12), .075, .075),
            ((side * .27, .58, -.02), .065, .065),
            ((side * .24, .36, .14), .058, .058),
            ((side * .18, .24, .26), .055, .060),
        ], COATCLOTH, axis='y', sides=8)
    loft('Slumped_Hands', [
        ((0, .22, .26), .12, .085),
        ((0, .29, .28), .13, .090),
        ((0, .34, .28), .09, .065),
    ], BOOTLEATHER, axis='y', sides=8)
    # Head bowed, hood up: the hood is what you see.
    loft('Slumped_Hood', [
        ((0, .88, -.10), .14, .14),
        ((0, .98, -.04), .17, .18),
        ((0, 1.06, .02), .16, .17),
        ((0, 1.12, .06), .10, .11),
    ], COATCLOTH, axis='y', sides=10)
    cube('Slumped_HoodBrim', (0, .96, .13), (.13, .055, .04), COATCLOTH,
         rotation=(.5, 0, 0), edge=.03)
    # Dust drifted against the low side.
    for i, (x, z) in enumerate(((-.34, .28), (.36, .52), (-.30, .74))):
        loft(f'Slumped_Dust_{i}', [
            ((x, .0, z), .17, .13),
            ((x, .05, z), .13, .10),
            ((x, .08, z), .05, .04),
        ], DUSTSTONE, axis='y', sides=8)
    join_all('RemainsSlumped')
    export('remains_slumped_v1.glb')


for fn in (
    build_environment, build_ventilation, build_electrical, build_lockers,
    build_bench, build_clutter, build_status, build_access, build_camera,
    build_exterior_ground, build_entrance, build_fence, build_gate,
    build_floodlight, build_tree, build_barrier, build_rubble,
    build_fence_signed, build_fence_damaged, build_fence_down,
    build_road, build_road_damaged, build_wreck_car, build_debris_field,
    build_range_target, build_distant_town, build_estate_car,
    build_remains_covered, build_remains_slumped
):
    fn()

print('Lost Signal Blender environment V3 complete.')

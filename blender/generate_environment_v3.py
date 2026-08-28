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


# --- Deterministic noise ----------------------------------------------------
# The ground's tone, and where things grow on it, both come from the same
# lattice noise. It has to be deterministic: the scatter in the scene code has
# to agree with the colour baked into the mesh, and both have to be the same
# every time the world is generated.

def _hash2(ix, iz, seed):
    h = (ix * 374761393 + iz * 668265263 + seed * 2246822519) & 0xFFFFFFFF
    h = ((h ^ (h >> 13)) * 1274126177) & 0xFFFFFFFF
    return ((h ^ (h >> 16)) & 0xFFFFFF) / 0xFFFFFF


def value_noise(x, z, scale, seed):
    fx, fz = x / scale, z / scale
    ix, iz = math.floor(fx), math.floor(fz)
    tx, tz = fx - ix, fz - iz
    sx = tx * tx * (3 - 2 * tx)
    sz = tz * tz * (3 - 2 * tz)
    a = _hash2(ix, iz, seed)
    b = _hash2(ix + 1, iz, seed)
    c = _hash2(ix, iz + 1, seed)
    d = _hash2(ix + 1, iz + 1, seed)
    return (a * (1 - sx) + b * sx) * (1 - sz) + (c * (1 - sx) + d * sx) * sz


def fbm(x, z, scale, seed, octaves=4):
    total = 0.0
    amplitude = 1.0
    norm = 0.0
    for o in range(octaves):
        total += value_noise(x, z, scale / (2 ** o), seed + o * 17) * amplitude
        norm += amplitude
        amplitude *= 0.5
    return total / norm


def plan_uv(o, across, along):
    """Plan-view UVs, in metres, for a surface that is read from above.

    A box unwrap gives every face its own 0..1 island whatever its size, and the
    runtime's retiler can only guess one repeat for both axes — between them
    they turned a two-lane road's marking tile into eight lanes of it fanning
    across the carriageway. A road knows its own width, so it maps itself.
    """
    me = o.data
    uv = me.uv_layers.active or me.uv_layers.new()
    for loop in me.loops:
        co = me.vertices[loop.vertex_index].co
        uv.data[loop.index].uv = (co.x / across + .5, co.z / along)
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


def post(name, loc, radius, height, material, verts=32, edge=.012):
    """A cylinder that stands up.

    Blender's cylinder primitive is authored along its own Z. These scripts
    author the world Y-up, so an unrotated cylinder lies on its side — which is
    how the floodlight masts, the gate posts, the dead trees and the town's
    chimney all ended up flat on the ground. Anything vertical goes through
    here; `cyl` stays for the discs and lenses that really do face down Z.
    """
    return cyl(name, loc, radius, height, material,
               rotation=(math.pi / 2, 0, 0), verts=verts, edge=edge)


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


def shade_smooth(o):
    # Foliage only. Each leaf block is a disconnected cube, so smoothing
    # averages its own eight normals and rounds it off — which is the whole
    # difference between a hedge and a pile of boxes.
    if o is None:
        return o
    for polygon in o.data.polygons:
        polygon.use_smooth = True
    return o


def export(name):
    path = os.path.join(OUT, name)
    add_orientation_marker()
    bpy.ops.object.select_all(action='SELECT')
    # export_keep_originals references the shared JPEGs in ../textures instead of
    # baking a private copy of every one into each GLB. The same six 1K maps were
    # embedded five times over, which was 10 MB of the asset payload and five
    # separate GPU uploads of identical images.
    options = dict(filepath=path, export_format='GLB', use_selection=True,
                   export_apply=True, export_yup=False,
                   export_keep_originals=True)
    # The ground carries its tone in a colour attribute rather than in a
    # separate polygon per shade. The exporter's default only writes one out if
    # a material samples it, and a glTF material cannot; ACTIVE writes it
    # regardless, and the runtime multiplies the base colour by it, which is
    # exactly what the glTF spec says COLOR_0 is for.
    try:
        bpy.ops.export_scene.gltf(**options, export_vertex_color='ACTIVE')
    except TypeError:
        bpy.ops.export_scene.gltf(**options)
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
        post('ElecConduit'+str(x),(x,3.10,.10),.034,2.2,BRUSHED,verts=18)
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
        post(f'GasBottle_{i}',(x,.52,.10),.16,.88,BLUE if i else GREEN,verts=28,edge=.025)
        torus(f'GasShoulder_{i}',(x,.95,.10),.13,.03,BRUSHED,rotation=(math.pi/2,0,0))
        post(f'GasValve_{i}',(x,1.08,.10),.045,.15,BRUSHED,verts=16)
    # med box
    cube('MedCase',(-.05,.25,-.55),(.38,.24,.20),WHITE,edge=.055)
    cube('MedCrossV',(-.05,.25,-.765),(.055,.14,.012),RED,edge=.008)
    cube('MedCrossH',(-.05,.25,-.765),(.14,.055,.012),RED,edge=.008)
    # extinguisher
    post('ExtinguisherBody',(1.72,.48,-.55),.15,.72,RED,verts=30,edge=.025)
    post('ExtinguisherNeck',(1.72,.89,-.55),.06,.13,DARK,verts=18)
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

    One mesh, not a stack of them. It used to be a skirt, a field, twenty-six
    big rotated rectangles of "far field" and fourteen "grass patches", each a
    flat colour with a hard edge, all within a few centimetres of each other:
    from any height it read as a jigsaw, and at range the layers fought in the
    depth buffer. There is now a single graded grid — six-metre cells where the
    player walks, opening out to a hundred and sixty at the horizon — carrying
    its tone in vertex colours off the same noise the scatter uses. Nothing has
    an edge because nothing is a separate polygon.
    """
    clear_scene()
    def ground(name, tile):
        return image_pbr(name, f'{tile}__Color.jpg',
                         'concrete__Concrete034_1K_NormalGL.jpg',
                         'concrete__Concrete034_1K_Roughness.jpg')
    grass = ground('MeadowGrass', 'grass_meadow')
    soil = ground('BareEarth', 'earth')
    asphalt = mat('WornAsphalt', (.115, .118, .116), 0, .93)

    # Vertex tints applied to the one pasture texture. Meadow is the ground
    # state; dry is where it burned off; rank is the wet hollows and the shade.
    MEADOW = (1.00, 1.00, 0.94)
    DRY = (1.00, 0.88, 0.46)
    RANK = (0.56, 0.78, 0.54)
    POOR = (0.86, 0.76, 0.58)

    def tone(x, z):
        # Two independent fields: how dry it is, and how rank. Neither is a
        # boundary, so neither can draw one.
        dry = fbm(x, z, 78.0, 4181)
        rank = fbm(x + 2200, z - 1700, 54.0, 9137)
        # A slow, very large wash on top so the country reads as having
        # somewhere lower and wetter in it rather than as even scatter.
        wash = fbm(x - 900, z + 1300, 260.0, 517, octaves=3)
        # A third field for the thin ground over chalk, which is most of the
        # downs and is what stops two tones reading as two tones.
        poor = fbm(x - 4100, z + 3300, 132.0, 2749, octaves=3)
        dry = min(1.0, max(0.0, (dry - 0.40) * 3.1 + (wash - 0.5) * 0.9))
        rank = min(1.0, max(0.0, (rank - 0.50) * 3.2 - (wash - 0.5) * 1.0))
        poor = min(1.0, max(0.0, (poor - 0.56) * 2.8))
        colour = []
        for i in range(3):
            c = MEADOW[i] * (1 - dry) + DRY[i] * dry
            c = c * (1 - rank) + RANK[i] * rank
            c = c * (1 - poor * 0.7) + POOR[i] * poor * 0.7
            # Fine break-up, so even one tone is never perfectly even.
            c *= 0.94 + fbm(x + i * 700, z - i * 400, 11.0, 733 + i) * 0.12
            colour.append(min(1.0, max(0.0, c)))
        return (colour[0], colour[1], colour[2], 1.0)

    # A graded axis: six-metre cells across the compound and everywhere the
    # player can drive, opening out toward the horizon where a vertex buys
    # nothing.
    def graded_axis(core=198.0, step=6.0, reach=1500.0, growth=1.34):
        inner = []
        n = int(core / step)
        for i in range(-n, n + 1):
            inner.append(i * step)
        out = []
        position = core
        span = step
        while position < reach:
            span *= growth
            position += span
            out.append(min(position, reach))
        return [-v for v in reversed(out)] + inner + out

    axis = graded_axis()
    bm = bmesh.new()
    colour_layer = bm.loops.layers.color.new('Col')
    uv_layer = bm.loops.layers.uv.new()
    grid = [[bm.verts.new((x, 0.0, z)) for z in axis] for x in axis]
    bm.verts.index_update()
    for i in range(len(axis) - 1):
        for j in range(len(axis) - 1):
            face = bm.faces.new((grid[i][j], grid[i + 1][j],
                                 grid[i + 1][j + 1], grid[i][j + 1]))
            face.smooth = False
            for loop in face.loops:
                co = loop.vert.co
                # World-scale UVs in metres, so the texel density is the same
                # in the compound and half a kilometre out.
                loop[uv_layer].uv = (co.x / 2.2, co.z / 2.2)
                loop[colour_layer] = tone(co.x, co.z)
    me = bpy.data.meshes.new('ExteriorFieldMesh')
    bm.to_mesh(me)
    bm.free()
    # bmesh writes the attribute but leaves it neither active nor the render
    # colour, and the exporter only writes out the render one — which is why
    # the first attempt at this shipped a ground with no COLOR_0 on it at all.
    me.color_attributes.active_color_name = 'Col'
    me.color_attributes.default_color_name = 'Col'
    me.materials.append(grass)
    field = bpy.data.objects.new('ExteriorField', me)
    bpy.context.collection.objects.link(field)

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


# --- What actually grows and lies about out there ---------------------------
# Everything below is scattered in the hundreds by the scene code, through one
# instanced draw per mesh, so the polygon budget per asset is the budget times
# a few hundred. Bevels are off on the foliage for that reason: a bevelled cube
# is a hundred and fifty triangles and a bare one is twelve, and at a hedge's
# distance nothing can tell.

HEDGE_LENGTH = 12.0


def build_hedge(blocks=280, stems=11, name='hedgerow_v1.glb'):
    """Twelve metres of overgrown hedgerow.

    Berkshire is not fields, it is the hedges between them — take them out and
    the country reads as a green tablecloth with things standing on it, which
    is exactly what it was doing. Fifteen years unmanaged, so it is leggy and
    half dead: a dense base, bare stems through the top of it, and the wire it
    was planted along still in there somewhere.
    """
    clear_scene()
    leaf = mat('HedgeLeaf', (.052, .076, .038), 0, .96)
    leaf_dry = mat('HedgeLeafDry', (.104, .092, .052), 0, .97)
    leaf_lit = mat('HedgeLeafLit', (.094, .132, .058), 0, .95)
    leaf_deep = mat('HedgeLeafDeep', (.030, .046, .024), 0, .96)
    dead = mat('HedgeDead', (.070, .060, .046), 0, .96)
    timber = mat('HedgeTimber', (.078, .066, .052), 0, .95)
    wire = mat('HedgeWire', (.098, .094, .088), .55, .70)
    earth = mat('HedgeEarth', (.086, .074, .058), 0, .98)

    random.seed(4021)
    half = HEDGE_LENGTH / 2

    # A hedge has to be solid. Fifty loose blocks scattered along a line read as
    # fifty loose blocks; what makes a hedge is a continuous mass you cannot see
    # daylight through, with an irregular top. So: a core you never see, and a
    # hundred and thirty small blocks packed onto it.
    def profile(t):
        # How full the hedge is at -1..1 along its length.
        return .86 + fbm(t * 4.0, 0.0, 1.6, 4021) * .40

    # The bank it grew out of, and the dark core inside the leaf.
    cube('Hedge_Bank', (0, .12, 0), (half, .12, .64), earth, edge=.20)
    cube('Hedge_Core', (0, .92, 0), (half * .99, .70, .34), leaf, edge=.10)

    for i in range(blocks):
        t = random.uniform(-1, 1)
        x = t * half * .99
        fullness = profile(t)
        # Blocks cluster low and thin out toward the top, and the hedge is
        # narrower the higher up it you look.
        lift = random.random() ** 1.45
        y = .22 + lift * 1.72 * fullness
        taper = 1.18 - (y / (2.1 * fullness))
        z = random.gauss(0, .155 * max(.3, taper))
        size = random.uniform(.075, .165) * (.72 + fullness * .5)
        # Four tones: sunlit on the outside of the mass, deep in the middle,
        # dead where it is dying back. One flat green reads as one flat solid.
        outward = min(1.0, (abs(z) / .34) + lift * .5)
        if outward > .72:
            material = leaf_lit if i % 3 else (leaf_dry if i % 7 == 0 else leaf)
        elif outward > .38:
            material = leaf
        else:
            material = leaf_deep
        cube(f'Hedge_Leaf_{i}', (x, y, z),
             (size, size * random.uniform(.72, 1.05), size * random.uniform(.8, 1.25)),
             material,
             rotation=(random.uniform(-1.6, 1.6), random.uniform(0, 3.1),
                       random.uniform(-1.6, 1.6)), edge=0)

    # Leggy stems standing out of the top, which is what an unmanaged hedge
    # looks like from any distance at all.
    for i in range(stems):
        x = random.uniform(-half * .92, half * .92)
        h = random.uniform(2.4, 4.1)
        lean = random.uniform(-.22, .22)
        between(f'Hedge_Stem_{i}', (x, .2, random.gauss(0, .2)),
                (x + lean * h, h, random.gauss(0, .3)), random.uniform(.028, .05),
                timber, 6)
        for b in range(2):
            a = random.uniform(0, math.tau)
            between(f'Hedge_Branch_{i}_{b}',
                    (x + lean * h * .7, h * .68, 0),
                    (x + lean * h * .7 + math.cos(a) * .7, h * .68 + random.uniform(.2, .7),
                     math.sin(a) * .6), .018, dead, 5)

    # The stock fence it was planted along, mostly swallowed.
    for i in range(4):
        x = -half + (i + .5) * (HEDGE_LENGTH / 4)
        cube(f'Hedge_Post_{i}', (x, .48, -.44), (.045, .48, .045), timber,
             rotation=(0, 0, random.uniform(-.06, .06)), edge=0)
    for y in (.36, .62, .86):
        between(f'Hedge_Wire_{y:.2f}', (-half, y, -.44), (half, y, -.44), .009, wire, 4)

    shade_smooth(join_all('Hedgerow'))
    export(name)


def build_hedge_far():
    # Past ninety metres a hedge is a dark mass with a ragged top and nothing
    # else, and there are two hundred of them out there. Same silhouette, same
    # seed, a quarter of the blocks.
    build_hedge(blocks=52, stems=5, name='hedgerow_far_v1.glb')


def build_hedge_gap():
    """A field gate in a hedge: the break every run of hedge has in it."""
    clear_scene()
    timber = mat('GateTimber', (.128, .104, .072), 0, .94)
    rust = mat('GateIron', (.112, .062, .038), .30, .90)
    earth = mat('GapEarth', (.096, .082, .064), 0, .98)
    cube('Gap_Mud', (0, .012, .1), (2.4, .020, 1.5), earth, edge=.55)
    for side in (-1, 1):
        cube(f'Gap_Post_{side}', (side * 2.05, .78, 0), (.09, .78, .09), timber, edge=.02)
    # A five-bar gate, hanging off one hinge as they all end up.
    lean = -.13
    for i, y in enumerate((.30, .56, .82, 1.08, 1.34)):
        cube(f'Gap_Bar_{i}', (-.05, y, .06), (1.92, .045, .035), timber,
             rotation=(0, 0, lean), edge=.012)
    cube('Gap_Stile', (-1.92, .82, .06), (.055, .56, .04), timber,
         rotation=(0, 0, lean), edge=.012)
    cube('Gap_Head', (1.80, .84, .06), (.055, .56, .04), timber,
         rotation=(0, 0, lean), edge=.012)
    between('Gap_Brace', (-1.86, .30, .10), (1.74, 1.32, .10), .034, timber, 6)
    cube('Gap_Hinge', (2.00, 1.26, .04), (.13, .045, .05), rust, edge=.01)
    join_all('HedgeGap')
    export('hedge_gap_v1.glb')


def build_scrub():
    """A bramble clump. What takes a field first when nobody cuts it."""
    clear_scene()
    bramble = mat('ScrubBramble', (.050, .070, .034), 0, .96)
    bramble_dry = mat('ScrubDry', (.070, .062, .036), 0, .97)
    stem = mat('ScrubStem', (.072, .058, .042), 0, .95)
    random.seed(707)
    for i in range(18):
        a = random.uniform(0, math.tau)
        r = random.uniform(0, .78)
        y = random.uniform(.14, .74) * (1 - r * .55)
        size = random.uniform(.18, .38) * (1 - r * .35)
        cube(f'Scrub_Mass_{i}', (math.cos(a) * r, y, math.sin(a) * r),
             (size, size * .75, size),
             bramble_dry if i % 4 == 0 else bramble,
             rotation=(random.uniform(-.5, .5), a, random.uniform(-.5, .5)), edge=0)
    for i in range(5):
        a = random.uniform(0, math.tau)
        between(f'Scrub_Cane_{i}', (0, .12, 0),
                (math.cos(a) * random.uniform(.7, 1.3), random.uniform(.5, 1.05),
                 math.sin(a) * random.uniform(.7, 1.3)), .014, stem, 5)
    shade_smooth(join_all('ScrubClump'))
    export('scrub_v1.glb')


def build_grass_tuft():
    """A clump of seeded grass, knee high.

    Ground texture alone reads as a painted bedsheet the moment you stand on
    it. What sells a field is the few hundred things standing up out of it in
    the first thirty metres, so these are geometry — nine blades, no bevel —
    scattered by the hundred through one instanced draw.
    """
    clear_scene()
    # Lit to sit just above the ground texture's own blades, not below them:
    # the first attempt at this was a drab olive twelve millimetres wide and
    # read as a clump of burnt wire standing in a lawn.
    blade = mat('TuftBlade', (.122, .168, .056), 0, .95)
    blade_dry = mat('TuftBladeDry', (.166, .154, .072), 0, .95)
    seed_head = mat('TuftSeed', (.182, .164, .092), 0, .94)
    random.seed(313)
    for i in range(15):
        a = i * 2.399963 + random.uniform(-.25, .25)   # golden angle: no clumps
        lean = random.uniform(.22, .62)
        h = random.uniform(.22, .52)
        base = (math.cos(a) * .05, 0.0, math.sin(a) * .05)
        tip = (base[0] + math.cos(a) * lean * h, h, base[2] + math.sin(a) * lean * h)
        # A blade is a wide flat strap, not a wire. Wide enough to catch the
        # sun on one side and shade on the other is the whole trick.
        cube(f'Tuft_Blade_{i}',
             ((base[0] + tip[0]) / 2, h * .5, (base[2] + tip[2]) / 2),
             (.017, h * .54, .006),
             blade if i % 3 else blade_dry,
             rotation=(math.sin(a) * lean, a, -math.cos(a) * lean), edge=0)
        if i % 4 == 0:
            cube(f'Tuft_Seed_{i}', tip, (.011, .062, .009), seed_head,
                 rotation=(math.sin(a) * lean, a, -math.cos(a) * lean), edge=0)
    join_all('GrassTuft')
    export('grass_tuft_v1.glb')


def build_fallen_tree():
    """A trunk down across the field, which is where the dead ones end up."""
    clear_scene()
    bark = mat('FallenBark', (.088, .074, .058), 0, .95)
    split = mat('FallenSplit', (.132, .112, .082), 0, .93)
    random.seed(88)
    length = 9.2
    # A trunk tapers. Two lengths of it, the thin end lifted clear of the
    # ground where the branches are holding it up.
    cyl('Fallen_Trunk', (-1.4, .34, 0), .34, length * .55, bark,
        rotation=(0, math.pi / 2, .02), verts=10, edge=.03)
    cyl('Fallen_Trunk_Thin', (3.0, .40, .18), .24, length * .52, bark,
        rotation=(0, math.pi / 2 + .06, -.05), verts=8, edge=.03)
    cube('Fallen_Break', (length / 2 - .3, .46, .22), (.20, .26, .26), split,
         rotation=(.2, .3, .1), edge=.04)
    # The root plate, torn up on end: a disc standing vertically with the soil
    # still in it, which is the thing you actually recognise across a field.
    cyl('Fallen_Plate', (-length / 2 - .1, 1.05, 0), 1.05, .28, bark,
        rotation=(0, math.pi / 2, .22), verts=12, edge=.05)
    for i in range(9):
        a = random.uniform(0, math.tau)
        reach = random.uniform(.8, 1.5)
        between(f'Fallen_Root_{i}', (-length / 2 - .1, 1.05, 0),
                (-length / 2 - random.uniform(.3, .8), 1.05 + math.cos(a) * reach,
                 math.sin(a) * reach), random.uniform(.025, .06), bark, 5)
    for i in range(9):
        t = random.uniform(-.42, .48) * length
        a = random.uniform(0, math.tau)
        tip = (t + random.uniform(-1.5, 1.5), .5 + abs(math.cos(a)) * 1.9,
               math.sin(a) * 2.1)
        between(f'Fallen_Branch_{i}', (t, .5, 0), tip, random.uniform(.025, .075), bark, 5)
        if i % 2 == 0:
            between(f'Fallen_Twig_{i}', tip,
                    (tip[0] + random.uniform(-.9, .9), tip[1] + random.uniform(.1, .8),
                     tip[2] + random.uniform(-.9, .9)), .018, split, 4)
    join_all('FallenTree')
    export('fallen_tree_v1.glb')


def build_spoil_heap():
    """A mound of earth and rubble. Relief, without touching the floor plane.

    The compound's ground has to stay dead flat — every collider and both the
    walking and driving bodies take the floor as zero — so the country gets its
    shape from things standing on it rather than from contours in it.
    """
    clear_scene()
    earth = mat('SpoilEarth', (.070, .058, .044), 0, .98)
    rubble = mat('SpoilRubble', (.098, .092, .082), 0, .96)
    random.seed(1290)
    loft('Spoil_Mound', [
        ((0, .0, 0), 4.6, 3.4),
        ((.3, .55, .2), 3.8, 2.8),
        ((.5, 1.05, .3), 2.7, 2.0),
        ((.6, 1.45, .35), 1.4, 1.0),
        ((.6, 1.62, .35), .3, .25),
    ], earth, axis='y', sides=12)
    for i in range(14):
        a = random.uniform(0, math.tau)
        r = random.uniform(1.2, 4.4)
        cube(f'Spoil_Block_{i}', (math.cos(a) * r, random.uniform(.08, .5),
             math.sin(a) * r * .74),
             (random.uniform(.18, .5), random.uniform(.08, .26), random.uniform(.16, .44)),
             rubble, rotation=(random.uniform(-.3, .3), a, random.uniform(-.3, .3)), edge=.03)
    join_all('SpoilHeap')
    export('spoil_heap_v1.glb')


def build_telegraph_pole():
    """A pole and two crossarms. Vertical marks along a road at half a mile."""
    clear_scene()
    timber = mat('PoleTimber', (.098, .082, .062), 0, .95)
    iron = mat('PoleIron', (.086, .080, .072), .45, .78)
    glassy = mat('PoleInsulator', (.185, .200, .190), .10, .35)
    post('Pole_Mast', (0, 4.1, 0), .13, 8.2, timber, verts=10, edge=.02)
    for i, y in enumerate((7.35, 6.65)):
        cube(f'Pole_Arm_{i}', (0, y, 0), (.92, .045, .055), iron, edge=.015)
        for k in (-1, -.45, .45, 1):
            cube(f'Pole_Insulator_{i}_{k:.2f}', (k * .82, y + .11, 0), (.045, .07, .045),
                 glassy, edge=.012)
    cube('Pole_Step', (0, 2.4, .16), (.20, .022, .022), iron, edge=.006)
    cube('Pole_Plate', (0, 1.7, .14), (.09, .13, .012), iron, edge=.006)
    join_all('TelegraphPole')
    export('telegraph_pole_v1.glb')


def build_farm_wreck():
    """A tractor left where it stopped, and the trailer behind it."""
    clear_scene()
    paint = mat('FarmPaint', (.146, .052, .034), .18, .82)
    rust = mat('FarmRust', (.120, .066, .038), .22, .92)
    tyre = mat('FarmTyre', (.020, .020, .020), 0, .95)
    steel = mat('FarmSteel', (.098, .096, .090), .45, .80)
    glassy = mat('FarmGlass', (.040, .052, .058), .10, .30)

    cube('Farm_Body', (0, .92, 0), (.62, .30, 1.34), paint, edge=.08)
    cube('Farm_Bonnet', (0, 1.12, -1.10), (.48, .26, .78), paint, edge=.07)
    cube('Farm_Cab', (0, 1.72, .48), (.62, .52, .62), rust, edge=.06)
    for side in (-1, 1):
        cube(f'Farm_CabPost_{side}', (side * .58, 1.74, .48), (.04, .52, .58), steel, edge=.02)
        cube(f'Farm_Glass_{side}', (side * .60, 1.76, .48), (.02, .44, .50), glassy, edge=.01)
    cube('Farm_Exhaust', (.34, 1.86, -1.42), (.06, .58, .06), steel, edge=.02)
    # Big rears, small fronts, all flat.
    for side in (-1, 1):
        cyl(f'Farm_RearWheel_{side}', (side * .86, .78, .62), .78, .38, tyre,
            rotation=(0, math.pi / 2, 0), verts=16, edge=.03)
        cyl(f'Farm_RearHub_{side}', (side * .86, .78, .62), .28, .40, rust,
            rotation=(0, math.pi / 2, 0), verts=12, edge=.02)
        cyl(f'Farm_FrontWheel_{side}', (side * .68, .40, -1.32), .40, .24, tyre,
            rotation=(0, math.pi / 2, 0), verts=14, edge=.02)
    # The trailer it was pulling, tipped on its side.
    cube('Farm_TrailerBed', (0, .62, 4.30), (1.06, .10, 1.90), rust,
         rotation=(0, .06, .34), edge=.05)
    for side in (-1, 1):
        cube(f'Farm_TrailerSide_{side}', (side * 1.00, 1.02, 4.30), (.06, .44, 1.88), rust,
             rotation=(0, .06, .34), edge=.04)
    cube('Farm_TrailerEnd', (0, 1.00, 6.14), (1.02, .42, .06), rust,
         rotation=(0, .06, .34), edge=.04)
    between('Farm_Drawbar', (0, .54, 2.42), (0, .70, 3.10), .06, steel, 6)
    for side in (-1, 1):
        cyl(f'Farm_TrailerWheel_{side}', (side * 1.02, .38, 4.60), .38, .22, tyre,
            rotation=(0, math.pi / 2, .34), verts=12, edge=.02)
    join_all('FarmWreck')
    export('farm_wreck_v1.glb')


def build_field_debris():
    """The small stuff: a sheet of corrugate, a pallet, a drum, fence panels.

    Not the roadside debris field, which is masonry from something that came
    down. This is what fifteen years of weather drags across open country.
    """
    clear_scene()
    corrugate = mat('DebrisCorrugate', (.128, .122, .112), .40, .86)
    timber = mat('DebrisTimber', (.116, .092, .062), 0, .95)
    drum = mat('DebrisDrum', (.100, .078, .046), .25, .90)
    cloth = mat('DebrisCloth', (.118, .112, .098), 0, .97)
    random.seed(2201)
    # A sheet of corrugated iron, half buried and curled.
    for i in range(7):
        cube(f'Field_Corrugate_{i}', (-1.4 + i * .21, .06 + i * .012, .3),
             (.10, .02, 1.05), corrugate,
             rotation=(0, .12, .06 + i * .05), edge=.01)
    # A broken pallet.
    for i in range(5):
        cube(f'Field_Slat_{i}', (1.9, .10, -.5 + i * .24), (.58, .022, .07), timber,
             rotation=(.04, .22, random.uniform(-.05, .05)), edge=.008)
    for i in range(2):
        cube(f'Field_Bearer_{i}', (1.9 + (i - .5) * .5, .05, .0), (.05, .05, .62), timber,
             rotation=(0, .22, 0), edge=.008)
    # An oil drum on its side, and a fence panel that came off a bay.
    cyl('Field_Drum', (-2.2, .29, -1.6), .29, .86, drum,
        rotation=(0, .4, math.pi / 2), verts=14, edge=.02)
    for i in range(6):
        cube(f'Field_Mesh_{i}', (.6 + i * .01, .04, -2.1 + i * .30), (.86, .012, .012),
             corrugate, rotation=(0, .1, .02), edge=0)
    for i in range(2):
        cube(f'Field_MeshRail_{i}', (.6 + i * .84 - .42, .04, -1.35), (.012, .012, .86),
             corrugate, rotation=(0, .1, .02), edge=0)
    # A sheet of something that used to be a tarpaulin.
    cube('Field_Sheet', (-.4, .05, 1.9), (.9, .02, .7), cloth,
         rotation=(.06, .8, -.05), edge=.06)
    join_all('FieldDebris')
    export('field_debris_v1.glb')


ROAD_WIDTH = 6.8      # kerb to kerb: two lanes of a British B-road
ROAD_TILE = 8.0       # metres of carriageway per repeat of the marking tile


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
    verge = mat('RoadVerge', (.074, .070, .050), 0, .98)
    kerb = mat('RoadKerb', (.212, .208, .196), 0, .92)

    length = 20.0                       # half length: a 40 m section
    # ROAD_TILE metres of carriageway per repeat of the marking tile, which puts
    # the dashes at about a metre with two metres between them.
    plan_uv(cube('Road_Surface', (0, .045, 0), (3.4, .045, length), tarmac, edge=.04),
            ROAD_WIDTH, ROAD_TILE)
    # A little camber, so the surface is not a perfectly flat plane.
    plan_uv(cube('Road_Crown', (0, .075, 0), (2.1, .022, length), tarmac, edge=.06),
            ROAD_WIDTH, ROAD_TILE)
    for side in (-1, 1):
        cube(f'Road_Kerb_{side}', (side * 3.56, .085, 0), (.18, .085, length), kerb, edge=.03)
        cube(f'Road_Verge_{side}', (side * 4.24, .022, 0), (.62, .024, length), verge, edge=.30)
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
    verge = mat('RoadVerge', (.074, .070, .050), 0, .98)
    kerb = mat('RoadKerb', (.212, .208, .196), 0, .92)

    length = 20.0
    plan_uv(cube('Road_Surface', (0, .045, 0), (3.4, .045, length), tarmac, edge=.04),
            ROAD_WIDTH, ROAD_TILE)
    for side in (-1, 1):
        cube(f'Road_Kerb_{side}', (side * 3.56, .085, 0), (.18, .085, length), kerb, edge=.03)
        cube(f'Road_Verge_{side}', (side * 4.24, .022, 0), (.62, .024, length), verge, edge=.30)
    # A crater through one carriageway, with the spoil thrown out around it.
    post('Road_Crater', (-1.1, .01, -4.0), 2.3, .10, rubble, verts=18, edge=.06)
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
    post('Town_Chimney', (46.0, 18.0, 16.0), 1.5, 36.0, brick, verts=16, edge=.10)
    post('Town_ChimneyCap', (46.0, 36.4, 16.0), 1.9, 1.2, stone, verts=16, edge=.08)
    post('Town_Gasholder', (-64.0, 8.5, 14.0), 9.0, 17.0, steel, verts=24, edge=.10)
    torus('Town_GasholderRing', (-64.0, 17.2, 14.0), 9.1, .35, steel,
          rotation=(math.pi / 2, 0, 0), major_segments=28)

    # A line of dead poplars along the road in, so the town does not sit on a
    # bare edge.
    for i in range(11):
        post(f'Town_Poplar_{i}', (-8.0 + i * 11.0, 5.0, -22.0 - (i % 3) * 2.0),
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
    # Wheels. Each one is joined on its own and has its origin set to the hub,
    # so the game can steer the front pair and spin all four. The body is
    # joined separately: a car joined into a single mesh is scenery.
    wheel_names = []
    for sx in (-1, 1):
        for sz in (-1, 1):
            x = sx * .84
            z = sz * 1.46
            tag = f'{"L" if sx < 0 else "R"}{"F" if sz < 0 else "R"}'
            # A cylinder is authored along Z. The axle runs across the car, so
            # it turns onto X — a quarter turn about Y, not about Z, which is
            # what had the wheels mounted facing fore-and-aft like discs.
            # A wheel you watch spin has to be round. Twenty segments on the
            # tyre and fourteen on the rim strobe like a cog the moment the car
            # moves; the carcass is 40-sided now, the rim 24, and the tread and
            # spokes give the eye something that reads as rotation rather than
            # as a flickering polygon.
            AX = (0, math.pi / 2, 0)          # cylinders are authored along Z
            OUT = x + sx * .105               # the outboard face of the wheel
            # Carcass, with the shoulders rolled off rather than square.
            cyl(f'Wheel_Tyre_{tag}', (x, .34, z), .335, .195, tyre,
                rotation=AX, verts=40, edge=.035)
            for k in (-1, 1):
                cyl(f'Wheel_Shoulder_{k}_{tag}', (x + k * .075, .34, z), .318, .05, tyre,
                    rotation=AX, verts=40, edge=.030)
            # Sidewall: a raised rib and a lettering band, both sides.
            for k in (-1, 1):
                cyl(f'Wheel_Wall_{k}_{tag}', (x + k * .098, .34, z), .285, .012, tyre,
                    rotation=AX, verts=36, edge=.008)
                cyl(f'Wheel_Band_{k}_{tag}', (x + k * .103, .34, z), .245, .008, trim,
                    rotation=AX, verts=32, edge=.004)
            # Tread: blocks round the circumference, in two rows with a groove
            # between them, angled so the pattern reads as it turns.
            for b in range(22):
                a = b * math.tau / 22
                by, bz = math.sin(a) * .333, math.cos(a) * .333
                for row, off in enumerate((-.055, .055)):
                    cube(f'Wheel_Tread_{b}_{row}_{tag}',
                         (x + off, .34 + by, z + bz), (.042, .026, .010), tyre,
                         rotation=(-a + (0.22 if row else -0.22), math.pi / 2, 0), edge=.005)
            # Rim: a dish, a lip, five spokes, a hub cap and the nuts.
            cyl(f'Wheel_Rim_{tag}', (x + sx * .055, .34, z), .215, .085, rim,
                rotation=AX, verts=24, edge=.012)
            cyl(f'Wheel_RimLip_{tag}', (x + sx * .098, .34, z), .232, .028, rim,
                rotation=AX, verts=24, edge=.008)
            for spk in range(5):
                a = spk * math.tau / 5 + .3
                cube(f'Wheel_Spoke_{spk}_{tag}',
                     (OUT - sx * .012, .34 + math.sin(a) * .115, z + math.cos(a) * .115),
                     (.020, .105, .038), rim, rotation=(-a, math.pi / 2, 0), edge=.008)
            cyl(f'Wheel_Hub_{tag}', (OUT - sx * .004, .34, z), .072, .040, rim,
                rotation=AX, verts=18, edge=.010)
            for nut in range(4):
                a = nut * math.tau / 4 + .5
                cyl(f'Wheel_Nut_{nut}_{tag}',
                    (OUT + sx * .006, .34 + math.sin(a) * .046, z + math.cos(a) * .046),
                    .013, .022, trim, rotation=AX, verts=6, edge=.003)
            # A brake disc behind the spokes, so the wheel is not hollow.
            cyl(f'Wheel_Disc_{tag}', (x - sx * .045, .34, z), .155, .022, trim,
                rotation=AX, verts=20, edge=.006)
            wheel_names.append((tag, x, z))

    # Every wheel part has to end in its tag, because that suffix is what the
    # join below selects on. A part named Wheel_Tread_LF_3 rather than
    # Wheel_Tread_3_LF joins neither the wheel nor the shell: it is left loose
    # in the scene, exported on its own, and sits under the car not turning.
    for o in bpy.context.scene.objects:
        if o.type == 'MESH' and o.name.startswith('Wheel_'):
            assert any(o.name.endswith(f'_{t}') for t, _, _ in wheel_names), \
                f'wheel part {o.name} does not end in a wheel tag'

    # Everything that is not a wheel becomes the shell.
    bpy.ops.object.select_all(action='DESELECT')
    body_parts = [o for o in bpy.context.scene.objects
                  if o.type == 'MESH' and not o.name.startswith('Wheel_')]
    for o in body_parts:
        o.select_set(True)
    bpy.context.view_layer.objects.active = body_parts[0]
    bpy.ops.object.join()
    bpy.context.object.name = 'Car_Shell'

    # Then each wheel, with its origin moved to the hub so a rotation about the
    # object's own X axis is the wheel turning rather than the wheel orbiting.
    for tag, x, z in wheel_names:
        bpy.ops.object.select_all(action='DESELECT')
        parts = [o for o in bpy.context.scene.objects if o.name.startswith(f'Wheel_')
                 and o.name.endswith(f'_{tag}')]
        for o in parts:
            o.select_set(True)
        bpy.context.view_layer.objects.active = parts[0]
        bpy.ops.object.join()
        wheel = bpy.context.object
        wheel.name = f'Car_Wheel_{tag}'
        bpy.context.scene.cursor.location = (x, .34, z)
        bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
    bpy.context.scene.cursor.location = (0, 0, 0)
    export('car_drivable_v1.glb')

    # The static prop keeps its old single-mesh form: nothing steers a wreck.
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
        post('RoofVent'+str(x),(x,3.85,.60),.32,.78,DARK,verts=28)
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
    """An eight-metre cantilever gate that actually opens.

    Built to the same bay grid as the fence it hangs in — the opening is two
    bays wide, so the run either side of it closes on the gate posts instead of
    stopping short and leaving a person-sized hole. The frame and the two
    leaves export as separate objects: the game slides the leaves out behind
    the fence line, which is what a cantilever gate does.
    """
    clear_scene()
    POST = 4.0          # gate posts, one bay either side of centre
    LEAF = 1.95         # half the width of a leaf
    CENTRE = 2.0        # where each leaf sits when the gate is shut
    RUNWAY = -.30       # the leaves track behind the fence line

    # --- Frame -------------------------------------------------------------
    for side in (-1, 1):
        x = side * POST
        cube(f'GateFooting{side}', (x, .18, 0), (.36, .20, .36), CONCRETE, edge=.05)
        post(f'GatePost{side}', (x, 1.76, 0), .12, 3.16, STEEL, verts=18, edge=.014)
        post(f'GatePostCap{side}', (x, 3.40, 0), .14, .09, BRUSHED, verts=18)
        # The outriggers carry the barbed run straight over the opening.
        between(f'GateArm{side}', (x, 3.34, 0), (x, 3.70, -.34), .028, STEEL, 8)
        # A guide roller at the top of each post, which is what a cantilever
        # leaf actually runs through.
        cube(f'GateGuide{side}', (x - side * .16, 2.62, RUNWAY / 2),
             (.16, .09, .20), DARK, edge=.03)
    for k, (y, z) in enumerate(((3.42, -.10), (3.55, -.21), (3.68, -.33))):
        between(f'GateBarb{k}', (-POST, y, z), (POST, y, z), .009, BRUSHED, 8)

    # The drive gear on the near post, and a beacon that means it is powered.
    cube('GateMotor', (POST + .48, .54, .34), (.36, .54, .34), GREEN, edge=.07)
    cube('GateMotorPlate', (POST + .48, .96, .00), (.30, .12, .04), BRUSHED, edge=.01)
    post('GateBeacon', (POST + .48, 1.22, .34), .08, .16, RED_GLOW, verts=24)
    cube('GateSign', (-POST, 2.10, -.14), (.46, .30, .015), YELLOW, edge=.008)
    text_obj('GateSignText', 'RESTRICTED', (-POST, 2.10, -.17), .085, DARK, extrude=.004)
    join_all('Gate_Frame')
    # join_all leaves the origin on whichever part it merged into. Put it back
    # on the gate's centre line so the game can reason about the thing.
    bpy.context.scene.cursor.location = (0, 0, 0)
    bpy.ops.object.origin_set(type='ORIGIN_CURSOR')

    # --- Leaves ------------------------------------------------------------
    # Each one is built at the origin and moved into place afterwards, so its
    # own origin is its centre and sliding it is one number.
    for side, tag in ((-1, 'L'), (1, 'R')):
        before = set(bpy.context.scene.objects)
        # Welded tube frame: stiles, rails and a diagonal brace, as a real
        # cantilever leaf has.
        for sx in (-LEAF, LEAF):
            post(f'Leaf_Stile_{tag}_{sx:.2f}', (sx, 1.38, 0), .046, 2.46,
                 STEEL, verts=12, edge=.008)
        for y in (.18, 1.38, 2.58):
            between(f'Leaf_Rail_{tag}_{y:.2f}', (-LEAF, y, 0), (LEAF, y, 0),
                    .042, STEEL, 10)
        between(f'Leaf_Brace_{tag}', (-LEAF + .04, .24, .03), (LEAF - .04, 2.52, .03),
                .028, STEEL, 8)
        # The same welded mesh as the panels either side of it.
        bars = 34
        for i in range(1, bars):
            x = -LEAF + i * (LEAF * 2 / bars)
            cube(f'Leaf_Wire_{tag}_{i}', (x, 1.38, -.05), (.0095, 1.16, .0095),
                 BRUSHED, edge=.003)
        for j in range(1, 8):
            y = .22 + j * (2.32 / 8)
            cube(f'Leaf_MeshRail_{tag}_{j}', (0, y, -.065), (LEAF - .04, .0095, .0095),
                 BRUSHED, edge=.003)
        cube(f'Leaf_Hazard_{tag}', (0, .42, -.09), (LEAF - .08, .16, .015), YELLOW, edge=.006)

        parts = [o for o in bpy.context.scene.objects
                 if o.type == 'MESH' and o not in before]
        bpy.ops.object.select_all(action='DESELECT')
        for o in parts:
            o.select_set(True)
        bpy.context.view_layer.objects.active = parts[0]
        # Bake each part's own rotation first. Joining expresses everything in
        # the active object's local space, so joining into a rotated stile
        # would export the whole leaf lying on a quarter turn.
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
        bpy.ops.object.join()
        leaf = bpy.context.object
        leaf.name = f'Gate_Leaf_{tag}'
        # The origin goes on the ground at the leaf's own centre line, so
        # sliding it open is one number on one axis.
        bpy.context.scene.cursor.location = (0, 0, 0)
        bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
        leaf.location = (side * CENTRE, 0, RUNWAY)

    export('perimeter_gate.glb')


def build_floodlight():
    clear_scene()
    post('FloodMast',(0,2.3,0),.075,4.6,DARK,verts=20)
    cube('FloodCrossbar',(0,4.58,0),(.70,.055,.055),BRUSHED,edge=.015)
    for x in (-.48,.48):
        cube('FloodHousing'+str(x),(x,4.45,-.16),(.30,.22,.13),DARK,rotation=(-.18,0,0),edge=.055)
        cube('FloodLens'+str(x),(x,4.42,-.305),(.24,.16,.018),WHITE,rotation=(-.18,0,0),edge=.025)
    cube('FloodJunction',(0,1.0,.08),(.22,.30,.16),GREEN,edge=.045)
    export('floodlight.glb')


def build_tree():
    clear_scene()
    bark=mat('DeadBark',(.095,.055,.028),0,.96)
    post('TreeTrunk',(0,2.1,0),.28,4.2,bark,verts=14,edge=.015)
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
        post('Rebar'+str(x),(x,1.18,.10),.025,.60,STEEL,verts=10)
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
    build_remains_covered, build_remains_slumped,
    build_hedge, build_hedge_far, build_hedge_gap, build_scrub, build_grass_tuft,
    build_fallen_tree, build_spoil_heap, build_telegraph_pole,
    build_farm_wreck, build_field_debris,
):
    fn()

print('Lost Signal Blender environment V3 complete.')

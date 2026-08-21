import bpy
import math
import os
import random
from mathutils import Vector

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'assets', 'blender')
QA = os.path.join(ROOT, 'qa', 'renders', 'exterior_v6')
os.makedirs(OUT, exist_ok=True)
os.makedirs(QA, exist_ok=True)
random.seed(47)

# Shelter 47 exterior V6
# All visible exterior art in this pass is authored here. No downloaded animals,
# vegetation or yard props are used.


def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)


def mat(name, color, metallic=0.0, roughness=.65, emission=None, emission_strength=0.0):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color, 1)
    if 'Metallic' in bsdf.inputs: bsdf.inputs['Metallic'].default_value = metallic
    if 'Roughness' in bsdf.inputs: bsdf.inputs['Roughness'].default_value = roughness
    if emission:
        for key in ('Emission Color', 'Emission'):
            if key in bsdf.inputs:
                bsdf.inputs[key].default_value = (*emission, 1)
                break
        if 'Emission Strength' in bsdf.inputs:
            bsdf.inputs['Emission Strength'].default_value = emission_strength
    return m


def smooth(o):
    if o and o.type == 'MESH':
        for p in o.data.polygons:
            p.use_smooth = True


def bevel(o, width=.03, segments=2):
    if not o or o.type != 'MESH' or width <= 0:
        return o
    mod = o.modifiers.new('LS_Bevel', 'BEVEL')
    mod.width = width
    mod.segments = segments
    mod.limit_method = 'ANGLE'
    bpy.context.view_layer.objects.active = o
    try:
        bpy.ops.object.modifier_apply(modifier=mod.name)
    except Exception:
        pass
    smooth(o)
    return o


def cube(name, loc, dims, material, rot=(0,0,0), edge=.03):
    bpy.ops.mesh.primitive_cube_add(location=loc, rotation=rot)
    o = bpy.context.object
    o.name = name
    o.dimensions = dims
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(material)
    bevel(o, edge, 3)
    return o


def cyl(name, loc, radius, depth, material, rot=(0,0,0), verts=24, edge=.006):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=depth, location=loc, rotation=rot)
    o = bpy.context.object
    o.name = name
    o.data.materials.append(material)
    bevel(o, edge, 2)
    return o


def sphere(name, loc, radius, material, scale=(1,1,1), segments=24, rings=12):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, radius=radius, location=loc)
    o = bpy.context.object
    o.name = name
    o.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(material)
    smooth(o)
    return o


def ico(name, loc, radius, material, scale=(1,1,1), subdivisions=2):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=subdivisions, radius=radius, location=loc)
    o = bpy.context.object
    o.name = name
    o.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(material)
    smooth(o)
    return o


def torus(name, loc, major, minor, material, rot=(0,0,0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, major_segments=36, minor_segments=10, location=loc, rotation=rot)
    o = bpy.context.object
    o.name = name
    o.data.materials.append(material)
    smooth(o)
    return o


def between(name, a, b, radius, material, verts=14):
    a, b = Vector(a), Vector(b)
    d = b - a
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=d.length, location=(a+b)*.5)
    o = bpy.context.object
    o.name = name
    o.rotation_mode = 'QUATERNION'
    o.rotation_quaternion = d.to_track_quat('Z', 'Y')
    o.rotation_mode = 'XYZ'
    o.data.materials.append(material)
    smooth(o)
    return o


def text_obj(name, text, loc, size, material, rot=(math.pi/2,0,0), extrude=.004):
    bpy.ops.object.text_add(location=loc, rotation=rot)
    o = bpy.context.object
    o.name = name
    o.data.body = text
    o.data.align_x = 'CENTER'
    o.data.align_y = 'CENTER'
    o.data.size = size
    o.data.extrude = extrude
    o.data.bevel_depth = .0015
    o.data.materials.append(material)
    bpy.ops.object.convert(target='MESH')
    return o


def parent_all(root):
    for o in list(bpy.context.scene.objects):
        if o != root and o.parent is None:
            o.parent = root


def empty(name):
    o = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(o)
    return o


def export_all(filename):
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(
        filepath=os.path.join(OUT, filename),
        export_format='GLB',
        use_selection=True,
        export_apply=True,
    )
    print('EXPORTED', filename)


# Materials
SOIL = mat('V6_Soil', (.105,.095,.075), 0, .96)
MUD = mat('V6_Mud', (.075,.070,.060), 0, .88)
GRAVEL = mat('V6_Gravel', (.23,.24,.22), 0, .92)
ASPHALT = mat('V6_Asphalt', (.055,.060,.058), 0, .92)
CONCRETE = mat('V6_Concrete', (.27,.28,.26), 0, .88)
CONCRETE_DARK = mat('V6_ConcreteDark', (.14,.15,.14), 0, .92)
STEEL = mat('V6_Steel', (.19,.21,.20), .82, .34)
STEEL_DARK = mat('V6_DarkSteel', (.055,.065,.060), .86, .39)
RUST = mat('V6_Rust', (.29,.095,.032), .32, .76)
OLIVE = mat('V6_Olive', (.11,.14,.075), .18, .68)
HAZARD = mat('V6_Hazard', (.68,.40,.045), .08, .55)
SIGN = mat('V6_Sign', (.68,.66,.53), .05, .72)
GLASS = mat('V6_Glass', (.09,.14,.13), .18, .18)
LAMP = mat('V6_Lamp', (.56,.60,.57), .05, .25, (.95,1.0,.90), 2.0)
GRASS = mat('V6_Grass', (.11,.20,.075), 0, .83)
GRASS_DRY = mat('V6_GrassDry', (.28,.27,.12), 0, .88)
BARK = mat('V6_Bark', (.12,.065,.035), 0, .93)
PINE = mat('V6_Pine', (.06,.15,.075), 0, .86)
LEAF = mat('V6_Leaf', (.10,.21,.085), 0, .84)
ROCK = mat('V6_Rock', (.25,.26,.23), 0, .94)
DEER = mat('V6_DeerCoat', (.33,.20,.105), 0, .86)
DEER_DARK = mat('V6_DeerDark', (.095,.060,.038), 0, .90)
DEER_LIGHT = mat('V6_DeerLight', (.58,.47,.31), 0, .90)
BLACK = mat('V6_Black', (.012,.014,.013), 0, .96)
RABBIT = mat('V6_RabbitCoat', (.34,.31,.27), 0, .91)
RABBIT_LIGHT = mat('V6_RabbitLight', (.56,.52,.45), 0, .94)


def build_terrain_mesh():
    n = 41
    size = 70.0
    verts = []
    faces = []
    for iz in range(n):
        z = -size/2 + size * iz/(n-1)
        for ix in range(n):
            x = -size/2 + size * ix/(n-1)
            # Low rolling terrain outside the compound; keep inner yard flatter.
            r = math.sqrt(x*x + (z+4)*(z+4))
            amp = .08 if abs(x) < 22 and -29 < z < 21 else .34
            y = amp * (math.sin(x*.19)*.45 + math.cos(z*.16)*.40 + math.sin((x+z)*.10)*.20)
            if r < 24: y *= .35
            verts.append((x, z, y))
    for iz in range(n-1):
        for ix in range(n-1):
            a = iz*n+ix
            b = a+1
            c = a+n+1
            d = a+n
            faces.append((a,b,c,d))
    me = bpy.data.meshes.new('YardTerrainMesh')
    me.from_pydata(verts, [], faces)
    me.update()
    o = bpy.data.objects.new('Yard_Terrain', me)
    bpy.context.collection.objects.link(o)
    o.data.materials.append(SOIL)
    smooth(o)
    return o


def fence_segment(name, a, b):
    a = Vector(a); b = Vector(b)
    d = b-a
    L = d.length
    mid = (a+b)*.5
    ang = math.atan2(d.x, d.y)
    # rails
    for h in (.48, 1.52, 2.55):
        cube(name+'_Rail_'+str(h), (mid.x, mid.y, h), (.045, L, .045), STEEL_DARK, rot=(0,0,-ang), edge=.008)
    # posts
    steps = max(1, int(L/2.5))
    for i in range(steps+1):
        t = i/steps
        p = a.lerp(b,t)
        cyl(name+'_Post_'+str(i), (p.x,p.y,1.42), .055, 2.84, STEEL_DARK, verts=14)
    # coarse chain mesh via crossed rods - all modeled, no alpha texture
    mesh_steps = max(2, int(L/.75))
    normal = Vector((d.y,-d.x,0)).normalized() * .012
    for i in range(mesh_steps):
        t0=i/mesh_steps; t1=min(1,(i+1.7)/mesh_steps)
        p0=a.lerp(b,t0); p1=a.lerp(b,t1)
        between(name+'_WireA_'+str(i),(p0.x+normal.x,p0.y+normal.y,.42),(p1.x+normal.x,p1.y+normal.y,2.50),.012,STEEL,8)
        between(name+'_WireB_'+str(i),(p0.x-normal.x,p0.y-normal.y,2.50),(p1.x-normal.x,p1.y-normal.y,.42),.012,STEEL,8)


def lamp_post(name, x, y):
    cyl(name+'_Pole', (x,y,2.7), .085, 5.4, STEEL_DARK, verts=18)
    between(name+'_Arm',(x,y,5.20),(x*.92,y*.92,5.58),.055,STEEL_DARK,14)
    cube(name+'_Head',(x*.92,y*.92,5.58),(.56,.34,.18),STEEL_DARK,edge=.045)
    cube(name+'_Lens',(x*.92,y*.92-0.02,5.46),(.44,.27,.025),LAMP,edge=.012)


def build_yard():
    clear_scene()
    root = empty('Shelter47_Exterior_V6')
    build_terrain_mesh()
    # Compound hardstand and cracked access road.
    cube('Yard_Hardstand',(0,-4,.02),(38,43,.08),GRAVEL,edge=.02)
    cube('AccessRoad',(0,-6,.10),(7.0,50,.11),ASPHALT,edge=.03)
    for z in range(-28,19,4):
        cube('RoadDash_'+str(z),(0,z,.18),(.12,1.15,.018),SIGN,edge=.003)
    # road shoulder / mud strips
    cube('RoadShoulder_L',(-4.2,-6,.11),(1.0,50,.05),MUD,edge=.02)
    cube('RoadShoulder_R',(4.2,-6,.11),(1.0,50,.05),MUD,edge=.02)
    # Bunker surface entrance building
    cube('SurfaceBunker_Main',(0,-17,1.65),(9.6,6.6,3.3),CONCRETE,edge=.12)
    cube('SurfaceBunker_Roof',(0,-17,3.42),(10.4,7.4,.42),CONCRETE_DARK,edge=.13)
    cube('SurfaceBunker_DoorFrame',(0,-13.62,1.40),(4.3,.42,2.8),STEEL_DARK,edge=.06)
    cube('SurfaceBunker_Door',(0,-13.35,1.36),(3.45,.18,2.55),OLIVE,edge=.08)
    cube('ReturnPanel',(-2.15,-13.18,1.10),(.28,.18,.52),STEEL_DARK,edge=.035)
    cube('ReturnPanel_Screen',(-2.15,-13.07,1.18),(.20,.025,.20),LAMP,edge=.01)
    text_obj('EntranceLabel','SHELTER 47',(0,-13.07,2.85),.24,SIGN,rot=(math.pi/2,0,0),extrude=.008)
    # Guard booth
    cube('GuardBooth',(-13.3,12.4,1.42),(3.6,3.2,2.85),CONCRETE,edge=.10)
    cube('GuardWindow',(-13.25,10.73,1.78),(2.2,.05,.82),GLASS,edge=.02)
    cube('GuardDoor',(-11.46,12.45,1.15),(.08,1.05,2.25),STEEL_DARK,edge=.04)
    cube('GuardDesk',(-13.1,11.15,.92),(1.8,.55,.11),STEEL_DARK,edge=.03)
    # Generator annex / fuel cage
    cube('FuelPad',(13.0,-8.5,.16),(6.0,4.5,.22),CONCRETE_DARK,edge=.04)
    for i,x in enumerate((11.4,12.5,13.6,14.7)):
        cyl('FuelDrum_'+str(i),(x,-8.5,.72),.38,1.25,RUST if i%2 else OLIVE,verts=24,edge=.018)
    # drainage ditch edges
    for x in (-7.1,7.1):
        cube('DrainEdge_'+str(x),(x,-5,.04),(.20,39,.12),CONCRETE_DARK,edge=.02)
    # puddles
    for i,(x,y,sx,sy) in enumerate([(-8,-3,1.5,.8),(8,5,1.1,.6),(3,-22,1.4,.55),(-11,10,.85,.5)]):
        bpy.ops.mesh.primitive_circle_add(vertices=36,radius=1,fill_type='NGON',location=(x,y,.16))
        o=bpy.context.object; o.name='Puddle_'+str(i); o.scale=(sx,sy,1); o.data.materials.append(GLASS)
    # perimeter fence and gate opening
    fence_segment('FenceBack',(-20,-27,0),(20,-27,0))
    fence_segment('FenceLeft',(-20,-27,0),(-20,18,0))
    fence_segment('FenceRight',(20,-27,0),(20,18,0))
    fence_segment('FenceFrontL',(-20,18,0),(-5,18,0))
    fence_segment('FenceFrontR',(5,18,0),(20,18,0))
    # double swing gate
    for side in (-1,1):
        x=side*2.5
        cube('MainGateLeaf_'+str(side),(x,18,1.40),(4.7,.12,2.75),STEEL_DARK,edge=.025)
        for k in range(5):
            between('GateBrace_'+str(side)+'_'+str(k),(x-2.0+side*k*.12,17.90,.38),(x+2.0-side*k*.12,17.90,2.45),.025,STEEL,10)
    cyl('GatePostL',(-5,18,1.55),.12,3.1,STEEL_DARK,verts=20)
    cyl('GatePostR',(5,18,1.55),.12,3.1,STEEL_DARK,verts=20)
    cube('GateHeader',(0,18,3.25),(10.5,.22,.35),STEEL_DARK,edge=.04)
    text_obj('GateSign','RESTRICTED  /  SHELTER 47',(0,17.83,3.25),.22,SIGN,rot=(math.pi/2,0,0),extrude=.006)
    # four floodlight towers + two gate lamps
    for i,(x,y) in enumerate([(-14,-20),(14,-20),(-14,11),(14,11)]):
        lamp_post('YardFloodlight_'+str(i),x,y)
    for i,x in enumerate((-4.4,4.4)):
        cyl('GateLampPole_'+str(i),(x,16.6,2.05),.055,4.1,STEEL_DARK,verts=16)
        cube('GateLampHead_'+str(i),(x,16.4,4.15),(.38,.28,.16),STEEL_DARK,edge=.03)
        cube('GateLampLens_'+str(i),(x,16.27,4.05),(.30,.025,.10),LAMP,edge=.01)
    # barriers / debris
    for i,(x,y,r) in enumerate([(-7,7,.18),(7,7,-.16),(-8,-9,.08),(8,-8,-.10)]):
        cube('ConcreteBarrier_'+str(i),(x,y,.48),(2.5,.72,.82),CONCRETE_DARK,rot=(0,0,r),edge=.08)
        cube('BarrierStripe_'+str(i),(x,y-.38,.52),(1.2,.025,.18),HAZARD,rot=(0,0,r),edge=.004)
    for i,(x,y) in enumerate([(-11,-13),(11,-14),(-15,4),(13,12),(4,2)]):
        for j in range(5):
            ico('Rubble_'+str(i)+'_'+str(j),(x+random.uniform(-1,1),y+random.uniform(-.8,.8),.20+random.random()*.18),.35+random.random()*.25,ROCK,scale=(1.2,.75,.65),subdivisions=1)
    parent_all(root)
    export_all('shelter47_yard_v6.glb')


def build_grass_clump():
    clear_scene()
    root=empty('GrassClump_V6')
    for i in range(28):
        ang=random.random()*math.tau
        rad=random.random()*.32
        x=math.cos(ang)*rad; y=math.sin(ang)*rad
        h=.28+random.random()*.42
        w=.018+random.random()*.018
        bend=(random.random()-.5)*.16
        verts=[(x-w,y,0),(x+w,y,0),(x+w*.55,y+bend,h*.62),(x,y+bend*1.7,h),(x-w*.55,y+bend,h*.62)]
        faces=[(0,1,2,3,4)]
        me=bpy.data.meshes.new('GrassBladeMesh_'+str(i)); me.from_pydata(verts,[],faces); me.update()
        o=bpy.data.objects.new('GrassBlade_'+str(i),me); bpy.context.collection.objects.link(o); o.data.materials.append(GRASS_DRY if i%5==0 else GRASS); o.parent=root
    export_all('grass_clump_v6.glb')


def build_pine():
    clear_scene(); root=empty('PineTree_V6')
    cyl('Pine_Trunk',(0,0,2.2),.24,4.4,BARK,verts=18,edge=.01)
    for i,(z,r,h) in enumerate([(1.4,1.75,1.6),(2.1,1.58,1.55),(2.8,1.35,1.45),(3.5,1.12,1.35),(4.15,.82,1.15)]):
        bpy.ops.mesh.primitive_cone_add(vertices=24,radius1=r,radius2=.10,depth=h,location=(0,0,z))
        o=bpy.context.object;o.name='Pine_Crown_'+str(i);o.data.materials.append(PINE);smooth(o);o.parent=root
    export_all('pine_tree_v6.glb')


def build_bush():
    clear_scene(); root=empty('Bush_V6')
    for i in range(11):
        a=random.random()*math.tau;r=random.random()*.6
        ico('BushLobe_'+str(i),(math.cos(a)*r,math.sin(a)*r,.45+random.random()*.5),.55+random.random()*.28,LEAF,scale=(1.15,.9,.85),subdivisions=2).parent=root
    export_all('bush_v6.glb')


def build_rock():
    clear_scene(); root=empty('Rock_V6')
    o=ico('Rock_Main',(0,0,.36),.72,ROCK,scale=(1.25,.9,.65),subdivisions=2);o.parent=root
    for i in range(3):
        o=ico('Rock_Small_'+str(i),(random.uniform(-.7,.7),random.uniform(-.5,.5),.18),.28+random.random()*.18,ROCK,scale=(1.1,.8,.7),subdivisions=1);o.parent=root
    export_all('rock_v6.glb')


def build_deer():
    clear_scene(); root=empty('Deer_V6')
    # organic overlapping volumes, intentionally smooth and anatomical rather than block-built
    body=sphere('Deer_Body',(0,0,1.20),.72,DEER,scale=(1.45,.58,.72),segments=32,rings=16);body.parent=root
    chest=sphere('Deer_Chest',(.72,0,1.30),.52,DEER,scale=(.75,.62,1.0),segments=28,rings=14);chest.parent=root
    neck=between('Deer_Neck',(.78,0,1.42),(1.08,0,2.00),.18,DEER,18);neck.parent=root
    head=sphere('Deer_Head',(1.24,0,2.10),.30,DEER,scale=(1.0,.68,.80),segments=28,rings=14);head.parent=root
    muzzle=sphere('Deer_Muzzle',(1.47,0,2.02),.18,DEER_LIGHT,scale=(1.05,.62,.55),segments=24,rings=12);muzzle.parent=root
    nose=sphere('Deer_Nose',(1.62,0,2.03),.085,BLACK,scale=(.8,.7,.65),segments=20,rings=10);nose.parent=root
    # ears are attached close to the skull with broad bases
    for side in (-1,1):
        ear=sphere('Deer_Ear_'+str(side),(1.18,.21*side,2.34),.13,DEER,scale=(.60,.55,1.55),segments=20,rings=10);ear.rotation_euler=(.10*side,.18,-.18*side);ear.parent=root
        eye=sphere('Deer_Eye_'+str(side),(1.39,.185*side,2.17),.035,BLACK,scale=(1,.55,1),segments=16,rings=8);eye.parent=root
    # legs: upper and lower segments with slim hooves
    leg_roots=[(-.55,-.28),(-.55,.28),(.58,-.27),(.58,.27)]
    for i,(x,y) in enumerate(leg_roots):
        between('Deer_UpperLeg_'+str(i),(x,y,1.02),(x+(0.05 if x>0 else -.03),y,.55),.075,DEER_DARK,14).parent=root
        between('Deer_LowerLeg_'+str(i),(x+(0.05 if x>0 else -.03),y,.55),(x+.02,y,.14),.046,DEER_DARK,12).parent=root
        cube('Deer_Hoof_'+str(i),(x+.04,y,.09),(.13,.08,.08),BLACK,edge=.025).parent=root
    tail=sphere('Deer_Tail',(-1.05,0,1.43),.15,DEER_LIGHT,scale=(1.0,.70,.75),segments=20,rings=10);tail.parent=root
    export_all('deer_v6.glb')


def build_rabbit():
    clear_scene(); root=empty('Rabbit_V6')
    body=sphere('Rabbit_Body',(0,0,.38),.34,RABBIT,scale=(1.15,.82,.95),segments=28,rings=14);body.parent=root
    haunch=sphere('Rabbit_Haunch',(-.27,0,.38),.31,RABBIT,scale=(1.05,.92,1.0),segments=24,rings=12);haunch.parent=root
    head=sphere('Rabbit_Head',(.34,0,.58),.22,RABBIT,scale=(1.0,.84,.95),segments=24,rings=12);head.parent=root
    muzzle=sphere('Rabbit_Muzzle',(.51,0,.54),.12,RABBIT_LIGHT,scale=(1.05,.75,.65),segments=20,rings=10);muzzle.parent=root
    nose=sphere('Rabbit_Nose',(.61,0,.56),.045,BLACK,scale=(1,.75,.7),segments=16,rings=8);nose.parent=root
    for side in (-1,1):
        ear=sphere('Rabbit_Ear_'+str(side),(.28,.09*side,.91),.10,RABBIT,scale=(.60,.42,2.0),segments=20,rings=10);ear.rotation_euler=(.03*side,.12,-.08*side);ear.parent=root
        eye=sphere('Rabbit_Eye_'+str(side),(.48,.16*side,.65),.028,BLACK,scale=(1,.55,1),segments=14,rings=7);eye.parent=root
    tail=sphere('Rabbit_Tail',(-.52,0,.50),.12,RABBIT_LIGHT,segments=18,rings=9);tail.parent=root
    # legs tucked under body
    for i,(x,y) in enumerate([(-.28,-.18),(-.28,.18),(.22,-.15),(.22,.15)]):
        sphere('Rabbit_Paw_'+str(i),(x,y,.12),.09,RABBIT,scale=(1.45,.72,.55),segments=18,rings=9).parent=root
    export_all('rabbit_v6.glb')


def setup_render(camera_pos, target, filepath, sun_strength=2.3):
    bpy.ops.object.camera_add(location=camera_pos)
    cam=bpy.context.object
    direction=Vector(target)-cam.location
    cam.rotation_euler=direction.to_track_quat('-Z','Y').to_euler()
    bpy.context.scene.camera=cam
    bpy.ops.object.light_add(type='SUN',location=(0,0,12));sun=bpy.context.object;sun.data.energy=sun_strength;sun.rotation_euler=(math.radians(32),math.radians(-18),math.radians(28))
    bpy.ops.object.light_add(type='AREA',location=(0,-3,9));area=bpy.context.object;area.data.energy=700;area.data.shape='DISK';area.data.size=18
    bpy.context.scene.render.engine='BLENDER_EEVEE_NEXT'
    bpy.context.scene.render.resolution_x=1280;bpy.context.scene.render.resolution_y=720;bpy.context.scene.render.resolution_percentage=100
    bpy.context.scene.render.image_settings.file_format='PNG'
    bpy.context.scene.render.filepath=filepath
    bpy.context.scene.world.color=(.10,.12,.13)
    bpy.ops.render.render(write_still=True)


def build_qa():
    # Build a representative authored yard, then add samples of our own vegetation and animals.
    clear_scene()
    build_terrain_mesh()
    cube('QA_Hardstand',(0,-4,.02),(38,43,.08),GRAVEL,edge=.02)
    cube('QA_Road',(0,-6,.10),(7.0,50,.11),ASPHALT,edge=.03)
    # lightweight entrance and fence cues for QA
    cube('QA_Bunker',(0,-17,1.65),(9.6,6.6,3.3),CONCRETE,edge=.12)
    cube('QA_Roof',(0,-17,3.42),(10.4,7.4,.42),CONCRETE_DARK,edge=.13)
    fence_segment('QA_FrontL',(-20,18,0),(-5,18,0));fence_segment('QA_FrontR',(5,18,0),(20,18,0))
    for x,y in [(-14,-20),(14,-20),(-14,11),(14,11)]:lamp_post('QA_Lamp',x,y)
    # vegetation built directly for renders
    for i in range(45):
        x=random.uniform(-19,19); y=random.uniform(-25,16)
        if abs(x)<4.7: continue
        for b in range(5):
            h=.28+random.random()*.35; ang=random.random()*math.tau; r=random.random()*.22
            between('QA_Grass',(x+math.cos(ang)*r,y+math.sin(ang)*r,.02),(x+math.cos(ang)*r+(random.random()-.5)*.06,y+math.sin(ang)*r+(random.random()-.5)*.06,h),.012,GRASS,8)
    # simple deer/rabbit presence using same authored forms
    body=sphere('QA_DeerBody',(-8,7,1.20),.72,DEER,scale=(1.45,.58,.72),segments=32,rings=16)
    sphere('QA_DeerHead',(-6.8,7,2.08),.30,DEER,scale=(1,.68,.8),segments=28,rings=14)
    sphere('QA_Rabbit',(8,5,.38),.34,RABBIT,scale=(1.15,.82,.95),segments=28,rings=14)
    setup_render((0,-32,7),(0,-4,1.2),os.path.join(QA,'01_gate_to_bunker.png'))
    setup_render((22,-5,6),(0,-5,1.1),os.path.join(QA,'02_yard_overview.png'))
    setup_render((-16,13,4),(0,8,1.2),os.path.join(QA,'03_guard_gate.png'))


if __name__ == '__main__':
    build_yard()
    build_grass_clump()
    build_pine()
    build_bush()
    build_rock()
    build_deer()
    build_rabbit()
    build_qa()

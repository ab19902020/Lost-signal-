import bpy
import math
import os
from mathutils import Vector

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'assets', 'blender')
QA = os.path.join(ROOT, 'qa', 'renders', 'v5')
TEX = os.path.join(ROOT, 'public', 'assets', 'textures')
os.makedirs(OUT, exist_ok=True)
os.makedirs(QA, exist_ok=True)

# Shelter 47 V5
# One coherent, correctly scaled, Z-up Blender environment.
# Three.js will not place visible bunker furniture after this scene is accepted.


def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)


def mat(name, color, metallic=0.0, roughness=.65, emission=None, emission_strength=0.0, alpha=1.0):
    m=bpy.data.materials.new(name);m.use_nodes=True
    bsdf=m.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value=(*color,1)
    if 'Metallic' in bsdf.inputs:bsdf.inputs['Metallic'].default_value=metallic
    if 'Roughness' in bsdf.inputs:bsdf.inputs['Roughness'].default_value=roughness
    if alpha<1:
        bsdf.inputs['Alpha'].default_value=alpha
        try:m.surface_render_method='DITHERED'
        except Exception:pass
    if emission:
        for k in ('Emission Color','Emission'):
            if k in bsdf.inputs:
                bsdf.inputs[k].default_value=(*emission,1);break
        if 'Emission Strength' in bsdf.inputs:bsdf.inputs['Emission Strength'].default_value=emission_strength
    return m


def procedural_concrete(name, base=(.28,.27,.24), dark=(.13,.14,.13)):
    m=bpy.data.materials.new(name);m.use_nodes=True
    nt=m.node_tree;bsdf=nt.nodes.get('Principled BSDF')
    tex=nt.nodes.new('ShaderNodeTexNoise');tex.inputs['Scale'].default_value=4.2;tex.inputs['Detail'].default_value=5.0;tex.inputs['Roughness'].default_value=.76
    ramp=nt.nodes.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].color=(*dark,1);ramp.color_ramp.elements[1].color=(*base,1)
    ramp.color_ramp.elements[0].position=.24;ramp.color_ramp.elements[1].position=.78
    bump=nt.nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.22;bump.inputs['Distance'].default_value=.12
    nt.links.new(tex.outputs['Fac'],ramp.inputs['Fac']);nt.links.new(ramp.outputs['Color'],bsdf.inputs['Base Color']);nt.links.new(tex.outputs['Fac'],bump.inputs['Height']);nt.links.new(bump.outputs['Normal'],bsdf.inputs['Normal'])
    bsdf.inputs['Roughness'].default_value=.91
    return m


def worn_paint(name, a, b, metallic=.18, roughness=.64, scale=7.0):
    m=bpy.data.materials.new(name);m.use_nodes=True
    nt=m.node_tree;bsdf=nt.nodes.get('Principled BSDF')
    tex=nt.nodes.new('ShaderNodeTexNoise');tex.inputs['Scale'].default_value=scale;tex.inputs['Detail'].default_value=3.0;tex.inputs['Roughness'].default_value=.72
    ramp=nt.nodes.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].color=(*a,1);ramp.color_ramp.elements[1].color=(*b,1)
    nt.links.new(tex.outputs['Fac'],ramp.inputs['Fac']);nt.links.new(ramp.outputs['Color'],bsdf.inputs['Base Color'])
    bsdf.inputs['Metallic'].default_value=metallic;bsdf.inputs['Roughness'].default_value=roughness
    return m


def plate_material():
    # Existing same-repository PBR diamond plate, box projected in Blender.
    m=bpy.data.materials.new('V5_DiamondPlate');m.use_nodes=True
    nt=m.node_tree;bsdf=nt.nodes.get('Principled BSDF')
    tc=nt.nodes.new('ShaderNodeTexCoord');mapping=nt.nodes.new('ShaderNodeMapping')
    mapping.inputs['Scale'].default_value=(1.3,1.3,1.3);nt.links.new(tc.outputs['Generated'],mapping.inputs['Vector'])
    def tex(fn,non=False):
        n=nt.nodes.new('ShaderNodeTexImage');n.image=bpy.data.images.load(os.path.join(TEX,fn),check_existing=True);n.projection='BOX';n.projection_blend=.16
        if non:n.image.colorspace_settings.name='Non-Color'
        nt.links.new(mapping.outputs['Vector'],n.inputs['Vector']);return n
    c=tex('metal_floor_plate__DiamondPlate008C_1K_Color.jpg');r=tex('metal_floor_plate__DiamondPlate008C_1K_Roughness.jpg',True);n=tex('metal_floor_plate__DiamondPlate008C_1K_NormalGL.jpg',True)
    mix=nt.nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1;mix.inputs[2].default_value=(.43,.45,.42,1);nt.links.new(c.outputs['Color'],mix.inputs[1]);nt.links.new(mix.outputs['Color'],bsdf.inputs['Base Color'])
    nm=nt.nodes.new('ShaderNodeNormalMap');nm.inputs['Strength'].default_value=.72;nt.links.new(n.outputs['Color'],nm.inputs['Color']);nt.links.new(nm.outputs['Normal'],bsdf.inputs['Normal']);nt.links.new(r.outputs['Color'],bsdf.inputs['Roughness']);bsdf.inputs['Metallic'].default_value=.58
    return m


def smooth(o):
    if o.type=='MESH':
        for p in o.data.polygons:p.use_smooth=True


def bevel(o,width=.03,segments=2):
    if o.type!='MESH' or width<=0:return o
    mod=o.modifiers.new('V5_Bevel','BEVEL');mod.width=width;mod.segments=segments;mod.limit_method='ANGLE';bpy.context.view_layer.objects.active=o
    try:bpy.ops.object.modifier_apply(modifier=mod.name)
    except Exception:pass
    smooth(o);return o


def box(name,loc,dims,material,rot=(0,0,0),edge=.03):
    bpy.ops.mesh.primitive_cube_add(location=loc,rotation=rot);o=bpy.context.object;o.name=name;o.dimensions=dims;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(material);bevel(o,edge,3);return o


def cyl(name,loc,radius,depth,material,rot=(0,0,0),verts=24,edge=.008):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts,radius=radius,depth=depth,location=loc,rotation=rot);o=bpy.context.object;o.name=name;o.data.materials.append(material);bevel(o,edge,2);return o


def sphere(name,loc,radius,material,scale=(1,1,1)):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=12,radius=radius,location=loc);o=bpy.context.object;o.name=name;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(material);smooth(o);return o


def torus(name,loc,major,minor,material,rot=(0,0,0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=major,minor_radius=minor,major_segments=40,minor_segments=12,location=loc,rotation=rot);o=bpy.context.object;o.name=name;o.data.materials.append(material);smooth(o);return o


def between(name,a,b,radius,material,verts=14):
    a,b=Vector(a),Vector(b);d=b-a;bpy.ops.mesh.primitive_cylinder_add(vertices=verts,radius=radius,depth=d.length,location=(a+b)*.5);o=bpy.context.object;o.name=name;o.rotation_mode='QUATERNION';o.rotation_quaternion=d.to_track_quat('Z','Y');o.rotation_mode='XYZ';o.data.materials.append(material);smooth(o);return o


def pipe(name,pts,radius,material):
    c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.resolution_u=2;c.bevel_depth=radius;c.bevel_resolution=3;s=c.splines.new('POLY');s.points.add(len(pts)-1)
    for i,p in enumerate(pts):s.points[i].co=(*p,1)
    o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);o.data.materials.append(material);return o


def text_obj(name,text,loc,size,material,rot=(math.pi/2,0,0),extrude=.004):
    bpy.ops.object.text_add(location=loc,rotation=rot);o=bpy.context.object;o.name=name;o.data.body=text;o.data.align_x='CENTER';o.data.align_y='CENTER';o.data.size=size;o.data.extrude=extrude;o.data.bevel_depth=.0015;o.data.materials.append(material);bpy.ops.object.convert(target='MESH');return o


def button(name,loc,material,r=.021,rot=(0,math.pi/2,0)):
    return cyl(name,loc,r,.024,material,rot=rot,verts=14,edge=.003)


def add_arch_shell():
    # Concrete tunnel: 13m wide, 15m deep, clear central circulation.
    half=6.45;wall=2.45;arch=1.72;y0=-7.50;y1=7.50
    pts=[(-half,.02),(-half,wall)]
    for i in range(25):
        t=math.pi-math.pi*i/24;pts.append((half*math.cos(t),wall+arch*math.sin(t)))
    pts.append((half,.02))
    verts=[];faces=[]
    for y in (y0,y1):
        for x,z in pts:verts.append((x,y,z))
    n=len(pts)
    for i in range(n-1):faces.append((i,n+i,n+i+1,i+1))
    me=bpy.data.meshes.new('ShelterShellMesh');me.from_pydata(verts,[],faces);me.update();o=bpy.data.objects.new('Shelter47_ConcreteShell',me);bpy.context.collection.objects.link(o);o.data.materials.append(CONCRETE)
    sol=o.modifiers.new('ShellThickness','SOLIDIFY');sol.thickness=.28;sol.offset=1;bpy.context.view_layer.objects.active=o
    try:bpy.ops.object.modifier_apply(modifier=sol.name)
    except Exception:pass


def add_arch_rib(y,i):
    pts=[]
    for k in range(25):
        t=math.pi-math.pi*k/24;pts.append((6.30*math.cos(t),y,2.43+1.64*math.sin(t)))
    pipe('StructuralRib_%02d'%i,pts,.052,STEEL_DARK)


def add_floor_and_walls():
    box('Floor',(0,0,-.11),(13.15,15.15,.22),CONCRETE,edge=.015)
    box('Central_Service_Walkway',(0,-.25,.025),(2.05,12.6,.06),PLATE,edge=.008)
    # Front wall made around the door opening.
    box('FrontWall_Left',(-4.35,-7.48,1.55),(4.30,.35,3.10),CONCRETE,edge=.025)
    box('FrontWall_Right',(4.35,-7.48,1.55),(4.30,.35,3.10),CONCRETE,edge=.025)
    box('FrontWall_Header',(0,-7.48,3.45),(4.45,.35,1.45),CONCRETE,edge=.025)
    box('RearWall',(0,7.48,1.78),(12.9,.35,3.56),CONCRETE,edge=.025)
    # faded lower wall coating like real civil-defence facilities
    box('Left_LowerPaint',(-6.30,0,1.05),(.045,14.1,2.0),LOWER_WALL,edge=.008)
    box('Right_LowerPaint',(6.30,0,1.05),(.045,14.1,2.0),LOWER_WALL,edge=.008)
    # drain channel on left
    box('DrainChannel',(-5.72,.0,.025),(.72,12.7,.045),STEEL_DARK,edge=.005)
    for i in range(41):box('DrainGrate_%02d'%i,(-5.72,-6.0+i*.30,.075),(.60,.045,.035),STEEL2,edge=.003)
    # hazard threshold
    for i in range(10):
        x=-1.80+i*.40;matv=HAZARD_YELLOW if i%2==0 else STEEL_DARK
        box('DoorHazard_%02d'%i,(x,-6.55,.055),(.34,.82,.025),matv,rot=(0,0,math.radians(28)),edge=.002)
    # floor grime patches
    stains=[(-4.4,-4.8,1.3,.5),(3.6,4.4,.9,.35),(1.5,-1.0,1.25,.32),(-2.2,5.5,.7,.25),(4.5,-5.4,.8,.3)]
    for i,(x,y,sx,sy) in enumerate(stains):
        bpy.ops.mesh.primitive_circle_add(vertices=32,radius=1,fill_type='NGON',location=(x,y,.015));o=bpy.context.object;o.name='FloorStain_%02d'%i;o.scale=(sx,sy,1);o.data.materials.append(STAIN)


def add_services():
    for i,y in enumerate([-6.35,-4.35,-2.35,-.35,1.65,3.65,5.65]):add_arch_rib(y,i)
    # cable trays at shoulders of vault
    for x in (-5.45,5.45):
        box('CableTray',(x,0,3.05),(.34,12.8,.10),STEEL_DARK,edge=.018)
        for i in range(19):box('TrayRung',(x,-5.8+i*.64,3.09),(.48,.055,.045),STEEL2,edge=.004)
    # overhead utility lines
    pipe('WaterMain',[(-5.95,-6.3,2.58),(-5.95,5.8,2.58),(-4.8,6.75,2.58)],.055,PIPE_GREEN)
    pipe('SteamMain',[(5.92,-6.0,2.75),(5.92,5.2,2.75),(4.8,6.40,2.75)],.072,STEEL2)
    pipe('EmergencyLine',[(-5.65,-5.8,2.90),(-5.65,4.9,2.90)],.034,PIPE_RED)
    # exposed wall conduits / boxes
    for y in (-5.5,-1.6,2.6,5.6):
        box('JunctionBox_R',(6.12,y,1.70),(.22,.34,.42),PAINT_GREY,edge=.035)
        pipe('Conduit_R',[(6.10,y,1.90),(6.10,y,2.48),(5.70,y,2.90)],.018,STEEL2)
    for y in (-4.6,.4,4.6):
        box('JunctionBox_L',(-6.12,y,1.72),(.22,.34,.38),PAINT_GREY,edge=.035)
        pipe('Conduit_L',[(-6.10,y,1.90),(-6.10,y,2.40),(-5.70,y,2.78)],.018,STEEL2)
    # valves
    for x,y,z in [(-5.95,-4.5,2.58),(5.92,-1.2,2.75),(-5.95,3.2,2.58)]:
        torus('ValveWheel',(x,y,z),.14,.018,VALVE_RED,rot=(math.pi/2,0,0))
        cyl('ValveHub',(x,y,z),.035,.06,STEEL2,rot=(math.pi/2,0,0),verts=16,edge=.003)


def add_practical_lighting():
    # Two rows of industrial fluorescent fixtures; even readable light, not spotty horror lighting.
    fixtures=[(-2.25,-5.0), (2.25,-5.0), (-2.25,-1.7),(2.25,-1.7),(-2.25,1.7),(2.25,1.7),(-2.25,5.0),(2.25,5.0)]
    for i,(x,y) in enumerate(fixtures):
        box('FluoroHousing_%02d'%i,(x,y,3.60),(1.35,.38,.16),PAINT_OFFWHITE,edge=.045)
        box('FluoroLens_%02d'%i,(x,y,3.50),(1.13,.25,.035),LAMP,edge=.022)
        # cage bars
        for dx in (-.48,-.24,0,.24,.48):box('LightGuard',(x+dx,y,3.45),(.018,.32,.018),STEEL_DARK,edge=.003)
        ld=bpy.data.lights.new('FluoroLight_%02d'%i,'AREA');ld.energy=92;ld.shape='RECTANGLE';ld.size=1.5;ld.size_y=.75;ld.color=(.88,.94,.90)
        lo=bpy.data.objects.new('FluoroLight_%02d'%i,ld);bpy.context.collection.objects.link(lo);lo.location=(x,y,3.38)
    # broad low-energy bounce, only enough to reveal room structure
    ld=bpy.data.lights.new('RoomBounce','AREA');ld.energy=34;ld.shape='RECTANGLE';ld.size=8;ld.size_y=7;ld.color=(.70,.75,.68);lo=bpy.data.objects.new('RoomBounce',ld);bpy.context.collection.objects.link(lo);lo.location=(0,1.0,3.55)
    # warm door/service accent
    ld=bpy.data.lights.new('DoorAmber','POINT');ld.energy=22;ld.color=(1.0,.30,.08);ld.shadow_soft_size=.4;lo=bpy.data.objects.new('DoorAmber',ld);bpy.context.collection.objects.link(lo);lo.location=(-2.0,-6.5,2.05)


def gauge(name,loc,rot=(0,math.pi/2,0)):
    cyl(name+'_Bezel',loc,.115,.030,GAUGE_BEZEL,rot=rot,verts=28,edge=.004)
    # face offset toward aisle (-X on right wall)
    face=(loc[0]-.020,loc[1],loc[2])
    cyl(name+'_Face',face,.088,.010,GAUGE_FACE,rot=rot,verts=28,edge=.002)
    between(name+'_Needle',(loc[0]-.032,loc[1],loc[2]),(loc[0]-.035,loc[1]+.035,loc[2]+.058),.006,NEEDLE,8)


def add_operations_wall():
    # Right wall. Dense analogue console banks, kept out of central aisle.
    box('Operations_Cabinet',(5.72,-.65,1.45),(1.02,5.55,2.82),PAINT_GREY,edge=.10)
    text_obj('Operations_Label','SHELTER 47  /  SYSTEMS CONTROL',(5.16,-.65,2.68),.12,LABEL,rot=(math.pi/2,0,math.pi/2),extrude=.003)
    module_ys=[-2.65,-1.35,-.05,1.25]
    for m,y in enumerate(module_ys):
        box('Ops_Module_%d'%m,(5.14,y,1.48),(.15,1.12,1.68),OLIVE if m%2 else PAINT_GREY,edge=.055)
        gauge('Gauge_%d_A'%m,(5.045,y-.23,1.84));gauge('Gauge_%d_B'%m,(5.045,y+.23,1.84))
        for r in range(4):
            for c in range(4):
                matv=GREEN_LED if (r+c+m)%5 else AMBER_LED
                button('OpsLight',(5.045,y-.30+c*.20,1.23+r*.13),matv,r=.018)
        for k in range(3):
            # toggle switch
            cyl('ToggleStem',(5.00,y-.25+k*.25,1.02),.012,.095,STEEL2,rot=(0,math.radians(70),0),verts=10,edge=.002)
    # emergency field phone
    box('FieldPhone',(5.02,2.20,1.40),(.24,.54,.72),OLIVE,edge=.065)
    torus('FieldPhoneHandset',(4.87,2.20,1.52),.18,.045,RUBBER,rot=(0,math.pi/2,0))
    # operator stool
    add_chair((4.10,-.8,0),'OpsChair',rot_z=math.radians(90),simple=True)


def add_cctv_station():
    # Left wall, faces +X toward aisle. Nothing sits in the central path.
    box('CCTV_Console',(-5.55,-1.65,.70),(1.35,3.60,1.32),PAINT_GREY,edge=.10)
    box('CCTV_Desk',(-4.83,-1.65,1.18),(.78,3.35,.16),STEEL,edge=.045)
    monitor_ys=[-2.75,-1.65,-.55]
    for i,y in enumerate(monitor_ys):
        box('CCTV_Housing_%d'%i,(-5.72,y,2.02),(.26,.96,.70),DARK,edge=.075)
        box('CCTV_Screen_%d'%i,(-5.56,y,2.02),(.035,.78,.54),SCREEN,edge=.018)
        button('CCTV_LED_%d'%i,(-5.535,y+.32,1.76),GREEN_LED,r=.016)
    # fourth smaller monitor above center
    box('CCTV_Housing_3',(-5.72,-1.65,2.78),(.26,.98,.58),DARK,edge=.07)
    box('CCTV_Screen_3',(-5.56,-1.65,2.78),(.035,.80,.44),SCREEN,edge=.016)
    # controls on desk
    for i in range(9):button('CCTV_Key',(-4.41,-2.55+i*.22,1.26),AMBER_LED if i in (2,7) else STEEL2,r=.021)
    cyl('PTZ_Stick',(-4.40,-.72,1.42),.035,.28,RUBBER,verts=18,edge=.005);sphere('PTZ_Grip',(-4.40,-.72,1.60),.075,RUBBER,scale=(1,1,1.15))
    add_chair((-3.95,-1.65,0),'CCTV_Chair',rot_z=math.radians(-90))


def add_chair(loc,name,rot_z=0,simple=False):
    x,y,z=loc
    cyl(name+'_Post',(x,y,.48),.045,.58,STEEL_DARK,verts=16,edge=.005)
    cyl(name+'_BaseHub',(x,y,.20),.09,.10,STEEL_DARK,verts=18,edge=.006)
    for a in range(0,360,72):
        ang=math.radians(a);between(name+'_Leg',(x,y,.18),(x+.34*math.cos(ang),y+.34*math.sin(ang),.08),.025,STEEL_DARK,10)
        sphere(name+'_Caster',(x+.35*math.cos(ang),y+.35*math.sin(ang),.065),.045,RUBBER,scale=(1,.7,.7))
    box(name+'_Seat',(x,y,.86),(.72,.72,.16),VINYL,rot=(0,0,rot_z),edge=.10)
    if not simple:
        box(name+'_Back',(x-.19*math.cos(rot_z),y-.19*math.sin(rot_z),1.37),(.70,.16,.76),VINYL,rot=(0,0,rot_z),edge=.11)


def add_comms_desk():
    # Rear-right desk, rotated conceptually toward centre, not in spawn path.
    box('CommsDesk',(4.45,4.45,.72),(1.65,3.05,1.24),STEEL_DARK,edge=.07)
    box('CommsTop',(3.95,4.45,1.38),(.80,3.10,.12),WOOD,edge=.055)
    # computer on side wall, screen faces centre (-X)
    box('Computer_Housing',(4.72,3.88,1.98),(.38,1.28,.92),DARK,edge=.075)
    box('Computer_Screen',(4.50,3.88,1.98),(.035,1.08,.72),SCREEN,edge=.018)
    # keyboard on desk plane
    box('Keyboard',(3.50,3.88,1.53),(.62,1.18,.08),DARK,rot=(0,math.radians(-7),0),edge=.025)
    # radio
    box('Radio_Body',(3.52,5.05,1.72),(.58,1.00,.56),OLIVE,edge=.07)
    box('Radio_Display',(3.18,4.80,1.82),(.035,.38,.18),AMBER_SCREEN,edge=.012)
    for i in range(3):cyl('RadioKnob',(3.17,5.03+i*.22,1.68),.06,.035,DARK,rot=(0,math.pi/2,0),verts=20,edge=.005)
    pipe('RadioAntenna',[(3.55,5.40,1.95),(3.68,5.45,2.90)],.011,STEEL2)
    add_chair((2.95,4.2,0),'CommsChair',rot_z=math.radians(-90))
    # papers/maps on desk
    for i in range(4):box('Paper_%d'%i,(3.46,3.25+i*.28,1.49),(.02,.22,.31),PAPER,rot=(0,math.radians(90),math.radians((i-1.5)*4)),edge=.002)


def add_bunk_and_storage():
    # One compact two-tier bunker bunk, more authentic and less toy-like than slab beds.
    x=-5.0;y=5.0
    for z in (.58,1.76):
        # frame rails
        for dx in (-.38,.38):between('BunkRail',(x+dx,y-1.02,z),(x+dx,y+1.02,z),.028,STEEL_DARK,12)
        for dy in (-1.02,1.02):between('BunkEnd',(x-.38,y+dy,z),(x+.38,y+dy,z),.028,STEEL_DARK,12)
        box('BunkMattress',(x,y,z+.10),(.72,1.92,.16),CANVAS,edge=.08)
        box('BunkBlanket',(x,y+.30,z+.21),(.66,1.10,.06),OLIVE,edge=.05)
        box('BunkPillow',(x,y-.70,z+.23),(.55,.36,.10),FABRIC,edge=.07)
    for dx in (-.38,.38):
        for dy in (-1.02,1.02):between('BunkPost',(x+dx,y+dy,.18),(x+dx,y+dy,2.05),.032,STEEL_DARK,12)
    # small ladder
    for yy in (4.25,4.65,5.05,5.45):between('BunkLadderRung',(-4.50,yy,.42),(-4.50,yy,.95),.022,STEEL2,10)
    # Rear-wall lockers and ration shelving, not floating.
    for i in range(4):
        xx=-2.55+i*.82
        box('Locker_%d'%i,(xx,6.95,1.03),(.72,.58,2.00),PAINT_GREY,edge=.045)
        box('LockerDoor_%d'%i,(xx,6.64,1.05),(.62,.025,1.82),LOWER_WALL,edge=.018)
        button('LockerHandle_%d'%i,(xx+.22,6.61,1.04),STEEL_DARK,r=.018,rot=(math.pi/2,0,0))
    # ration shelf right of lockers
    for zz in (.48,1.12,1.76):box('RationShelf',(1.40,6.72,zz),(2.30,.52,.07),STEEL_DARK,edge=.015)
    for i in range(12):
        xx=.55+(i%4)*.42;zz=.63+(i//4)*.64
        box('RationBox_%02d'%i,(xx,6.40,zz),(.30,.30,.28),TIN_RED if i%4==0 else TIN,edge=.025)
    text_obj('RationsLabel','RATIONS / WATER',(1.4,6.37,2.12),.10,LABEL,rot=(math.pi/2,0,0),extrude=.003)


def add_generator_and_filters():
    # Front-right, leaving door approach clear.
    x=4.55;y=-5.25
    box('Generator_Body',(x,y,.76),(2.20,1.45,1.42),OLIVE,edge=.12)
    box('Generator_Vent',(x,y+.76,.82),(1.78,.05,.58),DARK,edge=.015)
    for i in range(8):box('GenVent',(x-.72+i*.20,y+.80,.82),(.045,.025,.46),STEEL2,edge=.004)
    box('Generator_Control',(x-.45,y+.79,1.39),(.72,.035,.38),DARK,edge=.022)
    for i,m in enumerate((GREEN_LED,GREEN_LED,AMBER_LED,RED_LED)):button('GeneratorLED',(x-.72+i*.18,y+.815,1.43),m,r=.022,rot=(math.pi/2,0,0))
    pipe('GeneratorExhaust',[(5.20,-5.25,1.40),(5.65,-5.25,1.40),(5.65,-5.25,2.82),(4.75,-5.25,2.82)],.085,STEEL_DARK)
    # filter cylinders tucked along right wall
    for i in range(3):
        yy=-3.95+i*.70;cyl('AirFilter_%d'%i,(5.78,yy,.75),.25,1.38,STEEL2,verts=24,edge=.015)
        pipe('FilterLine_%d'%i,[(5.78,yy,1.45),(6.02,yy,1.45),(6.02,-3.10,2.50)],.050,STEEL_DARK)
    text_obj('PowerAirLabel','POWER  /  AIR',(4.55,-4.48,1.84),.10,LABEL,rot=(math.pi/2,0,0),extrude=.003)


def build_rifle(parent_loc,name='Hunting_Rifle'):
    x,y,z=parent_loc
    root=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(root)
    parts=[
        box(name+'_Stock',(x-.48,y,z),(.68,.15,.18),WOOD,edge=.045),
        box(name+'_Receiver',(x,y,z+.01),(.54,.16,.19),STEEL_DARK,edge=.032),
        cyl(name+'_Barrel',(x+.58,y,z+.03),.031,.98,STEEL_DARK,rot=(0,math.pi/2,0),verts=24,edge=.004),
        cyl(name+'_Muzzle',(x+1.07,y,z+.03),.044,.13,DARK,rot=(0,math.pi/2,0),verts=20,edge=.005),
        box(name+'_Grip',(x-.06,y,z-.20),(.16,.13,.38),WOOD,rot=(0,math.radians(12),0),edge=.032),
        cyl(name+'_Scope',(x+.12,y,z+.24),.052,.48,DARK,rot=(0,math.pi/2,0),verts=22,edge=.005),
    ]
    for p in parts:
        mw=p.matrix_world.copy();p.parent=root;p.matrix_world=mw
    return root


def add_vault():
    # Front-left, recessed and clearly floor-contacting.
    x=-5.82;y=-4.85
    box('GunVault_Body',(x,y,1.38),(1.02,1.52,2.72),STEEL_DARK,edge=.085)
    box('GunVault_Interior',(x+.15,y,1.38),(.70,1.30,2.43),OLIVE,edge=.045)
    door=box('GunVault_Door',(x+.58,y-.69,1.38),(.10,1.36,2.50),STEEL,edge=.06)
    box('Vault_Keypad',(x+.65,y-.91,1.60),(.08,.18,.44),DARK,edge=.020)
    for r in range(4):
        for c in range(3):button('VaultKey',(x+.70,y-.95+.05*c,1.44+.10*r),AMBER_LED,r=.012)
    rifle=build_rifle((x+.15,y,1.55),'Rifle_Display')
    rifle.rotation_euler=(0,math.radians(90),math.radians(3))
    text_obj('ArmoryLabel','ARMORY',(x+.68,y,2.55),.10,LABEL,rot=(0,math.pi/2,math.pi/2),extrude=.003)
    return door,rifle


def add_blast_door():
    y=-7.30
    torus('BlastDoor_FrameOuter',(0,y,1.55),1.70,.14,STEEL_DARK,rot=(math.pi/2,0,0))
    torus('BlastDoor_FrameInner',(0,y+.04,1.55),1.49,.09,STEEL2,rot=(math.pi/2,0,0))
    door=cyl('BlastDoor_Door',(0,y+.12,1.55),1.46,.28,BLAST_RED,rot=(math.pi/2,0,0),verts=64,edge=.03)
    # radial ribs and locking dogs
    for a in range(0,360,45):
        ang=math.radians(a)
        between('BlastDoor_Rib',(0,y-.04,1.55),(.94*math.cos(ang),y-.04,1.55+.94*math.sin(ang)),.040,STEEL_DARK,12)
        x=1.23*math.cos(ang);z=1.55+1.23*math.sin(ang);box('LockDog',(x,y-.10,z),(.24,.12,.12),STEEL2,rot=(0,ang,0),edge=.015)
    wheel=torus('BlastDoor_Wheel',(0,y-.18,1.55),.50,.045,STEEL2,rot=(math.pi/2,0,0))
    for a in range(0,360,60):
        ang=math.radians(a);between('WheelSpoke',(0,y-.19,1.55),(.46*math.cos(ang),y-.19,1.55+.46*math.sin(ang)),.021,STEEL2,10)
    cyl('WheelHub',(0,y-.20,1.55),.10,.09,STEEL_DARK,rot=(math.pi/2,0,0),verts=20,edge=.006)
    for z in (1.0,2.10):
        box('DoorHinge',(1.58,y+.12,z),(.26,.34,.38),STEEL_DARK,edge=.035);cyl('HingePin',(1.73,y+.12,z),.065,.48,STEEL2,verts=18,edge=.005)
    text_obj('DoorStencil','SHELTER 47',(0,y-.34,2.55),.17,LABEL,rot=(math.pi/2,0,0),extrude=.003)
    # wall access control
    panel=box('Surface_Access_Panel',(-2.15,-7.12,1.36),(.50,.18,.76),PAINT_GREY,edge=.04)
    box('AccessDisplay',(-2.15,-7.23,1.53),(.34,.025,.18),GREEN_LED,edge=.010);button('AccessButton',(-2.15,-7.24,1.17),RED_LED,r=.050,rot=(math.pi/2,0,0));text_obj('AccessLabel','SURFACE',(-2.15,-7.26,1.78),.060,LABEL,rot=(math.pi/2,0,0),extrude=.002)
    return door,wheel,panel


def add_clutter_and_survival_detail():
    # crates / cans around walls only
    for i,(x,y,z) in enumerate([(2.7,6.0,.32),(3.35,6.0,.32),(5.3,2.8,.32),(-4.35,2.55,.32),(-5.05,2.60,.32)]):
        box('SupplyCrate_%02d'%i,(x,y,z),(.58,.52,.58),OLIVE,edge=.05);box('CrateBand_%02d'%i,(x,y,z),(.62,.06,.62),STEEL_DARK,edge=.010)
    for i,(x,y) in enumerate([(5.7,2.0),(5.72,2.55),(-5.55,2.3)]):
        box('JerryCan_%d'%i,(x,y,.36),(.32,.22,.66),OLIVE,edge=.045);torus('JerryHandle_%d'%i,(x,y,.72),.09,.020,STEEL_DARK,rot=(math.pi/2,0,0))
    # first aid cabinet / extinguisher / wall chart
    box('FirstAidCabinet',(-6.04,1.55,1.65),(.18,.55,.72),PAINT_OFFWHITE,edge=.04);text_obj('FirstAidCross','+',(-5.93,1.27,1.66),.22,RED_LED,rot=(0,math.pi/2,0),extrude=.005)
    cyl('Extinguisher',(5.96,2.25,.70),.13,.82,BLAST_RED,verts=24,edge=.012);torus('ExtinguisherHandle',(5.96,2.25,1.16),.10,.020,STEEL_DARK)
    box('StatusBoard',(0,7.26,2.00),(2.60,.09,1.20),PAINT_OFFWHITE,edge=.04);text_obj('StatusTitle','SHELTER STATUS',(0,7.20,2.35),.11,DARK,rot=(math.pi/2,0,0),extrude=.003)
    for i,t in enumerate(['POWER 87%','WATER 19 DAYS','AIR 71%','FOOD 8 DAYS']):text_obj('Status_%d'%i,t,(0,7.18,2.16-i*.20),.075,DARK,rot=(math.pi/2,0,0),extrude=.002)
    # wall stencils and survivor notes
    text_obj('RearStencil','SHELTER 47  /  CIVIL DEFENCE',(-3.75,7.22,2.90),.15,LABEL,rot=(math.pi/2,0,0),extrude=.003)
    text_obj('DoorWarning','KEEP ACCESS CLEAR',(0,-6.90,.20),.10,HAZARD_YELLOW,rot=(0,0,0),extrude=.002)


def add_camera(name,loc,target,lens):
    d=bpy.data.cameras.new(name);d.lens=lens;d.sensor_width=36;d.clip_start=.05;d.clip_end=100;o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector(target)-Vector(loc)).to_track_quat('-Z','Y').to_euler();return o


def render_qa():
    sc=bpy.context.scene;sc.render.resolution_x=1280;sc.render.resolution_y=720;sc.render.resolution_percentage=100;sc.render.image_settings.file_format='PNG'
    views={
      '01_spawn':((0,5.70,1.67),(0,-4.80,1.55),26),
      '02_blast_door':((0,-2.25,1.72),(0,-7.25,1.55),28),
      '03_operations':((.20,-.65,1.75),(5.20,-.65,1.50),25),
      '04_living':((.15,3.25,1.78),(-5.00,5.10,1.18),27),
      '05_overview':((0,5.70,3.35),(0,-1.80,1.20),23),
      '06_cctv':((-.30,-1.65,1.72),(-5.05,-1.65,1.70),27),
      '07_comms':((1.10,4.25,1.75),(4.25,4.20,1.70),29),
    }
    for name,(loc,target,lens) in views.items():
        cam=add_camera('QA_'+name,loc,target,lens);sc.camera=cam;sc.render.filepath=os.path.join(QA,name+'.png');bpy.ops.render.render(write_still=True)


def export_glb():
    path=os.path.join(OUT,'shelter47_room_v5.glb')
    kwargs=dict(filepath=path,export_format='GLB',use_selection=False,export_apply=True)
    props=bpy.ops.export_scene.gltf.get_rna_type().properties.keys()
    if 'export_lights' in props:kwargs['export_lights']=True
    bpy.ops.export_scene.gltf(**kwargs);print('EXPORTED',path)


# MATERIALS
clear_scene()
CONCRETE=procedural_concrete('V5_AgedConcrete',(.30,.29,.26),(.15,.16,.15))
PLATE=plate_material()
STEEL=mat('V5_WornSteel',(.30,.32,.30),.72,.40)
STEEL2=mat('V5_Galvanized',(.44,.46,.43),.58,.48)
STEEL_DARK=mat('V5_DarkSteel',(.085,.095,.090),.74,.45)
PAINT_GREY=worn_paint('V5_GreyPaint',(.24,.26,.23),(.39,.40,.35),.18,.64,6)
PAINT_OFFWHITE=worn_paint('V5_OffWhite',(.40,.40,.34),(.57,.56,.48),.08,.68,5)
LOWER_WALL=worn_paint('V5_LowerWall',(.17,.23,.17),(.25,.29,.22),.04,.78,4)
OLIVE=worn_paint('V5_FadedOlive',(.10,.15,.075),(.22,.27,.15),.12,.72,8)
BLAST_RED=worn_paint('V5_BlastRed',(.20,.035,.025),(.38,.07,.045),.32,.56,7)
WOOD=worn_paint('V5_DarkWood',(.10,.038,.016),(.25,.095,.035),0,.70,5)
RUBBER=mat('V5_Rubber',(.018,.022,.019),0,.94)
VINYL=mat('V5_Vinyl',(.09,.12,.09),0,.82)
CANVAS=worn_paint('V5_Canvas',(.16,.20,.13),(.28,.32,.20),0,.92,10)
FABRIC=mat('V5_Fabric',(.28,.28,.24),0,.95)
PAPER=mat('V5_Paper',(.58,.56,.46),0,.88)
LABEL=mat('V5_Label',(.66,.65,.56),0,.76)
DARK=mat('V5_BlackHardware',(.028,.034,.030),.30,.80)
GAUGE_BEZEL=mat('V5_GaugeBezel',(.10,.11,.10),.64,.36)
GAUGE_FACE=mat('V5_GaugeFace',(.06,.065,.055),0,.82)
NEEDLE=mat('V5_Needle',(.75,.72,.58),.10,.50)
SCREEN=mat('V5_CRT',(.012,.035,.018),0,.30,(.06,.50,.18),1.7)
AMBER_SCREEN=mat('V5_AmberCRT',(.08,.025,.004),0,.30,(.85,.18,.018),1.8)
GREEN_LED=mat('V5_GreenLED',(.02,.07,.025),0,.25,(.08,.72,.16),3.0)
AMBER_LED=mat('V5_AmberLED',(.09,.030,.004),0,.25,(.90,.24,.015),3.0)
RED_LED=mat('V5_RedLED',(.10,.012,.006),0,.25,(.90,.04,.015),2.6)
HAZARD_YELLOW=mat('V5_HazardYellow',(.52,.36,.045),.10,.66)
VALVE_RED=mat('V5_ValveRed',(.38,.045,.03),.38,.56)
PIPE_GREEN=mat('V5_PipeGreen',(.08,.23,.12),.34,.56)
PIPE_RED=mat('V5_PipeRed',(.35,.045,.03),.30,.58)
TIN=mat('V5_Tin',(.34,.35,.31),.45,.46)
TIN_RED=mat('V5_RedTin',(.32,.055,.035),.22,.60)
STAIN=mat('V5_Stain',(.028,.020,.014),0,.30,alpha=.58)
LAMP=mat('V5_FluoroLens',(.48,.53,.48),0,.30,(.72,.90,.78),2.5)

# BUILD ONE ROOM
add_arch_shell();add_floor_and_walls();add_services();add_practical_lighting();add_operations_wall();add_cctv_station();add_comms_desk();add_bunk_and_storage();add_generator_and_filters();add_vault();add_blast_door();add_clutter_and_survival_detail()

scene=bpy.context.scene
try:scene.render.engine='BLENDER_EEVEE_NEXT'
except Exception:scene.render.engine='BLENDER_EEVEE'
scene.render.resolution_x=1280;scene.render.resolution_y=720;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.world.color=(.012,.014,.012)
try:scene.view_settings.look='AgX - Medium High Contrast'
except Exception:
    try:scene.view_settings.look='Medium High Contrast'
    except Exception:pass
scene.view_settings.exposure=-.15;scene.view_settings.gamma=1.0

render_qa();export_glb();print('Shelter 47 V5 complete')

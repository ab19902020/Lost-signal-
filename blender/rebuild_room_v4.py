import bpy
import math
import os
from mathutils import Vector

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'assets', 'blender')
QA = os.path.join(ROOT, 'qa', 'renders', 'v4')
TEX = os.path.join(ROOT, 'public', 'assets', 'textures')
os.makedirs(OUT, exist_ok=True)
os.makedirs(QA, exist_ok=True)

# -----------------------------------------------------------------------------
# Shelter 47 V4
# Reference direction: real Cold War bunker / emergency shelter, post-collapse.
# IMPORTANT: Blender uses X width, Y depth, Z height. GLTF exporter handles the
# conversion to Three.js Y-up. All placement is authored here, never in Three.js.
# -----------------------------------------------------------------------------


def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for datablocks in (bpy.data.meshes, bpy.data.curves, bpy.data.materials, bpy.data.cameras, bpy.data.lights):
        pass


def principled(name, color, metallic=0.0, roughness=0.6, emission=None, emission_strength=0.0, alpha=1.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color, 1.0)
    if 'Metallic' in bsdf.inputs:
        bsdf.inputs['Metallic'].default_value = metallic
    if 'Roughness' in bsdf.inputs:
        bsdf.inputs['Roughness'].default_value = roughness
    if alpha < 1.0:
        bsdf.inputs['Alpha'].default_value = alpha
        m.blend_method = 'BLEND'
        m.use_screen_refraction = False
        m.show_transparent_back = False
    if emission:
        for key in ('Emission Color', 'Emission'):
            if key in bsdf.inputs:
                bsdf.inputs[key].default_value = (*emission, 1.0)
                break
        if 'Emission Strength' in bsdf.inputs:
            bsdf.inputs['Emission Strength'].default_value = emission_strength
    return m


def image_texture_material(name, color_file, rough_file=None, normal_file=None, tint=(1,1,1,1), roughness=.8, metallic=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = tint
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = metallic

    def img_node(path, label, noncolor=False):
        im = bpy.data.images.load(path, check_existing=True)
        if noncolor:
            im.colorspace_settings.name = 'Non-Color'
        n = nt.nodes.new('ShaderNodeTexImage')
        n.image = im
        n.label = label
        return n

    c = img_node(os.path.join(TEX, color_file), 'BaseColor')
    nt.links.new(c.outputs['Color'], bsdf.inputs['Base Color'])
    if rough_file:
        r = img_node(os.path.join(TEX, rough_file), 'Roughness', True)
        nt.links.new(r.outputs['Color'], bsdf.inputs['Roughness'])
    if normal_file:
        n = img_node(os.path.join(TEX, normal_file), 'Normal', True)
        nm = nt.nodes.new('ShaderNodeNormalMap')
        nm.inputs['Strength'].default_value = .65
        nt.links.new(n.outputs['Color'], nm.inputs['Color'])
        nt.links.new(nm.outputs['Normal'], bsdf.inputs['Normal'])
    return m


def set_active(obj):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)


def apply_bevel(obj, width=.04, segments=3):
    if not obj or obj.type != 'MESH':
        return obj
    mod = obj.modifiers.new('V4_Bevel', 'BEVEL')
    mod.width = width
    mod.segments = segments
    mod.limit_method = 'ANGLE'
    bpy.context.view_layer.objects.active = obj
    try:
        bpy.ops.object.modifier_apply(modifier=mod.name)
    except Exception:
        pass
    for p in obj.data.polygons:
        p.use_smooth = True
    return obj


def smart_uv(obj):
    if obj.type != 'MESH':
        return
    bpy.ops.object.select_all(action='DESELECT')
    set_active(obj)
    try:
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.uv.smart_project(angle_limit=1.15192, island_margin=.02)
        bpy.ops.object.mode_set(mode='OBJECT')
    except Exception:
        try:
            bpy.ops.object.mode_set(mode='OBJECT')
        except Exception:
            pass


def box(name, loc, dims, material, rot=(0,0,0), bevel=.04, uv=False):
    bpy.ops.mesh.primitive_cube_add(location=loc, rotation=rot)
    o = bpy.context.object
    o.name = name
    o.dimensions = dims
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if material:
        o.data.materials.append(material)
    if bevel:
        apply_bevel(o, bevel, 3)
    if uv:
        smart_uv(o)
    return o


def cyl(name, loc, radius, depth, material, rot=(0,0,0), verts=32, bevel=.012):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=depth, location=loc, rotation=rot)
    o = bpy.context.object
    o.name = name
    if material:
        o.data.materials.append(material)
    if bevel:
        apply_bevel(o, bevel, 2)
    return o


def sphere(name, loc, radius, material, scale=(1,1,1)):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=radius, location=loc)
    o = bpy.context.object
    o.name = name
    o.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(material)
    for p in o.data.polygons:
        p.use_smooth = True
    return o


def torus(name, loc, major, minor, material, rot=(0,0,0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, major_segments=40, minor_segments=12, location=loc, rotation=rot)
    o = bpy.context.object
    o.name = name
    o.data.materials.append(material)
    for p in o.data.polygons:
        p.use_smooth = True
    return o


def between(name, a, b, radius, material, verts=16):
    a, b = Vector(a), Vector(b)
    d = b - a
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=d.length, location=(a+b)*.5)
    o = bpy.context.object
    o.name = name
    o.rotation_mode = 'QUATERNION'
    o.rotation_quaternion = d.to_track_quat('Z','Y')
    o.rotation_mode = 'XYZ'
    o.data.materials.append(material)
    for p in o.data.polygons:
        p.use_smooth = True
    return o


def curve_pipe(name, points, radius, material, resolution=2):
    c = bpy.data.curves.new(name, 'CURVE')
    c.dimensions = '3D'
    c.resolution_u = resolution
    c.bevel_depth = radius
    c.bevel_resolution = 3
    s = c.splines.new('POLY')
    s.points.add(len(points)-1)
    for i,p in enumerate(points):
        s.points[i].co = (*p,1)
    o = bpy.data.objects.new(name, c)
    bpy.context.collection.objects.link(o)
    o.data.materials.append(material)
    return o


def text_mesh(name, text, loc, size, material, rot=(math.pi/2,0,0), extrude=.008):
    bpy.ops.object.text_add(location=loc, rotation=rot)
    o = bpy.context.object
    o.name = name
    o.data.body = text
    o.data.align_x = 'CENTER'
    o.data.align_y = 'CENTER'
    o.data.size = size
    o.data.extrude = extrude
    o.data.bevel_depth = .002
    o.data.materials.append(material)
    bpy.ops.object.convert(target='MESH')
    return o


def create_arch_shell():
    # Segmented arched inner shell, based on real emergency bunkers.
    half_w = 6.5
    wall_h = 2.55
    arch_h = 1.70
    y0, y1 = -7.5, 7.5
    points = [(-half_w,0.02),(-half_w,wall_h)]
    for i in range(17):
        t = math.pi - math.pi * i/16
        points.append((half_w*math.cos(t), wall_h + arch_h*math.sin(t)))
    points.append((half_w,0.02))
    verts=[]
    faces=[]
    for yy in (y0,y1):
        for x,z in points:
            verts.append((x,yy,z))
    n=len(points)
    for i in range(n-1):
        a=i; b=i+1; c=n+i+1; d=n+i
        faces.append((a,d,c,b))
    mesh=bpy.data.meshes.new('BunkerShellMesh')
    mesh.from_pydata(verts,[],faces)
    mesh.update()
    o=bpy.data.objects.new('Bunker_ConcreteShell',mesh)
    bpy.context.collection.objects.link(o)
    o.data.materials.append(CONCRETE)
    sol=o.modifiers.new('ShellThickness','SOLIDIFY')
    sol.thickness=.28
    sol.offset=1
    bpy.context.view_layer.objects.active=o
    try:bpy.ops.object.modifier_apply(modifier=sol.name)
    except Exception:pass
    smart_uv(o)
    return o


def create_arch_rib(y, name):
    pts=[(-6.48,y,2.50)]
    for i in range(19):
        t=math.pi-math.pi*i/18
        pts.append((6.48*math.cos(t),y,2.50+1.70*math.sin(t)))
    pts.append((6.48,y,2.50))
    c=bpy.data.curves.new(name,'CURVE')
    c.dimensions='3D';c.resolution_u=2;c.bevel_depth=.055;c.bevel_resolution=2
    s=c.splines.new('POLY');s.points.add(len(pts)-1)
    for i,p in enumerate(pts):s.points[i].co=(*p,1)
    o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);o.data.materials.append(STEEL_DARK)
    return o


def button(name, loc, color_mat, radius=.025, depth=.025, rot=(0,math.pi/2,0)):
    return cyl(name,loc,radius,depth,color_mat,rot=rot,verts=16,bevel=.004)


def build_operations_console():
    # Dense analogue control bank inspired by Cold War operations rooms.
    x=4.85
    box('OpsConsole_Base',(x,-1.0,.73),(.85,5.8,1.42),PAINT_GREY,bevel=.10)
    box('OpsConsole_KneeVoid',(4.39,-1.0,.48),(.08,5.0,.62),DARK,bevel=.02)
    # vertical control wall behind console
    box('OpsControlWall',(5.78,-1.0,1.95),(.20,5.9,2.35),PAINT_GREY,bevel=.06)
    # sloped operator panels
    for yi in (-3.25,-1.75,-.25,1.25):
        panel=box('OpsPanel_'+str(yi),(4.33,yi,1.23),(.15,1.28,.72),PAINT_OFFWHITE,rot=(0,.34,0),bevel=.045)
        for r in range(4):
            for c in range(5):
                z=1.10+r*.12; y=yi-.38+c*.18
                button('OpsBtn', (4.22,y,z), GREEN_LED if (r+c)%4 else AMBER_LED, radius=.022)
        for g in range(2):
            cyl('Gauge',(4.20,yi-.30+g*.45,1.47),.115,.028,GAUGE,rot=(0,math.pi/2,0),verts=32,bevel=.006)
            cyl('GaugeFace',(4.18,yi-.30+g*.45,1.47),.086,.010,OFFWHITE,rot=(0,math.pi/2,0),verts=32,bevel=.002)
    # phones and paperwork shelf
    box('OpsShelf',(4.18,2.28,1.07),(.60,1.0,.09),STEEL,bevel=.03)
    box('FieldPhone',(3.98,2.05,1.23),(.34,.34,.20),OLIVE,bevel=.07)
    torus('PhoneHandset',(3.83,2.05,1.46),.18,.045,RUBBER,rot=(0,math.pi/2,0))
    text_mesh('OpsLabel','SHELTER 47 OPERATIONS',(5.63,-1.0,2.85),.20,OFFWHITE,rot=(0,math.pi/2,math.pi/2),extrude=.004)


def build_cctv_station():
    # Entire station authored in place; this object is the interaction anchor.
    root=box('CCTV_Console',(-3.55,-2.35,.72),(3.5,1.35,1.20),PAINT_GREY,bevel=.11)
    box('CCTV_DeskTop',(-3.55,-1.78,1.26),(3.35,.48,.12),STEEL,bevel=.05)
    positions=[(-4.30,-2.88,1.78),(-2.80,-2.88,1.78),(-4.30,-2.88,2.55),(-2.80,-2.88,2.55)]
    for i,p in enumerate(positions):
        box('CCTV_MonitorHousing_%d'%i,p,(1.25,.20,.68),DARK,bevel=.08)
        box('CCTV_Screen_%d'%i,(p[0],p[1]-.115,p[2]),(1.06,.025,.52),SCREEN,bevel=.025)
        button('CCTV_LED_%d'%i,(p[0]+.48,p[1]-.145,p[2]-.25),GREEN_LED,radius=.018,depth=.016,rot=(math.pi/2,0,0))
    # PTZ controller and button bed
    box('CCTV_ButtonBed',(-3.55,-1.60,1.39),(2.7,.25,.20),DARK,rot=(math.radians(-15),0,0),bevel=.035)
    for i in range(10):
        button('CCTVKey',(-4.55+i*.22,-1.43,1.45),AMBER_LED if i in (2,7) else STEEL2,radius=.025,depth=.025,rot=(math.pi/2,0,0))
    cyl('PTZ_Stick',(-2.50,-1.40,1.58),.035,.28,RUBBER,rot=(0,0,0),verts=20,bevel=.006)
    sphere('PTZ_Grip',(-2.50,-1.40,1.76),.085,RUBBER,scale=(1,1,1.15))
    return root


def build_desk_radio():
    # Desk/terminal zone, correctly on floor and correctly scaled.
    box('Desk_Frame',(1.45,2.85,.78),(2.9,1.35,1.42),STEEL_DARK,bevel=.08)
    box('Desk_Top',(1.45,2.85,1.48),(3.15,1.55,.12),WOOD,bevel=.06)
    box('Terminal_Housing',(.80,2.30,2.12),(1.55,.28,1.02),DARK,bevel=.08)
    box('Computer_Screen',(.80,2.14,2.12),(1.30,.035,.78),SCREEN,bevel=.02)
    box('Keyboard',(1.05,2.18,1.59),(1.32,.42,.08),DARK,rot=(math.radians(8),0,0),bevel=.025)
    for r in range(4):
        for c in range(10):
            box('Key',(0.53+c*.11,2.12+r*.07,1.67),(.075,.04,.018),STEEL2,bevel=.005)
    # radio body, analogue face, tuning knobs
    box('Radio_Body',(2.35,2.30,1.78),(1.10,.55,.58),OLIVE,bevel=.07)
    box('Radio_Display',(2.05,2.00,1.85),(.42,.035,.18),AMBER_SCREEN,bevel=.012)
    for i in range(3):
        cyl('RadioKnob',(2.45+i*.24,1.99,1.72),.07,.04,DARK,rot=(math.pi/2,0,0),verts=24,bevel=.007)
    curve_pipe('Radio_Antenna',[(2.78,2.22,2.00),(2.95,2.25,2.92)],.012,STEEL2)
    text_mesh('DeskLabel','COMMS / CIVIL DEFENCE',(1.45,3.54,1.52),.12,OFFWHITE,rot=(math.pi/2,0,0),extrude=.003)


def build_living_zone():
    # Two proper canvas cots and practical storage, based on shelter references.
    for yi in (4.55,6.05):
        x=-4.55
        box('CotFrame',(x,yi,.42),(2.25,.90,.12),STEEL_DARK,bevel=.03)
        for dx in (-1.0,1.0):
            for dy in (-.34,.34):
                cyl('CotLeg',(x+dx,yi+dy,.21),.028,.42,STEEL2,verts=12,bevel=.003)
        box('CotCanvas',(x,yi,.60),(2.05,.76,.12),CANVAS,bevel=.11)
        box('CotBlanket',(x+.25,yi,.73),(1.10,.72,.10),OLIVE,bevel=.08)
        box('CotPillow',(x-.72,yi,.76),(.48,.58,.14),FABRIC,bevel=.12)
    # lockers against end wall
    for i in range(4):
        x=-2.3+i*.82
        box('Locker_%d'%i,(x,6.88,1.05),(.72,.58,2.02),PAINT_GREY,bevel=.045)
        box('LockerDoor_%d'%i,(x,6.57,1.08),(.62,.025,1.80),PAINT_OFFWHITE,bevel=.022)
        button('LockerHandle_%d'%i,(x+.22,6.53,1.05),STEEL_DARK,radius=.025,depth=.025,rot=(math.pi/2,0,0))
    # ration shelf and water cans
    for z in (.55,1.25,1.95):
        box('RationShelf',(-.10,6.75,z),(2.0,.50,.08),STEEL_DARK,bevel=.02)
    for i in range(8):
        box('RationTin',(-.78+(i%4)*.38,6.42,.66+(i//4)*.68),(.24,.22,.28),TIN_RED if i%3==0 else TIN,bevel=.035)


def build_gun_vault():
    # Built into left wall, door hinge and rifle are named for gameplay.
    x=-6.02;y=.55
    box('GunVault_Body',(x,y,1.35),(.80,1.60,2.65),STEEL_DARK,bevel=.08)
    box('GunVault_Interior',(x+.18,y,1.35),(.58,1.38,2.40),OLIVE,bevel=.04)
    door=box('GunVault_Door',(x+.48,y-.72,1.35),(.09,1.42,2.46),STEEL,bevel=.065)
    # keypad
    box('Vault_Keypad',(x+.54,y-.94,1.62),(.08,.18,.42),DARK,bevel=.025)
    for r in range(4):
        for c in range(3):
            button('VaultKey',(x+.585,y-.975+.05*c,1.47+.09*r),AMBER_LED,radius=.012,depth=.012,rot=(0,math.pi/2,0))
    # rifle display inside vault
    build_rifle((x+.18,y,1.55),'Rifle_Display',scale=.86,rot=(0,math.radians(90),math.radians(3)))
    return door


def build_rifle(loc,name='Rifle_Display',scale=1.0,rot=(0,0,0)):
    # Detailed but web-friendly hunting rifle assembled in Blender.
    root=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(root);root.location=loc;root.rotation_euler=rot;root.scale=(scale,scale,scale)
    parts=[]
    parts.append(box(name+'_Stock',(loc[0]-.48,loc[1],loc[2]),(.68,.14,.18),WOOD,bevel=.045))
    parts.append(box(name+'_Receiver',(loc[0],loc[1],loc[2]+.01),(.56,.15,.19),STEEL_DARK,bevel=.035))
    parts.append(cyl(name+'_Barrel',(loc[0]+.58,loc[1],loc[2]+.03),.032,.98,STEEL_DARK,rot=(0,math.pi/2,0),verts=24,bevel=.005))
    parts.append(cyl(name+'_Muzzle',(loc[0]+1.07,loc[1],loc[2]+.03),.045,.13,DARK,rot=(0,math.pi/2,0),verts=20,bevel=.006))
    parts.append(box(name+'_Grip',(loc[0]-.05,loc[1],loc[2]-.20),(.16,.13,.38),WOOD,rot=(0,math.radians(12),0),bevel=.035))
    parts.append(cyl(name+'_Scope',(loc[0]+.12,loc[1],loc[2]+.24),.055,.48,DARK,rot=(0,math.pi/2,0),verts=24,bevel=.006))
    parts.append(cyl(name+'_ScopeFront',(loc[0]+.38,loc[1],loc[2]+.24),.073,.09,DARK,rot=(0,math.pi/2,0),verts=24,bevel=.006))
    parts.append(cyl(name+'_ScopeRear',(loc[0]-.14,loc[1],loc[2]+.24),.070,.09,DARK,rot=(0,math.pi/2,0),verts=24,bevel=.006))
    # parent parts to root preserving world transform
    for p in parts:
        mw=p.matrix_world.copy();p.parent=root;p.matrix_world=mw
    return root


def build_generator_zone():
    x=4.25;y=4.95
    gen=box('Generator_Body',(x,y,.78),(2.45,1.55,1.48),OLIVE,bevel=.13)
    box('Generator_Vent',(x,y-.79,.86),(2.05,.06,.58),DARK,bevel=.018)
    for i in range(9):
        box('GenVentSlat',(x-.86+i*.22,y-.835,.86),(.055,.025,.48),STEEL2,bevel=.006)
    box('GeneratorPanel',(x+.55,y-.83,1.36),(.72,.05,.42),DARK,bevel=.025)
    for i,matv in enumerate((GREEN_LED,AMBER_LED,RED_LED)):
        button('GenLED',(x+.30+i*.22,y-.865,1.40),matv,radius=.028,depth=.015,rot=(math.pi/2,0,0))
    curve_pipe('ExhaustPipe',[(x+.86,y,1.38),(x+1.25,y,1.38),(x+1.25,y,3.10),(x+.40,y,3.10)],.09,STEEL_DARK)
    # air filtration cylinders
    for i in range(3):
        cyl('FilterTank',(5.75,3.90+i*.72,.78),.27,1.42,STEEL2,verts=24,bevel=.02)
        curve_pipe('FilterPipe',[(5.75,3.90+i*.72,1.46),(6.10,3.90+i*.72,1.46),(6.10,3.0,2.85)],.055,STEEL_DARK)
    text_mesh('GeneratorLabel','POWER / AIR',(x,y-1.00,1.92),.12,OFFWHITE,rot=(math.pi/2,0,0),extrude=.003)
    return gen


def build_blast_door():
    # Circular pressure door with real silhouette and visible hinges.
    y=-7.36
    # frame rings
    torus('BlastDoor_FrameOuter',(0,y,1.55),1.68,.13,STEEL_DARK,rot=(math.pi/2,0,0))
    torus('BlastDoor_FrameInner',(0,y+.03,1.55),1.48,.09,STEEL2,rot=(math.pi/2,0,0))
    door=cyl('BlastDoor_Door',(0,y+.10,1.55),1.46,.26,STEEL,rot=(math.pi/2,0,0),verts=64,bevel=.035)
    # radial reinforcement
    for a in range(0,360,45):
        ang=math.radians(a)
        x=.75*math.cos(ang);z=1.55+.75*math.sin(ang)
        bar=box('BlastDoor_Rib',(x,y-.06,z),(1.15,.08,.10),STEEL_DARK,rot=(0,ang,0),bevel=.02)
    wheel=torus('BlastDoor_Wheel',(0,y-.18,1.55),.52,.045,STEEL_DARK,rot=(math.pi/2,0,0))
    for a in range(0,360,60):
        ang=math.radians(a)
        between('WheelSpoke',(0,y-.19,1.55),(.47*math.cos(ang),y-.19,1.55+.47*math.sin(ang)),.022,STEEL_DARK,12)
    cyl('WheelHub',(0,y-.20,1.55),.10,.09,STEEL2,rot=(math.pi/2,0,0),verts=24,bevel=.008)
    # hinges
    for z in (1.0,2.1):
        box('DoorHinge',(1.55,y+.12,z),(.24,.34,.36),STEEL_DARK,bevel=.04)
        cyl('DoorHingePin',(1.70,y+.12,z),.07,.48,STEEL2,rot=(0,0,0),verts=20,bevel=.006)
    text_mesh('DoorStencil','SHELTER 47',(0,y-.33,2.55),.18,OFFWHITE,rot=(math.pi/2,0,0),extrude=.003)
    return door,wheel


def build_access_panel():
    x=-2.15;y=-7.10;z=1.40
    body=box('Surface_Access_Panel',(x,y,z),(.50,.18,.78),PAINT_GREY,bevel=.045)
    box('AccessDisplay',(x,y-.11,z+.18),(.34,.025,.20),GREEN_LED,bevel=.012)
    button('AccessButton',(x,y-.12,z-.16),RED_LED,radius=.055,depth=.025,rot=(math.pi/2,0,0))
    text_mesh('AccessLabel','SURFACE',(x,y-.125,z+.38),.065,OFFWHITE,rot=(math.pi/2,0,0),extrude=.002)
    return body


def build_room_endcaps():
    # Front/blast-door wall built around a real opening, not a wall hiding a door.
    y=-7.48
    box('FrontWall_L',(-4.25,y,1.35),(4.4,.40,2.70),CONCRETE,bevel=.03,uv=True)
    box('FrontWall_R',(4.25,y,1.35),(4.4,.40,2.70),CONCRETE,bevel=.03,uv=True)
    box('FrontWall_Top',(0,y,3.35),(4.2,.40,1.30),CONCRETE,bevel=.03,uv=True)
    # rear wall full
    box('RearWall',(0,7.48,1.75),(13.0,.36,3.5),CONCRETE,bevel=.03,uv=True)


def build_floor():
    box('FloorSlab',(0,0,-.12),(13.2,15.2,.24),CONCRETE,bevel=.02,uv=True)
    # practical diamond-plate service path
    box('ServiceWalkway',(0,-.55,.035),(2.15,11.7,.07),PLATE,bevel=.01,uv=True)
    # side drain channel
    box('DrainChannel',(-5.72,.2,.02),(.72,12.9,.04),STEEL_DARK,bevel=.008)
    for i in range(42):
        box('DrainGrate',(-5.72,-6.1+i*.30,.075),(.60,.045,.035),STEEL2,bevel=.004)
    # damp patches / oil stains
    for i,(x,y,sx,sy) in enumerate([(-4.0,-4.8,1.3,.55),(3.0,3.8,.8,.45),(1.0,-.8,1.1,.35),(-2.2,5.4,.7,.28)]):
        bpy.ops.mesh.primitive_circle_add(vertices=28,radius=1,fill_type='NGON',location=(x,y,.015))
        o=bpy.context.object;o.name='FloorStain_%d'%i;o.scale=(sx,sy,1);o.data.materials.append(STAIN)


def build_ceiling_services():
    # structural ribs
    for i,y in enumerate([-6.5,-4.5,-2.5,-.5,1.5,3.5,5.5]):
        create_arch_rib(y,'ArchRib_%02d'%i)
    # longitudinal cable trays
    for x in (-5.4,5.4):
        box('CableTray',(x,.0,3.10),(.34,12.8,.12),STEEL_DARK,bevel=.025)
        for j in range(20):
            box('CableTrayRung',(x,-6.0+j*.62,3.14),(.48,.055,.055),STEEL2,bevel=.008)
    # pipe runs with real bends
    curve_pipe('WaterPipe', [(-5.95,-6.2,2.55),(-5.95,5.8,2.55),(-4.8,6.7,2.55)], .055, PIPE_GREEN)
    curve_pipe('SteamPipe', [(5.85,-5.9,2.78),(5.85,4.0,2.78),(4.7,5.2,2.78)], .075, STEEL2)
    curve_pipe('RedServicePipe', [(-5.65,-5.5,2.95),(-5.65,4.6,2.95)], .035, PIPE_RED)


def build_lights():
    # five practical industrial pendants. Geometry and light are both authored here.
    for i,y in enumerate([-5.7,-2.85,0,2.85,5.7]):
        x=.0
        cyl('LampStem_%d'%i,(x,y,3.78),.025,.34,STEEL_DARK,verts=12,bevel=.003)
        # shade: flattened cylinder + guard ring
        cyl('LampShade_%d'%i,(x,y,3.55),.26,.18,PAINT_OFFWHITE,verts=32,bevel=.02)
        torus('LampGuard_%d'%i,(x,y,3.42),.22,.018,STEEL_DARK,rot=(0,0,0))
        sphere('LampBulb_%d'%i,(x,y,3.40),.10,LAMP_EMISSION,scale=(1,1,.8))
        light_data=bpy.data.lights.new('Practical_%d'%i,'AREA')
        light_data.energy=280
        light_data.shape='DISK';light_data.size=2.1
        light_data.color=(1.0,.90,.72)
        light=bpy.data.objects.new('PracticalLight_%d'%i,light_data);bpy.context.collection.objects.link(light)
        light.location=(x,y,3.40);light.rotation_euler=(0,0,0)
    # low amber emergency source by door
    ld=bpy.data.lights.new('EmergencyAmber','POINT');ld.energy=55;ld.color=(1.0,.25,.06);ld.shadow_soft_size=.35
    lo=bpy.data.objects.new('EmergencyAmber',ld);bpy.context.collection.objects.link(lo);lo.location=(-2.15,-6.75,2.45)
    # soft room bounce to prevent crushed blacks
    ld=bpy.data.lights.new('RoomBounce','AREA');ld.energy=180;ld.shape='RECTANGLE';ld.size=8;ld.size_y=5;ld.color=(.72,.78,.70)
    lo=bpy.data.objects.new('RoomBounce',ld);bpy.context.collection.objects.link(lo);lo.location=(0,2.5,3.65);lo.rotation_euler=(0,0,0)


def build_signage_clutter():
    text_mesh('WallStencil','SHELTER 47 / CIVIL DEFENCE',(-3.85,7.25,2.72),.18,OFFWHITE,rot=(math.pi/2,0,0),extrude=.003)
    # crates, jerry cans, toolboxes
    for i,(x,y,z) in enumerate([(2.8,5.8,.32),(3.45,5.75,.32),(5.15,2.7,.35),(-1.0,6.2,.35)]):
        box('SupplyCrate_%d'%i,(x,y,z),(.72,.58,.62),OLIVE,bevel=.055)
        box('CrateBand_%d'%i,(x,y,z+.01),(.76,.08,.66),STEEL_DARK,bevel=.012)
    for i,(x,y) in enumerate([(5.7,2.0),(5.75,2.6),(-5.5,2.55)]):
        box('JerryCan_%d'%i,(x,y,.36),(.34,.22,.66),OLIVE,bevel=.05)
        torus('JerryHandle_%d'%i,(x,y,.73),.10,.025,STEEL_DARK,rot=(math.pi/2,0,0))
    box('Toolbox',(3.35,2.35,1.70),(.62,.34,.26),TIN_RED,bevel=.055)


def add_camera(name, loc, target, lens=30):
    data=bpy.data.cameras.new(name);data.lens=lens;data.sensor_width=36
    cam=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(cam);cam.location=loc
    direction=Vector(target)-Vector(loc);cam.rotation_euler=direction.to_track_quat('-Z','Y').to_euler()
    return cam


def render_views():
    scene=bpy.context.scene
    scene.render.resolution_x=1280;scene.render.resolution_y=720;scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='PNG'
    scene.render.film_transparent=False
    views={
        '01_spawn':((0,5.8,1.62),(0,-3.5,1.45),30),
        '02_blast_door':((0,-4.8,1.65),(0,-7.3,1.55),34),
        '03_operations':((1.3,-.8,1.72),(4.75,-1.0,1.55),32),
        '04_living':((-1.6,3.9,1.72),(-4.4,5.0,1.2),34),
        '05_overview':((-4.7,4.9,3.25),(1.0,-1.3,1.25),28),
    }
    for name,(loc,target,lens) in views.items():
        cam=add_camera('QA_'+name,loc,target,lens);scene.camera=cam
        scene.render.filepath=os.path.join(QA,name+'.png')
        bpy.ops.render.render(write_still=True)


def export_glb():
    bpy.ops.object.select_all(action='SELECT')
    path=os.path.join(OUT,'shelter47_room_v4.glb')
    kwargs=dict(filepath=path,export_format='GLB',use_selection=False,export_apply=True)
    props=bpy.ops.export_scene.gltf.get_rna_type().properties.keys()
    if 'export_lights' in props: kwargs['export_lights']=True
    if 'export_cameras' in props: kwargs['export_cameras']=False
    bpy.ops.export_scene.gltf(**kwargs)
    print('EXPORTED',path)


# MATERIALS -------------------------------------------------------------------
clear_scene()
CONCRETE=image_texture_material('V4_Concrete','concrete__Concrete034_1K_Color.jpg','concrete__Concrete034_1K_Roughness.jpg','concrete__Concrete034_1K_NormalGL.jpg',roughness=.92)
PLATE=image_texture_material('V4_DiamondPlate','metal_floor_plate__DiamondPlate008C_1K_Color.jpg','metal_floor_plate__DiamondPlate008C_1K_Roughness.jpg','metal_floor_plate__DiamondPlate008C_1K_NormalGL.jpg',roughness=.50,metallic=.62)
STEEL=principled('V4_WornSteel',(.32,.34,.32),.74,.38)
STEEL2=principled('V4_Galvanized',(.48,.50,.46),.62,.46)
STEEL_DARK=principled('V4_DarkSteel',(.10,.115,.105),.78,.40)
PAINT_GREY=principled('V4_PaintedGrey',(.34,.36,.33),.28,.62)
PAINT_OFFWHITE=principled('V4_OffWhiteEnamel',(.55,.56,.50),.18,.58)
OLIVE=principled('V4_FadedOlive',(.16,.22,.12),.18,.68)
CANVAS=principled('V4_Canvas',(.25,.31,.20),0,.92)
FABRIC=principled('V4_Fabric',(.30,.32,.27),0,.96)
WOOD=principled('V4_DarkWood',(.22,.105,.045),0,.70)
RUBBER=principled('V4_Rubber',(.025,.030,.026),0,.94)
OFFWHITE=principled('V4_LabelWhite',(.74,.74,.66),0,.72)
DARK=principled('V4_BlackHardware',(.035,.042,.038),.35,.78)
GAUGE=principled('V4_GaugeBezel',(.10,.11,.10),.66,.34)
SCREEN=principled('V4_CRT',(.02,.05,.03),0,.28,(.08,.65,.24),2.1)
AMBER_SCREEN=principled('V4_AmberCRT',(.10,.035,.006),0,.28,(1.0,.25,.025),2.2)
GREEN_LED=principled('V4_GreenLED',(.02,.08,.025),0,.22,(.12,1.0,.20),4.0)
AMBER_LED=principled('V4_AmberLED',(.12,.035,.005),0,.22,(1.0,.30,.02),4.0)
RED_LED=principled('V4_RedLED',(.12,.015,.008),0,.24,(1.0,.05,.02),3.5)
TIN=principled('V4_Tin',(.42,.43,.38),.52,.40)
TIN_RED=principled('V4_RedTin',(.38,.07,.045),.28,.56)
PIPE_GREEN=principled('V4_PipeGreen',(.10,.26,.14),.38,.55)
PIPE_RED=principled('V4_PipeRed',(.42,.07,.045),.30,.56)
STAIN=principled('V4_Stain',(.035,.025,.018),0,.30,alpha=.56)
LAMP_EMISSION=principled('V4_Lamp',(.62,.54,.37),0,.22,(1.0,.78,.48),5.0)

# BUILD -----------------------------------------------------------------------
create_arch_shell()
build_floor()
build_room_endcaps()
build_ceiling_services()
build_lights()
build_operations_console()
build_cctv_station()
build_desk_radio()
build_living_zone()
build_gun_vault()
build_generator_zone()
build_blast_door()
build_access_panel()
build_signage_clutter()

# World / render configuration -------------------------------------------------
scene=bpy.context.scene
try:
    scene.render.engine='BLENDER_EEVEE_NEXT'
except Exception:
    scene.render.engine='BLENDER_EEVEE'
scene.render.resolution_x=1280;scene.render.resolution_y=720;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.world.color=(.018,.020,.018)
try:
    scene.view_settings.look='AgX - Medium High Contrast'
except Exception:
    try:scene.view_settings.look='Medium High Contrast'
    except Exception:pass
scene.view_settings.exposure=.35
scene.view_settings.gamma=1.0

# Ground truth renders first, then runtime export.
render_views()
export_glb()

print('Shelter 47 V4 rebuild complete')

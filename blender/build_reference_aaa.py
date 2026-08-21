import bpy, math, os, random
from mathutils import Vector
random.seed(47)
ROOT=os.getcwd(); OUT=os.path.join(ROOT,'public','assets','blender','aaa'); QA=os.path.join(ROOT,'qa','renders','aaa')
os.makedirs(OUT,exist_ok=True); os.makedirs(QA,exist_ok=True)

def clear():
    bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)

def mat(n,c,metal=0,rough=.6,emit=None,power=0):
    m=bpy.data.materials.get(n) or bpy.data.materials.new(n); m.use_nodes=True; b=m.node_tree.nodes.get('Principled BSDF')
    b.inputs['Base Color'].default_value=(*c,1); b.inputs['Metallic'].default_value=metal; b.inputs['Roughness'].default_value=rough
    if emit:
        if 'Emission Color' in b.inputs: b.inputs['Emission Color'].default_value=(*emit,1); b.inputs['Emission Strength'].default_value=power
        else: b.inputs['Emission'].default_value=(*emit,1); b.inputs['Emission Strength'].default_value=power
    return m

def apply(o,m):
    if hasattr(o.data,'materials'): o.data.materials.clear(); o.data.materials.append(m)

def smooth(o):
    if o.type=='MESH':
        for p in o.data.polygons:p.use_smooth=True

def cube(n,l,s,m,b=.04,r=(0,0,0)):
    bpy.ops.mesh.primitive_cube_add(location=l,rotation=r); o=bpy.context.object; o.name=n; o.scale=s; bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if b: q=o.modifiers.new('Bevel','BEVEL'); q.width=b; q.segments=3
    apply(o,m); return o

def cyl(n,l,rad,d,m,r=(0,0,0),v=24):
    bpy.ops.mesh.primitive_cylinder_add(vertices=v,radius=rad,depth=d,location=l,rotation=r); o=bpy.context.object; o.name=n; apply(o,m); smooth(o); return o

def sph(n,l,s,m,v=28):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=v,ring_count=max(12,v//2),location=l); o=bpy.context.object; o.name=n; o.scale=s; bpy.ops.object.transform_apply(location=False,rotation=False,scale=True); apply(o,m); smooth(o); return o

def pipe(n,a,b,rad,m):
    a,b=Vector(a),Vector(b); d=b-a; o=cyl(n,(a+b)/2,rad,d.length,m,v=18); o.rotation_mode='QUATERNION'; o.rotation_quaternion=d.to_track_quat('Z','Y'); return o

def txt(n,body,l,size,m):
    bpy.ops.object.text_add(location=l,rotation=(math.pi/2,0,0)); o=bpy.context.object; o.name=n; o.data.body=body; o.data.align_x='CENTER'; o.data.align_y='CENTER'; o.data.size=size; o.data.extrude=.008; apply(o,m); return o

def empty(n): o=bpy.data.objects.new(n,None); bpy.context.collection.objects.link(o); return o

def ch(o,p): o.parent=p; return o

def point(n,l,c,e=140):
    d=bpy.data.lights.new(n,'POINT'); d.color=c; d.energy=e; d.shadow_soft_size=.7; o=bpy.data.objects.new(n,d); bpy.context.collection.objects.link(o); o.location=l; return o

def spot(n,l,t,c,e=500):
    d=bpy.data.lights.new(n,'SPOT'); d.color=c; d.energy=e; d.spot_size=math.radians(75); d.spot_blend=.65; o=bpy.data.objects.new(n,d); bpy.context.collection.objects.link(o); o.location=l; o.rotation_euler=(Vector(t)-Vector(l)).to_track_quat('-Z','Y').to_euler(); return o

def export(root,path):
    bpy.ops.object.select_all(action='DESELECT'); root.select_set(True)
    for o in root.children_recursive:o.select_set(True)
    bpy.context.view_layer.objects.active=root
    bpy.ops.export_scene.gltf(filepath=path,export_format='GLB',use_selection=True,export_yup=True,export_apply=True,export_lights=True)

def cam(n,l,t,lens=30):
    d=bpy.data.cameras.new(n); d.lens=lens; o=bpy.data.objects.new(n,d); bpy.context.collection.objects.link(o); o.location=l; o.rotation_euler=(Vector(t)-Vector(l)).to_track_quat('-Z','Y').to_euler(); bpy.context.scene.camera=o; return o

def render(name,l,t,lens=30):
    c=cam('QA_'+name,l,t,lens); sc=bpy.context.scene
    try: sc.render.engine='BLENDER_EEVEE_NEXT'
    except: sc.render.engine='BLENDER_EEVEE'
    sc.render.resolution_x=1280; sc.render.resolution_y=720; sc.render.resolution_percentage=100; sc.render.image_settings.file_format='PNG'; sc.render.filepath=os.path.join(QA,name+'.png'); bpy.ops.render.render(write_still=True); bpy.data.objects.remove(c,do_unlink=True)

CONC=mat('AgedConcrete',(.18,.17,.15),0,.84); CONC2=mat('ConcreteEdge',(.29,.27,.23),0,.78); STEEL=mat('WornSteel',(.10,.11,.11),.78,.34); STEEL2=mat('PaintedSteel',(.18,.19,.17),.55,.48); BLACK=mat('BlackMetal',(.025,.028,.026),.82,.3); OLIVE=mat('MilitaryOlive',(.15,.17,.10),.35,.63); RUST=mat('OxideRust',(.27,.08,.025),.38,.72); WOOD=mat('DarkWood',(.15,.075,.035),0,.58); FAB=mat('BedFabric',(.11,.13,.08),0,.88); PAPER=mat('Paper',(.68,.62,.48),0,.9); SCREEN=mat('ScreenGreen',(.015,.055,.036),.05,.28,(.08,1,.35),2.3); SCREEN2=mat('ScreenDim',(.015,.028,.022),.05,.34,(.04,.22,.11),.65); WHITE=mat('WarmWhite',(.72,.67,.55),.05,.56); LAMP=mat('LampEmit',(.78,.58,.28),.05,.22,(1,.68,.34),6); GREEN=mat('Indicator',(.02,.18,.045),.1,.3,(.04,1,.16),3); GLASS=mat('Glass',(.10,.13,.12),.1,.16); GROUND=mat('WetSoil',(.065,.055,.038),0,.88); GRASS=mat('Grass',(.055,.12,.038),0,.92); BARK=mat('Bark',(.10,.055,.028),0,.9); LEAF=mat('Leaf',(.025,.085,.025),0,.9); FUR=mat('DeerFur',(.23,.12,.06),0,.92); FURL=mat('LightFur',(.50,.38,.25),0,.94); RFUR=mat('RabbitFur',(.27,.24,.20),0,.96); SKIN=mat('InfectedSkin',(.19,.20,.16),0,.84); BRUISE=mat('BruisedSkin',(.10,.105,.08),0,.9); BLOOD=mat('Blood',(.14,.006,.004),0,.68); DENIM=mat('DirtyDenim',(.065,.075,.085),0,.86); CLOTH=mat('RottenCloth',(.11,.095,.065),0,.9); RUBBER=mat('Rubber',(.022,.024,.022),0,.9); CHROME=mat('Chrome',(.25,.26,.25),.95,.2)

def interior():
    r=empty('AAA_INTERIOR_ROOT')
    ch(cube('Floor',(0,0,-.12),(4.9,3.6,.12),STEEL2,.02),r)
    for x in [-3.6,-1.2,1.2,3.6]:
      for y in [-2.4,0,2.4]: ch(cube('FloorPlate',(x,y,.015),(1.14,1.14,.025),STEEL,.012),r)
    for n,l,s in [('Back',(0,-3.6,1.62),(4.9,.16,1.65)),('Left',(-4.9,0,1.62),(.16,3.6,1.65)),('Right',(4.9,0,1.62),(.16,3.6,1.65)),('Ceiling',(0,0,3.34),(4.9,3.6,.14))]:ch(cube(n,l,s,CONC,.06),r)
    for y in [-2.7,-1.2,.4,2.0]:ch(cube('Beam',(0,y,3.15),(4.75,.07,.08),STEEL,.02),r)
    for x0 in [-3.55,-3.32,3.55]:
      for off in [0,.16]:ch(pipe('CeilingPipe',(x0+off,-3.3,2.94),(x0+off,3.25,2.94),.042,CHROME if off==0 else STEEL2),r)
    door=empty('INTERACT_BlastDoor'); ch(door,r); ch(cube('DoorFrame',(0,-3.30,1.55),(1.35,.28,1.58),STEEL,.12),door); ch(cube('Door47',(0,-3.00,1.55),(1.05,.15,1.36),STEEL2,.09),door)
    for z in [.48,1.0,2.1,2.62]:ch(cube('DoorBrace',(0,-2.83,z),(.88,.07,.055),STEEL,.018),door)
    ch(cube('DoorWindow',(0,-2.78,1.75),(.35,.02,.18),SCREEN2,.02),door); ch(txt('DoorText','47',(0,-2.755,.82),.40,PAPER),door); ch(txt('DoorRestricted','RESTRICTED AREA',(0,-2.755,1.28),.10,PAPER),door)
    ch(cube('DoorKeypad',(1.45,-3.14,1.32),(.12,.08,.28),BLACK,.025),r)
    for i in range(3):ch(cube('DoorLED',(1.45,-3.05,1.44-i*.08),(.025,.008,.015),GREEN,.003),r)
    bed=empty('INTERACT_Bed');ch(bed,r);ch(cube('BedFrame',(-3.65,1.78,.45),(1.16,1.55,.11),STEEL,.04),bed);ch(cube('BedMattress',(-3.65,1.78,.62),(1.06,1.45,.16),FAB,.09),bed);ch(cube('Pillow',(-3.65,.72,.82),(.62,.36,.13),WHITE,.12),bed);ch(cube('Blanket',(-3.65,2.12,.80),(1.02,.86,.065),OLIVE,.08),bed)
    for i in range(2):
      x=-3.9+i*.72; ch(cube(f'INTERACT_Locker_{i+1}',(x,-1.24,1.08),(.32,.43,1.08),STEEL2,.04),r);ch(cube('LockerDoor',(x,-.80,1.08),(.29,.025,1.0),OLIVE,.02),r)
    radio=empty('INTERACT_Radio');ch(radio,r);ch(cube('CommsDesk',(-2.08,-2.12,.73),(1.0,.55,.08),WOOD,.045),radio);ch(cube('RadioBody',(-2.2,-2.1,.94),(.46,.26,.18),BLACK,.03),radio);ch(cube('RadioScreen',(-2.2,-1.83,.97),(.21,.012,.065),SCREEN,.004),radio)
    for i in range(5):ch(cyl('RadioKnob',(-2.52+i*.15,-1.81,.88),.03,.03,CHROME,(math.pi/2,0,0),14),radio)
    ch(cube('NoticeBoard',(-3.65,-3.28,1.80),(.78,.035,.62),WOOD,.03),r);ch(txt('Notice47','47',(-3.65,-3.235,1.88),.42,PAPER),r)
    for i in range(7):ch(cube(f'PICKUP_Note_{i+1}',(-4.15+(i%4)*.30,-3.225,1.49+(i//4)*.31),(.10,.008,.13),PAPER,.004,r=(0,0,random.uniform(-.15,.15))),r)
    sx=-.82
    for x in [sx-.55,sx+.55]:ch(cube('ShelfPost',(x,-2.48,1.17),(.035,.26,1.17),STEEL,.01),r)
    for z in [.35,.85,1.35,1.85,2.35]:ch(cube('Shelf',(sx,-2.48,z),(.60,.28,.035),STEEL2,.01),r)
    for i in range(8):ch(cube(f'INTERACT_SupplyCrate_{i+1}',(sx+random.uniform(-.40,.40),-2.46,.50+(i%4)*.50),(.18,.18,.14),OLIVE,.025),r)
    ch(cube('INTERACT_Medkit',(sx,-2.18,1.55),(.25,.09,.18),WHITE,.02),r);ch(txt('MedCross','+', (sx,-2.08,1.55),.20,GREEN),r)
    c=empty('INTERACT_CCTV');ch(c,r)
    for i,(x,z) in enumerate([(2.45,2.25),(3.65,2.25),(2.45,1.50),(3.65,1.50)],1):ch(cube(f'CCTVFrame{i}',(x,-3.16,z),(.53,.08,.30),BLACK,.035),c);ch(cube(f'CCTVScreen{i}',(x,-3.07,z),(.47,.012,.245),SCREEN2,.008),c);ch(txt(f'CamLabel{i}',f'CAM 0{i}',(x,-3.045,z+.21),.055,PAPER),c)
    ch(cube('CCTVDesk',(3.05,-1.88,.72),(1.65,.60,.08),WOOD,.045),c);ch(cube('CCTVConsole',(3.42,-1.65,.98),(.74,.34,.18),BLACK,.04,r=(math.radians(-10),0,0)),c)
    for i in range(14):ch(cyl('CCTVButton',(2.82+(i%7)*.18,-1.31,1.00+(i//7)*.11),.025,.02,GREEN if i%4==0 else RUST,(math.pi/2,0,0),12),c)
    ch(cyl('CCTVJoystick',(4.02,-1.34,1.13),.035,.20,BLACK,(math.radians(16),0,0),16),c);ch(sph('CCTVJoyTop',(4.02,-1.30,1.27),(.065,.065,.065),BLACK,18),c)
    comp=empty('INTERACT_Computer');ch(comp,c);ch(cube('ComputerFrame',(2.0,-1.66,1.30),(.56,.06,.34),BLACK,.04),comp);ch(cube('ComputerScreen',(2.0,-1.59,1.30),(.50,.012,.285),SCREEN,.008),comp);ch(txt('ComputerText','SHELTER 47',(2.0,-1.575,1.34),.11,GREEN),comp)
    ch(cube('Keyboard',(2.15,-1.31,.88),(.55,.22,.035),BLACK,.025),c)
    for rr in range(4):
      for cc in range(11):ch(cube('Key',(1.70+cc*.09,-1.08-rr*.045,.92),(.035,.025,.012),STEEL2,.004),c)
    for j in range(2):ch(cube('RadioStack',(4.15,-1.88,.83+j*.28),(.43,.28,.12),BLACK,.03),c)
    ch(cyl('LanternBase',(1.55,-1.75,.94),.10,.22,BLACK,v=18),c);ch(cyl('LanternGlow',(1.55,-1.75,1.16),.075,.22,LAMP,v=18),c);point('CCTVWarm',(1.55,-1.62,1.40),(1,.60,.27),130)
    ch(cube('ChairSeat',(3.05,-.65,.52),(.38,.38,.09),BLACK,.08),r);ch(cube('ChairBack',(3.05,-.92,.99),(.38,.08,.48),BLACK,.10,r=(math.radians(-6),0,0)),r);ch(cyl('ChairStem',(3.05,-.65,.27),.055,.42,CHROME,v=18),r)
    for sidx in range(2):
      x=4.25;y=.55+sidx*1.45;ch(cube('RightRack',(x,y,1.18),(.50,.55,1.16),STEEL,.04),r)
      for z in [.35,.85,1.35,1.85,2.32]:ch(cube('RackShelf',(x,y,z),(.47,.52,.03),STEEL2,.01),r)
      for j in range(5):ch(cube('RackCrate',(x+random.uniform(-.2,.2),y,.50+j*.38),(.22,.35,.14),OLIVE,.025),r)
    ch(cube('FirstAid',(4.18,.62,1.60),(.30,.10,.25),WHITE,.025),r);ch(txt('FirstAidCross','+', (4.18,.50,1.61),.24,GREEN),r)
    gen=empty('INTERACT_Generator');ch(gen,r);ch(cube('Generator',(4.05,2.52,.75),(.62,.62,.65),OLIVE,.07),gen);ch(cube('GeneratorPanel',(4.05,1.89,.90),(.32,.03,.25),BLACK,.025),gen)
    for i in range(4):
      x=-3+i*2;ch(cube('Fixture',(x,.20,3.07),(.68,.16,.055),WHITE,.025),r);ch(cube('FixtureGlow',(x,.20,2.99),(.58,.11,.015),LAMP,.008),r);spot('CeilingSpot'+str(i),(x,.2,2.91),(x,.2,.1),(1,.82,.61),240)
    point('RoomBounce',(0,0,2.2),(.50,.58,.54),90)
    return r

def tree(n,x,y,s,r,dead=False):
    ch(cyl(n+'Trunk',(x,y,2.1*s),.18*s,4.2*s,BARK,v=16),r)
    for bi in range(4):
      z=(2.3+bi*.58)*s; a=random.random()*math.tau; e=(x+math.cos(a)*(1.45-bi*.12)*s,y+math.sin(a)*(1.45-bi*.12)*s,z+.45*s);ch(pipe(n+'Branch',(x,y,z),e,.055*s,BARK),r)
      if not dead:
        for k in range(3):ch(sph(n+'Leaf',(e[0]+random.uniform(-.4,.4)*s,e[1]+random.uniform(-.4,.4)*s,e[2]+random.uniform(-.25,.4)*s),(.52*s,.40*s,.68*s),LEAF,16),r)

def grass(n,x,y,r,s=1):
    for i in range(6):
      a=random.random()*math.tau; q=random.random()*.16*s;ch(cube(n,(x+math.cos(a)*q,y+math.sin(a)*q,.18*s),(.012*s,.018*s,.18*s),GRASS,.003,r=(random.uniform(-.20,.20),random.uniform(-.20,.20),a)),r)

def pickup(r,x=11,y=-6):
    p=empty('Vehicle_Pickup');ch(p,r);ch(cube('Chassis',(x,y,.50),(1.75,.84,.18),STEEL,.08),p);ch(cube('Cab',(x-.55,y,1.05),(.82,.80,.62),OLIVE,.14),p);ch(cube('Hood',(x-1.38,y,.83),(.55,.78,.30),OLIVE,.10),p);ch(cube('Bed',(x+.95,y,.78),(.74,.82,.32),OLIVE,.08),p);ch(cube('Windshield',(x-.70,y-.81,1.18),(.48,.025,.28),GLASS,.02,r=(math.radians(-10),0,0)),p)
    for wx in [x-1.15,x+1.18]:
      for wy in [y-.82,y+.82]:ch(cyl('Wheel',(wx,wy,.42),.37,.30,RUBBER,(math.pi/2,0,0),28),p);ch(cyl('Hub',(wx,wy,.42),.16,.32,CHROME,(math.pi/2,0,0),20),p)
    ch(cube('FrontBumper',(x-1.92,y,.52),(.14,.85,.12),STEEL,.04),p)

def exterior():
    r=empty('AAA_EXTERIOR_ROOT');ch(cube('Ground',(0,0,-.2),(24,24,.2),GROUND,.01),r);ch(cube('Path',(-4,1,.015),(2,10,.06),CONC2,.025),r)
    bx,by=-7,-4;ch(cube('SurfaceBunker',(bx,by,.95),(2.5,2,.95),CONC,.20),r);ch(cube('EntranceFrame',(bx,by+2.03,1.02),(1.20,.18,1.15),STEEL,.08),r);ch(cube('EntranceDoor',(bx,by+2.23,1.06),(.86,.09,.96),STEEL2,.06),r);ch(txt('Exterior47','47',(bx,by+2.34,.80),.40,PAPER),r);ch(cube('ReturnPanel',(bx+1.32,by+2.14,1.12),(.10,.08,.22),BLACK,.02),r)
    def fence(pref,a,b,posts):
      A=Vector((a[0],a[1],0));B=Vector((b[0],b[1],0));
      for i in range(posts+1):p=A.lerp(B,i/posts);ch(cyl(pref+'Post',(p.x,p.y,1.25),.055,2.5,BLACK,v=14),r)
      ch(pipe(pref+'Top',(a[0],a[1],2.43),(b[0],b[1],2.43),.035,BLACK),r);ch(pipe(pref+'Mid',(a[0],a[1],1.22),(b[0],b[1],1.22),.028,BLACK),r)
      for i in range(posts):p0=A.lerp(B,i/posts);p1=A.lerp(B,(i+1)/posts);ch(pipe(pref+'A',(p0.x,p0.y,.2),(p1.x,p1.y,2.35),.008,STEEL2),r);ch(pipe(pref+'B',(p0.x,p0.y,2.35),(p1.x,p1.y,.2),.008,STEEL2),r)
    fence('FN',(-19,15),(19,15),14);fence('FW',(-19,-18),(-19,15),12);fence('FE',(19,-18),(19,15),12);fence('FS',(-19,-18),(19,-18),14)
    ch(cube('INTERACT_MainGate_Left',(-1.25,14.92,1.25),(1.15,.06,1.20),BLACK,.02),r);ch(cube('INTERACT_MainGate_Right',(1.25,14.92,1.25),(1.15,.06,1.20),BLACK,.02),r)
    ch(cyl('FloodPole',(4.5,4.5,4.1),.11,8.2,BLACK,v=18),r);ch(cube('FloodBar',(4.5,4.5,8.05),(1.05,.10,.08),BLACK,.02),r)
    for fx in [3.75,4.25,4.75,5.25]:ch(cube('FloodLamp',(fx,4.34,7.95),(.25,.15,.20),STEEL,.04),r);spot('Flood'+str(fx),(fx,4.15,7.8),(fx,1,0),(1,.88,.72),900)
    for i in range(13):
      x=random.uniform(-14,14);y=random.uniform(-13,11)
      if abs(x+7)>4 or abs(y+4)>4:ch(cube(f'INTERACT_Crate_{i}',(x,y,.32),(.45,.55,.32),OLIVE,.05,r=(0,0,random.random()*.5)),r)
    for i in range(10):ch(cube('Puddle',(random.uniform(-15,15),random.uniform(-14,12),.015),(random.uniform(.4,1.3),random.uniform(.3,.8),.01),GLASS,.004,r=(0,0,random.random()*math.pi)),r)
    for i in range(220):
      x=random.uniform(-18,18);y=random.uniform(-17,14)
      if not(abs(x+4)<2.8 and -12<y<14):grass('Grass'+str(i),x,y,r,random.uniform(.65,1.35))
    for i in range(34):
      side=random.choice('NSEWI')
      if side=='I':x=random.uniform(-16,16);y=random.uniform(-15,12)
      elif side=='N':x=random.uniform(-25,25);y=random.uniform(17,28)
      elif side=='S':x=random.uniform(-25,25);y=random.uniform(-30,-20)
      elif side=='E':x=random.uniform(21,31);y=random.uniform(-24,22)
      else:x=random.uniform(-31,-21);y=random.uniform(-24,22)
      tree('Tree'+str(i),x,y,random.uniform(.75,1.35),r,i%9==0)
    for i in range(40):ch(sph('Bush',(random.uniform(-18,18),random.uniform(-17,14),.42),(.42,.34,.45),LEAF,14),r)
    pickup(r);point('EntranceLight',(bx,by+2.6,2.3),(1,.70,.40),170);return r

def deer():
    r=empty('AAA_DEER_ROOT');ch(sph('DeerBody',(0,0,1.18),(1,.38,.55),FUR,36),r);ch(sph('DeerChest',(.62,0,1.30),(.52,.42,.62),FUR,32),r);ch(sph('DeerRump',(-.72,0,1.25),(.58,.42,.54),FUR,32),r);ch(cyl('DeerNeck',(.82,0,1.78),.19,.95,FUR,(0,math.radians(25),0),26),r);ch(sph('DeerHead',(1.18,0,2.10),(.42,.28,.30),FUR,36),r);ch(sph('DeerMuzzle',(1.52,0,2.00),(.34,.22,.18),FURL,32),r);ch(sph('DeerNose',(1.78,0,2.01),(.105,.18,.12),BLACK,24),r)
    for s in [-1,1]:ch(sph(f'Deer_Ear_{s}',(1.10,s*.27,2.37),(.10,.075,.28),FUR,24),r);ch(sph('DeerInnerEar',(1.11,s*.31,2.38),(.055,.025,.18),FURL,20),r);ch(sph('DeerEye',(1.42,s*.255,2.17),(.045,.025,.045),BLACK,18),r)
    for i,(x,y) in enumerate([(-.55,-.24),(-.55,.24),(.55,-.24),(.55,.24)]):ch(cyl(f'Deer_LegUpper_{i}',(x,y,.76),.075,.78,FUR,v=18),r);ch(cyl(f'Deer_LegLower_{i}',(x+.04,y,.28),.045,.62,FURL,v=18),r);ch(cube('DeerHoof',(x+.08,y,.04),(.10,.09,.07),BLACK,.02),r)
    ch(sph('DeerTail',(-1.12,0,1.48),(.18,.16,.26),FURL,22),r);return r

def rabbit():
    r=empty('AAA_RABBIT_ROOT');ch(sph('RabbitBody',(0,0,.38),(.48,.30,.35),RFUR,32),r);ch(sph('RabbitHaunch',(-.32,0,.42),(.36,.31,.38),RFUR,30),r);ch(sph('RabbitHead',(.42,0,.62),(.29,.25,.26),RFUR,32),r);ch(sph('RabbitMuzzle',(.68,0,.57),(.18,.20,.14),FURL,24),r);ch(sph('RabbitNose',(.82,0,.60),(.06,.09,.055),BLACK,18),r)
    for s in [-1,1]:ch(sph(f'Rabbit_Ear_{s}',(.40,s*.14,1.02),(.10,.065,.40),RFUR,24),r);ch(sph('RabbitInnerEar',(.43,s*.17,1.04),(.055,.025,.27),FURL,20),r);ch(sph('RabbitEye',(.57,s*.225,.70),(.045,.026,.045),BLACK,18),r)
    ch(sph('RabbitTail',(-.58,0,.50),(.16,.16,.16),WHITE,20),r)
    for i,(x,y) in enumerate([(-.28,-.20),(-.28,.20),(.28,-.18),(.28,.18)]):ch(sph(f'Rabbit_Paw_{i}',(x,y,.13),(.20,.08,.08),RFUR,18),r)
    return r

def infected():
    r=empty('AAA_INFECTED_ROOT');ch(sph('Torso',(0,0,1.32),(.45,.30,.64),CLOTH,32),r);ch(cube('Jacket',(0,0,1.35),(.40,.28,.50),CLOTH,.12),r);ch(sph('Pelvis',(0,0,.83),(.34,.27,.30),DENIM,26),r);ch(cyl('Neck',(0,0,1.92),.12,.28,SKIN,v=20),r);ch(sph('Skull',(0,0,2.17),(.29,.25,.34),SKIN,38),r);ch(sph('Jaw',(.04,0,1.99),(.25,.23,.18),BRUISE,30),r);ch(sph('Brow',(.19,0,2.28),(.12,.24,.07),BRUISE,24),r);ch(sph('Nose',(.28,0,2.15),(.10,.09,.14),SKIN,22),r)
    for s in [-1,1]:ch(sph('EyeSocket',(.21,s*.13,2.23),(.08,.055,.055),BRUISE,18),r);ch(sph('Eye',(.26,s*.13,2.23),(.035,.022,.035),BLOOD,16),r);ch(sph('Ear',(0,s*.26,2.17),(.06,.035,.10),SKIN,18),r)
    ch(cube('Mouth',(.25,0,2.02),(.035,.12,.04),BLOOD,.015),r)
    for i in range(6):ch(cube('Tooth',(.29,-.09+i*.036,2.035),(.025,.012,.035),PAPER,.003),r)
    ch(sph('TempleWound',(.05,-.24,2.27),(.09,.035,.11),BLOOD,18),r)
    for s in [-1,1]:
      y=s*.43;ch(cyl(f'UpperArm_{s}',(0,y,1.42),.10,.72,CLOTH,(math.radians(s*8),0,0),20),r);ch(cyl(f'Forearm_{s}',(.12,y,.92),.085,.62,SKIN,(math.radians(s*12),0,0),20),r);ch(sph('Hand',(.18,y,.58),(.13,.10,.16),BRUISE,20),r)
      for f in range(4):ch(cyl('Finger',(.28,y+(f-1.5)*.035,.49),.018,.18,SKIN,(0,math.radians(70),0),10),r)
      ch(cyl(f'UpperLeg_{s}',(0,s*.18,.48),.14,.70,DENIM,v=22),r);ch(cyl(f'LowerLeg_{s}',(.05,s*.18,.05),.11,.56,DENIM,v=20),r);ch(cube('Boot',(.18,s*.18,-.24),(.23,.16,.11),BLACK,.05),r)
    return r

clear();a=interior();render('01_interior_spawn',(0,3.15,1.65),(0,-2.2,1.25),27);render('02_cctv_station',(3.1,.55,1.55),(3.05,-2.3,1.35),30);render('03_door47',(0,1.1,1.55),(0,-3.1,1.35),35);export(a,os.path.join(OUT,'shelter47_aaa_interior.glb'))
clear();b=exterior();sunD=bpy.data.lights.new('QA_Sun','SUN');sunD.energy=2.0;sunD.color=(.75,.80,.82);sun=bpy.data.objects.new('QA_Sun',sunD);bpy.context.collection.objects.link(sun);sun.rotation_euler=(math.radians(35),0,math.radians(135));render('04_exterior_yard',(-1,8,2.0),(-5,-3,1.0),31);render('05_exterior_gate',(0,7,2.1),(0,15,1.2),32);export(b,os.path.join(OUT,'shelter47_aaa_exterior.glb'))
clear();d=deer();export(d,os.path.join(OUT,'deer_aaa.glb'))
clear();q=rabbit();export(q,os.path.join(OUT,'rabbit_aaa.glb'))
clear();z=infected();export(z,os.path.join(OUT,'infected_aaa.glb'))
print('AAA_REFERENCE_BUILD_COMPLETE')

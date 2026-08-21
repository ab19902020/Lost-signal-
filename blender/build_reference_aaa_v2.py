import bpy, math, os, random
from mathutils import Vector
random.seed(47)
ROOT=os.getcwd(); OUT=os.path.join(ROOT,'public','assets','blender','aaa_v2'); QA=os.path.join(ROOT,'qa','renders','aaa_v2')
os.makedirs(OUT,exist_ok=True); os.makedirs(QA,exist_ok=True)

def clear(): bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
def mat(n,c,metal=0,rough=.6,emit=None,p=0):
 m=bpy.data.materials.get(n) or bpy.data.materials.new(n);m.use_nodes=True;b=m.node_tree.nodes.get('Principled BSDF');b.inputs['Base Color'].default_value=(*c,1);b.inputs['Metallic'].default_value=metal;b.inputs['Roughness'].default_value=rough
 if emit:
  k='Emission Color' if 'Emission Color' in b.inputs else 'Emission';b.inputs[k].default_value=(*emit,1);b.inputs['Emission Strength'].default_value=p
 return m
def ap(o,m):
 if hasattr(o.data,'materials'):o.data.materials.clear();o.data.materials.append(m)
def smooth(o):
 if o.type=='MESH':
  for f in o.data.polygons:f.use_smooth=True
def cube(n,l,s,m,b=.04,r=(0,0,0)):
 bpy.ops.mesh.primitive_cube_add(location=l,rotation=r);o=bpy.context.object;o.name=n;o.scale=s;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);ap(o,m)
 if b:q=o.modifiers.new('Bevel','BEVEL');q.width=b;q.segments=3
 return o
def cyl(n,l,rad,d,m,r=(0,0,0),v=24):
 bpy.ops.mesh.primitive_cylinder_add(vertices=v,radius=rad,depth=d,location=l,rotation=r);o=bpy.context.object;o.name=n;ap(o,m);smooth(o);return o
def sph(n,l,s,m,v=28):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=v,ring_count=max(12,v//2),location=l);o=bpy.context.object;o.name=n;o.scale=s;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);ap(o,m);smooth(o);return o
def pipe(n,a,b,rad,m):
 a,b=Vector(a),Vector(b);d=b-a;o=cyl(n,(a+b)/2,rad,d.length,m,v=18);o.rotation_mode='QUATERNION';o.rotation_quaternion=d.to_track_quat('Z','Y');return o
def txt(n,body,l,size,m,rot=(-math.pi/2,0,0),align='CENTER'):
 bpy.ops.object.text_add(location=l,rotation=rot);o=bpy.context.object;o.name=n;o.data.body=body;o.data.align_x=align;o.data.align_y='CENTER';o.data.size=size;o.data.extrude=.008;o.data.bevel_depth=.0018;ap(o,m);return o
def empty(n):o=bpy.data.objects.new(n,None);bpy.context.collection.objects.link(o);return o
def ch(o,p):o.parent=p;return o
def point(n,l,c,e=120):d=bpy.data.lights.new(n,'POINT');d.color=c;d.energy=e;d.shadow_soft_size=.7;o=bpy.data.objects.new(n,d);bpy.context.collection.objects.link(o);o.location=l;return o
def spot(n,l,t,c,e=380):d=bpy.data.lights.new(n,'SPOT');d.color=c;d.energy=e;d.spot_size=math.radians(78);d.spot_blend=.68;d.shadow_soft_size=.6;o=bpy.data.objects.new(n,d);bpy.context.collection.objects.link(o);o.location=l;o.rotation_euler=(Vector(t)-Vector(l)).to_track_quat('-Z','Y').to_euler();return o
def export(root,path):
 bpy.ops.object.select_all(action='DESELECT');root.select_set(True)
 for o in root.children_recursive:o.select_set(True)
 bpy.context.view_layer.objects.active=root;bpy.ops.export_scene.gltf(filepath=path,export_format='GLB',use_selection=True,export_yup=True,export_apply=True,export_lights=True)
def cam(n,l,t,lens=30):d=bpy.data.cameras.new(n);d.lens=lens;o=bpy.data.objects.new(n,d);bpy.context.collection.objects.link(o);o.location=l;o.rotation_euler=(Vector(t)-Vector(l)).to_track_quat('-Z','Y').to_euler();bpy.context.scene.camera=o;return o
def render(n,l,t,lens=30):
 c=cam('QA_'+n,l,t,lens);s=bpy.context.scene
 try:s.render.engine='BLENDER_EEVEE_NEXT'
 except:s.render.engine='BLENDER_EEVEE'
 s.render.resolution_x=1280;s.render.resolution_y=720;s.render.resolution_percentage=100;s.render.image_settings.file_format='PNG';s.render.filepath=os.path.join(QA,n+'.png');bpy.ops.render.render(write_still=True);bpy.data.objects.remove(c,do_unlink=True)

CONC=mat('Concrete',(.14,.135,.12),0,.87);CONC2=mat('ConcreteEdge',(.23,.22,.20),0,.8);STEEL=mat('Steel',(.085,.09,.09),.82,.31);STEEL2=mat('PaintedSteel',(.16,.17,.15),.55,.50);BLACK=mat('Black',(.018,.02,.019),.85,.27);OLIVE=mat('Olive',(.13,.15,.085),.32,.64);RUST=mat('Rust',(.30,.075,.022),.4,.76);WOOD=mat('Wood',(.12,.058,.028),0,.62);FAB=mat('Fabric',(.09,.105,.065),0,.9);PAPER=mat('Paper',(.64,.57,.43),0,.93);SCREEN=mat('Screen',(.012,.042,.025),.04,.30,(.07,.9,.3),1.9);SCREEN2=mat('ScreenDim',(.014,.024,.020),.04,.36,(.035,.15,.08),.38);WHITE=mat('White',(.67,.63,.52),.04,.57);LAMP=mat('Lamp',(.75,.53,.24),.04,.24,(1,.63,.29),5);GREEN=mat('Green',(.015,.16,.035),.08,.34,(.03,.9,.12),2.5);GLASS=mat('Glass',(.075,.10,.095),.08,.18);GROUND=mat('Soil',(.047,.042,.03),0,.92);MUD=mat('Mud',(.075,.058,.038),0,.63);GRASS=mat('Grass',(.037,.09,.027),0,.92);DRY=mat('DryGrass',(.14,.12,.055),0,.95);BARK=mat('Bark',(.075,.039,.018),0,.94);LEAF=mat('Leaf',(.018,.067,.018),0,.92);FUR=mat('DeerFur',(.20,.10,.05),0,.94);FURL=mat('DeerLight',(.48,.36,.23),0,.96);RFUR=mat('RabbitFur',(.24,.21,.17),0,.97);SKIN=mat('Skin',(.18,.19,.145),0,.86);BRUISE=mat('Bruise',(.08,.085,.065),0,.92);BLOOD=mat('Blood',(.12,.004,.003),0,.7);DENIM=mat('Denim',(.05,.06,.068),0,.88);CLOTH=mat('Cloth',(.085,.075,.05),0,.93);RUBBER=mat('Rubber',(.015,.017,.016),0,.92);CHROME=mat('Chrome',(.24,.25,.24),.96,.18)

def interior():
 r=empty('AAA_V2_INTERIOR')
 ch(cube('Floor',(0,0,-.12),(5.2,3.8,.12),STEEL2,.02),r)
 for x in [-4,-2,0,2,4]:
  for y in [-2.5,0,2.5]:ch(cube('FloorPlate',(x,y,.015),(.94,1.16,.025),STEEL,.012),r)
 for n,l,s in [('Back',(0,-3.8,1.65),(5.2,.16,1.68)),('Left',(-5.2,0,1.65),(.16,3.8,1.68)),('Right',(5.2,0,1.65),(.16,3.8,1.68)),('Ceiling',(0,0,3.42),(5.2,3.8,.14))]:ch(cube(n,l,s,CONC,.06),r)
 for y in [-2.9,-1.45,0,1.45,2.9]:ch(cube('CeilingRib',(0,y,3.22),(5.0,.07,.09),STEEL,.02),r)
 for x in [-4.55,-4.35,-4.15,3.95,4.18,4.4]:ch(pipe('LongPipe',(x,-3.55,3.00),(x,3.55,3.00),.038,CHROME if int(abs(x)*10)%2 else STEEL2),r)
 for z in [.72,1.05,1.38,2.45]:ch(pipe('BackConduit',(-4.8,-3.55,z),(4.8,-3.55,z),.025,STEEL2),r)
 door=empty('INTERACT_BlastDoor');ch(door,r);ch(cube('DoorFrame',(0,-3.48,1.58),(1.38,.24,1.58),STEEL,.13),door);leaf=cube('DoorLeaf',(0,-3.20,1.58),(1.03,.13,1.36),STEEL2,.10);ch(leaf,door)
 for z in [.47,.96,2.15,2.63]:ch(cube('DoorBrace',(0,-3.05,z),(.89,.055,.05),STEEL,.016),leaf)
 ch(cube('DoorWindow',(0,-3.02,1.79),(.34,.012,.17),SCREEN2,.018),leaf);ch(txt('Restricted','RESTRICTED AREA',(0,-3.005,1.29),.095,PAPER),leaf);ch(txt('Door47Text','47',(0,-3.005,.82),.40,PAPER),leaf)
 ch(cube('Keypad',(1.48,-3.31,1.35),(.12,.08,.27),BLACK,.025),r)
 for i in range(4):ch(cube('KeyLED',(1.48,-3.22,1.49-i*.075),(.025,.006,.014),GREEN,.002),r)
 bed=empty('INTERACT_Bed');ch(bed,r);ch(cube('BedFrame',(3.90,2.12,.42),(1.15,1.45,.10),STEEL,.035),bed);ch(cube('Mattress',(3.90,2.12,.60),(1.05,1.35,.15),FAB,.085),bed);ch(cube('Pillow',(3.90,.98,.80),(.62,.33,.12),WHITE,.10),bed);ch(cube('Blanket',(3.90,2.40,.78),(1.0,.78,.055),OLIVE,.07),bed)
 for i in range(2):
  x=4.30-i*.66;ch(cube(f'INTERACT_Locker_{i+1}',(x,-.40,1.08),(.29,.40,1.05),STEEL2,.035),r);ch(cube('LockerDoor',(x,-.81,1.08),(.27,.025,.98),OLIVE,.02),r)
 ch(cube('WallShelf',(4.20,1.08,2.10),(.70,.26,.045),WOOD,.02),r);ch(cyl('PlantPot',(4.15,.95,2.28),.11,.18,RUST,v=18),r)
 for j in range(7):ch(cyl('PlantStem',(4.15+(j-3)*.025,.95,2.48),.012,.38,GRASS,r=(random.uniform(-.3,.3),random.uniform(-.3,.3),0),v=10),r)
 point('BedWarm',(4.05,1.15,2.42),(1,.60,.29),75)
 radio=empty('INTERACT_Radio');ch(radio,r);ch(cube('CommsDesk',(2.55,-2.10,.73),(.92,.52,.075),WOOD,.04),radio);ch(cube('RadioBody',(2.55,-2.07,.94),(.46,.25,.17),BLACK,.028),radio);ch(cube('RadioScreen',(2.55,-1.81,.97),(.19,.010,.060),SCREEN,.003),radio)
 for i in range(5):ch(cyl('RadioKnob',(2.26+i*.15,-1.80,.88),.028,.028,CHROME,(math.pi/2,0,0),12),radio)
 ch(cube('DeskLampBase',(3.18,-2.03,.91),(.12,.12,.035),BLACK,.018),radio);ch(pipe('LampStem',(3.18,-2.03,.94),(3.18,-2.03,1.39),.022,BLACK),radio);ch(cube('LampShade',(3.18,-1.94,1.40),(.21,.14,.06),BLACK,.025),radio);point('DeskLight',(3.18,-1.80,1.33),(1,.60,.27),95)
 ch(cube('NoticeBoard',(3.70,-3.55,1.95),(.78,.025,.60),WOOD,.025),r);ch(txt('Notice47','47',(3.70,-3.515,1.98),.38,PAPER),r)
 for i in range(7):ch(cube(f'PICKUP_Note_{i+1}',(3.18+(i%4)*.32,-3.505,1.57+(i//4)*.30),(.10,.006,.12),PAPER,.003,r=(0,0,random.uniform(-.12,.12))),r)
 sx=1.35
 for x in [sx-.43,sx+.43]:ch(cube('ShelfPost',(x,-2.75,1.18),(.028,.22,1.14),STEEL,.008),r)
 for z in [.35,.82,1.29,1.76,2.23]:ch(cube('Shelf',(sx,-2.75,z),(.47,.23,.03),STEEL2,.008),r)
 for i in range(7):ch(cube(f'INTERACT_SupplyCrate_{i+1}',(sx+random.uniform(-.28,.28),-2.74,.50+(i%4)*.46),(.15,.15,.12),OLIVE,.02),r)
 ch(cube('INTERACT_Medkit',(sx,-2.49,1.43),(.22,.07,.16),WHITE,.02),r);ch(txt('MedCross','+', (sx,-2.41,1.43),.17,GREEN),r)
 c=empty('INTERACT_CCTV');ch(c,r)
 for i,(x,z) in enumerate([(-3.65,2.33),(-2.50,2.33),(-3.65,1.58),(-2.50,1.58)],1):ch(cube('CCTVFrame'+str(i),(x,-3.48,z),(.51,.06,.29),BLACK,.03),c);ch(cube('CCTVScreen'+str(i),(x,-3.41,z),(.46,.010,.245),SCREEN2,.006),c);ch(txt('Cam'+str(i),f'CAM 0{i}',(x,-3.395,z+.205),.05,PAPER),c)
 ch(cube('CCTVDesk',(-3.10,-2.00,.72),(1.62,.58,.075),WOOD,.04),c)
 comp=empty('INTERACT_Computer');ch(comp,c);ch(cube('ComputerFrame',(-3.70,-1.73,1.28),(.54,.055,.33),BLACK,.035),comp);ch(cube('ComputerScreen',(-3.70,-1.665,1.28),(.49,.010,.28),SCREEN,.006),comp);ch(txt('ComputerText','SHELTER 47',(-3.70,-1.65,1.31),.10,GREEN),comp)
 ch(cube('Keyboard',(-3.55,-1.42,.87),(.52,.20,.03),BLACK,.02),c)
 for rr in range(4):
  for cc in range(10):ch(cube('Key',(-3.95+cc*.088,-1.22-rr*.040,.90),(.033,.022,.010),STEEL2,.003),c)
 ch(cube('ControlConsole',(-2.55,-1.70,.97),(.65,.30,.16),BLACK,.035,r=(math.radians(-9),0,0)),c)
 for i in range(14):ch(cyl('Button',(-3.02+(i%7)*.16,-1.40,1.00+(i//7)*.10),.023,.018,GREEN if i%4==0 else RUST,(math.pi/2,0,0),10),c)
 ch(cyl('PTZStick',(-2.12,-1.41,1.12),.03,.20,BLACK,(math.radians(16),0,0),14),c);ch(sph('PTZTop',(-2.12,-1.38,1.27),(.06,.06,.06),BLACK,16),c)
 for j in range(2):
  ch(cube('StackRadio',(-1.92,-1.93,.83+j*.28),(.40,.26,.12),BLACK,.025),c)
  for k in range(4):ch(cyl('StackKnob',(-2.18+k*.16,-1.66,.83+j*.28),.022,.022,CHROME,(math.pi/2,0,0),10),c)
 ch(cyl('LanternBase',(-4.35,-1.85,.93),.095,.20,BLACK,v=16),c);ch(cyl('LanternGlow',(-4.35,-1.85,1.15),.070,.22,LAMP,v=16),c);point('CCTVWarm',(-4.35,-1.70,1.38),(1,.58,.25),115)
 ch(cube('ChairSeat',(-3.10,-.65,.50),(.37,.37,.085),BLACK,.075),r);ch(cube('ChairBack',(-3.10,-.92,.98),(.37,.075,.47),BLACK,.09,r=(math.radians(-6),0,0)),r);ch(cyl('ChairStem',(-3.10,-.65,.25),.05,.40,CHROME,v=16),r)
 for sidx in range(2):
  x=-4.45;y=.65+sidx*1.40;ch(cube('RightRack',(x,y,1.16),(.47,.52,1.13),STEEL,.035),r)
  for z in [.34,.82,1.30,1.78,2.26]:ch(cube('RackShelf',(x,y,z),(.44,.49,.028),STEEL2,.008),r)
  for j in range(5):ch(cube('RackCrate',(x+random.uniform(-.17,.17),y,.48+j*.39),(.20,.31,.13),OLIVE,.02),r)
 ch(cube('FirstAid',(-4.42,.68,1.60),(.27,.08,.23),WHITE,.02),r);ch(txt('AidCross','+',(-4.42,.59,1.60),.21,GREEN),r)
 g=empty('INTERACT_Generator');ch(g,r);ch(cube('Generator',(-4.28,2.65,.72),(.58,.58,.61),OLIVE,.06),g);ch(cube('GeneratorPanel',(-4.28,2.05,.90),(.29,.025,.22),BLACK,.02),g)
 for i,x in enumerate([-3.2,-1.05,1.05,3.2]):ch(cube('Fixture',(x,.2,3.13),(.66,.14,.05),WHITE,.022),r);ch(cube('Glow',(x,.2,3.07),(.56,.10,.012),LAMP,.006),r);spot('Spot'+str(i),(x,.2,2.99),(x,.2,.2),(1,.80,.57),180)
 point('RoomFill',(0,.2,2.35),(.50,.55,.48),55)
 return r

def terrain(root):
 N=45;size=24;verts=[];faces=[]
 for j in range(N):
  y=-size+2*size*j/(N-1)
  for i in range(N):
   x=-size+2*size*i/(N-1);z=-.16 + .055*math.sin(x*.36)*math.cos(y*.31)+.025*math.sin((x+y)*.8);verts.append((x,y,z))
 for j in range(N-1):
  for i in range(N-1):a=j*N+i;faces.append((a,a+1,a+1+N,a+N))
 me=bpy.data.meshes.new('TerrainMesh');me.from_pydata(verts,[],faces);me.update();o=bpy.data.objects.new('Terrain',me);bpy.context.collection.objects.link(o);ap(o,GROUND);o.parent=root

def grass_field(root,count=3200):
 verts=[];faces=[]
 for k in range(count):
  x=random.uniform(-18.5,18.5);y=random.uniform(-17.5,14.2)
  if abs(x+4)<2.5 and -12<y<13:continue
  h=random.uniform(.16,.48);w=random.uniform(.008,.018);a=random.random()*math.tau;dx=math.cos(a)*w;dy=math.sin(a)*w;base=len(verts);verts += [(x-dx,y-dy,.02),(x+dx,y+dy,.02),(x+dx*.25,y+dy*.25,h),(x-dx*.25,y-dy*.25,h)];faces.append((base,base+1,base+2,base+3))
 me=bpy.data.meshes.new('GrassFieldMesh');me.from_pydata(verts,[],faces);me.update();o=bpy.data.objects.new('GrassField',me);bpy.context.collection.objects.link(o);ap(o,GRASS);o.parent=root

def tree(root,n,x,y,s=1,dead=False):
 for k in range(5):
  z=.55*s+k*.85*s;rad=(.23-k*.025)*s;ch(cyl(n+'Trunk'+str(k),(x,y,z),rad,.92*s,BARK,v=14),root)
 for bi in range(12):
  z=(1.3+bi*.25)*s;a=random.random()*math.tau;L=random.uniform(.8,1.6)*s;e=(x+math.cos(a)*L,y+math.sin(a)*L,z+random.uniform(.15,.55)*s);ch(pipe(n+'Branch'+str(bi),(x,y,z),e,.035*s,BARK),root)
  if not dead:
   for q in range(3):
    ee=(e[0]+random.uniform(-.35,.35)*s,e[1]+random.uniform(-.35,.35)*s,e[2]+random.uniform(-.20,.40)*s);ch(sph(n+'Leaf',ee,(.28*s,.23*s,.34*s),LEAF,12),root)

def bush(root,n,x,y,s=1):
 for i in range(9):ch(sph(n,(x+random.uniform(-.28,.28)*s,y+random.uniform(-.28,.28)*s,.25+random.uniform(.08,.35)*s),(.24*s,.20*s,.25*s),LEAF,12),root)

def pickup(root,x=11,y=-7):
 p=empty('Vehicle_Pickup');ch(p,root);ch(cube('Frame',(x,y,.42),(1.85,.84,.16),STEEL,.07),p);ch(cube('Cab',(x-.55,y,1.02),(.83,.79,.60),OLIVE,.12),p);ch(cube('Roof',(x-.55,y,1.65),(.80,.77,.08),RUST,.04),p);ch(cube('Hood',(x-1.42,y,.82),(.58,.76,.28),OLIVE,.09),p);ch(cube('Bed',(x+1.0,y,.78),(.78,.82,.31),OLIVE,.075),p)
 ch(cube('Windshield',(x-.72,y-.80,1.18),(.48,.018,.28),GLASS,.015,r=(math.radians(-9),0,0)),p);ch(cube('RearGlass',(x-.05,y+.80,1.18),(.38,.018,.25),GLASS,.015),p)
 for side in [-1,1]:ch(cube('DoorPanel',(x-.45,y+side*.81,1.05),(.52,.025,.50),OLIVE,.035),p);ch(cube('Mirror',(x-.86,y+side*.97,1.33),(.13,.04,.09),BLACK,.02),p)
 for wx in [x-1.18,x+1.20]:
  for wy in [y-.83,y+.83]:ch(cyl('Wheel',(wx,wy,.41),.38,.31,RUBBER,(math.pi/2,0,0),28),p);ch(cyl('Hub',(wx,wy,.41),.15,.33,CHROME,(math.pi/2,0,0),20),p)
 ch(cube('Grille',(x-2.02,y,.73),(.05,.58,.22),BLACK,.02),p)
 for i in range(6):ch(cube('GrilleBar',(x-2.08,y-.48+i*.19,.73),(.025,.035,.18),CHROME,.006),p)
 for yy in [y-.52,y+.52]:ch(cyl('Headlight',(x-2.09,yy,.88),.095,.06,WHITE,(0,math.pi/2,0),18),p)
 ch(cube('FrontBumper',(x-2.03,y,.48),(.12,.85,.10),STEEL,.03),p);ch(cube('RearBumper',(x+1.90,y,.50),(.10,.85,.09),STEEL,.03),p)
 for i in range(8):ch(cube('RustPatch',(x+random.uniform(-1.6,1.4),y+random.choice([-.84,.84]),random.uniform(.55,1.35)),(.08,.008,.07),RUST,.008),p)

def exterior():
 r=empty('AAA_V2_EXTERIOR');terrain(r);grass_field(r)
 for i in range(9):ch(cube('WalkSlab',(-5.0,-10+i*2.4,.015),(1.15,1.05,.045),CONC2,.025,r=(0,0,random.uniform(-.03,.03))),r)
 bx,by=-7,-5;ch(cube('BunkerMass',(bx,by,.90),(2.75,2.25,.90),CONC,.20),r);ch(cube('PortalFrame',(bx,by+2.28,1.02),(1.30,.20,1.17),STEEL,.09),r);ch(cube('EntranceDoor',(bx,by+2.50,1.06),(.88,.09,.98),STEEL2,.065),r);ch(txt('Exterior47','47',(bx,by+2.60,.81),.40,PAPER),r);ch(cube('ReturnPanel',(bx+1.36,by+2.38,1.15),(.10,.07,.22),BLACK,.018),r)
 for i in range(55):
  a=random.uniform(-2.3,2.3);z=random.uniform(.25,2.0);yy=by+2.32+random.uniform(-.08,.12);ch(sph('Ivy',(bx+a,yy,z),(.12,.06,.10),LEAF,10),r)
 def fence(pref,A,B,n):
  A=Vector((A[0],A[1],0));B=Vector((B[0],B[1],0))
  for i in range(n+1):p=A.lerp(B,i/n);ch(cyl(pref+'Post',(p.x,p.y,1.30),.055,2.6,BLACK,v=12),r)
  ch(pipe(pref+'Top',(A.x,A.y,2.48),(B.x,B.y,2.48),.033,BLACK),r);ch(pipe(pref+'Mid',(A.x,A.y,1.25),(B.x,B.y,1.25),.025,BLACK),r)
  for i in range(n):
   p0=A.lerp(B,i/n);p1=A.lerp(B,(i+1)/n)
   for q in range(4):
    t=q/4;u=(q+1)/4;a=p0.lerp(p1,t);b=p0.lerp(p1,u);ch(pipe(pref+'WireA',(a.x,a.y,.15),(b.x,b.y,2.36),.006,STEEL2),r);ch(pipe(pref+'WireB',(a.x,a.y,2.36),(b.x,b.y,.15),.006,STEEL2),r)
 fence('FN',(-19,15),(19,15),10);fence('FW',(-19,-18),(-19,15),9);fence('FE',(19,-18),(19,15),9);fence('FS',(-19,-18),(19,-18),10)
 ch(cube('INTERACT_MainGate_Left',(-1.28,14.92,1.25),(1.18,.055,1.18),BLACK,.018),r);ch(cube('INTERACT_MainGate_Right',(1.28,14.92,1.25),(1.18,.055,1.18),BLACK,.018),r)
 ch(cyl('FloodPole',(5,4.5,4.2),.10,8.4,BLACK,v=16),r);ch(cube('FloodBar',(5,4.5,8.13),(1.0,.10,.07),BLACK,.018),r)
 for fx in [4.35,4.8,5.2,5.65]:ch(cube('FloodLamp',(fx,4.35,8.02),(.22,.14,.18),STEEL,.035),r);spot('Flood'+str(fx),(fx,4.20,7.82),(fx,0,0),(1,.86,.66),780)
 for i in range(18):
  x=random.uniform(-15,15);y=random.uniform(-14,11)
  if abs(x+7)>4 or abs(y+5)>4:ch(cube('INTERACT_Crate_'+str(i),(x,y,.30),(.42,.50,.30),OLIVE,.045,r=(0,0,random.uniform(-.35,.35))),r)
 ch(cube('UtilityCabinet',(-14,-1,1.05),(.58,.37,1.05),STEEL2,.05),r)
 for i in range(14):x=random.uniform(-15,15);y=random.uniform(-14,12);ch(cube('Puddle',(x,y,.012),(random.uniform(.45,1.5),random.uniform(.25,.85),.008),GLASS,.003,r=(0,0,random.random()*math.pi)),r)
 for i in range(42):
  side=random.choice('NSEWII')
  if side=='I':x=random.uniform(-16,16);y=random.uniform(-15,12)
  elif side=='N':x=random.uniform(-26,26);y=random.uniform(17,29)
  elif side=='S':x=random.uniform(-26,26);y=random.uniform(-31,-20)
  elif side=='E':x=random.uniform(21,31);y=random.uniform(-25,22)
  else:x=random.uniform(-31,-21);y=random.uniform(-25,22)
  tree(r,'Tree'+str(i),x,y,random.uniform(.72,1.25),i%11==0)
 for i in range(70):bush(r,'Bush'+str(i),random.uniform(-18,18),random.uniform(-17,14),random.uniform(.65,1.3))
 for i in range(55):ch(sph('Rock',(random.uniform(-18,18),random.uniform(-17,14),.12),(random.uniform(.08,.28),random.uniform(.08,.25),random.uniform(.07,.20)),CONC2,10),r)
 pickup(r);point('EntranceWarm',(bx,by+2.72,2.25),(1,.66,.36),145);return r

def deer():
 r=empty('AAA_V2_DEER');ch(sph('Body',(0,0,1.18),(1.0,.38,.55),FUR,42),r);ch(sph('Chest',(.62,0,1.30),(.52,.42,.62),FUR,38),r);ch(sph('Rump',(-.70,0,1.24),(.57,.41,.53),FUR,38),r);ch(cyl('Neck',(.82,0,1.76),.18,.95,FUR,(0,math.radians(25),0),28),r);ch(sph('Head',(1.20,0,2.08),(.40,.27,.29),FUR,42),r);ch(sph('Muzzle',(1.50,0,1.99),(.31,.20,.17),FURL,36),r);ch(sph('Nose',(1.75,0,2.00),(.10,.16,.11),BLACK,24),r)
 for s in [-1,1]:ch(sph('Deer_Ear'+str(s),(1.10,s*.26,2.36),(.09,.065,.27),FUR,26),r);ch(sph('InnerEar',(1.11,s*.295,2.36),(.045,.018,.17),FURL,20),r);ch(sph('Eye',(1.40,s*.245,2.16),(.042,.024,.040),BLACK,18),r);ch(sph('EyeLid',(1.39,s*.252,2.185),(.055,.018,.025),FUR,18),r)
 ch(sph('ChestPatch',(.67,-.01,1.30),(.26,.38,.34),FURL,28),r)
 for i,(x,y) in enumerate([(-.55,-.23),(-.55,.23),(.55,-.23),(.55,.23)]):ch(cyl('Deer_LegUpper_'+str(i),(x,y,.76),.070,.78,FUR,v=20),r);ch(cyl('Deer_LegLower_'+str(i),(x+.04,y,.28),.042,.62,FURL,v=18),r);ch(cube('Hoof',(x+.08,y,.03),(.095,.08,.065),BLACK,.02),r)
 ch(sph('Tail',(-1.12,0,1.46),(.17,.15,.25),FURL,22),r);return r

def rabbit():
 r=empty('AAA_V2_RABBIT');ch(sph('Body',(0,0,.38),(.48,.30,.35),RFUR,38),r);ch(sph('Haunch',(-.34,0,.42),(.36,.31,.38),RFUR,34),r);ch(sph('Chest',(.24,0,.48),(.30,.27,.31),RFUR,32),r);ch(sph('Head',(.45,0,.65),(.29,.24,.25),RFUR,38),r);ch(sph('Muzzle',(.69,0,.58),(.17,.19,.13),FURL,28),r);ch(sph('Nose',(.82,0,.61),(.055,.08,.05),BLACK,18),r)
 for s in [-1,1]:ch(sph('Rabbit_Ear'+str(s),(.40,s*.13,1.03),(.085,.055,.40),RFUR,28),r);ch(sph('InnerEar',(.42,s*.155,1.04),(.045,.018,.28),FURL,22),r);ch(sph('Eye',(.58,s*.22,.71),(.04,.023,.04),BLACK,18),r)
 ch(sph('Tail',(-.60,0,.50),(.16,.16,.16),WHITE,22),r)
 for i,(x,y) in enumerate([(-.30,-.19),(-.30,.19),(.29,-.17),(.29,.17)]):ch(sph('Rabbit_Paw'+str(i),(x,y,.13),(.20,.07,.07),RFUR,20),r)
 return r

def infected():
 r=empty('AAA_V2_INFECTED');ch(sph('Torso',(0,0,1.34),(.44,.29,.62),CLOTH,36),r);ch(cube('Jacket',(0,0,1.36),(.39,.27,.48),CLOTH,.11),r);ch(sph('Pelvis',(0,0,.84),(.33,.26,.29),DENIM,30),r);ch(cyl('Neck',(0,0,1.92),.115,.28,SKIN,v=22),r);ch(sph('Skull',(0,0,2.18),(.28,.24,.33),SKIN,42),r);ch(sph('Jaw',(.05,0,2.00),(.24,.22,.17),BRUISE,34),r);ch(sph('Brow',(.18,0,2.29),(.11,.23,.065),BRUISE,30),r);ch(sph('Nose',(.27,0,2.16),(.09,.08,.13),SKIN,26),r)
 for s in [-1,1]:ch(sph('EyeSocket',(.205,s*.125,2.23),(.075,.052,.052),BRUISE,22),r);ch(sph('Eye',(.252,s*.125,2.23),(.031,.020,.031),BLOOD,18),r);ch(sph('Ear',(0,s*.245,2.17),(.055,.032,.095),SKIN,20),r)
 ch(cube('Mouth',(.245,0,2.02),(.028,.115,.038),BLOOD,.012),r)
 for i in range(6):ch(cube('Tooth',(.275,-.088+i*.035,2.035),(.020,.010,.030),PAPER,.003),r)
 ch(sph('TempleWound',(.04,-.23,2.29),(.085,.03,.10),BLOOD,18),r)
 for i in range(10):ch(cyl('Hair',(random.uniform(-.18,.12),random.uniform(-.15,.15),2.48),.008,random.uniform(.10,.22),BLACK,r=(random.uniform(-.5,.5),random.uniform(-.5,.5),0),v=8),r)
 for i in range(6):ch(cube('TornJacket',(random.choice([-.42,.42]),random.uniform(-.18,.18),random.uniform(1.05,1.60)),(.05,.04,.16),CLOTH,.012,r=(random.uniform(-.3,.3),0,random.uniform(-.3,.3))),r)
 for s in [-1,1]:
  y=s*.42;ch(cyl('UpperArm'+str(s),(0,y,1.42),.095,.70,CLOTH,(math.radians(s*8),0,0),20),r);ch(cyl('Forearm'+str(s),(.12,y,.92),.080,.60,SKIN,(math.radians(s*12),0,0),20),r);ch(sph('Hand',(.18,y,.58),(.12,.095,.15),BRUISE,22),r)
  for f in range(4):ch(cyl('Finger',(.28,y+(f-1.5)*.033,.49),.016,.17,SKIN,(0,math.radians(70),0),10),r)
  ch(cyl('UpperLeg'+str(s),(0,s*.18,.48),.135,.68,DENIM,v=22),r);ch(cyl('LowerLeg'+str(s),(.05,s*.18,.05),.105,.55,DENIM,v=20),r);ch(cube('Boot',(.18,s*.18,-.24),(.22,.15,.10),BLACK,.05),r)
 return r

clear();a=interior();render('01_interior_spawn',(0,3.25,1.68),(0,-2.25,1.30),27);render('02_cctv_station',(-3.1,.65,1.55),(-3.1,-2.75,1.45),30);render('03_door47',(0,1.25,1.55),(0,-3.20,1.42),34);export(a,os.path.join(OUT,'shelter47_aaa_v2_interior.glb'))
clear();b=exterior();sd=bpy.data.lights.new('Sun','SUN');sd.energy=2.1;sd.color=(.72,.78,.80);so=bpy.data.objects.new('Sun',sd);bpy.context.collection.objects.link(so);so.rotation_euler=(math.radians(38),0,math.radians(132));bpy.context.scene.world.color=(.09,.11,.12);render('04_exterior_yard',(0,7,1.9),(-6,-4,1.0),29);render('05_exterior_gate',(0,7,2.0),(0,15,1.2),31);render('06_vehicle',(8,-1,1.55),(11,-7,.8),36);export(b,os.path.join(OUT,'shelter47_aaa_v2_exterior.glb'))
clear();d=deer();point('QADeer',(3,-4,3),(1,.75,.55),500);render('07_deer',(4,-5,2.4),(.6,0,1.2),55);export(d,os.path.join(OUT,'deer_aaa_v2.glb'))
clear();q=rabbit();point('QARabbit',(2,-3,2),(1,.75,.55),350);render('08_rabbit',(2.6,-3.5,1.2),(.25,0,.45),60);export(q,os.path.join(OUT,'rabbit_aaa_v2.glb'))
clear();z=infected();point('QAZombie',(3,-4,3),(1,.65,.5),450);render('09_infected',(3.2,-4,1.8),(0,0,1.2),58);export(z,os.path.join(OUT,'infected_aaa_v2.glb'))
print('AAA_V2_COMPLETE')

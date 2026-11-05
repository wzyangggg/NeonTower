"""Editable Z-up Blender model, inspired by the supplied vintage mobile wine bar.
Export vertex-coloured game mesh as X/Y-up/Z (1m = 25 game units).
"""
import bpy, math, json
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'source-assets' / 'drink-truck'
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def material(name, color, metallic=0, roughness=.4):
    m = bpy.data.materials.new(name)
    rgb = tuple(int(color[i:i+2],16)/255 for i in (1,3,5))
    m.diffuse_color = (*rgb,1)
    m.use_nodes = True
    bs = m.node_tree.nodes.get('Principled BSDF')
    linear=tuple(v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in rgb)
    bs.inputs['Base Color'].default_value = (*linear,1)
    bs.inputs['Metallic'].default_value = metallic
    bs.inputs['Roughness'].default_value = roughness
    return m

wine = material('01 • Oxblood burgundy enamel','#51212D',.25)
cream = material('02 • Warm ivory paint','#E7DBC0',.15)
canvas = material('03 • Sand canvas canopy','#CBB88E',0,.85)
glass = material('04 • Blue smoke glass','#597D86',.35,.18)
rubber = material('05 • Tyres and window seals','#192129',0,.85)
chrome = material('06 • Brushed chrome','#B8C5C9',.8,.24)
wood = material('07 • Dark walnut shelving','#38241D',0,.65)
oak = material('08 • Polished oak counter','#B8844B',0,.32)
gold = material('09 • Brass fittings','#D0A65A',.65)
lamp = material('10 • Warm headlamp','#FFF0C1',.15)
tail = material('11 • Red tail lamp','#C54F46')
green = material('12 • Green bottle glass','#345343',.2)
amber = material('13 • Amber bottle glass','#82522D',.2)
redglass = material('14 • Dark red bottle glass','#4A283B',.2)
label = material('15 • Cream bottle labels','#F1E0B6',0,.7)
dark = material('16 • Interior and chassis','#24282B',.2)

def emissive(m,strength):
    m['game_emission']=True
    bs=m.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Emission Color'].default_value=bs.inputs['Base Color'].default_value
    bs.inputs['Emission Strength'].default_value=strength
    return m

neon=emissive(material('17 • Bar neon rose','#FF568E'),3)
neoncore=emissive(material('18 • Bar neon pale core','#FFE1EC'),3)
emissive(lamp,4)

def finish(o,name,m):
    o.name=name; o.data.materials.append(m); return o

def box(name,at,size,m,bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1,location=at)
    o=bpy.context.object; o.scale=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        mod=o.modifiers.new('Soft manufactured edges','BEVEL');mod.width=bevel;mod.segments=3
        bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name)
        mod=o.modifiers.new('Weighted panel normals','WEIGHTED_NORMAL')
    return finish(o,name,m)

def cyl(name,at,r,depth,m,axis=(0,0,1),n=20):
    bpy.ops.mesh.primitive_cylinder_add(vertices=n,radius=r,depth=depth,location=at)
    o=bpy.context.object;o.rotation_mode='QUATERNION';o.rotation_quaternion=Vector((0,0,1)).rotation_difference(Vector(axis))
    return finish(o,name,m)

def mesh(name,verts,faces,m):
    d=bpy.data.meshes.new(name);d.from_pydata(verts,[],faces);d.update()
    o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);return finish(o,name,m)

def rod(name,a,b,r,m):
    return cyl(name,(Vector(a)+Vector(b))/2,r,(Vector(b)-Vector(a)).length,m,Vector(b)-Vector(a),12)

def torus(name,at,major,minor,m,axis=(0,1,0)):
    bpy.ops.mesh.primitive_torus_add(major_segments=32,minor_segments=8,major_radius=major,minor_radius=minor,location=at)
    o=bpy.context.object;o.rotation_mode='QUATERNION';o.rotation_quaternion=Vector((0,0,1)).rotation_difference(Vector(axis))
    return finish(o,name,m)

def wheel_well(body,x):
    cutter=cyl('Temporary wheel well',(x,0,.52),.55,3,rubber,(0,1,0),32)
    bpy.context.view_layer.objects.active=body
    mod=body.modifiers.new('True open wheel arch','BOOLEAN');mod.operation='DIFFERENCE';mod.object=cutter
    bpy.ops.object.modifier_apply(modifier=mod.name);bpy.data.objects.remove(cutter,do_unlink=True)

# Coherent chassis, four wheels at the same axle height, and open wheel arches.
box('Steel ladder chassis',(-.05,0,.43),(5.72,1.72,.20),dark,.06)
body=box('Continuous burgundy lower body',(-.02,0,1.06),(6.02,2.13,1.15),wine,.20)
for x in (-1.93,1.98):
    wheel_well(body,x)
    cyl('Axle',(x,0,.52),.07,2.28,dark,(0,1,0),12)
    for side in (-1,1):
        y=side*1.045
        torus('Rubber tyre',(x,y,.52),.365,.14,rubber)
        cyl('Recessed wheel rim',(x,side*1.18,.52),.30,.045,chrome,(0,1,0),32)
        cyl('Burgundy wheel centre',(x,side*1.21,.52),.205,.048,wine,(0,1,0),24)
        cyl('Chrome hubcap',(x,side*1.245,.52),.145,.065,chrome,(0,1,0),24)
        for i in range(5):
            a=i*math.tau/5
            cyl('Wheel lug',(x+math.cos(a)*.235,side*1.216,.52+math.sin(a)*.235),.022,.018,dark,(0,1,0),8)
        # Half-circle body lip follows the cutout, leaving the wheel free.
        v=[]
        for i in range(25):
            a=i*math.pi/24
            for rr in (.56,.60):v.append((x+math.cos(a)*rr,side*1.077,.52+math.sin(a)*rr))
        mesh('Ivory wheel arch bead',v,[(2*i,2*i+1,2*i+3,2*i+2) for i in range(24)],cream)

# Flat-nosed split-window cab: rounded lower nose and a raked upper windscreen.
cab=mesh('Raked ivory upper cab',[(1.055,-1.04,1.57),(3.04,-1.04,1.57),(3.04,1.04,1.57),(1.055,1.04,1.57),(1.055,-1.04,2.69),(2.88,-1.04,2.69),(2.88,1.04,2.69),(1.055,1.04,2.69)],[(3,2,1,0),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7),(4,5,6,7)],cream)
mod=cab.modifiers.new('Rounded cab corners','BEVEL');mod.width=.065;mod.segments=3
mod=cab.modifiers.new('Cab panel normals','WEIGHTED_NORMAL')
box('Rounded ivory cab roof',(2.0,0,2.75),(2.12,2.19,.20),cream,.10)
for side in (-1,1):
    y=side*1.047
    # Side windows use a dark gasket and a smaller glass pane.
    verts=[(1.16,y,1.85),(2.83,y,1.85),(2.69,y,2.58),(1.20,y,2.58)]
    mesh('Cab side rubber window seal',verts,[(0,1,2,3)],rubber)
    verts=[(1.23,y+side*.007,1.91),(2.75,y+side*.007,1.91),(2.63,y+side*.007,2.51),(1.26,y+side*.007,2.51)]
    mesh('Cab side glass',verts,[(0,1,2,3)],glass)
    rod('Window division',(2.19,y+side*.018,1.9),(2.12,y+side*.018,2.52),.023,cream)
    rod('Door seam',(1.14,side*1.074,.96),(1.14,side*1.074,1.72),.009,dark)
    box('Door handle',(1.40,side*1.093,1.64),(.22,.035,.045),chrome,.015)
    rod('Mirror arm',(2.79,side*1.05,1.97),(2.88,side*1.34,2.09),.022,chrome)
    box('Side mirror',(2.86,side*1.36,2.13),(.12,.07,.23),chrome,.04)
    # Two front panes with a centre split and ivory perimeter.
    y0,y1=sorted((side*.055,side*.91))
    mesh('Front split windshield gasket',[(3.015,y0,1.87),(3.015,y1,1.87),(2.91,y1,2.56),(2.91,y0,2.56)],[(0,1,2,3)],rubber)
    mesh('Front split windshield glass',[(3.021,y0+.028,1.915),(3.021,y1-.028,1.915),(2.925,y1-.028,2.51),(2.925,y0+.028,2.51)],[(0,1,2,3)],glass)
    rod('Windscreen wiper',(3.036,side*.20,1.92),(2.995,side*.68,2.10),.012,dark)
    cyl('Headlamp chrome surround',(3.01,side*.72,1.03),.185,.065,chrome,(1,0,0),32)
    cyl('Round warm headlamp',(3.052,side*.72,1.03),.145,.02,lamp,(1,0,0),32)
    box('Amber front indicator',(2.99,side*.94,1.52),(.045,.14,.10),amber,.025)

# The cream V and central circular badge are the reference van's signature.
mesh('Ivory V nose',[(3.02,-.98,1.66),(3.12,0,.94),(3.02,.98,1.66)],[(0,1,2)],cream)
torus('Circular nose badge',(3.13,0,1.47),.19,.022,chrome,(1,0,0))
for pts in [[(-.12,1.56),(-.06,1.43),(0,1.56)], [(-.12,1.43),(-.06,1.32),(0,1.43),(.06,1.32),(.12,1.43)]]:
    for a,b in zip(pts,pts[1:]):rod('Badge monogram',(3.153,*a),(3.153,*b),.012,chrome)
box('Front ivory bumper',(3.14,0,.65),(.15,2.25,.14),cream,.06)
box('Rear ivory bumper',(-3.10,0,.64),(.15,2.22,.14),cream,.05)
for s in (-1,1):box('Rear red lamp',(-3.052,s*.86,1.13),(.05,.16,.24),tail,.035)
for s in (-1,1):
    box('Beltline chrome trim',(-.03,s*1.075,1.67),(5.89,.035,.035),chrome,.012)
    box('Lower ivory side trim',(-.05,s*1.078,.77),(5.83,.035,.055),cream,.012)

# Rear service module. The camera-facing side is open and fully stocked.
box('Bar back panel',(-1.08,.91,2.02),(3.88,.10,.78),wood,.025)
box('Counter lower plinth',(-1.06,0,1.68),(3.84,2.10,.12),cream,.025)
box('Walnut serving counter',(-1.06,-.69,1.78),(3.92,.93,.105),oak,.035)
for z in (1.82,2.22):
    box('Bottle shelf',(-1.09,.36,z),(3.72,.79,.075),oak,.015)
    rod('Brass shelf guard',(-2.91,-.06,z+.13),(.73,-.06,z+.13),.013,gold)
for x in (-2.98,.88):
    for y in (-.98,.96):rod('Canopy upright',(x,y,1.70),(x,y,2.98),.031,gold)

def bottle(x,y,z,i):
    m=[green,redglass,amber][i%3]
    cyl('Wine bottle body',(x,y,z+.15),.057,.26,m,n=12)
    bpy.ops.mesh.primitive_cone_add(vertices=12,radius1=.057,radius2=.023,depth=.065,location=(x,y,z+.3125))
    finish(bpy.context.object,'Bottle shoulder',m)
    cyl('Bottle neck',(x,y,z+.39),.023,.095,m,n=10)
    cyl('Bottle foil capsule',(x,y,z+.435),.026,.048,gold if i%4==0 else wine,n=10)
    box('Bottle paper label',(x,y-.058,z+.15),(.075,.005,.094),label,.006)

for row,z in enumerate((1.86,2.26)):
    for i in range(19):bottle(-2.77+i*.185,.31,z,i+row)
for i in range(3):bottle(-2.3+i*.27,-.72,1.84,i)
for i in range(4):
    x=-.20+i*.20
    cyl('Wine glass foot',(x,-.75,1.85),.050,.012,chrome,n=14)
    cyl('Wine glass stem',(x,-.75,1.91),.009,.12,chrome,n=8)
    bpy.ops.mesh.primitive_cone_add(vertices=14,radius1=.032,radius2=.064,depth=.11,location=(x,-.75,2.02))
    finish(bpy.context.object,'Wine goblet bowl',glass)

# Rounded canvas barrel roof, narrow cream valance, and raised gold sign.
steps=24;v=[]
for x in (-3.12,1.0):
    for j in range(steps+1):
        y=-1.13+j*2.26/steps
        v.append((x,y,2.94+.23*math.sqrt(max(0,1-(y/1.16)**2))))
roof=mesh('Curved sand canvas roof',v,[(j,j+1,steps+2+j,steps+1+j) for j in range(steps)],canvas)
mod=roof.modifiers.new('Canvas thickness','SOLIDIFY');mod.thickness=.035
for side in (-1,1):
    box('Cream canopy valance',(-1.06,side*1.13,2.91),(4.16,.045,.14),cream,.025)
    for i in range(20):
        x=-3.0+i*.205
        # Small hanging curves rather than a flat rectangular roof edge.
        cyl('Canvas scalloped edge',(x,side*1.13,2.865),.080,.035,canvas,(0,1,0),12)
    box('Burgundy bar fascia',(-1.08,side*1.092,1.40),(3.48,.035,.32),wine,.03)
    box('Fine brass fascia rule',(-1.08,side*1.118,1.26),(3.39,.012,.013),gold)

def text(name,body,at,size,rotation,m):
    d=bpy.data.curves.new(name,'FONT');d.body=body;d.align_x='CENTER';d.align_y='CENTER';d.size=size;d.extrude=.0015
    o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);o.location=at;o.rotation_euler=rotation;o.data.materials.append(m)
    bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');o.select_set(False)
    return bpy.context.object

bpy.ops.object.select_all(action='DESELECT')
text('Wine bar lettering','THE NIGHT BAR',(-1.08,-1.116,1.43),.19,(math.pi/2,0,0),cream)
text('Small wine bar tagline','WINE  /  SPIRITS  /  GOOD TIMES',(-1.08,-1.119,1.31),.065,(math.pi/2,0,0),gold)

# A generated neon decal on an editable roof sign, tilted toward the game camera.
tilt=math.radians(35);up=Vector((0,math.sin(tilt),math.cos(tilt)))
normal=Vector((0,-math.cos(tilt),math.sin(tilt)))
base=Vector((-1.02,-.94,3.30))
plate=box('Roof Bar sign • dark backing',base+up*.59,(3.60,.065,1.26),dark,.065)
plate.rotation_euler.x=-tilt
for x in (-2.35,.31):rod('Bar sign • brass mounting foot',(x,-.76,3.09),(x,-.94,3.36),.035,gold)

def signpoint(u,v,offset):return base+Vector((u,0,0))+up*v+normal*offset
# AI-generated transparent cursive lettering on one emissive alpha plane.
image=bpy.data.images.load(str(ROOT/'dist'/'assets'/'bar-neon.png'));image.pack()
m=bpy.data.materials.new('Bar • generated neon texture');m.use_nodes=True
nodes=m.node_tree.nodes;nodes.clear()
tex=nodes.new('ShaderNodeTexImage');tex.image=image
em=nodes.new('ShaderNodeEmission');em.inputs['Strength'].default_value=1.6
transparent=nodes.new('ShaderNodeBsdfTransparent');mix=nodes.new('ShaderNodeMixShader');output=nodes.new('ShaderNodeOutputMaterial')
links=m.node_tree.links
links.new(tex.outputs['Color'],em.inputs['Color']);links.new(tex.outputs['Alpha'],mix.inputs[0])
links.new(transparent.outputs[0],mix.inputs[1]);links.new(em.outputs[0],mix.inputs[2]);links.new(mix.outputs[0],output.inputs['Surface'])
o=mesh('Bar • generated emissive decal',[signpoint(-1.75,0,.065),signpoint(1.75,0,.065),signpoint(1.75,1.167,.065),signpoint(-1.75,1.167,.065)],[(0,1,2,3)],m)
uv=o.data.uv_layers.new(name='Neon UV')
for polygon in o.data.polygons:
    for li,coord in zip(polygon.loop_indices,[(0,0),(1,0),(1,1),(0,1)]):uv.data[li].uv=coord
o['exclude_game']=True;o['texture_decal']=True

# Reference image remains packed in the editable source for future modelling work.
reference=Path(r'C:/Users/Administrator/AppData/Local/Temp/codex-clipboard-f9031efe-9544-4134-b936-cb04c35c8fb8.png')
if reference.exists():
    img=bpy.data.images.load(str(reference));img.pack()

# Studio staging (excluded from export).
scene=bpy.context.scene
scene.render.engine='CYCLES';scene.cycles.samples=32
scene.world.color=(.18,.18,.18)
floor=box('STUDIO • ground',(0,0,-.11),(200,200,.16),material('Studio backdrop','#303A42',0,.8))
floor['exclude_game']=True
def aim(o,at):o.rotation_euler=(Vector(at)-o.location).to_track_quat('-Z','Y').to_euler()
for name,at,power,size in [('Key',(3,-5,9),1900,7),('Fill',(-4,-2,5),1100,6),('Rim',(2,5,7),2100,5)]:
    d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='DISK';d.size=size
    o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=at;aim(o,(0,0,1.3))
d=bpy.data.cameras.new('Presentation Camera');cam=bpy.data.objects.new('Presentation Camera',d);scene.collection.objects.link(cam)
cam.location=(8,-11,6.5);aim(cam,(0,0,1.55));d.type='ORTHO';d.ortho_scale=8.8;scene.camera=cam
scene.render.resolution_x=1400;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX'
scene.render.image_settings.file_format='PNG';scene.render.filepath=str(OUT/'drink-truck-studio.png')

# Evaluated modifiers and normals, with consistent handedness under Z-up -> Y-up.
out=[];deps=bpy.context.evaluated_depsgraph_get()
for obj in scene.objects:
    if obj.type!='MESH' or obj.get('exclude_game'):continue
    evaluated=obj.evaluated_get(deps);data=evaluated.to_mesh();data.calc_loop_triangles()
    nm=obj.matrix_world.to_3x3().inverted().transposed()
    for tri in data.loop_triangles:
        m=data.materials[tri.material_index];c=tuple(m.diffuse_color[:3])
        for loop_i in tri.loops:
            loop=data.loops[loop_i];p=obj.matrix_world@data.vertices[loop.vertex_index].co
            n=(nm@data.corner_normals[loop_i].vector).normalized()
            normal_game=(0,2,0) if m.get('game_emission') else (n.x,n.z,-n.y)
            out.extend(round(a,5) for a in (p.x*25,p.z*25,-p.y*25,*normal_game,*c))
    evaluated.to_mesh_clear()
asset=ROOT/'dist'/'assets'/'drink-truck.js'
asset.write_text('globalThis.DrinkTruckMesh=new Float32Array('+json.dumps(out,separators=(',',':'))+');\n',encoding='utf8')
(OUT/'mesh-info.json').write_text(json.dumps({'triangles':len(out)//27,'vertices':len(out)//9,'scale':25,'reference':'User supplied vintage wine bar van','game_asset':'dist/assets/drink-truck.js'},indent=2),encoding='utf8')

for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type=='VIEW_3D':
            area.spaces.active.region_3d.view_perspective='CAMERA'
            area.spaces.active.shading.type='MATERIAL'
            area.spaces.active.overlay.show_overlays=False
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'night-bar-van.blend'))
for obj in scene.objects:
    obj.select_set(obj.type=='MESH' and (not obj.get('exclude_game') or obj.get('texture_decal',False)))
bpy.ops.wm.obj_export(filepath=str(OUT/'night-bar-van.obj'),export_selected_objects=True,export_materials=True)
bpy.ops.render.render(write_still=True)
print('DRINK TRUCK EXPORTED',len(out)//27,'triangles',asset)

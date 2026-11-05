"""Run inside the user's open Blender. Keeps the existing scene, creates a new studio.
Exports the authored mesh, not a second procedural approximation, to the WebGL game.
"""
import bpy, math, json, traceback
from pathlib import Path
from mathutils import Vector, Matrix

ROOT = Path(r'H:/CodexProjects/hell-elevator-codex/hell-elevator')
OUT = ROOT / 'source-assets/cyber-facilities'
OUT.mkdir(parents=True, exist_ok=True)
scene = bpy.data.scenes.new('CYBER FACILITIES - six editable assets')
bpy.context.window.scene = scene
collection = None
objects = []

def material(name, color, emission=False):
    m=bpy.data.materials.new('Cyber / '+name)
    rgb=tuple(int(color[i:i+2],16)/255 for i in (1,3,5))
    m.diffuse_color=(*rgb,1); m['emission']=emission; m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF')
    linear=tuple(c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4 for c in rgb)
    p.inputs['Base Color'].default_value=(*linear,1)
    p.inputs['Metallic'].default_value=.65 if not emission else .15
    p.inputs['Roughness'].default_value=.32
    if emission:
        p.inputs['Emission Color'].default_value=(*linear,1)
        p.inputs['Emission Strength'].default_value=2.5
    return m

dark=material('Graphite recess','#182333')
steel=material('Titanium blue grey','#566b80')
white=material('Ceramic silver armor','#c4d3df')
edge=material('Bright machined edges','#879fb4')
black=material('Deep socket','#080f1d')
orange=material('Warning amber','#f1a443')
cyan=material('Ion cyan','#51ddff',True)
mint=material('Medical mint','#72ffb0',True)
amber=material('Missile amber','#ff9a40',True)
teal=material('Shield turquoise','#61ffe1',True)

def finish(o,name,m,bevel=0):
    o.name=name
    for c in list(o.users_collection): c.objects.unlink(o)
    collection.objects.link(o); o.data.materials.append(m)
    if bevel:
        bpy.context.view_layer.objects.active=o
        b=o.modifiers.new('Machined chamfer','BEVEL'); b.width=bevel; b.segments=1
        bpy.ops.object.modifier_apply(modifier=b.name)
    objects.append(o); return o

def box(name,p,s,m,bevel=.6):
    bpy.ops.mesh.primitive_cube_add(size=1,location=p)
    o=bpy.context.object; o.scale=s
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    return finish(o,name,m,bevel)

def cyl(name,p,r,d,m,axis=(0,1,0),v=12):
    bpy.ops.mesh.primitive_cylinder_add(vertices=v,radius=r,depth=d,location=p)
    o=bpy.context.object; o.rotation_mode='QUATERNION'
    o.rotation_quaternion=Vector((0,0,1)).rotation_difference(Vector(axis))
    return finish(o,name,m)

def ring(name,p,r,t,m,axis=(0,1,0),v=16):
    # A real annular mesh retains the dark recessed center, including on launcher faces.
    verts=[]
    q=Vector((0,1,0)).rotation_difference(Vector(axis))
    for radius,h in [(r,-t/2),(r,t/2),(r-t,t/2),(r-t,-t/2)]:
        verts.extend(tuple(q@Vector((math.cos(i*math.tau/v)*radius,h,math.sin(i*math.tau/v)*radius))+Vector(p)) for i in range(v))
    faces=[]
    for layer in range(4):
        for i in range(v): faces.append((layer*v+i,layer*v+(i+1)%v,((layer+1)%4)*v+(i+1)%v,((layer+1)%4)*v+i))
    mesh=bpy.data.meshes.new(name); mesh.from_pydata(verts,[],faces); mesh.update()
    o=bpy.data.objects.new(name,mesh); collection.objects.link(o);o.data.materials.append(m);objects.append(o);return o

def beam(name,a,b,r,m):
    return cyl(name,(Vector(a)+Vector(b))/2,r,(Vector(b)-Vector(a)).length,m,Vector(b)-Vector(a),8)

def armor_fin(name,angle,lower=24,upper=47,m=white):
    # Swept tapered electrode armor, rather than a scaled cube.
    outline=[(7,lower),(15,lower+2),(13,upper-4),(8,upper)]
    verts=[]
    for z in [-2,2]:
        for x,y in outline: verts.append((math.cos(angle)*x-math.sin(angle)*z,y,math.sin(angle)*x+math.cos(angle)*z))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],[(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)]);mesh.update()
    o=bpy.data.objects.new(name,mesh);collection.objects.link(o);o.data.materials.append(m);objects.append(o)
    beam('Energy edge',(math.cos(angle)*13,lower+4,math.sin(angle)*13),(math.cos(angle)*9,upper-2,math.sin(angle)*9),.7,cyan)

def base(glow):
    cyl('Octagonal foundation',(0,3,0),17,6,dark,v=8)
    cyl('Armored plinth',(0,6,0),15,3,white,v=8)
    ring('Bearing energy seam',(0,8,0),12,1,glow,v=12)
    cyl('Yaw bearing',(0,10,0),10,3,steel)
    for x in [-1,1]:
        for z in [-1,1]:
            b=box('Outrigger armor',(x*12,3,z*12),(10,5,9),white,1.1)
            box('Foot traction',(x*12,1,z*12),(9,1,8),dark,.3)
            box('Foot luminous inset',(x*13,5.6,z*13),(3,.6,3),glow,.2)
    cyl('Actuator spine',(0,17,0),5,12,dark,v=8)
    for x in [-1,1]: box('Spine armor',(x*5,17,0),(3,10,8),steel)

def electric():
    base(cyan)
    cyl('Tesla lower crown',(0,23,0),12,4,steel)
    cyl('Tesla luminous reactor',(0,32,0),5,18,cyan)
    for h in [26,32,38]:
        ring('Induction coil',(0,h,0),9,2,edge)
        ring('Coil dark separator',(0,h-1.4,0),8.5,.6,dark)
    for i in range(3): armor_fin('Swept electrode armor',i*math.tau/3)
    cyl('Terminal cap',(0,43,0),5,3,white)
    ring('Terminal ion aperture',(0,45,0),4,1,cyan)

def missile():
    base(amber)
    box('Launcher transverse chassis',(-2,27,0),(18,13,25),steel,1.4)
    cyl('Trunnion axle',(-2,27,0),4,32,dark,(0,0,1))
    for z in [-10,10]:
        box('Missile pod casing',(1,33,z),(26,18,13),white,1.7)
        box('Pod front recess',(14.2,33,z),(1,15,10),black,.6)
        for h in [29,37]:
            cyl('Dark launch tube',(15, h,z),3.3,1,black,(1,0,0))
            ring('Armored tube lip',(15.7,h,z),3.8,.8,edge,(1,0,0),12)
            ring('Live missile collar',(16.2,h,z),2.7,.5,amber,(1,0,0),12)
            cyl('Recessed missile nose',(15.9,h,z),1.7,.7,orange,(1,0,0),8)
        box('Pod dorsal energy strip',(0,42.1,z),(16,.5,1.4),amber,.2)
        for x in [-7,-3,1]:box('Pod cooling vent',(x,34,z+(6.6 if z>0 else -6.6)),(1,8,.4),dark,.1)
    box('Central range finder',(5,30,0),(14,7,6),dark)
    cyl('Range finder lens',(12.2,30,0),2,1,amber,(1,0,0))

def healing():
    base(mint)
    box('Medical armored body',(0,30,0),(23,23,18),white,2)
    box('Medical face recess',(0,31,9.5),(18,17,1),dark)
    box('Medical cross horizontal',(0,31,10.2),(13,3.5,.6),mint,.2)
    box('Medical cross vertical',(0,31,10.3),(3.5,13,.6),mint,.2)
    for x in [-1,1]:
        cyl('External serum chamber',(x*14,29,0),3.8,17,dark)
        cyl('Luminous serum',(x*14,29,0),2.8,11,mint)
        for h in [21,37]:cyl('Canister end cap',(x*14,h,0),4,2,edge)
    box('Top armored cap',(0,43,0),(18,3,14),steel)
    ring('Medical scanner',(0,45,0),5,1,mint)

def shield():
    base(teal)
    cyl('Shield generator housing',(0,25,0),11,13,dark,v=12)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2,radius=8,location=(0,34,0))
    finish(bpy.context.object,'Faceted containment core',teal)
    ring('Equatorial field cage',(0,34,0),13,1.8,edge,(0,1,0))
    for a in [0,math.pi/3,-math.pi/3]:
        ring('Standing containment arch',(0,34,0),13,1.2,steel,(math.cos(a),0,math.sin(a)))
    for i in range(3): armor_fin('Shield projector petal',i*math.tau/3,21,39,white)
    ring('Top shield halo',(0,47,0),5,.8,teal)

def repair():
    base(mint)
    box('Repair equipment housing',(-2,28,0),(21,15,21),white,1.5)
    box('Emitter dark face',(0,29,11),(17,10,3),dark)
    ring('Repair beam emitter',(0,29,13.2),4,1,mint,(0,0,1))
    cyl('Emitter lens',(0,29,13.3),2.3,.4,mint,(0,0,1))
    for x in [-9,9]:
        beam('Repair tool arm',(x,25,4),(x*1.4,32,13),1.7,steel)
        box('Tool jaw',(x*1.4,33,14),(3,7,3),edge)
    box('Service cross horizontal',(-2,36,0),(12,.6,3),mint,.2)
    box('Service cross vertical',(-2,36,0),(3,.6,12),mint,.2)
    for x in [-7,-3,1]:box('Rear heat vent',(x,29,-10.8),(1,8,.6),dark,.1)

def supply():
    # Low deployment pad: four folding legs, white armor and a cyan hex socket.
    # The upper work surface stays below the existing icon and progress plane.
    cyl('Supply dark body',(0,-1,0),20,10,dark,v=6)
    cyl('Supply armor belt',(0,4,0),22,3,white,v=6)
    ring('Hex blue seam',(0,5.8,0),21,.8,cyan,v=6)
    ring('Top ceramic rim',(0,7.2,0),20,2,white,v=6)
    cyl('Recessed work surface',(0,7.5,0),17.5,.7,steel,v=6)
    ring('Recess socket light',(0,8,0),11,.7,cyan,v=6)
    cyl('Hex hologram socket',(0,8.1,0),10,.3,dark,v=6)
    for a in [math.pi/4,3*math.pi/4,5*math.pi/4,7*math.pi/4]:
        x,z=math.cos(a),math.sin(a)
        o=box('Fold out stabilizer',(x*21,-1,z*21),(13,6,10),white,1.1);o.rotation_euler.y=-a
        o=box('Amber stabilizer insert',(x*25,2.1,z*25),(4,.6,6),orange,.3);o.rotation_euler.y=-a
        cyl('Exposed leg hinge',(x*17,1,z*17),2.5,9,steel,(-z,0,x),8)
    for s in [-1,1]:
        box('Pad equipment latch',(s*20,1,0),(3,6,9),edge)
        box('Pad blue status bar',(s*13,8,0),(1,.6,4),cyan,.2)

builders={'electric_tower':electric,'missile_tower':missile,'healing_tower':healing,'shield_tower':shield,'repair_turret':repair,'supply_pad':supply}
exported={}; metadata={}; assets={}
for kind,build in builders.items():
    collection=bpy.data.collections.new(kind);scene.collection.children.link(collection);objects=[]
    build();bpy.context.view_layer.update();out=[]
    for o in objects:
        mesh=o.to_mesh();mesh.calc_loop_triangles();nm=o.matrix_world.to_3x3().inverted().transposed()
        for tri in mesh.loop_triangles:
            m=o.data.materials[tri.material_index];n=Vector((0,2,0)) if m.get('emission') else (nm@tri.normal).normalized()
            for vi in tri.vertices:
                p=o.matrix_world@mesh.vertices[vi].co
                out.extend(round(v,5) for v in (*p,*n,*m.diffuse_color[:3]))
        o.to_mesh_clear()
    exported[kind]=out;metadata[kind]={'triangles':len(out)//27,'objects':len(objects)};assets[kind]=objects[:]

target=ROOT/'dist/assets/cyber-facilities.js'
target.write_text('/* Authored and exported from Blender; Y-up, position/normal/sRGB. */\nglobalThis.CyberFacilityMeshes={'+','.join(json.dumps(k)+':new Float32Array('+json.dumps(v,separators=(',',':'))+')' for k,v in exported.items())+'};\n',encoding='utf8')
(OUT/'manifest.json').write_text(json.dumps(metadata,indent=2),encoding='utf8')

# Turn the authored game meshes into a conventional Z-up Blender presentation.
rotation=Matrix.Rotation(math.pi/2,4,'X')
layout=[(-65,0,0),(0,0,0),(65,0,0),(-65,0,76),(0,0,76),(65,0,76)]
for (kind,group),at in zip(assets.items(),layout):
    for o in group:o.matrix_world=rotation@Matrix.Translation(at)@o.matrix_world

def aim(o,p):o.rotation_euler=(Vector(p)-o.location).to_track_quat('-Z','Y').to_euler()
studio=bpy.data.collections.new('Studio - camera and lights');scene.collection.children.link(studio)
for name,p,power,size in [('Key',(-80,-100,180),300000,110),('Fill',(140,-20,110),220000,90),('Rim',(0,130,120),350000,100)]:
    d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='DISK';d.size=size
    o=bpy.data.objects.new(name,d);studio.objects.link(o);o.location=p;aim(o,(0,-38,15))
d=bpy.data.cameras.new('Asset overview');cam=bpy.data.objects.new('Asset overview',d);studio.objects.link(cam)
cam.location=(145,-225,210);aim(cam,(0,-38,19));d.type='ORTHO';d.ortho_scale=235;scene.camera=cam
scene.world=bpy.data.worlds.new('Cyber studio world');scene.world.use_nodes=True
scene.world.node_tree.nodes.get('Background').inputs[0].default_value=(.11,.14,.20,1)
scene.world.node_tree.nodes.get('Background').inputs[1].default_value=.45
scene.render.engine='CYCLES';scene.cycles.samples=24
scene.render.resolution_x=1500;scene.render.resolution_y=1100;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.filepath=str(OUT/'cyber-facilities-overview.png')
scene.view_settings.view_transform='AgX'
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type=='VIEW_3D':
            area.spaces.active.shading.type='MATERIAL'
            area.spaces.active.region_3d.view_distance=245
            area.spaces.active.region_3d.view_location=(0,-38,20)
            area.spaces.active.region_3d.view_rotation=cam.rotation_euler.to_quaternion()
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'cyber-facilities.blend'))
(OUT/'build-complete.json').write_text(json.dumps(metadata),encoding='utf8')
bpy.ops.render.render(write_still=True)

"""Build the reference blue-shield turret in Blender and export three resident parts."""
import sys, json, math
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from vehicle_mesh_common import *
from mathutils import Matrix
clear()
OUT=ROOT/'source-assets'/'machine-turret'; OUT.mkdir(parents=True,exist_ok=True)
steel=mat('Faceted grey steel','#7D8790'); light=mat('Silver edges','#B8C4C4')
dark=mat('Recessed gunmetal','#30323E'); red=mat('Burgundy structure','#62434E')
blue=mat('Blue armor','#288EC7'); blueedge=mat('Blue armor bevel','#57BAE3')
black=mat('Deep muzzle bore','#141A24')
part='base'
def tag(o): o['part']=part; return o
def B(n,p,s,m,b=0): return tag(box(n,p,s,m,b))
def C(n,p,r,d,m,axis=(0,1,0),v=10):return tag(cylinder(n,p,r,d,m,axis,v))
C('Octagonal armored plinth',(0,5,0),14,8,red,(0,1,0),8)
C('Chamfered pedestal top',(0,10,0),11,5,steel,(0,1,0),8)
for a in (math.pi/4,3*math.pi/4,5*math.pi/4,7*math.pi/4):
    o=B('Splayed stabilizer',(math.cos(a)*11,4,math.sin(a)*11),(15,7,8),steel,1.5);o.rotation_euler.y=-a
C('Dark yaw bearing',(0,14,0),8,4,dark)
C('Silver bearing rim',(0,16,0),7,2,light)
part='head'
B('Burgundy breech block',(-3,27,0),(17,17,14),red,1.2)
B('Central receiver',(1,28,0),(18,12,12),dark,1)
B('Silver receiver crown',(-2,36,0),(16,3,12),light,.9)
C('Transverse trunnion',(0,23,0),4,19,steel,(0,0,1))

def shield_panel(name,outline,material,thickness=1.6):
    # Thin frontal armor, extruded backward along the firing axis (+X).
    # Each wing has a broad forward face and a short, visibly folded outer facet.
    n=len(outline)
    vertices=outline+[(x-thickness,y,z) for x,y,z in outline]
    faces=[tuple(range(n)),tuple(range(2*n-1,n-1,-1))]
    faces.extend((i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n))
    return tag(mesh(name,vertices,faces,material))

for s in (-1,1):
    def face(name,points,material,thickness=1.6):
        return shield_panel(name+' '+str(s),[(x,y,z*s) for x,y,z in points],material,thickness)
    face('Forward blue shield broad face',[
        (10,19,5),(9,19,12),(9,42,12),(10,39,5)],blue)
    face('Blue shield folded outer wing',[
        (9,19,12),(3.5,20.5,16),(3.5,41,16),(5,44,15),(9,42,12)],blue)
    face('Silver shield top edge',[
        (10.08,38.2,5),(9.08,41.2,12),(9.08,42,12),(10.08,39,5)],light,.25)
    face('Folded wing silver top edge',[
        (9.08,41.2,12),(5.08,43.2,15),(3.58,40.2,16),
        (3.58,41,16),(5.08,44,15),(9.08,42,12)],light,.25)
    face('Burgundy shield lower edge',[
        (10.1,17,5),(9.1,17,12),(9.1,19,12),(10.1,19,5)],red,1.8)
    face('Folded wing lower edge',[
        (9.1,17,12),(3.6,18.5,16),(3.6,20.5,16),(9.1,19,12)],red,1.8)
    face('Shield small silver identification patch',[
        (9.8,24,7),(9.37,24,10),(9.37,26.3,10),(9.8,26.3,7)],light,.12)
# Only the low crosspiece joins the two wings. The gun and upper piston emerge
# through the open U-shaped center; no blue panels enclose the breech or roof.
B('Shield low connecting crosspiece',(9,18,0),(2,2.5,10),red,.3)
B('Rear counterweight',(-14,28,0),(7,10,13),red,.8)
for y in (25,29,33):B('Rear cooling slot',(-17.6,y,0),(.4,1.2,8),dark)
part='barrel'
C('Barrel breech sleeve',(10,29,0),4.4,7,steel,(1,0,0))
C('Long dark cannon barrel',(21,29,0),2.8,19,red,(1,0,0))
C('Stepped silver muzzle',(32,29,0),4.6,8,steel,(1,0,0))
C('Muzzle lip',(36.2,29,0),4.1,1,light,(1,0,0))
C('Deep dark muzzle opening',(36.76,29,0),2.8,.12,black,(1,0,0))
C('Inner rifling recess',(36.85,29,0),1.65,.13,dark,(1,0,0))
C('Upper recoil piston',(11,35,0),2.3,9,steel,(1,0,0))
import bmesh
for obj in bpy.context.scene.objects:
    if obj.type!='MESH':continue
    bm=bmesh.new();bm.from_mesh(obj.data)
    bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
    bm.to_mesh(obj.data);bm.free()
# Keep node shading and exported vertex colors identical.
for material in bpy.data.materials:
    if material.name in ['Dots Stroke','Material']:continue
    material.use_nodes=True
    shader=material.node_tree.nodes.get('Principled BSDF')
    if shader:
        rgb=material.diffuse_color[:3]
        shader.inputs['Base Color'].default_value=tuple(c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4 for c in rgb)+(1,)
        shader.inputs['Roughness'].default_value=.57
        shader.inputs['Metallic'].default_value=.25
# Export the actual Blender mesh before converting the editable scene to Z-up.
parts={k:[] for k in ('base','head','barrel')}
for o in list(bpy.context.scene.objects):
    if o.type!='MESH':continue
    d=o.to_mesh();d.calc_loop_triangles();nm=o.matrix_world.to_3x3().inverted().transposed()
    for tri in d.loop_triangles:
        c=o.data.materials[tri.material_index].diffuse_color[:3];n=(nm@tri.normal).normalized()
        for vi in tri.vertices:
            p=o.matrix_world@d.vertices[vi].co
            parts[o['part']].extend(round(v,5) for v in (*p,*n,*c))
    o.to_mesh_clear()
(ROOT/'dist/assets/machine-turret.js').write_text('globalThis.MachineTurretMeshes={'+','.join(json.dumps(k)+':new Float32Array('+json.dumps(v,separators=(',',':'))+')' for k,v in parts.items())+'};\n',encoding='utf8')
rot=Matrix.Rotation(math.pi/2,4,'X')
for o in list(bpy.context.scene.objects):o.matrix_world=rot@o.matrix_world
reference=Path(r'C:/Users/Administrator/AppData/Local/Temp/codex-clipboard-ac94dc79-093c-4ffb-8617-5de95def763c.png')
if reference.exists():bpy.data.images.load(str(reference)).pack()
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=24
scene.world.color=(.22,.22,.22)
def aim(o,at):o.rotation_euler=(Vector(at)-o.location).to_track_quat('-Z','Y').to_euler()
for name,at,power,size in [('Key',(70,-90,120),180000,85),('Fill',(-55,-30,65),90000,70),('Rim',(10,70,100),150000,60)]:
    d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='DISK';d.size=size
    o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=at;aim(o,(5,0,24))
d=bpy.data.cameras.new('Reference three quarter');cam=bpy.data.objects.new('Reference three quarter',d);scene.collection.objects.link(cam)
cam.location=(100,145,85);aim(cam,(7,0,25));d.type='ORTHO';d.ortho_scale=89;scene.camera=cam
scene.render.resolution_x=960;scene.render.resolution_y=960;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.filepath=str(OUT/'machine-turret-studio.png')
scene.render.film_transparent=True
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type=='VIEW_3D':
            area.spaces.active.region_3d.view_perspective='CAMERA';area.spaces.active.shading.type='MATERIAL'
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'machine-turret.blend'))
bpy.ops.render.render(write_still=True)
print('TURRET EXPORTED', {k:len(v)//27 for k,v in parts.items()})


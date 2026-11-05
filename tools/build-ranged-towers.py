"""Author shotgun and sniper towers in the currently open Blender.

Run from Blender's Python Console. Adds a new scene, preserves existing scenes,
and saves to a separate blend. No combat/balance changes are made by this script.
"""
import bpy, math, json
from pathlib import Path
from mathutils import Vector, Matrix

ROOT = Path(r'H:/CodexProjects/hell-elevator-codex/hell-elevator')
OUT = ROOT/'source-assets/ranged-towers'
OUT.mkdir(parents=True, exist_ok=True)

# Reuse the existing authored armor palette and low-poly mesh helpers.
# Only definitions are loaded: the six-asset build/export is never executed.
source=(ROOT/'tools/build-cyber-facilities.py').read_text(encoding='utf8')
assert '\nbuilders=' in source, 'Cyber facility helper boundary changed'
helper=source.split('\nbuilders=',1)[0]
helper=helper.replace("OUT = ROOT / 'source-assets/cyber-facilities'", "OUT = ROOT / 'source-assets/ranged-towers'")
helper=helper.replace('CYBER FACILITIES - six editable assets','CYBER - Shotgun and Sniper towers')
exec(compile(helper,'cyber-facility-helpers','exec'),globals())

def shotgun():
    base(amber)
    split=len(objects)
    cyl('SG / transverse pivot',(0,26,0),4.5,24,steel,(0,0,1))
    for s in [-1,1]:
        box('SG / armored pivot cheek',(-2,26,s*10),(15,12,4),white,1.2)
        cyl('SG / pivot bolt',(-2,26,s*12.2),2.3,.6,dark,(0,0,1),8)
    box('SG / broad breech',(-5,32,0),(21,16,22),dark,1.5)
    box('SG / sloped receiver crown',(-5,40,0),(20,3,21),white,.9)
    box('SG / dorsal amber strip',(-5,41.6,0),(13,.5,2),amber,.15)
    for z in [-5.8,5.8]:
        cyl('SG / short barrel jacket',(8,32,z),5.2,20,steel,(1,0,0),12)
        for x in [1,7,13]:
            ring('SG / cooling collar',(x,32,z),5.7,1.1,dark,(1,0,0),12)
        # Wide, genuinely open muzzle; the dark bore is recessed behind its lip.
        ring('SG / heavy muzzle brake',(20,32,z),6.1,2.1,white,(1,0,0),12)
        ring('SG / muzzle energy ring',(21.2,32,z),4.5,.65,amber,(1,0,0),12)
        cyl('SG / deep recessed bore',(19.5,32,z),3.7,.2,black,(1,0,0),12)
        ring('SG / inner bore step',(20.1,32,z),3.6,.45,dark,(1,0,0),12)
    box('SG / barrel bridge',(10,39,0),(20,2,19),white,.6)
    for x in [3,8,13]:box('SG / top heat slots',(x,40.1,0),(2,.3,12),dark,.1)
    cyl('SG / rotary shell drum',(-6,28,-16),6,9,steel,(0,0,1),12)
    cyl('SG / drum end plate',(-6,28,-21),5.5,1,white,(0,0,1),12)
    for i in range(6):
        a=i*math.tau/6
        cyl('SG / exposed amber shell',(-6+math.cos(a)*3.8,28+math.sin(a)*3.8,-21.7),1.1,.65,orange,(0,0,1),8)
    box('SG / ejector housing',(-10,33,13),(10,8,4),white,.8)
    box('SG / ejector recess',(-10,33,15.1),(7,3,.4),black,.1)
    for z in [-9,9]:beam('SG / recoil piston',(-12,23,z),(7,26,z),1.2,edge)
    return split

def sniper():
    base(cyan)
    split=len(objects)
    cyl('SR / transverse pivot',(-2,26,0),4,21,steel,(0,0,1))
    box('SR / slim precision receiver',(-4,31,0),(28,12,12),dark,1)
    box('SR / upper ceramic armor',(-5,38,0),(26,3,13),white,.9)
    box('SR / lower ceramic armor',(-5,24,0),(23,3,12),white,.7)
    box('SR / rear counterweight',(-21,31,0),(9,16,15),steel,1)
    for h in [27,31,35]:box('SR / rear cooling vents',(-25.6,h,0),(.4,1.3,10),black,.1)
    cyl('SR / long precision barrel',(23,31,0),2.2,39,steel,(1,0,0),12)
    for z in [-4.3,4.3]:
        box('SR / exposed rail',(22,31,z),(36,4,2.6),dark,.4)
        box('SR / ion rail inlay',(22,33.2,z),(31,.6,1.2),cyan,.15)
    for x in [8,15,22,29]:
        box('SR / ceramic rail clamp',(x,31,0),(2.2,8.8,12),white,.6)
    cyl('SR / muzzle support',(39,31,0),3.4,7,steel,(1,0,0),8)
    ring('SR / octagonal muzzle brake',(43,31,0),4.2,1.2,white,(1,0,0),8)
    ring('SR / ion muzzle aperture',(43.8,31,0),2.7,.5,cyan,(1,0,0),12)
    cyl('SR / dark precision bore',(42.8,31,0),1.8,.2,black,(1,0,0),12)
    # Offset scope is visible from above and distinct from the long barrel.
    box('SR / scope mounting rail',(-4,41,-5),(18,3,4),dark,.4)
    cyl('SR / telescopic sight',(-2,44,-6),3,17,steel,(1,0,0),12)
    ring('SR / optical objective rim',(7,44,-6),3.8,.9,white,(1,0,0),12)
    cyl('SR / optical objective lens',(7.5,44,-6),2.5,.2,cyan,(1,0,0),12)
    cyl('SR / scope rear cap',(-11,44,-6),3.4,2,dark,(1,0,0),12)
    box('SR / adjustment turret',(-3,48,-6),(4,3,4),edge,.3)
    for s in [-1,1]:
        box('SR / trunnion armor',(-2,27,s*9),(13,11,4),white,.8)
        cyl('SR / blue pivot sensor',(-2,27,s*11.2),2,.5,cyan,(0,0,1),10)
    return split

builders={'shotgun_tower':shotgun,'sniper_tower':sniper}
exports={};stats={};groups={}
for kind,build in builders.items():
    collection=bpy.data.collections.new(kind);scene.collection.children.link(collection);objects=[]
    split=build();bpy.context.view_layer.update();parts={}
    for name,group in [('base',objects[:split]),('head',objects[split:])]:
        values=[]
        for o in group:
            mesh=o.to_mesh();mesh.calc_loop_triangles();nm=o.matrix_world.to_3x3().inverted().transposed()
            for tri in mesh.loop_triangles:
                m=o.data.materials[tri.material_index]
                n=Vector((0,2,0)) if m.get('emission') else (nm@tri.normal).normalized()
                for vi in tri.vertices:
                    p=o.matrix_world@mesh.vertices[vi].co
                    values.extend(round(v,5) for v in (*p,*n,*m.diffuse_color[:3]))
            o.to_mesh_clear()
        parts[name]=values
    exports[kind]=parts;groups[kind]=objects[:]
    stats[kind]={'objects':len(objects),'triangles':sum(len(v)//27 for v in parts.values()),'parts':{k:len(v)//27 for k,v in parts.items()},'forward':'+X','pivot':[0,0,0]}

destination=ROOT/'dist/assets/ranged-towers.js'
destination.write_text('/* Blender-authored meshes; Y-up, +X firing, separate base/head. */\nglobalThis.CyberRangedTowerMeshes={'+','.join(json.dumps(kind)+':{'+','.join(json.dumps(k)+':new Float32Array('+json.dumps(v,separators=(',',':'))+')' for k,v in parts.items())+'}' for kind,parts in exports.items())+'};\n',encoding='utf8')
(OUT/'manifest.json').write_text(json.dumps(stats,indent=2),encoding='utf8')

rotation=Matrix.Rotation(math.pi/2,4,'X')
for (kind,group),at in zip(groups.items(),[(-48,0,0),(42,0,0)]):
    for o in group:o.matrix_world=rotation@Matrix.Translation(at)@o.matrix_world

def aim(o,p):o.rotation_euler=(Vector(p)-o.location).to_track_quat('-Z','Y').to_euler()
studio=bpy.data.collections.new('Studio');scene.collection.children.link(studio)
for name,p,power,size in [('Key',(-80,-100,160),200000,90),('Fill',(130,-50,90),120000,75),('Rim',(0,100,130),250000,85)]:
    d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='DISK';d.size=size
    o=bpy.data.objects.new(name,d);studio.objects.link(o);o.location=p;aim(o,(10,0,24))
d=bpy.data.cameras.new('Shotgun and sniper overview');cam=bpy.data.objects.new(d.name,d);studio.objects.link(cam)
cam.location=(150,-210,165);aim(cam,(8,0,23));d.type='ORTHO';d.ortho_scale=205;scene.camera=cam
scene.world=bpy.data.worlds.new('Ranged tower studio');scene.world.use_nodes=True
scene.world.node_tree.nodes.get('Background').inputs[0].default_value=(.11,.14,.20,1)
scene.world.node_tree.nodes.get('Background').inputs[1].default_value=.45
scene.render.engine='CYCLES';scene.cycles.samples=24
scene.render.resolution_x=1500;scene.render.resolution_y=900;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.filepath=str(OUT/'ranged-towers-overview.png')
scene.view_settings.view_transform='AgX'
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type=='VIEW_3D':
            area.spaces.active.shading.type='MATERIAL'
            area.spaces.active.region_3d.view_distance=205
            area.spaces.active.region_3d.view_location=(8,0,23)
            area.spaces.active.region_3d.view_rotation=cam.rotation_euler.to_quaternion()
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'ranged-towers.blend'))
(OUT/'build-complete.json').write_text(json.dumps(stats),encoding='utf8')
print('RANGED TOWERS BUILT:',json.dumps(stats))
bpy.ops.render.render(write_still=True)

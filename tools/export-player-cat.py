"""Run with Blender --background --python tools/export-player-cat.py (from repo root)."""
import bpy,json,pathlib
from mathutils import Matrix
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'dist/assets/player-cat';OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'source-assets/player-cat/NeonTowerCat_Rigged.blend'))
m=bpy.data.objects['NeonTowerCat_Mesh'];rig=bpy.data.objects['NeonTowerCat_Rig'];bones=list(rig.data.bones);names=[b.name for b in bones]
C=Matrix(((1,0,0,0),(0,0,1,0),(0,-1,0,0),(0,0,0,1)))
def flat(mat):return [round(mat[row][col],6) for col in range(4) for row in range(4)]
rig.animation_data.action=None
for p in rig.pose.bones:p.rotation_euler=(0,0,0);p.location=(0,0,0)
bpy.context.scene.frame_set(1)
data=[]
for obj in [o for o in bpy.context.scene.objects if o.type=='MESH']:
 mesh=obj.data;mesh.calc_loop_triangles();uv=mesh.uv_layers.active.data
 eye='eye' in obj.name.lower()
 if eye:
  uvmin=[min(v.uv[j] for v in uv) for j in range(2)];uvmax=[max(v.uv[j] for v in uv) for j in range(2)]
  uvcenter=[(a+b)/2 for a,b in zip(uvmin,uvmax)]
  center=[sum(v.co[j] for v in mesh.vertices)/len(mesh.vertices) for j in range(3)]
  signs=[sum((mesh.vertices[l.vertex_index].co[axis]-center[axis])*(uv[l.index].uv[j]-uvcenter[j]) for l in mesh.loops) for j,axis in [(0,0),(1,2)]]
 for tri in mesh.loop_triangles:
  for li in tri.loops:
   loop=mesh.loops[li];v=mesh.vertices[loop.vertex_index];p=C@(obj.matrix_world@v.co);n=(C.to_3x3()@obj.matrix_world.to_3x3().inverted().transposed()@mesh.corner_normals[li].vector).normalized()
   influences=sorted([(names.index(obj.vertex_groups[g.group].name),g.weight) for g in v.groups],key=lambda q:-q[1])[:3]
   while len(influences)<3:influences.append((0,0))
   tex=list(uv[li].uv)
   if eye:
    tex=[(tex[j]-uvmin[j])/max(1e-6,uvmax[j]-uvmin[j]) for j in range(2)]
    tex=[v if signs[j]>=0 else 1-v for j,v in enumerate(tex)]
    influences=[(19 if obj.name.lower().startswith('r_') else 20,1),(0,0),(0,0)]
   data.extend([*p,*n,*tex,*[g[0] for g in influences],*[g[1] for g in influences]])

clips={}
for name,count in [('Idle_Preview',49),('Walk_Preview',25),('Sit_Preview',25)]:
 rig.animation_data.action=bpy.data.actions[name];frames=[]
 for f in range(1,count+1):
  bpy.context.scene.frame_set(f)
  frames.append([n for b in bones for n in flat(C@rig.pose.bones[b.name].matrix@b.matrix_local.inverted()@C.inverted())])
 clips[name.split('_')[0].lower()]={'frames':frames,'fps':24}
r={'version':1,'source':'NeonTowerCat_Rigged.blend','bones':names,'bind':{b.name:{'head':list(C@b.head_local),'tail':list(C@b.tail_local)} for b in bones},'stride':14,'eyeMarkers':[19,20],'vertices':[round(float(n),6) for n in data],'clips':clips}
(OUT/'cat.json').write_text(json.dumps(r,separators=(',',':')),encoding='utf-8')
im=next(n.image for n in m.data.materials[0].node_tree.nodes if n.type=='TEX_IMAGE' and n.image);im.scale(1024,1024);im.filepath_raw=str(OUT/'cat.png');im.file_format='PNG';im.save()
print('CAT_EXPORTED',len(data)//14,'vertices',len(bones),'bones')

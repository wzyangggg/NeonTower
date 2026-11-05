import bpy,pathlib,json
from mathutils import Matrix,Vector
R=pathlib.Path(__file__).resolve().parents[1];D=R/'source-assets/island-characters';O=R/'dist/assets/island-players';O.mkdir(parents=True,exist_ok=True)
C=Matrix(((1,0,0,0),(0,0,1,0),(0,-1,0,0),(0,0,0,1)))
def flat(m):return [round(m[r][c],6) for r in range(3) for c in range(4)]
for kind in ['fox','bunny']:
 bpy.ops.wm.open_mainfile(filepath=str(D/(kind+'-imported.blend')))
 rig=next(o for o in bpy.context.scene.objects if o.type=='ARMATURE');meshes=[o for o in bpy.context.scene.objects if o.type=='MESH'];bones=list(rig.data.bones);names=[b.name for b in bones]
 points=[C@(o.matrix_world@v.co) for o in meshes for v in o.data.vertices];bottom=min(p.y for p in points);height=max(p.y for p in points)-bottom
 T=Matrix.Diagonal((1/height,1/height,1/height,1));T[1][3]=-bottom/height;F=T@C;rest=[rig.matrix_world@b.matrix_local for b in bones];data=[]
 for o in meshes:
  me=o.data;me.calc_loop_triangles();uv=me.uv_layers.active.data
  for tri in me.loop_triangles:
   for li in tri.loops:
    v=me.vertices[me.loops[li].vertex_index];p=F@(o.matrix_world@v.co);n=(C.to_3x3()@o.matrix_world.to_3x3().inverted().transposed()@me.corner_normals[li].vector).normalized();weights=[]
    for g in v.groups:
     name=o.vertex_groups[g.group].name
     if name in names:weights.append((names.index(name),g.weight))
    if not weights:weights=[(names.index(o.parent_bone) if o.parent_bone in names else names.index('mixamorig:Head'),1)]
    weights=sorted(weights,key=lambda q:-q[1])[:3];total=sum(w for _,w in weights);weights=[(j,w/total) for j,w in weights]
    while len(weights)<3:weights.append((0,0))
    mat=me.materials[tri.material_index];eye=1 if kind=='fox' and mat.name.startswith('lambert3') else 0
    data.extend([*p,*n,*uv[li].uv,*[j for j,w in weights],*[w for j,w in weights],eye])
 clips={}
 for label,file,count in [('idle','Idle.fbx',60),('walk','Running.fbx',22)]:
  old=set(bpy.data.objects);bpy.ops.import_scene.fbx(filepath=str(D/'Assets/IslandDefender/Animations'/file));added=set(bpy.data.objects)-old;source=next(o for o in added if o.type=='ARMATURE');frames=[]
  for frame in range(1,count+1,2):
   bpy.context.scene.frame_set(frame)
   for p in rig.pose.bones:
    p.rotation_mode='QUATERNION';p.rotation_quaternion=source.pose.bones[p.name].matrix_basis.to_quaternion() if p.name in source.pose.bones else (1,0,0,0)
   bpy.context.view_layer.update();frames.append([n for i,b in enumerate(bones) for n in flat(F@(rig.matrix_world@rig.pose.bones[b.name].matrix)@rest[i].inverted()@F.inverted())])
  clips[label]={'fps':12,'frames':frames}
  for ob in added:bpy.data.objects.remove(ob,do_unlink=True)
 bind={b.name:{'head':list(F@(rig.matrix_world@b.head_local)),'tail':list(F@(rig.matrix_world@b.tail_local))} for b in bones}
 (O/(kind+'.json')).write_text(json.dumps({'bones':names,'bind':bind,'vertices':[round(float(x),6) for x in data],'clips':clips},separators=(',',':')),encoding='utf-8')
 im=next(i for i in bpy.data.images if i.packed_file);im.scale(1024,1024);im.filepath_raw=str(O/(kind+'.png'));im.file_format='PNG';im.save();print('EXPORTED',kind,len(data)//15,len(names))

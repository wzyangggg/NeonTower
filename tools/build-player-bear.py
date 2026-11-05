import bpy,math,json,pathlib
from mathutils import Matrix
ROOT=pathlib.Path(__file__).resolve().parents[1];OUT=ROOT/'source-assets/player-bear';ASSET=ROOT/'dist/assets/player-bear';ASSET.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(OUT/'inspection.blend'))
meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
# Match cat's metre-sized proportions, retain original geometry and UVs.
for o in meshes:
 bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
 for v in o.data.vertices:v.co*=1.9
 o.select_set(False)
arm=bpy.data.armatures.new('AngryBear_Skeleton');rig=bpy.data.objects.new('AngryBear_Rig',arm);bpy.context.collection.objects.link(rig);bpy.context.view_layer.objects.active=rig;rig.select_set(True);rig.show_in_front=True;bpy.ops.object.mode_set(mode='EDIT')
def bone(n,a,b,parent=None,deform=True):
 e=arm.edit_bones.new(n);e.head=a;e.tail=b;e.use_deform=deform
 if parent:e.parent=arm.edit_bones[parent]
bone('root',(0,0,0),(0,0,.1),deform=False);bone('pelvis',(0,0,.22),(0,0,.30),'root');bone('spine',(0,0,.30),(0,0,.43),'pelvis');bone('neck',(0,0,.43),(0,0,.50),'spine');bone('head',(0,0,.50),(0,0,.81),'neck')
for s,sign in [('L',1),('R',-1)]:
 x=.095*sign;bone('thigh.'+s,(x,0,.22),(x,0,.125),'pelvis');bone('shin.'+s,(x,0,.125),(x,-.01,.055),'thigh.'+s);bone('foot.'+s,(x,-.01,.055),(x,-.085,.04),'shin.'+s);bone('ear.'+s,(sign*.16,0,.78),(sign*.22,0,.94),'head')
bone('tail.01',(0,.13,.22),(0,.18,.24),'pelvis');bone('tail.02',(0,.18,.24),(0,.20,.26),'tail.01');bone('tail.03',(0,.20,.26),(0,.20,.28),'tail.02');bone('weapon_socket',(0,-.18,.30),(0,-.26,.30),'spine',False)
bpy.ops.object.mode_set(mode='OBJECT')
def ramp(v,a,b):return max(0,min(1,(v-a)/(b-a)))
for o in meshes:
 for b in arm.bones:o.vertex_groups.new(name=b.name)
 # Connected components distinguish head, ears, feet, tail and torso.
 adj=[[] for v in o.data.vertices]
 for e in o.data.edges:a,b=e.vertices;adj[a].append(b);adj[b].append(a)
 seen=set()
 for v in o.data.vertices:
  if v.index in seen:continue
  ids=[];stack=[v.index];seen.add(v.index)
  while stack:
   i=stack.pop();ids.append(i)
   for j in adj[i]:
    if j not in seen:seen.add(j);stack.append(j)
  zs=[o.data.vertices[i].co.z for i in ids];mn=min(zs);mx=max(zs)
  for i in ids:
   x,y,z=o.data.vertices[i].co;s='L' if x>0 else 'R'
   if 'Eyebrow' in o.name or (o.name=='Body' and mn>.45):
    ear=ramp(z,.79,.87) if mn>.7 else 0;w={'head':1-ear,'ear.'+s:ear}
   elif o.name=='Body' and mx<.19:
    a=ramp(z,.08,.14);b=ramp(z,.14,.18);w={'foot.'+s:1-a,'shin.'+s:a*(1-b),'thigh.'+s:a*b}
   elif o.name=='Body' and len(ids)==65:w={'tail.01':1}
   elif o.name=='Clothing':
    # Collar blends into the moving head; lower cape remains on the torso.
    # The game's head spring replaces head matrices without rotating neck.
    a=ramp(z,.23,.4);h=ramp(z,.35,.515);h=h*h*(3-2*h)
    w={'pelvis':(1-a)*(1-h),'spine':a*(1-h),'head':h}
   else:
    a=ramp(z,.23,.4);b=ramp(z,.42,.5);w={'pelvis':1-a,'spine':a*(1-b),'neck':a*b}
   for n,weight in w.items():
    if weight>0:o.vertex_groups[n].add([i],weight,'REPLACE')
 mod=o.modifiers.new('Bear_Skin','ARMATURE');mod.object=rig;o.parent=rig
 for v in o.data.vertices:assert abs(sum(g.weight for g in v.groups)-1)<1e-5
rig['notes']='Cat-compatible armless biped FK rig. Original eyes/UV/geometry retained. +Z up, -Y forward.'
for im in bpy.data.images:
 if im.packed_file:im.pack()
bones=list(arm.bones);names=[b.name for b in bones];C=Matrix(((1,0,0,0),(0,0,1,0),(0,-1,0,0),(0,0,0,1)))
def flat(mat):return [round(mat[r][c],6) for c in range(4) for r in range(4)]
clips={}
for name,count in [('idle',49),('walk',25),('sit',25)]:
 rig.animation_data_create();act=bpy.data.actions.new(name);rig.animation_data.action=act
 for f in range(1,count+1):
  phase=(f-1)/(count-1)*math.tau
  for p in rig.pose.bones:p.rotation_mode='XYZ';p.rotation_euler=(0,0,0);p.location=(0,0,0)
  for s,offset in [('L',0),('R',math.pi)]:
   if name=='walk':
    v=math.sin(phase+offset);rig.pose.bones['thigh.'+s].rotation_euler.x=.38*v;rig.pose.bones['shin.'+s].rotation_euler.x=-.4*max(0,-v)
   if name=='sit':rig.pose.bones['thigh.'+s].rotation_euler.x=-1.2;rig.pose.bones['shin.'+s].rotation_euler.x=1.25
  if name=='idle':rig.pose.bones['spine'].rotation_euler.x=.018*math.sin(phase)
  for p in rig.pose.bones:p.keyframe_insert('rotation_euler',frame=f);p.keyframe_insert('location',frame=f)
 frames=[]
 for f in range(1,count+1):
  bpy.context.scene.frame_set(f);frames.append([v for b in bones for v in flat(C@rig.pose.bones[b.name].matrix@b.matrix_local.inverted()@C.inverted())])
 clips[name]={'frames':frames,'fps':24};act.use_fake_user=True
rig.animation_data.action=None
for p in rig.pose.bones:p.rotation_euler=(0,0,0);p.location=(0,0,0)
bpy.context.scene.frame_set(1);data=[]
for o in meshes:
 m=o.data;m.calc_loop_triangles();uv=m.uv_layers.active.data
 for tri in m.loop_triangles:
  for li in tri.loops:
   v=m.vertices[m.loops[li].vertex_index];p=C@v.co;n=C.to_3x3()@m.corner_normals[li].vector;gs=sorted([(names.index(o.vertex_groups[g.group].name),g.weight) for g in v.groups],key=lambda g:-g[1])[:3]
   while len(gs)<3:gs.append((0,0))
   data.extend([*p,*n,*uv[li].uv,*[g[0] for g in gs],*[g[1] for g in gs]])
r={'version':1,'bones':names,'bind':{b.name:{'head':list(C@b.head_local),'tail':list(C@b.tail_local)} for b in bones},'stride':14,'vertices':[round(float(v),6) for v in data],'clips':clips}
(ASSET/'bear.json').write_text(json.dumps(r,separators=(',',':')))
im=next(im for im in bpy.data.images if im.packed_file);im.filepath_raw=str(ASSET/'bear.png');im.file_format='PNG';im.save();im.pack()
bpy.ops.object.select_all(action='DESELECT');rig.select_set(True)
for o in meshes:o.select_set(True)
bpy.ops.export_scene.fbx(filepath=str(OUT/'AngryBear_Rigged.fbx'),use_selection=True,add_leaf_bones=False,bake_anim=False,path_mode='COPY',embed_textures=True)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'AngryBear_Rigged.blend'))
print('BEAR_EXPORTED',len(data)//14,'vertices',len(bones),'bones')

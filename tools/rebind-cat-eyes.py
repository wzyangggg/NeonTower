import bpy,pathlib,shutil,json
from mathutils import Matrix
from mathutils.kdtree import KDTree
R=pathlib.Path(__file__).resolve().parents[1];D=R/'source-assets/player-cat';src=D/'NeonTowerCat_Rigged.blend';backup=D/'NeonTowerCat_PreEyes.blend'
if not backup.exists():shutil.copy2(src,backup)
bpy.ops.wm.open_mainfile(filepath=str(backup));rig=bpy.data.objects['NeonTowerCat_Rig'];old=bpy.data.objects['NeonTowerCat_Mesh'];kd=KDTree(len(old.data.vertices))
for v in old.data.vertices:kd.insert(old.matrix_world@v.co,v.index)
kd.balance();old_names=[g.name for g in old.vertex_groups]
rig.animation_data.action=None
for p in rig.pose.bones:p.rotation_euler=(0,0,0);p.location=(0,0,0)
before=set(bpy.data.objects);bpy.ops.import_scene.fbx(filepath=str(D/'NeonTowerCat_EyeModified.fbx'));added=set(bpy.data.objects)-before;newmeshes=[o for o in added if o.type=='MESH'];assert len(newmeshes)==3
im=bpy.data.images.load(str(R/'dist/assets/player-cat/cat.png'),check_existing=False);im.name='NeonCat_CurrentPaint';im.pack();bodymat=old.data.materials[0].copy();bodymat.name='NeonCat_Body'
for node in bodymat.node_tree.nodes:
 if node.type=='TEX_IMAGE':node.image=im
report=[]
for o in newmeshes:
 name=o.name.split(':')[-1];eye='eye' in name.lower();world=o.matrix_world.copy();o.parent=None;o.data.transform(world);o.matrix_world=Matrix.Identity(4)
 for mod in list(o.modifiers):o.modifiers.remove(mod)
 o.vertex_groups.clear()
 for b in rig.data.bones:o.vertex_groups.new(name=b.name)
 maxdist=0
 for v in o.data.vertices:
  if eye:o.vertex_groups['head'].add([v.index],1,'REPLACE')
  else:
   _,idx,d=kd.find(v.co);maxdist=max(maxdist,d);weights=[(old_names[g.group],g.weight) for g in old.data.vertices[idx].groups if g.weight>1e-6];total=sum(w for _,w in weights)
   for n,w in weights:o.vertex_groups[n].add([v.index],w/total,'REPLACE')
 assert maxdist<.04
 o.name=name if eye else 'NeonTowerCat_Mesh';o.data.materials.clear()
 if eye:
  mat=bpy.data.materials.new('NeonCat_DynamicEye_'+name);mat.use_nodes=True;n=mat.node_tree.nodes;n.clear();links=mat.node_tree.links;uv=n.new('ShaderNodeTexCoord');sub=n.new('ShaderNodeVectorMath');sub.operation='SUBTRACT';sub.inputs[1].default_value=(.5,.5,0);links.new(uv.outputs['UV'],sub.inputs[0]);length=n.new('ShaderNodeVectorMath');length.operation='LENGTH';links.new(sub.outputs['Vector'],length.inputs[0]);mask=n.new('ShaderNodeMath');mask.operation='LESS_THAN';mask.inputs[1].default_value=.338;links.new(length.outputs['Value'],mask.inputs[0]);mix=n.new('ShaderNodeMixRGB');mix.inputs[1].default_value=(.94,.94,.92,1);mix.inputs[2].default_value=(.11,.47,.68,1);links.new(mask.outputs[0],mix.inputs[0]);bs=n.new('ShaderNodeBsdfPrincipled');links.new(mix.outputs[0],bs.inputs['Base Color']);bs.inputs['Roughness'].default_value=.8;out=n.new('ShaderNodeOutputMaterial');links.new(bs.outputs[0],out.inputs['Surface']);o.data.materials.append(mat)
 else:o.data.materials.append(bodymat)
 mod=o.modifiers.new('Cat_Skin','ARMATURE');mod.object=rig;o.parent=rig
 report.append({'name':o.name,'vertices':len(o.data.vertices),'eye':eye,'weightTransferMaxDistance':maxdist,'material':o.data.materials[0].name})
for ob in added:
 if ob not in newmeshes:bpy.data.objects.remove(ob,do_unlink=True)
bpy.data.objects.remove(old,do_unlink=True)
next(o for o in newmeshes if 'eye' not in o.name.lower()).name='NeonTowerCat_Mesh'
bpy.context.preferences.filepaths.save_version=0;bpy.ops.wm.save_as_mainfile(filepath=str(src))
bpy.ops.object.select_all(action='DESELECT');rig.select_set(True)
for o in newmeshes:o.select_set(True)
bpy.context.view_layer.objects.active=rig
output=r'C:/Users/Administrator/Documents/maya/projects/default/scenes/Cat/NeonTowerCat_EyesRigged.fbx'
bpy.ops.export_scene.fbx(filepath=output,use_selection=True,object_types={'MESH','ARMATURE'},add_leaf_bones=False,bake_anim=False,axis_forward='-Z',axis_up='Y',path_mode='COPY',embed_textures=True)
(D/'eye-rebind-report.json').write_text(json.dumps({'source':'NeonTowerCat_EyeModified.fbx','output':output,'meshes':report},indent=2),encoding='utf-8');print('EYES_REBOUND',json.dumps(report))

import bpy,json,pathlib
from mathutils import Vector
R=pathlib.Path(__file__).resolve().parents[1];D=R/'source-assets/island-characters';out=[]
for kind,filename,prefix in [('fox','FoxRigged.fbx','tripo_image_c10028e9'),('bunny','BunnyRigged.fbx','tripo_image_c38698b2')]:
 bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.fbx(filepath=str(D/'Assets/IslandDefender/Models'/filename))
 texture=next((D/'Assets/IslandDefender/Models/Textures').glob(prefix+'*.jpg'))
 image=bpy.data.images.load(str(texture),check_existing=False);image.pack();assert image.packed_file
 for mat in bpy.data.materials:
  if mat.use_nodes:
   for node in mat.node_tree.nodes:
    if node.type=='TEX_IMAGE':node.image=image
 for im in list(bpy.data.images):
  if im!=image and not im.users:bpy.data.images.remove(im)
 arm=next(o for o in bpy.context.scene.objects if o.type=='ARMATURE');bones=[b.name for b in arm.data.bones]
 for side in ['Left','Right']:
  for part in ['Arm','ForeArm','Hand','UpLeg','Leg','Foot']:assert 'mixamorig:'+side+part in bones
 meshes=[{'name':o.name,'vertices':len(o.data.vertices),'materials':[m.name if m else None for m in o.data.materials],'skinned':any(m.type=='ARMATURE' for m in o.modifiers),'parent':o.parent.name if o.parent else None,'parentBone':o.parent_bone} for o in bpy.context.scene.objects if o.type=='MESH']
 pts=[o.matrix_world@v.co for o in bpy.context.scene.objects if o.type=='MESH' for v in o.data.vertices];low=Vector([min(v[i] for v in pts) for i in range(3)]);high=Vector([max(v[i] for v in pts) for i in range(3)])
 for screen in bpy.data.screens:
  for area in screen.areas:
   if area.type=='VIEW_3D':area.spaces.active.region_3d.view_location=(low+high)/2;area.spaces.active.region_3d.view_distance=max(high-low)*2;area.spaces.active.shading.type='MATERIAL'
 bpy.ops.wm.save_as_mainfile(filepath=str(D/(kind+'-imported.blend')))
 out.append({'kind':kind,'bones':bones,'meshes':meshes,'embeddedActions':[a.name for a in bpy.data.actions],'portableBlend':kind+'-imported.blend','texturePacked':True,'bounds':[list(low),list(high)]})
animations=[]
for file in ['Idle.fbx','Running.fbx']:
 bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.fbx(filepath=str(D/'Assets/IslandDefender/Animations'/file))
 animations.append({'file':file,'actions':[{'name':a.name,'frames':list(a.frame_range)} for a in bpy.data.actions]})
(D/'inspection.json').write_text(json.dumps({'characters':out,'animations':animations,'note':'Blender disk import only; Unity shaders and retargeting not evaluated. Fox eye-white texture GUID is missing in source project.'},ensure_ascii=False,indent=2),encoding='utf-8')
print('CHARACTERS_VERIFIED '+json.dumps({'characters':[{'kind':v['kind'],'bones':len(v['bones']),'meshes':len(v['meshes']),'vertices':sum(m['vertices'] for m in v['meshes'])} for v in out],'animations':animations}))

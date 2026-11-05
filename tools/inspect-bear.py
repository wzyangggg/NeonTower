import bpy,json,pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
from mathutils import Vector
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=str(ROOT/'source-assets/player-bear/Model_AngryBear.fbx'))
r=[]
for o in bpy.context.scene.objects:
 if o.type=='MESH':
  ps=[o.matrix_world@v.co for v in o.data.vertices]
  r.append({'name':o.name,'vertices':len(ps),'min':[min(p[i] for p in ps) for i in range(3)],'max':[max(p[i] for p in ps) for i in range(3)],'materials':[m.name for m in o.data.materials]})
print('INSPECTION',json.dumps(r))
for im in bpy.data.images:print('IMAGE',im.name,im.filepath,im.size[:],bool(im.packed_file))
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'source-assets/player-bear/inspection.blend'))

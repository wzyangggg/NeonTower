import bpy,json,pathlib,math
from mathutils import Vector
R=pathlib.Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(R/'source-assets/player-bear/AngryBear_Rigged.blend'))
o=bpy.data.objects['Clothing'];rig=bpy.data.objects['AngryBear_Rig'];rig.animation_data.action=None
for p in rig.pose.bones:p.rotation_mode='XYZ';p.rotation_euler=(0,0,0);p.location=(0,0,0)
def points():
 bpy.context.view_layer.update();ev=o.evaluated_get(bpy.context.evaluated_depsgraph_get());m=ev.to_mesh();ps=[v.co.copy() for v in m.vertices];ev.to_mesh_clear();return ps
base=points();rig.pose.bones['head'].rotation_euler.x=.35;tilted=points();result={}
for label,lo,hi in [('hem',0,.25),('middle',.25,.4),('collar',.4,.6)]:
 ids=[v.index for v in o.data.vertices if lo<=v.co.z<hi];moves=[(base[i]-tilted[i]).length for i in ids];result[label]={'vertices':len(ids),'meanDisplacement':sum(moves)/len(moves),'maxDisplacement':max(moves)}
assert result['hem']['maxDisplacement']<1e-6
assert result['collar']['meanDisplacement']>.015
for scale in [.5,1,1.5]:
 rig.pose.bones['head'].scale=(scale,)*3
 assert all(math.isfinite(c) for p in points() for c in p)
rig.pose.bones['head'].scale=(1,1,1)
print('COLLAR_DEFORMATION_PASS',json.dumps(result))
(R/'source-assets/player-bear/clothing-audit.json').write_text(json.dumps(result,indent=2))
# Textured preview: same head-facing-camera pitch used in the game.
for m in bpy.data.materials:
 if not m.use_nodes:continue
 nt=m.node_tree;tex=next((n for n in nt.nodes if n.type=='TEX_IMAGE'),None)
 if tex:
  em=nt.nodes.new('ShaderNodeEmission');nt.links.new(tex.outputs['Color'],em.inputs[0]);nt.links.new(em.outputs[0],next(n for n in nt.nodes if n.type=='OUTPUT_MATERIAL').inputs['Surface'])
bpy.ops.object.camera_add(location=(1.3,-3.4,1.5));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,.46))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=1.2;bpy.context.scene.camera=cam
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=8;s.render.resolution_x=700;s.render.resolution_y=700;s.render.resolution_percentage=100
for name,angle in [('neutral',0),('tilted',-.7)]:
 rig.pose.bones['head'].rotation_euler.x=angle
 s.render.filepath=str(R/f'source-assets/player-bear/clothing-{name}.png');bpy.ops.render.render(write_still=True)

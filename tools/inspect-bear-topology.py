import bpy,json
from mathutils import Vector
bpy.ops.wm.open_mainfile(filepath=r'H:/CodexProjects/hell-elevator-codex/hell-elevator/source-assets/player-bear/inspection.blend')
for o in bpy.context.scene.objects:
 if o.type!='MESH':continue
 bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.transform_apply(location=True,rotation=True,scale=True);o.select_set(False)
 adj=[[] for v in o.data.vertices]
 for e in o.data.edges:a,b=e.vertices;adj[a].append(b);adj[b].append(a)
 seen=set();cs=[]
 for v in o.data.vertices:
  if v.index in seen:continue
  stack=[v.index];seen.add(v.index);ids=[]
  while stack:
   i=stack.pop();ids.append(i)
   for j in adj[i]:
    if j not in seen:seen.add(j);stack.append(j)
  ps=[o.data.vertices[i].co for i in ids];cs.append({'n':len(ids),'min':[round(min(p[j] for p in ps),3) for j in range(3)],'max':[round(max(p[j] for p in ps),3) for j in range(3)]})
 print(o.name,json.dumps(cs))
# emission textured front preview
for m in bpy.data.materials:
 if not m.use_nodes:continue
 nt=m.node_tree;tex=next((n for n in nt.nodes if n.type=='TEX_IMAGE'),None)
 if tex:
  em=nt.nodes.new('ShaderNodeEmission');nt.links.new(tex.outputs['Color'],em.inputs[0]);nt.links.new(em.outputs[0],next(n for n in nt.nodes if n.type=='OUTPUT_MATERIAL').inputs['Surface'])
bpy.ops.object.camera_add(location=(.7,-1.8,.75));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,.25))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=.65;bpy.context.scene.camera=cam
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=4;s.render.resolution_x=600;s.render.resolution_y=600;s.render.resolution_percentage=100;s.render.filepath=r'H:/CodexProjects/hell-elevator-codex/hell-elevator/source-assets/player-bear/source-preview.png';bpy.ops.render.render(write_still=True)

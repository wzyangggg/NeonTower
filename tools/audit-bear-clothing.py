import bpy,json,pathlib
R=pathlib.Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(R/'source-assets/player-bear/AngryBear_Rigged.blend'))
o=bpy.data.objects['Clothing'];names=[g.name for g in o.vertex_groups]
for label,lo,hi in [('hem',0,.25),('middle',.25,.4),('collar',.4,.6)]:
 vs=[v for v in o.data.vertices if lo<=v.co.z<hi];tot={}
 for v in vs:
  for g in v.groups:tot[names[g.group]]=tot.get(names[g.group],0)+g.weight
 print('CLOTH_WEIGHTS',label,len(vs),{k:round(v/len(vs),4) for k,v in tot.items()})

"""Blender authoring/export helpers. Coordinates use game X/Y-up/Z-forward."""
import bpy, math, json
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
def clear():
    bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
def mat(name, color, emission=False):
    m=bpy.data.materials.new(name); m.diffuse_color=(*[int(color[i:i+2],16)/255 for i in (1,3,5)],1); m['emission']=emission
    return m
def finish(o,name,m):
    o.name=name; o.data.materials.append(m); return o
def box(name,at,size,m,bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1,location=at); o=bpy.context.object; o.scale=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        mod=o.modifiers.new('Armor chamfer','BEVEL'); mod.width=bevel; mod.segments=1
        bpy.context.view_layer.objects.active=o; bpy.ops.object.modifier_apply(modifier=mod.name)
    return finish(o,name,m)
def ellipsoid(name,at,size,m):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=6,radius=1,location=at); o=bpy.context.object; o.scale=size; return finish(o,name,m)
def cylinder(name,at,radius,depth,m,axis=(0,1,0),vertices=12):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=radius,depth=depth,location=at); o=bpy.context.object
    o.rotation_mode='QUATERNION'; o.rotation_quaternion=Vector((0,0,1)).rotation_difference(Vector(axis)); return finish(o,name,m)
def mesh(name,verts,faces,m):
    d=bpy.data.meshes.new(name); d.from_pydata(verts,[],faces); d.update(); o=bpy.data.objects.new(name,d); bpy.context.collection.objects.link(o); return finish(o,name,m)
def export(kind):
    folder=ROOT/'source-assets'/'enemy-vehicles'; folder.mkdir(parents=True,exist_ok=True)
    # Y-up source matches the engine; Blender source remains editable.
    bpy.ops.wm.save_as_mainfile(filepath=str(folder/(kind+'.blend')))
    out=[]; canopy=[]
    for obj in bpy.context.scene.objects:
        if obj.type!='MESH': continue
        d=obj.to_mesh(); d.calc_loop_triangles(); normal_matrix=obj.matrix_world.to_3x3().inverted().transposed()
        for tri in d.loop_triangles:
            material=obj.data.materials[tri.material_index]; color=list(material.diffuse_color[:3])
            destination=canopy if material.get('canopy') else out
            n=Vector((0,2,0)) if material.get('emission') else (normal_matrix@tri.normal).normalized()
            for vi in tri.vertices:
                p=obj.matrix_world@d.vertices[vi].co; destination.extend(round(v,5) for v in (*p,*n,*color))
        obj.to_mesh_clear()
    target=ROOT/'dist'/'assets'/'enemy-vehicles'; target.mkdir(parents=True,exist_ok=True)
    (target/(kind+'.js')).write_text('globalThis.EnemyVehicleMeshes=globalThis.EnemyVehicleMeshes||{};globalThis.EnemyVehicleMeshes['+json.dumps(kind)+']=new Float32Array('+json.dumps(out,separators=(',',':'))+');\nglobalThis.EnemyVehicleCanopies=globalThis.EnemyVehicleCanopies||{};globalThis.EnemyVehicleCanopies['+json.dumps(kind)+']=new Float32Array('+json.dumps(canopy,separators=(',',':'))+');\n',encoding='utf-8')
    print('EXPORTED',kind,len(out)//27,'triangles')

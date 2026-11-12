"""Export the editable mechanical creatures as game-space resident mesh parts."""
import json
from pathlib import Path

import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'source-assets/enemy-vehicles/mechanical-creatures.blend'
TARGET = ROOT / 'dist/assets/enemy-vehicles'
PALETTE = {
    'Graphite': '30394B', 'Titanium': '8196AE', 'Vermilion': 'D95747',
    'Coral': 'F48361', 'Amber': 'CDA357', 'Yellow': 'E7BC49',
    'Amber • wing membrane': 'DBA94A', 'Ice': '6EDBEA', 'Honey': 'FFBC63',
}


def axis(point):
    return Vector((point.x, point.z, -point.y))


def export(kind, collection, width, center, hinge):
    parts = [[], [], []]
    depsgraph = bpy.context.evaluated_depsgraph_get()
    source = bpy.data.collections[collection]
    root = next(obj for obj in source.objects if obj.type == 'EMPTY')
    for obj in source.objects:
        if obj.type != 'MESH':
            continue
        matrix = root.matrix_world.inverted() @ obj.matrix_world
        normal_matrix = matrix.to_3x3().inverted().transposed()
        animated = kind == 'mechanicalHornet' and obj.name.startswith(('Forewing', 'Hindwing'))
        part = 0
        if animated:
            mean_x = sum((matrix @ v.co).x for v in obj.data.vertices) / len(obj.data.vertices)
            part = 1 if mean_x < 0 else 2
        material = obj.data.materials[0].name
        tint = PALETTE.get(material, PALETTE[material.split(' • ')[0]])
        color = [round(int(tint[i:i+2], 16)/255, 5) for i in (0, 2, 4)]
        obj.modifiers.clear()
        obj.data.calc_loop_triangles()
        if len(obj.data.loop_triangles) > 240:
            modifier = obj.modifiers.new('Game mesh reduction', 'DECIMATE')
            modifier.ratio = 200 / len(obj.data.loop_triangles)
        bpy.context.view_layer.update()
        evaluated = obj.evaluated_get(depsgraph)
        mesh = evaluated.to_mesh()
        mesh.calc_loop_triangles()
        for tri in mesh.loop_triangles:
            normal = Vector((0, 2, 0)) if material.startswith(('Ice', 'Honey')) else axis((normal_matrix @ tri.normal).normalized())
            for index in tri.vertices:
                position = axis(matrix @ mesh.vertices[index].co - Vector(center)) * width + Vector((0, 24, 0))
                parts[part].extend(round(v, 4) for v in (*position, *normal, *color))
        evaluated.to_mesh_clear()
    def packed(values):
        return json.dumps(values, separators=(',', ':'))
    lines = ['globalThis.EnemyVehicleMeshes ||= {};']
    lines.append(f'EnemyVehicleMeshes.{kind} = new Float32Array({packed(parts[0])});')
    if hinge:
        pivot = axis(Vector(hinge) - Vector(center)) * width + Vector((0, 24, 0))
        wings = ','.join(f'new Float32Array({packed(part)})' for part in parts[1:])
        lines.extend(['globalThis.EnemyVehicleWings ||= {};',
                      f'EnemyVehicleWings.{kind} = {{pivot:{packed(list(pivot))},meshes:[{wings}]}};'])
    (TARGET / f'{kind}.js').write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print(kind, [len(part)//27 for part in parts])


bpy.ops.wm.open_mainfile(filepath=str(SOURCE))
export('mechanicalRay', '01  VERMILION RAY', 11.5, (0, .30, 1.72), None)
export('mechanicalHornet', '02  AMBER HORNET', 11.3, (0, .10, 2.5), (.65, .32, 3.23))

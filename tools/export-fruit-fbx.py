"""Export the four original Back Garden FBX LOD0 meshes without runtime dependencies.

Preserves polygon-corner normals and UVs; applies the FBX model rotation and scale,
then recenters x/z, puts the base on y=0 and normalizes the longest dimension to 1.
Only static, root-level meshes in the supplied source pack are supported. Fail
closed on unexpected mapping/transforms instead of silently distorting a model.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path
import shutil
import struct
import zlib

DEFAULT_SOURCE = Path(r'H:\UnityProject\TaptapJam\TaptapJamProject\TaptapGameJam\Assets\Models\Back Garden')
MODELS = {'apple': 'Apple_01', 'watermelon': 'Watermelon_01', 'banana': 'Banana_01', 'grape': 'Grape_05'}


class Fbx:
    def __init__(self, path):
        self.data = Path(path).read_bytes()
        assert self.data[:23] == b'Kaydara FBX Binary  \x00\x1a\x00', 'Binary FBX required'
        self.version = struct.unpack_from('<I', self.data, 23)[0]
        assert self.version == 7400, f'Expected source FBX 7400, got {self.version}'
        self.nodes = []
        cursor = 27
        while cursor < len(self.data):
            node, cursor = self.node(cursor)
            if node is None:
                break
            self.nodes.append(node)

    def prop(self, cursor):
        data = self.data
        kind = chr(data[cursor])
        cursor += 1
        if kind in 'YCFDIL':
            fmt = {'Y': 'h', 'C': '?', 'F': 'f', 'D': 'd', 'I': 'i', 'L': 'q'}[kind]
            return struct.unpack_from('<' + fmt, data, cursor)[0], cursor + struct.calcsize(fmt)
        if kind in 'SR':
            length = struct.unpack_from('<I', data, cursor)[0]
            cursor += 4
            value = data[cursor:cursor + length]
            return value.decode('utf-8') if kind == 'S' else value, cursor + length
        length, encoding, byte_length = struct.unpack_from('<III', data, cursor)
        cursor += 12
        assert encoding in [0, 1], 'Unsupported FBX array encoding'
        raw = data[cursor:cursor + byte_length]
        if encoding:
            raw = zlib.decompress(raw)
        fmt = {'f': 'f', 'd': 'd', 'i': 'i', 'l': 'q', 'b': '?', 'c': 'b'}[kind]
        return list(struct.unpack('<' + str(length) + fmt, raw)), cursor + byte_length

    def node(self, cursor):
        end, count, _, name_length = struct.unpack_from('<IIIB', self.data, cursor)
        cursor += 13
        if end == 0:
            return None, cursor
        name = self.data[cursor:cursor + name_length].decode('utf-8')
        cursor += name_length
        props, children = [], []
        for _ in range(count):
            prop, cursor = self.prop(cursor)
            props.append(prop)
        while cursor < end:
            child, cursor = self.node(cursor)
            if child is None:
                break
            children.append(child)
        return {'name': name, 'props': props, 'children': children}, end


def child(node, name):
    return next(c for c in node['children'] if c['name'] == name)


def values(node, name):
    return child(node, name)['props'][0]


def properties(node):
    return {p['props'][0]: p['props'][4:] for p in child(node, 'Properties70')['children']}


def rotate(v, angles):
    x, y, z = v
    for axis, deg in enumerate(angles):
        a = math.radians(deg)
        c, s = math.cos(a), math.sin(a)
        if axis == 0:
            y, z = c*y-s*z, s*y+c*z
        elif axis == 1:
            x, z = c*x+s*z, -s*x+c*z
        else:
            x, y = c*x-s*y, s*x+c*y
    return [x, y, z]


def layer_corner(layer, direct_name, index_name, vertex, corner, width):
    mapping, reference = values(layer, 'MappingInformationType'), values(layer, 'ReferenceInformationType')
    assert mapping in ['ByPolygonVertex', 'ByVertice', 'ByVertex'], mapping
    i = corner if mapping == 'ByPolygonVertex' else vertex
    assert reference in ['Direct', 'IndexToDirect'], reference
    if reference == 'IndexToDirect':
        i = values(layer, index_name)[i]
    return values(layer, direct_name)[i*width:i*width+width]


def export(path, kind):
    fbx = Fbx(path)
    objects = child({'children': fbx.nodes}, 'Objects')['children']
    connections = child({'children': fbx.nodes}, 'Connections')['children']
    model = next(o for o in objects if o['name'] == 'Model' and o['props'][1].split('\x00')[0] == path.stem + '_LOD0')
    model_id = model['props'][0]
    parents = [c['props'][2] for c in connections if c['props'][:2] == ['OO', model_id]]
    assert parents == [0], 'Unexpected transformed parent'
    geometry_ids = [c['props'][1] for c in connections if c['props'][0] == 'OO' and c['props'][2] == model_id]
    geometry = next(o for o in objects if o['name'] == 'Geometry' and o['props'][0] in geometry_ids)
    transform = properties(model)
    for forbidden in ['PreRotation', 'PostRotation', 'RotationOffset', 'RotationPivot', 'ScalingOffset', 'ScalingPivot', 'GeometricTranslation', 'GeometricRotation']:
        assert all(abs(v) < 1e-6 for v in transform.get(forbidden, [0, 0, 0])), forbidden
    assert transform.get('RotationOrder', [0]) == [0], 'Expected XYZ Euler order'
    scale = transform.get('Lcl Scaling', [1, 1, 1])
    angles = transform.get('Lcl Rotation', [0, 0, 0])
    assert all(s > 0 for s in scale), 'Positive scale required'
    raw = values(geometry, 'Vertices')
    points = [rotate([raw[i+j]*scale[j] for j in range(3)], angles) for i in range(0, len(raw), 3)]
    lo = [min(v[i] for v in points) for i in range(3)]
    hi = [max(v[i] for v in points) for i in range(3)]
    span = max(hi[i]-lo[i] for i in range(3))
    origin = [(lo[0]+hi[0])*.5, lo[1], (lo[2]+hi[2])*.5]
    points = [[(v[i]-origin[i])/span for i in range(3)] for v in points]
    normals = child(geometry, 'LayerElementNormal')
    uv_layer = child(geometry, 'LayerElementUV')
    polygons, polygon = [], []
    for corner, encoded_vertex in enumerate(values(geometry, 'PolygonVertexIndex')):
        vertex = encoded_vertex if encoded_vertex >= 0 else -encoded_vertex-1
        normal = layer_corner(normals, 'Normals', 'NormalsIndex', vertex, corner, 3)
        normal = rotate([normal[i]/scale[i] for i in range(3)], angles)
        length = math.sqrt(sum(n*n for n in normal))
        assert length > 0
        normal = [n/length for n in normal]
        uv = layer_corner(uv_layer, 'UV', 'UVIndex', vertex, corner, 2)
        polygon.append((points[vertex], normal, uv))
        if encoded_vertex < 0:
            assert len(polygon) in [3, 4], 'Only source triangles and convex quads are supported'
            polygons.append(polygon)
            polygon = []
    assert not polygon
    positions, out_normals, uvs = [], [], []
    for polygon in polygons:
        for i in range(1, len(polygon)-1):
            for pos, normal, uv in [polygon[0], polygon[i], polygon[i+1]]:
                positions.extend(round(v, 7) for v in pos)
                out_normals.extend(round(v, 7) for v in normal)
                uvs.extend(round(v, 7) for v in uv)
    assert all(math.isfinite(v) for a in [positions, out_normals, uvs] for v in a)
    return {
        'version': 1, 'name': kind, 'source': path.name, 'sourceModel': model['props'][1].split('\x00')[0],
        'texture': 'Garden-Palette.png', 'material': {'name': 'Mat_Garden', 'color': [1, 1, 1, 1]},
        'positions': positions, 'normals': out_normals, 'uvs': uvs, 'vertexCount': len(positions)//3,
        'triangleCount': len(positions)//9, 'bounds': {'min': [round((lo[i]-origin[i])/span, 7) for i in range(3)], 'max': [round((hi[i]-origin[i])/span, 7) for i in range(3)]},
        'coordinateSystem': 'Y-up, right-handed, x/z centered, base y=0, maximum extent=1',
        'uvOrigin': 'bottom-left', 'sourceTransform': transform,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, default=DEFAULT_SOURCE)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    output, archive = args.root/'dist/assets/fruits', args.root/'source-assets/fruits'
    output.mkdir(parents=True, exist_ok=True)
    archive.mkdir(parents=True, exist_ok=True)
    manifest = {'sourceRoot': str(args.source), 'converter': 'tools/export-fruit-fbx.py', 'models': {}, 'files': []}
    sources = []
    for kind, source_name in MODELS.items():
        source = args.source/'Models'/f'{source_name}.fbx'
        result = export(source, kind)
        destination = output/f'{kind}.json'
        destination.write_text(json.dumps(result, separators=(',', ':')), encoding='utf-8')
        manifest['models'][kind] = {'source': str(source), 'lod': 0, 'model': result['sourceModel'], 'output': destination.relative_to(args.root).as_posix(), 'vertices': result['vertexCount'], 'triangles': result['triangleCount'], 'sha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'bounds': result['bounds']}
        sources.extend([Path('Models')/(source_name+'.fbx'), Path('Models')/(source_name+'.fbx.meta')])
        print(kind, result['vertexCount'], 'vertices', result['triangleCount'], 'triangles', destination.stat().st_size, 'bytes')
    sources.extend([Path('Materials/Mat_Garden.mat'), Path('Materials/Mat_Garden.mat.meta'), Path('Textures/Garden-Palette.png'), Path('Textures/Garden-Palette.png.meta')])
    for relative in sources:
        source, destination = args.source/relative, archive/relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)
        manifest['files'].append({'source': str(source), 'archive': destination.relative_to(args.root).as_posix(), 'sha256': hashlib.sha256(source.read_bytes()).hexdigest()})
    shutil.copy2(args.source/'Textures/Garden-Palette.png', output/'Garden-Palette.png')
    (archive/'provenance.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    (output/'manifest.json').write_text(json.dumps({'version': 1, 'texture': 'Garden-Palette.png', 'models': {kind: kind+'.json' for kind in MODELS}}, indent=2), encoding='utf-8')


if __name__ == '__main__':
    main()

# Run inside Maya's Python Script Editor. Reads evaluated mesh output, not its history.
import os
import datetime
import maya.cmds as cmds
import maya.api.OpenMaya as om

OUTPUT_DIR = r'C:/Users/Administrator/Documents/maya/projects/default/scenes/Cat'
ALIASES = {'r_eye': 'R_EYe', 'l_eye': 'L_Eye', 'body': 'Body', 'earphone': 'EarPhone'}

def _visible_shapes(nodes):
    result = set()
    for node in nodes:
        if cmds.nodeType(node) == 'mesh':
            candidates = [node]
        else:
            candidates = cmds.listRelatives(node, allDescendents=True, type='mesh', fullPath=True) or []
        for shape in candidates:
            if not cmds.getAttr(shape + '.intermediateObject'):
                result.add(shape)
    return sorted(result)

def _canonical(shape):
    parent = cmds.listRelatives(shape, parent=True, fullPath=True)[0]
    return ALIASES.get(parent.split('|')[-1].split(':')[-1].lower())

def main():
    selection = cmds.ls(selection=True, long=True) or []
    preferred = _visible_shapes(selection)
    found = {}
    # Prefer exact named shapes in the user's selection; fall back to the scene.
    for shape in preferred + _visible_shapes(cmds.ls(type='mesh', long=True)):
        if 'NeonCat_CleanExport' in shape:
            continue
        name = _canonical(shape)
        if name and name not in found:
            found[name] = shape
    missing = [name for name in ('R_EYe', 'L_Eye') if name not in found]
    if missing:
        raise RuntimeError('Missing evaluated eye meshes: ' + ', '.join(missing))
    # Read every selected mesh before creating anything. Originals are never edited.
    snapshots = []
    for name, shape in sorted(found.items()):
        sl = om.MSelectionList(); sl.add(shape)
        path = sl.getDagPath(0); fn = om.MFnMesh(path)
        points = fn.getPoints(om.MSpace.kWorld)
        counts, indices = fn.getVertices()
        if not len(points) or not len(counts):
            raise RuntimeError('Empty mesh output: ' + shape)
        uv_set = fn.currentUVSetName()
        u, v = fn.getUVs(uv_set)
        uv_counts, uv_ids = fn.getAssignedUVs(uv_set)
        if name in ('R_EYe', 'L_Eye') and not len(u):
            raise RuntimeError('Eye mesh has no UVs: ' + shape)
        shaders, assignments = fn.getConnectedShaders(path.instanceNumber())
        shader_names = [om.MFnDependencyNode(s).name() for s in shaders]
        snapshots.append((name, points, counts, indices, u, v, uv_counts, uv_ids,
                          shader_names, list(assignments)))
    if not cmds.pluginInfo('fbxmaya', query=True, loaded=True):
        cmds.loadPlugin('fbxmaya')
    group = cmds.group(empty=True, name='NeonCat_CleanExport#')
    report = []
    try:
        for name, points, counts, indices, u, v, uv_counts, uv_ids, shaders, assignments in snapshots:
            transform = cmds.createNode('transform', name=name, parent=group)
            sl = om.MSelectionList(); sl.add(transform)
            fn = om.MFnMesh(); obj = fn.create(points, counts, indices, sl.getDependNode(0))
            shape = om.MFnDagNode(obj).fullPathName()
            if len(u):
                fn.setUVs(u, v, 'map1'); fn.assignUVs(uv_counts, uv_ids, 'map1')
            cmds.sets(shape, edit=True, forceElement='initialShadingGroup')
            for shader_index, shader in enumerate(shaders):
                faces = ['%s.f[%s]' % (shape, i) for i, a in enumerate(assignments) if a == shader_index]
                if faces and cmds.objExists(shader):
                    cmds.sets(faces, edit=True, forceElement=shader)
            report.append({'name': name, 'vertices': len(points), 'faces': len(counts), 'uvs': len(u)})
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        output = os.path.join(OUTPUT_DIR, 'NeonTowerCat_EyeModified_Clean.fbx')
        if os.path.exists(output):
            output = os.path.join(OUTPUT_DIR, 'NeonTowerCat_EyeModified_Clean_' + datetime.datetime.now().strftime('%Y%m%d_%H%M%S') + '.fbx')
        cmds.select(group, replace=True)
        # Disable connection expansion so original skinned meshes are not dragged into the file.
        cmds.file(output, force=True, type='FBX export', options='v=0;',
                  exportSelected=True, constructionHistory=False, channels=False,
                  constraints=False, expressions=False, shader=True, preserveReferences=False)
        print('NEON_CAT_CLEAN_EXPORT: ' + output)
        print('Mesh report: ' + repr(report))
        print('Original meshes and rig preserved. Clean copies have no skin; rebind them in the game asset pipeline.')
        cmds.confirmDialog(title='Neon Cat export complete', message=output + '\n\nOriginal meshes and rig preserved.', button=['OK'])
    finally:
        if selection:
            cmds.select(selection, replace=True)
        else:
            cmds.select(clear=True)

main()

# Back Garden fruit source assets

These files are copied unchanged from the existing Unity project recorded in
`provenance.json`. SHA-256 hashes tie every archived FBX, Unity metadata, material
and palette to its source. Only the compact derived meshes and palette under
`dist/assets/fruits/` are loaded by the game.

Run `python tools/export-fruit-fbx.py` from the project root to reproduce the
assets. `--source` can select another checkout of the same Back Garden folder.
The converter uses Python's standard library and does not require a runtime FBX
loader, Blender, or Assimp. It reads binary FBX 7400, selects each original LOD0,
applies local scale/XYZ rotation, preserves source normals and UVs, and expands
triangles/convex quads into non-indexed triangles. It fails on unsupported source
transforms or topology. It does not redraw or replace the original geometry.

Exported geometry is right-handed and Y-up, centered on x/z, grounded at y=0,
with maximum bounding-box extent 1. FBX scene translation is removed during this
normalization. Normals retain inverse-transpose scaling and rotation. UV origin
is bottom-left: flip the uploaded PNG vertically once, or invert `v` in the
shader. Preserve the original palette lookup; use nearest filtering and do not
substitute flat colors for the texture.

Selected models: Apple_01, Watermelon_01, Banana_01, Grape_05. Grape_05 was chosen
over Grape_03 because its compact grape cluster and short stem remain clearer at
pickup scale. All four use the original Mat_Garden / Garden-Palette.png pair.

Run `node tests/test-fruit-model-assets.cjs` to verify source hashes, material
association, geometry arrays, bounds, UVs, normals and triangle winding.

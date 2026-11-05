const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const root=path.resolve(__dirname,'..');
const readJson=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const provenance=readJson('source-assets/fruits/provenance.json');
const manifest=readJson('dist/assets/fruits/manifest.json');
assert.deepEqual(Object.keys(manifest.models).sort(),['apple','banana','grape','watermelon']);
for(const source of provenance.files){
 const bytes=fs.readFileSync(path.join(root,source.archive));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),source.sha256,source.archive+' source hash');
 if(source.archive.endsWith('.fbx'))assert.equal(bytes.subarray(0,23).toString('binary'),'Kaydara FBX Binary  \0\x1a\0');
}
assert.equal(provenance.models.grape.model,'Grape_05_LOD0');
assert.deepEqual(fs.readFileSync(path.join(root,'dist/assets/fruits/Garden-Palette.png')),fs.readFileSync(path.join(root,'source-assets/fruits/Textures/Garden-Palette.png')));
const paletteGuid=fs.readFileSync(path.join(root,'source-assets/fruits/Textures/Garden-Palette.png.meta'),'utf8').match(/guid: (\w+)/)[1];
assert.ok(fs.readFileSync(path.join(root,'source-assets/fruits/Materials/Mat_Garden.mat'),'utf8').includes(paletteGuid),'original material uses imported palette');
for(const [kind,file] of Object.entries(manifest.models)){
 const mesh=readJson('dist/assets/fruits/'+file),n=mesh.vertexCount;
 assert.equal(mesh.version,1);assert.equal(mesh.name,kind);assert.equal(mesh.sourceModel,provenance.models[kind].model);
 assert.equal(mesh.material.name,'Mat_Garden');assert.equal(mesh.texture,'Garden-Palette.png');assert.equal(mesh.uvOrigin,'bottom-left');
 assert.equal(mesh.positions.length,n*3);assert.equal(mesh.normals.length,n*3);assert.equal(mesh.uvs.length,n*2);assert.equal(mesh.triangleCount,n/3);
 assert.ok(n>1000);assert.ok([...mesh.positions,...mesh.normals,...mesh.uvs].every(Number.isFinite));
 assert.ok(mesh.uvs.every(v=>v>=0&&v<=1));assert.equal(mesh.bounds.min[1],0);
 assert.ok(Math.abs(Math.max(...mesh.bounds.max.map((v,i)=>v-mesh.bounds.min[i]))-1)<1e-6);
 const vertices=mesh.positions,normals=mesh.normals;
 for(let i=0;i<n*3;i+=3)assert.ok(Math.abs(Math.hypot(...normals.slice(i,i+3))-1)<1e-6,kind+' unit normals');
 for(let i=0;i<n*3;i+=9){
  const a=vertices.slice(i,i+3),b=vertices.slice(i+3,i+6).map((v,k)=>v-a[k]),c=vertices.slice(i+6,i+9).map((v,k)=>v-a[k]);
  const cross=[b[1]*c[2]-b[2]*c[1],b[2]*c[0]-b[0]*c[2],b[0]*c[1]-b[1]*c[0]],normal=normals.slice(i,i+3);
  assert.ok(cross.reduce((sum,v,k)=>sum+v*normal[k],0)>0,kind+' winding agrees with original normal');
 }
 for(let axis=0;axis<3;axis++){
  const values=vertices.filter((_,i)=>i%3===axis);
  assert.ok(Math.abs(Math.min(...values)-mesh.bounds.min[axis])<1e-6);
  assert.ok(Math.abs(Math.max(...values)-mesh.bounds.max[axis])<1e-6);
 }
}
console.log('Imported fruit assets: original FBX/material/palette hashes, source mapping, four LOD0 triangle meshes, finite normalized bounds, UVs, unit normals and winding passed.');

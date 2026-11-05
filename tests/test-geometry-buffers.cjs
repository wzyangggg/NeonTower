const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const ctx=vm.createContext({Float32Array});vm.runInContext(fs.readFileSync('dist/renderer.js','utf8')+';globalThis.Renderer=Elevator3D',ctx);
const r=Object.assign(Object.create(ctx.Renderer.prototype),{data:new Float32Array(9),count:0,transparentData:new Float32Array(7),transparentCount:0,colors:{}});
let seed=31;const rand=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296)*40-20;
const opaque=[],transparent=[];
for(let i=0;i<1000;i++){
 const pts=Array.from({length:4},()=>[rand(),rand(),rand()]),alpha=[rand(),0,.5,1];if(i%17===0)pts[2]=pts[1];
 const [a,b,c]=pts,u=b.map((v,i)=>v-a[i]),v=c.map((x,i)=>x-a[i]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],l=Math.hypot(...n)||1,normal=n.map(x=>-x/l),rgb=[0x37/255,0xbd/255,0x89/255];
 for(const j of [0,1,2,0,2,3]){opaque.push(...pts[j],...normal,...rgb);transparent.push(...pts[j],...rgb,Math.max(0,Math.min(1,alpha[j])));}
 r.quad(...pts,'#37bd89');r.transparentQuad(...pts,'#37bd89',alpha);
}
assert.deepEqual(r.data.slice(0,r.count),new Float32Array(opaque));assert.deepEqual(r.transparentData.slice(0,r.transparentCount),new Float32Array(transparent));
console.log('Geometry buffers: 1000 seeded quads, degenerate normals, winding, colors, alpha clamp and repeated capacity growth match reference');

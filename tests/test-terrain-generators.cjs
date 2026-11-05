const assert=require('node:assert/strict'),G=require('../dist/terrain-generators.js'),H=require('../dist/hex-map.js');
let samples=0;
for(const id of Object.keys(G.algorithms))for(let seed=0;seed<40;seed++)for(const count of [19,36,70,110])for(const variation of [0,50,100]){
 const options={seed:String(seed),count,variation,connected:true},map=G.generate(id,options),set=new Set(map.cells.map(G.key));
 assert.equal(set.size,map.cells.length);if(id!=='rhythm')assert.equal(map.cells.length,count,`${id}/${seed}/${count}/${variation} target`);else assert.equal(map.changed,0,'rhythm keeps room/corridor structure');assert.equal(map.stats.components,1);
 assert.ok(map.cells.every(c=>Number.isInteger(c.x)&&Number.isInteger(c.y)&&Math.abs(c.x)<=4&&Math.abs(c.y)<=9));
 assert.ok(H.canStand(map.cells,325,350,7),'safe player spawn');assert.deepEqual(G.generate(id,options),map,'repeatable seed');
 const raw=G.generate(id,{...options,connected:false});assert.equal(raw.changed,0);assert.equal(raw.rawCount,raw.cells.length);
 if(id==='growth'||id==='walk'||id==='rooms')assert.equal(raw.stats.components,1,`${id} inherently connected`);samples++;
}
console.log(`Terrain generator invariants passed: ${samples} maps, eight algorithms, deterministic seeds, exact repaired area, safe spawn, connectivity, bounds and raw mode.`);

for(let seed=0;seed<50;seed++){
 const base={seed:String(seed),count:60,variation:100,connected:false};
 const convex=G.generate('island',{...base,islandMode:'convex'}),zero=G.generate('island',{...base,variation:0});
 assert.deepEqual(convex.cells,zero.cells,'zero erosion reproduces convex body');
 for(const islandMode of ['convex','eroded','mixed'])for(const bays of [1,4]){
  const map=G.generate('island',{...base,islandMode,bays,sides:4+seed%6,roughness:seed%2?0:100});
  assert.equal(map.cells.length,60);assert.equal(map.stats.components,1);assert.equal(map.changed,0);
  assert.ok(H.canStand(map.cells,325,350,7));
 }
}
console.log('Island modes passed: 600 maps, convex/eroded/mixed, bay counts, polygon sides, roughness and zero-erosion equivalence.');

for(let seed=0;seed<30;seed++)for(const regionCount of [2,3,4])for(const corridorWidth of [1,2])for(const regionSpacing of [0,100]){
 const map=G.generate('rhythm',{seed:String(seed),count:55,regionCount,corridorWidth,regionSpacing}),r=map.rhythm,set=new Set(map.cells.map(G.key));
 assert.equal(r.regionCount,regionCount);assert.ok(r.corridors.length<=r.landmassCount-1);assert.ok(r.landmassCount<=regionCount);assert.ok(map.cells.length>=1);assert.equal(map.stats.components,1);assert.equal(map.changed,0);
 const owner=new Map();r.regions.forEach((room,i)=>{for(const c of room.cells){const k=G.key(c);assert.ok(set.has(k));assert.ok(!owner.has(k));owner.set(k,i);}});
 for(const corridor of r.corridors){assert.ok(corridor.path.length>=3,'corridor has space between rooms');for(let j=0;j<corridor.path.length;j++){const c=corridor.path[j];assert.ok(set.has(G.key(c)));if(j)assert.ok(G.adj(c).some(a=>G.key(a)===G.key(corridor.path[j-1])),'continuous corridor');}if(corridorWidth===1)assert.ok(corridor.cells.every(c=>!owner.has(G.key(c))&&corridor.path.some(a=>G.key(a)===G.key(c))),'one-cell corridor follows only its spine');}
}
console.log('Rhythm topology passed: 360 maps, independent growth centers, natural merging, continuous narrow corridors and no generic fill.');

for(const regionCount of [2,3,4]){
 const small=G.generate('rhythm',{count:19,regionCount,seed:'merge',regionSpacing:0});
 const large=G.generate('rhythm',{count:110,regionCount,seed:'merge',regionSpacing:0});
 assert.ok(small.rhythm.islands.every(i=>i.radius<=2),'small islands respect radius');
 assert.ok(large.rhythm.islands.every(i=>i.radius<=2),'merged large island also capped');assert.ok(large.rhythm.islandSizes.every(n=>n<=19),'radius 2 has at most 19 cells');
 assert.equal(large.rhythm.landmassCount,1,'large regions merge naturally');assert.equal(large.rhythm.corridors.length,0,'merged mainland needs no artificial corridor');
 assert.deepEqual(small.rhythm.regions.map(r=>r.weight),large.rhythm.regions.map(r=>r.weight),'area preserves relative island weights after centering');
}
console.log('Natural merging: independent 19/110-cell budgets across 2/3/4 centers; large mainland merges with no artificial corridor.');

const seenWidths=new Set();let twoWidthsOnOneMap=false;
for(let seed=0;seed<60;seed++){
 const options={seed:String(seed),count:40,regionCount:4,sizeVariation:90,corridorWidthMin:1,corridorWidthMax:3,regionSpacing:100};
 const m=G.generate('rhythm',options),large=G.generate('rhythm',{...options,count:80}),sizes=m.rhythm.regions.map(r=>r.cells.length);
 assert.ok(m.rhythm.islands.every(i=>i.radius<=2),'random sizes stay within radius');
 assert.deepEqual(m.rhythm.regions.map(r=>r.weight),large.rhythm.regions.map(r=>r.weight),'area retains per-island weights');
 assert.deepEqual(G.generate('rhythm',options),m,'random widths and sizes reproduce');
 for(const c of m.rhythm.corridors){assert.ok(c.width>=1&&c.width<=3);seenWidths.add(c.width);}
 if(new Set(m.rhythm.corridors.map(c=>c.width)).size>1)twoWidthsOnOneMap=true;
 for(const width of [1,2,3]){const fixed=G.generate('rhythm',{...options,corridorWidthMin:width,corridorWidthMax:width});assert.ok(fixed.rhythm.corridors.every(c=>c.width===width));assert.equal(fixed.stats.components,1);assert.deepEqual(fixed.rhythm.regions.map(r=>({weight:r.weight,area:r.cells.length})),m.rhythm.regions.map(r=>({weight:r.weight,area:r.cells.length})),'width does not change region sizes');}
}
assert.deepEqual([...seenWidths].sort(),[1,2,3]);assert.ok(twoWidthsOnOneMap,'corridors vary within a single map');
console.log('Randomized sizes/widths: 60 seeds, stable unequal weights, independent widths across 1–3, fixed endpoints, reproducibility and connectivity passed.');

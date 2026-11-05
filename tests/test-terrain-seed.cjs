const assert=require('node:assert/strict'),G=require('../dist/terrain-generators.js'),H=require('../dist/hex-map.js');
const counts=new Set(),regions=new Set();
for(let i=0;i<100;i++){
 const seed='single-seed-'+i,options=G.parametersFromSeed(seed),map=G.generateFromSeed(seed);
 assert.deepEqual(G.generateFromSeed(seed),map,'one seed reproduces params and terrain');assert.deepEqual(map.parameters,options);assert.equal(map.recipeVersion,7);
 assert.deepEqual(map.cells,G.generate('rhythm',options).cells,'seed wrapper uses the established algorithm');
 assert.ok(options.count>=32&&options.count<=85);assert.ok(options.regionCount>=2&&options.regionCount<=4);assert.ok(options.sizeVariation>=60&&options.sizeVariation<=100);
 assert.ok(map.cells.every(c=>Math.abs(c.x)<=4&&Math.abs(c.y)<=9),'portrait map boundary');assert.equal(map.stats.components,1);assert.ok(map.rhythm.islandSizes.filter(n=>n>=Math.max(10,Math.ceil(map.rhythm.islandSizes.reduce((a,b)=>a+b,0)*.2))).length>=2,'at least two substantial islands before connecting');assert.ok(H.canStand(map.cells,325,350,7));assert.ok(map.rhythm.corridors.every(c=>c.width>=1&&c.width<=3));
 const corridorCells=new Set(map.rhythm.corridors.flatMap(c=>c.cells.map(G.key))),bodySet=new Set(map.cells.map(G.key).filter(k=>!corridorCells.has(k)));
 const broad=G.components(bodySet).filter(group=>{if(group.length<Math.max(10,Math.ceil(map.rhythm.islandSizes.reduce((a,b)=>a+b,0)*.2)))return false;const set=new Set(group);return group.filter(k=>{const [x,y]=k.split(',').map(Number);return G.adj({x,y}).filter(c=>set.has(G.key(c))).length>=4;}).length>=2;});assert.ok(broad.length>=2,'second body has width rather than being a thin tail');
 for(const island of map.rhythm.islands){assert.ok(island.radius<=2);assert.ok(island.cells.some(c=>G.key(c)===G.key(island.center)));for(const c of island.cells){const axial=q=>[q.x-(q.y-(q.y&1))/2,q.y],[a,b]=axial(c),[x,y]=axial(island.center);assert.ok(Math.max(Math.abs(a-x),Math.abs(b-y),Math.abs(a+b-x-y))<=2,'actual island stays within its own radius 2');}}
 const raw=G.generate('rhythm',{...options,centered:false}),offset=map.rhythm.placementOffset;
 const rotated=raw.cells.map(c=>{let q=c.x-(c.y-(c.y&1))/2,r=c.y;for(let j=0;j<map.rhythm.rotationTurns;j++)[q,r]=[-r,q+r];return {x:q+(r-(r&1))/2,y:r};});
 const shifted=rotated.map(c=>{const r=c.y+offset.r,q=c.x-(c.y-(c.y&1))/2+offset.q;return {x:q+(r-(r&1))/2,y:r};});
 assert.deepEqual(new Set(shifted.map(G.key)),new Set(map.cells.map(G.key)),'placement preserves a rigid hex rotation and translation');
 const xs=map.cells.map(c=>H.x(c.x,c.y)),ys=map.cells.map(c=>H.y(c.y));
 assert.ok(Math.max(...ys)-Math.min(...ys)+H.RADIUS*2 >= (Math.max(...xs)-Math.min(...xs)+H.TILE)*1.15,'campaign terrain extends vertically');
 const saved=JSON.parse(JSON.stringify(map));assert.deepEqual(G.generateFromSeed(saved.seed),map,'exported seed recreates entire result');counts.add(options.count);regions.add(options.regionCount);
}
assert.ok(counts.size>20);assert.equal(regions.size,3);assert.deepEqual(G.generateFromSeed(),G.generateFromSeed('elevator-01'));console.log('Single seed passed: 100 seeds, all generated parameters, recipe version, exact replay/export replay, area diversity, safe spawn and corridor range.');

const widths=[0,0,0,0];for(let i=0;i<1000;i++)widths[G.corridorWidthFromRoll(1,3,(i+.5)/1000)]++;
assert.deepEqual(widths.slice(1),[750,200,50],'thin corridors receive 75/20/5 percent probability');
for(const width of [1,2,3])for(const roll of [0,.2,.9,.999])assert.equal(G.corridorWidthFromRoll(width,width,roll),width);
console.log('Corridor probability passed: 75% one-cell, 20% two-cell, 5% three-cell; fixed widths preserved.');

const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const H=require('../dist/hex-map.js');
// Trim must have real clearance from both the shaft and its own backing.
const columnFaces=[],columnMock={count:0,data:[],quad(...args){columnFaces.push(args);},emissiveQuad(...args){columnFaces.push(args);},markFloor(){}};
H.column(columnMock,'floor');
const heights=columnFaces.flatMap(face=>face.slice(0,4).map(p=>p[1]));
assert.equal(Math.max(...heights)-Math.min(...heights),36,'tile thickness is exactly three times 12');
for(let i=0;i<6;i++)assert.equal(columnFaces[i*3+1][4],'#000000','lower tile layer defaults to black');
for(let i=0;i<6;i++){
 const wall=columnFaces[i*3],a=wall[0],b=wall[1],dx=b[0]-a[0],dz=b[2]-a[2],length=Math.hypot(dx,dz),distance=p=>((p[0]-a[0])*dz-(p[2]-a[2])*dx)/length;
 for(const p of columnFaces[36+i*2].slice(0,4))assert.ok(Math.abs(distance(p)-1.2)<1e-6,'column backing clears the wall');
 for(const p of columnFaces[37+i*2].slice(0,4))assert.ok(Math.abs(distance(p)-1.4)<1e-6,'column light clears both wall and backing');
}
for(let col=-30;col<=30;col++)for(let row=-30;row<=30;row++){
 const px=325+H.x(col,row),py=300+H.y(row);assert.deepEqual(H.cellAt(px,py),{x:col,y:row});assert.ok(H.inside({x:col,y:row},px,py));
 const ns=H.neighbors(col,row);assert.equal(new Set(ns.map(([a,b])=>(col+a)+','+(row+b))).size,6);
 for(const [a,b]of ns){assert.ok(Math.abs(Math.hypot(H.x(col+a,row+b)-H.x(col,row),H.y(row+b)-H.y(row))-54)<1e-8);assert.ok(H.neighbors(col+a,row+b).some(([c,d])=>a+c===0&&b+d===0));}
}
assert.ok(!H.inside({x:0,y:0},325+H.x(0,0)+26,300+H.y(0)+29));
const source=fs.readFileSync('dist/game.js','utf8'),hex=H.transform(source);new vm.Script(hex);
const G=require('../dist/terrain-generators.js'),seed='campaign-integration',expected=G.generateFromSeed(seed);
const opening={HexMap:{...H,campaignFloor:()=>H.campaignFloor(seed)}};vm.createContext(opening);
vm.runInContext('let tiles=[];'+hex.match(/function resetFloor\(\)\{[^}]*\}/)[0]+';resetFloor();globalThis.cells=tiles;',opening);
assert.deepEqual(opening.cells.map(({x,y})=>({x,y})),expected.cells,'campaign opening uses the exact approved seed recipe');
assert.equal(expected.recipeVersion,7);assert.ok(expected.rhythm.islands.length>=2);assert.ok(expected.rhythm.islands.every(i=>i.radius<=2));
assert.equal(opening.cells.filter(t=>t.medical).length,0);assert.equal(opening.cells.filter(t=>t.shieldTile).length,0);
assert.ok(H.canStand(opening.cells,325,350,7),'spawn is safely on the generated floor');
opening.cells[0].coverTile=true;vm.runInContext('resetFloor();globalThis.cells=tiles;',opening);
assert.deepEqual(opening.cells.map(({x,y})=>({x,y})),expected.cells);assert.ok(opening.cells.every(t=>!t.coverTile),'restart restores fresh tile state');
const first=H.campaignFloor(),firstSeed=H.campaignMap.seed;H.campaignFloor();assert.notEqual(H.campaignMap.seed,firstSeed,'unpinned restarts select a fresh seed');
assert.ok(first.length>19);assert.equal(H.initialFloor().length,19,'tile lab reference board remains independent');
assert.ok(!hex.includes('hell-elevator-best'));assert.ok(hex.includes('hell-elevator-hex-best'));
assert.ok(!hex.includes('[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>hasTile(x+a,y+b))'));
for(const name of ['drawResidentEnemy','drawPlayerHeadHousing','createWeaponModel','renderShop','startCampaignBoss','cashTilesEnabled'])assert.ok(hex.includes('function '+name+'('));
assert.ok(!/\b(t|next|a|b)\.[xy]\*TILE\b/.test(hex));
for(const text of ['"tile": "医疗格"','"tile": "护盾格"','"tile": "印钞格"','"tile": "震荡格"','"tile": "掩体格"'])assert.ok(hex.includes(text));
console.log('Hex campaign: exact hex picking/6-way adjacency, center conversions, runtime compilation, original combat/shop/terrain preserved and separate best record passed.');
require('./test-hex-movement.cjs');

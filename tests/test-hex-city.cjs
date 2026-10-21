const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const H=require('../dist/hex-map.js');
// Trim must have real clearance from both the shaft and its own backing.
const columnFaces=[],columnMock={count:0,data:[],quad(...args){columnFaces.push(args);},emissiveQuad(...args){columnFaces.push(args);},markFloor(){}};
H.column(columnMock,'floor');
for(let i=0;i<3;i++){
 const wall=columnFaces[i*4],a=wall[0],b=wall[1],dx=b[0]-a[0],dz=b[2]-a[2],length=Math.hypot(dx,dz),distance=p=>((p[0]-a[0])*dz-(p[2]-a[2])*dx)/length;
 for(const p of columnFaces[24+i*2].slice(0,4))assert.ok(Math.abs(distance(p)-.2)<1e-6,'column backing clears the wall');
 for(const p of columnFaces[25+i*2].slice(0,4))assert.ok(Math.abs(distance(p)-.4)<1e-6,'column light clears both wall and backing');
}
for(let col=-30;col<=30;col++)for(let row=-30;row<=30;row++){
 const px=325+H.x(col,row),py=300+H.y(row);assert.deepEqual(H.cellAt(px,py),{x:col,y:row});assert.ok(H.inside({x:col,y:row},px,py));
 const ns=H.neighbors(col,row);assert.equal(new Set(ns.map(([a,b])=>(col+a)+','+(row+b))).size,6);
 for(const [a,b]of ns){assert.ok(Math.abs(Math.hypot(H.x(col+a,row+b)-H.x(col,row),H.y(row+b)-H.y(row))-54)<1e-8);assert.ok(H.neighbors(col+a,row+b).some(([c,d])=>a+c===0&&b+d===0));}
}
assert.ok(!H.inside({x:0,y:0},325+H.x(0,0)+26,300+H.y(0)+29));
const source=fs.readFileSync('dist/game.js','utf8'),hex=H.transform(source);new vm.Script(hex);
assert.ok(!hex.includes('hell-elevator-best'));assert.ok(hex.includes('hell-elevator-hex-best'));
assert.ok(!hex.includes('[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>hasTile(x+a,y+b))'));
for(const name of ['drawResidentEnemy','drawPlayerHeadHousing','createWeaponModel','renderShop','startCampaignBoss','cashTilesEnabled'])assert.ok(hex.includes('function '+name+'('));
assert.ok(!/\b(t|next|a|b)\.[xy]\*TILE\b/.test(hex));
for(const text of ['"tile": "医疗格"','"tile": "护盾格"','"tile": "印钞格"','"tile": "震荡格"','"tile": "掩体格"'])assert.ok(hex.includes(text));
console.log('Hex campaign: exact hex picking/6-way adjacency, center conversions, runtime compilation, original combat/shop/terrain preserved and separate best record passed.');
require('./test-hex-movement.cjs');

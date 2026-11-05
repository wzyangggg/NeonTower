const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const H=require('../dist/hex-map.js');
const ctx={HexMap:H,SHOCK_COOLDOWN:35,tiles:H.initialFloor(),walkFloor:function(){return HexMap;},terrainProtected:()=>false,terrainHidden:()=>false,renderer:{}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('dist/electric-tiles.js','utf8'),ctx);
const E=ctx.ElectricTiles,key=c=>c.x+','+c.y;
function anchors(kind){return ctx.tiles.filter(t=>E.canPlace(kind,t));}
assert.equal(ctx.tiles.length,19);
assert.ok(ctx.tiles.every(t=>!t.medical&&!t.shieldTile),'initial floor is entirely blank');
assert.deepEqual([...new Set(ctx.tiles.map(t=>t.y))].sort((a,b)=>a-b).map(y=>ctx.tiles.filter(t=>t.y===y).length),[3,4,5,4,3]);
for(const [kind,size,interval,effect,legal]of [['apple',6,5,1,6],['banana',7,8,1,7],['grape',8,10,1,5],['watermelon',9,8,3,1]]){
 ctx.tiles=H.initialFloor();const def=E.fruits[kind];assert.equal(def.cells.length,size);assert.equal(def.interval,interval);assert.equal(def.heal||def.bonus,effect);assert.equal(anchors(kind).length,legal);
 for(const row of [-1,0,1]){
  ctx.tiles=[];for(let y=-5;y<=5;y++)for(let x=-6;x<=6;x++)ctx.tiles.push({x,y});
  const a={x:0,y:row},shape=E.shape(kind,a),occupied=new Set(shape.cells.map(key));
  assert.equal(occupied.size,size);
  const visited=new Set([key(shape.cells[0])]);let previous;
  do{previous=visited.size;for(const c of shape.cells)if(visited.has(key(c)))for(const [dx,dy]of H.neighbors(c.x,c.y))if(occupied.has(key({x:c.x+dx,y:c.y+dy})))visited.add(key({x:c.x+dx,y:c.y+dy}));}while(visited.size>previous);
  assert.equal(visited.size,size,'farm must be connected');
  const last=shape.cells.at(-1),t=ctx.tiles.find(t=>key(t)===key(last));t.trap={};assert.equal(E.place(kind,a),null);delete t.trap;
  const f=E.place(kind,a),old=ctx.tiles.filter(t=>t.electricFacility===f);assert.equal(old.length,size);
  assert.equal(E.move(f,{x:99,y:99}),false);assert.ok(old.every(t=>t.electricFacility===f));assert.ok(E.move(f,{x:-2,y:-2}));
  E.remove(ctx.tiles.find(t=>t.electricFacility===f&&key(t)!==key(f.anchor)).electricFacility);assert.ok(ctx.tiles.every(t=>!t.electricFacility));
 }
}
// A small farm and a large farm can have equal free area but different legal fits.
ctx.tiles=H.initialFloor();const options=anchors('tower');let blocked=0,compatible=0;
for(const a of options){const tower=E.place('tower',a);if(anchors('watermelon').length)compatible++;else{blocked++;assert.ok(ctx.tiles.filter(t=>!t.electricFacility&&!t.medical&&!t.shieldTile).length>=9);}E.remove(tower);}
assert.ok(blocked>0&&compatible>0,'tower arrangement changes whether the crescent fits');
// The moon field has a real gap that accepts a horizontal tower without overlap.
ctx.tiles=[];for(let y=-5;y<=5;y++)for(let x=-6;x<=6;x++)ctx.tiles.push({x,y});
const moon=E.place('watermelon',{x:0,y:0});assert.ok(moon);assert.ok(!moon.cells.some(c=>c.x===0&&c.y===0));assert.ok(E.place('tower',{x:0,y:0}));
console.log('Farms: unchanged 19-cell initial floor, 6/7/8/9-cell connected shapes, exact compensation values, 6/7/5/1 legal starts, parity/occupancy/move/remove and tower interlocking passed.');

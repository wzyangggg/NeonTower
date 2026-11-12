const fs=require('node:fs'),vm=require('node:vm');
const elements={};const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);if(process.argv.includes('--hex'))vm.runInContext(fs.readFileSync('dist/hex-map.js','utf8')+'\n'+fs.readFileSync('dist/terrain-generators.js','utf8'),sandbox);for(const file of ['music','renderer','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss']){let code=fs.readFileSync('dist/'+file+'.js','utf8');if(file==='game'&&process.argv.includes('--hex'))code=require('../dist/hex-map.js').transform(code);vm.runInContext(code,sandbox);}
vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
reset();p.inv=999;shootTimer=999;const bridge=bridgeRoom,geometry=JSON.stringify(bridge.cells),angle=bridge.angle;
check(bridge.persistent&&PERSISTENT_BRIDGE_ANGLES.includes(angle),'persistent bridge uses an allowed angle');
check(bridgeReady()&&bridge.cells.length===24&&bridge.ends.length===1,'one offscreen immediately ready entry bridge');
check(bridge.cells.some(c=>c.x<grid.minX||c.x>grid.maxX||c.y<grid.minY||c.y>grid.maxY),'enemy bridge extends outside fixed buildable map');
for(let n=1;n<=10;n++){floor=n;beginDescent();check(bridgeRoom===bridge&&JSON.stringify(bridge.cells)===geometry,'same bridge geometry across floor '+n);}
floor=11;beginDescent();check(bridgeRoom!==bridge&&bridgeRoom.segment===1,'new ten-floor segment gets a new bridge');
reset();floor=1;startWave();if(timedRoom?.introLeft)step(1.5);p.inv=999;shootTimer=999;check(enemies.length===5&&enemies.some(e=>e.bridgeRoller)&&enemies.some(e=>!isMeleeEnemy(e)),'mixed normal opening with bridge melee');
const at=bridgeCellCenter(bridgeRoom.cells[0]);check(!floorPoint(at.x,at.y)&&!canWalkAt(at.x,at.y,7),'bridge stays enemy-only');
check(spawnQueue.filter(e=>['crawler','bomber'].includes(e.type)).every(e=>e.bridgeRoller),'finite roster routes melee over the bridge');
const count=tiles.length,total=stageResultStats().total,original=bridgeRoom;
const e=enemies.find(e=>e.bridgeRoller);enemies=[e];const start={x:e.x,y:e.y};paused=false;state='combat';let entered=false;
for(let i=0;i<1200;i++){updateChaser(e,.1);if(typeof HexMap!=='undefined')check(HexMap.canStand(bridgeRoom.surface,e.x,e.y,6.99),'melee remains supported');if(!e.bridgeApproach){entered=true;break;}}
check(entered&&Math.hypot(e.x-start.x,e.y-start.y)>50&&floorPoint(e.x,e.y),'melee crosses persistent bridge onto an island');
p.frameStartX=p.x;p.frameStartY=p.y;e.x=p.x;e.y=p.y;p.inv=0;const hp=p.hp;updateChaser(e,.01);check(p.hp===hp-1,'bridge melee retains contact damage');p.inv=999;
check(tiles.length===count&&stageResultStats().total===total,'bridge never creates player/build tiles or changes planned enemy count');
const near=bridgeRoom.cells.at(-1);tiles.push({...near,healProgress:0,healFlash:0,medPack:false});syncBridgeRoom();check(!bridgeRoom.cells.some(c=>c.x===near.x&&c.y===near.y),'permanent blank consumes overlapping bridge');
check(bridgeRoom.surface.some(c=>c.x===near.x&&c.y===near.y)&&bridgeRoom===original,'conversion keeps route supported and bridge identity');
floor=2;beginDescent();check(bridgeRoom===original&&!bridgeRoom.cells.some(c=>c.x===near.x&&c.y===near.y),'converted bridge never returns next floor');
clearBridgeRoom();check(bridgeRoom===original,'room transitions do not destroy persistent bridge');
draw();check(renderer.data.slice(0,renderer.count).every(Number.isFinite),'finite bridge prism and melee meshes');
renderer.begin();drawResidentEnemy(e,e.x-325,(e.y-300)*1.06,0);
check(renderer.residentMeshes.get('crawler-spider:foot').count===4&&renderer.residentMeshes.get('crawler-spider:joint').count===8,'spider has exactly four articulated legs');
const spiderMesh=renderer.residentMeshes.get('crawler-spider:body').data,meshCount=renderer.residentMeshes.size;
e.roll=2;renderer.begin();drawResidentEnemy(e,e.x-325,(e.y-300)*1.06,0);
check(renderer.residentMeshes.get('crawler-spider:body').data===spiderMesh&&renderer.residentMeshes.size===meshCount,'walking updates poses without rebuilding shared geometry');
check(renderer.residentSnapshot().every(Number.isFinite),'finite articulated spider geometry');
const reference=bridgeRoom;reset();check(bridgeRoom!==reference&&bridgeRoom.fromFloor===1,'new run resets bridge');
enemies=[];p.x=bridgeRoom.ends[0].entry.x;p.y=bridgeRoom.ends[0].entry.y;
for(let i=0;i<3;i++)check(spawnBridgeRoller({type:'crawler'}),'short bridge admits full melee opening when player guards landing');
check(enemies.every((a,i)=>enemies.slice(i+1).every(b=>Math.hypot(a.x-b.x,a.y-b.y)>=32-1e-7)),'short bridge spawn slots preserve spacing');
if(typeof HexMap!=='undefined'){
 const seen=new Set();for(let i=0;i<40;i++){tiles=HexMap.campaignFloor('bridge-heading-'+i);floor=1;clearBridgeRoom(true);startBridgeRoom();check(bridgeRoom.cells.length===24&&bridgeRoom.cells.some(c=>c.x<grid.minX||c.x>grid.maxX||c.y<grid.minY||c.y>grid.maxY),'seeded bridge extends outside map');seen.add(bridgeRoom.angle);const entry=bridgeRoom.ends[0].entry,start=bridgeRoom.ends[0].start,angle=(Math.atan2(start.y-entry.y,start.x-entry.x)*180/Math.PI+360)%360;check(Math.abs(angle-bridgeRoom.angle)<1e-7,'exact hex heading');check(HexMap.campaignMap.rhythm.islands.some(island=>island.cells.some(c=>c.x===bridgeRoom.target.x&&c.y===bridgeRoom.target.y)),'entry attaches to a real island');}
 check(seen.size===4&&[60,120,240,300].every(a=>seen.has(a)),'all four diagonal headings are reachable');
}
console.log('Persistent bridge: ten-floor identity, allowed headings, new segment/reset, finite mixed melee waves, island traversal/contact, permanent replacement and finite rendering passed.');
}`,sandbox);
if(process.argv.includes('--hex')){
 sandbox.location={search:''};
 sandbox.URLSearchParams=URLSearchParams;
 vm.runInContext(fs.readFileSync('dist/room-lab.js','utf8'),sandbox);
 vm.runInContext(`{
  for(const index of [1,3,1,3]){
   RoomLab.start(index);
   if(!bridgeRoom||!tiles.some(c=>c.x===bridgeRoom.target.x&&c.y===bridgeRoom.target.y)){
    throw Error('Room Lab bridge must land on the selected room floor');
   }
   const {x,y}=bridgeRoom.target;
   if(!HexMap.neighbors(x,y).some(([dx,dy])=>bridgeRoom.cells.some(c=>c.x===x+dx&&c.y===y+dy))){
    throw Error('Room Lab bridge must touch its landing tile');
   }
  }
  console.log('Room Lab: both bridge rooms connect to the selected floor on start and restart.');
  sound=false;
  enemies=[];
  if(!spawnBridgeRoller({type:'virusElite'}))throw Error('Elite virus failed to spawn on the bridge');
  const virus=enemies[0];
  bullets=[];
  updateBridgeVirus(virus,2);
  if(bullets.length)throw Error('Elite virus fired before landing');
  for(let i=0;i<1200&&virus.bridgeApproach;i++)updateBridgeRoller(virus,1/30);
  if(virus.bridgeApproach)throw Error('Elite virus failed to reach the floor');
  updateBridgeVirus(virus,.65);
  if(!virus.warn||bullets.length)throw Error('Elite virus did not telegraph its shot');
  updateBridgeVirus(virus,.6);
  if(bullets.length!==5)throw Error('Elite virus did not fire a five-shot fan');
  virus.hp=virus.max/2;
  const remaining=virus.hp;
  updateBridgeVirus(virus,.01);
  if(enemies.length!==2||enemies.reduce((sum,e)=>sum+e.hp,0)!==remaining)throw Error('Elite virus split must conserve remaining HP');
  for(const body of enemies.slice()){body.hp=body.max/2;updateBridgeVirus(body,.01);}
  if(enemies.length!==2)throw Error('Elite virus offspring must not split again');
  console.log('Room Lab: elite virus crosses the bridge, telegraphs and fires on land, and splits once.');
 }`,sandbox);
}

const fs=require('node:fs'),vm=require('node:vm');
const elements={};const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/hex-map.js','utf8'),sandbox);for(const file of ['music','renderer','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss'])vm.runInContext(file==='game'?require('../dist/hex-map.js').transform(fs.readFileSync('dist/game.js','utf8')):fs.readFileSync('dist/'+file+'.js','utf8'),sandbox);
vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
function setup(){reset();state='combat';floor=17;timedRoom={remaining:45,nextWaveAt:999};spawnQueue=[];chaserTimer=999;shootTimer=999;enemies=[];enemyTransports=[];p.inv=999;}
for(const side of [-1,1])for(const entryZ of [-100,100]){
 const f={x:325,y:300,side,entryZ,age:0},start=transportPose(f);let previous=start;
 for(let i=1;i<=312;i++){f.age=i/60;const at=transportPose(f),dx=at.x-previous.x,dz=at.z-previous.z;check(Math.hypot(dx,dz)<2.5,'slow continuous approach');if(i<312)check(dx*Math.sin(at.yaw)+dz*Math.cos(at.yaw)>0,'nose faces destination');previous=at;}
 check(Math.hypot(previous.x,previous.z)<.001,'exact hover destination');check(previous.height===start.height,'no arrival descent');check(TRANSPORT_FLIGHT.scale===.55,'compact aircraft');
 f.age=start.land+.01;check(transportPose(f).x===0,'hover during release');f.age=start.leave+.5;const exit=transportPose(f);check(exit.x*Math.sin(exit.yaw)+exit.z*Math.cos(exit.yaw)>0,'departure follows nose');
}
for(const type of ['crawler','bomber','ironball','ricochet','missile','laser','twinGun','lobber','stormCaller']){
 setup();check(spawn({type,side:0}),'ground spawn '+type);const mob=enemies[0];check(mob.transport&&!isAttackable(mob),'cargo excluded '+type);check(HexMap.canStand(tiles,mob.transport.x,mob.transport.y,mob.r),'safe landing '+type);
 check(HexMap.outline(tiles).edges.some(edge=>{const dx=edge.bx-edge.ax,dy=edge.by-edge.ay,u=Math.max(0,Math.min(1,((mob.transport.x-edge.ax)*dx+(mob.transport.y-edge.ay)*dy)/(dx*dx+dy*dy)));return Math.hypot(mob.transport.x-edge.ax-dx*u,mob.transport.y-edge.ay-dy*u)<=mob.r+2.01;}),'outer hex boundary only '+type);
 const fire=mob.fire;step(.1);check(mob.t===0&&mob.fire===fire,'cargo frozen');paused=true;const age=mob.transport.age;step(1);check(mob.transport.age===age,'pause freezes flight');paused=false;
 for(let i=0;i<52;i++)step(.1);check(!mob.transport&&isAttackable(mob),'instant arrival '+type);
 shootTimer=999;for(let i=0;i<90;i++){step(.016);if(mob.hp>0)check(HexMap.canStand(tiles,mob.x,mob.y,mob.r),'ground stays supported '+type);}
}
for(const type of ['eye','skull','moth','spitter','suicideDrone']){setup();check(spawn({type,side:0}),'air spawn');check(!enemies[0].transport&&isAttackable(enemies[0]),'air unchanged '+type);}
setup();tiles=[];check(spawn({type:'crawler',side:0})===false&&!enemies.length,'no ground retries');
// Transport rendering bypasses ordinary enemy rendering, so it must supply its own health bar.
const originalHealthBar=drawMonsterHealthBar,transportBars=[];
drawMonsterHealthBar=(...args)=>{transportBars.push(args);originalHealthBar(...args);};
for(const type of ['crawler','bomber','ironball','ricochet','missile','laser','twinGun','lobber','stormCaller','goldSpider']){
 setup();spawn({type,side:0});const mob=enemies[0],flight=mob.transport;flight.age=4.8;updateEnemyTransports(0);mob.hp=mob.max/2;transportBars.length=0;draw();
 const bar=transportBars[0],pose=transportPose(flight);check(transportBars.length===1&&bar[0]===pose.x&&bar[1]===pose.height+34&&bar[2]===pose.z,'one bar above carrier '+type);check(bar[3]===mob.hp&&bar[4]===mob.max,'actual damaged transport health '+type);
 updateEnemyTransports(.5);transportBars.length=0;draw();check(transportBars.length===1&&transportBars[0][1]<100,'arrival restores only ground bar '+type);
 enemies=[];transportBars.length=0;draw();check(!transportBars.length,'empty departing carrier has no bar '+type);
}
setup();spawn({type:'crawler',side:0});const doomed=enemies[0];doomed.hp=0;shatter(doomed);transportBars.length=0;draw();check(!transportBars.length,'destroyed transport has no bar');drawMonsterHealthBar=originalHealthBar;
setup();spawn({type:'crawler',side:0});const arriving=enemies[0],arrival=arriving.transport;arrival.age=5.19;updateEnemyTransports(.005);check(arriving.transport&&transportPose(arrival).height===134,'suspended until destination');arriving.hp-=1;updateEnemyTransports(.006);check(!arriving.transport&&arriving.x===arrival.x&&arriving.y===arrival.y&&arriving.hp===arrival.cargoHealth,'immediate full-health ground spawn');
setup();spawn({type:'crawler',side:0});const intercepted=enemies[0],flight=intercepted.transport;flight.age=4.8;updateEnemyTransports(0);check(isAttackable(intercepted)&&combatTargets().includes(intercepted),'incoming drone can be targeted');shots=[{x:intercepted.x,y:intercepted.y,vx:0,vy:0,life:1,damage:9999,pierce:1,hitRadius:30,critChance:0}];step(.001);check(flight.destroyed&&intercepted.hp<=0&&!enemies.includes(intercepted),'actual shot intercepts cargo and carrier');updateEnemyTransports(10);check(!enemyTransports.includes(flight),'intercepted monster never deploys');
setup();floor=7;startGreedRoom();finishBossIntro();const gold=enemies.find(e=>e.transport&&!e.transport.waiting);gold.hp=0;shatter(gold);const paid=greedRoom.earned;shatter(gold);check(gold.transport.destroyed&&greedRoom.killed===1&&paid===greedRoom.reward&&greedRoom.earned===paid,'gold spider interception cancels arrival and rewards once');
setup();tiles=[];for(let y=-3;y<=3;y++)for(let x=-3;x<=3;x++)tiles.push({x,y});check(spawn({type:'ironball',side:0}),'expanded landing');check(HexMap.canStand(tiles,enemies[0].transport.x,enemies[0].transport.y,30),'expanded ball support');
setup();spawn({type:'crawler',side:0});const blocked=enemies[0],cell=HexMap.cellAt(blocked.transport.x,blocked.transport.y),tile=tiles.find(t=>t.x===cell.x&&t.y===cell.y);tile.coverTile=true;tile.coverHp=4;updateEnemyTransports(6.1);check(blocked.hp>0&&blocked.transport?.waiting,'changed cover retries arrival');
setup();floor=7;startGreedRoom();check(enemies.length===GREED_COUNT&&enemies.every(e=>e.transport),'all treasure spiders arrive as cargo');for(const f of enemyTransports)f.age=1.4;draw();check(renderer.residentMeshes.get('gold-spider-body')?.count>0&&renderer.residentMeshes.get('gold-spider-foot')?.count>0,'actual suspended spider body and legs');finishBossIntro();for(let i=0;i<50;i++){shootTimer=999;step(.1);for(const e of enemies)if(!e.transport)check(HexMap.canStand(tiles,e.x,e.y,e.r),'treasure spider stays supported');}
setup();spawn({type:'twinGun',side:0});check(normalRangedCount()===1&&enemies.some(e=>e.hp>0),'cargo reserves population');finishTimedRoom();check(enemyTransports.length===0&&enemies.length===0,'timed finish clears cargo');
setup();spawn({type:'crawler',side:0});draw();const hull=renderer.residentMeshes.get('enemy-transport:hull');check(hull&&hull.data.every(Number.isFinite),'finite resident aircraft');const carried=renderer.residentMeshes.get('enemy:crawler:14:false');check(carried.count>0&&carried.instances[7]>40,'actual monster suspended below aircraft');for(let i=0;i<20;i++){time+=.016;draw();}check(renderer.residentMeshes.get('enemy-transport:hull').data===hull.data,'resident aircraft reused');
beginDescent();check(enemyTransports.length===0,'floor cleanup');setup();spawn({type:'crawler',side:0});reset();check(enemyTransports.length===0,'reset cleanup');
} `,sandbox);
console.log('Ground transport: nine ground types, five unchanged air types, safe boundary spawn, interception, instant arrival, no descent, gold reward once, pause, floor movement, retries, resident meshes and cleanup passed.');


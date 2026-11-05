const fs=require('node:fs'),vm=require('node:vm');
const elements={};const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/hex-map.js','utf8')+'\n'+fs.readFileSync('dist/terrain-generators.js','utf8'),sandbox);for(const file of ['music','renderer','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss'])vm.runInContext(file==='game'?require('../dist/hex-map.js').transform(fs.readFileSync('dist/game.js','utf8')):fs.readFileSync('dist/'+file+'.js','utf8'),sandbox);
vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
function setup(f=13){reset();floor=f;startWave();if(timedRoom?.introLeft)step(1.5);p.inv=999;shootTimer=999;turrets=[];}
check(!GROUND_ENEMIES.enabled,'ground enemies paused by default');
reset();p.x=300;p.y=100;bullets=[];fire({type:'spitter',x:100,y:100});
check(bullets.length===2&&bullets.every(b=>b.x===123)&&Math.abs(bullets[0].y-bullets[1].y)===62,'both visible pulse pods fire together');
check(bullets.every(b=>b.vx===STARTER_ENEMIES.spitter.bulletSpeed&&b.vy===0),'starter pair stays slow and parallel');
const airTypes=new Set(['spitter','eye','skull','moth','pursuitDrone','fighter','laser','stealthDrone']),seenAir=new Set();
for(let f=1;f<=33;f++){
 setup(f);
 if(f%11===0){check(state==='bossIntro'&&campaignBoss>0,'boss floor retained '+f);continue;}
 if(isDrinkFloor(f)){check(state==='drinkArrival','drink stop retained '+f);continue;}
 if(isRailFloor()){check(railRoom&&state==='survival'&&railRoom.tracks.length===6,'rail survival retained '+f);continue;}
 if(isSawFloor()){check(sawRoom&&enemies.length===0&&sawRoom.sources.length===Math.ceil(tiles.length/10),'saw corridor retained '+f);continue;}
 check(timedRoom&&!builderRoom&&enemies.length===5,'ordinary aerial opening including former builder floors '+f);
 const roster=[...enemies,...spawnQueue];check(roster.length===normalRoomRosterSize(),'full finite aerial roster '+f);
 for(const e of roster){if(e.bridgeRoller){check(bridgeRoom&&['crawler','bomber','ironball'].includes(e.type),'persistent bridge melee '+f);continue;}check(airTypes.has(e.type)&&campaignEnemyEnabled(e.type)&&!e.transport,'air only '+f+'/'+e.type);seenAir.add(e.type);if(e.type==='pursuitDrone')check(f>=1,'air contact available from first floor');}
 const queued=spawnQueue.length;enemies=[];p.x=A.x-10000;p.y=A.y-10000;if(bridgeRoom)updateBridgeRoom(3);timedRoom.emptyTime=.35;updateTimedRoomSpawns(0);check(enemies.length===5&&spawnQueue.length===queued-5,'next full aerial wave '+f);
 finishTimedRoom();check(state==='stageClear'&&!enemies.length&&!spawnQueue.length,'aerial room completes '+f);
}
check([...airTypes].filter(t=>t!=='pursuitDrone').every(t=>seenAir.has(t)),'all ranged aircraft remain available beside bridge melee');
setup(1);check(normalRangedLimit()===5,'early ranged cap');const opening=enemies.length;step(3);check(normalThreat()<=normalThreatLimit()&&normalRangedCount()<=normalRangedLimit(),'early mixed waves and independent bridge stream stay bounded');
setup(13);timedRoom=null;spawnQueue=[{type:'eye',side:0}];enemies=[];chaserTimer=0;chaserSpawned=0;updateChaserSpawns(99);drinkBottles=[{id:'hive',done:true,left:0}];addHiveChasers();check(!enemies.length,'legacy and hive chasers cannot reintroduce ground enemies');
console.log('Default aerial roster: all 33 floors, five air types, former builder floors, unlock, wave caps, completion, boss/drink branches and ground chaser exclusion passed.');
// Difficulty progression uses the aircraft models while ground enemies remain disabled.
for(let f=1;f<=10;f++){
 reset();floor=f;timedRoom={duration:45,remaining:45};const roster=buildNormalRoster();
 if(f<=3){check(roster.every(e=>['spitter','pursuitDrone'].includes(e.type)),'opening single shots '+f);bullets=[];fire({type:'spitter',x:100,y:100});check(Math.abs(Math.hypot(bullets[0].vx,bullets[0].vy)-85*1.25)<1e-8,'starter bullet speed +25% '+f);}
 if(f>=4&&f<=6){check(roster.some(e=>e.type==='eye')&&roster.every(e=>['spitter','eye','pursuitDrone'].includes(e.type)),'single and double only '+f);if(isSawFloor())continue;setup(f);check(normalRangedLimit()===5,'transition cap '+f);const queued=spawnQueue.length;for(let i=0;i<30;i++)for(const e of enemies)if(e.bridgeRoller)updateChaser(e,.1);timedRoom.remaining-=3;updateTimedRoomSpawns(3);check(normalRangedCount()<=5&&spawnQueue.length<queued&&normalThreat()<=normalThreatLimit(),'mixed transition wave respects ranged cap '+f);enemies=[];timedRoom.emptyTime=.35;updateTimedRoomSpawns(0);check(enemies.length===5&&spawnQueue.length<queued-5,'transition full wave resumes '+f);}
 if(f<8)check(!roster.some(e=>e.type==='skull'),'no early radial '+f);
 if(f<10)check(!roster.some(e=>e.type==='moth'),'no early fan '+f);
 if(f>=8){check(roster.some(e=>e.type==='skull'),'radial unlock '+f);for(let i=0;i<roster.length;i+=5)check(roster.slice(i,i+5).filter(e=>e.type==='skull').length<=1,'sparse radial batch '+f);}
}
setup(4);enemies=[];spawnQueue=[];bullets=[];spawn({type:'eye',side:0});const aircraft=enemies[0];aircraft.fire=999;fire(aircraft);check(bullets.length===1&&aircraft.twinPending,'aircraft first shot');step(.21);check(bullets.length===1,'aircraft second shot waits');paused=true;step(1);check(bullets.length===1,'aircraft pair pause');paused=false;step(.02);check(bullets.length===2&&!aircraft.twinPending,'aircraft second shot');
aircraft.fire=0;step(.01);check(Math.abs(aircraft.fire-2.1)<1e-8,'double aircraft cooldown');const originalBarrel=fireTwinBarrel;let deadShots=0;fireTwinBarrel=(...args)=>{deadShots++;originalBarrel(...args);};aircraft.hp=0;step(.3);check(deadShots===0,'dead aircraft cancels pending second shot');fireTwinBarrel=originalBarrel;
console.log('Opening +25% bullet speed, B04–06 cap, aircraft double shots, pause/death cancellation and delayed sparse radial/fan unlocks passed.');
// Total population cap, partial refills, immutable room totals and safe contact drones.
for(const f of [1,5,8,13,23]){
 setup(f);const total=normalRoomRosterSize(),cap=normalThreatLimit();
 check(stageResultStats().total===total,'planned total exists before all enemies enter '+f);
 p.x=A.x-10000;p.y=A.y-10000;
 for(let i=0;i<30;i++)spawnNormalWave();
 check(normalThreat()<=cap,'all scheduled waves respect total cap '+f);
 const q=spawnQueue.length,live=normalAliveCount();spawnNormalWave();
 check(spawnQueue.length===q&&normalAliveCount()===live,'blocked wave retains queue '+f);
 check(stageResultStats().total===total,'waiting never changes denominator '+f);
 finishTimedRoom();check(stageResultStats().total===total&&stageResultStats().ratio===0,'timeout includes unspawned enemies '+f);
}
setup(8);enemies=[];spawnQueue=Array.from({length:30},()=>({type:'pursuitDrone',side:0}));
while(spawnNormalWave()){}const lightCount=normalAliveCount();
check(lightCount===24&&normalThreat()===18,'light enemies share eighteen threat budget');
check(!spawn({type:'spitter',side:0}),'direct entry cannot exceed threat budget');
enemies=[];resetStageStats();stageStats.plannedTotal=30;spawnQueue=Array.from({length:30},()=>({type:'skull',side:0}));
while(spawnNormalWave()){}check(normalAliveCount()===4&&normalThreat()===16&&normalAliveCount()<lightCount,'heavy enemies occupy more budget at same floor');
const fixedTotal=stageResultStats().total,queued=spawnQueue.length;
const killed=enemies[0];killed.hp=0;recordStageKill(killed);enemies=enemies.filter(e=>e.hp>0);
check(spawnNormalWave()===1&&normalThreat()===16&&spawnQueue.length===queued-1,'one heavy death frees exactly one heavy entry');
check(stageResultStats().total===fixedTotal&&stageResultStats().defeated===1,'threat refill preserves fixed total and kills');
for(const type of [...Object.keys(STARTER_ENEMIES),...Object.keys(ADDED_ENEMIES),'eye','skull','moth','boss'])check(Number.isFinite(ENEMY_PRESSURE[type])&&enemyThreat({type})>0,'explicit threat coefficient '+type);
check(enemyThreat({type:'futureEnemy'})===2,'unknown enemy has nonzero fallback');
setup(8);enemies=[{type:'skull',hp:0},{type:'spitter',hp:10,transport:{waiting:true}}];
check(normalThreat()===2,'dead enemies free budget and incoming cargo reserves threat');
campaignBoss=1;check(normalThreatLimit()===Infinity,'boss rooms keep their independent encounter rules');

setup(1);const chasing=enemies.find(e=>e.type==='crawler');
check(chasing&&STARTER_ENEMIES.crawler.speed===108.16&&enemies.filter(e=>e.bridgeRoller).length===3,'three faster bridge spiders from floor one');
chasing.bridgeRoller=false;
enemies=[chasing];spawnQueue=[];timedRoom.nextWaveAt=999;bullets=[];shots=[];
chasing.x=p.x+80;chasing.y=p.y;const distance=Math.hypot(chasing.x-p.x,chasing.y-p.y);step(.1);
check(Math.hypot(chasing.x-p.x,chasing.y-p.y)<distance&&!bullets.length,'pursuit closes distance without shooting');
chasing.x=p.x+1;chasing.y=p.y;p.inv=0;const hp=p.hp;step(.01);
check(p.hp<hp&&chasing.hp>0&&!chasing.selfDetonated&&!bullets.length,'contact hurts but never self destructs');
chasing.hp=0;shatter(chasing);check(!bullets.length&&!chasing.deathBurst,'death has no radial burst');
draw();check(renderer.residentMeshes.has('crawler-spider:body')&&renderer.residentMeshes.has('crawler-spider:foot'),'spider uses resident body and articulated feet');
setup(1);drinkBottles=[{id:'hive',done:true,left:0}];enemies=[];startWave();const hiveTotal=stageResultStats().total;
check(hiveTotal===90,'hive budget fixed at room entry');
while(spawnQueue.length){enemies=[];check(spawnNormalWave()>0,'finite hive entries');}
check(stageResultStats().total===hiveTotal,'hive spawning never grows planned budget');
setup(1);for(const e of enemies){e.hp=0;recordStageKill(e);}enemies=[];finishTimedRoom();
check(stageResultStats().total===60&&stageResultStats().defeated===5&&stageResultStats().ratio===8,'five kills out of fixed sixty despite fifty-five unspawned');
console.log('Chapter threat budgets, weighted refills, fixed settlement denominator, finite hive budget and non-exploding pursuit passed.');
// Isolate the original mixed-wave scheduler; independent bridge pressure has its own regression.
const activeBridgeReinforcements=updateBridgeReinforcements;updateBridgeReinforcements=()=>{};
// Preserve the dormant mixed-wave behavior for a future re-enable.
GROUND_ENEMIES.enabled=true;
for(const f of [1,2,3,13,23]){
 setup(f);check(enemies.length===5&&spawnQueue.length===normalRoomRosterSize()-5,'five opening entrants '+f);
 check(enemies.filter(isMeleeEnemy).length===3&&normalRangedCount()===2,'mixed wave '+f);
 const queued=spawnQueue.length;for(let i=0;i<60;i++)for(const e of enemies)if(e.bridgeRoller)updateChaser(e,.1);timedRoom.remaining-=normalSpawnInterval();updateTimedRoomSpawns(normalSpawnInterval());
 if(f<=3){check(enemies.length===5&&spawnQueue.length===queued,'wait for whole wave at ranged cap');enemies.find(e=>!isMeleeEnemy(e)).hp=0;updateTimedRoomSpawns(.01);check(enemies.length===10&&spawnQueue.length===queued-5,'release five together once capacity available');}
 else check(enemies.length>5&&enemies.length<=10&&spawnQueue.length===queued-(enemies.length-5)&&normalThreat()<=normalThreatLimit(),'scheduled entrants fit threat budget');
 enemies=[];enemyTransports=[];const before=spawnQueue.length;timedRoom.emptyTime=0;updateTimedRoomSpawns(.34);check(!enemies.length,'short clear gap');updateTimedRoomSpawns(.01);check(enemies.length===5&&spawnQueue.length===before-5,'fast clear releases full wave');
}
for(const type of ['spitter','eye','skull','moth','missile','twinGun','lobber','stormCaller','laser']){
 setup();enemies=[];enemyTransports=[];spawnQueue=[];spawn({type,side:0});const mob=enemies[0];
 if(mob.transport){updateEnemyTransports(TRANSPORT_FLIGHT.approach+.01);check(!mob.transport,'cargo deployed '+type);}
 const originalFire=fire;let fired=0;fire=e=>{if(e===mob)fired++;originalFire(e)};
 for(let i=0;i<20;i++)step(.01);check(!fired&&mob.laserMode!=='firing','no instant opening '+type);
 for(let i=0;i<40;i++)step(.01);
 if(type==='laser'){check(mob.laserMode==='warning','eye retains full charge warning');for(let i=0;i<45;i++)step(.01);check(mob.laserMode==='firing','laser opens after visible warning');}
 else {check(fired===1,'one fast opening '+type);check(mob.fire>.5,'normal cooldown resumes '+type);}
 fire=originalFire;
}
setup(1);const beforeEnemies=enemies.length,beforeQueue=spawnQueue.length;togglePause();step(5);check(enemies.length===beforeEnemies&&spawnQueue.length===beforeQueue,'pause freezes waves');togglePause();
setup(13);for(let i=0;i<60;i++)for(const e of enemies)if(e.bridgeRoller)updateChaser(e,.1);const oldSpawn=spawn;let calls=0;spawn=e=>++calls===3?false:oldSpawn(e);timedRoom.remaining-=4;const q=spawnQueue.length,n=enemies.length,t=enemyTransports.length;updateTimedRoomSpawns(4);check(enemies.length===n&&enemyTransports.length===t&&spawnQueue.length===q,'failed landing does not split wave');spawn=oldSpawn;updateTimedRoomSpawns(.01);check(enemies.length>n&&enemies.length<=n+5&&spawnQueue.length===q-(enemies.length-n)&&normalThreat()<=normalThreatLimit(),'reserved wave retries within threat budget');
setup(1);drinkBottles=[{id:'hive',done:true,left:0}];enemies=[];enemyTransports=[];let rounds=0;while(spawnQueue.length&&rounds++<30){timedRoom.emptyTime=.35;updateTimedRoomSpawns(0);enemies=[];enemyTransports=[];}check(!spawnQueue.length&&rounds<30,'hive reinforcements remain finite and drain');
console.log('Five-enemy waves, cap reservation, accelerated full waves, atomic landing retry, hive, pause and nine ranged openings passed (hex runtime).');
}`,sandbox);

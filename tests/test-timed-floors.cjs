const fs=require('node:fs'),vm=require('node:vm');
const elements={};const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);for(const file of ['music','renderer','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss'])vm.runInContext(fs.readFileSync('dist/'+file+'.js','utf8'),sandbox);
vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
function near(a,b,m){check(Math.abs(a-b)<1e-7,m+': '+a+' / '+b)}
function setup(f=6){reset();floor=f;startWave();if(state==='bossIntro')finishBossIntro();p.inv=999;shootTimer=999;turrets=[];}
function cashTile(ready=false){const t={x:0,y:0,cashTile:true,healProgress:ready?HEAL_TIME:0,healFlash:0,medPack:ready};tiles=[t];p.x=325;p.y=300;return t;}
function advance(seconds){for(let i=0;i<Math.round(seconds*100);i++)step(.01);}
// Chapter deadlines and a 60/40 finite roster; early rooms cap only ranged threats.
for(const [f,duration,total] of [[1,30,20],[2,30,20],[3,30,20],[10,30,20],[13,45,30],[23,60,40]]){
 setup(f);check(timedRoom.remaining===duration&&enemies.length===2,'chapter deadline/two entrants '+f);
 const roster=[...enemies,...spawnQueue];check(roster.length===total&&roster.filter(e=>isMeleeEnemy(e)).length===total*.6,'sixty percent contact roster '+f);
 check(enemies.filter(e=>isMeleeEnemy(e)).length===1&&normalRangedCount()===1,'mixed opening even on floor one '+f);
 // Observe spawning without contact detonations removing live entrants.
 p.x=A.x-10000;p.y=A.y-10000;
 const interval=normalSpawnInterval();advance(interval-.01);check(enemies.length===2,'gradual opening '+f);step(.01);check(enemies.length===5,'scheduled entry respects early cap '+f);
 advance(interval);check(enemies.length===8,'early cap persists across batches '+f);
 advance(duration-2*interval-.01);check(state==='combat'&&enemies.some(e=>e.hp>0),'survivors remain until deadline '+f);
 const alive=enemies.filter(e=>e.hp>0).length;particles=[];step(.01);
 check(state==='stageClear'&&!enemies.length&&!spawnQueue.length&&!missiles.length&&kills===0&&cash===0,'survive without kill rewards '+f);
 check(particles.some(q=>q.chunk)&&alive>0,'deadline creates death fragments '+f);
}
for(const f of [1,2,3]){
 setup(f);near(normalEnemyHealth(),5+f*1.1,'early ranged health');near(normalMeleeHealth(),3+f*.6,'early melee health');
 step(3);check(enemies.length===5,'melee does not occupy ranged slots');step(3);check(normalRangedCount()===3,'ranged cap reached');
 spawnQueue=[{type:'eye',side:0},{type:'bomber',side:1},{type:'bomber',side:2}];
 const melee=enemies.filter(e=>e.hp>0&&isMeleeEnemy(e)).length;spawnGroup();
 check(normalRangedCount()===3&&enemies.filter(e=>e.hp>0&&isMeleeEnemy(e)).length===melee+2,'melee bypasses blocked ranged queue');
 check(spawnQueue.length===1&&spawnQueue[0].type==='eye','blocked ranged stays queued');
 enemies.find(e=>!isMeleeEnemy(e)).hp=0;spawnGroup();check(normalRangedCount()===3&&!spawnQueue.length,'ranged kill opens a ranged slot');
}
setup(2);check(Math.ceil(normalEnemyHealth()/weapon.damage)===8&&Math.ceil(normalMeleeHealth()/weapon.damage)===5,'B02 starter eight ranged / five melee shots');
setup(5);near(normalEnemyHealth(),(5+5*1.1)*1.6,'later ranged health unchanged');near(normalMeleeHealth(),(3+5*.6)*1.5,'later melee health unchanged');
setup();step(30);step(stageClearLeft);check(state==='upgrade','deadline runs settlement and shop');
// Queued enemies cannot be skipped. Fast output still completes the finite pool early.
setup(1);const initialQueue=spawnQueue.length;enemies=[];advance(.34);check(!enemies.length&&spawnQueue.length===initialQueue&&state==='combat','short gap does not end floor');step(.01);
check(enemies.length===3&&spawnQueue.length===initialQueue-3,'fast clear accelerates a mixed three-enemy batch');
let accelerated=0;while(pendingNormalSpawns()){enemies=[];advance(.35);accelerated++;check(accelerated<25,'finite reinforcement pool');}
enemies=[];missiles=[];step(.01);check(state==='stageClear'&&timedRoom.remaining>20,'strong output can exhaust room early');
check(stageSettlement.wait===0&&$('stage-clear').style.display==='flex','early clear ends immediately');step(1);check(state==='stageClear','two second ending hold');
setup(3);enemies=[];spawnQueue=[];missiles=[];step(.01);check(state==='stageClear'&&chaserSpawned===0,'future chasers cannot keep exhausted room alive');
setup();enemies=[];spawnQueue=[];missiles=[{type:'rocket',hp:3,life:10,x:500,y:300,vx:0,vy:0,r:10}];step(.01);check(state==='combat','live missile prevents early clear');
missiles=[];step(.01);check(state==='stageClear','missile removal allows clear');
// Real clock, pause and a clamped large step, isolated from supply-cycle completion.
setup();timedRoom.duration=timedRoom.remaining=12;const t=cashTile();equipItem('armor',createArmor('chrono'));enemies=[{type:'eye',x:500,y:300,homeX:500,homeY:300,hp:999,max:999,r:14,t:0,fire:999,seed:0}];
step(1);near(timedRoom.remaining,11,'deadline uses real game seconds');near(t.healProgress,4,'production shares clock');
togglePause();step(50);near(timedRoom.remaining,11,'pause freezes deadline');near(t.healProgress,4,'pause freezes money');togglePause();
step(100);check(state==='stageClear','large step stops at deadline');near(t.healProgress,supplyTime(t),'production clamped at full storage');check(cash===0,'no deadline kill payout');
setup();const earlyTile=cashTile();enemies=[];spawnQueue=[];step(.01);const progress=earlyTile.healProgress;step(10);near(earlyTile.healProgress,progress,'settlement never produces cash');
// Existing population never gates direct or scheduled entry.
setup(6);enemies=[];for(let i=0;i<8;i++)check(spawn({type:'eye',side:i%3}),'can exceed old ranged cap');
const population=enemies.length,queued=spawnQueue.length;advance(3);check(enemies.length===population+3&&spawnQueue.length===queued-3,'crowded scene still follows roster schedule');
const beforeIndependent=enemies.length;updateChaserSpawns(99);check(enemies.length===beforeIndependent,'no second hidden chaser stream to distort composition');
setup(9);spawnQueue=Array.from({length:60},()=>({type:'eye',side:0}));step(28);check(enemies.length===2&&!pendingNormalSpawns(),'large frame skips expired waves');
setup(3);equipItem('armor',createArmor('chrono'));step(3);check(enemies.length===5&&enemies.filter(e=>isMeleeEnemy(e)).length===3,'ranged cap ignores slow-time armor');
setup(3);togglePause();step(4);check(enemies.length===2&&timedRoom.remaining===30,'pause freezes schedule');togglePause();step(3);check(enemies.length===5,'resume preserves mixed schedule');
// Timeout only plays visuals: no bounty, death chain, corpse wager or minion explosion.
setup(1);drinkBottles=[{id:'hive',done:true,left:0},{id:'redcap',done:false,left:1},{id:'caramel',done:false,left:1}];
const victim=enemies[0],dead={...enemies[1],hp:0};enemies=[victim,dead];const missile={type:'rocket',x:500,y:300,hp:3,life:10,r:8};missiles=[missile];particles=[];shots=[];
const visualOriginal=shatterVisual,visualVictims=[];shatterVisual=e=>{visualVictims.push(e);visualOriginal(e)};
finishTimedRoom();check(visualVictims.length===2&&visualVictims.includes(victim)&&visualVictims.includes(missile),'each live entity gets visuals once');
check(!visualVictims.includes(dead)&&!drinkDeaths.has(victim)&&!shots.length&&!drinkZones.length,'timeout bypasses kill and death procs');
check(cash===0&&kills===0&&particles.some(q=>q.chunk),'timeout fragments without rewards');const fragments=particles.filter(q=>q.chunk).length;finishTimedRoom();check(particles.filter(q=>q.chunk).length===fragments,'timeout idempotent');
step(.1);check(particles.some(q=>q.chunk),'death fragments persist into settlement');draw();check(renderer.data.slice(0,renderer.count).every(Number.isFinite),'timeout rendering finite');shatterVisual=visualOriginal;
setup(7);finishBossIntro();particles=[];const hunt=greedRoom;step(15);check(hunt.earned===0&&hunt.killed===0&&cash===0&&particles.some(q=>q.chunk),'gold timeout also has visual deaths without bounty');
// Real bosses, including test arenas, freeze stored cash and production but allow medical supplies.
for(const kind of ['snake','virus','cowboy','crimson','drone','ufo']){
 const f=['snake','virus'].includes(kind)?11:['cowboy','crimson'].includes(kind)?22:33;reset();floor=f;campaignBossKind=kind;startWave();finishBossIntro();p.inv=999;const stored=cashTile(true);stored.pickup={x:320,y:300,speed:80};
 const medical={x:0,y:0,medical:true,healProgress:0,healFlash:0,medPack:false};tiles.push(medical);updateHealing(100);check(cash===0&&stored.medPack&&stored.pickup.x===320,'boss blocks pending pickup '+kind);check(medical.medPack,'boss medical remains active '+kind);
 stored.medPack=false;stored.healProgress=7;updateHealing(100);check(stored.healProgress===7,'boss freezes production '+kind);draw();check(renderer.data.slice(0,renderer.count).every(Number.isFinite),'disabled cash render finite '+kind);
 campaignBoss=0;timedRoom=null;check(!cashTilesEnabled(),'standalone unlimited boss blocks money '+kind);
}
setup();const pending=cashTile(true);state='bossIntro';updateHealing(100);check(cash===0&&pending.medPack,'intro blocks pickup');state='descent';updateHealing(100);check(cash===0,'descent blocks pickup');state='combat';updateHealing(.01);check(cash===3&&!pending.medPack,'next timed room can collect stored cash');
// Existing turret survival stays fixed, even with chrono equipped.
setup(4);cashTile();equipItem('armor',createArmor('chrono'));step(1);near(survivalRemaining,19,'turret room real clock');
// Gold hunt no longer ends early when all targets have been killed.
setup(7);const g=greedRoom;for(const e of g.spiders){claimGoldSpider(e);e.hp=0;}enemies=[];step(.01);check(state==='stageClear'&&g.outcome==='completed'&&g.remaining===15,'completed hunt clears before deadline');check(cash===60,'full hunt bounty once on early clear');step(stageClearLeft);check(state==='upgrade'&&cash===60,'early hunt settlement reaches shop');
reset();check(!timedRoom&&!cashTilesEnabled(),'restart clears timer and disables transition production');
console.log('Chapter 30/45/60s rooms, sixty percent contact mix, early ranged cap and unrestricted melee entry, reward-free timeout visuals, accelerated entry, immediate early clear, normal/survival/greed deadlines, pause/slow-time/large-step boundaries, six boss cash locks, stored pickup and render passed');
}`,sandbox);

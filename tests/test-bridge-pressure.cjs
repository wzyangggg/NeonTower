const fs=require('node:fs'),vm=require('node:vm');
const elements={};const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);if(process.argv.includes('--hex'))vm.runInContext(fs.readFileSync('dist/hex-map.js','utf8')+'\n'+fs.readFileSync('dist/terrain-generators.js','utf8'),sandbox);for(const file of ['music','renderer','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss','electric-tiles']){let code=fs.readFileSync('dist/'+file+'.js','utf8');if(file==='game'&&process.argv.includes('--hex'))code=require('../dist/hex-map.js').transform(code);vm.runInContext(code,sandbox);}
vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
function setup(f=5){reset();floor=f;startWave();step(1);p.inv=999;shootTimer=999;}
setup(1);const light=enemies.find(e=>e.type==='crawler');
check(light.r===10&&Math.abs(light.hp-normalMeleeHealth())<1e-8,'small weak spider spawn');
const oldPosition={x:light.x,y:light.y};updateChaser(light,.1);
check(Math.abs(Math.hypot(light.x-oldPosition.x,light.y-oldPosition.y)-83.2*1.3*.1)<1e-7,'actual spider speed +30%');
function spiderBounds(){renderer.begin();drawCrawlerSpider(light,0,0);const data=renderer.residentSnapshot(),lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];for(let i=0;i<data.length;i+=9)for(let j=0;j<3;j++){lo[j]=Math.min(lo[j],data[i+j]);hi[j]=Math.max(hi[j],data[i+j]);}return hi.map((n,i)=>n-lo[i]);}
light.roll=.5;const smallBounds=spiderBounds(),sharedBody=renderer.residentMeshes.get('crawler-spider:body').data;
STARTER_ENEMIES.crawler.scale=1;const fullBounds=spiderBounds();STARTER_ENEMIES.crawler.scale=.7;
check(smallBounds.every((n,i)=>Math.abs(n/fullBounds[i]-.7)<1e-6),'whole articulated spider scales uniformly');
check(renderer.residentMeshes.get('crawler-spider:body').data===sharedBody,'size uses shared resident geometry');
check(Math.abs(STARTER_ENEMIES.crawler.gaitRate/2.6*STARTER_ENEMIES.crawler.speed/64-2.6)<1e-8,'faster movement also speeds distance-driven strides');
for(const f of [1,4,5,8,13,23]){
 setup(f);const roster=[...enemies,...spawnQueue],ground=roster.filter(e=>e.bridgeRoller);
 check(roster.length===normalRoomRosterSize(),'finite total '+f);
 check(ground.length===Math.round(roster.length*(f<=6?.2:.4)),'reduced land share '+f);
 check(ground.some(e=>e.type==='ironball')===(f>=5),'ironball unlock '+f);
 if(f>=5){const ball=enemies.find(e=>e.type==='ironball');check(ball&&ball.r===30&&ball.hp===normalMeleeHealth()*2.5,'first wave heavy size/health '+f);}
}
setup(5);const fixedTotal=stageResultStats().total;
// Full aerial slots must not block the finite bridge stream.
while(normalRangedCount()<normalRangedLimit())check(spawn({type:'spitter',side:0}),'fill aerial capacity');
const before=enemies.filter(e=>e.bridgeRoller).length,queue=spawnQueue.length;
for(let i=0;i<300;i++)step(.01);
check(enemies.filter(e=>e.bridgeRoller).length>=before+1,'slower bridge reinforcement despite full aerial slots');
check(spawnQueue.length<queue&&stageResultStats().total===fixedTotal,'bridge draws from finite pool');
check(normalThreat()<=normalThreatLimit(),'density respects threat budget');
const frozen=JSON.stringify({enemies,spawnQueue,left:timedRoom.bridgeEntryLeft});paused=true;step(10);check(JSON.stringify({enemies,spawnQueue,left:timedRoom.bridgeEntryLeft})===frozen,'pause freezes bridge stream');paused=false;
// Original large ironball traverses the persistent surface, keeps rolling, and makes contact.
setup(5);const ball=enemies.find(e=>e.type==='ironball');enemies=[ball];spawnQueue=[];const from={x:ball.x,y:ball.y};let entered=false;
for(let i=0;i<1600;i++){updateChaser(ball,.02);if(typeof HexMap!=='undefined')check(HexMap.canStand(bridgeRoom.surface,ball.x,ball.y,6.99),'heavy stays supported');if(!ball.bridgeApproach){entered=true;break;}}
check(entered&&Math.hypot(ball.x-from.x,ball.y-from.y)>50,'large ball crosses bridge onto island');
const rolling=ball.roll||0;step(.03);check(ball.roll>rolling,'actual heavy animation rolls');
ball.x=p.x;ball.y=p.y;p.frameStartX=p.x;p.frameStartY=p.y;p.inv=0;const hp=p.hp;updateChaser(ball,.01);check(p.hp===hp-1,'heavy contact damages player');
draw();check(renderer.residentSnapshot().every(Number.isFinite),'finite resident ironball mesh');
setup(5);timedRoom.remaining=NORMAL_SPAWN_FINALE;const pending=spawnQueue.length;updateTimedRoomSpawns(10);check(pending>0&&!spawnQueue.length,'finale expires pending land and air');
// Every real bridge kill uses the same green crystal reward path.
for(const type of ['crawler','bomber','ironball'])for(const source of ['weapon','tower','bomb']){
 setup(5);const mob=enemies.find(e=>e.bridgeRoller);mob.type=type;mob.hp=.1;mob.max=type==='ironball'?25:type==='bomber'?9:4;mob.x=p.x+60;mob.y=p.y;mob.terrainStun=999;
 enemies=[mob];spawnQueue=[{type:'spitter',side:0}];timedRoom.nextWaveAt=999;timedRoom.bridgeEntryLeft=999;cash=0;particles=[];
 shots=[{beam:true,arc:true,radial:true,arcTargets:[mob],originX:p.x,originY:p.y,x:p.x,y:p.y,vx:0,vy:0,life:.1,damage:999,pierce:Infinity,hitTargets:new Set(),source}];
 step(.01);check(mob.hp<=0&&cash===enemyKillReward(mob),'bridge reward '+type+'/'+source);check(particles.some(q=>q.cashGem),'green crystal '+type+'/'+source);const earned=cash;step(.1);check(cash===earned,'one payout per kill');
}
if(typeof HexMap!=='undefined')for(const source of ['tower','bomb']){
 setup(5);ElectricTiles.reset();const cell=tiles.find(t=>ElectricTiles.canPlace('electric_tower',t)),origin=ElectricTiles.center(cell),mob=enemies.find(e=>e.bridgeRoller);
 mob.hp=.1;mob.x=origin.x;mob.y=origin.y;mob.terrainStun=999;enemies=[mob];spawnQueue=[{type:'spitter',side:0}];timedRoom.nextWaveAt=999;timedRoom.bridgeEntryLeft=999;cash=0;shots=[];particles=[];
 if(source==='tower'){const tower=ElectricTiles.place('electric_tower',cell);tower.cool=0;ElectricTiles.update(.01);}else check(ElectricTiles.activateEquipmentBomb(createBomb('tower')),'actual bomb activates');
 step(.01);check(mob.hp<=0&&cash===enemyKillReward(mob)&&particles.some(q=>q.cashGem),'actual '+source+' pays bridge reward');
}
setup(5);const beforeTimeout=cash;finishTimedRoom();check(cash===beforeTimeout,'timeout cleanup has no kill bounty');
console.log('Bridge pressure: strong unlocks, 2.5x heavy health/30 radius, finite land share, dense independent entries under full aerial cap, threat, pause, island traversal, rolling/contact, finale and render passed.');
}`,sandbox);


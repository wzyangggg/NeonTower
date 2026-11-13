const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,els,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};sandbox.fsMainHTML=fs.readFileSync('dist/index.html','utf8');sandbox.fsBootLoader=fs.readFileSync('dist/hex-loader.js','utf8');vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/talents.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/humanoid.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/cowboy.js','utf8'),sandbox);
for(const name of ['snake','virus','crimson-mech','drone-boss','ufo-boss'])vm.runInContext(fs.readFileSync('dist/'+name+'.js','utf8'),sandbox);
vm.runInContext(`
function check(v,m){if(!v)throw Error(m)}
sound=false;
const savedProgress=new Map();localStorage.getItem=key=>savedProgress.get(key)||null;localStorage.setItem=(key,value)=>savedProgress.set(key,value);
check(highestUnlockedDifficulty()===1,'fresh save only unlocks one star');
savedProgress.set('neon-difficulty-progress-5',JSON.stringify({won:true,wave:30}));
check(!startDifficulty(5)&&activeDifficulty===0,'cannot skip missing lower clears even with higher history');savedProgress.clear();
check(!startDifficulty(2)&&activeDifficulty===0,'direct start guard');
startDifficulty(1);floor=15;recordDifficultyProgress();check(!difficultyUnlocked(2),'reaching final wave does not unlock');
testMode=true;recordDifficultyProgress(true);check(!difficultyUnlocked(2),'test run cannot unlock');testMode=false;
savedProgress.clear();activeDifficulty=0;
const ends=[20,25,25,30,40],scoreTargets=[100,250,550,1300,3000];
const materialTargets=[[24,4,0],[36,8,1],[48,12,2],[60,18,4],[84,24,6]];
for(let level=1;level<=5;level++){
 startDifficulty(level);p.inv=99999;shootTimer=99999;
 const startingScore=TalentRuntime.store.view().balance;
 const startingMaterials=TalentRuntime.store.view().materials;
 check(campaignEndFloor()===ends[level-1],'end floor '+level);
 let ordinary=0,bosses=0;
 for(let stage=1;stage<=campaignEndFloor();stage++){
  floor=stage;startWave();
  if(campaignBoss){
   bosses++;check(stage%5===0&&campaignBossPool().some(b=>b.id===campaignBossKind),'correct boss '+level+'/'+bosses);
   finishBossIntro();check(currentBossBodies().length>0,'real boss spawn');
   check(currentBossBodies().every(e=>e.difficultyScaled),'boss health scaled');
   if(level===1&&bosses===1){
    check(timedRoom===null&&$('survival-clock').style.display==='none','boss floor has no countdown');
    beginStageClear(0);beginBossDeath(currentBossBodies());
    p.inv=999;shootTimer=999;
    for(let i=0;i<600;i++)step(.2);
    check(state==='combat'&&currentBossBodies().some(e=>e.hp>0),'living boss blocks clear after two minutes');
   }
   for(const e of currentBossBodies())e.hp=0;
   beginBossDeath(currentBossBodies());step(3.01);
  }else{
   ordinary++;check(campaignWave()===ordinary,'ordinary wave index');
   if(timedRoom){
    check(spawnQueue.every(e=>e.enemyTier>=1&&e.enemyTier<=level+1),'difficulty caps enemy tiers');
    check(new Set(spawnQueue.map(e=>e.enemyTier)).size===level+1,'all unlocked tiers in the roster');
   }
   const bridgeStage=stage%5===2||stage%5===4;
   check(!!bridgeRoom===bridgeStage,'bridge placement '+level+'/'+stage);
   check(spawnQueue.every(e=>!isMeleeEnemy(e)&&!e.bridgeRoller),'campaign rooms use ranged rosters');
   if(state==='drinkArrival'){step(DRINK_TRUCK_ARRIVAL);chooseTruckDrink(0);resetDrinks();check(state==="descent","drink stop continues to next floor");continue;}
   else if(sawRoom)finishSawRoom();
   else{enemies=[];spawnQueue=[];drinkZones=[];beginStageClear(0);}
  }
  check(state==='stageClear','settlement '+level+'/'+stage);
  check(stageSettlement.score>0,'fixed score present on floor '+level+'/'+stage);
  check(!!stageSettlement.finalCampaign===(stage===campaignEndFloor()),'only final floor wins');
  if(stage===campaignEndFloor()){
   if(stageStats)stageStats.loot=[];stageSettlement.ready=true;continueStageResult();check(state==='won','victory '+level);
  }
 }
 check(ordinary===campaignCombatWaves()&&bosses===campaignBossStages().length,'exact waves/bosses');
 check(highestUnlockedDifficulty()===Math.min(5,level+1),'actual victory unlocks exactly next difficulty');
 check(TalentRuntime.summary().earned===scoreTargets[level-1],'fixed campaign score '+level);
 check(TalentRuntime.store.view().balance===startingScore+scoreTargets[level-1],'fixed score credited to wallet '+level);
 const loot=TalentRuntime.summary().materials,inventory=TalentRuntime.store.view().materials;
 for(const family of ['skill','tower'])materialTargets[level-1].forEach((count,tier)=>{
  const id=family+tier;
  check((loot[id]||0)===count,'fixed material total '+level+'/'+id);
  check((inventory[id]||0)===(startingMaterials[id]||0)+count,'fixed material credited '+level+'/'+id);
 });
}
activeDifficulty=1;const low=attackCooldown(3,.5);activeDifficulty=5;const high=attackCooldown(3,.5);check(high<low,'faster attacks');check(attackCooldown(.5,.1)===.4,'tell duration preserved');
for(const level of [1,5]){startDifficulty(level);floor=5;timedRoom={};enemies=[];const spec={type:'spitter',side:0};spawn(spec);check(enemies.length===1,'spawn actual mob');const e=enemies[0];check(Math.abs(e.max-rangedEnemyHealth('spitter')*difficulty().hp*.85)<1e-8,'spawn health multiplier');const tier=level+1;spawn({...spec,enemyTier:tier});const upgraded=enemies[1];check(upgraded.enemyTier===tier&&Math.abs(upgraded.max-e.max*enemyTierProfile(tier).hp)<1e-8,'tier health applied on spawn');check(enemyKillReward(upgraded)===enemyKillReward(e)*enemyTierProfile(tier).cash,'tier cash bounty');const before=cash;gainCash(10,p.x,p.y);check(Math.abs(cash-before-10*difficulty().cash)<1e-8,'cash multiplier');}
activeDifficulty=1;
for(const [stage,expected] of [[1,.8],[2,.82],[3,.88],[4,.9],[5,.85],[6,1]]){
 floor=stage;const enemy={hp:25,max:25};scaleDifficultyEnemy(enemy);
 check(Math.abs(enemy.max-25*.8*expected)<1e-8,'opening HP on floor '+stage);
 check(enemyKillReward(enemy)===3,'opening reduction does not cut bounty');
}
for(const [stage,earned,expected] of [[1,0,14],[2,9,5],[4,15,0],[6,0,0]]){
 reset();floor=stage;startWave();step(1);cash=40+earned;stageStats.earned=earned;
 finishTimedRoom();
 if(stageSettlement.index<stageSettlement.events.length)updateStageClear(stageSettlement.wait);
 check(cash===40+earned+expected&&stageStats.earned===earned+expected,'opening settlement floor '+stage);
}
reset();floor=4;startWave();step(1);
updateCampaignBridgeMissiles(5.99);check(!timedRoom.edgeMissile,'opening missile gives six seconds');
updateCampaignBridgeMissiles(6);check(timedRoom.edgeMissile&&timedRoom.nextEdgeMissile===13,'opening missile seven second interval');
activeDifficulty=0;
console.log('PASS five campaigns: exact waves, bosses, special floors, settlements, fixed score totals, elite roster and difficulty scaling');
`,sandbox);

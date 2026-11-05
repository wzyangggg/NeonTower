const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,els,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};sandbox.fsMainHTML=fs.readFileSync('dist/index.html','utf8');sandbox.fsBootLoader=fs.readFileSync('dist/hex-loader.js','utf8');vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);
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
const ends=[15,21,22,27,33],bossKinds=[[],['snake'],['snake','virus'],['cowboy','crimson'],[]];
for(let level=1;level<=5;level++){
 startDifficulty(level);p.inv=99999;shootTimer=99999;
 check(campaignEndFloor()===ends[level-1],'end floor '+level);
 let ordinary=0,bosses=0;
 for(let stage=1;stage<=campaignEndFloor();stage++){
  floor=stage;startWave();
  if(campaignBoss){
   bosses++;if(level<5)check(campaignBossKind===bossKinds[level-1][bosses-1],'correct boss '+level+'/'+bosses);
   finishBossIntro();check(currentBossBodies().length>0,'real boss spawn');
   check(currentBossBodies().every(e=>e.difficultyScaled),'boss health scaled');
   for(const e of currentBossBodies())e.hp=0;
   beginBossDeath(currentBossBodies());step(3.01);
  }else{
   ordinary++;check(campaignWave()===ordinary,'ordinary wave index');
   if(difficultyEliteWave()){
    const elites=spawnQueue.filter(e=>e.elite);check(elites.length===difficulty().eliteCount+(level===5&&ordinary>20?1:0),'elite count '+level+'/'+ordinary);
    check(elites.every(e=>difficulty().elites.includes(e.type)),'elite roster');
   }
   if(state==='drinkArrival'){step(DRINK_TRUCK_ARRIVAL);chooseTruckDrink(0);resetDrinks();check(state==="upgrade","drink stop shop");continue;}
   else{enemies=[];spawnQueue=[];drinkZones=[];beginStageClear(0);}
  }
  check(state==='stageClear','settlement '+level+'/'+stage);
  check(!!stageSettlement.finalCampaign===(stage===campaignEndFloor()),'only final floor wins');
  if(stage===campaignEndFloor()){
   if(stageStats)stageStats.loot=[];stageSettlement.ready=true;continueStageResult();check(state==='won','victory '+level);
  }
 }
 check(ordinary===difficulty().waves&&bosses===difficulty().bosses.length,'exact waves/bosses');
 check(highestUnlockedDifficulty()===Math.min(5,level+1),'actual victory unlocks exactly next difficulty');
}
activeDifficulty=1;const low=attackCooldown(3,.5);activeDifficulty=5;const high=attackCooldown(3,.5);check(high<low,'faster attacks');check(attackCooldown(.5,.1)===.4,'tell duration preserved');
for(const level of [1,5]){startDifficulty(level);floor=5;timedRoom={};enemies=[];const spec={type:'spitter',side:0};spawn(spec);check(enemies.length===1,'spawn actual mob');const e=enemies[0];check(Math.abs(e.max-rangedEnemyHealth('spitter')*difficulty().hp)<1e-8,'spawn health multiplier');const before=cash;gainCash(10,p.x,p.y);check(Math.abs(cash-before-10*difficulty().cash)<1e-8,'cash multiplier');}
activeDifficulty=0;
console.log('PASS five campaigns: exact ordinary waves, real bosses/death/settlement/victory, elite roster, health, attack tells and income');
`,sandbox);

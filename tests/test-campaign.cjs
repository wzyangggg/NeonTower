const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,els,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};sandbox.fsMainHTML=fs.readFileSync('dist/index.html','utf8');sandbox.fsBootLoader=fs.readFileSync('dist/hex-loader.js','utf8');vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/humanoid.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/cowboy.js','utf8'),sandbox);
for(const name of ['snake','virus','crimson-mech','drone-boss','ufo-boss'])vm.runInContext(fs.readFileSync('dist/'+name+'.js','utf8'),sandbox);
vm.runInContext(`
function check(v,m){if(!v)throw Error(m)}
sound=false;
const originalRandom=Math.random;
const variants=[['snake','virus'],['cowboy','crimson'],['drone','ufo']];
for(let route=0;route<8;route++){
 reset();p.inv=999;shootTimer=999;
 check(campaignBossKind===''&&!ufoBoss,'replay clears selected boss and UFO');
 let ordinary=0;
 for(let stage=1;stage<=33;stage++){
  floor=stage;
  const bossStage=stage/11,variant=(route>>(bossStage-1))&1;
  if(stage%11===0)Math.random=()=>variant?.999999:0;
  startWave();Math.random=originalRandom;
  if(stage%11){ordinary++;check(!campaignBoss&&!enemies.some(e=>e.type==='boss'),'ordinary round '+stage);if(state==='bossIntro')finishBossIntro();enemies=[];spawnQueue=[];missiles=[];if(state==='drinkArrival'){step(DRINK_TRUCK_ARRIVAL);check(terrainView==='drinkChoice'&&drinkTruck.offers.length===3,'peaceful drink stop');chooseTruckDrink(0);resetDrinks();}else if(state==='survival')finishSurvival();else beginStageClear();}
  else{
   const expected=variants[bossStage-1][variant];
   check(ordinary===10&&campaignBoss===bossStage&&state==='bossIntro','ten rounds before each boss');ordinary=0;
   check(campaignBossKind===expected&&$('intro-text').textContent.includes(campaignBossName()),'random pair and matching warning');
   check(music.track==='boss','boss intro theme');
   const equipment=weapon,health=p.hp,gridSize=tiles.length;
   finishBossIntro();
   check(weapon===equipment&&p.hp===health&&tiles.length===gridSize,'spawn keeps run equipment health and terrain');
   check(!snakeTest&&!virusTest&&!humanoidTest&&!droneBossTest&&!ufoBossTest&&!testMode,'normal run has no lab flags');
   check(expected==='snake'?!!snakeBoss:expected==='virus'?!!virusBoss:expected==='cowboy'?!!humanoidBoss?.cowboy?.mech:expected==='crimson'?!!humanoidBoss?.crimson:expected==='drone'?!!droneBoss:!!ufoBoss,'actual selected boss');
   syncBossHealth();check(!$('boss-health').hidden&&$('boss-health-fill').style.width==='100%'&&$('boss-health-name').textContent===campaignBossName(),'large bar starts full with selected name');
   shootTimer=999;p.inv=999;chaserSpawned=999;
   if(expected==='virus'){const parent=virusBoss;parent.hp=parent.max/2;step(.01);check(parent.splitPreparing,'actual half-health split');for(let j=0;j<120;j++)step(.01);check(livingViruses().length===2,'children stay in campaign');syncBossHealth();check(bossHealthMax===420&&$('boss-health-fill').style.width==='50%','split preserves encounter bar instead of refilling');livingViruses()[0].hp=0;step(.001);check(state==='combat','one child death does not clear boss');}
   if(expected==='cowboy'){for(let j=0;j<400;j++)step(.01);check(humanoidBoss.cowboy.attacks>0,'spider real AI');}
   if(expected==='crimson'){for(let j=0;j<2200;j++)step(.01);check(humanoidBoss.crimsonAI.count>=4,'crimson real four-attack cycle');check(!els['humanoid-health'],'campaign does not access missing lab HUD');}
   if(expected==='drone'){for(let j=0;j<2100;j++)step(.01);check(droneBoss.attacks>0&&droneBoss.pattern===3,'drone full real AI cycle');check(livingDroneMinions().length>0,'campaign deployment');}
   if(expected==='ufo'){
    step(.81);const mother=ufoBoss;
    shots=[{x:mother.x,y:mother.y,vx:0,vy:0,life:1,damage:1e6,pierce:1,critChance:0}];step(.001);
    check(mother.hp===mother.max&&state==='combat','campaign mother shield blocks real damage');
    shots=livingUFOMinions().map(e=>({x:e.x,y:e.y,vx:0,vy:0,life:1,damage:1e6,pierce:1,critChance:0}));step(.001);step(.001);
    check(!livingUFOMinions().length&&state==='combat'&&mother.rebuild>0,'clearing children opens window without victory');
   }
   draw();
   const oldBoss=humanoidBoss;
   const victims=expected==='drone'?[droneBoss]:expected==='ufo'?[ufoBoss]:[...enemies];
   shots=victims.filter(e=>e.hp>0).map(e=>({x:e.x,y:e.y,vx:0,vy:0,life:1,damage:1e6,pierce:1,critChance:0}));step(.001);
   check(state==='bossDying'&&bossDeath&&bossesDefeated===bossStage-1,'lethal hit starts delayed finale '+expected);
   check(!$('boss-health').hidden&&$('boss-health-fill').style.width==='0%','large health bar remains empty during finale');
   check(!shots.length&&!bullets.length&&!missiles.length&&!hazards.length&&!droneSaws.length,'lethal hit immediately disarms arena');
   const frozenAge=bossDeath.age;togglePause();loop(6000);check(bossDeath.age===frozenAge,'pause freezes death timer');togglePause();
   const frozenTime=time,frozenPose=JSON.stringify(bossDeath.bodies.map(e=>[e.x,e.y,e.t,e.angle,e.gait,e.cowboy,e.crimsonAI]));
   check(bossDeath.blasts.length>=3&&enemyHitFeedback(bossDeath.bodies[0]).white===1,'multiple body explosions and white shader flash');
   step(.08);check(enemyHitFeedback(bossDeath.bodies[0]).white===0&&bossDeath.shattered,'short flash hands over to shattering');
   step(1.9);check(state==='bossDying'&&bossDeath.age<2&&bossDeath.shattered,'debris and smoke keep the finale alive');
   check(time===frozenTime&&JSON.stringify(bossDeath.bodies.map(e=>[e.x,e.y,e.t,e.angle,e.gait,e.cowboy,e.crimsonAI]))===frozenPose,'movement animation and attack poses freeze');
   check(bossDeath.fragments.length>=48&&deathBursts.some(e=>e.kind==='boss'),'solid debris and thick smoke continue after the flash');
   draw();step(.03);check(bossDeath.shattered&&bossDeath.fragments.length>=48&&bossesDefeated===bossStage-1,'debris persists without ending the finale');
   draw();const meshCount=renderer.residentMeshes.size;step(.98);draw();check(state==='bossDying'&&bossDeath.age<3&&renderer.residentMeshes.size===meshCount,'fragments persist to third second with stable shared meshes');
   step(.02);
   check(bossesDefeated===bossStage,'actual friendly damage completes boss '+expected);
   check(!ufoBoss&&!droneBoss&&!humanoidBoss&&!snakeBoss&&!virusBoss&&!enemies.length&&!droneSaws.length,'all boss entities and minions cleaned');
   if(oldBoss?.crimson)check(!oldBoss.crimsonRockets.length,'crimson fire cleaned');
   if(stage===33){check(state==='stageClear'&&stageSettlement.finalCampaign,'final boss displays victory stats');step(stageClearLeft);continueStageResult();check(state==='won'&&$('overlay').innerHTML.includes('30')&&$('wave').textContent==='三场 BOSS 已击败','third victory ends run');const saved=floor;step(99);check(state==='won'&&floor===saved,'no further floors or shop');check(!music.active,'victory stops music');break;}
   check(state==='stageClear'&&music.track==='normal'&&campaignBossKind==='','early boss returns to normal theme');
  }
  step(stageClearLeft);continueStageResult();check(state==='upgrade','shop between rounds');leaveShop();
 }
}
reset();check(floor===1&&bossesDefeated===0&&campaignBoss===0&&campaignBossKind===''&&!snakeBoss&&!virusBoss&&!humanoidBoss&&!droneBoss&&!ufoBoss,'replay resets campaign');
floor=44;check(campaignBossIndex()===0,'no fourth campaign boss');
reset();floor=11;campaignBossKind='snake';startWave();finishBossIntro();const oldBodies=currentBossBodies();for(const e of oldBodies)e.hp=0;beginBossDeath(oldBodies);step(1);reset();check(!bossDeath&&!campaignBoss&&!snakeBoss&&$('boss-health').hidden,'reset interrupts finale and removes its entities/HUD');
const mainHTML=fsMainHTML;
check(mainHTML.includes('src="hex-loader.js"')&&fsBootLoader.includes("'crimson-mech.js'")&&fsBootLoader.indexOf("'cowboy.js'")<fsBootLoader.indexOf("'crimson-mech.js'"),'main entry loads crimson after cowboy through campaign bootstrap');
const media={src:'audio/normal-theme.mp3',currentTime:42,paused:true,play(){this.paused=false;return Promise.resolve()},pause(){this.paused=true},load(){this.currentTime=0}},player=new GameMusic(media);
player.setState({enabled:true,active:true,shopping:false});player.setState({enabled:true,active:true,shopping:false,track:'boss'});check(media.src==='audio/relentless-minor.mp3'&&media.currentTime===0,'old music now boss theme');media.currentTime=17;player.setState({enabled:true,active:true,shopping:true,track:'normal'});check(media.currentTime===42&&media.volume===.12,'normal resumes at shop gain');player.setState({enabled:true,active:true,shopping:false,track:'boss'});check(media.currentTime===17,'boss resumes its own time');player.setState({enabled:false,active:true,shopping:false,track:'boss'});check(media.paused,'boss mute');
console.log('All 8 random routes: 30 rounds, six real bosses in three pairs, shield/split/minion mechanics, damage victories, cleanup, ending/replay and music passed');
`,sandbox);

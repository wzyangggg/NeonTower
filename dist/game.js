'use strict';
const canvas=document.querySelector('canvas'),$=id=>document.getElementById(id);
const renderer=new Elevator3D(canvas);
const music=new GameMusic($('bgm'));
function talentLevel(id){return globalThis.TalentRuntime?.level(id)||0;}
function syncMusic(){music.setState({enabled:sound,active:!paused&&!document.hidden&&renderer.ready&&!renderer.gl.isContextLost()&&!['menu','dead','won'].includes(state),shopping:state==='upgrade',track:((campaignBoss&&['bossIntro','combat','bossDying'].includes(state))||snakeTest||virusTest||humanoidTest||droneBossTest||ufoBossTest)?'boss':'normal'})}
const W=650,H=600,A={x:85,y:90,w:480,h:425},TAU=Math.PI*2;

const CAMPAIGN_BOSSES=[
 [{id:'snake',name:'蛇'},{id:'virus',name:'噬菌体'}],
 [{id:'cowboy',name:'枪手机械蜘蛛'},{id:'crimson',name:'赤红裁决者'}],
 [{id:'drone',name:'大无人机'},{id:'ufo',name:'飞碟'}]
],ROUNDS_PER_BOSS=10;
let campaignBoss=0,bossesDefeated=0,campaignBossKind='';
let bossDeath=null,bossHealthMax=0;
function campaignBossIndex(){const index=floor/(ROUNDS_PER_BOSS+1);return Number.isInteger(index)&&index>=1&&index<=CAMPAIGN_BOSSES.length?index:0;}
function campaignBossName(){return CAMPAIGN_BOSSES[campaignBoss-1]?.find(b=>b.id===campaignBossKind)?.name||'';}
function isBossBody(e){return ['snake','virus','humanoid','droneBoss','ufoBoss'].includes(e.type);}
function currentBossBodies(){return enemies.filter(isBossBody);}
function bossFightDefeated(){
 if(!(campaignBoss||snakeTest||virusTest||humanoidTest||droneBossTest||ufoBossTest))return false;
 if(droneBoss)return droneBoss.hp<=0;
 if(ufoBoss)return ufoBoss.hp<=0;
 return !enemies.some(e=>isBossBody(e)&&e.hp>0);
}
function syncBossHealth(){
 const panel=$('boss-health'),bodies=currentBossBodies(),active=(campaignBoss||snakeTest||virusTest||humanoidTest||droneBossTest||ufoBossTest)&&['combat','bossDying'].includes(state);
 panel.hidden=!active;if(!active)return;
 // Child drones never inflate their mother's bar. Split viruses retain the original total.
 const maximum=bodies.reduce((n,e)=>n+e.max,0),hp=bossDeath?0:bodies.reduce((n,e)=>n+Math.max(0,e.hp),0);
 bossHealthMax=Math.max(bossHealthMax,virusBoss?.encounterMax||0,maximum);
 const name=campaignBoss?campaignBossName():ufoBoss?'飞碟':droneBoss?'大无人机':humanoidBoss?.crimson?'赤红裁决者':humanoidBoss?.cowboy?'枪手机械蜘蛛':humanoidBoss?'人形守卫':virusBoss?'噬菌体':'蛇';
 $('boss-health-name').textContent=name;
 $('boss-health-value').textContent=Math.ceil(hp)+' / '+Math.ceil(bossHealthMax);
 renderBossBarFeedback(hp,bossHealthMax);
 $('boss-health-fill').style.width=(bossHealthMax?Math.max(0,Math.min(1,hp/bossHealthMax))*100:0)+'%';
 panel.setAttribute?.('aria-valuenow',Math.ceil(hp));panel.setAttribute?.('aria-valuemax',Math.ceil(bossHealthMax));
}
function beginBossDeath(bodies=currentBossBodies()){
 if(state!=='combat'||bossDeath)return;
 const unique=[...new Set(bodies)];if(!unique.length){const e=humanoidBoss||droneBoss||ufoBoss||virusBoss;if(e)unique.push(e);}
 globalThis.TalentRuntime?.boss();
 for(const e of unique.filter((_,i)=>i%Math.max(1,Math.ceil(unique.length/4))===0))spawnDeathBurst(e.x,e.y,Math.max(e.type==='humanoid'?65:38,e.r),'boss',e.type==='humanoid'?85:45);
 bossDeath={age:0,nextBlast:0,bodies:unique,blasts:[],fragments:[],shattered:false};
 state='bossDying';releaseJoy();bullets=[];shots=[];missiles=[];hazards=[];droneSaws=[];spawnQueue=[];explosionFX=[];
 if(humanoidBoss){humanoidBoss.skyEffects=[];humanoidBoss.crimsonRockets=[];}
 $('status').textContent='BOSS 已击败';$('wave').textContent='机体崩解中';updateUI();syncBossHealth();syncMusic();
 updateBossDeath(0);
}
function updateBossDeath(dt){
 const d=bossDeath;if(!d)return;updateDeathFeedback(Math.max(0,dt));d.age=Math.min(3,d.age+Math.max(0,dt));
 while(d.nextBlast<Math.min(d.age+1e-9,.18)){
  for(let i=0;i<3;i++){
   const e=d.bodies[(Math.floor(d.nextBlast/.12)*3+i)%Math.max(1,d.bodies.length)];if(!e)continue;
   const radius=Math.max(16,e.r),height=e.type==='snake'?14+Math.random()*22:e.type==='humanoid'?35+Math.random()*105:e.type==='droneBoss'?50+Math.random()*55:30+Math.random()*80;
   // Surface bursts stay visible on the camera-facing side, rather than buried in opaque shells.
   d.blasts.push({x:e.x-325+(Math.random()-.5)*radius*2,z:(e.y-300)*1.06+radius*(.6+Math.random()*.4),y:height,born:d.nextBlast,r:10+Math.random()*12});
  }
  d.nextBlast+=.12;beep(55+Math.random()*45,.07,'sawtooth',.025);
 }
 d.blasts=d.blasts.filter(b=>d.age-b.born<.4);
 if(d.age>=.055&&!d.shattered){
  d.shattered=true;d.blasts=[];beep(45,.4,'sawtooth',.07);
  // Shared unit meshes: debris updates only transforms, never rebuilds body geometry.
  for(const e of d.bodies){const colors=e.crimson?['#c93242','#ef6670','#273643','#b9c6c9']:e.type==='virus'?['#b399cd','#ddd2aa','#829c9b','#364c52']:e.type==='snake'?['#294d49','#8caba1','#b2c99a','#526668']:['#8eaaa5','#d7ded1','#4a6064','#be6050'];for(let i=0;i<48;i++){
   const a=Math.random()*TAU,r=Math.sqrt(Math.random())*Math.max(18,e.r),height=e.type==='snake'?12+Math.random()*20:18+Math.random()*80;
   d.fragments.push({x:e.x-325+Math.cos(a)*r,y:height,z:(e.y-300)*1.06+Math.sin(a)*r,vx:Math.cos(a)*(70+Math.random()*160),vz:Math.sin(a)*(70+Math.random()*160),vy:100+Math.random()*180,size:4+Math.random()*7,spin:(Math.random()-.5)*15,angle:Math.random()*TAU,color:colors[i%colors.length]});
  }}
 }
 syncBossHealth();
 if(d.age<3)return;
 bossDeath=null;state='combat';enemies=[];spawnQueue=[];if(snakeBoss)snakeBoss.parts=[];
 if(campaignBoss)finishCampaignBoss();else if(ufoBossTest)finishUFOBossTest(true);else if(droneBossTest)finishDroneBossTest(true);else if(humanoidTest)finishHumanoidTest(true);else if(virusTest)finishVirusTest(true);else if(snakeTest)finishSnakeTest(true);
 $('boss-health').hidden=true;
}
function drawBossDeath(){
 const d=bossDeath;if(!d)return;const r=renderer;
 for(const b of d.blasts){const t=d.age-b.born,scale=b.r*Math.sin(Math.min(1,t/.4)*Math.PI),pose=monsterPose(b.x,b.y,b.z,0,scale,scale,scale);
  r.residentMesh('boss-death:blast',()=>{const start=r.count;r.sphere(0,0,0,1,'#ff8c3c',1,1,1,5,8);r.markEmissive(start);},pose);r.glow(b.x,b.y,b.z,scale*1.6,'#ffad49');
  r.residentMesh('boss-death:core',()=>{const start=r.count;r.sphere(0,0,0,1,'#fff2b4',1,1,1,4,6);r.markEmissive(start);},monsterPose(b.x,b.y,b.z,0,scale*.55,scale*.55,scale*.55));
  for(let i=0;i<6;i++){const a=i*TAU/6+b.born*17,travel=t*100,size=2*(1-t/.4);r.residentMesh('boss-death:spark',()=>r.emissiveBox(0,0,0,1,1,1,'#ffdf8a'),monsterPose(b.x+Math.cos(a)*travel,b.y+t*50,b.z+Math.sin(a)*travel,a,size,size*3,size));}
 }
 const t=Math.max(0,d.age-.055);
 for(const q of d.fragments){const x=q.x+q.vx*t,z=q.z+q.vz*t,y=Math.max(q.size/2,q.y+q.vy*t-260*t*t),scale=q.size*Math.max(0,1-t/2.9);
  r.residentMesh('boss-death:chunk:'+q.color,()=>r.box(0,0,0,1,1,1,q.color),monsterPose(x,y,z,q.angle+q.spin*t,scale,scale*.7,scale));
 }
}

// Shared death layers use independent effect clocks, including the frozen combat finales.
let deathBursts=[],healthBarShards=[],feedbackClock=0,worldHealthBars=new WeakMap();
let bossBarFeedback={hp:null,max:0,drops:[],pulseAt:-Infinity};
function resetDeathFeedback(){deathBursts=[];healthBarShards=[];feedbackClock=0;worldHealthBars=new WeakMap();bossBarFeedback={hp:null,max:0,drops:[],pulseAt:-Infinity};}
function deathRandom(seed,i){const n=Math.sin(seed*71.17+i*137.51)*43758.5453;return n-Math.floor(n);}
function spawnDeathBurst(x,y,r=16,kind='enemy',height=26){
 const boss=kind==='boss',player=kind==='player',size=Math.max(17,Math.min(boss?100:42,r*(boss?1.5:1.15)));
 deathBursts.push({x:x-325,z:(y-300)*1.06,y:height,size,age:0,life:boss?2.85:player?1.65:1.05,kind,seed:Math.random()*1000});
 if(deathBursts.length>16)deathBursts.shift();
}
function updateDeathFeedback(dt){
 feedbackClock+=dt;for(const e of deathBursts)e.age+=dt;deathBursts=deathBursts.filter(e=>e.age<e.life);
 for(const e of healthBarShards)e.age+=dt;healthBarShards=healthBarShards.filter(e=>e.age<e.life);
 for(const e of bossBarFeedback.drops)e.age+=dt;bossBarFeedback.drops=bossBarFeedback.drops.filter(e=>e.age<.5);
}
function drawDeathBursts(){
 const r=renderer;
 for(const e of deathBursts){const t=e.age,n=i=>deathRandom(e.seed,i),size=e.size,burst=Math.max(0,t-.025),progress=Math.min(1,burst/.16),fade=Math.max(0,1-burst/.3);
  // A very short white flash gives way to orange energy and solid matter.
  if(t<.065){const flash=(1-t/.065)**2;fxPuff(e.x,e.y,e.z,size*2.8,size*2.5,'#fff6d6',flash*.9);r.glow(e.x,e.y,e.z,size*2.1*flash,'#fffbee');juicyShape(e.x,e.y+.6,e.z,STARTER_FLASH,'#ffffff',flash,size/12,n(0)*TAU);}
  if(burst>0&&burst<.3){const scale=size/20*(.4+progress*1.9)*(1-burst/.32);juicyShape(e.x,e.y,e.z,STARTER_IMPACTS[Math.floor(n(1)*5)],'#ff8e26',fade,scale,n(2)*TAU);juicyShape(e.x,e.y+.4,e.z,STARTER_IMPACTS[Math.floor(n(1)*5)],'#ffe7a1',fade,scale*.57,n(2)*TAU);}
  // Fast, straight, sharply decelerating streaks sit in front of the smoke.
  if(burst>0&&burst<.48){const count=e.kind==='boss'?30:18,drag=9,travel=(1-Math.exp(-drag*burst))/drag;
   for(let i=0;i<count;i++){const a=n(20+i)*TAU,speed=(360+n(60+i)*650)*(e.kind==='boss'?1.55:1),distance=speed*travel,up=(n(100+i)-.25)*distance,xx=e.x+Math.cos(a)*distance,zz=e.z+Math.sin(a)*distance*.45,yy=Math.max(6,e.y+up),length=(9+n(140+i)*18)*Math.exp(-burst*6),alpha=Math.min(1,(.48-burst)/.12);juicyShape(xx,yy,zz,[[0,0],[-length,.8],[-length*1.2,0],[-length,-.8]],i%4?'#ffe5a0':'#ffffff',alpha,1,a);r.glow(xx,yy,zz,2.5*alpha,'#ffce6d');}
  }
  // Overlapping dark cores, mid-tones and soft edges give the blast real volume.
  if(t>.045){const smokeAge=t-.045,life=e.life-.045,envelope=Math.min(1,smokeAge/.09)*Math.min(1,(life-smokeAge)/.4),lobes=e.kind==='boss'?17:e.kind==='player'?12:9;
   for(let layer=0;layer<2;layer++)for(let i=0;i<lobes;i++){const a=n(190+i)*TAU,spread=size*(.35+Math.min(1,smokeAge/.35)*(.7+n(220+i)*.65)),xx=e.x+Math.cos(a)*spread,zz=e.z+Math.sin(a)*spread*.65+(layer?size*.28:-size*.2),yy=e.y+smokeAge*(25+n(250+i)*36)+Math.sin(a)*size*.5+layer*size*.45,rad=size*(.42+n(280+i)*.4)*(1+Math.min(smokeAge,.8)*.55),color=layer?(i%3?'#526173':'#78818b'):(i%2?'#243140':'#354355');fxCloud(xx,yy,zz,rad,rad*(1+n(310+i)*.5),color,envelope*(layer?.27:.44));}
   const opacity=Math.round(envelope*.5*8)/8;if(opacity>0)for(let i=0;i<(e.kind==='boss'?8:4);i++){const a=n(350+i)*TAU,rad=size*(.46+n(370+i)*.32)*(1+Math.min(smokeAge,.8)*.4),xx=e.x+Math.cos(a)*size*.7,zz=e.z+Math.sin(a)*size*.55,yy=e.y+smokeAge*32+(i%3)*size*.55,color=i%2?'#405166':'#29394b';r.residentMaterial('death-smoke:'+color+':'+opacity,()=>r.sphere(0,0,0,1,color,1,1,1,5,8),monsterPose(xx,yy,zz,a,rad,rad*1.3,rad),opacity);}
   if(smokeAge<.28)fxPuff(e.x,e.y+4,e.z,size*1.9,size*1.5,'#ff9f45',(.28-smokeAge)*1.1);
  }
 }
}
function emitBarLoss(owner,oldHp,newHp,max){
 if(!owner||!(max>0)||!(oldHp>newHp))return;
 const layout=worldHealthBars.get(owner)||{x:owner.x-325,y:owner===p?91:65,z:(owner.y-300)*1.06,width:owner===p?66:44,height:owner===p?16:6,color:owner===p?'#9de4c6':'#ecae85'};
 const before=Math.max(0,Math.min(1,oldHp/max)),after=Math.max(0,Math.min(1,newHp/max)),lost=(before-after)*layout.width,parts=Math.max(1,Math.min(3,Math.ceil(lost/15))),left=layout.x-layout.width/2+after*layout.width;
 for(let i=0;i<parts;i++)healthBarShards.push({x:left+(i+.5)*lost/parts,y:layout.y,z:layout.z+3,width:lost/parts,height:layout.height,age:0,life:.48,delay:i*.025,color:layout.color});
 healthBarShards.push({glint:true,owner,x:left,y:layout.y,z:layout.z+3.5,width:2,height:layout.height+7,age:0,life:.2,color:'#ffffff'});
 if(healthBarShards.length>96)healthBarShards.splice(0,healthBarShards.length-96);
 layout.hp=newHp;layout.max=max;layout.pulseAt=feedbackClock;worldHealthBars.set(owner,layout);
}
function trackWorldHealthBar(owner,x,y,z,hp,max,width,height,color){
 if(!owner)return;const old=worldHealthBars.get(owner);if(old&&hp<old.hp)emitBarLoss(owner,old.hp,hp,max);
 worldHealthBars.set(owner,{x,y,z,hp,max,width,height,color,pulseAt:old?.pulseAt??-Infinity});
}
function drawHealthBarShards(){
 const r=renderer;
 for(const q of healthBarShards){const t=Math.max(0,q.age-(q.delay||0));if(q.age<(q.delay||0))continue;
  const draw=(y,alpha,width=q.width,color=q.color)=>r.transparentQuad([q.x-width/2,y-q.height/2,q.z],[q.x+width/2,y-q.height/2,q.z],[q.x+width/2,y+q.height/2,q.z],[q.x-width/2,y+q.height/2,q.z],color,[alpha,alpha,alpha,alpha]);
  if(q.glint){const layout=worldHealthBars.get(q.owner);if(layout){q.x=layout.x-layout.width/2+Math.max(0,Math.min(1,layout.hp/layout.max))*layout.width;q.y=layout.y;q.z=layout.z+3.5;}draw(q.y,Math.max(0,1-t/q.life),q.width*(1-t/q.life),'#ffffff');continue;}
  const alpha=Math.max(0,1-t/q.life);draw(q.y-240*t*t,alpha,q.width*(1-t*.5),t<.07?'#ffffff':q.color);
  for(let i=1;i<=2;i++){const at=Math.max(0,t-i*.035);draw(q.y-240*at*at,alpha*.13,q.width*(1-t*.5),'#fff1cd');}
 }
}
function renderBossBarFeedback(hp,max){
 const d=bossBarFeedback;if(d.hp!==null&&hp<d.hp&&max===d.max){const before=Math.min(1,d.hp/max),after=Math.max(0,hp/max),parts=3;for(let i=0;i<parts;i++)d.drops.push({left:after+(before-after)*i/parts,width:(before-after)/parts,age:0,delay:i*.025});d.pulseAt=feedbackClock;if(d.drops.length>24)d.drops.splice(0,d.drops.length-24);}
 d.hp=hp;d.max=max;const layer=$('boss-health-drops'),edge=$('boss-health-edge');if(layer)layer.innerHTML=d.drops.map(q=>{const t=Math.max(0,q.age-q.delay);return `<i style="left:${q.left*100}%;width:${q.width*100}%;opacity:${Math.max(0,1-t/.45)};transform:translateY(${190*t*t}px) rotate(${t*14}deg)"></i>`;}).join('');
 if(edge){edge.style.left=(max?Math.max(0,hp/max)*100:0)+'%';edge.style.opacity=String(Math.max(0,1-(feedbackClock-d.pulseAt)/.22));}
}
let snakeBoss=null,snakeTest=false,snakeGod=false;
let virusBoss=null,virusTest=false,virusGod=false;
let ufoBoss=null,ufoBossTest=false,ufoBossGod=false;
let droneBoss=null,droneBossTest=false,droneBossGod=false,droneSaws=[];
let humanoidBoss=null,humanoidTest=false,humanoidWalking=true;
const PLAYER_DEATH_DELAY=2;
let playerDeath=null;
let state='menu',floor=1,time=0,phase=0,enemies=[],missiles=[],blasts=[],bullets=[],shots=[],particles=[],hazards=[],turrets=[],kills=0,spawnQueue=[],spawnTimer=0,cleared=false,paused=false,shake=0,shootTimer=0,scroll=0,fallAge=0,landingAge=0,best=0,audio,sound=true;
try{best=+localStorage.getItem('hell-elevator-best')||0}catch{}
const STAGE_CLEAR_BANNER_TIME=2,STAGE_CLEAR_TIME=2,SETTLEMENT_EVENT_TIME=2;let stageClearLeft=0,stageSettlement=null;
let shopErasePending=0,shopTerrainPlan=null,terrainChange=null;
// Three 0.1-second flashes, each with a 0.05-second bright/dark half-cycle.
const TERRAIN_FLASH_TIME=.3,TERRAIN_FLASH_STEP=.05;
function permanentTrapCount(){return tiles.filter(t=>t.trap||t.saw||t.flywheel).length+turrets.filter(t=>!t.temporary).length;}
function terrainKind(t){return !t?'locked':t.trap?'trap':t.saw?'saw':t.flywheel?'flywheel':t.medical?'medical':t.shieldTile?'shield':t.cashTile?'cash':t.shockTile?'shock':t.coverTile?'cover':'floor';}
function planTerrainChange(action,base=null){
 const oldTiles=tiles,oldTurrets=turrets,oldParticles=particles.length;
 let plan;
 try{tiles=(base?.tiles||tiles).map(t=>({...t}));turrets=(base?.turrets||turrets).slice();action();plan={tiles,turrets,age:0,changes:[],hidden:new Set()};}
 finally{tiles=oldTiles;turrets=oldTurrets;particles.length=oldParticles;}
 for(const next of plan.tiles){const old=oldTiles.find(t=>t.x===next.x&&t.y===next.y);if(terrainKind(old)!==terrainKind(next)){const removed=!!old&&(old.trap||old.saw||old.flywheel);plan.changes.push({x:325+next.x*TILE,y:300+next.y*TILE,removed:!!removed,kind:terrainKind(next)});if(removed)plan.hidden.add(old);}}
 for(const old of oldTurrets)if(!plan.turrets.includes(old)){plan.hidden.add(old);plan.changes.push({x:old.x,y:old.y,removed:true,kind:'turret'});}
 return plan;
}
function terrainFlashOn(){return !!terrainChange&&Math.floor((terrainChange.age+1e-9)/TERRAIN_FLASH_STEP)%2===0;}
function terrainHidden(t){return !!terrainChange&&terrainChange.hidden.has(t)&&!terrainFlashOn();}
function finishTerrainChange(){
 if(!terrainChange)return;const plan=terrainChange;tiles=plan.tiles.map(next=>{const old=tiles.find(t=>t.x===next.x&&t.y===next.y);if(!old)return next;for(const key of Object.keys(old))if(!(key in next))delete old[key];return Object.assign(old,next);});turrets=plan.turrets;terrainChange=null;renderer.sceneKey=null;
 for(const c of plan.changes)burst(c.x,c.y,c.removed?'#c8f2dc':'#ddf477',15);updateUI();
}
function applyTerrainReward(u){
 if(u.key==='floor')addFloor(u.amount);else if(u.key==='erase'){for(let i=0;i<u.amount;i++)eraseNegative();}
 else if(['medical','shield','cashTile','shockTile','coverTile'].includes(u.key)){for(let i=0;i<u.amount;i++)({medical:addMedical,shield:addShield,cashTile:addCashTile,shockTile:addShockTile,coverTile:addCoverTile})[u.key]();}
 if(u.penalty==='turret')addTurret();else if(u.penalty==='laserTurret')addTurret('laser');else if(u.penalty==='trap')addTrap();else if(u.penalty==='saw')addSaw();else if(u.penalty==='orbitSaw')addSaw(true);else if(u.penalty==='flywheel')addFlywheel();
}
function settlementTerrainEvent(){
 const event=()=>{terrainChange=planTerrainChange(()=>eraseNegative());return '减少陷阱 ×1';};event.terrain=true;return event;
}
function updateLandingTerrain(dt){
 if(!shopTerrainPlan&&!terrainChange)return false;
 if(!terrainChange){terrainChange=shopTerrainPlan;shopTerrainPlan=null;terrainChange.age=0;$('status').textContent='场地调整';$('wave').textContent='地块与机关更新';return true;}
 terrainChange.age+=Math.max(0,dt);
 if(terrainChange.age+1e-9>=TERRAIN_FLASH_TIME){finishTerrainChange();shopErasePending=0;startWave();}
 return true;
}
function drawTerrainChange(){
 if(!terrainFlashOn())return;const r=renderer;
 for(const c of terrainChange.changes){const x=c.x-325,z=(c.y-300)*1.06,col=c.removed?'#ffb58a':'#b6ffe0';r.emissiveBox(x,4.4,z,TILE-3,.5,TILE*1.06-3,col);r.ring(x,5,z,20,col,2);if(!c.removed&&c.kind==='medical'){r.emissiveBox(x,5,z,24,1,7,'#ffffff');r.emissiveBox(x,5,z,7,1,24,'#ffffff');}}
}
let greedRoom=null;const GREED_TIME=15,GREED_COUNT=5;
let survivalRemaining=0,bossIntroLeft=0,introMode='boss';const SURVIVAL_TIME=20,NORMAL_ROOM_TIME=30,NORMAL_SPAWN_INTERVAL=3,NORMAL_SPAWN_FINALE=2,NORMAL_EMPTY_WAVE_DELAY=.35;let timedRoom=null;const BOSS_INTRO_TIME=1.6,SURVIVAL_INTRO_TIME=.75,BOSS_SLOW=.18;
let spectrumHits=[],hitSoundAt=-Infinity;
let explosionFX=[],fireworkSerial=0;const FIREWORK_STYLES=[0,1,3,4,6];
let cashPopups=[],chaserTimer=.65,chaserSerial=0,chaserSpawned=0;const CHASER_CAP=10;
let p,mods,cash=0,shopItems=[],shopRefreshes=0,shopLevel=1;const SHOP_MAX_LEVEL=5;const keys={},joy={x:0,y:0,id:null};
const SCREEN_PITCH=720;let wallScrollStart=0;
const zones=['遗弃车间','熔炉回廊','血色机房','深渊核心'];
const upgrades=[{name:'轻量骨架',desc:'移速 +15%',key:'speed',amount:.15},{name:'应急修复',desc:'回复 2 格生命',key:'heal',amount:2},{name:'生命核心 +1',desc:'生命上限 +1，回复 1 格',key:'maxhp',amount:1}];
// Drinks are run passives. Each bottle owns its wager and settles once, after a completed room.
const DRINK_TYPES=[
 {id:'crab',name:'青蟹莫吉托',rooms:2,price:18,color:'#79e4be',cost:'下2个房间只能横向移动',gift:'主武器向左右两侧各复制一次完整攻击'},
 {id:'belladonna',name:'贝拉多娜',rooms:3,price:18,color:'#b797ed',cost:'下3个房间移动操作完全反转',gift:'主武器向射击方向正后方复制一次完整攻击'},
 {id:'lead',name:'灌铅苦艾',rooms:2,price:14,color:'#acbba4',cost:'下2个房间敌方实体子弹半径×1.5',gift:'主武器实体子弹半径×1.5，伤害+15%'},
 {id:'godfather',name:'翩翩教父',rooms:2,price:18,color:'#e9b477',cost:'下2个房间敌方实体弹速+40%',gift:'持续移动3秒：主武器攻速+100%；停下2秒消退'},
 {id:'glass',name:'琉璃伏特加',rooms:1,price:24,color:'#9ce7ff',cost:'下一房间受到有效伤害立即死亡，护盾不能抵挡',gift:'4个轨迹幻影，各复制主武器50%伤害；一击碎裂，每房间重生'},
 {id:'lonely',name:'落寞香槟',rooms:3,price:14,color:'#dfcda4',cost:'下3个房间最终移速-25%',gift:'主武器暴击率+25个百分点'},
 {id:'iron',name:'铁屑拉格',rooms:3,price:18,color:'#a0b6bc',cost:'下3个房间增加2个斜向碰壁反弹飞轮',gift:'3个环绕护卫飞轮：切割敌人、拦截实体子弹'},
 {id:'caramel',name:'焦糖威士忌',rooms:3,price:16,color:'#e8a660',cost:'下3个房间敌人死亡留下燃烧地，预警0.5秒、燃烧5秒',gift:'主武器命中减速25%并灼烧3秒，重复命中刷新'},
 {id:'salt',name:'海盐世涛',rooms:2,price:18,color:'#adc5e3',cost:'立即清空护盾，下2个房间无法获得护盾',gift:'每房间3颗盐晶，各抵挡一次伤害并喷射穿透碎片'},
 {id:'bit',name:'比特吗啡',rooms:3,price:20,color:'#e58dd9',cost:'立即永久失去1格生命上限；下3个房间敌方弹速+40%',gift:'主武器伤害/攻速+25%，暴击率+15个百分点，暴击倍率+0.5'},
 {id:'redcap',name:'小红帽',rooms:3,price:18,color:'#ed7777',cost:'下3个房间所有敌人死亡预警0.6秒后尸爆',gift:'主武器命中生成持续3秒的毒雾，共享冷却2秒'},
 {id:'clown',name:'迷路小丑',rooms:2,price:18,color:'#c8a2ee',cost:'下2个房间仅看清周围3格，3.5格以外完全纯黑',gift:'主武器暴击率+20个百分点，暴击倍率+1.0'},
 {id:'ale',name:'艾尔激流',rooms:2,price:14,color:'#7ed3df',cost:'下2个房间玩家外观与受击半径×1.5',gift:'商店等级+1（最高5级）'},
 {id:'hive',name:'蜂巢蜜酒',rooms:0,permanent:true,price:18,color:'#edcb70',cost:'本局普通怪增援数量+50%，正常掉落赏金',gift:'立即获得击杀连锁闪电，最多跳跃3个敌人'},
 {id:'hound',name:'猎犬波本',rooms:0,permanent:true,price:16,color:'#d4a07c',cost:'本局普通怪移动速度+30%，攻击频率不变',gift:'立即获得移动速度+20%'},
 {id:'longnight',name:'长夜金酒',rooms:0,permanent:true,price:20,color:'#94c9e7',cost:'本局限时房间时长+30%，延长普通层刷怪和补给生产',gift:'每8秒使全场敌人、敌弹和机关半速2秒，玩家行动正常'}
];
let drinkNightClock=0,drinkChaserCredit=0;
function drinkRoomDuration(base){return base*(1+.3*drinkRewardCount('longnight'));}
function drinkMonsterSpeed(){return 1+.3*drinkRewardCount('hound');}
function drinkNightPeriod(){return 8/Math.min(4,Math.max(1,drinkRewardCount('longnight')));}
function drinkNightActive(){const period=drinkNightPeriod();return drinkRewardCount('longnight')>0&&['combat','survival'].includes(state)&&drinkNightClock>=period&&drinkNightClock%period<Math.min(2,period/2);}
// Integrate the active part of the real-time interval, including frames that cross a pulse boundary.
function advanceDrinkNight(dt){
 if(paused||!drinkRewardCount('longnight')||!['combat','survival'].includes(state))return 1;
 const period=drinkNightPeriod(),window=Math.min(2,period/2),integral=t=>t<period?0:Math.floor(t/period-1)*window+Math.min(window,t%period),old=drinkNightClock;
 drinkNightClock+=Math.max(0,dt);return dt>0?1-.5*(integral(drinkNightClock)-integral(old))/dt:drinkNightActive()?.5:1;
}
let drinkBottles=[],drinkRoomFloor=-1,drinkRoomReady=false,drinkDance=0,drinkPath=[],drinkPathDistance=0,drinkGhosts=[],drinkWheels=[],drinkZones=[],drinkPoisonLeft=0,drinkSalt=0,drinkGuardClock=0,drinkDeaths=new WeakSet(),drinkRotorCopies=new WeakMap();
function drinkRewardCount(id){return drinkBottles.filter(b=>b.id===id&&b.done).length;}
function drinkPenaltyCount(id){return ['combat','survival'].includes(state)?drinkBottles.filter(b=>b.id===id&&!b.done&&b.activeFloor===floor).length:0;}
function drinkDefinition(id){return DRINK_TYPES.find(d=>d.id===id);}
function drinkShopItem(id){const d=drinkDefinition(id);return d?{key:'drink',drinkId:d.id,name:d.name,desc:(d.permanent?'本局醉酒效果：':'醉酒效果：')+d.cost+'。'+(d.permanent?'增益：':'醒酒：')+d.gift+'。',amount:1,price:shopPrice({key:'drink',drinkId:d.id})}:null;}
function drinkUsable(id){const d=drinkDefinition(id);if(!d||floor+d.rooms>CAMPAIGN_BOSSES.length*(ROUNDS_PER_BOSS+1))return false;if(id==='bit'&&drinkPermanentBaseHp()<2)return false;if(id==='ale'&&shopLevel+drinkBottles.filter(b=>b.id==='ale'&&!b.done).length>=SHOP_MAX_LEVEL)return false;return true;}
function drinkPermanentBaseHp(){return p.max-(armor?.maxHp||0);}
function consumeDrink(id){
 if(!drinkUsable(id))return false;const d=drinkDefinition(id);
 drinkBottles.push({id,left:d.rooms,boughtFloor:floor,activeFloor:-1,done:!!d.permanent});
 if(id==='bit'){p.max--;p.hp=Math.min(p.hp,p.max);}if(id==='salt')p.shield=0;
 if(d.permanent)toast(drinkAwakeText(id),3);updateUI();return true;
}
function resetDrinks(){drinkChaserCredit=0;drinkNightClock=0;drinkBottles=[];drinkRoomFloor=-1;drinkRoomReady=false;drinkDance=0;drinkPath=[];drinkPathDistance=0;drinkGhosts=[];drinkWheels=[];drinkZones=[];drinkPoisonLeft=0;drinkSalt=0;drinkGuardClock=0;drinkDeaths=new WeakSet();drinkRotorCopies=new WeakMap();$('drink-darkness').style.display='none';$('drinks-hud').hidden=true;}
function startDrinkRoom(){
 if(drinkRoomFloor===floor)return;drinkRoomFloor=floor;drinkRoomReady=false;drinkChaserCredit=0;drinkNightClock=0;drinkDance=0;drinkPoisonLeft=0;drinkGuardClock=0;drinkPathDistance=0;
 drinkPath=[{x:p.x,y:p.y,distance:0}];drinkGhosts=[];drinkZones=[];drinkWheels=[];drinkDeaths=new WeakSet();
 for(const b of drinkBottles)if(!b.done&&b.boughtFloor<floor)b.activeFloor=floor;
 drinkSalt=3*drinkRewardCount('salt');
 for(let i=0;i<4*drinkRewardCount('glass');i++)drinkGhosts.push({x:p.x,y:p.y,index:i,r:9,alive:true,ready:false,cool:0});
 renderDrinkStatus();
}
function settleDrink(b){
 if(b.done||b.activeFloor!==floor)return '';b.left--;b.activeFloor=-1;
 if(b.left>0)return '';
 b.done=true;if(b.id==='ale')shopLevel=Math.min(SHOP_MAX_LEVEL,shopLevel+1);
 return drinkAwakeText(b.id);
}
function drinkAwakeText(id){return ({crab:'两侧追加攻击',belladonna:'反向追加攻击',lead:'子弹变大 · 伤害增加',godfather:'移动提升攻速',glass:'获得玻璃幻影',lonely:'暴击率增加',iron:'获得护卫飞轮',caramel:'攻击附带灼烧、减速',salt:'获得盐晶护盾',bit:'伤害、攻速、暴击增加',redcap:'攻击触发毒雾',clown:'暴击率、暴击伤害增加',ale:'商店等级增加',hive:'击杀触发连锁闪电',hound:'移动速度增加',longnight:'获得周期减速'})[id]||'';}
function drinkSettlementEvents(){const events=[];for(const b of drinkBottles.filter(b=>!b.done&&b.activeFloor===floor)){if(b.left>1)settleDrink(b);else events.push(()=>settleDrink(b));}return events;}
function finishDrinkRoom(){terrainEndRoom();drinkZones=[];drinkWheels=[];drinkGhosts=[];drinkDance=0;turrets=turrets.filter(t=>!t.drinkTurret);$('drink-darkness').style.display='none';}
function drinkMovement(mx,my){if(drinkPenaltyCount('belladonna')){mx=-mx;my=-my;}if(drinkPenaltyCount('crab'))my=0;return {mx,my};}
function drinkPlayerScale(){return Math.pow(1.5,drinkPenaltyCount('ale'));}
function drinkPlayerRadius(){return 4*drinkPlayerScale();}
function drinkDamageBonus(){return .25*drinkRewardCount('bit');}
function drinkAttackSpeedBonus(){return .25*drinkRewardCount('bit')+drinkDance;}
function drinkCritBonus(){return .25*drinkRewardCount('lonely')+.15*drinkRewardCount('bit')+.2*drinkRewardCount('clown');}
function drinkCritMultiplierBonus(){return .5*drinkRewardCount('bit')+drinkRewardCount('clown');}
function drinkWeaponSource(s){return s.source==='weapon'||s.source==='glass';}
function decorateDrinkShot(s){
 if(!drinkWeaponSource(s))return;
 s.damage*=1+drinkDamageBonus();
 s.critChance=Math.min(1,(s.critChance||0)+drinkCritBonus());s.critMultiplier=(s.critMultiplier||2)+drinkCritMultiplierBonus();
 if(!s.beam){s.drinkScale=Math.pow(1.5,drinkRewardCount('lead'));s.hitRadius=(s.hitRadius??4)*s.drinkScale;s.damage*=1+.15*drinkRewardCount('lead');if(s.waveRadius)s.waveRadius*=s.drinkScale;}
}
// Duplicate the original volley, not emitters: Uzi auto-aim and vertical seeker launches retain their shape.
function copyDrinkVolley(originals,origin,angle,variant=angle){
 const cs=Math.cos(angle),sn=Math.sin(angle),point=(x,y)=>({x:origin.x+(x-origin.x)*cs-(y-origin.y)*sn,y:origin.y+(x-origin.x)*sn+(y-origin.y)*cs});
 const sharedHits=new Map(),cooldowns=new Map();
 for(const s of originals){const q={...s,...point(s.x,s.y),drinkCopy:true,hitTargets:new Set(),homingTarget:null,curve:null,patrol:null};
  q.vx=s.vx*cs-s.vy*sn;q.vy=s.vx*sn+s.vy*cs;
  if(s.originX!==undefined){const at=point(s.originX,s.originY);q.originX=at.x;q.originY=at.y;}
  if(s.aim!==undefined)q.aim=s.aim+angle;if(s.angle!==undefined)q.angle=s.angle+angle;
  if(s.hitTargets){if(!sharedHits.has(s.hitTargets))sharedHits.set(s.hitTargets,new Set());q.hitTargets=sharedHits.get(s.hitTargets);}
  if(s.rotorCooldowns){let copies=drinkRotorCopies.get(s.rotorCooldowns);if(!copies){copies=new Map();drinkRotorCopies.set(s.rotorCooldowns,copies);}if(!copies.has(variant))copies.set(variant,new WeakMap());cooldowns.set(s.rotorCooldowns,copies.get(variant));q.rotorCooldowns=cooldowns.get(s.rotorCooldowns);}
  if(s.arc&&!s.radial){
   const heading=(s.points?.length>1?Math.atan2(s.points[1].y-origin.y,s.points[1].x-origin.x):0)+angle;
   const targets=combatTargets().filter(e=>(e.x-origin.x)*Math.cos(heading)+(e.y-origin.y)*Math.sin(heading)>0).sort((a,b)=>Math.hypot(a.x-origin.x,a.y-origin.y)-Math.hypot(b.x-origin.x,b.y-origin.y));
   q.arcTargets=[];let at=origin;while(targets.length&&q.arcTargets.length<3){targets.sort((a,b)=>Math.hypot(a.x-at.x,a.y-at.y)-Math.hypot(b.x-at.x,b.y-at.y));const e=targets.shift();if(q.arcTargets.length&&Math.hypot(e.x-at.x,e.y-at.y)>120)break;q.arcTargets.push(e);at=e;}q.points=[{x:origin.x,y:origin.y},...q.arcTargets.map(e=>({x:e.x,y:e.y}))];if(q.points.length===1)q.points.push({x:origin.x+Math.cos(heading)*100,y:origin.y+Math.sin(heading)*100});Object.assign(q,q.points.at(-1));
  }else if(s.points)q.points=s.points.map(t=>point(t.x,t.y));
  if(s.slash)q.arcTargets=[];
  shots.push(q);
 }
}
function applyDrinkVolley(start,origin,source){globalThis.TalentRuntime?.decorate(start,source==='drone'?drone:weapon,source);
 const originals=shots.slice(start);for(const s of originals){decorateDrinkShot(s);if(source==='glass')s.drinkOrigin=origin;}
 if(source!=='weapon')return;
 for(let i=0;i<drinkRewardCount('crab');i++){copyDrinkVolley(originals,origin,-Math.PI/2,'left'+i);copyDrinkVolley(originals,origin,Math.PI/2,'right'+i);}
 for(let i=0;i<drinkRewardCount('belladonna');i++)copyDrinkVolley(originals,origin,Math.PI,'back'+i);
}
function onDrinkHit(s,e,damage){if(s.terrainShot)return;
 if(!drinkWeaponSource(s)||s.drinkDot||damage<=0)return;
 if(drinkRewardCount('caramel')){e.drinkBurnUntil=time+3;e.drinkBurnDamage=Math.max(.2,(s.damage||1)*.2*drinkRewardCount('caramel'));e.drinkBurnTick??=time;e.drinkSlowUntil=time+3;}
 if(drinkRewardCount('redcap')&&drinkPoisonLeft<=0){drinkPoisonLeft=2;addDrinkZone('poison',e.x,e.y,TILE,0,3,Math.max(.5,(s.damage||1)*.35)*drinkRewardCount('redcap'));}
}
function addDrinkZone(kind,x,y,r,warning,life,damage=0){
 const existing=drinkZones.find(z=>z.kind===kind&&Math.hypot(z.x-x,z.y-y)<r*.35);
 if(existing&&kind!=='corpse'){existing.life=Math.max(existing.life,warning+life);existing.damage=Math.max(existing.damage,damage);return existing;}
 const z={kind,x,y,r,age:0,warning,life:warning+life,damage,tick:0};drinkZones.push(z);return z;
}
function onDrinkEnemyDeath(e){
 if(e.type==='rocket'||drinkDeaths.has(e))return;drinkDeaths.add(e);
 if(drinkRewardCount('hive')){const targets=arcChain(e);if(targets.length){const end=targets.at(-1);shots.push({beam:true,arc:true,arcTargets:targets,points:[{x:e.x,y:e.y},...targets.map(q=>({x:q.x,y:q.y}))],originX:e.x,originY:e.y,x:end.x,y:end.y,vx:0,vy:0,life:.18,damage:weapon.damage*.6*drinkRewardCount('hive'),critChance:0,critMultiplier:2,pierce:3,hitTargets:new Set(),damageApplied:false,color:FRIENDLY_SHOT_COLOR,source:'drink',drinkDot:true,weaponId:'hive',height:12});}}

 if(drinkPenaltyCount('caramel'))addDrinkZone('fire',e.x,e.y,TILE,.5,5);
 if(drinkPenaltyCount('redcap'))addDrinkZone('corpse',e.x,e.y,TILE*.85,.6,.15);
}
function drinkRadialDamage(x,y,r,damage,weaponId='drink'){const targets=combatTargets().filter(e=>Math.hypot(e.x-x,e.y-y)<e.r+r);if(!targets.length)return;shots.push({beam:true,arc:true,radial:true,arcTargets:targets,originX:x,originY:y,x,y,vx:0,vy:0,life:.05,damage,critChance:0,critMultiplier:2,pierce:Infinity,hitTargets:new Set(),damageApplied:false,source:'drink',drinkDot:true,weaponId,radius:r,height:8});}
function drinkGuardPositions(){return Array.from({length:3*drinkRewardCount('iron')},(_,i)=>{const a=time*2.3+i*TAU/(3*drinkRewardCount('iron'));return {x:p.x+Math.cos(a)*58,y:p.y+Math.sin(a)*58,r:19};});}
function drinkInterceptDamage(){
 if(drinkPenaltyCount('glass')){p.shield=0;p.hp=0;return false;}
 if(drinkSalt<=0)return false;drinkSalt--;p.inv=damageInvincibility();
 for(let i=0;i<12;i++){const a=i*TAU/12;shots.push({x:p.x,y:p.y,vx:Math.cos(a)*600,vy:Math.sin(a)*600,damage:weapon.damage,life:1.5,pierce:99,hitTargets:new Set(),source:'drink',weaponId:'salt',color:'#b9eeff',height:16});}
 burst(p.x,p.y,'#c8efff',18);updateUI();return true;
}
function breakDrinkGhost(g){if(!g.alive)return;g.alive=false;burst(g.x,g.y,'#a9e9ff',18);renderDrinkStatus();}
function drinkBulletBlock(b,oldX,oldY){
 const playerHit=segmentHits(oldX,oldY,b.x,b.y,{x:p.x,y:p.y,r:drinkPlayerRadius()},b.r),playerDistance=Math.hypot(p.x-oldX,p.y-oldY);
 for(const w of drinkGuardPositions())if((!playerHit||Math.hypot(w.x-oldX,w.y-oldY)<=playerDistance)&&segmentHits(oldX,oldY,b.x,b.y,w,b.r)){b.life=0;burst(b.x,b.y,'#b7eaff',3);return true;}
 for(const g of drinkGhosts)if(g.alive&&g.ready&&(!playerHit||Math.hypot(g.x-oldX,g.y-oldY)<=playerDistance)&&segmentHits(oldX,oldY,b.x,b.y,g,b.r)){b.life=0;breakDrinkGhost(g);return true;}
 return false;
}
function prepareDrinkBullet(b){if(b.drinkPrepared)return;b.drinkPrepared=true;const size=Math.pow(1.5,drinkPenaltyCount('lead')),speed=1+.4*(drinkPenaltyCount('godfather')+drinkPenaltyCount('bit'));b.r*=size;b.drawRadius=(b.drawRadius??b.r/size)*size;b.vx*=speed;b.vy*=speed;}
function recordDrinkPath(distance){
 if(!drinkGhosts.length||distance<1e-7)return;drinkPathDistance+=distance;drinkPath.push({x:p.x,y:p.y,distance:drinkPathDistance});
 const keep=(drinkGhosts.length+2)*36;while(drinkPath.length>2&&drinkPath[1].distance<drinkPathDistance-keep)drinkPath.shift();
 for(const g of drinkGhosts){const wanted=drinkPathDistance-(g.index+1)*36;if(wanted<0)continue;g.ready=true;let index=1;while(index<drinkPath.length-1&&drinkPath[index].distance<wanted)index++;const a=drinkPath[index-1],b=drinkPath[index],t=Math.max(0,Math.min(1,(wanted-a.distance)/(b.distance-a.distance||1)));g.x=a.x+(b.x-a.x)*t;g.y=a.y+(b.y-a.y)*t;}
}
function drinkGhostInDanger(g){
 if(enemies.some(e=>isAttackable(e)&&Math.hypot(e.x-g.x,e.y-g.y)<e.r+g.r))return true;
 if(drinkZones.some(z=>z.kind!=='poison'&&z.age>=z.warning&&Math.hypot(z.x-g.x,z.y-g.y)<z.r+g.r))return true;
 if(drinkWheels.some(w=>w.warning<=0&&Math.hypot(w.x-g.x,w.y-g.y)<w.r+g.r))return true;
 if(tiles.some(t=>t.trap&&trapPhase(t)==='active'&&Math.abs(g.x-325-t.x*TILE)<TILE/2&&Math.abs(g.y-300-t.y*TILE)<TILE/2||t.flywheel&&Math.hypot(g.x-t.flywheel.x,g.y-t.flywheel.y)<FLYWHEEL_RADIUS+g.r||t.saw&&Math.hypot(g.x-sawPosition(t).x,g.y-sawPosition(t).y)<25+g.r))return true;
 if([...turrets,...enemies].some(e=>e.laserMode==='firing'&&segmentHits(e.x,e.y,e.x+Math.cos(e.aim)*beamLength(e),e.y+Math.sin(e.aim)*beamLength(e),g,5)))return true;
 if(hazards.some(h=>h.t>1.1&&h.t<1.5&&Math.hypot(g.x-h.x,g.y-h.y)<33+g.r))return true;
 if(humanoidBoss?.crimsonRockets?.some(m=>m.impacted&&m.age<m.flight+5&&Math.hypot(g.x-m.x,g.y-m.y)<m.r+g.r))return true;
 if(humanoidBoss?.crimson&&humanoidBoss.slash?.kind==='laser'&&humanoidBoss.slash.firing&&typeof crimsonLaserRay==='function'){const q=crimsonLaserRay(humanoidBoss);if(segmentHits(q.x,q.y,q.endX,q.endY,g,7))return true;}
 return false;
}
function updateDrinks(dt,distance=0,enemyDt=dt){
 if(paused||!['combat','survival'].includes(state))return;
 if(!drinkRoomReady){drinkRoomReady=true;for(let i=0;i<2*drinkPenaltyCount('iron');i++){const a=i*Math.PI+.6;drinkWheels.push({x:A.x+50+(i%2)*(A.w-100),y:A.y+65+(i%2)*(A.h-130),vx:Math.cos(a)*170,vy:Math.sin(a)*170,r:25,warning:1});}}
 drinkPoisonLeft=Math.max(0,drinkPoisonLeft-dt);drinkGuardClock-=dt;
 if(drinkPenaltyCount('salt'))p.shield=0;
 drinkDance=drinkRewardCount('godfather')?Math.max(0,Math.min(drinkRewardCount('godfather'),drinkDance+(distance>1e-6?dt/3:-dt/2))):0;
 recordDrinkPath(distance);
 for(const w of drinkWheels){if(w.warning>0){w.warning-=enemyDt;continue;}for(const axis of ['x','y']){const speed=axis==='x'?'vx':'vy',lo=(axis==='x'?A.x:A.y)+w.r,hi=(axis==='x'?A.x+A.w:A.y+A.h)-w.r,span=hi-lo,travel=w[axis]-lo+w[speed]*enemyDt,period=((travel%(span*2))+span*2)%(span*2);w[axis]=lo+(period<=span?period:span*2-period);if(travel<0||travel>span)w[speed]*=Math.floor(travel/span)%2?-1:1;}
  if(segmentHits(w.x-w.vx*enemyDt,w.y-w.vy*enemyDt,w.x,w.y,{x:p.x,y:p.y,r:drinkPlayerRadius()},w.r))hurt(w);if(state==='dead')return;
 }
 for(const z of drinkZones){const old=z.age;z.age+=z.kind==='poison'?dt:enemyDt;if(z.age<z.warning)continue;
  if(z.kind==='poison'){z.tick-=Math.max(0,z.age-Math.max(old,z.warning));if(z.tick<=0){z.tick+=.5;drinkRadialDamage(z.x,z.y,z.r,z.damage,'poison');}}
  else if(Math.hypot(p.x-z.x,p.y-z.y)<z.r+drinkPlayerRadius())hurt(z);
  if(z.kind==='corpse'&&old<z.warning&&z.age>=z.warning)spawnExplosionFX(z.x,z.y,z.r);
  if(state==='dead')return;
 }
 drinkZones=drinkZones.filter(z=>z.age<z.life);
 for(const e of enemies){if(e.hp<=0)onDrinkEnemyDeath(e);else if(e.drinkBurnUntil>time&&time>=(e.drinkBurnTick??0)){e.drinkBurnTick=time+.5;drinkRadialDamage(e.x,e.y,1,e.drinkBurnDamage,'burn');}}
 if(drinkGuardClock<=0&&drinkRewardCount('iron')){drinkGuardClock=.25;for(const w of drinkGuardPositions())drinkRadialDamage(w.x,w.y,w.r,weapon.damage*.5,'guardwheel');}
 for(const g of drinkGhosts){if(!g.alive||!g.ready)continue;if(drinkGhostInDanger(g)){breakDrinkGhost(g);continue;}if(state!=='combat')continue;g.cool-=dt*attackSpeedMultiplier();const targets=combatTargets();if(g.cool<=0&&targets.length){const target=targets.reduce((a,b)=>Math.hypot(a.x-g.x,a.y-g.y)<Math.hypot(b.x-g.x,b.y-g.y)?a:b);const w={...weapon,damage:weapon.damage*.5,meleeDamage:weapon.meleeDamage*.5};emitWeaponShots(w,Math.atan2(target.y-g.y,target.x-g.x),g,'glass');g.cool=weapon.interval;}}
}
function renderDrinkStatus(){
 const el=$('drinks-hud');el.hidden=!drinkBottles.length||['menu','dead','won'].includes(state);if(el.hidden)return;
 const pending=drinkBottles.filter(b=>!b.done),awake=drinkBottles.filter(b=>b.done);
 el.innerHTML='<summary>特调 '+awake.length+'醒 / '+pending.length+'醉</summary><div>'+drinkBottles.map(b=>'<p style="--drink-color:'+drinkDefinition(b.id).color+'"><b>'+drinkDefinition(b.id).name+'</b><span>'+(b.done?(drinkDefinition(b.id).permanent?'本局醉酒效果：'+drinkDefinition(b.id).cost+'；':'')+drinkDefinition(b.id).gift:'醉酒效果剩余'+b.left+'房间 · '+drinkDefinition(b.id).cost)+'</span></p>').join('')+'</div>';
}
function drinkProject(x,y,height=8){const v=renderer.vp,xx=x-325,z=(y-300)*1.06,w=v[3]*xx+v[7]*height+v[11]*z+v[15];return {x:((v[0]*xx+v[4]*height+v[8]*z+v[12])/w*.5+.5)*100,y:(1-(v[1]*xx+v[5]*height+v[9]*z+v[13])/w)*50};}
function renderDrinkDarkness(){
 const el=$('drink-darkness');el.style.display=drinkPenaltyCount('clown')?'block':'none';if(!drinkPenaltyCount('clown'))return;
 const clearRadius=3*TILE,outerRadius=clearRadius+.5*TILE;
 const center=drinkProject(p.x,p.y),edge=drinkProject(p.x+outerRadius,p.y),back=drinkProject(p.x,p.y+outerRadius),rx=Math.max(1,Math.abs(edge.x-center.x)),ry=Math.max(1,Math.abs(back.y-center.y));
 el.style.background=`radial-gradient(ellipse ${rx}% ${ry}% at ${center.x}% ${center.y}%, transparent 0%, transparent ${clearRadius/outerRadius*100}%, #000 100%)`;
}
function drawDrinkSaw(w,friendly=false){const r=renderer,x=w.x-325,z=(w.y-300)*1.06,c=friendly?'#a8f2ff':'#ffae65';r.residentMesh('drink:saw',()=>{r.disc(0,0,0,1,'#b5c7c9');r.ring(0,.02,0,.7,'#354b53',.1);for(let i=0;i<12;i++){const a=i*TAU/12;r.box(Math.cos(a)*.93,.06,Math.sin(a)*.93,.36,.12,.2,'#e1f5ef',-a);}},monsterPose(x,10,z,time*8,w.r,10,w.r));r.glow(x,12,z,5,c);}
function drawDrinks(){
 if(!['combat','survival'].includes(state))return;const r=renderer;if(drinkNightActive())r.emissiveRing(p.x-325,3,(p.y-300)*1.06,TILE*2.5,'#91d5ff',2);
 for(const z of drinkZones){const x=z.x-325,zz=(z.y-300)*1.06,c=z.kind==='poison'?'#64ce7d':z.kind==='fire'?'#e53a43':'#ff9762';if(z.age<z.warning){r.emissiveRing(x,3.5,zz,z.r,c,2);continue;}
  const fade=Math.min(1,(z.life-z.age)/.5);r.residentMesh('drink:ground:'+z.kind,()=>{const start=r.count;r.disc(0,0,0,1,c);r.markEmissive(start);},monsterPose(x,3.3,zz,0,z.r*fade,1,z.r*fade));
  if(z.kind==='fire'&&typeof drawCrimsonFireCircle==='function'){for(let i=0;i<5;i++){const phase=(z.age*.65+i*.21)%1,a=i*2.399;drawCrimsonFireCircle(x+Math.cos(a)*z.r*.4,6+phase*26,zz+Math.sin(a)*z.r*.4,z.r*.35*(1-phase*.5),c,'drink:fire-circle');}}
  else if(z.kind==='poison'){for(let i=0;i<4;i++){const a=i*2.4+z.age*.3;r.glow(x+Math.cos(a)*z.r*.5,12+i*4,zz+Math.sin(a)*z.r*.5,z.r*.4,c);}}
 }
 for(const w of drinkWheels){if(w.warning>0)r.emissiveRing(w.x-325,4,(w.y-300)*1.06,w.r+6,'#ff9a63',2);else drawDrinkSaw(w);}
 for(const w of drinkGuardPositions())drawDrinkSaw(w,true);
 for(const g of drinkGhosts)if(g.alive&&g.ready){r.residentMaterial('drink:glass-ghost',()=>{r.box(0,18,0,18,22,14,'#72b8cd');r.box(0,39,0,27,22,21,'#b1eafa');r.emissiveBox(-6,40,11,5,5,2,'#d8fcff');r.emissiveBox(6,40,11,5,5,2,'#d8fcff');for(const side of [-1,1]){r.box(side*7,5,0,9,9,12,'#6199b5');r.box(side*13,20,0,6,13,8,'#9ed5ee');}},monsterPose(g.x-325,0,(g.y-300)*1.06),.6,1,time);}
 for(let i=0;i<drinkSalt;i++){const a=time*.8+i*TAU/Math.max(1,drinkSalt),x=p.x-325+Math.cos(a)*36,z=(p.y-300+Math.sin(a)*36)*1.06;r.residentMesh('drink:salt-crystal',()=>r.sphere(0,0,0,1,'#d5f0ff',.6,1,.6,3,4),monsterPose(x,24,z,time,7,12,7));}
}
function scaleDrinkPlayer(start,glowStart,scale=drinkPlayerScale(),x=p.x-325,z=(p.y-300)*1.06,height=0){if(scale===1)return;const r=renderer;for(let i=start;i<r.count;i+=9){r.data[i]=x+(r.data[i]-x)*scale;r.data[i+1]=height+(r.data[i+1]-height)*scale;r.data[i+2]=z+(r.data[i+2]-z)*scale;}for(let i=glowStart;i<r.projectileCount;i+=7){r.projectiles[i]=x+(r.projectiles[i]-x)*scale;r.projectiles[i+1]=height+(r.projectiles[i+1]-height)*scale;r.projectiles[i+6]*=scale;r.projectiles[i+2]=z+(r.projectiles[i+2]-z)*scale;}}
function takeTestDrink(id,awake=false){
 if(!drinkDefinition(id))return false;if(['menu','dead','won'].includes(state)){reset();togglePause();$('equipment-test').hidden=false;testResume=true;}
 if(awake&&drinkDefinition(id).permanent){if(!consumeDrink(id))return false;}else if(awake){const d=drinkDefinition(id);if(id==='ale'&&shopLevel>=SHOP_MAX_LEVEL)return false;const b={id,left:1,activeFloor:floor,done:false};drinkBottles.push(b);settleDrink(b);drinkRoomFloor=-1;startDrinkRoom();}
 else if(!consumeDrink(id))return false;
 testMode=true;$('test-open').textContent='测试中 · 装备';$('test-result').textContent=awake?drinkAwakeText(id):drinkDefinition(id).name+' · 下个房间开始生效醉酒效果';updateUI();return true;
}
const WEAPON_GRADES=[null,{name:'普通',color:'#a8b7b5'},{name:'改良',color:'#78c997'},{name:'精良',color:'#6daee9'},{name:'史诗',color:'#be8fdf'},{name:'传奇',color:'#e8b565'}];
const WEAPON_CATALOG=[{id:'pulse',name:'脉冲手枪',damage:1,interval:.19,pellets:1,speed:680,spread:0,pierce:1,desc:'单发射击'},{id:'smg',name:'蜂鸣冲锋枪',damage:.38,interval:.065,pellets:1,speed:900,spread:0,pierce:1,desc:'高速连射'},{id:'rifle',name:'卫士步枪',damage:1.35,interval:.22,pellets:1,speed:1050,spread:0,pierce:1,desc:'单发连射'},{id:'sniper',name:'鹰眼狙击枪',critChance:.35,critMultiplier:2.5,damage:11,interval:.85,pellets:1,speed:1800,spread:0,pierce:1,desc:'单发射击'},{id:'magnum',name:'重锤马格南',damage:5.8,interval:.65,pellets:1,speed:1050,spread:0,pierce:1,desc:'单发射击'},{id:'twin',name:'双联机枪',damage:.8,interval:.3,pellets:2,speed:680,spread:0,pierce:1,desc:'双发并射'},{id:'shotgun',name:'撕裂霰弹枪',damage:.95,interval:.5,pellets:5,speed:680,spread:.035,pierce:1,desc:'5发散射'},{id:'rail',name:'穿透轨道枪',damage:5,interval:.62,pellets:1,speed:1250,spread:0,pierce:3,desc:'穿透3个目标'},{id:'rocket',name:'轰鸣火箭筒',damage:5.5,interval:.8,pellets:1,speed:500,spread:0,pierce:1,blastRadius:90,desc:'范围爆炸'},{id:'boomerang',name:'回旋十字刃',damage:2.2,interval:.7,pellets:1,speed:620,spread:0,pierce:99,returnRange:220,desc:'穿透；往返各命中1次'},{id:'tesla',name:'雷鸣电弧枪',damage:2.8,interval:.5,pellets:1,speed:0,spread:0,pierce:3,desc:'连锁3个目标，伤害递减'},{id:'laser',name:'棱镜激光枪',damage:1.8,interval:.42,pellets:1,speed:0,spread:0,pierce:4,desc:'瞬发；穿透4个目标'},{id:'rotor',name:'旋星机关枪',damage:2.2,interval:.06,pellets:1,speed:0,spread:0,pierce:99,rotationSpeed:.75,halfWidth:6,desc:'旋转穿透扫射'}];
WEAPON_CATALOG.push({id:'seeker',name:'寻迹飞弹发射器',damage:3.8,interval:.8,pellets:2,speed:450,spread:0,pierce:1,blastRadius:55,desc:'双发追踪；范围爆炸'});
WEAPON_CATALOG.push({id:'crescent',name:'弦月波发射器',damage:2.6,interval:.65,pellets:1,speed:560,spread:0,pierce:99,waveRadius:40,knockback:700,desc:'穿透；击退'});
WEAPON_CATALOG.push({id:'bee',name:'蜜蜂枪',damage:.8,interval:.7,pellets:5,speed:380,spread:.16,pierce:1,desc:'5只追踪蜜蜂；移动每格额外1只'});
WEAPON_CATALOG.push({id:'sword',name:'剑',damage:2.8,meleeDamage:4.5,interval:.325,pellets:1,speed:600,spread:0,pierce:99,waveRadius:36,slashRadius:80,desc:'挥砍＋穿透剑气，分别伤害'});
// Keep retired implementations available internally; only this roster is obtainable in play.
WEAPON_CATALOG.push({id:'uzi',name:'双手乌兹枪',damage:.38,interval:.065,pellets:2,speed:900,spread:0,pierce:1,desc:'双枪分别瞄准；单目标集火'});
WEAPON_CATALOG.push({id:'barrett',name:'巴雷特',critChance:.35,critMultiplier:2.5,damage:30,interval:1.4,pellets:1,speed:1800,spread:0,pierce:1,speedPenalty:.25,desc:'单发射击'});
const WEAPON_ROSTER=[['seeker','追踪飞弹'],['rocket','火箭筒'],['pulse','手枪'],['smg','冲锋枪'],['uzi','双手乌兹枪'],['rifle','步枪'],['sniper','狙击枪'],['barrett','巴雷特'],['laser','激光枪'],['tesla','电击枪'],['boomerang','回旋镖'],['bee','蜜蜂枪'],['sword','剑']];
for(const [id,name]of WEAPON_ROSTER)WEAPON_CATALOG.find(w=>w.id===id).name=name;
const WEAPON_TYPES=WEAPON_ROSTER.map(([id])=>WEAPON_CATALOG.find(w=>w.id===id));
const DRONE_TYPES=[...WEAPON_TYPES,{id:'chainsaw',name:'裂齿电锯无人机'}];
function createWeapon(id,tier=1){const base=WEAPON_CATALOG.find(w=>w.id===id)||WEAPON_CATALOG.find(w=>w.id==='pulse');tier=Math.max(1,Math.min(5,tier));return {critChance:0,critMultiplier:2,...base,tier,...(id==='rotor'?{forks:tier+2,desc:`${tier+2}叉旋转穿透扫射`}:{}),damage:Math.round(base.damage*(1+(tier-1)*.5)*100)/100,...(base.meleeDamage?{meleeDamage:Math.round(base.meleeDamage*(1+(tier-1)*.5)*100)/100}:{})}}
// Fixed-tier obtainable models. Legacy families remain available to mounts, drones and old fixtures.
const WEAPON_MODELS=[];
function registerWeaponModels(familyId,engineId,rows){for(const [tier,name,size,pellets,burst,fan,spikes,radius,chain,color,accent,trail]of rows)WEAPON_MODELS.push({id:familyId+'_t'+tier,familyId,engineId,tier,name,size,pellets,burst,fan,spikes,radius,chain,color,accent,trail});}
registerWeaponModels('pistol','pulse',[[1,'勤务手枪',1,1,1,0,0,0,0,'#ff9a38','#fff1aa',.04],[2,'哨兵手枪',1.25,1,1,0,0,0,0,'#ffc94a','#ffffff',.06],[3,'北极星',1.4,1,1,0,0,0,0,'#45cfff','#fff28b',.08],[4,'最后通牒',1.8,1,1,0,0,0,0,'#4acbff','#ffd060',.09]]);
registerWeaponModels('smg','smg',[[1,'街头冲锋枪',1,1,1,0,0,0,0,'#ff7043','#ffe8a0',.03],[2,'AK47',1.15,1,1,0,0,0,0,'#ffd84a','#ffffff',.045],[3,'加特林',1.35,1,1,0,0,0,0,'#35d9ff','#ffb34d',.06]]);
registerWeaponModels('uzi','uzi',[[2,'双手乌兹',1,2,1,0,0,0,0,'#ffb236','#fff0b0',.04],[4,'双生毒牙',1.5,2,1,0,0,0,0,'#50ddff','#ff60a8',.07]]);
registerWeaponModels('rifle','rifle',[[1,'制式卡宾枪',1,1,1,0,0,0,0,'#ffbc48','#fff1bc',.04],[3,'卫士卡宾枪',1.35,1,3,0,0,0,0,'#49ceff','#ffcb58',.06],[4,'破晓执行者',1.6,1,5,0,0,0,0,'#79e7ff','#ffd25e',.07]]);
registerWeaponModels('sniper','sniper',[[2,'猎人狙击枪',1,1,1,0,0,0,0,'#ff7948','#fff3c4',.07],[3,'巴雷特',1.65,1,1,0,0,0,0,'#ff4c45','#fff5cc',.1],[5,'天穹裁决',2.6,1,1,0,0,0,0,'#47cfff','#ffd061',.13]]);
registerWeaponModels('rocket','rocket',[[3,'轰鸣火箭筒',1,1,1,0,0,90,0,'#ff6538','#ffd36b',.12],[4,'蓝焰攻城炮',1.5,1,1,0,0,120,0,'#39bfff','#ffbd42',.16],[5,'恒星重炮',2.2,1,1,0,0,155,0,'#67deff','#ffd35a',.2]]);
registerWeaponModels('seeker','seeker',[[4,'天网追猎者',1,4,1,16,0,55,0,'#48cfff','#ffcf54',.1],[5,'群星追缉令',1.2,6,1,24,0,55,0,'#80eeff','#ff70b6',.12]]);
registerWeaponModels('laser','laser',[[3,'切割激光枪',1,1,1,0,0,0,0,'#ff6650','#fff3ca',0],[4,'棱镜激光枪',1.6,1,1,0,0,0,0,'#3bd9ff','#ffc65c',0],[5,'白昼终点',2.3,1,1,0,0,0,0,'#8beaff','#ffd25a',0]]);
registerWeaponModels('tesla','tesla',[[2,'便携电击器',1,1,1,0,0,0,3,'#b276ff','#ffdf73',0],[3,'雷鸣电弧枪',1.5,1,1,0,0,0,4,'#43d9ff','#ffd364',0],[5,'天罚线圈',2.1,1,1,0,0,0,7,'#8befff','#d48cff',0]]);
registerWeaponModels('boomerang','boomerang',[[1,'铁刺回旋镖',1,1,1,0,4,0,0,'#e89b43','#fff0bb',.03],[2,'裂齿回旋刃',1.25,1,1,0,8,0,0,'#ffb936','#3874ab',.05],[4,'蓝焰荆轮',1.6,3,1,36,16,0,0,'#36d7ff','#ffbf45',.07],[5,'日蚀王冠',1.9,5,1,60,24,0,0,'#8bff35','#e9ffcf',.09]]);
registerWeaponModels('bee','bee',[[3,'工蜂发射器',1,5,1,18,0,0,0,'#ffd443','#253b52',.02],[5,'万蜂王庭',1.3,9,1,28,0,0,0,'#66e3ff','#ffc342',.035]]);
registerWeaponModels('sword','sword',[[1,'铁剑',1,1,1,0,0,0,0,'#398bff','#d3efff',.04],[2,'合金长剑',1.2,1,1,0,0,0,0,'#48ff87','#efff9a',.06],[4,'破晓之刃',1.65,2,1,8,0,0,0,'#ffd23b','#fff7ba',.08],[5,'星陨圣剑',2.1,1,1,0,0,0,0,'#a0efff','#cb82ff',.1]]);
registerWeaponModels('rifle','rifle',[[2,'三连发步枪',1.15,1,3,0,0,0,0,'#74dca4','#ffe193',.05]]);
registerWeaponModels('laser','laser',[[2,'三连发激光枪',1.15,1,3,0,0,0,0,'#67f3d6','#c8fff1',0]]);
registerWeaponModels('tesla','tesla',[[4,'双手雷电枪',1.7,2,1,0,0,0,4,'#70dfff','#dc96ff',0]]);
const WEAPON_FAMILY_NAMES={pistol:'手枪',smg:'机枪',uzi:'双枪',rifle:'卡宾枪',sniper:'狙击枪',rocket:'火箭筒',seeker:'追踪飞弹',laser:'激光枪',tesla:'电击枪',boomerang:'回旋镖',bee:'蜜蜂枪',sword:'剑'};
function createWeaponModel(itemId){
 const m=WEAPON_MODELS.find(e=>e.id===itemId);if(!m)throw Error('Unknown weapon model: '+itemId);
 const engine=m.familyId==='sniper'&&m.tier>=3?'barrett':m.engineId,e={...createWeapon(engine,m.tier),itemId:m.id,familyId:m.familyId,name:m.name,visual:{...m},pellets:m.pellets,burstCount:m.burst,spread:m.pellets>1?m.fan*Math.PI/180/(m.pellets-1):0};
 if(m.id==='pistol_t1')e.speed=1100;
 e.desc=m.familyId==='sniper'?`单发重击；最多命中${m.tier===5?4:m.tier===3?2:1}个目标`:m.familyId==='boomerang'?`${m.pellets}枚扇形回旋；往返分别命中`:m.familyId==='rifle'?`${m.burst}连点射；轮间停顿`:m.familyId==='seeker'?`${m.pellets}枚追踪飞弹；小范围爆炸`:m.familyId==='bee'?`${m.pellets}只追踪蜂；移动产蜂`:m.familyId==='smg'?'密集连续射击':m.familyId==='rocket'?`单枚重炮；爆炸半径${m.radius}`:e.desc;
 if(m.familyId==='sniper'){e.pierce=m.tier===5?4:m.tier===3?2:1;if(m.tier===5){e.interval=1.55;e.critChance=.45;}}
 if(m.familyId==='rocket'){e.blastRadius=m.radius;e.interval=m.tier===5?1.65:m.tier===4?1.35:1.1;e.quake=m.tier===5;if(e.quake)e.desc+='；爆炸触发清弹震荡';}
 if(m.familyId==='smg'&&m.tier===3){e.interval=.045;e.speedPenalty=.25;e.desc+='；移速-25%';}
 if(m.familyId==='rifle'){e.interval=m.burst===5?.85:m.burst===3?.65:.22;}
 if(m.familyId==='seeker'){e.blastRadius=55;e.damage*=.65;e.interval=m.tier===5?1.25:1.05;}
 if(m.familyId==='boomerang'){e.damage/=Math.sqrt(m.pellets);e.hitRadius=26*m.size*.85;e.interval=m.tier>=4?1.1:.8;}
 if(m.familyId==='laser'){e.hitRadius=(m.tier===5?12:m.tier===4?7:3.2)*m.size;e.pierce=m.tier===5?99:m.tier===4?1:4;e.splitLaser=m.tier===4;e.sustain=m.tier===5;if(e.splitLaser)e.desc='粗激光命中即停；分裂2束，不再穿透';if(e.sustain){e.interval=1.65;e.desc='持续0.8秒粗激光；锁定朝向；穿透';}}
 if(m.familyId==='tesla'){e.pierce=m.chain;e.chainRange=m.tier===5?165:m.tier===3?140:120;e.electricRing=m.tier>=3;e.desc=`连锁${m.chain}目标，伤害递减`+(e.electricRing?'；周身电环':'');}
 if(m.id==='laser_t2'){e.interval=.72;e.damage*=.65;e.desc='三连发激光；每束穿透4个目标；轮间停顿';}
 if(m.id==='tesla_t4'){e.dualWield=true;e.damage*=.6;e.interval=.65;e.electricRing=false;e.desc='双枪分别就近瞄准；单目标集火；每枪连锁4目标，伤害递减';}
 if(m.familyId==='sword'){e.doubleCut=m.tier===2||m.tier===4;e.zenith=m.tier===5;e.desc=e.zenith?'顺砍三刀再逆砍三刀；随机椭圆；往返切割':`${m.pellets}道剑气＋近身挥砍`+(e.doubleCut?'；剑气命中追加斩切':'');if(e.zenith)e.interval=.14;}
 if(itemId==='pistol_t3'||itemId==='pistol_t4'){e.growth={kind:itemId==='pistol_t3'?'unhurt':'kills',value:0,stage:0};e.desc=itemId==='pistol_t3'?'战斗无伤每12秒进化；受击退一级；最多3级':'本枪击杀8/20只后进化；最多3级，本局保留';}
 if(['rocket','sniper'].includes(m.familyId)){e.recoilDistance=m.familyId==='rocket'?({3:30,4:44,5:60}[m.tier]||30):({2:23,3:38,5:54}[m.tier]||23);e.desc+='；强力后坐';}
 return e;
}
let weapon=createWeaponModel('pistol_t1'),pendingEquipment=null,armor=null,shoes=null,drone=null,droneShootTimer=0;
const FRIENDLY_SHOT_COLOR='#fff23b';
const beeTravel=new WeakMap();
let swordSwings=new WeakMap();
const SWORD_SWEEP=Math.PI*4/3;
const EQUIPMENT_LABELS={weapon:'武器',armor:'护甲',shoes:'坐骑',drone:'无人机',shovel:'铲子'};
const SHOVEL_TYPES=[{id:'digger',name:'掘金铲'}];
const SHOVEL_MODEL_SCALE=1.25;
function createShovel(id='digger',tier=1){tier=Math.max(1,Math.min(5,Number(tier)||1));return {...SHOVEL_TYPES[0],tier,interval:.5/(1+.25*(tier-1)),power:2,radius:1.5,desc:'靠近金钱格按攻速反复下铲；铲头触地扣进度，扣完产钱。'};}
let shovel=createShovel();
function cashShovelNearby(t){return !!shovel&&Math.hypot(p.x-325-t.x*TILE,p.y-300-t.y*TILE)<=shovel.radius*TILE;}
function cashShovelPose(t){
 if(!t.cashTile||!cashTilesEnabled()||!cashShovelNearby(t)||terrainHidden(t))return null;
 const phase=(t.shovelClock||0)/((t.shovelInterval||cashShovelInterval(t))*.8);
 if(phase<=0||phase>=1)return null;
 // World Y only: the blade stays directly over this tile throughout the stroke.
 const height=34-39*Math.min(1,phase/.4);
 return {x:t.x*TILE,z:t.y*TILE*1.06,y:height,opacity:Math.min(1,Math.max(0,(1-phase)/.6)),phase};
}
function cashShovelInterval(t){return Math.max(.08,shovel.interval/(productionMultiplier(t)*(1+.02*talentLevel('shovel'))));}
function updateCashShovel(t,dt){
 if(!cashShovelNearby(t))return;
 const queue=terrainQueue(t),capacity=terrainSupplyCapacity(t),duration=supplyTime(t),interval=cashShovelInterval(t);
 let left=Math.max(0,dt),clock=Math.min((t.shovelClock||0)*interval/(t.shovelInterval||interval),interval),hit=!!t.shovelHit;t.shovelInterval=interval;
 while(left>1e-9){
  if(clock===0&&queue.length>=capacity)break;
  const boundary=hit?interval:interval*.32,advance=Math.min(left,Math.max(0,boundary-clock));clock+=advance;left-=advance;
  if(clock+1e-9<boundary)break;
  if(hit){clock=0;hit=false;}
  else{
   hit=true;
   if(queue.length<capacity){
    // Work is credited only on the frame where the blade reaches the ground.
    t.healProgress=(t.healProgress||0)+shovel.power+(t.shovelBonusWork||0);t.shovelBonusWork=0;t.healFlash=.14;t.shovelImpactLeft=.18;
    if(t.healProgress+1e-9>=duration){t.healProgress=Math.max(0,t.healProgress-duration);queue.push(makeTerrainSupply(t));beep(460,.08,'sine',.018);}
   }
  }
 }
 t.shovelClock=clock;t.shovelHit=hit;if(queue.length>=capacity)t.healProgress=duration;t.medPack=queue.length>0;
}
function drawCashShovels(){
 const r=renderer;
 for(const t of tiles){
  if(t.cashTile&&t.shovelImpactLeft>0&&cashTilesEnabled()&&!terrainHidden(t)){
   const x=t.x*TILE,z=t.y*TILE*1.06,h=TILE*.44,d=h*1.06,alpha=.68*Math.pow(Math.min(1,t.shovelImpactLeft/.18),1.5);
   r.transparentQuad([x-h,3.3,z-d],[x+h,3.3,z-d],[x+h,3.3,z+d],[x-h,3.3,z+d],'#fff2b2',[alpha,alpha,alpha,alpha]);
   const core=alpha*.7;
   r.transparentQuad([x-12,3.5,z-12],[x+12,3.5,z-12],[x+12,3.5,z+12],[x-12,3.5,z+12],'#ffffff',[core,core,core,core]);
  }
  const pose=cashShovelPose(t);if(!pose)continue;
  r.disc(pose.x,2.6,pose.z,10,'#282820');r.ring(pose.x,2.8,pose.z,11,'#b59a58',1.5);
  // Fixed opacity batches keep simultaneous strokes independent and geometry resident.
  const opacity=Math.round(pose.opacity*32)/32;
  r.residentMaterial('terrain:vertical-shovel:'+Math.round(pose.opacity*32),()=>{
   const start=r.count;
   r.sphere(0,9,0,1,'#edffff',9,11,2,6,8);r.box(0,13,0,17,10,4,'#edffff');
   r.box(0,37,0,4,39,4,'#ffe4a6');r.box(0,23,0,6,8,6,'#b5edf0');
   for(const side of [-1,1])r.box(side*7,60,0,4,13,4,'#b5edf0');r.box(0,66,0,18,4,4,'#fff0ae');r.box(0,54,0,15,4,4,'#b5edf0');
   r.markPhosphor(start,.4);
   r.emissiveBox(0,15,2.3,2,10,1,'#ffffff');r.emissiveBox(0,38,2.3,1.6,30,1,'#fff1bb');r.emissiveBox(0,66,2.3,15,2,1,'#fff9d9');
  },monsterPose(pose.x,pose.y+2*(SHOVEL_MODEL_SCALE-1),pose.z,0,SHOVEL_MODEL_SCALE,SHOVEL_MODEL_SCALE,SHOVEL_MODEL_SCALE),opacity);
 }
}
const ARMOR_TYPES=[{id:'shell',name:'防弹毛衣'},{id:'energy',name:'琉璃铁布衫'},{id:'salvage',name:'拾荒风衣'},{id:'greed',name:'狂笑西服'},{id:'purity',name:'杀毒工装'},{id:'renewal',name:'暗红西装'},{id:'falcon',name:'游隼冲锋衣'},{id:'wine',name:'夜宴礼服'},{id:'ambush',name:'伏击斗篷'},{id:'plume',name:'翎羽天衣'},{id:'chrono',name:'黑色风衣'},{id:'aura',name:'蓝焰卫衣'}];
const SHOE_CATALOG=[{id:'runner',name:'波点水上漂'},{id:'steady',name:'稳步靴'},{id:'catalyst',name:'裂变德鲁伊'},{id:'magnet',name:'盛宴舞鞋'},{id:'skateboard',name:'霓虹巡演'},{id:'vinyl',name:'黑胶唱片',prototype:true},{id:'spider',name:'蜘蛛机甲',prototype:true},{id:'warpstar',name:'飞行星星',prototype:true},{id:'ufo',name:'飞碟',prototype:true},{id:'neonsword',name:'霓虹飞剑',prototype:true},{id:'sharkblimp',name:'小鲨鱼飞艇',prototype:true},{id:'smallplane',name:'小飞机',prototype:true},{id:'tentacle',name:'章鱼触手',prototype:true}];
const SHOE_TYPES=SHOE_CATALOG.filter(s=>s.id!=='tentacle');
function createArmor(id,tier=1){tier=Math.max(1,Math.min(5,tier));const base=ARMOR_TYPES.find(a=>a.id===id)||ARMOR_TYPES[0],maxHp=base.id==='shell'?tier:Math.ceil(tier/2),invBonus=base.id==='energy'?.8+.3*(tier-1):0,shieldBonus=base.id==='shell'?tier*2:['chrono','wine'].includes(base.id)?1:base.id==='aura'?Math.ceil(tier/3):1+Math.ceil(tier/2),e={...base,tier,maxHp,invBonus,shieldBonus};if(base.id==='shell')Object.assign(e,{speedPenalty:.2,effectText:'移速-20%'});if(base.id==='energy')Object.assign(e,{shieldInterval:16-1.5*(tier-1),effectText:'自动回复护盾'});if(base.id==='salvage')Object.assign(e,{cashHeal:1,cashHealCooldown:8,pickupRadiusBonus:TILE,effectText:'拾钞回血；拾取范围增加'});if(base.id==='greed')Object.assign(e,{cashProductionMultiplier:2,cashProductionRadius:1,cashMultiplier:2,healthDamageMultiplier:2,effectText:'印钞加速；金钱×2；生命受伤×2'});if(base.id==='purity')Object.assign(e,{clearNegativePerFloor:1,effectText:'每层清理一个危险机关。'});if(base.id==='renewal')Object.assign(e,{medicalHeal:2,regenHeal:1,regenInterval:15,effectText:'医疗包强化；定时回血'});if(base.id==='falcon')Object.assign(e,{maxHp:0,shieldBonus:0,invBonus:0,speedBonus:.3+.05*(tier-1),critChanceBonus:.05+.01*(tier-1),effectText:'移速、暴击率增加'});if(base.id==='wine')Object.assign(e,{critChanceBonus:.1+.02*(tier-1),critHealChance:.2,critHealAmount:1,effectText:'暴击率增加；暴击概率回血'});if(base.id==='ambush')Object.assign(e,{maxHp:0,shieldBonus:0,invBonus:0,speedPenalty:.15,critChanceBonus:.25+.05*(tier-1),critDamageBonus:.3+.05*(tier-1),effectText:'暴击率、暴击伤害增加；移速-15%'});if(base.id==='plume')Object.assign(e,{featherSpeedPerStack:.1,featherStackMax:5,effectText:'无伤通关叠加攻速，最多5层'});if(base.id==='chrono')Object.assign(e,{timeStop:true,effectText:'静止时时间流速8%'});if(base.id==='aura')Object.assign(e,{auraDamage:1.2+.4*(tier-1),auraInterval:.8,auraRadius:1.5+.1*(tier-1),effectText:'周身持续伤害'});e.desc=e.effectText||`生命上限 +${maxHp}，受击无敌 +${invBonus.toFixed(1)} 秒。`;return e}
function createShoes(id,tier=1){tier=Math.max(1,Math.min(5,tier));const base=SHOE_CATALOG.find(s=>s.id===id)||SHOE_TYPES[0],special=['catalyst','magnet'].includes(base.id),speedBonus=special?.06+.02*(tier-1):base.id==='runner'?.12+.06*(tier-1):.08+.04*(tier-1),invBonus=base.id==='steady'?.12+.04*(tier-1):0,e={...base,tier,speedBonus,invBonus};if(base.id==='catalyst')Object.assign(e,{productionBonus:.35+.1*(tier-1),productionRadius:1.5,effectText:'周围补给生产加速'});if(base.id==='magnet')Object.assign(e,{pickupRadius:55+5*(tier-1),effectText:'补给吸附范围增加'});if(base.id==='skateboard')Object.assign(e,{speedBonus:.3+.03*(tier-1),invBonus:0,skateTurnRate:Math.PI*3.4,grazePerStack:.12+.03*(tier-1),grazeMax:5,grazeDuration:4,skateTrickDuration:.5,skateTrickInvDuration:.5,skateTrickCooldown:1.5,effectText:'持续滑行；转弯减速；边缘反弹；自动特技'});if(base.prototype)Object.assign(e,{speedBonus:0,invBonus:0,effectText:base.id==='tentacle'?'无属性加成':base.id==='spider'?'自动机枪点射':base.id==='warpstar'?'攻速、暴击率增加':base.id==='vinyl'?'近身切割；击退':base.id==='ufo'?'自动穿透激光；敌弹减速':base.id==='neonsword'?'3把飞剑轮流近身刺击':base.id==='smallplane'?'前方持续散射；命中叠加易伤':base.id==='sharkblimp'?'爆炸半径增加':'效果待设计。'});if(base.id==='spider')Object.assign(e,{spiderTurretDamage:.65*(1+.5*(tier-1)),spiderTurretBurst:4,spiderTurretInterval:.09,spiderTurretCycle:.75});if(base.id==='vinyl')Object.assign(e,{vinylDamage:1*(1+.5*(tier-1)),vinylRadius:43,vinylInterval:.18});if(base.id==='ufo')Object.assign(e,{ufoLaserDamage:2*(1+.5*(tier-1)),ufoLaserInterval:.55,ufoLaserPierce:3,bulletSlowRadius:(2+.25*(tier-1))*TILE,bulletSlowFactor:.4-.05*(tier-1)});if(base.id==='skateboard')e.attackSpeedBonus=.3+.1*(tier-1);if(base.id==='spider')Object.assign(e,{stillCritBonus:.4+.1*(tier-1),stillCritDelay:.6});if(base.id==='warpstar')Object.assign(e,{attackSpeedBonus:.25+.075*(tier-1),critChanceBonus:.2+.05*(tier-1)});if(base.id==='sharkblimp')e.explosionRadiusMultiplier=1.75+.25*(tier-1);if(base.id==='neonsword')Object.assign(e,{crowdCritPerEnemy:.1+.025*(tier-1),crowdCritMax:5,crowdCritRadius:2*TILE});if(base.id==='vinyl')Object.assign(e,{vinylAttackBonus:.6+.15*(tier-1),vinylAttackDuration:3});if(base.id==='smallplane')Object.assign(e,{planeDamage:.55*(1+.5*(tier-1)),planeInterval:.021,planeSpread:.55,planeBulletSpeed:760,planeVulnerablePerStack:.1+.025*(tier-1),planeVulnerableMax:10,planeVulnerableDuration:4});if(base.id==='neonsword')Object.assign(e,{damage:Math.round(3.2*(1+(tier-1)*.5)*100)/100,interval:.7,hoverRadius:52,stabRange:120});scaleMountBuildBonuses(e);e.desc=e.effectText||`移速 +${Math.round(speedBonus*100)}%${invBonus?`，受击无敌 +${invBonus.toFixed(2)} 秒`:''}。`;return e}
const COMPANION_TYPES=[
 {id:'ram',name:'撞针无人机',category:'攻击型无人机'},
 {id:'interceptor',name:'哨环无人机',category:'守卫型无人机'},
 {id:'chainsaw',name:'裂齿电锯无人机',category:'守卫型无人机'},
 {id:'weakener',name:'弱点探针',category:'辅助型无人机'},
 {id:'medic',name:'医疗萤',category:'辅助型无人机'},
 {id:'charger',name:'充能萤',category:'辅助型无人机'}
];
function createCompanion(id,tier){
 const type=COMPANION_TYPES.find(d=>d.id===id);if(!type||id==='chainsaw')return null;
 tier=Math.max(1,Math.min(5,tier));const e={...type,tier,companion:true,damage:0,interval:2,range:0};
 if(id==='ram')Object.assign(e,{damage:6*(1+.5*(tier-1)),interval:2-.15*(tier-1),speed:320,desc:'离队冲撞最近敌人，命中后返回。'});
 if(id==='interceptor')Object.assign(e,{damage:1+.5*(tier-1),interval:.4,orbitRadius:60,orbitSpeed:2.4,blockInterval:1.8-.2*(tier-1),desc:'绕身接触伤害；拦截触碰机体的普通敌弹，有独立冷却。'});
 if(id==='weakener')Object.assign(e,{interval:2,vulnerability:.2+.05*(tier-1),duration:3,desc:'每2秒标记最近敌人3秒，受到伤害+'+Math.round((.2+.05*(tier-1))*100)+'%。'});
 if(id==='medic')Object.assign(e,{interval:18-1.5*(tier-1),desc:'战斗中每'+(18-1.5*(tier-1))+'秒回复1格生命。'});
 if(id==='charger')Object.assign(e,{interval:12-(tier-1),desc:'战斗中每'+(12-(tier-1))+'秒补充1格护盾。'});
 return e;
}
// Obtainable drones use COMPANION_TYPES; legacy factories below only preserve old projectile regression fixtures.
function createDrone(id,tier=1){const companion=createCompanion(id,tier);if(companion)return companion;if(id==='flysword'){tier=Math.max(1,Math.min(5,tier));return {id,name:'三才飞剑无人机',tier,damage:Math.round(3.2*(1+(tier-1)*.5)*100)/100,interval:.7,hoverRadius:52,stabRange:120,desc:'3把飞剑轮流近身刺击'}}if(id==='chainsaw'){tier=Math.max(1,Math.min(5,tier));return {id,name:'裂齿电锯无人机',category:'守卫型无人机',tier,damage:Math.round(2.4*(1+(tier-1)*.5)*100)/100,interval:.16,sawRadius:24,orbitRadius:80,orbitSpeed:2.4,count:3,desc:'3个飞轮环绕切割'}}const w=createWeapon(id,tier);return {...w,...(w.speedPenalty?{speedPenalty:0}:{}),name:WEAPON_TYPES.some(t=>t.id===w.id)?w.name+'无人机':({crescent:'弦月无人机',seeker:'寻迹无人机',rotor:'旋星无人机',pulse:'脉冲无人机',smg:'蜂鸣无人机',twin:'双联无人机',shotgun:'撕裂无人机',rail:'轨道无人机',rocket:'轰鸣无人机',boomerang:'回旋无人机',tesla:'雷鸣无人机',laser:'棱镜无人机',rifle:'卫士无人机',sniper:'鹰眼无人机',magnum:'重锤无人机'})[w.id],damage:Math.round(w.damage*.65*100)/100,...(w.meleeDamage?{meleeDamage:Math.round(w.meleeDamage*.65*100)/100}:{}),desc:w.desc}}
function scaleMountBuildBonuses(e){
 const scale=2/3;
 for(const key of ['attackSpeedBonus','grazePerStack','stillCritBonus','critChanceBonus','crowdCritPerEnemy','vinylAttackBonus','planeVulnerablePerStack'])if(e[key]!==undefined)e[key]*=scale;
 if(e.explosionRadiusMultiplier)e.explosionRadiusMultiplier=1+(e.explosionRadiusMultiplier-1)*scale;
 if(e.bulletSlowFactor!==undefined)e.bulletSlowFactor=1-(1-e.bulletSlowFactor)*scale;
}
function equipmentInSlot(key){return {weapon,armor,shoes,drone,shovel}[key]}
// Roll once per stock item. Returning from comparison never rerolls the contents.
function rollEquipmentStats(key,e){if(key==='drone'&&e.companion)return {...e};const vary=value=>Math.round(value*(.85+Math.random()*.3)*1000)/1000,out={...e};if(key==='weapon'||key==='drone'){out.damage=vary(e.damage);if(e.meleeDamage)out.meleeDamage=Math.round(e.meleeDamage*out.damage/e.damage*1000)/1000;out.interval=vary(e.interval)}else if(key==='shovel'){out.interval=vary(e.interval)}else if(key==='armor'){out.invBonus=vary(e.invBonus);if(e.speedBonus)out.speedBonus=vary(e.speedBonus);out.desc=`生命上限 +${out.maxHp}，受击无敌 +${out.invBonus.toFixed(3)} 秒。`}else if(key==='shoes'){out.speedBonus=vary(e.speedBonus);out.invBonus=e.invBonus?vary(e.invBonus):0;out.desc=`移速 +${(out.speedBonus*100).toFixed(1)}%${out.invBonus?`，受击无敌 +${out.invBonus.toFixed(3)} 秒`:''}。`}for(const field of ['productionBonus','pickupRadius','shieldInterval','auraDamage','auraInterval','critChance','critMultiplier','critChanceBonus','critDamageBonus'])if(out[field]&&(field!=='critMultiplier'||e.critChance>0))out[field]=vary(out[field]);if(out.effectText)out.desc=out.effectText;return out}
function equipmentShopCategories(key,e){
 if(key==='weapon'){
  const family=e.familyId||e.id;
  if(family==='sword')return ['冷兵器'];
  if(['rocket','seeker'].includes(family))return ['爆破武器'];
  if(['rifle','sniper','barrett','rotor'].includes(family)||e.itemId==='smg_t3')return ['重武器'];
  return ['轻武器'];
 }
 if(key==='armor')return ({purity:['建筑工服饰'],falcon:['游侠服饰'],ambush:['游侠服饰'],shell:['重型防弹衣'],energy:['轻便护甲'],renewal:['轻便护甲'],plume:['绚丽服装','游侠服饰'],chrono:['绚丽服装'],aura:['绚丽服装'],salvage:['便装'],greed:['便装'],wine:['便装','轻便护甲']})[e.id]||['便装'];
 if(key==='shoes')return ({ufo:['装甲坐骑','辅助坐骑'],steady:['装甲坐骑'],runner:['迅捷坐骑'],skateboard:['迅捷坐骑','火力坐骑'],catalyst:['辅助坐骑'],magnet:['辅助坐骑'],vinyl:['火力坐骑','装甲坐骑']})[e.id]||['火力坐骑'];
 if(key==='drone')return [e.category||'攻击型无人机'];
 return ['挖掘工具'];
}
function equipmentBoxName(u){const categories=equipmentShopCategories(u.key,itemEquipment(u));if(!categories.includes(u.category))u.category=categories[Math.floor(Math.random()*categories.length)];return u.category}
function shopItemName(u){if(EQUIPMENT_LABELS[u.key])return '随机 '+WEAPON_GRADES[itemEquipment(u).tier].name+equipmentBoxName(u);if(u.key==='terrainPassive')return '随机 稀有'+terrainDef(u.terrainId).tile.replace('印钞格','金钱格')+'加成';return u.name}
function shopItemDescription(u){
 if(EQUIPMENT_LABELS[u.key])return ({
  '轻武器':'获得一件随机的轻型射击武器。',
  '重武器':'获得一件随机的重型射击武器。',
  '冷兵器':'获得一件随机的挥砍攻击武器。',
  '爆破武器':'获得一件随机的爆炸攻击武器。',
  '建筑工服饰':'获得一件随机的辅助清理危险机关的服饰。',
  '游侠服饰':'获得一件随机的强化机动或暴击能力的服饰。',
  '便装':'获得一件随机的提供特殊加成的服饰。',
  '轻便护甲':'获得一件随机的强化生存能力的轻型护甲。',
  '重型防弹衣':'获得一件随机的强化生命与护盾的重型护甲。',
  '绚丽服装':'获得一件随机的提供特殊战斗效果的服饰。',
  '装甲坐骑':'获得一件随机的强化生存能力的载具。',
  '迅捷坐骑':'获得一件随机的强化移动能力的载具。',
  '火力坐骑':'获得一件随机的强化攻击能力的载具。',
  '辅助坐骑':'获得一件随机的提供辅助效果的载具。',
  '攻击型无人机':'获得一架随机的主动攻击敌人的无人机。',
  '守卫型无人机':'获得一架随机的环绕守卫的无人机。',
  '辅助型无人机':'获得一架随机的提供战斗支援的无人机。',
  '挖掘工具':'获得一件随机的加快地块生产的挖掘工具。'
 })[equipmentBoxName(u)];
 if(u.key==='terrainPassive')return '获得一项随机的强化'+terrainDef(u.terrainId).tile.replace('印钞格','金钱格')+'效果的加成。';
 return u.desc;
}
function equipmentShopStatLabel(name){return ({'攻击力':'攻击','生命上限加成':'生命','护盾上限加成':'护盾','移速加成':'移速','每铲进度':'进度','工作半径':'范围','挥砍伤害':'挥砍','暴击率':'暴击','暴击伤害':'爆伤'})[name]||name}
function equipmentBoxDescription(u){const e=itemEquipment(u);return equipmentStatRows(u.key,e).filter(([,get])=>get(e)!==0).map(([name,get,suffix])=>equipmentShopStatLabel(name)+' '+equipmentNumber(get(e))+suffix).concat(equipmentSpecialEffects(u.key,e,false)).flatMap(text=>text.split('；')).join('<br>')}
function rollShopTier(){return Math.max(1,shopLevel-(shopLevel>1&&Math.random()<.2?1:0));}
function equipmentShopItem(key){if(key==='weapon')return weaponModelShopItem();const tier=rollShopTier(),types=key==='shovel'?SHOVEL_TYPES:key==='armor'?ARMOR_TYPES:key==='shoes'?SHOE_TYPES:key==='drone'?COMPANION_TYPES:WEAPON_TYPES,id=types[Math.floor(Math.random()*types.length)].id,factory=key==='shovel'?createShovel:key==='armor'?createArmor:key==='shoes'?createShoes:key==='drone'?createDrone:createWeapon,equipment=rollEquipmentStats(key,factory(id,tier)),u={key,amount:1,equipment,blindBox:true,opened:false};if(key==='weapon')u.weapon=equipment;u.name=equipmentBoxName(u);u.desc=equipmentBoxDescription(u);return u}
function randomEquipmentShopItem(){return equipmentShopItem(Object.keys(EQUIPMENT_LABELS)[Math.floor(Math.random()*Object.keys(EQUIPMENT_LABELS).length)])}
function itemEquipment(u){return u.weapon||u.equipment}
function shieldMaximum(){if(drinkPenaltyCount('salt'))return 0;return 2+(armor?.shieldBonus||0)}
function timeSlowed(){if(skateActive())return false;if(!armor?.timeStop||!['combat','survival'].includes(state))return false;if(state==='combat'&&!enemies.some(e=>e.hp>0)&&!missiles.length&&!spawnQueue.length)return false;let mx=(keys.d||keys.ArrowRight?1:0)-(keys.a||keys.ArrowLeft?1:0)+joy.x,my=(keys.s||keys.ArrowDown?1:0)-(keys.w||keys.ArrowUp?1:0)+joy.y,n=Math.max(1,Math.hypot(mx,my));mx=mx/n*movementSpeed()*.016;my=my/n*movementSpeed()*.016;const x=canWalkAt(p.x+mx,p.y,7)?p.x+mx:p.x,y=canWalkAt(x,p.y+my,7)?p.y+my:p.y;return Math.hypot(x-p.x,y-p.y)<.001}
function featherSpeedBonus(e=armor){return e?.featherSpeedPerStack?Math.min(p?.featherStacks||0,e.featherStackMax)*e.featherSpeedPerStack:0}
function mountAttackBonus(){return state==='combat'?(shoes?.attackSpeedBonus||0)+(shoes?.id==='vinyl'&&p?.vinylAttackLeft>0?shoes.vinylAttackBonus:0):0;}
function mountCritBonus(){
 if(state!=='combat'||!shoes)return 0;
 if(shoes.id==='spider')return (p?.mountStillTime||0)>=shoes.stillCritDelay?shoes.stillCritBonus:0;
 if(shoes.id==='neonsword'){const count=enemies.filter(e=>isAttackable(e)&&Math.hypot(e.x-p.x,e.y-p.y)<=shoes.crowdCritRadius).length;return Math.min(count,shoes.crowdCritMax)*shoes.crowdCritPerEnemy;}
 return shoes.critChanceBonus||0;
}
function updateMountCombatBonuses(dt,distance){
 if(paused)return;
 if(state!=='combat'){p.mountStillTime=0;p.vinylAttackLeft=0;return;}
 p.mountStillTime=shoes?.id==='spider'&&distance<.001?(p.mountStillTime||0)+dt:0;
 p.vinylAttackLeft=Math.max(0,(p.vinylAttackLeft||0)-dt);
}
function attackSpeedMultiplier(){return 1+featherSpeedBonus()+skateAttackBonus()+mountAttackBonus()+drinkAttackSpeedBonus()}
function startFloorTracking(){if(drone?.companion){delete drone.motion;droneShootTimer=0;}refreshCoverTiles();startDrinkRoom();if(shoes?.id==='neonsword')shoes.blades=null;clearSkateReward();p.mountStillTime=0;p.vinylAttackLeft=0;p.floorHit=false;p.featherEligible=armor?.id==='plume'}
function movementSpeed(){return 195*(1+.01*talentLevel('move'))*mods.speed*(1+(shoes?.speedBonus||0)+(armor?.speedBonus||0))*(1-(armor?.speedPenalty||0))*(1-(weapon?.speedPenalty||0)*(1-.05*talentLevel('heavy')))*Math.pow(.75,drinkPenaltyCount('lonely'))*(1+.2*drinkRewardCount('hound'))*(1+terrainRun.move+(terrainRun.stim>0?.25:0))}
function damageInvincibility(){return 1.5+(armor?.invBonus||0)+(shoes?.invBonus||0)+.02*talentLevel('inv')}
function equipItem(key,equipment){if(key==='shovel'){shovel={...equipment};return;}if(key==='shoes'&&equipment.id==='tentacle')return;if(key==='drone'&&equipment.id==='flysword')return;if(key==='weapon'){weapon={...equipment};shootTimer=0;p.weaponRecoilVX=0;p.weaponRecoilVY=0;p.weaponRecoilAt=-Infinity}else if(key==='armor'){if(['combat','survival','bossIntro'].includes(state))p.featherEligible=false;p.max+=equipment.maxHp-(armor?.maxHp||0);p.hp=Math.min(p.hp,p.max);armor={...equipment};p.shieldCharge=0;p.auraClock=0;p.regenCharge=0;p.shield=Math.min(p.shield,shieldMaximum())}else if(key==='shoes'){shoes={...equipment};if(shoes.id==='neonsword')shoes.blades=null;p.skateAngle=Math.atan2(p.dy??-1,p.dx??0);p.skateStarted=false;p.tentacleGait=null;p.spiderGait=null;p.spiderTurret=null;p.starTrail=null;p.swordRide=null;p.mountStillTime=0;p.vinylAttackLeft=0;p.vinylShootLeft=0;p.vinylHitAt=-Infinity;p.planeShootLeft=0;p.ufoShootLeft=0;p.ufoAim=-Math.PI/2;p.ufoHitAt=-Infinity;shots=shots.filter(s=>!s.spiderTurret&&!s.vinylCutter&&!s.ufoLaser&&!s.mountedSword&&!s.planeBullet);clearSkateReward();}else if(key==='drone'){drone={...equipment};delete drone.motion;droneShootTimer=0}}
// Skateboard motion is substepped so sparse floors cannot be crossed by a long frame.
function skateActive(){return shoes?.id==='skateboard'&&['combat','survival','bossIntro','descent','landing'].includes(state)}
function skateAttackBonus(){return shoes?.id==='skateboard'&&p?.grazeLeft>0?(p.grazeStacks||0)*shoes.grazePerStack:0}
function clearSkateReward(resetCooldown=true){if(!p)return;if(resetCooldown)p.skateCooldownLeft=0;p.grazeStacks=0;p.grazeLeft=0;p.skateTrickLeft=0;p.skateTrickInv=0;p.skateSlowLeft=0;p.skateNearSources=new Set();}
function skateInvulnerable(){return shoes?.id==='skateboard'&&p?.skateTrickInv>0}
function skateTrickProgress(){return shoes?.id==='skateboard'&&p?.skateTrickLeft>0?Math.max(0,Math.min(1,1-p.skateTrickLeft/shoes.skateTrickDuration)):0}
function skateJumpHeight(){return Math.sin(Math.PI*skateTrickProgress())*144}
function skateSpinAngle(){const t=Math.max(0,Math.min(1,(skateTrickProgress()-.08)/.84));return TAU*(p.skateTrickKind===1?0:p.skateTrickKind===2||p.skateTrickKind===3?1:2)*t*t*(3-2*t)}
function skateFlipAngle(){const t=Math.max(0,Math.min(1,(skateTrickProgress()-.08)/.84));return TAU*(p.skateTrickKind===1?2:p.skateTrickKind===2?-2:p.skateTrickKind===3?1:0)*t*t*(3-2*t)}
function updateSkateReward(dt){p.skateCooldownLeft=Math.max(0,(p.skateCooldownLeft||0)-dt);if(p.skateCooldownLeft<1e-9)p.skateCooldownLeft=0;p.skateSlowLeft=Math.max(0,(p.skateSlowLeft||0)-dt);p.skateTrickLeft=Math.max(0,(p.skateTrickLeft||0)-dt);p.skateTrickInv=Math.max(0,(p.skateTrickInv||0)-dt);if(!p.grazeLeft)return;p.grazeLeft=Math.max(0,p.grazeLeft-dt);if(!p.grazeLeft){p.grazeStacks=0;updateUI()}}
function moveSkateboard(mx,my,dt){
 if(!p.skateStarted){if(Math.hypot(mx,my)<=.001)return;p.skateStarted=true;p.skateAngle=Math.atan2(my,mx);}
 let angle=Number.isFinite(p.skateAngle)?p.skateAngle:Math.atan2(p.dy??-1,p.dx??0),remaining=dt;
 while(remaining>1e-9){const h=Math.min(remaining,1/120,3/Math.max(1,movementSpeed()));remaining-=h;
  let turnSpeed=1;
  if(Math.hypot(mx,my)>.001){const target=Math.atan2(my,mx),delta=Math.atan2(Math.sin(target-angle),Math.cos(target-angle));turnSpeed=1-.5*Math.min(1,Math.abs(delta)/(Math.PI/2));angle+=Math.max(-shoes.skateTurnRate*h,Math.min(shoes.skateTurnRate*h,delta));}
  const dx=Math.cos(angle)*movementSpeed()*turnSpeed*h,dy=Math.sin(angle)*movementSpeed()*turnSpeed*h;
  let x=p.x+dx,y=p.y+dy;
  if(!canWalkAt(x,p.y,7)){angle=Math.PI-angle;x=p.x-dx;}
  if(canWalkAt(x,p.y,7))p.x=x;
  if(!canWalkAt(p.x,y,7)){angle=-angle;y=p.y-dy;}
  if(canWalkAt(p.x,y,7))p.y=y;
 }
 p.skateAngle=Math.atan2(Math.sin(angle),Math.cos(angle));p.dx=Math.cos(angle);p.dy=Math.sin(angle);
}
function skateHudText(){return shoes?.id==='skateboard'?` · 特技 ${p.grazeStacks||0}/${shoes.grazeMax}${p.grazeLeft>0?' 攻速 +'+Math.round(skateAttackBonus()*100)+'%':''}`:''}
function triggerSkateTrick(){
 if(!skateActive()||p.inv>0||p.skateTrickLeft>0||p.skateCooldownLeft>0||!['combat','survival'].includes(state))return;
 p.grazeStacks=Math.min(shoes.grazeMax,(p.grazeStacks||0)+1);p.grazeLeft=shoes.grazeDuration;
 p.skateCooldownLeft=shoes.skateTrickCooldown;p.skateTrickKind=(p.skateTrickSerial||0)%4;p.skateTrickSerial=(p.skateTrickSerial||0)+1;p.skateSlowLeft=.18;p.skateTrickLeft=shoes.skateTrickDuration;p.skateTrickInv=shoes.skateTrickInvDuration;cashPopups.push({text:['NEON 720!','DISCO KICKFLIP!','BACKBEAT HEELFLIP!','ENCORE VARIAL!'][p.skateTrickKind],trick:true,x:p.x,y:p.y,height:230,age:0,life:.75});if(cashPopups.length>24)cashPopups.shift();burst(p.x,p.y,'#72efff',10);beep(900,.07,'triangle',.025);updateUI();
}
function trySkateDanger(source){
 if(!skateActive()||!['combat','survival'].includes(state)||!source)return false;
 p.skateNearSources??=new Set();
 if(p.skateNearSources.has(source))return false;
 if(p.inv>0||p.skateTrickLeft>0||p.skateCooldownLeft>0)return false;
 p.skateNearSources.add(source);triggerSkateTrick();return skateInvulnerable();
}
function skatePhaseSource(o,phase){if(o.skateDangerPhase!==phase){o.skateDangerPhase=phase;o.skateDangerToken={phase};}return o.skateDangerToken;}
function skateDangerSources(){
 const found=new Set(),near=(o,x,y,r)=>{if(Math.hypot(p.x-x,p.y-y)<=r+24)found.add(o)};
 for(const b of bullets)if(b.life>0)near(b,b.x,b.y,b.r+4);
 for(const s of droneSaws)if(!s.done)near(s,s.x,s.y,s.r);
 for(const e of [...enemies,...missiles])if(e.hp>0&&(e.type!=='snake'||e.snakeDanger))near(e,e.x,e.y,(e.r||9)+5);
 for(const t of tiles){
  if(t.trap)near(skatePhaseSource(t.trap,trapPhase(t)),325+t.x*TILE,300+t.y*TILE,TILE*.71);
  if(t.saw&&!terrainHidden(t)&&(!t.orbitSaw||ORBIT_SAW_ENABLED)){const at=sawPosition(t);near(t,at.x,at.y,t.orbitSaw?30:25)}
  if(t.flywheel)near(t.flywheel,t.flywheel.x,t.flywheel.y,FLYWHEEL_RADIUS+4);
 }
 for(const t of turrets)near(t,t.x,t.y,18);
 // These attacks only trigger on their actual damage geometry, never on warnings or proximity.
 for(const h of hazards)if(h.t>1.1&&h.t<1.5&&Math.hypot(p.x-h.x,p.y-h.y)<33+drinkPlayerRadius()-4)found.add(skatePhaseSource(h,'active'));
 for(const e of [...enemies,...turrets])if(e.laserMode==='firing'&&beamHits(e))found.add(skatePhaseSource(e,'firing'));
 return found;
}
function updateSkateDanger(){
 if(!skateActive()||!['combat','survival'].includes(state))return;
 const current=skateDangerSources(),previous=p.skateNearSources||new Set();
 const consumed=new Set([...previous].filter(o=>current.has(o)));
 if(!p.skateTrickLeft&&p.inv<=0&&!(p.skateCooldownLeft>0)){const source=[...current].find(o=>!consumed.has(o));if(source){triggerSkateTrick();for(const o of current)consumed.add(o);}}
 if(p.skateTrickLeft>0)for(const o of current)consumed.add(o);
 // New threats encountered during cooldown remain pending until readiness returns.
 p.skateNearSources=consumed;
}
function bulletClosestDistance(b,x,y){
 const ax=x-(p.frameStartX??p.x),ay=y-(p.frameStartY??p.y),bx=b.x-p.x,by=b.y-p.y,dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,-(ax*dx+ay*dy)/(dx*dx+dy*dy||1)));
 return Math.hypot(ax+dx*t,ay+dy*t);
}
function dronePosition(index=0){if(drone?.companion&&drone.motion)return {x:drone.motion.x,y:drone.motion.y};if(drone?.id==='chainsaw')return {x:p.x+Math.cos(time*drone.orbitSpeed+index*TAU/3)*drone.orbitRadius,y:p.y+Math.sin(time*drone.orbitSpeed+index*TAU/3)*drone.orbitRadius};return {x:Math.max(A.x+8,Math.min(A.x+A.w-8,p.x+Math.cos(time*1.6)*34)),y:Math.max(A.y+8,Math.min(A.y+A.h-8,p.y+Math.sin(time*1.6)*24))}}
function weaponDps(w){return w.damage*w.pellets/w.interval}
function weaponShopItem(){return equipmentShopItem('weapon')}
function isAttackable(e){return (!e.transport||(!e.transport.waiting&&e.x>=A.x&&e.x<=A.x+A.w&&e.y>=A.y&&e.y<=A.y+A.h))&&e.hp>0&&!(['droneMinion','ufoMinion'].includes(e.type)&&e.launchLeft>0)&&e.type!=='turret'&&!e.invulnerable&&!turrets.includes(e)}
function combatTargets(){return [...missiles,...enemies].filter(isAttackable)}
function arcChain(origin,maxTargets=3,range=120,firstTarget=null){const remaining=combatTargets(),targets=[];let at=origin;while(remaining.length&&targets.length<maxTargets){remaining.sort((a,b)=>Math.hypot(a.x-at.x,a.y-at.y)-Math.hypot(b.x-at.x,b.y-at.y));const next=!targets.length&&remaining.includes(firstTarget)?remaining.splice(remaining.indexOf(firstTarget),1)[0]:remaining.shift();if(targets.length&&Math.hypot(next.x-at.x,next.y-at.y)>range)break;targets.push(next);at=next}return targets}
function emitArc(w,a,origin,source,firstTarget=null){const arcTargets=arcChain(origin,w.pierce,w.chainRange||120,firstTarget),points=[{x:origin.x,y:origin.y},...arcTargets.map(e=>({x:e.x,y:e.y}))];if(!arcTargets.length)points.push({x:origin.x+Math.cos(a)*100,y:origin.y+Math.sin(a)*100});const end=points[points.length-1];shots.push({beam:true,arc:true,arcTargets,points,originX:origin.x,originY:origin.y,x:end.x,y:end.y,vx:0,vy:0,life:.18,damage:w.damage,pierce:w.pierce,hitTargets:new Set(),damageApplied:false,color:FRIENDLY_SHOT_COLOR,weaponId:w.id,source,height:source==='drone'?48:12});beep(720,.1,'sawtooth',.018)}
function rotorAngles(w){return Array.from({length:w.forks},(_,i)=>time*w.rotationSpeed+i*TAU/w.forks)}
function emitRotor(w,origin,source){const hitTargets=new Set();w.rotorCooldowns??=new WeakMap();for(const a of rotorAngles(w)){const length=beamLength({x:origin.x,y:origin.y,aim:a});shots.push({beam:true,rotor:true,rotorCooldowns:w.rotorCooldowns,interval:w.interval/(attackSpeedMultiplier()+(source==='weapon'?terrainRun.attack+(terrainRun.combat>0?.3:0):0)),hitRadius:w.halfWidth,originX:origin.x,originY:origin.y,x:origin.x+Math.cos(a)*length,y:origin.y+Math.sin(a)*length,vx:0,vy:0,life:.08,damage:w.damage,pierce:w.pierce,hitTargets,damageApplied:false,color:FRIENDLY_SHOT_COLOR,weaponId:w.id,source,height:source==='drone'?48:12})}}
function emitBees(w,a,origin,source,moveBonus=false){for(let i=0;i<w.pellets;i++){const angle=a+(i-(w.pellets-1)/2)*w.spread;shots.push({x:origin.x,y:origin.y,vx:Math.cos(angle)*w.speed,vy:Math.sin(angle)*w.speed,speed:w.speed,age:0,launchDelay:i*.025,homing:true,bee:true,moveBonus,...criticalProfile(w),beeIndex:i,life:3.2,damage:w.damage,pierce:w.pierce,hitTargets:new Set(),color:FRIENDLY_SHOT_COLOR,weaponId:w.id,source,height:source==='drone'?48:18})}beep(260,.09,'triangle',.02)}
function updateBeeMovement(distance){if(state!=='combat'||paused||distance<=0)return;for(const [source,e]of [['weapon',weapon],['drone',drone]]){if(e?.id!=='bee')continue;const total=(beeTravel.get(e)||0)+distance,count=Math.floor((total+1e-8)/TILE);beeTravel.set(e,Math.max(0,total-count*TILE));if(!count)continue;const origin=source==='drone'?dronePosition():p,targets=combatTargets(),target=targets.length?targets.reduce((a,b)=>Math.hypot(a.x-origin.x,a.y-origin.y)<Math.hypot(b.x-origin.x,b.y-origin.y)?a:b):null,angle=target?Math.atan2(target.y-origin.y,target.x-origin.x):Math.atan2(p.dy,p.dx);(()=>{const start=shots.length;emitBees({...e,pellets:count},angle,origin,source,true);if(e.itemId)tagModelShots(start,e,source);applyDrinkVolley(start,origin,source)})()}}
function emitSeeker(w,origin,source){const count=w.itemId?w.pellets:2;for(let i=0;i<count;i++){const angle=-Math.PI/2+((w.itemId==='seeker_t5'||w.itemId==='seeker_t4')?i*TAU/count:0);shots.push({x:origin.x,y:origin.y,vx:(w.itemId==='seeker_t5'||w.itemId==='seeker_t4')?Math.cos(angle)*w.speed:0,vy:(w.itemId==='seeker_t5'||w.itemId==='seeker_t4')?Math.sin(angle)*w.speed:-w.speed,speed:w.speed,age:0,launchDelay:i*.09,homing:true,life:4,damage:w.damage,pierce:w.pierce,hitTargets:new Set(),color:FRIENDLY_SHOT_COLOR,weaponId:w.id,source,height:source==='drone'?48:12,blastRadius:w.blastRadius});}beep(220,.1,'triangle',.025)}
function emitSword(w,a,origin,source){const direction=swordSwings.get(w)||-1;swordSwings.set(w,-direction);shots.push({slash:true,beam:true,arc:true,radial:true,arcTargets:[],originX:origin.x,originY:origin.y,x:origin.x,y:origin.y,vx:0,vy:0,age:0,life:.14,aim:a,direction,angle:a-direction*SWORD_SWEEP/2,slashRadius:w.slashRadius,damage:w.meleeDamage,pierce:99,hitTargets:new Set(),color:FRIENDLY_SHOT_COLOR,weaponId:w.id,source,height:source==='drone'?48:24});shots.push({x:origin.x,y:origin.y,vx:Math.cos(a)*w.speed,vy:Math.sin(a)*w.speed,launchDelay:.035,life:1.5,damage:w.damage,pierce:w.pierce,hitTargets:new Set(),crescent:true,waveRadius:w.waveRadius,color:FRIENDLY_SHOT_COLOR,weaponId:w.id,source,height:source==='drone'?48:24});beep(410,.12,'triangle',.025)}
function uziBarrels(origin,fallback){const targets=combatTargets().sort((a,b)=>Math.hypot(a.x-origin.x,a.y-origin.y)-Math.hypot(b.x-origin.x,b.y-origin.y)).slice(0,2);return [-1,1].map((side,i)=>{const x=origin.x-Math.sin(fallback)*side*13,y=origin.y+Math.cos(fallback)*side*13,target=targets[i]||targets[0];return {x,y,target,angle:target?Math.atan2(target.y-y,target.x-x):fallback}})}
function emitUzi(w,a,origin,source){for(const barrel of uziBarrels(origin,a)){shots.push({x:barrel.x,y:barrel.y,vx:Math.cos(barrel.angle)*w.speed,vy:Math.sin(barrel.angle)*w.speed,life:1.5,damage:w.damage,pierce:w.pierce,hitTargets:new Set(),color:FRIENDLY_SHOT_COLOR,weaponId:w.id,source,height:source==='drone'?48:22})}shotSound()}
function emitWeaponShotsInternal(w,a,origin,source='weapon'){if(w.id==='uzi'){emitUzi(w,a,origin,source);return}if(w.id==='sword'){emitSword(w,a,origin,source);return}if(w.id==='bee'){emitBees(w,a,origin,source);return}if(w.id==='seeker'){emitSeeker(w,origin,source);return}if(w.id==='rotor'){emitRotor(w,origin,source);return}if(w.id==='tesla'){if(w.dualWield){for(const barrel of uziBarrels(origin,a))emitArc(w,barrel.angle,barrel,source,barrel.target);}else emitArc(w,a,origin,source);return}if(w.id==='laser'){const length=beamLength({x:origin.x,y:origin.y,aim:a});shots.push({beam:true,originX:origin.x,originY:origin.y,x:origin.x+Math.cos(a)*length,y:origin.y+Math.sin(a)*length,vx:0,vy:0,life:.14,damage:w.damage,pierce:w.pierce,hitTargets:new Set(),damageApplied:false,color:FRIENDLY_SHOT_COLOR,weaponId:w.id,source,height:source==='drone'?48:12});beep(1100,.09,'sine',.02);return}for(let i=0;i<w.pellets;i++){const angle=a+(i-(w.pellets-1)/2)*w.spread,offset=w.spread?0:(i-(w.pellets-1)/2)*9;shots.push({x:origin.x-Math.sin(a)*offset,y:origin.y+Math.cos(a)*offset,vx:Math.cos(angle)*w.speed,vy:Math.sin(angle)*w.speed,life:1.5,damage:w.damage,pierce:w.pierce,hitTargets:new Set(),color:FRIENDLY_SHOT_COLOR,weaponId:w.id,source,height:source==='drone'?48:12,blastRadius:w.blastRadius,crescent:w.id==='crescent',waveRadius:w.waveRadius,knockback:w.knockback,boomerang:w.id==='boomerang',returnRange:w.returnRange,traveled:0,returning:false})}if(w.id==='crescent')beep(380,.14,'triangle',.025);else if(w.id==='rocket')beep(110,.14,'square',.03);else if(w.id==='boomerang')beep(520,.08,'triangle',.02);else if(w.id==='barrett')beep(65,.22,'sawtooth',.045);else if(w.id==='sniper')beep(100,.15,'sawtooth',.035);else if(w.id==='magnum')beep(75,.18,'square',.03);else if(w.itemId==='pistol_t1')starterShotSound();else shotSound()}
function criticalProfile(e){return {critChance:Math.max(0,Math.min(1,(e?.critChance||0)+(armor?.critChanceBonus||0)+mountCritBonus())),critMultiplier:Math.max(1,(e?.critMultiplier||2)+(armor?.critDamageBonus||0))}}
function emitWeaponShots(w,a,origin,source='weapon'){return globalThis.TalentRuntime?TalentRuntime.withWeapon(w,source,()=>emitWeaponShotsBase(w,a,origin,source)):emitWeaponShotsBase(w,a,origin,source);}
function emitWeaponShotsBase(w,a,origin,source='weapon'){if(w.itemId){emitModelWeapon(w,a,origin,source);return;}const start=shots.length,profile=criticalProfile(w);emitWeaponShotsInternal(w,a,origin,source);for(let i=start;i<shots.length;i++){Object.assign(shots[i],profile);if(shots[i].blastRadius)shots[i].blastRadius*=shoes?.explosionRadiusMultiplier||1;}applyDrinkVolley(start,origin,source);}
function planeVulnerabilityMultiplier(e){return e&&time<(e.planeVulnerableUntil||0)?1+(e.planeVulnerableStacks||0)*(e.planeVulnerablePerStack||0):1;}
function applyPlaneVulnerability(e,s){
 if(!s.planeBullet||!s.vulnerablePerStack||!isAttackable(e))return;
 const stacks=time<(e.planeVulnerableUntil||0)?e.planeVulnerableStacks||0:0;
 e.planeVulnerableStacks=Math.min(s.vulnerableMax,stacks+1);
 e.planeVulnerablePerStack=s.vulnerablePerStack;e.planeVulnerableUntil=time+s.vulnerableDuration;
}
function drawPlaneVulnerability(e,x,z){
 if(planeVulnerabilityMultiplier(e)<=1)return;
 const stacks=e.planeVulnerableStacks,y=e.type==='boss'?78:53;
 for(let i=0;i<stacks;i++)renderer.emissiveBox(x+(i-(stacks-1)/2)*4,y,z+2,3,3,2,'#ff9b67');
}
function resolveShotDamage(s,baseDamage,target){if(s.source==='drone')baseDamage*=1+.02*talentLevel('drone');if(target?.type==='ufoBoss'&&ufoShieldActive(target))return {damage:0,critical:false,shielded:true};const critical=(s.critChance||0)>0&&Math.random()<Math.min(1,s.critChance);return {damage:baseDamage*(critical?Math.max(1,s.critMultiplier||2):1)*planeVulnerabilityMultiplier(target)*(target&&time<(target.companionWeakUntil||0)?1+(target.companionWeak||0):1),critical}}
function tryCriticalHeal(){if(!armor?.critHealChance||p.hp>=p.max||Math.random()>=armor.critHealChance)return;p.hp=Math.min(p.max,p.hp+armor.critHealAmount);burst(p.x,p.y,'#c94a70',10);cashPopups.push({text:'吸血 +1',x:p.x,y:p.y,height:70,age:0,life:.65});if(cashPopups.length>24)cashPopups.shift();updateUI()}
function showDamageNumber(e,amount,critical=false){
 if(!Number.isFinite(amount)||amount<=0)return;
 const recent=cashPopups.find(q=>q.damageNumber&&q.target===e&&q.critical===critical&&q.age<.065);
 const format=n=>n<.1?n.toFixed(2):Number(n.toFixed(1)).toString();
 if(recent){recent.amount+=amount;recent.text=format(recent.amount)+(critical?'!':'');return;}
 const serial=e.damagePopupSerial=(e.damagePopupSerial||0)+1;
 cashPopups.push({damageNumber:true,critical,target:e,amount,text:format(amount)+(critical?'!':''),x:e.x+(serial%3-1)*10,y:e.y,height:critical?100:78,age:0,life:critical?.75:.62});
 if(cashPopups.length>24)cashPopups.shift();
}
function showCritical(e){if(time-(e.critAt??-Infinity)<.12)return;e.critAt=time;cashPopups.push({text:'暴击',x:e.x,y:e.y,height:65,age:0,life:.55});if(cashPopups.length>24)cashPopups.shift()}
function shootWeapon(a){emitWeaponShots(weapon,a,p);shootTimer=weapon.interval;applyWeaponRecoil(weapon,a)}
function updateSawDrone(dt,targets){
 droneShootTimer=Math.max(0,droneShootTimer-dt*attackSpeedMultiplier());if(droneShootTimer>0)return;
 let fired=false;for(let i=0;i<3;i++){const at=dronePosition(i),touching=targets.filter(e=>isAttackable(e)&&Math.hypot(e.x-at.x,e.y-at.y)<=drone.sawRadius+e.r);if(!touching.length)continue;
 shots.push({beam:true,arc:true,radial:true,arcTargets:touching,originX:at.x,originY:at.y,x:at.x,y:at.y,vx:0,vy:0,life:.08,damage:drone.damage,...criticalProfile(drone),pierce:touching.length+1,hitTargets:new Set(),damageApplied:false,color:FRIENDLY_SHOT_COLOR,source:'drone',weaponId:'chainsaw',radius:drone.sawRadius,height:20});fired=true;}
 if(fired)droneShootTimer=drone.interval;
}
function swordBlades(){if(shoes?.id!=='neonsword')return [];return shoes.blades??=Array.from({length:3},(_,i)=>({index:i,cool:i*shoes.interval/3,stroke:null}))}
function swordHome(i){const slot=i*TAU/3,x=p.x+Math.cos(slot)*shoes.hoverRadius,y=p.y+Math.sin(slot)*shoes.hoverRadius,targets=combatTargets(),target=targets.length?targets.reduce((a,b)=>Math.hypot(a.x-x,a.y-y)<Math.hypot(b.x-x,b.y-y)?a:b):null;return {x,y,angle:target?Math.atan2(target.y-y,target.x-x):Math.PI/2}}
function swordPose(b){const home=swordHome(b.index),stroke=state==='combat'?b.stroke:null;if(!stroke)return home;const out=stroke.age<=.14,t=out?Math.min(1,stroke.age/.14):Math.min(1,(stroke.age-.14)/.18),ease=t*t*(3-2*t),from=out?stroke.start:stroke.end,to=out?stroke.end:{x:home.x-p.x,y:home.y-p.y};return {x:p.x+from.x+(to.x-from.x)*ease,y:p.y+from.y+(to.y-from.y)*ease,angle:stroke.angle}}
function updateMountedSwords(dt,targets){if(shoes?.id!=='neonsword'||state!=='combat'||paused)return;for(const b of swordBlades()){b.cool=Math.max(0,b.cool-dt*attackSpeedMultiplier());if(!b.stroke&&b.cool<=0){const home=swordHome(b.index),near=targets.filter(e=>isAttackable(e)&&Math.hypot(e.x-p.x,e.y-p.y)<=shoes.stabRange);if(near.length){const target=near.reduce((a,c)=>Math.hypot(a.x-home.x,a.y-home.y)<Math.hypot(c.x-home.x,c.y-home.y)?a:c),dx=target.x-home.x,dy=target.y-home.y,angle=Math.atan2(dy,dx),endX=target.x-p.x+Math.cos(angle)*10,endY=target.y-p.y+Math.sin(angle)*10,length=Math.hypot(endX,endY),scale=Math.min(1,shoes.stabRange/Math.max(1,length));b.stroke={age:0,start:{x:home.x-p.x,y:home.y-p.y},end:{x:endX*scale,y:endY*scale},angle,hitTargets:new Set(),damage:shoes.damage,...criticalProfile(shoes)};b.cool=shoes.interval;beep(700,.045,'triangle',.012)}}if(!b.stroke)continue;const old=swordPose(b),stroke=b.stroke,previousAge=stroke.age;stroke.age=Math.min(.32,stroke.age+dt);const at=swordPose(b),strike=previousAge<.14&&stroke.age>.14?{x:p.x+stroke.end.x,y:p.y+stroke.end.y}:at,dx=Math.cos(at.angle)*20,dy=Math.sin(at.angle)*20;if(previousAge<.14){const touching=targets.filter(e=>isAttackable(e)&&!stroke.hitTargets.has(e)&&(segmentHits(old.x,old.y,strike.x,strike.y,e,5)||segmentHits(old.x+dx,old.y+dy,strike.x+dx,strike.y+dy,e,5)||segmentHits(strike.x-dx*.5,strike.y-dy*.5,strike.x+dx,strike.y+dy,e,5)));if(touching.length)shots.push({beam:true,arc:true,radial:true,arcTargets:touching,originX:at.x,originY:at.y,x:at.x,y:at.y,vx:0,vy:0,life:.04,damage:stroke.damage,critChance:stroke.critChance,critMultiplier:stroke.critMultiplier,pierce:99,hitTargets:stroke.hitTargets,damageApplied:false,color:FRIENDLY_SHOT_COLOR,source:'mount',weaponId:'flysword',mountedSword:true})}if(stroke.age>=.32)b.stroke=null}}
function companionHit(e,targets,at){if(!targets.length)return;shots.push({beam:true,arc:true,radial:true,arcTargets:targets,originX:at.x,originY:at.y,x:at.x,y:at.y,vx:0,vy:0,life:.04,damage:e.damage,pierce:99,hitTargets:new Set(),damageApplied:false,color:FRIENDLY_SHOT_COLOR,source:'drone',weaponId:e.id,companionHit:true});}
function updateCompanion(dt,targets){
 if(paused||!['combat','survival'].includes(state))return;
 const e=drone,m=e.motion??={x:p.x,y:p.y-35,clock:e.interval,block:0,returning:false,target:null};
 m.clock=Math.max(0,m.clock-dt);m.block=Math.max(0,m.block-dt);targets=targets.filter(isAttackable);
 const nearest=targets.length?targets.reduce((a,b)=>Math.hypot(a.x-m.x,a.y-m.y)<Math.hypot(b.x-m.x,b.y-m.y)?a:b):null;
 if(e.id==='ram'){
  if(!m.target&&!m.returning&&m.clock<=0&&nearest){m.target=nearest;m.clock=e.interval;}
  if(m.target&&!isAttackable(m.target)){m.target=null;m.returning=true;}
  const at=m.target||{x:p.x,y:p.y-35},dx=at.x-m.x,dy=at.y-m.y,length=Math.hypot(dx,dy),step=Math.min(length,e.speed*dt),old={x:m.x,y:m.y};
  if(length){m.x+=dx/length*step;m.y+=dy/length*step;}
  if(m.target&&segmentHits(old.x,old.y,m.x,m.y,m.target,14)){companionHit(e,[m.target],m);m.target=null;m.returning=true;}
  if(m.returning&&Math.hypot(m.x-p.x,m.y-(p.y-35))<8)m.returning=false;
 }else if(e.id==='interceptor'){
  m.x=p.x+Math.cos(time*e.orbitSpeed)*e.orbitRadius;m.y=p.y+Math.sin(time*e.orbitSpeed)*e.orbitRadius;
  if(m.clock<=0){companionHit(e,targets.filter(t=>Math.hypot(t.x-m.x,t.y-m.y)<t.r+15),m);m.clock=e.interval;}
  if(m.block<=0){const at=bullets.findIndex(b=>segmentHits(b.px??b.x,b.py??b.y,b.x,b.y,{x:m.x,y:m.y,r:15},b.r||3));if(at>=0){bullets.splice(at,1);m.block=e.blockInterval;burst(m.x,m.y,'#8ee6ff',5);}}
 }else{
  const follow=1-Math.exp(-dt*8);m.x+=(p.x-30-m.x)*follow;m.y+=(p.y-25-m.y)*follow;
  if(m.clock<=0){
   if(e.id==='weakener'&&nearest){nearest.companionWeak=e.vulnerability;nearest.companionWeakUntil=time+e.duration;burst(nearest.x,nearest.y,'#e2a5ff',4);m.clock=e.interval;}
   else if(e.id==='medic'){if(p.hp<p.max){p.hp=Math.min(p.max,p.hp+1);burst(p.x,p.y,'#a6f2b4',6);updateUI();}m.clock=e.interval;}
   else if(e.id==='charger'){if(p.shield<shieldMaximum()){p.shield++;burst(p.x,p.y,'#8ee6ff',6);updateUI();}m.clock=e.interval;}
  }
 }
 m.x=Math.max(A.x+8,Math.min(A.x+A.w-8,m.x));m.y=Math.max(A.y+8,Math.min(A.y+A.h-8,m.y));
}
function drawCompanion(){
 const e=drone,at=dronePosition(),r=renderer,color=WEAPON_GRADES[e.tier].color;
 r.residentMesh('companion:'+e.id+':'+e.tier,()=>{r.sphere(0,0,0,1,'#354d5a',12,9,12,6,9);r.emissiveBox(0,0,11,10,3,2,color);for(const side of [-1,1])r.box(side*15,0,0,12,3,7,'#a6b7bb');if(e.id==='ram')r.box(0,0,-15,5,5,17,'#dde6df');if(e.id==='interceptor')r.ring(0,0,0,19,color,3);if(e.id==='medic'){r.emissiveBox(0,10,0,4,2,13,'#a6f2b4');r.emissiveBox(0,10,0,13,2,4,'#a6f2b4');}if(e.id==='charger')r.emissiveBox(0,10,0,10,4,10,'#8ee6ff');if(e.id==='weakener')r.emissiveBox(0,11,0,3,12,3,'#e2a5ff');},monsterPose(at.x-325,37+Math.sin(time*4)*2,(at.y-300)*1.06));
 if(e.id==='weakener')for(const t of combatTargets())if(time<(t.companionWeakUntil||0))r.ring(t.x-325,3,(t.y-300)*1.06,t.r+5,'#e2a5ff',2);
}
function updateDrone(dt,targets){if(!drone)return;if(drone.companion){updateCompanion(dt,targets);return;}if(drone.id==='flysword')return;if(drone.id==='chainsaw'){updateSawDrone(dt,targets);return}droneShootTimer=Math.max(0,droneShootTimer-dt*attackSpeedMultiplier());if(!targets.length||(drone.id!=='rotor'&&droneShootTimer>0))return;const origin=dronePosition(),target=targets.reduce((a,b)=>Math.hypot(a.x-origin.x,a.y-origin.y)<Math.hypot(b.x-origin.x,b.y-origin.y)?a:b);emitWeaponShots(drone,Math.atan2(target.y-origin.y,target.x-origin.x),origin,'drone');droneShootTimer=drone.interval}
const TILE=LIFT_MAP.tile,ORBIT_SAW_ENABLED=true;let grid={minX:-(LIFT_MAP.columns-1)/2,maxX:(LIFT_MAP.columns-1)/2,minY:-LIFT_MAP.backRows,maxY:LIFT_MAP.frontRows};let tiles=[];
function syncGrid(){grid.minX=-(LIFT_MAP.columns-1)/2;grid.maxX=-grid.minX;grid.minY=-LIFT_MAP.backRows;grid.maxY=LIFT_MAP.frontRows;A.x=325+(grid.minX-.5)*TILE;A.w=(grid.maxX-grid.minX+1)*TILE;A.y=300+(grid.minY-.5)*TILE;A.h=(grid.maxY-grid.minY+1)*TILE}
function gridCapacity(){return (grid.maxX-grid.minX+1)*(grid.maxY-grid.minY+1)}let picked={};
// Terrain economy and passives. Catalogue is generated from the reviewed CSV.
const TERRAIN_CATALOG=[
 {
  "id": "T001",
  "kind": "扩建",
  "tile": "通用",
  "name": "扩建",
  "fixed": true,
  "price": 3,
  "weight": 0,
  "desc": "扩建3格，随机发现地形。",
  "implementation": "付款后预留3个相邻未开发格；按既有扩地随机表决定特殊地块及危险机关。下一层落地闪烁后统一提交；地图剩余不足3格时按实际格数收费，每格1建材。",
  "exclusive": ""
 },
 {
  "id": "T003",
  "kind": "拆除",
  "tile": "通用",
  "name": "拆除工程",
  "fixed": false,
  "price": 3,
  "weight": 50,
  "desc": "拆除1个永久危险源。",
  "implementation": "付款时预留1次永久危险源移除；按既有规则选取最近合法目标，下一层落地闪烁后移除，底板保留。不移除临时炮台、普通敌人或BOSS。",
  "exclusive": ""
 },
 {
  "id": "T004",
  "kind": "地块建造",
  "tile": "医疗格",
  "name": "医疗格",
  "fixed": false,
  "price": 4,
  "weight": 50,
  "desc": "每30秒产出1格治疗。",
  "implementation": "将1个合法普通地板改为医疗格；基础生产周期30秒，每份医疗包回复1格生命。单格默认存1份，未领取时停产。生产进度和存货跨层保留。",
  "exclusive": ""
 },
 {
  "id": "T005",
  "kind": "地块建造",
  "tile": "护盾格",
  "name": "护盾格",
  "fixed": false,
  "price": 4,
  "weight": 50,
  "desc": "每40秒产出1格护盾。",
  "implementation": "将1个合法普通地板改为护盾格；基础周期40秒，每份补充1格普通护盾，不超过当前装备决定的护盾上限。单格默认存1份，进度和存货跨层保留。",
  "exclusive": ""
 },
 {
  "id": "T006",
  "kind": "地块建造",
  "tile": "印钞格",
  "name": "印钞格",
  "fixed": false,
  "price": 6,
  "weight": 50,
  "desc": "靠近反复铲，进度扣完得$3。",
  "implementation": "将1个合法普通地板改为印钞格；玩家在1.5格内按铲子攻速反复挖掘，铲头每次触地才扣减剩余工作量；基础铲每秒2次、每次2点，15铲约7.2秒扣完30点产出3金币。铲子从格子正上方垂直下插后原位渐隐，无拔起；离开暂停。单格存1份，进度和存货跨层保留；仅限时战斗允许生产和领取。",
  "exclusive": ""
 },
 {
  "id": "T007",
  "kind": "地块建造",
  "tile": "震荡格",
  "name": "震荡格",
  "fixed": false,
  "price": 4,
  "weight": 50,
  "desc": "踩入清弹，冷却35秒。",
  "implementation": "将1个合法普通地板改为震荡格；初始可用，踩入清除全场普通敌弹，冷却35秒。必须离开后再踩入；冷却跨层保留，不在商店或过场推进。",
  "exclusive": ""
 },
 {
  "id": "T008",
  "kind": "地块建造",
  "tile": "掩体格",
  "name": "掩体格",
  "fixed": false,
  "price": 3,
  "weight": 50,
  "desc": "4耐久掩体，每关恢复。",
  "implementation": "将1个合法普通地板改为掩体格，基础耐久4点。阻挡玩家、小怪和敌弹；友方攻击穿过。碎裂保留可通行底座，每个新战斗房恢复；BOSS身体接触直接撞碎。",
  "exclusive": ""
 },
 {
  "id": "T009",
  "kind": "稀有被动",
  "tile": "医疗格",
  "name": "急救箱",
  "fixed": false,
  "price": 6,
  "weight": 1,
  "desc": "医疗包治疗翻倍，周期延长50%。",
  "implementation": "医疗类产物治疗基数由1变2；医疗格周期乘1.5，故基础周期由30变45秒。生产加速在该周期上另行乘算。与护甲医疗强化取较大治疗基数，不直接相加。",
  "exclusive": ""
 },
 {
  "id": "T010",
  "kind": "稀有被动",
  "tile": "医疗格",
  "name": "储药柜",
  "fixed": false,
  "price": 5,
  "weight": 1,
  "desc": "医疗格可储存3份物资。",
  "implementation": "每格最多存3份医疗类产物，逐份独立记录类型、治疗量。拾取间隔0.5秒，单次只取1份；达到容量时暂停生产，取走后从0开始新一轮。",
  "exclusive": ""
 },
 {
  "id": "T011",
  "kind": "稀有被动",
  "tile": "医疗格",
  "name": "肾上腺素",
  "fixed": false,
  "price": 5,
  "weight": 1,
  "desc": "偶产激素：降至1血，永久加速。",
  "implementation": "仅限时战斗中，医疗生产完成时10%概率替换为肾上腺素；急救箱不提高收益。主动确认使用后生命降到1、普通护盾清零，生命上限不变；本局永久移速+8%、主武器攻速+12%，最多使用3次。达到上限或处于不限时关卡时改产普通医疗物资。",
  "exclusive": ""
 },
 {
  "id": "T034",
  "kind": "稀有被动",
  "tile": "医疗格",
  "name": "时间药丸",
  "fixed": false,
  "price": 7,
  "weight": 1,
  "desc": "拾取医疗物资，触发3秒慢时间。",
  "implementation": "拾取并消耗任一医疗类产物后触发3秒子弹时间：敌人、敌我弹丸、导弹、激光阶段和爆炸危险时钟按35%运行；玩家移动及攻击操作保持正常。关卡倒计时、印钞及暂停规则不变；同类刷新持续时间，和其他慢时间取最慢倍率，不连乘。",
  "exclusive": ""
 },
 {
  "id": "T013",
  "kind": "稀有被动",
  "tile": "医疗格",
  "name": "溢出疗法",
  "fixed": false,
  "price": 5,
  "weight": 1,
  "desc": "溢出治疗转为护盾。",
  "implementation": "按实际治疗量先回复缺失生命，再将剩余治疗点数按1:1补充普通护盾，不突破当前护盾上限。实际消耗于补盾的治疗点不再参与药品回收。",
  "exclusive": ""
 },
 {
  "id": "T035",
  "kind": "稀有被动",
  "tile": "医疗格",
  "name": "药品回收",
  "fixed": false,
  "price": 5,
  "weight": 1,
  "desc": "限时关每点剩余治疗换$2。",
  "implementation": "限时战斗中，医疗包/急救箱治疗和溢出疗法处理后，每剩余1点无法使用的治疗量兑换基础2金币，允许满血领取，金币倍率只应用一次。不限时关卡关闭回收及仅为回收而产生的满血自动拾取；保留正常治疗。非治疗型产物不参与。",
  "exclusive": ""
 },
 {
  "id": "T036",
  "kind": "稀有被动",
  "tile": "医疗格",
  "name": "营养汤剂",
  "fixed": false,
  "price": 6,
  "weight": 1,
  "desc": "偶产汤剂，永久提升移速和攻速。",
  "implementation": "仅限时战斗中，医疗生产完成时20%概率替换为汤剂，饮用后本局永久移速和主武器攻速各+1个百分点；拥有急救箱时各+2个百分点。该被动累计两项各最多+20个百分点；达到上限或处于不限时关卡时改产正常医疗物资。",
  "exclusive": ""
 },
 {
  "id": "T037",
  "kind": "稀有被动",
  "tile": "医疗格",
  "name": "快速制药",
  "fixed": false,
  "price": 5,
  "weight": 1,
  "desc": "医疗格生产速度+25%。",
  "implementation": "医疗格生产速度乘1.25；与催化鞋等已有生产倍率乘算。基础30秒变24秒；有急救箱时45秒变36秒；库存已满仍停产。",
  "exclusive": ""
 },
 {
  "id": "T014",
  "kind": "稀有被动",
  "tile": "护盾格",
  "name": "超载电池",
  "fixed": false,
  "price": 6,
  "weight": 1,
  "desc": "护盾产物一次补充2格。",
  "implementation": "新生成的普通护盾产物改为大型电池，一次补充2格普通护盾；不突破护盾上限，生产周期不变。震荡弹不属于普通护盾产物。",
  "exclusive": ""
 },
 {
  "id": "T015",
  "kind": "稀有被动",
  "tile": "护盾格",
  "name": "备用电池仓",
  "fixed": false,
  "price": 5,
  "weight": 1,
  "desc": "护盾格可储存2份物资。",
  "implementation": "每个护盾格容量由1份变2份，逐份保留普通电池/大型电池/震荡弹类型。取走一份后才能继续补库存，逐份领取间隔0.5秒。",
  "exclusive": ""
 },
 {
  "id": "T038",
  "kind": "稀有被动",
  "tile": "护盾格",
  "name": "快速充能",
  "fixed": false,
  "price": 5,
  "weight": 1,
  "desc": "护盾格生产速度+25%。",
  "implementation": "护盾格生产速度乘1.25；基础40秒变32秒，与装备生产加速乘算，普通电池与震荡弹均使用该生产线。",
  "exclusive": ""
 },
 {
  "id": "T016",
  "kind": "稀有被动",
  "tile": "护盾格",
  "name": "静电释放",
  "fixed": false,
  "price": 5,
  "weight": 1,
  "desc": "拾取护盾物资，清除身边敌弹。",
  "implementation": "拾取任一护盾格产物时，以玩家为圆心清除半径1格的普通敌弹。每份产物只触发一次，满盾也允许领取普通电池并触发。",
  "exclusive": ""
 },
 {
  "id": "T017",
  "kind": "稀有被动",
  "tile": "护盾格",
  "name": "保险丝",
  "fixed": false,
  "price": 5,
  "weight": 1,
  "desc": "破盾时加快附近护盾格生产。",
  "implementation": "从有普通护盾变成0护盾的有效受击触发；半径2格内每个护盾格生产推进6秒等效基础工作量，全场共享10秒触发冷却。最多完成当前一份，不溢出到后续份；库存满无效。",
  "exclusive": ""
 },
 {
  "id": "T018",
  "kind": "稀有被动",
  "tile": "护盾格",
  "name": "屏障投射器",
  "fixed": false,
  "price": 7,
  "weight": 1,
  "desc": "拾取护盾物资，展开3秒减速场。",
  "implementation": "拾取护盾格产物后，以玩家为圆心生成半径1.5格、持续3秒的移动减速场。进入范围的普通敌弹速度为正常35%；离场恢复原速，不修改原始速度。同类场不叠加，重复拾取刷新时间。",
  "exclusive": ""
 },
 {
  "id": "T039",
  "kind": "稀有被动",
  "tile": "护盾格",
  "name": "护盾回收",
  "fixed": false,
  "price": 5,
  "weight": 1,
  "desc": "限时关每格溢出护盾换$2。",
  "implementation": "仅限时战斗中，普通电池先补足缺失护盾，每剩余1格不能使用的护盾值兑换基础2金币，满盾允许领取，大型电池按2格结算。不限时关卡关闭回收及仅为回收产生的满盾拾取例外，保留补盾及其他拾取被动。震荡弹不回收。",
  "exclusive": ""
 },
 {
  "id": "T040",
  "kind": "稀有被动",
  "tile": "护盾格",
  "name": "工业转型",
  "fixed": false,
  "price": 7,
  "weight": 1,
  "desc": "满盾时，护盾格改产震荡弹。",
  "implementation": "每次护盾格完成生产时检查玩家普通护盾：已满则将本份产物生成震荡弹，否则生成正常电池。产物类型在生成时锁定；震荡弹拾取立即执行一次以玩家为中心的震荡，不补盾、不换钱。",
  "exclusive": ""
 },
 {
  "id": "T019",
  "kind": "稀有被动",
  "tile": "印钞格",
  "name": "钱袋许可",
  "fixed": false,
  "price": 8,
  "weight": 1,
  "desc": "钱袋$8，需要40点挖掘。",
  "implementation": "印钞产物变为基础价值8金币的钱袋，需要40点挖掘进度，每次铲头触地扣减，仍需玩家靠近。与流水作业互斥，购买替换旧方案但不退建材；已生成产物保留旧面值，新生产采用新方案。",
  "exclusive": "流水作业"
 },
 {
  "id": "T020",
  "kind": "稀有被动",
  "tile": "印钞格",
  "name": "流水作业",
  "fixed": false,
  "price": 5,
  "weight": 1,
  "desc": "$2钞票，需要20点挖掘。",
  "implementation": "需要20点挖掘进度，产物基础价值2金币，每次铲头触地扣减，仍需玩家靠近。与钱袋许可互斥，购买时替换，旧库存面值不变；切换时保留生产完成比例。",
  "exclusive": "钱袋许可"
 },
 {
  "id": "T021",
  "kind": "稀有被动",
  "tile": "印钞格",
  "name": "乾坤一掷",
  "fixed": false,
  "price": 6,
  "weight": 1,
  "desc": "拾钞时向四周发射金币弹。",
  "implementation": "每拾取1份印钞产物，以玩家为中心发射12枚均匀环形金币弹；每枚伤害为当前主武器单发基础伤害的35%，在拾取时快照。穿透1个目标，不暴击、不触发武器命中被动；伤害不取决于余额或产物面值。",
  "exclusive": ""
 },
 {
  "id": "T022",
  "kind": "稀有被动",
  "tile": "印钞格",
  "name": "督工",
  "fixed": false,
  "price": 6,
  "weight": 1,
  "desc": "附近印钞格生产速度+50%。",
  "implementation": "玩家距印钞格中心不超过1.5格时，该格生产速度额外乘1.5；离开立即移除本倍率，当前进度保留。各印钞格独立检查，与贪婪护甲和催化鞋倍率乘算。",
  "exclusive": ""
 },
 {
  "id": "T023",
  "kind": "稀有被动",
  "tile": "印钞格",
  "name": "现金装甲",
  "fixed": false,
  "price": 6,
  "weight": 1,
  "desc": "拾钞可获得短时一次防护。",
  "implementation": "领取印钞产物时获得1层持续4秒的临时防护，最多1层；抵挡下一次普通伤害后消失并触发正常受击无敌。全场共享8秒授予冷却；冷却内拾取仍正常给钱但不授予/延长防护。",
  "exclusive": ""
 },
 {
  "id": "T024",
  "kind": "稀有被动",
  "tile": "震荡格",
  "name": "余震模块",
  "fixed": false,
  "price": 7,
  "weight": 1,
  "desc": "震荡后1秒，再清弹一次。",
  "implementation": "每次有效震荡在1秒后追加一次普通全屏清弹。余震不递归派发震荡事件、不消耗次数、不返还冷却；结算时清除未触发余震。",
  "exclusive": ""
 },
 {
  "id": "T025",
  "kind": "稀有被动",
  "tile": "震荡格",
  "name": "驻留力场",
  "fixed": false,
  "price": 7,
  "weight": 1,
  "desc": "震荡后留下3秒清弹力场。",
  "implementation": "有效震荡发生时，在震荡源位置留下半径1.5格、持续3秒的固定清弹场；每帧销毁进入范围的普通敌弹，不伤害敌人。重叠区域效果不叠加。",
  "exclusive": ""
 },
 {
  "id": "T026",
  "kind": "稀有被动",
  "tile": "震荡格",
  "name": "冲击模块",
  "fixed": false,
  "price": 5,
  "weight": 1,
  "desc": "震荡击退附近小怪。",
  "implementation": "有效震荡额外将距离震荡源2格内的小怪沿远离源点方向击退最多1格；位移受合法边界和掩体阻挡。对BOSS及其身体段无效。",
  "exclusive": ""
 },
 {
  "id": "T028",
  "kind": "稀有被动",
  "tile": "震荡格",
  "name": "蓄能装置",
  "fixed": false,
  "price": 6,
  "weight": 1,
  "desc": "震荡格最多储存2次。",
  "implementation": "震荡格容量由1次变2次；购买时保留现有次数，不立即白送充能。单条35秒基础充能线逐次恢复；库存满停充，初次新建仍只带1次。",
  "exclusive": ""
 },
 {
  "id": "T041",
  "kind": "稀有被动",
  "tile": "震荡格",
  "name": "激发",
  "fixed": false,
  "price": 7,
  "weight": 1,
  "desc": "踩震荡格，加快其他地块运转。",
  "implementation": "手动踩震荡格产生主震荡时，其他生产地块当前产物推进3秒基础工作量，其他震荡格充能推进3秒；全场共享8秒触发冷却。最多完成当前一份/一次，不溢出，不影响源震荡格。",
  "exclusive": ""
 },
 {
  "id": "T042",
  "kind": "稀有被动",
  "tile": "震荡格",
  "name": "震荡手雷",
  "fixed": false,
  "price": 6,
  "weight": 1,
  "desc": "震荡使小怪眩晕1.2秒。",
  "implementation": "有效主震荡使全场可攻击小怪眩晕1.2秒，暂停其移动、攻击及预警进度，结束后继续。对BOSS、炮台无效；重复眩晕取更长剩余时间，不相加。",
  "exclusive": ""
 },
 {
  "id": "T029",
  "kind": "稀有被动",
  "tile": "掩体格",
  "name": "加固框架",
  "fixed": false,
  "price": 4,
  "weight": 1,
  "desc": "掩体耐久+1。",
  "implementation": "所有现有与未来掩体最大耐久增加1点；购买时完整掩体同时补1点耐久，碎裂掩体不立即复活。每关恢复按新上限。",
  "exclusive": ""
 },
 {
  "id": "T030",
  "kind": "稀有被动",
  "tile": "掩体格",
  "name": "反应装甲",
  "fixed": false,
  "price": 7,
  "weight": 1,
  "desc": "掩体碎裂时触发震荡。",
  "implementation": "完整掩体从正耐久变成碎裂时，以掩体为震荡源释放一次全屏普通清弹；可联动余震、驻留力场、冲击模块和震荡手雷，但不触发激发。仅真实碎裂触发。",
  "exclusive": ""
 },
 {
  "id": "T031",
  "kind": "稀有被动",
  "tile": "掩体格",
  "name": "维修装置",
  "fixed": false,
  "price": 5,
  "weight": 1,
  "desc": "掩体脱战5秒后缓慢修复。",
  "implementation": "完整掩体连续5秒未受伤后，每2秒恢复1点耐久，直到上限；受伤重置等待及修复计时，碎裂不修复。仅战斗中按世界时间推进。",
  "exclusive": ""
 },
 {
  "id": "T032",
  "kind": "稀有被动",
  "tile": "掩体格",
  "name": "重建结构",
  "fixed": false,
  "price": 7,
  "weight": 1,
  "desc": "掩体每关可重建1次，等待8秒。",
  "implementation": "每个掩体每关首次碎裂后等待8秒，恢复为满耐久掩体；重建位置有玩家或小怪占用时延后，不将其强行挤出。重建机会在实际完成时消耗，每关恢复1次。",
  "exclusive": ""
 },
 {
  "id": "T033",
  "kind": "稀有被动",
  "tile": "掩体格",
  "name": "碎片弹射",
  "fixed": false,
  "price": 6,
  "weight": 1,
  "desc": "掩体受击时向敌人弹射碎片。",
  "implementation": "掩体因普通敌弹、激光或小怪接触损失耐久时，朝伤害来源发射3枚小角度扇形碎片，每枚为当前主武器单发基础伤害的25%。单掩体共享0.5秒触发冷却，碎裂一击也可触发。",
  "exclusive": ""
 }
];
let terrainView='equipment',barItems=[],barRefreshes=0;
let terrainPassives=new Set(),terrainPurchased=new Set(),terrainRun;
function freshTerrainRun(){return {move:0,attack:0,adrenaline:0,nutrition:0,slow:0,stim:0,combat:0,field:0,cashArmor:0,cashLock:0,fuseLock:0,exciteLock:0,areas:[],echoes:[]};}
terrainRun=freshTerrainRun();
function terrainHas(name){return terrainPassives.has(name);}
function terrainActive(){return !paused&&['combat','survival'].includes(state);}
function resetTerrainSystem(){terrainView='equipment';barItems=[];barRefreshes=0;terrainPassives=new Set();terrainPurchased=new Set();terrainRun=freshTerrainRun();}
function terrainDef(id){return TERRAIN_CATALOG.find(d=>d.id===id||d.name===id);}
function terrainItemKey(d){return ({医疗格:'medical',护盾格:'shield',印钞格:'cashTile',震荡格:'shockTile',掩体格:'coverTile'})[d.tile];}
function terrainDefUsable(d){
 if(!d)return false;
 if(d.kind==='稀有被动')return !terrainPurchased.has(d.name);
 return shopUsable({key:d.kind==='扩建'?'floor':d.kind==='拆除'?'erase':terrainItemKey(d),amount:1});
}
function grantTerrainPassive(name){
 const d=terrainDef(name);if(!d||d.kind!=='稀有被动'||terrainPurchased.has(d.name))return false;
 const targets=[...new Set([...tiles,...(shopTerrainPlan?.tiles||[])])];
 const durations=targets.map(t=>supplyTime(t)),capacities=targets.map(t=>terrainSupplyCapacity(t));terrainPurchased.add(d.name);
 if(d.exclusive)terrainPassives.delete(d.exclusive);terrainPassives.add(d.name);
 for(let i=0;i<targets.length;i++){
  const t=targets[i];if(t.medical||t.shieldTile||t.cashTile){const full=terrainQueue(t).length>=capacities[i];t.healProgress=full&&terrainSupplyCapacity(t)>capacities[i]?0:(t.healProgress||0)/durations[i]*supplyTime(t);}
  if(d.name==='加固框架'&&coverAlive(t))t.coverHp=(t.coverHp??coverMaximum())+1;
 }
 updateUI();return true;
}
// Bar stock/UI is reserved for later; every cleared floor currently opens the ordinary shop.
function terrainShopSettlement(){terrainView='equipment';barItems=[];barRefreshes=0;}
function ordinaryTerrainItem(){const pool=TERRAIN_CATALOG.filter(d=>!d.fixed&&terrainDefUsable(d)),d=pool[Math.floor(Math.random()*pool.length)];if(!d)return randomEquipmentShopItem();if(d.kind==='稀有被动')return {key:'terrainPassive',terrainId:d.id,name:d.name,desc:d.desc,amount:1};return {key:d.kind==='拆除'?'erase':terrainItemKey(d),amount:1,name:d.kind==='地块建造'?'建造'+d.name:d.name,desc:d.desc};}
function shopExpansion(){const capacity=shopLevel+2,amount=Math.max(0,Math.min(capacity,gridCapacity()-(shopTerrainPlan?.tiles||tiles).length));return {key:'floor',name:'扩建地板',desc:'随机发现地形',amount,price:Math.ceil(shopPrice({key:'floor'})*amount/capacity)};}
function buyShopExpansion(){if(state!=='upgrade'||terrainView!=='equipment'||pendingEquipment)return false;const u=shopExpansion();if(u.amount<=0||cash<u.price)return false;cash-=u.price;applyReward(u);updateUI();renderShop();purchaseSound();return true;}
function rollBar(){const pool=DRINK_TYPES.filter(d=>drinkUsable(d.id));barItems=[];for(let i=0;i<3&&pool.length;i++){const at=Math.floor(Math.random()*pool.length),d=pool.splice(at,1)[0];barItems.push({...drinkShopItem(d.id),sold:false});}}
function barRerollCost(){return 5+barRefreshes*3;}
function buyBarItem(index){if(state!=='upgrade'||terrainView!=='bar'||pendingEquipment)return false;const u=barItems[index];if(!u||u.sold||cash<u.price||!drinkUsable(u.drinkId))return false;cash-=u.price;applyReward(u);u.sold=true;updateUI();renderBar();purchaseSound();return true;}
function rerollBar(){const price=barRerollCost();if(state!=='upgrade'||terrainView!=='bar'||pendingEquipment||cash<price)return false;cash-=price;barRefreshes++;rollBar();updateUI();renderBar();return true;}
function renderBar(){showOverlay(`<div class="shop-panel bar-shop"><div class="tag">ELEVATOR BAR</div><div class="shop-heading"><h2>酒吧层</h2><b class="shop-wallet">$${cash}</b></div><div class="shop-grid">${barItems.map((u,i)=>{const d=drinkDefinition(u.drinkId);return `<button class="choice shop-buy drink-card ${u.sold?'sold':''}" style="--drink-color:${d.color}" data-i="${i}" ${u.sold||cash<u.price||!drinkUsable(d.id)?'disabled':''}><b>${d.name}</b>${shopItemIcon(u,'bar-'+i)}<span>${d.permanent?'本局醉酒效果：':'醉酒效果：'}${d.cost}</span><span class="drink-gift">${d.permanent?'增益：':'醒酒：'}${d.gift}</span><strong class="shop-price">${u.sold?'已购买':'$'+u.price}</strong></button>`;}).join('')}</div><div class="shop-controls"><button id="bar-reroll" ${cash<barRerollCost()?'disabled':''}>刷新酒单 · $${barRerollCost()}</button><button id="shop-leave" class="primary">前往普通商店</button></div><small>特调可叠加 · 每次刷新涨价 $3</small></div>`);$('overlay').classList.add('shop');$('viewport').classList.add('shopping');document.querySelectorAll('.shop-buy').forEach(b=>b.onclick=()=>buyBarItem(+b.dataset.i));$('bar-reroll').onclick=rerollBar;$('shop-leave').onclick=leaveShop;}
function terrainBaseProduction(t){return t.cashTile?(terrainHas('钱袋许可')?40:terrainHas('流水作业')?20:30):t.shieldTile?40:30*(terrainHas('急救箱')?1.5:1);}
function terrainProductionMultiplier(t){const distance=Math.hypot(p.x-325-t.x*TILE,p.y-300-t.y*TILE);return (t.medical&&terrainHas('快速制药')||t.shieldTile&&terrainHas('快速充能')?1.25:1)*(t.cashTile&&terrainHas('督工')&&distance<=1.5*TILE?1.5:1);}
function terrainSupplyCapacity(t){return t.medical&&terrainHas('储药柜')?3:t.shieldTile&&terrainHas('备用电池仓')?2:1;}
function makeTerrainSupply(t,legacy=false){
 if(t.cashTile)return {kind:'cash',amount:terrainHas('钱袋许可')?8:terrainHas('流水作业')?2:3};
 if(t.shieldTile)return terrainHas('工业转型')&&p.shield>=shieldMaximum()?{kind:'shock',amount:0}:{kind:'shield',amount:terrainHas('超载电池')?2:1};
 if(!legacy&&cashTilesEnabled()){
  const roll=Math.random(),adrenaline=terrainHas('肾上腺素')&&terrainRun.adrenaline<3?.1:0,nutrition=terrainHas('营养汤剂')&&terrainRun.nutrition<.2-1e-9?.2:0;
  if(roll<adrenaline)return {kind:'adrenaline',amount:0};if(roll<adrenaline+nutrition)return {kind:'nutrition',amount:terrainHas('急救箱')?.02:.01};
 }
 return {kind:'medical',amount:terrainHas('急救箱')?2:1};
}
function terrainQueue(t){if(!t.supplyQueue)t.supplyQueue=t.medPack?[makeTerrainSupply(t,true)]:[];return t.supplyQueue;}
function terrainCanPick(t,s){
 if(s.kind==='adrenaline')return false;
 if(s.kind==='shield'&&drinkPenaltyCount('salt'))return false;
 if(s.kind==='shield'&&p.shield>=shieldMaximum())return terrainHas('静电释放')||terrainHas('屏障投射器')||terrainHas('护盾回收')&&cashTilesEnabled();
 return true;
}
function terrainCoinShot(x,y,angle,damage,count=1){
 for(let i=0;i<count;i++){const a=angle+(i-(count-1)/2)*.18;shots.push({x,y,vx:Math.cos(a)*420,vy:Math.sin(a)*420,life:1.6,damage,critChance:0,pierce:1,hitTargets:new Set(),source:'terrain',terrainShot:true,weaponId:'terrain',color:'#e7ce77',height:12});}
}
function terrainConsumeSupply(t,s){
 if(s.kind==='adrenaline'){
  if(terrainRun.adrenaline>=3)return;terrainRun.adrenaline++;p.hp=1;p.shield=0;terrainRun.move+=.08;terrainRun.attack+=.12;
 }else if(s.kind==='nutrition'){
  const gain=Math.min(s.amount,.2-terrainRun.nutrition);terrainRun.nutrition+=gain;terrainRun.move+=gain;terrainRun.attack+=gain;
 }else if(s.kind==='medical'){
  let amount=Math.max(s.amount,armor?.medicalHeal||1),heal=Math.min(amount,p.max-p.hp);p.hp+=heal;amount-=heal;
  if(terrainHas('溢出疗法')&&!drinkPenaltyCount('salt')){const shield=Math.min(amount,Math.max(0,shieldMaximum()-p.shield));p.shield+=shield;amount-=shield;}
  if(terrainHas('药品回收')&&cashTilesEnabled()&&amount>0)gainCash(amount*2,p.x,p.y);
 }else if(s.kind==='shield'){
  const fill=Math.min(s.amount,Math.max(0,shieldMaximum()-p.shield));p.shield+=fill;p.shieldHit=.25;
  if(terrainHas('护盾回收')&&cashTilesEnabled()&&s.amount>fill)gainCash((s.amount-fill)*2,p.x,p.y);
 }else if(s.kind==='shock')terrainEmitShock(p.x,p.y,'supply');
 else if(s.kind==='cash'){
  gainCash(s.amount,p.x,p.y,30);cashBurst(p.x,p.y,4);
  if(armor?.cashHeal&&!(p.cashHealLeft>0)&&p.hp<p.max){p.hp=Math.min(p.max,p.hp+armor.cashHeal);p.cashHealLeft=armor.cashHealCooldown;}
  if(terrainHas('乾坤一掷'))for(let i=0;i<12;i++)terrainCoinShot(p.x,p.y,i*TAU/12,weapon.damage*.35);
  if(terrainHas('现金装甲')&&terrainRun.cashLock<=0){terrainRun.cashArmor=4;terrainRun.cashLock=8;}
 }
 if(t.medical){if(terrainHas('应急激素'))terrainRun.stim=4;if(terrainHas('战斗处方'))terrainRun.combat=4;if(terrainHas('时间药丸'))terrainRun.slow=3;}
 if(t.shieldTile){if(terrainHas('静电释放'))terrainClearNear(p.x,p.y,TILE);if(terrainHas('屏障投射器'))terrainRun.field=3;}
 pickupSound(t.cashTile?'cash':t.shieldTile?'shield':'medical');updateUI();
}
function terrainTakeSupply(t,explicit=false){
 const queue=terrainQueue(t),s=queue[0];if(!s||s.kind==='adrenaline'&&!explicit)return false;
 if(s.kind==='adrenaline'&&terrainRun.adrenaline>=3)return false;
 terrainConsumeSupply(t,s);const wasFull=queue.length>=terrainSupplyCapacity(t);queue.shift();t.medPack=queue.length>0;t.pickup=null;t.supplyPickupLeft=.5;t.healFlash=.45;if(wasFull)t.healProgress=0;return true;
}
function terrainAdrenalineTarget(){return terrainActive()?tiles.find(t=>t.medical&&terrainQueue(t)[0]?.kind==='adrenaline'&&Math.hypot(p.x-325-t.x*TILE,p.y-300-t.y*TILE)<=Math.max(20,supplyPickupRadius())):null;}
function useTerrainAdrenaline(){const t=terrainAdrenalineTarget();if(!t)return false;return terrainTakeSupply(t,true);}
function prepareTerrainTest(){if(['menu','dead','won'].includes(state)){reset();togglePause();$('equipment-test').hidden=false;testResume=true;}testMode=true;}
function updateTerrainSupplyUI(){const button=$('terrain-adrenaline');if(!button)return;button.hidden=!terrainAdrenalineTarget();}
function terrainUpdateSupplies(dt,cashDt=dt){
 if(!terrainActive())return;
 for(const t of tiles){
  if(!t.medical&&!t.shieldTile&&!t.cashTile||t.cashTile&&!cashTilesEnabled())continue;
  const supplyDt=t.cashTile?cashDt:dt,queue=terrainQueue(t),duration=supplyTime(t),capacity=terrainSupplyCapacity(t);
  for(const s of queue)if(s.kind==='adrenaline'&&terrainRun.adrenaline>=3||s.kind==='nutrition'&&terrainRun.nutrition>=.2-1e-9){s.kind='medical';s.amount=terrainHas('急救箱')?2:1;}
  t.supplyPickupLeft=Math.max(0,(t.supplyPickupLeft||0)-supplyDt);if(t.supplyPickupLeft<1e-9)t.supplyPickupLeft=0;t.healFlash=Math.max(0,(t.healFlash||0)-dt);t.shovelImpactLeft=Math.max(0,(t.shovelImpactLeft||0)-supplyDt);
  if(queue.length&&t.supplyPickupLeft<=0){
   const head=queue[0],x=325+t.x*TILE,y=300+t.y*TILE;
   if(terrainCanPick(t,head)||t.pickup){
    let reached=false;if(t.pickup)reached=advanceSupplyPickup(t.pickup,supplyDt);
    else{const distance=Math.hypot(p.x-x,p.y-y);if(distance<20)reached=true;else if(distance<supplyPickupRadius()){t.pickup={x,y,speed:80};reached=advanceSupplyPickup(t.pickup,supplyDt);}}
    if(reached&&terrainCanPick(t,head)){terrainTakeSupply(t);continue;}
   }
  }
  if(t.cashTile){updateCashShovel(t,supplyDt);continue;}
  if(queue.length>=capacity){t.healProgress=duration;t.medPack=true;continue;}
  t.healProgress=(t.healProgress||0)+supplyDt*productionMultiplier(t);
  while(t.healProgress+1e-9>=duration&&queue.length<capacity){t.healProgress=Math.max(0,t.healProgress-duration);queue.push(makeTerrainSupply(t));beep(460,.08,'sine',.018);}
  if(queue.length>=capacity)t.healProgress=duration;t.medPack=queue.length>0;
 }
 updateTerrainSupplyUI();
}
function coverMaximum(){return COVER_HP+(terrainHas('加固框架')?1:0);}
function terrainClearNear(x,y,r){bullets=bullets.filter(b=>{const keep=Math.hypot(b.x-x,b.y-y)>r+(b.r||0);if(!keep)b.life=0;return keep;});}
function terrainPushEnemy(e,x,y,distance){const dx=e.x-x,dy=e.y-y,length=Math.hypot(dx,dy)||1,ox=e.x,oy=e.y;e.x=Math.max(A.x+e.r,Math.min(A.x+A.w-e.r,e.x+dx/length*distance));e.y=Math.max(A.y+e.r,Math.min(A.y+A.h-e.r,e.y+dy/length*distance));resolveEnemyCover(e,ox,oy);if(e.homeX!=null){e.homeX+=e.x-ox;e.homeY+=e.y-oy;}}
function terrainAdvanceProduction(t,seconds){if(t.cashTile&&!cashShovelNearby(t))return;const queue=terrainQueue(t);if(queue.length>=terrainSupplyCapacity(t))return;if(t.cashTile){t.shovelBonusWork=(t.shovelBonusWork||0)+seconds;return;}t.healProgress=Math.min(supplyTime(t),(t.healProgress||0)+seconds);}
function terrainEmitShock(x,y,source='tile',sourceTile=null){
 for(const b of bullets)b.life=0;bullets=[];shockWaves.push({x,y,age:0});burst(x,y,'#b8f5ff',18);beep(95,.22,'sine',.045);shake=Math.max(shake,3);
 if(terrainHas('余震模块'))terrainRun.echoes.push({left:1});
 if(terrainHas('驻留力场'))terrainRun.areas.push({x,y,left:3});
 for(const e of combatTargets()){
  if(!isAttackable(e)||isBossBody(e)||e.type==='boss')continue;
  if(terrainHas('冲击模块')&&Math.hypot(e.x-x,e.y-y)<=2*TILE)terrainPushEnemy(e,x,y,TILE);
  if(terrainHas('震荡手雷'))e.terrainStun=Math.max(e.terrainStun||0,1.2);
 }
 if(source==='tile'&&terrainHas('激发')&&terrainRun.exciteLock<=0){
  terrainRun.exciteLock=8;
  for(const t of tiles){if(t===sourceTile)continue;if(t.medical||t.shieldTile||t.cashTile){if(!t.cashTile||cashTilesEnabled())terrainAdvanceProduction(t,3);}if(t.shockTile)t.shockCooldown=Math.max(0,(t.shockCooldown||0)-3);}
 }
}
function terrainCoverDamaged(t,source){
 t.terrainRepairWait=0;t.terrainRepairCharge=0;
 if(source&&!isBossBody(source)&&source.type!=='boss'&&terrainHas('碎片弹射')&&!(t.terrainShardLeft>0)){
  const x=325+t.x*TILE,y=300+t.y*TILE,dx=source.x-x,dy=source.y-y;
  if(Number.isFinite(dx+dy)&&Math.hypot(dx,dy)>.01){terrainCoinShot(x,y,Math.atan2(dy,dx),weapon.damage*.25,3);t.terrainShardLeft=.5;}
 }
 if(!coverAlive(t)){
  if(terrainHas('反应装甲'))terrainEmitShock(325+t.x*TILE,300+t.y*TILE,'cover',t);
  if(terrainHas('重建结构')&&!t.terrainRebuilt)t.terrainRebuildLeft=8;
 }
}
function terrainShieldBroken(){
 if(!terrainHas('保险丝')||terrainRun.fuseLock>0)return;terrainRun.fuseLock=10;
 for(const t of tiles)if(t.shieldTile&&Math.hypot(p.x-325-t.x*TILE,p.y-300-t.y*TILE)<=2*TILE)terrainAdvanceProduction(t,6);
}
function terrainInterceptDamage(){if(!terrainRun.cashArmor||drinkPenaltyCount('glass'))return false;terrainRun.cashArmor=0;p.inv=damageInvincibility();p.floorHit=true;clearSkateReward(false);burst(p.x,p.y,'#e7ce77',12);return true;}
function terrainUpdateEffects(dt,realDt){
 if(!terrainActive())return;
 for(const key of ['slow','stim','combat','field','cashArmor','cashLock','fuseLock','exciteLock'])terrainRun[key]=Math.max(0,terrainRun[key]-realDt);
 for(const q of terrainRun.echoes){q.left-=dt;if(q.left<=0)bullets=[];}terrainRun.echoes=terrainRun.echoes.filter(q=>q.left>0);
 for(const q of terrainRun.areas){q.left-=dt;if(q.left>0)terrainClearNear(q.x,q.y,1.5*TILE);}terrainRun.areas=terrainRun.areas.filter(q=>q.left>0);
 for(const t of tiles)if(t.coverTile){
  t.terrainShardLeft=Math.max(0,(t.terrainShardLeft||0)-dt);
  if(coverAlive(t)&&terrainHas('维修装置')){
   const old=t.terrainRepairWait||0;t.terrainRepairWait=old+dt;t.terrainRepairCharge=(t.terrainRepairCharge||0)+Math.max(0,t.terrainRepairWait-5)-Math.max(0,old-5);
   if(t.terrainRepairCharge>=2){const ticks=Math.floor(t.terrainRepairCharge/2);t.terrainRepairCharge-=ticks*2;t.coverHp=Math.min(coverMaximum(),t.coverHp+ticks);}
  }else if(!coverAlive(t)&&t.terrainRebuildLeft!=null&&!t.terrainRebuilt){
   t.terrainRebuildLeft=Math.max(0,t.terrainRebuildLeft-dt);
   if(t.terrainRebuildLeft===0&&!coverContains(t,p.x,p.y,7)&&!enemies.some(e=>e.hp>0&&coverContains(t,e.x,e.y,e.r||10))){t.coverHp=coverMaximum();t.terrainRebuilt=true;delete t.terrainRebuildLeft;}
  }
 }
}
function terrainEndRoom(){terrainRun.areas=[];terrainRun.echoes=[];terrainRun.slow=0;terrainRun.stim=0;terrainRun.combat=0;terrainRun.field=0;terrainRun.cashArmor=0;if($('terrain-adrenaline'))$('terrain-adrenaline').hidden=true;}
function terrainBulletFactor(b){return terrainRun.field>0&&Math.hypot(b.x-p.x,b.y-p.y)<=1.5*TILE?.35:1;}
function terrainBulletBlocked(b,x,y){return terrainRun.areas.some(q=>q.left>0&&segmentHits(x,y,b.x,b.y,{x:q.x,y:q.y,r:1.5*TILE},b.r||0));}
function drawTerrainEffects(){
 const r=renderer;
 for(const q of terrainRun.areas)r.emissiveRing(q.x-325,8,(q.y-300)*1.06,1.5*TILE,'#8ee8ed',2);
 if(terrainRun.field>0)r.emissiveRing(p.x-325,9,(p.y-300)*1.06,1.5*TILE,'#70b7ef',2);
 if(terrainRun.cashArmor>0)r.ring(p.x-325,18,(p.y-300)*1.06,22,'#e7ce77',2);
 for(const t of tiles){
  if(!t.medical&&!t.shieldTile&&!t.cashTile||t.cashTile&&!cashTilesEnabled()||terrainHidden(t))continue;
  const queue=terrainQueue(t),head=queue[0];if(!head)continue;
  const x=(t.pickup?.x??325+t.x*TILE)-325,z=((t.pickup?.y??300+t.y*TILE)-300)*1.06;
  if(head.kind==='adrenaline'||head.kind==='nutrition'){
   const color=head.kind==='adrenaline'?'#ef9b60':'#a2d58a';r.residentMesh('terrain:vial:'+head.kind,()=>{r.box(0,8,0,11,15,11,color);r.box(0,18,0,7,5,7,'#e9ece2');},monsterPose(x,0,z));
  }else if(head.kind==='shock')drawShockPickup(x,7+Math.sin(time*3+t.x)*.3,z,time*1.6);
  else if(head.kind==='cash'&&head.amount>=8)r.residentMesh('terrain:money-bag',()=>{r.box(0,10,0,23,20,18,'#b49a58');r.box(0,22,0,12,6,10,'#e7ce77');r.box(0,25,0,17,3,13,'#7f6e4d');},monsterPose(x,0,z));
  else if(head.kind==='medical'&&head.amount>=2)r.emissiveRing(x,8,z,19,'#fff0d1',2);
  else if(head.kind==='shield'&&head.amount>=2)r.emissiveRing(x,8,z,19,'#8bd4ff',2);
  for(let i=1;i<queue.length;i++)r.emissiveBox(t.x*TILE-8+i*8,5,t.y*TILE*1.06+22,5,2,5,'#ddf477');
 }
}

function resetFloor(){tiles=[];for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++)tiles.push({x,y,medical:x===0&&y===1,shieldTile:x===0&&y===-1,healProgress:0,healFlash:0,medPack:false})}
function hasTile(x,y){return tiles.some(t=>t.x===x&&t.y===y)}
function floorPoint(x,y){const tx=Math.floor((x-325)/TILE+.5),ty=Math.floor((y-300)/TILE+.5);return hasTile(tx,ty)}
function onFloor(x,y,r=7){if(!floorPoint(x,y))return false;return [[r,0],[-r,0],[0,r],[0,-r],[r*.7,r*.7],[-r*.7,r*.7],[r*.7,-r*.7],[-r*.7,-r*.7]].every(([a,b])=>floorPoint(x+a,y+b))}
function walkFloor(o,x,y,r){const oldX=o.x,oldY=o.y;if(onFloor(x,o.y,r))o.x=x;if(onFloor(o.x,y,r))o.y=y;resolveCoverMovement(o,oldX,oldY,r);}
function addFloor(n=6){let added=0;while(added<n&&tiles.length<gridCapacity()){let candidates=[];for(let y=grid.minY;y<=grid.maxY;y++)for(let x=grid.minX;x<=grid.maxX;x++)if(!hasTile(x,y)&&[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>hasTile(x+a,y+b)))candidates.push({x,y});candidates.sort((a,b)=>(a.x*a.x+a.y*a.y)-(b.x*b.x+b.y*b.y)||a.y-b.y||a.x-b.x);if(!candidates.length)break;let t=candidates[0];const roll=Math.random();t.medical=roll<.02;t.shieldTile=roll>=.02&&roll<.04;t.cashTile=roll>=.04&&roll<.07;t.shockTile=roll>=.07&&roll<.09;t.coverTile=roll>=.09&&roll<.1;if(t.coverTile)t.coverHp=coverMaximum();t.healProgress=0;t.healFlash=0;t.medPack=false;if(roll>=.1&&roll<.175)t.trap={clock:Math.random()*1.5};else if(roll>=.25&&roll<.275){t.saw=true;t.orbitSaw=false;t.sawClock=0;}else if(roll>=.3&&roll<.31){t.saw=true;t.orbitSaw=true;t.sawClock=0;}else if(roll>=.35&&roll<.39)createFlywheel(t);tiles.push(t);burst(325+t.x*TILE,300+t.y*TILE,'#ddf477',15);added++}return added}
// A cover tile retains its foundation when broken; each new room rebuilds it.
const COVER_HP=4,COVER_HALF=TILE/2-6,COVER_ATTACK_INTERVAL=1;
function coverAlive(t){return t.coverTile&&(t.coverHp??coverMaximum())>0;}
function coverContains(t,x,y,r=0){return Math.abs(x-325-t.x*TILE)<COVER_HALF+r&&Math.abs(y-300-t.y*TILE)<COVER_HALF+r;}
function canWalkAt(x,y,r=7){return onFloor(x,y,r)&&!tiles.some(t=>coverAlive(t)&&coverContains(t,x,y,r));}
function refreshCoverTiles(){
 for(const t of tiles)if(t.coverTile){t.coverHp=coverMaximum();t.coverHitAt=-Infinity;t.terrainRebuilt=false;delete t.terrainRebuildLeft;t.terrainRepairWait=0;t.terrainRepairCharge=0;}
 // A player may finish a room standing on a broken foundation.
 if(p&&tiles.some(t=>coverAlive(t)&&coverContains(t,p.x,p.y,7))){
  const free=tiles.map(t=>({x:325+t.x*TILE,y:300+t.y*TILE})).filter(q=>canWalkAt(q.x,q.y,7)).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));
  if(free.length){p.x=free[0].x;p.y=free[0].y;}
 }
 for(const e of enemies)delete e.coverNextAttack;
}
function damageCover(t,amount=1,source=null){
 if(paused||!['combat','survival'].includes(state)||!coverAlive(t))return;
 t.coverHp=Math.max(0,(t.coverHp??coverMaximum())-amount);t.coverHitAt=time;terrainCoverDamaged(t,source);
 const x=325+t.x*TILE,y=300+t.y*TILE;
 if(!t.coverHp){burst(x,y,'#d4c7a3',22);beep(75,.15,'sawtooth',.025);shake=Math.max(shake,2);}
 else{burst(x,y,'#c6d7d8',3);beep(190,.035,'triangle',.008);}
}
// Sweep the full motion against an expanded square, preventing fast movers from tunneling.
function coverSegment(t,x,y,endX,endY,r=0){
 const half=COVER_HALF+r,cx=325+t.x*TILE,cy=300+t.y*TILE;
 let enter=0,exit=1,nx=0,ny=0;
 for(const [at,delta,center,axis]of [[x,endX-x,cx,0],[y,endY-y,cy,1]]){
  const low=center-half,high=center+half;
  if(Math.abs(delta)<1e-10){if(at<=low||at>=high)return null;continue;}
  const a=(low-at)/delta,b=(high-at)/delta,near=Math.min(a,b),far=Math.max(a,b);
  if(near>=enter){enter=near;nx=axis===0?(delta>0?-1:1):0;ny=axis===1?(delta>0?-1:1):0;}
  exit=Math.min(exit,far);if(enter>exit)return null;
 }
 if(exit<0||enter>1||exit<=1e-10)return null;
 return {tile:t,f:Math.max(0,enter),nx,ny};
}
function firstCoverHit(x,y,endX,endY,r=0){
 let best=null;
 for(const t of tiles){if(!coverAlive(t))continue;const hit=coverSegment(t,x,y,endX,endY,r);if(hit&&(!best||hit.f<best.f))best=hit;}
 return best;
}
function resolveCoverMovement(o,oldX,oldY,r,enemy=false){
 if(!tiles.some(coverAlive))return;
 let x=oldX,y=oldY,targetX=o.x,targetY=o.y,blocked=null;
 // Spawn/deployment overlap is expelled, never allowed to traverse a solid cover.
 const overlap=tiles.filter(t=>coverAlive(t)&&coverContains(t,x,y,r));
 if(overlap.length){
  const candidates=[];
  for(const t of overlap){const cx=325+t.x*TILE,cy=300+t.y*TILE,h=COVER_HALF+r+.01;candidates.push({x:cx-h,y},{x:cx+h,y},{x,y:cy-h},{x,y:cy+h});}
  const free=candidates.filter(q=>q.x>=A.x+r&&q.x<=A.x+A.w-r&&q.y>=A.y+r&&q.y<=A.y+A.h-r&&(!enemy?onFloor(q.x,q.y,r):true)&&!tiles.some(t=>coverAlive(t)&&coverContains(t,q.x,q.y,r))).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y));
  if(free.length){x=free[0].x;y=free[0].y;}else{const cell=tiles.filter(t=>!coverAlive(t)).map(t=>({x:325+t.x*TILE,y:300+t.y*TILE})).filter(q=>!tiles.some(t=>coverAlive(t)&&coverContains(t,q.x,q.y,r))).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0];if(cell){x=cell.x;y=cell.y;}}
  targetX=x;targetY=y;blocked=overlap[0];
 }
 for(let i=0;i<4;i++){
  const hit=firstCoverHit(x,y,targetX,targetY,r);if(!hit)break;
  blocked=hit.tile;const dx=targetX-x,dy=targetY-y;
  x+=dx*hit.f+hit.nx*.001;y+=dy*hit.f+hit.ny*.001;
  if(hit.nx)targetX=x;if(hit.ny)targetY=y;
  if(Math.abs(targetX-x)+Math.abs(targetY-y)<1e-8)break;
 }
 o.x=targetX;o.y=targetY;
 if(enemy&&blocked&&time>=(o.coverNextAttack??-Infinity)){
  damageCover(blocked,1,o);o.coverNextAttack=time+COVER_ATTACK_INTERVAL;o.coverAttackAt=time;
 }
}
function resolveEnemyCover(e,oldX=e.x,oldY=e.y){
 if(e.hp<=0||paused||state!=='combat')return;
 if(groundTransportEnabled()&&e.groundDeployed&&!e.transport){const at=HexMap.move(tiles,oldX,oldY,e.x,e.y,e.r||14);e.x=at.x;e.y=at.y;}
 if(isBossBody(e)||e.type==='boss'){
  for(const t of tiles)if(coverAlive(t)&&coverSegment(t,oldX,oldY,e.x,e.y,e.r||0))damageCover(t,coverMaximum(),e);
 }else resolveCoverMovement(e,oldX,oldY,e.r||10,true);
}
function blockBulletWithCover(b,oldX,oldY,frameStart=0,frameEnd=1){
 if(terrainBulletBlocked(b,oldX,oldY)){b.life=0;return true;}
 const hit=firstCoverHit(oldX,oldY,b.x,b.y,b.r||0);if(!hit)return false;
 // A cover behind the player cannot cancel an earlier hit along this leg.
 if(p.inv<=0&&!skateInvulnerable()){
  const px=p.frameStartX??p.x,py=p.frameStartY??p.y,moveX=p.x-px,moveY=p.y-py;
  const ax=oldX-px-moveX*frameStart,ay=oldY-py-moveY*frameStart;
  const dx=b.x-oldX-moveX*(frameEnd-frameStart),dy=b.y-oldY-moveY*(frameEnd-frameStart),r=(b.r||0)+drinkPlayerRadius();
  const a=dx*dx+dy*dy,c=ax*ax+ay*ay-r*r,dot=ax*dx+ay*dy,disc=dot*dot-a*c;
  const at=c<=0?0:a>0&&disc>=0?(-dot-Math.sqrt(disc))/a:Infinity;
  if(at>=0&&at<hit.f){hurt(b);b.life=0;b.coverBlocked=true;return true;}
 }
 b.coverBlocked=true;b.x=oldX+(b.x-oldX)*hit.f;b.y=oldY+(b.y-oldY)*hit.f;b.life=0;damageCover(hit.tile,1,{x:oldX,y:oldY});return true;
}
function drawCoverTiles(){
 const r=renderer;
 for(const t of tiles){if(!t.coverTile||terrainHidden(t))continue;const x=t.x*TILE,z=t.y*TILE*1.06,hp=t.coverHp??coverMaximum();
  if(hp<=0){r.residentMesh('cover:rubble',()=>{for(let i=0;i<7;i++)r.box((i%3-1)*12,3+i%2*2,(Math.floor(i/3)-1)*13,9,5+i%3,8,'#687477',i*.7);},monsterPose(x,0,z));continue;}
  const hit=time-(t.coverHitAt??-Infinity)<.12?1:0;
  r.residentMesh('cover:block',()=>{r.box(0,5,0,COVER_HALF*2+2,6,COVER_HALF*2*1.06+2,'#34454c');r.box(0,23,0,COVER_HALF*2,32,COVER_HALF*2*1.06,'#778b91');r.box(0,41,0,COVER_HALF*2+2,5,COVER_HALF*2*1.06+2,'#b0bdba');for(const side of [-1,1]){r.box(side*16,24,23,5,27,2,'#425760');r.box(side*16,24,-23,5,27,2,'#425760');}r.box(0,23,23,21,3,2,'#c1a05c');},monsterPose(x,0,z),{flash:hit});
  // Six visible charge bars double as remaining durability, without adding HUD clutter.
  for(let i=0;i<coverMaximum();i++)r.emissiveBox(x-(coverMaximum()-1)*3+i*6,44,z,4,1.2,5,i<hp?'#a6e5d6':'#34474e');
  if(hp<coverMaximum()){r.emissiveBox(x-4,26,z+23,1,18,1,'#2a383d',-.4);if(hp<3)r.emissiveBox(x+4,19,z+23,1,20,1,'#2a383d',.6);}
 }
}
const HEAL_TIME=30,SHIELD_TIME=40,SHIELD_AMOUNT=1;
function supplyTime(t){return terrainBaseProduction(t)}
function medicalTileAt(x,y){return tiles.find(t=>t.medical&&Math.floor((x-325)/TILE+.5)===t.x&&Math.floor((y-300)/TILE+.5)===t.y)}
function productionMultiplier(t){const distance=Math.hypot(p.x-325-t.x*TILE,p.y-300-t.y*TILE),shoeMultiplier=shoes?.productionBonus&&distance<=shoes.productionRadius*TILE?1+shoes.productionBonus:1,cashMultiplier=t.cashTile&&armor?.cashProductionMultiplier&&distance<=armor.cashProductionRadius*TILE?armor.cashProductionMultiplier:1;return shoeMultiplier*cashMultiplier*terrainProductionMultiplier(t)}
function emitArmorPulse(){const targets=combatTargets().filter(e=>Math.hypot(e.x-p.x,e.y-p.y)<=armor.auraRadius*TILE);if(!targets.length)return;shots.push({beam:true,arc:true,radial:true,arcTargets:targets,originX:p.x,originY:p.y,x:p.x,y:p.y,vx:0,vy:0,life:.18,damage:armor.auraDamage,pierce:targets.length+1,hitTargets:new Set(),damageApplied:false,color:FRIENDLY_SHOT_COLOR,source:'armor',radius:armor.auraRadius*TILE,height:12})}
function updateEquipmentEffects(dt){if(!armor?.regenInterval||p.hp>=p.max)p.regenCharge=0;else if(['combat','survival'].includes(state)){p.regenCharge=(p.regenCharge||0)+dt;const ticks=Math.floor((p.regenCharge+1e-9)/armor.regenInterval);if(ticks>0){p.regenCharge=Math.max(0,p.regenCharge-ticks*armor.regenInterval);p.hp=Math.min(p.max,p.hp+ticks*armor.regenHeal);if(p.hp>=p.max)p.regenCharge=0;burst(p.x,p.y,'#9bffd0',10);pickupSound('medical');updateUI()}}p.cashHealLeft=Math.max(0,(p.cashHealLeft||0)-dt);if(armor?.auraDamage&&state==='combat'){p.auraClock=(p.auraClock||0)+dt;if(p.auraClock>=armor.auraInterval){p.auraClock-=armor.auraInterval;emitArmorPulse()}}else p.auraClock=0;if(!armor?.shieldInterval||!['combat','survival'].includes(state)||p.shield>=shieldMaximum()){p.shieldCharge=0;return}p.shieldCharge=(p.shieldCharge||0)+dt;if(p.shieldCharge>=armor.shieldInterval){p.shieldCharge-=armor.shieldInterval;p.shield=Math.min(shieldMaximum(),p.shield+1);p.shieldHit=.25;burst(p.x,p.y,'#70c6ff',8);updateUI()}}
function supplyPickupRadius(){return (shoes?.pickupRadius||20)+(armor?.pickupRadiusBonus||0)+2*talentLevel('pickup')}
function advanceSupplyPickup(q,dt){const dx=p.x-q.x,dy=p.y-q.y,distance=Math.hypot(dx,dy),acceleration=1600,maximum=1000,accelerating=Math.min(dt,Math.max(0,(maximum-q.speed)/acceleration)),travel=q.speed*accelerating+.5*acceleration*accelerating*accelerating+maximum*(dt-accelerating),ratio=distance?Math.min(1,travel/distance):0;q.speed=Math.min(maximum,q.speed+acceleration*dt);q.x+=dx*ratio;q.y+=dy*ratio;return Math.hypot(p.x-q.x,p.y-q.y)<12}
const SHOCK_COOLDOWN=35,SHOCK_WAVE_TIME=.7;
let shockWaves=[];
function updateShockTiles(dt){
 if(paused||!['combat','survival'].includes(state))return;
 shockWaves.forEach(w=>w.age+=dt);shockWaves=shockWaves.filter(w=>w.age<SHOCK_WAVE_TIME);
 const gx=Math.floor((p.x-325)/TILE+.5),gy=Math.floor((p.y-300)/TILE+.5);
 for(const t of tiles){if(!t.shockTile)continue;
  const capacity=terrainHas('蓄能装置')?2:1;t.shockCharges??=(t.shockCooldown>0?0:1);
  if(capacity>(t.shockCapacity??1)&&t.shockCharges>0&&!(t.shockCooldown>0))t.shockCooldown=SHOCK_COOLDOWN;t.shockCapacity=capacity;
  if(t.shockCharges<capacity){t.shockCooldown=Math.max(0,(t.shockCooldown??SHOCK_COOLDOWN)-dt);while(t.shockCooldown<=0&&t.shockCharges<capacity){t.shockCharges++;if(t.shockCharges<capacity)t.shockCooldown+=SHOCK_COOLDOWN;}}
  const occupied=t.x===gx&&t.y===gy;
  if(occupied&&!t.shockOccupied&&t.shockCharges>0){t.shockCharges--;if(!t.shockCooldown)t.shockCooldown=SHOCK_COOLDOWN;terrainEmitShock(325+t.x*TILE,300+t.y*TILE,'tile',t);}
  t.shockOccupied=occupied;
 }
}
function drawShockPickup(x,y,z,yaw){
 const r=renderer;
 r.residentMesh('terrain:shock-pickup',()=>{
  r.box(0,7,0,25,14,23,'#65777d');
  r.box(0,0,0,29,3,27,'#34474e');r.box(0,15,0,29,3,27,'#a3b3b5');
  for(const side of [-1,1])r.box(side*10,7,0,3,12,25,'#3b515b');
  // Raised concentric coils identify a solid charge, even with subdued lighting.
  r.ring(0,17,0,9,'#536e78',2);r.emissiveRing(0,17.3,0,5,'#829fa8',1.5);
  r.emissiveBox(0,7,12,9,5,1,'#829fa8');
 },monsterPose(x,y,z,yaw));
}
function drawShockTiles(){
 const r=renderer;
 for(const t of tiles){if(!t.shockTile||terrainHidden(t))continue;const x=t.x*TILE,z=t.y*TILE*1.06,charges=t.shockCharges??(t.shockCooldown>0?0:1),ready=charges>0,c=ready?'#738d96':'#465d66';
  r.emissiveRing(x,4,z,15,c,2);r.emissiveRing(x,4,z,8,c,1.5);
  for(let i=0;i<4;i++){const a=i*TAU/4;r.emissiveBox(x+Math.cos(a)*20,4,z+Math.sin(a)*20,4,.6,4,c);}
  if(t.shockCooldown>0)r.emissiveSquareScan(x,z,TILE-4,TILE*1.06-4,1-t.shockCooldown/SHOCK_COOLDOWN,'#435a63');
  if(ready){drawShockPickup(x,7+Math.sin(time*3+t.x)*.3,z,time*1.6);if(charges>1)r.box(x+16,6,z+17,5,3,5,'#829fa8');}
 }
 for(const w of shockWaves){const f=w.age/SHOCK_WAVE_TIME,x=w.x-325,z=(w.y-300)*1.06,radius=8+Math.hypot(W,H)*(1-(1-f)**2);
  r.emissiveRing(x,12,z,radius,'#a9f4ff',Math.max(.3,5*(1-f)));
  r.emissiveRing(x,10,z,Math.max(2,radius-12),'#548ea9',Math.max(.2,2*(1-f)));
 }
}
function cashTilesEnabled(){
 if(campaignBoss||snakeTest||virusTest||humanoidTest||droneBossTest||ufoBossTest||currentBossBodies().length)return false;
 return state==='survival'&&survivalRemaining>0||state==='combat'&&((timedRoom?.remaining||0)>0||(greedRoom?.remaining||0)>0);
}
function updateHealing(dt,cashDt=dt){terrainUpdateSupplies(dt,cashDt)}
resetFloor();syncGrid();
function reset(){resetDeathFeedback();enemyTransports=[];globalThis.TalentRuntime?.start();playerDeath=null;if(typeof resetFishSchoolTest==='function')resetFishSchoolTest();resetTerrainSystem();timedRoom=null;shockWaves=[];resetDrinks();shopErasePending=0;shopTerrainPlan=null;terrainChange=null;bossDeath=null;bossHealthMax=0;$('boss-health').hidden=true;ufoBoss=null;ufoBossTest=false;droneSaws=[];droneBoss=null;droneBossTest=false;campaignBoss=0;bossesDefeated=0;campaignBossKind='';humanoidBoss=null;humanoidTest=false;virusBoss=null;virusTest=false;snakeBoss=null;snakeTest=false;swordSwings=new WeakMap();hitSoundAt=-Infinity;testMode=false;$('equipment-test').hidden=true;$('test-open').textContent='测试装备';stageClearLeft=0;clearStageSettlement();$('stage-clear').style.display='none';spectrumHits=[];unlockAudio();releaseJoy();floor=1;kills=0;chaserTimer=.65;chaserSerial=0;chaserSpawned=0;survivalRemaining=0;bossIntroLeft=0;cash=0;cashPopups=[];$('cash-popups').innerHTML='';shopItems=[];shopRefreshes=0;shopLevel=1;$('overlay').classList.remove('shop');$('viewport').classList.remove('shopping');mods={speed:1};weapon=createWeaponModel('pistol_t1');armor=null;shoes=null;drone=null;shovel=createShovel();droneShootTimer=0;pendingEquipment=null;picked={};resetFloor();p={x:325,y:350,hp:3+talentLevel('hp'),max:3+talentLevel('hp'),inv:0,shield:talentLevel('shield'),shieldHit:0,dx:0,dy:-1};enemies=[];missiles=[];blasts=[];explosionFX=[];bullets=[];shots=[];particles=[];hazards=[];turrets=[];spawnQueue=[];spawnTimer=0;cleared=false;shootTimer=0;time=0;scroll=0;phase=0;fallAge=0;landingAge=0;shake=0;paused=false;$('pause-panel').hidden=true;$('viewport').classList.remove('paused');Object.keys(keys).forEach(k=>keys[k]=false);renderer.sceneKey=null;renderer.sceneData=null;last=performance.now();beginDescent();$('pause').textContent='暂停 Ⅱ';$('overlay').style.display='none';updateUI();toast('电梯启动\n向下  /  B01',2);beep(100,.2)}
function toast(t,s=1.6){$('toast').textContent=t;$('toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').classList.remove('show'),s*1000)}
function beep(f,d=.07,type='sine',v=.04){if(!sound||!audio)return;let o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(v,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+d);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+d)}
function pickupSound(kind){if(!sound)return;unlockAudio();if(!audio)return;const start=audio.currentTime,notes=kind==='cash'?[880,1100,1320]:kind==='shield'?[440,660,880]:[620,830,1100];for(let i=0;i<notes.length;i++){const t=start+i*.065,o=audio.createOscillator(),g=audio.createGain();o.type='triangle';o.frequency.setValueAtTime(notes[i],t);g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(.075,t+.012);g.gain.exponentialRampToValueAtTime(.001,t+.14);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.15)}}
function updateUI(){ $('depth').innerHTML=`B${String(floor).padStart(2,'0')}<span>层</span>`;$('zone').textContent=zones[Math.min(3,Math.floor((floor-1)/3))];$('record').textContent='B'+String(best).padStart(2,'0');$('cash').innerHTML='$'+cash;$('weapon-hud').textContent=weapon.name+' · '+WEAPON_GRADES[weapon.tier].name;$('weapon-hud').style.color=WEAPON_GRADES[weapon.tier].color;$('kills').textContent=String(kills).padStart(3,'0');$('floorcount').textContent=tiles.length+' 块地板';$('hearts').innerHTML=Array.from({length:p.max},(_,i)=>`<i class="${i>=p.hp?'empty':''}"></i>`).join('');$('track').innerHTML=Array.from({length:12},(_,i)=>`<i class="${i<floor?'active':''}"></i>`).join('');renderDrinkStatus();$('upgrades').innerHTML=Object.keys(picked).length?Object.entries(picked).map(([k,v])=>`<b>${k} ×${v}</b>`).join(''):'<span>暂无强化</span>';if(shovel)$('upgrades').innerHTML+=`<b style="color:${WEAPON_GRADES[shovel.tier].color}">铲子槽 · ${equipmentName(shovel)} · 攻速 ${equipmentNumber(1/shovel.interval)}次/秒</b>`;if(terrainPassives.size)$('upgrades').innerHTML+='<b>地块被动 '+terrainPassives.size+'</b>';if(shoes?.id==='skateboard')$('upgrades').innerHTML+=`<b>霓虹巡演 ${p.grazeStacks||0}/${shoes.grazeMax} · 攻速 +${Math.round(skateAttackBonus()*100)}%</b>`;if(armor?.id==='plume')$('upgrades').innerHTML+=`<b>翎羽 ${p?.featherStacks||0}/${armor.featherStackMax} · 攻速 +${Math.round(featherSpeedBonus()*100)}%</b>`}
function beginDescent(){enemyTransports=[];globalThis.TalentRuntime?.finish();timedRoom=null;greedRoom=null;finishDrinkRoom();p.tentacleGait=null;wallScrollStart=scroll;chaserTimer=.65;chaserSerial=0;chaserSpawned=0;bossIntroLeft=0;survivalRemaining=0;$('viewport').classList.remove('boss-intro');$('viewport').classList.remove('survival-intro');$('survival-clock').style.display='none';turrets=turrets.filter(t=>!t.temporary);resetTurretCooldowns();state='descent';phase=.72;fallAge=0;landingAge=0;shake=0;$('viewport').classList.add('falling');$('viewport').classList.remove('landing');$('status').textContent='高速下坠';$('wave').textContent='▼  FREE FALL';syncMusic();beep(90,.55,'sawtooth',.045)}
function land(){state='landing';phase=.55;landingAge=0;shake=32;$('viewport').classList.remove('falling');$('viewport').classList.add('landing');$('status').textContent='重载刹停';$('wave').textContent='■  HARD STOP';beep(45,.35,'sawtooth',.09);beep(130,.12,'square',.05);for(let i=0;i<4;i++)burst(325+(i%2?1:-1)*80,300+(i<2?-1:1)*80,'#efcc94',8)}
function normalRoomChapter(){return Math.max(0,Math.min(2,Math.floor((floor-1)/(ROUNDS_PER_BOSS+1))));}
function normalRoomDuration(){return [30,45,60][normalRoomChapter()];}
const STARTER_ENEMIES={crawler:{name:'缓行机兵',speed:48},spitter:{name:'脉冲哨机',speed:18,bulletSpeed:85,interval:3.2,opening:2.2}};
const ADDED_ENEMIES={ironball:{name:'包边铁球',unlock:5,speed:82},twinGun:{name:'双发枪机',unlock:6,interval:2.1},suicideDrone:{name:'自毁无人机',unlock:9,speed:100},ricochet:{name:'弹跳碰撞机',unlock:13,speed:145},lobber:{name:'抛射机',unlock:15,interval:3},stormCaller:{name:'落雷机',unlock:17,interval:3.4},builder:{name:'强建机器人',unlock:7,speed:58,health:3,buildTime:8,cooldown:3,workRange:72}};
function isMeleeEnemy(e){return ['bomber','crawler','ironball','suicideDrone','ricochet'].includes(e.type);}
// Ground arrivals are reserved in enemies, so caps and room completion include cargo.
let enemyTransports=[];
const TRANSPORT_FLIGHT={approach:5.2,release:.3,depart:4,scale:.55,distance:500};
function transportPose(f){
 const c=TRANSPORT_FLIGHT,land=c.approach,leave=land+c.release,smooth=u=>u*u*(3-2*u),a=Math.max(0,Math.min(1,f.age/c.approach)),out=Math.max(0,Math.min(1,(f.age-leave)/c.depart)),remaining=1-smooth(a),travel=remaining-smooth(out),dx=f.side*c.distance,dz=f.entryZ??100;
 return {x:f.x-325+dx*travel,z:(f.y-300)*1.06+dz*travel,height:134+smooth(out)*55,yaw:Math.atan2(-dx,-dz),land,leave,end:leave+c.depart};
}
function syncTransportTarget(f){
 const pose=transportPose(f),m=renderer.vp,det=m?m[0]*m[9]-m[8]*m[1]:0,dh=pose.height-12;
 // Aim at the visible aircraft on the shared projectile plane, including camera tilt.
 const dx=Math.abs(det)>1e-9?(m[4]*m[9]-m[8]*m[5])*dh/det:0,dz=Math.abs(det)>1e-9?(m[0]*m[5]-m[1]*m[4])*dh/det:0;
 f.cargo.x=325+pose.x+dx;f.cargo.y=300+(pose.z+dz)/1.06;
}
function interceptEnemyTransport(e){
 if(e.transportDestroyed)return;e.transportDestroyed=true;
 const f=e.transport;f.destroyed=true;f.age=Infinity;e.hp=0;
 globalThis.TalentRuntime?.onKill(e);if(e.type==='goldSpider')claimGoldSpider(e);onDrinkEnemyDeath(e);
 shatterVisual(e);spawnExplosionFX(e.x,e.y,25);beep(95,.12,'sawtooth',.025);
}
function groundTransportEnabled(){return typeof HexMap!=='undefined'&&!(typeof sceneLab!=='undefined'&&sceneLab?.active)&&!(typeof weaponLab!=='undefined'&&weaponLab?.active);}
function isGroundEnemy(e){return ['crawler','bomber','ironball','ricochet','missile','laser','twinGun','lobber','stormCaller','goldSpider'].includes(e.type);}
function groundEnemyRadius(e){return e.type==='ironball'?30:e.type==='ricochet'?22:e.type==='goldSpider'?23:14;}
function transportLanding(e){
 const radius=groundEnemyRadius(e),candidates=[];
 // Only exposed hex edges qualify; inset the monster's full collision circle onto land.
 for(const edge of HexMap.outline(tiles).edges)for(const u of [.5,.25,.75]){
  const x=edge.ax+(edge.bx-edge.ax)*u-edge.nx*(radius+2),y=edge.ay+(edge.by-edge.ay)*u-edge.ny*(radius+2);
  if(!HexMap.canStand(tiles,x,y,radius)||tiles.some(t=>coverAlive(t)&&coverContains(t,x,y,radius)))continue;
  if(enemies.some(o=>o!==e&&o.hp>0&&isGroundEnemy(o)&&!o.transport?.waiting&&Math.hypot(x-(o.transport?.x??o.x),y-(o.transport?.y??o.y))<radius+(o.r||14)+6))continue;
  const distance=Math.hypot(x-p.x,y-p.y);if(distance<radius+drinkPlayerRadius()+25)continue;
  candidates.push({x,y,score:distance+Math.random()*25});
 }
 return candidates.sort((a,b)=>b.score-a.score)[0]||null;
}
function loadEnemyTransport(e,at){
 e.x=e.homeX=at.x;e.y=e.homeY=at.y;e.groundDeployed=true;
 const flight={x:at.x,y:at.y,age:0,side:at.x<325?-1:1,entryZ:at.y<300?-100:100,cargo:e,cargoHealth:e.hp,floor};
 e.transport=flight;enemyTransports.push(flight);syncTransportTarget(flight);
}
function updateEnemyTransports(dt){
 for(const e of enemies)if(e.hp>0&&e.transport?.waiting){const at=transportLanding(e);if(at)loadEnemyTransport(e,at);}
 enemyTransports=enemyTransports.filter(f=>{const pose=transportPose(f);return f.floor===floor&&(f.age>=pose.land||(enemies.includes(f.cargo)&&f.cargo.hp>0))&&f.age<pose.end;});
 for(const f of enemyTransports){
  f.age+=dt;if(f.cargo.transport)syncTransportTarget(f);
  if(f.age>=transportPose(f).land&&f.cargo.transport){
   // A cover may have changed while the aircraft was approaching. Retry this arrival.
   if(f.cargo.hp<=0){interceptEnemyTransport(f.cargo);continue;}
   if(!HexMap.canStand(tiles,f.x,f.y,f.cargo.r)||tiles.some(t=>coverAlive(t)&&coverContains(t,f.x,f.y,f.cargo.r))){
    f.cargo.transport={waiting:true};f.age=Infinity;continue;
   }
   delete f.cargo.transport;f.cargo.x=f.cargo.homeX=f.x;f.cargo.y=f.cargo.homeY=f.y;f.cargo.hp=f.cargoHealth;beep(180,.08,'triangle',.015);
  }
 }
}
function drawEnemyTransports(){
 if(!groundTransportEnabled()||!['combat','bossIntro'].includes(state))return;
 const r=renderer;
 for(const f of enemyTransports){
  const {x,z,height,yaw,land,end}=transportPose(f),scale=TRANSPORT_FLIGHT.scale;
  if(f.destroyed||f.floor!==floor||(f.age<land&&!enemies.includes(f.cargo))||f.age>=end)continue;
  const point=(localX,localY,localZ)=>[x+Math.cos(yaw)*localX+Math.sin(yaw)*localZ,height+localY,z-Math.sin(yaw)*localX+Math.cos(yaw)*localZ];
  r.residentMesh('enemy-transport:hull',()=>{
   // Compact quadcopter: four separate propeller guards and exposed X-shaped arms.
   for(const angle of [-.7,.7])r.box(0,0,0,90,6,9,'#a8b9c7',angle);
   r.box(0,1,0,39,17,37,'#364d65');r.box(0,11,-2,30,6,29,'#b5c6d0');
   r.box(0,-10,0,27,6,27,'#24384a');r.emissiveBox(0,14,2,14,1,4,'#ffd17e');
   r.box(0,0,21,25,11,8,'#1c3041');r.emissiveBox(0,2,26,15,4,1,'#8beaff');
   for(const side of [-1,1]){
    r.box(side*14,-16,0,4,15,27,'#c39c57');r.box(side*14,-24,0,8,3,20,'#e7c47c');
    for(const front of [-1,1]){const xx=side*35,zz=front*29;
     r.ring(xx,4,zz,25,'#b5c8d4',4);r.ring(xx,1,zz,25,'#425b73',3);
     r.box(xx,3,zz,7,12,7,'#536c84');r.emissiveBox(xx,11,zz,4,2,4,front>0?'#8beaff':'#ff9b76');
    }
   }
  },monsterPose(x,height,z,yaw,scale,scale,scale),enemyHitFeedback(f.cargo));
  for(const side of [-1,1])for(const front of [-1,1]){
   const hub=point(side*35*scale,7*scale,front*29*scale);
   r.residentMesh('enemy-transport:rotor',()=>{r.box(0,0,0,44,1.6,4.5,'#e0edf1');r.box(0,0,0,4.5,1.6,44,'#839fb3');r.emissiveBox(17,1,0,9,.8,4.5,'#b8efff');},monsterPose(...hub,yaw+time*32*side*front,scale,scale,scale));
   r.glow(...point(side*35*scale,11*scale,front*29*scale),2.2,front>0?'#82dcff':'#ff9679');
  }
  if(f.age<land){
   const lift=height-84,cargo={...f.cargo,x:x+325,y:z/1.06+300},previous=r.residentTransform;
   // Reuse each monster's actual resident body and articulated spider legs in the sling.
   r.residentTransform=pose=>{const at=pose.slice();at[7]+=lift;return previous?previous(at):at;};
   try{if(cargo.type==='goldSpider')drawGoldSpider(cargo,true);else drawResidentEnemy(cargo,x,z,0);}finally{r.residentTransform=previous;}
   for(const side of [-1,1])monsterStrut(point(side*24*scale,-12*scale,0),[x+side*18,lift+40,z],1.2,'#d4a955');
   drawMonsterHealthBar(x,height+34,z,f.cargo.hp,f.cargo.max,6,44,6,'#ecae85',f.cargo);
  }
 }
}
function normalRangedCount(){return enemies.filter(e=>e.hp>0&&['spitter','eye','skull','missile','moth','laser','twinGun','lobber','stormCaller','builder'].includes(e.type)).length;}
function pendingNormalSpawns(){return spawnQueue.length;}
function normalEnemyHealth(){return (5+floor*1.1)*(timedRoom&&floor>3?1.6:1);}
function rangedEnemyHealth(type){return normalEnemyHealth()*(ADDED_ENEMIES[type]?.health??1);}
function normalMeleeHealth(){return (3+floor*.6)*(timedRoom?(floor<=3?1:1.5):.5);}
function normalRangedLimit(){return timedRoom&&floor<=3?Math.ceil(3*(1+.5*drinkRewardCount('hive'))):Infinity;}
function normalEntryAllowed(e){return isMeleeEnemy(e)||normalRangedCount()<normalRangedLimit();}
function normalRoomRosterSize(){return Math.round([20,30,40][normalRoomChapter()]*drinkRoomDuration(1));}
function normalSpawnInterval(){return [3,3.5,3.6][normalRoomChapter()];}
function buildNormalRoster(){
 const ranged=floor<=3?['spitter']:['eye',...(floor>=2?['skull']:[]),...(floor>=3?['missile']:[]),...(floor>=5?['laser']:[]),...Object.keys(ADDED_ENEMIES).filter(k=>!isMeleeEnemy({type:k})&&floor>=ADDED_ENEMIES[k].unlock)],queue=[];let rangedIndex=0,meleeIndex=0;const contact=['bomber',...Object.keys(ADDED_ENEMIES).filter(k=>isMeleeEnemy({type:k})&&floor>=ADDED_ENEMIES[k].unlock)];
 // Three approachable contact enemies per five entrants, starting with contact + ranged.
 for(let i=0;i<normalRoomRosterSize();i++){const melee=[0,2,4].includes(i%5);queue.push({type:melee?(floor<=3?'crawler':contact[meleeIndex++%contact.length]):ranged[rangedIndex++%ranged.length],side:i%(melee?4:3)});}
 if(floor>=6&&floor%2===0){const at=queue.find(e=>!isMeleeEnemy(e));if(at)at.type='moth';}
 return queue;
}
function normalSpawnCutoff(){return (timedRoom.duration??NORMAL_ROOM_TIME)-NORMAL_SPAWN_FINALE;}
function startWave(){timedRoom=null;greedRoom=null;startFloorTracking();campaignBoss=campaignBossIndex();if(campaignBoss){startCampaignBoss();return}if(isGreedFloor()){startGreedRoom();return}if(floor%4===0){startSurvival();return}timedRoom={duration:drinkRoomDuration(normalRoomDuration()),remaining:drinkRoomDuration(normalRoomDuration()),nextWaveAt:normalSpawnInterval(),emptyTime:0,extraSpawnCredit:0};resetTurretCooldowns();$('viewport').classList.remove('landing');state='combat';cleared=false;phase=0;spawnTimer=.65;chaserTimer=.65;chaserSerial=0;chaserSpawned=0;spawnQueue=buildNormalRoster();spawnGroup(2);toast('B'+String(floor).padStart(2,'0')+' / 敌群来袭');beep(180,.35,'sawtooth');if(floor>best&&!testMode){best=floor;try{localStorage.setItem('hell-elevator-best',best)}catch{}}updateUI();updateTimedRoomHud()}
function updateTimedRoomHud(){if(!timedRoom)return;$('survival-clock').style.display='block';if($('survival-label'))$('survival-label').textContent='存活倒计时';$('survival-time').textContent=timedRoom.remaining.toFixed(1);$('survival-clock').classList[timedRoom.remaining<=5?'add':'remove']('urgent');$('status').textContent='撑到时间结束，或提前清空敌群';$('wave').textContent='敌人 '+enemies.filter(e=>e.hp>0).length+' · 待入场 '+pendingNormalSpawns()+skateHudText();}
function updateTimedRoomSpawns(dt){
 const elapsed=(timedRoom.duration??NORMAL_ROOM_TIME)-timedRoom.remaining;
 // Expired entry slots never spill into the final two seconds, even after a large frame.
 if(elapsed+1e-9>=normalSpawnCutoff()){spawnQueue=[];return;}
 const empty=!enemies.some(e=>e.hp>0)&&!missiles.some(m=>m.hp>0&&m.life>0);
 timedRoom.emptyTime=empty?(timedRoom.emptyTime||0)+dt:0;
 if(pendingNormalSpawns()&&(elapsed+1e-9>=timedRoom.nextWaveAt||timedRoom.emptyTime+1e-9>=NORMAL_EMPTY_WAVE_DELAY)){
  spawnGroup(3);timedRoom.emptyTime=0;timedRoom.nextWaveAt=elapsed+normalSpawnInterval();
 }
}
function finishTimedRoom(){
 if(state!=='combat'||!timedRoom)return;
 timedRoom.remaining=0;
 for(const e of new Set([...enemies,...missiles]))if(e.hp>0){shatterVisual(e);e.hp=0;}
 enemies=[];spawnQueue=[];missiles=[];
 drinkZones=drinkZones.filter(z=>z.kind!=='corpse');beginStageClear();
}
// One treasure hunt per chapter, away from the boss and survival floors.
function isGreedFloor(f= floor){return f>0&&f<=CAMPAIGN_BOSSES.length*(ROUNDS_PER_BOSS+1)&&f%(ROUNDS_PER_BOSS+1)===7;}
function goldSpiderBounds(){const margin=65;return {left:A.x+margin,right:A.x+A.w-margin,top:A.y+margin,bottom:A.y+A.h-margin};}
function startGreedRoom(){timedRoom=null;
 startFloorTracking();syncGrid();resetTurretCooldowns();$('viewport').classList.remove('landing');
 const chapter=Math.max(0,Math.min(2,Math.floor((floor-1)/(ROUNDS_PER_BOSS+1)))),hp=[13,30,54][chapter],reward=[12,20,32][chapter];
 const {left,right,top,bottom}=goldSpiderBounds(),cx=(left+right)/2,cy=(top+bottom)/2,rx=Math.min(180,(right-left)/2-35),ry=Math.min(140,(bottom-top)/2-35),offset=Math.random()*TAU;
 const spiders=Array.from({length:GREED_COUNT},(_,i)=>{
  const angle=offset+i*TAU/GREED_COUNT,x=cx+Math.cos(angle)*rx,y=cy+Math.sin(angle)*ry;
  const heading=Math.random()*TAU;
  return {type:'goldSpider',x,y,hp,max:hp,r:23,t:0,seed:angle,heading,wanderHeading:heading,wanderLeft:.18+Math.random()*.42,moveSpeed:170+chapter*15,speedFactor:.85+Math.random()*.3};
 });
 greedRoom={remaining:drinkRoomDuration(GREED_TIME),spiders,reward,killed:0,earned:0,outcome:'hunting',reported:false};
 cleared=false;phase=0;enemies=[...spiders];if(groundTransportEnabled()){enemyTransports=[];for(const spider of spiders){const at=transportLanding(spider);if(at)loadEnemyTransport(spider,at);else spider.transport={waiting:true};}}spawnQueue=[];missiles=[];bullets=[];shots=[];hazards=[];chaserSpawned=999;
 turrets=turrets.filter(t=>!t.temporary);beginStageIntro('greed');
 if(floor>best&&!testMode){best=floor;try{localStorage.setItem('hell-elevator-best',best)}catch{}}updateUI();
}
function updateGreedHud(){
 if(!greedRoom)return;const g=greedRoom,multiplier=armor?.cashMultiplier||1;
 $('survival-clock').style.display='block';if($('survival-label'))$('survival-label').textContent='黄金猎场';
 $('survival-time').textContent=g.remaining.toFixed(1);$('survival-clock').classList[g.remaining<=5?'add':'remove']('urgent');
 $('status').textContent='贪财房 · 猎杀机械金蛛 '+g.killed+'/'+g.spiders.length;
 $('wave').textContent='每只 $'+g.reward*multiplier+' · 已获 $'+g.earned+' · 超时清除不发钱';
}
function updateGoldSpider(e,dt){
 if(dt<=0)return;e.t+=dt;e.wanderLeft-=dt;
 if(e.wanderLeft<=0){e.wanderHeading=Math.random()*TAU;e.wanderLeft=.18+Math.random()*.42;e.speedFactor=.85+Math.random()*.3;}
 let vx=Math.cos(e.wanderHeading),vy=Math.sin(e.wanderHeading);
 const px=e.x-p.x,py=e.y-p.y,distance=Math.hypot(px,py);
 if(distance>1&&distance<135){const weight=(1-distance/135)*1.4;vx+=px/distance*weight;vy+=py/distance*weight;}
 for(const other of greedRoom.spiders)if(other!==e&&other.hp>0&&!other.escaped){const ox=e.x-other.x,oy=e.y-other.y,d=Math.hypot(ox,oy);if(d>0&&d<70){vx+=ox/d*(1-d/70)*2;vy+=oy/d*(1-d/70)*2;}}
 const {left,right,top,bottom}=goldSpiderBounds(),look=65;
 if(e.x<left+look)vx+=(left+look-e.x)/25;if(e.x>right-look)vx-=(e.x-right+look)/25;
 if(e.y<top+look)vy+=(top+look-e.y)/25;if(e.y>bottom-look)vy-=(e.y-bottom+look)/25;
 const desired=Math.atan2(vy,vx),turn=Math.atan2(Math.sin(desired-e.heading),Math.cos(desired-e.heading)),maxTurn=9*dt;
 e.heading+=Math.max(-maxTurn,Math.min(maxTurn,turn));
 const ox=e.x,oy=e.y,travel=e.moveSpeed*e.speedFactor*dt;
 e.x=Math.max(left,Math.min(right,e.x+Math.cos(e.heading)*travel));e.y=Math.max(top,Math.min(bottom,e.y+Math.sin(e.heading)*travel));resolveEnemyCover(e,ox,oy);
 e.walkDistance=(e.walkDistance||0)+Math.hypot(e.x-ox,e.y-oy);
}
function claimGoldSpider(e){
 const g=greedRoom;if(!g||!g.spiders.includes(e)||g.outcome!=='hunting'||g.remaining<=0||e.goldClaimed||e.escaped)return;
 e.goldClaimed=true;g.killed++;const pay=gainCash(g.reward,e.x,e.y,90);g.earned+=pay;cashBurst(e.x,e.y,8);pickupSound('cash');
 if(g.killed===g.spiders.length)g.outcome='completed';updateGreedHud();
}
function updateGreedClock(realDt){
 const g=greedRoom;if(!g||state!=='combat'||paused||!['hunting','completed'].includes(g.outcome))return false;
 if(g.outcome==='completed'){finishGreedRoom();return state==='stageClear';}
 g.remaining=Math.max(0,g.remaining-Math.max(0,realDt));
 if(g.remaining>1e-9)return false;
 g.remaining=0;if(g.outcome!=='completed')g.outcome='escaped';
 for(const e of g.spiders)if(e.hp>0){e.escaped=true;shatterVisual(e);e.hp=0;}
 enemies=enemies.filter(e=>!g.spiders.includes(e));shots=[];missiles=[];bullets=[];hazards=[];
 finishGreedRoom();return true;
}
function finishGreedRoom(){
 const g=greedRoom;if(!g||state!=='combat'||g.outcome==='hunting')return;
 // Timeout clears corpse warnings; an early clear lets them finish normally.
 if(g.outcome==='escaped')drinkZones=drinkZones.filter(z=>z.kind!=='corpse');
 beginStageClear(1,[()=>{g.reported=true;return '机械金蛛 '+g.killed+'/'+g.spiders.length+' · 已获 $'+g.earned+(g.outcome==='escaped'?' · 余下超时清除':' · 全部击破');}]);
}
function startGreedTest(){
 reset();floor=7;testMode=true;$('test-open').textContent='测试中 · 装备';
 $('overlay').style.display='none';$('viewport').classList.remove('falling');clearTimeout(toast.timer);$('toast').classList.remove('show');startWave();
}
function startSurvival(){timedRoom=null;startFloorTracking();resetTurretCooldowns();$('viewport').classList.remove('landing');state='survival';survivalRemaining=drinkRoomDuration(SURVIVAL_TIME);cleared=false;enemies=[];spawnQueue=[];missiles=[];bullets=[];shots=[];hazards=[];turrets=turrets.filter(t=>!t.temporary);for(let edge=0;edge<4;edge++)for(let i=0;i<2;i++){const t=createTurret('machine',EDGES[edge],i?.75:.25,i?-1:1);t.temporary=true;t.cool=1.1+(edge*2+i)*.15;turrets.push(t);burst(t.x,t.y,'#ffb777',5)}if(floor>best&&!testMode){best=floor;try{localStorage.setItem('hell-elevator-best',best)}catch{}}$('status').textContent='火力封锁 · 只需躲避';$('wave').textContent='撑过 '+survivalRemaining+' 秒';updateUI();beginStageIntro('survival')}
function finishSurvival(){if(state!=='survival')return;turrets=turrets.filter(t=>!t.temporary);bullets=[];survivalRemaining=0;beginStageClear(1,[()=>{const pay=gainCash(20+floor*2,p.x,p.y,80);cashBurst(p.x,p.y,6);return '生存奖金 +$'+pay;}])}
function beginStageIntro(mode){introMode=mode;state='bossIntro';bossIntroLeft=mode==='greed'?1:mode==='survival'?SURVIVAL_INTRO_TIME:BOSS_INTRO_TIME;$('intro-text').textContent=mode==='survival'?'耐久躲避！':'BOSS 来袭！';$('intro-label').textContent=mode==='survival'?'火力封锁':'WARNING / 守层者接近';$('viewport').classList.add('boss-intro');if(mode==='survival')$('viewport').classList.add('survival-intro');else $('viewport').classList.remove('survival-intro');$('survival-clock').style.display='none';$('status').textContent=mode==='survival'?'耐久躲避准备中':'守层者接近';$('wave').textContent=mode==='survival'?'撑过 '+survivalRemaining+' 秒':'BOSS 来袭！';if(mode==='greed'){$('intro-text').textContent='机械金蛛群！';$('intro-label').textContent=greedRoom.remaining+'秒 / '+GREED_COUNT+'只 · 每只 $'+greedRoom.reward*(armor?.cashMultiplier||1);$('status').textContent='机械金蛛即将出现';$('wave').textContent='逐只击杀拿钱 · 超时保留已获赏金';$('viewport').classList.add('survival-intro');}releaseJoy();syncMusic()}
function updateSurvivalClock(){if($('survival-label'))$('survival-label').textContent='耐久躲避';$('survival-clock').style.display='block';$('survival-time').textContent=survivalRemaining.toFixed(1);$('survival-clock').classList[survivalRemaining<=5?'add':'remove']('urgent')}
function finishBossIntro(){if(state!=='bossIntro')return;bossIntroLeft=0;$('viewport').classList.remove('boss-intro');$('viewport').classList.remove('survival-intro');if(introMode==='greed'){state='combat';resetTurretCooldowns();updateGreedHud();return}if(introMode==='survival'){state='survival';updateSurvivalClock();$('status').textContent='耐久躲避';return}state='combat';resetTurretCooldowns();if(campaignBoss)spawnCampaignBoss();else spawnGroup();$('status').textContent=campaignBoss?campaignBossName()+'交战':'守层者交战';beep(110,.18,'triangle',.05)}
function startCampaignBoss(){timedRoom=null;
 bossHealthMax=0;
 if(!CAMPAIGN_BOSSES[campaignBoss-1].some(b=>b.id===campaignBossKind))campaignBossKind=CAMPAIGN_BOSSES[campaignBoss-1][Math.random()<.5?0:1].id;
 resetTurretCooldowns();$('viewport').classList.remove('landing');cleared=false;phase=0;
 enemies=[];spawnQueue=[];missiles=[];bullets=[];shots=[];hazards=[];chaserSpawned=999;
 beginStageIntro('boss');$('intro-text').textContent=campaignBossName()+' 来袭！';
 if(floor>best&&!testMode){best=floor;try{localStorage.setItem('hell-elevator-best',best)}catch{}}updateUI();
}
function spawnCampaignBoss(){
 if(campaignBossKind==='snake')spawnSnakeBoss();
 else if(campaignBossKind==='virus')spawnVirusBoss();
 else if(campaignBossKind==='cowboy')spawnCowboyBoss();
 else if(campaignBossKind==='crimson')spawnCrimsonMechBoss();
 else if(campaignBossKind==='drone')spawnDroneBoss();
 else if(campaignBossKind==='ufo')spawnUFOBoss();
}
function finishCampaignBoss(){
 if(!campaignBoss||state!=='combat')return;
 bossesDefeated++;gainCash(20,p.x,p.y,80);snakeBoss=null;virusBoss=null;droneBoss=null;droneSaws=[];ufoBoss=null;
 if(humanoidBoss){humanoidBoss.skyEffects=[];humanoidBoss.crimsonRockets=[];}humanoidBoss=null;enemies=[];spawnQueue=[];explosionFX=[];
 if(bossesDefeated===CAMPAIGN_BOSSES.length){
  globalThis.TalentRuntime?.finish();
  for(const event of drinkSettlementEvents())event();finishDrinkRoom();
  state='won';cleared=true;paused=false;releaseJoy();bullets=[];shots=[];missiles=[];hazards=[];clearSkateReward();
  $('status').textContent='全部通关';$('wave').textContent='三场 BOSS 已击败';
  showOverlay('<div class="tag">ALL CLEAR</div><h2>通关成功</h2><p>三个关卡的守层者已全部击败。<br>完成 30 轮战斗与 3 场随机 BOSS 战。</p><button class="primary" id="restart">重新开始 ↓</button>');$('restart').onclick=reset;syncMusic();
 }else{campaignBoss=0;campaignBossKind='';beginStageClear(0);}
}
// Early timed floors cap ranged entrants only; contact enemies can bypass a blocked ranged queue entry.
const ENEMY_PRESSURE={crawler:.75,spitter:2,bomber:.75,eye:2,skull:3,missile:3,moth:4,laser:4,ironball:1,suicideDrone:2,ricochet:2,twinGun:3,lobber:4,stormCaller:4,builder:4,boss:6};
function spawnGroup(limit=3){
 const batch=[];let budget=floor<=2?6:8,moths=0,count=0;
 while(count<limit&&spawnQueue.length){
  const at=spawnQueue.findIndex(e=>normalEntryAllowed(e)&&(ENEMY_PRESSURE[e.type]||2)<=budget&&(e.type!=='moth'||moths<1));if(at<0)break;
  const e=spawnQueue[at];if(!spawn(e))break;spawnQueue.splice(at,1);budget-=ENEMY_PRESSURE[e.type]||2;if(e.type==='moth')moths++;if(!e.hiveExtra)batch.push(e);count++;
 }
 if(timedRoom&&drinkRewardCount('hive')&&batch.length){
  for(const e of batch){
   timedRoom.extraSpawnCredit=(timedRoom.extraSpawnCredit||0)+.5*drinkRewardCount('hive');const n=Math.floor(timedRoom.extraSpawnCredit);timedRoom.extraSpawnCredit-=n;
   for(let i=0;i<n;i++){const extra={...e,side:(e.side+i+1)%(isMeleeEnemy(e)?4:3),hiveExtra:true};if(!normalEntryAllowed(extra)||!spawn(extra))spawnQueue.push(extra);}
  }
 }
}
function chaserBudget(){return Math.floor(Math.min(24,10+Math.floor(Math.max(0,floor-3)*1.5))*(1+.5*drinkRewardCount('hive')))}
function addHiveChasers(){drinkChaserCredit+=.5*drinkRewardCount('hive');const n=Math.floor(drinkChaserCredit);drinkChaserCredit-=n;for(let i=0;i<n&&chaserSpawned<chaserBudget()&&enemies.filter(e=>e.hp>0&&isMeleeEnemy(e)).length<CHASER_CAP;i++)if(spawn({type:'bomber',side:chaserSerial++%4}))chaserSpawned++;}
function chaserInterval(){return Math.max(.5,.8-(floor-3)*.03)}
function updateChaserSpawns(dt){
 if(state!=='combat'||floor<3||cleared||chaserSpawned>=chaserBudget())return;
 // Ordinary rooms already schedule their contact share in the mixed finite roster.
 if(timedRoom)return;
 const rangedLeft=spawnQueue.length||missiles.length||enemies.some(e=>e.hp>0&&!isMeleeEnemy(e));if(!rangedLeft)return;
 chaserTimer=Math.max(0,chaserTimer-dt);
 if(chaserTimer===0&&enemies.filter(e=>e.hp>0&&isMeleeEnemy(e)).length<CHASER_CAP){if(spawn({type:'bomber',side:chaserSerial++%4})){chaserSpawned++;addHiveChasers();}chaserTimer=chaserInterval()}
}
function chaserEntry(side){const inset=20;for(let attempt=0;attempt<64;attempt++){const edge=(side+Math.floor(attempt/16))%4,t=.08+Math.random()*.84;const x=edge===1?A.x+A.w-inset:edge===3?A.x+inset:A.x+inset+t*(A.w-inset*2),y=edge===0?A.y+inset:edge===2?A.y+A.h-inset:A.y+inset+t*(A.h-inset*2);if(Math.hypot(x-p.x,y-p.y)>=145&&enemies.every(o=>o.hp<=0||Math.hypot(x-o.x,y-o.y)>45))return {x,y}}return null}
function spawn(e){if(groundTransportEnabled()&&isGroundEnemy(e)){const at=transportLanding(e);if(!at)return false;const hp=isMeleeEnemy(e)?normalMeleeHealth():rangedEnemyHealth(e.type),mob={type:e.type,hp,max:hp,r:groundEnemyRadius(e),t:0,fire:STARTER_ENEMIES[e.type]?.opening??1.35,warn:0,seed:Math.random()*TAU};loadEnemyTransport(mob,at);enemies.push(mob);return true;}const extentX=Math.max(...tiles.map(t=>Math.abs(t.x)))*TILE+TILE/2+92,extentY=Math.max(...tiles.map(t=>Math.abs(t.y)))*TILE+TILE/2+92;let x=325,y=300;if(isMeleeEnemy(e)){const entry=chaserEntry(e.side);if(!entry)return false;({x,y}=entry)}else for(let attempt=0;attempt<64;attempt++){let a=-Math.PI/2+e.side*TAU/3+enemies.length*.39+attempt*TAU/64;x=Math.max(A.x+40,Math.min(A.x+A.w-40,325+Math.cos(a)*extentX));y=Math.max(A.y+42,Math.min(A.y+A.h-42,300+Math.sin(a)*extentY));if(Math.hypot(x-p.x,y-p.y)>=145&&!floorPoint(x,y)&&enemies.every(o=>Math.hypot(x-o.x,y-o.y)>45))break}if(isMeleeEnemy(e)&&Math.hypot(x-p.x,y-p.y)<145)return;enemies.push({x,y,homeX:x,homeY:y,type:e.type,hp:e.type==='boss'?48+floor*7:isMeleeEnemy(e)?normalMeleeHealth():rangedEnemyHealth(e.type),max:e.type==='boss'?48+floor*7:isMeleeEnemy(e)?normalMeleeHealth():rangedEnemyHealth(e.type),t:0,fire:(STARTER_ENEMIES[e.type]?.opening??1.35)+(enemies.length%3)*.22,warn:0,r:e.type==='boss'?24:e.type==='ironball'?30:e.type==='ricochet'?22:e.type==='suicideDrone'?16:e.type==='builder'?22:14,seed:Math.random()*TAU});burst(x,y,'#df7856',10);beep(80,.1);return true}
function unlockAudio(){if(!sound)return;try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();loadStarterShot();music.unlock(audio)}catch{}}
function playChime(notes,volume=.045,spacing=.045,tail=.24){if(!sound)return;unlockAudio();if(!audio)return;const start=audio.currentTime;for(let i=0;i<notes.length;i++){const at=start+i*spacing;for(const [ratio,type,level]of [[1,'triangle',1],[2,'sine',.2]]){const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(notes[i]*ratio,at);g.gain.setValueAtTime(.001,at);g.gain.linearRampToValueAtTime(volume*level,at+.006);g.gain.exponentialRampToValueAtTime(.001,at+tail);o.connect(g);g.connect(audio.destination);o.start(at);o.stop(at+tail+.02)}}}
function deathSound(boss=false){if(!sound)return;unlockAudio();beep(boss?55:75,boss?.28:.2,'sawtooth',boss?.075:.065);beep(220,.06,'square',.028)}
function purchaseSound(){playChime([523.25,659.25,783.99,1046.5],.06,.065,.32)}
const SOUND_LEVELS_KEY='hell-elevator-sound-levels-v1';
const soundLevels={shot:.48,hit:.55,casing:.55};
try{const saved=JSON.parse(localStorage.getItem(SOUND_LEVELS_KEY));for(const key of ['shot','hit','casing'])if(typeof saved?.[key]==='number'&&Number.isFinite(saved[key]))soundLevels[key]=Math.max(0,Math.min(1,saved[key]));}catch{}
function setSoundLevel(kind,value){
 if(!['shot','hit','casing'].includes(kind)||!Number.isFinite(Number(value)))return;
 soundLevels[kind]=Math.max(0,Math.min(1,Number(value)));
 for(const source of starterShotVoices)if(source.sampleKind===kind)source.sampleGain.gain.setTargetAtTime(sound?soundLevels[kind]:0,audio.currentTime,.015);
 let saved=true;try{localStorage.setItem(SOUND_LEVELS_KEY,JSON.stringify(soundLevels));}catch{saved=false;}
 syncSoundControls();if($('sound-level-status'))$('sound-level-status').textContent=saved?'已自动保存':'当前浏览器无法保存，本次调整仍有效';
}
function syncSoundControls(){for(const kind of ['shot','hit','casing']){const slider=$('sound-level-'+kind),value=$('sound-value-'+kind);if(slider)slider.value=Math.round(soundLevels[kind]*100);if(value)value.textContent=Math.round(soundLevels[kind]*100)+'%';}}
function toggleSoundSettings(){const panel=$('sound-settings');if(!panel)return;panel.hidden=!panel.hidden;$('sound-settings-open')?.setAttribute?.('aria-expanded',String(!panel.hidden));if(panel.hidden)stopCasingAudition();if(!panel.hidden){releaseJoy();Object.keys(keys).forEach(k=>keys[k]=false);syncSoundControls();}}
async function previewSoundLevel(kind){
 if(kind==='casing'){await auditionCasingSound();return;}
 if(!sound){if($('sound-level-status'))$('sound-level-status').textContent='请先开启声音';return;}
 unlockAudio();loadStarterShot();await Promise.all([starterShotLoading,starterHitLoading]);if(!sound)return;if(kind==='shot')starterShotSound();else{hitSoundAt=-Infinity;starterImpactSound();}
}
const CASING_SOUND_CLIPS=[{"name": "Bullet Falling on Metal 1", "url": "assets/audio/bullet-falling-metal/bullet-falling-metal-1.wav", "group": "金属地面"}, {"name": "Bullet Falling on Metal 2", "url": "assets/audio/bullet-falling-metal/bullet-falling-metal-2.wav", "group": "金属地面"}, {"name": "Bullet Falling on Metal 3", "url": "assets/audio/bullet-falling-metal/bullet-falling-metal-3.wav", "group": "金属地面"}, {"name": "Bullet Falling on Metal 4", "url": "assets/audio/bullet-falling-metal/bullet-falling-metal-4.wav", "group": "金属地面"}, {"name": "Bullet Falling on Metal 5", "url": "assets/audio/bullet-falling-metal/bullet-falling-metal-5.wav", "group": "金属地面"}, {"name": "Bullet Falling on Metal 6", "url": "assets/audio/bullet-falling-metal/bullet-falling-metal-6.wav", "group": "金属地面"}, {"name": "Bullet Falling on Metal 7", "url": "assets/audio/bullet-falling-metal/bullet-falling-metal-7.wav", "group": "金属地面"}, {"name": "Bullet Falling on Metal 8", "url": "assets/audio/bullet-falling-metal/bullet-falling-metal-8.wav", "group": "金属地面"}, {"name": "Bullet Falling on Metal 9", "url": "assets/audio/bullet-falling-metal/bullet-falling-metal-9.wav", "group": "金属地面"}, {"name": "Bullet Falling on Metal 10", "url": "assets/audio/bullet-falling-metal/bullet-falling-metal-10.wav", "group": "金属地面"}, {"name": "Pistol Shell Dropping On Cement (1)", "url": "assets/audio/bullet-falling-concrete/bullet-falling-concrete-1.wav", "group": "混凝土地面"}, {"name": "Pistol Shell Dropping On Cement (2)", "url": "assets/audio/bullet-falling-concrete/bullet-falling-concrete-2.wav", "group": "混凝土地面"}, {"name": "Pistol Shell Dropping On Cement (3)", "url": "assets/audio/bullet-falling-concrete/bullet-falling-concrete-3.wav", "group": "混凝土地面"}, {"name": "Pistol Shell Dropping On Cement (4)", "url": "assets/audio/bullet-falling-concrete/bullet-falling-concrete-4.wav", "group": "混凝土地面"}, {"name": "Pistol Shell Dropping On Cement (5)", "url": "assets/audio/bullet-falling-concrete/bullet-falling-concrete-5.wav", "group": "混凝土地面"}, {"name": "Rifle Shell Dropping On Cement (1)", "url": "assets/audio/bullet-falling-concrete/bullet-falling-concrete-6.wav", "group": "混凝土地面"}, {"name": "Rifle Shell Dropping On Cement (2)", "url": "assets/audio/bullet-falling-concrete/bullet-falling-concrete-7.wav", "group": "混凝土地面"}, {"name": "Rifle Shell Dropping On Cement (3)", "url": "assets/audio/bullet-falling-concrete/bullet-falling-concrete-8.wav", "group": "混凝土地面"}, {"name": "Shotgun Shell Dropping On Cement (1)", "url": "assets/audio/bullet-falling-concrete/bullet-falling-concrete-9.wav", "group": "混凝土地面"}, {"name": "Shotgun Shell Dropping On Cement (2)", "url": "assets/audio/bullet-falling-concrete/bullet-falling-concrete-10.wav", "group": "混凝土地面"}];
const CASING_SOUND_KEY='hell-elevator-casing-sound-v1';
let casingSoundIndex=0;try{const url=localStorage.getItem(CASING_SOUND_KEY),index=CASING_SOUND_CLIPS.findIndex(c=>c.url===url);if(index>=0)casingSoundIndex=index;}catch{}
const casingSoundCache=new Map(),casingSoundBuffers=new Map();let casingAudition=null,casingAuditionToken=0;
function loadCasingSound(index=casingSoundIndex){
 if(!audio?.decodeAudioData||typeof fetch!=='function')return Promise.resolve(null);
 const clip=CASING_SOUND_CLIPS[index];if(!clip)return Promise.resolve(null);
 if(!casingSoundCache.has(clip.url)){const pending=fetch(clip.url).then(r=>{if(!r.ok)throw Error('Sample '+r.status);return r.arrayBuffer();}).then(b=>audio.decodeAudioData(b)).then(b=>{casingSoundBuffers.set(clip.url,b);return b;});casingSoundCache.set(clip.url,pending);pending.catch(()=>{if(casingSoundCache.get(clip.url)===pending)casingSoundCache.delete(clip.url);});}
 return casingSoundCache.get(clip.url);
}
function chooseCasingSound(index){
 casingSoundIndex=Math.max(0,Math.min(CASING_SOUND_CLIPS.length-1,Math.floor(Number(index)||0)));
 const select=$('casing-sound-choice'),status=$('casing-sound-status');if(select)select.value=String(casingSoundIndex);
 let saved=true;try{localStorage.setItem(CASING_SOUND_KEY,CASING_SOUND_CLIPS[casingSoundIndex].url);}catch{saved=false;}
 if(status)status.textContent=saved?'已保存：弹壳首次落地使用此音效':'本次已选中，当前浏览器无法保存';
 if(audio)loadCasingSound().catch(()=>{});
}
function playCasingLanding(){
 if(!sound||!audio||audio.state==='suspended'||soundLevels.casing<=0)return;
 const buffer=casingSoundBuffers.get(CASING_SOUND_CLIPS[casingSoundIndex].url);if(buffer)playStarterSample(buffer,soundLevels.casing,'casing');else loadCasingSound().catch(()=>{});
}
function stopCasingAudition(){casingAuditionToken++;if(casingAudition){try{casingAudition.stop();}catch{}casingAudition=null;}}
async function auditionCasingSound(delta=0){
 const select=$('casing-sound-choice'),status=$('casing-sound-status');if(!select)return;
 const index=(Math.max(0,Math.min(CASING_SOUND_CLIPS.length-1,Number(select.value)||0))+delta+CASING_SOUND_CLIPS.length)%CASING_SOUND_CLIPS.length;chooseCasingSound(index);stopCasingAudition();
 if(!sound){if(status)status.textContent='请先开启声音';return;}
 unlockAudio();if(!audio?.decodeAudioData){if(status)status.textContent='音频尚未就绪，请再试一次';return;}
 const token=casingAuditionToken,clip=CASING_SOUND_CLIPS[index];if(status)status.textContent='正在加载 '+clip.name+'…';
 try{
  const buffer=await loadCasingSound(index);if(token!==casingAuditionToken||!sound||$('sound-settings')?.hidden)return;
  casingAudition=playStarterSample(buffer,soundLevels.casing,'casing');if(status)status.textContent='试听：'+clip.name;
 }catch{if(token===casingAuditionToken&&status)status.textContent='加载失败，点击试听重试';}
}
const STARTER_SHOT_URL='assets/audio/pistol-shot-24.wav';
const STARTER_HIT_URL='assets/audio/metal-light-6.wav';
let starterHitBuffer=null,starterHitLoading=null;
let starterShotBuffer=null,starterShotLoading=null;const starterShotVoices=new Set();
function loadStarterShot(){
 loadStarterHit();loadCasingSound().catch(()=>{});
 if(starterShotBuffer||starterShotLoading||!audio?.decodeAudioData||typeof fetch!=='function')return;
 starterShotLoading=fetch(STARTER_SHOT_URL).then(r=>{if(!r.ok)throw Error('Pistol sample '+r.status);return r.arrayBuffer();}).then(b=>audio.decodeAudioData(b)).then(b=>{starterShotBuffer=b;}).catch(()=>{}).finally(()=>{starterShotLoading=null;});
}
function loadStarterHit(){
 if(starterHitBuffer||starterHitLoading||!audio?.decodeAudioData||typeof fetch!=='function')return;
 starterHitLoading=fetch(STARTER_HIT_URL).then(r=>{if(!r.ok)throw Error('Impact sample '+r.status);return r.arrayBuffer();}).then(b=>audio.decodeAudioData(b)).then(b=>{starterHitBuffer=b;}).catch(()=>{}).finally(()=>{starterHitLoading=null;});
}
function playStarterSample(buffer,volume,kind){
 while(starterShotVoices.size>=12){const oldest=starterShotVoices.values().next().value;oldest.stop();starterShotVoices.delete(oldest);}
 const source=audio.createBufferSource(),gain=audio.createGain();source.buffer=buffer;source.sampleKind=kind;source.sampleGain=gain;gain.gain.setValueAtTime(volume,audio.currentTime);source.connect(gain);gain.connect(audio.destination);starterShotVoices.add(source);source.onended=()=>{starterShotVoices.delete(source);source.disconnect();gain.disconnect();};source.start();return source;
}
function starterShotSound(){
 if(!sound)return;unlockAudio();if(!audio||audio.state==='suspended')return;
 if(!starterShotBuffer){shotSound();return;}playStarterSample(starterShotBuffer,soundLevels.shot,'shot');
}
function starterImpactSound(){
 if(!sound||!audio||audio.state==='suspended'||audio.currentTime-hitSoundAt<.045)return;
 if(!starterHitBuffer){loadStarterHit();hitSound();return;}hitSoundAt=audio.currentTime;playStarterSample(starterHitBuffer,soundLevels.hit,'hit');
}
function shotSound(){if(!sound||!audio||soundLevels.shot===0)return;const t=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();o.type='square';o.frequency.setValueAtTime(760,t);o.frequency.exponentialRampToValueAtTime(170,t+.075);g.gain.setValueAtTime(.032*soundLevels.shot/.48,t);g.gain.exponentialRampToValueAtTime(.001,t+.09);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.1)}
// Short descending digital impact; throttle by audio time so slow motion cannot stack voices.
function hitSound(){if(!sound||!audio||soundLevels.hit===0||audio.state==='suspended'||audio.currentTime-hitSoundAt<.045)return;hitSoundAt=audio.currentTime;const t=audio.currentTime;for(const [type,from,to,volume,duration]of [['triangle',1350,320,.045,.065],['square',2700,920,.012,.035]]){const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(from,t);o.frequency.exponentialRampToValueAtTime(to,t+duration);g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(volume*soundLevels.hit/.55,t+.002);g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(g);g.connect(audio.destination);o.onended=()=>{o.disconnect();g.disconnect()};o.start(t);o.stop(t+duration+.005)}}
function cyberHit(e,shot=null){if(shot?.itemId==='pistol_t1'||shot?.ownerItem?.itemId==='pistol_t1'){starterHit(e,shot);return;}hitSound();if(time-(e.sparkAt??-Infinity)<.045)return;e.sparkAt=time;const room=192-particles.filter(q=>q.hitSpark).length;for(let i=0;i<Math.min(7,room);i++){const a=Math.random()*TAU,v=95+Math.random()*160,life=.12+Math.random()*.09;particles.push({hitSpark:true,x:e.x,y:e.y+e.r*.55,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life,maxLife:life,c:shot?.evolution?[shot.evolution.color,shot.evolution.accent,'#f0ffff'][i%3]:i%3===0?'#ff60dc':i%3===1?'#54eaff':'#a5f8ed',height:e.type==='rocket'?16:Math.min(44,e.r+12),vz:35+Math.random()*65,length:5+Math.random()*7})}}
function starterHit(e,s){
 starterImpactSound();if(time-(e.sparkAt??-Infinity)<.045)return;e.sparkAt=time;
 const angle=Math.atan2(s.vy||0,s.vx||1),len=Math.hypot(s.vx||1,s.vy||0)||1,x=e.x-(s.vx||1)/len*e.r*.65,y=e.y-(s.vy||0)/len*e.r*.65;
 if(particles.filter(q=>q.juicyImpact).length<24)particles.push({juicyImpact:true,x,y,vx:0,vy:0,height:s.height||24,life:.11,maxLife:.11,angle:Math.random()*TAU,variant:Math.floor(Math.random()*STARTER_IMPACTS.length)});
 const room=192-particles.filter(q=>q.hitSpark).length;
 for(let i=0;i<Math.min(13,room);i++){const a=angle+Math.PI+(Math.random()-.5)*2.9,v=150+Math.random()*180,life=.08+Math.random()*.09;particles.push({hitSpark:true,starterSpark:true,x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life,maxLife:life,c:i%3===0?'#fff8cf':i%3===1?'#ffd447':'#ff8b26',height:s.height||24,vz:40+Math.random()*100,length:4+Math.random()*9});}
}
function drawHitSpark(q){const r=renderer,fade=Math.max(0,q.life/q.maxLife),speed=Math.hypot(q.vx,q.vy)||1,dx=q.vx/speed,dz=q.vy/speed*1.06,x=q.x-325,z=(q.y-300)*1.06,y=Math.max(5,q.height),length=q.length*fade,width=.5*fade;r.emissiveQuad([x-dx*length-dz*width,y,z-dz*length+dx*width],[x+dz*width,y,z-dx*width],[x-dz*width,y,z+dx*width],[x-dx*length+dz*width,y,z-dz*length-dx*width],q.c);r.emissiveBox(x,y+.2,z,1.8*fade,1.2*fade,1.8*fade,q.c);r.glow(x,y,z,2.8*fade,q.c)}
function shatter(e){if(e.transport&&!e.transport.waiting){interceptEnemyTransport(e);return;}globalThis.TalentRuntime?.onKill(e);if(e.type==='suicideDrone')detonateSuicideDrone(e);if(e.type==='goldSpider')claimGoldSpider(e);onDrinkEnemyDeath(e);if(e.type==='droneMinion'&&typeof explodeDroneMinion==='function')explodeDroneMinion(e);shatterVisual(e)}
function shatterVisual(e){spawnDeathBurst(e.x,e.y,e.r,'enemy',Math.min(50,e.r+14));spectrumHits.push({x:e.x-325,age:0,power:e.type==='boss'?1.6:1});if(spectrumHits.length>8)spectrumHits.shift();const palette=e.type==='goldSpider'?['#ffd45c','#bb821e','#fff0ae','#e6ac32']:e.type==='moth'?['#ba8ace','#685277','#e1bbed']:e.type==='skull'?['#c3b39a','#9e8871','#e8d7b7']:['#b88869','#e5c49a','#954c43','#ee8866'];const size=e.type==='boss'?10:7;for(let x=-e.r;x<=e.r;x+=size)for(let y=-e.r;y<=e.r;y+=size){if(x*x+y*y>e.r*e.r)continue;let a=Math.atan2(y,x)+(Math.random()-.5)*.6,v=80+Math.random()*180;particles.push({x:e.x+x,y:e.y+y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-65,life:.65+Math.random()*.45,c:palette[Math.floor(Math.random()*palette.length)],chunk:true,heatLeft:.52,height:20+Math.random()*20,vz:90+Math.random()*100,size:size*(.7+Math.random()*.5),angle:Math.random()*TAU,spin:(Math.random()-.5)*15})}burst(e.x,e.y,'#ffe5b0',10);deathSound(e.type==='boss')}
// Hit feedback uses world time and only transforms rendered model vertices.
function enemyHitFeedback(e){if(bossDeath?.bodies.includes(e))return {x:0,z:0,flash:bossDeath.age<.055,white:Math.max(0,1-bossDeath.age/.055)};const age=time-(e.hitAt??-Infinity);if(age<0||age>=.14)return {x:0,z:0,flash:false,white:0};const left=1-age/.14,white=age<.012?1:Math.max(0,1-(age-.012)/.043)**2;return {x:Math.cos(age*110)*1.7*left,z:Math.sin(age*135)*1.3*left,flash:white>0,white};}
function applyEnemyHit(e,start,glowStart){const hit=enemyHitFeedback(e);if(hit.flash||hit.x||hit.z)renderer.hitModel(start,glowStart,hit.x,hit.z,hit.white||0)}
function banknoteScale(q){const t=Math.max(0,Math.min(1,q.life/.5));return t*t*(3-2*t)}
function gainCash(amount,x,y,height=75){amount*=armor?.cashMultiplier||1;cash+=amount;if(state!=='stageClear')cashPopups.push({amount,x,y,height,age:0,life:1});if(cashPopups.length>24)cashPopups.shift();return amount}
function renderSkateCooldown(){
 const el=$('skate-cooldown');if(!p||shoes?.id!=='skateboard'||['menu','dead'].includes(state)){el.hidden=true;return;}
 el.hidden=false;const v=renderer.vp,x=p.x-325,z=(p.y-300)*1.06,h=35+skateJumpHeight(),w=v[3]*x+v[7]*h+v[11]*z+v[15],sx=(v[0]*x+v[4]*h+v[8]*z+v[12])/w,sy=(v[1]*x+v[5]*h+v[9]*z+v[13])/w,left=p.skateCooldownLeft||0,progress=Math.max(0,Math.min(1,1-left/shoes.skateTrickCooldown)),circ=2*Math.PI*11;
 el.style.left=(sx*.5+.5)*100+'%';el.style.top=(1-sy)*50+'%';el.innerHTML=`<svg viewBox="0 0 28 28"><circle class="skate-cd-track" cx="14" cy="14" r="11"/><circle class="skate-cd-fill" cx="14" cy="14" r="11" stroke-dasharray="${circ}" stroke-dashoffset="${circ*(1-progress)}" transform="rotate(-90 14 14)"/></svg><span>${left>0?left.toFixed(1):'✓'}</span>`;el.setAttribute?.('aria-label',left>0?`滑板特技冷却 ${left.toFixed(1)} 秒`:'滑板特技就绪');
}
function renderCashPopups(){const layer=$('cash-popups');if(!cashPopups.length){if(layer.innerHTML)layer.innerHTML='';return}const v=renderer.vp;layer.innerHTML=cashPopups.map(q=>{const x=(q.followPlayer?p.x:q.x)-325,z=((q.followPlayer?p.y:q.y)-300)*1.06,h=q.height+(q.settlement?mountRiderLift():0),w=v[3]*x+v[7]*h+v[11]*z+v[15],sx=(v[0]*x+v[4]*h+v[8]*z+v[12])/w,sy=(v[1]*x+v[5]*h+v[9]*z+v[13])/w,alpha=q.settlement?Math.max(0,1-q.age/q.life):Math.min(1,Math.max(0,(q.life-q.age)/.3)),scale=q.settlement?1:q.damageNumber?1+(q.critical?.55:.32)*Math.exp(-q.age*18):1+.16*Math.exp(-q.age*10);return `<span class="cash-popup${q.damageNumber?' damage-popup':''}${q.critical?' damage-critical':''}${q.skillPoint?' skill-popup':''}${q.trick?' skate-trick-popup':''}${q.settlement?' settlement-popup':''}" style="${q.damageNumber?(q.critical?'color:#ffd04a;':'color:#fff2d0;'):q.trick?'color:#eaffff;':q.text?'color:#ffd45c;':''}left:${(sx*.5+.5)*100}%;top:${(1-sy)*50}%;opacity:${alpha};transform:translate(-50%,-100%) translateY(${-q.age*(q.damageNumber?52:q.settlement?22:q.followPlayer?65:28)}px) scale(${scale})">${q.text||'+'+q.amount+'$'}</span>`}).join('')}
function cashBurst(x,y,n=3){const room=96-particles.filter(q=>q.banknote).length;for(let i=0;i<Math.min(n,room);i++){const a=Math.random()*TAU,v=560+Math.random()*280;particles.push({banknote:true,x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:1.5+Math.random()*.4,height:24+Math.random()*12,vz:190+Math.random()*80,angle:Math.random()*TAU,spin:(Math.random()<.5?-1:1)*(12+Math.random()*8),flutter:Math.random()*TAU})}}
function burst(x,y,c,n=8){for(let i=0;i<n;i++){let a=Math.random()*TAU,v=30+Math.random()*100;particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.3+Math.random()*.4,c})}}
function spawnExplosionFX(x,y,radius){
 explosionFX.push({x,y,radius,t:0,seed:(x*.13+y*.17+time*.7)%TAU});
 if(explosionFX.length>32)explosionFX.shift();
}
function explosionRingFactor(t){
 if(t<.035)return .1+.86*(1-(1-Math.max(0,t)/.035)**3);
 return .96+.14*(1-Math.exp(-(t-.035)/.14));
}
function drawExplosionFX(e){
 const r=renderer,x=e.x-325,z=(e.y-300)*1.06,t=e.t,rad=e.radius;
 // Ground light is already full-size on ignition, then contracts beneath the other layers.
 if(t<.28){const fade=(1-t/.28)**1.4;r.glow(x,3.2,z,rad*2.4/2.9*fade,'#ffdc92');r.glow(x,3.3,z,rad*1.05/2.9*fade,'#fff6d5');}
 // The shock front reaches the damage radius almost immediately, then coasts outward.
 if(t<.34){const outer=rad*explosionRingFactor(t),width=Math.max(1,rad*.028)*(1-t/.34),alpha=.85*(1-t/.34)**2,pt=(a,d)=>[x+Math.cos(a)*d,5,z+Math.sin(a)*d*1.06];for(let i=0;i<48;i++){const a=i*TAU/48,b=(i+1)*TAU/48;r.transparentQuad(pt(a,outer),pt(b,outer),pt(b,Math.max(0,outer-width)),pt(a,Math.max(0,outer-width)),'#ffd89a',[alpha,alpha,alpha,alpha]);}}
 // Soft camera-facing smoke lobes rise and separate, without opaque blocks hiding enemies.
 if(t<.9){const alpha=.28*Math.min(1,t/.065)*(1-t/.9)**1.4;for(let i=0;i<7;i++){const angle=e.seed+i*TAU/7,drift=rad*(.4+t*.06),cx=x+Math.cos(angle)*drift,cz=z+Math.sin(angle)*drift,cy=12+t*(28+i%3*8),size=rad*(.55+.05*Math.min(1,t/.45))*(1+i%3*.025),center=[cx,cy,cz],pt=a=>[cx+Math.cos(a)*size,cy+Math.sin(a)*size*.532,cz-Math.sin(a)*size*.847];for(let j=0;j<12;j++)r.transparentQuad(center,pt(j*TAU/12),pt((j+1)*TAU/12),center,i%2?'#666974':'#87818a',[alpha,0,0,alpha]);}}
 // Additive white-hot flash is the strongest, shortest layer and renders after smoke.
 if(t<.095){const fade=1-t/.095,fire=rad*.42*Math.sqrt(fade);r.glow(x,30,z,fire,'#ff9b45');r.projectile(x,36,z,fire*.62,'#fff9dd');for(let i=0;i<6;i++){const a=e.seed+i*TAU/6,spread=rad*.28*(.3+1-fade);r.projectile(x+Math.cos(a)*spread,27+Math.sin(i*2.3)*5,z+Math.sin(a)*spread,fire*.34,'#ffdc82');}}
}
function bullet(x,y,a,v,c='#ff795d',r=4,drawRadius=r){const b={x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,c,r,drawRadius,life:9};prepareDrinkBullet(b);bullets.push(b)}
function fire(e){let a=Math.atan2(p.y-e.y,p.x-e.x),v=140+Math.min(80,floor*7);if(e.type==='stormCaller'){hazards.push({x:p.x,y:p.y,t:0,lightning:true});beep(620,.16,'triangle',.025);}else if(e.type==='twinGun'){e.twinSide=-(e.twinSide||1);fireTwinBarrel(e,e.twinSide);e.twinPending={left:.22,side:-e.twinSide};}else if(e.type==='lobber'){bullets.push({lob:true,x:e.x,y:e.y,startX:e.x,startY:e.y,targetX:p.x,targetY:p.y,age:0,duration:1.1,life:1.1,r:5,c:'#ffb34f'});}else if(e.type==='spitter'){bullet(e.x,e.y,a,STARTER_ENEMIES.spitter.bulletSpeed,'#ff9470',4)}else if(e.type==='missile'){launchMissile(e)}else if(e.type==='eye'){bullet(e.x,e.y,a,v)}else if(e.type==='skull'){for(let i=0;i<8;i++)bullet(e.x,e.y,i*TAU/8+e.seed+e.t*.13,v*.8,'#f7bd76')}else if(e.type==='moth'){for(let i=-1;i<=1;i++)bullet(e.x,e.y,a+i*.38,v*.72,'#d28cfa',4)}else{for(let i=0;i<10;i++)bullet(e.x,e.y,i*TAU/10+e.t*.22,v*.86,i%2?'#ff795d':'#efbe6b');if(floor>=6)hazards.push({x:p.x,y:p.y,t:0})}beep(140,.08,'triangle',.018)}
const MISSILE_SPEED=150,MISSILE_TURN=1.8,CHASER_SPEED=110;
function launchMissile(e){const a=Math.atan2(p.y-e.y,p.x-e.x);missiles.push({x:e.x,y:e.y,a,hp:3,max:3,r:9,life:6,type:'rocket'});beep(320,.13,'sawtooth',.025)}
function missileBurst(m){m.hp=0;m.life=0;blasts.push({x:m.x,y:m.y,r:24,t:0});spawnExplosionFX(m.x,m.y,24);burst(m.x,m.y,'#ffc77e',12);beep(180,.1,'square',.025)}
function updateMissiles(dt){for(const m of missiles){if(m.hp<=0)continue;const coverX=m.x,coverY=m.y;const aim=Math.atan2(p.y-m.y,p.x-m.x),delta=Math.atan2(Math.sin(aim-m.a),Math.cos(aim-m.a));m.a+=Math.max(-MISSILE_TURN*dt,Math.min(MISSILE_TURN*dt,delta));m.x+=Math.cos(m.a)*MISSILE_SPEED*dt;m.y+=Math.sin(m.a)*MISSILE_SPEED*dt;m.life-=dt;if(blockBulletWithCover(m,coverX,coverY)){m.hp=0;continue;}if(Math.hypot(p.x-m.x,p.y-m.y)<m.r+5*drinkPlayerScale()){hurt(m);missileBurst(m)}else if(m.life<=0||m.x<A.x+8||m.x>A.x+A.w-8||m.y<A.y+8||m.y>A.y+A.h-8)missileBurst(m)}missiles=missiles.filter(m=>m.hp>0&&m.life>0)}

// Independent regular enemies share the existing combat clock, targets and resident meshes.
function fireTwinBarrel(e,side){const a=Math.atan2(p.y-e.y,p.x-e.x),x=e.x-Math.sin(a)*side*13,y=e.y+Math.cos(a)*side*13;bullet(x,y,Math.atan2(p.y-y,p.x-x),155,'#ffc067',4);}
function detonateSuicideDrone(e){if(e.deathBurst)return;e.deathBurst=true;for(let i=0;i<12;i++)bullet(e.x,e.y,(e.seed||0)+i*TAU/12,115,'#ff6d8f',4);spawnExplosionFX(e.x,e.y,26);}
function advanceLob(b,dt){b.age+=dt;const u=Math.min(1,b.age/b.duration);b.x=b.startX+(b.targetX-b.startX)*u;b.y=b.startY+(b.targetY-b.startY)*u;b.life=b.duration-b.age;if(u>=1){b.life=0;hazards.push({x:b.targetX,y:b.targetY,t:1.1-dt+Math.max(0,b.age-b.duration),lobImpact:true});spawnExplosionFX(b.targetX,b.targetY,33);}}
function updateRicochetEnemy(e,dt){e.warn=false;const speed=ADDED_ENEMIES.ricochet.speed*drinkMonsterSpeed();if(e.bounceVX==null){const a=Math.atan2(p.y-e.y,p.x-e.x)+.45;e.bounceVX=Math.cos(a);e.bounceVY=Math.sin(a);}
 // Small swept legs preserve contacts and reflections even during a long frame.
 const steps=Math.max(1,Math.ceil(speed*dt/6)),travel=speed*dt/steps;
 for(let i=0;i<steps;i++){const ox=e.x,oy=e.y;e.x+=e.bounceVX*travel;e.y+=e.bounceVY*travel;const left=A.x+e.r,right=A.x+A.w-e.r,top=A.y+e.r,bottom=A.y+A.h-e.r;if(e.x<left||e.x>right){e.x=Math.max(left,Math.min(right,e.x));e.bounceVX*=-1;}if(e.y<top||e.y>bottom){e.y=Math.max(top,Math.min(bottom,e.y));e.bounceVY*=-1;}const wx=e.x,wy=e.y;resolveEnemyCover(e,ox,oy);if(Math.abs(e.x-wx)>.01)e.bounceVX*=-1;if(Math.abs(e.y-wy)>.01)e.bounceVY*=-1;if(Math.hypot(p.x-e.x,p.y-e.y)<e.r+drinkPlayerRadius())hurt(e);}
}
function addedEnemyPose(e,x,z,bob){if(e.type==='builder'){const at=e.buildTarget?builderTileCenter(e.buildTarget):p;return monsterPose(x,bob,z,Math.atan2(at.x-e.x,(at.y-e.y)*1.06));}if(e.type==='ironball'){const a=e.roll||0,c=Math.cos(a),s=Math.sin(a),heading=e.rollHeading??Math.atan2(p.y-e.y,p.x-e.x),nx=Math.cos(heading),nz=Math.sin(heading);return [nx*c,nx*s,-nz,x,-s,c,0,31,nz*c,nz*s,nx,z];}return monsterPose(x,e.type==='skull'?0:bob,z,e.type==='ricochet'?e.t*4:ADDED_ENEMIES[e.type]?Math.PI/2-Math.atan2(p.y-e.y,p.x-e.x):0);}
function drawAddedEnemyGeometry(type,warn){const r=renderer;
 if(type==='stormCaller'){r.box(0,17,0,25,23,24,'#405778');r.box(0,31,0,29,5,27,'#adbbd2');r.emissiveBox(0,22,14,15,4,2,'#a2caff');for(const side of [-1,1]){r.box(side*18,9,0,9,14,28,'#293c57');r.box(side*15,39,-2,5,27,5,'#94adcc');for(const y of [32,38,44])r.ring(side*15,y,-2,6,'#6794d1',2);r.sphere(side*15,54,-2,6,warn?'#f7eeff':'#a6cfff');}r.emissiveBox(0,37,-2,23,3,3,'#a0bfff');return;}
 if(type==='ironball'){
  r.sphere(0,0,0,29,'#4b5d6b',1,1,1,10,20);
  // Three raised great-circle bands in XY, XZ and YZ planes, each at right angles.
  for(let plane=0;plane<3;plane++){
   const point=(a,b,radius)=>{const u=Math.cos(a)*Math.cos(b)*radius,v=Math.sin(a)*Math.cos(b)*radius,w=Math.sin(b)*radius;return plane===0?[u,v,w]:plane===1?[u,w,v]:[w,u,v];};
   for(let i=0;i<48;i++){const a=i*TAU/48,b=(i+1)*TAU/48,width=.082;
    r.quad(point(a,-width,30.5),point(b,-width,30.5),point(b,width,30.5),point(a,width,30.5),'#becbd1');
    for(const side of [-1,1])r.quad(point(a,side*width,29),point(b,side*width,29),point(b,side*width,30.5),point(a,side*width,30.5),'#788f9e');
   }
   for(let i=0;i<12;i++){const q=point((i+.5)*TAU/12,0,30.8);r.sphere(...q,1.5,'#e6eeed',1,1,1,3,6);}
  }return;
 }
 if(type==='ricochet'){r.disc(0,12,0,20,'#829da7');r.ring(0,14,0,15,'#ffac55',3);for(let i=0;i<10;i++){const a=i*TAU/10;r.box(Math.cos(a)*21,12,Math.sin(a)*21,10,7,6,'#d4e1db',-a);}r.sphere(0,18,0,9,'#3b505f',1,.6,1);r.emissiveBox(0,23,0,8,2,8,'#ff6252');return;}
 if(type==='suicideDrone'){r.sphere(0,26,0,15,'#a14358',1,.65,1);r.box(0,28,12,18,7,4,'#283747');r.emissiveBox(0,28,15,11,3,2,'#ff7892');for(const side of [-1,1]){r.box(side*19,25,0,17,4,5,'#8298a4');r.ring(side*26,29,0,11,'#bdd3d9',3);r.emissiveBox(side*26,21,0,5,5,5,'#ff855c');}r.sphere(0,17,0,9,'#f89657');return;}
 r.box(0,17,0,27,24,25,type==='twinGun'?'#4d7182':'#7b7955');r.box(0,32,0,30,5,27,'#becac2');r.emissiveBox(0,25,14,14,4,2,warn?'#fff0a0':'#ffb655');
 for(const side of [-1,1]){r.box(side*19,7,0,10,11,31,'#334653');if(type==='twinGun'){r.box(side*14,22,19,9,10,23,'#9aadb6');r.box(side*14,22,32,6,7,3,'#253744');}else{r.box(side*13,30,-3,6,8,19,'#afaf8c');}}
 if(type==='lobber'){r.box(0,35,-5,15,15,19,'#48555d');r.ring(0,44,-5,9,'#e4bf72',3);r.sphere(0,44,-5,6,warn?'#fff0a0':'#ff9d52');}
}

function updateChaser(e,dt){if(e.hp<=0)return;let coverX=e.x,coverY=e.y;e.warn=false;if(e.knockLeft>0){const used=Math.min(dt,e.knockLeft),decay=Math.exp(-7*used),travel=(1-decay)/7;e.x=Math.max(A.x+20,Math.min(A.x+A.w-20,e.x+e.knockVX*travel));e.y=Math.max(A.y+20,Math.min(A.y+A.h-20,e.y+e.knockVY*travel));e.knockVX*=decay;e.knockVY*=decay;e.knockLeft=Math.max(0,e.knockLeft-used);resolveEnemyCover(e,coverX,coverY);coverX=e.x;coverY=e.y;if(Math.hypot(p.x-e.x,p.y-e.y)<e.r+5*drinkPlayerScale())hurt(e);dt-=used;if(dt<=0)return;}const dx=p.x-e.x,dy=p.y-e.y,distance=Math.hypot(dx,dy),move=Math.min(distance,(STARTER_ENEMIES[e.type]?.speed??ADDED_ENEMIES[e.type]?.speed??CHASER_SPEED)*drinkMonsterSpeed()*dt);if(distance>0){e.x=Math.max(A.x+20,Math.min(A.x+A.w-20,e.x+dx/distance*move));e.y=Math.max(A.y+20,Math.min(A.y+A.h-20,e.y+dy/distance*move))}resolveEnemyCover(e,coverX,coverY);if(Math.hypot(p.x-e.x,p.y-e.y)<e.r+5*drinkPlayerScale())hurt(e)}
function explodeFriendlyRocket(s,targets){if(s.exploded)return;s.exploded=true;s.life=0;const x=Math.max(A.x,Math.min(A.x+A.w,s.x)),y=Math.max(A.y,Math.min(A.y+A.h,s.y)),victims=targets.filter(e=>e.hp>0&&Math.hypot(e.x-x,e.y-y)<=s.blastRadius);shots.push({beam:true,arc:true,radial:true,arcTargets:victims,originX:x,originY:y,x,y,vx:0,vy:0,life:.18,damage:s.damage,critChance:s.critChance,critMultiplier:s.critMultiplier,pierce:victims.length+1,hitTargets:new Set(),damageApplied:false,color:FRIENDLY_SHOT_COLOR,source:s.source,weaponId:s.weaponId||'rocket',radius:s.blastRadius,height:12});spawnExplosionFX(x,y,s.blastRadius);if(s.evolution){const fx=explosionFX.at(-1);fx.modelVisual=s.evolution;fx.fireworks=s.ownerItem?.familyId==='seeker'&&s.ownerItem.tier===5;fx.nuclear=!!s.ownerItem?.quake;if(fx.fireworks){fx.fireworkStyle=FIREWORK_STYLES[fireworkSerial++%FIREWORK_STYLES.length];fx.duration=2.2;fx.visualRadius=210;}if(fx.nuclear)fx.duration=1.8;else if(s.ownerItem?.familyId==='rocket')fx.duration=1.15;if(s.ownerItem?.quake)terrainEmitShock(x,y,'weapon');}burst(x,y,s.evolution?.color||FRIENDLY_SHOT_COLOR,12);beep(90,.12,'sawtooth',.025)}
function makeSeekerCurve(s,target){const x=s.x,y=s.y,dx=target.x-x,dy=target.y-y,distance=Math.hypot(dx,dy),heading=Math.atan2(s.vy,s.vx),hx=Math.cos(heading),hy=Math.sin(heading),ux=distance?dx/distance:hx,uy=distance?dy/distance:hy,handle=Math.min(100,distance*.45),reverse=hx*ux+hy*uy<-.6,side=(hx*uy-hy*ux)<0?-1:1,bend=reverse?Math.min(80,distance*.4)*side:0,bounded=(a,min,max)=>Math.max(min+4,Math.min(max-4,a)),c1={x:bounded(x+hx*handle,A.x,A.x+A.w),y:bounded(y+hy*handle,A.y,A.y+A.h)},c2={x:bounded(target.x-ux*handle*.5-uy*bend,A.x,A.x+A.w),y:bounded(target.y-uy*handle*.5+ux*bend,A.y,A.y+A.h)},points=[{x,y}],lengths=[0];for(let i=1;i<=48;i++){const t=i/48,u=1-t,point={x:u*u*u*x+3*u*u*t*c1.x+3*u*t*t*c2.x+t*t*t*target.x,y:u*u*u*y+3*u*u*t*c1.y+3*u*t*t*c2.y+t*t*t*target.y},previous=points[points.length-1];lengths.push(lengths[lengths.length-1]+Math.hypot(point.x-previous.x,point.y-previous.y));points.push(point)}s.curve={points,lengths,distance:0,total:lengths[lengths.length-1],goalX:target.x,goalY:target.y,target}}
function advanceSeekerCurve(s,dt,target=s.homingTarget){if(!s.curve||s.curve.target!==target||Math.hypot(target.x-s.curve.goalX,target.y-s.curve.goalY)>8||s.curve.distance>=s.curve.total-1e-6)makeSeekerCurve(s,target);const curve=s.curve,from=curve.distance,to=Math.min(curve.total,from+s.speed*dt);s.homingSegments=[{x:s.x,y:s.y}];for(let i=1;i<curve.points.length;i++)if(curve.lengths[i]>from&&curve.lengths[i]<to)s.homingSegments.push(curve.points[i]);let index=1;while(index<curve.points.length-1&&curve.lengths[index]<to)index++;const a=curve.points[index-1],b=curve.points[index],span=curve.lengths[index]-curve.lengths[index-1],fraction=span?(to-curve.lengths[index-1])/span:1;s.x=a.x+(b.x-a.x)*fraction;s.y=a.y+(b.y-a.y)*fraction;curve.distance=to;s.homingSegments.push({x:s.x,y:s.y});const length=Math.hypot(b.x-a.x,b.y-a.y);if(length){s.vx=(b.x-a.x)/length*s.speed;s.vy=(b.y-a.y)/length*s.speed}return (to-from)/s.speed}
// Patrol uses the same constant-speed curves and consumes leftover travel at each waypoint.
function advanceSeekerPatrol(s,dt){if(!s.patrol){const cx=A.x+A.w/2,cy=A.y+A.h/2,points=Array.from({length:8},(_,i)=>{const angle=-Math.PI/2+i*TAU/8;return {x:cx+Math.cos(angle)*A.w*.38,y:cy+Math.sin(angle)*A.h*.38}});let index=0,best=Infinity;for(let i=0;i<points.length;i++){const dx=points[i].x-s.x,dy=points[i].y-s.y,score=Math.hypot(dx,dy)+(dx*s.vx+dy*s.vy<0?200:0);if(score<best){best=score;index=i}}s.patrol={points,index}}const segments=[{x:s.x,y:s.y}];let remaining=dt;for(let i=0;i<32&&remaining>1e-8;i++){const patrol=s.patrol,target=patrol.points[patrol.index],used=advanceSeekerCurve(s,remaining,target);segments.push(...s.homingSegments.slice(1));remaining-=used;if(s.curve.distance>=s.curve.total-1e-6)patrol.index=(patrol.index+1)%patrol.points.length;else break}s.homingSegments=segments}
function advanceSwordSlash(s,dt){const previous=s.angle,oldX=s.x,oldY=s.y,origin=s.drinkOrigin||(s.source==='drone'?dronePosition():p);s.age=Math.min(.14,s.age+dt);s.angle=s.aim+s.direction*SWORD_SWEEP*(s.age/.14-.5);s.originX=s.x=origin.x;s.originY=s.y=origin.y;s.life-=dt;const points=Array.from({length:Math.max(2,Math.ceil(Math.abs(s.angle-previous)/.08)+1)},(_,i)=>i);const count=points.length,targets=combatTargets();s.arcTargets=targets.filter(e=>points.some((_,i)=>{const a=previous+(s.angle-previous)*i/(count-1),dx=Math.cos(a),dy=Math.sin(a);return segmentHits(s.x+dx*18,s.y+dy*18,s.x+dx*s.slashRadius,s.y+dy*s.slashRadius,e,5)})||segmentHits(oldX+Math.cos(previous)*s.slashRadius,oldY+Math.sin(previous)*s.slashRadius,s.x+Math.cos(s.angle)*s.slashRadius,s.y+Math.sin(s.angle)*s.slashRadius,e,5));return true}
function advanceFriendlyShot(s,dt){if(s.electricRing){s.age=(s.age||0)+dt;const o=s.source==='drone'?dronePosition():p;s.x=s.originX=o.x;s.y=s.originY=o.y;}if(s.evolution&&s.life<=0)return false;if(s.evolution&&(s.sustain||s.zenith))return advanceModelShot(s,dt);if(s.slash)return advanceSwordSlash(s,dt);if(s.launchDelay>0){s.launchDelay-=dt;if(s.launchDelay>0)return false;dt=Math.max(0,-s.launchDelay);const origin=s.drinkOrigin||(s.source==='drone'?dronePosition():p);if(s.beam&&!s.arc){const aim=s.aim??Math.atan2(s.y-s.originY,s.x-s.originX),length=s.evolution?modelBeamLength(origin,aim):beamLength({x:origin.x,y:origin.y,aim});s.originX=origin.x;s.originY=origin.y;s.x=origin.x+Math.cos(aim)*length;s.y=origin.y+Math.sin(aim)*length;}else{s.x=origin.x;s.y=origin.y;}}s.lastX=s.x;s.lastY=s.y;s.homingSegments=null;if(s.evolution&&s.slashFollow&&s.arcTargets?.[0]){s.x=s.originX=s.arcTargets[0].x;s.y=s.originY=s.arcTargets[0].y;}if(s.homing){s.age+=dt;if(s.age>=(s.bee?0.1:0.18)){const targets=combatTargets();if(!s.homingTarget||!isAttackable(s.homingTarget))s.homingTarget=targets.length?(s.bee?[...targets].sort((a,b)=>Math.hypot(a.x-s.x,a.y-s.y)-Math.hypot(b.x-s.x,b.y-s.y))[s.beeIndex%Math.min(3,targets.length)]:targets.reduce((a,b)=>Math.hypot(a.x-s.x,a.y-s.y)<Math.hypot(b.x-s.x,b.y-s.y)?a:b)):null;if(s.homingTarget){s.patrol=null;advanceSeekerCurve(s,dt)}else advanceSeekerPatrol(s,dt);s.life-=dt;return true}}if(s.boomerang){const outside=s.x+s.vx*dt<=A.x||s.x+s.vx*dt>=A.x+A.w||s.y+s.vy*dt<=A.y||s.y+s.vy*dt>=A.y+A.h;if(!s.returning&&(s.traveled>=s.returnRange||outside)){s.returning=true;s.hitTargets.clear();s.pierce=99;}if(s.returning){const origin=s.drinkOrigin||(s.source==='drone'?dronePosition():p),dx=origin.x-s.x,dy=origin.y-s.y,len=Math.hypot(dx,dy),speed=Math.hypot(s.vx,s.vy);if(len<=speed*dt+8){s.life=0;return false}s.vx=dx/len*speed;s.vy=dy/len*speed}else s.traveled+=Math.hypot(s.vx,s.vy)*dt;}s.x+=s.vx*dt;s.y+=s.vy*dt;if(s.homing){s.x=Math.max(A.x+4,Math.min(A.x+A.w-4,s.x));s.y=Math.max(A.y+4,Math.min(A.y+A.h-4,s.y));}if(s.evolution&&s.boomerang)recordModelTrail(s,dt);s.life-=dt;return true}
function crescentPoints(s){const angle=Math.atan2(s.vy,s.vx),dx=Math.cos(angle),dy=Math.sin(angle),radius=s.waveRadius;return Array.from({length:25},(_,i)=>{const phi=-Math.PI/2+i*Math.PI/24,forward=(Math.cos(phi)-.5)*radius,side=Math.sin(phi)*radius;return {x:dx*forward-dy*side,y:dy*forward+dx*side}})}
// Sword waves share crescent collision geometry but have no knockback.
function pushMeleeEnemy(e,s){if(!isMeleeEnemy(e)||e.hp<=0||!Number.isFinite(s.knockback)||s.knockback<=0)return;const dx=e.x-p.x,dy=e.y-p.y,distance=Math.hypot(dx,dy),heading=Math.hypot(s.vx,s.vy)||1;e.knockVX=(distance?dx/distance:s.vx/heading)*s.knockback;e.knockVY=(distance?dy/distance:s.vy/heading)*s.knockback;e.knockLeft=.32}
function segmentHits(x,y,endX,endY,e,radius=4){const dx=endX-x,dy=endY-y,length=dx*dx+dy*dy,t=length?Math.max(0,Math.min(1,((e.x-x)*dx+(e.y-y)*dy)/length)):0;return (x+t*dx-e.x)**2+(y+t*dy-e.y)**2<(e.r+radius)**2}
function shotHits(s,e,dt){if(e.type==='fishSchool'&&!s.arc)return fishSchoolMembers(e).some(q=>shotHits(s,q,dt));if(s.zenith){const a=s.aim,old=s.lastAim??a;return segmentHits(s.lastX+Math.cos(old)*80,s.lastY+Math.sin(old)*80,s.x+Math.cos(a)*80,s.y+Math.sin(a)*80,e,7)||segmentHits(s.x+Math.cos(a)*18,s.y+Math.sin(a)*18,s.x+Math.cos(a)*80,s.y+Math.sin(a)*80,e,7)||segmentHits(s.lastX,s.lastY,s.x,s.y,e,s.hitRadius??9);}if(s.crescent)return crescentPoints(s).some(q=>segmentHits(s.lastX+q.x,s.lastY+q.y,s.x+q.x,s.y+q.y,e,5));if(s.arc)return s.arcTargets.includes(e);if(s.homingSegments)return s.homingSegments.some((point,i)=>i>0&&segmentHits(s.homingSegments[i-1].x,s.homingSegments[i-1].y,point.x,point.y,e,s.hitRadius??4));const x=s.beam?s.originX:(s.boomerang||s.homing)?s.lastX:s.x-s.vx*dt,y=s.beam?s.originY:(s.boomerang||s.homing)?s.lastY:s.y-s.vy*dt;return segmentHits(x,y,s.x,s.y,e,s.hitRadius??4)}
function hurt(source=null){if(state==='dead')return;if(typeof weaponLab!=='undefined'&&weaponLab?.active&&weaponLab.god)return;if(typeof fishSchoolTest!=='undefined'&&fishSchoolTest&&fishSchoolGod)return;if((ufoBossTest&&ufoBossGod)||(snakeTest&&snakeGod)||(virusTest&&virusGod)||(droneBossTest&&droneBossGod))return;if(p.inv>0||skateInvulnerable())return;if(trySkateDanger(source))return;if(terrainInterceptDamage())return;if(drinkInterceptDamage())return;clearSkateReward(false);modelWeaponHurt();p.faceHurtUntil=time+.42;p.floorHit=true;if(p.shield>0){p.shield=Math.max(0,p.shield-1);if(p.shield===0)terrainShieldBroken();p.shieldHit=.25;p.inv=damageInvincibility();shake=4;burst(p.x,p.y,'#70c6ff',12);beep(760,.06,'triangle',.04);updateUI();return}const hpBeforeHit=p.hp;p.hp=Math.max(0,p.hp-(armor?.healthDamageMultiplier||1));emitBarLoss(p,hpBeforeHit,p.hp,p.max);p.inv=damageInvincibility();shake=8;burst(p.x,p.y,'#ff795d',18);beep(60,.3,'sawtooth');updateUI();if(p.hp<=0){if(typeof fishSchoolTest!=='undefined'&&fishSchoolTest){finishFishSchoolTest(false);return}if(ufoBossTest){finishUFOBossTest(false);return}if(droneBossTest){finishDroneBossTest(false);return}if(humanoidTest){finishHumanoidTest(false);return}if(virusTest){finishVirusTest(false);return}if(snakeTest){finishSnakeTest(false);return}beginPlayerDeath()}}
function beginPlayerDeath(){
 enemyTransports=[];
 if(state==='dead')return;
 globalThis.TalentRuntime?.death();
 state='dead';playerDeath={age:0};spawnDeathBurst(p.x,p.y,28,'player',32+mountRiderLift());finishDrinkRoom();$('drinks-hud').hidden=true;droneSaws=[];releaseJoy();
 bullets=[];shots=[];missiles=[];hazards=[];spawnQueue=[];cashPopups=[];explosionFX=[];blasts=[];
 clearTimeout(toast.timer);$('toast').classList.remove('show');$('overlay').style.display='none';
 $('viewport').classList.remove('boss-intro');$('viewport').classList.remove('survival-intro');$('survival-clock').style.display='none';$('boss-health').hidden=true;
 const palette=['#d9e5d8','#62a997','#85eac9','#ffd18c'];
 for(let i=0;i<42;i++){const a=Math.random()*TAU,v=65+Math.random()*150;particles.push({x:p.x+(Math.random()-.5)*20,y:p.y+(Math.random()-.5)*16,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:1.2+Math.random()*.7,c:palette[i%palette.length],chunk:true,height:18+Math.random()*50+mountRiderLift(),vz:90+Math.random()*150,size:3+Math.random()*5,angle:Math.random()*TAU,spin:(Math.random()-.5)*14});}
 burst(p.x,p.y,'#b9ffdf',24);shake=10;syncMusic();
}
function updatePlayerDeath(dt){
 if(!playerDeath)return;
 time+=dt;updateDeathFeedback(dt);updateParticles(dt);shake*=Math.exp(-dt*9);playerDeath.age+=dt;
 if(playerDeath.age+1e-9<PLAYER_DEATH_DELAY)return;
 playerDeath=null;showOverlay(`<div class="tag">SIGNAL LOST</div><h2>信号中断</h2><p>抵达 B${String(floor).padStart(2,'0')} · 击败 ${kills} 个敌人<br>电梯仍在深处等待。</p><button class="primary" id="restart">重新下潜 ↓</button>`);$('restart').onclick=reset
}

function showOverlay(html){$('viewport').classList.remove('boss-intro');$('viewport').classList.remove('survival-intro');$('survival-clock').style.display='none';$('overlay').classList.remove('shop');$('viewport').classList.remove('shopping');$('overlay').innerHTML=html;$('overlay').style.display='flex';globalThis.TalentRuntime?.overlay();syncMusic()}
// Terrain persists between floors; hostile systems pause while the lift is moving.
function terrainCell(){return tiles.filter(t=>!t.medical&&!t.shieldTile&&!t.cashTile&&!t.shockTile&&!t.coverTile&&!t.trap&&!t.saw&&!t.flywheel).sort((a,b)=>Math.hypot(325+b.x*TILE-p.x,300+b.y*TILE-p.y)-Math.hypot(325+a.x*TILE-p.x,300+a.y*TILE-p.y))[0]}
function addTrap(){const t=terrainCell();if(!t)return false;t.trap={clock:0};return true}
function addSaw(orbit=false){if(orbit&&!ORBIT_SAW_ENABLED)return false;const t=terrainCell();if(!t)return false;t.saw=true;t.orbitSaw=orbit;t.sawClock=0;return true}
const FLYWHEEL_RADIUS=25,FLYWHEEL_SPEED=170;
function createFlywheel(t){t.flywheel={axis:Math.random()<.5?'x':'y',x:325+t.x*TILE,y:300+t.y*TILE,dir:Math.random()<.5?-1:1};return t.flywheel}
function addFlywheel(){const t=terrainCell();if(!t)return false;createFlywheel(t);return true}
function moveFlywheel(w,dt){const axis=w.axis,min=(axis==='x'?A.x:A.y)+FLYWHEEL_RADIUS,max=(axis==='x'?A.x+A.w:A.y+A.h)-FLYWHEEL_RADIUS,span=max-min;if(span<=0){w[axis]=(min+max)/2;return}const start=Math.max(min,Math.min(max,w[axis]))-min,phase=((w.dir>0?start:2*span-start)+FLYWHEEL_SPEED*dt)%(2*span);w[axis]=min+(phase<=span?phase:2*span-phase);w.dir=phase<span?1:-1;const other=axis==='x'?'y':'x',lo=(other==='x'?A.x:A.y)+FLYWHEEL_RADIUS,hi=(other==='x'?A.x+A.w:A.y+A.h)-FLYWHEEL_RADIUS;w[other]=Math.max(lo,Math.min(hi,w[other]))}
function eraseNegative(){const negative=[...tiles.filter(t=>t.trap||t.saw||t.flywheel).map(t=>({tile:t,x:t.flywheel?t.flywheel.x:325+t.x*TILE,y:t.flywheel?t.flywheel.y:300+t.y*TILE})),...turrets.filter(t=>!t.temporary).map(t=>({turret:t,x:t.x,y:t.y}))];negative.sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));const at=negative[0];if(!at)return false;if(at.turret)turrets=turrets.filter(t=>t!==at.turret);else{delete at.tile.trap;delete at.tile.saw;delete at.tile.orbitSaw;delete at.tile.sawClock;delete at.tile.flywheel}burst(at.x,at.y,'#c8f2dc',15);return true}
function addMedical(){const t=terrainCell();if(!t)return false;t.medical=true;t.healProgress=0;t.healFlash=0;t.medPack=false;return true}
function addCoverTile(){const t=terrainCell();if(!t)return false;t.coverTile=true;t.coverHp=coverMaximum();return true}
function addShockTile(){const t=terrainCell();if(!t)return false;t.shockTile=true;t.shockCooldown=0;t.shockOccupied=false;return true}
function addCashTile(){const t=terrainCell();if(!t)return false;t.cashTile=true;t.healProgress=0;t.healFlash=0;t.medPack=false;return true}
function addShield(){const t=terrainCell();if(!t)return false;t.shieldTile=true;t.healProgress=0;t.healFlash=0;t.medPack=false;return true}
const EDGES=['top','right','bottom','left'];
function syncTurretEdge(t){if(t.edge==='left'||t.edge==='right'){t.x=t.edge==='left'?A.x+24:A.x+A.w-24;t.y=A.y+34+(A.h-68)*t.slide}else{t.x=A.x+34+(A.w-68)*t.slide;t.y=t.edge==='bottom'?A.y+A.h-24:A.y+24}}
function createTurret(kind='machine',edge=EDGES[Math.floor(Math.random()*4)],slide=.2+Math.random()*.6,dir=Math.random()<.5?-1:1){const t={edge,slide,dir,invulnerable:true,r:16,type:'turret',kind,cool:2,rounds:0,gap:0,aim:0,warn:false,laserMode:'idle',laserTimer:1.8};syncTurretEdge(t);return t}
function addTurret(kind='machine'){if(turrets.filter(t=>!t.temporary).length>=4)return addTrap();turrets.push(createTurret(kind));return true}
function resetTurretCooldowns(){for(const t of turrets){t.cool=2;t.rounds=0;t.gap=0;t.aim=0;t.warn=false;t.laserMode='idle';t.laserTimer=1.8}}
function slideTurret(t,dt){const span=t.edge==='left'||t.edge==='right'?A.h:A.w;t.slide+=t.dir*105*dt/Math.max(1,span-68);if(t.slide>1){t.slide=2-t.slide;t.dir=-1}else if(t.slide<0){t.slide=-t.slide;t.dir=1}syncTurretEdge(t)}
function beamLength(e){const dx=Math.cos(e.aim),dy=Math.sin(e.aim),tx=Math.abs(dx)<.00001?Infinity:((dx>0?A.x+A.w:A.x)-e.x)/dx,ty=Math.abs(dy)<.00001?Infinity:((dy>0?A.y+A.h:A.y)-e.y)/dy;const length=Math.max(0,Math.min(tx,ty)),hit=firstCoverHit(e.x,e.y,e.x+dx*length,e.y+dy*length,5);return hit?length*hit.f:length}
function beamHits(e){const dx=Math.cos(e.aim),dy=Math.sin(e.aim),px=p.x-e.x,py=p.y-e.y,along=px*dx+py*dy;return along>=0&&along<=beamLength(e)&&Math.abs(px*dy-py*dx)<8+drinkPlayerRadius()-4}
function updateRangedMovement(e,dt){
 if(dt<=0||e.hp<=0||e.type==='laser'&&e.laserMode&&e.laserMode!=='idle')return;
 const phase=e.seed||0,speed=STARTER_ENEMIES[e.type]?.speed??(e.type==='moth'?44:e.type==='missile'?32:38),range=e.type==='skull'?200:e.type==='missile'||e.type==='laser'?235:215;
 const moveDt=dt*drinkMonsterSpeed(),oldX=e.x,oldY=e.y;
 e.strafeDir??=Math.sin(phase)>=0?1:-1;
 e.strafeLeft=(e.strafeLeft??(2.4+phase*.2))-moveDt;
 if(e.strafeLeft<=0){e.strafeDir*=-1;e.strafeLeft=2.8+1.2*(.5+.5*Math.sin(e.t+phase));}
 const dx=p.x-e.x,dy=p.y-e.y,distance=Math.hypot(dx,dy),nx=distance>0?dx/distance:Math.cos(phase),ny=distance>0?dy/distance:Math.sin(phase);
 // Smooth distance correction plus a persistent sideways walk, independent of spawn position.
 const radial=Math.max(-1.25,Math.min(1,(distance-range)/65)),side=.8*e.strafeDir;
 let vx=nx*radial-ny*side,vy=ny*radial+nx*side;
 const minX=A.x+28,maxX=A.x+A.w-28,minY=A.y+30,maxY=A.y+A.h-30;
 // Turn along a wall before clamping can pin an orbit in a corner.
 const wallLoss=(x,y)=>Math.abs(x-Math.max(minX,Math.min(maxX,x)))+Math.abs(y-Math.max(minY,Math.min(maxY,y)));
 if(wallLoss(e.x+(nx*radial+ny*side)*24,e.y+(ny*radial-nx*side)*24)+.1<wallLoss(e.x+vx*24,e.y+vy*24)){
  e.strafeDir*=-1;e.strafeLeft=Math.max(e.strafeLeft,1);
  vx=nx*radial+ny*side;vy=ny*radial-nx*side;
 }
 const length=Math.max(1,Math.hypot(vx,vy)),travel=speed*moveDt;
 e.x=Math.max(minX,Math.min(maxX,e.x+vx/length*travel));e.y=Math.max(minY,Math.min(maxY,e.y+vy/length*travel));
 const wantedX=e.x,wantedY=e.y;resolveEnemyCover(e,oldX,oldY);
 if(Math.hypot(wantedX-e.x,wantedY-e.y)>.01){e.strafeDir*=-1;e.strafeLeft=1.4;}
}
// Keep t.x/t.y coordinate expressions compatible with the default hex engine transform.
function builderTileCenter(t){return {x:325+t.x*TILE,y:300+t.y*TILE};}
function builderTileAvailable(t){return !!t&&tiles.includes(t)&&!terrainHidden(t)&&!t.medical&&!t.shieldTile&&!t.cashTile&&!t.shockTile&&!t.coverTile&&!t.trap&&!t.saw&&!t.flywheel;}
function updateBuilder(e,dt){
 e.warn=false;if(dt<=0||e.hp<=0)return;
 if(e.buildTarget&&!builderTileAvailable(e.buildTarget)){e.buildTarget=null;e.buildProgress=0;}
 if(e.buildCooldown>0){e.buildCooldown=Math.max(0,e.buildCooldown-dt);return;}
 if(!e.buildTarget){
  const reserved=new Set(enemies.filter(o=>o!==e&&o.hp>0&&o.type==='builder').map(o=>o.buildTarget));
  let distance=Infinity;
  for(const t of tiles){if(!builderTileAvailable(t)||reserved.has(t))continue;const at=builderTileCenter(t),d=Math.hypot(at.x-p.x,at.y-p.y);if(d<distance){distance=d;e.buildTarget=t;}}
  e.buildProgress=0;
 }
 if(!e.buildTarget)return;
 const at=builderTileCenter(e.buildTarget),dx=at.x-e.x,dy=at.y-e.y,d=Math.hypot(dx,dy),standOff=ADDED_ENEMIES.builder.workRange;
 // Self-propelled flight crosses the platform edge and hovers beside the locked work cell.
 if(d>standOff+.01){const travel=Math.min(d-standOff,ADDED_ENEMIES.builder.speed*drinkMonsterSpeed()*dt);e.x+=dx/d*travel;e.y+=dy/d*travel;return;}
 e.warn=true;e.buildProgress=(e.buildProgress||0)+dt;
 if(e.buildProgress+1e-9>=ADDED_ENEMIES.builder.buildTime){
  e.buildTarget.trap={clock:0};burst(at.x,at.y,'#ff4545',12);beep(160,.18,'sawtooth',.025);
  e.buildTarget=null;e.buildProgress=0;e.buildCooldown=ADDED_ENEMIES.builder.cooldown;e.warn=false;
 }
}
function drawBuilderGeometry(){
 const r=renderer;
 r.box(0,33,0,32,23,29,'#65534b');r.box(0,47,-2,36,7,32,'#ccab72');r.box(0,20,0,26,6,24,'#253744');
 r.box(0,37,16,26,9,5,'#202d36');r.emissiveBox(0,38,19,19,3,2,'#ff3c40');
 for(const side of [-1,1]){
  r.box(side*24,32,-3,13,23,30,'#425568');r.box(side*24,46,-3,16,5,32,'#9dacb6');
  r.emissiveBox(side*24,19,-3,9,3,21,'#338dff');r.box(side*32,35,-3,3,13,21,'#d6a64f');
  r.box(side*12,28,16,6,10,18,'#b8a379');r.box(side*12,23,25,9,6,7,'#314552');
 }
 r.box(0,27,20,12,11,14,'#b9aa90');r.box(0,25,29,14,9,5,'#263842');r.emissiveBox(0,25,32,7,5,2,'#ff292f');
 for(const xx of [-10,0,10])r.box(xx,52,-2,5,3,20,'#e9bb65');
}
function drawBuilderWork(e,pose){
 const r=renderer;
 for(const side of [-1,1])r.glow(pose[3]+pose[0]*side*24-pose[2]*3,pose[7]+18,pose[11]+pose[8]*side*24-pose[10]*3,9,'#338dff');
 if(e.hp<=0||e.terrainStun>0||!e.warn||!builderTileAvailable(e.buildTarget))return;
 const t=e.buildTarget,at=builderTileCenter(t),x=at.x-325,z=(at.y-300)*1.06;
 const muzzle=[pose[3]+pose[2]*33,pose[7]+25,pose[11]+pose[10]*33],end=[x,5,z];
 monsterStrut(muzzle,end,2.3,'#ff293b');monsterStrut(muzzle,end,.7,'#ffbbc0');r.glow(x,6,z,15+Math.sin(time*17)*3,'#ff2438');
 const progress=Math.min(1,(e.buildProgress||0)/ADDED_ENEMIES.builder.buildTime);
 r.residentMesh('builder:work-ring',()=>{const start=r.count;r.ring(0,0,0,22,'#ff3b45',2);r.markEmissive(start);},monsterPose(x,4,z));
 // A world-space progress bar makes the long conversion interrupt window readable.
 monsterBox(x,9,z+25,38,4,3,'#392d35');if(progress>0)monsterBox(x-19+19*progress,9,z+25,38*progress,4,3,'#ff5157');
 for(let i=0;i<3;i++){const a=time*9+i*TAU/3;r.glow(x+Math.cos(a)*8,7+(time*12+i*5)%14,z+Math.sin(a)*8,2,'#ff8c62');}
}
function updateLaser(e,dt){if(!e.laserMode){e.laserMode='idle';e.laserTimer=1.8}e.laserTimer-=dt;if(e.laserTimer<=0){if(e.laserMode==='idle'){e.laserMode='warning';e.laserTimer=.9;e.aim=Math.atan2(p.y-e.y,p.x-e.x);beep(560,.1,'sine',.015)}else if(e.laserMode==='warning'){e.laserMode='firing';e.coverLaserHit=false;e.laserTimer=.4;beep(240,.32,'sawtooth',.03)}else{e.laserMode='idle';e.laserTimer=2.1}}e.warn=e.laserMode==='warning';if(e.laserMode==='firing'&&!e.coverLaserHit){const hit=firstCoverHit(e.x,e.y,e.x+Math.cos(e.aim)*2000,e.y+Math.sin(e.aim)*2000,5);if(hit){damageCover(hit.tile,1,e);e.coverLaserHit=true;}}if(e.laserMode==='firing'&&beamHits(e))hurt(skatePhaseSource(e,e.laserMode))}
const TRAP_CYCLE=1.6,TRAP_WARN=.45,TRAP_ACTIVE=1;
function trapPhase(t){const c=t.trap.clock%TRAP_CYCLE;return c<TRAP_WARN?'safe':c<TRAP_ACTIVE?'warning':'active'}
const SAW_ORBIT_RADIUS=TILE,SAW_ORBIT_PERIOD=2.8;
function sawPosition(t){const a=(t.sawClock||0)*TAU/SAW_ORBIT_PERIOD;return {x:325+t.x*TILE+(t.orbitSaw?Math.cos(a)*SAW_ORBIT_RADIUS:0),y:300+t.y*TILE+(t.orbitSaw?Math.sin(a)*SAW_ORBIT_RADIUS:0)}}
function updateTerrain(dt){for(const t of tiles)if(t.flywheel){moveFlywheel(t.flywheel,dt);if(Math.hypot(p.x-t.flywheel.x,p.y-t.flywheel.y)<FLYWHEEL_RADIUS+drinkPlayerRadius())hurt(t.flywheel)}for(const t of tiles)if(t.saw&&(!t.orbitSaw||ORBIT_SAW_ENABLED)){t.sawClock=(t.sawClock||0)+dt;const at=sawPosition(t);if(Math.hypot(p.x-at.x,p.y-at.y)<(t.orbitSaw?30:25)+drinkPlayerRadius()-4)hurt(t)}for(const t of tiles)if(t.trap){t.trap.clock+=dt;if(trapPhase(t)==='active'&&Math.abs(p.x-325-t.x*TILE)<TILE/2-4+drinkPlayerRadius()-4&&Math.abs(p.y-300-t.y*TILE)<TILE/2-4+drinkPlayerRadius()-4)hurt(skatePhaseSource(t.trap,trapPhase(t)))}for(const t of turrets){if(t.kind==='laser'){if(t.laserMode==='idle')slideTurret(t,dt);updateLaser(t,dt);continue}slideTurret(t,dt);t.cool-=dt;t.warn=t.cool<=.75&&t.rounds===0;if(t.cool<=0&&t.rounds===0){t.aim=Math.atan2(p.y-t.y,p.x-t.x);t.rounds=1;t.gap=0;t.cool=3.2}if(t.rounds>0){t.gap-=dt;if(t.gap<=0){bullet(t.x,t.y,t.aim,230,'#ffad69',3.5,4.2);t.rounds--;t.gap=.13;beep(120,.04,'square',.015)}}}}
function rewardOptions(){const available=tiles.filter(t=>!t.medical&&!t.shieldTile&&!t.cashTile&&!t.shockTile&&!t.coverTile&&!t.trap&&!t.saw&&!t.flywheel).length>=2;const pool=[...upgrades,...((tiles.some(t=>t.trap||t.saw||t.flywheel)||turrets.length)?[{name:'拆除危险源',desc:'移除一个陷阱或炮台。',key:'erase',amount:1}]:[])],normal=pool[Math.floor(Math.random()*pool.length)];const negativeRoll=Math.random();const strong={...normal,amount:['multi','maxhp','erase'].includes(normal.key)?1:normal.amount*1.5,name:normal.name+' · 强化',desc:normal.key==='multi'?normal.desc:normal.key==='heal'?'回复 3 格生命':normal.desc.replace(/\d+%/,Math.round(normal.amount*150)+'%'),penalty:negativeRoll<.17?'saw':negativeRoll<.2?'orbitSaw':negativeRoll<.42?'flywheel':turrets.length<4?(Math.random()<.5?'turret':'laserTurret'):'trap'};if(strong.key==='erase'){delete strong.penalty;strong.name=normal.name}return [tiles.length<gridCapacity()?{name:'扩建地板 +6',desc:'扩建 6 格，随机地形。',key:'floor',amount:6}:normal,available&&Math.random()<.005?(floor%2?{name:'护盾地板',desc:'24 秒产出 1 格护盾，永久叠加。',key:'shield',amount:1,penalty:'trap'}:{name:'医疗地板',desc:'每 15 秒产出一个医疗包。',key:'medical',amount:1,penalty:'trap'}):pool.filter(u=>u.key!==normal.key)[Math.floor(Math.random()*(pool.length-1))],strong]}
function applyReward(u){
 if(u.key==='drink'){consumeDrink(u.drinkId);return;}if(EQUIPMENT_LABELS[u.key]){equipItem(u.key,itemEquipment(u));return;}if(['multi','rate','damage'].includes(u.key))return;
 const terrain=['floor','erase','medical','shield','cashTile','shockTile','coverTile'].includes(u.key);
 if(state==='upgrade'&&(terrain||u.penalty)){
  if(u.key==='erase'){u={...u,amount:Math.min(u.amount,Math.max(0,permanentTrapCount()-shopErasePending))};shopErasePending+=u.amount;}
  shopTerrainPlan=planTerrainChange(()=>applyTerrainReward(u),shopTerrainPlan);
 }else if(terrain||u.penalty)applyTerrainReward(u);
 if(u.key==='maxhp'){p.max+=u.amount;p.hp=Math.min(p.max,p.hp+u.amount);}else if(u.key==='heal')p.hp=Math.min(p.max,p.hp+u.amount);else if(!terrain)mods[u.key]+=u.amount;
 picked[u.name]=(picked[u.name]||0)+1;
}
function penaltyText(u){return ({turret:'- 地图边界增加一座无敌的敌方炮塔。',laserTurret:'- 地图边界增加一座无敌的敌方炮塔。',saw:'- 地形里增加会伤害你的固定电锯。',orbitSaw:'- 地形里增加会伤害你的环绕电锯。',flywheel:'- 地形里增加会伤害你的轴向飞轮。',trap:'- 地形里增加踩中会伤害你的地刺。'})[u.penalty]||''}
const SHOP_UPGRADE_COSTS=[40,60,100,150];
const SHOP_PRICE_MULTIPLIERS=[1,1.4,2,2.8,4];
const SHOP_REROLL_BASES=[5,8,12,18,26],SHOP_REROLL_STEPS=[3,5,7,10,14];
const EQUIPMENT_PRICES={weapon:[12,5],armor:[10,4],shoes:[8,3],drone:[16,6],shovel:[8,3]};
const SUPPLY_PRICES={floor:8,speed:8,heal:4,maxhp:12,erase:8,medical:14,shield:14,cashTile:18,shockTile:18,coverTile:14};
function shopDepthMarkup(){return Math.min(3,Math.floor(Math.max(0,floor-1)/4))}
function shopPrice(u){if(u.key==='terrainPassive')return terrainDef(u.terrainId).price*4+shopDepthMarkup();const depth=shopDepthMarkup(),multiplier=SHOP_PRICE_MULTIPLIERS[shopLevel-1];if(u.key==='drink')return Math.ceil((drinkDefinition(u.drinkId)?.price||18)*multiplier)+depth;if(EQUIPMENT_LABELS[u.key]){const [base,qualityStep]=EQUIPMENT_PRICES[u.key];return Math.ceil((base+(itemEquipment(u).tier-1)*qualityStep)*multiplier)+depth}const base=SUPPLY_PRICES[u.key]||8;return Math.ceil((base*multiplier+depth)*(u.penalty?.75:1))}
function shopUsable(u){if(u.key==='terrainPassive')return terrainDefUsable(terrainDef(u.terrainId));if(u.key==='drink')return drinkUsable(u.drinkId);const plannedTiles=shopTerrainPlan?.tiles||tiles;if(u.key==='floor')return plannedTiles.length<gridCapacity();if(['medical','shield','cashTile','shockTile','coverTile'].includes(u.key))return plannedTiles.some(t=>!t.medical&&!t.shieldTile&&!t.cashTile&&!t.shockTile&&!t.coverTile&&!t.trap&&!t.saw&&!t.flywheel);if(u.key==='heal')return p.hp<p.max;if(u.key==='erase')return permanentTrapCount()>shopErasePending;return true}
function levelShopItem(item){if(item.key==='drink')return {...item};if(EQUIPMENT_LABELS[item.key])return {...item};const u={...item},power=1+(shopLevel-1)*.5;u.amount=['multi','maxhp','erase','medical','shield','cashTile','shockTile','coverTile'].includes(u.key)?Math.max(1,Math.floor(u.amount*power)):u.key==='floor'||u.key==='heal'?Math.round(u.amount*power):Math.round(u.amount*power*1000)/1000;
if(u.key==='floor'){u.name='扩建地板 +'+u.amount;u.desc='扩建 '+u.amount+' 格，随机地形。'}
else if(['rate','damage','speed'].includes(u.key))u.desc=({rate:'射速',damage:'伤害',speed:'移速'}[u.key])+' +'+Math.round(u.amount*100)+'%';
else if(u.key==='multi')u.desc='子弹 +'+u.amount;
else if(u.key==='maxhp'){u.name='生命核心 +'+u.amount;u.desc='生命上限 +'+u.amount+'，回复 '+u.amount+' 格';}
else if(u.key==='heal')u.desc='回复 '+u.amount+' 格生命';
else if(u.key==='erase')u.desc='移除 '+u.amount+' 个陷阱或炮台。';
else if(u.key==='coverTile')u.desc='新增 '+u.amount+' 个掩体；4点耐久，每关恢复。BOSS碰撞直接撞碎。';
else if(u.key==='shockTile')u.desc='新增 '+u.amount+' 个震荡格；踩入清除全屏敌弹，冷却35秒，离开后可再次踩入。';
else if(['medical','shield','cashTile'].includes(u.key)&&u.amount>1)u.desc='新增 '+u.amount+' 个'+({medical:'医疗',shield:'护盾',cashTile:'印钞',shockTile:'震荡'}[u.key])+'格。';
return u}
function shopUpgradeCost(){return shopLevel>=SHOP_MAX_LEVEL?0:SHOP_UPGRADE_COSTS[shopLevel-1]}
function upgradeShop(){const price=shopUpgradeCost();if(state!=='upgrade'||terrainView!=='equipment'||pendingEquipment||shopLevel>=SHOP_MAX_LEVEL||cash<price)return false;cash-=price;shopLevel++;rollShop();updateUI();renderShop(true);purchaseSound();return true}
function rollShop(){shopItems=Array.from({length:3},()=>{const roll=Math.random();return roll<.65?randomEquipmentShopItem():roll<.73?{...upgrades.find(u=>u.key==='heal')}:ordinaryTerrainItem();}).map(levelShopItem).map(u=>({...u,price:shopPrice(u),sold:false}))}
function shopRerollCost(){return SHOP_REROLL_BASES[shopLevel-1]+shopRefreshes*SHOP_REROLL_STEPS[shopLevel-1]}
function completeShopPurchase(index,u){if(state!=='upgrade'||shopItems[index]!==u||u.sold||cash<u.price||!shopUsable(u))return false;cash-=u.price;if(u.key==='terrainPassive')grantTerrainPassive(terrainDef(u.terrainId).name);else applyReward(u);u.sold=true;pendingEquipment=null;updateUI();renderShop();purchaseSound();return true}
function buyShopItem(index){
 if(state!=='upgrade'||terrainView!=='equipment'||pendingEquipment)return false;
 const u=shopItems[index];if(!u||u.key==='drink'||u.sold||cash<u.price||!shopUsable(u))return false;
 if(EQUIPMENT_LABELS[u.key]){cash-=u.price;u.sold=true;u.opened=true;pendingEquipment={index,item:u,paid:true};updateUI();purchaseSound();renderEquipmentComparison();return true;}
 if(u.key==='terrainPassive'){
  const d=terrainDef(u.terrainId),replaced=d.exclusive&&terrainHas(d.exclusive)?d.exclusive:'';
  if(!grantTerrainPassive(d.name))return false;
  cash-=u.price;u.sold=true;u.opened=true;pendingEquipment={index,item:u,paid:true,passive:true,replaced};updateUI();purchaseSound();renderPassiveReveal();return true;
 }
 return completeShopPurchase(index,u);
}
function cancelEquipmentPurchase(){if(!pendingEquipment)return false;if(!pendingEquipment.passive)pendingEquipment.item.discarded=true;pendingEquipment=null;renderShop();return true;}
function confirmEquipmentPurchase(){
 if(!pendingEquipment||state!=='upgrade'||terrainView!=='equipment')return false;
 const {index,item,paid,passive}=pendingEquipment;if(!paid||shopItems[index]!==item||!item.sold||item.discarded||item.equipped)return false;
 if(!passive){equipItem(item.key,itemEquipment(item));item.equipped=true;}
 pendingEquipment=null;updateUI();renderShop();return true;
}
function renderPassiveReveal(){const {item:u,replaced}=pendingEquipment,d=terrainDef(u.terrainId);showOverlay(`<div class="shop-panel weapon-compare"><div class="tag">UPGRADE REVEAL</div><h2>${d.name}</h2><p>${d.desc}</p>${replaced?`<p>已替换：${replaced}</p>`:''}<div class="shop-controls"><button id="equipment-confirm" class="primary">返回商店</button></div><small>已获得 · 已支付 $${u.price}</small></div>`);$('overlay').classList.add('shop');$('viewport').classList.add('shopping');$('equipment-confirm').onclick=confirmEquipmentPurchase;}

function equipmentStatRows(key,item=null){
 if(key==='drone'&&item?.companion)return [...(item.damage?[['攻击力',e=>e.damage,'']]:[]),['冷却',e=>e.interval,' 秒'],...(item.vulnerability?[['易伤',e=>e.vulnerability*100,'%'],['持续',e=>e.duration,' 秒']]:[]),...(item.blockInterval?[['拦截',e=>e.blockInterval,' 秒']]:[])];
 if(key==='shovel')return [['攻速',e=>e?1/e.interval:0,' 次/秒'],['每铲进度',e=>e?.power||0,''],['工作半径',e=>e?.radius||0,' 格']];
 if(key==='armor')return [['生命上限加成',e=>e?.maxHp||0,' 格'],['护盾上限加成',e=>e?.shieldBonus||0,' 格']];
 if(key==='shoes')return [['移速加成',e=>(e?.speedBonus||0)*100,'%']];
 return [['攻击力',e=>e?.damage||0,''],['攻速',e=>e?(attackSpeedMultiplier()+(key==='weapon'?terrainRun.attack+(terrainRun.combat>0?.3:0):0))/e.interval:0,' 次/秒'],...(item?.id==='sword'&&!item.zenith?[['挥砍伤害',e=>e?.meleeDamage||0,'']]:[]),...(item?.critChance>0?[['暴击率',e=>(e?.critChance||0)*100,'%'],['暴击伤害',e=>(e?.critMultiplier||2)*100,'%']]:[])];
}
function equipmentName(e){return e?e.name+' · '+(e.itemId?'T'+e.tier+(e.growth?' · 进化'+(e.growth.stage+1)+'/3':''):WEAPON_GRADES[e.tier].name):'未装备'}
function equipmentNumber(value){return Number(value.toFixed(2))}
function equipmentSpecialEffects(key,e,metadata=true){
 const n=equipmentNumber,percent=v=>n(v*100)+'%',lines=[];
 if(key==='armor'){
  if(e.invBonus)lines.push(`受击后无敌时间+${n(e.invBonus)}秒`);
  if(e.speedBonus)lines.push(`移速+${percent(e.speedBonus)}`);
  if(e.speedPenalty)lines.push(`移速-${percent(e.speedPenalty)}`);
  if(e.critChanceBonus)lines.push(`暴击率+${percent(e.critChanceBonus)}`);
  if(e.critDamageBonus)lines.push(`暴击伤害+${percent(e.critDamageBonus)}`);
  if(e.shieldInterval)lines.push(`战斗中每${n(e.shieldInterval)}秒回复1格护盾`);
  if(e.pickupRadiusBonus)lines.push(`拾取半径+${n(e.pickupRadiusBonus/TILE)}格`);
  if(e.cashHeal)lines.push(`拾钞回血${n(e.cashHeal)}格，冷却${n(e.cashHealCooldown)}秒`);
  if(e.cashProductionMultiplier)lines.push(`周围${n(e.cashProductionRadius)}格印钞速度×${n(e.cashProductionMultiplier)}`,`金钱获得×${n(e.cashMultiplier)}`);
  if(e.healthDamageMultiplier)lines.push(`生命受伤×${n(e.healthDamageMultiplier)}`);
  if(e.clearNegativePerFloor)lines.push('每层清理一个危险机关。');
  if(e.medicalHeal)lines.push(`医疗包回复${n(e.medicalHeal)}格生命`,`战斗中每${n(e.regenInterval)}秒回复${n(e.regenHeal)}格生命`);
  if(e.critHealChance)lines.push(`暴击命中${percent(e.critHealChance)}概率回复${n(e.critHealAmount)}格生命`);
  if(e.featherSpeedPerStack)lines.push(`无伤通关攻速+${percent(e.featherSpeedPerStack)}，最多${e.featherStackMax}层`,`当前${p?.featherStacks||0}层，攻速+${percent(featherSpeedBonus(e))}`);
  if(e.timeStop)lines.push('静止时时间流速8%');
  if(e.auraDamage)lines.push(`每${n(e.auraInterval)}秒对周围${n(e.auraRadius)}格敌人造成${n(e.auraDamage)}伤害`);
 }else if(key==='shoes'){
  if(e.attackSpeedBonus)lines.push(`攻速 +${percent(e.attackSpeedBonus)}`);
  if(e.critChanceBonus)lines.push(`暴击率 +${percent(e.critChanceBonus)}`);
  if(e.stillCritBonus)lines.push(`站定${n(e.stillCritDelay)}秒：暴击率 +${percent(e.stillCritBonus)}`);
  if(e.explosionRadiusMultiplier)lines.push(`爆炸半径 ×${n(e.explosionRadiusMultiplier)}`);
  if(e.crowdCritPerEnemy)lines.push(`${n(e.crowdCritRadius/TILE)}格内每个敌人：暴击率 +${percent(e.crowdCritPerEnemy)}，最多${e.crowdCritMax}层`);
  if(e.vinylAttackBonus)lines.push(`切割命中：攻速 +${percent(e.vinylAttackBonus)}，持续${n(e.vinylAttackDuration)}秒，可刷新`);
  if(e.planeVulnerablePerStack)lines.push(`命中易伤 +${percent(e.planeVulnerablePerStack)}/层，上限${e.planeVulnerableMax}层，${n(e.planeVulnerableDuration)}秒，可刷新`);
  if(e.bulletSlowRadius)lines.push(`${n(e.bulletSlowRadius/TILE)}格内敌弹减速 ${percent(1-e.bulletSlowFactor)}`);
  if(e.id==='tentacle')lines.push('无属性加成');
  if(e.id==='smallplane')lines.push(`前方散射：伤害${n(e.planeDamage)}，间隔${n(e.planeInterval)}秒`);
  if(e.id==='neonsword')lines.push(`3把飞剑轮流刺击：伤害${n(e.damage)}，间隔${n(e.interval)}秒，范围${n(e.stabRange/TILE)}格`);
  if(e.id==='ufo')lines.push(`自动激光：伤害${n(e.ufoLaserDamage)}，间隔${n(e.ufoLaserInterval)}秒，穿透${e.ufoLaserPierce}个目标`);
  if(e.id==='vinyl')lines.push(`近身切割＋击退：伤害${n(e.vinylDamage)}，间隔${n(e.vinylInterval)}秒，范围${n(e.vinylRadius/TILE)}格`);
  if(e.id==='spider')lines.push(`自动机枪：${e.spiderTurretBurst}连发，伤害${n(e.spiderTurretDamage)}/发，周期${n(e.spiderTurretCycle)}秒`);
  if(e.id==='skateboard'){
   lines.push('持续滑行；转弯减速；边缘反弹');
   lines.push(`特技：攻速 +${percent(e.grazePerStack)}/层，上限${e.grazeMax}层，${n(e.grazeDuration)}秒，可刷新；受击清空`);
   lines.push(`靠近危险自动特技；激光/地面攻击命中触发；无敌${n(e.skateTrickInvDuration)}秒，冷却${n(e.skateTrickCooldown)}秒`);
  }
  if(e.invBonus)lines.push(`受击后无敌时间+${n(e.invBonus)}秒`);
  if(e.productionBonus)lines.push(`${n(e.productionRadius)}格内补给生产 +${percent(e.productionBonus)}`);
  if(e.pickupRadius)lines.push(`补给吸附半径${n(e.pickupRadius/TILE)}格`);
 }else {
  if(e.desc)lines.push(e.desc);if(metadata&&e.itemId)lines.push(WEAPON_FAMILY_NAMES[e.familyId]+'系列');if(e.growth)lines.push(`当前进化${e.growth.stage+1}/3，${e.growth.kind==='kills'?'击杀':'无伤秒数'} ${equipmentNumber(e.growth.value)}`);
  if(key==='weapon'&&e.speedPenalty)lines.push(`移速-${percent(e.speedPenalty)}`);
 }
 return metadata?lines:lines.map(text=>text.replaceAll('暴击率','暴击').replaceAll('暴击伤害','爆伤').replaceAll('自动回复','回复').replaceAll('伤害递减','逐跳减伤'));
}
function equipmentAttributeCard(key,e,label,compact=false){
 const rows=equipmentStatRows(key,e).filter(([,get])=>key==='armor'||get(e)!==0),effects=equipmentSpecialEffects(key,e,!compact);
 return `<div style="--rarity:${WEAPON_GRADES[e.tier].color}"><small>${label}</small>${shopItemIcon({key,equipment:e},'compare-'+label)}<b>${compact?e.name:equipmentName(e)}</b><dl class="equipment-attributes">${rows.map(([name,get,suffix])=>`<div><dt>${compact?equipmentShopStatLabel(name):name}</dt><dd>${equipmentNumber(get(e))}${suffix}</dd></div>`).join('')}</dl>${effects.length?`<section class="equipment-special-effects"><small>特殊效果</small>${effects.map(text=>`<p>${text}</p>`).join('')}</section>`:''}</div>`;
}
function renderEquipmentComparison(){const u=pendingEquipment.item,key=u.key,current=equipmentInSlot(key),next=itemEquipment(u);showOverlay(`<div class="shop-panel weapon-compare"><div class="tag">EQUIPMENT EXCHANGE</div><h2>${current?'替换':'获得'}${EQUIPMENT_LABELS[key]}</h2><div class="weapon-compare-head ${current?'':'single-equipment'}">${current?equipmentAttributeCard(key,current,'当前装备',true):''}${equipmentAttributeCard(key,next,'新装备',true)}</div>${key==='armor'?'<p class="weapon-replace-note">换装不补充生命或护盾；降低上限会失去超出的生命或护盾。</p>':''}<div class="shop-controls"><button id="equipment-cancel">放弃装备</button><button id="equipment-confirm" class="primary">${current?'替换装备':'装备'}</button></div><small>已支付 $${u.price} · 放弃不退款</small></div>`);$('overlay').classList.add('shop');$('viewport').classList.add('shopping');$('equipment-cancel').onclick=cancelEquipmentPurchase;$('equipment-confirm').onclick=confirmEquipmentPurchase}

function rerollShop(){const price=shopRerollCost();if(state!=='upgrade'||terrainView!=='equipment'||pendingEquipment||cash<price)return false;cash-=price;shopRefreshes++;rollShop();updateUI();renderShop();beep(420,.07,'triangle',.035);return true}
function leaveShop(){if(state!=='upgrade'||pendingEquipment)return;if(terrainView==='bar'){terrainView='equipment';renderShop();return}floor++;enemies=[];beginDescent();$('overlay').classList.remove('shop');$('viewport').classList.remove('shopping');$('overlay').style.display='none';toast('继续下降 / B'+String(floor).padStart(2,'0'),2);updateUI();beep(240,.18)}
// Cosmetic PRNG is separate from gameplay rolls; move stars only at their invisible loop boundary.
function initShopSparkles(){let seed=(performance.now()*1000)>>>0;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};document.querySelectorAll('.shop-quality [data-tier="5"]:not(:disabled) .shop-item-fx>i').forEach(spark=>{const move=()=>{spark.style.left=(8+random()*80).toFixed(2)+'%';spark.style.top=(10+random()*76).toFixed(2)+'%'};move();spark.style.setProperty('--spark-speed',(.85+random()*.3).toFixed(3));spark.addEventListener('animationiteration',e=>{if(e.animationName==='shop-quality-twinkle')move()})})}
const SHOP_EQUIPMENT_ICON_CATEGORIES=['轻武器','重武器','冷兵器','爆破武器','建筑工服饰','游侠服饰','便装','轻便护甲','重型防弹衣','绚丽服装','装甲坐骑','迅捷坐骑','火力坐骑','辅助坐骑','攻击型无人机','守卫型无人机','辅助型无人机','挖掘工具'];
const SHOP_EQUIPMENT_ICON_ASSETS=['assets/shop-equipment/light-weapon.png','assets/shop-equipment/heavy-weapon.png','assets/shop-equipment/melee-weapon.png','assets/shop-equipment/explosive-weapon.png','assets/shop-equipment/builder-outfit.png','assets/shop-equipment/ranger-outfit.png','assets/shop-equipment/casual-outfit.png','assets/shop-equipment/light-armor.png','assets/shop-equipment/heavy-armor.png','assets/shop-equipment/flamboyant-outfit.png','assets/shop-equipment/armored-mount.png','assets/shop-equipment/swift-mount.png','assets/shop-equipment/combat-mount.png','assets/shop-equipment/support-mount.png','assets/shop-equipment/attack-drone.png','assets/shop-equipment/guard-drone.png','assets/shop-equipment/support-drone.png','assets/shop-equipment/digging-tool.png'];
const SHOP_SUPPLY_ICON_KEYS=['medical','shield','cashTile','shockTile','coverTile','medicalBonus','shieldBonus','cashTileBonus','shockTileBonus','coverTileBonus','floor','erase','heal','maxhp','speed','drink'];
function shopIconDescriptor(u){
 const equipment=itemEquipment(u);
 if(equipment){const categories=equipmentShopCategories(u.key,equipment),category=categories.includes(u.category)?u.category:categories[0];return {kind:category,index:SHOP_EQUIPMENT_ICON_CATEGORIES.indexOf(category),equipment:true,tier:equipment.tier,tint:equipment.tier===1?'#c8d8de':WEAPON_GRADES[equipment.tier].color};}
 const passive=u.key==='terrainPassive',key=passive?terrainItemKey(terrainDef(u.terrainId))+'Bonus':u.key;
 return {kind:key,index:SHOP_SUPPLY_ICON_KEYS.indexOf(key),equipment:false,tier:0,tint:passive?'#d4b2ef':u.key==='drink'?(drinkDefinition(u.drinkId)?.color||'#ddf477'):'#ddf477'};
}
function shopItemIcon(u,index=0){
 const descriptor=shopIconDescriptor(u);if(descriptor.index<0)return '';
 const {kind,tier,tint}=descriptor,columns=descriptor.equipment?6:4,rows=descriptor.equipment?3:4;
 const width=descriptor.equipment?256:1254,height=descriptor.equipment?256:1254,cellWidth=width/columns,cellHeight=height/rows;
 const bounds=descriptor.equipment?'0 0 256 256':`${descriptor.index%columns*cellWidth} ${Math.floor(descriptor.index/columns)*cellHeight} ${cellWidth} ${cellHeight}`;
 const source=descriptor.equipment?SHOP_EQUIPMENT_ICON_ASSETS[descriptor.index]:'assets/shop-supplies.png',id='shop-icon-'+index;
 const [bx,by,bw,bh]=bounds.split(' ').map(Number),rgb=tint.slice(1).match(/../g).map(n=>parseInt(n,16));
 // Raise saturation at the existing rarity hue; intensity scales RGB without mixing white.
 const lo=Math.min(...rgb),range=Math.max(...rgb)-lo,emission=tier===1?[218,236,244]:rgb.map(n=>255*(.06+.94*(n-lo)/Math.max(1,range)));
 const shade=(intensity)=>'#'+emission.map(n=>Math.round(n*intensity).toString(16).padStart(2,'0')).join('');
 return `<span class="shop-equipment-icon" aria-hidden="true" data-icon="${kind}" style="--rarity:${tint};--icon-emission:${shade(1)}"><svg viewBox="${bounds}" focusable="false"><defs><mask id="${id}-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}" style="mask-type:alpha"><image href="${source}" width="${width}" height="${height}"/></mask><linearGradient id="${id}-tone" gradientUnits="userSpaceOnUse" x1="${bx}" y1="${by}" x2="${bx+bw*.18}" y2="${by+bh}"><stop offset="0" stop-color="${shade(1)}"/><stop offset=".45" stop-color="${shade(1)}"/><stop offset=".72" stop-color="${shade(.96)}"/><stop offset="1" stop-color="${shade(.76)}"/></linearGradient><pattern id="${id}-scan" patternUnits="userSpaceOnUse" width="${bw}" height="${bh/24}"><rect width="${bw}" height="${bh/100}" fill="#06191e" opacity=".09"/></pattern><filter id="${id}-glow" x="-40%" y="-40%" width="180%" height="180%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${bh*.035}" result="bloom"/><feGaussianBlur in="SourceGraphic" stdDeviation="${bh*.075}" result="halo"/><feMerge><feMergeNode in="halo"/><feMergeNode in="bloom"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g filter="url(#${id}-glow)"><g mask="url(#${id}-mask)"><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="url(#${id}-tone)"/><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="url(#${id}-scan)"/></g></g></svg></span>`;
}
function renderShop(promoted=false){if(terrainView==='bar')return renderBar();const expand=shopExpansion();showOverlay(`<div class="shop-panel shop-quality ${promoted?'shop-promoted':''}" data-shop-level="${shopLevel}" style="--shop-fx-strength:${.48+shopLevel*.1};--shop-fx-cycle:${6-shopLevel*.45}s"><div class="tag">ELEVATOR EXCHANGE</div><div class="shop-heading"><h2>普通商店 Lv.${shopLevel}</h2><b class="shop-wallet">$${cash}</b></div><div class="shop-upgrade"><span>${shopLevel>=SHOP_MAX_LEVEL?'商店已满级':'更高品质装备 · 补给与扩容提升'}</span><button id="shop-upgrade" ${shopLevel>=SHOP_MAX_LEVEL||cash<shopUpgradeCost()?'disabled':''}>${shopLevel>=SHOP_MAX_LEVEL?'MAX':'升级 · $'+shopUpgradeCost()}</button></div><button class="choice terrain-expand" id="shop-expand" ${expand.amount<=0||cash<expand.price?'disabled':''}>${shopItemIcon(expand,'expand')}<b>扩容 +${expand.amount}格</b><span>${expand.amount?'随机发现地形':'地板已满'}</span><strong>$${expand.price}</strong></button><div class="shop-grid">${shopItems.map((u,i)=>{const e=itemEquipment(u),tier=e?.tier||0;return `<button data-tier="${tier}" style="${e?'--rarity:'+WEAPON_GRADES[e.tier].color:u.key==='drink'?'--drink-color:'+drinkDefinition(u.drinkId).color:''}" class="choice shop-buy ${e?'weapon-card':''} ${u.key==='terrainPassive'?'terrain-rare':''} ${u.key==='drink'?'drink-card':''} ${u.sold?'sold':''}" data-kind="${u.key}" data-category="${EQUIPMENT_LABELS[u.key]||(u.key==='terrainPassive'?'地块强化':u.key==='drink'?'特调':'补给')}" data-i="${i}" ${u.sold||cash<u.price||!shopUsable(u)?'disabled':''}>${tier>=2?'<span class="shop-item-fx" aria-hidden="true"><i></i><i></i><i></i><i></i>'+(tier===5?'<em class="shop-glitter"><s></s><s></s><s></s></em>':'')+'</span>':''}<b>${shopItemName(u)}</b>${shopItemIcon(u,i)}<span class="shop-item-description">${shopItemDescription(u)}</span><strong class="shop-price">${u.sold?(u.discarded?'已放弃':'已购买'):!shopUsable(u)?'暂不可用':'$'+u.price}</strong></button>`}).join('')}</div><div class="shop-controls"><button id="shop-reroll" ${cash<shopRerollCost()?'disabled':''}>刷新商品 · $${shopRerollCost()}</button><button id="shop-leave" class="primary">结束</button></div><small>购买即揭晓 · 装备放弃不退款 · 每次刷新涨价 $${SHOP_REROLL_STEPS[shopLevel-1]}</small><details class="terrain-owned"><summary>已拥有地块被动（${terrainPassives.size}）</summary>${[...terrainPassives].map(name=>`<p><b>${name}</b> ${terrainDef(name).desc}</p>`).join('')||'<p>暂无地块被动</p>'}</details></div>`);$('overlay').classList.add('shop');$('viewport').classList.add('shopping');document.querySelectorAll('.shop-buy').forEach(b=>b.onclick=()=>buyShopItem(+b.dataset.i));$('shop-expand').onclick=buyShopExpansion;$('shop-upgrade').onclick=upgradeShop;$('shop-reroll').onclick=rerollShop;$('shop-leave').onclick=leaveShop;initShopSparkles()}

function beginStageClear(wait=1,bonusEvents=[]){
 enemyTransports=[];
 if(!['combat','survival'].includes(state))return;
 if(drinkZones.some(z=>z.kind==='corpse'&&z.age<z.life))return;
 const events=[];
 if(armor?.clearNegativePerFloor){const count=Math.min(armor.clearNegativePerFloor,Math.max(0,permanentTrapCount()-shopErasePending));for(let i=0;i<count;i++)events.push(settlementTerrainEvent());}
 if(armor?.id==='plume'&&p.featherEligible&&!p.floorHit&&(p.featherStacks||0)<armor.featherStackMax)events.push(()=>{p.featherStacks=(p.featherStacks||0)+1;return '无伤通关 · 攻速 +10%';});
 events.push(...bonusEvents,...drinkSettlementEvents());finishDrinkRoom();
 globalThis.TalentRuntime?.sweep();
 state='stageClear';cleared=true;if(weapon.fireVisuals)weapon.fireVisuals.length=0;p.weaponRecoilVX=0;p.weaponRecoilVY=0;p.weaponRecoilAt=-Infinity;clearSkateReward();updateUI();
 events.sort((a,b)=>Number(!!a.terrain)-Number(!!b.terrain));wait=0;
 stageSettlement={events,index:0,elapsed:0,wait,text:'',terrainDelay:0,pendingText:'',popup:null};stageClearLeft=(events.length?0:STAGE_CLEAR_BANNER_TIME)+wait+events.length*SETTLEMENT_EVENT_TIME+events.filter(e=>e.terrain).length*TERRAIN_FLASH_TIME;
 releaseJoy();missiles=[];blasts=[];bullets=[];shots=[];hazards=[];clearTimeout(toast.timer);$('toast').classList.remove('show');$('toast').classList.add('settlement');$('survival-clock').style.display='none';$('stage-clear').style.display='none';$('status').textContent='本层已清空';$('wave').textContent='等待结算';syncMusic();updateStageClear(0);
}
function clearStageSettlement(){cashPopups=cashPopups.filter(q=>!q.settlement);stageSettlement=null;$('toast').classList.remove('settlement');$('toast').classList.remove('show');}
function updateStageClear(dt){
 const s=stageSettlement;if(!s||paused)return;s.elapsed+=Math.max(0,dt);
 // Use the game clock so pause freezes both the popup and its matching effect.
 while(s.index<s.events.length){
  const event=s.events[s.index],at=s.wait+s.index*SETTLEMENT_EVENT_TIME+s.terrainDelay;if(s.elapsed+1e-9<at)break;
  if(event.terrain){if(!terrainChange)s.pendingText=event();terrainChange.age=Math.max(0,s.elapsed-at);if(terrainChange.age+1e-9<TERRAIN_FLASH_TIME)break;finishTerrainChange();s.terrainDelay+=TERRAIN_FLASH_TIME;s.text=s.pendingText;s.pendingText='';}else s.text=event();
  s.index++;updateUI();$('toast').textContent=s.text;
  if(s.text){
   cashPopups=cashPopups.filter(q=>!q.settlement);
   s.popup={text:s.text,settlement:true,followPlayer:true,height:70,age:0,life:SETTLEMENT_EVENT_TIME};cashPopups.push(s.popup);
   // Backdate when one large frame crosses an event and the whole display period.
   s.popup.age=Math.max(0,s.elapsed-at-(event.terrain?TERRAIN_FLASH_TIME:0));
  }
 }
 const bannerAt=s.wait+s.events.length*SETTLEMENT_EVENT_TIME+s.events.filter(e=>e.terrain).length*TERRAIN_FLASH_TIME,banner=s.elapsed+1e-9>=bannerAt;
 $('toast').classList.remove('show');$('stage-clear').style.display=banner&&!s.popup?'flex':'none';
 $('status').textContent=banner?'本层结束':terrainChange?'清理危险机关':s.index?'关卡结算':'本层已清空';$('wave').textContent=banner?'准备进入商店':terrainChange?'目标闪烁后移除':s.index?'结算 '+s.index+' / '+s.events.length:'等待结算';
 stageClearLeft=Math.max(0,bannerAt+(s.events.length?0:STAGE_CLEAR_BANNER_TIME)-s.elapsed);if(stageClearLeft<=1e-9)reward();
}
function reward(){terrainShopSettlement();timedRoom=null;shockWaves=[];explosionFX=[];stageClearLeft=0;clearStageSettlement();$('stage-clear').style.display='none';releaseJoy();pendingEquipment=null;state='upgrade';missiles=[];blasts=[];bullets=[];shots=[];hazards=[];shopRefreshes=0;rollShop();renderShop()}
function ufoFieldActive(){return shoes?.id==='ufo'&&['combat','survival'].includes(state);}
function ufoBulletTravelTime(b,dt){
 if(!ufoFieldActive()||dt<=0)return dt;
 const ox=b.x-p.x,oy=b.y-p.y,v2=b.vx*b.vx+b.vy*b.vy;
 if(v2<=0)return dt;
 const dot=ox*b.vx+oy*b.vy,c=ox*ox+oy*oy-shoes.bulletSlowRadius**2,disc=dot*dot-v2*c;
 if(disc<=0)return dt;
 const root=Math.sqrt(disc),entry=Math.max(0,(-dot-root)/v2),exit=(-dot+root)/v2;
 if(exit<=0||entry>=dt)return dt;
 // Integrate entry, slowed travel and exit without permanently changing velocity.
 const inside=Math.min(dt-entry,(exit-entry)/shoes.bulletSlowFactor);
 return entry+inside*shoes.bulletSlowFactor+Math.max(0,dt-entry-inside);
}
function drawUFOField(x,z){
 if(!ufoFieldActive())return;
 const r=renderer,rad=shoes.bulletSlowRadius,segments=72,pulse=.5+.5*Math.sin(time*2.4),pt=(a,radius,y=3)=>[x+Math.cos(a)*radius,y,z+Math.sin(a)*radius*1.06];
 // The outer edge marks the actual slow radius; all glow stays inside it.
 const band=(inner,outer,color,inside,outside,y)=>{
  for(let i=0;i<segments;i++){const a=i*TAU/segments,b=(i+1)*TAU/segments;r.transparentQuad(pt(a,inner,y),pt(a,outer,y),pt(b,outer,y),pt(b,inner,y),color,[inside,outside,outside,inside]);}
 };
 for(let i=0;i<segments;i++)r.transparentQuad([x,3,z],pt(i*TAU/segments,rad),pt((i+1)*TAU/segments,rad),[x,3,z],'#45caff',[.07,.16+.025*pulse,.16+.025*pulse,.07]);
 band(rad-12,rad,'#45d6ff',0,.3+.06*pulse,3.15);
 band(rad-2.5,rad,'#9af3ff',.72,.88,3.3);
 // Two staggered waves move outward, fading before the boundary.
 for(let j=0;j<2;j++){const phase=(time*.38+j*.5)%1,radius=rad*(.2+.78*phase),alpha=.28*Math.sin(Math.PI*phase);band(Math.max(0,radius-4),radius,'#6ee8ff',0,alpha,3.2);}
 for(let i=0;i<12;i++){const a=i*TAU/12;r.emissiveBox(x+Math.cos(a)*(rad-5),3.5,z+Math.sin(a)*(rad-5)*1.06,7,.6,1.8,'#a0efff',-a);}
}
function advanceBouncingBullet(b,dt){
 const minX=A.x+b.r,maxX=A.x+A.w-b.r,minY=A.y+b.r,maxY=A.y+A.h-b.r;
 b.x=Math.max(minX,Math.min(maxX,b.x));b.y=Math.max(minY,Math.min(maxY,b.y));
 let left=b.life>0?dt:0,elapsed=0,closest=Infinity;
 while(left>1e-9){
  const oldX=b.x,oldY=b.y,tx=b.vx>0?(maxX-b.x)/b.vx:b.vx<0?(minX-b.x)/b.vx:Infinity,ty=b.vy>0?(maxY-b.y)/b.vy:b.vy<0?(minY-b.y)/b.vy:Infinity,wall=Math.min(tx,ty);
  let used=left,travel=ufoBulletTravelTime(b,left)*terrainBulletFactor(b),bounce=wall<=travel;
  if(bounce){travel=wall;if(wall<=1e-10)used=0;else{let lo=0,hi=left;for(let i=0;i<32;i++){const mid=(lo+hi)/2;if(ufoBulletTravelTime(b,mid)*terrainBulletFactor(b)<wall)lo=mid;else hi=mid;}used=(lo+hi)/2;}}
  b.x+=b.vx*travel;b.y+=b.vy*travel;
  if(blockBulletWithCover(b,oldX,oldY,elapsed/dt,(elapsed+used)/dt))break;
  const playerX=p.frameStartX??p.x,playerY=p.frameStartY??p.y,dx=p.x-playerX,dy=p.y-playerY;
  const ax=oldX-playerX-dx*elapsed/dt,ay=oldY-playerY-dy*elapsed/dt,bx=b.x-playerX-dx*(elapsed+used)/dt,by=b.y-playerY-dy*(elapsed+used)/dt,sx=bx-ax,sy=by-ay,t=Math.max(0,Math.min(1,-(ax*sx+ay*sy)/(sx*sx+sy*sy||1)));
  closest=Math.min(closest,Math.hypot(ax+sx*t,ay+sy*t));left-=used;elapsed+=used;
  if(!bounce)break;
  if((b.bounces||0)>=(b.maxBounces??3)){b.life=0;burst(b.x,b.y,b.c||'#ffad62',3);break;}
  if(tx<=wall+1e-8){b.x=b.vx>0?maxX:minX;b.vx=-b.vx;}
  if(ty<=wall+1e-8){b.y=b.vy>0?maxY:minY;b.vy=-b.vy;}
  b.bounces=(b.bounces||0)+1;
 }
 return closest;
}
function updateEnemyBullets(dt){for(const b of bullets){if(b.life<=0)continue;if(b.lob){advanceLob(b,dt);continue;}prepareDrinkBullet(b);const oldX=b.x,oldY=b.y;let distance;
 if(b.wallBounce)distance=advanceBouncingBullet(b,dt);else{const travel=ufoBulletTravelTime(b,dt)*terrainBulletFactor(b);b.x+=b.vx*travel;b.y+=b.vy*travel;distance=(skateActive()||drinkBottles.length)?bulletClosestDistance(b,oldX,oldY):Math.hypot(b.x-p.x,b.y-p.y);}if(!b.wallBounce)b.life-=dt;
 if(terrainBulletBlocked(b,oldX,oldY)){b.life=0;continue;}if(b.coverBlocked||blockBulletWithCover(b,oldX,oldY))continue;if(drinkBulletBlock(b,oldX,oldY))continue;const hitRadius=b.r+drinkPlayerRadius();
 if(skateActive()&&distance<=hitRadius+24)trySkateDanger(b);
 if(distance<hitRadius&&p.inv<=0&&!skateInvulnerable()){hurt(b);if(!skateInvulnerable())b.life=0;}
}bullets=bullets.filter(b=>b.life>0&&b.x>A.x&&b.x<A.x+A.w&&b.y>A.y&&b.y<A.y+A.h);}
function updateParticles(dt){particles.forEach(q=>{if(q.heatLeft>0)q.heatLeft=Math.max(0,q.heatLeft-dt);if(q.juicyImpact){}else if(q.casing){q.age=(q.age||0)+dt;const drag=Math.exp(-1.45*dt);q.x+=q.vx*(1-drag)/1.45;q.y+=q.vy*(1-drag)/1.45;q.vx*=drag;q.vy*=drag;q.height+=q.vz*dt-210*dt*dt;q.vz-=420*dt;q.angle+=q.spin*dt;if(q.height<2){q.height=2;q.bounces++;if(q.bounces===1)playCasingLanding();q.vz=q.bounces<3?Math.abs(q.vz)*.32:0;q.spin*=.38;q.vx*=.6;q.vy*=.6;}}else if(q.hitSpark){const drag=Math.exp(-12*dt),travel=(1-drag)/12;q.x+=q.vx*travel;q.y+=q.vy*travel;q.vx*=drag;q.vy*=drag;q.height+=q.vz*dt;q.vz-=240*dt}else if(q.banknote){const drag=Math.exp(-16*dt),travel=(1-drag)/16;q.x+=q.vx*travel;q.y+=q.vy*travel;q.vx*=drag;q.vy*=drag;const vertical=Math.exp(-3.5*dt),terminal=-90/3.5;q.height+=(q.vz-terminal)*(1-vertical)/3.5+terminal*dt;q.vz=terminal+(q.vz-terminal)*vertical;if(q.height<5){q.height=5;q.vz=Math.abs(q.vz)*.1}const spinDrag=Math.exp(-10*dt);q.angle+=q.spin*(1-spinDrag)/10;q.spin*=spinDrag}else{q.x+=q.vx*dt;q.y+=q.vy*dt;if(q.chunk){q.height+=q.vz*dt;q.vz-=420*dt;if(q.height<4){q.height=4;q.vz=Math.abs(q.vz)*.25}q.vx*=Math.exp(-1.8*dt);q.vy*=Math.exp(-1.8*dt);q.angle+=q.spin*dt}}q.life-=dt});particles=particles.filter(q=>q.life>0);}
function step(dt,realDt=dt){if(paused)return;globalThis.TalentRuntime?.tick(realDt);if(state==='dead'){updatePlayerDeath(realDt);return;}const deadline=state==='combat'?(timedRoom?.remaining??greedRoom?.remaining):state==='survival'?survivalRemaining:null;if(deadline!=null&&deadline>0&&realDt>deadline){dt*=deadline/realDt;realDt=deadline;}const effectRealDt=realDt;const nightFactor=advanceDrinkNight(effectRealDt);if(state==='bossDying'){updateBossDeath(realDt);return;}const bossFrameBodies=currentBossBodies();const skateRealDt=dt;updateSkateDanger();if(skateActive()&&p.skateSlowLeft>0){dt*=.55;realDt*=.55;}const chronoSlow=timeSlowed();if(chronoSlow){dt*=.08;realDt*=.08;}const playerDt=dt;if(terrainRun.slow>0&&!chronoSlow&&terrainActive())dt*=.35;if(state==='bossIntro'){bossIntroLeft=Math.max(0,bossIntroLeft-realDt);dt*=BOSS_SLOW}const enemyDt=dt*nightFactor;time+=dt;updateDeathFeedback(dt);spectrumHits.forEach(h=>h.age+=dt);spectrumHits=spectrumHits.filter(h=>h.age<.8);cashPopups.forEach(q=>q.age+=q.followPlayer?effectRealDt:dt);cashPopups=cashPopups.filter(q=>q.age<q.life);blasts.forEach(b=>b.t+=dt);blasts=blasts.filter(b=>b.t<.35);explosionFX.forEach(e=>e.t+=dt);explosionFX=explosionFX.filter(e=>e.t<(e.duration||.9));updateParticles(dt);shake*=Math.exp(-dt*9);if(state==='stageClear'){updateStageClear(realDt);return}if(!['combat','survival','bossIntro','descent','landing'].includes(state))return;updateSkateReward(skateRealDt);p.frameStartX=p.x;p.frameStartY=p.y;p.inv=Math.max(0,p.inv-dt);p.shieldHit=Math.max(0,p.shieldHit-dt);let mx=(keys.d||keys.ArrowRight?1:0)-(keys.a||keys.ArrowLeft?1:0)+joy.x,my=(keys.s||keys.ArrowDown?1:0)-(keys.w||keys.ArrowUp?1:0)+joy.y;({mx,my}=drinkMovement(mx,my));let len=Math.hypot(mx,my);if(len>1){mx/=len;my/=len}if(len&&!skateActive()){p.dx=mx/(len>1?1:len);p.dy=my/(len>1?1:len)}let sp=movementSpeed(),walkX=p.x,walkY=p.y;if(skateActive()){if(drinkPenaltyCount('crab'))p.skateAngle=Math.cos(p.skateAngle||0)>=0?0:Math.PI;moveSkateboard(mx,my,playerDt);if(drinkPenaltyCount('crab'))p.y=walkY;}else walkFloor(p,p.x+mx*sp*playerDt,p.y+my*sp*playerDt,7);updateWeaponRecoil(playerDt);updateDrinks(dt,Math.hypot(p.x-walkX,p.y-walkY),enemyDt);if(state==='dead')return;updateMountCombatBonuses(dt,Math.hypot(p.x-walkX,p.y-walkY));updateSpiderGait(dt);updateTentacleGait(dt);updateStarTrail(dt);updateNeonSwordRide(dt);updateBeeMovement(Math.hypot(p.x-walkX,p.y-walkY));updateModelGrowth(playerDt);updateSkateDanger();updateEquipmentEffects(dt);if(!(state==='landing'&&terrainChange)){terrainUpdateEffects(dt,effectRealDt);updateHealing(dt,effectRealDt);updateShockTiles(dt);}
if(state==='descent'){phase-=dt;fallAge+=dt;const travel=Math.min(1,fallAge/.72);scroll=wallScrollStart+SCREEN_PITCH*6*(.25*travel+.75*travel*travel);shake=0;if(phase<=0){scroll=wallScrollStart+SCREEN_PITCH*6;land();}return}if(state==='landing'){if(terrainChange){updateLandingTerrain(effectRealDt);return;}phase-=dt;landingAge+=dt;if(phase<=0&&!updateLandingTerrain(0))startWave();return}
if(state==='bossIntro'){if(bossIntroLeft<=0)finishBossIntro();return}if(state==='combat'&&greedRoom&&updateGreedClock(effectRealDt))return;if(state==='combat'&&timedRoom){timedRoom.remaining=Math.max(0,timedRoom.remaining-effectRealDt);if(timedRoom.remaining<=1e-9){finishTimedRoom();return}updateTimedRoomSpawns(effectRealDt);}if(state==='survival'){survivalRemaining=Math.max(0,survivalRemaining-effectRealDt);if(survivalRemaining<=0){finishSurvival();return}updateTerrain(enemyDt);if(state!=='survival')return;if(drone?.companion)updateCompanion(dt,[]);updateEnemyBullets(enemyDt);if(state!=='survival')return;$('status').textContent='火力封锁 · 只需躲避';$('wave').textContent='撑过倒计时'+skateHudText();updateSurvivalClock();return}
updateStarterKnockbacks(enemyDt);updateEnemyTransports(enemyDt);updateTerrain(enemyDt);if(state!=='combat')return;updateMissiles(enemyDt);if(state!=='combat')return;if(!timedRoom&&(enemies.some(e=>e.hp>0&&!isMeleeEnemy(e))||missiles.length))spawnTimer=.65;else if(!timedRoom&&spawnQueue.length){spawnTimer-=dt;if(spawnTimer<=0){spawnGroup();spawnTimer=.65}}if(!greedRoom)updateChaserSpawns(dt);shootTimer-=playerDt*(1+.01*talentLevel('rate'))*(attackSpeedMultiplier()+terrainRun.attack+(terrainRun.combat>0?.3:0));const targets=combatTargets();updateDrone(dt,targets);updateSpiderTurret(dt,targets);updateVinylCutter(dt,targets);updateUFOLaser(dt,targets);updatePlaneGun(dt);updateMountedSwords(dt,targets);if(targets.length&&(typeof weaponLab==='undefined'||!weaponLab?.active||weaponLab.firing)&&(weapon.id==='rotor'||shootTimer<=0)){let e=targets.reduce((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)<Math.hypot(b.x-p.x,b.y-p.y)?a:b),a=Math.atan2(e.y-p.y,e.x-p.x);shootWeapon(a)}
const drinkOldPositions=new Map(enemies.filter(e=>e.drinkSlowUntil>time&&e.type!=='fishSchool').map(e=>[e,{x:e.x,y:e.y}]));if(ufoBoss)updateUFOBoss(enemyDt);if(droneBoss){updateDroneBoss(enemyDt);if(state==='combat')updateDroneMinions(enemyDt);if(state==='combat')updateDroneSaws(enemyDt);}if(humanoidBoss)updateHumanoidBoss(enemyDt);if(virusBoss)updateVirusBoss(enemyDt);if(snakeBoss)updateSnakeBoss(enemyDt);if(state!=='combat')return;
for(const e of enemies){if(e.transport)continue;if(e.deployGrace>0){e.deployGrace=Math.max(0,e.deployGrace-enemyDt);continue;}if(e.terrainStun>0){e.terrainStun=Math.max(0,e.terrainStun-dt);continue;}const coverX=e.x,coverY=e.y;if(e.type==='fishSchool'){if(e.hp>0)updateFishSchool(e,enemyDt);continue}if(e.type==='goldSpider'){if(e.hp>0)updateGoldSpider(e,enemyDt);continue}if(e.type==='ufoBoss'||e.type==='ufoMinion'||e.type==='snake'||e.type==='virus'||e.type==='humanoid'||e.type==='droneBoss'||e.type==='droneMinion')continue;e.t+=enemyDt;e.fire-=enemyDt;e.drinkMoveTime=(e.drinkMoveTime??(e.t-enemyDt))+enemyDt*drinkMonsterSpeed();e.warn=e.fire<(e.type==='spitter'?.9:.65);if(e.hp<=0)continue;if(e.type==='builder'){updateBuilder(e,enemyDt);continue}if(e.type==='ricochet'){updateRicochetEnemy(e,enemyDt);continue}if(isMeleeEnemy(e)){const ox=e.x,oy=e.y;updateChaser(e,enemyDt);const travel=Math.hypot(e.x-ox,e.y-oy);e.roll=(e.roll||0)+travel/(e.type==='ironball'?30:19);if(travel>.001)e.rollHeading=Math.atan2(e.y-oy,e.x-ox);if(e.type==='suicideDrone'&&Math.hypot(e.x-p.x,e.y-p.y)<e.r+drinkPlayerRadius()){e.hp=0;shatter(e);updateUI();}continue}if(e.twinPending){e.twinPending.left-=enemyDt;if(e.twinPending.left<=0){fireTwinBarrel(e,e.twinPending.side);e.twinPending=null;}}if(e.type==='boss'){e.x=Math.max(A.x+28,Math.min(A.x+A.w-28,e.homeX+Math.sin(e.drinkMoveTime*.9+e.seed)*7));e.y=Math.max(A.y+30,Math.min(A.y+A.h-30,e.homeY+Math.sin(e.drinkMoveTime*.8+e.seed)*7));resolveEnemyCover(e,coverX,coverY);}else updateRangedMovement(e,enemyDt);if(e.type==='laser'){updateLaser(e,enemyDt)}else if(e.fire<=0){fire(e);e.fire=ADDED_ENEMIES[e.type]?.interval??STARTER_ENEMIES[e.type]?.interval??(e.type==='boss'?.9:e.type==='missile'?2.6:e.type==='moth'?1.3:1.7)}if(Math.hypot(p.x-e.x,p.y-e.y)<e.r+5*drinkPlayerScale())hurt(e)}
if(state==='dead')return;
for(const [e,old]of drinkOldPositions){e.x=old.x+(e.x-old.x)*.75;e.y=old.y+(e.y-old.y)*.75;resolveEnemyCover(e,old.x,old.y);}const hitTargets=combatTargets();for(const s of shots){if(!advanceFriendlyShot(s,dt))continue;if(s.blastRadius){const contact=[...hitTargets].filter(e=>e.hp>0&&shotHits(s,e,dt)).sort((a,b)=>Math.hypot(a.x-s.lastX,a.y-s.lastY)-Math.hypot(b.x-s.lastX,b.y-s.lastY))[0];if(contact){s.x=contact.x;s.y=contact.y;}if(contact||s.life<=0||s.x<=A.x||s.x>=A.x+A.w||s.y<=A.y||s.y>=A.y+A.h){explodeFriendlyRocket(s,hitTargets);continue}}if(s.beam&&s.damageApplied&&!s.slash&&!s.sustain)continue;const orderedTargets=s.arc?s.arcTargets:s.beam?[...hitTargets].sort((a,b)=>Math.hypot(a.x-s.originX,a.y-s.originY)-Math.hypot(b.x-s.originX,b.y-s.originY)):hitTargets;for(const e of orderedTargets)if(isAttackable(e)&&!(s.hitTargets?.has(e))&&shotHits(s,e,dt)){if(s.sustain&&time<(s.modelHitAt.get(e)??-Infinity))continue;if(s.sustain)s.modelHitAt.set(e,time+.12);if(s.rotor&&time<(s.rotorCooldowns.get(e)??-Infinity))continue;if(s.rotor)s.rotorCooldowns.set(e,time+s.interval);const hit=resolveShotDamage(s,(s.damage??weapon.damage)*(s.arc&&!s.radial?Math.pow(.7,s.arcTargets.indexOf(e)):1),e);const hpBeforeHit=e.hp;e.hp-=hit.damage;if(!hit.shielded)emitBarLoss(e,hpBeforeHit,e.hp,e.max);if(!hit.shielded)showDamageNumber(e,hit.damage,hit.critical);if(!hit.shielded){onDrinkHit(s,e,hit.damage);onModelWeaponHit(s,e);if(!s.terrainShot)applyPlaneVulnerability(e,s);e.hitAt=time;}else e.shieldHitAt=time;if(s.vinylCutter&&shoes?.id==='vinyl')p.vinylAttackLeft=shoes.vinylAttackDuration;if(hit.critical){showCritical(e);tryCriticalHeal();}if(s.crescent||s.vinylCutter)pushMeleeEnemy(e,s);if(s.hitTargets)s.hitTargets.add(e);if(!s.sustain)s.pierce=(s.pierce??1)-1;if(s.pierce<=0){if(s.beam){s.x=e.x;s.y=e.y}else s.life=0;}if(hit.shielded){if(time-(e.shieldSoundAt??-Infinity)>.12){e.shieldSoundAt=time;beep(880,.04,'triangle',.012);}}else cyberHit(e,s);if(e.hp<=0){onModelWeaponKill(s,e);if(e.type==='rocket'){missileBurst(e)}else{kills++;if(!isMeleeEnemy(e)&&e.type!=='goldSpider'&&!e.weaponLabTarget){gainCash(e.type==='boss'?20:4,e.x,e.y,e.type==='boss'?110:75);cashBurst(e.x,e.y,e.type==='boss'?8:3);}if(isBossBody(e)&&bossFightDefeated()){beginBossDeath(bossFrameBodies);return;}shatter(e);shake=e.type==='boss'?7:4;updateUI();if(e.type==='boss'){enemies=[];spawnQueue=[];beginStageClear();return}}}if((s.life<=0&&!s.slash)||s.pierce<=0)break}if(s.beam&&!s.slash)s.damageApplied=true}shots=shots.filter(s=>s.life>0&&(s.beam||s.boomerang||s.zenith||(s.x>A.x&&s.x<A.x+A.w&&s.y>A.y&&s.y<A.y+A.h)));enemies=enemies.filter(e=>e.hp>0);if(snakeBoss)reconnectSnake();missiles=missiles.filter(m=>m.hp>0&&m.life>0);
updateEnemyBullets(enemyDt);for(const h of hazards){const previous=h.t;h.t+=enemyDt;if(h.lightning&&previous<=1.1&&h.t>1.1)beep(85,.18,'sawtooth',.04);if(h.droneBomb&&h.t>1.1&&!h.detonated)droneBombImpact(h);if(h.t>1.1&&h.t<1.5&&Math.hypot(p.x-h.x,p.y-h.y)<33+drinkPlayerRadius()-4)hurt(skatePhaseSource(h,'active'))}hazards=hazards.filter(h=>h.t<1.7);
if(state==='dead')return;
if(virusBoss&&!virusTest)resolveVirusSplits();
if(typeof weaponLab!=='undefined'&&weaponLab?.active){weaponLab.update(effectRealDt);return;}
if(typeof fishSchoolTest!=='undefined'&&fishSchoolTest){fishSchoolTestHud();return}if(greedRoom){if(greedRoom.outcome!=='hunting'){finishGreedRoom();return}updateGreedHud();return}
if(campaignBoss){if(((droneBoss&&droneBoss.hp<=0)||(ufoBoss&&ufoBoss.hp<=0))||(!enemies.some(e=>e.hp>0)&&!spawnQueue.length)){beginBossDeath(bossFrameBodies);return} $('status').textContent=campaignBossName()+'交战';$('wave').textContent='BOSS '+campaignBoss+' / '+CAMPAIGN_BOSSES.length+skateHudText();return}
if(humanoidTest){humanoidTestHud();if(!enemies.some(e=>e.type==='humanoid'&&e.hp>0)&&state==='combat')beginBossDeath(bossFrameBodies);return}
if(ufoBossTest){ufoBossTestHud();if(ufoBoss?.hp<=0&&state==='combat')beginBossDeath(bossFrameBodies);return}
if(droneBossTest){droneBossTestHud();if(!enemies.some(e=>e.type==='droneBoss'&&e.hp>0)&&state==='combat')beginBossDeath(bossFrameBodies);return}
if(virusTest){resolveVirusSplits();virusTestHud();if(!livingViruses().length&&state==='combat')beginBossDeath(bossFrameBodies);return}
if(snakeTest){snakeTestHud();if(!snakeBoss.parts.length&&state==='combat')beginBossDeath(bossFrameBodies);return}
if(timedRoom){if(!enemies.length&&!missiles.length&&!pendingNormalSpawns()&&!cleared){beginStageClear(1);return}updateTimedRoomHud();return}
$('cooldown').textContent=Math.round(movementSpeed())+' / s';$('status').textContent=!enemies.some(e=>!isMeleeEnemy(e))&&spawnQueue.length?'下一波准备中':'清除当前楼层';$('wave').textContent=`弹幕 ${enemies.filter(e=>!isMeleeEnemy(e)).length+spawnQueue.length} · 追逐 ${enemies.filter(e=>isMeleeEnemy(e)).length}${missiles.length?' · 导弹 '+missiles.length:''}`+skateHudText();if(!enemies.length&&!missiles.length&&!spawnQueue.length&&!cleared&&state==='combat')beginStageClear()}
// Boss floor strike stays anchored to the marked danger area and its world-time phase.

function drawLightningHazard(h){const r=renderer,x=h.x-325,z=(h.y-300)*1.06,warning=h.t<=1.1;
 if(warning){const progress=Math.max(0,h.t/1.1);r.emissiveRing(x,3,z,33,'#ff5477',2);r.emissiveRing(x,3.5,z,33*(1-progress),'#a8cfff',1.8);for(let i=0;i<4;i++){const a=i*TAU/4;r.emissiveBox(x+Math.cos(a)*37,4,z+Math.sin(a)*37,6,1,6,'#ff668c');}
 r.residentMesh('storm:warning-symbol',()=>{r.emissiveQuad([-2,4,-13],[7,4,-13],[0,4,0],[-7,4,0],'#c6e1ff');r.emissiveQuad([0,4,-2],[7,4,-2],[-5,4,14],[-2,4,2],'#c6e1ff');},monsterPose(x,0,z));return;}
 const age=h.t-1.1,fade=Math.max(0,1-age/.6);if(age<.4){const flicker=.8+.2*Math.sin(age*170);r.residentMesh('storm:vertical-bolt',()=>{const points=[[0,190],[-8,160],[7,132],[-6,104],[9,76],[-5,43],[0,5]];for(let i=1;i<points.length;i++){const [ax,ay]=points[i-1],[bx,by]=points[i];for(const [width,c] of [[5,'#647bff'],[1.6,'#e0f5ff']]){r.emissiveQuad([ax-width,ay,0],[ax+width,ay,0],[bx+width,by,0],[bx-width,by,0],c);r.emissiveQuad([0,ay,ax-width],[0,ay,ax+width],[0,by,bx+width],[0,by,bx-width],c);}}},monsterPose(x,0,z,0,flicker,1,flicker));r.glow(x,10,z,24*fade,'#9abbff');}
 r.emissiveRing(x,4,z,33,'#90b5ff',Math.max(.3,4*fade));r.emissiveRing(x,4.5,z,12+age*38,'#d9ecff',Math.max(.3,2*fade));
}

function drawBossHazard(h){if(h.lightning){drawLightningHazard(h);return;}const r=renderer,x=h.x-325,z=(h.y-300)*1.06;r.emissiveRing(x,3,z,33,'#ff3030',h.t>1.1?29:2);if(h.t<=1.1){const progress=Math.max(0,h.t/1.1);for(let i=0;i<8;i++){const a=i*TAU/8+progress*.7,rad=30-9*progress;r.emissiveBox(x+Math.cos(a)*rad,3.7,z+Math.sin(a)*rad,2,.6,4+progress*3,'#ff5c42',-a)}return}const age=h.t-1.1,fade=Math.max(0,1-age/.6),pulse=Math.min(1,age/.035),height=48*pulse*fade,rad=9+20*Math.min(1,age/.3);r.emissiveRing(x,4,z,rad,'#ff9060',Math.max(.4,3*fade));r.emissiveRing(x,4.5,z,Math.max(3,rad-6),'#ff543c',Math.max(.3,1.5*fade));const start=r.count;r.disc(x,4,z,9*fade,'#ffb575');r.markEmissive(start);for(let i=0;i<16;i++){const a=i*TAU/16,b=a+TAU/32,cs=Math.cos(a),sn=Math.sin(a),outer=22*fade+5,y=4+height*(.65+.35*Math.sin(i*2.4)**2);r.emissiveQuad([x+cs*outer,4,z+sn*outer],[x+Math.cos(b)*outer,4,z+Math.sin(b)*outer],[x+Math.cos(b)*outer*.8,y,z+Math.sin(b)*outer*.8],[x+cs*outer*.8,y,z+sn*outer*.8],i%2?'#ff3030':'#ff643d');r.emissiveBox(x+cs*outer*.85,y,z+sn*outer*.85,1.3*fade,4*fade,1.3*fade,'#ffb575');const sparkRad=12+(i%3)*5+age*18,sparkY=8+age*(80+i%4*16);r.emissiveBox(x+cs*sparkRad,sparkY,z+sn*sparkRad,1.5*fade,5*fade,1.5*fade,i%3?'#ff643d':'#ffb575')}r.glow(x,8+height*.4,z,19*fade,'#ff543c')}
function drawLaser(e){if(!['combat','survival'].includes(state)||!['warning','firing'].includes(e.laserMode))return;const r=renderer,length=beamLength(e),dx=Math.cos(e.aim),dz=Math.sin(e.aim)*1.06,x=e.x-325,z=(e.y-300)*1.06,warning=e.laserMode==='warning',width=warning?1.2:5,y=warning?5.5:12,norm=Math.hypot(dx,dz),nx=-dz/norm*width,nz=dx/norm*width,col='#ff0000';r.emissiveQuad([x+nx,y,z+nz],[x+dx*length+nx,y,z+dz*length+nz],[x+dx*length-nx,y,z+dz*length-nz],[x-nx,y,z-nz],col);for(let t=0;t<length;t+=warning?40:26)r.glow(x+dx*t,y+.3,z+dz*t,warning?3:6,'#ff0000')}
function drawLiftDisplay(z){const digits=String(floor%100).padStart(2,'0'),segments=[[0,11,10,2],[-6,6,2,9],[6,6,2,9],[0,0,10,2],[-6,-6,2,9],[6,-6,2,9],[0,-11,10,2]],maps=['012456','25','02346','02356','1235','01356','013456','025','0123456','012356'];for(let j=0;j<2;j++)for(const k of maps[+digits[j]]){const [x,y,w,h]=segments[+k];renderer.emissiveBox((x+(j?15:-5))*1.8,110+y*2.8,z+25,w*1.8,h*2.8,1,'#ffb865')}renderer.emissiveBox(-55.8,110,z+25,3.6,67.2,1,'#75c9b1');for(const y of [43,54,65])renderer.emissiveBox(-46.8,110+(y-54)*2.8,z+25,18,5.6,1,'#75c9b1');renderer.glow(18,110,z+27,18,'#eaae67')}
function drawDollar(x,y,z,scale=1){const r=renderer;for(const [u,v,w,d]of [[0,-8,15,3],[-7,-4,3,8],[0,0,15,3],[7,4,3,8],[0,8,15,3],[0,0,2,24]])r.emissiveBox(x+u*scale,y,z+v*scale,w*scale,.4,d*scale,'#eadc91')}
// Each note is one curled sheet with inset printing and a central portrait seal.
function drawBanknote(x,y,z,yaw,scale=1,flutter=0){const r=renderer,cs=Math.cos(yaw),sn=Math.sin(yaw),pt=(u,v,offset=0)=>[x+(u*cs+v*sn)*scale,y+(10*(u/14)**2+u*flutter+offset)*scale,z+(-u*sn+v*cs)*scale];for(let i=0;i<8;i++){const a=-14+i*28/8,b=a+28/8;r.emissiveQuad(pt(a,-6.5),pt(b,-6.5),pt(b,6.5),pt(a,6.5),'#acd2a6');const ia=Math.max(-12,a),ib=Math.min(12,b);if(ib>ia)r.emissiveQuad(pt(ia,-4.8,.12),pt(ib,-4.8,.12),pt(ib,4.8,.12),pt(ia,4.8,.12),'#477858')}for(let i=0;i<12;i++){const a=i*TAU/12,b=(i+1)*TAU/12;r.emissiveQuad(pt(0,0,.22),pt(Math.cos(a)*4.5,Math.sin(a)*3.5,.22),pt(Math.cos(b)*4.5,Math.sin(b)*3.5,.22),pt(0,0,.22),'#bfdcaa')}for(const u of [-9,9]){r.emissiveQuad(pt(u-1,-2,.25),pt(u+1,-2,.25),pt(u+1,2,.25),pt(u-1,2,.25),'#d9e9c0')}for(const [u,v,w,d]of [[0,-2,3,.7],[-1.4,-1, .7,2],[0,0,3,.7],[1.4,1,.7,2],[0,2,3,.7],[0,0,.45,6]])r.emissiveQuad(pt(u-w/2,v-d/2,.32),pt(u+w/2,v-d/2,.32),pt(u+w/2,v+d/2,.32),pt(u-w/2,v+d/2,.32),'#42644d')}
function drawShieldPickup(x,y,z,yaw){const r=renderer,shape=[[-15,-11],[15,-11],[13,5],[0,17],[-13,5]],cs=Math.cos(yaw),sn=Math.sin(yaw),pt=(p,h,scale=1)=>[x+(p[0]*cs+p[1]*sn)*scale,h,z+(-p[0]*sn+p[1]*cs)*scale],top=y+12;for(let i=0;i<shape.length;i++){const j=(i+1)%shape.length;r.quad(pt(shape[i],y),pt(shape[i],top),pt(shape[j],top),pt(shape[j],y),'#527d99');r.emissiveQuad([x,top,z],pt(shape[i],top),pt(shape[j],top),pt(shape[j],top),'#d5f3ff');r.emissiveQuad([x,top+.3,z],pt(shape[i],top+.3,.82),pt(shape[j],top+.3,.82),pt(shape[j],top+.3,.82),'#278bd2');r.emissiveQuad([x,top+.6,z],pt(shape[i],top+.6,.45),pt(shape[j],top+.6,.45),pt(shape[j],top+.6,.45),'#ffffff');r.emissiveQuad([x,top+.9,z],pt(shape[i],top+.9,.28),pt(shape[j],top+.9,.28),pt(shape[j],top+.9,.28),'#278bd2')}}
function drawArc(s){const r=renderer,y=s.height||12,width=.7+1.1*Math.max(0,s.life/.18);for(let j=1;j<s.points.length;j++){const start=s.points[j-1],end=s.points[j],dx=end.x-start.x,dz=(end.y-start.y)*1.06,len=Math.hypot(dx,dz)||1,nx=-dz/len,nz=dx/len,steps=Math.max(2,Math.ceil(len/13));let previous=[start.x-325,y,(start.y-300)*1.06];for(let i=1;i<=steps;i++){const t=i/steps,offset=i===steps?0:(i%2?1:-1)*(3+2*Math.sin(i*2.3+j)),next=[start.x-325+dx*t+nx*offset,y,(start.y-300)*1.06+dz*t+nz*offset],sx=next[0]-previous[0],sz=next[2]-previous[2],length=Math.hypot(sx,sz)||1,ox=-sz/length*width,oz=sx/length*width;r.emissiveQuad([previous[0]+ox,y,previous[2]+oz],[next[0]+ox,y,next[2]+oz],[next[0]-ox,y,next[2]-oz],[previous[0]-ox,y,previous[2]-oz],FRIENDLY_SHOT_COLOR);r.emissiveQuad([previous[0]+ox*.3,y+.1,previous[2]+oz*.3],[next[0]+ox*.3,y+.1,next[2]+oz*.3],[next[0]-ox*.3,y+.1,next[2]-oz*.3],[previous[0]-ox*.3,y+.1,previous[2]-oz*.3],'#fff8bb');if(i%3===0||i===steps)r.glow(next[0],y,next[2],4,FRIENDLY_SHOT_COLOR);previous=next}}}
function drawRotor(w,origin,source){const r=renderer,x=origin.x-325,z=(origin.y-300)*1.06,y=source==='drone'?48:12;r.disc(x,y,z,18,'#273c43');r.ring(x,y+2,z,18,WEAPON_GRADES[w.tier].color,2);for(const a of rotorAngles(w)){const dx=Math.cos(a),dz=Math.sin(a)*1.06,length=beamLength({x:origin.x,y:origin.y,aim:a});r.box(x+dx*22,y+3,z+dz*22,22,5,5,'#60777b',-a);r.glow(x+dx*32,y+3,z+dz*32,4,FRIENDLY_SHOT_COLOR);for(let d=34;d<length;d+=20){const at=d+(time*780%20),end=Math.min(length,at+13);if(at>=length)continue;const nx=-dz*w.halfWidth,nz=dx*w.halfWidth;r.emissiveQuad([x+dx*at+nx,y,z+dz*at+nz],[x+dx*end+nx,y,z+dz*end+nz],[x+dx*end-nx,y,z+dz*end-nz],[x+dx*at-nx,y,z+dz*at-nz],FRIENDLY_SHOT_COLOR)}}}
function drawBee(s){const r=renderer,x=s.x-325,z=(s.y-300)*1.06,a=Math.atan2(s.vy,s.vx),dx=Math.cos(a),dz=Math.sin(a)*1.06,nx=-Math.sin(a),nz=Math.cos(a)*1.06,y=(s.height||18)+Math.sin(time*22+s.beeIndex*2)*1.5;r.emissiveBox(x,y,z,11,5,6,FRIENDLY_SHOT_COLOR,-a);for(const t of [-3,2])r.box(x+dx*t,y+.1,z+dz*t,2,5.2,6.2,'#263239',-a);r.projectile(x+dx*7,y,z+dz*7,2,'#fff8bb');const flap=Math.sin(time*80+s.beeIndex)*3;for(const side of [-1,1])r.emissiveBox(x+nx*side*6,y+3+flap*side,z+nz*side*6,7,.8,5,'#dafff4',-a+side*.35);r.glow(x,y,z,3,FRIENDLY_SHOT_COLOR)}
function drawCrescent(s){const r=renderer,points=crescentPoints(s),y=s.height||12;for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],width=.5+4*Math.sin((i-.5)*Math.PI/24),dx=b.x-a.x,dz=(b.y-a.y)*1.06,length=Math.hypot(dx,dz)||1,nx=-dz/length*width,nz=dx/length*width,ax=s.x+a.x-325,az=(s.y+a.y-300)*1.06,bx=s.x+b.x-325,bz=(s.y+b.y-300)*1.06;r.emissiveQuad([ax+nx,y,az+nz],[bx+nx,y,bz+nz],[bx-nx,y,bz-nz],[ax-nx,y,az-nz],FRIENDLY_SHOT_COLOR);r.emissiveQuad([ax+nx*.25,y+.1,az+nz*.25],[bx+nx*.25,y+.1,bz+nz*.25],[bx-nx*.25,y+.1,bz-nz*.25],[ax-nx*.25,y+.1,az-nz*.25],'#fff8bb');if(i%6===0)r.glow(bx,y,bz,4,FRIENDLY_SHOT_COLOR)}}
function drawSwordBlade(x,z,a,y=24,color='#a8b7b5'){const r=renderer,dx=Math.cos(a),dz=Math.sin(a)*1.06,nx=-Math.sin(a),nz=Math.cos(a)*1.06;r.box(x+dx*20,y,z+dz*20,15,4,5,'#37545c',-a);r.box(x+dx*29,y,z+dz*29,5,4,20,color,-a);r.emissiveQuad([x+dx*32+nx*5,y,z+dz*32+nz*5],[x+dx*70+nx*3,y,z+dz*70+nz*3],[x+dx*80,y,z+dz*80],[x+dx*32-nx*5,y,z+dz*32-nz*5],'#dce8dc');r.emissiveBox(x+dx*51,y+.2,z+dz*51,38,.8,1.5,FRIENDLY_SHOT_COLOR,-a)}
function drawSwordSlash(s){if(s.life<=0)return;renderer.swordSprite(s.x-325,(s.height||24)-.2,(s.y-300)*1.06,s.angle-s.direction*.4,s.slashRadius/ .42,s.direction*.4,s.direction,s.evolution?.color)}
function drawUziPair(origin,a,height,color,firing){const r=renderer;for(const barrel of uziBarrels(origin,a)){const x=barrel.x-325,z=(barrel.y-300)*1.06,dx=Math.cos(barrel.angle),dz=Math.sin(barrel.angle)*1.06;r.box(x+dx*11,height,z+dz*11,21,8,7,'#203c40',-barrel.angle);r.box(x+dx*5,height-7,z+dz*5,6,12,6,'#536f67',-barrel.angle);r.emissiveBox(x+dx*10,height+4.2,z+dz*10,10,.8,3,color,-barrel.angle);r.box(x+dx*24,height,z+dz*24,6,4,5,color,-barrel.angle);if(firing&&barrel.target)r.glow(x+dx*28,height,z+dz*28,6,FRIENDLY_SHOT_COLOR)}}
function drawHeldWeapon(x,z,a){if(weapon.itemId){drawModelWeapon(weapon,x,z,a);return;}if(weapon.id==='uzi'){drawUziPair(p,a,22,WEAPON_GRADES[weapon.tier].color,state==='combat'&&shootTimer>weapon.interval*.63);return}if(weapon.id==='sword'){const swing=shots.findLast(s=>s.slash&&s.source==='weapon'&&s.life>0);if(swing&&state==='combat')drawSwordBlade(x,z,swing.angle,24,WEAPON_GRADES[weapon.tier].color);return}if(weapon.id==='rotor')return;const r=renderer,dx=Math.cos(a),dz=Math.sin(a);if(weapon.id==='bee'){r.box(x+dx*22,24,z+dz*22,29,12,16,'#e4b833',-a);for(const t of [13,22,31])r.box(x+dx*t,24,z+dz*t,3,13,17,'#28363b',-a);r.box(x+dx*38,24,z+dz*38,7,8,11,'#ffd965',-a);r.glow(x+dx*39,24,z+dz*39,4,FRIENDLY_SHOT_COLOR);return}if(weapon.id==='crescent'){r.box(x+dx*20,24,z+dz*20,24,7,10,'#314b51',-a);for(const side of [-1,1])r.emissiveBox(x+dx*32-dz*side*10,24,z+dz*32+dx*side*10,10,4,5,FRIENDLY_SHOT_COLOR,-a);r.glow(x+dx*33,24,z+dz*33,5,FRIENDLY_SHOT_COLOR);return}if(weapon.id==='seeker'){for(const side of [-1,1]){r.box(x+side*7,26,z-20,9,9,34,'#314b51');r.emissiveBox(x+side*7,31,z-28,5,1,12,WEAPON_GRADES[weapon.tier].color);r.box(x+side*7,26,z-38,7,6,4,'#a5b7aa')}return}if(weapon.id==='boomerang'){for(const angle of [a,a+Math.PI/2])r.emissiveBox(x+dx*25,24,z+dz*25,27,3,5,FRIENDLY_SHOT_COLOR,-angle);return}const color=WEAPON_GRADES[weapon.tier].color,length=weapon.id==='rocket'?40:weapon.id==='tesla'?24:weapon.id==='barrett'?64:weapon.id==='sniper'?52:weapon.id==='rifle'?38:weapon.id==='magnum'?19:weapon.id==='rail'?44:weapon.id==='laser'?36:weapon.id==='shotgun'?23:weapon.id==='smg'?30:27,width=weapon.id==='barrett'?11:weapon.id==='rocket'?15:weapon.id==='tesla'?13:weapon.id==='magnum'?11:weapon.id==='shotgun'?12:weapon.id==='laser'?10:7,muzzle=18+length/2;r.box(x+dx*18,22,z+dz*18,length,8,width,'#203c40',-a);r.emissiveBox(x+dx*16,26.2,z+dz*16,12,.8,3,color,-a);if(weapon.id==='twin'){for(const side of [-1,1])r.box(x+dx*31-dz*side*5,22,z+dz*31+dx*side*5,9,4,4,color,-a)}else r.box(x+dx*muzzle,22,z+dz*muzzle,5,5,width-1,color,-a);if(weapon.id==='tesla'){for(const side of [-1,1]){r.box(x+dx*34-dz*side*6,24,z+dz*34+dx*side*6,15,4,3,'#758d91',-a);r.emissiveBox(x+dx*40-dz*side*6,25,z+dz*40+dx*side*6,4,5,4,'#fff8bb',-a);}r.glow(x+dx*39,25,z+dz*39,6,FRIENDLY_SHOT_COLOR);}if(weapon.id==='laser'){for(const t of [10,20,30])r.emissiveBox(x+dx*t,28,z+dz*t,3,5,12,'#fff8a6',-a);r.glow(x+dx*muzzle,22,z+dz*muzzle,5,FRIENDLY_SHOT_COLOR)}if(weapon.id==='sniper'||weapon.id==='barrett'){r.box(x+dx*13,32,z+dz*13,17,6,5,'#657e80',-a);r.emissiveBox(x+dx*22,32,z+dz*22,1,4,4,'#cde7ec',-a);}if(weapon.id==='barrett'){r.box(x-dx*8,22,z-dz*8,17,10,11,'#53615d',-a);r.box(x+dx*49,22,z+dz*49,9,8,13,'#657e80',-a);r.box(x+dx*12,15,z+dz*12,8,13,8,'#53615d',-a);}if(weapon.id==='rifle')r.box(x+dx*12,16,z+dz*12,7,10,6,'#536f67',-a);if(weapon.id==='magnum'){r.box(x+dx*14,24,z+dz*14,9,10,13,'#8b958d',-a);r.box(x+dx*9,15,z+dz*9,7,10,7,'#665349',-a);}if(weapon.id==='rail')r.box(x+dx*16,30,z+dz*16,12,4,4,'#718d94',-a);if(state==='combat'&&shootTimer>weapon.interval*.63)r.glow(x+dx*(muzzle+3),22,z+dz*(muzzle+3),7,FRIENDLY_SHOT_COLOR)}
function drawMountedSwords(){const r=renderer;for(const b of swordBlades()){const at=swordPose(b),x=at.x-325,z=(at.y-300)*1.06,y=25+Math.sin(time*4+b.index*2)*2,dx=Math.cos(at.angle),dz=Math.sin(at.angle)*1.06;r.disc(x,2,z,10,'#2a3b4b');drawNeonSwordModel(x,y,z,at.angle,.5);if(b.stroke){r.glow(x+dx*7,y,z+dz*7,4,'#86efff');if(b.stroke.age<.14)r.emissiveBox(x-dx*26,y,z-dz*26,17,.8,2,'#86efff',-at.angle);}}}
function drawSawDrone(){for(let index=0;index<3;index++)drawSawDroneUnit(index);}
function drawSawDroneUnit(index){const r=renderer,at=dronePosition(index),x=at.x-325,z=(at.y-300)*1.06,y=17+Math.sin(time*7)*.6,color=WEAPON_GRADES[drone.tier].color;r.disc(x,3,z,28,'#172d31');r.disc(x,y,z,drone.sawRadius,'#9aa9a3');r.disc(x,y+.5,z,drone.sawRadius-6,'#354b4e');r.ring(x,y+.8,z,drone.sawRadius-8,color,2);for(let i=0;i<14;i++){const a=time*32+i*TAU/14,dx=Math.cos(a),dz=Math.sin(a)*1.06;r.emissiveBox(x+dx*(drone.sawRadius-1),y,z+dz*(drone.sawRadius-1),8,1.2,5,'#fff1a6',-a)}r.box(x,y+3,z,20,4,16,'#34545a');r.emissiveBox(x,y+5.5,z,12,.8,10,color);r.box(x,y+3,z+10,12,3,2,'#182d32');r.glow(x,y+5.5,z,4,color);for(const side of [-1,1]){r.box(x+side*17,y+3,z,12,1.5,4,'#6a8081');r.disc(x+side*21,y+5,z,7,'#1b343b');r.box(x+side*21,y+5.3,z,15,.6,2,color,time*25)}if(state==='combat'&&droneShootTimer>drone.interval*.65){r.ring(x,y+1,z,drone.sawRadius+2,FRIENDLY_SHOT_COLOR,2);r.glow(x,y+3,z,7,FRIENDLY_SHOT_COLOR)}}
function skateFlowColor(position){
 const colors=[[255,71,126],[255,138,57],[255,232,91],[120,255,153],[54,239,255],[114,150,255],[217,106,255]],phase=((position-time*1.7)%7+7)%7,index=Math.floor(phase),f=phase-index;
 return '#'+colors[index].map((c,i)=>Math.round(c*(1-f)+colors[(index+1)%7][i]*f).toString(16).padStart(2,'0')).join('');
}
function transformSkateMesh(start,glowStart,board=false){
 if(shoes?.id!=='skateboard')return;
 const r=renderer,progress=skateTrickProgress(),lift=skateJumpHeight()-(board?10*Math.sin(progress*Math.PI):0),spin=board?skateSpinAngle():0,spinCos=Math.cos(spin),spinSin=Math.sin(spin),roll=board?skateFlipAngle():0,rollCos=Math.cos(roll),rollSin=Math.sin(roll),pitch=Math.sin(progress*TAU)*(board?.38:.09),cs=Math.cos(pitch),sn=Math.sin(pitch),angle=p.skateAngle??0,dx=Math.cos(angle),dz=Math.sin(angle),x=p.x-325,z=(p.y-300)*1.06;
 const point=(data,i)=>{const along=(data[i]-x)*dx+(data[i+2]-z)*dz,y=data[i+1]-4,offset=along*(cs-1)-y*sn;data[i]+=dx*offset;data[i+2]+=dz*offset;data[i+1]=4+y*cs+along*sn+lift;const cross=-(data[i]-x)*dz+(data[i+2]-z)*dx,vertical=data[i+1]-4-lift,side=cross*rollCos-vertical*rollSin,delta=side-cross;data[i]-=dz*delta;data[i+2]+=dx*delta;data[i+1]=4+lift+vertical*rollCos+cross*rollSin;const rx=data[i]-x,rz=data[i+2]-z;data[i]=x+rx*spinCos-rz*spinSin;data[i+2]=z+rx*spinSin+rz*spinCos;};
 for(let i=start;i<r.count;i+=9){point(r.data,i);const nx=r.data[i+3],ny=r.data[i+4],nz=r.data[i+5],along=nx*dx+nz*dz,offset=along*(cs-1)-ny*sn;r.data[i+3]+=dx*offset;r.data[i+5]+=dz*offset;r.data[i+4]=ny*cs+along*sn;const cross=-r.data[i+3]*dz+r.data[i+5]*dx,side=cross*rollCos-r.data[i+4]*rollSin,delta=side-cross,vertical=r.data[i+4];r.data[i+3]-=dz*delta;r.data[i+5]+=dx*delta;r.data[i+4]=vertical*rollCos+cross*rollSin;const sx=r.data[i+3],sz=r.data[i+5];r.data[i+3]=sx*spinCos-sz*spinSin;r.data[i+5]=sx*spinSin+sz*spinCos;}
 for(let i=glowStart;i<r.projectileCount;i+=7)point(r.projectiles,i);
}
const SPIDER_LEGS=[[-1,-1],[1,-1],[-1,1],[1,1]];
// Eight radial arms. Contacts stay in world space; idle poses have no clock.
const TENTACLE_ARMS=8,TENTACLE_LINKS=16,TENTACLE_LENGTH=3.5;
function tentacleRoot(i){const a=i*TAU/TENTACLE_ARMS;return [p.x-325+Math.cos(a)*5,18,(p.y-300)*1.06+Math.sin(a)*5];}
function tentacleContact(i,vx=0,vz=0){
 const x=p.x-325,z=(p.y-300)*1.06,a=i*TAU/TENTACLE_ARMS;
 let ox=Math.cos(a)*33+Math.max(-6,Math.min(6,vx*.04)),oz=Math.sin(a)*33+Math.max(-6,Math.min(6,vz*.04));
 for(let k=0;k<24&&!onFloor(325+x+ox,300+(z+oz)/1.06,3);k++){ox*=.75;oz*=.75;}
 return [x+ox,3.5,z+oz];
}
function solveTentacle(root,tip){
 // FABRIK with fixed root/contact and equal-length bones. The bend pole is
 // vertical: every chain stays in its root/contact plane, without a shared
 // tangential offset that would make all eight arms spiral in one direction.
 const delta=tip.map((v,i)=>v-root[i]),distance=Math.hypot(...delta);
 const nodes=Array.from({length:TENTACLE_LINKS+1},(_,i)=>{const t=i/TENTACLE_LINKS,bend=Math.sin(Math.PI*t);return root.map((v,j)=>v+delta[j]*t+(j===1?18:0)*bend);});
 const place=(a,b)=>{const d=a.map((v,j)=>v-b[j]),len=Math.hypot(...d)||1;return b.map((v,j)=>v+d[j]*TENTACLE_LENGTH/len);};
 if(distance>=TENTACLE_LINKS*TENTACLE_LENGTH){return nodes.map((_,i)=>root.map((v,j)=>v+delta[j]/distance*i*TENTACLE_LENGTH));}
 for(let pass=0;pass<64;pass++){
  nodes[TENTACLE_LINKS]=[...tip];
  for(let i=TENTACLE_LINKS-1;i>=0;i--)nodes[i]=place(nodes[i],nodes[i+1]);
  nodes[0]=[...root];
  for(let i=1;i<=TENTACLE_LINKS;i++)nodes[i]=place(nodes[i],nodes[i-1]);
  if(Math.hypot(...nodes[TENTACLE_LINKS].map((v,j)=>v-tip[j]))<.001)break;
 }
 return nodes;
}
function updateTentacleGait(dt){
 if(shoes?.id!=='tentacle'){p.tentacleGait=null;return;}
 const x=p.x-325,z=(p.y-300)*1.06;let g=p.tentacleGait;
 if(!g||Math.hypot(x-g.x,z-g.z)>65){
  p.tentacleGait={x,z,arms:Array.from({length:TENTACLE_ARMS},(_,i)=>{const tip=tentacleContact(i);return {tip,swing:null,nodes:solveTentacle(tentacleRoot(i),tip)};})};return;
 }
 const travel=Math.hypot(x-g.x,z-g.z);
 // Freeze even an unfinished swing as soon as actual walking stops. Blocked
 // input, changes in facing and the global game clock never animate idle arms.
 if(travel<1e-6)return;
 const vx=dt>0?(x-g.x)/dt:0,vz=dt>0?(z-g.z)/dt:0;g.x=x;g.z=z;
 for(let i=0;i<TENTACLE_ARMS;i++){
  const arm=g.arms[i];if(!arm.swing)continue;
  const step=arm.swing;step.age=Math.min(.16,step.age+dt);const t=step.age/.16,u=t*t*(3-2*t),to=tentacleContact(i,vx,vz);
  arm.tip=step.from.map((v,j)=>v+(to[j]-v)*u);arm.tip[1]+=Math.sin(t*Math.PI)*7;
  if(t>=1){arm.tip=to;arm.swing=null;}
 }
 if(!g.arms.some(arm=>arm.swing)){
  let selected=-1,biggest=10;
  for(let i=0;i<TENTACLE_ARMS;i++){const arm=g.arms[i],to=tentacleContact(i),d=Math.hypot(to[0]-arm.tip[0],to[2]-arm.tip[2]);if(d>biggest){biggest=d;selected=i;}}
  // Opposite arms replant together, leaving six suction contacts supporting
  // the rider and preserving the spread silhouette while walking.
  if(selected>=0)for(const i of [selected,(selected+4)%TENTACLE_ARMS]){const arm=g.arms[i];arm.swing={from:[...arm.tip],age:0};}
 }
 for(let i=0;i<TENTACLE_ARMS;i++){
  const arm=g.arms[i];
  if(Math.hypot(x-arm.tip[0],z-arm.tip[2])>43||!arm.swing&&!onFloor(325+arm.tip[0],300+arm.tip[2]/1.06,3)){arm.tip=tentacleContact(i,vx,vz);arm.swing=null;}
  arm.nodes=solveTentacle(tentacleRoot(i),arm.tip);
 }
}
function drawTentacleMount(){
 if(!p.tentacleGait?.arms)updateTentacleGait(0);
 for(const arm of p.tentacleGait.arms)drawTentacleArm(arm);
}
function drawTentacleArm(arm){
 const r=renderer,nodes=arm.nodes;
 const rings=nodes.map((at,i)=>{
  const before=nodes[Math.max(0,i-1)],after=nodes[Math.min(TENTACLE_LINKS,i+1)],d=after.map((v,j)=>v-before[j]),len=Math.hypot(...d)||1,t=d.map(v=>v/len);
  let side=[-t[2],0,t[0]],sl=Math.hypot(...side);if(sl<.001){side=[1,0,0];sl=1;}side=side.map(v=>v/sl);
  const up=[t[1]*side[2],t[2]*side[0]-t[0]*side[2],-t[1]*side[0]],radius=3.6*(1-i/TENTACLE_LINKS)+.8;
  return Array.from({length:12},(_,j)=>{const a=j*TAU/12;return at.map((v,k)=>v+radius*(side[k]*Math.cos(a)+up[k]*Math.sin(a)));});
 });
 for(let i=0;i<TENTACLE_LINKS;i++)for(let j=0;j<12;j++){const k=(j+1)%12;r.emissiveQuad(rings[i][j],rings[i+1][j],rings[i+1][k],rings[i][k],j<6?'#a66fc9':'#df96bf');}
 r.emissiveQuad(rings[0][0],rings[0][3],rings[0][6],rings[0][9],'#b87bd4');
 // Two rows of pale suction cups along the exposed upper flank.
 for(let i=2;i<=TENTACLE_LINKS;i+=2){const at=nodes[i],radius=3.6*(1-i/TENTACLE_LINKS)+.8;
  for(const side of [-1,1]){const x=at[0]+side*radius*.48,y=at[1]+radius*.64,z=at[2],start=r.count;r.sphere(x,y,z,radius*.35,'#ffddce',1,.45,1);r.markEmissive(start);r.disc(x,y+radius*.18,z,radius*.19,'#91537f');}
 }
 const [x,y,z]=arm.tip;r.ring(x,y-.9,z,3.6,'#ffc2d4',.9);
}
function spiderFootTarget(i,vx=0,vz=0){
 const [sx,sz]=SPIDER_LEGS[i],x=p.x-325,z=(p.y-300)*1.06;
 let dx=sx*24+vx*.04,dz=sz*23+vz*.04;
 dx=Math.max(-30,Math.min(30,dx));dz=Math.max(-31,Math.min(31,dz));
 const reach=Math.hypot(dx,dz);if(reach>43){dx*=43/reach;dz*=43/reach;}
 // Keep foot contacts on the existing platform, including sparse floor layouts.
 for(let k=0;k<14&&!onFloor(325+x+dx,300+(z+dz)/1.06,2);k++){dx*=.8;dz*=.8;}
 return [x+dx,3,z+dz];
}
function updateSpiderGait(dt){
 if(shoes?.id!=='spider'){p.spiderGait=null;return;}
 p.spiderGait=advancePlantedGait(p.spiderGait,p.x-325,(p.y-300)*1.06,dt,SPIDER_LEGS.map((_,i)=>i),[[0,3],[1,2]],spiderFootTarget,9,.12,15);
}
function advancePlantedGait(g,x,z,dt,indices,groups,target,threshold,duration,lift){
 if(!g||Math.hypot(x-g.x,z-g.z)>100)g={x,z,pair:0,legs:indices.map(i=>({foot:target(i),swing:null}))};
 const vx=dt>0?(x-g.x)/dt:0,vz=dt>0?(z-g.z)/dt:0;g.x=x;g.z=z;
 for(const leg of g.legs)if(leg.swing){const s=leg.swing;s.age=Math.min(duration,s.age+dt);const t=s.age/duration,u=t*t*(3-2*t);leg.foot=s.from.map((v,j)=>v+(s.to[j]-v)*u);leg.foot[1]+=Math.sin(t*Math.PI)*lift;if(t>=1){leg.foot=s.to;leg.swing=null;}}
 if(!g.legs.some(l=>l.swing)){
  const pair=groups[g.pair];
  if(pair.some(i=>Math.hypot(g.legs[i].foot[0]-target(i)[0],g.legs[i].foot[2]-target(i)[2])>threshold)){
   for(const i of pair){const leg=g.legs[i];leg.swing={from:[...leg.foot],to:target(i,vx,vz),age:0};}
   g.pair=(g.pair+1)%groups.length;
  }
 }
 return g;
}
// Replant overextended contacts into the compact footprint after fast turns or long frames.
function compactSpiderFoot(foot){return [Math.max(p.x-325-34,Math.min(p.x-325+34,foot[0])),foot[1],Math.max((p.y-300)*1.06-36,Math.min((p.y-300)*1.06+36,foot[2]))];}
// Analytic two-bone IK: both segment lengths are preserved, with an upward knee pole.
function solveSpiderLeg(hip,foot,l1=20,l2=27,bend=[0,1,0]){
 const delta=foot.map((v,i)=>v-hip[i]),raw=Math.hypot(...delta),d=Math.max(Math.abs(l1-l2)+.001,Math.min(l1+l2-.001,raw)),dir=raw>1e-6?delta.map(v=>v/raw):[0,-1,0];
 const end=hip.map((v,i)=>v+dir[i]*d),a=(l1*l1-l2*l2+d*d)/(2*d),height=Math.sqrt(Math.max(0,l1*l1-a*a));
 const along=bend.reduce((sum,v,i)=>sum+v*dir[i],0);
 let pole=bend.map((v,i)=>v-dir[i]*along),n=Math.hypot(...pole);
 if(n<1e-6){pole=[1,0,0];n=1;}
 return {hip,knee:hip.map((v,i)=>v+dir[i]*a+pole[i]/n*height),foot:end};
}
function drawSpiderStrut(a,b,width,color){
 const r=renderer,dir=b.map((v,i)=>v-a[i]),len=Math.hypot(...dir)||1,d=dir.map(v=>v/len),seed=Math.abs(d[1])<.9?[0,1,0]:[1,0,0];
 let u=[d[1]*seed[2]-d[2]*seed[1],d[2]*seed[0]-d[0]*seed[2],d[0]*seed[1]-d[1]*seed[0]],n=Math.hypot(...u);u=u.map(v=>v/n*width/2);
 const v=[d[1]*u[2]-d[2]*u[1],d[2]*u[0]-d[0]*u[2],d[0]*u[1]-d[1]*u[0]],corners=point=>[[1,1],[-1,1],[-1,-1],[1,-1]].map(([s,t])=>point.map((c,i)=>c+s*u[i]+t*v[i])),aa=corners(a),bb=corners(b);
 for(let i=0;i<4;i++)r.quad(aa[i],bb[i],bb[(i+1)%4],aa[(i+1)%4],color);r.quad(...aa,color);r.quad(...bb.reverse(),color);
}
function spiderBodyBob(){return shoes?.id==='spider'&&p.spiderGait?Math.max(...p.spiderGait.legs.map(l=>l.foot[1]-3))*.1:0;}
function mountRiderLift(){return shoes?.id==='tentacle'?14:shoes?.id==='spider'?21+spiderBodyBob():shoes?.id==='warpstar'?22.5+starHover():shoes?.id==='vinyl'?11.5+vinylHover():shoes?.id==='ufo'?13+ufoHover():shoes?.id==='neonsword'?11.5+neonSwordHover():shoes?.id==='sharkblimp'?31.5+sharkHover():shoes?.id==='smallplane'?29.5+planeHover():0;}
function liftSpiderRider(start,glowStart){
 const lift=mountRiderLift();if(!lift)return;const r=renderer;
 for(let i=start;i<r.count;i+=9)r.data[i+1]+=lift;
 for(let i=glowStart;i<r.projectileCount;i+=7)r.projectiles[i+1]+=lift;
}
function starHover(){return Math.sin(time*4)*2;}
function starSpinAngle(){return time*TAU/3.5%TAU;}
function drawStarGradientQuad(points,scales,heights){
 const colors=scales.map((scale,i)=>{const a=scale<.55?[1,.96,.78]:[1,.82,.36],b=scale<.55?[1,.82,.36]:[1,.57,.13],t=scale<.55?scale/.55:(scale-.55)/.45,shade=.68+.32*Math.max(0,Math.min(1,(heights[i]-5)/18));return a.map((v,j)=>(v+(b[j]-v)*t)*shade);});
 for(const i of [0,1,2,0,2,3])renderer.vertex(points[i],[0,2,0],colors[i]);
}
function updateStarTrail(dt){
 if(shoes?.id!=='warpstar'){p.starTrail=null;return;}
 const g=p.starTrail??={x:p.x,y:p.y,remainder:0,points:[]},dx=p.x-g.x,dy=p.y-g.y,distance=Math.hypot(dx,dy);
 g.points.forEach(q=>q.age+=dt);g.points=g.points.filter(q=>q.age<.38);
 if(distance>100){g.points=[];g.remainder=0;}
 else if(distance>.001){const total=g.remainder+distance,count=Math.min(24,Math.floor(total/3));for(let i=0;i<count;i++){const t=Math.min(1,((i+1)*3-g.remainder)/distance);g.points.push({x:g.x+dx*t,y:g.y+dy*t,height:8+starHover(),age:0,seed:time+i});}g.remainder=total%3;g.points=g.points.slice(-24);}
 g.x=p.x;g.y=p.y;
}
function drawFlyingStar(x,z){
 const r=renderer,h=starHover(),heading=starSpinAngle(),segments=60;
 // Broad valleys and a smooth radial contour inflate the five points into rounded lobes.
 const contour=theta=>{const rad=22+5*Math.cos(theta*5),a=theta+heading;return [Math.cos(a)*rad,Math.sin(a)*rad];};
 const rings=[[.25,23],[.5,22],[.75,20],[.92,16],[1,12],[.95,8],[.75,6],[.4,5]];
 const at=(point,ring)=>[x+point[0]*ring[0],ring[1]+h,z+point[1]*ring[0]];
 r.glow(x,2.8,z,15,'#ffd279');
 for(let i=0;i<segments;i++){
  const a=contour(i*TAU/segments),b=contour((i+1)*TAU/segments);
  drawStarGradientQuad([[x,23+h,z],at(a,rings[0]),at(b,rings[0]),at(b,rings[0])],[0,.25,.25,.25],[23,23,23,23]);
  for(let j=0;j<rings.length-1;j++){const [s0,y0]=rings[j],[s1,y1]=rings[j+1];drawStarGradientQuad([at(a,rings[j]),at(a,rings[j+1]),at(b,rings[j+1]),at(b,rings[j])],[s0,s1,s1,s0],[y0,y1,y1,y0]);}
  drawStarGradientQuad([[x,5+h,z],at(b,rings.at(-1)),at(a,rings.at(-1)),at(a,rings.at(-1))],[0,.4,.4,.4],[5,5,5,5]);
 }
 for(let i=0;i<5;i++){const tip=contour(i*TAU/5);r.glow(x+tip[0]*.9,16+h,z+tip[1]*.9,2.5,'#ffe58b');}
 for(const q of p.starTrail?.points||[]){const fade=1-q.age/.38,xx=q.x-325,zz=(q.y-300)*1.06,yy=q.height+q.age*5,spread=Math.sin(q.seed*15)*3,rad=(2.2+Math.sin(q.seed*11)) *fade;
  r.emissiveQuad([xx-rad,yy,zz+spread],[xx,yy,zz+spread-rad*1.5],[xx+rad,yy,zz+spread],[xx,yy,zz+spread+rad*1.5],'#ffdc68');r.glow(xx,yy,zz+spread,2*fade,'#ffd45b');
 }
}
function neonSwordHover(){return Math.sin(time*4)*1.5;}
function updateNeonSwordRide(dt){
 if(shoes?.id!=='neonsword'){p.swordRide=null;return;}
 const g=p.swordRide??={x:p.x,y:p.y,angle:Math.atan2((p.dy??-1)*1.06,p.dx??0),distance:0,trail:[]},dx=p.x-g.x,dy=p.y-g.y,distance=Math.hypot(dx,dy);
 g.trail.forEach(q=>q.age+=dt);g.trail=g.trail.filter(q=>q.age<.3);
 if(distance>100){g.trail=[];g.distance=0;}
 else if(distance>.001){g.angle=Math.atan2(dy*1.06,dx);g.distance+=distance;if(g.distance>=3){g.trail.push({x:p.x-325-Math.cos(g.angle)*39,z:(p.y-300)*1.06-Math.sin(g.angle)*39,height:11+neonSwordHover(),angle:g.angle,age:0});g.distance%=3;g.trail=g.trail.slice(-16);}}
 g.x=p.x;g.y=p.y;
}
function drawNeonSwordModel(x,y,z,a,scale=1){
 const r=renderer,cs=Math.cos(a),sn=Math.sin(a),at=(along,side,localY)=>[x+(cs*along-sn*side)*scale,y+(localY-12)*scale,z+(sn*along+cs*side)*scale],outline=[[-18,-10],[27,-7],[47,0],[27,7],[-18,10]];
 for(let i=0;i<outline.length;i++){const p0=outline[i],p1=outline[(i+1)%outline.length];r.emissiveQuad(at(0,0,12),at(p0[0],p0[1]*.8,12),at(p1[0],p1[1]*.8,12),at(p1[0],p1[1]*.8,12),'#6f77c2');r.emissiveQuad(at(p0[0],p0[1]*.8,12),at(p0[0],p0[1],10.5),at(p1[0],p1[1],10.5),at(p1[0],p1[1]*.8,12),i<2?'#86efff':'#df8cff');r.quad(at(p0[0],p0[1],10.5),at(p0[0],p0[1],8.5),at(p1[0],p1[1],8.5),at(p1[0],p1[1],10.5),'#3d4b76');}
 r.emissiveQuad(at(-16,-1.6,12.3),at(38,-.8,12.3),at(47,0,12.3),at(-16,1.6,12.3),'#e6faff');
 const box=(along,side,y,w,hh,d,color,emissive=false)=>{const q=at(along,side,y);r[emissive?'emissiveBox':'box'](q[0],q[1],q[2],w*scale,hh*scale,d*scale,color,-a);};
 box(-19,0,11.8,5,4,28,'#6b72a4');box(-19,0,14,3,1,23,'#dd8dff',true);box(-29,0,11,17,4,6,'#364864');
 for(const along of [-35,-31,-27,-23])box(along,0,13.2,1,1,7,'#a2aaff',true);
 const pommel=at(-40,0,11.5);r.sphere(...pommel,3.5*scale,'#a575d9');r.glow(...pommel,3*scale,'#c795ff');
 for(const along of [12,19,26])box(along,0,12.5,3,.3,5,'#b5f8ff',true);
}
function drawNeonSwordMount(x,z){
 const r=renderer,h=neonSwordHover(),a=p.swordRide?.angle??Math.atan2((p.dy??-1)*1.06,p.dx??0);
 r.disc(x,2.2,z,18,'#2a3b4b');drawNeonSwordModel(x,12+h,z,a);
 const trail=p.swordRide?.trail||[];
 for(let i=1;i<trail.length;i++){const q=trail[i-1],next=trail[i],alpha=(1-q.age/.3)*.42,width=(1-q.age/.3)*4,nx=-Math.sin(q.angle)*width,nz=Math.cos(q.angle)*width;r.transparentQuad([q.x+nx,q.height,q.z+nz],[next.x+nx,next.height,next.z+nz],[next.x-nx,next.height,next.z-nz],[q.x-nx,q.height,q.z-nz],'#8fdfff',[alpha,alpha,alpha,alpha]);}
}
function vinylHover(){return Math.sin(time*3.5)*1.2;}
function updateVinylCutter(dt,targets){
 if(shoes?.id!=='vinyl'||state!=='combat'||paused)return;
 p.vinylShootLeft=Math.max(0,(p.vinylShootLeft||0)-dt*attackSpeedMultiplier());
 if(p.vinylShootLeft>1e-9)return;
 const touching=targets.filter(e=>isAttackable(e)&&Math.hypot(e.x-p.x,e.y-p.y)<=shoes.vinylRadius+(e.r||0));
 if(!touching.length)return;
 shots.push({beam:true,arc:true,radial:true,vinylCutter:true,arcTargets:touching,originX:p.x,originY:p.y,x:p.x,y:p.y,vx:0,vy:0,life:.08,damage:shoes.vinylDamage,...criticalProfile(shoes),pierce:touching.length+1,hitTargets:new Set(),damageApplied:false,color:FRIENDLY_SHOT_COLOR,source:'mount',weaponId:'vinyl',radius:shoes.vinylRadius,height:11+vinylHover(),knockback:130});
 p.vinylShootLeft=shoes.vinylInterval;p.vinylHitAt=time;
}
function drawVinylRecord(x,z){
 const r=renderer,h=vinylHover(),a=time*4,segments=60,start=r.count,glowStart=r.projectileCount;
 r.disc(x,2.2,z,27,'#25373d');
 // Thin dark rim supports the enlarged grooved record and its colored spinning label.
 for(let i=0;i<segments;i++){const t=i*TAU/segments,u=(i+1)*TAU/segments,pt=(angle,rad,y)=>[x+Math.cos(angle)*rad,y+h,z+Math.sin(angle)*rad];
  r.quad(pt(t,28,11.8),pt(t,32,10),pt(u,32,10),pt(u,28,11.8),'#303c4a');
  r.quad(pt(t,32,10),pt(t,29,8),pt(u,29,8),pt(u,32,10),'#1f2838');
 }
 r.disc(x,12+h,z,28,'#1f2532');
 for(let rad=10;rad<=27;rad+=1.8)r.ring(x,12.1+h,z,rad,'#586070',.35);
 const labelStart=r.count;r.disc(x,12.3+h,z,13,'#ce69bc');r.markEmissive(labelStart);
 const recordPoint=(angle,rad,y=12.25)=>[x+Math.cos(angle)*rad,y+h,z+Math.sin(angle)*rad];
 // An asymmetric paper label and a spiral pressing mark reveal the whole record's spin.
 for(let i=0;i<12;i++){const t=a+.3+i*1.6/12,u=a+.3+(i+1)*1.6/12;r.emissiveQuad([x,12.4+h,z],recordPoint(t,12.6,12.4),recordPoint(u,12.6,12.4),recordPoint(u,12.6,12.4),'#ffe5b0');}
 for(let i=0;i<48;i++){const t=i/48,u=(i+1)/48,angle=a+1.1+t*TAU*.65,next=a+1.1+u*TAU*.65,rad=14+t*12,radNext=14+u*12;r.emissiveQuad(recordPoint(angle,rad-.45),recordPoint(angle,rad+.45),recordPoint(next,radNext+.45),recordPoint(next,radNext-.45),'#91a0ae');}
 r.emissiveQuad(recordPoint(a-.1,18),recordPoint(a,25.5),recordPoint(a+.1,18),recordPoint(a+.1,18),'#e4d9b8');
 for(const [along,side,width]of [[7,-3,8],[7,0,6],[7,3,4]]){const xx=x+Math.cos(a)*along-Math.sin(a)*side,zz=z+Math.sin(a)*along+Math.cos(a)*side;r.emissiveBox(xx,12.5+h,zz,width,.2,1,'#493956',-a);}
 r.disc(x,12.6+h,z,2,'#a6e4ff');
 r.emissiveRing(x,12.35+h,z,25,'#6cecff',2);
 // The stationary tonearm makes the rotating vinyl read as a record player.
 r.box(x+22,14+h,z-16,7,6,8,'#71879e');r.sphere(x+22,18+h,z-16,3.2,'#dce6e9');
 drawSpiderStrut([x+22,18+h,z-16],[x+22,18+h,z-3],2.5,'#b0c3d4');drawSpiderStrut([x+22,18+h,z-3],[x+12,14+h,z+8],2.5,'#b0c3d4');
 r.box(x+12,14+h,z+8,5,3,7,'#8f80b9',.7);r.emissiveBox(x+12,12.7+h,z+8,2,1,2,'#9af3ff');
 if(time-(p.vinylHitAt??-Infinity)<.07){r.emissiveRing(x,8.5+h,z,33,'#9cf4ff',1.5);for(let i=0;i<4;i++){const t=a+i*TAU/4;r.glow(x+Math.cos(t)*33,9+h,z+Math.sin(t)*33,3,'#bbadff');}}
 // Enlarge only the record footprint; the rider and vertical standing height stay intact.
 const scale=43/33;
 for(let i=start;i<r.count;i+=9){r.data[i]=x+(r.data[i]-x)*scale;r.data[i+2]=z+(r.data[i+2]-z)*scale;const n=Math.hypot(r.data[i+3],r.data[i+4],r.data[i+5]);if(n>.9&&n<1.5){r.data[i+3]/=scale;r.data[i+5]/=scale;const factor=n/Math.hypot(r.data[i+3],r.data[i+4],r.data[i+5]);for(let j=3;j<6;j++)r.data[i+j]*=factor;}}
 for(let i=glowStart;i<r.projectileCount;i+=7){r.projectiles[i]=x+(r.projectiles[i]-x)*scale;r.projectiles[i+2]=z+(r.projectiles[i+2]-z)*scale;}
}
function sharkHover(){return Math.sin(time*2.8)*1.3;}
function drawSharkRiderLegs(x,z){
 const r=renderer,a=Math.atan2((p.dy??-1)*1.06,p.dx??0),at=(along,side)=>[x+Math.cos(a)*along-Math.sin(a)*side,z+Math.sin(a)*along+Math.cos(a)*side];
 for(const side of [-1,1]){for(const [along,offset,y,w,hh,d]of [[0,13,12,7,6,18],[0,22,4,6,11,7],[3,23,-3,10,5,9]]){const q=at(along,side*offset);r.box(q[0],y,q[1],w,hh,d,y<0?'#329e9a':'#172b2b',-a);if(y<0){r.box(q[0],y-2.4,q[1],w+1,1.4,d+1,'#15272c',-a);r.box(q[0],y+2.3,q[1],w-2,1.3,d-2,'#91c5b7',-a);}}}
}
function buildSharkBlimp(){
 const x=0,z=0,r=renderer,h=0,start=r.count,glowStart=r.projectileCount,a=0,profile=[[-26,4,22],[-18,14,24],[-5,18,25],[9,17,25],[20,13,25],[27,8,25],[31,3,26]],segments=12;
 const surface=(along,theta,out=1)=>{let i=0;while(i<profile.length-2&&along>profile[i+1][0])i++;const q=profile[i],n=profile[i+1],t=Math.max(0,Math.min(1,(along-q[0])/(n[0]-q[0]))),radius=q[1]+(n[1]-q[1])*t,y=q[2]+(n[2]-q[2])*t;return [x+along,y+h+Math.sin(theta)*radius*.8*out,z+Math.cos(theta)*radius*.9*out];};

 // Continuous broad shells: blue dorsal armor, silver belly, orange nose cap.
 for(let j=0;j<profile.length-1;j++)for(let i=0;i<segments;i++){const t=i*TAU/segments,u=(i+1)*TAU/segments,color=j>=4?'#ffac62':Math.sin((t+u)/2)>.4?'#4b94cc':'#d2e3ec',left=profile[j][0],right=profile[j+1][0];
  const panelStart=r.count;
  r.quad(surface(left,t),surface(right,t),surface(right,u),surface(left,u),color);
  // Shared edge shading removes striping while retaining volume in dark rooms.
  const angles=[t,t,u,t,u,u];
  for(let v=0;v<6;v++){const brightness=.72+.24*Math.max(0,Math.sin(angles[v]));for(let c=6;c<9;c++)r.data[panelStart+v*9+c]*=brightness;}
  r.markEmissive(panelStart);
 }
 const fin=(points,color)=>{r.emissiveQuad(points[0],points[1],points[2],points[2],color);r.emissiveQuad(points[2],points[1],points[0],points[0],color);};
 for(const side of [-1,1]){
  const eye=surface(17,side>0?.32:Math.PI-.32,1.04);r.sphere(...eye,3.2,'#a9bdcb',1,.8,.5);const lensStart=r.count;r.sphere(eye[0]+.5,eye[1],eye[2]+side*1.3,1.9,'#7df5ff',1,.7,.35);r.markEmissive(lensStart);r.glow(eye[0]+.7,eye[1]+.6,eye[2]+side*1.8,1.4,'#7df5ff');
  for(const along of [-3,5]){const q=surface(along,side>0?0:Math.PI,1.02);r.box(q[0],q[1]-1,q[2],3,7,1,'#294b60',-.12);r.emissiveBox(q[0],q[1]-1,q[2]+side*.55,1,5,.35,'#78dce8',-.12);}
  const theta=t=>side>0?t:Math.PI-t;
  for(let i=0;i<12;i++){const v=15+i*1.45,w=15+(i+1)*1.45;r.quad(surface(v,theta(-.25),1.035),surface(w,theta(-.25),1.035),surface(w,theta(-.57),1.035),surface(v,theta(-.57),1.035),'#193344');}
  for(const v of [17,20,23,26]){fin([surface(v-1,theta(-.25),1.05),surface(v,theta(-.43),1.05),surface(v+1,theta(-.25),1.05)],'#e2e9ee');fin([surface(v-1,theta(-.57),1.05),surface(v+1,theta(-.57),1.05),surface(v,theta(-.43),1.05)],'#e2e9ee');}
  fin([[x+6,25+h,z+side*14],[x-5,19+h,z+side*27],[x-13,24+h,z+side*12]],'#ffac62');r.sphere(x+4,25+h,z+side*14,3.3,'#294b60',1,1,.5);
  fin([[x-17,20+h,z+side*6],[x-26,16+h,z+side*14],[x-26,20+h,z+side*4]],'#638b9e');
 }
 fin([[x-21,35+h,z],[x-14,52+h,z],[x-4,39+h,z]],'#ffac62');
 r.hoop(x-24,23+h,z,5.7,'#94b4c7',1,Math.PI/2);
 // A small saddle on the back replaces the balloon rig, gondola and propeller.
 r.box(x,39.4+h,z,18,2,20,'#354858');r.box(x-7,40+h,z,3,3,20,'#7896a8');
 r.markPhosphor(start,.25);
}
function drawSharkBlimp(x,z){
 const r=renderer,h=sharkHover(),a=Math.atan2((p.dy??-1)*1.06,p.dx??0),cs=Math.cos(a),sn=Math.sin(a),sway=Math.sin(time*7)*3;
 r.residentMesh('mount:shark-shadow',()=>r.disc(0,2.2,0,25,'#263a43'),monsterPose(x,0,z));
 r.residentMesh('mount:shark-shell',buildSharkBlimp,monsterPose(x,h,z,-a));
 const at=(along,y,side)=>[x+along*cs-side*sn,y+h,z+along*sn+side*cs],fin=(points,color)=>{r.emissiveQuad(points[0],points[1],points[2],points[2],color);r.emissiveQuad(points[2],points[1],points[0],points[0],color);},start=r.count;
 fin([at(-26,23,0),at(-40,39,sway),at(-34,23,sway*.6)],'#4b758b');drawSpiderStrut(at(-26,23,0),at(-40,39,sway),1,'#8be8f4');
 fin([at(-26,23,0),at(-34,23,sway*.6),at(-38,10,sway)],'#638d9f');r.markPhosphor(start,.25);
}

function planeHover(){return Math.sin(time*3.4)*1.2;}
function updatePlaneGun(dt){
 if(shoes?.id!=='smallplane'||state!=='combat'||paused)return;
 p.planeShootLeft=(p.planeShootLeft||0)-dt*attackSpeedMultiplier();
 const forward=Math.atan2((p.dy??-1)*1.06,p.dx??0);
 let emitted=0;while(p.planeShootLeft<=0&&emitted++<12){
  const angle=forward+(Math.random()*2-1)*shoes.planeSpread,speed=shoes.planeBulletSpeed;
  const x=p.x+Math.cos(forward)*33,y=p.y+Math.sin(forward)*33/1.06;
  shots.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed/1.06,life:1.6,damage:shoes.planeDamage,...criticalProfile(shoes),pierce:1,hitTargets:new Set(),source:'mount',weaponId:'smallplane',planeBullet:true,vulnerablePerStack:shoes.planeVulnerablePerStack,vulnerableMax:shoes.planeVulnerableMax,vulnerableDuration:shoes.planeVulnerableDuration,height:22+planeHover(),color:FRIENDLY_SHOT_COLOR});
  p.planeShootLeft+=shoes.planeInterval*(.65+Math.random()*.7);
 }
 if(p.planeShootLeft<0)p.planeShootLeft=0;
}
function drawSmallPlane(x,z){
 const r=renderer,h=planeHover(),start=r.count,glowStart=r.projectileCount,glassStart=r.transparentCount,a=Math.atan2((p.dy??-1)*1.06,p.dx??0);
 r.disc(x,2.2,z,29,'#263a43');
 // Broad fuselage faces and thick wings keep the silhouette readable from above.
 const sections=[[-32,3,4],[-18,7,7],[4,12,10],[23,11,9],[32,5,5]],pt=(q,side,top)=>[x+q[0],22+h+(top?q[2]:-q[2]),z+side*q[1]];
 for(let i=0;i<sections.length-1;i++){const q=sections[i],n=sections[i+1];r.emissiveQuad(pt(q,-1,true),pt(n,-1,true),pt(n,1,true),pt(q,1,true),i===3?'#ffbe69':'#e36857');r.emissiveQuad(pt(q,1,false),pt(n,1,false),pt(n,-1,false),pt(q,-1,false),'#809eae');for(const side of [-1,1])r.emissiveQuad(pt(q,side,true),pt(n,side,true),pt(n,side,false),pt(q,side,false),'#c5dce4');}
 for(const q of [sections[0],sections[sections.length-1]])r.emissiveQuad(pt(q,-1,false),pt(q,1,false),pt(q,1,true),pt(q,-1,true),'#ffbe69');
 const wing=(points,y,thick,col)=>{const top=points.map(q=>[x+q[0],y+h,z+q[1]]),bottom=top.map(q=>[q[0],q[1]-thick,q[2]]);r.emissiveQuad(...top,col);r.emissiveQuad(...bottom,'#607d94');for(let i=0;i<4;i++){const j=(i+1)%4;r.emissiveQuad(top[i],top[j],bottom[j],bottom[i],'#8dafc3');}};
 for(const side of [-1,1]){
  wing([[12,side*8],[5,side*38],[-9,side*36],[-6,side*8]],24,4,'#f0deac');
  wing([[5,side*28],[5,side*38],[-9,side*36],[-8,side*27]],24.2,.4,'#e36857');
  wing([[-23,side*3],[-25,side*20],[-34,side*19],[-31,side*3]],27,3,'#75bfd7');
  r.emissiveBox(x-2,24+h,z+side*37,6,2,2,side>0?'#7ef1ff':'#ff9c87');r.glow(x-2,25+h,z+side*37,2,side>0?'#7ef1ff':'#ff9c87');
 }
 const fin=[[x-31,27+h,z],[x-30,44+h,z],[x-21,39+h,z],[x-19,28+h,z]];
 r.emissiveQuad(...fin,'#e36857');r.emissiveQuad(...fin.slice().reverse(),'#e36857');
 // Open saddle and a small front windscreen leave the full-size rider visible.
 r.box(x-1,34.5+h,z,16,5,16,'#809eae');r.box(x-1,37+h,z,18,3,18,'#294659');r.box(x-10,39+h,z,3,7,18,'#43647c');
 r.transparentQuad([x+13,31+h,z-10],[x+17,40+h,z-10],[x+17,40+h,z+10],[x+13,31+h,z+10],'#8beaff',[.35,.5,.5,.35]);
 r.emissiveBox(x+14,32+h,z,2,2,22,'#75d8ed');
 // The propeller rotates in a vertical plane around the aircraft's forward axis.
 const spin=time*26,blade=(offset)=>{const t=spin+offset,c=Math.cos(t),s=Math.sin(t),point=(radius,width)=>[x+35,22+h+c*radius-s*width,z+s*radius+c*width];r.emissiveQuad(point(-16,-1.6),point(16,-1.6),point(16,1.6),point(-16,1.6),'#b4dbe8');};
 blade(0);blade(Math.PI/2);r.sphere(x+35,22+h,z,4,'#ffbe69');
 r.markPhosphor(start,.25);const cs=Math.cos(a),sn=Math.sin(a);
 for(let i=start;i<r.count;i+=9){const xx=r.data[i]-x,zz=r.data[i+2]-z;r.data[i]=x+xx*cs-zz*sn;r.data[i+2]=z+xx*sn+zz*cs;const nx=r.data[i+3],nz=r.data[i+5];r.data[i+3]=nx*cs-nz*sn;r.data[i+5]=nx*sn+nz*cs;}
 for(let i=glowStart;i<r.projectileCount;i+=7){const xx=r.projectiles[i]-x,zz=r.projectiles[i+2]-z;r.projectiles[i]=x+xx*cs-zz*sn;r.projectiles[i+2]=z+xx*sn+zz*cs;}
 for(let i=glassStart;i<r.transparentCount;i+=7){const xx=r.transparentData[i]-x,zz=r.transparentData[i+2]-z;r.transparentData[i]=x+xx*cs-zz*sn;r.transparentData[i+2]=z+xx*sn+zz*cs;}
}
function ufoHover(){return Math.sin(time*3)*1.4;}
function updateUFOLaser(dt,targets){
 if(shoes?.id!=='ufo'||state!=='combat'||paused)return;
 p.ufoShootLeft=Math.max(0,(p.ufoShootLeft||0)-dt*attackSpeedMultiplier());
 const valid=targets.filter(isAttackable);if(!valid.length)return;
 const target=valid.reduce((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)<Math.hypot(b.x-p.x,b.y-p.y)?a:b),angle=Math.atan2(target.y-p.y,target.x-p.x);p.ufoAim=angle;
 if(p.ufoShootLeft>1e-9)return;
 const distance=Math.max(0,Math.min(26,Math.hypot(target.x-p.x,target.y-p.y)-(target.r||9)-2)),origin={x:p.x+Math.cos(angle)*distance,y:p.y+Math.sin(angle)*distance},start=shots.length;
 emitWeaponShots({...createWeapon('laser',shoes.tier),damage:shoes.ufoLaserDamage,pierce:shoes.ufoLaserPierce},angle,origin,'mount');
 for(let i=start;i<shots.length;i++){shots[i].ufoLaser=true;shots[i].height=4+ufoHover();}
 p.ufoShootLeft=shoes.ufoLaserInterval;p.ufoHitAt=time;
}
function drawUFOSaucer(x,z){
 const r=renderer,h=ufoHover(),segments=60,rings=[[20,5],[36,7],[44,11],[40,15],[36,19],[34,20]],colors=['#354d64','#8098af','#c8d8e5','#e0e9ef','#9bafc0'];
 const pt=(a,ring)=>[x+Math.cos(a)*ring[0],ring[1]+h,z+Math.sin(a)*ring[0]];
 r.disc(x,2.2,z,35,'#253b48');
 for(let i=0;i<segments;i++){const a=i*TAU/segments,b=(i+1)*TAU/segments;for(let j=0;j<rings.length-1;j++)r.quad(pt(a,rings[j]),pt(a,rings[j+1]),pt(b,rings[j+1]),pt(b,rings[j]),colors[j]);}
 r.disc(x,17+h,z,34,'#294355');r.box(x,23.5+h,z+1,28,3,22,'#637e93');r.box(x,34+h,z-10,28,20,3,'#829eb1');
 r.emissiveRing(x,11.2+h,z,43,'#7be8ff',1.5);r.emissiveRing(x,4.8+h,z,15,'#699bff',2);r.glow(x,4+h,z,6,'#67cfff');
 for(let i=0;i<16;i++){const a=i*TAU/16;r.emissiveBox(x+Math.cos(a)*34,16.4+h,z+Math.sin(a)*34,5,1.5,3,i%4?'#71eaff':'#d7a9ff',-a);}
 // The cockpit encloses the seated pilot at normal scale, including the antenna.
 const glass=(angle,e)=>[x+Math.cos(angle)*34*Math.cos(e),20+h+62*Math.sin(e),z+Math.sin(angle)*34*Math.cos(e)];
 for(let i=0;i<32;i++){const a=i*TAU/32,b=(i+1)*TAU/32,alpha=Math.sin(a)>0?.1:.18;for(let j=0;j<10;j++){const t=j*Math.PI/20,u=(j+1)*Math.PI/20;r.transparentQuad(glass(a,t),glass(a,u),glass(b,u),glass(b,t),'#83cde9',[alpha,alpha,alpha,alpha]);}}
 for(let i=0;i<48;i++){const a=i*TAU/48,b=(i+1)*TAU/48,base=(angle,scale,y)=>[x+Math.cos(angle)*34*scale,y+h,z+Math.sin(angle)*34*scale];r.quad(base(a,1,19),base(a,1,20),base(b,1,20),base(b,1,19),'#5c748b');r.emissiveQuad(base(a,1,20.2),base(a,.95,20.2),base(b,.95,20.2),base(b,1,20.2),'#9aefff');}
 for(const angle of [0,Math.PI,Math.PI*1.5])for(let i=0;i<12;i++)drawSpiderStrut(glass(angle,i*Math.PI/24),glass(angle,(i+1)*Math.PI/24),.7,'#bdd8e4');
 for(const angle of [.18,2.6])for(let i=2;i<9;i++){const t=i*Math.PI/20,u=(i+1)*Math.PI/20;r.transparentQuad(glass(angle,t),glass(angle,u),glass(angle+.055,u),glass(angle+.055,t),'#ecfbff',[.38,.38,.38,.38]);}
 r.emissiveRing(x,15.8+h,z,38,'#dd83ff',.9);r.emissiveRing(x,12+h,z,42,'#8defff',.8);
 r.box(x,30+h,z+27,24,3,6,'#586f88');r.emissiveBox(x,32+h,z+27,20,1,4,'#8df2ff');
 const aim=p.ufoAim??-Math.PI/2,dx=Math.cos(aim),dz=Math.sin(aim);r.disc(x,4+h,z,8,'#334d66');r.box(x+dx*17,4+h,z+dz*17,20,4,5,'#647f96',-aim);r.emissiveBox(x+dx*26,4+h,z+dz*26,3,4,6,'#eaffc4',-aim);
 if(time-(p.ufoHitAt??-Infinity)<.14)r.glow(x+dx*27,4+h,z+dz*27,5,FRIENDLY_SHOT_COLOR);
}
function spiderTurretState(){return p.spiderTurret??={angle:Math.atan2(p.dy??-1,p.dx??0),cooldown:0,rounds:0,gap:0,flash:0};}
function updateSpiderTurret(dt,targets){
 if(shoes?.id!=='spider'||state!=='combat'||paused)return;
 const t=spiderTurretState();t.flash=Math.max(0,t.flash-dt);const tick=dt*attackSpeedMultiplier();t.cooldown=Math.max(0,t.cooldown-tick);t.gap-=tick;
 const valid=targets.filter(isAttackable);
 if(!valid.length){t.rounds=0;t.gap=0;return;}
 const target=valid.reduce((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)<Math.hypot(b.x-p.x,b.y-p.y)?a:b),desired=Math.atan2(target.y-p.y,target.x-p.x),delta=Math.atan2(Math.sin(desired-t.angle),Math.cos(desired-t.angle));
 t.angle+=Math.max(-Math.PI*8*dt,Math.min(Math.PI*8*dt,delta));t.angle=Math.atan2(Math.sin(t.angle),Math.cos(t.angle));
 if(Math.abs(Math.atan2(Math.sin(desired-t.angle),Math.cos(desired-t.angle)))>.06)return;
 if(!t.rounds&&t.cooldown<=0){t.rounds=shoes.spiderTurretBurst;t.cooldown=shoes.spiderTurretCycle;t.gap=0;}
 let emitted=0;while(t.rounds>0&&t.gap<=1e-9&&emitted<16){
  const dx=Math.cos(t.angle),dy=Math.sin(t.angle),muzzle=Math.max(0,Math.min(30,Math.hypot(target.x-p.x,target.y-p.y)-(target.r||9)-2)),origin={x:p.x+dx*muzzle,y:p.y+dy*muzzle/1.06},start=shots.length;
  emitWeaponShots({...createWeapon('smg',shoes.tier),damage:shoes.spiderTurretDamage,speed:900,pellets:1,spread:0},t.angle,origin,'mount');
  for(let i=start;i<shots.length;i++){shots[i].height=14+spiderBodyBob();shots[i].spiderTurret=true;}
  t.rounds--;t.gap+=shoes.spiderTurretInterval;t.flash=.055;emitted++;
 }
}
function drawSpiderTurret(x,z,bob){
 const r=renderer,t=spiderTurretState(),a=t.angle,dx=Math.cos(a),dz=Math.sin(a),at=(along,side)=>[x+dx*along-dz*side,z+dz*along+dx*side];
 // Fixed belly bearing and vertical suspension support the independently rotating gun cradle.
 r.box(x,20+bob,z,13,4,13,'#b0c0cd');r.disc(x,18+bob,z,12,'#263c52');r.emissiveRing(x,18.3+bob,z,11,'#6fe5ff',1.5);
 r.box(x,17+bob,z,6,6,6,'#718ba0');r.box(x,14+bob,z,17,8,17,'#647f98',-a);r.box(x,18+bob,z,20,2,3,'#b4c8d6',-a);
 for(const side of [-1,1]){const [bx,bz]=at(17,side*4),[mx,mz]=at(29,side*4);r.box(bx,14+bob,bz,24,3.5,3.5,'#344f65',-a);r.box(mx,14+bob,mz,4,5,5,'#a0bacb',-a);const [ax,az]=at(-3,side*10);r.box(ax,14+bob,az,10,7,5,'#516b84',-a);}
 const [sx,sz]=at(8,0);r.emissiveBox(sx,18+bob,sz,5,1,6,'#71eaff',-a);
 if(t.flash>0){const [mx,mz]=at(31,0);r.glow(mx,14+bob,mz,5,FRIENDLY_SHOT_COLOR);r.emissiveBox(mx,14+bob,mz,6,2,4,'#fff8bb',-a);}
}
function drawSpiderMech(x,z){
 if(!p.spiderGait)updateSpiderGait(0);const r=renderer,bob=spiderBodyBob(),start=r.count;
 r.disc(x,2.15,z,33,'#263a46');
 drawSpiderTurret(x,z,bob);
 for(let i=0;i<4;i++){
  const [sx,sz]=SPIDER_LEGS[i],leg=solveSpiderLeg([x+sx*14,27+bob,z+sz*10],compactSpiderFoot(p.spiderGait.legs[i].foot)),color=i===0||i===3?'#62d7ed':'#b59aeb';
  drawSpiderStrut(leg.hip,leg.knee,8,'#8598ac');drawSpiderStrut(leg.knee,leg.foot,6,'#526b83');
  r.sphere(...leg.hip,5,'#263c57');r.sphere(...leg.knee,5.5,'#d1ddeb');r.glow(...leg.knee,3,color);
  r.emissiveBox(leg.knee[0],leg.knee[1]+3,leg.knee[2],6,1,6,color);
  r.box(leg.foot[0],leg.foot[1],leg.foot[2],12,5,13,'#809db1');r.emissiveBox(leg.foot[0],leg.foot[1]+3,leg.foot[2],7,1,7,color);
 }
 // Open cockpit: seat, backrest, side rails, forward foot platform and controls.
 r.box(x,25+bob,z,39,12,34,'#526982');r.box(x,32+bob,z,25,4,24,'#202c44');
 r.box(x,42+bob,z-13,29,22,5,'#738da6');r.emissiveBox(x,51+bob,z-10,22,2,2,'#a898ff');
 for(const side of [-1,1]){r.box(x+side*21,35+bob,z,5,12,32,'#829db4');r.emissiveBox(x+side*24,39+bob,z,1,2,23,'#64e8ff');r.box(x+side*17,36+bob,z+17,8,5,10,'#30465e');}
 r.box(x,27+bob,z+21,29,4,17,'#6c8295');r.emissiveBox(x,29.5+bob,z+26,20,1,3,'#78e6ff');
 r.markPhosphor(start,.18);
}
function drawSkateboard(x,z){
 const r=renderer,meshStart=r.count,glowStart=r.projectileCount,a=Number.isFinite(p.skateAngle)?p.skateAngle:Math.atan2(p.dy??-1,p.dx??0),yaw=-a;
 const at=(along,side)=>[x+Math.cos(a)*along-Math.sin(a)*side,z+Math.sin(a)*along+Math.cos(a)*side];

 // Emission keeps the whole deck vivid under every room light, with a cycling spectrum.
 r.emissiveBox(x,3.8,z,48,2.4,21,'#a670ff',yaw);
 for(let i=0;i<28;i++){const [sx,sz]=at(-23.2+i*1.72,0);r.emissiveBox(sx,5.2,sz,1.75,.8,19,skateFlowColor(i/4),yaw);}
 for(let i=0;i<3;i++){const along=((time*32+i*16)%48)-24,[sx,sz]=at(along,0);r.emissiveBox(sx,5.8,sz,2,.5,19,'#caffff',yaw);r.glow(sx,5.5,sz,3,skateFlowColor(along/7));}
 for(const side of [-1,1])for(let i=0;i<12;i++){const [sx,sz]=at(-22+i*4,side*10.5);r.emissiveBox(sx,4.4,sz,4.1,1.8,2,skateFlowColor(i*.6+side),yaw);}
 for(const end of [-1,1]){const [ex,ez]=at(end*25,0),c=end>0?'#ffe85b':'#ff59db';r.emissiveBox(ex,4.7,ez,6,3,19,c,yaw);r.glow(ex,4.7,ez,4,c);const [tx,tz]=at(end*15,0);r.emissiveBox(tx,1.8,tz,4,2,22,'#83efff',yaw);}
 for(const along of [-15,15])for(const side of [-12,12]){
  const [wx,wz]=at(along,side),axis=[-Math.sin(a),Math.cos(a)],segments=12,c=along>0?'#36efff':'#ff59db',start=r.count;
  for(let i=0;i<segments;i++){const t=i*TAU/segments,u=(i+1)*TAU/segments;
   const point=(angle,width)=>[wx+Math.cos(a)*Math.cos(angle)*2.8+axis[0]*width,1.8+Math.sin(angle)*2.8,wz+Math.sin(a)*Math.cos(angle)*2.8+axis[1]*width];
   r.quad(point(t,-2),point(u,-2),point(u,2),point(t,2),c);
   for(const width of [-2,2])r.quad([wx+axis[0]*width,1.8,wz+axis[1]*width],point(t,width),point(u,width),[wx+axis[0]*width,1.8,wz+axis[1]*width],c);
  }
  r.markEmissive(start);r.glow(wx,2,wz,3,c);
 }
 if(p.grazeLeft>0){r.emissiveBox(x,5.8,z,19,.8,2,'#efffff',yaw);r.glow(x,6,z,6,'#72efff');}
 transformSkateMesh(meshStart,glowStart,true);
 if(p.skateTrickLeft>0){const spin=a+skateSpinAngle(),h=4+skateJumpHeight()-10*Math.sin(skateTrickProgress()*Math.PI);for(let i=0;i<16;i++){const t=spin-i*.085,u=t-.075,rad=31-i*.25,col=skateFlowColor(i*.35);r.emissiveQuad([x+Math.cos(t)*rad,h,z+Math.sin(t)*rad],[x+Math.cos(u)*rad,h,z+Math.sin(u)*rad],[x+Math.cos(u)*(rad-2.2),h,z+Math.sin(u)*(rad-2.2)],[x+Math.cos(t)*(rad-2.2),h,z+Math.sin(t)*(rad-2.2)],col);}}
 if(skateInvulnerable())r.emissiveRing(x,5+skateJumpHeight(),z,24,'#9affff',1.3);
}
function drawEquipmentModels(){const r=renderer,x=p.x-325,z=(p.y-300)*1.06;drawUFOField(x,z);if(armor?.cashProductionMultiplier)r.ring(x,4,z,armor.cashProductionRadius*TILE,'#e7cf68',1);if(armor?.auraDamage)r.ring(x,4,z,armor.auraRadius*TILE,'#ffd965',1);if(timeSlowed())r.ring(x,5,z,32,'#b9e3ff',2);if(shoes?.productionBonus)r.ring(x,3.7,z,shoes.productionRadius*TILE,'#78dca9',1);if(armor?.shieldInterval){const lift=mountRiderLift()+playerUpperLift(),scale=1;r.emissiveBox(x,(playerSeated()?25:19.225)*scale+lift,z+13*scale,5*scale,10*scale,2*scale,'#70c6ff');r.glow(x,(playerSeated()?25:19.225)*scale+lift,z+13*scale,4*scale,'#70c6ff');}if(!(p.inv>0&&!playerFaceHurt()&&Math.floor(time*15)%2===0)){if(armor){const gearStart=r.count,gearGlow=r.projectileCount,c=WEAPON_GRADES[armor.tier].color;r.box(x,19,z+7,15,17,3,'#31454b');r.emissiveBox(x,21,z+9,10,3,1,c);for(const side of [-1,1])r.box(x+side*10,27,z,6,5,13,c);liftPlayerUpperBody(gearStart,gearGlow);transformSkateMesh(gearStart,gearGlow);liftSpiderRider(gearStart,gearGlow);}if(shoes?.id==='skateboard')drawSkateboard(x,z);else if(shoes?.id==='warpstar')drawFlyingStar(x,z);else if(shoes?.id==='vinyl')drawVinylRecord(x,z);else if(shoes?.id==='ufo')drawUFOSaucer(x,z);else if(shoes?.id==='sharkblimp')drawSharkBlimp(x,z);else if(shoes?.id==='smallplane')drawSmallPlane(x,z);else if(shoes?.id==='neonsword'){drawNeonSwordMount(x,z);drawMountedSwords();}else if(shoes&&!['spider','tentacle'].includes(shoes.id)&&!playerBipedGaits.has(p)){const c=WEAPON_GRADES[shoes.tier].color,walk=(Math.hypot(joy.x,joy.y)||Object.values(keys).some(Boolean))?Math.sin(time*15)*3:0;for(const side of [-1,1]){r.box(x+side*6,4,z-walk*side+2,11,6,16,'#243c42');r.emissiveBox(x+side*6,5,z-walk*side+10,8,2,1,c)}}}if(drone?.companion){drawCompanion();return;}if(drone?.id==='flysword')return;if(drone?.id==='chainsaw'){drawSawDrone();return}if(drone){const at=dronePosition(),dx=at.x-325,dz=(at.y-300)*1.06,y=48+Math.sin(time*5)*2,c=WEAPON_GRADES[drone.tier].color,targets=combatTargets(),target=targets.length?targets.reduce((a,b)=>Math.hypot(a.x-at.x,a.y-at.y)<Math.hypot(b.x-at.x,b.y-at.y)?a:b):null,a=drone.id==='seeker'?-Math.PI/2:target?Math.atan2(target.y-at.y,target.x-at.x):0;if(drone.id==='sword'){const swing=shots.findLast(s=>s.slash&&s.source==='drone'&&s.life>0);if(swing&&state==='combat')drawSwordBlade(dx,dz,swing.angle,48,c);return}r.box(dx,y,dz,18,9,14,'#48636a');r.emissiveBox(dx,y+5,dz,10,1,8,c);for(const side of [-1,1]){r.box(dx+side*15,y,dz,13,3,4,'#77969b');r.disc(dx+side*15,y+2,dz,8,'#283d43');r.box(dx+side*15,y+2.5,dz,17,1,2,c,time*20)}if(drone.id==='uzi'){drawUziPair(at,a,y,c,state==='combat'&&droneShootTimer>drone.interval*.63);return}r.box(dx+Math.cos(a)*12,y,dz+Math.sin(a)*12,17,4,4,c,-a);r.glow(dx,y+5,dz,4,c);if(state==='combat'&&droneShootTimer>drone.interval*.63)r.glow(dx+Math.cos(a)*21,y,dz+Math.sin(a)*21,6,FRIENDLY_SHOT_COLOR)}}
function drawFriendlyShot(s){if(s.evolution){drawModelShot(s);return;}const r=renderer,X=x=>x-325,Z=y=>(y-300)*1.06;if(s.rotor||s.weaponId==='chainsaw'||s.weaponId==='flysword')return;if(s.slash){drawSwordSlash(s);return}if(s.radial){if(s.vinylCutter||s.weaponId==='rocket'||s.weaponId==='seeker')return;if(s.weaponId==='rocket')r.projectile(X(s.originX),12,Z(s.originY),20*Math.max(0,s.life/.18),FRIENDLY_SHOT_COLOR);r.ring(X(s.originX),9,Z(s.originY),s.radius*(1-s.life/.18),FRIENDLY_SHOT_COLOR,2);r.glow(X(s.originX),18,Z(s.originY),8,FRIENDLY_SHOT_COLOR);return}if(s.planeBullet){const yaw=-Math.atan2(s.vy*1.06,s.vx);r.emissiveBox(X(s.x),s.height||22,Z(s.y),22,1.2,1.6,FRIENDLY_SHOT_COLOR,yaw);r.emissiveBox(X(s.x),(s.height||22)+.2,Z(s.y),14,.6,.7,'#fff8bb',yaw);r.glow(X(s.x),s.height||22,Z(s.y),2.2,FRIENDLY_SHOT_COLOR);return}if(s.bee){drawBee(s);return}if(s.crescent){drawCrescent(s);return}if(s.arc){drawArc(s);return}if(s.beam){const sx=X(s.originX),sz=Z(s.originY),ex=X(s.x),ez=Z(s.y),dx=ex-sx,dz=ez-sz,len=Math.hypot(dx,dz)||1,y=s.height||12,width=1.4+2.6*Math.max(0,s.life/.14),nx=-dz/len*width,nz=dx/len*width;r.emissiveQuad([sx+nx,y,sz+nz],[ex+nx,y,ez+nz],[ex-nx,y,ez-nz],[sx-nx,y,sz-nz],FRIENDLY_SHOT_COLOR);r.emissiveQuad([sx+nx*.25,y+.1,sz+nz*.25],[ex+nx*.25,y+.1,ez+nz*.25],[ex-nx*.25,y+.1,ez-nz*.25],[sx-nx*.25,y+.1,sz-nz*.25],'#fff8bb');for(let t=0;t<=len;t+=35)r.glow(sx+dx*t/len,y,sz+dz*t/len,5,FRIENDLY_SHOT_COLOR);return}const id=s.weaponId||weapon.id,a=Math.atan2(s.vy,s.vx);if(s.boomerang){for(const angle of [time*22,time*22+Math.PI/2])r.emissiveBox(X(s.x),s.height||12,Z(s.y),30,3,5,FRIENDLY_SHOT_COLOR,angle);r.projectile(X(s.x),s.height||12,Z(s.y),3,'#fff8bb');r.glow(X(s.x),s.height||12,Z(s.y),6,FRIENDLY_SHOT_COLOR);return}if(s.homing){const dx=Math.cos(a),dz=Math.sin(a)*1.06;r.emissiveBox(X(s.x),s.height||12,Z(s.y),18,4,4,FRIENDLY_SHOT_COLOR,-a);r.projectile(X(s.x)+dx*9,s.height||12,Z(s.y)+dz*9,3,'#fff8bb');r.glow(X(s.x)-dx*12,s.height||12,Z(s.y)-dz*12,5,'#ffd464');for(const side of [-1,1])r.emissiveBox(X(s.x)-dx*5-dz*side*4,s.height||12,Z(s.y)-dz*5+dx*side*4,6,1,3,'#fff8bb',-a);return}if(s.blastRadius){r.emissiveBox(X(s.x),s.height||12,Z(s.y),22,6,6,FRIENDLY_SHOT_COLOR,-a);r.projectile(X(s.x)+Math.cos(a)*12,s.height||12,Z(s.y)+Math.sin(a)*12*1.06,5,'#fff8bb');r.glow(X(s.x)-Math.cos(a)*14,s.height||12,Z(s.y)-Math.sin(a)*14*1.06,8,FRIENDLY_SHOT_COLOR);return}if(id==='sniper'||id==='barrett'){const dx=Math.cos(a),dz=Math.sin(a)*1.06;for(let t=12;t<=44;t+=8)r.emissiveBox(X(s.x)-dx*t,s.height||12,Z(s.y)-dz*t,6,1,1,'#fff8bb',-a);}if(id==='pulse'||id==='shotgun'||id==='magnum')r.projectile(X(s.x),s.height||12,Z(s.y),id==='magnum'?5:id==='pulse'?4:3,FRIENDLY_SHOT_COLOR);else r.emissiveBox(X(s.x),s.height||12,Z(s.y),id==='barrett'?36:id==='sniper'?28:id==='rifle'?18:id==='rail'?36:id==='smg'?15:10,id==='rail'?5:2,id==='barrett'?3:id==='sniper'?1.5:id==='rifle'?3:id==='rail'?5:id==='twin'?4:2,FRIENDLY_SHOT_COLOR,-a);r.glow(X(s.x),s.height||12,Z(s.y),id==='rail'||id==='magnum'?8:5,FRIENDLY_SHOT_COLOR)}
// Temporary player-only head spring experiment. Set false (or ?headspring=0) to remove the effect.
const PLAYER_HEAD_SPRING_TEST=typeof location==='undefined'||!/(?:^|[?&])headspring=0(?:&|$)/.test(location.search);
const playerHeadSprings=new WeakMap();
const PLAYER_HEAD_REST_TILT=42*Math.PI/180;
function updatePlayerHeadSpring(){
 if(!PLAYER_HEAD_SPRING_TEST||!p)return null;
 let h=playerHeadSprings.get(p);
 if(!h){h={time,x:p.x,y:p.y,vx:0,vy:0,roll:0,rollV:0,pitch:0,pitchV:0};playerHeadSprings.set(p,h);return h;}
 const elapsed=time-h.time;if(elapsed<=0)return h;
 const dx=p.x-h.x,dy=p.y-h.y,dt=Math.min(.05,elapsed);h.time=time;h.x=p.x;h.y=p.y;
 if(elapsed>.15||Math.hypot(dx,dy)>65){h.vx=h.vy=h.roll=h.rollV=h.pitch=h.pitchV=0;return h;}
 const vx=dx/elapsed,vy=dy/elapsed;
 // The neck stays attached. Acceleration excites angular springs, never head translation.
 h.rollV+=Math.max(-350,Math.min(350,vx-h.vx))*.006;
 h.pitchV+=Math.max(-350,Math.min(350,vy-h.vy))*.003;
 h.vx=vx;h.vy=vy;
 const rollTarget=Math.max(-.08,Math.min(.08,vx*.0005)),pitchTarget=Math.max(-.035,Math.min(.035,vy*.00022));
 for(let left=dt;left>0;){const step=Math.min(left,1/120);left-=step;
  h.rollV+=((rollTarget-h.roll)*650-h.rollV*16)*step;h.roll+=h.rollV*step;
  h.pitchV+=((pitchTarget-h.pitch)*700-h.pitchV*20)*step;h.pitch+=h.pitchV*step;
 }
 h.roll=Math.max(-.12,Math.min(.12,h.roll));h.pitch=Math.max(-.055,Math.min(.055,h.pitch));return h;
}
function playerFaceHurt(){return !!p&&time<(p.faceHurtUntil??-Infinity);}
function playerFaceExpression(){return playerFaceHurt()?'red':'smile';}
function drawPlayerFace(x,z){
 const r=renderer,color='#08786e';if(playerFaceHurt())return;
 const line=(ax,ay,bx,by,width=1.35)=>{const dx=bx-ax,dy=by-ay,length=Math.hypot(dx,dy)||1,nx=-dy/length*width/2,ny=dx/length*width/2;r.emissiveQuad([x+ax+nx,ay+ny,z+14.7],[x+ax-nx,ay-ny,z+14.7],[x+bx-nx,by-ny,z+14.7],[x+bx+nx,by+ny,z+14.7],color);};
 for(const side of [-1,1]){const eye=side*6.1,eyeStart=r.count;r.sphere(x+eye,38.2,z+14.7,2.8,color,1,1,.25);r.markEmissive(eyeStart);r.box(x+side*12,36,z+14,2,2,1,'#618f85');}
 const mouth=[[-3.2,35.2],[-1.9,34.1],[0,33.8],[1.9,34.1],[3.2,35.2]];for(let i=1;i<mouth.length;i++)line(...mouth[i-1],...mouth[i],1.3);
}
function drawPlayerHeadHousing(x,z){
 const r=renderer;r.box(x,39,z,31,25,23,'#75968b');r.box(x-13.4,39,z+11.9,4.2,24,2,'#d7d5b5');
 // Mint CRT glass inset in a sage bezel, with soft clipped corners and a cream side panel.
 const outline=[[-9.8,47.5],[9.8,47.5],[11.5,45.8],[11.5,34.2],[9.8,32.5],[-9.8,32.5],[-11.5,34.2],[-11.5,45.8]];
 r.box(x+.5,40,z+12,25,18,2,'#3e655e');
 for(let i=0;i<outline.length;i++){const a=outline[i],b=outline[(i+1)%outline.length];r.emissiveQuad([x,40,z+13.2],[x+a[0],a[1],z+13.2],[x+b[0],b[1],z+13.2],[x+b[0],b[1],z+13.2],playerFaceHurt()?'#ff334b':'#35f7b0');}
 for(const y of [34.5,36.8,39.1])r.box(x-13.4,y,z+13.1,2.9,.65,.6,'#5b8278');
 const crack=(a,b)=>drawSpiderStrut([x+a[0],a[1],z+13.5],[x+b[0],b[1],z+13.5],.45,'#168b76');
 if(!playerFaceHurt()){crack([-9.5,47],[-7,44.5]);crack([-7,44.5],[-8.5,42.2]);crack([-7,44.5],[-3.7,46.8]);}
}
function transformPlayerHead(start,glowStart,x,z,h){
 const r=renderer,c=Math.cos(h?.roll||0),s=Math.sin(h?.roll||0),cp=Math.cos(h?.pitch||0),sp=Math.sin(h?.pitch||0),cy=Math.sin(PLAYER_HEAD_REST_TILT),cz=Math.cos(PLAYER_HEAD_REST_TILT);
 // Lower the rest tilt below the camera's elevation so even the upstroke cannot expose the underside.
 // Rotate around the fixed bottom-centre neck; no independent translation.
 const rotate=(xx,yy,zz)=>{const rx=c*xx-s*yy,ry=s*xx+c*yy,py=cp*ry-sp*zz,pz=sp*ry+cp*zz;return [rx,cz*py+cy*pz,-cy*py+cz*pz];};
 const point=(data,i)=>{const q=rotate(data[i]-x,data[i+1]-27,data[i+2]-z);data[i]=x+q[0];data[i+1]=39-12*cz+q[1];data[i+2]=z+12*cy+q[2];};
 for(let i=start;i<r.count;i+=9){point(r.data,i);
  // Emissive [0,2,0] is a material tag, not a surface normal; keep display colors unlit.
  if(r.data[i+3]===0&&r.data[i+4]===2&&r.data[i+5]===0)continue;
  const q=rotate(r.data[i+3],r.data[i+4],r.data[i+5]);r.data.set(q,i+3);
 }
 for(let i=glowStart;i<r.projectileCount;i+=7)point(r.projectiles,i);
}
// Miniature version of humanoid.js: planted world contacts, alternating swing and two-bone IK.
const playerBipedGaits=new WeakMap();
function playerMounted(){return ['skateboard','spider','warpstar','vinyl','ufo','neonsword','sharkblimp','smallplane','tentacle'].includes(shoes?.id);}
function playerSeated(){return ['spider','ufo','sharkblimp','smallplane'].includes(shoes?.id);}
function playerUpperLift(){return playerSeated()?0:(playerBipedGaits.get(p)?.height??19.8)-8;}
function playerHeadDrop(){return playerSeated()?0:6.65;}
function liftPlayerUpperBody(start,glowStart,headStart=Infinity,headGlow=Infinity){
 const r=renderer,lift=playerUpperLift(),scale=playerSeated()?1:.65,drop=playerHeadDrop();
 // Raise the pelvis for straight legs, shortening only the torso so the big-head proportion stays compact.
 for(let i=start;i<r.count;i+=9){r.data[i+1]=(i>=headStart?r.data[i+1]-drop:8.5+(r.data[i+1]-8.5)*scale)+lift;
  if(i<headStart&&scale!==1&&!(r.data[i+3]===0&&r.data[i+4]===2&&r.data[i+5]===0)){const n=Math.hypot(r.data[i+3],r.data[i+4],r.data[i+5]);r.data[i+4]/=scale;const f=n/(Math.hypot(r.data[i+3],r.data[i+4],r.data[i+5])||1);for(let j=3;j<6;j++)r.data[i+j]*=f;}
 }
 for(let i=glowStart;i<r.projectileCount;i+=7)r.projectiles[i+1]=(i>=headGlow?r.projectiles[i+1]-drop:8.5+(r.projectiles[i+1]-8.5)*scale)+lift;
}
function playerBipedHeight(g){
 // Tiny, blended walking settle instead of snapping down to the furthest contact's reach limit.
 g.height=19.8-.6*g.blend;
}
function updatePlayerBiped(){
 if(!p)return null;const x=p.x-325,z=(p.y-300)*1.06,seated=playerSeated(),mounted=playerMounted();let g=playerBipedGaits.get(p);
 if(!g||g.seated!==seated||g.mounted!==mounted||time<g.time||time-g.time>.15||Math.hypot(x-g.x,z-g.z)>65){g={time,x,z,seated,mounted,height:19.8,blend:0,next:0,legs:[-1,1].map(side=>({foot:[x+side*6,4,z],swing:null}))};playerBipedGaits.set(p,g);return g;}
 // Riders keep local foot contacts; ground-planted IK would interpret mount travel as walking.
 if(mounted){g.time=time;g.x=x;g.z=z;g.height=19.8;g.blend=0;for(let i=0;i<2;i++){g.legs[i].foot=[x+(i===0?-6:6),4,z];g.legs[i].swing=null;}return g;}
 const dt=time-g.time;if(dt<=0)return g;const vx=(x-g.x)/dt,vz=(z-g.z)/dt,speed=Math.hypot(vx,vz);g.time=time;g.x=x;g.z=z;
 const target=Math.min(1,speed/45),ease=1-Math.exp(-dt*14);g.blend+=(target-g.blend)*ease;if(target===0&&g.blend<.001)g.blend=0;
 for(let i=0;i<2;i++){const leg=g.legs[i];if(!leg.swing)continue;const q=leg.swing;
  if(speed<1){const settle=1-Math.exp(-dt*18),home=[x+(i===0?-6:6),4,z];q.to=q.to.map((v,j)=>v+(home[j]-v)*settle);}
  q.age=Math.min(q.duration,q.age+dt);const t=q.age/q.duration,u=t*t*(3-2*t);leg.foot=q.from.map((v,j)=>v+(q.to[j]-v)*u);leg.foot[1]+=Math.sin(t*Math.PI)*2;
  if(t>=1){leg.foot=[...q.to];leg.swing=null;}
 }
 playerBipedHeight(g);if(g.legs.some(l=>l.swing))return g;
 const moving=speed>1;
 const candidates=[g.next,1-g.next].map(i=>{const home=[x+(i===0?-6:6),4,z],leg=g.legs[i];return {i,home,leg,drift:Math.hypot(home[0]-leg.foot[0],home[2]-leg.foot[2])};}).sort((a,b)=>b.drift-a.drift);
 for(const {i,home,leg,drift}of candidates){
  // A small distance threshold releases the foot immediately: no cadence timer or long sticking phase.
  if(drift>(moving?7:.35)){const duration=moving?Math.max(.025,Math.min(.10,6/Math.max(40,speed))):.14,lead=moving?duration+2/Math.max(1,speed):0;
   leg.swing={from:[...leg.foot],to:[home[0]+vx*lead,4,home[2]+vz*lead],age:0,duration};g.next=1-i;break;
  }
 }
 return g;
}
function playerBipedLegPose(g,i){
 const hip=[g.x+(i===0?-6:6),g.height??19.8,g.z],foot=g.legs[i].foot,distance=Math.hypot(...foot.map((v,j)=>v-hip[j])),stretch=Math.max(1,(distance+.18)/16);
 const pose=solveSpiderLeg(hip,foot,7.5*stretch,8.5*stretch,[0,0,1]);pose.stretch=stretch;return pose;
}
function drawPlayerBiped(g){
 const r=renderer,trim=shoes?WEAPON_GRADES[shoes.tier].color:'#4bdcb0';
 // Dark trousers with a fine mint outer seam; chunky teal boots with pale straps and toe caps.
 r.box(g.x,(g.height??19.8)+1,g.z,17,4,11,'#142a29');
 for(let i=0;i<2;i++){const q=playerBipedLegPose(g,i),foot=q.foot,side=i===0?-1:1;
  const thin=1/Math.sqrt(q.stretch);r.sphere(...q.hip,3.6,'#172b2b');drawSpiderStrut(q.hip,q.knee,6.5*thin,'#172b2b');r.sphere(...q.knee,3.5*thin,'#1a3030');drawSpiderStrut(q.knee,foot,5.8*thin,'#172b2b');
  const seamStart=r.count,edge=a=>[a[0]+side*3.1*thin,a[1],a[2]+1.8*thin];drawSpiderStrut(edge(q.hip),edge(q.knee),.6,'#40dfa8');drawSpiderStrut(edge(q.knee),edge(foot),.6,'#40dfa8');r.markEmissive(seamStart);
  drawPlayerBoot(...foot,side,trim);
 }
}
function drawPlayerBoot(fx,fy,fz,side,trim){
 const r=renderer;
 // Compact front-facing shoe: the entire sole is bounded to -3 heel / +6 toe from the ankle.
 r.box(fx,fy-.7,fz+1.5,8.5,2.2,9,'#15272c');r.box(fx,fy+1.5,fz+1,8.2,4,7,'#329e9a');r.box(fx,fy+3,fz,7.6,4,6,'#329e9a');r.sphere(fx,fy+.8,fz+3.5,1,'#88bdb0',4,1.9,2.5);
 r.box(fx,fy+5.2,fz,8.5,1.3,6,'#4b9e94');r.emissiveBox(fx,fy+5.9,fz+3,6.8,.5,.4,trim);
 for(const [height,forward]of [[1.8,4],[4,3]])r.box(fx,fy+height,fz+forward,6.5,1.2,.8,'#91c5b7');r.box(fx,fy+.5,fz-2.3,7.5,2,1.4,'#1c4a4a');r.sphere(fx+side*4,fy+2.2,fz,1,'#416e69',.3,1,1);
}
function drawPlayerHealthBar(x,y,z){trackWorldHealthBar(p,x,y,z,p.hp,p.max,Math.max(66,Math.min(100,p.max*11)),16,'#9de4c6');const r=renderer,width=Math.max(66,Math.min(100,p.max*11)),baseCell=(width-2*(p.max-1))/p.max,shieldCount=Math.ceil(p.shield),count=p.max+shieldCount,total=Math.min(140,width+shieldCount*(baseCell+2)),gap=Math.min(2,total/(count*4)),cell=(total-gap*(count-1))/count;r.box(x,y,z,total+4,20,2,'#102025');for(let i=0;i<p.max+shieldCount;i++){const xx=x-total/2+cell/2+i*(cell+gap),isShield=i>=p.max,fill=Math.max(0,Math.min(1,(isShield?p.shield:p.hp)-(isShield?i-p.max:i)));r.box(xx,y,z+1.6,cell,16,1,isShield?'#203e59':'#41534d');if(fill>0)r.emissiveBox(xx-cell*(1-fill)/2,y,z+2.3,cell*fill,16,1,isShield?(p.shieldHit>0?'#d9f7ff':'#55bcff'):'#9de4c6')}}

function monsterPose(x,y,z,yaw=0,sx=1,sy=1,sz=1){const c=Math.cos(yaw),s=Math.sin(yaw);return [c*sx,0,s*sz,x,0,sy,0,y,-s*sx,0,c*sz,z];}
function monsterBox(x,y,z,w,h,d,color,yaw=0,hit){renderer.residentMesh('monster-box:'+color,()=>{renderer.box(0,0,0,1,1,1,color);renderer.markPhosphor(0,.08);},monsterPose(x,y,z,yaw,w,h,d),hit);}
function monsterStrut(a,b,width,color,hit){const delta=b.map((v,i)=>v-a[i]),length=Math.hypot(...delta)||.001,axis=delta.map(v=>v/length),seed=Math.abs(axis[1])<.9?[0,1,0]:[1,0,0];let u=[axis[1]*seed[2]-axis[2]*seed[1],axis[2]*seed[0]-axis[0]*seed[2],axis[0]*seed[1]-axis[1]*seed[0]],n=Math.hypot(...u);u=u.map(v=>v/n*width);const v=[axis[1]*u[2]-axis[2]*u[1],axis[2]*u[0]-axis[0]*u[2],axis[0]*u[1]-axis[1]*u[0]],middle=a.map((v,i)=>(v+b[i])/2);renderer.residentMesh('monster-strut:'+color,()=>{renderer.box(0,0,0,1,1,1,color);renderer.markPhosphor(0,.07);},[u[0],delta[0],v[0],middle[0],u[1],delta[1],v[1],middle[1],u[2],delta[2],v[2],middle[2]],hit);}
function drawGoldSpider(e,carried=false){
 const r=renderer,x=e.x-325,z=(e.y-300)*1.06,hit=enemyHitFeedback(e),yaw=-e.heading+Math.PI/2,gait=(e.walkDistance||0)*.15,bob=Math.sin(gait*2)*.65;
 if(!carried)r.residentMesh('gold-spider-shadow',()=>r.ring(0,4,0,27,'#8b6b28',2),monsterPose(x,0,z));
 r.residentMesh('gold-spider-body',()=>{
  // Rigid gold armor plates, dark chassis, rear cash cassette and a sensor visor.
  r.box(0,21,0,32,12,38,'#283941');r.box(0,29,-2,38,11,32,'#dba732');
  r.box(0,36,-2,30,4,26,'#ffe18a');r.box(0,39,-2,18,2,14,'#b47b20');
  r.box(0,40,-2,11,1,3,'#fff2bd');r.box(0,40,-2,3,1,11,'#fff2bd');
  r.box(0,29,-24,29,17,12,'#a67424');r.box(0,39,-24,32,3,15,'#f3ce64');
  for(const side of [-1,1]){
   r.box(side*21,26,-3,6,12,30,'#8b6829');r.box(side*22,33,-3,7,3,31,'#f3ce64');
   for(const zz of [-12,0,12])r.box(side*24,27,zz,2,4,6,'#263b43');
   r.box(side*11,37,8,3,2,4,'#edf0c8');
  }
  r.box(0,27,23,27,14,15,'#c6922b');r.box(0,29,31,23,8,3,'#172d36');
  for(const side of [-1,1])r.emissiveBox(side*7,30,33,5,3,1,'#9bfff1');
  r.box(0,21,32,10,3,3,'#ffe6a0');r.box(0,20,-32,14,5,3,'#334b52');
  for(const xx of [-5,0,5])r.emissiveBox(xx,22,-34,2,2,1,'#ff9942');
  r.markPhosphor(0,.17);
 },monsterPose(x,bob,z,yaw),hit);
 const point=(a,b,c)=>[x+Math.cos(yaw)*a+Math.sin(yaw)*c,b,z-Math.sin(yaw)*a+Math.cos(yaw)*c];
 for(const side of [-1,1])for(let i=0;i<4;i++){
  const phase=gait+i*Math.PI*.65+(side<0?Math.PI:0)+e.seed,stride=Math.sin(phase)*7,lift=Math.max(0,Math.cos(phase))*8;
  const root=point(side*18,23+bob,(i-1.5)*9),knee=point(side*(33+Math.sin(phase)*3),25+bob,(i-1.5)*16+stride),foot=point(side*45,5+lift,(i-1.5)*22+stride);
  monsterStrut(root,knee,3.6,'#dba732',hit);monsterStrut(knee,foot,2.4,'#8d9b99',hit);
  const pistonStart=root.map((v,j)=>v*.7+knee[j]*.3+ (j===1?3:0)),pistonEnd=knee.map((v,j)=>v*.6+foot[j]*.4);
  monsterStrut(pistonStart,pistonEnd,1.1,'#f7e8b0',hit);
  for(const joint of [root,knee])r.residentMesh('gold-spider-joint',()=>{r.box(0,0,0,7,7,7,'#2a4148');r.box(0,4,0,3,1,3,'#f3ce64');},monsterPose(...joint,yaw),hit);
  r.residentMesh('gold-spider-foot',()=>{r.box(0,0,0,9,4,11,'#243b43');r.box(0,2,2,7,1,6,'#dba732');},monsterPose(...foot,yaw),hit);
 }
 if(!carried){drawPlaneVulnerability(e,x,z);drawMonsterHealthBar(x,61,z,e.hp,e.max,5,47,6,'#ffd45c',e);}
}
function starterSpitterPose(e,x,z,bob){return monsterPose(x,bob,z,Math.atan2(p.x-e.x,(p.y-e.y)*1.06));}
function drawStarterSpitterLights(e,pose){
 const r=renderer,at=(x,y,z)=>[pose[0]*x+pose[2]*z+pose[3],y+pose[7],pose[8]*x+pose[10]*z+pose[11]];
 // Shared feathered texture follows each lamp; saturated tints preserve its own color.
 for(const side of [-1,1]){
  r.glow(...at(side*4,29,16),7,'#16d6ed');
  r.glow(...at(side*19,14,-2),9,'#248aff');
 }
 for(const [x,y,z,length,width,color,opacity]of [[-4,29,16,155,72,'#16d6ed',.32],[4,29,16,155,72,'#16d6ed',.32],[0,20,28,130,48,e.warn?'#ff9a26':'#ff6a20',e.warn?.4:.28]])for(const vertical of [false,true]){
  const point=(u,edge)=>at(x+(vertical?0:edge*width),y+(vertical?edge*width*.45:0),z+length*u);
  r.softLightBeam([point(0,-1),point(1,-1),point(1,1),point(0,1)],color,opacity*(vertical?.45:1));
 }
 r.glow(...at(0,20,28),e.warn?10:7,e.warn?'#ff9a26':'#ff6a20');
 r.glow(...at(0,45,-4),4,'#ff8028');
}
function drawResidentEnemy(e,x,z,bob){const r=renderer,hit=enemyHitFeedback(e),pose=e.type==='spitter'?starterSpitterPose(e,x,z,bob):addedEnemyPose(e,x,z,bob);
 r.residentMesh('enemy:'+e.type+':'+e.r+':'+!!e.warn,()=>{const x=0,z=0,bob=0;
if(e.type==='builder'){drawBuilderGeometry();
}else if(ADDED_ENEMIES[e.type]){drawAddedEnemyGeometry(e.type,e.warn);
}else if(e.type==='crawler'){
 // Low armored chassis with paired track pods, segmented plating and a narrow sensor visor.
 r.box(0,13,0,26,16,28,'#344d60');r.box(0,23,-2,22,5,22,'#b1c1c7');r.box(0,26,-4,12,2,13,'#526d80');
 r.box(0,17,15,23,9,4,'#172e3e');r.emissiveBox(0,18,18,16,3,1,'#63e5ff');
 for(const side of [-1,1]){
  r.box(side*18,8,0,10,12,33,'#25333e');r.box(side*18,15,0,12,4,30,'#6d8694');
  for(const zz of [-12,-6,0,6,12])r.box(side*18,4,zz,11,3,3,'#4c5b67');
  r.emissiveBox(side*18,10,17,5,3,1,'#ffa064');r.box(side*9,25,8,4,2,8,'#e39455');
 }
 r.box(0,20,-16,14,6,3,'#1c2d3b');for(const xx of [-4,0,4])r.box(xx,21,-18,2,4,2,'#647d8b');
}else if(e.type==='spitter'){
 // Hover sentry: angular hull, side thruster pods and one forward pulse emitter.
 r.box(0,25,0,22,20,21,'#8fa6b8');r.box(0,37,-1,25,4,23,'#3f5b72');r.box(0,14,0,18,5,17,'#293e53');
 r.box(0,28,12,18,7,4,'#142b3e');r.emissiveBox(0,29,15,12,2,1,'#16d6ed');
 r.box(0,20,15,10,9,12,'#344a60');r.box(0,20,22,12,11,4,'#b5c4c9');
 r.box(0,20,25,8,7,2,'#182e40');r.emissiveBox(0,20,27,4,4,1,e.warn?'#ff9a26':'#ff6a20');
 for(const side of [-1,1]){
  r.box(side*19,25,-2,10,16,22,'#3b536b');r.box(side*19,34,-2,12,3,24,'#afbdc5');
  r.emissiveBox(side*19,15,-2,6,3,13,'#248aff');r.box(side*25,25,-2,2,9,13,'#d08a54');
 }
 r.box(0,41,-4,3,7,3,'#7593a9');r.emissiveBox(0,45,-4,4,2,4,'#ff8028');
}else if(e.type==='missile'){r.box(x,16+bob,z,27,20,25,'#506d72');for(const side of [-1,1]){r.box(x+side*16,28+bob,z,10,19,19,'#bacdca');r.box(x+side*16,28+bob,z+11,7,11,3,e.warn?'#ff754d':'#3b515b');r.box(x+side*16,36+bob,z+11,7,3,4,'#efb66e')}r.box(x,22+bob,z+15,12,7,4,'#223e46');r.emissiveBox(x,23+bob,z+18,8,3,1,'#ffb667')}
else if(e.type==='bomber'){r.sphere(x,22+bob,z,18,'#c85942',1,.9,1);r.box(x,25+bob,z+16,19,9,3,'#352d2a');r.emissiveBox(x,26+bob,z+18,10,4,1,'#ffb76b');for(const side of [-1,1]){r.box(x+side*15,7,z-10,8,12,8,'#56636a');r.box(x+side*15,7,z+10,8,12,8,'#56636a')}r.box(x,41+bob,z,14,4,10,'#7f4438')}
else if(e.type==='laser'){r.box(x,19+bob,z,26,25,22,'#65557b');r.box(x,31+bob,z,30,5,25,'#b7a7c6');r.sphere(x,21+bob,z+14,9,e.warn?'#ff675d':'#dc97f5',1,1,.35);r.glow(x,21+bob,z+18,5,e.warn?'#ff675d':'#d78bff')}
else if(e.type==='moth'){r.box(x,20+bob,z,14,24,14,'#b693cd');r.sphere(x,30+bob,z+7,7,'#f1d795')}
else if(e.type==='skull'){r.box(x,13,z,23,20,20,'#998770');r.sphere(x,29,z,18,'#dfceb0',1,.9,.83);r.box(x-7,30,z+13,8,8,5,'#303336');r.box(x+7,30,z+13,8,8,5,'#303336');r.box(x,21,z+14,19,5,4,'#9e8871');for(let k=-6;k<=6;k+=6)r.box(x+k,20,z+17,3,4,3,'#ece0c6')}
else{let boss=e.type==='boss',rad=e.r;r.sphere(x,rad+9+bob,z,rad,boss?'#a55746':'#b28666',1,1,.85);for(let i=0;i<6;i++){let a=i*TAU/6;r.box(x+Math.cos(a)*(rad+3),rad+9+bob+Math.sin(a)*rad,z,7,9,9,'#d4b792',a)}r.sphere(x,rad+12+bob,z+rad*.7,rad*.62,'#e6d0a5',1,1,.3);r.sphere(x,rad+12+bob,z+rad*.9,rad*.35,e.warn?'#ff7960':'#934b39',1,1,.3);r.sphere(x,rad+12+bob,z+rad,rad*.17,'#252b2c',1,1,.3)}
r.markPhosphor(0,.15);},pose,hit);
 if(e.type==='builder')drawBuilderWork(e,pose);
 if(e.type==='spitter')drawStarterSpitterLights(e,pose);
 if(e.type==='moth'){const fl=Math.sin(time*8)*.25;for(const side of [-1,1])monsterBox(x+side*19,23+bob,z,28,6,23,'#806895',side*(.5-fl),hit);}
 if(e.type==='laser')r.residentMesh('enemy-laser-base',()=>r.disc(0,4,0,17,'#222f35'),monsterPose(x,0,z),hit);
}


function drawMonsterHealthBar(x,y,z,hp,max,count=6,width=66,height=16,color='#9de4c6',owner=null){if(bossDeath)return;trackWorldHealthBar(owner,x,y,z,hp,max,width,height,color);
 const r=renderer,gap=2,cell=(width-gap*(count-1))/count;
 const box=(x,y,z,w,h,d,c,emissive=false)=>r.residentMesh('monster-health:'+c+':'+emissive,()=>emissive?r.emissiveBox(0,0,0,1,1,1,c):r.box(0,0,0,1,1,1,c),monsterPose(x,y,z,0,w,h,d));
 box(x,y,z,width+4,height+4,2,'#102025');for(let i=0;i<count;i++){const xx=x-width/2+cell/2+i*(cell+gap),fill=Math.max(0,Math.min(1,hp/max*count-i));box(xx,y,z+1.6,cell,height,1,'#41534d');if(fill>0)box(xx-cell*(1-fill)/2,y,z+2.3,cell*fill,height,1,color,true);}
}

function drawHealthBar(x,y,z,hp,max,count=6,width=66,height=16,col='#9de4c6'){const r=renderer,gap=2,cell=(width-gap*(count-1))/count;r.box(x,y,z,width+4,height+4,2,'#102025');for(let i=0;i<count;i++){const xx=x-width/2+cell/2+i*(cell+gap),fill=Math.max(0,Math.min(1,hp/max*count-i));r.box(xx,y,z+1.6,cell,height,1,'#41534d');if(fill>0)r.emissiveBox(xx-cell*(1-fill)/2,y,z+2.3,cell*fill,height,1,col)}}
// Procedural printed circuit pattern; cached with the floor geometry.
// The 24 real logarithmic FFT bands span the entire joined projection console.
function liftProjectionPoints(left,right,side){const start=side<0?0:12,points=[],amplitude=420;for(let i=0;i<12;i++){const band=music.bands[start+i],strength=Math.pow(Math.max(0,Math.min(1,(band-.1)/.7)),2.4);points.push([left+(i+.5)*(right-left)/12,9+strength*amplitude])}return points}
function drawLiftWaveforms(wallZ,span){const r=renderer,energy=music.projectionEnergy||0,z=wallZ+14,leftEdge=-span+35,rightEdge=span-35;
// Grounded rear-edge console: physical footings, solid bars and supported sign.
r.box(0,5.6,z,rightEdge-leftEdge,7,24,'#283e44');r.emissiveBox(0,9.3,z+10,rightEdge-leftEdge,1.2,2,'#3c8b8e');
for(let i=0;i<24;i++){const x=leftEdge+(rightEdge-leftEdge)*i/24,next=leftEdge+(rightEdge-leftEdge)*(i+1)/24,a=Math.sin(i/24*Math.PI)*(.15+energy*.18),b=Math.sin((i+1)/24*Math.PI)*(.15+energy*.18);r.transparentQuad([x,9,z-10],[next,9,z-10],[next,230,z-10],[x,230,z-10],'#69cfd7',[a,b,0,0])}
for(const x of [-56,56]){r.box(x,5.6,z,28,7,28,'#4d6568');r.box(x,37,z,7,56,9,'#677f83');r.emissiveBox(x,37,z+5,1.5,50,1,'#3c8b8e')}
r.box(0,110,z,160,96,18,'#526a70');r.box(0,110,z+9.5,146,82,2,'#082229');r.box(0,64,z,166,4,20,'#718789');
for(const side of [-1,1]){const left=side<0?leftEdge:90,right=side<0?-90:rightEdge,points=liftProjectionPoints(left,right,side),width=(right-left)/12*.68;for(const [x,top] of points)drawSpectrumColumn(x,z,width,Math.max(2,top-9))}}
// One seamless emissive cuboid: every face shares the vertical color gradient.
function drawSpectrumColumn(x,z,width,height){const r=renderer,light=screenLighting(time).top,tint=light.map(v=>.18+v*.82),bottom=tint.map(v=>v*.2),sideTop=tint.map(v=>v*.95),top=light.map(v=>(.5+v*.5)*.9),a=width/2,d=8,base=9,peak=base+height,v=[[x-a,base,z-d],[x+a,base,z-d],[x+a,peak,z-d],[x-a,peak,z-d],[x-a,base,z+d],[x+a,base,z+d],[x+a,peak,z+d],[x-a,peak,z+d]],faces=[[3,2,6,7],[4,5,1,0],[0,1,2,3],[5,4,7,6],[4,0,3,7],[1,5,6,2]];for(let f=0;f<faces.length;f++){const face=faces[f];for(const i of [face[0],face[1],face[2],face[0],face[2],face[3]])r.vertex(v[i],[0,2,0],f===0?top:v[i][1]===peak?sideTop:bottom)}}

function drawCircuitTile(x,z,gx,gy,developed){const r=renderer,flip=(gx+gy)%2?-1:1,col=developed?'#2b4540':'#20302f',pad=developed?'#486052':'#33433e',at=(u,v)=>[x+u*flip,2.22,z+v];const rect=(u,v,w,d,c=col)=>r.emissiveQuad(at(u-w/2,v-d/2),at(u+w/2,v-d/2),at(u+w/2,v+d/2),at(u-w/2,v+d/2),c);for(const offset of [-6,0,6]){rect(-15+offset,-11,1,20);rect(-9+offset,-1,12,1);rect(-3+offset,8,1,18);rect(7+offset,17,20,1);rect(17+offset,17,2.6,2.6,pad)}rect(10,-11,10,12,'#142421');for(const side of [-1,1])for(let i=0;i<3;i++)rect(10+side*7,-15+i*4,3,1.2,pad);rect(-20,-21,3,3,pad);rect(20,23,3,3,pad)}
// Logarithmic low-to-high bands from the actual BGM; kills only tint the peaks.
function spectrumHeight(x,span){return 8+music.spectrumAt((x+span-45)/(2*span-80))*520}
function screenWallPanels(scrollValue,height,bottom=-60){const offset=((scrollValue%SCREEN_PITCH)+SCREEN_PITCH)%SCREEN_PITCH,passed=Math.floor(scrollValue/SCREEN_PITCH),panels=[];for(let i=Math.floor((bottom-86-offset)/SCREEN_PITCH);i<=Math.ceil(height/SCREEN_PITCH);i++){const base=86+i*SCREEN_PITCH+offset;if(base+600>=bottom&&base-18<=height)panels.push({base,id:i-passed})}return panels}
// Invert the camera's projected vertical coordinate at the rear wall.
// Include below-platform shaft panels all the way to the viewport bottom.
function screenWallBounds(wallZ){const len=Math.hypot(700,440),cy=700/len,cz=440/len;return {bottom:(-renderer.halfY-60+cy*(wallZ+2))/cz,top:(renderer.halfY+60+cy*(wallZ+2))/cz}}
// One shared RGB wave drives screen pixels and their reflected scene light.
function screenRainbowColor(t,position){const h=((t/12)%1+1)%1;return [0,2/3,1/3].map(offset=>.08+.92*Math.max(0,Math.min(1,Math.abs(((h+offset)%1)*6-3)-1)))}
function rainbowHex(t,position,brightness=1){const quantized=Math.round(((t/12)%1+1)%1*120)/120;return '#'+screenRainbowColor(quantized*12,0).map(v=>Math.round(v*brightness*255).toString(16).padStart(2,'0')).join('')}
function screenLighting(t){const color=screenRainbowColor(Math.round(t/12*120)/120*12,0);return {left:color,right:color,top:color}}

// Straight RGB ribbons: bright heads, differently hued fading tails, no lateral waves.
const WATERFALL_LANES=[
 {speed:1280,offset:27,length:1080,cycle:5.2},
 {speed:1740,offset:483,length:1320,cycle:7.1},
 {speed:1440,offset:171,length:960,cycle:4.6},
 {speed:2040,offset:809,length:1200,cycle:6.3},
 {speed:1580,offset:342,length:1440,cycle:5.7},
 {speed:1360,offset:651,length:1032,cycle:4.1},
 {speed:1900,offset:296,length:1248,cycle:6.8}
];
function waterfallLane(u){return Math.min(6,Math.max(0,Math.floor(u*7)))}
function waterfallPhase(t,u,y){const lane=WATERFALL_LANES[waterfallLane(u)];return ((y+t*lane.speed+lane.offset)%lane.length+lane.length)%lane.length}
function waterfallColor(t,u,y){const column=waterfallLane(u),lane=WATERFALL_LANES[column],tail=waterfallPhase(t,u,y)/lane.length,brightness=(.055+.82*Math.pow(1-tail,2.3))*(.75+.25*music.spectrumAt(u)),h=t/12+.045*Math.sin(column*2+t*.18)-tail*.1;return screenRainbowColor(h*12,0).map(v=>v*brightness)}
function waterfallStreamBounds(t,index){const center=index/6+.13*Math.sin(t*(.17+index*.013)+index*2.1),width=(.29+(index%3)*.035)/3;return {left:center-width/2,right:center+width/2}}
function waterfallComposite(t,u,y){let color=screenLighting(t).top.map(v=>v*.36);for(let i=0;i<7;i++){const box=waterfallStreamBounds(t,i);if(u<box.left||u>box.right)continue;const lane=WATERFALL_LANES[i],tail=waterfallPhase(t,(i+.5)/7,y)/lane.length,alpha=.08+.84*Math.pow(1-tail,1.7),h=t/12+.045*Math.sin(i*2+t*.18)-tail*.1,glow=.3+.7*Math.pow(1-tail,.7)+music.spectrumAt(u)*.08,shade=screenRainbowColor(h*12,0);color=color.map((v,k)=>v*(1-alpha)+shade[k]*glow*alpha)}return color}
function drawSpectrumScreen(wallZ,span){
 const bounds=screenWallBounds(wallZ),left=-span+34,right=span-34,offset=((scroll%SCREEN_PITCH)+SCREEN_PITCH)%SCREEN_PITCH;
 const lanes=new Float32Array(28),hues=new Float32Array(8);
 for(let i=0;i<7;i++){const box=waterfallStreamBounds(time,i),lane=WATERFALL_LANES[i],flow=((time*lane.speed+lane.offset-offset)%lane.length+lane.length)%lane.length;lanes.set([box.left,box.right,lane.length,flow],i*4);hues[i]=((time/12+.045*Math.sin(i*2+time*.18))%1+1)%1;}
 renderer.setWaterfall(wallZ+2,left,right,bounds.bottom,bounds.top,lanes,hues,screenLighting(time).top.map(v=>v*.36),music.bands);
}
// The clock shares the music analyser with the stage; no synthetic beat animation.
function drawRainbowClock(){
 const host=$('survival-clock'),canvas=$('clock-spectrum');
 const world=typeof StreetScene!=='undefined'&&StreetScene.enabled&&StreetScene.place==='abyss',preview=world&&typeof sceneLab!=='undefined'&&sceneLab&&state==='combat'&&!timedRoom&&!greedRoom&&!survivalRemaining;
 if(host)host.style.visibility=world?'hidden':'';
 if(world)StreetScene.worldClockState=null;
 if(!host||(!preview&&host.style.display==='none')||!canvas||typeof canvas.width!=='number')return;
 const c=canvas.getContext('2d');if(!c)return;
 const size=world?512:Math.round(host.getBoundingClientRect().width*Math.min(window.devicePixelRatio||1,2));
 if(!size)return;if(canvas.width!==size){canvas.width=size;canvas.height=size;}
 c.setTransform(size/200,0,0,size/200,0,0);c.clearRect(0,0,200,200);
 const remaining=preview?28.9:timedRoom?.remaining??greedRoom?.remaining??survivalRemaining;
 const duration=preview?30:timedRoom?.duration??(greedRoom?drinkRoomDuration(GREED_TIME):drinkRoomDuration(SURVIVAL_TIME));
 const fraction=Math.max(0,Math.min(1,remaining/Math.max(.001,duration)));
 const point=(a,r)=>[100+Math.cos(a)*r,100+Math.sin(a)*r];
 const line=(a,r1,r2,color,width)=>{c.beginPath();c.moveTo(...point(a,r1));c.lineTo(...point(a,r2));c.strokeStyle=color;c.lineWidth=width;c.stroke();};
 const start=-Math.PI/2,edge=start+TAU*(1-fraction);
 // Only remaining time is painted. Elapsed time has zero alpha, revealing the stage.
 if(fraction>0){
  const rainbow=world?c.createLinearGradient(35,100,165,100):c.createConicGradient(start,100,100);
  if(world){rainbow.addColorStop(0,'#7024db');rainbow.addColorStop(.45,'#a742ca');rainbow.addColorStop(.7,'#df727d');rainbow.addColorStop(1,'#ffb15a');}else for(let i=0;i<=6;i++)rainbow.addColorStop(i/6,'hsl('+(i*60)+' 100% 55%)');
  c.beginPath();c.moveTo(100,100);c.arc(100,100,73,edge,start+TAU);c.closePath();
  c.fillStyle=rainbow;c.fill();
 }
 // Hue closes smoothly at twelve o'clock; both halves mirror low to high bins.
 c.lineCap='round';
 for(let i=0;i<72;i++){
  const u=i/72,a=u*TAU-Math.PI/2,energy=music.spectrumAt(1-Math.abs(u*2-1));
  line(a,78,81+Math.min(1,Math.max(0,energy))*16,world?'hsl('+(275+(.5+.5*Math.sin(u*TAU))*115)+' 95% 68%)':'hsl('+(u*360)+' 94% 60%)',2.5);
 }
 c.lineCap='butt';
 for(let i=0;i<60;i++)if(i/60>=1-fraction)line(i/60*TAU+start,i%5===0?63:67,71,i%5===0?'#ffffffed':'#ffffffa0',i%5===0?1.6:1);
 if(fraction>0){
  c.beginPath();c.arc(100,100,73,edge,start+TAU);c.strokeStyle='#ffffff88';c.lineWidth=.8;c.stroke();
  if(fraction<1)line(edge,0,73,'#ffffffed',1.3);
 }
 if(world){
  c.textAlign='center';c.textBaseline='middle';c.shadowColor='#12172a';c.shadowBlur=5;c.fillStyle='#ffe9da';c.font='600 10px "Microsoft YaHei",sans-serif';c.fillText(preview?'存活倒计时':$('survival-label').textContent,100,67);c.font='bold 36px Georgia,serif';c.fillText(remaining.toFixed(1),100,103);c.font='600 11px sans-serif';c.fillText('秒',100,132);c.shadowBlur=0;StreetScene.worldClockState=canvas;
 }

}
function draw(dt=1/60){if(globalThis.TitleScene?.draw(state,renderer,grid,tiles))return;syncBossHealth();$('time-stop').style.display=timeSlowed()&&!paused?'block':'none';$('shield-hud').textContent='护盾 '+p.shield+'/'+shieldMaximum();if(!renderer.ready||renderer.gl.isContextLost())return;if(!paused)music.sampleSpectrum(dt);drawRainbowClock();let r=renderer;r.sceneGrade=0;r.sceneFogDensity=0;const lights=screenLighting(time);r.clubCyan=.82;r.clubMagenta=.82;r.rearLeftColor=lights.left;r.rearRightColor=lights.right;r.topLight=lights.top;const street=typeof StreetScene!=='undefined'&&StreetScene.enabled;if(street)StreetScene.lighting(r);else {r.cameraScale=1;r.scenePerspective=false;}r.begin();syncGrid();turrets.forEach(syncTurretEdge);let jx=Math.sin(time*143)*shake*.5,jy=Math.sin(time*179)*shake*.7;if(state==='landing')jy+=Math.sin(landingAge*35)*24*Math.exp(-landingAge*5);r.cameraJolt(jx,jy);const X=x=>x-325,Z=y=>(y-300)*1.06;
const sceneKey=(street?'street-'+StreetScene.revision+'|':'')+tiles.map(t=>t.x+','+t.y+','+(t.medical?1:t.shieldTile?2:t.cashTile?3:t.shockTile?4:0)).join(';')+'|'+[grid.minX,grid.maxX,grid.minY,grid.maxY].join(',');if(renderer.sceneKey!==sceneKey){
if(street){StreetScene.build(renderer,grid,tiles);}else{
// Fully solid panels use brightness to distinguish unlocked and locked cells.
for(let gy=grid.minY;gy<=grid.maxY;gy++)for(let gx=grid.minX;gx<=grid.maxX;gx++){const floorStart=renderer.count,x=gx*TILE,z=gy*TILE*1.06,developed=hasTile(gx,gy),medical=tiles.some(t=>t.x===gx&&t.y===gy&&t.medical),shield=tiles.some(t=>t.x===gx&&t.y===gy&&t.shieldTile),money=tiles.some(t=>t.x===gx&&t.y===gy&&t.cashTile),shock=tiles.some(t=>t.x===gx&&t.y===gy&&t.shockTile);renderer.box(x,-2,z,TILE,8,TILE*1.06,'#18262b');const surfaceStart=renderer.count;renderer.box(x,1.9,z,TILE-.8,.4,TILE*1.06-.8,medical?'#356858':shield?'#31566c':money?'#54513a':shock?'#294e60':developed?'#3b4745':'#19252a');if(developed)renderer.markPhosphor(surfaceStart);if(!medical&&!shield&&!money&&!shock)drawCircuitTile(x,z,gx,gy,developed);if(!developed){for(const side of [-1,1]){renderer.box(x+side*(TILE/2-1.5),2.35,z,1.3,.5,TILE*1.06-2,'#4a5355');renderer.box(x,2.35,z+side*(TILE*1.06/2-1.5),TILE-2,.5,1.3,'#4a5355')}}if(medical){renderer.box(x,3.8,z,24,1,7,'#bcefcf');renderer.box(x,3.8,z,7,1,24,'#bcefcf')}if(money)drawDollar(gx*TILE,3.9,gy*TILE*1.06,.85);if(shield){renderer.box(x,3.8,z-3,22,1,15,'#a6dcf1');renderer.box(x,3.8,z+8,14,1,7,'#a6dcf1');renderer.box(x,3.8,z+14,5,1,5,'#a6dcf1')}renderer.markFloor(floorStart)}
// The grid spans the viewport; its upper edge is the base of the actual rear wall.
const gridEdge=(grid.maxX+.5)*TILE,backEdge=(grid.minY-.5)*TILE*1.06,frontEdge=(grid.maxY+.5)*TILE*1.06,wallThickness=18,wallHeight=Math.max(950,renderer.halfY*3.2);
for(const side of [-1,1]){const x=side*(gridEdge+wallThickness/2);renderer.box(x,55, (backEdge+frontEdge)/2,wallThickness,150,frontEdge-backEdge+wallThickness,'#4b6261');renderer.box(side*(gridEdge-2),1,(backEdge+frontEdge)/2,3,3,frontEdge-backEdge,'#3d5150')}
renderer.box(0,0,backEdge-wallThickness/2,gridEdge*2+wallThickness*2+64,wallHeight*2,wallThickness,'#07150f');renderer.box(0,1,backEdge+1,gridEdge*2,3,3,'#3d5150');
// The rear-edge console and floor counter have physical ground supports.
// Wall-mounted guide rails, roller shoes and low perimeter skirt read as a working lift.
for(const side of [-1,1]){const x=side*(gridEdge-24);renderer.box(x,0,backEdge+6,9,wallHeight*2,8,'#3f5359');renderer.box(x,0,backEdge+11,3,wallHeight*2,3,'#7b8b8b');renderer.box(x,30,backEdge+18,25,54,18,'#283c42');renderer.box(x,31,backEdge+28,15,38,4,'#566963');for(const y of [17,45])renderer.sphere(x,y,backEdge+33,9,'#a0aaa0',1,1,.4);renderer.box(side*(gridEdge-10),22,frontEdge-7,12,44,12,'#405756');renderer.box(side*(gridEdge-10),46,frontEdge-7,15,5,15,'#857854')}
renderer.box(0,-8,frontEdge-4,gridEdge*2,18,10,'#293b40');renderer.box(0,3,frontEdge-4,gridEdge*2,4,11,'#4e6262');for(let x=-gridEdge+12;x<gridEdge-12;x+=34){renderer.box(x,-7,frontEdge+2,16,8,1.5,'#8a7c50',-.5);renderer.box(x+17,-7,frontEdge+2,16,8,1.5,'#192a30',-.5)}
for(const side of [-1,1]){renderer.box(side*45,22,frontEdge-5,4,44,4,'#68796e');renderer.box(side*45,43,frontEdge-5,8,5,8,'#9a8854')}renderer.box(0,20,frontEdge-5,16,9,6,'#64756c');renderer.box(0,20,frontEdge,5,4,2,'#b5a270');
// Site-lift guardrails follow all four outer edges, never cross the playable centre.
for(const z of [backEdge+5,frontEdge-5]){renderer.box(0,34,z,gridEdge*2-10,3.2,3.2,'#8a805b');renderer.box(0,17,z,gridEdge*2-10,2.2,2.2,'#66726a');for(let x=-gridEdge+8;x<=gridEdge-8;x+=TILE*1.5)renderer.box(x,17,z,3,34,3,'#67766d')}
for(const side of [-1,1]){let x=side*(gridEdge-5);renderer.box(x,34,(backEdge+frontEdge)/2,3.2,3.2,frontEdge-backEdge-10,'#8a805b');renderer.box(x,17,(backEdge+frontEdge)/2,2.2,2.2,frontEdge-backEdge-10,'#66726a');for(let z=backEdge+8;z<=frontEdge-8;z+=TILE*1.5)renderer.box(x,17,z,3,34,3,'#67766d')}
}
renderer.sceneData=renderer.data.slice(0,renderer.count);renderer.sceneKey=sceneKey;renderer.count=0;}
r=renderer;
// Wall-mounted RGB waterfall panels keep their shaft position during descent.
const wallZ=(grid.minY-.5)*TILE*1.06,span=(grid.maxX+.5)*TILE;if(street)StreetScene.draw(r,grid,time);else{drawSpectrumScreen(wallZ,span);drawLiftDisplay(wallZ);
// Real audio oscilloscopes flank the retained centre floor counter.
drawLiftWaveforms(wallZ,span);}
drawTerrainChange();drawCoverTiles();drawShockTiles();drawTerrainEffects();drawCashShovels();const floorBeat=music.bass;for(const t of tiles)if(!t.medical&&!t.shieldTile&&!t.cashTile&&!t.shockTile&&!t.coverTile&&!t.trap&&!t.saw&&!t.flywheel){const x=t.x*TILE,z=t.y*TILE*1.06;r.emissiveQuad([x+18,2.3,z+21],[x+21,2.3,z+21],[x+21,2.3,z+24],[x+18,2.3,z+24],floorBeat>.55?'#446254':'#263e35')}

for(const t of tiles)if(t.medical||t.shieldTile||t.cashTile){const x=t.x*TILE,z=t.y*TILE*1.06,active=t.cashTile||t.healProgress>0,ready=t.medPack;if(t.cashTile&&!cashTilesEnabled()){r.ring(x,5,z,18,'#52616a',2);r.emissiveBox(x,5,z,30,.5,2,'#52616a',Math.PI/4);continue;}if(productionMultiplier(t)>1)r.ring(x,4.1,z,18,'#78dca9',1);if(active)r.emissiveSquareScan(x,z,TILE-3,TILE*1.06-3,Math.min(1,t.cashTile?1-(t.healProgress||0)/supplyTime(t):t.healProgress/supplyTime(t)),t.cashTile?(ready?'#777360':'#625f50'):t.shieldTile?(ready?'#627b8a':'#506570'):(ready?'#698577':'#566e60'));if(t.healFlash>0)r.emissiveSquareScan(x,z,TILE-3,TILE*1.06-3,1,t.cashTile?'#85806d':t.shieldTile?'#748b99':'#788f7f');const px=t.pickup?t.pickup.x-325:x,pz=t.pickup?(t.pickup.y-300)*1.06:z;if(ready&&t.cashTile&&!(terrainQueue(t)[0]?.amount>=8)){drawBanknote(px,7,pz,time*4.8,1.25,.15)}else if(ready&&t.cashTile){}else if(ready&&t.medical&&['adrenaline','nutrition'].includes(terrainQueue(t)[0]?.kind)){}else if(ready&&t.shieldTile&&terrainQueue(t)[0]?.kind==='shock'){}else if(ready&&t.shieldTile){drawShieldPickup(px,5.5+Math.sin(time*3+t.x)*.3,pz,time*1.6)}else if(ready){const y=12.5+Math.sin(time*3+t.x)*.3,a=time*1.6,hx=px-Math.sin(a)*11,hz=pz-Math.cos(a)*11;r.box(px,y,pz,32,14,26,'#eaf3ed',a);r.box(px,y+7.8,pz,34,2,28,'#ffffff',a);r.emissiveBox(px,y+9.2,pz,24,1,7,'#ff3030',a);r.emissiveBox(px,y+9.2,pz,7,1,22,'#ff3030',a);r.box(hx,y+11,hz,15,3,3,'#527c68',a);r.box(px,y-4,pz,33,3,27,'#568a72',a)}}


for(const t of tiles){if(terrainHidden(t))continue;const x=t.x*TILE,z=t.y*TILE*1.06;if(t.trap){const phase=trapPhase(t),live=['combat','survival'].includes(state),warn=live&&phase==='warning',active=live&&phase==='active';r.box(x,2.6,z,TILE-4,.6,TILE*1.06-4,'#283132');if(warn){const flash=Math.floor(t.trap.clock*8)%2===0;r.emissiveBox(x,4.3,z,TILE-5,.4,TILE*1.06-5,flash?'#ff2424':'#9b1717');r.emissiveBox(x,4.9,z-5,5,.4,17,'#ffffff');r.emissiveBox(x,4.9,z+10,5,.4,5,'#ffffff')}for(const dx of [-15,0,15])for(const dz of [-15,0,15]){r.box(x+dx,3.4,z+dz,8,.8,8,'#101d21');if(active){const height=22*Math.min(1,((t.trap.clock%TRAP_CYCLE)-TRAP_ACTIVE)/.08);r.spike(x+dx,4,z+dz,5,height,'#ffffff')}}}}
for(const t of tiles)if(t.saw&&!terrainHidden(t)&&(!t.orbitSaw||ORBIT_SAW_ENABLED)){const at=sawPosition(t),cx=t.x*TILE,cz=t.y*TILE*1.06,x=X(at.x),z=Z(at.y),scale=t.orbitSaw?1.15:1;r.box(cx,2.6,cz,TILE-4,.5,TILE*1.06-4,'#392c2d');if(t.orbitSaw){const dx=x-cx,dz=z-cz,a=Math.atan2(dz,dx);r.ring(cx,3.5,cz,SAW_ORBIT_RADIUS,'#876452',1);r.box((x+cx)/2,7,(z+cz)/2,Math.hypot(dx,dz),5,7,'#69777a',-a);r.box((x+cx)/2,10,(z+cz)/2,Math.hypot(dx,dz)-8,1,2,'#c5a66e',-a);r.sphere(cx,9,cz,9,'#8d6a55',1,.6,1)}r.disc(x,4.5,z,17*scale,'#aeb9b8');r.ring(x,4.7,z,14*scale,'#4b5c61',Math.max(.8,2*scale));for(let i=0;i<12;i++){const a=time*11+i*TAU/12;r.box(x+Math.cos(a)*18*scale,5,z+Math.sin(a)*18*scale,9*scale,3,5*scale,'#edf4ed',-a)}r.box(x,5.2,z,26*scale,1,3*scale,'#485b61',-time*11);r.sphere(x,6,z,5*scale,'#d4a27d',1,.45,1)}

for(const t of tiles)if(t.flywheel&&!terrainHidden(t)){const w=t.flywheel,cx=t.x*TILE,cz=t.y*TILE*1.06,x=X(w.x),z=Z(w.y),horizontal=w.axis==='x';r.box(cx,2.6,cz,TILE-4,.6,TILE*1.06-4,'#392d25');r.emissiveBox(cx,3.2,cz,horizontal?32:3,.4,horizontal?3:32,'#c89155');for(const side of [-1,1]){r.box(cx+(horizontal?side*13:0),3.4,cz+(horizontal?0:side*13),8,.5,3,'#dfa663',horizontal?-side*.65:Math.PI/2-side*.65)}r.disc(x,7,z,20,'#879da2');r.ring(x,7.3,z,16,'#293d44',2);for(let i=0;i<14;i++){const a=time*13+i*TAU/14;r.box(x+Math.cos(a)*21,8,z+Math.sin(a)*21,9,3,5,'#f1f6f3',-a)}r.box(x,8.6,z,31,1,4,'#354d56',-time*13);r.emissiveBox(x,10,z,9,2,9,'#ffaf55',-time*13);r.glow(x,11,z,5,'#ffaf55')}

for(const edge of new Set(turrets.map(t=>t.edge))){const vertical=edge==='left'||edge==='right',x=vertical?(edge==='left'?A.x+24:A.x+A.w-24)-325:0,z=vertical?Z(A.y+A.h/2):Z(edge==='bottom'?A.y+A.h-24:A.y+24);r.box(x,6,z,vertical?9:A.w-60,4,vertical?(A.h-60)*1.06:9,'#28383b');r.box(x,8.5,z,vertical?3:A.w-64,1,vertical?(A.h-64)*1.06:3,'#69766e')}
for(const t of turrets){if(terrainHidden(t))continue;if(t.warn)r.ring(X(t.x),3,Z(t.y),24,Math.floor(time*8)%2?'#cf5b43':'#67352e',2);const x=X(t.x),z=Z(t.y),a=(t.rounds||(t.kind==='laser'&&t.laserMode!=='idle'))?t.aim:Math.atan2(p.y-t.y,p.x-t.x);r.box(x,8,z,30,12,30,'#303b3f');r.box(x,21,z,22,18,22,t.kind==='laser'?'#645477':'#73534a');r.box(x+Math.cos(a)*15,25,z+Math.sin(a)*15,32,7,7,'#29383d',-a);r.box(x,33,z,8,3,8,t.warn?'#ff6d52':'#b77755');r.glow(x,35,z,t.warn?8:4,t.warn?'#ff6d52':'#b77755');if(t.kind!=='laser'){r.box(x,42,z,14,10,3,'#6c735f');r.box(x-5,44,z+2,2,7,2,'#d9c693');r.box(x+5,44,z+2,2,7,2,'#d9c693');r.box(x,47,z+2,10,2,2,'#d9c693')}}
for(const e of [...turrets,...enemies])if(e.kind==='laser'||e.type==='laser')drawLaser(e);
for(const h of hazards)drawBossHazard(h);
if(droneSaws.length)drawDroneSaws();
// Depth-buffered low-poly enemies.
drawEnemyTransports();
for(const e of (bossDeath?(bossDeath.age<.055?bossDeath.bodies:[]):enemies)){if(e.transport)continue;if(e.type==='fishSchool'){drawFishSchool(e);continue}if(e.type==='goldSpider'){drawGoldSpider(e);continue}if(e.type==='ufoBoss'||e.type==='ufoMinion'){drawUFOEnemy(e);continue}if(e.type==='droneMinion'){drawDroneMinion(e);continue}if(e.type==='droneBoss'){drawDroneBoss(e);continue}if(e.type==='humanoid'){drawHumanoidBoss(e);continue}if(e.type==='virus'){drawVirusBoss(e);continue}if(e.type==='snake'){drawSnakeSegment(e);continue}let x=X(e.x),z=Z(e.y),bob=Math.sin(time*3+e.seed)*2;r.residentMesh('enemy-shadow:'+e.r,()=>r.ring(0,5,0,e.r*.7,'#725d4a',1.5),monsterPose(x,0,z));if(e.warn){r.ring(x,3,z,e.r+8,'#f4a37a');r.glow(x,e.r+12+bob,z+e.r,6,'#ff795d')}
const modelStart=r.count,glowStart=r.projectileCount;
drawResidentEnemy(e,x,z,bob);
drawPlaneVulnerability(e,x,z);drawMonsterHealthBar(x,65+(e.type==='boss'?25:0),z,e.hp,e.max,e.type==='boss'?10:6,e.type==='boss'?64:44,6,'#ecae85',e)}
if(state!=='dead'&&shoes?.id==='spider')drawSpiderMech(X(p.x),Z(p.y));
if(state!=='dead'&&shoes?.id==='tentacle')drawTentacleMount();
const headSpring=updatePlayerHeadSpring(),biped=updatePlayerBiped();
if(p&&state!=='dead'&&!(p.inv>0&&!playerFaceHurt()&&Math.floor(time*15)%2===0)){const modelStart=r.count;let x=X(p.x),z=Z(p.y),walk=!['warpstar','vinyl','neonsword','smallplane','tentacle'].includes(shoes?.id)&&(Math.hypot(joy.x,joy.y)||Object.values(keys).some(Boolean))?Math.sin(time*15)*3:0;r.disc(x+3,2.25,z+5,17,'#45594e');r.disc(x+2,2.3,z+4,12,'#35493f');const riderStart=r.count,riderGlow=r.projectileCount;if(['sharkblimp','smallplane'].includes(shoes?.id)){drawSharkRiderLegs(x,z);}else if(['spider','ufo'].includes(shoes?.id)){for(const side of [-1,1]){r.box(x+side*6,16,z+6,9,7,18,'#172b2b');r.box(x+side*6,9,z+15,8,12,8,'#172b2b');r.box(x+side*6,4,z+19,9,5,12,'#329e9a');r.box(x+side*6,2,z+19,10,1.5,13,'#15272c');r.box(x+side*6,6.8,z+21,7,1.4,7,'#91c5b7');}}else{drawPlayerBiped(biped);}const upperStart=r.count,upperGlow=r.projectileCount;r.box(x,18,z,14,19,11,'#d0ded0');r.box(x,19,z+6,9,9,2,'#62a997');r.box(x,19,z+8,4,4,2,'#b9ffdf');r.glow(x,19,z+9,3,'#85eac9');for(const side of [-1,1]){r.sphere(x+side*10,22,z,3.5,'#6faaa2');r.box(x+side*10,15,z-walk*side,5,12,7,'#c4d7cc');r.sphere(x+side*10,10,z-walk*side,3,'#5f8b86')}const headStart=r.count,headGlow=r.projectileCount;drawPlayerHeadHousing(x,z);drawPlayerFace(x,z);r.box(x,55,z,2,9,2,'#668b86');r.sphere(x,60,z,4,'#f4c67b');r.glow(x,60,z,4,'#ffd18c');transformPlayerHead(headStart,headGlow,x,z,headSpring);liftPlayerUpperBody(upperStart,upperGlow,headStart,headGlow);const targets=combatTargets();let target=targets.length?targets.reduce((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)<Math.hypot(b.x-p.x,b.y-p.y)?a:b):null,a=target?Math.atan2(target.y-p.y,target.x-p.x):Math.atan2(p.dy,p.dx);drawHeldWeapon(x,z,a);r.ring(x,3,z,7,'#8cffe9',2);r.sphere(x,12,z,3.5,'#b3fff1');r.markPhosphor(modelStart);transformSkateMesh(riderStart,riderGlow);liftSpiderRider(riderStart,riderGlow);scaleDrinkPlayer(riderStart,riderGlow);}
if(p&&state!=='dead')drawEquipmentModels();
if(p&&state!=='dead')drawPlayerHealthBar(X(p.x),91+playerUpperLift()-playerHeadDrop()+skateJumpHeight()+mountRiderLift(),Z(p.y));
for(const m of missiles){const x=X(m.x),z=Z(m.y);r.residentMesh('enemy-rocket',()=>{r.box(0,16,0,24,7,7,'#e6eee9');r.box(12,16,0,7,8,8,'#f15e46');r.box(-8,16,0,6,2,17,'#658a92');for(let i=1;i<=3;i++)r.glow(-(13+i*5),16,0,5-i,'#ffb55c');},monsterPose(x,0,z,-m.a),enemyHitFeedback(m));}
drawDrinks();drawBossDeath();for(const e of explosionFX){if(e.modelVisual)drawModelExplosion(e);else drawExplosionFX(e);}
if(state==='combat'){if(weapon.id==='rotor')drawRotor(weapon,p,'weapon');if(drone?.id==='rotor')drawRotor(drone,dronePosition(),'drone')}for(const s of shots){if(s.launchDelay>0)continue;const meshStart=r.count,glowStart=r.projectileCount;drawFriendlyShot(s);if(s.drinkScale>1&&!s.crescent)scaleDrinkPlayer(meshStart,glowStart,s.drinkScale,X(s.x),Z(s.y),s.height||12);}for(const b of bullets){if(b.lob){const u=Math.min(1,b.age/b.duration);r.emissiveRing(X(b.targetX),3,Z(b.targetY),33,'#ff683f',2);r.projectile(X(b.x),12+90*4*u*(1-u),Z(b.y),6,b.c);}else r.projectile(X(b.x),12,Z(b.y),b.drawRadius??b.r,b.c);}
for(const q of particles){if(q.juicyImpact)drawStarterImpact(q);else if(q.casing){const k=starterCaseScale(q);r.residentMesh('starter-brass-case',()=>{r.emissiveBox(0,0,0,5,2,2,'#ffcd63');r.emissiveBox(-2,0,0,.8,2.5,2.5,'#fff2b6');},monsterPose(X(q.x),Math.max(2,q.height),Z(q.y),q.angle,k,k,k));}else if(q.hitSpark)drawHitSpark(q);else if(q.banknote)drawBanknote(X(q.x),Math.max(5,q.height),Z(q.y),q.angle,banknoteScale(q),Math.sin(time*5+q.flutter)*.3);else if(q.chunk)drawCoolingChunk(q);else r.box(X(q.x),7,Z(q.y),3,3,3,q.c)}
drawDeathBursts();drawHealthBarShards();globalThis.TalentRuntime?.draw();r.end();renderCashPopups();renderSkateCooldown();renderDrinkDarkness()}
let last=performance.now();function loop(t){const probe=typeof gamePerf==='undefined'?null:gamePerf;probe?.beginFrame(t);const frameDt=Math.max(0,(t-last)/1000),dt=Math.min(.035,frameDt);last=t;let rendered=false;try{if(!document.hidden&&renderer.ready&&!renderer.gl.isContextLost()){if(!paused)step(dt,state==='dead'?frameDt:dt);draw(dt);rendered=true}}finally{probe?.endFrame(rendered);requestAnimationFrame(loop)}}
function suspendGame(){testResume=false;Object.keys(keys).forEach(k=>keys[k]=false);releaseJoy();if(['combat','survival','bossIntro','descent','landing','stageClear','bossDying'].includes(state)&&!paused)togglePause();syncMusic()}
function resumeRendering(){last=performance.now();if(renderer.ready&&!renderer.gl.isContextLost())renderer.resize();syncMusic()}
renderer.onContextLost=suspendGame;renderer.onContextRestored=resumeRendering;
window.addEventListener('pageshow',resumeRendering);window.addEventListener('focus',resumeRendering);
if(document.addEventListener)document.addEventListener('visibilitychange',()=>{if(document.hidden)suspendGame();else resumeRendering()});
window.addEventListener('keydown',e=>{if(e.key==='F2'){e.preventDefault();if(!e.repeat)openEquipmentTest();return}if($('equipment-test').hidden===false||['SELECT','INPUT'].includes(e.target?.tagName))return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();keys[e.key.toLowerCase().startsWith('arrow')?e.key:e.key.toLowerCase()]=true;if(e.key.toLowerCase()==='p')togglePause()});window.addEventListener('keyup',e=>keys[e.key.toLowerCase().startsWith('arrow')?e.key:e.key.toLowerCase()]=false);window.addEventListener('blur',suspendGame);
function togglePause(){if($('equipment-test').hidden===false)return;if(!['combat','survival','bossIntro','descent','landing','stageClear','bossDying'].includes(state))return;paused=!paused;if(!paused)unlockAudio();if(paused)releaseJoy();$('pause-panel').hidden=!paused;if(paused)$('viewport').classList.add('paused');else $('viewport').classList.remove('paused');clearTimeout(toast.timer);$('toast').classList.remove('show');syncMusic()}$('pause').onclick=togglePause;$('resume').onclick=()=>{if(paused)togglePause()};
const controls=$('viewport');
controls.addEventListener('pointerdown',e=>{if(e.target.closest('button,a,.overlay,.equipment-test,.perf-panel,.drinks-hud')||joy.id!==null||paused||!['combat','survival','bossIntro','descent','landing'].includes(state)||e.clientY<controls.getBoundingClientRect().top+controls.getBoundingClientRect().height*.42)return;unlockAudio();joy.id=e.pointerId;joy.sx=e.clientX;joy.sy=e.clientY;const bounds=controls.getBoundingClientRect();$('joy').style.left=(e.clientX-bounds.left)+'px';$('joy').style.top=(e.clientY-bounds.top)+'px';$('joy').style.display='block';controls.classList.add('dragging');controls.setPointerCapture(e.pointerId);e.preventDefault()},{passive:false});
window.addEventListener('pointermove',e=>{if(e.pointerId!==joy.id)return;let x=e.clientX-joy.sx,y=e.clientY-joy.sy,l=Math.hypot(x,y),power=Math.min(1,Math.max(0,(l-2)/62));joy.x=l?x/l*power:0;joy.y=l?y/l*power:0;$('joy').firstElementChild.style.transform=`translate(${joy.x*48}px,${joy.y*48}px)`;e.preventDefault()},{passive:false});
function releaseJoy(e){if(e&&e.pointerId!==joy.id)return;joy.id=null;joy.x=joy.y=0;$('joy').style.display='none';$('joy').firstElementChild.style.transform='';$('viewport').classList.remove('dragging')}
window.addEventListener('pointerup',releaseJoy);window.addEventListener('pointercancel',releaseJoy);controls.addEventListener('lostpointercapture',releaseJoy);
if($('sound-settings-open'))$('sound-settings-open').onclick=toggleSoundSettings;
if($('sound-settings-close'))$('sound-settings-close').onclick=toggleSoundSettings;
for(const kind of ['shot','hit','casing']){if($('sound-level-'+kind))$('sound-level-'+kind).oninput=e=>setSoundLevel(kind,Number(e.target.value)/100);if($('sound-preview-'+kind))$('sound-preview-'+kind).onclick=()=>previewSoundLevel(kind);}
if($('casing-sound-choice')){$('casing-sound-choice').innerHTML=['金属地面','混凝土地面'].map(group=>`<optgroup label="${group}">${CASING_SOUND_CLIPS.map((clip,i)=>clip.group===group?`<option value="${i}">${clip.name}</option>`:'').join('')}</optgroup>`).join('');$('casing-sound-choice').value=String(casingSoundIndex);$('casing-sound-choice').onchange=()=>{stopCasingAudition();chooseCasingSound($('casing-sound-choice').value);};}
if($('casing-sound-play'))$('casing-sound-play').onclick=()=>auditionCasingSound();
if($('casing-sound-prev'))$('casing-sound-prev').onclick=()=>auditionCasingSound(-1);
if($('casing-sound-next'))$('casing-sound-next').onclick=()=>auditionCasingSound(1);
syncSoundControls();
$('sound').onclick=()=>{sound=!sound;if(!sound)stopCasingAudition();for(const source of starterShotVoices)source.sampleGain.gain.setTargetAtTime(sound?soundLevels[source.sampleKind]:0,audio.currentTime,.015);if(sound){unlockAudio();beep(400,.15)}syncMusic();$('sound').textContent='声音 '+(sound?'ON':'OFF')};$('start').onclick=reset;
function modelBeamLength(origin,a){const dx=Math.cos(a),dy=Math.sin(a),tx=Math.abs(dx)<.00001?Infinity:((dx>0?A.x+A.w:A.x)-origin.x)/dx,ty=Math.abs(dy)<.00001?Infinity:((dy>0?A.y+A.h:A.y)-origin.y)/dy;return Math.max(0,Math.min(tx,ty));}
function weaponModelShopItem(){
 const tier=rollShopTier(),pool=WEAPON_MODELS.filter(m=>m.tier===tier),m=pool[Math.floor(Math.random()*pool.length)],equipment=rollEquipmentStats('weapon',createWeaponModel(m.id)),u={key:'weapon',amount:1,equipment,weapon:equipment,blindBox:true,opened:false};u.name=equipmentBoxName(u);u.desc=equipmentBoxDescription(u);return u;
}
function modelGrowthStage(e){return e?.growth?.stage||0;}
function setModelGrowth(e,value){
 if(!e?.growth)return;const g=e.growth,previous=g.stage;g.value=value;g.stage=g.kind==='kills'?(value>=20?2:value>=8?1:0):Math.min(2,Math.floor(value/12));
 if(g.stage!==previous){burst(p.x,p.y,e.visual.color,14);toast(e.name+' · 进化 '+(g.stage+1)+'/3',1.4);updateUI();}
}
function updateModelGrowth(dt){if(state==='combat'&&combatTargets().length&&weapon?.growth?.kind==='unhurt')setModelGrowth(weapon,Math.min(24,weapon.growth.value+dt));}
function modelWeaponHurt(){if(weapon?.growth?.kind==='unhurt')setModelGrowth(weapon,Math.max(0,weapon.growth.value-12));}
function onModelWeaponKill(s,e){if(s.source==='weapon'&&s.ownerItem?.growth?.kind==='kills'&&e.type!=='rocket'&&e.type!=='missile')setModelGrowth(s.ownerItem,Math.min(20,s.ownerItem.growth.value+1));}
function modelVisual(w){const stage=modelGrowthStage(w);return {...w.visual,size:w.visual.size*(w.familyId==='boomerang'?2:1)*(1+stage*.35),color:stage===2?'#a1f4ff':stage===1?'#4fe2ff':w.visual.color};}
function tagModelShots(start,w,source,delay=0){
 const v=modelVisual(w),g=modelGrowthStage(w);
 for(let i=start;i<shots.length;i++){const s=shots[i];s.evolution=v;s.ownerItem=w;s.color=v.color;if(source==='weapon'&&!s.electricRing)s.height=24+mountRiderLift();if(!s.beam&&Math.hypot(s.vx,s.vy)>0)s.life=Math.max(s.life,Math.hypot(A.w,A.h)/Math.hypot(s.vx,s.vy)+.2);if(s.boomerang){const origin=s.source==='drone'?dronePosition():p,targets=combatTargets(),nearest=targets.length?Math.min(...targets.map(e=>Math.hypot(e.x-origin.x,e.y-origin.y)+e.r)):220;s.returnRange=Math.max(220,nearest);s.life=Math.max(s.life,s.returnRange*2/Math.hypot(s.vx,s.vy)+.6);}s.hitRadius=s.hitRadius??(w.hitRadius||4);s.damage*=1+g*.45;s.life+=delay;s.launchDelay=(s.launchDelay||0)+delay;if(s.slash){s.slashRadius=w.slashRadius*(1+(w.tier-1)*.08);}if(s.crescent){s.waveRadius=w.waveRadius*v.size;}}
}
function emitModelWeapon(w,a,origin,source){
 const start=shots.length;
 if(w.zenith){
  const targets=combatTargets(),target=targets.length?targets.reduce((x,y)=>Math.hypot(x.x-origin.x,x.y-origin.y)<Math.hypot(y.x-origin.x,y.y-origin.y)?x:y):{x:origin.x+Math.cos(a)*250,y:origin.y+Math.sin(a)*250};
  const index=w.zenithSequence||0;w.zenithSequence=index+1;shots.push({zenith:true,bladeIndex:index%6,orbitDirection:index%6<3?1:-1,ellipseScale:.28+Math.random()*.72,ellipseTilt:(Math.random()-.5)*.8,launchHeight:24+mountRiderLift(),x:origin.x,y:origin.y,originX:origin.x,originY:origin.y,targetX:target.x,targetY:target.y,vx:0,vy:0,age:0,life:.45,launchDelay:0,aim:a,damage:w.damage*.18,pierce:99,hitRadius:9,hitTargets:new Set(),source,weaponId:w.id,height:24});
 }else if(w.sustain){const length=modelBeamLength(origin,a);shots.push({beam:true,sustain:true,modelHitAt:new WeakMap(),aim:a,x:origin.x+Math.cos(a)*length,y:origin.y+Math.sin(a)*length,originX:origin.x,originY:origin.y,vx:0,vy:0,life:.8,damage:w.damage*.45,pierce:99,hitRadius:12*w.visual.size,hitTargets:new Set(),source,weaponId:w.id,height:24});
 }else if(w.familyId==='sword'){
  emitSword(w,a,origin,source);
  if(w.pellets===2){const wave=shots.at(-1);shots.push({...wave,launchDelay:(wave.launchDelay||0)+.12,hitTargets:new Set()});}
 }else{
  for(let n=0;n<(w.burstCount||1);n++){const at=shots.length;emitWeaponShotsInternal(w,a,origin,source);if(w.familyId==='laser'){const length=modelBeamLength(origin,a),beam=shots.at(-1);beam.aim=a;beam.x=origin.x+Math.cos(a)*length;beam.y=origin.y+Math.sin(a)*length;}tagModelShots(at,w,source,n*.075);}
 }
 // Tag the special paths too; the common path is already tagged for its per-round delay.
 if(w.zenith||w.sustain||w.familyId==='sword')tagModelShots(start,w,source);
 if(w.electricRing){const radius=1.3*TILE;const targets=combatTargets().filter(e=>Math.hypot(e.x-origin.x,e.y-origin.y)<=radius+e.r);shots.push({beam:true,arc:true,radial:true,electricRing:true,arcTargets:targets,originX:origin.x,originY:origin.y,x:origin.x,y:origin.y,vx:0,vy:0,life:.4,age:0,damage:w.damage*.22,pierce:99,hitTargets:new Set(),source,weaponId:w.id,radius,height:9,evolution:modelVisual(w),ownerItem:w});}
 const profile=criticalProfile(w);for(let i=start;i<shots.length;i++){Object.assign(shots[i],profile);if(shots[i].blastRadius)shots[i].blastRadius*=shoes?.explosionRadiusMultiplier||1;}
 queueGunVisuals(w,start,source);
 if(w.itemId==='pistol_t1'&&source==='weapon')for(let i=start;i<shots.length;i++)ejectStarterCase(shots[i]);
 applyDrinkVolley(start,origin,source);
}
function queueGunVisuals(w,start,source){
 if(source!=='weapon'||['sword','boomerang'].includes(w.familyId))return;
 const events=(w.fireVisuals||[]).filter(e=>time-e.at<.3);for(let i=start;i<shots.length;i++){const s=shots[i];if(s.electricRing||s.secondaryCut)continue;events.push({at:time+(s.launchDelay||0),barrel:(w.familyId==='uzi'||w.dualWield)?(i-start)%2:w.familyId==='seeker'?i-start:0});}Object.defineProperty(w,'fireVisuals',{value:events.slice(-32),writable:true,configurable:true});
}
function modelGunKick(w,barrel=null){
 const distance=w.familyId==='rocket'?12+w.tier:w.familyId==='sniper'?10+w.tier*.8:w.familyId==='smg'?3+w.tier*.4:w.familyId==='rifle'?5+w.tier*.5:4+w.tier*.6;
 return Math.max(0,...(w.fireVisuals||[]).filter(e=>barrel===null||e.barrel===barrel).map(e=>{const age=time-e.at;if(age<0||age>.22)return 0;return distance*(age<.014?age/.014:Math.exp(-(age-.014)/.047));}));
}
function drawGunMuzzle(w,x,z,y,a,length){
 if(w.itemId==='pistol_t1'){drawStarterMuzzle(w,x,z,y,a,length);return;}
 const r=renderer,v=modelVisual(w),heavy=['sniper','rocket'].includes(w.familyId),life=heavy?.12:.1,dx=Math.cos(a),dz=Math.sin(a),nx=-dz,nz=dx;
 for(const e of w.fireVisuals||[]){const age=time-e.at;if(age<0||age>=life)continue;const fade=(1-age/life)**1.5,side=(w.familyId==='uzi'||w.dualWield)?(e.barrel?13:-13):w.familyId==='seeker'?(e.barrel-(w.pellets-1)/2)*7:0,muzzle=(w.familyId==='uzi'||w.dualWield)?32:w.familyId==='seeker'?24:23+length*.5,cx=x+dx*(muzzle+25)+nx*side,cz=z+dz*(muzzle+25)+nz*side,cy=y+mountRiderLift(),reach=(heavy?55:42)+w.tier*2,width=(heavy?15:11)+w.tier*.5,at=(u,v,h=0)=>[cx+dx*u+nx*v,cy+h,cz+dz*u+nz*v],color=w.tier>=3?v.color:'#ffd064';
  r.transparentQuad(at(-25,0),at(5,width),at(reach,0),at(4,-width),color,[0,fade*.72,fade*.2,fade*.72]);
  r.transparentQuad(at(-2,0,.15),at(5,width*.45,.15),at(reach*.76,0,.15),at(4,-width*.45,.15),'#fffbe1',[fade*.75,fade,fade*.5,fade]);
  for(const side of [-1,1])r.transparentQuad(at(0,0,.2),at(1,side*width*.4,.2),at(8,side*(width+7),.2),at(4,side*width*.15,.2),v.accent,[fade,fade*.7,0,fade*.5]);
  for(let i=0;i<3;i++){const angle=a+(i-1)*.6,travel=age*(110+i*55),sx=cx+Math.cos(angle)*travel,sz=cz+Math.sin(angle)*travel,len=4+fade*6;fxLine3([sx,cy+3+i,sz],[sx+Math.cos(angle)*len,cy+3+i,sz+Math.sin(angle)*len],i%2?v.accent:'#fff9cc',.9,fade*.8);}
  fxPuff(cx+dx*3,cy+.5,cz+dz*3,7,7,'#fff4be',fade*.9);r.glow(cx,cy,cz,(heavy?9:6)*fade,'#fff0b2');
 }
}
// Crisp asymmetric ink-like silhouettes on a camera-facing plane; no per-shot textures.
function juicyShape(x,y,z,points,color,alpha,scale=1,angle=0){
 const c=[x,y,z],cs=Math.cos(angle),sn=Math.sin(angle),at=([u,v])=>{const xx=(u*cs-v*sn)*scale,up=(u*sn+v*cs)*scale;return [x+xx,y+up*.532,z-up*.847];};
 for(let i=0;i<points.length;i++)renderer.transparentQuad(c,at(points[i]),at(points[(i+1)%points.length]),c,color,[alpha,alpha,alpha,alpha]);
}
const STARTER_FLASH=[[-13,0],[-4,3],[-9,13],[1,6],[5,25],[8,7],[27,1],[11,-3],[18,-11],[6,-6],[1,-17],[-2,-5]];
function drawStarterMuzzle(w,x,z,y,a,length){
 const dx=Math.cos(a),dz=Math.sin(a),muzzle=20.5+length*.5,cx=x+dx*muzzle,cz=z+dz*muzzle,cy=y+mountRiderLift();
 for(const e of w.fireVisuals||[]){const age=time-e.at;if(age<0||age>=.115)continue;const t=age/.115,fade=(1-t)**1.3,scale=(.85+Math.sin(Math.min(1,t*3)*Math.PI)*.28)*(1-t*.55),angle=Math.atan2(-dz*.847,dx);
  fxPuff(cx,cy,cz,23*fade,23*fade,'#ff9a28',fade*.32);
  juicyShape(cx,cy+.1,cz,STARTER_FLASH,'#ffad27',fade*.9,scale,angle);
  juicyShape(cx,cy+.25,cz,STARTER_FLASH,'#fff9d9',fade,scale*.64,angle);
  for(let i=0;i<4;i++){const theta=angle+i*2.1+e.at*17,travel=10+age*(150+i*28),xx=cx+Math.cos(theta)*travel,up=Math.sin(theta)*travel;juicyShape(xx,cy+up*.532,cz-up*.847,[[0,5],[1,0],[0,-3],[-1,0]],'#fff4b0',fade,fade*.7,theta);}
  fxPuff(cx,cy+.6,cz,46*fade,46*fade,'#ffb83f',.42);renderer.glow(cx,cy+.8,cz,25*fade,'#ffc95d');fxDisc(cx,cz,54*fade,'#ffb543',.3*fade,3.6);
 }
}
function starterCaseScale(q){return (.85+1.35*Math.exp(-(q.age||0)*5.5))*Math.max(0,Math.min(1,q.life/.25));}
function ejectStarterCase(s){
 if(particles.filter(q=>q.casing).length>=40)return;
 const a=Math.atan2(s.vy,s.vx),dx=Math.cos(a),dy=Math.sin(a),nx=-dy,ny=dx,v=220+Math.random()*90;
 particles.push({casing:true,x:p.x+dx*14+nx*6,y:p.y+dy*14+ny*6,vx:nx*v-dx*40,vy:ny*v-dy*40,height:26+mountRiderLift(),vz:170+Math.random()*35,life:1.7,age:0,angle:a,spin:(Math.random()<.5?-1:1)*(26+Math.random()*14),bounces:0});
}
const STARTER_IMPACTS=[
 [[-18,2],[-9,4],[-23,18],[-5,8],[-8,29],[3,9],[18,23],[9,6],[26,5],[11,-2],[18,-10],[5,-5],[-3,-10],[-4,-3]],
 [[-27,0],[-8,4],[-18,19],[-3,9],[4,30],[7,8],[25,14],[12,1],[21,-8],[5,-5],[-6,-22],[-7,-4]],
 [[-22,9],[-7,7],[-10,27],[1,10],[16,26],[8,5],[29,-2],[10,-4],[13,-20],[1,-8],[-17,-17],[-8,-2]],
 [[-29,-3],[-7,3],[-21,13],[-4,7],[-2,32],[4,10],[20,16],[10,3],[26,-10],[5,-4],[0,-19],[-4,-6]],
 [[-23,17],[-5,7],[2,29],[7,7],[24,22],[11,0],[30,-6],[8,-5],[12,-24],[0,-10],[-19,-14],[-9,-1],[-27,2]]
];
function drawStarterImpact(q){
 const t=Math.max(0,Math.min(1,1-q.life/q.maxLife)),x=q.x-325,z=(q.y-300)*1.06,y=q.height,size=1.4*1.3*(1-t**.7),splash=STARTER_IMPACTS[q.variant||0];
 fxPuff(x,y,z,27*size,24*size,'#ffb532',.42);
 juicyShape(x,y,z,splash,'#ff9b22',1,size,q.angle);
 juicyShape(x,y+.2,z,splash,'#ffe76d',1,size*.78,q.angle);
 juicyShape(x,y+.4,z,splash,'#fffdea',1,size*.48,q.angle);
 renderer.glow(x,y+.5,z,9*size,'#ffdc6c');
}
function starterKnockback(e,s){
 if(e.hp<=0||e.transport||isBossBody(e)||e.type==='boss'||e.type==='rocket'||!isAttackable(e))return;
 const speed=Math.hypot(s.vx,s.vy)||1;e.starterKick={x:s.vx/speed*210,y:s.vy/speed*210,left:.15};
}
function updateStarterKnockbacks(dt){
 for(const e of enemies){const kick=e.starterKick;if(!kick||e.hp<=0||e.transport)continue;const used=Math.min(dt,kick.left),decay=Math.exp(-14*used),travel=(1-decay)/14,ox=e.x,oy=e.y;e.x+=kick.x*travel;e.y+=kick.y*travel;resolveEnemyCover(e,ox,oy);if(Number.isFinite(e.homeX))e.homeX+=e.x-ox;if(Number.isFinite(e.homeY))e.homeY+=e.y-oy;kick.x*=decay;kick.y*=decay;kick.left-=used;if(kick.left<=1e-8)delete e.starterKick;
 }
}
function drawCoolingChunk(q){
 const heat=q.heatLeft>0?Math.round(Math.min(1,q.heatLeft/.42)*24)/24:0,hot=[255,139,46].map((v,i)=>v+([255,247,207][i]-v)*Math.max(0,(heat-.35)/.65)),base=renderer.color(q.c),color=heat>0?'#'+base.map((v,i)=>Math.round(v*255+(hot[i]-v*255)*heat).toString(16).padStart(2,'0')).join(''):q.c;
 const x=q.x-325,y=Math.max(4,q.height||4),z=(q.y-300)*1.06;
 if(heat>.04){renderer.emissiveBox(x,y,z,q.size,q.size,q.size,color,q.angle);renderer.glow(x,y,z,q.size*1.1*heat,color);}else renderer.box(x,y,z,q.size,q.size,q.size,color,q.angle);
}
function zenithPose(s,age){
 const dx=s.targetX-s.originX,dy=s.targetY-s.originY,distance=Math.max(80,Math.hypot(dx,dy)),a=Math.atan2(dy,dx),half=distance*.5,minor=(35+distance*.28)*(s.ellipseScale??1),tilt=s.ellipseTilt||0,cx=s.originX+Math.cos(a)*half,cy=s.originY+Math.sin(a)*half,vertical=minor*Math.sin(tilt),lift=vertical*vertical/24,phase=Math.min(1,age/.41)*TAU*(s.orbitDirection??(s.bladeIndex%6<3?1:-1)),u=-half*Math.cos(phase),v=minor*Math.sin(phase)*Math.cos(tilt),x=cx+Math.cos(a)*u-Math.sin(a)*v,y=cy+Math.sin(a)*u+Math.cos(a)*v;
 return {x,y,height:(s.launchHeight||24)+lift*(1-Math.cos(phase))+vertical*Math.sin(phase),angle:Math.atan2(y-cy,x-cx),age:Math.max(0,s.age-age)};
}
function smoothZenithTrail(s){
 const end=Math.min(.41,s.age),start=Math.max(0,end-.18),steps=Math.max(1,Math.ceil((end-start)/.41*TAU/.018));return Array.from({length:steps+1},(_,i)=>zenithPose(s,start+(end-start)*i/steps));
}
function advanceModelShot(s,dt){
 if(s.launchDelay>0){s.launchDelay-=dt;if(s.launchDelay>0)return false;dt=-s.launchDelay;}
 s.lastX=s.x;s.lastY=s.y;s.lastAim=s.aim;const origin=s.drinkOrigin||(s.source==='drone'?dronePosition():p);
 if(s.zenith&&!s.modelTrail)s.modelTrail=[];if(s.sustain){s.originX=origin.x;s.originY=origin.y;if(s.source==='weapon')s.height=24+mountRiderLift();const length=modelBeamLength(origin,s.aim);s.x=origin.x+Math.cos(s.aim)*length;s.y=origin.y+Math.sin(s.aim)*length;s.hitTargets.clear();}
 if(s.zenith){
  const steps=Math.max(1,Math.ceil(dt/.004));for(let i=0;i<steps;i++){s.age+=dt/steps;const t=Math.min(1,s.age/.41),pose=zenithPose(s,s.age);s.x=pose.x;s.y=pose.y;s.height=pose.height;s.aim=pose.angle;recordModelTrail(s,dt/steps);if(t>=.5&&!s.returning){s.returning=true;s.hitTargets.clear();}if(t>=1){s.life=0;break;}}
 }
 s.life-=dt;return true;
}
function onModelWeaponHit(s,e){
 const w=s.ownerItem;if(!w||s.secondaryCut)return;if(w.itemId==='pistol_t1')starterKnockback(e,s);
 if(w.doubleCut&&s.crescent){shots.push({beam:true,arc:true,radial:true,secondaryCut:true,slashFollow:true,arcTargets:[e],x:e.x,y:e.y,originX:e.x,originY:e.y,vx:0,vy:0,life:.24,launchDelay:.09,damage:s.damage*.5,pierce:1,hitTargets:new Set(),source:s.source,weaponId:w.id,height:s.height,ownerItem:w,evolution:s.evolution,radius:18});}
 if(w.splitLaser&&!s.splitChild&&!s.didSplit){s.didSplit=true;const targets=combatTargets().filter(q=>q!==e&&q.hp>0&&Math.hypot(q.x-e.x,q.y-e.y)<=190).sort((a,b)=>Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(b.x-e.x,b.y-e.y)).slice(0,2);for(const target of targets)shots.push({beam:true,splitChild:true,x:target.x,y:target.y,originX:e.x,originY:e.y,vx:0,vy:0,life:.16,damage:s.damage*.55,pierce:1,hitTargets:new Set([e]),hitRadius:6*w.visual.size,source:s.source,weaponId:w.id,height:s.height,ownerItem:w,evolution:s.evolution});}
}
function applyWeaponRecoil(w,a){
 if(!w.itemId||!['rocket','sniper'].includes(w.familyId))return;const distance=w.familyId==='rocket'?({3:30,4:44,5:60}[w.tier]||30):({2:23,3:38,5:54}[w.tier]||23),kick=distance*12*(1-.05*talentLevel('recoil'));
 p.weaponRecoilVX=(p.weaponRecoilVX||0)-Math.cos(a)*kick;p.weaponRecoilVY=(p.weaponRecoilVY||0)-Math.sin(a)*kick;const speed=Math.hypot(p.weaponRecoilVX,p.weaponRecoilVY);if(speed>900){p.weaponRecoilVX*=900/speed;p.weaponRecoilVY*=900/speed;}p.weaponRecoilAt=time;shake=Math.max(shake,w.tier>=5?6:3.5);
}
function updateWeaponRecoil(dt){
 const vx=p.weaponRecoilVX||0,vy=p.weaponRecoilVY||0;if(!vx&&!vy)return;const decay=Math.exp(-12*dt),travel=(1-decay)/12;walkFloor(p,p.x+vx*travel,p.y+vy*travel,7);p.weaponRecoilVX=Math.abs(vx*decay)<.5?0:vx*decay;p.weaponRecoilVY=Math.abs(vy*decay)<.5?0:vy*decay;
}
function recordModelTrail(s,dt){
 const history=s.modelTrail??=[];for(const q of history)q.age+=dt;while(history.length&&(history[0].age>(s.zenith?.18:.3)||history.length>=(s.zenith?96:36)))history.shift();history.push({x:s.x,y:s.y,height:s.height||24,angle:s.aim??Math.atan2(s.vy,s.vx),age:0});
}
function fxPuff(x,y,z,rx,ry,color,alpha){
 if(alpha<=0||rx<=0||ry<=0)return;const r=renderer,center=[x,y,z],at=a=>[x+Math.cos(a)*rx,y+Math.sin(a)*ry*.532,z-Math.sin(a)*ry*.847];for(let i=0;i<16;i++)r.transparentQuad(center,at(i*TAU/16),at((i+1)*TAU/16),center,color,[alpha,0,0,alpha]);
}
function fxCloud(x,y,z,rx,ry,color,alpha){
 const r=renderer,c=[x,y,z],at=(a,k)=>[x+Math.cos(a)*rx*k,y+Math.sin(a)*ry*.532*k,z-Math.sin(a)*ry*.847*k];for(let i=0;i<20;i++){const a=i*TAU/20,b=(i+1)*TAU/20;r.transparentQuad(c,at(a,.48),at(b,.48),c,color,[alpha,alpha*.86,alpha*.86,alpha]);r.transparentQuad(at(a,.48),at(a,1),at(b,1),at(b,.48),color,[alpha*.86,0,0,alpha*.86]);}
}
function fxDisc(x,z,radius,color,alpha,y=3.3){const r=renderer,c=[x,y,z],at=a=>[x+Math.cos(a)*radius,y,z+Math.sin(a)*radius];for(let i=0;i<32;i++)r.transparentQuad(c,at(i*TAU/32),at((i+1)*TAU/32),c,color,[alpha,0,0,alpha]);}
function drawModelTrail(s,blade=false){
 const h=blade?smoothZenithTrail(s):s.modelTrail||[],r=renderer,colors=['#45dfff','#ffcc45','#b585ff','#ff72b8','#70ffaf','#e8fbff'],color=blade?colors[s.bladeIndex]:s.evolution.color;
 for(let i=1;i<h.length;i++){const q=h[i-1],n=h[i],fade=Math.max(0,1-q.age/(blade?.18:.3)),next=Math.max(0,1-n.age/(blade?.18:.3));if(blade){const pt=(p,d)=>[p.x-325+Math.cos(p.angle)*d,p.height+.3,(p.y-300+Math.sin(p.angle)*d)*1.06],head=Math.min(1,q.age/.008),nextHead=Math.min(1,n.age/.008),edges=[27,58,75,87],alpha=[0,.75,.4,0];for(let band=1;band<edges.length;band++)r.transparentQuad(pt(q,edges[band-1]),pt(q,edges[band]),pt(n,edges[band]),pt(n,edges[band-1]),color,[fade*head*alpha[band-1],fade*head*alpha[band],next*nextHead*alpha[band],next*nextHead*alpha[band-1]]);}
  else {const dx=n.x-q.x,dy=(n.y-q.y)*1.06,len=Math.hypot(dx,dy)||1,width=9*s.evolution.size,nx=-dy/len*width,nz=dx/len*width,a=[q.x-325,q.height,(q.y-300)*1.06],b=[n.x-325,n.height,(n.y-300)*1.06];for(const side of [-1,1])r.transparentQuad(a,[a[0]+nx*side,a[1],a[2]+nz*side],[b[0]+nx*side,b[1],b[2]+nz*side],b,color,[fade*.4,0,0,next*.4]);}
 }
}
function electricPath(a,b,phase,strand=0){
 const length=Math.hypot(b.x-a.x,b.y-a.y),depth=Math.max(3,Math.min(5,Math.ceil(Math.log2(Math.max(1,length/7))))),out=[{x:a.x,y:a.y}],clock=phase*18,frame=Math.floor(clock),blend=(clock-frame)**2*(3-2*(clock-frame));
 // A time-coherent stochastic bridge: each midpoint bends its own local segment.
 // Coarse displacement creates the discharge route; finer levels create irregular forks in direction.
 const hash=(node,t,axis)=>{const v=Math.sin(node*127.1+t*311.7+strand*173.3+axis*91.9+a.x*.013+b.y*.017)*43758.5453;return (v-Math.floor(v))*2-1;},noise=(node,axis)=>hash(node,frame,axis)*(1-blend)+hash(node,frame+1,axis)*blend;
 function split(p,q,level,node){if(!level){out.push(q);return;}const dx=q.x-p.x,dy=q.y-p.y,len=Math.hypot(dx,dy)||1,along=noise(node,1)*.15,across=noise(node,0)*.32,mid={x:(p.x+q.x)/2+dx*along-dy*across,y:(p.y+q.y)/2+dy*along+dx*across};split(p,mid,level-1,node*2);split(mid,q,level-1,node*2+1);}
 if(length<.001)return [out[0],{x:b.x,y:b.y}];split(out[0],{x:b.x,y:b.y},depth,1);return out;
}
function drawElectricRing(s){
 const r=renderer,v=s.evolution,age=s.age||0,fade=Math.max(0,1-age/.4),radius=s.radius,x=s.x-325,z=(s.y-300)*1.06;
 fxDisc(x,z,radius,v.color,.1*fade,4);
 for(let k=0;k<9;k++){const start=k*TAU/9+time*2.4,span=.48;for(let segment=0;segment<2;segment++){const at=i=>{const a=start+span*i/2;return {x:s.x+Math.cos(a)*radius,y:s.y+Math.sin(a)*radius};},pts=electricPath(at(segment),at(segment+1),time+k*.371,k+segment*9);for(let i=1;i<pts.length;i++)modelBeam({...s,height:10+(k%3)*3},pts[i-1].x,pts[i-1].y,pts[i].x,pts[i].y,1.1+fade,k%2?v.color:v.accent);}}
 for(let i=0;i<12;i++){const a=i*TAU/12+Math.sin(i*5)*.3,d=radius*.2+age*(90+i%3*35),height=15+age*(20+i%4*12);r.electricSprite(x+Math.cos(a)*d,height,z+Math.sin(a)*d*1.06,24+(i%3)*10,a+time*2,.8*fade);}
}
function drawBeamHalo(s,width){
 const r=renderer,dx=s.x-s.originX,dz=(s.y-s.originY)*1.06,len=Math.hypot(dx,dz)||1,nx=-dz/len,nz=dx/len,x=s.originX-325,z=(s.originY-300)*1.06,ex=s.x-325,ez=(s.y-300)*1.06;
 for(const side of [-1,1])r.transparentQuad([x,3.5,z],[x+nx*width*side*1.25,3.5,z+nz*width*side*1.25],[ex+nx*width*side*1.25,3.5,ez+nz*width*side*1.25],[ex,3.5,ez],s.evolution.color,[.18,0,0,.1]);fxDisc(x,z,width*2.1,s.evolution.color,.2);fxDisc(x,z,width*.9,'#e9ffff',.22,3.6);r.glow(x,s.height||24,z,width*.3,s.evolution.color);
}
function modelBeam(s,x1,y1,x2,y2,width,color=s.evolution.color){
 const r=renderer,y=s.height||24,dx=x2-x1,dz=(y2-y1)*1.06,len=Math.hypot(dx,dz)||1,nx=-dz/len*width,nz=dx/len*width,ax=x1-325,az=(y1-300)*1.06,bx=x2-325,bz=(y2-300)*1.06;
 r.emissiveQuad([ax+nx,y,az+nz],[bx+nx,y,bz+nz],[bx-nx,y,bz-nz],[ax-nx,y,az-nz],color);
 r.emissiveQuad([ax+nx*.25,y+.2,az+nz*.25],[bx+nx*.25,y+.2,bz+nz*.25],[bx-nx*.25,y+.2,bz-nz*.25],[ax-nx*.25,y+.2,az-nz*.25],'#f5ffff');
}
function drawModelWheel(x,z,y,a,v){
 const r=renderer,c=Math.cos(a)*v.size,s=Math.sin(a)*v.size;
 r.residentMaterial('weapon-ornate-wheel-'+v.tier,()=>buildModelWheel(v.tier),[c,0,-s,x,0,v.size,0,y,s,0,c,z],1,3,time);
 r.glow(x,y+v.size*1.4,z,3.5,v.tier===5?'#85ff38':v.accent);
}
function buildModelWheel(tier){
 const r=renderer,R=13,ice=tier===4,royal=tier===2,tech=tier===5,count=ice?8:royal?4:3,edge=ice?'#61eaff':royal?'#ffe28b':tech?'#8bff35':'#e6efff',dark=royal?'#463052':tech?'#26313e':'#344c65',metal=ice?'#c5f4ff':royal?'#fff1c1':'#c6d1df',trim=royal?'#dca73e':ice?'#268fae':'#71869d';
 const point=(u,w,h,angle)=>[(Math.cos(angle)*u-Math.sin(angle)*w)*R,h,(Math.sin(angle)*u+Math.cos(angle)*w)*R];
 // Paired blade surfaces meet at a raised ridge. The rim is a separate thin luminous cutting edge.
 function blade(stations,angle,scale=1){
  for(let j=0;j<stations.length-1;j++){
   const p=stations[j],q=stations[j+1],at=(s,t,h)=>point(s[0]*scale,(s[1]+(s[2]-s[1])*t)*scale,h,angle),h=1.2,crest=2.15;
   r.quad(at(p,0,h),at(q,0,h),at(q,.48,crest),at(p,.48,crest),metal);
   r.quad(at(p,.48,crest),at(q,.48,crest),at(q,1,h),at(p,1,h),tech?'#4b5b70':trim);
   r.quad(at(p,0,.15),at(q,0,.15),at(q,0,h),at(p,0,h),dark);
   r.quad(at(p,1,h),at(q,1,h),at(q,1,.15),at(p,1,.15),dark);
   const rim=(s,t)=>at(s,t,h+(crest-h)*(t<=.48?t/.48:(1-t)/.52)+.06);
   r.emissiveQuad(rim(p,0),rim(q,0),rim(q,tech?.22:.075),rim(p,tech?.22:.075),edge);
   r.emissiveQuad(rim(p,tech?.82:.92),rim(q,tech?.82:.92),rim(q,1),rim(p,1),edge);
   if(royal||tech)r.quad(at(p,.43,crest+.04),at(q,.43,crest+.04),at(q,.51,crest+.04),at(p,.51,crest+.04),royal?'#fff7dd':'#172432');
  }
 }
 const curved=[[.22,-.13,.12],[.4,-.22,.22],[.61,-.19,.35],[.8,.02,.43],[.88,.47,.47]],mechanical=[[.22,-.14,.13],[.42,-.24,.22],[.67,-.17,.34],[.87,.04,.4],[.94,.32,.32]],crystal=[[.22,-.07,.07],[.47,-.17,.17],[.68,-.12,.12],[1,0,0]],crown=[[.22,-.13,.13],[.43,-.24,.25],[.64,-.2,.37],[.83,.02,.39],[.96,.27,.27]];
 for(let i=0;i<count;i++){
  const a=i*TAU/count,scale=ice&&i%2?.73:1;blade(ice?crystal:royal?crown:tech?mechanical:curved,a,scale);
  if(royal){blade([[.32,-.04,.04],[.5,-.1,.08],[.73,-.19,-.19]],a-.32,.86);}
  if(tech){for(let k=0;k<8;k++){const u=.42+k*.047,p=point(u,-.19,1.35,a);r.box(p[0],p[1],p[2],1.2,.55,.7,dark,-a-.3);}}
  // Jewel settings and faceted insets remain distinct from the steel blade faces.
  if(ice||royal){const center=point(.35,0,2.5,a),size=ice?1.05:1.25,c=royal?'#c678ff':'#f0ffff';r.ring(center[0],2.3,center[2],size*1.4,trim,.65);const pts=[[center[0]-size,2.5,center[2]],[center[0],2.5,center[2]-size*1.35],[center[0]+size,2.5,center[2]],[center[0],2.5,center[2]+size*1.35]],top=[center[0],3.15,center[2]];for(let j=0;j<4;j++)r.emissiveQuad(pts[j],pts[(j+1)%4],top,top,j%2?c:ice?'#4ebcd7':'#7750db');}
 }
 // Open bearing, stacked metal rims and an inset energy channel; the centre stays hollow.
 r.ring(0,.2,0,3.9,dark,1.35);r.ring(0,1.7,0,3.8,trim,1.0);r.ring(0,2.2,0,3.05,metal,.55);r.emissiveRing(0,2.3,0,2.54,royal?'#bf7dff':edge,.3);
 if(royal){for(let i=0;i<24;i++){const a=i*TAU/24,outer=i%3?4.8:5.6;r.emissiveQuad(point(.29,-.012,1.6,a),point(outer/R,0,1.6,a),point(.29,.012,1.6,a),point(.27,0,1.6,a),i%3?'#e4bd63':'#c58aff');}}
}
function drawModelSwordBlade(x,z,a,y,v,color=v.color){
 if(v.tier<4){drawSwordBlade(x,z,a,y,color);return;}
 const r=renderer,c=Math.cos(a),s=Math.sin(a);
 r.residentMesh('weapon-energy-sword-'+v.tier+'-'+color,()=>{
  const pt=(u,w,h=1)=>[u,h,w],panel=(points,col,lit=false)=>{const fn=lit?'emissiveQuad':'quad';for(let i=1;i<points.length-1;i++)r[fn](points[0],points[i],points[i+1],points[i+1],col);};
  // Broad swept energy edge, stepped steel spine and raised bevels.
  panel([pt(24,-5),pt(57,-8),pt(76,-17),pt(86,-11),pt(76,3),pt(27,7)],color,true);
  panel([pt(27,6,1.2),pt(77,1,1.2),pt(86,-11,1.2),pt(79,5,1.2),pt(28,9,1.2)],'#edffff',true);
  panel([pt(23,-6,2),pt(58,-7,2),pt(76,-16,2),pt(68,-4,2),pt(31,3,2)],'#263542');
  panel([pt(27,-5,3),pt(58,-6,3),pt(72,-13,2),pt(66,-2,3),pt(30,1,3)],'#7f94a7');
  panel([pt(26,-5,3),pt(58,-6,3),pt(66,-2,3),pt(30,1,3)],'#b7cbd8');
  r.box(15,1,0,17,4,5,'#314150');for(let i=0;i<4;i++)r.box(10+i*3.3,3.2,0,1.1,.6,5.3,'#9aadc0');
  // Split circular guard and a small matching energy pommel.
  for(let side=0;side<2;side++)for(let i=0;i<9;i++){const a=side*Math.PI+.25+i*.12,b=a+.12,p=(q,rad,h)=>[24+Math.cos(q)*rad,h,Math.sin(q)*rad];r.quad(p(a,11,1),p(b,11,1),p(b,7.2,1),p(a,7.2,1),'#9aafc0');r.emissiveQuad(p(a,7,1.2),p(b,7,1.2),p(b,6,1.2),p(a,6,1.2),color);}
  r.box(24,2,0,5,6,15,'#344959');r.emissiveBox(24,5.2,0,3,.7,7,color);panel([pt(2,-7),pt(8,-3),pt(8,3),pt(2,7),pt(5,0)],color,true);
  for(let i=0;i<3;i++){const u=35+i*10;r.box(u,3.8,-3,3,.6,5,'#263542');r.emissiveBox(u,4.2,-2,1,.4,1.5,color);}
 },[c,0,-s,x,0,1,0,y,s,0,c,z]);
}
const CYBER_BULLET_ART=[
 ['pistol_t1','火花尖梭',[[.5,0],[.72,-.25],[.96,0],[.72,.25]],'single'],
 ['pistol_t2','哨兵菱晶',[[.46,0],[.7,-.57],[.93,0],[.7,.57]],'brackets'],
 ['pistol_t3','北极星芒',[[.92,0],[.79,.16],[.73,.72],[.67,.16],[.48,0],[.67,-.16],[.73,-.72],[.79,-.16]],'squares'],
 ['pistol_t4','裁决光矛',[[.4,-.24],[.73,-.42],[.98,0],[.73,.42],[.4,.24],[.54,0]],'arrows'],
 ['smg_t1','灼热短镖',[[.57,-.17],[.84,-.17],[.94,0],[.84,.17],[.57,.17],[.65,0]],'paired'],
 ['smg_t2','分段曳光',[[.57,-.29],[.85,-.29],[.93,0],[.85,.29],[.57,.29]],'blocks'],
 ['smg_t3','三线电芯',[[.55,-.19],[.87,-.19],[.95,0],[.87,.19],[.55,.19]],'rails'],
 ['uzi_t2','双叶飞梭',[[.56,0],[.68,-.4],[.94,0],[.68,.4]],'double'],
 ['uzi_t4','双生毒牙',[[.45,-.16],[.7,-.68],[.96,-.32],[.68,-.3],[.55,0],[.68,.3],[.96,.32],[.7,.68],[.45,.16]],'fangs'],
 ['rifle_t1','缺口箭头',[[.43,-.23],[.68,-.23],[.68,-.49],[.96,0],[.68,.49],[.68,.23],[.43,.23],[.54,0]],'ticks'],
 ['rifle_t3','三节箭簇',[[.53,-.37],[.75,-.2],[.96,0],[.75,.2],[.53,.37],[.64,0]],'chevrons'],
 ['rifle_t4','破晓长刃',[[.34,-.18],[.7,-.44],[.98,-.12],[.91,.12],[.7,.32],[.34,.18],[.48,0]],'ladder'],
 ['sniper_t2','贯穿长针',[[.18,-.065],[.73,-.15],[.98,0],[.73,.15],[.18,.065]],'needle'],
 ['sniper_t3','熔芯重矛',[[.38,-.17],[.65,-.4],[.77,-.23],[.98,0],[.77,.23],[.65,.4],[.38,.17]],'fins'],
 ['sniper_t5','天穹轨道晶',[[.35,0],[.67,-.48],[.98,0],[.67,.48]],'orbitRails']
];
function buildCyberBulletAtlas(){
 const W=512,H=256,pixels=new Uint8Array(W*H*4),rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
 for(let index=0;index<CYBER_BULLET_ART.length;index++){
  const [id,,head,decor]=CYBER_BULLET_ART[index],model=WEAPON_MODELS.find(m=>m.id===id),color=rgb(model.color),accent=rgb(model.accent),white=[248,255,244],ox=index%4*128,oy=Math.floor(index/4)*64;
  function polygon(points,col,alpha=1,fade=false){const p=points.map(([u,v])=>[u*128,(v+1)*32]),minX=Math.max(1,Math.floor(Math.min(...p.map(q=>q[0]))-1)),maxX=Math.min(126,Math.ceil(Math.max(...p.map(q=>q[0]))+1)),minY=Math.max(1,Math.floor(Math.min(...p.map(q=>q[1]))-1)),maxY=Math.min(62,Math.ceil(Math.max(...p.map(q=>q[1]))+1));for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){const px=x+.5,py=y+.5;let inside=false,distance=999;for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[i],b=p[j];if((a[1]>py)!==(b[1]>py)&&px<(b[0]-a[0])*(py-a[1])/(b[1]-a[1])+a[0])inside=!inside;const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((px-a[0])*dx+(py-a[1])*dy)/(dx*dx+dy*dy||1)));distance=Math.min(distance,Math.hypot(px-a[0]-dx*t,py-a[1]-dy*t));}const coverage=Math.max(0,Math.min(1,.65+(inside?distance:-distance))),opacity=coverage*alpha*(fade?Math.max(0,Math.min(1,(px/128-.04)/.7)):1);if(!opacity)continue;const at=((oy+y)*W+ox+x)*4,old=pixels[at+3]/255,out=opacity+old*(1-opacity);for(let c=0;c<3;c++)pixels[at+c]=Math.round((col[c]*opacity+pixels[at+c]*old*(1-opacity))/out);pixels[at+3]=Math.round(out*255);}}
  const streak=(from,to,v,width,col=color,alpha=.8)=>polygon([[from,v-width],[to,v-width*.45],[to,v+width*.45],[from,v+width]],col,alpha,true),chevron=(u,v=.0)=>polygon([[u-.075,v-.32],[u+.04,v],[u-.075,v+.32],[u-.025,v]],accent,.8),square=(u,v,size=.055)=>{for(const [a,b]of [[[-1,-1],[1,-1]],[[1,-1],[1,1]],[[1,1],[-1,1]],[[-1,1],[-1,-1]]]){const w=.009;polygon([[u+a[0]*size,v+a[1]*size*2],[u+b[0]*size,v+b[1]*size*2],[u+b[0]*size+w,v+b[1]*size*2+w*2],[u+a[0]*size+w,v+a[1]*size*2+w*2]],accent,.65);}};
  polygon([[.025,0],[.67,-.25],[.95,0],[.67,.25]],color,.5,true);streak(.06,.83,0,.1,color,.9);
  if(decor==='brackets'){chevron(.4);polygon([[.53,-.57],[.61,-.66],[.69,-.66],[.61,-.5]],accent,.65);polygon([[.53,.57],[.61,.66],[.69,.66],[.61,.5]],accent,.65);}
  if(decor==='squares'){for(let k=0;k<4;k++)square(.18+k*.105,(k%2?1:-1)*(.25+k*.05),.025+k*.004);}
  if(decor==='arrows'||decor==='chevrons'){for(let k=0;k<3;k++)chevron(.2+k*.115);}
  if(decor==='paired'||decor==='double'){streak(.11,.67,-.38,.045);streak(.22,.77,.38,.045,accent);}
  if(decor==='blocks'){for(let k=0;k<3;k++)polygon([[.18+k*.12,-.12],[.26+k*.12,-.12],[.26+k*.12,.12],[.18+k*.12,.12]],accent,.3+k*.15);}
  if(decor==='rails'||decor==='orbitRails'){for(const side of [-1,1]){streak(.08,.9,side*.47,.04,color,.9);polygon([[.54,side*.5],[.7,side*.7],[.85,side*.5],[.7,side*.58]],accent,.8);}if(decor==='orbitRails')for(let k=0;k<3;k++)square(.23+k*.14,(k%2?1:-1)*.72,.022);}
  if(decor==='fangs'){streak(.08,.77,-.4,.075,color);streak(.2,.84,.4,.075,accent);}
  if(decor==='ticks'||decor==='ladder'){for(let k=0;k<(decor==='ladder'?5:2);k++){const u=.15+k*.09;polygon([[u,-.33],[u+.025,-.33],[u+.025,.33],[u,.33]],accent,.25+k*.1);}}
  if(decor==='needle'){streak(.015,.86,-.26,.022);streak(.1,.8,.26,.022,accent);}
  if(decor==='fins'){for(let k=0;k<3;k++){const u=.24+k*.1;polygon([[u,-.22],[u+.055,-.55],[u+.09,0],[u+.055,.55],[u,.22]],color,.35+k*.2);}}
  polygon(head.map(([u,v])=>[.73+(u-.73)*1.08,v*1.22]),color,.24);
  polygon(head,color,.92);polygon(head.map(([u,v])=>[.73+(u-.73)*.8,v*.67]),accent,.95);polygon(head.map(([u,v])=>[.73+(u-.73)*.65,v*.3]),white,.98);
 }
 return pixels;
}
function drawCyberBullet(s){
 const r=renderer,v=s.evolution,size=v.size,index=Math.max(0,CYBER_BULLET_ART.findIndex(art=>art[0]===(s.ownerItem?.itemId==='rifle_t2'?'rifle_t3':s.ownerItem?.itemId))),sniper=s.ownerItem?.familyId==='sniper';
 r.cyberBullet(s.x-325,(s.y-300)*1.06,s.height||24,Math.atan2(s.vy*1.06,s.vx),(sniper?100:76)*size,(sniper?24:28)*size,index,buildCyberBulletAtlas);r.glow(s.x-325,s.height||24,(s.y-300)*1.06,6*size,v.color);
}
function drawModelShot(s){
 const r=renderer,v=s.evolution,size=v.size,x=s.x-325,z=(s.y-300)*1.06,y=s.height||24,a=s.aim??Math.atan2(s.vy,s.vx);
 if(s.boomerang){drawModelTrail(s);drawModelWheel(x,z,y,-time*19,v);return;}
 if(s.zenith){const colors=['#45dfff','#ffcc45','#b585ff','#ff72b8','#70ffaf','#e8fbff'];drawModelTrail(s,true);drawModelSwordBlade(x,z,a,y,v,colors[s.bladeIndex]);return;}
 if(s.slash){drawSwordSlash(s);drawModelSwordBlade(x,z,s.angle,y,v);return;}
 if(s.electricRing){drawElectricRing(s);return;}
 if(s.radial){const radius=s.radius||18;if(s.secondaryCut){for(const angle of [-.65,.65])r.emissiveBox(x,y,z,36,1.4,3,v.color,angle);}else r.emissiveRing(x,y,z,radius*(.7+.3*(1-Math.max(0,s.life)/.22)),v.color,2.2);return;}
 if(s.arc){for(let i=1;i<s.points.length;i++){const from=s.points[i-1],to=s.points[i];for(let strand=0;strand<2;strand++){const points=electricPath(from,to,time+i*.13,strand);for(let j=1;j<points.length;j++)modelBeam(s,points[j-1].x,points[j-1].y,points[j].x,points[j].y,(strand?1.2:1.6)*size,strand?v.accent:v.color);}r.glow(to.x-325,y,(to.y-300)*1.06,7,v.accent);}return;}
 if(s.beam){const pulse=s.sustain?.94+.06*Math.sin(time*65):Math.max(.55,s.life/.14),width=(s.sustain?12:s.ownerItem?.splitLaser?s.splitChild?6:7:3.2)*size*pulse;if(s.sustain||s.ownerItem?.splitLaser)drawBeamHalo(s,width*2);if(s.sustain)r.laserFlow(s.originX-325,(s.originY-300)*1.06,x,z,y,width*1.35,time,.9);else modelBeam(s,s.originX,s.originY,s.x,s.y,width,s.splitChild?v.accent:v.color);return;}
 if(s.crescent){r.swordWave(x,z,y,Math.atan2(s.vy,s.vx),s.waveRadius,v.color);return;}
 if(s.bee&&s.ownerItem?.itemId==='bee_t3'){drawBee(s);return;}
 if(s.bee){r.emissiveBox(x,y,z,11*size,5*size,6*size,v.color,-a);for(const t of [-3,2])r.box(x+Math.cos(a)*t,y+.2,z+Math.sin(a)*t,2,5.5*size,6.2*size,'#263239',-a);for(const side of [-1,1])r.emissiveBox(x-Math.sin(a)*side*7*size,y+3+Math.sin(time*80+s.beeIndex)*2,z+Math.cos(a)*side*7*size,8*size,.8,5*size,v.accent,-a+side*.35);return;}
 if(!s.blastRadius){drawCyberBullet(s);return;}
 const heavy=s.blastRadius||s.ownerItem?.familyId==='sniper',len=(s.blastRadius?24:heavy?28:10)*size,dx=Math.cos(a),dz=Math.sin(a)*1.06,width=(s.blastRadius?9:heavy?7:7)*size;
 r.emissiveBox(x,y,z,len,width,width,v.color,-a);r.emissiveBox(x+dx*len*.1,y+.3,z+dz*len*.1,len*.65,width*.35,width*.35,'#f4ffff',-a);
 const tail=Math.min(65,Math.max(30,(v.trail||.03)*(s.speed||Math.hypot(s.vx,s.vy)||600))),nx=-Math.sin(a),nz=Math.cos(a),tip=[x,y-.2,z],end=[x-dx*tail,y-.2,z-dz*tail];for(const side of [-1,1])r.transparentQuad(tip,[x+nx*width*.6*side,y-.2,z+nz*width*.6*side],[end[0]+nx*width*.06*side,end[1],end[2]+nz*width*.06*side],end,v.color,[.6,0,0,0]);
 if(s.blastRadius){r.box(x+dx*len*.4,y,z+dz*len*.4,len*.2,width*1.15,width*1.15,v.accent,-a);for(const side of [-1,1])r.emissiveBox(x-dx*len*.45-Math.sin(a)*side*width,y,z-dz*len*.45+Math.cos(a)*side*width,9*size,1,4,v.accent,-a);r.glow(x-dx*len*.7,y,z-dz*len*.7,7*size,v.color);}else {r.projectile(x,y,z,(heavy?5:5.8)*size,v.color);r.glow(x,y,z,8*size,v.color);}
}
function drawModelWeapon(w,x,z,a){
 if(w.sustain){const beam=shots.find(s=>s.sustain&&s.ownerItem?.itemId===w.itemId&&s.life>0);if(beam)a=beam.aim;}
 const recoil=modelGunKick(w);x-=Math.cos(a)*recoil;z-=Math.sin(a)*recoil;
 const r=renderer,v=modelVisual(w),t=w.tier,dx=Math.cos(a),dz=Math.sin(a),nx=-dz,nz=dx,y=24,body=t>=4?v.accent:t===3?v.color:'#344659',length=w.familyId==='sniper'?48+t*3:w.familyId==='rocket'?38+t*2:w.familyId==='rifle'?31+t*3:w.familyId==='pistol'?19+t*4:w.familyId==='smg'&&t===2?42:27,width=w.familyId==='rocket'?13:w.familyId==='smg'&&t===3?12:8;
 if(w.familyId==='boomerang'){drawModelWheel(x+dx*35,z+dz*35,y,a,v);return;}
 if(w.familyId==='sword'){drawModelSwordBlade(x,z,a,y,v);return;}
 drawGunMuzzle(w,x,z,y,a,length);
 if(w.dualWield){for(const barrel of uziBarrels({x:x+325,y:z/1.06+300},a)){const angle=barrel.angle,bx=Math.cos(angle),bz=Math.sin(angle),xx=barrel.x-325,zz=(barrel.y-300)*1.06;r.box(xx+bx*17,y,zz+bz*17,27,9,8,body,-angle);r.box(xx+bx*7,y-7,zz+bz*7,7,11,6,'#263743',-angle);r.emissiveRing(xx+bx*22,y+6,zz+bz*22,7,v.accent,2);for(const side of [-1,1])r.emissiveBox(xx+bx*31-bz*side*5,y,zz+bz*31+bx*side*5,12,3,3,v.color,-angle);r.glow(xx+bx*30,y,zz+bz*30,4,v.color);}return;}
 if(w.familyId==='uzi'){for(const side of [-1,1]){const xx=x+nx*side*13,zz=z+nz*side*13;r.box(xx+dx*17,y,zz+dz*17,25,8,7,body,-a);r.emissiveBox(xx+dx*25,y+4.2,zz+dz*25,15,1,4,v.color,-a);r.box(xx+dx*8,y-6,zz+dz*8,7,10,6,'#263743',-a);}return;}
 if(w.familyId==='seeker'){const count=w.pellets;for(let i=0;i<count;i++){const side=(i-(count-1)/2)*7;r.box(x+nx*side+dx*8,y+3,z+nz*side+dz*8,28,8,6,body,-a);r.emissiveBox(x+nx*side+dx*21,y+3,z+nz*side+dz*21,4,6,5,v.color,-a);}return;}
 r.box(x+dx*17,y,z+dz*17,length,8,width,body,-a);r.box(x+dx*5,y-6,z+dz*5,8,12,7,'#263447',-a);
 r.emissiveBox(x+dx*18,y+4.3,z+dz*18,length*.65,1.3,width*.45,v.color,-a);r.emissiveBox(x+dx*(18+length*.5),y,z+dz*(18+length*.5),5,5,width+2,v.accent,-a);
 if(w.familyId==='sniper'){r.box(x+dx*9,y+10,z+dz*9,22,7,6,'#24334d',-a);r.emissiveBox(x+dx*20,y+10,z+dz*20,2,6,6,v.color,-a);r.box(x-dx*12,y,z-dz*12,18,10,10,body,-a);if(t===5)for(const side of [-1,1])r.emissiveBox(x+dx*26+nx*side*7,y+8,z+dz*26+nz*side*7,20,2,2,v.accent,-a);}
 if(w.familyId==='pistol'){
  if(t===1)r.box(x-dx*3,y-2,z-dz*3,10,9,7,'#86654c',-a);
  if(t===2)r.box(x+dx*28,y+5,z+dz*28,11,3,11,'#abc1c8',-a);
  if(t===3){r.emissiveRing(x+dx*8,y+6,z+dz*8,7,v.color,2);for(const side of [-1,1])r.emissiveBox(x+dx*12+nx*side*7,y+5,z+dz*12+nz*side*7,15,2,3,v.accent,-a);}
  if(t===4){const stage=modelGrowthStage(w);for(const side of [-1,1])r.emissiveBox(x+dx*17+nx*side*(7+stage*2),y+5,z+dz*17+nz*side*(7+stage*2),20+stage*5,2,3,side>0?v.color:v.accent,-a);}
 }
 if(w.familyId==='smg'&&t===2){r.box(x-dx*12,y,z-dz*12,17,9,9,'#93633f',-a);r.box(x+dx*15,y-14,z+dz*15,8,15,8,'#334450',-a-.16);r.box(x+dx*30,y+4,z+dz*30,21,3,9,'#976b43',-a);}
 if(w.familyId==='smg'&&t===3){r.disc(x+nx*10,y+2,z+nz*10,10,'#24365a');r.emissiveRing(x+nx*10,y+3,z+nz*10,8,v.accent,2);}
 if(w.familyId==='rifle'&&t>=3)for(const side of [-1,1])r.emissiveBox(x+dx*24+nx*side*6,y+3,z+dz*24+nz*side*6,20,2,2,v.accent,-a);
 if(w.familyId==='sniper'&&t===3){r.box(x+dx*49,y,z+dz*49,10,9,15,'#8e535b',-a);for(const side of [-1,1])r.box(x+dx*27+nx*side*8,y-7,z+dz*27+nz*side*8,3,13,3,'#63808c',-a);}
 if(w.familyId==='laser'&&t>=4)for(const side of [-1,1])r.emissiveBox(x+dx*37+nx*side*9,y+5,z+dz*37+nz*side*9,16,3,4,v.accent,-a+side*.3);
 if(w.familyId==='tesla'){r.emissiveRing(x+dx*25,y+8,z+dz*25,5+t,v.accent,2);for(const side of [-1,1])r.emissiveBox(x+dx*32+nx*side*8,y+3,z+dz*32+nz*side*8,15,3,3,v.color,-a);}
 if(w.familyId==='rifle'||w.familyId==='smg')r.box(x+dx*14,y-9,z+dz*14,9,13,7,body,-a);
 if(w.familyId==='smg'&&t===3)for(let i=0;i<6;i++){const angle=time*24+i*TAU/6;r.emissiveBox(x+dx*35+nx*Math.cos(angle)*5,y+Math.sin(angle)*5,z+dz*35+nz*Math.cos(angle)*5,19,2,2,i%2?v.accent:v.color,-a);}
 if(w.familyId==='rocket')for(let i=0;i<t-1;i++)r.emissiveBox(x+dx*(i*9+4),y+5,z+dz*(i*9+4),3,2,16,i%2?v.accent:v.color,-a);
 if(w.familyId==='laser'||w.familyId==='tesla')for(let i=0;i<t;i++){const xx=x+dx*(8+i*6),zz=z+dz*(8+i*6);r.emissiveBox(xx,y+6,zz,3,5,width+5,i%2?v.accent:v.color,-a);}
 if(w.familyId==='bee')for(let i=0;i<(t===5?5:3);i++)r.emissiveBox(x+dx*(8+i*5),y+5,z+dz*(8+i*5),3,2,13,v.accent,-a);
 if(t>=4)r.glow(x+dx*23,y+5,z+dz*23,4,v.color);
}
function fxLine3(a,b,color,width=1,alpha=.5){const dx=b[0]-a[0],dz=b[2]-a[2],length=Math.hypot(dx,dz),nx=length>.01?-dz/length*width:width,nz=length>.01?dx/length*width:0;renderer.transparentQuad([a[0]+nx,a[1],a[2]+nz],[b[0]+nx,b[1],b[2]+nz],[b[0]-nx,b[1],b[2]-nz],[a[0]-nx,a[1],a[2]-nz],color,[alpha,alpha,alpha,alpha]);}
function drawEnergyBlast(e){
 const r=renderer,t=e.t,life=.85;if(t>=life)return;const fade=(1-t/life)**1.3,grow=Math.min(1,.22+t/.11),radius=e.radius*grow,x=e.x-325,z=(e.y-300)*1.06,v=e.modelVisual,angle=e.seed+t*1.8,at=(u,w,y=4)=>[x+u*Math.cos(angle)-w*Math.sin(angle),y,z+u*Math.sin(angle)+w*Math.cos(angle)];
 fxDisc(x,z,radius*1.12,v.color,.48*fade);fxDisc(x,z,radius*.3,v.accent,.6*fade,4.1);r.glow(x,9,z,radius*.2*fade,v.color);
 // A circular-clipped luminous floor grid and a thin transparent energy dome.
 const spacing=radius/6;for(let i=-5;i<=5;i++){const d=i*spacing,span=Math.sqrt(Math.max(0,radius*radius-d*d));fxLine3(at(d,-span),at(d,span),v.color,.65,fade*.24);fxLine3(at(-span,d),at(span,d),v.color,.65,fade*.24);}
 for(let ring=1;ring<=3;ring++){const lat=ring*Math.PI/8,rr=radius*Math.cos(lat),h=radius*Math.sin(lat)*.62;for(let i=0;i<40;i++){const a=i*TAU/40,b=(i+1)*TAU/40;fxLine3([x+Math.cos(a)*rr,5+h,z+Math.sin(a)*rr],[x+Math.cos(b)*rr,5+h,z+Math.sin(b)*rr],v.color,.8,fade*.2);}}
 for(let k=0;k<8;k++){const a=k*TAU/8;for(let i=0;i<12;i++){const u=i*Math.PI/24,w=(i+1)*Math.PI/24;fxLine3([x+Math.cos(a)*Math.cos(u)*radius,5+Math.sin(u)*radius*.62,z+Math.sin(a)*Math.cos(u)*radius],[x+Math.cos(a)*Math.cos(w)*radius,5+Math.sin(w)*radius*.62,z+Math.sin(a)*Math.cos(w)*radius],v.color,.7,fade*.17);}}
 // Wide broken orbit bands rotate at different inclinations, like the Unity reference.
 for(let band=0;band<3;band++)for(let k=0;k<5;k++){const start=k*TAU/5+angle*(band%2?-1:1)+band*.6,span=.8,rad=radius*(.86+band*.08);for(let i=0;i<9;i++){const a=start+span*i/9,b=start+span*(i+1)/9,pt=(a,d)=>[x+Math.cos(a)*d,8+Math.max(0,Math.sin(a+band*2))*radius*(.22+band*.12),z+Math.sin(a)*d];r.transparentQuad(pt(a,rad-4),pt(a,rad+4),pt(b,rad+4),pt(b,rad-4),band===1?v.accent:v.color,[fade*.18,fade*.95,fade*.95,fade*.18]);}}
 for(let i=0;i<24;i++){const a=i*TAU/24+angle,rr=radius*(.9+.08*Math.sin(i*2.3));r.glow(x+Math.cos(a)*rr,8+Math.max(0,Math.sin(a))*radius*.2,z+Math.sin(a)*rr,5*fade,v.color);}
 for(let i=0;i<14;i++){const a=i*2.39996+e.seed,d=radius*(.2+.5*Math.sin(i*5.7)**2),yy=8+t*(55+i%4*27),cx=x+Math.cos(a)*d,cz=z+Math.sin(a)*d,size=radius*(.035+.012*(i%3)),spin=i+t*2,pts=[];for(let j=0;j<4;j++){const q=spin+Math.PI/4+j*Math.PI/2;pts.push([cx+Math.cos(q)*size,yy+Math.sin(q)*size*.532,cz-Math.sin(q)*size*.847]);}for(let j=0;j<4;j++)fxLine3(pts[j],pts[(j+1)%4],i%3?v.color:v.accent,1,fade*.6);}
}
function drawNuclearExplosion(e){
 drawEnergyBlast(e);
 const r=renderer,t=e.t,fade=Math.max(0,1-t/1.8),x=e.x-325,z=(e.y-300)*1.06,rad=e.radius,rise=1-Math.exp(-t*5),height=28+rise*180;
 if(t<.55){const alpha=(1-t/.55)**1.4,radius=rad*Math.min(1,t/.08+.18);fxDisc(x,z,radius*1.04,'#4ddcff',.48*alpha);fxDisc(x,z,radius*.66,'#fff0bd',.28*alpha,3.5);
  for(let i=0;i<72;i++){const a=i*TAU/72,b=(i+1)*TAU/72,outer=radius*(1+.018*Math.sin(i*2.4+t*26)),inner=outer-(12+9*Math.sin(i*.7+t*12)**2)*alpha,pt=(a,d,y)=>[x+Math.cos(a)*d,y,z+Math.sin(a)*d];r.transparentQuad(pt(a,inner,6),pt(a,outer,7),pt(b,outer,7),pt(b,inner,6),i%3?'#60dfff':'#ffe3a1',[alpha*.12,alpha*.8,alpha*.8,alpha*.12]);}
  if(t<.12){r.glow(x,20,z,rad*.7*(1-t/.12),'#85eaff');r.glow(x,28,z,rad*.35*(1-t/.12),'#fff4d0');}
 }
 const opacity=Math.min(1,t/.09)*fade;
 // A narrow rising stem supports a wide rolling cap, with a bright heated underside.
 for(let i=0;i<7;i++){const y=12+i*height/7,spread=17+9*Math.sin(i*1.8+t*7)**2;fxCloud(x+Math.sin(i*2.3+t*3)*8,y,z+Math.cos(i*2)*7,spread,32,'#8ca6be',opacity*.8);fxPuff(x,y+3,z-3,spread*.65,25,i<3?'#ffcb7a':'#a8e7f4',opacity*.55);}
 for(let i=0;i<4;i++)renderer.glow(x,20+i*height/4,z,10*fade,i%2?'#9ce9ff':'#ffd99b');
 const cap=rad*(.4+.32*rise);fxPuff(x,height-10,z,cap*.98,30,'#ffbf69',opacity*.38);
 for(let i=0;i<11;i++){const a=i*TAU/11,rolling=t*2+i*.7,xx=x+Math.cos(a)*cap*.62,zz=z+Math.sin(a)*cap*.42,yy=height+Math.sin(a)*9+Math.sin(rolling)*6,size=cap*(.44+.06*Math.sin(i*3.1)**2);fxCloud(xx,yy,zz,size,size*.78,i%3?'#819eb9':'#bedeee',opacity*.85);fxPuff(xx,yy-12,zz-1,size*.72,size*.35,i%2?'#ffc46a':'#80dfff',opacity*.45);}
 fxCloud(x,height+12,z,cap*.75,cap*.38,'#bad9ed',opacity*.7);
 for(let i=0;i<24;i++){const a=i*TAU/24,d=rad*(.3+t*.35),y=10+Math.sin(i*3.1)**2*40+t*20;if(t<.9)r.emissiveBox(x+Math.cos(a)*d,y,z+Math.sin(a)*d,2*fade,7*fade,2*fade,i%3?'#65dbff':'#ffcf79',a);}
}
function fireworkPoint(e,index,age){
 const style=e.fireworkStyle||0,count=style===6?64:56,a=index*2.399963+e.seed,phase=index*TAU/count,R=e.visualRadius||210,t=Math.max(0,age),g=1-Math.exp(-t*2.9);let x=0,y=0,z=0;
 if(style===0){const h=1-2*(index+.5)/count,side=Math.sqrt(1-h*h);x=Math.cos(a)*R*g*side;z=Math.sin(a)*R*g*.7*side;y=Math.abs(h)*R*g*.45-t*t*22;}
 if(style===1){x=Math.cos(a)*R*g;z=Math.sin(a)*R*g*.6;y=(.12+.25*Math.sin(index*8.4)**2)*R*g-t*t*35;}
 if(style===3){x=16*Math.sin(phase)**3*R/18*g;z=-(13*Math.cos(phase)-5*Math.cos(phase*2)-2*Math.cos(phase*3)-Math.cos(phase*4))*R/18*g*.8;y=R*g*.14-t*t*20;}
 if(style===4){const angle=(index%14/13-.5)*2.2,branch=Math.floor(index/14);x=Math.sin(angle)*R*g*(.65+branch*.1);z=Math.cos(angle)*R*g*.65;y=R*g*.15-t*t*25;}
 if(style===6){const parent=Math.floor(index/4)*TAU/16,cross=index%4*TAU/4,split=1-Math.exp(-Math.max(0,t-.45)*6);x=Math.cos(parent)*R*g*.67+Math.cos(cross)*R*.28*split;z=Math.sin(parent)*R*g*.67+Math.sin(cross)*R*.28*split;y=R*g*.16-t*t*18;}
 return {x:e.x-325+x,y:24+y,z:(e.y-300)*1.06+z};
}
function drawFireworkExplosion(e){
 const r=renderer,t=e.t,style=e.fireworkStyle||0,count=style===6?64:56,fade=Math.max(0,1-t/2.2),colors=['#ff6a91','#5cdbff','#ffd968','#a8ff9b','#d295ff','#ff9f52','#fff1ce'];
 for(let i=0;i<count;i++){const color=style===1?'#ffd389':colors[(i+style*2)%colors.length],now=fireworkPoint(e,i,t);for(let j=0;j<7;j++){const a=fireworkPoint(e,i,Math.max(0,t-j*.065)),b=fireworkPoint(e,i,Math.max(0,t-(j+1)*.065));if(a.y<=12||b.y<=12)continue;const dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z,length=Math.hypot(dx,dy,dz)||1,sideX=-dz/length*2.6,sideZ=dx/length*2.6,alpha=fade*(1-j/7)*.95,aa=alpha*Math.min(1,(a.y-12)/24),ab=alpha*.6*Math.min(1,(b.y-12)/24);r.transparentQuad([a.x+sideX,a.y,a.z+sideZ],[b.x+sideX,b.y,b.z+sideZ],[b.x-sideX,b.y,b.z-sideZ],[a.x-sideX,a.y,a.z-sideZ],color,[aa,ab,ab,aa]);}const sparkFade=fade*Math.max(0,Math.min(1,(now.y-12)/24));if(sparkFade>.12){r.projectile(now.x,now.y,now.z,3.2*sparkFade,color);r.glow(now.x,now.y,now.z,6*sparkFade,color);}}
 if(t<.3)fxPuff(e.x-325,24,(e.y-300)*1.06,24,20,'#fff5cc',(1-t/.3)*.55);
}
function drawRocketImpact(e){
 const r=renderer,t=e.t,x=e.x-325,z=(e.y-300)*1.06,rad=e.radius,v=e.modelVisual;
 // Rising smoke starts with a compact hot column, then rolls outward as it cools.
 if(t<1.15){const rise=1-Math.exp(-t*5),fade=Math.max(0,1-t/1.15),height=rad*(.5+rise*1.6);for(let i=0;i<9;i++){const q=i/8,swirl=e.seed+i*2.4+t*2,cx=x+Math.sin(swirl)*rad*.13*q,cz=z+Math.cos(swirl)*rad*.1*q,yy=14+height*q,width=rad*(.08+.17*q)*( .55+rise);fxCloud(cx,yy,cz,width,width*(1.1+q*.3),i%2?'#657489':'#a6b4c4',fade*.65);if(t<.45)fxPuff(cx,yy-3,cz,width*.65,width*.9,i%2?v.color:'#ffe6ab',fade*(1-t/.45)*.6);}}
 // Independent ballistic sparks have different elevations, speeds and lengths.
 if(t<.7){const fade=(1-t/.7)**1.2;for(let i=0;i<56;i++){const a=i*2.39996+e.seed,speed=rad*(2.4+2.8*Math.sin(i*4.17)**2),up=rad*(1.1+3.1*Math.sin(i*7.13)**2),at=age=>[x+Math.cos(a)*speed*age,16+up*age-age*age*rad*2.6,z+Math.sin(a)*speed*age],now=at(t),old=at(Math.max(0,t-.025-.02*(i%3)));if(now[1]<10||old[1]<10)continue;fxLine3(old,now,i%4?v.accent:'#ffffff',(1.3+i%3*.35)*fade,fade*.95);r.glow(now[0],now[1],now[2],(2.5+i%3)*fade,i%3?v.color:'#fff3be');}}
 // Layered white-hot billboards and a sharp starburst sell the first impact frame.
 if(t<.18){const flash=(1-t/.18)**2,expand=.8+Math.min(1,t/.035)*.4;fxDisc(x,z,rad*.8*expand,v.color,.8*flash,5);fxPuff(x,23,z,rad*.85*expand,rad*.65*expand,v.color,.8*flash);fxCloud(x,23,z,rad*.3*expand,rad*.28*expand,'#fffde5',flash*.98);fxCloud(x,24,z,rad*.14,rad*.14,'#ffffff',flash);for(let i=0;i<10;i++){const a=i*TAU/10+e.seed,len=rad*(i%2?.55:.95)*expand,w=rad*.045,point=(d,side)=>[x+Math.cos(a)*d-Math.sin(a)*w*side,25,z+Math.sin(a)*d+Math.cos(a)*w*side];r.transparentQuad(point(0,-1),point(len,0),point(0,1),[x,25,z],'#fff7d6',[flash*.9,0,flash*.9,flash]);}r.glow(x,26,z,rad*.55*flash,'#ffffff');}
}
function drawModelExplosion(e){if(e.nuclear)drawNuclearExplosion(e);else if(e.fireworks)drawFireworkExplosion(e);else drawEnergyBlast(e);if(e.modelVisual.familyId==='rocket')drawRocketImpact(e);}

let testMode=false,testResume=false;
function testEquipmentTypes(key){return key==='shovel'?SHOVEL_TYPES:key==='armor'?ARMOR_TYPES:key==='shoes'?SHOE_TYPES:key==='drone'?COMPANION_TYPES:WEAPON_MODELS}
function refreshTestTypes(){const key=$('test-slot').value;$('test-item').innerHTML=testEquipmentTypes(key).map(e=>`<option value="${e.id}">${key==='drone'?createDrone(e.id).name:key==='weapon'?'T'+e.tier+' · '+e.name:e.name}</option>`).join('');refreshTestForks()}
function refreshTestForks(){const model=$('test-slot').value==='weapon'?WEAPON_MODELS.find(e=>e.id===$('test-item').value):null;$('test-tier').disabled=!!model;if(model)$('test-tier').value=model.tier;$('test-forks-label').hidden=!(['weapon','drone'].includes($('test-slot').value)&&$('test-item').value==='rotor')}
function openEquipmentTest(){if($('equipment-test').hidden===false)return;testResume=!paused&&['combat','survival','bossIntro','descent','landing','stageClear','bossDying'].includes(state);if(testResume)togglePause();releaseJoy();Object.keys(keys).forEach(k=>keys[k]=false);$('equipment-test').hidden=false;refreshTestTypes();if($('test-terrain-passive'))$('test-terrain-passive').innerHTML=TERRAIN_CATALOG.filter(d=>d.kind==='稀有被动').map(d=>`<option value="${d.id}">${d.name}</option>`).join('');$('test-drink').innerHTML=DRINK_TYPES.map(d=>`<option value="${d.id}">${d.name}</option>`).join('')}
function closeEquipmentTest(){$('equipment-test').hidden=true;if(testResume&&paused&&!document.hidden&&renderer.ready&&!renderer.gl.isContextLost())togglePause();testResume=false}
function takeTestEquipment(key,id,tier,forks=0,randomStats=false){if(!EQUIPMENT_LABELS[key]||!(testEquipmentTypes(key).some(e=>e.id===id)||(key==='weapon'&&WEAPON_TYPES.some(e=>e.id===id))))return false;const fresh=['menu','dead','won'].includes(state);if(fresh){if(typeof fishSchoolTest!=='undefined'&&fishSchoolTest)startFishSchoolTest();else if(ufoBossTest)startUFOBossTest();else if(droneBossTest)startDroneBossTest();else if(humanoidTest){if(humanoidBoss?.crimson&&typeof startCrimsonMechTest==='function')startCrimsonMechTest();else if(humanoidBoss?.cowboy)startCowboyTest();else startHumanoidTest();}else if(virusTest)startVirusTest();else if(snakeTest)startSnakeTest();else reset();togglePause();$('equipment-test').hidden=false;testResume=true}const factory=key==='shovel'?createShovel:key==='armor'?createArmor:key==='shoes'?createShoes:key==='drone'?createDrone:createWeapon;let e=key==='weapon'&&WEAPON_MODELS.some(e=>e.id===id)?createWeaponModel(id):factory(id,Math.max(1,Math.min(5,Number(tier)||1)));if(e.id==='rotor'&&Number(forks)>0){e.forks=Math.max(2,Math.min(12,Math.round(Number(forks)||3)));e.desc=`${e.forks}叉旋转穿透扫射`}if(randomStats)e=rollEquipmentStats(key,e);equipItem(key,e);if(key==='weapon'||key==='drone')shots=shots.filter(s=>s.source!==key);testMode=true;$('test-open').textContent='测试中 · 装备';$('test-result').innerHTML=equipmentAttributeCard(key,e,'已装备');updateUI();return true}
if($('test-cash'))$('test-cash').onclick=()=>{prepareTerrainTest();if(addCashTile()){renderer.sceneKey=null;$('test-result').textContent='已添加金钱格：靠近1.5格内按攻速反复下铲，触地扣进度，扣完产钱。';}};
$('test-drink-buy').onclick=()=>takeTestDrink($('test-drink').value);$('test-drink-awake').onclick=()=>takeTestDrink($('test-drink').value,true);
if($('test-cover'))$('test-cover').onclick=()=>{if(['menu','dead','won'].includes(state)){reset();togglePause();$('equipment-test').hidden=false;testResume=true;}testMode=true;if(addCoverTile()){$('test-result').textContent='已添加掩体格：4点耐久，每关恢复；小怪会拆，BOSS撞碎。';}};
if($('test-shock'))$('test-shock').onclick=()=>{if(['menu','dead','won'].includes(state)){reset();togglePause();$('equipment-test').hidden=false;testResume=true;}testMode=true;const t=terrainCell();if(t){addShockTile();renderer.sceneKey=null;$('test-result').textContent='已添加震荡格：蓝色同心圆，踩入清屏，冷却35秒。';}};
if($('test-greed'))$('test-greed').onclick=startGreedTest;
if($('terrain-adrenaline'))$('terrain-adrenaline').onclick=useTerrainAdrenaline;if($('test-terrain-grant'))$('test-terrain-grant').onclick=()=>{prepareTerrainTest();grantTerrainPassive($('test-terrain-passive').value);$('test-result').textContent='已获得 '+terrainDef($('test-terrain-passive').value).name;};if($('test-materials'))$('test-materials').hidden=true;$('test-open').onclick=openEquipmentTest;$('test-close').onclick=closeEquipmentTest;$('test-slot').onchange=refreshTestTypes;$('test-item').onchange=refreshTestForks;
$('test-equip').onclick=()=>takeTestEquipment($('test-slot').value,$('test-item').value,$('test-tier').value,$('test-forks-label').hidden?0:$('test-forks').value,$('test-random').checked);
p={x:325,y:350,hp:3+talentLevel('hp'),max:3+talentLevel('hp'),inv:0,shield:talentLevel('shield'),shieldHit:0,dx:0,dy:-1};updateUI();globalThis.TalentRuntime?.init();globalThis.TalentRuntime?.overlay();requestAnimationFrame(loop);

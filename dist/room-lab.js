'use strict';

globalThis.RoomLab=(()=>{
 const rooms=[
  {id:'B01',name:'弹幕 · 飞蛾扫场',hint:'左右交替开火 · 穿过扇面的缺口',color:'#cda0ff',seconds:22,volley:4.1},
  {id:'B02',name:'浮桥 · 猎蛛来袭',hint:'拦截猎蛛和噬菌体 · 避开边缘导弹',color:'#ffbc6e',seconds:28,volley:6,bridge:true},
  {id:'B03',name:'弹幕 · 交叉火力',hint:'两侧交替发射双层扇形弹',color:'#cda0ff',seconds:26,volley:3.1},
  {id:'B04',name:'浮桥 · 机械尸潮',hint:'双列尸潮 · 导弹从屏幕边缘穿过阵地',color:'#83e2b1',seconds:55,volley:5,bridge:true}
 ];
 const bossLink='?airboss=cobalt&fight=1&roomlabReturn=1';
 const groundRoom=rooms.at(-1);
 const groundRoster=[
  {type:'crawler',spiderCore:'square',scale:.48,radius:8,hits:1.5},
  {type:'sweeper',radius:13,hits:2.5},
  {type:'crawler',spiderCore:'barrel',scale:.82,radius:15,hits:3.5},
  {type:'crawler',spiderCore:'capsule',scale:.72,radius:13,hits:3.5},
  {type:'crawler',spiderCore:'round',scale:1.03,radius:23,hits:5.5},
  {type:'wheelRammer',hits:3.5},
  {type:'hammerWalker',hits:4.5},
  {type:'crawler',spiderCore:'beetle',scale:.96,radius:21,hits:4.5},
  {type:'crawler',spiderCore:'crab',scale:.89,radius:25,hits:5.5},
  {type:'crawler',spiderCore:'hermit',scale:.83,radius:20,hits:4.5},
  {type:'crawler',spiderCore:'scorpion',scale:.88,radius:22,hits:5.5}
 ];
 const walkRoster=[...groundRoster,{type:'crawler'},{type:'virusElite',radius:25,generation:2}];
 const walkNames=['摄像头蛛','扫地机器人','油桶蛛','胶囊蛛','大球壳蛛','双轮车','双足锤兵','独角仙','机械蟹','寄居蟹','机械蝎','四足猎蛛','噬菌体'];
 const hordeByCore=new Map(groundRoster.filter(spec=>spec.spiderCore).map(spec=>[spec.spiderCore,spec]));
 const hordeHeavy=['round','crab','scorpion'];
 const hordeOrder=['square','crawler','square','square','capsule','crawler','square','barrel',
  'square','heavy','crawler','beetle','square','hermit','square'];
 const damageScales={weak:.6,pistol:1,strong:1.6};
 let ui,room,build='pistol',elapsed,nextAttack,attackRound,attack,rockets,metrics;
 let walking=false,walkIndex=0,walkPhase=0,walkPaused=false,walker;

 function init(){
  const link=document.createElement('link');
  link.rel='stylesheet';link.href='room-lab.css';document.head.append(link);
  ui=document.createElement('section');ui.className='room-lab';ui.setAttribute('aria-label','关卡试玩');
  ui.innerHTML=`<div class="room-lab-panel">
   <header><div><small>ENCOUNTER LAB</small><h2>关卡试玩</h2></div><a href="./">返回正式游戏</a></header>
   <p class="room-lab-intro">任选一关试玩。</p>
   <a class="walk-entry" href="?roomlab=1&amp;walk=1">单只步态观察</a>
   <div class="room-lab-rooms">${rooms.map((r,i)=>`<button type="button" data-room="${i}" aria-pressed="false" style="--room-color:${r.color}"><small>${r.id}</small><b>${r.name}</b></button>`).join('')}<a class="room-lab-boss" href="${bossLink}"><small>B05</small><b>Boss · 钴隼</b></a></div>
   <div class="room-lab-controls"><label>手枪伤害 <select><option value="weak">弱火力 · 60%</option><option value="pistol" selected>原版 · 100%</option><option value="strong">强火力 · 160%</option><option value="watch" hidden>观察 · 停火</option></select></label><button type="button" data-restart hidden>重开本关</button><button type="button" data-continue hidden>下一关</button></div>
   <p class="room-lab-status" role="status">WASD / 方向键 / 触屏拖动 · 自动瞄准</p>
   <p class="room-lab-metrics" title="近身威胁指三格内出现敌弹、导弹或接触威胁的时间比例。" hidden></p>
  </div>`;
  $('viewport').classList.add('room-lab-mode');$('viewport').append(ui);
  if(new URLSearchParams(location.search).get('walk')==='1'){initWalk();return;}
  ui.querySelectorAll('[data-room]').forEach(button=>button.onclick=()=>start(Number(button.dataset.room),build));
  ui.querySelector('select').onchange=event=>{build=event.target.value;if(room)start(rooms.indexOf(room),build);};
  ui.querySelector('[data-restart]').onclick=()=>start(rooms.indexOf(room),build);
  ui.querySelector('[data-continue]').onclick=()=>{
   if(room===groundRoom)location.href=bossLink;
   else start(rooms.indexOf(room)+1,build);
  };
  // The game listens for touch movement on the viewport.
  ui.addEventListener('pointerdown',event=>event.stopPropagation());
  $('pause-home').onclick=()=>location.reload();
  $('overlay').style.display='none';
  const requested=new URLSearchParams(location.search).get('room');
  const index=rooms.findIndex(r=>r.id===(requested==='B06'?'B04':requested));
  if(index>=0)start(index,requested==='B06'?'watch':'pistol');
 }

 function initWalk(){
  walking=true;
  state='bossGallery';
  $('viewport').classList.add('room-lab-walk');
  $('overlay').style.display='none';
  ui.classList.add('walking');
  ui.setAttribute('aria-label','步态观察');
  ui.innerHTML=`<div class="room-lab-panel">
   <header><h2>步态观察</h2><a href="?roomlab=1&amp;room=B04">返回尸潮</a></header>
   <div class="room-lab-controls">
    <button type="button" data-prev aria-label="上一只">‹</button>
    <select aria-label="选择敌人">${walkNames.map((name,i)=>`<option value="${i}">${name}</option>`).join('')}</select>
    <button type="button" data-next aria-label="下一只">›</button>
    <button type="button" data-pause>暂停</button>
   </div>
  </div>`;
  const select=ui.querySelector('select');
  function choose(index){
   walkIndex=(index+walkRoster.length)%walkRoster.length;
   select.value=String(walkIndex);
   walkPhase=0;
   const spec=walkRoster[walkIndex];
   walker={...spec,x:325,y:300,r:spec.radius??BRIDGE_MECHS[spec.type]?.radius??10,
    spiderScale:spec.scale,hp:1,max:1,t:0,seed:0,roll:0,rollHeading:0,bridgeRoller:true};
   advanceWalk(0);
  }
  select.onchange=()=>choose(Number(select.value));
  ui.querySelector('[data-prev]').onclick=()=>choose(walkIndex-1);
  ui.querySelector('[data-next]').onclick=()=>choose(walkIndex+1);
  ui.querySelector('[data-pause]').onclick=event=>{
   walkPaused=!walkPaused;
   event.currentTarget.textContent=walkPaused?'继续':'暂停';
  };
  choose(0);
 }

 function advanceWalk(dt){
  const e=walker,oldX=e.x,oldY=e.y;
  walkPhase+=dt*(BRIDGE_MECHS[e.type]?.speed??(e.type==='virusElite'?48:108))/81;
  e.x=325+81*Math.sin(walkPhase);
  e.y=300+30*Math.cos(walkPhase);
  e.rollHeading=Math.atan2(-30*Math.sin(walkPhase),81*Math.cos(walkPhase));
  if(!dt)return;
  e.roll+=Math.hypot(e.x-oldX,e.y-oldY)/19;
  e.t+=dt;
  if(e.type==='virusElite')updateVirusGait(e,dt);
  if(BRIDGE_MECHS[e.type])updateBridgeMechGait(e,dt,oldX,oldY,e);
 }

 function drawWalk(){
  const r=renderer,e=walker;
  if(!e||!r.ready||r.gl.isContextLost())return;
  r.cameraScale=.54;
  r.scenePerspective=false;
  r.sceneGrade=0;
  r.sceneFogDensity=0;
  r.backgroundColor=[.075,.09,.115];
  r.clubCyan=.1;
  r.clubMagenta=.1;
  r.topLight=[.95,.95,.95];
  r.rearLeftColor=[.58,.61,.65];
  r.rearRightColor=[.53,.56,.6];
  r.begin();
  const x=e.x-325,z=(e.y-300)*1.06;
  r.residentMesh('room-lab-walk-floor',()=>r.box(0,-5,0,280,10,160,'#303947'),monsterPose(0,0,0));
  r.residentMesh('room-lab-walk-shadow',()=>r.disc(0,0,0,1,'#1c232d'),monsterPose(x,.15,z,0,e.r,1,e.r*.75));
  if(e.type==='virusElite')drawVirusBoss(e);
  else drawResidentEnemy(e,x,z,0);
  r.end();
 }

 function start(index,weaponChoice='pistol'){
  room=rooms[index];build=weaponChoice;elapsed=0;nextAttack=room.bridge?4:1.5;attackRound=0;attack=null;rockets=[];
  if(build==='watch'&&room!==groundRoom)build='pistol';
  metrics={seconds:0,near:0,peak:0,hits:0,health:3};
  activeDifficulty=1;reset();testMode=true;floor=index+1;
  globalThis.TalentRuntime?.start({useLevels:false});
  globalThis.TowerResearch?.start(null);
  globalThis.Chips?.start(false);
  $('viewport').classList.remove('falling','landing');
  if(!room.bridge){
   tiles=[];
   for(let y=-2;y<=2;y++)for(let x=-2;x<=2;x++)tiles.push({x,y});
  }else tiles=HexMap.campaignFloor(new URLSearchParams(location.search).get('mapseed')||'elevator-01');
  // reset() builds the persistent bridge for its initial map during descent.
  // The lab replaces that map, so rebuild the bridge from the selected room.
  clearBridgeRoom(true);
  spawnPlayerAtCenter();p.hp=p.max=3;p.shield=0;
  weapon=createWeaponModel('pistol_t1');
  const referenceDamage=weapon.damage;
  weapon.damage*=damageScales[build]??1;
  shootTimer=build==='watch'?room.seconds+1:0;
  if(build==='watch')p.inv=room.seconds+1;
  startWave({bridgeWidth:room===groundRoom?2:1});
  spawnQueue=[];
  if(room===groundRoom){
   const hpFactor=difficultyFactor('hp')*enemyTierProfile(1).hp;
   spawnQueue=Array.from({length:5},(_,pack)=>hordeOrder.map((core,index)=>{
    const {hits,...spec}=core==='crawler'?{type:'crawler',hits:1}:hordeByCore.get(core==='heavy'?hordeHeavy[pack%hordeHeavy.length]:core);
    return {...spec,bridgeHp:hits*referenceDamage/hpFactor,bridgeHealthWidth:24+hits*6,
     bridgeRoller:true,side:(pack+index)%2,enemyTier:1};
   })).flat();
   timedRoom.bridgePopulation=32;
   timedRoom.bridgeReinforcementInterval=.25;
   timedRoom.bridgeCrowd=true;
  }else if(room.bridge){
   spawnQueue=Array.from({length:12},()=>({type:'crawler',bridgeRoller:true,side:0,enemyTier:1}));
  }else{
   clearBridgeRoom(true);
   const hp=index===0?18:28;
   enemies.push(...[-1,1].map(side=>({type:'moth',side,x:325+side*143,y:270,hp,max:hp,r:15,seed:side,deployGrace:Infinity})));
  }
  stageStats.plannedTotal=spawnQueue.length+enemies.length+Number(index===1);
  timedRoom.duration=timedRoom.remaining=room.seconds;
  timedRoom.surviveOnly=index===1;
  renderer.sceneKey=null;
  if(ui){
   ui.classList.add('playing');ui.querySelector('.room-lab-panel').style.setProperty('--room-color',room.color);
   ui.querySelector('option[value="watch"]').hidden=room!==groundRoom;
   ui.querySelector('select').value=build;
   ui.querySelectorAll('[data-room]').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
   ui.querySelector('[data-restart]').hidden=false;ui.querySelector('.room-lab-metrics').hidden=false;
   sync();
   focusGameControls();
  }
 }

 function missileEdge(x,y,dx,dy){
  const {width,height}=canvas.getBoundingClientRect();
  for(let distance=24;distance<=1440;distance+=24){
   const at={x:x+dx*distance,y:y+dy*distance};
   const screen=renderer.screenPoint(at.x-325,16,(at.y-300)*1.06);
   if(screen.x<-24||screen.x>width+24||screen.y<-24||screen.y>height+24)return at;
  }
  return {x:x+dx*720,y:y+dy*720};
 }

 function newAttack(){
  const round=attackRound++;
  if(room.bridge){
   const vertical=round%2===1,dir=round%4<2?1:-1;
   const dx=vertical?0:dir,dy=vertical?dir:0;
   const lanes=(room===groundRoom?[0,round%2?92:-92]:[0]).map(offset=>{
    const x=p.x+(vertical?offset:0),y=p.y+(vertical?0:offset);
    return {a:missileEdge(x,y,-dx,-dy),b:missileEdge(x,y,dx,dy)};
   });
   attack={lanes,age:0};beep(280,.18,'triangle',.055);
   return;
  }
  const live=enemies.filter(e=>e.type==='moth'&&e.hp>0);
  const side=round%2?-1:1;
  const moth=live.find(e=>e.side===side)||live[0];
  if(moth){attack={moth,age:0};beep(445,.12,'sine',.04);}
 }

 function advanceAttack(dt){
  if(!attack)return;
  attack.age+=dt;
  if(attack.lanes){
   if(attack.age<1.25)return;
   for(const {a,b} of attack.lanes)rockets.push({x:a.x,y:a.y,a:Math.atan2(b.y-a.y,b.x-a.x),left:Math.hypot(b.x-a.x,b.y-a.y),r:14});
   enemyShotSound('fighter');attack=null;
  }else{
   if(attack.age<.85)return;
   const e=attack.moth;
   if(e.hp>0){
    fire(e);
    if(room===rooms[2]){
     const angle=Math.atan2(p.y-e.y,p.x-e.x);
     for(let i=-2;i<=2;i++)bullet(e.x,e.y,angle+i*.22,170,'#ff8d99',4);
    }
   }
   attack=null;
  }
 }

 function tick(dt){
  if(!room)return;
  const previous=elapsed;
  elapsed+=dt;
  if(room===rooms[1]&&timedRoom.surviveOnly){
   if(previous<5&&elapsed>=5)beep(143,.26,'triangle',.06);
   if(elapsed>=6.5){
    timedRoom.surviveOnly=false;
    spawnQueue.push({type:'virusElite',bridgeRoller:true,side:0,elite:true,enemyTier:2});
   }
  }
  if(elapsed+1e-9>=nextAttack&&timedRoom.remaining>2.5){
   newAttack();
   nextAttack+=room.volley;
  }
  advanceAttack(dt);
  if(state!=='combat')return;
  for(const m of rockets){
   const travel=Math.min(m.left,dt*235),x=m.x,y=m.y;
   m.left-=travel;m.x+=Math.cos(m.a)*travel;m.y+=Math.sin(m.a)*travel;
   if(segmentHits(x,y,m.x,m.y,{x:p.x,y:p.y,r:drinkPlayerRadius()},m.r)){
    hurt(m);spawnExplosionFX(m.x,m.y,25);m.left=0;
    if(state!=='combat')break;
   }
  }
  rockets=rockets.filter(m=>m.left>0);
 }

 function sample(dt){
  const projectiles=[...bullets.filter(b=>b.life>0),...missiles.filter(m=>m.hp>0&&m.life>0),...rockets];
  const near=e=>Math.hypot(e.x-p.x,e.y-p.y)<3*TILE;
  const contacts=enemies.filter(e=>e.hp>0&&isMeleeEnemy(e));
  metrics.seconds+=dt;
  if(projectiles.some(near)||contacts.some(near))metrics.near+=dt;
  metrics.peak=Math.max(metrics.peak,projectiles.length);
  const health=p.hp+p.shield;
  if(health<metrics.health)metrics.hits++;
  metrics.health=health;
 }

 function stats(){
  const {defeated}=stageResultStats();
  return {seconds:metrics.seconds,near:100*metrics.near/Math.max(.001,metrics.seconds),peak:metrics.peak,hits:metrics.hits,defeated,cash,cleared:state==='stageClear'};
 }

 function lane(a,b,width,color){
  const dx=b.x-a.x,dz=(b.y-a.y)*1.06,len=Math.hypot(dx,dz)||1,nx=-dz/len*width,nz=dx/len*width;
  const ax=a.x-325,az=(a.y-300)*1.06,bx=b.x-325,bz=(b.y-300)*1.06;
  renderer.transparentQuad([ax+nx,5,az+nz],[ax-nx,5,az-nz],[bx-nx,5,bz-nz],[bx+nx,5,bz+nz],color,[.26,.26,.26,.26]);
  for(const sign of [-1,1]){
   const x=nx*sign,z=nz*sign;
   renderer.emissiveQuad([ax+x,5.4,az+z],[ax+x-nx*.07*sign,5.4,az+z-nz*.07*sign],[bx+x-nx*.07*sign,5.4,bz+z-nz*.07*sign],[bx+x,5.4,bz+z],color);
  }
 }

 function draw(){
  if(!room)return;
  if(state==='combat'){
   for(const {start,entry} of bridgeRoom?.ends??[]){
    const point={x:entry.x+(start.x-entry.x)*.23,y:entry.y+(start.y-entry.y)*.23};
    const warning=room===rooms[1]&&elapsed>=5&&elapsed<6.5;
    lane(entry,point,warning?30:3,room.color);
    renderer.emissiveRing(entry.x-325,5,(entry.y-300)*1.06,(warning?32:16)+Math.sin(time*5)*3,room.color,2);
   }
   if(attack?.lanes)for(const {a,b} of attack.lanes)lane(a,b,21,'#ff667d');
   if(attack?.moth?.hp>0){
    const e=attack.moth;
    renderer.emissiveRing(e.x-325,5,(e.y-300)*1.06,21,room.color,3);
   }
   for(const m of rockets)drawMetalMissile(m.x-325,16,(m.y-300)*1.06,Math.atan2(Math.sin(m.a)*1.06,Math.cos(m.a)),'red',m);
  }
  if(ui)sync();
 }

 function sync(){
  const s=stats(),ended=state==='dead'||state==='stageClear';
  const status=ui.querySelector('.room-lab-status'),readout=ui.querySelector('.room-lab-metrics');
  const label=state==='dead'?'挑战失败':state==='stageClear'?'挑战完成':`${Math.max(0,timedRoom.remaining).toFixed(1)} 秒`;
  const statusText=`${label}  ·  ${room.hint}`;
  const metricText=`击杀 ${s.defeated} · 金币 ${s.cash} · 受击 ${s.hits} · 近身 ${Math.round(s.near)}% · 弹体峰值 ${s.peak}`;
  if(status.textContent!==statusText)status.textContent=statusText;
  if(readout.textContent!==metricText)readout.textContent=metricText;
  ui.classList.toggle('ended',ended);
  ui.querySelector('[data-continue]').hidden=state!=='stageClear';
 }

 // Sample after the shared collision and damage pipeline has advanced.
 const gameStep=step;
 step=function(dt,realDt=dt){
  if(walking){if(!walkPaused)advanceWalk(dt);return;}
  const running=room&&state==='combat'&&!paused&&timedRoom?.introLeft<=0;
  gameStep(dt,realDt);
  if(running)sample(Math.max(0,realDt));
 };

 return {init,start,tick,draw,stats,drawWalk,get walking(){return walking;},get active(){return !!room;}};
})();

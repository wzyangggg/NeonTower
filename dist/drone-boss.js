'use strict';
const DRONE_BOSS_HP=900,DRONE_BOSS_NAMES=['横移点射','锁定轰炸','旋转十字弹幕','回收锯刃'];
const DRONE_SAW_RECALL_TIME=6,DRONE_SAW_WARNING=.7,DRONE_SAW_COUNT=12,DRONE_SAW_RADIUS=25;
const DRONE_MINION_CAP=6,DRONE_MINION_HP=2,DRONE_MINION_SPEED=145/3,DRONE_MINION_DEPLOY_INTERVAL=6,DRONE_MINION_TOTAL=18,DRONE_REPAIR_TOTAL=60;
const DRONE_LAUNCH_DURATION=.8;
function launchDroneSawVolley(e){
 if(droneSaws.length+DRONE_SAW_COUNT>24)return;
 const aim=Math.atan2(p.y-e.y,p.x-e.x);
 for(let i=0;i<DRONE_SAW_COUNT;i++){
  const angle=aim+i*TAU/DRONE_SAW_COUNT;
  droneSaws.push({x:e.x,y:e.y,vx:Math.cos(angle)*240,vy:Math.sin(angle)*240,r:DRONE_SAW_RADIUS,age:0,spin:0,phase:'outbound',volley:e.sawVolley,recallWarn:false,done:false});
 }
 beep(190,.12,'sawtooth',.025);
}
function recallDroneSaws(e){
 if(e.sawsRecalled)return;e.sawsRecalled=true;
 for(const s of droneSaws)if(s.volley===e.sawVolley&&!s.done){s.phase='returning';s.recallWarn=false;s.recalledAt=e.t;}
 beep(520,.13,'triangle',.03);
}
function updateDroneSaws(dt){
 const e=droneBoss;if(!e||e.hp<=0){droneSaws=[];return;}
 for(const s of droneSaws){
  const oldX=s.x,oldY=s.y;s.age+=dt;s.spin+=dt*(s.phase==='stuck'?5:24);
  if(s.phase==='outbound'){
   const dx=s.vx*dt,dy=s.vy*dt,left=A.x+s.r,right=A.x+A.w-s.r,top=A.y+s.r,bottom=A.y+A.h-s.r;
   let fraction=1;
   if(dx>0)fraction=Math.min(fraction,(right-s.x)/dx);else if(dx<0)fraction=Math.min(fraction,(left-s.x)/dx);
   if(dy>0)fraction=Math.min(fraction,(bottom-s.y)/dy);else if(dy<0)fraction=Math.min(fraction,(top-s.y)/dy);
   fraction=Math.max(0,fraction);s.x+=dx*fraction;s.y+=dy*fraction;
   if(fraction<1||s.x<=left||s.x>=right||s.y<=top||s.y>=bottom){s.phase='stuck';s.vx=s.vy=0;burst(s.x,s.y,'#ffd18d',5);}
  }else if(s.phase==='returning'){
   const dx=e.x-s.x,dy=e.y-s.y,d=Math.hypot(dx,dy),move=Math.min(d,300*dt);
   if(d){s.x+=dx/d*move;s.y+=dy/d*move;}
   if(d-move<=e.r+8)s.done=true;
  }
  // Swept collision also covers a moving player and fast returning blades.
  if(bulletClosestDistance(s,oldX,oldY)<s.r){hurt(s);if(state!=='combat')return;}
 }
 droneSaws=droneSaws.filter(s=>!s.done&&s.age<18);
}
function livingDroneMinions(){return enemies.filter(e=>e.type==='droneMinion'&&e.hp>0);}
function deployDroneMinions(e,suicideOnly=false){
 if(e.hp<=0||state!=='combat')return 0;
 let count=0;
 for(let slot=0;slot<6;slot++){
  const alive=livingDroneMinions();if(alive.length>=DRONE_MINION_CAP)break;
  const role=(suicideOnly?['suicide']:['shooter','repair','suicide']).find(role=>(role==='suicide'||e.minionsSpawned<DRONE_MINION_TOTAL)&&alive.filter(q=>q.role===role).length<2);if(!role)break;
  const side=slot%2?1:-1,dx=side*44,dz=(Math.floor(slot/2)-1)*36,x=e.x+Math.cos(e.angle)*dx+Math.sin(e.angle)*dz,y=e.y+(-Math.sin(e.angle)*dx+Math.cos(e.angle)*dz)/1.06;
  const launchAngle=Math.atan2(y-e.y,x-e.x),hp=role==='shooter'?4:DRONE_MINION_HP;
  const spawnX=Math.max(A.x+22,Math.min(A.x+A.w-22,x)),spawnY=Math.max(A.y+22,Math.min(A.y+A.h-22,y)),ux=Math.cos(launchAngle),uy=Math.sin(launchAngle);
  // Fix the endpoint inside the arena so even a wall-facing launch eases to a stop.
  const launchDistance=Math.max(0,Math.min(150,ux>0?(A.x+A.w-22-spawnX)/ux:ux<0?(A.x+22-spawnX)/ux:Infinity,uy>0?(A.y+A.h-22-spawnY)/uy:uy<0?(A.y+22-spawnY)/uy:Infinity));
  enemies.push({type:'droneMinion',role,launchAngle,launchDistance,x:Math.max(A.x+22,Math.min(A.x+A.w-22,x)),y:Math.max(A.y+22,Math.min(A.y+A.h-22,y)),hp,max:hp,r:role==='shooter'?18:role==='suicide'?12:15,t:0,seed:e.minionsSpawned,angle:e.angle,hitAt:-Infinity,launchLeft:DRONE_LAUNCH_DURATION,deploySide:side,fire:1.4,rounds:0,roundGap:0,aim:0,warn:false,flash:0,repairRemaining:10,repairing:false});if(role!=='suicide')e.minionsSpawned++;count++;
 }
 if(count){e.deployFlash=.35;beep(460,.1,'triangle',.025);}return count;
}
function explodeDroneMinion(e){
 if(e.role!=='suicide'||e.exploded)return;e.exploded=true;onDrinkEnemyDeath(e);
 for(let i=0;i<6;i++){bullet(e.x,e.y,i*TAU/6+Math.PI/6,145,'#ffad70',3,4);const b=bullets.at(-1);b.droneCorpse=true;b.life=6;}
 burst(e.x,e.y,'#ffad70',8);
}
function updateDroneMinions(dt){
 const boss=droneBoss;if(!boss||boss.hp<=0)return;
 for(const e of livingDroneMinions()){if(e.terrainStun>0||globalThis.ElectricTiles?.frozen(e))continue;let coverX=e.x,coverY=e.y;
  e.t+=dt;e.flash=Math.max(0,e.flash-dt);e.repairing=false;
  // Old aircraft leave without a death attack or reward; production is finite.
  if(e.t>=20){e.hp=0;continue;}
  const speed=e.role==='suicide'?195:e.role==='repair'?155:DRONE_MINION_SPEED;
  const before=e.launchLeft,launch=Math.min(dt,before);e.launchLeft=Math.max(0,before-dt);
  // Integrate quadratic deceleration exactly, so launch travel is frame-rate independent.
  // Cubic ease-out reaches the fixed endpoint at zero speed before normal AI takes over.
  const jetTravel=e.launchDistance*(before**3-e.launchLeft**3)/DRONE_LAUNCH_DURATION**3;
  e.x=Math.max(A.x+22,Math.min(A.x+A.w-22,e.x+Math.cos(e.launchAngle)*jetTravel));
  e.y=Math.max(A.y+22,Math.min(A.y+A.h-22,e.y+Math.sin(e.launchAngle)*jetTravel));
  resolveEnemyCover(e,coverX,coverY);coverX=e.x;coverY=e.y;
  const active=dt-launch;if(active<=0)continue;
  let tx,ty;
  if(e.role==='suicide'){tx=p.x;ty=p.y;}else{
   e.roamLeft=(e.roamLeft||0)-active;
   if(e.roamLeft<=0||!Number.isFinite(e.roamX)||Math.hypot(e.roamX-e.x,e.roamY-e.y)<18){
    // Each aircraft picks its own world-space destination, independent of targets.
    for(let attempt=0;attempt<8;attempt++){
     e.roamX=A.x+22+Math.random()*(A.w-44);e.roamY=A.y+22+Math.random()*(A.h-44);
     if(Math.hypot(e.roamX-e.x,e.roamY-e.y)>80)break;
    }
    e.roamLeft=.9+Math.random()*1.4;
   }
   tx=e.roamX;ty=e.roamY;
  }
  tx=Math.max(A.x+22,Math.min(A.x+A.w-22,tx));ty=Math.max(A.y+22,Math.min(A.y+A.h-22,ty));
  const dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy),move=Math.min(d,speed*active);
  if(d){e.x+=dx/d*move;e.y+=dy/d*move;}
  resolveEnemyCover(e,coverX,coverY);
  const yaw=Math.atan2(dx,dy*1.06);
  e.angle+=Math.atan2(Math.sin(yaw-e.angle),Math.cos(yaw-e.angle))*Math.min(1,active*8);
  if(e.role==='repair'){
   if(time-e.hitAt>=.8&&Math.hypot(e.x-boss.x,e.y-boss.y)<=90){
    const heal=Math.max(0,Math.min(2*active,e.repairRemaining,boss.repairLeft,boss.max-boss.hp));
    if(heal>0){boss.hp+=heal;boss.repairLeft-=heal;e.repairRemaining-=heal;e.repairing=true;}
   }
  }else if(e.role==='shooter'){
   e.fire-=active;e.roundGap-=active;
   if(e.rounds===0&&e.fire<=.65&&!e.warn){e.warn=true;e.aim=Math.atan2(p.y-e.y,p.x-e.x);}
   if(e.fire<=0&&e.rounds===0){e.rounds=3;e.roundGap=0;e.fire=3.4;e.warn=false;}
   while(e.rounds>0&&e.roundGap<=0){
    bullet(e.x,e.y,e.aim,175,'#88dfff',3,4);const b=bullets.at(-1);b.droneShooter=true;b.life=6;
    e.rounds--;e.roundGap+=.16;e.flash=.1;enemyShotSound();
   }
  }
  if(Math.hypot(p.x-e.x,p.y-e.y)<e.r+5+drinkPlayerRadius()-4){if(e.role==='suicide'){e.hp=0;explodeDroneMinion(e);}hurt(e);if(state!=='combat')return;}
 }
 enemies=enemies.filter(e=>e.hp>0);
}
function spawnDroneBoss(){
 const e={type:'droneBoss',x:325,y:185,hp:DRONE_BOSS_HP,max:DRONE_BOSS_HP,r:52,t:0,seed:0,hitAt:-Infinity,pattern:0,patternAge:0,fire:.8,angle:0,flash:0,attacks:0,enraged:false,deployTimer:2,suicideTimer:2,deployFlash:0,sawVolley:0,sawsRecalled:false,minionsSpawned:0,repairLeft:DRONE_REPAIR_TOTAL};
 droneBoss=e;enemies.push(e);return e;
}
function fireDroneBoss(e){
 if(e.pattern===0){
  // The fan locks its aim at release; fired rounds never track the player.
  const side=e.attacks%2?1:-1,dx=side*24,dz=52;
  const x=e.x+Math.cos(e.angle)*dx+Math.sin(e.angle)*dz,y=e.y+(-Math.sin(e.angle)*dx+Math.cos(e.angle)*dz)/1.06;
  const aim=Math.atan2(p.y-y,p.x-x);
  for(let i=-1;i<=1;i++)bullet(x,y,aim+i*.19,205,'#ffbc70',4,5);
 }else if(e.pattern===1){
  // Ground coordinates lock immediately, leaving 1.1 seconds to walk away.
  hazards.push({x:p.x,y:p.y,t:0,droneBomb:true,detonated:false});
 }else if(e.pattern===2){
  for(let i=0;i<4;i++)bullet(e.x,e.y,e.t*.65+i*TAU/4,155,'#82eaff',4,5);
 }else launchDroneSawVolley(e);
 e.flash=.13;e.attacks++;e.pattern===0||e.pattern===2?enemyShotSound():beep(e.pattern===1?240:145,.07,'triangle',.023);
}
function droneBombImpact(h){
 if(h.detonated)return;h.detonated=true;
 for(let i=0;i<8;i++)bullet(h.x,h.y,i*TAU/8+Math.PI/8,135,'#ffb675',4,5);
 burst(h.x,h.y,'#ffd49a',10);explosionSound();
}
function updateDroneBoss(dt){
 const e=droneBoss;if(!e||e.hp<=0)return;
 // Small steps keep low-FPS movement, timers and attack counts consistent.
 const steps=Math.max(1,Math.ceil(dt/(1/120))),h=dt/steps;
 for(let n=0;n<steps;n++){const coverX=e.x,coverY=e.y;
  e.t+=h;e.patternAge+=h;e.flash=Math.max(0,e.flash-h);
  // Deployment runs alongside every attack, including saw launch and recall.
  // A full hangar or exhausted reserve must never interrupt the weapon cycle.
  e.deployFlash=Math.max(0,e.deployFlash-h);e.deployTimer-=h;
  if(e.deployTimer<=0){deployDroneMinions(e);e.deployTimer+=DRONE_MINION_DEPLOY_INTERVAL;}
  e.suicideTimer-=h;if(e.suicideTimer<=0){deployDroneMinions(e,true);e.suicideTimer+=1.5;}
  if(!e.enraged&&e.hp<=e.max*.5){e.enraged=true;beep(360,.15,'triangle',.03);}
  const duration=e.pattern===3?9:e.enraged?5:6;
  if(e.patternAge>=duration){e.patternAge-=duration;e.pattern=(e.pattern+1)%DRONE_BOSS_NAMES.length;e.fire=.8;if(e.pattern===3){e.sawVolley++;e.sawsRecalled=false;}beep(280,.07,'triangle',.018);}
  if(e.pattern===3){
   for(const s of droneSaws)if(s.volley===e.sawVolley&&s.phase!=='returning')s.recallWarn=e.patternAge>=DRONE_SAW_RECALL_TIME-DRONE_SAW_WARNING;
   if(e.patternAge>=DRONE_SAW_RECALL_TIME)recallDroneSaws(e);
  }
  // Wide lateral flight, a quieter bomb hover and a central orbit.
  const tx=e.pattern===0?325+Math.sin(e.t*.95)*150:e.pattern===1?325+Math.sin(e.t*.45)*90:325+Math.sin(e.t*.75)*100;
  const ty=e.pattern===0?195+Math.sin(e.t*.5)*28:e.pattern===1?190:245+Math.cos(e.t*.75)*55;
  const distance=Math.hypot(tx-e.x,ty-e.y),travel=Math.min(distance,125*h);
  if(distance){e.x+=(tx-e.x)/distance*travel;e.y+=(ty-e.y)/distance*travel;}
  e.x=Math.max(A.x+90,Math.min(A.x+A.w-90,e.x));e.y=Math.max(A.y+90,Math.min(A.y+A.h-90,e.y));
  resolveEnemyCover(e,coverX,coverY);
  const target=Math.atan2(p.x-e.x,(p.y-e.y)*1.06),delta=Math.atan2(Math.sin(target-e.angle),Math.cos(target-e.angle));e.angle+=delta*Math.min(1,h*5);
  e.fire=attackCooldown(e.fire,h,.5);e.warn=e.fire<.5;
  // Three locked drops per bombing pass, spaced far enough to retain exits.
  if(e.fire<=0){if(e.pattern===3?e.patternAge<1:e.pattern!==1||e.patternAge<3.3)fireDroneBoss(e);e.fire+=([.85,1.15,.48,1.2][e.pattern])*(e.enraged?.8:1);}
  if(Math.hypot(p.x-e.x,p.y-e.y)<e.r+drinkPlayerRadius()-4+7){hurt(e);if(state!=='combat')return;}
 }
}
function drawDroneSaws(){
 const r=renderer;
 for(const s of droneSaws){
  const x=s.x-325,z=(s.y-300)*1.06;
  r.residentMesh('drone-boss:saw',()=>{
   // Same radius, teeth and hub dimensions as the scene's stationary saw.
   r.disc(0,0,0,17,'#aeb9b8');r.ring(0,.2,0,14,'#4b5c61',2);
   for(let i=0;i<12;i++){const a=i*TAU/12;r.box(Math.cos(a)*18,.5,Math.sin(a)*18,9,3,5,'#edf4ed',-a);}
   r.box(0,.7,0,26,1,3,'#485b61');r.sphere(0,1.5,0,5,'#d4a27d',1,.45,1);
  },monsterPose(x,16,z,-s.spin));
  r.residentMesh('drone-boss:saw-core:'+s.phase,()=>r.emissiveBox(0,0,0,4,2,4,s.phase==='returning'?'#ff735b':s.phase==='stuck'?'#f4bd72':'#71dbe6'),monsterPose(x,19,z));
  if(s.recallWarn){const pulse=.5+.5*Math.sin(time*22);r.emissiveRing(x,4,z,30,'#ff745e',1.5+pulse);r.glow(x,18,z,8,'#ff9f68');}
 }
}
function buildDroneBossShell(){
 const r=renderer;
 r.sphere(0,0,0,39,'#d6dfe0',1.15,.38,.9,6,12);
 r.box(0,-9,0,52,14,44,'#304752');r.box(0,7,0,35,9,28,'#edf0dc');
 r.box(0,13,0,21,3,17,'#465b64');r.emissiveBox(0,15,0,13,2,9,'#70e4de');
 // Four ducted rotors make the silhouette visibly different from the spider.
 for(const sx of [-1,1])for(const sz of [-1,1]){
  drawSpiderStrut([sx*22,0,sz*16],[sx*63,0,sz*44],9,'#607782');
  r.ring(sx*63,0,sz*44,24,'#b7c7ca',5);r.ring(sx*63,3,sz*44,24,'#344953',2);
  r.sphere(sx*63,0,sz*44,6,'#435a63',1,.8,1,3,6);
  r.emissiveBox(sx*63,5,sz*68,13,2,3,'#67d9d3');
 }
 for(const sx of [-1,1]){
  r.box(sx*24,-12,30,12,12,26,'#566c77');r.box(sx*24,-12,46,8,8,13,'#263d48');
  r.emissiveBox(sx*14,0,32,8,5,4,'#ffad62');
  for(let i=0;i<3;i++)r.box(sx*32,6,-12+i*9,3,3,5,'#4c6269');
 }
 r.sphere(0,-14,18,12,'#263e49',1,.8,1,4,8);r.emissiveBox(0,-14,29,9,5,3,'#7ef1ec');
 r.box(0,19,-17,2,16,2,'#5a7580');r.emissiveBox(0,28,-17,4,4,4,'#ffb578');
 r.markPhosphor(0,.07);
}
function drawDroneBoss(e){
 const r=renderer,x=e.x-325,z=(e.y-300)*1.06,hover=73+Math.sin(e.t*3)*4,hit=enemyHitFeedback(e),yaw=e.angle;
 r.residentMesh('drone-boss:shadow',()=>r.disc(0,0,0,65,'#34464a'),monsterPose(x,2.5,z));
 r.residentMesh('drone-boss:shell',buildDroneBossShell,monsterPose(x,hover,z,yaw),hit);
 for(const sx of [-1,1])for(const sz of [-1,1]){
  const dx=sx*63,dz=sz*44,rx=x+Math.cos(yaw)*dx+Math.sin(yaw)*dz,rz=z-Math.sin(yaw)*dx+Math.cos(yaw)*dz;
  r.residentMesh('drone-boss:rotor',()=>{r.box(0,0,0,38,2,4,'#7b949d');r.box(0,0,0,4,2,38,'#7b949d');},monsterPose(rx,hover+1,rz,e.t*32*sx*sz+yaw),hit);
 }
 r.residentMesh('drone-boss:core:'+e.enraged,()=>r.emissiveBox(0,0,0,14,4,10,e.enraged?'#ff745d':'#74e6de'),monsterPose(x,hover+16,z,yaw),hit);
 if(e.warn||e.flash>0)r.glow(x,hover-8,z,10,e.flash>0?'#fff0bf':'#ff9b63');
 if(e.deployFlash>0)r.glow(x,hover-19,z,17,'#ffa16d');
 if(e.pattern===0&&e.flash>0){const dx=(e.attacks%2?-1:1)*24,dz=52;r.glow(x+Math.cos(yaw)*dx+Math.sin(yaw)*dz,hover-12,z-Math.sin(yaw)*dx+Math.cos(yaw)*dz,8,'#fff0bf');}
 for(const h of hazards)if(h.droneBomb&&h.t<1.1){
  const height=145*(1-h.t/1.1)+8;
  r.residentMesh('drone-boss:bomb',()=>{r.sphere(0,0,0,9,'#b6c6c8',1,1.4,1,4,8);r.emissiveBox(0,-8,0,7,4,7,'#ffac69');},monsterPose(h.x-325,height,(h.y-300)*1.06));
 }
 drawPlaneVulnerability(e,x,z);drawMonsterHealthBar(x,hover+42,z,e.hp,e.max,12,112,6,e.enraged?'#ff967a':'#91ddd9',e);
}
function drawDroneMinion(e){
 const r=renderer,x=e.x-325,z=(e.y-300)*1.06,scale=e.role==='shooter'?.28:e.role==='suicide'?.18:.24,hover=35+e.launchLeft/DRONE_LAUNCH_DURATION*20.8+Math.sin(e.t*6)*2,yaw=e.angle,hit=enemyHitFeedback(e);
 r.residentMesh('drone-minion:shadow',()=>r.disc(0,0,0,18,'#34464a'),monsterPose(x,2.5,z));
 r.residentMesh('drone-boss:shell',buildDroneBossShell,monsterPose(x,hover,z,yaw,scale,scale,scale),hit);
 for(const sx of [-1,1])for(const sz of [-1,1]){
  const dx=sx*63*scale,dz=sz*44*scale;
  r.residentMesh('drone-boss:rotor',()=>{r.box(0,0,0,38,2,4,'#7b949d');r.box(0,0,0,4,2,38,'#7b949d');},monsterPose(x+Math.cos(yaw)*dx+Math.sin(yaw)*dz,hover+scale,z-Math.sin(yaw)*dx+Math.cos(yaw)*dz,e.t*40*sx*sz+yaw,scale,scale,scale),hit);
 }
 const repair=e.role==='repair',color=repair?'#88efa0':e.role==='suicide'?'#ffad70':'#82dfff';
 r.residentMesh('drone-minion:core:'+e.role,()=>{
  if(repair){r.emissiveBox(0,0,0,9,2,3,color);r.emissiveBox(0,0,0,3,2,9,color);}
  else if(e.role==='suicide'){r.sphere(0,-3,0,7,'#684636',1,.7,1);r.emissiveBox(0,0,0,8,3,8,color);}
  else{r.emissiveBox(0,0,0,5,2,4,color);r.box(0,-6,13,5,5,14,'#375365');}
 },monsterPose(x,hover+4,z,yaw,scale/.24,scale/.24,scale/.24),hit);
 if(e.repairing&&droneBoss?.hp>0){
  const q=droneBoss,bx=q.x-325,bz=(q.y-300)*1.06,pulse=.5+.5*Math.sin(time*12);
  monsterStrut([x,hover,z],[bx,63,bz],3.5,'#58ff94');
  r.glow(x,hover+5,z,11,'#58ff94');r.glow(bx,64,bz,20,'#58ff94');
  r.emissiveRing(bx,5,bz,58+pulse*9,'#58ff94',2.5);
  r.residentMesh('drone-boss:repair-cross',()=>{r.emissiveBox(0,0,0,22,6,4,'#9dffbd');r.emissiveBox(0,0,0,6,22,4,'#9dffbd');},monsterPose(bx,88+pulse*5,bz));
  for(let i=0;i<3;i++){const t=(time*1.8+i/3)%1;r.glow(x+(bx-x)*t,hover+(63-hover)*t,z+(bz-z)*t,5,'#b9ffd1');}
 }
 if(e.warn)r.emissiveRing(x,3,z,21,color,1.3);if(e.flash>0)r.glow(x,hover,z,6,'#d9f5ff');
 drawPlaneVulnerability(e,x,z);drawMonsterHealthBar(x,hover+12,z,e.hp,e.max,e.max,e.role==='suicide'?18:28,3,color,e);
 if(e.launchLeft>0){for(let i=1;i<=3;i++)r.glow(x-Math.cos(e.launchAngle)*i*9,hover,z-Math.sin(e.launchAngle)*i*9*1.06,6-i,'#d0fff0');}
}
function droneBossTestHud(){
 const e=droneBoss;if(!e)return;$('zone').textContent='大无人机 BOSS 测试场';$('status').textContent='空域镇压者'+(e.enraged?' · 过载':'');
 $('wave').textContent=DRONE_BOSS_NAMES[e.pattern]+(e.pattern===3&&e.patternAge>=4.3?(e.patternAge<DRONE_SAW_RECALL_TIME?' · 即将回收':' · 同步回收'):e.patternAge<.8?' · 准备':'')+' · 自爆 '+livingDroneMinions().filter(q=>q.role==='suicide').length+' / 射击 '+livingDroneMinions().filter(q=>q.role==='shooter').length+' / 维修 '+livingDroneMinions().filter(q=>q.role==='repair').length+' · 支援后备 '+(DRONE_MINION_TOTAL-e.minionsSpawned);
 const bar=$('drone-boss-health');bar.textContent=Math.ceil(Math.max(0,e.hp))+' / '+e.max;bar.style.setProperty('--snake-hp',Math.max(0,e.hp/e.max*100)+'%');
}
function finishDroneBossTest(won){
 if(!droneBossTest)return;state=won?'menu':'dead';cleared=won;paused=false;releaseJoy();bullets=[];shots=[];missiles=[];hazards=[];droneSaws=[];enemies=enemies.filter(e=>e.type!=='droneMinion');
 showOverlay('<div class="tag">AIRSPACE LAB</div><h2>'+(won?'空域镇压者已击败':'测试结束')+'</h2><p>自爆无人机 · 射击无人机 · 维修无人机 · 有限后备</p><button class="primary" id="drone-boss-again">重新测试</button><a href="index.html">返回普通游戏</a>');$('drone-boss-again').onclick=startDroneBossTest;
}
function testDroneSawAttack(){
 if(!droneBossTest||state!=='combat'||!droneBoss||droneBoss.hp<=0)return;
 droneSaws=[];droneBoss.pattern=3;droneBoss.patternAge=0;droneBoss.fire=.8;droneBoss.sawVolley++;droneBoss.sawsRecalled=false;droneBossTestHud();
}
function startDroneBossTest(){
 reset();droneBossTest=true;testMode=true;state='combat';phase=0;scroll=0;floor=1;cleared=false;paused=false;
 $('viewport').classList.remove('falling','landing','boss-intro','paused');clearTimeout(toast.timer);$('toast').classList.remove('show');$('toast').textContent='';
 tiles=[];syncGrid();for(let y=grid.minY;y<=grid.maxY;y++)for(let x=grid.minX;x<=grid.maxX;x++)tiles.push({x,y,healProgress:0,healFlash:0,medPack:false});
 p.x=325;p.y=435;p.hp=p.max=8;p.inv=2;spawnQueue=[];chaserSpawned=999;spawnTimer=999;weapon=createWeapon('rifle');shootTimer=1.5;spawnDroneBoss();renderer.sceneKey=null;renderer.sceneData=null;
 $('overlay').style.display='none';$('drone-boss-tools').hidden=false;$('drone-boss-restart').onclick=startDroneBossTest;
 $('drone-boss-saws').onclick=testDroneSawAttack;
 $('drone-boss-god').onclick=()=>{droneBossGod=!droneBossGod;$('drone-boss-god').textContent='无敌 '+(droneBossGod?'ON':'OFF');};$('drone-boss-god').textContent='无敌 '+(droneBossGod?'ON':'OFF');
 updateUI();droneBossTestHud();draw();syncMusic();
}

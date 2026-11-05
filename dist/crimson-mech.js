'use strict';
const CRIMSON_SCALE=1.6*2/3;
const CRIMSON_ATTACKS=['strafe','laser','missiles','skyline'];
const CRIMSON_NAMES={strafe:'双枪扇形压制',missiles:'背部六联装 · 燃烧导弹',laser:'锁向蓄能 · 移动激光',skyline:'前方纵列 · 垂直轰炸'};
function updateCrimsonGait(e,dt,vx,vz){
 const g=e.gait;g.running=false;
 g.height+=(62-g.height)*Math.min(1,dt*10);
 for(const leg of g.legs)if(leg.swing&&!Number.isFinite(leg.swing.duration)){leg.swing=null;leg.foot[1]=4;}
 for(const leg of g.legs)if(leg.swing){const s=leg.swing;s.age=Math.min(s.duration,s.age+dt);const t=s.age/s.duration,u=t*t*(3-2*t);leg.foot=s.from.map((v,j)=>v+(s.to[j]-v)*u);leg.foot[1]+=Math.sin(t*Math.PI)*21;leg.angle=s.angleFrom+Math.atan2(Math.sin(s.angleTo-s.angleFrom),Math.cos(s.angleTo-s.angleFrom))*u;if(t>=1){leg.foot=s.to;leg.angle=s.angleTo;leg.swing=null;}}
 if(g.legs.some(l=>l.swing))return;
 for(const i of [g.next,1-g.next]){const leg=g.legs[i],q=humanoidFootTarget(e,i);q[0]+=vx*.26;q[2]+=vz*.26;
  if(Math.hypot(q[0]-leg.foot[0],q[2]-leg.foot[2])>28||Math.abs(Math.atan2(Math.sin(e.angle-leg.angle),Math.cos(e.angle-leg.angle)))>.4){leg.swing={from:[...leg.foot],to:q,age:0,duration:.36,angleFrom:leg.angle,angleTo:e.angle};g.next=1-i;break;}
 }
}
function stabilizeCrimsonContacts(e){
 if(e.slash&&!e.slash.barrage&&e.slash.kind!=='laser')return;
 // Keep the body inside both leg reach circles as long steps turn or land.
 let x=e.x-325,z=(e.y-300)*1.06;
 for(let pass=0;pass<16;pass++)for(let i=0;i<2;i++){
  const foot=e.gait.legs[i].foot,side=i===0?-14:14,cx=foot[0]-Math.cos(e.angle)*side,cz=foot[2]+Math.sin(e.angle)*side;
  const radius=Math.sqrt(Math.max(0,69.2**2-(e.gait.height-foot[1])**2)),dx=x-cx,dz=z-cz,d=Math.hypot(dx,dz);
  if(d>radius&&d>0){x=cx+dx/d*radius;z=cz+dz/d*radius;}
 }
 e.x=x+325;e.y=z/1.06+300;
}
function turnCrimsonBody(e,dt,speed){
 const wanted=Math.atan2(p.x-e.x,(p.y-e.y)*1.06),delta=Math.atan2(Math.sin(wanted-e.angle),Math.cos(wanted-e.angle));
 e.angle+=Math.max(-speed*dt,Math.min(speed*dt,delta));
}
function startCrimsonLaser(e){
 if(e.slash||e.dash||e.hp<=0||state!=='combat')return;
 e.slash={kind:'laser',age:0,track:1,lock:.55,fire:2.4,recover:.25,lowerLean:0,firing:false,lockedAngle:null,plan:humanoidStandPlan(e,[humanoidReadyFootTarget(e,0),humanoidReadyFootTarget(e,1)])};
 humanoidTestHud();
}
function crimsonLaserRay(e){
 const dx=Math.sin(e.angle),dy=Math.cos(e.angle)/1.06,n=Math.hypot(dx,dy),ux=dx/n,uy=dy/n;
 const ray={x:e.x+dx*24*CRIMSON_SCALE,y:e.y+dy*24*CRIMSON_SCALE,aim:Math.atan2(uy,ux)};
 ray.length=beamLength(ray);ray.endX=ray.x+ux*ray.length;ray.endY=ray.y+uy*ray.length;return ray;
}
function updateCrimsonLaser(e,dt){
 const s=e.slash;s.age+=dt;const fireAt=s.track+s.lock,end=fireAt+s.fire;
 if(s.age<s.track){turnCrimsonBody(e,dt,3);updateHumanoidStandFeet(e,s.plan,dt);}
 else if(s.age<fireAt){if(s.lockedAngle===null)s.lockedAngle=e.angle;e.angle=s.lockedAngle;updateHumanoidStandFeet(e,s.plan,dt);}
 else if(s.age<end){
  if(!s.firing){s.firing=true;cowboySound('impact');}
  const oldX=e.x,oldY=e.y;
  if(humanoidWalking)updateCrimsonRoam(e,dt,false);
  turnCrimsonBody(e,dt,.38);updateHumanoidGait(e,dt,dt?(e.x-oldX)/dt:0,dt?(e.y-oldY)*1.06/dt:0);
  const ray=crimsonLaserRay(e);if(segmentHits(ray.x,ray.y,ray.endX,ray.endY,{x:p.x,y:p.y,r:drinkPlayerRadius()},7))hurt(skatePhaseSource(s,'firing'));
 }else{s.firing=false;updateHumanoidGait(e,dt,0,0);}
 e.lean=0;
 if(s.age>=end+s.recover){e.slash=null;e.standPlan=null;}
}
function drawCrimsonLaser(e){
 if(state==='bossDying')return;
 const s=e.slash;if(s?.kind!=='laser'||s.age>=s.track+s.lock+s.fire)return;
 const ray=crimsonLaserRay(e),x=ray.x-325,z=(ray.y-300)*1.06,ex=ray.endX-325,ez=(ray.endY-300)*1.06;
 const dx=ex-x,dz=ez-z,length=Math.hypot(dx,dz)||1,yaw=Math.atan2(dx,dz),firing=s.firing,width=firing?14:2;
 renderer.residentMesh(firing?'crimson:laser-beam':'crimson:laser-warning',()=>renderer.emissiveBox(0,0,0,1,1,1,firing?'#ff453e':'#ff8569'),monsterPose((x+ex)/2,firing?16:4,(z+ez)/2,yaw,width,firing?5:1,length));
 if(firing)renderer.residentMesh('crimson:laser-core',()=>renderer.emissiveBox(0,0,0,1,1,1,'#fff0ce'),monsterPose((x+ex)/2,19,(z+ez)/2,yaw,3,2,length));
 const q=humanoidUpperPoint(e,0,99,23);renderer.glow(e.x-325+(q[0]-(e.x-325))*CRIMSON_SCALE,q[1]*CRIMSON_SCALE,(e.y-300)*1.06+(q[2]-(e.y-300)*1.06)*CRIMSON_SCALE,firing?15:6+6*Math.min(1,s.age/(s.track+s.lock)),'#ff493f');
}
function startCrimsonSkyline(e){
 if(e.slash||e.dash||e.hp<=0||state!=='combat')return;
 turnCrimsonBody(e,1,Math.PI);
 const dx=Math.sin(e.angle),dz=Math.cos(e.angle),factors=[.16,.31,.47,.64,.81,.98],ray={x:e.x,y:e.y,aim:Math.atan2(dz/1.06,dx)};
 const available=Math.max(0,beamLength(ray)-42),near=Math.min(70,available*.25),far=Math.min(390,available);
 e.slash={kind:'skyline',age:0,height:e.gait.height,lowerLean:0,plan:humanoidStandPlan(e,[humanoidReadyFootTarget(e,0),humanoidReadyFootTarget(e,1)])};
 e.crimsonRockets??=[];
 for(let i=0;i<6;i++){
  const distance=near+(far-near)*factors[i];
  e.crimsonRockets.push({x:e.x+dx*distance,y:e.y+dz*distance/1.06,age:-.45-i*.2,delay:.45+i*.2,flight:1.2,r:40.5,slot:i,origin:null,impacted:false,vertical:true});
 }
 e.crimsonRockets=e.crimsonRockets.slice(-24);humanoidTestHud();
}
function crimsonHeldGun(e,side){
 const point=humanoidUpperPoint(e,side*43,e.slash?.guns?83:78,7);
 const yaw=e.slash?.guns?Math.atan2(p.x-e.x,(p.y-e.y)*1.06):e.angle;
 return {point,yaw,pitch:e.slash?.guns ? .08 : -.15};
}
function startCrimsonMissiles(e){
 if(e.slash||e.dash||e.hp<=0||state!=='combat')return;
 e.slash={kind:'missiles',age:0,lowerLean:0,height:e.gait.height,plan:humanoidStandPlan(e,[humanoidReadyFootTarget(e,0),humanoidReadyFootTarget(e,1)])};
 e.crimsonRockets??=[];
 const volleyStart=e.crimsonRockets.length;
 for(let i=0;i<6;i++){
  let x=p.x,y=p.y,best=-1;
  const taken=e.crimsonRockets.slice(volleyStart);
  // Rejection sampling preserves an irregular cloud near walls, instead of clamping a grid.
  for(let attempt=0;attempt<100;attempt++){
   const angle=Math.random()*TAU,rad=i===0?Math.sqrt(Math.random())*32:Math.sqrt(.08+Math.random()*.92)*180;
   const tx=p.x+Math.cos(angle)*rad,ty=p.y+Math.sin(angle)*rad;
   if(tx<A.x+42||tx>A.x+A.w-42||ty<A.y+42||ty>A.y+A.h-42)continue;
   const separation=taken.length?Math.min(...taken.map(m=>Math.hypot(m.x-tx,m.y-ty))):999;
   if(separation>best){best=separation;x=tx;y=ty;}
   if(separation>=42)break;
  }
  if(best<38&&i>0){
   // Corner rejection can exhaust random candidates; retain spacing without stacking targets.
   for(let tx=Math.max(A.x+42,p.x-180);tx<=Math.min(A.x+A.w-42,p.x+180);tx+=12)for(let ty=Math.max(A.y+42,p.y-180);ty<=Math.min(A.y+A.h-42,p.y+180);ty+=12){
    if(Math.hypot(tx-p.x,ty-p.y)>180)continue;
    const separation=Math.min(...taken.map(m=>Math.hypot(m.x-tx,m.y-ty)));
    if(separation>best){best=separation;x=tx;y=ty;}
   }
  }
  if(best<0){x=Math.max(A.x+42,Math.min(A.x+A.w-42,x));y=Math.max(A.y+42,Math.min(A.y+A.h-42,y));}
  e.crimsonRockets.push({x,y,age:-.45-i*.2,delay:.45+i*.2,flight:1.8/1.5,r:27*1.5,slot:i,origin:null,impacted:false});
 }
 e.crimsonRockets=e.crimsonRockets.slice(-24);humanoidTestHud();
}
function updateCrimsonLaunch(e,dt){
 const s=e.slash;s.age+=dt;
 updateHumanoidStandFeet(e,s.plan,dt);
 const crouch=Math.min(1,s.age/.3)*(1-Math.max(0,Math.min(1,(s.age-1.45)/.4)));
 e.gait.height=s.height-11*crouch;e.lean=.06;
 if(s.age>=1.85){e.slash=null;e.standPlan=null;}
}
function updateCrimsonRockets(e,dt){
 for(const m of e.crimsonRockets||[]){
  const old=m.age;m.age+=dt;
  if(old<0&&m.age>=0){
   const side=m.slot%2?-1:1,q=humanoidUpperPoint(e,side*15,125,-30+Math.floor(m.slot/2)*8);
   m.origin=[e.x-325+(q[0]-(e.x-325))*CRIMSON_SCALE,q[1]*CRIMSON_SCALE,(e.y-300)*1.06+(q[2]-(e.y-300)*1.06)*CRIMSON_SCALE];
   cowboySound('shot');
  }
  if(m.age>=m.flight&&!m.impacted){m.impacted=true;spawnExplosionFX(m.x,m.y,m.r);cowboySound('impact');}
  if(m.impacted&&m.age<m.flight+5&&Math.hypot(p.x-m.x,p.y-m.y)<m.r*Math.min(1,(m.flight+5-m.age)/.8)+drinkPlayerRadius()){hurt(m);if(state!=='combat')return;}
 }
 e.crimsonRockets=(e.crimsonRockets||[]).filter(m=>m.age<m.flight+5);
}
// A single cubic curve: near-vertical launch, smooth crest, then a steep descent.
function crimsonRocketCurve(m,t){
 if(m.vertical){
  if(t<.35){const u=Math.max(0,t/.35),o=m.origin;return {point:[o[0],o[1]+(1000-o[1])*u,o[2]],tangent:[0,(1000-o[1])/.35,0]};}
  const u=Math.max(0,Math.min(1,(t-.55)/(m.flight-.55)));
  return {point:[m.x-325,7+993*(1-u*u),(m.y-300)*1.06],tangent:[0,-Math.max(.001,1986*u/(m.flight-.55)),0]};
 }
 const u=Math.max(0,Math.min(1,t/m.flight)),v=1-u,o=m.origin;
 const end=[m.x-325,7,(m.y-300)*1.06],side=m.slot%2?1:-1;
 const a=[o[0]+side*14,o[1]+235,o[2]-12],b=[end[0]+side*30,300,end[2]-35];
 const point=o.map((q,i)=>v*v*v*q+3*v*v*u*a[i]+3*v*u*u*b[i]+u*u*u*end[i]);
 const tangent=o.map((q,i)=>3*v*v*(a[i]-q)+6*v*u*(b[i]-a[i])+3*u*u*(end[i]-b[i]));
 return {point,tangent};
}
function crimsonRocketPose(point,tangent){
 const len=Math.hypot(...tangent)||1,v=tangent.map(q=>q/len),seed=Math.abs(v[1])>.95?[0,0,1]:[0,1,0];
 let u=[v[1]*seed[2]-v[2]*seed[1],v[2]*seed[0]-v[0]*seed[2],v[0]*seed[1]-v[1]*seed[0]];
 const n=Math.hypot(...u);u=u.map(q=>q/n);
 const w=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
 return [u[0],v[0],w[0],point[0],u[1],v[1],w[1],point[1],u[2],v[2],w[2],point[2]];
}
function drawCrimsonFireCircle(x,y,z,radius,color,key){
 // Match the renderer's fixed camera. The disc's X/Z plane faces the screen.
 const length=Math.hypot(700,440),cy=700/length,cz=440/length;
 renderer.residentMesh(key,()=>{const start=renderer.count;renderer.disc(0,0,0,1,color);renderer.markEmissive(start);},[radius,0,0,x,0,cy,cz*radius,y,0,cz,-cy*radius,z]);
}
function drawCrimsonRockets(e){
 const r=renderer;
 for(const m of e.crimsonRockets||[]){
  const x=m.x-325,z=(m.y-300)*1.06,t=m.age;
  if(t>=0&&t<m.flight&&m.origin){
   drawHumanoidEffectRing(x,z,m.r,4,'crimson:target-ring','#ff6c44');
   for(const yaw of [0,Math.PI/2])r.residentMesh('crimson:target-cross',()=>r.emissiveBox(0,0,0,12,1,2,'#ffcf81'),monsterPose(x,4,z,yaw));
   const progress=Math.max(0,Math.min(1,t/m.flight));
   drawHumanoidEffectRing(x,z,m.r*(1-progress)+3,4.2,'crimson:target-progress','#ffc47e');
  }
  if(t>=0&&t<m.flight&&m.origin&&(!m.vertical||t<.35||t>=.55)){
   const q=crimsonRocketCurve(m,t);
   r.residentMesh('crimson:rocket',()=>{r.box(0,0,0,7,20,7,'#c5d1d5');r.box(0,11,0,5,6,5,'#ed4a4a');r.box(0,-7,0,13,3,5,'#a82b3e');r.emissiveBox(0,-15,0,4,10,4,'#ffd08a');},crimsonRocketPose(q.point,q.tangent));
   for(let i=1;i<=4;i++){const trail=crimsonRocketCurve(m,Math.max(m.vertical&&t>=.55?.55:0,t-i*.025)).point;r.glow(...trail,4-i*.6,'#ff794f');}
  }
  if(m.impacted){
   const fade=Math.max(0,Math.min(1,(m.flight+5-t)/.8)),radius=m.r*fade;
   r.residentMesh('crimson:burn-ground',()=>{const start=r.count;r.disc(0,0,0,1,'#9c242a');r.markEmissive(start);},monsterPose(x,3.2,z,0,radius,1,radius));
   // Red circular billboards rise gently in place; no box-shaped flame geometry.
   drawCrimsonFireCircle(x,7,z,radius*.7,'#be2634','crimson:fire-circle-base');
   for(let i=0;i<5;i++){
    const phase=(t*.65+i*.21+m.slot*.13)%1,a=i*2.399+m.slot,d=radius*.45;
    drawCrimsonFireCircle(x+Math.cos(a)*d,6+phase*26,z+Math.sin(a)*d,radius*(.33+.12*Math.sin(t*4+i))*(1-phase*.5),'#e53a43','crimson:fire-circle');
   }
   r.glow(x,6,z,radius*.55,'#f42e39');
  }
 }
}
function updateCrimsonRoam(e,dt,gait=true){
 const points=[[.78,.25],[.22,.3],[.25,.75],[.78,.72]],index=e.crimsonRoamIndex||0;
 const target=points[index],tx=A.x+90+(A.w-180)*target[0],ty=A.y+85+(A.h-170)*target[1];
 const dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy),step=Math.min(d,85*dt),vx=d?dx/d*85:0,vz=d?dy/d*85*1.06:0;
 e.x+=d?dx/d*step:0;e.y+=d?dy/d*step:0;
 if(d<=step+2)e.crimsonRoamIndex=(index+1)%points.length;
 e.standPlan=null;
 if(!e.slash){const aim=Math.atan2(p.x-e.x,(p.y-e.y)*1.06),delta=Math.atan2(Math.sin(aim-e.angle),Math.cos(aim-e.angle));e.angle+=Math.max(-dt*3,Math.min(dt*3,delta));updateHumanoidLean(e,0,dt);}
 if(gait)updateHumanoidGait(e,dt,vx,vz);
}
const crimsonOriginalUpdate=updateHumanoidBoss;
updateHumanoidBoss=function(dt){
 const e=humanoidBoss;if(!e?.crimson){crimsonOriginalUpdate(dt);return;}
 const steps=Math.max(1,Math.ceil(dt*120)),h=dt/steps;
 for(let i=0;i<steps;i++){
  if(state!=='combat'||e.hp<=0)return;
  const a=e.crimsonAI;
  if(a?.enabled&&!e.slash&&!e.dash){
   if(a.phase==='attack'){a.phase='rest';a.wait=1.2;a.index=(a.index+1)%CRIMSON_ATTACKS.length;}
   a.wait-=h*(a.phase==='rest'?difficultyFactor('attack'):1);
   if(a.wait<=0){if(a.phase==='rest'){a.phase='tell';a.wait=.85;cowboySound('warn');}else{a.phase='attack';a.count++;startHumanoidSlash(e,CRIMSON_ATTACKS[a.index]);}}
  }
  if(['missiles','skyline'].includes(e.slash?.kind))updateCrimsonLaunch(e,h);else if(e.slash?.kind==='laser')updateCrimsonLaser(e,h);else crimsonOriginalUpdate(h);
  stabilizeCrimsonContacts(e);
  updateCrimsonRockets(e,h);
 }
};
const crimsonOriginalSlash=startHumanoidSlash;
startHumanoidSlash=function(e=humanoidBoss,kind='slash',direction=1,carry=null){
 if(e?.crimson){if(kind==='stomp')return;if(kind==='laser'){startCrimsonLaser(e);return;}if(kind==='skyline'){startCrimsonSkyline(e);return;}if(kind==='skyshoot'||kind==='missiles'){startCrimsonMissiles(e);return;}if(kind==='spinshoot')kind='strafe';}
 const prior=e?.slash;crimsonOriginalSlash(e,kind,direction,carry);
 if(!e?.crimson||!e.slash||e.slash===prior)return;
 const s=e.slash;
 if(s.barrage){s.interval=kind==='spinshoot'?.11:.24;s.nextFire=.25;s.windup=.25;s.strike=2.4;}

};
function crimsonBullet(x,y,angle,speed,color='#ff9875'){
 bullet(x,y,angle,speed,color,4,5);Object.assign(bullets.at(-1),{crimson:true,life:7});
}
const crimsonOriginalGunEvent=cowboyGunEvent;
cowboyGunEvent=function(e,s,shot){
 if(!e.crimson){crimsonOriginalGunEvent(e,s,shot);return;}
 cowboySound('shot');if(s.kind==='skyshoot')return;
 const gun=crimsonHeldGun(e,shot.side),hand=gun.point;
 const cp=Math.cos(gun.pitch),x=e.x+(hand[0]-(e.x-325)+Math.sin(gun.yaw)*cp*45)*CRIMSON_SCALE;
 const y=e.y+(hand[2]-(e.y-300)*1.06+Math.cos(gun.yaw)*cp*45)*CRIMSON_SCALE/1.06;
 const angle=Math.atan2(p.y-y,p.x-x);
 for(const offset of [-.2,0,.2])crimsonBullet(x,y,angle+offset,205,'#ffb47c');
};
const crimsonOriginalImpact=cowboyImpactEvent;
cowboyImpactEvent=function(e,fx,drop){
 if(!e.crimson){crimsonOriginalImpact(e,fx,drop);return;}
 // Crimson missiles use persistent ground fire, with no ring bullets.
};
// Armored skin on the existing humanoid IK/action rig. All geometry stays resident.
const crimsonOriginalDraw=drawHumanoidBoss;
drawHumanoidBoss=function(e){
 if(!e.crimson){crimsonOriginalDraw(e);return;}
 const prior=renderer.residentTransform,x=e.x-325,z=(e.y-300)*1.06;
 renderer.residentTransform=pose=>{const m=pose.map(v=>v*CRIMSON_SCALE);m[3]=x+(pose[3]-x)*CRIMSON_SCALE;m[11]=z+(pose[11]-z)*CRIMSON_SCALE;return prior?prior(m):m;};
 try{drawCrimsonMech(e);}finally{renderer.residentTransform=prior;}
 drawCrimsonRockets(e);
 drawCrimsonLaser(e);
};
const crimsonOriginalHud=humanoidTestHud;
humanoidTestHud=function(){crimsonOriginalHud();if(!humanoidTest||!humanoidBoss?.crimson)return;const e=humanoidBoss,a=e.crimsonAI;$('zone').textContent='赤红裁决者 · 人形机甲';$('humanoid-health').textContent='CR-02 赤红裁决者 · '+Math.ceil(Math.max(0,e.hp))+' / '+e.max;if(a?.enabled){$('status').textContent=e.slash?(CRIMSON_NAMES[e.slash.kind]||'动作测试'):a.phase==='tell'?'预警 · '+CRIMSON_NAMES[CRIMSON_ATTACKS[a.index]]:(humanoidWalking?'巡游换位 · 准备下一招':'双枪警戒 · 换招');$('wave').textContent=a.phase==='tell'&&!e.slash?'即将开火 · '+Math.max(0,a.wait).toFixed(1)+'秒':'移动射击 · 双枪 / 激光 / 燃烧导弹 / 前方轰炸';}else if(!e.slash&&!humanoidWalking){$('status').textContent='双枪警戒 · 站立展示';$('wave').textContent='弹幕已暂停 · 可展开动作测试';}if(e.slash?.kind==='laser'){const l=e.slash;$('status').textContent=CRIMSON_NAMES.laser;$('wave').textContent=l.age<l.track?'蓄力瞄准 · 身体跟踪目标':l.age<l.track+l.lock?'方向已锁定 · 横向躲避':l.firing?'移动开火 · 身体缓慢追转':'收束激光';}else if(e.slash?.kind==='skyline'){$('status').textContent=CRIMSON_NAMES.skyline;$('wave').textContent='前方纵列已锁定 · 垂直降落 / 持续燃烧';}else if(e.slash?.kind==='missiles'){$('status').textContent=CRIMSON_NAMES.missiles;$('wave').textContent=e.slash.age<.45?'下蹲蓄势 · 六处落点已锁定':'导弹升空 · 离开地面标记';}else if(e.crimsonRockets?.some(m=>m.impacted)){$('wave').textContent='地面燃烧 · 进入火区会受伤';}};
const crimsonOriginalFinish=finishHumanoidTest;
finishHumanoidTest=function(won){const crimson=humanoidBoss?.crimson;crimsonOriginalFinish(won);if(crimson){humanoidBoss.skyEffects=[];humanoidBoss.crimsonRockets=[];$('overlay').innerHTML='<div class="tag">CR-02 / CRIMSON JUDGEMENT</div><h2>'+(won?'赤红裁决者已击败':'挑战失败')+'</h2><p>双枪 · 移动激光 · 燃烧导弹</p><button class="primary" id="humanoid-again">重新挑战</button><a href="index.html">返回普通游戏</a>';$('humanoid-again').onclick=startCrimsonMechTest;}};
function crimsonJoint(q,hit){renderer.residentMesh('crimson:joint',()=>{renderer.sphere(0,0,0,7,'#212938',1,1,1,5,10);renderer.box(0,0,5,8,6,5,'#9babb3');},monsterPose(...q),hit);}
function crimsonGunPose(q,a,pitch=0){const c=Math.cos(a),s=Math.sin(a),cp=Math.cos(pitch),sp=Math.sin(pitch);return [c,-s*sp,s*cp,q[0],0,cp,sp,q[1],-s,-c*sp,c*cp,q[2]];}
function drawCrimsonPistol(){
 const r=renderer;
 r.box(0,6,18,14,15,40,'#252d3c');r.box(0,10,19,16,9,33,'#bf293c');
 r.box(0,4,40,12,11,9,'#a8b7bc');r.box(0,4,45,8,7,2,'#101924');
 r.box(0,-8,3,10,23,12,'#222937');r.box(0,-10,-4,11,19,3,'#a51f33');
 r.box(0,-4,15,12,3,15,'#77848c');r.box(0,0,23,12,11,3,'#77848c');
 r.emissiveBox(0,16,20,4,2,22,'#ffc578');r.box(0,17,35,4,3,4,'#151d28');
 for(const side of [-1,1]){r.box(side*8,5,20,2,7,19,'#75818b');for(let j=0;j<3;j++)r.box(side*9,5,15+j*6,1,5,2,'#17212e');}
}
function drawCrimsonTorso(){
 const r=renderer;
 r.box(0,92,0,47,30,28,'#292e3c');r.box(0,105,-2,58,12,30,'#941e32');
 for(const side of [-1,1]){r.box(side*16,98,15,24,19,10,'#dc3d4c');r.box(side*22,109,13,13,4,8,'#f26a66');r.box(side*19,87,16,16,6,7,'#a71e35');
 r.box(side*29,103,-1,10,17,22,'#323a48');r.box(side*15,103,-22,20,35,24,'#303745');r.box(side*15,118,-22,22,7,26,'#ba293d');
 for(let tube=0;tube<3;tube++){r.box(side*15,122,-30+tube*8,13,3,6,'#111923');r.emissiveBox(side*15,124,-30+tube*8,7,1,3,'#ffbd73');}
 for(let j=0;j<3;j++)r.box(side*15,94+j*6,-32,11,3,2,'#131c29');r.emissiveBox(side*15,113,-32,9,3,2,'#ffbb69');}
 r.box(0,98,19,12,15,4,'#161e2a');r.emissiveBox(0,99,22,5,9,2,'#ffdb92');
 for(let j=0;j<3;j++){r.box(0,77+j*5,6,24-j*2,3,22,'#5d6670');r.box(0,77+j*5,18,13,2,2,'#171e2b');}
 r.box(0,117,0,13,10,14,'#7c8990');
}
function drawCrimsonHead(){
 const r=renderer;r.box(0,12,0,29,26,27,'#ae2339');r.box(0,24,-1,25,6,25,'#df4551');
 r.box(0,13,14,26,10,4,'#111e2a');r.emissiveBox(0,15,17,22,3,2,'#ffdb8b');
 r.box(0,4,14,16,8,6,'#6f7e88');r.box(0,5,18,7,4,2,'#202a36');
 for(const side of [-1,1]){r.box(side*16,10,1,6,18,20,'#e13d4b');r.box(side*17,8,10,6,9,6,'#7c1c31');r.box(side*16,25,-6,3,15,5,'#a2afb3');}
 r.box(0,25,9,6,6,10,'#f17a6a');
}
function drawCrimsonMech(e){
 const r=renderer,hit=enemyHitFeedback(e),x=e.x-325,z=(e.y-300)*1.06;
 if(!e.gait)updateHumanoidGait(e,0);
 r.residentMesh('crimson:shadow',()=>r.disc(0,0,0,42,'#30252d'),monsterPose(x,2.5,z));
 r.residentMesh('crimson:pelvis',()=>{r.box(0,62,0,38,17,25,'#292e3b');r.box(0,69,13,39,8,6,'#ae2439');r.box(0,67,17,10,6,3,'#b3bcc0');for(const side of [-1,1])r.box(side*23,59,1,12,20,29,'#c63245');},humanoidUpperPose(e,e.angle,e.slash?.lowerLean??e.lean,false),hit);
 r.residentMesh('crimson:torso',drawCrimsonTorso,humanoidUpperPose(e),hit);
 const head=humanoidHeadAnchor(e);r.residentMesh('crimson:head',drawCrimsonHead,humanoidHeadPose(e),hit);
 for(let i=0;i<2;i++){
  const leg=humanoidLegPose(e,i),contact=e.gait.legs[i];
  monsterStrut(leg.hip,leg.knee,16,'#a72138',hit);monsterStrut(leg.knee,leg.foot,17,'#cf3346',hit);crimsonJoint(leg.hip,hit);crimsonJoint(leg.knee,hit);
  const knee=leg.knee;r.residentMesh('crimson:kneecap',()=>{r.box(0,0,5,20,15,12,'#e54b55');r.box(0,0,12,10,3,2,'#eebd86');},monsterPose(...knee,e.angle),hit);
  r.residentMesh('crimson:boot',()=>{r.box(0,-1,4,22,9,34,'#242d3a');r.box(0,4,8,21,8,27,'#b4263c');r.box(0,6,15,19,4,14,'#e04a54');r.box(0,-4,5,23,3,35,'#707e88');r.emissiveBox(0,1,22,12,2,1,'#ffc983');},monsterPose(...contact.foot,contact.angle),hit);
 }
 for(const side of [-1,1]){
  const gun=e.slash?.guns?.find(g=>g.side===side),weaponHand=e.slash&&side===e.slash.handSide?e.slash.hand:null;
  const held=crimsonHeldGun(e,side),shoulder=humanoidUpperPoint(e,side*31,103,0),q=weaponHand?.point&&!e.slash?.guns?weaponHand.point:held.point;
  const arm=solveSpiderLeg(shoulder,q,30,36,[Math.cos(e.angle)*side,.2,-Math.sin(e.angle)*side]);
  monsterStrut(shoulder,arm.knee,13,'#3b4452',hit);monsterStrut(arm.knee,arm.foot,17,'#c32a40',hit);crimsonJoint(arm.knee,hit);
  r.residentMesh('crimson:pauldron',()=>{r.box(0,0,0,25,20,31,'#b6273c');r.box(0,9,0,27,5,32,'#e74c57');r.box(0,0,17,18,9,4,'#791c30');r.box(0,8,17,16,3,2,'#f19b7b');},monsterPose(...shoulder,e.angle),hit);
  const yaw=weaponHand?.angle&&!e.slash?.guns?weaponHand.angle:held.yaw,pitch=held.pitch,pose=crimsonGunPose(arm.foot,yaw,pitch);
  r.residentMesh('crimson:hand',()=>{r.box(0,0,0,14,16,15,'#3b4654');r.box(0,-2,8,13,10,4,'#9eabb0');},pose,hit);
  if(!e.slash||e.slash.guns||['missiles','skyline','laser'].includes(e.slash.kind))r.residentMesh('crimson:pistol',drawCrimsonPistol,pose,hit);
  if(gun?.shot&&e.slash.age-gun.fireAt>=0&&e.slash.age-gun.fireAt<.055)r.residentMesh('crimson:flash',()=>{r.emissiveBox(0,5,51,13,12,18,'#ffc978');r.emissiveBox(0,5,48,6,6,12,'#fff3cb');},pose);
 }
 if(e.slash&&!e.slash.guns)drawHumanoidSlash(e,hit);
 drawMonsterHealthBar(x+(head[0]-x)*CRIMSON_SCALE,head[1]*CRIMSON_SCALE+30,z+(head[2]-z)*CRIMSON_SCALE,e.hp,e.max,8,80,5,'#f06b74',e);drawPlaneVulnerability(e,x,z);
}
function spawnCrimsonMechBoss(){
 const e={type:'humanoid',crimson:true,crimsonRockets:[],x:325,y:285,hp:420,max:420,r:43*2/3,t:0,seed:0,angle:-.2,motion:'walk',speedRatio:1,lean:0,hitAt:-Infinity,gait:null};
 humanoidBoss=e;enemies.push(e);updateHumanoidGait(e,0);
 humanoidWalking=false;for(let i=0;i<60;i++)updateHumanoidBoss(1/120);
 e.crimsonAI={enabled:true,phase:'rest',wait:1.2,index:0,count:0};e.crimsonRoamIndex=0;humanoidWalking=true;
 return e;
}
function startCrimsonMechTest(){
 startHumanoidTest();enemies=[];const e=spawnCrimsonMechBoss();shootTimer=1.5;
 $('crimson-auto').textContent='弹幕 ON';$('crimson-auto').onclick=()=>{const a=e.crimsonAI;a.enabled=!a.enabled;a.phase='rest';a.wait=1.2;e.slash=null;e.skyEffects=[];e.crimsonRockets=[];bullets=bullets.filter(b=>!b.crimson);$('crimson-auto').textContent=a.enabled?'弹幕 ON':'弹幕 OFF';humanoidTestHud();};
 $('crimson-laser').onclick=()=>{e.slash=null;startCrimsonLaser(e);};
 $('crimson-skyline').onclick=()=>{e.slash=null;startCrimsonSkyline(e);};
 $('humanoid-restart').onclick=startCrimsonMechTest;$('humanoid-walk').textContent='停止行走';updateUI();humanoidTestHud();draw();
}

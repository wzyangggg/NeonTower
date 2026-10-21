'use strict';
// Shared patrol intent and health; Reynolds boids own local velocity and heading.
// Every force is computed from the same snapshot before any fish is integrated.
let fishSchoolTest=false,fishSchoolGod=true,fishSchoolObserve=true;
const FISH_SCHOOL_COUNT=13,FISH_SCHOOL_MARGIN=105;
const FISH_NEIGHBOUR_RADIUS=155,FISH_SEPARATION_RADIUS=76;
function fishSchoolBounds(){return {left:A.x+FISH_SCHOOL_MARGIN,right:A.x+A.w-FISH_SCHOOL_MARGIN,top:A.y+FISH_SCHOOL_MARGIN,bottom:A.y+A.h-FISH_SCHOOL_MARGIN};}
function fishSchoolDestination(e,approach=false){
 const b=fishSchoolBounds();
 e.mode=approach?'approach':'roam';e.modeLeft=approach?2.6:3.5+Math.random()*1.8;
 if(approach){e.targetX=Math.max(b.left,Math.min(b.right,p.x));e.targetY=Math.max(b.top,Math.min(b.bottom,p.y));}
 else {for(let i=0;i<8;i++){e.targetX=b.left+Math.random()*(b.right-b.left);e.targetY=b.top+Math.random()*(b.bottom-b.top);if(Math.hypot(e.targetX-e.x,e.targetY-e.y)>180)break;}}
}
function spawnFishSchool(x=325,y=190){
 const b=fishSchoolBounds(),e={type:'fishSchool',x:Math.max(b.left,Math.min(b.right,x)),y:Math.max(b.top,Math.min(b.bottom,y)),r:72,hp:180,max:180,t:0,seed:0,approachLeft:6+Math.random()*3,hitAt:-Infinity,members:[]};
 for(let i=0;i<FISH_SCHOOL_COUNT;i++){
  const a=i*2.39996323,rad=31*Math.sqrt(i),heading=(Math.random()-.5)*1.2,speed=68+Math.random()*20;
  e.members.push({x:e.x+Math.cos(a)*rad,y:e.y+Math.sin(a)*rad,r:12,index:i,vx:Math.cos(heading)*speed,vy:Math.sin(heading)*speed,heading,turn:0,height:30,phase:Math.random()*TAU});
 }
 fishSchoolDestination(e);enemies.push(e);return e;
}
function fishSchoolMembers(e){return e.members;}
function fishSchoolForces(e){
 const cruise=e.mode==='approach'?119:88;
 return e.members.map(q=>{
  let cx=0,cy=0,vx=0,vy=0,sx=0,sy=0,n=0;
  for(const other of e.members){
   if(q===other)continue;
   const dx=q.x-other.x,dy=q.y-other.y,d=Math.hypot(dx,dy);
   if(d<FISH_NEIGHBOUR_RADIUS){cx+=other.x;cy+=other.y;vx+=other.vx;vy+=other.vy;n++;}
   if(d<FISH_SEPARATION_RADIUS){
    // A deterministic opposite direction also separates exactly overlapping fish.
    const a=q.index<other.index?0:Math.PI,ux=d>1e-5?dx/d:Math.cos(a),uy=d>1e-5?dy/d:Math.sin(a);
    const strength=500*(1-d/FISH_SEPARATION_RADIUS)**2;sx+=ux*strength;sy+=uy*strength;
   }
  }
  const dx=e.targetX-q.x,dy=e.targetY-q.y,d=Math.hypot(dx,dy)||1;
  let ax=(dx/d*cruise-q.vx)*.72+sx,ay=(dy/d*cruise-q.vy)*.72+sy;
  if(n){ax+=(vx/n-q.vx)*1.15+(cx/n-q.x)*.28;ay+=(vy/n-q.vy)*1.15+(cy/n-q.y)*.28;}
  // Weak group tether gathers stragglers without assigning formation slots.
  const distance=Math.hypot(q.x-e.x,q.y-e.y),tether=distance>185?1.2:.08;
  ax+=(e.x-q.x)*tether;ay+=(e.y-q.y)*tether;
  const sway=Math.sin(e.t*1.65+q.phase)*15;ax-=Math.sin(q.heading)*sway;ay+=Math.cos(q.heading)*sway;
  const edge=78,left=q.x-(A.x+38),right=A.x+A.w-38-q.x,top=q.y-(A.y+38),bottom=A.y+A.h-38-q.y;
  const avoid=d=>d<edge?420*Math.max(0,1-d/edge)**2:0;
  ax+=avoid(left)-avoid(right);ay+=avoid(top)-avoid(bottom);
  const force=Math.hypot(ax,ay);if(force>260){ax*=260/force;ay*=260/force;}
  return {ax,ay};
 });
}
function updateFishSchool(e,dt){
 if(dt<=0||e.hp<=0)return;
 const scaled=dt*drinkMonsterSpeed()*(e.drinkSlowUntil>time?.75:1),steps=Math.ceil(scaled/(1/90)),h=scaled/steps;
 for(let i=0;i<steps;i++){
  e.t+=h;e.modeLeft-=h;e.approachLeft-=h;
  if(e.mode==='roam'&&e.approachLeft<=0){fishSchoolDestination(e,true);e.approachLeft=8+Math.random()*4;}
  else if(e.modeLeft<=0||Math.hypot(e.targetX-e.x,e.targetY-e.y)<30)fishSchoolDestination(e);
  const forces=fishSchoolForces(e);
  e.members.forEach((q,index)=>{
   const {ax,ay}=forces[index],vx=q.vx+ax*h,vy=q.vy+ay*h;
   const delta=Math.atan2(Math.sin(Math.atan2(vy,vx)-q.heading),Math.cos(Math.atan2(vy,vx)-q.heading));
   const limit=(2.5+.4*Math.sin(q.phase))*h,turn=Math.max(-limit,Math.min(limit,delta));q.heading+=turn;q.turn=turn/h;
   const speed=Math.max(38,Math.min(e.mode==='approach'?146:114,Math.hypot(vx,vy)));q.vx=Math.cos(q.heading)*speed;q.vy=Math.sin(q.heading)*speed;
   q.x=Math.max(A.x+36,Math.min(A.x+A.w-36,q.x+q.vx*h));q.y=Math.max(A.y+36,Math.min(A.y+A.h-36,q.y+q.vy*h));
   q.height=30+Math.sin(e.t*3+q.phase)*4;
  });
  e.x=e.members.reduce((sum,q)=>sum+q.x,0)/e.members.length;e.y=e.members.reduce((sum,q)=>sum+q.y,0)/e.members.length;
 }
 e.r=Math.max(30,...e.members.map(q=>Math.hypot(q.x-e.x,q.y-e.y)+q.r));
 // These hovering fish fly above floor cover; contact follows their actual bodies.
 for(const q of e.members)if(Math.hypot(q.x-p.x,q.y-p.y)<q.r+5*drinkPlayerScale()){hurt(e);break;}
}
function buildSchoolFishShell(){
 const r=renderer;
 // Long rectangular armour block, with a separate projecting face plate.
 r.box(-1,-1,0,48,16,19,'#364f5c');
 r.box(0,2,0,44,18,21,'#d5e0dd');
 r.box(-1,11.5,0,35,2,18,'#e7e9d8');
 r.box(22.5,2,0,4,21,24,'#4a6068');
 r.box(26,2,0,5,19,23,'#edf1df');
 for(const z of [-7,7])r.box(28.6,3,z,1,8,2.3,'#263b43');
 r.box(28.6,-3,0,1,1.4,6,'#536b71');
 r.box(-23,1,0,6,15,17,'#bfa878');
 r.box(-27,2,0,4,10,12,'#6caab4');
 for(const side of [-1,1]){
  r.box(-13,0,side*12,12,5,4,'#29434d');
  r.box(-15,1,side*14,7,3,2,'#d56a54');
  r.box(3,2,side*10.8,23,2,1,'#92a5a5');
 }
 r.box(-6,13,0,27,2,5,'#829a9f');
}
// Two swept flight wings on the rear side mounts; no centre tail or tail sway.
function buildSchoolFishWings(){
 const r=renderer;
 for(const side of [-1,1]){
  r.box(-15,3,side*13,8,7,8,'#647e87');
  // A bevelled, solid blade extends backwards and outwards from each shoulder.
  const outline=[[-15,side*13],[-20,side*21],[-36,side*29],[-42,side*27],[-37,side*22],[-23,side*13]];
  const top=outline.map(([x,z])=>[x,5,z]),bottom=outline.map(([x,z])=>[x,2,z]);
  for(let i=1;i<outline.length-1;i++){
   r.quad(top[0],top[i],top[i+1],top[i+1],'#61b5da');
   r.quad(bottom[0],bottom[i+1],bottom[i],bottom[i],'#355c73');
  }
  for(let i=0;i<outline.length;i++){const j=(i+1)%outline.length;r.quad(top[i],bottom[i],bottom[j],top[j],'#86b9cb');}
  r.quad([-34,5.2,side*25.5],[-37,5.2,side*27],[-40,5.2,side*26],[-37,5.2,side*24],'#e0eeee');
 }
}
function drawFishSchool(e){
 const r=renderer,hit=enemyHitFeedback(e);
 for(const q of fishSchoolMembers(e)){
  const x=q.x-325,z=(q.y-300)*1.06,yaw=-q.heading;
  r.residentMesh('fish-school:shadow',()=>r.disc(0,0,0,12,'#33484f'),monsterPose(x,3,z,0,1.3,1,.6));
  r.residentMesh('fish-school:long-shell-v3',buildSchoolFishShell,monsterPose(x,q.height,z,yaw,.8,.8,.8),hit);
  r.residentMesh('fish-school:short-wings-v3',buildSchoolFishWings,monsterPose(x,q.height,z,yaw,.8,.8,.8),hit);
 }
 drawMonsterHealthBar(e.x-325,65,(e.y-300)*1.06,e.hp,e.max,e.max,90,4,'#7bd5e0',e);
}
function resetFishSchoolTest(){fishSchoolTest=false;const tools=$('fish-school-tools');if(tools)tools.hidden=true;}
function fishSchoolTestHud(){
 const e=enemies.find(q=>q.type==='fishSchool'&&q.hp>0);
 if(!e){finishFishSchoolTest(true);return;}
 if(fishSchoolGod)p.inv=Math.max(p.inv,1);
 if(fishSchoolObserve){shots=[];shootTimer=1;}
 $('zone').textContent='机械鱼群 · 怪物测试场';$('status').textContent=e.mode==='approach'?'整群靠近':'集群巡游';$('wave').textContent='13尾 · 分离 / 对齐 / 聚合';
 const bar=$('fish-school-health');if(bar){bar.textContent=Math.ceil(e.hp)+' / '+e.max;bar.style.setProperty('--snake-hp',Math.max(0,e.hp/e.max*100)+'%');}
}
function finishFishSchoolTest(won){
 if(won){const bar=$('fish-school-health');if(bar){bar.textContent='0 / 180';bar.style.setProperty('--snake-hp','0%');}}
 state=won?'menu':'dead';paused=false;releaseJoy();shots=[];
 showOverlay('<div class="tag">SCHOOL LAB</div><h2>'+(won?'鱼群已击破':'测试结束')+'</h2><p>鱼群巡游 · 邻域聚合 · 各自转向</p><button class="primary" id="fish-school-again">重新测试</button><a href="index.html">返回普通游戏</a>');$('fish-school-again').onclick=startFishSchoolTest;
}
function startFishSchoolTest(){
 reset();fishSchoolTest=true;testMode=true;state='combat';phase=0;scroll=0;cleared=false;
 $('viewport').classList.remove('falling','landing','boss-intro','paused');clearTimeout(toast.timer);$('toast').classList.remove('show');
 tiles=[];syncGrid();for(let y=grid.minY;y<=grid.maxY;y++)for(let x=grid.minX;x<=grid.maxX;x++)tiles.push({x,y,healProgress:0,healFlash:0,medPack:false});
 p.x=325;p.y=435;p.hp=p.max=8;p.inv=2;spawnQueue=[];chaserSpawned=999;spawnTimer=999;shootTimer=1;spawnFishSchool();
 renderer.sceneKey=null;renderer.sceneData=null;$('overlay').style.display='none';
 const tools=$('fish-school-tools');if(tools){tools.hidden=false;$('fish-school-restart').onclick=startFishSchoolTest;
 $('fish-school-god').textContent='无敌 '+(fishSchoolGod?'ON':'OFF');$('fish-school-god').onclick=()=>{fishSchoolGod=!fishSchoolGod;$('fish-school-god').textContent='无敌 '+(fishSchoolGod?'ON':'OFF');};
 $('fish-school-observe').textContent='观察 '+(fishSchoolObserve?'ON':'OFF');$('fish-school-observe').onclick=()=>{fishSchoolObserve=!fishSchoolObserve;$('fish-school-observe').textContent='观察 '+(fishSchoolObserve?'ON':'OFF');};
 $('fish-school-attack').onclick=()=>{const e=enemies.find(q=>q.type==='fishSchool');if(e&&e.hp>0){fishSchoolDestination(e,true);e.approachLeft=10;}};}
 updateUI();fishSchoolTestHud();draw();syncMusic();
}

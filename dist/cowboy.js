'use strict';
const COWBOY_SCALE=.675,COWBOY_SPEED=230,COWBOY_CLEARANCE=145;
const COWBOY_ATTACKS=['dualshoot','skyshoot','strafe','spinshoot'];
const COWBOY_NAMES={dualshoot:'双炮点射',skyshoot:'高抛落弹',strafe:'移动双炮连射',spinshoot:'旋转双炮弹幕'};
function cowboySound(kind){
 if(!sound||!audio||audio.state==='suspended')return;
 const t=audio.currentTime,heavy=kind==='impact',move=kind==='move',warn=kind==='warn';
 for(const [type,from,to,volume,duration] of heavy?[['triangle',150,38,.11,.24],['sawtooth',700,55,.045,.15]]:move?[['sine',650,1400,.03,.13]]:warn?[['triangle',520,880,.045,.12]]:[['square',1100,180,.022,.045],['triangle',180,65,.06,.09]]){
  const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(from,t);o.frequency.exponentialRampToValueAtTime(to,t+duration);g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(volume,t+.002);g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(g);g.connect(audio.destination);o.onended=()=>{o.disconnect();g.disconnect();};o.start(t);o.stop(t+duration+.01);
 }
}
function cowboyGunEvent(e,s,shot){
 cowboySound('shot');if(!e.cowboy||s.kind==='skyshoot')return;
 let source=shot.origin;if(e.cowboy.mech){const gun=s.guns.find(g=>g.side===shot.side),q=mechanicalWeaponPoint(e,gun.hand.point),cp=Math.cos(shot.pitch);source=[q[0]+Math.sin(shot.yaw)*cp*45,q[1]+Math.sin(shot.pitch)*45,q[2]+Math.cos(shot.yaw)*cp*45];}const origin=cowboyScaledPoint(e,source),x=origin[0]+325,y=origin[2]/1.06+300;
 const a=s.kind==='spinshoot'?Math.atan2(Math.cos(shot.yaw)/1.06,Math.sin(shot.yaw)):Math.atan2(p.y-y,p.x-x);
 bullet(x,y,a,s.kind==='dualshoot'?300:s.kind==='strafe'?250:190,'#ffc66e',4,5);
 bullets.at(-1).cowboy=true;
}
function cowboyImpactEvent(e,fx,drop){
 cowboySound('impact');if(!fx.combat)return;
 for(let i=0;i<12;i++){bullet(drop.x,drop.y,i*TAU/12,185,'#ffb853',4,5);bullets.at(-1).cowboy=true;}
 if(Math.hypot(p.x-drop.x,p.y-drop.y)<23)hurt();
 burst(drop.x,drop.y,'#ffd58a',12);
}
function cowboyScaledPoint(e,q){return [e.x-325+(q[0]-(e.x-325))*COWBOY_SCALE,4+(q[1]-4)*COWBOY_SCALE,(e.y-300)*1.06+(q[2]-(e.y-300)*1.06)*COWBOY_SCALE];}
function cowboyScaledPose(e,pose){const q=cowboyScaledPoint(e,[pose[3],pose[7],pose[11]]);return pose.map((v,i)=>i===3?q[0]:i===7?q[1]:i===11?q[2]:v*COWBOY_SCALE);}
function cowboyDestination(e,teleport=false){
 const points=[];for(let i=0;i<24;i++){const a=i*TAU/24;points.push({x:Math.max(A.x+55,Math.min(A.x+A.w-55,e.x+Math.sin(a)*175)),y:Math.max(A.y+55,Math.min(A.y+A.h-55,e.y+Math.cos(a)*175))});}
 for(const x of [A.x+60,A.x+A.w-60])for(const y of [A.y+60,A.y+A.h-60])points.push({x,y});
 const safe=points.filter(q=>Math.hypot(q.x-p.x,q.y-p.y)>=COWBOY_CLEARANCE&&Math.hypot(q.x-e.x,q.y-e.y)>50);
 const pathDistance=q=>{const dx=q.x-e.x,dy=q.y-e.y,t=Math.max(0,Math.min(1,((p.x-e.x)*dx+(p.y-e.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(e.x+dx*t-p.x,e.y+dy*t-p.y);};
 const list=teleport?safe:safe.filter(q=>pathDistance(q)>=65);
 return (list.length?list:safe.length?safe:points).sort((a,b)=>{
  const score=q=>-Math.abs(Math.hypot(q.x-e.x,q.y-e.y)-175)-Math.abs(Math.hypot(q.x-p.x,q.y-p.y)-210)*.3;
  return score(b)-score(a);
 })[0];
}
function cowboyMovingFeet(e,dt){
 const g=e.gait,yaw=e.moveYaw??e.angle;g.travelPhase=(g.travelPhase||0)+dt*COWBOY_SPEED/55;g.running=false;g.height=e.move?54:62;
 for(let i=0;i<2;i++){const phase=(g.travelPhase+i*.5)%1,lift=Math.sin(phase*Math.PI)*14,stride=Math.cos(phase*TAU)*20,side=i===0?-15:15;
  g.legs[i].foot=[e.x-325+Math.cos(yaw)*side+Math.sin(yaw)*stride,4+lift,(e.y-300)*1.06-Math.sin(yaw)*side+Math.cos(yaw)*stride];g.legs[i].angle=yaw;g.legs[i].swing=null;
  const hip=humanoidLocal(e,i===0?-14:14,0,0),f=g.legs[i].foot,r=Math.hypot(hip[0]-f[0],hip[2]-f[2]);g.height=Math.min(g.height,f[1]+Math.sqrt(Math.max(0,69.2**2-r*r)));
 }
}
function cowboyBarrageMove(e,dt){
 const s=e.slash;
 if(s.kind==='strafe'){
  const aim=Math.atan2(p.x-e.x,(p.y-e.y)*1.06);s.strafeSide??=1;
  const next=side=>({x:e.x+Math.cos(aim)*side*COWBOY_SPEED*dt,y:e.y-Math.sin(aim)*side*COWBOY_SPEED*dt});
  let q=next(s.strafeSide);if(q.x<A.x+55||q.x>A.x+A.w-55||q.y<A.y+55||q.y>A.y+A.h-55){s.strafeSide*=-1;q=next(s.strafeSide);}
  e.moveYaw=Math.atan2(q.x-e.x,(q.y-e.y)*1.06);e.x=Math.max(A.x+55,Math.min(A.x+A.w-55,q.x));e.y=Math.max(A.y+55,Math.min(A.y+A.h-55,q.y));return;
 }
 if(!s.moveTarget||Math.hypot(s.moveTarget.x-e.x,s.moveTarget.y-e.y)<3)s.moveTarget=cowboyDestination(e);
 const q=s.moveTarget,dx=q.x-e.x,dy=q.y-e.y,d=Math.hypot(dx,dy),step=Math.min(d,COWBOY_SPEED*dt);if(d){e.x+=dx/d*step;e.y+=dy/d*step;e.moveYaw=Math.atan2(dx,dy*1.06);}
}
function updateCowboyMove(e,dt){
 const m=e.move,q=m.target,dx=q.x-e.x,dy=q.y-e.y,d=Math.hypot(dx,dy),step=Math.min(d,COWBOY_SPEED*dt);
 if(d){e.x+=dx/d*step;e.y+=dy/d*step;}
 e.moveYaw=Math.atan2(dx,dy*1.06);e.angle=Math.atan2(p.x-e.x,(p.y-e.y)*1.06);e.lean=0;cowboyMovingFeet(e,dt);
 if(d<=step+1e-6){e.move=null;e.standPlan=null;}
}
function updateCowboyAI(e,dt){
 if(state!=='combat'||e.hp<=0)return;updateCowboyCape(e,dt);
 const a=e.cowboy;a.lightAge=(a.lightAge||0)+dt;
 if(e.move){updateCowboyMove(e,dt);return;}
 if(e.slash||e.dash)return;
 if(a.phase==='attack'){
  a.phase='travel';a.moves++;cowboySound('move');
  e.move={kind:'run',age:0,x:e.x,y:e.y,target:cowboyDestination(e)};updateCowboyMove(e,0);
  return;
 }
 if(a.phase==='travel'){a.phase='tell';a.wait=.32;a.index=(a.index+1)%COWBOY_ATTACKS.length;cowboySound('warn');}
 a.wait-=dt;
 if(a.wait<=0){a.phase='attack';a.attacks++;startHumanoidSlash(e,COWBOY_ATTACKS[a.index]);}
}
function cowboyHud(e){
 $('zone').textContent='机械蜘蛛 BOSS · 霓虹守卫';
 if(e.slash&&COWBOY_NAMES[e.slash.kind])$('status').textContent=COWBOY_NAMES[e.slash.kind];
 if(!e.slash)$('status').textContent=e.move?'跑步换位':e.cowboy.phase==='tell'?'准备 · '+COWBOY_NAMES[COWBOY_ATTACKS[e.cowboy.index]]:'换位';
 $('wave').textContent=(e.cowboy.mech?'四足机械蜘蛛':e.cowboy.spider?'蜘蛛底座':'双足')+' · 移动射击 · 跑步换位';
}
function updateCowboyCape(e,dt){
 if(!e.cowboy?.cape){e.cape=null;return;}
 const rows=7,columns=5;
 if(!e.cape){e.cape={age:0,x:e.x,y:e.y,nodes:Array.from({length:rows*columns},(_,i)=>{const row=Math.floor(i/columns),col=i%columns;return {q:humanoidUpperPoint(e,(col-2)*(11+row*.5),108-row*10,-20-row*2),v:[0,0,0]};})};}
 const cape=e.cape,dx=e.x-cape.x,dz=(e.y-cape.y)*1.06,jump=Math.hypot(dx,dz)>40;
 if(jump)for(const node of cape.nodes){node.q[0]+=dx;node.q[2]+=dz;node.v=[0,0,0];}
 const vx=dt&&!jump?Math.max(-260,Math.min(260,dx/dt)):0,vz=dt&&!jump?Math.max(-260,Math.min(260,dz/dt)):0;
 cape.x=e.x;cape.y=e.y;cape.age+=dt;
 for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){
  const node=cape.nodes[row*columns+col],u=row/(rows-1),flutter=Math.sin(cape.age*7-row*.8+col*.6)*u*3;
  const target=humanoidUpperPoint(e,(col-2)*(11+row*.5)+flutter,108-row*10+Math.sin(cape.age*5+col)*u*2,-20-row*2-u*Math.hypot(vx,vz)*.08);
  target[0]-=vx*.1*u;target[2]-=vz*.1*u;
  if(row===0){node.q=target;node.v=[0,0,0];continue;}
  for(let j=0;j<3;j++){node.v[j]+=((target[j]-node.q[j])*65-node.v[j]*12)*dt;node.q[j]+=node.v[j]*dt;}
  node.q[1]=Math.max(9,node.q[1]);
 }
}
function drawCowboyCape(e){
 if(!e.cape)return;
 const nodes=e.cape.nodes,r=renderer;
 const triangle=(a,b,c,key,color)=>r.residentMesh(key,()=>r.quad([0,0,0],[1,0,0],[0,0,1],[0,0,1],color),[b[0]-a[0],0,c[0]-a[0],a[0],b[1]-a[1],1,c[1]-a[1],a[1],b[2]-a[2],0,c[2]-a[2],a[2]]);
 for(let row=0;row<6;row++)for(let col=0;col<4;col++){
  const a=nodes[row*5+col].q,b=nodes[row*5+col+1].q,c=nodes[(row+1)*5+col+1].q,d=nodes[(row+1)*5+col].q,key=row===5?'cowboy:cape-trim':'cowboy:cape',color=row===5?'#c49564':'#674035';
  triangle(a,b,c,key,color);triangle(a,c,d,key,color);
 }
}
function drawCowboyCostume(e){
 const r=renderer;drawCowboyCape(e);
 r.residentMesh('cowboy:hat',()=>{r.box(0,30,0,74,5,50,'#69472f');r.box(0,41,-2,44,21,32,'#98673f');r.box(0,34,-2,45,6,33,'#302c31');r.box(0,36,16,8,8,2,'#e1b663');},humanoidHeadPose(e));
 r.residentMesh('cowboy:vest',()=>{for(const side of [-1,1])r.box(side*19,92,18,13,30,6,'#825037');r.box(0,107,20,26,9,7,'#c34e42');r.box(-5,98,22,10,15,4,'#a83634');r.emissiveBox(14,99,23,8,8,2,'#f6cb65');r.box(0,66,15,39,7,5,'#69472f');r.box(0,66,19,10,9,3,'#e1b663');},humanoidUpperPose(e));
}
function cowboySpiderTarget(e,i,vx=0,vz=0){
 const a=i*TAU/4+Math.PI/4;
 return [Math.max(A.x-325+8,Math.min(A.x+A.w-325-8,e.x-325+Math.cos(a)*45+vx*.05)),4,Math.max((A.y-300)*1.06+8,Math.min((A.y+A.h-300)*1.06-8,(e.y-300)*1.06+Math.sin(a)*45+vz*.05))];
}
function updateCowboySpider(e,dt){
 if(!e.cowboy?.spider){e.spiderBase=null;return;}
 e.spiderBase=advancePlantedGait(e.spiderBase,e.x-325,(e.y-300)*1.06,dt,[0,1,2,3],[[0,2],[1,3]],(i,vx,vz)=>cowboySpiderTarget(e,i,vx,vz),10,.07,12);
}
function cowboySpiderLeg(e,i){
 const a=i*TAU/4+Math.PI/4,hip=[e.x-325+Math.cos(a)*18,36,(e.y-300)*1.06+Math.sin(a)*18];
 return solveSpiderLeg(hip,e.spiderBase.legs[i].foot,38,46,[Math.cos(a),.7,Math.sin(a)]);
}
function drawCowboySpider(e,hit){
 if(!e.spiderBase)updateCowboySpider(e,0);
 const r=renderer,x=e.x-325,z=(e.y-300)*1.06;
 r.residentMesh('cowboy:spider-base',()=>{r.box(0,36,0,46,13,42,'#637e91');r.box(0,44,0,34,5,30,'#cbded8');r.box(0,54,0,18,20,18,'#719aad');r.emissiveBox(0,37,22,18,5,2,'#7dffe0');},monsterPose(x,0,z));
 for(let i=0;i<4;i++){const leg=cowboySpiderLeg(e,i);monsterStrut(leg.hip,leg.knee,12,'#93b3c3',hit);monsterStrut(leg.knee,leg.foot,10,'#d8e9e2',hit);
  r.residentMesh('cowboy:spider-joint',()=>r.sphere(0,0,0,6.5,'#a1e0d2',1,1,1,4,8),monsterPose(...leg.knee),hit);
  r.residentMesh('mech:joint-light',()=>r.emissiveBox(0,2,0,8,2,8,'#70f8df'),monsterPose(...leg.knee),hit);
  r.residentMesh('cowboy:spider-foot',()=>r.box(0,0,0,14,8,16,'#3e5155'),monsterPose(...e.spiderBase.legs[i].foot),hit);
 }
}
function mechanicalWeaponPoint(e,q){
 const x=e.x-325,z=(e.y-300)*1.06;
 return [x+(q[0]-x)*.75,36+(q[1]-58)*.52,z+(q[2]-z)*.75];
}
function drawMechanicalSpiderBoss(e){
 const r=renderer,x=e.x-325,z=(e.y-300)*1.06,hit=enemyHitFeedback(e),yaw=e.angle;
 r.residentMesh('mech:shadow',()=>r.disc(0,2,0,45,'#30494a'),monsterPose(x,0,z));
 drawCowboySpider(e,hit);
 r.residentMesh('mech:carapace',()=>{
  r.box(0,54,0,58,20,48,'#c8ded9');r.box(0,66,-2,49,8,39,'#92aebb');r.emissiveBox(0,70.5,-2,45,1,35,'#b1d8cf');
  r.box(0,52,25,40,16,7,'#385b70');r.box(0,58,29,31,6,2,'#213e52');
  for(const side of [-1,1]){
   r.box(side*29,53,-2,7,22,37,'#6d91a5');r.emissiveBox(side*33,56,-2,2,4,25,'#6cf7de');
   r.box(side*12,72,-8,15,5,23,'#d8e8e1');
   for(let i=0;i<4;i++)r.box(side*12,75,-15+i*5,11,2,2,'#3a5a72');
   r.box(side*19,47,-23,9,12,8,'#45687e');r.emissiveBox(side*19,51,-28,5,4,2,'#b6a6ff');
   r.sphere(side*9,59,31,5,'#85ffe5',1,.8,.4,5,10);
   r.box(side*22,62,22,5,3,5,'#d5e6dc');
  }
  r.box(0,69,8,11,3,22,'#45657c');r.emissiveBox(0,71,9,5,2,17,'#91fff0');
  r.box(0,59,-24,17,13,5,'#789baa');r.box(0,76,-14,3,13,3,'#678597');
  r.sphere(0,84,-14,4,'#b5ffe8',1,1,1,4,8);
  r.markPhosphor(0,.1);
 },monsterPose(x,0,z,yaw),hit);
 const pulse=1+Math.sin((e.cowboy.lightAge||0)*4)*.08;
 r.residentMesh('mech:reactor',()=>{r.sphere(0,0,0,7,'#73e9d0',1,.45,1,5,10);r.markEmissive(0);},monsterPose(x,73,z,yaw,pulse,1,pulse),hit);
 for(const side of [-1,1]){
  const gun=e.slash?.guns?.find(g=>g.side===side),q=gun?mechanicalWeaponPoint(e,gun.hand.point):humanoidLocal(e,side*36,55,17),a=gun?.hand.angle??yaw,p=gun?.hand.pitch??0,c=Math.cos(a),sn=Math.sin(a),cp=Math.cos(p),sp=Math.sin(p);
  const anchor=humanoidLocal(e,side*24,54,0);
  monsterStrut(anchor,q,9,'#668c9e',hit);
  r.residentMesh('mech:gun-joint',()=>r.sphere(0,0,0,8,'#a6c7cc',1,1,1,5,10),monsterPose(...q),hit);
  const pose=[c,-sn*sp,sn*cp,q[0],0,cp,sp,q[1],-sn,-c*sp,c*cp,q[2]];
  r.residentMesh('mech:cannon',()=>{
   r.box(0,5,7,16,18,18,'#a1bcc9');r.box(0,7,24,13,13,35,'#435f78');r.box(0,7,42,16,16,5,'#d7e8df');r.box(0,7,45,9,9,2,'#253c50');
   for(const side of [-1,1]){r.emissiveBox(side*7,8,24,2,4,24,'#72f7e0');r.box(side*9,4,7,4,10,14,'#577a90');}
  },pose,hit);
  if(gun?.shot&&e.slash.age-gun.fireAt<.055)r.residentMesh('mech:muzzle',()=>{r.emissiveBox(0,7,52,15,15,17,'#fff6c0');},pose);
 }
 drawMonsterHealthBar(x,72,z,e.hp,e.max,8,80,5,'#9ae9df',e);
}
function spawnCowboyBoss(){
 const e={type:'humanoid',x:325,y:230,hp:680,max:680,r:48,t:0,seed:0,angle:0,motion:'walk',speedRatio:1,lean:0,hitAt:-Infinity,gait:null};
 humanoidBoss=e;humanoidWalking=true;enemies.push(e);updateHumanoidGait(e,0);
 e.cowboy={mech:true,cape:false,spider:true,phase:'tell',wait:1,index:0,moves:0,attacks:0};
 updateCowboyCape(e,0);updateCowboySpider(e,0);return e;
}
function startCowboyTest(){
 startHumanoidTest();enemies=[];spawnCowboyBoss();$('humanoid-restart').onclick=startCowboyTest;humanoidTestHud();draw();
}

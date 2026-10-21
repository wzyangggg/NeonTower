'use strict';
const HUMANOID_MOTIONS={walk:{name:'走路',speed:1,lean:0,height:68},run:{name:'跑步',speed:2.2,lean:50,height:54,cycle:.58,duty:.42,lift:25},dash:{name:'位移冲刺',speed:1,lean:75,height:44}};
function humanoidMotion(e){return HUMANOID_MOTIONS[e.motion||'walk'];}
const HUMANOID_LEAN_DURATION=.1;
function updateHumanoidLean(e,target,dt){
 let q=e.leanTransition;
 if(!q||q.target!==target)q=e.leanTransition={from:e.lean||0,target,age:0};
 q.age=Math.min(HUMANOID_LEAN_DURATION,q.age+dt);
 const t=q.age/HUMANOID_LEAN_DURATION,u=t*t*(3-2*t);
 e.lean=q.age>=HUMANOID_LEAN_DURATION-1e-9?target:q.from+(target-q.from)*u;
}
function setHumanoidMotion(mode){if(!HUMANOID_MOTIONS[mode]||!humanoidBoss)return;if(mode==='dash'){startHumanoidDash(humanoidBoss);return;}if(humanoidBoss.slash){humanoidBoss.slash.returnMotion=mode;return;}if(humanoidBoss.dash){humanoidBoss.dash.returnMotion=mode;return;}humanoidBoss.motion=mode;cancelHumanoidStanding(humanoidBoss);humanoidWalking=true;$('humanoid-walk').textContent='停止行走';humanoidTestHud();}
// Local +Z is the robot's front. Foot contacts stay in world space.
function humanoidLocal(e,x,y,z){const c=Math.cos(e.angle),s=Math.sin(e.angle);return [e.x-325+c*x+s*z,y,(e.y-300)*1.06-s*x+c*z];}
function humanoidFootTarget(e,i,vx=0,vz=0){const q=humanoidLocal(e,i===0?-14:14,4,3);q[0]+=vx*.44;q[2]+=vz*.44;return q;}
function humanoidBodyLift(e){return (e.gait.height??68)-58;}
function humanoidLegPose(e,i){const hip=humanoidLocal(e,i===0?-14:14,58+humanoidBodyLift(e),0);return solveSpiderLeg(hip,e.gait.legs[i].foot,34,36,[Math.sin(e.angle),0,Math.cos(e.angle)]);}
// Anatomical right is -X: right foot back, left foot forward.
function humanoidReadyFootTarget(e,i){return humanoidLocal(e,i===0?-18:18,4,i===0?-16:20);}
function humanoidStandPlan(e,targets){return {age:0,legs:e.gait.legs.map((leg,i)=>({from:[...leg.foot],to:[...targets[i]],angle:leg.angle,delay:leg.foot[1]>4.1?0:i*.12})),height:e.gait.height};}
function updateHumanoidStandFeet(e,plan,dt){
 plan.age+=dt;e.gait.running=false;
 for(let i=0;i<2;i++){const q=plan.legs[i],leg=e.gait.legs[i],t=Math.max(0,Math.min(1,(plan.age-q.delay)/.24)),u=t*t*(3-2*t);leg.foot=q.from.map((v,j)=>v+(q.to[j]-v)*u);if(Math.hypot(...q.to.map((v,j)=>v-q.from[j]))>1)leg.foot[1]+=Math.sin(t*Math.PI)*8;leg.angle=q.angle+Math.atan2(Math.sin(e.angle-q.angle),Math.cos(e.angle-q.angle))*u;leg.swing=t>0&&t<1?{settling:true}:null;}
}
function updateHumanoidStanding(e,dt){
 if(!e.standPlan)e.standPlan=humanoidStandPlan(e,[humanoidReadyFootTarget(e,0),humanoidReadyFootTarget(e,1)]);
 updateHumanoidStandFeet(e,e.standPlan,dt);updateHumanoidLean(e,6*Math.PI/180,dt);
 const u=Math.min(1,e.standPlan.age/.4);e.gait.height=e.standPlan.height+(60-e.standPlan.height)*u*u*(3-2*u);
 for(let i=0;i<2;i++){const hip=humanoidLocal(e,i===0?-14:14,0,0),foot=e.gait.legs[i].foot,r=Math.hypot(hip[0]-foot[0],hip[2]-foot[2]);e.gait.height=Math.min(e.gait.height,foot[1]+Math.sqrt(Math.max(0,69.2**2-r*r)));}
}
function cancelHumanoidStanding(e){e.standPlan=null;for(const leg of e.gait.legs)if(leg.swing?.settling)leg.swing=null;}
function toggleHumanoidWalking(){
 humanoidWalking=!humanoidWalking;const e=humanoidBoss;if(e){cancelHumanoidStanding(e);if(!humanoidWalking){e.speedRatio=0;if(e.dash){e.motion=e.dash.returnMotion;e.dash=null;}}}
 $('humanoid-walk').textContent=humanoidWalking?'停止行走':'继续行走';humanoidTestHud();
}
function updateHumanoidGait(e,dt,vx=0,vz=0){
 if(!e.gait)e.gait={next:0,height:68,legs:[0,1].map(i=>({foot:humanoidFootTarget(e,i),angle:e.angle,swing:null}))};
 const g=e.gait;
 if(e.crimson){updateCrimsonGait(e,dt,vx,vz);return;}
 if(humanoidMotion(e).cycle&&humanoidWalking){updateHumanoidRunningGait(e,dt,vx,vz);return;}
 if(g.running){g.running=false;for(const leg of g.legs){leg.swing=null;leg.foot[1]=4;}}
 for(const leg of g.legs)if(leg.swing){const s=leg.swing;s.age=Math.min(s.duration,s.age+dt);const t=s.age/s.duration,u=t*t*(3-2*t);leg.foot=s.from.map((v,j)=>v+(s.to[j]-v)*u);leg.foot[1]+=Math.sin(t*Math.PI)*23;leg.angle=s.angleFrom+Math.atan2(Math.sin(s.angleTo-s.angleFrom),Math.cos(s.angleTo-s.angleFrom))*u;if(t>=1){leg.foot=s.to;leg.angle=s.angleTo;leg.swing=null;}}
 // Raise the pelvis for extended support legs. Lower only as much as the
 // current contacts need, so long strides never force the solver to slide feet.
 let height=68;
 for(let i=0;i<2;i++){const hip=humanoidLocal(e,i===0?-14:14,0,0),foot=g.legs[i].foot,reach=Math.hypot(hip[0]-foot[0],hip[2]-foot[2]);height=Math.min(height,foot[1]+Math.sqrt(Math.max(0,69.2**2-reach**2)));}
 g.height=height<g.height?height:g.height+(height-g.height)*(1-Math.exp(-dt*12));
 if(g.legs.some(l=>l.swing))return;
 // Alternate support feet; prediction keeps the hip inside two-bone reach.
 for(const i of [g.next,1-g.next]){const leg=g.legs[i],target=humanoidFootTarget(e,i,vx,vz),hip=humanoidLocal(e,i===0?-14:14,g.height,0),drift=Math.hypot(target[0]-leg.foot[0],target[2]-leg.foot[2]),reach=Math.hypot(hip[0]+vx*.44-leg.foot[0],hip[2]+vz*.44-leg.foot[2]),turn=Math.abs(Math.atan2(Math.sin(e.angle-leg.angle),Math.cos(e.angle-leg.angle)));
  if(drift>38||reach>49||turn>.65){leg.swing={from:[...leg.foot],to:target,age:0,duration:.4,angleFrom:leg.angle,angleTo:e.angle};g.next=1-i;break;}
 }
}
// Stance contacts are fixed; each leg then recovers through a high knee swing.
// Duty < .5 introduces two short flight windows per complete left/right cycle.
function humanoidRunFootTarget(e,i,duration,vx,vz){
 const m=humanoidMotion(e),look=duration-m.cycle*m.duty*.35;
 // Sample the known curved route at touchdown instead of assuming a straight
 // velocity during the whole recovery. This matters at sprint speed.
 const q=humanoidPatrolPosition(e,e.t+e.speedRatio*look,look),ahead=humanoidPatrolPosition(e,e.t+e.speedRatio*(look+.001),look+.001),angle=Math.atan2(ahead.x-q.x,(ahead.y-q.y)*1.06),side=i===0?-14:14;
 return [q.x-325+Math.cos(angle)*side,4,(q.y-300)*1.06-Math.sin(angle)*side];
}
function updateHumanoidRunningGait(e,dt,vx,vz){
 const g=e.gait,m=humanoidMotion(e);
 if(!g.running){g.running=true;g.runPhase=0;for(const leg of g.legs)leg.swing=null;}
 g.runPhase+=dt/m.cycle;
 for(let i=0;i<2;i++){
  const leg=g.legs[i],phase=(g.runPhase+i*.5)%1;
  if(phase<m.duty){if(leg.swing){leg.foot=leg.swing.to;leg.angle=leg.swing.angleTo;leg.swing=null;}leg.foot[1]=4;}
  else{
   if(!leg.swing){const duration=Math.max(dt,(1-phase)*m.cycle);leg.swing={from:[...leg.foot],to:humanoidRunFootTarget(e,i,duration,vx,vz),age:0,duration,angleFrom:leg.angle,angleTo:e.angle};}
   const s=leg.swing;s.age=Math.min(s.duration,s.age+dt);const t=s.age/s.duration,u=t*t*(3-2*t);
   leg.foot=s.from.map((v,j)=>v+(s.to[j]-v)*u);leg.foot[1]+=Math.sin(t*Math.PI)*m.lift;
   leg.angle=s.angleFrom+Math.atan2(Math.sin(s.angleTo-s.angleFrom),Math.cos(s.angleTo-s.angleFrom))*u;
  }
 }
 const flight=g.legs.every(l=>l.swing),bounce=flight?Math.sin(((g.runPhase% .5)-m.duty)/(.5-m.duty)*Math.PI)*5:0;
 let height=m.height+Math.max(0,bounce);
 for(let i=0;i<2;i++){const hip=humanoidLocal(e,i===0?-14:14,0,0),foot=g.legs[i].foot,reach=Math.hypot(hip[0]-foot[0],hip[2]-foot[2]);height=Math.min(height,foot[1]+Math.sqrt(Math.max(0,69.2**2-reach**2)));}
 g.height=height<g.height?height:g.height+(height-g.height)*(1-Math.exp(-dt*18));
}
// Pitch around the waist, keeping the hip anchors shared with the leg IK.
function humanoidUpperPose(e,yaw=e.angle+(e.slash?.chestTwist||0),lean=e.lean||0,upper=!!e.slash){
 const c=Math.cos(yaw),s=Math.sin(yaw),a=lean,ca=Math.cos(a),sa=Math.sin(a),y=58+humanoidBodyLift(e);
 if(upper){const a=e.slash.lowerLean||0,waist=humanoidLocal(e,0,0,0),rise=22*Math.cos(a),reach=22*Math.sin(a);waist[0]+=Math.sin(e.angle)*reach;waist[1]=y+rise;waist[2]+=Math.cos(e.angle)*reach;const m=[c,s*sa,s*ca,waist[0]-s*sa*80,0,ca,-sa,waist[1]-ca*80,-s,c*sa,c*ca,waist[2]-c*sa*80];return humanoidWeaponPullPose(e,m,waist);}
 return [c,s*sa,s*ca,e.x-325-s*sa*58,0,ca,-sa,y-ca*58,-s,c*sa,c*ca,(e.y-300)*1.06-c*sa*58];
}
// Roll around the robot's forward axis so weapon-side pull does not become yaw.
function humanoidWeaponPullPose(e,m,pivot){
 const pull=-(e.slash?.handSide||1)*(e.slash?.sidePull||0);if(!pull)return m;
 const c=Math.cos(e.angle),s=Math.sin(e.angle),cr=Math.cos(pull*.22),sr=Math.sin(pull*.22);
 for(let j=0;j<4;j++){const x=m[j]-(j===3?pivot[0]:0),y=m[4+j]-(j===3?pivot[1]:0),z=m[8+j]-(j===3?pivot[2]:0),right=c*x-s*z,forward=s*x+c*z,r=right*cr-y*sr-(j===3?pull*4:0);m[j]=c*r+s*forward+(j===3?pivot[0]:0);m[4+j]=right*sr+y*cr+(j===3?pivot[1]:0);m[8+j]=-s*r+c*forward+(j===3?pivot[2]:0);}
 return m;
}
function humanoidUpperPoint(e,x,y,z){const m=humanoidUpperPose(e);return [m[0]*x+m[1]*y+m[2]*z+m[3],m[4]*x+m[5]*y+m[6]*z+m[7],m[8]*x+m[9]*y+m[10]*z+m[11]];}
function humanoidHeadAnchor(e){const q=humanoidUpperPoint(e,0,120,0),extend=Math.sin(e.lean||0);return [q[0]+Math.sin(e.angle)*8*extend,q[1]+3*extend,q[2]+Math.cos(e.angle)*8*extend];}
// Neck counter-rotates the torso pitch: the face looks ahead, not at the floor.
function humanoidHeadPose(e){return monsterPose(...humanoidHeadAnchor(e),e.angle+(e.slash?.chestTwist||0));}
function humanoidPatrolPose(t){return {x:325+Math.sin(t*.3)*160,y:265-Math.cos(t*.45)*85};}
function humanoidPatrolPosition(e,t,after=0){const q=humanoidPatrolPose(t);if(e.patrolOffset){q.x+=e.patrolOffset.x*Math.exp(-after*.25);q.y+=e.patrolOffset.y*Math.exp(-after*.25);}q.x=Math.max(A.x+75,Math.min(A.x+A.w-75,q.x));q.y=Math.max(A.y+75,Math.min(A.y+A.h-75,q.y));return q;}
function startHumanoidDash(e){
 if(e.dash||e.slash)return;
 const dx=Math.sin(e.angle),dy=Math.cos(e.angle)/1.06;
 let distance=160;
 if(dx>1e-6)distance=Math.min(distance,(A.x+A.w-75-e.x)/dx);if(dx<-1e-6)distance=Math.min(distance,(A.x+75-e.x)/dx);
 if(dy>1e-6)distance=Math.min(distance,(A.y+A.h-75-e.y)/dy);if(dy<-1e-6)distance=Math.min(distance,(A.y+75-e.y)/dy);
 e.dash={age:0,prep:0,duration:.23,recover:.2,distance:Math.max(0,distance),x:e.x,y:e.y,dx,dy,returnMotion:e.motion==='run'?'run':'walk',height:e.gait.height,lean:e.lean||0,feet:e.gait.legs.map(l=>[...l.foot]),ready:[humanoidLocal(e,-14,4,10),humanoidLocal(e,14,4,-14)],settle:null};
 e.motion='dash';e.gait.running=false;for(const leg of e.gait.legs)leg.swing=null;humanoidWalking=true;e.lean=75*Math.PI/180;e.leanTransition={from:e.lean,target:e.lean,age:HUMANOID_LEAN_DURATION};e.gait.height=44;updateHumanoidDash(e,0);$('humanoid-walk').textContent='停止行走';humanoidTestHud();
}
function updateHumanoidDash(e,dt){
 const d=e.dash,g=e.gait;if(!humanoidWalking)return;
 d.age=Math.min(d.prep+d.duration+d.recover,d.age+dt);
 const smooth=t=>t*t*(3-2*t),mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
 if(d.age<d.duration){
  const t=d.age/d.duration,u=t*(2-t);e.x=d.x+d.dx*d.distance*u;e.y=d.y+d.dy*d.distance*u;updateHumanoidLean(e,75*Math.PI/180,dt);g.height=44;
  const front=humanoidLocal(e,-14,18,12),rear=humanoidLocal(e,14,9,-24);
  g.legs[0].foot=mix(d.ready[0],front,smooth(Math.min(1,t/.2)));g.legs[0].swing={dash:true};
  if(t<=.08){g.legs[1].foot=[...d.ready[1]];g.legs[1].swing=null;}
  else{g.legs[1].foot=mix(d.ready[1],rear,smooth(Math.min(1,(t-.08)/.12)));g.legs[1].swing={dash:true};}
 }else{
  e.x=d.x+d.dx*d.distance;e.y=d.y+d.dy*d.distance;
  if(!d.settle)d.settle=[humanoidLocal(e,-14,18,12),humanoidLocal(e,14,9,-24)];
  const t=(d.age-d.prep-d.duration)/d.recover,u=smooth(t),m=HUMANOID_MOTIONS[d.returnMotion];updateHumanoidLean(e,m.lean*Math.PI/180,dt);g.height=44+(m.height-44)*u;
  for(let i=0;i<2;i++){g.legs[i].foot=mix(d.settle[i],humanoidLocal(e,i===0?-14:14,4,i===0?8:-6),u);g.legs[i].swing=t<1?{dash:true}:null;}
 }
 // Both feet stay within exact IK reach throughout the push and recovery.
 for(let i=0;i<2;i++){g.legs[i].angle=e.angle;const hip=humanoidLocal(e,i===0?-14:14,0,0),foot=g.legs[i].foot,r=Math.hypot(hip[0]-foot[0],hip[2]-foot[2]);g.height=Math.min(g.height,foot[1]+Math.sqrt(Math.max(0,69.2**2-r*r)));}
 if(d.age>=d.prep+d.duration+d.recover){e.motion=d.returnMotion;e.dash=null;e.speedRatio=1;for(const leg of g.legs){leg.swing=null;leg.foot[1]=4;}const q=humanoidPatrolPose(e.t);e.patrolOffset={x:e.x-q.x,y:e.y-q.y};g.next=1;}
}
function humanoidFacingMode(e){return humanoidWalking&&(e.dash||humanoidMotion(e).cycle||e.t%10>=6)?'travel':'player';}
function startHumanoidSlash(e=humanoidBoss,kind='slash',direction=1,carry=null){
 if(!e||e.dash||e.hp<=0||state!=='combat')return;
 if(e.slash){const active=e.slash;if(kind==='slash'&&!['thrust','shoot','dualshoot','strafe','spinshoot','skyshoot','blink'].includes(active.kind)&&direction!==active.direction&&active.age<active.windup+active.strike)active.queuedDirection=direction;return;}
 // Facing +Z with +Y up: anatomical right is local -X.
 e.standPlan=null;
 const handSide=-1;
 e.slash={kind,handSide,direction,swingSide:-direction,age:0,windup:carry?.06:.14,strike:.24,recover:.4,lowerLean:e.lean||0,angle:e.angle,x:e.x,y:e.y,height:e.gait.height,startHeight:e.gait.height,lean:e.lean||0,returnMotion:e.motion,footAngles:e.gait.legs.map(l=>l.angle),feet:e.gait.legs.map(l=>[...l.foot]),stance:[humanoidLocal(e,-16,4,6),humanoidLocal(e,16,4,-6)],handFrom:humanoidUpperPoint(e,handSide*37,83,9),hand:null,trail:[],pull:{vx:0,vz:0,chestVelocity:0,chestAngle:e.angle},chestTwist:0};
 if(carry){const s=e.slash;s.returnMotion=carry.returnMotion;s.height=carry.height;s.lowerLean=carry.lowerLean;s.handFrom=[...carry.hand.point];s.bladeFrom=carry.hand.angle;s.twistFrom=carry.chestTwist;s.sideFrom=carry.sidePull;s.pull.chestAngle=s.angle+carry.chestTwist;s.pull.chestVelocity=carry.pull.chestVelocity;s.chestTwist=carry.chestTwist;s.stance=e.gait.legs.map(l=>[l.foot[0],4,l.foot[2]]);s.chainIndex=(carry.chainIndex||0)+1;}
 if(kind==='charged'){e.slash.windup=1.16;e.slash.charge={raise:.18,flash:1,flashDuration:.1,release:1.1};e.slash.stance=[humanoidReadyFootTarget(e,0),humanoidReadyFootTarget(e,1)];e.slash.charge.standPlan=humanoidStandPlan(e,e.slash.stance);}
 if(['shoot','dualshoot','strafe','spinshoot','skyshoot'].includes(kind)){const s=e.slash;s.windup=.04;s.strike=kind==='dualshoot'?.14:.05;s.recover=0;s.lowerLean=0;if(!e.crimson)e.angle=Math.atan2(p.x-e.x,(p.y-e.y)*1.06);s.angle=e.angle;s.stance=[humanoidReadyFootTarget(e,0),humanoidReadyFootTarget(e,1)];s.gunStand=humanoidStandPlan(e,s.stance);s.guns=(kind!=='shoot'?[-1,1]:[-1]).map((side,i)=>({side,fireAt:s.windup+i*.1,from:humanoidUpperPoint(e,side*37,83,9)}));}
 if(kind==='strafe'||kind==='spinshoot'){const s=e.slash;s.barrage=true;s.strike=2.4;s.recover=0;s.interval=kind==='strafe'?(e.cowboy?.15:.075):.045;s.nextFire=s.windup;s.fired=0;s.shots=[];s.startAngle=e.angle;e.motion='walk';}
 if(kind==='skyshoot'){const s=e.slash;s.windup=.12;s.strike=.12;s.recover=0;s.guns.forEach((g,i)=>g.fireAt=.12+i*.08);s.drops=[0,1].map(i=>({x:A.x+90+Math.random()*(A.w-180),y:A.y+90+Math.random()*(A.h-180),land:1.05+i*.2}));if(Math.hypot(s.drops[0].x-s.drops[1].x,s.drops[0].y-s.drops[1].y)<70)s.drops[1].x=s.drops[0].x<325?A.x+A.w-90:A.x+90;}
 if(kind==='skyshoot'){(e.skyEffects??=[]).push({age:0,drops:e.slash.drops,combat:!!e.cowboy});}
 if(kind==='blink'){const s=e.slash;s.windup=.26;s.strike=.34;s.recover=.22;s.lowerLean=0;const a=Math.random()*TAU,candidates=Array.from({length:8},(_,i)=>({x:Math.max(A.x+85,Math.min(A.x+A.w-85,e.x+Math.sin(a+i*TAU/8)*145)),y:Math.max(A.y+85,Math.min(A.y+A.h-85,e.y+Math.cos(a+i*TAU/8)*145/1.06))}));s.destination=candidates.sort((a,b)=>Math.hypot(b.x-e.x,b.y-e.y)-Math.hypot(a.x-e.x,a.y-e.y))[0];}
 if(kind==='thrust'){const s=e.slash;s.prep=.14;s.hold=.12;s.windup=s.prep+s.hold;s.launch=.055;s.strike=.16;s.recover=.16;s.lowerLean=0;}
 e.gait.running=false;for(const leg of e.gait.legs)leg.swing=null;
 updateHumanoidSlash(e,0);humanoidTestHud();
}
function updateHumanoidShoot(e,dt){
 if(e.slash.barrage){updateHumanoidBarrage(e,dt);return;}
 const s=e.slash,g=e.gait,smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);},ready=smooth(s.age/.035),recover=s.recover?smooth((s.age-s.windup-s.strike)/s.recover):0;
 const aimYaw=Math.atan2(p.x-e.x,(p.y-e.y)*1.06);e.angle+=Math.atan2(Math.sin(aimYaw-e.angle),Math.cos(aimYaw-e.angle))*Math.min(1,dt*60);s.angle=e.angle;
 if(e.crimson&&humanoidWalking){updateCrimsonRoam(e,dt);s.x=e.x;s.y=e.y;}else{updateHumanoidStandFeet(e,s.gunStand,dt);e.x=s.x;e.y=s.y;}g.height=s.startHeight+(60-s.startHeight)*ready;e.lean=(s.lean+(6*Math.PI/180-s.lean)*ready)*(1-recover);s.sidePull=0;s.chestTwist=0;
 for(let i=0;i<2;i++){const hip=humanoidLocal(e,i===0?-14:14,0,0),foot=g.legs[i].foot,r=Math.hypot(hip[0]-foot[0],hip[2]-foot[2]);g.height=Math.min(g.height,foot[1]+Math.sqrt(Math.max(0,69.2**2-r*r)));}
 for(const gun of s.guns){const t=s.age-gun.fireAt,kick=t>=0&&t<.09?Math.sin(Math.PI*t/.09):0,side=gun.side,shoulder=humanoidUpperPoint(e,side*25,99,0),aim=[p.x-325,35,(p.y-300)*1.06],yaw=s.kind==='skyshoot'?s.angle:gun.shot?.yaw??Math.atan2(aim[0]-shoulder[0],aim[2]-shoulder[2]),pitch=s.kind==='skyshoot'?Math.PI/2:gun.shot?.pitch??Math.atan2(aim[1]-shoulder[1],Math.hypot(aim[0]-shoulder[0],aim[2]-shoulder[2])),cp=Math.cos(pitch),reach=45-9*kick;
  const target=[shoulder[0]+Math.sin(yaw)*cp*reach,shoulder[1]+Math.sin(pitch)*reach,shoulder[2]+Math.cos(yaw)*cp*reach],home=humanoidUpperPoint(e,side*37,83,9),point=gun.from.map((v,i)=>(v+(target[i]-v)*ready)*(1-recover)+home[i]*recover);
  gun.arm=solveSpiderLeg(shoulder,point,30,36,[Math.cos(s.angle)*side,.3,-Math.sin(s.angle)*side]);gun.hand={point:gun.arm.foot,angle:yaw,pitch:pitch+.2*kick};
  if(!gun.shot&&s.age>=gun.fireAt){const q=gun.hand.point;gun.shot={age:gun.fireAt,side,yaw,pitch,origin:[q[0]+Math.sin(yaw)*cp*38,q[1]+Math.sin(pitch)*38,q[2]+Math.cos(yaw)*cp*38]};if(typeof cowboyGunEvent==='function')cowboyGunEvent(e,s,gun.shot);}
 }
 s.arm=s.guns[0].arm;s.hand=s.guns[0].hand;s.shot=s.guns[0].shot;
 if(s.age>=s.windup+s.strike+s.recover){e.motion=s.returnMotion;e.slash=null;e.leanTransition=null;e.standPlan=null;for(const leg of g.legs){leg.swing=null;leg.foot[1]=4;}g.next=0;const q=humanoidPatrolPose(e.t);e.patrolOffset={x:e.x-q.x,y:e.y-q.y};}
}
// Continuous gun actions share the pistol rig; fired rounds retain world-space rays.
function updateHumanoidBarrage(e,dt){
 const s=e.slash,g=e.gait,spin=s.kind==='spinshoot',end=s.windup+s.strike,active=s.age<end,u=Math.min(1,s.age/.04),recover=s.recover?Math.max(0,Math.min(1,(s.age-end)/s.recover)):0,oldX=e.x,oldY=e.y;
 if(e.cowboy&&active)cowboyBarrageMove(e,dt);
 if(e.crimson&&active&&humanoidWalking)updateCrimsonRoam(e,dt,false);
 if(spin)e.angle=s.startAngle+Math.min(s.strike,Math.max(0,s.age-s.windup))*TAU*1.25;
 else{
  const aim=Math.atan2(p.x-e.x,(p.y-e.y)*1.06);
  if(active&&!e.cowboy&&!e.crimson){const v=55*Math.cos(s.age*2.2);e.x=Math.max(A.x+75,Math.min(A.x+A.w-75,e.x+Math.cos(aim)*v*dt));e.y=Math.max(A.y+75,Math.min(A.y+A.h-75,e.y-Math.sin(aim)*v*dt/1.06));}
  const wanted=Math.atan2(p.x-e.x,(p.y-e.y)*1.06);if(e.crimson){const delta=Math.atan2(Math.sin(wanted-e.angle),Math.cos(wanted-e.angle));e.angle+=Math.max(-dt*3,Math.min(dt*3,delta));}else e.angle=wanted;
 }
 s.angle=e.angle;s.chestTwist=0;s.sidePull=0;e.lean=e.crimson?0:(spin?3:9)*Math.PI/180*(1-recover);
 if(e.cowboy)cowboyMovingFeet(e,dt);else updateHumanoidGait(e,dt,dt?(e.x-oldX)/dt:0,dt?(e.y-oldY)*1.06/dt:0);
 if(!e.crimson)g.height=Math.min(g.height,62);
 for(const gun of s.guns){
  const side=gun.side,shoulder=humanoidUpperPoint(e,side*25,99,0),aim=[p.x-325,35,(p.y-300)*1.06],yaw=spin?e.angle+side*Math.PI/2:Math.atan2(aim[0]-shoulder[0],aim[2]-shoulder[2]),pitch=spin?0:Math.atan2(aim[1]-shoulder[1],Math.hypot(aim[0]-shoulder[0],aim[2]-shoulder[2])),t=s.age-(gun.shot?.age??-1),kick=t>=0&&t<.1?Math.sin(t*Math.PI/.1):0,cp=Math.cos(pitch),reach=48-7*kick;
  const target=[shoulder[0]+Math.sin(yaw)*cp*reach,shoulder[1]+Math.sin(pitch)*reach,shoulder[2]+Math.cos(yaw)*cp*reach],home=humanoidUpperPoint(e,side*37,83,9),point=home.map((v,i)=>v+(target[i]-v)*u*(1-recover));
  gun.arm=solveSpiderLeg(shoulder,point,30,36,[Math.cos(e.angle)*side,.3,-Math.sin(e.angle)*side]);gun.hand={point:gun.arm.foot,angle:yaw,pitch:pitch+.14*kick};
 }
 while(s.nextFire<=s.age+1e-9&&s.nextFire<end-1e-9){
  const gun=s.guns[s.fired%2],yaw=gun.hand.angle,pitch=gun.hand.pitch,q=gun.hand.point,cp=Math.cos(pitch);
  gun.fireAt=s.nextFire;gun.shot={age:s.nextFire,side:gun.side,yaw,pitch,origin:[q[0]+Math.sin(yaw)*cp*38,q[1]+Math.sin(pitch)*38,q[2]+Math.cos(yaw)*cp*38]};s.shots.push(gun.shot);if(typeof cowboyGunEvent==='function')cowboyGunEvent(e,s,gun.shot);s.nextFire+=s.interval;s.fired++;
 }
 s.shots=s.shots.filter(q=>s.age-q.age<.7);s.arm=s.guns[0].arm;s.hand=s.guns[0].hand;
 if(s.age>=end+s.recover){e.motion=s.returnMotion;e.slash=null;e.leanTransition=null;e.standPlan=null;for(const leg of g.legs){leg.swing=null;leg.foot[1]=4;}g.next=0;const q=humanoidPatrolPose(e.t);e.patrolOffset={x:e.x-q.x,y:e.y-q.y};}
}
function drawHumanoidBarrage(s){
 for(const r of s.shots){const t=s.age-r.age,d=t*420,cp=Math.cos(r.pitch),sp=Math.sin(r.pitch),c=Math.cos(r.yaw),sn=Math.sin(r.yaw),o=r.origin;
  renderer.residentMesh('humanoid:barrage-round',()=>{renderer.emissiveBox(0,0,0,4,4,21,'#ffbb58');renderer.emissiveBox(0,0,5,2,2,12,'#fff6c1');},[c,-sn*sp,sn*cp,o[0]+sn*cp*d,0,cp,sp,o[1]+sp*d,-sn,-c*sp,c*cp,o[2]+c*cp*d]);
 }
}
function drawHumanoidEffectRing(x,z,r,y,key,color){
 for(let i=0;i<32;i++){const a=i*TAU/32;renderer.residentMesh(key,()=>renderer.emissiveBox(0,0,0,2,1,1,color),monsterPose(x+Math.sin(a)*r,y,z+Math.cos(a)*r,a+Math.PI/2,1,1,r*TAU/32*.8));}
}
function drawHumanoidSky(s){
 for(const drop of s.drops){const x=drop.x-325,z=(drop.y-300)*1.06,t=s.age-drop.land;
  if(t<0&&s.age>.24){drawHumanoidEffectRing(x,z,23,3,'humanoid:landing-marker','#efbb65');if(t>=-.4){const h=12+260*(1-((t+.4)/.4)**2);renderer.residentMesh('humanoid:sky-heavy',()=>{renderer.sphere(0,0,0,19,'#ffbc58',1,1,1,8,12);renderer.sphere(-6,7,10,5,'#fff1bb',1,1,1,4,8);},monsterPose(x,h,z));}}
  if(t>=0&&t<.8){if(t<.2)drawHumanoidEffectRing(x,z,12+180*t,3,'humanoid:impact-ring','#ffffff');if(!s.combat)for(let i=0;i<24;i++){const a=i*TAU/24,r=12+t*220;renderer.residentMesh('humanoid:sky-ring-round',()=>renderer.emissiveBox(0,0,0,5,5,15,'#ffc66e'),monsterPose(x+Math.sin(a)*r,12,z+Math.cos(a)*r,a));}}
 }
}
function updateHumanoidBlink(e,dt){
 const s=e.slash,g=e.gait,prep=Math.min(1,s.age/.16),spin=Math.max(0,Math.min(1,(s.age-s.windup)/s.strike)),recover=Math.max(0,Math.min(1,(s.age-s.windup-s.strike)/s.recover));
 if(!s.teleported&&s.age>=.43){if(e.cowboy)s.destination=cowboyDestination(e,true);e.x=s.destination.x;e.y=s.destination.y;s.teleported=true;}
 e.angle=s.angle+TAU*spin;e.lean=0;s.chestTwist=0;s.sidePull=0;g.height=60+6*prep*(1-recover);
 for(let i=0;i<2;i++){const target=humanoidLocal(e,i===0?-12:15,i===0?4:4+24*prep*(1-recover),i===0?0:-8),leg=g.legs[i],from=[s.feet[i][0]+e.x-s.x,s.feet[i][1],s.feet[i][2]+(e.y-s.y)*1.06];leg.foot=from.map((v,j)=>v+(target[j]-v)*prep);leg.angle=e.angle;leg.swing=null;const hip=humanoidLocal(e,i===0?-14:14,0,0),r=Math.hypot(hip[0]-leg.foot[0],hip[2]-leg.foot[2]);g.height=Math.min(g.height,leg.foot[1]+Math.sqrt(Math.max(0,69.2**2-r*r)));}
 const hands=[-1,1].map(side=>{const home=humanoidRestHand(e,side,0),pose=humanoidUpperPoint(e,side===-1?-18:52,side===-1?142:100,4),target=home.map((v,i)=>v+(pose[i]-v)*prep*(1-recover)),shoulder=humanoidUpperPoint(e,side*25,99,0);return solveSpiderLeg(shoulder,target,30,36,[side*Math.cos(e.angle),.3,-side*Math.sin(e.angle)]);});
 s.arm=hands[0];s.hand={point:hands[0].foot,angle:e.angle};s.leftHand=hands[1].foot;
 if(s.age>=s.windup+s.strike+s.recover){e.motion=s.returnMotion;e.slash=null;e.leanTransition=null;e.standPlan=null;for(const leg of g.legs){leg.swing=null;leg.foot[1]=4;}const q=humanoidPatrolPose(e.t);e.patrolOffset={x:e.x-q.x,y:e.y-q.y};g.next=0;}
}
function drawHumanoidBlink(s){
 const t=s.age-.43;if(t<-.07||t>.2)return;
 for(const q of [{x:s.x,y:s.y},s.destination]){const x=q.x-325,z=(q.y-300)*1.06,r=22+Math.max(0,t)*170;drawHumanoidEffectRing(x,z,r,5,'humanoid:blink-ring','#9befff');renderer.residentMesh('humanoid:blink-star',drawHumanoidChargeStar,monsterPose(x,65,z,0,32*(1-Math.max(0,t)/.2),1,32*(1-Math.max(0,t)/.2)));}
}
function drawHumanoidGun(e,hit){
 const s=e.slash;if(s.barrage&&!e.cowboy)drawHumanoidBarrage(s);for(const gun of s.guns){const q=gun.hand.point,a=gun.hand.angle,p=gun.hand.pitch,c=Math.cos(a),sn=Math.sin(a),cp=Math.cos(p),sp=Math.sin(p),pose=[c,-sn*sp,sn*cp,q[0],0,cp,sp,q[1],-sn,-c*sp,c*cp,q[2]];
 if(s.age<s.windup+s.strike+s.recover*.6)renderer.residentMesh('humanoid:pistol',()=>{renderer.box(0,7,17,12,12,38,'#c5d8df');renderer.box(0,-1,4,10,22,12,'#344c59');renderer.box(0,7,37,8,7,5,'#273b46');renderer.emissiveBox(0,14,19,3,2,20,'#65f9ed');},pose,hit);
 const t=s.age-gun.fireAt;if(gun.shot&&t>=0&&t<.055)renderer.residentMesh('humanoid:muzzle-flash',()=>{renderer.emissiveBox(0,7,47,16,14,21,'#ffd16a');renderer.emissiveBox(0,7,43,7,7,13,'#ffffff');},pose);
 if(!e.cowboy&&!s.barrage&&gun.shot&&t>=0&&t<.16){const r=gun.shot,d=40+t*1300,cp=Math.cos(r.pitch),sp=Math.sin(r.pitch),c=Math.cos(r.yaw),sn=Math.sin(r.yaw),o=r.origin;renderer.residentMesh('humanoid:gun-tracer',()=>renderer.emissiveBox(0,0,0,2.5,2.5,28,'#ffdc85'),[c,-sn*sp,sn*cp,o[0]+sn*cp*d,0,cp,sp,o[1]+sp*d,-sn,-c*sp,c*cp,o[2]+c*cp*d]);}}
}
function humanoidSlashProgress(s,t){const u=Math.max(0,Math.min(1,t/s.strike));return 1-(1-u)**3;}
function humanoidSlashStroke(s,t){return s.angle+s.swingSide*(1.55-3.1*humanoidSlashProgress(s,t));}
function humanoidSlashBladeAngle(s,t){return s.angle+s.swingSide*(2.6-5.2*humanoidSlashProgress(s,t));}
// The world-space hand drives only the upper body. The pelvis remains fixed,
// while a hidden two-bone arm absorbs reach and the chest recovers to center.
function solveHumanoidHandPull(e,dt,weight){
 const s=e.slash,pull=s.pull,hand=s.hand.point,recover=s.age>=s.windup+s.strike;
 const bearing=Math.atan2(hand[0]-(s.x-325),hand[2]-(s.y-300)*1.06),reference=s.hand.pathAngle??s.hand.angle;
 const delta=reference+Math.atan2(Math.sin(bearing-reference),Math.cos(bearing-reference))-s.angle-Math.atan2(s.handSide*37,9);
 // Upper body has a yaw budget; pelvis and world position do not follow it.
 const target=recover?s.angle:s.kind==='thrust'?s.angle+(s.age<s.windup?-.3:.3):s.angle+Math.max(-1.2,Math.min(1.2,s.swingSide*.95*(s.age<s.windup?1:1-2*humanoidSlashProgress(s,s.age-s.windup))+Math.max(-.15,Math.min(.15,delta*.12))));
 pull.chestVelocity+=((target-pull.chestAngle)*625-pull.chestVelocity*50)*dt;pull.chestAngle+=pull.chestVelocity*dt;
 const fade=recover?Math.max(0,1-(s.age-s.windup-s.strike)/s.recover):1;
 s.chestTwist=Math.max(-1.2,Math.min(1.2,pull.chestAngle-s.angle))*(recover?fade*fade:1);
 e.angle=s.angle;if(s.kind==='thrust'){if(s.age>=.08)solveHumanoidThrustTranslation(e,dt);}else{e.x=s.x;e.y=s.y;}
 // Invisible upper arm + forearm absorb reach before the hand reaches its
 // limit. The skeleton is solved, while the detached-hand design is retained.
 const shoulder=humanoidUpperPoint(e,s.handSide*25,99,0),pole=[Math.cos(s.angle)*s.handSide,.4,-Math.sin(s.angle)*s.handSide];
 s.arm=solveSpiderLeg(shoulder,hand,30,36,pole);s.hand.point=s.arm.foot;
}
function updateHumanoidSlash(e,dt){
 const s=e.slash,g=e.gait;s.age=Math.min(s.windup+s.strike+s.recover,s.age+dt);
 if(s.kind==='blink'){updateHumanoidBlink(e,dt);return;}
 if(s.guns){updateHumanoidShoot(e,dt);return;}
 if(s.queuedDirection&&s.age>=s.windup+s.strike){const next=s.queuedDirection,extra=s.age-s.windup-s.strike;s.queuedDirection=null;s.age=s.windup+s.strike-1e-9;updateHumanoidSlash(e,0);e.slash=null;startHumanoidSlash(e,'slash',next,s);if(extra>0)updateHumanoidSlash(e,extra);return;}
 const smooth=t=>t*t*(3-2*t),mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
 if(s.kind==='thrust'){updateHumanoidThrust(e,dt);return;}
 const settle=Math.max(0,Math.min(1,(s.age-s.windup-s.strike)/s.recover));
 const sideTarget=s.direction;
 s.sidePull=s.age<s.windup?(s.sideFrom||0)+(sideTarget-(s.sideFrom||0))*smooth(Math.min(1,s.age/(s.charge?.raise||s.windup))):s.age<s.windup+s.strike?sideTarget*(1-2*humanoidSlashProgress(s,s.age-s.windup)): -sideTarget*(1-smooth(settle));
 if(s.charge)updateHumanoidStandFeet(e,s.charge.standPlan,dt);
 if(s.kind==='charged'&&s.age<s.windup){
  const c=s.charge,raise=smooth(Math.min(1,s.age/c.raise)),a=s.angle+s.swingSide*1.55;
  g.height=s.startHeight+(56-s.startHeight)*raise;e.lean=s.lean+(10*Math.PI/180-s.lean)*raise;
  const target=humanoidLocal(e,s.handSide*24,70,30);
  s.hand={point:mix(s.handFrom,target,raise),angle:s.angle+s.swingSide*2.6,pathAngle:a,pitch:Math.PI/2};
  s.pull.chestAngle=s.angle+s.swingSide*.12*raise;s.pull.chestVelocity=0;solveHumanoidHandPull(e,0,0);
  const support=humanoidLocal(e,s.handSide*14,60,26);s.supportHand=mix(humanoidUpperPoint(e,-s.handSide*37,83,9),support,raise);
 }else if(s.age<s.windup){const t=s.age/s.windup,u=smooth(t);g.height=s.startHeight+(54-s.startHeight)*u;e.lean=s.lean+(18*Math.PI/180-s.lean)*u;
  const target=[s.x-325+Math.sin(s.angle+s.swingSide*1.55)*55,64,(s.y-300)*1.06+Math.cos(s.angle+s.swingSide*1.55)*55];s.hand={point:mix(s.handFrom,target,u),angle:(s.bladeFrom??(s.angle+s.swingSide*2.6))+((s.angle+s.swingSide*2.6)-(s.bladeFrom??(s.angle+s.swingSide*2.6)))*u,pathAngle:s.angle+s.swingSide*1.55};
  // Set a wide stance before the weapon becomes the root's driver.
  for(let i=0;i<2;i++){g.legs[i].foot=mix(s.feet[i],s.stance[i],u);g.legs[i].foot[1]+=s.chainIndex?0:Math.sin(t*Math.PI)*6;g.legs[i].swing=null;}
  solveHumanoidHandPull(e,dt,0);
 }else{
  const attack=s.age<s.windup+s.strike;
  if(attack){const t=(s.age-s.windup)/s.strike,a=humanoidSlashStroke(s,s.age-s.windup),radius=55+Math.sin(t*Math.PI)*8;
   s.hand={point:[s.x-325+Math.sin(a)*radius,64,(s.y-300)*1.06+Math.cos(a)*radius],angle:humanoidSlashBladeAngle(s,s.age-s.windup),pathAngle:a};g.height=54;e.lean=18*Math.PI/180;
   solveHumanoidHandPull(e,dt,Math.min(1,t/.12));
  }else{const t=(s.age-s.windup-s.strike)/s.recover,u=smooth(t),m=HUMANOID_MOTIONS[s.returnMotion],from=[s.x-325+Math.sin(s.angle-s.swingSide*1.55)*55,64,(s.y-300)*1.06+Math.cos(s.angle-s.swingSide*1.55)*55];
   s.hand={point:mix(from,humanoidUpperPoint(e,s.handSide*37,83,9),u),angle:s.angle-s.swingSide*2.6,pathAngle:s.angle-s.swingSide*1.55};g.height=54+(s.height-54)*u;e.lean=(18+(m.lean-18)*u)*Math.PI/180;
   solveHumanoidHandPull(e,dt,1-u);
  }
  if(attack&&dt>0){appendHumanoidBladeTrail(s,{age:s.age,point:[...s.hand.point],angle:s.hand.angle});s.trail=s.trail.filter(q=>s.age-q.age<.09);}
  if(!s.charge)for(let i=0;i<2;i++){g.legs[i].foot=[...s.stance[i]];g.legs[i].swing=null;}
 }
 for(let i=0;i<2;i++){const hip=humanoidLocal(e,i===0?-14:14,0,0),foot=g.legs[i].foot,r=Math.hypot(hip[0]-foot[0],hip[2]-foot[2]);g.height=Math.min(g.height,foot[1]+Math.sqrt(Math.max(0,69.2**2-r*r)));}
 if(s.age>=s.windup+s.strike+s.recover){e.motion=s.returnMotion;e.slash=null;e.leanTransition=null;for(const leg of g.legs){leg.swing=null;leg.foot[1]=4;}const q=humanoidPatrolPose(e.t);e.patrolOffset={x:e.x-q.x,y:e.y-q.y};g.next=0;}
}
// Reach tension translates the root, but never changes pelvis or foot yaw.
function solveHumanoidThrustTranslation(e,dt){
 const s=e.slash,p=s.pull,shoulder=humanoidUpperPoint(e,s.handSide*25,99,0),d=s.hand.point.map((v,i)=>v-shoulder[i]),r=Math.hypot(...d),excess=Math.max(0,r-61),recover=s.age>=s.windup+s.strike;
 const dx=r?d[0]/r*excess:0,dz=r?d[2]/r*excess:0;
 p.vx+=(dx*180*(recover?.2:1)-p.vx*24)*dt;p.vz+=(dz*180*(recover?.2:1)-p.vz*24)*dt;
 const speed=Math.hypot(p.vx,p.vz);if(speed>440){p.vx*=440/speed;p.vz*=440/speed;}
 const oldX=e.x,oldZ=(e.y-300)*1.06;
 e.x=Math.max(A.x+75,Math.min(A.x+A.w-75,e.x+p.vx*dt));e.y=Math.max(A.y+75,Math.min(A.y+A.h-75,e.y+p.vz*dt/1.06));
 for(let pass=0;pass<6;pass++)for(let i=0;i<2;i++){const hip=humanoidLocal(e,i===0?-14:14,0,0),foot=e.gait.legs[i].foot,dx=hip[0]-foot[0],dz=hip[2]-foot[2],r=Math.hypot(dx,dz);if(r>55){e.x-=dx*(1-55/r);e.y-=dz*(1-55/r)/1.06;}}
 if(dt>0){p.vx=(e.x-oldX)/dt;p.vz=((e.y-300)*1.06-oldZ)/dt;}
}
function updateHumanoidThrustFeet(e,dt){
 const s=e.slash,g=e.gait;
 for(const leg of g.legs)if(leg.swing){const q=leg.swing;q.age=Math.min(q.duration,q.age+dt);const t=q.age/q.duration,u=t*t*(3-2*t);leg.foot=q.from.map((v,j)=>v+(q.to[j]-v)*u);leg.foot[1]+=Math.sin(t*Math.PI)*(s.charge?6:12);if(t>=1){leg.foot=q.to;leg.swing=null;}leg.angle=s.footAngles[g.legs.indexOf(leg)];}
 if(!g.legs.some(l=>l.swing)){const ordered=g.legs.map((leg,i)=>({i,r:Math.hypot(leg.foot[0]-(e.x-325),leg.foot[2]-(e.y-300)*1.06)})).sort((a,b)=>b.r-a.r);if(ordered[0].r>(s.charge?24:30)){const i=ordered[0].i,leg=g.legs[i],target=humanoidLocal(e,i===0?-16:16,4,6);target[0]+=s.pull.vx*.09;target[2]+=s.pull.vz*.09;target[0]=Math.max(A.x-325+10,Math.min(A.x+A.w-325-10,target[0]));target[2]=Math.max((A.y-300)*1.06+10,Math.min((A.y+A.h-300)*1.06-10,target[2]));leg.swing={from:[...leg.foot],to:target,age:0,duration:s.charge?.16:.12};s.steps=(s.steps||0)+1;}}
}
function updateHumanoidThrust(e,dt){
 const s=e.slash,g=e.gait,smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);},mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t),prep=smooth(s.age/s.prep),t=Math.max(0,Math.min(1,(s.age-s.windup)/s.launch)),launch=1-(1-t)**3,recover=s.recover?smooth((s.age-s.windup-s.strike)/s.recover):0,active=s.age>=s.windup;
 const offset=active?-40+140*launch:-40*prep;e.x=Math.max(A.x+75,Math.min(A.x+A.w-75,s.x+Math.sin(s.angle)*offset));e.y=Math.max(A.y+75,Math.min(A.y+A.h-75,s.y+Math.cos(s.angle)*offset/1.06));e.angle=s.angle;
 e.lean=(s.lean+(-18*Math.PI/180-s.lean)*prep)*(1-launch)+65*Math.PI/180*launch;e.lean+=(HUMANOID_MOTIONS[s.returnMotion].lean*Math.PI/180-e.lean)*recover;g.height=s.startHeight+(54-s.startHeight)*prep;g.height+=(s.height-g.height)*recover;s.chestTwist=(-.15*prep+.3*launch)*(1-recover);
 for(let i=0;i<2;i++){const target=humanoidLocal(e,i===0?-16:16,4,i===0?-10:14),from=[s.feet[i][0]+e.x-s.x,s.feet[i][1],s.feet[i][2]+(e.y-s.y)*1.06],leg=g.legs[i];leg.foot=mix(from,target,prep);leg.foot[1]+=active?Math.sin(t*Math.PI)*14:Math.sin(Math.min(1,s.age/s.prep)*Math.PI)*8;leg.angle=s.footAngles[i];leg.swing=(!active&&s.age<s.prep)||(active&&t<1)?{thrustFlight:true}:null;const hip=humanoidLocal(e,i===0?-14:14,0,0),r=Math.hypot(hip[0]-leg.foot[0],hip[2]-leg.foot[2]);g.height=Math.min(g.height,leg.foot[1]+Math.sqrt(Math.max(0,69.2**2-r*r)));}
 const target=humanoidLocal(e,-12,64,-22+80*launch),home=humanoidUpperPoint(e,-37,83,9),from=[s.handFrom[0]+e.x-s.x,s.handFrom[1],s.handFrom[2]+(e.y-s.y)*1.06],point=mix(mix(from,target,prep),home,recover),shoulder=humanoidUpperPoint(e,-25,99,0);
 s.arm=solveSpiderLeg(shoulder,point,30,36,[-Math.cos(s.angle),.4,Math.sin(s.angle)]);s.hand={point:s.arm.foot,angle:s.angle,pathAngle:s.angle};if(active&&!s.impact)s.impact=true;
 if(s.age>=s.windup+s.strike+s.recover){e.motion=s.returnMotion;e.slash=null;e.leanTransition=null;for(const leg of g.legs){leg.swing=null;leg.foot[1]=4;}const q=humanoidPatrolPose(e.t);e.patrolOffset={x:e.x-q.x,y:e.y-q.y};g.next=0;}
}
// Subdivide by angular travel rather than letting a fast sweep become a few
// broad chords. Do not join a translating, stationary blade into the arc.
function appendHumanoidBladeTrail(s,q){
 const p=s.trail.at(-1);
 if(!p){s.trail.push(q);return;}
 const turn=q.angle-p.angle;
 if(Math.abs(turn)<1e-5){s.trail[s.trail.length-1]=q;return;}
 const distance=Math.hypot(...q.point.map((v,i)=>v-p.point[i])),steps=Math.max(1,Math.ceil(Math.abs(turn)/.055),Math.ceil(distance/3));
 for(let i=1;i<=steps;i++){const t=i/steps;s.trail.push({age:p.age+(q.age-p.age)*t,point:p.point.map((v,j)=>v+(q.point[j]-v)*t),angle:p.angle+turn*t});}
}
function drawHumanoidSword(){
 const r=renderer;r.box(0,0,-2,7,7,20,'#344c59');r.box(0,0,12,25,6,5,'#f2ae69');r.box(0,0,49,9,3,70,'#d5e1df');
 r.quad([-4.5,1.5,84],[0,1.5,101],[4.5,1.5,84],[4.5,1.5,84],'#d5e1df');r.quad([-4.5,-1.5,84],[4.5,-1.5,84],[0,-1.5,101],[0,-1.5,101],'#89adb7');
 r.emissiveBox(0,2,49,2,1,70,'#65f9ed');r.markPhosphor(0,.1);
}
function drawHumanoidChargeStar(){
 const points=[[0,0,-1],[.13,0,-.13],[1,0,0],[.13,0,.13],[0,0,1],[-.13,0,.13],[-1,0,0],[-.13,0,-.13]];
 for(let i=0;i<8;i++)renderer.emissiveQuad([0,0,0],points[i],points[(i+1)%8],points[(i+1)%8],'#fff4bb');
 renderer.emissiveBox(0,1,0,.17,1,.17,'#ffffff');
}
function drawHumanoidSlash(e,hit){
 const s=e.slash;if(s?.kind==='blink'){if(!e.cowboy)drawHumanoidBlink(s);return;}if(s?.guns){drawHumanoidGun(e,hit);return;}if(!s?.hand||(s.age>=s.windup+s.strike))return;
 const q=s.hand.point,a=s.hand.angle,pitch=s.hand.pitch||0,c=Math.cos(a),sn=Math.sin(a),cp=Math.cos(pitch),sp=Math.sin(pitch);
 renderer.residentMesh('humanoid:sword',drawHumanoidSword,[c,-sn*sp,sn*cp,q[0],0,cp,sp,q[1],-sn,-c*sp,c*cp,q[2]],hit);
 if(s.charge){const t=(s.age-s.charge.flash)/s.charge.flashDuration;if(t>=0&&t<1){const size=32*Math.sin(Math.PI*t)**.5;renderer.residentMesh('humanoid:charge-star',drawHumanoidChargeStar,monsterPose(q[0]+sn*cp*76,q[1]+sp*76+3,q[2]+c*cp*76,0,size,1,size));}}
 const age=s.age-s.windup;if(age<=0||age>=s.strike)return;
 if(s.kind==='thrust'){if(age<.12){const q=s.hand.point;renderer.residentMesh('humanoid:thrust-streak',()=>renderer.emissiveBox(0,0,0,5,2,130,'#9be7e9'),monsterPose(q[0]+Math.sin(s.angle)*112,q[1],q[2]+Math.cos(s.angle)*112,s.angle));}return;}
 const at=(q,r)=>[q.point[0]+Math.sin(q.angle)*r,q.point[1]-2,q.point[2]+Math.cos(q.angle)*r];
 const triangle=(a,b,c)=>renderer.residentMesh('humanoid:slash-trail',()=>renderer.emissiveQuad([0,0,0],[1,0,0],[0,0,1],[0,0,1],'#7dc5d0'),[b[0]-a[0],0,c[0]-a[0],a[0],b[1]-a[1],1,c[1]-a[1],a[1],b[2]-a[2],0,c[2]-a[2],a[2]]);
 for(let i=1;i<s.trail.length;i++){const p=s.trail[i-1],q=s.trail[i],a=at(p,45),b=at(p,98),c=at(q,98),d=at(q,45);triangle(a,b,c);triangle(a,c,d);}

}
function updateHumanoidBoss(dt){
 const e=humanoidBoss;if(!e||e.hp<=0)return;
 const steps=Math.max(1,Math.ceil(dt*120)),h=dt/steps;
 for(let n=0;n<steps;n++){const coverX=e.x,coverY=e.y;try{for(const fx of e.skyEffects||[]){fx.age+=h;for(const drop of fx.drops)if(!drop.impacted&&fx.age>=drop.land){drop.impacted=true;if(typeof cowboyImpactEvent==='function')cowboyImpactEvent(e,fx,drop);}}e.skyEffects=(e.skyEffects||[]).filter(fx=>fx.age<2.1);if(state!=='combat')return;if(e.cowboy&&typeof updateCowboyAI==='function')updateCowboyAI(e,h);if(e.move)continue;if(e.slash){updateHumanoidSlash(e,h);continue;}if(e.dash){updateHumanoidDash(e,h);continue;}if(e.crimson&&humanoidWalking){updateCrimsonRoam(e,h);continue;}if(e.cowboy||!humanoidWalking){updateHumanoidStanding(e,h);continue;}e.standPlan=null;if(e.patrolOffset&&humanoidWalking){e.patrolOffset.x*=Math.exp(-h*.25);e.patrolOffset.y*=Math.exp(-h*.25);}const oldX=e.x,oldY=e.y,oldT=e.t,oldAngle=e.angle,m=humanoidMotion(e);e.speedRatio=Math.min(e.speedRatio,m.speed);e.speedRatio+=( (humanoidWalking?m.speed:0)-e.speedRatio)*(1-Math.exp(-h*5));if(humanoidWalking){e.t+=h*e.speedRatio;Object.assign(e,humanoidPatrolPosition(e,e.t));}const leanTarget=humanoidWalking?m.lean*Math.PI/180:0;updateHumanoidLean(e,leanTarget,h);
  const travel=humanoidFacingMode(e)==='travel',dx=travel?e.x-oldX:p.x-e.x,dz=travel?(e.y-oldY)*1.06:(p.y-e.y)*1.06;if(Math.hypot(dx,dz)>.001){const wanted=Math.atan2(dx,dz),delta=Math.atan2(Math.sin(wanted-e.angle),Math.cos(wanted-e.angle));e.angle+=Math.max(-h*(m.cycle?7:2.4),Math.min(h*(m.cycle?7:2.4),delta));}
  // On a sprint-to-walk turn, brake the body until the rear support foot
  // has recovered. Moving or rotating the hip past that contact would pull
  // the IK endpoint off the actual foot or collapse the pelvis to the floor.
  if(e.gait&&e.motion==='walk'){
   const targetT=e.t,targetAngle=e.angle,targetX=e.x,targetY=e.y;
   const safe=()=>e.gait.legs.every((leg,i)=>{const hip=humanoidLocal(e,i===0?-14:14,0,0);return Math.hypot(hip[0]-leg.foot[0],hip[2]-leg.foot[2])<=60;});
   if(!safe()){let lo=0,hi=1;for(let k=0;k<12;k++){const f=(lo+hi)/2;e.t=oldT+(targetT-oldT)*f;e.x=oldX+(targetX-oldX)*f;e.y=oldY+(targetY-oldY)*f;e.angle=oldAngle+(targetAngle-oldAngle)*f;if(safe())lo=f;else hi=f;}e.t=oldT+(targetT-oldT)*lo;const q=humanoidPatrolPosition(e,e.t);e.x=humanoidWalking?q.x:oldX;e.y=humanoidWalking?q.y:oldY;e.angle=oldAngle+(targetAngle-oldAngle)*lo;}
  }
  updateHumanoidGait(e,h,h?(e.x-oldX)/h:0,h?(e.y-oldY)*1.06/h:0);
 }finally{resolveEnemyCover(e,coverX,coverY);}}
 if(e.cowboy?.spider)updateCowboySpider(e,dt);
}
function drawHumanoidCore(){
 const r=renderer;
 r.box(0,92,0,49,29,29,'#c6d8db');r.box(0,109,0,54,7,31,'#577780');
 r.box(0,92,16,34,19,4,'#294751');r.emissiveBox(0,94,19,9,10,2,'#6ffff1');
 for(const side of [-1,1])r.box(side*18,91,16,5,16,3,'#f2ae69');
 r.box(0,116,0,14,8,14,'#344c59');
 r.markPhosphor(0,.08);
}
function drawHumanoidHead(){
 const r=renderer;
 r.box(0,12,0,31,25,26,'#d5e1df');
 r.box(0,13,14,26,9,3,'#203943');r.emissiveBox(0,14,16,20,3,1,'#65f9ed');
 r.box(0,26,0,24,4,23,'#577780');r.box(0,4,14,13,3,3,'#577780');
 r.markPhosphor(0,.08);
}
function humanoidJoint(q,hit){renderer.residentMesh('humanoid:joint',()=>renderer.sphere(0,0,0,6,'#f2ae69',1,1,1,4,8),monsterPose(...q),hit);}
function humanoidRestHand(e,side,swing){
 const q=humanoidUpperPoint(e,side*37,83+Math.sin(e.t*3+side)*2,9+swing),s=e.slash;
 if(!s?.supportHand)return q;const t=Math.max(0,Math.min(1,(s.age-s.windup)/.1)),u=t*t*(3-2*t);return s.supportHand.map((v,i)=>v+(q[i]-v)*u);
}
function drawHumanoidBoss(e){
 if(!e.cowboy){drawHumanoidBossModel(e);return;}
 const prior=renderer.residentTransform;renderer.residentTransform=pose=>cowboyScaledPose(e,pose);
 try{if(e.cowboy.mech)drawMechanicalSpiderBoss(e);else drawHumanoidBossModel(e);}finally{renderer.residentTransform=prior;}
 for(const fx of e.skyEffects||[])drawHumanoidSky(fx);if(e.slash?.kind==='blink')drawHumanoidBlink(e.slash);
}
function drawHumanoidBossModel(e){
 const r=renderer;if(!e.gait)updateHumanoidGait(e,0);const lift=humanoidBodyLift(e),x=e.x-325,z=(e.y-300)*1.06,hit=enemyHitFeedback(e);
 r.residentMesh('humanoid:shadow',()=>r.disc(0,0,0,32,'#394c46'),monsterPose(x,2.5,z));
 if(!e.cowboy?.spider)r.residentMesh('humanoid:pelvis',()=>{r.box(0,61,0,36,15,23,'#344c59');r.box(0,74,0,24,13,20,'#526a78');r.markPhosphor(0,.08);},humanoidUpperPose(e,e.angle,e.slash?.lowerLean??e.lean,false),hit);
 r.residentMesh('humanoid:core',drawHumanoidCore,humanoidUpperPose(e),hit);
 const neck=humanoidUpperPoint(e,0,120,0),head=humanoidHeadAnchor(e);
 if(Math.hypot(...head.map((v,i)=>v-neck[i]))>.01)monsterStrut(neck,head,9,'#344c59',hit);
 r.residentMesh('humanoid:neck-joint',()=>r.sphere(0,0,0,6,'#577780',1,1,1,4,8),monsterPose(...head),hit);
 r.residentMesh('humanoid:head',drawHumanoidHead,humanoidHeadPose(e),hit);
 if(e.cowboy?.spider)drawCowboySpider(e,hit);else for(let i=0;i<2;i++){const leg=humanoidLegPose(e,i),contact=e.gait.legs[i];monsterStrut(leg.hip,leg.knee,12,'#89adb7',hit);monsterStrut(leg.knee,leg.foot,10,'#d0dddb',hit);humanoidJoint(leg.hip,hit);humanoidJoint(leg.knee,hit);
  r.residentMesh('humanoid:foot',()=>{r.box(0,0,3,16,8,27,'#344c59');r.box(0,4,6,13,3,17,'#c6d8db');r.emissiveBox(0,0,17,11,2,1,'#65f9ed');},monsterPose(...contact.foot,contact.angle),hit);
 }
 // Detached fists: deliberately no shoulder, upper arm, or forearm geometry.
 for(const side of [-1,1]){const swing=humanoidMotion(e).cycle?Math.sin((e.gait.runPhase||0)*TAU)*side*12:0,q=e.slash?.kind==='blink'&&side===1?e.slash.leftHand:e.slash?.guns?e.slash.guns.find(g=>g.side===side)?.hand.point||humanoidRestHand(e,side,swing):e.slash&&side===e.slash.handSide?e.slash.hand.point:humanoidRestHand(e,side,swing);r.residentMesh('humanoid:hand',()=>{r.box(0,0,0,16,19,17,'#c6d8db');r.box(0,-4,9,14,8,4,'#577780');r.emissiveBox(0,4,9,10,3,1,'#65f9ed');},monsterPose(...q,e.slash?.guns?.find(g=>g.side===side)?.hand.angle??(e.slash&&side===e.slash.handSide?e.slash.hand.angle:e.angle)),hit);}
 if(e.slash)drawHumanoidSlash(e,hit);if(!e.cowboy)for(const fx of e.skyEffects||[])drawHumanoidSky(fx);if(e.cowboy&&typeof drawCowboyCostume==='function')drawCowboyCostume(e);
 const label=e.cowboy?cowboyScaledPoint(e,head):head;drawMonsterHealthBar(label[0],label[1]+(e.cowboy?29:40),label[2],e.hp,e.max,8,80,5,'#9ae9df',e);drawPlaneVulnerability(e,x,z);
}
function humanoidChargeLabel(s){return s.age<s.charge.raise?'举剑':s.age<s.charge.flash?'定势蓄力':s.age<s.charge.release?'星光闪烁':'蓄力结束';}
function humanoidTestHud(){if(!humanoidBoss||!humanoidTest)return;$('zone').textContent='人形 BOSS 测试场';$('status').textContent=humanoidBoss.slash?(humanoidBoss.slash.guns?(humanoidBoss.slash.kind==='skyshoot'?'朝天双枪 · 陨弹散射':humanoidBoss.slash.kind==='strafe'?'横移交替连射':humanoidBoss.slash.kind==='spinshoot'?'旋转全向弹幕':humanoidBoss.slash.kind==='dualshoot'?'左右双枪 · 牛仔连射':'右手开枪'):humanoidBoss.slash.kind==='blink'?'芭蕾旋身 · 闪现':humanoidBoss.slash.kind==='thrust'?'醉剑突刺 · 后抽再前扑':humanoidBoss.slash.kind==='charged'?'蓄力横斩':(humanoidBoss.slash.direction===1?'右手 · 右→左横斩':'右手 · 左→右横斩')+(humanoidBoss.slash.queuedDirection?' · 已接续下一刀':'')):!humanoidWalking?'原地站定':humanoidMotion(humanoidBoss).name+' · '+(humanoidFacingMode(humanoidBoss)==='travel'?'沿行进方向走':'面向玩家');$('wave').textContent='上身前倾 '+Math.round((humanoidBoss.lean||0)*180/Math.PI)+'° · '+(humanoidBoss.slash?(humanoidBoss.slash.guns?(humanoidBoss.slash.age<humanoidBoss.slash.windup?'抬枪瞄准':humanoidBoss.slash.age<humanoidBoss.slash.windup+humanoidBoss.slash.strike?'开火后坐':'收枪'):humanoidBoss.slash.age<humanoidBoss.slash.windup?(humanoidBoss.slash.kind==='thrust'?(humanoidBoss.slash.age<humanoidBoss.slash.prep?'快速后抽':'定势顿帧'):humanoidBoss.slash.charge?humanoidChargeLabel(humanoidBoss.slash):'压低引刀'):humanoidBoss.slash.age<humanoidBoss.slash.windup+humanoidBoss.slash.strike?(humanoidBoss.slash.kind==='thrust'?'前扑长刺':'横向斩出'):'收势') :humanoidWalking?(humanoidBoss.dash?(humanoidBoss.dash.age<humanoidBoss.dash.prep?'压低蓄势':humanoidBoss.dash.age<humanoidBoss.dash.prep+humanoidBoss.dash.duration?'蹬地滑冲':'落地收势'):humanoidMotion(humanoidBoss).cycle?'沿运动方向 · 腾空步态':'朝向切换 '+Math.ceil((humanoidBoss.t%10<6?6:10)-humanoidBoss.t%10)+' 秒'):'站定');if(humanoidBoss.slash?.kind==='blink')$('wave').textContent=humanoidBoss.slash.age<.26?'单脚定势':humanoidBoss.slash.age<.6?'旋身闪现':'落脚收势';if(humanoidBoss.slash?.kind==='skyshoot')$('wave').textContent=humanoidBoss.slash.age<.24?'双枪朝天':humanoidBoss.slash.age<1.05?'陨弹下落':'落地环形弹幕';if(humanoidBoss.cowboy&&typeof cowboyHud==='function')cowboyHud(humanoidBoss);const bar=$('humanoid-health');bar.textContent=(humanoidBoss.cowboy?'霓虹守卫 ':'机器人 ')+Math.ceil(Math.max(0,humanoidBoss.hp))+' / '+humanoidBoss.max;bar.style.setProperty('--snake-hp',Math.max(0,humanoidBoss.hp)/humanoidBoss.max*100+'%');}
function finishHumanoidTest(won){if(!humanoidTest)return;state=won?'menu':'dead';cleared=won;paused=false;releaseJoy();bullets=[];shots=[];missiles=[];showOverlay('<div class="tag">HUMANOID LAB</div><h2>'+(won?'机器人已击败':'测试结束')+'</h2><p>双腿 IK · 悬浮双手 · 面向玩家</p><button class="primary" id="humanoid-again">重新测试</button><a href="index.html">返回普通游戏</a>');if(humanoidBoss?.cowboy){$('overlay').innerHTML='<div class="tag">NEON GUARD</div><h2>'+(won?'机械蜘蛛已击败':'挑战失败')+'</h2><button class="primary" id="humanoid-again">重新挑战</button><a href="humanoid.html">动作测试场</a>';humanoidBoss.skyEffects=[];$('humanoid-again').onclick=startCowboyTest;}else $('humanoid-again').onclick=startHumanoidTest;}
function startHumanoidTest(){
 reset();humanoidTest=true;testMode=true;state='combat';phase=0;scroll=0;floor=1;cleared=false;paused=false;humanoidWalking=true;
 $('viewport').classList.remove('falling','landing','boss-intro','paused');clearTimeout(toast.timer);$('toast').classList.remove('show');$('toast').textContent='';
 tiles=[];syncGrid();for(let y=grid.minY;y<=grid.maxY;y++)for(let x=grid.minX;x<=grid.maxX;x++)tiles.push({x,y,healProgress:0,healFlash:0,medPack:false});
 p.x=325;p.y=435;p.hp=p.max=8;p.inv=2;spawnQueue=[];chaserSpawned=999;spawnTimer=999;weapon=createWeapon('rifle');shootTimer=1.5;
 humanoidBoss={type:'humanoid',...humanoidPatrolPose(0),hp:420,max:420,r:27,t:0,seed:0,angle:0,motion:'walk',speedRatio:1,lean:0,hitAt:-Infinity,gait:null};enemies.push(humanoidBoss);updateHumanoidGait(humanoidBoss,0);
 renderer.sceneKey=null;renderer.sceneData=null;$('overlay').style.display='none';$('test-open').textContent='测试装备';$('humanoid-tools').hidden=false;
 $('humanoid-restart').onclick=startHumanoidTest;$('humanoid-walk').textContent='停止行走';$('humanoid-walk').onclick=toggleHumanoidWalking;
 $('humanoid-skyshoot').onclick=()=>startHumanoidSlash(humanoidBoss,'skyshoot');
 $('humanoid-blink').onclick=()=>startHumanoidSlash(humanoidBoss,'blink');
 $('humanoid-strafe').onclick=()=>startHumanoidSlash(humanoidBoss,'strafe');
 $('humanoid-spinshoot').onclick=()=>startHumanoidSlash(humanoidBoss,'spinshoot');
 $('humanoid-dualshoot').onclick=()=>startHumanoidSlash(humanoidBoss,'dualshoot');
 $('humanoid-shoot').onclick=()=>startHumanoidSlash(humanoidBoss,'shoot');
 $('humanoid-thrust').onclick=()=>startHumanoidSlash(humanoidBoss,'thrust');
 $('humanoid-slash').onclick=()=>startHumanoidSlash();
 $('humanoid-slash-back').onclick=()=>startHumanoidSlash(humanoidBoss,'slash',-1);
 $('humanoid-combo').onclick=()=>{startHumanoidSlash();if(humanoidBoss.slash&&!['thrust','shoot','dualshoot','strafe','spinshoot','skyshoot','blink'].includes(humanoidBoss.slash.kind))humanoidBoss.slash.queuedDirection=-humanoidBoss.slash.direction;};
 $('humanoid-charged').onclick=()=>startHumanoidSlash(humanoidBoss,'charged');
 for(const mode of ['walk','run','dash'])$('humanoid-mode-'+mode).onclick=()=>setHumanoidMotion(mode);
 updateUI();humanoidTestHud();draw();syncMusic();
}

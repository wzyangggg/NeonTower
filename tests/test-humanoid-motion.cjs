const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/humanoid.js','utf8'),sandbox);
vm.runInContext(`
function check(v,m){if(!v)throw Error(m)}
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
$('humanoid-health').style.setProperty=()=>{};
for(const mode of ['run']){
 startHumanoidTest();sound=false;shootTimer=999;setHumanoidMotion(mode);const e=humanoidBoss,m=humanoidMotion(e);let flight=0,steps=0,maxReach=0,minHeight=Infinity,maxSpeed=0,maxKnee=0,minKnee=180;
 for(let f=0;f<7200;f++){
  const old=[e.x,e.y],prior=e.gait.legs.map(l=>({foot:[...l.foot],swing:!!l.swing}));updateHumanoidBoss(1/120);
  if(e.gait.legs.every(l=>l.swing))flight++;
  minHeight=Math.min(minHeight,e.gait.height);maxSpeed=Math.max(maxSpeed,Math.hypot(e.x-old[0],(e.y-old[1])*1.06)*120);
  check(e.x>A.x+65&&e.x<A.x+A.w-65&&e.y>A.y+65&&e.y<A.y+A.h-65,'fast patrol stays in arena');
  for(let i=0;i<2;i++){const leg=e.gait.legs[i],pose=humanoidLegPose(e,i);maxReach=Math.max(maxReach,distance(pose.hip,leg.foot));const angle=Math.acos(Math.max(-1,Math.min(1,(34**2+36**2-distance(pose.hip,pose.foot)**2)/(2*34*36))))*180/Math.PI;maxKnee=Math.max(maxKnee,angle);minKnee=Math.min(minKnee,angle);check(distance(pose.foot,leg.foot)<1e-6,'fast IK reaches foot '+mode+' '+f+' '+maxReach);check(Math.abs(distance(pose.hip,pose.knee)-34)<1e-6&&Math.abs(distance(pose.knee,pose.foot)-36)<1e-6,'constant bone lengths');check(leg.foot[1]>=4-1e-6,'feet above floor');if(!prior[i].swing&&!leg.swing)check(distance(prior[i].foot,leg.foot)<1e-8,'support foot stationary');if(!prior[i].swing&&leg.swing)steps++;}
  for(let i=0;i<2;i++)check(distance(humanoidUpperPoint(e,i===0?-14:14,58,0),humanoidLegPose(e,i).hip)<1e-8,'tilted waist remains connected to IK hips');
  const headPose=humanoidHeadPose(e),anchor=humanoidHeadAnchor(e);check(headPose[5]===1&&headPose[6]===0&&headPose[4]===0,'head upright and gaze horizontal while torso pitches');check(Math.abs(headPose[2]-Math.sin(e.angle))<1e-8&&Math.abs(headPose[10]-Math.cos(e.angle))<1e-8,'head faces same travel direction');check(distance([headPose[3],headPose[7],headPose[11]],anchor)<1e-8&&distance(anchor,humanoidUpperPoint(e,0,120,0))<9,'articulated head attached within short neck reach');
  const matrix=humanoidUpperPose(e);check(matrix.every(Number.isFinite),'finite torso transform');
  if(f>240)check(Math.abs(Math.acos(matrix[5])*180/Math.PI-m.lean)<.01,'specified lean from up axis');
  if(f%30===0){renderer.begin();drawHumanoidBoss(e);check(renderer.residentSnapshot().every(Number.isFinite),'finite tilted GPU mesh');}
 }
 check(maxKnee>(mode==='dash'?155:140)&&minKnee<60,'rear leg extends while recovery knee folds');
 check(flight>100&&steps>150,'running has recurring flight and rapid alternating steps');check(maxSpeed>m.speed*50,'speed actually increases');check(minHeight<m.height+1&&minHeight>15,'lowered viable pelvis');
 const size=renderer.residentMeshes.size;setHumanoidMotion('walk');for(let f=0;f<360;f++)updateHumanoidBoss(1/120);setHumanoidMotion(mode);for(let f=0;f<360;f++)updateHumanoidBoss(1/120);renderer.begin();drawHumanoidBoss(e);check(renderer.residentMeshes.size===size,'modes only change instance poses');
 humanoidWalking=false;const x=e.x,y=e.y;for(let f=0;f<480;f++)updateHumanoidBoss(1/120);check(e.x===x&&e.y===y&&Math.abs(e.lean-6*Math.PI/180)<.001,'stop returns to ready stance without displacement');
 console.log(mode,{flight,steps,maxReach,minHeight,maxSpeed,minKnee,maxKnee});
}
// Frequent transitions preserve reach, contacts and no teleporting body.
startHumanoidTest();sound=false;
for(let f=0;f<7200;f++){if(f%120===0)setHumanoidMotion(['walk','run','run'][Math.floor(f/120)%3]);const e=humanoidBoss,x=e.x,y=e.y;updateHumanoidBoss(1/120);check(Math.hypot(e.x-x,e.y-y)<3,'mode switch has bounded displacement');for(let i=0;i<2;i++){const pose=humanoidLegPose(e,i);check(distance(pose.foot,e.gait.legs[i].foot)<1e-6,'switching IK contact remains exact '+f+' '+e.motion+' '+distance(pose.hip,e.gait.legs[i].foot)+' height '+e.gait.height);}}
// Lean reaches the exact target in 0.1 seconds at different frame rates.
for(const hz of [30,60,120])for(const mode of ['run','dash']){
 startHumanoidTest();sound=false;setHumanoidMotion(mode);const e=humanoidBoss;
 for(let f=0;f<hz/10;f++)updateHumanoidBoss(1/hz);
 check(Math.abs(e.lean-HUMANOID_MOTIONS[mode].lean*Math.PI/180)<1e-10,'0.1s exact lean '+mode+' '+hz);
 if(mode==='dash')check(e.dash&&e.dash.prep===0,'dash has no windup');
}
startHumanoidTest();sound=false;setHumanoidMotion('run');updateHumanoidBoss(.05);const partial=humanoidBoss.lean;
check(partial>0&&partial<50*Math.PI/180,'continuous midpoint lean');setHumanoidMotion('dash');check(Math.abs(humanoidBoss.lean-75*Math.PI/180)<1e-10,'dash immediately hard-cuts interrupted lean');updateHumanoidBoss(.1);check(Math.abs(humanoidBoss.lean-75*Math.PI/180)<1e-10,'interrupted lean reaches dash in 0.1s');
// A dash is one locked straight displacement, with no alternating run cycle.
for(const base of ['walk','run'])for(const angle of [0,Math.PI/2,Math.PI,-Math.PI/2]){
 startHumanoidTest();sound=false;setHumanoidMotion(base);updateHumanoidBoss(.8);const e=humanoidBoss;e.angle=angle;setHumanoidMotion('dash');const d=e.dash,origin=[e.x,e.y],expected=[d.x+d.dx*d.distance,d.y+d.dy*d.distance],phase=e.gait.runPhase||0;
 check(d&&e.motion==='dash'&&d.distance<=160,'one bounded dash starts');setHumanoidMotion('dash');check(e.dash===d,'button cannot restart active burst');
 let moved=false,pushed=false,glided=false,maxSpeed=0;
 for(let i=0;i<52;i++){const x=e.x,y=e.y,feet=e.gait.legs.map(l=>[...l.foot]);updateHumanoidBoss(1/120);maxSpeed=Math.max(maxSpeed,Math.hypot(e.x-x,(e.y-y)*1.06)*120);
  if(i===0&&d.distance>0)check(distance([e.x,(e.y-origin[1])*1.06],[origin[0],0])>d.distance*.04,'first simulation frame moves at full launch speed');
  if(e.dash&&d.age>=d.prep&&d.age<d.prep+d.duration){moved=true;check(Math.abs(e.lean*180/Math.PI-75)<1e-6,'burst uses 75 degree lean');if(d.age/d.duration<.08){check(distance(e.gait.legs[1].foot,d.ready[1])<1e-8,'rear foot anchored during push');pushed=true;}if((d.age-d.prep)/d.duration>.5){glided=true;check(e.gait.legs.every(l=>l.swing),'both legs recover in glide without cycling');}}
  check(e.x>=A.x+75-1e-6&&e.x<=A.x+A.w-75+1e-6&&e.y>=A.y+75-1e-6&&e.y<=A.y+A.h-75+1e-6,'dash clips at arena');
  for(let j=0;j<2;j++){const ik=humanoidLegPose(e,j);check(distance(ik.foot,e.gait.legs[j].foot)<1e-6,'dash exact foot reach');check(ik.knee.every(Number.isFinite),'dash finite knees');}
  check(humanoidHeadPose(e)[6]===0,'head stays looking forward during burst');renderer.begin();drawHumanoidBoss(e);check(renderer.residentSnapshot().every(Number.isFinite),'finite dash resident model');
 }
 check(!e.dash&&e.motion===base&&distance([e.x,e.y],expected)<1e-6,'one dash ends at endpoint and returns to previous gait');check((e.gait.runPhase||0)===phase,'no high speed running phase during dash');check(moved&&pushed&&glided&&maxSpeed>d.distance*5,'distinct push and fast sliding displacement');
 for(let i=0;i<360;i++){const x=e.x,y=e.y;updateHumanoidBoss(1/120);check(Math.hypot(e.x-x,e.y-y)<3,'patrol resumes without snapping back');for(let j=0;j<2;j++)check(distance(humanoidLegPose(e,j).foot,e.gait.legs[j].foot)<1e-6,'post-dash exact IK '+base+' '+angle+' '+i+' '+distance(humanoidLegPose(e,j).hip,e.gait.legs[j].foot));}
}
startHumanoidTest();sound=false;
for(let round=0;round<30;round++){const e=humanoidBoss;e.angle=round*Math.PI*.73;setHumanoidMotion('dash');for(let f=0;f<52;f++){updateHumanoidBoss(1/120);for(let j=0;j<2;j++)check(distance(humanoidLegPose(e,j).foot,e.gait.legs[j].foot)<1e-6,'repeated burst contact reach');}check(!e.dash,'repeated burst terminates');updateHumanoidBoss(.1);}
console.log('Running and one-shot dash lean, lowered pelvis, real flight, grounded stance, speed, bounded transitions and shared meshes passed');
`,sandbox);

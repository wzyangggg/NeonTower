const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/humanoid.js','utf8'),sandbox);
vm.runInContext(`
function check(v,m){if(!v)throw Error(m)}
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
$('humanoid-health').style.setProperty=()=>{};
for(const mode of ['walk','run'])for(const angle of [0,Math.PI/2,Math.PI,-Math.PI/2]){
 startHumanoidTest();sound=false;shootTimer=999;setHumanoidMotion(mode);updateHumanoidBoss(.8);const e=humanoidBoss;e.angle=angle;
 renderer.begin();drawHumanoidBoss(e);check(!renderer.residentMeshes.get('humanoid:sword')?.count,'no idle sword');
 startHumanoidSlash();const s=e.slash;check(s&&s.returnMotion===mode,'slash starts');startHumanoidSlash();check(e.slash===s,'cannot restart active slash');startHumanoidDash(e);check(!e.dash,'action guard');
 let upperTurn=false,folded=false,minWrist=Infinity,maxWrist=-Infinity,firstBlade=0,lastBlade=0;let priorTwist=0;
 for(let f=0;f<94;f++){updateHumanoidBoss(1/120);renderer.begin();drawHumanoidBoss(e);check(renderer.residentSnapshot().every(Number.isFinite),'finite meshes');
  check(e.x===s.x&&e.y===s.y&&e.angle===s.angle,'waist position and facing fixed through slash');
  for(let i=0;i<2;i++){const ik=humanoidLegPose(e,i);check(distance(ik.foot,e.gait.legs[i].foot)<1e-6,'leg exact contact');}
  if(e.slash){check(Math.abs(distance(s.arm.hip,s.arm.knee)-30)<1e-6&&Math.abs(distance(s.arm.knee,s.arm.foot)-36)<1e-6,'two arm bone lengths');folded||=distance(s.arm.hip,s.arm.foot)<62;upperTurn||=Math.abs(s.chestTwist)>.5;check(Math.abs(s.chestTwist)<=1.2+1e-8,'limited upper twist');check(renderer.residentMeshes.get('humanoid:sword').count===(s.age<s.windup+s.strike?1:0),'sword disappears as soon as stroke ends');if(s.age>=s.windup+s.strike){check(renderer.residentMeshes.get('humanoid:slash-trail').count===0,'no blade return trail');check(Math.abs(s.hand.angle-(s.angle-s.handSide*2.6))<1e-8,'blade orientation stays at far endpoint');}
   if(s.age<s.windup)firstBlade=s.hand.angle;if(s.age>=s.windup&&s.age<s.windup+s.strike){lastBlade=s.hand.angle;const wrist=s.hand.angle-s.hand.pathAngle;minWrist=Math.min(minWrist,wrist);maxWrist=Math.max(maxWrist,wrist);check(s.trail.length<=80,'actual blade trail bounded');}
   if(s.age>=s.windup)for(let i=0;i<2;i++)check(distance(e.gait.legs[i].foot,s.stance[i])<1e-8,'support feet fixed');
   if(s.age>s.windup+s.strike+s.recover-.03)check(Math.abs(s.chestTwist)<.02,'upper body returns before model hides');priorTwist=s.chestTwist;
  }
 }
 check(Math.abs(firstBlade-s.angle)>2.5&&Math.abs(lastBlade-s.angle)>2.5&&Math.abs(lastBlade-firstBlade)>5,'expanded start/end and >286 degree sword sweep');
 check(minWrist<-.5&&maxWrist>.5&&maxWrist-minWrist>1.5,'blade rotates relative to moving grip instead of rigid translation');
 check(!e.slash&&e.motion===mode&&upperTurn&&folded,'upper-only strike with bent virtual elbow and recovery');check(Math.abs(priorTwist)<.02,'no yaw jump on finish');
 renderer.begin();drawHumanoidBoss(e);check(!renderer.residentMeshes.get('humanoid:sword').count&&!renderer.residentMeshes.get('humanoid:slash-trail').count,'weapon hides on finish');
 const count=renderer.residentMeshes.size;startHumanoidSlash();for(let f=0;f<94;f++){updateHumanoidBoss(1/120);renderer.begin();drawHumanoidBoss(e);}check(renderer.residentMeshes.size===count,'shared meshes');
}
// Different hand positions affect chest orientation while root remains fixed.
function response(offset){startHumanoidTest();sound=false;startHumanoidSlash();updateHumanoidBoss(.16);const e=humanoidBoss;e.slash.hand.point[0]+=offset;for(let i=0;i<8;i++)solveHumanoidHandPull(e,1/120,1);return {x:e.x,y:e.y,yaw:e.slash.chestTwist};}
const a=response(0),b=response(40);check(a.x===b.x&&a.y===b.y&&Math.abs(a.yaw-b.yaw)>.01,'upper solver responds to hand without pulling waist');
startHumanoidTest();startHumanoidSlash();startHumanoidTest();check(!humanoidBoss.slash,'replay clears action');
console.log('Upper-only slash: fixed waist/support, two-bone virtual arm, bounded chest yaw, explicit recovery, transient/shared meshes and hand constraint passed');
`,sandbox);

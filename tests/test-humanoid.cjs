const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/humanoid.js','utf8'),sandbox);
vm.runInContext(`
function check(v,m){if(!v)throw Error(m)}
const dist=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
$('humanoid-health').style.setProperty=()=>{};startHumanoidTest();sound=false;shootTimer=999;
check(humanoidTest&&testMode&&state==='combat'&&tiles.length===143&&!spawnQueue.length&&!turrets.length,'isolated complete arena');
check(combatTargets().includes(humanoidBoss),'robot is attackable');
let lifted=false,stepped=new Set(),maxReach=0,minKnee=180,maxKnee=0,strides=[];const initial={x:humanoidBoss.x,y:humanoidBoss.y};
for(let frame=0;frame<7200;frame++){
 const e=humanoidBoss,previous=e.gait.legs.map(l=>({foot:[...l.foot],swing:!!l.swing}));
 if(frame%600===0){p.x=frame%1200===0?120:540;p.y=frame%1800===0?150:500;}
 updateHumanoidBoss(1/60);
 check(e.x>A.x+65&&e.x<A.x+A.w-65&&e.y>A.y+65&&e.y<A.y+A.h-65,'patrol within arena');
 check(e.gait.legs.filter(l=>l.swing).length<=1,'at least one support foot');
 for(let i=0;i<2;i++){const leg=e.gait.legs[i],pose=humanoidLegPose(e,i);check(Math.abs(dist(pose.hip,pose.knee)-34)<1e-6&&Math.abs(dist(pose.knee,pose.foot)-36)<1e-6,'exact IK bone lengths');maxReach=Math.max(maxReach,dist(pose.hip,leg.foot));const knee=Math.acos(Math.max(-1,Math.min(1,(34*34+36*36-dist(pose.hip,pose.foot)**2)/(2*34*36))))*180/Math.PI;minKnee=Math.min(minKnee,knee);maxKnee=Math.max(maxKnee,knee);if(!previous[i].swing&&leg.swing)strides.push(Math.hypot(leg.swing.to[0]-leg.swing.from[0],leg.swing.to[2]-leg.swing.from[2]));check(dist(pose.foot,leg.foot)<1e-6,'IK reaches real contact without sliding');check([...pose.knee,...leg.foot].every(Number.isFinite),'finite IK');if(leg.foot[1]>5)lifted=true;if(leg.swing)stepped.add(i);if(!previous[i].swing&&!leg.swing)check(dist(previous[i].foot,leg.foot)<1e-8,'planted world foot stationary');}
}
check(lifted&&stepped.size===2&&Math.hypot(humanoidBoss.x-initial.x,humanoidBoss.y-initial.y)>30,'both legs step while patrolling');
check(strides.reduce((a,b)=>a+b,0)/strides.length>36,'longer useful stride instead of shuffling');
check(maxKnee>155&&minKnee<100&&maxKnee-minKnee>70,'support extends and swing visibly flexes');
startHumanoidTest();sound=false;shootTimer=999;
check(humanoidFacingMode(humanoidBoss)==='player','starts facing player');
updateHumanoidBoss(8.5);const q=humanoidPatrolPose(humanoidBoss.t),prior=humanoidPatrolPose(humanoidBoss.t-.001),travelAngle=Math.atan2(q.x-prior.x,(q.y-prior.y)*1.06);
check(humanoidFacingMode(humanoidBoss)==='travel','occasionally faces travel');
check(Math.abs(Math.atan2(Math.sin(humanoidBoss.angle-travelAngle),Math.cos(humanoidBoss.angle-travelAngle)))<.04,'front aligns with travel direction');
const beforeAngle=humanoidBoss.angle;updateHumanoidBoss(1/120);check(Math.abs(humanoidBoss.angle-beforeAngle)<=2.4/120+1e-8,'turn rate bounded');
updateHumanoidBoss(1.5);check(humanoidFacingMode(humanoidBoss)==='player','cycles back to player facing');
humanoidWalking=false;const frozen=[humanoidBoss.x,humanoidBoss.y,humanoidBoss.angle];p.x=humanoidBoss.x+120;p.y=humanoidBoss.y;
for(let i=0;i<300;i++)updateHumanoidBoss(1/60);
check(humanoidBoss.x===frozen[0]&&humanoidBoss.y===frozen[1],'stop button freezes translation');
check(humanoidBoss.angle===frozen[2],'standing keeps facing fixed');
renderer.begin();drawHumanoidBoss(humanoidBoss);const cache=renderer.residentMeshes.size;check(renderer.residentSnapshot().every(Number.isFinite),'finite resident mesh');
for(let i=0;i<120;i++){updateHumanoidBoss(1/60);renderer.begin();drawHumanoidBoss(humanoidBoss);}check(renderer.residentMeshes.size===cache,'animation reuses resident geometry');
const core=renderer.residentMeshes.get('humanoid:core');renderer.initializeGPU();renderer.begin();drawHumanoidBoss(humanoidBoss);check(renderer.residentMeshes.get('humanoid:core')===core,'context recovery retains shared mesh');
startHumanoidTest();sound=false;shootTimer=999;const e=humanoidBoss;shots=[{x:e.x,y:e.y,vx:0,vy:0,r:3,life:1,damage:500,critChance:0,pierce:1}];step(.001);check(state==='bossDying','lethal damage starts finale');step(3);check(state==='menu'&&cleared&&!enemies.length,'actual damage wins test');$('humanoid-again').onclick();check(humanoidBoss!==e&&humanoidBoss.hp===420&&state==='combat','clean replay');sound=false;p.hp=1;p.inv=0;hurt();check(state==='dead'&&humanoidTest,'death stays in lab');reset();check(!humanoidTest&&!humanoidBoss,'normal reset clears robot');
console.log('Humanoid patrol, player facing, planted contacts, exact IK reach, alternating steps, resident meshes, damage and restart passed; max reach',maxReach,'knee range',minKnee,maxKnee,'mean stride',strides.reduce((a,b)=>a+b,0)/strides.length);
`,sandbox);

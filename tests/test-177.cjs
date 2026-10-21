const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/virus.js','utf8'),sandbox);
vm.runInContext(`
function check(v,m){if(!v)throw Error(m)}
$('virus-health').style.setProperty=()=>{};
startVirusTest();sound=false;virusGod=true;shootTimer=999;
check(virusTest&&testMode&&state==='combat'&&tiles.length===143&&!turrets.length&&!spawnQueue.length,'isolated fixed arena');
check(combatTargets().length===1&&combatTargets()[0]===virusBoss,'normal attack target');
const initial=virusBoss.gait.legs.map(l=>[...l.foot]);updateVirusBoss(.001);
check(virusBoss.gait.legs.every((l,i)=>l.foot.every((v,j)=>v===initial[i][j])),'planted feet stay in world coordinates');
const gaitProbe={x:325,y:250,gait:null};updateVirusGait(gaitProbe,0);const resting=gaitProbe.gait.legs.map(l=>[...l.foot]);
for(let i=0;i<6;i++){gaitProbe.x+=1;updateVirusGait(gaitProbe,1/30);}
check(gaitProbe.gait.legs.every((l,i)=>!l.swing&&l.foot.every((v,j)=>v===resting[i][j])),'small six-unit movement at low speed keeps feet planted');
let starts=0,totalStride=0;
for(let i=0;i<180;i++){const before=gaitProbe.gait.legs.map(l=>!!l.swing);gaitProbe.x+=90/60;updateVirusGait(gaitProbe,1/60);gaitProbe.gait.legs.forEach((leg,j)=>{if(leg.swing&&!before[j]){starts++;totalStride+=Math.hypot(leg.swing.to[0]-leg.swing.from[0],leg.swing.to[2]-leg.swing.from[2]);}});}
check(starts>=15&&starts<=75&&totalStride/starts>18,'staggered strides retain meaningful travel at faster movement');
startVirusTest();sound=false;virusGod=true;shootTimer=999;const startX=virusBoss.x;updateVirusBoss(1);
check(virusBoss.x-startX>85,'patrol moves substantially faster during first second');
let lifted=false,stepped=new Set();
for(let i=0;i<3600;i++){const priorFeet=virusBoss.gait.legs.map(l=>({foot:[...l.foot],swing:!!l.swing}));updateVirusBoss(1/60);const e=virusBoss;check(e.x>=A.x+75&&e.x<=A.x+A.w-75&&e.y>=A.y+75&&e.y<=A.y+A.h-75,'body within arena');const swinging=e.gait.legs.map((l,i)=>l.swing?i:-1).filter(i=>i>=0);check(swinging.length<=3,'at least three legs remain planted');for(const j of swinging)stepped.add(j);for(const l of e.gait.legs){check(l.foot.every(Number.isFinite),'finite foot');if(l.foot[1]>4)lifted=true;const index=e.gait.legs.indexOf(l),ik=virusLegPose(e,index,27),a=index*TAU/6+Math.PI/6,x=e.x-325,z=(e.y-300)*1.06;
check((l.foot[0]-x)*Math.cos(a)+(l.foot[2]-z)*Math.sin(a)>20,'foot stays outside baseplate in its own outward sector');
check((ik.knee[0]-x)*Math.cos(a)+(ik.knee[2]-z)*Math.sin(a)>24,'knee stays outside body');
const yaw=Math.atan2(ik.knee[2]-z,ik.knee[0]-x)-a;check(Math.abs(Math.atan2(Math.sin(yaw),Math.cos(yaw)))<Math.PI/6,'knee avoids large horizontal rotations');
if(!priorFeet[index].swing&&!l.swing)check(l.foot.every((v,j)=>v===priorFeet[index].foot[j]),'stance contacts do not slide');
check(Math.hypot(...ik.foot.map((v,j)=>v-l.foot[j]))<1e-6,'rendered foot uses actual gait contact without radial clamp');
check([ik.hip,ik.knee,ik.foot].every(v=>Math.hypot(v[0]-(e.x-325),v[2]-(e.y-300)*1.06)<=51),'compact visible leg footprint');check(Math.abs(Math.hypot(...ik.knee.map((v,j)=>v-ik.hip[j]))-23)<1e-6,'upper IK length');check(Math.abs(Math.hypot(...ik.knee.map((v,j)=>v-ik.foot[j]))-31)<1e-6,'lower IK length');}bullets=[];}
check(lifted&&stepped.size===6,'all six legs lift independently');
for(const [pattern,count,speed] of [[0,10,157.5],[1,10,177],[2,10,217.5]]){virusBoss.pattern=pattern;bullets=[];fireVirusPattern(virusBoss);check(bullets.length===count,'pattern density');check(bullets.every(b=>Math.abs(Math.hypot(b.vx,b.vy)-speed)<1e-6),'pattern speed');if(pattern===2){const aim=Math.atan2(p.y-virusBoss.y,p.x-virusBoss.x),offsets=bullets.map(b=>Math.atan2(Math.sin(Math.atan2(b.vy,b.vx)-aim),Math.cos(Math.atan2(b.vy,b.vx)-aim)));check(Math.abs(offsets[0]+.24)<1e-6&&Math.abs(offsets[9]-.24)<1e-6,'fan preserves spread');check(offsets.every((v,i)=>Math.abs(v+offsets[9-i])<1e-6),'ten-shot fan centered on player');}}
virusBoss.pattern=0;virusBoss.patternAge=7.99;updateVirusBoss(.02);check(virusBoss.pattern===1&&virusBoss.fire>.7,'pattern transition gives grace');
renderer.begin();drawVirusBoss(virusBoss);check(renderer.count>0&&renderer.count<200000,'bounded virus geometry');for(let i=0;i<renderer.count;i++)check(Number.isFinite(renderer.data[i]),'finite capsid and leg mesh');
startVirusTest();sound=false;virusGod=true;shootTimer=999;const boss=virusBoss;shots=[{x:boss.x,y:boss.y,vx:0,vy:0,r:3,life:1,damage:500,pierce:1}];step(.001);check(state==='bossDying','lethal hit starts finale');step(3);check(boss.hp<=0&&state==='menu'&&cleared&&enemies.length===0&&bullets.length===0,'actual friendly hit defeats boss without shop');
$('virus-again').onclick();check(virusBoss!==boss&&state==='combat'&&virusBoss.hp===420,'clean replay');sound=false;virusGod=false;p.hp=1;p.inv=0;hurt();check(state==='dead'&&virusTest,'test death');
startVirusTest();virusGod=true;p.inv=0;const hp=p.hp;hurt();check(p.hp===hp,'god toggle');reset();check(!virusTest&&!virusBoss&&!snakeTest&&!snakeBoss,'normal reset cleans boss');
console.log('Virus boss arena, target, planted gait, staggered safety steps, fixed knee bend, IK, patterns, render, actual damage, victory/death/replay/reset passed');
`,sandbox);

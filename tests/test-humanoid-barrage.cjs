const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/humanoid.js','utf8'),sandbox);
vm.runInContext(`
function check(v,m){if(!v)throw Error(m)}
const dist=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));$('humanoid-health').style.setProperty=()=>{};
for(const kind of ['strafe','spinshoot'])for(const mode of ['walk','run'])for(const heading of [0,Math.PI/2,Math.PI,-Math.PI/2]){
 startHumanoidTest();sound=false;shootTimer=999;setHumanoidMotion(mode);const e=humanoidBoss;e.x=325;e.y=285;e.angle=heading;e.gait=null;updateHumanoidGait(e,0);startHumanoidSlash(e,kind);const s=e.slash,seen=[];let moved=0,turn=0,rounds=false;
 startHumanoidSlash(e,'slash',-1);check(!s.queuedDirection,'no sword combo in barrage');
 for(let i=0;i<400;i++){
  if(i===120)p.x+=45;
  updateHumanoidBoss(1/120);renderer.begin();drawHumanoidBoss(e);check(renderer.residentSnapshot().every(Number.isFinite),'finite geometry');
  if(e.slash){moved=Math.max(moved,Math.hypot(e.x-s.x,e.y-s.y));turn=Math.max(turn,Math.abs(e.angle-s.startAngle));check(e.lean<.2,'upright body');
   for(let j=0;j<2;j++)check(dist(humanoidLegPose(e,j).foot,e.gait.legs[j].foot)<1e-6,'exact leg reach');
   for(const gun of s.guns){check(Math.abs(dist(gun.arm.hip,gun.arm.knee)-30)<1e-6&&Math.abs(dist(gun.arm.knee,gun.arm.foot)-36)<1e-6,'arm lengths');}
   for(const shot of s.shots)if(!seen.includes(shot)){if(seen.length)check(shot.side===-seen.at(-1).side,'hands alternate');seen.push(shot);}
   if(kind==='strafe')check(Math.abs(e.angle-Math.atan2(p.x-e.x,(p.y-e.y)*1.06))<1e-8,'body aims at moving player');
   check(e.x>=A.x+75&&e.x<=A.x+A.w-75&&e.y>=A.y+75&&e.y<=A.y+A.h-75,'arena bounds');
  }
  rounds||=!!renderer.residentMeshes.get('humanoid:barrage-round')?.count;
 }
 check(!e.slash&&e.motion===mode&&rounds,'completion and restore source mode');check(seen.length===(kind==='strafe'?32:54),'expected shot count '+seen.length);check(kind==='strafe'?moved>25:turn>TAU*2.9&&moved===0,'lateral movement or three full spins');
 if(kind==='spinshoot'){const bins=new Set(seen.map(q=>Math.floor(((q.yaw%TAU+TAU)%TAU)/TAU*8)));check(bins.size===8,'bullets cover all directions');}
 renderer.begin();drawHumanoidBoss(e);check(!renderer.residentMeshes.get('humanoid:barrage-round').count&&!renderer.residentMeshes.get('humanoid:pistol').count,'effects cleaned up');
}
for(const kind of ['strafe','spinshoot']){startHumanoidTest();toggleHumanoidWalking();$('humanoid-'+kind).onclick();updateHumanoidBoss(3.5);check(!humanoidWalking&&!humanoidBoss.slash,'stopped mode preserved');}
console.log('Barrage: alternating 32/54 shots, player aim, sideways motion, standing spin, full circle, IK, action guards and cleanup passed');
`,sandbox);

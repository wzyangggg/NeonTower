const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/humanoid.js','utf8'),sandbox);
vm.runInContext(`
function check(v,m){if(!v)throw Error(m)}
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
$('humanoid-health').style.setProperty=()=>{};
for(const angle of [0,Math.PI/2,Math.PI,-Math.PI/2]){
 startHumanoidTest();sound=false;shootTimer=999;const e=humanoidBoss;e.x=325;e.y=300;e.angle=angle;e.gait=null;updateHumanoidGait(e,0);startHumanoidSlash(e,'thrust');const s=e.slash;let hold=null,held=0,back=0,ahead=0,streak=false;
 startHumanoidSlash(e);check(e.slash===s,'blocks overlap');startHumanoidDash(e);check(!e.dash,'blocks dash');
 for(let i=0;i<75;i++){updateHumanoidBoss(1/120);renderer.begin();drawHumanoidBoss(e);check(renderer.residentSnapshot().every(Number.isFinite),'finite geometry');
  if(e.slash){const along=(e.x-s.x)*Math.sin(angle)+(e.y-s.y)*1.06*Math.cos(angle);back=Math.min(back,along);ahead=Math.max(ahead,along);check(e.angle===angle,'lower yaw locked');
   check(Math.abs(distance(s.arm.hip,s.arm.knee)-30)<1e-6&&Math.abs(distance(s.arm.knee,s.arm.foot)-36)<1e-6,'arm lengths');check(distance(s.arm.hip,humanoidUpperPoint(e,-25,99,0))<1e-8,'shoulder attached');
   for(let j=0;j<2;j++){check(distance(humanoidLegPose(e,j).foot,e.gait.legs[j].foot)<1e-6,'legs reachable');check(e.gait.legs[j].angle===s.footAngles[j],'foot yaw locked');}
   if(s.age>=s.prep&&s.age<s.windup){const pose=JSON.stringify([e.x,e.y,e.lean,s.hand.point,e.gait.legs.map(l=>l.foot)]);if(hold)check(pose===hold,'pose held');hold=pose;held++;}
   if(s.age>=s.windup+s.launch&&s.age<s.windup+s.strike){check(Math.abs(along-100)<1e-6,'endpoint in 55ms');check(Math.abs(e.lean*180/Math.PI-65)<1e-6,'impact lean');}
   if(s.age<s.windup)check(!renderer.residentMeshes.get('humanoid:thrust-streak')?.count,'no early streak');
   if(s.age>=s.windup+s.strike)check(!renderer.residentMeshes.get('humanoid:sword')?.count,'hide sword at impact end');
  }
  streak||=!!renderer.residentMeshes.get('humanoid:thrust-streak')?.count;
 }
 check(!e.slash&&held>=13&&back<-39&&ahead>99&&streak,'fast retreat hold lunge cleanup');
 for(let i=0;i<120;i++){const x=e.x,y=e.y;updateHumanoidBoss(1/120);check(Math.hypot(e.x-x,e.y-y)<3,'no resume snap');}
}
console.log('Fast thrust: 140ms prep, 120ms hold, 55ms lunge, root movement, fixed yaw, IK and cleanup passed');
`,sandbox);

const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/humanoid.js','utf8'),sandbox);
vm.runInContext(`
function check(v,m){if(!v)throw Error(m)}
const dist=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));$('humanoid-health').style.setProperty=()=>{};
for(const kind of ['skyshoot','blink'])for(const mode of ['walk','run'])for(const corner of [false,true]){
 startHumanoidTest();sound=false;shootTimer=999;setHumanoidMotion(mode);const e=humanoidBoss;e.x=corner?A.x+75:325;e.y=corner?A.y+75:285;e.gait=null;updateHumanoidGait(e,0);startHumanoidSlash(e,kind);const s=e.slash;let jumps=0,heavy=false,ring=false,flash=false,lift=false,lastX=e.x,lastY=e.y,rot=0;
 startHumanoidSlash(e,'slash',-1);check(!s.queuedDirection,'special blocks sword combo');
 for(let i=0;i<300;i++){updateHumanoidBoss(1/120);renderer.begin();drawHumanoidBoss(e);check(renderer.residentSnapshot().every(Number.isFinite),'finite special geometry '+kind+' '+mode+' '+i);
  if(e.slash){for(let j=0;j<2;j++)check(dist(humanoidLegPose(e,j).foot,e.gait.legs[j].foot)<1e-6,'exact leg reach');
   if(kind==='blink'){if(Math.hypot(e.x-lastX,e.y-lastY)>1)jumps++;lift||=e.gait.legs[1].foot[1]>20;rot=Math.max(rot,e.angle-s.angle);check(!renderer.residentMeshes.get('humanoid:sword')?.count&&!renderer.residentMeshes.get('humanoid:pistol')?.count,'unarmed blink');if(s.age<.43)check(e.x===s.x&&e.y===s.y,'hold position until teleport');}
   else{check(e.x===s.x&&e.y===s.y,'sky stance stays put');for(const gun of s.guns){check(gun.hand.pitch>=Math.PI/2,'gun points skyward');if(gun.shot)check(Math.abs(gun.shot.pitch-Math.PI/2)<1e-9,'upward bullet ray');}check(s.drops.length===2&&Math.hypot(s.drops[0].x-s.drops[1].x,s.drops[0].y-s.drops[1].y)>=65,'two distinct landings');for(const d of s.drops)check(d.x>=A.x+90&&d.x<=A.x+A.w-90&&d.y>=A.y+90&&d.y<=A.y+A.h-90,'drops inside arena');}
  }
  heavy||=!!renderer.residentMeshes.get('humanoid:sky-heavy')?.count;ring||=renderer.residentMeshes.get('humanoid:sky-ring-round')?.count>=24;flash||=!!renderer.residentMeshes.get('humanoid:blink-star')?.count;lastX=e.x;lastY=e.y;
 }
 check(!e.slash&&e.motion===mode,'restores source motion');check(kind==='blink'?jumps===1&&lift&&rot>=TAU-.001&&flash:heavy&&ring,'special phases visible');
 renderer.begin();drawHumanoidBoss(e);for(const key of ['sky-heavy','sky-ring-round','blink-star','landing-marker'])check(!renderer.residentMeshes.get('humanoid:'+key)?.count,'cleanup '+key);
}
for(const kind of ['skyshoot','blink']){startHumanoidTest();toggleHumanoidWalking();$('humanoid-'+kind).onclick();updateHumanoidBoss(3);check(!humanoidWalking&&!humanoidBoss.slash,'stationary state restored');}
console.log('Sky guns and ballet blink: upward fire, two separated in-bounds falls, radial bursts, single teleport, full spin, raised foot, exact IK and cleanup passed');
`,sandbox);

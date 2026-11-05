const fs=require('node:fs'),vm=require('node:vm');
const elements={};const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);if(process.argv.includes('--hex'))vm.runInContext(fs.readFileSync('dist/hex-map.js','utf8')+'\n'+fs.readFileSync('dist/terrain-generators.js','utf8'),sandbox);for(const file of ['music','renderer','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss','electric-tiles']){let code=fs.readFileSync('dist/'+file+'.js','utf8');if(file==='game'&&process.argv.includes('--hex'))code=require('../dist/hex-map.js').transform(code);vm.runInContext(code,sandbox);}
vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
reset();floor=1;startWave();step(1);p.inv=999;shootTimer=999;spawnQueue=[];timedRoom.nextWaveAt=999;enemies=[];
// Orthographic camera centered at the player's current position, including pan/zoom.
for(const scale of [1,1.5]){
 renderer.vp=new Float32Array([scale/300,0,0,0,0,0,0,0,0,scale/300,0,0,-(p.x-325)*scale/300,-(p.y-300)*1.06*scale/300,0,1]);
 for(const type of ['spitter','eye','fighter','moth','skull','laser','stealthDrone']){
 timedRoom.remaining=45;enemies=[];bullets=[];missiles=[];spawn({type,side:1});const e=enemies[0],q=rangedScreenPoint(e.x,e.y);
 check(e.rangedEntering&&(Math.abs(q.x)>1.25||Math.abs(q.y)>1.25),'outside camera '+type);
 const x=e.x,y=e.y;step(.01);check(Math.abs(Math.hypot(e.x-x,e.y-y)-1.2*drinkMonsterSpeed())<1e-7,'slow continuous entry at 120 units per second');check(!bullets.length&&!missiles.length,'silent entry');
 let attackedDuringEntry=false;
 for(let i=0;i<3000&&e.rangedEntering;i++){
  step(.01);
  const attacked=bullets.length||missiles.length||e.laserMode==='warning';
  if(attacked){
   const point=rangedScreenPoint(e.x,e.y);
   check(Math.abs(point.x)<=1&&Math.abs(point.y)<=1,'no attack outside camera '+type);
   if(e.rangedEntering)attackedDuringEntry=true;
  }
 }
 check(!e.rangedEntering,'entry completes '+type);
 check(attackedDuringEntry===(type!=='stealthDrone'),'visible entry attack policy '+type);
 bullets=[];missiles=[];e.x=p.x+50;e.y=p.y;e.fire=-1;const before=Math.hypot(e.x-p.x,e.y-p.y);step(.1);
 check(Math.hypot(e.x-p.x,e.y-p.y)>before,'backs away '+type);check(!bullets.length&&!missiles.length,'no point blank fire '+type);
 }
}
// Isolate cadence from movement, room spawning and projectile cleanup.
reset();state='combat';floor=8;timedRoom={duration:60,remaining:60,nextWaveAt:999};spawnQueue=[];turrets=[];p.inv=999;shootTimer=999;
const savedMovement=updateRangedMovement,savedFire=fire;updateRangedMovement=()=>{};let volleys=0;fire=()=>{volleys++;};
for(const [type,base] of [['moth',1.3],['eye',2.1],['fighter',3.1],['skull',1.7]]){
 const mob={type,x:p.x+220,y:p.y,hp:100,r:14,seed:0,t:0,fire:0};enemies=[mob];volleys=0;step(.01);
 check(volleys===1&&Math.abs(mob.fire-base*3)<1e-8,'triple attack interval '+type);
 for(let i=0;i<Math.floor((base*3-.1)/.01);i++)step(.01);
 check(volleys===1,'no early repeat '+type);step(.2);check(volleys===2,'next volley after triple interval '+type);
}
updateRangedMovement=savedMovement;fire=savedFire;
const laser={type:'laser',hp:100,x:p.x+220,y:p.y,laserMode:'firing',laserTimer:.01,groundX:p.x+220,groundY:p.y,laserAge:0};
updateLaserEye(laser,.01);check(laser.laserMode==='idle'&&Math.abs(laser.laserTimer-(LASER_EYE.cooldown+2*(LASER_EYE.charge+LASER_EYE.lock+LASER_EYE.track+LASER_EYE.cooldown)))<1e-8,'laser full cycle triples through cooldown');
console.log('Camera-relative offscreen entry, continuous movement, visible entry attacks and close-range retreat/fire suppression passed.');
}`,sandbox);

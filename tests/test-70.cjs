const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);



vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
function hitCount(w,distance,source='weapon'){shots=[];emitWeaponShots(w,0,{x:325,y:300},source);const target={x:325+distance,y:300,r:14};let hits=0;for(const shot of shots){for(let i=0;i<80;i++){shot.x+=shot.vx*.016;shot.y+=shot.vy*.016;if(shotHits(shot,target,.016)){hits++;break}if(shot.x>target.x+30)break}}return hits}
reset();const shotgun=createWeapon('shotgun'),narrowHitbox={...shotgun,hitRadius:4};
check(Math.abs(shotgun.spread*4*180/Math.PI-60)<1e-8,'shotgun reaches 30 degrees on each side');
const distances=[35,40,75,160],before=distances.map(d=>hitCount(narrowHitbox,d)),after=distances.map(d=>hitCount(shotgun,d));
check(after.join(',')==='5,5,3,1','wide fan favors close targets');
check(after[1]>before[1]&&after[2]>before[2],'larger collision radius catches near misses at the same spread');
check(shotgun.damage===.95&&shotgun.interval===.5&&shotgun.speed===680,'shotgun damage, cadence and speed');
for(const tier of [1,3,5]){
 const w=createWeapon('shotgun',tier),dr=createDrone('shotgun',tier);
 check(hitCount(w,75)===3&&hitCount(dr,75,'drone')===3,'all qualities and drones use the same fan');
 check(Math.abs(dr.damage-w.damage*.65)<.006,'drone scaling retained');
}
const random=Math.random,pistol=createWeaponModel('pistol_t1');
const pistolHits=[0,0,0],pistolDistances=[60,120,200],samples=100;
try{
 for(const sample of [0,.5,.999]){
  Math.random=()=>sample;
  for(const m of WEAPON_MODELS.filter(m=>['pistol','smg','rifle','sniper','rocket','uzi'].includes(m.familyId))){
   const w=createWeaponModel(m.id);shots=[];enemies=[];emitWeaponShots(w,0,p);
   check(w.spread>0&&w.spread<=Math.PI/3&&w.recoilDistance>0,'bounded handling '+m.id);
   check(shots.every(s=>Math.abs(Math.atan2(s.vy,s.vx)-(sample-.5)*w.spread)<1e-8&&s.hitRadius>4&&s.knockback>0),'fired projectile uses configured handling '+m.id);
  }
 }
 check(Math.abs(pistol.spread/2*180/Math.PI-15)<1e-8,'starter pistol reaches 15 degrees on each side');
 for(let i=0;i<samples;i++){
  Math.random=()=>(i+.5)/samples;
  pistolDistances.forEach((distance,index)=>{pistolHits[index]+=hitCount(pistol,distance);});
 }
 check(pistolHits[0]===samples&&pistolHits[1]>=55&&pistolHits[1]<=70&&pistolHits[2]>=30&&pistolHits[2]<=45,'starter pistol hits reliably up close and visibly misses at range');
}finally{Math.random=random;}
console.log('Weapon spread and collision passed. Starter pistol hits at distances 60/120/200: '+pistolHits.join('/')+' per 100 shots.');
}`,sandbox);

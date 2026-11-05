const fs=require('node:fs'),vm=require('node:vm');
const H=require('../dist/hex-map.js'),elements={};
const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{},hidden:true,classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const sandbox={Image:class {complete=true;naturalWidth=256;},HexMap:H,console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);
for(const file of ['music','renderer','map-icons','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss','electric-tiles']){const src=fs.readFileSync('dist/'+file+'.js','utf8');vm.runInContext(file==='game'?H.transform(src):src,sandbox);}
vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
reset();sound=false;state='combat';timedRoom={remaining:999,duration:999,nextWaveAt:999};
const E=ElectricTiles;
for(const kind of ['tower','freeze_bomb','laser_bomb','missile_bomb','miner','apple','clockshop']){
 E.reset();tiles=[];for(let y=-5;y<=5;y++)for(let x=-6;x<=6;x++)tiles.push({x,y});particles=[];shots=[];p.pickupFlash=0;
 const f=E.place(kind,{x:0,y:0});check(f,'place '+kind);f.products=1;f.cool=4;const at=E.center(f.cells[0]);p.x=at.x;p.y=at.y;
 E.update(.001);check(f.collected===1&&f.products===0,'actual pickup '+kind);
 const aura=particles.find(q=>q.pickupAura);check(aura&&aura.kind===kind,'shared aura '+kind);check(particles.filter(q=>q.pickupSpark).length===22,'sparks '+kind);check(p.pickupFlash===.14,'white flash '+kind);
 check(aura.c===(kind==='apple'?PICKUP_COLORS.medical:PICKUP_COLORS[kind]),'palette '+kind);
}
particles=[];p.hp=1;p.max=3;terrainConsumeSupply({medical:true},{kind:'medical',amount:1});check(p.hp===2&&particles.some(q=>q.pickupAura),'legacy healing pickup');
particles=[];terrainConsumeSupply({cashTile:true},{kind:'cash',amount:3});check(particles.find(q=>q.pickupAura).c===PICKUP_COLORS.cash,'legacy cash pickup');
particles=[];pickupFeedback('medical');const spark=particles.find(q=>q.pickupSpark),initial={x:spark.x,y:spark.y,h:spark.height,vx:spark.vx,vy:spark.vy,vz:spark.vz};updateParticles(.1);
const drag=Math.exp(-.6),travel=(1-drag)/6;check(Math.abs(spark.height-initial.h-initial.vz*travel)<1e-8,'zero gravity vertical motion');check(Math.abs(spark.vx-initial.vx*drag)<1e-8&&Math.abs(spark.vz-initial.vz*drag)<1e-8,'isotropic exponential slowdown');
check(Math.abs(p.pickupFlash-.04)<1e-8,'flash fades');const life=spark.life;paused=true;step(.1);check(spark.life===life,'pause preserves feedback');paused=false;
renderer.begin();for(const q of particles)if(q.pickupAura||q.pickupSpark)drawPickupParticle(q);check(renderer.particleSurfaceSnapshot().length>0&&renderer.particleSurfaceSnapshot().every(Number.isFinite),'finite transparent ring glow and sparkle geometry');
for(let i=0;i<40;i++)pickupFeedback(i%2?'cash':'medical');check(particles.filter(q=>q.pickupAura||q.pickupSpark).length<=276,'bounded pickup effects');updateParticles(1);check(!particles.some(q=>q.pickupAura||q.pickupSpark)&&p.pickupFlash===0,'expiry');
pickupFeedback();reset();check(!particles.some(q=>q.pickupAura||q.pickupSpark)&&!p.pickupFlash,'restart clears feedback');
console.log('Pickup feedback: actual bomb/cash/fruit/clock and legacy supply entry points, palettes, no gravity, slowdown, flash, pause, alpha geometry, cap and restart passed.');
}`,sandbox);

const fs=require('node:fs'),vm=require('node:vm');
const H=require('../dist/hex-map.js'),elements={};
const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{},hidden:true,classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const sandbox={Image:class {complete=true;naturalWidth=256;},HexMap:H,console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);
for(const file of ['music','renderer','map-icons','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss','electric-tiles']){const src=fs.readFileSync('dist/'+file+'.js','utf8');vm.runInContext(file==='game'?H.transform(src):src,sandbox);}
vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
reset();floor=1;startWave();
check(timedRoom.duration===20,'first floor lasts twenty seconds');
check(enemies.filter(isMeleeEnemy).length===3&&enemies.filter(e=>!isMeleeEnemy(e)).length===2,'opening contains both contact and ranged aircraft');
let previous=0;for(let f=1;f<=33;f++){floor=f;const d=normalRoomDuration();check(d===Math.min(60,20+2*(f-1))&&d>=previous,'progressive room duration '+f);previous=d;}
reset();state='combat';tiles=[];for(let y=-4;y<=4;y++)for(let x=-5;x<=5;x++)tiles.push({x,y});
const E=ElectricTiles;localStorage.getItem=key=>key==='neon-facility-designer-v1'?JSON.stringify({version:2,facilities:{tower:{cells:[[0,0]],range:420}}}):null;
const tower=E.place('tower',{x:0,y:0});check(tower.scopeMode==='none'&&E.towerAttackRange()===420,'legacy tower uses independent combat range');
p.x=100;p.y=100;enemies=[];missiles=[];shots=[];E.update(4);
check(tower.cool<1e-8&&!tower.attacks,'empty tower stays armed');
const at=E.facilityCenter(tower),enemy={type:'spitter',x:at.x+200,y:at.y,hp:100,max:100,r:14,t:0,fire:999,seed:0,homeX:at.x+200,homeY:at.y};enemies=[enemy];
E.update(.01);check(tower.attacks===1&&shots[0].arcTargets[0]===enemy,'entry triggers armed legacy tower');
shootTimer=999;p.inv=999;timedRoom={duration:999,remaining:999,nextWaveAt:999};spawnQueue=[];step(.01);check(enemy.hp===94,'tower damage reaches real combat pipeline');
// Circle radius and the complete moving path, including a bounce, determine blade damage.
localStorage.getItem=()=>null;E.reset();enemies=[];shots=[];turrets=[];
const wheel={x:250,y:300,axis:'x',dir:1};p.x=p.frameStartX=325;p.y=p.frameStartY=300;p.hp=3;p.inv=0;
updateFlywheel(wheel,1);check(p.hp===2,'fast crossing hits even when final position misses');
p.hp=3;p.inv=0;p.y=p.frameStartY=300+FLYWHEEL_RADIUS+drinkPlayerRadius()+1;wheel.x=250;wheel.y=300;wheel.dir=1;
updateFlywheel(wheel,1);check(p.hp===3,'outside visible blade plus player radius stays safe');
// The blade can reverse at the floor edge without leaking into locked cells.
for(let i=0;i<500;i++){moveFlywheel(wheel,.016);check(HexMap.canStand(tiles,wheel.x,wheel.y,FLYWHEEL_RADIUS),'blade stays on unlocked floor');}
// Normal ranged kill bounty is two; contact enemies remain reward-free.
reset();state='combat';spawnQueue=[];timedRoom={duration:999,remaining:999,nextWaveAt:999};p.inv=999;shootTimer=999;cash=0;turrets=[];
for(const type of ['spitter','suicideDrone']){enemies=[{type,x:500,y:300,hp:1,max:1,r:14,t:0,fire:999,seed:0,homeX:500,homeY:300}];const target=enemies[0];shots=[{beam:true,arc:true,arcTargets:[target],x:500,y:300,originX:p.x,originY:p.y,vx:0,vy:0,life:.5,damage:2,pierce:1,hitTargets:new Set(),critChance:0}];step(.01);check(cash===2,'ranged payout two and contact no payout');}
check(E.defs.miner.amount===8,'miner payout increased to eight');
console.log('Opening mix, 20s progressive duration, legacy/armed tower and actual damage, swept blade hits/safe radius/500 boundary steps, ranged/contact/mining economy passed.');
}`,sandbox);

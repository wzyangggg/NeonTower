const fs=require('node:fs'),vm=require('node:vm');
const elements={};const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/hex-map.js','utf8')+'\n'+fs.readFileSync('dist/terrain-generators.js','utf8'),sandbox);for(const file of ['music','renderer','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss'])vm.runInContext(file==='game'?require('../dist/hex-map.js').transform(fs.readFileSync('dist/game.js','utf8')):fs.readFileSync('dist/'+file+'.js','utf8'),sandbox);
vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
const comparison=[];
for(const [f,total,bounty] of [[1,60,84],[13,100,315],[23,150,533]]){
 reset();floor=f;startWave();step(1);const roster=[...enemies,...spawnQueue];
 check(roster.length===total&&stageResultStats().total===total,'fixed enlarged pool '+f);
 check(roster.reduce((n,e)=>n+enemyKillReward({...e,max:e.max??(isMeleeEnemy(e)?normalMeleeHealth(e.type)*(e.bridgeRoller&&e.type==='ironball'?2.5:1):rangedEnemyHealth(e.type))}),0)===bounty,'full pool bounty '+f);
 comparison.push({floor:f,seconds:normalRoomDuration(),pool:total,fullKillCash:bounty,minerOld:Math.floor(normalRoomDuration()/4)*3,minerNew:Math.floor(normalRoomDuration()/4)*8});
}
function simulate(cycle){
 reset();floor=1;startWave();step(1);p.inv=999;shootTimer=999;let next=cycle;
 for(let t=.05;t<=20.001&&state==='combat';t+=.05){
  if(t+1e-8>=next){
   const targets=enemies.filter(e=>e.hp>0);for(const e of targets){e.terrainStun=999;e.transport=null;}
   shots=[{beam:true,arc:true,radial:true,arcTargets:targets,originX:p.x,originY:p.y,x:p.x,y:p.y,vx:0,vy:0,life:.05,damage:99999,pierce:Infinity,hitTargets:new Set()}];next+=cycle;
  }
  step(.05);
 }
 return {cash,ratio:stageResultStats().ratio,kills:stageResultStats().defeated,total:stageResultStats().total};
}
const slow=simulate(3),fast=simulate(.8);
check(slow.total===60&&fast.total===60,'same denominator across output levels');
check(slow.ratio<100&&fast.ratio>slow.ratio&&fast.cash>slow.cash,'faster actual damage yields higher kill ratio and cash');
console.log('Economy comparison (ideal miner pickup, no buffs):',JSON.stringify(comparison));
console.log('Fixed 20-second room, actual lethal volleys every 3s vs .8s:',JSON.stringify({slow,fast}));
}`,sandbox);

const fs=require('node:fs'),vm=require('node:vm');
const H=require('../dist/hex-map.js'),elements={};
const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{},hidden:true,classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const sandbox={Image:class {complete=true;naturalWidth=256;},HexMap:H,console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);
for(const file of ['music','renderer','map-icons','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss','electric-tiles']){const src=fs.readFileSync('dist/'+file+'.js','utf8');vm.runInContext(file==='game'?H.transform(src):src,sandbox);}
vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
const E=ElectricTiles,cells=[[0,0],[1,0],[0,-1],[-1,0],[-1,1],[0,1],[1,-1]];
function setup(effectMode='custom',effectCells=[],range=420){reset();state='combat';paused=false;tiles=[];for(let y=-4;y<=4;y++)for(let x=-5;x<=5;x++)tiles.push({x,y});localStorage.getItem=k=>k==='neon-facility-designer-v1'?JSON.stringify({version:2,facilities:{tower:{cells,effectMode,effectCells,range}}}):null;const f=E.place('tower',{x:0,y:0});check(f&&f.cells.length===7,'seven-cell footprint preserved');enemies=[];missiles=[];turrets=[];shots=[];spawnQueue=[];p.inv=999;Object.assign(p,E.facilityCenter(f));shootTimer=999;timedRoom={duration:999,remaining:999,nextWaveAt:999};return f;}
function target(f,dx,dy=0){const at=E.facilityCenter(f),e={type:'spitter',x:at.x+dx,y:at.y+dy,hp:100,max:100,r:14,t:0,fire:999,seed:0,homeX:at.x+dx,homeY:at.y+dy};enemies=[e];return e;}
// Every facility influence mode must leave combat reach unchanged.
for(const [mode,mask,radius]of [['custom',[],0],['custom',[[3,0]],20],['adjacent',[],0],['none',[],0],['radius',[],80],['global',[],1000]]){
 for(const distance of [0,30,100,419,420,421,800,1200]){
  const f=setup(mode,mask,radius),e=target(f,distance);E.update(12);
  check(f.attacks===1,'independent attack radius '+mode+'/'+distance);
  check(f.scopeMode===mode&&f.range===radius,'facility influence configuration preserved');
  if(f.attacks){step(.01);check(e.hp===94,'actual six damage '+mode+'/'+distance);}
 }
}
const old=setup();old.scopeMode='none';old.range=0;old.outputs=[];target(old,30);E.update(12);check(old.attacks===1,'existing snapshots no longer disable attack');
check(E.towerAttackRange()===Infinity,'screen-wide combat reach has no distance cap');
const noTrap=setup();const at=E.facilityCenter(noTrap);enemies=[];turrets=[{type:'turret',x:at.x,y:at.y,hp:10}];E.update(12);check(noTrap.attacks===0,'hostile trap turrets excluded');
console.log('Independent tower attack range: six influence modes and 0/30/100/419/420/421/800/1200 distances, unchanged bonus masks, actual damage, old snapshots and trap exclusion passed.');
}`,sandbox);

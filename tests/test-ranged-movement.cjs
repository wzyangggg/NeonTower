const fs=require('node:fs'),vm=require('node:vm');
const elements={};const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);for(const file of ['music','renderer','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss'])vm.runInContext(fs.readFileSync('dist/'+file+'.js','utf8'),sandbox);

vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
reset();state='combat';tiles=[];p.x=325;p.y=300;
function enemy(type,x=540,y=300,seed=.7){return {type,x,y,homeX:x,homeY:y,hp:100,max:100,r:14,t:0,fire:99,seed};}
function advance(e,seconds){let path=0;for(let i=0;i<Math.round(seconds*60);i++){const x=e.x,y=e.y;e.t+=1/60;updateRangedMovement(e,1/60);path+=Math.hypot(e.x-x,e.y-y);check(e.x>=A.x+28&&e.x<=A.x+A.w-28&&e.y>=A.y+30&&e.y<=A.y+A.h-30,'arena bounds');}return path;}
for(const type of ['eye','skull','missile','moth','laser']){
 const e=enemy(type);const path=advance(e,8);check(path>170,type+' visibly walks at useful range');check(Math.hypot(e.x-p.x,e.y-p.y)>170&&Math.hypot(e.x-p.x,e.y-p.y)<270,type+' keeps firing distance');
 const near=enemy(type,385);advance(near,1);check(Math.hypot(near.x-p.x,near.y-p.y)>80,type+' retreats from nearby player');
 const far=enemy(type,A.x+A.w-29,A.y+31);const initial=Math.hypot(far.x-p.x,far.y-p.y);advance(far,2);check(Math.hypot(far.x-p.x,far.y-p.y)<initial-20,type+' approaches from far corner');
 const edge=enemy(type,A.x+28,A.y+30);const travel=advance(edge,5);check(travel>100,type+' leaves corner');
}
const laser=enemy('laser');for(const mode of ['warning','firing']){laser.laserMode=mode;const x=laser.x,y=laser.y;check(advance(laser,1)===0&&laser.x===x&&laser.y===y,'laser locks warning and firing position');}laser.laserMode='idle';check(advance(laser,1)>15,'laser resumes between attacks');
const moving=enemy('eye');advance(moving,1);p.y+=90;advance(moving,4);check(Math.hypot(moving.x-p.x,moving.y-p.y)>170,'tracks changed player position');
const frozen=enemy('eye');updateRangedMovement(frozen,0);check(frozen.x===540&&frozen.y===300,'zero enemy time freezes motion');
// Exercise the real loop: stun freezes movement and firing still runs while walking.
reset();state='combat';timedRoom=null;spawnQueue=[];chaserSpawned=24;shootTimer=999;turrets=[];tiles=[];p.inv=999;
const eye=enemy('eye');eye.terrainStun=.5;enemies=[eye];step(.1);check(eye.x===540&&eye.y===300,'terrain stun freezes walk');eye.terrainStun=0;eye.fire=.01;step(.05);check(Math.hypot(eye.x-540,eye.y-300)>1&&bullets.length>0,'walk and fire through combat loop');
// Cover remains solid while enemies move alongside it.
reset();state='combat';p.x=325;p.y=300;tiles=[{x:2,y:0,coverTile:true,coverHp:coverMaximum()}];const covered=enemy('eye',325+2*TILE+TILE/2+16,300);enemies=[covered];advance(covered,3);check(!coverContains(tiles[0],covered.x,covered.y,covered.r-1),'walking respects cover');
console.log('Ranged movement: five types, distance, corners, laser lock, player tracking, stun, firing and cover passed');
}`,sandbox);

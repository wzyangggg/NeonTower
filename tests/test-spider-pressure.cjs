const fs=require('node:fs'),vm=require('node:vm');
const elements={};const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/hex-map.js','utf8')+'\n'+fs.readFileSync('dist/terrain-generators.js','utf8'),sandbox);for(const file of ['music','renderer','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss','electric-tiles']){let code=fs.readFileSync('dist/'+file+'.js','utf8');if(file==='game')code=require('../dist/hex-map.js').transform(code);vm.runInContext(code,sandbox);}
const pressure=require('../tools/audit-spider-pressure.cjs');
const assert=require('node:assert/strict');
assert.ok(pressure.result.firstContact===null&&pressure.result.kills>0,'starter pistol can hold the reduced early bridge stream');
assert.ok(pressure.result.alive>0,'continuous attackers leave living pressure');
assert.ok(pressure.result.initial.every(e=>Math.abs(e.hp-3.6)<1e-7),'first-floor spiders require four basic hits');
vm.runInContext(`{
reset();floor=1;startWave();step(1);paused=false;const mob=enemies.find(e=>e.type==='crawler');mob.hp=100;enemies=[mob];const knockback=createWeaponModel('pistol_t1').knockback;
for(const [vx,vy]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1]]){
 const at=bridgeCellCenter(bridgeRoom.cells[1]);mob.x=at.x;mob.y=at.y;
 for(let i=0;i<50;i++){applyImpactKnockback(mob,{vx,vy,knockback});updateImpactKnockbacks(.15);if(!HexMap.canStand(bridgeRoom.surface,mob.x,mob.y,6.99))throw Error('pistol push left supported bridge');}
}
applyImpactKnockback(mob,{vx:1,vy:0,knockback});if(Math.abs(mob.starterKick.x-73.5)>1e-7)throw Error('bridge pistol push resistance');
const kick=JSON.stringify(mob.starterKick);paused=true;step(1);if(JSON.stringify(mob.starterKick)!==kick)throw Error('pause freezes push');paused=false;
mob.type='ironball';delete mob.starterKick;applyImpactKnockback(mob,{vx:1,vy:0,knockback});if(Math.abs(mob.starterKick.x-31.5)>1e-7)throw Error('heavy ironball resists pistol');
}`,sandbox);
console.log('Spider pressure:',JSON.stringify(pressure));

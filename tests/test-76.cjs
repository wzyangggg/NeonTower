const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);



vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
const originalEmit=emitWeaponShots,counts={weapon:0,drone:0};emitWeaponShots=function(w,a,origin,source='weapon'){counts[source]++;originalEmit(w,a,origin,source)};
const oldIntervals={sniper:1.5,magnum:1.15,rail:1.05,tesla:.7,shotgun:.64};
for(const id of Object.keys(oldIntervals)){
 reset();state='combat';p.y=300;p.inv=999;spawnQueue=[];chaserSpawned=24;turrets=[];
 equipItem('weapon',createWeapon(id));equipItem('drone',createDrone(id));counts.weapon=counts.drone=0;
 enemies=[{type:'eye',x:450,y:300,homeX:450,homeY:300,hp:10000,max:10000,r:14,t:0,fire:999,seed:0}];
 for(let i=0;i<300;i++)step(.01);
 check(counts.weapon>Math.ceil(3/oldIntervals[id])&&counts.drone===counts.weapon,'actual primary and drone firing cadence improves for '+id);
 check(weapon.interval===drone.interval&&weapon.interval>createWeapon('rifle').interval,'heavy identity preserved for '+id);
 const damage=weapon.damage;check(rollEquipmentStats('weapon',weapon).interval<=weapon.interval*1.151,'shop cadence derives from new base');
 console.log(id+': '+counts.weapon+' attacks in 3 seconds, formerly '+Math.ceil(3/oldIntervals[id]));
}
emitWeaponShots=originalEmit;
check(createWeapon('sniper').damage===11&&createWeapon('magnum').damage===5.8&&createWeapon('rail').damage===5&&createWeapon('tesla').damage===2.8&&createWeapon('shotgun').damage===.95,'all single-hit damage retained');
console.log('Faster slow weapons and matching drones, real combat cadence and damage preservation passed');
}`,sandbox);

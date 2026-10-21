const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};sandbox.handlers=handlers;vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);



vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
function enemy(type,x,y){return {type,x,y,homeX:x,homeY:y,hp:10000,max:10000,r:14,t:0,fire:999,seed:0}}
function combat(primary,secondary){reset();state='combat';p.y=300;p.inv=999;spawnQueue=[];chaserSpawned=24;turrets=[];equipItem('weapon',createWeapon(primary));if(secondary)equipItem('drone',createDrone(secondary));enemies=[enemy('eye',500,300),enemy('bomber',420,300)]}
// A sword wave must not poison a surviving chaser's position with absent knockback.
combat('sword');shootTimer=999;emitWeaponShots(weapon,0,p);shots=shots.filter(s=>s.crescent);const chaser=enemies[1];for(let i=0;i<30;i++)step(.016);check(chaser.hp<10000,'sword wave actually hits living chaser');check(!chaser.knockLeft,'sword wave does not apply crescent-only knockback');check(Number.isFinite(chaser.x)&&Number.isFinite(chaser.y),'chaser remains finite after wave hit');
// Repeated real combat, including targets surviving many slashes and explosions.
const originalSword=emitSword,originalSeeker=emitSeeker;let swordCount=0,seekerCount=0,explosions=0;
emitSword=(...args)=>{swordCount++;originalSword(...args)};emitSeeker=(...args)=>{seekerCount++;originalSeeker(...args)};
for(const [primary,secondary]of [['sword',null],['seeker','sword'],['sword','seeker']])for(const dt of [.01,.016,.033]){
combat(primary,secondary);swordCount=seekerCount=explosions=0;
const startHP=enemies.map(e=>e.hp);
for(let i=0;i<Math.ceil(8/dt);i++){
const flying=shots.filter(s=>s.homing);step(dt);
check(state==='combat','surviving enemies keep combat active');
for(const e of enemies)check(Number.isFinite(e.x)&&Number.isFinite(e.y)&&Number.isFinite(e.hp),'all enemy state stays finite');
for(const s of shots)check(Number.isFinite(s.x)&&Number.isFinite(s.y)&&(!s.slash||Number.isFinite(s.angle)),'all projectile positions and sword angles stay finite');
for(const s of flying)if(!shots.includes(s)){check(s.exploded,'seeker removal always has explosion');explosions++}
}
check(swordCount>=20,'sword continues attacking beyond first few swings');check(enemies[0].hp<startHP[0]&&enemies[1].hp<startHP[1],'both distant and chasing enemies take real damage');
if(primary==='seeker'||secondary==='seeker')check(seekerCount>=9&&explosions>=8,'seeker keeps launching and exploding beside sword');
draw();check(renderer.data.slice(0,renderer.count).every(Number.isFinite)&&renderer.sprites.every(s=>s.data.every(Number.isFinite)),'finite rendered combat geometry');
}
emitSword=originalSword;emitSeeker=originalSeeker;
console.log('Sword wave surviving-chaser regression, continued hand/drone sword attacks, seeker combination explosions and finite state at 10/16/33ms passed');
}`,sandbox);

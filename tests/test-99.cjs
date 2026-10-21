const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};sandbox.handlers=handlers;vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);



vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
reset();state='combat';p.y=300;equipItem('weapon',createWeapon('sword'));
renderer.begin();drawHeldWeapon(0,0,0);check(renderer.count===0,'idle sword hidden');
emitWeaponShots(weapon,0,p);const slash=shots[0];advanceFriendlyShot(slash,.11);
renderer.begin();drawHeldWeapon(0,0,0);check(renderer.count>0,'swing sword visible');drawSwordSlash(slash);
const sprite=renderer.sprites[0];check(renderer.sprites.length===1&&sprite.data.length===30&&sprite.data.every(Number.isFinite),'single finite textured quad replaces procedural trail');check(renderer.transparentCount===0,'no procedural trail geometry');let minX=Infinity,maxX=-Infinity;for(let i=0;i<30;i+=5){minX=Math.min(minX,sprite.data[i]);maxX=Math.max(maxX,sprite.data[i])}check(maxX-minX>160,'sprite covers full blade reach');check(Math.abs(sprite.lead-slash.direction*.4)<1e-8,'texture leading edge follows reverse swing');renderer.spriteTextureReady=true;renderer.end();
slash.life=0;renderer.begin();drawHeldWeapon(0,0,0);drawSwordSlash(slash);check(renderer.count===0&&renderer.transparentCount===0&&renderer.sprites.length===0,'finished slash hidden and frame trail reset');
shots=[];equipItem('drone',createDrone('sword'));renderer.begin();drawEquipmentModels();check(renderer.count===0,'idle sword drone hidden');emitWeaponShots(drone,0,dronePosition(),'drone');renderer.begin();drawEquipmentModels();check(renderer.count>0,'sword drone appears only during swing');
const oldProgram=renderer.spriteProgram,oldBuffer=renderer.spriteBuffer;renderer.swordImage={complete:true,naturalWidth:1254};renderer.initializeGPU();check(renderer.spriteProgram!==oldProgram&&renderer.spriteBuffer!==oldBuffer&&renderer.spriteTextureReady,'transparent resources rebuilt after context restore');
console.log('Sword texture quad and reverse leading edge, idle/active/finished visibility and drone/context restoration passed');
}`,sandbox);

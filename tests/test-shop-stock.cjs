const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);



vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
reset();state='upgrade';cash=999;
check(typeof PASSIVE_ITEMS==='undefined'&&typeof passiveBonus==='undefined','removed passive catalog and stat hooks');
const seen=new Set();for(let level=1;level<=5;level++){shopLevel=level;for(let i=0;i<300;i++){rollShop();check(shopItems.length===3,'three real goods');for(const u of shopItems){check(u.key==='terrainPassive'||['heal','erase','medical','shield','cashTile','shockTile','coverTile'].includes(u.key)||EQUIPMENT_LABELS[u.key],'only supported goods');seen.add(u.key);check(Number.isFinite(u.price)&&u.price>0,'valid price');if(EQUIPMENT_LABELS[u.key])check(itemEquipment(u).tier<=level,'equipment quality still follows shop');}}}
check(Object.keys(EQUIPMENT_LABELS).every(k=>seen.has(k))&&!seen.has('drink')&&seen.has('heal')&&seen.has('terrainPassive'),'equipment, shovel, terrain passives and healing remain available');
renderShop();check(!$('overlay').innerHTML.includes('passive-inventory')&&!$('overlay').innerHTML.includes('passive-card'),'removed passive shop UI');
reset();check(movementSpeed()===195&&attackSpeedMultiplier()===1&&supplyPickupRadius()===20,'base stats unaffected');check(resolveShotDamage({},100,null).damage===100,'base damage unchanged');check(DRINK_TYPES.length===16&&TERRAIN_CATALOG.some(d=>d.kind==='稀有被动'),'other passive systems retained');
console.log('Shop stock: removed small passives; three slots, all equipment tiers/shovel, terrain goods, healing, no ordinary drinks and base stats passed');
}`,sandbox);

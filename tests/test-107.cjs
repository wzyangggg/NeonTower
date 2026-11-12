const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);



vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
function close(a,b,m){check(Math.abs(a-b)<1e-8,m)}
function tile(x,y,kind){return {x,y,[kind]:true,healProgress:0,healFlash:0,medPack:false}}
function setup(){reset();state='combat';timedRoom={remaining:NORMAL_ROOM_TIME,spawnLeft:NORMAL_SPAWN_INTERVAL};p.y=300;equipItem('armor',createArmor('greed'));}
setup();tiles=[tile(0,0,'cashTile'),tile(1,0,'medical')];
const production=tiles.map(productionMultiplier);equipItem('armor',createArmor('shell'));
tiles.forEach((t,i)=>close(productionMultiplier(t),production[i],'greed no longer changes production speed'));
setup();tiles=[tile(0,0,'cashTile')];tiles[0].medPack=true;updateHealing(.01);close(cash,3.9,'money pickup gets tier-one bonus');close(cashPopups.at(-1).amount,3.9,'popup matches payout');check(!tiles[0].medPack,'pickup removed');updateHealing(.01);close(cash,3.9,'no repeat reward');
setup();state='combat';p.inv=999;shootTimer=999;spawnQueue=[];chaserSpawned=24;turrets=[];enemies=[{type:'eye',x:400,y:300,homeX:400,homeY:300,hp:1,max:1,r:14,t:0,fire:999,seed:0}];shots=[{x:400,y:300,vx:0,vy:0,life:1,damage:2,pierce:1}];step(.001);close(cash,1.3,'actual T1 enemy kill gets tier-one bonus');
setup();floor=2;state='survival';finishSurvival();step(1);close(cash,31.2,'survival bonus gets tier-one bonus');check(cashPopups.at(-1).settlement,'survival feedback retained');
for(let tier=1;tier<=5;tier++){
 setup();equipItem('armor',rollEquipmentStats('armor',createArmor('greed',tier)));
 close(gainCash(100,p.x,p.y),120+10*tier,'all qualities keep fixed money bonus');
 p.shield=1;p.hp=3;p.inv=0;hurt();check(p.shield===0&&p.hp===3,'shield still absorbs a whole hit');
 p.inv=0;hurt();check(p.hp===2,'unshielded damage is unchanged');
}
setup();equipItem('armor',createArmor('shell'));p.hp=3;p.inv=0;hurt();check(p.hp===2,'swap restores normal damage');const before=cash;gainCash(5,p.x,p.y);check(cash===before+5,'swap restores normal income');
const card=equipmentAttributeCard('armor',createArmor('greed'),'新装备');for(const label of ['狂笑西服','局内金钱 +30%'])check(card.includes(label),'card explains '+label);
const random=Math.random,index=ARMOR_TYPES.findIndex(e=>e.id==='greed');Math.random=()=> (index+.1)/ARMOR_TYPES.length;check(itemEquipment(equipmentShopItem('armor')).id==='greed','greed obtainable in blind box');Math.random=random;check(takeTestEquipment('armor','greed',3)&&armor.id==='greed','greed in test equipment');draw();check(renderer.data.slice(0,renderer.count).every(Number.isFinite),'greed aura/model geometry finite');reset();check(!armor&&gainCash(5,p.x,p.y)===5,'restart clears greed benefit');
console.log('Greed: fixed bonus by quality, pickup/kill/survival payouts, ordinary production and damage, roster/cards/swap/reset passed');
}`,sandbox);

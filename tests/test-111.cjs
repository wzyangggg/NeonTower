const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);



vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
function close(a,b,m){check(Math.abs(a-b)<1e-7,m)}
function enemy(hp=100,type='eye'){return {type,x:350,y:300,homeX:350,homeY:300,hp,max:hp,r:14,t:0,fire:999,seed:0}}
function setup(tier=1){reset();state='combat';p.y=300;p.inv=999;shootTimer=999;spawnQueue=[{type:'eye',side:0}];spawnTimer=999;chaserSpawned=24;turrets=[];equipItem('armor',createArmor('wine',tier));p.hp=1;enemies=[enemy()];}
const random=Math.random;
for(let tier=1;tier<=5;tier++){setup(tier);close(criticalProfile(createWeapon('sniper')).critChance,.45+.02*(tier-1),'sniper crit bonus quality scaling');close(criticalProfile(createDrone('pulse')).critChance,.1+.02*(tier-1),'drone benefits');check(armor.shieldBonus===1&&!armor.critHealChance,'offense armor keeps capacity and has no lifesteal');}
function hit(critical=true,source='weapon'){shots=[{x:350,y:300,vx:0,vy:0,life:1,damage:1,pierce:1,critChance:critical?1:0,critMultiplier:2,source}];step(.001)}
setup();Math.random=()=>.999;hit(false);Math.random=()=>0;hit();
check(p.hp===1&&enemies[0].hp===97&&p.shield===0,'critical damages enemy without healing');
check(!cashPopups.some(q=>q.text==='吸血 +1'),'no healing feedback');
setup();hit(true,'drone');check(p.hp===1&&enemies[0].hp===98,'drone critical does not heal');
setup();enemies=[enemy(1)];hit();check(enemies.length===0&&p.hp===1&&cash===1,'critical kill still pays and does not heal');
setup();enemies=[enemy(1,'boss')];hit();check(state==='stageClear'&&p.hp===1&&cash===20,'boss critical kill preserves ending without healing');
const card=equipmentAttributeCard('armor',createArmor('wine'),'新装备');for(const label of ['夜宴礼服','暴击率+'])check(card.includes(label),'card explains '+label);Math.random=random;const index=ARMOR_TYPES.findIndex(e=>e.id==='wine');Math.random=()=> (index+.1)/ARMOR_TYPES.length;check(itemEquipment(equipmentShopItem('armor')).id==='wine','wine obtainable in blind box');Math.random=random;check(takeTestEquipment('armor','wine',3)&&armor.id==='wine','wine in test panel');reset();check(!armor&&!cashPopups.some(q=>q.text==='吸血 +1'),'reset removes suit and feedback');
console.log('Wine: crit scaling, weapon/drone/boss hit paths without healing, cards and pools passed');
}`,sandbox);

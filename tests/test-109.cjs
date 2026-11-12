const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);



vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
function close(a,b,m){check(Math.abs(a-b)<1e-7,m)}
function setup(tier=1){reset();state='combat';timedRoom={remaining:NORMAL_ROOM_TIME,spawnLeft:NORMAL_SPAWN_INTERVAL};p.y=300;equipItem('armor',createArmor('renewal',tier));p.hp=1;tiles=[];}
function pack(kind='medical',x=0){return {x,y:0,[kind]:true,healProgress:0,healFlash:0,medPack:true}}
for(let tier=1;tier<=5;tier++){setup(tier);check(p.hp===1&&!p.regenCharge,'equip does not heal');tiles=[pack()];updateHealing(.01);check(p.hp===3&&!tiles[0].medPack,'medical pickup restores two at every quality');p.hp=p.max-1;tiles=[pack()];updateHealing(.01);check(p.hp===p.max,'medical heal capped');p.hp=1;tiles=[pack('shieldTile')];updateHealing(.01);check(p.hp===1&&p.shield===1,'shield pickup does not heal');tiles=[pack('cashTile')];updateHealing(.01);check(p.hp===1&&cash===3,'cash pickup uses new base value');const rolled=rollEquipmentStats('armor',createArmor('renewal',tier));check(rolled.medicalHeal===2&&!rolled.regenInterval,'only medical healing remains across random rolls');}
setup();updateEquipmentEffects(60);check(p.hp===1,'combat has no passive healing');
state='survival';updateEquipmentEffects(60);check(p.hp===1,'survival has no passive healing');
grantHealthPickup();check(p.hp===3,'enemy health drop also heals two');
equipItem('armor',createArmor('shell'));p.hp=1;grantHealthPickup();check(p.hp===2,'ordinary heal resumes on swap');
setup();equipItem('shoes',createShoes('magnet'));tiles=[pack('medical',1)];updateHealing(.01);check(tiles[0].pickup&&p.hp===1,'flying medical pack gives no early heal');for(let i=0;i<100&&tiles[0].medPack;i++)updateHealing(.01);check(p.hp===3&&!tiles[0].medPack,'two health granted only on arrival');
const card=equipmentAttributeCard('armor',armor,'新装备');for(const label of ['暗红西装','医疗包回复至少2格生命'])check(card.includes(label),'card includes '+label);const random=Math.random,index=ARMOR_TYPES.findIndex(e=>e.id==='renewal');Math.random=()=> (index+.1)/ARMOR_TYPES.length;check(itemEquipment(equipmentShopItem('armor')).id==='renewal','renewal obtainable');Math.random=random;check(takeTestEquipment('armor','renewal',3)&&armor.medicalHeal===2,'renewal in test panel');reset();check(!armor&&!p.regenCharge,'restart clears regen');
console.log('Renewal: stronger medical packs and enemy health drops, no periodic healing, cap, swaps and equipment cards passed');
}`,sandbox);

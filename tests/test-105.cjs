const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);



vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
function close(a,b,m){check(Math.abs(a-b)<1e-8,m)}
check(ARMOR_TYPES.length===12&&!ARMOR_TYPES.some(e=>['phase','capacitor','critical'].includes(e.id)),'merged armor roster');
for(let tier=1;tier<=5;tier++){
 reset();const normal=movementSpeed();equipItem('armor',createArmor('shell',tier));
 close(movementSpeed(),normal*.8,'heavy armor slows at every quality');
 check(p.max===3+tier&&shieldMaximum()===2+2*tier,'heavy armor keeps high health and capacity');
 check(p.hp===3&&p.shield===0,'heavy armor does not refill on equip');
 const card=equipmentAttributeCard('armor',armor,'当前装备');check(card.includes('防弹毛衣')&&card.includes('移速-')&&card.includes('20%'),'penalty shown on card');
 mods.speed=1.3;equipItem('shoes',createShoes('runner',tier));close(movementSpeed(),195*1.3*(1+shoes.speedBonus)*.8,'shoe and permanent speed combine with penalty');
 equipItem('armor',createArmor('energy',tier));close(movementSpeed(),195*1.3*(1+shoes.speedBonus),'swapping removes penalty');
 check(p.max===3+[0,0,1,1,2][tier-1]&&shieldMaximum()===2+[4,4,5,5,6][tier-1],'energy trades one health capacity for two shield capacity');
 close(damageInvincibility(),2.3+.3*(tier-1),'energy greatly extends invincibility');
 state='combat';p.inv=0;p.shield=1;p.hp=6;p.max=6;hurt();close(p.inv,damageInvincibility(),'actual shield hit uses extended invincibility');
 check(p.shield===0&&p.hp===6,'last shield absorbs the full hit');
 p.inv=0;hurt();check(p.hp===2,'unshielded hit deals four damage');
 p.shield=0;p.shieldCharge=0;updateEquipmentEffects(armor.shieldInterval-.01);check(p.shield===0,'energy recharge waits');updateEquipmentEffects(.02);check(p.shield===1,'energy recharges');
 while(p.shield<shieldMaximum())updateEquipmentEffects(armor.shieldInterval);updateEquipmentEffects(armor.shieldInterval);check(p.shield===shieldMaximum()&&p.shieldCharge===0,'recharge cap');
 const rolled=rollEquipmentStats('armor',createArmor('shell',tier));check(rolled.speedPenalty===.2&&rolled.effectText,'random heavy armor preserves tradeoff');
 const energyCard=equipmentAttributeCard('armor',createArmor('energy',tier),'新装备');
 check(energyCard.includes('回复1格护盾')&&energyCard.includes('生命受伤×4'),'energy card includes recharge and health damage risk');
}
reset();equipItem('armor',createArmor('chrono'));check(armor.name==='黑色风衣'&&armor.timeStop,'renamed coat keeps slow motion');
const random=Math.random;for(let i=0;i<ARMOR_TYPES.length;i++){Math.random=()=> (i+.1)/ARMOR_TYPES.length;check(itemEquipment(equipmentShopItem('armor')).id===ARMOR_TYPES[i].id,'each remaining armor obtainable');}Math.random=random;
reset();close(movementSpeed(),195,'reset clears heavy armor penalty');
console.log('Armor merge, heavy movement tradeoff, energy hit protection/recharge, coat rename and shop cards passed');
}`,sandbox);

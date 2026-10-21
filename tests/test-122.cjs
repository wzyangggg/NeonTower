const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);



vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
reset();
for(const type of ARMOR_TYPES){
 const e=createArmor(type.id,3),html=equipmentAttributeCard('armor',e,'新装备');
 check(equipmentStatRows('armor',e).length===2,'armor only compares life and shield');
 const table=html.slice(html.indexOf('<dl'),html.indexOf('</dl>'));
 check((table.match(/<dt>/g)||[]).length===2&&!table.includes('受击无敌'),'zero stats retained, invulnerability outside table');
 check(html.indexOf('equipment-special-effects')>html.indexOf('</dl>'),'special effects below attributes');
 check(!html.slice(0,html.indexOf('<dl')).includes(e.effectText),'no title description');
 check(html.includes('受击无敌+')===(type.id==='energy'),'only armor with extended invulnerability shows bonus');
 for(let tier=1;tier<=5;tier++){equipItem('armor',rollEquipmentStats('armor',createArmor(type.id,tier)));check(damageInvincibility()===1.5+(armor.invBonus||0),'display matches actual invulnerability');if(type.id!=='energy')check(armor.invBonus===0,'ordinary armor shares baseline at every quality');}
}
const energy=createArmor('energy',3);energy.shieldInterval=11.37;energy.invBonus=1.27;
check(equipmentAttributeCard('armor',energy,'新装备').includes('11.37秒')&&equipmentAttributeCard('armor',energy,'新装备').includes('受击无敌+1.27秒'),'actual rolled recharge and invulnerability shown');
const concise=createArmor('ambush',3);concise.critChanceBonus=.328;concise.critDamageBonus=.425;
const conciseHtml=equipmentAttributeCard('armor',concise,'新装备');
for(const text of ['暴击率+32.8%','暴击伤害+42.5%','移速-15%'])check(conciseHtml.includes(text),'concise rolled stat '+text);
check(!conciseHtml.includes('不提供额外')&&!conciseHtml.includes('主武器与无人机'),'no redundant qualifiers');
check(equipmentSpecialEffects('armor',createArmor('purity')).join('')==='每层清理一个危险机关。','purity description exact');
equipItem('shoes',createShoes('steady',3));check(equipmentSpecialEffects('armor',energy)[0]==='受击无敌+1.27秒','armor card excludes current mount bonus');
const shoesCard=equipmentAttributeCard('shoes',createShoes('steady',3),'新装备');
check(!shoesCard.slice(shoesCard.indexOf('<dl'),shoesCard.indexOf('</dl>')).includes('受击无敌'),'shoe invulnerability is also special');
// Check every quality, including randomized shop stats, through the shared card renderer.
for(const [key,types,factory] of [['weapon',WEAPON_CATALOG,createWeapon],['armor',ARMOR_TYPES,createArmor],['shoes',SHOE_TYPES,createShoes],['drone',DRONE_TYPES,createDrone]]){
 for(const type of types)for(let tier=1;tier<=5;tier++){
  const item=rollEquipmentStats(key,factory(type.id,tier)),effects=equipmentSpecialEffects(key,item),card=equipmentAttributeCard(key,item,'新装备');
  check(effects.every(text=>typeof text==='string'&&text.length<=65),'compact effect lines '+key+':'+type.id);
  check(!/undefined|NaN|IK|霓虹装饰|星屑|适合搭配|发光翼灯/.test(card),'no visual prose or invalid stats '+type.id);
  if(key==='shoes'&&item.attackSpeedBonus)check(card.includes('攻速 +'+equipmentNumber(item.attackSpeedBonus*100)+'%'),'actual scaled attack bonus');
  if(item.critChanceBonus)check(card.includes('暴击率'+(key==='shoes'?' ':'')+'+'+equipmentNumber(item.critChanceBonus*100)+'%'),'actual rolled crit bonus');
 }
}
console.log('Armor common attributes, zero values, prose effects after attributes, actual rolled values and title cleanup passed');
}`,sandbox);

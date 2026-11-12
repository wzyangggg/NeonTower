const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);





vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
function setup(){delete globalThis.TalentRuntime;reset();sound=false;paused=false;state='combat';p.inv=999;spawnQueue=[];enemies=[];resetStageStats();}
function victim(extra={}){return {x:325,y:300,type:'eye',r:16,hp:0,max:10,...extra};}
const originalRandom=Math.random;
let balance=0;
const wallet={level(){return 0},finish(){},overlay(){},store:{credit(points){balance+=points;return true}},refreshHud(){}};
setup();Math.random=()=>0;
for(let i=0;i<10;i++)recordStageKill(victim());
check(enemyChests.length===0&&stageStats.chestsDropped===0&&stageStats.loot.length===0,'equipment drops disabled even at guaranteed roll');
check(enemyBuffs.length>0&&stageStats.defeated.size===10,'supplies and kill counts remain active');
Math.random=originalRandom;
for(let level=1;level<=5;level++){shopLevel=level;for(let i=0;i<50;i++){const u=randomEquipmentShopItem(),tier=itemEquipment(u).tier;check(tier<=level&&tier>=Math.max(1,level-1),'all slots match current shop tier');}}
setup();globalThis.TalentRuntime=wallet;shopLevel=2;const items=[equipmentShopItem('armor'),equipmentShopItem('armor'),equipmentShopItem('weapon')];for(const u of items)u.price=0;for(const item of items)collectEnemyChest({item});cash=37;state='stageClear';stageSettlement={ready:true,finalCampaign:false};prepareStageLoot();check(stageSettlement.lootReveal.queue.length===3&&stageSettlement.lootReveal.queue[0].html.includes(itemEquipment(items[0]).name),'result queues actual equipment');check(continueStageResult()&&pendingEquipment.source==='chest','continue opens first comparison');check(pendingEquipment.position===1&&pendingEquipment.total===3,'queue progress');leaveShop();check(floor===1&&pendingEquipment,'cannot skip queue');check(confirmEquipmentPurchase()&&armor.name===itemEquipment(items[0]).name,'first equips for free');check(pendingEquipment.item===items[1],'next item follows');check($('overlay').innerHTML.includes('当前装备'),'second compares with newly equipped gear');check($('overlay').innerHTML.includes('放弃装备')&&!$('overlay').innerHTML.includes('卖出'),'discard replaces selling');check(cancelEquipmentPurchase()&&!items[1].sold&&balance===0,'discard does not credit wallet');check(pendingEquipment.item===items[2],'third follows decline');check(confirmEquipmentPurchase()&&state==='upgrade'&&floor===1&&!pendingEquipment&&!chestEquipmentQueue.length,'opens shop after all choices');check(cash===37&&items[0].equipped&&items[2].equipped,'no charges or auto-sales');check(!confirmEquipmentPurchase(),'stale final confirmation cannot repeat');
setup();globalThis.TalentRuntime=wallet;state='stageClear';stageStats.loot=[equipmentShopItem('bomb')];stageSettlement={ready:true,finalCampaign:true};let won=0;const victory=showCampaignVictory;showCampaignVictory=()=>{won++;state='won'};continueStageResult();check(won===0&&pendingEquipment.source==='chest','final victory also waits for loot');cancelEquipmentPurchase();check(balance===0&&won===1&&state==='won','final victory resumes after claims');showCampaignVictory=victory;
setup();Math.random=()=>0;recordStageKill(victim());Math.random=originalRandom;reset();check(!enemyChests.length&&!chestEquipmentQueue.length&&stageStats===null&&!pendingEquipment,'restart clears all loot state');
console.log('Enemy chests: equipment drops disabled, supplies retained, no sale credit, legacy loot equip/discard, shop and final victory continuation passed');
}`,sandbox);

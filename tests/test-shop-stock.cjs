const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);



vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
reset();state='upgrade';cash=999;tiles=[{x:0,y:0,trap:{clock:0}}];
check(typeof PASSIVE_ITEMS==='undefined'&&typeof passiveBonus==='undefined','removed passive catalog and stat hooks');
const seen=new Set();for(let level=1;level<=5;level++){shopLevel=level;for(let i=0;i<300;i++){rollShop();check(shopItems.length===3,'three real goods');for(const u of shopItems){check(u.key==='drink'||EQUIPMENT_LABELS[u.key],'only equipment and drinks even with a hazard on the map');seen.add(u.key);check(Number.isFinite(u.price)&&u.price>0,'valid price');if(EQUIPMENT_LABELS[u.key])check(itemEquipment(u).tier<=level,'equipment quality still follows shop');}}}
check(Object.keys(EQUIPMENT_LABELS).every(k=>seen.has(k))&&seen.has('drink'),'equipment and drinks are available');
const staleDemolition={key:'erase',amount:1,price:8,locked:true};shopItems[0]=staleDemolition;
rollShop();check(shopItems[0]!==staleDemolition,'locked demolition is replaced');
renderShop();check(!$('overlay').innerHTML.includes('passive-inventory')&&!$('overlay').innerHTML.includes('passive-card'),'removed passive shop UI');check(!$('overlay').innerHTML.includes('terrain-owned')&&!$('overlay').innerHTML.includes('地块加成')&&!$('overlay').innerHTML.includes('应急修复'),'ordinary shop has no removed bonus/repair display or entry');
reset();check(movementSpeed()===195&&attackSpeedMultiplier()===1&&supplyPickupRadius()===20,'base stats unaffected');check(resolveShotDamage({},100,null).damage===100,'base damage unchanged');check(DRINK_TYPES.length===16&&TERRAIN_CATALOG.some(d=>d.kind==='稀有被动'),'other passive systems retained');
// Locking keeps the rolled object, stats and price across every stock refresh path.
reset();state='upgrade';cash=9999;rollShop();const kept=shopItems[0],other=shopItems[1],wallet=cash;
check(toggleShopItemLock(0)&&kept.locked&&cash===wallet&&!kept.sold,'locking never purchases');
check($('overlay').innerHTML.includes('class="shop-lock"')&&$('overlay').innerHTML.includes('aria-pressed="true"'),'independent accessible lock button');check($('overlay').innerHTML.includes('data-lock-state="locked"')&&$('overlay').innerHTML.includes('data-lock-state="unlocked"'),'lock controls show closed and open lock icons');
const oldPrice=kept.price,oldEquipment=itemEquipment(kept);check(rerollShop()&&shopItems[0]===kept&&shopItems[1]!==other,'reroll preserves only locked slot');
check(upgradeShop()&&shopLevel===2&&shopItems[0]===kept&&kept.price===oldPrice&&itemEquipment(kept)===oldEquipment,'upgrade preserves original locked offer');
leaveShop();check(state==='descent','leave locked stock');state='upgrade';shopRefreshes=0;rollShop();check(shopItems[0]===kept,'restocking keeps locked offer');
check(toggleShopItemLock(0)&&!kept.locked,'unlock');rollShop();check(shopItems[0]!==kept,'unlocked offer refreshes');
const sold=shopItems[0];toggleShopItemLock(0);check(buyShopItem(0)&&sold.sold,'can buy locked offer');if(pendingEquipment)confirmEquipmentPurchase();check(!toggleShopItemLock(0),'sold offer cannot toggle');rollShop();check(shopItems[0]!==sold,'purchased locked stock refills');
const blocked=shopItems[0];pendingEquipment={};check(!toggleShopItemLock(0),'comparison prevents locking');pendingEquipment=null;
for(const key of ['heal','terrainPassive']){const u={key,terrainId:TERRAIN_CATALOG.find(d=>d.kind==='稀有被动').id,price:1,sold:false};shopItems=[u];const money=cash;check(!shopUsable(u)&&!buyShopItem(0)&&money===cash,'removed stale offer cannot charge '+key);}
for(let i=0;i<200;i++)check(rewardOptions().every(u=>u.key!=='heal'),'no emergency repair in room rewards');
check(equipmentShopCategories('weapon',createWeaponModel('smg_t2'))[0]==='重武器'&&shopItemIcon({key:'weapon',equipment:createWeaponModel('smg_t2')}).includes('equipment-icons/smg_t2-48.png'),'AK47 uses its model icon');
for(const id of ARMOR_TYPES.map(e=>e.id)){const e=createArmor(id,3),palette=armorVisualPalette(e);equipItem('armor',e);renderShop();check($('overlay').innerHTML.includes('equipment-icons/'+(e.iconId||id)+'-48.png'),'loadout uses actual armor icon '+id);const oldBox=renderer.box,colors=[];renderer.box=function(...args){colors.push(args[6]);return oldBox.apply(this,args)};try{drawEquipmentModels()}finally{renderer.box=oldBox;}check(colors.includes(palette.body)&&colors.includes(palette.trim),'worn armor uses shared palette '+id);}
reset();check(!shopItems.length,'restart clears locked stock');
console.log('Shop stock: removed small passives; three slots, all equipment tiers, lock/reroll/upgrade/cross-room/restart lifecycle, no terrain bonuses or repairs, AK47 rifle icon and base stats passed');
}`,sandbox);

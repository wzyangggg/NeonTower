const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);



vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
function weaponItem(tier=1){return {key:'weapon',weapon:createWeapon('pulse',tier)}}
// Measure the actual floor roster and payout path, including survival bonuses.
function income(f){reset();floor=f;startWave();if(campaignBoss){state='combat';finishCampaignBoss();return cash}if(greedRoom){finishBossIntro();for(const e of greedRoom.spiders){shots=[{beam:true,arc:true,radial:true,arcTargets:[e],originX:e.x,originY:e.y,x:e.x,y:e.y,vx:0,vy:0,life:.05,damage:9999,pierce:9,hitTargets:new Set()}];step(.001)}step(stageClearLeft);return cash}if(f%4===0){finishBossIntro();finishSurvival();step(stageClearLeft);return cash}const roster=[...enemies,...spawnQueue];state='combat';spawnQueue=[];shootTimer=999;enemies=roster.map((e,i)=>({type:e.type,x:450,y:300,homeX:450,homeY:300,hp:1,max:1,r:14,t:0,fire:999,seed:0}));shots=enemies.map(e=>({x:e.x,y:e.y,vx:0,vy:0,life:1,damage:1,pierce:1,hitTargets:new Set()}));step(.001);return cash}
check(SHOP_UPGRADE_COSTS.join(',')==='40,60,100,150','requested upgrade curve');
const incomes=Array.from({length:24},(_,i)=>income(i+1));check(incomes.slice(0,4).join(',')==='32,32,32,28','finite reinforcement pool maximum earned income');
// Contact-heavy rosters retain their no-bounty rule; a weapon then level 2 is affordable by floor 2.
reset();state='upgrade';cash=incomes[0];let u=weaponItem();u.price=shopPrice(u);u.sold=false;shopItems=[u];check(buyShopItem(0)&&confirmEquipmentPurchase(),'first-floor weapon affordable');const firstBalance=cash;leaveShop();cash+=incomes[1];state='upgrade';check(upgradeShop(),'weapon purchase and level 2 by floor 2');check(shopLevel===2&&cash===incomes[0]+incomes[1]-12-40&&firstBalance===incomes[0]-12,'early purchase budget');
// Frequent purchases and refreshes now compete with late shop upgrades.
reset();let spent=0,upgradedAt=[];for(let i=0;i<incomes.length;i++){floor=i+1;state='upgrade';cash+=incomes[i];shopItems=[{key:'floor',name:'扩建',amount:6,price:shopPrice({key:'floor'}),sold:false}];if(shopUsable(shopItems[0])&&cash>=shopItems[0].price){const price=shopItems[0].price;check(buyShopItem(0),'regular floor purchase');spent+=price}if(i%2===0&&cash>=SHOP_REROLL_BASES[shopLevel-1]){shopRefreshes=0;const price=shopRerollCost();check(rerollShop(),'occasional refresh affordable');spent+=price}if(shopLevel<SHOP_MAX_LEVEL&&cash>=shopUpgradeCost()){const price=shopUpgradeCost();check(upgradeShop(),'upgrade transaction');spent+=price;upgradedAt.push(floor)}}check(shopLevel>=3&&cash===incomes.reduce((a,b)=>a+b,0)-spent,'regular spending and hunt income preserve progression/accounting');
reset();for(let i=0;i<incomes.length;i++){floor=i+1;state='upgrade';cash+=incomes[i];if(shopLevel<SHOP_MAX_LEVEL&&cash>=shopUpgradeCost())check(upgradeShop(),'saving permits upgrade')}check(shopLevel===5,'max shop remains attainable without cash tiles when saving');
// All equipment follows the shop-level markup; depth still has a cap.
for(const key of Object.keys(EQUIPMENT_LABELS)){for(let tier=1;tier<=5;tier++){const item=key==='weapon'?weaponItem(tier):{key,equipment:key==='armor'?createArmor('shell',tier):key==='shoes'?createShoes('runner',tier):createDrone('pulse',tier)};floor=1;shopLevel=1;const price=shopPrice(item);shopLevel=5;check(shopPrice(item)===price*4,'level five equipment markup');floor=99;check(shopPrice(item)===price*4+3,'late-floor markup cap');if(tier>1){const previous=key==='weapon'?weaponItem(tier-1):{key,equipment:key==='armor'?createArmor('shell',tier-1):key==='shoes'?createShoes('runner',tier-1):createDrone('pulse',tier-1)};check(shopPrice(item)>shopPrice(previous),'higher quality costs more')}}}
floor=1;shopLevel=1;check(shopPrice({key:'heal'})===4&&shopPrice({key:'floor'})===8,'basic survival supplies affordable');check(shopPrice({key:'floor',penalty:'trap'})<shopPrice({key:'floor'}),'risky goods discount retained');
// An economic tile costs several production cycles; shop time produces no income.
reset();state='upgrade';cash=24;const cashItem={key:'cashTile',name:'印钞地板',amount:1,price:shopPrice({key:'cashTile'}),sold:false};shopItems=[cashItem];check(buyShopItem(0)&&cash===6,'cash tile purchase');step(60);check(cash===6&&!tiles.some(t=>t.cashTile),'no money production while shopping');leaveShop();step(.72);step(.55);step(TERRAIN_FLASH_TIME);const t=tiles.find(t=>t.cashTile);p.x=325+t.x*TILE;p.y=300+t.y*TILE;for(let i=0;i<3;i++){updateHealing(30);updateHealing(.001)}check(cash===15,'cash tile yields 9 dollars in three 30-second cycles');updateHealing(30);updateHealing(.001);check(cash===18,'cash tile yields 12 dollars after four pickups');
reset();state='upgrade';cash=39;shopItems=[weaponItem()];check(!upgradeShop()&&cash===39&&shopLevel===1,'insufficient upgrade money unchanged');cash=40;check(upgradeShop()&&cash===0&&shopLevel===2,'exact upgrade funds');shopLevel=5;cash=100;check(!upgradeShop()&&cash===100&&shopUpgradeCost()===0,'max shop cannot charge');shopRefreshes=0;cash=40;check(shopRerollCost()===26&&rerollShop()&&cash===14&&shopRerollCost()===40,'level five refresh cost advances');reward();check(shopRerollCost()===26,'new shop resets refresh count at current level');
// Check displayed prices and exact/insufficient funds through actual transactions at every level.
for(let level=1;level<=5;level++){
 reset();state='upgrade';shopLevel=level;floor=1;shopRefreshes=0;
 const starts=[5,8,12,18,26],steps=[3,5,7,10,14];
 check(shopRerollCost()===starts[level-1],'first refresh price '+level);
 cash=starts[level-1]-1;check(!rerollShop()&&cash===starts[level-1]-1&&shopRefreshes===0,'insufficient refresh funds '+level);
 cash=starts[level-1];check(rerollShop()&&cash===0&&shopRefreshes===1&&shopRerollCost()===starts[level-1]+steps[level-1],'exact refresh payment '+level);
 check($('overlay').innerHTML.includes('每次刷新涨价 $'+steps[level-1]),'visible refresh increment '+level);
 for(const d of DRINK_TYPES)check(drinkShopItem(d.id).price===shopPrice({key:'drink',drinkId:d.id}),'direct drink price matches rolled price');
 const healPrices=[4,6,8,12,16],floorPrices=[8,12,16,23,32];
 check(shopPrice({key:'heal'})===healPrices[level-1]&&shopPrice({key:'floor'})===floorPrices[level-1],'supply curve '+level);
 const item={key:'floor',name:'扩建',amount:6,price:floorPrices[level-1],sold:false};shopItems=[item];cash=item.price-1;
 check(!buyShopItem(0)&&!item.sold&&cash===item.price-1,'insufficient goods funds '+level);
 cash=item.price;check(buyShopItem(0)&&item.sold&&cash===0,'exact goods payment '+level);
 const drinkPrice=shopPrice({key:'drink',drinkId:DRINK_TYPES[0].id});if(level===5)check(drinkPrice===DRINK_TYPES[0].price*4,'level five drink markup');
 const penaltyPrice=shopPrice({key:'floor',penalty:'trap'});check(penaltyPrice<floorPrices[level-1],'risk discount at every level');
}
console.log('Economy: floor incomes '+incomes.join('/')+'; buying each floor reaches upgrades on B'+upgradedAt.join('/B')+'; capped prices, cash-tile payback and transaction limits passed');
}`,sandbox);

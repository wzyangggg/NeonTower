const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);



const audit=require('../tools/audit-economy.cjs');
const assert=require('node:assert/strict');
assert.deepEqual(Array.from(audit.baseline.upgrades),[4,9,15,23]);
assert.deepEqual(Array.from(audit.upgradeCosts),[187,267,667,1067]);
assert.ok(audit.rows[0].income<audit.upgradeCosts[0],'first-floor full clear cannot buy an upgrade');
assert.ok(audit.perfect.upgrades[3]>=10,'perfect clear cannot max the shop in early chapters');
assert.ok(audit.sameOutputHoard.upgrades[3]>=20,'saving alone does not bypass the late-game curve');
assert.ok(audit.baseline.spent>400&&audit.baseline.upgrades.length===4,'regular goods and rerolls fit target progression');
assert.ok(audit.hoard.upgrades[3]>audit.baseline.upgrades[3],'low-output hoarding gives up earning power');
assert.ok(audit.outputComparison.sameShopTierPurchase.cash>audit.outputComparison.starter.cash,'fixed-seed same-tier weapon improvement increases actual kill income');
vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
for(let level=1;level<5;level++){
 reset();state='upgrade';terrainView='equipment';shopLevel=level;cash=shopUpgradeCost()-1;const short=cash;
 check(!upgradeShop()&&cash===short&&shopLevel===level,'insufficient upgrade is atomic');
 cash=shopUpgradeCost();check(upgradeShop()&&cash===0&&shopLevel===level+1,'exact upgrade payment');
}
reset();state='upgrade';terrainView='equipment';shopLevel=5;cash=100;check(!upgradeShop()&&cash===100,'max shop cannot charge');
for(let level=1;level<=5;level++)for(const key of Object.keys(EQUIPMENT_PRICES)){
 reset();state='upgrade';terrainView='equipment';shopLevel=level;
 const equipment=key==='weapon'?createWeaponModel(WEAPON_MODELS.find(m=>m.tier===level).id):key==='armor'?createArmor('shell',level):key==='shoes'?createShoes('runner',level):key==='drone'?createDrone('pulse',level):createBomb('tower',level),offer={key,equipment,blindBox:true,opened:false,sold:false};
 offer.price=shopPrice(offer);const [base,step]=EQUIPMENT_PRICES[key],oldPrice=Math.ceil((base+(level-1)*step)*SHOP_PRICE_MULTIPLIERS[level-1])+shopDepthMarkup();check(offer.price===oldPrice*(key==='weapon'?2:1),'only weapon price doubles after rounding and depth');shopItems=[offer];cash=offer.price-1;const short=cash;
 check(!buyShopItem(0)&&cash===short,'insufficient goods atomic');cash=offer.price;
 check(buyShopItem(0)&&cash===0&&confirmEquipmentPurchase(),'affordable concrete equipment purchase');
}
check(enemyKillReward({type:'eye',max:4,hp:-999})===1&&enemyKillReward({type:'eye',max:16})===2&&enemyKillReward({type:'ironball',max:36})===3,'health-weighted integer rewards');
for(let hp=1;hp<500;hp++)check(enemyKillReward({type:'eye',max:hp+1})>=enemyKillReward({type:'eye',max:hp}),'bounty monotone in max HP');
check(enemyKillReward({type:'eye',max:64,hp:-1000})===enemyKillReward({type:'eye',max:64,hp:1}),'overkill does not lower bounty');
}`,sandbox);
console.log('Economy progression:',JSON.stringify({costs:audit.upgradeCosts,baseline:audit.baseline.upgrades,perfect:audit.perfect.upgrades,hoard:audit.hoard.upgrades,oneMiner:audit.oneMiner.upgrades,prices:audit.prices}));

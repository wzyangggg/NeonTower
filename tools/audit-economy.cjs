const fs=require('node:fs'),vm=require('node:vm');
const elements={};const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/hex-map.js','utf8')+'\n'+fs.readFileSync('dist/terrain-generators.js','utf8'),sandbox);for(const file of ['music','renderer','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss','electric-tiles'])vm.runInContext(file==='game'?require('../dist/hex-map.js').transform(fs.readFileSync('dist/game.js','utf8')):fs.readFileSync('dist/'+file+'.js','utf8'),sandbox);
vm.runInContext(`{
function hpOf(e){return e.max??(isMeleeEnemy(e)?normalMeleeHealth(e.type)*(e.bridgeRoller&&e.type==='ironball'?2.5:1):rangedEnemyHealth(e.type));}
const rows=[];
for(let f=1;f<=33;f++){
 reset();floor=f;startWave();
 let kind='normal',pool=0,oldIncome=0,income=0,duration=0;
 if(campaignBoss){kind='boss';oldIncome=income=20;}
 else if(isDrinkFloor()){kind='drink';}
 else if(sawRoom){kind='saw';oldIncome=income=20+f*2;duration=sawRoom.duration;}
 else if(timedRoom){const roster=[...enemies,...spawnQueue];pool=roster.length;duration=timedRoom.duration;oldIncome=pool*2;income=roster.reduce((n,e)=>n+enemyKillReward({...e,max:hpOf(e)}),0);}
 rows.push({floor:f,kind,pool,oldIncome,income,duration});
}
function simulate(ratio,buy=true,miners=0,costs=SHOP_UPGRADE_COSTS){
 let wallet=0,level=1,spent=0,mined=0,upgrades=[],ledger=[];
 for(const row of rows.filter(r=>r.floor<=30)){
  floor=row.floor;shopLevel=level;
  const earned=row.kind==='normal'?Math.round(row.income*ratio):row.income,mine=miners*Math.floor(row.duration/ElectricTiles.defs.miner.interval)*ElectricTiles.defs.miner.amount;
  wallet+=earned+mine;mined+=mine;
  if(buy&&floor%2===0){const price=Math.round(Object.keys(EQUIPMENT_PRICES).reduce((n,key)=>n+shopPrice({key,equipment:{tier:level}}),0)/5);if(wallet>=price){wallet-=price;spent+=price;}}
  if(buy&&floor%3===0&&wallet>=SHOP_REROLL_BASES[level-1]){wallet-=SHOP_REROLL_BASES[level-1];spent+=SHOP_REROLL_BASES[level-1];}
  while(level<5&&wallet>=costs[level-1]){wallet-=costs[level-1];upgrades.push(floor);level++;}
  ledger.push({floor,earned,mine,wallet,level});
 }
 return {ratio,buy,miners,upgrades,wallet,spent,mined,ledger};
}
const baseline=simulate(.6),perfect=simulate(1),hoard=simulate(.4,false),sameOutputHoard=simulate(.6,false),oneMiner=simulate(.6,true,1);
function benchmarkWeapon(id){
 const random=Math.random;let seed=8723;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 try{reset();tiles=HexMap.campaignFloor('economy-output');clearBridgeRoom(true);testMode=true;floor=1;startWave();step(1);p.inv=999;weapon=createWeaponModel(id);shootTimer=0;for(let i=0;i<2000&&state==='combat';i++)step(.01);return {item:id,cash,kills:stageResultStats().defeated,total:stageResultStats().total};}finally{Math.random=random;}
}
const outputComparison={starter:benchmarkWeapon('pistol_t1'),sameShopTierPurchase:benchmarkWeapon('sword_t1'),cost:shopPrice({key:'weapon',equipment:createWeaponModel('sword_t1')})};
let oldWallet=0,oldLevel=1;const oldRush=[];for(const row of rows.filter(r=>r.floor<=30)){oldWallet+=row.oldIncome;while(oldLevel<5&&oldWallet>=[40,60,100,150][oldLevel-1]){oldWallet-=[40,60,100,150][oldLevel-1];oldLevel++;oldRush.push(row.floor);}}
const prices=[];for(let level=1;level<=5;level++){shopLevel=level;floor=1;prices.push({level,...Object.fromEntries(Object.keys(EQUIPMENT_PRICES).map(key=>[key,shopPrice({key,equipment:{tier:level}})]))});}
globalThis.economyAudit={assumptions:{horizon:30,baselineBountyShare:.6,buyEveryFloors:2,rerollEveryFloors:3,baselineMiners:0,modifiers:false,note:'Income ceiling uses the entire finite roster, not guaranteed in-timer kills; boss rows count the fixed completion bonus only. Purchases use rounded mean current-tier price. Miner sensitivity assumes timely pickup and full timer.'},upgradeCosts:[...SHOP_UPGRADE_COSTS],prices,rows,baseline,perfect,hoard,sameOutputHoard,oneMiner,outputComparison,oldRush};
}`,sandbox);
module.exports=sandbox.economyAudit;
if(require.main===module){const {assumptions,upgradeCosts,prices,rows,outputComparison,oldRush,...runs}=module.exports;console.log(JSON.stringify({assumptions,upgradeCosts,prices,outputComparison,oldRush,scenarios:Object.fromEntries(Object.entries(runs).map(([key,{ledger,...run}])=>[key,run])),rows},null,2));}

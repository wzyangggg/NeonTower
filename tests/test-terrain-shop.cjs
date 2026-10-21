const fs=require('node:fs'),vm=require('node:vm');
const elements={};const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);for(const file of ['music','renderer','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss'])vm.runInContext(fs.readFileSync('dist/'+file+'.js','utf8'),sandbox);
vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}function near(a,b,m){check(Math.abs(a-b)<1e-7,m+': '+a+' / '+b)}
function setup(){reset();startWave();p.y=300;p.inv=999;shootTimer=999;turrets=[];}
function tile(kind,x=0){return {x,y:0,[kind]:true,healProgress:0,healFlash:0,medPack:false};}
function give(...names){for(const name of names)check(grantTerrainPassive(name),'grant '+name)}
function supply(kind,amount,tileKind='medical'){const t=tile(tileKind);t.supplyQueue=[{kind,amount}];t.medPack=true;tiles=[t];p.x=325;p.y=300;return t;}
function enemy(x=450,y=300){return {type:'eye',x,y,homeX:x,homeY:y,hp:100,max:100,r:14,t:0,fire:99,seed:0};}
check(TERRAIN_CATALOG.length===39&&new Set(TERRAIN_CATALOG.map(d=>d.id)).size===39,'39 unique reviewed products');
check(TERRAIN_CATALOG.every(d=>d.desc.length<=16&&d.implementation.length>d.desc.length),'separate short player text and implementation');
// Unified gold shop and separate bar lifecycle.
setup();floor=2;reward();check(terrainView==='equipment'&&$('overlay').innerHTML.includes('普通商店')&&!$('overlay').innerHTML.includes('酒吧层')&&!barItems.length,'even floor opens ordinary shop without bar');cash=100;
check(buyShopExpansion()&&cash===92&&shopTerrainPlan.tiles.length===12,'gold expansion reserves terrain');
pendingEquipment={};leaveShop();check(state==='upgrade'&&floor===2,'pending comparison blocks exit');pendingEquipment=null;leaveShop();check(state==='descent'&&floor===3,'ordinary exit descends once');leaveShop();check(floor===3,'cannot exit twice');
setup();reward();check(terrainView==='equipment','odd floor ordinary directly');
for(const d of TERRAIN_CATALOG){
 reset();state='upgrade';cash=999;if(d.kind==='拆除')addTrap();
 const key=d.kind==='稀有被动'?'terrainPassive':d.kind==='拆除'?'erase':terrainItemKey(d);
 if(d.fixed){check(buyShopExpansion(),'permanent expansion');continue;}
 const u={key,terrainId:d.id,name:d.name,desc:d.desc,amount:1};u.price=shopPrice(u);u.sold=false;shopItems=[u];
 check(buyShopItem(0)&&cash===999-u.price,'actual gold purchase '+d.name);const wallet=cash;check(!buyShopItem(0)&&cash===wallet,'no duplicate charge');
 if(d.kind==='稀有被动'){check(terrainHas(d.name)&&!terrainDefUsable(d)&&pendingEquipment?.passive,'one-time passive reveal');check(confirmEquipmentPurchase(),'dismiss paid passive');}
}
for(let level=1;level<=5;level++){
 reset();state='upgrade';cash=999;shopLevel=level;const count=tiles.length,offer=shopExpansion();
 check(offer.amount===level+2&&offer.price===shopPrice({key:'floor'}),'shop level increases expansion without extra pack charge');
 check(buyShopExpansion()&&cash===999-offer.price&&shopTerrainPlan.tiles.length===count+offer.amount&&tiles.length===count,'purchase reserves the advertised number of tiles once');
 terrainChange=shopTerrainPlan;shopTerrainPlan=null;finishTerrainChange();check(tiles.length===count+offer.amount,'landing commits upgraded expansion');
 reset();state='upgrade';cash=100;shopLevel=level;tiles=[];for(let y=grid.minY;y<=grid.maxY;y++)for(let x=grid.minX;x<=grid.maxX;x++)tiles.push({x,y});tiles.pop();
 const partial=shopExpansion();check(partial.amount===1&&partial.price===Math.ceil(shopPrice({key:'floor'})/(level+2))&&buyShopExpansion()&&cash===100-partial.price,'partial map charges level-adjusted partial price');
 check(!buyShopExpansion()&&shopExpansion().amount===0&&shopExpansion().price===0,'reserved full map rejects expansion');
}
setup();give('钱袋许可','流水作业');check(!terrainHas('钱袋许可')&&terrainHas('流水作业')&&!terrainDefUsable(terrainDef('钱袋许可')),'exclusive replacement and no buyback');
setup();const plannedMed=tiles.find(t=>t.medical);plannedMed.healProgress=15;state='upgrade';applyReward({key:'floor',amount:3,name:'扩建'});give('急救箱');near(plannedMed.healProgress,22.5,'actual producer keeps percentage');near(shopTerrainPlan.tiles.find(t=>t.medical).healProgress,22.5,'reserved terrain keeps percentage');terrainChange=shopTerrainPlan;shopTerrainPlan=null;finishTerrainChange();near(tiles.find(t=>t.medical).healProgress,22.5,'landing cannot undo passive progress');
// Base production, stock capacity, item snapshots and accelerated cycles.
setup();let t=tile('medical');tiles=[t];p.x=525;updateHealing(29.99);check(!t.medPack,'medical not early');updateHealing(.01);check(t.medPack&&terrainQueue(t).length===1,'medical at 30');give('储药柜');check(t.healProgress===0,'capacity purchase cannot mint free item');updateHealing(60);check(terrainQueue(t).length===3,'three medical inventory slots');p.x=325;updateHealing(0);check(terrainQueue(t).length===2,'one pickup at a time');updateHealing(.49);check(terrainQueue(t).length===2,'per-tile pickup delay');updateHealing(.01);check(terrainQueue(t).length===1,'pickup at half second');
setup();t=tile('medical');tiles=[t];give('急救箱');check(supplyTime(t)===45,'box production penalty');give('快速制药');near(supplyTime(t)/productionMultiplier(t),36,'box and speed multiply');
setup();t=tile('shieldTile');tiles=[t];give('超载电池','备用电池仓','快速充能');p.x=525;updateHealing(64);check(terrainQueue(t).length===2&&terrainQueue(t)[0].amount===2,'battery production and inventory');
setup();t=supply('medical',2);give('溢出疗法','药品回收');p.hp=p.max;p.shield=shieldMaximum()-1;terrainTakeSupply(t);check(p.shield===shieldMaximum()&&cash===2,'overflow first shields then converts only remainder');
setup();t=supply('medical',2);give('药品回收');p.hp=p.max;campaignBoss=1;terrainTakeSupply(t);check(cash===0,'boss cannot recycle medicine for money');
setup();t=supply('shield',2,'shieldTile');give('护盾回收','静电释放','屏障投射器');p.shield=shieldMaximum();bullets=[{x:325,y:300,r:3},{x:550,y:500,r:3}];updateHealing(.01);check(cash===4&&bullets.length===1&&terrainRun.field===3,'full shield pickup, overflow and pickup buffs');
setup();t=supply('shield',2,'shieldTile');give('护盾回收');p.shield=shieldMaximum();campaignBoss=1;updateHealing(.01);check(t.medPack&&cash===0,'boss full shield recycle disabled');
// Rare replacements, explicit dangerous pickup and bounded permanent growth.
const random=Math.random;
setup();t=tile('medical');tiles=[t];give('肾上腺素','营养汤剂');p.x=525;Math.random=()=>.05;updateHealing(30);Math.random=random;
check(terrainQueue(t)[0].kind==='adrenaline','adrenaline production chance');p.x=325;p.shield=2;updateHealing(.01);check(p.hp===3&&p.shield===2&&t.medPack,'dangerous supply cannot be auto-consumed');check(useTerrainAdrenaline()&&p.hp===1&&p.shield===0&&terrainRun.adrenaline===1,'explicit sacrifice clears hp and shield');near(terrainRun.move,.08,'permanent move');near(terrainRun.attack,.12,'permanent attack');
terrainRun.adrenaline=3;Math.random=()=>.05;check(makeTerrainSupply(t).kind==='nutrition','adrenaline cap exits replacement pool');campaignBoss=1;check(makeTerrainSupply(t).kind==='medical','boss generates no permanent-growth replacement');Math.random=random;
setup();give('营养汤剂','急救箱');Math.random=()=>.1;const soup=makeTerrainSupply(tile('medical'));Math.random=random;check(soup.kind==='nutrition'&&soup.amount===.02,'box doubles soup gain');t=supply('nutrition',.02);for(let i=0;i<15;i++)terrainConsumeSupply(t,{kind:'nutrition',amount:.02});near(terrainRun.nutrition,.2,'soup capped at 20 percent');near(terrainRun.move,.2,'no excess move gain');
// Slowing affects world/projectiles while player movement and room/cash clocks stay normal.
setup();give('时间药丸');t=supply('medical',1);terrainTakeSupply(t);tiles=Array.from({length:9},(_,i)=>({x:i%3-1,y:Math.floor(i/3)-1}));p.x=325;p.y=300;keys.d=true;const before=p.x;bullets=[{x:500,y:300,vx:-100,vy:0,r:3,life:10}];step(.1);near(p.x-before,19.5,'player movement normal');near(bullets[0].x,496.5,'enemy bullet slowed');near(timedRoom.remaining,29.9,'timer normal');keys.d=false;
// Industrial conversion and shock follow-up events cannot advance production recursively.
setup();give('工业转型','超载电池','激发','余震模块','驻留力场','冲击模块','震荡手雷');p.shield=shieldMaximum();t=tile('shieldTile');check(makeTerrainSupply(t).kind==='shock','full shield produces shock');p.shield--;check(makeTerrainSupply(t).kind==='shield','missing shield produces battery');
t=supply('shock',0,'shieldTile');const med=tile('medical',1);tiles.push(med);const e=enemy(375,300),boss={...enemy(400,400),type:'humanoid'};enemies=[e,boss];bullets=[{x:0,y:0}];terrainTakeSupply(t);check(!bullets.length&&e.terrainStun===1.2&&!boss.terrainStun&&terrainRun.echoes.length===1&&terrainRun.areas.length===1,'shock effects apply to mobs, not boss');check(med.healProgress===0&&terrainRun.exciteLock===0,'produced shock cannot trigger excite');
terrainEmitShock(325,300,'tile',{});check(med.healProgress===3&&terrainRun.exciteLock===8,'manual tile advances production');terrainEmitShock(325,300,'tile',{});check(med.healProgress===3,'shared excite cooldown');bullets=[{x:1,y:1}];terrainUpdateEffects(1,1);check(!bullets.length&&terrainRun.echoes.length===0,'echo clears once without recursion');
setup();give('蓄能装置');t={x:0,y:0,shockTile:true};tiles=[t];p.x=375;p.y=300;updateShockTiles(0);check(t.shockCharges===1&&t.shockCooldown===35,'capacity grants no free charge');updateShockTiles(35);check(t.shockCharges===2,'second charge earned');p.x=325;updateShockTiles(0);check(t.shockCharges===1,'one charge consumed');p.x=375;updateShockTiles(0);p.x=325;updateShockTiles(0);check(t.shockCharges===0,'reentry consumes second charge');
// Shield break excludes voluntary clearing and shares one advancement cooldown.
setup();give('保险丝');t=tile('shieldTile');tiles=[t];p.x=325;p.y=300;p.shield=1;p.inv=0;hurt();check(t.healProgress===6&&terrainRun.fuseLock===10,'actual final shield damage advances six');terrainShieldBroken();check(t.healProgress===6,'fuse cannot double-trigger');
// Economy payloads, short defense, no recursive hit effects.
setup();give('钱袋许可','督工','乾坤一掷','现金装甲');t=tile('cashTile');tiles=[t];p.x=325;p.y=300;near(supplyTime(t)/productionMultiplier(t),40/1.5,'supervisor multiplier');terrainConsumeSupply(t,makeTerrainSupply(t));check(cash===8&&shots.length===12&&shots.every(s=>s.terrainShot&&s.damage===weapon.damage*.35),'money bag and twelve snapshot coins');p.inv=0;const health=p.hp;hurt();check(p.hp===health&&!terrainRun.cashArmor&&p.inv>0,'cash armor blocks one ordinary hit');terrainConsumeSupply(t,makeTerrainSupply(t));check(!terrainRun.cashArmor,'cash armor grant cooldown');
// Cover durability, shot direction, actual damage/repair/rebuild and reaction shock.
setup();give('加固框架','反应装甲','维修装置','重建结构','碎片弹射');t={x:0,y:0,coverTile:true,coverHp:coverMaximum()};tiles=[t];p.x=525;p.y=500;enemies=[];damageCover(t,1,{x:200,y:300});check(t.coverHp===4&&shots.length===3&&shots.every(s=>s.vx<0),'cover five hp and directional shards');terrainUpdateEffects(7,7);check(t.coverHp===5,'repair after five-second wait then two-second tick');damageCover(t,99,{type:'humanoid',x:200,y:300});check(!coverAlive(t)&&t.terrainRebuildLeft===8&&shockWaves.length===1,'break emits shock and schedules rebuild');terrainUpdateEffects(8,8);check(coverAlive(t)&&t.coverHp===5&&t.terrainRebuilt,'one full reconstruction');damageCover(t,99);check(!t.terrainRebuildLeft,'cannot reconstruct twice this room');refreshCoverTiles();check(coverAlive(t)&&!t.terrainRebuilt,'new room resets reconstruction');
setup();t={x:0,y:0,coverTile:true,coverHp:4};tiles=[t];give('加固框架');resolveEnemyCover({...enemy(430,300),type:'humanoid'},220,300);check(!coverAlive(t),'boss crushes reinforced maximum hp');
// All effects can render without growing geometry caches every frame.
setup();for(const d of TERRAIN_CATALOG.filter(d=>d.kind==='稀有被动'))grantTerrainPassive(d.name);tiles=[tile('medical'),tile('shieldTile',1),tile('cashTile',-1),{x:0,y:1,shockTile:true},{x:1,y:1,coverTile:true,coverHp:coverMaximum()}];tiles[0].supplyQueue=[{kind:'nutrition',amount:.02}];tiles[0].medPack=true;tiles[1].supplyQueue=[{kind:'shock',amount:0}];tiles[1].medPack=true;tiles[2].supplyQueue=[{kind:'cash',amount:8}];tiles[2].medPack=true;draw();const meshes=renderer.residentMeshes.size;for(let i=0;i<5;i++)draw();check(meshes===renderer.residentMeshes.size&&renderer.data.slice(0,renderer.count).every(Number.isFinite),'stable resident visuals');
const chargeMesh=renderer.residentMeshes.get('terrain:shock-pickup');check(chargeMesh?.count===2,'shock tile and industrial supply share solid product mesh');
tiles[1].pickup={x:425,y:350,speed:80};renderer.begin();drawTerrainEffects();check(chargeMesh.count===1&&chargeMesh.instances[3]===100&&Math.abs(chargeMesh.instances[11]-53)<1e-6,'industrial shock model follows supply attraction');
reset();check(!barItems.length&&!terrainPassives.size&&!terrainPurchased.size&&terrainRun.move===0&&!terrainRun.areas.length,'restart clears entire terrain build');
console.log('Terrain economy: 39 gold transactions, unified ordinary shop and separate bar, reserves/partial expansion, all passive families, queues/snapshots, timed-only growth, slow-time, proc guards, shock/cover mechanics and resident rendering passed');
}`,sandbox);

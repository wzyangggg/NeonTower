const fs=require('node:fs'),vm=require('node:vm');
const elements={};const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);for(const file of ['music','renderer','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss'])vm.runInContext(fs.readFileSync('dist/'+file+'.js','utf8'),sandbox);

vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
function mob(x=440,y=300){return {type:'eye',x,y,homeX:x,homeY:y,hp:100,max:100,r:14,t:0,fire:999,seed:0};}
function combat(){reset();startWave();p.y=300;p.inv=999;shootTimer=999;spawnQueue=[{type:'eye',side:0}];spawnTimer=999;chaserSpawned=24;turrets=[];enemies=[mob()];}
for(const id of ['purity','foreman','rebuild']){
 reset();state='upgrade';cash=100;
 const random=Math.random,index=ARMOR_TYPES.findIndex(a=>a.id===id);let offer;
 Math.random=()=>(index+.5)/ARMOR_TYPES.length;
 try{offer=equipmentShopItem('armor',3);}finally{Math.random=random;}
 check(offer.equipment.id===id&&offer.category==='建筑工服饰','workwear available in builder gift box '+id);
 offer.price=20;shopItems=[offer];
 check(buyShopItem(0)&&$('overlay').innerHTML.includes(offer.equipment.effectText),'purchase reveals workwear effect '+id);
 check(confirmEquipmentPurchase()&&armor.id===id&&cash===80,'can equip revealed workwear '+id);
}
combat();const wall={x:0,y:0,coverTile:true,repairWallBonus:2};
tiles.push(wall);p.x=425;p.y=300;
equipItem('armor',createArmor('rebuild',4));
damageCover(wall,1);terrainUpdateEffects(6,6);
check(wall.coverHp===coverMaximum(wall)-1,'reconstruction requires destruction');
damageCover(wall,99);terrainUpdateEffects(4.99,4.99);
check(!coverAlive(wall),'cover stays broken before five seconds');
paused=true;terrainUpdateEffects(5,5);paused=false;
check(!coverAlive(wall),'pause does not advance reconstruction');
p.x=325;terrainUpdateEffects(.02,.02);
check(!coverAlive(wall),'player blocks reconstruction');
p.x=425;enemies=[mob(325,300)];terrainUpdateEffects(.01,.01);
check(!coverAlive(wall),'enemy blocks reconstruction');
enemies=[];terrainUpdateEffects(.01,.01);
check(wall.coverHp===coverMaximum(wall),'clear space allows reconstruction to full reinforced durability');
damageCover(wall,99);terrainUpdateEffects(5,5);
check(coverAlive(wall),'cover can rebuild again in the same room');
terrainPassives.add('重建结构');
damageCover(wall,99);equipItem('armor',createArmor('foreman'));terrainUpdateEffects(10,10);
check(coverAlive(wall)&&wall.terrainRebuilt,'changing clothes preserves the terrain passive reconstruction');
damageCover(wall,99);terrainUpdateEffects(10,10);
check(!coverAlive(wall),'changing clothes cancels repeat reconstruction');
refreshCoverTiles();
check(coverAlive(wall)&&wall.armorRebuildLeft==null,'next room refreshes cover normally');
reset();state='upgrade';cash=999;const categories=new Set();
for(let level=1;level<=5;level++)for(const key of Object.keys(EQUIPMENT_LABELS))for(let i=0;i<80;i++){
 shopLevel=level;const u=equipmentShopItem(key),e=itemEquipment(u);u.price=shopPrice(u);shopItems=[u];renderShop();
 check(equipmentShopCategories(key,e).includes(u.category),'box category matches its fixed contents');categories.add(u.category);
 const html=$('overlay').innerHTML;
 check(!html.includes('<b>'+e.name+'</b>')&&!html.includes('需要替换：'),'contents and attributes concealed');
 check(html.includes('<b>随机 '+WEAPON_GRADES[e.tier].name+u.category+'</b>'),'stock title shows quality and category');
 check(typeof shopItemDescription(u)==='string'&&html.includes('<span class="shop-item-description">'+shopItemDescription(u)+'</span>')&&!shopItemDescription(u).includes(e.name),'generic category description shown without revealing item');
 if(key==='drone')check(COMPANION_TYPES.some(d=>d.id===e.id),'no gun copies in companion shop');
}
for(const category of ['轻武器','重武器','冷兵器','爆破武器','建筑工服饰','游侠服饰','便装','轻便护甲','重型防弹衣','绚丽服装','装甲坐骑','迅捷坐骑','火力坐骑','辅助坐骑','攻击型无人机','守卫型无人机','辅助型无人机'])check(categories.has(category),'reachable category '+category);
reset();state='upgrade';cash=12;const u=equipmentShopItem('weapon');u.price=12;shopItems=[u];const held=weapon,saved=JSON.stringify(itemEquipment(u));
check(buyShopItem(0)&&cash===0&&weapon===held&&pendingEquipment.paid,'purchase pays before comparison');check(JSON.stringify(itemEquipment(u))===saved,'reveal never rerolls');check(confirmEquipmentPurchase()&&cash===0&&weapon.id===itemEquipment(u).id,'equip with zero funds without recharging');check(!buyShopItem(0)&&!confirmEquipmentPurchase(),'no double charge');
cash=100;const other=equipmentShopItem('armor');other.price=20;shopItems=[other];check(buyShopItem(0)&&cancelEquipmentPurchase()&&cash===80&&armor===null&&other.discarded,'discard keeps payment and old slot');check(!buyShopItem(0),'discarded offer cannot reopen');
const d=terrainDef('急救箱'),passive={key:'terrainPassive',terrainId:d.id,name:d.name,desc:d.desc,price:24,sold:false};shopItems=[passive];const funds=cash;check(!buyShopItem(0)&&cash===funds&&!terrainHas(d.name)&&!pendingEquipment,'removed terrain bonus cannot be sold or revealed');
for(const type of COMPANION_TYPES)check(type.id==='chainsaw'||createDrone(type.id).companion,'dedicated companion factory');
combat();equipItem('drone',createDrone('ram'));const target=enemies[0];for(let i=0;i<350;i++)step(.01);check(target.hp<100,'ram makes real contact damage through hit pipeline');
combat();equipItem('drone',createDrone('weakener'));updateDrone(drone.interval,enemies);check(enemies[0].companionWeak>0,'weakness applies');check(resolveShotDamage({},10,enemies[0]).damage===12,'all-source vulnerability');time+=4;check(resolveShotDamage({},10,enemies[0]).damage===10,'weakness expires');const trap={...mob(),type:'turret'};turrets=[trap];time=0;drone.motion=null;updateDrone(3,[trap]);check(!trap.companionWeak,'never marks indestructible turret');
combat();equipItem('drone',createDrone('interceptor'));bullets=[{x:p.x+60,y:p.y,r:3,life:10}];updateDrone(.01,[]);check(!bullets.length,'guard intercepts contact bullet');bullets=[{x:p.x+60,y:p.y,r:3,life:10}];updateDrone(.01,[]);check(bullets.length===1,'interception has cooldown');
for(const [id,field]of [['medic','hp'],['charger','shield']]){
 combat();equipItem('drone',createDrone(id));p.hp=1;p.shield=0;const before=p[field];updateDrone(drone.interval-.01,enemies);check(p[field]===before,'no instant recovery');paused=true;updateDrone(1,enemies);check(p[field]===before,'pause freezes companion');paused=false;updateDrone(.02,enemies);check(p[field]===before+1,'periodic support');
 equipItem('drone',createDrone(id));updateDrone(.01,enemies);check(p[field]===before+1,'swap cannot mint recovery');
 state='upgrade';updateDrone(100,enemies);check(p[field]===before+1,'no recovery while shopping');
 state='survival';survivalRemaining=60;updateCompanion(drone.interval,[]);check(p[field]===before+2,'support works in survival');
}
for(const [family,itemId,shotCount] of [
 ['pistol','pistol_t1',4],['smg','smg_t3',4],['uzi','uzi_t2',4],['rifle','rifle_t2',3],['sniper','sniper_t3',1],
 ['rocket','rocket_t3',2],['seeker','seeker_t4',2],['laser','laser_t3',2],['tesla','tesla_t2',1]
]){
 combat();enemies=[mob(350,275),mob(480,275)];shots=[];
 equipItem('weapon',createWeaponModel(itemId));
 const id='gunship_'+family,index=COMPANION_TYPES.findIndex(d=>d.id===id),random=Math.random;
 Math.random=()=>(index+.1)/COMPANION_TYPES.length;
 const offer=equipmentShopItem('drone',2);
 Math.random=random;
 check(offer.equipment.id===id&&offer.category==='攻击型无人机','reachable gunship '+family);
 const sample=()=>{
  shots=[];
  const random=Math.random;Math.random=()=>1;
  try{emitWeaponShots(weapon,0,p);}finally{Math.random=random;}
  const s=shots[0];
  return {damage:s.damage,knockback:s.knockback,critMultiplier:s.critMultiplier,blastRadius:s.blastRadius,
   speed:Math.hypot(s.vx,s.vy),angle:Math.atan2(s.vy,s.vx),targetCount:s.arcTargets?.length};
 };
 const base=sample();
 equipItem('drone',offer.equipment);
 check(gunshipMatches(weapon,drone)&&equipmentSpecialEffects('drone',drone).some(s=>s.includes('已激活')),'active pairing '+family);
 const [field,multiplier]=drone.module.bonus,original=weapon[field],paired=sample();
 if(field==='chainRange')check(base.targetCount===1&&paired.targetCount===2,'paired range reaches second enemy');
 else if(field==='spread'){
  const aim=family==='uzi'?uziBarrels(p,0)[0].angle:0;
  check(Math.abs(paired.angle-aim-(base.angle-aim)*multiplier)<1e-8,'paired spread '+family);
 }else check(Math.abs(paired[field]-base[field]*multiplier)<1e-8,'paired stat '+family);
 check(weapon[field]===original,'shot restores equipped weapon '+family);
 equipItem('drone',createDrone(family==='pistol'?'gunship_smg':'gunship_pistol'));
 check(JSON.stringify(sample())===JSON.stringify(base),'swap immediately removes bonus '+family);
 equipItem('drone',offer.equipment);shots=[];
 paused=true;updateDrone(drone.interval,enemies);check(!shots.length,'gunship stops during pause');paused=false;
 updateDrone(drone.interval,enemies);
 check(shots.length===shotCount&&shots.every(s=>s.source==='drone'&&s.damage===drone.damage),'independent gunship salvo '+family);
 if(family==='smg')check(shots.every(s=>Math.abs(Math.abs(s.vx)-Math.abs(s.vy))<1e-8),'four fixed diagonals');
 shots=[];drone.motion.clock=0;updateDrone(drone.interval,[{...mob(),type:'turret'}]);check(!shots.length,'trap cannot activate gunship');
}
combat();for(const d of COMPANION_TYPES){equipItem('drone',createDrone(d.id,3));updateDrone(.01,enemies);draw();}const meshes=renderer.residentMeshes.size;for(let i=0;i<8;i++)draw();check(renderer.residentMeshes.size===meshes&&renderer.data.slice(0,renderer.count).every(Number.isFinite),'bounded resident companion visuals');
const starterModels=WEAPON_MODELS.filter(m=>m.tier===1),starterOffers=new Map();
shopLevel=1;
const savedRandom=Math.random;
try{
 for(let index=0;index<starterModels.length;index++){
  Math.random=()=>(index+.5)/starterModels.length;
  const offer=equipmentShopItem('weapon');
  starterOffers.set(offer.equipment.itemId,equipmentShopCategories('weapon',offer.equipment)[0]);
 }
}finally{Math.random=savedRandom;}
check(starterOffers.size===9,'nine reachable ordinary weapon models');
for(const [id,category,count] of [
 ['uzi_t1','轻武器',2],['sniper_t1','重武器',1],
 ['sword_t1_knife','冷兵器',2],['sword_t1_cleaver','冷兵器',2]
]){
 check(starterOffers.get(id)===category,'ordinary box category '+id);
 combat();equipItem('weapon',createWeaponModel(id));shots=[];shootWeapon(0);
 check(shots.length===count&&shots.every(s=>s.damage>0),'new starter weapon fires '+id);
 if(category==='冷兵器')check(shots.some(s=>s.slash)&&shots.some(s=>s.crescent),'blade covers melee and ranged targets '+id);
}
console.log('Gunships: nine reachable modules, actual family bonuses, swap/pause, distinct salvos and trap exclusion passed.');
console.log('Category boxes: all categories reachable, hidden stock, paid stable reveals/discard, removed terrain bonus rejected; independent companions contact damage, turret exclusion, vulnerability expiry, guard cooldown, support cadence/pause/swap/survival and resident rendering passed.');
}`,sandbox);

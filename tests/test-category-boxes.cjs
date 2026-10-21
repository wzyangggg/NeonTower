const fs=require('node:fs'),vm=require('node:vm');
const elements={};const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);for(const file of ['music','renderer','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss'])vm.runInContext(fs.readFileSync('dist/'+file+'.js','utf8'),sandbox);

vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
function mob(x=440,y=300){return {type:'eye',x,y,homeX:x,homeY:y,hp:100,max:100,r:14,t:0,fire:999,seed:0};}
function combat(){reset();startWave();p.y=300;p.inv=999;shootTimer=999;spawnQueue=[{type:'eye',side:0}];spawnTimer=999;chaserSpawned=24;turrets=[];enemies=[mob()];}
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
for(const category of ['轻武器','重武器','冷兵器','爆破武器','建筑工服饰','游侠服饰','便装','轻便护甲','重型防弹衣','绚丽服装','装甲坐骑','迅捷坐骑','火力坐骑','辅助坐骑','攻击型无人机','守卫型无人机','辅助型无人机','挖掘工具'])check(categories.has(category),'reachable category '+category);
reset();state='upgrade';cash=12;const u=equipmentShopItem('weapon');u.price=12;shopItems=[u];const held=weapon,saved=JSON.stringify(itemEquipment(u));
check(buyShopItem(0)&&cash===0&&weapon===held&&pendingEquipment.paid,'purchase pays before comparison');check(JSON.stringify(itemEquipment(u))===saved,'reveal never rerolls');check(confirmEquipmentPurchase()&&cash===0&&weapon.id===itemEquipment(u).id,'equip with zero funds without recharging');check(!buyShopItem(0)&&!confirmEquipmentPurchase(),'no double charge');
cash=100;const other=equipmentShopItem('armor');other.price=20;shopItems=[other];check(buyShopItem(0)&&cancelEquipmentPurchase()&&cash===80&&armor===null&&other.discarded,'discard keeps payment and old slot');check(!buyShopItem(0),'discarded offer cannot reopen');
const d=terrainDef('急救箱'),passive={key:'terrainPassive',terrainId:d.id,name:d.name,desc:d.desc,price:24,sold:false};shopItems=[passive];renderShop();check(!$('overlay').innerHTML.includes('<b>'+d.name+'</b>')&&$('overlay').innerHTML.includes('医疗格加成'),'passive direction only');check(buyShopItem(0)&&cash===56&&terrainHas(d.name)&&pendingEquipment.passive,'passive reveals and applies once');check(confirmEquipmentPurchase()&&!buyShopItem(0)&&cash===56,'passive reveal dismissal cannot recharge');
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
combat();for(const d of COMPANION_TYPES){equipItem('drone',createDrone(d.id,3));updateDrone(.01,enemies);draw();}const meshes=renderer.residentMeshes.size;for(let i=0;i<8;i++)draw();check(renderer.residentMeshes.size===meshes&&renderer.data.slice(0,renderer.count).every(Number.isFinite),'bounded resident companion visuals');
console.log('Category boxes: all categories reachable, hidden stock, paid stable reveals/discard/passives; independent companions contact damage, turret exclusion, vulnerability expiry, guard cooldown, support cadence/pause/swap/survival and resident rendering passed.');
}`,sandbox);

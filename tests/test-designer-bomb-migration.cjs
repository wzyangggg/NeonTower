const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('dist/facility-designer.js','utf8');
const bombs=['freeze_bomb','laser_bomb','missile_bomb'];
function load(saved){
 const elements={};let stored=JSON.stringify(saved);
 const element=id=>elements[id]??={style:{},classList:{add(){},toggle(){}},nextElementSibling:{},addEventListener(){},setAttribute(){}};
 const defs=Object.fromEntries(['shotgun_tower','sniper_tower','slow_field','shield_tower','electric_tower','healing_tower','missile_tower','tower',...bombs].map(id=>[id,{name:id,cells:[[0,0],[1,0],[2,0]],desc:id}]));
 const context={ElectricTiles:{defs,floorDefs:{},barricadeDefs:{barricade_double:{name:'双格掩体',cells:[[0,0],[1,0]],desc:'掩体'}},isDefenseTower:id=>['shotgun_tower','sniper_tower','slow_field','shield_tower','electric_tower','healing_tower','missile_tower'].includes(id),isBomb:id=>id==='tower'||bombs.includes(id)},localStorage:{getItem:()=>stored,setItem:(key,value)=>stored=value},document:{getElementById:element,querySelectorAll:()=>[],addEventListener(){}}};
 vm.runInNewContext(source,context);
 return JSON.parse(stored);
}
const custom={name:'用户电塔',enabledInGame:false,category:'defense',playerDescription:'自定义说明',developerDescription:'保留',cells:[[0,0],[1,0]],effectMode:'custom',effectCells:[[0,1]],range:420};
const saved={version:2,designCatalogVersion:2,facilities:{tower:custom,custom_1:{...custom,name:'我的设施'}}};
const migrated=load(saved);
assert.equal(migrated.designCatalogVersion,7);
assert.deepEqual(migrated.facilities.tower,custom);
assert.deepEqual(migrated.facilities.custom_1,saved.facilities.custom_1);
for(const id of ['shotgun_tower','sniper_tower','slow_field','shield_tower','electric_tower','healing_tower','missile_tower',...bombs]){assert.equal(migrated.facilities[id].enabledInGame,true);assert.equal(migrated.facilities[id].category,id==='shield_tower'?'supply':'defense');}
assert.equal(migrated.facilities.barricade_double.category,'terrain');
assert.equal(migrated.facilities.barricade_double.cells.length,2);
assert.deepEqual(load(migrated),migrated);
const editedWall={...custom,category:'terrain',name:'我的掩体'};
assert.deepEqual(load({...saved,facilities:{...saved.facilities,barricade_double:editedWall}}).facilities.barricade_double,editedWall);
const disabled=load({...saved,facilities:{...saved.facilities,freeze_bomb:{...custom,name:'我的冰冻炸弹'}}});
assert.deepEqual(disabled.facilities.freeze_bomb,{...custom,name:'我的冰冻炸弹'});
delete migrated.facilities.missile_bomb;delete migrated.facilities.electric_tower;
delete migrated.facilities.barricade_double;
assert.equal(Object.hasOwn(load(migrated).facilities,'barricade_double'),false);
assert.equal(Object.hasOwn(load(migrated).facilities,'missile_bomb'),false);assert.equal(Object.hasOwn(load(migrated).facilities,'electric_tower'),false);
console.log('Designer bomb migration passed: old catalog upgrade, custom designs and disabled entries preserved, idempotent reload, later deletion preserved.');

for(const id of ['shotgun_tower','sniper_tower','slow_field']){assert.equal(migrated.facilities[id].enabledInGame,true);assert.equal(migrated.facilities[id].category,'defense');const removed=structuredClone(migrated);delete removed.facilities[id];assert.equal(Object.hasOwn(load(removed).facilities,id),false);const disabled=structuredClone(migrated);disabled.facilities[id].enabledInGame=false;assert.equal(load(disabled).facilities[id].enabledInGame,false);}

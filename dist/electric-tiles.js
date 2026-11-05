'use strict';
// Friendly facilities never enter hostile turret/collision lists.
globalThis.ElectricTiles=(()=>{
 const floorDefs={
  floor:{name:'双格地块',cells:[[0,0],[1,0]],desc:'扩张可行走地板，可能开出陷阱或路障。'},
  floorLine:{name:'三格直线',cells:[[0,0],[1,0],[2,0]],desc:'扩张可行走地板，可能开出陷阱或路障。'},
  floorBend:{name:'三格弯折',cells:[[0,0],[1,0],[1,1]],desc:'扩张可行走地板，可能开出陷阱或路障。'},
  floorTriangle:{name:'三格三角',cells:[[0,0],[1,0],[0,1]],desc:'扩张可行走地板，可能开出陷阱或路障。'}
 };
 const barricadeDefs=Object.fromEntries([
  ['barricade','单格掩体',[[0,0]]],
  ['barricade_double','双格掩体',[[0,0],[1,0]]],
  ['barricade_line','三格直线掩体',[[0,0],[1,0],[2,0]]],
  ['barricade_bend','三格弯折掩体',[[0,0],[1,0],[1,1]]]
 ].map(([kind,name,cells])=>[kind,{name,cells,color:'#a8b7b5',effectMode:'none',desc:'每个占地格形成独立耐久的掩体，阻挡玩家、小怪和敌弹；友方攻击穿过，每关恢复。整组放置和拆除，占地可在设计台修改。'}]));
 // Fixed orientations make farms compete with towers for contiguous floor space.
 const fruits={
  apple:{name:'苹果农田',fruit:'苹果',cells:[[0,0],[1,0],[2,0],[0,1],[1,1],[0,2]],color:'#ff797c',interval:5,heal:1,buff:'speed',bonus:.1,desc:'每5秒产生1个苹果，吃下回复1点生命、移速+10%。'},
  watermelon:{name:'西瓜农田',fruit:'西瓜',cells:[[0,-2],[1,-2],[2,-2],[-1,-1],[0,-1],[-2,0],[-2,1],[-1,1],[-2,2]],color:'#75dc9e',interval:8,heal:3,buff:'attack',bonus:.1,desc:'每8秒产生1个西瓜，吃下回复3点生命、攻速+10%。'},
  banana:{name:'香蕉农田',fruit:'香蕉',cells:[[0,0],[-1,0],[1,0],[0,-1],[1,-1],[-1,1],[0,1]],color:'#ffe07d',interval:8,heal:1,buff:'speed',bonus:.2,desc:'每8秒产生1根香蕉，吃下回复1点生命、移速+20%。'},
  grape:{name:'葡萄农田',fruit:'葡萄',cells:[[-1,-1],[0,-1],[1,-1],[-1,0],[0,0],[1,0],[-1,1],[0,1]],color:'#c79aff',interval:10,heal:1,buff:'attack',bonus:.2,desc:'每10秒产生1串葡萄，吃下回复1点生命、攻速+20%。'}
 };
 // A compact hexagon: rows of 2, 3 and 2 cells around the center.
 const minerCells=[];
 for(let r=-1;r<=1;r++)for(let q=Math.max(-1,-r-1);q<=Math.min(1,-r+1);q++)minerCells.push([q,r]);
 const specLevel=id=>globalThis.Specializations?.level(id)||0;
 const attackRange=kind=>(globalThis.Specializations?.facilityRange({kind},defs[kind].attackRange)??defs[kind].attackRange);
 const defs={
  shotgun_tower:{name:'霰弹枪塔',cells:[[0,0]],color:'#ffd08a',interval:1.5,attackRange:260,effectMode:'none',desc:'每1.5秒发射5枚霰弹，合成提升伤害。'},
  sniper_tower:{name:'狙击枪塔',cells:[[0,0]],color:'#ffa1b9',interval:3,attackRange:800,effectMode:'none',desc:'每3秒狙击一次，距离越远伤害越高。'},
  slow_field:{name:'减速领域',cells:[[0,0]],color:'#b3a1ff',effectMode:'radius',range:140,desc:'范围内双方移速降低30%/40%/50%。'},
  electric_tower:{name:'电塔',cells:[[0,0]],color:'#75dfff',interval:2,attackRange:420,effectMode:'none',desc:'每2秒释放闪电，连锁3/4/5个敌人。'},
  shield_tower:{name:'护盾生产格',cells:[[0,0]],color:'#69f9de',interval:12,effectMode:'none',desc:'每12秒生产护盾，拾取后无敌2/3/4秒。'},
  healing_tower:{name:'治疗塔',cells:[[0,0]],color:'#71ffad',interval:4,attackRange:420,effectMode:'none',desc:'每4秒治疗附近角色或掩体，回复1/2/3点。'},
  missile_tower:{name:'导弹塔',cells:[[0,0]],color:'#ffb36c',interval:3,attackRange:600,effectMode:'none',desc:'每3秒发射导弹，飞得越远爆炸范围越大。'},
  energy:{name:'能源补给站',cells:[[0,0]],color:'#87e9ff',interval:4,amount:30,effectMode:'none',desc:'每4秒生产1份能量，走近拾取补充30能量；库存满时停产。'},
  tower:{name:'电浆炸弹',cells:[[0,0],[1,0],[2,0]],color:'#75dfff',interval:12,attackRange:Infinity,effectMode:'none',range:0,desc:'每12秒生产电浆炸弹，拾取电击8/12/16个敌人。'},
  freeze_bomb:{name:'冰冻炸弹',cells:[[0,0],[1,0],[2,0]],color:'#a3f4ff',interval:12,effectMode:'none',desc:'每12秒生产冰冻炸弹，拾取冻结周围敌人并清弹。'},
  laser_bomb:{name:'激光炸弹',cells:[[0,0],[1,0],[2,0]],color:'#ff80c8',interval:12,effectMode:'none',desc:'每12秒生产激光炸弹，拾取释放2/3/4道旋转激光。'},
  missile_bomb:{name:'导弹地块',cells:[[0,0],[1,0],[2,0]],color:'#ffb36c',interval:12,effectMode:'none',desc:'每12秒生产导弹补给，拾取追击3/4/5个敌人。'},
  echo:{name:'回响线圈',cells:[[0,0],[1,0]],color:'#d7b3ff',desc:'虚线内电力设施会重放它的效果。'},
  battery:{name:'电池',cells:[[0,0]],color:'#b7ec89',interval:10,desc:'开局10秒内，虚线内电力格的冷却加快30%'},
  turbine:{name:'涡轮发电机',cells:[[0,0],[1,0],[0,1]],color:'#ffce83',interval:1,desc:'每一秒减少一次虚线内电力格的冷却，而且逐渐加快'},
  miner:{name:'电能矿机',cells:minerCells,color:'#ffe17a',interval:4,amount:8,desc:'每4秒产出8金币，走近拾取。'},
  ...fruits,
  irrigator:{name:'电能灌溉机',cells:[[0,0]],color:'#7df3d4',interval:4,desc:'每4秒灌溉一次，使虚线内水果格的剩余冷却减少1.5秒。'},
  pulse:{name:'电能脉冲',cells:[[0,0],[1,0],[1,-1],[2,-1]],color:'#a9dfff',interval:15,damageBonus:.3,boostDuration:5,desc:'每15秒产生1份脉冲，拾取后清除全屏敌弹，使周围电力武器伤害+30%，持续5秒。'},
  biogenerator:{name:'生物发电机',cells:[[0,0]],color:'#f691b2',desc:'走入消耗1点生命，立即刷新周围6格的生产和供电冷却。'},
  clockshop:{name:'钟表店',cells:[[0,0]],color:'#ffd782',interval:10,bonus:.1,desc:'每10秒产出1个钟表，拾取后攻速、移速和全图补给生产速度各+10%，本层叠加，换层清零。'},
  repair_turret:{name:'修理炮塔',cells:[[0,0]],color:'#54e58b',interval:25,wallBonus:2,desc:'每25秒拆除1处危险，范围内掩体耐久+2。'}
 };
 // Tile border/fill colors consistently describe rarity; product colors remain semantic.
 const rarityColors=['#a8b7b5','#78c997','#6daee9','#be8fdf','#e8b565'];
 const rarityTiers={shotgun_tower:2,sniper_tower:3,slow_field:2,shield_tower:3,electric_tower:2,healing_tower:2,missile_tower:3,tower:2,freeze_bomb:2,laser_bomb:2,missile_bomb:2,miner:2,battery:2,echo:3,irrigator:3,pulse:3,turbine:4,biogenerator:4,clockshop:3,repair_turret:3};
 for(const [kind,def]of Object.entries(defs)){def.rarity=rarityTiers[kind]||1;def.rarityColor=rarityColors[def.rarity-1];}
 const expansionIds={floor:'floor_expansion_double',floorLine:'floor_expansion_line',floorBend:'floor_expansion_bend',floorTriangle:'floor_expansion_triangle'};
 let availabilitySource,availability=null,designCatalogVersion=0;
 function enabled(kind){
  if(kind==='energy')return typeof ENERGY_SYSTEM_ENABLED!=='undefined'&&ENERGY_SYSTEM_ENABLED;
  if(!Object.hasOwn(defs,kind)&&!Object.hasOwn(floorDefs,kind)&&!Object.hasOwn(barricadeDefs,kind))return false;
  try{const raw=localStorage.getItem('neon-facility-designer-v1');if(raw!==availabilitySource){availabilitySource=raw;const data=raw?JSON.parse(raw):null;designCatalogVersion=data?.designCatalogVersion||0;availability=data&&[1,2].includes(data.version)&&data.facilities&&typeof data.facilities==='object'?data.facilities:null;}
   if(!availability)return true;if(['shotgun_tower','sniper_tower','slow_field'].includes(kind)&&designCatalogVersion<7&&!Object.hasOwn(availability,kind))return true;if(kind==='shield_tower'&&designCatalogVersion<6&&!Object.hasOwn(availability,kind))return true;if(['electric_tower','healing_tower','missile_tower'].includes(kind)&&designCatalogVersion<5&&!Object.hasOwn(availability,kind))return true;if(Object.hasOwn(barricadeDefs,kind)&&designCatalogVersion<4&&!Object.hasOwn(availability,kind))return true;const id=expansionIds[kind]||kind;if((kind==='freeze_bomb'||kind==='laser_bomb'||kind==='missile_bomb')&&!Object.hasOwn(availability,id))return true;if(expansionIds[kind]&&designCatalogVersion<2&&!Object.hasOwn(availability,id))return true;return Object.hasOwn(availability,id)&&availability[id]?.enabledInGame!==false;
  }catch{return true;}
 }
 function syncAvailability(){if(typeof tiles==='undefined')return;for(const f of list())if(!enabled(f.kind))remove(f);globalThis.ElectricEditor?.refreshAvailability();}
 globalThis.addEventListener?.('storage',e=>{if(e.key==='neon-facility-designer-v1'||e.key===null)syncAvailability();});
 const DISCHARGE_TIME=.8;
 // More visible cooldown fills remain underneath the core icons.
 const progressColors=Object.fromEntries(Object.entries(defs).map(([kind,def])=>[kind,'#'+[1,3,5].map(i=>Math.round(parseInt(def.rarityColor.slice(i,i+2),16)*.65).toString(16).padStart(2,'0')).join('')]));
 let roomElapsed=0,serial=0,pending=[],pulses=[],pickupBursts=[],dischargeVisual=null;
 const buffs={speed:0,attack:0,production:0,clocks:0};
 const isFruit=kind=>Object.hasOwn(fruits,kind);
 const isDefenseTower=kind=>['electric_tower','healing_tower','missile_tower','shotgun_tower','sniper_tower','slow_field'].includes(kind);
 const isBomb=kind=>['tower','freeze_bomb','laser_bomb','missile_bomb'].includes(kind);
 const freezeStats=f=>({range:240+50*(towerLevel(f)-1),duration:1+towerLevel(f)});
 const laserStats=f=>({count:1+towerLevel(f),width:4+4*towerLevel(f),duration:3,interval:.1});
 const missileStats=f=>({count:2+towerLevel(f),damage:towerDamage(f)*2,radius:50+8*towerLevel(f)});
 const frozen=e=>(e?.bombFrozenUntil||0)>time;
 const hex=()=>typeof HexMap!=='undefined'&&walkFloor.toString().includes('HexMap');
 const key=c=>c.x+','+c.y;
 function profile(kind){
  const def=defs[kind]||floorDefs[kind]||barricadeDefs[kind];if(!def)return null;
  if(kind==='energy')return def;
  enabled(kind);const d=availability?.[expansionIds[kind]||kind];if(!d)return def;
  const valid=cs=>Array.isArray(cs)&&cs.length<=127&&cs.every(c=>Array.isArray(c)&&c.length===2&&c.every(Number.isInteger)&&Math.max(Math.abs(c[0]),Math.abs(c[1]),Math.abs(c[0]+c[1]))<=6)&&new Set(cs.map(c=>c.join(','))).size===cs.length;
  if(!valid(d.cells)||!d.cells.length)return def;
  // Retire the old automatic-shield copy from saved designer profiles.
  if(kind==='shield_tower')d.playerDescription=def.desc;
  const left=new Set(d.cells.map(c=>c.join(','))),queue=[d.cells[0]];left.delete(queue[0].join(','));for(let i=0;i<queue.length;i++)for(const [q,r]of [[1,0],[-1,0],[0,1],[0,-1],[1,-1],[-1,1]]){const c=[queue[i][0]+q,queue[i][1]+r];if(left.delete(c.join(',')))queue.push(c);}if(left.size)return def;
  return {...def,name:(isBomb(kind)||kind==='shield_tower')?def.name:typeof d.name==='string'?d.name:def.name,desc:(isBomb(kind)||isDefenseTower(kind)||kind==='shield_tower'||kind==='repair_turret'||kind==='miner')?def.desc:typeof d.playerDescription==='string'?d.playerDescription:def.desc,cells:d.cells,effectMode:['adjacent','custom','radius','global','none'].includes(d.effectMode)?d.effectMode:(def.effectMode||'adjacent'),effectCells:valid(d.effectCells)?d.effectCells:[],range:Number.isFinite(d.range)&&d.range>=0&&d.range<=1000?d.range:(def.range||0)};
 }
 const producer=kind=>kind==='shield_tower'||kind==='energy'||isBomb(kind)||kind==='miner'||kind==='irrigator'||kind==='pulse'||kind==='clockshop'||isFruit(kind);
 const supplyProducer=kind=>kind==='shield_tower'||isBomb(kind)||kind==='energy'||kind==='miner'||kind==='pulse'||kind==='clockshop'||isFruit(kind);
 const center=c=>hex()?{x:325+HexMap.x(c.x,c.y),y:300+HexMap.y(c.y)}:{x:325+c.x*TILE,y:300+c.y*TILE};
 // Use one shared centre for the tower model, attack origin and range preview.
 const facilityCenter=f=>{const points=f.cells.map(center);return {x:points.reduce((sum,p)=>sum+p.x,0)/points.length,y:points.reduce((sum,p)=>sum+p.y,0)/points.length};};
 // The same occupied cell anchors picking, the icon and the shared product.
 function coreCell(f){if(isBomb(f.kind)){const at=facilityCenter(f);return f.cells.reduce((a,b)=>Math.hypot(center(a).x-at.x,center(a).y-at.y)<=Math.hypot(center(b).x-at.x,center(b).y-at.y)?a:b);}return f.cells.find(c=>key(c)===key(f.anchor))||f.cells[0];}
 function offset(anchor,[q,r]){const aq=anchor.x-(anchor.y-(anchor.y&1))/2,y=anchor.y+r;return {x:aq+q+(y-(y&1))/2,y};}
 function shape(kind,anchor){
  const def=profile(kind);if(!def)return null;const cells=def.cells.map(c=>offset(anchor,c)),occupied=new Set(cells.map(key)),neighbors=new Map();
  if(def.effectMode&&def.effectMode!=='adjacent'){
   if(def.effectMode==='custom')for(const c of def.effectCells){const at=offset(anchor,c);if(!occupied.has(key(at)))neighbors.set(key(at),at);}
   if(def.effectMode==='global'||def.effectMode==='radius'){const origin=facilityCenter({cells});for(let y=grid.minY;y<=grid.maxY;y++)for(let x=grid.minX;x<=grid.maxX;x++){const c={x,y},at=center(c);if(!occupied.has(key(c))&&(def.effectMode==='global'||Math.hypot(at.x-origin.x,at.y-origin.y)<=def.range))neighbors.set(key(c),c);}}
   return {cells,outputs:[...neighbors.values()],scopeMode:def.effectMode,range:def.range};
  }
  if(def.effectMode==='adjacent'||!producer(kind)||kind==='irrigator'||kind==='pulse')for(const c of cells)for(const [dx,dy]of HexMap.neighbors(c.x,c.y)){const n={x:c.x+dx,y:c.y+dy};if(!occupied.has(key(n)))neighbors.set(key(n),n);}
  return {cells,outputs:[...neighbors.values()],scopeMode:def.effectMode||'adjacent',range:def.range};
 }
 function list(){const seen=new Set(),out=[];for(const t of tiles){const f=t.electricFacility;if(f&&!seen.has(f.id)){seen.add(f.id);out.push(f);}}return out;}
 function free(t,ignore=null){return !!t&&!terrainProtected(t)&&(!t.electricFacility||t.electricFacility===ignore)&&!t.medical&&!t.shieldTile&&!t.cashTile&&!t.shockTile&&!t.coverTile&&!t.trap&&!t.saw&&!t.flywheel&&!terrainHidden(t);}
 function canPlace(kind,anchor,ignore=null){if(!enabled(kind)||!hex())return false;const s=shape(kind,anchor);return !!s&&s.cells.every(c=>free(tiles.find(t=>key(t)===key(c)),ignore));}
 function fresh(f){delete f.specSupportClock;delete f.specAux;delete f.specTaskId;f.cool=defs[f.kind].interval||0;f.count=0;f.charges=0;f.attacks=0;f.products=0;f.produced=0;f.earned=0;f.collected=0;f.pickupCool=0;f.flash=0;f.received=0;f.occupied=false;f.lastRefreshed=0;f.damageBoostLeft=0;f.workTarget=null;f.aimLockLeft=0;}
 const towerLevel=f=>f.level||1;
 const towerTargetLimit=f=>8+4*(towerLevel(f)-1);
 const towerDamage=f=>(f.bombDamage??6*Math.pow(1.8,towerLevel(f)-1))*(f.damageBoostLeft>0?1+defs.pulse.damageBonus:1);
 function place(kind,anchor,level=1){if(!canPlace(kind,anchor)||!Number.isInteger(level)||level<1||level>3)return null;const s=shape(kind,anchor),f={id:++serial,kind,level,anchor:{...anchor},...s};fresh(f);for(const c of s.cells)tiles.find(t=>key(t)===key(c)).electricFacility=f;renderer.sceneKey=null;if(kind==='repair_turret')syncWalls();return f;}
 function canMerge(source,target){return !source?.initialCore&&!target?.initialCore&&!!source&&!!target&&!!defs[source.kind]&&enabled(source.kind)&&source!==target&&source.kind===target.kind&&towerLevel(source)===towerLevel(target)&&towerLevel(target)<3&&list().includes(target);}
 function merge(source,target){if(!canMerge(source,target))return false;if(list().includes(source))remove(source);pending=pending.filter(q=>q.tower!==target);target.level=towerLevel(target)+1;target.flash=.5;renderer.sceneKey=null;return target;}
 function remove(f){if(!f||f.initialCore)return;for(const t of tiles)if(t.electricFacility===f)delete t.electricFacility;pending=pending.filter(e=>e.tower!==f&&e.source!==f);renderer.sceneKey=null;if(f.kind==='repair_turret')syncWalls();}
 function move(f,anchor){if(f.initialCore)return false;if(!list().includes(f)||!canPlace(f.kind,anchor,f))return false;for(const t of tiles)if(t.electricFacility===f)delete t.electricFacility;const s=shape(f.kind,anchor);Object.assign(f,{anchor:{...anchor},...s});for(const c of s.cells)tiles.find(t=>key(t)===key(c)).electricFacility=f;renderer.sceneKey=null;if(f.kind==='repair_turret'){f.workTarget=null;f.cool=defs.repair_turret.interval;syncWalls();}return true;}
 function recipients(f){return list().filter(t=>(f.kind==='pulse'?(isBomb(t.kind)||['electric_tower','missile_tower','shotgun_tower','sniper_tower'].includes(t.kind)):f.kind==='biogenerator'?producer(t.kind)||t.kind==='turbine':f.kind==='irrigator'?isFruit(t.kind):producer(t.kind))&&f.outputs.some(c=>t.cells.some(at=>key(c)===key(at))));}
 function inRepairRange(f,cell,position=center(cell)){
  if(f.scopeMode==='global')return true;
  if(f.scopeMode==='radius'){const at=facilityCenter(f);return Math.hypot(at.x-position.x,at.y-position.y)<=f.range*(f.kind==='slow_field'&&specLevel('slow_field')>=1?1.2:1);}
  return f.outputs.some(c=>key(c)===key(cell));
 }
 function syncWalls(){
  const repairs=list().filter(f=>f.kind==='repair_turret'&&enabled(f.kind));
  for(const t of tiles){const old=t.repairWallBonus||0,source=t.coverTile?repairs.find(f=>inRepairRange(f,t)):null,bonus=source?defs.repair_turret.wallBonus+(specLevel('repair_turret')>=1?2:0):0;
   if(old===bonus)continue;
   const hp=t.coverHp??coverMaximum(t);t.repairWallBonus=bonus;
   // Preserve damage when entering/leaving an aura, and never revive a broken wall.
   if(t.coverTile)t.coverHp=hp>0?Math.max(0,Math.min(coverMaximum(t),hp+bonus-old)):0;
   if(bonus>old&&hp>0&&source){const at=center(t);pulses.push({from:facilityCenter(source),to:at,color:'#54e58b',life:.35});}
   if(!bonus)delete t.repairWallBonus;
  }
 }
 function repairTargets(f){
  const targets=tiles.filter(t=>(t.trap||t.saw||t.flywheel)&&!terrainHidden(t)&&inRepairRange(f,t)).map(tile=>({tile}));
  for(const turret of turrets)if(!turret.temporary&&!terrainHidden(turret)&&inRepairRange(f,HexMap.cellAt(turret.x,turret.y),turret))targets.push({turret});
  return targets;
 }
 const sameRepairTarget=(a,b)=>!!a&&!!b&&(a.tile&&a.tile===b.tile||a.turret&&a.turret===b.turret);
 const repairPosition=target=>target.tile?center(target.tile):{x:target.turret.x,y:target.turret.y};
 function specialSupportStep(f,dt){
  const n=specLevel(f.kind);if(!n)return;
  f.specSupportClock=(f.specSupportClock||0)+dt;
  if(f.kind==='slow_field'&&n>=5&&f.specSupportClock>=3-1e-8){
   f.specSupportClock%=3;const at=facilityCenter(f);
   for(const e of combatTargets()){
    const cell=hex()?HexMap.cellAt(e.x,e.y):{x:Math.round((e.x-325)/TILE),y:Math.round((e.y-300)/TILE)};
    if(!inSlowField(f,cell,e))continue;
    e.specSlow=.7;e.specSlowUntil=time+1;
    if(!isBossBody(e)&&e.type!=='boss')e.specRootUntil=time+1;
   }burst(at.x,at.y,defs.slow_field.color,18);f.flash=.4;
  }
  if(f.kind!=='repair_turret')return;
  if(n>=4&&f.specSupportClock>=4-1e-8){
   f.specSupportClock%=4;
   const damaged=tiles.filter(t=>coverAlive(t)&&t.coverHp<coverMaximum(t)&&inRepairRange(f,t));
   for(const [i,t]of damaged.slice(0,n>=5&&Math.random()<.6?3:1).entries()){
    t.coverHp=Math.min(coverMaximum(t),t.coverHp+(i?1:2));pulses.push({from:facilityCenter(f),to:center(t),color:'#54e58b',life:.4});
   }
  }
  if(n<3){f.specAux=[];f.specTaskId=null;return;}
  const activeTargets=repairTargets(f);f.specAux=(f.specAux||[]).filter(a=>activeTargets.some(t=>sameRepairTarget(t,a.target))&&Number.isFinite(a.left));
  if(f.workTarget&&!sameRepairTarget(f.specTaskId,f.workTarget)){
   f.specTaskId=f.workTarget;
   if(Math.random()<(n>=5?.6:.25)){
    const candidates=repairTargets(f).filter(t=>!sameRepairTarget(t,f.workTarget)&&!f.specAux.some(a=>sameRepairTarget(a.target,t))&&!list().some(other=>other!==f&&(sameRepairTarget(other.workTarget,t)||other.specAux?.some(a=>sameRepairTarget(a.target,t)))));
    f.specAux.push(...candidates.slice(0,Math.max(0,(n>=5?2:1)-f.specAux.length)).map(target=>({target,left:defs.repair_turret.interval})));
   }
  }
  const valid=repairTargets(f);for(const a of f.specAux||[]){
   if(!valid.some(t=>sameRepairTarget(t,a.target)))continue;
   a.left-=dt*.5*(globalThis.Specializations?.stats(f.kind).rate||1);
   if(a.left<=1e-8){const target=a.target,at=repairPosition(target);if(target.tile){for(const field of ['trap','saw','orbitSaw','sawClock','flywheel'])delete target.tile[field];}else turrets=turrets.filter(t=>t!==target.turret);f.count++;burst(at.x,at.y,'#54e58b',12);renderer.sceneKey=null;a.left=Infinity;updateUI();}
  }
 }
 function repairStep(f,dt,live){
  dt*=globalThis.Specializations?.stats(f.kind).rate||1;
  const targets=repairTargets(f);
  if(f.workTarget&&!targets.some(t=>sameRepairTarget(t,f.workTarget))){f.workTarget=null;f.cool=defs.repair_turret.interval;}
  if(!f.workTarget){f.workTarget=targets.find(t=>!live.some(other=>sameRepairTarget(other.workTarget,t)||other.specAux?.some(a=>sameRepairTarget(a.target,t))))||null;f.cool=defs.repair_turret.interval;}
  if(!f.workTarget)return;
  f.cool=Math.max(0,f.cool-dt);if(f.cool>1e-8)return;
  const target=f.workTarget,at=repairPosition(target);
  if(target.tile){for(const field of ['trap','saw','orbitSaw','sawClock','flywheel'])delete target.tile[field];}
  else turrets=turrets.filter(t=>t!==target.turret);
  f.count++;f.flash=.4;f.workTarget=null;f.cool=defs.repair_turret.interval;renderer.sceneKey=null;
  burst(at.x,at.y,'#54e58b',12);updateUI();
 }
 const waiting=f=>f.kind!=='irrigator'&&(f.products>0||pending.some(q=>q.tower===f&&!q.done));
 function bioStep(f,cell){
  const occupied=key(cell)===key(f.anchor),entered=occupied&&!f.occupied;f.occupied=occupied;if(!entered)return;
  const targets=recipients(f).filter(t=>t.cool>1e-8&&!waiting(t));
  if(p.hp<2||!targets.length)return;
  const before=p.hp;p.hp-=1;p.floorHit=true;emitBarLoss(p,before,p.hp,p.max);f.count++;f.lastRefreshed=targets.length;f.flash=.4;
  for(const target of targets){target.cool=0;target.received++;target.flash=.25;pulses.push({from:center(f.anchor),to:center(target.anchor),color:defs.biogenerator.color,life:.35});}
  cashPopups.push({text:'生命-1 · 刷新'+targets.length+'格',x:p.x,y:p.y,height:70,age:0,life:1});if(cashPopups.length>24)cashPopups.shift();burst(p.x,p.y,defs.biogenerator.color,12);beep(180,.1,'triangle',.025);updateUI();
 }
 function supply(f){f.count++;f.flash=.3;for(const tower of recipients(f)){if(waiting(tower))continue;tower.cool=Math.max(0,tower.cool-1.5);tower.received++;tower.flash=.22;pulses.push({from:center(f.anchor),to:center(tower.anchor),life:.22});}}
 function produce(f,echo=false){
  f.produced++;f.flash=.3;
  if(f.kind==='irrigator'){
   f.count++;for(const fruit of recipients(f)){if(waiting(fruit))continue;fruit.cool=Math.max(0,fruit.cool-1.5);fruit.received++;fruit.flash=.25;pulses.push({from:center(f.anchor),to:center(fruit.anchor),color:defs.irrigator.color,life:.3});}
  }else {f.products++;if(f.kind==='shield_tower'&&!echo&&specLevel('shield_tower')>=3&&Math.random()<.2)f.products++;}
  if(!echo){const coils=list().filter(c=>c.kind==='echo'&&recipients(c).includes(f));coils.forEach((c,i)=>{c.flash=.3;pending.push({tower:f,source:c,left:.18*(i+1)});});}
 }
 function pickup(f){
  if(f.kind==='energy'&&(p.energy??ENERGY_MAX)>=ENERGY_MAX)return;
  f.products--;f.collected++;f.pickupCool=.25;if(!f.products)f.cool=defs[f.kind].interval;
  if(f.kind!=='shield_tower')pickupFeedback(f.kind,isFruit(f.kind)?PICKUP_COLORS.medical:PICKUP_COLORS[f.kind]);
  if(f.kind==='shield_tower'){if(globalThis.Specializations)Specializations.shield(f,1+towerLevel(f));else grantTemporaryShield(1+towerLevel(f));f.count++;f.flash=.4;updateUI();return;}
  if(f.kind==='energy'){const amount=Math.min(ENERGY_PACK,ENERGY_MAX-(p.energy??ENERGY_MAX));p.energy=(p.energy??ENERGY_MAX)+amount;cashPopups.push({text:'能量 +'+Math.round(amount),x:p.x,y:p.y,height:60,age:0,life:1});if(cashPopups.length>24)cashPopups.shift();pickupBursts.push({x:p.x,y:p.y,life:.9,color:'#87e9ff'});pickupSound('shield');updateEnergyHud();return;}
  if(f.kind==='freeze_bomb'){freezeBomb(f);pickupSound('shield');return;}
  if(f.kind==='laser_bomb'){laserBomb(f);pickupSound('shield');return;}
  if(f.kind==='missile_bomb'){missileBomb(f);pickupSound('shield');return;}
  if(f.kind==='tower'){fireTower(f);pickupBursts.push({x:p.x,y:p.y,life:.9,color:'#75dfff'});spawnElementBurst(p.x,p.y,32,'plasma');return;}
  if(f.kind==='clockshop'){
   const bonus=defs.clockshop.bonus;buffs.speed+=bonus;buffs.attack+=bonus;buffs.production+=bonus;buffs.clocks++;
   cashPopups.push({text:'钟表 · 攻速/移速/生产 +10%',x:p.x,y:p.y,height:60,age:0,life:1});if(cashPopups.length>24)cashPopups.shift();
   pickupBursts.push({x:p.x,y:p.y,life:.9,color:'#ffd782'});burst(p.x,p.y,'#ffd782',8);pickupSound('cash');updateUI();return;
  }
  if(isFruit(f.kind)){
   const def=fruits[f.kind],healed=Math.min(def.heal||0,Math.max(0,p.max-p.hp));p.hp+=healed;if(def.buff)buffs[def.buff]+=def.bonus;
   cashPopups.push({text:def.fruit+' · '+(healed?'生命+'+healed+' · ':'')+(def.buff==='speed'?'移速':'攻速')+'+'+Math.round(def.bonus*100)+'%',x:p.x,y:p.y,height:60,age:0,life:1});if(cashPopups.length>24)cashPopups.shift();
   pickupBursts.push({x:p.x,y:p.y,life:.9});
   burst(p.x,p.y,'#75ffa8',8);pickupSound('medical');updateUI();return;
  }
  if(f.kind==='miner'){f.earned+=gainCash(defs.miner.amount,p.x,p.y,30);cashBurst(p.x,p.y,2);pickupSound('cash');updateUI();return;}
  if(f.kind==='pulse'){const at=center(f.anchor),tile=tiles.find(t=>key(t)===key(f.anchor));f.count++;terrainEmitShock(at.x,at.y,'tile',tile);for(const tower of recipients(f)){tower.damageBoostLeft=defs.pulse.boostDuration;tower.flash=.3;pulses.push({from:facilityCenter(f),to:facilityCenter(tower),color:defs.pulse.color,life:.3});}updateUI();return;}
 }
 // Combat reach is a tower stat; tile effect masks only describe facility influence.
 function towerAttackRange(){return defs.tower.attackRange;}
 function missileBomb(f){
  const stats=missileStats(f),targets=combatTargets().filter(e=>enemies.includes(e)).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y)).slice(0,stats.count);
  for(let i=0;i<targets.length;i++){
   const target=targets[i],angle=Math.atan2(target.y-p.y,target.x-p.x)+(i-(targets.length-1)/2)*.28,speed=340;
   shots.push({tileMissile:true,homing:true,homingTarget:target,x:p.x,y:p.y,originX:p.x,originY:p.y,lastX:p.x,lastY:p.y,
    vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,speed,life:4,damage:stats.damage,blastRadius:stats.radius,hitRadius:5,pierce:1,
    color:defs.missile_bomb.color,elementTheme:'missile',source:'tile',terrainShot:true,electricFacilityShot:true,weaponId:'tile-missile',critChance:0,height:20,trail:[]});
  }
  if(targets.length)f.attacks++;
  spawnElementBurst(p.x,p.y,22,'missile',.65);
 }
 // Equipment bombs use the existing combat effects without a facility or product.
 function activateEquipmentBomb(e){
  if(paused||!['combat','survival'].includes(state)||!isBomb(e?.id))return false;
  const targets=combatTargets().filter(t=>isAttackable(t)),f={kind:e.id,level:e.level||1,bombDamage:e.damage,attacks:0};
  if(e.id==='freeze_bomb'){
   const range=freezeStats(f).range,inside=t=>Math.hypot(t.x-p.x,t.y-p.y)<=range+(t.r||0);
   if(!targets.some(inside)&&![...bullets,...missiles,...hazards].some(inside))return false;
  }else if(!targets.some(t=>e.id!=='missile_bomb'||enemies.includes(t)))return false;
  const first=shots.length;
  if(e.id==='tower'){if(!fireTower(f))return false;}else if(e.id==='freeze_bomb')freezeBomb(f);else if(e.id==='laser_bomb')laserBomb(f);else missileBomb(f);
  for(const shot of shots.slice(first)){shot.source='bomb';delete shot.terrainShot;delete shot.electricFacilityShot;}
  if(e.id!=='tower')pickupSound('shield');return true;
 }
 function advanceMissile(s,dt){
  if(s.life<=0)return false;
  if(s.towerMissile){
   s.lastX=s.x;s.lastY=s.y;let elapsed=Math.min(dt,s.life);
   for(const [pos,v,min,max]of [[s.x,s.vx,A.x,A.x+A.w],[s.y,s.vy,A.y,A.y+A.h]])if(v)elapsed=Math.min(elapsed,Math.max(0,((v>0?max:min)-pos)/v));
   s.x+=s.vx*elapsed;s.y+=s.vy*elapsed;s.life-=dt;s.blastRadius=towerMissileRadius(s);
   s.trail.push({x:s.x,y:s.y});if(s.trail.length>14)s.trail.shift();return true;
  }
  const targets=combatTargets().filter(e=>enemies.includes(e));
  if(!targets.includes(s.homingTarget))s.homingTarget=targets.sort((a,b)=>Math.hypot(a.x-s.x,a.y-s.y)-Math.hypot(b.x-s.x,b.y-s.y))[0]||null;
  const elapsed=Math.min(dt,s.life),from={x:s.x,y:s.y};
  if(s.homingTarget){advanceSeekerCurve(s,elapsed,s.homingTarget);}else{s.x+=s.vx*elapsed;s.y+=s.vy*elapsed;s.homingSegments=[from,{x:s.x,y:s.y}];}
  s.lastX=from.x;s.lastY=from.y;s.life-=dt;
  s.trail.push({x:s.x,y:s.y});if(s.trail.length>14)s.trail.shift();
  return true;
 }
 function freezeBomb(f){
  const {range,duration}=freezeStats(f),inside=e=>Math.hypot(e.x-p.x,e.y-p.y)<=range+(e.r||0);
  for(const e of enemies)if(e.hp>0&&inside(e)){
   e.bombFrozenUntil=Math.max(e.bombFrozenUntil||0,time+duration);
   e.warn=false;e.twinPending=null;
   if(e.type==='builder'){e.buildTarget=null;e.buildProgress=0;}
   if(e.type==='laser'){e.laserMode='idle';e.laserTimer=LASER_EYE.cooldown;e.fire=Math.max(e.fire||0,duration);}
  }
  // Removing missiles must not detonate them into fresh hostile projectiles.
  bullets=bullets.filter(e=>!inside(e));missiles=missiles.filter(e=>!inside(e));hazards=hazards.filter(e=>!inside(e));
  f.attacks++;pickupBursts.push({x:p.x,y:p.y,life:.9,color:defs.freeze_bomb.color,range});spawnElementBurst(p.x,p.y,42,'ice',1.25);
 }
 function laserBomb(f){
  const stats=laserStats(f),base=Math.random()*TAU;
  for(let i=0;i<stats.count;i++){
   const aim=base+i*TAU/stats.count;
   shots.push({bombLaser:true,beam:true,sustain:true,aim,lastAim:aim,spin:(Math.random()<.5?-1:1)*TAU*1.25,
    originX:p.x,originY:p.y,x:p.x,y:p.y,vx:0,vy:0,life:stats.duration,damage:towerDamage(f)/3,
    pierce:Infinity,modelHitAt:new Map(),interval:stats.interval,hitRadius:stats.width/2,width:stats.width,
    color:defs.laser_bomb.color,source:'tile',terrainShot:true,electricFacilityShot:true,weaponId:'laser-bomb',critChance:0,height:18});
  }
  f.attacks++;spawnElementBurst(p.x,p.y,32,'laser');
 }
 function advanceLaser(s,dt){
  if(s.life<=0)return false;
  const elapsed=Math.min(s.life,dt);s.lastAim=s.aim;s.aim+=s.spin*elapsed;s.life-=dt;
  s.originX=p.x;s.originY=p.y;
  const length=Math.hypot(A.w,A.h)*2;s.x=p.x+Math.cos(s.aim)*length;s.y=p.y+Math.sin(s.aim)*length;
  return true;
 }
 function laserHits(s,e){
  if(e.type==='fishSchool')return fishSchoolMembers(e).some(q=>laserHits(s,q));
  const dx=e.x-s.originX,dy=e.y-s.originY,distance=Math.hypot(dx,dy),radius=(e.r||0)+s.hitRadius;
  if(distance<=radius)return true;
  const angle=Math.atan2(dy,dx),span=s.aim-s.lastAim,margin=Math.asin(Math.min(1,radius/distance));
  const relative=span>=0?((angle-s.lastAim)%TAU+TAU)%TAU:((s.lastAim-angle)%TAU+TAU)%TAU;
  return relative<=Math.abs(span)+margin||relative>=TAU-margin;
 }
 function fireTower(f,automatic=false){
  const origin=automatic?facilityCenter(f):{x:p.x,y:p.y},available=combatTargets(),targets=[];
  let from=origin;
  while(targets.length<(automatic?2+towerLevel(f):towerTargetLimit(f))){
   let nearest=null,distance=automatic?(targets.length?135:defs.electric_tower.attackRange):towerAttackRange();
   for(const e of available){if(targets.includes(e))continue;const d=Math.hypot(e.x-from.x,e.y-from.y);if(d<=distance){nearest=e;distance=d;}}
   if(!nearest)break;targets.push(nearest);from=nearest;
  }
  if(!targets.length)return false;
  if(!automatic)plasmaLightningSound('bomb');
  f.attacks++;const points=[origin,...targets.map(e=>({x:e.x,y:e.y}))],end=points.at(-1);
  // Plasma spreads from three player roots, then each hit can fork twice.
  // Keep the selected victims/damage order; edges describe the discharge tree.
  const arcSegments=automatic?null:targets.map((to,i)=>({from:i<3?p:targets[Math.floor((i-3)/2)],to}));
  shots.push({beam:true,arc:true,arcTargets:targets,points,arcSegments,plasmaDischarge:!automatic,originX:origin.x,originY:origin.y,x:end.x,y:end.y,vx:0,vy:0,life:DISCHARGE_TIME,damage:towerDamage(f),pierce:targets.length,hitTargets:new Set(),damageApplied:false,color:'#85eaff',weaponId:'electric-tile',source:'tile',terrainShot:true,electricFacilityShot:true,critChance:0,critMultiplier:2,height:18});
  return true;
 }
 // Evaluate live geometry: leaving, moving or removing a field cannot leave a stale debuff.
 function inSlowField(f,cell,unit){
  return f.kind==='slow_field'&&enabled(f.kind)&&((f.scopeMode!=='radius'&&f.cells.some(c=>key(c)===key(cell)))||inRepairRange(f,cell,unit));
 }
 function slowFieldAt(cell){return list().some(f=>inSlowField(f,cell));}
 function movementFactor(unit){
  if(!['combat','survival'].includes(state))return 1;
  let factor=1;
  for(const f of list())if(f.kind==='slow_field'&&enabled(f.kind)){
   const at=facilityCenter(f),cell=hex()?HexMap.cellAt(unit.x,unit.y):{x:Math.round((unit.x-325)/TILE),y:Math.round((unit.y-300)/TILE)};
   const inside=inSlowField(f,cell,unit);
   if(inside){const n=specLevel('slow_field');if(unit!==p||n<2)factor=Math.min(factor,Math.max(.3,.8-.1*towerLevel(f)-(unit!==p&&n>=3?.1:0)));if(unit!==p&&n>=4){unit.specSlow=Math.max(unit.specSlow||0,1-factor);unit.specSlowUntil=time+2;}}
  }
  return factor;
 }
 const sniperDamage=(s,target)=>s.damage*(1+Math.hypot(target.x-s.originX,target.y-s.originY)/200);
 // Recoil holds the fired heading before the barrel resumes its finite turn.
 const rotatingTower=kind=>['shotgun_tower','sniper_tower','missile_tower'].includes(kind);
 function towerTracking(f,dt){
  if(!rotatingTower(f.kind))return null;
  const locked=Math.min(dt,f.aimLockLeft||0);f.aimLockLeft=Math.max(0,(f.aimLockLeft||0)-dt);dt-=locked;
  if(locked>0&&dt<=1e-8){f.aimReady=false;return null;}
  const origin=facilityCenter(f),target=combatTargets().filter(e=>Math.hypot(e.x-origin.x,e.y-origin.y)<=attackRange(f.kind)).sort((a,b)=>Math.hypot(a.x-origin.x,a.y-origin.y)-Math.hypot(b.x-origin.x,b.y-origin.y))[0];
  if(!target){f.aimReady=false;return null;}
  const desired=Math.atan2(target.y-origin.y,target.x-origin.x),delta=Math.atan2(Math.sin(desired-(f.aim||0)),Math.cos(desired-(f.aim||0))),step=Math.PI*dt;
  f.aim=(f.aim||0)+Math.max(-step,Math.min(step,delta));
  f.aim=Math.atan2(Math.sin(f.aim),Math.cos(f.aim));
  f.aimReady=Math.abs(Math.atan2(Math.sin(desired-f.aim),Math.cos(desired-f.aim)))<=Math.PI/90;
  return target;
 }
 function defenseStep(f,dt){
  const specStart=shots.length;
  if(f.kind==='slow_field'||f.kind==='shield_tower')return;
  const tracked=towerTracking(f,dt);
  if(f.cool>1e-8)return;f.cool=0;
  if(rotatingTower(f.kind)&&(!tracked||!f.aimReady))return;
  const origin=facilityCenter(f),distance=e=>Math.hypot(e.x-origin.x,e.y-origin.y);
  if(f.kind==='healing_tower'){
   const targets=[];
   if(p.hp>0&&p.hp<p.max)targets.push({unit:p,at:p,max:p.max});
   for(const t of tiles)if(coverAlive(t)&&!terrainHidden(t)&&(t.coverHp??coverMaximum(t))<coverMaximum(t))targets.push({unit:t,at:center(t),max:coverMaximum(t)});
   const sorted=targets.filter(t=>distance(t.at)<=attackRange(f.kind)).sort((a,b)=>distance(a.at)-distance(b.at));
   const target=sorted[0];
   if(!target)return;
   const field=target.unit===p?'hp':'coverHp',amount=Math.min(towerLevel(f),target.max-target.unit[field]);if(globalThis.Specializations&&specLevel(f.kind)>0)Specializations.heal(f,sorted.map(t=>({...t,field:t.unit===p?'hp':'coverHp'})),towerLevel(f));else target.unit[field]+=amount;
   f.count++;f.flash=.4;pulses.push({from:origin,to:{x:target.at.x,y:target.at.y},color:defs[f.kind].color,life:.4});
   burst(target.at.x,target.at.y,defs[f.kind].color,8);updateUI();
  }else if(f.kind==='electric_tower'){
   if(!fireTower(f,true))return;plasmaLightningSound();f.flash=.3;
  }else if(f.kind==='shotgun_tower'||f.kind==='sniper_tower'){
   const angle=f.aim,sniper=f.kind==='sniper_tower',speed=sniper?1500:420;
   shotSound(sniper?'sniper_tower':'shotgun');
   for(let i=0;i<(sniper?1:5);i++){
    const aim=angle+(sniper?0:(i-2)*.13);
    shots.push({towerBullet:true,towerSniper:sniper,x:origin.x,y:origin.y,originX:origin.x,originY:origin.y,vx:Math.cos(aim)*speed,vy:Math.sin(aim)*speed,
     life:attackRange(f.kind)/speed,damage:towerDamage(f)*(sniper?2:.6),hitRadius:sniper?3:4,pierce:1,hitTargets:new Set(),critChance:0,source:'tile',terrainShot:true,electricFacilityShot:true,weaponId:sniper?'sniper':'shotgun',height:32,color:defs[f.kind].color});
   }
   f.attacks++;f.flash=.3;f.muzzleLeft=.11;
  }else if(f.kind==='missile_tower'){
   const angle=f.aim,speed=300;
   shots.push({towerMissile:true,tileMissile:true,x:origin.x,y:origin.y,originX:origin.x,originY:origin.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,
    life:4,damage:towerDamage(f)*2,blastRadius:30,hitRadius:5,pierce:1,critChance:0,source:'tile',terrainShot:true,electricFacilityShot:true,weaponId:'tower-missile',elementTheme:'missile',height:28,trail:[]});
   f.attacks++;f.flash=.3;
  }
  globalThis.Specializations?.afterVolley(specStart,f.kind,f.aim||0,origin);
  if(rotatingTower(f.kind)){f.aimLockLeft=f.kind==='sniper_tower'?.32:f.kind==='shotgun_tower'?.24:.28;f.aimReady=false;}
  f.cool=defs[f.kind].interval;
 }
 function towerMissileImpact(s,e){
  const dx=s.x-s.lastX,dy=s.y-s.lastY,ox=s.lastX-e.x,oy=s.lastY-e.y,r=(e.r||0)+(s.hitRadius||0),a=dx*dx+dy*dy,b=2*(ox*dx+oy*dy),c=ox*ox+oy*oy-r*r;
  const u=c<=0?0:a>0?Math.max(0,Math.min(1,(-b-Math.sqrt(Math.max(0,b*b-4*a*c)))/(2*a))):0;
  s.x=s.lastX+dx*u;s.y=s.lastY+dy*u;
 }
 const towerMissileRadius=s=>Math.min(150,30+Math.hypot(s.x-s.originX,s.y-s.originY)*.2)*(s.spec?.blast||1);
 function update(dt){
  if(paused||!['combat','survival'].includes(state)||!Number.isFinite(dt)||dt<=0)return;
  syncWalls();
  // Small chronological slices keep production, supply and pickup timing consistent.
  let left=dt;while(left>1e-8){const delta=Math.min(.05,left);left-=delta;
   const live=list();pending=pending.filter(e=>live.includes(e.tower));
   const cell=hex()?HexMap.cellAt(p.x,p.y):{x:Math.round((p.x-325)/TILE),y:Math.round((p.y-300)/TILE)};
   for(const f of live){specialSupportStep(f,delta);if(f.kind==='biogenerator')bioStep(f,cell);if(f.kind==='repair_turret')repairStep(f,delta,live);}
   for(const q of pending){q.left-=delta;if(q.left<=1e-8){produce(q.tower,true);q.done=true;}}pending=pending.filter(q=>!q.done);
   const boostedTime=Math.min(delta,Math.max(0,10-roomElapsed)),batteries=live.filter(f=>f.kind==='battery');
   for(const f of live){f.damageBoostLeft=Math.max(0,f.damageBoostLeft-delta);f.pickupCool=Math.max(0,f.pickupCool-delta);f.flash=Math.max(0,f.flash-delta);f.muzzleLeft=Math.max(0,(f.muzzleLeft||0)-delta);if(f.kind==='echo'||f.kind==='repair_turret')continue;if(f.kind==='battery'){f.cool=Math.max(0,10-roomElapsed-delta);continue;}
    if(producer(f.kind)&&waiting(f))continue;
    const boosts=producer(f.kind)?batteries.filter(b=>recipients(b).includes(f)).length:0;
    f.cool=Math.max(0,f.cool-(delta+boostedTime*.3*boosts)*(supplyProducer(f.kind)?1+buffs.production:1)*(globalThis.Specializations?.stats(f.kind).rate||1));
   }
   for(const f of live)if(isDefenseTower(f.kind))defenseStep(f,delta);
   roomElapsed+=delta;
   for(const f of live){if(f.cool>1e-8||f.kind!=='turbine')continue;supply(f);f.cool=Math.max(.8,defs.turbine.interval*Math.pow(.82,f.count));}
   // Irrigation runs before fruit production so a completed cooldown is usable this frame.
   for(const f of live)if(f.kind==='irrigator'&&f.cool<=1e-8){produce(f);f.cool=defs.irrigator.interval;}
   for(const f of live)if(producer(f.kind)&&f.kind!=='irrigator'){if(!waiting(f)&&f.cool<=1e-8){if(produce(f)!==false)f.cool=defs[f.kind].interval;}if(f.products>0&&f.pickupCool<=1e-8&&f.cells.some(c=>{const at=center(c);return Math.hypot(p.x-at.x,p.y-at.y)<=24;}))pickup(f);}
   for(const q of pickupBursts)q.life-=delta;pickupBursts=pickupBursts.filter(q=>q.life>0).slice(-40);
   for(const q of pulses)q.life-=delta;pulses=pulses.filter(q=>q.life>0).slice(-60);
  }
 }
 function ensureCore(){if(typeof ENERGY_SYSTEM_ENABLED==='undefined'||!ENERGY_SYSTEM_ENABLED)return;const tile=tiles.find(t=>t.x===0&&t.y===0);if(!tile||tile.electricFacility)return;const f={id:++serial,kind:'energy',level:1,initialCore:true,anchor:{x:0,y:0},cells:[{x:0,y:0}],outputs:[],scopeMode:'none'};fresh(f);tile.terrainProtected=true;tile.electricFacility=f;renderer.sceneKey=null;}
 function startRoom({preserveRepair=false}={}){globalThis.Specializations?.clear();p.towerShieldLeft=0;roomElapsed=0;buffs.speed=buffs.attack=buffs.production=buffs.clocks=0;pending=[];pulses=[];pickupBursts=[];shots=shots.filter(s=>!s.bombLaser&&!s.tileMissile&&!s.towerBullet);for(const e of enemies)delete e.bombFrozenUntil;for(const f of list()){const target=f.workTarget,remaining=f.cool,keep=preserveRepair&&f.kind==='repair_turret'&&target&&repairTargets(f).some(t=>sameRepairTarget(t,target));fresh(f);if(keep){f.workTarget=target;f.cool=remaining;}}syncWalls();}
 function reset(){if(typeof p!=='undefined')p.towerShieldLeft=0;roomElapsed=0;buffs.speed=buffs.attack=buffs.production=buffs.clocks=0;for(const t of tiles){delete t.electricFacility;delete t.terrainProtected;}syncWalls();pending=[];pulses=[];pickupBursts=[];serial=0;globalThis.ElectricEditor?.reset();}
 function stroke(r,a,b,width,color){const dx=b[0]-a[0],dz=b[2]-a[2],length=Math.hypot(dx,dz)||1,nx=-dz/length*width,nz=dx/length*width;r.emissiveQuad([a[0]+nx,a[1],a[2]+nz],[b[0]+nx,b[1],b[2]+nz],[b[0]-nx,b[1],b[2]-nz],[a[0]-nx,a[1],a[2]-nz],color);}
 const borderMeshes=new WeakMap();
 function borderStrips(cells){
  const shape=HexMap.outline(cells),cached=borderMeshes.get(shape);if(cached)return cached;
  const vertices=new Map(),halfWidth=1.2;
  const vertex=(x,y)=>{const key=Math.round(x*1e5)+','+Math.round(y*1e5);if(!vertices.has(key))vertices.set(key,{x:x-325,z:(y-300)*1.06,normals:[]});return vertices.get(key);};
  const strips=shape.edges.map(edge=>{const a=vertex(edge.ax,edge.ay),b=vertex(edge.bx,edge.by),dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz),normal=[-dz/len,dx/len];a.normals.push(normal);b.normals.push(normal);return {edge,a,b};});
  // Adjacent segments share the exact same inner/outer miter vertices.
  // Independent flat-ended strokes leave triangular holes at hex corners.
  for(const v of vertices.values()){const [a,b=a]=v.normals,denom=1+a[0]*b[0]+a[1]*b[1],dx=(a[0]+b[0])*halfWidth/denom,dz=(a[1]+b[1])*halfWidth/denom;v.outer=[v.x+dx,5.1,v.z+dz];v.inner=[v.x-dx,5.1,v.z-dz];}
  const mesh=strips.map(({edge,a,b})=>({edge,points:[a.outer,b.outer,b.inner,a.inner]}));borderMeshes.set(shape,mesh);return mesh;
 }
 // Render with the electric gun's shared effects; keep visual evolution off the damage shot.
 function visual(){return dischargeVisual??=modelVisual(createWeaponModel('tesla_t3'));}
 function drawShot(s){if(s.towerBullet){const r=renderer,a=[s.x-325,s.height,(s.y-300)*1.06],speed=Math.hypot(s.vx,s.vy),length=s.towerSniper?30:16;stroke(r,a,[a[0]-s.vx/speed*length,a[1],a[2]-s.vy/speed*length*1.06],s.towerSniper?1:4.5,s.color);if(!s.towerSniper)r.projectile(...a,6.5,'#fff2b8');r.glow(...a,s.towerSniper?4:8,s.color);return;}if(s.tileMissile){drawMissile(s);return;}if(s.bombLaser){const r=renderer,a=[s.originX-325,s.height,(s.originY-300)*1.06],b=[s.x-325,s.height,(s.y-300)*1.06];const fade=Math.min(1,s.life/.18),pulse=1+.06*Math.sin(time*42);r.laserFlow(a[0],a[2],b[0],b[2],a[1],s.width*.85*pulse,time,.85*fade,s.color);r.laserFlow(a[0],a[2],b[0],b[2],a[1]+.1,s.width*.18,time*1.3,.9*fade,'#fff0fa');r.glow(a[0],a[1],a[2],12,s.color);return;}drawModelShot({...s,evolution:visual()});}
 function drawMissile(s){
  const r=renderer,x=s.x-325,z=(s.y-300)*1.06,y=s.height,angle=Math.atan2(s.vy*1.06,s.vx);
  for(let i=0;i<s.trail.length;i++){const q=s.trail[i],u=(i+1)/s.trail.length;r.glow(q.x-325,y,(q.y-300)*1.06,3*u,'#ff923c');if(i%3===0)fxCloud(q.x-325,y,(q.y-300)*1.06,4*(1-u)+2,3,'#b7a6a0',.18*u);}
  r.residentMesh('electric:friendly-missile',()=>{r.box(0,0,0,23,6,6,'#e6ddd2');r.box(12,0,0,7,5,5,'#ff8c37');r.box(-9,0,0,7,2,15,'#a95830');r.box(-9,0,0,7,13,2,'#a95830');r.emissiveBox(-14,0,0,6,4,4,'#fff0b5');},monsterPose(x,y,z,-angle,1.65,1.65,1.65));
  r.glow(x-Math.cos(angle)*28,y,z-Math.sin(angle)*28,10,'#ff9d4c');
 }
 // Blue plasma can: shared solid body, silver lid/pull tab and a front lightning label.
 function plasmaBombModel(r,kind='tower'){
  const shield=kind==='shield_tower',ice=kind==='freeze_bomb',laser=kind==='laser_bomb',missile=kind==='missile_bomb',body=shield?'#237d72':ice?'#53bbc9':laser?'#bc337f':missile?'#bd632a':'#168fce',light=shield?'#69f9de':ice?'#b4faff':laser?'#ff80c8':missile?'#ffc183':'#49cce8';
  const band=(bottom,top,radius,color)=>{for(let i=0;i<24;i++){const a=i*TAU/24,b=(i+1)*TAU/24;r.quad([Math.cos(a)*radius,bottom,Math.sin(a)*radius],[Math.cos(b)*radius,bottom,Math.sin(b)*radius],[Math.cos(b)*radius,top,Math.sin(b)*radius],[Math.cos(a)*radius,top,Math.sin(a)*radius],color);}};
  band(0,3,11,'#abb8ca');band(3,27,12,body);band(27,30,11,'#c6d6e6');
  r.disc(0,30,0,11,'#dce5ee');r.ring(0,30.3,0,10,'#7a8b9f',1.3);
  r.emissiveBox(-7,16,8,2,16,1,'#8beaff');
  r.emissiveRing(0,3.4,0,12.2,light,.8);r.emissiveRing(0,26.6,0,12.2,light,.8);
  // Raised oval pull tab, with its dark opening visible from the gameplay camera.
  for(let i=0;i<20;i++){const a=i*TAU/20,b=(i+1)*TAU/20;r.quad([Math.cos(a)*4,32+Math.sin(a)*2,-2+Math.sin(a)*6],[Math.cos(b)*4,32+Math.sin(b)*2,-2+Math.sin(b)*6],[Math.cos(b)*2.3,32+Math.sin(b)*2,-2+Math.sin(b)*3.8],[Math.cos(a)*2.3,32+Math.sin(a)*2,-2+Math.sin(a)*3.8],'#eef5ff');}
  r.disc(0,30.5,3,2,'#7a8b9f');
  if(shield){const points=[[-7,23],[0,26],[7,23],[6,14],[0,8],[-6,14]];for(let i=0;i<points.length;i++)r.emissiveQuad([0,18,12.4],[...points[i],12.4],[...points[(i+1)%points.length],12.4],[0,18,12.4],'#c7fff0');return;}
  if(ice){for(let i=0;i<3;i++){const a=i*Math.PI/3,dx=Math.cos(a)*8,dy=Math.sin(a)*8,nx=-Math.sin(a),ny=Math.cos(a);r.emissiveQuad([-dx+nx,16-dy+ny,12.4],[dx+nx,16+dy+ny,12.4],[dx-nx,16+dy-ny,12.4],[-dx-nx,16-dy-ny,12.4],'#e0ffff');}return;}
  if(missile){r.emissiveQuad([-4,10,12.4],[4,10,12.4],[4,20,12.4],[-4,20,12.4],'#fff0da');r.emissiveQuad([-6,20,12.4],[0,26,12.4],[6,20,12.4],[0,20,12.4],'#fff0da');return;}
  if(laser){for(const y of [10,16,22])r.emissiveBox(0,y,12.4,15,2,1,'#ffe0f4');return;}
  const bolt=[[1,24],[-6,15],[-1,15],[-3,7],[6,18],[1,18]];
  for(let i=1;i<bolt.length-1;i++)r.emissiveQuad([bolt[0][0],bolt[0][1],12.2],[bolt[i][0],bolt[i][1],12.2],[bolt[i+1][0],bolt[i+1][1],12.2],[bolt[i+1][0],bolt[i+1][1],12.2],'#dcfff1');
 }
 function defenseModel(r,kind){
  const authored=globalThis.CyberFacilityMeshes?.[kind];
  if(authored){
   if(kind!=='electric_tower'){r.data=authored;r.count=authored.length;return;}
   // Bake the lamp finish once into the resident mesh; never mutate the source asset.
   r.data=new Float32Array(authored.length+32768);r.data.set(authored);r.count=authored.length;
   for(let i=0;i<authored.length;i+=9){
    if(r.data[i+4]>1.5)continue;
    const c=[r.data[i+6],r.data[i+7],r.data[i+8]],l=Math.max(...c);
    // Keep dark foundation joints, lift the exposed metal to a cool luminous finish.
    if(l>.18){r.data[i+6]=Math.min(1,c[0]*1.12+.035);r.data[i+7]=Math.min(1,c[1]*1.15+.07);r.data[i+8]=Math.min(1,c[2]*1.16+.09);}
   }
   electricLampHead(r);return;
  }
  const color=defs[kind].color;r.disc(0,4,0,18,'#263d40');r.box(0,16,0,18,24,18,'#52717b');
  if(kind==='shotgun_tower'||kind==='sniper_tower'){
   r.box(0,29,0,24,14,20,'#c3d5dc');r.box(0,36,0,13,3,15,'#344b60');
   for(const z of kind==='shotgun_tower'?[-5,5]:[0]){r.box(kind==='sniper_tower'?22:15,31,z,kind==='sniper_tower'?48:27,6,6,'#344b60');r.emissiveBox(kind==='sniper_tower'?46:29,31,z,2,4,4,color);}
   if(kind==='sniper_tower'){r.box(3,40,0,18,5,5,'#263d40');r.emissiveBox(13,40,0,1,3,3,color);}
  }
  else if(kind==='slow_field'){for(const y of [12,22,32])r.emissiveRing(0,y,0,13,color,2);r.box(0,23,0,6,31,6,'#d6d9ef');r.sphere(0,41,0,6,color,1,1,1,3,6);}
  else if(kind==='electric_tower'){for(const y of [22,29,36])r.disc(0,y,0,12,'#a6d8e8');r.emissiveBox(0,36,0,5,17,5,color);electricLampHead(r);}
  else if(kind==='shield_tower'){r.disc(0,29,0,14,'#527c81');r.emissiveRing(0,36,0,13,color,2);r.sphere(0,36,0,9,'#9cffe7',1,1,1,3,6);}
  else if(kind==='healing_tower'){r.box(0,31,0,25,20,19,'#d6e7df');r.emissiveBox(0,31,10,15,4,1,color);r.emissiveBox(0,31,10,4,15,1,color);}
  else{r.box(0,30,0,25,15,23,'#886c55');for(const z of [-7,7]){r.box(8,32,z,25,8,8,'#d4deda');r.emissiveBox(21,32,z,2,5,5,color);}}
 }
 // A substantial opal electric globe, with baked shading so both surface shaders
 // retain a rounded luminous volume even with post-processing and point lights off.
 function electricLampHead(r){
  r.emissiveRing(0,44,0,7,'#91eaff',1.8);
  const radius=10.5,start=r.count;r.sphere(0,57,0,radius,'#75dfff',1,1,1,12,24);
  for(let i=start;i<r.count;i+=9){
   const nx=r.data[i]/radius,ny=(r.data[i+1]-57)/radius,nz=r.data[i+2]/radius;
   const light=Math.max(0,Math.min(1,.48+.32*ny-.22*nx+.16*nz));
   r.data[i+3]=0;r.data[i+4]=2;r.data[i+5]=0;
   r.data[i+6]=.24+.56*light;r.data[i+7]=.69+.27*light;r.data[i+8]=.9+.1*light;
  }
 }
 // Feathered, depth-tested alpha blobs; no point lights or screen blur.
 function electricLampBlob(r,x,y,z,radius){
  const rings=[0,.28,.55,.8,1],alpha=[.46,.34,.17,.045,0];
  const at=(rad,a)=>[x+Math.cos(a)*rad,y+Math.sin(a)*rad*.532,z-Math.sin(a)*rad*.847];
  for(let j=0;j<rings.length-1;j++)for(let i=0;i<24;i++){
   const a=i*TAU/24,b=(i+1)*TAU/24;
   r.transparentQuad(at(radius*rings[j],a),at(radius*rings[j+1],a),at(radius*rings[j+1],b),at(radius*rings[j],b),'#61dfff',[alpha[j],alpha[j+1],alpha[j+1],alpha[j]]);
  }
 }
 // Project the soft pool onto actual deck polygons, including neighboring tiles.
 // Subdivision samples a world-space falloff, so seams stay black and no light
 // sheet floats across holes or over the side of the island.
 function facilityFloorBlob(r,x,z,color){
  const alpha=p=>Math.max(0,(Math.exp(-((p[0]-x)**2+((p[2]-z)/1.06)**2)/2400)-.025)*.74);
  const triangle=(a,b,c)=>{const aa=alpha(a),ab=alpha(b),ac=alpha(c);if(Math.max(aa,ab,ac)<.002)return;r.transparentQuad(a,b,c,a,color,[aa,ab,ac,aa]);};
  for(const tile of tiles){
   const at=center(tile),cx=at.x-325,cz=(at.y-300)*1.06;
   if(Math.hypot(cx-x,(cz-z)/1.06)>120||terrainHidden(tile))continue;
   const lift=globalThis.RoomReady?.liftAt(cx,cz)||0;if(lift<0)continue;
   const y=2.3+lift,rad=hex()?HexMap.RADIUS-1:((TILE-2)/2),sides=hex()?6:4;
   for(let side=0;side<sides;side++){
    const angle=(hex()?Math.PI/6:Math.PI/4)+side*TAU/sides,next=angle+TAU/sides;
    const a=[cx,y,cz],b=[cx+Math.cos(angle)*rad,y,cz+Math.sin(angle)*rad*1.06],c=[cx+Math.cos(next)*rad,y,cz+Math.sin(next)*rad*1.06];
    const point=(i,j)=>[a[0]+(b[0]-a[0])*i/4+(c[0]-a[0])*j/4,y,a[2]+(b[2]-a[2])*i/4+(c[2]-a[2])*j/4];
    for(let i=0;i<4;i++)for(let j=0;j<4-i;j++){triangle(point(i,j),point(i+1,j),point(i,j+1));if(i+j<3)triangle(point(i+1,j),point(i+1,j+1),point(i,j+1));}
   }
  }
 }
 function repairTurretModel(r){
  const authored=globalThis.CyberFacilityMeshes?.repair_turret;
  if(authored){r.data=authored;r.count=authored.length;return;}
  r.disc(0,4,0,20,'#263d40');r.disc(0,8,0,16,'#607e77');r.box(0,17,0,15,19,15,'#35574f');
  r.box(0,29,2,25,14,19,'#83a69a');r.box(0,29,13,17,10,4,'#204139');r.emissiveBox(0,29,15.5,9,4,1,'#54e58b');
  r.emissiveBox(0,37,2,12,1,3,'#b9ffcd');r.emissiveBox(0,37,2,3,1,12,'#b9ffcd');
 }
 function drawRepairWork(f){
  for(const a of f.specAux||[])if(Number.isFinite(a.left))drawRepairWork({...f,workTarget:a.target,cool:a.left,specAux:[]});
  if(!f.workTarget)return;const r=renderer,at=repairPosition(f.workTarget),origin=facilityCenter(f),x=at.x-325,z=(at.y-300)*1.06,end=[x,5,z],muzzle=[origin.x-325,hex()?36:29,(origin.y-300)*1.06+15];
  monsterStrut(muzzle,end,2.3,'#54e58b');monsterStrut(muzzle,end,.7,'#d4ffe3');r.glow(x,6,z,15+Math.sin(time*17)*3,'#54e58b');
  r.residentMesh('electric:repair-work-hex',()=>{const radius=HexMap.RADIUS-3,point=(i,rad)=>{const a=Math.PI/6+i*TAU/6;return [Math.cos(a)*rad,0,Math.sin(a)*rad*1.06];};for(let i=0;i<6;i++)r.emissiveQuad(point(i,radius),point(i+1,radius),point(i+1,radius-2),point(i,radius-2),'#54e58b');},monsterPose(x,4,z));
  const progress=Math.max(0,Math.min(1,1-f.cool/defs.repair_turret.interval));
  r.residentMesh('electric:repair-work-back',()=>r.box(0,0,0,46,1.5,7,'#16352b'),monsterPose(x,5,z+20));
  if(progress>0)r.residentMesh('electric:repair-work-fill',()=>r.emissiveBox(0,0,0,1,1,5,'#88f6aa'),monsterPose(x-21+21*progress,6.5,z+20,0,42*progress));
  for(let i=0;i<3;i++){const a=time*9+i*TAU/3;r.glow(x+Math.cos(a)*8,7+(time*12+i*5)%14,z+Math.sin(a)*8,2,'#b6ffcf');}
 }
 function fruitModel(r,kind,flat=false){
  const c=fruits[kind].color,sphere=(x,y,z,size,color=c)=>r.sphere(x,flat?4.3:y,z,size,color,1,flat?.015:1,1,4,8);
  if(kind==='apple'){sphere(-5,0,0,10);sphere(5,0,0,10);r.emissiveBox(0,flat?4.5:12,0,3,flat?.1:8,3,'#a9d985');}
  if(kind==='watermelon'){r.sphere(0,flat?4.3:0,0,15,c,1.15,flat?.015:.8,.9,5,10);for(const x of [-7,0,7])r.emissiveBox(x,flat?4.5:11,0,2,.15,17,'#278d58');}
  if(kind==='banana')for(let i=0;i<5;i++)sphere(-12+i*6,Math.sin(i*Math.PI/4)*5,-Math.sin(i*Math.PI/4)*7,5.5);
  if(kind==='grape'){for(const [x,z]of [[-7,-6],[7,-6],[-7,6],[7,6],[0,15]])sphere(x,0,z,7);r.emissiveBox(0,flat?4.5:8,-14,3,flat?.1:7,8,'#91d189');}
 }
 const neonStorageKey='neon-tower-base-v1';
 const neonDefaults={center:1.4,middle:1,edge:.5,radius:.65,opacity:.96,white:.3};
 function neonRead(raw){
  let value;try{value=JSON.parse(raw)||{};}catch{value={};}
  const limits={center:[0,3],middle:[0,3],edge:[0,3],radius:[.15,.95],opacity:[0,1],white:[0,1]};
  return Object.fromEntries(Object.entries(neonDefaults).map(([k,v])=>[k,typeof value[k]==='number'&&Number.isFinite(value[k])?Math.max(limits[k][0],Math.min(limits[k][1],value[k])):v]));
 }
 let neonSettings=neonRead(null),neonRevision=0;
 try{neonSettings=neonRead(globalThis.localStorage?.getItem(neonStorageKey));}catch{}
 globalThis.addEventListener?.('storage',event=>{if(event.key===neonStorageKey||event.key===null){neonSettings=neonRead(event.newValue);neonRevision++;}});
 const neonMeshRevisions=new WeakMap();
 // Rebuild this small shared inlay only when the external panel changes settings.
 function towerNeonBase(r,kind,x,z){
  if(!hex())return;
  const meshKey='electric:tower-neon-base:'+kind,previous=r.residentMeshes?.get(meshKey);
  if(previous&&neonMeshRevisions.get(previous)!==neonRevision){
   if(previous.buffer)r.gl.deleteBuffer(previous.buffer);
   if(previous.poseBuffer)r.gl.deleteBuffer(previous.poseBuffer);
   r.residentMeshes.delete(meshKey);
  }
  const s=neonSettings,mesh=r.residentMaterial(meshKey,()=>{
   const radius=HexMap.RADIUS-2.5,color=r.color(defs[kind].color).map(c=>c*(1-s.white)+s.white),start=r.count;
   const point=(i,scale)=>{const a=Math.PI/6+i*TAU/6;return [Math.cos(a)*radius*scale,0,Math.sin(a)*radius*scale*1.06];};
   const vertex=(p,strength)=>r.vertex(p,[0,1,0],color.map(c=>c*strength));
   for(let i=0;i<6;i++){
    vertex([0,0,0],s.center);vertex(point(i+1,s.radius),s.middle);vertex(point(i,s.radius),s.middle);
    for(const [index,scale,strength]of [[i,s.radius,s.middle],[i+1,s.radius,s.middle],[i+1,1,s.edge],[i,s.radius,s.middle],[i+1,1,s.edge],[i,1,s.edge]])vertex(point(index,scale),strength);
   }
   r.markEmissive(start);
  },monsterPose(x,3.8,z),s.opacity);
  neonMeshRevisions.set(mesh,neonRevision);
 }
 // Ally towers share the player's cyan screen-space backlight. Keep ground
 // fills, work indicators and projectiles outside the silhouette group.
 function backlitTower(r,drawModel){
  const previous=r.outlineGroup;r.setOutlineGroup?.(1);
  try{return drawModel();}finally{r.setOutlineGroup?.(previous);}
 }
 function draw(){
  const r=renderer,baseLift=hex()?7:0,tintedCells=new Set();
  for(const f of list()){
   // Trace only the facility's outside edges, including concave farm footprints.
   for(const {edge,points}of borderStrips(f.cells)){const c=center(edge.tile),x=c.x-325,z=(c.y-300)*1.06;if(terrainHidden(tiles.find(t=>key(t)===key(edge.tile)))||(globalThis.RoomReady?.liftAt(x,z)||0)<0)continue;r.transparentQuad(...points,defs[f.kind].rarityColor,[.65,.65,.65,.65]);}
   for(const cell of f.cells){const at=center(cell),x=at.x-325,z=(at.y-300)*1.06;if(terrainHidden(tiles.find(t=>key(t)===key(cell))))continue;
    if(key(cell)===key(coreCell(f))&&defs[f.kind])facilityFloorBlob(r,x,z,f.kind==='electric_tower'?'#76e3fa':defs[f.kind].color);
    if(key(cell)===key(coreCell(f))){const icon=isBomb(f.kind)?facilityCenter(f):at;globalThis.MapIcons?.ground(r,f.kind,icon.x-325,(icon.y-300)*1.06,30.4,hex()?10.35:4.35,hex());}
    if((globalThis.RoomReady?.liftAt(x,z)||0)<0)continue;
    if(key(cell)===key(coreCell(f))&&(isDefenseTower(f.kind)||f.kind==='repair_turret'||f.kind==='shield_tower'))towerNeonBase(r,f.kind,x,z);
    if(key(cell)===key(coreCell(f))&&isDefenseTower(f.kind)&&f.kind!=='shield_tower'){
     const origin=facilityCenter(f),tx=origin.x-325,tz=(origin.y-300)*1.06;
     const authored=globalThis.CyberRangedTowerMeshes?.[f.kind];
     backlitTower(r,()=>{if(authored){
      // The Blender export separates the fixed foundation from the aiming head.
      r.residentMesh('electric:defense:'+f.kind+':base',()=>{r.data=authored.base;r.count=authored.base.length;},monsterPose(tx,baseLift,tz));
      r.residentMesh('electric:defense:'+f.kind,()=>{r.data=authored.head;r.count=authored.head.length;},monsterPose(tx,baseLift,tz,-(f.aim||0)));
     }else r.residentMesh('electric:defense:'+f.kind,()=>defenseModel(r,f.kind),monsterPose(tx,baseLift,tz,['missile_tower','shotgun_tower','sniper_tower'].includes(f.kind)?-(f.aim||0):0));});
     if(f.muzzleLeft>0&&['shotgun_tower','sniper_tower'].includes(f.kind)){
      const a=f.aim||0,dx=Math.cos(a),dz=Math.sin(a),sniper=f.kind==='sniper_tower',reach=authored?(sniper?44:22):(sniper?47:30);
      for(const side of sniper?[0]:[-7,7])r.muzzleFlash(tx+dx*reach-dz*side,baseLift+(sniper?31:32),tz+dz*reach+dx*side,a,sniper?52:35,f.muzzleLeft/.11);
     }
     if(f.kind==='electric_tower'){
      electricLampBlob(r,tx,57+baseLift,tz,26.25);
     }else r.glow(tx,35+baseLift,tz,f.flash>0?8:3,defs[f.kind].color);
    }
    if(key(cell)===key(coreCell(f))&&f.kind==='slow_field'){
     for(const c of tiles){
      if(tintedCells.has(key(c))||!inSlowField(f,c))continue;
      const at=center(c),cx=at.x-325,cz=(at.y-300)*1.06;
      if(terrainHidden(c)||(globalThis.RoomReady?.liftAt(cx,cz)||0)<0)continue;
      tintedCells.add(key(c));
      const points=hex()?Array.from({length:6},(_,i)=>{const a=Math.PI/6+i*TAU/6;return [cx+Math.cos(a)*(HexMap.RADIUS-1),3+baseLift,cz+Math.sin(a)*(HexMap.RADIUS-1)*1.06];}):[[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,z])=>[cx+x*(TILE-2)/2,3+baseLift,cz+z*(TILE*1.06-2)/2]);
      for(let i=1;i<points.length-1;i++)r.transparentQuad(points[0],points[i],points[i+1],points[0],defs.slow_field.color,[.12,.12,.12,.12]);
     }
    }
    if(key(cell)===key(coreCell(f))&&f.kind==='repair_turret'){backlitTower(r,()=>r.residentMesh('electric:repair-turret',()=>repairTurretModel(r),monsterPose(x,baseLift,z)));r.glow(x,30+baseLift,z,f.workTarget?7:3,'#54e58b');drawRepairWork(f);}
    if(f.kind==='irrigator'&&f.flash>0)r.ring(x,5+baseLift,z,20+(1-Math.min(1,f.flash/.3))*18,defs.irrigator.color,1.5);
    if(f.kind==='biogenerator'&&f.flash>0)r.ring(x,5+baseLift,z,20+(1-Math.min(1,f.flash/.4))*18,defs.biogenerator.color,1.5);
    // Only the core cell displays the facility cooldown.
    if(key(cell)===key(coreCell(f)))r.emissiveSquareScan(x,z,TILE-3,TILE*1.06-3,f.kind==='slow_field'||f.kind==='echo'||f.kind==='biogenerator'||producer(f.kind)&&waiting(f)?1:f.kind==='battery'?Math.max(0,1-roomElapsed/10):Math.max(0,Math.min(1,1-f.cool/(f.kind==='turbine'?Math.max(.8,defs.turbine.interval*Math.pow(.82,f.count)):defs[f.kind].interval))),progressColors[f.kind],.8);
    if(producer(f.kind)&&f.products>0&&key(cell)===key(coreCell(f))){
     const height=14+baseLift+(isBomb(f.kind)?0:Math.sin(time*3+f.id)*1.5);
     if(isFruit(f.kind)){r.glow(x,height+5,z,7,defs[f.kind].color);if(!globalThis.FruitModels?.draw(f.kind,x,8+baseLift+Math.sin(time*3+f.id)*1.2,z,34,time*.35))r.residentMesh('electric:fruit-pickup:'+f.kind,()=>fruitModel(r,f.kind),monsterPose(x,height,z));}
     else if(isBomb(f.kind)||f.kind==='shield_tower'){
      // Roll around the can's centre; only the instance pose changes, never the shared mesh.
      const tilt=.42,c=Math.cos(tilt),s=Math.sin(tilt);
      r.residentMesh(f.kind==='tower'?'electric:plasma-bomb':'electric:'+f.kind,()=>plasmaBombModel(r,f.kind),[c,-s,0,x+s*16,s,c,0,height+16-c*16,0,0,1,z]);
      r.glow(x,height+16,z,3,defs[f.kind].color);
     }
     else drawTilePickupChip(f.kind,x,height,z,defs[f.kind].rarityColor);
     for(let i=0;i<Math.min(6,f.products);i++)r.emissiveBox(x-10+i*4,5+baseLift,z+14,2,.15,3,defs[f.kind].color);
    }
   }
  }
  for(const q of pulses)stroke(r,[q.from.x-325,6,(q.from.y-300)*1.06],[q.to.x-325,6,(q.to.y-300)*1.06],1,q.color||'#bdedff');
  for(const q of pickupBursts){
   const age=.9-q.life,u=age/.9,x=q.x-325,z=(q.y-300)*1.06,fade=Math.sin(Math.PI*u);
   r.glow(x,17+u*15,z,7*fade,q.color||'#69fca0');
   if(q.range)r.ring(x,8,z,q.range*Math.min(1,u*3),q.color,2*(1-u));
   for(let i=0;i<4;i++){
    const a=i*Math.PI/2,rad=10,y=5+((u+i/4)%1)*24;
    const at=[x+Math.cos(a)*rad,y,z+Math.sin(a)*rad];
    stroke(r,at,[at[0]+Math.sin(a)*2,y+7*fade,at[2]-Math.cos(a)*2],.32*fade,q.color||'#98ffc1');
   }
  }
  for(const e of enemies)if(e.hp>0&&frozen(e)){
   const x=e.x-325,z=(e.y-300)*1.06,radius=(e.r||14)+5;
   r.residentMesh('electric:frozen-ring',()=>r.emissiveRing(0,0,0,1,'#a3f4ff',.04),monsterPose(x,12,z,0,radius));
   r.glow(x,18,z,7,'#a3f4ff');
  }
  if((p.towerShieldLeft||0)>0&&['combat','survival'].includes(state)&&typeof buildUFOHexShield==='function'){
   const pose=monsterPose(p.x-325,42+mountRiderLift()+playerUpperLift(),(p.y-300)*1.06,time*.3,.46,.46,.46);
   r.residentMaterial('ufo:shield-faces',()=>buildUFOHexShield(false),pose,.24);
   r.residentMaterial('ufo:shield-edges',()=>buildUFOHexShield(true),pose,1,1.35,time);
  }
  globalThis.ElectricEditor?.draw();
 }
 return {attackRange,activateEquipmentBomb,slowFieldAt,movementFactor,sniperDamage,isDefenseTower,towerMissileImpact,towerMissileRadius,isBomb,freezeStats,laserStats,missileStats,advanceMissile,frozen,advanceLaser,laserHits,ensureCore,defs,fruits,floorDefs,barricadeDefs,free,enabled,profile,syncWalls,repairTargets,syncAvailability,isFruit,shape,list,center,facilityCenter,coreCell,canPlace,place,remove,move,canMerge,merge,towerLevel,towerTargetLimit,towerDamage,towerAttackRange,recipients,update,startRoom,reset,draw,drawShot,speedBonus:()=>buffs.speed,attackBonus:()=>buffs.attack,productionBonus:()=>buffs.production,get buffs(){return {...buffs};},open:()=>globalThis.ElectricEditor?.open(),close:()=>globalThis.ElectricEditor?.close(),get editing(){return !!globalThis.ElectricEditor?.editing;}};
})();

globalThis.ElectricTiles.ensureCore();

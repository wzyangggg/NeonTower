'use strict';
globalThis.Chips=(()=>{
 const catalog=[
  ['repeat','复击回路','↻','枪械',v=>`实体枪械每轮有 ${v}% 概率补打一发。补射不会再次触发芯片。`],
  ['pierce','贯穿弹芯','⇥','枪械',v=>`每轮有 ${v}% 概率让一颗原始弹丸额外贯穿一名敌人。`],
  ['bounce','弹射弹芯','⌁','枪械',v=>`每轮标记一颗原始弹丸，首次命中时有 ${v}% 概率弹向 220 单位内另一名敌人，造成原弹 40% 的伤害。`],
  ['shotgun','密集霰弹','⁙','霰弹枪特化',v=>`霰弹枪每轮多发射 ${v} 颗弹丸，扇形角度保持不变。`,[3,3,4,4,5]],
  ['starter','备用武装','↔','开局功能',v=>`开局将默认手枪换为 ${v} 阶卡宾枪。`,[1,1,1,2,2]],
  ['radius','扩爆装药','◎','爆炸特化',v=>`火箭、追踪飞弹和装备炸弹的爆炸半径 +${v}%。`],
  ['power','高能装药','✦','数值强化',v=>`火箭、追踪飞弹和装备炸弹的爆炸伤害 +${v}%。`],
  ['large','扩径弹芯','','枪械',v=>`原始弹丸外观与命中直径 +${v}%，直接命中伤害 +10%。`],
  ['guide','微导弹芯','','枪械',v=>`原始弹丸飞出后向附近敌人修正一次，最多偏转 ${v}°。`,[8,9,10,12,14]],
  ['edge','淬火刃口','','近战','近身挥砍伤害 +15%。'],
  ['reach','延展剑锋','','近战','近身挥砍半径 +15%。'],
  ['sweep','广域挥斩','','近战','挥砍角度 +20°，上限 180°。原本更大的角度沿用原值。'],
  ['haste','轻量握柄','','近战','挥砍武器攻击间隔缩短 10%。'],
  ['counter','重刃回击','','近战','每轮首次挥砍命中有 20% 概率延迟 0.1 秒追加斩击，造成 40% 伤害。'],
  ['breach','破甲刃纹','','近战','挥砍命中后，目标受到的远程武器伤害 +10%，持续 2 秒。'],
  ['push','震荡握柄','','近战','挥砍获得轻击退，已有击退力度 +20%。'],
  ['fuse','快装引信','','炸弹',v=>`装备炸弹的充能时间缩短 ${v}%。`],
  ['firstBomb','首发备弹','','炸弹',v=>`本局首次装备炸弹时，初始冷却缩短 ${v}%。`],
  ['aftershock','余震装药','','炸弹',v=>`装备炸弹爆炸命中的普通敌人减速 ${v}%，持续 2 秒。`],
  ['mountDamage','武装增幅','','坐骑',v=>`坐骑自身武装伤害 +${v}%。`],
  ['mountRate','武装增压','','坐骑',v=>`坐骑自身武装攻击间隔缩短 ${v}%。`],
  ['mountMove','推进强化','','坐骑',v=>`装备坐骑期间基础移速 +${v}%。`]
 ].map(([id,name,symbol,type,effect,values=[10,15,20,27,35]])=>({id,name,symbol,type,effect,values}));
 const byId=new Map(catalog.map(chip=>[chip.id,chip]));
 const enabled=catalog.filter(chip=>chip.type!=='近战');
 const available=new Set(enabled.map(chip=>chip.id));
 const grades=[null,
  {name:'普通',color:'#a8b7b5',count:1},
  {name:'改良',color:'#78c997',count:2},
  {name:'精良',color:'#6daee9',count:3},
  {name:'史诗',color:'#be8fdf',count:3},
  {name:'传说',color:'#e8b565',count:3}
 ];
 // Cumulative tier weights, one row per campaign difficulty.
 const dropCutoffs=[
  [1],
  [.80,1],
  [.65,.93,1],
  [.58,.85,.96,1],
  [.55,.82,.94,.99,1]
 ];
 const ordinary=[
  ['damage','伤害',true],['rate','攻速',true],['crit','暴击率',true],['critDamage','暴击伤害',true],
  ['move','基础移速'],['inv','受击保护'],['heavy','武器减速减免'],
  ['speed','弹丸速度'],['blast','爆炸半径'],['knock','击退强度'],
  ['spread','散布角',false,true],['recoil','后坐位移',false,true],['pickup','拾取半径']
 ].map(([id,name,output=false,reduction=false])=>({id,name,output,reduction}));
 const functions=[
  ['heart','备用心脏','本局生命上限 +1，满血出战。'],
  ['shield','预充护盾','出战时获得 1 格护盾。'],
  ['revive','备用机体','本局首次受到致命伤害时，以 1 血复活并获得至少 2 秒无敌。'],
  ['pulse','绝境脉冲','本局首次受击降到 1 血时，清除 150 单位内的敌弹。'],
  ['repel','破盾反推','每层首次受击破盾时，击退 150 单位内的普通敌人。'],
  ['bonus','无伤津贴','本层未因受击损失生命时，通关额外获得 10 金币。'],
  ['coupon','采购券','本局第一次手动刷新普通商店免费。'],
  ['bombRate','爆后窗口','装备炸弹命中后，主武器攻速 +12%，持续 3 秒，冷却 12 秒。'],
  ['droneMark','分工协作','无人机标记敌人 3 秒。主武器首次命中该敌人时伤害 +15%。']
 ].map(([id,name,description])=>({id,name,description}));
 const ordinaryById=new Map(ordinary.map(a=>[a.id,a]));
 const functionById=new Map(functions.map(a=>[a.id,a]));
 const grade=item=>grades[item?.tier]||grades[1];
 const effect=item=>{
  const chip=byId.get(item.chipId);
  return typeof chip.effect==='function'?chip.effect(chip.values[item.tier-1]):chip.effect;
 };
 function describeAffix(affix){
  const skill=functionById.get(affix.id);
  if(skill)return `${skill.name} · ${skill.description}`;
  const stat=ordinaryById.get(affix.id);
  const value=affix.id==='crit'?`${affix.value} 个百分点`:affix.id==='critDamage'?`${(affix.value/100).toFixed(2)} 倍`:`${affix.value}%`;
  return `${stat.name} ${stat.reduction?'−':'+'}${value}`;
 }
 function roll(chipId,tier,random=Math.random){
  const pool=ordinary.slice(),affixes=[],minimum=8+2*tier;
  for(let i=0;i<grades[tier].count;i++){
   const candidates=tier===5&&i===0?pool.filter(a=>a.output):pool.flatMap(a=>a.output?[a]:[a,a,a]);
   const {id}=candidates[Math.floor(random()*candidates.length)];
   pool.splice(pool.findIndex(a=>a.id===id),1);
   affixes.push({id,value:minimum+Math.floor(random()*3)});
  }
  if(tier>=4)affixes.push({id:functions[Math.floor(random()*functions.length)].id});
  return {chipId,tier,affixes};
 }
 function normalize(item,id){
  const {chipId,tier,affixes}=item;
  const profile=grades[tier],minimum=8+2*tier;
  if(Number.isInteger(tier)&&profile&&Array.isArray(affixes)){
   const numeric=affixes.filter(a=>ordinaryById.has(a?.id)),special=affixes.filter(a=>functionById.has(a?.id));
   if(numeric.length===profile.count&&special.length===Number(tier>=4)&&affixes.length===numeric.length+special.length
     &&new Set(affixes.map(a=>a.id)).size===affixes.length
     &&numeric.every(a=>Number.isInteger(a.value)&&a.value>=minimum&&a.value<=minimum+2)
     &&(tier!==5||numeric.some(a=>ordinaryById.get(a.id).output))){
    return {id,chipId,tier,affixes:[...numeric.map(a=>({id:a.id,value:a.value})),...special.map(a=>({id:a.id}))]};
   }
  }
  // Old items get stable ordinary rolls even if the player reloads before changing a slot.
  let seed=id;
  return {id,...roll(chipId,1,()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296))};
 }
 function iconSrc(id,variant){
  if(!byId.has(id))return '';
  const path=`assets/chip-icons-v3/${id.toLowerCase()}-${variant}.png`;
  return globalThis.resolveOfflineAsset?.(path)??path;
 }
 function icon(id,size=48,variant=size){
  const src=iconSrc(id,variant);
  if(!src)return '';
  return `<img class="chip-icon" src="${src}" width="${size}" height="${size}" alt="" draggable="false">`;
 }
 const key='hell-elevator-chips-v1';
 const firearms=new Set(['pistol','pulse','smg','uzi','twin','rifle','sniper','barrett','magnum','rail','shotgun']);
 const inventory=new Map();
 let slots=[null,null,null],nextId=1,active=new Map(),stats=new Map(),powers=new Set();
 let firstBombUsed=false,used=new Set(),hpLost=false,bombHitAt=-Infinity,droneMarks=new WeakMap();
 function addInstance(item){
  inventory.set(item.id,normalize(item,item.id));
  nextId=Math.max(nextId,item.id+1);
 }
 try{
  const saved=JSON.parse(localStorage.getItem(key));
  if(saved&&typeof saved==='object'){
   let equipped=saved.slots;
   if(saved.version===3||saved.version===4){
    for(const item of Array.isArray(saved.inventory)?saved.inventory:[]){
     if(byId.has(item?.chipId)&&Number.isSafeInteger(item.id)&&item.id>0&&!inventory.has(item.id))addInstance(item);
    }
   }else{
    const legacy=Array.isArray(saved),firstCopy=new Map();
    for(const chip of catalog){
     const count=legacy?(saved.includes(chip.id)?1:0):saved.inventory?.[chip.id];
     if(!Number.isSafeInteger(count)||count<=0)continue;
     firstCopy.set(chip.id,nextId);
     for(let i=0;i<count;i++)addInstance({id:nextId,chipId:chip.id});
    }
    equipped=slots.map((_,i)=>firstCopy.get((legacy?saved:saved.slots)?.[i]));
   }
   const used=new Set();
   slots=slots.map((_,i)=>{
    const item=inventory.get(equipped?.[i]);
    if(!item||!available.has(item.chipId)||used.has(item.chipId))return null;
    used.add(item.chipId);return item.id;
   });
  }
 }catch{}
 function save(){try{localStorage.setItem(key,JSON.stringify({version:4,slots,inventory:[...inventory.values()]}));}catch{}}
 function acquire(item){
  if(typeof item==='string')item={chipId:item};
  if(!available.has(item?.chipId))return false;
  addInstance({...item,id:nextId});
  save();
  return true;
 }
 function drop(difficulty){
  const cutoffs=dropCutoffs[difficulty-1]||dropCutoffs[0];
  const chipId=enabled[Math.floor(Math.random()*enabled.length)].id,rarity=Math.random();
  return roll(chipId,cutoffs.findIndex(cutoff=>rarity<cutoff)+1);
 }
 function conflict(slot,id){
  const item=inventory.get(id);
  return !!item&&slots.some((other,i)=>i!==slot&&other!==id&&inventory.get(other)?.chipId===item.chipId);
 }
 function equip(slot,id){
  if(!Number.isInteger(slot)||slot<0||slot>=slots.length||!available.has(inventory.get(id)?.chipId)||conflict(slot,id))return false;
  const previous=slots.indexOf(id);
  if(previous>=0)slots[previous]=null;
  if(previous!==slot)slots[slot]=id;
  save();
  return true;
 }
 function start(useChips=true){
  active=new Map();stats=new Map();powers=new Set();used=new Set();firstBombUsed=false;bombHitAt=-Infinity;
  startFloor();
  for(const id of useChips?slots.filter(Boolean):[]){
   const item=inventory.get(id),chip=byId.get(item.chipId);
   active.set(chip.id,chip.values[item.tier-1]);
   for(const affix of item.affixes){
    if(functionById.has(affix.id))powers.add(affix.id);
    else stats.set(affix.id,(stats.get(affix.id)||0)+affix.value);
   }
  }
  return active.has('starter')?`rifle_t${core('starter')}`:'pistol_t1';
 }
 function startFloor(){hpLost=false;used.delete('repel');droneMarks=new WeakMap();}
 const core=id=>active.get(id)||0;
 const stat=id=>(stats.get(id)||0)/100;
 const power=id=>powers.has(id);
 const ready=id=>power(id)&&!used.has(id);
 function consume(id){if(!ready(id))return false;used.add(id);return true;}
 const has=id=>active.has(id);
 const mountRate=()=>1/(1-core('mountRate')/100);
 const weaponRate=()=>time<bombHitAt+3?1.12:1;
 function bombHit(){if(power('bombRate')&&time>=bombHitAt+12)bombHitAt=time;}
 function cadence(w){return has('haste')&&Number.isFinite(w.meleeDamage)?1/.9:1;}
 function bombCooldown(interval,initial=false){
  const first=initial&&!firstBombUsed; if(initial)firstBombUsed=true;
  return interval*(1-core('fuse')/100)*(1-(first?core('firstBomb')/100:0));
 }
 function emit(w,source,callback){
  const family=w.familyId||w.id;
  const ballistic=firearms.has(family)&&combatSource(source);
  const spreadEligible=ballistic||(w.id==='rocket'&&combatSource(source));
  const gun=source==='weapon'&&ballistic;
  const melee=(source==='weapon'||source==='drone')&&Number.isFinite(w.meleeDamage)
   &&['edge','reach','sweep','counter','breach','push'].some(has);
  if(!active.size||(!spreadEligible&&!melee))return callback();
  const start=shots.length,pellets=w.pellets,spread=w.spread,speed=w.speed;
  const dense=gun&&family==='shotgun'&&core('shotgun');
  const spreadReduction=spreadEligible?stat('spread'):0,speedBonus=ballistic?stat('speed'):0;
  if(dense){w.pellets=pellets+dense;w.spread=spread*(pellets-1)/(w.pellets-1);}
  if(spreadReduction&&Number.isFinite(w.spread))w.spread*=1-spreadReduction;
  if(speedBonus&&Number.isFinite(speed))w.speed*=1+speedBonus;
  try{callback();}
  finally{
   if(dense)w.pellets=pellets;
   if(dense||spreadReduction&&Number.isFinite(spread))w.spread=spread;
   if(speedBonus&&Number.isFinite(speed))w.speed=speed;
  }
  if(melee){
   const round={used:false};
   for(const shot of shots.slice(start)){
    if(!shot.slash||shot.specDerived||shot.drinkEcho)continue;
    shot.chipMelee=round;
    if(has('edge'))shot.damage*=1.15;
    if(has('reach'))shot.slashRadius*=1.15;
    if(has('sweep')){shot.slashSweep=Math.max(SWORD_SWEEP,Math.min(Math.PI,SWORD_SWEEP+Math.PI/9));shot.angle=shot.aim-shot.direction*shot.slashSweep/2;}
    if(has('push'))shot.chipPush=true;
   }
   return;
  }
  if(!gun)return;
  const originals=shots.slice(start).filter(s=>!s.specDerived&&!s.drinkEcho&&!s.beam&&!s.blastRadius&&!s.homing&&Math.hypot(s.vx,s.vy)>0);
  if(!originals.length)return;
  const middle=originals[Math.floor((originals.length-1)/2)];
  for(const shot of originals){
   if(has('large')){shot.chipSize=1+core('large')/100;shot.hitRadius=(shot.hitRadius??4)*shot.chipSize;shot.damage*=1.1;}
   if(has('guide'))shot.chipGuide=core('guide');
  }
  if(has('repeat')&&Math.random()<core('repeat')/100){
   const delay=Math.max(...originals.map(s=>s.launchDelay||0))+.075;
   shots.push({...middle,life:middle.life+delay-(middle.launchDelay||0),launchDelay:delay,hitTargets:new Set(),modelTrail:[],specDerived:true,specRound:null,chipGuide:false});
  }
  if(has('pierce')&&Math.random()<core('pierce')/100)middle.pierce=(middle.pierce??1)+1;
  if(has('bounce'))middle.chipBounce=core('bounce')/100;
 }
 function onHit(shot,enemy){
  if(shot.source==='bomb')bombHit();
  if(power('droneMark')){
   if(shot.source==='drone'&&enemy.hp>0)droneMarks.set(enemy,time+3);
   if(shot.source==='weapon')droneMarks.delete(enemy);
  }
  if(shot.chipMelee&&!shot.chipDerived){
   const round=shot.chipMelee;
   if(has('breach'))enemy.chipBreachUntil=time+2;
   if(shot.chipPush&&enemy.hp>0&&!enemy.transport&&enemy.type!=='rocket'&&!isBossBody(enemy)&&isAttackable(enemy)){
    const angle=Math.atan2(enemy.y-shot.y,enemy.x-shot.x),force=shot.knockback?shot.knockback*1.2:140;
    enemy.starterKick={x:Math.cos(angle)*force,y:Math.sin(angle)*force,left:.15};
   }
   if(!round.used){
    round.used=true;
    if(has('counter')&&Math.random()<.2)shots.push({...shot,damage:shot.damage*.4,age:0,angle:shot.aim-shot.direction*(shot.slashSweep||SWORD_SWEEP)/2,
     life:.14,launchDelay:.1,hitTargets:new Set(),arcTargets:[],chipDerived:true,chipMelee:null,chipPush:false,
     chipFixedOrigin:{x:shot.x,y:shot.y},specDerived:true,specRound:null});
   }
  }
  if(shot.chipAftershock&&enemy.hp>0&&!isBossBody(enemy)){
   enemy.chipSlowUntil=time+2;enemy.chipSlow=core('aftershock')/100;
  }
  if(!shot.chipBounce)return;
  const probability=shot.chipBounce;
  shot.chipBounce=false;
  if(Math.random()>=probability)return;
  const visited=new Set(shot.hitTargets);
  visited.add(enemy);
  const target=combatTargets().filter(e=>e.hp>0&&!visited.has(e)&&Math.hypot(e.x-enemy.x,e.y-enemy.y)<=220)
   .sort((a,b)=>Math.hypot(a.x-enemy.x,a.y-enemy.y)-Math.hypot(b.x-enemy.x,b.y-enemy.y))[0];
  if(!target)return;
  const angle=Math.atan2(target.y-enemy.y,target.x-enemy.x),speed=Math.hypot(shot.vx,shot.vy);
  shots.push({...shot,x:enemy.x,y:enemy.y,lastX:enemy.x,lastY:enemy.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,
   aim:angle,life:1,launchDelay:0,pierce:1,damage:shot.damage*.4,hitTargets:visited,modelTrail:[],specDerived:true,specRound:null});
 }
 function explosion(shot){
  const family=shot.ownerItem?.familyId||shot.weaponId;
  if(shot.source!=='bomb'&&!(shot.source==='weapon'&&['rocket','seeker'].includes(family)))return;
  shot.blastRadius*=1+core('radius')/100;
  shot.damage*=1+core('power')/100;
 }
 function guide(shot,dt){
  if(!shot.chipGuide||shot.specDerived||shot.launchDelay>0)return;
  shot.chipGuideAge=(shot.chipGuideAge||0)+dt;
  if(shot.chipGuideAge<.05)return;
  const max=shot.chipGuide*Math.PI/180;
  shot.chipGuide=false;
  const target=combatTargets().filter(e=>e.hp>0&&Math.hypot(e.x-shot.x,e.y-shot.y)<=400)
   .sort((a,b)=>Math.hypot(a.x-shot.x,a.y-shot.y)-Math.hypot(b.x-shot.x,b.y-shot.y))[0];
  if(!target)return;
  const current=Math.atan2(shot.vy,shot.vx),desired=Math.atan2(target.y-shot.y,target.x-shot.x);
  const delta=Math.atan2(Math.sin(desired-current),Math.cos(desired-current));
  if(Math.abs(delta)>Math.PI/3)return;
  const angle=current+Math.max(-max,Math.min(max,delta)),speed=Math.hypot(shot.vx,shot.vy);
  shot.vx=Math.cos(angle)*speed;shot.vy=Math.sin(angle)*speed;shot.aim=angle;
 }
 const sources=new Set(['weapon','drone','mount','mech','player','armor','glass','drink','bomb']);
 const combatSource=source=>sources.has(source);
 function prepare(shot){
  if(shot.chipPrepared||!combatSource(shot.source)||(!stat('blast')&&!stat('knock')))return;
  shot.chipPrepared=true;
  if(shot.blastRadius)shot.blastRadius*=1+stat('blast');
  if(shot.knockback)shot.knockback*=1+stat('knock');
 }
 function critical(shot,profile){
  if(!combatSource(shot.source)||shot.source==='bomb'||shot.drinkDot||shot.noCrit||!Number.isFinite(shot.critChance))return profile;
  const chance=stat('crit'),multiplier=stat('critDamage');
  return chance||multiplier?{chance:Math.min(1,profile.chance+chance),multiplier:profile.multiplier+multiplier}:profile;
 }
 function damage(shot,amount,target){
  if(combatSource(shot.source))amount*=1+stat('damage');
  if(shot.source==='mount')amount*=1+core('mountDamage')/100;
  if(target&&shot.source==='weapon'&&time<(droneMarks.get(target)??-Infinity))amount*=1.15;
  const family=shot.ownerItem?.familyId||shot.weaponId;
  if(time<(target?.chipBreachUntil||0)&&shot.source==='weapon'&&family!=='sword'&&family!=='crescent'&&!shot.slash)amount*=1.10;
  return amount;
 }
 function shieldBroken(){
  if(!consume('repel'))return;
  for(const enemy of enemies){
   if(enemy.hp<=0||enemy.transport||enemy.type==='boss'||enemy.type==='rocket'||isBossBody(enemy)||!isAttackable(enemy))continue;
   const dx=enemy.x-p.x,dy=enemy.y-p.y,distance=Math.hypot(dx,dy);
   if(distance>150)continue;
   enemy.starterKick={x:distance?160*dx/distance:160,y:distance?160*dy/distance:0,left:.15};
  }
  toast('破盾反推');
 }
 function healthHit(before){
  if(p.hp>=before)return;
  hpLost=true;
  if(p.hp<=0&&consume('revive')){
   p.hp=1;p.inv=Math.max(p.inv,2);
   toast('备用机体 · 复活');
  }else if(before>1&&p.hp>0&&p.hp<=1&&consume('pulse')){
   terrainClearNear(p.x,p.y,150);
   shockWaves.push({x:p.x,y:p.y,age:0});
   toast('绝境脉冲');
  }
 }
 return {byId,icon,iconSrc,grade,effect,describeAffix,view:()=>slots.slice(),
  inventory:()=>[...inventory.values()].filter(item=>available.has(item.chipId)).map(item=>({...item,affixes:item.affixes.map(a=>({...a}))})),
  conflict,equip,acquire,drop,start,startFloor,has,core,stat,power,ready,consume,weaponRate,cadence,mountRate,
  bombCooldown,bombHit,emit,onHit,explosion,guide,damage,critical,prepare,shieldBroken,healthHit,
  floorBonus:()=>power('bonus')&&!hpLost?10:0};
})();

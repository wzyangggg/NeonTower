'use strict';
// Permanent progression stays separate from run equipment and its mutable model state.
(function(root){
 const specs=[
  ['damage','伤害加成','通用战斗',10,5,'伤害加成','%','玩家、无人机、机甲共用；派生伤害不重复强化'],
  ['rate','攻速','通用战斗',10,4,'攻速','%','加快已有攻击周期；不加快治疗、补盾与生产'],
  ['crit','暴击率','通用战斗',10,1,'暴击率','个百分点','强化可暴击的攻击；最终暴击率不超过100%'],
  ['critDamage','暴击伤害倍率','通用战斗',10,0.1,'暴击伤害倍率','倍','增加已有暴击倍率；不让禁止暴击的攻击获得暴击'],
  ['spread','散布角减少','通用战斗',10,3,'散布角减少','%','缩小已有实体枪弹散布；零散布保持为零'],
  ['speed','弹丸速度','通用战斗',10,3,'弹丸速度','%','直线实体枪弹；不影响火箭、追踪弹与剑气'],
  ['blast','爆炸范围','通用战斗',5,2,'爆炸半径','%','玩家、无人机、机甲的已有爆炸半径统一增加'],
  ['knock','击退强度','通用战斗',5,3,'击退强度','%','强化已有击退；不新增击退能力，保留首领抗性'],
  ['recoil','后坐位移减少','操控',5,5,'后坐位移减少','%','减少实际后退；保留枪身回弹、火光与音效'],
  ['heavy','减速免疫','操控',5,5,'武器减速减免','%','按比例减免武器移速惩罚；满级减免原惩罚的25%'],
  ['move','移动速度','机体',10,1,'基础移速','%','提高玩家基础移速，含机甲驾驶；不改变无人机移速'],
  ['pickup','拾取范围','机体',10,2,'拾取范围','单位','增加补给的拾取距离'],
  ['inv','受击无敌时间','机体',5,.02,'受击无敌','秒','只延长受伤后保护；不延长坐骑特技无敌'],
  ['pointYield','分数收益','收益',5,10,'分数收益','%','已完成楼层的基础分按比例增加，零头在本局累计。'],
  ['reinforcements','增援密度','收益',5,10,'定时增援频率','%','每级加快普通战斗层的定时增援，沿用当前候选怪池。']
 ];
 const catalog=specs.map(([id,name,group,max,step,label,unit,desc])=>({id,name,group,max,step,label,unit,desc}));
 const attributes=Object.fromEntries(catalog.map(s=>[s.id,s]));
 const amount=(id,levels)=>{
  const {step,unit}=attributes[id];
  return (levels[id]||0)*step/(unit==='%'||unit==='个百分点'?100:1);
 };
 const attributePrices={
  damage:[25, 50, 125, 175, 275, 550, 975, 1300, 3000, 3750],
  rate:[25, 50, 125, 175, 275, 550, 975, 1300, 3000, 3750],
  crit:[15, 30, 75, 105, 165, 330, 585, 780, 1800, 2250],
  critDamage:[13, 25, 63, 88, 138, 275, 488, 650, 1500, 1875],
  spread:[4, 8, 19, 26, 41, 83, 146, 195, 450, 1500],
  speed:[3, 5, 13, 18, 28, 55, 98, 130, 300, 1500],
  blast:[10, 35, 110, 260, 1500],
  knock:[5, 18, 55, 130, 1500],
  recoil:[5, 18, 55, 130, 1500],
  heavy:[5, 18, 55, 130, 1500],
  move:[4, 8, 19, 26, 41, 83, 146, 195, 450, 1500],
  pickup:[3, 5, 13, 18, 28, 55, 98, 130, 300, 1500],
  inv:[10, 35, 110, 260, 1500],
  pointYield:[60, 175, 440, 1170, 3000],
  reinforcements:[10, 35, 110, 260, 750],
 };
 // Floor budgets are indexed by difficulty and physical floor, including bosses.
 const stageScores=[
  [5, 6, 5, 6, 6, 5, 5, 6, 5, 5, 9, 9, 9, 9, 10],
  [8, 8, 7, 10, 8, 10, 8, 8, 9, 8, 13, 13, 13, 15, 13, 10, 13, 13, 15, 18, 30],
  [13, 12, 13, 17, 12, 20, 13, 17, 22, 27, 55, 24, 22, 21, 24, 21, 22, 24, 31, 35, 25, 80],
  [19, 19, 19, 28, 19, 45, 27, 21, 27, 36, 120, 39, 33, 62, 39, 32, 33, 39, 49, 31, 63, 55, 47, 65, 56, 77, 200],
  [26, 26, 40, 26, 37, 28, 38, 57, 40, 80, 240, 54, 100, 54, 75, 57, 90, 97, 57, 74, 55, 320, 67, 76, 119, 98, 77, 90, 68, 96, 76, 122, 440],
 ];
 // Each optional scoring slot is [tier, points] and uses an existing non-elite monster.
 const stageScoreSlots=[
  {5:[2, 1], 15:[2, 1]},
  {4:[2, 2], 9:[2, 2], 14:[2, 2], 19:[2, 2], 20:[3, 5]},
  {4:[2, 4], 8:[2, 4], 9:[4, 10], 10:[4, 15], 12:[2, 4], 15:[2, 4], 18:[2, 4], 19:[4, 10], 20:[4, 15], 21:[2, 4]},
  {4:[2, 8], 7:[2, 8], 9:[2, 8], 10:[4, 18], 12:[2, 8], 14:[5, 30], 15:[2, 8], 18:[2, 8], 19:[4, 18], 21:[5, 30], 22:[2, 8], 24:[4, 18], 25:[2, 8], 26:[5, 30]},
  {3:[2, 12], 5:[2, 12], 7:[2, 12], 8:[4, 32], 9:[2, 12], 10:[6, 55], 12:[2, 12], 13:[6, 55], 14:[2, 12], 15:[4, 32], 16:[2, 12], 18:[6, 55], 19:[2, 12], 20:[4, 32], 21:[2, 12], 24:[2, 12], 25:[6, 55], 26:[4, 32], 27:[2, 12], 30:[4, 32], 31:[2, 12], 32:[6, 55]},
 ];
 function attributeCost(id,n){
  return Object.hasOwn(attributePrices,id)&&Number.isInteger(n)?attributePrices[id][n]??null:null;
 }
 const integer=v=>Number.isSafeInteger(v)&&v>=0?v:0,clone=v=>JSON.parse(JSON.stringify(v));
 const materialTiers=['低级','中级','高级'];
 const materialRarities=[{tier:1,color:'#a8b7b5'},{tier:3,color:'#6daee9'},{tier:5,color:'#e8b565'}];
 const materialCosts=[3,2,1];
 const materialCatalog=Object.fromEntries(Object.entries({skill:'技能手册',tower:'防御塔零件'}).flatMap(([kind,label])=>
  materialTiers.map((tier,i)=>[kind+i,{id:kind+i,kind,tier:i,name:tier+label,rarity:materialRarities[i],count:materialCosts[i]}])));
 // Low/mid quantities are full-clear budgets per family. High drops are per boss.
 const materialBudgets=[[24,4,0],[36,8,1],[48,12,1],[60,18,2],[84,24,2]];
 const rhythmHighBudgets=[0,1,2,4,6];
 function floorMaterials(difficulty,floor){
  const scores=stageScores[difficulty-1],budget=materialBudgets[difficulty-1];
  if(typeof campaignRhythmEnabled==='function'&&campaignRhythmEnabled()){
   const stages=campaignEndFloor(),bosses=stages/5;
   const share=(index,total,count)=>Math.ceil(index*count/total)-Math.ceil((index-1)*count/total);
   return [share(floor,stages,budget[0]),share(floor,stages,budget[1]),
    floor%5===0?share(floor/5,bosses,rhythmHighBudgets[difficulty-1]):0];
  }
  if(!scores?.[floor-1])return [0,0,0];
  const share=count=>Math.ceil(floor*count/scores.length)-Math.ceil((floor-1)*count/scores.length);
  return [share(budget[0]),share(budget[1]),budget[2]];
 }
 function materialBundle(...counts){
  return Object.fromEntries(Object.values(materialCatalog).map(({id,tier})=>[id,counts[tier]]).filter(([,count])=>count>0));
 }
 function attributeMaterial(id,n){
  const max=Object.hasOwn(attributes,id)?attributes[id].max:0;
  if(!Number.isInteger(n)||n<0||n>=max)return null;
  return materialCatalog['skill'+(n<max*.4?0:n<max*.8?1:2)];
 }
 function towerMaterial(tree,node){
  return materialCatalog['tower'+(node.stage<=2?0:node.stage===tree.depth?2:1)];
 }
 function materialStock(kind,inventory){
  const label=kind==='skill'?'技能手册':'防御塔零件';
  return label+' · '+materialTiers.map((tier,i)=>tier+' '+(inventory[kind+i]||0)).join(' / ');
 }
 function materialCostText(material,inventory){
  return `需 ${material.name} ×${material.count} · 持有 ${inventory[material.id]||0}`;
 }
 function materialCard(id,count,index,compact=false){
  const {name,rarity}=materialCatalog[id],size=compact?32:48;
  const path=`assets/material-icons-v1/${id}-${size}.png`,src=root.resolveOfflineAsset?.(path)??path;
  const label=`${name} ×${count}`;
  return `<span class="result-loot-item result-material" data-material-id="${id}" data-item-tier="${rarity.tier}" role="${compact?'img':'listitem'}" aria-label="${label}" title="${label}" style="--rarity:${rarity.color};--loot-delay:${index*65}ms"><img class="material-icon" src="${src}" width="${size}" height="${size}" alt=""><span class="material-count" aria-hidden="true">×${count}</span></span>`;
 }
 function runMaterialCards(counts=runMaterials){
  return Object.keys(materialCatalog).filter(id=>counts[id]).map((id,index)=>materialCard(id,counts[id],index));
 }
 function materialReceipt(raw){
  return Array.isArray(raw)&&typeof raw[0]==='string'&&Object.hasOwn(materialCatalog,raw[0])&&integer(raw[1])?[raw[0],raw[1]]:null;
 }
 function refundMaterial(inventory,receipt){
  if(!receipt)return true;
  const [id,count]=receipt,total=(inventory[id]||0)+count;
  if(!Number.isSafeInteger(total))return false;
  inventory[id]=total;
  return true;
 }
 function spendMaterial(inventory,{id,count}){
  if((inventory[id]||0)<count)return false;
  inventory[id]-=count;
  return true;
 }
 const researchCosts=[20,40,80,140,220];
 function createStore(storage,key='hell-elevator-talents-v1'){
  let data={version:1,balance:0,earned:0,levels:{},paid:{},revision:0,materials:{},attributeMaterialPaid:{},towerMaterialPaid:{}},warning='',persistence=true;
  const draftChanges=new WeakMap();
  function read(){if(!persistence)return;try{const raw=JSON.parse(storage?.getItem(key)||'null');if(!raw||raw.version!==1)return;const next={version:1,balance:integer(raw.balance),earned:integer(raw.earned),levels:{},paid:{},revision:integer(raw.revision)};if(raw.research&&typeof raw.research==='object'&&!Array.isArray(raw.research)){next.research={};for(const [id,n]of Object.entries(raw.research))if(/^[a-z_]+$/.test(id)&&Number.isInteger(n)&&n>=0&&n<=5)next.research[id]=n;}for(const s of catalog){const n=Math.min(s.max,integer(raw.levels?.[s.id]));const costs=raw.paid?.[s.id];if(n&&Array.isArray(costs)&&costs.length===n&&costs.every(v=>Number.isSafeInteger(v)&&v>0)){next.levels[s.id]=n;next.paid[s.id]=costs.slice();}}let refund=0,needsWrite=false;for(const id of ['shovel','hp','shield','pierce','laser','arc','drone']){const costs=raw.paid?.[id],n=integer(raw.levels?.[id]);if(n&&Array.isArray(costs)&&costs.length===n&&costs.every(v=>Number.isSafeInteger(v)&&v>0))refund+=costs.reduce((sum,v)=>sum+v,0);}if(root.TowerResearch){
    const {trees,validRoute,legacyRefund}=root.TowerResearch;
    next.towerPaths={};
    let towerRefund=0;
    for(const [id,tree] of Object.entries(trees)){
     const saved=raw.towerPaths?.[id],paid=validRoute(tree,saved);
     if(Object.keys(paid).length)next.towerPaths[id]=paid;
     // Older shotgun paths could switch columns. Refund purchases beyond the retained route.
     if(id==='shotgun_tower'&&saved){
      for(const node of tree.nodes){
       const cost=integer(saved[node.id]);
       if(cost&&!Object.hasOwn(paid,node.id))towerRefund+=cost;
      }
     }
     towerRefund+=legacyRefund(id,raw.towerResearch?.[id]);
    }
    const migrated=Object.keys(next.research||{}).filter(id=>Object.hasOwn(trees,id));
    for(const id of migrated)towerRefund+=researchCosts.slice(0,next.research[id]).reduce((sum,cost)=>sum+cost,0);
    if(Number.isSafeInteger(next.balance+refund+towerRefund)){
     for(const id of migrated)delete next.research[id];
     refund+=towerRefund;
     if((migrated.length||raw.towerResearch)&&!refund)needsWrite=true;
    }else if(raw.towerResearch)next.towerResearch=raw.towerResearch;
   }
   next.materials={};next.attributeMaterialPaid={};next.towerMaterialPaid={};
   for(const id of Object.keys(materialCatalog)){
    const count=integer(raw.materials?.[id]);
    if(count)next.materials[id]=count;
   }
   for(const [id,level] of Object.entries(next.levels)){
    for(let n=0;n<level;n++){
     const receipt=materialReceipt(raw.attributeMaterialPaid?.[id]?.[n]);
     if(receipt)(next.attributeMaterialPaid[id]??={})[n]=receipt;
    }
   }
   for(const [kind,paid] of Object.entries(next.towerPaths||{})){
    for(const id of Object.keys(paid)){
     const receipt=materialReceipt(raw.towerMaterialPaid?.[kind]?.[id]);
     if(receipt)(next.towerMaterialPaid[kind]??={})[id]=receipt;
    }
   }
   if(refund&&Number.isSafeInteger(next.balance+refund)){next.balance+=refund;needsWrite=true;}if(needsWrite)write(next);data=next;}catch{persistence=false;warning='本地存档不可用，本次进度仅保留在当前页面';}}
  function readResearch(){read();}
  function write(next){next.revision=Math.max(data.revision,next.revision)+1;try{storage?.setItem(key,JSON.stringify(next));}catch{persistence=false;warning='本地存档不可用，本次进度仅保留在当前页面';}data=next;return true;}

  function changeAttribute(draft,id,direction){
   if(!Object.hasOwn(attributes,id)||![1,-1].includes(direction))return false;
   const n=draft.levels[id]||0;
   if(direction===1){
    const cost=attributeCost(id,n),material=attributeMaterial(id,n);
    if(cost===null||draft.balance<cost||!spendMaterial(draft.materials,material))return false;
    draft.balance-=cost;
    draft.levels[id]=n+1;
    (draft.paid[id]??=[]).push(cost);
    (draft.attributeMaterialPaid[id]??={})[n]=[material.id,material.count];
   }else{
    if(!n||!draft.paid[id]?.length)return false;
    const receipts=draft.attributeMaterialPaid[id];
    if(!refundMaterial(draft.materials,receipts?.[n-1]))return false;
    if(receipts)delete receipts[n-1];
    draft.balance+=draft.paid[id].pop();
    draft.levels[id]=n-1;
   }
   return true;
  }
  read();
  return {key,catalog,get warning(){return warning;},view:()=>clone(data),refresh:read,
   cost:attributeCost,attributeMaterial,towerMaterial,
   credit(amount,materials={}){
    const entries=Object.entries(materials);
    if(!Number.isSafeInteger(amount)||amount<0||(!amount&&!entries.length))return false;
    read();
    const next=clone(data);
    next.balance+=amount;next.earned+=amount;
    if(!Number.isSafeInteger(next.balance)||!Number.isSafeInteger(next.earned))return false;
    for(const [id,count] of entries){
     if(!Object.hasOwn(materialCatalog,id)||!integer(count)||!refundMaterial(next.materials,[id,count]))return false;
    }
    return write(next);
   },
   researchCost(n){return Number.isInteger(n)&&n>=0&&n<5?researchCosts[n]:null;},
   researchLevel(id){readResearch();return data.research?.[id]??root.Specializations?.level(id)??0;},
   purchaseResearch(id,expectedLevel){
    if(!root.Specializations?.ids.includes(id)||root.TowerResearch?.catalog[id])return false;
    readResearch();const n=data.research?.[id]??root.Specializations.level(id),cost=this.researchCost(n);
    if(n!==expectedLevel||cost===null||data.balance<cost)return false;
    const next=clone(data);next.balance-=cost;next.research={...next.research,[id]:n+1};
    if(!write(next))return false;root.Specializations.set(id,n+1);return true;
   },
   purchaseTowerNode(kind,id,revision){
    const trees=root.TowerResearch?.trees;
    if(!trees||!Object.hasOwn(trees,kind))return false;
    const tree=trees[kind],node=tree.nodes.find(n=>n.id===id);
    if(!node)return false;
    read();
    const paid=data.towerPaths?.[kind]||{};
    if(data.revision!==revision||data.balance<node.cost||root.TowerResearch.routeState(tree,paid)[id].status!=='available')return false;
    const next=clone(data),material=towerMaterial(tree,node);
    if(!spendMaterial(next.materials,material))return false;
    next.balance-=node.cost;
    next.towerPaths={...next.towerPaths,[kind]:{...paid,[id]:node.cost}};
    (next.towerMaterialPaid[kind]??={})[id]=[material.id,material.count];
    return write(next);
   },
   resetTower(kind,revision){
    read();
    if(!data.towerPaths||!Object.hasOwn(data.towerPaths,kind)||data.revision!==revision)return false;
    const paid=data.towerPaths[kind];
    const refund=Object.values(paid).reduce((sum,cost)=>sum+cost,0);
    if(!Number.isSafeInteger(data.balance+refund))return false;
    const next=clone(data);next.balance+=refund;
    for(const receipt of Object.values(next.towerMaterialPaid[kind]||{}))if(!refundMaterial(next.materials,receipt))return false;
    delete next.towerPaths[kind];
    delete next.towerMaterialPaid[kind];
    return write(next);
   },
   draft(){readResearch();const draft=clone(data);draftChanges.set(draft,[]);return draft;},
   change(draft,id,direction){
    const changes=draftChanges.get(draft);
    if(!changes||!changeAttribute(draft,id,direction))return false;
    changes.push({id,direction});
    return true;
   },
   reset(draft){for(const s of catalog)while(this.change(draft,s.id,-1)){}},
   save(draft){
    read();
    const changes=draftChanges.get(draft);
    if(!changes||draft.revision!==data.revision)return false;
    const expected=clone(data);
    // Replay the draft against the latest wallet before committing.
    for(const {id,direction} of changes)if(!changeAttribute(expected,id,direction))return false;
    if(expected.balance!==draft.balance||catalog.some(({id})=>(expected.levels[id]||0)!==(draft.levels[id]??0)))return false;
    return write(expected);
   }  };
 }
 root.ElevatorTalents={catalog,createStore};
 let storage;try{storage=root.localStorage;}catch{}
 const store=createStore(storage),drops=[],seen=new WeakSet();let run={},runMaterials={},runEarned=0,pointRemainder=0,stageBonusRemainder=0,scoreStage=null,bossAwarded=new Set(),clock=0,draft=null,ui=null,noticeAt=-1,noticeAmount=0,lastNotice=-1,runWallet=0;
 const level=id=>run[id]||0;
 const runAmount=id=>amount(id,run);
 const active=()=>!globalThis.PromoMode?.active&&!testMode&&!snakeTest&&!virusTest&&!humanoidTest&&!droneBossTest&&!ufoBossTest&&!(typeof fishSchoolTest!=='undefined'&&fishSchoolTest)&&!(typeof weaponLab!=='undefined'&&weaponLab?.active);
 const ballistic=w=>['pulse','smg','rifle','sniper','barrett','magnum','twin','shotgun','rail','uzi'].includes(w.id);
 const combatSource=source=>['weapon','drone','mount','mech','player','armor','glass','drink'].includes(source);
 function value(s,n){return '+'+ +(s.step*n).toFixed(3)+(s.unit==='个百分点'?'%':s.unit);}
 function effect(s,n){return s.label+' '+value(s,n);}
 function applies(s,w){if(!w)return false;if(s.id==='spread')return (ballistic(w)||w.id==='rocket')&&w.spread>0;if(s.id==='speed')return ballistic(w);if(s.id==='recoil')return w.recoilDistance>0;if(s.id==='heavy')return w.speedPenalty>0;if(s.id==='blast')return w.blastRadius>0;if(s.id==='knock')return w.knockback>0;return true;}
 function damage(s,amount){return amount*(combatSource(s.source)?1+runAmount('damage'):1);}
 function critical(s){const eligible=combatSource(s.source)&&!s.drinkDot&&!s.noCrit&&Number.isFinite(s.critChance);return {chance:Math.min(1,(s.critChance||0)+(eligible ? runAmount('crit') : 0)),multiplier:(s.critMultiplier||2)+(eligible ? runAmount('critDamage') : 0)};}
 // Called once before flight/collision, including attacks emitted outside the weapon factory.
 function prepare(s){if(s.attributePrepared||!combatSource(s.source))return;s.attributePrepared=true;if(s.blastRadius)s.blastRadius*=1+.02*level('blast');if(s.knockback)s.knockback*=1+.03*level('knock');}
 function updateHud(){if(!ui)return;const value=store.view().balance;ui.hudValue.textContent=value.toLocaleString('zh-CN');ui.hud.title='可用分数 '+value+' · 本局获得 '+runEarned+' 分';ui.hud.disabled=false;ui.hud.setAttribute('aria-label','查看分数和属性，可用分数 '+value);for(const entry of document.querySelectorAll('.skill-entry'))entry.textContent='属性升级 ◇ '+value;}

 function currentScoreStage(){
  return scoreStage?.difficulty===activeDifficulty&&scoreStage.floor===floor?scoreStage:null;
 }
 function startStage(){
  const scores=stageScores[activeDifficulty-1];
  let budget=scores?.[floor-1];
  if(scores&&typeof campaignRhythmEnabled==='function'&&campaignRhythmEnabled()){
   const total=scores.reduce((sum,value)=>sum+value,0);
   const totalWeight=campaignEndFloor()*6/5;
   const weight=stage=>stage+Math.floor(stage/5);
   budget=Math.round(weight(floor)*total/totalWeight)-Math.round(weight(floor-1)*total/totalWeight);
  }
  if(!budget||!active()){scoreStage=null;return;}
  if(!currentScoreStage())scoreStage={difficulty:activeDifficulty,floor,budget,materials:floorMaterials(activeDifficulty,floor),denominator:1,killUnits:0,paid:0,lowPaid:0,closed:false};
 }
 function scoreRoster(roster){
  const stage=currentScoreStage();
  if(!stage||stage.closed||!roster.length)return;
  const slot=typeof campaignRhythmEnabled==='function'&&campaignRhythmEnabled()?null:stageScoreSlots[activeDifficulty-1][floor];
  const valuable=slot?roster.find(e=>e.enemyTier===slot[0]&&!e.elite):null;
  const reserved=slot?.[1]??0;
  const weight=e=>enemyTierProfile(e.enemyTier).points;
  // Integer numerators keep fractional kill shares exact until a whole point is earned.
  stage.denominator=Math.max(1,roster.reduce((sum,e)=>sum+(e===valuable?0:weight(e)),0));
  for(const e of roster)e.stageScoreUnits=e===valuable
   ?reserved*stage.denominator
   :(stage.budget-reserved)*weight(e);
 }
 function creditScore(value,materials={}){
  if(!store.credit(value,materials))return false;
  for(const [id,count] of Object.entries(materials))runMaterials[id]=(runMaterials[id]||0)+count;
  runEarned+=value;
  if(value)updateHud();
  return true;
 }
 function settleStage(bossDefeated=false){
  const stage=currentScoreStage();
  if(!stage||stage.closed||!active())return null;
  const bonus=stageBonusRemainder+stage.budget*attributes.pointYield.step*level('pointYield');
  const total=stage.budget+Math.floor(bonus/100);
  const due=total-stage.paid;
  const [low,mid,high]=stage.materials,materials=materialBundle(low-stage.lowPaid,mid,bossDefeated?high:0);
  if((due||Object.keys(materials).length)&&!creditScore(due,materials))return null;
  stageBonusRemainder=bonus%100;
  stage.closed=true;
  return total;
 }
 function showScoreGain(value){
  cashGemAbsorb(1,'#64cfff',false);
  noticeAmount=clock-lastNotice<.22?noticeAmount+value:value;
  lastNotice=clock;
  const existing=cashPopups.find(v=>v.skillPoint&&v.age<.22);
  if(existing){existing.text='分数 +'+noticeAmount;existing.age=0;}
  else cashPopups.push({skillPoint:true,text:'分数 +'+noticeAmount,x:p.x,y:p.y,height:100,age:0,life:.9});
  if(clock-noticeAt>.09){beep(1160,.055,'sine',.035);noticeAt=clock;}
  if(ui){ui.hud.classList.remove('skill-bump');void ui.hud.offsetWidth;ui.hud.classList.add('skill-bump');}
 }
 function collect(q){
  if(q.done)return;
  q.done=true;
  if(!active())return;
  const bonus=pointRemainder+q.value*attributes.pointYield.step*level('pointYield');
  const value=q.value+Math.floor(bonus/100);
  if(!creditScore(value))return;
  pointRemainder=bonus%100;
  showScoreGain(value);
 }
 function spawn(x,y,value){if(!active()||!Number.isFinite(x+y)||!Number.isSafeInteger(value)||value<=0)return null;if(drops.length>=64){const nearest=drops.reduce((a,b)=>Math.hypot(a.x-x,a.y-y)<Math.hypot(b.x-x,b.y-y)?a:b);nearest.value+=value;return nearest;}const q={...makePickupCrystal(x,y),value,done:false,attract:false};drops.push(q);return q;}
 function onKill(e){
  if(!active()||seen.has(e))return;
  seen.add(e);
  if(campaignBoss||isBossBody(e)||['rocket','turret','droneMinion','ufoMinion'].includes(e.type)||e.weaponLabTarget||e.escaped||e.roomCleanup||e.selfDetonated)return;
  const stage=currentScoreStage();
  if(stage){
   if(stage.closed||!(e.hp<=0)||!e.stageScoreUnits)return;
   stage.killUnits+=e.stageScoreUnits;
   const earned=Math.min(stage.budget,Math.floor(stage.killUnits/stage.denominator));
   const due=earned-stage.paid;
   const low=Math.min(stage.materials[0],Math.ceil(stage.killUnits*stage.materials[0]/(stage.budget*stage.denominator)));
   const lowDue=low-stage.lowPaid;
   const materials=materialBundle(lowDue,0,0);
   if((due||lowDue)&&creditScore(due,materials)){
    stage.paid=earned;stage.lowPaid=low;
    if(due)showScoreGain(due);
    if(lowDue){
     const markup=Object.entries(materials).map(([id,count],index)=>materialCard(id,count,index,true)).join('');
     cashPopups.push({materialGain:markup,x:e.x,y:e.y,height:70,age:0,life:1.1});
     if(cashPopups.length>24)cashPopups.shift();
    }
   }
   return;
  }
  if(Math.random()<.25)spawn(e.x,e.y,enemyTierProfile(e.enemyTier).points);
 }
 function sweep(){if(!active())return;for(const q of drops){q.attract=true;q.scatterTime=Math.min(q.scatterTime,q.age);}}
 function tick(dt){
  if(paused||!p||state==='dead'||state==='menu'||state==='won')return;
  clock+=dt;if(!active()){drops.length=0;return;}
  for(const q of drops){
   if(advancePickupCrystal(q,dt))collect(q);
   q.attract=q.age>=q.scatterTime;
  }
  for(let i=drops.length-1;i>=0;i--)if(drops[i].done)drops.splice(i,1);
 }
 function drawDrops(){
  const r=renderer;
  for(const q of drops){
   // Player standing height is about 54 units. Crystals are scaled to 1.5 times their original size.
   const big=q.value>=20,size=(big?10:9)*1.5,x=q.x-325,z=(q.y-300)*1.06,h=q.height,spin=q.age*3.4;
   r.residentMesh('skill-crystal:outer',()=>{
    const corners=[[.65,0,0],[0,0,.65],[-.65,0,0],[0,0,-.65]];
    for(let i=0;i<4;i++){const a=corners[i],b=corners[(i+1)%4];r.quad([0,1,0],a,b,[0,1,0],i%2?'#429bca':'#286b98');r.quad([0,-1,0],b,a,[0,-1,0],i%2?'#337eaa':'#245c86');}
   },monsterPose(x,h,z,spin,size,size,size));
   // All twelve octahedron edges are solid emissive blue rods, independent of scene light.
   r.residentMesh('skill-crystal:blue-frame',()=>{
    const corners=[[.65,0,0],[0,0,.65],[-.65,0,0],[0,0,-.65]],edges=[];
    for(let i=0;i<4;i++){edges.push([[0,1,0],corners[i]],[[0,-1,0],corners[i]],[corners[i],corners[(i+1)%4]]);}
    for(const [a,b]of edges){
     const d=b.map((v,i)=>v-a[i]),length=Math.hypot(...d),axis=d.map(v=>v/length),reference=Math.abs(axis[1])>.9?[1,0,0]:[0,1,0],cross=(u,v)=>[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],u=cross(axis,reference),uLength=Math.hypot(...u),side=u.map(v=>v/uLength),up=cross(axis,side),at=(p,angle)=>p.map((v,i)=>v+.12*(side[i]*Math.cos(angle)+up[i]*Math.sin(angle)));
     for(let i=0;i<6;i++){const t=i*Math.PI/3,next=(i+1)*Math.PI/3;r.emissiveQuad(at(a,t),at(b,t),at(b,next),at(a,next),i%2?'#b4efff':'#4fcaff');}
    }
   },monsterPose(x,h,z,spin,size,size,size));
   r.residentMesh('skill-crystal:core',()=>r.emissiveBox(0,0,0,.22,.36,.22,'#b0edff'),monsterPose(x,h,z,spin,size,size,size));
   r.glow(x,h,z,(7+.45*Math.sin(q.age*3))*1.5,'#48c4ff');
   drawPickupCrystalTrail(q,'#64cfff');
  }
 }
 function withWeapon(w,source,emit){if(!combatSource(source))return emit();const saved=new Map(),set=(key,value)=>{if(!saved.has(key))saved.set(key,{has:Object.prototype.hasOwnProperty.call(w,key),value:w[key]});w[key]=value;};if(ballistic(w)||w.id==='rocket')set('spread',(w.spread||0)*(1-.03*level('spread')));if(ballistic(w))set('speed',(w.speed||0)*(1+.03*level('speed')));try{return emit();}finally{for(const [key,v]of saved)if(v.has)w[key]=v.value;else delete w[key];}}
 function decorate(start,w,source){if(!combatSource(source))return;for(let i=start;i<shots.length;i++)prepare(shots[i]);}
 function attributeIcon(id){
  if(id==='core')return '<span class="attribute-core-icon" aria-hidden="true">⬡</span>';
  const asset={critDamage:'crit_damage',pointYield:'pickup',reinforcements:'spread'}[id]||id;
  return `<span class="attribute-icon"><img src="assets/attribute-icons-v1/${asset}-32.png" width="32" height="32" alt="" draggable="false"></span>`;
 }
 const tree={
  core:[null,50,270],damage:['core',31,174],spread:['core',85,270],move:['core',31,380],
  rate:['damage',14,81],crit:['damage',49,81],blast:['rate',14,-10],critDamage:['crit',49,-10],
  speed:['spread',85,137],recoil:['spread',85,370],knock:['recoil',85,470],
  pickup:['move',14,480],heavy:['move',47,480],inv:['heavy',47,580],
  pointYield:['core',15,270],reinforcements:['core',58,380]
 };
 // Leave every previously invested attribute reachable, including its path in an older save.
 function visibleAttributes(levels){
  const visible=new Set(['core']);
  for(const [id,[parent]] of Object.entries(tree)){
   if(parent==='core'||levels[parent]>0)visible.add(id);
   if(levels[id]>0)for(let node=id;node&&!visible.has(node);node=tree[node][0])visible.add(node);
  }
  return visible;
 }
 function canTrain(id,levels){const parent=tree[id]?.[0];return parent==='core'||levels[id]>0||levels[parent]>0;}
 let selectedAttribute='core';
 const treeViewKey='hell-elevator-attribute-view-v1';
 let treeX=0,treeY=0,treeTop=0,treeHeight=0;
 function restoreTreeView(){
  try{
   const saved=JSON.parse(localStorage.getItem(treeViewKey));
   if(Number.isFinite(saved?.x)&&Number.isFinite(saved?.y)){treeX=saved.x;treeY=saved.y;}
   if(typeof saved?.selected==='string'&&Object.hasOwn(tree,saved.selected))selectedAttribute=saved.selected;
  }catch{}
 }
 function saveTreeView(){
  try{localStorage.setItem(treeViewKey,JSON.stringify({x:treeX,y:treeY,selected:selectedAttribute}));}catch{}
 }
 function positionTree(){
  const board=ui.list.firstElementChild,width=ui.list.clientWidth,height=ui.list.clientHeight;
  if(!board||!width||!height)return;
  const coreOffset=tree.core[2]-treeTop,margin=92;
  const xLimit=Math.min(120,width*.30);
  const minY=Math.min(-margin,height/2+coreOffset-treeHeight-margin);
  const maxY=Math.max(margin,coreOffset-height/2+margin);
  treeX=Math.max(-xLimit,Math.min(xLimit,treeX));
  treeY=Math.max(minY,Math.min(maxY,treeY));
  board.style.transform=`translate(${treeX}px,${treeY-coreOffset}px)`;
  ui.list.style.backgroundPosition=`${treeX}px ${treeY}px`;
 }
 function layoutTree(){
  positionTree();
  const width=ui.list.clientWidth,svg=ui.list.querySelector('.attribute-tree svg');
  if(!svg||!width)return;
  svg.setAttribute('viewBox',`0 ${treeTop} ${width} ${treeHeight}`);
  for(const path of svg.querySelectorAll('path')){
   const [parent,x,y]=tree[path.dataset.to], [,px,py]=tree[parent];
   const fromX=px*width/100,toX=x*width/100;
   const dx=toX-fromX,dy=y-py,diagonal=Math.min(Math.abs(dx),Math.abs(dy));
   if(!dx||!dy){
    path.setAttribute('d',`M${fromX} ${py} L${toX} ${y}`);
    continue;
   }
   const diagonalX=Math.sign(dx)*diagonal,diagonalY=Math.sign(dy)*diagonal;
   const bendX=fromX+(dx-diagonalX)/2,bendY=py+(dy-diagonalY)/2;
   path.setAttribute('d',`M${fromX} ${py} L${bendX} ${bendY} L${bendX+diagonalX} ${bendY+diagonalY} L${toX} ${y}`);
  }
 }
 function bindTreeView(){
  const list=ui.list;
  let drag=null,suppressClick=false;
  restoreTreeView();
  new ResizeObserver(layoutTree).observe(list);
  list.addEventListener('pointerdown',event=>{
   if(!event.isPrimary||event.button!==0)return;
   suppressClick=false;
   drag={id:event.pointerId,x:event.clientX,y:event.clientY,baseX:treeX,baseY:treeY,active:false};
  });
  list.addEventListener('pointermove',event=>{
   if(drag?.id!==event.pointerId)return;
   const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
   if(!drag.active){
    if(Math.hypot(dx,dy)<5)return;
    drag.active=suppressClick=true;
    list.setPointerCapture(event.pointerId);
    list.classList.add('dragging');
   }
   treeX=drag.baseX+dx;treeY=drag.baseY+dy;positionTree();
  });
  function stop(event){
   if(drag?.id!==event.pointerId)return;
   if(drag.active)saveTreeView();
   drag=null;
   list.classList.remove('dragging');
  }
  for(const type of ['pointerup','pointercancel','lostpointercapture'])list.addEventListener(type,stop);
  list.addEventListener('pointerleave',event=>{if(!drag?.active)stop(event);});
  list.addEventListener('click',event=>{
   if(suppressClick&&event.detail){event.stopImmediatePropagation();suppressClick=false;}
  },true);
  list.addEventListener('wheel',event=>{
   event.preventDefault();
   const step=event.deltaMode===1?16:event.deltaMode===2?list.clientHeight:1;
   treeY-=event.deltaY*step;positionTree();saveTreeView();
  },{passive:false});
  list.addEventListener('focusin',event=>{
   if(!event.target.matches('.attribute-tree-card:focus-visible'))return;
   const card=event.target.getBoundingClientRect(),bounds=list.getBoundingClientRect();
   treeX+=Math.max(0,bounds.left-card.left)-Math.max(0,card.right-bounds.right);
   treeY+=Math.max(0,bounds.top-card.top)-Math.max(0,card.bottom-bounds.bottom);
   positionTree();
  });
  $('attribute-center').onclick=()=>{
   treeX=treeY=0;selectedAttribute='core';renderPanel();saveTreeView();
  };
 }
 const showUnknownAttributes=false;
 function renderPanel(){
  const focus=document.activeElement?.dataset.attribute;
  const visible=visibleAttributes(draft.levels);
  if(!visible.has(selectedAttribute))selectedAttribute='core';
  const unknown=showUnknownAttributes?Object.keys(tree).filter(id=>{
   const parent=tree[id][0];
   return !visible.has(id)&&visible.has(parent)&&canTrain(parent,draft.levels);
  }):[];
  const displayed=[...visible,...unknown];
  const ys=displayed.map(id=>tree[id][2]),top=Math.min(...ys)-43,height=Math.max(...ys)-top+43;
  treeTop=top;treeHeight=height;
  const edges=[],cards=[];
  for(const id of displayed){
   const [parent,x,y]=tree[id],s=catalog.find(item=>item.id===id),n=draft.levels[id]||0;
   if(!visible.has(id)){
    edges.push(`<path data-to="${id}" class="unknown"/>`);
    cards.push(`<div class="research-card attribute-tree-card attribute-unknown" style="left:${x}%;top:${y-top}px" role="img" aria-label="未发现的属性槽位"><span class="research-card-art"><span class="attribute-core-icon" aria-hidden="true">?</span><strong aria-hidden="true">未发现</strong></span><span class="research-card-info" aria-hidden="true"></span></div>`);
    continue;
   }
   const name=s?.name||'角色核心';
   if(parent)edges.push(`<path data-to="${id}" class="${n?'invested':''}"/>`);
   const stars=s?Array.from({length:5},(_,i)=>`<span class="${n>=(i+1)*s.max/5?'lit':''}">★</span>`).join(''):'✓';
   const icon=attributeIcon(id);
   cards.push(`<button type="button" class="research-card attribute-tree-card${n?' researched':''}${s?'':' attribute-core-active'}" data-attribute="${id}" style="left:${x}%;top:${y-top}px" aria-pressed="${selectedAttribute===id}" aria-label="${name}${s?`，${n} / ${s.max} 级`:'，已激活'}"><span class="research-card-art">${icon}<strong>${name}</strong></span><span class="research-card-info"><span class="research-stars" aria-hidden="true">${stars}</span></span></button>`);
  }

  ui.list.innerHTML=`<div class="attribute-tree" style="height:${height}px"><svg aria-hidden="true">${edges.join('')}</svg>${cards.join('')}</div>`;
  layoutTree();
  if(focus)ui.list.querySelector(`[data-attribute="${focus}"]`)?.focus({preventScroll:true});
  const s=catalog.find(item=>item.id===selectedAttribute);
  $('attribute-preview').innerHTML=attributeIcon(selectedAttribute);
  ui.upgrade.hidden=!s;
  if(s){
   const n=draft.levels[s.id]||0,cost=store.cost(s.id,n),material=store.attributeMaterial(s.id,n);
   const materialShort=material&&Math.max(0,material.count-(draft.materials[material.id]||0));
   const blocked=!canTrain(s.id,draft.levels);
   const comparison=cost===null?value(s,n):value(s,n)+' → '+value(s,n+1);
   const prices=Array.from({length:s.max},(_,i)=>store.cost(s.id,i).toLocaleString('zh-CN'));
   const priceRows=prices.map((price,i)=>{
    const m=store.attributeMaterial(s.id,i);
    return `<li><span>${i+1} 级</span><b>${price} 分 + ${materialTiers[m.tier]} ×${m.count}</b></li>`;
   }).join('');
   ui.detail.innerHTML=`<strong>${s.name} <small>${n} / ${s.max} 级</small></strong><span class="attribute-current">${comparison}</span>
    ${material?`<small class="material-cost">${materialCostText(material,draft.materials)}</small>`:''}
    <details class="attribute-prices"><summary>各级费用 · 满级一笔 ${prices.at(-1)} 分</summary><ol>${priceRows}</ol></details><small>${s.desc}</small>`;
   ui.upgrade.dataset.skill=s.id;
   ui.upgrade.disabled=blocked||cost===null||draft.balance<cost||materialShort>0;
   ui.upgrade.textContent=blocked?'需先提升前置':cost===null?'已满级':draft.balance<cost?`还差 ${cost-draft.balance} 分`:materialShort?`材料差 ${materialShort} 件`:`加 1 级 · ◇ ${cost}`;
  }else{
   ui.detail.innerHTML=`<strong>角色核心 <small>已激活</small></strong><small>${materialStock('skill',draft.materials)}</small><small>提升相邻属性，发现下一段分支。</small>`;
   delete ui.upgrade.dataset.skill;
   ui.upgrade.disabled=true;
  }
  ui.status.textContent=store.warning||'';
 }
 function open(){if(!['menu','dead','won'].includes(state)){toast('分数 '+store.view().balance+' · 出发前可分配\n本局属性 '+Object.values(run).reduce((a,b)=>a+b,0)+'级');return;}draft=store.draft();ui.panel.hidden=false;ui.close.textContent='返回';releaseJoy();Object.keys(keys).forEach(k=>keys[k]=false);renderPanel();ui.close.focus();}
 function close(){globalThis.UIMotion?.exit(ui.panel,'right');ui.panel.hidden=true;draft=null;ui.hud.focus();globalThis.LobbyUI?.onCharacterClose();}
 // Always start from the latest shared wallet, then persist each completed action.
 function allocate(id,direction){
  if(!['menu','dead','won'].includes(state))return;
  const next=store.draft();
  if(id!==null&&direction===1&&draft&&draft.revision!==next.revision){
   const quoted=store.cost(id,draft.levels[id]||0);
   if(quoted!==store.cost(id,next.levels[id]||0)){
    draft=next;renderPanel();updateHud();ui.status.textContent='升级费用已更新，请确认后再试';return;
   }
  }
  if(id===null){store.reset(next);selectedAttribute='core';treeX=treeY=0;}
  else if((direction===1&&!canTrain(id,next.levels))||!store.change(next,id,direction)){
   draft=next;renderPanel();updateHud();return;
  }
  const saved=store.save(next);draft=store.draft();renderPanel();saveTreeView();updateHud();
  if(!saved)ui.status.textContent='余额已变化，请重试';
 }
 function init(){if(ui||!document.createElement)return;const css=document.createElement('link');css.rel='stylesheet';css.href='talents.css';if(!document.getElementById('talents-inline-style'))document.head.append(css);const hud=document.createElement('button');hud.className='skill-wallet';hud.id='skill-wallet';hud.type='button';
  hud.innerHTML='<img class="skill-wallet-icon" src="assets/score-crystal/score_prism-32.png" alt="" width="32" height="32"><span class="skill-wallet-label">分数</span><strong class="skill-wallet-value"></strong>';
  $('viewport').append(hud);const panel=document.createElement('section');panel.className='skill-panel';panel.id='skill-panel';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','skill-title');panel.innerHTML='<div class="skill-frame"><header><div><h2 id="skill-title">属性升级</h2></div><button type="button" id="skill-close">返回</button></header><div id="skill-list"></div><section class="attribute-tree-detail"><span id="attribute-preview" aria-hidden="true"></span><div id="attribute-detail" aria-live="polite"></div><button type="button" id="attribute-train" class="attribute-upgrade" data-change="1"></button></section><footer><p id="skill-status" role="status"></p><div><button type="button" id="attribute-center">回到核心</button><button type="button" id="skill-reset">重置分配</button></div></footer></div>';$('viewport').append(panel);ui={hud,hudValue:hud.querySelector('.skill-wallet-value'),panel,list:$('skill-list'),status:$('skill-status'),detail:$('attribute-detail'),upgrade:$('attribute-train'),close:$('skill-close')};bindTreeView();hud.onclick=open;ui.close.onclick=close;ui.list.onclick=e=>{const card=e.target.closest('[data-attribute]');if(card){selectedAttribute=card.dataset.attribute;renderPanel();saveTreeView();}};ui.upgrade.onclick=()=>allocate(ui.upgrade.dataset.skill,1);$('skill-reset').onclick=()=>allocate(null);panel.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();close();}if(e.key==='Tab'){const focusable=[...panel.querySelectorAll('button:not(:disabled), .attribute-prices summary')].filter(button=>button.getClientRects().length),first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});updateHud();}
 function overlay(){if(!ui||!['menu','dead','won'].includes(state))return;const host=$('overlay');if(!host.querySelector('.skill-entry')){const button=document.createElement('button');button.type='button';button.className='skill-entry';button.textContent='属性升级 ◇ '+store.view().balance;button.onclick=open;host.append(button);if(state!=='menu'){const text=document.createElement('small');text.textContent='本局获得 '+runEarned+' 分 · 可用分数 '+store.view().balance;host.append(text);}}updateHud();}
 root.TalentRuntime={store,catalog,refreshHud:updateHud,level,amount:runAmount,active,ballistic,applies,effect,combatSource,damage,critical,prepare,drops,spawn,onKill,tick,draw:drawDrops,withWeapon,decorate,sweep,init,overlay,open,startStage,scoreRoster,settleStage,runMaterialCards,materialStock,materialCostText,
  start({useLevels=true}={}){store.refresh();run=useLevels?clone(store.view().levels):{};runEarned=0;runMaterials={};pointRemainder=0;stageBonusRemainder=0;scoreStage=null;runWallet=store.view().balance;bossAwarded=new Set();drops.length=0;clock=0;noticeAt=lastNotice=-1;noticeAmount=0;if(ui)ui.panel.hidden=true;updateHud();},
  boss(){if(!active()||!campaignBoss||currentScoreStage()||bossAwarded.has(floor))return;bossAwarded.add(floor);spawn(p.x,p.y,20);sweep();},
  finish(){for(const q of drops)collect(q);drops.length=0;updateHud();},
  death(){drops.length=0;if(scoreStage)scoreStage.closed=true;},summary:()=>({earned:runEarned,balance:store.view().balance,levels:clone(run),startBalance:runWallet,materials:clone(runMaterials)})};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.ElevatorTalents;
})(typeof globalThis!=='undefined'?globalThis:this);

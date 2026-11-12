'use strict';
globalThis.LobbyUI=(()=>{
 const tabs=[['battle','出战','battle_crossed_swords'],['character','角色','character_bear_badge'],['research','研究','research_flask'],['towers','防御塔强化','tower_upgrade']];
 let root,nav,modal,active='battle',selected=null,node=1,returnFocus=null,changing=false;
 let towerKind=null,towerNode=null,towerResetRevision=null;const towerViews=new Map();
 let chipPage=true,chipSlot=0,chipSelected=null,chipScroll=0;
 const $=id=>document.getElementById(id);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const badge=(path,cls='')=>`<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg>`;
 const shapes={pistol:'M3 9h17v5H9v7H4v-7H2V9Zm7 5v3h4v-3M17 6v3',smg:'M2 8h20v6H8v6H4v-6m7 0v5h5v-5M18 5v3',uzi:'M2 7h8v6H6v6H3v-6m11-6h8v6h-4v6h-3v-6',rifle:'M2 9h20v4H9l-4 5H2v-5m10 0v6h4v-6m-1-7v3',sniper:'M1 10h22m-19 0v4h10l4 5m-10-9V6h8v4M2 14v4h5',rocket:'M3 9h15v6H3V9Zm15-2 5 5-5 5M7 15v5h5v-5',seeker:'M5 3h5v13l-3 5-3-5V3m10 0h5v13l-3 5-3-5V3',laser:'M2 10h11v5H8v5H4v-5m9-3h10M16 7l4-3m-4 13 4 3',tesla:'m13 2-8 12h6l-1 8 9-12h-6l1-8Z',boomerang:'m3 4 11 5 7 12-11-5L3 4Zm11 5-4 7',bee:'M7 10a5 5 0 0 1 10 0v7a5 5 0 0 1-10 0v-7ZM7 12h10m-10 4h10M7 10C-2 2 3 0 10 7m7 3c9-8 4-10-3-3',sword:'M17 2h5v5L9 20l-5-5L17 2ZM3 21l4-4m-5-4 9 9',shotgun:'M2 8h20v5H10l-4 7H3l3-7H2V8Zm1 2h18',shotgun_tower:'M3 21h18l-3-6H6l-3 6Zm4-6V8h10v7M5 5h14v3H5V5Z',sniper_tower:'M3 21h18l-3-6H6l-3 6Zm9-6V8M3 8h19M8 8V4h9v4',electric_tower:'M3 21h18M7 21l3-10m4 0 3 10m-7-10L8 6l4-4 4 4-2 5m-6 0h8',missile_tower:'M3 21h18l-3-6H6l-3 6ZM7 15V5l3-3 3 3v10m1 0V7l3-3 3 3v8',healing_tower:'M4 21h16M7 21V9h10v12M12 2v10M7 7h10',shield_tower:'m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6l9-4Zm0 4v12',slow_field:'M4 8a10 4 0 1 0 16 0M4 13a10 4 0 1 0 16 0M4 18a10 4 0 1 0 16 0M12 2v20',repair_turret:'M3 21h18M7 21V11h10v10M14 3a5 5 0 0 0-5 7l7 7 4-4-7-7 1-3'};
 const weaponIcons=new Set(['pistol','smg','uzi','rifle','sniper','rocket','seeker','laser','tesla','boomerang','bee','sword','shotgun','shotgun_tower','sniper_tower','electric_tower','missile_tower','healing_tower','shield_tower','slow_field','repair_turret']);
 function icon(id){
  if(!weaponIcons.has(id))return badge(shapes[id]||shapes.pistol,'research-icon');
  const tower=Object.hasOwn(TowerResearch.trees,id),size=tower?32:48;
  return `<img class="research-icon ${tower?'research-tower-icon':'research-weapon-icon'}" src="assets/research-icons-v4/${id}-${size}.png" width="${size}" height="${size}" alt="" aria-hidden="true" draggable="false">`;
 }
 const stageIconWeapons=new Set(['pistol','smg','uzi','rifle','sniper','rocket','seeker','laser','tesla','boomerang','bee','sword','shotgun']);
 function stageIcon(id,stage){
  if(!stageIconWeapons.has(id))return '';
  return `<span class="research-stage-icon" aria-hidden="true"><img src="assets/research-stage-icons/${id}-${stage}.png" width="48" height="48" alt="" draggable="false"></span>`;
 }
 function wallet(){return TalentRuntime.store.view().balance;}
 function stage(id){const n=TalentRuntime.store.researchLevel(id);if(Specializations.level(id)!==n)Specializations.set(id,n);return n;}
 function init(){
  if(root)return;
  root=document.createElement('section');root.id='lobby-pages';root.hidden=true;root.setAttribute('aria-label','游戏主菜单');
  nav=document.createElement('nav');nav.id='lobby-nav';nav.hidden=true;nav.setAttribute('aria-label','主菜单导航');nav.setAttribute('role','tablist');
  nav.innerHTML=tabs.map(([id,label,iconName])=>`<button type="button" role="tab" id="lobby-tab-${id}" data-tab="${id}" aria-label="${label}" aria-controls="${id==='battle'?'overlay':id==='character'?'skill-panel':'lobby-pages'}"><img class="lobby-nav-icon" src="assets/lobby-nav-icons-v2/${iconName}-32.png" width="32" height="32" alt="" draggable="false"><i></i></button>`).join('');
  modal=document.createElement('div');modal.id='research-modal';modal.hidden=true;modal.innerHTML='<section class="research-dialog" role="dialog" aria-modal="true" aria-labelledby="research-title"><header><div class="research-dialog-icon"></div><div><small>专项研究</small><h2 id="research-title"></h2></div><button type="button" id="research-close" aria-label="关闭研究详情">×</button></header><div class="research-tree-scroll"><p class="research-tree-hint">由下向上 · 逐阶研究 · 效果累积</p><div class="research-tree" aria-label="五阶线性技能树"></div></div><footer><div id="research-selection"></div><button type="button" id="research-upgrade"></button><p id="research-notice" role="status" aria-live="polite"></p></footer></section>';
  modal.insertAdjacentHTML('beforeend','<section class="skill-panel" id="tower-tree-panel" role="dialog" aria-modal="true" aria-labelledby="tower-tree-title" hidden><div class="skill-frame"><header><div><h2 id="tower-tree-title"></h2><small id="tower-tree-progress"></small></div><button type="button" id="tower-tree-close">返回</button></header><div id="tower-tree-view"><div id="tower-tree-board" class="attribute-tree"></div></div><section class="attribute-tree-detail"><div id="tower-tree-detail" aria-live="polite"></div><button type="button" id="tower-train" class="attribute-upgrade" data-confirm-delay></button></section><footer><p id="tower-tree-notice" role="status"></p><div><button type="button" id="tower-tree-center">回到核心</button><button type="button" id="tower-tree-reset" hidden>重置本塔</button></div></footer></div></section>');
  $('viewport').append(root,nav,modal);
  bindTowerTree();
  nav.onclick=e=>{
   const button=e.target.closest('[data-tab]');
   if(!button||state!=='menu')return;
   unlockAudio();
   beep(660,.07);
   select(button.dataset.tab);
  };
  nav.onkeydown=e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const i=tabs.findIndex(t=>t[0]===active),next=tabs[(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length][0],button=$(`lobby-tab-${next}`);button.click();button.focus();};
  root.onclick=e=>{
   const button=e.target.closest('button');
   if(!button)return;
   if(button.dataset.chipView){
    chipScroll=root.querySelector('.chip-cards')?.scrollTop??chipScroll;
    chipPage=button.dataset.chipView==='chips';
    root.scrollTop=0;
    if(chipPage)renderChips();else renderGrid();
    root.querySelector('[data-chip-view]')?.focus({preventScroll:true});
   }else if(button.dataset.chipSlot!==undefined){
    chipSlot=Number(button.dataset.chipSlot);
    chipSelected=Chips.view()[chipSlot]??chipSelected;
    renderChips(`[data-chip-slot="${chipSlot}"]`);
   }else if(button.dataset.chip){
    chipSelected=Number(button.dataset.chip);
    renderChips(`[data-chip="${chipSelected}"]`);
   }else if(button.id==='chip-action'){
    Chips.equip(chipSlot,chipSelected);
    renderChips('#chip-action');
   }else if(button.dataset.research)openResearch(button.dataset.research,button);
  };
  $('research-close').onclick=closeResearch;
  modal.onclick=e=>{if(e.target===modal)closeResearch();const target=e.target.closest('[data-research-node]');if(target){node=Number(target.dataset.researchNode);renderTree();}};
  modal.onkeydown=e=>{
   e.stopPropagation();if(e.key==='Escape'){e.preventDefault();closeResearch();}
   if(e.key==='Tab'){const focusable=[...modal.querySelectorAll('button:not(:disabled)')].filter(button=>button.getClientRects().length),first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
  };
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden){e.preventDefault();e.stopPropagation();closeResearch();}},true);
  $('research-upgrade').onclick=buy;
  syncResearch();
 }
 function syncResearch(){TalentRuntime.store.refresh();for(const [id,n]of Object.entries(TalentRuntime.store.view().research||{}))Specializations.set(id,n);}
 function show(){init();syncResearch();select('battle',true);}
 function hide(){if(!root)return;syncResearch();closeResearch(false);root.hidden=nav.hidden=true;$('overlay').inert=false;$('viewport').classList.remove('lobby-open','lobby-subpage','lobby-character');}
 function select(id,force=false){
  if(!tabs.some(t=>t[0]===id)||state!=='menu')return;
  init();if(!force&&active==='character'&&!$('skill-panel').hidden){changing=true;$('skill-close').click();changing=false;if(!$('skill-panel').hidden)return;}
  closeResearch(false);active=id;nav.hidden=false;root.hidden=id!=='research'&&id!=='towers';root.scrollTop=0;
  const view=$('viewport');view.classList.add('lobby-open');view.classList.toggle('lobby-subpage',id!=='battle');view.classList.toggle('lobby-character',id==='character');
  for(const button of nav.querySelectorAll('[data-tab]')){const current=button.dataset.tab===id;button.setAttribute('aria-selected',String(current));button.tabIndex=current?0:-1;}
  $('overlay').inert=id!=='battle';
  TalentRuntime.refreshHud?.();
  if(id==='battle')return;
  if(id==='research'){if(chipPage)renderChips();else renderGrid();}
  else if(id==='towers')renderGrid();
  else if(id==='character')TalentRuntime.open();
 }
 function chipCore(id,tier){
  const emblem=id?Chips.icon(id,56,'emblem-pixel'):'<span class="chip-empty" aria-hidden="true">＋</span>';
  return `<span class="chip-core"${id?' data-item-tier="'+tier+'"':''}>${emblem}</span>`;
 }
 function renderChips(focus){
  chipScroll=root.querySelector('.chip-cards')?.scrollTop??chipScroll;
  const slots=Chips.view(),items=Chips.inventory(),byInstance=new Map(items.map(item=>[item.id,item]));
  chipSelected=byInstance.has(chipSelected)?chipSelected:(slots[chipSlot]??items[0]?.id??null);
  const selectedItem=byInstance.get(chipSelected),chip=Chips.byId.get(selectedItem?.chipId),grade=Chips.grade(selectedItem);
  const source=chip?slots.indexOf(chipSelected):-1,previous=Chips.byId.get(byInstance.get(slots[chipSlot])?.chipId);
  const removing=source===chipSlot,blocked=Chips.conflict(chipSlot,chipSelected);
  const target=previous?`将替换「${previous.name}」`:'当前槽位为空';
  const note=blocked?'每种芯片可同时装入一枚':removing?'当前已装入':source<0?target:`从槽位 ${source+1} 移入 · ${target}`;
  const action=blocked?'同款已装入':removing?'卸下芯片':source>=0?`移到槽位 ${chipSlot+1}`:previous?'替换芯片':'装入芯片';
  root.innerHTML=`<header class="lobby-banner"><h1>芯片配置</h1></header>
   <section class="chip-page">
    <div class="chip-page-heading"><span>已装入 ${slots.filter(Boolean).length} / ${slots.length}</span><button type="button" data-chip-view="research">专项研究</button></div>
    <div class="chip-slots" aria-label="自由芯片槽位">${slots.map((id,i)=>{
     const item=byInstance.get(id),chipId=item?.chipId,name=Chips.byId.get(chipId)?.name??'空槽',quality=Chips.grade(item);
     return `<button type="button" class="chip-card" data-chip-slot="${i}" aria-pressed="${chipSlot===i}" style="--chip-quality:${item?quality.color:'#536078'}" aria-label="槽位 ${i+1}，${name}${item?` #${id}，${quality.name}`:''}">${chipCore(chipId,item?.tier)}<strong>${name}</strong></button>`;
    }).join('')}</div>
    <div class="chip-page-heading"><h2>芯片库 <small>${items.length} 枚</small></h2><span>配置槽位 ${chipSlot+1}</span></div>
    <div class="chip-cards" aria-label="芯片库">${items.length?items.map(item=>{
     const {id,chipId}=item,equipped=slots.indexOf(id),{name}=Chips.byId.get(chipId),quality=Chips.grade(item);
     const status=equipped>=0?`，槽位 ${equipped+1}`:'';
     return `<button type="button" class="chip-card${equipped>=0?' chip-equipped':''}" data-chip="${id}" aria-pressed="${chipSelected===id}" style="--chip-quality:${quality.color}" aria-label="${name} #${id}，${quality.name}${status}">${chipCore(chipId,item.tier)}<strong>${name}</strong></button>`;
    }).join(''):'<p class="chip-library-empty">芯片库为空。拾取怪物掉落的芯片后，通关结算时入库。</p>'}</div>
    <section class="chip-detail" aria-label="芯片详情" style="--chip-quality:${grade.color}">
     ${chip?chipCore(chip.id,selectedItem.tier):''}
     <div aria-live="polite">${chip?`<small><b style="color:${grade.color}">${grade.name}</b> · ${chip.type} · #${chipSelected}</small><h2>${chip.name}</h2><p>${Chips.effect(selectedItem)}</p><ul class="chip-affixes">${selectedItem.affixes.map(affix=>`<li>${Chips.describeAffix(affix)}</li>`).join('')}</ul><small>${note}</small>`:'<p>获得芯片后，可在这里查看和装配。</p>'}</div>
     ${chip?`<button type="button" id="chip-action" ${blocked?'disabled':''}>${action}</button>`:''}
    </section>
   </section>`;
  root.querySelector('.chip-cards').scrollTop=chipScroll;
  if(focus)root.querySelector(focus)?.focus({preventScroll:true});
 }
 function renderGrid(){
  const scroll=root.scrollTop,towers=active==='towers',catalog=Specializations.catalog;
  const title=towers?'防御塔强化':'专项研究',group=towers?'防御设施':'武器';
  const categories=catalog.filter(c=>towers?Object.hasOwn(TowerResearch.trees,c.id):c.system.startsWith('主武器'));
  const savedRoutes=towers?TalentRuntime.store.view().towerPaths:null;
  const cards=categories.map(c=>{
   const n=towers?Object.keys(savedRoutes?.[c.id]||{}).length:stage(c.id);
   const max=towers?TowerResearch.trees[c.id].depth:5;
   return `<button type="button" class="research-card${n?' researched':''}" data-research="${c.id}" aria-label="${esc(c.name)}，${towers?`研究等级 ${n} / ${max}`:'研究星级 '+n+' 星，共 5 星'}"><span class="research-card-art">${icon(c.id)}<strong>${esc(c.name)}</strong></span><span class="research-card-info"><span class="research-stars" aria-hidden="true">${towers?`<b>${n}</b><small>/${max}</small>`:Array.from({length:5},(_,i)=>`<span class="${i<n?'lit':''}">★</span>`).join('')}</span></span></button>`;
  }).join('');
  root.innerHTML=`<header class="lobby-banner"><h1>${title}</h1></header>${towers?'':'<div class="chip-page-heading"><button type="button" data-chip-view="chips">返回芯片配置</button></div>'}<p class="research-intro">选择一种${group}，查看它的强化路线。</p><section class="research-group"><h2>${group}<span>${categories.length} 类</span></h2><div class="research-grid">${cards}</div></section>`;
  root.scrollTop=scroll;
 }
 function openResearch(id,focus){
  if(active==='towers'){openTowerTree(id,focus);return;}
  modal.querySelector('.research-dialog').hidden=false;
  selected=Specializations.catalog.find(c=>c.id===id);if(!selected)return;
  node=Math.min(5,stage(id)+1);returnFocus=focus;modal.hidden=false;root.inert=true;nav.inert=true;renderTree();
  requestAnimationFrame(()=>{modal.querySelector(`[data-research-node="${node}"]`)?.scrollIntoView({block:'center'});$('research-close').focus({preventScroll:true});});
 }
 function closeResearch(focus=true){
  if(!modal)return;
  if(towerKind){
   const view=$('tower-tree-view');
   towerViews.set(towerKind,{y:view.scrollTop,node:towerNode});
   towerResetRevision=null;
   towerKind=null;$('tower-tree-panel').hidden=true;modal.classList.remove('tower-research');
  }
  const wasOpen=!modal.hidden;modal.hidden=true;root.inert=false;nav.inert=false;selected=null;
  if(wasOpen&&focus){const id=returnFocus?.dataset.research;root.querySelector(`[data-research="${id}"]`)?.focus({preventScroll:true});}
 }
 function renderTree(){
  if(!selected)return;const n=stage(selected.id),stages=[...selected.stages].reverse();
  $('research-title').textContent=selected.name;modal.querySelector('.research-dialog-icon').innerHTML=icon(selected.id);
  const tree=modal.querySelector('.research-tree'),scroll=modal.querySelector('.research-tree-scroll').scrollTop,focused=document.activeElement?.dataset?.researchNode;
  tree.innerHTML=stages.map(s=>{const status=s.stage<=n?'done':s.stage===n+1?'available':'locked';return `<button type="button" class="research-node ${status}${node===s.stage?' selected':''}" data-research-node="${s.stage}" aria-pressed="${node===s.stage}"><span class="research-node-number">${s.stage<=n?'✓':String(s.stage).padStart(2,'0')}</span>${stageIcon(selected.id,s.stage)}<span class="research-node-copy"><span class="research-node-heading"><strong>${esc(s.name)}</strong><small>${status==='done'?'已研究':status==='available'?'可研究':'未解锁'}</small></span><span class="research-node-effect">${esc(s.effect)}</span></span></button>`;}).join('');
  modal.querySelector('.research-tree-scroll').scrollTop=scroll;
  if(focused)tree.querySelector(`[data-research-node="${focused}"]`)?.focus({preventScroll:true});
  const current=selected.stages.find(s=>s.stage===node),cost=TalentRuntime.store.researchCost(node-1);
  $('research-selection').innerHTML=`<span>第 ${node} 阶 · ${esc(current.name)}</span><strong>${node<=n?'已掌握':`◇ ${cost}`}</strong>`;
  const button=$('research-upgrade');button.disabled=node!==n+1||wallet()<cost||n>=5;
  button.textContent=node<=n?'已研究':node>n+1?'需先研究第 '+(node-1)+' 阶':wallet()<cost?'分数不足':'研究 · ◇ '+cost;
  $('research-notice').textContent=TalentRuntime.store.warning||'可用分数 ◇ '+wallet()+' · 研究后立即生效';
 }
 function buy(){
  if(!selected||state!=='menu')return;const id=selected.id,n=stage(id);if(node!==n+1)return;
  if(!TalentRuntime.store.purchaseResearch(id,n)){renderTree();$('research-notice').textContent='余额或研究进度已变化，请重新选择';return;}
  node=Math.min(selected.stages.length,n+2);
  renderGrid();renderTree();
  modal.querySelector(`[data-research-node="${node}"]`)?.scrollIntoView({block:'center'});
  TalentRuntime.refreshHud?.();$('research-notice').textContent=TalentRuntime.store.warning||'研究完成 · '+selected.stages[n].name;
 }
 const towerRowHeight=120,towerTop=54;
 function scrollToTowerStage(stage){
  const view=$('tower-tree-view'),y=towerTop+stage*towerRowHeight;
  if(y-36<view.scrollTop||y+36>view.scrollTop+view.clientHeight)view.scrollTop=y-view.clientHeight/2;
 }
 function bindTowerTree(){
  const view=$('tower-tree-view');
  $('tower-tree-close').onclick=closeResearch;
  $('tower-tree-center').onclick=()=>{towerResetRevision=null;towerNode=null;renderTowerTree();view.scrollTop=0;};
  view.onclick=e=>{
   const card=e.target.closest('[data-tower-node]');
   if(card){towerResetRevision=null;towerNode=card.dataset.towerNode||null;renderTowerTree();}
  };
  $('tower-train').onclick=()=>{
   if(!towerKind||!towerNode||state!=='menu')return;
   const button=$('tower-train'),store=TalentRuntime.store,tree=TowerResearch.trees[towerKind];
   towerResetRevision=null;
   if(!store.purchaseTowerNode(towerKind,towerNode,Number(button.dataset.revision))){
    renderTowerTree();$('tower-tree-notice').textContent='余额或研究进度已变化，请重试';return;
   }
   const next=towerChoices(tree,store.view().towerPaths[towerKind]);
   if(next.length)towerNode=next.length===1?next[0].id:'';
   renderGrid();renderTowerTree();TalentRuntime.refreshHud?.();
   if(next.length)scrollToTowerStage(next[0].stage);
   if(button.hidden||button.disabled)view.querySelector(`[data-tower-node="${next[0]?.id||towerNode}"]`)?.focus({preventScroll:true});
  };
  $('tower-tree-reset').onclick=()=>{
   if(!towerKind||state!=='menu')return;
   const store=TalentRuntime.store;
   if(towerResetRevision===null){
    towerResetRevision=store.view().revision;renderTowerTree();return;
   }
   const revision=towerResetRevision;towerResetRevision=null;
   if(!store.resetTower(towerKind,revision)){
    renderTowerTree();$('tower-tree-notice').textContent='研究进度已变化，请重试';return;
   }
   towerNode=null;renderGrid();renderTowerTree();TalentRuntime.refreshHud?.();
   view.scrollTop=0;$('tower-tree-center').focus({preventScroll:true});
  };
 }
 function towerChoices(tree,paid){
  const states=TowerResearch.routeState(tree,paid);
  return tree.nodes.filter(n=>states[n.id].status==='available');
 }
 function openTowerTree(kind,focus){
  const tree=TowerResearch.trees[kind];if(!tree)return;
  const store=TalentRuntime.store;store.refresh();
  towerKind=kind;returnFocus=focus;
  const saved=towerViews.get(kind),paid=store.view().towerPaths?.[kind]||{},next=towerChoices(tree,paid);
  towerNode=null;
  if(saved)towerNode=saved.node;
  else if(next.length>1)towerNode='';
  else if(Object.keys(paid).length)towerNode=next[0]?.id||tree.nodes.findLast(n=>Object.hasOwn(paid,n.id))?.id;
  modal.querySelector('.research-dialog').hidden=true;
  modal.classList.add('tower-research');modal.hidden=false;$('tower-tree-panel').hidden=false;
  root.inert=nav.inert=true;
  $('tower-tree-title').textContent=tree.name;
  renderTowerTree();
  const view=$('tower-tree-view');
  view.scrollTop=saved?.y||0;
  if(!saved&&towerNode!==null)scrollToTowerStage(tree.nodes.find(n=>n.id===towerNode)?.stage||next[0]?.stage||0);
  $('tower-tree-close').focus({preventScroll:true});
 }
 function renderTowerTree(){
  const board=$('tower-tree-board'),focus=document.activeElement?.dataset?.towerNode;
  const store=TalentRuntime.store,data=store.view(),tree=TowerResearch.trees[towerKind],paid=data.towerPaths?.[towerKind]||{};
  const states=TowerResearch.routeState(tree,paid),count=Object.keys(paid).length;
  const height=2*towerTop+tree.depth*towerRowHeight,positions=new Map([['',[500,towerTop]]]),paths=[],cards=[];
  const labels={done:'已研究',available:'可研究',locked:'未解锁',excluded:'互斥锁定'};
  function card(id,name,flow,x,y,status){
   const stateLabel=labels[status]||'已激活';
   const accessibleName=id?`${name}，${flow}，${stateLabel}`:`${name}，${stateLabel}`;
   const artwork=id
    ? `<img class="tower-upgrade-icon" src="assets/tower-upgrade-icons-v1/${towerKind}/${id.toLowerCase()}-24.png" width="48" height="48" alt="" draggable="false">`
    : icon(towerKind);
   return `<button type="button" data-tower-node="${id}" data-status="${status}" aria-pressed="${id?towerNode===id:towerNode===null}" aria-label="${esc(accessibleName)}" class="tower-route-card" style="left:${x/10}%;top:${y}px">${artwork}<small>${esc(flow)}</small><strong>${esc(name)}</strong><span>${stateLabel}</span></button>`;
  }
  cards.push(card('','设施核心','起点',500,towerTop,'core'));
  for(const node of tree.nodes){
   const x=node.x*1000,y=towerTop+node.stage*towerRowHeight;
   const status=states[node.id].status;
   positions.set(node.id,[x,y]);
   for(const id of node.from.length?node.from:['']){
    const [px,py]=positions.get(id),prior=!id||states[id].status==='done';
    const tone=prior&&status==='done'?'invested':prior&&status==='available'?'open':'unknown';
    const junction=node.from.length>1?` L500 ${(py+y)/2}`:'';
    paths.push({tone,markup:`<path d="M${px} ${py}${junction} L${x} ${y}" class="${tone}"/>`});
   }
   cards.push(card(node.id,node.name,node.flow,x,y,status));
  }
  const order={unknown:0,open:1,invested:2};
  paths.sort((a,b)=>order[a.tone]-order[b.tone]);
  board.style.height=`${height}px`;
  board.innerHTML=`<svg viewBox="0 0 1000 ${height}" preserveAspectRatio="none" aria-hidden="true">${paths.map(p=>p.markup).join('')}</svg>${cards.join('')}`;
  if(focus!==undefined)board.querySelector(`[data-tower-node="${focus}"]`)?.focus({preventScroll:true});
  const node=tree.nodes.find(n=>n.id===towerNode),status=node&&states[node.id].status,button=$('tower-train');
  const material=node&&store.towerMaterial(tree,node);
  const materialShort=material&&Math.max(0,material.count-(data.materials[material.id]||0));
  const chosen=node&&states[node.id].chosen;
  const detail=$('tower-tree-detail');
  if(node){
   const rivals=node.choice?tree.nodes.filter(n=>n.choice===node.choice&&n.id!==node.id).map(n=>n.name).join('、'):'';
   const hint=chosen?`已选「${chosen.name}」，此路线已锁定`:status==='locked'?`需先研究${node.from.map(id=>tree.nodes.find(n=>n.id===id).name).join(' 或 ')}`:status==='available'&&rivals?`研究后锁定「${rivals}」`:'';
   detail.innerHTML=`<strong>${esc(node.name)} <small>第 ${node.stage} 阶 · ${esc(node.flow)}</small></strong>${status!=='done'?`<small>${node.cost} 分 + ${TalentRuntime.materialCostText(material,data.materials)}</small>`:''}<span>${esc(node.description)}</span>${hint?`<small>${esc(hint)}</small>`:''}`;
  }else if(towerNode===''){
   const next=towerChoices(tree,paid)[0];
   detail.innerHTML=`<strong>第 ${next?.stage||''} 阶 · 选择路线</strong><span>先点卡片比较效果，确认研究后锁定另一支。</span>`;
  }else detail.innerHTML=`<strong>设施核心 <small>已激活</small></strong><small>${TalentRuntime.materialStock('tower',data.materials)}</small><span>${esc(globalThis.ElectricTiles?.defs[towerKind]?.desc)}</span>`;
  detail.scrollTop=0;
  button.hidden=!node;button.disabled=status!=='available'||data.balance<node.cost||materialShort>0;
  button.dataset.revision=data.revision;
  if(node)button.textContent=status!=='available'?labels[status]:data.balance<node.cost?`还差 ${node.cost-data.balance} 分`:materialShort?`材料差 ${materialShort} 件`:`研究 · ◇ ${node.cost}`;
  $('tower-tree-progress').textContent=`研究 ${count}/${tree.depth} · 分数 ◇ ${data.balance}`;
  const reset=$('tower-tree-reset');
  reset.hidden=!count;
  reset.textContent=towerResetRevision===null?'重置本塔':`确认返还 ${Object.values(paid).reduce((sum,cost)=>sum+cost,0)} 分`;
  $('tower-tree-notice').textContent=store.warning||(towerResetRevision!==null?'返还实付分数与材料 · 再次点击确认':count===tree.depth?'路线完成 · 下次出战生效':'下次出战生效');
 }
 function onCharacterClose(){if(!changing&&active==='character'&&state==='menu')select('battle',true);}
 return {init,show,hide,select,openResearch,closeResearch,onCharacterClose,get active(){return active;}};
})();

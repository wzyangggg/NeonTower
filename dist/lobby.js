'use strict';
globalThis.LobbyUI=(()=>{
 const tabs=[['battle','出战','battle_crossed_swords'],['character','角色','character_bear_badge'],['research','研究','research_flask']];
 let root,nav,modal,active='battle',selected=null,node=1,returnFocus=null,changing=false;
 const $=id=>document.getElementById(id);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const badge=(path,cls='')=>`<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg>`;
 const shapes={pistol:'M3 9h17v5H9v7H4v-7H2V9Zm7 5v3h4v-3M17 6v3',smg:'M2 8h20v6H8v6H4v-6m7 0v5h5v-5M18 5v3',uzi:'M2 7h8v6H6v6H3v-6m11-6h8v6h-4v6h-3v-6',rifle:'M2 9h20v4H9l-4 5H2v-5m10 0v6h4v-6m-1-7v3',sniper:'M1 10h22m-19 0v4h10l4 5m-10-9V6h8v4M2 14v4h5',rocket:'M3 9h15v6H3V9Zm15-2 5 5-5 5M7 15v5h5v-5',seeker:'M5 3h5v13l-3 5-3-5V3m10 0h5v13l-3 5-3-5V3',laser:'M2 10h11v5H8v5H4v-5m9-3h10M16 7l4-3m-4 13 4 3',tesla:'m13 2-8 12h6l-1 8 9-12h-6l1-8Z',boomerang:'m3 4 11 5 7 12-11-5L3 4Zm11 5-4 7',bee:'M7 10a5 5 0 0 1 10 0v7a5 5 0 0 1-10 0v-7ZM7 12h10m-10 4h10M7 10C-2 2 3 0 10 7m7 3c9-8 4-10-3-3',sword:'M17 2h5v5L9 20l-5-5L17 2ZM3 21l4-4m-5-4 9 9',shotgun:'M2 8h20v5H10l-4 7H3l3-7H2V8Zm1 2h18',shotgun_tower:'M3 21h18l-3-6H6l-3 6Zm4-6V8h10v7M5 5h14v3H5V5Z',sniper_tower:'M3 21h18l-3-6H6l-3 6Zm9-6V8M3 8h19M8 8V4h9v4',electric_tower:'M3 21h18M7 21l3-10m4 0 3 10m-7-10L8 6l4-4 4 4-2 5m-6 0h8',missile_tower:'M3 21h18l-3-6H6l-3 6ZM7 15V5l3-3 3 3v10m1 0V7l3-3 3 3v8',healing_tower:'M4 21h16M7 21V9h10v12M12 2v10M7 7h10',shield_tower:'m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6l9-4Zm0 4v12',slow_field:'M4 8a10 4 0 1 0 16 0M4 13a10 4 0 1 0 16 0M4 18a10 4 0 1 0 16 0M12 2v20',repair_turret:'M3 21h18M7 21V11h10v10M14 3a5 5 0 0 0-5 7l7 7 4-4-7-7 1-3'};
 const weaponIcons=new Set(['pistol','smg','uzi','rifle','sniper','rocket','seeker','laser','tesla','boomerang','bee','sword','shotgun','shotgun_tower','sniper_tower','electric_tower','missile_tower','healing_tower','shield_tower','slow_field','repair_turret']);
 function icon(id){return weaponIcons.has(id)?`<img class="research-icon research-weapon-icon" src="assets/research-icons-v4/${id}-48.png" width="48" height="48" alt="" aria-hidden="true" draggable="false">`:badge(shapes[id]||shapes.pistol,'research-icon');}
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
  $('viewport').append(root,nav,modal);
  nav.onclick=e=>{
   const button=e.target.closest('[data-tab]');
   if(!button||state!=='menu')return;
   unlockAudio();
   beep(660,.07);
   select(button.dataset.tab);
  };
  nav.onkeydown=e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const i=tabs.findIndex(t=>t[0]===active),next=tabs[(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length][0],button=$(`lobby-tab-${next}`);button.click();button.focus();};
  root.onclick=e=>{const card=e.target.closest('[data-research]');if(card)openResearch(card.dataset.research,card);};
  $('research-close').onclick=closeResearch;
  modal.onclick=e=>{if(e.target===modal)closeResearch();const target=e.target.closest('[data-research-node]');if(target){node=Number(target.dataset.researchNode);renderTree();}};
  modal.onkeydown=e=>{
   e.stopPropagation();if(e.key==='Escape'){e.preventDefault();closeResearch();}
   if(e.key==='Tab'){const focusable=[...modal.querySelectorAll('button:not(:disabled)')],first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
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
  closeResearch(false);active=id;nav.hidden=false;root.hidden=id!=='research';
  const view=$('viewport');view.classList.add('lobby-open');view.classList.toggle('lobby-subpage',id!=='battle');view.classList.toggle('lobby-character',id==='character');
  for(const button of nav.querySelectorAll('[data-tab]')){const current=button.dataset.tab===id;button.setAttribute('aria-selected',String(current));button.tabIndex=current?0:-1;}
  $('overlay').inert=id!=='battle';
  TalentRuntime.refreshHud?.();
  if(id==='battle')return;
  if(id==='research')renderGrid();
  else if(id==='character')TalentRuntime.open();
 }
 function renderGrid(){
  const scroll=root.scrollTop,catalog=Specializations.catalog;
  const groups=[['武器',catalog.filter(c=>c.system.startsWith('主武器'))],['防御设施',catalog.filter(c=>!c.system.startsWith('主武器'))]];
  root.innerHTML=`<header class="lobby-banner"><h1>研究</h1></header><p class="research-intro">选择一种武器或防御设施，查看它的强化路线。</p>${groups.map(([title,categories])=>`<section class="research-group"><h2>${title}<span>${categories.length} 类</span></h2><div class="research-grid">${categories.map(c=>{const n=stage(c.id);return `<button type="button" class="research-card${n?' researched':''}" data-research="${c.id}" aria-label="${esc(c.name)}，研究星级 ${n} 星，共 5 星"><span class="research-card-art">${icon(c.id)}<strong>${esc(c.name)}</strong></span><span class="research-card-info"><span class="research-stars" aria-hidden="true">${Array.from({length:5},(_,i)=>`<span class="${i<n?'lit':''}">★</span>`).join('')}</span></span></button>`;}).join('')}</div></section>`).join('')}`;
  root.scrollTop=scroll;
 }
 function openResearch(id,focus){
  selected=Specializations.catalog.find(c=>c.id===id);if(!selected)return;
  node=Math.min(5,stage(id)+1);returnFocus=focus;modal.hidden=false;root.inert=true;nav.inert=true;renderTree();
  requestAnimationFrame(()=>{modal.querySelector(`[data-research-node="${node}"]`)?.scrollIntoView({block:'center'});$('research-close').focus({preventScroll:true});});
 }
 function closeResearch(focus=true){
  if(!modal)return;const wasOpen=!modal.hidden;modal.hidden=true;root.inert=false;nav.inert=false;selected=null;
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
  button.textContent=node<=n?'已研究':node>n+1?'需先研究第 '+(node-1)+' 阶':wallet()<cost?'技能点不足':'研究 · ◇ '+cost;
  $('research-notice').textContent=TalentRuntime.store.warning||'当前技能点 ◇ '+wallet()+' · 研究后立即生效';
 }
 function buy(){
  if(!selected||state!=='menu')return;const id=selected.id,n=stage(id);if(node!==n+1)return;
  if(!TalentRuntime.store.purchaseResearch(id,n)){renderTree();$('research-notice').textContent='余额或研究进度已变化，请重新选择';return;}
  node=Math.min(selected.stages.length,n+2);
  renderGrid();renderTree();
  modal.querySelector(`[data-research-node="${node}"]`)?.scrollIntoView({block:'center'});
  TalentRuntime.refreshHud?.();$('research-notice').textContent=TalentRuntime.store.warning||'研究完成 · '+selected.stages[n].name;
 }
 function onCharacterClose(){if(!changing&&active==='character'&&state==='menu')select('battle',true);}
 return {init,show,hide,select,openResearch,closeResearch,onCharacterClose,get active(){return active;}};
})();

'use strict';
// Permanent progression stays separate from run equipment and its mutable model state.
(function(root){
 const specs=[
  ['damage','伤害加成','通用战斗',10,5,2,'伤害加成','%','玩家、无人机、机甲共用；派生伤害不重复强化'],
  ['rate','攻速','通用战斗',10,10,1,'攻速','%','加快已有攻击周期；不加快治疗、补盾与生产'],
  ['crit','暴击率','通用战斗',10,10,.5,'暴击率','个百分点','强化可暴击的攻击；最终暴击率不超过100%'],
  ['critDamage','暴击伤害倍率','通用战斗',10,5,.03,'暴击伤害倍率','倍','增加已有暴击倍率；不让禁止暴击的攻击获得暴击'],
  ['spread','散布角减少','通用战斗',10,5,3,'散布角减少','%','缩小已有实体枪弹散布；零散布保持为零'],
  ['speed','弹丸速度','通用战斗',10,5,3,'弹丸速度','%','直线实体枪弹；不影响火箭、追踪弹与剑气'],
  ['blast','爆炸范围','通用战斗',5,10,2,'爆炸半径','%','玩家、无人机、机甲的已有爆炸半径统一增加'],
  ['knock','击退强度','通用战斗',5,5,3,'击退强度','%','强化已有击退；不新增击退能力，保留首领抗性'],
  ['recoil','后坐位移减少','操控',5,5,5,'后坐位移减少','%','减少实际后退；保留枪身回弹、火光与音效'],
  ['heavy','减速免疫','操控',5,5,5,'武器减速减免','%','按比例减免武器移速惩罚；满级减免原惩罚的25%'],
  ['move','移动速度','机体',10,5,1,'基础移速','%','提高玩家基础移速，含机甲驾驶；不改变无人机移速'],
  ['pickup','拾取范围','机体',10,5,2,'拾取范围','单位','补给拾取；技能点仍按原规则自动回收'],
  ['inv','受击无敌时间','机体',5,10,.02,'受击无敌','秒','只延长受伤后保护；不延长坐骑特技无敌']
 ];
 const catalog=specs.map(([id,name,group,max,base,step,label,unit,desc])=>({id,name,group,max,base,step,label,unit,desc}));
 const integer=v=>Number.isSafeInteger(v)&&v>=0?v:0,clone=v=>JSON.parse(JSON.stringify(v));
 const researchCosts=[20,40,80,140,220];
 function createStore(storage,key='hell-elevator-talents-v1'){
  let data={version:1,balance:0,earned:0,levels:{},paid:{},revision:0},warning='',persistence=true;
  function read(){if(!persistence)return;try{const raw=JSON.parse(storage?.getItem(key)||'null');if(!raw||raw.version!==1)return;const next={version:1,balance:integer(raw.balance),earned:integer(raw.earned),levels:{},paid:{},revision:integer(raw.revision)};if(raw.research&&typeof raw.research==='object'&&!Array.isArray(raw.research)){next.research={};for(const [id,n]of Object.entries(raw.research))if(/^[a-z_]+$/.test(id)&&Number.isInteger(n)&&n>=0&&n<=5)next.research[id]=n;}for(const s of catalog){const n=Math.min(s.max,integer(raw.levels?.[s.id]));const costs=raw.paid?.[s.id];if(n&&Array.isArray(costs)&&costs.length===n&&costs.every(v=>Number.isSafeInteger(v)&&v>0)){next.levels[s.id]=n;next.paid[s.id]=costs.slice();}}let refund=0;for(const id of ['shovel','hp','shield','pierce','laser','arc','drone']){const costs=raw.paid?.[id],n=integer(raw.levels?.[id]);if(n&&Array.isArray(costs)&&costs.length===n&&costs.every(v=>Number.isSafeInteger(v)&&v>0))refund+=costs.reduce((sum,v)=>sum+v,0);}if(refund&&Number.isSafeInteger(next.balance+refund)){next.balance+=refund;write(next);}data=next;}catch{persistence=false;warning='本地存档不可用，本次进度仅保留在当前页面';}}
  function readResearch(){read();}
  function write(next){next.revision=data.revision+1;try{storage?.setItem(key,JSON.stringify(next));}catch{persistence=false;warning='本地存档不可用，本次进度仅保留在当前页面';}data=next;return true;}
  read();
  return {key,catalog,get warning(){return warning;},view:()=>clone(data),refresh:read,
   cost(id,level){const s=catalog.find(q=>q.id===id);return s&&level>=0&&level<s.max?s.base*(level+1):null;},
   credit(amount){if(!Number.isSafeInteger(amount)||amount<=0)return false;read();if(!Number.isSafeInteger(data.balance+amount)||!Number.isSafeInteger(data.earned+amount))return false;return write({...clone(data),balance:data.balance+amount,earned:data.earned+amount});},
   researchCost(n){return Number.isInteger(n)&&n>=0&&n<5?researchCosts[n]:null;},
   researchLevel(id){readResearch();return data.research?.[id]??root.Specializations?.level(id)??0;},
   purchaseResearch(id,expectedLevel){
    if(!root.Specializations?.ids.includes(id))return false;
    readResearch();const n=data.research?.[id]??root.Specializations.level(id),cost=this.researchCost(n);
    if(n!==expectedLevel||cost===null||data.balance<cost)return false;
    const next=clone(data);next.balance-=cost;next.research={...next.research,[id]:n+1};
    if(!write(next))return false;root.Specializations.set(id,n+1);return true;
   },
   draft(){readResearch();return clone(data);},
   change(draft,id,direction){const s=catalog.find(q=>q.id===id);if(!s||![1,-1].includes(direction))return false;const n=draft.levels[id]||0;if(direction===1){const cost=this.cost(id,n);if(cost===null||draft.balance<cost)return false;draft.balance-=cost;draft.levels[id]=n+1;(draft.paid[id]??=[]).push(cost);}else{if(!n)return false;draft.balance+=draft.paid[id].pop();draft.levels[id]=n-1;}return true;},
   reset(draft){for(const s of catalog)while((draft.levels[s.id]||0)>0)this.change(draft,s.id,-1);},
   save(draft){read();if(draft.revision!==data.revision)return false;const expected=clone(data);for(const s of catalog){const target=draft.levels[s.id]||0;if(!Number.isInteger(target)||target<0||target>s.max)return false;while((expected.levels[s.id]||0)>target)this.change(expected,s.id,-1);}for(const s of catalog){const target=draft.levels[s.id]||0;while((expected.levels[s.id]||0)<target)if(!this.change(expected,s.id,1))return false;}if(expected.balance!==draft.balance)return false;return write(expected);}
  };
 }
 root.ElevatorTalents={catalog,createStore};
 let storage;try{storage=root.localStorage;}catch{}
 const store=createStore(storage),drops=[],seen=new WeakSet();let run={},runEarned=0,bossAwarded=new Set(),clock=0,draft=null,ui=null,noticeAt=-1,noticeAmount=0,lastNotice=-1,runWallet=0;
 const level=id=>run[id]||0;
 const active=()=>!globalThis.PromoMode?.active&&!testMode&&!snakeTest&&!virusTest&&!humanoidTest&&!droneBossTest&&!ufoBossTest&&!(typeof fishSchoolTest!=='undefined'&&fishSchoolTest)&&!(typeof weaponLab!=='undefined'&&weaponLab?.active);
 const ballistic=w=>['pulse','smg','rifle','sniper','barrett','magnum','twin','shotgun','rail','uzi'].includes(w.id);
 const combatSource=source=>['weapon','drone','mount','mech','player','armor','glass','drink'].includes(source);
 function value(s,n){return '+'+ +(s.step*n).toFixed(3)+(s.unit==='个百分点'?'%':s.unit);}
 function effect(s,n){return s.label+' '+value(s,n);}
 function applies(s,w){if(!w)return false;if(['spread','speed'].includes(s.id))return ballistic(w)&&(s.id!=='spread'||w.spread>0);if(s.id==='recoil')return !!(w.itemId&&['rocket','sniper'].includes(w.familyId));if(s.id==='heavy')return w.speedPenalty>0;if(s.id==='blast')return w.blastRadius>0;if(s.id==='knock')return w.knockback>0;return true;}
 function damage(s,amount){return amount*(combatSource(s.source)?1+.02*level('damage'):1);}
 function critical(s){const eligible=combatSource(s.source)&&!s.drinkDot&&!s.noCrit&&Number.isFinite(s.critChance);return {chance:Math.min(1,(s.critChance||0)+(eligible ? .005*level('crit') : 0)),multiplier:(s.critMultiplier||2)+(eligible ? .03*level('critDamage') : 0)};}
 // Called once before flight/collision, including attacks emitted outside the weapon factory.
 function prepare(s){if(s.attributePrepared||!combatSource(s.source))return;s.attributePrepared=true;if(s.blastRadius)s.blastRadius*=1+.02*level('blast');if(s.knockback)s.knockback*=1+.03*level('knock');}
 function updateHud(){if(!ui)return;const value=store.view().balance;ui.hud.textContent='技能点 ◇ '+value;ui.hud.title='技能点 '+value+' · 本局拾取 '+runEarned;ui.hud.disabled=false;ui.hud.setAttribute('aria-label','查看技能点和属性，余额'+value);for(const entry of document.querySelectorAll('.skill-entry'))entry.textContent='属性升级 ◇ '+value;}
 function collect(q){if(q.done)return;q.done=true;if(!active())return;if(!store.credit(q.value))return;runEarned+=q.value;cashGemAbsorb(1,'#64cfff',false);noticeAmount=clock-lastNotice<.22?noticeAmount+q.value:q.value;lastNotice=clock;const existing=cashPopups.find(v=>v.skillPoint&&v.age<.22);if(existing){existing.text='技能点 +'+noticeAmount;existing.age=0;}else cashPopups.push({skillPoint:true,text:'技能点 +'+noticeAmount,x:p.x,y:p.y,height:100,age:0,life:.9});if(clock-noticeAt>.09){beep(1160,.055,'sine',.035);beep(1600,.04,'triangle',.02);noticeAt=clock;}if(ui){ui.hud.classList.remove('skill-bump');void ui.hud.offsetWidth;ui.hud.classList.add('skill-bump');}updateHud();}
 function spawn(x,y,value){if(!active()||!Number.isFinite(x+y)||!Number.isSafeInteger(value)||value<=0)return null;if(drops.length>=64){const nearest=drops.reduce((a,b)=>Math.hypot(a.x-x,a.y-y)<Math.hypot(b.x-x,b.y-y)?a:b);nearest.value+=value;return nearest;}const q={...makePickupCrystal(x,y),value,done:false,attract:false};drops.push(q);return q;}
 function onKill(e){if(!active()||seen.has(e))return;seen.add(e);if(campaignBoss||isBossBody(e)||['rocket','turret','droneMinion','ufoMinion'].includes(e.type)||e.weaponLabTarget||e.escaped)return;if(Math.random()<.25)spawn(e.x,e.y,1);}
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
 function withWeapon(w,source,emit){if(!combatSource(source))return emit();const saved=new Map(),set=(key,value)=>{if(!saved.has(key))saved.set(key,{has:Object.prototype.hasOwnProperty.call(w,key),value:w[key]});w[key]=value;};if(ballistic(w)){set('spread',(w.spread||0)*(1-.03*level('spread')));set('speed',(w.speed||0)*(1+.03*level('speed')));}try{return emit();}finally{for(const [key,v]of saved)if(v.has)w[key]=v.value;else delete w[key];}}
 function decorate(start,w,source){if(!combatSource(source))return;for(let i=start;i<shots.length;i++)prepare(shots[i]);}
 // Runtime pixel filter: keep original assets intact and cache one 24px sample per icon.
 const attributePixelSize=24,attributePixelCache=new Map();
 function attributeIcon(id){const asset=id==='critDamage'?'crit_damage':id;return `<img src="assets/attribute-icons-v1/${asset}-original.png" width="48" height="48" alt="" aria-hidden="true"><canvas width="${attributePixelSize}" height="${attributePixelSize}" aria-hidden="true"></canvas>`;}
 function filterAttributeIcons(){
  for(const img of ui.list.querySelectorAll('.attribute-icon img')){
   const canvas=img.nextElementSibling;
   const draw=()=>{
    if(!canvas.isConnected||!img.naturalWidth)return;
    try{
     let sample=attributePixelCache.get(img.src);
     if(!sample){
      sample=document.createElement('canvas');sample.width=sample.height=attributePixelSize;
      const context=sample.getContext('2d');if(!context)return;
      context.imageSmoothingEnabled=false;
      context.drawImage(img,0,0,attributePixelSize,attributePixelSize);
      attributePixelCache.set(img.src,sample);
     }
     const context=canvas.getContext('2d');if(!context)return;
     context.imageSmoothingEnabled=false;context.clearRect(0,0,attributePixelSize,attributePixelSize);context.drawImage(sample,0,0);
     canvas.dataset.ready='true';img.parentElement.classList.add('pixel-filter-ready');
    }catch{} // Leave the source image visible if Canvas is unavailable.
   };
   if(img.complete)draw();else img.addEventListener('load',draw,{once:true});
  }
 }
 function renderPanel(){
  const scroll=ui.list.scrollTop,focus=document.activeElement?.dataset;
  ui.hud.textContent='技能点 ◇ '+draft.balance;
  ui.list.innerHTML=catalog.map(s=>{
   const n=draft.levels[s.id]||0,cost=store.cost(s.id,n);
   const current=value(s,n),maxed=cost===null;
   const comparison=maxed?current:current+' → '+value(s,n+1);
   const price=maxed?'已满级':cost+' 技能点';
   return `<article class="skill-row${n?' invested':''}" data-attribute="${s.id}"><div class="attribute-icon-cell"><div class="attribute-icon">${attributeIcon(s.id)}</div></div><div class="attribute-copy"><div class="skill-row-heading"><strong>${s.name}</strong><span class="attribute-current">${value(s,n)}</span></div><small class="attribute-description">${s.desc}</small><div class="attribute-meter" role="progressbar" aria-label="${s.name}升级进度" aria-valuemin="0" aria-valuemax="${s.max}" aria-valuenow="${n}">${Array.from({length:s.max},(_,i)=>`<i class="${i<n?'filled':''}"></i>`).join('')}</div></div><button type="button" class="attribute-upgrade" data-skill="${s.id}" data-change="1" aria-label="${s.name}，${comparison}，${price}" ${maxed||draft.balance<cost?'disabled':''}><span class="attribute-values">${comparison}</span><span class="attribute-price">${price}</span></button></article>`;
  }).join('');filterAttributeIcons();ui.list.scrollTop=scroll;
  if(focus?.skill){const button=ui.list.querySelector(`[data-skill="${focus.skill}"][data-change="${focus.change}"]`);if(button&&!button.disabled)button.focus({preventScroll:true});}
  ui.status.textContent=store.warning||'';
 }
 function open(){if(!['menu','dead','won'].includes(state)){toast('技能点 '+store.view().balance+' · 出发前可分配\n本局属性 '+Object.values(run).reduce((a,b)=>a+b,0)+'级');return;}draft=store.draft();ui.panel.hidden=false;ui.close.textContent='返回';releaseJoy();Object.keys(keys).forEach(k=>keys[k]=false);renderPanel();ui.close.focus();}
 function close(){globalThis.UIMotion?.exit(ui.panel,'right');ui.panel.hidden=true;draft=null;ui.hud.focus();globalThis.LobbyUI?.onCharacterClose();}
 // Always start from the latest shared wallet, then persist each completed action.
 function allocate(id,direction){
  if(!['menu','dead','won'].includes(state))return;
  const next=store.draft();
  if(id===null)store.reset(next);else if(!store.change(next,id,direction))return;
  const saved=store.save(next);draft=store.draft();renderPanel();updateHud();
  if(!saved)ui.status.textContent='余额已变化，请重试';
 }
 function init(){if(ui||!document.createElement)return;const css=document.createElement('link');css.rel='stylesheet';css.href='talents.css';if(!document.getElementById('talents-inline-style'))document.head.append(css);const hud=document.createElement('button');hud.className='skill-wallet';hud.id='skill-wallet';hud.type='button';$('viewport').append(hud);const panel=document.createElement('section');panel.className='skill-panel';panel.id='skill-panel';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','skill-title');panel.innerHTML='<div class="skill-frame"><header><div><h2 id="skill-title">属性升级</h2></div><button type="button" id="skill-close">返回</button></header><div id="skill-list"></div><footer><p id="skill-status" role="status"></p><div><button type="button" id="skill-reset">重置分配</button></div></footer></div>';$('viewport').append(panel);ui={hud,panel,list:$('skill-list'),status:$('skill-status'),close:$('skill-close')};hud.onclick=open;ui.close.onclick=close;ui.list.onclick=e=>{const button=e.target.closest('[data-skill]');if(button)allocate(button.dataset.skill,Number(button.dataset.change));};$('skill-reset').onclick=()=>allocate(null);panel.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();close();}if(e.key==='Tab'){const focusable=[...panel.querySelectorAll('button:not(:disabled)')],first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});updateHud();}
 function overlay(){if(!ui||!['menu','dead','won'].includes(state))return;const host=$('overlay');if(!host.querySelector('.skill-entry')){const button=document.createElement('button');button.type='button';button.className='skill-entry';button.textContent='属性升级 ◇ '+store.view().balance;button.onclick=open;host.append(button);if(state!=='menu'){const text=document.createElement('small');text.textContent='本局拾取 '+runEarned+' 技能点 · 永久余额 '+store.view().balance;host.append(text);}}updateHud();}
 root.TalentRuntime={store,catalog,refreshHud:updateHud,level,active,ballistic,applies,effect,combatSource,damage,critical,prepare,drops,spawn,onKill,tick,draw:drawDrops,withWeapon,decorate,sweep,init,overlay,open,
  start(){store.refresh();run=clone(store.view().levels);runEarned=0;runWallet=store.view().balance;bossAwarded=new Set();drops.length=0;clock=0;noticeAt=lastNotice=-1;noticeAmount=0;if(ui)ui.panel.hidden=true;updateHud();},
  boss(){if(!active()||!campaignBoss||bossAwarded.has(floor))return;bossAwarded.add(floor);spawn(p.x,p.y,20);sweep();},
  finish(){for(const q of drops)collect(q);drops.length=0;updateHud();},
  death(){drops.length=0;},summary:()=>({earned:runEarned,balance:store.view().balance,levels:clone(run),startBalance:runWallet})};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.ElevatorTalents;
})(typeof globalThis!=='undefined'?globalThis:this);

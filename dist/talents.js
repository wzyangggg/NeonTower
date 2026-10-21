'use strict';
// Permanent progression stays separate from run equipment and its mutable model state.
(function(root){
 const specs=[
  ['hp','机体加固','机体',1,80,1,'生命上限','格','满血出发；与衣服生命叠加'],
  ['shield','备用护盾','机体',1,50,1,'开局护盾','格','只在新局发放，不增加护盾上限'],
  ['move','轻量关节','机体',10,5,1,'基础移速','%','保留坐骑转向与碰撞规则'],
  ['pickup','拾取模块','机体',10,5,2,'拾取范围','单位','补给拾取；技能点落地后自动回收'],
  ['inv','受击缓冲','机体',5,10,.02,'受击无敌','秒','不延长坐骑特技无敌'],
  ['damage','火力强化','枪械',10,5,2,'主武器伤害','%','适用所有主武器，派生伤害不重复强化'],
  ['rate','射击节奏','枪械',10,10,1,'主武器攻击频率','%','不改变连发组内部节奏或持续伤害频率'],
  ['crit','精密瞄准','枪械',10,10,.5,'主武器暴击率','个百分点','最终暴击率上限100%'],
  ['critDamage','弱点打击','枪械',10,5,.03,'主武器暴击倍率','倍','增加已有暴击的伤害倍率'],
  ['spread','散布控制','枪械',10,5,3,'原散射角减少','%','仅有散布的实体枪弹；零散布仍为零'],
  ['speed','高速弹体','枪械',10,5,3,'枪弹飞行速度','%','直线枪弹；不影响火箭、追踪弹、剑气'],
  ['recoil','后坐抑制','枪械',5,5,5,'角色后退距离减少','%','保留枪身回弹、火光与音效'],
  ['heavy','重武器适应','枪械',5,5,5,'武器减速惩罚减少','%','只减轻主武器自身的移速惩罚'],
  ['pierce','穿透弹头','枪械',10,10,1,'额外穿透概率','%','直线枪弹独立判定，最多额外命中1个目标'],
  ['blast','爆破范围','特殊武器',5,10,2,'爆炸半径','%','只放大主武器已有爆炸，不增加伤害'],
  ['laser','光束聚能','特殊武器',5,10,2,'激光命中宽度','%','不增加长度、分裂数或穿透数'],
  ['arc','电弧延伸','特殊武器',5,10,3,'电弧连锁距离','%','不增加连锁目标数'],
  ['knock','冲击强化','特殊武器',5,5,3,'已有击退强度','%','不为无击退武器增加击退'],
  ['drone','无人机火力','辅助装备',10,5,2,'无人机伤害','%','不强化治疗、补盾、拦弹与易伤'],
  ['shovel','铲掘效率','辅助装备',5,5,2,'铲子攻击频率','%','仍在铲头触地时结算工作量']
 ];
 const catalog=specs.map(([id,name,group,max,base,step,label,unit,desc])=>({id,name,group,max,base,step,label,unit,desc}));
 const integer=v=>Number.isSafeInteger(v)&&v>=0?v:0,clone=v=>JSON.parse(JSON.stringify(v));
 function createStore(storage,key='hell-elevator-talents-v1'){
  let data={version:1,balance:0,earned:0,levels:{},paid:{},revision:0},warning='',persistence=true;
  function read(){if(!persistence)return;try{const raw=JSON.parse(storage?.getItem(key)||'null');if(!raw||raw.version!==1)return;const next={version:1,balance:integer(raw.balance),earned:integer(raw.earned),levels:{},paid:{},revision:integer(raw.revision)};for(const s of catalog){const n=Math.min(s.max,integer(raw.levels?.[s.id]));const costs=raw.paid?.[s.id];if(n&&Array.isArray(costs)&&costs.length===n&&costs.every(v=>Number.isSafeInteger(v)&&v>0)){next.levels[s.id]=n;next.paid[s.id]=costs.slice();}}data=next;}catch{persistence=false;warning='本地存档不可用，本次进度仅保留在当前页面';}}
  function write(next){next.revision=data.revision+1;try{storage?.setItem(key,JSON.stringify(next));}catch{persistence=false;warning='本地存档不可用，本次进度仅保留在当前页面';}data=next;return true;}
  read();
  return {key,catalog,get warning(){return warning;},view:()=>clone(data),refresh:read,
   cost(id,level){const s=catalog.find(q=>q.id===id);return s&&level>=0&&level<s.max?s.base*(level+1):null;},
   credit(amount){if(!Number.isSafeInteger(amount)||amount<=0)return false;read();if(!Number.isSafeInteger(data.balance+amount)||!Number.isSafeInteger(data.earned+amount))return false;return write({...clone(data),balance:data.balance+amount,earned:data.earned+amount});},
   draft(){read();return clone(data);},
   change(draft,id,direction){const s=catalog.find(q=>q.id===id);if(!s||![1,-1].includes(direction))return false;const n=draft.levels[id]||0;if(direction===1){const cost=this.cost(id,n);if(cost===null||draft.balance<cost)return false;draft.balance-=cost;draft.levels[id]=n+1;(draft.paid[id]??=[]).push(cost);}else{if(!n)return false;draft.balance+=draft.paid[id].pop();draft.levels[id]=n-1;}return true;},
   reset(draft){for(const s of catalog)while((draft.levels[s.id]||0)>0)this.change(draft,s.id,-1);},
   save(draft){read();if(draft.revision!==data.revision)return false;const expected=clone(data);for(const s of catalog){const target=draft.levels[s.id]||0;if(!Number.isInteger(target)||target<0||target>s.max)return false;while((expected.levels[s.id]||0)>target)this.change(expected,s.id,-1);}for(const s of catalog){const target=draft.levels[s.id]||0;while((expected.levels[s.id]||0)<target)if(!this.change(expected,s.id,1))return false;}if(expected.balance!==draft.balance)return false;return write(expected);}
  };
 }
 root.ElevatorTalents={catalog,createStore};
 let storage;try{storage=root.localStorage;}catch{}
 const store=createStore(storage),drops=[],seen=new WeakSet();let run={},runEarned=0,bossAwarded=new Set(),clock=0,draft=null,dirty=false,activeGroup='机体',ui=null,noticeAt=-1,noticeAmount=0,lastNotice=-1,discardPrompt=false,runWallet=0;
 const level=id=>run[id]||0;
 const active=()=>!testMode&&!snakeTest&&!virusTest&&!humanoidTest&&!droneBossTest&&!ufoBossTest&&!(typeof fishSchoolTest!=='undefined'&&fishSchoolTest)&&!(typeof weaponLab!=='undefined'&&weaponLab?.active);
 const ballistic=w=>['pulse','smg','rifle','sniper','barrett','magnum','twin','shotgun','rail','uzi'].includes(w.id);
 function effect(s,n){const value=+(s.step*n).toFixed(3);return s.label+' '+(s.id==='spread'||s.id==='recoil'||s.id==='heavy'?'-':'+')+value+s.unit;}
 function applies(s,w){if(['spread','speed','pierce'].includes(s.id))return ballistic(w)&&(s.id!=='spread'||w.spread>0);if(s.id==='recoil')return !!(w.itemId&&['rocket','sniper'].includes(w.familyId));if(s.id==='heavy')return w.speedPenalty>0;if(s.id==='blast')return w.blastRadius>0;if(s.id==='laser')return w.id==='laser';if(s.id==='arc')return w.id==='tesla';if(s.id==='knock')return w.knockback>0;if(s.id==='drone')return !!drone?.damage;if(s.id==='shovel')return !!shovel;return true;}
 function updateHud(){if(!ui)return;const value=store.view().balance;ui.hud.textContent='◇ '+value;ui.hud.title='技能点 '+value+' · 本局拾取 '+runEarned;ui.hud.disabled=false;ui.hud.setAttribute('aria-label','查看技能点和天赋，余额'+value);if(ui.panel.hidden)ui.balance.textContent='技能点 '+value;}
 function collect(q){if(q.done)return;q.done=true;if(!active())return;if(!store.credit(q.value))return;runEarned+=q.value;noticeAmount=clock-lastNotice<.22?noticeAmount+q.value:q.value;lastNotice=clock;const existing=cashPopups.find(v=>v.skillPoint&&v.age<.22);if(existing){existing.text='技能点 +'+noticeAmount;existing.age=0;}else cashPopups.push({skillPoint:true,text:'技能点 +'+noticeAmount,x:p.x,y:p.y,height:100,age:0,life:.9});if(clock-noticeAt>.09){beep(1160,.055,'sine',.035);beep(1600,.04,'triangle',.02);noticeAt=clock;}if(ui){ui.hud.classList.remove('skill-bump');void ui.hud.offsetWidth;ui.hud.classList.add('skill-bump');}updateHud();}
 function floorCenter(t){return root.HexMap?{x:325+root.HexMap.x(t.x,t.y),y:300+root.HexMap.y(t.y)}:{x:325+t.x*TILE,y:300+t.y*TILE};}
 function spawn(x,y,value){if(!active()||!Number.isFinite(x+y)||!Number.isSafeInteger(value)||value<=0)return null;const centers=tiles.map(floorCenter),at=centers.length?centers.reduce((a,b)=>Math.hypot(a.x-x,a.y-y)<Math.hypot(b.x-x,b.y-y)?a:b):{x:p.x,y:p.y};if(drops.length>=64){const nearest=drops.reduce((a,b)=>Math.hypot(a.x-at.x,a.y-at.y)<Math.hypot(b.x-at.x,b.y-at.y)?a:b);nearest.value+=value;return nearest;}const q={x,y,startX:x,startY:y,targetX:at.x,targetY:at.y,value,age:0,height:15,done:false,attract:false};drops.push(q);return q;}
 function onKill(e){if(!active()||seen.has(e))return;seen.add(e);if(campaignBoss||isBossBody(e)||['rocket','turret','droneMinion','ufoMinion'].includes(e.type)||e.weaponLabTarget||e.escaped)return;if(Math.random()<.25)spawn(e.x,e.y,1);}
 function sweep(){if(!active())return;for(const q of drops)q.attract=true;}
 function tick(dt){
  if(paused||!p||state==='dead'||state==='menu'||state==='won')return;
  clock+=dt;if(!active()){drops.length=0;return;}
  for(const q of drops){
   q.age+=dt;
   if(!q.attract&&!q.landed){const t=Math.min(1,q.age/.25);q.x=q.startX+(q.targetX-q.startX)*t;q.y=q.startY+(q.targetY-q.startY)*t;q.height=14+Math.sin(t*Math.PI)*28;q.landed=t>=1;if(!q.landed)continue;}
   if(!q.attract)q.height=14+Math.sin(q.age*3)*2;
   // A quarter-second landing arc followed by 0.6 seconds on the floor.
   if(q.attract||q.age>=.85){
    q.attract=true;q.flightAge=(q.flightAge||0)+dt;
    const d=Math.hypot(q.x-p.x,q.y-p.y),travel=(160+Math.min(q.flightAge,2)*500)*dt;
    (q.trail??=[]).unshift({x:q.x,y:q.y,height:q.height});if(q.trail.length>5)q.trail.pop();
    if(d<=travel+7)collect(q);else{q.x+=(p.x-q.x)/d*travel;q.y+=(p.y-q.y)/d*travel;q.height+=(30-q.height)*(1-Math.exp(-dt*7));}
   }
  }
  for(let i=drops.length-1;i>=0;i--)if(drops[i].done)drops.splice(i,1);
 }
 function drawDrops(){
  const r=renderer;
  for(const q of drops){
   // Player standing height is about 54 units. The normal crystal is 18 units tall.
   const big=q.value>=20,size=big?10:9,x=q.x-325,z=(q.y-300)*1.06,h=q.height,spin=q.age*3.4;
   r.residentMesh('skill-crystal:outer',()=>{
    const corners=[[.65,0,0],[0,0,.65],[-.65,0,0],[0,0,-.65]];
    for(let i=0;i<4;i++){const a=corners[i],b=corners[(i+1)%4];r.quad([0,1,0],a,b,[0,1,0],i%2?'#286f9d':'#174568');r.quad([0,-1,0],b,a,[0,-1,0],i%2?'#204f7b':'#153655');}
   },monsterPose(x,h,z,spin,size,size,size));
   // All twelve octahedron edges are solid emissive blue rods, independent of scene light.
   r.residentMesh('skill-crystal:blue-frame',()=>{
    const corners=[[.65,0,0],[0,0,.65],[-.65,0,0],[0,0,-.65]],edges=[];
    for(let i=0;i<4;i++){edges.push([[0,1,0],corners[i]],[[0,-1,0],corners[i]],[corners[i],corners[(i+1)%4]]);}
    for(const [a,b]of edges){
     const d=b.map((v,i)=>v-a[i]),length=Math.hypot(...d),axis=d.map(v=>v/length),reference=Math.abs(axis[1])>.9?[1,0,0]:[0,1,0],cross=(u,v)=>[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],u=cross(axis,reference),uLength=Math.hypot(...u),side=u.map(v=>v/uLength),up=cross(axis,side),at=(p,angle)=>p.map((v,i)=>v+.12*(side[i]*Math.cos(angle)+up[i]*Math.sin(angle)));
     for(let i=0;i<6;i++){const t=i*Math.PI/3,next=(i+1)*Math.PI/3;r.emissiveQuad(at(a,t),at(b,t),at(b,next),at(a,next),i%2?'#80dfff':'#16aaff');}
    }
   },monsterPose(x,h,z,spin,size,size,size));
   r.residentMesh('skill-crystal:core',()=>r.emissiveBox(0,0,0,.22,.36,.22,'#73d9ff'),monsterPose(x,h,z,spin,size,size,size));
   r.glow(x,h,z,7+.45*Math.sin(q.age*3),'#149dff');
   if(!q.attract)r.disc(x,3,z,size*.6,'#20455e');
   for(const [i,v]of(q.trail||[]).entries())r.projectile(v.x-325,v.height,(v.y-300)*1.06,(2.3-i*.35),'#48baff');
  }
 }
 function withWeapon(w,source,emit){if(source!=='weapon')return emit();const saved=new Map(),set=(key,value)=>{if(!saved.has(key))saved.set(key,{has:Object.prototype.hasOwnProperty.call(w,key),value:w[key]});w[key]=value;};if(ballistic(w)){set('spread',(w.spread||0)*(1-.03*level('spread')));set('speed',(w.speed||0)*(1+.03*level('speed')));}if(w.id==='rotor')set('interval',w.interval/(1+.01*level('rate')));if(w.id==='tesla')set('chainRange',(w.chainRange||120)*(1+.03*level('arc')));if(w.knockback)set('knockback',w.knockback*(1+.03*level('knock')));try{return emit();}finally{for(const [key,v]of saved)if(v.has)w[key]=v.value;else delete w[key];}}
 function decorate(start,w,source){if(source!=='weapon'&&source!=='drone')return;for(let i=start;i<shots.length;i++){const s=shots[i];if(s.talentDecorated)continue;s.talentDecorated=true;if(source==='weapon'){if(s.damage!==undefined)s.damage*=1+.02*level('damage');if(s.critChance!==undefined){s.critChance=Math.min(1,s.critChance+.005*level('crit'));s.critMultiplier=(s.critMultiplier||2)+.03*level('critDamage');}if(s.blastRadius)s.blastRadius*=1+.02*level('blast');if(w.id==='laser')s.hitRadius=(s.hitRadius||4)*(1+.02*level('laser'));if(ballistic(w)&&!s.beam&&(s.pierce||1)<99&&level('pierce')&&Math.random()<.01*level('pierce'))s.pierce=(s.pierce||1)+1;}}}
 function renderPanel(){const total=store.view();ui.balance.textContent='技能点 '+draft.balance;ui.summary.textContent='已投入 '+(total.earned-draft.balance)+' · 本局已拾取 '+runEarned;ui.tabs.innerHTML=['机体','枪械','特殊武器','辅助装备'].map(g=>`<button type="button" data-group="${g}" aria-selected="${activeGroup===g}" class="${activeGroup===g?'selected':''}">${g}</button>`).join('');ui.list.innerHTML=catalog.filter(s=>s.group===activeGroup).map(s=>{const n=draft.levels[s.id]||0,cost=store.cost(s.id,n),app=applies(s,weapon);return `<article class="skill-row"><div class="skill-row-heading"><strong>${s.name}</strong><span>${n} / ${s.max}</span></div><p>${effect(s,n)}</p><small>${s.desc}${!app?' · 当前装备不适用':''}</small><div class="skill-controls"><button type="button" data-skill="${s.id}" data-change="-1" aria-label="减少${s.name}" ${!n?'disabled':''}>−</button><span>${cost===null?'已满级':`下级 ${cost}点 · ${effect(s,n+1)}`}</span><button type="button" data-skill="${s.id}" data-change="1" aria-label="升级${s.name}" ${cost===null||draft.balance<cost?'disabled':''}>＋</button></div></article>`;}).join('');ui.save.disabled=!dirty;ui.status.textContent=store.warning||'每项独立涨价 · 免费洗点 · 下局生效';}
 function open(){if(!['menu','dead','won'].includes(state)){toast('技能点 '+store.view().balance+' · 出发前可分配\n本局天赋 '+Object.values(run).reduce((a,b)=>a+b,0)+'级');return;}draft=store.draft();dirty=false;discardPrompt=false;ui.panel.hidden=false;ui.close.textContent='返回';releaseJoy();Object.keys(keys).forEach(k=>keys[k]=false);renderPanel();ui.close.focus();}
 function close(){if(dirty&&!discardPrompt){discardPrompt=true;ui.status.textContent='有未保存修改：点击保存，或再次点击放弃修改';ui.close.textContent='放弃修改并返回';return;}ui.panel.hidden=true;draft=null;ui.hud.focus();}
 function init(){if(ui||!document.createElement)return;const css=document.createElement('link');css.rel='stylesheet';css.href='talents.css';if(!document.getElementById('talents-inline-style'))document.head.append(css);const hud=document.createElement('button');hud.className='skill-wallet';hud.id='skill-wallet';hud.type='button';$('viewport').append(hud);const panel=document.createElement('section');panel.className='skill-panel';panel.id='skill-panel';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','skill-title');panel.innerHTML='<header><div><small>机体改装</small><h2 id="skill-title">技能加点</h2></div><button type="button" id="skill-close">返回</button></header><div class="skill-budget"><strong id="skill-balance"></strong><small id="skill-summary"></small></div><nav id="skill-tabs" aria-label="技能分类"></nav><div id="skill-list"></div><footer><p id="skill-status" role="status"></p><div><button type="button" id="skill-reset">重置分配</button><button type="button" id="skill-save" class="primary">保存分配</button></div></footer>';$('viewport').append(panel);ui={hud,panel,balance:$('skill-balance'),summary:$('skill-summary'),tabs:$('skill-tabs'),list:$('skill-list'),status:$('skill-status'),close:$('skill-close'),save:$('skill-save')};hud.onclick=open;ui.close.onclick=close;ui.tabs.onclick=e=>{const button=e.target.closest('[data-group]');if(button){activeGroup=button.dataset.group;renderPanel();ui.list.scrollTop=0;}};ui.list.onclick=e=>{const button=e.target.closest('[data-skill]');if(button&&store.change(draft,button.dataset.skill,Number(button.dataset.change))){dirty=true;discardPrompt=false;ui.close.textContent='返回';renderPanel();}};$('skill-reset').onclick=()=>{store.reset(draft);dirty=true;renderPanel();};ui.save.onclick=()=>{if(!['menu','dead','won'].includes(state))return;if(!store.save(draft)){ui.status.textContent='余额已变化，请返回后重新分配';return;}draft=store.draft();dirty=false;renderPanel();ui.status.textContent='已保存，下次出发生效';updateHud();};panel.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();close();}if(e.key==='Tab'){const focusable=[...panel.querySelectorAll('button:not(:disabled)')],first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});updateHud();}
 function overlay(){if(!ui||!['menu','dead','won'].includes(state))return;const host=$('overlay');if(!host.querySelector('.skill-entry')){const button=document.createElement('button');button.type='button';button.className='skill-entry';button.textContent='技能加点 ◇ '+store.view().balance;button.onclick=open;host.append(button);if(state!=='menu'){const text=document.createElement('small');text.textContent='本局拾取 '+runEarned+' 技能点 · 永久余额 '+store.view().balance;host.append(text);}}updateHud();}
 root.TalentRuntime={store,catalog,level,active,ballistic,applies,effect,drops,spawn,onKill,tick,draw:drawDrops,withWeapon,decorate,sweep,init,overlay,open,
  start(){store.refresh();run=clone(store.view().levels);runEarned=0;runWallet=store.view().balance;bossAwarded=new Set();drops.length=0;clock=0;noticeAt=lastNotice=-1;noticeAmount=0;if(ui)ui.panel.hidden=true;updateHud();},
  boss(){if(!active()||!campaignBoss||bossAwarded.has(floor))return;bossAwarded.add(floor);spawn(p.x,p.y,20);sweep();},
  finish(){for(const q of drops)collect(q);drops.length=0;updateHud();},
  death(){drops.length=0;},summary:()=>({earned:runEarned,balance:store.view().balance,levels:clone(run),startBalance:runWallet})};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.ElevatorTalents;
})(typeof globalThis!=='undefined'?globalThis:this);

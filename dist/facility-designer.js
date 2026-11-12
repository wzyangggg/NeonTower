'use strict';
(()=>{
 const $=id=>document.getElementById(id),key=c=>c.join(','),copy=x=>JSON.parse(JSON.stringify(x)),storeKey='neon-facility-designer-v1',directions=[[1,0],[-1,0],[0,1],[0,-1],[1,-1],[-1,1]],size=30;
 const symbols={shotgun_tower:'⁙',sniper_tower:'⌖',slow_field:'◎',shield_tower:'⬡',electric_tower:'ϟ',healing_tower:'✚',missile_tower:'➤',missile_bomb:'➤',freeze_bomb:'❄',laser_bomb:'✳',tower:'ϟ',echo:'◎',battery:'▣',turbine:'✧',miner:'◆',apple:'●',banana:'☽',grape:'⁙',watermelon:'◒',irrigator:'♧',pulse:'≋',biogenerator:'♥',clockshop:'◷',repair_turret:'✚',floor_expansion:'＋'};
 const categories={defense:'防御塔',supply:'补给',operation:'运转',terrain:'地形'};
 const defaultCategory=kind=>kind==='shield_tower'?'supply':(ElectricTiles.isBomb(kind)||ElectricTiles.isDefenseTower?.(kind))?'defense':['shield_tower','miner','apple','banana','grape','watermelon','pulse','clockshop'].includes(kind)?'supply':(kind==='repair_turret'||Object.hasOwn(ElectricTiles.barricadeDefs,kind))?'terrain':'operation';
 let categoryFilter='all';
 const defaults=Object.fromEntries(Object.entries(ElectricTiles.defs).map(([kind,d])=>[kind,{name:d.name,enabledInGame:true,category:defaultCategory(kind),playerDescription:d.desc||'',developerDescription:'',cells:copy(d.cells),effectMode:kind==='slow_field'?'radius':kind==='clockshop'?'global':ElectricTiles.isBomb(kind)?'none':['repair_turret','echo','battery','turbine','irrigator','pulse','biogenerator'].includes(kind)?'adjacent':'none',effectCells:[],range:d.range||0}]));
 const legacyExpansion={name:'扩建地板',enabledInGame:true,category:'terrain',playerDescription:'增加场地格子，扩建后随机发现地形。商店基础扩建3格，奖励扩建6格。',developerDescription:'现有游戏规则：商店基础扩建3格，每格1建材；地图剩余不足时按实际格数收费。奖励扩建6格。预留相邻未开发格，按扩地随机表决定特殊地形与危险机关，下一层落地闪烁后统一提交。地图固定13列×11行。\n本条目的格子表示扩建形状草稿，不是建筑占地；当前游戏仍使用原有随机扩地规则，绘制形状与开关尚未连接到扩建逻辑。',cells:[[0,0],[1,0],[0,1]],effectMode:'none',effectCells:[],range:0};
 const expansionIds={floor:'floor_expansion_double',floorLine:'floor_expansion_line',floorBend:'floor_expansion_bend',floorTriangle:'floor_expansion_triangle'},isExpansion=kind=>kind==='floor_expansion'||Object.values(expansionIds).includes(kind);
 for(const [kind,d]of Object.entries(ElectricTiles.floorDefs))defaults[expansionIds[kind]]={name:d.name,enabledInGame:true,category:'terrain',playerDescription:d.desc,developerDescription:'游戏扩建类型：'+kind+'。按此形状增加'+d.cells.length+'个相邻可行走格，必须连接已有场地且不与已开发格重叠，可能随机生成陷阱或路障。\n此形状直接读取游戏当前定义。设计台形状、名称、玩家描述与接入游戏开关实时同步到同源游戏页；已经扩建的地板保留原样。',cells:copy(d.cells),effectMode:'none',effectCells:[],range:0};
 for(const [kind,d]of Object.entries(ElectricTiles.barricadeDefs))defaults[kind]={name:d.name,enabledInGame:true,category:'terrain',playerDescription:d.desc,developerDescription:'按占地逐格生成掩体，每格独立耐久。整组放置与拆除，每关恢复；修改占地后新放置的掩体使用新形状。',cells:copy(d.cells),effectMode:'none',effectCells:[],range:0};
 let designs=copy(defaults),selected='tower',brush='footprint',showCoords=false,undo=[],redo=[],gesture=null,persisted=true;
 try{const saved=JSON.parse(localStorage.getItem(storeKey));if(saved){designs=validate(saved,false).facilities;if((saved.designCatalogVersion||0)<7)for(const id of ['shotgun_tower','sniper_tower','slow_field'])if(!Object.hasOwn(designs,id))designs[id]=copy(defaults[id]);if((saved.designCatalogVersion||0)<6&&!Object.hasOwn(designs,'shield_tower'))designs.shield_tower=copy(defaults.shield_tower);if((saved.designCatalogVersion||0)<5){for(const id of ['electric_tower','healing_tower','missile_tower'])if(defaults[id]&&!Object.hasOwn(designs,id))designs[id]=copy(defaults[id]);}if((saved.designCatalogVersion||0)<4){for(const id of Object.keys(ElectricTiles.barricadeDefs))if(!Object.hasOwn(designs,id))designs[id]=copy(defaults[id]);}if((saved.designCatalogVersion||0)<3){for(const id of ['freeze_bomb','laser_bomb','missile_bomb'])if(!Object.hasOwn(designs,id))designs[id]=copy(defaults[id]);}if((saved.designCatalogVersion||0)<2){if(designs.floor_expansion&&JSON.stringify(designs.floor_expansion)===JSON.stringify(legacyExpansion))delete designs.floor_expansion;for(const id of Object.values(expansionIds))if(!designs[id])designs[id]=copy(defaults[id]);}for(const id of Object.values(expansionIds))if(designs[id])designs[id].developerDescription=designs[id].developerDescription.replace('设计台的修改与开关暂存为草稿，尚未应用到游戏扩建逻辑。','设计台形状、名称、玩家描述与接入游戏开关实时同步到同源游戏页；已经扩建的地板保留原样。');for(const d of Object.values(designs))if(d.name==='修理炮塔')d.developerDescription=d.developerDescription.replace('换层重新开始施工','换层保留有效目标与剩余施工时间，累计满25秒后完成拆除');if(designs.shield_tower){designs.shield_tower.name=defaults.shield_tower.name;designs.shield_tower.category='supply';designs.shield_tower.playerDescription=defaults.shield_tower.playerDescription;}for(const [id,d]of Object.entries(designs)){const runtime=d.name==='钟表店'?'clockshop':d.name==='修理炮塔'?'repair_turret':null;if(runtime&&id!==runtime&&!Object.hasOwn(designs,runtime)){const ordered=Object.entries(designs).map(([key,value])=>key===id?[runtime,{...value,enabledInGame:true}]:[key,value]);designs=Object.fromEntries(ordered);}}localStorage.setItem(storeKey,JSON.stringify({version:2,designCatalogVersion:7,coordinateSystem:'axial',tileSpacing:54,facilities:designs}));}}catch{}
 const current=()=>designs[selected],point=([q,r])=>[Math.sqrt(3)*size*(q+r/2),1.5*size*r];
 function validCells(cells,nonempty=false){if(!Array.isArray(cells)||cells.length>127||nonempty&&!cells.length)throw Error('格子数据无效');const seen=new Set();for(const c of cells){if(!Array.isArray(c)||c.length!==2||!c.every(Number.isInteger)||Math.max(Math.abs(c[0]),Math.abs(c[1]),Math.abs(c[0]+c[1]))>6||seen.has(key(c)))throw Error('格子必须是半径6以内的唯一轴坐标');seen.add(key(c));}return cells;}
 function connected(cells){if(!cells.length)return false;const remaining=new Set(cells.map(key)),queue=[cells[0]];remaining.delete(key(cells[0]));for(let i=0;i<queue.length;i++)for(const [q,r]of directions){const c=[queue[i][0]+q,queue[i][1]+r];if(remaining.delete(key(c)))queue.push(c);}return !remaining.size;}
 function validate(data,strict=true){
  if(![1,2].includes(data?.version)||!data.facilities||typeof data.facilities!=='object'||Array.isArray(data.facilities))throw Error('请选择设计台导出的配置');
  const entries=Object.entries(data.facilities);if(!entries.length||entries.length>100)throw Error('种类数量须为1至100');const result={};
  for(const [kind,d]of entries){
   if(!/^[a-z][a-z0-9_]{0,63}$/.test(kind)||['constructor','prototype','__proto__'].includes(kind))throw Error('种类标识无效');
   if(!d||typeof d.name!=='string'||!d.name.trim()||d.name.trim().length>24)throw Error('种类名称须为1至24个字');
   validCells(d.cells,true);validCells(d.effectCells);if(strict&&!connected(d.cells))throw Error('占地必须保持连通');
   if(!['adjacent','custom','radius','global','none'].includes(d.effectMode)||!Number.isFinite(d.range)||d.range<0||d.range>1000)throw Error('影响范围数据无效');
   const playerDescription=d.playerDescription??defaults[kind]?.playerDescription??'',developerDescription=d.developerDescription??'';if(typeof playerDescription!=='string'||playerDescription.length>2000||typeof developerDescription!=='string'||developerDescription.length>6000)throw Error('描述格式或长度无效');
   const category=d.category??defaultCategory(kind);if(!Object.hasOwn(categories,category))throw Error('建筑分类无效');
   const enabledInGame=d.enabledInGame??Object.hasOwn(defaults,kind);if(typeof enabledInGame!=='boolean')throw Error('接入游戏开关必须为布尔值');
   result[kind]={name:d.name.trim(),enabledInGame,category,playerDescription:ElectricTiles.playerDescription(kind,playerDescription),developerDescription,cells:copy(d.cells),effectMode:d.effectMode,effectCells:copy(d.effectCells),range:d.range};
  }return {version:2,facilities:result};
 }
 const escapeHTML=text=>text.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

 function payload(){return {version:2,designCatalogVersion:7,coordinateSystem:'axial',tileSpacing:54,facilities:copy(designs)};}
 function persist(){try{localStorage.setItem(storeKey,JSON.stringify(payload()));persisted=true;}catch{persisted=false;}$('save-status').textContent=persisted?'● 已自动保存到本机':'保存失败，请导出备份';}
 function checkpoint(){undo.push({designs:copy(designs),selected});if(undo.length>60)undo.shift();redo=[];}
 function notify(text){$('notice').textContent=text;}
 function effectCells(d=current()){
  const occupied=new Set(d.cells.map(key)),out=new Map();
  if(d.effectMode==='global'){const cells=[];for(let r=-6;r<=6;r++)for(let q=-6;q<=6;q++)if(Math.abs(q+r)<=6&&!occupied.has(key([q,r])))cells.push([q,r]);return cells;}
  if(d.effectMode==='custom')return d.effectCells.filter(c=>!occupied.has(key(c)));
  if(d.effectMode==='adjacent')for(const [q,r]of d.cells)for(const [dq,dr]of directions){const c=[q+dq,r+dr];if(!occupied.has(key(c)))out.set(key(c),c);}
  return [...out.values()];
 }
 function exportCurrent(){const d=current();return {id:selected,...copy(d),resolvedEffectCells:effectCells(),rangeOrigin:'footprint-center'};}
 function library(){
  const scroll=$('facilities').scrollLeft,scrollTop=$('facilities').scrollTop,entries=Object.entries(designs),visible=entries.filter(([,d])=>categoryFilter==='all'||d.category===categoryFilter);
  $('category-filters').innerHTML=Object.entries({all:'全部',...categories}).map(([id,name])=>`<button data-category-filter="${id}" aria-pressed="${id===categoryFilter}">${name}<span>${id==='all'?entries.length:entries.filter(([,d])=>d.category===id).length}</span></button>`).join('');
  $('category-help').textContent=categoryFilter==='terrain'?'地形：改造场地或处理负面格子的建筑，例如建造后每层消除一个负面格子。':categoryFilter==='defense'?'防御塔：直接攻击敌人、提供战斗火力。':categoryFilter==='supply'?'补给：产出金币、食物或可拾取的补给。':categoryFilter==='operation'?'运转：加速、供电、回响和生产联动。':'按建筑功能分类，可在右侧修改归属。';
  $('facilities').innerHTML=visible.map(([kind,d])=>`<button class="facility ${d.enabledInGame?'':'disabled-kind'}" data-kind="${kind}" aria-current="${kind===selected}"><span class="facility-icon" style="--icon:${ElectricTiles.defs[kind]?.color||'#9ce6be'}">${symbols[kind]||(isExpansion(kind)?'＋':'⬡')}</span><span class="facility-text">${escapeHTML(d.name)}<small>${d.cells.length}格 · ${categories[d.category]} · ${d.enabledInGame?(defaults[kind]?'已接入':'待实现'):'未接入'}</small></span>${JSON.stringify(d)!==JSON.stringify(defaults[kind])?'<span class="modified">●</span>':''}</button>`).join('')||'<p class="empty-category">此分类暂无建筑。点击上方“新增格子种类”，开始设计。</p>';
  $('facilities').scrollLeft=scroll;$('facilities').scrollTop=scrollTop;
 }

 function grid(){
  const d=current(),occupied=new Set(d.cells.map(key)),affected=new Set(effectCells(d).map(key));let html='';
  for(let r=-6;r<=6;r++)for(let q=-6;q<=6;q++){if(Math.abs(q+r)>6)continue;const c=[q,r],[x,y]=point(c),points=Array.from({length:6},(_,i)=>{const a=(30+i*60)*Math.PI/180;return [x+Math.cos(a)*(size-1.8),y+Math.sin(a)*(size-1.8)].join(',');}).join(' ');html+=`<polygon data-q="${q}" data-r="${r}" class="${occupied.has(key(c))?'cell-footprint':affected.has(key(c))?'cell-effect':''}" points="${points}" role="button" tabindex="0" aria-label="格子 ${q},${r}${occupied.has(key(c))?' 占地':affected.has(key(c))?' 范围':''}"><title>${q}, ${r}</title></polygon>`;if(showCoords&&key(c)!=='0,0')html+=`<text class="coord" text-anchor="middle" x="${x}" y="${y+3}">${q},${r}</text>`;}
  if(d.effectMode==='radius'){const centers=d.cells.map(point),x=centers.reduce((s,p)=>s+p[0],0)/centers.length,y=centers.reduce((s,p)=>s+p[1],0)/centers.length;html+=`<circle class="radius-area" cx="${x}" cy="${y}" r="${d.range/54*Math.sqrt(3)*size}"/>`;}
  html+='<text class="anchor" text-anchor="middle" x="0" y="8">⊙</text>';const extent=d.effectMode==='radius'?Math.max(360,d.range/54*Math.sqrt(3)*size+Math.max(...d.cells.map(c=>Math.max(...point(c).map(Math.abs))))+35):360;$('grid').setAttribute('viewBox',[-extent,-extent*11/12,extent*2,extent*11/6].join(' '));$('grid').innerHTML=html;
 }
 function render(){
  if(!Object.hasOwn(designs,selected))selected=Object.keys(designs)[0];const d=current(),changed=JSON.stringify(d)!==JSON.stringify(defaults[selected]);library();grid();$('facility-total').textContent=Object.keys(designs).length;$('kind-name').value=d.name;$('enabled-in-game').checked=d.enabledInGame;$('integration-status').textContent=isExpansion(selected)?d.enabledInGame?'已接入游戏：扩建形状、名称、玩家描述与开关实时同步到同源游戏页。':'关闭：该扩建类型不再进入游戏选择与测试目录。':!d.enabledInGame?'关闭：不会在本浏览器游戏中投放。':defaults[selected]?selected==='clockshop'?'开启：已接入游戏。新放置建筑使用设计台占地；钟表增益固定全图生效。':selected==='repair_turret'?'开启：已接入游戏。新放置建筑使用设计台占地与范围；施工周期25秒。':'开启：占地与范围已接入游戏，新放置或重新移动时应用；游戏旧标签需刷新一次。':'开启：已标记为待接入；此种类尚无游戏实现，暂不会在游戏中投放。';$('kind-category').value=d.category;$('player-description').value=d.playerDescription;$('developer-description').value=d.developerDescription;$('delete-kind').disabled=Object.keys(designs).length<=1;$('delete-kind').title=Object.keys(designs).length<=1?'至少保留一种格子':'';$('facility-name').textContent=d.name;$('dirty-badge').textContent=changed?'已修改':'原始配置';$('dirty-badge').classList.toggle('changed',changed);$('cell-count').textContent=d.cells.length;$('cell-count').nextElementSibling.textContent=isExpansion(selected)?'扩建格数':'占地格数';$('effect-count').textContent=d.effectMode==='global'?'全图':d.effectMode==='radius'?'◯':effectCells().length;$('effect-mode').value=d.effectMode;$('radius').value=d.range;$('radius-field').hidden=d.effectMode!=='radius';
  $('mode-note').textContent=isExpansion(selected)?'实色格子表示本次希望增加的地板形状，可逐格绘制、旋转和镜像。游戏的新扩建、背包缩略图与落点预览使用此形状；不会改动已经扩建的地板。':({global:'作用于整个场地，不受相邻距离限制。紫色铺满画布仅表示全图范围，实际地图大小不受此画布限制。',adjacent:'范围跟随占地外沿自动变化。选择“画范围”后会转为自定义，保留当前这一圈。',custom:'紫色格子是设施的影响区域，可逐格增删。范围以锚点为基准，不会占用地板。',radius:'圆形表示设施的加成/作用半径。画范围可以切换为逐格设计；圆形可能延伸到画布之外。',none:'该设施默认没有影响范围。选择“画范围”即可自定义。'})[d.effectMode];
  const ok=connected(d.cells);
  if(selected==='tower')$('mode-note').textContent+=' 此处仅定义设施加成/作用范围；电浆炸弹为全屏电击，目标间无距离限制，不受此处范围、格子或无范围设置影响。';
  $('validation').textContent=ok?'✓ 占地连通 · 配置有效':'⚠ 存在不相连的占地，请继续补齐';$('validation').classList.toggle('error',!ok);$('config').textContent=JSON.stringify(exportCurrent(),null,2);$('undo').disabled=!undo.length;$('redo').disabled=!redo.length;document.querySelectorAll('[data-brush]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.brush===brush)));$('coordinates').setAttribute('aria-pressed',String(showCoords));
 }
 function mutate(action){checkpoint();action();persist();render();}
 function applyCell(c){
  if(!gesture||gesture.visited.has(key(c)))return;gesture.visited.add(key(c));const d=current(),occupied=d.cells.some(x=>key(x)===key(c));
  if(brush==='footprint'){
   if(d.cells.length===1&&occupied&&!gesture.add){notify('设施至少需要保留一个占地格。');return;}
   if(gesture.add&&!occupied){d.cells.push(c);d.effectCells=d.effectCells.filter(x=>key(x)!==key(c));}else if(!gesture.add)d.cells=d.cells.filter(x=>key(x)!==key(c));
  }else if(brush==='effect'){
   if(occupied){notify('此格属于占地，影响范围只标记占地之外的格子。');return;}
   if(gesture.add&&!d.effectCells.some(x=>key(x)===key(c)))d.effectCells.push(c);else if(!gesture.add)d.effectCells=d.effectCells.filter(x=>key(x)!==key(c));
  }else{
   if(d.cells.length>1)d.cells=d.cells.filter(x=>key(x)!==key(c));d.effectCells=d.effectCells.filter(x=>key(x)!==key(c));
  }
  render();
 }
 function begin(c){checkpoint();const d=current();if(brush==='effect'&&d.effectMode!=='custom'){d.effectCells=effectCells();d.effectMode='custom';}gesture={visited:new Set(),add:!(brush==='effect'?d.effectCells:d.cells).some(x=>key(x)===key(c))};applyCell(c);}
 function finish(){if(!gesture)return;gesture=null;persist();render();}
 $('grid').addEventListener('pointerdown',e=>{const cell=e.target.closest('[data-q]');if(!cell||e.button>0)return;e.preventDefault();$('grid').setPointerCapture(e.pointerId);begin([Number(cell.dataset.q),Number(cell.dataset.r)]);});
 $('grid').addEventListener('pointermove',e=>{const cell=document.elementFromPoint(e.clientX,e.clientY)?.closest?.('[data-q]');if(cell){const c=[Number(cell.dataset.q),Number(cell.dataset.r)];$('coordinate').textContent=c.join(', ');if(gesture)applyCell(c);}});
 $('grid').addEventListener('pointerup',finish);$('grid').addEventListener('pointercancel',finish);
 $('grid').addEventListener('keydown',e=>{const cell=e.target.closest('[data-q]');if(cell&&['Enter',' '].includes(e.key)){e.preventDefault();begin([Number(cell.dataset.q),Number(cell.dataset.r)]);finish();}});
 $('facilities').onclick=e=>{const b=e.target.closest('[data-kind]');if(!b)return;selected=b.dataset.kind;notify('');render();};
 document.querySelectorAll('[data-brush]').forEach(b=>b.onclick=()=>{brush=b.dataset.brush;notify(brush==='effect'?'点击格子编辑影响范围。':'点击格子添加，再点一次取消。');render();});
 $('effect-mode').onchange=e=>{const mode=e.target.value;mutate(()=>{const d=current();if(mode==='custom'&&d.effectMode!=='custom')d.effectCells=effectCells();d.effectMode=mode;});};
 $('radius').oninput=e=>{const n=Number(e.target.value);if(!Number.isFinite(n)||n<0||n>1000){notify('射程请输入0至1000。');render();return;}mutate(()=>current().range=n);};
 function transform(fn){mutate(()=>{const d=current();d.cells=d.cells.map(fn);d.effectCells=d.effectCells.map(fn);});}
 $('rotate-left').onclick=()=>transform(([q,r])=>[q+r,-q]);$('rotate-right').onclick=()=>transform(([q,r])=>[-r,q+r]);$('mirror').onclick=()=>transform(([q,r])=>[-q-r,r]);
 $('clear-range').onclick=()=>mutate(()=>{current().effectMode='none';current().effectCells=[];});
 $('reset').onclick=()=>{mutate(()=>designs[selected]=defaults[selected]?copy(defaults[selected]):{name:current().name,enabledInGame:false,category:current().category,playerDescription:'',developerDescription:'',cells:[[0,0]],effectMode:'none',effectCells:[],range:0});notify('已恢复此设施默认值，可撤销。');};
 function travel(from,to){if(!from.length)return;to.push({designs:copy(designs),selected});const previous=from.pop();designs=previous.designs;selected=previous.selected;if(categoryFilter!=='all')categoryFilter=designs[selected].category;persist();render();}
 $('undo').onclick=()=>travel(undo,redo);$('redo').onclick=()=>travel(redo,undo);
 document.addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?travel(redo,undo):travel(undo,redo);}});
 $('coordinates').onclick=()=>{showCoords=!showCoords;render();};
 $('export').onclick=()=>{try{const data=validate(payload());const blob=new Blob([JSON.stringify({...payload(),facilities:data.facilities},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='neon-facility-designs.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('已导出全部设施配置。配置尚未写入游戏。');}catch(e){notify('暂不能导出：'+e.message);}};
 $('copy').onclick=async()=>{try{await navigator.clipboard.writeText(JSON.stringify(exportCurrent(),null,2));notify('已复制当前设施配置。');}catch{notify('无法访问剪贴板，可从上方配置文本手动复制。');}};
 $('import').onclick=()=>$('file').click();$('file').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>4000000)throw Error('配置文件过大');const parsed=validate(JSON.parse(await file.text()));mutate(()=>{designs=parsed.facilities;if(!Object.hasOwn(designs,selected))selected=Object.keys(designs)[0];});notify('配置已导入，可撤销。');}catch(error){notify('导入失败：'+error.message);}finally{e.target.value='';}};
 $('add-kind').onclick=()=>{$('new-kind-form').reset();$('new-kind-category').value=categoryFilter==='all'?current().category:categoryFilter;$('new-kind-dialog').showModal();$('new-kind-name').focus();};
 $('cancel-kind').onclick=()=>$('new-kind-dialog').close();
 $('new-kind-form').onsubmit=e=>{e.preventDefault();const name=$('new-kind-name').value.trim();if(!name){$('new-kind-name').setCustomValidity('请输入种类名称');$('new-kind-name').reportValidity();return;}if(Object.keys(designs).length>=100){notify('最多保存100种格子。');$('new-kind-dialog').close();return;}mutate(()=>{let serial=1;while(Object.hasOwn(designs,'custom_'+serial))serial++;const id='custom_'+serial,design=$('new-kind-template').value==='copy'?copy(current()):{playerDescription:'',developerDescription:'',cells:[[0,0]],effectMode:'none',effectCells:[],range:0};design.name=name;design.enabledInGame=false;design.category=$('new-kind-category').value;designs[id]=design;if(categoryFilter!=='all')categoryFilter=design.category;selected=id;});$('new-kind-dialog').close();notify('已新增“'+name+'”，可以绘制占地和范围。');};
 $('new-kind-name').oninput=()=>$('new-kind-name').setCustomValidity('');
 for(const [id,field]of [['player-description','playerDescription'],['developer-description','developerDescription']]){
  let changed=false;$(id).onfocus=()=>changed=false;
  $(id).oninput=e=>{if(!changed){checkpoint();changed=true;}current()[field]=e.target.value;persist();library();$('config').textContent=JSON.stringify(exportCurrent(),null,2);$('dirty-badge').textContent='已修改';$('dirty-badge').classList.add('changed');$('undo').disabled=!undo.length;$('redo').disabled=!redo.length;};
 }
 $('category-filters').onclick=e=>{const button=e.target.closest('[data-category-filter]');if(!button)return;categoryFilter=button.dataset.categoryFilter;const match=Object.entries(designs).find(([,d])=>categoryFilter==='all'||d.category===categoryFilter);if(match)selected=match[0];render();};
 $('kind-category').onchange=e=>{const value=e.target.value;mutate(()=>{current().category=value;if(categoryFilter!=='all')categoryFilter=value;});};
 $('enabled-in-game').onchange=e=>{const enabled=e.target.checked;mutate(()=>current().enabledInGame=enabled);notify(enabled?'已允许接入游戏。未实现的自定义种类会保留为待接入。':'已关闭，此种类不会在游戏中投放。');};
 $('kind-name').onchange=e=>{const name=e.target.value.trim();if(!name){notify('名称不能为空。');render();return;}mutate(()=>current().name=name);};
 $('delete-kind').onclick=()=>{if(Object.keys(designs).length<=1)return;const name=current().name;mutate(()=>{const ids=Object.keys(designs),index=ids.indexOf(selected);delete designs[selected];selected=ids[index+1]||ids[index-1];});notify('已删除“'+name+'”，可点击撤销恢复。');};
 $('facility-total').textContent=Object.keys(defaults).length;persist();render();$('save-status').textContent='● 本地自动保存';
})();

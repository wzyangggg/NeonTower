'use strict';
// A local sandbox: gameplay facilities use their normal production and combat code.
globalThis.TileLab=(()=>{
 const E=ElectricTiles,editor=ElectricEditor,storageKey='hell-elevator-tile-lab-v1';
 let initializing=false;
 let active=false,god=true,speed=1,history=[],lastSaved='',autosave=0;
 const groups={全部:Object.keys(editor.defs),攻击:['electric_tower','missile_tower','tower','freeze_bomb','laser_bomb','missile_bomb'],生产:['clockshop','miner','apple','banana','grape','watermelon'],辅助:['shield_tower','healing_tower','repair_turret','echo','battery','turbine','irrigator','pulse','biogenerator'],地形:['floor','floorLine','floorBend','floorTriangle',...Object.keys(E.barricadeDefs),'erase']};
 let category='全部',level=1,controls=null;
 function snapshot(){return {version:1,tiles:tiles.map(t=>Object.fromEntries(Object.entries(t).filter(([k])=>!['electricFacility','barricadeGroup','pickup','supplyQueue'].includes(k)))),facilities:E.list().map(f=>({kind:f.kind,anchor:{...f.anchor},level:E.towerLevel(f)})),turrets:turrets.filter(t=>!t.temporary).map(t=>({...t}))};}
 function checkpoint(){if(!active)return;history.push(snapshot());if(history.length>30)history.shift();}
 function save(){if(!active||initializing)return;const data=JSON.stringify(snapshot());if(data===lastSaved)return;try{localStorage.setItem(storageKey,data);lastSaved=data;}catch{message('浏览器未允许保存，当前布局仍可继续测试。');}}
 function message(text){document.querySelector('#electric-panel [data-status]').textContent=text;}
 function edit(){if(!editor.editing)editor.run();}
 function clearRuntime(){enemies=[];enemyTransports=[];spawnQueue=[];missiles=[];bullets=[];shots=[];hazards=[];particles=[];explosionFX=[];blasts=[];cashPopups=[];time=0;cash=0;p.hp=p.max;p.shield=0;p.inv=0;p.x=325;p.y=300;chaserSpawned=999;cleared=false;state='combat';timedRoom=null;greedRoom=null;E.startRoom();renderer.sceneKey=null;renderer.sceneData=null;updateUI();update();}
 function restore(data){
  if(data?.version!==1||!Array.isArray(data.tiles)||data.tiles.length>143||!Array.isArray(data.facilities))throw Error('布局格式无效');
  const seen=new Set();for(const t of data.tiles){const key=t.x+','+t.y;if(!Number.isInteger(t.x)||!Number.isInteger(t.y)||t.x<grid.minX||t.x>grid.maxX||t.y<grid.minY||t.y>grid.maxY||seen.has(key))throw Error('地板超出场地');seen.add(key);}
  if(!seen.has('0,0'))throw Error('布局缺少出生格');
  tiles=data.tiles.map(t=>({...t}));turrets=(data.turrets||[]).map(t=>({...t}));for(const f of E.list())E.remove(f);
  for(const f of data.facilities)if(E.defs[f.kind])E.place(f.kind,f.anchor,f.level);
  clearRuntime();editor.refresh();save();
 }
 function board(full=true){edit();checkpoint();for(const f of E.list())E.remove(f);tiles=full?[]:HexMap.initialFloor();if(full)for(let y=grid.minY;y<=grid.maxY;y++)for(let x=grid.minX;x<=grid.maxX;x++)tiles.push({x,y,healProgress:0,healFlash:0,medPack:false});turrets=[];clearRuntime();editor.refresh();save();message(full?'完整平台 · 143格。拖动下方任意地块开始摆放。':'初始平台 · 19格。可使用扩地形状测试扩建。');}
 function catalog(){editor.catalog(groups[category],level);controls.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===category)));}
 function preset(kind){
  board(true);const kinds=kind==='all'?Object.keys(E.defs):kind==='farm'?['apple','banana','grape','watermelon','irrigator','biogenerator']:['tower','tower','echo','battery','turbine','pulse'];
  // Packing only chooses legal anchors and keeps the player spawn empty.
  for(const k of kinds){const anchor=tiles.find(t=>E.canPlace(k,t)&&!E.shape(k,t).cells.some(c=>c.x===0&&c.y===0));if(anchor)E.place(k,anchor,level);}
  editor.refresh();save();message('已摆放'+E.list().length+'件设施，可拖动调整；点击开始测试观察效果。');
 }
 function targets(){edit();checkpoint();for(let i=0;i<4;i++){spawn({type:'spitter',side:i});const e=enemies.at(-1);if(e){e.hp=e.max=10000;e.fire=999;e.weaponLabTarget=true;}}message('已添加4个高血量靶子，开始测试后可观察电塔攻击。');}
 function init(){
  const panel=document.getElementById('electric-panel');if(!panel)return;
  const style=document.createElement('style');style.textContent=`
  .tile-lab .electric-lab-tools,.tile-lab [data-expand],.tile-lab [data-close],.tile-lab [data-refill]{display:none!important}
  .tile-lab [data-title]{font-size:15px;letter-spacing:1px}.tile-lab{bottom:12px;max-height:43%;border-color:#66c6bd;background:#101f2bf5}
  .tile-lab .electric-stock-card{flex-basis:105px;min-width:105px;min-height:92px}.tile-lab .electric-stock-card svg{height:50px}
  .tile-lab .electric-actions{display:none}.tile-lab .electric-stock-card small{font-size:10px}.tile-lab .electric-stock-card span{font-size:11px}.tile-lab .electric-backpack{margin:5px 0;padding-bottom:3px}
  .tile-lab-tabs{display:flex;gap:5px;margin:8px 0;flex-wrap:wrap}.tile-lab button[aria-pressed=true]{background:#235455;border-color:#8ce9ca;color:#c9fff0}
  .tile-lab-toolbar{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}.tile-lab-toolbar select{background:#203a49;color:#e9f8ff;border:1px solid #587b8a;border-radius:5px;padding:5px;font:inherit}
  .tile-lab-toolbar details{width:100%}.tile-lab-toolbar details>div{display:flex;flex-wrap:wrap;gap:5px;padding-top:6px}.tile-lab-help{font-size:11px;color:#a7c8ce;margin:6px 0}
  .tile-lab [data-status]{min-height:15px}.tile-lab [data-live]:empty{display:none}
  @media(max-height:740px){.tile-lab-help{display:none}.tile-lab-tabs{margin:5px 0}.tile-lab button{padding:4px 7px;min-height:29px}}
  `;document.head.append(style);
  controls=document.createElement('div');controls.className='tile-lab-controls';controls.hidden=true;
  controls.innerHTML='<div class="tile-lab-toolbar"><button data-action="reset">重置测试</button><button data-action="undo">撤销</button><button data-action="save">保存布局</button><button data-action="load">恢复布局</button><details><summary>场地 / 预设 / 测试工具</summary><div><button data-action="full">完整143格</button><button data-action="small">初始19格</button><button data-action="all">全地块展示</button><button data-action="power">电力联动</button><button data-action="farm">农田生产</button><button data-action="clear">清空设施</button><button data-action="targets">添加靶群</button><button data-action="remove-targets">清除敌人与子弹</button><button data-action="heal">恢复生命</button><button data-action="hurt">生命设为1</button><button data-action="god" aria-pressed="true">无敌：开</button><select data-speed aria-label="测试速度"><option value="1">1倍速</option><option value="2">2倍速</option><option value="4">4倍速</option></select><select data-level aria-label="建筑等级"><option value="1">1级建筑</option><option value="2">2级建筑</option><option value="3">3级建筑</option></select>'+Object.entries({trap:'地刺',saw:'轮锯',flywheel:'飞轮',machine:'机枪炮台',laser:'激光炮台'}).map(([id,name])=>'<button data-hazard="'+id+'">添加'+name+'</button>').join('')+'</div></details></div><div data-catalog><div class="tile-lab-tabs">'+Object.keys(groups).map(g=>'<button data-category="'+g+'" aria-pressed="false">'+g+'</button>').join('')+'</div><p class="tile-lab-help">无限取用 · 向上拖放 · 已有设施可移动，同类同级建筑拖到一起合成</p></div>';
  panel.querySelector('header').after(controls);
  controls.addEventListener('click',e=>{
   const button=e.target.closest('button');if(!button||!active)return;
   if(button.dataset.category){category=button.dataset.category;catalog();return;}
   if(button.dataset.hazard){edit();checkpoint();panel.querySelector('[data-test-hazard="'+button.dataset.hazard+'"]').click();catalog();save();return;}
   switch(button.dataset.action){
    case 'full':board(true);break;case 'small':board(false);break;
    case 'all':case 'power':case 'farm':preset(button.dataset.action);break;
    case 'reset':clearRuntime();editor.refresh();message('保留布局，已重置产物、冷却、增益、角色和统计。');break;
    case 'clear':edit();checkpoint();for(const t of tiles)for(const k of ['electricFacility','barricadeGroup','coverTile','coverHp','trap','saw','flywheel','medical','shieldTile','cashTile','shockTile'])delete t[k];turrets=[];clearRuntime();editor.refresh();save();break;
    case 'undo':{edit();const data=history.pop();if(data){restore(data);message('已撤销上一步摆放。');}else message('没有可撤销的操作。');break;}
    case 'save':save();message('布局已保存在本机浏览器，下次可点击恢复布局。');break;
    case 'load':try{const data=JSON.parse(localStorage.getItem(storageKey));if(!data){message('还没有保存的布局。');break;}edit();checkpoint();restore(data);message('已恢复本机布局。');}catch{message('布局读取失败，当前场地保留。');}break;
    case 'targets':targets();break;case 'remove-targets':enemies=[];enemyTransports=[];bullets=[];shots=[];missiles=[];break;
    case 'heal':p.hp=p.max;updateUI();break;case 'hurt':p.hp=1;p.shield=0;updateUI();break;
    case 'god':god=!god;button.textContent='无敌：'+(god?'开':'关');button.setAttribute('aria-pressed',String(god));break;
   }
  });
  controls.querySelector('[data-speed]').onchange=e=>speed=Number(e.target.value);
  controls.querySelector('[data-level]').onchange=e=>{level=Number(e.target.value);catalog();};
 }
 function open(){
  if(active){editor.open();catalog();return;}
  globalThis.reset();active=true;testMode=true;testResume=false;state='combat';timedRoom=null;greedRoom=null;campaignBoss=0;builderRoom=false;
  globalThis.RoomReady?.cancel();document.getElementById('viewport').classList.remove('falling','landing');
  editor.open();initializing=true;document.getElementById('electric-panel').classList.add('tile-lab');controls.hidden=false;history=[];board(false);history=[];category='全部';catalog();initializing=false;
  // Do not overwrite the previous session until the user actually changes the board.
  try{lastSaved=localStorage.getItem(storageKey)||'';}catch{lastSaved='';}
  message('游戏初始场地 · 19格空白平台。拖动下方地块自由摆放，也可先扩建场地。');
 }
 function update(){if(!active)return;$('status').textContent='地块试验场';$('wave').textContent=E.list().length+'件设施 · '+tiles.length+'格 · '+speed+'倍速';}
 function clockRepairPreview(){
  if(!active)open();edit();
  const clock=E.place('clockshop',{x:-1,y:0}),repair=E.place('repair_turret',{x:1,y:0});
  const hazard=tiles.find(t=>t.x===2&&t.y===0),wall=tiles.find(t=>t.x===1&&t.y===1);
  if(clock&&repair&&hazard&&wall&&!wall.electricFacility){hazard.trap={clock:0};wall.coverTile=true;wall.coverHp=coverMaximum(wall);E.syncWalls();}
  history=[];editor.refresh();update();message('钟表店10秒产出钟表；修理炮塔25秒拆除右侧地刺，附近墙体生命+2。点击开始测试。');
 }
 function rangedTowerPreview(){
  if(!active)open();edit();
  E.place('shotgun_tower',{x:-1,y:0});E.place('sniper_tower',{x:1,y:0});
  history=[];editor.refresh();update();message('左侧霰弹枪塔 · 右侧狙击塔。Blender赛博模型已接入，点击开始测试查看瞄准与开火。');
 }
 function leave(){if(!active)return;save();active=false;history=[];controls.hidden=true;document.getElementById('electric-panel')?.classList.remove('tile-lab');}
 init();setInterval(()=>{if(!active)return;controls.querySelector('[data-catalog]').hidden=!editor.editing;document.querySelector('#electric-panel [data-title]').textContent='地块试验场';if(editor.editing&&history.length&&++autosave%3===0)save();},500);
 return {open,leave,update,checkpoint,snapshot,restore,board,preset,save,clockRepairPreview,rangedTowerPreview,get active(){return active;},get speed(){return speed;},get god(){return god;}};
})();

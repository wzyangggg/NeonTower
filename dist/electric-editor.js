'use strict';
globalThis.ElectricEditor=(()=>{
 const E=ElectricTiles,floorDefs=E.floorDefs,barricadeDefs=E.barricadeDefs,isBarricade=kind=>Object.hasOwn(barricadeDefs,kind),defs={...E.defs,...floorDefs,...barricadeDefs,erase:{name:'拆除',cells:[[0,0]],desc:'拆除目标正面或负面设施，保留地板；多格设施整件拆除。'}},isFloor=kind=>Object.hasOwn(floorDefs,kind),ns='http://www.w3.org/2000/svg';
 for(const kind of [...Object.keys(E.defs),...Object.keys(floorDefs),...Object.keys(barricadeDefs)])Object.defineProperty(defs,kind,{enumerable:true,get:()=>E.profile(kind)});
 const colors={...Object.fromEntries(Object.entries(E.defs).map(([kind,def])=>[kind,def.rarityColor])),...Object.fromEntries(Object.keys(floorDefs).map(kind=>[kind,'#a8b7b5'])),...Object.fromEntries(Object.keys(barricadeDefs).map(kind=>[kind,'#a8b7b5'])),erase:'#a8b7b5'};
 let editing=false,selected=null,selectedKind=null,drag=null,bagGesture=null,hover=null,previousPause=false,preparing=false,preparedFloor=0,placedThisFloor=false;
 let cameraGesture=null;
 let mergeFeedback=null,threatUI=null,threatStamp='';
 // Intersect a world-ground ray with the visible viewport, using the current
 // camera matrix. The tail follows the screen edge while the arrow stays in 3D.
 function threatEdgeDistance(x,z,ox,oz,vr,cr){
  const m=renderer.vp,h=5,w=m[3]*x+m[7]*h+m[11]*z+m[15],dw=m[3]*ox+m[11]*oz;
  const bounds=[[0,2*(vr.left-cr.left)/cr.width-1],[0,2*(vr.right-cr.left)/cr.width-1],[1,1-2*(vr.top-cr.top)/cr.height],[1,1-2*(vr.bottom-cr.top)/cr.height]],hits=[];
  for(const [axis,bound] of bounds){
   const c=m[axis]*x+m[4+axis]*h+m[8+axis]*z+m[12+axis],d=m[axis]*ox+m[8+axis]*oz,den=d-bound*dw;
   if(Math.abs(den)<1e-9)continue;const t=(bound*w-c)/den;if(t<=0||w+dw*t<=0)continue;
   const p=renderer.screenPoint(x+ox*t,h,z+oz*t),sx=p.x+cr.left-vr.left,sy=p.y+cr.top-vr.top;
   if(sx>=-.1&&sx<=vr.width+.1&&sy>=-.1&&sy<=vr.height+.1)hits.push(t);
  }
  return hits.length?Math.min(...hits):100;
 }
 function drawThreatForecast(){
  if(!threatUI)return;threatUI.hidden=!preparing||ui.hidden;threatUI.style.display=threatUI.hidden?'none':'block';
  if(threatUI.hidden){threatStamp='';return;}
  const vr=$('viewport').getBoundingClientRect(),cr=canvas.getBoundingClientRect(),bottom=ui.getBoundingClientRect().top-vr.top-20,groups=new Map();
  for(const e of strongEnemyForecast()){const group=e.target?'bridge-'+e.side:e.side;if(!groups.has(group))groups.set(group,[]);groups.get(group).push(e);}
  let html='';
  for(const entries of groups.values()){
   const e=entries[0],target=e.target||{x:325,y:300},dx=e.x-target.x,dz=(e.y-target.y)*1.06,length=Math.hypot(dx,dz)||1,ox=dx/length,oz=dz/length;
   const edge=e.target?24:Math.max(...tiles.map(t=>{const c=bridgeCellCenter(t);return (c.x-target.x)*ox+(c.y-target.y)*1.06*oz;}))+TILE/2+10;
   const hx=target.x-325+ox*edge,hz=(target.y-300)*1.06+oz*edge,span=threatEdgeDistance(hx,hz,ox,oz,vr,cr),x=hx+ox*span,z=hz+oz*span;
   // Repeat a compact solid arrow in world units. The first
   // tile starts at the viewport edge; the last nose ends at the room boundary.
   const planeLength=Math.min(16,span),count=Math.max(1,Math.ceil((span-planeLength)/32)+1),stride=count>1?(span-planeLength)/(count-1):0,clock=performance.now()/1000;
   for(let i=0;i<count;i++){
    const offset=i*stride,px=x-ox*offset,pz=z-oz*offset,scale=planeLength/24,light=(.5+.5*Math.cos(TAU*(i/4-clock*.8)))**6;
    renderer.residentMesh('strong-entry:paper-plane',()=>{
     const r=renderer,tip=[24,0,0],left=[0,0,-9],notch=[5,0,0],right=[0,0,9];
     r.emissiveQuad(tip,left,notch,tip,'#ffd044');
     r.emissiveQuad(tip,notch,right,tip,'#ffd044');
    },[-ox*scale,0,oz*scale,px,0,1,0,5,-oz*scale,0,-ox*scale,pz],{white:light*.22});
    // A small warm glow travels over the solid arrows while preparation is paused.
    if(light>.25)for(const [u,v] of [[24,0],[0,-9],[0,9]])renderer.glow(px-ox*u*scale+oz*v*scale,5.4,pz-oz*u*scale-ox*v*scale,2.5*light,'#ffda62');
   }
   const point=renderer.screenPoint(x,5,z),sx=Math.max(20,Math.min(vr.width-20,point.x+cr.left-vr.left)),sy=Math.max(115,Math.min(bottom,point.y+cr.top-vr.top));
   html+=`<g class="strong-warning" data-side="${e.side}" aria-label="${entries.map(a=>STRONG_ENEMY_NAMES[a.type]).join('、')}来袭" transform="translate(${sx-15},${sy-15})"><rect width="30" height="30" rx="6"/><path class="strong-triangle" d="M15 6L25 24H5Z"/><path class="strong-exclamation" d="M15 12v5m0 4v.2"/></g>`;
  }
  const stamp=vr.width+','+vr.height+html;if(stamp!==threatStamp){threatUI.setAttribute('viewBox',`0 0 ${vr.width} ${vr.height}`);threatUI.innerHTML=html;threatStamp=stamp;}
 }
 let ui=null,overlay=null,bag=null,buffUI=null,dragCard=null,dragLink=null,stock=[],stockSerial=0,renderStamp='',bagStamp=null;
 const key=c=>c.x+','+c.y;
 const axial=c=>[c.x-(c.y-(c.y&1))/2,c.y];
 const offset=(c,[q,r])=>{const [aq,ar]=axial(c),y=ar+r;return {x:aq+q+(y-(y&1))/2,y};};
 const available=kind=>!(E.defs[kind]||floorDefs[kind]||barricadeDefs[kind])||E.enabled(kind);
 function refreshAvailability(){if(!ui)return;ui.querySelectorAll('[data-test-kind]').forEach(el=>el.hidden=!available(el.dataset.testKind));cancelDrag();stock=stock.filter(i=>available(i.kind));if(selected&&!available(selected.kind))selected=null;bagStamp=null;syncPanel();renderBag();renderOverlay();}
 function addStock(kind,level=1){if(!available(kind))return null;const item={id:++stockSerial,kind,level};stock.push(item);bagStamp=null;return item;}
 function refill(){for(const [kind,total]of Object.entries({...Object.fromEntries(Object.keys(E.fruits).map(kind=>[kind,2])),floor:8,floorLine:4,floorBend:4,floorTriangle:4,turbine:2,echo:2,shotgun_tower:2,sniper_tower:2,slow_field:2,electric_tower:2,shield_tower:2,healing_tower:2,missile_tower:2,tower:2,freeze_bomb:2,laser_bomb:2,missile_bomb:2,miner:2,irrigator:2,pulse:2,biogenerator:2,clockshop:2,repair_turret:2,...Object.fromEntries(Object.keys(barricadeDefs).map(kind=>[kind,3])),battery:3,erase:4}))if(available(kind))while(stock.filter(i=>i.kind===kind).length<total)addStock(kind);renderBag();}
 function catalog(kinds=Object.keys(defs),level=1){cancelDrag();stock=[];for(const kind of kinds)if(defs[kind]&&available(kind))addStock(kind,E.defs[kind]?level:1);selected=null;selectedKind=null;bagStamp=null;syncPanel();renderBag();renderOverlay();}
 function refresh(){cancelDrag();selected=null;selectedKind=null;renderStamp='';bagStamp=null;syncPanel();renderBag();renderOverlay();}
 function loadTestKind(kind){
  if(preparing||!editing||!testMode||!defs[kind]||!available(kind))return;
  cancelDrag();const added=[];for(let i=0;i<3;i++)added.push(addStock(kind));
  stock=[...added,...stock.filter(i=>!added.includes(i))];selected=null;selectedKind=kind;
  ui.querySelector('[data-lab-tools]').open=false;syncPanel();renderBag();bag.scrollLeft=0;ui.scrollTop=0;renderOverlay();
  status('已补充'+defs[kind].name+' ×3，拖到场地即可测试；可重复补充。');
 }
 const testHazards={trap:{name:'地刺',add:()=>addTrap()},saw:{name:'轮锯',add:()=>addSaw()},flywheel:{name:'飞轮',add:()=>addFlywheel()},machine:{name:'机枪炮台',add:()=>addTurret('machine')},laser:{name:'激光炮台',add:()=>addTurret('laser')}};
 function addTestHazard(kind){
  if(preparing||!editing||!testMode||!testHazards[kind])return;
  if((kind==='machine'||kind==='laser')&&turrets.filter(t=>!t.temporary).length>=4){status('永久炮台已达4台，请先拆除一台。');return;}
  if(!testHazards[kind].add()){status('没有空闲地板，请先扩建再添加目标。');return;}
  renderer.sceneKey=null;updateUI();loadTestKind('erase');status('已添加'+testHazards[kind].name+'，并补充拆除 ×3；拖到目标即可拆除。');
 }
 function reset(){resetCamera();mergeFeedback=null;globalThis.UIMotion?.clear();cancelDrag();preparing=false;preparedFloor=0;placedThisFloor=false;editing=false;selected=null;selectedKind=null;hover=null;stock=[];stockSerial=0;renderStamp='';bagStamp=null;if(ui)ui.hidden=true;if(overlay)overlay.setAttribute('hidden','');$('viewport').classList.remove('electric-editing');}
 function status(text){if(ui)ui.querySelector('[data-status]').textContent=text;}
 function pauseForEdit(){if(preparing){paused=true;$('viewport').classList.add('paused');syncMusic();}else if(!paused)togglePause();$('pause-panel').hidden=true;releaseJoy();Object.keys(keys).forEach(k=>keys[k]=false);}
 function open(){
  if(!ui)return;
  if(preparing){cancelDrag();preparing=false;preparedFloor=floor;placedThisFloor=false;editing=false;stock=[];bagStamp=null;}
  if(['menu','dead','won'].includes(state)){globalThis.reset();testMode=true;floor=1;startWave();}
  if(!editing)previousPause=paused;testMode=true;testResume=false;refill();$('equipment-test').hidden=true;editing=true;pauseForEdit();
  ui.hidden=false;overlay.removeAttribute('hidden');$('viewport').classList.add('electric-editing');
  status('点击“指定格子”补充想测的格子，拖放后点“开始测试”；可添加拆除目标。');syncPanel();renderBag();renderOverlay();
 }
 const promo=()=>!!globalThis.PromoMode?.active;
 function prepareFloor(){
  if(!ui||testMode&&!promo()||preparedFloor===floor)return false;
  if(preparing)return true;
  cancelDrag();selected=null;selectedKind=null;previousPause=false;preparing=true;pauseForEdit();editing=true;placedThisFloor=false;
  // Only offer shapes with a legal destination. Unchosen offers expire this floor.
  // Expansion shapes return to campaign choices alongside facilities.
  rollChoices();
  ui.hidden=false;overlay.removeAttribute('hidden');$('viewport').classList.add('electric-editing');
  $('status').textContent='地块三选一';$('wave').textContent='B'+String(floor).padStart(2,'0')+' / '+(promo()?'可连续摆放':'摆放一块后点击确定');
  status(promo()?'宣传拍摄：摆放后继续三选一，点“开始本关”进入战斗。':stock.length?'三选一放置或合成；可拖动已有建筑整理，同类同级拖到一起升级，最高3级。':'没有新设施可放，可整理已有建筑后开始本关。');syncPanel();renderBag();renderOverlay();return true;
 }
 function rollChoices(){
  stock=[];bagStamp=null;const pool=Object.keys(defs).filter(kind=>kind!=='energy'&&!E.isBomb(kind)).filter(available).filter(kind=>kind==='erase'?demolitionCells().length:isFloor(kind)?Array.from({length:grid.maxY-grid.minY+1},(_,i)=>i+grid.minY).some(y=>Array.from({length:grid.maxX-grid.minX+1},(_,i)=>i+grid.minX).some(x=>canExpand(kind,{x,y}))):tiles.some(t=>canPlace(kind,t))||E.defs[kind]&&E.list().some(f=>E.canMerge({kind,level:1},f)));
  while(stock.length<3&&pool.length){const index=Math.floor(Math.random()*pool.length);addStock(pool.splice(index,1)[0]);}
  // Crowded boards may have fewer than three distinct placeable shapes.
  const fallback=stock.find(item=>!isFloor(item.kind));
  while(fallback&&stock.length<3)addStock(fallback.kind);
 }
 function afterPlacement(){
  if(!promo()){syncPanel();renderBag();renderOverlay();status('已摆放完成，点击“确定 · 开始本关”进入战斗。');return;}
  placedThisFloor=false;rollChoices();syncPanel();renderBag();renderOverlay();
  status(stock.length?'已摆放，可以继续选择；点“开始本关”进入战斗。':'场地已满，可整理建筑或点“开始本关”。');
 }
 function finishPreparation(){
  if(mergeFeedback||!preparing||(!promo()&&!placedThisFloor&&stock.length))return;globalThis.UIMotion?.exit(ui);cancelDrag();stock=[];bagStamp=null;preparedFloor=floor;preparing=false;editing=false;selected=null;selectedKind=null;
  ui.hidden=true;overlay.setAttribute('hidden','');$('viewport').classList.remove('electric-editing');if(paused)togglePause();if(globalThis.RoomReady&&(!testMode||promo()))RoomReady.begin(startWave);else startWave();
 }
 function close(){if(preparing||mergeFeedback)return;globalThis.UIMotion?.exit(ui);cancelDrag();editing=false;if(ui)ui.hidden=true;if(overlay)overlay.setAttribute('hidden','');$('viewport').classList.remove('electric-editing');if(!previousPause&&paused&&!document.hidden&&renderer.ready&&!renderer.gl.isContextLost()&&['combat','survival','descent','landing','bossIntro'].includes(state))togglePause();}
 function run(){if(mergeFeedback)return;if(preparing){finishPreparation();return;}cancelDrag();if(editing){editing=false;overlay.setAttribute('hidden','');$('viewport').classList.remove('electric-editing');if(paused)togglePause();status('测试运行中；点击“整理背包”继续摆放。');}else{editing=true;pauseForEdit();overlay.removeAttribute('hidden');$('viewport').classList.add('electric-editing');status('拖动背包或地板上的设施。绿色是可放位置，红色表示冲突。');}syncPanel();renderOverlay();}
 function syncPanel(){
  if(!ui)return;ui.classList.toggle('electric-choice',preparing);ui.setAttribute('aria-label',preparing?'本关地块三选一':'电力设施背包');bag.setAttribute('aria-label',preparing?'三选一，向上拖动摆放':'左右滑动浏览设施，向上拖到地板');ui.querySelector('[data-run]').hidden=false;ui.querySelector('[data-run]').disabled=!!mergeFeedback||preparing&&!promo()&&!placedThisFloor&&stock.length>0;ui.querySelector('[data-edit]').hidden=!editing;ui.querySelector('[data-run]').textContent=preparing?'确定 · 开始本关':editing?'开始测试':'整理背包';ui.querySelector('[data-title]').textContent=preparing?'修改地形！':'地块测试';ui.querySelector('[data-close]').hidden=preparing;ui.querySelector('[data-lab-entry]').hidden=!preparing||!globalThis.DEV_TOOLS;ui.querySelectorAll('[data-debug]').forEach(el=>el.hidden=preparing);
  ui.querySelector('[data-return]').disabled=!selected;const kind=selected?.kind||selectedKind;
  ui.querySelector('[data-info]').textContent=kind?defs[kind].name+(E.defs[kind]?'：Lv'+E.towerLevel(selected||stock.find(i=>i.kind===kind)||{}):'')+' · '+defs[kind].desc:preparing?'拖动空白处或空地板移动镜头；已有建筑可移动，同类同级可合成，最高3级。':'拖动空白处或空地板移动镜头；拖动设施摆放，点“镜头归位”回到角色。';

  ui.querySelector('[data-live]').textContent='';
 }
 function corners(c){const at=E.center(c),rad=HexMap.RADIUS-1,cr=canvas.getBoundingClientRect(),vr=$('viewport').getBoundingClientRect();return Array.from({length:6},(_,i)=>{const a=Math.PI/6+i*TAU/6,p=renderer.screenPoint(at.x-325+Math.cos(a)*rad,4,(at.y-300+Math.sin(a)*rad)*1.06);return [p.x+cr.left-vr.left,p.y+cr.top-vr.top];});}
 const polygon=c=>corners(c).map(p=>p.map(v=>v.toFixed(2)).join(',')).join(' ');

 function groundPoint(clientX,clientY,m=renderer.vp){
  const c=canvas.getBoundingClientRect();if(!c.width||!c.height)return null;
  const nx=2*(clientX-c.left)/c.width-1,ny=1-2*(clientY-c.top)/c.height,h=4;
  const a=m[0]-nx*m[3],b=m[8]-nx*m[11],d=m[1]-ny*m[3],e=m[9]-ny*m[11];
  const u=nx*(m[7]*h+m[15])-m[4]*h-m[12],w=ny*(m[7]*h+m[15])-m[5]*h-m[13],det=a*e-b*d;
  if(Math.abs(det)<1e-10)return null;
  const x=(u*e-b*w)/det,z=(a*w-u*d)/det;return Number.isFinite(x)&&Number.isFinite(z)?{x,z}:null;
 }
 function pick(clientX,clientY){
  const v=$('viewport').getBoundingClientRect();
  if(clientX<v.left||clientX>v.right||clientY<v.top||clientY>v.bottom)return null;
  const at=groundPoint(clientX,clientY);if(!at)return null;
  const cell=HexMap.cellAt(at.x+325,at.z/1.06+300);return {x:cell.x||0,y:cell.y||0};
 }
 function beginCameraDrag(e){
  if(!editing||drag||bagGesture||cameraGesture||e.isPrimary===false||e.button>0||!renderer.mapCamera)return;
  const point=groundPoint(e.clientX,e.clientY);if(!point)return;
  const camera=renderer.mapCamera;cameraGesture={id:e.pointerId,point,matrix:new Float32Array(renderer.vp),x:camera.panX,z:camera.panZ};
  overlay.setPointerCapture?.(e.pointerId);
 }
 function resetCamera(){
  if(renderer.mapCamera){renderer.mapCamera.panX=0;renderer.mapCamera.panZ=0;}
 }

 function hitBag(x,y){if(!bag)return false;const r=bag.getBoundingClientRect();return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;}
 function shape(kind,anchor){if(kind==='erase'){const target=demolitionTarget(anchor);return {cells:target?target.cells.map(c=>({...c})):[{...anchor}],outputs:[]};}return isFloor(kind)||isBarricade(kind)?{cells:defs[kind].cells.map(c=>offset(anchor,c)),outputs:[]}:E.shape(kind,anchor);}
 const tileFixtures=['trap','saw','flywheel','medical','shieldTile','cashTile','shockTile','coverTile'];
 function demolitionTargets(){
  const targets=E.list().filter(f=>!f.initialCore&&f.cells.every(c=>!terrainHidden(tiles.find(t=>key(t)===key(c))))).map(f=>({facility:f,cells:f.cells}));
  const groups=new Set();
  for(const tile of tiles){
   if(tile.coverTile&&tile.barricadeGroup){const group=tile.barricadeGroup;if(!groups.has(group)&&group.cells.every(c=>!terrainHidden(tiles.find(t=>key(t)===key(c))))){groups.add(group);targets.push({barricade:group,cells:group.cells});}continue;}
   if(terrainHidden(tile)||!tileFixtures.some(field=>tile[field]))continue;
   const cells=[{x:tile.x,y:tile.y}];
   const at=tile.flywheel||(tile.saw?sawPosition(tile):null);
   if(at)cells.push(HexMap.cellAt(at.x,at.y));
   targets.push({tile,cells});
  }
  for(const turret of turrets)if(!turret.temporary&&!terrainHidden(turret))targets.push({turret,cells:[HexMap.cellAt(turret.x,turret.y)]});
  return targets;
 }
 function demolitionCells(){return [...new Map(demolitionTargets().flatMap(t=>t.cells).map(c=>[key(c),c])).values()];}
 function demolitionTarget(c){const targets=demolitionTargets();return targets.find(t=>t.turret&&t.cells.some(at=>key(at)===key(c)))||targets.find(t=>t.facility?.cells.some(at=>key(at)===key(c))||t.tile&&key(t.tile)===key(c))||targets.find(t=>t.cells.some(at=>key(at)===key(c)));}
 function demolish(c){
  const target=demolitionTarget(c);if(!target)return false;
  if(target.facility){E.remove(target.facility);if(selected===target.facility)selected=null;}
  else if(target.turret)turrets=turrets.filter(t=>t!==target.turret);
  else if(target.barricade){for(const tile of tiles)if(tile.barricadeGroup===target.barricade)for(const field of ['coverTile','coverHp','coverHitAt','barricadeGroup','terrainRebuilt','terrainRebuildLeft','terrainRepairWait','terrainRepairCharge','repairWallBonus'])delete tile[field];}
  else for(const field of [...tileFixtures,'orbitSaw','sawClock','healProgress','healFlash','medPack','supplyQueue','supplyPickupLeft','pickup','shockCharges','shockCapacity','shockCooldown','shockOccupied','coverHp','coverHitAt','shovelBonusWork','shovelImpactLeft','shovelSwing','terrainRepairWait','terrainRepairCharge','terrainShardLeft','repairWallBonus'])delete target.tile[field];
  const at=E.center(c);burst(at.x,at.y,'#c8f2dc',15);renderer.sceneKey=null;updateUI();return true;
 }
 function canPlace(kind,c,ignore=null){
  if(isBarricade(kind)){
   const cells=shape(kind,c).cells;
   if(!available(kind)||!cells.every(cell=>E.free(tiles.find(t=>key(t)===key(cell)),ignore)))return false;
   // The complete new footprint must leave somewhere safe to stand or relocate.
   return tiles.some(t=>{const at=E.center(t);return canWalkAt(at.x,at.y,7)&&!cells.some(cell=>coverContains(cell,at.x,at.y,7));});
  }
  return isFloor(kind)?canExpand(kind,c):kind==='erase'?!!demolitionTarget(c):E.canPlace(kind,c,ignore);
 }
 function placeBarricade(kind,c){
  if(!isBarricade(kind)||!canPlace(kind,c))return false;
  const group={kind,anchor:{...c},cells:shape(kind,c).cells};
  for(const cell of group.cells){const tile=tiles.find(t=>key(t)===key(cell));tile.coverTile=true;tile.coverHp=coverMaximum();tile.coverHitAt=-Infinity;tile.barricadeGroup=group;}
  E.syncWalls();relocatePlayerFromCover();renderer.sceneKey=null;updateUI();return true;
 }
 function canExpand(kind,anchor){if(!available(kind))return false;const cells=shape(kind,anchor).cells;return cells.every(c=>c.x>=grid.minX&&c.x<=grid.maxX&&c.y>=grid.minY&&c.y<=grid.maxY&&!hasTile(c.x,c.y))&&cells.some(c=>HexMap.neighbors(c.x,c.y).some(([dx,dy])=>hasTile(c.x+dx,c.y+dy)));}
 function frontier(kind){const cells=[];for(let y=grid.minY;y<=grid.maxY;y++)for(let x=grid.minX;x<=grid.maxX;x++){const c={x,y};if(canExpand(kind,c))cells.push(c);}return cells;}
 // Hints show every cell covered by a legal placement, rather than only its anchor.
 function floorCoverage(kind){return [...new Map(frontier(kind).flatMap(anchor=>shape(kind,anchor).cells).map(c=>[key(c),c])).values()];}
 function expansionTile(cell){
  const t={...cell,healProgress:0,healFlash:0,medPack:false};if(typeof bridgeRoom!=='undefined'&&bridgeRoom?.cells.some(c=>c.x===cell.x&&c.y===cell.y))return t;const roll=Math.random();
  if(roll<.05){t.coverTile=true;t.coverHp=coverMaximum();}
  else if(roll<.10)t.trap={clock:Math.random()*1.5};
  else if(roll<.125){t.saw=true;t.orbitSaw=false;t.sawClock=0;}
  else if(roll<.135){t.saw=true;t.orbitSaw=true;t.sawClock=0;}
  else if(roll<.16)createFlywheel(t);
  return t;
 }
 function expand(kind,c){if(!canExpand(kind,c))return false;for(const cell of shape(kind,c).cells)tiles.push(expansionTile(cell));syncBridgeRoom();E.syncWalls();relocatePlayerFromCover();renderer.sceneKey=null;updateUI();return true;}
 function mergeTarget(){if(!drag?.dropCell||!E.defs[drag.kind])return null;const target=tiles.find(t=>key(t)===key(drag.dropCell))?.electricFacility;return E.canMerge(drag.facility||drag.item,target)?target:null;}
 function previewState(){const merge=mergeTarget(),candidate=merge?{cells:merge.cells,outputs:merge.outputs}:drag&&hover?shape(drag.kind,hover):null;return {candidate,merge,valid:!!merge||!!candidate&&canPlace(drag.kind,hover,drag.facility),source:candidate||(!drag?selected:null),kind:candidate?drag.kind:selected?.kind};}
 function scopeLoops(source,kind){
  // Attack reach is independent of the saved support-area mask and radius.
  const attackRange=E.isDefenseTower(kind)?(E.attackRange?.(kind)??E.defs[kind]?.attackRange):undefined;
  if(E.isDefenseTower(kind)&&Number.isFinite(attackRange)&&attackRange>0){const at=E.facilityCenter(source);return [Array.from({length:193},(_,i)=>{const a=i*Math.PI*2/192;return [at.x+Math.cos(a)*attackRange,at.y+Math.sin(a)*attackRange];})];}
  if(source.scopeMode==='radius'){const at=E.facilityCenter(source);return [Array.from({length:97},(_,i)=>{const a=i*Math.PI*2/96;return [at.x+Math.cos(a)*(source.range??E.profile(kind).range),at.y+Math.sin(a)*(source.range??E.profile(kind).range)];})];}
  return source.outputs.map(c=>{const points=groundHex(c);return [...points,points[0]];});
 }
 function renderOverlay(){
  if(!overlay||!editing)return;const rect=$('viewport').getBoundingClientRect();overlay.setAttribute('viewBox',`0 0 ${rect.width} ${rect.height}`);
  // SVG handles picking and building labels; ground marks remain depth-tested WebGL.
  const {candidate,valid,source,kind,merge}=previewState(),cells=new Map([...tiles,...(isFloor(drag?.kind)?floorCoverage(drag.kind):drag?.kind==='erase'?demolitionCells():[])].map(c=>[key(c),c]));let html=[...cells.values()].map(t=>`<polygon data-x="${t.x}" data-y="${t.y}" points="${polygon(t)}" fill="transparent" stroke="none"/>`).join('');
  if(source)html+=`<g data-effect-cells="${source.outputs.length}" data-effect-range="${kind}" data-ground-renderer="webgl"/>`;
  if(source&&E.isDefenseTower(kind)&&Number.isFinite(E.defs[kind]?.attackRange))html+=`<g data-attack-range="${(E.attackRange?.(kind)??E.defs[kind].attackRange)}" data-attack-kind="${kind}" data-ground-renderer="webgl"/>`;
  if(candidate)html+=`<g data-placement-valid="${valid}" data-merge-level="${merge?E.towerLevel(merge)+1:0}" data-ground-renderer="webgl"/>`;
  // Include offers as partners, so full boards still advertise an available merge.
  const live=E.list(),partners=[...live,...stock],labelRects=[];
  for(const f of live){
   const at=E.center(E.coreCell(f)),p=renderer.screenPoint(at.x-325,4,(at.y-300)*1.06),cr=canvas.getBoundingClientRect();
   const labelWidth=Math.max(72,defs[f.kind].name.length*12+48),half=labelWidth/2;
   const x=Math.max(half+4,Math.min(rect.width-half-4,p.x+cr.left-rect.left)),baseY=Math.max(48,p.y+cr.top-rect.top-22),mergeable=partners.some(other=>other!==f&&other.kind===f.kind&&E.towerLevel(other)===E.towerLevel(f)&&E.canMerge(other,f));
   let y=baseY;
   for(let i=0;i<live.length*2+1;i++){
    const trial=baseY+(i%2?-1:1)*Math.ceil(i/2)*26;
    if(trial<48||trial>rect.height-24)continue;
    if(labelRects.every(b=>x+half+3<b.left||x-half-3>b.right||trial+14<b.top||trial-10>b.bottom)){y=trial;break;}
   }
   labelRects.push({left:x-half,right:x+half,top:y-10,bottom:y+14});
   if(y!==baseY)html+=`<path d="M${x.toFixed(2)} ${y.toFixed(2)}L${(p.x+cr.left-rect.left).toFixed(2)} ${(p.y+cr.top-rect.top).toFixed(2)}" stroke="#b2d4e088" fill="none" pointer-events="none"/>`;
   html+=`<g data-building-label="${f.id}" data-building-level="${E.towerLevel(f)}" pointer-events="none" transform="translate(${x.toFixed(2)} ${y.toFixed(2)})">${mergeFeedback?.target===f?mergeCelebration(mergeFeedback):''}<g transform="scale(${mergeFeedback?.target===f&&mergeFeedback.revealed&&!reducedMotion()?1+.55*Math.exp(-Math.max(0,mergeFeedback.age-.24)*7)*Math.sin(Math.min(1,(mergeFeedback.age-.24)/.42)*Math.PI):1})"><rect x="-${Math.max(36,defs[f.kind].name.length*6+24)}" y="-8" width="${Math.max(72,defs[f.kind].name.length*12+48)}" height="20" rx="4" fill="#0b1723dd"/><text text-anchor="middle" y="6" fill="#e5f3ff" font-size="11" font-weight="bold">${defs[f.kind].name.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}：Lv${mergeFeedback?.target===f&&!mergeFeedback.revealed?mergeFeedback.from:E.towerLevel(f)}</text></g>${mergeable&&drag?.kind===f.kind&&mergeFeedback?.target!==f?'<rect x="-30" y="-36" width="60" height="20" rx="5" fill="#443715" stroke="#ffd260"/><text text-anchor="middle" y="-22" fill="#ffe69b" font-size="12" font-weight="bold">可合成</text>':''}</g>`;
  }
  if(html!==renderStamp){overlay.innerHTML=html;renderStamp=html;}
 }
 function groundHex(c){const at=E.center(c),rad=HexMap.RADIUS-1;return Array.from({length:6},(_,i)=>{const a=Math.PI/6+i*TAU/6;return [at.x+Math.cos(a)*rad,at.y+Math.sin(a)*rad];});}
 const worldPoint=([x,y],height)=>[x-325,height,(y-300)*1.06];
 function groundLine(a,b,width,color,alpha,height=3.1){
  const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);if(len<1e-6||width<=0)return;const nx=-dy/len*width/2,ny=dx/len*width/2;
  renderer.transparentQuad(worldPoint([a[0]+nx,a[1]+ny],height),worldPoint([b[0]+nx,b[1]+ny],height),worldPoint([b[0]-nx,b[1]-ny],height),worldPoint([a[0]-nx,a[1]-ny],height),color,[alpha,alpha,alpha,alpha]);
 }
 function groundCell(c,color,alpha,stroke,width=1){
  const points=groundHex(c),at=E.center(c),center=worldPoint([at.x,at.y],2.9);
  for(let i=0;i<6;i++){renderer.transparentQuad(center,worldPoint(points[i],2.9),worldPoint(points[(i+1)%6],2.9),center,color,[alpha,alpha,alpha,alpha]);groundLine(points[i],points[(i+1)%6],width,stroke,.8);}
 }
 function drawGround(){
  const {candidate,valid,source,kind,merge}=previewState(),effect=new Set((source?.outputs||[]).map(key)),clock=performance.now()/1000;
  for(const t of tiles){const f=t.electricFacility;groundCell(t,f?colors[f.kind]:effect.has(key(t))?'#7fd2f0':'#649fd2',f ? .1 : effect.has(key(t)) ? .12 : .035,f===selected?'#ffffff':f?colors[f.kind]:'#83a4bd',f===selected?2.2:effect.has(key(t))?0:1);}
  if(isFloor(drag?.kind))for(const c of floorCoverage(drag.kind))groundCell(c,'#89bccf',.09,'#a3c7d4',1);
  if(drag?.kind==='erase')for(const c of demolitionCells())groundCell(c,'#ffbd92',.2,'#ffbd92',1.7);
  if(source)for(const loop of scopeLoops(source,kind)){
   let distance=0;for(let i=1;i<loop.length;i++){const a=loop[i-1],b=loop[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]),period=18,phase=0;
    for(let start=Math.floor((distance-phase)/period)*period+phase;start<distance+length;start+=period){const lo=Math.max(distance,start),hi=Math.min(distance+length,start+10);if(hi<=lo)continue;const at=d=>[a[0]+(b[0]-a[0])*(d-distance)/length,a[1]+(b[1]-a[1])*(d-distance)/length];groundLine(at(lo),at(hi),2,'#a4efff',1,3.4);}distance+=length;
   }
  }
  if(candidate){const alpha=.18+.47*(.5-.5*Math.cos(clock*TAU/.8));for(const c of candidate.cells)groundCell(c,merge?'#ffd260':valid?'#69efad':'#ff6876',alpha,merge?'#fff0a5':valid?'#a5f1ce':'#ff8b92',1.7);}
 }
 function symbol(kind,x,y,color,scale=1){
  return globalThis.MapIcons?.symbol(isBarricade(kind)?'barricade':kind,x,y,scale)||'';
 }
 function thumbnail(kind,level=1){
  const footprint=kind==='erase'?{cells:[{x:0,y:0}],outputs:[]}:shape(kind,{x:0,y:0}),color=colors[kind];
  // Bomb combat coverage is not a building support area, including legacy saved circles.
  const effectCells=E.isBomb(kind)?[]:footprint.outputs,own=footprint.cells.map(c=>groundHex(c)),influence=effectCells.map(c=>groundHex(c)),all=[...own,...influence].flat();
  const minX=Math.min(...all.map(p=>p[0]))-8,maxX=Math.max(...all.map(p=>p[0]))+8,minY=Math.min(...all.map(p=>p[1]))-8,maxY=Math.max(...all.map(p=>p[1]))+8;
  const core=E.isBomb(kind)?E.facilityCenter(footprint):E.center(E.defs[kind]?E.coreCell({...footprint,kind,anchor:{x:0,y:0}}):footprint.cells[0]);
  const tiles=own.map(points=>`<polygon class="electric-stock-footprint" points="${points.map(p=>p.join(',')).join(' ')}" fill="${color}" fill-opacity=".23" stroke="${color}" stroke-width="2"/>`).join('')+symbol(kind,core.x,core.y,color)+(E.defs[kind]?globalThis.MapIcons?.stars(level,core.x,core.y+21)||'':'');
  const range=influence.map((points,i)=>`<polygon class="electric-stock-range" data-effect-cell="${key(effectCells[i])}" points="${points.map(p=>p.join(',' )).join(' ')}"/>`).join('');
  const box=`${minX} ${minY} ${maxX-minX} ${maxY-minY}`;
  return `<svg viewBox="${box}" aria-hidden="true">${range}${tiles}</svg>`;
 }
 function renderBag(){
  // Consumed choices must disappear on release, even while the upgrade celebrates.
  if(!bag||mergeFeedback&&!(preparing&&placedThisFloor&&!stock.length))return;stock=stock.filter(i=>available(i.kind));const html=stock.map(item=>`<button type="button" class="electric-stock-card" style="border-color:${colors[item.kind]};--chip-accent:${colors[item.kind]}" data-rarity="${E.defs[item.kind]?.rarity||1}" data-stock-id="${item.id}" data-kind="${item.kind}" aria-label="拖动${defs[item.kind].name}">${thumbnail(item.kind,item.level)}<span>${defs[item.kind].name}${E.defs[item.kind]?'：Lv'+E.towerLevel(item):''}</span><small>${preparing?defs[item.kind].desc:shape(item.kind,{x:0,y:0}).cells.length+'格'+(item.kind==='tower'?' · 最多电击'+E.towerTargetLimit(item)+'个':'')}</small></button>`).join('');
  if(html!==bagStamp){const scroll=bag.scrollLeft;bag.innerHTML=html;bag.scrollLeft=scroll;bagStamp=html;}ui.querySelector('[data-count]').textContent=globalThis.TileLab?.active?'无限取用':preparing?(promo()?'宣传模式 · 连续摆放':placedThisFloor?'已摆放 1 / 1':'本关限选 1 块'):stock.length+' 件';
 }
 const reducedMotion=()=>globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 function moveChoiceCard(){
  if(!drag?.item)return;
  if(!dragCard){
   const el=bag.querySelector(`[data-stock-id="${drag.item.id}"]`);if(!el)return;
   el.getAnimations().forEach(a=>a.cancel());const style=el.getAttribute('style');el.style.animation='none';
   dragCard={el,style};el.classList.add('is-dragging');el.style.zIndex='10';el.style.pointerEvents='none';el.style.transformOrigin='50% 50%';
   el.style.translate='0px -10px';el.style.scale=reducedMotion()?'1':'1.025';
   if(!reducedMotion()&&el.animate)el.animate([{translate:'0px 0px',scale:'1'},{translate:'0px -10px',scale:'1.025'}],{duration:150,easing:'ease-out'});
  }
  const valid=hover?previewState().valid:null,d=dragCard;d.el.dataset.dragValidity=valid===null?'none':valid?'valid':'invalid';
  d.el.style.filter='drop-shadow(0 6px 6px #0009)'+(valid===null?'':valid?' drop-shadow(0 0 3px #69efad77)':' drop-shadow(0 0 3px #ff687666)');
  updateChoiceLink();
 }
 function updateChoiceLink(){
  if(!dragLink)return;
  if(!dragCard||!drag||!hover){dragLink.setAttribute('hidden','');return;}
  const {candidate,merge,valid}=previewState();if(!candidate)return;
  const core=merge?E.coreCell(merge):E.defs[drag.kind]?E.coreCell({...candidate,kind:drag.kind,anchor:hover}):hover,at=E.center(core),end=renderer.screenPoint(at.x-325,4,(at.y-300)*1.06),cr=canvas.getBoundingClientRect(),vr=$('viewport').getBoundingClientRect(),card=dragCard.el.getBoundingClientRect();
  const x1=card.left+card.width/2-vr.left,y1=card.top-vr.top,x2=end.x+cr.left-vr.left,y2=end.y+cr.top-vr.top,color=valid?'#a5f1ce':'#ff8b92';
  dragLink.setAttribute('viewBox',`0 0 ${vr.width} ${vr.height}`);dragLink.removeAttribute('hidden');
  dragLink.innerHTML=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#10202f" stroke-width="4"/><line data-placement-link x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.6"/><circle cx="${x2}" cy="${y2}" r="4" fill="${color}"/>`;
 }
 function beginDrag(e,item,facility,grabCell){
  if(facility?.initialCore||mergeFeedback||!editing||drag||e.isPrimary===false||e.button>0||preparing&&(!facility&&(placedThisFloor||!stock.includes(item))))return;e.preventDefault();e.stopPropagation();
  const kind=item?.kind||facility.kind,anchor=facility?.anchor||{x:0,y:0},core=E.defs[kind]?E.coreCell(facility||{...E.shape(kind,anchor),kind,anchor}):grabCell||anchor,[q,r]=axial(core),[aq,ar]=axial(anchor);
  drag={id:e.pointerId,kind,item,facility,grab:[q-aq,r-ar],startX:e.clientX,startY:e.clientY,moved:false};selected=facility||null;selectedKind=kind;hover=null;
  ui.setPointerCapture?.(e.pointerId);syncPanel();renderOverlay();moveChoiceCard(e);
 }
 function moveDrag(e){
  if(cameraGesture?.id===e.pointerId){
   e.preventDefault();const g=cameraGesture,at=groundPoint(e.clientX,e.clientY,g.matrix),camera=renderer.mapCamera;
   if(at&&camera){camera.panX=g.x+g.point.x-at.x;camera.panZ=g.z+g.point.z-at.z;}return;
  }
  if(bagGesture?.id===e.pointerId){
   e.preventDefault();const g=bagGesture,dx=e.clientX-g.x,dy=e.clientY-g.y;
   // Choices have no horizontal scrolling. A diagonal start must still place;
   // only a backpack with actual overflow can claim a horizontal gesture.
   if(!g.mode&&Math.hypot(dx,dy)>7)g.mode=!preparing&&bag.scrollWidth>bag.clientWidth&&Math.abs(dx)>Math.abs(dy)?'scroll':'place';
   if(g.mode==='scroll'){bag.scrollLeft=g.scroll-dx;return;}
   if(g.mode==='place'){bagGesture=null;beginDrag(g.event,g.item,null,{x:0,y:0});}else return;
  }
  if(!drag||drag.id!==e.pointerId)return;e.preventDefault();
  if(Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>5)drag.moved=true;
  const c=hitBag(e.clientX,e.clientY)?null:pick(e.clientX,e.clientY);drag.dropCell=c;hover=c?offset(c,[-drag.grab[0],-drag.grab[1]]):null;
  const target=mergeTarget();if(target)status('松手合成'+(E.towerLevel(target)+1)+'级'+defs[target.kind].name+'。');else if(E.defs[drag.kind])status('拖到空位移动或放置；拖到同类同级建筑上合成，最高3级。');
  renderOverlay();moveChoiceCard(e);
 }
 // Keep the placement camera and stars visible until the upgrade has been celebrated.
 function mergeBuilding(source,target){
  const from=E.towerLevel(target),result=E.merge(source,target);if(!result)return false;
  mergeFeedback={target,from,to:E.towerLevel(target),room:floor,age:0,last:performance.now(),revealed:false,duration:1.25};
  tilePlacementSound();return result;
 }
 function advanceMergeFeedback(){
  if(!mergeFeedback)return;
  const f=mergeFeedback,now=performance.now();
  if(!document.hidden)f.age+=Math.min(.05,Math.max(0,(now-f.last)/1000));f.last=now;
  if(f.age>=.24&&!f.revealed){f.revealed=true;beep(990,.13,'triangle',.045);}
  if(f.room!==floor||!E.list().includes(f.target)||f.age>=f.duration){mergeFeedback=null;renderStamp='';if(preparing&&placedThisFloor)afterPlacement();else{syncPanel();renderBag();}}
 }
 function mergeCelebration(f){
  const u=Math.max(0,Math.min(1,(f.age-.24)/.75)),alpha=Math.sin(Math.PI*u),motion=!reducedMotion();
  let html=`<g data-merge-celebration="${f.to}" data-merge-from="${f.from}" data-merge-age="${f.age.toFixed(3)}" pointer-events="none">`;
  if(f.age>=.24){
   if(motion){html+=`<circle r="${(14+u*39).toFixed(2)}" fill="none" stroke="#fff1a0" stroke-width="${(3*(1-u)).toFixed(2)}" opacity="${alpha.toFixed(3)}" style="filter:drop-shadow(0 0 4px #ffb52b)"/>`;
    for(let i=0;i<14;i++){const a=i*Math.PI*2/14,dist=18+u*(27+i%3*9),x=Math.cos(a)*dist,y=Math.sin(a)*dist-u*u*12;html+=`<path d="M ${x-3} ${y} h 6 M ${x} ${y-3} v 6" fill="none" stroke="${i%2?'#73faff':'#ffe978'}" stroke-width="1.8" opacity="${alpha.toFixed(3)}"/>`;}
   }
   html+=`<text text-anchor="middle" y="${(-35-(motion?u*8:0)).toFixed(2)}" fill="#fff7b9" font-size="15" font-weight="900" style="filter:drop-shadow(0 0 4px #ffb52b)">升星成功！</text>`;
  }
  return html+'</g>';
 }
 function returnToBag(f){if(mergeFeedback)return false;if(globalThis.TileLab?.active&&f){E.remove(f);selected=null;return true;}if(preparing||!f||!E.list().includes(f))return false;const item=addStock(f.kind,E.towerLevel(f));if(!item){status('背包已满，先放出一些设施再收回。');return false;}E.remove(f);selected=null;status('已收回'+defs[f.kind].name+'。');return true;}
 function releaseDrag(e){
  if(cameraGesture?.id===e.pointerId){moveDrag(e);const id=cameraGesture.id;cameraGesture=null;if(overlay.hasPointerCapture?.(id))overlay.releasePointerCapture(id);return;}
  if(bagGesture?.id===e.pointerId){const g=bagGesture;if(!g.mode){selected=null;selectedKind=g.item.kind;syncPanel();}cancelDrag();return;}
  if(!drag||drag.id!==e.pointerId)return;moveDrag(e);const d=drag;
  if(d.moved){
   globalThis.TileLab?.checkpoint();
   if(hitBag(e.clientX,e.clientY)&&d.facility)returnToBag(d.facility);
   else if(hover){
    const target=mergeTarget();
    if(d.facility){if(target&&mergeBuilding(d.facility,target)){selected=target;status('已合成'+E.towerLevel(target)+'级'+defs[target.kind].name+'。');}else if(E.move(d.facility,hover)){tilePlacementSound();status('已移动'+defs[d.kind].name+'。');}else status('这里放不下，设施已留在原位。');}
    else {const f=target?mergeBuilding(d.item,target):isFloor(d.kind)?expand(d.kind,hover):d.kind==='erase'?demolish(hover):isBarricade(d.kind)?placeBarricade(d.kind,hover):E.place(d.kind,hover,d.item.level||1);if(f){if(!target)tilePlacementSound();if(preparing){if(d.kind!=='erase')globalThis.RoomReady?.recordPlacement(target?[]:shape(d.kind,hover).cells,isFloor(d.kind)?'floor':'smoke');placedThisFloor=true;stock=[];selected=null;selectedKind=null;}else{if(!globalThis.TileLab?.active)stock=stock.filter(i=>i!==d.item);selected=isFloor(d.kind)||d.kind==='erase'||isBarricade(d.kind)?null:f;}bagStamp=null;status((target?'已合成'+E.towerLevel(target)+'级'+defs[target.kind].name:d.kind==='erase'?'已拆除目标设施':'已放置'+defs[d.kind].name)+(preparing?'，点击确定后开始本关。':'。'));}else status(d.kind==='erase'?'这里没有可拆除的设施，请重新选择。':preparing?'这里放不下，请重新选择落点。':'这里放不下，设施已放回背包。');}
   }else status(preparing?'已取消，本关仍可选择并摆放一次。':d.facility?'设施已留在原位。':'设施已放回背包。');
  }
  cancelDrag(preparing&&placedThisFloor);if(preparing&&placedThisFloor&&!mergeFeedback){afterPlacement();return;}syncPanel();renderBag();renderOverlay();
 }
 function cancelDrag(consumed=false){
  if(cameraGesture){const id=cameraGesture.id;cameraGesture=null;if(overlay?.hasPointerCapture?.(id))overlay.releasePointerCapture(id);}
  if(dragLink){dragLink.setAttribute('hidden','');dragLink.innerHTML='';}
  if(dragCard){
   const {el,style}=dragCard,from=getComputedStyle(el),pose={translate:from.translate,rotate:from.rotate,scale:from.scale};
   el.getAnimations().forEach(a=>a.cancel());el.classList.remove('is-dragging');delete el.dataset.dragValidity;
   if(style===null)el.removeAttribute('style');else el.setAttribute('style',style);el.style.animation='none';
   if(consumed)el.style.visibility='hidden';
   else if(!reducedMotion()&&el.animate)el.animate([pose,{translate:'0px 0px',rotate:'0deg',scale:'.97',offset:.78},{translate:'0px 0px',rotate:'0deg',scale:'1'}],{duration:220,easing:'cubic-bezier(.16,.8,.25,1)'});
   dragCard=null;
  }
  const id=drag?.id??bagGesture?.id;drag=null;bagGesture=null;if(id!==undefined&&ui?.hasPointerCapture?.(id))try{ui.releasePointerCapture(id);}catch{}hover=null;renderStamp='';
 }
 function draw(){
  if(threatUI&&(!preparing||!ui||ui.hidden)){threatUI.hidden=true;threatUI.style.display='none';threatStamp='';}
  if(buffUI){const b=E.buffs;buffUI.textContent=[b.clocks?'钟表 ×'+b.clocks+' · 全图生产+'+Math.round(b.production*100)+'%':'',b.speed>0?'移速+'+Math.round(b.speed*100)+'%':'',b.attack>0?'攻速+'+Math.round(b.attack*100)+'%':''].filter(Boolean).join('  |  ')+(b.speed||b.attack?' · 本层累计':'');buffUI.hidden=!buffUI.textContent;}
  if(!ui||ui.hidden)return;advanceMergeFeedback();if(ui.hidden)return;drawThreatForecast();updateChoiceLink();if(selected&&!E.list().includes(selected)){selected=null;syncPanel();}
  if(selected?.kind==='shield_tower'){const f=selected;ui.querySelector('[data-live]').textContent=E.towerLevel(f)+'级 · 无敌'+(1+E.towerLevel(f))+'秒 · 已拾取 '+f.collected+' · '+(f.products?'待拾取护盾 · 生产暂停':'下次生产 '+f.cool.toFixed(1)+'秒');if(editing){renderOverlay();drawGround();}return;}
  if(selected?.kind==='clockshop'){const f=selected;ui.querySelector('[data-live]').textContent='钟表 · 已拾取 '+f.collected+' · '+(f.products?'待拾取 '+f.products+' 个 · 生产暂停':'下次 '+f.cool.toFixed(1)+'秒');if(editing){renderOverlay();drawGround();}return;}
  if(selected&&E.isDefenseTower(selected.kind)){const f=selected;ui.querySelector('[data-live]').textContent=E.towerLevel(f)+'级 · '+(f.kind==='slow_field'?'持续减速 '+Math.round((.2+.1*E.towerLevel(f))*100)+'%':f.kind==='shield_tower'?'已护盾 '+f.count+' 次':f.kind==='healing_tower'?'已治疗 '+f.count+' 次':'已攻击 '+f.attacks+' 次')+' · '+(f.kind==='slow_field'?'领域持续生效':f.cool>0?'冷却 '+f.cool.toFixed(1)+' 秒':'就绪，等待目标');if(editing){renderOverlay();drawGround();}return;}
  if(selected?.kind==='repair_turret'){const f=selected;ui.querySelector('[data-live]').textContent='已拆除 '+f.count+' 个危险源 · '+(f.workTarget?'施工剩余 '+f.cool.toFixed(1)+' 秒':'等待范围内危险源')+' · 墙体生命+2';if(editing){renderOverlay();drawGround();}return;}
  if(selected&&E.isFruit(selected.kind)){const f=selected;ui.querySelector('[data-live]').textContent=E.fruits[f.kind].fruit+' · 已拾取 '+f.collected+' · '+(f.products?'待拾取 '+f.products+' · 生产暂停':'下次 '+f.cool.toFixed(1)+'秒');if(editing){renderOverlay();drawGround();}return;}
  if(selected?.kind==='irrigator'){const f=selected;ui.querySelector('[data-live]').textContent='已灌溉 '+f.count+' 次 · 下次 '+f.cool.toFixed(1)+' 秒';if(editing){renderOverlay();drawGround();}return;}
  if(selected?.kind==='pulse'){const f=selected;ui.querySelector('[data-live]').textContent='已清屏 '+f.count+' 次 · '+(f.products?'待拾取 '+f.products+' 份 · 生产暂停':'下次 '+f.cool.toFixed(1)+' 秒');if(editing){renderOverlay();drawGround();}return;}
  if(selected?.kind==='biogenerator'){const f=selected;ui.querySelector('[data-live]').textContent='已供血 '+f.count+' 次 · 上次刷新 '+f.lastRefreshed+' 格 · 离开后再踩可触发';if(editing){renderOverlay();drawGround();}return;}
  if(selected){const f=selected;ui.querySelector('[data-live]').textContent=f.kind==='battery'?'开局加速剩余 '+f.cool.toFixed(1)+' 秒':f.kind==='turbine'?'已供电 '+f.count+' 次 · 下次 '+f.cool.toFixed(1)+' 秒':f.kind==='tower'?(E.towerLevel(f)+'级 · 伤害'+combatDisplayDamage(E.towerDamage(f))+' · 最多电击'+E.towerTargetLimit(f)+'个 · '+(f.products?'待拾取 '+f.products+' 个 · 生产暂停':'下次 '+f.cool.toFixed(1)+' 秒')):f.kind==='freeze_bomb'?(E.towerLevel(f)+'级 · 范围'+E.freezeStats(f).range+' · 冻结'+E.freezeStats(f).duration+'秒 · '+(f.products?'待拾取 · 生产暂停':'下次 '+f.cool.toFixed(1)+'秒')):f.kind==='laser_bomb'?(E.towerLevel(f)+'级 · '+E.laserStats(f).count+'道 · 宽'+E.laserStats(f).width+' · '+(f.products?'待拾取 · 生产暂停':'下次 '+f.cool.toFixed(1)+'秒')):f.kind==='missile_bomb'?(E.towerLevel(f)+'级 · 最多锁定'+E.missileStats(f).count+'个 · '+(f.products?'待拾取 · 生产暂停':'下次 '+f.cool.toFixed(1)+'秒')):f.kind==='miner'?'已拾取金币 '+f.earned+' · '+(f.products?'待拾取 '+f.products+' 金币 · 生产暂停':'下次 '+f.cool.toFixed(1)+' 秒'):'回响线圈 · 邻近生产格额外生产';}
  if(editing){renderOverlay();drawGround();}
 }
 function init(){
  if(!walkFloor.toString().includes('HexMap')||!document.createElement||!document.createElementNS||!$('viewport')?.append)return;
  const style=document.createElement('style');style.textContent=`.electric-open{position:absolute;right:10px;top:142px;z-index:31;padding:7px 10px;border:1px solid #668594;background:#142331dd;color:#d9f5ff;border-radius:7px;font-size:12px}.electric-panel{position:absolute;left:10px;right:10px;bottom:59px;z-index:46;background:#10202ff2;color:#e1f4ff;border:1px solid #55788b;border-radius:10px;padding:9px;font-size:12px;max-height:48%;overflow:auto}.electric-panel[hidden],.electric-panel [hidden],.electric-overlay[hidden]{display:none!important}.electric-panel header,.electric-panel .electric-actions{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.electric-panel header strong{margin-right:auto}.electric-panel header small{font-weight:400;color:#a6c7d8}.electric-panel button,.electric-panel summary{font:inherit;padding:6px 9px;min-height:32px;box-sizing:border-box;border:1px solid #587b8a;border-radius:5px;background:#243c4a;color:#e9f8ff}.electric-panel button:disabled{opacity:.4}.electric-panel [data-info]{margin:7px 0;color:#b9dce9}.electric-panel [data-live]{min-height:15px}.electric-panel [data-status]{min-height:30px;margin-top:5px;color:#c4f3b2;font-size:11px;line-height:1.45}.electric-overlay{position:absolute;inset:0;width:100%;height:100%;z-index:42;touch-action:none}.electric-backpack{display:flex;flex-wrap:nowrap;gap:8px;overflow-x:auto;overflow-y:hidden;overscroll-behavior-x:contain;scrollbar-width:thin;scrollbar-color:#79bfd5 #162c3b;touch-action:none;user-select:none;margin:9px 0;padding-bottom:8px}.electric-panel .electric-stock-card{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;flex:0 0 132px;min-width:132px;min-height:133px;padding:7px 5px;cursor:grab;touch-action:none;background:#1b3344}.electric-stock-card svg{width:100%;height:88px;pointer-events:none}.electric-stock-range{fill:none;stroke:#a4efff;stroke-width:2.5;stroke-dasharray:9 6}.electric-stock-card span{font-size:13px;white-space:nowrap;pointer-events:none}.electric-stock-card small{font-size:11px;color:#a9c4d4;pointer-events:none}.electric-panel details{position:relative}.electric-panel details>div{padding:7px 0;display:flex;gap:5px;flex-wrap:wrap}.electric-editing .joy,.electric-editing .test-open,.electric-editing .electric-open{visibility:hidden}@media(pointer:coarse){.electric-panel button,.electric-panel summary{min-height:40px}}`;
  style.textContent+=`.electric-choice .electric-backpack{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));overflow:hidden;gap:6px;padding-bottom:0}.electric-choice .electric-stock-card{min-width:0;width:100%;min-height:120px;padding:5px 2px}.electric-choice .electric-stock-card svg{height:76px}.electric-choice .electric-stock-card span{font-size:12px}.electric-choice [data-live],.electric-choice [data-count],.electric-choice .electric-actions{display:none}.electric-choice .electric-stock-card{justify-content:flex-start;gap:6px}.electric-choice .electric-stock-card small{line-height:1.5;text-align:left;align-self:stretch;padding:0 4px}.electric-choice [data-status]{min-height:0;margin-top:8px;color:#b9dce9}`;
  style.textContent+='.electric-lab-tools{margin-top:8px}.electric-panel .electric-lab-tools>div{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px}.electric-lab-tools p{grid-column:1/-1;margin:3px 0;color:#b9dce9;font-size:11px;line-height:1.5}.electric-lab-tools button{padding:5px 2px;min-width:0}.electric-lab-tools button[aria-pressed="true"]{border-color:#8ce1ed;background:#315665}';
  document.head.append(style);
  const threatStyle=document.createElement('style');threatStyle.textContent='.strong-enemy-forecast{position:absolute;inset:0;width:100%;height:100%;z-index:34;pointer-events:none;overflow:hidden}.strong-warning{filter:drop-shadow(0 0 3px #ffad72) drop-shadow(0 0 9px #ff793c)}.strong-warning rect{fill:#231b25;fill-opacity:.94;stroke:#f58765;stroke-width:1.2}.strong-triangle{fill:none;stroke:#ffae78;stroke-width:1.5;stroke-linejoin:round}.strong-exclamation{fill:none;stroke:#ffe5bc;stroke-width:2.2;stroke-linecap:round}';document.head.append(threatStyle);
  threatUI=document.createElementNS(ns,'svg');threatUI.classList.add('strong-enemy-forecast');threatUI.hidden=true;threatUI.style.display='none';threatUI.setAttribute('role','img');threatUI.setAttribute('aria-label','本关强敌及来袭方向，箭头指向场内');$('viewport').append(threatUI);
  buffUI=document.createElement('div');buffUI.id='fruit-buffs';buffUI.hidden=true;buffUI.style.cssText='position:absolute;left:12px;right:12px;top:176px;z-index:30;pointer-events:none;color:#f5dfa2;font-size:11px;line-height:1.6;text-shadow:0 1px 3px #000';$('viewport').append(buffUI);
  const button=document.createElement('button');button.id='electric-open';button.hidden=!globalThis.DEV_TOOLS;button.className='electric-open';button.textContent='地块测试';button.onclick=()=>globalThis.TileLab?.open();$('viewport').append(button);
  overlay=document.createElementNS(ns,'svg');overlay.id='electric-placement';overlay.classList.add('electric-overlay');overlay.setAttribute('hidden','');overlay.setAttribute('aria-label','拖动空白处移动镜头，拖动设施摆放');$('viewport').append(overlay);
  overlay.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(!editing||drag||bagGesture||cameraGesture||e.isPrimary===false||e.button>0)return;const hit=e.target.closest?.('polygon[data-x]'),c=hit?{x:Number(hit.dataset.x),y:Number(hit.dataset.y)}:null,f=c?tiles.find(t=>key(t)===key(c))?.electricFacility:null;if(f&&!f.initialCore)beginDrag(e,null,f,c);else{selected=null;selectedKind=null;syncPanel();renderOverlay();beginCameraDrag(e);}});
  overlay.addEventListener('lostpointercapture',e=>{if(cameraGesture?.id===e.pointerId)cameraGesture=null;});

  ui=document.createElement('section');ui.id='electric-panel';ui.className='electric-panel';ui.hidden=true;ui.setAttribute('aria-label','电力设施背包');
  ui.innerHTML='<header><strong><span data-title>设施背包</span> <small data-count></small></strong><button data-lab-entry hidden>测试格子</button><button data-camera-reset>镜头归位</button><button data-run>开始测试</button><button data-close>收起</button></header><div data-edit><div class="electric-backpack" id="electric-backpack" aria-label="左右滑动浏览设施，向上拖到地板" tabindex="0"></div><div class="electric-actions"><button data-expand data-debug>扩建6格</button><details data-debug><summary>更多</summary><div><button data-return>收回选中</button><button data-refill>补满背包</button><button data-room>重置充能</button><button data-targets>添加靶群</button></div></details><details><summary>说明</summary><div data-info></div></details></div></div><div data-live></div><div data-status role="status"></div>';
  const tools=document.createElement('details');tools.className='electric-lab-tools';tools.setAttribute('data-lab-tools','');tools.setAttribute('data-debug','');
  tools.innerHTML='<summary>指定格子 / 添加拆除目标</summary><div><p>点选即补充3份，并排到背包最前面。可重复补充、混合摆放。</p>'+Object.entries(defs).map(([kind,def])=>'<button data-test-kind="'+kind+'">'+def.name+'</button>').join('')+'<p>添加一个负面设施，同时补充拆除格。</p>'+Object.entries(testHazards).map(([kind,def])=>'<button data-test-hazard="'+kind+'">添加'+def.name+'</button>').join('')+'</div>';
  ui.querySelector('[data-edit]').prepend(tools);
  tools.addEventListener('click',e=>{const kind=e.target.closest('[data-test-kind]')?.dataset.testKind,hazard=e.target.closest('[data-test-hazard]')?.dataset.testHazard;if(kind)loadTestKind(kind);else if(hazard)addTestHazard(hazard);});
  $('viewport').append(ui);bag=ui.querySelector('#electric-backpack');
  dragLink=document.createElementNS(ns,'svg');dragLink.id='electric-drag-link';dragLink.setAttribute('hidden','');dragLink.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:48;pointer-events:none;overflow:visible';$('viewport').append(dragLink);
  bag.addEventListener('pointerdown',e=>{const hit=e.target.closest?.('[data-stock-id]');if(!hit||!editing||mergeFeedback||drag||bagGesture||e.isPrimary===false||e.button>0)return;const item=stock.find(i=>i.id===Number(hit.dataset.stockId));if(!item)return;e.preventDefault();e.stopPropagation();bagGesture={id:e.pointerId,item,event:e,x:e.clientX,y:e.clientY,scroll:bag.scrollLeft,mode:null};ui.setPointerCapture?.(e.pointerId);});
  bag.addEventListener('wheel',e=>{if(bag.scrollWidth<=bag.clientWidth)return;const delta=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;bag.scrollLeft+=delta;e.preventDefault();},{passive:false});
  document.addEventListener('pointermove',moveDrag,{passive:false});document.addEventListener('pointerup',releaseDrag);document.addEventListener('pointercancel',e=>{if((cameraGesture?.id??drag?.id??bagGesture?.id)===e.pointerId){cancelDrag();renderBag();renderOverlay();}});
  ui.addEventListener('lostpointercapture',e=>{if((drag?.id??bagGesture?.id)===e.pointerId){cancelDrag();renderBag();renderOverlay();}});
  ui.querySelector('[data-camera-reset]').onclick=resetCamera;
  ui.querySelector('[data-lab-entry]').onclick=open;ui.querySelector('[data-close]').onclick=close;ui.querySelector('[data-run]').onclick=run;
  ui.querySelector('[data-return]').onclick=()=>{returnToBag(selected);syncPanel();renderBag();renderOverlay();};
  ui.querySelector('[data-refill]').onclick=()=>{refill();status('已补充测试设施。');};
  ui.querySelector('[data-expand]').onclick=()=>{const before=new Set(tiles);addFloor(6);for(const t of tiles)if(!before.has(t))for(const k of ['medical','shieldTile','cashTile','shockTile','coverTile','trap','saw','flywheel'])delete t[k];renderer.sceneKey=null;updateUI();status('已扩建空白测试地板。');renderOverlay();};
  ui.querySelector('[data-targets]').onclick=()=>{for(let i=0;i<4;i++){spawn({type:'spitter',side:i%4});const e=enemies.at(-1);e.hp=e.max=120;e.fire=999;e.weaponLabTarget=true;}status('已添加4个高血量测试敌人。');};
  ui.querySelector('[data-room]').onclick=()=>{E.startRoom();status('已重置开局加速，涡轮重新启动。');};
  const extra=document.createElement('button');extra.textContent='指定格子测试';extra.onclick=open;$('equipment-test')?.querySelector('.test-content')?.append(extra);
  new ResizeObserver(()=>{bagStamp=null;renderBag();if(editing)renderOverlay();}).observe(ui);
 }
 init();refreshAvailability();
 return {open,close,reset,draw,prepareFloor,catalog,refresh,refreshAvailability,run,defs,isFloor,isBarricade,shape,canPlace,canExpand,frontier,floorCoverage,demolitionCells,get preparing(){return preparing;},get editing(){return editing;},get stock(){return stock.map(i=>({id:i.id,kind:i.kind,level:i.level}));}};
})();

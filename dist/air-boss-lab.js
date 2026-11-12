'use strict';

globalThis.AirBossLab=(()=>{
 const orange='#ff8a54',blue='#65ddff',warning='#ffd283';
 const craft={
  ember:{name:'烬翼',type:'moth',color:orange,hp:126,r:38,scale:1.72,y:164,moves:['chevron','curve','dive'],
   flight:t=>[86*Math.sin(t*.68),32*(1-Math.cos(t*.68))]},
  cobalt:{name:'钴隼',type:'fighter',color:blue,hp:148,r:42,scale:1.65,y:111,moves:['rocket','seeker','beam'],
   flight:(t,playerOffset)=>[Math.max(-38,Math.min(38,playerOffset*.24)),10*Math.sin(t*.7)]},
  prism:{name:'棱核',type:'spitter',color:'#b37cff',hp:142,r:40,scale:1.65,y:160,moves:['pulse','split','inward'],
   flight:t=>[14*Math.sin(t*.9),56*(1-Math.cos(t*.51))]},
  forge:{name:'熔炉',type:'eye',color:'#ffb151',hp:170,r:45,scale:1.66,y:151,moves:['wall','mines'],
   flight:t=>[12*Math.sin(t*.39),8*Math.sin(t*.62)]},
  mantis:{name:'螳刃',type:'skull',color:'#b4f46a',hp:132,r:40,scale:1.55,y:180,moves:['pincer','brake','cross'],
   flight:t=>[104*Math.sin(t*.72),43*Math.sin(t*1.44)]},
  wraith:{name:'幽镰',type:'spitter',color:'#ed81ef',hp:142,r:40,scale:1.55,y:172,moves:['spiral','orbit'],
   flight:t=>[56*Math.sin(t*.5),-49*(1-Math.cos(t*.5))]},
  needle:{name:'赤针',type:'moth',color:'#ff6469',hp:118,r:36,scale:1.7,y:140,moves:['homing','wave','lance'],
   flight:(t,playerOffset)=>[Math.max(-95,Math.min(95,playerOffset*.62)),21*Math.sin(t*.95)]},
 };
 const names={duo:'烬翼 × 钴隼',...Object.fromEntries(Object.entries(craft).map(([id,spec])=>[id,spec.name]))};
 const arsenal=BossMoveSettings.arsenal;
 const weaponIds=Object.keys(arsenal);
 const craftIds=Object.keys(craft);
 const selectedWeapons=Object.fromEntries(craftIds.map(id=>[id,new Set(craft[id].moves)]));
 const loadoutKey='air-boss-lab-loadout-v2';
 const dashPause=.23;
 const overlapWindow=.55,recoveryTime=1.1;
 const separatedMoves={pincer:'brake',brake:'pincer'},separationTime=.65;
 let mode,observing,panel,statusLabel,missileReticle,synchronized=true,legacy;
 let recoveryUntil=0,combinedAttack=false;
 const activeCraft=()=>mode==='duo'?['ember','cobalt']:[mode];
 const compatible=(weapon,id)=>!arsenal[weapon].craft||arsenal[weapon].craft===id;

 async function init(initial,combat){
  await BossMoveEditor.load();
  try{
   const saved=JSON.parse(localStorage.getItem(loadoutKey));
   legacy=JSON.parse(localStorage.getItem('air-boss-lab-loadout-v1'));
   if(typeof saved?.synchronized==='boolean')synchronized=saved.synchronized;
   for(const id of Object.keys(craft))if(Array.isArray(saved?.[id])){
    selectedWeapons[id]=new Set(weaponIds.filter(key=>compatible(key,id)&&saved[id].includes(key)));
   }
  }catch{}
  const style=document.createElement('link');
  style.rel='stylesheet';style.href='air-boss-lab.css';document.head.append(style);
  panel=document.createElement('section');
  panel.className='air-boss-controls';panel.setAttribute('aria-label','战机首领试飞');
  const fromRoomLab=new URLSearchParams(location.search).get('roomlabReturn')==='1';
  const back=fromRoomLab?'<a href="?roomlab=1">返回关卡试玩</a>':'<a href="?airboss=gallery">BOSS 阵列</a>';
  panel.innerHTML=`<div class="air-boss-caption"><b data-name></b><span data-attack></span>${back}</div>
   <p class="air-boss-moves" data-moves></p>
   <details class="air-boss-arsenal">
    <summary>武器库 · 调整招式</summary>
    <div class="air-boss-loadout"></div>
    <div class="air-boss-loadout-actions"><button type="button" data-preset>专属方案</button><button type="button" data-all>全选</button><button type="button" data-none>清空</button><button type="button" data-apply>应用并重开</button></div>
    <button type="button" data-legacy hidden>载入旧双机配置</button>
   </details>
   <div class="air-boss-buttons">
    <select aria-label="切换试飞战机">${[...craftIds,'duo'].map(id=>`<option value="${id}">${names[id]}</option>`).join('')}</select>
    <button type="button" data-mode></button>
    <button type="button" data-restart>重开</button>
   </div>`;
  statusLabel=panel.querySelector('[data-attack]');
  const viewport=$('viewport');
  viewport.classList.add('air-boss-scene');viewport.append(panel);
  missileReticle=document.createElement('span');
  missileReticle.className='air-boss-missile-reticle';missileReticle.hidden=true;
  missileReticle.setAttribute('aria-hidden','true');viewport.append(missileReticle);
  panel.addEventListener('pointerdown',event=>event.stopPropagation());
  panel.querySelector('.air-boss-buttons select').onchange=event=>start(event.target.value,observing);
  panel.querySelector('[data-mode]').onclick=()=>start(mode,!observing);
  panel.querySelector('[data-restart]').onclick=()=>start(mode,observing);
  const options=()=>panel.querySelectorAll('[data-weapon]');
  panel.querySelector('[data-preset]').onclick=()=>options().forEach(input=>input.checked=craft[input.dataset.aircraft].moves.includes(input.dataset.weapon));
  panel.querySelector('[data-all]').onclick=()=>options().forEach(input=>input.checked=true);
  panel.querySelector('[data-none]').onclick=()=>options().forEach(input=>input.checked=false);
  panel.querySelector('[data-legacy]').onclick=()=>{
   options().forEach(input=>{
    const weapons=legacy[input.dataset.aircraft];
    input.checked=Array.isArray(weapons)&&weapons.includes(input.dataset.weapon);
   });
   panel.querySelector('[data-sync]').checked=legacy.synchronized!==false;
  };
  panel.querySelector('[data-apply]').onclick=()=>{
   if(mode==='duo')synchronized=panel.querySelector('[data-sync]').checked;
   for(const input of options()){
    const weapons=selectedWeapons[input.dataset.aircraft];
    if(input.checked)weapons.add(input.dataset.weapon);else weapons.delete(input.dataset.weapon);
   }
   try{
    const loadouts=Object.fromEntries(craftIds.map(id=>[id,[...selectedWeapons[id]]]));
    localStorage.setItem(loadoutKey,JSON.stringify({synchronized,...loadouts}));
   }catch{}
   panel.querySelector('.air-boss-arsenal').open=false;
   start(mode,observing);
  };
  $('pause-home').onclick=()=>location.assign('./');
  BossMoveEditor.mount(panel,craft[initial]?.moves[0]??'chevron',refreshSpecs,triggerMove);
  canvas.addEventListener('click',event=>{
   if(!observing)return;
   const e=enemies[0];if(!e)return;
   const point=renderer.screenPoint(e.x-325,35,(e.y-300)*1.06),bounds=canvas.getBoundingClientRect();
   if(Math.hypot(event.clientX-bounds.left-point.x,event.clientY-bounds.top-point.y)<Math.max(35,e.r*renderer.pointScale))BossMoveEditor.show();
  });
  start(initial,!combat);
 }

 function moveSpec(id){
  return {id,kind:id,...arsenal[id],...BossMoveEditor.get(id)};
 }

 function castDuration(spec){
  if(spec.kind==='dash')return spec.windup+3;
  return spec.warn+(spec.kind==='beam'?spec.length:spec.interval*(spec.bursts-1));
 }

 function activeAttacks(){
  return enemies.flatMap(e=>e.aircraftBoss&&e.hp>0?e.weapons.flatMap(slot=>slot.attack?[slot.attack]:[]):[]);
 }

 function refreshSpecs(){
  for(const e of enemies){
   if(!e.aircraftBoss)continue;
   for(const slot of e.weapons){
    slot.spec=moveSpec(slot.spec.id);
    if(!observing&&!slot.attack&&slot.finishedAt!==undefined)slot.next=slot.finishedAt+slot.spec.period;
   }
  }
 }

 function triggerMove(id){
  if(!arsenal[id])return;
  if(!observing){start(mode,true);BossMoveEditor.show(id);}
  const e=enemies[0];
  if(!e||state!=='combat'||paused||moveBlocked(e,id))return;
  e.manualRounds??={};
  e.weaponTime??=0;
  const slot={spec:moveSpec(id),next:0,round:e.manualRounds[id]??0,attack:null};
  e.manualRounds[id]=slot.round+1;
  e.weapons=e.weapons.filter(weapon=>weapon.attack);
  e.weapons.push(slot);
  advanceWeapon(e,slot,0);
  hud();
  return true;
 }

 function moveBlocked(e,id){
  return e.weapons.some(({attack})=>attack&&(attack.id===id||attack.kind==='dash'||arsenal[id]?.kind==='dash'));
 }

 function renderLoadout(ids){
  const visible=weaponIds.filter(weapon=>ids.some(id=>compatible(weapon,id)));
  panel.querySelector('.air-boss-loadout').innerHTML=`${mode==='duo'?`<label><input type="checkbox" data-sync ${synchronized?'checked':''}> 自定义同招同步开火</label>`:''}
   <table><thead><tr><th scope="col">招式</th>${ids.map(id=>`<th scope="col">${names[id]}</th>`).join('')}</tr></thead><tbody>
   ${visible.map(weapon=>`<tr><th scope="row">${arsenal[weapon].name}</th>${ids.map(id=>`<td>${compatible(weapon,id)?
    `<input type="checkbox" data-weapon="${weapon}" data-aircraft="${id}" aria-label="${names[id]} · ${arsenal[weapon].name}" ${selectedWeapons[id].has(weapon)?'checked':''}>`:''}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  panel.querySelector('[data-legacy]').hidden=mode!=='duo'||!['ember','cobalt'].some(id=>Array.isArray(legacy?.[id]));
 }

 function start(selected,watch){
  mode=watch&&selected==='duo'?'ember':selected;observing=watch;
  recoveryUntil=0;combinedAttack=false;
  activeDifficulty=1;reset();testMode=true;floor=11;
  globalThis.TalentRuntime?.start({useLevels:false});
  globalThis.TowerResearch?.start(null);
  globalThis.Chips?.start(false);
  state='combat';phase=0;scroll=0;cleared=false;chaserSpawned=999;
  syncGrid();tiles=[];
  for(let y=grid.minY;y<=grid.maxY;y++){
   for(let x=grid.minX;x<=grid.maxX;x++)tiles.push({x,y});
  }
  p.x=325;p.y=437;p.hp=p.max=8;p.shield=0;p.inv=0;
  weapon=createWeaponModel('rifle_t2');shootTimer=.75;
  const aircraftIds=activeCraft();
  const equipped=weaponIds.filter(key=>aircraftIds.some(id=>selectedWeapons[id].has(key)));
  const openingTimes=new Map(equipped.map((key,index)=>[key,1+index*1.16]));
  if(openingTimes.has('rocket')&&openingTimes.has('seeker')){
   openingTimes.set('seeker',Math.max(.1,openingTimes.get('rocket')+BossMoveEditor.get('rocket').warn-BossMoveEditor.get('seeker').warn));
  }
  enemies=aircraftIds.map(id=>{
   const spec=craft[id],side=mode==='duo'?(id==='ember'?-1:1):0;
   const hp=mode==='duo'?Math.ceil(spec.hp*.75):spec.hp;
   const selected=selectedWeapons[id];
   const isPreset=selected.size===spec.moves.length&&spec.moves.every(key=>selected.has(key));
   const keys=observing?[]:isPreset?spec.moves:equipped.filter(key=>selected.has(key));
   const specs=keys.map(moveSpec);
   let opening=1.2+(side>0?2.3:0),pairEnds=opening;
   const weapons=specs.map((move,index)=>{
    if(index===1){
     const previous=specs[0];
     opening+=separatedMoves[move.id]===previous.id
      ?castDuration(previous)+separationTime
      :Math.max(.1,castDuration(previous)-move.warn-overlapWindow);
    }
    if(index>1)opening=pairEnds+recoveryTime;
    pairEnds=Math.max(pairEnds,opening+castDuration(move));
    const next=isPreset?opening:openingTimes.get(move.id)+(!synchronized&&id==='cobalt'?.78:0);
    return {spec:move,next,round:0,attack:null};
   });
   return {id,type:spec.type,x:325+side*116,y:spec.y,r:spec.r,hp,max:hp,
    aircraftBoss:true,vehicleModel:id,vehicleScale:spec.scale,seed:side>0?1.6:0,
    side,t:0,weapons,maneuver:null};
  });
  $('viewport').classList.remove('falling','landing','boss-intro','survival-intro');
  $('survival-clock').style.display='none';$('overlay').style.display='none';
  clearTimeout(toast.timer);$('toast').classList.remove('show');
  panel.querySelector('.air-boss-buttons select').value=mode;
  panel.querySelector('option[value="duo"]').disabled=observing;
  panel.querySelector('[data-name]').textContent=names[mode];
  panel.querySelector('[data-moves]').textContent=observing?'选择招式、调整参数，再点击「释放这招」':enemies.map(e=>e.weapons.map(slot=>slot.spec.name).join(' · ')||'空载').join(' / ');
  panel.querySelector('[data-moves]').hidden=!observing&&equipped.length>8;
  renderLoadout(aircraftIds);
  panel.querySelector('.air-boss-arsenal').hidden=observing;
  panel.querySelector('[data-mode]').textContent=observing?'连续挑战':'手动测试';
  panel.querySelector('[data-restart]').textContent=observing?'重置场景':'重开';
  if(observing)BossMoveEditor.show(craft[mode].moves[0]);
  $('zone').textContent='战机首领试飞';
  updateUI();hud();focusGameControls();syncMusic();
 }

 function fire(e,angle,speed,color,extra={}){
  bullets.push({x:e.x,y:e.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,
   life:Math.max(6.8,(extra.fuse??0)+.1),r:6,aircraftShot:true,angle,speed,color,age:0,...extra});
 }

 function fireTuned(a,e,angle,speed,color,extra={}){
  const base=BossMoveSettings.defaults[a.id].bulletSpeed;
  const scale=base?a.bulletSpeed/base:a.speedScale??1;
  fire(e,angle,speed*scale,color,{settings:a,...extra});
 }

 function muzzle(e,side,forward){
  const pose=enemyFlightPose(e,e.x-325,(e.y-300)*1.06,0,e.vehicleScale);
  return {x:325+pose[0]*side+pose[2]*forward+pose[3],y:300+(pose[8]*side+pose[10]*forward+pose[11])/1.06};
 }

 function playerAim(origin){return Math.atan2(p.y-origin.y,p.x-origin.x);}

 function pointNose(e,angle){
  const pitch=e.flightPose?.pitch??0,roll=e.flightPose?.roll??0;
  e.flightHeading=Math.atan2(Math.cos(angle),Math.sin(angle)*1.06)-Math.atan2(Math.sin(roll)*Math.sin(pitch),Math.cos(pitch));
 }

 function noseAngle(e){
  const pose=enemyFlightPose(e,e.x-325,(e.y-300)*1.06,0,e.vehicleScale);
  return Math.atan2(pose[10]/1.06,pose[2]);
 }

 function release(e,a){
  const aim=playerAim(e);
  const color=craft[e.id].color;
  if(a.kind!=='lance')a.aim=aim;
  if(a.kind==='curve'){
   for(const side of [-1,1]){
    for(let i=0;i<a.count;i++){
     const angle=Math.PI/2+side*(.29+i*a.spread+a.fired*.09);
     fireTuned(a,muzzle(e,side*21,5),angle,144+i*11,color,{motion:'curve',turn:-side*a.turn,kind:'rice'});
    }
   }
  }else if(a.kind==='split'){
   for(const spread of [-a.spread,0,a.spread])fireTuned(a,e,aim+spread,202,color,{motion:'seed',r:10});
  }else if(a.kind==='homing'){
   for(let i=0;i<a.count;i++){
    const offset=a.count===1?0:(2*i/(a.count-1)-1)*a.spread;
    fireTuned(a,e,aim+offset,159,color,{motion:'homing',turn:a.turn,track:a.track,r:7,kind:'needle'});
   }
  }else if(a.kind==='chevron'){
   const direction=noseAngle(e),dx=Math.cos(direction),dy=Math.sin(direction);
   for(let n=0;n<a.count;n++){
    const i=n-(a.count-1)/2,lead=47-Math.abs(i)*14,side=i*a.spacing;
    fireTuned(a,e,direction,187,color,{x:e.x+dx*lead-dy*side,y:e.y+dy*lead+dx*side,r:5.5,kind:'chevron'});
   }
  }else{
   specialSalvos[a.kind](e,a,color);
  }
  enemyShotSound(e.type);
 }

 const specialSalvos={
  rocket(e,a,color){
   for(const side of [-1,1])fireTuned(a,muzzle(e,side*18,19),a.aim+side*a.spread,207,color,{kind:'missile',aircraftMissile:true,fuse:a.fuse,blast:a.blast,r:8});
  },
  seeker(e,a,color){
   fireTuned(a,e,a.aim+(a.round%2?.66:-.66),178,color,{kind:'missile',aircraftMissile:true,motion:'homing',turn:a.turn,track:a.track,fuse:a.fuse,blast:a.blast,r:8});
  },
  fan(e,a,color){
   for(let i=0;i<a.count;i++)fireTuned(a,e,a.aim+(i-(a.count-1)/2)*a.spread+(a.fired%2?a.spread/2:0),186,color,{kind:'rice'});
  },
  gatling(e,a,color){
   const source=muzzle(e,0,24),aim=playerAim(source),cone=a.cone*Math.PI/180;
   for(let i=0;i<a.count;i++){
    const angle=aim+(Math.random()-.5)*cone;
    fire(source,angle,a.bulletSpeed,color,{settings:a,kind:'needle',r:4});
   }
  },
  spores(e,a,color){
   const source=muzzle(e,0,24),aim=playerAim(source),travel=a.bulletSpeed*a.brakeTime/2;
   const inset=a.cloudRadius+a.bulletRadius;
   const centerX=Math.max(A.x+inset,Math.min(A.x+A.w-inset,source.x+Math.cos(aim)*travel));
   const centerY=Math.max(A.y+inset,Math.min(A.y+A.h-inset,source.y+Math.sin(aim)*travel));
   const rotation=Math.random()*TAU;
   for(let i=0;i<a.count;i++){
    // Spread the spores across equal-area radial bands so sparse volleys fill the disk too.
    const radius=a.cloudRadius*Math.sqrt((i+Math.random())/a.count);
    const angle=rotation+i*Math.PI*(3-Math.sqrt(5));
    const targetX=centerX+Math.cos(angle)*radius,targetY=centerY+Math.sin(angle)*radius;
    fire(source,Math.atan2(targetY-source.y,targetX-source.x),2*Math.hypot(targetX-source.x,targetY-source.y)/a.brakeTime,color,{
     settings:a,motion:'spore',seed:Math.floor(Math.random()*0x7fffffff),r:a.bulletRadius,
     originX:source.x,originY:source.y,targetX,targetY,centerX,centerY,life:a.brakeTime+a.lingerTime,
    });
   }
  },
  brake(e,a,color){
   for(let i=0;i<a.count;i++)fireTuned(a,e,a.aim+(i-(a.count-1)/2)*a.spread,188,color,{motion:'brake',r:5});
  },
  spiral(e,a,color){
   for(const sign of [-1,1])for(const arm of [0,Math.PI]){
    fireTuned(a,e,a.aim+sign*a.fired*a.spread+arm,137,sign<0?color:warning,{motion:'curve',turn:sign*a.turn});
   }
  },
  wave(e,a,color){
   for(const side of [-1,1])for(const offset of [-a.spread,a.spread]){
    fireTuned(a,e,a.aim+offset,144,color,{motion:'wave',sway:side*a.sway,wavePhase:a.fired*.52,kind:'rice'});
   }
  },
  ring(e,a,color){
   for(let i=0;i<a.count;i++)fireTuned(a,e,i*TAU/a.count+a.fired*a.spread,a.fired?174:116,color,{r:5});
  },
  bend(e,a,color){
   for(const sign of [-1,1])for(let i=0;i<a.count;i++){
    const angle=a.aim+sign*(.82+i*a.spread);
    fireTuned(a,e,angle,148,color,{motion:'bend',goal:a.aim+sign*.13,delay:a.delay+i*.11,kind:'rice'});
   }
  },
  orbit(e,a,color){
   for(let i=0;i<a.count;i++){
    const angle=i*TAU/a.count,spin=(i%2?1:-1)*a.turn,radius=i%2?a.radius*44/73:a.radius;
    fireTuned(a,e,angle+Math.sign(spin)*Math.PI/2,152,color,{x:e.x+Math.cos(angle)*radius,y:e.y+Math.sin(angle)*radius,
     motion:'orbit',spin,radius,delay:a.delay+(i%2?.28:0)});
   }
  },
  wall(e,a,color){
   const left=a.fromLeft,r=5.5;
   const gap=Math.max(A.y+a.gap,Math.min(A.y+A.h-a.gap,p.y));
   const z=(gap-300)*1.06,width=canvas.getBoundingClientRect().width;
   const screenOrigin=renderer.screenPoint(0,13,z).x;
   const scale=renderer.screenPoint(1,13,z).x-screenOrigin;
   const mapEdge=left?A.x:A.x+A.w;
   const screenEdge=325+((left?0:width)-screenOrigin)/scale;
   const approach=a.bulletSpeed*.18+r;
   const edge=left?Math.min(screenEdge,mapEdge-approach):Math.max(screenEdge,mapEdge+approach);
   const life=6.8+Math.abs(edge-mapEdge)/a.bulletSpeed,direction=left?0:Math.PI;
   // Adjacent hit circles overlap everywhere outside the doorway.
   for(let at=A.y+1;at<A.y+A.h;at+=8){
    if(Math.abs(at-gap)<a.gap+r)continue;
    fireTuned(a,e,direction,140,color,{x:edge,y:at,r,kind:'wall',enteringArena:true,life});
   }
  },
  return(e,a,color){
   for(const side of [-1,1])for(let i=1;i<=a.count;i++){
    fireTuned(a,e,a.aim+side*i*a.spread,189,color,{motion:'return',turn:-side*a.turn,delay:a.delay+i*.1,kind:'needle'});
   }
  },
  mines(e,a,color){
   const inset=24,source=muzzle(e,0,24);
   for(let i=0;i<a.count;i++){
    const x=A.x+inset+Math.random()*(A.w-2*inset),y=A.y+inset+Math.random()*(A.h-2*inset);
    const dx=x-source.x,dy=y-source.y,distance=Math.hypot(dx,dy);
    const flightTime=Math.max(.55,Math.min(1.35,distance/460));
    fire(source,Math.atan2(dy,dx),distance/flightTime,color,{
     settings:a,aircraftMine:true,motion:'mineFlight',flightTime,originX:source.x,originY:source.y,
     targetX:x,targetY:y,fuse:flightTime+a.fuse,blast:a.blast,r:9,
    });
   }
  },
  inward(e,a,color){
   const center={x:p.x,y:p.y};
   let radius=Math.hypot(Math.max(p.x-A.x,A.x+A.w-p.x),Math.max(p.y-A.y,A.y+A.h-p.y));
   for(let i=0;i<8;i++){
    const angle=i*TAU/8,edge=offscreenPoint(center,Math.cos(angle),Math.sin(angle));
    radius=Math.max(radius,Math.hypot(edge.x-center.x,edge.y-center.y));
   }
   radius+=36;
   const gap=(6+a.round*5)%a.count;
   for(let i=0;i<a.count;i++){
    const separation=Math.abs(i-gap);
    if(Math.min(separation,a.count-separation)<=2)continue;
    const angle=i*TAU/a.count,dx=Math.cos(angle)*radius,dy=Math.sin(angle)*radius;
    fireTuned(a,center,angle+Math.PI,radius/3.2,color,{x:center.x+dx,y:center.y+dy,enteringArena:true,life:3.2/a.speedScale,r:5});
   }
  },
  pulse(e,a,color){
   for(const side of [-1,1]){
    const source=muzzle(e,side*25,12);
    for(let i=0;i<a.count;i++)fireTuned(a,source,i*TAU/a.count+a.fired*a.spread+side*.12,109,color,{r:5.5});
   }
  },
  pincer(e,a,color){
   for(const side of [-1,1]){
    const source=muzzle(e,side*29,20);
    const distance=Math.hypot(p.x-source.x,p.y-source.y),aim=playerAim(source);
    const speed=a.bulletSpeed*(1+a.fired*25/164);
    for(let i=0;i<a.count;i++){
     const curve=Math.min(1.2,Math.asin(Math.min(.93,distance*a.turn/(2*speed)))+i*a.spread);
     const turn=distance>1?2*speed*Math.sin(curve)/distance:0;
     fire(source,aim-side*curve,speed,color,{settings:a,motion:'curve',turn:side*turn,curveUntil:turn?2*curve/turn:0,kind:'rice'});
    }
   }
  },
  lance(e,a,color){
   for(const spread of [-a.spread,0,a.spread])fireTuned(a,a.source,a.aim+spread,337,color,{kind:'needle',r:5});
  },
 };

 function detonate(b){
  if(b.life<=0)return;
  b.life=0;
  blasts.push({x:b.x,y:b.y,r:b.blast,t:0});
  spawnExplosionFX(b.x,b.y,b.blast);
  burst(b.x,b.y,b.color,12);
  explosionSound();
  if(b.settings?.id==='rocket'){
   for(let i=0;i<b.settings.childCount;i++)fire(b,b.angle+i*TAU/b.settings.childCount,b.settings.childSpeed,b.color,{kind:'rice',r:5});
  }
  if(Math.hypot(p.x-b.x,p.y-b.y)<b.blast+drinkPlayerRadius())hurt(b);
 }

 function noiseSample(seed,index){
  let hash=seed^Math.imul(index,0x9e3779b1);
  hash=Math.imul(hash^(hash>>>16),0x21f0aaad);
  hash=Math.imul(hash^(hash>>>15),0x735a2d97);
  return ((hash^(hash>>>15))>>>0)/0x80000000-1;
 }

 function sporeNoise(seed,time){
  const index=Math.floor(time),fraction=time-index;
  const weight=fraction*fraction*(3-2*fraction),start=noiseSample(seed,index);
  return start+(noiseSample(seed,index+1)-start)*weight;
 }

 function updateBullet(b,dt){
  const previousAge=b.age;
  b.age+=dt;
  if(b.settings?.id==='rocket'&&previousAge>0&&!insideArena(b.x,b.y)){
   b.x=Math.max(A.x+1,Math.min(A.x+A.w-1,b.x));
   b.y=Math.max(A.y+1,Math.min(A.y+A.h-1,b.y));
   detonate(b);return false;
  }
  if(b.fuse!==undefined&&b.age>=b.fuse){detonate(b);return false;}
  let speed=b.speed;
  const settings=b.settings;
  if(b.motion==='curve'){
   b.angle+=b.turn*Math.max(0,Math.min(dt,(b.curveUntil??Infinity)-previousAge));
  }else if(b.motion==='seed'){
   const delay=settings.delay;
   if(b.age>=delay){
    for(let i=0;i<settings.childCount;i++)fire(b,b.angle+i*TAU/settings.childCount,
     settings.childSpeed*(1+(i%2)*36/159),i%2?b.color:warning,{kind:'rice',r:5.5,settings});
    b.life=0;return false;
   }
   speed*=Math.max(.08,1-b.age/(delay*1.08/1.13));
  }else if(b.motion==='homing'&&b.age<(b.track??1.42)){
   const difference=Math.atan2(p.y-b.y,p.x-b.x)-b.angle;
   const delta=Math.atan2(Math.sin(difference),Math.cos(difference));
   const turn=(b.turn??1.16)*dt;
   b.angle+=Math.max(-turn,Math.min(turn,delta));
  }else if(b.motion==='brake'){
   speed=b.age<settings.pause?b.speed*Math.max(0,1-b.age/settings.brakeTime):Math.min(settings.maxSpeed,(b.age-settings.pause)*settings.acceleration);
  }else if(b.motion==='bend'&&b.age>b.delay){
   const delta=b.goal-b.angle;
   b.angle+=Math.sign(delta)*Math.min(Math.abs(delta),dt*settings.turn);
  }else if(b.motion==='orbit'&&b.age<b.delay){
   b.angle+=b.spin*dt;
   speed=Math.abs(b.spin)*b.radius;
  }else if(b.motion==='return'&&b.age>b.delay&&b.age<b.delay+Math.PI/Math.abs(b.turn)){
   b.angle+=b.turn*dt;
  }
  b.vx=Math.cos(b.angle)*speed;b.vy=Math.sin(b.angle)*speed;
  if(b.motion==='mineFlight'){
   const progress=Math.min(1,b.age/b.flightTime);
   const x=b.originX+(b.targetX-b.originX)*progress,y=b.originY+(b.targetY-b.originY)*progress;
   b.vx=dt>0?(x-b.x)/dt:0;b.vy=dt>0?(y-b.y)/dt:0;
  }else if(b.motion==='wave'){
   const lateral=Math.cos(b.age*settings.frequency+b.wavePhase)*b.sway;
   b.vx-=Math.sin(b.angle)*lateral;b.vy+=Math.cos(b.angle)*lateral;
  }else if(b.motion==='spore'){
   const progress=Math.min(1,b.age/settings.brakeTime);
   const distance=progress*(2-progress),settled=progress===1;
   const lingerAge=Math.max(0,b.age-settings.brakeTime);
   const ramp=Math.min(1,lingerAge/.45);
   const noiseTime=(settled?settings.brakeTime+lingerAge*.55:b.age)*settings.noiseRate;
   const drift=settings.sway*(settled?.12*ramp*ramp*(3-2*ramp):.35*Math.sin(Math.PI*progress)**2);
   let x=b.originX+(b.targetX-b.originX)*distance+drift*sporeNoise(b.seed,noiseTime);
   let y=b.originY+(b.targetY-b.originY)*distance+drift*sporeNoise(b.seed^0x6a09e667,noiseTime);
   if(settled){
    const dx=x-b.centerX,dy=y-b.centerY,radius=Math.hypot(dx,dy);
    if(radius>settings.cloudRadius){
     x=b.centerX+dx*settings.cloudRadius/radius;
     y=b.centerY+dy*settings.cloudRadius/radius;
    }
   }
   b.vx=dt>0?(x-b.x)/dt:0;
   b.vy=dt>0?(y-b.y)/dt:0;
  }
  return true;
 }

 function trackBeam(e,a,speed,dt){
  const delta=playerAim(e)-a.direction;
  const shortest=Math.atan2(Math.sin(delta),Math.cos(delta));
  const limit=speed*dt;
  a.direction+=Math.max(-limit,Math.min(limit,shortest));
 }

 function beamPath(e,angle){
  const length=beamLength({x:e.x,y:e.y,aim:angle});
  return {x:e.x+Math.cos(angle)*length,y:e.y+Math.sin(angle)*length};
 }

 function prepareDash(e,a){
  a.home={x:e.x,y:e.y};
  const inset=e.r+12;
  a.retreat={
   x:Math.max(A.x+inset,Math.min(A.x+A.w-inset,e.x-Math.cos(a.aim)*84)),
   y:Math.max(A.y+inset,Math.min(A.y+A.h-inset,e.y-Math.sin(a.aim)*84)),
  };
  a.turnSign=e.id==='ember'?1:-1;
  a.pass=0;
  a.phase='windup';
 }

 function placeOnLeg(e,from,to,progress){
  e.x=from.x*(1-progress)+to.x*progress;
  e.y=from.y*(1-progress)+to.y*progress;
 }

 function easeFlight(t){return t*t*(3-2*t);}

 function offscreenPoint(origin,dx,dy){
  const view=canvas.getBoundingClientRect(),margin=Math.max(42,108*renderer.pointScale);
  const point=d=>({x:origin.x+dx*d,y:origin.y+dy*d});
  const outside=d=>{
   const {x,y}=point(d),q=renderer.screenPoint(x-325,43,(y-300)*1.06);
   return q.x < -margin||q.x > view.width+margin||q.y < -margin||q.y > view.height+margin;
  };
  let near=0,far=Math.hypot(A.w,A.h)+TILE*4;
  for(let i=0;i<3&&!outside(far);i++)far*=2;
  for(let i=0;i<13;i++){
   const mid=(near+far)/2;
   if(outside(mid))far=mid;else near=mid;
  }
  return point(far);
 }

 function insideArena(x,y){return x>A.x&&x<A.x+A.w&&y>A.y&&y<A.y+A.h;}

 function launchDash(e,a,from,angle){
  a.from=from;a.angle=angle;
  a.dx=Math.cos(angle);a.dy=Math.sin(angle);
  // Side passes start beyond the screen, so find the exit from a point inside the crossing.
  a.to=offscreenPoint(a.pass>0?{x:325,y:from.y}:from,a.dx,a.dy);
  a.distance=Math.hypot(a.to.x-from.x,a.to.y-from.y);
  a.travelled=0;a.nextShot=52;a.hit=false;
  a.phase='charge';
  placeOnLeg(e,from,a.to,0);
  e.flightHeading=Math.atan2(a.dx,a.dy*1.06);
  e.invulnerable=!insideArena(e.x,e.y);
  beep(122,.22,'sawtooth',.04);
 }

 function fireDashVolley(e,a,distance){
  const x=a.from.x+a.dx*distance,y=a.from.y+a.dy*distance;
  if(!insideArena(x,y))return;
  const entryDepth=a.dx>0?x-A.x:A.x+A.w-x;
  if(a.pass>0&&entryDepth<116)return;
  const color=craft[e.id].color;
  for(const angle of [-1.48,-1.06,1.06,1.48])fireTuned(a,{x,y},a.angle+angle,166,color,{kind:'rice',r:5.5});
  enemyShotSound(e.type);
 }

 function advanceDash(e,a,dt){
  if(a.phase==='windup'){
   const progress=Math.min(1,a.age/a.windup);
   placeOnLeg(e,a.home,a.retreat,easeFlight(progress));
   const dx=p.x-e.x,dy=p.y-e.y;
   e.flightHeading=Math.atan2(dx,dy*1.06);
   e.flightRoll=a.turnSign*TAU*2*easeFlight(progress);
   if(progress===1){
    delete e.flightRoll;
    launchDash(e,a,{x:e.x,y:e.y},Math.atan2(dy,dx));
   }
   return false;
  }
  if(a.phase==='charge'){
   const x=e.x,y=e.y;
   const speed=a.pass>0?a.speed*a.sideScale:a.speed;
   a.travelled=Math.min(a.distance,a.travelled+speed*dt);
   placeOnLeg(e,a.from,a.to,a.travelled/a.distance);
   e.invulnerable=!insideArena(e.x,e.y);
   while(a.nextShot<=a.travelled){
    fireDashVolley(e,a,a.nextShot);
    a.nextShot+=a.shotSpacing;
   }
   if(!a.hit&&bulletClosestDistance(e,x,y)<e.r+drinkPlayerRadius()){
    hurt(e);a.hit=true;
   }
   if(a.travelled===a.distance){
    a.phaseAge=0;
    if(a.pass<a.extraPasses){
     a.phase='sideCue';
     a.sideDirection=a.pass>0?-Math.sign(a.dx):a.turnSign;
     a.sideLane={x:325,y:p.y};
    }else a.phase='offscreen';
   }
   return false;
  }
  a.phaseAge+=dt;
  if(a.phase==='sideCue'){
   if(a.phaseAge<a.cueTime)return false;
   a.pass++;
   launchDash(e,a,offscreenPoint(a.sideLane,-a.sideDirection,0),a.sideDirection>0?0:Math.PI);
   return false;
  }
  if(a.phase==='offscreen'){
   if(a.phaseAge<dashPause)return false;
   a.from=offscreenPoint(a.home,-a.dx,-a.dy);
   a.phase='recover';a.phaseAge=0;
   placeOnLeg(e,a.from,a.home,0);
   e.flightHeading=Math.atan2(a.home.x-a.from.x,(a.home.y-a.from.y)*1.06);
   return false;
  }
  const progress=Math.min(1,a.phaseAge/a.recovery);
  placeOnLeg(e,a.from,a.home,1-(1-progress)**2);
  e.invulnerable=!insideArena(e.x,e.y);
  if(progress<1)return false;
  delete e.flightHeading;
  delete e.invulnerable;
  return true;
 }

 function updateEnemy(e,dt){
  if(e.hp<=0||state!=='combat')return;
  if(!e.maneuver&&!observing&&!e.weapons.some(slot=>slot.attack?.kind==='lance')){
   e.t+=dt;
   const spec=craft[e.id];
   const center=325+e.side*116,[dx,dy]=spec.flight(e.t,p.x-center);
   const x=Math.max(A.x+e.r,Math.min(A.x+A.w-e.r,center+dx*(e.side?.52:1)));
   const y=Math.max(A.y+e.r,Math.min(A.y+A.h-e.r,spec.y+dy));
   const response=1-Math.exp(-3.2*dt);
   e.x+=(x-e.x)*response;
   e.y+=(y-e.y)*response;
  }
  e.weaponTime=(e.weaponTime??0)+dt;
  e.warn=false;
  // Resolve hull movement before weapons sample their muzzle positions.
  for(const slot of e.weapons){
   if(slot.spec.kind==='dash')advanceWeapon(e,slot,dt);
   if(state!=='combat')return;
  }
  for(const slot of e.weapons){
   if(slot.spec.kind!=='dash')advanceWeapon(e,slot,dt);
   if(state!=='combat')return;
  }
  const beam=e.weapons.find(slot=>slot.attack?.kind==='beam')?.attack;
  if(beam)pointNose(e,beam.direction);
 }

 function advanceWeapon(e,slot,dt){
  if(!slot.attack){
   if(e.weaponTime<slot.next)return;
   if(e.maneuver||(slot.spec.kind==='dash'&&e.weapons.some(weapon=>weapon.attack)))return;
   if(!observing){
    if(e.weaponTime<recoveryUntil)return;
    const separated=separatedMoves[slot.spec.id];
    if(separated&&enemies.some(other=>other.aircraftBoss&&other.hp>0&&other.weapons.some(weapon=>
     weapon.spec.id===separated&&(weapon.attack||(other.weaponTime??0)-(weapon.finishedAt??-Infinity)<separationTime))))return;
    const active=activeAttacks();
    if(active.length){
     const previous=active[0];
     if(combinedAttack||slot.spec.kind==='dash'||previous.kind==='dash')return;
     if(castDuration(previous)-previous.age>slot.spec.warn+overlapWindow)return;
     combinedAttack=true;
    }
   }
   const aim=Math.atan2(p.y-e.y,p.x-e.x);
   const a={...slot.spec,age:0,fired:0,aim,round:slot.round++};
   if(a.kind==='beam'){
    a.direction=noseAngle(e);
   }else if(a.kind==='wall'){
    a.fromLeft=Math.random()<.5;
   }else if(a.kind==='dash'){
    prepareDash(e,a);e.maneuver=a;
   }
   slot.attack=a;
   if(insideArena(e.x,e.y))beep(e.id==='ember'?214:327,.13,'triangle',.027);
  }
  const a=slot.attack;
  if(a.age<a.warn){
   if(a.kind==='beam'){
    const lockStart=a.warn-Math.min(.4,a.warn*.8);
    trackBeam(e,a,a.aimSpeed,Math.max(0,Math.min(dt,lockStart-a.age)));
   }
   if(a.kind==='lance'){
    pointNose(e,playerAim(e));
    a.source=muzzle(e,0,24);
    a.aim=playerAim(a.source);
   }
  }
  a.age+=dt;
  if(a.kind==='dash'){
   if(!advanceDash(e,a,dt))return;
   e.maneuver=null;
  }else if(a.age<a.warn){
   if(a.kind==='beam')pointNose(e,a.direction);
   if(insideArena(e.x,e.y)&&!['rocket','seeker','beam','lance'].includes(a.kind))e.warn=true;
   return;
  }else if(a.kind==='beam'){
   if(insideArena(e.x,e.y)){
    if(!a.fired){a.fired=1;enemyShotSound(e.type);}
    else trackBeam(e,a,a.turnSpeed,dt);
    pointNose(e,a.direction);
    const source=muzzle(e,0,24),end=beamPath(source,noseAngle(e));
    if(segmentHits(source.x,source.y,end.x,end.y,{x:p.x,y:p.y,r:drinkPlayerRadius()},a.width))hurt(e);
   }
   if(a.age<a.warn+a.length)return;
  }else{
   while(a.fired<a.bursts&&a.age>=a.warn+a.interval*a.fired){
    if(insideArena(e.x,e.y))release(e,a);
    a.fired++;
   }
   if(a.fired<a.bursts)return;
  }
  if(['lance','beam'].includes(a.kind)&&!e.maneuver)delete e.flightHeading;
  slot.attack=null;
  slot.finishedAt=e.weaponTime;
  slot.next=observing?Infinity:slot.finishedAt+slot.spec.period;
  if(!observing&&(combinedAttack||a.kind==='dash')&&!activeAttacks().length){
   recoveryUntil=e.weaponTime+recoveryTime;
   combinedAttack=false;
  }
 }

 function drawBullet(b){
  const x=b.x-325,z=(b.y-300)*1.06,y=13;
  if(b.motion==='seed'){
   renderer.bulletOrb(x,y,z,b.r,b.color);
   const start=b.settings.delay*.62;
   if(b.age>start)renderer.emissiveRing(x,3,z,14+19*(b.age-start)/(b.settings.delay-start),warning,2);
   return;
  }
  const needle=b.kind==='needle',angle=b.motion==='brake'?Math.atan2(Math.sin(b.angle)*1.06,Math.cos(b.angle)):Math.atan2(b.vy*1.06,b.vx);
  if(b.fuse!==undefined){
   if(b.aircraftMine){
    const flight=Math.min(1,b.age/b.flightTime);
    renderer.bulletOrb(x,9+Math.sin(Math.PI*flight)*56,z,8,b.color);
    if(flight===1)renderer.emissiveRing(x,3.5,z,b.blast,b.color,2);
   }else{
    drawMetalMissile(x,y,z,angle,b.settings?.id==='seeker'?'red':'yellow',b);
    if(b.age>b.fuse-.76)renderer.emissiveRing(x,3.5,z,b.blast,b.color,2);
   }
   return;
  }
  if(b.kind==='chevron'||b.kind==='wall'||b.motion==='spore'){
   renderer.bulletOrb(x,y,z,b.r,b.color);
   return;
  }
  renderer.emissiveBox(x,y,z,needle?19:12,2.2,needle?5:4,b.color,-angle);
  renderer.emissiveBox(x,y+1.5,z,needle?13:7,1.2,1.8,needle?'#e4faff':'#fff2ce',-angle);
  renderer.glow(x,y,z,needle?5.5:3.8,b.color);
 }

 function drawBeamLine(e,end,activeWidth=0){
  const dx=end.x-e.x,dz=(end.y-e.y)*1.06,length=Math.hypot(dx,dz),yaw=-Math.atan2(dz,dx);
  if(!length)return;
  const line=(center,span,y,width,color)=>renderer.emissiveBox(e.x-325+dx*center/length,y,(e.y-300)*1.06+dz*center/length,span,1,width,color,yaw);
  if(activeWidth){
   line(length/2,length,9,activeWidth*2,'#267ca6');
   line(length/2,length,11,activeWidth*1.1,blue);
   line(length/2,length,13,3,'#eefcff');
  }else line(length/2,length,13,2.3,'#ff3939');
 }

 function drawDash(e,a){
  const color=craft[e.id].color;
  if(a.phase==='windup'){
   renderer.glow(e.x-325,44,(e.y-300)*1.06,12+10*a.age/a.windup,color);
  }else if(a.phase==='sideCue'){
   const direction=a.sideDirection,x=(direction>0?A.x+25:A.x+A.w-25)-325,z=(a.sideLane.y-300)*1.06;
   renderer.glow(x,12,z,13+13*a.phaseAge/a.cueTime,color);
   for(const side of [-1,1])renderer.emissiveBox(x,9,z+side*6,27,2,3,'#fff0c8',direction*side*.47);
  }else if(a.phase==='charge'){
   const trail=Math.min(74,a.travelled),yaw=-Math.atan2(a.dy*1.06,a.dx);
   renderer.emissiveBox(e.x-325-a.dx*trail/2,14,(e.y-300-a.dy*trail/2)*1.06,trail,2,9,color,yaw);
  }
 }

 function draw(){
  if(missileReticle)missileReticle.hidden=true;
  if(state!=='combat')return;
  for(const e of enemies){
   if(!e.aircraftBoss||e.hp<=0)continue;
   if(e.maneuver)drawDash(e,e.maneuver);
   if(!insideArena(e.x,e.y))continue;
   for(const {attack:a} of e.weapons){
    if(a?.kind==='beam'){
     const source=muzzle(e,0,24);
     drawBeamLine(source,beamPath(source,noseAngle(e)),a.age<a.warn?0:a.width);
    }else if(a?.kind==='lance'&&a.age<a.warn){
     drawBeamLine(a.source,beamPath(a.source,a.aim));
    }else if(missileReticle&&(a?.kind==='rocket'||a?.kind==='seeker')&&a.fired<a.bursts&&a.age<a.warn+a.interval*a.fired){
     const point=renderer.screenPoint(p.x-325,29,(p.y-300)*1.06);
     missileReticle.style.left=point.x+'px';missileReticle.style.top=point.y+'px';
     missileReticle.hidden=false;
    }
   }
  }
 }

 function hud(){
  const live=enemies.filter(e=>e.aircraftBoss&&e.hp>0);
  const attacks=live.map(e=>{
   const active=e.weapons.flatMap(slot=>slot.attack?[slot.attack.name]:[]);
   const dash=e.maneuver;
   const name=mode==='duo'?`${names[e.id]} `:'';
   if(dash?.phase==='sideCue')return `${name}${dash.sideDirection>0?'左侧':'右侧'}来袭，上下让开`;
   if(!active.length)return '';
   return `${name}${active.slice(0,2).join('＋')}${active.length>2?` 等${active.length}招`:''}`;
  }).filter(Boolean);
  const selected=panel.querySelector('.boss-move-editor select').value;
  const busy=observing&&live.some(e=>moveBlocked(e,selected));
  const releaseButton=panel.querySelector('[data-preview]');
  releaseButton.disabled=busy||paused;
  releaseButton.textContent=busy?'招式执行中…':'释放这招';
  const text=attacks.join(' / ')||(observing?'待命 · 点击释放这招':'挑战中 · 移动走位，自动瞄准');
  if(statusLabel.textContent!==text)statusLabel.textContent=text;
 }

 function finish(won){
  state=won?'menu':'dead';cleared=won;paused=false;releaseJoy();
  enemies=[];bullets=[];shots=[];hazards=[];missiles=[];
  statusLabel.textContent=won?'试飞通过':'试飞结束';
  showOverlay(`<div class="tag">AIR BOSS LAB</div><h2>${won?'战机已击破':'试飞结束'}</h2>
   <p>${names[mode]} · ${won?'测试通过':'再试一次，利用蓄力窗口换位'}</p><button class="primary" id="air-boss-again">重新挑战</button>
   <a class="snake-entry" href="?airboss=gallery">返回 BOSS 阵列</a>`);
  $('air-boss-again').onclick=()=>start(mode,false);syncMusic();
 }

 const moves=id=>craft[id]?.moves.map(key=>arsenal[key].name);
 function spawnCampaignAircraft(id){
  const spec=craft[id];
  const weapons=spec.moves.map((key,index)=>({spec:moveSpec(key),next:1.3+index*3.2,round:0,attack:null}));
  enemies.push({id,type:spec.type,x:325,y:spec.y,r:spec.r,hp:spec.hp,max:spec.hp,
   aircraftBoss:true,vehicleModel:id,vehicleScale:spec.scale,seed:0,side:0,t:0,weapons,maneuver:null});
 }

 return {moves,spawnCampaignAircraft,get active(){return !!mode;},get observing(){return observing;},get name(){return names[mode];},init,updateEnemy,updateBullet,drawBullet,detonate,draw,hud,finish};
})();

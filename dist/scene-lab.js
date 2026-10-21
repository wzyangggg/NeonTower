'use strict';
// Explicit opt-in study page; the campaign's normal entry and saves stay unchanged.
if(typeof location!=='undefined'&&new URLSearchParams(location.search).get('lab')==='1'){
 const style=document.createElement('style');style.textContent=`
 body.scene-lab{background:#0b1320}.scene-lab .viewport{background:#0b1320}
 .scene-lab .lab-panel{position:absolute;z-index:6;left:14px;right:14px;bottom:34px;padding:12px 14px;background:#101c2bed;border:1px solid #526375;border-radius:8px;box-shadow:0 6px 24px #0005;max-width:440px;margin:auto}
 .lab-panel strong{font-size:14px;color:#e1e6e8}.lab-panel small{display:block;color:#9eb2c1;font-size:10px;margin:5px 0 9px;line-height:1.6}.lab-panel .lab-buttons{display:flex;gap:6px;flex-wrap:wrap}.lab-panel button,.lab-panel a,.lab-panel select{background:#233548;border:1px solid #536979;color:#d5e8eb;padding:7px 9px;font-size:11px;border-radius:4px;text-decoration:none}.lab-panel .lab-atmosphere{display:flex;gap:6px;margin:9px 0}.lab-atmosphere select{min-width:0;flex:1}.lab-panel button.active{background:#3c6669;border-color:#81b8b4}.scene-lab.clean .lab-panel,.scene-lab.clean .hud,.scene-lab.clean .wavehud,.scene-lab.clean .shield-hud,.scene-lab.clean .bottomhud,.scene-lab.clean #test-open,.scene-lab.clean .survival-clock{display:none!important}
 .scene-lab .lab-return{display:none;position:absolute;z-index:8;bottom:12px;right:12px;border:1px solid #70808b;background:#152534d9;color:#d9e4e8;padding:7px;border-radius:4px;font-size:10px}.scene-lab.clean .lab-return{display:block}
 .scene-lab #survival-clock{top:130px;transform:translateX(-50%) scale(.7);transform-origin:top center}
 `;document.head.append(style);document.body.classList.add('scene-lab');document.title='街区升降台 · 场景预览';
 const panel=document.createElement('section');panel.className='lab-panel';panel.innerHTML='<strong>街区升降台 · WebGL 实景</strong><small>基础几何建模 · 原游戏角色与战斗逻辑<br>WASD / 触屏移动；静态观察时冻结战斗。</small><div class="lab-buttons"><button data-size="9">初始 9 格</button><button data-size="49" class="active">49 格</button><button data-size="99">99 格</button><button data-size="143">满场</button><button id="lab-play">开始实战</button><button id="lab-theme">原场景对照</button><button id="lab-clean">隐藏界面</button><a href="?scene=street">正式流程试玩</a></div>';$('viewport').append(panel);
 const options=document.createElement('div');options.className='lab-atmosphere';options.innerHTML='<select id="lab-place" aria-label="场景"><option value="street">雨巷街区</option><option value="dock">深水检修平台</option><option value="roof">高架屋顶机房</option><option value="abyss">太空电梯 · 夜城</option></select><select id="lab-look" aria-label="氛围配色"><option value="green">黄绿夜雨</option><option value="blue">黄蓝夜雨</option><option value="violet">紫蓝深井</option></select><button id="lab-rain">雨 ON</button>';panel.querySelector('.lab-buttons').before(options);
 const refreshAtmosphere=()=>{renderer.sceneKey=null;$('lab-place').value=StreetScene.place;$('lab-look').value=StreetScene.look;$('lab-rain').textContent=StreetScene.rain?'雨 ON':'雨 OFF';panel.querySelector('strong').textContent=StreetScene.names[StreetScene.place]+' · '+StreetScene.palette.name+'夜景';document.title=StreetScene.names[StreetScene.place]+' · 场景预览';panel.querySelector('a').href='?scene='+StreetScene.place+'&look='+StreetScene.look+'&rain='+(StreetScene.rain?1:0);const params=new URLSearchParams(location.search);params.set('scene',StreetScene.place);params.set('look',StreetScene.look);params.set('rain',StreetScene.rain?'1':'0');history.replaceState(null,'','?'+params);draw();};
 $('lab-place').onchange=()=>{StreetScene.place=$('lab-place').value;StreetScene.enabled=true;refreshAtmosphere();};$('lab-look').onchange=()=>{StreetScene.look=$('lab-look').value;StreetScene.enabled=true;refreshAtmosphere();};$('lab-rain').onclick=()=>{StreetScene.rain=!StreetScene.rain;refreshAtmosphere();};
 const back=document.createElement('button');back.className='lab-return';back.textContent='显示界面';back.onclick=()=>document.body.classList.remove('clean');$('viewport').append(back);
 const lab={size:StreetScene.place==='abyss'?99:49,playing:false,setup(size=lab.size){
  reset();testMode=true;floor=5;state='combat';paused=true;timedRoom=null;spawnQueue=[];chaserSpawned=999;chaserTimer=999;shootTimer=999;time=1;scroll=0;
  tiles=[];const cells=[];for(let y=grid.minY;y<=grid.maxY;y++)for(let x=grid.minX;x<=grid.maxX;x++)cells.push({x,y});
  cells.sort((a,b)=>Math.max(Math.abs(a.x),Math.abs(a.y-1))-Math.max(Math.abs(b.x),Math.abs(b.y-1))||a.y-b.y||a.x-b.x);
  for(const c of cells.slice(0,size))tiles.push({...c,healProgress:0,healFlash:0,medPack:false});
  if(size>=49)for(const [x,y,key]of [[-2,2,'medical'],[2,-1,'shieldTile'],[2,3,'cashTile']]){const t=tiles.find(t=>t.x===x&&t.y===y);if(t)t[key]=true;}
  p.x=325;p.y=355;p.inv=0;p.shield=3;p.hp=p.max=9;
  const spots=size===9?[[0,0],[1,2]]:[[-2,-1],[2,1],[-1,3],[2,3]];
  enemies=[];for(const [i,[x,y]]of spots.entries()){spawn({type:i%2?'skull':'eye',side:0});const e=enemies[enemies.length-1];if(e)Object.assign(e,{x:325+x*TILE,y:300+y*TILE,seed:i+.2,warn:false});}
  lab.size=size;lab.playing=false;$('lab-play').textContent='开始实战';
  $('overlay').style.display='none';$('pause-panel').hidden=true;$('viewport').classList.remove('paused','falling','landing');clearTimeout(toast.timer);$('toast').classList.remove('show');
  renderer.sceneKey=null;updateUI();$('status').textContent='场景观察';$('wave').textContent='13 × 11 固定场地';
  panel.querySelectorAll('[data-size]').forEach(b=>b.classList.toggle('active',+b.dataset.size===size));draw();
 }};
 window.sceneLab=lab;
 panel.querySelectorAll('[data-size]').forEach(b=>b.onclick=()=>lab.setup(+b.dataset.size));
 $('lab-play').onclick=()=>{lab.playing=!lab.playing;paused=!lab.playing;$('lab-play').textContent=lab.playing?'冻结观察':'继续实战';shootTimer=lab.playing?0:999;p.inv=0;for(const e of enemies)e.stun=0;$('pause-panel').hidden=true;};
 $('lab-theme').onclick=()=>{StreetScene.enabled=!StreetScene.enabled;renderer.sceneKey=null;$('lab-theme').textContent=StreetScene.enabled?'原场景对照':'街区场景';draw();};
 $('lab-clean').onclick=()=>document.body.classList.add('clean');
 lab.setup();refreshAtmosphere();
}

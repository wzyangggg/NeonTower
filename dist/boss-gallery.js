'use strict';

globalThis.BossGallery=(()=>{
 const columns=3;
 const origin={x:325,y:300,hp:1,max:1,seed:0,t:0,angle:0,hitAt:-Infinity};
 const craft=[
  ['ember','烬翼','三角突击机',78,1.6],
  ['cobalt','钴隼','重型双引擎战机',88,1.55],
  ['prism','棱核','双臂浮游核心',89,1.65],
  ['forge','熔炉','双炮攻城艇',75,1.6],
  ['mantis','螳刃','双爪拦截机',76,1.5],
  ['wraith','幽镰','双环镰翼机',79,1.45],
  ['needle','赤针','后掠翼追击机',76,1.65],
  ['hovercar','涵道飞车','四涵道装甲艇',78,1.45],
  ['hoverbike','飞摩托','轻型悬浮猎手',65,1.7],
  ['bubblepod','球舱','透明座舱浮空炮台',93,1.4],
  ['fighter','战斗机','双翼截击机',75,1.5],
 ];
 let entries=[],selected=-1,angle=0,gridPanel,detail,selector,turn,description,movesLabel,flightLink;

 function snakeModel(){
  const snake=spawnSnakeBoss(13);
  snake.parts.forEach((part,i)=>{
   const a=-.7+i*.49,r=73-i*1.1;
   part.x=325+Math.cos(a)*r;part.y=300+Math.sin(a)*r;
   part.angle=a-Math.PI/2;
  });
  return ()=>{
   snakeBoss=snake;
   try{snake.parts.forEach(drawSnakeSegment);}finally{snakeBoss=null;}
  };
 }

 function collectModels(){
  const virus=spawnVirusBoss();Object.assign(virus,origin,{gait:null});
  const drone=spawnDroneBoss();Object.assign(drone,origin);
  const cowboy=spawnCowboyBoss();Object.assign(cowboy,origin,{spiderBase:null});
  updateCowboySpider(cowboy,0);
  const crimson={...origin,crimson:true,motion:'walk',speedRatio:1,lean:0};
  const humanoid={...origin,motion:'walk',speedRatio:1,lean:0};
  const ufo={...origin,type:'ufoBoss'};
  const fish=spawnFishSchool(325,300);
  const drawSnake=snakeModel();
  enemies=[];virusBoss=null;droneBoss=null;humanoidBoss=null;snakeBoss=null;
  return [
   ...craft.map(([id,name,concept,size,scale])=>({id,name,concept,size,scale,center:23,
    draw:()=>EnemyVehicles.draw({...origin,flightHeading:.28,vehicleScale:1},0,0,0,id)})),
   {id:'ufo',name:'星际访客',concept:'飞碟母舰',size:158,scale:.81,center:60,draw:()=>drawUFOEnemy(ufo)},
   {id:'snake',name:'机械蛇',concept:'环形编队 · 炮节与蛇首',size:203,scale:.57,center:23,draw:drawSnake},
   {id:'virus',name:'噬菌体',concept:'六足病毒 · 高塔形轮廓',size:123,scale:.71,center:82,draw:()=>drawVirusBoss(virus)},
   {id:'drone',name:'大无人机',concept:'四旋翼重装平台',size:198,scale:.65,center:75,draw:()=>{drone.t=time;drawDroneBoss(drone);}},
   {id:'cowboy',name:'枪手机械蜘蛛',concept:'四足底盘 · 双侧炮',size:110,scale:1.05,center:35,draw:()=>drawHumanoidBoss(cowboy)},
   {id:'crimson',name:'赤红双枪机甲',concept:'重装双足 · 左右双枪',size:147,scale:.77,center:76,draw:()=>drawHumanoidBoss(crimson)},
   {id:'humanoid',name:'人形守卫',concept:'轻型双足 · 悬浮双拳',size:137,scale:.74,center:76,draw:()=>drawHumanoidBoss(humanoid)},
   {id:'fish',name:'机械鱼群',concept:'群体型候选 · 13 尾编队',size:241,scale:.52,center:30,draw:()=>drawFishSchool(fish)},
  ];
 }

 function init(){
  activeDifficulty=1;reset();testMode=true;floor=11;
  p.x=origin.x;p.y=origin.y;
  state='bossGallery';syncGrid();tiles=[];
  for(let y=grid.minY;y<=grid.maxY;y++)for(let x=grid.minX;x<=grid.maxX;x++)tiles.push({x,y});
  entries=collectModels();
  document.title='BOSS 测试场 · 霓虹高塔';
  $('viewport').classList.remove('falling','landing','boss-intro','survival-intro');
  $('viewport').classList.add('boss-gallery-scene');
  clearTimeout(toast.timer);$('toast').classList.remove('show');
  const style=document.createElement('link');
  style.rel='stylesheet';style.href='boss-gallery.css';document.head.append(style);
  const panel=document.createElement('section');
  panel.className='boss-gallery';panel.setAttribute('aria-label','BOSS 测试场');
  panel.innerHTML=`<header><div><h1>BOSS 测试场</h1><p>${entries.length} 个模型 · 点选放大</p></div><a href="?airboss=duo">双机试飞</a></header>
   <div class="boss-gallery-grid">${entries.map(({id,name},i)=>`<button type="button" data-index="${i}" data-model="${id}"><span>${name}</span></button>`).join('')}</div>
   <footer>
    <div class="boss-gallery-detail" hidden>
     <div class="boss-gallery-navigation">
      <button type="button" data-prev aria-label="上一个 BOSS">‹</button>
      <select aria-label="选择 BOSS">${entries.map(({name},i)=>`<option value="${i}">${name}</option>`).join('')}</select>
      <button type="button" data-next aria-label="下一个 BOSS">›</button>
     </div>
     <p data-description aria-live="polite"></p>
     <p data-moves hidden></p>
     <a data-flight hidden>试飞招式 →</a>
     <label>旋转 <input type="range" min="-180" max="180" value="0" step="5"></label>
     <button type="button" data-overview>返回全部模型</button>
    </div>
    <a href="./">返回游戏首页</a>
   </footer>`;
  $('viewport').append(panel);
  gridPanel=panel.querySelector('.boss-gallery-grid');detail=panel.querySelector('.boss-gallery-detail');
  selector=detail.querySelector('select');turn=detail.querySelector('input');description=detail.querySelector('[data-description]');
  movesLabel=detail.querySelector('[data-moves]');flightLink=detail.querySelector('[data-flight]');
  panel.addEventListener('pointerdown',event=>event.stopPropagation());
  gridPanel.addEventListener('click',event=>{
   const button=event.target.closest('[data-index]');
   if(button){select(Number(button.dataset.index));selector.focus();}
  });
  selector.onchange=()=>select(Number(selector.value));
  turn.oninput=()=>{angle=Number(turn.value)*Math.PI/180;};
  detail.querySelector('[data-prev]').onclick=()=>select((selected+entries.length-1)%entries.length);
  detail.querySelector('[data-next]').onclick=()=>select((selected+1)%entries.length);
  detail.querySelector('[data-overview]').onclick=()=>{
   const previous=selected;select(-1);gridPanel.children[previous].focus();
  };
  music.setState({active:false});
 }

 function select(index){
  selected=index;angle=0;turn.value=0;
  gridPanel.hidden=index>=0;detail.hidden=index<0;
  if(index>=0){
   const entry=entries[index],moves=globalThis.AirBossLab.moves(entry.id);
   selector.value=index;description.textContent=entry.concept;
   flightLink.hidden=movesLabel.hidden=!moves;
   movesLabel.textContent=moves?.join(' · ')??'';
   if(moves)flightLink.href=`?airboss=${entry.id}`;
  }
 }

 function drawModel(r,entry,screenX,screenY,scale,yaw){
  const m=r.vp,tx=(screenX*2-1-m[12])/m[0];
  const tz=(1-screenY*2-m[13]-m[5]*entry.center*scale)/m[9];
  const cs=Math.cos(yaw)*scale,sn=Math.sin(yaw)*scale;
  const vertexStart=r.count;
  const previous=r.residentTransform;
  r.residentTransform=pose=>[
   cs*pose[0]+sn*pose[8],cs*pose[1]+sn*pose[9],cs*pose[2]+sn*pose[10],cs*pose[3]+sn*pose[11]+tx,
   scale*pose[4],scale*pose[5],scale*pose[6],scale*pose[7],
   cs*pose[8]-sn*pose[0],cs*pose[9]-sn*pose[1],cs*pose[10]-sn*pose[2],cs*pose[11]-sn*pose[3]+tz,
  ];
  try{entry.draw();}finally{r.residentTransform=previous;}
  // The virus model also emits a ring outside its retained meshes.
  for(let i=vertexStart;i<r.count;i+=9){
   const d=r.data,x=d[i],z=d[i+2],nx=d[i+3],nz=d[i+5];
   d[i]=cs*x+sn*z+tx;d[i+1]*=scale;d[i+2]=cs*z-sn*x+tz;
   d[i+3]=(cs*nx+sn*nz)/scale;d[i+5]=(cs*nz-sn*nx)/scale;
  }
 }

 function draw(r){
  r.setOutlineGroup?.(.5);
  if(selected>=0){
   const entry=entries[selected];
   drawModel(r,entry,.5,.44,Math.min(3.5,r.halfX*1.18/entry.size),angle);
  }else{
   const rows=Math.ceil(entries.length/columns);
   const fit=Math.min(1,r.halfY/690,r.halfX/315);
   entries.forEach((entry,i)=>drawModel(r,entry,.1+.8*(i%columns+.5)/columns,
    .09+.76*(Math.floor(i/columns)+.4)/rows,entry.scale*fit,0));
  }
  r.setOutlineGroup?.(0);
 }

 return {init,draw};
})();

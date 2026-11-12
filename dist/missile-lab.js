'use strict';

(()=>{
 const lanes=[
  {baseY:205,dir:1,enemy:true,accelerating:true},
  {baseY:285,dir:1,enemy:true,accelerating:false},
  {baseY:365,dir:-1,homing:true},
  {baseY:445,dir:-1,weaponId:'pulse'}
 ];
 let playing=true,speed=1;
 globalThis.MissileLab={get speed(){return playing?speed:0;}};
 const drone={type:'spitter',x:325,y:110,hp:1,max:1,r:18,t:0,seed:0,vehicleVariant:false};
 function position(){
  for(const lane of lanes){
   const progress=(time/2.6+.05)%1,angle=time*2+lane.baseY*.03;
   lane.x=325+lane.dir*(progress-.5)*425;
   lane.y=lane.baseY+Math.sin(angle)*2;
   lane.vx=lane.dir*425/2.6;lane.vy=Math.cos(angle)*4;
   lane.a=Math.atan2(lane.vy,lane.vx);
   lane.height=16;lane.life=1;
  }
  drone.t=time;
 }
 const link=document.createElement('link');
 link.rel='stylesheet';link.href='missile-lab.css';document.head.append(link);
 const panel=document.createElement('section');
 panel.className='missile-lab';
 panel.setAttribute('aria-label','导弹演示');
 panel.innerHTML=`<header>
  <div><small>NEON TOWER / FLIGHT TEST</small><h1>导弹演示</h1></div><a href="./">返回游戏</a>
 </header>
 <div class="missile-lab-deck">
  <p>尾烟向后喷出，余烟随共享流场上浮、翻卷。</p>
  <ul aria-label="飞行顺序，从上到下">
   <li class="missile-reference">黄色无人机亮度基准</li>
   <li class="missile-hostile">敌方 · 白黑红</li>
   <li class="missile-hostile">敌方 · 黄黑</li>
   <li class="missile-friendly">玩家 · 白黑蓝</li>
   <li class="missile-reference">手枪弹尺寸基准</li>
  </ul>
  <div class="missile-lab-controls">
   <button type="button" id="missile-play">暂停</button>
   <button type="button" id="missile-speed" aria-pressed="false">半速</button>
   <button type="button" id="missile-replay">重播</button>
  </div>
 </div>`;
 const viewport=$('viewport');
 viewport.classList.add('missile-lab-mode');
 viewport.append(panel);
 panel.addEventListener('pointerdown',event=>event.stopPropagation());
 reset();
 testMode=true;
 state='missileLab';
 viewport.classList.remove('falling','landing');
 $('overlay').style.display='none';
 tiles=[];
 for(let y=-5;y<=6;y++)for(let x=-4;x<=4;x++)tiles.push({x,y});
 p.x=325;p.y=535;
 enemies=[drone];
 missiles=lanes.filter(lane=>lane.enemy);
 shots=lanes.filter(lane=>!lane.enemy);
 position();
 const gameStep=step;
 step=function(dt,realDt=dt){
  if(state!=='missileLab')return gameStep(dt,realDt);
  if(playing){time+=dt*speed;position();}
 };
 const play=$('missile-play');
 play.onclick=()=>{
  playing=!playing;
  play.textContent=playing?'暂停':'继续';
 };
 $('missile-speed').onclick=event=>{
  speed=speed===1?.5:1;
  event.currentTarget.setAttribute('aria-pressed',String(speed===.5));
 };
 $('missile-replay').onclick=()=>{
  clearMissileSmoke();globalThis.ParticleSmoke?.clear();time=0;position();
  playing=true;play.textContent='暂停';
 };
})();

(() => {
 'use strict';

 const effect=EmberExplosions;
 const panel=document.createElement('section');
 panel.className='smoke-blast-compare';
 panel.setAttribute('aria-label','爆烟距离对比');
 panel.innerHTML=`<strong>爆烟距离对比</strong>
  <div class="smoke-compare-actions">
   <button type="button" data-blast="standard">标准</button>
   <button type="button" data-blast="far">远距</button>
   <button type="button" id="smoke-compare-replay">连续引爆四次</button>
  </div><small id="smoke-compare-status" role="status"></small>`;
 const style=document.createElement('style');
 style.textContent=`
 .smoke-blast-compare{position:absolute;z-index:8;left:12px;right:12px;bottom:82px;
  padding:9px;background:#101d31ed;border:1px solid #60849e;border-radius:7px;color:#dceeff;font:12px/1.4 system-ui,sans-serif}
 .weapon-panel .smoke-blast-compare{position:static;margin-top:9px}
 .smoke-compare-actions{display:flex;gap:6px;margin:6px 0}
 .smoke-compare-actions button{flex:1;min-height:34px;padding:5px;border:1px solid #55748d;border-radius:5px;background:#20334c;color:#e6f5ff;font:inherit;cursor:pointer}
 .smoke-compare-actions button[aria-pressed=true]{background:#185d65;border-color:#78e6ee}
 .smoke-blast-compare small{display:block;color:#b2c6d9}
 `;
 document.head.append(style);
 (document.querySelector('.weapon-panel')||document.getElementById('viewport')).append(panel);
 const status=panel.querySelector('#smoke-compare-status');
 const buttons=[...panel.querySelectorAll('[data-blast]')];
 const combatStates=['combat','survival','missileLab'];
 function syncVisibility(){panel.hidden=!combatStates.includes(state);}
 syncVisibility();
 const visibilityTimer=setInterval(syncVisibility,250);
 window.addEventListener('pagehide',()=>clearInterval(visibilityTimer),{once:true});
 let animationFrame,sequence;
 function sync(){
  for(const button of buttons)button.setAttribute('aria-pressed',String(button.dataset.blast===effect.blastMode));
  status.textContent=effect.blastMode==='far'?'远距爆烟 · 冲击范围约为标准的 2 倍':'标准爆烟';
 }
 function stop(){
  cancelAnimationFrame(animationFrame);
  sequence=null;
 }
 function choose(mode){
  stop();
  effect.setBlastMode(mode);
  const url=new URL(location.href);
  url.searchParams.set('smokeblast',mode);
  history.replaceState(null,'',url);
  sync();
 }
 function tick(){
  if(!sequence)return;
  if(!combatStates.includes(state)){stop();return;}
  if(!paused){
   while(sequence.index<sequence.bursts.length&&time-sequence.started>=sequence.index*.18){
    const {dx,dy}=sequence.bursts[sequence.index++];
    spawnExplosionFX(sequence.x+dx,sequence.y+dy,48,{paleSmoke:true});
   }
  }
  if(sequence.index===sequence.bursts.length){stop();return;}
  animationFrame=requestAnimationFrame(tick);
 }
 for(const button of buttons)button.addEventListener('click',()=>choose(button.dataset.blast));
 panel.querySelector('#smoke-compare-replay').addEventListener('click',()=>{
  if(paused||!combatStates.includes(state)){
   status.textContent='进入战斗并继续游戏后，可连续引爆。';
   return;
  }
  stop();
  ParticleSmoke.clear();
  sequence={started:time,index:0,x:p.x,y:p.y,
   bursts:[{dx:-72,dy:-90},{dx:42,dy:-90},{dx:64,dy:24},{dx:-36,dy:60}]};
  sync();
  tick();
 });
 sync();
})();

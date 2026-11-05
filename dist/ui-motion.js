'use strict';

// Exit copies are visual only: gameplay and pointer capture can resume immediately.
globalThis.UIMotion=(()=>{
 const reduced=()=>globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const ghosts=new Set();
 function exit(el,direction='down'){
  if(!el||el.hidden||el.style.display==='none'||reduced()||!el.animate)return;
  const copy=el.cloneNode(true);
  copy.removeAttribute('id');copy.removeAttribute('role');copy.removeAttribute('aria-modal');
  copy.querySelectorAll('[id]').forEach(node=>{node.dataset.motionId=node.id;node.removeAttribute('id');});
  copy.classList.add('ui-exit-copy');copy.setAttribute('aria-hidden','true');copy.inert=true;
  copy.style.pointerEvents='none';copy.style.animation='none';
  // A clone keeps its original layout rules and sits in the same clipped viewport.
  el.parentElement.append(copy);ghosts.add(copy);
  const animation=copy.animate([{translate:'0 0',opacity:1},{translate:direction==='right'?'105% 0':direction==='down'?'0 calc(100% + 80px)':'0 18px',opacity:0}],{duration:180,easing:'cubic-bezier(.4,0,1,1)',fill:'forwards'});
  // Kept for browser diagnostics without depending on animation timing.
  copy.dataset.exitDirection=direction;
  animation.finished.catch(()=>{}).finally(()=>{copy.remove();ghosts.delete(copy);});
 }
 function overlay(el,previous){
  const panel=el.querySelector('.shop-panel'),kind=panel?(panel.classList.contains('weapon-compare')?'reveal':'shop'):'result';
  el.dataset.motionKind=kind;
  el.classList.toggle('ui-overlay-enter',previous!==kind);
  if(kind==='reveal')panel.classList.add('ui-reveal-enter');
 }
 function clear(){for(const copy of ghosts)copy.remove();ghosts.clear();}
 return {exit,overlay,clear};
})();

// Shared delayed confirmation. Existing click handlers execute once, after feedback.
globalThis.ButtonConfirm=(()=>{
 const defaults={duration:1000,white:25,original:100,successVolume:60};
 const timing={...defaults},key='neon-button-confirm-v1';
 function configure(values,persist=false){
  for(const [name,min,max] of [['duration',100,5000],['white',10,500],['original',10,1000],['successVolume',0,100]]){
   const value=Number(values?.[name]);if(Number.isFinite(value))timing[name]=Math.max(min,Math.min(max,Math.round(value)));
  }
  if(persist)localStorage.setItem(key,JSON.stringify(timing));
  return {...timing};
 }
 try{configure(JSON.parse(localStorage.getItem(key)));}catch{}
 globalThis.addEventListener('storage',event=>{if(event.key===key&&!pending){try{configure(event.newValue?JSON.parse(event.newValue):defaults);}catch{}}});
 const selector='#start,#research-upgrade,[data-skill][data-change="1"],[data-confirm-delay]';
 let pending=null,replay=null;
 function finish(commit){
  const job=pending;if(!job)return;
  pending=null;clearTimeout(job.timer);job.stop?.();
  job.button.classList.remove('confirm-flash-white');job.button.removeAttribute('aria-busy');
  document.documentElement.classList.remove('button-confirm-pending');
  if(commit&&job.button.isConnected&&!job.button.disabled){
   try{globalThis.ButtonConfirmSuccessAudio?.();}catch{}
   replay=job.button;try{job.button.click();}finally{replay=null;}
  }
 }
 function run(button){
  if(pending||button.disabled)return;
  const job=pending={button,start:performance.now(),timer:null,stop:null};
  button.setAttribute('aria-busy','true');document.documentElement.classList.add('button-confirm-pending');
  try{job.stop=globalThis.ButtonConfirmAudio?.();}catch{}
  function tick(){
   if(!button.isConnected||document.hidden){finish(false);return;}
   const elapsed=performance.now()-job.start;
   if(elapsed>=timing.duration){finish(true);return;}
   button.classList.toggle('confirm-flash-white',!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches&&elapsed%(timing.white+timing.original)<timing.white);
   const phase=elapsed%(timing.white+timing.original);
   job.timer=setTimeout(tick,Math.max(1,Math.min(timing.duration-elapsed,phase<timing.white?timing.white-phase:timing.white+timing.original-phase)));
  }
  tick();
 }
 document.addEventListener('click',event=>{
  const button=event.target.closest?.('button');if(replay&&button===replay)return;
  if(pending){event.preventDefault();event.stopImmediatePropagation();return;}
  if(button?.matches(selector)&&!button.disabled){event.preventDefault();event.stopImmediatePropagation();run(button);}
 },true);
 for(const type of ['pointerdown','pointerup','keydown','keyup'])document.addEventListener(type,event=>{
  if(pending){event.preventDefault();event.stopImmediatePropagation();}
 },true);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)finish(false);});
 globalThis.addEventListener('pagehide',()=>finish(false));
 // Same ascending reward chime for the lab and the game, with automatic cleanup.
 function successAudio(context,output){
  const volume=timing.successVolume/100;if(!volume)return;
  [523.25,659.25,783.99,1046.5].forEach((frequency,index)=>{
   const oscillator=context.createOscillator(),gain=context.createGain(),at=context.currentTime+index*.055;
   oscillator.type='triangle';oscillator.frequency.value=frequency;
   gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.09*volume,at+.008);gain.gain.exponentialRampToValueAtTime(.0001,at+.23);
   oscillator.connect(gain);gain.connect(output);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};oscillator.start(at);oscillator.stop(at+.24);
  });
 }
 return {timing,defaults,configure,successAudio,run,cancel:()=>finish(false),get busy(){return !!pending;}};
})();

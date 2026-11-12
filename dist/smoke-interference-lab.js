(() => {
 'use strict';

 const byId=id=>document.getElementById(id);
 const effect=EmberExplosions,{DT}=EmberLab;
 const canvas=byId('scene'),frame=byId('frame'),play=byId('play');
 const renderer={canvas,vp:new Float32Array(16)};
 const descriptions={
  single:'共享流场中只引爆 A，用作对照。',
  separate:'四次爆炸各用一个流场。打开拖尾可对照尾烟在独立流场里的走向。',
  shared:'爆炸和蓝色拖尾共用流场。观察爆炸如何推开已经留下的烟。',
  shock:'B、C、D 只施加冲击，白烟来自 A。',
  smoke:'固定烟源持续释放细烟。调节上升力、卷动扰动和寿命，观察烟柱的弯曲与散开。'
 };
 const buttons=[...document.querySelectorAll('[data-mode]')];
 const sources=[
  {marker:byId('source-a'),at:0,x:-75,z:-24,radius:48},
  {marker:byId('source-b'),at:3,x:5,z:-54,radius:46},
  {marker:byId('source-c'),at:6,x:72,z:8,radius:45},
  {marker:byId('source-d'),at:9,x:-12,z:56,radius:42}
 ];
 const initialPositions=sources.map(({x,z})=>({x,z}));
 const lastFrame=Number(frame.max),speed=byId('speed'),trail=byId('trail'),trailSource=byId('trail-source');
 const motion=byId('trail-motion'),plume={...effect.plumeDefaults};
 const trailLead=30;
 const directions={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
 let mode='shared',current=0,running=false,elapsed=0,lastTime=null,animationFrame,drag;

 function positionMarker({marker,x,z}){
  const {vp}=renderer;
  marker.style.left=`${50+x*vp[0]*50}%`;
  marker.style.top=`${50-z*vp[9]*50}%`;
 }

 function trailPoint(tick){
  const time=tick*DT;
  if(motion.value==='stationary')return [0,16,200];
  return [-180*Math.cos(time*.8),16,30+22*Math.sin(time*2)];
 }

 function emitTrail(tick){
  if(trail.checked)effect.emitTrail(renderer,trailPoint(tick+1),'continuous',.52,trailPoint(tick),plume);
 }

 function positionTrail(){
  trailSource.hidden=!trail.checked;
  const [x,,z]=trailPoint(current);
  positionMarker({marker:trailSource,x,z});
 }

 function moveSource(source,x,z){
  source.x=Math.max(-260,Math.min(260,x));
  source.z=Math.max(-300,Math.min(300,z));
  positionMarker(source);
 }

 function resize(){
  const {width,height}=canvas.getBoundingClientRect(),dpr=Math.min(1.5,devicePixelRatio);
  canvas.width=Math.max(1,Math.round(width*dpr));
  canvas.height=Math.max(1,Math.round(height*dpr));
  const {vp}=renderer,scale=Math.min(width,height)/600;
  vp[0]=2*scale/width;
  vp[5]=2*scale*.532/height;
  vp[9]=-2*scale*.847/height;
  vp[13]=-16*vp[5];
  vp[15]=1;
  for(const source of sources)positionMarker(source);
  positionTrail();
  effect.draw(renderer);
 }

 function emit({x,z,radius,at}){
  const random=effect.createRandom(effect.defaultSeed+at);
  const options={random,paleSmoke:true,shockOnly:at>0&&mode==='shock'};
  const emitted=mode==='separate'
   ?effect.emit(renderer,x,z,radius,[],options)
   :effect.emitShared(renderer,x,z,radius,options);
  byId('error').hidden=emitted===true;
  return emitted===true;
 }

 function advance(){
  const source=mode==='single'||mode==='smoke'?null:sources.find(({at})=>at>0&&current===at);
  if(source&&!emit(source))return false;
  emitTrail(current);
  effect.update(DT);
  current++;
  return true;
 }

 function paint(){
  frame.value=current;
  byId('time').value=`${(current*DT).toFixed(2)} 秒`;
  for(const {marker,at} of sources)marker.classList.toggle('pending',current<=at&&at>0);
  positionTrail();
  effect.draw(renderer);
 }

 function setRunning(next){
  cancelAnimationFrame(animationFrame);
  running=next;
  elapsed=0;
  lastTime=null;
  play.textContent=running?'暂停':'继续';
  if(running)animationFrame=requestAnimationFrame(loop);
 }

 function seek(target){
  setRunning(false);
  effect.clear();
  current=0;
  if(trail.checked){
   for(let tick=-trailLead;tick<0;tick++){
    emitTrail(tick);
    effect.update(DT);
   }
  }
  if(mode==='smoke'||emit(sources[0])){
   while(current<target&&advance()){}
  }
  paint();
 }

 function loop(now){
  if(!running)return;
  if(lastTime!==null)elapsed+=Math.max(0,Math.min(.1,(now-lastTime)/1000))*Number(speed.value);
  lastTime=now;
  const previous=current;
  while(elapsed>=DT&&current<lastFrame){
   if(!advance()){setRunning(false);break;}
   elapsed-=DT;
  }
  if(current!==previous)paint();
  if(current>=lastFrame)setRunning(false);
  if(running)animationFrame=requestAnimationFrame(loop);
 }

 function finishDrag(event,commit){
  if(drag?.id!==event.pointerId)return;
  const {source,x,z}=drag;
  drag=null;
  if(!commit)moveSource(source,x,z);
  else if(source.x!==x||source.z!==z)seek(current);
 }

 for(const source of sources){
  const {marker}=source;
  marker.addEventListener('pointerdown',event=>{
   if(drag||event.button!==0)return;
   setRunning(false);
   const {left,top,width,height}=marker.getBoundingClientRect();
   drag={id:event.pointerId,source,x:source.x,z:source.z,
    offsetX:event.clientX-left-width/2,offsetY:event.clientY-top-height/2};
   marker.setPointerCapture(event.pointerId);
  });
  marker.addEventListener('pointermove',event=>{
   if(drag?.id!==event.pointerId)return;
   const {left,top,width,height}=canvas.getBoundingClientRect(),{vp}=renderer;
   const x=(2*(event.clientX-drag.offsetX-left)/width-1)/vp[0];
   const z=(1-2*(event.clientY-drag.offsetY-top)/height)/vp[9];
   moveSource(source,x,z);
  });
  marker.addEventListener('pointerup',event=>finishDrag(event,true));
  marker.addEventListener('pointercancel',event=>finishDrag(event,false));
  marker.addEventListener('lostpointercapture',event=>finishDrag(event,false));
  marker.addEventListener('keydown',event=>{
   const direction=directions[event.key];
   if(!direction)return;
   event.preventDefault();
   const distance=event.shiftKey?32:8;
   moveSource(source,source.x+direction[0]*distance,source.z+direction[1]*distance);
   seek(current);
  });
 }

 function select(next){
  mode=next;
  for(const button of buttons)button.setAttribute('aria-pressed',String(button.dataset.mode===mode));
  byId('mode-description').textContent=descriptions[mode];
  for(const {marker,at} of sources)marker.hidden=mode==='smoke'||at>0&&mode==='single';
  seek(current);
 }

 for(const button of buttons)button.addEventListener('click',()=>select(button.dataset.mode));
 frame.addEventListener('input',()=>seek(Number(frame.value)));
 trail.addEventListener('change',()=>seek(current));
 motion.addEventListener('change',()=>seek(current));
 for(const key of ['rise','turbulence','lifetime']){
  const input=byId(key),output=byId(key+'-value');
  const update=()=>{
   plume[key]=Number(input.value);
   output.value=plume[key].toFixed(key==='turbulence'?2:1)+(key==='lifetime'?' 秒':'');
  };
  update();
  input.addEventListener('input',()=>{update();seek(current);});
 }
 play.addEventListener('click',()=>{
  if(current===lastFrame)seek(0);
  if(byId('error').hidden)setRunning(!running);
 });
 byId('replay').addEventListener('click',()=>{seek(0);setRunning(byId('error').hidden);});
 byId('reset-positions').addEventListener('click',()=>{
  sources.forEach((source,index)=>moveSource(source,initialPositions[index].x,initialPositions[index].z));
  seek(current);
 });
 byId('step').addEventListener('click',()=>{
  setRunning(false);
  if(current<lastFrame)advance();
  paint();
 });
 new ResizeObserver(resize).observe(canvas);
 resize();
 current=Number(frame.value);
 select(mode);
})();

(() => {
 'use strict';

 const byId=id=>document.getElementById(id);
 const {DT}=EmberLab, effect=EmberExplosions, defaults=effect.defaults;
 const stage=byId('scene'), frameInput=byId('frame'), time=byId('time');
 const renderer={canvas:stage,vp:new Float32Array(16)};
 const storageKey='hell-elevator-ember-smoke-lab-v1';
 const fields=[
  ['swirl','翻卷强度',0,18,.5],
  ['thrust','径向推力',0,1.5,.05],
  ['expansion','燃烧膨胀',0,1.5,.05],
  ['turbulence','喷口扰动',0,1.5,.05],
  ['secondLobe','副烟团',0,1,.05],
  ['shardSmoke','碎片烟源',0,1.5,.05],
  ['edgeSoftness','边缘柔化',0,1,.05],
  ['breakup','寿命参差',0,1.6,.05],
  ['fadeWidth','淡出时长',.5,2.5,.05],
  ['lifetime','寿命基准（秒）',.3,1.3,.01]
 ];
 const presets={
  soft:{swirl:13,thrust:.45,expansion:.50,turbulence:.60,secondLobe:.25,shardSmoke:.25,edgeSoftness:.70,breakup:1.25,fadeWidth:1.5,lifetime:.72},
  single:{turbulence:.7,secondLobe:0,shardSmoke:0,breakup:1.25}
 };
 let draft={...defaults}, seed=effect.defaultSeed;
 try{
  const saved=JSON.parse(localStorage.getItem(storageKey));
  if(Number.isInteger(saved?.seed)&&saved.seed>=0)seed=saved.seed>>>0;
  for(const [key,,min,max] of fields){
   const value=saved?.tuning?.[key];
   if(Number.isFinite(value))draft[key]=Math.min(max,Math.max(min,value));
  }
 }catch{}

 let comparing=false,running=false,current=0,pending=7,budget=0,last=0,ready=false;
 const selected=()=>comparing?defaults:draft;
 const frameLimit=()=>Math.ceil(effect.playbackSeconds(selected())/DT);
 const inputs=[];
 for(const [key,label,min,max,step] of fields){
  const row=document.createElement('div');
  row.className='control';
  row.innerHTML=`<label for="control-${key}">${label}<output for="control-${key}"></output></label>
   <input id="control-${key}" type="range" min="${min}" max="${max}" step="${step}">`;
  const input=row.querySelector('input'),output=row.querySelector('output');
  input.addEventListener('input',()=>{
   draft[key]=Number(input.value);
   setCompare(false);
   saveDraft();
  });
  inputs.push({key,input,output});
  byId('controls').append(row);
 }

 function saveDraft(){
  byId('export-value').hidden=true;
  try{
   localStorage.setItem(storageKey,JSON.stringify({seed,tuning:draft}));
   byId('saved').textContent='已保存到这个浏览器的调参页。';
  }catch{
   byId('saved').textContent='浏览器无法保存草稿，可用「复制参数」带走。';
  }
 }

 function syncControls(){
  for(const {key,input,output} of inputs){
   const value=selected()[key];
   input.value=value;
   input.disabled=comparing;
   output.value=key==='fadeWidth'&&selected().breakup>0?effect.fadeSeconds(selected()).toFixed(2)+' 秒':value.toFixed(2);
  }
  byId('draft').setAttribute('aria-pressed',String(!comparing));
  byId('baseline').setAttribute('aria-pressed',String(comparing));
  byId('seed').textContent='种子 '+seed;
  frameInput.max=frameLimit();
 }

 function setCompare(next){
  comparing=next;
  syncControls();
  running=false;
  pending=Math.min(pending??current,frameLimit());
 }

 function usePreset(preset){
  draft={...defaults,...preset};
  setCompare(false);
  pending=Math.min(7,frameLimit());
  saveDraft();
 }

 function resize(){
  const rect=stage.getBoundingClientRect(),dpr=Math.min(1.5,window.devicePixelRatio||1);
  const width=Math.max(1,Math.round(rect.width*dpr)),height=Math.max(1,Math.round(rect.height*dpr));
  if(stage.width===width&&stage.height===height&&renderer.vp[15])return;
  stage.width=width;stage.height=height;
  const scale=Math.min(width,height)/390,m=renderer.vp;
  m[0]=2*scale/width;
  m[5]=2*scale*.532/height;
  m[9]=-2*scale*.847/height;
  m[13]=-16*m[5];
  m[15]=1;
 }

 function seek(tick){
  effect.clear();
  const tuning={...selected()};
  const random=effect.createRandom(seed);
  const radius=55,fragments=effect.blastFragments(0,0,radius,random()*2*Math.PI);
  ready=effect.emit(renderer,0,0,radius,fragments,{tuning,random})===true;
  byId('error').hidden=ready;
  byId('error').textContent=ready?'':'无法启动烟雾预览。请确认浏览器支持 WebGL 2。';
  current=0;
  if(!ready){running=false;return;}
  for(;current<tick;current++)effect.update(DT);
 }

 function loop(now){
  const elapsed=Math.min(.1,(now-last)/1000);
  last=now;
  resize();
  if(pending!==null){
   const tick=pending;
   pending=null;
   budget=0;
   seek(tick);
  }else if(running&&ready){
   budget+=elapsed*Number(byId('rate').value);
   while(budget>=DT&&current<frameLimit()){
    budget-=DT;
    effect.update(DT);
    current++;
   }
   if(current>=frameLimit())running=false;
  }
  if(ready)effect.draw(renderer);
  frameInput.value=current;
  time.value=(current*DT).toFixed(2)+' 秒';
  byId('play').textContent=running?'暂停':'继续';
  requestAnimationFrame(loop);
 }

 byId('draft').onclick=()=>setCompare(false);
 byId('baseline').onclick=()=>setCompare(true);
 byId('reset').onclick=()=>usePreset({});
 byId('soft').onclick=()=>usePreset(presets.soft);
 byId('single').onclick=()=>usePreset(presets.single);
 byId('replay').onclick=()=>{pending=0;running=true;};
 byId('play').onclick=()=>{
  if(!running&&current>=frameLimit())pending=0;
  running=!running;
  budget=0;
 };
 byId('step').onclick=()=>{
  running=false;
  const tick=pending??current;
  pending=tick>=frameLimit()?1:tick+1;
 };
 byId('dissipate').onclick=()=>{
  running=false;
  const tuning=selected(),tail=tuning.breakup>0?effect.fadeSeconds(tuning)*.40:0;
  pending=Math.round((tuning.lifetime*.61+tail)/DT);
 };
 frameInput.addEventListener('input',()=>{
  running=false;
  pending=Number(frameInput.value);
 });
 byId('reroll').onclick=()=>{
  seed=Math.floor(Math.random()*4294967296);
  syncControls();
  running=false;
  pending=Math.min(7,frameLimit());
  saveDraft();
 };
 byId('copy').onclick=async()=>{
  const field=byId('export-value');
  field.value=JSON.stringify({seed,tuning:draft},null,2);
  try{
   await navigator.clipboard.writeText(field.value);
   byId('saved').textContent='已复制调试参数和种子。';
  }catch{
   field.hidden=false;
   field.focus();
   field.select();
   byId('saved').textContent='参数已选中，可手动复制。';
  }
 };
 syncControls();
 requestAnimationFrame(loop);
})();

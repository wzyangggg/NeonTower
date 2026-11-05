'use strict';
// Diagnostics retain at most 20 minutes of one-second samples and 64 spikes.
class GamePerformance {
 constructor(snapshot,clock=()=>performance.now()){
  this.snapshot=snapshot;this.clock=clock;this.history=[];this.spikes=[];this.frameTimes=[];this.pending={};this.previous=null;this.windowStart=null;this.windowFrames=0;this.metricFrames=0;this.totals={};this.slowFrames=0;this.longTasks=0;this.lastSample=null;this.open=false;this.limit=1200;
 }
 measure(key,fn){const start=this.clock();try{return fn()}finally{this.pending[key]=(this.pending[key]||0)+this.clock()-start;}}
 beginFrame(timestamp){this.pending={};this.started=this.clock();this.timestamp=timestamp;}
 endFrame(active=true){
  const t=this.timestamp;if(!active){this.previous=null;this.windowStart=null;this.windowFrames=0;this.metricFrames=0;this.totals={};this.frameTimes=[];return;}
  const dt=this.previous===null?0:t-this.previous;this.previous=t;
  if(this.windowStart===null)this.windowStart=t;
  if(dt>0){this.frameTimes.push(dt);if(this.frameTimes.length>240)this.frameTimes.shift();}
  this.windowFrames++;this.metricFrames++;for(const [key,value]of Object.entries(this.pending))this.totals[key]=(this.totals[key]||0)+value;
  if(dt>50){this.slowFrames++;this.spikes.push({atMs:t,frameMs:dt,cpuMs:this.clock()-this.started,timings:{...this.pending},state:this.snapshot(false).state});if(this.spikes.length>64)this.spikes.shift();}
  if(t-this.windowStart>=1000){
   const sorted=this.frameTimes.slice().sort((a,b)=>a-b),count=this.windowFrames;
   const row={atMs:t,fps:(count-1)*1000/(t-this.windowStart),p95FrameMs:sorted[Math.min(sorted.length-1,Math.floor(sorted.length*.95))]||0,slowFrames:this.slowFrames,longTasks:this.longTasks,timings:Object.fromEntries(Object.entries(this.totals).map(([k,v])=>[k,v/this.metricFrames])),...this.snapshot(true)};
   this.history.push(row);if(this.history.length>this.limit)this.history.shift();this.lastSample=row;this.windowStart=t;this.windowFrames=1;this.metricFrames=0;this.totals={};this.frameTimes=[];this.onSample?.(row);
  }
 }
 observeLongTask(duration,startTime){this.longTasks++;this.spikes.push({atMs:startTime,longTaskMs:duration});if(this.spikes.length>64)this.spikes.shift();}
 reset(){this.history.length=0;this.spikes.length=0;this.frameTimes.length=0;this.lastSample=null;this.previous=null;this.windowStart=null;this.windowFrames=0;this.metricFrames=0;this.totals={};this.slowFrames=0;this.longTasks=0;}
 report(){return {version:'0.232.0',generatedAt:new Date().toISOString(),limits:{historySamples:this.limit,spikes:64},notes:['提交时间是CPU提交WebGL命令的时间，不是GPU执行时间。','JS堆和已知GPU缓冲估算不是浏览器/显卡总内存。','网格缓存会复用旧模型，未活跃缓存和高水位容量不等于泄漏。'],samples:this.history.slice(),spikes:this.spikes.slice(),current:this.snapshot(true),meshInventory:this.inventory?.()||[]};}
 trend(){
  const recent=this.history.slice(-31);if(recent.length<2)return '采样中，至少观察 30 秒';
  const first=recent[0],last=recent[recent.length-1],secs=(last.atMs-first.atMs)/1000,n=v=>Number.isFinite(v)?v.toFixed(1):'不可用';
  const heap=last.heapUsedMB===null||first.heapUsedMB===null?'不可用':n(last.heapUsedMB-first.heapUsedMB)+' MB';
  return `${secs.toFixed(0)}秒变化：JS堆 ${heap}；网格 ${last.cache.meshes-first.cache.meshes>=0?'+':''}${last.cache.meshes-first.cache.meshes}；颜色 ${last.cache.colors-first.cache.colors>=0?'+':''}${last.cache.colors-first.cache.colors}；粒子 ${last.objects.particles-first.objects.particles>=0?'+':''}${last.objects.particles-first.objects.particles}`;
 }
}
// Attach after the game scripts so every main/test entry shares the same probe.
const gamePerf=new GamePerformance(full=>{
 if(!full)return {state,floor};
 const r=renderer,meshes=[...r.residentMeshes.values()];let active=0,instances=0,cpuMeshBytes=0,gpuMeshBytes=0,residentVertices=0;
 for(const m of meshes){if(m.count)active++;instances+=m.count;cpuMeshBytes+=m.data.byteLength+m.points.byteLength+m.instances.byteLength;gpuMeshBytes+=(m.buffer?m.data.byteLength:0)+(m.capacity||0);residentVertices+=m.count*m.data.length/9;}
 let bakedVertices=0,bakedInstances=0,bakedMeshes=0;for(const m of r.particleBakes?.values()||[]){bakedMeshes++;if(m.count)active++;cpuMeshBytes+=m.data.byteLength+m.instances.byteLength;gpuMeshBytes+=(m.buffer?m.data.byteLength:0)+(m.capacity||0);bakedVertices+=m.count*m.data.length/7;bakedInstances+=m.count;}
 const mb=n=>n/1048576,heap=performance.memory;
 return {state,floor,paused,heapUsedMB:heap?mb(heap.usedJSHeapSize):null,heapAllocatedMB:heap?mb(heap.totalJSHeapSize):null,
  objects:{enemies:enemies.length,deadEnemies:enemies.filter(e=>e.hp<=0).length,enemyBullets:bullets.length,friendlyShots:shots.length,missiles:missiles.length,particles:particles.length,blasts:blasts.length,explosionFX:explosionFX.length,hazards:hazards.length,droneSaws:droneSaws.length,spectrumHits:spectrumHits.length,cashPopups:cashPopups.length,spawnQueue:spawnQueue.length,tiles:tiles.length,turrets:turrets.length,snakeTrail:snakeBoss?.trail?.length||0,skyEffects:humanoidBoss?.skyEffects?.length||0,starTrail:p.starTrail?.points?.length||0,swordTrail:p.swordRide?.trail?.length||0,shotTargetRefs:shots.reduce((n,s)=>n+(s.hitTargets?.size||0)+(s.arcTargets?.length||0),0)},
  cache:{meshes:meshes.length+bakedMeshes,activeMeshes:active,inactiveMeshes:meshes.length+bakedMeshes-active,instances:instances+bakedInstances,colors:Object.keys(r.colors).length,cpuMeshMB:mb(cpuMeshBytes),sceneMB:mb(r.sceneData?.byteLength||0),dynamicCapacityMB:mb(r.data.byteLength+r.projectiles.byteLength+r.transparentData.byteLength),knownGpuBuffersMB:mb(gpuMeshBytes+(r.gpuCapacity||0)+(r.projectileCapacity||0)+(r.transparentCapacity||0)+(r.sceneGpuBytes||0)+(r.waterfallData?.byteLength||0))},
  rendering:{bakedParticleVertices:bakedVertices,bakedParticleInstances:bakedInstances,staticVertices:(r.sceneData?.length||0)/9,backgroundVertices:r.waterfallFrame?6:0,dynamicVertices:r.count/9,residentVertices,transparentVertices:r.transparentCount/7,points:r.projectileCount/7,canvas:[r.canvas.width,r.canvas.height],instanced:!!r.residentExtension},
  dom:{cashPopupNodes:$('cash-popups').childElementCount||0},equipment:{weapon:weapon?.id,armor:armor?.id,shoes:shoes?.id,drone:drone?.id}};
});
gamePerf.inventory=()=>[...[...renderer.residentMeshes].map(([key,m])=>({key,activeInstances:m.count,cpuBytes:m.data.byteLength+m.points.byteLength+m.instances.byteLength,gpuBufferBytes:(m.buffer?m.data.byteLength:0)+(m.capacity||0)})),...[...(renderer.particleBakes||[])].map(([key,m])=>({key:'particle:'+key,activeInstances:m.count,cpuBytes:m.data.byteLength+m.instances.byteLength,gpuBufferBytes:(m.buffer?m.data.byteLength:0)+(m.capacity||0)}))].sort((a,b)=>b.cpuBytes-a.cpuBytes);
const perfStep=step,perfDraw=draw,perfBackground=drawSpectrumScreen,perfSubmit=renderer.end.bind(renderer),perfAudio=music.sampleSpectrum.bind(music);
step=(...args)=>gamePerf.measure('logicMs',()=>perfStep(...args));
draw=(...args)=>gamePerf.measure('drawMs',()=>perfDraw(...args));
drawSpectrumScreen=(...args)=>gamePerf.measure('backgroundMs',()=>perfBackground(...args));
renderer.end=(...args)=>gamePerf.measure('submitMs',()=>perfSubmit(...args));
music.sampleSpectrum=(...args)=>gamePerf.measure('audioMs',()=>perfAudio(...args));
const perfButton=document.createElement('button');perfButton.id='perf-open';perfButton.textContent='性能';perfButton.title='F3 性能检测';perfButton.setAttribute('aria-expanded','false');document.querySelector('.actions').append(perfButton);
const perfPanel=document.createElement('section');perfPanel.className='perf-panel';perfPanel.id='perf-panel';perfPanel.hidden=true;perfPanel.innerHTML='<header><strong>性能检测</strong><button id="perf-close" aria-label="关闭性能检测">×</button></header><pre id="perf-values">采样中…</pre><p id="perf-trend"></p><svg viewBox="0 0 300 45" aria-label="最近60秒帧耗时"><path d="M0 30H300" stroke="#57716c" stroke-dasharray="3 3"/><polyline id="perf-line" fill="none" stroke="#94edba" stroke-width="1.5"/></svg><small>曲线：P95 帧间隔；虚线 16.7ms。提交≠GPU执行耗时。<br>缓存初次加载和容量高水位是正常现象，持续增长需结合场景判断。</small><footer><button id="perf-export">导出诊断 JSON</button><button id="perf-reset">重置记录</button></footer>';$('viewport').append(perfPanel);
function renderPerformance(){
 const s=gamePerf.lastSample;if(!s||!gamePerf.open)return;const n=v=>Number.isFinite(v)?v.toFixed(2):'不可用',m=s.timings,o=s.objects,c=s.cache;
 $('perf-values').textContent=`B${s.floor} · ${s.state}${s.paused?' · 暂停':''}\nFPS ${s.fps.toFixed(1)}  P95 ${n(s.p95FrameMs)}ms  >50ms帧 ${s.slowFrames}\n逻辑 ${n(m.logicMs)}ms  绘制 ${n(m.drawMs)}ms\n  背景 ${n(m.backgroundMs)}  音频 ${n(m.audioMs)}  提交 ${n(m.submitMs)}ms\n长任务 ${s.longTasks}（${typeof PerformanceObserver==='undefined'?'不支持':'浏览器支持时统计'}）\n敌人 ${o.enemies}（死亡残留 ${o.deadEnemies}） 敌弹 ${o.enemyBullets} 友弹 ${o.friendlyShots}\n导弹 ${o.missiles} 粒子 ${o.particles} 爆炸 ${o.explosionFX} 光波 ${o.blasts}\n危险区 ${o.hazards} 锯刃 ${o.droneSaws} 频谱命中 ${o.spectrumHits} 浮字 ${o.cashPopups}/${s.dom.cashPopupNodes}节点\n待刷 ${o.spawnQueue} 地板 ${o.tiles} 炮台 ${o.turrets}\n蛇轨迹 ${o.snakeTrail} 天降特效 ${o.skyEffects}\n坐骑拖尾 ${o.starTrail}/${o.swordTrail} 子弹目标引用 ${o.shotTargetRefs}\n网格缓存 ${c.meshes}（活跃 ${c.activeMeshes}/闲置 ${c.inactiveMeshes}）\n颜色缓存 ${c.colors}  常驻实例 ${c.instances}\nJS堆 ${n(s.heapUsedMB)}MB / 已分配 ${n(s.heapAllocatedMB)}MB\n网格CPU ${n(c.cpuMeshMB)}MB 场景 ${n(c.sceneMB)}MB\n动态容量 ${n(c.dynamicCapacityMB)}MB GPU缓冲估算 ${n(c.knownGpuBuffersMB)}MB\n顶点 ${Math.round(s.rendering.dynamicVertices+s.rendering.residentVertices+(s.rendering.bakedParticleVertices||0)+s.rendering.staticVertices+s.rendering.backgroundVertices)}\n每帧生成 ${Math.round(s.rendering.dynamicVertices)} / 静态常驻 ${Math.round(s.rendering.staticVertices)}\n粒子常驻 ${s.rendering.bakedParticleInstances||0}实例 / ${s.rendering.bakedParticleVertices||0}顶点\n背景GPU ${s.rendering.backgroundVertices}顶点 / 模型常驻 ${Math.round(s.rendering.residentVertices)}\n画布 ${s.rendering.canvas.join('×')} 实例化 ${s.rendering.instanced?'ON':'OFF'}\n记录 ${gamePerf.history.length}/${gamePerf.limit}秒；尖峰 ${gamePerf.spikes.length}/64`;
 $('perf-trend').textContent=gamePerf.trend();const recent=gamePerf.history.slice(-60);$('perf-line').setAttribute('points',recent.map((r,i)=>`${i*300/59},${45-Math.min(50,r.p95FrameMs)*.9}`).join(' '));
}
function togglePerformance(open=!gamePerf.open){gamePerf.open=open;perfPanel.hidden=!open;perfButton.setAttribute('aria-expanded',String(open));renderPerformance();}
perfButton.onclick=()=>togglePerformance();$('perf-close').onclick=()=>togglePerformance(false);gamePerf.onSample=renderPerformance;
$('perf-reset').onclick=()=>{gamePerf.reset();$('perf-values').textContent='记录已重置，采样中…';$('perf-trend').textContent='';$('perf-line').setAttribute('points','');};
$('perf-export').onclick=()=>{const blob=new Blob([JSON.stringify(gamePerf.report(),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='hell-elevator-performance-'+Date.now()+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
window.addEventListener('keydown',e=>{if(e.key==='F3'){e.preventDefault();togglePerformance();}});
try{if(typeof PerformanceObserver!=='undefined'){gamePerf.observer=new PerformanceObserver(list=>{for(const entry of list.getEntries())gamePerf.observeLongTask(entry.duration,entry.startTime);});gamePerf.observer.observe({type:'longtask',buffered:false});}}catch{}

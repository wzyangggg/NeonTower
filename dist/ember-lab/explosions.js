(() => {
 'use strict';

 const {DT, MAX_EMITTERS, sourceAt, GpuFluid, CpuFluid, fieldTexture, createEffectRenderer}=globalThis.EmberLab;
 const baseSettings={buoyancy:1,swirl:7,decay:.35};
 const gpuSize=64, cpuSize=48, capacity=4;
 // Fixed in battle coordinates so camera movement never drags the shared wind.
 const sharedSize=1344, sharedGpuSize=192, sharedCpuSize=72;
 const planeHeight=16;
 // Play a short burst while keeping every solver step at 1/30 s.
 const referenceLifetime=1.75/3, explosionStepsPerTick=3;
 const sharedStepsPerTick=explosionStepsPerTick*.75;
 const defaultSeed=54817810;
 const defaults=Object.freeze({
  swirl:10.5, thrust:1.4, turbulence:.25, expansion:1.35, secondLobe:.75,
  shardSmoke:0, edgeSoftness:.1, fadeWidth:.8, lifetime:1.27, breakup:1.4
 });
 const blastProfiles={
  standard:{sourceScale:1,thrustScale:1,expansionScale:1,shockStrength:.13,shockReach:.23,shockSpeed:.9},
  far:{sourceScale:1.5,thrustScale:1.8,expansionScale:1.8,shockStrength:.42,shockReach:.46,shockSpeed:1.15}
 };
 let blastMode=new URLSearchParams(location.search).get('smokeblast')==='far'?'far':'standard';
 function setBlastMode(mode){
  if(!Object.hasOwn(blastProfiles,mode))return false;
  if(mode!==blastMode){
   clear();
   const index=slots.findIndex(slot=>slot.sharedField);
   if(index>=0){
    const [slot]=slots.splice(index,1);
    if(gpu)slot.solver.dispose();
    else for(const texture of slot.textures)gl.deleteTexture(texture);
   }
  }else clear();
  blastMode=mode;
  return true;
 }
 function createRandom(seed){
  let value=seed>>>0;
  return ()=>{
   value=(Math.imul(value,1664525)+1013904223)>>>0;
   return value/4294967296;
  };
 }
 const gameRandom=createRandom(defaultSeed);
 const expiryLead=.10;
 const fadeSeconds=tuning=>.34*tuning.fadeWidth;
 const playbackSeconds=tuning=>tuning.breakup>0?tuning.lifetime-expiryLead+fadeSeconds(tuning):tuning.lifetime;
 // The plane grows along both axes.
 const explosionScale=Math.sqrt(2.04);
 const slots=[];
 let layer, gl, compositor, gpu, shared, unsupported=false, budget=0;
 const missileEmitters=new Map();
 function clearMissile(){
  missileEmitters.clear();
 }

 function clear(){
  for(const slot of slots)slot.source=null;
  shared=null;
  budget=0;
  clearMissile();
  if(layer)layer.style.display='none';
 }

 function dispose(){
  clear();
  for(const slot of slots){
   if(gpu)slot.solver.dispose();
   else for(const texture of slot.textures)gl.deleteTexture(texture);
  }
  slots.length=0;
  compositor?.dispose();
  compositor=null;
  layer?.remove();
  layer=null;
  gl?.getExtension('WEBGL_lose_context')?.loseContext();
  gl=null;
 }

 function initialize(sceneCanvas){
  if(unsupported)return false;
  if(gl&&!gl.isContextLost())return true;
  dispose();
  const canvas=document.createElement('canvas');
  gl=canvas.getContext('webgl2',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false,stencil:false});
  if(!gl){unsupported=true;return false;}
  layer=canvas;
  try{
   gpu=!!(gl.getExtension('EXT_color_buffer_float')||gl.getExtension('EXT_color_buffer_half_float'));
   compositor=createEffectRenderer(gl,true);
  }catch(error){
   unsupported=!gl.isContextLost();
   dispose();
   return false;
  }
  canvas.id='ember-smoke';
  canvas.setAttribute('aria-hidden','true');
  canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;display:none';
  canvas.addEventListener('webglcontextlost',()=>{if(layer===canvas)dispose();});
  sceneCanvas.after(canvas);
  return true;
 }

 function createSlot(sharedField){
  if(gpu){
   try{
    const resolution=sharedField?(blastMode==='far'?256:sharedGpuSize):gpuSize;
    return {solver:new GpuFluid(gl,resolution)};
   }catch(error){
    if(gl.isContextLost()||slots.length)throw error;
    gpu=false;
   }
  }
  const n=sharedField?sharedCpuSize:cpuSize;
  return {solver:new CpuFluid(n),textures:Array.from({length:3},()=>fieldTexture(gl,n))};
 }

 // A source callback returns every emitter for this region at the current fixed-step age.
 function play(sceneCanvas,x,z,size,source,{duration,colored=false,stepsPerTick=1,settings=baseSettings,flash=false,
  edgeSoftness=0,fadeWidth=1,sharedField=false,paleSmoke=false}){
  if(!initialize(sceneCanvas))return null;
  let slot=slots.find(slot=>!slot.source&&slot.sharedField===sharedField);
  if(!slot&&!sharedField&&slots.filter(slot=>!slot.sharedField).length>=capacity)return false;
  try{
   if(slot)slot.solver.reset();
   else{
    slot=createSlot(sharedField);
    slots.push(slot);
   }
  }catch(error){
   if(gl.isContextLost())dispose();
   return false;
  }
  Object.assign(slot,{x,z,size,source,duration,colored,stepsPerTick,settings,flash,edgeSoftness,fadeWidth,sharedField,paleSmoke,ticks:0,flashAt:0,stepRemainder:0});
  return true;
 }

 // Find the point on the smoke plane with the same screen projection as the shard.
 function projectShard([x,y,z],m){
  const w=m[3]*x+m[7]*y+m[11]*z+m[15];
  if(w<=0)return [x,z];
  const u=(m[0]*x+m[4]*y+m[8]*z+m[12])/w,v=(m[1]*x+m[5]*y+m[9]*z+m[13])/w;
  const a=m[0]-u*m[3],b=m[8]-u*m[11],c=m[1]-v*m[3],d=m[9]-v*m[11];
  const det=a*d-b*c;
  if(Math.abs(det)<1e-9)return [x,z];
  const lift=y-planeHeight,rx=(m[4]-u*m[7])*lift,ry=(m[5]-v*m[7])*lift;
  return [x+(rx*d-b*ry)/det,z+(a*ry-rx*c)/det];
 }

 function blastFragments(x,z,rad,seed){
  const thickness=Math.max(.65,Math.min(1.9,rad/64));
  return Array.from({length:6},(_,i)=>{
   const a=seed+i*2.39996+.25*Math.sin(i*3.1),delay=.013*(i%3);
   const life=.34+.24*Math.sin(i*2.11+.65)**2;
   const dx=Math.cos(a),dz=Math.sin(a)*1.06;
   const smokeTrail=i===1||i===5;
   const speed=rad*(5.1+3.8*Math.sin(i*4.1+.48)**2)*(smokeTrail?1.22:1);
   const lift=rad*(2.15+2.1*Math.sin(i*1.8+.3)**2)*(smokeTrail?1.14:1);
   const hot=i%3!==0;
   function point(t){
    const distance=speed*(1-Math.exp(-1.5*t))/1.5;
    return [x+dx*distance,17+lift*t-5.2*rad*t*t,z+dz*distance];
   }
   return {a,delay,life,hot,smokeTrail,thickness:thickness*(smokeTrail?1.65:1),point};
  });
 }

 function makeBlast(renderer,x,z,radius,fragments,tuning,random){
  if(!random){
   random=gameRandom;
   random(); // Match the preview's draw for the fragment angle.
  }
  const size=Math.max(110,Math.min(540,radius*4.6))*explosionScale;
  const lifeScale=tuning.lifetime/referenceLifetime;
  const duration=playbackSeconds(tuning)*explosionStepsPerTick,breakup=tuning.breakup??0;
  const settings={...baseSettings,swirl:tuning.swirl,noiseX:random()*2*Math.PI,noiseY:random()*2*Math.PI,rainbowPhase:random(),
   breakup,expiryFade:fadeSeconds(tuning)*explosionStepsPerTick,latestExpiry:(tuning.lifetime-expiryLead)*explosionStepsPerTick};
  const dx=Math.cos(settings.noiseX),dy=Math.sin(settings.noiseX);
  // Two hot shards travel in roughly opposite directions, leaving two emitter slots for the core.
  const shards=tuning.shardSmoke>0?fragments.filter(shard=>shard.smokeTrail).slice(0,2):[];
  const source=age=>{
   const main=sourceAt('explosion',age,1.5);
   main.impulse*=tuning.thrust;
   main.expansion*=tuning.expansion;
   const sources=[
    {...main,x:.5+.032*dx,y:.5+.032*dy,turbulence:2.4*tuning.turbulence,
     smokeExpiry:breakup?age+.52*lifeScale:(.66+.36*age)*lifeScale},
    {...main,x:.5-.10*dx,y:.5-.10*dy,radius:main.radius*.68,
     amount:main.amount*tuning.secondLobe*Math.min(1,age/.085),impulse:main.impulse*.85,turbulence:2.8*tuning.turbulence,
     smokeExpiry:breakup?age+.71*lifeScale:(.89+.38*age)*lifeScale}
   ];
   if(breakup&&age+.07>=settings.latestExpiry)return sources;
   for(const [i,shard] of shards.entries()){
    const flight=age/explosionStepsPerTick-shard.delay;
    const trailEnd=.24+i*.12;
    if(flight<.026+i*.018||flight>=Math.min(trailEnd,shard.life))continue;
    const point=shard.point(flight-.018);
    if(point[1]<3)continue;
    const [sx,sz]=projectShard(point,renderer.vp);
    sources.push({x:.5+(sx-x)/size,y:.5-(sz-z)/size,radius:.048+i*.013,
     amount:(1-flight/trailEnd)*1.25*tuning.shardSmoke,smoke:15,heat:1.6,fuel:0,impulse:1.4,lift:0,expansion:.8,
     turbulence:1.15*tuning.turbulence,hue:(settings.rainbowPhase+i*.42)%1,
     smokeExpiry:breakup?age+(.45+i*.11)*lifeScale:(1.12+i*.26+.22*age)*lifeScale});
   }
   return sources;
  };
  return {x,z,size,source,duration,settings};
 }

 function emit(renderer,x,z,radius,fragments=[],{tuning=defaults,random,paleSmoke=false}={}){
  const blast=makeBlast(renderer,x,z,radius,fragments,tuning,random);
  const stepsPerTick=paleSmoke?explosionStepsPerTick*.75:explosionStepsPerTick;
  return play(renderer.canvas,x,z,blast.size,blast.source,
   {duration:blast.duration,colored:true,stepsPerTick,settings:blast.settings,flash:true,
    edgeSoftness:tuning.edgeSoftness,fadeWidth:tuning.fadeWidth,paleSmoke});
 }

 const dormantBlast=sourceAt('explosion',.5,0);
 function sharedSources(field,time){
  field.bursts=field.bursts.filter(burst=>time-burst.started<.5);
  field.slot.settings.shocks=field.bursts.slice(-MAX_EMITTERS).flatMap(burst=>{
   const radius=.035+burst.shockSpeed*(time-burst.started),reach=burst.shockReach;
   if(radius>=reach)return [];
   const strength=burst.shockStrength*(1-Math.max(0,(radius-.095)/(reach-.095)));
   return [{x:.5+burst.x/sharedSize,y:.5-burst.z/sharedSize,radius,strength}];
  });
  const pending=field.bursts.length;
  const first=pending?field.next++%pending:0,sources=[];
  const batches=Array.from({length:pending},(_,i)=>{
   const burst=field.bursts[(first+i)%pending],scale=burst.size/sharedSize;
   return burst.shockOnly?[]:burst.source(time-burst.started).filter(source=>source.amount>0).map(source=>({
    ...source,x:.5+burst.x/sharedSize+(source.x-.5)*scale,y:.5-burst.z/sharedSize+(source.y-.5)*scale,
    radius:source.radius*scale,impulse:source.impulse*scale,turbulence:source.turbulence*scale,
    smokeExpiry:source.smokeExpiry*burst.lifeScale+burst.started,rainbowPhase:burst.settings.rainbowPhase,
    latestExpiry:burst.settings.latestExpiry*burst.lifeScale+burst.started,hue:burst.hue,paleSmoke:burst.paleSmoke
   }));
  });
  const missile=takeMissileSource(time);
  if(missile)sources.push(missile);
  // Leave one emitter available for a continuous trail, even during a volley.
  while(field.trails.length){
   const trail=field.trails.shift();
   if(time-trail.queued>.18)continue;
   sources.push(trail.source);
   break;
  }
  // Give each burst a turn before spending the spare slots on secondary lobes.
  for(let lobe=0;lobe<2&&sources.length<MAX_EMITTERS;lobe++){
   if(lobe===1)while(sources.length<MAX_EMITTERS){
    const missile=takeMissileSource(time);
    if(!missile)break;
    sources.push(missile);
   }
   for(const batch of batches){
    if(batch[lobe])sources.push(batch[lobe]);
    if(sources.length===MAX_EMITTERS)break;
   }
  }
  while(sources.length<MAX_EMITTERS&&field.trails.length){
   const trail=field.trails.shift();
   if(time-trail.queued<=.18)sources.push(trail.source);
  }
  return sources.length?sources:[dormantBlast];
 }

 function ensureShared(renderer,settings,duration){
  if(!shared?.slot.source){
   const field={slot:null,bursts:[],trails:[],next:0};
   const result=play(renderer.canvas,0,0,sharedSize,time=>sharedSources(field,time),
    {duration,colored:true,stepsPerTick:sharedStepsPerTick,settings:{...settings,sharedPigment:true},
     edgeSoftness:defaults.edgeSoftness,fadeWidth:defaults.fadeWidth,sharedField:true});
   if(!result)return result;
   field.slot=slots.find(slot=>slot.sharedField&&slot.source);
   shared=field;
  }
  return true;
 }

 function emitShared(renderer,x,z,radius,{random,paleSmoke=false,shockOnly=false,hue,seconds}={}){
  const profile=blastProfiles[blastMode];
  const tuning={...defaults,thrust:defaults.thrust*profile.thrustScale,expansion:defaults.expansion*profile.expansionScale};
  const blast=makeBlast(renderer,x,z,radius,[],tuning,random);
  blast.size*=profile.sourceScale;
  const lifeScale=seconds>0?seconds*sharedStepsPerTick/blast.duration:paleSmoke?1:.75;
  const ready=ensureShared(renderer,{...blast.settings,latestExpiry:0},blast.duration*lifeScale);
  if(!ready)return ready;
  const {slot,bursts}=shared,started=slot.ticks*DT;
  const shockStrength=profile.shockStrength*Math.max(.65,Math.min(1.3,radius/48));
  bursts.push({...blast,started,shockStrength,shockReach:profile.shockReach,shockSpeed:profile.shockSpeed,shockOnly,lifeScale,hue,paleSmoke});
  if(shockOnly)return true;
  slot.flash=true;
  slot.flashAt=started;
  slot.duration=Math.max(slot.duration,started+blast.duration*lifeScale);
  slot.settings.latestExpiry=Math.max(slot.settings.latestExpiry,started+blast.settings.latestExpiry*lifeScale);
  return true;
 }

 const plumeDefaults=Object.freeze({rise:2.2,turbulence:.55,lifetime:3,width:14});
 function emitTrail(renderer,point,kind,hue,previous,plume=plumeDefaults){
  const fade=fadeSeconds(defaults)*explosionStepsPerTick;
  const foot=kind==='foot',continuous=kind==='continuous';
  const life=foot?.32:continuous?plume.lifetime*sharedStepsPerTick:.65,duration=life+fade+.22;
  const [x,z]=projectShard(point,renderer.vp);
  const u=.5+x/sharedSize,v=.5-z/sharedSize;
  if(!Number.isFinite(u)||!Number.isFinite(v)||u<.02||u>.98||v<.02||v>.98)return false;
  const [oldX,oldZ]=previous?projectShard(previous,renderer.vp):[x,z];
  if(!ensureShared(renderer,{...baseSettings,swirl:continuous?3:defaults.swirl,breakup:defaults.breakup,expiryFade:fade,latestExpiry:0},duration))
   return false;
  const {slot,trails}=shared,queued=slot.ticks*DT;
  if(continuous){
   slot.settings.rise=1;
   slot.settings.cooling=.5;
  }
  if(trails.length>=20)trails.shift();
  trails.push({queued,source:{x:.5+oldX/sharedSize,y:.5-oldZ/sharedSize,sweepX:(x-oldX)/sharedSize,sweepY:(oldZ-z)/sharedSize,
   radius:(continuous?plume.width:foot?20:29)/sharedSize,amount:foot?1.4:1.5,
   smoke:continuous?10:foot?12:15,heat:continuous?plume.rise*3:0,fuel:0,impulse:continuous?.025:.14,
   jetX:continuous?plume.turbulence*(.35*Math.sin(queued*.95)+.08*Math.sin(queued*2.1)):0,
   lift:continuous?plume.rise:.05,expansion:0,turbulence:continuous?plume.turbulence*.12:.12,
   cooling:continuous?.5:dormantBlast.cooling,rise:continuous?1:dormantBlast.rise,hue,smokeExpiry:queued+life,latestExpiry:queued+life+.22}});
  slot.settings.latestExpiry=Math.max(slot.settings.latestExpiry,queued+life+.22);
  slot.duration=Math.max(slot.duration,queued+duration);
  return true;
 }

 // Each projectile contributes one swept nozzle segment per fluid step.
 // The accumulated path survives differences between render and solver cadence.
 function emitMissile(renderer,projectile,previous,point,forward,size){
  if(!initialize(renderer.canvas))return;
  const end=projectShard(point,renderer.vp);
  if(!end.every(Number.isFinite)||Math.max(Math.abs(end[0]),Math.abs(end[1]))>sharedSize*.48)return;
  const fade=fadeSeconds(defaults)*explosionStepsPerTick,life=2.1*sharedStepsPerTick;
  if(!ensureShared(renderer,{...baseSettings,swirl:5,breakup:defaults.breakup,expiryFade:fade,latestExpiry:0},life+fade))return;
  const {slot}=shared;
  slot.settings.rise=1;
  slot.settings.cooling=.7;
  const pending=missileEmitters.get(projectile);
  const from=previous?(pending?.from??projectShard(previous,renderer.vp)):end;
  const ahead=projectShard(forward,renderer.vp);
  const dx=ahead[0]-end[0],dy=end[1]-ahead[1],length=Math.hypot(dx,dy)||1;
  missileEmitters.set(projectile,{from,end,dx:dx/length,dy:dy/length,size,tick:slot.ticks});
  const now=slot.ticks*DT;
  slot.settings.latestExpiry=Math.max(slot.settings.latestExpiry,now+life);
  slot.duration=Math.max(slot.duration,now+life+fade);
 }

 function takeMissileSource(time){
  for(const [projectile,jet] of missileEmitters){
   missileEmitters.delete(projectile);
   if(time-jet.tick*DT>.18)continue;
   const [x,z]=jet.from,[endX,endZ]=jet.end;
   const sweepX=(endX-x)/sharedSize,sweepY=(z-endZ)/sharedSize;
   // The jet pushes backward, with a small side-to-side motion in nozzle coordinates.
   const drift=.08*Math.sin(time*3.6+(endX+endZ)*.025);
   return {
    x:.5+x/sharedSize,y:.5-z/sharedSize,sweepX,sweepY,
    radius:(gpu?14:20)*jet.size/sharedSize,amount:1,
    smoke:16,heat:3.4,fuel:0,impulse:.025,lift:-1.2*jet.dy+drift*jet.dx,
    jetX:-1.2*jet.dx-drift*jet.dy,expansion:.08,turbulence:.08,
    paleSmoke:true,cooling:.7,rise:1,smokeExpiry:time+2.1*sharedStepsPerTick,
    latestExpiry:time+2.1*sharedStepsPerTick
   };
  }
  return null;
 }

 function upload(texture,data,n){
  gl.bindTexture(gl.TEXTURE_2D,texture);
  gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,n,n,gl.RGBA,gl.FLOAT,data);
 }

 function advanceSlot(slot,steps){
  const {solver}=slot;
  for(let i=0;i<steps&&slot.ticks*DT<slot.duration;i++){
   const age=slot.ticks*DT;
   solver.step(slot.source(age),slot.settings,age);
   slot.ticks++;
  }
  if(slot.ticks*DT>=slot.duration){slot.source=null;return;}
  if(!gpu){
   gl.activeTexture(gl.TEXTURE0);
   upload(slot.textures[0],solver.material,solver.n);
   if(slot.sharedField||slot.ticks*DT<=1.5)upload(slot.textures[1],solver.velocity,solver.n);
   if(slot.colored)upload(slot.textures[2],solver.dye,solver.n);
  }
 }
 function update(dt){
  if(!Number.isFinite(dt)||dt<0)return;
  if(gl?.isContextLost()){dispose();return;}
  try{stepSmoke(dt);}
  catch(error){recoverSmoke(error);}
 }

 function recoverSmoke(error){
  if(layer)layer.style.display='none';
  dispose();
  console.warn('烟雾模拟已重置',error);
 }

 function stepSmoke(dt){
  if(!slots.some(slot=>slot.source))return;
  budget=Math.min(budget+dt,2*DT);
  gl.disable(gl.BLEND);
  while(budget>=DT){
   budget-=DT;
   for(const slot of slots){
    if(!slot.source)continue;
    // Accumulate fractional playback rates while keeping the solver step fixed.
    const stepBudget=slot.stepsPerTick+slot.stepRemainder;
    const steps=Math.floor(stepBudget);
    slot.stepRemainder=stepBudget-steps;
    advanceSlot(slot,steps);
   }
  }
  if(!slots.some(slot=>slot.source))clear();
 }

 function draw(renderer){
  if(gl?.isContextLost()){dispose();return;}
  if(!slots.some(slot=>slot.source&&slot.ticks)){
   if(layer)layer.style.display='none';
   return;
  }
  try{drawSmoke(renderer);}
  catch(error){recoverSmoke(error);}
 }

 function drawSmoke(renderer){
  const {canvas,vp}=renderer;
  const far=blastMode==='far';
  const scale=Math.min(1,(far?600:420)/canvas.width,(far?1150:900)/canvas.height);
  const width=Math.max(1,Math.round(canvas.width*scale)),height=Math.max(1,Math.round(canvas.height*scale));
  if(layer.width!==width||layer.height!==height){layer.width=width;layer.height=height;}
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);
  gl.clearColor(0,0,0,0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
  for(const slot of slots){
   if(!slot.source||!slot.ticks)continue;
   const {x,z,size,duration,solver,colored,flash,flashAt,stepsPerTick,edgeSoftness,fadeWidth,settings,sharedField,paleSmoke}=slot;
   const age=slot.ticks*DT;
   const openingFlash=flash?Math.min(1,Math.max(0,(.13-(age-flashAt)/stepsPerTick)/.065)):0;
   const [material,velocity,dye]=gpu?[solver.material,solver.velocity,solver.dye]:slot.textures;
   compositor.draw(material,0,0,width,height,sharedField||age<=1.5?velocity:null,colored?dye:null,
    {vp,x,y:planeHeight,z,size,openingFlash,age,edgeSoftness,fadeWidth,paleSmoke,sharedPigment:sharedField,physicalExpiry:settings.breakup>0,
     opacity:settings.breakup>0?1:Math.min(1,Math.max(0,(duration-age)/(.22*fadeWidth)))});
  }
  layer.style.display='';
 }

 function remainingSeconds(){
  let remaining=0;
  for(const slot of slots)if(slot.source)remaining=Math.max(remaining,(slot.duration-slot.ticks*DT)/slot.stepsPerTick);
  return remaining;
 }

 globalThis.EmberExplosions={emit,emitShared,emitTrail,emitMissile,clearMissile,play,update,draw,clear,dispose,defaults,plumeDefaults,defaultSeed,createRandom,blastFragments,
  get blastMode(){return blastMode;},setBlastMode,
  fadeSeconds,playbackSeconds,remainingSeconds};
 window.addEventListener('pagehide',dispose);
})();

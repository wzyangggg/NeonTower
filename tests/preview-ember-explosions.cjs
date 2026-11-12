const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const path=require('node:path');

(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:4173/?mapseed=elevator-01');
  await page.waitForFunction(()=>window.HexMap?.ready);
  await page.evaluate(()=>{
   // Exercise the isolated comparison solver independently of the game's shared routing.
   ParticleSmoke.emit=(...args)=>EmberExplosions.emit(...args);
   reset();
   ElectricEditor.reset();
   testMode=true; // Enter the actual battle renderer without the opening draft UI.
   startWave();
   testMode=false;
  });

  const blast=await page.evaluate(()=>{
   paused=true;
   enemies=[];shots=[];bullets=[];
   const proto=EmberLab.GpuFluid.prototype;
   const {reset,dispose,step}=proto;
   const tracked=window.emberTest={resets:[],disposed:[],last:null};
   proto.reset=function(){tracked.resets.push(this);return reset.call(this);};
   proto.dispose=function(){tracked.disposed.push(this);return dispose.call(this);};
   proto.step=function(source,settings,time){
    tracked.last=this;tracked.settings=settings;
    tracked.sources?.push(source);
    return step.call(this,source,settings,time);
   };
   const x=p.x+72,y=p.y-105;
   spawnExplosionFX(x,y,26);
   const positions=()=>{
    const layer=$('ember-smoke'),gl=layer.getContext('webgl2');
    const pixels=new Uint8Array(layer.width*layer.height*4);
    gl.readPixels(0,0,layer.width,layer.height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
    let opacitySum=0,weight=0,cx=0,cy=0,white=0,covered=0,mask=0;
    const colors=[0,0,0];
    for(let i=0;i<pixels.length;i+=4){
     const r=pixels[i],g=pixels[i+1],b=pixels[i+2],a=pixels[i+3];
     opacitySum+=a;
     if(a<20)continue;
     covered++;
     mask=(Math.imul(mask,31)+i+a)|0;
     weight+=a;
     cx+=a*((i/4)%layer.width+.5);
     cy+=a*(layer.height-Math.floor(i/4/layer.width)-.5);
     if(r>225&&g>219&&b>200)white++;
     const max=Math.max(r,g,b);
     if(max-Math.min(r,g,b)>24)colors[max===r?0:max===g?1:2]++;
    }
    return {x:cx/weight*canvas.clientWidth/layer.width,y:cy/weight*canvas.clientHeight/layer.height,
     white,weight,opacitySum,covered,mask,colors,glError:gl.getError()};
   };
   tracked.positions=positions;
   tracked.sources=[];
   ParticleSmoke.update(EmberLab.DT);
   const [firstSource]=tracked.sources[0],{swirl,noiseX,noiseY,rainbowPhase,breakup,expiryFade}=tracked.settings;
   tracked.sources=null;
   const random=EmberExplosions.createRandom(54817810);
   random();
   const seeded=noiseX===random()*2*Math.PI&&noiseY===random()*2*Math.PI&&rainbowPhase===random();
   draw();
   const center=renderer.screenPoint(x-325,16,(y-300)*1.06);
   const hot=positions();
   renderer.cameraJolt(24,-12);
   EmberExplosions.draw(renderer);
   const moved=positions();
   draw();
   return {center,hot,moved,scene:state,seeded,swirl,breakup,expiryFade,
    impulse:firstSource.impulse,expansion:firstSource.expansion,turbulence:firstSource.turbulence};
  });
  assert.equal(blast.scene,'combat');
  assert.equal(blast.hot.glError,0);
  assert.ok(Math.hypot(blast.hot.x-blast.center.x,blast.hot.y-blast.center.y)<8,JSON.stringify(blast));
  assert.ok(Math.abs(blast.moved.x-blast.hot.x-24)<2&&Math.abs(blast.moved.y-blast.hot.y+12)<2);
  assert.ok(blast.hot.white>25,JSON.stringify(blast.hot));
  assert.ok(blast.seeded&&blast.swirl===10.5&&blast.breakup===1.4);
  assert.ok(Math.abs(blast.expiryFade-.816)<1e-6&&Math.abs(blast.impulse-10.5)<1e-6
   &&Math.abs(blast.expansion-5.67)<1e-6&&Math.abs(blast.turbulence-.6)<1e-6);
  if(process.env.EMBER_SCREENSHOTS)await page.screenshot({path:path.join(process.env.EMBER_SCREENSHOTS,'ember-blast.png')});

  const lifecycle=await page.evaluate(()=>{
   const tracked=window.emberTest,layer=$('ember-smoke');
   const total=Math.ceil(EmberExplosions.playbackSeconds(EmberExplosions.defaults)/EmberLab.DT);
   for(let i=0;i<7;i++)ParticleSmoke.update(EmberLab.DT);
   draw();
   const smoke=tracked.positions();
   for(let i=8;i<total-1;i++)ParticleSmoke.update(EmberLab.DT);
   const stillVisible=layer.style.display!=='none';
   ParticleSmoke.update(EmberLab.DT);
   const hidden=layer.style.display==='none';
   const source={x:p.x-65,y:p.y-85,originX:p.x-200,originY:p.y-85,blastRadius:50,damage:1,source:'weapon'};
   explodeFriendlyRocket({...source},[]);
   const rocket=explosionFX.at(-1);
   explodeFriendlyRocket({...source,x:p.x+85,towerMissile:true},[]);
   const tower=explosionFX.at(-1);
   ParticleSmoke.update(EmberLab.DT);
   draw();
   return {smoke,total,stillVisible,hidden,rocket:rocket.particleSmoke,tower:tower.particleSmoke,
    reused:tracked.resets[0]===tracked.resets[1],pool:new Set(tracked.resets).size,sameLayer:layer===$('ember-smoke')};
  });
  assert.ok(lifecycle.smoke.colors.every(count=>count>20),JSON.stringify(lifecycle.smoke));
  assert.deepEqual({...lifecycle,smoke:undefined},{smoke:undefined,total:44,stillVisible:true,hidden:true,rocket:true,tower:true,reused:true,pool:2,sameLayer:true});

  const variation=await page.evaluate(()=>{
   const tracked=window.emberTest,x=p.x-325+45,z=(p.y-380)*1.06,radius=42;
   const sample=(start,frames=8)=>{
    ParticleSmoke.clear();
    if(!start())throw Error('Cannot start blast');
    for(let i=0;i<frames;i++)ParticleSmoke.update(EmberLab.DT);
    draw();
    return {pixels:tracked.positions(),settings:tracked.settings};
   };
   const emit=()=>EmberExplosions.emit(renderer,x,z,radius);
   const sources=tracked.sources=[];
   const first=sample(emit);
   tracked.sources=null;
   const second=sample(emit);
   const source=age=>sources[Math.round(age/EmberLab.DT)];
   const original=sample(()=>EmberExplosions.play(canvas,x,z,radius*4.6*Math.sqrt(1.7),source,
    {duration:1.75,colored:true,stepsPerTick:3,settings:first.settings,edgeSoftness:EmberExplosions.defaults.edgeSoftness}));
   const smokeSample=paleSmoke=>{
    const broadFrame=paleSmoke?11:8,fadeFrame=paleSmoke?27:20;
    let duration;
    const {pixels}=sample(()=>{
     const random=EmberExplosions.createRandom(54817810);
     const emitted=EmberExplosions.emit(renderer,x,z,radius,[],{random,paleSmoke});
     duration=EmberExplosions.remainingSeconds();
     return emitted;
    },broadFrame);
    for(let i=broadFrame;i<fadeFrame;i++)ParticleSmoke.update(EmberLab.DT);
    draw();
    const fadingPixels=tracked.positions();
    const newEnd=Math.ceil(duration/EmberLab.DT);
    for(let i=fadeFrame;i<newEnd;i++)ParticleSmoke.update(EmberLab.DT);
    return {pixels,duration,fadingPixels,expired:EmberExplosions.remainingSeconds()===0};
   };
   return {first,second,areaRatio:first.pixels.covered/original.pixels.covered,
    rainbow:smokeSample(false),pale:smokeSample(true)};
  });
  assert.notEqual(variation.first.settings.noiseX,variation.second.settings.noiseX);
  assert.notEqual(variation.first.settings.noiseY,variation.second.settings.noiseY);
  assert.notEqual(variation.first.pixels.mask,variation.second.pixels.mask);
  assert.ok(Math.abs(variation.areaRatio-1.2)<.1,JSON.stringify(variation));
  assert.ok(variation.rainbow.pixels.colors.every(count=>count>20),JSON.stringify(variation.rainbow));
  assert.ok(variation.pale.pixels.colors.every(count=>count===0),JSON.stringify(variation.pale));
  assert.ok(variation.pale.pixels.weight>variation.rainbow.pixels.weight*.55&&variation.pale.pixels.weight<variation.rainbow.pixels.weight*.65,JSON.stringify(variation));
  assert.ok(Math.abs(variation.pale.duration/variation.rainbow.duration-4/3)<1e-6,JSON.stringify(variation));
  assert.ok(variation.pale.fadingPixels.covered>10&&variation.pale.expired,JSON.stringify(variation.pale));
  assert.ok(Math.abs(variation.pale.fadingPixels.opacitySum/variation.rainbow.fadingPixels.opacitySum-.60)<.03,JSON.stringify(variation));

  const collision=await page.evaluate(()=>{
   const tracked=window.emberTest;
   const run=which=>{
    ParticleSmoke.clear();
    const source=age=>{
     const jets=EmberLab.sourceAt('collision',age,1.5);
     return which==='both'?jets:[jets[which]];
    };
    if(!EmberExplosions.play(canvas,p.x-325,(p.y-420)*1.06,310,source,{duration:2,colored:true}))throw Error('Cannot start jets');
    for(let i=0;i<35;i++)ParticleSmoke.update(EmberLab.DT);
    draw();
    const solver=tracked.last,{gl,n}=solver;
    const pixels=new Float32Array(n*n*4),material=new Float32Array(n*n*4);
    gl.bindFramebuffer(gl.FRAMEBUFFER,solver.fbo);
    solver.target(solver.dye);
    gl.readPixels(0,0,n,n,gl.RGBA,gl.FLOAT,pixels);
    solver.target(solver.material);
    gl.readPixels(0,0,n,n,gl.RGBA,gl.FLOAT,material);
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    let teal=0,orange=0,mixed=0,vertical=0;
    for(let row=0;row<n;row++)for(let col=0;col<n;col++){
     const i=(row*n+col)*4,a=material[i];
     if(a<.04)continue;
     const r=pixels[i]/a,b=pixels[i+2]/a;
     if(r<.2&&b>.8)teal++;
     if(r>.8&&b<.2)orange++;
     if(r>.2&&b>.2)mixed++;
     if(col>n*.35&&col<n*.65)vertical+=a*Math.abs(row/n-.46);
    }
    return {teal,orange,mixed,vertical,glError:gl.getError()};
   };
   return {teal:run(0),orange:run(1),both:run('both')};
  });
  assert.equal(collision.both.glError,0);
  assert.ok(collision.both.teal>0&&collision.both.orange>0&&collision.both.mixed>0,JSON.stringify(collision));
  assert.ok(collision.both.vertical>collision.teal.vertical+collision.orange.vertical,JSON.stringify(collision));
  if(process.env.EMBER_SCREENSHOTS)await page.screenshot({path:path.join(process.env.EMBER_SCREENSHOTS,'ember-collision.png')});

  const monsterDeath=await page.evaluate(()=>{
   ParticleSmoke.clear();
   explosionFX=[];deathBursts=[];particles=[];bullets=[];spawnQueue=[];
   timedRoom.introLeft=0;
   $('toast').classList.remove('show');
   shootTimer=999;
   const x=p.x+72,y=p.y-105;
   const target={x,y,homeX:x,homeY:y,type:'eye',r:16,hp:1,max:10,t:0,fire:999,seed:0,terrainStun:99};
   enemies=[target];
   shots=[{x,y,vx:0,vy:0,life:1,damage:5,pierce:1}];
   paused=false;
   step(.001);
   const tracked=window.emberTest;
   tracked.sources=[];
   for(let i=0;i<12;i++)ParticleSmoke.update(EmberLab.DT);
   updateDeathFeedback(12*EmberLab.DT);
   draw();
   const broad=tracked.positions();
   for(let i=0;i<15;i++)ParticleSmoke.update(EmberLab.DT);
   updateDeathFeedback(15*EmberLab.DT);
   const shardFrames=tracked.sources.filter(sources=>sources.length>2);
   tracked.sources=null;
   updateStageClear(20*EmberLab.DT);
   paused=true;
   draw();
   return {scene:state,bannerHidden:$('stage-clear').style.display==='none',killed:target.hp<=0&&!enemies.includes(target),bursts:deathBursts.length,
    emitter:deathBursts[0]?.particleSmoke,extraExplosion:explosionFX.length,
    shardFrames:shardFrames.length,
    broad,wisps:tracked.positions()};
  });
  assert.equal(monsterDeath.scene,'stageClear');
  assert.equal(monsterDeath.bannerHidden,true);
  assert.ok(monsterDeath.killed&&monsterDeath.emitter,JSON.stringify(monsterDeath));
  assert.equal(monsterDeath.bursts,1);
  assert.equal(monsterDeath.extraExplosion,0);
  assert.equal(monsterDeath.shardFrames,0);
  assert.equal(monsterDeath.wisps.glError,0);
  assert.ok(monsterDeath.broad.weight>45000&&monsterDeath.broad.colors.every(count=>count===0),JSON.stringify(monsterDeath));
  assert.ok(monsterDeath.wisps.covered>10&&monsterDeath.wisps.weight<monsterDeath.broad.weight*.35,JSON.stringify(monsterDeath));
  if(process.env.EMBER_SCREENSHOTS)await page.screenshot({path:path.join(process.env.EMBER_SCREENSHOTS,'ember-monster-death.png')});

  assert.equal(await page.evaluate(()=>{
   paused=false;
   updateStageClear(.36);
   paused=true;
   return $('stage-clear').style.display;
  }),'flex');

  const exit=await page.evaluate(()=>{
   const tracked=window.emberTest;
   returnToMainMenu();
   return {state,layer:!!$('ember-smoke'),disposed:new Set(tracked.disposed).size,glError:renderer.gl.getError()};
  });
  assert.deepEqual(exit,{state:'menu',layer:false,disposed:2,glError:0});
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({blast,lifecycle,variation,monsterDeath,collision,exit},null,2));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

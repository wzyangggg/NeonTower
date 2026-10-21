const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:900,height:900},deviceScaleFactor:2}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173/?headspring=1');await page.waitForFunction(()=>typeof updatePlayerBiped==='function');
 const result=await page.evaluate(()=>{
  reset();paused=true;state='combat';enemies=[];spawnQueue=[];$('overlay').style.display='none';p.inv=0;time=0;let g=updatePlayerBiped(),maxError=0,maxBoneError=0,groundedSamples=0,swings=new Set(),maxLift=0,stepStarts=0,maxHeightDelta=0,maxStretch=1;
  for(let i=0;i<240;i++){
   const previousHeight=g.height,before=g.legs.map(l=>({foot:[...l.foot],swing:!!l.swing}));time+=1/60;if(i<120){p.x+=Math.sin(i/30)*140/60;p.y+=Math.cos(i/30)*140/60;}g=updatePlayerBiped();maxHeightDelta=Math.max(maxHeightDelta,Math.abs(g.height-previousHeight));
   for(let j=0;j<2;j++){const l=g.legs[j],q=playerBipedLegPose(g,j);maxStretch=Math.max(maxStretch,q.stretch);if(l.swing){swings.add(j);if(!before[j].swing&&i<120)stepStarts++;}maxLift=Math.max(maxLift,l.foot[1]-4);maxError=Math.max(maxError,Math.hypot(...q.foot.map((v,k)=>v-l.foot[k])));maxBoneError=Math.max(maxBoneError,Math.abs(Math.hypot(...q.knee.map((v,k)=>v-q.hip[k]))-7.5*q.stretch),Math.abs(Math.hypot(...q.foot.map((v,k)=>v-q.knee[k]))-8.5*q.stretch));if(!before[j].swing&&!l.swing){groundedSamples++;if(l.foot.some((v,k)=>Math.abs(v-before[j].foot[k])>1e-6))throw Error('sticky support foot moved');}}
   if(g.legs.every(l=>l.swing))throw Error('both feet airborne');
  }
  const flex=g.legs.map((_,i)=>{const q=playerBipedLegPose(g,i),a=q.hip.map((v,j)=>v-q.knee[j]),b=q.foot.map((v,j)=>v-q.knee[j]);return 180-Math.acos(Math.max(-1,Math.min(1,a.reduce((n,v,j)=>n+v*b[j],0)/Math.hypot(...a)/Math.hypot(...b))))*180/Math.PI;});
  const pose=JSON.stringify(g);for(let i=0;i<20;i++)updatePlayerBiped();const frozen=pose===JSON.stringify(g),settled=g.legs.every(l=>!l.swing&&l.foot[1]===4);draw();
  // Keep a clear resting view and inspect mounted poses through the same rendering path.
  const gl=renderer.gl.getError();renderer.begin();drawPlayerBoot(0,4,0,1,'#4bdcb0');let heel=Infinity,toe=-Infinity,soleY=Infinity;for(let i=0;i<renderer.count;i+=9){heel=Math.min(heel,renderer.data[i+2]);toe=Math.max(toe,renderer.data[i+2]);soleY=Math.min(soleY,renderer.data[i+1]);}renderer.begin();drawPlayerHeadHousing(0,0);transformPlayerHead(0,0,0,0,null);liftPlayerUpperBody(0,0,0,0);let top=-Infinity;for(let i=0;i<renderer.count;i+=9)top=Math.max(top,renderer.data[i+1]);const headUnits=(top-soleY)/25;draw();return {maxStretch,stepStarts,maxHeightDelta,flex,heel,toe,headUnits,maxError,maxBoneError,groundedSamples,swings:[...swings],maxLift,frozen,settled,gl};
 });
 assert.ok(result.maxStretch>1.02&&result.maxStretch<1.6);assert.ok(result.stepStarts>4);assert.ok(result.maxHeightDelta<.15);assert.ok(result.flex.every(a=>a<30),JSON.stringify(result));assert.ok(result.heel>=-3.001&&result.toe<=6.001&&result.toe>0);assert.ok(result.headUnits>=2&&result.headUnits<=3);assert.ok(result.maxError<.001,JSON.stringify(result));assert.ok(result.maxBoneError<1e-6);assert.ok(result.groundedSamples>100&&result.swings.length===2&&result.maxLift>1.5);assert.ok(result.frozen&&result.settled);assert.equal(result.gl,0);
 const distanceTrigger=await page.evaluate(()=>{reset();paused=true;state='combat';time=0;let g=updatePlayerBiped(),early=0;for(let i=0;i<24;i++){time+=1/30;p.x+=.25;g=updatePlayerBiped();if(g.legs.some(l=>l.swing))early++;}time+=1/30;p.x+=2;g=updatePlayerBiped();return {early,triggered:g.legs.some(l=>l.swing)};});assert.equal(distanceTrigger.early,0);assert.equal(distanceTrigger.triggered,true);console.log('Distance-driven release: no step below 7 units after 0.8s, immediate step above threshold passed');
 const transitions=await page.evaluate(()=>[30,60,120].map(fps=>{reset();paused=true;state='combat';$('overlay').style.display='none';time=0;let g=updatePlayerBiped(),min=19.8,max=19.8,maxVerticalSpeed=0;for(const [seconds,vx,vz]of [[.12,140,0],[.14,0,0],[.45,-140,0],[.2,0,0],[.6,0,140],[.7,0,0]])for(let i=0;i<Math.ceil(seconds*fps);i++){const before=g.height;time+=1/fps;p.x+=vx/fps;p.y+=vz/fps/1.06;g=updatePlayerBiped();min=Math.min(min,g.height);max=Math.max(max,g.height);maxVerticalSpeed=Math.max(maxVerticalSpeed,Math.abs(g.height-before)*fps);}return {fps,min,max,maxVerticalSpeed,end:g.height};}));assert.ok(transitions.every(t=>t.min>=19.1999&&t.max<=19.8001&&t.maxVerticalSpeed<8.5&&Math.abs(t.end-19.8)<.001));console.log('Repeated brief starts/stops at 30/60/120fps passed',JSON.stringify(transitions));
 const mounted=await page.evaluate(()=>{
  const checks=[];
  for(const id of ['warpstar','neonsword','vinyl','skateboard','tentacle','spider','ufo','sharkblimp','smallplane']){
   reset();paused=true;state='combat';time=0;shoes={id,tier:1};p.x=325;p.y=300;p.inv=0;enemies=[];spawnQueue=[];let g=updatePlayerBiped(),error=0;
   for(let i=0;i<120;i++){time+=1/60;p.x+=Math.cos(i/20)*2;p.y+=Math.sin(i/20)*2;draw();g=playerBipedGaits.get(p);
    for(let j=0;j<2;j++){const l=g.legs[j];if(l.swing)throw Error(id+' rider walking');error=Math.max(error,Math.abs(l.foot[0]-g.x-(j===0?-6:6)),Math.abs(l.foot[1]-4),Math.abs(l.foot[2]-g.z));}
   }
   checks.push({id,error,gl:renderer.gl.getError()});
  }
  return checks;
 });assert.ok(mounted.every(m=>m.error<1e-6&&m.gl===0));console.log('Mounted movement Edge/WebGL passed',JSON.stringify(mounted));
 await page.evaluate(()=>{shoes=null;p.x=325;p.y=350;time+=1;p.inv=0;draw();});
 await page.screenshot({path:'tests/player-biped-front.png'});
 // Frame the player with the exact current camera projection for a readable detail capture.
 const clip=await page.evaluate(()=>{const r=canvas.getBoundingClientRect(),m=renderer.vp,v=[p.x-325,40,(p.y-300)*1.06,1],q=[0,1,2,3].map(row=>v.reduce((a,n,j)=>a+m[j*4+row]*n,0)),cx=r.left+(q[0]/q[3]+1)*r.width/2,cy=r.top+(1-q[1]/q[3])*r.height/2;return {x:Math.max(0,cx-70),y:Math.max(0,cy-65),width:140,height:130};});await page.screenshot({path:'tests/player-biped-detail.png',clip});
 for(const [width,height]of [[390,680],[390,844],[1280,900]]){await page.setViewportSize({width,height});await page.evaluate(()=>draw());await page.screenshot({path:`tests/player-biped-${width}x${height}.png`});}
 const mounts=await page.evaluate(()=>{const checks=[];for(const id of ['spider','ufo','sharkblimp','smallplane','skateboard','tentacle']){shoes={id,tier:1};time+=.2;draw();checks.push({id,seated:playerSeated(),gl:renderer.gl.getError()});}shoes=null;time+=.2;draw();return checks;});assert.ok(mounts.every(m=>m.gl===0));assert.deepEqual(errors,[]);console.log('Player biped Edge/WebGL passed',JSON.stringify({result,mounts}));
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});

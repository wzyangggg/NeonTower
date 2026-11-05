const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?electriclab=1');await page.waitForFunction(()=>window.ElectricEditor?.editing);await page.evaluate(()=>{window.requestAnimationFrame=()=>0;});await page.waitForTimeout(100);
 await page.evaluate(()=>{ElectricEditor.close();reset();sound=false;state='combat';paused=false;timedRoom={remaining:999,duration:999,nextWaveAt:999};enemies=[];enemyTransports=[];spawnQueue=[];shots=[];particles=[];p.x=325;p.y=300;p.inv=0;});
 for(const [width,height]of [[390,844],[320,568],[1280,900]]){
  await page.setViewportSize({width,height});
  for(const kind of ['cash','medical','freeze_bomb','laser_bomb','missile_bomb','tower']){
   const result=await page.evaluate(kind=>{particles=[];pickupFeedback(kind);updateParticles(.065);let white=0;const original=renderer.hitModel;renderer.hitModel=function(...args){white=Math.max(white,args[4]);return original.apply(this,args);};draw();renderer.hitModel=original;return {white,count:particles.filter(q=>q.pickupSpark).length,alpha:renderer.transparentCount,gl:renderer.gl.getError()};},kind);
   assert.ok(result.white>.9&&result.alpha>0);assert.equal(result.count,22);assert.equal(result.gl,0);
   if(width===390)await page.screenshot({path:`tests/pickup-${kind}-flash.png`});
   await page.evaluate(()=>{updateParticles(.18);draw();});
   if(kind==='cash')await page.screenshot({path:`tests/pickup-cash-expand-${width}x${height}.png`});
  }
 }
 await page.evaluate(()=>{particles=[];pickupFeedback('medical');updateParticles(.1);renderer.initializeGPU();draw();});assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);
 assert.deepEqual(errors,[]);console.log('Pickup feedback real Edge/WebGL: six palettes, body white mix, 22 sparks, alpha geometry, three viewports and GPU restoration passed.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

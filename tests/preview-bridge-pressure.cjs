const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?mapseed=elevator-01');await page.waitForFunction(()=>window.HexMap?.ready);
 await page.evaluate(()=>{window.requestAnimationFrame=()=>0;});await page.waitForTimeout(100);
 const metrics=await page.evaluate(()=>{
  function run(stream){
   reset();ElectricEditor.reset();RoomReady.cancel();testMode=true;floor=5;paused=false;startWave();step(1);shootTimer=999;p.inv=999;
   const reinforce=updateBridgeReinforcements;if(!stream)updateBridgeReinforcements=()=>{};
   for(let i=0;i<400;i++)step(.02);
   updateBridgeReinforcements=reinforce;paused=true;draw();
   return {ground:enemies.filter(e=>e.hp>0&&e.bridgeRoller).length,ironballs:enemies.filter(e=>e.hp>0&&e.type==='ironball').length,rolling:enemies.some(e=>e.type==='ironball'&&e.roll>0),threat:normalThreat(),cap:normalThreatLimit(),total:stageResultStats().total,queued:spawnQueue.length,types:enemies.map(e=>e.type)};
  }
  return {withoutStream:run(false),withStream:run(true)};
 });
 assert.ok(metrics.withStream.ground>metrics.withoutStream.ground,JSON.stringify(metrics));
 assert.ok(metrics.withStream.ground>=8&&metrics.withStream.ironballs>=2&&metrics.withStream.rolling);
 assert.ok(metrics.withStream.threat<=metrics.withStream.cap&&metrics.withStream.total===60);
 for(const size of [{width:390,height:844},{width:320,height:568},{width:1280,height:900}]){
  await page.setViewportSize(size);await page.evaluate(()=>draw());assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);
  await page.screenshot({path:`tests/bridge-pressure-${size.width}.png`});
 }
 const frozen=await page.evaluate(()=>JSON.stringify({enemies,spawnQueue,timedRoom}));await page.evaluate(()=>step(30));
 assert.equal(await page.evaluate(()=>JSON.stringify({enemies,spawnQueue,timedRoom})),frozen);
 await page.setViewportSize({width:390,height:844});
 const loot=await page.evaluate(()=>{
  const mob=enemies.filter(e=>e.bridgeRoller).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
  mob.hp=.1;const before=cash;paused=false;
  shots=[{beam:true,arc:true,radial:true,arcTargets:[mob],originX:p.x,originY:p.y,x:p.x,y:p.y,vx:0,vy:0,life:.1,damage:999,pierce:Infinity,hitTargets:new Set()}];
  step(.01);paused=true;updateParticles(.16);draw();
  return {expected:enemyKillReward(mob),paid:cash-before,gems:particles.filter(q=>q.cashGem).length};
 });assert.equal(loot.paid,loot.expected);assert.ok(loot.gems>0);await page.screenshot({path:'tests/bridge-gold-390.png'});
 assert.deepEqual(errors,[]);console.log('Bridge pressure real Edge/WebGL:',JSON.stringify(metrics));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});

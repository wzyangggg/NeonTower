const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?mapseed=spider-pressure');await page.waitForFunction(()=>window.HexMap?.ready);
 await page.evaluate(()=>{window.requestAnimationFrame=()=>0;});await page.waitForTimeout(100);
 const result=await page.evaluate(()=>{
  reset();ElectricEditor.reset();RoomReady.cancel();TileLab.leave();testMode=true;floor=1;startWave();p.x=bridgeRoom.ends[0].entry.x;p.y=bridgeRoom.ends[0].entry.y;p.inv=999;step(1);
  enemies=enemies.filter(e=>e.type==='crawler');spawnQueue=spawnQueue.filter(e=>e.type==='crawler');timedRoom.nextWaveAt=999;
  let firstContact=null,elapsed=0;const oldHurt=hurt;hurt=source=>{if(source?.type==='crawler'&&firstContact===null)firstContact=elapsed;oldHurt(source);};
  const health=enemies[0].max;
  try{for(let i=0;i<1800;i++){elapsed=i*.01;step(.01);if(enemies.some(e=>e.hp>0&&!HexMap.canStand(bridgeRoom.surface,e.x,e.y,6.99)))throw Error('spider left bridge');}}finally{hurt=oldHurt;}
  paused=true;$('toast').classList.remove('show');draw();
  return {health,firstContact,kills,alive:enemies.filter(e=>e.hp>0).length,speed:STARTER_ENEMIES.crawler.speed};
 });
 assert.equal(result.health,3.6);assert.equal(result.speed,108.16);assert.ok(result.firstContact>0&&result.firstContact<18&&result.alive>0);
 for(const [width,height]of [[390,844],[320,568],[1280,900]]){await page.setViewportSize({width,height});await page.evaluate(()=>draw());assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);await page.screenshot({path:`tests/spider-pressure-${width}.png`});}
 const frozen=await page.evaluate(()=>JSON.stringify({enemies,spawnQueue}));await page.evaluate(()=>step(10));assert.equal(await page.evaluate(()=>JSON.stringify({enemies,spawnQueue})),frozen);
 assert.deepEqual(errors,[]);console.log('Spider pressure real Edge/WebGL:',JSON.stringify(result));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});

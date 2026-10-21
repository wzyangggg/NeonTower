const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>window.HexMap?.ready);await page.locator('#start').click();await page.waitForFunction(()=>state==='combat');
 const results=await page.evaluate(()=>{
  paused=true;time=-1;p.x=325;p.y=300;StreetScene.lighting(renderer);renderer.resize();
  const sample=()=>{StreetScene.lighting(renderer);renderer.resize();return {x:-renderer.vp[12]/renderer.vp[0],z:-renderer.vp[13]/renderer.vp[9],scale:renderer.cameraScale};};
  time=0;const center=sample();p.x+=100;p.y+=80;time=1/60;const first=sample();for(let i=2;i<=120;i++){time=i/60;sample();}const settled=sample();
  const stable=JSON.stringify(sample())===JSON.stringify(settled);p.x=10000;p.y=10000;for(let i=121;i<=300;i++){time=i/60;sample();}const limit=sample();
  time=0;p.x=325;p.y=300;const reset=sample();for(let i=1;i<=240;i++){time=i/60;sample();}const back=sample();
  p.x=395;p.y=350;enemies=[];for(let i=241;i<=360;i++){time=i/60;sample();}shake=0;draw();
  return {center,first,settled,stable,limit,reset,back};
 });
 assert.ok(results.center.scale<.95);assert.ok(results.first.x>0&&results.first.x<results.settled.x/4,'follow eases into motion');
 assert.ok(Math.abs(results.settled.x-22)<.2&&Math.abs(results.settled.z-80*1.06*.18)<.2,'camera follows a small fraction of player motion');
 assert.ok(results.stable,'paused game time freezes camera');assert.ok(results.limit.x<=48.001&&results.limit.z<=30.001,'follow remains bounded');
 assert.ok(Math.abs(results.reset.x)<1e-5&&Math.abs(results.reset.z)<1e-5&&Math.abs(results.back.x)<1e-5,'restart recenters without carrying old motion');
 for(const [width,height]of [[390,844],[390,680],[1280,900]]){await page.setViewportSize({width,height});await page.evaluate(()=>draw());await page.screenshot({path:`tests/hex-camera-follow-${width}x${height}.png`});}
 assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);assert.deepEqual(errors,[]);
 console.log('Hex camera: closer view, smooth partial follow, bounded travel, pause/reset stability and 3 viewports passed.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

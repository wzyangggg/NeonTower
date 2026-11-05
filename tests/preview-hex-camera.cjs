const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?mapseed=elevator-01');await page.waitForFunction(()=>window.HexMap?.ready);await page.locator('#start').click();await page.waitForFunction(()=>ElectricEditor.preparing);await page.evaluate(()=>{testMode=true;ElectricEditor.reset();paused=false;startWave();});await page.waitForFunction(()=>state==='combat');
 const results=await page.evaluate(()=>{
  paused=true;const savedBridge=bridgeRoom;bridgeRoom=null;time=-1;p.x=325;p.y=300;StreetScene.lighting(renderer);renderer.resize();
  const sample=()=>{StreetScene.lighting(renderer);renderer.resize();return {x:-renderer.vp[12]/renderer.vp[0],z:-renderer.vp[13]/renderer.vp[9],scale:renderer.cameraScale};};
  time=0;const center=sample();p.x+=100;p.y+=80;time=1/60;const first=sample();for(let i=2;i<=120;i++){time=i/60;sample();}const settled=sample();
  const stable=JSON.stringify(sample())===JSON.stringify(settled);p.x=10000;p.y=10000;for(let i=121;i<=300;i++){time=i/60;sample();}const limit=sample();
  time=0;p.x=325;p.y=300;const reset=sample();for(let i=1;i<=240;i++){time=i/60;sample();}const back=sample();
  p.x=395;p.y=350;enemies=[];for(let i=241;i<=360;i++){time=i/60;sample();}shake=0;draw();
  bridgeRoom=savedBridge;return {center,first,settled,stable,limit,reset,back};
 });
 assert.equal(results.center.scale,1);assert.ok(results.first.x>0&&results.first.x<results.settled.x/4,'follow eases into motion');
 assert.ok(Math.abs(results.settled.x-100)<.6&&Math.abs(results.settled.z-80*1.06)<.6,'camera follows the player smoothly');
 assert.ok(results.stable,'paused game time freezes camera');assert.ok(results.limit.x>9000&&results.limit.z>9000,'follow has no old artificial clamp');
 assert.ok(Math.abs(results.reset.x)<1e-5&&Math.abs(results.reset.z)<1e-5&&Math.abs(results.back.x)<1e-5,'restart recenters without carrying old motion');
 for(const direction of ['left','right','top','bottom']){
  const edge=await page.evaluate(direction=>{const order=(a,b)=>direction==='left'?HexMap.x(a.x,a.y)-HexMap.x(b.x,b.y):direction==='right'?HexMap.x(b.x,b.y)-HexMap.x(a.x,a.y):direction==='top'?a.y-b.y:b.y-a.y,t=tiles.slice().sort(order)[0];p.x=325+HexMap.x(t.x,t.y);p.y=300+HexMap.y(t.y);enemies=[];shake=0;for(let i=0;i<240;i++){time+=1/60;StreetScene.lighting(renderer);renderer.resize();}draw();const at=renderer.screenPoint(p.x-325,4,(p.y-300)*1.06),r=canvas.getBoundingClientRect();return {safe:HexMap.canStand(tiles,p.x,p.y,7),screenX:at.x,center:r.width/2};},direction);
  assert.ok(edge.safe);assert.ok(edge.screenX>=edge.center*.22&&edge.screenX<=edge.center*1.78,'player stays in safe frame while keeping bridge visible at the '+direction+' boundary');await page.screenshot({path:`tests/hex-camera-edge-${direction}.png`});
 }
 for(const [width,height]of [[390,844],[390,680],[1280,900]]){await page.setViewportSize({width,height});await page.evaluate(()=>draw());await page.screenshot({path:`tests/hex-camera-follow-${width}x${height}.png`});}
 assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);assert.deepEqual(errors,[]);
 console.log('Hex camera: smooth full follow without bridge, pause/reset stability, safe player framing with bridge and 3 viewports passed.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?electriclab=1');await page.waitForFunction(()=>window.TileLab?.active);
 const poses=[];
 for(const [width,height]of [[390,844],[320,568],[1280,900]]){
  await page.setViewportSize({width,height});
  await page.evaluate(()=>{paused=true;ElectricEditor.reset();testMode=true;floor=1;enemies=[];startWave();paused=false;step(.35);paused=true;draw();});
  assert.equal(await page.locator('#survival-label').textContent(),'存活20秒！');
  assert.ok(await page.locator('.normal-time-track').isVisible());
  const center=await page.locator('#survival-clock').boundingBox(),viewport=await page.locator('#viewport').boundingBox();
  assert.ok(Math.abs(center.y+center.height/2-viewport.y-viewport.height/2)<2,'timer starts at screen centre');
  const large=await page.locator('#survival-label').evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
  assert.equal(large,30);await page.screenshot({path:`tests/normal-timer-center-${width}.png`});
  await page.evaluate(()=>{paused=false;step(.25);paused=true;draw();});
  const moving=await page.locator('#survival-clock').boundingBox();assert.ok(moving.y<center.y,'timer flies upward');
  await page.screenshot({path:`tests/normal-timer-moving-${width}.png`});
  await page.evaluate(()=>{paused=false;step(.4);paused=true;draw();});
  const docked=await page.locator('#survival-clock').boundingBox();assert.ok(docked.y<moving.y);
  assert.equal(await page.locator('#survival-label').evaluate(el=>parseFloat(getComputedStyle(el).fontSize)),15);
  assert.ok(await page.evaluate(()=>enemies.length===5&&timedRoom.remaining===20&&timedRoom.introLeft===0));
  await page.screenshot({path:`tests/normal-timer-${width}.png`});poses.push({width,centerY:center.y,movingY:moving.y,dockedY:docked.y});
 }
 await page.evaluate(()=>{ElectricEditor.reset();testMode=true;floor=1;enemies=[];startWave();paused=true;});
 const result=await page.evaluate(()=>{
  paused=false;step(.99);const held=timedRoom.remaining===20&&!enemies.length;step(.01);
  const started=enemies.length===5&&timedRoom.remaining===20;step(1);paused=true;draw();
  const timer=timedRoom.remaining;ElectricTiles.reset();tiles=[{x:0,y:0}];p.x=325;p.y=300;
  const f=ElectricTiles.place('shield_tower',{x:0,y:0});paused=false;ElectricTiles.update(12);paused=true;draw();
  const meshes=['ufo:shield-faces','ufo:shield-edges'].map(k=>renderer.residentMeshes.get(k)?.data);
  return {held,started,timer,shield:p.towerShieldLeft,finite:meshes.every(a=>a&&Array.from(a).every(Number.isFinite)),gl:renderer.gl.getError()};
 });assert.ok(result.held&&result.started&&result.timer===19&&result.shield===2&&result.finite&&result.gl===0,JSON.stringify(result));
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>draw());await page.screenshot({path:'tests/player-hex-shield.png'});
 const durations=await page.evaluate(()=>{const result=[];for(const f of [1,2,3,8,13,23]){floor=f;enemies=[];startWave();paused=true;result.push(timedRoom.duration);}return result;});
 assert.deepEqual(durations,[20,22,24,34,44,60]);
 assert.deepEqual(errors,[]);console.log('Normal timer and player shield WebGL preview passed:',JSON.stringify({result,poses,durations}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

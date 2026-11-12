const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?sawlab=1');await page.waitForFunction(()=>window.HexMap?.ready&&typeof sawRoom!=='undefined'&&sawRoom);assert(await page.evaluate(()=>testMode&&floor===6));
 await page.evaluate(()=>{window.requestAnimationFrame=()=>0;});await page.waitForTimeout(80);
 const initial=await page.evaluate(()=>{reset();testMode=true;floor=6;startWave({previewSawRoom:true});p.inv=999;draw();return {center:p.x===325+HexMap.x(0,0)&&p.y===300,sources:sawRoom.sources.length,enemies:enemies.length,gl:renderer.gl.getError()};});
 assert.deepEqual(initial,{center:true,sources:3,enemies:0,gl:0});await page.evaluate(()=>{step(.3);draw();});assert.equal(await page.locator('#survival-label').evaluate(el=>parseFloat(getComputedStyle(el).fontSize)),30);assert(await page.locator('.normal-time-track').isVisible());await page.screenshot({path:'tests/saw-room-warning-390x844.png'});
 const motion=await page.evaluate(()=>{const old=sawRoom.sources.map(s=>({...s.tile.flywheel}));for(let i=0;i<250;i++)step(.02);draw();return {contained:sawRoom.sources.every(s=>onFloor(s.tile.flywheel.x,s.tile.flywheel.y,DIAGONAL_SAW_RADIUS)),moved:sawRoom.sources.every((s,i)=>Math.hypot(s.tile.flywheel.x-old[i].x,s.tile.flywheel.y-old[i].y)>1),resident:renderer.residentMeshes.get('trap:saw-blade').count,gl:renderer.gl.getError()};});
 assert(motion.contained&&motion.moved&&motion.resident===3&&motion.gl===0,JSON.stringify(motion));await page.screenshot({path:'tests/saw-room-moving-390x844.png'});
 const sameSize=await page.evaluate(()=>{const t=tiles.find(t=>!t.flywheel&&!t.electricFacility&&t.x!==0);t.saw=true;draw();const mesh=renderer.residentMeshes.get('trap:saw-blade'),sizes=Array.from({length:mesh.count},(_,i)=>{const a=i*13,m=mesh.instances;return [Math.hypot(m[a],m[a+8]),m[a+5],Math.hypot(m[a+2],m[a+10])];});return {count:mesh.count,equal:sizes.every(s=>s.every(v=>Math.abs(v-1)<1e-6))};});assert.deepEqual(sameSize,{count:4,equal:true});await page.screenshot({path:'tests/saw-room-same-size-390x844.png'});
 const frozen=await page.evaluate(()=>{paused=true;const before=sawRoom.remaining,pos=sawRoom.sources[0].tile.flywheel.x;step(10);const result=sawRoom.remaining===before&&pos===sawRoom.sources[0].tile.flywheel.x;paused=false;return result;});assert(frozen);
 // Repair tower removes a blade via its existing work cycle.
 const repair=await page.evaluate(()=>{reset();testMode=true;floor=6;startWave({previewSawRoom:true});p.inv=999;step(1);const source=sawRoom.sources[0].tile,anchor=tiles.find(t=>ElectricTiles.canPlace('repair_turret',t)&&HexMap.neighbors(t.x,t.y).some(([dx,dy])=>t.x+dx===source.x&&t.y+dy===source.y)),f=ElectricTiles.place('repair_turret',anchor);ElectricTiles.update(.01);const target=f.workTarget;if(!target)return false;f.cool=.01;step(.02);return f.count===1&&!target.tile.flywheel&&tiles.filter(t=>t.flywheel?.diagonal).length===2;});
 assert(repair,'repair tower removes corridor blade');
 await page.evaluate(()=>{reset();testMode=true;floor=6;startWave({previewSawRoom:true});p.inv=999;step(3);});
 for(const size of [{width:320,height:568},{width:1280,height:900}]){await page.setViewportSize(size);await page.evaluate(()=>draw());await page.screenshot({path:`tests/saw-room-${size.width}x${size.height}.png`});}
 assert(await page.evaluate(()=>{step(100);return state==='stageClear'&&!sawRoom&&!tiles.some(t=>t.flywheel?.diagonal)&&cash===32;}));
 for(const size of [{width:390,height:844},{width:320,height:568},{width:1280,height:900}]){
  await page.setViewportSize(size);await page.evaluate(()=>{paused=false;updateStageClear(2);updateStageClear(2);paused=true;draw();});
  assert.equal(await page.locator('#result-title').textContent(),'成功存活');assert.equal(await page.locator('#result-kill-row').isVisible(),false);assert.equal(await page.locator('#result-cash').textContent(),'32');
  const title=await page.locator('#result-title').boundingBox();assert(title.x>=0&&title.x+title.width<=size.width);assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);
  await page.screenshot({path:`tests/saw-room-survived-${size.width}x${size.height}.png`});
 }
 await page.evaluate(()=>{reset();testMode=true;floor=2;p.x=400;p.y=350;startWave();});assert(await page.evaluate(()=>p.x===400&&p.y===350));
 assert.deepEqual(errors,[]);console.log('Saw corridor real Edge/WebGL passed: center, three warnings, moving resident meshes, containment, pause, survival payout/cleanup and three viewport sizes.',{initial,motion});
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

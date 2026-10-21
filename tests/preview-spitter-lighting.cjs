const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>window.HexMap?.ready);await page.locator('#start').click();await page.waitForFunction(()=>state==='combat');
 await page.evaluate(()=>{paused=true;window.requestAnimationFrame=()=>0;});await page.waitForTimeout(100);
 await page.evaluate(()=>{reset();paused=true;state='combat';floor=2;time=2;scroll=0;enemies=[];enemyTransports=[];spawnQueue=[];shootTimer=999;p.inv=0;p.x=325;p.y=310;for(const [x,y]of [[270,255],[380,280],[335,365]]){spawn({type:'spitter',side:0});Object.assign(enemies.at(-1),{x,y,homeX:x,homeY:y,fire:99,warn:false});}toast('',0);updateUI();draw();});
 const result=await page.evaluate(()=>{
  const mesh=renderer.residentMeshes.get('enemy:spitter:14:false')||[...renderer.residentMeshes.values()].find(m=>m.count===3),data=mesh.data;
  const check=()=>{draw();for(let i=0;i<enemies.length;i++){const e=enemies[i],at=i*13,dx=p.x-e.x,dz=(p.y-e.y)*1.06,len=Math.hypot(dx,dz);if(Math.abs(mesh.instances[at+2]-dx/len)>.00001||Math.abs(mesh.instances[at+10]-dz/len)>.00001)return false;}return true;};
  const initial=check();p.x+=15;p.y-=20;const follows=check();p.x=325;p.y=310;for(let i=0;i<60;i++){time+=.016;draw();}return {initial,follows,resident:data===mesh.data,finite:renderer.transparentData.subarray(0,renderer.transparentCount).every(Number.isFinite),gl:renderer.gl.getError()};
 });assert.deepEqual(result,{initial:true,follows:true,resident:true,finite:true,gl:0});
 for(const [width,height]of [[390,844],[390,680],[1280,900]]){await page.setViewportSize({width,height});await page.evaluate(()=>draw());await page.screenshot({path:`tests/spitter-lighting-${width}x${height}.png`});}
 await page.evaluate(()=>{enemies[0].warn=true;draw();});assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);
 const texture=await page.evaluate(()=>{
  const pixels=renderer.softLightPixels,handle=renderer.softLightTexture;for(let i=0;i<20;i++){time+=.016;draw();}
  const reused=renderer.softLightPixels===pixels&&renderer.softLightTexture===handle,beams=renderer.sprites.filter(s=>s.kind==='softLight');
  const colored=beams.length===18&&beams.every(s=>Math.min(...s.tint)<.2&&s.data.every(Number.isFinite));
  renderer.initializeGPU();draw();return {reused,colored,restored:renderer.softLightPixels===pixels&&!!renderer.softLightTexture&&renderer.softLightTexture!==handle,gl:renderer.gl.getError()};
 });assert.deepEqual(texture,{reused:true,colored:true,restored:true,gl:0});
 assert.deepEqual(errors,[]);console.log('Real Edge/WebGL spitter lighting: player facing/following, hover lights, resident reuse, warning variant, three viewports, no script/GL errors passed.',result);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

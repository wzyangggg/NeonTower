const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?electriclab=1');await page.waitForFunction(()=>window.TileLab?.active&&ElectricEditor.editing);
 await page.locator('.tile-lab-toolbar summary').click();await page.locator('[data-hazard="machine"]').click();
 assert.equal(await page.evaluate(()=>turrets.length===1&&turrets[0].kind==='machine'),true);
 await page.locator('.tile-lab-toolbar summary').click();await page.locator('[data-run]').click();
 await page.evaluate(()=>{window.requestAnimationFrame=()=>0;});await page.waitForTimeout(100);
 const stats=await page.evaluate(()=>{paused=true;resetTurretCooldowns();bullets=[];const t=turrets[0];for(let i=0;i<290;i++)updateTerrain(.01);draw();return {shots:bullets.length,rounds:t.rounds,meshes:['base','head','barrel'].map(n=>renderer.residentMeshes.get('machine-turret:'+n).data.length),gl:renderer.gl.getError()};});
 assert.equal(stats.shots,7);assert.equal(stats.rounds,0);assert.equal(stats.gl,0);assert.ok(stats.meshes.every(n=>n>0));
 await page.evaluate(()=>{resetTurretCooldowns();turrets[0].edge='top';turrets[0].slide=.5;syncTurretEdge(turrets[0]);turrets[0].aim=Math.atan2(p.y-turrets[0].y,p.x-turrets[0].x);turrets[0].rounds=4;turrets[0].muzzleFlash=.065;turrets[0].recoil=.095;draw();});
 for(const [width,height] of [[390,844],[390,680],[1280,900]]){await page.setViewportSize({width,height});await page.evaluate(()=>draw());await page.screenshot({path:`tests/machine-turret-${width}x${height}.png`});assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);}
 await page.evaluate(()=>{window.loss=renderer.gl.getExtension('WEBGL_lose_context');loss.loseContext();});await page.waitForTimeout(150);await page.evaluate(()=>loss.restoreContext());await page.waitForTimeout(600);await page.evaluate(()=>draw());assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);assert.ok(await page.evaluate(()=>renderer.residentMeshes.get('machine-turret:head').buffer));
 assert.deepEqual(errors,[]);console.log('Actual Edge/WebGL: UI add/run, seven shots, three Blender resident parts, three viewports, context restore and zero errors.',stats);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

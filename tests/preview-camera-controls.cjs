const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?promo=1&mapseed=camera-control');await page.waitForFunction(()=>globalThis.ElectricEditor?.preparing);
 await page.evaluate(()=>{document.getElementById('promo-panel').hidden=true;NeonPostFX.reset();Object.assign(NeonPostFX.settings,{distortion:false});NeonPostFX.refresh();});
 await page.locator('#postfx-panel > summary').click();await page.locator('.postfx-group').filter({has:page.locator('[data-setting="cameraSize"]')}).locator('summary').click();
 await page.locator('[data-setting="cameraSize"]').fill('0.7');
 await page.reload();await page.waitForFunction(()=>globalThis.ElectricEditor?.preparing);
 assert.equal(await page.evaluate(()=>NeonPostFX.settings.cameraSize),.7);
 await page.evaluate(()=>{document.getElementById('promo-panel').hidden=true;NeonPostFX.settings.distortion=false;NeonPostFX.refresh();});
 await page.mouse.move(35,205);await page.mouse.down();await page.mouse.move(95,245,{steps:12});await page.mouse.up();
 assert.ok(await page.evaluate(()=>ElectricEditor.preparing&&Math.abs(renderer.mapCamera.panX)>10),'regular preparation supports camera drag');
 await page.locator('[data-camera-reset]').click();
 const framing=await page.evaluate(()=>{
  paused=true;document.getElementById("promo-panel").hidden=true;NeonPostFX.settings.distortion=false;NeonPostFX.refresh();draw(0);
  const sample=()=>{draw(0);return {scale:renderer.cameraScale,half:renderer.halfX,basis:[...renderer.vp.slice(0,12)]};};
  const before=sample(),saved=tiles.slice();tiles.push({x:50,y:0});time+=1;const expanded=sample();tiles=saved;
  NeonPostFX.settings.cameraSize=1.4;const larger=sample();NeonPostFX.settings.cameraSize=.7;
  ElectricEditor.reset();ElectricTiles.reset();tiles=[];for(let y=-5;y<=5;y++)for(let x=-6;x<=6;x++)tiles.push({x,y});
  ElectricEditor.open();ElectricEditor.catalog(['tower']);draw(0);
  return {before,expanded,larger};
 });
 assert.deepEqual(framing.before,framing.expanded,'map extent and time never change zoom');
 assert.ok(Math.abs(framing.larger.half/framing.before.half-2)<.001,'size directly sets view width');
 async function point(c){return page.evaluate(c=>{draw(0);const a=ElectricTiles.center(c),s=renderer.screenPoint(a.x-325,4,(a.y-300)*1.06),r=canvas.getBoundingClientRect();return {x:s.x+r.left,y:s.y+r.top};},c);}
 async function pan(from,to){await page.mouse.move(from.x,from.y);await page.mouse.down();await page.mouse.move(to.x,to.y,{steps:12});await page.mouse.up();await page.waitForTimeout(80);}
 const origin=await point({x:0,y:0});await pan({x:35,y:205},{x:95,y:245});const shifted=await point({x:0,y:0});
 assert.ok(Math.abs(shifted.x-origin.x-60)<1&&Math.abs(shifted.y-origin.y-40)<1,'background drag tracks pointer');
 const empty=await point({x:-2,y:-2});await pan(empty,{x:empty.x+25,y:empty.y-25});const shiftedAgain=await point({x:0,y:0});
 assert.ok(Math.abs(shiftedAgain.x-shifted.x-25)<1&&Math.abs(shiftedAgain.y-shifted.y+25)<1,'empty tile drag pans');
 // Place and then move a building with the same panned camera used for picking.
 const card=await page.locator('#electric-backpack [data-kind="tower"]').boundingBox(),dest=await point({x:0,y:-2});
 await pan({x:card.x+card.width/2,y:card.y+card.height/2},dest);
 assert.deepEqual(await page.evaluate(()=>ElectricTiles.coreCell(ElectricTiles.list()[0])),{x:0,y:-2});
 const cameraBefore=await page.evaluate(()=>[renderer.mapCamera.panX,renderer.mapCamera.panZ]);
 const from=await point({x:0,y:-2}),to=await point({x:-1,y:-1});await pan(from,to);
 assert.deepEqual(await page.evaluate(()=>ElectricTiles.coreCell(ElectricTiles.list()[0])),{x:-1,y:-1});
 assert.deepEqual(await page.evaluate(()=>[renderer.mapCamera.panX,renderer.mapCamera.panZ]),cameraBefore,'building drag does not pan');
 await page.locator('[data-camera-reset]').click();const centered=await point({x:0,y:0});assert.ok(Math.abs(centered.x-origin.x)<1&&Math.abs(centered.y-origin.y)<1);
 // Curved-screen events use the same corrected source coordinates as placement.
 const expected=await page.evaluate(()=>{NeonPostFX.settings.distortion=true;NeonPostFX.settings.distortionStrength=.6;NeonPostFX.refresh();const a=NeonPostFX.samplePoint(35,205),b=NeonPostFX.samplePoint(95,245);return {x:b.x-a.x,y:b.y-a.y};});
 await pan({x:35,y:205},{x:95,y:245});const curved=await point({x:0,y:0});
 assert.ok(Math.abs(curved.x-centered.x-expected.x)<1&&Math.abs(curved.y-centered.y-expected.y)<1,'panning honors screen distortion');
 await page.screenshot({path:'tests/camera-panned-placement-390.png'});
 await page.locator('[data-camera-reset]').click();
 for(const [width,height]of [[320,568],[390,844],[1280,900]]){
  await page.setViewportSize({width,height});await page.evaluate(()=>draw(0));
  const r=await page.locator('[data-camera-reset]').boundingBox();assert.ok(r.x>=0&&r.x+r.width<=width&&r.y>=0&&r.y+r.height<=height);
 }
 await page.setViewportSize({width:390,height:844});
 await page.locator('#postfx-panel > summary').click();await page.locator('.postfx-group').filter({has:page.locator('[data-setting="cameraSize"]')}).locator('summary').click();
 await page.screenshot({path:'tests/camera-size-controls-390.png'});
 await page.evaluate(()=>{ElectricEditor.run();draw(0);});
 assert.deepEqual(await page.evaluate(()=>[renderer.mapCamera.panX,renderer.mapCamera.panZ]),[0,0]);
 assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);assert.deepEqual(errors,[]);
 console.log('Camera: size persistence/direct zoom, no extent/time fitting, background/empty-tile pan, panned placement/building move, recenter, CRT correction, 3 sizes and combat reset passed');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});




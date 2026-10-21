const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const version=require('../package.json').version;
 for(const url of ['http://127.0.0.1:4173/',pathToFileURL(path.resolve(`releases/hell-elevator-${version}-offline/game.html`)).href]){
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[],failed=[],network=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push(r.url()));page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
  await page.goto(url,{timeout:60000});await page.waitForFunction(()=>window.HexMap?.ready);
  assert.equal(await page.locator('a[href="hex-city.html"]').count(),0,'no experimental entry in the formal menu');
  await page.locator('#start').click();await page.waitForFunction(()=>state==='combat');
  assert.deepEqual(await page.evaluate(()=>({capacity:gridCapacity(),tiles:tiles.length,weapons:WEAPON_MODELS.length,scene:StreetScene.place,talents:!!globalThis.TalentRuntime})),{capacity:143,tiles:9,weapons:39,scene:'abyss',talents:true});
  assert.ok(await page.evaluate(()=>{paused=true;p.inv=999;draw();return [...renderer.residentMeshes.keys()].some(k=>k.startsWith('hex-column:'));}));
  assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
  if(url.startsWith('file:'))assert.deepEqual(network,[],'offline file never requests the engine, modules or assets over HTTP');
  await page.screenshot({path:`tests/map-promotion-${url.startsWith('file:')?'offline':'web'}.png`});await page.close();
 }
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?weaponlab=1');await page.waitForFunction(()=>window.HexMap?.ready&&document.body.classList.contains('weapon-lab'));assert.ok(await page.locator('#weapon-model option').count()>=39);
 await page.goto('http://127.0.0.1:4173/?scene=street&lab=1');await page.waitForFunction(()=>window.HexMap?.ready&&document.body.classList.contains('scene-lab'));assert.deepEqual(errors,[]);
 console.log('Promotion: default web and standalone offline hex campaign, talents, original weapons, resident columns, zero external offline requests, weapon/scene labs passed.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

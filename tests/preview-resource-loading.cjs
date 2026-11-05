const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 let release;const gate=new Promise(r=>release=r);await page.route('**/assets/player-cat/cat.json',async route=>{await gate;await route.continue()});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.getElementById('resource-loading-percent').textContent!=='0%');
 for(const [width,height] of [[320,568],[390,844],[1280,900]]){await page.setViewportSize({width,height});assert.ok(await page.locator('#resource-loading').isVisible());assert.ok(await page.evaluate(()=>{const b=document.querySelector('.resource-loading-card').getBoundingClientRect();return b.left>=0&&b.right<=innerWidth&&b.bottom<=innerHeight&&b.top>=0}));}
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'tests/resource-loading-390.png'});
 assert.equal(await page.locator('#start').isDisabled(),true);release();await page.waitForFunction(()=>window.HexMap?.ready);assert.equal(await page.locator('#resource-loading').isVisible(),false);assert.equal(await page.locator('#resource-loading-percent').textContent(),'100%');assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);assert.deepEqual(errors,[]);
 await page.route('**/game.js',r=>r.fulfill({status:503,body:'unavailable'}));await page.reload();await page.waitForFunction(()=>document.querySelector('#resource-loading.failed'));assert.ok(await page.locator('#resource-loading-retry').isVisible());await page.unroute('**/game.js');await page.locator('#resource-loading-retry').click();await page.waitForFunction(()=>window.HexMap?.ready);assert.equal(await page.locator('#resource-loading').isVisible(),false);
 console.log('PASS: real pending asset progress, 3 viewport layouts, 100% completion, WebGL, engine failure and retry');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});

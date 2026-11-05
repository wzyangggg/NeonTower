const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?mapseed=pattern-integrated');
 await page.waitForFunction(()=>HexMap.ready);
 await page.locator('#start').click();
 await page.waitForFunction(()=>state!=='menu'&&ElectricEditor.editing);
 await page.waitForFunction(()=>ElectricEditor.preparing);
 assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);
 assert.deepEqual(errors,[]);
 console.log('PASS visible Start button enters first placement, zero page/GL errors');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});

const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await b.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?electriclab=1');await page.waitForFunction(()=>globalThis.ElectricEditor?.editing&&globalThis.MapIcons?.ready);
 await page.evaluate(()=>{ElectricTiles.reset();tiles=[];for(let y=-2;y<=2;y++)for(let x=-3;x<=3;x++)tiles.push({x,y});for(let level=1;level<=3;level++)ElectricTiles.place('battery',{x:(level-2)*2,y:0},level);ElectricEditor.open();ElectricEditor.catalog(['battery'],3);});
 await page.waitForTimeout(350);
 assert.equal(await page.locator('[data-stock-id] [data-level-stars="3"] polygon').count(),3);
 for(const level of [1,2,3])assert.equal(await page.locator(`#electric-placement [data-building-level="${level}"] [data-level-stars] polygon`).count(),level);
 assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);
 for(const viewport of [{width:390,height:844},{width:390,height:680},{width:1280,height:900}]){await page.setViewportSize(viewport);await page.waitForTimeout(100);await page.screenshot({path:`tests/building-stars-${viewport.width}x${viewport.height}.png`});}
 await page.evaluate(()=>ElectricEditor.run());await page.waitForTimeout(250);
 assert.equal(await page.locator('#electric-placement').isVisible(),false);
 assert.equal(await page.locator('#electric-placement [data-level-stars]:visible').count(),0);
 assert.equal(await page.evaluate(()=>typeof MapIcons.groundStars),'undefined');
 await page.screenshot({path:'tests/building-stars-combat-hidden.png'});
 assert.deepEqual(errors,[]);console.log('Building stars: levels 1/2/3 on map, three SVG stars on level-3 card, screen-space core labels, hidden in combat, three viewports and no page/WebGL errors passed.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

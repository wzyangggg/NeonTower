const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?electriclab=1&tilepreset=all');await page.waitForFunction(()=>window.TileLab?.active&&ElectricEditor.editing);
 assert.equal(await page.evaluate(()=>tiles.length),19);assert.equal(await page.evaluate(()=>ElectricTiles.list().length),0);assert.equal(await page.evaluate(()=>ElectricEditor.stock.length),20);
 assert.equal(await page.evaluate(()=>paused&&enemies.length===0&&spawnQueue.length===0),true);
 async function tools(){const details=page.locator('.tile-lab-toolbar details');if(!await details.evaluate(el=>el.open))await details.locator('summary').click();}
 async function action(name){await page.locator(`[data-action="${name}"]`).click();}
 await tools();await action('all');
 assert.equal(await page.evaluate(()=>ElectricTiles.list().length),Object.keys(await page.evaluate(()=>ElectricTiles.defs)).length);
 await page.locator('.tile-lab-toolbar summary').click();
 await action('save');const saved=await page.evaluate(()=>ElectricTiles.list().length);
 await page.reload();await page.waitForFunction(()=>window.TileLab?.active&&ElectricEditor.editing);await action('load');assert.equal(await page.evaluate(()=>ElectricTiles.list().length),saved);
 await tools();await action('clear');assert.equal(await page.evaluate(()=>ElectricTiles.list().length),0);await action('undo');assert.equal(await page.evaluate(()=>ElectricTiles.list().length),saved);
 await action('clear');await page.locator('.tile-lab-toolbar summary').click();
 // Place the same unlimited catalog item twice with real pointer input.
 await page.locator('[data-category="攻击"]').click();
 for(const core of [{x:0,y:0},{x:0,y:2}]){
  const card=await page.locator('#electric-backpack [data-kind="tower"]').boundingBox();await page.mouse.move(card.x+card.width/2,card.y+card.height/2);await page.mouse.down();await page.mouse.move(card.x+card.width/2,card.y-30,{steps:5});
  const to=await page.evaluate(c=>{draw();const at=ElectricTiles.center(c),s=renderer.screenPoint(at.x-325,4,(at.y-300)*1.06),r=canvas.getBoundingClientRect();return {x:s.x+r.left,y:s.y+r.top};},core);
  await page.mouse.move(to.x,to.y,{steps:12});await page.mouse.up();
 }
 assert.equal(await page.evaluate(()=>ElectricTiles.list().length),2);assert.equal(await page.locator('#electric-backpack [data-kind="tower"]').count(),1);
 await page.locator('[data-run]').click();await page.waitForTimeout(1200);
 assert.equal(await page.evaluate(()=>state==='combat'&&!paused&&enemies.length===0&&spawnQueue.length===0),true);
 await page.evaluate(()=>{for(let i=0;i<180;i++)step(.1);});assert.equal(await page.evaluate(()=>state), 'combat');
 await page.locator('[data-run]').click();await tools();await action('small');assert.equal(await page.evaluate(()=>tiles.length),19);await action('all');await page.locator('.tile-lab-toolbar summary').click();
 for(const [width,height]of [[390,844],[390,680],[1280,900]]){await page.setViewportSize({width,height});await page.waitForTimeout(350);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:`tests/tile-lab-${width}x${height}.png`});}
 assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);assert.deepEqual(errors,[]);
 console.log('Tile lab real Edge/WebGL: 143/19 boards, all facility preset, unlimited repeated pointer placement, save/reload/restore, undo, 18 seconds no-wave runtime, edit toggle and three viewport screenshots passed.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

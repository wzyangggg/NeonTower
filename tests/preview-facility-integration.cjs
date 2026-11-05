const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),designer=await context.newPage(),errors=[];context.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));designer.on('pageerror',e=>errors.push(e.message));
 await designer.goto('http://127.0.0.1:4173/facility-designer.html');
 assert.equal(await designer.locator('#enabled-in-game').isChecked(),true);
 await designer.locator('#enabled-in-game').uncheck();assert.match(await designer.locator('#integration-status').innerText(),/关闭/);
 await designer.reload();assert.equal(await designer.locator('#enabled-in-game').isChecked(),false);
 const game=await context.newPage();await game.goto('http://127.0.0.1:4173/?electriclab=1');await game.waitForFunction(()=>window.TileLab?.active);
 assert.equal(await game.evaluate(()=>ElectricTiles.enabled('tower')),false);assert.equal(await game.locator('#electric-backpack [data-kind="tower"]').count(),0);
 assert.equal(await game.evaluate(()=>ElectricTiles.place('tower',{x:-1,y:0})),null);
 await game.evaluate(()=>{TileLab.board(true);ElectricTiles.place('battery',{x:0,y:0});});assert.equal(await game.evaluate(()=>ElectricTiles.list().length),1);
 await designer.locator('[data-kind="battery"]').click();await designer.locator('#enabled-in-game').uncheck();await game.waitForFunction(()=>!ElectricTiles.list().some(f=>f.kind==='battery'));
 assert.equal(await game.locator('#electric-backpack [data-kind="battery"]').count(),0);
 await designer.locator('#enabled-in-game').check();await game.waitForFunction(()=>ElectricTiles.enabled('battery'));await game.evaluate(()=>ElectricEditor.catalog());assert.equal(await game.locator('#electric-backpack [data-kind="battery"]').count(),1);
 // Disabled facilities never enter the real floor-choice pool.
 const offered=await game.evaluate(()=>{let disabled=false;for(let i=1;i<=40;i++){ElectricEditor.reset();testMode=false;floor=i;ElectricEditor.prepareFloor();disabled ||= ElectricEditor.stock.some(s=>s.kind==='tower');}return disabled;});assert.equal(offered,false);
 await designer.locator('[data-kind="tower"]').click();await designer.locator('#enabled-in-game').check();await designer.locator('#undo').click();assert.equal(await designer.locator('#enabled-in-game').isChecked(),false);await designer.locator('#redo').click();assert.equal(await designer.locator('#enabled-in-game').isChecked(),true);
 await designer.locator('#add-kind').click();await designer.locator('#new-kind-name').fill('接入开关测试');await designer.locator('#new-kind-form button[type="submit"]').click();assert.equal(await designer.locator('#enabled-in-game').isChecked(),false);await designer.locator('#enabled-in-game').check();assert.match(await designer.locator('#integration-status').innerText(),/尚无游戏实现/);
 const config=JSON.parse(await designer.locator('#config').textContent());assert.equal(config.enabledInGame,true);assert.equal(await game.evaluate(id=>ElectricTiles.enabled(id),config.id),false);
 const download=designer.waitForEvent('download');await designer.locator('#export').click();const fs=require('node:fs'),data=JSON.parse(fs.readFileSync(await (await download).path(),'utf8'));assert.equal(data.facilities[config.id].enabledInGame,true);
 data.facilities.tower.enabledInGame=false;await designer.locator('#file').setInputFiles({name:'integration.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});await designer.locator('[data-kind="tower"]').click();assert.equal(await designer.locator('#enabled-in-game').isChecked(),false);
 data.facilities.tower.enabledInGame='false';await designer.locator('#file').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});await designer.waitForFunction(()=>document.getElementById('notice').textContent.includes('布尔值'));assert.match(await designer.locator('#notice').innerText(),/布尔值/);
 await designer.screenshot({path:'tests/facility-integration-desktop.png',fullPage:true});await designer.setViewportSize({width:390,height:844});assert.equal(await designer.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await designer.screenshot({path:'tests/facility-integration-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('Facility integration: persisted toggle, cross-tab live removal, placement denial, catalog filtering, forty real floor choices, reenable, undo/redo, custom pending implementation, JSON roundtrip/type validation and responsive UI passed in Edge.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

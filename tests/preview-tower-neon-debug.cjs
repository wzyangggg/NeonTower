const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const context=await browser.newContext(),game=await context.newPage(),panel=await context.newPage(),errors=[];
 for(const page of [game,panel])page.on('pageerror',e=>errors.push(e.message));
 await game.goto('http://127.0.0.1:4173/?electriclab=1');await game.waitForFunction(()=>window.TileLab?.active&&MapIcons.ready);
 const setup=async()=>game.evaluate(()=>{paused=true;ElectricTiles.reset();tiles=[];for(let y=-5;y<=5;y++)for(let x=-6;x<=6;x++)tiles.push({x,y});renderer.sceneKey=null;ElectricTiles.place('healing_tower',{x:0,y:0});draw();window.neonStorageEvents=0;addEventListener('storage',()=>window.neonStorageEvents++);});
 const snapshot=async()=>game.evaluate(()=>{draw();const m=renderer.residentMeshes.get('electric:tower-neon-base:healing_tower');return {colors:[...m.data.slice(6,9)],opacity:m.opacity,finite:[...m.data].every(Number.isFinite),gl:renderer.gl.getError()};});
 await setup();const before=await snapshot();
 await panel.goto('http://127.0.0.1:4173/tower-neon-debug.html');
 await panel.locator('#center').fill('2.5');await panel.locator('#center').dispatchEvent('input');
 await game.waitForFunction(()=>neonStorageEvents>0);const after=await snapshot();assert.ok(after.colors[1]>before.colors[1]);assert.ok(after.finite);assert.equal(after.gl,0);
 assert.equal(await game.evaluate(()=>{draw();const m=renderer.residentMeshes.get('electric:tower-neon-base:healing_tower'),data=m.data,buffer=m.buffer;for(let i=0;i<4;i++)draw();return data===m.data&&buffer===m.buffer;}),true);
 await game.reload();await game.waitForFunction(()=>window.TileLab?.active&&MapIcons.ready);await setup();assert.deepEqual((await snapshot()).colors,after.colors);
 await panel.reload();assert.equal(await panel.locator('#center').inputValue(),'2.5');
 await panel.locator('#reset').click();await game.waitForFunction(()=>neonStorageEvents>0);assert.deepEqual((await snapshot()).colors,before.colors);
 for(const width of [390,900]){await panel.setViewportSize({width,height:900});assert.equal(await panel.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await panel.screenshot({path:`tests/tower-neon-debug-${width}.png`,fullPage:true});}
 assert.deepEqual(errors,[]);console.log('External neon panel: cross-tab live color update, stable GPU buffer between edits, game/panel reload persistence, reset, responsive layout and no page/GL errors passed.');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});

const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?electriclab=1');await page.waitForFunction(()=>FruitModels.ready&&ElectricEditor.editing);
 await page.evaluate(()=>{ElectricEditor.reset();ElectricTiles.reset();tiles=HexMap.initialFloor();p.x=325;p.y=300;p.hp=1;p.max=5;p.inv=0;state='combat';paused=true;enemies=[];enemyTransports=[];spawnQueue=[];shots=[];bullets=[];cashPopups=[];time=10;RoomReady.cancel();$('electric-panel').hidden=true;$('electric-placement').setAttribute('hidden','');$('pause-panel').hidden=true;$('viewport').classList.remove('paused');clearTimeout(toast.timer);$('toast').classList.remove('show');
 const f=ElectricTiles.place('apple',{x:0,y:0});f.products=1;paused=false;ElectricTiles.update(.01);ElectricTiles.update(.3);paused=true;cashPopups=[];draw();});
 for(const [width,height]of [[390,844],[390,680]]){await page.setViewportSize({width,height});await page.evaluate(()=>draw());assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);await page.screenshot({path:`tests/fruit-healing-focused-${width}x${height}.png`});}
 assert.deepEqual(errors,[]);console.log('Focused healing preview: green glow and rising filaments, 390x844 / 390x680, no page or GL errors');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});


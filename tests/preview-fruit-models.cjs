const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?electriclab=1');await page.waitForFunction(()=>HexMap.ready&&FruitModels.ready&&MapIcons.ready);
 const stats=await page.evaluate(()=>{
  ElectricTiles.reset();tiles=[];for(let y=-5;y<=5;y++)for(let x=-6;x<=6;x++)tiles.push({x,y});for(const t of tiles)for(const key of ['medical','shieldTile','cashTile','shockTile','coverTile'])delete t[key];
  const points={apple:{x:-2,y:-1},watermelon:{x:1,y:0},banana:{x:-2,y:1},grape:{x:0,y:2},tower:{x:-3,y:-3},miner:{x:4,y:0}};
  for(const [kind,c]of Object.entries(points)){const f=ElectricTiles.place(kind,c);if(!f)throw Error('fruit/chip placement '+kind);f.products=1;}
  p.x=325;p.y=350;enemies=[];enemyTransports=[];spawnQueue=[];paused=true;
  document.querySelector('#electric-panel').hidden=true;document.querySelector('#electric-placement').setAttribute('hidden','');draw();
  const stats=FruitModels.stats;for(let i=0;i<8;i++)draw();if(FruitModels.stats.uploads!==stats.uploads)throw Error('fruit vertex buffers uploaded per frame');return stats;
 });
 assert.equal(stats.models.length,4);assert.equal(stats.instances,4);assert(stats.models.every(m=>m.vertices>1000));
 for(const [width,height]of [[390,844],[390,680]]){await page.setViewportSize({width,height});await page.screenshot({path:`tests/fruit-models-and-chips-${width}x${height}.png`});}
 await page.evaluate(()=>{window.fruitUploads=FruitModels.stats.uploads;window.fruitContext=renderer.gl.getExtension('WEBGL_lose_context');fruitContext.loseContext();});
 await page.waitForFunction(()=>renderer.gl.isContextLost());await page.evaluate(()=>fruitContext.restoreContext());
 await page.waitForFunction(()=>{if(renderer.gl.isContextLost()||!renderer.ready)return false;draw();return FruitModels.stats.uploads===window.fruitUploads+4;});
 assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);assert.deepEqual(errors,[]);
 console.log('Original FBX fruits: four textured meshes, shared palette, static vertex uploads, actual map/chip screenshots, no procedural fallback and context restoration passed.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

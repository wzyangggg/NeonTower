const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?electriclab=1');await page.waitForFunction(()=>MapIcons.ready&&ElectricEditor.editing);
  const result=await page.evaluate(()=>{
   ElectricTiles.reset();tiles=[];for(let y=-3;y<=3;y++)for(let x=-3;x<=3;x++)tiles.push({x,y});
   const positions={tower:{x:-2,y:-2},miner:{x:0,y:-2},irrigator:{x:2,y:-2},pulse:{x:-2,y:0},biogenerator:{x:0,y:0},battery:{x:2,y:0},apple:{x:-2,y:2},watermelon:{x:0,y:2},banana:{x:2,y:2},grape:{x:1,y:3}};
   for(const [kind,at]of Object.entries(positions))if(!ElectricTiles.place(kind,at))throw Error('placement '+kind);
   tiles.find(t=>t.x===-3&&t.y===-1).medical=true;tiles.find(t=>t.x===-1&&t.y===-1).shieldTile=true;tiles.find(t=>t.x===1&&t.y===-1).cashTile=true;
   p.x=100;p.y=100;paused=true;draw();
   const icons=renderer.sprites.filter(s=>s.kind==='mapIcon'),data=icons.find(s=>s.iconKind==='tower').data,texture=icons.find(s=>s.iconKind==='tower').texture;draw();
   return {count:icons.length,kinds:icons.map(s=>s.iconKind),finite:icons.every(s=>s.data.every(Number.isFinite)),reused:renderer.sprites.find(s=>s.iconKind==='tower').data===data&&renderer.sprites.find(s=>s.iconKind==='tower').texture===texture,oldGeometry:[...renderer.residentMeshes.keys()].some(k=>k.startsWith('electric:floor-icon:')),gl:renderer.gl.getError()};
  });
  assert.ok(result.count>=13&&result.finite&&result.reused&&!result.oldGeometry);assert.equal(result.gl,0);
  assert.ok(await page.locator('.electric-stock-card .map-raster-icon').count()>0);
  assert.equal(await page.locator('.electric-stock-card svg path').count(),0);
  await page.screenshot({path:'../outputs/map-icons/in-game-390x844.png'});
  await page.setViewportSize({width:390,height:680});await page.screenshot({path:'../outputs/map-icons/in-game-390x680.png'});
  await page.evaluate(()=>{window.oldIconTexture=renderer.sprites.find(s=>s.iconKind==='tower').texture;window.iconContextExtension=renderer.gl.getExtension('WEBGL_lose_context');window.iconContextExtension.loseContext();});
  await page.waitForFunction(()=>renderer.gl.isContextLost());
  await page.evaluate(()=>window.iconContextExtension.restoreContext());
  await page.waitForFunction(()=>{if(renderer.gl.isContextLost())return false;draw();return renderer.sprites.some(s=>s.iconKind==='tower'&&s.texture!==window.oldIconTexture);});
  assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);assert.deepEqual(errors,[]);
  console.log('Raster map icons: all 20 PNGs loaded, SVG image cards, floor icons, cached quads/textures, context restoration and 390x844/680 WebGL screenshots passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});

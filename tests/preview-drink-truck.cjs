const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>HexMap.ready&&globalThis.ElectricEditor);await page.evaluate(()=>{window.requestAnimationFrame=()=>0;});await page.waitForTimeout(100);
 for(const [width,height]of [[390,844],[390,680],[1280,900]]){
  await page.setViewportSize({width,height});
  await page.evaluate(()=>{reset();floor=7;startWave();step(1.7);scroll=0;draw();});
  assert.equal(await page.evaluate(()=>state),'drinkArrival');assert.equal(await page.locator('.drink-choice-panel').count(),0);
  await page.screenshot({path:`tests/drink-truck-arrival-${width}x${height}.png`});
  await page.evaluate(()=>{step(1.49);draw();});assert.equal(await page.evaluate(()=>state),'drinkArrival');
  await page.evaluate(()=>{step(.02);draw();});
  assert.equal(await page.locator('.drink-choice .drink-card').count(),3);await page.waitForFunction(()=>renderer.imageQuadAssets?.get('assets/bar-neon.png')?.image.naturalWidth>0);await page.evaluate(()=>draw());assert.equal(await page.evaluate(()=>renderer.sprites.filter(s=>s.kind==='imageQuad').length),1);
  const layout=await page.locator('.drink-choice-panel').evaluate(panel=>{const p=panel.getBoundingClientRect(),cards=[...panel.querySelectorAll('.drink-card')].map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,scroll:e.scrollHeight,height:e.clientHeight};});return {x:p.x,right:p.right,bottom:p.bottom,cards};});
  assert.ok(layout.x>=0&&layout.right<=width);assert.ok(layout.cards.every(c=>c.width>60&&c.scroll<=c.height+2));assert.equal(new Set(layout.cards.map(c=>c.y)).size,1);
  await page.waitForTimeout(800);
  const visibility=await page.evaluate(()=>{
   const overlay=$('overlay').getBoundingClientRect(),cr=canvas.getBoundingClientRect(),style=getComputedStyle($('overlay')),pose=drinkTruckPose(),c=Math.cos(pose.yaw),s=Math.sin(pose.yaw);let bottom=0;
   for(let i=0;i<DrinkTruckMesh.length;i+=9){const x=pose.x+c*DrinkTruckMesh[i]+s*DrinkTruckMesh[i+2],z=pose.z-s*DrinkTruckMesh[i]+c*DrinkTruckMesh[i+2],h=pose.height+DrinkTruckMesh[i+1];bottom=Math.max(bottom,cr.top+drinkProject(325+x,300+z/1.06,h).y/100*cr.height);}
   const supported=[-1.93,1.98].flatMap(x=>[-1,1].map(side=>{const xx=x*25,zz=-side*1.045*25;return HexMap.canStand(tiles,325+pose.x+c*xx+s*zz,300+(pose.z-s*xx+c*zz)/1.06,4);}));
   return {overlayTop:overlay.top,bodyBottom:bottom,blur:style.backdropFilter,mesh:renderer.residentMeshes.get('drink-truck:van')?.data.length,vertices:DrinkTruckMesh.length,supported,yaw:pose.yaw,gap:drinkTruck.dock.edgeZ-(pose.z+drinkTruck.dock.frontZ),hover:pose.height};});
  assert.equal(visibility.yaw,0);assert.equal(visibility.gap,14);assert.equal(visibility.hover,10);assert.equal(visibility.blur,'none');assert.equal(visibility.mesh,visibility.vertices);assert.ok(visibility.supported.every(v=>!v),'wheels hover outside platform');assert.ok(visibility.bodyBottom+3<visibility.overlayTop,'parked truck stays above selection panel '+JSON.stringify(visibility));
  await page.screenshot({path:`tests/drink-truck-choice-${width}x${height}.png`});
  const before=await page.evaluate(()=>({hp:p.hp,cash,bottles:drinkBottles.length}));await page.locator('.drink-choice .drink-card').first().click();
  const result=await page.evaluate(()=>({state,view:terrainView,bottles:drinkBottles.length,cash,chosen:drinkTruck.chosen,enemies:enemies.length,queue:spawnQueue.length,gl:renderer.gl.getError()}));
  assert.deepEqual(result,{state:'upgrade',view:'equipment',bottles:before.bottles+1,cash:before.cash,chosen:true,enemies:0,queue:0,gl:0});
  await page.locator('#shop-leave').click();assert.equal(await page.evaluate(()=>floor),8);assert.equal(await page.evaluate(()=>drinkTruck),null);
  console.log('Drink truck browser',width,height,JSON.stringify(layout));
 }
 await page.evaluate(()=>{startDrinkTruckTest();togglePause();step(30);if(drinkTruck.age!==0)throw Error('pause advanced');togglePause();step(4);draw();const size=renderer.residentMeshes.size;draw();if(size!==renderer.residentMeshes.size)throw Error('mesh growth');const oldTexture=renderer.imageQuadAssets.get('assets/bar-neon.png').texture;renderer.initializeGPU();draw();if(renderer.imageQuadAssets.get('assets/bar-neon.png').texture===oldTexture)throw Error('decal texture not restored');if(renderer.gl.getError())throw Error('GPU restore');});
 assert.deepEqual(errors,[]);console.log('Real hex WebGL arrival, settling, actual free card clicks, three sizes, pause and GPU restore passed');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

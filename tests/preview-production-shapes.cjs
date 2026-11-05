const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?electriclab=1');await page.waitForFunction(()=>window.ElectricEditor?.editing);
  for(const [kind,size]of [['tower',3],['pulse',4],['miner',7]]){
   await page.evaluate(()=>{ElectricTiles.reset();tiles=[];for(let y=-5;y<=5;y++)for(let x=-6;x<=6;x++)tiles.push({x,y});ElectricEditor.open();draw();});
   await page.locator('#electric-panel').evaluate(el=>Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{}))));
   await page.locator('[data-lab-tools] summary').click();await page.locator(`[data-test-kind="${kind}"]`).click();
   const card=page.locator(`#electric-backpack [data-kind="${kind}"]`).first();assert.equal(await card.locator('.electric-stock-footprint').count(),size);
   const box=await card.boundingBox(),to=await page.evaluate(()=>{draw();const at=ElectricTiles.center({x:0,y:0}),s=renderer.screenPoint(at.x-325,4,(at.y-300)*1.06),r=canvas.getBoundingClientRect();return {x:s.x+r.left,y:s.y+r.top};});
   await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2,box.y-30,{steps:5});await page.mouse.move(to.x,to.y,{steps:12});
   assert.equal(await page.locator('[data-placement-valid]').getAttribute('data-placement-valid'),'true');await page.mouse.up();
   assert.deepEqual(await page.evaluate(()=>({facilities:ElectricTiles.list().length,cells:ElectricTiles.list()[0].cells.length})),{facilities:1,cells:size});
   for(const [width,height]of [[390,844],[390,680],[1280,900]]){
    await page.setViewportSize({width,height});await page.evaluate(()=>draw());await page.screenshot({path:`tests/production-shape-${kind}-${width}x${height}.png`});
   }
   const result=await page.evaluate(()=>{const f=ElectricTiles.list()[0],rows={};for(const c of f.cells)rows[c.y]=(rows[c.y]||0)+1;renderer.initializeGPU();draw();return {rows:Object.values(rows).sort(),gl:renderer.gl.getError()};});
   assert.equal(result.gl,0);if(kind==='miner')assert.deepEqual(result.rows,[2,2,3]);
   await page.setViewportSize({width:390,height:844});
  }
  // A single isolated free tile still accepts a barricade after the miner grows.
  await page.evaluate(()=>{ElectricTiles.reset();tiles=[{x:0,y:0},{x:3,y:0}];ElectricEditor.open();draw();});
  await page.locator('[data-lab-tools] summary').click();await page.locator('[data-test-kind="barricade"]').click();
  const card=page.locator('#electric-backpack [data-kind="barricade"]').first(),box=await card.boundingBox();
  const to=await page.evaluate(()=>{draw();const at=ElectricTiles.center({x:0,y:0}),s=renderer.screenPoint(at.x-325,4,(at.y-300)*1.06),r=canvas.getBoundingClientRect();return {x:s.x+r.left,y:s.y+r.top};});
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2,box.y-30,{steps:5});await page.mouse.move(to.x,to.y,{steps:12});
  assert.equal(await page.locator('[data-placement-valid]').getAttribute('data-placement-valid'),'true');await page.mouse.up();assert.ok(await page.evaluate(()=>tiles[0].coverTile));
  assert.deepEqual(errors,[]);console.log('Production shapes: real Edge/WebGL drag placement, 3/4/7-cell cards, three viewports, GPU recreation and single-cell barricade passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?electriclab=1');await page.waitForFunction(()=>window.ElectricEditor?.editing);
  for(const kind of ['floor','floorLine','floorBend','floorTriangle']){
   const card=page.locator(`[data-kind="${kind}"]`).first();await card.scrollIntoViewIfNeeded();const box=await card.boundingBox();
   await page.mouse.move(box.x+box.width/2,box.y+30);await page.mouse.down();await page.mouse.move(box.x+box.width/2,box.y-30,{steps:5});
   for(const valid of [true,false]){
    const target=await page.evaluate(({kind,valid})=>{const c=valid?ElectricEditor.frontier(kind).sort((a,b)=>a.x*a.x+a.y*a.y-b.x*b.x-b.y*b.y)[0]:tiles.find(c=>!ElectricEditor.canPlace(kind,c)),at=ElectricTiles.center(c),p=renderer.screenPoint(at.x-325,3,(at.y-300)*1.06),r=canvas.getBoundingClientRect();return {x:p.x+r.left,y:p.y+r.top};},{kind,valid});
    await page.mouse.move(target.x,target.y,{steps:10});
    assert.equal(await page.locator('[data-placement-valid]').getAttribute('data-placement-valid'),String(valid));
    const result=await page.evaluate(valid=>{const quads=[],original=renderer.transparentQuad;renderer.transparentQuad=function(...args){if(args[4]===(valid?'#69efad':'#ff6876'))quads.push(args);return original.apply(this,args);};try{draw();}finally{renderer.transparentQuad=original;}return {count:quads.length,transparent:quads.every(q=>q[5].every(a=>a>0&&a<1)),gl:renderer.gl.getError()};},valid);
    assert.ok(result.count>=12&&result.transparent,JSON.stringify({kind,valid,result}));assert.equal(result.gl,0);
    if(kind==='floor'&&valid)await page.screenshot({path:'tests/floor-placement-preview-390.png'});
   }
   await page.evaluate(()=>document.dispatchEvent(new PointerEvent('pointercancel',{pointerId:1})));await page.mouse.up();
  }
  assert.deepEqual(errors,[]);console.log('Four floor shapes: valid translucent green and invalid red previews, cancel, zero page/WebGL errors passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

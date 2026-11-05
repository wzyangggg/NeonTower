const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?promo=1&mapseed=env');await page.waitForFunction(()=>HexMap.ready&&ElectricEditor.preparing);
  assert.equal(await page.evaluate(()=>PromoMode.environment.strength),0);
  await page.evaluate(()=>{
   window.requestAnimationFrame=()=>0;ElectricEditor.reset();RoomReady.cancel();state='combat';paused=true;time=3;StreetScene.clock=3;enemies=[];spawnQueue=[];timedRoom=null;
   $('viewport').classList.remove('falling','landing','paused');draw();
   globalThis.environmentSnapshot=()=>({top:renderer.topLight,left:renderer.rearLeftColor,right:renderer.rearRightColor,fog:renderer.sceneFogColor,density:renderer.sceneFogDensity,grade:renderer.sceneGrade,volumes:renderer.cityFogVolumes.map(v=>({color:v.color,opacity:v.opacity}))});
   globalThis.environmentPixels=()=>{draw();const g=renderer.gl,data=new Uint8Array(g.drawingBufferWidth*g.drawingBufferHeight*4);g.readPixels(0,0,g.drawingBufferWidth,g.drawingBufferHeight,g.RGBA,g.UNSIGNED_BYTE,data);return data;};
   PromoMode.setEnvironment({preset:'original'});draw();globalThis.originalEnvironment=environmentSnapshot();globalThis.originalPixels=environmentPixels();globalThis.originalGeometry=renderer.sceneData;
  });
  await page.locator('[data-env-tools] > summary').click();await page.locator('[data-env-preset]').selectOption('orange');
  const warm=await page.evaluate(()=>{
   const pixels=environmentPixels();let delta=0,warm=0,base=0;
   for(let i=0;i<pixels.length;i+=4){if(pixels[i]!==originalPixels[i]||pixels[i+1]!==originalPixels[i+1]||pixels[i+2]!==originalPixels[i+2])delta++;warm+=pixels[i]-pixels[i+2];base+=originalPixels[i]-originalPixels[i+2];}
   return {delta,warm:warm/(pixels.length/4),base:base/(pixels.length/4),snapshot:environmentSnapshot(),sameGeometry:renderer.sceneData===originalGeometry,error:renderer.gl.getError()};
  });
  assert.ok(warm.delta>10000);assert.ok(warm.warm>warm.base+10);assert.ok(warm.snapshot.fog[0]>warm.snapshot.fog[2]);assert.ok(warm.snapshot.top[0]>warm.snapshot.top[2]);assert.ok(warm.sameGeometry);assert.equal(warm.error,0);
  await page.keyboard.press('F4');await page.screenshot({path:'tests/promo-environment-orange-390.png'});await page.keyboard.press('F4');
  // Live slider input, no restart or rebuilding geometry; save through reload.
  await page.locator('[data-env="brightness"]').evaluate(el=>{el.value=150;el.dispatchEvent(new Event('input',{bubbles:true}));});
  assert.equal(await page.evaluate(()=>PromoMode.environment.brightness),150);
  await page.evaluate(()=>{PromoMode.setEnvironment({fog:0});draw();});
  assert.ok(await page.evaluate(()=>renderer.sceneFogDensity===0&&renderer.cityFogVolumes.every(v=>v.opacity===0)));
  await page.locator('[data-env-reset]').click();
  assert.deepEqual(await page.evaluate(()=>{draw();return environmentSnapshot();}),await page.evaluate(()=>originalEnvironment));
  await page.keyboard.press('F4');await page.screenshot({path:'tests/promo-environment-original-390.png'});await page.keyboard.press('F4');
  for(const preset of ['orange','cyan','rose'])assert.ok(await page.evaluate(preset=>{PromoMode.setEnvironment({preset});draw();return renderer.gl.getError()===0&&renderer.sceneData===originalGeometry;},preset));
  await page.evaluate(()=>{PromoMode.setEnvironment({preset:'orange'});PromoMode.setEnvironment({hue:35,brightness:125,fog:70});PromoMode.jump(22,'crimson');});
  assert.equal(await page.evaluate(()=>PromoMode.environment.hue),35);
  await page.goto('http://127.0.0.1:4173/?promo=1');await page.waitForFunction(()=>HexMap.ready&&PromoMode.active);assert.equal(await page.evaluate(()=>PromoMode.environment.brightness),125);
  for(const [width,height]of [[320,568],[390,844],[1280,900]]){
   await page.setViewportSize({width,height});await page.locator('[data-env-tools]').evaluate(el=>el.open=true);
   await page.locator('[data-env-reset]').scrollIntoViewIfNeeded();const box=await page.locator('[data-env-reset]').boundingBox();assert.ok(box.y>=0&&box.y+box.height<height);
  }
  await page.goto('http://127.0.0.1:4173/?promo=1&env=orange');await page.waitForFunction(()=>HexMap.ready&&PromoMode.active);assert.equal(await page.evaluate(()=>PromoMode.environment.preset),'orange');
  await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>HexMap.ready);assert.equal(await page.evaluate(()=>PromoMode.active),false);
  assert.equal(await page.evaluate(()=>PromoMode.setEnvironment({preset:'orange'})),false);assert.equal(await page.locator('[data-env-tools]').count(),0);
  assert.deepEqual(errors,[]);console.log('Promo environment Edge/WebGL passed:',JSON.stringify(warm));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

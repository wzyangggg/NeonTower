const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(/GL_INVALID|ERROR: 0:/.test(m.text()))errors.push(m.text());});
  await page.goto('http://127.0.0.1:4173/?promo=1&mapseed=surface-shader');
  await page.waitForFunction(()=>globalThis.NeonPostFX&&globalThis.ElectricEditor?.preparing);
  await page.evaluate(()=>{paused=true;document.getElementById('promo-panel').hidden=true;});
  const probe=await page.evaluate(async()=>{
   const canvas=document.createElement('canvas');canvas.style='width:390px;height:600px';document.body.append(canvas);
   const r=new Elevator3D(canvas);r.cameraScale=.8;r.begin();r.box(0,-5,0,600,10,600,'#8e9699');r.box(-60,50,0,60,100,60,'#b7c5c9');r.residentMesh('shader-probe',()=>r.box(0,25,0,45,50,45,'#9db7c2'),[1,0,0,90,0,1,0,0,0,0,1,40]);
   const s=NeonPostFX.settings,saved={...s};Object.assign(s,{enabled:false,surfaceShader:'original'});
   function pixels(){r.end();const a=new Uint8Array(canvas.width*canvas.height*4);r.gl.readPixels(0,0,canvas.width,canvas.height,r.gl.RGBA,r.gl.UNSIGNED_BYTE,a);return a;}
   const original=pixels(),program=r.program,resident=r.residentProgram,buffer=r.residentMeshes.get('shader-probe').buffer;
   const native=r.gl.bufferData;let uploads=0;r.gl.bufferData=function(...args){if(args[2]===r.gl.STATIC_DRAW)uploads++;return native.apply(this,args);};
   s.surfaceShader='soft-toon';const toon=pixels();let different=0;for(let i=0;i<toon.length;i+=4)if(Math.abs(toon[i]-original[i])+Math.abs(toon[i+1]-original[i+1])+Math.abs(toon[i+2]-original[i+2])>5)different++;
   const modes=[r.gl.getUniform(r.program,r.surfaceShaderLoc),r.gl.getUniform(r.residentProgram,r.residentLightLocations.surfaceShader)];
   s.surfaceShader='original';const restored=pixels();let maxDelta=0;for(let i=0;i<original.length;i++)maxDelta=Math.max(maxDelta,Math.abs(original[i]-restored[i]));
   s.surfaceShader='soft-toon';await FruitModels.load();FruitModels.begin();FruitModels.draw('apple',0,40,0);r.end();
   const result={different,maxDelta,modes,uploads,reused:program===r.program&&resident===r.residentProgram&&buffer===r.residentMeshes.get('shader-probe').buffer,error:r.gl.getError()};
   r.gl.bufferData=native;Object.assign(s,saved);canvas.remove();return result;
  });
  assert.ok(probe.different>1000,JSON.stringify(probe));assert.equal(probe.maxDelta,0);assert.deepEqual(probe.modes,[1,1]);assert.ok(probe.reused);assert.equal(probe.error,0);
  // Fruit loading above has its own four initial static uploads; style switches have none.
  assert.equal(probe.uploads,4);
  await page.locator('#postfx-panel > summary').click();
  const group=page.locator('.postfx-group').filter({has:page.locator('[data-setting="surfaceShader"]')});
  await group.locator('summary').click();
  const select=page.getByLabel('着色器',{exact:true});await select.selectOption('soft-toon');
  assert.equal(await page.evaluate(()=>NeonPostFX.settings.surfaceShader),'soft-toon');
  await page.screenshot({path:'tests/surface-shader-controls-390.png'});
  await page.locator('#postfx-panel > summary').click();
  await page.evaluate(()=>draw(0));await page.screenshot({path:'tests/surface-shader-toon-390.png'});
  await page.evaluate(()=>{NeonPostFX.settings.surfaceShader='original';NeonPostFX.refresh();draw(0);});
  await page.screenshot({path:'tests/surface-shader-original-390.png'});
  await page.reload();await page.waitForFunction(()=>globalThis.ElectricEditor?.preparing);
  assert.equal(await page.evaluate(()=>NeonPostFX.settings.surfaceShader),'soft-toon');
  await page.evaluate(()=>{const e=renderer.gl.getExtension('WEBGL_lose_context');globalThis.shaderRestore=e;e.loseContext();});
  await page.waitForFunction(()=>!renderer.ready);await page.evaluate(()=>shaderRestore.restoreContext());await page.waitForFunction(()=>renderer.ready);
  assert.equal(await page.evaluate(()=>{draw(0);return renderer.gl.getUniform(renderer.program,renderer.surfaceShaderLoc);}),1);
  await page.locator('#postfx-panel > summary').click();await group.locator('summary').click();
  for(const [width,height]of [[320,568],[390,844],[1280,900]]){
   await page.setViewportSize({width,height});await select.scrollIntoViewIfNeeded();const box=await select.boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width&&box.y>=0&&box.y+box.height<=height);assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);
  }
  await page.locator('#postfx-reset').click();assert.equal(await page.evaluate(()=>NeonPostFX.settings.surfaceShader),'original');
  await page.evaluate(()=>{localStorage.setItem('neon-postfx-v1',JSON.stringify({...NeonPostFX.settings,surfaceShader:'invalid'}));});
  await page.reload();await page.waitForFunction(()=>globalThis.ElectricEditor?.preparing);assert.equal(await page.evaluate(()=>NeonPostFX.settings.surfaceShader),'original');
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>{document.getElementById('promo-panel').hidden=true;NeonPostFX.settings.surfaceShader='soft-toon';NeonPostFX.refresh();ElectricEditor.run();if(paused)togglePause();p.hp=p.maxHp=999;});
  await page.waitForFunction(()=>state==='combat');await page.waitForTimeout(3500);
  await page.evaluate(()=>{paused=true;draw(0);});await page.screenshot({path:'tests/surface-shader-combat-toon-390.png'});
  await page.evaluate(()=>{NeonPostFX.settings.surfaceShader='original';NeonPostFX.refresh();draw(0);});await page.screenshot({path:'tests/surface-shader-combat-original-390.png'});
  assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);
  assert.deepEqual(errors,[]);console.log('Surface shader: actual GPU changes, exact original restore, shared ordinary/resident mode, buffer/program reuse, textured fruit, UI selection/persistence/reset/invalid value, 3 sizes and context restore passed',probe);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

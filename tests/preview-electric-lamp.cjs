const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const show=process.argv.includes('--show');
 const browser=await chromium.launch({headless:!show,channel:'msedge',...(show?{args:['--window-size=500,950']}: {})});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?promo=1&mapseed=electric-lamp&postfx=off');
  await page.waitForFunction(()=>globalThis.ElectricEditor?.preparing);
  await page.evaluate(()=>{
   document.getElementById('promo-panel').hidden=true;ElectricEditor.run();
   paused=true;ElectricTiles.reset();enemies=[];shots=[];bullets=[];particles=[];spawnQueue=[];enemyTransports=[];
   for(const at of [{x:0,y:0},{x:-1,y:0},{x:1,y:0}]){if(!tiles.some(t=>t.x===at.x&&t.y===at.y))tiles.push({...at});ElectricTiles.place('electric_tower',at);}
   p.x=325;p.y=410;p.inv=999;time=2;renderer.sceneKey=null;
   NeonPostFX.settings.playerLight=false;draw(0);
   document.getElementById('survival-clock').style.display='none';
  });
  const label=process.argv.slice(2).find(arg=>!arg.startsWith('--'))||'after';
  for(const mode of ['original','soft-toon']){
   await page.evaluate(mode=>{NeonPostFX.settings.surfaceShader=mode;NeonPostFX.settings.playerLight=false;draw(0);},mode);
   await page.screenshot({path:`tests/electric-lamp-${label}-${mode}-390.png`});
  }
  await page.evaluate(()=>{NeonPostFX.settings.surfaceShader='original';NeonPostFX.settings.cameraSize=.4;draw(0);});
  await page.screenshot({path:`tests/electric-lamp-${label}-closeup.png`});
  const report=await page.evaluate(()=>{
   const mesh=renderer.residentMeshes.get('electric:defense:electric_tower'),buffer=mesh.buffer;
   for(let i=0;i<4;i++)draw(0);
   const gl=renderer.gl,w=gl.drawingBufferWidth,h=gl.drawingBufferHeight,on=new Uint8Array(w*h*4),off=new Uint8Array(on.length);
   gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,on);
   const quad=renderer.transparentQuad;
   try{renderer.transparentQuad=function(...args){if(args[4]!=='#76e3fa')return quad.apply(this,args);};draw(0);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,off);}finally{renderer.transparentQuad=quad;draw(0);}
   let floorPixels=0;for(let i=0;i<on.length;i+=4)if(on[i+1]-off[i+1]>12&&on[i+2]-off[i+2]>12)floorPixels++;
   return {floorPixels,towers:ElectricTiles.list().length,finite:mesh.data.every(Number.isFinite),reused:buffer===mesh.buffer,maxY:Math.max(...Array.from(mesh.data).filter((_,i)=>i%9===1)),gl:gl.getError()};
  });
  assert.equal(report.towers,3);assert.ok(report.finite&&report.reused);assert.equal(report.gl,0);
  if(label==='after'){assert.ok(Math.abs(report.maxY-67.5)<.01,'orb radius is 3/4 of the previous 14 units');assert.ok(report.floorPixels>100,'visible floor illumination without bloom or point light');}
  await page.setViewportSize({width:1280,height:900});await page.evaluate(()=>draw(0));await page.screenshot({path:`tests/electric-lamp-${label}-1280.png`});
  assert.deepEqual(errors,[]);console.log(report);
  if(show){
   await page.setViewportSize({width:390,height:844});await page.evaluate(()=>draw(0));await page.bringToFront();
   console.log('Electric lamp scene open; close the browser window to finish.');
   await new Promise(resolve=>browser.once('disconnected',resolve));
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

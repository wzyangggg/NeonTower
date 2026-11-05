const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(/外描边已回退|GL_INVALID|ERROR:/.test(m.text()))errors.push(m.text());});
  await page.goto('http://127.0.0.1:4173/?dev=1&avatar=robot&promo=1&mapseed=outline');await page.waitForFunction(()=>globalThis.ElectricEditor?.preparing);
  await page.evaluate(()=>{window.requestAnimationFrame=()=>0;ElectricEditor.run();paused=true;document.getElementById('promo-panel').hidden=true;enemies=[];enemyTransports=[];shots=[];bullets=[];particles=[];spawnQueue=[];p.x=325;p.y=380;p.inv=0;time=2;document.getElementById('viewport').classList.remove('landing','boss-intro','survival-intro');document.getElementById('survival-clock').style.display='none';
   enemies=['chaser','fighter','laser','boss'].map((type,i)=>({type,x:240+i%2*150,y:220+Math.floor(i/2)*100,homeX:240+i%2*150,homeY:220+Math.floor(i/2)*100,r:18,hp:40,max:40,seed:i,t:0,fire:999}));
   Object.assign(NeonPostFX.settings,{enabled:true,bloom:false,chromatic:false,scanlines:false,vignette:false,distortion:false,ao:false,shadows:false,outline:true});NeonPostFX.refresh();draw(0);
  });
  const probe=await page.evaluate(()=>{
   const gl=renderer.gl,s=NeonPostFX.settings;
   const read=()=>{draw(0);const pixels=new Uint8Array(renderer.canvas.width*renderer.canvas.height*4);gl.readPixels(0,0,renderer.canvas.width,renderer.canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);return pixels;};
   s.outline=false;const off=read();s.outline=true;const on=read();let cyan=0,purple=0;
   for(let i=0;i<on.length;i+=4){const r=on[i]-off[i],g=on[i+1]-off[i+1],b=on[i+2]-off[i+2];if(g>12&&g>r*1.5)cyan++;if(b>12&&r>g*1.5)purple++;}
   const fx=renderer.characterOutline,meshes=[...renderer.residentMeshes.values()].map(m=>m.buffer);let staticUploads=0;const native=gl.bufferData;gl.bufferData=function(...args){if(args[2]===gl.STATIC_DRAW)staticUploads++;return native.apply(this,args);};read();read();gl.bufferData=native;
   const report={cyan,purple,staticUploads,reused:fx===renderer.characterOutline&&meshes.every((b,i)=>b===[...renderer.residentMeshes.values()][i].buffer),gl:gl.getError()};
   // Isolated low-poly cube: a full foreground wall must remove its entire outline.
   const c=document.createElement('canvas');c.style='width:390px;height:600px';document.body.append(c);const r=new Elevator3D(c);
   function cube(hidden){r.begin();r.setOutlineGroup(1);r.residentMesh('outline-cube',()=>r.box(0,50,0,50,100,50,'#647780'));r.setOutlineGroup(0);if(hidden)r.box(0,100,100,500,500,120,'#343c44');r.end();const p=new Uint8Array(c.width*c.height*4);r.gl.readPixels(0,0,c.width,c.height,r.gl.RGBA,r.gl.UNSIGNED_BYTE,p);return p;}
   function delta(hidden){s.outline=false;const a=cube(hidden);s.outline=true;const b=cube(hidden);let n=0;for(let i=0;i<a.length;i+=4)if(b[i+1]-a[i+1]>10)n++;return n;}
   report.visible=delta(false);report.hidden=delta(true);
   function lightCentroid(angle){s.outline=false;const a=cube(false);s.outline=true;s.outlineAngle=angle;const b=cube(false);let sum=0,weight=0;for(let i=0;i<a.length;i+=4){const d=Math.max(0,b[i+1]-a[i+1]);sum+=(i/4%c.width)*d;weight+=d;}return sum/weight;}
   report.left=lightCentroid(180);report.right=lightCentroid(0);s.outlineAngle=125;report.probeGL=r.gl.getError();r.characterOutline?.dispose();c.remove();return report;
  });
  console.log(probe);assert.ok(probe.cyan>30&&probe.purple>30);assert.ok(probe.visible>30);assert.ok(probe.right>probe.left+5,'light energy moves to the source-facing side');assert.equal(probe.hidden,0);assert.ok(probe.reused);assert.equal(probe.staticUploads,0);assert.equal(probe.gl,0);assert.equal(probe.probeGL,0);
  for(const width of [390,320,1280]){await page.setViewportSize({width,height:844});await page.evaluate(()=>draw(0));await page.screenshot({path:`tests/character-outline-${width}.png`});assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);}
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{NeonPostFX.settings.cameraSize=.55;draw(0);});await page.screenshot({path:'tests/character-outline-closeup.png'});
  await page.locator('#postfx-panel > summary').click();await page.locator('.postfx-group').filter({has:page.locator('[data-setting="outline"]')}).locator('summary').click();
  await page.locator('[data-setting="outlineWidth"]').fill('1.8');await page.locator('[data-setting="outlineWidth"]').dispatchEvent('input');assert.equal(await page.evaluate(()=>NeonPostFX.settings.outlineWidth),1.8);assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('neon-postfx-v1')).outlineWidth),1.8);
  await page.screenshot({path:'tests/character-outline-controls.png'});
  const recover=await page.evaluate(()=>{globalThis.outlineRestore=renderer.gl.getExtension('WEBGL_lose_context');if(!outlineRestore)return false;outlineRestore.loseContext();return true;});
  if(recover){await page.waitForFunction(()=>!renderer.ready);await page.evaluate(()=>outlineRestore.restoreContext());await page.waitForFunction(()=>renderer.ready);await page.evaluate(()=>draw(0));assert.ok(await page.evaluate(()=>renderer.characterOutline.marker===renderer.program&&renderer.characterOutline.frames>0));}
  assert.deepEqual(errors,[]);console.log('Outline: player/enemy pixels, hidden silhouette, buffer reuse, 3 viewports and context restore passed');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});


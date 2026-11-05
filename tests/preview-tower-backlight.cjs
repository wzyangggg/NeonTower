const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(/外描边已回退|GL_INVALID|ERROR:/.test(m.text()))errors.push(m.text());});
  await page.goto('http://127.0.0.1:4173/?promo=1&mapseed=tower-backlight');await page.waitForFunction(()=>globalThis.ElectricEditor?.preparing);
  await page.evaluate(()=>{
   window.requestAnimationFrame=()=>0;ElectricEditor.run();paused=true;document.getElementById('promo-panel').hidden=true;document.getElementById('viewport').classList.remove('landing','boss-intro','survival-intro');document.getElementById('survival-clock').style.display='none';
   ElectricTiles.reset();tiles=[];for(let y=-3;y<=3;y++)for(let x=-3;x<=3;x++)tiles.push({x,y});renderer.sceneKey=null;
   enemies=[];shots=[];bullets=[];particles=[];spawnQueue=[];enemyTransports=[];turrets=[];p.x=325;p.y=400;p.inv=999;time=2;
   ['electric_tower','healing_tower','missile_tower','shotgun_tower','sniper_tower','slow_field','repair_turret'].forEach((kind,i)=>ElectricTiles.place(kind,{x:i%3-1,y:Math.floor(i/3)-1}));
   Object.assign(NeonPostFX.settings,{enabled:true,outline:true,bloom:false,chromatic:false,distortion:false,scanlines:false,vignette:false,ao:false,shadows:false,cameraSize:.65});NeonPostFX.refresh();draw(0);
  });
  const report=await page.evaluate(()=>{
   const r=renderer,gl=r.gl,s=NeonPostFX.settings,read=()=>{draw(0);const p=new Uint8Array(r.canvas.width*r.canvas.height*4);gl.readPixels(0,0,r.canvas.width,r.canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,p);return p;};
   s.outline=false;const off=read();s.outline=true;const on=read();let changed=0;for(let i=0;i<on.length;i+=4)if(on[i+1]-off[i+1]>8)changed++;
   const towers=[...r.residentMeshes].filter(([k,m])=>m.count&&(k.startsWith('electric:defense:')||k==='electric:repair-turret'));
   const tagged=towers.every(([,m])=>m.outlineTags.slice(0,m.count).every(v=>v===1));
   const ground=[...r.residentMeshes].filter(([k,m])=>m.count&&k.startsWith('electric:tower-neon-base:')).every(([,m])=>m.outlineTags.slice(0,m.count).every(v=>!v));
   const buffers=towers.map(([,m])=>m.buffer),fx=r.characterOutline;let uploads=0;const native=gl.bufferData;gl.bufferData=function(...args){if(args[2]===gl.STATIC_DRAW)uploads++;return native.apply(this,args);};read();read();gl.bufferData=native;
   return {changed,tagged,ground,uploads,reused:fx===r.characterOutline&&towers.every(([,m],i)=>m.buffer===buffers[i]),kinds:ElectricTiles.list().map(f=>f.kind),meshCount:towers.length,gl:gl.getError()};
  });
  console.log(report);assert.equal(report.kinds.length,7);assert.ok(report.meshCount>=7&&report.changed>100&&report.tagged&&report.ground&&report.reused);assert.equal(report.uploads,0);assert.equal(report.gl,0);
  for(const width of [390,1280]){await page.setViewportSize({width,height:844});await page.evaluate(()=>draw(0));await page.screenshot({path:`tests/tower-backlight-${width}.png`});assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);}
  assert.deepEqual(errors,[]);console.log('Tower backlight: seven kinds, ground excluded, actual pixels, retained buffers, two sizes and no page/GL errors passed');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

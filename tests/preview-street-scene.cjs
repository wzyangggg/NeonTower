const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const root=path.resolve('dist'),server=http.createServer(async(req,res)=>{try{const file=path.resolve(root,'.'+(req.url==='/'?'/index.html':req.url.split('?')[0]));if(!file.startsWith(root+path.sep))throw Error();const data=await fs.readFile(file);res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.png':'image/png','.mp3':'audio/mpeg'})[path.extname(file)]||'application/octet-stream');res.end(data);}catch{res.statusCode=404;res.end();}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,channel:'msedge'}),errors=[];
 try{
  const page=await browser.newPage({viewport:{width:480,height:960},deviceScaleFactor:1});page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/index.html?scene=street&lab=1');await page.waitForTimeout(1200);
  const stage=process.argv[2]||'v1';
  await page.screenshot({path:path.join(__dirname,'street-scene-'+stage+'-ui.png')});
  await page.evaluate(()=>{document.body.classList.add('clean');draw();});
  await page.screenshot({path:path.join(__dirname,'street-scene-'+stage+'.png')});
  console.log(await page.evaluate(()=>({size:tiles.length,grid:{...grid},staticVertices:renderer.sceneData.length/9,dynamicVertices:renderer.count/9,residentMeshes:renderer.residentMeshes.size,finite:renderer.sceneData.every(Number.isFinite),gl:renderer.gl.getError(),canvas:[renderer.canvas.width,renderer.canvas.height]})));
  if(process.argv.includes('--verify')){
   await page.evaluate(()=>document.body.classList.remove('clean'));
   for(const size of [9,49,99,143]){
    await page.click('[data-size="'+size+'"]');
    assert.equal(await page.evaluate(()=>tiles.length),size);
    assert(await page.evaluate(()=>enemies.every(e=>hasTile(Math.round((e.x-325)/TILE),Math.round((e.y-300)/TILE)))),'preview enemies stand on developed floor');
    assert.equal(await page.evaluate(()=>renderer.sceneData.every(Number.isFinite)),true);
    assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);
    if(size===9||size===143){await page.evaluate(()=>document.body.classList.add('clean'));await page.screenshot({path:path.join(__dirname,'street-scene-'+size+'-tiles.png')});await page.evaluate(()=>document.body.classList.remove('clean'));}
   }
   await page.click('[data-size="99"]');
   const moved=await page.evaluate(()=>{const start={x:p.x,y:p.y};paused=false;shootTimer=0;keys.d=true;for(let i=0;i<45;i++)step(1/60);keys.d=false;paused=true;p.inv=0;draw();return Math.hypot(p.x-start.x,p.y-start.y);});assert(moved>10,'real player movement works');
   await page.evaluate(()=>{paused=false;for(let i=0;i<55;i++)step(1/60);paused=true;p.inv=0;document.body.classList.add('clean');draw();});
   await page.screenshot({path:path.join(__dirname,'street-scene-combat.png')});
   // Same geometry is retained across ordinary frames; no regeneration/upload each frame.
   assert(await page.evaluate(()=>{const data=renderer.sceneData,uploaded=renderer.sceneUploaded;draw();draw();return data===renderer.sceneData&&uploaded===renderer.sceneUploaded;}));
   // Exercise actual GPU loss/restoration, not the mocked renderer.
   const restored=await page.evaluate(async()=>{const ext=renderer.gl.getExtension('WEBGL_lose_context');if(!ext)return null;const wait=event=>new Promise(resolve=>renderer.canvas.addEventListener(event,resolve,{once:true}));const lost=wait('webglcontextlost');ext.loseContext();await lost;await new Promise(r=>setTimeout(r,80));const restored=wait('webglcontextrestored');ext.restoreContext();await restored;draw();return renderer.ready&&renderer.gl.getError()===0&&renderer.sceneData.every(Number.isFinite);});assert.notEqual(restored,false);
   for(const [w,h]of [[390,844],[390,680],[1280,900]]){await page.setViewportSize({width:w,height:h});await page.waitForTimeout(150);await page.evaluate(()=>{p.inv=0;draw();});await page.screenshot({path:path.join(__dirname,`street-scene-${w}x${h}.png`)});assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);}
   assert(await page.evaluate(()=>{StreetScene.enabled=false;draw();const original=renderer.waterfallFrame!==null;StreetScene.enabled=true;draw();return original&&renderer.waterfallFrame===null&&renderer.sceneKey.startsWith('street-');}));
   await page.setViewportSize({width:390,height:844});
   await page.goto('http://127.0.0.1:'+server.address().port+'/index.html?scene=street');await page.click('#start');await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>tiles.length),9);assert.equal(await page.evaluate(()=>!!window.sceneLab),false);assert.equal(await page.evaluate(()=>StreetScene.enabled),true);assert(await page.evaluate(()=>{for(let i=0;i<220;i++)step(1/60);draw();return renderer.sceneKey.startsWith('street-')&&renderer.gl.getError()===0;}));
   await page.screenshot({path:path.join(__dirname,'street-scene-campaign.png')});
   await page.goto('http://127.0.0.1:'+server.address().port+'/index.html');await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>StreetScene.enabled),false);await page.click('#start');await page.waitForTimeout(400);assert.equal(await page.evaluate(()=>tiles.length),9);assert.equal(await page.evaluate(()=>renderer.cameraScale),1);
   console.log('Verified tile counts, real movement/combat, finite geometry, retained GPU buffers, WebGL context recovery, 3 viewport sizes and unchanged campaign entry.');
  }
  assert.deepEqual(errors,[]);console.log('No browser script errors.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
 await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>window.HexMap?.ready&&renderer.sceneKey==='neon-title-city-v4');
 await page.waitForFunction(()=>document.querySelector('.title-brand img')?.naturalWidth>0);
 for(const [width,height]of [[390,844],[390,680],[1280,900]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(200);
  assert.ok(await page.evaluate(()=>{const b=$('start').getBoundingClientRect(),h=document.querySelector('.title-brand').getBoundingClientRect(),v=$('viewport').getBoundingClientRect();return b.bottom<v.bottom&&b.top>h.bottom&&b.left>=v.left&&b.right<=v.right&&document.documentElement.scrollWidth<=innerWidth}));
  assert.ok(await page.evaluate(()=>{const h=renderer.canvas.getBoundingClientRect().height,top=renderer.screenPoint(0,TitleScene.stats.centralTop,-30).y/h,buildings=TitleScene.stats.buildings;return top>.45&&top<.57&&buildings.some(q=>renderer.screenPoint(q.x,q.targetTop,q.z).y<0)&&buildings.some(q=>renderer.screenPoint(q.x,q.targetTop,q.z).y>h*.6)}),'central roof near center; skyline has cropped supertall and low roofs');
  const coverage=await page.evaluate(()=>{const r=renderer,d=r.sceneData,b=r.canvas.getBoundingClientRect(),inside=(p,a,c,e)=>{const side=(u,v)=>(p.x-v.x)*(u.y-v.y)-(u.x-v.x)*(p.y-v.y),s=[side(a,c),side(c,e),side(e,a)];return s.every(v=>v>=0)||s.every(v=>v<=0)};return [.02,.25,.5,.75,.98].map(y=>TitleScene.stats.edgeBuildings.some(q=>{for(let i=q.start;i<q.end;i+=27){const pts=[0,9,18].map(k=>r.screenPoint(d[i+k],d[i+k+1],d[i+k+2]));if(inside({x:b.width-1,y:b.height*y},...pts))return true}return false}))});assert.ok(coverage.every(Boolean),'right edge coverage: '+JSON.stringify(coverage));
  await page.screenshot({path:`tests/neon-title-${width}x${height}.png`});
 }
 const stable=await page.evaluate(()=>{const data=renderer.sceneData,scene=renderer.sceneUploaded,clock=renderer.sceneTime;draw();return {same:data===renderer.sceneData&&scene===renderer.sceneUploaded,clock:renderer.sceneTime>=clock,cars:[...renderer.residentMeshes.keys()].filter(k=>k.startsWith('orbital-traffic-')).length,gl:renderer.gl.getError(),perspective:renderer.scenePerspective,capacity:gridCapacity()}});
 assert.ok(stable.same&&stable.clock&&stable.cars===8&&stable.perspective);assert.equal(stable.gl,0);assert.equal(stable.capacity,143);
 assert.ok(await page.evaluate(()=>{const cars=TitleScene.traffic(12),pixels=c=>{const a=renderer.screenPoint(c.x,c.y,c.z),b=renderer.screenPoint(c.x+35*c.scale,c.y,c.z);return Math.abs(a.x-b.x)},view=renderer.gl.getUniform(renderer.program,renderer.sceneFogViewLoc);return cars.every(c=>!c.near&&c.z<=-650&&c.scale<=1.1)&&Math.max(...cars.map(pixels))<renderer.canvas.getBoundingClientRect().width*.035&&Math.abs(view[1]-.13)<.001&&document.querySelectorAll('#title-rain-glass i').length===5&&getComputedStyle($('title-rain-glass')).pointerEvents==='none'}),'traffic stays in middle/distant city with small projected silhouettes; camera-depth fog and restrained lens droplets');
 await page.evaluate(()=>{const lose=renderer.gl.getExtension('WEBGL_lose_context');if(!lose)throw Error('missing restore test extension');lose.loseContext();setTimeout(()=>lose.restoreContext(),120)});
 await page.waitForFunction(()=>renderer.ready&&renderer.sceneUploaded===renderer.sceneData&&renderer.sceneKey==='neon-title-city-v4');
 assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);
 await page.locator('#start').click();await page.waitForFunction(()=>state==='combat');
 assert.ok(await page.evaluate(()=>!$('viewport').classList.contains('title-screen')&&!renderer.scenePerspective&&getComputedStyle(document.querySelector('.hud')).display!=='none'&&tiles.length===9&&gridCapacity()===143));
 assert.ok(await page.evaluate(()=>{const v=renderer.gl.getUniform(renderer.program,renderer.sceneFogViewLoc);return Math.abs(v[1]-.84663655)<.0001&&getComputedStyle($('title-rain-glass')).display==='none'}),'original gameplay fog camera and hidden lens layer restored');
 await page.evaluate(()=>{paused=true;draw()});await page.screenshot({path:'tests/neon-title-entered.png'});
 assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);
 await page.goto('http://127.0.0.1:4173/?scene=abyss&look=violet&lab=1');await page.waitForFunction(()=>window.HexMap?.ready&&window.sceneLab);
 assert.ok(await page.evaluate(()=>!$('viewport').classList.contains('title-screen')&&state!=='menu'));
 assert.deepEqual(errors,[]);console.log('Neon title: 3 viewport layouts, city/8 resident traffic meshes, cached geometry, perspective, WebGL restore, start to 9/143 gameplay with original camera/HUD, scene lab and zero errors passed.');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});

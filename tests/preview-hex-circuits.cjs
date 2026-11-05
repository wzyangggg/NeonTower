const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?promo=1&mapseed=floor-finish');await page.waitForFunction(()=>globalThis.ElectricEditor?.preparing);
 await page.evaluate(()=>{document.getElementById('promo-panel').hidden=true;ElectricEditor.run();});await page.waitForFunction(()=>state==='combat'&&!ElectricEditor.editing);
 const result=await page.evaluate(()=>{paused=true;draw(0);const r=renderer,gl=r.gl,meshes=[...r.residentMeshes.entries()],circuits=meshes.filter(([k])=>k.startsWith('hex-circuits:'));const buffers=circuits.map(([,m])=>m.buffer);
  const counts=meshes.map(([,m])=>m.count);for(const [k,m]of meshes)if(!k.startsWith('hex-circuits:'))m.count=0;
  const render=t=>{r.sceneTime=t;gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);r.drawResidentMeshes();const pixels=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,pixels);return pixels;};
  const a=render(0),b=render(1.5),c=render(0);let changed=0,repeat=0;for(let i=0;i<a.length;i+=4){if(Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>15)changed++;if(a[i]!==c[i]||a[i+1]!==c[i+1]||a[i+2]!==c[i+2])repeat++;}
  meshes.forEach(([,m],i)=>m.count=counts[i]);draw(0);return {changed,repeat,variants:circuits.length,reused:circuits.every(([,m],i)=>m.buffer===buffers[i]),finite:circuits.every(([,m])=>m.data.every(Number.isFinite)),gl:gl.getError()};});
 assert.ok(result.changed>50,JSON.stringify(result));assert.equal(result.repeat,0);assert.ok(result.variants>1&&result.variants<=32);assert.ok(result.reused&&result.finite);assert.equal(result.gl,0);
 await page.screenshot({path:'tests/hex-circuits-390.png'});await page.setViewportSize({width:1280,height:900});await page.evaluate(()=>draw(0));await page.screenshot({path:'tests/hex-circuits-1280.png'});assert.deepEqual(errors,[]);console.log('Circuit flow GPU: isolated time-dependent brightness, deterministic replay, variants and retained buffers passed',result);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

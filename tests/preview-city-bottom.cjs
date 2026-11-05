const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>window.HexMap?.ready);
 await page.evaluate(()=>{reset();paused=true;state='combat';enemies=[];spawnQueue=[];time=3;p.inv=999;document.getElementById('overlay').style.display='none';document.getElementById('toast').style.display='none';draw();});
 for(const [width,height]of [[390,844],[390,680],[1280,900]]){
  await page.setViewportSize({width,height});
  const report=await page.evaluate(()=>{draw();const data=renderer.sceneData,uploaded=renderer.sceneUploaded,lights=renderer.cityLightUploaded,capacity=gridCapacity(),cells=tiles.length;for(let i=0;i<12;i++)draw();return {lamps:StreetScene.orbitalStats.groundLamps,cached:renderer.sceneData===data&&renderer.sceneUploaded===uploaded&&renderer.cityLightUploaded===lights&&lights===StreetScene.groundLightGeometry,finite:renderer.sceneData.every(Number.isFinite)&&renderer.cityLightUploaded.every(Number.isFinite),capacity,cells,gl:renderer.gl.getError(),bytes:data.byteLength};});
  assert.ok(report.lamps>20000);assert.ok(report.cached&&report.finite);assert.equal(report.capacity,143);assert.equal(report.gl,0);
  await page.screenshot({path:`tests/city-bottom-${width}x${height}.png`});console.log(width,height,report);
 }
 // Compare actual GPU pixels from the light pass, isolating it from rain/traffic.
 const animation=await page.evaluate(()=>{const gl=renderer.gl,saved=renderer.sceneTime,uploaded=renderer.cityLightUploaded;
  const frame=t=>{renderer.sceneTime=t;gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);renderer.drawCityLights();const pixels=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,pixels);return pixels;};
  const a=frame(2),b=frame(3.4),c=frame(3.4);let changed=0,stableLit=0,repeated=0;
  for(let i=0;i<a.length;i+=4){const changedPixel=a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2];if(changedPixel)changed++;else if(a[i]+a[i+1]+a[i+2]>15)stableLit++;if(b[i]!==c[i]||b[i+1]!==c[i+1]||b[i+2]!==c[i+2])repeated++;}
  renderer.sceneTime=saved;draw();return {changed,stableLit,repeated,cached:renderer.cityLightUploaded===uploaded,gl:gl.getError()};});
 assert.ok(animation.changed>100&&animation.stableLit>100,JSON.stringify(animation));assert.equal(animation.repeated,0);assert.ok(animation.cached);assert.equal(animation.gl,0);console.log('Independent twinkle GPU pixels:',animation);
 const pausedClock=await page.evaluate(()=>{paused=true;draw();const t=renderer.sceneTime;draw();return t===renderer.sceneTime;});assert.ok(pausedClock);
 // Switching palettes must retain real fog, rebuild once and then reuse geometry.
 for(const look of ['green','blue','violet']){const result=await page.evaluate(look=>{StreetScene.look=look;draw();return {gl:renderer.gl.getError(),lamps:StreetScene.orbitalStats.groundLamps,fog:renderer.sceneFogDensity};},look);assert.equal(result.gl,0);assert.ok(result.lamps>20000);assert.equal(result.fog,.00065);}
 // Inspect the actual uploaded texture: transparent corners and a radial soft falloff.
 const texture=await page.evaluate(()=>{const gl=renderer.gl,fb=gl.createFramebuffer(),pixels=new Uint8Array(64*64*4);gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,renderer.cityLightTexture,0);gl.readPixels(0,0,64,64,gl.RGBA,gl.UNSIGNED_BYTE,pixels);gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.deleteFramebuffer(fb);const alpha=(x,y)=>pixels[(y*64+x)*4+3];draw();return {corner:alpha(0,0),center:alpha(32,32),middle:alpha(44,32),edge:alpha(62,32),symmetry:Math.abs(alpha(44,32)-alpha(32,44)),gl:gl.getError()};});
 assert.equal(texture.corner,0);assert.ok(texture.center>texture.middle&&texture.middle>texture.edge);assert.equal(texture.symmetry,0);assert.equal(texture.gl,0);
 // A wall crossing the middle of a fog volume must vary continuously in GPU pixels.
 const crossing=await page.evaluate(()=>{const r=renderer,gl=r.gl,saved={sceneData:r.sceneData,vp:r.vp,sceneFogDensity:r.sceneFogDensity,sceneGrade:r.sceneGrade,cityFogVolumes:r.cityFogVolumes};
  r.begin();r.sceneData=null;r.sceneFogDensity=0;r.sceneGrade=0;
  r.vp=new Float32Array([1/200,0,0,0,0,1/300,0,0,0,0,.001,0,0,650/300,0,1]);
  r.cityFogVolumes=[{center:[0,-650,0],radii:[400,200,400],color:'#8899cc',opacity:.55}];
  r.emissiveQuad([-200,-950,0],[200,-950,0],[200,-350,0],[-200,-350,0],'#181818');for(let i=0;i<r.count;i+=9)r.data[i+4]=5;
  r.end();const pixels=new Uint8Array(gl.drawingBufferHeight*4);gl.readPixels(Math.floor(gl.drawingBufferWidth/2),0,1,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
  let maxStep=0,min=255,max=0;for(let i=4;i<pixels.length;i+=4){maxStep=Math.max(maxStep,Math.abs(pixels[i]-pixels[i-4]));min=Math.min(min,pixels[i]);max=Math.max(max,pixels[i]);}
  const error=gl.getError();Object.assign(r,saved);draw();return {maxStep,range:max-min,gl:error};});
 assert.ok(crossing.range>10&&crossing.maxStep<=3,JSON.stringify(crossing));assert.equal(crossing.gl,0);console.log('Soft fog/wall crossing GPU pixels:',crossing);
 await page.evaluate(()=>{window.cityRestoreExtension=renderer.gl.getExtension('WEBGL_lose_context');window.cityRestoreExtension.loseContext();});
 await page.waitForFunction(()=>!renderer.ready);
 await page.evaluate(()=>window.cityRestoreExtension.restoreContext());
 await page.waitForFunction(()=>renderer.ready&&renderer.cityLightUploaded===StreetScene.groundLightGeometry&&renderer.cityLightUploaded?.length>0);
 assert.equal(await page.evaluate(()=>{draw();return renderer.gl.getError();}),0);
 assert.deepEqual(errors,[]);
 console.log('City bottom: real Edge/WebGL, three viewports/palettes, finite cached street lights and fixed map capacity passed.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});

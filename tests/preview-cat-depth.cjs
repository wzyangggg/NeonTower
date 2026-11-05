// Compare the complete scene's packed depth with the cat rendered alone.
// Every opaque cat pixel must occlude geometry farther away in both postFX passes.
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await b.newPage({viewport:{width:700,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?avatar=cat&mapseed=cat-depth');await page.waitForFunction(()=>globalThis.CatPlayer?.ready&&HexMap.ready);
 const result=await page.evaluate(()=>{
  reset();paused=true;state='combat';p.inv=0;enemies=[];spawnQueue=[];time=1;fallAge=landingAge=5;NeonPostFX.settings.cameraSize=.4;NeonPostFX.refresh();clearTimeout(toast.timer);$('toast').classList.remove('show');draw();
  const r=renderer,gl=r.gl;
  function compare(frame,w,h,mode){
   gl.bindFramebuffer(gl.FRAMEBUFFER,frame);gl.viewport(0,0,w,h);const full=new Uint8Array(w*h*4),solo=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,full);
   gl.disable(gl.BLEND);gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.clearColor(1,1,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);CatPlayer.renderGeometry(r,r.vp,mode);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,solo);
   let samples=0,leaks=0,maxError=0;
   for(let i=0;i<solo.length;i+=4){if(!solo[i+3]||(mode===0?solo[i+2]<200:solo[i+2]+solo[i+3]===0))continue;const expected=solo[i]/255+solo[i+1]/65025,actual=full[i]/255+full[i+1]/65025;if(expected>.999)continue;samples++;const delta=actual-expected;maxError=Math.max(maxError,delta);if(delta>4/65025)leaks++;}
   gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,r.canvas.width,r.canvas.height);return {samples,leaks,maxError};
  }
  const outline=r.characterOutline,occ=r.sceneOcclusion;const a=compare(outline.frame,outline.w,outline.h,0),o=compare(occ.gbuffer.frame,occ.gbuffer.w,occ.gbuffer.h,1);draw();return {outline:a,occlusion:o,uploads:CatPlayer.stats.uploads,gl:gl.getError()};
 });
 assert.ok(result.outline.samples>500,JSON.stringify(result));assert.ok(result.occlusion.samples>100);assert.equal(result.outline.leaks,0);assert.equal(result.occlusion.leaks,0);assert.equal(result.gl,0);assert.equal(result.uploads,1);assert.deepEqual(errors,[]);
 await page.screenshot({path:'tests/player-cat-opaque.png'});console.log('CAT_DEPTH_PASS',JSON.stringify(result));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});


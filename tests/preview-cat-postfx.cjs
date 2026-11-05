const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await b.newPage({viewport:{width:700,height:900},deviceScaleFactor:2}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173/?avatar=cat&mapseed=cat-postfx');await page.waitForFunction(()=>globalThis.CatPlayer?.ready&&HexMap.ready);
 const result=await page.evaluate(()=>{
 reset();paused=true;state='combat';p.inv=0;enemies=[];spawnQueue=[];time=1;fallAge=landingAge=5;clearTimeout(toast.timer);$('toast').classList.remove('show');Object.assign(NeonPostFX.settings,{cameraSize:.4,ao:true,aoStrength:2,shadows:true,shadowStrength:.8});NeonPostFX.refresh();
 const r=renderer,gl=r.gl,original=CatPlayer.render,occlusion=r.drawSceneOcclusion;let before,after;
 function pixels(){const a=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,a);return a;}
 CatPlayer.render=function(r){original(r);before=pixels();};r.drawSceneOcclusion=function(){occlusion.call(r);after=pixels();};
 const rows=[];
 for(const emission of [0,.5,1]){
  CatPlayer.setEmission(emission);draw();const fx=r.sceneOcclusion,w=fx.selfLight.w,h=fx.selfLight.h,mask=new Uint8Array(w*h*4);gl.bindFramebuffer(gl.FRAMEBUFFER,fx.selfLight.frame);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,mask);gl.bindFramebuffer(gl.FRAMEBUFFER,null);
  let visible=0,protectedPixels=0,maxDifference=0,changed=0;
  const cw=gl.drawingBufferWidth,ch=gl.drawingBufferHeight;
  for(let y=2;y<h-2;y++)for(let x=2;x<w-2;x++){
   const at=(y*w+x)*4;if(mask[at+3]<255)continue;visible++;if(emission===0)continue;
   // Ignore silhouette edge samples where half-resolution coverage differs.
   let inside=true;for(let yy=-1;yy<=1;yy++)for(let xx=-1;xx<=1;xx++)if(mask[((y+yy)*w+x+xx)*4]<emission*255-2)inside=false;if(!inside)continue;
   const px=Math.min(cw-1,Math.floor((x+.5)*cw/w)),py=Math.min(ch-1,Math.floor((y+.5)*ch/h)),i=(py*cw+px)*4;if(before[i]+before[i+1]+before[i+2]<60)continue;protectedPixels++;
   let delta=0;for(let k=0;k<3;k++)delta=Math.max(delta,Math.abs(before[i+k]-after[i+k]));maxDifference=Math.max(maxDifference,delta);if(delta>1)changed++;
  }
  rows.push({emission,visible,protectedPixels,maxDifference,changed,gl:gl.getError()});
 }
 CatPlayer.render=original;r.drawSceneOcclusion=occlusion;Object.assign(NeonPostFX.settings,{aoStrength:.65,shadowStrength:.36});CatPlayer.setEmission(1);p.dx=0;p.dy=-1;draw();return rows;
 });
 for(const r of result){assert.ok(r.visible>100);assert.equal(r.gl,0);}const full=result.find(r=>r.emission===1),partial=result.find(r=>r.emission===.5);assert.ok(full.protectedPixels>100);assert.equal(full.changed,0,JSON.stringify(full));assert.ok(partial.changed>0);assert.deepEqual(errors,[]);
 await page.screenshot({path:'tests/player-cat-postfx-fixed.png'});console.log('CAT_POSTFX_PASS',JSON.stringify(result));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {PNG}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?promo=1&mapseed=fog-warp');await page.waitForFunction(()=>globalThis.ElectricEditor?.preparing);
 const fog=await page.evaluate(()=>{
  const c=document.createElement('canvas');c.style='position:fixed;left:0;top:0;width:390px;height:600px;z-index:20000';document.body.append(c);const r=new Elevator3D(c),s=NeonPostFX.settings,saved={...s};r.prepareSceneOcclusion=()=>{r.keyLightDirection=[.1,1,-.1];};
  r.cameraScale=.8;r.begin();r.box(0,-5,0,600,10,600,'#8e9699');r.box(-60,50,0,60,100,60,'#b7c5c9');for(let i=0;i<r.count;i+=9)for(let k=3;k<6;k++)r.data[i+k]*=4;
  r.sceneFogView=[0,.84663655,.53217155,1600];r.sceneFogColor=[.2,.1,.6];Object.assign(s,{enabled:true,ao:false,shadows:true,shadowStrength:.6,shadowAngle:130});
  function draw(strength){s.shadowStrength=strength;r.end();const p=new Uint8Array(c.width*c.height*4);r.gl.readPixels(0,0,c.width,c.height,r.gl.RGBA,r.gl.UNSIGNED_BYTE,p);return p;}
  function delta(a,b){let sum=0,max=0,count=0;for(let i=0;i<a.length;i+=4){let d=0;for(let k=0;k<3;k++){const v=Math.abs(a[i+k]-b[i+k]);sum+=v;max=Math.max(max,v);d+=v;}if(d>3)count++;}return {sum,max,count};}
  r.sceneFogDensity=0;const clear=delta(draw(0),draw(.6));r.sceneFogDensity=.002;const partial=delta(draw(0),draw(.6));r.sceneFogDensity=.1;const opaque=delta(draw(0),draw(.6));
  r.sceneFogDensity=0;r.cityFogVolumes=[{center:[0,0,0],radii:[1000,1000,1000],opacity:.99,color:'#403bce'}];const volume=delta(draw(0),draw(.6));
  const result={clear,partial,opaque,volume,error:r.gl.getError()};r.sceneOcclusion?.dispose();c.remove();Object.assign(s,saved);return result;
 });
 console.log('Fog regression',fog);assert.ok(fog.clear.count>100);assert.ok(fog.partial.sum<fog.clear.sum*.6);assert.ok(fog.opaque.max<=1);assert.ok(fog.volume.sum<fog.clear.sum*.7);assert.equal(fog.error,0);
 await page.evaluate(()=>{document.getElementById('promo-panel').hidden=true;Object.assign(NeonPostFX.settings,{enabled:true,bloom:false,color:false,scanlines:false,vignette:false,ao:false,shadows:false,distortion:true});const cover=document.createElement('div');cover.id='warp-cover';document.getElementById('postfx-panel').style.visibility='hidden';cover.style='position:absolute;inset:0;z-index:9999;background:rgb(240,10,90)';document.getElementById('viewport').append(cover);});
 for(const [width,height]of [[320,568],[390,844],[668,1000],[1280,900]]){
  await page.setViewportSize({width,height});
  for(const strength of [.18,.6,1]){
   await page.evaluate(strength=>{NeonPostFX.settings.distortionStrength=strength;NeonPostFX.refresh();},strength);
   await page.waitForFunction(()=>Number(document.querySelector('feImage').getAttribute('width'))===document.getElementById('viewport').clientWidth);
   const png=PNG.sync.read(await page.screenshot());
   for(const y of [5,25,Math.floor(height*.12),Math.floor(height/2),Math.floor(height*.88),height-25,height-5]){let runs=0,inside=false;for(let x=0;x<width;x++){const i=(y*png.width+x)*4,on=png.data[i]>180&&png.data[i+1]<40&&png.data[i+2]>50&&png.data[i+2]<150;if(on&&!inside)runs++;inside=on;}assert.ok(runs<=1,JSON.stringify({width,height,strength,y,runs}));if(y===Math.floor(height/2))assert.equal(runs,1);}
  }
 }
 await page.evaluate(()=>{document.getElementById('warp-cover').remove();document.getElementById('postfx-panel').style.visibility='';NeonPostFX.reset();});await page.setViewportSize({width:668,height:1000});
 await page.waitForTimeout(500);await page.screenshot({path:'tests/fog-warp-fixed-668.png'});assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);
 console.log('Warp regression: single connected image at top/middle/bottom, 4 sizes and 3 strengths passed; fog color preserved under shadows');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
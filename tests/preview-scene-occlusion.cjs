const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {PNG}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[],warnings=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(/GL_INVALID|场景遮蔽|ERROR:/.test(m.text()))warnings.push(m.text());});
 await page.goto('http://127.0.0.1:4173/?dev=1&avatar=robot&promo=1&mapseed=occlusion');await page.waitForFunction(()=>globalThis.ElectricEditor?.preparing);
 const result=await page.evaluate(()=>{
  const c=document.createElement('canvas');c.style='position:fixed;left:0;top:0;width:390px;height:600px;z-index:20000';document.body.append(c);const r=new Elevator3D(c),s=NeonPostFX.settings,saved={...s};
  Object.assign(s,{enabled:true,ao:false,shadows:false});r.cameraScale=.8;r.begin();r.box(0,-5,0,600,10,600,'#8e9699');r.box(-60,50,0,60,100,60,'#b7c5c9');r.residentMesh('test-cube',()=>r.box(0,25,0,45,50,45,'#9db7c2'),[1,0,0,90,0,1,0,0,0,0,1,40]);
  const draw=()=>{r.end();const p=new Uint8Array(c.width*c.height*4);r.gl.readPixels(0,0,c.width,c.height,r.gl.RGBA,r.gl.UNSIGNED_BYTE,p);return p;};
  const debug=[];for(const name of ['drawArrays','uniformMatrix4fv','uniform1f','uniform1i','uniform2f','bufferData','texImage2D','renderbufferStorage','vertexAttribPointer','vertexAttrib4fv','bindFramebuffer','clear']){const f=r.gl[name];r.gl[name]=function(...args){const v=f.apply(this,args),e=this.getError();if(e)debug.push({name,e,stack:new Error().stack});return v;};}
  const off=draw();const stages={off:r.gl.getError()};Object.assign(s,{ao:true,aoStrength:1,aoRadius:55});const ao=draw();stages.ao=r.gl.getError();
  const diagnostics={};for(const name of ['mask','gbuffer']){const t=r.sceneOcclusion[name],p=new Uint8Array(t.w*t.h*4);r.gl.bindFramebuffer(r.gl.FRAMEBUFFER,t.frame);r.gl.readPixels(0,0,t.w,t.h,r.gl.RGBA,r.gl.UNSIGNED_BYTE,p);diagnostics[name]={max:0,nonzero:0,samples:[]};for(let i=0;i<p.length;i+=4){diagnostics[name].max=Math.max(diagnostics[name].max,p[i]);if(p[i]>4&&name==='mask')diagnostics[name].nonzero++;}if(name==='gbuffer')for(const world of [[-100,0,0],[-90,0,30],[-60,50,30],[0,0,0]]){const q=r.screenPoint(...world),x=Math.floor(q.x/2),y=t.h-1-Math.floor(q.y/2),at=(y*t.w+x)*4;diagnostics[name].samples.push({world,p:[...p.slice(at,at+4)]});}}r.gl.bindFramebuffer(r.gl.FRAMEBUFFER,null);
  Object.assign(s,{ao:false,shadows:true,shadowStrength:.6,shadowAngle:130});const shadow=draw();stages.shadow=r.gl.getError();s.shadowAngle=310;const reverse=draw();
  const diff=p=>{let dark=0,sum=0;for(let i=0;i<p.length;i+=4){const d=off[i]+off[i+1]+off[i+2]-p[i]-p[i+1]-p[i+2];if(d>3)dark++;sum+=Math.max(0,d);}return {dark,sum};};
  let moved=0;for(let i=0;i<shadow.length;i+=4)if(Math.abs(shadow[i]-reverse[i])>3)moved++;
  const fx=r.sceneOcclusion,meshes=[...r.residentMeshes.values()].map(m=>m.buffer);const native=r.gl.bufferData;let uploads=0;r.gl.bufferData=function(...args){if(args[2]===r.gl.STATIC_DRAW)uploads++;return native.apply(this,args);};draw();r.gl.bufferData=native;
  const reused=fx===r.sceneOcclusion&&meshes.every((b,i)=>b===[...r.residentMeshes.values()][i].buffer);
  const output={diagnostics,debug,stages,ao:diff(ao),shadow:diff(shadow),reverse:diff(reverse),moved,reused,uploads,error:r.gl.getError(),failed:!!r.occlusionFailed};
  Object.assign(s,saved);fx?.dispose();c.remove();return output;
 });
 console.log('Geometry probe',JSON.stringify(result),warnings);assert.ok(!result.failed);assert.deepEqual(result.debug,[]);assert.deepEqual(result.stages,{off:0,ao:0,shadow:0});assert.equal(result.error,0);assert.ok(result.ao.dark>100);assert.ok(result.shadow.dark>100);assert.ok(result.moved>100);assert.ok(result.reused);assert.equal(result.uploads,0);
 await page.evaluate(()=>{
  document.getElementById('promo-panel').hidden=true;
  Object.assign(NeonPostFX.settings,{bloom:false,color:false,scanlines:false,vignette:false,distortion:false,ao:false,shadows:false});NeonPostFX.refresh();
  const marker=document.createElement('div');marker.id='curve-probe';marker.style='position:absolute;left:12px;top:120px;width:25px;height:25px;z-index:9999;background:rgb(10,240,30)';document.getElementById('viewport').append(marker);
 });
 async function centroid(){const p=PNG.sync.read(await page.screenshot());let xsum=0,ysum=0,count=0;for(let y=60;y<220;y++)for(let x=0;x<100;x++){const i=(y*p.width+x)*4;if(p.data[i]<25&&p.data[i+1]>220&&p.data[i+2]<45){xsum+=x;ysum+=y;count++;}}return {x:xsum/count,y:ysum/count,count};}
 const flat=await centroid();await page.evaluate(()=>{Object.assign(NeonPostFX.settings,{distortion:true,distortionStrength:.6});NeonPostFX.refresh();});const curved=await centroid();assert.ok(flat.count>100&&curved.count>100&&curved.x>flat.x+3&&curved.y>flat.y+3);
 const source=await page.evaluate(p=>NeonPostFX.samplePoint(p.x,p.y),curved);assert.ok(Math.abs(source.x-flat.x)<3&&Math.abs(source.y-flat.y)<3,JSON.stringify({flat,curved,source}));
 await page.evaluate(()=>document.getElementById('curve-probe').remove());
 await page.evaluate(()=>{document.getElementById('promo-panel').hidden=true;NeonPostFX.reset();});
 for(const [width,height]of [[320,568],[390,844],[1280,900]]){await page.setViewportSize({width,height});await page.waitForFunction(()=>renderer.sceneOcclusion?.gbuffer.w===Math.ceil(renderer.canvas.width/2));assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);}
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(()=>{ElectricEditor.run();if(paused)togglePause();p.hp=p.maxHp=999;});await page.waitForFunction(()=>state==='combat');await page.waitForTimeout(2500);
 await page.screenshot({path:'tests/occlusion-arcade-combat-390.png'});
 await page.locator('#postfx-panel > summary').click();await page.locator('.postfx-group').filter({has:page.locator('[data-setting="shadows"]')}).locator('summary').click();await page.screenshot({path:'tests/occlusion-controls-390.png'});
 const supported=await page.evaluate(()=>{const e=renderer.gl.getExtension('WEBGL_lose_context');if(!e)return false;globalThis.restoreOcclusion=e;e.loseContext();return true;});if(supported){await page.waitForFunction(()=>!renderer.ready);await page.evaluate(()=>restoreOcclusion.restoreContext());await page.waitForFunction(()=>renderer.ready&&renderer.sceneOcclusion?.marker===renderer.program&&renderer.sceneOcclusion.frames>0);}
 assert.deepEqual(errors,[]);assert.deepEqual(warnings,[]);assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);
 console.log('SSAO + directional shadows: real geometry occlusion, changing light direction, retained mesh reuse, no repeated static uploads, 3 sizes, combat, UI and context recovery passed');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {PNG}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?promo=1&mapseed=postfx');
  await page.waitForFunction(()=>globalThis.NeonPostFX&&globalThis.ElectricEditor?.preparing);
  await page.evaluate(()=>{
   document.getElementById('promo-panel').hidden=true;
   const swatch=document.createElement('div');swatch.id='postfx-test-ui';swatch.style='position:absolute;z-index:9999;left:25px;top:240px;width:50px;height:50px;background:rgb(180,120,80)';document.getElementById('viewport').append(swatch);
  });
  async function settings(value){await page.evaluate(value=>{Object.assign(NeonPostFX.settings,value);NeonPostFX.refresh();},value);}
  async function pixel(x=45,y=260){const png=PNG.sync.read(await page.screenshot());const at=(Math.floor(y)*png.width+Math.floor(x))*4;return [...png.data.slice(at,at+3)];}
  await settings({enabled:true,chromatic:false,bloom:false,color:false,vignette:false,distortion:false,ao:false,shadows:false,scanlines:true,scanStrength:.3,scanSpacing:6,scanSpeed:3});
  async function phase(time){return page.evaluate(async time=>{const scan=document.getElementById('postfx-scanlines'),a=scan.getAnimations()[0];a.pause();a.currentTime=time;await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);return new DOMMatrix(getComputedStyle(scan).transform).m42;},time);}
  async function motionPixels(){const p=PNG.sync.read(await page.screenshot());return Array.from({length:30},(_,i)=>p.data[((245+i)*p.width+45)*4]);}
  const downA=await phase(250),motionA=await motionPixels(),downB=await phase(750),motionB=await motionPixels();assert.ok(downB>downA);assert.notDeepEqual(motionA,motionB);
  await settings({scanSpeed:-3});assert.ok(await phase(750)<await phase(250));
  await settings({scanSpeed:0});assert.equal(await page.evaluate(()=>getComputedStyle(document.getElementById('postfx-scanlines')).animationPlayState),'paused');
  await settings({scanSpeed:4,scanSpacing:2,scanStrength:.035});await page.evaluate(()=>document.getElementById('postfx-scanlines').getAnimations()[0].play());
  await settings({enabled:false});const off=await pixel();
  await settings({enabled:true,bloom:false,scanlines:false,vignette:false,color:false,distortion:false,ao:false,shadows:false});assert.deepEqual(await pixel(),off);
  // Opaque black/white edges prove real channel displacement, including exact zero bypass.
  await page.evaluate(()=>{const el=document.getElementById('postfx-test-ui');el.style.width='100px';el.style.background='#000';el.innerHTML='<div style="position:absolute;left:30px;top:0;width:40px;height:50px;background:#fff"></div>';});
  await settings({chromatic:true,chromaticStrength:3});
  assert.deepEqual(await pixel(53,260),[0,0,255]);
  assert.deepEqual(await pixel(56,260),[0,255,255]);
  assert.deepEqual(await pixel(96,260),[255,0,0]);
  await settings({chromaticStrength:0});assert.deepEqual(await pixel(53,260),[0,0,0]);assert.deepEqual(await pixel(56,260),[255,255,255]);
  await settings({chromatic:false,chromaticStrength:3});assert.deepEqual(await pixel(53,260),[0,0,0]);
  await settings({chromatic:true,enabled:false});assert.deepEqual(await pixel(53,260),[0,0,0]);
  await settings({chromatic:false,enabled:true});
  await page.evaluate(()=>{const el=document.getElementById('postfx-test-ui');el.innerHTML='';el.style.width='50px';el.style.background='rgb(180,120,80)';});
  await settings({color:true,redEnabled:false});const red=await pixel();assert.equal(red[0],0);assert.equal(red[1],off[1]);
  // The canvas below the UI is affected by the same compositing filter.
  assert.equal((await pixel(90,300))[0],0);
  await settings({color:false,bloom:true,bloomStrength:1,threshold:.2});const glow=await pixel();assert.ok(glow[0]>off[0]&&glow[1]>off[1]);
  await settings({bloom:false,scanlines:true,scanStrength:.4,scanSpeed:0});assert.ok((await pixel())[1]<off[1]);
  await settings({scanlines:false,vignette:true,vignetteStrength:.6});assert.ok((await pixel())[1]<off[1]);
  await page.evaluate(()=>{NeonPostFX.reset();document.getElementById('postfx-test-ui').remove();});
  await page.locator('#postfx-panel > summary').click();
  const collapsed=await page.locator('#postfx-panel').boundingBox();assert.ok(collapsed.height<844*.5);
  async function group(key){await page.locator('.postfx-group').filter({has:page.locator(`[data-setting="${key}"]`)}).locator('summary').click();}
  await group('chromatic');await page.locator('[data-setting="chromaticStrength"]').fill('1.35');
  await group('bloom');await page.locator('[data-setting="bloomStrength"]').fill('1.12');
  await group('scanlines');await page.locator('[data-setting="scanSpeed"]').fill('-7');
  await group('color');await page.locator('[data-setting="red"]').fill('0.85');
  for(const key of ['redEnabled','greenEnabled','blueEnabled']){await page.locator(`[data-setting="${key}"]`).uncheck();assert.equal(await page.evaluate(key=>NeonPostFX.settings[key],key),false);await page.locator(`[data-setting="${key}"]`).check();}
  assert.equal(await page.locator('.postfx-group[open]').count(),1);
  await page.reload();await page.waitForFunction(()=>globalThis.NeonPostFX&&globalThis.ElectricEditor?.preparing);
  assert.deepEqual(await page.evaluate(()=>[NeonPostFX.settings.bloomStrength,NeonPostFX.settings.red,NeonPostFX.settings.scanSpeed,NeonPostFX.settings.chromaticStrength]),[1.12,.85,-7,1.35]);
  await page.locator('#postfx-panel > summary').click();await page.locator('#postfx-reset').click();
  assert.ok(await page.evaluate(()=>JSON.stringify(NeonPostFX.settings)===JSON.stringify(NeonPostFX.defaults)));
  await group('bloom');
  for(const [width,height]of [[320,568],[390,844],[1280,900]]){
   await page.setViewportSize({width,height});const b=await page.locator('#postfx-panel').boundingBox();assert.ok(b.x>=0&&b.x+b.width<=width+1);assert.ok(b.width<=220&&b.height<height*.5);
   await page.locator('#postfx-reset').scrollIntoViewIfNeeded();const r=await page.locator('#postfx-reset').boundingBox();assert.ok(r.y>=0&&r.y+r.height<=height);
   assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);
  }
  await page.setViewportSize({width:390,height:844});
  const supported=await page.evaluate(()=>{const e=renderer.gl.getExtension('WEBGL_lose_context');if(!e)return false;globalThis.restorePostFX=e;e.loseContext();return true;});
  if(supported){await page.waitForFunction(()=>!renderer.ready);await page.evaluate(()=>restorePostFX.restoreContext());await page.waitForFunction(()=>renderer.ready);assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);}
  await page.locator('#postfx-panel > summary').click();
  await page.evaluate(()=>{document.getElementById('promo-panel').hidden=true;if(paused)togglePause();});
  await page.waitForFunction(()=>ElectricEditor.preparing);await page.evaluate(()=>{ElectricEditor.run();if(paused)togglePause();p.hp=p.maxHp=999;});await page.waitForFunction(()=>state==='combat');
  await page.waitForTimeout(2200);await page.screenshot({path:'tests/postfx-ui-arcade-390.png'});
  await page.locator('#postfx-panel > summary').click();await page.locator('.postfx-controls').evaluate(el=>el.scrollTop=0);await page.screenshot({path:'tests/postfx-compact-390.png'});
  assert.ok(await page.evaluate(()=>document.getElementById('viewport').style.filter.includes('neon-ui-filter')&&!document.getElementById('viewport').contains(document.getElementById('postfx-panel'))));
  assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);
  await page.goto('http://127.0.0.1:4173/?postfx=off');await page.waitForFunction(()=>globalThis.HexMap?.ready&&renderer.ready);
  assert.equal(await page.evaluate(()=>document.getElementById('viewport').style.filter),'none');
  console.log('PostFX whole UI + scene: scrolling scanline pixels/forward/reverse/stop/persistence, actual CRT channel separation/zero/disable and RGB/bloom/scanline/vignette pixels, compact accordion, persistence/reset, 3 sizes, context recovery, combat and URL bypass passed',{off,red,glow});
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

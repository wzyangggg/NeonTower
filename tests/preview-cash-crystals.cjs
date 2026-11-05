const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?electriclab=1');await page.waitForFunction(()=>window.ElectricEditor?.editing);
 await page.evaluate(()=>{window.requestAnimationFrame=()=>0;});await page.waitForTimeout(100);
 await page.evaluate(()=>{ElectricEditor.close();reset();globalThis.RoomReady?.cancel();state='combat';paused=false;timedRoom={duration:999,remaining:999,nextWaveAt:999};ElectricTiles.reset();enemies=[];shots=[];bullets=[];missiles=[];turrets=[];enemyTransports=[];spawnQueue=[];particles=[];p.x=325;p.y=390;p.inv=0;tiles=[];for(let y=-3;y<=3;y++)for(let x=-3;x<=3;x++)tiles.push({x,y});renderer.sceneKey=null;window.gemSounds=0;const original=pickupSound;pickupSound=kind=>{if(kind==='gem')window.gemSounds++;original(kind);};});
 for(const [width,height]of [[390,844],[320,568],[1280,900]]){
  await page.setViewportSize({width,height});
  await page.evaluate(()=>{particles=[];cashPopups=[];p.x=325;p.y=390;const pay=gainCash(4,260,260,75,false);cashBurst(260,260,6,pay);cashBurst(395,250,6);updateParticles(.14);draw();});
  assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);
  await page.screenshot({path:`tests/cash-crystals-scatter-${width}.png`});
  await page.evaluate(()=>{updateParticles(.7);draw();});
  const trail=await page.evaluate(()=>{const gems=particles.filter(q=>q.cashGem);return {samples:gems.some(q=>q.trail.length>5),alpha:renderer.transparentCount};});assert.ok(trail.samples&&trail.alpha>0);
  await page.screenshot({path:`tests/cash-crystals-attract-${width}.png`});
  const result=await page.evaluate(()=>{let sawGlints=false;for(let i=0;i<180&&particles.some(q=>q.cashGem);i++){p.x+=.2;updateParticles(1/60);sawGlints ||= particles.some(q=>q.cashGlint);}draw();return {remaining:particles.filter(q=>q.cashGem).length,sawGlints,sounds:window.gemSounds,popup:cashPopups.find(q=>q.cashPickup)?.text,gl:renderer.gl.getError()};});
  assert.equal(result.remaining,0);assert.equal(result.popup,'金钱 +4');assert.equal(await page.locator('.cash-pickup-popup').count(),1);await page.screenshot({path:`tests/cash-crystals-money-${width}.png`});assert.ok(result.sawGlints&&result.sounds>0);assert.equal(result.gl,0);
  const flash=await page.evaluate(()=>{particles=[];cashGemAbsorb(3);updateParticles(.055);let white=0;const original=renderer.hitModel;renderer.hitModel=function(...args){white=Math.max(white,args[4]||0);return original.apply(this,args);};draw();renderer.hitModel=original;return white;});assert.ok(flash>0&&flash<.43);await page.screenshot({path:`tests/cash-crystals-absorb-${width}.png`});
  assert.ok(await page.evaluate(()=>renderer.residentMeshes.get('pickup-sphere:#64ff90')?.count>0));
  const blueSphere=await page.evaluate(()=>{particles=[];cashGemAbsorb(3,'#64cfff',false);updateParticles(.055);draw();return renderer.residentMeshes.get('pickup-sphere:#64cfff')?.count>0&&renderer.gl.getError()===0;});assert.ok(blueSphere);
  await page.screenshot({path:`tests/skill-crystals-absorb-${width}.png`});
 }
 const skill=await page.evaluate(()=>{testMode=false;particles=[];TalentRuntime.start();const q=TalentRuntime.spawn(250,210,1);TalentRuntime.tick(.2);const scatter=q.height>30&&q.flightAge===0;TalentRuntime.tick(.7);draw();return {scatter,trail:q.trail.length,gl:renderer.gl.getError()};});assert.ok(skill.scatter&&skill.trail>5);assert.equal(skill.gl,0);
 await page.screenshot({path:'tests/skill-crystal-trail.png'});
 const lock=await page.evaluate(()=>{p.x=325;p.y=390;particles=[];const f=ElectricTiles.place('sniper_tower',{x:0,y:0});f.cool=0;f.aim=0;const at=ElectricTiles.facilityCenter(f),e={x:at.x+100,y:at.y,type:'eye',hp:100,max:100,r:14};enemies=[e];ElectricTiles.update(.01);const angle=f.aim;e.y-=100;ElectricTiles.update(.2);const held=f.aim===angle;ElectricTiles.update(.3);const resumed=f.aim!==angle;draw();return {held,resumed,gl:renderer.gl.getError()};});assert.ok(lock.held&&lock.resumed);assert.equal(lock.gl,0);
 await page.evaluate(()=>{particles=[];cashBurst(260,260,3);renderer.initializeGPU();draw();});assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);
 assert.deepEqual(errors,[]);console.log('Real Edge/WebGL: green/blue crystal trails and shared scatter/homing, moving absorption, larger fast glints, mild body flash and pickup audio routing at 320/390/1280 widths; actual sniper recoil hold/resume; GPU rebuild; no page or GL errors.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

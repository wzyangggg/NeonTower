const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?electriclab=1');await page.waitForFunction(()=>globalThis.TileLab?.active);
 await page.locator('#sound-settings-open').click({force:true});
 await page.evaluate(async()=>{sound=true;unlockAudio();await audio.resume();paused=true;});await page.waitForFunction(()=>enemyDeathBuffer&&audio.state==='running');
 const report=await page.evaluate(()=>{
  window.requestAnimationFrame=()=>0;const stop=()=>{for(const v of [...starterShotVoices]){v.stop();starterShotVoices.delete(v);}};stop();enemyDeathAt=-Infinity;
  const explosionRoutes=[];for(const trigger of [()=>spawnExplosionFX(325,245,24),()=>missileBurst({x:325,y:245}),()=>explodeFriendlyRocket({x:325,y:245,blastRadius:40,damage:1,life:1},[]),()=>spawnElementBurst(325,245,24,'missile'),()=>cowboySound('impact'),()=>droneBombImpact({x:325,y:245})]){stop();enemyDeathAt=-Infinity;trigger();explosionRoutes.push(starterShotVoices.size===1&&[...starterShotVoices][0].buffer===enemyDeathBuffer);}stop();enemyDeathAt=-Infinity;deathSound();const routed=[...starterShotVoices].at(-1)?.buffer===enemyDeathBuffer;explosionSound();const throttled=starterShotVoices.size===1;stop();sound=false;enemyDeathAt=-Infinity;deathSound();const muted=starterShotVoices.size===0;sound=true;
  deathBursts=[];particles=[];shatterVisual({x:325,y:245,r:24,type:'crawler'});const velocities=particles.filter(q=>q.chunk).map(q=>Math.hypot(q.vx,q.vy));
  const samples=[];for(const age of [0,.04,.12,.149,.15,.3,.7]){deathBursts[0].age=age;renderer.begin();drawEnemyDeathHighlight(deathBursts[0]);const highlight=renderer.transparentCount>0;renderer.begin();drawDeathBursts();samples.push({age,highlight,finite:renderer.transparentData.subarray(0,renderer.transparentCount).every(Number.isFinite)});}
  return {explosionRoutes,sampleUrl:ENEMY_DEATH_URL,scales:[.03,.06,.1,.13,.15].map(enemyDeathHighlightScale),routed,throttled,muted,duration:enemyDeathBuffer.duration,samples,maxVelocity:Math.max(...velocities)};
 });assert(report.routed&&report.throttled&&report.muted);assert(report.explosionRoutes.every(Boolean));assert.equal(report.sampleUrl,'assets/audio/enemy-death-grenade02.wav');assert.equal(report.scales.at(-1),0);for(let i=1;i<report.scales.length;i++)assert(report.scales[i]<report.scales[i-1]);for(const s of report.samples){assert.equal(s.highlight,s.age<.15);assert(s.finite);}assert(report.maxVelocity>250);
 await page.evaluate(()=>{$('sound-settings').hidden=true;deathBursts[0].age=.04;particles=[];enemies=[];draw();});await page.screenshot({path:__dirname+'/enemy-death-highlight-390.png'});
 await page.evaluate(()=>{deathBursts[0].age=.3;draw();});await page.screenshot({path:__dirname+'/enemy-death-smoke-390.png'});
 assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);assert.deepEqual(errors,[]);console.log('Enemy death recorded sample, mute/throttle, 0.15s highlight boundary, debris velocity and real Edge/WebGL passed',report);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

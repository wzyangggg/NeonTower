const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?electriclab=1');await page.waitForFunction(()=>globalThis.TileLab?.active);await page.locator('#sound-settings-open').click({force:true});
 await page.evaluate(async()=>{sound=true;unlockAudio();await audio.resume();paused=true;});await page.waitForFunction(()=>plasmaLightningBuffer&&gunSoundBuffers.has('cashPickup')&&audio.state==='running');
 const report=await page.evaluate(()=>{
  const stop=()=>{for(const v of [...starterShotVoices]){v.stop();starterShotVoices.delete(v);}};stop();
  state='combat';paused=false;tiles=[];for(let y=-2;y<=2;y++)for(let x=-2;x<=2;x++)tiles.push({x,y});enemies=[];turrets=[];spawnQueue=[];const E=ElectricTiles,f=E.place('electric_tower',{x:0,y:0});
  if(!f)throw Error('tower placement failed');const at=E.facilityCenter(f);spawn({type:'crawler',side:0});Object.assign(enemies.at(-1),{x:at.x+70,y:at.y,hp:500});plasmaLightningAt=-Infinity;
  E.update(2);const voices=[...starterShotVoices],routed=voices.length===1&&voices[0].buffer===plasmaLightningBuffer;stop();
  f.cool=0;E.update(.001);const throttled=starterShotVoices.size===0;
  sound=false;plasmaLightningAt=-Infinity;f.cool=0;E.update(.001);const muted=starterShotVoices.size===0;sound=true;
  enemies=[];plasmaLightningAt=-Infinity;f.cool=0;E.update(.001);const empty=starterShotVoices.size===0;paused=true;
  return {routed,throttled,muted,empty,duration:plasmaLightningBuffer.duration,url:PLASMA_LIGHTNING_URL};
 });assert.ok(report.routed&&report.throttled&&report.muted&&report.empty,JSON.stringify(report));const coexist=await page.evaluate(()=>{
  const stop=()=>{for(const v of [...starterShotVoices]){v.stop();starterShotVoices.delete(v);}};stop();
  state='combat';paused=false;const E=ElectricTiles,f=E.list().find(f=>f.kind==='electric_tower'),at=E.facilityCenter(f);
  enemies=[{type:'eye',x:at.x+60,y:at.y,hp:500,max:500,r:14,t:0,fire:999,seed:0}];
  plasmaLightningAt=-Infinity;plasmaBombAt=-Infinity;f.cool=0;E.update(.001);
  const activated=E.activateEquipmentBomb(createBomb('tower',1)),voices=[...starterShotVoices];
  const tower=voices.some(v=>v.sampleGroup==='lightning'&&v.buffer===plasmaLightningBuffer),bomb=voices.some(v=>v.sampleGroup==='plasmaBomb'&&v.buffer===plasmaLightningBuffer);
  E.activateEquipmentBomb(createBomb('tower',1));const throttled=[...starterShotVoices].filter(v=>v.sampleGroup==='plasmaBomb').length===1;
  stop();sound=false;plasmaBombAt=-Infinity;E.activateEquipmentBomb(createBomb('tower',1));const muted=starterShotVoices.size===0;sound=true;
  enemies=[];plasmaBombAt=-Infinity;const empty=E.activateEquipmentBomb(createBomb('tower',1))===false&&starterShotVoices.size===0;
  const cash=gunSoundBuffers.get('cashPickup');if(!cash)throw Error('cash buffer not preloaded');cashPickupSoundAt=-Infinity;pickupSound('cash');const cashGain=[...starterShotVoices][0].sampleGain.gain.value;stop();paused=true;
  return {activated,tower,bomb,throttled,muted,empty,cashGain};
 });assert(coexist.activated&&coexist.tower&&coexist.bomb&&coexist.throttled&&coexist.muted&&coexist.empty);assert(Math.abs(coexist.cashGain-.25)<1e-6);console.log('Tower and equipment plasma bomb same-frame audio; quieter cash',coexist);
 const hits=await page.evaluate(()=>{
  paused=true;particles=[];const routes=[];
  for(const weaponId of ['tesla','electric-tile']){const before=particles.length;cyberHit({x:325,y:300,r:12},{weaponId,height:18});routes.push(particles.length-before);}
  cyberHit({x:325,y:300,r:12},{plasmaDischarge:true,height:18});
  const impacts=particles.filter(q=>q.electricImpact),shards=particles.filter(q=>q.electricShard);renderer.begin();for(const q of impacts)drawElectricHit(q);for(const q of shards)drawHitSpark(q);
  const finite=renderer.data.subarray(0,renderer.count).every(Number.isFinite)&&renderer.transparentData.subarray(0,renderer.transparentCount).every(Number.isFinite),blob=renderer.transparentCount>0;
  updateParticles(.11);const flashEnded=particles.filter(q=>q.electricImpact).every(q=>q.maxLife-q.life>.1);updateParticles(.2);const cleared=!particles.some(q=>q.electricImpact||q.electricShard);
  particles=[];cyberHit({x:325,y:300,r:12},{weaponId:'tesla',height:18});draw();
  return {routes,impacts:impacts.length,shards:shards.length,finite,blob,flashEnded,cleared,gl:renderer.gl.getError()};
 });assert.deepEqual(hits.routes,[9,9]);assert.equal(hits.impacts,3);assert.equal(hits.shards,24);assert.ok(hits.finite&&hits.blob&&hits.flashEnded&&hits.cleared);assert.equal(hits.gl,0);await page.screenshot({path:'tests/electric-hit-feedback-390.png'});console.log('Electric shared hit flash/blob/shards',hits);assert.deepEqual(errors,[]);console.log('Electric tower recorded lightning sample playback passed',report);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});

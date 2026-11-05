const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?electriclab=1');await page.waitForFunction(()=>globalThis.TileLab?.active);
 await page.locator('#sound-settings-open').click({force:true});
 await page.evaluate(async()=>{sound=true;unlockAudio();await audio.resume();paused=true;});await page.waitForFunction(()=>enemyDeathBuffer&&audio.state==='running');
 const report=await page.evaluate(()=>{
  window.requestAnimationFrame=()=>0;particles=[];enemies=[];deathBursts=[];const t=tiles.find(t=>!coverAlive(t)),c=builderTileCenter(t);p.x=c.x;p.y=c.y;
  shatterVisual({x:c.x,y:c.y,r:10,type:'crawler'});
  const stamped=t.scorchCount===1,airborne=particles.filter(q=>q.deathDebris).length;
  const pixels=t.debrisCanvas.getContext('2d').getImageData(0,0,128,128).data;let maxChroma=0,maxAlpha=0;
  for(let i=0;i<pixels.length;i+=4){maxChroma=Math.max(maxChroma,Math.max(pixels[i],pixels[i+1],pixels[i+2])-Math.min(pixels[i],pixels[i+1],pixels[i+2]));maxAlpha=Math.max(maxAlpha,pixels[i+3]);}
  const saved=t.scorchCount;for(let i=0;i<200;i++)updateParticles(.01);
  const noLandingDecals=!t.debrisCount&&t.scorchCount===saved&&!particles.some(q=>q.deathDebris);
  draw();const texture=renderer.groundDebrisAssets.get(t).texture;draw();const reused=texture===renderer.groundDebrisAssets.get(t).texture&&!t.debrisDirty;
  return {stamped,airborne,maxChroma,maxAlpha,noLandingDecals,reused,gl:renderer.gl.getError()};
 });assert(report.stamped&&report.noLandingDecals&&report.reused);assert.equal(report.airborne,40);assert(report.maxChroma>60);assert(report.maxAlpha>180);assert.equal(report.gl,0);
 await page.evaluate(()=>{$('sound-settings').hidden=true;draw();});await page.screenshot({path:__dirname+'/death-debris-decals-390.png'});
 const cleaned=await page.evaluate(()=>{tiles=[];draw();return renderer.groundDebrisAssets.size===0;});assert(cleaned);assert.deepEqual(errors,[]);console.log('Real Edge: death scorch, colored pixels, no shard landing decals, texture reuse and removed-floor GPU cleanup passed',report);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

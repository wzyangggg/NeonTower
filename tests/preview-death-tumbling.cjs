const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?electriclab=1');await page.waitForFunction(()=>globalThis.TileLab?.active);
 await page.locator('#sound-settings-open').click({force:true});
 await page.evaluate(async()=>{sound=true;unlockAudio();await audio.resume();paused=true;});await page.waitForFunction(()=>enemyDeathBuffer&&audio.state==='running');
 const report=await page.evaluate(()=>{
  window.requestAnimationFrame=()=>0;particles=[];enemies=[];deathBursts=[];tiles=[];for(let y=-3;y<=3;y++)for(let x=-3;x<=3;x++)tiles.push({x,y});p.x=325;p.y=410;
  shatterVisual({x:325,y:300,r:7,type:'crawler'});const shards=particles.filter(q=>q.deathDebris),count=shards.length,q=shards[0],before=[q.angle,q.pitch,q.roll];updateParticles(.08);
  const rotations=[q.angle,q.pitch,q.roll].map((v,i)=>Math.abs(v-before[i])),pose=deathDebrisPose(q),nonYaw=Math.abs(pose[1])+Math.abs(pose[4])+Math.abs(pose[6])+Math.abs(pose[9])>.1;
  deathBursts=[];for(let i=0;i<2;i++)updateParticles(.04);draw();const mesh=[...renderer.residentMeshes.entries()].find(([key])=>key.startsWith('death-debris:')),vertexBuffer=mesh[1].buffer;draw();const reused=!!vertexBuffer&&renderer.residentMeshes.get(mesh[0]).buffer===vertexBuffer;
  const hotLong=shards.every(q=>q.heatLeft>.4);return {hotLong,count,rotations,nonYaw,reused,finite:pose.every(Number.isFinite)};
 });assert.equal(report.count,40);assert(report.rotations.every(v=>v>=1.28-1e-6));assert(report.nonYaw&&report.reused&&report.finite&&report.hotLong);
 await page.evaluate(()=>{$('sound-settings').hidden=true;draw();});await page.screenshot({path:__dirname+'/death-debris-tumbling-390.png'});
 const landing=await page.evaluate(()=>{for(let i=0;i<140;i++)updateParticles(.01);draw();const landed=tiles.reduce((n,t)=>n+(t.debrisCount||0),0);particles=[];for(let i=0;i<20;i++)shatterVisual({x:325,y:300,r:7,type:'crawler'});return {landed,cap:particles.filter(q=>q.deathDebris).length,gl:renderer.gl.getError()};});assert.equal(landing.landed,0);assert.equal(landing.cap,384);assert.equal(landing.gl,0);assert.deepEqual(errors,[]);console.log('Real Edge: 40 shards even for tiny enemies, rapid XYZ tumble, resident buffer reuse, no landing decals and 384 cap passed',report,landing);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

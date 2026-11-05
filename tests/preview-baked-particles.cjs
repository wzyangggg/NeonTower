const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?electriclab=1');await page.waitForFunction(()=>globalThis.TileLab?.active);
 await page.evaluate(()=>{paused=true;window.requestAnimationFrame=()=>0;});await page.waitForTimeout(100);
 const report=await page.evaluate(()=>{
  const tile=tiles.find(t=>!coverAlive(t)),at=builderTileCenter(tile),base={x:at.x,y:at.y,height:30,life:.12,maxLife:.24,vx:90,vy:70,c:'#88efff',size:7,angle:.4,length:9,age:.12,heatLeft:.3};
  globalThis.bakedFixtures=[{...base},{...base,casing:true},{...base,hitSpark:true},{...base,electricImpact:true},{...base,pickupAura:true},{...base,pickupSpark:true},{...base,pickupSpark:true,cashGlint:true},{...base,juicyImpact:true,variant:2},{...base,chunk:true},{...base,chunk:true,deathDebris:true},{...base,cashGem:true,trail:[{x:at.x-20,y:at.y-10,height:20,age:.02}]}];
  const r=renderer,render=()=>{r.begin();for(const q of bakedFixtures)drawParticle(q);r.end();};render();for(const q of bakedFixtures)q.life=.2;render();
  const meshes=[...r.particleBakes.values()],buffers=meshes.map(m=>m.buffer),resident=[...r.residentMeshes.values()].map(m=>m.buffer),size=r.particleBakes.size;
  let staticUploads=0,instanceUploads=0;const upload=r.gl.bufferData.bind(r.gl),sub=r.gl.bufferSubData.bind(r.gl);r.gl.bufferData=(target,data,usage)=>{if(usage===r.gl.STATIC_DRAW)staticUploads++;return upload(target,data,usage);};r.gl.bufferSubData=(...args)=>{instanceUploads++;return sub(...args);};
  for(let i=0;i<60;i++){for(const q of bakedFixtures){q.x+=.05;q.life=.05+i%17*.01;}render();}
  r.gl.bufferData=upload;r.gl.bufferSubData=sub;
  const snapshot=r.particleSurfaceSnapshot(),sameBuffers=buffers.every((b,i)=>b===meshes[i].buffer),finite=snapshot.every(Number.isFinite),dynamic=[r.count,r.transparentCount],stats={meshKinds:size,sameBuffers,staticUploads,instanceUploads,finite,dynamic,gl:r.gl.getError()};
  // No instancing extension: same immutable buffers, constant vertex attributes per instance.
  const ext=r.residentExtension;r.residentExtension=null;render();stats.fallbackGL=r.gl.getError();r.residentExtension=ext;
  particles=bakedFixtures;draw();return stats;
 });
 assert.deepEqual(report.dynamic,[0,0]);assert(report.sameBuffers&&report.finite);assert.equal(report.staticUploads,0);assert(report.instanceUploads>0);assert.equal(report.gl,0);assert.equal(report.fallbackGL,0);
 await page.screenshot({path:__dirname+'/baked-particles-390.png'});

 const bounded=await page.evaluate(()=>{deathBursts=[];spawnDeathBurst(325,300,16,'boss',26);const cycle=()=>{for(let i=0;i<100;i++){deathBursts[0].age=i*.012;renderer.begin();drawDeathBursts();renderer.end();}};cycle();const count=renderer.particleBakes.size;cycle();return {count,after:renderer.particleBakes.size,gl:renderer.gl.getError()};});assert.equal(bounded.count,bounded.after);assert.equal(bounded.gl,0);
 // Real context loss/recovery must recreate buffers and shader for cached surfaces.
 await page.evaluate(()=>{globalThis.loss=renderer.gl.getExtension('WEBGL_lose_context');loss.loseContext();});await page.waitForTimeout(100);await page.evaluate(()=>loss.restoreContext());await page.waitForFunction(()=>renderer.ready&&!renderer.gl.isContextLost());
 const restored=await page.evaluate(()=>{renderer.begin();for(const q of bakedFixtures)drawParticle(q);renderer.end();return {count:renderer.particleBakes.size,gl:renderer.gl.getError()};});assert(restored.count>0);assert.equal(restored.gl,0);assert.deepEqual(errors,[]);
 console.log('Real Edge baked particles: all dispatch branches, no dynamic geometry, warmed static buffers reused, instance uploads, fallback and context restore passed',report,restored);
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1;});

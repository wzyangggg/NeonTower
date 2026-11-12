const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const path=require('node:path');

(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:4173/?missilelab=1');
  await page.waitForFunction(()=>globalThis.MissileLab&&document.querySelector('#ember-smoke'));
  const report=await page.evaluate(()=>{
   paused=true;
   const {DT,GpuFluid}=EmberLab,step=GpuFluid.prototype.step,solvers=new Set();
   let first,lastSource;
   GpuFluid.prototype.step=function(sources,...args){
    solvers.add(this);
    first??=this;
    lastSource=sources.find(source=>source.paleSmoke&&source.fuel===0&&source.amount>0)??lastSource;
    return step.call(this,sources,...args);
   };
   function emit(projectile,x,z,angle){
    renderer.begin();
    paused=false;
    drawMetalMissile(x,16,z,angle,'blue',projectile);
    paused=true;
    ParticleSmoke.update(DT);
   }
   const directions=[];
   for(const angle of [0,Math.PI/2,Math.PI,Math.PI*1.5]){
    clearMissileSmoke();ParticleSmoke.clear();lastSource=null;
    time+=DT;
    emit({},0,0,angle);
    directions.push({angle,backward:lastSource.jetX*Math.cos(angle)-lastSource.lift*Math.sin(angle),
     heat:lastSource.heat,pale:lastSource.paleSmoke});
   }
   const solver=first,{gl,n,fbo}=solver;
   function centroid(){
    const pixels=new Float32Array(n*n*4);
    gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);
    solver.target(solver.material);
    gl.readPixels(0,0,n,n,gl.RGBA,gl.FLOAT,pixels);
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    let mass=0,moment=0;
    for(let i=0;i<pixels.length;i+=4){
     mass+=pixels[i];
     moment+=pixels[i]*(((i/4)%n+.5)/n-.5)*1344;
    }
    return {mass,x:moment/mass};
   }
   const plumes=[];
   for(const angle of [0,Math.PI]){
    clearMissileSmoke();ParticleSmoke.clear();
    const projectile={};
    for(let i=0;i<24;i++){time+=DT;emit(projectile,0,0,angle);}
    plumes.push(centroid());
   }
   clearMissileSmoke();ParticleSmoke.clear();
   const projectile={};
   time+=DT;emit(projectile,-35,0,0);
   time+=DT;emit(projectile,-20,0,.2);
   const swept=Math.hypot(lastSource.sweepX,lastSource.sweepY)*1344;
   spawnExplosionFX(325,300,48);
   ParticleSmoke.update(DT);
   const shared=solvers.size;
   clearMissileSmoke();
   const before=centroid();
   for(let i=0;i<120;i++)ParticleSmoke.update(DT);
   const expired=document.getElementById('ember-smoke').style.display==='none';
   const glError=gl.getError();
   paused=false;
   return {directions,plumes,swept,shared,before,expired,glError};
  });
  for(const direction of report.directions){
   assert.ok(Math.abs(direction.backward+1.2)<.001,JSON.stringify(direction));
   assert.ok(direction.heat>0&&direction.pale);
  }
  assert.ok(report.plumes[0].x<-8&&report.plumes[1].x>8,JSON.stringify(report.plumes));
  assert.ok(report.swept>10,JSON.stringify(report));
  assert.equal(report.shared,1);
  assert.ok(report.before.mass>0&&report.expired);
  assert.equal(report.glError,0);
  await page.locator('#missile-replay').click();
  await page.waitForTimeout(1200);
  await page.locator('#missile-play').click();
  const stopped=await page.evaluate(()=>time);
  await page.waitForTimeout(200);
  assert.equal(await page.evaluate(()=>time),stopped);
  if(process.env.EMBER_SCREENSHOTS)await page.screenshot({path:path.join(process.env.EMBER_SCREENSHOTS,'missile-plume-390.png')});
  await page.locator('#missile-speed').click();
  assert.equal(await page.locator('#missile-speed').getAttribute('aria-pressed'),'true');
  await page.locator('#missile-play').click();
  await page.waitForFunction(start=>time>start+.1,stopped);
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify(report,null,2));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const path=require('node:path');

(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:4173/?weaponlab=1&weapon=rocket_t3&smokeblast=far');
  await page.waitForSelector('.smoke-blast-compare');
  assert.equal(await page.evaluate(()=>weaponLab.firing),false);
  assert.equal(await page.evaluate(()=>EmberExplosions.blastMode),'far');
  const physics=await page.evaluate(()=>{
   paused=true;
   const effect=EmberExplosions,{DT,GpuFluid}=EmberLab,step=GpuFluid.prototype.step;
   let solver;
   const used=new Set();
   GpuFluid.prototype.step=function(...args){solver=this;used.add(this);return step.apply(this,args);};
   function read(texture){
    const {gl,n,fbo}=solver,pixels=new Float32Array(n*n*4);
    gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);
    solver.target(texture);
    gl.readPixels(0,0,n,n,gl.RGBA,gl.FLOAT,pixels);
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    return pixels;
   }
   function run(mode,second){
    effect.setBlastMode(mode);
    effect.emitShared(renderer,-50,0,48,{paleSmoke:true,random:effect.createRandom(1234)});
    for(let i=0;i<14;i++){
     if(second&&i===6)effect.emitShared(renderer,60,0,48,{paleSmoke:true,shockOnly:true,random:effect.createRandom(5678)});
     effect.update(DT);
    }
    effect.draw(renderer);
    const pixels=read(solver.material),{n,gl}=solver;
    let mass=0,xMoment=0,radius2=0;
    for(let i=0;i<pixels.length;i+=4){
     const weight=pixels[i],x=(((i/4)%n+.5)/n-.5)*1344,z=((Math.floor(i/4/n)+.5)/n-.5)*1344;
     mass+=weight;xMoment+=weight*x;radius2+=weight*((x+50)**2+z*z);
    }
    return {mass,x:xMoment/mass,rms:Math.sqrt(radius2/mass),resolution:n,glError:gl.getError()};
   }
   const standard=run('standard',false),far=run('far',false);
   const standardHit=run('standard',true),farHit=run('far',true);
   effect.setBlastMode('far');
   const cleared=document.getElementById('ember-smoke').style.display==='none';
   paused=false;
   return {standard,far,standardHit,farHit,cleared,solvers:used.size};
  });
  assert.ok(physics.far.rms>physics.standard.rms*1.5,JSON.stringify(physics));
  assert.ok(physics.far.x-physics.farHit.x>20,JSON.stringify(physics));
  assert.ok(physics.farHit.rms>physics.standardHit.rms*2,JSON.stringify(physics));
  assert.ok(physics.cleared);
  assert.equal(physics.standard.resolution,192);
  assert.equal(physics.far.resolution,256);
  for(const item of [physics.standard,physics.far,physics.standardHit,physics.farHit])assert.equal(item.glError,0);
  const panel=page.locator('.smoke-blast-compare');
  await page.evaluate(()=>{
   const spawn=spawnExplosionFX;
   window.compareBursts=[];
   spawnExplosionFX=function(...args){compareBursts.push({time,x:args[0],y:args[1]});return spawn(...args);};
  });
  await panel.getByRole('button',{name:'连续引爆四次'}).click();
  await page.waitForFunction(()=>compareBursts.length===4);
  const sequence=await page.evaluate(()=>compareBursts);
  for(let i=1;i<sequence.length;i++)assert.ok(sequence[i].time-sequence[i-1].time>=.14);
  await page.waitForFunction(last=>time>=last+.28,sequence.at(-1).time);
  await page.evaluate(()=>{paused=true;draw();});
  if(process.env.EMBER_SCREENSHOTS)await page.screenshot({path:path.join(process.env.EMBER_SCREENSHOTS,'smoke-blast-far-390.png')});
  await panel.getByRole('button',{name:'标准',exact:true}).click();
  assert.equal(await page.evaluate(()=>EmberExplosions.blastMode),'standard');
  assert.ok(new URL(page.url()).searchParams.get('smokeblast')==='standard');
  assert.equal(await page.evaluate(()=>document.querySelector('#ember-smoke').style.display),'none');
  const recovery=await page.evaluate(()=>{
   const effect=EmberExplosions,{GpuFluid,DT}=EmberLab;
   effect.emitShared(renderer,0,0,48);
   effect.update(DT);
   effect.draw(renderer);
   const previous=document.getElementById('ember-smoke'),step=GpuFluid.prototype.step;
   GpuFluid.prototype.step=function(){throw Error('Smoke solver interruption');};
   try{effect.update(DT);}
   finally{GpuFluid.prototype.step=step;}
   const removed=!previous.isConnected;
   effect.emitShared(renderer,0,0,48);
   effect.update(DT);
   effect.draw(renderer);
   const current=document.getElementById('ember-smoke');
   return removed&&current!==previous&&current.style.display!=='none';
  });
  assert.equal(recovery,true);
  for(const width of [320,1280]){
   await page.setViewportSize({width,height:844});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  }
  await page.goto('http://127.0.0.1:4173/?mapseed=elevator-01');
  await page.waitForFunction(()=>window.HexMap?.ready);
  assert.equal(await page.evaluate(()=>EmberExplosions.blastMode),'standard');
  assert.equal(await page.locator('.smoke-blast-compare').count(),0);
  await page.goto('http://127.0.0.1:4173/?smokeblast=far&mapseed=elevator-01');
  await page.waitForSelector('.smoke-blast-compare',{state:'attached'});
  assert.equal(await page.locator('.smoke-blast-compare').isHidden(),true);
  await page.evaluate(()=>{reset();ElectricEditor.reset();testMode=true;startWave();});
  await page.waitForSelector('.smoke-blast-compare',{state:'visible'});
  assert.equal(await page.evaluate(()=>EmberExplosions.blastMode),'far');
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({physics,sequence},null,2));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

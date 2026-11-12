const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');

(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  async function replay(withSecond,shockOnly=false){
   const page=await browser.newPage({viewport:{width:390,height:844}});
   const errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto('http://127.0.0.1:4173/?mapseed=elevator-01');
   await page.waitForFunction(()=>window.HexMap?.ready);
   const report=await page.evaluate(({withSecond,shockOnly})=>{
    reset();
    ElectricEditor.reset();
    testMode=true;
    startWave();
    testMode=false;
    paused=true;
    draw();
    const proto=EmberLab.GpuFluid.prototype,{step,dispose}=proto;
    const used=new Set(),disposed=new Set();
    let first,maxSources=0,pale=false,colored=false;
    proto.step=function(sources,...args){
     used.add(this);
     first??=this;
     maxSources=Math.max(maxSources,sources.length??1);
     // Suppress the right-hand burst's pigment to track only the existing smoke.
     const emitters=shockOnly?sources.filter(source=>source.x<.49||source.amount===0):sources;
     pale||=emitters.some(source=>source.amount>0&&source.paleSmoke);
     colored||=emitters.some(source=>source.amount>0&&!source.paleSmoke);
     return step.call(this,emitters,...args);
    };
    proto.dispose=function(){disposed.add(this);return dispose.call(this);};
    const tick=()=>ParticleSmoke.update(EmberLab.DT);
    shatter({x:255,y:350,r:29,type:'eye',hp:0});
    for(let i=0;i<6;i++)tick();
    if(withSecond)explodeFriendlyRocket({x:345,y:350,originX:180,originY:350,vx:120,vy:0,blastRadius:48,damage:1,source:'weapon'},[]);
    for(let i=0;i<3;i++)tick();
    draw();
    const {gl,n,fbo}=first;
    function read(texture){
     const pixels=new Float32Array(n*n*4);
     gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);
     first.target(texture);
     gl.readPixels(0,0,n,n,gl.RGBA,gl.FLOAT,pixels);
     gl.bindFramebuffer(gl.FRAMEBUFFER,null);
     return pixels;
    }
    const flow=read(first.velocity), density=read(first.material);
    let mass=0,vx=0,xMoment=0,total=0,totalX=0,totalY=0;
    // West of the second source's emission radius, so this sample contains old smoke.
    for(let row=0;row<n;row++)for(let col=0;col<n;col++){
     const x=(col+.5)/n,z=(row+.5)/n,i=(row*n+col)*4;
     total+=density[i];
     totalX+=x*density[i];
     totalY+=z*density[i];
     if(x<.40||x>.47||z<.43||z>.49)continue;
     mass+=density[i];
     vx+=flow[i]*density[i];
     xMoment+=x*density[i];
    }
    const stats={mass,vx:vx/mass,x:xMoment/mass};
    const center=renderer.screenPoint((totalX/total-.5)*1344,16,(.5-totalY/total)*1344);
    const beforeCrowd=used.size;
    const mixed=pale&&colored;
    spawnElementBurst(280,350,30,'ice');
    const boss={x:325,y:250,type:'virus',r:35,hp:0,max:100};
    beginBossDeath([boss]);
    beginPlayerDeath();
    const kinds=deathBursts.filter(burst=>burst.particleSmoke).map(burst=>burst.kind);
    explodeFriendlyRocket({x:325,y:360,originX:180,originY:360,vx:120,vy:0,blastRadius:75,damage:1,source:'weapon',
     evolution:{familyId:'rocket'},ownerItem:{familyId:'rocket',quake:true}},[]);
    const nuclear=explosionFX.at(-1);
    for(let i=0;i<6;i++)spawnExplosionFX(220+i*42,430,36);
    for(let i=0;i<4;i++)tick();
    const glError=gl.getError();
    returnToMainMenu();
    return {stats,center,mixed,kinds,nuclearSmoke:nuclear.nuclear&&nuclear.particleSmoke,grid:n,beforeCrowd,solvers:used.size,disposed:disposed.size,maxSources,
     smokeLayer:!!$('ember-smoke'),glError};
   },{withSecond,shockOnly});
   assert.deepEqual(errors,[]);
   await page.close();
   return report;
  }
  const single=await replay(false),shared=await replay(true),shock=await replay(true,true);
  assert.ok(single.stats.mass>1&&shared.stats.mass>1);
  const displacement=single.center.x-shock.center.x;
  assert.ok(displacement>=5&&displacement<=25,JSON.stringify({single,shock,displacement}));
  for(const result of [single,shared,shock]){
   assert.deepEqual(result.kinds,['enemy','element','boss','player']);
   assert.equal(result.nuclearSmoke,true);
   assert.equal(result.grid,192);
   assert.equal(result.beforeCrowd,1);
   assert.equal(result.solvers,1);
   assert.equal(result.disposed,1);
   assert.equal(result.maxSources,4);
   assert.equal(result.smokeLayer,false);
   assert.equal(result.glError,0);
  }
  assert.equal(shared.mixed,true);
  const lab=await browser.newPage({viewport:{width:390,height:844}});
  const labErrors=[];
  lab.on('pageerror',error=>labErrors.push(error.message));
  await lab.addInitScript(()=>{
   const requestFrame=window.requestAnimationFrame.bind(window);
   // A frame timestamp can precede a clock read made by the click handler.
   window.requestAnimationFrame=callback=>requestFrame(time=>callback(time-1000));
  });
  await lab.goto('http://127.0.0.1:4173/smoke-interference-lab.html');
  assert.equal(await lab.locator('#error').isHidden(),true);
  assert.equal(await lab.locator('[data-mode="shared"]').getAttribute('aria-pressed'),'true');
  assert.equal(await lab.locator('#trail').isChecked(),true);
  await lab.locator('#trail').uncheck();
  await lab.evaluate(()=>{
   const proto=EmberLab.GpuFluid.prototype,{step}=proto;
   window.labSolvers=new Set();
   proto.step=function(...args){
    labSolvers.add(this);
    return step.apply(this,args);
   };
  });
  async function sampleLab(mode,frame){
   await lab.locator('#frame').evaluate((input,value)=>{
    input.value=value;
    input.dispatchEvent(new Event('input',{bubbles:true}));
    labSolvers.clear();
   },frame);
   await lab.locator(`[data-mode="${mode}"]`).click();
   assert.equal(await lab.locator('#frame').inputValue(),String(frame));
   return lab.evaluate(()=>{
    const solver=[...labSolvers][0],{gl,n,fbo}=solver;
    const pixels=new Float32Array(n*n*4);
    gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);
    solver.target(solver.material);
    gl.readPixels(0,0,n,n,gl.RGBA,gl.FLOAT,pixels);
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    let mass=0,xMoment=0,trailMass=0,trailX=0,trailZ=0;
    for(let i=0;i<pixels.length;i+=4){
     mass+=pixels[i];
     xMoment+=pixels[i]*((i/4)%n+.5)/n;
    }
    if(document.getElementById('trail').checked){
     gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);
     solver.target(solver.dye);
     gl.readPixels(0,0,n,n,gl.RGBA,gl.FLOAT,pixels);
     gl.bindFramebuffer(gl.FRAMEBUFFER,null);
     for(let i=0;i<pixels.length;i+=4){
      const cyan=Math.max(0,-pixels[i]);
      trailMass+=cyan;
      trailX+=cyan*((i/4)%n+.5)/n;
      trailZ+=cyan*(Math.floor(i/4/n)+.5)/n;
     }
    }
    return {mass,x:xMoment/mass,trailMass,trailX:trailMass?trailX/trailMass:null,
     trailZ:trailMass?(.5-trailZ/trailMass)*1344:null,grid:n,solvers:labSolvers.size,glError:gl.getError()};
   });
  }
  const beforeA=await sampleLab('single',3),beforeShock=await sampleLab('shock',3);
  assert.deepEqual(beforeA,beforeShock);
  const labSingle=await sampleLab('single',14),labShock=await sampleLab('shock',14);
  const labDisplacement=(labSingle.x-labShock.x)*1344;
  assert.ok(labDisplacement>30&&labDisplacement<120,JSON.stringify({labSingle,labShock,labDisplacement}));
  assert.ok(labShock.mass>0&&labShock.solvers===1&&labShock.glError===0);
  const labShared=await sampleLab('shared',14);
  assert.ok(labShared.mass>labShock.mass&&labShared.grid===192&&labShared.solvers===1&&labShared.glError===0);
  if(process.env.EMBER_SCREENSHOTS)await lab.screenshot({path:require('node:path').join(process.env.EMBER_SCREENSHOTS,'smoke-interference-390.png')});
  for(const [frame,expectedSolvers] of [[3,1],[4,2],[7,3]]){
   assert.equal((await sampleLab('separate',frame)).solvers,expectedSolvers);
  }
  const labSeparate=await sampleLab('separate',14);
  assert.ok(labSeparate.solvers===4&&labSeparate.glError===0);
  assert.equal(await lab.locator('#error').isHidden(),true);
  if(process.env.EMBER_SCREENSHOTS)await lab.screenshot({path:require('node:path').join(process.env.EMBER_SCREENSHOTS,'smoke-interference-separate-390.png')});
  assert.deepEqual(await sampleLab('shared',14),labShared);
  await lab.locator('#step').click();
  assert.equal(await lab.locator('#frame').inputValue(),'15');
  await lab.locator('#replay').click();
  await lab.waitForFunction(()=>{
   const slider=document.getElementById('frame');
   return slider.value===slider.max&&document.getElementById('play').textContent==='继续';
  },null,{timeout:10000});
  await lab.locator('#replay').click();
  await lab.waitForFunction(()=>Number(document.getElementById('frame').value)>=4);
  await lab.locator('#play').click();
  assert.equal(await lab.locator('#play').textContent(),'继续');
  await sampleLab('shock',14);
  const stage=await lab.locator('#scene').boundingBox(),centerX=stage.x+stage.width/2;
  for(const letter of ['a','b','c','d']){
   const marker=lab.locator('#source-'+letter);
   const {x,y,width,height}=await marker.boundingBox();
   const startX=x+width/2, startY=y+height/2, endX=2*centerX-startX;
   await lab.mouse.move(startX,startY);
   await lab.mouse.down();
   await lab.mouse.move(endX,startY,{steps:5});
   await lab.mouse.up();
   const moved=await marker.boundingBox();
   assert.ok(Math.abs(moved.x+moved.width/2-endX)<1,letter);
   assert.equal(await lab.locator('#frame').inputValue(),'14');
  }
  const mirroredSingle=await sampleLab('single',14),mirroredShock=await sampleLab('shock',14);
  assert.ok((mirroredShock.x-mirroredSingle.x)*1344>30,JSON.stringify({mirroredSingle,mirroredShock}));
  const movedA=await lab.locator('#source-a').boundingBox();
  await lab.locator('#source-a').press('ArrowRight');
  assert.ok((await lab.locator('#source-a').boundingBox()).x>movedA.x);
  await lab.locator('#reset-positions').click();
  assert.deepEqual(await sampleLab('shock',14),labShock);
  await lab.locator('#trail').check();
  const trailLead=await sampleLab('single',0);
  const trailControl=await sampleLab('single',14),trailHit=await sampleLab('shock',14);
  assert.ok(trailLead.trailMass>1&&trailHit.trailMass>1);
  assert.ok(Math.abs(trailControl.trailX-trailHit.trailX)*1344>8,JSON.stringify({trailControl,trailHit}));
  const trailLate=await sampleLab('shared',60);
  assert.ok(trailLate.trailMass>1&&trailLate.solvers===1&&trailLate.glError===0,JSON.stringify(trailLate));
  const independentTrail=await sampleLab('separate',14);
  assert.ok(independentTrail.solvers===5&&independentTrail.trailMass>1&&independentTrail.glError===0);
  await sampleLab('shared',14);
  if(process.env.EMBER_SCREENSHOTS)await lab.screenshot({path:require('node:path').join(process.env.EMBER_SCREENSHOTS,'smoke-interference-trail-390.png')});
  const rising=await sampleLab('smoke',120);
  await lab.locator('#rise').evaluate(input=>{input.value=0;input.dispatchEvent(new Event('input'));});
  const cold=await sampleLab('smoke',120);
  assert.ok(cold.trailZ-rising.trailZ>50,JSON.stringify({rising,cold}));
  assert.equal(rising.solvers,1);
  await lab.locator('#rise').evaluate(input=>{input.value=2.2;input.dispatchEvent(new Event('input'));});
  await lab.locator('#trail-motion').selectOption('moving');
  const moving=await sampleLab('smoke',150);
  assert.ok(moving.trailMass>1&&moving.glError===0);
  for(const width of [320,1280]){
   await lab.setViewportSize({width,height:844});
   assert.equal(await lab.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  }
  assert.deepEqual(labErrors,[]);
  await lab.close();
  console.log(JSON.stringify({single,shared,shock,displacement,labSingle,labShock,labDisplacement,labShared,labSeparate,trailControl,trailHit,trailLate},null,2));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

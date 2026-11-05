const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?weaponlab=1');
 await page.waitForFunction(()=>window.HexMap?.ready&&typeof weaponLab!=='undefined'&&weaponLab.active);
 await page.evaluate(()=>{paused=true;weaponLab.firing=false;window.requestAnimationFrame=()=>0;});
 await page.waitForTimeout(100);
 for(const kind of ['ordinary','rocket_t3','rocket_t5']){
  await page.evaluate(kind=>{
   weaponLab.select(kind==='ordinary'?'pistol_t1':kind);weaponLab.firing=false;paused=true;enemies=[];shots=[];particles=[];explosionFX=[];p.x=325;p.y=420;shake=0;
   if(kind==='ordinary')spawnExplosionFX(325,245,64);
   else{shootWeapon(-Math.PI/2);const s=shots.find(s=>s.blastRadius);s.x=325;s.y=245;explodeFriendlyRocket(s,[]);shots=[];particles=[];}
   clearTimeout(toast.timer);$('toast').classList.remove('show');
  },kind);
  for(const age of [.03,.12,.149,.15,.3,.55,.8,.85]){
   const info=await page.evaluate(age=>{
    const fx=explosionFX[0];fx.t=age;
    renderer.begin();drawExplosionFlash(fx);const flash=renderer.transparentCount>0;
    renderer.begin();drawExplosionSparks(fx);const sparks=renderer.transparentCount>0;
    renderer.begin();drawExplosionClouds(fx);let maxAlpha=0,extent=0;
    for(let i=0;i<renderer.transparentCount;i+=7){maxAlpha=Math.max(maxAlpha,renderer.transparentData[i+6]);extent=Math.max(extent,Math.abs(renderer.transparentData[i]-(fx.x-325)));}
    draw();return {flash,sparks,maxAlpha,extent,radius:fx.radius,finite:renderer.transparentData.subarray(0,renderer.transparentCount).every(Number.isFinite),gl:renderer.gl.getError()};
   },age);
   assert.equal(info.flash,age<.15);assert.equal(info.sparks,age<.85);assert.ok(info.finite);assert.equal(info.gl,0);
   if(age===.3){assert.ok(info.maxAlpha>.3);assert.ok(info.extent>info.radius);}
   await page.screenshot({path:path.join(__dirname,`explosion-timing-${kind}-${String(age).replace('.','_')}-390x844.png`)});
  }
 }
 await page.setViewportSize({width:390,height:680});
 await page.evaluate(()=>{explosionFX[0].t=.3;draw();});
 await page.screenshot({path:path.join(__dirname,'explosion-timing-rocket_t5-0_3-390x680.png')});
 const lost=await page.evaluate(()=>{const ext=renderer.gl.getExtension('WEBGL_lose_context');if(!ext)return false;ext.loseContext();setTimeout(()=>ext.restoreContext(),100);return true;});
 if(lost){await page.waitForTimeout(500);assert.equal(await page.evaluate(()=>{draw();return renderer.ready&&renderer.gl.getError()===0;}),true);}
 assert.deepEqual(errors,[]);
 console.log('Real Edge/WebGL explosion timing: ordinary/rocket/nuclear, 0.15s flash, radial dense smoke, sparks through 0.8s/end0.85s, 8 key times, two portrait sizes and context restore passed.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

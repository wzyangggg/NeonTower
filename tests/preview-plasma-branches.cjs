const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>window.HexMap?.ready&&window.ElectricEditor);
  await page.evaluate(()=>{window.requestAnimationFrame=()=>0;});await page.waitForTimeout(100);
  for(const [width,height] of [[390,844],[320,568],[1280,900]]){
   await page.setViewportSize({width,height});
   const result=await page.evaluate(()=>{
    reset();ElectricEditor.reset();state='combat';paused=false;timedRoom={duration:999,remaining:999,nextWaveAt:999};
    enemies=[];enemyTransports=[];spawnQueue=[];bullets=[];missiles=[];shots=[];hazards=[];turrets=[];p.inv=999;shootTimer=999;p.x=325;p.y=300;
    // A surrounding crowd makes the player roots and secondary forks visible together.
    for(let i=0;i<12;i++){const a=i*TAU/12,radius=i%2?155:105,x=p.x+Math.cos(a)*radius,y=p.y+Math.sin(a)*radius;enemies.push({type:'eye',x,y,homeX:x,homeY:y,hp:500,max:500,r:14,t:0,fire:999,seed:i});}
    equipItem('bomb',createBomb('tower',3));updateBombEquipment(15);const discharge=shots[0];step(.01);
    const beam=modelBeam,calls=[];modelBeam=(...args)=>{calls.push(args);beam(...args);};draw();modelBeam=beam;
    const v=modelVisual(createWeaponModel('tesla_t3'));
    return {roots:discharge.arcSegments.filter(e=>e.from===p).length,forks:discharge.arcTargets.filter(t=>discharge.arcSegments.filter(e=>e.from===t).length===2).length,colors:[...new Set(calls.map(c=>c[6]))],expected:[v.color,v.accent],gl:renderer.gl.getError()};
   });
   assert.equal(result.roots,3);assert(result.forks>=2);assert.deepEqual(result.colors.sort(),result.expected.sort());assert.equal(result.gl,0);
   await page.screenshot({path:`tests/plasma-branches-${width}x${height}.png`});
  }
  assert.deepEqual(errors,[]);console.log('Plasma branches browser: player roots, secondary forks, actual dual color render, 320/390/1280 screenshots and no page/GL errors passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});

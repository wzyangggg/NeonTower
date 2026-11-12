const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const [width,height]of [[390,844],[320,568],[1280,900]]){
  await page.setViewportSize({width,height});await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>globalThis.HexMap?.ready);
  await page.waitForSelector('.difficulty-panel');assert.equal(await page.locator('.title-brand').count(),1);assert.equal(await page.locator('#difficulty-back').count(),0);
  for(let level=1;level<=5;level++){
   if(level>1)await page.locator('[data-difficulty-step="1"]').click();assert.equal(await page.locator('.difficulty-stars .lit').count(),level);assert.equal(await page.locator('.disc-label b').textContent(),'Lv'+level);assert.equal(await page.locator('.difficulty-progress').isVisible(),false);
   assert.equal(await page.locator('#start').isDisabled(),level>1);
   assert.equal(await page.locator('.difficulty-panel').getAttribute('data-disc'),String(level));
   assert.equal(await page.locator('.difficulty-track strong').textContent(),['Pixel Battle (1)','Underground Groove (1)','Underground Groove','Mechanical Combat','Relentless Minor'][level-1]);
   if(width===390)await page.screenshot({path:`tests/difficulty-album-${level}.png`});
   if(width===390&&level===1){
    const motion=await page.evaluate(async()=>{
     const disc=document.querySelector('.difficulty-disc'),label=disc.querySelector('b'),halo=document.querySelector('.difficulty-disc-halo'),animation=disc.getAnimations().find(a=>a.animationName==='disc-iridescence');
     if(!animation)throw Error('missing disc iridescence');animation.pause();animation.currentTime=0;await new Promise(requestAnimationFrame);
     const sample=()=>({surface:getComputedStyle(disc).backgroundImage,flow:getComputedStyle(disc).getPropertyValue('--disc-flow'),rect:JSON.stringify(label.getBoundingClientRect()),transform:getComputedStyle(label).transform,text:label.textContent});
     const before=sample();animation.currentTime=5000;await new Promise(requestAnimationFrame);const after=sample();animation.play();return {before,after,glow:getComputedStyle(halo).filter};
    });
    assert.notEqual(motion.before.surface,motion.after.surface);assert.notEqual(motion.before.flow,motion.after.flow);assert.equal(motion.before.rect,motion.after.rect);assert.equal(motion.after.transform,'none');assert.equal(motion.after.text,'Lv1');assert.ok(motion.glow.includes('drop-shadow'));
    await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.difficulty-disc').evaluate(e=>getComputedStyle(e).animationName),'none');await page.emulateMedia({reducedMotion:'no-preference'});
   }
   assert.equal(await page.evaluate(()=>state),'menu');
   const layout=await page.evaluate(()=>{const panel=document.querySelector('.difficulty-panel').getBoundingClientRect(),button=document.querySelector('#start').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth,button:button.bottom<=innerHeight&&button.left>=0,panelBottom:panel.bottom,skillTop:document.querySelector('.skill-entry').getBoundingClientRect().top,footerClear:document.querySelector('.skill-entry').getBoundingClientRect().top>=panel.bottom,panel:panel.width,tall:panel.height>panel.width,order:document.querySelector('.difficulty-disc').getBoundingClientRect().bottom<=document.querySelector('.difficulty-selector').getBoundingClientRect().top,progress:document.querySelector('.difficulty-progress').hidden};});
   assert.equal(layout.footerClear,true,JSON.stringify({width,level,...layout}));assert.equal(layout.tall,true);assert.equal(layout.order,true);assert.equal(layout.progress,true);assert.equal(layout.overflow,false);assert.equal(layout.button,true,`start visible ${width} level ${level}`);
  }
  await page.screenshot({path:`tests/difficulty-select-${width}.png`});
  assert.equal(await page.evaluate(()=>startDifficulty(5)),false);assert.equal(await page.evaluate(()=>state),'menu');
 }
 await page.setViewportSize({width:390,height:844});for(let i=0;i<4;i++)await page.locator('[data-difficulty-step="-1"]').click();await page.locator('#start').click();
 await page.waitForFunction(()=>state!=='menu'&&ElectricEditor.preparing);
 const combat=await page.evaluate(()=>{
  sound=false;ElectricEditor.run();ElectricEditor.prepareFloor=()=>false;ElectricEditor.reset();RoomReady.cancel();window.requestAnimationFrame=()=>0;floor=5;startWave();timedRoom.introLeft=0;
  const eliteSpec=spawnQueue.find(e=>e.elite);if(!eliteSpec)throw Error('missing scheduled elite');
  enemies=[];spawn(eliteSpec);const elite=enemies[0];if(!elite?.elite)throw Error('elite did not spawn');
  // Move onto the same visible bridge/island plane to inspect its actual bar.
  elite.x=p.x+60;elite.y=p.y-45;elite.bridgeApproach=false;paused=true;document.getElementById('viewport').classList.remove('falling','landing','boss-intro','survival-intro');document.querySelectorAll('.motionfx').forEach(e=>e.style.display='none');draw(0);
  const mesh=renderer.residentMeshes.get('elite-skull-ui');return {type:elite.type,elite:elite.elite,hp:elite.hp,mesh:!!mesh,gl:renderer.gl.getError(),end:campaignEndFloor()};
 });
 assert.equal(combat.type,'ironball');assert.equal(combat.elite,true);assert.equal(combat.mesh,true);assert.equal(combat.gl,0);assert.equal(combat.end,15);
 await page.screenshot({path:'tests/difficulty-elite-390.png'});
 const progress=await page.evaluate(()=>{paused=false;testMode=false;floor=15;state='combat';drinkZones=[];enemies=[];spawnQueue=[];beginStageClear(0);if(stageStats)stageStats.loot=[];stageSettlement.ready=true;continueStageResult();const won=state==='won';showDifficultySelection(1);return {won,saved:difficultyProgress(1),text:document.querySelector('.difficulty-progress').textContent};});
 assert.equal(progress.won,true);assert.equal(progress.saved.won,true);assert.ok(progress.text.includes('最高进度'));assert.ok(progress.text.includes('15 / 15'));
 await page.reload();await page.waitForFunction(()=>HexMap.ready);await page.waitForSelector('.difficulty-panel');assert.ok((await page.locator('.difficulty-progress').textContent()).includes('15 / 15'));
 await page.evaluate(()=>{startDifficulty(1);paused=true;returnToMainMenu();});await page.waitForSelector('.difficulty-panel');for(let i=0;i<4;i++)await page.locator('[data-difficulty-step="1"]').click();
 assert.equal(await page.locator('#start').isDisabled(),true);assert.equal(await page.evaluate(()=>highestUnlockedDifficulty()),2);
 for(let i=0;i<3;i++)await page.locator('[data-difficulty-step="-1"]').click();assert.equal(await page.locator('#start').isDisabled(),false);
 await page.locator('#start').click();await page.waitForFunction(()=>ElectricEditor.preparing);
 assert.equal(await page.evaluate(()=>campaignEndFloor()),21);
 assert.deepEqual(errors,[]);console.log('PASS actual Edge/WebGL: fresh save gates 2-5, direct skip rejected, three viewports, elite skull, real one-star victory unlocks only two stars after reload, two-star start',combat);
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});

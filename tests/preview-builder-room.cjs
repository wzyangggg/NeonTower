const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?builderlab=1');await page.waitForFunction(()=>window.HexMap?.ready&&typeof builderRoom!=='undefined'&&builderRoom);
 assert.deepEqual(await page.evaluate(()=>({count:enemies.length,only:enemies.every(e=>e.type==='builder'),test:testMode,turrets:turrets.length,queue:spawnQueue.length,preparing:ElectricEditor.preparing})),{count:3,only:true,test:true,turrets:0,queue:0,preparing:false});
 await page.evaluate(()=>{window.requestAnimationFrame=()=>0;});await page.waitForTimeout(100);
 // Inspect actual WebGL instances at fixed elapsed times, including the five-second boundary.
 await page.evaluate(()=>{startBuilderTest();shootTimer=999;p.inv=999;enemies=enemies.filter(e=>e.type==='builder').slice(0,1);const e=enemies[0];e.buildTarget=tiles.find(t=>t.x===0&&t.y===0);e.buildProgress=0;e.buildCooldown=0;const at=builderTileCenter(e.buildTarget);e.x=at.x+100;e.y=at.y-80;window.builderProgressCell=e.buildTarget;});
 for(const [dt,fraction,label] of [[1,.2,'20'],[1.5,.5,'50'],[2.49,.998,'99']]){
  const bar=await page.evaluate(({dt})=>{const e=enemies[0];updateBuilder(e,dt);draw();const fill=renderer.residentMeshes.get('builder:work-bar-fill');return {duration:ADDED_ENEMIES.builder.buildTime,progress:e.buildProgress,width:fill.instances[0],count:fill.count,trap:!!(window.builderProgressCell.trap||window.builderProgressCell.saw||window.builderProgressCell.flywheel),gl:renderer.gl.getError()};},{dt});
  assert.equal(bar.duration,5);assert.ok(Math.abs(bar.width-42*fraction)<1e-4);assert.equal(bar.count,1);assert.equal(bar.trap,false);assert.equal(bar.gl,0);
  await page.evaluate(()=>new Promise(resolve=>setTimeout(()=>{draw();resolve();},50)));
  await page.screenshot({path:'tests/builder-progress-'+label+'-390x844.png'});
 }
 assert.equal(await page.evaluate(()=>{updateBuilder(enemies[0],.01);draw();return !!(window.builderProgressCell.trap||window.builderProgressCell.saw||window.builderProgressCell.flywheel)&&enemies[0].buildProgress===0&&renderer.residentMeshes.get('builder:work-bar-fill').count===0;}),true);
 await page.evaluate(()=>startBuilderTest());
 const work=await page.evaluate(()=>{shootTimer=999;p.inv=999;for(let i=0;i<25;i++)step(.1);draw();return {working:enemies.filter(e=>e.warn&&e.buildTarget).length,finite:renderer.count>0,gl:renderer.gl.getError()};});assert.ok(work.working===3&&work.finite);assert.equal(work.gl,0);await page.screenshot({path:'tests/builder-room-working-390x844.png'});
 const built=await page.evaluate(()=>{for(let i=0;i<150;i++)step(.1);draw();return {traps:tiles.filter(t=>t.trap||t.saw||t.flywheel).length,count:enemies.length,only:enemies.every(e=>e.type==='builder'),chaser:chaserSpawned,bullets:bullets.length,gl:renderer.gl.getError()};});assert.ok(built.traps>0);assert.equal(built.count,3);assert.ok(built.only&&built.bullets===0);assert.equal(built.chaser,0);assert.equal(built.gl,0);await page.screenshot({path:'tests/builder-room-converted-390x844.png'});
 await page.evaluate(()=>{for(const e of enemies)e.hp=0;step(.01);});assert.equal(await page.evaluate(()=>state),'stageClear');
 for(const [index,kind]of ['trap','saw','flywheel','orbitSaw'].entries()){
  const revealed=await page.evaluate(({index,kind})=>{startBuilderTest();paused=true;enemies=enemies.slice(0,1);const e=enemies[0],site=tiles.find(builderTileAvailable),at=builderTileCenter(site);e.buildTarget=site;e.buildProgress=4.99;e.buildCooldown=0;e.x=at.x+100;e.y=at.y-80;const random=Math.random;Math.random=()=> (index+.1)/builderTrapPool().length;try{updateBuilder(e,.01);}finally{Math.random=random;}draw();return {match:kind==='trap'?!!site.trap:kind==='flywheel'?!!site.flywheel:site.saw&&!!site.orbitSaw===(kind==='orbitSaw'),gl:renderer.gl.getError()};},{index,kind});
  assert(revealed.match);assert.equal(revealed.gl,0);await page.screenshot({path:`tests/builder-blind-${kind}-390x844.png`});
 }
 // Exercise the visible equipment-panel entry as well as the URL entry.
 await page.evaluate(()=>{reset();openEquipmentTest();});await page.locator('#test-builder-room').click();assert.equal(await page.evaluate(()=>builderRoom&&testMode&&enemies.length===3&&!paused),true);assert.equal(await page.locator('#equipment-test').isVisible(),false);
 await page.setViewportSize({width:390,height:680});await page.evaluate(()=>draw());await page.screenshot({path:'tests/builder-room-390x680.png'});
 assert.deepEqual(errors,[]);console.log('Builder room browser passed: URL/button, three builders without ranged helpers, actual construction and terrain conversion, no reinforcements, kill-all completion, two viewport sizes and WebGL.',{work,built});
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});


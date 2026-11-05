const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const label=process.argv[2]||'after';
 if(label==='before'){const source=require('node:child_process').execFileSync('git',['show','HEAD:dist/hex-map.js'],{encoding:'utf8',maxBuffer:1024*1024});await page.route('**/hex-map.js',route=>route.fulfill({contentType:'text/javascript',body:source}));}
 await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>window.HexMap?.ready);await page.locator('#start').click();await page.waitForFunction(()=>state==='combat');
 await page.evaluate(()=>{paused=true;window.requestAnimationFrame=()=>0;});await page.waitForTimeout(100);
 for(const scene of label==='before'?['survival','greed']:['survival','greed','survival-expanded','greed-expanded']){
  const mode=scene.split('-')[0];
  const result=await page.evaluate(mode=>{
   const expanded=mode.endsWith('-expanded');mode=mode.split('-')[0];reset();if(expanded){addFloor(35);for(const t of tiles){delete t.coverTile;delete t.trap;delete t.saw;delete t.flywheel;}}floor=mode==='survival'?4:7;startWave();finishBossIntro();paused=false;shootTimer=999;p.inv=999;scroll=0;time=3;
   if(mode==='greed')for(let i=0;i<600;i++){time+=1/60;updateEnemyTransports(1/60);for(const e of greedRoom.spiders)if(!e.transport)updateGoldSpider(e,1/60);}
   else for(let i=0;i<120;i++){time+=1/60;updateTerrain(1/60);}
   toast('',0);updateUI();draw();paused=true;
   return {mode,tiles:tiles.length,turrets:turrets.map(t=>({x:t.x,y:t.y,edge:t.edge,supported:HexMap.canStand(tiles,t.x,t.y,t.r)})),bullets:bullets.length,spiders:greedRoom?.spiders.map(e=>({x:e.x,y:e.y,transport:!!e.transport,onFloor:HexMap.canStand(tiles,e.x,e.y,e.r)})),gl:renderer.gl.getError()};
  },scene);console.log(JSON.stringify(result));assert.equal(result.gl,0);
  if(label!=='before'){if(mode==='survival'){assert.equal(result.turrets.length,8);assert.ok(result.turrets.every(t=>t.supported));assert.ok(result.bullets>0);}else assert.ok(result.spiders.every(e=>e.transport||e.onFloor));}
  for(const [width,height]of [[390,844],[390,680],[1280,900]]){await page.setViewportSize({width,height});await page.evaluate(()=>draw());await page.screenshot({path:`tests/hex-special-${scene}-${label}-${width}x${height}.png`});}
 }
 if(label!=='before'){
  const integration=await page.evaluate(()=>{
   reset();floor=7;startWave();finishBossIntro();paused=false;shootTimer=999;p.inv=999;const remaining=greedRoom.remaining;paused=true;step(1);const pause=remaining===greedRoom.remaining;paused=false;
   updateEnemyTransports(6);const victim=greedRoom.spiders.find(e=>!e.transport);shots.push({beam:true,arc:true,radial:true,arcTargets:[victim],originX:victim.x,originY:victim.y,x:victim.x,y:victim.y,vx:0,vy:0,life:.05,damage:9999,critChance:0,critMultiplier:2,pierce:9,hitTargets:new Set(),source:'weapon',weaponId:'pulse'});step(.001);
   const payout=cash===12&&greedRoom.killed===1;greedRoom.remaining=.001;step(.01);const timeout=state==='stageClear'&&cash===12&&enemies.length===0;
   reset();floor=4;startWave();finishBossIntro();paused=false;p.inv=999;survivalRemaining=.001;step(.01);const survival=state==='stageClear'&&!turrets.some(t=>t.temporary);draw();renderer.initializeGPU();draw();
   return {pause,payout,timeout,survival,gl:renderer.gl.getError()};
  });assert.deepEqual(integration,{pause:true,payout:true,timeout:true,survival:true,gl:0});console.log('Real WebGL integration:',integration);
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>window.HexMap?.ready&&window.ElectricTiles);
 await page.evaluate(()=>{window.requestAnimationFrame=()=>0;});await page.waitForTimeout(100);
 const result=await page.evaluate(()=>{
  reset();RoomReady.cancel();testMode=true;floor=1;startWave();RoomReady.cancel();
  const opening={duration:timedRoom?.duration,melee:enemies.filter(isMeleeEnemy).length,ranged:normalRangedCount()};
  // Isolate facilities from the preparation UI and simulate their actual combat pipeline.
  state='combat';paused=false;tiles=[];for(let y=-3;y<=3;y++)for(let x=-4;x<=4;x++)tiles.push({x,y});
  ElectricTiles.reset();enemies=[];shots=[];missiles=[];bullets=[];turrets=[];spawnQueue=[];timedRoom={duration:999,remaining:999,nextWaveAt:999};shootTimer=999;p.inv=999;p.x=325;p.y=350;
  const f=ElectricTiles.place('tower',{x:-1,y:0}),at=ElectricTiles.facilityCenter(f);ElectricTiles.update(4);
  const ready=f.cool<1e-8;
  const e={type:'spitter',x:at.x+160,y:at.y-80,hp:100,max:100,r:14,t:0,fire:999,seed:0,homeX:at.x+160,homeY:at.y-80};enemies=[e];step(.01);draw();
  $('overlay').style.display='none';
  return {opening,ready,attacks:f.attacks,hp:e.hp,gl:renderer.gl.getError(),finite:renderer.residentMeshes.get('electric:tesla-tower').data.every(Number.isFinite)};
 });
 assert.deepEqual(result.opening,{duration:20,melee:3,ranged:2});assert.ok(result.ready&&result.attacks===1&&result.hp===94&&result.finite);assert.equal(result.gl,0);
 await page.screenshot({path:'tests/game-feedback-tower-390x844.png'});assert.deepEqual(errors,[]);
 console.log('Real Edge/WebGL: mixed first wave, 20s deadline, armed tower immediate acquisition and six actual damage, resident mesh and no GL/page errors passed.',result);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

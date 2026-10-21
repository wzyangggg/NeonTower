const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>window.HexMap?.ready);await page.locator('#start').click();await page.waitForFunction(()=>state==='combat');
 await page.evaluate(()=>{paused=true;window.requestAnimationFrame=()=>0;});await page.waitForTimeout(100);
 const result=await page.evaluate(()=>{
  reset();floor=9;startWave();paused=true;enemies=[];enemyTransports=[];spawnQueue=[{type:'eye',side:0}];timedRoom.nextWaveAt=999;shootTimer=999;p.inv=999;time=3;scroll=0;
  spawn({type:'builder',side:0});const e=enemies[0];updateBuilder(e,.01);const at=builderTileCenter(e.buildTarget);e.x=at.x+ADDED_ENEMIES.builder.workRange;e.y=at.y;updateBuilder(e,4);toast('',0);updateUI();draw();
  const mesh=[...renderer.residentMeshes].find(([k])=>k.startsWith('enemy:builder:'))[1],data=mesh.data;
  for(let i=0;i<20;i++){time+=.016;draw();}
  return {health:e.hp/normalEnemyHealth(),progress:e.buildProgress,resident:mesh.data===data,finite:data.every(Number.isFinite)&&renderer.data.subarray(0,renderer.count).every(Number.isFinite),gl:renderer.gl.getError()};
 });assert.deepEqual(result,{health:3,progress:4,resident:true,finite:true,gl:0});
 for(const [width,height]of [[390,844],[390,680],[1280,900]]){await page.setViewportSize({width,height});await page.evaluate(()=>draw());await page.screenshot({path:`tests/builder-working-${width}x${height}.png`});}
 await page.setViewportSize({width:390,height:844});
 const conversion=await page.evaluate(()=>{const e=enemies[0],t=e.buildTarget;updateBuilder(e,3.99);const before=!t.trap;updateBuilder(e,.01);draw();return {before,converted:!!t.trap,released:!e.buildTarget,gl:renderer.gl.getError()};});assert.deepEqual(conversion,{before:true,converted:true,released:true,gl:0});
 await page.screenshot({path:'tests/builder-converted-390x844.png'});
 const restored=await page.evaluate(()=>{renderer.initializeGPU();draw();return renderer.gl.getError();});assert.equal(restored,0);assert.deepEqual(errors,[]);
 console.log('Real Edge/WebGL builder: 3x health, red beam/progress, resident reuse, conversion at eight seconds, three viewports, GPU rebuild and no script/GL errors passed.',result);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

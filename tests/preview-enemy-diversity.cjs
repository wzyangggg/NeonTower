const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?vehiclelab=1');await page.waitForFunction(()=>window.HexMap?.ready&&enemies.length===4&&paused);
 await page.evaluate(()=>{window.requestAnimationFrame=()=>0;});await page.waitForTimeout(100);
 const result=await page.evaluate(()=>{
  reset();state='combat';phase=0;scroll=0;document.getElementById('viewport').classList.remove('landing','falling','boss-intro');document.querySelectorAll('.overlay').forEach(e=>e.style.display='none');floor=13;paused=false;spawnQueue=[];enemyTransports=[];timedRoom={duration:45,remaining:45,nextWaveAt:999};shootTimer=chaserTimer=999;turrets=[];p.inv=999;
  p.x=325;p.y=350;
  const make=(type,x,y,seed)=>({type,x,y,homeX:x,homeY:y,r:14,hp:40,max:40,seed,t:0,fire:999});
  enemies=[make('fighter',180,180,0),make('laser',440,190,1)];const eye=enemies[1];
  beginEnemyFlightFrame(eye);updateLaser(eye,.1);const initial={x:eye.groundX,y:eye.groundY};p.x=390;updateLaser(eye,.9);updateLaser(eye,.1);
  fire(enemies[0]);updateMissiles(.45);draw();paused=true;
  const m=renderer.residentMeshes.get('enemy-vehicle:fighter');const data=m.data,buffer=m.buffer;draw();
  return {initial,ground:{x:eye.groundX,y:eye.groundY},mode:eye.laserMode,missiles:missiles.length,speed:missiles[0]?.speed,resident:!!m,reused:m.data===data&&m.buffer===buffer,finite:renderer.data.slice(0,renderer.count).every(Number.isFinite),gl:renderer.gl.getError()};
 });
 assert.equal(result.mode,'firing');assert.deepEqual(result.ground,result.initial);assert.ok(result.speed>35&&result.speed<320&&result.resident&&result.reused&&result.finite);assert.equal(result.gl,0);assert.deepEqual(errors,[]);
 await page.screenshot({path:'tests/enemy-diversity-390x844.png'});
 await page.evaluate(()=>{paused=false;const eye=enemies.find(e=>e.type==='laser');p.x=410;p.y=380;updateLaser(eye,.6);paused=true;draw();});
 await page.screenshot({path:'tests/enemy-diversity-tracking-390x844.png'});
 for(const viewport of [{width:1280,height:900},{width:390,height:680}]){await page.setViewportSize(viewport);await page.evaluate(()=>draw());await page.screenshot({path:'tests/enemy-diversity-'+viewport.width+'x'+viewport.height+'.png'});}
 console.log('Actual Edge/WebGL: fighter shared mesh, accelerating missile, locked initial floor beam, tracking, three viewports, no page/GL errors',result);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

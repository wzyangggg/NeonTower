const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?vehiclelab=1');await page.waitForFunction(()=>window.HexMap?.ready&&enemies.length===4&&paused);
 await page.evaluate(()=>{window.requestAnimationFrame=()=>0;});await page.waitForTimeout(100);
 const hidden=await page.evaluate(()=>{
  reset();state='combat';phase=scroll=0;floor=15;paused=false;document.getElementById('viewport').classList.remove('landing','falling','boss-intro');toast('',0);updateUI();
  spawnQueue=[];enemyTransports=[];timedRoom={duration:45,remaining:45,nextWaveAt:999};shootTimer=chaserTimer=999;turrets=[];p.inv=999;p.x=325;p.y=300;
  enemies=[{type:'stealthDrone',x:80,y:100,homeX:80,homeY:100,r:14,hp:40,max:40,seed:1,t:0,fire:0}];step(.1);paused=true;draw();
  return {hidden:stealthDroneHidden(enemies[0]),targets:combatTargets().length,shots:bullets.length,body:[...renderer.residentMeshes].some(([k,m])=>k.startsWith('enemy:stealthDrone:')&&m.count>0)};
 });assert.ok(hidden.hidden&&!hidden.targets&&!hidden.shots&&!hidden.body);
 await page.screenshot({path:'tests/stealth-drone-hidden-390x844.png'});
 const reveal=await page.evaluate(()=>{paused=false;for(let i=0;i<900&&stealthDroneHidden(enemies[0]);i++)step(1/60);paused=true;draw();const e=enemies[0];return {hidden:stealthDroneHidden(e),warn:e.warn,shots:bullets.length,distance:Math.hypot(e.x-p.x,e.y-p.y),mode:e.stealthMode};});assert.ok(!reveal.hidden&&reveal.warn&&!reveal.shots&&reveal.distance<=155);
 await page.screenshot({path:'tests/stealth-drone-reveal-390x844.png'});
 const fired=await page.evaluate(()=>{paused=false;for(let i=0;i<600&&!bullets.length;i++)step(1/60);paused=true;draw();const e=enemies[0],mesh=[...renderer.residentMeshes].find(([k,m])=>k.startsWith('enemy:stealthDrone:')&&m.count>0)?.[1];const data=mesh.data,buffer=mesh.buffer;draw();return {hidden:stealthDroneHidden(e),shots:bullets.length,distance:Math.hypot(e.x-p.x,e.y-p.y),mode:e.stealthMode,reused:mesh.data===data&&mesh.buffer===buffer,gl:renderer.gl.getError()};});assert.ok(!fired.hidden&&fired.shots===1&&fired.distance<=125&&fired.reused&&fired.gl===0);
 await page.screenshot({path:'tests/stealth-drone-ambush-390x844.png'});
 for(const viewport of [{width:1280,height:900},{width:390,height:680}]){await page.setViewportSize(viewport);await page.evaluate(()=>draw());await page.screenshot({path:'tests/stealth-drone-ambush-'+viewport.width+'x'+viewport.height+'.png'});}
 assert.deepEqual(errors,[]);console.log('Real Edge/WebGL hidden body/shadow/bar omission and targeting exclusion, visible warning, close-range shot, resident buffers and three viewports passed',{hidden,reveal,fired});
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

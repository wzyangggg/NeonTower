const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?raillab=1');await page.waitForFunction(()=>window.HexMap?.ready&&typeof railRoom!=='undefined'&&railRoom);
 await page.evaluate(()=>{window.requestAnimationFrame=()=>0;});await page.waitForTimeout(80);
 const initial=await page.evaluate(()=>{reset();testMode=true;floor=10;startWave();const disabled=!isRailFloor();startRailRoom();p.inv=999;return {disabled,tracks:railRoom.tracks.length,turrets:turrets.length,tiles:tiles.length};});assert(initial.disabled);assert.equal(initial.tracks,6);assert.equal(initial.turrets,6);
 await page.evaluate(()=>{step(.8);draw();});await page.screenshot({path:'tests/rail-room-rising-390x844.png'});
 const firing=await page.evaluate(()=>{for(let i=0;i<160;i++)step(.02);draw();return {shots:bullets.length,blocked:railRoom.cells.every(c=>{const at=bridgeCellCenter(c);return !floorPoint(at.x,at.y);}),safe:turrets.every(t=>!isAttackable(t)&&t.temporary),models:renderer.residentMeshes.get('machine-turret:base')?.count,gl:renderer.gl.getError(),angles:[...new Set(railRoom.tracks.map(t=>Math.round((Math.atan2(t.to.y-t.from.y,t.to.x-t.from.x)*180/Math.PI+360)%180)))]};});
 assert(firing.shots>0&&firing.blocked&&firing.safe&&firing.models===6&&firing.gl===0,JSON.stringify(firing));assert.deepEqual(firing.angles.sort((a,b)=>a-b),[0,60,120]);
 await page.screenshot({path:'tests/rail-room-390x844.png'});
 const frozen=await page.evaluate(()=>{paused=true;const x=turrets[0].x,timeLeft=survivalRemaining,age=railRoom.age;step(99);const ok=turrets[0].x===x&&timeLeft===survivalRemaining&&age===railRoom.age;paused=false;return ok;});assert(frozen);
 for(const size of [{width:320,height:568},{width:1280,height:900}]){await page.setViewportSize(size);await page.evaluate(()=>draw());await page.screenshot({path:`tests/rail-room-${size.width}x${size.height}.png`});}
 assert(await page.evaluate(()=>{step(100);return state==='stageClear'&&!railRoom&&!turrets.some(t=>t.rail)&&!bullets.length&&cash===40;}));
 assert.deepEqual(errors,[]);console.log('Patrol fire net real Edge/WebGL: six hex-axis rails, six shared turret models, aimed shots, enemy-only platforms, pause, payout/cleanup and three sizes passed.',firing);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

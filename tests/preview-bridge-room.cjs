const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?bridgelab=1');await page.waitForFunction(()=>window.HexMap?.ready&&typeof bridgeRoom!=='undefined'&&bridgeRoom);
 await page.evaluate(()=>{window.requestAnimationFrame=()=>0;});await page.waitForTimeout(80);
 const initial=await page.evaluate(()=>{reset();testMode=true;floor=9;startWave();p.inv=999;shootTimer=999;draw();return {tiles:tiles.length,ranged:enemies.filter(e=>!isMeleeEnemy(e)).length,ready:bridgeReady()};});assert(initial.ranged>0&&!initial.ready);
 await page.evaluate(()=>{step(.1);draw();});await page.screenshot({path:'tests/bridge-room-extending-390x844.png'});
 assert(await page.evaluate(()=>{step(.1);const original=drawTemporaryHexCell,built=[];try{drawTemporaryHexCell=(cell,u,...args)=>{built.push(u);original(cell,u,...args);};draw();}finally{drawTemporaryHexCell=original;}return bridgeReady()&&built.length===bridgeRoom.cells.length&&built.every(u=>u===1);}),'all bridge bricks complete at 0.2 seconds in real WebGL');
 const wave=await page.evaluate(()=>{for(let i=0;i<280;i++)step(.02);draw();return {ready:bridgeReady(),rollers:enemies.filter(e=>e.bridgeRoller).length,ranged:enemies.filter(e=>!isMeleeEnemy(e)).length,tiles:tiles.length,blocked:bridgeRoom.cells.every(t=>{const p=bridgeCellCenter(t);return !floorPoint(p.x,p.y);}),resident:[...renderer.residentMeshes.keys()].some(k=>k.startsWith('enemy:ironball:')),keys:[...renderer.residentMeshes.keys()].filter(k=>k.includes('ironball')),gl:renderer.gl.getError(),supported:enemies.filter(e=>e.bridgeRoller).every(e=>HexMap.canStand(bridgeRoom.surface,e.x,e.y,6.99))};});
 assert(wave.ready&&wave.rollers>=4&&wave.ranged>0&&wave.blocked&&wave.resident&&wave.supported&&wave.tiles===initial.tiles&&wave.gl===0,JSON.stringify(wave));
 await page.screenshot({path:'tests/bridge-room-390x844.png'});
 assert(await page.evaluate(()=>{step(.4);return enemies.filter(e=>e.bridgeRoller).length>=8&&normalThreat()<=normalThreatLimit();}),'two waves provide at least eight rollers within threat budget');
 const frozen=await page.evaluate(()=>{paused=true;const age=bridgeRoom.age,x=enemies.find(e=>e.bridgeRoller).x;step(10);const ok=age===bridgeRoom.age&&x===enemies.find(e=>e.bridgeRoller).x;paused=false;return ok;});assert(frozen);
 // Actual player movement against the bridge entrance cannot leave the owned floor.
 const boundary=await page.evaluate(()=>{const at=bridgeRoom.ends[0].entry;p.x=at.x;p.y=at.y;keys.a=true;for(let i=0;i<200;i++)step(.01);keys.a=false;return {floor:onFloor(p.x,p.y,7),outside:!floorPoint(bridgeRoom.ends[0].start.x,bridgeRoom.ends[0].start.y)};});assert(boundary.floor&&boundary.outside);
 for(const size of [{width:320,height:568},{width:1280,height:900}]){await page.setViewportSize(size);await page.evaluate(()=>draw());await page.screenshot({path:`tests/bridge-room-${size.width}x${size.height}.png`});}
 assert(await page.evaluate(()=>{step(100);return state==='stageClear'&&!bridgeRoom;}));assert.deepEqual(errors,[]);
 console.log('Enemy-only bridge real Edge/WebGL: deployment, two-sided existing rollers/ranged, resident models, actual player boundary, supported movement, pause, cleanup and three sizes passed.',wave);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

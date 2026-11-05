const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>window.HexMap?.ready&&window.RoomReady);
  await page.evaluate(()=>{Math.random=()=>.7;});
  await page.locator('#start').click();await page.waitForFunction(()=>ElectricEditor.preparing);
  await page.locator('#electric-panel').evaluate(el=>Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{}))));
  const offer=await page.evaluate(()=>{
   const item=ElectricEditor.stock.find(i=>ElectricEditor.isFloor(i.kind))||ElectricEditor.stock[0];
   const c=ElectricEditor.isFloor(item.kind)?ElectricEditor.frontier(item.kind).sort((a,b)=>a.x*a.x+a.y*a.y-b.x*b.x-b.y*b.y)[0]:tiles.find(t=>ElectricEditor.canPlace(item.kind,t));
   return {item,c};
  });
  assert.notEqual(offer.item.kind,'erase');
  const from=await page.locator(`[data-stock-id="${offer.item.id}"]`).boundingBox(),to=await page.evaluate(c=>{const cr=canvas.getBoundingClientRect(),p=renderer.screenPoint(HexMap.x(c.x,c.y),4,HexMap.y(c.y)*1.06);return {x:p.x+cr.left,y:p.y+cr.top,width:0,height:0};},offer.c);
  await page.mouse.move(from.x+from.width/2,from.y+from.height/2);await page.mouse.down();await page.mouse.move(from.x+from.width/2,from.y-25,{steps:5});await page.mouse.move(to.x+to.width/2,to.y+to.height/2,{steps:10});
  const card=page.locator('.electric-stock-card.is-dragging');assert(await card.isVisible());assert((await card.textContent()).includes('地板'));assert.equal(await card.locator(':scope > svg').count(),1);assert.equal(await page.locator('.electric-drag-description').count(),0);await page.screenshot({path:'tests/drag-original-card-390x844.png'});await page.mouse.up();assert.equal(await card.count(),0);
  const tray=await page.evaluate(()=>{paused=true;return {active:RoomReady.active,stage:RoomReady.stage,state,enemies:enemies.length,time,clock:timedRoom};});
  assert(tray.active);assert.equal(tray.stage,'tray');assert.equal(tray.enemies,0);assert.equal(tray.clock,null);assert.notEqual(tray.state,'combat');
  await page.waitForFunction(()=>!document.querySelector('.electric-panel.ui-exit-copy'));
  const tick=dt=>page.evaluate(dt=>{paused=false;step(dt);paused=true;draw();return {stage:RoomReady.stage,progress:RoomReady.progress,state,time};},dt);
  const start=await tick(.001);assert.equal(start.stage,'rise');assert.equal(start.progress,0);assert.equal(start.time,tray.time);
  const at=await page.evaluate(c=>({x:HexMap.x(c.x,c.y),z:HexMap.y(c.y)*1.06}),offer.c);
  const initial=await page.evaluate(c=>{const lift=RoomReady.liftAt(HexMap.x(c.x,c.y),HexMap.y(c.y)*1.06),cr=canvas.getBoundingClientRect(),vr=$('viewport').getBoundingClientRect();return {lift,depth:RoomReady.depth,allBelow:ElectricEditor.shape('floor',c).cells.every(cell=>Array.from({length:6},(_,i)=>{const a=Math.PI/6+i*Math.PI/3;return renderer.screenPoint(HexMap.x(cell.x,cell.y)+Math.cos(a)*HexMap.RADIUS,4+lift,(HexMap.y(cell.y)+Math.sin(a)*HexMap.RADIUS)*1.06).y+cr.top>vr.bottom;}).every(Boolean))};},offer.c);assert(initial.lift<0&&initial.depth>110);assert(initial.allBelow,'every new cell starts below viewport');
  await page.screenshot({path:'tests/room-rise-start-390x844.png'});
  const middle=await tick(.25);assert.equal(middle.stage,'rise');assert.equal(middle.time,tray.time);
  const lift=await page.evaluate(at=>RoomReady.liftAt(at.x,at.z),at);assert(lift<0&&lift>-initial.depth);
  for(const [width,height]of [[390,844],[390,680]]){await page.setViewportSize({width,height});await page.screenshot({path:`tests/room-rise-middle-${width}x${height}.png`});}
  const frozen=await page.evaluate(()=>{const before=RoomReady.progress;step(1);return before===RoomReady.progress;});assert(frozen);
  await tick(.35);assert.equal(await page.evaluate(()=>RoomReady.active),false);assert.equal(await page.evaluate(()=>state),'combat');assert.equal(await page.evaluate(()=>time),tray.time);
  await page.screenshot({path:'tests/room-rise-complete-390x680.png'});
  const advances=await page.evaluate(()=>{paused=false;const before=timedRoom.remaining;step(.1);paused=true;return timedRoom.remaining<before;});assert(advances);
  const smoke=await page.evaluate(()=>{const c=tiles[0];RoomReady.recordPlacement([c],'smoke');let called=false;RoomReady.begin(()=>{called=true;});paused=false;RoomReady.tick(.001);RoomReady.tick(.2);renderer.begin();RoomReady.draw();paused=true;return {stage:RoomReady.stage,lift:RoomReady.liftAt(HexMap.x(c.x,c.y),HexMap.y(c.y)*1.06),vertices:renderer.transparentCount,called};});assert.equal(smoke.stage,'smoke');assert.equal(smoke.lift,0);assert(smoke.vertices>0&&!smoke.called);await page.evaluate(()=>{draw();});await page.screenshot({path:'tests/construction-smoke-390x680.png'});await page.evaluate(()=>RoomReady.cancel());
  assert(await page.evaluate(()=>{RoomReady.begin(()=>{});beginDescent();return !RoomReady.active;}));
  assert(await page.evaluate(()=>{RoomReady.begin(()=>{});reset();return !RoomReady.active;}));
  assert(await page.evaluate(()=>{testMode=true;let called=false;RoomReady.begin(()=>{called=true;});return called&&!RoomReady.active;}));
  assert.equal(await page.locator('#room-ready').count(),0,'no countdown UI');
  assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);
  console.log('Placement handoff: real drag waits for tray exit, only empty-floor cells rise from below the viewport, functional construction smokes without lift, frozen gameplay/room clocks, pause, combat after rise, reset/descent cleanup, no countdown and portrait screenshots passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

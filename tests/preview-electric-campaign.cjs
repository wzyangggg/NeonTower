const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>window.HexMap?.ready);await page.evaluate(()=>{window.preparationMusicStops=0;const pause=music.media.pause.bind(music.media);music.media.pause=()=>{if(ElectricEditor.preparing)window.preparationMusicStops++;return pause();};});await page.locator('#start').click();
 async function center(locator){return locator.evaluate(el=>{const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};});}
 async function drag(from,to){await page.mouse.move(from.x,from.y);await page.mouse.down();await page.mouse.move(from.x,from.y-30,{steps:5});await page.mouse.move(to.x,to.y,{steps:10});await page.mouse.up();}
 async function verifyChoices(){
  await page.waitForFunction(()=>ElectricEditor.preparing);await page.waitForTimeout(320);
  await page.waitForFunction(()=>ElectricEditor.preparing);assert.equal(await page.evaluate(()=>ElectricEditor.stock.length),3);assert.equal(await page.evaluate(()=>ElectricEditor.stock.some(i=>ElectricEditor.isFloor(i.kind))),true);assert.equal(await page.locator('[data-run]').isDisabled(),true);
  assert.equal(await page.locator('[data-close]').isVisible(),false);assert.equal(await page.locator('[data-expand]').isVisible(),false);assert.equal(await page.evaluate(()=>testMode),false);await page.waitForFunction(()=>music.active&&!music.media.paused);assert.equal(await page.evaluate(()=>window.preparationMusicStops),0);
  const layout=await page.locator('#electric-backpack').evaluate(el=>({overflow:el.scrollWidth>el.clientWidth,rows:new Set([...el.children].map(c=>c.offsetTop)).size}));assert.deepEqual(layout,{overflow:false,rows:1});
 }
 async function placeOne(){
  const offer=await page.evaluate(()=>{const item=ElectricEditor.stock.find(i=>i.kind!=='erase'&&!ElectricEditor.isFloor(i.kind))||ElectricEditor.stock.find(i=>i.kind!=='erase')||ElectricEditor.stock[0];const vacant=ElectricEditor.isFloor(item.kind)?ElectricEditor.frontier(item.kind)[0]:tiles.find(t=>ElectricEditor.canPlace(item.kind,t)),merge=!vacant&&ElectricTiles.list().find(f=>ElectricTiles.canMerge(item,f)),c=vacant?(ElectricTiles.defs[item.kind]?ElectricTiles.coreCell({...ElectricTiles.shape(item.kind,vacant),kind:item.kind,anchor:vacant}):vacant):(merge&&ElectricTiles.coreCell(merge));return {item,c,size:merge?0:ElectricEditor.isFloor(item.kind)?ElectricEditor.shape(item.kind,c).cells.length:1};});
  const before=await page.evaluate(()=>({tiles:tiles.length,facilities:ElectricTiles.list().length+tiles.filter(t=>t.coverTile).length})),source=await center(page.locator(`[data-stock-id="${offer.item.id}"]`));
  // Invalid drops and cancellation keep the same three choices and locked start.
  const ids=await page.evaluate(()=>ElectricEditor.stock);await drag(source,{x:5,y:150});assert.deepEqual(await page.evaluate(()=>ElectricEditor.stock),ids);assert.equal(await page.locator('[data-run]').isDisabled(),true);
  await page.mouse.move(source.x,source.y);await page.mouse.down();await page.mouse.move(source.x,source.y-35,{steps:5});await page.evaluate(()=>document.dispatchEvent(new PointerEvent('pointercancel',{pointerId:1})));await page.mouse.up();assert.deepEqual(await page.evaluate(()=>ElectricEditor.stock),ids);
  await page.mouse.move(source.x,source.y);await page.mouse.down();await page.mouse.move(source.x,source.y-35,{steps:5});
  const target=await center(page.locator(`#electric-placement polygon[data-x="${offer.c.x}"][data-y="${offer.c.y}"]`));await page.mouse.move(target.x,target.y,{steps:10});await page.mouse.up();
  assert.equal(await page.evaluate(()=>ElectricEditor.stock.length),0);assert.equal(await page.evaluate(()=>paused||ElectricEditor.preparing),false);assert.equal(await page.locator('#electric-panel').isVisible(),false);
  const exit=await page.evaluate(()=>{const el=document.querySelector('.electric-panel.ui-exit-copy');const a=el?.getAnimations()[0];return {inert:el?.inert,direction:el?.dataset.exitDirection,last:a?.effect.getKeyframes().at(-1).translate,ids:el?.querySelectorAll('[id]').length};});
  assert.deepEqual(exit,{inert:true,direction:'down',last:'0px calc(100% + 80px)',ids:0},'successful placement retains a noninteractive downward exit');
  await page.waitForFunction(()=>!document.querySelector('.electric-panel.ui-exit-copy'));
  await page.waitForFunction(()=>!RoomReady.active);
  const after=await page.evaluate(()=>({tiles:tiles.length,facilities:ElectricTiles.list().length+tiles.filter(t=>t.coverTile).length}));assert.equal(after.tiles+after.facilities,before.tiles+before.facilities+offer.size);

 }
 await verifyChoices();assert.equal(await page.evaluate(()=>floor),1);
 const musicTime=await page.evaluate(()=>music.media.currentTime);const frozen=await page.evaluate(()=>({time,enemies:enemies.length,spawn:spawnQueue.length}));await page.waitForTimeout(250);assert.deepEqual(await page.evaluate(()=>({time,enemies:enemies.length,spawn:spawnQueue.length})),frozen);assert.ok(await page.evaluate(()=>music.media.currentTime)>musicTime,'music keeps advancing while preparation is frozen');await page.evaluate(()=>togglePause());assert.equal(await page.evaluate(()=>paused),true);
 await page.screenshot({path:'tests/electric-campaign-choices-390x844.png'});await page.setViewportSize({width:390,height:680});await verifyChoices();await page.screenshot({path:'tests/electric-campaign-choices-390x680.png'});await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);
 await placeOne();assert.equal(await page.evaluate(()=>state),'combat');assert.equal(await page.evaluate(()=>paused||ElectricEditor.preparing||testMode),false);
 await page.evaluate(()=>startWave());assert.equal(await page.evaluate(()=>ElectricEditor.preparing),false);
 await page.evaluate(()=>togglePause());assert.equal(await page.evaluate(()=>music.active),false);await page.evaluate(()=>togglePause());await page.waitForFunction(()=>music.active&&!music.media.paused);
 // Real shop/descent/landing path: terrain updates settle before offers appear.
 await page.evaluate(()=>{enemies=[];enemyTransports=[];missiles=[];bullets=[];shots=[];spawnQueue=[];shopTerrainPlan=planTerrainChange(()=>addFloor(1));state='upgrade';leaveShop();});
 await verifyChoices();assert.equal(await page.evaluate(()=>floor),2);assert.equal(await page.evaluate(()=>!!terrainChange||!!shopTerrainPlan),false);await placeOne();
 for(const [next,expected]of [[3,'combat'],[4,'combat'],[7,'bossIntro'],[8,'combat']]){
  const count=await page.evaluate(()=>ElectricTiles.list().length);
  await page.evaluate(next=>{floor=next;enemies=[];enemyTransports=[];spawnQueue=[];missiles=[];bullets=[];shots=[];beginDescent();},next);await verifyChoices();assert.equal(await page.evaluate(()=>ElectricTiles.list().length),count);assert.equal(await page.evaluate(()=>enemies.length),0);await placeOne();assert.equal(await page.evaluate(()=>state),expected);assert.equal(await page.evaluate(()=>paused||testMode||ElectricEditor.preparing),false);
 }
 await page.evaluate(()=>reset());await verifyChoices();assert.equal(await page.evaluate(()=>floor),1);assert.equal(await page.evaluate(()=>ElectricTiles.list().length),0);
 // Saturated map: no legal shape must not deadlock the campaign.
 await page.evaluate(()=>{for(let y=grid.minY;y<=grid.maxY;y++)for(let x=grid.minX;x<=grid.maxX;x++)if(!hasTile(x,y))tiles.push({x,y});for(const t of tiles)t.medical=true;floor=2;});
 await page.evaluate(()=>{floor=3;ElectricEditor.reset();startWave();});await page.waitForFunction(()=>ElectricEditor.preparing);assert.deepEqual(await page.evaluate(()=>ElectricEditor.stock.map(i=>i.kind)),['erase','erase','erase']);
 await page.locator('#electric-panel').evaluate(el=>Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{}))));
 await drag(await center(page.locator('[data-kind="erase"]').first()),await center(page.locator('#electric-placement polygon[data-x="0"][data-y="0"]')));assert.equal(await page.evaluate(()=>ElectricEditor.preparing),false);assert.equal(await page.evaluate(()=>!!tiles.find(t=>t.x===0&&t.y===0).medical),false);
 await page.evaluate(()=>{ElectricTiles.reset();tiles=[];turrets=[];floor=4;startWave();});await page.waitForFunction(()=>ElectricEditor.preparing);assert.equal(await page.evaluate(()=>ElectricEditor.stock.length),0);assert.equal(await page.locator('[data-run]').isDisabled(),false);await page.locator('[data-run]').click();assert.equal(await page.evaluate(()=>ElectricEditor.preparing),false);
 assert.deepEqual(errors,[]);console.log('Campaign: three choices from floor one, one placement per floor, invalid/cancel conservation, automatic start, uninterrupted music, normal pause still mutes, frozen preparation, normal transitions, all room branches, reset, full-board positive demolition and no-action fallback passed.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:680}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>window.HexMap?.ready);await page.locator('#start').click();
  await page.waitForFunction(()=>ElectricEditor.preparing);
  assert.equal(await page.locator('[data-lab-tools]').isVisible(),false);
  const initial=await page.evaluate(()=>tiles.map(t=>({x:t.x,y:t.y})));
  await page.locator('[data-lab-entry]').click();
  assert.equal(await page.evaluate(()=>testMode&&paused&&ElectricEditor.editing&&!ElectricEditor.preparing),true);
  assert.deepEqual(await page.evaluate(()=>tiles.map(t=>({x:t.x,y:t.y}))),initial);
  assert.equal(await page.locator('[data-lab-entry]').isVisible(),false);
  assert.equal(await page.locator('[data-test-kind]').count(),18);
  async function tools(){if(!await page.locator('[data-lab-tools]').evaluate(el=>el.open))await page.locator('[data-lab-tools] summary').click();}
  for(const kind of ['tower','miner','apple','watermelon','banana','grape','irrigator','pulse','biogenerator','barricade','echo','battery','turbine','floor','floorLine','floorBend','floorTriangle','erase']){
   const before=await page.evaluate(()=>ElectricEditor.stock.length);
   await tools();await page.locator(`[data-test-kind="${kind}"]`).click();
   assert.equal(await page.evaluate(()=>ElectricEditor.stock.length),before+3);
   assert.deepEqual(await page.evaluate(()=>ElectricEditor.stock.slice(0,3).map(i=>i.kind)),[kind,kind,kind]);
   assert.equal(await page.locator('#electric-backpack').evaluate(el=>el.scrollLeft),0);
   assert.equal(await page.locator('[data-lab-tools]').evaluate(el=>el.open),false);
  }
  // A newly requested facility can immediately be dragged into the existing board.
  await tools();await page.locator('[data-test-kind="tower"]').click();
  const cell=await page.evaluate(()=>tiles.find(t=>ElectricTiles.canPlace('tower',t)));
  const card=await page.locator('#electric-backpack [data-kind="tower"]').first().boundingBox();
  await page.mouse.move(card.x+card.width/2,card.y+card.height/2);await page.mouse.down();await page.mouse.move(card.x+card.width/2,card.y-30,{steps:5});
  const target=await page.evaluate(c=>{draw();const at=ElectricTiles.center(c),p=renderer.screenPoint(at.x-325,4,(at.y-300)*1.06),r=canvas.getBoundingClientRect();return {x:p.x+r.left,y:p.y+r.top};},cell);
  await page.mouse.move(target.x,target.y,{steps:12});await page.mouse.up();
  assert.equal(await page.evaluate(()=>ElectricTiles.list().length),1);assert.equal(await page.evaluate(()=>ElectricEditor.editing&&paused),true);
  for(const kind of ['trap','saw','flywheel','machine','laser']){
   const before=await page.evaluate(()=>permanentTrapCount());await tools();await page.locator(`[data-test-hazard="${kind}"]`).click();
   assert.equal(await page.evaluate(()=>permanentTrapCount()),before+1);
   assert.deepEqual(await page.evaluate(()=>ElectricEditor.stock.slice(0,3).map(i=>i.kind)),['erase','erase','erase']);
  }
  assert.equal(await page.evaluate(()=>tiles.some(t=>t.saw)),true);
  assert.equal(await page.evaluate(()=>turrets.some(t=>t.kind==='machine')&&turrets.some(t=>t.kind==='laser')),true);
  // Preserve the game's turret limit without silently adding another hazard.
  await tools();await page.locator('[data-test-hazard="machine"]').click();await tools();await page.locator('[data-test-hazard="laser"]').click();
  const full=await page.evaluate(()=>({hazards:permanentTrapCount(),stock:ElectricEditor.stock.length}));
  await tools();await page.locator('[data-test-hazard="machine"]').click();
  assert.deepEqual(await page.evaluate(()=>({hazards:permanentTrapCount(),stock:ElectricEditor.stock.length})),full);
  await page.locator('[data-lab-tools] summary').click();
  await page.locator('[data-run]').click();assert.equal(await page.evaluate(()=>paused||ElectricEditor.editing),false);
  await page.locator('[data-run]').click();assert.equal(await page.evaluate(()=>paused&&ElectricEditor.editing),true);
  for(const [width,height]of [[390,680],[390,844],[1280,900]]){
   await page.setViewportSize({width,height});await tools();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   const accessible=await page.locator('[data-lab-tools]').evaluate(el=>el.scrollWidth<=el.clientWidth);assert.equal(accessible,true);
   await page.screenshot({path:`tests/tile-test-tools-${width}x${height}.png`});
   await page.locator('[data-lab-tools] summary').click();
  }
  assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);
  // F2 also exposes the same feature before starting a game.
  const fresh=await browser.newPage();fresh.on('pageerror',e=>errors.push(e.message));await fresh.goto('http://127.0.0.1:4173/');await fresh.waitForFunction(()=>window.HexMap?.ready);
  await fresh.keyboard.press('F2');await fresh.getByRole('button',{name:'指定格子测试',exact:true}).click();
  assert.equal(await fresh.evaluate(()=>ElectricEditor.editing&&testMode&&paused),true);
  assert.deepEqual(errors,[]);
  console.log('Tile test tools: preparation/F2 entry, eighteen explicit tile choices, +3 front-of-bag refill, actual placement, five hazard targets, turret cap, run/edit toggle and three viewport layouts passed in real Edge/WebGL.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?electriclab=1');await page.waitForFunction(()=>globalThis.ElectricEditor?.editing&&globalThis.FruitModels?.ready);
  await page.evaluate(()=>{
   ElectricEditor.reset();ElectricTiles.reset();tiles=[];for(let y=-3;y<=3;y++)for(let x=-4;x<=4;x++)tiles.push({x,y});
   ElectricTiles.place('tower',{x:-3,y:-1});ElectricTiles.place('tower',{x:1,y:-1});ElectricTiles.place('tower',{x:-3,y:1},2);
   enemies=[];spawnQueue=[];enemyTransports=[];testMode=false;floor=2;const random=Math.random;Math.random=()=>0;try{ElectricEditor.prepareFloor();}finally{Math.random=random;}
  });
  await page.locator('#electric-panel').evaluate(el=>Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{}))));
  async function point(c){return page.evaluate(c=>{draw();const at=ElectricTiles.center(c),s=renderer.screenPoint(at.x-325,4,(at.y-300)*1.06),r=canvas.getBoundingClientRect();return {x:s.x+r.left,y:s.y+r.top};},c);}
  async function drag(from,to,mergeLevel=0){await page.mouse.move(from.x,from.y);await page.mouse.down();await page.mouse.move(to.x,to.y,{steps:15});assert.equal(await page.locator('[data-placement-valid]').getAttribute('data-placement-valid'),'true');assert.equal(Number(await page.locator('[data-merge-level]').getAttribute('data-merge-level')),mergeLevel);await page.mouse.up();if(mergeLevel)await page.waitForFunction(()=>!document.querySelector('[data-merge-celebration]'));}
  const towerSetup=await page.evaluate(()=>ElectricTiles.list().map(f=>({kind:f.kind,anchor:f.anchor,level:f.level})));
  await page.evaluate(()=>{ElectricTiles.reset();ElectricTiles.place('battery',{x:-3,y:-1});ElectricTiles.place('battery',{x:1,y:-1});ElectricEditor.prepareFloor();});
  await page.locator('#electric-panel').evaluate(el=>Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{}))));
  await page.waitForFunction(()=>document.querySelectorAll('[data-building-label]').length===2);
  assert.equal(await page.locator('[data-building-label]').filter({hasText:'可合成'}).count(),2);
  const choices=await page.evaluate(()=>ElectricEditor.stock);
  await drag(await point({x:-3,y:-1}),await point({x:-3,y:0}));
  assert.ok(await page.evaluate(()=>ElectricTiles.list().some(f=>f.anchor.x===-3&&f.anchor.y===0)));
  await drag(await point({x:-3,y:0}),await point({x:1,y:-1}),2);
  assert.deepEqual(await page.evaluate(()=>ElectricTiles.list().map(f=>({kind:f.kind,level:f.level}))),[{kind:'battery',level:2}]);
  assert.equal(await page.locator('[data-building-label]').filter({hasText:'可合成'}).count(),0);
  assert.deepEqual(await page.evaluate(()=>ElectricEditor.stock),choices);
  await page.screenshot({path:'tests/building-merge-battery.png'});
  // Mixed types never show a merge marker, and cancelling a move retains the source.
  await page.evaluate(()=>{ElectricTiles.place('clockshop',{x:-3,y:-1});ElectricTiles.place('clockshop',{x:1,y:1});});
  await page.waitForFunction(()=>document.querySelectorAll('[data-building-label]').length===3);
  assert.equal(await page.locator('[data-building-label]').filter({hasText:'可合成'}).count(),2);
  await page.screenshot({path:'tests/building-merge-available.png'});
  await page.setViewportSize({width:390,height:680});await page.waitForTimeout(150);
  await drag(await point({x:-3,y:-1}),await point({x:1,y:1}),2);
  assert.equal(await page.evaluate(()=>ElectricTiles.list().find(f=>f.kind==='clockshop').level),2);
  await page.setViewportSize({width:1280,height:900});await page.waitForTimeout(150);
  await page.screenshot({path:'tests/building-merge-wide.png'});
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(saved=>{ElectricTiles.reset();for(const f of saved)ElectricTiles.place(f.kind,f.anchor,f.level);ElectricEditor.prepareFloor();},towerSetup);
  await page.locator('#electric-panel').evaluate(el=>Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{}))));
  const offers=await page.evaluate(()=>ElectricEditor.stock);
  // Grab the core cell; the pointer is the placement reference.
  await drag(await point({x:-2,y:-1}),await point({x:-2,y:0}));
  assert.deepEqual(await page.evaluate(()=>ElectricTiles.list().find(f=>f.anchor.x===-3&&f.anchor.y===0)?.cells),[{x:-3,y:0},{x:-2,y:0},{x:-1,y:0}]);
  assert.deepEqual(await page.evaluate(()=>ElectricEditor.stock),offers);assert.equal(await page.evaluate(()=>ElectricEditor.preparing),true);
  // Merge existing towers by dropping on a non-anchor cell of the target.
  await drag(await point({x:-2,y:0}),await point({x:2,y:-1}),2);
  assert.equal(await page.evaluate(()=>ElectricTiles.list().length),2);assert.equal(await page.evaluate(()=>ElectricTiles.list().find(f=>f.anchor.x===1).level),2);
  assert.deepEqual(await page.evaluate(()=>ElectricEditor.stock),offers);assert.equal(await page.evaluate(()=>ElectricEditor.preparing),true);
  await drag(await point({x:-2,y:1}),await point({x:2,y:-1}),3);
  assert.equal(await page.evaluate(()=>ElectricTiles.list().length),1);assert.equal(await page.evaluate(()=>ElectricTiles.list()[0].level),3);
  await page.screenshot({path:'tests/tower-merge-level3-390x844.png'});
  // A cancelled move preserves the upgraded tower and the floor's choice.
  const before=await page.evaluate(()=>({anchor:ElectricTiles.list()[0].anchor,level:ElectricTiles.list()[0].level})),from=await point({x:2,y:-1});
  await page.mouse.move(from.x,from.y);await page.mouse.down();await page.mouse.move(5,35,{steps:10});await page.mouse.up();
  assert.deepEqual(await page.evaluate(()=>({anchor:ElectricTiles.list()[0].anchor,level:ElectricTiles.list()[0].level})),before);assert.deepEqual(await page.evaluate(()=>ElectricEditor.stock),offers);
  // A new offered tower can merge even when there is no empty three-cell slot.
  await page.evaluate(()=>{ElectricEditor.reset();ElectricTiles.reset();tiles=[0,1,2].map(x=>({x,y:0}));ElectricTiles.place('tower',{x:0,y:0});floor=3;const random=Math.random;Math.random=()=>0;try{ElectricEditor.prepareFloor();}finally{Math.random=random;}});
  await page.locator('#electric-panel').evaluate(el=>Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{}))));
  const card=page.locator('#electric-backpack [data-kind="tower"]').first();assert.equal(await card.locator('.electric-stock-footprint').count(),3);const box=await card.boundingBox(),to=await point({x:1,y:0});
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2,box.y-30,{steps:5});await page.mouse.move(to.x,to.y,{steps:15});
  assert.equal(await page.locator('[data-merge-level]').getAttribute('data-merge-level'),'2');assert.ok((await page.locator('[data-status]').textContent()).includes('合成2级'));await page.mouse.up();
  await page.waitForFunction(()=>!ElectricEditor.preparing&&state==='combat');assert.deepEqual(await page.evaluate(()=>({count:ElectricTiles.list().length,level:ElectricTiles.list()[0].level})),{count:1,level:2});
  assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);assert.deepEqual(errors,[]);console.log('Building preparation: battery/clock movement, generic merging, labels, choice conservation, cancellation, level cap, tower regression, three viewports and no page/WebGL errors passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

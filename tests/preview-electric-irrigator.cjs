const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:680}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?electriclab=1');await page.waitForFunction(()=>window.ElectricEditor?.editing);
  await page.locator('[data-lab-tools] summary').click();await page.locator('[data-test-kind="irrigator"]').click();
  const card=page.locator('#electric-backpack [data-kind="irrigator"]').first();assert.equal(await card.locator('.electric-stock-footprint').count(),1);assert.equal(await card.locator('.electric-stock-range').count(),6);
  const c=await page.evaluate(()=>tiles.find(t=>ElectricTiles.canPlace('irrigator',t))),b=await card.boundingBox();
  await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2,b.y-30,{steps:5});
  const to=await page.evaluate(c=>{draw();const q=ElectricTiles.center(c),s=renderer.screenPoint(q.x-325,4,(q.y-300)*1.06),r=canvas.getBoundingClientRect();return {x:s.x+r.left,y:s.y+r.top};},c);
  await page.mouse.move(to.x,to.y,{steps:12});assert.equal(await page.locator('[data-placement-valid]').getAttribute('data-placement-valid'),'true');await page.mouse.up();
  const normal=await page.evaluate(()=>{
   const water=ElectricTiles.list().find(f=>f.kind==='irrigator'),cell=water.outputs.find(c=>ElectricTiles.canPlace('apple',c)),fruit=ElectricTiles.place('apple',cell);
   enemies=[];enemyTransports=[];spawnQueue=[];missiles=[];bullets=[];shots=[];state='combat';p.x=100;p.y=100;ElectricTiles.startRoom();paused=false;ElectricTiles.update(4);paused=true;draw();
   const data=renderer.sprites.find(s=>s.iconKind==='irrigator').data;draw();return {count:water.count,cool:fruit.cool,received:fruit.received,products:water.products,finite:data.every(Number.isFinite),resident:renderer.sprites.find(s=>s.iconKind==='irrigator').data===data,gl:renderer.gl.getError()};
  });assert.equal(normal.count,1);assert.ok(Math.abs(normal.cool-5)<1e-6);assert.deepEqual({...normal,cool:5},{count:1,cool:5,received:1,products:0,finite:true,resident:true,gl:0});
  const powered=await page.evaluate(()=>{
   ElectricTiles.reset();tiles=[];for(let y=-2;y<=2;y++)for(let x=-3;x<=3;x++)tiles.push({x,y});ElectricEditor.open();
   const water=ElectricTiles.place('irrigator',{x:0,y:0});ElectricTiles.place('apple',{x:1,y:-1});ElectricTiles.place('battery',{x:1,y:0});ElectricTiles.place('echo',{x:0,y:1});ElectricTiles.place('turbine',{x:-2,y:-1});
   ElectricTiles.startRoom();paused=false;ElectricTiles.update(4);paused=true;draw();
   return {count:water.count,received:water.received,covered:ElectricTiles.list().filter(f=>['battery','echo','turbine'].includes(f.kind)).every(f=>ElectricTiles.recipients(f).includes(water)),gl:renderer.gl.getError()};
  });assert.ok(powered.count>=4&&powered.received>0&&powered.covered);assert.equal(powered.gl,0);
  await page.locator('#electric-panel').evaluate(el=>Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{}))));
  for(const [width,height]of [[390,680],[390,844]]){
   await page.setViewportSize({width,height});await page.locator('#electric-placement polygon[data-x="0"][data-y="0"]').click();
   await page.screenshot({path:`tests/electric-irrigator-powered-${width}x${height}.png`});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  }
  await page.evaluate(()=>{ElectricEditor.reset();ElectricTiles.reset();testMode=false;floor++;const pool=Array.from(document.querySelectorAll('[data-test-kind]'),el=>el.dataset.testKind).filter(k=>ElectricEditor.isFloor(k)?ElectricEditor.frontier(k).length:k==='erase'?ElectricEditor.demolitionCells().length:tiles.some(t=>ElectricEditor.canPlace(k,t)));const random=Math.random;let first=true;Math.random=()=>{if(first){first=false;return (pool.indexOf('irrigator')+.1)/pool.length;}return 0;};try{ElectricEditor.prepareFloor();}finally{Math.random=random;}});
  assert.equal(await page.locator('#electric-backpack [data-kind="irrigator"]').count(),1);
  await page.locator('#electric-panel').evaluate(el=>Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{}))));await page.screenshot({path:'tests/electric-irrigator-choices-390x844.png'});
  assert.deepEqual(errors,[]);console.log('Irrigator real Edge/WebGL: requested stock, one-cell placement, six-cell range, actual fruit cooldown reduction, all three power bonuses, resident icon and formal offer passed.',{normal,powered});
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

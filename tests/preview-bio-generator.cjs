const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:680}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?electriclab=1');await page.waitForFunction(()=>window.ElectricEditor?.editing);
  await page.locator('[data-lab-tools] summary').click();await page.locator('[data-test-kind="biogenerator"]').click();
  const card=page.locator('#electric-backpack [data-kind="biogenerator"]').first();assert.equal(await card.locator('.electric-stock-footprint').count(),1);assert.equal(await card.locator('.electric-stock-range').count(),6);
  const c=await page.evaluate(()=>tiles.find(t=>ElectricTiles.canPlace('biogenerator',t))),b=await card.boundingBox();
  await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2,b.y-30,{steps:5});
  const to=await page.evaluate(c=>{draw();const q=ElectricTiles.center(c),s=renderer.screenPoint(q.x-325,4,(q.y-300)*1.06),r=canvas.getBoundingClientRect();return {x:s.x+r.left,y:s.y+r.top};},c);
  await page.mouse.move(to.x,to.y,{steps:12});assert.equal(await page.locator('[data-placement-valid]').getAttribute('data-placement-valid'),'true');await page.mouse.up();
  assert.equal(await page.evaluate(()=>ElectricTiles.list().filter(f=>f.kind==='biogenerator').length),1);
  await page.evaluate(()=>{
   ElectricTiles.reset();tiles=[];for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++)tiles.push({x,y});ElectricEditor.open();
   ElectricTiles.place('biogenerator',{x:0,y:0});ElectricTiles.place('apple',{x:1,y:0});ElectricTiles.place('banana',{x:0,y:-1});ElectricTiles.place('pulse',{x:-1,y:0});
   ElectricTiles.startRoom();enemies=[];enemyTransports=[];spawnQueue=[];missiles=[];bullets=[];shots=[];state='combat';p.hp=p.max=3;p.shield=4;p.inv=10;const q=ElectricTiles.center({x:1,y:0});p.x=q.x;p.y=q.y;draw();
  });
  async function walk(x,y,dt=.01){return page.evaluate(({x,y,dt})=>{
   const q=ElectricTiles.center({x,y});paused=false;walkFloor(p,q.x,q.y,7);ElectricTiles.update(dt);paused=true;draw();
   const bio=ElectricTiles.list().find(f=>f.kind==='biogenerator'),apple=ElectricTiles.list().find(f=>f.kind==='apple');
   return {hp:p.hp,shield:p.shield,inv:p.inv,count:bio.count,refreshed:bio.lastRefreshed,apple:apple.products,cool:apple.cool,cell:HexMap.cellAt(p.x,p.y),gl:renderer.gl.getError()};
  },{x,y,dt});}
  const first=await walk(0,0);assert.equal(first.hp,2);assert.equal(first.shield,4);assert.equal(first.inv,10);assert.equal(first.count,1);assert.equal(first.refreshed,3);assert.equal(first.apple,1);assert.deepEqual(first.cell,{x:0,y:0});assert.equal(first.gl,0);
  const standing=await walk(0,0,2);assert.equal(standing.hp,2);assert.equal(standing.count,1);
  for(let i=0;i<3;i++){
   const healed=await walk(1,0,.3);assert.equal(healed.hp,3);assert.equal(healed.apple,0);
   const again=await walk(0,0);assert.equal(again.hp,2);assert.equal(again.apple,1);assert.equal(again.count,i+2);
  }
  await page.locator('#electric-panel').evaluate(el=>Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{}))));
  for(const [width,height]of [[390,680],[390,844]]){await page.setViewportSize({width,height});await page.locator('#electric-placement polygon[data-x="0"][data-y="0"]').click();await page.screenshot({path:`tests/bio-generator-loop-${width}x${height}.png`});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
  await walk(1,0,.3);await page.evaluate(()=>p.hp=1);const low=await walk(0,0);assert.equal(low.hp,1);assert.equal(low.count,4);assert.equal(low.apple,0);
  // Formal offer uses the same footprint, range and explicit health price.
  await page.evaluate(()=>{ElectricEditor.reset();ElectricTiles.reset();testMode=false;floor++;const random=Math.random;let first=true;Math.random=()=>{if(first){first=false;return 11.1/16;}return 0;};try{ElectricEditor.prepareFloor();}finally{Math.random=random;}});
  assert.equal(await page.locator('#electric-backpack [data-kind="biogenerator"]').count(),1);assert.ok((await page.locator('#electric-backpack [data-kind="biogenerator"] small').textContent()).includes('消耗1点生命'));
  await page.locator('#electric-panel').evaluate(el=>Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{}))));await page.screenshot({path:'tests/bio-generator-choices-390x844.png'});
  assert.deepEqual(errors,[]);console.log('Bio generator real Edge/WebGL: explicit stock, one-cell/six-neighbor drag, actual walking health/food/refresh cycle repeated three times, standing latch, shield/invulnerability cost, one-hp guard, shared icon and formal offer passed.',{first,standing});
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

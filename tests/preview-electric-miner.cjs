const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:680}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?electriclab=1');await page.waitForFunction(()=>window.ElectricEditor?.editing);
  await page.locator('[data-lab-tools] summary').click();await page.locator('[data-test-kind="miner"]').click();
  assert.deepEqual(await page.evaluate(()=>ElectricEditor.stock.slice(0,3).map(i=>i.kind)),['miner','miner','miner']);
  const card=page.locator('#electric-backpack [data-kind="miner"]').first();assert.equal(await card.locator('.electric-stock-footprint').count(),7);assert.equal(await card.locator('.electric-stock-range').count(),0);
  const c=await page.evaluate(()=>tiles.find(t=>ElectricTiles.canPlace('miner',t))),box=await card.boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2,box.y-30,{steps:5});
  const at=await page.evaluate(c=>{draw();const q=ElectricTiles.center(c),s=renderer.screenPoint(q.x-325,4,(q.y-300)*1.06),r=canvas.getBoundingClientRect();return {x:s.x+r.left,y:s.y+r.top};},c);
  await page.mouse.move(at.x,at.y,{steps:12});assert.equal(await page.locator('[data-placement-valid]').getAttribute('data-placement-valid'),'true');await page.mouse.up();
  assert.equal(await page.evaluate(()=>ElectricTiles.list().filter(f=>f.kind==='miner').length),1);
  await page.evaluate(()=>{enemies=[];enemyTransports=[];spawnQueue=[];missiles=[];bullets=[];shots=[];cash=0;state='combat';paused=false;p.x=100;p.y=100;ElectricTiles.startRoom();ElectricTiles.update(4);paused=true;draw();});
  const held=await page.evaluate(()=>{const m=ElectricTiles.list().find(f=>f.kind==='miner');return {cash,products:m.products,produced:m.produced,visible:renderer.residentMeshes.has('pickup-chip:#78c997'),gl:renderer.gl.getError()};});
  assert.deepEqual(held,{cash:0,products:1,produced:1,visible:true,gl:0});
  await page.locator('#electric-panel').evaluate(el=>Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{}))));
  await page.screenshot({path:'tests/electric-miner-awaiting-pickup-390x680.png'});
  const picked=await page.evaluate(()=>{const m=ElectricTiles.list().find(f=>f.kind==='miner');paused=false;ElectricTiles.update(30);const held=m.products===1&&m.produced===1&&m.cool===4&&cash===0;const q=ElectricTiles.center(m.anchor);walkFloor(p,q.x,q.y,7);ElectricTiles.update(.01);paused=true;draw();return {held,cash,earned:m.earned,products:m.products,cool:m.cool,shots:shots.length,gl:renderer.gl.getError()};});
  assert.deepEqual(picked,{held:true,cash:8,earned:8,products:0,cool:4,shots:0,gl:0});
  const combination=await page.evaluate(()=>{
   ElectricTiles.reset();tiles=[];for(let y=-2;y<=2;y++)for(let x=-3;x<=3;x++)tiles.push({x,y});ElectricEditor.open();cash=0;p.x=100;p.y=100;
   const m=ElectricTiles.place('miner',{x:0,y:0});for(const kind of ['battery','echo','turbine'])ElectricTiles.place(kind,tiles.find(c=>ElectricTiles.canPlace(kind,c)&&ElectricTiles.shape(kind,c).outputs.some(o=>m.cells.some(t=>t.x===o.x&&t.y===o.y))));
   ElectricTiles.startRoom();state='combat';paused=false;ElectricTiles.update(30);const waiting={cash,products:m.products,produced:m.produced,cool:m.cool};
   const q=ElectricTiles.center(m.anchor);p.x=q.x;p.y=q.y;ElectricTiles.update(.01);const partial=m.products===1&&cash===8&&m.cool===4;ElectricTiles.update(.25);paused=true;draw();updateUI();
   return {waiting,partial,cash,earned:m.earned,products:m.products,cool:m.cool,gl:renderer.gl.getError()};
  });assert.deepEqual(combination,{waiting:{cash:0,products:2,produced:2,cool:4},partial:true,cash:16,earned:16,products:0,cool:4,gl:0});
  // Formal round offers the miner with its description, then starts after placement as usual.
  await page.evaluate(()=>{ElectricEditor.reset();ElectricTiles.reset();testMode=false;floor++;const random=Math.random;Math.random=()=>.28;try{ElectricEditor.prepareFloor();}finally{Math.random=random;}});
  assert.equal(await page.locator('#electric-backpack [data-kind="miner"]').count(),1);
  assert.ok((await page.locator('#electric-backpack [data-kind="miner"] small').textContent()).includes('每4秒产出8金币'));
  await page.locator('#electric-panel').evaluate(el=>Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{}))));
  await page.screenshot({path:'tests/electric-miner-choices-390x844.png'});
  assert.deepEqual(errors,[]);console.log('Miner real Edge/WebGL: visible gold pickup, zero income while uncollected, blocked production, walking collection, full cooldown restart and all support bonuses passed.',{held,picked,combination});
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

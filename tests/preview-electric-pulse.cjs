const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:680}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?electriclab=1');await page.waitForFunction(()=>window.ElectricEditor?.editing);
  await page.locator('[data-lab-tools] summary').click();await page.locator('[data-test-kind="pulse"]').click();
  const card=page.locator('#electric-backpack [data-kind="pulse"]').first();assert.equal(await card.locator('.electric-stock-footprint').count(),4);assert.equal(await card.locator('.electric-stock-range').count(),10);
  const c=await page.evaluate(()=>tiles.find(t=>ElectricTiles.canPlace('pulse',t))),b=await card.boundingBox();
  await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2,b.y-30,{steps:5});
  const to=await page.evaluate(c=>{draw();const q=ElectricTiles.center(c),s=renderer.screenPoint(q.x-325,4,(q.y-300)*1.06),r=canvas.getBoundingClientRect();return {x:s.x+r.left,y:s.y+r.top};},c);
  await page.mouse.move(to.x,to.y,{steps:12});assert.equal(await page.locator('[data-placement-valid]').getAttribute('data-placement-valid'),'true');await page.mouse.up();
  const ready=await page.evaluate(()=>{
   enemies=[];enemyTransports=[];spawnQueue=[];missiles=[];bullets=[];shots=[];state='combat';p.x=100;p.y=100;spawn({type:'spitter',side:0});const enemy=enemies[0];enemy.hp=enemy.max=500;enemy.fire=999;
   bullets=[{x:90,y:90,vx:0,vy:0,r:4,life:100,c:'#ff7755',drawRadius:4},{x:550,y:450,vx:0,vy:0,r:4,life:100,c:'#ff7755',drawRadius:4}];
   window.pulseBoostTower=ElectricTiles.place('tower',tiles.find(c=>ElectricTiles.canPlace('tower',c)&&ElectricTiles.shape('tower',c).cells.some(t=>ElectricTiles.list().find(f=>f.kind==='pulse').outputs.some(o=>o.x===t.x&&o.y===t.y))));ElectricTiles.startRoom();pulseBoostTower.cool=999;paused=false;ElectricTiles.update(14.99);if(ElectricTiles.list().find(f=>f.kind==='pulse').products!==0)throw Error('Pulse produced before 15 seconds');ElectricTiles.update(.01);ElectricTiles.update(40);paused=true;draw();const f=ElectricTiles.list().find(f=>f.kind==='pulse');
   return {stock:f.products,produced:f.produced,bullets:bullets.length,hp:enemy.hp,sharedModel:renderer.residentMeshes.get('pickup-chip:#6daee9').count>0,gl:renderer.gl.getError()};
  });assert.deepEqual(ready,{stock:1,produced:1,bullets:2,hp:500,sharedModel:true,gl:0});
  await page.screenshot({path:'tests/electric-pulse-ready-390x680.png'});
  const triggered=await page.evaluate(()=>{
   const f=ElectricTiles.list().find(f=>f.kind==='pulse'),q=ElectricTiles.center(f.anchor);p.x=q.x-18;p.y=q.y;walkFloor(p,q.x,q.y,7);paused=false;ElectricTiles.update(.01);paused=true;draw();
   if(Math.abs(ElectricTiles.towerDamage(pulseBoostTower)-7.8)>1e-6||pulseBoostTower.damageBoostLeft!==5)throw Error('Pulse did not boost nearby tower');return {stock:f.products,count:f.count,cool:f.cool,bullets:bullets.length,hp:enemies[0].hp,waves:shockWaves.length,origin:shockWaves[0].x===q.x&&shockWaves[0].y===q.y,gl:renderer.gl.getError()};
  });assert.deepEqual(triggered,{stock:0,count:1,cool:15,bullets:0,hp:500,waves:1,origin:true,gl:0});
  await page.evaluate(()=>{paused=false;updateShockTiles(.08);paused=true;draw();});
  await page.screenshot({path:'tests/electric-pulse-clear-390x680.png'});
  const powered=await page.evaluate(()=>{
   ElectricTiles.reset();tiles=[];for(let y=-2;y<=2;y++)for(let x=-3;x<=3;x++)tiles.push({x,y});ElectricEditor.open();p.x=100;p.y=100;const f=ElectricTiles.place('pulse',{x:0,y:0});for(const kind of ['battery','echo','turbine'])ElectricTiles.place(kind,tiles.find(c=>ElectricTiles.canPlace(kind,c)&&ElectricTiles.shape(kind,c).outputs.some(o=>f.cells.some(t=>t.x===o.x&&t.y===o.y))));ElectricTiles.startRoom();paused=false;ElectricTiles.update(20);paused=true;draw();
   return {products:f.products,received:f.received,count:f.count,covered:ElectricTiles.list().filter(q=>q!==f).every(q=>ElectricTiles.recipients(q).includes(f)),gl:renderer.gl.getError()};
  });assert.ok(powered.products===2&&powered.received>0&&powered.count===0&&powered.covered);assert.equal(powered.gl,0);
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>{ElectricEditor.reset();ElectricTiles.reset();testMode=false;floor++;const pool=[...Object.keys(ElectricTiles.defs),'floor','floorLine','floorBend','floorTriangle','barricade','erase'].filter(k=>ElectricEditor.isFloor(k)?ElectricEditor.frontier(k).length:k==='erase'?ElectricEditor.demolitionCells().length:tiles.some(t=>ElectricEditor.canPlace(k,t)));const expandable=pool.filter(ElectricEditor.isFloor),random=Math.random;let call=0;Math.random=()=>{call++;if(expandable.length&&call===1)return 0;if(call===(expandable.length?2:1)){const remaining=pool.filter(k=>k!==expandable[0]);return (remaining.indexOf('pulse')+.1)/remaining.length;}return 0;};try{ElectricEditor.prepareFloor();}finally{Math.random=random;}});
  assert.equal(await page.locator('#electric-backpack [data-kind="pulse"]').count(),1);
  await page.locator('#electric-panel').evaluate(el=>Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{}))));await page.screenshot({path:'tests/electric-pulse-choices-390x844.png'});
  assert.deepEqual(errors,[]);console.log('Pulse real Edge/WebGL: four-cell rhombus drag, original shock pickup model, original full-screen hostile bullet clear and shock wave, enemy preservation, three power bonuses, waiting rule and formal offers passed.',{ready,triggered,powered});
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

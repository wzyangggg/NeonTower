const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:680}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?electriclab=1');await page.waitForFunction(()=>window.ElectricEditor?.editing&&FruitModels.ready);
  await page.locator('#electric-panel').evaluate(el=>Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{}))));
  await page.evaluate(()=>{ElectricTiles.reset();tiles=[];for(let y=-5;y<=5;y++)for(let x=-6;x<=6;x++)tiles.push({x,y});ElectricEditor.open();draw();});
  for(const kind of ['apple','watermelon','banana','grape']){
   await page.locator('[data-lab-tools] summary').click();await page.locator(`[data-test-kind="${kind}"]`).click();
   const card=page.locator(`#electric-backpack [data-kind="${kind}"]`).first();assert.equal(await card.locator('.electric-stock-footprint').count(),({apple:6,watermelon:9,banana:7,grape:8})[kind]);assert.equal(await card.locator('.electric-stock-range').count(),0);
   const c=({apple:{x:-4,y:-3},watermelon:{x:3,y:2},banana:{x:2,y:-3},grape:{x:-3,y:2}})[kind],b=await card.boundingBox();
   await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2,b.y-30,{steps:5});
   const to=await page.evaluate(({c,kind})=>{draw();const shape=ElectricTiles.shape(kind,c),core=ElectricTiles.coreCell({...shape,kind,anchor:c}),q=ElectricTiles.center(core),s=renderer.screenPoint(q.x-325,4,(q.y-300)*1.06),r=canvas.getBoundingClientRect();return {x:s.x+r.left,y:s.y+r.top};},{c,kind});
   await page.mouse.move(to.x,to.y,{steps:12});assert.equal(await page.locator('[data-placement-valid]').getAttribute('data-placement-valid'),'true');await page.mouse.up();
   assert.equal(await page.evaluate(k=>ElectricTiles.list().filter(f=>f.kind===k).length,kind),1);
  }
  const awaiting=await page.evaluate(()=>{
   enemies=[];enemyTransports=[];spawnQueue=[];missiles=[];bullets=[];shots=[];p.x=100;p.y=100;p.hp=1;p.max=3;state='combat';paused=false;ElectricTiles.startRoom();ElectricTiles.update(40);paused=true;draw();
   return ElectricTiles.list().map(f=>({kind:f.kind,products:f.products,produced:f.produced,mesh:FruitModels.stats.models.some(m=>m.kind===f.kind&&m.vertices>0)&&!renderer.residentMeshes.has('electric:fruit-pickup:'+f.kind)}));
  });assert.equal(awaiting.length,4);for(const f of awaiting)assert.deepEqual(f,{kind:f.kind,products:1,produced:1,mesh:true});
  const uploads=await page.evaluate(()=>FruitModels.stats.uploads);await page.evaluate(()=>{for(let i=0;i<5;i++)draw();});assert.equal(await page.evaluate(()=>FruitModels.stats.uploads),uploads,'fruit meshes only upload once per context');
  await page.screenshot({path:'tests/fruit-supplies-awaiting-390x680.png'});
  // All fruits heal and grant a modest attribute bonus, including at full health.
  for(const kind of ['apple','watermelon','banana','grape']){
   const result=await page.evaluate(k=>{
    const f=ElectricTiles.list().find(f=>f.kind===k),at=ElectricTiles.center(f.cells[0]);
    p.hp=1;p.max=5;p.x=at.x;p.y=at.y;f.products=1;f.pickupCool=0;paused=false;
    const before=ElectricTiles.buffs;ElectricTiles.update(.01);paused=true;time=.4;draw();
    const def=ElectricTiles.fruits[k];return {hp:p.hp,bonus:ElectricTiles.buffs[def.buff]-before[def.buff],gl:renderer.gl.getError()};
   },kind);
   assert.equal(result.hp,kind==='watermelon'?4:2);assert.ok(Math.abs(result.bonus-(['apple','watermelon'].includes(kind)?.1:.2))<1e-6);assert.equal(result.gl,0);
  }
  // Advance to the middle of the heal effect for a visible rising-filament preview.
  await page.evaluate(()=>{p.x=100;p.y=100;paused=false;ElectricTiles.update(.3);paused=true;draw();});
  await page.screenshot({path:'tests/fruit-healing-filaments-390x680.png'});
  await page.evaluate(()=>{ElectricTiles.startRoom();p.hp=1;p.max=3;p.x=100;p.y=100;paused=false;ElectricTiles.update(40);paused=true;draw();});
  for(const [kind,hp]of [['apple',2],['watermelon',3]]){
   const result=await page.evaluate(k=>{const f=ElectricTiles.list().find(f=>f.kind===k),q=ElectricTiles.center(f.cells[0]);paused=false;p.x=q.x-18;p.y=q.y;walkFloor(p,q.x,q.y,7);ElectricTiles.update(.01);paused=true;draw();return {hp:p.hp,stock:f.products,collected:f.collected};},kind);
   assert.deepEqual(result,{hp,stock:0,collected:1});
  }
  const buffs=await page.evaluate(()=>{
   const baseMove=movementSpeed(),baseAttack=attackSpeedMultiplier();
   for(const kind of ['banana','grape']){const f=ElectricTiles.list().find(f=>f.kind===kind),q=ElectricTiles.center(f.cells[0]);paused=false;p.x=q.x-18;p.y=q.y;walkFloor(p,q.x,q.y,7);ElectricTiles.update(.01);paused=true;}
   draw();return {move:movementSpeed()/baseMove,attack:attackSpeedMultiplier()-baseAttack,speed:ElectricTiles.buffs.speed,attackTime:ElectricTiles.buffs.attack,gl:renderer.gl.getError()};
  });assert.ok(Math.abs(buffs.move-1.3/1.1)<1e-6&&Math.abs(buffs.attack-.2)<1e-6&&Math.abs(buffs.speed-.3)<1e-6&&Math.abs(buffs.attackTime-.3)<1e-6);assert.equal(buffs.gl,0);
  assert.equal(await page.locator('#fruit-buffs').isVisible(),true);assert.ok((await page.locator('#fruit-buffs').textContent()).includes('移速+30%'));
  for(const [width,height]of [[390,680],[390,844]]){await page.setViewportSize({width,height});await page.screenshot({path:`tests/fruit-supplies-buffs-${width}x${height}.png`});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
  const stacked=await page.evaluate(()=>{
   p.x=100;p.y=100;paused=false;ElectricTiles.update(60);const retained=Math.abs(ElectricTiles.speedBonus()-.3)<1e-6&&Math.abs(ElectricTiles.attackBonus()-.3)<1e-6;
   for(const kind of ['banana','grape']){const f=ElectricTiles.list().find(f=>f.kind===kind),q=ElectricTiles.center(f.cells[0]);p.x=q.x-18;p.y=q.y;walkFloor(p,q.x,q.y,7);ElectricTiles.update(.01);}
   paused=true;draw();return {retained,speed:ElectricTiles.speedBonus(),attack:ElectricTiles.attackBonus()};
  });assert.deepEqual(stacked,{retained:true,speed:.5,attack:.5});assert.ok((await page.locator('#fruit-buffs').textContent()).includes('移速+50%'));assert.ok((await page.locator('#fruit-buffs').textContent()).includes('攻速+50%'));
  await page.screenshot({path:'tests/fruit-stacking-390x844.png'});
  assert.ok((await page.locator('#fruit-buffs').textContent()).includes('本层累计'));
  await page.evaluate(()=>{startFloorTracking();draw();});assert.equal(await page.locator('#fruit-buffs').isVisible(),false);assert.deepEqual(await page.evaluate(()=>ElectricTiles.buffs),{speed:0,attack:0});
  const fullHealth=await page.evaluate(()=>{p.x=100;p.y=100;p.hp=p.max;paused=false;ElectricTiles.update(40);const result=[];for(const kind of ['apple','watermelon']){const f=ElectricTiles.list().find(f=>f.kind===kind),at=ElectricTiles.center(f.cells[0]),before=f.collected;p.x=at.x;p.y=at.y;ElectricTiles.update(.01);result.push(f.products===0&&f.collected===before+1&&p.hp===p.max&&f.cool===ElectricTiles.defs[kind].interval);}paused=true;return result;});assert.deepEqual(fullHealth,[true,true]);
  await page.evaluate(()=>{ElectricTiles.reset();draw();});assert.equal(await page.locator('#fruit-buffs').isVisible(),false);
  await page.evaluate(()=>{ElectricEditor.reset();ElectricTiles.reset();testMode=false;floor++;const pool=[...Object.keys(ElectricTiles.defs),'floor','floorLine','floorBend','floorTriangle','barricade','erase'].filter(k=>ElectricEditor.isFloor(k)?ElectricEditor.frontier(k).length:k==='erase'?ElectricEditor.demolitionCells().length:tiles.some(t=>ElectricEditor.canPlace(k,t)));const expandable=pool.filter(ElectricEditor.isFloor),random=Math.random;let call=0;Math.random=()=>{call++;if(expandable.length&&call===1)return 0;if(call===(expandable.length?2:1)){const remaining=pool.filter(k=>k!==expandable[0]);return (remaining.indexOf('apple')+.1)/remaining.length;}return 0;};try{ElectricEditor.prepareFloor();}finally{Math.random=random;}});
  assert.equal(await page.locator('#electric-backpack [data-kind="apple"]').count(),1);
  await page.locator('#electric-panel').evaluate(el=>Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{}))));await page.screenshot({path:'tests/fruit-supplies-choices-390x844.png'});
  assert.deepEqual(errors,[]);console.log('Four fruit supplies: requested stock, real drag/drop, visible resident fruit, no uncollected effects, real healing/movement/attack buffs, within-floor stacking, floor-change clearing, new-run reset and formal offers passed.',{awaiting,buffs});
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

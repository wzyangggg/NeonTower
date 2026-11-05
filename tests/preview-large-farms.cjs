const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?electriclab=1');await page.waitForFunction(()=>ElectricEditor.editing&&FruitModels.ready);
 const choices=await page.evaluate(()=>{
  const oldRandom=Math.random,result=[];
  try{for(const congested of [false,true])for(const roll of [0,.01,.1,.25,.5,.75,.99,.999999])for(const stage of [1,4,8,12]){
   ElectricEditor.reset();ElectricTiles.reset();tiles=HexMap.initialFloor();turrets=[];floor=stage;testMode=false;
   if(congested)for(const t of tiles)t.medical=true;
   Math.random=()=>roll;ElectricEditor.prepareFloor();const stock=ElectricEditor.stock;
   if(stock.length!==3||!stock.some(i=>ElectricEditor.isFloor(i.kind)&&ElectricEditor.frontier(i.kind).length))throw Error('Missing expansion '+roll+'/'+stage+'/'+congested);
   if(!stock.every(i=>ElectricEditor.isFloor(i.kind)?ElectricEditor.frontier(i.kind).length:i.kind==='erase'?ElectricEditor.demolitionCells().length:tiles.some(t=>ElectricEditor.canPlace(i.kind,t))))throw Error('Unplaceable offer');
   const ids=JSON.stringify(stock);ElectricEditor.prepareFloor();if(ids!==JSON.stringify(ElectricEditor.stock))throw Error('Duplicate preparation rerolls options');result.push(stock.map(i=>i.kind));
  }}finally{Math.random=oldRandom;}return result.length;
 });assert.equal(choices,64);
 async function point(c){return page.evaluate(c=>{draw();const p=ElectricTiles.center(c),q=renderer.screenPoint(p.x-325,4,(p.y-300)*1.06),r=canvas.getBoundingClientRect();return{x:q.x+r.left,y:q.y+r.top};},c);}
 for(const [kind,size]of [['apple',6],['banana',7],['grape',8],['watermelon',9]]){
  const core=await page.evaluate(kind=>{ElectricEditor.reset();ElectricTiles.reset();tiles=HexMap.initialFloor();enemies=[];enemyTransports=[];spawnQueue=[];shots=[];bullets=[];ElectricEditor.open();const a=tiles.find(t=>ElectricTiles.canPlace(kind,t));if(!a)throw Error('No initial fit '+kind);return ElectricTiles.coreCell({...ElectricTiles.shape(kind,a),kind,anchor:a});},kind);
  await page.locator('#electric-panel').evaluate(el=>Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{}))));
  await page.locator('[data-lab-tools] summary').click();await page.locator(`[data-test-kind="${kind}"]`).click();
  const card=page.locator(`#electric-backpack [data-kind="${kind}"]`).first();assert.equal(await card.locator('.electric-stock-footprint').count(),size);
  const b=await card.boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2,b.y-30,{steps:5});const q=await point(core);await page.mouse.move(q.x,q.y,{steps:12});assert.equal(await page.locator('[data-placement-valid]').getAttribute('data-placement-valid'),'true');await page.mouse.up();
  const stats=await page.evaluate(()=>{const f=ElectricTiles.list()[0];f.products=1;p.x=100;p.y=100;paused=true;draw();return{cells:f.cells.length,facilities:ElectricTiles.list().length,fruit:FruitModels.stats.instances,gl:renderer.gl.getError()};});assert.deepEqual(stats,{cells:size,facilities:1,fruit:1,gl:0});
  await page.screenshot({path:`tests/large-farm-${kind}-390x844.png`});
 }
 assert.deepEqual(errors,[]);console.log('Large farms: 6/7/8/9 cells, real initial-board drags, one facility/fruit, 64 guaranteed playable expansion offer sets, no rerolls/page/GL errors passed');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

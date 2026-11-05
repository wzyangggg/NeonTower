const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?electriclab=1');await page.waitForFunction(()=>ElectricEditor.editing&&FruitModels.ready);
  assert.deepEqual(await page.evaluate(()=>{reset();return {cells:tiles.length,medical:tiles.filter(t=>t.medical).length,shield:tiles.filter(t=>t.shieldTile).length};}),{cells:19,medical:0,shield:0});
  for(const kind of ['apple','banana','grape','watermelon']){
   const fitted=await page.evaluate(kind=>{
    ElectricTiles.reset();tiles=HexMap.initialFloor();enemies=[];enemyTransports=[];spawnQueue=[];ElectricEditor.open();
    let farm,tower;for(const a of tiles){if(!ElectricTiles.canPlace(kind,a))continue;farm=ElectricTiles.place(kind,a);const at=tiles.find(c=>ElectricTiles.canPlace('tower',c));if(at){tower=ElectricTiles.place('tower',at);break;}ElectricTiles.remove(farm);farm=null;}
    if(!farm||!tower)throw Error('No initial farm/tower layout for '+kind);
    farm.products=1;const free=tiles.find(t=>!t.electricFacility&&!t.medical&&!t.shieldTile),at=ElectricTiles.center(free);p.x=at.x;p.y=at.y;paused=true;draw();
    return {floor:tiles.length,farm:farm.cells.length,tower:tower.cells.length,models:FruitModels.stats.instances,gl:renderer.gl.getError()};
   },kind);assert.equal(fitted.floor,19);assert.equal(fitted.tower,3);assert.equal(fitted.models,1);assert.equal(fitted.gl,0);
   await page.locator('[data-lab-tools] summary').click();await page.locator(`[data-test-kind="${kind}"]`).click();await page.screenshot({path:`tests/farm-packing-${kind}-390x844.png`});
  }
  const locked=await page.evaluate(()=>{
   ElectricTiles.reset();tiles=HexMap.initialFloor();let result;
   for(const a of tiles){if(!ElectricTiles.canPlace('tower',a))continue;const f=ElectricTiles.place('tower',a);if(!tiles.some(c=>ElectricTiles.canPlace('watermelon',c))){result={free:tiles.filter(t=>!t.electricFacility&&!t.medical&&!t.shieldTile).length,blocked:true};break;}ElectricTiles.remove(f);}
   return result;
  });assert.ok(locked.blocked&&locked.free>=5);assert.deepEqual(errors,[]);
  console.log('Initial 3/4/5/4/3 floor: each of the four farms can coexist with a real three-cell tower, one shared fruit each, and a tower can block the crescent with enough free area remaining.',locked);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

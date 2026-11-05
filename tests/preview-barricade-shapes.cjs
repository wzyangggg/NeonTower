const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?electriclab=1');await page.waitForFunction(()=>window.ElectricEditor?.editing);
  const removed=['barricadePair','barricadeLine','barricadeBend','barricadeTriangle','barricadeDiamond','barricadeHex'];
  for(const kind of removed){assert.equal(await page.locator(`[data-test-kind="${kind}"]`).count(),0);assert.equal(await page.locator(`#electric-backpack [data-kind="${kind}"]`).count(),0);assert.equal(await page.evaluate(k=>ElectricEditor.isBarricade(k)||ElectricEditor.canPlace(k,{x:0,y:0})||ElectricEditor.stock.some(i=>i.kind===k),kind),false);}
  async function load(kind){await page.evaluate(k=>ElectricEditor.catalog([k]),kind);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}
  async function drag(kind,c){
   const source=page.locator(`#electric-backpack [data-kind="${kind}"]`).first();await source.scrollIntoViewIfNeeded();const b=await source.boundingBox();
   await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2,b.y-30,{steps:3});
   const to=await page.evaluate(c=>{draw();const q=ElectricTiles.center(c),s=renderer.screenPoint(q.x-325,4,(q.y-300)*1.06),r=canvas.getBoundingClientRect();return {x:s.x+r.left,y:s.y+r.top};},c);
   await page.mouse.move(to.x,to.y,{steps:6});const valid=await page.locator('[data-placement-valid]').getAttribute('data-placement-valid');await page.mouse.up();return valid;
  }
  for(const [kind,size]of [['barricade',1],['barricade_double',2],['barricade_line',3],['barricade_bend',3],['barricade_double',5]])for(const row of [0,1]){
   await page.evaluate(()=>{ElectricTiles.reset();tiles=[];for(let y=-4;y<=4;y++)for(let x=-4;x<=4;x++)tiles.push({x,y});enemies=[];bullets=[];ElectricEditor.open();draw();});
   if(size===5)await page.evaluate(()=>{
    const wall={name:'五格自定义掩体',enabledInGame:true,cells:[[0,0],[1,0],[2,0],[0,1],[1,1]],effectMode:'none',effectCells:[],range:0};
    const battery={...wall,cells:[[0,0],[1,0],[2,0],[3,0],[4,0],[5,0]]};
    localStorage.setItem('neon-facility-designer-v1',JSON.stringify({version:2,designCatalogVersion:4,facilities:{barricade_double:wall,battery}}));
   });
   await page.locator('#electric-panel').evaluate(el=>Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{}))));await load(kind);
   assert.equal(await page.locator(`#electric-backpack [data-kind="${kind}"]`).first().locator('.electric-stock-footprint').count(),size);
   const checked=await page.evaluate(({kind,row})=>{
    const E=ElectricEditor,c={x:0,y:row},s=E.shape(kind,c),last=s.cells.at(-1),tile=tiles.find(t=>t.x===last.x&&t.y===last.y);
    tile.medical=true;const conflict=!E.canPlace(kind,c);delete tile.medical;
    const full=tiles;tiles=s.cells.map(c=>({...c}));const noLastFoot=!E.canPlace(kind,c);tiles=full;
    return {conflict,noLastFoot,outside:!E.canPlace(kind,{x:99,y:99}),stock:E.stock.length};
   },{kind,row});assert.ok(checked.conflict&&checked.noLastFoot&&checked.outside);
   assert.equal(await drag(kind,{x:0,y:row}),'true');assert.equal(await page.evaluate(()=>ElectricEditor.stock.length),checked.stock);
   const result=await page.evaluate(()=>{
    const walls=tiles.filter(t=>t.coverTile),group=walls[0].barricadeGroup,last=walls.at(-1),q=ElectricTiles.center(last);
    const bound=walls.every(t=>t.barricadeGroup===group&&!builderTileAvailable(t));
    paused=false;damageCover(last,99);const others=walls.filter(t=>t!==last).every(t=>t.coverHp===4),broken=last.coverHp===0;
    p.x=q.x;p.y=q.y;refreshCoverTiles();paused=true;draw();
    return {size:walls.length,bound,others,broken,rebuilt:walls.every(t=>t.coverHp===4),safe:walls.every(t=>!coverContains(t,p.x,p.y,7)),last:{x:last.x,y:last.y},gl:renderer.gl.getError()};
   });assert.equal(result.size,size);assert.ok(result.bound&&result.others&&result.broken&&result.rebuilt&&result.safe);assert.equal(result.gl,0);
   if(row===0){
    for(const [width,height]of [[390,844],[390,680],[1280,900]]){await page.setViewportSize({width,height});await page.evaluate(()=>draw());await page.screenshot({path:`tests/barricade-shape-${kind}-${width}x${height}.png`});}
    await page.setViewportSize({width:390,height:844});
   }
   await load('erase');assert.equal(await drag('erase',result.last),'true');assert.ok(await page.evaluate(()=>tiles.every(t=>!t.coverTile&&!t.barricadeGroup)&&tiles.length===81));
  }
  await page.evaluate(()=>{
   const data=JSON.parse(localStorage.getItem('neon-facility-designer-v1'));data.facilities.barricade_double.enabledInGame=false;localStorage.setItem('neon-facility-designer-v1',JSON.stringify(data));
   if(ElectricTiles.enabled('barricade_double')||ElectricEditor.canPlace('barricade_double',{x:0,y:0}))throw Error('Disabled cover still placeable');
   data.facilities.barricade_double.enabledInGame=true;data.facilities.barricade_double.cells=[[0,0],[5,0]];localStorage.setItem('neon-facility-designer-v1',JSON.stringify(data));
   if(ElectricEditor.shape('barricade_double',{x:0,y:0}).cells.length!==2)throw Error('Disconnected saved footprint did not fall back');
  });
  assert.deepEqual(errors,[]);console.log('Editable single/multi-cell barricades: legacy IDs unavailable, real drag on odd/even rows, multi-cell cards and occupancy, conflicts, last standing cell protection, HP/rebuild, safe relocation and demolition passed; three viewports, zero page/GL errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

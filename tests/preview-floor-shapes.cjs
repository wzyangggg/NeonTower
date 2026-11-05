const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:680}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?electriclab=1');
  await page.waitForFunction(()=>window.ElectricEditor?.editing);
  assert.equal(await page.locator('[data-kind="tower"] span').first().textContent(),'电浆炸弹 · 1级');
  assert.equal(await page.locator('#electric-panel').textContent().then(s=>s.includes('电能激荡格')),false);
  // Coverage must include non-anchor footprint cells, including beside the floor.
  const coverageChecks=await page.evaluate(()=>{
   const kinds=['floor','floorLine','floorBend','floorTriangle'],key=c=>c.x+','+c.y,results=[];
   const layouts=[[{x:0,y:0}],[{x:0,y:1}],tiles.map(t=>({x:t.x,y:t.y})),
    [{x:grid.minX,y:grid.minY}],[{x:grid.maxX,y:grid.maxY}],
    Array.from({length:(grid.maxX-grid.minX+1)*(grid.maxY-grid.minY+1)},(_,i)=>({x:grid.minX+i%(grid.maxX-grid.minX+1),y:grid.minY+Math.floor(i/(grid.maxX-grid.minX+1))}))];
   for(const layout of layouts)for(const kind of kinds){
    tiles=layout.map(t=>({...t}));const covered=new Set(ElectricEditor.floorCoverage(kind).map(key)),expected=new Set(),anchors=new Set();
    for(let y=grid.minY;y<=grid.maxY;y++)for(let x=grid.minX;x<=grid.maxX;x++)if(ElectricEditor.canExpand(kind,{x,y})){
     anchors.add(key({x,y}));for(const c of ElectricEditor.shape(kind,{x,y}).cells)expected.add(key(c));
    }
    const adjacent=tiles.flatMap(t=>HexMap.neighbors(t.x,t.y).map(([dx,dy])=>({x:t.x+dx,y:t.y+dy}))).filter(c=>expected.has(key(c)));
    results.push({match:covered.size===expected.size&&[...expected].every(k=>covered.has(k)),
     adjacent:adjacent.every(c=>covered.has(key(c))),occupied:tiles.some(c=>covered.has(key(c))),
     hasNonAnchor:[...covered].some(k=>!anchors.has(k))});
   }
   return results;
  });
  assert(coverageChecks.every(r=>r.match&&r.adjacent&&!r.occupied));
  assert(coverageChecks.some(r=>r.hasNonAnchor),'coverage includes cells that are not valid anchors');
  assert.equal(await page.evaluate(()=>{
   tiles=[{x:0,y:0}];return !ElectricEditor.canExpand('floorLine',{x:-1,y:0})&&ElectricEditor.floorCoverage('floorLine').some(c=>c.x===-1&&c.y===0);
  }),true,'left floor edge stays hinted even when an anchor there would overlap');
  for(const [kind,size]of Object.entries({floor:2,floorLine:3,floorBend:3,floorTriangle:3})){
   for(const row of [0,1]){
    await page.evaluate(row=>{tiles=[{x:0,y:row,healProgress:0}];ElectricTiles.reset();ElectricEditor.open();draw();},row);
    await page.locator('#electric-panel').evaluate(el=>Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{}))));
    const source=page.locator(`[data-kind="${kind}"]`).first();
    assert.equal(await source.locator('.electric-stock-footprint').count(),size);
    const check=await page.evaluate(({kind,row})=>{
     const c={x:1,y:row},cells=ElectricEditor.shape(kind,c).cells;
     const valid=ElectricEditor.canExpand(kind,c),disconnected=ElectricEditor.canExpand(kind,{x:4,y:row}),outside=ElectricEditor.canExpand(kind,{x:grid.maxX,y:row});
     tiles.push({...cells.at(-1),medical:true});const overlap=ElectricEditor.canExpand(kind,c);tiles.pop();
     return {cells,valid,disconnected,outside,overlap};
    },{kind,row});
    assert.equal(check.valid,true);assert.equal(check.disconnected,false);assert.equal(check.outside,false);assert.equal(check.overlap,false);
    const before=await page.evaluate(()=>ElectricEditor.stock.length);
    async function drag(c,cancel=false){
     await source.evaluate(el=>el.scrollIntoView({block:'nearest',inline:'center'}));
     const box=await source.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
     await page.mouse.move(box.x+box.width/2,box.y-30,{steps:5});
     const hints=await page.evaluate(kind=>({expected:ElectricEditor.floorCoverage(kind).map(c=>c.x+','+c.y).sort(),actual:[...document.querySelectorAll('#electric-placement polygon[data-x]')].map(el=>el.dataset.x+','+el.dataset.y).filter(k=>!tiles.some(t=>t.x+','+t.y===k)).sort()}),kind);
     assert.deepEqual(hints.actual,hints.expected,'drag overlay shows the complete coverage');
     const target=await page.evaluate(c=>{draw();const at=ElectricTiles.center(c),p=renderer.screenPoint(at.x-325,4,(at.y-300)*1.06),r=canvas.getBoundingClientRect();return {x:p.x+r.left,y:p.y+r.top};},c);
     await page.mouse.move(target.x,target.y,{steps:10});
     if(kind==='floorLine'&&row===0&&!cancel)await page.screenshot({path:'tests/floor-coverage-390x680.png'});
     const valid=await page.locator('[data-placement-valid]').getAttribute('data-placement-valid');
     if(cancel)await page.evaluate(()=>document.dispatchEvent(new PointerEvent('pointercancel',{pointerId:1})));
     await page.mouse.up();return valid;
    }
    assert.equal(await drag({x:0,y:row}),'false');
    assert.equal(await page.evaluate(()=>tiles.length),1);assert.equal(await page.evaluate(()=>ElectricEditor.stock.length),before);
    assert.equal(await drag({x:1,y:row},true),'true');assert.equal(await page.evaluate(()=>tiles.length),1);
    assert.equal(await drag({x:1,y:row}),'true');
    assert.equal(await page.evaluate(()=>tiles.length),1+size);assert.equal(await page.evaluate(()=>ElectricEditor.stock.length),before-1);
    assert.deepEqual(await page.evaluate(()=>tiles.slice(1).map(({x,y})=>({x,y}))),check.cells);
    assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);
   }
  }
  await page.evaluate(()=>{
   ElectricEditor.reset();ElectricTiles.reset();testMode=false;floor=1;tiles=[{x:0,y:0}];
   const random=Math.random;Math.random=()=>.3;try{ElectricEditor.prepareFloor();}finally{Math.random=random;}draw();
  });
  await page.locator('#electric-panel').evaluate(el=>Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{}))));
  assert.equal(await page.evaluate(()=>ElectricEditor.stock.length),3);
  assert.equal(await page.evaluate(()=>ElectricEditor.stock.some(i=>ElectricEditor.isFloor(i.kind))),false);
  await page.screenshot({path:'tests/floor-shapes-390x680.png'});
  assert.equal(await page.evaluate(()=>tiles.length),1,'offering facilities does not expand the floor');
  assert.deepEqual(errors,[]);
  console.log('Four 2–3 cell floor shapes: real Edge/WebGL thumbnails, odd/even hex rows, complete placement, overlap/boundary/connectivity, cancellation and stock conservation passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?electriclab=1');await page.waitForFunction(()=>window.HexMap?.ready&&window.ElectricEditor?.editing);
  assert.equal(await page.locator('[data-rotate]').count(),0);assert.equal(await page.locator('#electric-panel select').count(),0);
  const initialStock=await page.evaluate(()=>ElectricEditor.stock.length);assert.ok(initialStock>=8);
  assert.equal(await page.locator('#electric-backpack .electric-stock-card').count(),initialStock);assert.equal(await page.locator('#electric-backpack').evaluate(el=>getComputedStyle(el).display),'flex');for(const [kind,count]of Object.entries({tower:1,battery:1,echo:2,turbine:3})){const card=page.locator(`#electric-backpack [data-kind="${kind}"]`).first();assert.equal(await card.locator('.electric-stock-footprint').count(),count);const expected=kind==='tower'?0:await page.evaluate(k=>ElectricTiles.shape(k,{x:0,y:0}).outputs.length,kind);assert.equal(await card.locator('.electric-stock-range').count(),expected);if(expected)assert.equal(await card.locator('.electric-stock-range').first().evaluate(el=>getComputedStyle(el).animationName),'none');if(kind!=='tower')assert.equal(await card.locator('polygon[data-effect-cell]').count(),expected);}
  const strip=await page.locator('#electric-backpack').evaluate(el=>{const cards=[...el.children];return {overflow:el.scrollWidth>el.clientWidth,rows:new Set(cards.map(c=>c.offsetTop)).size,width:cards[0].getBoundingClientRect().width,preview:cards[0].querySelector('svg').getBoundingClientRect().height};});assert.ok(strip.overflow&&strip.rows===1&&strip.width>=130&&strip.preview>=88);
  const start=await page.locator('#electric-backpack .electric-stock-card').first().boundingBox();await page.mouse.move(start.x+100,start.y+50);await page.mouse.down();await page.mouse.move(start.x+10,start.y+50,{steps:10});await page.mouse.up();assert.ok(await page.locator('#electric-backpack').evaluate(el=>el.scrollLeft)>40);assert.equal(await page.evaluate(()=>ElectricTiles.list().length),0);
  for(let i=0;i<5;i++)await page.locator('[data-expand]').click();
  async function boxCenter(locator){await locator.evaluate(el=>{if(el.matches('.electric-stock-card'))el.scrollIntoView({block:'nearest',inline:'center'});});return locator.evaluate(el=>{const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};});}
  const cell=c=>page.locator(`#electric-placement polygon[data-x="${c.x}"][data-y="${c.y}"]`);
  async function mouseDrag(from,to){await page.mouse.move(from.x,from.y);await page.mouse.down();await page.mouse.move(to.x,to.y,{steps:14});await page.mouse.up();}
  async function put(kind,c){const from=await boxCenter(page.locator(`#electric-backpack [data-kind="${kind}"]`).first()),to=await boxCenter(cell(c));await mouseDrag(from,to);}
  const dragSource=await boxCenter(page.locator('#electric-backpack [data-kind="battery"]').first()),dragTarget=await boxCenter(cell({x:2,y:0}));
  await page.mouse.move(dragSource.x,dragSource.y);await page.mouse.down();await page.mouse.move(dragTarget.x,dragTarget.y,{steps:14});
  assert.equal(await page.locator('.electric-drag-ghost').count(),0);
  const preview=page.locator('[data-placement-valid]'),range=page.locator('#electric-placement [data-effect-range]');
  assert.equal(await preview.getAttribute('data-placement-valid'),'true');assert.equal(await preview.getAttribute('data-ground-renderer'),'webgl');
  assert.equal(await range.getAttribute('data-effect-range'),'battery');
  const animation=()=>page.evaluate(()=>{draw();const d=renderer.transparentData.subarray(0,renderer.transparentCount);return {alpha:Array.from(d).filter((_,i)=>i%7===6).reduce((a,b)=>a+b,0),positions:Array.from(d).filter((_,i)=>i%7<3).reduce((a,b)=>a+b,0),finite:d.every(Number.isFinite),vertices:d.length};});
  const a=await animation();await page.waitForTimeout(230);const b=await animation();assert.ok(a.finite&&b.finite&&a.vertices>0);assert.notEqual(a.alpha,b.alpha,'paused ground preview blinks');assert.equal(a.positions,b.positions,'world range dashes stay still while placement tint blinks');
  assert.equal(await page.locator('#electric-placement polygon').evaluateAll(els=>els.every(el=>el.getAttribute('fill')==='transparent'&&el.getAttribute('stroke')==='none')),true,'screen picking layer has no visible ground marks');
  await page.screenshot({path:'tests/electric-drag-valid-flow.png'});
  const blocked=await boxCenter(cell({x:0,y:1}));await page.mouse.move(blocked.x,blocked.y,{steps:10});assert.equal(await preview.getAttribute('data-placement-valid'),'false');await page.evaluate(()=>draw());await page.screenshot({path:'tests/electric-drag-invalid-blink.png'});await page.mouse.up();assert.equal(await page.evaluate(()=>ElectricEditor.stock.length),initialStock);
  // Empty space and positions beyond the fixed board still show the full red footprint.
  for(const kind of ['floor','floorLine','floorBend','floorTriangle','battery','echo','turbine']){
   const from=await boxCenter(page.locator(`#electric-backpack [data-kind="${kind}"]`).first());await page.mouse.move(from.x,from.y);await page.mouse.down();await page.mouse.move(from.x,from.y-35,{steps:5});
   for(const empty of [{x:22,y:30},{x:360,y:30}]){
    await page.mouse.move(empty.x,empty.y,{steps:8});assert.equal(await preview.getAttribute('data-placement-valid'),'false',kind+' red preview outside floor');
    const red=await page.evaluate(()=>{let vertices=0;const original=renderer.transparentQuad;renderer.transparentQuad=function(a,b,c,d,color,alpha){if(color==='#ff6876')vertices+=4;return original.call(this,a,b,c,d,color,alpha);};try{draw();}finally{renderer.transparentQuad=original;}return vertices;});assert.ok(red>0,kind+' draws actual red footprint');
   }
   if(kind==='turbine')await page.screenshot({path:'tests/electric-drag-empty-red.png'});
   await page.mouse.up();assert.equal(await page.evaluate(()=>ElectricEditor.stock.length),initialStock);assert.equal(await page.evaluate(()=>ElectricTiles.list().length),0);
  }
  await put('tower',{x:2,y:0});assert.equal(await page.evaluate(()=>ElectricTiles.list().length),1);assert.equal(await page.evaluate(()=>ElectricEditor.stock.length),initialStock-1);
  assert.equal(await page.evaluate(()=>renderer.residentMeshes.has('electric:tesla-tower')),true);
  assert.equal(await page.evaluate(()=>{draw();const d=renderer.sprites.find(s=>s.iconKind==='tower').data;for(let i=1;i<d.length;i+=5)if(Math.abs(d[i]-10.35)>.001)return false;return true;}),true);
  await put('battery',{x:2,y:0});assert.equal(await page.evaluate(()=>ElectricTiles.list().length),1);assert.equal(await page.evaluate(()=>ElectricEditor.stock.length),initialStock-1);
  await put('battery',{x:0,y:1});assert.equal(await page.evaluate(()=>ElectricTiles.list().length),1);
  const outside=await boxCenter(page.locator('#electric-backpack [data-kind="battery"]').first());await mouseDrag(outside,{x:22,y:220});assert.equal(await page.evaluate(()=>ElectricEditor.stock.length),initialStock-1);
  for(const kind of ['echo','turbine','battery']){
   const option=await page.evaluate(kind=>tiles.find(t=>ElectricTiles.canPlace(kind,t)&&ElectricTiles.shape(kind,t).outputs.some(c=>c.x===2&&c.y===0)),kind);assert.ok(option,'room for '+kind);await put(kind,option);
  }
  assert.equal(await page.evaluate(()=>ElectricTiles.list().length),4);
  await page.evaluate(()=>{window.requestAnimationFrame=()=>0;});await page.waitForTimeout(100);
  const edit=await page.evaluate(()=>{draw();return {stock:ElectricEditor.stock.length,kinds:ElectricTiles.list().map(f=>f.kind),finite:renderer.data.subarray(0,renderer.count).every(Number.isFinite),gl:renderer.gl.getError(),width:document.getElementById('electric-panel').getBoundingClientRect().width};});assert.equal(edit.finite,true);assert.equal(edit.gl,0);assert.ok(edit.width<=390);
  for(const [width,height]of [[390,844],[390,680],[1280,900]]){await page.setViewportSize({width,height});await page.evaluate(()=>draw());await page.screenshot({path:`tests/electric-backpack-${width}x${height}.png`});}
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>draw());
  const echo=await page.evaluate(()=>ElectricTiles.list().find(f=>f.kind==='echo'));
  const destination=await page.evaluate(()=>{const f=ElectricTiles.list().find(f=>f.kind==='echo');return tiles.find(t=>ElectricTiles.canPlace('echo',t,f)&&Math.abs(t.x-f.anchor.x)+Math.abs(t.y-f.anchor.y)>1);});assert.ok(destination);
  const gripDestination=await page.evaluate(c=>ElectricTiles.shape('echo',c).cells[1],destination);
  await mouseDrag(await boxCenter(cell(echo.cells[1])),await boxCenter(cell(gripDestination)));assert.deepEqual(await page.evaluate(()=>ElectricTiles.list().find(f=>f.kind==='echo').anchor),{x:destination.x,y:destination.y});
  await mouseDrag(await boxCenter(cell(destination)),await boxCenter(cell({x:2,y:0})));assert.deepEqual(await page.evaluate(()=>ElectricTiles.list().find(f=>f.kind==='echo').anchor),{x:destination.x,y:destination.y});
  await mouseDrag(await boxCenter(cell(destination)),await boxCenter(page.locator('#electric-backpack')));assert.equal(await page.evaluate(()=>ElectricTiles.list().some(f=>f.kind==='echo')),false);assert.equal(await page.evaluate(()=>ElectricEditor.stock.length),initialStock-3);
  const newEcho=await page.evaluate(()=>tiles.find(t=>ElectricTiles.canPlace('echo',t)&&ElectricTiles.shape('echo',t).outputs.some(c=>c.x===2&&c.y===0)));await put('echo',newEcho);
  await page.locator('[data-run]').click();assert.equal(await page.locator('#electric-backpack').isVisible(),false);
  const battle=await page.evaluate(()=>{
   enemies=[];enemyTransports=[];missiles=[];spawnQueue=[{type:'eye',side:0}];timedRoom={duration:999,remaining:999,nextWaveAt:999};shootTimer=999;p.inv=999;time=0;
   for(let i=0;i<4;i++){spawn({type:'spitter',side:0});const e=enemies.at(-1);e.x=400+i*32;e.y=290+i*13;e.hp=e.max=2000;e.fire=999;e.weaponLabTarget=true;}
   ElectricTiles.startRoom();const tower=ElectricTiles.list().find(f=>f.kind==='tower'),origin=ElectricTiles.center(tower.anchor);p.x=origin.x-90;p.y=origin.y;tower.cool=.05;const before=enemies.reduce((s,e)=>s+e.hp,0);for(let i=0;i<100;i++)step(.02);draw();
   const uncollectedDamage=before-enemies.reduce((s,e)=>s+e.hp,0),stocked=tower.products;draw();const productVisible=renderer.residentMeshes.get('pickup-chip:#78c997')?.count>0;p.x=origin.x;p.y=origin.y;for(let i=0;i<30;i++)step(.02);draw();const data=renderer.sprites.find(s=>s.iconKind==='tower').data;for(let i=0;i<10;i++)draw();const at=ElectricTiles.center(tower.anchor);p.x=at.x-18;p.y=at.y;walkFloor(p,at.x+18,at.y,7);
   return {uncollectedDamage,stocked,productVisible,damage:before-enemies.reduce((s,e)=>s+e.hp,0),attacks:tower.attacks,walk:Math.abs(p.x-at.x-18)<.01,resident:renderer.sprites.find(s=>s.iconKind==='tower').data===data,gl:renderer.gl.getError()};
  });assert.ok(battle.uncollectedDamage>0);assert.equal(battle.stocked,0);assert.equal(battle.productVisible,false);assert.ok(battle.damage>0&&battle.attacks>=2);assert.equal(battle.walk,true);assert.equal(battle.resident,true);assert.equal(battle.gl,0);
  assert.equal(await page.evaluate(()=>{renderer.initializeGPU();draw();return renderer.gl.getError();}),0);assert.deepEqual(errors,[]);
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true}),touchPage=await context.newPage();touchPage.on('pageerror',e=>errors.push(e.message));
  await touchPage.goto('http://127.0.0.1:4173/?electriclab=1');await touchPage.waitForFunction(()=>window.HexMap?.ready&&window.ElectricEditor?.editing);
  const cdp=await context.newCDPSession(touchPage);
  async function touchPoint(locator){await locator.evaluate(el=>{if(el.matches('.electric-stock-card'))el.scrollIntoView({block:'nearest',inline:'center'});});const r=await locator.boundingBox();return {x:r.x+r.width/2,y:r.y+r.height/2};}
  async function touchDrag(from,to,cancel=false){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...from,id:1}]});for(let i=1;i<=12;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:from.x+(to.x-from.x)*i/12,y:from.y+(to.y-from.y)*i/12,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});}
  const touchSource=()=>touchPage.locator('#electric-backpack [data-kind="tower"]').first(),touchCell=touchPage.locator('#electric-placement polygon[data-x="0"][data-y="0"]');
  const beforeTouch=await touchPage.evaluate(()=>ElectricEditor.stock.length);
  const swipe=await touchPage.locator('#electric-backpack .electric-stock-card').first().boundingBox();await touchDrag({x:swipe.x+110,y:swipe.y+40},{x:swipe.x+10,y:swipe.y+40});assert.ok(await touchPage.locator('#electric-backpack').evaluate(el=>el.scrollLeft)>40);assert.equal(await touchPage.evaluate(()=>ElectricTiles.list().length),0);
  await touchDrag(await touchPoint(touchSource()),await touchPoint(touchCell),true);assert.equal(await touchPage.evaluate(()=>ElectricTiles.list().length),0);assert.equal(await touchPage.evaluate(()=>ElectricEditor.stock.length),beforeTouch);
  await touchDrag(await touchPoint(touchSource()),await touchPoint(touchCell));assert.equal(await touchPage.evaluate(()=>ElectricTiles.list().length),1);assert.equal(await touchPage.evaluate(()=>ElectricEditor.stock.length),beforeTouch-1);
  const touchFloor=touchPage.locator('#electric-backpack [data-kind="floor"]').first(),beforeLand=await touchPage.evaluate(()=>tiles.length),floorCount=await touchPage.evaluate(()=>ElectricEditor.stock.filter(i=>i.kind==='floor').length);
  const fromLand=await touchPoint(touchFloor),toLand=await touchPage.evaluate(()=>{const at=ElectricTiles.center({x:2,y:0}),p=renderer.screenPoint(at.x-325,4,(at.y-300)*1.06),r=canvas.getBoundingClientRect();return {x:p.x+r.left,y:p.y+r.top};});await touchDrag(fromLand,toLand);assert.equal(await touchPage.evaluate(()=>tiles.length),beforeLand+2);assert.equal(await touchPage.evaluate(()=>ElectricEditor.stock.filter(i=>i.kind==='floor').length),floorCount-1);
  await touchPage.screenshot({path:'tests/electric-backpack-touch-390x844.png'});assert.deepEqual(errors,[]);await context.close();
  const land=await browser.newPage({viewport:{width:390,height:844}});land.on('pageerror',e=>errors.push(e.message));await land.goto('http://127.0.0.1:4173/?electriclab=1');await land.waitForFunction(()=>window.ElectricEditor?.editing);
  const landStock=()=>land.evaluate(()=>ElectricEditor.stock.filter(i=>i.kind==='floor').length);
  const landStart=await landStock();assert.ok(landStart>=6);
  const project=c=>land.evaluate(c=>{const at=ElectricTiles.center(c),p=renderer.screenPoint(at.x-325,4,(at.y-300)*1.06),r=canvas.getBoundingClientRect();return {x:p.x+r.left,y:p.y+r.top};},c);
  async function landDrag(kind,c,cancel=false){const source=land.locator(`#electric-backpack [data-kind="${kind}"]`).first();await source.evaluate(el=>el.scrollIntoView({block:'nearest',inline:'center'}));const from=await source.boundingBox(),to=await project(c);await land.mouse.move(from.x+from.width/2,from.y+from.height/2);await land.mouse.down();await land.mouse.move(from.x+from.width/2,from.y-16,{steps:4});await land.mouse.move(to.x,to.y,{steps:10});if(cancel)await land.evaluate(()=>document.dispatchEvent(new PointerEvent('pointercancel',{pointerId:1})));await land.mouse.up();await land.waitForTimeout(50);}
  await landDrag('floor',{x:0,y:0});assert.equal(await landStock(),landStart);assert.equal(await land.evaluate(()=>tiles.length),9);
  await landDrag('floor',{x:6,y:0});assert.equal(await landStock(),landStart);assert.equal(await land.evaluate(()=>tiles.length),9);
  await landDrag('floor',{x:2,y:0},true);assert.equal(await landStock(),landStart);assert.equal(await land.evaluate(()=>tiles.length),9);
  await landDrag('floor',{x:2,y:0});assert.equal(await landStock(),landStart-1);assert.equal(await land.evaluate(()=>tiles.length),11);assert.equal(await land.evaluate(()=>hasTile(2,0)),true);
  assert.equal(await land.evaluate(()=>{const t=tiles.find(t=>t.x===2&&t.y===0);return !!(t.medical||t.trap||t.saw||t.flywheel||t.electricFacility);}),false);
  await landDrag('tower',{x:2,y:0});assert.equal(await land.evaluate(()=>tiles.find(t=>t.x===2&&t.y===0).electricFacility?.kind),'tower');
  await land.evaluate(()=>ElectricTiles.place('battery',{x:1,y:0}));const battery=await project({x:1,y:0});await land.mouse.click(battery.x,battery.y);await land.waitForTimeout(30);
  const outsideRange=await land.evaluate(()=>{const quads=[],original=renderer.transparentQuad;renderer.transparentQuad=function(a,b,c,d,color,alpha){if(color==='#a4efff')quads.push(a,b,c,d);return original.call(this,a,b,c,d,color,alpha);};draw();renderer.transparentQuad=original;const at=ElectricTiles.center({x:1,y:-1});return {cells:Number(document.querySelector('[data-effect-range="battery"]').dataset.effectCells),outside:quads.some(p=>p[0]>at.x-325+HexMap.TILE/2),finite:quads.every(p=>p.every(Number.isFinite))};});assert.equal(outsideRange.cells,6);assert.ok(outsideRange.outside&&outsideRange.finite);
  await land.screenshot({path:'tests/electric-floor-expansion-390x844.png'});await land.close();assert.deepEqual(errors,[]);
  console.log('Real Edge/WebGL backpack: mouse and touch drag/drop, invalid/occupied/protected drops, cancellation, board movement, return to bag, stock conservation, no rotation, adjacency supply, three viewports, damage and GPU restoration passed.',{edit,battle});
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

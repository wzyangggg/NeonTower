const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>HexMap.ready);await page.locator('#start').click();await page.waitForFunction(()=>ElectricEditor.preparing);
  async function firstDrag(touch=false){
  await page.waitForFunction(()=>ElectricEditor.preparing);
  await page.locator('#electric-panel').evaluate(el=>Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{}))));
  const offer=await page.evaluate(()=>{const item=ElectricEditor.stock.find(i=>!ElectricEditor.isFloor(i.kind)&&i.kind!=='erase')||ElectricEditor.stock[0];const c=ElectricEditor.isFloor(item.kind)?ElectricEditor.frontier(item.kind).sort((a,b)=>a.x*a.x+a.y*a.y-b.x*b.x-b.y*b.y)[0]:tiles.find(t=>ElectricEditor.canPlace(item.kind,t));return {item,c};});
  await page.evaluate(id=>{window.originalChoice=document.querySelector(`[data-stock-id="${id}"]`);window.originalChoiceHTML=originalChoice.innerHTML;},offer.item.id);
  async function checkOriginalCard(pointerY){
   const result=await page.evaluate(()=>({same:document.querySelector('.electric-stock-card.is-dragging')===window.originalChoice,html:originalChoice.innerHTML===originalChoiceHTML,cards:document.querySelectorAll('#electric-backpack .electric-stock-card').length,tooltip:document.querySelectorAll('.electric-drag-description').length,translate:originalChoice.style.translate,top:originalChoice.getBoundingClientRect().top,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,scale:originalChoice.style.scale,rotate:originalChoice.style.rotate}));
   assert(result.same&&result.html&&result.cards===3&&result.tooltip===0&&result.translate!=='0px 0px','original full option card moves without a duplicated description: '+JSON.stringify(result));
   assert(result.top>=pointerY+20,'top edge stays below the placement pointer with a clear gap');if(result.reduced){assert.equal(result.scale,'1');assert.equal(result.rotate,'0deg');}
  }
  const box=await page.locator(`[data-stock-id="${offer.item.id}"]`).boundingBox();
  const target=await page.evaluate(c=>{const cr=canvas.getBoundingClientRect(),p=renderer.screenPoint(HexMap.x(c.x,c.y),4,HexMap.y(c.y)*1.06);return {x:p.x+cr.left,y:p.y+cr.top,width:0,height:0};},offer.c);
  const x=box.x+box.width/2,y=box.y+box.height/2;
  if(!touch){
   // An invalid drop returns the same DOM card to its original slot without consuming it.
   await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+10,y-30,{steps:3});await page.mouse.move(5,150,{steps:8});await checkOriginalCard(150);await page.mouse.up();
   const restored=await page.evaluate(()=>({same:document.querySelector(`[data-stock-id="${originalChoice.dataset.stockId}"]`)===originalChoice,translate:originalChoice.style.translate,stock:ElectricEditor.stock.length,active:!!document.querySelector('.is-dragging')}));
   assert.deepEqual(restored,{same:true,translate:'',stock:3,active:false});
   await page.locator(`[data-stock-id="${offer.item.id}"]`).evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished.catch(()=>{}))));
   const returned=await page.locator(`[data-stock-id="${offer.item.id}"]`).boundingBox();assert(Math.abs(returned.x-box.x)<1&&Math.abs(returned.y-box.y)<1,'invalid drop restores card coordinates');
   await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+10,y-30,{steps:3});await page.evaluate(()=>document.dispatchEvent(new PointerEvent('pointercancel',{pointerId:1})));await page.mouse.up();
   assert.equal(await page.locator('.is-dragging').count(),0);assert.equal(await page.evaluate(()=>originalChoice.style.translate),'');assert.equal(await page.evaluate(()=>ElectricEditor.stock.length),3);
   await page.locator(`[data-stock-id="${offer.item.id}"]`).evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished.catch(()=>{}))));
  }
  if(touch){
   const cdp=await page.context().newCDPSession(page);
   const send=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y}]});
   await send('touchStart',x,y);await send('touchMove',x+12,y-8);
   for(let i=1;i<=10;i++)await send('touchMove',x+12+(target.x+target.width/2-x-12)*i/10,y-8+(target.y+target.height/2-y+8)*i/10);
   await checkOriginalCard(target.y);await send('touchEnd');await cdp.detach();
  }else{
   await page.mouse.move(x,y);await page.mouse.down();
   await page.mouse.move(x+12,y-8);
   await page.mouse.move(target.x+target.width/2,target.y+target.height/2,{steps:10});await checkOriginalCard(target.y);await page.mouse.up();
  }
  assert.equal(await page.locator('.electric-stock-card.is-dragging').count(),0,'original card movement cleaned up on release');
  assert.equal(await page.evaluate(()=>ElectricEditor.preparing),false,'first diagonal drag should place the offered tile');
  assert.equal(await page.evaluate(()=>ElectricEditor.stock.length),0);
  await page.waitForFunction(()=>!RoomReady.active);
  }
  for(const [width,height]of [[390,844],[390,680]]){
   await page.setViewportSize({width,height});
   for(const touch of [false,true]){
    await page.evaluate(()=>reset());await firstDrag(touch);
    await page.evaluate(()=>{floor++;startWave();});await firstDrag(touch);
   }
  }
  await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>reset());await firstDrag(false);
  // The test backpack still scrolls when its cards overflow horizontally.
  await page.evaluate(()=>ElectricEditor.open());
  await page.locator('#electric-panel').evaluate(el=>Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{}))));
  const card=await page.locator('#electric-backpack .electric-stock-card').first().boundingBox();
  const count=await page.evaluate(()=>ElectricEditor.stock.length);
  await page.mouse.move(card.x+110,card.y+40);await page.mouse.down();await page.mouse.move(card.x+10,card.y+40,{steps:10});await page.mouse.up();
  assert.ok(await page.locator('#electric-backpack').evaluate(el=>el.scrollLeft)>40);
  assert.equal(await page.evaluate(()=>ElectricEditor.stock.length),count);
  assert.deepEqual(errors,[]);
  console.log('First diagonal drag: mouse/touch, two portrait sizes, opening/next floor, and overflowing test backpack scroll passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});


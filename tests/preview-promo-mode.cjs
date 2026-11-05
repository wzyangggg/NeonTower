const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?promo=1&mapseed=promo-test');
  await page.waitForFunction(()=>globalThis.PromoMode?.active&&globalThis.ElectricEditor?.preparing);
  assert.ok(await page.evaluate(()=>testMode));
  assert.ok(await page.evaluate(()=>{syncMusic();return sound&&!music.enabled&&$('bgm').paused;}));
  await page.locator('#promo-panel > summary').click();
  // Use the real stock cards and pointer path, with a deterministic small facility offer.
  async function prepare(){await page.evaluate(()=>{
   ElectricEditor.reset();RoomReady.cancel();ElectricTiles.reset();tiles=[];
   for(let y=-3;y<=3;y++)for(let x=-4;x<=4;x++)tiles.push({x,y});
   state='landing';paused=false;const random=Math.random;Math.random=()=>0;
   try{ElectricEditor.prepareFloor();}finally{Math.random=random;}draw();
  });await page.waitForTimeout(300);}
  async function place(target=null){
   const destination=await page.evaluate(target=>{
    const D=ElectricEditor,item=D.stock.find(i=>!D.isFloor(i.kind)&&i.kind!=='erase'),anchor=target||tiles.find(t=>D.canPlace(item.kind,t));
    if(!anchor)throw Error('no destination');draw();const a=ElectricTiles.center(anchor),s=renderer.screenPoint(a.x-325,4,(a.y-300)*1.06),r=canvas.getBoundingClientRect();
    return {id:item.id,x:s.x+r.left,y:s.y+r.top};
   },target);
   const selector=await page.evaluate(id=>{const card=[...document.querySelectorAll('#electric-panel [data-stock-id]')].find(e=>Number(e.dataset.stockId)===id);return card?.outerHTML;},destination.id);
   const card=page.locator(`#electric-panel [data-stock-id="${destination.id}"]`);
   if(!selector)throw Error('stock card selector missing');
   await card.waitFor({state:'visible'});const box=await card.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
   await page.mouse.move(destination.x,destination.y,{steps:20});await page.mouse.up();await page.waitForTimeout(100);
  }
  await prepare();await page.evaluate(()=>{globalThis.promoTestRandom=Math.random;Math.random=()=>0;});
  await place();assert.ok(await page.evaluate(()=>ElectricEditor.preparing&&ElectricTiles.list().length===1&&ElectricEditor.stock.length>0));
  await place();assert.ok(await page.evaluate(()=>ElectricEditor.preparing&&ElectricTiles.list().length===2));
  await page.evaluate(()=>{Math.random=globalThis.promoTestRandom;delete globalThis.promoTestRandom;});
  await page.evaluate(()=>{ElectricTiles.reset();ElectricTiles.place('battery',{x:-2,y:0});ElectricEditor.prepareFloor();ElectricEditor.catalog(['battery']);});
  await place({x:-2,y:0});await page.waitForFunction(()=>!document.querySelector('[data-merge-celebration]'));
  assert.ok(await page.evaluate(()=>ElectricEditor.preparing&&ElectricTiles.list()[0].level===2&&ElectricEditor.stock.length>0));
  await page.locator('#electric-panel [data-run]').click();await page.waitForFunction(()=>!ElectricEditor.preparing&&state==='combat');
  assert.ok(await page.evaluate(()=>timedRoom&&testMode));
  // Pause, sound toggles and boss track changes cannot re-enable promotional BGM.
  assert.ok(await page.evaluate(()=>{togglePause();togglePause();$('sound').onclick();$('sound').onclick();syncMusic();beep(440,.03);return sound&&!music.enabled&&$('bgm').paused&&audio&&audio.state!=='closed';}));
  const equipped=await page.evaluate(()=>{
   const result=[];for(const key of ['weapon','armor','shoes','drone','bomb']){
    const id=testEquipmentTypes(key).filter(e=>e.id!=='tentacle'&&e.id!=='flysword').at(-1).id;
    if(!PromoMode.equip(key,id,5))throw Error('equip '+key);result.push([key,equipmentInSlot(key).itemId||equipmentInSlot(key).id]);
   }return result;
  });
  for(const [f,b]of [[7,''],[11,'virus'],[22,'crimson'],[33,'ufo']]){
   assert.ok(await page.evaluate(([f,b])=>PromoMode.jump(f,b),[f,b]));
   await page.evaluate(()=>{ElectricEditor.reset();RoomReady.cancel();startWave();});
   if(f!==7){await page.waitForFunction(()=>ElectricEditor.preparing);await page.evaluate(()=>ElectricEditor.run());await page.waitForFunction(()=>!ElectricEditor.preparing);}
   assert.ok(await page.evaluate(([f,b])=>floor===f&&(!b||campaignBossKind===b),[f,b]));
   assert.ok(await page.evaluate(()=>{syncMusic();return !music.enabled&&$('bgm').paused;}));
   assert.deepEqual(await page.evaluate(()=>['weapon','armor','shoes','drone','bomb'].map(key=>[key,equipmentInSlot(key).itemId||equipmentInSlot(key).id])),equipped);
  }
  assert.equal(await page.evaluate(()=>PromoMode.jump(0)),false);assert.equal(await page.evaluate(()=>PromoMode.jump(34)),false);
  const promoHidden=await page.locator('#promo-panel').isHidden();
  await page.keyboard.press('F3');assert.ok(await page.locator('#perf-panel').isVisible());assert.equal(await page.locator('#promo-panel').isHidden(),promoHidden);
  await page.keyboard.press('F4');assert.ok(await page.locator('#promo-panel').isHidden());assert.ok(await page.locator('#perf-panel').isVisible());
  await page.keyboard.press('F4');assert.ok(await page.locator('#promo-panel').isVisible());assert.ok(await page.locator('#perf-panel').isVisible());
  await page.keyboard.press('F3');assert.ok(await page.locator('#perf-panel').isHidden());assert.ok(await page.locator('#promo-panel').isVisible());
  for(const [width,height]of [[320,568],[390,844],[1280,900]]){
   await page.setViewportSize({width,height});await page.evaluate(()=>{PromoMode.jump(1);ElectricEditor.reset();startWave();});await page.waitForTimeout(150);
   await page.locator('#promo-panel').evaluate(el=>el.open=true);
   const bounds=await page.locator('#promo-panel').boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=width+1);
   await page.screenshot({path:`tests/promo-mode-${width}.png`});assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);
  }
  // Ordinary campaign still consumes its single choice and exits placement.
  await page.goto('http://127.0.0.1:4173/?mapseed=promo-test');await page.waitForFunction(()=>HexMap.ready);
  assert.equal(await page.locator('#promo-panel').count(),0);
  assert.ok(await page.evaluate(()=>{syncMusic();return music.enabled===sound;}));
  await page.evaluate(()=>reset());await prepare();await place();await page.waitForFunction(()=>!ElectricEditor.preparing);
  assert.equal(await page.evaluate(()=>ElectricTiles.list().length),1);assert.equal(await page.evaluate(()=>testMode),false);
  assert.deepEqual(errors,[]);console.log('Promo Edge/WebGL passed: repeated real drag placements; normal single placement; all five equipment slots; chapter/boss jumps; preserved loadout; skip placement; independent F3 performance / F4 promo controls; 320/390/1280 layouts; no page/GL errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

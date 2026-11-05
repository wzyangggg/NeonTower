const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?mapseed=economy-output');await page.waitForFunction(()=>window.HexMap?.ready);
 await page.evaluate(()=>{window.requestAnimationFrame=()=>0;});await page.waitForTimeout(100);
 await page.evaluate(()=>{reset();ElectricEditor.reset();RoomReady.cancel();state='upgrade';terrainView='equipment';cash=84;rollShop();renderShop();});
 assert.equal(await page.locator('#shop-upgrade').textContent(),'升级 · $187');assert.ok(await page.locator('#shop-upgrade').isDisabled());
 const price=await page.evaluate(()=>{const item={key:'weapon',equipment:createWeaponModel('sword_t1'),blindBox:true,opened:false,sold:false};item.price=shopPrice(item);shopItems=[item];renderShop();return item.price});assert.equal(price,20);
 await page.locator('.shop-purchase').click();await page.evaluate(()=>confirmEquipmentPurchase());assert.ok(await page.evaluate(()=>cash===64&&weapon.itemId==='sword_t1'&&shopLevel===1));
 for(const [width,height]of [[390,844],[320,568],[1280,900]]){await page.setViewportSize({width,height});await page.evaluate(()=>{rollShop();renderShop();draw();});assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);await page.screenshot({path:`tests/economy-shop-${width}.png`});}
 await page.evaluate(()=>{cash=187;renderShop();});await page.locator('#shop-upgrade').click();assert.ok(await page.evaluate(()=>shopLevel===2&&cash===0));assert.equal(await page.locator('#shop-upgrade').textContent(),'升级 · $267');
 const speed=await page.evaluate(()=>STARTER_ENEMIES.crawler.speed);assert.equal(speed,108.16);
 assert.deepEqual(errors,[]);console.log('Economy Edge/WebGL: one-floor full-clear money cannot upgrade; affordable actual weapon reveal/replacement; exact tier upgrade cost; 320/390/1280 layouts; crawler speed; no page/GL errors.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});

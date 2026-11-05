const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/');
  await page.waitForFunction(()=>window.HexMap?.ready&&window.ElectricEditor);
  await page.locator('#start').click();
  await page.waitForFunction(()=>ElectricEditor.preparing&&ElectricEditor.stock.length===3);
  assert.equal(await page.locator('#electric-backpack > *').count(),3);
  const result=await page.evaluate(()=>{
   reset();state='upgrade';paused=true;cash=99999;
   const excluded=['floor','medical','shield','cashTile','shockTile','coverTile','heal','terrainPassive'],seen=new Set();
   for(let level=1;level<=5;level++){
    shopLevel=level;
    for(let i=0;i<200;i++){
     rollShop();if(shopItems.length!==3||shopItems.some(u=>excluded.includes(u.key)))throw Error('construction stock');
     shopItems.forEach(u=>seen.add(u.key));
    }
   }
   shopLevel=1;
   shopItems=[equipmentShopItem('weapon'),equipmentShopItem('armor'),equipmentShopItem('drone')]
    .map(u=>({...u,price:shopPrice(u),sold:false}));
   p.hp=1;renderShop();return [...seen];
  });
  assert(result.includes('weapon')&&!result.includes('terrainPassive')&&!result.includes('heal'));
  for(const [width,height]of [[390,844],[390,680],[1280,900]]){
   await page.setViewportSize({width,height});
   assert.equal(await page.locator('#shop-expand').count(),0);
   assert.equal(await page.locator('.shop-buy').count(),3);
   assert(await page.locator('.shop-panel').evaluate(e=>e.scrollWidth<=e.clientWidth+1));
   const layout=await page.evaluate(()=>{
    const rect=s=>document.querySelector(s).getBoundingClientRect(),upgrade=rect('#shop-upgrade'),reroll=rect('#shop-reroll'),leave=rect('#shop-leave');
    return {paired:Math.abs(upgrade.top-reroll.top)<1&&upgrade.right<reroll.left,below:leave.top>=upgrade.bottom,full:Math.abs(leave.left-upgrade.left)<1&&Math.abs(leave.right-reroll.right)<1,locks:[...document.querySelectorAll('.shop-stock-slot')].every(slot=>{const price=slot.querySelector('.shop-price').getBoundingClientRect(),lock=slot.querySelector('.shop-lock').getBoundingClientRect();return Math.abs(lock.top-price.top)<1&&Math.abs(lock.bottom-price.bottom)<1&&Math.abs(lock.left-price.right)<.1&&lock.width===32&&slot.querySelector('.shop-price').tagName==='BUTTON';})};
   });
   assert.deepEqual(layout,{paired:true,below:true,full:true,locks:true});
   assert.equal(await page.locator('#shop-leave').textContent(),'进入下一关');
   await page.screenshot({path:`tests/shop-no-tiles-${width}x${height}.png`});
  }
  const before=await page.evaluate(()=>({cash,name:shopItems[1].equipment.name,price:shopItems[1].price}));
  await page.locator('.shop-lock[data-lock-i="1"]').click();
  assert.equal(await page.evaluate(()=>cash),before.cash);
  assert.equal(await page.evaluate(()=>shopItems[1].sold),false);
  assert.equal(await page.locator('.shop-lock[data-lock-i="1"]').getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('.shop-lock[data-lock-i="1"] svg').getAttribute('data-lock-state'),'locked');
  assert.equal(await page.locator('.shop-lock[data-lock-i="0"] svg').getAttribute('data-lock-state'),'unlocked');
  const lockStyle=await page.locator('.shop-lock[data-lock-i="1"]').evaluate(e=>({background:getComputedStyle(e).backgroundColor,color:getComputedStyle(e).color}));
  assert.deepEqual(lockStyle,{background:'rgb(255, 255, 255)',color:'rgb(17, 17, 17)'});
  await page.setViewportSize({width:390,height:680});await page.screenshot({path:'tests/shop-lock-white-390x680.png'});

  await page.locator('#shop-upgrade').click();
  assert.equal(await page.evaluate(()=>shopLevel),2);
  await page.locator('#shop-reroll').click();
  assert.deepEqual(await page.evaluate(()=>({name:shopItems[1].equipment.name,price:shopItems[1].price})),{name:before.name,price:before.price});
  await page.locator('.shop-purchase[data-i="1"]').click();
  assert.equal(await page.locator('#equipment-confirm').count(),1);
  await page.locator('#equipment-confirm').click();
  assert(await page.locator('.shop-lock[data-lock-i="1"]').isDisabled());
  await page.locator('#shop-reroll').click();
  assert.equal(await page.locator('#shop-expand').count(),0);
  await page.locator('#shop-leave').click();
  assert.equal(await page.evaluate(()=>state),'descent');
  assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);
  assert.deepEqual(errors,[]);
  console.log('Shop without tiles: opening choices, 3000 offers across five levels, three viewport layouts, separate lock clicks, original stats/price through upgrade and refresh, locked equipment purchase, upgrade/reroll/leave and WebGL passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

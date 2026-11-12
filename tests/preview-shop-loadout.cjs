const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:680}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/');
  await page.waitForFunction(()=>window.HexMap?.ready&&window.ElectricEditor);
  await page.evaluate(()=>{reset();state='upgrade';cash=99999;rollShop();renderShop();});
  const starter=page.locator('[data-slot="weapon"] .shop-loadout-icon img');
  assert.equal(await starter.getAttribute('src'),'assets/equipment-icons/pistol_t1-48.png');
  assert.equal(await starter.evaluate(el=>getComputedStyle(el).opacity),'1');
  await page.screenshot({path:'tests/shop-starter-pistol-gray-390x680.png'});
  assert.equal(await page.locator('.shop-loadout-slot').count(),5);
  assert.equal(await page.locator('.shop-loadout-slot.empty').count(),4);
  assert.equal(await page.locator('#test-slot option[value="shovel"]').count(),0);
  const empty=await page.locator('.shop-loadout-slot.empty').evaluateAll(nodes=>nodes.map(e=>({bg:getComputedStyle(e).backgroundImage,icon:getComputedStyle(e.querySelector('.shop-loadout-icon')).backgroundColor,rarity:e.style.getPropertyValue('--rarity')})));
  assert(empty.every(e=>e.bg.includes('48, 48, 48')&&e.icon==='rgb(170, 170, 170)'&&e.rarity==='#777777'));
  assert.equal(await page.locator('.terrain-owned').count(),0);
  await page.screenshot({path:'tests/shop-loadout-empty-gray-390x680.png'});
  for(const id of ['renewal','chrono','aura','plume']){
   const result=await page.evaluate(id=>{equipItem('armor',createArmor(id,3));renderShop();const e=document.querySelector('[data-slot="armor"]');return {src:e.querySelector('img').getAttribute('src'),rarity:e.style.getPropertyValue('--rarity'),quality:WEAPON_GRADES[3].color};},id);
   assert.equal(result.src,'assets/equipment-icons/'+id+'-48.png');assert.equal(result.rarity,result.quality);
   await page.screenshot({path:`tests/shop-armor-color-${id}.png`});
  }

  await page.evaluate(()=>{
   equipItem('armor',createArmor('plume',4));equipItem('shoes',createShoes('ufo',3));equipItem('drone',createDrone(COMPANION_TYPES[0].id,2));
   shopItems=[equipmentShopItem('weapon'),equipmentShopItem('armor'),equipmentShopItem('drone')].map(u=>({...u,price:shopPrice(u)}));renderShop();
  });
  for(const [width,height] of [[390,680],[390,844],[1280,900]]){
   await page.setViewportSize({width,height});
   await page.waitForFunction(()=>[...document.querySelectorAll('.shop-loadout img')].every(e=>e.complete&&e.naturalWidth>0));
   const layout=await page.evaluate(()=>{
    const slots=document.querySelector('.shop-loadout').getBoundingClientRect(),goods=document.querySelector('.shop-grid').getBoundingClientRect();
    return {above:slots.bottom<goods.top,overflow:document.querySelector('.shop-panel').scrollWidth>document.querySelector('.shop-panel').clientWidth+1,slots:[...document.querySelectorAll('.shop-loadout-slot')].map(e=>e.getBoundingClientRect().width)};
   });
   assert(layout.above&&!layout.overflow&&layout.slots.every(w=>w>40));
   await page.screenshot({path:`tests/shop-loadout-${width}x${height}.png`});
  }
  await page.setViewportSize({width:390,height:680});
  await page.locator('.shop-buy[data-i="1"]').click();
  const expected=await page.evaluate(()=>itemEquipment(pendingEquipment.item).name);
  await page.locator('#equipment-confirm').click();
  assert.equal(await page.locator('[data-slot="armor"] b').textContent(),expected);
  const iconBefore=await page.locator('[data-slot="armor"] img').getAttribute('src');
  await page.locator('#shop-reroll').click();
  assert.equal(await page.locator('[data-slot="armor"] img').getAttribute('src'),iconBefore);
  assert.equal(await page.locator('.shop-loadout-slot').count(),5);
  // The top tabs must describe rarity consistently across every equipment kind.
  for(let tier=1;tier<=5;tier++){
   const weaponIcon=await page.evaluate(tier=>{const model=WEAPON_MODELS.find(m=>m.tier===tier).id;equipItem('weapon',createWeaponModel(model));renderShop();const slot=document.querySelector('[data-slot="weapon"]');return {src:slot.querySelector('img').getAttribute('src'),id:model,rarity:slot.style.getPropertyValue('--rarity'),expected:WEAPON_GRADES[tier].color};},tier);
   assert.equal(weaponIcon.src,'assets/equipment-icons/'+weaponIcon.id+'-48.png');assert.equal(weaponIcon.rarity,weaponIcon.expected);
   await page.evaluate(tier=>{
    shopItems=[{key:'weapon',equipment:createWeaponModel(WEAPON_MODELS.find(m=>m.tier===tier).id)},{key:'armor',equipment:createArmor('shell',tier)},{key:'drone',equipment:createDrone(COMPANION_TYPES[0].id,tier)}].map(u=>({...u,price:10,sold:false}));renderShop();
   },tier);
   const tabs=await page.evaluate(()=>[...document.querySelectorAll('.shop-buy')].map(el=>{
    const color=WEAPON_GRADES[+el.dataset.tier].color;
    return {mask:getComputedStyle(el,'::before').maskImage,position:getComputedStyle(el,'::before').position,opacity:getComputedStyle(el,'::before').opacity,label:getComputedStyle(el,'::before').content,color:getComputedStyle(el,'::before').backgroundColor,expected:'rgb('+color.slice(1).match(/../g).map(n=>parseInt(n,16)).join(', ')+')',name:WEAPON_GRADES[+el.dataset.tier].name};
   }));
   for(const tab of tabs){assert.equal(tab.label,JSON.stringify(tab.name));assert.equal(tab.color,tab.expected);assert.equal(tab.mask,'none');assert.equal(tab.position,'relative');assert.equal(tab.opacity,'1');}
  }
  await page.evaluate(()=>{shopItems[0].equipment=createWeaponModel('pistol_t1');shopItems[0].sold=true;shopItems[1].equipment=createArmor('shell',3);shopItems[1].locked=true;renderShop();});
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.locator('.shop-buy[data-i="0"]').evaluate(el=>getComputedStyle(el,'::before').content),'"普通"');
  assert.equal(await page.locator('.shop-buy[data-i="1"]').evaluate(el=>getComputedStyle(el,'::before').content),'"精良"');
  await page.screenshot({path:'tests/shop-rarity-tabs-390x844.png'});
  assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);
  console.log('Shop loadout: five slots, empty slot and equipment model icons, three layouts, real replacement and reroll persistence passed; no page/WebGL errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

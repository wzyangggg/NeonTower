const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>window.HexMap?.ready&&window.ElectricEditor);
 await page.evaluate(()=>{reset();state='upgrade';cash=999;shopItems=[equipmentShopItem('bomb'),equipmentShopItem('weapon'),equipmentShopItem('armor')].map(u=>({...u,price:shopPrice(u)}));renderShop();});
 assert.equal(await page.locator('.shop-loadout-slot').count(),5);assert.equal(await page.locator('[data-slot="bomb"] b').textContent(),'未装备');
 const offer=page.locator('.shop-buy[data-i="0"]');
 assert.equal(await offer.locator('.shop-gift-box img').getAttribute('src'),'assets/shop-drop-icons/grenade-48.png');
 const expected=await page.evaluate(()=>equipmentIconSource(itemEquipment(shopItems[0])));
 await offer.click();assert.match(await page.locator('.weapon-compare h2').textContent(),/炸弹/);
 assert.equal(await page.locator('.weapon-compare .equipment-pixel-icon img').getAttribute('src'),expected);
 await page.locator('#equipment-confirm').click();
 assert.notEqual(await page.locator('[data-slot="bomb"] b').textContent(),'未装备');
 assert.equal(await page.locator('[data-slot="bomb"] img').getAttribute('src'),expected);
 assert.equal(await offer.locator('.shop-gift-box').count(),0);
 assert.equal(await offer.locator('.equipment-pixel-icon img').getAttribute('src'),expected);
 assert.equal(await offer.locator('.shop-card-info b').textContent(),await page.locator('[data-slot="bomb"] b').textContent());
 for(const [width,height]of [[390,844],[320,568],[1280,900]]){await page.setViewportSize({width,height});await page.waitForFunction(()=>[...document.querySelectorAll('.shop-loadout img')].every(e=>e.complete&&e.naturalWidth>0));const layout=await page.evaluate(()=>{const el=document.querySelector('.shop-panel');return {overflow:el.scrollWidth>el.clientWidth+1,slots:[...document.querySelectorAll('.shop-loadout-slot')].map(e=>e.getBoundingClientRect().width)}});assert(!layout.overflow&&layout.slots.every(w=>w>35));await page.screenshot({path:`tests/bomb-equipment-shop-${width}x${height}.png`});}
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(()=>{window.requestAnimationFrame=()=>0;});await page.waitForTimeout(100);
 for(const id of ['tower','freeze_bomb','laser_bomb','missile_bomb']){
  const result=await page.evaluate(id=>{reset();ElectricEditor.reset();state='combat';paused=false;timedRoom={duration:999,remaining:999,nextWaveAt:999};enemies=[];enemyTransports=[];spawnQueue=[];bullets=[];missiles=[];shots=[];hazards=[];turrets=[];p.inv=999;shootTimer=999;p.x=325;p.y=300;const e={type:'eye',x:p.x+50,y:p.y,homeX:p.x+50,homeY:p.y,hp:500,max:500,r:14,t:0,fire:999,seed:0};enemies=[e];equipItem('bomb',createBomb(id,5));updateBombEquipment(15);for(let i=0;i<10;i++)step(.01);draw();const hud=document.getElementById('bomb-hud'),box=hud.getBoundingClientRect();return {equipped:bombEquipment.id,cd:bombCooldown,fired:id==='freeze_bomb'?ElectricTiles.frozen(e):e.hp<500||shots.some(s=>s.source==='bomb'),hud:hud.textContent,inBounds:box.left>=0&&box.right<=innerWidth&&box.bottom<=innerHeight,laserBeams:shots.filter(s=>s.bombLaser).length,laserSprites:renderer.sprites.filter(s=>s.kind==='laserFlow').length,gl:renderer.gl.getError()};},id);
  if(id==='laser_bomb')assert.equal(result.laserSprites,result.laserBeams*2,'equipment laser uses textured halo and core');assert.equal(result.equipped,id);assert(result.fired&&result.cd>14&&result.inBounds);assert.equal(result.gl,0);assert.match(result.hud,/15秒/);await page.screenshot({path:`tests/bomb-equipment-${id}-390x844.png`});
 }
 const choices=await page.evaluate(()=>{reset();ElectricEditor.reset();testMode=false;const rounds=[];for(let i=0;i<60;i++){floor=i+1;ElectricEditor.reset();ElectricEditor.prepareFloor();rounds.push(ElectricEditor.stock.map(e=>e.kind));}return rounds;});assert(choices.length===60&&choices.every(kinds=>kinds.length>0&&kinds.every(kind=>!['tower','freeze_bomb','laser_bomb','missile_bomb'].includes(kind))),'campaign offers exclude all four legacy bomb facilities');

 assert.deepEqual(errors,[]);console.log('Bomb equipment browser: actual purchase/replacement slot, 390/320/1280 layouts, four effects and cooldown HUD, no page/GL errors passed.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});

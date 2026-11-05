const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:390,height:844});
  await page.goto('http://127.0.0.1:4173/?electriclab=1');await page.waitForFunction(()=>window.TileLab?.active);
  const result=await page.evaluate(()=>{
   paused=true;ElectricEditor.reset();RoomReady.cancel();testMode=true;TileLab.leave();resetFloor();
   floor=1;startWave();paused=false;step(1);equipItem('armor',createArmor('chrono'));
   const start=timedRoom.remaining;step(1);const slowed=start-timedRoom.remaining;
   togglePause();const hold=timedRoom.remaining;step(10);const pausedTime=timedRoom.remaining===hold;
   togglePause();armor=null;timedRoom.remaining=4;updateTimedRoomHud();draw();
   const urgent=document.getElementById('survival-clock').classList.contains('urgent');
   const warning=getComputedStyle(document.getElementById('survival-clock')).animationName;
   togglePause();const frozenAnimation=getComputedStyle(document.getElementById('survival-clock')).animationPlayState;
   const weaponModel=createWeaponModel('sword_t1'),before=renderer.count;drawModelWeapon(weaponModel,0,0,0);const hiddenSword=renderer.count===before;
   togglePause();resetFloor();ElectricTiles.reset();state='combat';paused=true;
   const free=tiles.filter(t=>ElectricTiles.canPlace('slow_field',t)),field=ElectricTiles.place('slow_field',free[0]);
   const shieldCell=tiles.find(t=>ElectricTiles.canPlace('shield_tower',t));const shield=ElectricTiles.place('shield_tower',shieldCell);
   p.towerShieldLeft=2;let pose=null,tints=0;const material=renderer.residentMaterial,quad=renderer.transparentQuad;
   renderer.residentMaterial=function(key,build,at,...rest){if(key==='ufo:shield-faces')pose=at;return material.call(this,key,build,at,...rest)};
   renderer.transparentQuad=function(...args){if(args[4]===ElectricTiles.defs.slow_field.color)tints++;return quad.apply(this,args)};
   draw();renderer.residentMaterial=material;renderer.transparentQuad=quad;
   return {slowed,pausedTime,urgent,warning,frozenAnimation,hiddenSword,pose,tints,shieldName:ElectricTiles.defs.shield_tower.name,shieldIsTower:ElectricTiles.isDefenseTower('shield_tower'),finite:Array.from(renderer.data.slice(0,renderer.count)).every(Number.isFinite),gl:renderer.gl.getError()};
  });
  assert.ok(Math.abs(result.slowed-.08)<1e-7);assert.ok(result.pausedTime&&result.urgent&&result.hiddenSword);
  assert.equal(result.warning,'deadline-warning');assert.equal(result.frozenAnimation,'paused');
  assert.ok(result.pose&&Math.abs(Math.hypot(result.pose[0],result.pose[8])-.46)<1e-7&&result.pose[5]===.46&&Math.abs(Math.hypot(result.pose[2],result.pose[10])-.46)<1e-7);
  assert.ok(result.tints>0&&result.finite&&!result.shieldIsTower&&result.gl===0);assert.equal(result.shieldName,'护盾生产格');
  await page.screenshot({path:'tests/content-feedback-shield-field-390.png'});
  await page.evaluate(()=>{ElectricEditor.open();draw();});
  for(const [width,height]of [[390,844],[320,568],[1280,900]]){
   await page.setViewportSize({width,height});await page.evaluate(()=>draw());
   const labels=await page.locator('[data-building-label]').allTextContents();assert.ok(labels.some(t=>t.includes('减速领域：Lv1'))&&labels.some(t=>t.includes('护盾生产格：Lv1')));
   await page.screenshot({path:`tests/content-feedback-placement-${width}.png`});
  }
  assert.deepEqual(errors,[]);console.log('Content feedback Edge/WebGL passed:',JSON.stringify(result));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});


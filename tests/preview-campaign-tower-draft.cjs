const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');

(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?electriclab=1');
  await page.waitForFunction(()=>globalThis.ElectricEditor?.editing&&globalThis.MapIcons?.ready);
  const report=await page.evaluate(()=>{
   TileLab.leave();
   ElectricTiles.reset();
   tiles=[];for(let y=-3;y<=3;y++)for(let x=-3;x<=3;x++)tiles.push({x,y});
   testMode=false;enemies=[];spawnQueue=[];enemyTransports=[];
   const kinds=['electric_tower','shotgun_tower','shield_tower','repair_turret'];
   const researchKinds=Object.keys(TowerResearch.trees).sort();
   const isTower=kind=>researchKinds.includes(kind);
   function roll(nextFloor,value){
    ElectricEditor.reset();floor=nextFloor;
    const random=Math.random;Math.random=()=>value;
    try{ElectricEditor.prepareFloor();return ElectricEditor.stock;}
    finally{Math.random=random;}
   }
   const samples=nextFloor=>Array.from({length:48},(_,i)=>roll(nextFloor,(i+.5)/48));
   const first=samples(1);
   const emptyRoster=samples(2).flat();
   const legacyKinds=Object.keys(ElectricTiles.defs).filter(kind=>!isTower(kind));
   const legacyPlacement=legacyKinds.some(kind=>ElectricEditor.canPlace(kind,{x:0,y:0}));
   ElectricEditor.catalog(legacyKinds);
   const legacyStock=ElectricEditor.stock.length;
   for(const [x,kind] of kinds.entries()){
    const tower=ElectricTiles.place(kind,{x,y:0},3);
    if(!tower)throw Error(kind);
    if((kind==='shield_tower'||kind==='repair_turret')&&(!ElectricTiles.upgradeTower(tower)||tower.level!==4))throw Error('support upgrade: '+kind);
   }
   const later=samples(2);
   for(let i=0;i<48;i++){
    if(roll(2,(i+.5)/48).some(o=>o.kind==='electric_tower'&&o.upgrade))break;
   }
   draw();
   const offers=later.flat(),towerOffers=offers.filter(o=>isTower(o.kind));
   return {
    firstFacility:first.flat().some(o=>Object.hasOwn(ElectricTiles.defs,o.kind)),
    allResearchTowers:JSON.stringify([...new Set(emptyRoster.filter(o=>isTower(o.kind)).map(o=>o.kind))].sort())===JSON.stringify(researchKinds),
    legacyOffer:emptyRoster.some(o=>legacyKinds.includes(o.kind)),
    legacyPlacement,legacyStock,
    upgrades:[...new Set(towerOffers.filter(o=>o.upgrade).map(o=>o.kind))].sort(),
    unexpectedTower:towerOffers.some(o=>!o.upgrade||!kinds.includes(o.kind)),
    duplicates:later.some(options=>new Set(options.map(o=>o.kind)).size!==options.length),
    terrain:offers.some(o=>ElectricEditor.isFloor(o.kind)),
    cover:offers.some(o=>ElectricEditor.isBarricade(o.kind))
   };
  });
  assert.deepEqual(report,{firstFacility:false,allResearchTowers:true,legacyOffer:false,legacyPlacement:false,legacyStock:0,upgrades:['electric_tower','repair_turret','shield_tower','shotgun_tower'],unexpectedTower:false,duplicates:false,terrain:true,cover:true});
  assert.match(await page.locator('#electric-panel [data-title]').textContent(),/4 \/ 4/);
  const upgrade=page.locator('#electric-panel [data-upgrade][data-kind="electric_tower"]');
  assert.match(await upgrade.textContent(),/场上的电塔.*3 星 → 4 星/);
  assert.equal(await upgrade.locator('.electric-upgrade-stars').textContent(),'★★★★');
  assert.equal(await upgrade.locator('[data-next-star]').evaluate(el=>getComputedStyle(el).animationName),'electric-next-star');
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await upgrade.locator('[data-next-star]').evaluate(el=>getComputedStyle(el).animationName),'none');
  await upgrade.click();
  assert.deepEqual(await page.evaluate(()=>ElectricTiles.list().filter(f=>f.kind==='electric_tower').map(f=>f.level)),[4]);
  assert.equal(await page.locator('#electric-panel [data-stock-id]').count(),0);
  await page.waitForFunction(()=>!document.querySelector('#electric-panel [data-run]').disabled);
  const landing=await page.evaluate(()=>{
   ElectricTiles.reset();floor=2;
   const random=Math.random;
   try{
    for(let i=0;i<48;i++){
     ElectricEditor.reset();Math.random=()=>(i+.5)/48;ElectricEditor.prepareFloor();
     if(ElectricEditor.stock.some(o=>o.kind==='electric_tower'&&!o.upgrade))break;
    }
   }finally{Math.random=random;}
   draw();
   const at=ElectricTiles.center({x:0,y:0}),point=renderer.screenPoint(at.x-325,4,(at.y-300)*1.06);
   const rect=canvas.getBoundingClientRect();
   return {x:point.x+rect.left,y:point.y+rect.top};
  });
  const card=await page.locator('#electric-panel [data-kind="electric_tower"]').boundingBox();
  await page.mouse.move(card.x+card.width/2,card.y+card.height/2);
  await page.mouse.down();
  await page.mouse.move(landing.x,landing.y,{steps:15});
  await page.mouse.up();
  assert.deepEqual(await page.evaluate(()=>ElectricTiles.list().filter(f=>f.kind==='electric_tower').map(f=>f.level)),[1]);
  assert.match(await page.locator('#electric-panel [data-title]').textContent(),/1 \/ 4/);
  assert.equal(await page.locator('#electric-panel [data-stock-id]').count(),0);
  const count=page.locator('#electric-panel [data-count]'),start=page.locator('#electric-panel [data-run]');
  await page.evaluate(()=>{
   equipItem('armor',createArmor('foreman'));
   floor++;
   const random=Math.random;
   try{
    for(let i=0;i<48;i++){
     ElectricEditor.reset();Math.random=()=>(i+.5)/48;ElectricEditor.prepareFloor();
     if(ElectricEditor.stock.some(o=>o.kind==='electric_tower'&&o.upgrade))break;
    }
   }finally{Math.random=random;}
  });
  assert.match(await count.textContent(),/限选 2 次/);
  assert.equal(await start.isDisabled(),true);
  await upgrade.click();
  await page.waitForFunction(()=>ElectricEditor.stock.length===3);
  assert.match(await count.textContent(),/1 \/ 2/);
  assert.equal(await start.isEnabled(),true,'second choice is optional');
  const next=await page.evaluate(()=>{
   ElectricEditor.catalog(['floor']);
   draw();
   const c=ElectricEditor.frontier('floor').sort((a,b)=>Math.hypot(a.x,a.y)-Math.hypot(b.x,b.y))[0];
   const at=ElectricTiles.center(c),point=renderer.screenPoint(at.x-325,4,(at.y-300)*1.06),rect=canvas.getBoundingClientRect();
   return {x:point.x+rect.left,y:point.y+rect.top,cell:c};
  });
  const floorCard=await page.locator('#electric-panel [data-kind="floor"]').boundingBox();
  await page.mouse.move(floorCard.x+floorCard.width/2,floorCard.y+floorCard.height/2);
  await page.mouse.down();
  await page.mouse.move(next.x,next.y,{steps:15});
  await page.mouse.up();
  assert.equal(await page.evaluate(({x,y})=>hasTile(x,y),next.cell),true);
  assert.match(await count.textContent(),/2 \/ 2/);
  assert.equal(await page.locator('#electric-panel [data-stock-id]').count(),0);
  await start.click();
  assert.equal(await page.evaluate(()=>ElectricEditor.preparing),false);
  await page.evaluate(()=>{RoomReady.cancel();floor++;ElectricEditor.prepareFloor();});
  assert.match(await count.textContent(),/限选 2 次/);
  assert.deepEqual(errors,[]);
  console.log('Campaign tower draft passed: research-only towers, four-kind cap, terrain and cover, normal single choice, foreman upgrade plus placement, optional second choice and next-floor reset.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

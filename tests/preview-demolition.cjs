const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:680}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?electriclab=1');await page.waitForFunction(()=>window.ElectricEditor?.editing);
  async function setup(kind,campaign=false){return page.evaluate(({kind,campaign})=>{
   ElectricEditor.reset();ElectricTiles.reset();turrets=[];tiles=[];
   for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++)tiles.push({x,y});
   const t=tiles.find(t=>t.x===0&&t.y===0);let cell={x:0,y:0};
   if(kind==='trap')t.trap={clock:0};
   if(kind==='saw'||kind==='orbitSaw'){t.saw=true;t.orbitSaw=kind==='orbitSaw';t.sawClock=0;}
   if(kind==='flywheel'){createFlywheel(t);const at=ElectricTiles.center({x:1,y:0});t.flywheel.x=at.x;t.flywheel.y=at.y;cell={x:1,y:0};}
   if(kind==='machine'||kind==='laser'){addTurret(kind);cell=HexMap.cellAt(turrets[0].x,turrets[0].y);}
   if(Object.hasOwn(ElectricTiles.defs,kind)){const f=ElectricTiles.place(kind,{x:0,y:0});f.products=kind==='tower'||kind==='miner'||ElectricTiles.isFruit(kind)?1:0;cell={...f.cells.at(-1)};}
   if(['medical','shieldTile','cashTile','shockTile','coverTile'].includes(kind)){t[kind]=true;t.medPack=true;t.supplyQueue=[{kind:'medical',amount:1}];t.pickup={x:325,y:300,speed:80};t.healProgress=10;t.coverHp=4;t.shockCharges=1;}
   tiles.find(t=>t.x===-1&&t.y===0).medical=true;
   ElectricTiles.place('tower',{x:-1,y:-1});
   if(campaign){testMode=false;floor++;const random=Math.random;Math.random=()=>.999;try{ElectricEditor.prepareFloor();}finally{Math.random=random;}}
   else ElectricEditor.open();
   draw();return cell;
  },{kind,campaign});}
  async function drag(c,{cancel=false,screenshot=false}={}){
   const source=page.locator('[data-kind="erase"]').first();await source.evaluate(el=>el.scrollIntoView({block:'nearest',inline:'center'}));
   const b=await source.boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2,b.y-30,{steps:5});
   const to=await page.evaluate(c=>{draw();const at=ElectricTiles.center(c),p=renderer.screenPoint(at.x-325,4,(at.y-300)*1.06),r=canvas.getBoundingClientRect();return {x:p.x+r.left,y:p.y+r.top};},c);
   await page.mouse.move(to.x,to.y,{steps:12});
   const valid=await page.locator('[data-placement-valid]').getAttribute('data-placement-valid');
   if(screenshot)await page.screenshot({path:typeof screenshot==='string'?screenshot:'tests/demolition-saw-390x680.png'});
   if(cancel)await page.evaluate(()=>document.dispatchEvent(new PointerEvent('pointercancel',{pointerId:1})));
   await page.mouse.up();return valid;
  }
  const positive=await page.evaluate(()=>Object.keys(ElectricTiles.defs));
  for(const kind of ['trap','saw','orbitSaw','flywheel','machine','laser',...positive,'medical','shieldTile','cashTile','shockTile','coverTile']){
   const c=await setup(kind),stock=await page.evaluate(()=>ElectricEditor.stock.length),beforeHazards=await page.evaluate(()=>permanentTrapCount());
   await page.locator('#electric-panel').evaluate(el=>Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{}))));
   assert.equal(await page.evaluate(c=>ElectricEditor.canPlace('erase',c),c),true,kind+' target');
   for(const bad of [{x:1,y:1},{x:-1,y:0},{x:-1,y:-1},{x:6,y:4}]){
    if(await page.evaluate(c=>ElectricEditor.canPlace('erase',c),bad))continue;assert.equal(await drag(bad),'false',kind+' invalid '+JSON.stringify(bad));assert.equal(await page.evaluate(()=>ElectricEditor.stock.length),stock);
   }
   assert.equal(await drag(c,{cancel:true}),'true');assert.equal(await page.evaluate(()=>permanentTrapCount()),beforeHazards);
   assert.equal(await drag(c),'true');assert.equal(await page.evaluate(()=>permanentTrapCount()),0,kind+' removed');
   if(positive.includes(kind))assert.equal(await page.evaluate(()=>tiles.some(t=>t.x===0&&t.y===0&&t.electricFacility)),false,kind+' entire facility removed');
   if(['medical','shieldTile','cashTile','shockTile','coverTile'].includes(kind))assert.equal(await page.evaluate(()=>{const t=tiles.find(t=>t.x===0&&t.y===0);return !!(t.medical||t.shieldTile||t.cashTile||t.shockTile||t.coverTile||t.medPack||t.supplyQueue||t.pickup||t.coverHp||t.shockCharges);}),false,kind+' fixture and product state cleaned');
   assert.equal(await page.evaluate(()=>tiles.length),9);assert.equal(await page.evaluate(()=>ElectricEditor.stock.length),stock-1);
   assert.equal(await page.evaluate(()=>ElectricTiles.list().length),1);assert.equal(await page.evaluate(()=>tiles.some(t=>t.medical)),true);
   assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);
  }
  const bananaCell=await setup('banana');
  await page.evaluate(()=>{const f=ElectricTiles.list().find(f=>f.kind==='banana'),q=ElectricTiles.center(f.anchor);state='combat';p.x=q.x;p.y=q.y;paused=false;ElectricTiles.update(.01);paused=true;});
  assert.equal(await page.evaluate(()=>ElectricTiles.speedBonus()),.25);
  assert.equal(await drag(bananaCell),'true');assert.equal(await page.evaluate(()=>ElectricTiles.speedBonus()),.25,'demolishing source preserves already earned fruit attributes');
  await setup('saw');
  await page.evaluate(()=>{tiles.find(t=>t.x===1&&t.y===1).trap={clock:0};const at=ElectricTiles.center({x:1,y:1});p.x=at.x;p.y=at.y;});
  assert.equal(await drag({x:0,y:0}),'true');
  assert.equal(await page.evaluate(()=>!!tiles.find(t=>t.x===0&&t.y===0).saw),false,'remove dropped target');
  assert.equal(await page.evaluate(()=>!!tiles.find(t=>t.x===1&&t.y===1).trap),true,'keep another hazard even when nearer to player');
  // An existing hazard makes demolition eligible in the formal three-choice round.
  const c=await setup('saw',true);assert.equal(await page.evaluate(()=>ElectricEditor.stock.length),3);
  assert.equal(await page.locator('[data-kind="erase"]').count(),1);
  assert.equal(await drag(c,{screenshot:true}),'true');
  assert.equal(await page.evaluate(()=>ElectricEditor.preparing||paused),false);
  assert.equal(await page.evaluate(()=>ElectricEditor.stock.length),0);
  assert.equal(await page.evaluate(()=>permanentTrapCount()),0);assert.equal(await page.evaluate(()=>tiles.length),9);
  const good=await setup('turbine',true);assert.equal(await page.locator('[data-kind="erase"]').count(),1,'positive-only boards offer demolition');
  await page.locator('#electric-panel').evaluate(el=>Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{}))));
  assert.equal(await page.evaluate(c=>ElectricEditor.shape('erase',c).cells.length,good),3,'multi-cell removal previews full footprint');
  assert.equal(await drag(good,{screenshot:'tests/demolition-positive-turbine-390x680.png'}),'true');assert.equal(await page.evaluate(()=>ElectricTiles.list().some(f=>f.kind==='turbine')),false);assert.equal(await page.evaluate(()=>ElectricEditor.preparing||paused),false);
  await page.evaluate(()=>{ElectricEditor.reset();ElectricTiles.reset();turrets=[];tiles=[{x:0,y:0}];testMode=false;floor++;const random=Math.random;Math.random=()=>.999;try{ElectricEditor.prepareFloor();}finally{Math.random=random;}});
  assert.equal(await page.locator('[data-kind="erase"]').count(),0,'no demolition offer without facilities');
  await page.evaluate(()=>{ElectricEditor.reset();testMode=true;ElectricEditor.open();addTurret();turrets[0].temporary=true;});
  assert.equal(await page.evaluate(()=>ElectricEditor.demolitionCells().length),0,'temporary turrets excluded');
  assert.deepEqual(errors,[]);
  console.log('Demolition: real Edge/WebGL targeted spikes, fixed/orbit saws, moving flywheel and both permanent turrets; invalid/cancel conservation, floor/unrelated facility preservation, all electric and five original positive facilities, eligible offers, one-action auto-start and temporary exclusion passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

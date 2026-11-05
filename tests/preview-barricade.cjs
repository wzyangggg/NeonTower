const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:680}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?electriclab=1');await page.waitForFunction(()=>window.ElectricEditor?.editing);
  await page.evaluate(()=>{ElectricTiles.reset();tiles=[];for(let y=-2;y<=2;y++)for(let x=-2;x<=2;x++)tiles.push({x,y});ElectricEditor.open();state='combat';enemies=[];enemyTransports=[];spawnQueue=[];missiles=[];bullets=[];shots=[];tiles.find(t=>t.x===-1&&t.y===0).medical=true;p.x=390;p.y=350;draw();});
  await page.locator('[data-lab-tools] summary').click();await page.locator('[data-test-kind="barricade"]').click();
  const card=page.locator('#electric-backpack [data-kind="barricade"]').first();assert.equal(await card.locator('.electric-stock-footprint').count(),1);assert.equal(await card.locator('.electric-stock-range').count(),0);
  async function drag(kind,c,cancel=false){
   const source=page.locator(`#electric-backpack [data-kind="${kind}"]`).first();await source.evaluate(el=>el.scrollIntoView({block:'nearest',inline:'center'}));const b=await source.boundingBox();
   await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2,b.y-30,{steps:5});
   const to=await page.evaluate(c=>{draw();const q=ElectricTiles.center(c),s=renderer.screenPoint(q.x-325,4,(q.y-300)*1.06),r=canvas.getBoundingClientRect();return {x:s.x+r.left,y:s.y+r.top};},c);
   await page.mouse.move(to.x,to.y,{steps:12});const valid=await page.locator('[data-placement-valid]').getAttribute('data-placement-valid');
   if(cancel)await page.evaluate(()=>document.dispatchEvent(new PointerEvent('pointercancel',{pointerId:1})));await page.mouse.up();return valid;
  }
  const initial=await page.evaluate(()=>ElectricEditor.stock.length);
  assert.equal(await drag('barricade',{x:-1,y:0}),'false');assert.equal(await page.evaluate(()=>ElectricEditor.stock.length),initial);
  assert.equal(await drag('barricade',{x:0,y:0},true),'true');assert.equal(await page.evaluate(()=>tiles.some(t=>t.coverTile)),false);
  assert.equal(await drag('barricade',{x:0,y:0}),'true');assert.equal(await page.evaluate(()=>ElectricEditor.stock.length),initial-1);
  const physics=await page.evaluate(()=>{
   const wall=tiles.find(t=>t.x===0&&t.y===0),c=ElectricTiles.center(wall);draw();const mesh=renderer.residentMeshes.get('hex-cover:block').data;
   p.x=c.x-80;p.y=c.y;walkFloor(p,c.x+80,c.y,7);const stopped=p.x<c.x&&!coverContains(wall,p.x,p.y,7);
   p.x=c.x+80;p.y=c.y;p.inv=0;const hp=p.hp;paused=false;bullet(c.x-80,c.y,0,1000);updateEnemyBullets(.18);paused=true;draw();
   return {stopped,hpPreserved:p.hp===hp,bullets:bullets.length,durability:wall.coverHp,hexMesh:!!mesh,finite:mesh.every(Number.isFinite),resident:renderer.residentMeshes.get('hex-cover:block').data===mesh,gl:renderer.gl.getError()};
  });assert.deepEqual(physics,{stopped:true,hpPreserved:true,bullets:0,durability:3,hexMesh:true,finite:true,resident:true,gl:0});
  await page.evaluate(()=>{time+=.2;draw();});
  for(const [width,height]of [[390,680],[390,844]]){await page.setViewportSize({width,height});await page.screenshot({path:`tests/barricade-hex-${width}x${height}.png`});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
  const rebuilt=await page.evaluate(()=>{const wall=tiles.find(t=>t.x===0&&t.y===0),q=ElectricTiles.center(wall);paused=false;damageCover(wall,99);const open=canWalkAt(q.x,q.y,7);p.x=q.x;p.y=q.y;refreshCoverTiles();paused=true;return {open,hp:wall.coverHp,safe:!coverContains(wall,p.x,p.y,7),floor:hasTile(0,0)};});assert.deepEqual(rebuilt,{open:true,hp:4,safe:true,floor:true});
  await page.locator('[data-lab-tools] summary').click();await page.locator('[data-test-kind="erase"]').click();assert.equal(await drag('erase',{x:0,y:0}),'true');assert.equal(await page.evaluate(()=>!!tiles.find(t=>t.x===0&&t.y===0).coverTile),false);
  await page.evaluate(()=>{ElectricEditor.reset();testMode=false;floor++;delete tiles.find(t=>t.medical).medical;const random=Math.random;Math.random=()=>.999;try{ElectricEditor.prepareFloor();}finally{Math.random=random;}});
  assert.equal(await page.locator('#electric-backpack [data-kind="barricade"]').count(),1);
  await page.locator('#electric-panel').evaluate(el=>Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{}))));await page.screenshot({path:'tests/barricade-choices-390x844.png'});
  assert.equal(await drag('barricade',{x:0,y:0}),'true');assert.equal(await page.evaluate(()=>ElectricEditor.preparing||paused),false);assert.equal(await page.evaluate(()=>tiles.find(t=>t.x===0&&t.y===0).coverHp),4);assert.equal(await page.evaluate(()=>tiles.filter(t=>t.coverTile).length),1);
  assert.deepEqual(errors,[]);console.log('Roadblock real Edge/WebGL: specified stock, actual one-cell drag, protection/cancel conservation, true shared hex mesh, swept player/bullet collision, durability, rebuild/safe relocation, demolition and formal auto-start passed.',{physics,rebuilt});
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

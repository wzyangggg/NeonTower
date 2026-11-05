const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?electriclab=1');await page.waitForFunction(()=>window.ElectricEditor?.editing);
 for(const [kind,radius]of [['shotgun_tower',260],['sniper_tower',800],['missile_tower',600],['electric_tower',420],['healing_tower',420]]){
  await page.evaluate(kind=>localStorage.setItem('neon-facility-designer-v1',JSON.stringify({version:2,designCatalogVersion:7,facilities:{...Object.fromEntries(Object.keys(ElectricTiles.defs).map(k=>[k,{enabledInGame:true}])),[kind]:{cells:[[0,0]],effectMode:'none',effectCells:[],range:7}}})),kind);
  const card=page.locator(`#electric-backpack [data-kind="${kind}"]`).first();await card.scrollIntoViewIfNeeded();
  const from=await card.boundingBox(),cell=page.locator('#electric-placement polygon[data-x="0"][data-y="0"]'),to=await cell.boundingBox();
  await page.mouse.move(from.x+from.width/2,from.y+from.height/2);await page.mouse.down();await page.mouse.move(to.x+to.width/2,to.y+to.height/2,{steps:12});
  assert.equal(await page.locator('[data-attack-range]').getAttribute('data-attack-range'),String(radius));
  const result=await page.evaluate(()=>{const vertices=[],original=renderer.transparentQuad;renderer.transparentQuad=function(a,b,c,d,color,alpha){if(color==='#a4efff')vertices.push(...[a,b,c,d]);return original.call(this,a,b,c,d,color,alpha);};try{draw();}finally{renderer.transparentQuad=original;}const cx=(Math.min(...vertices.map(p=>p[0]))+Math.max(...vertices.map(p=>p[0])))/2,cz=(Math.min(...vertices.map(p=>p[2]))+Math.max(...vertices.map(p=>p[2])))/2;const radii=vertices.map(p=>Math.hypot(p[0]-cx,(p[2]-cz)/1.06));return {count:vertices.length,min:Math.min(...radii),max:Math.max(...radii),gl:renderer.gl.getError()};});
  assert.ok(result.count>100&&Math.abs(result.min-radius)<2&&Math.abs(result.max-radius)<2,JSON.stringify({kind,radius,result}));assert.equal(result.gl,0);
  if(kind==='shotgun_tower')await page.screenshot({path:'tests/tower-placement-range-390.png'});
  await page.mouse.move(5,15,{steps:4});await page.mouse.up();
 }
 const supply=await page.evaluate(()=>{ElectricEditor.close();localStorage.clear();ElectricTiles.reset();tiles=HexMap.initialFloor();renderer.sceneKey=null;state='combat';paused=false;enemies=[];shots=[];bullets=[];missiles=[];turrets=[];spawnQueue=[];p.x=325;p.y=380;p.towerShieldLeft=0;const f=ElectricTiles.place('shield_tower',{x:0,y:0},3);ElectricTiles.update(12);paused=true;draw();const data=renderer.residentMeshes.get('electric:shield_tower').data,ys=Array.from(data).filter((_,i)=>i%6===1);return {products:f.products,shield:p.towerShieldLeft,height:Math.max(...ys)-Math.min(...ys),gl:renderer.gl.getError()};});
 assert.equal(supply.products,1);assert.equal(supply.shield,0);assert.ok(supply.height>30);assert.equal(supply.gl,0);await page.screenshot({path:'tests/shield-product-390.png'});
 const pickup=await page.evaluate(()=>{p.x=325;p.y=300;paused=false;ElectricTiles.update(.01);paused=true;draw();const f=ElectricTiles.list()[0];return {shield:p.towerShieldLeft,products:f.products,collected:f.collected};});assert.deepEqual(pickup,{shield:4,products:0,collected:1});
 assert.deepEqual(errors,[]);console.log('Tower placement: five independent dashed attack ranges with saved radius 7/empty effect masks; upright shield product and local pickup; no WebGL or page errors.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

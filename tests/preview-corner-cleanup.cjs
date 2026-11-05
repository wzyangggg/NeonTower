const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?mapseed=elevator-01');await page.waitForFunction(()=>window.HexMap?.ready);await page.locator('#start').click();
 const result=await page.evaluate(()=>{
  testMode=true;ElectricEditor.reset();paused=true;enemies=[];shake=0;draw();
  const result={signs:StreetScene.sideSigns.length,panels:StreetScene.sideSignGeometry.length,ranges:StreetScene.sideSignRanges.length,paths:0,blocked:[]};
  // Walk the real player across every joined pair, including the upper-left cells.
  for(const a of tiles)for(const [dx,dy]of HexMap.neighbors(a.x,a.y)){
   const b=tiles.find(t=>t.x===a.x+dx&&t.y===a.y+dy);if(!b)continue;
   const ax=325+HexMap.x(a.x,a.y),ay=300+HexMap.y(a.y),bx=325+HexMap.x(b.x,b.y),by=300+HexMap.y(b.y);p.x=ax;p.y=ay;
   for(let step=1;step<=18;step++)walkFloor(p,ax+(bx-ax)*step/18,ay+(by-ay)*step/18,7);
   if(Math.hypot(p.x-bx,p.y-by)>.01)result.blocked.push({a,b,x:p.x,y:p.y});result.paths++;
  }
  const upperLeft=tiles.slice().sort((a,b)=>a.x+a.y-b.x-b.y)[0];p.x=325+HexMap.x(upperLeft.x,upperLeft.y);p.y=300+HexMap.y(upperLeft.y);
  for(let i=0;i<240;i++){time+=1/60;StreetScene.lighting(renderer);renderer.resize();}draw();result.gl=renderer.gl.getError();return result;
 });
 assert.equal(result.signs,0);assert.equal(result.panels,0);assert.equal(result.ranges,0);assert.ok(result.paths>0);assert.deepEqual(result.blocked,[]);assert.equal(result.gl,0);assert.deepEqual(errors,[]);
 await page.screenshot({path:'tests/corner-cleanup-upper-left.png'});console.log(result);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

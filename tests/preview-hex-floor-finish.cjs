const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?promo=1&mapseed=floor-finish');
  await page.waitForFunction(()=>globalThis.ElectricEditor?.preparing);
  await page.evaluate(()=>{document.getElementById('promo-panel').hidden=true;ElectricEditor.run();});
  await page.waitForFunction(()=>state==='combat'&&!ElectricEditor.editing);
  await page.evaluate(()=>{paused=true;p.inv=999;draw(0);});
  const result=await page.evaluate(()=>{
   let backgroundQuads=0;StreetScene.baseFloor({emissiveQuad(){backgroundQuads++;}},grid,tiles);
   const r=renderer,savedCount=r.count;r.count=0;HexMap.plate(r,0,0,'#455266','#ffffff');
   const data=r.data.slice(0,r.count);r.count=savedCount;
   const surface=[],black=[];
   for(let i=0;i<data.length;i+=9){if(Math.abs(data[i+4]-3)<.01)surface.push({radius:Math.hypot(data[i],data[i+2]/1.06),brightness:data[i+6]+data[i+7]+data[i+8]});if(data[i+4]===2)black.push(data[i+6]+data[i+7]+data[i+8]);}
   const inner=surface.filter(v=>v.radius<1),outer=surface.filter(v=>v.radius>27);
   const avg=a=>a.reduce((n,v)=>n+v.brightness,0)/a.length;
   r.count=0;HexMap.column(r,'floor');const column=r.data.slice(0,r.count);r.count=savedCount;if(!Array.from({length:column.length/9},(_,i)=>column[i*9+1]).every(h=>h>=-34))throw Error('deep shaft remains');if([...r.residentMeshes.keys()].some(k=>k.startsWith('hex-circuits:')))throw Error('side circuits remain');let collarVertices=0;for(let i=0;i<column.length;i+=9)if(column[i+4]===2&&column[i+1]<=-10.75&&column[i+1]>=-11.75)collarVertices++;
   const meshes=[...r.residentMeshes.values()],buffers=meshes.map(m=>m.buffer);
   for(let i=0;i<5;i++)draw(0);
   return {collarVertices,backgroundQuads,inner:avg(inner),outer:avg(outer),black:Math.max(...black),reused:meshes.every((m,i)=>m.buffer===buffers[i]),gl:r.gl.getError()};
  });
  assert.equal(result.collarVertices,36);assert.equal(result.backgroundQuads,0);assert.ok(Math.abs(result.inner-result.outer)<1e-6,'even original floor brightness');assert.ok(result.inner> .95,'original material brightness restored');assert.ok(result.black<.07);assert.ok(result.reused);assert.equal(result.gl,0);
  for(const [width,height]of [[390,844],[1280,900]]){
   await page.setViewportSize({width,height});await page.evaluate(()=>draw(0));
   await page.screenshot({path:`tests/hex-floor-finish-${width}.png`});
  }
  assert.deepEqual(errors,[]);console.log('Hex floor finish: empty background, original even brightness, six-sided neon collar, black seams, resident buffer reuse and real WebGL combat at two sizes passed.',result);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

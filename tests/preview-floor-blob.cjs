const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?promo=1&mapseed=blob');await page.waitForFunction(()=>globalThis.ElectricEditor?.preparing);
 await page.evaluate(()=>{document.getElementById('promo-panel').hidden=true;ElectricEditor.run();});await page.waitForFunction(()=>state==='combat'&&!ElectricEditor.editing);
 const result=await page.evaluate(()=>{
  const E=ElectricTiles;
  for(const kind of Object.keys(E.defs)){
   const f={kind,anchor:{x:0,y:0},cells:[{x:0,y:0},{x:1,y:0},{x:2,y:0}]},core=E.coreCell(f);
   const flags=f.cells.map(c=>HexMap.isLightCore({...c,electricFacility:f}));
   if(flags.filter(Boolean).length!==1||!HexMap.isLightCore({...core,electricFacility:f}))throw Error('core light rule: '+kind);
  }
  if(HexMap.isLightCore({x:0,y:0})||HexMap.isLightCore({x:0,y:0,coverTile:true})||HexMap.isLightCore({x:0,y:0,electricFacility:{kind:'barricade'}}))throw Error('non luminous tile');
  paused=true;tiles=[];for(let yy=-3;yy<=3;yy++)for(let xx=-3;xx<=3;xx++)tiles.push({x:xx,y:yy});tiles.find(t=>t.x===0&&t.y===0).medical=true;renderer.sceneKey=null;draw(0);
  if([...renderer.residentMeshes].filter(([k])=>k.startsWith('hex-tile-beam:')).reduce((sum,[,m])=>sum+m.count,0)!==tiles.length)throw Error('every deck cell emits a beam');
  const r=renderer,gl=r.gl,entries=[...r.residentMeshes].filter(([k])=>k.startsWith('hex-floor-blob:')),buffers=entries.map(([,m])=>m.buffer);
  const frame=()=>{gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);r.drawResidentMeshes();const p=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,p);return p;};
  const a=frame();for(const [,m]of entries)m.count=0;const b=frame();let changed=0;for(let i=0;i<a.length;i+=4)if(a[i+2]>b[i+2]+3)changed++;
  for(let i=0;i<5;i++)draw(0);const reused=entries.every(([,m],i)=>m.buffer===buffers[i]);
  const bounded=entries.every(([,m])=>{for(let i=0;i<m.data.length;i+=9){if(Math.abs(m.data[i+1]-2.04)>.001||Math.hypot(m.data[i],m.data[i+2]/1.06)>HexMap.RADIUS-1+.001)return false;}return m.data.every(Number.isFinite);});
  const overlap=HexMap.floorBlobStrength(0,0,Array(100).fill([0,0])),far=HexMap.floorBlobStrength(500,0,[[0,0]]);
  delete tiles.find(t=>t.medical).medical;draw(0);const removed=entries.every(([k])=>!r.residentMeshes.has(k))&&buffers.every(b=>!gl.isBuffer(b));
  tiles.find(t=>t.x===0&&t.y===0).medical=true;draw(0);
  return {changed,reused,bounded,overlap,far,removed,count:entries.length,gl:gl.getError()};
 });
 assert.ok(result.changed>30,JSON.stringify(result));assert.ok(result.reused&&result.bounded&&result.removed);assert.equal(result.overlap,.65);assert.equal(result.far,0);assert.equal(result.gl,0);
 for(const [width,height]of [[390,844],[1280,900]]){await page.setViewportSize({width,height});await page.evaluate(()=>draw(0));await page.screenshot({path:`tests/floor-blob-${width}.png`});}
 const field=await page.evaluate(()=>{
  ElectricTiles.reset();tiles=[];for(let y=-4;y<=4;y++)for(let x=-4;x<=4;x++)tiles.push({x,y});
  const f=ElectricTiles.place('slow_field',{x:0,y:0});if(!f)throw Error('slow placement');
  const calls=[],r=renderer,original=r.residentMaterial;
  r.residentMaterial=function(...args){if(args[0].startsWith('hex-tile-beam:'))calls.push({opacity:args[3],x:args[2][3],z:args[2][11]});return original.apply(this,args);};
  try{r.sceneKey=null;draw(0);}finally{r.residentMaterial=original;}
  const expected=tiles.length;
  return {expected,count:calls.length,bright:calls.filter(c=>c.opacity===.24).length,dim:calls.filter(c=>c.opacity===.035).length,gl:r.gl.getError()};
 });
 assert.equal(field.count,field.expected);assert.equal(field.bright,field.expected-field.dim);assert.ok(field.dim>0);assert.equal(field.gl,0);console.log('Slow field core/dim coverage',field);
 assert.deepEqual(errors,[]);console.log('Floor blob: GPU brightening, clipped hex surfaces, bounded overlap/range, source removal/buffer disposal and steady reuse passed',result);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?electriclab=1');await page.waitForFunction(()=>globalThis.MapIcons?.ready&&globalThis.ElectricEditor?.editing);
  await page.evaluate(()=>{
   window.requestAnimationFrame=()=>0;ElectricTiles.reset();tiles=[];
   for(let y=-3;y<=3;y++)for(let x=-3;x<=3;x++)tiles.push({x,y});
   for(const [kind,at]of [['miner',{x:0,y:0}],['irrigator',{x:-2,y:-2}],['battery',{x:2,y:-2}],['biogenerator',{x:2,y:2}]])if(!ElectricTiles.place(kind,at))throw Error('placement '+kind);
   tiles.find(t=>t.x===-2&&t.y===1).medical=true;
   tiles.find(t=>t.x===-2&&t.y===2).shieldTile=true;
   tiles.find(t=>t.x===-1&&t.y===3).cashTile=true;
   p.x=100;p.y=100;paused=true;ElectricEditor.close();draw();
  });
  for(const [width,height]of [[390,844],[390,680],[1280,900]]){
   await page.setViewportSize({width,height});await page.evaluate(()=>draw());
   const pixels=await page.evaluate(()=>{
    const r=renderer,gl=r.gl,saved=r.sprites,at=ElectricTiles.center(ElectricTiles.coreCell(ElectricTiles.list()[0])),pt=r.screenPoint(at.x-325,10.35,(at.y-300)*1.06),scale=canvas.width/canvas.getBoundingClientRect().width;
    const x=Math.floor((pt.x-22)*scale),y=canvas.height-Math.floor((pt.y+22)*scale),size=Math.floor(44*scale);
    const read=()=>{r.end();const data=new Uint8Array(size*size*4);gl.readPixels(x,y,size,size,gl.RGBA,gl.UNSIGNED_BYTE,data);return data;};
    try{
     r.sprites=saved.filter(s=>s.kind!=='mapIconGlow');const crisp=read();
     r.sprites=saved;const glow=read();let haloPixels=0,haloGain=0;
     for(let i=0;i<glow.length;i+=4){const gain=glow[i]+glow[i+1]+glow[i+2]-crisp[i]-crisp[i+1]-crisp[i+2];if(gain>20)haloPixels++;haloGain+=Math.max(0,gain);}
     return {haloPixels,haloGain};
    }finally{r.sprites=saved;r.end();}
   });
   assert.ok(pixels.haloPixels>100&&pixels.haloGain>10000&&pixels.haloGain<(width===1280?75000:40000),JSON.stringify({width,height,...pixels}));
   console.log('Visible soft bloom pixel comparison',width,height,pixels);
   await page.screenshot({path:`tests/production-base-${width}x${height}.png`});
  }
  const result=await page.evaluate(()=>{
   draw();const bases=[...renderer.residentMeshes].filter(([k,m])=>k.startsWith('hex-production-base:')&&m.count),cores=ElectricTiles.list().map(f=>ElectricTiles.coreCell(f)),legacy=tiles.filter(t=>t.medical||t.shieldTile||t.cashTile),expected=cores.length+legacy.length;
   const positions=bases.flatMap(([,m])=>Array.from({length:m.count},(_,i)=>[m.instances[i*13+3],m.instances[i*13+11]]));
   const coreOnly=[...cores,...legacy].every(c=>{const at=ElectricTiles.center(c);return positions.some(([x,z])=>Math.abs(x-(at.x-325))<.001&&Math.abs(z-(at.y-300)*1.06)<.001);});
   const leds=renderer.sprites.filter(s=>s.kind==='mapIcon'&&s.bloom),glows=renderer.sprites.filter(s=>s.kind==='mapIconGlow');
   const ledLayers=leds.length===expected&&leds.every(s=>glows.some(g=>g.texture===s.texture&&Math.abs((g.data[5]-g.data[0])/(s.data[5]-s.data[0])-2.4)<.001)&&Array.from(s.data).filter((_,i)=>i%5===1).every(y=>Math.abs(y-10.35)<.001));
   const authored=bases.length===1&&bases[0][1].data.length===CyberFacilityMeshes.supply_pad.length&&bases[0][1].data.every((v,i)=>v===CyberFacilityMeshes.supply_pad[i]);
   const lit=bases.some(([,m])=>{for(let i=0;i<m.data.length;i+=9)if(m.data[i+4]===2&&m.data[i+8]>m.data[i+6])return true;return false;});
   const data=bases[0][1].data,buffer=bases[0][1].buffer;draw();
   const reused=bases[0][1].data===data&&bases[0][1].buffer===buffer;
   const finite=bases.every(([,m])=>m.data.every(Number.isFinite)),instances=bases.reduce((n,[,m])=>n+m.count,0);
   const heights=Array.from(data).filter((_,i)=>i%9===1);
   renderer.initializeGPU();draw();
   const start=renderer.transparentCount,at=ElectricTiles.center(ElectricTiles.coreCell(ElectricTiles.list()[0]));renderer.emissiveSquareScan(at.x-325,(at.y-300)*1.06,51,54,.5,'#ffffff',.8);
   const scanAbove=Array.from(renderer.transparentData.subarray(start,renderer.transparentCount)).filter((_,i)=>i%7===1).every(y=>Math.abs(y-9.6)<.001);
   return {expected,instances,coreOnly,ledLayers,authored,lit,scanAbove,reused,finite,depth:Math.max(...heights)-Math.min(...heights),icons:renderer.sprites.filter(s=>s.kind==='mapIcon').length,gl:renderer.gl.getError()};
  });
  assert.equal(result.instances,result.expected);assert.ok(result.authored&&result.lit&&result.coreOnly&&result.ledLayers&&result.scanAbove&&result.reused&&result.finite&&result.depth>12&&result.icons>=7,JSON.stringify(result));assert.equal(result.gl,0);
  // Newly raised tiles carry the base at the same pose as their column.
  const lift=await page.evaluate(()=>{
   const original=RoomReady.liftAt;RoomReady.liftAt=()=>-100;
   try{draw();return [...renderer.residentMeshes].filter(([k,m])=>k.startsWith('hex-production-base:')&&m.count).every(([,m])=>Array.from({length:m.count},(_,i)=>m.instances[i*13+7]).every(y=>y===-100));}finally{RoomReady.liftAt=original;draw();}
  });assert.ok(lift);
  await page.evaluate(()=>{window.baseLEDTexture=renderer.sprites.find(s=>s.bloom).texture;window.baseContext=renderer.gl.getExtension('WEBGL_lose_context');baseContext.loseContext();});
  await page.waitForFunction(()=>renderer.gl.isContextLost());await page.evaluate(()=>baseContext.restoreContext());
  await page.waitForFunction(()=>{if(renderer.gl.isContextLost())return false;draw();return renderer.sprites.some(s=>s.bloom&&s.texture!==baseLEDTexture);});
  assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);assert.deepEqual(errors,[]);
  console.log('Production bases: Edge/WebGL three sizes, core-only Blender deployment pads, smooth icons and stronger soft bloom masks, elevated progress, finite resident geometry, shared buffers, GPU recreation and room lift passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});


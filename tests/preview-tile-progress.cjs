const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?electriclab=1');await page.waitForFunction(()=>MapIcons.ready&&ElectricEditor.editing);
  const result=await page.evaluate(()=>{
   ElectricTiles.reset();tiles=[];for(let y=-5;y<=5;y++)for(let x=-6;x<=6;x++)tiles.push({x,y});
   const kinds=Object.keys(ElectricTiles.defs);
   kinds.forEach((kind,i)=>{const anchor=tiles.find(c=>ElectricTiles.canPlace(kind,c)&&ElectricTiles.shape(kind,c).cells.every(t=>t.y<4)),f=anchor&&ElectricTiles.place(kind,anchor);if(!f)throw Error('placement '+kind);f.cool=(ElectricTiles.defs[kind].interval||0)*.5;});
   for(const [i,kind] of ['medical','shieldTile','cashTile','shockTile'].entries()){
    const t=tiles.find(t=>t.x===i-2&&t.y===4);t[kind]=true;t.healProgress=supplyTime(t)*.5;if(kind==='shockTile'){t.shockCooldown=SHOCK_COOLDOWN*.5;t.shockCharges=0;}
   }
   p.x=100;p.y=100;paused=true;draw();
   const original=renderer.emissiveSquareScan,arc=renderer.arc,masks=[];let arcs=0;
   renderer.emissiveSquareScan=function(...args){masks.push(args);return original.apply(this,args);};
   renderer.arc=function(...args){arcs++;return arc.apply(this,args);};
   try{draw();}finally{renderer.emissiveSquareScan=original;renderer.arc=arc;}
   return {count:masks.length,expected:ElectricTiles.list().length+4,arcs,finite:masks.every(a=>a.slice(0,5).every(Number.isFinite)),gl:renderer.gl.getError()};
  });
  assert.equal(result.count,result.expected);assert.equal(result.arcs,0);assert.ok(result.finite);assert.equal(result.gl,0);
  await page.screenshot({path:'tests/tile-progress-390x844.png'});
  await page.setViewportSize({width:390,height:680});await page.screenshot({path:'tests/tile-progress-390x680.png'});
  assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);assert.deepEqual(errors,[]);
  console.log('Real Edge/WebGL: only facility cores and medical/shield/cash/shock share floor progress masks, no circular progress, finite geometry, zero page/GL errors, 390x844/680 screenshots passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});

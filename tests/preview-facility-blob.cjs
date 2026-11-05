const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?promo=1&mapseed=facility-blob');await page.waitForFunction(()=>globalThis.ElectricEditor?.preparing);await page.evaluate(()=>ElectricEditor.run());await page.waitForFunction(()=>state==='combat');
 await page.evaluate(()=>{window.requestAnimationFrame=()=>0;paused=true;});await page.waitForTimeout(100);
 await page.addStyleTag({content:'.boss-banner,#survival-clock,#promo-panel{display:none!important}'});
 const reports=[];
 for(const kind of ['electric_tower','missile_tower','shotgun_tower','sniper_tower','repair_turret','miner','missile_bomb']){
 const report=await page.evaluate(kind=>{
  ElectricTiles.reset();tiles=[];for(let y=-4;y<=4;y++)for(let x=-4;x<=4;x++)tiles.push({x,y});
  const placed=ElectricTiles.place(kind,{x:0,y:0});if(!placed)throw Error('place '+kind);
  enemies=[];p.x=325+HexMap.x(-3,3);p.y=300+HexMap.y(3);renderer.sceneKey=null;NeonPostFX.settings.cameraSize=.55;renderer.mapCamera.x=0;renderer.mapCamera.z=0;
  const r=renderer,original=r.transparentQuad;let quads=0;const color=kind==='electric_tower'?'#76e3fa':ElectricTiles.defs[kind].color;
  const sample=enabled=>{quads=0;r.transparentQuad=function(...args){if(args[4]===color&&args[0][1]===2.3){quads++;if(!enabled)return;}return original.apply(this,args);};try{draw(0);}finally{r.transparentQuad=original;}const gl=r.gl,a=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,a);return a;};
  const off=sample(false),on=sample(true);let pixels=0;for(let i=0;i<on.length;i+=4)if(Math.abs(on[i]-off[i])+Math.abs(on[i+1]-off[i+1])+Math.abs(on[i+2]-off[i+2])>9)pixels++;
  return {kind,pixels,quads,gl:r.gl.getError()};
 },kind);
 assert.ok(report.pixels>100,JSON.stringify(report));assert.ok(report.quads>0);assert.equal(report.gl,0);reports.push(report);
 await page.screenshot({path:`tests/facility-blob-${kind}-390.png`});
 }
 assert.deepEqual(errors,[]);console.log(reports);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

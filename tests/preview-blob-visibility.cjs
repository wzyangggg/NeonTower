const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?promo=1&mapseed=blob-visibility');await page.waitForFunction(()=>globalThis.ElectricEditor?.preparing);await page.evaluate(()=>ElectricEditor.run());await page.waitForFunction(()=>state==='combat');
 await page.evaluate(()=>{window.requestAnimationFrame=()=>0;});await page.waitForTimeout(100);
 await page.addStyleTag({content:'.boss-banner,#survival-clock,#promo-panel{display:none!important}'});
 await page.evaluate(()=>{paused=true;tiles=[];for(let yy=-3;yy<=3;yy++)for(let xx=-3;xx<=3;xx++)tiles.push({x:xx,y:yy});ElectricTiles.place('electric_tower',{x:0,y:0});p.x=325+HexMap.x(-2,2);p.y=300+HexMap.y(2);enemies=[];renderer.sceneKey=null;NeonPostFX.settings.cameraSize=.55;renderer.mapCamera.x=0;renderer.mapCamera.z=0;draw(0);});
 const sample=async enabled=>page.evaluate(enabled=>{const r=renderer,original=r.residentMesh;r.residentMesh=function(key,...args){if(!enabled&&key.startsWith('hex-floor-blob:'))return;return original.call(this,key,...args)};try{draw(0)}finally{r.residentMesh=original}const gl=r.gl,a=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,a);return Array.from(a);},enabled);
 const off=await sample(false);await page.screenshot({path:'tests/blob-visibility-off-390.png'});const on=await sample(true);await page.screenshot({path:'tests/blob-visibility-on-390.png'});
 let pixels=0,sum=0,max=0;for(let i=0;i<on.length;i+=4){const delta=(on[i]+on[i+1]+on[i+2]-off[i]-off[i+1]-off[i+2])/3;if(delta>2){pixels++;sum+=delta;max=Math.max(max,delta)}}
 const mesh=await page.evaluate(()=>{const m=renderer.residentMeshes.get('hex-floor-blob:0,0:4');return {count:[...renderer.residentMeshes].filter(([k])=>k.startsWith('hex-floor-blob:')).length,center:m?Array.from(m.data.slice(0,9)):null,gl:renderer.gl.getError()}});console.log({pixels,average:pixels?sum/pixels:0,max,mesh,errors});assert.deepEqual(errors,[]);assert.ok(pixels>100);
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});

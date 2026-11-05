const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>window.HexMap?.ready);
await page.evaluate(()=>{window.requestAnimationFrame=()=>0;});await page.waitForTimeout(100);
for(const [width,height] of [[390,844],[320,568],[1280,900]]){
await page.setViewportSize({width,height});
for(const [kind,f] of [['builder',4],['bridge',9],['ranged',14],['ordinary',1]]){
await page.evaluate(({kind,f})=>{reset();testMode=false;GROUND_ENEMIES.enabled=kind==='builder';floor=f;state='landing';startWave();draw();}, {kind,f});
await page.locator('#electric-panel').evaluate(el=>Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{}))));
await page.evaluate(()=>draw());
const info=await page.evaluate(()=>{const svg=document.querySelector('.strong-enemy-forecast'),vr=$('viewport').getBoundingClientRect(),panel=$('electric-panel').getBoundingClientRect();return {preparing:ElectricEditor.preparing,types:[...svg.querySelectorAll('.strong-warning')].map(el=>el.dataset.side),screenArrows:svg.querySelectorAll('.strong-arrow').length,texts:svg.querySelectorAll('text').length,world:renderer.residentMeshes.get('strong-entry:paper-plane')?.count||0,boxes:[...svg.querySelectorAll('rect')].map(el=>{const r=el.getBoundingClientRect();return {left:r.left-vr.left,right:r.right-vr.left,top:r.top-vr.top,bottom:r.bottom-vr.top};}),panel:panel.top-vr.top,width:vr.width,glow:svg.querySelector('.strong-warning')?getComputedStyle(svg.querySelector('.strong-warning')).filter:'',gl:renderer.gl.getError()};});
if(kind!=='ordinary')assert(info.glow.includes('drop-shadow'),'warning glow enabled');assert(info.screenArrows===0&&info.texts===0&&(kind==='ordinary'?info.world===0:info.world>=info.types.length));assert(info.preparing&&info.gl===0,JSON.stringify(info));assert(kind==='ordinary'?info.types.length===0:info.types.length>0,kind);
for(const box of info.boxes)assert(box.left>=0&&box.right<=info.width&&box.top>=100&&box.bottom<info.panel,JSON.stringify({kind,width,height,info}));
for(let i=0;i<info.boxes.length;i++)for(let j=i+1;j<info.boxes.length;j++){const a=info.boxes[i],b=info.boxes[j];assert(a.right<=b.left||b.right<=a.left||a.bottom<=b.top||b.bottom<=a.top,'warning cards overlap');}
await page.screenshot({path:`tests/strong-forecast-${kind}-${width}x${height}.png`});
if(kind==='ordinary')continue;
// Finish preparation through the real editor; overlay must disappear even during handoff.
await page.evaluate(()=>{ElectricEditor.catalog([]);ElectricEditor.run();draw();});
assert.equal(await page.locator('.strong-enemy-forecast').isVisible(),false);
}
}
const tips=[];for(const size of [{width:390,height:844},{width:320,height:568},{width:1280,height:900}]){await page.setViewportSize(size);const result=await page.evaluate(()=>{
 reset();GROUND_ENEMIES.enabled=false;testMode=false;floor=9;state='landing';startWave();draw();const mesh=renderer.residentMeshes.get('strong-entry:paper-plane'),vr=$('viewport').getBoundingClientRect(),cr=canvas.getBoundingClientRect(),tails=[],tips=[],p=mesh.instances;
 let first=0;for(let i=1;i<=mesh.count;i++)if(i===mesh.count||Math.sign(p[i*13])!==Math.sign(p[first*13])){const k=first*13,screen=renderer.screenPoint(p[k+3],5,p[k+11]),x=screen.x+cr.left-vr.left,y=screen.y+cr.top-vr.top;tails.push(Math.min(Math.abs(x),Math.abs(x-vr.width),Math.abs(y),Math.abs(y-vr.height)));const h=(i-1)*13;tips.push([p[h+3]+24*p[h],p[h+11]+24*p[h+8]]);first=i;}
 return {tails,tips,finite:Array.from(mesh.instances.slice(0,mesh.count*13)).every(Number.isFinite),buffer:!!mesh.buffer,planes:mesh.count};
});assert(result.finite&&result.buffer&&result.planes>=6,'multiple tiled paper planes');assert(result.tails.every(d=>d<.1),'world tails project onto viewport edge '+JSON.stringify(result));tips.push(result.tips);}
for(let i=1;i<tips.length;i++)for(let j=0;j<tips[0].length;j++)assert(Math.hypot(tips[i][j][0]-tips[0][j][0],tips[i][j][1]-tips[0][j][1])<.001,'world arrow tips remain fixed when viewport changes');
// Preparation pauses gameplay; the light must keep flowing over stationary tiles.
const animation=await page.evaluate(()=>{
 const originalNow=performance.now.bind(performance);let stamp=1000;performance.now=()=>stamp;draw();const mesh=renderer.residentMeshes.get('strong-entry:paper-plane'),buffer=mesh.buffer,data=mesh.data,first=Array.from(mesh.instances.slice(0,mesh.count*13));stamp+=250;draw();const second=Array.from(mesh.instances.slice(0,mesh.count*13));performance.now=originalNow;
 return {filled:data.length===2*6*9,small:data.filter((_,i)=>i%9===0).every(v=>v>=-1&&v<=25),saturated:data[6]===1&&data[7]>.81&&data[7]<.82&&data[8]>.26&&data[8]<.27,paused,geometryStable:first.every((v,i)=>i%13===12||v===second[i]),movingLight:first.some((v,i)=>i%13===12&&Math.abs(v-second[i])>.05),shared:mesh.buffer===buffer&&mesh.data===data};
});assert(animation.filled&&animation.small&&animation.saturated&&animation.paused&&animation.geometryStable&&animation.movingLight&&animation.shared,JSON.stringify(animation));
assert.deepEqual(errors,[]);console.log('Compact solid yellow arrows + flowing glow real Edge/WebGL: builder/bridge/advanced/ordinary, three screen sizes, bounds, no GL errors and handoff cleanup passed.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

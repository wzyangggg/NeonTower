const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');

(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const mode=process.env.SMOKE_MODE||'';
  await page.goto('http://127.0.0.1:4173/?weaponlab=1&smokedemo=1'+(mode?'&smoke='+encodeURIComponent(mode):''));
  await page.waitForFunction(()=>window.HexMap?.ready&&window.weaponLab?.active);
  await page.getByRole('button',{name:'引爆两团粒子烟'}).click();
  await page.waitForFunction(age=>explosionFX[1]?.t>=age,mode==='shared'?.10:.15);
  const visual=await page.evaluate(()=>{
   paused=true;
   draw();
   const fluid=$('ember-smoke')||$('fluid-smoke');
   const smoke=fluid||$('particle-smoke');
   let pixels,glError=0;
   if(fluid){
    const gl=fluid.getContext('webgl2');
    pixels=new Uint8Array(smoke.width*smoke.height*4);
    gl.readPixels(0,0,smoke.width,smoke.height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
    glError=gl.getError();
   }else pixels=smoke.getContext('2d').getImageData(0,0,smoke.width,smoke.height).data;
   let covered=0, hotPixels=0;
   for(let i=0;i<pixels.length;i+=4){
    if(pixels[i+3]>20)covered++;
    if(pixels[i+3]>60&&pixels[i]>pixels[i+1]*1.25&&pixels[i+1]>pixels[i+2]*1.35)hotPixels++;
   }
   const scene=canvas.getBoundingClientRect(), overlay=smoke.getBoundingClientRect();
   return {backend:fluid?'webgl2':'particles',glError,covered,hotPixels,aligned:scene.x===overlay.x&&scene.y===overlay.y&&scene.width===overlay.width&&scene.height===overlay.height,
    buffer:[smoke.width,smoke.height],visible:smoke.style.display!=='none'};
  });
  assert.ok(visual.visible&&visual.aligned&&visual.covered>150);
  assert.equal(visual.backend,mode==='particles'?'particles':'webgl2');
  if(!mode||mode==='shared')assert.equal(await page.locator('#ember-smoke').count(),1);
  assert.equal(visual.glError,0);
  if(process.env.SMOKE_SCREENSHOT)await page.screenshot({path:process.env.SMOKE_SCREENSHOT});
  if(visual.backend==='webgl2')assert.ok(visual.hotPixels>80,JSON.stringify(visual));
  assert.equal(await page.evaluate(()=>{
   for(let i=0;i<90;i++)ParticleSmoke.update(1/30);
   draw();
   const hidden=($('ember-smoke')||$('fluid-smoke')||$('particle-smoke')).style.display==='none';
   weaponLab.resetTargets();
   paused=false;
   return hidden;
  }),true);
  const result=await page.evaluate(async()=>{
   const smoke=ParticleSmoke;
   const original={update:smoke.update,draw:smoke.draw,emit:smoke.emit};
   const originalMode=smoke.mode;
   const origin=[[282,238],[359,262],[310,308],[388,211]];
   let frame={update:0,draw:0,emit:0};
   for(const key of Object.keys(original)){
    smoke[key]=(...args)=>{
     const start=performance.now();
     try{return original[key](...args);}
     finally{frame[key]+=performance.now()-start;}
    };
   }
   const run=(mode,count,frames)=>new Promise(resolve=>{
    smoke.mode=mode;
    smoke.clear();
    explosionFX=[];
    frame={update:0,draw:0,emit:0};
    let previous, samples=[];
    function sample(now){
     if(previous!==undefined)samples.push({ms:now-previous,...frame});
     frame={update:0,draw:0,emit:0};
     previous=now;
     if(samples.length===frames){resolve(samples);return;}
     // Keep the same staggered explosions and the same scene in both modes.
     if(samples.length%4===0&&samples.length/4<count){
      const [x,y]=origin[samples.length/4];
      spawnExplosionFX(x,y,70);
     }
     requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
   });
   const groups={offOne:[],one:[],offFour:[],four:[]};
   try{
    await run(originalMode,4,75);
    for(let repeat=0;repeat<3;repeat++){
     const pairs=repeat%2
      ? [['four',originalMode,4],['offFour','off',4],['one',originalMode,1],['offOne','off',1]]
      : [['offOne','off',1],['one',originalMode,1],['offFour','off',4],['four',originalMode,4]];
     for(const [key,mode,count] of pairs)groups[key].push(...await run(mode,count,60));
    }
    const summarize=rows=>{
     const avg=key=>rows.reduce((sum,row)=>sum+row[key],0)/rows.length;
     const sorted=rows.map(row=>row.ms).sort((a,b)=>a-b);
     const round=value=>+value.toFixed(2);
     return {frames:rows.length,fps:round(1000/avg('ms')),meanFrameMs:round(avg('ms')),p95FrameMs:round(sorted[Math.ceil(sorted.length*.95)-1]),
      smokeUpdateMs:round(avg('update')),smokeDrawMs:round(avg('draw')),smokeEmitMs:round(avg('emit')),
      smokeCpuMs:round(avg('update')+avg('draw')+avg('emit'))};
    };
    const gl=renderer.gl, debug=gl.getExtension('WEBGL_debug_renderer_info');
    return {gpu:debug&&gl.getParameter(debug.UNMASKED_RENDERER_WEBGL),targets:enemies.length,glError:gl.getError(),
     timings:Object.fromEntries(Object.entries(groups).map(([key,rows])=>[key,summarize(rows)]))};
   }finally{
    smoke.clear();
    smoke.mode=originalMode;
    Object.assign(smoke,original);
   }
  });
  assert.equal(result.glError,0);
  assert.ok(result.targets>0);
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({visual,...result},null,2));
 }finally{
  await browser.close();
 }
})().catch(error=>{console.error(error);process.exitCode=1;});

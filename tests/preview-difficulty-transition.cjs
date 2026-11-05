const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const [width,height]of [[390,844],[320,568],[1280,900]]){
  await page.setViewportSize({width,height});await page.goto('http://127.0.0.1:4173/');await page.waitForSelector('.difficulty-panel');await page.waitForFunction(()=>globalThis.HexMap?.ready);
  await page.evaluate(()=>{
   window.revealSamples=[];window.layoutSamples=[];
   const selectors=['.difficulty-panel','.title-brand','#lobby-nav'];
   const originalEnter=enterDifficulty;enterDifficulty=(...args)=>{window.menuRects=selectors.map(selector=>{const el=document.querySelector('#viewport '+selector),r=el.getBoundingClientRect();return {selector,x:r.x,y:r.y,width:r.width,height:r.height};});return originalEnter(...args);};
   new MutationObserver(()=>{const cover=document.querySelector('.difficulty-transition-cover');if(!cover)return;
   const root=cover.getBoundingClientRect(),live=document.querySelector('#viewport').getBoundingClientRect();
   layoutSamples.push({root:{x:root.x,y:root.y,width:root.width,height:root.height},live:{x:live.x,y:live.y,width:live.width,height:live.height},children:menuRects.map(({selector})=>{const r=cover.querySelector(selector).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};})});
   const match=cover.style.maskImage.match(/transparent ([\d.]+)px/);if(match)revealSamples.push({at:performance.now(),radius:Number(match[1])});}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['style']});
  });
  await page.locator('#start').click();assert.equal(await page.evaluate(()=>state),'menu');
  await page.waitForFunction(()=>difficultyEntering);assert.equal(await page.evaluate(()=>paused),true);
  await page.waitForFunction(()=>!difficultyEntering);
  const samples=await page.evaluate(()=>revealSamples),first=samples[0],end=samples.at(-1),duration=end.at-first.at;
  assert(duration>=980,`reveal lasted ${duration}ms`);
  assert(samples.length>=10,`only ${samples.length} visible steps`);
  assert(samples.some(s=>s.radius/end.radius>.25&&s.radius/end.radius<.75),'missing intermediate circle');
  const early=samples.filter(s=>s.at-first.at<300);assert(early.at(-1).radius/end.radius<.4,'circle expands too quickly');
  const layout=await page.evaluate(()=>({samples:layoutSamples,before:menuRects}));
  assert(layout.samples.length>0);
  for(const sample of layout.samples){for(const key of ['x','y','width','height'])assert(Math.abs(sample.root[key]-sample.live[key])<1,`cover ${key} differs from game`);
   sample.children.forEach((rect,i)=>{for(const key of ['x','y','width','height'])assert(Math.abs(rect[key]-layout.before[i][key])<1,`${layout.before[i].selector} ${key} jumped ${rect[key]} vs ${layout.before[i][key]}`);});}
  assert.equal(await page.locator('.difficulty-transition-cover').count(),0);assert.notEqual(await page.evaluate(()=>state),'menu');assert.equal(await page.evaluate(()=>paused),false);assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);
  console.log(`${width}x${height}: reveal ${Math.round(duration)}ms, ${samples.length} steps`);
 }
 assert.deepEqual(errors,[]);console.log('PASS: delayed start, one-second circular reveal, intermediate frames, paused gameplay, cleanup, no page/GL errors');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});


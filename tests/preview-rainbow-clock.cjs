const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('node:path');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const page=await browser.newPage({viewport:{width:540,height:960},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4231/');await page.click('#start');
 await page.waitForTimeout(1600);
 await page.evaluate(()=>{paused=true;state='combat';timedRoom={remaining:9.4,duration:12};p.inv=999;clearTimeout(toast.timer);$('toast').classList.remove('show');updateTimedRoomHud();draw();});
 await page.waitForTimeout(200);
 await page.screenshot({path:path.join(__dirname,process.argv[2]||'rainbow-clock-after-v2.png')});
 if(process.argv.includes('--verify')){
  const pixels=await page.evaluate(()=>{
   const results=[];
   for(const remaining of [12,9,6,3,0]){
    timedRoom.remaining=remaining;drawRainbowClock();
    const canvas=$('clock-spectrum'),c=canvas.getContext('2d'),scale=canvas.width/200;
    results.push({remaining,pixels:[[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,y])=>Array.from(c.getImageData(Math.round((100+x*30)*scale),Math.round((100+y*30)*scale),1,1).data))});
   }
   timedRoom.remaining=9.4;updateTimedRoomHud();drawRainbowClock();return results;
  });
  assert(pixels[0].pixels.every(p=>p[3]===255),'full clock has solid rainbow interior');
  assert(new Set(pixels[0].pixels.map(p=>p.slice(0,3).join(','))).size===4,'rainbow fills the interior in distinct hues');
  assert.equal(pixels[1].pixels[1][3],0,'elapsed top right quarter is genuinely transparent');
  assert(pixels[1].pixels.filter(p=>p[3]===255).length===3,'remaining three quarters stay filled');
  assert(pixels[2].pixels[1][3]===0&&pixels[2].pixels[2][3]===0,'clock clears clockwise');
  assert.equal(pixels[3].pixels.filter(p=>p[3]===255).length,1,'last quarter stays colored');
  assert(pixels[4].pixels.every(p=>p[3]===0),'zero leaves no interior fill');
  const pausedBefore=await page.locator('#survival-time').textContent();await page.waitForTimeout(250);
  assert.equal(await page.locator('#survival-time').textContent(),pausedBefore,'pause freezes countdown');
  const musicResult=await page.evaluate(async()=>{
   music.sampleSpectrum(.1);const first=Array.from(music.bands);
   await new Promise(resolve=>setTimeout(resolve,300));music.sampleSpectrum(.1);const second=Array.from(music.bands);
   const activePeak=Math.max(...first,...second);
   // Same audio routing used by the sound toggle; bars settle to their baseline.
   music.enabled=false;for(let i=0;i<100;i++)music.sampleSpectrum(.1);
   const mutedPeak=Math.max(...music.bands);music.enabled=true;
   return {activePeak,changed:first.some((v,i)=>v!==second[i]),mutedPeak};
  });
  assert(musicResult.activePeak>0&&musicResult.changed,'spectrum reads changing real music');
  assert(musicResult.mutedPeak<.001,'muted spectrum settles');
  for(const [width,height] of [[390,844],[390,680]]){
   await page.setViewportSize({width,height});await page.waitForTimeout(100);
   const box=await page.locator('#survival-clock').boundingBox();
   assert(box.y+box.height*.1>96,'clock clears top HUD at '+height);
   assert(box.y+box.height*.9<height*.316,'clock clears arena at '+height);
   await page.screenshot({path:path.join(__dirname,'rainbow-clock-'+width+'x'+height+'.png')});
  }
  console.log(JSON.stringify({pixels,musicResult}));
 }
 assert.deepEqual(errors,[],'browser has no script errors');
 console.log(JSON.stringify({errors,clock:await page.locator('#survival-clock').boundingBox()}));
 await browser.close();
})();

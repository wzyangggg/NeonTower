const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:900,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>typeof updatePlayerHeadSpring==='function');
 const result=await page.evaluate(()=>{
  reset();paused=true;state='combat';enemies=[];spawnQueue=[];$('overlay').style.display='none';p.inv=0;time=0;
  const samples=[];updatePlayerHeadSpring();
  for(let i=0;i<180;i++){time+=1/60;p.x+=i<30?2:i<60?-2:0;const h=updatePlayerHeadSpring();samples.push({...h});}
  const h=updatePlayerHeadSpring(),before=JSON.stringify(h);for(let i=0;i<20;i++)updatePlayerHeadSpring();const frozen=before===JSON.stringify(h);
  // Head-only transform leaves the body untouched and points the face normal at the camera.
  const r=renderer;r.begin();r.box(0,18,0,18,19,15,'#ffffff');const start=r.count,body=Array.from(r.data.slice(0,start)),glow=r.projectileCount;r.box(0,39,0,31,25,23,'#ffffff');const front=[];for(let i=start;i<r.count;i+=9)if(r.data[i+5]>.9)front.push(i);transformPlayerHead(start,glow,0,0,{roll:.08,pitch:0});
  const unchanged=body.every((v,i)=>v===r.data[i]),cameraFacing=front.every(i=>Math.abs(r.data[i+3])<1e-6&&Math.abs(r.data[i+4]-Math.sin(PLAYER_HEAD_REST_TILT))<1e-6&&Math.abs(r.data[i+5]-Math.cos(PLAYER_HEAD_REST_TILT))<1e-6);
  time+=1/60;p.x+=2;updatePlayerHeadSpring();time+=1/60;p.x-=2;draw();
  // The neck anchor must be identical for every angle; the head centre moves only on its short arc.
  let anchorError=0,centreTravel=0,undersideDot=-1;
  for(const roll of [-.12,0,.12])for(const pitch of [-.055,0,.055]){r.count=0;r.projectileCount=0;r.vertex([0,27,0],[0,0,1],[1,1,1]);r.vertex([0,39,0],[0,-1,0],[1,1,1]);transformPlayerHead(0,0,0,0,{roll,pitch});const cy=Math.sin(PLAYER_HEAD_REST_TILT),cz=Math.cos(PLAYER_HEAD_REST_TILT);anchorError=Math.max(anchorError,Math.hypot(r.data[0],r.data[1]-(39-12*cz),r.data[2]-12*cy));centreTravel=Math.max(centreTravel,Math.hypot(r.data[9],r.data[10]-39,r.data[11]));undersideDot=Math.max(undersideDot,(r.data[13]*700+r.data[14]*440)/Math.hypot(700,440));}
  const peakTime=(samples.slice(0,30).findIndex(h=>h.roll===Math.max(...samples.slice(0,30).map(h=>h.roll)))+1)/60,overshoot=Math.max(...samples.slice(0,30).map(h=>h.roll))/.06;
  const stopSamples=samples.slice(60);let crossings=0;for(let i=1;i<stopSamples.length;i++)if(stopSamples[i].roll*stopSamples[i-1].roll<0&&Math.abs(stopSamples[i].roll)>.0001)crossings++;
  draw();return {peakTime,overshoot,crossings,undersideDot,peak:Math.max(...samples.map(h=>Math.abs(h.roll))),startRoll:samples[5].roll,reverseRoll:samples[35].roll,stopOvershoot:Math.max(...samples.slice(65,100).map(h=>h.roll)),settled:Math.abs(samples.at(-1).roll),frozen,unchanged,cameraFacing,anchorError,centreTravel,gl:r.gl.getError()};
 });
 assert.ok(result.peakTime<=.15&&result.overshoot>1.2&&result.crossings>=2);assert.ok(result.undersideDot<-.15);assert.ok(result.peak>.03&&result.peak<=.12);assert.ok(result.startRoll>.02&&result.reverseRoll<-.02);assert.ok(result.stopOvershoot>.001);assert.ok(result.settled<.001);assert.ok(result.anchorError<.00001&&result.centreTravel<1.7);assert.ok(result.frozen&&result.unchanged&&result.cameraFacing);assert.equal(result.gl,0);
 await page.evaluate(()=>{p.x=325;time+=1;updatePlayerHeadSpring();for(let i=0;i<6;i++){time+=1/60;p.x+=2;updatePlayerHeadSpring();}draw();});
 await page.screenshot({path:'tests/head-spring-preview.png'});
 await page.goto('http://127.0.0.1:4173/?headspring=0');assert.equal(await page.evaluate(()=>PLAYER_HEAD_SPRING_TEST),false);assert.deepEqual(errors,[]);console.log('Edge/WebGL head spring passed',JSON.stringify(result));
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});

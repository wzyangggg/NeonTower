const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?mapseed=elevator-01');await page.waitForFunction(()=>HexMap.ready);await page.locator('#start').click();await page.waitForFunction(()=>ElectricEditor.preparing);
 await page.evaluate(()=>{window.requestAnimationFrame=()=>0;});await page.waitForTimeout(100);
 let samples=0;
 for(const size of [{width:390,height:844},{width:320,height:568},{width:1280,height:900}]){
  await page.setViewportSize(size);
  samples+=await page.evaluate(()=>{
   const seeds=['elevator-01',...Array.from({length:12},(_,i)=>'bridge-heading-'+i)];let count=0;
   for(const seed of seeds){tiles=HexMap.campaignFloor(seed);floor=1;clearBridgeRoom(true);startBridgeRoom();if(!bridgeRoom||bridgeRoom.cells.length!==24)throw Error('missing extended bridge '+seed);
    const extremes=[tiles[0],...['left','right','top','bottom'].map(d=>tiles.slice().sort((a,b)=>d==='left'?HexMap.x(a.x,a.y)-HexMap.x(b.x,b.y):d==='right'?HexMap.x(b.x,b.y)-HexMap.x(a.x,a.y):d==='top'?a.y-b.y:b.y-a.y)[0])];
    for(const t of extremes){p.x=325+HexMap.x(t.x,t.y);p.y=300+HexMap.y(t.y);time+=.1;StreetScene.lighting(renderer);renderer.resize();
     const r=canvas.getBoundingClientRect(),start=bridgeRoom.ends[0].start,q=renderer.screenPoint(start.x-325,4,(start.y-300)*1.06);
     if(q.x>=-48&&q.x<=r.width+48&&q.y>=-48&&q.y<=r.height+48)throw Error('bridge end visible '+JSON.stringify({seed,t,q}));
     enemies=[];if(!spawnBridgeRoller({type:'crawler'}))throw Error('offscreen spawn failed '+seed);
     for(const e of enemies){const q=renderer.screenPoint(e.x-325,30,(e.y-300)*1.06);if(q.x>=-48&&q.x<=r.width+48&&q.y>=-48&&q.y<=r.height+48)throw Error('enemy spawned onscreen '+seed);}
     const vp=Array.from(renderer.vp),saved=bridgeRoom;bridgeRoom=null;renderer.resize();bridgeRoom=saved;
     if(vp.some((v,i)=>v!==renderer.vp[i]))throw Error('bridge changed camera framing');
     count++;
    }
   }return count;
  });
  await page.evaluate(()=>{reset();ElectricEditor.reset();RoomReady.cancel();testMode=true;floor=5;startWave();paused=false;step(1);p.inv=999;shootTimer=999;for(let i=0;i<180;i++)step(.02);paused=true;shake=0;draw();});
  assert.ok(await page.evaluate(()=>enemies.some(e=>e.bridgeRoller)));assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);
  await page.screenshot({path:`tests/bridge-visible-${size.width}.png`});
 }
 assert.deepEqual(errors,[]);console.log('Offscreen bridge real Edge/WebGL:',samples,'seed/viewport/player-edge cases; combat screenshots and no page/GL errors.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

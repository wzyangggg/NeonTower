const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?mapseed=elevator-01');await page.waitForFunction(()=>window.HexMap?.ready);await page.locator('#start').click();
 const result=await page.evaluate(()=>{
  testMode=true;ElectricEditor.reset();paused=false;state='combat';timedRoom=null;sawRoom=null;bridgeRoom=null;enemies=[];spawnQueue=[{type:'eye'}];spawnTimer=999;shootTimer=999;sound=false;p.inv=999;
  const check=(v,m)=>{if(!v)throw Error(m)},out=[];
  // Reproduce horizontal shots above the old top wall and shots crossing both side walls.
  for(const source of ['weapon','drone'])for(const side of [-1,1])for(const above of [false,true]){
   const x=side<0?A.x+1:A.x+A.w-1,y=above?A.y-12:A.y+20;
   const s={x,y,vx:side*400,vy:0,life:1,pierce:1,damage:1,source};shots=[s];step(.02);
   check(shots.includes(s)&&s.life>0,'friendly shot survives former wall '+source+side+above);out.push({source,side,above});
  }
  const rocket={x:A.x+1,y:A.y-12,vx:-400,vy:0,life:1,pierce:1,damage:2,blastRadius:50,source:'weapon'};shots=[rocket];step(.02);
  check(shots.includes(rocket)&&!rocket.exploded,'rocket does not explode at old wall');
  const at={x:rocket.x,y:rocket.y};explodeFriendlyRocket(rocket,[]);const blast=shots.find(s=>s.radial);
  check(blast.x===at.x&&blast.y===at.y,'explosion stays at actual open-air position');
  shots=[{x:at.x,y:at.y,vx:0,vy:0,life:.01,pierce:1,damage:1}];step(.02);check(!shots.length,'expired shots still removed');
  HexMap.ready=false;check(friendlyShotOutside(at.x,at.y),'legacy rectangular mode retains wall');HexMap.ready=true;
  paused=true;draw();check(renderer.gl.getError()===0,'GL error');return {paths:out,rocket:true,lifetime:true,legacy:true};
 });assert.deepEqual(errors,[]);console.log(result);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?builderlab=1');await page.waitForFunction(()=>window.HexMap?.ready&&builderRoom);
 await page.evaluate(()=>{paused=true;window.requestAnimationFrame=()=>0;});await page.waitForTimeout(100);
 const edges=await page.evaluate(()=>{
  const saved=tiles,results=[];
  for(let y=-3;y<=3;y++)for(let x=-3;x<=3;x++){
   const tile={x,y};tiles=[tile];const cx=325+HexMap.x(x,y),cy=300+HexMap.y(y);
   results.push(particleSurfaceHeight(cx,cy)===0);
   for(let i=0;i<6;i++){const a=i*Math.PI/3,nx=Math.cos(a),ny=Math.sin(a);results.push(particleSurfaceHeight(cx+nx*(TILE/2-.4),cy+ny*(TILE/2-.4))===0,particleSurfaceHeight(cx+nx*(TILE/2+.4),cy+ny*(TILE/2+.4))===null);}
  }
  tiles=saved;return {count:results.length,correct:results.every(Boolean)};
 });assert.deepEqual(edges,{count:637,correct:true});
 await page.evaluate(()=>{
  reset();sound=false;state='combat';paused=true;floor=4;enemies=[];enemyTransports=[];spawnQueue=[];particles=[];phase=0;scroll=0;p.inv=999;window.particleSounds=0;playCasingLanding=()=>window.particleSounds++;
  for(const x of [325,145]){
   shatterVisual({type:'eye',x,y:300,r:14});
   particles.push({casing:true,x,y:325,vx:0,vy:0,height:10,vz:-40,angle:0,spin:5,bounces:0,life:2.5,age:0});
  }
  for(const q of particles)if(q.chunk){q.life=2.5;q.height=28;q.vz=50;q.vx=q.vy=0;}
  deathBursts=[];window.surfaceSavedCash=cash;clearTimeout(toast.timer);$('toast').classList.remove('show');draw();
 });
 const captures=[];
 for(const [dt,label] of [[.2,'early'],[.45,'falling'],[.3,'late']]){
  const info=await page.evaluate(dt=>{
   for(let t=0;t<dt-1e-9;t+=.01)updateParticles(Math.min(.01,dt-t));draw();
   const physical=particles.filter(q=>q.chunk||q.casing),outside=physical.filter(q=>q.x<200),inside=physical.filter(q=>q.x>300),mesh=renderer.residentMeshes.get('starter-brass-case');
   return {outside:outside.map(q=>({kind:q.casing?'casing':'chunk',height:q.height,bounces:q.bounces||0})),inside:inside.map(q=>({height:q.height,bounces:q.bounces||0})),belowRendered:Array.from({length:mesh.count},(_,i)=>mesh.instances[i*13+7]).some(y=>y<0),sounds:window.particleSounds,cashPreserved:cash===window.surfaceSavedCash,gl:renderer.gl.getError()};
  },dt);
  assert.equal(info.gl,0);assert.equal(info.sounds,1);assert.ok(info.cashPreserved);
  if(label!=='early'){assert.ok(info.outside.every(q=>q.height<0&&q.bounces===0));assert.ok(info.inside.every(q=>q.height>=2));assert.ok(info.belowRendered);}
  captures.push(info);await page.screenshot({path:path.join(__dirname,`particle-surfaces-${label}-390x844.png`)});
 }
 await page.setViewportSize({width:390,height:680});await page.evaluate(()=>draw());await page.screenshot({path:path.join(__dirname,'particle-surfaces-falling-390x680.png')});
 const reuse=await page.evaluate(()=>{const mesh=renderer.residentMeshes.get('starter-brass-case'),data=mesh.data;draw();return mesh===renderer.residentMeshes.get('starter-brass-case')&&mesh.data===data;});assert.ok(reuse);
 assert.deepEqual(errors,[]);console.log('Real Edge/WebGL particle surfaces: 49 hex centers plus 588 edge sides, actual death fragments/casings fall outside while landing inside, one sound, negative GPU poses, cash preserved, resident reuse and two portrait sizes passed.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

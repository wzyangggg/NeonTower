const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:900,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?vehiclelab=1');await page.waitForFunction(()=>window.HexMap?.ready&&enemies.length===4&&paused);
 await page.evaluate(()=>{window.requestAnimationFrame=()=>0;});await page.waitForTimeout(100);
 const result=await page.evaluate(()=>{
  draw();const initial=enemies.map(e=>{const m=renderer.residentMeshes.get('enemy-vehicle:'+EnemyVehicles.types[e.type]);return {e,data:m.data,buffer:m.buffer};});
  paused=false;shootTimer=999;p.inv=999;
  for(let i=0;i<90;i++)step(1/60);paused=true;draw();
  const stats=initial.map(({e,data,buffer})=>{const m=renderer.residentMeshes.get('enemy-vehicle:'+EnemyVehicles.types[e.type]);return {type:e.type,pitch:e.flightPose?.pitch,roll:e.flightPose?.roll,finite:Array.from(m.instances.subarray(0,12)).every(Number.isFinite),reused:m.data===data&&m.buffer===buffer};});
  const hull=renderer.residentMeshes.get('enemy-vehicle:bubblepod'),glass=renderer.residentMeshes.get('enemy-vehicle-canopy:bubblepod');
  const aligned=Array.from(glass.instances.subarray(0,12)).every((v,i)=>v===hull.instances[i]);
  const snapshot=JSON.stringify(enemies.map(e=>e.flightPose));step(1);draw();
  return {stats,aligned,frozen:JSON.stringify(enemies.map(e=>e.flightPose))===snapshot,gl:renderer.gl.getError()};
 });
 assert.ok(result.stats.every(s=>s.finite&&s.reused&&Math.abs(s.pitch)+Math.abs(s.roll)>.03));assert.ok(result.aligned&&result.frozen&&result.gl===0);assert.deepEqual(errors,[]);
 await page.screenshot({path:'tests/enemy-flight-moving.png'});console.log('Actual Edge flight poses, tilted canopy alignment, pause and GPU reuse passed',result);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

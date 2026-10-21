const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  for(const entry of ['/?scene=street&lab=1','/hex-city.html']){
   await page.goto('http://127.0.0.1:4173'+entry);
   if(entry.includes('hex')){await page.waitForFunction(()=>window.HexMap?.ready);await page.locator('#start').click();}
   else await page.waitForFunction(()=>window.sceneLab);
   await page.evaluate(()=>{paused=true;StreetScene.place='abyss';StreetScene.look='violet';StreetScene.clock=3;StreetScene.enabled=true;renderer.sceneKey=null;draw();});
   await page.waitForTimeout(500);
   const report=await page.evaluate(()=>{
    const first=StreetScene.trafficAt(3),next=StreetScene.trafficAt(3.5),poses=first.map(c=>StreetScene.trafficPose(c));
    const meshes=[...renderer.residentMeshes].filter(([key])=>key.startsWith('orbital-traffic-')),data=meshes.map(([,m])=>m.data);
    for(let i=0;i<90;i++){StreetScene.clock=3+i/60;draw();}
    const routeAngles=StreetScene.trafficRoutes.map(route=>{const a=renderer.screenPoint(...route.a),b=renderer.screenPoint(...route.b);return Math.atan2(Math.min(Math.abs(b.x-a.x),Math.abs(b.y-a.y)),Math.max(Math.abs(b.x-a.x),Math.abs(b.y-a.y)));});
    const towerAngles=StreetScene.towerOrientations.map(q=>q.yaw);
    return {routeAngles,towerCount:towerAngles.length,towerAnglesVaried:new Set(towerAngles.map(a=>a.toFixed(2))).size>20&&towerAngles.some(a=>a>.3)&&towerAngles.some(a=>a<-.3),cars:first.length,models:new Set(first.map(c=>c.model)).size,finite:poses.flat().every(Number.isFinite),bob:first.every((c,i)=>Math.abs(c.y-next[i].y)>.001),tilt:first.every((c,i)=>c.pitch!==next[i].pitch&&c.roll!==next[i].roll),
     forward:first.every((c,i)=>{const p=poses[i],route=StreetScene.trafficRoutes[c.road];return (p[0]*(route.b[0]-route.a[0])+p[8]*(route.b[2]-route.a[2]))*c.dir>0;}),
     safe:first.filter(c=>c.near).every(c=>Math.abs(c.x)>(grid.maxX+.5)*TILE+60||c.z<(grid.minY-.5)*TILE*1.06-90),cached:meshes.every(([,m],i)=>m.data===data[i]),meshCount:meshes.length,error:renderer.gl.getError()};
   });
   assert.equal(report.cars,98);assert.equal(report.models,8);assert.equal(report.meshCount,8);
   assert.ok(report.routeAngles.every(a=>a>.2),'all routes visibly diagonal in camera projection');assert.equal(report.towerCount,85);assert.ok(report.towerAnglesVaried);
   assert.ok(report.finite&&report.bob&&report.tilt&&report.forward&&report.safe&&report.cached,JSON.stringify(report));assert.equal(report.error,0);
   for(const [width,height]of [[390,844],[1280,900]]){await page.setViewportSize({width,height});await page.evaluate(()=>{StreetScene.clock=3;draw();});await page.screenshot({path:`tests/city-traffic-${entry.includes('hex')?'hex':'original'}-${width}.png`});}
   console.log(entry,JSON.stringify(report));
   if(!entry.includes('hex')){
    await page.evaluate(()=>{window.savedTraffic=StreetScene.trafficAt;StreetScene.trafficAt=()=>Array.from({length:8},(_,model)=>({x:model%2?80:-235,y:390-Math.floor(model/2)*100,z:180,yaw:0,pitch:.025,roll:.035,scale:2,near:true,model}));document.body.classList.add('clean');draw();});
    await page.screenshot({path:'tests/city-traffic-models.png'});
    await page.evaluate(()=>{StreetScene.trafficAt=window.savedTraffic;});
   }
  }
  assert.deepEqual(errors,[]);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

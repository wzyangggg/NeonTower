const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:1200,height:820}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?vehiclelab=1');await page.waitForFunction(()=>window.HexMap?.ready&&enemies.length===4&&paused);
 await page.evaluate(()=>{window.requestAnimationFrame=()=>0;});await page.waitForTimeout(100);
 const stats=await page.evaluate(()=>{
  draw();const initial=Object.values(EnemyVehicles.types).map(kind=>{const mesh=renderer.residentMeshes.get('enemy-vehicle:'+kind);return {kind,mesh,data:mesh.data,buffer:mesh.buffer};});
  for(let i=0;i<20;i++){time+=.03;draw();}
  return initial.map(({kind,mesh,data,buffer})=>({kind,reused:mesh.data===data&&mesh.buffer===buffer,finite:data.every(Number.isFinite),triangles:data.length/27,count:mesh.count,gl:renderer.gl.getError()}));
 });assert.ok(stats.every(s=>s.reused&&s.finite&&s.triangles>100&&s.triangles<6000&&s.count===1&&s.gl===0));
 const combat=await page.evaluate(()=>{
  const counts=enemies.map(e=>{bullets=[];fire(e);return bullets.length;});bullets=[];
  const e=enemies[0],kind=EnemyVehicles.types[e.type],mesh=renderer.residentMeshes.get('enemy-vehicle:'+kind),data=mesh.data;
  e.hitAt=time;draw();const white=mesh.instances[12]===-1;
  e.warn=true;draw();const shared=mesh.data===data;delete e.hitAt;e.warn=false;draw();
  return {counts,white,shared,air:enemies.every(e=>!isGroundEnemy(e)&&!e.transport)};
 });assert.deepEqual(combat,{counts:[1,8,1,3],white:true,shared:true,air:true});
 const glass=await page.evaluate(()=>{
  const mesh=renderer.residentMeshes.get('enemy-vehicle-canopy:bubblepod'),data=mesh.data,buffer=mesh.buffer,e=enemies.find(e=>e.type==='spitter');
  e.hitAt=time;draw();const body=renderer.residentMeshes.get('enemy-vehicle:bubblepod'),aligned=Array.from(mesh.instances.subarray(0,13)).every((v,i)=>v===body.instances[i]);delete e.hitAt;
  time+=.1;draw();return {transparent:mesh.opacity===.32,reused:mesh.data===data&&mesh.buffer===buffer,finite:data.every(Number.isFinite),aligned,triangles:data.length/27,gl:renderer.gl.getError()};
 });assert.ok(glass.transparent&&glass.reused&&glass.finite&&glass.aligned&&glass.triangles>0&&glass.gl===0);
 for(const [width,height]of [[390,844],[390,680],[1280,900]]){await page.setViewportSize({width,height});await page.evaluate(()=>draw());await page.screenshot({path:`tests/enemy-vehicles-game-${width}x${height}.png`});}
 await page.setViewportSize({width:1200,height:820});
 await page.evaluate(()=>{
  document.querySelectorAll('style,link[rel=stylesheet]').forEach(el=>el.remove());
  document.body.innerHTML='<main style="padding:24px;color:#e8eff6;font:15px system-ui"><div style="color:#69d6ed;letter-spacing:3px;font-size:12px">SKYLINE / ENEMY VEHICLES</div><h1 style="font-size:26px;margin:8px 0 16px">空中敌人 · Blender 低面数模型</h1><div id="models" style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px"></div><p style="color:#93a7b9">上：斜俯视结构　下：游戏俯视轮廓（含缩小对照）</p></main>';
  document.body.style.cssText='margin:0;background:#101a27;overflow:hidden';
  const original=renderer;
  for(const [i,[type,kind]]of Object.entries(Object.entries(EnemyVehicles.types))){
   const card=document.createElement('section');card.style.cssText='background:#1b2a3a;border:1px solid #354959;border-radius:12px;overflow:hidden';
   const label=document.createElement('p');label.textContent=['飞车 / SKYPOD','飞摩托 / HOVERBIKE','球舱 / BUBBLE POD','战斗机 / STRIKER'][i];label.style.cssText='padding:0 15px';card.append(label);
   for(const [view,tilt]of [[0,.58],[1,1.012]]){
    const canvas=document.createElement('canvas');canvas.style.cssText='display:block;width:100%;height:280px';card.append(canvas);document.getElementById('models').append(card);
    const r=new Elevator3D(canvas);r.backgroundColor=[.106,.165,.227];r.topLight=[.88,.94,1];r.rearLeftColor=[.3,.65,1];r.rearRightColor=[.8,.6,.8];r.begin();
    const hx=50,hy=hx*canvas.height/canvas.width,ct=Math.cos(tilt),st=Math.sin(tilt);
    r.vp=new Float32Array([1/hx,0,0,0,0,ct/hy,-st/300,0,0,-st/hy,-ct/300,0,0,-15/hy,0,1]);
    original.begin();const e={type,x:325,y:300,hp:4,max:4,r:14,seed:0};p.x=325+Math.sin(-.4)*100;p.y=300+Math.cos(-.4)*100/1.06;EnemyVehicles.draw(e,0,0,0);
    if(view===1){const pose=monsterPose(31,0,27,-.4,.27,.27,.27);original.residentMesh('enemy-vehicle:'+kind,()=>{},pose);if(globalThis.EnemyVehicleCanopies?.[kind]?.length)original.residentMesh('enemy-vehicle-canopy:'+kind,()=>{},pose);}
    for(const [key,source]of original.residentMeshes)for(let j=0;j<source.count;j++){
     const copy=r.residentMesh(key,()=>{r.data=new Float32Array(source.data);r.count=source.data.length;},source.instances.subarray(j*13,j*13+12));copy.opacity=source.opacity??1;
    }
    r.end();
   }
  }
 });await page.screenshot({path:'tests/enemy-vehicles-models.png'});
 assert.deepEqual(errors,[]);console.log('Actual Edge/WebGL: four Blender meshes, three viewports, shared geometry/GPU buffers, finite poses, no page or GL errors.',stats);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

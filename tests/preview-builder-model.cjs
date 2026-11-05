const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:1200,height:640},deviceScaleFactor:1}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?builderlab=1');await page.waitForFunction(()=>window.HexMap?.ready&&builderRoom);
 await page.evaluate(()=>{window.requestAnimationFrame=()=>0;paused=true;});await page.waitForTimeout(100);
 const result=await page.evaluate(()=>{
  document.querySelectorAll('style,link[rel=stylesheet]').forEach(el=>el.remove());
  document.body.innerHTML='<main style="padding:28px;color:#e9e7df;font:16px system-ui"><div style="color:#f4bc4e;font-size:13px;letter-spacing:3px">BUILDER / CONSTRUCTION UNIT</div><h1 style="margin:8px 0 20px;font-size:27px">强建机器人 · 履带工程车</h1><div id="models" style="display:flex;gap:18px"></div><p style="color:#9caab1">工程黄装甲 / 履带底盘 / 防护驾驶舱 / 液压施工臂 / 前推土铲</p></main>';
  document.body.style.cssText='margin:0;background:#101b25;overflow:hidden';
  const original=renderer,results=[];
  for(const [label,yaw,working]of [['前侧 · 待机',-.55,false],['后侧 · 车体',2.6,false],['施工 · 机械臂展开',.6,true]]){
   const card=document.createElement('section');card.style.cssText='flex:0 0 calc((100% - 36px) / 3);min-width:0;box-sizing:border-box;background:#192934;border:1px solid #34434b;border-radius:12px;overflow:hidden';
   const canvas=document.createElement('canvas');canvas.style.cssText='display:block;width:100%;height:400px';card.append(canvas);
   const caption=document.createElement('p');caption.textContent=label;caption.style.cssText='margin:0;padding:16px;border-top:1px solid #34434b';card.append(caption);document.getElementById('models').append(card);
   const r=new Elevator3D(canvas);r.backgroundColor=[.098,.16,.204];r.topLight=[.9,.87,.76];r.begin();
   const hx=53,hy=hx*canvas.height/canvas.width,ct=Math.cos(.43),st=Math.sin(.43);
   r.vp=new Float32Array([1/hx,0,0,0,0,ct/hy,-st/200,0,0,-st/hy,-ct/200,0,0,-26/hy,0,1]);
   const e={hp:6,type:'builder',warn:working,buildTarget:working?tiles.find(builderTileAvailable):null};const pose=monsterPose(0,0,0,yaw);
   original.begin();original.residentMesh('builder:body',drawBuilderGeometry,pose);time=1;drawBuilderArm(e,pose);
   const head=original.residentMeshes.get('builder:tool-head'),data=head.data,before=Array.from(head.instances.slice(0,12));
   let snapshot=original.residentSnapshot();r.data.set(snapshot);r.count=snapshot.length;r.end();results.push({finite:snapshot.every(Number.isFinite),gl:r.gl.getError()});
   r.begin();r.vp=new Float32Array([1/hx,0,0,0,0,ct/hy,-st/200,0,0,-st/hy,-ct/200,0,0,-26/hy,0,1]);original.begin();original.residentMesh('builder:body',drawBuilderGeometry,pose);time=1.15;drawBuilderArm(e,pose);snapshot=original.residentSnapshot();r.data.set(snapshot);r.count=snapshot.length;r.end();
   results.at(-1).reused=head.data===data;results.at(-1).animated=before.some((v,i)=>Math.abs(v-head.instances[i])>.001);
  }return results;
 });
 assert.ok(result.every(r=>r.finite&&r.gl===0&&r.reused));assert.equal(result[0].animated,false);assert.equal(result[2].animated,true);
 await page.screenshot({path:'tests/builder-construction-model.png'});assert.deepEqual(errors,[]);console.log('Construction model: actual body/arm, three views, finite transforms, animated work pose, cached mesh reuse, WebGL clean',result);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});

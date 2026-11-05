const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,channel:'msedge'});try{
const page=await b.newPage({viewport:{width:700,height:900},deviceScaleFactor:2}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173/?avatar=cat&mapseed=cat-ik');await page.waitForFunction(()=>globalThis.CatPlayer?.ready&&HexMap.ready);
const results=await page.evaluate(()=>{
 const runs=[];
 function apply(pose,name,v){const offset=pose.bones.indexOf(name)*16,m=pose.matrices;return [0,1,2].map(row=>v.reduce((sum,n,col)=>sum+n*m[offset+col*4+row],m[offset+12+row]));}
 const err=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
 for(const fps of [30,60,120]){
  reset();paused=true;state='combat';enemies=[];spawnQueue=[];p.inv=0;time=0;draw();let maxError=0,maxSlide=0,maxNeck=0,maxRoll=0,maxPitch=0,supports=0,swings=new Set();
  for(let i=0;i<fps*3;i++){
   const before=playerBipedGaits.get(p).legs.map(l=>({foot:[...l.foot],swing:!!l.swing}));time+=1/fps;
   if(i<fps*2){p.x+=Math.sin(i/fps*5)*100/fps;p.y+=Math.cos(i/fps*5)*90/fps;}draw();const pose=CatPlayer.pose,at=pose.instance,g=playerBipedGaits.get(p);
   for(const leg of at.legs){
    const s=leg.side,j=s==='L'?1:0,target=g.legs[j];maxError=Math.max(maxError,err(apply(pose,'thigh.'+s,pose.bind['thigh.'+s].head),leg.hip),err(apply(pose,'thigh.'+s,pose.bind['thigh.'+s].tail),leg.knee),err(apply(pose,'shin.'+s,pose.bind['shin.'+s].head),leg.knee),err(apply(pose,'shin.'+s,pose.bind['shin.'+s].tail),leg.ankle));
    const sole=apply(pose,'foot.'+s,[pose.bind['foot.'+s].head[0],0,pose.bind['foot.'+s].head[2]]).map((v,k)=>v*64+(k===0?at.x:k===2?at.z:0));
    maxError=Math.max(maxError,Math.abs(sole[0]-target.foot[0]),Math.abs(sole[2]-target.foot[2]),Math.abs(sole[1]-(target.foot[1]-2)));
    if(!target.swing&&!before[j].swing){supports++;maxSlide=Math.max(maxSlide,err(sole,[before[j].foot[0],before[j].foot[1]-2,before[j].foot[2]]));}if(target.swing)swings.add(s);
   }
   maxNeck=Math.max(maxNeck,err(apply(pose,'head',pose.bind.head.head),[0,pose.bind.head.head[1]+at.bodyLift,0]));maxRoll=Math.max(maxRoll,Math.abs(at.headRoll));maxPitch=Math.max(maxPitch,Math.abs(at.headPitch));
  }
  const pose=CatPlayer.pose,m=pose.matrices,o=pose.bones.indexOf('head')*16,n=[m[o+8],m[o+9],m[o+10]],camera=[0,700/Math.hypot(700,440),440/Math.hypot(700,440)];runs.push({fps,maxError,maxSlide,maxNeck,maxRoll,maxPitch,supports,swings:[...swings],facing:n.reduce((v,x,i)=>v+x*camera[i],0),gl:renderer.gl.getError()});
 }
 return runs;
});
for(const r of results){assert.ok(r.maxError<.0001,JSON.stringify(r));assert.ok(r.maxSlide<.0001);assert.ok(r.maxNeck<1e-6);assert.ok(r.maxRoll>.02&&r.maxPitch>.005);assert.ok(r.facing>.999);assert.ok(r.supports>40&&r.swings.length===2);assert.equal(r.gl,0);}
const glow=await page.evaluate(()=>{
 const r=renderer,s=NeonPostFX.settings;Object.assign(s,{enabled:false,surfaceShader:'soft-toon'});NeonPostFX.refresh();
 function measure(value){CatPlayer.setEmission(value);r.begin();r.sceneData=null;r.sceneBuffer=null;r.backgroundColor=[0,0,0];r.topLight=[0,0,0];r.clubCyan=r.clubMagenta=0;CatPlayer.draw({x:0,y:0,z:0,size:64,time:0});r.end();const gl=r.gl,a=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,a);let sum=0,visible=0,low=0,high=0;for(let i=0;i<a.length;i+=4){const y=a[i]+a[i+1]+a[i+2];sum+=y;if(y>30)visible++;if(y>40&&y<150)low++;if(y>500)high++;}return {sum,visible,low,high,gl:gl.getError()};}
 const off=measure(0),on=measure(.65);CatPlayer.setEmission(.45);Object.assign(s,{enabled:true,surfaceShader:'original',cameraSize:.4});NeonPostFX.refresh();r.sceneKey=null;r.backgroundColor=null;reset();paused=true;state='combat';enemies=[];spawnQueue=[];p.inv=0;time=1;fallAge=landingAge=5;clearTimeout(toast.timer);$('toast').classList.remove('show');draw();return {off,on};
});assert.ok(glow.on.sum>glow.off.sum*1.2,JSON.stringify(glow));assert.ok(glow.on.low>10&&glow.on.high>10);assert.equal(glow.on.gl,0);await page.screenshot({path:'tests/player-cat-ik-emission.png'});
await page.evaluate(()=>{paused=false;togglePause();});await page.locator('#cat-emission').fill('70');assert.equal(await page.evaluate(()=>CatPlayer.emission),.7);await page.reload();await page.waitForFunction(()=>globalThis.CatPlayer?.ready&&HexMap.ready);assert.equal(await page.evaluate(()=>CatPlayer.emission),.7);assert.deepEqual(errors,[]);console.log('CAT_IK_EMISSION_PASS',JSON.stringify({results,glow}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

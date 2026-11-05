const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,channel:'msedge'});try{const page=await b.newPage({viewport:{width:700,height:900},deviceScaleFactor:2}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173/?avatar=cat');await page.waitForFunction(()=>globalThis.CharacterEyes&&CatPlayer.ready&&HexMap.ready);
const result=await page.evaluate(()=>{
 reset();paused=true;state='combat';p.inv=0;enemies=[];spawnQueue=[];Object.assign(NeonPostFX.settings,{enabled:false,cameraSize:.4});NeonPostFX.refresh();draw();const r=renderer,gl=r.gl;
 const data={};
 for(const [key,dx,dy,size]of [['left',-100,0,.5],['right',100,0,.5],['up',0,-100,.5],['down',0,100,.5],['small',0,0,.25],['large',0,0,.8]]){
  CharacterEyes.set({color:'#22ee55',size},'cat');r.begin();r.sceneData=null;r.sceneBuffer=null;r.backgroundColor=[0,0,0];CharacterGaze.update({x:325,y:300},dx||dy?{x:325+dx,y:300+dy}:null,r,1);CatPlayer.draw({x:0,y:0,z:0,size:220,time:0,cameraTilt:Math.atan2(700,440)});r.end();
  const w=gl.drawingBufferWidth,h=gl.drawingBufferHeight,pixels=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,pixels);let count=0,x=0,y=0;
  for(let i=0;i<w*h;i++){const a=i*4;if(pixels[a+1]>pixels[a]*1.6&&pixels[a+1]>pixels[a+2]*1.5&&pixels[a+1]>70){count++;x+=i%w;y+=Math.floor(i/w);}}
  data[key]={count,x:x/count,y:y/count,gl:gl.getError()};
 }
 CharacterEyes.set({color:'#62b7d6',size:.676},'cat');Object.assign(NeonPostFX.settings,{enabled:true,cameraSize:.4});NeonPostFX.refresh();r.backgroundColor=null;r.sceneKey=null;reset();paused=true;state='combat';p.inv=0;time=1;fallAge=landingAge=5;enemies=[{type:'chaser',x:p.x+200,y:p.y,r:12,hp:2,max:2,seed:0}];spawnQueue=[];clearTimeout(toast.timer);$('toast').classList.remove('show');draw();return data;
});for(const r of Object.values(result)){assert.ok(r.count>10,JSON.stringify(result));assert.equal(r.gl,0);}assert.ok(result.right.x-result.left.x>5,JSON.stringify(result));assert.ok(result.up.y-result.down.y>5,JSON.stringify(result));assert.ok(result.large.count>result.small.count*2,JSON.stringify(result));assert.deepEqual(errors,[]);await page.screenshot({path:'tests/player-cat-dynamic-eyes.png'});console.log('CAT_DYNAMIC_EYES_PASS',JSON.stringify(result));}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/?promo=1&mapseed=player-light');
  await page.waitForFunction(()=>globalThis.NeonPostFX&&globalThis.ElectricEditor?.preparing);
  const result=await page.evaluate(()=>{
   paused=true;document.getElementById('promo-panel').hidden=true;
   Object.assign(NeonPostFX.settings,{enabled:false,playerLight:true});NeonPostFX.refresh();
   const gl=renderer.gl;draw(0);const light={...renderer.playerLight};
   function pixels(on){NeonPostFX.settings.playerLight=on;renderer.playerLight=on?{...light,strength:NeonPostFX.settings.playerLightStrength,color:NeonPostFX.settings.playerLightColor}:null;renderer.end();const a=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,a);return a;}
   const off=pixels(false),on=pixels(true);let brighter=0,sum=0;
   for(let i=0;i<on.length;i+=4){const d=on[i]+on[i+1]+on[i+2]-off[i]-off[i+1]-off[i+2];if(d>6)brighter++;sum+=Math.max(0,d);}
   NeonPostFX.settings.playerLightColor='#ff0000';const red=pixels(true);
   NeonPostFX.settings.playerLightColor='#0000ff';const blue=pixels(true);let redShift=0,blueShift=0;
   for(let i=0;i<red.length;i+=4){redShift+=red[i]-blue[i];blueShift+=blue[i+2]-red[i+2];}
   NeonPostFX.settings.playerLightColor=NeonPostFX.defaults.playerLightColor;
   // Isolate zero/off equality from city fog, animated windows and additive VFX.
   const c=document.createElement('canvas');c.style='width:390px;height:844px';document.body.append(c);
   const probe=new Elevator3D(c),pg=probe.gl;probe.begin();probe.box(0,0,0,180,8,180,'#707070');
   const sample=source=>{probe.playerLight=source;probe.end();const a=new Uint8Array(pg.drawingBufferWidth*pg.drawingBufferHeight*4);pg.readPixels(0,0,pg.drawingBufferWidth,pg.drawingBufferHeight,pg.RGBA,pg.UNSIGNED_BYTE,a);return a;};
   const zero=sample({x:0,y:85,z:0,range:190,strength:0,color:'#ffdba3'}),offAgain=sample(null);let zeroDifference=0;
   for(let i=0;i<offAgain.length;i++)zeroDifference=Math.max(zeroDifference,Math.abs(offAgain[i]-zero[i]));c.remove();
   NeonPostFX.settings.playerLight=true;NeonPostFX.settings.playerLightStrength=NeonPostFX.defaults.playerLightStrength;draw(0);const first={...renderer.playerLight},x=p.x,y=p.y;p.x+=54;p.y+=27;draw(0);const moved={...renderer.playerLight};p.x=x;p.y=y;
   NeonPostFX.reset();draw(0);
   return {redShift,blueShift,brighter,sum,first,moved,zeroDifference,error:gl.getError(),position:[...gl.getUniform(renderer.program,renderer.playerLightUniforms[0])],residentPosition:[...gl.getUniform(renderer.residentProgram,renderer.residentLightLocations.playerLightPosition)]};
  });
  assert.ok(result.redShift>1000&&result.blueShift>1000);assert.ok(result.brighter>100);assert.ok(result.zeroDifference<=1);assert.equal(result.error,0);
  assert.equal(result.moved.x-result.first.x,54);assert.ok(Math.abs(result.moved.z-result.first.z-27*1.06)<.001);
  assert.deepEqual(result.position,result.residentPosition);
  await page.screenshot({path:'tests/player-light-on-390.png'});
  await page.evaluate(()=>{NeonPostFX.settings.playerLight=false;NeonPostFX.refresh();draw(0);});
  await page.screenshot({path:'tests/player-light-off-390.png'});
  await page.locator('#postfx-panel > summary').click();
  await page.locator('.postfx-group').filter({has:page.locator('[data-setting="playerLight"]')}).locator('summary').click();
  await page.locator('[data-setting="playerLight"]').check();
  for(const [key,value]of [['playerLightStrength','3.1'],['playerLightRange','230'],['playerLightHeight','100']])await page.locator(`[data-setting="${key}"]`).fill(value);
  await page.locator('[data-setting="playerLightColor"]').fill('#55aaff');
  await page.screenshot({path:'tests/player-light-controls-390.png'});
  await page.reload();await page.waitForFunction(()=>globalThis.NeonPostFX&&globalThis.ElectricEditor?.preparing);
  assert.deepEqual(await page.evaluate(()=>['playerLight','playerLightStrength','playerLightRange','playerLightHeight','playerLightColor'].map(k=>NeonPostFX.settings[k])),[true,3.1,230,100,'#55aaff']);
  await page.evaluate(()=>{NeonPostFX.reset();const e=renderer.gl.getExtension('WEBGL_lose_context');globalThis.lightRestore=e;e.loseContext();});
  await page.waitForFunction(()=>!renderer.ready);await page.evaluate(()=>lightRestore.restoreContext());await page.waitForFunction(()=>renderer.ready);
  assert.equal(await page.evaluate(()=>{draw(0);return renderer.gl.getError();}),0);
  assert.deepEqual(errors,[]);console.log('Player point light: GPU brightness and red/blue color pixels, zero/off within one GPU color step, movement, dynamic/resident uniforms, UI persistence/reset and context restore passed',result);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});




const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(/GL_INVALID|ERROR: 0:/.test(m.text()))errors.push(m.text());});
  await page.goto('http://127.0.0.1:4173/?promo=1&mapseed=surface-shader');
  await page.waitForFunction(()=>globalThis.NeonPostFX&&globalThis.ElectricEditor?.preparing);
  await page.evaluate(()=>{paused=true;document.getElementById('promo-panel').hidden=true;});
  const probe=await page.evaluate(()=>{
   const canvas=document.createElement('canvas');canvas.style='width:390px;height:600px';document.body.append(canvas);const r=new Elevator3D(canvas),s=NeonPostFX.settings,saved={...s};Object.assign(s,{enabled:false,enemyMidtone:0});
   r.begin();r.setOutlineGroup(0);r.box(-110,30,0,50,60,50,'#6b6236');r.setOutlineGroup(.5);r.box(-40,30,0,50,60,50,'#6b6236');
   const pose=x=>[1,0,0,x,0,1,0,0,0,0,1,0];r.residentMesh('midtone-probe',()=>r.box(0,30,0,50,60,50,'#6b6236'),pose(40));r.setOutlineGroup(1);r.residentMesh('midtone-probe',()=>{},pose(110));r.setOutlineGroup(0);
   const pixels=()=>{r.end();const a=new Uint8Array(canvas.width*canvas.height*4);r.gl.readPixels(0,0,canvas.width,canvas.height,r.gl.RGBA,r.gl.UNSIGNED_BYTE,a);return a;};
   const results=[];for(const style of ['original','soft-toon']){s.surfaceShader=style;s.enemyMidtone=0;const before=pixels();s.enemyMidtone=25;const after=pixels();let brighter=0,darker=0;for(let i=0;i<before.length;i+=4){const d=after[i]+after[i+1]+after[i+2]-before[i]-before[i+1]-before[i+2];if(d>0)brighter++;if(d<0)darker++;}s.enemyMidtone=0;const restore=pixels();results.push({style,brighter,darker,restored:before.every((v,i)=>v===restore[i])});}
   Object.assign(s,saved);canvas.remove();return {results,error:r.gl.getError()};
  });
  for(const r of probe.results){assert.ok(r.brighter>1000,JSON.stringify(probe));assert.equal(r.darker,0);assert.ok(r.restored);}assert.equal(probe.error,0);
  await page.locator('#postfx-panel > summary').click();await page.locator('.postfx-group').filter({has:page.locator('[data-setting="enemyMidtone"]')}).locator('summary').click();
  await page.locator('[data-setting="enemyMidtone"]').fill('40');assert.equal(await page.evaluate(()=>NeonPostFX.settings.enemyMidtone),40);
  await page.reload();await page.waitForFunction(()=>globalThis.ElectricEditor?.preparing);assert.equal(await page.evaluate(()=>NeonPostFX.settings.enemyMidtone),40);
  await page.evaluate(()=>{NeonPostFX.reset();paused=true;document.getElementById('promo-panel').hidden=true;ElectricEditor.run();if(paused)togglePause();p.hp=p.maxHp=999;});await page.waitForFunction(()=>state==='combat');await page.waitForTimeout(3500);
  await page.evaluate(()=>{paused=true;NeonPostFX.settings.enemyMidtone=0;draw(0);});await page.screenshot({path:'tests/enemy-midtone-before.png'});
  await page.evaluate(()=>{NeonPostFX.settings.enemyMidtone=25;draw(0);});await page.screenshot({path:'tests/enemy-midtone-after.png'});
  assert.deepEqual(errors,[]);console.log('Enemy midtone GPU / both shaders / zero restoration / UI persistence passed',probe);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

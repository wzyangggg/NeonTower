const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const root=path.resolve('dist'),server=http.createServer(async(req,res)=>{try{const name=new URL(req.url,'http://local').pathname,file=path.resolve(root,'.'+(name==='/'?'/index.html':name));if(!file.startsWith(root+path.sep))throw Error();const data=await fs.readFile(file);res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.mp3':'audio/mpeg'})[path.extname(file)]||'application/octet-stream');res.end(data);}catch{res.statusCode=404;res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port,browser=await chromium.launch({headless:true,channel:'msedge'}),errors=[],report=[];
 try{
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});page.on('pageerror',e=>errors.push(e.message));await page.goto(origin);await page.waitForTimeout(200);
 const models=await page.evaluate(()=>WEAPON_MODELS.map(m=>({id:m.id,name:m.name,tier:m.tier})));
 for(const m of models){
 const result=await page.evaluate(m=>{
  sound=false;reset();state='combat';paused=false;timedRoom=null;spawnQueue=[{type:'eye',side:0}];spawnTimer=999;armor=shoes=drone=null;p.x=325;p.y=390;p.inv=999;floor=5;time=3;
  tiles=[];for(let y=-4;y<=6;y++)for(let x=-6;x<=6;x++)tiles.push({x,y});renderer.sceneKey=null;
  weapon=createWeaponModel(m.id);weapon.critChance=0;shootTimer=999;
  enemies=[{x:325,y:180},{x:255,y:175},{x:395,y:175},{x:210,y:230},{x:440,y:230},{x:325,y:115},{x:385,y:110}].map((q,i)=>({...q,type:'eye',homeX:q.x,homeY:q.y,hp:99999,max:99999,r:14,t:0,fire:999,terrainStun:999,seed:i}));
  shots=[];shootWeapon(-Math.PI/2);shootTimer=999;const frames=m.id==='sword_t5'?24:m.id.startsWith('laser')?4:m.id.startsWith('sniper')?8:16;for(let i=0;i<frames;i++)step(.01);
  if(m.id.startsWith('rocket')){const s=shots.find(s=>s.blastRadius);if(s){s.x=325;s.y=180;explodeFriendlyRocket(s,enemies);explosionFX.at(-1).t=.14;}}
  if(m.id==='seeker_t5'){const s=shots.find(s=>s.blastRadius);s.x=325;s.y=180;explodeFriendlyRocket(s,enemies);explosionFX.at(-1).t=.2;}
  paused=true;$('toast').classList.remove('show');$('overlay').style.display='none';$('pause-panel').hidden=true;$('equipment-test').hidden=true;$('viewport').classList.remove('falling','paused');updateUI();draw();
  let label=document.getElementById('model-label');if(!label){label=document.createElement('div');label.id='model-label';label.style.cssText='position:fixed;left:16px;bottom:76px;background:#0c172ee8;border:1px solid #75dfff;border-radius:8px;padding:9px 13px;color:white;font:15px sans-serif;z-index:100;pointer-events:none';document.body.appendChild(label);}label.textContent='T'+m.tier+' '+m.name;
  return {id:m.id,tier:weapon.tier,itemId:weapon.itemId,shots:shots.length,finite:renderer.data.subarray(0,renderer.count).every(Number.isFinite),gl:renderer.gl.getError(),vertices:renderer.count/9};
 },m);assert(result.finite&&result.gl===0);report.push(result);
 await page.screenshot({path:path.join(__dirname,'weapon-model-'+m.id+'.png')});
 }
 // Exercise the real F2 controls and fixed-tier selector, then the real shop transaction.
 await page.evaluate(()=>{paused=false;$('equipment-test').hidden=true;openEquipmentTest();});
 await page.selectOption('#test-slot','weapon');await page.selectOption('#test-item','rocket_t5');assert(await page.locator('#test-tier').isDisabled());assert.equal(await page.locator('#test-tier').inputValue(),'5');await page.click('#test-equip');assert.equal(await page.evaluate(()=>weapon.itemId),'rocket_t5');await page.click('#test-close');
 await page.evaluate(()=>{state='upgrade';cash=1000;shopLevel=5;pendingEquipment=null;rollShop();shopItems[0]={...weaponModelShopItem(),price:50,sold:false};renderShop();});
 const saved=await page.evaluate(()=>({id:shopItems[0].equipment.itemId,damage:shopItems[0].equipment.damage,cash}));
 await page.evaluate(()=>buyShopItem(0));await page.click('#equipment-confirm');assert.equal(await page.evaluate(()=>weapon.itemId),saved.id);assert.equal(await page.evaluate(()=>weapon.damage),saved.damage);assert.equal(await page.evaluate(()=>cash),saved.cash-50);
 for(const size of [{width:390,height:680},{width:1280,height:900}]){await page.setViewportSize(size);await page.evaluate(()=>{state='combat';paused=true;weapon=createWeaponModel('laser_t5');$('overlay').style.display='none';shots=[];shootWeapon(-Math.PI/2);draw();});await page.screenshot({path:path.join(__dirname,`weapon-size-${size.width}x${size.height}.png`)});}
 assert.deepEqual(errors,[]);await fs.writeFile(path.join(__dirname,'weapon-evolution-browser-results.json'),JSON.stringify({models:report,errors,f2:true,transaction:true},null,2));console.log('Real Edge/WebGL: all 43 models rendered, finite geometry/GL, F2 fixed tiers, actual shop transaction and mobile/wide layouts passed');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});

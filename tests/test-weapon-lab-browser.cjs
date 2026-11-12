const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const root=path.resolve('dist'),server=http.createServer(async(req,res)=>{try{const name=new URL(req.url,'http://local').pathname,file=path.resolve(root,'.'+(name==='/'?'/index.html':name));if(!file.startsWith(root+path.sep))throw Error();const data=await fs.readFile(file);res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.mp3':'audio/mpeg'})[path.extname(file)]||'application/octet-stream');res.end(data);}catch{res.statusCode=404;res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port,browser=await chromium.launch({headless:true,channel:'msedge'}),errors=[],report=[];
 try{
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});page.on('pageerror',e=>errors.push(e.message));await page.goto(origin+'/?weaponlab=1');await page.waitForTimeout(200);
 assert.equal(await page.title(),'武器测试场 · 地狱电梯');
 assert.equal(await page.locator('#weapon-model option').count(),43);
 assert(await page.evaluate(()=>weaponLab.active&&weaponLab.god&&testMode&&state==='combat'&&tiles.length===143));
 await page.selectOption('#weapon-health','30');
 const result=await page.evaluate(()=>{paused=false;for(let i=0;i<1200;i++)step(.01);paused=true;return {state,kills,cash,targets:weaponLab.targets.length,alive:enemies.length,damage:weaponLab.damage,elapsed:weaponLab.elapsed,hp:p.hp,finite:renderer.data.subarray(0,renderer.count).every(Number.isFinite)};});
 console.log('Sustained shooting',result);assert.equal(result.state,'combat');assert(result.kills>0&&result.targets===9&&result.damage>0);assert.equal(result.cash,0);assert.equal(result.hp,9);await page.evaluate(()=>{paused=false;weaponLab.firing=false;shots=[];for(let i=0;i<60;i++)step(.01);paused=true;draw();});assert(await page.evaluate(()=>enemies.length>0));
 await page.screenshot({path:path.join(__dirname,'weapon-lab-default.png')});
 for(const [pattern,count]of [['single',1],['line',4],['moving',5],['crowd',9]]){await page.selectOption('#weapon-pattern',pattern);assert.equal(await page.evaluate(()=>weaponLab.targets.length),count);}
 await page.selectOption('#weapon-model','boomerang_t5');assert.equal(await page.evaluate(()=>weapon.itemId),'boomerang_t5');
 await page.click('#weapon-next');assert.notEqual(await page.evaluate(()=>weapon.itemId),'boomerang_t5');await page.click('#weapon-prev');assert.equal(await page.evaluate(()=>weapon.itemId),'boomerang_t5');
 await page.evaluate(()=>{paused=false;weaponLab.firing=false;shootTimer=0;shots=[];step(.02);});assert.equal(await page.evaluate(()=>shots.length),0);
 await page.click('#weapon-once');assert.equal(await page.evaluate(()=>shots.filter(s=>s.boomerang).length),5);
 await page.selectOption('#weapon-model','laser_t5');await page.evaluate(()=>{weaponLab.firing=true;paused=false;for(let i=0;i<8;i++)step(.01);paused=true;draw();});await page.screenshot({path:path.join(__dirname,'weapon-lab-laser.png')});
 await page.click('#weapon-more');await page.selectOption('#weapon-model','pistol_t3');await page.click('#weapon-evolve');assert.equal(await page.evaluate(()=>weapon.growth.stage),1);await page.click('#weapon-evolve');assert.equal(await page.evaluate(()=>weapon.growth.stage),2);assert(await page.locator('#weapon-evolve').isDisabled());await page.click('#weapon-hit');assert.equal(await page.evaluate(()=>weapon.growth.stage),1);assert(await page.evaluate(()=>weaponLab.god));
 await page.click('#weapon-restart');assert.equal(await page.evaluate(()=>weapon.growth.stage),0);
 await page.click('#weapon-bullets');assert(await page.evaluate(()=>bullets.length>0));
 await page.selectOption('#weapon-model','rocket_t5');await page.click('#weapon-bullets');await page.evaluate(()=>{shootWeapon(0);const s=shots.find(s=>s.blastRadius);explodeFriendlyRocket(s,enemies);});assert.equal(await page.evaluate(()=>bullets.length),0);
 await page.selectOption('#weapon-background','original');assert.equal(await page.evaluate(()=>StreetScene.enabled),false);await page.selectOption('#weapon-background','roof');
 for(const size of [{width:390,height:680},{width:1280,height:900}]){await page.setViewportSize(size);await page.screenshot({path:path.join(__dirname,`weapon-lab-${size.width}x${size.height}.png`)});const box=await page.locator('.weapon-panel').boundingBox();assert(box.x>=0&&box.x+box.width<=size.width+1&&box.y>=0&&box.y+box.height<=size.height+1);}
 await page.click('#weapon-more');await page.evaluate(()=>{paused=false;});await page.click('#test-open');await page.selectOption('#test-item','sniper_t5');await page.click('#test-equip');await page.click('#test-close');assert.equal(await page.evaluate(()=>weapon.itemId),'sniper_t5');assert.equal(await page.evaluate(()=>state),'combat');
 await page.goto(origin);assert.equal(await page.evaluate(()=>weaponLab?.active||false),false);assert(await page.locator('a[href="?weaponlab=1"]').isVisible());assert.equal(await page.evaluate(()=>state),'menu');
 assert.deepEqual(errors,[]);console.log('Weapon lab: 43 models, fixed 13x11, actual damage/kills/respawn without rewards or settlement, layouts, single shot, pause/switch, growth/hurt/reset, hostile bullets/shock, F2 and normal menu isolation passed',result);
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});

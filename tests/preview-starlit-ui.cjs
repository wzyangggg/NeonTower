const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const root=path.resolve('dist'),server=http.createServer(async(req,res)=>{try{const file=path.resolve(root,'.'+(new URL(req.url,'http://local').pathname==='/'?'/index.html':new URL(req.url,'http://local').pathname));if(!file.startsWith(root+path.sep))throw Error();res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.png':'image/png','.mp3':'audio/mpeg'})[path.extname(file)]||'application/octet-stream');res.end(await fs.readFile(file));}catch{res.statusCode=404;res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,channel:'msedge'}),errors=[],report=[];
 try{
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>typeof renderer!=='undefined'&&renderer.ready);
 for(const [width,height]of [[390,844],[390,680],[1280,900]]){
 await page.setViewportSize({width,height});await page.screenshot({path:`tests/starlit-menu-${width}x${height}.png`});
 const menu=await page.locator('#start').boundingBox();assert(menu.y>0&&menu.y+menu.height<height);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.locator('#skill-wallet').click();await page.screenshot({path:`tests/starlit-talents-${width}x${height}.png`});const save=await page.locator('#skill-save').boundingBox();assert(save.y+save.height<=height);await page.locator('#skill-close').click();report.push({width,height,menuVisible:true,skillFooterVisible:true});}
 await page.setViewportSize({width:390,height:844});await page.locator('#start').click();await page.waitForFunction(()=>state==="combat",{timeout:15000});await page.waitForTimeout(700);await page.evaluate(()=>{paused=true;draw();});await page.screenshot({path:'tests/starlit-combat-390x844.png'});
 await page.evaluate(()=>{cash=999;state='upgrade';rollShop();renderShop();updateUI();});await page.screenshot({path:'tests/starlit-shop-390x844.png'});const before=await page.evaluate(()=>cash);await page.locator('#shop-expand').click();assert(await page.evaluate(()=>cash)<before);await page.locator('#shop-reroll').click();await page.locator('#shop-leave').click();
 await page.goto('http://127.0.0.1:'+server.address().port+'/hex-city.html');await page.waitForFunction(()=>typeof renderer!=='undefined'&&renderer.ready);await page.locator('#start').click();await page.waitForFunction(()=>state==='combat');await page.waitForTimeout(400);await page.evaluate(()=>{paused=true;draw();});assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);await page.screenshot({path:'tests/starlit-hex-390x844.png'});
 assert.deepEqual(errors,[]);console.log(JSON.stringify({report,errors,shopInteraction:'expansion, reroll, leave passed',hex:'loaded, started, GL error 0'},null,2));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

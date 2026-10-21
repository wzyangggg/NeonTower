const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path');
(async()=>{
 const root=path.resolve('dist'),server=http.createServer(async(req,res)=>{
  try{const file=path.resolve(root,'.'+(req.url==='/'?'/index.html':req.url.split('?')[0]));if(!file.startsWith(root+path.sep))throw Error();const data=await fs.readFile(file);res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.png':'image/png','.mp3':'audio/mpeg'})[path.extname(file)]||'application/octet-stream');res.end(data);}catch{res.statusCode=404;res.end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/');
  await page.click('#start');await page.waitForTimeout(1600);

  await page.evaluate(()=>{
   reset();paused=false;state='survival';floor=4;timedRoom=null;enemies=[];spawnQueue=[];turrets=[];p.x=400;p.y=400;p.inv=0;
   equipItem('armor',createArmor('plume'));p.featherEligible=true;finishSurvival();paused=true;draw();
  });
  if(await page.locator('#toast').isVisible())throw Error('old top toast remains visible');
  const initial=await page.locator('.settlement-popup').evaluate(e=>(e=document.querySelector('.settlement-popup'),{text:e.textContent,opacity:getComputedStyle(e).opacity,font:getComputedStyle(e).fontSize,top:e.getBoundingClientRect().top}));
  if(initial.text.includes('$28')||!initial.text.includes('攻速')||initial.font!=='14px'||initial.opacity!=='1')throw Error(JSON.stringify(initial));
  await page.screenshot({path:path.join(__dirname,'settlement-head-start.png')});
  await page.evaluate(()=>{paused=false;step(1);paused=true;draw();});
  const middle=await page.locator('.settlement-popup').evaluate(e=>(e=document.querySelector('.settlement-popup'),{opacity:getComputedStyle(e).opacity,top:e.getBoundingClientRect().top}));
  if(middle.opacity!=='0.5'||Math.abs(initial.top-middle.top-22)>1)throw Error(JSON.stringify(middle));
  await page.screenshot({path:path.join(__dirname,'settlement-head-mid.png')});
  await page.evaluate(()=>{paused=false;step(1);paused=true;draw();});
  const second=await page.locator('.settlement-popup').evaluate(e=>(e=document.querySelector('.settlement-popup'),{text:e.textContent,opacity:getComputedStyle(e).opacity}));
  if(!second.text.includes('$28')||second.text.includes('攻速')||second.opacity!=='1'||await page.evaluate(()=>state)!=='stageClear')throw Error(JSON.stringify(second));
  await page.screenshot({path:path.join(__dirname,'settlement-head-second.png')});
  await page.evaluate(()=>{paused=false;step(1.999);paused=true;draw();});
  if(await page.evaluate(()=>state)!=='stageClear')throw Error('last message ended early');
  await page.evaluate(()=>{paused=false;step(.001);paused=true;draw();});
  if(await page.locator('.settlement-popup').count())throw Error('popup persists after final display');
  if(await page.evaluate(()=>state)!=='upgrade')throw Error('shop did not open');
  if(errors.length)throw Error(errors.join('\n'));console.log(JSON.stringify({initial,middle,second,errors}));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

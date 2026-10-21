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
  await page.evaluate(()=>{paused=true;state='combat';equipItem('shoes',createShoes('ufo'));p.x=325;p.y=350;p.inv=0;time=.65;enemies=[];shots=[];spawnQueue=[];bullets=[{x:245,y:390,vx:100,vy:0,r:4,life:9,c:'#ff795d'},{x:405,y:350,vx:-100,vy:0,r:4,life:9,c:'#ff795d'}];clearTimeout(toast.timer);$('toast').classList.remove('show');$('pause-panel').hidden=true;$('viewport').classList.remove('paused');draw();});
  await page.screenshot({path:path.join(__dirname,'ufo-field-preview.png')});
  await page.evaluate(()=>{time=1.2;draw();});
  await page.screenshot({path:path.join(__dirname,'ufo-field-wave-preview.png')});
  if(errors.length)throw Error(errors.join('\n'));console.log('UFO field browser preview: 390x844, two wave phases, no script errors');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

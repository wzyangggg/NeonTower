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

  const result=await page.evaluate(()=>{
   reset();paused=true;state='combat';floor=5;timedRoom=null;spawnQueue=[];chaserSpawned=24;shootTimer=999;turrets=[];p.inv=999;time=0;
   for(const [i,type]of ['eye','skull','missile','moth','laser'].entries())spawn({type,side:i%3});
   const initial=enemies.map(e=>({type:e.type,x:e.x,y:e.y}));
   clearTimeout(toast.timer);$('toast').classList.remove('show');$('pause-panel').hidden=true;$('viewport').classList.remove('paused');
   draw();return initial;
  });
  await page.screenshot({path:path.join(__dirname,'ranged-movement-before.png')});
  const moved=await page.evaluate(()=>{
   paused=false;for(let i=0;i<240;i++)step(1/60);paused=true;draw();
   return enemies.map(e=>({type:e.type,x:e.x,y:e.y}));
  });
  await page.screenshot({path:path.join(__dirname,'ranged-movement-after.png')});
  for(const e of moved){const initial=result.find(q=>q.type===e.type);if(Math.hypot(initial.x-e.x,initial.y-e.y)<25)throw Error(e.type+' failed visible movement');}
  console.log(JSON.stringify({before:result,after:moved}));
  if(errors.length)throw Error(errors.join('\n'));console.log('Ranged movement browser preview: five enemy types over four combat seconds, 390x844, no script errors');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

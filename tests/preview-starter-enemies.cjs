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
   reset();paused=true;state='combat';floor=2;timedRoom=null;spawnQueue=[];chaserSpawned=24;shootTimer=999;turrets=[];enemies=[];p.inv=999;p.x=325;p.y=400;time=1;
   for(const [i,type]of ['crawler','spitter'].entries()){spawn({type,side:i});const e=enemies.at(-1);e.x=e.homeX=230+i*190;e.y=e.homeY=260;e.fire=99;}
   clearTimeout(toast.timer);$('toast').classList.remove('show');$('toast').style.display='none';updateUI();$('pause-panel').hidden=true;$('viewport').classList.remove('paused');
   draw();const before=enemies.map(e=>({type:e.type,x:e.x,y:e.y}));
   paused=false;for(let i=0;i<60;i++)step(1/60);paused=true;draw();
   const after=enemies.map(e=>({type:e.type,x:e.x,y:e.y}));
   bullets=[];fire(enemies.find(e=>e.type==='spitter'));for(const b of bullets){b.x+=b.vx*.65;b.y+=b.vy*.65;}draw();
   return {before,after,bullets:bullets.map(b=>Math.hypot(b.vx,b.vy)),gl:renderer.gl.getError()};
  });
  await page.screenshot({path:path.join(__dirname,'starter-enemies-390x844.png')});const arena=await page.locator('canvas').first().boundingBox();if(arena)await page.screenshot({path:path.join(__dirname,'starter-enemies-arena.png'),clip:arena});
  await page.setViewportSize({width:1280,height:900});await page.screenshot({path:path.join(__dirname,'starter-enemies-1280x900.png')});
  if(result.gl!==0||result.bullets.length!==1||result.bullets.some(v=>Math.abs(v-85)>.001)||errors.length)throw Error(JSON.stringify({result,errors}));
  console.log('Starter enemy Edge/WebGL: independent models, one-second movement, slow volley, two viewports, no GL/script errors',JSON.stringify(result));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

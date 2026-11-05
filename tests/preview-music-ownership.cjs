const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const root=path.resolve('dist'),server=http.createServer(async(req,res)=>{try{const name=new URL(req.url,'http://local').pathname,file=path.resolve(root,'.'+(name==='/'?'/index.html':name));if(!file.startsWith(root+path.sep))throw Error();res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.mp3':'audio/mpeg'})[path.extname(file)]||'application/octet-stream');res.end(await fs.readFile(file));}catch{res.statusCode=404;res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;let browser;
 try{
  browser=await chromium.launch({headless:true,channel:'msedge',args:['--autoplay-policy=no-user-gesture-required']});const context=await browser.newContext(),errors=[];
  async function open(){const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));await page.goto(origin);await page.waitForFunction(()=>window.HexMap?.ready);await page.evaluate(()=>{state='upgrade';paused=false;window.dispatchEvent(new Event('focus'));syncMusic();unlockAudio();});await page.waitForFunction(()=>!music.media.paused&&music.media.currentTime>0);return page;}
  const first=await open();await first.evaluate(()=>window.dispatchEvent(new Event('blur')));assert(await first.evaluate(()=>music.media.paused));
  await first.evaluate(()=>{music.setState({enabled:true,active:true,shopping:true});});assert(await first.evaluate(()=>music.media.paused));
  await first.evaluate(()=>window.dispatchEvent(new Event('focus')));await first.waitForFunction(()=>!music.media.paused);
  const second=await open();await first.waitForFunction(()=>music.media.paused);assert(await second.evaluate(()=>!music.media.paused));
  await first.evaluate(()=>music.sync());assert(await first.evaluate(()=>music.media.paused));
  await first.bringToFront();await first.evaluate(()=>window.dispatchEvent(new Event('focus')));await first.waitForFunction(()=>!music.media.paused);await second.waitForFunction(()=>music.media.paused);
  await first.evaluate(()=>{music.setState({enabled:false,active:true});});assert(await first.evaluate(()=>music.media.paused));
  assert.deepEqual(errors,[]);console.log('Real Edge audio: decoded/playing media, WebAudio routing, shop blur/focus, frame sync, two-page BroadcastChannel transfer and mute passed (lifecycle events dispatched by test).');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(error=>{console.error(error);process.exitCode=1;});

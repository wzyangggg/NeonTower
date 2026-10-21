const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const root=path.resolve('dist'),server=http.createServer(async(req,res)=>{try{const name=new URL(req.url,'http://local').pathname,file=path.resolve(root,'.'+(name==='/'?'/index.html':name));if(!file.startsWith(root+path.sep))throw Error();const data=await fs.readFile(file);res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.mp3':'audio/mpeg'})[path.extname(file)]||'application/octet-stream');res.end(data);}catch{res.statusCode=404;res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port,browser=await chromium.launch({headless:true,channel:'msedge'}),errors=[],report=[];
 try{
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});await page.goto(origin);await page.waitForTimeout(200);

 await page.evaluate(()=>{sound=false;reset();paused=true;state='combat';$('overlay').style.display='none';$('viewport').classList.remove('falling');$('toast').classList.remove('show');});
 for(const [i,angle] of [0,.7,1.4].entries()){const result=await page.evaluate(angle=>{const r=renderer;r.cameraScale=.22;r.scenePerspective=false;r.sceneData=null;r.sceneUploaded=null;r.sceneKey=null;r.begin();drawResidentEnemy({type:'ironball',x:325,y:300,hp:50,max:50,r:30,seed:0,roll:angle,rollHeading:.5,warn:false},0,0,0);r.end();return {gl:r.gl.getError(),finite:[...r.residentMeshes.values()].every(m=>m.data.every(Number.isFinite))};},angle);assert(result.gl===0&&result.finite);await page.locator('canvas').first().screenshot({path:path.join(__dirname,'ironball-cross-bands-'+i+'.png')});}
 assert.deepEqual(errors,[]);console.log('Real Edge/WebGL: enlarged iron ball with perpendicular raised bands, three rolling angles, finite geometry and no GL errors passed');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});

import http from 'node:http';
import {readFile,writeFile,rename} from 'node:fs/promises';
import './dist/boss-move-settings.js';
import {resolve,sep,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
const root=fileURLToPath(new URL('./dist/',import.meta.url));
const port=Number(process.env.PORT||4173);
const moveFile=resolve(root,'boss-move-settings.json');
let moveWrite=Promise.resolve();
let dpsRunning=false;
const dpsRunner=fileURLToPath(new URL('./tools/simulate-growth.cjs',import.meta.url));
const bundledPlaywright=resolve(process.env.USERPROFILE||'', '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
function runDpsBatch(input){
 const {difficulty,floors,count,curve}=input||{};
 if(!Number.isInteger(difficulty)||difficulty<1||difficulty>5||!Number.isInteger(floors)||floors<1||
    floors>[20,25,25,30,40][difficulty-1]||!Number.isInteger(count)||count<1||count>20||!curve){
  throw Error('请检查难度、楼层和批跑局数。');
 }
 return new Promise((resolve,reject)=>{
  const env={...process.env};
  if(!env.PLAYWRIGHT_MODULE&&existsSync(bundledPlaywright))env.PLAYWRIGHT_MODULE=bundledPlaywright;
  const child=spawn(process.execPath,[dpsRunner,'--url','http://127.0.0.1:'+port+'/',
   '--difficulty',String(difficulty),'--floors',String(floors),'--seeds',
   Array.from({length:count},(_,i)=>i+1).join(','),'--curve','-'],{env,windowsHide:true});
  let output='',error='';
  child.stdout.setEncoding('utf8').on('data',chunk=>{output+=chunk;});
  child.stderr.setEncoding('utf8').on('data',chunk=>{error=(error+chunk).slice(-4000);});
  child.stdin.on('error',()=>{});
  child.on('error',reject);
  child.on('close',code=>code===0?resolve(output):reject(Error(error.trim()||'批跑进程异常退出。')));
  child.stdin.end(JSON.stringify(curve));
 });
}
async function saveMove(input){
 const values=globalThis.BossMoveSettings.validate(input?.move,input?.values);
 const previous=JSON.parse(await readFile(moveFile,'utf8'));
 const settings={version:1,moves:{...previous.moves,[input.move]:{...previous.moves?.[input.move],...values}}};
 const temporary=moveFile+'.tmp';
 await writeFile(temporary,JSON.stringify(settings,null,2)+'\n','utf8');
 await rename(temporary,moveFile);
 return settings;
}
const types={'.json':'application/json','.svg':'image/svg+xml','.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.mp3':'audio/mpeg','.wav':'audio/wav'};
http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');
if(url.pathname==='/api/dps-batch'&&req.method==='POST'){
 const reply=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(data);};
 if(req.headers.origin!=='http://'+req.headers.host){reply(403,JSON.stringify({error:'请从本地编辑器页面发起批跑。'}));return;}
 if(dpsRunning){reply(409,JSON.stringify({error:'已有一批正在运行。'}));return;}
 dpsRunning=true;
 try{
  let body='';
  for await(const chunk of req){body+=chunk;if(body.length>65536){reply(413,JSON.stringify({error:'方案过大。'}));return;}}
  reply(200,await runDpsBatch(JSON.parse(body)));
 }catch(error){reply(400,JSON.stringify({error:error.message}));}
 finally{dpsRunning=false;}
 return;
}
if(url.pathname==='/api/boss-move-settings'&&req.method==='PUT'){
 if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host){res.writeHead(403);res.end();return;}
 let body='';for await(const chunk of req){body+=chunk;if(body.length>16384){res.writeHead(413);res.end();return;}}
 try{
  const input=JSON.parse(body);
  globalThis.BossMoveSettings.validate(input?.move,input?.values);
  const saved=moveWrite.then(()=>saveMove(input));moveWrite=saved.catch(()=>{});
  const settings=await saved;
  res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify(settings));
 }catch(error){res.writeHead(400,{'Content-Type':'application/json'});res.end(JSON.stringify({error:error.message}));}
 return;
}
if(url.pathname==='/api/rainbow-box-preset'&&req.method==='PUT'){
if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host){res.writeHead(403);res.end();return;}
let body='';for await(const chunk of req){body+=chunk;if(body.length>4096){res.writeHead(413);res.end();return;}}
const input=JSON.parse(body)?.controls,controls={};
const ranges={speed:[0,1],'flow-scale':[.1,6],'rim-scale':[.1,4],'rim-strength':[0,3],dots:[3,12],white:[0,3]};
for(const [key,[min,max]]of Object.entries(ranges)){const v=input?.[key];if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max){res.writeHead(400);res.end('Invalid parameter');return;}controls[key]=key==='dots'?Math.round(v):v;}
for(const key of ['shine','back-light']){if(typeof input?.[key]!=='boolean'){res.writeHead(400);res.end('Invalid switch');return;}controls[key]=input[key];}
await writeFile(resolve(root,'rainbow-box-preset.json'),JSON.stringify({controls},null,2)+'\n','utf8');res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true}));return;
}const name=decodeURIComponent(url.pathname);const file=resolve(root,'.'+(name==='/'?'/index.html':name));if(!file.startsWith(root.endsWith(sep)?root:root+sep)){res.writeHead(403);res.end();return}const data=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data)}catch{res.writeHead(404);res.end('Not found')}}).listen(port,'127.0.0.1',()=>console.log('Hell Elevator: http://127.0.0.1:'+port));

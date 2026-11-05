import http from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('./dist/',import.meta.url));
const port=Number(process.env.PORT||4173);
const types={'.json':'application/json','.svg':'image/svg+xml','.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.mp3':'audio/mpeg','.wav':'audio/wav'};
http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');if(url.pathname==='/api/rainbow-box-preset'&&req.method==='PUT'){
if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host){res.writeHead(403);res.end();return;}
let body='';for await(const chunk of req){body+=chunk;if(body.length>4096){res.writeHead(413);res.end();return;}}
const input=JSON.parse(body)?.controls,controls={};
const ranges={speed:[0,1],'flow-scale':[.1,6],'rim-scale':[.1,4],'rim-strength':[0,3],dots:[3,12],white:[0,3]};
for(const [key,[min,max]]of Object.entries(ranges)){const v=input?.[key];if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max){res.writeHead(400);res.end('Invalid parameter');return;}controls[key]=key==='dots'?Math.round(v):v;}
for(const key of ['shine','back-light']){if(typeof input?.[key]!=='boolean'){res.writeHead(400);res.end('Invalid switch');return;}controls[key]=input[key];}
await writeFile(resolve(root,'rainbow-box-preset.json'),JSON.stringify({controls},null,2)+'\n','utf8');res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true}));return;
}const name=decodeURIComponent(url.pathname);const file=resolve(root,'.'+(name==='/'?'/index.html':name));if(!file.startsWith(root.endsWith(sep)?root:root+sep)){res.writeHead(403);res.end();return}const data=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data)}catch{res.writeHead(404);res.end('Not found')}}).listen(port,'127.0.0.1',()=>console.log('Hell Elevator: http://127.0.0.1:'+port));

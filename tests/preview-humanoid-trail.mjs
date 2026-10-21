import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const root=resolve('dist');
const capture=`startHumanoidTest();sound=false;shootTimer=999;startHumanoidSlash();for(let i=0;i<27;i++)updateHumanoidBoss(1/120);paused=true;humanoidTestHud();draw();`;
http.createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname,file=resolve(root,'.'+pathname);if(!file.startsWith(root))throw Error();let data=await readFile(file);if(pathname==='/humanoid.html')data=data.toString().replace('startHumanoidTest();</script>',capture+'</script>');res.setHeader('Content-Type',extname(file)==='.html'?'text/html':extname(file)==='.js'?'application/javascript':'text/css');res.end(data);}catch{res.statusCode=404;res.end();}}).listen(4192,'127.0.0.1',()=>console.log('Trail early-stroke visual fixture: http://127.0.0.1:4192/humanoid.html'));

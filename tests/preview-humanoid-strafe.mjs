import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const root=resolve('dist');
const capture=`startHumanoidTest();sound=false;shootTimer=999;humanoidBoss.y=285;humanoidBoss.gait=null;updateHumanoidGait(humanoidBoss,0);startHumanoidSlash(humanoidBoss,'strafe');for(let i=0;i<120;i++)updateHumanoidBoss(1/120);paused=true;humanoidTestHud();draw();`;
http.createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname,file=resolve(root,'.'+pathname);if(!file.startsWith(root))throw Error();let data=await readFile(file);if(pathname==='/humanoid.html')data=data.toString().replace('startHumanoidTest();</script>',capture+'</script>');res.setHeader('Content-Type',extname(file)==='.html'?'text/html':extname(file)==='.js'?'application/javascript':'text/css');res.end(data);}catch{res.statusCode=404;res.end();}}).listen(4200,'127.0.0.1',()=>console.log('Right hand gun visual fixture: http://127.0.0.1:4200/humanoid.html'));

import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const root=resolve('dist');
const capture=`startCowboyTest();sound=false;shootTimer=999;humanoidBoss.cowboy.wait=999;humanoidBoss.cowboy.phase='test';startHumanoidSlash(humanoidBoss,'skyshoot');humanoidBoss.skyEffects[0].drops[0].x=300;humanoidBoss.skyEffects[0].drops[0].y=350;humanoidBoss.skyEffects[0].drops[1].x=410;humanoidBoss.skyEffects[0].drops[1].y=400;for(let i=0;i<120;i++)updateHumanoidBoss(1/120);p.inv=0;paused=true;humanoidTestHud();draw();`;
http.createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname,file=resolve(root,'.'+pathname);if(!file.startsWith(root))throw Error();let data=await readFile(file);if(pathname==='/cowboy.html')data=data.toString().replace('startCowboyTest();</script>',capture+'</script>');res.setHeader('Content-Type',extname(file)==='.html'?'text/html':extname(file)==='.js'?'application/javascript':'text/css');res.end(data);}catch{res.statusCode=404;res.end();}}).listen(4205,'127.0.0.1',()=>console.log('Revised cowboy visual fixture: http://127.0.0.1:4205/humanoid.html'));

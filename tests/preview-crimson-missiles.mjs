import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const root=resolve('dist');
http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost'),file=resolve(root,'.'+url.pathname);if(!file.startsWith(root))throw Error();
 let data=await readFile(file);
 if(url.pathname==='/crimson-mech.html'){
 const age=url.searchParams.get('phase')==='fire'?3.7:1.3;
 data=data.toString().replace('startCrimsonMechTest();</script>',`startCrimsonMechTest();sound=false;shootTimer=Infinity;p.inv=999;humanoidBoss.crimsonAI.enabled=false;startHumanoidSlash(humanoidBoss,'missiles');for(let i=0;i<${Math.round(age*120)};i++)updateHumanoidBoss(1/120);paused=true;humanoidTestHud();draw();</script>`);
 }
 res.setHeader('Content-Type',extname(file)==='.html'?'text/html':extname(file)==='.js'?'application/javascript':'text/css');res.end(data);
 }catch{res.statusCode=404;res.end();}}).listen(4198,'127.0.0.1',()=>console.log('Missile fixtures: http://127.0.0.1:4198/crimson-mech.html / ?phase=fire'));

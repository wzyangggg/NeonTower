import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
const root=resolve('dist');
http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost'),file=resolve(root,'.'+(url.pathname==='/'?'/index.html':url.pathname));
  if(!file.startsWith(root+sep))throw Error();
  let data=await readFile(file);
  if(url.pathname==='/'||url.pathname==='/index.html'){
   const stage=[11,22,33].includes(+url.searchParams.get('stage'))?+url.searchParams.get('stage'):11,variant=url.searchParams.get('variant')==='1'?1:0;
   data=data.toString().replace('</body>',`<section style="position:absolute;bottom:105px;left:5%;right:5%;z-index:7;display:flex;gap:5px;flex-wrap:wrap"><button id="preview-explosions">爆炸定格</button><button id="preview-fragments">碎裂定格</button><button id="preview-play">继续演出</button><button id="preview-restart">重开预览</button></section><script>
   $('start').onclick=()=>{reset();floor=${stage};bossesDefeated=${stage}/11-1;campaignBossKind=CAMPAIGN_BOSSES[${stage}/11-1][${variant}].id;p.inv=999;shootTimer=999;tiles=[];for(let y=grid.minY;y<=grid.maxY;y++)for(let x=grid.minX;x<=grid.maxX;x++)tiles.push({x,y});startWave();finishBossIntro();equipItem('drone',createDrone('chainsaw',3));};
   function previewDeathAt(age){if(!bossDeath){const bodies=currentBossBodies();for(const e of bodies)e.hp=0;beginBossDeath(bodies);}if(bossDeath)updateBossDeath(Math.max(0,age-bossDeath.age));paused=true;draw();}
   $('preview-explosions').onclick=()=>previewDeathAt(.8);$('preview-fragments').onclick=()=>previewDeathAt(2.3);$('preview-play').onclick=()=>{paused=false;};$('preview-restart').onclick=()=>$('start').onclick();
   </script></body>`);
  }
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css','.mp3':'audio/mpeg'})[extname(file)]||'application/octet-stream');res.end(data);
 }catch{res.statusCode=404;res.end();}
}).listen(4210,'127.0.0.1',()=>console.log('Campaign browser fixture: http://127.0.0.1:4210/?stage=22&variant=1'));

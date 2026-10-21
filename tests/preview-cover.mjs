import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
const root=resolve('dist');
const fixture=`<section style="position:absolute;bottom:70px;left:12px;z-index:99;display:flex;gap:6px;flex-wrap:wrap"><button id="cover-preview">掩体预览</button><button id="cover-hit">掩体受击</button><button id="cover-crush">BOSS撞碎</button><button id="cover-rebuild">下一关恢复</button></section><script>
function coverFixture(){reset();paused=true;state='combat';syncGrid();p.x=244;p.y=354;p.inv=999;shootTimer=999;chaserSpawned=999;spawnQueue=[];enemies=[];turrets=[];tiles=[];for(let y=-2;y<=2;y++)for(let x=-3;x<=3;x++)tiles.push({x,y});for(const [x,y]of [[0,0],[2,1],[-2,-1]]){const t=tiles.find(t=>t.x===x&&t.y===y);t.coverTile=true;t.coverHp=COVER_HP;}tiles.find(t=>t.x===2&&t.y===1).coverHp=3;$('overlay').style.display='none';$('pause-panel').hidden=true;clearTimeout(toast.timer);$('toast').classList.remove('show');renderer.sceneKey=null;$('status').textContent='掩体格 · 每关恢复';$('wave').textContent='小怪可拆 / BOSS碰撞即碎';updateUI();draw();}
$('cover-preview').onclick=coverFixture;
$('cover-hit').onclick=()=>{paused=false;damageCover(tiles.find(t=>t.x===0&&t.y===0));paused=true;draw();};
$('cover-crush').onclick=()=>{paused=false;resolveEnemyCover({type:'droneBoss',x:325,y:300,r:52,hp:900},244,300);paused=true;draw();};
$('cover-rebuild').onclick=()=>{paused=false;startFloorTracking();paused=true;draw();};
</script>`;
http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost'),file=resolve(root,'.'+(url.pathname==='/'?'/index.html':url.pathname));if(!file.startsWith(root+sep))throw Error();let data=await readFile(file);if(url.pathname==='/')data=data.toString().replace('</body>',fixture+'</body>');res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.mp3':'audio/mpeg'})[extname(file)]||'application/octet-stream');res.end(data);}catch{res.statusCode=404;res.end();}}).listen(4216,'127.0.0.1',()=>console.log('Cover preview http://127.0.0.1:4216/'));

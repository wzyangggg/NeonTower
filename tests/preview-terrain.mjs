import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
const root=resolve('dist');
http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost'),file=resolve(root,'.'+(url.pathname==='/'?'/index.html':url.pathname));if(!file.startsWith(root+sep))throw Error();let data=await readFile(file);
 if(url.pathname==='/')data=data.toString().replace('</body>',`<section style="position:absolute;bottom:100px;left:15%;z-index:20;display:flex;gap:8px"><button id="terrain-buy">扩地预览</button><button id="terrain-clear">清理预览</button><button id="terrain-tick">闪烁一步</button><button id="terrain-done">完成</button></section><script>
 function terrainFixture(){reset();paused=false;p.y=300;state='combat';enemies=[];spawnQueue=[];chaserSpawned=24;tiles.find(t=>t.x===1&&t.y===0).trap={clock:0};}
 function terrainAdvance(dt){paused=false;step(dt);paused=true;draw();}
 $('terrain-buy').onclick=()=>{terrainFixture();state='upgrade';applyReward({key:'floor',name:'扩建',amount:6});applyReward({key:'erase',name:'拆除',amount:1});leaveShop();terrainAdvance(.72);terrainAdvance(.55);};
 $('terrain-clear').onclick=()=>{terrainFixture();equipItem('armor',createArmor('purity'));beginStageClear();terrainAdvance(1);};
 $('terrain-tick').onclick=()=>terrainAdvance(TERRAIN_FLASH_STEP);
 $('terrain-done').onclick=()=>terrainAdvance(TERRAIN_FLASH_TIME);
 </script></body>`);
 res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.mp3':'audio/mpeg'})[extname(file)]||'application/octet-stream');res.end(data);
 }catch{res.statusCode=404;res.end();}
}).listen(4213,'127.0.0.1',()=>console.log('Terrain preview http://127.0.0.1:4213/'));

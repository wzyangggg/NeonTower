import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
const root=resolve('dist');
http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost'),file=resolve(root,'.'+(url.pathname==='/'?'/index.html':url.pathname));if(!file.startsWith(root+sep))throw Error();let data=await readFile(file);if(url.pathname==='/')data=data.toString().replace('</body>',`<section style="position:absolute;bottom:110px;left:10%;z-index:7;display:flex;gap:12px"><button id="preview-clear">结算首条</button><button id="preview-shop">购买拆除</button><button id="preview-next">下一条</button></section><script>
function fixture(){reset();state='combat';p.y=300;p.inv=999;shootTimer=999;spawnQueue=[];chaserSpawned=24;enemies=[];turrets=[];tiles.find(t=>t.x===0&&t.y===1).trap={clock:0};tiles.find(t=>t.x===1&&t.y===0).saw=true;}
function advance(t){paused=false;step(t);paused=true;draw();}
$('preview-clear').onclick=()=>{fixture();equipItem('armor',createArmor('purity'));armor.clearNegativePerFloor=2;beginStageClear();advance(1);};
$('preview-shop').onclick=()=>{fixture();state='upgrade';applyReward({key:'erase',amount:1,name:'拆除危险源'});state='combat';spawnQueue=[{type:'eye',side:0}];spawnTimer=999;advance(1);};
$('preview-next').onclick=()=>advance(.4);
</script></body>`);res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css','.mp3':'audio/mpeg'})[extname(file)]||'application/octet-stream');res.end(data);}catch{res.statusCode=404;res.end();}}).listen(4211,'127.0.0.1',()=>console.log('Settlement preview http://127.0.0.1:4211/'));

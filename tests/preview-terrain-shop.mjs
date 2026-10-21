import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
const root=resolve('dist');
http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost'),file=resolve(root,'.'+(url.pathname==='/'?'/index.html':url.pathname));if(!file.startsWith(root+sep))throw Error();let data=await readFile(file);
 if(url.pathname==='/')data=data.toString().replace('</body>',`<script>
 reset();sound=false;paused=true;floor=2;p.y=300;cash=100;state='upgrade';terrainView='equipment';shopItems=['T009','T019','T025'].map(id=>{const d=terrainDef(id),key=d.kind==='稀有被动'?'terrainPassive':d.kind==='拆除'?'erase':terrainItemKey(d),u={key,terrainId:id,name:d.name,desc:d.desc,amount:1};return {...u,price:shopPrice(u),sold:false};});updateUI();clearTimeout(toast.timer);$('toast').classList.remove('show');$('status').textContent='本层结束';$('wave').textContent='选择商品';renderShop();
 if(location.search.includes('supply')){
  terrainView='equipment';state='combat';timedRoom={remaining:20,nextWaveIndex:1,nextChaserAt:.65};enemies=[];spawnQueue=[];turrets=[];tiles=[];for(let y=-2;y<=2;y++)for(let x=-2;x<=2;x++)tiles.push({x,y});
  const a=tiles.find(t=>t.x===-1&&t.y===0),b=tiles.find(t=>t.x===1&&t.y===0),c=tiles.find(t=>t.x===0&&t.y===-1),d=tiles.find(t=>t.x===1&&t.y===1);
  Object.assign(a,{medical:true,supplyQueue:[{kind:'adrenaline',amount:0},{kind:'nutrition',amount:.02}],medPack:true});Object.assign(b,{cashTile:true,supplyQueue:[{kind:'cash',amount:8}],medPack:true});Object.assign(c,{shieldTile:true,supplyQueue:[{kind:'shock',amount:0}],medPack:true});Object.assign(d,{coverTile:true,coverHp:4});
  grantTerrainPassive('驻留力场');terrainRun.areas=[{x:325,y:350,left:3}];terrainRun.field=3;terrainRun.cashArmor=4;renderer.sceneKey=null;$('overlay').style.display='none';$('viewport').classList.remove('shopping');$('viewport').classList.remove('falling');updateUI();draw();
 }
 </script></body>`);
 res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.mp3':'audio/mpeg'})[extname(file)]||'application/octet-stream');res.end(data);
 }catch{res.statusCode=404;res.end();}
}).listen(4220,'127.0.0.1',()=>console.log('Terrain shop preview http://127.0.0.1:4220/'));

// Local visual fixture only; it is never included in the production dist folder.
// Run: node tests/preview-equipment.mjs
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const setup=`<script>
sound=false;reset();floor=5;cash=500;shopLevel=3;
equipItem('armor',createArmor('shell',2));
equipItem('shoes',createShoes('steady',2));
equipItem('drone',createDrone('pulse',2));
function previewOffer(key,equipment){const u={key,equipment:rollEquipmentStats(key,equipment),blindBox:true,amount:1,opened:false,price:shopPrice({key,equipment}),sold:false};u.name=equipmentBoxName(u);return u}
shopItems=[previewOffer('armor',createArmor('energy',3)),previewOffer('shoes',createShoes('runner',3)),previewOffer('drone',createDrone('rail',3))];
if(new URLSearchParams(location.search).has('strange'))shopItems=[previewOffer('armor',createArmor('chrono',3)),previewOffer('armor',createArmor('aura',3)),previewOffer('shoes',createShoes('catalyst',3))];
if(new URLSearchParams(location.search).has('creative'))shopItems=[previewOffer('armor',createArmor('energy',3)),previewOffer('shoes',createShoes('catalyst',3)),previewOffer('shoes',createShoes('magnet',3))];
if(new URLSearchParams(location.search).has('early')){reset();cash=24;shopItems=[previewOffer('armor',createArmor('shell',1)),previewOffer('shoes',createShoes('runner',1)),previewOffer('drone',createDrone('pulse',1))];}
state='upgrade';paused=true;$('viewport').classList.remove('falling');$('toast').classList.remove('show');$('status').textContent='装备预览';$('wave').textContent='护甲 / 鞋子 / 无人机';updateUI();renderShop();draw();
if(new URLSearchParams(location.search).has('chrono')){equipItem('armor',createArmor('chrono',3));p.y=300;state='combat';spawnQueue=[];enemies=[{type:'eye',x:450,y:300,homeX:450,homeY:300,hp:99,max:99,r:14,t:0,fire:999,seed:0}];paused=false;$('overlay').style.display='none';draw();}
if(new URLSearchParams(location.search).has('aura')){equipItem('shoes',createShoes('catalyst',3));equipItem('armor',createArmor('energy',3));p.y=300;state='combat';$('overlay').style.display='none';draw();}
if(new URLSearchParams(location.search).has('ending')){state='combat';$('overlay').style.display='none';beginStageClear();draw();}
if(new URLSearchParams(location.search).has('combat')){state='combat';$('overlay').style.display='none';draw();}
if(new URLSearchParams(location.search).has('live')){state='combat';$('overlay').style.display='none';spawnQueue=[];spawn({type:'eye',side:0});enemies[0].hp=enemies[0].max=999;enemies[0].fire=999;paused=false;}
if(new URLSearchParams(location.search).has('blast')){equipItem('weapon',createWeapon('rocket',3));drone=null;state='combat';paused=true;spawnQueue=[];p.y=350;enemies=[{type:'eye',x:325,y:170,homeX:325,homeY:170,hp:99,max:99,r:14,t:0,fire:999,seed:0},{type:'eye',x:390,y:190,homeX:390,homeY:190,hp:99,max:99,r:14,t:0,fire:999,seed:0}];shots=[];emitWeaponShots(weapon,-Math.PI/2,{x:325,y:170});explodeFriendlyRocket(shots[0],enemies);shots=shots.filter(s=>s.life>0);shots[0].life=.08;$('overlay').style.display='none';updateUI();draw();}
if(new URLSearchParams(location.search).has('weapons')){
 $('overlay').innerHTML='<div class="shop-panel"><h2>武器预览</h2>'+WEAPON_TYPES.map(w=>'<button data-weapon="'+w.id+'">'+w.name+'</button>').join('')+'</div>';
 document.querySelectorAll('[data-weapon]').forEach(b=>b.onclick=()=>{equipItem('weapon',createWeapon(b.dataset.weapon,3));drone=null;state='combat';paused=true;spawnQueue=[];p.y=350;enemies=[{type:'eye',x:325,y:170,homeX:325,homeY:170,hp:99,max:99,r:14,t:0,fire:999,seed:0}];shots=[];shootWeapon(-Math.PI/2);if(weapon.id==='tesla')enemies.push({type:'eye',x:390,y:215,homeX:390,homeY:215,hp:99,max:99,r:14,t:0,fire:999,seed:0},{type:'eye',x:440,y:170,homeX:440,homeY:170,hp:99,max:99,r:14,t:0,fire:999,seed:0});if(weapon.id==='tesla'){shots=[];shootWeapon(-Math.PI/2);}if(!shots[0]?.beam)for(const s of shots){const elapsed=weapon.id===\'sniper\'?.06:.14;s.x+=s.vx*elapsed;s.y+=s.vy*elapsed;}$('overlay').style.display='none';updateUI();draw();});
}
if(new URLSearchParams(location.search).has('spectrum')){
 $('overlay').innerHTML='<button id="preview-music" class="primary">播放音乐频谱</button>';
 $('preview-music').onclick=()=>{sound=true;unlockAudio();state='upgrade';paused=false;$('overlay').style.display='none';syncMusic();};
 const meter=document.createElement('output');meter.id='preview-spectrum-data';meter.style.cssText='position:fixed;bottom:35px;left:12px;color:#8de5c6;font:10px monospace;z-index:5;pointer-events:none';document.body.appendChild(meter);
 setInterval(()=>{meter.textContent=JSON.stringify({analyser:!!music.analyser,playing:!music.media.paused,bass:+music.bass.toFixed(3),max:+Math.max(...music.bands).toFixed(3),bands:Array.from(music.bands,v=>+v.toFixed(2))});},150);
}
if(new URLSearchParams(location.search).has('rotor')){equipItem('weapon',createWeapon('rotor',3));armor=null;shoes=null;drone=null;p.y=300;p.inv=0;state='combat';time=.7;paused=true;spawnQueue=[];enemies=[];shots=[];$('overlay').style.display='none';$('pause-panel').hidden=true;$('viewport').classList.remove('paused');$('status').textContent='旋星机关枪 · 5 叉';$('wave').textContent='持续旋转弹流';updateUI();draw();}
if(new URLSearchParams(location.search).has('chainsaw')){equipItem('weapon',createWeapon('pulse'));equipItem('drone',createDrone('chainsaw',3));armor=null;shoes=null;state='combat';time=.1;p.y=300;p.inv=0;droneShootTimer=.14;paused=true;spawnQueue=[];shots=[];enemies=[{type:'eye',x:425,y:325,homeX:425,homeY:325,hp:10,max:15,r:14,t:0,fire:999,seed:0}];$('overlay').style.display='none';$('pause-panel').hidden=true;$('viewport').classList.remove('paused');$('status').textContent='裂齿电锯无人机';$('wave').textContent='环绕玩家 · 贴身切割';updateUI();draw();}
if(new URLSearchParams(location.search).has('seeker')){equipItem('weapon',createWeapon('seeker',3));equipItem('drone',createDrone('chainsaw',3));armor=null;shoes=null;state='combat';time=.1;p.y=300;p.inv=0;droneShootTimer=0;paused=true;spawnQueue=[];shots=[];enemies=[{type:'eye',x:490,y:190,homeX:490,homeY:190,hp:15,max:15,r:14,t:0,fire:999,seed:0}];emitWeaponShots(weapon,0,p);advanceFriendlyShot(shots[0],.26);advanceFriendlyShot(shots[1],.26);$('overlay').style.display='none';$('pause-panel').hidden=true;$('viewport').classList.remove('paused');$('status').textContent='寻迹飞弹 · 环绕电锯';$('wave').textContent='向上连射两发后追踪';updateUI();draw();}
if(new URLSearchParams(location.search).has('sword')){equipItem('weapon',createWeapon('sword'));armor=null;shoes=null;drone=null;state='combat';paused=true;p.y=300;p.inv=0;enemies=[];shots=[];emitWeaponShots(weapon,0,p);advanceFriendlyShot(shots[0],.07);$('overlay').style.display='none';$('pause-panel').hidden=true;$('viewport').classList.remove('paused');updateUI();draw();}
</script>`;
http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  const file=resolve(root,'.'+(url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname)));
  if(!file.startsWith(root.endsWith(sep)?root:root+sep)){res.writeHead(403);res.end();return;}
  let data=await readFile(file);
  if(url.pathname==='/')data=Buffer.from(data.toString().replace('</body>',setup+'</body>'));
  res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.mp3':'audio/mpeg'}[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
  res.end(data);
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(4184,'127.0.0.1',()=>console.log('Equipment preview: http://127.0.0.1:4184'));

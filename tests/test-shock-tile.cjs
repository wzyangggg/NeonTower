const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);





vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
function setup(){reset();state='combat';p.x=325;p.y=300;p.inv=999;shootTimer=999;chaserSpawned=999;spawnQueue=[];enemies=[{type:'bomber',hp:99,x:500,y:480,r:10}];turrets=[];tiles=[{x:0,y:0,shockTile:true},{x:1,y:0}];}
setup();bullets=[{x:90,y:100},{x:560,y:510},{x:325,y:300}];shots=[{life:2}];const trap={clock:0};tiles[1].trap=trap;const hazard={t:0};hazards=[hazard];updateShockTiles(0);
check(bullets.length===0&&shockWaves.length===1&&tiles[0].shockCooldown===35,'entry clears every hostile bullet immediately');
check(shots.length===1&&hazards[0]===hazard&&tiles[1].trap===trap&&enemies[0].hp===99,'friendly attacks, enemies and hazards remain');
bullets=[{x:100,y:100}];updateShockTiles(35);check(bullets.length===1&&tiles[0].shockCooldown===0,'standing still cannot retrigger even when ready');
p.x=375;updateShockTiles(0);p.x=325;updateShockTiles(0);check(!bullets.length&&shockWaves.length===1,'leave and return retriggers ready tile');
p.x=375;updateShockTiles(1);p.x=325;bullets=[{}];updateShockTiles(1);check(bullets.length===1,'reentry during cooldown cannot fire');
paused=true;updateShockTiles(99);check(tiles[0].shockCooldown===33,'pause freezes cooldown');paused=false;
for(const mode of ['upgrade','descent','landing','bossIntro','stageClear','dead']){state=mode;tiles[0].shockOccupied=false;updateShockTiles(99);check(bullets.length===1&&tiles[0].shockCooldown===33,'no trigger or cooldown outside active battle '+mode);}
state='survival';tiles[0].shockCooldown=0;updateShockTiles(0);check(!bullets.length,'survival works');
renderer.begin();drawShockTiles();check(renderer.data.slice(0,renderer.count).every(Number.isFinite),'ready tile and pulse render finite vertices');tiles[0].shockCooldown=10;renderer.begin();drawShockTiles();check(renderer.data.slice(0,renderer.count).every(Number.isFinite),'cooldown renders finite vertices');
tiles[0].shockCooldown=0;tiles[0].shockCharges=1;renderer.begin();drawShockTiles();let chargeMesh=renderer.residentMeshes.get('terrain:shock-pickup');check(chargeMesh?.count===1&&renderer.residentSnapshot().every(Number.isFinite),'ready charge has a solid finite model');
tiles[0].shockCharges=0;renderer.begin();drawShockTiles();check(chargeMesh.count===0,'spent charge model disappears');
tiles[0].shockCharges=2;renderer.begin();drawShockTiles();check(chargeMesh.count===1,'stored charges share one product model');
reset();check(!shockWaves.length&&!tiles.some(t=>t.shockTile),'restart clears waves and tile state');
state='upgrade';tiles=[{x:0,y:0}];cash=100;shopItems=[{key:'shockTile',name:'震荡格',desc:'踩入清屏',amount:1,price:18}];check(buyShopItem(0)&&cash===82&&!tiles[0].shockTile&&shopTerrainPlan.tiles[0].shockTile,'real shop purchase reserves shock tile');check(!buyShopItem(0)&&!shopUsable({key:'medical'})&&!shopUsable({key:'shockTile'}),'no duplicate purchase or overlapping reserved tiles');terrainChange=shopTerrainPlan;shopTerrainPlan=null;finishTerrainChange();check(terrainKind(tiles[0])==='shock'&&!terrainCell()&&!addTrap()&&!addCashTile(),'shock tile protected from other terrain');
check(levelShopItem({key:'shockTile',amount:1,desc:'踩入清屏'}).amount===1&&Number.isFinite(shopPrice({key:'shockTile',amount:1})),'shop scaling and price valid');
reset();state='combat';const originalRandom=Math.random;Math.random=()=>.08;addFloor(1);Math.random=originalRandom;check(tiles.some(t=>t.shockTile),'expansion can produce shock tile');
reset();state='combat';p.x=325;p.y=300;tiles=[{x:0,y:0,shockTile:true}];bullets=[{x:325,y:300,vx:0,vy:0,r:3,life:3}];p.inv=0;chaserSpawned=999;spawnQueue=[];enemies=[];const hp=p.hp;step(.016);check(p.hp===hp&&!bullets.length,'real frame clears bullets before player collision');
console.log('Shock tile: full-screen clear, entry latch/cooldown, survival, pause/states, rendering, real purchase/reservation, expansion, protected terrain and collision ordering passed');
}`,sandbox);

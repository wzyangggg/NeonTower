const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,els,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};sandbox.fsMainHTML=fs.readFileSync('dist/index.html','utf8');vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/humanoid.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/cowboy.js','utf8'),sandbox);
for(const name of ['snake','virus','crimson-mech','drone-boss','ufo-boss'])vm.runInContext(fs.readFileSync('dist/'+name+'.js','utf8'),sandbox);

vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
function arena(){reset();syncGrid();state='combat';sound=false;paused=false;p.x=500;p.y=500;p.inv=999;shootTimer=999;enemies=[];spawnQueue=[];turrets=[];chaserSpawned=999;tiles=[];for(let y=grid.minY;y<=grid.maxY;y++)for(let x=grid.minX;x<=grid.maxX;x++)tiles.push({x,y});const t=tiles.find(t=>!t.x&&!t.y);t.coverTile=true;t.coverHp=COVER_HP;return t;}
// Real walking, sliding, high-speed sweep, and friendly targeting.
let t=arena();p.x=240;p.y=300;walkFloor(p,420,300,7);check(p.x<297&&p.x>290,'player cannot tunnel through cover');check(!combatTargets().includes(t),'cover never becomes friendly auto target');
let o={x:240,y:260};o.x=420;o.y=330;resolveCoverMovement(o,240,260,7);check(!coverContains(t,o.x,o.y,7)&&o.x<298&&o.y===330,'diagonal movement slides along cover');
// Chaser really moves, attacks at a bounded rate, and only crosses after breakage.
t=arena();p.x=440;p.y=300;const chaser={type:'bomber',x:240,y:300,r:14,hp:9};enemies=[chaser];
for(let i=0;i<60;i++){time=i/60;updateChaser(chaser,1/60);check(chaser.x<=290.001,'chaser stays on near side');}check(t.coverHp===COVER_HP-1,'contact attacks once per second');
for(let i=60;i<370;i++){time=i/60;updateChaser(chaser,1/60);}check(t.coverHp===0&&chaser.x>350,'chaser dismantles then passes');
// Intact cover blocks bullets before damage to player. It also handles fast paths.
t=arena();p.x=420;p.y=300;p.inv=0;const hp=p.hp;bullet(240,300,0,1000);updateEnemyBullets(.2);check(p.hp===hp&&!bullets.length&&t.coverHp===COVER_HP-1,'bullet intercepted before player');
// Cover behind the player cannot erase an earlier hit.
t=arena();p.x=270;p.y=300;p.inv=0;bullet(220,300,0,1000);updateEnemyBullets(.2);check(p.hp===2&&t.coverHp===COVER_HP,'earliest player hit wins');
// Bouncing legs cannot take a shortcut past cover.
t=arena();p.x=500;p.y=500;const bounce={x:240,y:300,vx:1200,vy:0,r:4,life:Infinity,wallBounce:true,bounces:0,maxBounces:3};bullets=[bounce];updateEnemyBullets(.8);check(!bullets.length&&t.coverHp===COVER_HP-1,'bouncing bullet stops at cover along actual path');
// Two stacked covers take hits nearest-first, and keep floor foundations when broken.
t=arena();const rear=tiles.find(t=>t.x===1&&t.y===0);rear.coverTile=true;rear.coverHp=COVER_HP;bullet(240,300,0,1000);updateEnemyBullets(.3);check(t.coverHp===COVER_HP-1&&rear.coverHp===COVER_HP,'only nearest cover damaged');damageCover(t,99);check(hasTile(0,0)&&t.coverTile&&canWalkAt(325,300,7),'broken cover is traversable floor');
// Each real room entry restores durability, including survival, greed, and boss rooms.
for(const f of [2,4,7,11]){t=arena();t.coverHp=0;floor=f;startWave();check(t.coverHp===COVER_HP,'new room rebuilds at floor '+f);damageCover(t,2);check(t.coverHp===(state==='combat'?COVER_HP-2:COVER_HP),'intro does not permit damage');}
t=arena();t.coverHp=0;p.x=325;p.y=300;startFloorTracking();check(t.coverHp===COVER_HP&&canWalkAt(p.x,p.y,7),'refresh moves player off restored cover');
// Health does not regenerate during a room and pause prevents damage.
t=arena();damageCover(t,2);paused=true;damageCover(t,99);check(t.coverHp===COVER_HP-2,'pause blocks destruction');paused=false;state='upgrade';damageCover(t,99);check(t.coverHp===COVER_HP-2,'shop cannot damage cover');
// All boss bodies smash instead of stopping, including swept fast motion.
for(const type of ['snake','virus','humanoid','droneBoss','ufoBoss','boss']){t=arena();const e={type,x:430,y:300,r:30,hp:99};resolveEnemyCover(e,220,300);check(!t.coverHp&&e.x===430,'boss crushes '+type);}
// Actual AI entry points for every campaign boss exercise integration hooks.
for(const kind of ['snake','virus','cowboy','crimson','drone','ufo']){arena();floor=11;campaignBoss=kind==='snake'||kind==='virus'?1:kind==='cowboy'||kind==='crimson'?2:3;campaignBossKind=kind;spawnCampaignBoss();state='combat';const e=currentBossBodies()[0];const cell=tiles.reduce((a,b)=>Math.hypot(325+a.x*TILE-e.x,300+a.y*TILE-e.y)<Math.hypot(325+b.x*TILE-e.x,300+b.y*TILE-e.y)?a:b);cell.coverTile=true;cell.coverHp=COVER_HP;if(kind==='snake')updateSnakeBoss(.016);else if(kind==='virus')updateVirusBoss(.016);else if(kind==='drone')updateDroneBoss(.016);else if(kind==='ufo')updateUFOBoss(.016);else updateHumanoidBoss(.016);check(cell.coverHp===0,'real boss AI crushes '+kind);}
// Drone summon roles: launch and normal motion both stop; contact chips durability.
for(const role of ['shooter','repair','suicide'])for(const launch of [true,false]){
 t=arena();const boss=spawnDroneBoss();boss.x=600;boss.y=150;deployDroneMinions(boss);const e=livingDroneMinions().find(e=>e.role===role);enemies=[boss,e];e.x=240;e.y=300;e.launchAngle=0;e.launchDistance=200;e.launchLeft=launch?.8:0;e.roamX=450;e.roamY=300;e.roamLeft=10;p.x=450;p.y=300;updateDroneMinions(launch?.8:1);check(e.x<325-COVER_HALF-e.r+.01&&!coverContains(t,e.x,e.y,e.r),'summon blocked '+role+' launch '+launch);check(t.coverHp===COVER_HP-1,'summon can attack '+role+' launch '+launch);
}
for(const launch of [true,false]){t=arena();spawnUFOBoss();const boss=ufoBoss;boss.x=600;boss.y=150;const e=livingUFOMinions()[0];enemies=[boss,e];e.x=240;e.y=300;e.launchAngle=0;e.launchDistance=200;e.launchLeft=launch?.8:0;e.roamX=450;e.roamY=300;e.roamLeft=10;updateUFOBoss(launch?.8:1);check(e.x<325-COVER_HALF-e.r+.01&&t.coverHp===COVER_HP-1,'UFO summon blocked, can damage, launch '+launch);}
// Laser beam is clipped at the cover, one durability hit per pulse.
t=arena();p.x=430;p.y=300;p.inv=0;const laser={x:220,y:300,aim:0,laserMode:'firing',laserTimer:.4};updateLaser(laser,.01);check(t.coverHp===COVER_HP-1&&p.hp===3&&beamLength(laser)<100,'laser is blocked and damages');updateLaser(laser,.01);check(t.coverHp===COVER_HP-1,'laser damage not frame dependent');
// Removed shop offer is rejected; non-shop terrain rewards still reserve protected covers.
t=arena();delete t.coverTile;delete t.coverHp;tiles=[t];state='upgrade';cash=100;shopItems=[{key:'coverTile',amount:1,price:14}];check(!buyShopItem(0)&&cash===100&&!t.coverTile&&!shopTerrainPlan,'stale cover sale cannot charge or reserve');applyReward({key:'coverTile',name:'路障奖励',amount:1});check(!t.coverTile&&shopTerrainPlan.tiles[0].coverTile,'non-shop cover reward is deferred');check(!shopUsable({key:'shockTile'}),'shock construction remains unavailable in shop');terrainChange=shopTerrainPlan;shopTerrainPlan=null;finishTerrainChange();check(terrainKind(tiles[0])==='cover'&&!terrainCell()&&!addTrap(),'cover protected from conversions');
// Finite rendering and shared meshes for intact, hit, cracked, broken states.
t=arena();for(const hp of [6,4,1,0]){t.coverHp=hp;renderer.begin();drawCoverTiles();check(renderer.data.slice(0,renderer.count).every(Number.isFinite),'finite cover vertices '+hp);}check(renderer.residentMeshes.has('cover:block')&&renderer.residentMeshes.has('cover:rubble'),'resident geometry');
reset();check(!tiles.some(t=>t.coverTile),'restart resets covers');
console.log('Cover: swept walking/enemy/deployment blocking, contact damage, bullets/bounces/laser ordering, six actual boss AIs, every-room rebuild, safe player relocation, rejected shop sale, deferred non-shop reward and resident rendering passed');
}`,sandbox);

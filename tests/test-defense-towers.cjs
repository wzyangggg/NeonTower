const fs=require('node:fs'),vm=require('node:vm');
const H=require('../dist/hex-map.js'),elements={};
const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{},hidden:true,classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const sandbox={Image:class {complete=true;naturalWidth=256;},HexMap:H,console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);
for(const file of ['music','renderer','map-icons','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss','tower-research','electric-tiles']){const src=fs.readFileSync('dist/'+file+'.js','utf8');vm.runInContext(file==='game'?H.transform(src):src,sandbox);}


vm.runInContext(`{
const E=ElectricTiles,cx=E.center({x:0,y:0}).x;
function check(v,m){if(!v)throw Error(m)}
function setup(){reset();startWave();tiles=[];for(let y=-5;y<=5;y++)for(let x=-6;x<=6;x++)tiles.push({x,y});enemies=[];missiles=[];bullets=[];shots=[];turrets=[];particles=[];deathBursts=[];enemyTransports=[];spawnQueue=[];state='combat';paused=false;timedRoom={duration:999,remaining:999,nextWaveAt:999};shootTimer=999;p.inv=999;p.x=cx;p.y=300;p.max=8;p.hp=8;}
function mob(x,y){const e={x,y,homeX:x,homeY:y,hp:500,max:500,r:14,type:'eye',t:0,fire:999,seed:0,terrainStun:999};enemies.push(e);return e;}
for(const level of [1,2,3]){
 setup();const f=E.place('electric_tower',{x:0,y:0},level);p.x=100;p.y=120;
 const targets=[mob(370,300),mob(430,300),mob(490,300),mob(550,300),mob(590,300),mob(610,300)];turrets=[{x:330,y:300,hp:100,type:'turret'}];
 E.update(1.99);check(!shots.length,'electric cooldown');E.update(.01);const arc=shots[0];check(arc.originX===cx&&arc.originY===300,'electric origin is tower');check(arc.arcTargets[0]===targets[0]&&arc.arcTargets.length===level+2,'nearest and level chain');
 step(.001);check(targets[0].hp===500-E.towerDamage(f),'actual tower damage');check(turrets[0].hp===100,'trap immunity');check(!f.products,'automatic without pickup');
 setup();const h=E.place('healing_tower',{x:0,y:0},level);p.x=480;p.hp=3;const wall=tiles.find(t=>t.x===1&&t.y===0);wall.coverTile=true;wall.coverHp=1;
 E.update(3.99);check(wall.coverHp===1&&p.hp===3,'heal cooldown');E.update(.01);check(wall.coverHp===Math.min(coverMaximum(wall),1+level)&&p.hp===3,'nearest damaged cover heals with clamp');
 wall.coverHp=coverMaximum(wall);E.update(4);check(p.hp===3+level,'skip full cover heal player');
 p.hp=p.max;E.update(4);check(h.cool===0,'hold ready without damaged target');p.hp=2;E.update(.01);check(p.hp===2+level,'ready heals newly injured player');
 wall.coverHp=0;p.hp=p.max;E.update(4);check(wall.coverHp===0&&h.cool===0,'do not resurrect broken cover');
 p.x=1000;p.hp=1;E.update(1);check(p.hp===1,'healing range enforced');
 setup();const m=E.place('missile_tower',{x:0,y:0},level);p.x=100;const enemy=mob(550,300);E.update(2.99);check(!shots.length,'missile cooldown');E.update(.01);const shot=shots[0];check(shot.towerMissile&&!shot.homing&&shot.x===cx,'straight tower missile');
 const vx=shot.vx,vy=shot.vy;enemy.y=400;advanceFriendlyShot(shot,.5);check(shot.vx===vx&&shot.vy===vy&&shot.y===300,'moving target does not steer missile');check(Math.abs(shot.blastRadius-60)<1e-8,'distance grows blast radius');
 shot.x=600;shot.y=300;enemy.x=600;enemy.y=300;const splash=mob(600,375);explodeFriendlyRocket(shot,combatTargets());check(Math.abs(shot.blastRadius-(30+(600-cx)*.2))<1e-8,'impact distance radius');const hp=enemy.hp;step(.001);check(enemy.hp===hp-E.towerDamage(m)*2&&splash.hp<500,'actual distance splash damage');const after=enemy.hp;step(.01);check(enemy.hp===after,'explosion damages once');
}
for(const level of [1,2,3]){
 setup();p.inv=0;const f=E.place('shield_tower',{x:0,y:0},level);E.update(11.99);check(!p.towerShieldLeft,'shield cooldown');E.update(.01);check(p.towerShieldLeft===level+1&&f.count===1,'level shield duration');
 p.shield=2;const hp=p.hp;hurt();hurt();check(p.hp===hp&&p.shield===2,'invincible absorbs repeated hits without consuming armor');
 paused=true;step(10);check(p.towerShieldLeft===level+1,'pause holds shield');paused=false;enemies=[];spawnQueue=[{type:'eye'}];f.cool=999;step(level+1);check(p.towerShieldLeft===0,'shield expires in real seconds');p.inv=0;p.shield=0;hurt();check(p.hp===hp-1,'damage resumes after shield');
 p.towerShieldLeft=3;E.startRoom();check(p.towerShieldLeft===0,'new room clears shield');p.x=1000;E.update(12);check(!p.towerShieldLeft&&f.products===1,'shield supply produced while player away');const produced=f.produced;E.update(36);check(f.products===1&&f.produced===produced,'uncollected shield pauses production');p.x=cx+50;E.update(.01);check(!p.towerShieldLeft&&f.products===1,'shield requires local pickup even within old tower range');p.x=cx;E.update(.01);check(p.towerShieldLeft===level+1&&f.products===0&&f.collected===1&&f.cool===12,'shield activates only on pickup and restarts production');p.towerShieldLeft=10;f.cool=0;E.update(.3);check(p.towerShieldLeft===10,'repeat supply refresh never shortens active shield');E.remove(f);E.reset();check(!p.towerShieldLeft,'reset clears shield');
}
check(ufoHexShieldCells().length===42&&ufoHexShieldCells().filter(c=>c.length===6).length===30,'sparse shared UFO shield mesh');
for(const version of [0,5,6]){localStorage.getItem=()=>JSON.stringify({version:2,designCatalogVersion:version,facilities:{}});check(E.enabled('shield_tower')===(version<6),'shield migration respects deletion');}localStorage.getItem=()=>null;
setup();let f=E.place('electric_tower',{x:0,y:0});mob(1000,300);E.update(2);check(f.attacks===0&&f.cool===0,'electric independent range');enemies=[mob(350,300)];enemies=enemies.slice(-1);E.update(.01);check(f.attacks===1,'electric ready when target enters');
setup();f=E.place('healing_tower',{x:0,y:0});p.hp=1;paused=true;E.update(10);check(p.hp===1&&f.cool===4,'pause freezes towers');paused=false;state='upgrade';E.update(10);check(f.cool===4,'shop freezes towers');state='survival';E.update(4);check(p.hp===2,'survival heals');
setup();f=E.place('missile_tower',{x:0,y:0});mob(550,300);E.update(3);const rocket=shots[0];E.startRoom();check(!shots.length&&f.cool===3,'new room resets tower and projectiles');
setup();for(const kind of ['electric_tower','healing_tower','missile_tower']){localStorage.getItem=()=>JSON.stringify({version:2,designCatalogVersion:4,facilities:{}});check(E.enabled(kind),'legacy catalog new towers enabled');localStorage.getItem=()=>JSON.stringify({version:2,designCatalogVersion:5,facilities:{[kind]:{enabledInGame:false}}});check(!E.enabled(kind),'explicit disabled tower respected');localStorage.getItem=()=>JSON.stringify({version:2,designCatalogVersion:5,facilities:{}});check(!E.enabled(kind),'deleted tower stays deleted');}localStorage.getItem=()=>null;
const impact={lastX:0,lastY:0,x:200,y:0,hitRadius:5};E.towerMissileImpact(impact,{x:100,y:10,r:15});check(impact.y===0&&impact.x<100&&impact.x>80,'impact stays on straight trajectory at contact');
check(E.towerMissileRadius({x:1000,y:0,originX:0,originY:0})===150,'distance explosion cap');
{
 const original=plasmaLightningSound;let calls=0;plasmaLightningSound=()=>{calls++;};
 setup();const tower=E.place('electric_tower',{x:0,y:0});enemies=[];E.update(2);check(calls===0,'no electric sound without target');
 mob(350,300);E.update(.01);check(calls===1,'electric volley plays project lightning sound once');E.update(.01);check(calls===1,'no repeated sound during cooldown');
 paused=true;E.update(3);check(calls===1,'pause produces no electric sound');plasmaLightningSound=original;
}
{
 const trained=Object.fromEntries(Object.entries(TowerResearch.catalog).map(([kind,tree])=>[kind,Object.fromEntries(tree.nodes.map(node=>[node.id,node.max]))]));
 function trainedRoom(){setup();TowerResearch.start(trained);p.x=100;p.y=100;}
 for(const rank of [0,1,2,3]){
  setup();TowerResearch.start({shotgun_tower:{wide:rank,turn:rank,gate:1}});
  const shotgun=E.place('shotgun_tower',{x:0,y:0});
  const enemy=mob(cx,360);E.update(.05);
  check(Math.abs(shotgun.aim-Math.PI*.05*(1+.5*rank))<1e-8,'shotgun turn speed scales with rank');
  enemy.x=cx+60;enemy.y=300;E.update(1.45);
  check(shots.length===5+2*rank,'shotgun adds one outer pair per rank');
  const pelletAngle=s=>Math.atan2(s.vy,s.vx);
  check(shots.slice(0,5).every((s,i)=>!s.towerShot.outer&&Math.abs(pelletAngle(s)-(i-2)*.13*(2/3))<1e-8),'inner pellets use two-thirds of the original spread');
  for(let i=5;i<shots.length;i+=2){
   const [left,right]=shots.slice(i,i+2);
   check(left.towerShot.outer&&right.towerShot.outer&&Math.abs(pelletAngle(left)+pelletAngle(right))<1e-8,'outer pairs are symmetric');
   check(Math.abs(left.damage-shots[2].damage*.2)<1e-8&&left.damage===right.damage,'outer pellets keep fixed damage');
  }
  check(!shots[0].towerShot.r.gate,'saved gate rank is disabled in combat');
 }
 trainedRoom();
 E.place('sniper_tower',{x:0,y:0});mob(cx+100,300);E.update(3);
 check(shots[0].pierce===3,'trained sniper gains third penetration');
 trainedRoom();
 E.place('electric_tower',{x:0,y:0});for(const dx of [10,30,50,70,90])mob(cx+dx,300);E.update(2);
 check(shots[0].arcTargets.length===5&&shots[0].towerArc.mainLength===4,'trained electric capacity and fork');
 trainedRoom();
 E.place('missile_tower',{x:0,y:0});mob(cx+150,300);E.update(3);
 check(shots[0].vx===390&&Math.abs(E.towerMissileRadius({...shots[0],x:cx+300})-111.6)<.0001,'trained missile speed and blast radius');
 trainedRoom();
 E.place('healing_tower',{x:0,y:0});p.x=cx;p.y=300;p.hp=1;E.update(4);
 check(p.hp===5,'trained healing amount');
 trainedRoom();
 const reserve=E.place('shield_tower',{x:0,y:0});E.update(18);
 check(reserve.products===2,'trained shield has two reserves');
 p.x=cx;p.y=300;E.update(.01);
 check(p.towerShieldLeft===2.9&&reserve.products===1,'trained shield duration and pickup');
 trainedRoom();
 E.place('slow_field',{x:0,y:0});const victim=mob(cx+10,300);p.x=cx;p.y=300;
 check(Math.abs(E.movementFactor(victim)-.55)<.0001&&E.movementFactor(p)===1,'trained slow field core and friend filter');
 trainedRoom();
 E.place('repair_turret',{x:0,y:0});const wall=tiles.find(t=>t.x===0&&t.y===1);
 wall.coverTile=true;wall.coverHp=1;E.syncWalls();
 check(wall.repairWallBonus===5,'trained wall bonus');
 const oldHp=wall.coverHp;E.update(6);
 check(wall.coverHp>oldHp,'trained repair fires exactly on schedule');
}
{
 setup();TowerResearch.start(TowerResearch.effects({sniper_tower:{distance:20,rapid:40,ballistic:60,caliber:80,bounty:100}}));
 const sniper=E.place('sniper_tower',{x:0,y:0}),enemy=mob(cx+100,300);enemy.hp=1;
 E.update(2.54);check(!shots.length,'rapid sniper waits for modified interval');
 E.update(.01);check(shots[0].vx===1800&&shots[0].pierce===1&&sniper.cool===2.55,'rapid route changes cadence and velocity');
 const before=cash;step(.06);
 check(enemy.hp<=0&&cash-before===(enemyKillReward(enemy)+2)*difficultyFactor('cash'),'bounty applies to an actual sniper kill');
 setup();TowerResearch.start(TowerResearch.effects({sniper_tower:{distance:20,pierce:40,column:60}}));
 E.place('sniper_tower',{x:0,y:0});mob(cx+100,300);E.update(3);
 check(shots[0].vx===1500&&shots[0].pierce===3,'penetration route gets three hits and baseline velocity');
}
console.log('Defense towers: baseline behavior and trained attacks, healing, shield, slow field and repairs passed.');
}`,sandbox);

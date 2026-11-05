const fs=require('node:fs'),vm=require('node:vm');
const H=require('../dist/hex-map.js'),elements={};
const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{},hidden:true,classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const sandbox={Image:class {complete=true;naturalWidth=256;},HexMap:H,console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);
for(const file of ['music','renderer','map-icons','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss','electric-tiles']){const src=fs.readFileSync('dist/'+file+'.js','utf8');vm.runInContext(file==='game'?H.transform(src):src,sandbox);}


vm.runInContext(`{
const E=ElectricTiles,cx=E.center({x:0,y:0}).x;
function check(v,m){if(!v)throw Error(m)}
function near(a,b,m){check(Math.abs(a-b)<1e-7,m+': '+a+' / '+b)}
function setup(){reset();startWave();tiles=[];for(let y=-5;y<=5;y++)for(let x=-6;x<=6;x++)tiles.push({x,y});enemies=[];shots=[];bullets=[];missiles=[];turrets=[];spawnQueue=[];enemyTransports=[];state='combat';paused=false;timedRoom={duration:999,remaining:999,nextWaveAt:999};shootTimer=999;p.x=cx;p.y=460;p.inv=999;}
function mob(x,y=300){const e={x,y,homeX:x,homeY:y,hp:1000,max:1000,r:14,type:'eye',t:0,fire:999,seed:0,terrainStun:999};enemies.push(e);return e;}
for(const level of [1,2,3]){
 setup();let f=E.place('shotgun_tower',{x:0,y:0},level);const e=mob(425);E.update(1.49);check(!shots.length,'shotgun cooldown');E.update(.01);check(shots.length===5,'five pellets');check(new Set(shots.map(s=>Math.atan2(s.vy,s.vx))).size===5,'fan spread');for(const s of shots)near(s.damage,E.towerDamage(f)*.6,'level pellet damage');step(.24);check(e.hp<1000,'actual pellet hit');check(shots.filter(s=>s.life>0).length<5,'pellets consumed');
 setup();f=E.place('sniper_tower',{x:0,y:0},level);mob(500);E.update(2.99);check(!shots.length,'sniper cooldown');E.update(.01);check(shots.length===1&&shots[0].towerSniper,'single sniper bullet');const s=shots[0];let previous=0;for(const distance of [0,100,200,400,800]){const damage=resolveShotDamage(s,s.damage,{x:cx+distance,y:300}).damage;near(damage,E.towerDamage(f)*2*(1+distance/200),'distance bonus');check(damage>previous,'monotonic distance');previous=damage;}const target=enemies[0];step(.12);check(target.hp<1000,'actual sniper hit');
 setup();f=E.place('slow_field',{x:0,y:0},level);near(E.movementFactor({x:cx,y:300}),.8-.1*level,'core slowed');near(E.movementFactor({x:cx+140,y:300}),.8-.1*level,'boundary slowed');check(E.movementFactor({x:cx+141,y:300})===1,'outside normal');p.x=cx;p.y=300;keys.d=true;step(.02);keys.d=false;near(p.x-cx,movementSpeed()*.02*(.8-.1*level),'player actual movement');E.remove(f);check(E.movementFactor(p)===1,'remove restores');
}
setup();const weak=E.place('slow_field',{x:0,y:0},1),strong=E.place('slow_field',{x:1,y:0},3);near(E.movementFactor({x:350,y:300}),.5,'strongest overlapping field only');E.remove(strong);near(E.movementFactor({x:350,y:300}),.7,'remaining field');E.move(weak,{x:-4,y:0});check(E.movementFactor({x:350,y:300})===1,'move field immediate');
function enemyTravel(withField){setup();p.x=cx;p.y=440;if(withField)E.place('slow_field',{x:0,y:0});const e=mob(370);e.type='crawler';e.terrainStun=0;const old={x:e.x,y:e.y};step(.02);return Math.hypot(e.x-old.x,e.y-old.y);}
const normal=enemyTravel(false),slowed=enemyTravel(true);check(normal>0,'crawler moves');near(slowed,normal*.7,'actual enemy movement');
for(const kind of ['shotgun_tower','sniper_tower']){setup();const f=E.place(kind,{x:0,y:0});turrets=[{type:'turret',hp:99,x:340,y:300}];mob(2000);E.update(3);check(!shots.length&&f.cool===0,'range and trap exclusion');mob(400);E.update(.01);check(shots.length>0,'ready fires on entry');paused=true;const cool=f.cool;E.update(8);check(f.cool===cool,'pause');paused=false;E.startRoom();check(!shots.length,'room removes bullets');}
for(const kind of ['shotgun_tower','sniper_tower','slow_field']){setup();let a=E.place(kind,{x:0,y:0}),b=E.place(kind,{x:1,y:0});check(E.merge(a,b)&&b.level===2,'merge');localStorage.getItem=()=>JSON.stringify({version:2,designCatalogVersion:6,facilities:{}});check(E.enabled(kind),'legacy availability');localStorage.getItem=()=>JSON.stringify({version:2,designCatalogVersion:7,facilities:{}});check(!E.enabled(kind),'deletion respected');localStorage.getItem=()=>JSON.stringify({version:2,designCatalogVersion:6,facilities:{[kind]:{enabledInGame:false}}});check(!E.enabled(kind),'disabled respected');localStorage.getItem=()=>null;}
for(const kind of ['shotgun_tower','sniper_tower','missile_tower']){
 setup();const f=E.place(kind,{x:0,y:0});f.cool=0;f.aim=0;const e=mob(cx-100);E.update(.05);
 check(!shots.length&&f.aim>0&&f.aim<=Math.PI*.05+1e-7,'finite rotation, ready tower cannot fire backwards: '+kind);
 E.update(.85);check(!shots.length,'still waiting for alignment: '+kind);E.update(.1);check(shots.length>0,'fires after completing turn: '+kind);
 const fired=shots.length;f.cool=0;e.x=cx+100;E.update(.05);check(shots.length===fired,'retarget requires another turn: '+kind);
 paused=true;const angle=f.aim;E.update(1);near(f.aim,angle,'pause freezes turret turn');paused=false;
 enemies=[];E.update(1);check(shots.length===fired&&f.cool===0,'lost target holds ready without firing: '+kind);
 f.aim=Math.PI-.02;mob(cx-100,298);E.update(.05);check(shots.length>fired,'shortest turn crosses angle wrap: '+kind);
}
const street=createWeaponModel('smg_t1'),ak=createWeaponModel('smg_t2'),gatling=createWeaponModel('smg_t3'),uzi=createWeaponModel('uzi_t2'),fangs=createWeaponModel('uzi_t4');
check(street.interval>=.15&&uzi.interval>=.14,'starting automatic weapons leave attack speed room');check(street.interval>ak.interval&&ak.interval>gatling.interval&&uzi.interval>fangs.interval,'later automatic weapons become faster');
for(const id of ['smg','uzi'])check(createDrone(id,1).interval>=.15,'drone legacy weapons use reduced initial rate');
console.log('More towers passed: levels, actual damage and movement, distance scaling, cooldown/range/trap immunity, overlap/removal/move, pause/reset, merge/legacy availability, finite turns/retarget/wrap and automatic weapon progression.');
}`,sandbox);



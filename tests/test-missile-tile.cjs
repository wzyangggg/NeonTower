const fs=require('node:fs'),vm=require('node:vm');
const H=require('../dist/hex-map.js'),elements={};
const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{},hidden:true,classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const sandbox={Image:class {complete=true;naturalWidth=256;},HexMap:H,console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);
for(const file of ['music','renderer','map-icons','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss','electric-tiles']){const src=fs.readFileSync('dist/'+file+'.js','utf8');vm.runInContext(file==='game'?H.transform(src):src,sandbox);}


vm.runInContext(`{
const E=ElectricTiles;
function check(v,m){if(!v)throw Error(m)}
function setup(){reset();startWave();tiles=[];for(let y=-5;y<=5;y++)for(let x=-6;x<=6;x++)tiles.push({x,y});enemies=[];missiles=[];bullets=[];shots=[];turrets=[];particles=[];deathBursts=[];enemyTransports=[];spawnQueue=[];state='combat';timedRoom={duration:999,remaining:999,nextWaveAt:999};shootTimer=999;p.inv=999;p.x=325;p.y=300;}
function mob(x,y){const e={x,y,homeX:x,homeY:y,hp:500,max:500,r:14,type:'eye',t:0,fire:999,seed:0,terrainStun:999};enemies.push(e);return e;}
function launcher(level=1){const f=E.place('missile_bomb',{x:0,y:0});while(f.level<level)E.merge({kind:'missile_bomb',level:f.level},f);return f;}
for(const level of [1,2,3]){
 setup();const f=launcher(level);p.x=100;p.y=120;check(E.defs.missile_bomb.interval===12,'twelve second base');E.update(11.99);check(f.products===0,'no early missile supply');E.update(.01);check(f.products===1&&f.attacks===0,'produce physical missile supply');E.update(20);check(f.produced===1,'unpicked supply stops production');
 Object.assign(p,E.center(f.anchor));const candidates=[mob(580,460),mob(400,300),mob(325,100),mob(160,300),mob(600,300),mob(150,100)];const order=[...candidates].sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));turrets=[{x:p.x+1,y:p.y,hp:999,type:'turret'}];missiles=[{x:p.x+2,y:p.y,hp:2,life:3,type:'rocket'}];
 E.update(.01);const rockets=shots.filter(s=>s.tileMissile),stats=E.missileStats(f);check(rockets.length===level+2&&new Set(rockets.map(s=>s.homingTarget)).size===rockets.length,'distinct nearest targets by level');check(rockets.every((s,i)=>s.homingTarget===order[i]&&s.x===p.x&&s.y===p.y&&s.damage===stats.damage),'nearest order player origin and damage');check(rockets.every(s=>s.blastRadius===50+8*level),'blast upgrade');
 missiles=[];paused=true;const life=rockets[0].life;step(.5);paused=false;check(rockets[0].life===life,'pause freezes missiles');
 const tracked=rockets[0],goal=tracked.homingTarget;goal.x+=30;goal.homeX=goal.x;const x=tracked.x;step(.05);check(tracked.x!==x&&tracked.curve.target===goal,'moving target tracked');goal.hp=0;E.advanceMissile(tracked,.01);check(tracked.homingTarget!==goal&&!turrets.includes(tracked.homingTarget),'dead target reacquired excluding trap');
 for(let i=0;i<300;i++)step(.01);check(!shots.some(s=>s.tileMissile),'missiles impact or expire');check(candidates.some(e=>e.hp<500)&&turrets[0].hp===999,'actual blast damage and trap immunity');
}
setup();const f=launcher();f.products=1;E.update(.01);check(f.collected===1&&shots.length===0,'no targets consumes supply with effect but no invalid missile');
setup();const expiry=launcher();const target=mob(500,300);expiry.products=1;E.update(.01);const rocket=shots.find(s=>s.tileMissile);rocket.x=target.x;rocket.y=target.y;const hp=target.hp;explodeFriendlyRocket(rocket,combatTargets());check(deathBursts.at(-1).style.palette.core===ELEMENT_BURST_PALETTES.missile.core,'missile explosion uses death layers');step(.001);check(target.hp===hp-E.missileStats(expiry).damage,'blast damage once');const after=target.hp;for(let i=0;i<30;i++)step(.01);check(target.hp===after,'visible explosion never repeats damage');
setup();const e=mob(390,300);const ice=E.place('freeze_bomb',{x:0,y:0});ice.products=1;E.update(.01);time+=.2;check(enemyHitFeedback(e).white===.68,'frozen model mixes white even without hit');e.hitAt=time;check(enemyHitFeedback(e).white===1,'hit flash still reaches white');time+=.1;check(enemyHitFeedback(e).white===.68,'hit returns to frozen mix');
 draw();const instance=[...renderer.residentMeshes.values()].find(m=>m.count&&m.instances[12]===Math.fround(-.68));check(instance,'frozen white reaches resident shader instance');const data=instance.data;draw();check(instance.data===data,'tint does not rebuild geometry');time=e.bombFrozenUntil+.01;check(enemyHitFeedback(e).white===0,'thaw restores original model color');
for(const theme of ['ice','plasma','laser','missile']){
 setup();const wallet=cash,dead=kills;spawnElementBurst(325,300,42,theme);check(kills===dead&&cash===wallet,'visual effect has no kill/reward side effects');check(deathBursts[0].style.palette===ELEMENT_BURST_PALETTES[theme]&&particles.filter(p=>p.elementDebris).length===32,'colored layers and physical debris '+theme);
 for(const age of [.015,.13,.4,1]){deathBursts[0].age=age;renderer.begin();drawDeathBursts();check(renderer.transparentData.subarray(0,renderer.transparentCount).every(Number.isFinite),'finite layered geometry '+theme);}
 const draws=JSON.stringify(deathBursts);paused=true;step(.5);paused=false;check(JSON.stringify(deathBursts)===draws,'pause freezes themed layers');updateDeathFeedback(2);check(deathBursts.length===0,'effect expiration');
}
setup();const sv=launcher();mob(500,300);sv.products=1;state='survival';survivalRemaining=20;E.update(.01);const svRocket=shots.find(s=>s.tileMissile);sv.cool=999;step(.1);check(svRocket.life<4,'survival advances missile');for(let i=0;i<41;i++)step(.1);check(!shots.some(s=>s.tileMissile),'survival expires missile');
setup();for(let i=0;i<100;i++)spawnElementBurst(325,300,35,'ice');check(deathBursts.length===16&&particles.filter(q=>q.elementDebris).length===256,'layer and debris caps');
setup();const b=launcher();b.products=1;mob(500,300);E.update(.01);E.startRoom();check(!shots.some(s=>s.tileMissile),'floor clears missiles');
console.log('Missile tile and element FX: pickup production/upgrades, distinct nearest player-origin locks, tracking/reacquisition, real single blast damage, trap exclusion, no-target/pause/lifecycle; shader white-hit-thaw/residency; recolored death layers, physical debris/caps/no reward side effects passed.');
}`,sandbox);

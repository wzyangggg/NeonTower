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
function setup(){reset();startWave();tiles=[];for(let y=-5;y<=5;y++)for(let x=-6;x<=6;x++)tiles.push({x,y});enemies=[];missiles=[];bullets=[];shots=[];enemyTransports=[];spawnQueue=[];state='combat';timedRoom={duration:999,remaining:999,nextWaveAt:999};shootTimer=999;p.inv=999;p.x=100;p.y=120;}
function mob(x=p.x+80,y=p.y,type='eye'){const e={x,y,homeX:x,homeY:y,hp:500,max:500,r:14,type,t:0,fire:999,seed:0};enemies.push(e);return e;}
function bomb(kind,level=1){const f=E.place(kind,{x:0,y:0});check(f,'place '+kind);while(f.level<level)check(E.merge({kind,level:f.level},f),'upgrade '+kind);return f;}
for(const kind of ['freeze_bomb','laser_bomb']){
 setup();const f=bomb(kind);check(E.defs[kind].interval===12,'twelve second base '+kind);E.update(11.99);check(f.products===0,'no early bomb '+kind);E.update(.01);check(f.products===1&&f.attacks===0,'produce without enemy '+kind);E.update(30);check(f.produced===1&&f.products===1,'inventory stops production '+kind);
 Object.assign(p,E.center(f.anchor));paused=true;E.update(10);paused=false;state='upgrade';E.update(10);state='combat';check(f.collected===0,'pause and shop block pickup '+kind);
 E.update(.01);check(f.collected===1&&f.products===0&&f.attacks===1,'player pickup activates '+kind);
 p.x=100;p.y=120;E.update(12);check(f.produced===2,'production resumes '+kind);f.products=1;draw();check(renderer.residentMeshes.get('electric:'+kind).data.every(Number.isFinite),'finite resident can '+kind);
 const mesh=renderer.residentMeshes.get('electric:'+kind).data;draw();check(renderer.residentMeshes.get('electric:'+kind).data===mesh,'resident mesh reuse '+kind);
 E.startRoom();check(!shots.some(s=>s.bombLaser)&&f.products===0&&f.cool===12,'room clears pending effects '+kind);
}
for(const level of [1,2,3]){
 setup();const f=bomb('freeze_bomb',level);Object.assign(p,E.center(f.anchor));const stats=E.freezeStats(f),e=mob(p.x+stats.range-1),outside=mob(p.x+stats.range+40),builder=mob(p.x+50,p.y,'builder');
 builder.buildTarget=tiles.find(t=>t.x===-2&&t.y===0);builder.buildProgress=4.9;builder.warn=true;
 bullets=[{x:p.x+30,y:p.y,r:4},{x:p.x+stats.range+40,y:p.y,r:4}];missiles=[{x:p.x+30,y:p.y,hp:3,life:5},{x:p.x+stats.range+40,y:p.y,hp:3,life:5}];hazards=[{x:p.x,y:p.y},{x:p.x+stats.range+40,y:p.y}];
 f.products=1;E.update(.01);check(E.frozen(e)&&!E.frozen(outside),'freeze range level '+level);check(stats.range===190+50*level&&stats.duration===1+level,'upgrade freeze range/time');
 check(!builder.buildTarget&&builder.buildProgress===0&&!builder.warn,'construction reset');check(bullets.length===1&&missiles.length===1&&hazards.length===1,'clear only area projectiles');
 bullets=[];missiles=[];hazards=[];const before={x:e.x,y:e.y,t:e.t,fire:e.fire};step(.2);check(e.x===before.x&&e.y===before.y&&e.t===before.t&&e.fire===before.fire,'frozen enemy stops movement and attacks');
 check(builder.buildProgress===0,'builder cannot continue while frozen');const clock=time;paused=true;step(10);paused=false;check(time===clock&&E.frozen(builder),'pause retains freeze');
 time=builder.bombFrozenUntil-.05;step(.01);check(builder.buildProgress===0,'frozen until end');time=builder.bombFrozenUntil+.01;step(.1);check(!E.frozen(builder)&&builder.buildProgress<.2,'builder restarts instead of completing old work');
}
setup();const ice=bomb('freeze_bomb');Object.assign(p,E.center(ice.anchor));const eye=mob(p.x+40,p.y,'laser');eye.laserMode='firing';eye.laserTimer=1;ice.products=1;E.update(.01);check(eye.laserMode==='idle'&&eye.laserTimer>0,'interrupt active enemy laser');
for(const level of [1,2,3]){
 setup();const f=bomb('laser_bomb',level);Object.assign(p,E.center(f.anchor));const trap={x:p.x,y:p.y,hp:500,type:'turret'};turrets=[trap];const e=mob(p.x,p.y);e.terrainStun=999;
 f.products=1;E.update(.01);const beams=shots.filter(s=>s.bombLaser),stats=E.laserStats(f);check(beams.length===level+1&&beams.every(s=>s.width===4+4*level),'upgrade laser count/width');check(beams.every(s=>Math.abs(s.spin)===TAU*1.25&&s.life===3),'fast individual spin and duration');
 step(.01);const health=e.hp,damage=stats.count*E.towerDamage(f)/3;check(Math.abs(500-health-damage)<1e-6,'all beams damage through pipeline');step(.04);check(e.hp===health,'no damage before tick');step(.07);check(e.hp<health,'damage repeats after short interval');check(trap.hp===500,'laser excludes dangerous turret');
 const beam=beams[0],angle=beam.aim;const next={x:p.x+15,y:p.y+10};Object.assign(p,next);step(.01);check(beam.originX===p.x&&beam.originY===p.y&&beam.aim!==angle,'laser follows moving player and rotates');
 paused=true;const left=beam.life;step(5);paused=false;check(beam.life===left,'pause laser lifetime');
 const swept={...beam,originX:0,originY:0,lastAim:-.8,aim:.8,hitRadius:4};check(E.laserHits(swept,{x:200,y:0,r:5})&&!E.laserHits(swept,{x:-200,y:0,r:5}),'swept laser hits between frames without hitting rear');
 swept.lastAim=.8;swept.aim=-.8;check(E.laserHits(swept,{x:200,y:0,r:5}),'reverse sweep');
 for(let i=0;i<310;i++)step(.01);check(!shots.some(s=>s.bombLaser),'laser expires');
}

setup();const survivalBomb=bomb('laser_bomb');Object.assign(p,E.center(survivalBomb.anchor));survivalBomb.products=1;state='survival';survivalRemaining=20;E.update(.01);const survivalBeam=shots.find(s=>s.bombLaser);step(.1);check(survivalBeam.life<3,'survival advances laser');for(let i=0;i<31;i++)step(.1);check(!shots.some(s=>s.bombLaser),'survival laser expires');
for(const kind of ['freeze_bomb','laser_bomb']){
 setup();const battery=E.place('battery',{x:0,y:0}),anchor=tiles.find(c=>E.canPlace(kind,c)&&E.shape(kind,c).cells.some(t=>battery.outputs.some(o=>o.x===t.x&&o.y===t.y))),f=E.place(kind,anchor);check(E.recipients(battery).includes(f),'battery includes '+kind);E.update(9.24);check(f.products===1,'battery speeds bomb production '+kind);
}
setup();const storageRead=localStorage.getItem;localStorage.getItem=()=>JSON.stringify({version:2,designCatalogVersion:2,facilities:{tower:{enabledInGame:true}}});check(E.enabled('freeze_bomb')&&E.enabled('laser_bomb'),'old designer save permits new bombs');localStorage.getItem=()=>JSON.stringify({version:2,facilities:{freeze_bomb:{enabledInGame:false}}});check(!E.enabled('freeze_bomb'),'explicit designer disable respected');localStorage.getItem=storageRead;
setup();spawnUFOBoss();ufoBoss.x=p.x+20;ufoBoss.y=p.y;const u=ufoBoss,child=livingUFOMinions()[0];child.x=p.x+400;child.y=p.y;const f=bomb('freeze_bomb');Object.assign(p,E.center(f.anchor));u.x=p.x;u.y=p.y;child.x=p.x+400;child.y=p.y;f.products=1;E.update(.01);const old=u.t;updateUFOBoss(.1);check(u.t===old&&child.t>0,'freeze UFO body without freezing distant child');
console.log('Bomb facilities: production/pickup/merge, level scaling, area freeze and bullet removal, interrupted construction/laser, repeated swept rotating laser damage, trap exclusion, pause/expiration/room reset and resident models passed.');
}`,sandbox);

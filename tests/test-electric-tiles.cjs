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
function setup(){reset();startWave();tiles=[];for(let y=-5;y<=5;y++)for(let x=-6;x<=6;x++)tiles.push({x,y});enemies=[];missiles=[];enemyTransports=[];spawnQueue=[{type:'eye',side:0}];state='combat';timedRoom={duration:999,remaining:999,nextWaveAt:999};shootTimer=999;p.inv=999;p.x=100;p.y=120;}
function at(x,y){return tiles.find(t=>t.x===x&&t.y===y)}
function near(kind,source){const anchor=[...tiles].reverse().find(c=>E.canPlace(kind,c)&&E.shape(kind,c).cells.some(t=>source.outputs.some(o=>o.x===t.x&&o.y===t.y)));check(anchor,'space for supported '+kind);return E.place(kind,anchor);}
function target(dx=70,dy=0){const tower=E.list().find(f=>f.kind==='tower'&&f.anchor.x===0&&f.anchor.y===0),a=tower?E.facilityCenter(tower):E.center({x:0,y:0}),e={x:a.x+dx,y:a.y+dy,hp:500,max:500,r:13,type:'eye',t:0,fire:999,seed:1,homeX:a.x+dx,homeY:a.y+dy};enemies.push(e);return e;}
// Every actual building shares merge rules; upgrades other than towers only store a level.
for(const kind of Object.keys(E.defs).filter(E.enabled)){
 setup();const a=tiles.find(t=>E.canPlace(kind,t)),source=E.place(kind,a),b=tiles.find(t=>E.canPlace(kind,t)),target=E.place(kind,b);
 check(source&&target,'two copies '+kind);const products=target.products,cool=target.cool,footprint=JSON.stringify(target.cells);
 check(!E.canMerge(target,target),'self merge rejected '+kind);
 check(E.canMerge(source,target)&&E.merge(source,target)===target,'same kind level merge '+kind);
 check(E.list().length===1&&target.level===2&&JSON.stringify(target.cells)===footprint,'merge consumes one and retains footprint '+kind);
 check(target.products===products&&target.cool===cool,'merge keeps runtime '+kind);
 check(!E.canMerge({kind,level:1},target),'different level rejected '+kind);
 check(E.merge({kind,level:2},target)&&target.level===3,'third level '+kind);
 check(!E.canMerge({kind,level:3},target),'max level rejected '+kind);
 const vacant=tiles.find(t=>E.canPlace(kind,t,target)&&!target.cells.some(c=>c.x===t.x&&c.y===t.y));check(vacant&&E.move(target,vacant)&&target.level===3,'move keeps upgrade '+kind);
 E.startRoom();check(target.level===3,'floor transition keeps upgrade '+kind);
 E.remove(target);check(E.place(kind,a,2).level===2,'restore level '+kind);
 check(!E.canMerge({kind:'erase',level:1},target),'tools cannot merge');
}
setup();
for(const kind of Object.keys(E.defs).filter(E.enabled))for(let row=-3;row<=3;row++){const s=E.shape(kind,{x:0,y:row});check(new Set(s.cells.map(t=>t.x+','+t.y)).size===E.defs[kind].cells.length,'unique footprint');check(!s.outputs.some(c=>s.cells.some(t=>t.x===c.x&&t.y===c.y)),'output outside footprint');for(const c of s.cells)check(s.cells.length===1||s.cells.some(t=>t!==c&&HexMap.neighbors(c.x,c.y).some(([x,y])=>c.x+x===t.x&&c.y+y===t.y)),'connected footprint');}
const tower=E.place('tower',{x:0,y:0});check(tower,'tower placed');check(!E.place('battery',{x:0,y:0}),'overlap rejected');check(!E.place('turbine',{x:6,y:5}),'outside floor rejected');
at(2,2).medical=true;check(!E.place('battery',{x:2,y:2}),'medical protected');delete at(2,2).medical;
check(!builderTileAvailable(at(0,0)),'builder cannot replace facility');check(terrainCell()!==at(0,0),'terrain rewards cannot replace facility');
const pos=E.facilityCenter(tower);p.x=pos.x-18;p.y=pos.y;walkFloor(p,pos.x+18,pos.y,7);check(Math.abs(p.x-(pos.x+18))<.01,'tower does not block walking');
const e=target();p.x=pos.x-200;p.y=pos.y;tower.cool=0;const held=weapon,weaponClock=shootTimer;E.update(.01);check(tower.attacks===0&&tower.products===1&&shots.length===0,'bomb waits for pickup without attacking');
E.update(20);check(tower.products===1&&tower.produced===1&&tower.cool===12&&e.hp===500,'uncollected bomb stops production and does no damage');
p.x=pos.x;p.y=pos.y;E.update(.01);check(tower.products===0&&tower.collected===1&&tower.attacks===1,'pickup emits one lightning');
const discharge=shots[0];check(discharge.originX===p.x&&discharge.originY===p.y&&discharge.height===18,'shot originates at player');check(held===weapon&&shootTimer===weaponClock,'pickup preserves weapon and cooldown');
step(.01);check(e.hp===494,'bomb deals six damage through normal pipeline');for(let i=0;i<90;i++)step(.01);check(e.hp===494&&!shots.some(s=>s.electricFacilityShot),'arc expires and damage applies only once');p.x=pos.x-200;E.update(11.2);check(tower.attacks===1&&tower.products===1,'next bomb waits for collection');
setup();const chain=E.place('tower',{x:0,y:0});chain.cool=0;const origin=E.facilityCenter(chain);p.x=origin.x;p.y=origin.y;const group=Array.from({length:10},(_,i)=>target(390+i*100));const trap={x:330,y:300,hp:10,type:'turret'};turrets.push(trap);E.update(.01);check(shots[0].arcTargets.length===8&&shots[0].arcTargets[0]===group[0]&&!shots[0].arcTargets.includes(trap),'one lightning retains nearest first target and eight links excluding traps');step(.01);check(group.slice(0,8).every(e=>e.hp<500)&&group.slice(8).every(e=>e.hp===500)&&trap.hp===10,'chain damages only selected enemies');
// Upgrade via the actual merge path; each pickup must hit more distinct enemies.
for(const [level,limit]of [[1,8],[2,12],[3,16]]){
 setup();const f=E.place('tower',{x:0,y:0});while(f.level<level)check(E.merge({kind:'tower',level:f.level},f),'merge plasma bomb to requested level');
 Object.assign(p,E.facilityCenter(f));const victims=Array.from({length:18},(_,i)=>target(40+i*22));f.cool=0;E.update(.01);
 const discharge=shots[0];check(E.towerTargetLimit(f)===limit&&discharge.arcTargets.length===limit&&new Set(discharge.arcTargets).size===limit,'level '+level+' selects '+limit+' distinct enemies');
 step(.01);check(victims.slice(0,limit).every(e=>e.hp<500)&&victims.slice(limit).every(e=>e.hp===500),'level '+level+' damages exactly its target limit');
 const health=victims.map(e=>e.hp);for(let i=0;i<50;i++)step(.01);check(victims.every((e,i)=>e.hp===health[i]),'extended lightning never repeats damage at level '+level);
}
setup();const gap=E.place('tower',{x:0,y:0});gap.cool=0;Object.assign(p,E.facilityCenter(gap));target(530);target(-530);E.update(.01);check(shots[0].arcTargets.length===2,'screen-wide lightning reaches both remote first target and distant next target');
for(const def of Object.values(E.defs))check(def.rarityColor===WEAPON_GRADES[def.rarity].color,'tile uses shared rarity palette');
const hostile={x:400,y:300,hp:10,type:'turret'};turrets.push(hostile);check(!combatTargets().includes(hostile),'hostile turrets remain untargetable');
setup();const b=E.place('battery',{x:0,y:0}),out=b.outputs[0],t=E.place('tower',out),outside=E.place('tower',{x:2,y:3});check(E.recipients(b)[0]===t,'adjacent boost target');
check(E.defs.battery.desc==='开局10秒内，虚线内电力格的冷却加快30%','battery exact effect description');
t.cool=outside.cool=100;E.update(2);check(Math.abs(t.cool-97.4)<1e-6&&Math.abs(outside.cool-98)<1e-6,'30 percent cooldown speed only inside dashed cells');
paused=true;E.update(20);check(Math.abs(b.cool-8)<1e-6,'pause freezes opening window');paused=false;state='upgrade';E.update(20);check(Math.abs(b.cool-8)<1e-6,'shop freezes opening window');state='combat';
E.update(7.98);const boundary=t.cool;E.update(.05);check(Math.abs(boundary-t.cool-.056)<1e-6,'only first 0.02 seconds of boundary slice boosted');
const expired=t.cool;E.update(1);check(Math.abs(expired-t.cool-1)<1e-6&&b.cool===0,'boost ends at ten seconds');
const second=E.place('tower',{x:-3,y:0});check(second&&E.recipients(b).includes(second),'boost reaches opposite neighbor without rotation');second.cool=100;E.update(1);check(Math.abs(second.cool-99)<1e-6,'late tower cannot restart expired opening window');
E.startRoom();t.cool=100;E.update(1);check(Math.abs(t.cool-98.7)<1e-6&&Math.abs(b.cool-9)<1e-6,'new floor restores opening boost');
check(E.move(b,{x:3,y:-3}),'move battery away');const removedRange=t.cool;E.update(1);check(Math.abs(removedRange-t.cool-1)<1e-6,'moved battery no longer boosts old range');
setup();const cycleBattery=E.place('battery',{x:0,y:0}),cycleTower=E.place('tower',cycleBattery.outputs[0]);target();E.update(9.23);check(cycleTower.produced===0,'boosted tower still waits for full cooldown');E.update(.1);check(cycleTower.produced===1,'boost affects actual production timing');
E.remove(cycleBattery);cycleTower.products=0;cycleTower.cool=100;E.update(1);check(Math.abs(cycleTower.cool-99)<1e-6,'removed battery stops boost immediately');
setup();const battery=E.place('battery',{x:0,y:0}),gen=E.place('turbine',battery.outputs[0]);check(gen,'generator at battery outlet');check(!E.recipients(battery).length,'battery does not power generator');E.update(.8);check(Math.abs(gen.cool-.2)<1e-6,'generator independent clock');
setup();const g=E.place('turbine',{x:0,y:0}),gt=E.place('tower',tiles.find(c=>E.canPlace('tower',c)&&E.shape('tower',c).cells.some(t=>g.outputs.some(o=>o.x===t.x&&o.y===t.y))));gt.cool=99;check(E.defs.turbine.desc==='每一秒减少一次虚线内电力格的冷却，而且逐渐加快','exact turbine description');const distant=E.place('tower',{x:2,y:3});distant.cool=99;
E.update(.99);check(g.count===0&&Math.abs(gt.cool-98.01)<1e-6,'turbine waits one second');E.update(.01);check(g.count===1&&Math.abs(g.cool-.82)<1e-6&&Math.abs(gt.cool-96.5)<1e-6,'one second pulse reduces target cooldown by 1.5 seconds');check(Math.abs(distant.cool-98)<1e-6,'outside dashed range receives no pulse');
E.update(.82);check(g.count===2&&Math.abs(g.cool-.8)<1e-6,'second interval faster');check(gt.received===2,'actual supply pulses');E.update(.8);check(g.count===3&&Math.abs(g.cool-.8)<1e-6,'minimum interval remains bounded');
paused=true;const cool=g.cool;E.update(2);check(g.cool===cool,'pause freezes clocks');paused=false;state='upgrade';E.update(2);check(g.cool===cool,'shop freezes clocks');state='combat';
E.startRoom();check(g.count===0&&g.cool===1&&gt.attacks===0,'new floor resets warmup');
setup();const coil=E.place('echo',{x:0,y:0}),ct=E.place('tower',tiles.find(c=>E.canPlace('tower',c)&&E.shape('tower',c).cells.some(t=>coil.outputs.some(o=>o.x===t.x&&o.y===t.y))));target(60,70);ct.cool=0;E.update(.01);check(ct.produced===1&&ct.products===1&&ct.attacks===0,'initial physical bomb');E.update(.17);check(ct.produced===1,'echo production delayed');E.update(.01);check(ct.produced===2&&ct.products===2&&ct.attacks===0,'echo adds a bomb without attack');E.update(.7);check(ct.produced===2,'echo cannot recursively echo');
ct.cool=0;E.update(.01);const produced=ct.produced;E.remove(ct);E.update(.5);check(ct.produced===produced,'removed generator cancels pending production');
check(E.move(coil,{x:2,y:1}),'move succeeds');const old=coil.cells.map(c=>at(c.x,c.y));check(old.every(t=>t.electricFacility===coil),'move atomically rebinds cells');at(-3,-3).trap={clock:0};check(!E.move(coil,{x:-3,y:-3}),'invalid move rejected');check(old.every(t=>t.electricFacility===coil),'failed move preserves layout');
setup();const rt=E.place('tower',{x:0,y:0});E.place('battery',{x:-2,y:0});E.place('echo',{x:1,y:1});E.place('turbine',{x:-2,y:-2});draw();const model=renderer.sprites.find(s=>s.iconKind==='tower'),data=model.data;check(data.every(Number.isFinite),'finite tower mesh');
rt.products=1;draw();check(renderer.residentMeshes.get('electric:plasma-bomb').data.every(Number.isFinite),'resident plasma can model');for(const kind of ['tower','battery','echo','turbine']){const mesh=renderer.sprites.find(s=>s.iconKind===kind);check(mesh&&mesh.data.every(Number.isFinite),'flat icon mesh '+kind);for(let i=1;i<mesh.data.length;i+=5)check(Math.abs(mesh.data[i]-10.35)<.001,'LED icon sits above raised core '+kind);}
for(let i=0;i<10;i++){time+=.1;draw();}check(model.data===data,'tower resident geometry reused');renderer.initializeGPU();draw();check(renderer.sprites.find(s=>s.iconKind==='tower').data===data,'context recreation reuses CPU mesh');
setup();const noTarget=E.place('tower',{x:0,y:0});E.update(12);check(noTarget.products===1&&noTarget.attacks===0&&shots.length===0,'bomb produced with no targets');Object.assign(p,E.center(noTarget.cells[0]));paused=true;E.update(4);paused=false;state='upgrade';E.update(4);state='combat';check(noTarget.products===1,'pause and shop freeze pickup');E.update(.01);check(noTarget.products===0&&noTarget.collected===1&&shots.length===0,'empty pickup consumes bomb without invalid damage shot');E.startRoom();check(noTarget.attacks===0&&noTarget.cool===12,'room resets bomb');
for(const kind of ['miner','tower']){
 setup();const f=E.place(kind,{x:0,y:0}),wallet=cash,interval=E.defs[kind].interval;check(interval===(kind==='tower'?12:4),'base production interval '+kind);E.update(interval-.01);check(f.produced===0,'wait full interval '+kind);E.update(.01);check(f.products===1&&f.produced===1&&cash===wallet,'output waits for pickup '+kind);
 const full=f.cool;E.update(30);check(f.products===1&&f.produced===1&&f.cool===full&&cash===wallet,'uncollected product blocks production and cooldown '+kind);
 const at=E.center(f.anchor);p.x=at.x;p.y=at.y;paused=true;E.update(1);paused=false;state='upgrade';E.update(1);state='combat';check(f.products===1,'pause/shop forbid pickup '+kind);E.update(.01);
 check(f.products===0&&Math.abs(f.cool-E.defs[kind].interval)<1e-6,'pickup restarts complete production interval '+kind);check(cash===wallet+(kind==='miner'?8:0),'only mining pickup credits wallet');p.x=100;p.y=120;E.update(interval-.1);check(f.produced===1,'pickup does not bank blocked cooldown '+kind);E.update(.1);check(f.produced===2&&f.products===1,'next batch produced after pickup '+kind);
 E.startRoom();check(f.products===0&&f.produced===0&&f.cool===E.defs[kind].interval&&cash===wallet+(kind==='miner'?8:0),'room resets output but preserves earned money '+kind);
}
setup();tiles=[];for(let y=-5;y<=5;y++)for(let x=-6;x<=6;x++)tiles.push({x,y});const mb=E.place('battery',{x:0,y:0}),bm=near('miner',mb),dm=E.place('miner',tiles.find(c=>E.canPlace('miner',c)&&!E.shape('miner',c).cells.some(t=>mb.outputs.some(o=>o.x===t.x&&o.y===t.y))));E.update(3);check(bm.produced===0,'battery miner waits');E.update(.1);check(bm.produced===1&&dm.produced===0&&cash===0,'battery speeds up physical mining output');
E.update(20);check(bm.products===1&&bm.produced===1&&bm.cool===4,'battery never advances blocked miner');E.startRoom();bm.cool=100;E.update(10.5);check(Math.abs(bm.cool-86.5)<1e-6,'miner opening boost ends after ten seconds');
setup();const mg=E.place('turbine',{x:0,y:0}),gm=near('miner',mg);E.update(1);check(gm.received===1&&Math.abs(gm.cool-1.5)<1e-6,'turbine accelerates miner');E.update(.82);check(gm.products===1&&gm.produced===1&&cash===0,'turbine output still needs collection');const supplied=gm.received;E.update(10);check(gm.products===1&&gm.produced===1&&gm.cool===4&&gm.received===supplied,'turbine cannot bank pulses on occupied producer');
for(const kind of ['miner','tower']){
 setup();const coil=E.place('echo',{x:0,y:0}),f=near(kind,coil);f.cool=0;E.update(.01);E.update(.18);check(f.products===2&&f.produced===2&&cash===0,'echo adds same-batch output '+kind);E.update(20);check(f.products===2&&f.produced===2,'echo cannot restart blocked production '+kind);
 const at=E.center(f.anchor);p.x=at.x;p.y=at.y;E.update(.01);check(f.products===1&&f.cool===E.defs[kind].interval,'partial collection remains blocked '+kind);E.update(.25);check(f.products===0&&f.cool===E.defs[kind].interval,'last pickup restarts cooldown '+kind);check(cash===(kind==='miner'?16:0),'echo coins collected individually');
 // A quick pickup before the delayed echo must not start another cycle.
 E.startRoom();f.cool=0;E.update(.01);check(f.products===0,'nearby player collects first output '+kind);p.x=100;p.y=120;E.update(.1);check(f.cool===E.defs[kind].interval&&f.produced===1,'pending echo holds cooldown '+kind);E.update(.1);check(f.products===1&&f.produced===2&&f.cool===E.defs[kind].interval,'delayed echo waits for pickup '+kind);
 E.remove(f);const paid=cash;E.update(10);check(cash===paid,'removed facility cannot pay later '+kind);
}
setup();const combo=E.place('miner',{x:0,y:0});for(const kind of ['battery','echo','turbine'])E.place(kind,tiles.find(c=>E.canPlace(kind,c)&&E.shape(kind,c).outputs.some(o=>combo.cells.some(t=>t.x===o.x&&t.y===o.y))));E.update(30);check(combo.received>0&&combo.produced===2&&combo.products===2&&cash===0,'all bonuses preserve one uncollected batch');
draw();check(renderer.residentMeshes.get('pickup-chip:'+E.defs.miner.rarityColor).data.every(Number.isFinite),'visible resident gold coin');const mesh=renderer.residentMeshes.get('pickup-chip:'+E.defs.miner.rarityColor).data;draw();check(renderer.residentMeshes.get('pickup-chip:'+E.defs.miner.rarityColor).data===mesh,'gold coin mesh reused');
for(const kind of Object.keys(E.fruits)){
 setup();const f=E.place(kind,{x:0,y:0});check(f.cells.length===({apple:6,banana:7,grape:8,watermelon:9})[kind]&&f.outputs.length===0,'multi-cell farm '+kind);E.update(E.defs[kind].interval-.01);check(f.products===0,'fruit waits full production interval '+kind);E.update(.01);E.update(30);check(f.products===1&&f.produced===1&&f.cool===E.defs[kind].interval,'uncollected fruit blocks next cycle '+kind);
 draw();const model=renderer.residentMeshes.get('electric:fruit-pickup:'+kind),data=model.data;check(data.every(Number.isFinite),'finite fruit geometry '+kind);draw();check(renderer.residentMeshes.get('electric:fruit-pickup:'+kind).data===data,'fruit resident mesh reused '+kind);
}
for(const [kind,amount]of [['apple',1],['watermelon',3],['banana',1],['grape',1]]){
 setup();const f=E.place(kind,{x:0,y:0});p.hp=p.max;const at=E.center(f.cells[0]);p.x=100;p.y=120;E.update(E.defs[kind].interval);p.x=at.x;p.y=at.y;E.update(.01);check(f.products===0&&f.collected===1&&p.hp===p.max,'full health consumes fruit without overheal '+kind);p.x=100;p.y=120;E.update(E.defs[kind].interval);p.hp=1;p.x=at.x;p.y=at.y;E.update(.01);check(p.hp===Math.min(p.max,1+amount)&&f.products===0&&f.collected===2&&f.cool===E.defs[kind].interval,'fruit heals only on pickup '+kind);check(shots.length===0&&cash===0,'fruit neither attacks nor pays coins');
}
setup();const banana=E.place('banana',{x:0,y:0}),grape=E.place('grape',{x:3,y:0}),speed=movementSpeed(),attack=attackSpeedMultiplier();banana.cool=grape.cool=0;E.update(.01);check(movementSpeed()===speed&&attackSpeedMultiplier()===attack,'uncollected fruits grant no bonuses');const bp=E.center(banana.anchor),gp=E.center(grape.anchor);p.x=bp.x;p.y=bp.y;E.update(.01);check(Math.abs(movementSpeed()/speed-1.2)<1e-6&&E.buffs.speed===.2,'banana increases real movement by 20 percent');p.x=gp.x;p.y=gp.y;E.update(.01);check(Math.abs(attackSpeedMultiplier()-attack-.2)<1e-6&&E.buffs.attack===.2&&E.speedBonus()===.2,'grape increases real attack speed and stacks with banana');
p.x=100;p.y=120;E.update(3);const buffTimes=E.buffs;paused=true;E.update(20);paused=false;state='upgrade';E.update(20);state='combat';check(E.buffs.speed===buffTimes.speed&&E.buffs.attack===buffTimes.attack,'pause and shop freeze fruit buffs');
banana.cool=0;E.update(.01);p.x=bp.x;p.y=bp.y;E.update(.01);check(E.buffs.speed===.4&&E.speedBonus()===.4&&Math.abs(movementSpeed()/speed-1.4)<1e-6,'second banana adds another 20 percent');p.x=100;p.y=120;E.update(60);check(E.attackBonus()===.2&&E.speedBonus()===.4,'fruit attributes never expire');p.x=gp.x;p.y=gp.y;E.update(.01);check(E.attackBonus()===.4&&Math.abs(attackSpeedMultiplier()-attack-.4)<1e-6,'second grape adds another 20 percent');
E.remove(banana);E.remove(grape);check(E.speedBonus()===.4&&E.attackBonus()===.4,'removing supply source does not remove attributes within the floor');floor++;startWave();check(E.speedBonus()===0&&E.attackBonus()===0&&movementSpeed()===speed&&attackSpeedMultiplier()===attack,'actual next floor clears all fruit stacks and restores base movement and attack speed');
const nextGrape=E.place('grape',tiles.find(t=>E.canPlace('grape',t))),nextAt=E.center(nextGrape.anchor);nextGrape.cool=0;p.x=nextAt.x;p.y=nextAt.y;E.update(.01);check(E.attackBonus()===.2,'next floor starts a fresh grape stack');E.startRoom();check(E.speedBonus()===0&&E.attackBonus()===0,'room restart clears fruit stacks');

for(const kind of Object.keys(E.fruits)){
 setup();const f=E.place(kind,{x:0,y:0});for(const support of ['battery','echo','turbine'])E.place(support,tiles.find(c=>E.canPlace(support,c)&&E.shape(support,c).outputs.some(o=>f.cells.some(t=>t.x===o.x&&t.y===o.y))));E.update(30);check(f.products===2&&f.produced===2&&f.received>0,'fruit receives all power supports and holds echoed batch '+kind);check(E.buffs.speed===0&&E.buffs.attack===0,'uncollected supported fruit gives no buff');
}
setup();const resetFruit=E.place('banana',{x:0,y:0});resetFruit.cool=0;const rp=E.center(resetFruit.anchor);p.x=rp.x;p.y=rp.y;E.update(.01);E.startRoom();check(E.speedBonus()===0&&resetFruit.products===0&&resetFruit.cool===8,'room resets production and clears fruit attributes');resetFruit.cool=0;E.update(.01);check(E.speedBonus()===.2,'fruit can stack again after room reset');reset();check(E.speedBonus()===0&&E.attackBonus()===0,'new run clears stacked fruit attributes');
setup();const irrigator=E.place('irrigator',{x:0,y:0}),wet=E.place('apple',{x:1,y:0}),dry=E.place('apple',{x:3,y:3}),notPlant=E.place('miner',{x:-2,y:-2});notPlant.cool=100;wet.cool=dry.cool=8;
check(irrigator.cells.length===1&&irrigator.outputs.length===6,'irrigator one-cell footprint and six-cell range');check(E.recipients(irrigator).length===1&&E.recipients(irrigator)[0]===wet,'irrigation affects only adjacent fruit');E.update(3.99);check(irrigator.count===0,'irrigation waits four seconds');E.update(.01);check(irrigator.count===1&&Math.abs(wet.cool-2.5)<1e-6&&Math.abs(dry.cool-4)<1e-6&&Math.abs(notPlant.cool-96)<1e-6,'one irrigation reduces fruit cooldown by 1.5 only in range');
E.update(2.5);check(wet.products===1&&dry.products===0,'irrigation advances actual fruit production');const waterCount=irrigator.count,fruitReceived=wet.received;E.update(20);check(irrigator.count>waterCount&&irrigator.products===0&&wet.produced===1&&wet.products===1&&wet.received===fruitReceived&&wet.cool===5,'automatic irrigation cannot accelerate occupied fruit or produce pickups');
paused=true;const pausedWater=irrigator.count,pausedCool=irrigator.cool;E.update(20);paused=false;state='upgrade';E.update(20);state='combat';check(irrigator.count===pausedWater&&irrigator.cool===pausedCool,'pause and shop freeze irrigation');E.startRoom();check(irrigator.count===0&&irrigator.cool===4,'room resets irrigation');
check(E.move(irrigator,{x:3,y:-3}),'irrigator moves');check(!E.recipients(irrigator).includes(wet),'moving irrigator updates fruit coverage');
setup();const waterBattery=E.place('battery',{x:1,y:0}),batteryWater=E.place('irrigator',{x:0,y:0});E.place('apple',{x:-1,y:0});E.update(3);check(batteryWater.count===0,'boosted water still needs full cooldown');E.update(.1);check(batteryWater.count===1,'battery speeds up real irrigation');
setup();const waterTurbine=E.place('turbine',{x:-2,y:-1}),turbineWater=E.place('irrigator',{x:0,y:0});E.place('apple',{x:1,y:0});E.update(1.82);check(turbineWater.count===1&&turbineWater.received===2,'turbine accelerates real irrigation');
setup();E.place('echo',{x:-2,y:0});const echoWater=E.place('irrigator',{x:0,y:0}),echoFruit=E.place('apple',{x:1,y:0});echoFruit.cool=8;E.update(4);check(echoWater.count===1&&Math.abs(echoFruit.cool-2.5)<1e-6,'first water pulse');E.update(.17);check(echoWater.count===1,'water echo delayed');E.update(.01);check(echoWater.count===2&&Math.abs(echoFruit.cool-.82)<1e-6,'echo repeats irrigation cooldown reduction');E.update(.7);check(echoWater.count===2,'water echo never recurses');
E.startRoom();echoFruit.cool=8;E.update(4);E.remove(echoWater);const oldReceive=echoFruit.received;E.update(.2);check(echoFruit.received===oldReceive,'removed irrigation cancels scheduled echo');
setup();const doubled=E.place('watermelon',{x:0,y:1});for(let i=0;i<2;i++)E.place('irrigator',tiles.find(c=>E.canPlace('irrigator',c)&&E.shape('irrigator',c).outputs.some(o=>doubled.cells.some(t=>t.x===o.x&&t.y===o.y))));check(E.list().filter(f=>f.kind==='irrigator').every(f=>E.recipients(f).includes(doubled)),'two irrigators cover one fruit');E.update(4);check(Math.abs(doubled.cool-1)<1e-6&&doubled.received===2,'multiple irrigators stack pulses without buffing each other');
draw();const waterMesh=renderer.sprites.find(s=>s.iconKind==='irrigator').data;check(waterMesh.every(Number.isFinite),'finite resident water icon');draw();check(renderer.sprites.find(s=>s.iconKind==='irrigator').data===waterMesh,'water icon resident mesh reused');
setup();const pulse=E.place('pulse',{x:0,y:0}),pulseAt=E.center(pulse.anchor),pulseEnemy=target();const friendly={life:2},danger={clock:0},hazard={left:2},hostileTurret={type:'turret',x:500,y:300,hp:10};shots=[friendly];at(1,1).trap=danger;hazards=[hazard];turrets=[hostileTurret];const enemyHealth=pulseEnemy.hp;bullets=[{x:50,y:60,life:5},{x:600,y:550,life:5}];
check(pulse.cells.length===4&&pulse.outputs.length>0&&pulse.cool===15,'pulse uses 15-second interval with adjacent weapon range');E.update(14.99);check(pulse.products===0&&bullets.length===2,'pulse waits full 15-second interval');E.update(.01);renderer.begin();E.draw();check(pulse.products===1&&bullets.length===2&&renderer.residentMeshes.get('pickup-chip:'+E.defs.pulse.rarityColor).count>0,'ready pulse reuses original solid charge and does not auto-clear');E.update(40);check(pulse.products===1&&pulse.produced===1&&pulse.cool===15,'uncollected pulse blocks production');
p.x=pulseAt.x;p.y=pulseAt.y;E.update(.01);check(pulse.products===0&&pulse.count===1&&bullets.length===0&&shockWaves.length===1,'pulse pickup invokes original full-screen clearing wave');check(shockWaves[0].x===pulseAt.x&&shockWaves[0].y===pulseAt.y,'pulse wave starts at source cell');check(pulseEnemy.hp===enemyHealth&&shots.includes(friendly)&&hazards.includes(hazard)&&at(1,1).trap===danger&&turrets.includes(hostileTurret),'clear preserves enemies friendly shots traps hazards and hostile turrets');check(pulse.cool===15,'pulse pickup restarts complete cooldown');
setup();const pb=E.place('battery',{x:-1,y:0}),boostedPulse=E.place('pulse',{x:0,y:0});E.update(11.99);check(boostedPulse.products===0,'battery pulse still waits required effective cooldown');E.update(.01);check(boostedPulse.products===1,'battery advances real pulse production to 12 seconds');
setup();E.place('turbine',{x:-2,y:-1});const turbinePulse=E.place('pulse',{x:0,y:0});turbinePulse.cool=4;E.update(1.82);check(turbinePulse.products===1&&turbinePulse.received===2,'turbine accelerates pulse production');
setup();E.place('echo',{x:-2,y:0});const echoPulse=E.place('pulse',{x:0,y:0});echoPulse.cool=0;E.update(.01);E.update(.18);check(echoPulse.products===2&&echoPulse.produced===2,'echo makes extra pulse charge');E.update(50);check(echoPulse.products===2&&echoPulse.produced===2,'echo pulse never loops or skips pickup');const ep=E.center(echoPulse.anchor);p.x=ep.x;p.y=ep.y;bullets=[{life:1}];E.update(.01);check(echoPulse.products===1&&echoPulse.count===1&&bullets.length===0,'first echo charge clears bullets');bullets=[{life:1}];E.update(.25);check(echoPulse.products===0&&echoPulse.count===2&&bullets.length===0&&echoPulse.cool===15,'second echo charge clears new bullets then restarts clock');
setup();const pausedPulse=E.place('pulse',{x:0,y:0});paused=true;E.update(50);paused=false;state='upgrade';E.update(50);state='combat';check(pausedPulse.products===0&&pausedPulse.cool===15,'pulse freezes outside active battle');E.update(15);E.startRoom();check(pausedPulse.products===0&&pausedPulse.cool===15&&pausedPulse.count===0,'new floor resets pulse charges and cooldown');
setup();grantTerrainPassive('震荡手雷');const passivePulse=E.place('pulse',{x:0,y:0}),stunned=target();passivePulse.cool=0;const pp=E.center(passivePulse.anchor);p.x=pp.x;p.y=pp.y;E.update(.01);check(stunned.terrainStun===1.2,'pulse retains original shock passive effects');
setup();const framePulse=E.place('pulse',{x:0,y:0}),fp=E.center(framePulse.anchor);p.x=fp.x;p.y=fp.y;p.inv=0;framePulse.products=1;enemies=[];bullets=[{x:p.x,y:p.y,vx:0,vy:0,r:3,life:3,color:'#ffffff'}];const frameHp=p.hp;step(.016);check(p.hp===frameHp&&bullets.length===0&&framePulse.count===1,'pulse clears overlapping hostile bullets before real-frame player collision');
// Pulse powers whole adjacent weapons once, refreshes duration, and snapshots actual damage.
setup();const amplifier=E.place('pulse',{x:0,y:0}),poweredTower=near('tower',amplifier),farTower=E.place('tower',tiles.find(c=>E.canPlace('tower',c)&&!E.shape('tower',c).cells.some(t=>amplifier.outputs.some(o=>o.x===t.x&&o.y===t.y))));
check(poweredTower&&farTower&&E.recipients(amplifier).length===1,'pulse only powers touching electrical weapons');
const ampAt=E.center(amplifier.cells[0]),baseDamage=E.towerDamage(poweredTower);amplifier.products=1;poweredTower.cool=farTower.cool=100;p.x=ampAt.x;p.y=ampAt.y;E.update(.01);
check(Math.abs(E.towerDamage(poweredTower)-baseDamage*1.3)<1e-8&&E.towerDamage(farTower)===6,'pulse gives 30 percent damage only nearby');
paused=true;E.update(20);paused=false;state='upgrade';E.update(20);state='combat';check(poweredTower.damageBoostLeft===5,'pause and shop freeze damage boost');
E.update(2);amplifier.products=1;amplifier.pickupCool=0;E.update(.01);check(poweredTower.damageBoostLeft===5&&Math.abs(E.towerDamage(poweredTower)-baseDamage*1.3)<1e-8,'repeated pulse refreshes without multiplication');
enemies=[];const towerAt=E.facilityCenter(poweredTower),ampVictim={x:towerAt.x+70,y:towerAt.y,hp:100,max:100,r:13,type:'eye',t:0,fire:999,seed:1,homeX:towerAt.x+70,homeY:towerAt.y};enemies=[ampVictim];poweredTower.cool=0;shots=[];Object.assign(p,E.center(poweredTower.cells[0]));E.update(.01);check(Math.abs(shots[0].damage-7.8)<1e-8,'powered shot captures increased damage');step(.01);check(Math.abs(ampVictim.hp-92.2)<1e-6,'pulse bonus deals real damage');
p.x=100;p.y=120;E.update(5.01);check(poweredTower.damageBoostLeft===0&&E.towerDamage(poweredTower)===baseDamage,'boost expires after five active seconds');
amplifier.products=1;amplifier.pickupCool=0;p.x=ampAt.x;p.y=ampAt.y;E.update(.01);E.startRoom();check(poweredTower.damageBoostLeft===0&&E.towerDamage(poweredTower)===baseDamage,'floor reset clears pulse damage boost');
setup();const bio=E.place('biogenerator',{x:0,y:0}),food=E.place('apple',{x:1,y:0}),outsideFood=E.place('apple',{x:3,y:3}),bloodAt=E.center(bio.anchor),foodAt=E.center(food.anchor);check(bio.cells.length===1&&bio.outputs.length===6,'bio generator occupies one cell and refreshes six neighbors');p.hp=p.max=3;p.shield=2;p.inv=999;p.x=bloodAt.x;p.y=bloodAt.y;E.update(.01);check(p.hp===2&&p.shield===2&&p.inv===999&&bio.count===1&&food.products===1&&outsideFood.products===0,'entry trades exactly one real hp despite shield/invulnerability and immediately produces adjacent food');E.update(2);check(p.hp===2&&bio.count===1,'standing on bio never repeatedly charges life');
for(let cycle=0;cycle<3;cycle++){p.x=foodAt.x;p.y=foodAt.y;E.update(.3);check(p.hp===3&&food.products===0,'food refills spent hp '+cycle);p.x=bloodAt.x;p.y=bloodAt.y;E.update(.01);check(p.hp===2&&food.products===1&&bio.count===cycle+2,'step back trades hp for new fruit '+cycle);}
// A waiting product is not overwritten and costs no health.
p.x=100;p.y=120;E.update(.01);p.hp=3;p.x=bloodAt.x;p.y=bloodAt.y;const beforeFull=bio.count;E.update(.01);check(p.hp===3&&food.products===1&&food.cool===5&&bio.count===beforeFull,'full output blocks refresh and avoids paying for nothing');
p.x=foodAt.x;p.y=foodAt.y;p.hp=2;E.update(.3);p.x=100;p.y=120;E.update(.01);p.hp=1;p.x=bloodAt.x;p.y=bloodAt.y;E.update(.01);check(p.hp===1&&bio.count===beforeFull&&food.products===0,'one hp cannot activate bio');p.hp=3;E.update(.01);check(bio.count===beforeFull,'healing while standing does not auto-activate');p.x=100;p.y=120;E.update(.01);p.hp=1.5;p.x=bloodAt.x;p.y=bloodAt.y;E.update(.01);check(p.hp===1.5&&bio.count===beforeFull,'fractional health still preserves at least one hp');
setup();tiles=[];for(let y=-5;y<=5;y++)for(let x=-6;x<=6;x++)tiles.push({x,y});const supportBio=E.place('biogenerator',{x:0,y:0}),bioTurbine=E.place('turbine',{x:-2,y:-1}),bioIrrigator=E.place('irrigator',{x:1,y:0}),bioPulse=near('pulse',supportBio),bioCoin=near('miner',supportBio);const sb=E.center(supportBio.anchor);p.hp=p.max=3;p.x=sb.x;p.y=sb.y;E.update(.01);check(supportBio.lastRefreshed===4&&bioTurbine.count===1&&bioIrrigator.count===1&&bioPulse.products===1&&bioCoin.products===1&&p.hp===2,'one payment refreshes all adjacent production and timed support systems');
check(!E.recipients(bioTurbine).includes(supportBio),'bio generator cannot be powered automatically');draw();const bioMesh=renderer.sprites.find(s=>s.iconKind==='biogenerator').data;check(bioMesh.every(Number.isFinite),'bio icon finite resident mesh');draw();check(renderer.sprites.find(s=>s.iconKind==='biogenerator').data===bioMesh,'bio icon geometry reused');
setup();const frozenBio=E.place('biogenerator',{x:0,y:0});E.place('apple',{x:1,y:0});const fb=E.center(frozenBio.anchor);p.x=fb.x;p.y=fb.y;p.hp=3;paused=true;E.update(1);paused=false;state='upgrade';E.update(1);state='combat';check(p.hp===3&&frozenBio.count===0,'paused and shop steps never spend hp');E.update(.01);check(p.hp===2&&frozenBio.count===1,'normal combat entry activates after preparation');E.startRoom();check(frozenBio.count===0&&!frozenBio.occupied,'room resets bio entry latch and counters');
setup();const lonelyBio=E.place('biogenerator',{x:0,y:0}),lb=E.center(lonelyBio.anchor);p.x=lb.x;p.y=lb.y;p.hp=3;E.update(1);check(p.hp===3&&lonelyBio.count===0,'no valid targets means no health charge');
setup();const removedCoil=E.place('echo',{x:0,y:0}),coilMine=near('miner',removedCoil);coilMine.cool=0;E.update(.01);E.remove(removedCoil);E.update(.2);check(coilMine.products===1&&coilMine.produced===1,'removing echo source cancels its pending extra output');
// The original cover is a real six-sided obstacle in the default hex engine.
for(const row of [0,1])for(let direction=0;direction<6;direction++){
 setup();const wall=at(0,row);wall.coverTile=true;wall.coverHp=coverMaximum();const c=E.center(wall),angle=direction*Math.PI/3,dx=Math.cos(angle),dy=Math.sin(angle);p.x=c.x+dx*90;p.y=c.y+dy*90;walkFloor(p,c.x-dx*90,c.y-dy*90,7);check(!coverContains(wall,p.x,p.y,7)&&(p.x-c.x)*dx+(p.y-c.y)*dy>0,'hex roadblock prevents crossing for every face and row parity');
 const hit=coverSegment(wall,c.x+dx*90,c.y+dy*90,c.x-dx*90,c.y-dy*90,4);check(hit&&hit.tile===wall&&hit.f>0&&hit.f<.5,'six-sided roadblock intercepts swept bullet path');
}
setup();const hexWall=at(0,0),hc=E.center(hexWall);hexWall.coverTile=true;hexWall.coverHp=coverMaximum();p.x=hc.x+100;p.y=hc.y;p.inv=0;const protectedHp=p.hp;bullet(hc.x-100,hc.y,0,1000);updateEnemyBullets(.2);check(p.hp===protectedHp&&bullets.length===0&&hexWall.coverHp===3,'actual hex wall absorbs enemy bullet before player');
const wallMeshBefore=(()=>{draw();return renderer.residentMeshes.get('hex-cover:block').data;})();draw();check(renderer.residentMeshes.get('hex-cover:block').data===wallMeshBefore&&!renderer.residentMeshes.has('cover:block'),'default engine uses shared hexagonal wall mesh');
damageCover(hexWall,99);check(hasTile(0,0)&&canWalkAt(hc.x,hc.y,7),'broken roadblock preserves walkable floor');p.x=hc.x;p.y=hc.y;refreshCoverTiles();check(hexWall.coverHp===4&&!coverContains(hexWall,p.x,p.y,7),'next-floor rebuild safely relocates overlapping player');
// Only each facility core uses the floor mask, including waiting products.
for(const kind of Object.keys(E.defs).filter(E.enabled)){
 setup();const f=E.place(kind,{x:0,y:0}),scan=renderer.emissiveSquareScan,arc=renderer.arc,calls=[];let arcs=0;
 renderer.emissiveSquareScan=(...args)=>calls.push(args);renderer.arc=()=>arcs++;
 try{
  for(const progress of [0,.25,.5,1]){
   calls.length=0;f.flash=0;f.cool=(E.defs[kind].interval||0)*(1-progress);f.products=0;E.draw();
   const expected=['slow_field','echo','biogenerator','battery'].includes(kind)?1:progress;
   check(calls.length===1&&calls.every(a=>a[2]===TILE-3&&a[3]===TILE*1.06-3&&Math.abs(a[4]-expected)<1e-8),'six-sided floor mask and exact progress on core only '+kind);
  }
  if(['miner','pulse',...Object.keys(E.fruits)].includes(kind)){calls.length=0;f.products=1;f.cool=E.defs[kind].interval;E.draw();check(calls.every(a=>a[4]===1),'waiting product keeps full mask '+kind);}
  if(kind==='battery'){E.update(2.5);calls.length=0;E.draw();check(calls.every(a=>Math.abs(a[4]-.75)<1e-8),'battery mask preserves remaining opening window');}
  check(arcs===0,'no circular progress '+kind);
 }finally{renderer.emissiveSquareScan=scan;renderer.arc=arc;}
}
// New production footprints remain one facility and one product on both row parities.
for(const row of [0,1])for(const kind of ['pulse','miner']){
 setup();const anchor={x:0,y:row},s=E.shape(kind,anchor);
 check(s.cells.length===(kind==='miner'?7:4),'requested footprint size '+kind);
 if(kind==='miner'){
  const rings=[0,0],aq=anchor.x-(anchor.y-(anchor.y&1))/2;
  for(const c of s.cells){const q=c.x-(c.y-(c.y&1))/2-aq,r=c.y-anchor.y,d=Math.max(Math.abs(q),Math.abs(r),Math.abs(q+r));check(d<=1,'miner stays within compact hexagon');rings[d]++;}
  check(rings.join(',')==='1,6','miner has one complete hex ring');
 }else{
  const [ll,lr,ul,ur]=s.cells.map(E.center),a=[lr.x-ll.x,lr.y-ll.y],b=[ul.x-ll.x,ul.y-ll.y];
  check(a[0]*b[0]+a[1]*b[1]>0&&ll.x<ur.x&&ll.y>ur.y,'rhombus acute corners are lower left and upper right');
 }
 const blocked=s.cells.at(-1);at(blocked.x,blocked.y).trap={clock:0};check(!E.place(kind,anchor),'secondary cell rejects whole footprint');delete at(blocked.x,blocked.y).trap;
 const f=E.place(kind,anchor);check(f&&s.cells.every(c=>at(c.x,c.y).electricFacility===f),'whole footprint shares one facility');
 const old=f.cells.map(c=>at(c.x,c.y));check(!E.move(f,{x:99,y:99})&&old.every(t=>t.electricFacility===f),'invalid move preserves every cell');
 check(E.move(f,{x:-1,y:-1}),'multi-cell facility can move');check(old.filter(t=>!f.cells.some(c=>c.x===t.x&&c.y===t.y)).every(t=>!t.electricFacility),'move frees every vacated cell');
 f.products=1;let chips=0;const chip=drawTilePickupChip;drawTilePickupChip=()=>chips++;try{E.draw();}finally{drawTilePickupChip=chip;}check(chips===1,'one visible product per facility');
 const edge=E.center(f.cells.find(c=>c.x!==f.anchor.x||c.y!==f.anchor.y));p.x=edge.x;p.y=edge.y;const paid=cash;E.update(.01);check(f.products===0&&(kind!=='miner'||cash===paid+8),'non-anchor pickup pays once');
 const occupied=f.cells.map(c=>at(c.x,c.y));E.remove(occupied.at(-1).electricFacility);check(occupied.every(t=>!t.electricFacility)&&E.list().length===0,'non-anchor removal releases whole facility');
}
for(const row of [0,1]){
 setup();const f=E.place('tower',{x:0,y:row});check(f.cells.length===3&&E.list().length===1,'three cells share one tower on either row parity');
 for(const c of f.cells){check(at(c.x,c.y).electricFacility===f&&!E.canPlace('miner',c),'every tower cell reserves its footprint');check(!builderTileAvailable(at(c.x,c.y)),'builder protects every tower cell');}
 f.products=1;const resident=renderer.residentMesh;let models=0;renderer.residentMesh=function(key,...args){if(key==='electric:plasma-bomb')models++;return resident.call(this,key,...args);};try{draw();}finally{renderer.residentMesh=resident;}check(models===1,'three occupied cells render exactly one bomb');
 const old=f.cells.map(c=>at(c.x,c.y));at(3,2).trap={clock:0};check(!E.move(f,{x:2,y:2})&&old.every(t=>t.electricFacility===f),'secondary-cell conflict rejects whole move');
 check(!E.canPlace('tower',{x:6,y:row})&&!E.canPlace('tower',{x:5,y:5}),'whole horizontal footprint must fit board');
 check(E.move(f,{x:-3,y:-2})&&old.every(t=>!t.electricFacility)&&f.cells.every(c=>at(c.x,c.y).electricFacility===f),'move releases old footprint and binds new horizontal footprint');
 const occupied=f.cells.map(c=>at(c.x,c.y));E.remove(occupied[1].electricFacility);check(occupied.every(t=>!t.electricFacility)&&E.list().length===0,'removing from non-anchor cell releases entire tower');
}
setup();const edgeBattery=E.place('battery',{x:0,y:0}),wideTower=E.place('tower',{x:-3,y:0});check(!edgeBattery.outputs.some(c=>c.x===wideTower.anchor.x&&c.y===wideTower.anchor.y)&&E.recipients(edgeBattery).filter(f=>f===wideTower).length===1,'support reaches non-anchor tower cell once');
setup();const mergeA=E.place('tower',{x:-3,y:0}),mergeB=E.place('tower',{x:1,y:0}),mergeCells=mergeA.cells.map(c=>at(c.x,c.y));
check(mergeA.cells.every(c=>c.y===0)&&mergeA.cells.map(c=>c.x).join(',')==='-3,-2,-1','tower occupies three horizontal consecutive cells');
check(!E.merge(mergeA,mergeA)&&E.list().length===2,'self merge is rejected without consuming source');
check(E.merge(mergeA,mergeB)===mergeB&&mergeB.level===2&&E.list().length===1&&mergeCells.every(t=>!t.electricFacility),'same-level merge upgrades target and frees source footprint');
check(Math.abs(E.towerDamage(mergeB)-10.8)<1e-8&&mergeB.cells.length===3,'level two gains 1.8 damage multiplier at same footprint');
const low=E.place('tower',{x:-3,y:0});check(!E.merge(low,mergeB)&&E.list().length===2&&mergeB.level===2,'different levels cannot merge');E.remove(low);
const otherTwo=E.place('tower',{x:-3,y:0},2);check(E.merge(otherTwo,mergeB)&&mergeB.level===3&&Math.abs(E.towerDamage(mergeB)-19.44)<1e-8,'two level-two towers merge to level three');
const maxTower=E.place('tower',{x:-3,y:0},3);check(!E.merge(maxTower,mergeB)&&E.list().length===2,'maximum-level towers cannot merge');E.remove(maxTower);
E.startRoom();check(mergeB.level===3&&E.move(mergeB,{x:0,y:1})&&mergeB.level===3,'room reset and movement preserve upgrade level');
const highAt=E.facilityCenter(mergeB),victim={x:highAt.x+80,y:highAt.y,hp:500,max:500,r:13,type:'eye',t:0,fire:999,seed:1,homeX:highAt.x+80,homeY:highAt.y};enemies=[victim];mergeB.cool=0;Object.assign(p,E.center(mergeB.cells[0]));E.update(.01);check(Math.abs(shots[0].damage-19.44)<1e-8,'level-three attack snapshots upgraded damage');step(.01);check(Math.abs(victim.hp-480.56)<1e-6,'upgraded attack deals real scaled damage');
check(E.merge({kind:'tower',level:1},mergeB)===false,'new level-one offer cannot merge into upgraded tower');
reset();check(E.list().length===0,'new run clears layout with energy system disabled');
console.log('Electric facilities: fixed footprint placement, occupancy, movement, adjacent supply, ten-second battery cooldown boost, turbine warmup, delayed nonrecursive echo, real damage, pause/floor/reset lifecycle fruit production/healing/real movement and attack buffs, within-floor stacking, next-floor clearing and resident rendering passed.');
}`,sandbox);

const fs=require('node:fs'),vm=require('node:vm');
const H=require('../dist/hex-map.js'),elements={};
const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{},hidden:true,classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const sandbox={Image:class {complete=true;naturalWidth=256;},HexMap:H,console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);
for(const file of ['music','renderer','map-icons','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss','electric-tiles']){const src=fs.readFileSync('dist/'+file+'.js','utf8');vm.runInContext(file==='game'?H.transform(src):src,sandbox);}

vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
function setup(){reset();startWave();state='combat';paused=false;timedRoom={duration:999,remaining:999,nextWaveAt:999};enemies=[];missiles=[];bullets=[];shots=[];hazards=[];turrets=[];spawnQueue=[];enemyTransports=[];p.x=325;p.y=300;p.inv=999;shootTimer=999;}
function target(x=p.x+40,y=p.y){const e={type:'eye',x,y,homeX:x,homeY:y,hp:500,max:500,r:14,t:0,fire:999,seed:0};enemies.push(e);return e;}
for(const def of BOMB_TYPES)for(const tier of [1,2,3,4,5]){
 setup();const w=weapon,d=drone,tilesBefore=tiles.length,e=createBomb(def.id,tier);equipItem('bomb',e);
 check(equipmentInSlot('bomb')===bombEquipment&&weapon===w&&drone===d,'independent slot');
 check(tiles.length===tilesBefore&&ElectricTiles.list().every(f=>!ElectricTiles.isBomb(f.kind)),'no floor footprint');
 check(bombCooldown===15&&e.interval===15,'longer fixed cooldown');
 const mob=target();updateBombEquipment(14.99);check(shots.length===0&&!ElectricTiles.frozen(mob),'no early activation');
 paused=true;updateBombEquipment(5);paused=false;check(Math.abs(bombCooldown-.01)<1e-6,'pause freezes cooldown');
 state='upgrade';updateBombEquipment(5);state='combat';check(Math.abs(bombCooldown-.01)<1e-6,'shop freezes cooldown');
 updateBombEquipment(.01);check(bombCooldown===15,'activation consumes cooldown');
 if(def.id==='freeze_bomb')check(ElectricTiles.frozen(mob),'equipped freeze works');
 else check(shots.length>0&&shots.every(s=>s.source==='bomb'&&!s.terrainShot&&!s.electricFacilityShot),'equipment owns emitted attacks');
 if(def.id==='laser_bomb'){check(shots.length===1+e.level,'laser level');const beam=shots[0];p.x+=15;advanceFriendlyShot(beam,.1);check(beam.originX===p.x&&beam.life<3,'laser follows player');}
 if(def.id==='missile_bomb')check(shots.some(s=>s.tileMissile&&s.homingTarget===mob),'missile locks enemy');
 if(def.id==='tower'){const before=mob.hp;step(.01);check(mob.hp<before,'plasma real damage');}
 const carried=bombCooldown;startFloorTracking();check(bombCooldown===carried&&bombEquipment.id===def.id,'equipment persists across floor');
 updateBombEquipment(3);const remaining=bombCooldown;startFloorTracking();check(bombCooldown===remaining,'cooldown carries between rooms');
 equipItem('bomb',createBomb('laser_bomb'));check(bombEquipment.id==='laser_bomb'&&bombCooldown===15,'replacement starts full cooldown');
 reset();check(!bombEquipment&&bombCooldown===0,'restart clears slot');
}
// Exercise the public equipment rendering route after facility ownership is removed.
for(const tier of [1,2,3,4,5]){
 setup();equipItem('bomb',createBomb('tower',tier));
 for(let i=0;i<26;i++)target(p.x+30+(i%6)*24,p.y-100+Math.floor(i/6)*42);
 const trap={type:'turret',x:p.x+5,y:p.y,hp:500};turrets=[trap];
 updateBombEquipment(15);const discharge=shots[0],edges=discharge.arcSegments;
 check(discharge.plasmaDischarge&&!discharge.electricFacilityShot&&discharge.source==='bomb','equipment retains electric visual route');
 check(edges.length===ElectricTiles.towerTargetLimit({level:bombEquipment.level})&&new Set(edges.map(e=>e.to)).size===edges.length,'one incoming edge per selected victim');
 check(edges.filter(e=>e.from===p).length===3,'three branches originate at player');
 check(edges.some(e=>e.from!==p&&edges.filter(q=>q.from===e.from).length===2),'hit targets fork to multiple victims');
 check(edges.every(e=>e.from===p||discharge.arcTargets.indexOf(e.from)<discharge.arcTargets.indexOf(e.to)),'branch tree has no cycles');
 const oldX=edges[0].from.x;p.x+=10;check(edges[0].from.x===oldX+10,'player roots follow moving player');
 const originalBeam=modelBeam,calls=[];modelBeam=(...args)=>{calls.push(args);originalBeam(...args);};
 renderer.begin();drawFriendlyShot(discharge);modelBeam=originalBeam;
 const v=modelVisual(createWeaponModel('tesla_t3'));
 check(calls.some(c=>c[6]===v.color)&&calls.some(c=>c[6]===v.accent)&&new Set(calls.map(c=>c[6])).size===2,'actual equipment draw uses tower dual colored strands');
 const hp=discharge.arcTargets.map(e=>e.hp);step(.01);
 check(discharge.arcTargets.every((e,i)=>Math.abs(e.hp-(hp[i]-discharge.damage*Math.pow(.7,i)))<1e-6)&&trap.hp===500,'tree hits each victim once with existing damage and excludes trap');
 const after=discharge.arcTargets.map(e=>e.hp);step(.1);check(discharge.arcTargets.every((e,i)=>e.hp===after[i]),'visible discharge never repeats damage');
 paused=true;const left=discharge.life;step(1);paused=false;check(discharge.life===left,'pause freezes branched discharge');
 for(let i=0;i<90;i++)step(.01);check(!shots.includes(discharge),'branched discharge expires');
}
setup();equipItem('bomb',createBomb('tower'));updateBombEquipment(15);check(bombCooldown===0&&!shots.length,'empty room keeps ready');
const trap={type:'turret',x:p.x+20,y:p.y,hp:500};turrets=[trap];updateBombEquipment(.1);check(bombCooldown===0&&!shots.length&&trap.hp===500,'hazard turret cannot trigger');
target();updateBombEquipment(.01);check(bombCooldown===15&&shots.length>0,'new target uses ready bomb');
setup();equipItem('bomb',createBomb('freeze_bomb'));target(p.x+500);updateBombEquipment(15);check(bombCooldown===0,'freeze waits for local threat');bullets=[{x:p.x+20,y:p.y,r:4}];updateBombEquipment(.01);check(bombCooldown===15&&!bullets.length,'freeze responds to local projectile');
setup();state='survival';equipItem('bomb',createBomb('laser_bomb'));target();updateBombEquipment(15);check(shots.some(s=>s.bombLaser),'survival activation');
setup();equipItem('bomb',createBomb('tower'));timedRoom.introLeft=1;step(.5);check(bombCooldown===15,'intro does not consume cooldown');
setup();state='upgrade';cash=999;const held=weapon;const offer=equipmentShopItem('bomb');offer.price=shopPrice(offer);shopItems=[offer];const price=offer.price;check(shopItemDescription(offer)==='获得一份CD较长的爆发武器。','requested bomb description');check(buyShopItem(0)&&cash===999-price&&!bombEquipment,'paid reveal');check(confirmEquipmentPurchase()&&bombEquipment&&weapon===held,'purchase equips bomb slot');
check(shopEquipmentSlots().includes('data-slot="bomb"')&&equipmentStatRows('bomb',bombEquipment)[0][1](bombEquipment)===15,'slot and cooldown visible');
check(shopItemIcon({key:'bomb',equipment:bombEquipment}).includes('equipment-icons/'+bombEquipment.id+'-48.png'),'specific bomb icon');
check(takeTestEquipment('bomb','missile_bomb',5)&&bombEquipment.id==='missile_bomb'&&bombEquipment.name==='导弹','F2 equipment route shows the renamed missile');
console.log('Bomb equipment: independent slot, all four effects / five qualities, 15-second CD, pause/shop/intro, target gating, survival, floor carry, replacement/reset, shop reveal and F2 passed.');
}`,sandbox);

const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {createStore,catalog}=require('../dist/talents.js');
const saved=new Map(),storage={getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)};
const a=createStore(storage);assert.equal(catalog.length,15);a.credit(100);let d=a.draft();
assert(!a.change(d,'damage',1));assert.equal(d.balance,100);
assert(a.credit(0,{skill0:6}));d=a.draft();
assert(a.change(d,'damage',1));assert(a.change(d,'damage',1));assert.equal(d.balance,25);assert.equal(a.cost('damage',2),125);assert(a.save(d));
assert.equal(createStore(storage).view().levels.damage,2);d=a.draft();a.reset(d);assert.equal(d.balance,100);assert.equal(d.materials.skill0,6);assert(a.save(d));
d=a.draft();for(let i=0;i<2;i++)assert(a.change(d,'damage',1));assert.equal(d.balance,25);assert(!a.change(d,'damage',1));assert(a.save(d));
d=a.draft();a.reset(d);assert(a.change(d,'move',1));assert(a.save(d));assert.equal(a.view().balance,96);
const stale=a.draft();a.credit(1);assert.equal(a.save(stale),false);assert.equal(a.credit(-1),false);assert.equal(a.credit(Infinity),false);
d=a.draft();d.levels.move=100;assert.equal(a.save(d),false);
const paced=createStore(storage,'paced');
assert.equal(paced.cost('pointYield',0),60);assert.equal(paced.cost('reinforcements',0),10);
assert(paced.credit(100,{skill0:15}));let first=paced.draft();
assert(paced.change(first,'damage',1));assert(paced.change(first,'rate',1));
assert(paced.change(first,'damage',1));assert.equal(first.balance,0);assert(paced.save(first));
assert(paced.credit(200));let mixed=paced.draft();
assert(paced.change(mixed,'pointYield',1));assert(paced.change(mixed,'damage',1));
const mixedCosts=mixed.paid.damage.slice();assert(paced.save(mixed));
assert.deepEqual(mixedCosts,[25,50,125]);
assert.deepEqual(createStore(storage,'paced').view().paid.damage,mixedCosts);
const refundAll=paced.draft();paced.reset(refundAll);assert(paced.save(refundAll));assert.equal(paced.view().balance,300);
const blocked=createStore({getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}});blocked.credit(3);blocked.credit(4);assert.equal(blocked.view().balance,7);assert(blocked.warning);
const elements={},gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const data=new Map(),sandbox={console,Float32Array,performance:{now:()=>0},localStorage:{getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>id==='material-popups'?null:elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);for(const f of ['talents','music','renderer','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss'])vm.runInContext(fs.readFileSync('dist/'+f+'.js','utf8'),sandbox);
vm.runInContext(`{
 const t=TalentRuntime,check=(v,m)=>{if(!v)throw Error(m)},near=(v,w,m)=>check(Math.abs(v-w)<1e-7,m+': '+v+' / '+w);
 t.store.credit(100000,{skill0:300,skill1:300,skill2:300});let draft=t.store.draft();for(const s of t.catalog)for(let i=0;i<s.max;i++)check(t.store.change(draft,s.id,1),'buy '+s.id);check(t.store.save(draft),'save max');reset();state='combat';timedRoom={remaining:30,nextWaveAt:999};spawnQueue=[];
 check(p.max===3&&p.hp===3&&p.shield===0&&shieldMaximum()===2,'starting life and shield');near(movementSpeed(),195*1.1,'movement');near(supplyPickupRadius(),40,'pickup');near(damageInvincibility(),1.6,'invulnerability');check(!t.catalog.some(s=>s.id==='shovel'),'retired shovel talent');
 weapon=createWeapon('pulse');const base={...weapon};shots=[];const random=Math.random;Math.random=()=>0;emitWeaponShots(weapon,0,p);near(t.damage(shots[0],shots[0].damage),1.5,'main damage at shared hit resolver');near(Math.hypot(shots[0].vx,shots[0].vy),base.speed*1.3,'bullet speed');near(Math.atan2(shots[0].vy,shots[0].vx),-base.spread*.7/2,'single shot spread tightened');near(shots[0].knockback,base.knockback*1.15,'pistol knockback uses talent');check(t.applies({id:'recoil'},weapon),'recoil talent applies to light guns');check(shots[0].pierce===1,'special penetration removed from attributes');near(t.critical(shots[0]).chance,.10,'critical chance');near(t.critical(shots[0]).multiplier,3,'critical multiplier');check(weapon.damage===base.damage&&weapon.speed===base.speed&&weapon.spread===base.spread,'equipment stats restored');
 shots=[];weapon=createWeapon('shotgun');emitWeaponShots(weapon,0,p);near(Math.atan2(shots[4].vy,shots[4].vx),2*weapon.spread*.7,'spread tightened');check(shots.length===5,'pellets unchanged');
 shots=[];weapon=createWeapon('rocket');emitWeaponShots(weapon,0,p);near(shots[0].blastRadius,weapon.blastRadius*1.1,'explosion radius');near(Math.hypot(shots[0].vx,shots[0].vy),weapon.speed,'rocket speed unchanged');near(Math.atan2(shots[0].vy,shots[0].vx),-weapon.spread*.7/2,'rocket spread tightened');check(shots[0].pierce===1,'rocket no piercing');
 shots=[];weapon=createWeaponModel('laser_t5');emitWeaponShots(weapon,0,p);near(shots[0].hitRadius,12*weapon.visual.size,'laser width stays unchanged');near(shots[0].life,.8,'laser duration unchanged');
 weapon=createWeaponModel('sniper_t5');p.weaponRecoilVX=0;p.weaponRecoilVY=0;applyWeaponRecoil(weapon,0);near(p.weaponRecoilVX,-54*12*.75,'physical recoil');near(movementSpeed(),195*1.1*(1-weapon.speedPenalty*.75),'heavy handling');
 shots=[];weapon=createWeapon('tesla');enemies=[{type:'eye',x:p.x+20,y:p.y,hp:100,r:10},{type:'eye',x:p.x+150,y:p.y,hp:100,r:10}];emitWeaponShots(weapon,0,p);check(shots[0].arcTargets.length===1,'special arc range removed');check(!('chainRange'in weapon),'arc temporary field restored');
 Math.random=()=>.99;
 for(const source of ['weapon','drone','mount','mech','player','armor','glass']){
  const hit=resolveShotDamage({source,critChance:0},10,null);near(hit.damage,15,source+' unified damage once');
  const profile=t.critical({source,critChance:0});near(profile.chance,.10,source+' shared critical chance');
  const rocket={source,blastRadius:50,knockback:100};t.prepare(rocket);t.prepare(rocket);near(rocket.blastRadius,55,source+' explosion radius once');near(rocket.knockback,115,source+' knockback once');
 }
 near(resolveShotDamage({source:'terrain',critChance:0},10,null).damage,10,'terrain does not inherit player attributes');
 near(t.critical({source:'weapon',critChance:0,drinkDot:true}).chance,0,'noncritical damage stays noncritical');
 near(attackSpeedMultiplier(),1.4,'shared attack speed');
 shots=[];const droneGun=createWeapon('pulse');emitWeaponShots(droneGun,0,p,'drone');near(Math.hypot(shots[0].vx,shots[0].vy),droneGun.speed*1.3,'drone bullet speed');
 shots=[];const mountGun=createWeapon('rocket');emitWeaponShots(mountGun,0,p,'mount');near(shots[0].blastRadius,mountGun.blastRadius*1.1,'mount explosion through factory');
 // Actual hit pipeline must apply one multiplier to explosion children as well.
 const rocket=shots[0];rocket.x=p.x;rocket.y=p.y;explodeFriendlyRocket(rocket,[]);near(resolveShotDamage(shots.at(-1),shots.at(-1).damage,null).damage,mountGun.damage*1.5,'derived explosion damage once');
 // Offensive companion timers speed up, utility timers retain their original rhythm.
 drone={companion:true,id:'ram',damage:2,interval:2,speed:0,motion:{x:p.x,y:p.y,clock:1,block:1}};updateCompanion(.1,[]);near(drone.motion.clock,.86,'offensive companion attack clock');
 drone={companion:true,id:'medic',interval:2,motion:{x:p.x,y:p.y,clock:1,block:1}};updateCompanion(.1,[]);near(drone.motion.clock,.9,'medic clock unchanged');drone=null;

 // Run real collision and HP deduction with the shared sources, including a derived blast.
 shoes=null;armor=null;drone=null;shootTimer=999;spawnQueue=[];timedRoom={remaining:999,nextWaveAt:999};p.inv=999;
 for(const source of ['weapon','drone','mount']){
  const target={type:'spitter',x:p.x+60,y:p.y-50,hp:100,max:100,r:14,t:0,fire:999,seed:0,homeX:p.x+60,homeY:p.y-50};enemies=[target];shots=[{source,x:target.x,y:target.y,vx:0,vy:0,life:1,damage:10,critChance:0,pierce:1,hitTargets:new Set()}];step(.001);near(target.hp,85,source+' actual HP deduction');
 }
 const blastTarget={type:'spitter',x:p.x+113,y:p.y,hp:100,max:100,r:14,t:0,fire:999,seed:0,homeX:p.x+113,homeY:p.y};enemies=[blastTarget];shots=[];
 const payload={source:'mount',x:p.x+60,y:p.y,blastRadius:50,damage:10,critChance:0};explodeFriendlyRocket(payload,enemies);check(shots[0].arcTargets.includes(blastTarget),'shared blast radius reaches target beyond original range');step(.001);near(blastTarget.hp,85,'derived explosion actual HP deduction');enemies=[];shots=[];
 Math.random=random;const balance=t.store.view().balance;const fresh=t.store.draft();t.store.reset(fresh);check(t.store.save(fresh),'reset saved');check(t.level('damage')===10,'run snapshot stable');reset();state='combat';check(t.level('damage')===0&&p.max===3,'next run new snapshot');
 Math.random=()=>0;const enemy={type:'crawler',x:900,y:900,hp:0,r:10};t.onKill(enemy);t.onKill(enemy);check(t.drops.length===1,'one drop for melee death');const q=t.drops[0],initialHeight=q.height;t.tick(.25);check(q.height>initialHeight&&q.flightAge===0&&q.trail.length>1,'skill drop shares upward slowing scatter and trail');paused=true;const age=q.age;step(.2);check(q.age===age,'pause freezes crystal');paused=false;p.x=q.x;p.y=q.y;t.tick(.1);check(t.drops.length===1,'scatter completes before attraction');t.tick(.6);check(t.drops.length===0&&t.store.view().balance===100001,'pickup stored once');check(p.crystalPickupFlash>0&&particles.some(q=>q.cashGlint&&q.c==='#64cfff'),'skill pickup blue shards and flash');t.tick(.1);check(t.store.view().balance===100001,'no repeated credit');
 const skillFlight=t.spawn(900,900,2),cashFlight=makePickupCrystal(900,900);t.tick(.2);advancePickupCrystal(cashFlight,.2);near(skillFlight.x,cashFlight.x,'same scatter x');near(skillFlight.height,cashFlight.height,'same scatter height');check(skillFlight.trail.length>1,'skill ribbon history');check(t.drops.length===1,'remote crystal exists');for(let i=0;i<240;i++)t.tick(1/60);check(t.drops.length===0&&t.store.view().balance===100003,'clear attraction collects');
 for(let i=0;i<80;i++)t.spawn(500,500,1);check(t.drops.length===64&&t.drops.reduce((n,v)=>n+v.value,0)===80,'bounded merge preserves points');t.death();check(!t.drops.length&&t.store.view().balance===100003,'uncollected death loss');
 testMode=true;t.onKill({type:'eye',x:325,y:300});t.spawn(325,300,10);check(!t.drops.length,'tests no rewards');testMode=false;campaignBoss=1;floor=11;t.onKill({type:'eye',x:325,y:300});check(!t.drops.length,'boss summons no rewards');t.boss();t.boss();check(t.drops.length===1&&t.drops[0].value===20,'boss reward once per floor');t.finish();check(t.store.view().balance===100023,'boss reward collected once');campaignBoss=0;Math.random=random;
 t.spawn(p.x,p.y,1);draw();check([...renderer.residentMeshes.keys()].some(k=>k==='skill-crystal:outer'),'resident crystal mesh');const meshes=[...renderer.residentMeshes].filter(([k])=>k.startsWith('skill-crystal:')),refs=meshes.map(([,m])=>m.data);for(let i=0;i<10;i++)draw();check(meshes.every(([,m],i)=>m.data===refs[i]&&m.data.every(Number.isFinite)),'crystals reuse finite geometry');
 const economy=t.store.draft();check(t.store.change(economy,'pointYield',1),'buy point yield');check(t.store.change(economy,'reinforcements',1),'buy reinforcements');check(t.store.save(economy),'save economy attributes');
 activeDifficulty=1;reset();startWave();
 check(spawnQueue.length===90,'reinforcement speed preserves the candidate pool');
 near(timedRoom.nextWaveAt,2.4/1.1,'ten percent faster reinforcements');
 near(timedRoom.duration,20,'density preserves room duration');
 const settle=()=>{drinkZones=[];beginStageClear(0);return stageSettlement.score;};
 check(settle()===5&&t.summary().earned===5,'fixed base paid even with unspawned enemies');
 check(t.summary().materials.skill0===2&&t.summary().materials.tower1===1,'first clear grants both families and tiers');
 const firstLoot=JSON.stringify(t.summary().materials);
 beginStageClear(0);check(t.summary().earned===5&&JSON.stringify(t.summary().materials)===firstLoot,'settlement retry is idempotent');
 floor=2;startWave();check(settle()===7&&t.summary().earned===12,'completion bonus carries fractions across floors');
 floor=5;startWave();
 const reserved=spawnQueue.find(q=>q.stageScoreUnits>50);
 check(reserved?.enemyTier===2&&!reserved.elite&&spawnQueue.length===90,'rarity reward uses one existing nonelite slot');
 check(spawn(reserved),'reserved slot spawns normally');const valuable=enemies.at(-1);valuable.hp=0;
 shatter(valuable);shatter(valuable);check(t.summary().earned===13,'reserved slot credits exactly one point per kill');
 check(settle()===6&&t.summary().earned===18,'top-up credits only the unawarded base and carried bonus');
 floor=7;startWave();const sample=spawnQueue.filter(q=>q.enemyTier===2).slice(0,12);
 for(const q of sample)t.onKill({...q,hp:0});
 check(t.summary().earned===19,'fractional kills award their integer subtotal');
 const beforeDeath=JSON.stringify(t.summary().materials);
 beginPlayerDeath();check(t.summary().earned===19&&t.settleStage()===null&&JSON.stringify(t.summary().materials)===beforeDeath,'failure keeps already earned score and materials');
 testMode=true;floor=8;startWave();check(settle()===undefined||stageSettlement.score===null,'test mode does not award stage score');
 console.log('Attributes: pricing, persistence, combat, skill-point yield, reinforcement density and crystal lifecycle passed');
}`,sandbox);

vm.runInContext(fs.readFileSync('dist/chips.js','utf8'),sandbox);
vm.runInContext(`{
 const check=(value,message)=>{if(!value)throw Error(message)};
 const near=(value,expected,message)=>check(Math.abs(value-expected)<1e-7,message);
 const store=TalentRuntime.store,draft=store.draft();
 for(const id of ['spread','knock','recoil']){
  const {max}=TalentRuntime.catalog.find(attribute=>attribute.id===id);
  for(let i=0;i<max;i++)check(store.change(draft,id,1),'buy '+id);
 }
 check(store.save(draft),'save handling attributes');
 Chips.acquire({chipId:'radius',tier:3,affixes:[
  {id:'knock',value:14},{id:'spread',value:14},{id:'recoil',value:14}
 ]});
 Chips.equip(0,Chips.inventory()[0].id);
 reset();state='combat';paused=false;shootTimer=999;
 timedRoom={remaining:30,nextWaveAt:999};spawnQueue=[];
 const target=(x,y)=>({type:'eye',x,y,r:12,hp:1000,max:1000,terrainStun:999});
 p.x=325;p.y=300;
 weapon=createWeaponModel('rocket_t3');
 enemies=[target(410,300),target(450,300)];
 const random=Math.random;
 try{Math.random=()=>0;emitWeaponShots(weapon,0,p);}finally{Math.random=random;}
 const rocket=shots[0];
 near(Math.atan2(rocket.vy,rocket.vx),-weapon.spread*.7*.86/2,'rocket spread stacks once');
 rocket.x=430;rocket.y=300;
 explodeFriendlyRocket(rocket,enemies);
 step(.01);
 const force=weapon.knockback*1.15*1.14;
 near(enemies[0].starterKick.x,-force,'rocket pushes left from explosion, with both bonuses once');
 near(enemies[1].starterKick.x,force,'rocket pushes right from explosion, with both bonuses once');
 check(enemies.every(e=>e.hp<1000),'explosion caused real damage');
 step(.05);
 check(enemies[0].x<410&&enemies[1].x>450,'knockback moves surviving enemies');

 weapon=createWeaponModel('pistol_t1');
 p.weaponRecoilVX=p.weaponRecoilVY=0;
 shootWeapon(0);
 near(p.weaponRecoilVX,-weapon.recoilDistance*12*.75*.86,'light pistol uses both recoil reductions');
 console.log('Weapon handling: talent and chip stacking, radial impact, actual displacement and player recoil passed');
}`,sandbox);

// Retired investment is refunded once and survives a subsequent page load.
const legacyKey='retired-test';
storage.setItem(legacyKey,JSON.stringify({version:1,balance:7,earned:37,levels:{shovel:3},paid:{shovel:[5,10,15]},revision:2}));
const migrated=createStore(storage,legacyKey);assert.equal(migrated.view().balance,37);assert.equal(migrated.view().levels.shovel,undefined);assert.equal(createStore(storage,legacyKey).view().balance,37);

// All removed investments refund their actual paid amounts exactly once, preserving active rows.
const oldPaid={hp:[80],shield:[50],pierce:[10,20],laser:[10],arc:[10],drone:[5,10],shovel:[5]};
const oldLevels=Object.fromEntries(Object.entries(oldPaid).map(([id,v])=>[id,v.length]));
oldPaid.damage=[5,10];oldLevels.damage=2;
storage.setItem('all-retired',JSON.stringify({version:1,balance:17,earned:232,levels:oldLevels,paid:oldPaid,revision:3}));
const freshStore=createStore(storage,'all-retired');assert.equal(freshStore.view().balance,217);assert.equal(freshStore.view().levels.damage,2);assert.equal(createStore(storage,'all-retired').view().balance,217);assert.deepEqual(Object.keys(freshStore.view().levels),['damage']);
const legacyRefund=freshStore.draft();freshStore.reset(legacyRefund);assert(freshStore.save(legacyRefund));assert.equal(freshStore.view().balance,232);
assert.deepEqual(freshStore.view().materials,{});

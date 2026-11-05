const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
// Reuse the existing real-engine VM harness without executing its tower assertions.
const harness=fs.readFileSync('tests/test-defense-towers.cjs','utf8').split('\nvm.runInContext(`{')[0];
const create=new Function('require',harness+'\nreturn sandbox;');const sandbox=create(require);
vm.runInContext(fs.readFileSync('dist/specializations.js','utf8'),sandbox);
vm.runInContext(`{
const S=Specializations,E=ElectricTiles;
function check(v,m){if(!v)throw Error(m)}
function setup(){S.setAll(0);reset();startWave();tiles=[];for(let y=-5;y<=5;y++)for(let x=-6;x<=6;x++)tiles.push({x,y});enemies=[];shots=[];bullets=[];missiles=[];turrets=[];spawnQueue=[];enemyTransports=[];state='combat';paused=false;time=0;timedRoom={duration:999,remaining:999,nextWaveAt:999};shootTimer=999;p.hp=p.max=20;p.inv=999;p.x=325;p.y=300;}
function mob(x,y){const e={x,y,homeX:x,homeY:y,hp:10000,max:10000,r:14,type:'eye',t:0,fire:999,seed:0,terrainStun:999};enemies.push(e);return e;}
function fire(id,n,rng=0){setup();S.set(id,n);for(let i=0;i<12;i++)mob(400+i*25,300+(i%2)*25);Math.random=()=>rng;const model=WEAPON_MODELS.find(w=>w.familyId===id);weapon=model?createWeaponModel(model.id):createWeapon(id);emitWeaponShots(weapon,0,p);return shots;}
const random=Math.random;
try{
 check(!S.set('bad',5)&&!S.set('pistol',6)&&!S.set('pistol',1.2),'stage validation');
 for(const id of S.ids.filter(id=>!id.endsWith('_tower')&&!['slow_field','repair_turret'].includes(id))){
  for(let n=0;n<=5;n++){
   const emitted=fire(id,n);check(emitted.length>0,id+' emits stage '+n);
   for(const s of emitted){check(Number.isFinite(s.damage)&&s.damage>=0,id+' finite damage stage '+n);check(Number.isFinite(s.life),id+' finite life');if(n&&s.spec)check(s.spec.n===n,id+' correct snapshot');}
  }
 }
 let emitted=fire('pistol',4,0);let s=emitted[0],victim=enemies[0];S.onHit(s,victim);let bounce=shots.at(-1);
 check(bounce!==s&&Math.abs(bounce.damage-s.damage*.4)<1e-9,'bounce coefficient 40%');check(bounce.specBounce===1,'advanced has two bounces');check(S.damage(s,10,victim)===11,'vulnerability future damage');
 emitted=fire('pistol',4,.61);s=emitted[0];S.onHit(s,enemies[0]);check(shots.length===1,'60 percent bounce misses above threshold');
 emitted=fire('pistol',5,0);check(emitted.length===2,'one extra bullet not a repeated volley');check(emitted[1].specDerived,'extra cannot recursively proc');
 const colors=WEAPON_MODELS.filter(w=>w.familyId==='pistol').map(w=>{fire('pistol',5,0);weapon=createWeaponModel(w.id);shots=[];emitWeaponShots(weapon,0,p);return shots[0].color===modelVisual(weapon).color;});check(colors.every(Boolean),'all pistol colors retained');
 fire('boomerang',0,1);const b0=shots[0],range0=b0.returnRange,speed0=Math.hypot(b0.vx,b0.vy),size0=b0.evolution.size;
 fire('boomerang',3,1);check(Math.abs(shots[0].returnRange/range0-1.4)<1e-9,'boomerang distance');check(Math.abs(Math.hypot(shots[0].vx,shots[0].vy)/speed0-1.35)<1e-9,'boomerang flight speed');check(Math.abs(shots[0].evolution.size/size0-1.4)<1e-9,'boomerang size');
 fire('tesla',5,0);check(shots.filter(s=>s.arc).length===3,'three electric chains on proc');check(new Set(shots.map(s=>s.arcTargets[0])).size===3,'different first targets');check(!shots.some(s=>s.arcTargets.some(e=>e.type==='turret')),'trap excluded');
 fire('rifle',5,0);const original=shots.filter(s=>!s.specDerived),extra=shots.filter(s=>s.specDerived);check(extra.length===1,'burst rifle only one extra');check(original.length>=1,'base burst retained');
 fire('sword',5,0);s=shots.find(s=>!s.specDerived);S.onHit(s,enemies[0]);const blades=shots.filter(s=>s.specDerived);check(blades.length===3,'three gas blades on proc');S.onHit(s,enemies[1]);check(shots.filter(s=>s.specDerived).length===3,'only once per round');S.onHit(blades[0],enemies[2]);check(shots.filter(s=>s.specDerived).length===3,'no recursive blade');
 for(const id of ['shotgun_tower','sniper_tower','electric_tower','missile_tower'])for(let n=0;n<=5;n++){
  setup();S.set(id,n);Math.random=()=>0;const f=E.place(id,{x:0,y:0});for(let i=0;i<12;i++)mob(420+i*20,300+(i%2)*20);p.x=100;p.y=100;E.update(4);
  check(shots.length>0,id+' emits '+n);check(shots.every(s=>Number.isFinite(s.damage)),id+' damage finite');
 }
 setup();S.set('shotgun_tower',4);check(E.attackRange('shotgun_tower')===338,'shotgun range 260 to 338');let f=E.place('shotgun_tower',{x:0,y:0});mob(625,300);p.x=100;E.update(2);check(shots.length===7,'target outside base range now acquired with extra pellets');check(Math.abs(shots[0].life-338/420)<1e-9,'projectile reach matches range');
 setup();S.set('healing_tower',5);Math.random=()=>0;f=E.place('healing_tower',{x:0,y:0});p.x=380;p.hp=1;const wall=tiles.find(t=>t.x===2&&t.y===0);wall.coverTile=true;wall.coverHp=1;E.update(4);check(p.hp>1&&wall.coverHp>1,'multi healing');check(p.specRegenLeft===3,'regen applied');const hp=p.hp;S.tick(1);check(p.hp>hp,'regen actual healing');
 setup();S.set('shield_tower',5);f=E.place('shield_tower',{x:0,y:0});const e=mob(380,300);E.update(10);check(p.towerShieldLeft===3,'shield duration +1');check(e.specSlow===.4,'shield pulse slow');check(f.products===1,'probability second product retained');
 setup();S.set('slow_field',5);f=E.place('slow_field',{x:0,y:0});const slowMob=mob(440,300);check(E.movementFactor(p)===1,'field player immunity');check(E.movementFactor(slowMob)<1,'field enemy slow');E.update(3);check(slowMob.specRootUntil>time,'field root pulse');
 setup();S.set('repair_turret',5);Math.random=()=>0;const oldInterval=E.defs.repair_turret.interval;E.defs.repair_turret.interval=1;f=E.place('repair_turret',{x:0,y:0});for(const [x,y]of [[1,0],[-1,0],[0,1]])tiles.find(t=>t.x===x&&t.y===y).trap={clock:0};E.update(1.8);check(!tiles.some(t=>t.trap),'main and slower auxiliary construction actually complete');E.defs.repair_turret.interval=oldInterval;
 setup();S.set('rocket',5);mob(400,300);weapon=createWeaponModel('rocket_t3');emitWeaponShots(weapon,0,p);const rocket=shots[0];rocket.x=400;explodeFriendlyRocket(rocket,combatTargets());check(S.zones.length===1,'burn zone');const radial=shots.find(s=>s.radial&&s.spec);check(radial?.specDerived,'splash inherits status without procs');
 const before=shots.length;S.explosion(rocket);check(shots.length===before,'cluster once');S.clear();check(S.zones.length===0,'reset clears zones');
 setup();fire('pistol',5,0);s=shots[0];S.onHit(s,enemies[0]);const slowed=enemies[0];paused=true;const stamp=slowed.specWeakUntil;S.tick(10);check(slowed.specWeakUntil===stamp,'pause status remains');paused=false;
 check(S.ids.length===21,'21 categories');
}finally{Math.random=random;S.setAll(0);}
console.log('Specializations: all stages, shared volley rolls, bounce/weakness, colors, multi chains, boomerang, blades, tower range, healing/regen, shield, field and explosions passed');
}`,sandbox);

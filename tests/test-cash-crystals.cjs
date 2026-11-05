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
function close(a,b,m){check(Math.abs(a-b)<1e-7,m+': '+a+' / '+b)}
function setup(){reset();sound=false;state='combat';paused=false;timedRoom={remaining:999,duration:999,nextWaveAt:999};E.reset();tiles=[];for(let y=-5;y<=5;y++)for(let x=-6;x<=6;x++)tiles.push({x,y});enemies=[];shots=[];particles=[];turrets=[];enemyTransports=[];spawnQueue=[];p.x=325;p.y=450;p.inv=999;shootTimer=999;}
for(const kind of ['shotgun_tower','sniper_tower','missile_tower']){
 setup();const f=E.place(kind,{x:0,y:0}),origin=E.facilityCenter(f);f.cool=0;f.aim=0;
 const e={type:'eye',x:origin.x+100,y:origin.y,r:14,hp:100,max:100};enemies=[e];E.update(.01);
 check(f.attacks===1&&f.aimLockLeft>=.24,'fire starts recoil '+kind);const angle=f.aim;
 e.x=origin.x;e.y=origin.y-100;f.cool=0;E.update(.15);close(f.aim,angle,'no tracking in recoil '+kind);check(f.attacks===1,'cannot fire again when externally refreshed '+kind);
 paused=true;const lock=f.aimLockLeft;E.update(1);close(f.aimLockLeft,lock,'pause freezes lock');paused=false;
 E.update(lock+.04);check(f.aim<angle&&f.aim>=angle-Math.PI*.04-1e-7,'only unlocked portion rotates '+kind);
 E.update(.6);check(f.attacks===2,'retarget fires after realigning '+kind);E.startRoom();check(f.aimLockLeft===0,'room clears recoil '+kind);
}
setup();let notices=0;pickupSound=kind=>{if(kind==='gem')notices++;};
cashBurst(430,240,96);cashBurst(430,240,3);check(particles.length===96&&particles.every(q=>q.cashGem&&q.vz>0),'cap and upper hemisphere');
const q=particles[0],h=q.height,speed=Math.hypot(q.vx,q.vy,q.vz);updateParticles(.2);check(q.height>h&&Math.hypot(q.vx,q.vy,q.vz)<speed*.3&&q.flightAge===0,'upward scatter decelerates');
paused=true;const age=q.age;step(.3);close(q.age,age,'pause freezes gem');paused=false;
function flight(parts){const q={cashGem:true,x:430,y:240,height:28,vx:100,vy:-80,vz:180,age:0,scatterTime:.4,flightAge:0,angle:0,spin:5,life:10,size:1};for(const dt of parts)advancePickupCrystal(q,dt);return q;}
const one=flight([.6]),many=flight(Array(60).fill(.01));check(Math.hypot(one.x-many.x,one.y-many.y,one.height-many.height)<.04,'frame stable scatter and homing');
const homing={...one};const at={x:homing.x,y:homing.y,h:homing.height};advancePickupCrystal(homing,.05);const early=Math.hypot(homing.x-at.x,homing.y-at.y,homing.height-at.h);const mid={x:homing.x,y:homing.y,h:homing.height};advancePickupCrystal(homing,.05);check(Math.hypot(homing.x-mid.x,homing.y-mid.y,homing.height-mid.h)>early,'homing accelerates');
check(one.trail.length>1&&one.trail.length<=16&&one.trail.every(v=>one.age-v.age<=.22),'time bounded trail samples');
renderer.begin();drawPickupCrystalTrail(one,'#64ff90');check(renderer.particleSurfaceSnapshot().length>0&&renderer.particleSurfaceSnapshot().every(Number.isFinite),'finite camera facing tapered ribbon');
const trailState=JSON.stringify(one.trail);drawPickupCrystalTrail(one,'#64ff90');check(JSON.stringify(one.trail)===trailState,'draw never advances trail');
const before=cash;for(let i=0;i<180&&particles.some(q=>q.cashGem);i++){p.x=325+Math.sin(i*.04)*50;p.y=450+Math.cos(i*.04)*40;updateParticles(1/60);}
check(!particles.some(q=>q.cashGem)&&notices>0,'moving player absorbs all gems with sound');check(cash===before,'visual arrivals never double pay');
check(p.crystalPickupFlash>0&&p.crystalPickupFlash<=.12,'short character flash on absorb');
particles=[];cashGemAbsorb(1);
check(particles.some(q=>q.cashGlint&&q.life===q.maxLife&&Math.hypot(q.vx,q.vy,q.vz)>=500&&q.size>=2.4),'larger faster glints');
check(particles.some(q=>q.cashGlint)&&particles.filter(q=>q.cashGlint).length<=84,'small bounded glints on arrival');
for(let i=0;i<30;i++)cashGemAbsorb(96);check(particles.filter(q=>q.cashGlint).length<=84,'spam effect cap');
renderer.begin();drawCashCrystal(0,30,0,.3);const mesh=renderer.residentMeshes.get('cash:crystal'),data=mesh.data;check(data.length>0&&data.every(Number.isFinite),'finite gem');drawCashCrystal(40,30,0,.5);check(mesh.data===data&&mesh.count===2,'resident geometry shared');
setup();const victim={x:410,y:300,type:'eye',r:14,hp:1,max:1,t:0,fire:999,seed:0};enemies=[victim];shots=[{x:410,y:300,vx:0,vy:0,life:1,damage:5,pierce:1}];step(.001);check(cash===1&&particles.filter(q=>q.cashGem).length===3,'actual kill spawns crystals and preserves reward');
check(!cashPopups.some(q=>q.cashPickup),'no premature money text at enemy death');
for(let i=0;i<180&&particles.some(q=>q.cashGem);i++)updateParticles(1/60);
const notice=cashPopups.find(q=>q.cashPickup);check(notice&&notice.amount===1&&notice.text==='金钱 +1'&&notice.followPlayer,'arrival money jump at player');check(cash===1,'notice never adds cash again');
showCashPickup(3);check(notice.amount===4&&cashPopups.filter(q=>q.cashPickup).length===1,'nearby arrivals merge exact value');
particles=[];cashBurst(410,300,96);cashBurst(410,300,3,7);check(particles.reduce((n,q)=>n+(q.cashPickupAmount||0),0)===7,'full particle budget preserves notice value');
state='bossDying';bossDeath={age:0,bodies:[],blasts:[],fragments:[],nextBlast:999,shattered:true};const gem=particles.find(q=>q.cashGem);updateBossDeath(.1);check(gem.age>.09,'boss death keeps currency animation running');
reset();check(!particles.some(q=>q.cashGem||q.cashGlint),'restart clears drops');
console.log('Currency crystals and recoil: three tower locks/refresh/pause/reset, actual kill, hemisphere/slowdown/acceleration/moving capture, frame stability, sound/glint caps, resident mesh, boss death and unchanged payout passed.');
}`,sandbox);

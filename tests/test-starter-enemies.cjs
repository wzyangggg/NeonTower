const fs=require('node:fs'),vm=require('node:vm');
const elements={};const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);for(const file of ['music','renderer','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss'])vm.runInContext(fs.readFileSync('dist/'+file+'.js','utf8'),sandbox);

vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
function near(a,b,m){check(Math.abs(a-b)<1e-6,m)}
function setup(f=2){reset();floor=f;startWave();tiles=[];turrets=[];p.x=325;p.y=300;p.inv=999;shootTimer=999;}
function mob(type){return {type,x:525,y:300,homeX:525,homeY:300,hp:100,max:100,r:14,t:0,fire:99,seed:0};}
for(const f of [1,2,3]){setup(f);const roster=[...enemies,...spawnQueue];check(roster.every(e=>['crawler','spitter'].includes(e.type)),'starter species only '+f);check(roster.filter(isMeleeEnemy).length===12,'contact share preserved');}
for(const f of [5,6,9,13,23]){setup(f);check([...enemies,...spawnQueue].every(e=>!STARTER_ENEMIES[e.type]),'later roster unchanged '+f);}
setup();const crawler=mob('crawler'),bomber=mob('bomber');updateChaser(crawler,1);updateChaser(bomber,1);near(525-crawler.x,48,'crawler real movement');near(525-bomber.x,110,'bomber unchanged');check(crawler.x>bomber.x,'slower pursuit');
const spit=mob('spitter'),eye=mob('eye');updateRangedMovement(spit,1);updateRangedMovement(eye,1);check(Math.hypot(spit.x-525,spit.y-300)<Math.hypot(eye.x-525,eye.y-300)*.5,'spitter slow walking');
bullets=[];fire(spit);check(bullets.length===1,'one aimed slow pulse');for(const b of bullets)near(Math.hypot(b.vx,b.vy),85,'slow bullet speed');const slow=bullets[0];bullets=[];fire(eye);check(Math.hypot(bullets[0].vx,bullets[0].vy)>85,'original bullet speed unchanged');
enemies=[spit];spawnQueue=[];spit.fire=.01;bullets=[];step(.02);near(spit.fire,3.2,'real spitter fire cooldown');check(bullets.length===1,'real combat loop fires one pulse');step(1);check(bullets.length===1,'no fast second volley');
enemies=[crawler];bullets=[];crawler.fire=0;crawler.x=p.x+10;crawler.y=p.y;p.inv=0;const hp=p.hp;step(.01);check(p.hp===hp-1&&!bullets.length,'crawler still deals contact damage');
setup();const frozen=mob('crawler');frozen.terrainStun=1;enemies=[frozen];spawnQueue=[];step(.1);near(frozen.x,525,'terrain stun freezes new melee');togglePause();step(2);near(frozen.x,525,'pause freezes new melee');togglePause();
setup();const pushed=mob('crawler');pushMeleeEnemy(pushed,{knockback:100,vx:1,vy:0});check(pushed.knockLeft>0,'new melee accepts knockback');
const r=renderer;enemies=[mob('crawler'),mob('spitter')];enemies[1].y+=80;draw();const meshes=[...r.residentMeshes].filter(([key])=>key.startsWith('enemy:crawler:')||key.startsWith('enemy:spitter:'));check(meshes.length===2&&meshes.every(([,mesh])=>mesh.data.every(Number.isFinite)),'two finite resident models');
const refs=meshes.map(([,mesh])=>mesh.data);for(let i=0;i<6;i++){time+=.1;draw();}check(meshes.every(([,mesh],i)=>mesh.data===refs[i]),'static mesh data reused');
for(const [dx,dy]of [[100,0],[-100,0],[0,100],[0,-100],[80,-40]]){
 const e=mob('spitter');p.x=e.x+dx;p.y=e.y+dy;const pose=starterSpitterPose(e,10,20,2),length=Math.hypot(dx,dy*1.06);
 near(pose[2],dx/length,'spitter forward X faces player');near(pose[10],dy*1.06/length,'spitter forward Z faces player');near(pose[7],2,'spitter lights keep hover height');
 r.transparentCount=0;r.projectileCount=0;r.sprites=[];drawStarterSpitterLights(e,pose);
 check(r.transparentCount===0&&r.sprites.length===6&&r.sprites.every(s=>s.kind==='softLight'&&s.data.every(Number.isFinite)),'three finite crossed textured lights');
 check(r.projectileCount===6*7,'visor thrusters emitter and beacon glow');
 const mask=r.softLightPixels;check(mask[(32*128+12)*4+3]>mask[(0*128+12)*4+3],'texture softly fades at side');check(mask[(32*128+127)*4+3]===0,'texture tip fades out');
}
setup();drinkBottles=[{id:'hound',done:true,left:0}];const boosted=mob('crawler');updateChaser(boosted,1);near(525-boosted.x,48*1.3,'hound applies to crawler');
console.log('Starter enemies: independent early rosters, slower approach/walk/projectiles/cadence, real contact damage, knockback, later enemies unchanged, drink scaling and finite resident mesh reuse passed');
}`,sandbox);

const fs=require('node:fs'),vm=require('node:vm');
const H=require('../dist/hex-map.js'),elements={};
const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{},hidden:true,classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const sandbox={Image:class {complete=true;naturalWidth=256;},HexMap:H,console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);
for(const file of ['music','renderer','map-icons','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss','electric-tiles']){const src=fs.readFileSync('dist/'+file+'.js','utf8');vm.runInContext(file==='game'?H.transform(src):src,sandbox);}
vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
reset();sound=false;paused=false;state='combat';resetStageStats();
const probe={x:p.x+300,y:p.y,height:30,age:0};
const distance=()=>Math.hypot(probe.x-p.x,probe.y-p.y,probe.height-30-mountRiderLift()-playerUpperLift());
let d=distance();advanceShieldPickup(probe,.1);check(Math.abs(d-distance()-17.8125)<1e-8,'first flight step constant 178.125 speed');d=distance();advanceShieldPickup(probe,.1);check(Math.abs(d-distance()-17.8125)<1e-8,'next flight step same speed');
const near={x:p.x+30,y:p.y,height:30+mountRiderLift()+playerUpperLift(),age:0};check(advanceShieldPickup(near,0),'30-unit collection radius');const outside={...near,x:p.x+31};check(!advanceShieldPickup(outside,0),'outside collection radius still flies');
const old=Math.random;Math.random=()=>0;
const e={x:p.x+90,y:p.y,hp:0,type:'eye'};recordStageKill(e);recordStageKill(e);
check(enemyBuffs.length===1,'one buff per death');
for(const extra of [{type:'machine'},{roomCleanup:true},{escaped:true},{selfDetonated:true},{weaponLabTarget:true},{hp:1}])recordStageKill({...e,...extra});
check(enemyBuffs.length===1,'exclude invalid kills');
renderer.begin();drawEnemyBuffs();check(renderer.rainbowPickups.length===1&&Number.isFinite(renderer.rainbowPickups[0].age),'rainbow cube drop queued');
paused=true;const age=enemyBuffs[0].age;updateEnemyBuffs(1);check(enemyBuffs[0].age===age,'pause');paused=false;
updateEnemyBuffs(4);check(!enemyBuffs.length&&p.towerShieldLeft===2,'homing grants two seconds');
const fx=particles.find(q=>q.shieldPickup);check(fx&&fx.maxLife===.25,'compact pickup column on absorption');
fx.life=.20;renderer.begin();drawPickupParticle(fx);check(renderer.transparentCount>0&&renderer.transparentData.slice(0,renderer.transparentCount).every(Number.isFinite),'finite ring, column and rising flecks');
const shells=renderer.sprites.filter(s=>s.vertexCount===288);check(shells.length===2&&shells.every(s=>s.data.every(Number.isFinite)),'two real textured cylinders');
const earlyRingRadius=renderer.transparentData[0]-(p.x-325);check(Math.abs(earlyRingRadius-36)<1e-6,'base ring matches outer cylinder radius');const earlyCore=renderer.sprites[1].data.slice();p.x+=25;p.y+=20;fx.life=.06;renderer.begin();drawPickupParticle(fx);const lateCore=renderer.sprites[1].data;
const extent=(data,k)=>{const a=Array.from(data).filter((_,i)=>i%5===k);return Math.max(...a)-Math.min(...a)};
const earlyProgress=.2;check(Math.abs(extent(earlyCore,1)-(90+150*earlyProgress)*3)<1e-3,'central height exactly tripled');check(Math.abs(extent(earlyCore,0)-2*(1.5+12*(1-earlyProgress)**1.5)*1.5)<1e-3,'central width exactly 1.5x');
check(extent(renderer.sprites[0].data,1)<136*.8,'outer wall shrinks');
check(extent(lateCore,1)>extent(earlyCore,1)&&extent(lateCore,0)<extent(earlyCore,0),'central column grows taller and thinner');
check(Math.abs(renderer.transparentData[0]-(p.x-325)-earlyRingRadius)<1e-6,'ring radius stays fixed over lifetime');check(renderer.sprites[0].data[0]===p.x-325+36,'pickup cylinder follows moved player');
check(cashPopups.some(q=>q.text==='无敌2秒！'&&q.followPlayer&&q.bombCue),'flashing following popup');
const cue=cashPopups.find(q=>q.text==='无敌2秒！');cue.age=0;renderCashPopups();const before=$('cash-popups').innerHTML;
check(before.includes('color:#ffd45c!important;'),'starts yellow');
cue.age=.06;renderCashPopups();check($('cash-popups').innerHTML.includes('color:#45aaff!important;')&&$('cash-popups').innerHTML.includes('opacity:1;'),'60ms blue phase at full opacity');
cue.age=.12;renderCashPopups();check($('cash-popups').innerHTML.includes('color:#ffd45c!important;'),'120ms yellow phase');
cue.age=.91;renderCashPopups();check($('cash-popups').innerHTML.includes('color:#ffd45c!important;'),'final phase stays yellow');
cue.age=1.1;renderCashPopups();check($('cash-popups').innerHTML.includes('color:#ffd45c!important;')&&!$('cash-popups').innerHTML.includes('opacity:1;'),'yellow fades out');check($('cash-popups').innerHTML.includes('translateY(0px)'),'shield popup never floats upward');
const dimBefore=$('cash-popups').innerHTML;p.x+=40;renderCashPopups();check($('cash-popups').innerHTML!==dimBefore,'popup follows player');
const notes=[],starts=[],stops=[],savedUnlock=unlockAudio,savedOutput=soundOutput,savedAudio=audio;
unlockAudio=()=>{};soundOutput=()=>({});sound=true;
audio={currentTime:10,createOscillator:()=>({frequency:{setValueAtTime(f){notes.push(f)}},connect(){},start(t){starts.push(t)},stop(t){stops.push(t)}}),createGain:()=>({gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}})};
pickupSound('invincible');check(notes.length===5&&notes.every((n,i)=>!i||n>notes[i-1]),'ascending reward arpeggio');check(starts[4]>starts[0]&&stops[4]>10.6,'scheduled reward tail');
sound=false;pickupSound('invincible');check(notes.length===5,'respects mute');audio=savedAudio;unlockAudio=savedUnlock;soundOutput=savedOutput;

p.inv=0;const hp=p.hp,shield=p.shield;hurt();check(p.hp===hp&&p.shield===shield,'blocks damage');
grantTemporaryShield(4);grantTemporaryShield(2);check(particles.filter(q=>q.shieldPickup).length===1,'pickup column bounded on repeated grants');check(p.towerShieldLeft===4,'preserve longer buff');
updateParticles(.251);check(!particles.some(q=>q.shieldPickup),'pickup light removed within quarter second');Math.random=()=>.99;check(!tryDropEnemyBuff(e),'chance');Math.random=old;
for(const roomState of ['combat','survival']){
 reset();sound=false;state=roomState;drinkZones=[];
 enemyBuffs=[{...makePickupCrystal(p.x+200,p.y),age:0}];
 const shieldBefore=p.towerShieldLeft||0;
 beginStageClear();
 check(state==='stageClear'&&!enemyBuffs.length,'remaining shield drops cleared on '+roomState+' settlement');
 check((p.towerShieldLeft||0)===shieldBefore,'cleanup does not grant uncollected shield');
 renderer.begin();drawEnemyBuffs();check(!renderer.sprites.length,'no shield sprite during settlement');
}
resetStageStats();check(!enemyBuffs.length,'room reset');
console.log('Enemy shield drops: kill eligibility, deduplication, mesh, pause, homing, popup, invulnerability and reset passed.');
}`,sandbox);

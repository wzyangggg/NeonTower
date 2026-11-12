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
const random=Math.random;Math.random=()=>.08;
const e={x:p.x+100,y:p.y,hp:0,type:'eye'};recordStageKill(e);recordStageKill(e);check(enemyBuffs.length===1&&enemyBuffs[0].kind==='health','health drop chance and kill dedupe');
Math.random=random;p.hp=1;p.max=3;p.towerShieldLeft=0;
paused=true;updateEnemyBuffs(1);check(p.hp===1,'paused pickup');paused=false;updateEnemyBuffs(.1);
check(enemyBuffs.length===1&&p.hp===1,'distant box does not heal');
p.x=enemyBuffs[0].x;p.y=enemyBuffs[0].y;updateEnemyBuffs(.01);
check(!enemyBuffs.length&&p.hp===2&&p.towerShieldLeft===0,'contact heals one without invulnerability');
check(cashPopups.some(q=>q.text==='生命 +1！'&&q.followPlayer&&q.healthCue),'following health cue');
const fx=particles.find(q=>q.shieldPickup);check(fx.health&&fx.maxLife===.25,'green short pickup effect');fx.life=.18;renderer.begin();drawPickupParticle(fx);check(renderer.sprites.filter(q=>q.vertexCount===288).every(q=>q.tint[1]===1),'green cylinders');
p.hp=2.5;grantHealthPickup();check(p.hp===3,'heal caps at max');check(!grantHealthPickup()&&p.hp===3&&cashPopups.at(-1).text==='生命已满','full health no overflow');
p.hp=0;const count=cashPopups.length;check(!grantHealthPickup()&&p.hp===0&&cashPopups.length===count,'never revives dead player');
console.log('Health drops: actual kill/contact, pause, heal one, cap/full/dead, green effect and popup passed.');
}`,sandbox);

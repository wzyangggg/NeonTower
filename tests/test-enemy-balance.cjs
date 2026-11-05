const fs=require('node:fs'),vm=require('node:vm');
const elements={};const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);if(process.argv.includes('--hex'))vm.runInContext(fs.readFileSync('dist/hex-map.js','utf8')+'\n'+fs.readFileSync('dist/terrain-generators.js','utf8'),sandbox);for(const file of ['music','renderer','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss','electric-tiles']){let code=fs.readFileSync('dist/'+file+'.js','utf8');if(file==='game'&&process.argv.includes('--hex'))code=require('../dist/hex-map.js').transform(code);vm.runInContext(code,sandbox);}
vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
for(const f of [1,2,3,4,5,6,7,10,11,13,22,23,33]){
 reset();floor=f;startWave();step(1);p.inv=999;shootTimer=999;
 if(!timedRoom)continue;
 const roster=[...enemies,...spawnQueue];
 check(roster.length===normalRoomRosterSize(),'finite roster '+f);
 check(roster.filter(isMeleeEnemy).length===Math.round(roster.length*(f<=6?.2:.4)),'contact share '+f);
 check(enemies.filter(e=>!isMeleeEnemy(e)).length===(f<=6?4:3),'more ranged opening '+f);
 check(Math.abs(rangedEnemyHealth('spitter')/normalEnemyHealth()-(f<=6?.6:.75))<1e-8,'fragile ranged '+f);
 if(f<=6)check(normalRangedLimit()===20,'denser early ranged groups fit');
 check(bridgePopulationLimit()===(f<=3?3:f<=6?6:f<=10?10:f<=22?14:18),'ground cap '+f);
 check(bridgeReinforcementInterval()===(f<=3?2:f<=6?1:f<=10?.7:f<=22?.55:.45),'progressive ground reinforcement '+f);
 const total=stageResultStats().total;
 for(let i=0;i<1000;i++){
  for(const e of enemies)if(!isMeleeEnemy(e))e.hp=0;
  updateTimedRoomSpawns(.01);
  check(enemies.filter(e=>e.hp>0&&e.bridgeRoller).length<=bridgePopulationLimit(),'ground cap enforced '+f);
 }
 check(stageResultStats().total===total,'fixed settlement total '+f);
}
console.log('Ranged-heavy balance, health, finite totals and ground population caps passed.');
}`,sandbox);

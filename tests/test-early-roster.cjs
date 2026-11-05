const fs=require('node:fs'),vm=require('node:vm');
const elements={};const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);if(process.argv.includes('--hex'))vm.runInContext(fs.readFileSync('dist/hex-map.js','utf8')+'\n'+fs.readFileSync('dist/terrain-generators.js','utf8'),sandbox);for(const file of ['music','renderer','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss','electric-tiles']){let code=fs.readFileSync('dist/'+file+'.js','utf8');if(file==='game'&&process.argv.includes('--hex'))code=require('../dist/hex-map.js').transform(code);vm.runInContext(code,sandbox);}
vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
for(let f=1;f<=33;f++){
 reset();floor=f;const roster=buildNormalRoster();
 check(roster.length===normalRoomRosterSize(),'fixed population '+f);
 check(roster.find(e=>!isMeleeEnemy(e)).type==='spitter','single shooter opens '+f);
 for(const type of ['spitter','fighter','moth',...(f>=2?['laser']:[])])check(roster.some(e=>e.type===type),'early variety '+f+'/'+type);
 check(roster.filter(e=>e.type==='builder').length===(f>=7?1:0),'sparse builder unlock '+f);
 check(roster.every(e=>campaignEnemyEnabled(e.type)),'enabled roster '+f);
 check(roster.filter(isMeleeEnemy).length===Math.round(roster.length*(f<=6?.2:.4)),'contact share '+f);
 startWave();if(!timedRoom)continue;
 step(1);p.inv=999;shootTimer=999;
 check(!builderRoom,'ordinary timed encounter '+f);
 const total=stageResultStats().total;
 let sawBuilder=false;
 for(let i=0;i<40&&spawnQueue.length;i++){
  for(const e of enemies){if(e.type==='builder'){sawBuilder=true;updateBuilder(e,.1);check(Number.isFinite(e.x)&&Number.isFinite(e.y),'builder update');}e.hp=0;}
  updateTimedRoomSpawns(.4);
  check(normalThreat()<=normalThreatLimit()&&normalRangedCount()<=normalRangedLimit(),'spawn caps '+f);
 }
 if(enemies.some(e=>e.type==='builder'))sawBuilder=true;
 check(f<7||sawBuilder,'builder actually enters normal room '+f);
 check(stageResultStats().total===total,'fixed settlement '+f);
}
reset();p.x=300;p.y=100;bullets=[];const mob={type:'spitter',x:100,y:100};fire(mob);
check(bullets.length===1&&!mob.twinPending,'one projectile without pending second shot');
const firstY=bullets[0].y;fire(mob);check(bullets.length===2&&Math.abs(firstY-bullets[1].y)===62,'alternating visible pods');
check(bullets.every(b=>b.vx===STARTER_ENEMIES.spitter.bulletSpeed&&b.vy===0),'original speed and aim');
console.log('Early single shots, missile/fan/laser variety, normal builder encounters, finite totals and spawn budgets passed.');
}`,sandbox);

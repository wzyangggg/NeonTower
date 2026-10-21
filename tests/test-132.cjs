const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);




vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
function close(a,b,m){check(Math.abs(a-b)<1e-6,m)}
function setup(){reset();state='combat';p.x=325;p.y=300;p.inv=0;spawnQueue=[{type:'eye',side:0}];spawnTimer=999;shootTimer=999;chaserSpawned=24;equipItem('shoes',createShoes('skateboard'));}
for(const phase of ['descent','landing','bossIntro','combat','survival']){
 setup();state=phase;bossIntroLeft=99;survivalRemaining=99;step(.02);close(p.x,325,'fresh board remains stationary in '+phase);close(p.y,300,'no startup autopilot');check(!p.skateStarted,'waits for input');
 keys.d=true;step(.02);keys.d=false;check(p.skateStarted&&p.x>325,'first keyboard input starts sliding in '+phase);close(p.skateAngle,0,'initial direction matches input');const x=p.x;step(.02);check(p.x>x,'release keeps sliding in '+phase);
}
setup();state='descent';joy.y=-1;step(.02);joy.y=0;check(p.skateStarted&&p.y<300,'joystick starts during descent');state='landing';const y=p.y;step(.02);check(p.y<y,'landing preserves slide');state='combat';startFloorTracking();const y2=p.y;step(.02);check(p.y<y2,'combat tracking preserves slide');hurt();check(p.skateStarted,'damage does not reset slide');equipItem('shoes',createShoes('skateboard'));step(.02);check(!p.skateStarted,'reequipping waits for fresh input');
setup();equipItem('shoes',createShoes('runner'));keys.d=true;step(.02);keys.d=false;const x=p.x;step(.02);close(p.x,x,'ordinary shoes still stop on release');
for(const collection of ['turrets','enemies']){
 setup();const laser={kind:'laser',type:'eye',hp:10,r:14,x:150,y:300,aim:0,laserMode:'warning',laserTimer:.5};if(collection==='turrets')turrets=[laser];else enemies=[laser];
 updateSkateDanger();updateLaser(laser,.01);check(!p.grazeStacks&&p.hp===3,'laser warning never triggers '+collection);
 laser.laserMode='firing';p.y=310;updateSkateDanger();updateLaser(laser,.01);check(!p.grazeStacks&&p.hp===3,'near beam outside actual width does not trigger');
 p.y=300;updateLaser(laser,.01);check(p.grazeStacks===1&&p.hp===3&&!p.floorHit,'actual beam hit triggers before damage');updateSkateDanger();updateSkateReward(1.5);updateSkateDanger();check(p.grazeStacks===1,'same active beam cannot reward twice');
}
setup();hazards=[{x:325,y:300,t:.5}];updateSkateDanger();step(.1);check(!p.grazeStacks&&p.hp===3,'circle warning on player never triggers');hazards[0].t=1.2;p.x=365;updateSkateDanger();step(.01);check(!p.grazeStacks&&p.hp===3,'active circle proximity does not trigger');p.x=325;step(.01);check(p.grazeStacks===1&&p.hp===3&&!p.floorHit,'actual circle hit starts protection');
setup();hazards=[{x:325,y:300,t:1.095}];step(.01);check(p.grazeStacks===1&&p.hp===3,'circle activation underfoot protected on same step');
setup();const laser={kind:'laser',x:150,y:300,aim:0,laserMode:'warning',laserTimer:.005};turrets=[laser];updateLaser(laser,.01);check(p.grazeStacks===1&&p.hp===3,'laser activation underfoot protected');
setup();triggerSkateTrick();updateSkateReward(.5);hazards=[{x:325,y:300,t:1.2}];step(.01);check(p.hp===2&&!p.grazeStacks&&p.skateCooldownLeft>0,'hit-only attacks still respect cooldown');
console.log('Startup keyboard/joystick slide latch across all movement phases, release/transition/damage/swap, laser/circle warning and near-miss exclusion, actual-hit protection and cooldown passed');
}`,sandbox);

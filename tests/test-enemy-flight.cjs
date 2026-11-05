const fs=require('node:fs'),vm=require('node:vm');
const elements={};const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/hex-map.js','utf8')+'\n'+fs.readFileSync('dist/terrain-generators.js','utf8'),sandbox);for(const file of ['music','renderer','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss'])vm.runInContext(file==='game'?require('../dist/hex-map.js').transform(fs.readFileSync('dist/game.js','utf8')):fs.readFileSync('dist/'+file+'.js','utf8'),sandbox);
vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
function craft(type='moth'){return {type,x:325,y:100,hp:10,max:10,r:14,seed:0,t:0,fire:999};}
p={x:325,y:500};
function move(e,vx,vy,dt=1/60){beginEnemyFlightFrame(e);e.x+=vx*dt;e.y+=vy*dt;updateEnemyFlight(e,dt);}
for(const type of ENEMY_FLIGHT_TYPES){const e=craft(type);for(let i=0;i<60;i++)move(e,0,18);check(e.flightPose.pitch>.02,'nose down in forward flight '+type);check(Math.abs(e.flightPose.roll)<.001,'straight flight level wings '+type);for(let i=0;i<120;i++)move(e,0,0);check(Math.abs(e.flightPose.pitch)<.0001,'rest returns level '+type);}
const side=craft();for(let i=0;i<60;i++)move(side,30,0);check(side.flightPose.roll<-.1,'right strafe banks right');const before=side.flightPose.roll;move(side,-30,0);check(Math.abs(side.flightPose.roll-before)<.05,'reversal has inertia');for(let i=0;i<90;i++)move(side,-30,0);check(side.flightPose.roll>.1,'left strafe banks left');
const back=craft();for(let i=0;i<60;i++)move(back,0,-30);check(back.flightPose.pitch<-.1,'reverse raises nose');
const turn=craft();beginEnemyFlightFrame(turn);turn.flightPose.yaw=Math.PI-.01;p.x=320;p.y=-300;move(turn,0,0);check(Math.abs(turn.flightPose.roll)<.02,'yaw wraps shortest way');p.x=325;p.y=500;
for(const dt of [1/120,1/30,.1,.5]){const e=craft();for(let i=0;i<60;i++)move(e,200,-200,dt);check(Math.abs(e.flightPose.pitch)<=.341&&Math.abs(e.flightPose.roll)<=.441,'bounded at varying frame rates');const m=enemyFlightPose(e,10,20,2);check(m.every(Number.isFinite),'finite transform');for(const col of [0,1,2])check(Math.abs(m[col]**2+m[col+4]**2+m[col+8]**2-1)<1e-9,'rigid transform');check(Math.abs(m[1]*24+m[3]-10)<1e-9&&Math.abs(m[5]*24+m[7]-26)<1e-9&&Math.abs(m[9]*24+m[11]-20)<1e-9,'center pivot fixed');}
const warp=craft();move(warp,30,0);beginEnemyFlightFrame(warp);warp.x+=500;updateEnemyFlight(warp,1/60);check(warp.flightPose.roll===0&&warp.flightPose.pitch===0,'teleport resets attitude');
const ground=craft('crawler');beginEnemyFlightFrame(ground);check(!ground.flightPose,'ground models excluded');
reset();state='combat';floor=17;timedRoom={remaining:45,nextWaveAt:999};spawnQueue=[];chaserTimer=shootTimer=999;p.inv=999;enemies=[craft('spitter')];enemyTransports=[];
for(let i=0;i<60;i++)step(1/60);const live=enemies[0];check(live.flightPose&&Math.abs(live.flightPose.roll)+Math.abs(live.flightPose.pitch)>.02,'actual combat updates attitude');const snapshot=JSON.stringify(live.flightPose);paused=true;step(1);check(JSON.stringify(live.flightPose)===snapshot,'pause freezes attitude');paused=false;draw();draw();check(JSON.stringify(live.flightPose)===snapshot,'render never advances simulation');
} `,sandbox);
console.log('Enemy flight: movement tilt, reversal inertia, rest, yaw wrap, frame stability, rigid center pivot, teleport, ground exclusion, combat integration and pause passed.');


const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};let snakeSeed=1;sandbox.Math=Object.create(Math);sandbox.Math.random=()=>{snakeSeed=(Math.imul(snakeSeed,1664525)+1013904223)>>>0;return snakeSeed/4294967296;};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/snake.js','utf8'),sandbox);
vm.runInContext(`
function check(v,m){if(!v)throw Error(m)}
$('snake-health').style.setProperty=()=>{};
startSnakeTest();sound=false;snakeGod=true;shootTimer=999;
check(testMode&&snakeTest&&state==='combat','isolated combat scene');
check(tiles.length===143&&!turrets.length&&!spawnQueue.length,'fixed 13x11 safe arena');
check(enemies.length===36&&combatTargets().length===36,'every segment independently targetable');
check(snakeBoss.head.r===26&&snakeBoss.parts[1].r===19,'boss sized head and body collisions');
renderer.begin();for(const e of snakeBoss.parts)drawSnakeSegment(e);const snakeSnapshot=renderer.residentSnapshot();check(snakeSnapshot.length>0&&snakeSnapshot.length<1500000,'rounded boss resident mesh bounded');
check(snakeSnapshot.every(Number.isFinite),'head/body/tail vertices finite');
const marked=snakeBoss.parts.filter(e=>e.shooter);check(marked.length===9,'nine permanent cannon segments');
const savedBullet=bullet,emitted=[];bullet=(x,y,a,v)=>emitted.push({x,y,a,v});
snakeBoss.parts[1].hp=0;reconnectSnake();snakeBoss.fire=0;updateSnakeBoss(.001);
check(emitted.length===72&&marked.every(e=>emitted.some(b=>b.x===e.x&&b.y===e.y)),'removing ordinary segment preserves exact shooters');
marked[0].hp=0;reconnectSnake();emitted.length=0;snakeBoss.fire=0;updateSnakeBoss(.001);
check(emitted.length===64&&snakeBoss.parts.filter(e=>e.shooter).length===8,'destroyed cannon stops firing without transferring role');
check(emitted.every(b=>b.v===78),'slow bullet speed');
const ring=emitted.slice(0,8);for(let i=1;i<8;i++)check(Math.abs(ring[i].a-ring[i-1].a-TAU/8)<1e-8,'uniform full circular scatter');
check(Math.abs(ring[0].a-(marked[1].seed+snakeBoss.age*.22))<1e-8,'scatter phase independent of player');
check(snakeBoss.parts.filter(e=>e.shooter).every(e=>e.shotFlashUntil>snakeBoss.age),'actual cannon fire flashes');
// Promoting a marked segment keeps its firing role and visible cannon.
startSnakeTest();sound=false;snakeGod=true;snakeBoss.parts[0].hp=0;snakeBoss.parts[1].hp=0;reconnectSnake();check(snakeBoss.head.shooter,'promoted cannon keeps its role');renderer.begin();drawSnakeSegment(snakeBoss.head);
check(renderer.residentSnapshot().length>0,'head promotion renders safely');bullet=savedBullet;
startSnakeTest();sound=false;snakeGod=true;shootTimer=999;
snakeGod=false;snakeBoss.fire=999;p.inv=0;p.x=snakeBoss.parts[10].x;p.y=snakeBoss.parts[10].y;const safeHp=p.hp;updateSnakeBoss(0);check(p.hp===safeHp,'body contact harmless');
p.x=snakeBoss.parts[35].x;p.y=snakeBoss.parts[35].y;updateSnakeBoss(0);check(p.hp===safeHp,'tail contact harmless');
p.x=snakeBoss.head.x;p.y=snakeBoss.head.y;updateSnakeBoss(0);check(p.hp===safeHp-1,'head contact still damages');
p.inv=0;snakeBoss.parts[0].hp=0;reconnectSnake();p.x=snakeBoss.head.x;p.y=snakeBoss.head.y;updateSnakeBoss(0);check(p.hp===safeHp-2,'promoted head damages');
startSnakeTest();sound=false;snakeGod=true;shootTimer=999;
const original=snakeBoss.parts.slice(),front=original[7],back=original[9];
original[8].hp=0;reconnectSnake();
check(snakeBoss.parts.length===35&&back.previous===front&&front.next===back,'middle removal reconnects surviving identities');
check(back.hp===18&&front.hp===18,'reconnection preserves hp');
const before=Math.hypot(back.x-front.x,back.y-front.y);updateSnakeBoss(.15);
check(Math.hypot(back.x-front.x,back.y-front.y)<before,'gap closes by motion');
for(let i=0;i<120;i++)updateSnakeBoss(1/120);
check(Math.abs(Math.hypot(back.x-front.x,back.y-front.y)-SNAKE_GAP)<1,'joined body returns to spacing');
original[0].hp=0;reconnectSnake();check(snakeBoss.head===original[1]&&original[1].snakeHead&&!original[1].previous,'head successor');
original[35].hp=0;reconnectSnake();check(original[34].snakeTail&&!original[34].next,'tail successor');
original[4].hp=0;original[5].hp=0;reconnectSnake();check(original[6].previous===original[3],'adjacent simultaneous deletion');
enemies=enemies.filter(e=>e.hp>0);
for(let i=0;i<2400;i++)updateSnakeBoss(1/120);
for(const e of snakeBoss.parts)check(Number.isFinite(e.x+e.y+e.angle),'finite movement after many turns');
for(let i=1;i<snakeBoss.parts.length;i++){const e=snakeBoss.parts[i],front=snakeBoss.parts[i-1];check(Math.hypot(e.x-front.x,e.y-front.y)>31,'turns preserve separation');}
check(SNAKE_ROUTE_LENGTH>(snakeBoss.total-1)*SNAKE_GAP,'route longer than full body');
check(bullets.length>0,'body emits bullets');
startSnakeTest();sound=false;snakeGod=true;shootTimer=999;
const randomBefore=Math.random;Math.random=()=>.43;
for(let frame=0;frame<3600;frame++){
 p.x=frame%2?200:450;p.y=frame%2?250:450;updateSnakeBoss(1/60);
 if(frame%120===0)for(let i=0;i<snakeBoss.parts.length;i++){
  const e=snakeBoss.parts[i];check(e.x>=A.x&&e.x<=A.x+A.w&&e.y>=A.y&&e.y<=A.y+A.h,'movement inside field');
  if(i)check(Math.abs(e.offset-i*SNAKE_GAP)<1e-6,'equal arc length spacing');
 }
}
check(snakeBoss.trail.length<2400,'dynamic trail bounded');Math.random=randomBefore;
const oldHead=snakeBoss.parts[1],oldX=oldHead.x,oldY=oldHead.y;snakeBoss.head.hp=0;reconnectSnake();updateSnakeBoss(0);check(Math.hypot(oldHead.x-oldX,oldHead.y-oldY)<1e-6,'head promotion keeps original position');
startSnakeTest();sound=false;snakeGod=true;shootTimer=999;
const first=snakeBoss.head,position={x:first.x,y:first.y};setSnakeMode('chase');updateSnakeBoss(0);check(first.x===position.x&&first.y===position.y,'state transition no teleport');
check(snakeBoss.parts.every(e=>e.snakeDanger),'chase full body contact');
renderer.begin();drawSnakeSegment(snakeBoss.parts[10]);const spikeCount=renderer.residentSnapshot().length;setSnakeMode('wander');renderer.begin();drawSnakeSegment(snakeBoss.parts[10]);check(spikeCount>renderer.residentSnapshot().length,'chase grows actual spike geometry');
setSnakeMode('chase');snakeBoss.fire=0;bullets=[];updateSnakeBoss(.02);check(!bullets.length,'chase emits no bullets');
snakeGod=false;p.inv=0;p.x=snakeBoss.parts[10].x;p.y=snakeBoss.parts[10].y;const chaseHp=p.hp;updateSnakeBoss(0);check(p.hp===chaseHp-1,'chase body contact damages');
setSnakeMode('wander');p.inv=0;p.x=snakeBoss.parts[10].x;p.y=snakeBoss.parts[10].y;updateSnakeBoss(0);check(p.hp===chaseHp-1,'wander retracts body contact');
snakeGod=true;snakeBoss.fire=0;updateSnakeBoss(.001);check(bullets.length===72,'wander emits circular bullets');
snakeBoss.modeLeft=.001;updateSnakeBoss(.01);check(snakeBoss.mode==='chase','automatic chase transition');snakeBoss.modeLeft=.001;updateSnakeBoss(.01);check(snakeBoss.mode==='wander','automatic return to wander');
for(const direction of [-1,1]){startSnakeTest();sound=false;snakeGod=true;setSnakeMode('chase');snakeBoss.head.x=325;snakeBoss.head.y=350;snakeBoss.head.angle=0;p.x=snakeBoss.head.x;p.y=snakeBoss.head.y+direction*200;updateSnakeBoss(.2);check(Math.sign(snakeBoss.head.angle)===direction,'chase turns toward player');}
const q1=snakeRoutePose(180),q2=snakeRoutePose(245),q3=snakeRoutePose(310);check(Math.max(q1.y,q2.y,q3.y)-Math.min(q1.y,q2.y,q3.y)>20,'initial path has visible snake waves');
const age=snakeBoss.age;paused=true;check(snakeBoss.age===age,'pause retained');paused=false;
startSnakeTest();sound=false;snakeGod=true;shootTimer=999;
const victim=snakeBoss.parts[8],previous=snakeBoss.parts[7],next=snakeBoss.parts[9];
shots=[{x:victim.x,y:victim.y,vx:0,vy:0,r:3,life:1,damage:100,pierce:1}];step(.001);
check(victim.hp<=0&&!enemies.includes(victim)&&kills===1,'real friendly shot destroys one segment');
check(next.previous===previous&&snakeBoss.parts.length===35&&state==='combat','real kill reconnects without ending boss');
startSnakeTest();sound=false;snakeGod=true;shootTimer=999;
for(const e of snakeBoss.parts)e.hp=0;step(.001);check(state==='bossDying','whole snake starts death sequence');step(3);
check(state==='menu'&&cleared&&!enemies.length&&!shots.length&&!bullets.length,'only whole snake defeat completes test');
startSnakeTest();sound=false;snakeGod=false;p.inv=0;p.hp=1;hurt();check(state==='dead'&&snakeTest,'death stays in test scene');
$('snake-again').onclick();check(state==='combat'&&snakeBoss.parts.length===36,'test replay');
reset();check(!snakeTest&&!snakeBoss&&state==='descent','normal reset clears boss');
console.log('Snake scene, segment damage/reconnection/identity, head/tail promotion, multi-kill, spacing, finite movement, bullets, victory/death/replay and reset passed');
`,sandbox);

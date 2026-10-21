const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);



vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
function close(a,b,m){check(Math.abs(a-b)<1e-6,m)}
function setup(){reset();state='combat';p.x=325;p.y=300;p.inv=0;spawnQueue=[{type:'eye',side:0}];spawnTimer=999;shootTimer=999;equipItem('shoes',createShoes('skateboard'));}
function nearMiss(){p.frameStartX=p.x;p.frameStartY=p.y;bullets=[{x:275,y:315,vx:1000,vy:0,r:4,c:'#ff795d',life:9}];updateEnemyBullets(.1);}
setup();nearMiss();check(p.grazeStacks===1&&skateInvulnerable(),'real near miss starts invincibility and reward');close(p.skateTrickLeft,.5,'jump duration');close(p.skateTrickInv,.5,'invincibility duration');check(cashPopups.some(q=>q.trick&&q.text==='NEON 720!'),'ollie floating label');const life=p.hp;p.shield=1;hurt();check(p.hp===life&&p.shield===1&&!p.floorHit,'trick immunity protects health, shield and no-hit eligibility');nearMiss();check(p.grazeStacks===1&&cashPopups.filter(q=>q.trick).length===1,'protected near miss cannot chain');
updateSkateReward(.175);check(skateJumpHeight()>20&&skateInvulnerable(),'airborne height and timed protection');draw();check($('cash-popups').innerHTML.includes('skate-trick-popup')&&$('cash-popups').innerHTML.includes('NEON 720!'),'projected styled floating label');check(renderer.data.slice(0,renderer.count).every(Number.isFinite),'airborne model finite');
updateSkateReward(.33);check(!skateInvulnerable()&&!p.skateTrickLeft,'protection ends on landing');hurt();check(p.shield===0&&p.floorHit&&!p.grazeStacks&&!p.skateTrickLeft,'damage resumes after 0.35 seconds');
setup();nearMiss();updateSkateReward(.5);close(skateJumpHeight(),0,'lands after half second');check(p.grazeStacks===1&&!skateInvulnerable(),'landing keeps attack buff and removes protection');
setup();nearMiss();equipItem('shoes',createShoes('runner'));check(!skateInvulnerable()&&!p.skateTrickLeft&&!p.grazeStacks,'swap clears trick and immunity');
setup();nearMiss();startFloorTracking();check(!skateInvulnerable()&&!p.skateTrickLeft,'floor resets trick');nearMiss();beginStageClear();check(!skateInvulnerable()&&!p.skateTrickLeft,'clear removes trick');
setup();nearMiss();state='upgrade';const remaining=p.skateTrickLeft;step(.1);close(p.skateTrickLeft,remaining,'shop freezes animation');reset();check(!skateInvulnerable()&&!p.skateTrickLeft&&!cashPopups.length,'restart clears animation and label');
setup();const card=equipmentAttributeCard('shoes',shoes,'已装备');check(card.includes('特技')&&card.includes('0.5')&&card.includes('0.5'),'actual timing on card');
time=.1;const c=skateFlowColor(2);time+=.01;const d=skateFlowColor(2);check(c!==d,'flow changes smoothly between sub-frame times');const rgb=x=>[1,3,5].map(i=>parseInt(x.slice(i,i+2),16));check(rgb(c).every((v,i)=>Math.abs(v-rgb(d)[i])<5),'no discrete color jumps');
function boardHeight(){renderer.count=0;renderer.projectileCount=0;drawSkateboard(0,0);let max=-Infinity;for(let i=1;i<renderer.count;i+=9)max=Math.max(max,renderer.data[i]);return max;}
p.skateTrickLeft=0;const resting=boardHeight();p.skateTrickLeft=.25;const airborne=boardHeight();check(airborne>resting+25,'actual board geometry rises');
console.log('Skateboard smooth flowing color, real graze ollie label, airborne mesh, temporary damage immunity, non-chaining, landing/swap/floor/clear/reset and card timings passed');
}`,sandbox);



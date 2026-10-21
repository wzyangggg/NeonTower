const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);



vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
function setup(){reset();state='combat';p.x=325;p.y=300;p.inv=0;equipItem('shoes',createShoes('skateboard'));p.skateStarted=true;}
setup();check(movementSpeed()>250&&movementSpeed()<260,'ordinary board cruising speed reduced');p.skateAngle=0;moveSkateboard(0,1,.1);const bend=Math.hypot(p.x-325,p.y-300);setup();p.skateAngle=0;moveSkateboard(0,0,.1);check(bend<(p.x-325)*.8,'sharp turn brakes without stopping');
setup();p.skateAngle=0;const startX=p.x;moveSkateboard(-1,0,.02);check(p.x>startX&&p.x-startX<movementSpeed()*.02*.6,'reversal keeps momentum at reduced speed');
setup();p.frameStartX=p.x;p.frameStartY=p.y;const b={x:325,y:319,vx:0,vy:-100,r:4,c:'#ff795d',life:9};bullets=[b];updateEnemyBullets(.01);check(p.skateTrickInv>0&&p.grazeStacks===1,'protection at near-ring entry');updateEnemyBullets(.12);check(p.hp===3&&!p.floorHit&&p.grazeStacks===1,'same approaching basic bullet cannot damage during trick');
setup();p.frameStartX=p.x;p.frameStartY=p.y;bullets=[{x:325,y:300,vx:0,vy:0,r:4,c:'#ff795d',life:9}];updateEnemyBullets(.01);check(p.hp===3&&p.grazeStacks===1,'direct overlap triggers automatic trick');
console.log('Lower skateboard cruising speed, automatic sharp-turn braking with momentum, immediate safe-entry graze protection and unchanged direct-hit damage passed');
}`,sandbox);

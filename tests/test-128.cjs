const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);



vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
function close(a,b,m){check(Math.abs(a-b)<1e-5,m)}
reset();state='combat';p.x=325;p.y=300;p.inv=0;equipItem('shoes',createShoes('skateboard'));p.skateAngle=0;triggerSkateTrick();close(skateJumpHeight(),0,'starts on floor');close(skateSpinAngle(),0,'rotation starts aligned');
p.skateTrickLeft=.25;close(skateJumpHeight(),144,'higher jump apex');close(skateSpinAngle(),TAU,'one full turn at midpoint');
p.skateTrickLeft=.04;close(skateSpinAngle(),TAU*2,'two full turns before landing');
// Actual board geometry rotates around the rider while rider geometry only lifts/leans.
p.skateTrickLeft=.3125;const spin=skateSpinAngle(),lift=skateJumpHeight(),progress=skateTrickProgress(),pitch=Math.sin(progress*TAU)*.38;
function sample(board){renderer.count=0;renderer.projectileCount=0;renderer.box(20,4,0,2,2,2,'#ffffff');const before=Array.from(renderer.data.slice(0,renderer.count));transformSkateMesh(0,0,board);return {before,after:Array.from(renderer.data.slice(0,renderer.count))};}
const board=sample(true),rider=sample(false);const x=board.before[0],y=board.before[1]-4,z=board.before[2],px=x*Math.cos(pitch)-y*Math.sin(pitch);close(board.after[0],px*Math.cos(spin)-z*Math.sin(spin),'board vertex horizontal spin');close(board.after[2],px*Math.sin(spin)+z*Math.cos(spin),'board vertex rotated z');check(Math.abs(board.after[2]-rider.after[2])>5,'board spins independently of rider');
close(board.after[1],4+y*Math.cos(pitch)+x*Math.sin(pitch)+lift-10*Math.sin(progress*Math.PI),'board separated below feet');
for(let i=0;i<=20;i++){p.skateTrickLeft=.5-i*.025;draw();check(renderer.data.slice(0,renderer.count).every(Number.isFinite),'finite model throughout two turns');}
p.skateTrickLeft=0;close(skateJumpHeight(),0,'landed height');close(skateSpinAngle(),0,'resting alignment');check(cashPopups.some(q=>q.text==='NEON 720!'),'matching trick name');
console.log('Higher 72-unit jump, exact two horizontal board revolutions, rider independence, foot separation, finite full animation and landing alignment passed');
}`,sandbox);

const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);



vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
function hitCount(w,distance,source='weapon'){shots=[];emitWeaponShots(w,0,{x:325,y:300},source);const target={x:325+distance,y:300,r:14};let hits=0;for(const shot of shots){for(let i=0;i<80;i++){shot.x+=shot.vx*.016;shot.y+=shot.vy*.016;if(shotHits(shot,target,.016)){hits++;break}if(shot.x>target.x+30)break}}return hits}
reset();const shotgun=createWeapon('shotgun'),old={...shotgun,spread:.11};
const distances=[100,200,350,450],before=distances.map(d=>hitCount(old,d)),after=distances.map(d=>hitCount(shotgun,d));
check(after.join(',')==='5,5,3,3','close and middle range pellet hits');check(after.every((n,i)=>n>=before[i])&&after[1]>before[1],'reduced spread improves actual hits');
check(shotgun.damage===.95&&shotgun.interval===.5&&shotgun.speed===680,'damage cadence and speed buff');
for(const tier of [1,3,5]){const w=createWeapon('shotgun',tier),dr=createDrone('shotgun',tier);check(hitCount(w,350)===3&&hitCount(dr,350,'drone')===3,'all qualities and drone keep tight pattern');check(Math.abs(dr.damage-w.damage*.65)<.006,'drone scaling retained');}
check(3*shotgun.damage/shotgun.interval>5&&5*shotgun.damage/shotgun.interval<=9.5,'useful midrange damage without excessive close burst');
console.log('Shotgun static target hits at 100/200/350/450: '+before.join('/')+' -> '+after.join('/')+'; all grades and drone patterns passed');
}`,sandbox);

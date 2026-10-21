const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);





vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
function setup(){reset();state='combat';p.inv=0;p.hp=1;enemies=[{type:'chaser',x:400,y:300,r:12,hp:2,max:2,seed:0}];spawnQueue=[];}
setup();hurt();check(state==='dead'&&playerDeath&&p.hp===0,'fatal hit starts death');check($('overlay').style.display==='none','no immediate UI');check(particles.filter(q=>q.chunk).length===42,'death emits fragments');const n=particles.length;hurt();check(particles.length===n&&playerDeath.age===0,'repeated damage cannot restart death');
const q=particles.find(q=>q.chunk),x=q.x,ex=enemies[0].x,px=p.x;keys.d=true;step(.001,.5);check(q.x!==x&&q.life<1.9,'particles animate on real time');check(playerDeath.age===.5&&enemies[0].x===ex&&p.x===px,'death timer uses real seconds, combat frozen');
let healthDraws=0,equipmentDraws=0;const oldHealth=drawPlayerHealthBar,oldEquipment=drawEquipmentModels;drawPlayerHealthBar=()=>healthDraws++;drawEquipmentModels=()=>equipmentDraws++;draw();check(healthDraws===0&&equipmentDraws===0,'dead player health and equipment hidden');drawPlayerHealthBar=oldHealth;drawEquipmentModels=oldEquipment;
step(1.499);check($('overlay').style.display==='none','UI hidden through 1.999 seconds');step(.001);check(!playerDeath&&$('overlay').style.display==='flex'&&$('overlay').innerHTML.includes('SIGNAL LOST'),'UI at exactly two seconds');check($('restart').onclick===reset,'restart wired');const html=$('overlay').innerHTML;step(5);check($('overlay').innerHTML===html,'UI completed once');
setup();hurt();step(.4);reset();step(2);check(!playerDeath&&state!=='dead'&&$('overlay').style.display==='none','restart cancels pending UI');
setup();p.hp=2;hurt();check(state==='combat'&&!playerDeath&&p.hp===1,'nonfatal damage unchanged');
setup();hurt();step(5);check(!playerDeath&&$('overlay').style.display==='flex','large frame completes once');
console.log('Player death: particles, hidden player, real two-second UI delay, frozen combat, repeated damage, reset and nonfatal hits passed');
}`,sandbox);

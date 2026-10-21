const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);
vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
function close(a,b,m){check(Math.abs(a-b)<1e-6,m)}
function move(dx,dy){time+=1/60;p.x+=dx;p.y+=dy;return updatePlayerBiped();}
function walking(){let active=false;for(let i=0;i<20;i++)active=move(3,0).legs.some(l=>l.swing)||active;check(active,'ground walking resumes');}
reset();state='combat';time=0;updatePlayerBiped();walking();
for(const id of ['warpstar','neonsword','vinyl','skateboard','tentacle','spider','ufo','sharkblimp','smallplane']){
 if(id==='tentacle')shoes=createShoes(id);else equipItem('shoes',createShoes(id));let g=updatePlayerBiped();
 for(const [dx,dy]of [[3,0],[0,3],[-3,0],[0,-3],[2,2],[0,0]])for(let n=0;n<24;n++){
  g=move(dx,dy);close(g.height,19.8,id+' stable pelvis');close(g.blend,0,id+' no walk blend');
  for(let i=0;i<2;i++){const l=g.legs[i];check(!l.swing,id+' no foot swing');close(l.foot[0]-g.x,i===0?-6:6,id+' local foot x');close(l.foot[1],4,id+' local foot height');close(l.foot[2]-g.z,0,id+' local foot z');
   const pose=playerBipedLegPose(g,i);check([...pose.hip,...pose.knee,...pose.foot].every(Number.isFinite),id+' finite IK');}
 }
 const before=JSON.stringify(g);updatePlayerBiped();check(JSON.stringify(g)===before,id+' frozen clock');
 p.x+=100;g=updatePlayerBiped();close(g.legs[0].foot[0]-g.x,-6,id+' teleport reset');
 equipItem('shoes',createShoes('runner'));g=updatePlayerBiped();check(!g.mounted&&g.legs.every(l=>!l.swing),'dismount clears contacts');walking();
}
for(const id of ['runner','steady','catalyst','magnet']){equipItem('shoes',createShoes(id));check(!playerMounted(),id+' ordinary shoes');walking();}
console.log('Mounted rider: fixed local feet in all directions, stable pelvis, stop/frozen clock/teleport, mount and dismount during walking, ordinary shoes passed');
}`,sandbox);

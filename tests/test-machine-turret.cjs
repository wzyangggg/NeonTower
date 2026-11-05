const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/assets/machine-turret.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);



vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
reset();sound=false;state='combat';p.inv=999;tiles=[];turrets=[createTurret('machine','top',.5,1)];bullets=[];
const t=turrets[0];updateTerrain(1.24);check(!bullets.length&&!t.warn,'initial charge');updateTerrain(.02);check(t.warn&&!bullets.length,'visible warning');updateTerrain(.741);check(bullets.length===1&&t.rounds===6,'charged first shot');
const aim=t.aim;p.x+=70;p.y+=50;
for(let i=0;i<6;i++){updateTerrain(.13);check(bullets.length===i+2,'one separate shot '+i);}
check(!t.rounds&&t.cool>3.19,'exactly seven then recharge');check(bullets.every(b=>Math.abs(Math.atan2(b.vy,b.vx)-aim)<1e-6),'locked burst heading');
updateTerrain(3);check(bullets.length===7,'no eighth shot during charge');updateTerrain(.21);check(bullets.length===8&&t.rounds===6,'next burst');
resetTurretCooldowns();check(!t.rounds&&!t.gap&&!t.recoil&&!t.muzzleFlash&&t.cool===2,'reset clears partial burst');
for(const dt of [.01,.016,.1,.4]){resetTurretCooldowns();bullets=[];for(let age=0;age<2.9-1e-6;age+=dt)updateMachineTurret(t,Math.min(dt,2.9-age));check(bullets.length===7,'frame independent seven dt='+dt);}
resetTurretCooldowns();bullets=[];updateMachineTurret(t,2.9);check(bullets.length===7,'large delta carries all seven shots');
resetTurretCooldowns();state='combat';paused=true;const cool=t.cool;step(.4);check(t.cool===cool,'pause freezes charge');paused=false;
for(const [name,data] of Object.entries(MachineTurretMeshes)){check(data.length>0&&data.length%27===0,'triangles '+name);for(let i=0;i<data.length;i+=9){check([...data.slice(i,i+9)].every(Number.isFinite),'finite');check(Math.abs(Math.hypot(...data.slice(i+3,i+6))-1)<.002,'normals');}}
draw();for(const name of ['base','head','barrel'])check(renderer.residentMeshes.get('machine-turret:'+name).data.length===MachineTurretMeshes[name].length,'actual Blender mesh '+name);
const before=renderer.residentMeshes.get('machine-turret:head').data;draw();check(renderer.residentMeshes.get('machine-turret:head').data===before,'reuse fixed geometry');
check(t.invulnerable&&!('hp' in t)&&!combatTargets().includes(t),'trap stays invulnerable and untargetable');
console.log('Machine turret: exact seven, timing/large dt, recharge, locked aim, pause/reset, Blender parts and shared meshes passed.');
}`,sandbox);

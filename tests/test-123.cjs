const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);



vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
function enemy(x,y){return {type:'eye',x,y,homeX:x,homeY:y,hp:100,max:100,r:14,t:0,fire:999,seed:0}}
function setup(){reset();state='combat';p.x=325;p.y=300;p.inv=999;tiles=[];spawnQueue=[];chaserSpawned=24;missiles=[];turrets=[];equipItem('weapon',createWeapon('uzi'));shots=[]}
function aims(s,e){const dx=e.x-s.x,dy=e.y-s.y;return Math.abs(dx*s.vy-dy*s.vx)<1e-6&&dx*s.vx+dy*s.vy>0}
setup();const near=enemy(400,300),second=enemy(325,410),far=enemy(100,100);enemies=[far,second,near];shootWeapon(0);
check(shots.length===2&&aims(shots[0],near)&&aims(shots[1],second),'two closest targets each receive one barrel');
check(shots.every(s=>s.damage===.38&&Math.abs(Math.hypot(s.vx,s.vy)-900)<1e-6)&&shootTimer===weapon.interval,'base damage, speed and cooldown');
shots=[];enemies=[second];shootWeapon(Math.PI/2);check(shots.length===2&&shots.every(s=>aims(s,second)),'single target takes both guns');
shots=[];second.hp=0;enemies=[far,second,near];shootWeapon(0);check(aims(shots[0],near)&&aims(shots[1],far),'dead target replaced on next volley');
setup();enemies=[enemy(335,300)];turrets=[{type:'turret',hp:100,x:326,y:300}];shootWeapon(0);check(shots.every(s=>aims(s,enemies[0])),'trap excluded even when closer');
setup();enemies=[];shootTimer=0;step(.001);check(!shots.length,'no targets means no automatic firing');
setup();enemies=[enemy(440,300),enemy(325,430)];step(.001);shootTimer=999;for(let i=0;i<18;i++)step(.01);check(enemies.every(e=>Math.abs(e.hp-99.62)<1e-6),'actual volley damages both targets once');
setup();enemies=[enemy(440,300)];step(.001);shootTimer=999;for(let i=0;i<18;i++)step(.01);check(Math.abs(enemies[0].hp-99.24)<1e-6,'single enemy takes both actual bullets');
for(let tier=1;tier<=5;tier++){const w=createWeapon('uzi',tier);check(w.pellets===2&&w.damage===Math.round(.38*(1+(tier-1)*.5)*100)/100,'tier scales damage');}
setup();enemies=[near,far];equipItem('armor',createArmor('ambush'));shootWeapon(0);check(shots.every(s=>s.critChance===armor.critChanceBonus&&s.critMultiplier===2+armor.critDamageBonus),'both bullets snapshot critical profile');
for(const key of ['weapon']){const pool=testEquipmentTypes(key),index=pool.findIndex(w=>w.id==='uzi'),random=Math.random;let calls=0;const models=WEAPON_MODELS.filter(m=>m.tier===2),pick=models.findIndex(m=>m.id==='uzi_t2');shopLevel=key==='weapon'?2:1;Math.random=()=>key==='weapon'?(calls++===0?.99:(pick+.1)/models.length):(index+.1)/pool.length;check(itemEquipment(equipmentShopItem(key)).id==='uzi','blind box pool');Math.random=random;check(takeTestEquipment(key,'uzi',3),'test panel');check(equipmentAttributeCard(key,equipmentInSlot(key),'已装备').includes('双枪分别瞄准'),'card explains split targeting');}
state='combat';enemies=[enemy(400,300),enemy(325,410)];draw();check(renderer.data.slice(0,renderer.count).every(Number.isFinite),'dual models render finite geometry');
console.log('Dual Uzi closest-two/single targeting, replacement, trap exclusion, actual damage, tiers, crit snapshots, acquisition and mock rendering passed');
}`,sandbox);

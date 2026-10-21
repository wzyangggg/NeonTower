const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);



vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
const rifle=createWeapon('rifle'),sniper=createWeapon('sniper'),magnum=createWeapon('magnum'),smg=createWeapon('smg');
check(rifle.damage>smg.damage&&rifle.interval>smg.interval&&rifle.interval<.3,'rifle stable medium cadence');
check(sniper.damage>magnum.damage&&sniper.interval>magnum.interval&&sniper.speed>rifle.speed,'sniper heaviest single hit with longest reload');
check(magnum.damage>5&&magnum.interval>rifle.interval&&magnum.pierce===1&&sniper.pierce===1,'magnum and sniper single-target heavy hits distinct from rail');
for(const id of ['rifle','sniper','magnum']){
 reset();state='combat';p.y=300;p.inv=999;spawnQueue=[];chaserSpawned=24;turrets=[];
 weapon=createWeapon(id);weapon.critChance=0;shootWeapon(0);const shot=shots[0];shootTimer=999;
 check(shots.length===1&&shot.weaponId===id&&shot.damage===weapon.damage&&!shot.beam,'new weapon projectile snapshot');
 enemies=[{type:'eye',x:350,y:300,homeX:350,homeY:300,hp:100,max:100,r:14,t:0,fire:999,seed:0}];
 step(.02);check(enemies[0].hp===100-weapon.damage&&shots.length===0,'heavy single projectile actually hits and stops');
 const d=createDrone(id,3);check(d.name&&d.id===id&&d.damage===Math.round(createWeapon(id,3).damage*.65*100)/100,'new drone factory');
 shots=[];equipItem('drone',d);updateDrone(.01,[enemies[0]]);check(shots.length===1&&shots[0].source==='drone'&&shots[0].weaponId===id,'new drone firing');
 check(droneShootTimer===d.interval,'drone cadence');
 equipItem('weapon',createWeapon(id,3));draw();check(renderer.data.slice(0,renderer.count).every(Number.isFinite),'new weapon and projectile models finite');
 const random=Math.random,index=WEAPON_TYPES.findIndex(w=>w.id===id);Math.random=()=> (index+.1)/WEAPON_TYPES.length;
 shopLevel=1;if(id!=='magnum')for(const key of ['weapon']){let calls=0;const model=WEAPON_MODELS.find(m=>m.engineId===id||m.familyId===id),pool=key==='weapon'?WEAPON_MODELS.filter(m=>m.tier===model.tier):DRONE_TYPES;shopLevel=key==='weapon'?model.tier:1;const pick=key==='weapon'?pool.findIndex(m=>m.id===model.id):pool.findIndex(m=>m.id===id);Math.random=()=>shopLevel>1&&calls++===0?.99:(pick+.1)/pool.length;const box=equipmentShopItem(key);check(itemEquipment(box).id===id&&box.blindBox,'weapon available in category box pool');const card=equipmentAttributeCard(key,itemEquipment(box),'新装备');check(card.includes('攻击力')&&card.includes('攻速')&&!card.includes('DPS'),'simple equipment card');}
 Math.random=random;
}
console.log('Rifle/sniper/magnum identities, real hit damage, drone cooldown, blind-box eligibility and finite models passed');
}`,sandbox);

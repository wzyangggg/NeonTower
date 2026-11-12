const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/assets/drink-truck.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);





vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
check(DrinkTruckMesh.length%27===0&&DrinkTruckMesh.length/27>1000&&DrinkTruckMesh.length/27<40000,'authored triangle mesh budget');
for(let i=0;i<DrinkTruckMesh.length;i+=9){for(let j=0;j<9;j++)check(Number.isFinite(DrinkTruckMesh[i+j]),'finite mesh');check((DrinkTruckMesh[i+3]===0&&DrinkTruckMesh[i+4]===2&&DrinkTruckMesh[i+5]===0)||Math.abs(Math.hypot(...DrinkTruckMesh.slice(i+3,i+6))-1)<.002,'normalized mesh normals');for(let j=6;j<9;j++)check(DrinkTruckMesh[i+j]>=0&&DrinkTruckMesh[i+j]<=1,'valid vertex colors');}
const expected=[7,18,29];for(let f=1;f<=33;f++){check(!isGreedFloor(f),'gold room disabled '+f);}
for(const f of expected){
 reset();floor=f;startWave();check(state!=='drinkArrival'&&!drinkTruck,'no campaign drink stop '+f);
 reset();floor=f;enemies=[{type:'spitter',hp:9}];turrets=[{temporary:false}];bullets=[{}];spawnQueue=[{}];startDrinkTruckRoom();
 check(state==='drinkArrival'&&!enemies.length&&!turrets.length&&!bullets.length&&!spawnQueue.length&&!timedRoom&&!greedRoom,'safe arrival '+f);
 const truck=drinkTruck;step(1);check(state==='drinkArrival'&&truck.age===1,'no early popup');startDrinkTruckRoom();check(drinkTruck===truck&&truck.age===1,'reentry preserves arrival');
 togglePause();step(50);check(paused&&truck.age===1,'pause arrival');togglePause();
 check(!chooseTruckDrink(0),'cannot choose before parked');step(2.19);check(state==='drinkArrival','settling before popup');step(.02);
 check(truck.parked&&state==='upgrade'&&terrainView==='drinkChoice','park before choices');
 check(truck.offers.length===3&&new Set(truck.offers.map(u=>u.drinkId)).size===3,'three different usable drinks');
 check($('overlay').innerHTML.includes('三选一')&&!$('overlay').innerHTML.includes('bar-reroll'),'choice UI no reroll');
 const age=truck.age;for(let i=0;i<300;i++)step(.1);check(!enemies.length&&!bullets.length&&!spawnQueue.length&&truck.age===age,'no combat after parking');
 cash=0;const id=truck.offers[0].drinkId;check(!chooseTruckDrink(-1)&&!chooseTruckDrink(3),'invalid selections');
 leaveShop();check(terrainView==='drinkChoice'&&floor===f,'cannot skip mandatory choice');
 check(chooseTruckDrink(0)&&drinkBottles.length===1&&drinkRewardCount(id)===1&&cash===0,'one free drink with immediate effect');
 check(!chooseTruckDrink(1)&&drinkBottles.length===1,'double click cannot take another');
 check(state==='upgrade'&&terrainView==='equipment'&&shopItems.length===3,'ordinary shop after choice');
 draw();const count=renderer.residentMeshes.size;draw();check(count===renderer.residentMeshes.size,'resident truck mesh stable');check(renderer.residentMeshes.get('drink-truck:van').data.length===DrinkTruckMesh.length,'actual Blender asset retained');
 check([...renderer.data.subarray(0,renderer.count)].every(Number.isFinite),'truck geometry finite');
 leaveShop();check(floor===f+1&&state==='descent'&&!drinkTruck,'next floor cleans truck');
}
reset();state='upgrade';consumeDrink('crab');const b=drinkBottles[0];floor=7;startDrinkTruckRoom();step(20);chooseTruckDrink(0);check(b.left===2&&b.activeFloor===-1,'peaceful room does not advance wager');
reset();floor=29;p.max=p.hp=1;shopLevel=5;startDrinkTruckRoom();step(4);check(drinkTruck.offers.every(u=>!['bit','ale'].includes(u.drinkId)),'unusable drinks excluded');
reset();check(!drinkTruck,'restart removes truck');startDrinkTruckTest();check(testMode&&state==='drinkArrival'&&floor===7,'new lab entry');
console.log('Drink truck: lab-only truck, disabled gold, safe arrival/parking/pause, three usable distinct drinks, free single choice/double clicks, shop/descent, legacy effects and resident rendering passed.');
}`,sandbox);

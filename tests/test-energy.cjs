const fs=require('node:fs'),vm=require('node:vm');
const H=require('../dist/hex-map.js'),elements={};
const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{},hidden:true,classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const sandbox={Image:class {complete=true;naturalWidth=256;},HexMap:H,console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);
for(const file of ['music','renderer','map-icons','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss','electric-tiles']){const src=fs.readFileSync('dist/'+file+'.js','utf8').replace('const ENERGY_SYSTEM_ENABLED=false;','const ENERGY_SYSTEM_ENABLED=true;');vm.runInContext(file==='game'?H.transform(src):src,sandbox);}
vm.runInContext(`{
const E=ElectricTiles;
function check(v,m){if(!v)throw Error(m)}
function near(a,b,m){check(Math.abs(a-b)<1e-6,m+': '+a+' / '+b)}
reset();check(p.energy===60,'new run full energy');const core=E.list().find(f=>f.initialCore);
check(core&&core.kind==='energy'&&core.anchor.x===0&&core.anchor.y===0,'initial center is energy station');
check(!E.move(core,{x:1,y:0})&&!E.canMerge({kind:'energy',level:1},core),'core cannot move or merge');E.remove(core);check(E.list().includes(core),'core cannot be demolished');
const coreTile=tiles.find(t=>t.electricFacility===core);check(terrainProtected(coreTile)&&!builderTileAvailable(coreTile)&&!buildRandomTrap(coreTile),'builder cannot select or convert core');
const workAt=builderTileCenter(coreTile),builder={type:'builder',hp:10,x:workAt.x,y:workAt.y,buildTarget:coreTile,buildProgress:4.99,buildCooldown:0};enemies=[builder];updateBuilder(builder,.02);check(builder.buildTarget!==coreTile&&!coreTile.trap&&!coreTile.saw&&!coreTile.flywheel,'stale in-progress enemy target is cancelled');
const ordinary=tiles.find(t=>!terrainProtected(t)),ordinaryKey={x:ordinary.x,y:ordinary.y};
terrainChange=planTerrainChange(()=>{tiles=tiles.filter(t=>t.x!==0||t.y!==0);tiles.find(t=>t.x===ordinaryKey.x&&t.y===ordinaryKey.y).trap={clock:0};});finishTerrainChange();
check(tiles.includes(coreTile)&&coreTile.electricFacility===core&&coreTile.terrainProtected,'planned ground removal preserves original core tile and station');check(ordinary.trap,'ordinary terrain remains mutable');delete ordinary.trap;
terrainChange=planTerrainChange(()=>{const t=tiles.find(t=>t.x===0&&t.y===0);delete t.electricFacility;delete t.terrainProtected;t.coverTile=true;t.trap={clock:0};});finishTerrainChange();check(coreTile.electricFacility===core&&!coreTile.coverTile&&!coreTile.trap,'replacement cannot overwrite core');
terrainChange={tiles:tiles.filter(t=>t!==coreTile),turrets:[],changes:[],hidden:new Set(),age:0};finishTerrainChange();check(tiles.includes(coreTile)&&coreTile.electricFacility===core,'commit also protects core against stale terrain plans');
startWave();p.inv=999;p.x=100;p.y=100;state='combat';
for(const m of WEAPON_MODELS){weapon=createWeaponModel(m.id);p.energy=60;shots=[];const rate=weaponEnergyRate();check(Number.isFinite(rate)&&rate>=3&&rate<=24,'bounded DPS rate '+m.id);let volleys=0;while(shootWeapon(0)){volleys++;check(volleys<1000,'bounded volleys');}check(volleys>0,'usable gun '+m.id);const reserveSeconds=volleys*weapon.interval;check(reserveSeconds<=ENERGY_MAX/rate+1e-8&&reserveSeconds>ENERGY_MAX/rate-weapon.interval-1e-8,'reserve duration follows current weapon DPS and energy rate '+m.id);near(p.energy,ENERGY_MAX-volleys*rate*weapon.interval,'energy conserved '+m.id);check(reserveSeconds<=20+1e-8,'bounded reserve at minimum energy rate '+m.id);const held=shots.length,energy=p.energy;check(!shootWeapon(0)&&shots.length===held&&p.energy===energy,'empty blocks emission '+m.id);}
weapon=createWeaponModel('pistol_t1');near(weaponEnergyRate(),4,'starter four energy per second');near(ENERGY_MAX/weaponEnergyRate(),15,'starter covers three quarters of opening room');
check(weaponEnergyRate(createWeaponModel('sniper_t5'))>weaponEnergyRate(),'high DPS costs more');
// Once the opening reserve is gone, a tier-one core cannot feed a heavy gun continuously.
function supplyCycle(id){weapon=createWeaponModel(id);p.energy=0;shots=[];let next=0,waiting=0,fired=0;const dt=.01;for(let i=0;i<4000;i++){if(i%400===0)p.energy=Math.min(ENERGY_MAX,p.energy+ENERGY_PACK);next-=dt;if(next<=1e-8){if(shootWeapon(0)){next=weapon.interval;fired++;}else waiting+=dt;}}return {waiting,fired};}
const light=supplyCycle('pistol_t1'),heavy=supplyCycle('sniper_t5');check(light.waiting<.02&&light.fired>200,'tier one production sustains low energy pistol');check(heavy.waiting>15&&heavy.fired>0,'heavy weapon spends over fifteen of forty seconds waiting on tier one production');
weapon=createWeaponModel('pistol_t1');
const burst=createWeaponModel('rifle_t2');near(weaponEnergyDps(burst),burst.damage*3/burst.interval,'full burst included');
const sustained=createWeaponModel('laser_t5');near(weaponEnergyDps(sustained),sustained.damage*.45*7/sustained.interval,'sustained beam ticks included');
p.energy=0;core.cool=4;core.products=0;E.update(3.99);check(!core.products&&p.energy===0,'no remote regeneration');E.update(.01);check(core.products===1,'four second production');E.update(12);check(core.products===1,'one stored pack stops production');
const at=E.center(core.anchor);p.x=at.x;p.y=at.y;E.update(.01);check(p.energy===30&&core.products===0,'walking to core restores thirty');check(shootWeapon(0),'pickup resumes gun');
p.energy=60;core.products=1;E.update(.5);check(core.products===1&&p.energy===60,'full tank retains pack');p.energy=50;E.update(.01);check(p.energy===60&&core.products===0,'pickup caps energy');
p.x=100;p.y=100;const before=core.cool;paused=true;E.update(10);near(core.cool,before,'pause freezes production');paused=false;state='upgrade';E.update(10);near(core.cool,before,'shop freezes production');
p.energy=0;floor=2;startWave();check(p.energy===60&&E.list().includes(core),'next floor refills and retains same core');
weapon=createWeapon('rotor',1);p.energy=60;shots=[];for(let i=0;i<60;i++)shootWeapon(0,1/60);near(p.energy,60-weaponEnergyRate(),'continuous rotor charged by time');
reset();check(E.list().filter(f=>f.initialCore).length===1&&p.energy===60,'restart creates exactly one new core');
// The blue bar stays directly under the same world-space health/shield bar.
const savedBox=renderer.box,savedEmissive=renderer.emissiveBox,boxes=[],fills=[];renderer.box=(...args)=>boxes.push(args);renderer.emissiveBox=(...args)=>fills.push(args);
p.shield=2;p.energy=30;drawPlayerHealthBar(10,100,20);const mana=fills.find(args=>args[6]==='#428fff'),healthFrame=boxes[0];check(mana&&mana[1]===83&&mana[2]===22.3,'blue bar below player health');near(mana[3],(healthFrame[3]-4)/2,'half mana fills half shared width');
p.energy=0;fills.length=0;drawPlayerHealthBar(10,100,20);check(!fills.some(args=>args[6]==='#428fff'),'empty mana retains frame without fill');renderer.box=savedBox;renderer.emissiveBox=savedEmissive;
weapon=createWeaponModel('pistol_t1');p.energy=0;p.energyWarningUntil=-Infinity;time=100;shootWeapon(0);check($('toast').textContent==='蓝量不足','insufficient mana popup');$('toast').textContent='sentinel';for(let i=0;i<100;i++)shootWeapon(0);check($('toast').textContent==='sentinel','dry firing does not spam popup');time+=2;shootWeapon(0);check($('toast').textContent==='蓝量不足','persistent shortage can remind again');
console.log(JSON.stringify(WEAPON_MODELS.map(m=>{const w=createWeaponModel(m.id);return {gun:m.name,dps:+weaponEnergyDps(w).toFixed(2),energyPerSecond:+weaponEnergyRate(w).toFixed(2),seconds:+(60/weaponEnergyRate(w)).toFixed(1)};})));
}`,sandbox);
console.log('Energy depletion, all gun models, bursts, continuous fire, core production/pickup, pause and floor reset passed');

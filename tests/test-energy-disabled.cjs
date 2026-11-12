const fs=require('node:fs'),vm=require('node:vm');
const H=require('../dist/hex-map.js'),elements={};
const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{},hidden:true,classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const sandbox={Image:class {complete=true;naturalWidth=256;},HexMap:H,console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);
for(const file of ['music','renderer','map-icons','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss','electric-tiles']){const src=fs.readFileSync('dist/'+file+'.js','utf8');vm.runInContext(file==='game'?H.transform(src):src,sandbox);}
vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
reset();startWave();check(!ENERGY_SYSTEM_ENABLED,'production energy system disabled');check(!ElectricTiles.list().some(f=>f.kind==='energy'),'no initial energy station');check(!ElectricTiles.enabled('energy'),'energy facilities unavailable');check(!tiles.some(terrainProtected),'no reserved supply tile');
const notice=$('toast').textContent;
for(const m of WEAPON_MODELS){weapon=createWeaponModel(m.id);p.energy=0;shots=[];for(let i=0;i<100;i++)check(shootWeapon(0),'empty blue never stops '+m.id);check(shots.length>0&&p.energy===0,'gun fires without consuming energy '+m.id);}
check($('toast').textContent===notice,'no insufficient blue notification');updateUI();check($('energy-hud').hidden,'energy HUD hidden');check(!equipmentStatRows('weapon',weapon).some(row=>row[0]==='基础耗能'),'energy stat hidden');
const original=renderer.emissiveBox;let blue=false;renderer.emissiveBox=(...args)=>{if(args[6]==='#428fff')blue=true;};drawPlayerHealthBar(0,100,0);renderer.emissiveBox=original;check(!blue,'player blue bar hidden');
const center=tiles.find(t=>t.x===0&&t.y===0);check(builderTileAvailable(center),'initial center restored as normal usable terrain');reset();check(!ElectricTiles.list().length,'restart does not recreate energy station');
}`,sandbox);
console.log('Energy disabled by default: 43 weapons fire with zero energy, no HUD/bar/warnings/stats/core, ordinary center and restart passed');

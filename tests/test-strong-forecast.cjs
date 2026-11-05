const fs=require('node:fs'),vm=require('node:vm');
const elements={};const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);if(process.argv.includes('--hex'))vm.runInContext(fs.readFileSync('dist/hex-map.js','utf8')+'\n'+fs.readFileSync('dist/terrain-generators.js','utf8'),sandbox);for(const file of ['music','renderer','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss']){let code=fs.readFileSync('dist/'+file+'.js','utf8');if(file==='game'&&process.argv.includes('--hex'))code=require('../dist/hex-map.js').transform(code);vm.runInContext(code,sandbox);}
vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
GROUND_ENEMIES.enabled=true;reset();floor=4;const before=JSON.stringify({tiles,enemies,spawnQueue,bridgeRoom});const forecast=strongEnemyForecast();
check(forecast.length===BUILDER_ROOM_COUNT&&forecast.every(e=>e.type==='builder'),'three builder warnings');
check(before===JSON.stringify({tiles,enemies,spawnQueue,bridgeRoom}),'forecast is read-only');
startWave();for(const f of forecast)check(enemies.some(e=>e.type===f.type&&Math.hypot(e.x-f.x,e.y-f.y)<.001),'builder uses advertised entry');
GROUND_ENEMIES.enabled=false;for(const n of [1,9,20,31]){reset();floor=n;beginDescent();const reference=bridgeRoom,f=strongEnemyForecast(),warning=f.find(e=>e.type==='crawler');check(warning&&warning.count>0&&bridgeRoom===reference,'read-only persistent bridge warning '+n);startWave();check(JSON.stringify(warning.target)===JSON.stringify(bridgeRoom.ends[0].entry)&&warning.x===bridgeRoom.ends[0].start.x,'bridge entry matches '+n);}
reset();floor=14;const ranged=strongEnemyForecast();check(ranged.some(e=>e.type==='stealthDrone'),'advanced ranged warning');const roster=buildNormalRoster();check(ranged.filter(e=>e.type!=='crawler').reduce((n,e)=>n+e.count,0)===roster.filter(e=>e.strongEntry).length,'counts match full roster');
for(const f of ranged.filter(e=>e.type!=='crawler')){enemies=[];check(spawn(roster.find(e=>e.type===f.type&&e.side===f.side)),'ranged spawn');check(Math.hypot(enemies[0].x-f.x,enemies[0].y-f.y)<.001,'ranged direction matches');}
for(const n of [1,2,3,6,7,10,11]){reset();floor=n;if(isDrinkFloor()||campaignBossIndex()||isSawFloor()||isRailFloor())check(!strongEnemyForecast().length,'no false warning '+n);}
GROUND_ENEMIES.enabled=true;reset();floor=4;const layout=tiles.map(t=>({...t})),first=JSON.stringify(strongEnemyForecast());floor=9;strongEnemyForecast();GROUND_ENEMIES.enabled=true;reset();tiles=layout;floor=4;check(JSON.stringify(strongEnemyForecast())===first,'restart has no stale plan');
console.log('Strong enemy forecast: read-only planning, builder/bridge/advanced enemy entries, roster counts, special-room exclusions and restart passed.');
}`,sandbox);

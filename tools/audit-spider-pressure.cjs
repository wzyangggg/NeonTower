const fs=require('node:fs'),vm=require('node:vm');
const elements={};const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/hex-map.js','utf8')+'\n'+fs.readFileSync('dist/terrain-generators.js','utf8'),sandbox);for(const file of ['music','renderer','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss','electric-tiles']){let code=fs.readFileSync('dist/'+file+'.js','utf8');if(file==='game')code=require('../dist/hex-map.js').transform(code);vm.runInContext(code,sandbox);}
vm.runInContext(`{
function run(){
 reset();if(typeof HexMap!=='undefined'){tiles=HexMap.campaignFloor('spider-pressure');clearBridgeRoom(true);}floor=1;startWave();
 p.x=bridgeRoom.ends[0].entry.x;p.y=bridgeRoom.ends[0].entry.y;p.inv=999;step(1);
 enemies=enemies.filter(e=>e.type==='crawler');spawnQueue=spawnQueue.filter(e=>e.type==='crawler');timedRoom.nextWaveAt=999;
 let firstContact=null,elapsed=0;const originalHurt=hurt;hurt=source=>{if(source?.type==='crawler'&&firstContact===null)firstContact=elapsed;originalHurt(source);};
 const initial=enemies.map(e=>({hp:e.max,distance:Math.hypot(e.x-p.x,e.y-p.y)}));
 try{for(let i=0;i<1800&&state==='combat';i++){elapsed=i*.01;step(.01);}}finally{hurt=originalHurt;}
 return {initial,firstContact,kills,cash,alive:enemies.filter(e=>e.hp>0).length,closest:Math.min(...enemies.filter(e=>e.hp>0).map(e=>Math.hypot(e.x-p.x,e.y-p.y)))};
}
globalThis.spiderPressureAudit={health:STARTER_ENEMIES.crawler.health,interval:createWeaponModel('pistol_t1').interval,damage:createWeaponModel('pistol_t1').damage,bridgeKickDistance:210*.35*(1-Math.exp(-14*.15))/14,result:run()};
}`,sandbox);

module.exports=sandbox.spiderPressureAudit;
if(require.main===module)console.log(JSON.stringify(module.exports));

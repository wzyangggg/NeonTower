const fs=require('node:fs'),vm=require('node:vm');
const elements={};const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);for(const file of ['music','renderer','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss'])vm.runInContext(fs.readFileSync('dist/'+file+'.js','utf8'),sandbox);
vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
const originalRandom=Math.random;
const results=[];
for(const f of [1,2,3,13,23])for(const build of ['starter','upgraded'])for(let seed=1;seed<=5;seed++){
 let randomState=seed;Math.random=()=>((randomState=(Math.imul(randomState,1664525)+1013904223)>>>0)/4294967296);
 reset();floor=f;startWave();p.inv=999;turrets=[];const roster=[...enemies,...spawnQueue];check(Math.abs(roster.filter(e=>isMeleeEnemy(e)).length/roster.length-.6)<.001,'sixty percent contact roster '+f);check(enemies.some(e=>isMeleeEnemy(e))&&enemies.some(e=>!isMeleeEnemy(e)),'mixed opening '+f);
 if(build==='upgraded'){equipItem('weapon',createWeapon('tesla',5));equipItem('drone',createDrone('laser',5));}
 const snapshots=[];let emptyTime=0,elapsed=0,peak=0,rangedPeak=0,emptyRun=0,maxEmptyRun=0;
 while(state==='combat'&&elapsed<61){step(.01);elapsed+=.01;peak=Math.max(peak,enemies.length);rangedPeak=Math.max(rangedPeak,normalRangedCount());if(!enemies.length){emptyTime+=.01;emptyRun+=.01;maxEmptyRun=Math.max(maxEmptyRun,emptyRun);}else emptyRun=0;if([2,6,10].some(t=>Math.abs(elapsed-t)<.001))snapshots.push(enemies.length);}
 if(build==='starter'){check(state==='stageClear'&&(f<=3?elapsed>10:elapsed>=normalRoomDuration()*.9),'starter has a playable room duration '+f+'/'+seed);if(f<=3){check(rangedPeak<=3,'early ranged population stays capped '+f+'/'+seed);}check(maxEmptyRun<=.36,'no long empty wait '+f+'/'+seed);}else{check(timedRoom.remaining>3&&state==='stageClear','real upgraded damage clears early '+f+'/'+seed);check(stageSettlement.wait===0,'real clear resolves immediately');}check(kills>0,'real weapon damage exercised');
 results.push({floor:f,build,seed,elapsed:+elapsed.toFixed(2),kills,remaining:enemies.length,peak,rangedPeak,emptyTime:+emptyTime.toFixed(2),snapshots});
}
Math.random=originalRandom;
for(const f of [1,2,3,13,23])for(const build of ['starter','upgraded']){const runs=results.filter(r=>r.floor===f&&r.build===build);console.log('B'+f+' '+build+': '+Math.min(...runs.map(r=>r.elapsed))+'–'+Math.max(...runs.map(r=>r.elapsed))+' seconds; peak '+Math.min(...runs.map(r=>r.peak))+'–'+Math.max(...runs.map(r=>r.peak))+' total enemies; firing peak '+Math.max(...runs.map(r=>r.rangedPeak))+'; five seeds passed');}
}`,sandbox);

'use strict';

const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const dist=path.join(__dirname,'../dist');
const elements={};
const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true},{get:(target,key)=>target[key]||(()=>{})});
function element(){
 return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:844}),getContext:()=>gl};
}
const sandbox={
 console,Math:Object.create(Math),URLSearchParams,location:{search:''},performance:{now:()=>0},
 localStorage:{getItem:()=>null,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},
 window:{innerHeight:844,devicePixelRatio:1,addEventListener(){}},
 document:{querySelector:()=>element(),getElementById:id=>elements[id]??=element(),querySelectorAll:()=>[]}
};
vm.createContext(sandbox);
for(const name of ['hex-map','terrain-generators','music','renderer','game','virus','room-lab']){
 const source=fs.readFileSync(path.join(dist,name+'.js'),'utf8');
 vm.runInContext(name==='game'?require('../dist/hex-map.js').transform(source):source,sandbox,{filename:name+'.js'});
}
vm.runInContext(`
sound=false;
const dt=1/30,seeds=Array.from({length:5},(_,i)=>i+1);
const scenarios=['campaign','prototype'],builds=['weak','strong'];
const results=[];
for(const scenario of scenarios)for(const build of builds)for(const seed of seeds){
 let wallet=0,walletWithBase=0,buyAfter=null,buyAfterWithBase=null;
 for(let index=0;index<5;index++){
  let rng=seed;
  Math.random=()=>((rng=(Math.imul(rng,1664525)+1013904223)>>>0)/4294967296);
  location.search='?mapseed=pressure-'+seed;
  if(scenario==='prototype')RoomLab.start(index,build);
  else{
   activeDifficulty=1;reset();testMode=true;floor=index+1;
   weapon=createWeaponModel('pistol_t1');weapon.damage*=build==='weak'?.6:1.6;startWave();
  }
  // Preserve the real hurt cooldown. Extra HP lets both builds complete the comparison window.
  p.max=p.hp=100;p.shield=0;
  const home={x:p.x,y:p.y};
  step(1);
  let ticks=0,near=0,peak=0;
  while(state==='combat'&&ticks*dt<45){
   // Same open-loop route for both weapons. It cannot see or react to enemies.
   const phase=ticks*dt*1.55,tx=home.x+58*Math.cos(phase),ty=home.y+47*Math.sin(phase);
   const dx=tx-p.x,dy=ty-p.y,length=Math.max(10,Math.hypot(dx,dy));
   joy.x=dx/length;joy.y=dy/length;
   step(dt);ticks++;
   const projectiles=[...bullets,...missiles].filter(e=>e.life>0);
   const contacts=enemies.filter(e=>e.hp>0&&isMeleeEnemy(e));
   if([...projectiles,...contacts].some(e=>Math.hypot(e.x-p.x,e.y-p.y)<3*TILE))near++;
   peak=Math.max(peak,projectiles.length);
  }
  if(state!=='stageClear')throw Error('Room did not settle: '+scenario+'/'+build+'/'+seed+'/'+floor);
  const lab=scenario==='prototype'?RoomLab.stats():null;
  wallet+=cash;
  walletWithBase+=10+Math.min(10,Math.floor(cash/2));
  const price=shopPrice({key:'weapon',equipment:createWeaponModel('pistol_t1')});
  if(buyAfter===null&&wallet>=price)buyAfter=floor;
  if(buyAfterWithBase===null&&walletWithBase>=price)buyAfterWithBase=floor;
  results.push({scenario,build,seed,floor,near:lab?.near??100*near/ticks,peak:lab?.peak??peak,hits:100-p.hp,kills:stageResultStats().defeated,cash,wallet,walletWithBase,buyAfter,buyAfterWithBase,price});
 }
}
const median=values=>values.sort((a,b)=>a-b)[Math.floor(values.length/2)];
for(const scenario of scenarios){
 const rows=[];
 for(let floor=1;floor<=5;floor++)for(const build of builds){
  const group=results.filter(r=>r.scenario===scenario&&r.floor===floor&&r.build===build);
  const row={floor,build};
  for(const key of ['near','peak','hits','kills','cash','wallet','walletWithBase','price'])row[key]=Math.round(median(group.map(r=>r[key])));
  if(floor===5){
   const purchased=group.map(r=>r.buyAfter).filter(Boolean);
   row.canAffordByB05=purchased.length+'/'+group.length;
   row.firstAffordable=purchased.length?'B0'+median(purchased):'—';
   row.firstAffordableWithBase='B0'+median(group.map(r=>r.buyAfterWithBase));
   row.threeHitsOrMore=group.filter(r=>r.hits>=3).length+'/'+group.length;
  }
  rows.push(row);
 }
 console.log(scenario+' · '+seeds.length+' matched seeds per loadout and floor');
 console.table(rows);
}
`,sandbox);

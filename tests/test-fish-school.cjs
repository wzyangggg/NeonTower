const fs=require('node:fs'),vm=require('node:vm');
const elements={};const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{setProperty(){}},classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);for(const file of ['music','renderer','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss','fish-school'])vm.runInContext(fs.readFileSync('dist/'+file+'.js','utf8'),sandbox);

vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
// Deterministic initial headings/route keep this simulation reproducible.
let randomSeed=937;Math.random=()=>{randomSeed=(Math.imul(randomSeed,1664525)+1013904223)>>>0;return randomSeed/4294967296;};
startFishSchoolTest();check(enemies.length===1&&enemies[0].type==='fishSchool','one shared combat entity');
let e=enemies[0];check(fishSchoolMembers(e).length===13,'13 persistent boids');
const zero=JSON.stringify(e);updateFishSchool(e,0);check(JSON.stringify(e)===zero,'zero dt freezes');
const refs=e.members.slice(),initialDistances=refs.map(q=>Math.hypot(refs[0].x-q.x,refs[0].y-q.y));
let modes=new Set(),path=0,maxSpread=0,maxHeadingDifference=0,distanceChange=0,spacingSum=0,spacingSamples=0;
for(let i=0;i<3600;i++){
 if(i>120&&i%60===0){spacingSum+=e.members.reduce((sum,q)=>sum+Math.min(...e.members.filter(other=>other!==q).map(other=>Math.hypot(q.x-other.x,q.y-other.y))),0)/e.members.length;spacingSamples++;}
 const x=e.x,y=e.y,angles=e.members.map(q=>q.heading);updateFishSchool(e,1/60);path+=Math.hypot(e.x-x,e.y-y);modes.add(e.mode);
 const turns=e.members.map((q,j)=>q.heading-angles[j]);maxHeadingDifference=Math.max(maxHeadingDifference,Math.max(...turns)-Math.min(...turns));
 distanceChange=Math.max(distanceChange,...refs.map((q,j)=>Math.abs(Math.hypot(refs[0].x-q.x,refs[0].y-q.y)-initialDistances[j])));
 for(const q of e.members){check(q.x-q.r>A.x&&q.x+q.r<A.x+A.w&&q.y-q.r>A.y&&q.y+q.r<A.y+A.h,'all fish remain inside arena');check(Number.isFinite(q.heading+q.vx+q.vy),'finite velocities');maxSpread=Math.max(maxSpread,Math.hypot(q.x-e.x,q.y-e.y));check(!('targetX' in q),'only group chooses destination');}
}
check(spacingSum/spacingSamples>36,'looser school keeps useful nearest-neighbour clearance');
check(path>1800&&modes.size===2,'patrol travels and occasionally approaches');check(maxSpread<200,'boids remain a cohesive school');
check(maxHeadingDifference>.015,'fish turn at different rates, not a rotated formation');check(distanceChange>12,'relative positions change organically');check(refs.every((q,i)=>q===e.members[i]),'persistent boid state');
// Forces use neighbours from the same snapshot, independent of iteration order.
const forces=fishSchoolForces(e),byIndex=new Map(e.members.map((q,i)=>[q.index,forces[i]]));e.members.reverse();const reversed=fishSchoolForces(e);e.members.forEach((q,i)=>{const f=byIndex.get(q.index);check(Math.hypot(f.ax-reversed[i].ax,f.ay-reversed[i].ay)<1e-8,'snapshot/order independent forces');});e.members.reverse();
function sampleFish(index,x,y,vx=60,vy=0){return {index,x,y,vx,vy,heading:Math.atan2(vy,vx),phase:0,r:12,height:30,turn:0};}
const test={x:325,y:300,targetX:600,targetY:300,mode:'roam',t:0};
test.members=[sampleFish(0,320,300),sampleFish(1,330,300)];let f=fishSchoolForces(test);check(f[0].ax<-100&&f[1].ax>100,'separation pushes close neighbours apart');
test.members=[sampleFish(0,295,300),sampleFish(1,355,300,60,50)];f=fishSchoolForces(test);test.members[1].vy=-50;const opposite=fishSchoolForces(test);check(f[0].ay>opposite[0].ay+100,'alignment responds to neighbour velocity');
test.members=[sampleFish(0,285,300),sampleFish(1,365,300)];f=fishSchoolForces(test);check(f[0].ax>f[1].ax+40,'cohesion gathers spaced neighbours');
test.members[1].x=test.members[0].x;f=fishSchoolForces(test);check(f.every(q=>Number.isFinite(q.ax+q.ay)),'exact overlap has finite opposite repulsion');
// A disturbed fish should rejoin without teleporting into a fixed slot.
const detached=e.members[0];detached.x=Math.min(A.x+A.w-45,e.x+180);detached.y=e.y;const far=Math.hypot(detached.x-e.x,detached.y-e.y);for(let i=0;i<240;i++)updateFishSchool(e,1/60);check(Math.hypot(detached.x-e.x,detached.y-e.y)<far*.8,'straggler rejoins via forces');
p.x=e.x<325?A.x+A.w-105:A.x+105;p.y=300;fishSchoolDestination(e,true);const tx=e.targetX,ty=e.targetY;p.x+=40;updateFishSchool(e,.1);check(e.targetX===tx&&e.targetY===ty,'approach uses shared committed destination');
const q=e.members[4],shot={x:q.x+20,y:q.y,lastX:q.x-20,lastY:q.y,vx:400,vy:0,hitRadius:1};check(shotHits(shot,e,.1),'shot hits actual moving fish');
const hole={x:A.x+2,y:A.y+2,lastX:A.x+1,lastY:A.y+2,vx:10,vy:0,hitRadius:1};check(!shotHits(hole,e,.1),'empty space is not a solid swarm disc');
const before=JSON.stringify(e);paused=true;step(.1);check(JSON.stringify(e)===before,'pause freezes whole simulation');paused=false;e.terrainStun=1;const stopped=e.members.map(q=>[q.x,q.y,q.heading]);step(.1);check(e.members.every((q,i)=>q.x===stopped[i][0]&&q.y===stopped[i][1]&&q.heading===stopped[i][2]),'stun freezes all boids');e.terrainStun=0;
const slow=JSON.parse(JSON.stringify(e)),normal=JSON.parse(JSON.stringify(e));slow.drinkSlowUntil=time+10;updateFishSchool(slow,.2);updateFishSchool(normal,.15);check(slow.members.every((q,i)=>Math.hypot(q.x-normal.members[i].x,q.y-normal.members[i].y)<.01),'slow status scales boid time');
let caches=new Set(),builds=0;const oldRenderer={...renderer};Object.assign(renderer,{residentMesh(key,build){if(!caches.has(key)){caches.add(key);builds++;build();}},box(){},disc(){},quad(){},emissiveBox(){}});
drawFishSchool(e);const initial=builds;for(let i=0;i<10;i++){e.t+=.1;drawFishSchool(e);}check(builds===initial,'model cache reused across boids and frames');Object.assign(renderer,oldRenderer);
fishSchoolObserve=false;e.hp=0;fishSchoolTestHud();check(state==='menu','shared death ends test');startFishSchoolTest();check(enemies.length===1,'restart has one fresh school');reset();check(!fishSchoolTest,'normal reset clears lab');
console.log('Fish school boids: separation/alignment/cohesion, snapshot forces, nonuniform turns, changing spacing, straggler recovery, shared patrol/approach, bounds, actual hits, pause/stun/slow, resident meshes and lifecycle passed', {path,maxSpread,maxHeadingDifference,distanceChange,meanNearest:spacingSum/spacingSamples});
}`,sandbox);

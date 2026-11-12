for(const hex of [false,true]){
const fs=require('node:fs'),vm=require('node:vm');
const elements={};const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const sandbox={HexMap:require('../dist/hex-map.js'),console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);for(const file of ['music','renderer','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss'])vm.runInContext(file==='game'&&hex?require('../dist/hex-map.js').transform(fs.readFileSync('dist/'+file+'.js','utf8')):fs.readFileSync('dist/'+file+'.js','utf8'),sandbox);
vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
// Isolated coverage of the temporarily disabled ground enemy implementation.
GROUND_ENEMIES.enabled=true;
const built=t=>!!(t?.trap||t?.saw||t?.flywheel);
function setup(){reset();floor=9;startWave();enemies=[];enemyTransports=[];spawnQueue=[{type:'eye',side:0}];state='combat';timedRoom={duration:60,remaining:60,nextWaveAt:999};shootTimer=999;p.inv=999;bullets=[];}
function builder(){spawn({type:'builder',side:0});const e=enemies.at(-1);e.fire=999;return e;}
function hover(e){updateBuilder(e,.01);const at=builderTileCenter(e.buildTarget);e.x=at.x;e.y=at.y-ADDED_ENEMIES.builder.workRange;return e.buildTarget;}
setup();for(const f of [1,3,5,6]){floor=f;check(!buildNormalRoster().some(e=>e.type==='builder'),'unlock gate');}floor=7;check(buildNormalRoster().some(e=>e.type==='builder'),'campaign spawn');
check(ADDED_ENEMIES.builder.buildTime===5,'required five second duration');
const e=builder();check(e.hp===rangedEnemyHealth('spitter')*6&&e.max===e.hp,'sixfold normal health');check(!e.transport&&!isGroundEnemy(e)&&combatTargets().includes(e),'self propelled and attackable');
const oldX=e.x,oldY=e.y;step(.1);check(e.buildTarget&&Math.hypot(e.x-oldX,e.y-oldY)>0,'flies toward work cell');check(!e.buildProgress&&!bullets.length,'no construction while flying or bullets');
const target=e.buildTarget,at=builderTileCenter(target),nearest=Math.min(...tiles.filter(builderTileAvailable).map(t=>{const q=builderTileCenter(t);return Math.hypot(q.x-p.x,q.y-p.y)}));check(Math.abs(Math.hypot(at.x-p.x,at.y-p.y)-nearest)<1e-6,'nearest player cell');
e.x=at.x;e.y=at.y-ADDED_ENEMIES.builder.workRange;step(4);check(e.warn&&Math.abs(e.buildProgress-4)<1e-6&&!built(target),'sustained five second beam');
paused=true;step(2);check(e.buildProgress===4,'pause freezes progress');paused=false;e.terrainStun=.5;step(.2);check(e.buildProgress===4,'stun freezes work');e.terrainStun=0;
const hp=p.hp;step(.99);check(!built(target)&&p.hp===hp,'beam itself does not damage player');step(.01);check(!!built(target)&&e.buildTarget===null&&e.buildProgress===0,'conversion after full duration');
check(e.buildCooldown===3,'cooldown after construction');const resting=addedEnemyPose(e,0,0,0);const px=p.x,py=p.y;p.x+=120;p.y-=200;check(JSON.stringify(resting)===JSON.stringify(addedEnemyPose(e,0,0,0)),'completed builder retains work facing');p.x=px;p.y=py;step(2.9);check(e.buildTarget!==target&&!e.buildProgress&&!e.warn,'select next cell during cooldown without construction');step(.1);step(.01);step(.01);check(e.buildTarget&&e.buildTarget!==target,'next construction chooses new tile');
setup();const ranged=builder(),rangeCell=hover(ranged),rangeAt=builderTileCenter(rangeCell);
check(ADDED_ENEMIES.builder.workRange===144,'construction range doubled');
ranged.x=rangeAt.x;ranged.y=rangeAt.y-145;updateBuilder(ranged,.01);check(!ranged.buildProgress&&!ranged.warn,'cannot start beyond 144');
ranged.y=rangeAt.y-144;updateBuilder(ranged,1);check(ranged.warn&&ranged.buildProgress===1,'start at 144');
applyImpactKnockback(ranged,{vx:0,vy:-500,knockback:createWeaponModel('pistol_t1').knockback});for(let i=0;i<15;i++){updateImpactKnockbacks(.01);updateBuilder(ranged,.01);}
check(Math.hypot(ranged.x-rangeAt.x,ranged.y-rangeAt.y)>144&&ranged.warn&&ranged.buildProgress>1.14,'pistol recoil preserves construction beyond start range');
ranged.y=rangeAt.y-216;const heldProgress=ranged.buildProgress;updateBuilder(ranged,.1);check(ranged.warn&&ranged.buildProgress>heldProgress,'holds at 216');
ranged.y=rangeAt.y-217;updateBuilder(ranged,.01);check(!ranged.warn&&ranged.buildProgress===0&&ranged.buildTarget===rangeCell,'beyond 216 interrupts and resets progress');
ranged.y=rangeAt.y-180;updateBuilder(ranged,.01);check(!ranged.warn&&!ranged.buildProgress,'must return to 144 to restart');
ranged.y=rangeAt.y-144;updateBuilder(ranged,.1);check(ranged.warn&&ranged.buildProgress===.1,'restarts at normal range');
setup();const first=builder(),second=builder();hover(first);hover(second);check(first.buildTarget!==second.buildTarget,'builders reserve distinct cells');
const cancelled=first.buildTarget;updateBuilder(first,4);first.hp=0;updateBuilder(first,20);check(!built(cancelled),'death cancels partial conversion');second.buildTarget=null;updateBuilder(second,.01);check(second.buildTarget===cancelled,'dead builder releases reservation');
setup();const killed=builder(),safe=hover(killed);step(2);killed.hp=1;shots=[{x:killed.x,y:killed.y,vx:0,vy:0,life:1,damage:100,pierce:1,radius:25,critChance:0}];step(.01);check(killed.hp<=0,'actual player shot kills builder');for(let i=0;i<10;i++)step(.1);check(!built(safe),'killed builder never completes work');
setup();const changed=builder(),cell=hover(changed);updateBuilder(changed,2);cell.medical=true;updateBuilder(changed,.1);check(!built(cell)&&changed.buildTarget!==cell&&changed.buildProgress<=.1,'changed terrain cancels and resets');
const removed=changed.buildTarget;tiles=tiles.filter(t=>t!==removed);updateBuilder(changed,.1);check(changed.buildTarget!==removed&&changed.buildProgress<=.1,'removed terrain reselected');
for(const key of ['medical','shieldTile','cashTile','shockTile','coverTile','trap','saw','flywheel']){const t={x:8,y:8,[key]:true};tiles.push(t);check(!builderTileAvailable(t),'protect '+key);tiles.pop();}
setup();const rendered=builder(),work=hover(rendered);updateBuilder(rendered,3);draw();const mesh=[...renderer.residentMeshes].find(([k])=>k.startsWith('enemy:builder:'))[1],data=mesh.data;check(data.every(Number.isFinite),'finite body');for(let i=0;i<10;i++){time+=.1;draw();}check(mesh.data===data,'resident geometry reused');check(renderer.residentMeshes.has('builder:work-hex'),'work indicator rendered');
// Rendered fill must grow left-to-right using the same five second clock.
setup();const bar=builder(),barCell=hover(bar),barAt=builderTileCenter(barCell);let fillData;
for(const [dt,fraction] of [[1,.2],[1.5,.5],[2.49,.998]]){
 updateBuilder(bar,dt);renderer.begin();drawBuilderWork(bar,monsterPose(bar.x-325,0,(bar.y-300)*1.06));
 const fill=renderer.residentMeshes.get('builder:work-bar-fill'),back=renderer.residentMeshes.get('builder:work-bar-back');
 check(fill.count===1&&back.count===1,'one active progress bar');
 check(Math.abs(fill.instances[0]-42*fraction)<1e-5,'fill tracks elapsed seconds');
 check(Math.abs(fill.instances[3]-(barAt.x-325-21+21*fraction))<1e-5,'left edge stays anchored');
 check(fill.instances[7]===6.5&&back.instances[7]===5,'bar hugs floor with fill above backing');
 check(fill.data[2]!==back.data[2],'fill depth separated from backing');
 if(fillData)check(fill.data===fillData,'progress reuses resident mesh');fillData=fill.data;
 check(!built(barCell),'no early conversion');
}
updateBuilder(bar,.01);renderer.begin();drawBuilderWork(bar,monsterPose(0,0,0));check(built(barCell)&&renderer.residentMeshes.get('builder:work-bar-fill').count===0,'complete at five seconds and hide bar');
setup();const none=builder();tiles=[];updateBuilder(none,20);check(!none.buildTarget&&!none.buildProgress,'no eligible terrain waits');const facing=addedEnemyPose(none,0,0,0);p.x+=100;p.y+=200;check(JSON.stringify(facing)===JSON.stringify(addedEnemyPose(none,0,0,0)),'idle builder does not aim at player');
// A sealed construction reveals an independently rolled terrain hazard only on completion.
for(const [index,kind]of builderTrapPool().entries()){
 setup();const robot=builder(),site=hover(robot),at=builderTileCenter(site);robot.buildProgress=0;
 const random=Math.random;let rolls=0;Math.random=()=>{rolls++;return (index+.1)/builderTrapPool().length;};
 try{updateBuilder(robot,4.99);check(!built(site)&&rolls===0,'no trap or random reveal before completion');updateBuilder(robot,.01);}finally{Math.random=random;}
 check(kind==='trap'?!!site.trap:kind==='flywheel'?!!site.flywheel:site.saw&&!!site.orbitSaw===(kind==='orbitSaw'),'blind construction produces '+kind);
 check([!!site.trap,!!site.saw,!!site.flywheel].filter(Boolean).length===1,'one hazard per blind box');
 if(site.flywheel)check(site.flywheel.x===at.x&&site.flywheel.y===at.y,'flywheel starts on its real square/hex cell');
 check(!builderTileAvailable(site)&&robot.buildCooldown===3&&!robot.buildTarget,'completed blind box cannot be rerolled on the same cell');
 const snapshot=JSON.stringify(site);check(buildRandomTrap(site)===null&&JSON.stringify(site)===snapshot,'existing hazards are protected');
 renderer.begin();draw();check(renderer.data.subarray(0,renderer.count).every(Number.isFinite),'blind hazard finite geometry '+kind);
}
// The replacement encounter is finite, untimed and contains only three builders.
reset();floor=4;startWave();shootTimer=999;p.inv=999;
check(builderRoom&&state==='combat'&&!timedRoom&&!survivalRemaining,'blockade replaced by untimed builder room');
check(enemies.length===3&&enemies.every(e=>e.type==='builder'&&!e.transport),'three builders without ranged helpers');
check(!spawnQueue.length&&!enemyTransports.length&&!turrets.some(t=>t.temporary),'no blockade turrets or queued enemies');
const roomBest=best;for(let i=0;i<220;i++)step(.1);
check(enemies.length===3&&enemies.every(e=>e.type==='builder')&&!chaserSpawned,'no extra normal or chaser reinforcements');
check(tiles.some(built),'builders actually convert player terrain during room');check(bullets.length===0,'no ranged support bullets');
paused=true;const workBefore=enemies.map(e=>e.buildProgress||0).join();step(2);check(enemies.map(e=>e.buildProgress||0).join()===workBefore,'room pause freezes work');paused=false;
for(let i=0;i<500;i++)step(.1);check(state==='combat'&&builderRoom,'no survival timeout');
for(const e of enemies)e.hp=0;step(.01);check(state==='stageClear','killing all builders clears room');
startBuilderTest();check(testMode&&builderRoom&&floor===4&&enemies.length===3&&best===roomBest,'direct test entry without record update');
reset();check(!builderRoom&&!testMode,'restart clears test encounter');floor=1;startWave();check(!builderRoom&&!!timedRoom,'normal rooms restored');
console.log('Builder: unlock, 6x health, flight, player-near selection, five second conversion, pause/stun, player kill interruption, protected/removed cells, reservations, cooldown and resident rendering passed');
}`,sandbox);
}


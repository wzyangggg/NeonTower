for(const hex of [false,true]){
const fs=require('node:fs'),vm=require('node:vm');
const elements={};const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const sandbox={HexMap:require('../dist/hex-map.js'),console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);for(const file of ['music','renderer','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss'])vm.runInContext(file==='game'&&hex?require('../dist/hex-map.js').transform(fs.readFileSync('dist/'+file+'.js','utf8')):fs.readFileSync('dist/'+file+'.js','utf8'),sandbox);
vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
function setup(){reset();floor=9;startWave();enemies=[];enemyTransports=[];spawnQueue=[{type:'eye',side:0}];state='combat';timedRoom={duration:60,remaining:60,nextWaveAt:999};shootTimer=999;p.inv=999;bullets=[];}
function builder(){spawn({type:'builder',side:0});const e=enemies.at(-1);e.fire=999;return e;}
function hover(e){updateBuilder(e,.01);const at=builderTileCenter(e.buildTarget);e.x=at.x;e.y=at.y-ADDED_ENEMIES.builder.workRange;return e.buildTarget;}
setup();for(const f of [1,3,5,6]){floor=f;check(!buildNormalRoster().some(e=>e.type==='builder'),'unlock gate');}floor=7;check(buildNormalRoster().some(e=>e.type==='builder'),'campaign spawn');
const e=builder();check(e.hp===normalEnemyHealth()*3&&e.max===e.hp,'triple health');check(!e.transport&&!isGroundEnemy(e)&&combatTargets().includes(e),'self propelled and attackable');
const oldX=e.x,oldY=e.y;step(.1);check(e.buildTarget&&Math.hypot(e.x-oldX,e.y-oldY)>0,'flies toward work cell');check(!e.buildProgress&&!bullets.length,'no construction while flying or bullets');
const target=e.buildTarget,at=builderTileCenter(target),nearest=Math.min(...tiles.filter(builderTileAvailable).map(t=>{const q=builderTileCenter(t);return Math.hypot(q.x-p.x,q.y-p.y)}));check(Math.abs(Math.hypot(at.x-p.x,at.y-p.y)-nearest)<1e-6,'nearest player cell');
e.x=at.x;e.y=at.y-ADDED_ENEMIES.builder.workRange;step(4);check(e.warn&&Math.abs(e.buildProgress-4)<1e-6&&!target.trap,'sustained eight second beam');
paused=true;step(2);check(e.buildProgress===4,'pause freezes progress');paused=false;e.terrainStun=.5;step(.2);check(e.buildProgress===4,'stun freezes work');e.terrainStun=0;
const hp=p.hp;step(3.9);check(!target.trap&&p.hp===hp,'beam itself does not damage player');step(.1);check(!!target.trap&&e.buildTarget===null&&e.buildProgress===0,'conversion after full duration');
check(e.buildCooldown===3,'cooldown after construction');step(2.9);check(!e.buildTarget,'cannot instantly convert another cell');step(.1);step(.01);step(.01);check(e.buildTarget&&e.buildTarget!==target,'next construction chooses new tile');
setup();const first=builder(),second=builder();hover(first);hover(second);check(first.buildTarget!==second.buildTarget,'builders reserve distinct cells');
const cancelled=first.buildTarget;updateBuilder(first,4);first.hp=0;updateBuilder(first,20);check(!cancelled.trap,'death cancels partial conversion');second.buildTarget=null;updateBuilder(second,.01);check(second.buildTarget===cancelled,'dead builder releases reservation');
setup();const killed=builder(),safe=hover(killed);step(2);killed.hp=1;shots=[{x:killed.x,y:killed.y,vx:0,vy:0,life:1,damage:100,pierce:1,radius:25,critChance:0}];step(.01);check(killed.hp<=0,'actual player shot kills builder');for(let i=0;i<10;i++)step(.1);check(!safe.trap,'killed builder never completes work');
setup();const changed=builder(),cell=hover(changed);updateBuilder(changed,7);cell.medical=true;updateBuilder(changed,.1);check(!cell.trap&&changed.buildTarget!==cell&&changed.buildProgress<=.1,'changed terrain cancels and resets');
const removed=changed.buildTarget;tiles=tiles.filter(t=>t!==removed);updateBuilder(changed,.1);check(changed.buildTarget!==removed&&changed.buildProgress<=.1,'removed terrain reselected');
for(const key of ['medical','shieldTile','cashTile','shockTile','coverTile','trap','saw','flywheel']){const t={x:8,y:8,[key]:true};tiles.push(t);check(!builderTileAvailable(t),'protect '+key);tiles.pop();}
setup();const rendered=builder(),work=hover(rendered);updateBuilder(rendered,3);draw();const mesh=[...renderer.residentMeshes].find(([k])=>k.startsWith('enemy:builder:'))[1],data=mesh.data;check(data.every(Number.isFinite),'finite body');for(let i=0;i<10;i++){time+=.1;draw();}check(mesh.data===data,'resident geometry reused');check(renderer.residentMeshes.has('builder:work-ring'),'work indicator rendered');
setup();const none=builder();tiles=[];updateBuilder(none,20);check(!none.buildTarget&&!none.buildProgress,'no eligible terrain waits');
console.log('Builder: unlock, 3x health, flight, player-near selection, eight second conversion, pause/stun, player kill interruption, protected/removed cells, reservations, cooldown and resident rendering passed');
}`,sandbox);
}


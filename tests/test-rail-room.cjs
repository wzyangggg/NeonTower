const fs=require('node:fs'),vm=require('node:vm');
const elements={};const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);if(process.argv.includes('--hex'))vm.runInContext(fs.readFileSync('dist/hex-map.js','utf8')+'\n'+fs.readFileSync('dist/terrain-generators.js','utf8'),sandbox);for(const file of ['music','renderer','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss']){let code=fs.readFileSync('dist/'+file+'.js','utf8');if(file==='game'&&process.argv.includes('--hex'))code=require('../dist/hex-map.js').transform(code);vm.runInContext(code,sandbox);}
vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
function setup(f=10){reset();floor=f;startWave();check(!isRailFloor()&&!railRoom,'fire net disabled in campaign');startRailRoom();p.inv=999;}
for(const f of [10,21,32]){
 setup(f);const room=railRoom,count=tiles.length;
 check(room&&state==='survival'&&!timedRoom&&!enemies.length,'rail survival floor '+f);
 check(room.tracks.length===6&&turrets.filter(t=>t.rail).length===6,'six tracks / six turrets');
 check(room.cells.every(c=>!hasTile(c.x,c.y)),'temporary rails outside owned floor');
 check(turrets.every(t=>t.temporary&&t.invulnerable&&!isAttackable(t))&&permanentTrapCount()===0&&!eraseNegative(),'turrets are temporary invulnerable traps');
 if(typeof HexMap!=='undefined'){
  const angles=new Set(room.tracks.map(t=>Math.round((Math.atan2(t.to.y-t.from.y,t.to.x-t.from.x)*180/Math.PI+360)%180)));
  check(angles.size===3&&[0,60,120].every(a=>angles.has(a)),'three hex directions');
 }
 const x=turrets[0].x,y=turrets[0].y;step(.2);
 const drawCell=drawTemporaryHexCell,built=[];try{drawTemporaryHexCell=(cell,u)=>built.push(u);drawRailRoom();}finally{drawTemporaryHexCell=drawCell;}check(built.length===room.cells.length&&built.every(u=>u===1),'every rail bridge brick finishes within 0.2 seconds');
 step(.3);check(turrets[0].x===x&&turrets[0].y===y&&!bullets.length,'turret preparation time remains after track construction');
 const age=room.age,left=survivalRemaining;paused=true;step(99);check(room.age===age&&survivalRemaining===left,'pause freezes buildup');paused=false;
 step(1.2);check(turrets[0].x!==x||turrets[0].y!==y,'moves after deployment');
 const t=turrets[0];let reverse=false;for(let i=0;i<160;i++){const dir=t.dir;updateRailTurret(t,.03);check(t.slide>=0&&t.slide<=1,'patrol stays on track');reverse ||= dir!==t.dir;}check(reverse,'patrol reverses');
 bullets=[];t.cool=0;updateRailTurret(t,.01);check(bullets.length===1,'single straight shot');const b=bullets[0],aim=Math.atan2(p.y-t.y,p.x-t.x);check(Math.abs(b.vx-Math.cos(aim)*160)<1e-7&&Math.abs(b.vy-Math.sin(aim)*160)<1e-7,'aimed at player');
 draw();check(tiles.length===count&&renderer.data.slice(0,renderer.count).every(Number.isFinite),'finite rendering and no owned floor growth');
 const pos={x:t.x,y:t.y};paused=true;step(20);check(t.x===pos.x&&t.y===pos.y,'pause freezes patrol');paused=false;
 step(100);check(state==='stageClear'&&!railRoom&&!turrets.some(t=>t.rail)&&!bullets.length,'deadline cleans rails/turrets/shots');check(cash===20+f*2,'survival reward once');
}
setup();beginDescent();check(!railRoom&&!turrets.some(t=>t.rail),'descent cleanup');setup();reset();check(!railRoom&&!turrets.length,'reset cleanup');
console.log('Patrol fire net: six straight tracks, six invulnerable temporary turrets, hex angles, deployment/pause, bounded reflected patrol, aimed straight shots, floor exclusion, rewards and cleanup passed.');
}`,sandbox);

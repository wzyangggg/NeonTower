const fs=require('node:fs'),vm=require('node:vm');
const elements={};const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);if(process.argv.includes('--hex'))vm.runInContext(fs.readFileSync('dist/hex-map.js','utf8')+'\n'+fs.readFileSync('dist/terrain-generators.js','utf8'),sandbox);for(const file of ['music','renderer','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss']){let code=fs.readFileSync('dist/'+file+'.js','utf8');if(file==='game'&&process.argv.includes('--hex'))code=require('../dist/hex-map.js').transform(code);vm.runInContext(code,sandbox);}
vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
function setup(f=6){reset();floor=f;startWave({previewSawRoom:true});p.inv=999;}
for(const f of [6,17,28]){
 reset();floor=f;startWave();
 check(timedRoom&&!sawRoom&&!tiles.some(t=>t.flywheel?.diagonal)&&spawnQueue.length>0,'ordinary enemy floor '+f);
 setup(f);check(sawRoom&&state==='combat','saw preview '+f);
 const center=tiles.find(t=>t.x===0&&t.y===0),at=typeof HexMap==='undefined'?{x:325,y:300}:{x:325+HexMap.x(0,0),y:300};
 check(canWalkAt(p.x,p.y,7)&&tiles.some(t=>{const c=bridgeCellCenter(t);return Math.hypot(c.x-p.x,c.y-p.y)<.001;}),'safe tile-center spawn '+f);if(center)check(p.x===at.x&&p.y===at.y,'central tile preferred when present '+f);
 check(sawRoom.sources.length===Math.ceil(tiles.length/10)&&!enemies.length&&!spawnQueue.length,'sources scale with owned land and no enemies');
 const blade=sawRoom.sources[0].tile.flywheel,x=blade.x,y=blade.y;
 check(sawRoom.introLeft===1&&$('survival-label').textContent==='存活15秒！','central survival prompt');step(.99);check(sawRoom.remaining===15&&blade.x===x&&blade.warning===1.5,'intro freezes saw clock and warnings');step(.01);check(sawRoom.introLeft<1e-8,'one second intro');
 check(sawRoom.duration===drinkRoomDuration(15)&&Math.abs(Math.hypot(blade.vx,blade.vy)-240)<1e-9,'short room and fast blade');
 step(.5);check(blade.x===x&&blade.y===y&&p.hp===p.max,'warning is stationary and harmless');
 const left=sawRoom.remaining;paused=true;step(100);check(sawRoom.remaining===left&&blade.x===x,'pause freezes clock and blades');paused=false;
 step(1.01);check(blade.x!==x&&Math.abs(Math.abs(blade.vx)-Math.abs(blade.vy))<1e-9,'diagonal release');
 let bounced=false;for(let i=0;i<800;i++){const vx=blade.vx,vy=blade.vy;updateDiagonalSaw(blade,.02);check(onFloor(blade.x,blade.y,blade.r),'stays inside actual floor outline');check(Math.abs(Math.abs(blade.vx)-Math.abs(blade.vy))<1e-9,'45 degrees preserved');bounced ||= vx!==blade.vx||vy!==blade.vy;}
 check(bounced,'blade reflects');
 enemies=[];spawnQueue=[];step(.01);check(state==='combat','empty enemy list cannot end trap room');
 draw();check(renderer.data.slice(0,renderer.count).every(Number.isFinite),'finite rendering');
 step(100);check(state==='stageClear'&&!sawRoom&&!tiles.some(t=>t.flywheel?.diagonal),'deadline cleans temporary traps');
 check($('result-title').textContent==='成功存活'&&$('result-kill-row').style.display==='none','trap room survival result without kill progress');
 check(cash===20+f*2,'survival reward paid once');step(.1);check(cash===20+f*2,'no duplicate reward');
}
for(const count of [9,10,11,20,21,60]){
 reset();tiles=Array.from({length:count},(_,i)=>({x:i%10-5,y:Math.floor(i/10)-3}));startSawRoom();
 check(sawRoom.sources.length===Math.ceil(count/10),'land count boundary '+count);
}
setup();const w=sawRoom.sources[0].tile.flywheel;w.warning=0;w.x=p.x;w.y=p.y;p.inv=0;const hp=p.hp;updateDiagonalSaw(w,.001);check(p.hp===hp-1,'contact hurts player');
setup();const source=sawRoom.sources[0].tile,sourceCount=sawRoom.sources.length;delete source.flywheel;step(.1);check(tiles.filter(t=>t.flywheel?.diagonal).length===sourceCount-1,'repair removal persists');
beginDescent();check(!sawRoom&&!tiles.some(t=>t.flywheel?.diagonal),'descent cleanup');
setup();reset();check(!sawRoom,'restart cleanup');
reset();testMode=true;const origin={x:p.x,y:p.y};p.x+=8;p.y+=5;const end={x:p.x,y:p.y};reward();check(p.x===origin.x&&p.y===origin.y,'shop entry recenters immediately');p.x+=6;p.y+=4;const arranged={x:p.x,y:p.y};leaveShop();check(p.x===arranged.x&&p.y===arranged.y,'leaving shop preserves position');startWave();check(p.x===arranged.x&&p.y===arranged.y,'combat start preserves position');
console.log('Central spawns and saw corridor: three chapter floors, warning, 45-degree motion, actual-outline bounce, contact, repair removal, pause, deadline, reward, render and cleanup passed.');
}`,sandbox);

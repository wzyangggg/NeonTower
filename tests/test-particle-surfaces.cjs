const fs=require('node:fs'),vm=require('node:vm');
for(const hex of [false,true]){
 const elements={},gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
 const el=()=>({style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl});
 const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
 vm.createContext(sandbox);if(hex)vm.runInContext(fs.readFileSync('dist/hex-map.js','utf8')+'\n'+fs.readFileSync('dist/terrain-generators.js','utf8'),sandbox);
 for(const file of ['music','renderer','game']){let source=fs.readFileSync('dist/'+file+'.js','utf8');if(file==='game'&&hex)source=require('../dist/hex-map.js').transform(source);vm.runInContext(source,sandbox);}
 vm.runInContext(`{
 function check(v,m){if(!v)throw Error(m)}
 reset();sound=false;state='combat';tiles=[{x:0,y:0}];particles=[];let landingSounds=0;playCasingLanding=()=>landingSounds++;
 function make(kind,x=325,y=300){return {x,y,vx:0,vy:0,height:kind==='casing'?2.1:4.1,vz:-30,life:3,age:0,angle:0,spin:1,bounces:0,size:7,c:'#ffaa55',flutter:0,[kind]:true};}
 for(const kind of ['casing','chunk']){
  const on=make(kind),off=make(kind,325+TILE*3,300);particles=[on,off];updateParticles(.05);
  check(on.vz>=0&&off.vz<0,'only unlocked ground reflects '+kind);for(let i=0;i<50;i++)updateParticles(.01);
  check(off.height<0&&on.height>0,'off-map continues falling '+kind);if(kind==='casing')check(on.bounces>0&&off.bounces===0&&landingSounds===1,'landing audio only actual first contact');
 }
 const edge=make('casing');particles=[edge];updateParticles(.05);const bounces=edge.bounces,sounds=landingSounds;tiles=[];for(let i=0;i<30;i++)updateParticles(.01);check(edge.height<0&&edge.bounces===bounces&&landingSounds===sounds,'removing supporting ground releases particle without phantom contact');
 const under=make('casing');under.height=-12;under.vz=-20;tiles=[{x:0,y:0}];particles=[under];updateParticles(.1);check(under.height<-12&&under.bounces===0,'new ground cannot pull a particle up from below');
 const cover={x:0,y:0,coverTile:true,coverHp:4};tiles=[cover];check(particleSurfaceHeight(325,300)===43.5,'barricade actual top');
 const top=make('casing');top.height=46;particles=[top];updateParticles(.1);check(top.height===45.5&&top.bounces===1,'land on barricade top');
 const beneath=make('casing');beneath.height=10;particles=[beneath];for(let i=0;i<10;i++)updateParticles(.02);check(beneath.height>=2&&beneath.height<10,'below cover top stays on floor, no upward teleport');
 cover.coverHp=0;check(particleSurfaceHeight(325,300)===0,'broken barricade leaves actual floor');
 terrainChange={hidden:new Set([cover]),age:TERRAIN_FLASH_STEP};check(particleSurfaceHeight(325,300)===null,'hidden removed terrain supplies no surface');terrainChange=null;
 tiles=[{x:2,y:1}];const center=builderTileCenter(tiles[0]);check(particleSurfaceHeight(center.x,center.y)===0&&particleSurfaceHeight(center.x+TILE*2,center.y)===null,'real odd-row cell and empty adjacent space');
 particles=[];burst(325+TILE*3,300,'#ffff00',3);for(let i=0;i<20;i++)updateParticles(.01);check(particles.length===3&&particles.every(q=>q.height<0),'ordinary burst debris also falls off the map');
 renderer.begin();drawCoolingChunk({...make('chunk'),height:-30});check(renderer.residentSnapshot().some((v,i)=>i%9===1&&v<-25),'fragment drawing preserves negative height');
 renderer.begin();drawHitSpark({...make('hitSpark'),height:-30,maxLife:3,length:7});check(renderer.residentSnapshot().some((v,i)=>i%9===1&&v<-25),'hit sparks do not render on a fake plane');
 tiles=[];const fragment={x:0,y:2,z:0,vx:0,vy:-30,vz:0,size:7,angle:0,spin:0,color:'#334455'};
 bossDeath={age:1,shattered:true,nextBlast:999,bodies:[],blasts:[],fragments:[fragment]};updateBossDeath(.1);check(fragment.y<0&&fragment.vy<0,'boss death fragments fall through absent ground');renderer.begin();drawBossDeath();check(renderer.residentMeshes.get('boss-death:chunk:#334455').instances[7]<0,'boss debris rendering keeps below-floor positions');bossDeath=null;
 particles=[{...make('chunk'),height:-901}];updateParticles(0);check(!particles.length,'far-below particles clean up');
 console.log('Particle surfaces: real square/hex floor, holes, removed/hidden ground, barricade tops, first actual casing audio, ordinary/death/boss debris, negative rendered heights and expiry passed');
 }`,sandbox);
}

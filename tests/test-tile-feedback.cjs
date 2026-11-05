const fs=require('node:fs'),vm=require('node:vm');
const H=require('../dist/hex-map.js'),elements={};
const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(t,k)=>t[k]||(()=>{})});
function el(){return {style:{},hidden:true,classList:{add(){},remove(){}},firstElementChild:{style:{}},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:390,height:390}),getContext:()=>gl};}
const sandbox={Image:class {complete=true;naturalWidth=256;},HexMap:H,console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:{innerHeight:800,devicePixelRatio:1,addEventListener(){}},document:{querySelector:()=>el(),getElementById:id=>elements[id]??=el(),querySelectorAll:()=>[]}};
vm.createContext(sandbox);
for(const file of ['music','renderer','map-icons','game','humanoid','cowboy','snake','virus','crimson-mech','drone-boss','ufo-boss','electric-tiles']){const src=fs.readFileSync('dist/'+file+'.js','utf8');vm.runInContext(file==='game'?H.transform(src):src,sandbox);}
vm.runInContext(fs.readFileSync('dist/electric-editor.js','utf8').replace('return {open,close,reset,draw,prepareFloor,','return {thumbnail,expansionTile,expand,open,close,reset,draw,prepareFloor,'),sandbox);
vm.runInContext(`{
const check=(v,m)=>{if(!v)throw Error(m)};
reset();state='combat';tiles=[];for(let y=-5;y<=5;y++)for(let x=-6;x<=6;x++)tiles.push({x,y});
const E=ElectricTiles,tower=E.place('tower',{x:-2,y:0}),farm=E.place('watermelon',{x:4,y:0});check(tower&&farm,'test footprints fit');
let edges=0;const quad=renderer.transparentQuad;renderer.transparentQuad=function(...a){if(a[0][1]===5.1)edges++;return quad.apply(this,a)};draw();renderer.transparentQuad=quad;
check(edges===HexMap.outline(tower.cells).edges.length+HexMap.outline(farm.cells).edges.length,'facility outline matches outer edges including concavity');
for(const kind of ['tower','watermelon'])check(renderer.sprites.filter(s=>s.iconKind===kind).length===1,'one core icon per facility '+kind);
const t=tiles.find(t=>!t.electricFacility);t.coverTile=true;t.coverHp=4;draw();check(!renderer.sprites.some(s=>s.iconKind==='cover'||s.iconKind==='barricade'),'barricade has no floating icon');
for(const kind of ['tower','miner','watermelon','apple','echo','turbine']){const html=ElectricEditor.thumbnail(kind);check((html.match(/class="map-raster-icon"/g)||[]).length===1,'one core icon in card '+kind);check((html.match(/class="electric-stock-footprint"/g)||[]).length===E.defs[kind].cells.length,'card retains complete footprint '+kind);}
const oldRandom=Math.random;try{for(const [roll,kind]of [[.01,'coverTile'],[.07,'trap'],[.11,'saw'],[.13,'orbitSaw'],[.15,'flywheel'],[.9,'empty']]){Math.random=()=>roll;const t=ElectricEditor.expansionTile({x:0,y:-4});check(kind==='empty'?!t.coverTile&&!t.trap&&!t.saw&&!t.flywheel:!!t[kind],'expansion outcome '+kind);if(t.coverTile)check(t.coverHp===coverMaximum(),'random barricade full health');}}finally{Math.random=oldRandom;}
for(const source of ['weapon','drone'])for(const angle of [0,Math.PI/2,Math.PI,-Math.PI/2]){
 shots=[];const origin=source==='weapon'?p:dronePosition(),w=createWeaponModel('laser_t2');emitWeaponShots(w,angle,origin,source);check(shots.length===3,'three laser burst');
 const enemy={x:origin.x+Math.cos(angle)*900,y:origin.y+Math.sin(angle)*900,r:14,hp:100,type:'eye'};
 for(const s of shots){advanceFriendlyShot(s,.08);check(shotHits(s,enemy,.08),'every burst reaches beyond map boundary '+source);}
}
reset();const before=tiles.length,c=ElectricEditor.frontier('floor')[0];Math.random=()=>.01;try{check(ElectricEditor.expand('floor',c),'real expansion succeeds');}finally{Math.random=oldRandom;}check(tiles.length===before+2&&tiles.slice(-2).every(t=>t.coverTile&&t.coverHp===coverMaximum()),'real expansion uses random tile outcomes');
for(const kind of Object.keys(E.defs).filter(kind=>E.enabled(kind)))for(const row of [-1,0]){
 E.reset();tiles=[];for(let y=-5;y<=5;y++)for(let x=-6;x<=6;x++)tiles.push({x,y});const f=E.place(kind,{x:0,y:row}),quads=[],scans=[],original=renderer.transparentQuad,originalScan=renderer.emissiveSquareScan;
 check(f,'fixture can place '+kind+' row '+row);f.cool=(E.defs[kind].interval||0)/2;renderer.emissiveSquareScan=function(...a){scans.push(a);return originalScan.apply(this,a)};
 renderer.transparentQuad=function(...a){if(a[0][1]===5.1)quads.push(a.slice(0,4));return original.apply(this,a)};renderer.begin();E.draw();renderer.transparentQuad=original;renderer.emissiveSquareScan=originalScan;
 const core=E.center(E.coreCell(f));check(scans.length===1,'exactly one cooldown fill per facility '+kind);check(scans[0][0]===core.x-325&&scans[0][1]===(core.y-300)*1.06,'cooldown fill is on actual core cell '+kind);
 const edges=HexMap.outline(f.cells).edges,joins=new Map();check(quads.length===edges.length,'border strips match footprint '+kind);
 quads.forEach((points,i)=>{const e=edges[i],dx=e.bx-e.ax,dz=(e.by-e.ay)*1.06,len=Math.hypot(dx,dz),nx=-dz/len,nz=dx/len;for(let j=0;j<4;j++){const p=points[j],x=(j===0||j===3?e.ax:e.bx)-325,z=((j===0||j===3?e.ay:e.by)-300)*1.06;check(p.every(Number.isFinite),'finite corner');check(Math.abs((p[0]-x)*nx+(p[2]-z)*nz-(j<2?1.2:-1.2))<1e-6,'uniform halved line width '+kind);const key=p.map(n=>n.toFixed(6)).join(',');joins.set(key,(joins.get(key)||0)+1);}});
 check([...joins.values()].every(n=>n===2),'every inner and outer corner is shared without gaps '+kind);
}
console.log('Tile feedback: full facility outlines, single core icons, no barricade icon, random expansion outcomes and delayed triple lasers beyond all four map edges passed');
}`,sandbox);

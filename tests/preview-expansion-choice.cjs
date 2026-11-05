const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?electriclab=1');await page.waitForFunction(()=>window.TileLab?.active);
 const result=await page.evaluate(()=>{
  const E=ElectricTiles,D=ElectricEditor,initial=tiles.map(({x,y})=>({x,y})),check=(v,m)=>{if(!v)throw Error(m);};
  function offers(layout,roll){D.reset();E.reset();tiles=layout.map(t=>({...t}));testMode=false;floor++;const random=Math.random;Math.random=()=>roll;try{D.prepareFloor();}finally{Math.random=random;}return D.stock.map(i=>i.kind);}
  const seen=new Set();for(let i=0;i<80;i++){const kinds=offers(initial,(i+.1)/80);check(kinds.length===3,'normal board still offers three');for(const kind of kinds)if(D.isFloor(kind))seen.add(kind);}
  check(seen.size===4,'all four expansions return to campaign choices');const full=[];for(let y=grid.minY;y<=grid.maxY;y++)for(let x=grid.minX;x<=grid.maxX;x++)full.push({x,y});
  const crowded=offers(full,.5);check(crowded.length===3&&!crowded.some(D.isFloor),'full board uses facilities when no expansion fits');
  const facilities=Object.fromEntries(Object.keys(E.defs).map(k=>[k,{enabledInGame:false}]));
  for(const id of ['double','line','bend','triangle'])facilities['floor_expansion_'+id]={enabledInGame:true};
  localStorage.setItem('neon-facility-designer-v1',JSON.stringify({version:2,designCatalogVersion:6,facilities}));
  const floorOnly=offers([{x:0,y:0}],.5);check(floorOnly.length===3&&floorOnly.every(D.isFloor),'expansion-only catalog offers placeable floor shapes');
  facilities.battery.enabledInGame=true;localStorage.setItem('neon-facility-designer-v1',JSON.stringify({version:2,designCatalogVersion:6,facilities}));
  const fallback=offers([{x:0,y:0}],.5);check(fallback.length===3&&fallback.some(D.isFloor),'expansions remain alongside facilities');
  const empty=offers([],.5);check(!empty.length,'no legal placements returns empty choices');
  return {samples:80,crowded,floorOnly,fallback,empty};
 });assert.equal(result.samples,80);assert.deepEqual(errors,[]);console.log('Expansion choices passed:',JSON.stringify(result));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

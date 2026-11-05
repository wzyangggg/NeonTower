const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await b.newPage({viewport:{width:700,height:900},deviceScaleFactor:2}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173/?avatar=cat&mapseed=cat-clothes');await page.waitForFunction(()=>globalThis.CatPlayer?.ready&&HexMap.ready);
 const checks=await page.evaluate(()=>{
 const rows=[];
 for(const kind of ['cat','robot'])for(const id of ARMOR_TYPES.map(e=>e.id)){
  CatPlayer.select(kind);reset();paused=true;state='combat';p.inv=0;enemies=[];spawnQueue=[];equipItem('armor',createArmor(id,5));
  const before=JSON.stringify({armor,hp:p.hp,max:p.max,shield:p.shield}),r=renderer,box=r.box;let blocks=0;
  r.begin();r.box=function(...args){blocks++;return box.apply(this,args);};try{drawEquipmentModels();}finally{r.box=box;}
  const after=JSON.stringify({armor,hp:p.hp,max:p.max,shield:p.shield});rows.push({kind,id,blocks,before,after});
 }
 CatPlayer.select('cat');reset();paused=true;state='combat';p.inv=0;enemies=[];spawnQueue=[];equipItem('armor',createArmor('chrono',5));time=1;fallAge=landingAge=5;CatPlayer.setEmission(.65);Object.assign(NeonPostFX.settings,{cameraSize:.4});NeonPostFX.refresh();clearTimeout(toast.timer);$('toast').classList.remove('show');draw();return {rows,gl:renderer.gl.getError()};
 });
 for(const row of checks.rows){assert.equal(row.before,row.after);assert.equal(JSON.parse(row.after).armor.id,row.id);if(row.kind==='cat')assert.equal(row.blocks,0,JSON.stringify(row));else assert.ok(row.blocks>=4,JSON.stringify(row));}
 for(const id of new Set(checks.rows.map(r=>r.id))){const pair=checks.rows.filter(r=>r.id===id);assert.equal(pair[0].after,pair[1].after);}
 assert.equal(checks.gl,0);assert.deepEqual(errors,[]);await page.screenshot({path:'tests/player-cat-no-armor.png'});console.log('CAT_CLOTHES_PASS: 12 clothing items retain identical stats, no cat armor blocks, original robot retained, GL=0');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

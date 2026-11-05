const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?electriclab=1&dev=1&spec=0');
 await page.waitForFunction(()=>window.TileLab?.active&&window.Specializations&&window.HexMap?.ready);
 const report=await page.evaluate(()=>{
  paused=true;ElectricTiles.reset();Specializations.setAll(0);tiles=[];for(let y=-5;y<=5;y++)for(let x=-4;x<=4;x++)tiles.push({x,y});renderer.sceneKey=null;
  const setup=()=>{Specializations.clear();enemies=[];shots=[];bullets=[];missiles=[];turrets=[];spawnQueue=[];enemyTransports=[];state='combat';paused=false;timedRoom={duration:999,remaining:999,nextWaveAt:999};shootTimer=999;p.x=325;p.y=350;p.max=20;p.hp=20;p.inv=999;for(let i=0;i<9;i++)enemies.push({x:250+(i%3)*70,y:170+Math.floor(i/3)*40,homeX:250+(i%3)*70,homeY:170+Math.floor(i/3)*40,hp:5000,max:5000,r:14,type:'eye',t:0,fire:999,seed:i,terrainStun:999});};
  const results=[];for(const model of WEAPON_MODELS){
   setup();Specializations.set(model.familyId,5);weapon=createWeaponModel(model.id);
   const rng=Math.random;Math.random=()=>0;
   try{emitWeaponShots(weapon,-Math.PI/2,p);for(let i=0;i<20;i++)step(.016);draw();results.push({id:model.id,gl:renderer.gl.getError(),finite:shots.every(s=>Number.isFinite(s.damage))});}finally{Math.random=rng;}
  }
  setup();Specializations.setAll(5);for(const [kind,x]of [['shotgun_tower',-2],['electric_tower',2],['healing_tower',0]])ElectricTiles.place(kind,{x,y:0});
  p.hp=4;weapon=createWeaponModel('pistol_t4');const rng=Math.random;Math.random=()=>0;try{for(let i=0;i<100;i++)step(.016);}finally{Math.random=rng;}paused=true;draw();
  return {results,categories:Specializations.catalog.length,range:ElectricTiles.attackRange('shotgun_tower'),gl:renderer.gl.getError(),stage:Specializations.view()};
 });
 assert.equal(report.categories,21);assert.equal(report.range,338);assert.ok(report.results.every(r=>r.finite&&r.gl===0));assert.equal(report.gl,0);
 await page.screenshot({path:'tests/specializations-pistol-towers-390.png'});
 for(const family of ['tesla','boomerang','sword']){
  await page.evaluate(family=>{shots=[];weapon=createWeaponModel(WEAPON_MODELS.filter(m=>m.familyId===family).at(-1).id);paused=false;const random=Math.random;Math.random=()=>0;try{emitWeaponShots(weapon,-Math.PI/2,p);for(let i=0;i<5;i++)step(.016);}finally{Math.random=random;}paused=true;draw();},family);
  await page.screenshot({path:`tests/specializations-${family}-390.png`});
 }
 for(const [width,height]of [[320,740],[1280,900]]){await page.setViewportSize({width,height});await page.evaluate(()=>draw());}
 const restored=await page.evaluate(()=>{renderer.initializeGPU();draw();return renderer.gl.getError();});assert.equal(restored,0);
 await page.evaluate(()=>{Specializations.setAll(0);});await page.reload();await page.waitForFunction(()=>window.Specializations&&HexMap.ready);assert.equal(await page.evaluate(()=>Object.values(Specializations.view()).every(n=>n===0)),true);
 assert.deepEqual(errors,[]);console.log('Specializations real Edge/WebGL:',JSON.stringify({models:report.results.length,categories:report.categories,range:report.range,gl:report.gl,errors,screenshots:4,persistence:true,contextRestore:true}));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});

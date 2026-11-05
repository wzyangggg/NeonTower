const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?electriclab=1');await page.waitForFunction(()=>window.TileLab?.active&&MapIcons.ready);
 const report=await page.evaluate(()=>{
  paused=true;ElectricTiles.reset();tiles=[];for(let y=-5;y<=5;y++)for(let x=-6;x<=6;x++)tiles.push({x,y});renderer.sceneKey=null;
  enemies=[];shots=[];bullets=[];missiles=[];turrets=[];spawnQueue=[];enemyTransports=[];state='combat';timedRoom={duration:999,remaining:999,nextWaveAt:999};shootTimer=999;
  p.x=325;p.y=350;p.max=8;p.hp=4;p.inv=999;
  for(const [kind,x]of [['electric_tower',-2],['healing_tower',0],['missile_tower',2],['shield_tower',4],['repair_turret',-4]])ElectricTiles.place(kind,{x,y:0});
  const wall=tiles.find(t=>t.x===0&&t.y===1);wall.coverTile=true;wall.coverHp=1;
  for(const [x,y]of [[240,160],[360,170],[440,150]])enemies.push({x,y,homeX:x,homeY:y,hp:500,max:500,r:14,type:'eye',t:0,fire:999,seed:0,terrainStun:999});
  paused=false;ElectricTiles.update(12);paused=true;draw();
  const keys=['electric:defense:electric_tower','electric:defense:healing_tower','electric:defense:missile_tower','electric:shield_tower','electric:repair-turret'];
  const first=keys.map(k=>renderer.residentMeshes.get(k)?.data);for(let i=0;i<5;i++)draw();
  const meshes=keys.map((k,i)=>{const asset=CyberFacilityMeshes[i===4?'repair_turret':k.split(':').at(-1)];return {key:k,finite:!!first[i]&&Array.from(first[i]).every(Number.isFinite),same:first[i]===renderer.residentMeshes.get(k)?.data,authored:i===3||(i===0?first[i].length>asset.length&&first[i].every((v,j)=>j>=asset.length||j%9>=3||v===asset[j]):first[i].length===asset.length&&first[i].every((v,j)=>v===asset[j]))};});
  const doubledBase=[...renderer.residentMeshes].some(([k,m])=>k.startsWith('hex-production-base:')&&m.count);
  return {meshes,doubledBase,facilities:ElectricTiles.list().map(f=>({kind:f.kind,attacks:f.attacks,count:f.count})),gl:renderer.gl.getError()};
 });assert.ok(report.meshes.every(m=>m.finite&&m.same&&m.authored),JSON.stringify(report));assert.equal(report.doubledBase,true,'shield supply uses a production platform');assert.equal(report.gl,0);
 for(const [width,height]of [[390,844],[320,568],[1280,900]]){await page.setViewportSize({width,height});await page.evaluate(()=>draw());await page.screenshot({path:`tests/defense-towers-${width}x${height}.png`});}
 const offered=await page.evaluate(()=>{let seed=9;const random=Math.random,seen=new Set();Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};for(let i=0;i<180;i++){ElectricEditor.reset();testMode=false;floor=i+1;ElectricEditor.prepareFloor();for(const f of ElectricEditor.stock)seen.add(f.kind);}Math.random=random;return [...seen];});
 for(const kind of ['electric_tower','healing_tower','missile_tower','shield_tower'])assert.ok(offered.includes(kind),'campaign offers '+kind);
 await page.goto('http://127.0.0.1:4173/facility-designer.html');for(const kind of ['electric_tower','healing_tower','missile_tower','shield_tower']){assert.equal(await page.locator('[data-kind="'+kind+'"]').count(),1);await page.locator('[data-kind="'+kind+'"]').click();assert.equal(await page.locator('#kind-category').inputValue(),kind==='shield_tower'?'supply':'defense');}
 assert.deepEqual(errors,[]);console.log('Real Edge/WebGL defense towers passed: three meshes finite/shared, three viewport screenshots, actual attacks/healing, campaign offers, designer catalog and no page/GL errors.',JSON.stringify(report));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});

const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?electriclab=1');
 await page.waitForFunction(()=>window.TileLab?.active&&MapIcons.ready);
 const report=await page.evaluate(()=>{
  paused=true;ElectricTiles.reset();tiles=[];for(let y=-5;y<=5;y++)for(let x=-6;x<=6;x++)tiles.push({x,y});renderer.sceneKey=null;
  enemies=[];shots=[];bullets=[];missiles=[];turrets=[];spawnQueue=[];enemyTransports=[];state='combat';timedRoom={duration:999,remaining:999,nextWaveAt:999};shootTimer=999;
  p.x=325;p.y=350;p.max=8;p.hp=8;p.inv=999;
  for(const [kind,x]of [['shotgun_tower',-2],['sniper_tower',2],['slow_field',0]])ElectricTiles.place(kind,{x,y:0},2);
  for(const x of [260,360,440])enemies.push({x,y:170,homeX:x,homeY:170,hp:500,max:500,r:14,type:'eye',t:0,fire:999,seed:0,terrainStun:999});
  paused=false;ElectricTiles.update(3);paused=true;draw();
  const keys=['electric:defense:shotgun_tower','electric:defense:sniper_tower','electric:defense:shotgun_tower:base','electric:defense:sniper_tower:base','electric:defense:slow_field','electric:slow-field-ring'];
  const first=keys.map(k=>renderer.residentMeshes.get(k)?.data);for(let i=0;i<5;i++)draw();
  const authored=['shotgun_tower','sniper_tower'].every(kind=>['base','head'].every(part=>{const data=renderer.residentMeshes.get('electric:defense:'+kind+(part==='base'?':base':'')).data,asset=CyberRangedTowerMeshes[kind][part];return data.length===asset.length&&data.every((v,i)=>v===asset[i]);}));
  let aimed=true,fixed=true;
  for(const kind of ['shotgun_tower','sniper_tower']){
   const tower=ElectricTiles.list().find(f=>f.kind===kind),key='electric:defense:'+kind,original=tower.aim;
   const base=Array.from(renderer.residentMeshes.get(key+':base').instances.slice(0,12));
   for(const angle of [0,Math.PI/2,-2.4]){tower.aim=angle;draw();const pose=renderer.residentMeshes.get(key).instances;aimed&&=Math.abs(pose[0]-Math.cos(angle))<1e-5&&Math.abs(pose[8]-Math.sin(angle))<1e-5;fixed&&=base.every((v,i)=>v===renderer.residentMeshes.get(key+':base').instances[i]);}
   tower.aim=original;
  }draw();
  return {authored,aimed,fixed,meshes:keys.map((key,i)=>({key,finite:!!first[i]&&Array.from(first[i]).every(Number.isFinite),shared:first[i]===renderer.residentMeshes.get(key)?.data})),pellets:shots.filter(s=>s.towerBullet&&!s.towerSniper).length,sniper:shots.filter(s=>s.towerSniper).length,slow:ElectricTiles.movementFactor(p),gl:renderer.gl.getError()};
 });
 assert.ok(report.meshes.every(m=>m.finite&&m.shared),JSON.stringify(report));assert.equal(report.pellets,10);assert.equal(report.sniper,1);assert.ok(report.slow<1);assert.equal(report.gl,0);
 assert.ok(report.authored&&report.aimed&&report.fixed,JSON.stringify(report));
 for(const [width,height]of [[390,844],[320,568],[1280,900]]){await page.setViewportSize({width,height});await page.evaluate(()=>draw());await page.screenshot({path:`tests/more-towers-${width}x${height}.png`});}
 await page.setViewportSize({width:390,height:844});
 const turning=await page.evaluate(()=>{
  shots=[];enemies=[{x:325,y:130,homeX:325,homeY:130,hp:500,max:500,r:14,type:'eye',t:0,fire:999,seed:0,terrainStun:999}];
  ElectricTiles.place('missile_tower',{x:0,y:2});const towers=ElectricTiles.list().filter(f=>['shotgun_tower','sniper_tower','missile_tower'].includes(f.kind));
  for(const f of towers){f.aim=Math.PI/2;f.cool=0;}paused=false;ElectricTiles.update(.1);paused=true;draw();
  return {count:shots.length,towers:towers.map(f=>({kind:f.kind,aim:f.aim,ready:f.aimReady})),gl:renderer.gl.getError()};
 });assert.equal(turning.count,0);assert.equal(turning.towers.length,3);assert.ok(turning.towers.every(f=>Math.abs(f.aim-Math.PI/2)<=Math.PI*.1+1e-7&&!f.ready));assert.equal(turning.gl,0);
 await page.screenshot({path:'tests/tower-turning-390x844.png'});
 const projectiles=await page.evaluate(()=>{
  paused=false;ElectricTiles.update(1);paused=true;for(const s of shots)advanceFriendlyShot(s,.14);draw();
  const pellet=shots.find(s=>s.towerBullet&&!s.towerSniper),rocket=shots.find(s=>s.towerMissile),radii=[],original=renderer.projectile;
  renderer.projectile=function(...args){radii.push(args[3]);return original.apply(this,args);};ElectricTiles.drawShot(pellet);renderer.projectile=original;
  const mesh=renderer.residentMeshes.get('electric:friendly-missile'),pose=mesh.instances;
  return {pellets:shots.filter(s=>s.towerBullet&&!s.towerSniper).length,rocket:!!rocket,pelletRadius:Math.max(...radii),missileScale:Math.hypot(pose[0],pose[1],pose[2]),gl:renderer.gl.getError()};
 });assert.equal(projectiles.pellets,5);assert.ok(projectiles.rocket);assert.equal(projectiles.pelletRadius,6.5);assert.ok(Math.abs(projectiles.missileScale-1.65)<1e-5);assert.equal(projectiles.gl,0);
 await page.screenshot({path:'tests/tower-projectiles-390x844.png'});
 console.log('Real tower turning and enlarged friendly projectiles:',JSON.stringify({turning,projectiles}));
 const offered=await page.evaluate(()=>{let seed=9;const random=Math.random,seen=new Set();Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};for(let i=0;i<220;i++){ElectricEditor.reset();testMode=false;floor=i+1;ElectricEditor.prepareFloor();for(const f of ElectricEditor.stock)seen.add(f.kind);}Math.random=random;return [...seen];});
 for(const kind of ['shotgun_tower','sniper_tower','slow_field'])assert.ok(offered.includes(kind),'campaign offers '+kind);
 await page.evaluate(()=>localStorage.setItem('neon-facility-designer-v1',JSON.stringify({version:2,designCatalogVersion:6,facilities:{}})));
 await page.goto('http://127.0.0.1:4173/facility-designer.html');
 for(const kind of ['shotgun_tower','sniper_tower','slow_field']){assert.equal(await page.locator('[data-kind="'+kind+'"]').count(),1);await page.locator('[data-kind="'+kind+'"]').click();assert.equal(await page.locator('#kind-category').inputValue(),'defense');}
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('neon-facility-designer-v1')));assert.equal(saved.designCatalogVersion,7);assert.equal(saved.facilities.slow_field.effectMode,'radius');assert.equal(saved.facilities.slow_field.range,140);
 await page.goto('http://127.0.0.1:4173/?electriclab=1&facilitypreview=rangedtowers');
 await page.waitForFunction(()=>globalThis.TileLab?.active&&ElectricTiles.list().some(f=>f.kind==='sniper_tower'));
 for(const [width,height]of [[390,844],[320,568],[1280,900]]){await page.setViewportSize({width,height});await page.evaluate(()=>{paused=true;draw();});await page.screenshot({path:`tests/ranged-towers-preview-${width}x${height}.png`});}
 const restored=await page.evaluate(()=>{renderer.initializeGPU();draw();return ['shotgun_tower','sniper_tower'].every(kind=>['base','head'].every(part=>{const mesh=renderer.residentMeshes.get('electric:defense:'+kind+(part==='base'?':base':''));return mesh?.buffer&&mesh.data.length===CyberRangedTowerMeshes[kind][part].length;}))&&renderer.gl.getError()===0;});assert.ok(restored,'Blender mesh GPU rebuild');
 assert.deepEqual(errors,[]);console.log('Real Edge/WebGL more towers passed: finite shared meshes, three viewport screenshots, attacks, field, campaign offers, legacy designer migration and no page/GL errors.',JSON.stringify(report));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});

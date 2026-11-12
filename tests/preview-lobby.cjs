const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/');await page.waitForSelector('#lobby-nav:not([hidden])');
 const navTabs=page.locator('#lobby-nav [role=tab]');
 assert.deepEqual(await navTabs.evaluateAll(tabs=>tabs.map(tab=>tab.getAttribute('aria-label'))),['出战','角色','研究','防御塔强化']);
 assert.deepEqual(await navTabs.allTextContents(),['','','','']);
 const navIcons=navTabs.locator('img');
 await navIcons.evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
 assert.deepEqual(await navIcons.evaluateAll(images=>images.map(image=>image.naturalWidth)),[32,32,32,32]);
 assert.equal(await page.locator('#lobby-tab-battle').getAttribute('aria-selected'),'true');
 await page.screenshot({path:'tests/lobby-battle-390.png'});
 await page.locator('#lobby-tab-towers').click();assert.equal(await page.locator('#lobby-pages .research-card').count(),8);
 const towerTrees=await page.evaluate(()=>Object.entries(TowerResearch.trees).map(([kind,tree])=>[kind,tree.nodes.map(node=>node.id)]));
 for(const [kind,ids] of towerTrees){
  const card=page.locator(`[data-research="${kind}"]`);
  const cover=card.locator('img');
  const coverSrc=`assets/research-icons-v4/${kind}-32.png`;
  assert.equal(await cover.getAttribute('src'),coverSrc);
  assert.deepEqual(await cover.evaluate(async image=>{
   await image.decode();
   return [image.naturalWidth,image.naturalHeight,image.clientWidth===Math.min(64,image.parentElement.clientWidth),getComputedStyle(image).imageRendering];
  }),[32,32,true,'pixelated']);
  await card.click();
  const core=page.locator('#tower-tree-board [data-status=core] img');
  assert.equal(await core.getAttribute('src'),coverSrc);
  assert.equal(await core.evaluate(image=>image.clientWidth),32);
  const icons=page.locator('#tower-tree-board .tower-upgrade-icon');
  const loaded=await icons.evaluateAll(images=>Promise.all(images.map(async image=>{
   await image.decode();
   return [image.closest('button').dataset.towerNode,image.getAttribute('src'),image.naturalWidth,image.naturalHeight,image.clientWidth,getComputedStyle(image).imageRendering];
  })));
  assert.deepEqual(loaded,ids.map(id=>[id,`assets/tower-upgrade-icons-v1/${kind}/${id.toLowerCase()}-24.png`,24,24,48,'pixelated']));
  await page.keyboard.press('Escape');
 }
 await page.locator('[data-research=electric_tower]').click();
 assert(await page.getByRole('button',{name:'设施核心，已激活'}).isVisible());
 assert(await page.locator('#tower-train').isHidden());
 await page.locator('[data-tower-node=reach]').click();assert(await page.locator('#tower-train').isVisible());
 await page.keyboard.press('Escape');
 await page.evaluate(()=>TalentRuntime.store.credit(300,{tower0:6,tower1:4,tower2:1}));
 await page.locator('[data-research=sniper_tower]').click();
 const towerCard=id=>page.locator(`[data-tower-node="${id}"]`);
 const train=page.locator('#tower-train');
 async function researchTower(id){
  await towerCard(id).click();await train.click();await page.waitForFunction(()=>!ButtonConfirm.busy);
  assert.equal(await towerCard(id).getAttribute('data-status'),'done');
 }
 await researchTower('distance');await researchTower('rapid');
 for(const id of ['pierce','column']){
  assert.equal(await towerCard(id).getAttribute('data-status'),'excluded');
  await towerCard(id).click();assert(await train.isDisabled());
 }
 assert.equal(await towerCard('caliber').getAttribute('data-status'),'locked');
 for(const [width,height] of [[320,740],[390,844],[1280,900]]){
  await page.setViewportSize({width,height});
  const bounds=await page.locator('#tower-tree-view').evaluate(view=>{
   const area=view.getBoundingClientRect(),nested=[...view.querySelectorAll('[data-tower-node=recovery],[data-tower-node=ballistic],[data-tower-node=column]')].map(e=>e.getBoundingClientRect());
   return view.scrollWidth===view.clientWidth&&nested.every(r=>r.left>=area.left&&r.right<=area.right)&&nested.every((r,i)=>!i||r.left>nested[i-1].right);
  });
  assert(bounds,'vertical tree fits '+width);
 }
 await page.setViewportSize({width:390,height:844});
 await towerCard('ballistic').click();
 if(process.env.TOWER_RESEARCH_SCREENSHOT)await page.screenshot({path:process.env.TOWER_RESEARCH_SCREENSHOT});
 await researchTower('ballistic');
 assert.equal(await towerCard('recovery').getAttribute('data-status'),'excluded');
 await researchTower('caliber');await researchTower('bounty');
 assert.match(await page.locator('#tower-tree-progress').textContent(),/5\/5/);
 await page.keyboard.press('Escape');await page.locator('#lobby-tab-battle').click();
 await page.locator('#start').click();await page.waitForFunction(()=>!ButtonConfirm.busy);
 assert.deepEqual(await page.evaluate(()=>TowerResearch.levels('sniper_tower')),{distance:2,cycle:.15,ballistic:.2,bounty:2});
 await page.reload();await page.waitForSelector('#lobby-nav:not([hidden])');
 await page.locator('#lobby-tab-towers').click();await page.locator('[data-research=sniper_tower]').click();
 assert.equal(await towerCard('bounty').getAttribute('data-status'),'done');
 const resetTower=page.locator('#tower-tree-reset');
 await resetTower.click();assert.match(await resetTower.textContent(),/返还 300 分/);await resetTower.click();
 assert.equal(await towerCard('distance').getAttribute('data-status'),'available');
 assert.equal(await page.evaluate(()=>TalentRuntime.store.view().balance),300);
 assert.deepEqual(await page.evaluate(()=>TalentRuntime.store.view().materials),{tower0:6,tower1:4,tower2:1});
 await page.evaluate(()=>localStorage.removeItem(TalentRuntime.store.key));
 await page.reload();await page.waitForSelector('#lobby-nav:not([hidden])');
 await page.locator('#lobby-tab-research').click();await page.locator('[data-chip-view=research]').click();assert.equal(await page.locator('#lobby-pages .research-card').count(),13);
 await page.screenshot({path:'tests/lobby-research-390.png'});
 await page.locator('[data-research="pistol"]').click();assert.equal(await page.locator('.research-node').count(),5);
 const order=await page.locator('.research-node').evaluateAll(nodes=>nodes.map(n=>Number(n.dataset.researchNode)));assert.deepEqual(order,[5,4,3,2,1]);
 assert(await page.locator('#research-upgrade').isDisabled());
 await page.locator('[data-research-node="5"]').click();assert.equal(await page.locator('#research-upgrade').textContent(),'需先研究第 4 阶');assert(await page.locator('#research-upgrade').isDisabled());
 await page.locator('[data-research-node="1"]').click();
 await page.evaluate(()=>TalentRuntime.store.credit(1000,{skill0:3}));await page.locator('[data-research-node="1"]').click();
 assert.equal(await page.locator('#research-upgrade').textContent(),'研究 · ◇ 20');
 await page.locator('#research-upgrade').click();await page.waitForFunction(()=>!ButtonConfirm.busy);
 assert.equal(await page.evaluate(()=>TalentRuntime.store.view().balance),980);assert.equal(await page.evaluate(()=>Specializations.level('pistol')),1);
 assert(await page.locator('[data-research-node="1"]').getAttribute('class').then(c=>c.includes('done')));
 await page.locator('[data-research-node="2"]').click();await page.locator('#research-upgrade').click();await page.waitForFunction(()=>!ButtonConfirm.busy);assert.equal(await page.evaluate(()=>TalentRuntime.store.view().balance),940);
 // Old attribute saves/refunds must preserve research ownership and spending.
 await page.locator('#research-close').click();await page.locator('#lobby-tab-character').click();await page.waitForSelector('#skill-panel:not([hidden])');
 assert.equal(await page.locator('#skill-panel button.attribute-tree-card').count(),6);
 await page.locator('#attribute-center').click();
 assert(await page.getByRole('button',{name:'角色核心，已激活'}).isVisible());
 assert(await page.locator('#attribute-train').isHidden());
 await page.locator('[data-attribute=damage]').click();await page.locator('#attribute-train').click();await page.waitForFunction(()=>!ButtonConfirm.busy);
 assert.equal(await page.evaluate(()=>TalentRuntime.store.view().balance),915);
 await page.screenshot({path:'tests/lobby-character-390.png'});
 await page.locator('#lobby-tab-research').click();assert(await page.locator('#skill-panel').isHidden());
 await page.reload();await page.waitForSelector('#lobby-nav:not([hidden])');await page.locator('#lobby-tab-research').click();await page.locator('[data-chip-view=research]').click();
 assert.equal(await page.evaluate(()=>Specializations.level('pistol')),2);assert.equal(await page.evaluate(()=>TalentRuntime.store.view().research.pistol),2);assert.equal(await page.evaluate(()=>TalentRuntime.store.view().balance),915);
 // A stale character draft cannot overwrite a completed purchase.
 const transaction=await page.evaluate(()=>{const s=TalentRuntime.store,d=s.draft(),ok=s.purchaseResearch('pistol',2),stale=s.save(d);return {ok,stale,balance:s.view().balance,n:Specializations.level('pistol')};});
 assert.equal(transaction.ok,true);assert.equal(transaction.stale,false);assert.equal(transaction.balance,835);assert.equal(transaction.n,3);
 const invalid=await page.evaluate(()=>({jump:TalentRuntime.store.purchaseResearch('pistol',4),unknown:TalentRuntime.store.purchaseResearch('bad',0)}));assert.deepEqual(invalid,{jump:false,unknown:false});
 await page.locator('[data-research="pistol"]').click();await page.locator('[data-research-node="4"]').click();
 for(const [width,height]of [[320,740],[390,844],[1280,900]]){
  await page.setViewportSize({width,height});await page.screenshot({path:`tests/lobby-tree-${width}.png`});
  const report=await page.evaluate(()=>{const dialog=document.querySelector('.research-dialog').getBoundingClientRect(),footer=document.querySelector('.research-dialog footer').getBoundingClientRect(),scroll=document.querySelector('.research-tree-scroll');return {width:dialog.width,footer:footer.bottom<=innerHeight&&footer.top>=0,horizontal:document.documentElement.scrollWidth>innerWidth,scrollable:scroll.scrollHeight>scroll.clientHeight,gl:renderer.gl.getError()};});
  assert.equal(report.horizontal,false);assert.equal(report.footer,true);assert.equal(report.scrollable,true);assert.equal(report.gl,0);
 }
 await page.keyboard.press('Escape');assert(await page.locator('#research-modal').isHidden());
 assert.equal(await page.locator('#lobby-tab-talents').count(),0);
 await page.locator('#lobby-tab-battle').click();assert(await page.locator('#viewport .difficulty-panel').isVisible());
 await page.locator('[data-difficulty-step="1"]').click();assert(await page.locator('#viewport #lobby-nav').isVisible());
 await page.locator('[data-difficulty-step="-1"]').click();await page.locator('#start').click();await page.waitForFunction(()=>!ButtonConfirm.busy);assert(await page.locator('#viewport #lobby-nav').isHidden());
 await page.evaluate(()=>{paused=true;returnToMainMenu();});assert(await page.locator('#viewport #lobby-nav').isVisible());assert(await page.locator('#viewport .difficulty-panel').isVisible());
 for(const [width,height]of [[320,740],[390,844],[1280,900]]){await page.setViewportSize({width,height});const bounds=await page.evaluate(()=>({bottom:document.querySelector('.difficulty-panel').getBoundingClientRect().bottom,nav:document.querySelector('#lobby-nav').getBoundingClientRect().top}));assert(bounds.bottom<=bounds.nav,'battle card clears navigation '+width+': '+JSON.stringify(bounds));}
 assert.deepEqual(errors,[]);console.log('Four-tab lobby: icon-only navigation, separate tower and weapon grids, five-stage modal, shared wallet, responsive scroll, battle/return and real WebGL passed');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});

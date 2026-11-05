const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/');await page.waitForSelector('#lobby-nav:not([hidden])');
 const navTabs=page.locator('#lobby-nav [role=tab]');
 assert.deepEqual(await navTabs.evaluateAll(tabs=>tabs.map(tab=>tab.getAttribute('aria-label'))),['出战','角色','研究']);
 assert.deepEqual(await navTabs.allTextContents(),['','','']);
 const navIcons=navTabs.locator('img');
 await navIcons.evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
 assert.deepEqual(await navIcons.evaluateAll(images=>images.map(image=>image.naturalWidth)),[32,32,32]);
 assert.equal(await page.locator('#lobby-tab-battle').getAttribute('aria-selected'),'true');
 await page.screenshot({path:'tests/lobby-battle-390.png'});
 await page.locator('#lobby-tab-research').click();assert.equal(await page.locator('.research-card').count(),21);
 await page.screenshot({path:'tests/lobby-research-390.png'});
 await page.locator('[data-research="pistol"]').click();assert.equal(await page.locator('.research-node').count(),5);
 const order=await page.locator('.research-node').evaluateAll(nodes=>nodes.map(n=>Number(n.dataset.researchNode)));assert.deepEqual(order,[5,4,3,2,1]);
 assert(await page.locator('#research-upgrade').isDisabled());
 await page.locator('[data-research-node="5"]').click();assert.equal(await page.locator('#research-upgrade').textContent(),'需先研究第 4 阶');assert(await page.locator('#research-upgrade').isDisabled());
 await page.locator('[data-research-node="1"]').click();
 await page.evaluate(()=>TalentRuntime.store.credit(1000));await page.locator('[data-research-node="1"]').click();
 assert.equal(await page.locator('#research-upgrade').textContent(),'研究 · ◇ 20');
 await page.locator('#research-upgrade').click();
 assert.equal(await page.evaluate(()=>TalentRuntime.store.view().balance),980);assert.equal(await page.evaluate(()=>Specializations.level('pistol')),1);
 assert(await page.locator('[data-research-node="1"]').getAttribute('class').then(c=>c.includes('done')));
 await page.locator('[data-research-node="2"]').click();await page.locator('#research-upgrade').click();assert.equal(await page.evaluate(()=>TalentRuntime.store.view().balance),940);
 // Old attribute saves/refunds must preserve research ownership and spending.
 await page.locator('#research-close').click();await page.locator('#lobby-tab-character').click();await page.waitForSelector('#skill-panel:not([hidden])');
 assert.equal(await page.locator('.skill-row').count(),13);
 assert(await page.locator('.attribute-description').first().isHidden());
 assert(await page.locator('.skill-controls span').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize)>=16));
 await page.locator('#attribute-description-toggle').click();assert(await page.locator('.attribute-description').first().isVisible());
 await page.locator('#attribute-description-toggle').click();assert(await page.locator('.attribute-description').first().isHidden());
 await page.locator('[data-skill="damage"][data-change="1"]').click();await page.locator('#skill-save').click();assert.equal(await page.evaluate(()=>TalentRuntime.store.view().balance),935);
 await page.screenshot({path:'tests/lobby-character-390.png'});
 await page.locator('#lobby-tab-research').click();assert(await page.locator('#skill-panel').isHidden());
 await page.reload();await page.waitForSelector('#lobby-nav:not([hidden])');await page.locator('#lobby-tab-research').click();
 assert.equal(await page.evaluate(()=>Specializations.level('pistol')),2);assert.equal(await page.evaluate(()=>TalentRuntime.store.view().research.pistol),2);assert.equal(await page.evaluate(()=>TalentRuntime.store.view().balance),935);
 // A stale character draft cannot overwrite a completed purchase.
 const transaction=await page.evaluate(()=>{const s=TalentRuntime.store,d=s.draft(),ok=s.purchaseResearch('pistol',2),stale=s.save(d);return {ok,stale,balance:s.view().balance,n:Specializations.level('pistol')};});
 assert.equal(transaction.ok,true);assert.equal(transaction.stale,false);assert.equal(transaction.balance,855);assert.equal(transaction.n,3);
 const invalid=await page.evaluate(()=>({jump:TalentRuntime.store.purchaseResearch('pistol',4),unknown:TalentRuntime.store.purchaseResearch('bad',0)}));assert.deepEqual(invalid,{jump:false,unknown:false});
 await page.locator('[data-research="pistol"]').click();await page.locator('[data-research-node="4"]').click();
 for(const [width,height]of [[320,740],[390,844],[1280,900]]){
  await page.setViewportSize({width,height});await page.screenshot({path:`tests/lobby-tree-${width}.png`});
  const report=await page.evaluate(()=>{const dialog=document.querySelector('.research-dialog').getBoundingClientRect(),footer=document.querySelector('.research-dialog footer').getBoundingClientRect(),scroll=document.querySelector('.research-tree-scroll');return {width:dialog.width,footer:footer.bottom<=innerHeight&&footer.top>=0,horizontal:document.documentElement.scrollWidth>innerWidth,scrollable:scroll.scrollHeight>scroll.clientHeight,gl:renderer.gl.getError()};});
  assert.equal(report.horizontal,false);assert.equal(report.footer,true);assert.equal(report.scrollable,true);assert.equal(report.gl,0);
 }
 await page.keyboard.press('Escape');assert(await page.locator('#research-modal').isHidden());
 assert.equal(await page.locator('#lobby-tab-talents').count(),0);
 await page.locator('#lobby-tab-battle').click();assert(await page.locator('.difficulty-panel').isVisible());
 await page.locator('[data-difficulty-step="1"]').click();assert(await page.locator('#lobby-nav').isVisible());
 await page.locator('[data-difficulty-step="-1"]').click();await page.locator('#start').click();assert(await page.locator('#lobby-nav').isHidden());
 await page.evaluate(()=>{paused=true;returnToMainMenu();});assert(await page.locator('#lobby-nav').isVisible());assert(await page.locator('.difficulty-panel').isVisible());
 for(const [width,height]of [[320,740],[390,844],[1280,900]]){await page.setViewportSize({width,height});const bounds=await page.evaluate(()=>({bottom:document.querySelector('.difficulty-panel').getBoundingClientRect().bottom,nav:document.querySelector('#lobby-nav').getBoundingClientRect().top}));assert(bounds.bottom<=bounds.nav,'battle card clears navigation '+width+': '+JSON.stringify(bounds));}
 assert.deepEqual(errors,[]);console.log('Three-tab rainbow lobby: grid 21, upward five-stage modal, shared wallet/costs/prerequisites, save/reload, old attributes, stale drafts, responsive scroll, battle/return and real WebGL passed');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});

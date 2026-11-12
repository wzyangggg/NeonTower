const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/');
  await page.waitForSelector('#lobby-nav:not([hidden])');
  await page.locator('#lobby-tab-research').click();await page.locator('[data-chip-view=research]').click();
  await page.evaluate(()=>TalentRuntime.store.credit(500));
  await page.locator('[data-research="pistol"]').click();
  const buy=page.locator('#research-upgrade'),bounds=await buy.boundingBox();
  for(let level=1;level<=5;level++){
   // Repeated clicks at the same position must purchase successive stages.
   await page.mouse.click(bounds.x+bounds.width/2,bounds.y+bounds.height/2);await page.waitForFunction(()=>!ButtonConfirm.busy);
   assert.equal(await page.evaluate(()=>TalentRuntime.store.researchLevel('pistol')),level);
   const next=Math.min(5,level+1);
   assert.equal(await page.locator('.research-node.selected').getAttribute('data-research-node'),String(next));
   assert.equal(await page.locator('.research-node.selected').getAttribute('aria-pressed'),'true');
   assert(await page.locator('.research-node.selected').evaluate(e=>{const r=e.getBoundingClientRect(),p=e.closest('.research-tree-scroll').getBoundingClientRect();return r.top>=p.top-1&&r.bottom<=p.bottom+1}));
   assert.equal(await buy.isDisabled(),level===5);
  }
  assert.equal(await buy.textContent(),'已研究');
  assert.equal(await page.evaluate(()=>TalentRuntime.store.view().balance),0);
  await page.keyboard.press('Escape');
  await page.evaluate(()=>TalentRuntime.store.credit(20));
  await page.locator('[data-research="smg"]').click();await buy.click();await page.waitForFunction(()=>!ButtonConfirm.busy);
  assert.equal(await page.locator('.research-node.selected').getAttribute('data-research-node'),'2');
  assert.equal(await buy.textContent(),'分数不足');assert(await buy.isDisabled());
  await page.reload();await page.waitForSelector('#lobby-nav:not([hidden])');
  assert.equal(await page.evaluate(()=>TalentRuntime.store.researchLevel('pistol')),5);
  assert.equal(await page.evaluate(()=>TalentRuntime.store.researchLevel('smg')),1);
  assert.deepEqual(errors,[]);
  console.log('Sequential research: fixed-position clicks through five stages, next selection/visibility, cap, insufficient balance and persistence passed');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});


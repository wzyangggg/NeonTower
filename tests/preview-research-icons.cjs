const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))errors.push(r.url());});
 await page.goto('http://127.0.0.1:4173/');await page.waitForSelector('#lobby-nav:not([hidden])');await page.locator('#lobby-tab-research').click();
 assert.equal(await page.locator('.research-card img').count(),21);
 await page.waitForFunction(()=>[...document.querySelectorAll('.research-card img')].every(i=>i.complete&&i.naturalWidth===48));
 for(const width of [320,390,1280]){
  await page.setViewportSize({width,height:1000});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert(await page.locator('.research-card img').evaluateAll(imgs=>imgs.every(i=>{const art=i.parentElement.getBoundingClientRect(),rect=i.getBoundingClientRect();return rect.width>=art.width*.85&&rect.width<=art.width+1&&getComputedStyle(i).imageRendering==='pixelated'&&getComputedStyle(i).filter==='none'&&getComputedStyle(i.parentElement,'::before').content==='none'})));
  assert.equal(await page.locator('.research-grid').first().evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),4);
  assert.equal(await page.locator('.research-card .research-stars').count(),21);
  assert.equal(await page.locator('.research-card .research-stars span').count(),105);
  await page.locator('.research-group').first().screenshot({path:`tests/research-icons-${width}.png`});
 }
 const ids=await page.locator('.research-card:has(img)').evaluateAll(cards=>cards.map(c=>c.dataset.research));
 for(const id of ids){
  await page.locator(`[data-research="${id}"]`).click();
  const img=page.locator('.research-dialog-icon img');await img.waitFor();
  assert.equal(await img.getAttribute('src'), `assets/research-icons-v4/${id}-48.png`);
  assert.equal(await page.locator('.research-node').count(),5);
  await page.keyboard.press('Escape');
 }
 await page.evaluate(()=>{TalentRuntime.store.credit(100);TalentRuntime.store.purchaseResearch('pistol',0);LobbyUI.select('research',true)});
 assert.equal(await page.locator('[data-research="pistol"] .research-stars .lit').count(),1);
 assert.deepEqual(errors,[]);console.log('21 new icons; four columns at 320/390/1280; 105 stars and earned star update; all category/detail mappings; zero page/resource errors passed');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});

const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/');await page.waitForSelector('#lobby-nav:not([hidden])');
 await page.evaluate(()=>TalentRuntime.store.credit(1000));await page.locator('#lobby-tab-research').click();await page.locator('[data-research="pistol"]').click();
 await page.evaluate(()=>{globalThis.stops=0;const original=ButtonConfirmAudio;ButtonConfirmAudio=()=>{const stop=original();return ()=>{stops++;stop?.();};};document.querySelector('#research-upgrade').click();});
 assert.equal(await page.evaluate(()=>TalentRuntime.store.researchLevel('pistol')),0);
 assert(await page.locator('#research-upgrade').evaluate(e=>e.classList.contains('confirm-flash-white')));
 assert.equal(await page.locator('#research-upgrade').evaluate(e=>getComputedStyle(e).color),'rgb(0, 0, 0)');
 await page.evaluate(()=>{document.querySelector('#research-upgrade').click();document.querySelector('#research-close').click();document.querySelector('#lobby-tab-character').click();});
 await page.keyboard.press('Escape');assert(await page.locator('#research-modal').isVisible());
 await page.waitForFunction(()=>!ButtonConfirm.busy);assert.equal(await page.evaluate(()=>TalentRuntime.store.researchLevel('pistol')),1);assert.equal(await page.evaluate(()=>stops),1);
 await page.locator('#research-close').click();await page.locator('#lobby-tab-character').click();
 const plus=page.locator('[data-skill="damage"][data-change="1"]');const before=await page.locator('[data-attribute="damage"] .attribute-current').textContent();
 await plus.click();await page.evaluate(()=>{document.querySelector('[data-skill="speed"][data-change="1"]').click();document.querySelector('#skill-reset').click();});
 assert.equal(await page.locator('[data-attribute="damage"] .attribute-current').textContent(),before);
 await page.waitForFunction(()=>!ButtonConfirm.busy);assert.notEqual(await page.locator('[data-attribute="damage"] .attribute-current').textContent(),before);
 assert.equal(await page.evaluate(()=>TalentRuntime.store.view().levels.damage),1);await page.evaluate(()=>LobbyUI.select('battle')); 
 await page.locator('#start').click();assert.equal(await page.evaluate(()=>state),'menu');await page.waitForFunction(()=>!ButtonConfirm.busy);assert.notEqual(await page.evaluate(()=>state),'menu');
 assert.deepEqual(errors,[]);console.log('Delayed confirmation: immediate white/black, deferred research/attributes/start, cross-button and Escape locks, audio cleanup passed');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});


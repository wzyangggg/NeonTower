const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:1100,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))errors.push(r.url());});
 await page.goto('http://127.0.0.1:4173/ui-color-lab.html');
 assert.equal(await page.locator('[data-weapon-icon]').count(),9);
 for(const mode of ['original','32','48']){
  await page.locator(`[data-weapon-mode="${mode}"]`).click();
  await page.waitForFunction(({mode,size})=>[...document.querySelectorAll('[data-weapon-icon]')].every(i=>i.complete&&i.naturalWidth===size&&i.src.endsWith(`-${mode}.png`)),{mode,size:mode==='original'?256:Number(mode)});
  assert.equal(await page.locator('[data-weapon-mode][aria-pressed="true"]').count(),1);
 }
 await page.locator('[data-weapon-choice="青色卡宾枪"]').click();
 assert.equal(await page.locator('[data-weapon-choice][aria-pressed="true"]').count(),1);
 assert.equal(await page.locator('[data-weapon-selection]').textContent(),'已选择：青色卡宾枪');
 assert.equal(await page.locator('.weapon-study').evaluate(e=>getComputedStyle(e).filter),'none');
 for(const width of [1100,390,320]){
  await page.setViewportSize({width,height:1000});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('.weapon-study').screenshot({path:`tests/weapon-icon-study-${width}.png`});
 }
 await page.locator('.weapon-source summary').click();
 await page.waitForFunction(()=>{const i=document.querySelector('.weapon-source>img');return i.complete&&i.naturalWidth>0;});
 assert.deepEqual(errors,[]);
 console.log('9 icons; original/32/48 switching and asset dimensions; selection; 3 layouts; source sheet; zero page/resource errors passed');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});

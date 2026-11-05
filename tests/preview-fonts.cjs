const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))errors.push(r.url());});
  await page.goto('http://127.0.0.1:4173/');
  await page.waitForSelector('#lobby-nav:not([hidden])');
  await page.evaluate(async()=>{await Promise.all([document.fonts.load('500 16px NeonUI','霓虹高塔'),document.fonts.load('700 16px NeonUI','研究'),document.fonts.load('600 16px NeonNumbers','0123456789')]);await document.fonts.ready;});
  assert(await page.evaluate(()=>document.fonts.check('500 16px NeonUI')&&document.fonts.check('700 16px NeonUI')&&document.fonts.check('600 16px NeonNumbers')));
  for(const width of [320,390,1280]){
   await page.setViewportSize({width,height:844});
   for(const tab of ['battle','character','research']){
    const button=page.locator('#lobby-tab-'+tab);
    if(await button.count())await button.click();
    await page.waitForTimeout(450);
    if(tab==='research')await page.locator('.research-card').first().waitFor({state:'visible'});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    assert((await page.locator('#lobby-nav button').first().evaluate(e=>getComputedStyle(e).fontFamily)).includes('NeonUI'));
    if(width===390)await page.screenshot({path:`tests/fonts-${tab}-390.png`});
   }
  }
  // The browser must actually use downloaded glyphs, not merely accept CSS names.
  const cdp=await page.context().newCDPSession(page);await cdp.send('DOM.enable');await cdp.send('CSS.enable');
  const {root}=await cdp.send('DOM.getDocument');const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:root.nodeId,selector:'.research-card strong'});
  const {fonts}=await cdp.send('CSS.getPlatformFontsForNode',{nodeId});
  assert(fonts.some(f=>f.isCustomFont&&f.glyphCount>0),JSON.stringify(fonts));
  assert.deepEqual(errors,[]);console.log('Local fonts loaded and used; 320/390/1280 three-tab layouts; zero resource/page errors passed.',fonts);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

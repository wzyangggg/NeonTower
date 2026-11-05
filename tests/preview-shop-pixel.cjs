const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/shop-pixel-preview.html');
 await page.waitForFunction(()=>document.querySelectorAll('.pixel-sample canvas[data-ready="true"]').length===3);
 assert(await page.locator('.pixel-sample canvas').evaluateAll(items=>items.every(c=>c.width===36&&c.height===36)));
 assert(await page.locator('.pixel-sample canvas').evaluateAll(items=>items.every(c=>{
  const rgba=c.getContext('2d').getImageData(0,0,36,36).data,colors=new Set();
  for(let i=0;i<rgba.length;i+=4)colors.add(`${rgba[i]},${rgba[i+1]},${rgba[i+2]},${rgba[i+3]}`);
  return c.dataset.sourceSize==='36x36'&&colors.size<=7;
 })));
 for(const [width,height] of [[390,844],[320,568],[1280,900]]){
  await page.setViewportSize({width,height});
  assert.equal(await page.locator('.pixel-sample canvas').count(),3);
  assert(await page.locator('.shop-panel').evaluate(e=>e.scrollWidth<=e.clientWidth+1));
  await page.screenshot({path:`tests/shop-pixel-${width}x${height}.png`});
 }
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(()=>{shopItems.forEach(u=>delete u.pixelSample);renderShop()});
 await page.screenshot({path:'tests/shop-pixel-before.png'});
 assert.deepEqual(errors,[]);console.log('Three pixel images loaded; 320/390/1280 layouts and zero page errors passed.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});

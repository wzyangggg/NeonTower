const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))errors.push(r.url());});
 await page.goto('http://127.0.0.1:4173/');await page.waitForSelector('#lobby-nav:not([hidden])');
 await page.evaluate(()=>TalentRuntime.store.credit(1000));
 await page.locator('#lobby-tab-character').click();
 await page.waitForFunction(()=>document.querySelectorAll('.attribute-icon img').length===13&&[...document.querySelectorAll('.attribute-icon img')].every(i=>i.complete&&i.naturalWidth>48));
 await page.waitForFunction(()=>document.querySelectorAll('.attribute-icon canvas[data-ready=true]').length===13);
 assert.equal(await page.locator('#skill-save,.attribute-group,[data-change="-1"]').count(),0);
 assert.equal(await page.locator('.skill-row > button.attribute-upgrade').count(),13);
 assert.match(await page.locator('[data-skill="rate"] .attribute-values').textContent(),/→/);
 const ids=await page.locator('[data-attribute]').evaluateAll(rows=>rows.map(r=>r.dataset.attribute));
 for(const id of ids)assert((await page.locator(`[data-attribute="${id}"] img`).getAttribute('src')).endsWith(`/${id==='critDamage'?'crit_damage':id}-original.png`));
 for(const width of [320,390,1280]){
  await page.setViewportSize({width,height:900});await page.waitForTimeout(400);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert(await page.locator('.skill-row').evaluateAll(rows=>rows.every(r=>r.scrollWidth<=r.clientWidth+1)));
  assert(await page.locator('.skill-frame').evaluate(f=>{const list=f.querySelector('#skill-list').getBoundingClientRect(),footer=f.querySelector('footer').getBoundingClientRect();return list.height>150&&list.bottom<=footer.top+1&&footer.bottom<=f.getBoundingClientRect().bottom+1}));
  assert(await page.locator('.attribute-icon canvas').evaluateAll(icons=>icons.length===13&&icons.every(c=>c.dataset.ready==='true'&&c.width===24&&c.height===24&&getComputedStyle(c).imageRendering==='pixelated'&&c.getBoundingClientRect().width===48&&c.getContext('2d').getImageData(0,0,24,24).data.some((v,i)=>i%4===3&&v>0))));
  assert(await page.locator('.attribute-meter').evaluateAll(bars=>bars.length===13&&bars.every(b=>b.textContent===''&&b.children.length===Number(b.getAttribute('aria-valuemax'))&&b.getBoundingClientRect().height>0)));
  assert(await page.locator('.skill-row').evaluateAll(rows=>rows.every(row=>{
   const [icon,copy,button]=row.children;
   const [r,i,c,b]=[row,icon,copy,button].map(el=>el.getBoundingClientRect());
   const near=(x,y)=>Math.abs(x-y)<1;
   return near(i.left,r.left)&&near(i.right,c.left)&&near(c.right,b.left)&&near(b.right,r.right)
    &&near(i.top,b.top)&&near(i.bottom,b.bottom)
    &&getComputedStyle(icon).backgroundImage.startsWith('linear-gradient(')
    &&getComputedStyle(button).backgroundImage.startsWith('linear-gradient(')
    &&near(b.width,r.width*.34)&&button.scrollWidth<=button.clientWidth+1
    &&getComputedStyle(button).boxShadow==='none';
  })));
  await page.locator('#skill-list').evaluate(e=>e.scrollTop=0);
  await page.screenshot({path:`tests/attribute-icons-${width}.png`});
 }
 await page.locator('[data-skill="damage"][data-change="1"]').click();
 await page.waitForFunction(()=>TalentRuntime.store.view().levels.damage===1);
 assert.equal(await page.evaluate(()=>TalentRuntime.store.view().levels.damage),1);
 assert.equal(await page.locator('[data-attribute=damage] .attribute-meter .filled').count(),1);
 assert.equal(await page.locator('[data-attribute=damage] .attribute-meter').getAttribute('aria-valuenow'),'1');
 await page.locator('[data-attribute="inv"]').scrollIntoViewIfNeeded();
 await page.setViewportSize({width:390,height:900});await page.screenshot({path:'tests/attribute-icons-bottom-390.png'});
 await page.reload();await page.waitForSelector('#lobby-nav:not([hidden])');await page.locator('#lobby-tab-character').click();
 assert.equal(await page.evaluate(()=>TalentRuntime.store.view().levels.damage),1);
 await page.locator('#skill-reset').click();
 assert.equal(await page.evaluate(()=>(TalentRuntime.store.view().levels.damage||0)),0);
 assert.equal(await page.evaluate(()=>TalentRuntime.store.view().balance),1000);
 await page.locator('[data-skill="rate"][data-change="1"]').click();await page.waitForFunction(()=>TalentRuntime.store.view().levels.rate===1);
 await page.locator('#skill-reset').click();assert.equal(await page.evaluate(()=>TalentRuntime.store.view().balance),1000);
 await page.reload();await page.waitForSelector('#lobby-nav:not([hidden])');
 assert.equal(await page.evaluate(()=>Object.values(TalentRuntime.store.view().levels).reduce((a,b)=>a+b,0)),0);
 assert.deepEqual(errors,[]);console.log('13 original mappings, runtime 24px Canvas sampling at 48px, 320/390/1280 layouts, automatic upgrade and reset persistence across reload, zero resource/page errors passed');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});

const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))errors.push(r.url());});
 await page.goto('http://127.0.0.1:4173/');await page.waitForSelector('#lobby-nav:not([hidden])');
 await page.evaluate(()=>TalentRuntime.store.credit(1000,{skill0:60}));
 await page.locator('#lobby-tab-character').click();

 const card=id=>page.locator('[data-attribute="'+id+'"]');
 const cards=page.locator('button.attribute-tree-card');
 const buy=page.locator('#attribute-train');
 assert.equal(await cards.count(),6);
 assert.equal(await page.locator('.attribute-tree path').count(),5);
 assert.equal(await page.locator('.attribute-unknown').count(),0);
 assert.equal(await card('rate').count(),0);
 const field=page.locator('#skill-list');
 const view=()=>field.locator('.attribute-tree').evaluate(el=>el.style.transform);
 assert.equal(await field.evaluate(el=>getComputedStyle(el).backgroundSize),'24px 24px, 24px 24px');
 await page.locator('#attribute-center').click();
 const centered=await view(), box=await field.locator('[data-attribute=damage]').boundingBox();
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
 await page.mouse.down();
 await page.mouse.move(box.x+200,box.y+220,{steps:8});
 await page.mouse.up();
 const moved=await view();
 assert.notEqual(moved,centered);
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('hell-elevator-attribute-view-v1')));
 assert(saved.x>88&&saved.x<=120);
 assert(saved.y>=92&&saved.y<150);
 assert.equal(await field.evaluate(el=>el.style.backgroundPosition),`${saved.x}px ${saved.y}px`);
 assert.equal(saved.selected,'core');
 assert.equal(await page.evaluate(()=>getSelection().toString()),'');
 await page.locator('#lobby-tab-research').click();
 await page.locator('#lobby-tab-character').click();
 assert.equal(await view(),moved);
 await page.reload();await page.locator('#lobby-tab-character').click();
 assert.equal(await view(),moved);
 await page.locator('#attribute-center').click();
 assert.equal(await view(),centered);
 assert.equal(await field.evaluate(el=>el.style.backgroundPosition),'0px 0px');
 const preview=page.locator('#attribute-preview');
 assert.equal(await preview.textContent(),'⬡');
 const fieldHeight=await field.evaluate(el=>el.clientHeight);
 await card('damage').click();
 assert.equal(await field.evaluate(el=>el.clientHeight),fieldHeight);
 assert.equal(await view(),centered);
 assert.equal(await card('damage').getAttribute('aria-pressed'),'true');
 assert.equal(await preview.locator('img').getAttribute('src'),await card('damage').locator('img').getAttribute('src'));
 const selectedArt=card('damage').locator('.research-card-art');
 assert.equal(await selectedArt.evaluate(el=>getComputedStyle(el).animationName),'none');
 assert.equal(await card('damage').evaluate(el=>getComputedStyle(el,'::after').animationName),'attribute-selection-shine');
 assert.match(await card('damage').evaluate(el=>getComputedStyle(el,'::after').clipPath),/^polygon\(evenodd,/);
 await page.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await card('damage').evaluate(el=>getComputedStyle(el,'::after').animationName),'none');
 assert.equal(await card('damage').evaluate(el=>getComputedStyle(el,'::after').backgroundColor),'rgb(255, 226, 149)');
 await page.emulateMedia({reducedMotion:'no-preference'});
 await card('spread').click();
 assert.equal(await card('damage').getAttribute('aria-pressed'),'false');
 assert.equal(await preview.locator('img').getAttribute('src'),await card('spread').locator('img').getAttribute('src'));
 await card('damage').click();
 const detail=page.locator('#attribute-detail');
 const prices=detail.locator('.attribute-prices');
 assert.match(await prices.locator('summary').textContent(),/3,750 分/);
 await prices.locator('summary').click();
 assert.deepEqual(await prices.locator('li b').allTextContents(),[
  '25 分 + 低级 ×3','50 分 + 低级 ×3','125 分 + 低级 ×3','175 分 + 低级 ×3',
  '275 分 + 中级 ×2','550 分 + 中级 ×2','975 分 + 中级 ×2','1,300 分 + 中级 ×2',
  '3,000 分 + 高级 ×1','3,750 分 + 高级 ×1',
 ]);
 await prices.locator('summary').click();
 assert(await detail.evaluate(el=>{
  el.lastElementChild.textContent=el.lastElementChild.textContent.repeat(30);
  return el.scrollHeight>el.clientHeight;
 }));
 assert.equal(await field.evaluate(el=>el.clientHeight),fieldHeight);
 assert.equal(await view(),centered);
 assert.match(await page.locator('#attribute-detail .attribute-current').textContent(),/→/);
 await buy.click();await page.waitForFunction(()=>TalentRuntime.store.view().levels.damage===1);
 assert.equal(await cards.count(),8);
 assert.equal(await card('rate').count(),1);
 assert.equal(await card('blast').count(),0);
 assert.equal(await page.locator('.attribute-tree path').count(),7);
 assert.equal(await page.locator('.attribute-unknown').count(),0);
 assert.equal(await card('damage').getAttribute('aria-label'),'伤害加成，1 / 10 级');
 await page.reload();await page.locator('#lobby-tab-character').click();
 assert.equal(await cards.count(),8);
 await page.locator('#skill-reset').click();
 await page.waitForFunction(()=>TalentRuntime.store.view().balance===1000);
 assert.equal(await cards.count(),6);
 // A legacy save may contain any attribute with no investments on its branch.
 await page.evaluate(()=>{const store=TalentRuntime.store,draft=store.draft();for(const s of TalentRuntime.catalog)store.change(draft,s.id,1);store.save(draft);});
 await page.reload();await page.locator('#lobby-tab-character').click();
 assert.equal(await cards.count(),16);
 for(const id of await cards.evaluateAll(nodes=>nodes.map(node=>node.dataset.attribute).filter(id=>id!=='core'))){
  assert((await card(id).locator('img').getAttribute('src')).endsWith('/'+({critDamage:'crit_damage',pointYield:'pickup',reinforcements:'spread'}[id]||id)+'-32.png'));
 }
 assert(await field.locator('.attribute-icon img').evaluateAll(async images=>{
  await Promise.all(images.map(image=>image.decode()));
  return images.length===15&&images.every(image=>image.naturalWidth===32&&image.naturalHeight===32
   &&image.clientWidth===32&&image.clientHeight===32&&getComputedStyle(image).imageRendering==='pixelated');
 }));
 await card('damage').click();
 for(const width of [320,390,1280]){
  await page.setViewportSize({width,height:900});
  await page.waitForFunction(()=>document.querySelector('#skill-list svg').viewBox.baseVal.width===document.querySelector('#skill-list').clientWidth);
  const paths=field.locator('svg path');
  assert.equal(await paths.count(),15);
  assert(await paths.evaluateAll(paths=>paths.every(path=>{
   const points=path.getAttribute('d').match(/-?[\d.]+/g).map(Number);
   for(let i=2;i<points.length;i+=2){
    const dx=Math.abs(points[i]-points[i-2]),dy=Math.abs(points[i+1]-points[i-1]);
    if(dx>1e-6&&dy>1e-6&&Math.abs(dx-dy)>1e-6)return false;
   }
   return true;
  })));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert(await preview.evaluate(el=>{
   const icon=el.getBoundingClientRect(),copy=el.nextElementSibling.getBoundingClientRect();
   const action=el.nextElementSibling.nextElementSibling.getBoundingClientRect();
   return icon.right<=copy.left&&copy.right<=action.left&&copy.width>100;
  }));
  assert(await cards.evaluateAll(nodes=>{
   const board=nodes[0].parentElement.getBoundingClientRect(),boxes=nodes.map(node=>node.getBoundingClientRect());
   return boxes.every((a,i)=>a.left>=board.left && a.right<=board.right && boxes.slice(i+1).every(b=>a.right<=b.left||b.right<=a.left||a.bottom<=b.top||b.bottom<=a.top));
  }));
  assert.equal(await card('damage').evaluate(node=>getComputedStyle(node).backgroundColor),'rgb(81, 64, 140)');
 }
 await page.locator('#skill-reset').click();assert.equal(await page.evaluate(()=>TalentRuntime.store.view().balance),1000);
 assert.deepEqual(errors,[]);console.log('Attribute tree: reveal, persistence, refunds, all 15 pixel icons, shared card styling, and 320/390/1280 layouts passed');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

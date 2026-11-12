const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');

(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true,ignoreDefaultArgs:['--hide-scrollbars']});
 try{
  for(const [width,height] of [[320,568],[390,844],[1280,900]]){
   const page=await browser.newPage({viewport:{width,height},hasTouch:true}),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto(process.env.STAGE_LOOT_TEST_URL||'http://127.0.0.1:4173/');
   await page.waitForFunction(()=>HexMap.ready&&globalThis.Chips&&globalThis.TalentRuntime);
   const {before,after}=await page.evaluate(()=>{
    window.requestAnimationFrame=()=>0;
    reset();ElectricEditor.reset();RoomReady.cancel();state='combat';activeDifficulty=1;
    const {chipId}=Chips.drop(1),runtime=TalentRuntime;
    runtime.startStage();runtime.settleStage();
    const before=runtime.summary().materials;
    for(let i=0;i<24;i++)runLoot.push({chipId,tier:1});
    floor=2;resetStageStats();runtime.startStage();
    enemies=[];spawnQueue=[];stageStats.plannedTotal=12;stageStats.earned=77;
    for(const tier of [2,3])collectEnemyChest({item:{chipId,tier,affixes:[]}});
    window.lootChimes=0;
    const chime=playChime;playChime=(...args)=>{lootChimes++;chime(...args);};
    beginStageClear();draw();
    return {before,after:runtime.summary().materials};
   });
   const cards=page.locator('#result-loot .result-loot-item'),bag=page.locator('.result-loot-scroll');
   const initialCount=24+Object.keys(before).length,material=page.locator('#result-loot [data-material-id=skill0] .material-count');
   assert(before.skill0>0&&after.skill0>before.skill0);
   assert.equal(await cards.count(),initialCount);
   assert.equal(await material.textContent(),'×'+before.skill0);
   const bagHeight=await bag.evaluate(e=>{
    const height=e.clientHeight,list=e.firstElementChild,items=[...list.children];
    list.replaceChildren();
    const emptyHeight=e.clientHeight;
    list.replaceChildren(...items);
    if(emptyHeight!==height)throw Error('The backpack height depends on how many slots are occupied');
    return height;
   });
   assert.equal(await page.locator('.result-loot-pop').count(),0);
   await page.evaluate(()=>updateStageClear(1.12));
   assert.equal(await page.locator('#result-cash').textContent(),'77');
   assert.equal(await cards.count(),initialCount);
   assert.equal(await page.evaluate(()=>lootChimes),0);
   await page.touchscreen.tap(12,20);
   assert.equal(await page.evaluate(()=>state),'stageClear');
   await page.evaluate(()=>updateStageClear(.12));
   assert.equal(await cards.count(),initialCount+1);
   assert.equal(await cards.first().getAttribute('data-item-tier'),'2');
   assert.equal(await page.locator('.result-loot-pop .result-loot-sparks i').count(),12);
   assert.equal(await page.evaluate(()=>lootChimes),1);
   await page.evaluate(()=>{paused=true;updateStageClear(50);paused=false;});
   assert.equal(await cards.count(),initialCount+1);
   await bag.evaluate(e=>{e.scrollTop=e.scrollHeight;});
   await page.evaluate(()=>updateStageClear(5));
   assert.equal(await cards.count(),initialCount+2,'long frames still reveal one item at a time');
   assert.equal(await cards.nth(0).getAttribute('data-item-tier'),'3');
   assert.equal(await cards.nth(1).getAttribute('data-item-tier'),'2');
   assert.equal(await bag.evaluate(e=>e.scrollTop),0,'the new first slot is visible even after scrolling down');
   await page.evaluate(()=>updateStageClear(.41));
   assert.equal(await cards.count(),initialCount+2,'stacked material updates its existing slot');
   assert.equal(await material.textContent(),'×'+after.skill0);
   assert.equal(await cards.first().getAttribute('data-item-tier'),'3','a stack update leaves the original slot in place');
   await page.evaluate(()=>{for(let i=0;i<8;i++)updateStageClear(.41);});
   assert.equal(await page.evaluate(()=>lootChimes),2+Object.keys(after).filter(id=>after[id]>(before[id]||0)).length,'one chime per chip or material type gained');
   assert.equal(await page.evaluate(()=>stageSettlement.ready),true);

   const {x,y,width:bw,height:bh}=await bag.boundingBox(),panel=await page.locator('#result-loot').boundingBox();
   assert(x>=panel.x&&x+bw<=panel.x+panel.width&&y>=panel.y&&y+bh<=panel.y+panel.height);
   const content=await page.locator('.result-content').boundingBox();
   assert(content.y>=0&&content.y+content.height<=height);
   assert(await bag.evaluate(e=>e.scrollHeight>e.clientHeight&&e.scrollWidth===e.clientWidth));
   assert.equal(await bag.evaluate(e=>e.clientHeight),bagHeight);
   const row=await bag.evaluate(e=>{
    const list=e.firstElementChild,first=list.firstElementChild;
    const cards=[...list.children].filter(card=>card.offsetTop===first.offsetTop);
    const right=cards.at(-1).getBoundingClientRect().right;
    return {columns:cards.length,rightPadding:list.getBoundingClientRect().right-right};
   });
   assert(row.columns>=4&&row.rightPadding<=9,'first row fills the available grid width before wrapping');
   await bag.evaluate(e=>{e.scrollTop=0;});
   const cdp=await page.context().newCDPSession(page);
   const touch=(type,offset)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x:x+bw/3,y:y+bh-10-offset}]});
   await touch('touchStart',0);
   for(let d=10;d<=70;d+=10)await touch('touchMove',d);
   await touch('touchEnd',0);
   await page.waitForFunction(()=>document.querySelector('.result-loot-scroll').scrollTop>0);
   await page.touchscreen.tap(x+bw/3,y+20);
   assert.equal(await page.evaluate(()=>state),'stageClear','tapping a slot does not leave the bag');
   await bag.evaluate(e=>{e.scrollTop=0;});
   if(process.env.STAGE_LOOT_SCREENSHOT&&width===390)await page.screenshot({path:process.env.STAGE_LOOT_SCREENSHOT});
   await page.touchscreen.tap(12,20);
   assert.equal(await page.evaluate(()=>state),'upgrade');
   const settledOrder=await cards.evaluateAll(els=>els.map(e=>e.getAttribute('aria-label')));
   await page.evaluate(()=>{resetStageStats();stageSettlement={};prepareStageLoot();});
   assert.deepEqual(await cards.evaluateAll(els=>els.map(e=>e.getAttribute('aria-label'))),settledOrder);
   assert.deepEqual(errors,[]);
   await page.close();
  }
  console.log('Stage loot: existing cards, cash first, sequential cards and material stacks, one chime each, contained touch scrolling and continue passed');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:320,height:760}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(process.env.CHIP_TEST_URL||'http://127.0.0.1:4173/');
  await page.locator('#lobby-nav:not([hidden])').waitFor();
  await page.locator('#lobby-tab-research').click();
  assert.equal(await page.locator('[data-chip]').count(),0);
  assert.equal(await page.locator('[data-chip-slot] .chip-icon').count(),0);
  assert.equal(await page.locator('.chip-detail .chip-icon').count(),0);
  assert.equal(await page.locator('#chip-action').count(),0);
  assert(await page.locator('.chip-library-empty').isVisible());
  await page.evaluate(()=>{
   const check=(ok,message)=>{if(!ok)throw Error(message);};
   function load(chipIds,tier=1,affixes=[{id:'pickup',value:10}]){
    Chips.view().forEach((id,index)=>{if(id)Chips.equip(index,id);});
    chipIds.forEach((chipId,index)=>{
     check(Chips.acquire({chipId,tier,affixes:typeof affixes==='function'?affixes(index):affixes}),'obtain '+chipId);
     check(Chips.equip(index,Chips.inventory().at(-1).id),'equip '+chipId);
    });
    Chips.start();
   }
   reset();paused=true;state='combat';testMode=false;time=1;resetStageStats();
   const random=Math.random,originalChime=playChime,chimes=[];
   try{
    Math.random=()=>0;
    for(const [value,tier,count] of [[0,1,1],[.6,2,2],[.85,3,3],[.97,4,4],[.999,5,4]]){
     let next=0;
     Math.random=()=>[0,value][next++]??0;
     const item=Chips.drop(5);
     check(item.tier===tier&&item.affixes.length===count&&new Set(item.affixes.map(a=>a.id)).size===count,'unique tier '+tier);
     if(tier===5)check(item.affixes.some(a=>['damage','rate','crit','critDamage'].includes(a.id)),'legendary guarantees output');
    }
    for(let difficulty=1;difficulty<=5;difficulty++){
     for(let i=0;i<1000;i++){
      let next=0;
      Math.random=()=>[0,i/1000][next++]??0;
      check(Chips.drop(difficulty).tier<=difficulty,'difficulty caps tier '+difficulty);
     }
     let next=0;
     Math.random=()=>[0,.999][next++]??0;
     check(Chips.drop(difficulty).tier===difficulty,'top tier is reachable '+difficulty);
    }
    for(let i=0;i<100;i++){
     let next=0;
     Math.random=()=>next++===0?i/100:0;
     check(Chips.byId.get(Chips.drop().chipId).type!=='近战','melee excluded from drops');
    }
    Math.random=()=>0;
    playChime=(...args)=>{chimes.push(args);originalChime(...args);};
    const victim={type:'eye',x:p.x,y:p.y,r:16,hp:0,max:10};
    Math.random=()=>.008;
    check(!tryDropEnemyChest(victim),'chip probability cutoff');
    let randomIndex=0;
    Math.random=()=>[0,0,.999][randomIndex++]??0;
    activeDifficulty=1;
    check(tryDropEnemyChest(victim)&&!tryDropEnemyChest(victim),'at most one chip per stage');
    const [first]=enemyChests;
    check(first.item.tier===1&&first.tint===Chips.grade(first.item).color,'combat uses active difficulty and tier tint');
    Math.random=()=>0;
    updateEnemyChests(.2);
    check(first.age===0,'pause freezes the chip');
    paused=false;
    updateEnemyChests(.2);
    check(first.x>victim.x&&first.y>victim.y&&!first.homing,'point-blank drop launches before it can be picked up');
    const camera=renderer.mapCamera,priorX=camera.x,priorZ=camera.z;
    camera.x+=160;camera.z+=220;renderer.resize();
    const bounds=rainbowPickupBounds(first.height),viewport=renderer.canvas.getBoundingClientRect();
    const edge=renderer.screenPoint(bounds.centerX+bounds.halfWidth+bounds.widthSlope*(bounds.top-300)-325,first.height,(bounds.top-300)*1.06);
    const inset=RAINBOW_WALL_MARGIN*viewport.width/(2*renderer.halfX);
    check(Math.abs(edge.x-(viewport.width-inset))<1e-4&&Math.abs(edge.y-inset)<1e-4,'chip boundary follows the panned game canvas');
    camera.x=priorX;camera.z=priorZ;renderer.resize();
    const {centerX,halfWidth,widthSlope}=rainbowPickupBounds(first.height);
    first.x=centerX+halfWidth+widthSlope*(first.y-300)-2;
    updateEnemyChests(.6);
    check(first.vx<0&&!first.homing&&!stageStats.loot.length,'distant chips bounce instead of homing on a timer');
    p.x=first.x;p.y=first.y;
    updateEnemyChests(.01);
    check(first.homing&&!chimes.length,'entering pickup range starts homing');
    updateEnemyChests(.2);
    check(first.collected&&stageStats.loot.length===1&&chimes.length===1,'absorption collects and plays one chime');
    check(Chips.inventory().length===0,'chip waits for settlement');
    settleChipLoot();settleChipLoot();
    resetStageStats();
    stageSettlement={};prepareStageLoot();
    check(document.querySelector('#result-loot .result-loot-heading').textContent.includes('本局战利品 1 件'),'a floor with no new loot still shows the first pickup');
    check(tryDropEnemyChest(victim),'next stage can drop the same chip');
    const [second]=enemyChests;
    state='stageClear';
    updateEnemyChests(2);
    check(second.collected&&stageStats.loot.length===1&&chimes.length===2,'clearing the stage attracts the remaining chip');
    updateEnemyChests(2);
    check(chimes.length===2,'collected chips cannot replay the chime');
    check(Chips.inventory().length===1,'next chip waits for its own settlement');
    settleChipLoot();settleChipLoot();
    const copies=Chips.inventory();
    check(copies.length===2&&copies.every(item=>item.chipId==='repeat')&&copies[0].id!==copies[1].id,'settlement creates two independent copies once');
    prepareStageLoot();
    check(document.querySelectorAll('#result-loot .result-loot-item').length===1,'the previous chip is visible before the reveal');
    revealStageLoot(RESULT_LOOT_START);
    const loot=document.querySelectorAll('#result-loot .result-loot-item');
    check(loot.length===2&&[...loot].every(card=>!card.textContent.trim()&&card.querySelector('.chip-icon')),'both floors appear as icon-only loot slots');
    check(loot[0].querySelector('.chip-icon').getAttribute('src').endsWith('/repeat-emblem-pixel.png'),'loot icon matches chip');
    check(loot[0].getAttribute('aria-label')==='普通 · '+Chips.byId.get('repeat').name,'loot identifies chip and quality');
    const result=document.querySelector('#stage-clear'),display=result.style.display;
    result.style.display='flex';
    for(const card of loot){
     const {width,height}=card.getBoundingClientRect();
     check(width>0&&Math.abs(width-height)<1,'loot slots are square');
    }
    result.style.display=display;
    state='combat';resetStageStats();activeDifficulty=5;randomIndex=0;
    Math.random=()=>[0,0,.999][randomIndex++]??0;
    check(tryDropEnemyChest(victim)&&enemyChests[0].item.tier===5,'hardest run can drop legendary');
    check(enemyChests[0].tint!==first.tint,'legendary uses its own tint');
    Math.random=()=>0;resetStageStats();
    check(!tryDropEnemyChest(victim),'run cap survives stage reset');
    reset();resetStageStats();state='combat';
    stageSettlement={};prepareStageLoot();
    check(document.querySelector('#result-loot').hidden,'a new run starts with no loot');
    check(tryDropEnemyChest(victim),'new run resets the chip cap');
    paused=true;
    check(!Chips.equip(0,'toString'),'reject unknown chip');
    load(['large','guide']);state='combat';shots=[];
    const gun=createWeapon('shotgun');emitWeaponShots(gun,0,p);
    check(shots.every(s=>s.chipSize===1.1&&Math.abs(s.damage-gun.damage*1.1)<1e-8),'size and damage');
    enemies=[{type:'eye',x:p.x+200,y:p.y+20,hp:10,r:10}];missiles=[];
    const shot=shots[0],angle=Math.atan2(shot.vy,shot.vx),speed=Math.hypot(shot.vx,shot.vy);
    Chips.guide(shot,.06);
    check(Math.abs(Math.atan2(shot.vy,shot.vx)-angle)<=Math.PI*8/180+1e-8,'guidance limit');
    check(Math.abs(Math.hypot(shot.vx,shot.vy)-speed)<1e-8,'guidance retains speed');
    check(!Chips.acquire('counter'),'melee chips cannot enter inventory');
    const target={type:'eye',x:p.x+40,y:p.y,hp:100,r:12};
    load(['fuse','firstBomb','aftershock']);
    check(Math.abs(Chips.bombCooldown(15,true)-12.15)<1e-8,'first bomb');
    check(Math.abs(Chips.bombCooldown(15,true)-13.5)<1e-8,'first bomb once per run');
    shots=[];explodeFriendlyRocket({source:'bomb',weaponId:'tile-missile',x:p.x,y:p.y,damage:3,blastRadius:100},[target]);
    check(shots[0].chipAftershock,'bomb explosion tag');
    Chips.onHit(shots[0],target);
    check(Specializations.factor(target)===.9,'actual slow factor');
    function loadPowers(ids){
     load(['starter','radius','power'].slice(0,ids.length),5,index=>[
      {id:'damage',value:20},{id:'rate',value:20},{id:'crit',value:20},{id:ids[index]}
     ]);
    }
    loadPowers(['heart','shield','revive']);reset();paused=true;state='combat';time=10;
    check(weapon.itemId==='rifle_t2'&&p.hp===4&&p.max===4&&p.shield===1,'higher starter tier and opening bonuses');
    check(Math.abs(attackSpeedMultiplier()-1.6)<1e-8,'same ordinary affix stacks across different chips');
    const hit=resolveShotDamage({source:'weapon',critChance:0,critMultiplier:2},10,target);
    check(hit.critical&&Math.abs(hit.damage-32)<1e-8,'ordinary damage and crit feed actual hit resolution');
    p.hp=1;p.shield=0;hurt();
    check(state==='combat'&&p.hp===1&&p.inv>=2,'lethal damage revives once');
    p.inv=0;hurt();
    check(state==='dead','second lethal hit ends run');

    loadPowers(['pulse','repel','bonus']);reset();paused=true;state='combat';time=10;
    enemies=[target];target.x=p.x+30;target.y=p.y;
    p.shield=1;hurt();
    check(target.starterKick?.x===160&&Chips.floorBonus()===10,'break shield repels and keeps no-health-loss eligibility');
    delete target.starterKick;p.inv=0;p.shield=1;hurt();
    check(!target.starterKick,'repel once per floor');
    Chips.startFloor();p.inv=0;p.shield=1;hurt();
    check(target.starterKick?.x===160,'repel resets on next floor');
    const near={x:p.x+50,y:p.y,life:1,r:2},far={x:p.x+180,y:p.y,life:1,r:2};
    bullets=[near,far];p.inv=0;p.hp=2;hurt();
    check(p.hp===1&&bullets.length===1&&bullets[0]===far&&Chips.floorBonus()===0,'pulse and lost no-hit eligibility');
    p.hp=2;p.inv=0;bullets=[near];hurt();
    check(bullets.length===1,'pulse once per run');
    Chips.startFloor();resetStageStats();state='combat';paused=false;cash=0;
    beginStageClear();updateStageClear(3);
    check(cash===10&&stageStats.earned===10,'settlement awards no-hit gold once');
    updateStageClear(3);
    check(cash===10,'settlement cannot award twice');

    loadPowers(['coupon','bombRate','droneMark']);reset();paused=false;state='combat';time=10;
    enemies=[target];target.x=p.x+30;target.y=p.y;target.hp=100;
    check(ElectricTiles.activateEquipmentBomb(createBomb('freeze_bomb'))&&Chips.weaponRate()===1.12,'freeze bomb hits trigger weapon buff');
    time=13;Chips.onHit({source:'bomb'},target);
    check(Chips.weaponRate()===1,'bomb buff expires and has cooldown');
    time=22;Chips.onHit({source:'bomb'},target);
    check(Chips.weaponRate()===1.12,'bomb buff can trigger after cooldown');
    Chips.onHit({source:'drone'},target);
    const shotForMark={source:'weapon'},marked=Chips.damage(shotForMark,10,target);
    Chips.onHit(shotForMark,target);
    check(marked===18.4&&Chips.damage(shotForMark,10,target)===16,'drone mark empowers exactly one main weapon hit');
    state='upgrade';terrainView='equipment';pendingEquipment=null;cash=0;rollShop();
    check(shopRerollCost()===0&&rerollShop()&&cash===0&&shopRerollCost()>0&&!rerollShop(),'free shop refresh once per run');
    paused=true;
    load(['mountDamage','mountRate','mountMove']);shoes=createShoes('smallplane');
    check(Chips.damage({source:'mount'},10,target)===11,'mount damage');
    check(Math.abs(Chips.mountRate()-1/.9)<1e-8,'mount rate');
    const move=movementSpeed();Chips.start(false);
    check(Math.abs(move/movementSpeed()-1.1)<1e-8,'mount movement');
   }finally{Math.random=random;playChime=originalChime;}
  });
  await page.reload();await page.locator('#lobby-tab-research').click();
  const equippedTypes=()=>page.evaluate(()=>Chips.view().map(id=>Chips.inventory().find(item=>item.id===id)?.chipId??null));
  assert.deepEqual(await equippedTypes(),['mountDamage','mountRate','mountMove']);
  const copies=await page.evaluate(()=>Chips.inventory().filter(item=>item.chipId==='repeat'));
  assert.equal(copies.length,2);
  const cards=page.getByRole('button',{name:/^复击回路 #/});
  assert.equal(await cards.count(),2);
  const icons=cards.locator('.chip-icon');
  await icons.evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
  assert(await icons.evaluateAll(images=>images.every(image=>
   image.naturalWidth===28&&image.naturalHeight===28&&getComputedStyle(image).imageRendering==='pixelated'
  )));
  assert(await cards.first().evaluate(card=>{
   const core=card.querySelector('.chip-core'),label=card.querySelector('strong');
   const art=core.getBoundingClientRect();
   return card.children.length===2&&Math.abs(art.width-art.height)<1
    &&getComputedStyle(card).clipPath.startsWith('polygon(')
    &&getComputedStyle(card,'::before').backgroundImage==='none'
    &&getComputedStyle(core).backgroundImage.startsWith('linear-gradient(')
    &&getComputedStyle(label).backgroundColor==='rgb(251, 249, 246)';
  }));
  const legendary=page.getByRole('button',{name:/^备用武装.*传说/}).first();
  const detailIcon=page.locator('.chip-detail .chip-icon');
  const coreBackground=parent=>parent.locator('.chip-core').evaluate(core=>getComputedStyle(core).backgroundImage);
  const detail=page.locator('.chip-detail');
  const commonBackground=await coreBackground(cards.first());
  const legendaryBackground=await coreBackground(legendary);
  assert.notEqual(commonBackground,legendaryBackground);
  await legendary.click();
  assert.equal(await detailIcon.getAttribute('src'),await legendary.locator('.chip-icon').getAttribute('src'));
  assert.equal(await coreBackground(detail),legendaryBackground);
  assert.match(await page.locator('.chip-detail p').textContent(),/2 阶/);
  assert.equal(await page.locator('.chip-affixes li').count(),4);
  await cards.first().click();
  assert.equal(await detailIcon.getAttribute('src'),await icons.first().getAttribute('src'));
  assert.equal(await coreBackground(detail),commonBackground);
  await page.locator('#chip-action').click();
  assert.equal((await page.evaluate(()=>Chips.view()))[0],copies[0].id);
  assert.equal(await coreBackground(page.locator('[data-chip-slot="0"]')),commonBackground);
  await page.locator('[data-chip-slot="1"]').click();
  await cards.nth(1).click();
  assert(await page.locator('#chip-action').isDisabled());
  assert.equal(await page.evaluate(id=>Chips.equip(1,id),copies[1].id),false);
  await page.locator('[data-chip-slot="0"]').click();
  await cards.nth(1).click();
  await page.locator('#chip-action').click();
  assert.equal((await page.evaluate(()=>Chips.view()))[0],copies[1].id);
  await page.reload();await page.locator('#lobby-tab-research').click();
  assert.equal((await page.evaluate(()=>Chips.view()))[0],copies[1].id);
  assert.equal(await cards.count(),2);
  await page.evaluate(()=>localStorage.setItem('hell-elevator-chips-v1',JSON.stringify({
   version:2,slots:['repeat','edge','starter'],inventory:{repeat:3,starter:1,guide:2,edge:2}
  })));
  await page.reload();await page.locator('#lobby-tab-research').click();
  assert.deepEqual(await equippedTypes(),['repeat',null,'starter']);
  assert.equal(await cards.count(),3);
  assert.equal(await page.locator('[data-chip]').count(),6);
  assert.equal(await page.getByRole('button',{name:/淬火刃口/}).count(),0);
  await page.locator('[data-chip-slot="0"]').click();
  await page.locator('#chip-action').click();
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('hell-elevator-chips-v1')).inventory.filter(i=>i.chipId==='edge').length),2);
  await page.evaluate(()=>localStorage.setItem('hell-elevator-chips-v1',JSON.stringify(['repeat','repeat','starter'])));
  await page.reload();await page.locator('#lobby-tab-research').click();
  assert.deepEqual(await equippedTypes(),['repeat',null,'starter']);
  assert.equal(await page.locator('[data-chip-slot] .chip-icon').count(),2);
  assert.equal(await cards.count(),1);
  assert.equal(await page.locator('[data-chip]').count(),2);
  for(const width of [320,390,1280]){
   await page.setViewportSize({width,height:844});
   assert(await page.evaluate(()=>{
    const library=document.querySelector('.chip-cards'),panel=document.querySelector('.chip-detail');
    const detail=panel.getBoundingClientRect(),icon=panel.querySelector('.chip-core').getBoundingClientRect();
    const copy=panel.querySelector('div').getBoundingClientRect(),action=panel.querySelector('button').getBoundingClientRect();
    const cards=[...document.querySelectorAll('.chip-page .chip-card')];
    const first=cards[0].getBoundingClientRect();
    return library.clientHeight>70&&getComputedStyle(library).overflowY==='auto'
     &&cards.every(card=>{
      const box=card.getBoundingClientRect();
      return Math.abs(box.width-first.width)<1&&Math.abs(box.height-first.height)<1;
     })
     &&detail.left<=icon.left&&icon.right<=copy.left&&copy.right<=action.left&&action.right<=detail.right
     &&detail.bottom<=document.querySelector('#viewport #lobby-nav').getBoundingClientRect().top;
   }));
  }
  assert.deepEqual(errors,[]);
  console.log('Chips: quality, unique affixes, melee exclusion, inventory, settlement, gun/bomb/mount effects, functions and UI passed');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

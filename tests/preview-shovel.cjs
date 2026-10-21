const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:900,height:900},deviceScaleFactor:2}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>typeof updateCashShovel==='function');
 const result=await page.evaluate(()=>{
  const check=(v,m)=>{if(!v)throw Error(m)},near=(a,b)=>Math.abs(a-b)<1e-7;
  function setup(){reset();state='combat';timedRoom={remaining:20};enemies=[];spawnQueue=[];p.inv=0;p.x=325;p.y=300;const t={x:1,y:0,cashTile:true,healProgress:0,medPack:false,healFlash:0};tiles.push(t);return t;}
  let t=setup();check(shovel.interval===.5&&shovel.power===2,'starter speed');
  updateHealing(.01);const y1=cashShovelPose(t).y;updateHealing(.01);check(cashShovelPose(t).y<y1&&y1<34,'immediate descent without hovering');t=setup();updateHealing(7.15);check(!t.medPack,'fifteenth hit still pending');updateHealing(.01);check(t.medPack&&terrainQueue(t)[0].amount===3,'starter pays after 15 hits at 7.16 seconds');t=setup();
  p.x-=3*TILE;updateHealing(8);terrainAdvanceProduction(t,3);check(!t.healProgress&&!t.shovelClock&&!t.shovelBonusWork,'distant tile paused');p.x=325;
  updateHealing(.15);check(t.healProgress===0&&cashShovelPose(t).y>-5&&!t.shovelImpactLeft,'no work or highlight before contact');updateHealing(.01);check(t.healProgress===2&&near(cashShovelPose(t).y,-5)&&t.shovelImpactLeft===.18,'ground contact triggers work and highlight');
  updateHealing(.10);check(t.healProgress===2&&cashShovelPose(t).y===-5&&cashShovelPose(t).opacity<1,'fade adds no work or lift');
  const frozen=JSON.stringify({clock:t.shovelClock,progress:t.healProgress});p.y+=4*TILE;updateHealing(9);check(JSON.stringify({clock:t.shovelClock,progress:t.healProgress})===frozen&&!cashShovelPose(t),'leave freezes attack');p.y=300;
  paused=true;updateHealing(9);check(t.healProgress===2,'pause');paused=false;updateHealing(.39);check(t.healProgress===2&&t.shovelImpactLeft===0,'between hits unchanged and highlight faded');updateHealing(.01);check(t.healProgress===4,'second hit');
  const work=t.healProgress;equipItem('shovel',createShovel('digger',5));check(shovel.interval===.25&&t.healProgress===work,'swap preserves work');
  t=setup();const hits=[];for(let i=0;i<200;i++){const before=t.healProgress;updateHealing(.01);if(t.healProgress!==before){check(t.healProgress===before+2,'discrete work');check(near(cashShovelPose(t).y,-5),'work matches ground contact');hits.push(Number(((i+1)*.01).toFixed(2)));}}check(hits.join(',')==='0.16,0.66,1.16,1.66','two hits per second');
  t=setup();equipItem('shovel',createShovel('digger',5));updateHealing(2);check(t.healProgress===16,'higher attack speed');
  t=setup();t.healProgress=28;updateHealing(.15);check(!t.medPack,'no early payout');updateHealing(.01);check(t.medPack&&terrainQueue(t).length===1&&cash===0,'final hit produces cash');check(cashShovelPose(t),'final stroke remains visible');updateHealing(.1);check(cashShovelPose(t).opacity<1,'final stroke fades');updateHealing(10);check(terrainQueue(t).length===1&&!cashShovelPose(t),'full storage stops attacks');p.x=325+TILE;updateHealing(.01);check(cash===3&&!t.medPack,'physical pickup');
  t=setup();terrainAdvanceProduction(t,3);check(t.healProgress===0,'shock waits for hit');updateHealing(.16);check(t.healProgress===5,'shock credited on contact');
  t=setup();campaignBoss=1;updateHealing(10);check(!t.healProgress&&!cashShovelPose(t),'boss restriction');campaignBoss=0;
  t=setup();equipItem('shoes',createShoes('catalyst',3));updateHealing(1);check(t.healProgress===6,'production boosts attack frequency');
  for(let tier=1;tier<=5;tier++)check(takeTestEquipment('shovel','digger',tier)&&shovel.tier===tier,'five lab tiers');
  state='upgrade';terrainView='equipment';shopLevel=3;cash=100;const u=equipmentShopItem('shovel');u.price=shopPrice(u);shopItems=[u];const wallet=cash;check(buyShopItem(0)&&confirmEquipmentPurchase()&&cash===wallet-u.price,'paid replacement');check(equipmentAttributeCard('shovel',shovel,'test').includes('攻速'),'speed shown');
  t=setup();updateHealing(.18);paused=true;time=1;phase=0;$('overlay').style.display='none';$('equipment-test').hidden=true;$('toast').style.display='none';renderer.sceneKey=null;draw();
  const meshes=[...renderer.residentMeshes.entries()].filter(([k,m])=>k.startsWith('terrain:vertical-shovel:')&&m.count);check(meshes.length===1,'one shovel instance');const model=meshes[0][1].instances;check(model[0]===1.25&&model[5]===1.25&&model[10]===1.25,'shovel model enlarged by 25 percent');check(near(model[7]-2*model[5],cashShovelPose(t).y-2),'enlarged blade retains ground contact height');
  return {hits,progress:t.healProgress,remaining:supplyTime(t)-t.healProgress,pose:cashShovelPose(t),glError:renderer.gl.getError()};
 });
 assert.equal(result.glError,0);assert.deepEqual(errors,[]);await page.screenshot({path:'tests/shovel-inserted-full.png'});await page.screenshot({path:'tests/shovel-inserted-close.png',clip:{x:395,y:350,width:155,height:165}});
 for(const [width,height] of [[390,844],[390,680],[1280,900]]){await page.setViewportSize({width,height});await page.evaluate(()=>{renderer.resize();draw()});assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);}
 console.log('Shovel attacks: contact-only stepped work, repeat speed, planted fade, final-hit payout, range/pause, bonuses, shop, tiers, boss and real WebGL passed',JSON.stringify(result));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});

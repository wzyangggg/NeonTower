const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>window.HexMap?.ready&&window.ElectricEditor);
 const report=await page.evaluate(async()=>{
  sound=true;unlockAudio();await audio.resume();await Promise.all(['tilePlacement'].map(loadGunSound));reset();paused=true;state='upgrade';terrainView='equipment';cash=99999;
  const stop=()=>{for(const v of [...starterShotVoices]){v.stop();starterShotVoices.delete(v);}};
  const prepare=()=>{shopItems=[equipmentShopItem('weapon')];shopItems[0].price=1;pendingEquipment=null;buyShopItem(0);};
  const variants=[];for(const value of [.1,.9]){prepare();stop();const original=Math.random;try{Math.random=()=>value;confirmEquipmentPurchase();}finally{Math.random=original;}const voices=[...starterShotVoices].filter(v=>v.sampleKind==='equipment');variants.push(voices.length===1&&voices[0].buffer===gunSoundBuffers.get('tilePlacement'));stop();if(confirmEquipmentPurchase()||starterShotVoices.size)throw Error('duplicate confirmation');}
  prepare();stop();cancelEquipmentPurchase();const cancelled=starterShotVoices.size===0;
  prepare();stop();sound=false;confirmEquipmentPurchase();const muted=starterShotVoices.size===0;sound=true;
  if(GUN_SAMPLE_URLS.tilePlacement!=='assets/audio/equipment-build-shotgun-reload1.wav')throw Error('wrong shared sample');return {variants,cancelled,muted,durations:['tilePlacement'].map(id=>gunSoundBuffers.get(id).duration)};
 });assert.ok(report.variants.every(Boolean)&&report.cancelled&&report.muted);assert.deepEqual(errors,[]);console.log('Shop equipment confirmation audio passed',report);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});

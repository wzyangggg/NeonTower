const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/');await page.waitForSelector('#lobby-nav:not([hidden])');
 assert.equal(await page.evaluate(()=>music.active),true);
 // Supply real local tracks only inside this test; production album slots remain user-configurable.
 await page.evaluate(()=>{DIFFICULTIES[0].bgm.src='audio/normal-theme.mp3';DIFFICULTIES[1].bgm.src='audio/relentless-minor.mp3';syncMusic();});
 await page.locator('#lobby-tab-battle').click();await page.waitForFunction(()=>!music.media.paused&&music.media.currentTime>0&&music.track==='difficulty-1');
 await page.locator('[data-difficulty-step="1"]').click();await page.waitForFunction(()=>music.track==='difficulty-2'&&!music.media.paused&&music.media.currentTime>0);
 await page.locator('#lobby-tab-research').click();assert.equal(await page.evaluate(()=>music.track),'difficulty-2');assert.equal(await page.evaluate(()=>music.media.paused),false);
 await page.locator('#lobby-tab-battle').click();await page.locator('[data-difficulty-step="-1"]').click();await page.waitForFunction(()=>music.track==='difficulty-1'&&!music.media.paused);
 await page.waitForFunction(()=>music.media.readyState>=2&&music.media.currentTime>0);
 const before=await page.evaluate(()=>({time:music.media.currentTime,revision:music.playbackRevision,src:music.media.src}));await page.locator('#start').click();assert.equal(await page.evaluate(()=>music.track),'difficulty-1');
 const after=await page.evaluate(()=>({time:music.media.currentTime,revision:music.playbackRevision,src:music.media.src}));assert.equal(after.src,before.src);assert(after.time>=before.time,JSON.stringify({before,after}));
 await page.evaluate(()=>{paused=true;syncMusic();});assert.equal(await page.evaluate(()=>music.media.paused),true);
 await page.evaluate(()=>returnToMainMenu());await page.waitForFunction(()=>music.active&&!music.media.paused);assert.equal(await page.evaluate(()=>music.track),'difficulty-1');
 await page.evaluate(()=>{sound=false;syncMusic();});assert.equal(await page.evaluate(()=>music.media.paused),true);
 await page.evaluate(()=>{sound=true;syncMusic();});await page.waitForFunction(()=>!music.media.paused);
 await page.evaluate(()=>window.dispatchEvent(new Event('blur')));assert.equal(await page.evaluate(()=>music.media.paused),true);
 await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await page.waitForFunction(()=>!music.media.paused);
 await page.evaluate(()=>{DIFFICULTIES[0].bgm.src=null;syncMusic();});assert.equal(await page.evaluate(()=>music.track),'boss');await page.waitForFunction(()=>!music.media.paused);
 assert.deepEqual(errors,[]);console.log('Menu music real Edge: gesture unlock, selected album switching, research continuity, battle continuity, pause/home, mute, blur/focus and unconfigured fallback passed');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});

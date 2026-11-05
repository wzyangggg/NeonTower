const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const [width,height] of [[390,844],[320,568],[390,680],[1280,900]]){
await page.setViewportSize({width,height});await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>HexMap.ready);await page.evaluate(()=>{reset();ElectricEditor.reset();RoomReady.cancel();state='survival';survivalRemaining=1000;paused=false;togglePause();});await page.waitForTimeout(300);
assert(await page.locator('#pause-panel').isVisible());const bounds=await page.locator('.pause-card').boundingBox();assert(bounds.x>=0&&bounds.x+bounds.width<=width&&bounds.y>=0&&bounds.y+bounds.height<=height);
const before=await page.evaluate(()=>time);await page.locator('#pause-volume').fill('37');assert.equal(await page.evaluate(()=>masterVolume),.37);assert.equal(await page.locator('#pause-volume-value').textContent(),'37%');await page.waitForTimeout(120);assert.equal(await page.evaluate(()=>time),before);
await page.locator('#pause-sound').click();assert.equal(await page.evaluate(()=>sound),false);assert.equal(await page.locator('#pause-sound').getAttribute('aria-pressed'),'true');await page.locator('#pause-volume').fill('42');assert.equal(await page.evaluate(()=>sound),true);
await page.locator('#resume').click();assert.equal(await page.evaluate(()=>paused),false);const target=await page.evaluate(()=>{syncMusic();return music.target;});assert(Math.abs(target-.32*.42)<.0001);await page.waitForTimeout(120);assert(Math.abs(await page.evaluate(()=>soundOutput().gain.value)-.42)<.001);
await page.locator('#pause').click();await page.waitForTimeout(300);if(width===390&&height===844)await page.screenshot({path:'tests/pause-menu-390x844.png'});
const actions=await page.locator('.pause-action').all();const sizes=await Promise.all(actions.map(e=>e.boundingBox()));assert(Math.abs(sizes[0].width-sizes[1].width)<2);assert(sizes.every(b=>b.width>90));await page.locator('#pause-home').click();assert.equal(await page.evaluate(()=>state),'menu');assert(await page.locator('#start').isVisible());assert(await page.locator('.skill-entry').isVisible());assert.equal(await page.evaluate(()=>music.active),false);assert.equal(await page.evaluate(()=>enemies.length+spawnQueue.length+shots.length),0);
await page.locator('#start').click();assert.notEqual(await page.evaluate(()=>state),'menu');assert.equal(await page.evaluate(()=>floor),1);assert.equal(await page.evaluate(()=>masterVolume),.42);
await page.reload();await page.waitForFunction(()=>HexMap.ready);assert.equal(await page.evaluate(()=>masterVolume),.42);
}
assert.deepEqual(errors,[]);console.log('Pause menu: four viewport bounds, frozen clock during volume changes, mute/unmute, live music/effects levels, resume, return to title, talents entry, fresh run and persisted volume passed in Edge/WebGL.');}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});



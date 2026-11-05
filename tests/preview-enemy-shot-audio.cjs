const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?electriclab=1');await page.waitForFunction(()=>globalThis.TileLab?.active);
 await page.locator('#sound-settings-open').click({force:true});await page.evaluate(async()=>{sound=true;unlockAudio();await audio.resume();paused=true;});await page.waitForFunction(()=>enemyShotBuffer&&audio.state==='running');
 const report=await page.evaluate(()=>{
  const stop=()=>{for(const v of [...starterShotVoices]){v.stop();starterShotVoices.delete(v);}enemyShotAt=-Infinity;};stop();
  const routes=[];for(const type of ['eye','spitter','twinGun','moth','skull','stealthDrone','missile','fighter','laser']){enemyShotSound(type);routes.push(starterShotVoices.size===1&&[...starterShotVoices][0].buffer===enemyShotBuffer);stop();}
  const actual=[];for(const type of ['spitter','eye','twinGun','moth','skull','fighter']){fire({type,x:325,y:100,t:1,seed:0});actual.push([...starterShotVoices].some(v=>v.buffer===enemyShotBuffer));stop();}
  fire({type:'spitter',x:325,y:100,t:1,seed:0});const enemy=[...starterShotVoices].find(v=>v.buffer===enemyShotBuffer);for(let i=0;i<24;i++){shotSound('smg');hitSoundAt=-Infinity;hitSound();explosionSound();}const survives=starterShotVoices.has(enemy),totalBounded=starterShotVoices.size<=12;stop();for(let i=0;i<10;i++){enemyShotAt=-Infinity;enemyShotSound();}const enemyCap=[...starterShotVoices].filter(v=>v.sampleGroup==='enemyShot').length;stop();
  cowboySound('shot');const boss=[...starterShotVoices][0]?.buffer===enemyShotBuffer;stop();
  enemyShotSound();enemyShotSound();const throttled=starterShotVoices.size===1,gain=[...starterShotVoices][0].sampleGain.gain.value;stop();
  sound=false;enemyShotSound();const muted=starterShotVoices.size===0;sound=true;const level=soundLevels.shot;setSoundLevel('shot',0);enemyShotSound();const zero=starterShotVoices.size===0;setSoundLevel('shot',level);
  return {actual,survives,totalBounded,enemyCap,url:ENEMY_SHOT_URL,duration:enemyShotBuffer.duration,routes,boss,throttled,muted,zero,gain,expected:level*1.2*SAMPLE_MIX.shot};
 });assert(report.actual.every(Boolean)&&report.survives&&report.totalBounded);assert.equal(report.enemyCap,3);assert(report.routes.every(Boolean)&&report.boss&&report.throttled&&report.muted&&report.zero);assert(Math.abs(report.gain-report.expected)<1e-6);assert(report.duration>0);assert.equal(report.url,'assets/audio/enemy-sci-fi-sniper10.wav');assert.deepEqual(errors,[]);console.log('Real Edge enemy recording, shared firing routes, boss, throttle, mute and zero volume passed',report);
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});

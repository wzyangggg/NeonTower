const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?electriclab=1');await page.waitForFunction(()=>globalThis.TileLab?.active);
 await page.locator('#sound-settings-open').click({force:true});await page.evaluate(async()=>{sound=true;unlockAudio();await audio.resume();paused=true;});
 await page.waitForFunction(()=>gunSoundBuffers.size===9&&armorHitBuffers.filter(Boolean).length===10);
 const report=await page.evaluate(async()=>{
  const stop=()=>{for(const voice of [...starterShotVoices]){voice.stop();starterShotVoices.delete(voice);}};
  stop();const routes={},volleys={};
  for(const [weaponId,id]of Object.entries(WEAPON_GUN_SOUNDS)){
   shotSound(weaponId);routes[weaponId]=[...starterShotVoices].at(-1)?.buffer===gunSoundBuffers.get(id);stop();
   emitWeaponShotsInternal(createWeapon(weaponId),0,{x:p.x,y:p.y});const voices=[...starterShotVoices];volleys[weaponId]=voices.length===1&&voices[0].buffer===gunSoundBuffers.get(id);stop();
  }
  setSoundLevel('hit',.4);hitSoundAt=-Infinity;hitSound();const voice=[...starterShotVoices].at(-1),gain=voice.sampleGain.gain.value;hitSound();const throttled=starterShotVoices.size===1;
  stop();hitSoundAt=-Infinity;starterImpactSound();const routed=armorHitBuffers.includes([...starterShotVoices].at(-1).buffer);stop();
  for(let i=0;i<50;i++)shotSound('smg');const shotCap=starterShotVoices.size;stop();
  setSoundLevel('shot',0);shotSound('rifle');const zero=starterShotVoices.size===0;setSoundLevel('shot',.48);
  sound=false;shotSound('rifle');hitSoundAt=-Infinity;hitSound();const muted=starterShotVoices.size===0;sound=true;
  setMasterVolume(.3);const master=music.volume;setMasterVolume(1);
  const mixes=[];
  for(const url of ['audio/normal-theme.mp3','audio/relentless-minor.mp3']){
   const bgm=await audio.decodeAudioData(await(await fetch(url)).arrayBuffer());
   const offline=new OfflineAudioContext(1,44100*8,44100),limiter=offline.createDynamicsCompressor();
   limiter.threshold.value=-10;limiter.knee.value=8;limiter.ratio.value=6;limiter.attack.value=.003;limiter.release.value=.12;limiter.connect(offline.destination);
   const play=(buffer,level,at,out)=>{const s=offline.createBufferSource(),g=offline.createGain();s.buffer=buffer;g.gain.value=level;s.connect(g);g.connect(out);s.start(at);};
   play(bgm,.32,0,offline.destination);
   for(let t=0;t<7;t+=.065)play(gunSoundBuffers.get('smg'),.48*SAMPLE_MIX.shot/Math.sqrt(2.5),t,limiter);
   for(let t=0;t<7;t+=.045)play(armorHitBuffers[Math.floor(t*100)%10],.55*SAMPLE_MIX.hit/Math.sqrt(2.5),t,limiter);
   const output=(await offline.startRendering()).getChannelData(0);let peak=0,sum=0;for(const x of output){peak=Math.max(peak,Math.abs(x));sum+=x*x;}
   let bgmSum=0;const n=Math.min(bgm.length,44100*8);for(let i=0;i<n;i++)bgmSum+=bgm.getChannelData(0)[i]**2;
   mixes.push({url,peak,rms:Math.sqrt(sum/output.length),bgmRms:Math.sqrt(bgmSum/n)*.32});
  }
  return {routes,volleys,gain,throttled,routed,shotCap,zero,muted,master,mixes,shotMix:SAMPLE_MIX.shot};
 });
 console.log(JSON.stringify(report));assert(Object.values(report.routes).every(Boolean));assert(Object.values(report.volleys).every(Boolean));assert(report.throttled&&report.routed&&report.zero&&report.muted);assert.equal(report.shotCap,6);assert(Math.abs(report.gain-.112)<1e-5);assert.equal(report.master,.3);
 assert.equal(report.shotMix,.9,'gunshots use the increased mix gain');
 for(const mix of report.mixes){assert(mix.peak<.95,'dense mix leaves clipping headroom');assert(mix.bgmRms>.015,'BGM remains present');assert(mix.rms/mix.bgmRms<6,'louder gunshots remain bounded in dense combat');}
 assert.deepEqual(errors,[]);console.log('Real Edge: 19 recordings, actual gun volleys, armor routing, mute/zero/master, voice cap and both BGM dense mixes passed.');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});


'use strict';
(async()=>{
 const panel=document.getElementById('resource-loading'),status=document.getElementById('resource-loading-status');
 const modules=['shop-effects.js','snake.js','virus.js','humanoid.js','cowboy.js','crimson-mech.js','drone-boss.js','ufo-boss.js','fish-school.js','performance.js','fruit-models.js','character-gaze.js','character-eyes.js','island-players.js','bear-player.js','cat-player.js','electric-tiles.js','electric-editor.js','tile-lab.js','scene-lab.js','weapon-lab.js','vehicle-lab.js'];
 let completed=0;const total=modules.length+6;
 function progress(label,done=false){if(done)completed++;const percent=Math.floor(completed/total*100);status.textContent=label;document.getElementById('resource-loading-percent').textContent=percent+'%';document.getElementById('resource-loading-fill').style.width=percent+'%';document.getElementById('resource-loading-meter').setAttribute('aria-valuenow',percent);}
 const start=document.getElementById('start');start.disabled=true;start.textContent='正在连接夜城…';
 try{
  progress('读取游戏引擎…');
  const response=await fetch('game.js');if(!response.ok)throw Error('读取原版引擎失败：'+response.status);
  const source=await response.text(),params=new URLSearchParams(location.search),lab=params.get('lab')==='1'||params.get('weaponlab')==='1';
  const engine=document.createElement('script');engine.textContent=lab?source:HexMap.transform(source);document.body.append(engine);progress('游戏引擎已就绪',true);
  for(const file of modules){progress('读取游戏模块 '+(completed)+' / '+modules.length+'…');await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=file;script.onload=resolve;script.onerror=()=>reject(Error('读取原版模块失败：'+file));document.body.append(script);});progress('游戏模块已就绪',true);}
  await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='promo-mode.js';script.onload=resolve;script.onerror=reject;document.body.append(script);});
  progress('游戏模块已就绪',true);globalThis.Specializations?.init();
  progress('读取角色、场景模型与贴图…');
  await Promise.all([[globalThis.FruitModels,'场景模型'],[globalThis.CatPlayer,'猫角色'],[globalThis.BearPlayer,'熊角色'],[globalThis.IslandPlayers,'狐狸与兔子角色']].map(async([asset,label])=>{await asset?.load();progress(label+'读取完成，等待其余资源…',true);}));
  globalThis.CharacterEyes?.sync();HexMap.ready=true;start.disabled=false;start.innerHTML='进入游戏 <span aria-hidden="true">→</span>';
  progress('资源加载完成',true);panel.hidden=true;
  const airBoss=params.get('airboss');
  if(['gallery','duo','ember','cobalt','prism','forge','mantis','wraith','needle'].includes(airBoss)){
   for(const file of ['boss-move-settings.js','boss-move-editor.js'])await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=file;script.onload=resolve;script.onerror=()=>reject(Error('读取招式参数失败'));document.body.append(script);});
   await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='air-boss-lab.js';script.onload=resolve;script.onerror=()=>reject(Error('读取战机首领测试失败'));document.body.append(script);});
   if(airBoss==='gallery'){
    await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='boss-gallery.js';script.onload=resolve;script.onerror=()=>reject(Error('读取 BOSS 阵列失败'));document.body.append(script);});
    globalThis.BossGallery.init();
   }else await globalThis.AirBossLab.init(airBoss,params.get('fight')==='1');
  }
  else if(params.get('missilelab')==='1'){
   await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='missile-lab.js';script.onload=resolve;script.onerror=()=>reject(Error('读取导弹演示失败'));document.body.append(script);});
  }
  else if(params.get('roomlab')==='1'){
   await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='assets/bridge-mechs.js';script.onload=resolve;script.onerror=()=>reject(Error('读取陆行机械模型失败'));document.body.append(script);});
   await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='room-lab.js';script.onload=resolve;script.onerror=()=>reject(Error('读取关卡试玩失败'));document.body.append(script);});
   globalThis.RoomLab.init();
  }
  else if(['1','2','3','4'].includes(params.get('vehiclelab')))showVehicleLab(params.get('vehiclelab'));
  else if(params.get('promo')==='1')globalThis.PromoMode.init();
  else if(params.get('forecastlab')==='1'){reset();floor=9;beginDescent();updateUI();toast('强敌来袭预览 / B09',2);}
  else if(params.get('raillab')==='1'){reset();testMode=true;floor=10;startWave();startRailRoom();}
  else if(params.get('bridgelab')==='1'){reset();testMode=true;floor=9;startWave();}
  else if(params.get('sawlab')==='1'){reset();testMode=true;floor=6;startWave({previewSawRoom:true});}
  else if(params.get('builderlab')==='1')startBuilderTest();
  else if(params.get('electriclab')==='1'){globalThis.TileLab?.open();if(params.get('facilitypreview')==='clockrepair')globalThis.TileLab?.clockRepairPreview();else if(params.get('facilitypreview')==='rangedtowers')globalThis.TileLab?.rangedTowerPreview();}
  else if(!lab){
   for(const file of ['assets/bridge-mechs.js','boss-move-settings.js','boss-move-editor.js','air-boss-lab.js']){
    await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=file;script.onload=resolve;script.onerror=()=>reject(Error('读取战役模块失败：'+file));document.body.append(script);});
   }
   showDifficultySelection();
  }
  if(['standard','far'].includes(params.get('smokeblast'))){
   await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='smoke-blast-compare.js';script.onload=resolve;script.onerror=()=>reject(Error('读取爆烟对比失败'));document.body.append(script);});
  }
 }catch(error){console.error(error);panel.hidden=false;panel.classList.add('failed');document.getElementById('resource-loading-title').textContent='资源加载失败';status.textContent='读取中断';document.getElementById('resource-loading-note').textContent=error.message||'请检查网络后重试';document.getElementById('resource-loading-retry').hidden=false;start.textContent='加载失败，请刷新';document.getElementById('overlay').querySelector('p').textContent=error.message;}
})();

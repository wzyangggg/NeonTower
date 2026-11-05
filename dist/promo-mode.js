'use strict';
// Explicit URL opt-in; all gameplay still runs through the campaign engine.
globalThis.PromoMode=(()=>{
 const active=new URLSearchParams(location.search).get('promo')==='1';
 let panel;
 const environmentKey='neon-promo-environment-v1';
 const environment={preset:'original',hue:28,strength:0,brightness:100,fog:100};
 const presets={original:{hue:28,strength:0,brightness:100,fog:100},orange:{hue:28,strength:100,brightness:115,fog:100},cyan:{hue:185,strength:100,brightness:110,fog:100},rose:{hue:335,strength:100,brightness:110,fog:100}};
 const rgb=(h,s,l)=>{h=((h%360)+360)%360/360;const a=s*Math.min(l,1-l);return [0,8,4].map(n=>{const k=(n+h*12)%12;return l-a*Math.max(-1,Math.min(k-3,9-k,1));});};
 const mix=(a,b,t)=>a.map((v,i)=>v*(1-t)+b[i]*t);
 function setEnvironment(patch={},save=true){
  if(!active)return false;
  if(patch.preset&&presets[patch.preset])Object.assign(environment,presets[patch.preset],{preset:patch.preset});
  else if(['hue','strength','brightness','fog'].some(k=>Object.hasOwn(patch,k)))environment.preset='custom';
  for(const [key,min,max]of [['hue',0,360],['strength',0,100],['brightness',40,180],['fog',0,200]]){
   if(Object.hasOwn(patch,key)&&Number.isFinite(Number(patch[key])))environment[key]=Math.max(min,Math.min(max,Number(patch[key])));
  }
  if(save)try{localStorage.setItem(environmentKey,JSON.stringify(environment));}catch{}
  syncEnvironmentPanel();return true;
 }
 function applyEnvironmentLighting(r){
  const e=environment,t=e.strength/100,light=e.brightness/100;
  if(t>0){
   r.topLight=mix(r.topLight,rgb(e.hue,.56,.68),t);
   r.rearLeftColor=mix(r.rearLeftColor,rgb(e.hue-10,.85,.52),t);
   r.rearRightColor=mix(r.rearRightColor,rgb(e.hue+18,.7,.46),t);
   r.sceneFogColor=mix(r.sceneFogColor||[0,0,0],rgb(e.hue,.85,.20),t);
   // The legacy grade adds a fixed purple fill. Warm setups use neutral fill
   // plus the actual colored scene lights, including resident actors and rain.
   r.sceneGrade=0;
  }
  for(const key of ['topLight','rearLeftColor','rearRightColor'])r[key]=r[key].map(v=>v*light);
  r.sceneFogDensity=(r.sceneFogDensity||0)*e.fog/100;
 }
 function applyEnvironmentFog(r){
  const e=environment,t=e.strength/100;
  if(!r.cityFogVolumes)return;
  r.cityFogVolumes=r.cityFogVolumes.map((v,i)=>({...v,color:t?'#'+mix(r.color(v.color),rgb(e.hue+(i-1)*7,.88,.34+i*.025),t).map(c=>Math.round(c*255).toString(16).padStart(2,'0')).join(''):v.color,opacity:1-Math.pow(1-v.opacity,e.fog/100)}));
 }
 function syncEnvironmentPanel(){
  if(!panel)return;
  panel.querySelector('[data-env-preset]').value=environment.preset;
  for(const key of ['hue','strength','brightness','fog']){
   panel.querySelector(`[data-env="${key}"]`).value=environment[key];
   panel.querySelector(`[data-env-value="${key}"]`).textContent=environment[key]+(key==='hue'?'°':'%');
  }
 }
 const slots={weapon:'武器',armor:'衣服',shoes:'坐骑',drone:'无人机',bomb:'炸弹'};
 const catalogs=key=>testEquipmentTypes(key).filter(e=>!(key==='shoes'&&e.id==='tentacle')&&!(key==='drone'&&e.id==='flysword'));
 function jump(value,boss=''){
  const target=Number(value),max=CAMPAIGN_BOSSES.length*(ROUNDS_PER_BOSS+1);
  if(!active||!Number.isInteger(target)||target<1||target>max)return false;
  const loadout=Object.keys(slots).map(key=>[key,equipmentInSlot(key)]);
  ElectricEditor.reset();reset();testMode=true;floor=target;
  bossesDefeated=Math.floor((target-1)/(ROUNDS_PER_BOSS+1));
  const choices=CAMPAIGN_BOSSES[campaignBossIndex()-1];
  if(choices?.some(b=>b.id===boss))campaignBossKind=boss;
  for(const [key,item]of loadout)if(item)equipItem(key,item);
  p.hp=p.max;beginDescent();updateUI();
  $('test-open').textContent='拍摄换装 · F2';
  toast('宣传拍摄 / B'+String(target).padStart(2,'0'),1.5);return true;
 }
 function equip(key,id,tier){
  if(!active||!slots[key]||!catalogs(key).some(e=>e.id===id))return false;
  if(['menu','dead','won'].includes(state))jump(1);
  const factories={armor:createArmor,shoes:createShoes,drone:createDrone,bomb:createBomb};
  const item=key==='weapon'?createWeaponModel(id):factories[key](id,Math.max(1,Math.min(5,Number(tier)||1)));
  equipItem(key,item);testMode=true;updateUI();return true;
 }
 function init(){
  if(!active)return;
  const style=document.createElement('style');style.textContent=`
   #promo-panel{position:absolute;z-index:70;top:95px;right:8px;width:min(290px,calc(100% - 16px));max-height:calc(100% - 110px);overflow-y:auto;overscroll-behavior:contain;padding:10px;background:#101528ed;border:1px solid #71e5e7;border-radius:10px;color:#e8faff;font:12px sans-serif;pointer-events:auto}
   #promo-panel summary{cursor:pointer;font-weight:bold}#promo-panel label{display:block;margin:8px 0}#promo-panel select{width:100%;max-width:100%;padding:5px;background:#20283e;color:white;border:1px solid #65728c}#promo-panel button{padding:7px;margin:3px 3px 3px 0;font-size:12px}#promo-panel small{display:block;line-height:1.6;color:#adc6d8}
   .promo-controls-hidden #promo-panel,.promo-controls-hidden #test-open{display:none!important}`;
  document.head.append(style);
  panel=document.createElement('details');panel.id='promo-panel';panel.open=true;
  const options=[];
  for(let f=1;f<=CAMPAIGN_BOSSES.length*(ROUNDS_PER_BOSS+1);f++){
   const boss=CAMPAIGN_BOSSES[f/(ROUNDS_PER_BOSS+1)-1];
   if(boss)for(const b of boss)options.push(`<option value="${f}:${b.id}">B${String(f).padStart(2,'0')} · ${b.name}</option>`);
   else options.push(`<option value="${f}:">B${String(f).padStart(2,'0')}${isDrinkFloor(f)?' · 酒车休息层':''}</option>`);
  }
  panel.innerHTML=`<summary>宣传拍摄控制 · F4 隐藏</summary><label>关卡<select data-floor>${options.join('')}</select></label><button data-jump>前往关卡</button><button data-replay>重拍本关</button><label>装备类型<select data-slot>${Object.entries(slots).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label><label>装备<select data-item></select></label><label>品质<select data-tier>${[1,2,3,4,5].map(t=>`<option value="${t}">${WEAPON_GRADES[t].name}</option>`).join('')}</select></label><button data-equip>立即装备</button><small data-result>每关连续三选一，点“开始本关”开战。<br>仅音效 · 背景音乐已关闭。<br>跳关与重拍保留装备，重置场地并补满生命。<br>F4 隐藏/显示拍摄控制，手机可收起面板。</small>`;
  $('viewport').append(panel);
  panel.querySelector('summary').insertAdjacentHTML('afterend',`<details data-env-tools><summary>环境光与城市配色</summary><label>环境预设<select data-env-preset><option value="original">蓝紫原色</option><option value="orange">橙色夜城</option><option value="cyan">青色夜城</option><option value="rose">玫红夜城</option><option value="custom" disabled>自定义</option></select></label>${[['hue','主色',0,360],['strength','氛围强度',0,100],['brightness','灯光亮度',40,180],['fog','雾浓度',0,200]].map(([key,name,min,max])=>`<label>${name} <output data-env-value="${key}"></output><input style="width:100%;margin:6px 0" type="range" data-env="${key}" min="${min}" max="${max}" step="1"></label>`).join('')}<button data-env-reset>恢复原色</button><small>主光、侧光与城市雾联动；霓虹招牌和武器保留自身颜色。设置自动保存，跳关可继续使用。</small></details>`);
  const baseLighting=StreetScene.lighting,baseDraw=StreetScene.draw;
  StreetScene.lighting=function(...args){baseLighting.apply(this,args);applyEnvironmentLighting(args[0]);};
  StreetScene.draw=function(...args){baseDraw.apply(this,args);applyEnvironmentFog(args[0]);};
  try{const saved=JSON.parse(localStorage.getItem(environmentKey));if(saved&&typeof saved==='object')setEnvironment(saved,false);}catch{}
  const requested=new URLSearchParams(location.search).get('env');
  if(presets[requested])setEnvironment({preset:requested});
  syncEnvironmentPanel();
  panel.querySelector('[data-env-preset]').onchange=event=>setEnvironment({preset:event.target.value});
  panel.querySelector('[data-env-reset]').onclick=()=>setEnvironment({preset:'original'});
  panel.querySelectorAll('[data-env]').forEach(input=>input.oninput=()=>setEnvironment({[input.dataset.env]:input.value}));
  const q=s=>panel.querySelector(s);
  function refreshItems(){const key=q('[data-slot]').value;q('[data-item]').innerHTML=catalogs(key).map(e=>`<option value="${e.id}">${key==='weapon'?'T'+e.tier+' · ':''}${e.name}</option>`).join('');q('[data-tier]').disabled=key==='weapon';}
  q('[data-slot]').onchange=refreshItems;refreshItems();
  q('[data-jump]').onclick=()=>{const [f,b]=q('[data-floor]').value.split(':');jump(f,b);};
  q('[data-replay]').onclick=()=>jump(floor,campaignBossKind);
  q('[data-equip]').onclick=()=>{if(equip(q('[data-slot]').value,q('[data-item]').value,q('[data-tier]').value))q('[data-result]').textContent='已装备：'+equipmentName(equipmentInSlot(q('[data-slot]').value));};
  for(const event of ['pointerdown','pointerup','click'])panel.addEventListener(event,e=>e.stopPropagation());
  window.addEventListener('keydown',e=>{if(e.key==='F4'){e.preventDefault();if(!e.repeat)$('viewport').classList.toggle('promo-controls-hidden');}});
  // reset() marks a normal run; the promotional entry always restores its test flag.
  $('start').onclick=()=>jump(1);
  jump(1);
 }
 return {active,init,jump,equip,setEnvironment,get environment(){return {...environment};}};
})();

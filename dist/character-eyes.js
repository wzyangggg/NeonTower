'use strict';
// Per-avatar eye appearance; direction is supplied separately by CharacterGaze.
globalThis.CharacterEyes=(()=>{
 const key='neon-character-eyes-v1',profiles={};
 try{const saved=JSON.parse(localStorage.getItem(key)||'{}');for(const kind of ['cat','fox','bunny'])if(saved[kind])profiles[kind]=saved[kind];}catch{}
 const current=()=>['cat','fox','bunny'].includes(globalThis.CatPlayer?.selected)?globalThis.CatPlayer.selected:'cat';
 function get(kind=current()){const p=profiles[kind]||{};return {color:/^#[0-9a-f]{6}$/i.test(p.color)?p.color:kind==='cat'?'#62b7d6':'#15191e',size:Number.isFinite(p.size)?Math.max(.15,Math.min(.9,p.size)):.676,whiteColor:/^#[0-9a-f]{6}$/i.test(p.whiteColor)?p.whiteColor:'#f2f2ed',slit:Number.isFinite(p.slit)?Math.max(0,Math.min(1,p.slit)):0};}
 function set(values,kind=current()){const p=get(kind);if(/^#[0-9a-f]{6}$/i.test(values.color))p.color=values.color;if(Number.isFinite(values.size))p.size=Math.max(.15,Math.min(.9,values.size));if(/^#[0-9a-f]{6}$/i.test(values.whiteColor))p.whiteColor=values.whiteColor;if(Number.isFinite(values.slit))p.slit=Math.max(0,Math.min(1,values.slit));profiles[kind]=p;try{localStorage.setItem(key,JSON.stringify(profiles));}catch{}sync();}
 function sync(){const p=get(),color=document.getElementById('eye-pupil-color'),size=document.getElementById('eye-pupil-size'),value=document.getElementById('eye-pupil-size-value');if(color)color.value=p.color;if(size)size.value=Math.round(p.size*100);if(value)value.textContent=Math.round(p.size*100)+'%';const white=document.getElementById('eye-white-color'),slit=document.getElementById('eye-pupil-slit'),slitValue=document.getElementById('eye-pupil-slit-value');if(white)white.value=p.whiteColor;if(slit)slit.value=Math.round(p.slit*100);if(slitValue)slitValue.textContent=Math.round(p.slit*100)+'%';}
 function rgb(kind=current()){return get(kind).color.match(/[0-9a-f]{2}/ig).map(v=>parseInt(v,16)/255);}
 const card=document.querySelector('#pause-panel .pause-volume');if(card){const panel=document.createElement('fieldset');panel.className='eye-appearance-settings';panel.innerHTML='<legend>眼睛设置</legend><label>瞳色<input id="eye-pupil-color" type="color" aria-label="瞳色"></label><label>眼白颜色<input id="eye-white-color" type="color" aria-label="眼白颜色"></label><label>瞳孔大小<output id="eye-pupil-size-value"></output><input id="eye-pupil-size" type="range" min="15" max="90" step="1" aria-label="瞳孔大小"></label><label>猫眼竖缝程度<output id="eye-pupil-slit-value"></output><input id="eye-pupil-slit" type="range" min="0" max="100" step="1" aria-label="猫眼竖缝程度"></label><small>0% 圆瞳 · 100% 细竖缝</small>';card.after(panel);panel.querySelector('#eye-pupil-color').addEventListener('input',e=>set({color:e.target.value}));panel.querySelector('#eye-white-color').addEventListener('input',e=>set({whiteColor:e.target.value}));panel.querySelector('#eye-pupil-slit').addEventListener('input',e=>set({slit:Number(e.target.value)/100}));panel.querySelector('#eye-pupil-size').addEventListener('input',e=>set({size:Number(e.target.value)/100}));sync();}
 function whiteRGB(kind=current()){return get(kind).whiteColor.match(/[0-9a-f]{2}/ig).map(v=>parseInt(v,16)/255);}
 const shaderGLSL=`vec3 characterIris(vec2 uv,vec2 gaze,vec3 whiteColor,vec3 color,float size,float slit){
  vec2 direction=gaze/max(1.,length(gaze));vec2 p=(uv-.5-direction*.11)/max(size,.15);
  // Shape the whole visible pupil, including its colored region. Narrowing only
  // the inner black core leaves dark eye colors looking like a solid circle.
  vec2 pupilUV=p/vec2(mix(1.,.12,slit),1.);
  float iris=1.-smoothstep(.48,.5,length(pupilUV));
  vec2 coreUV=pupilUV/vec2(1.,mix(1.,1.8,slit));
  float core=1.-smoothstep(.18,.22,length(coreUV));
  return mix(whiteColor,mix(color,vec3(.008,.012,.02),core),iris);
 }`;
 return {get,set,sync,rgb,whiteRGB,shaderGLSL};
})();

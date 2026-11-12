'use strict';
// Composite the complete game viewport, including HTML UI.
// Controls are a sibling outside the filtered surface.
(()=>{
 const params=new URLSearchParams(location.search);
 const mode=params.get('postfx')||(params.get('airboss')==='gallery'?'off':'arcade');
 const defaults={hexNeonColor:'#2080ff',hexPattern:true,hexPatternFlow:true,hexPatternCoverage:45,hexPatternOutline:65,hexPatternWidth:.6,hexPatternSpeed:1,hexPatternColor:'#72baa9',hexLowerColor:'#000000',hexSideColor:'#303b55',hexSideAltColor:'#3d4762',hexCollarColor:'#4d93c9',outline:true,outlineWidth:.9,outlineStrength:.8,outlineGlow:1.1,outlineAngle:125,surfaceShader:'original',enemyMidtone:25,cameraSize:1,playerLight:true,playerLightColor:'#ffdba3',playerLightStrength:2.4,playerLightRange:190,playerLightHeight:85,enabled:true,chromatic:true,chromaticStrength:.6,bloom:true,bloomStrength:.68,threshold:.68,radius:1,scanlines:true,scanStrength:.035,scanSpacing:2,scanSpeed:4,vignette:true,vignetteStrength:.09,color:true,redEnabled:true,greenEnabled:true,blueEnabled:true,red:1,green:1,blue:1,distortion:true,distortionStrength:.18,ao:true,aoStrength:.65,aoRadius:38,shadows:true,shadowStrength:.36,shadowAngle:130,shadowBias:.00065,shadowSoftness:1.4};
 let settings={...defaults};
 const ranges={enemyMidtone:[0,60,1],hexPatternCoverage:[0,100,1],hexPatternOutline:[0,100,1],hexPatternWidth:[.3,1.2,.05],hexPatternSpeed:[.3,2.5,.1],outlineAngle:[0,360,5],outlineWidth:[.5,3,.05],outlineStrength:[0,1.5,.05],outlineGlow:[0,2,.05],chromaticStrength:[0,4,.05],cameraSize:[.4,2,.02],playerLightStrength:[0,6,.05],playerLightRange:[100,360,5],playerLightHeight:[65,160,1],bloomStrength:[0,2,.01],threshold:[.2,.98,.01],radius:[.3,3,.1],scanStrength:[0,.4,.005],scanSpacing:[1,6,.25],scanSpeed:[-40,40,1],vignetteStrength:[0,.6,.01],red:[0,2,.01],green:[0,2,.01],blue:[0,2,.01],distortionStrength:[0,1,.01],aoStrength:[0,2,.01],aoRadius:[8,100,1],shadowStrength:[0,.8,.01],shadowAngle:[0,360,1],shadowBias:[.0001,.005,.00005],shadowSoftness:[.5,4,.1]};
 try{const saved=JSON.parse(localStorage.getItem('neon-postfx-v1')||'null');for(const key in defaults){if(typeof defaults[key]==='boolean'){if(typeof saved?.[key]==='boolean')settings[key]=saved[key];}else if(typeof defaults[key]==='string'){if(key==='surfaceShader'&&['original','soft-toon'].includes(saved?.[key]))settings[key]=saved[key];else if(key!=='surfaceShader'&&/^#[0-9a-f]{6}$/i.test(saved?.[key]))settings[key]=saved[key].toLowerCase();}else if(Number.isFinite(saved?.[key]))settings[key]=Math.max(ranges[key][0],Math.min(ranges[key][1],saved[key]));}}catch{}
 function save(){try{localStorage.setItem('neon-postfx-v1',JSON.stringify(settings));}catch{}}
 globalThis.NeonPostFX={settings,defaults,get active(){return settings.enabled&&mode!=='off'&&mode!=='bloom';},refresh(){sync();},reset(){Object.assign(settings,defaults);save();sync();},samplePoint(x,y){return samplePoint(x,y);}};
 let panel,surface,scan,shade,filter,blur,merge,gain,transfer,warp,warpImage,redShift,blueShift;
 function sync(){if(!panel)return;for(const input of panel.querySelectorAll('input,select')){const key=input.dataset.setting;if(input.type==='checkbox')input.checked=settings[key];else if(input.tagName==='SELECT')input.value=settings[key];else{input.value=settings[key];input.nextElementSibling.value=input.type==='color'?settings[key].toUpperCase():Number(settings[key]).toFixed(key==='shadowBias'?5:key==='scanStrength'?3:2);}}apply();}
 function mount(){
  const viewport=document.getElementById('viewport');if(!viewport)return;
  panel=document.createElement('details');panel.id='postfx-panel';panel.hidden=!globalThis.DEV_TOOLS;
  const toggle=(key,label)=>`<label class="postfx-toggle"><input type="checkbox" data-setting="${key}">${label}</label>`;
  const slider=(key,label)=>`<label class="postfx-slider">${label}<span><input aria-label="${label}" type="range" min="${ranges[key][0]}" max="${ranges[key][1]}" step="${ranges[key][2]}" data-setting="${key}"><output></output></span></label>`;
  panel.innerHTML='<summary>画面调节</summary><div class="postfx-controls">'+toggle('enabled','后处理总开关')+'<fieldset><legend>'+toggle('chromatic','CRT 色散')+'</legend>'+slider('chromaticStrength','红蓝偏移（px）')+'<small>模拟老式显像管的 RGB 边缘错位</small></fieldset>'+'<fieldset><legend>'+toggle('bloom','辉光')+'</legend>'+slider('bloomStrength','辉光强度')+slider('threshold','发光阈值')+slider('radius','扩散范围')+'</fieldset><fieldset><legend>'+toggle('scanlines','扫描线')+'</legend>'+slider('scanStrength','扫描线强度')+slider('scanSpacing','扫描线间距')+slider('scanSpeed','滚动速度（px/s）')+'<small>正数向下 · 负数向上 · 0 静止</small>'+'</fieldset><fieldset><legend>'+toggle('vignette','暗角')+'</legend>'+slider('vignetteStrength','暗角强度')+'</fieldset><fieldset><legend>'+toggle('color','RGB 色彩通道')+'</legend>'+toggle('redEnabled','红色通道')+slider('red','红色增益')+toggle('greenEnabled','绿色通道')+slider('green','绿色增益')+toggle('blueEnabled','蓝色通道')+slider('blue','蓝色增益')+'</fieldset><button type="button" id="postfx-reset">恢复默认</button><small>实时生效 · 自动保存到本机</small></div>';
  panel.querySelector('.postfx-controls').insertAdjacentHTML('beforeend','<fieldset><legend>镜头</legend>'+slider('cameraSize','镜头大小')+'<small>数值越小越近 · 摆放时拖动空白处移动镜头</small></fieldset><fieldset><legend>'+toggle('playerLight','角色头顶点光')+'</legend><label class="postfx-slider">点光颜色<span><input type="color" aria-label="点光颜色" data-setting="playerLightColor"><output></output></span></label>'+slider('playerLightStrength','点光强度')+slider('playerLightRange','照亮范围')+slider('playerLightHeight','头顶高度')+'<small>点光随角色移动，照亮附近地板</small></fieldset><fieldset><legend>'+toggle('distortion','街机镜头畸变')+'</legend>'+slider('distortionStrength','镜头曲率')+'</fieldset><fieldset><legend>'+toggle('ao','环境遮蔽 AO')+'</legend>'+slider('aoStrength','AO 强度')+slider('aoRadius','AO 半径')+'</fieldset><fieldset><legend>'+toggle('shadows','主光源阴影')+'</legend>'+slider('shadowStrength','阴影强度')+slider('shadowAngle','光源方向')+slider('shadowSoftness','阴影柔和度')+slider('shadowBias','阴影偏移')+'</fieldset>');
  panel.querySelector('.postfx-controls').insertAdjacentHTML('afterbegin','<fieldset><legend>光照与着色器</legend><label class="postfx-slider">着色器<select aria-label="着色器" data-setting="surfaceShader"><option value="original">原版 · 霓虹光照</option><option value="soft-toon">推荐 · 柔和卡通</option></select></label>'+slider('enemyMidtone','怪物中间调提亮（%）')+'<small>怪物提亮：0 为原效果，保留深色与高光 · 独立于后处理总开关</small></fieldset>');
  panel.querySelector('.postfx-controls').insertAdjacentHTML('afterbegin','<fieldset><legend>'+toggle('outline','角色、怪物与防御塔背光')+'</legend>'+slider('outlineWidth','亮边宽度（px）')+slider('outlineStrength','背光亮度')+slider('outlineGlow','外围柔光')+slider('outlineAngle','来光方向（°）')+'<small>侧后方来光 · 亮侧溢光、暗侧渐隐 · 90°上方 / 180°左侧</small></fieldset>');
  panel.querySelector('.postfx-controls').insertAdjacentHTML('afterbegin','<fieldset><legend>六边形地块颜色</legend>'+[['hexSideColor','上层侧壁底色'],['hexSideAltColor','上层侧壁交替色'],['hexLowerColor','下层颜色'],['hexCollarColor','设施地板光斑'],['hexNeonColor','地块灯带与光柱颜色']].map(([key,label])=>`<label class="postfx-slider">${label}<span><input type="color" aria-label="${label}" data-setting="${key}"><output></output></span></label>`).join('')+'<small>实时生效 · 独立于后处理总开关 · 受场景光照与雾影响</small></fieldset>');
  panel.querySelector('.postfx-controls').insertAdjacentHTML('afterbegin','<fieldset><legend>'+toggle('hexPattern','地块表面纹路')+'</legend>'+slider('hexPatternCoverage','花纹覆盖率（%）')+slider('hexPatternOutline','断续六边形（%）')+slider('hexPatternWidth','花纹线宽')+toggle('hexPatternFlow','纹路流光')+slider('hexPatternSpeed','流光速度')+'<label class="postfx-slider">纹路颜色<span><input type="color" data-setting="hexPatternColor"><output></output></span></label><small>增删仅影响相邻纹路 · 独立于后处理总开关</small></fieldset>');
  const controls=panel.querySelector('.postfx-controls');controls.append(panel.querySelector('button'),controls.querySelector(':scope > small'));
  panel.addEventListener('input',event=>{const input=event.target,key=input.dataset.setting;if(!(key in defaults))return;settings[key]=input.type==='checkbox'?input.checked:input.type==='color'||input.tagName==='SELECT'?input.value:Number(input.value);save();sync();});
  for(const fieldset of [...panel.querySelectorAll('fieldset')]){
   const group=document.createElement('details');group.className='postfx-group';const summary=document.createElement('summary');summary.textContent=fieldset.querySelector('legend').textContent;group.append(summary);fieldset.before(group);group.append(fieldset);
   group.addEventListener('toggle',()=>{if(group.open)for(const other of panel.querySelectorAll('.postfx-group'))if(other!==group)other.open=false;});
  }
  panel.querySelector('button').onclick=()=>NeonPostFX.reset();
  panel.addEventListener('toggle',event=>{if(event.target===panel&&!panel.open&&(panel.contains(document.activeElement)||document.activeElement===document.body)&&typeof focusGameControls==='function')focusGameControls();});
  // Do not let control gestures steer or fire in the game underneath.
  for(const name of ['pointerdown','pointermove','pointerup','keydown','keyup'])panel.addEventListener(name,event=>event.stopPropagation());
  document.body.append(panel);mountSurface(viewport);sync();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
 function apply(){
  if(!surface)return;
  const active=settings.enabled&&mode!=='off',bloomOn=active&&settings.bloom&&settings.bloomStrength>0,arcade=mode!=='bloom';
  const colorOn=active&&arcade&&settings.color;
  const attribute=(node,key,value)=>{value=String(value);if(node.getAttribute(key)!==value)node.setAttribute(key,value);};
  const slope=1/(1-settings.threshold),offset=-settings.threshold*slope;
  for(const node of transfer.children){attribute(node,'slope',slope);attribute(node,'intercept',offset);}
  attribute(blur,'stdDeviation',settings.radius*3);
  attribute(merge,'k2',bloomOn?settings.bloomStrength:0);
  const rgb=colorOn?[settings.redEnabled?settings.red:0,settings.greenEnabled?settings.green:0,settings.blueEnabled?settings.blue:0]:[1,1,1];
  attribute(gain,'values',`${rgb[0]} 0 0 0 0 0 ${rgb[1]} 0 0 0 0 0 ${rgb[2]} 0 0 0 0 0 1 0`);
  const colorChanged=rgb.some(v=>v!==1);
  const chromatic=active&&arcade&&settings.chromatic?settings.chromaticStrength:0;
  attribute(warp,'in',chromatic>0?'chromatic':'graded');
  attribute(redShift,'dx',chromatic);attribute(blueShift,'dx',-chromatic);
  const distort=active&&arcade&&settings.distortion?settings.distortionStrength:0;
  attribute(warp,'scale',Math.max(surface.clientWidth,surface.clientHeight)*.24*distort);
  surface.style.filter=active&&(bloomOn||colorChanged||distort>0||chromatic>0)?'url(#neon-ui-filter)':'none';
  scan.style.opacity=active&&arcade&&settings.scanlines?settings.scanStrength:0;
  scan.style.backgroundSize=`100% ${settings.scanSpacing}px`;
  scan.style.setProperty('--scan-step',`${settings.scanSpacing}px`);
  scan.style.animationDuration=`${settings.scanSpacing/Math.max(.01,Math.abs(settings.scanSpeed))}s`;
  scan.style.animationDirection=settings.scanSpeed<0?'reverse':'normal';
  scan.style.animationPlayState=active&&arcade&&settings.scanlines&&settings.scanStrength>0&&settings.scanSpeed!==0?'running':'paused';
  shade.style.opacity=active&&arcade&&settings.vignette?settings.vignetteStrength:0;
 }
 function mountSurface(viewport){
  surface=viewport;
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.id='postfx-filter-defs';svg.setAttribute('width','0');svg.setAttribute('height','0');svg.setAttribute('aria-hidden','true');
  // RGB threshold occurs before blur; arithmetic addition then channel balance.
  // Separate RGB before the CRT warp so the complete scene and HTML UI share phosphor fringing.
  // sRGB preserves the neon palette and avoids lifting the entire purple fog.
  svg.innerHTML='<defs><filter id="neon-ui-filter" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feComponentTransfer in="SourceGraphic" result="bright"><feFuncR type="linear"/><feFuncG type="linear"/><feFuncB type="linear"/></feComponentTransfer><feGaussianBlur in="bright" stdDeviation="3" result="glow"/><feComposite in="glow" in2="SourceGraphic" operator="arithmetic" k1="0" k2="0.68" k3="1" k4="0" result="lit"/><feColorMatrix in="lit" type="matrix" result="graded"/><feColorMatrix in="graded" type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="redChannel"/><feOffset in="redChannel" dx="0" dy="0" result="redShift"/><feColorMatrix in="graded" type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" result="greenChannel"/><feColorMatrix in="graded" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0" result="blueChannel"/><feOffset in="blueChannel" dx="0" dy="0" result="blueShift"/><feComposite in="redShift" in2="greenChannel" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="redGreen"/><feComposite in="redGreen" in2="blueShift" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="chromatic"/><feImage result="warpMap" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none"/><feDisplacementMap in="chromatic" in2="warpMap" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter></defs>';
  document.body.append(svg);filter=svg.querySelector('filter');transfer=svg.querySelector('feComponentTransfer');blur=svg.querySelector('feGaussianBlur');merge=svg.querySelector('feComposite');gain=svg.querySelector('feColorMatrix');
  scan=document.createElement('div');scan.id='postfx-scanlines';shade=document.createElement('div');shade.id='postfx-vignette';
  for(const node of [scan,shade]){node.setAttribute('aria-hidden','true');viewport.append(node);}
  redShift=svg.querySelector('[result=redShift]');blueShift=svg.querySelector('[result=blueShift]');
  warp=svg.querySelector('feDisplacementMap');warpImage=svg.querySelector('feImage');
  const updateMap=()=>{
   const w=surface.clientWidth,h=surface.clientHeight,m=Math.max(w,h),c=document.createElement('canvas');c.width=128;c.height=256;const ctx=c.getContext('2d'),pixels=ctx.createImageData(c.width,c.height);
   for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const nx=(x+.5)/c.width*2-1,ny=(y+.5)/c.height*2-1,r2=nx*nx+ny*ny,at=(y*c.width+x)*4;pixels.data.set([Math.round(255*(.5+nx*w/m*r2*.25)),Math.round(255*(.5+ny*h/m*r2*.25)),128,255],at);}
   // Percentages on filter primitives can resolve against the outer SVG/CSS
   // viewport. Keep the displacement image and filter in the game's own pixels.
   filter.setAttribute('filterUnits','userSpaceOnUse');filter.setAttribute('primitiveUnits','userSpaceOnUse');
   for(const node of [filter,warpImage,warp]){node.setAttribute('x','0');node.setAttribute('y','0');node.setAttribute('width',w);node.setAttribute('height',h);}
   ctx.putImageData(pixels,0,0);warpImage.setAttribute('href',c.toDataURL());apply();
  };
  if(typeof ResizeObserver!=='undefined')new ResizeObserver(updateMap).observe(viewport);updateMap();
  // Correct canvas / placement gestures for the source position sampled by the
  // curved screen. DOM controls keep native browser behavior.
  const forwarded=new WeakSet();
  for(const type of ['pointerdown','pointermove','pointerup','pointercancel'])viewport.addEventListener(type,event=>{
   if(forwarded.has(event)||!NeonPostFX.active||!settings.distortion||!settings.distortionStrength)return;
   if(event.target!==document.getElementById('game')&&!event.target.closest?.('#electric-placement'))return;
   const p=samplePoint(event.clientX,event.clientY),copy=new PointerEvent(type,{bubbles:true,cancelable:true,clientX:p.x,clientY:p.y,pointerId:event.pointerId,pointerType:event.pointerType,button:event.button,buttons:event.buttons,isPrimary:event.isPrimary,pressure:event.pressure});forwarded.add(copy);event.stopImmediatePropagation();event.preventDefault();event.target.dispatchEvent(copy);
  },{capture:true,passive:false});
 }
 function samplePoint(x,y){
  if(!surface||!NeonPostFX.active||!settings.distortion)return {x,y};
  const rect=surface.getBoundingClientRect(),nx=(x-rect.left)/rect.width*2-1,ny=(y-rect.top)/rect.height*2-1,r2=nx*nx+ny*ny,k=.06*settings.distortionStrength;
  return {x:x+nx*rect.width*r2*k,y:y+ny*rect.height*r2*k};
 }
})();

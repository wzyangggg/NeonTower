/* Original WebGL studies inspired by Balatro editions, not its game art/shaders.
   Only the local comparison page loads this file. One texture/context serves all samples. */
(()=>{
 const panel=document.querySelector('.shop-panel');if(!panel)return;
 const editions=[['原版','BASE','原始纸面与图案','#d6c9a8'],['闪箔','FOIL','蓝银波纹反光','#95beff'],['镭射','HOLOGRAPHIC','彩虹光膜与亮斑','#d5a2f6'],['多彩','POLYCHROME','整面流动虹彩','#f6bf88'],['负片','NEGATIVE','反转明暗与幽光','#b7b4ff']];
 const section=document.createElement('section');section.className='edition-study';
 section.innerHTML=`<div class="tag">EDITION MATERIAL LAB</div><h3>同一道具 · 五种材质</h3><p>《小丑牌》风格材质试作。移动指针可改变反光，点击卡片查看说明。</p><div class="edition-toolbar"><button type="button" id="edition-pause" aria-pressed="false">暂停动效</button><label>材质强度 <input id="edition-strength" type="range" min="0" max="100" value="85" aria-label="材质强度"></label></div><div class="edition-grid"><canvas aria-hidden="true"></canvas>${editions.map(([name,en,desc,color],i)=>`<button type="button" class="edition-sample" data-edition="${i}" style="--edition-color:${color}" aria-pressed="false" aria-label="${name} ${en}：${desc}"><span class="edition-art"></span><span class="edition-meta"><b>${name}</b><small>${en}</small><em>${desc}</em></span></button>`).join('')}</div><p class="edition-selection" role="status">同一张原创电梯核心图案，仅切换材质。下方保留 T1–T5 商店动效对照。</p><hr class="edition-divider">`;
 panel.prepend(section);
 const canvas=section.querySelector('canvas'),grid=section.querySelector('.edition-grid'),cards=[...section.querySelectorAll('.edition-sample')],pauseButton=section.querySelector('#edition-pause'),strengthInput=section.querySelector('#edition-strength'),status=section.querySelector('.edition-selection');
 const gl=canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:false,preserveDrawingBuffer:true});
 if(!gl){status.textContent='当前浏览器未启用 WebGL，无法显示材质预览。';canvas.hidden=true;return;}
 // Draw the source material once. Deliberate light/dark and red/blue/gold areas
 // make the difference between hue mapping and a colored overlay easy to judge.
 const source=document.createElement('canvas');source.width=320;source.height=400;
 const c=source.getContext('2d');c.fillStyle='#e6dfc8';c.fillRect(0,0,320,400);
 c.strokeStyle='#b8ad90';c.lineWidth=2;c.strokeRect(13,13,294,374);c.strokeRect(21,21,278,358);
 c.fillStyle='#253039';c.font='bold 15px monospace';c.textAlign='center';c.fillText('ELEVATOR / CORE 05',160,48);
 c.save();c.translate(160,190);c.strokeStyle='#bcb398';c.lineWidth=1;
 for(let k=0;k<12;k++){c.rotate(Math.PI/6);c.beginPath();c.moveTo(0,-109);c.lineTo(0,-122);c.stroke();}
 c.beginPath();c.arc(0,0,102,0,Math.PI*2);c.stroke();c.restore();
 c.fillStyle='#b08447';c.fillRect(145,78,30,32);c.fillStyle='#253039';c.fillRect(153,80,14,44);
 c.fillStyle='#608ca6';c.fillRect(78,121,164,137);c.fillStyle='#243741';c.fillRect(87,130,146,119);
 c.fillStyle='#b5c2b8';c.fillRect(98,142,124,71);c.fillStyle='#343c39';c.fillRect(108,153,104,49);
 c.fillStyle='#cf614a';c.fillRect(120,165,24,18);c.fillStyle='#73b6c9';c.fillRect(176,165,24,18);
 c.fillStyle='#d3b262';c.fillRect(126,224,68,9);c.fillStyle='#3f667e';c.fillRect(65,163,17,57);c.fillRect(238,163,17,57);
 c.strokeStyle='#b08447';c.lineWidth=5;c.beginPath();c.moveTo(131,267);c.lineTo(160,290);c.lineTo(189,267);c.stroke();
 c.fillStyle='#253039';c.font='bold 27px monospace';c.fillText('LIFT CORE',160,330);c.font='12px monospace';c.fillText('HELL ELEVATOR  /  005',160,355);
 const vs=`attribute vec2 a;varying vec2 uv;void main(){uv=vec2(a.x*.5+.5,.5-a.y*.5);gl_Position=vec4(a,0.,1.);}`;
 const fs=`precision highp float;varying vec2 uv;uniform sampler2D tex;uniform float mode,time,strength;uniform vec2 pointer;
 vec3 hue(float h){return clamp(abs(mod(h*6.+vec3(0.,4.,2.),6.)-3.)-1.,0.,1.);}
 vec3 hsl(vec3 rgb){float hi=max(rgb.r,max(rgb.g,rgb.b)),lo=min(rgb.r,min(rgb.g,rgb.b)),d=hi-lo,l=(hi+lo)*.5,h=0.,s=0.;if(d>.00001){s=d/(1.-abs(2.*l-1.));if(hi==rgb.r)h=mod((rgb.g-rgb.b)/d,6.);else if(hi==rgb.g)h=(rgb.b-rgb.r)/d+2.;else h=(rgb.r-rgb.g)/d+4.;h=fract(h/6.);}return vec3(h,s,l);}
 vec3 rgb(vec3 h){return h.z+(hue(h.x)-.5)*(1.-abs(2.*h.z-1.))*h.y;}
 void main(){vec2 p=uv-.5,q=p+pointer*.12;vec3 base=texture2D(tex,uv).rgb,col=base;float t=time*.65;
 float waves=sin(q.x*13.+t)+sin(q.y*17.-t*.8)+sin((q.x+q.y)*9.+t*.55);
 float band=pow(max(0.,sin(uv.x*6.+uv.y*3.-t*1.4+pointer.x)),10.);
 if(mode>.5&&mode<1.5){float rings=sin(length(q*vec2(.85,1.))*115.-t*5.+sin(q.x*15.+t)*2.);float facet=sin(atan(q.y,q.x)*9.+t*.7);float shine=pow(max(0.,rings*.65+facet*.35),5.);col=base*vec3(.5,.62,.88)+vec3(.08,.19,.48)*(.25+.75*shine)+vec3(.52,.7,1.)*band*.7;}
 else if(mode<2.5&&mode>1.5){float phase=q.x*.6+q.y*.35+waves*.12+t*.1;vec3 rainbow=hue(fract(phase));float patch=smoothstep(-.5,1.4,waves);col=base*(.57+rainbow*.53)+rainbow*patch*.34+vec3(1.)*band*.24;}
 else if(mode<3.5&&mode>2.5){vec3 original=hsl(base);float phase=fract(original.x+q.x*.65-q.y*.35+waves*.18+t*.16);col=rgb(vec3(phase,max(.65,original.y),original.z*.68+.11));col+=hue(fract(phase+.1))*.15+vec3(.5)*band;}
 else if(mode>3.5){vec3 original=hsl(base);col=rgb(vec3(fract(.2-original.x),original.y,1.-original.z));col=col*.86+vec3(.055,.07,.13);float sheen=smoothstep(.2,1.8,waves);col+=vec3(.15,.1,.3)*sheen+vec3(.22,.28,.48)*band;}
 col=mix(base,col,strength);float grain=fract(sin(dot(floor(uv*vec2(320.,400.)),vec2(12.9898,78.233)))*43758.5453)-.5;col+=grain*.018;
 vec2 box=abs(p)-vec2(.475,.48);float edge=length(max(box,0.))+min(max(box.x,box.y),0.)-.018;if(edge>0.)discard;
 gl_FragColor=vec4(clamp(col,0.,1.),1.);}`;
 let program,buffer,texture,loc,lost=false,raf=0,last=0,elapsed=0,paused=false,onScreen=true;
 const pointer=[0,0],reduce=matchMedia('(prefers-reduced-motion: reduce)');
 function shader(type,code){const s=gl.createShader(type);gl.shaderSource(s,code);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
 function init(){const v=shader(gl.VERTEX_SHADER,vs),f=shader(gl.FRAGMENT_SHADER,fs);program=gl.createProgram();gl.attachShader(program,v);gl.attachShader(program,f);gl.linkProgram(program);gl.deleteShader(v);gl.deleteShader(f);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
 buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const a=gl.getAttribLocation(program,'a');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
 texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);
 loc=Object.fromEntries(['mode','time','strength','pointer'].map(k=>[k,gl.getUniformLocation(program,k)]));gl.uniform1i(gl.getUniformLocation(program,'tex'),0);canvas.dataset.ready='true';}
 function draw(){if(lost)return;const bounds=grid.getBoundingClientRect();if(bounds.width<=0||bounds.height<=0)return;const dpr=Math.min(devicePixelRatio||1,1.5),w=Math.round(bounds.width*dpr),h=Math.round(bounds.height*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
 gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(program);gl.uniform1f(loc.time,elapsed);gl.uniform1f(loc.strength,+strengthInput.value/100);gl.uniform2fv(loc.pointer,pointer);
 cards.forEach((card,i)=>{const r=card.querySelector('.edition-art').getBoundingClientRect();gl.viewport(Math.round((r.left-bounds.left)*dpr),Math.round((bounds.bottom-r.bottom)*dpr),Math.round(r.width*dpr),Math.round(r.height*dpr));gl.uniform1f(loc.mode,i);gl.drawArrays(gl.TRIANGLES,0,6);});}
 function running(){return !lost&&!paused&&!reduce.matches&&!document.hidden&&onScreen;}
 function frame(now){raf=0;if(!running())return;if(!last)last=now;if(now-last>=32){elapsed+=Math.min((now-last)/1000,.1);last=now;draw();}raf=requestAnimationFrame(frame);}
 function sync(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;draw();if(running())raf=requestAnimationFrame(frame);}
 pauseButton.onclick=()=>{paused=!paused;pauseButton.textContent=paused?'播放动效':'暂停动效';pauseButton.setAttribute('aria-pressed',String(paused));sync();};strengthInput.oninput=draw;
 cards.forEach((card,i)=>{card.onclick=()=>{cards.forEach(el=>el.setAttribute('aria-pressed',String(el===card)));status.textContent=editions[i][0]+' · '+editions[i][2]+'。'+(i===4?'明暗和色相同时改变，再叠冷色光泽。':'所有样张使用同一张道具底图。');};card.onpointermove=e=>{if(reduce.matches)return;const r=card.getBoundingClientRect();pointer[0]=(e.clientX-r.left)/r.width-.5;pointer[1]=(e.clientY-r.top)/r.height-.5;if(!running())draw();};card.onpointerleave=()=>{pointer.fill(0);if(!running())draw();};});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;if(raf)cancelAnimationFrame(raf);raf=0;canvas.dataset.ready='false';});canvas.addEventListener('webglcontextrestored',()=>{lost=false;init();sync();});
 document.addEventListener('visibilitychange',sync);reduce.addEventListener('change',sync);new ResizeObserver(draw).observe(grid);new IntersectionObserver(entries=>{onScreen=entries[0].isIntersecting;sync();}).observe(grid);
 // Keep the same gallery/context when preview purchases or rerolls rebuild the shop.
 const baseRenderShop=renderShop;renderShop=function(...args){baseRenderShop(...args);const next=document.querySelector('.shop-panel:not(.weapon-compare):not(.terrain-shop)');if(next&&!next.contains(section))next.prepend(section);};
 try{init();sync();}catch(e){status.textContent='材质初始化失败：'+e.message;canvas.dataset.error=e.message;}
})();

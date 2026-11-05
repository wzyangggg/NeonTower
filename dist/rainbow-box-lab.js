(()=>{'use strict';
const canvas=document.querySelector('#scene'),gl=canvas.getContext('webgl',{antialias:true,preserveDrawingBuffer:true});
try{if(!gl)throw Error('当前设备无法启动 WebGL');
const vs=`attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;
const fs=`precision highp float;
uniform vec2 res;uniform float time,dots,shine,backLit,flowScale,rimScale,rimStrength,yaw,pitch,zoom;
vec3 rainbow(float t){return .58+.42*cos(6.2831853*(t+vec3(0.,.667,.333)));}
// Rounded cube: flat face width 1.72, fillet radius .14, total width 2.
float shape(vec3 p){vec3 q=abs(p)-vec3(.86);return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-.14;}
vec3 normalAt(vec3 p){vec2 e=vec2(.001,0);return normalize(vec3(shape(p+e.xyy)-shape(p-e.xyy),shape(p+e.yxy)-shape(p-e.yxy),shape(p+e.yyx)-shape(p-e.yyx)));}
// Regular cells with independent spot/film rhythms.
float dotMask(vec2 uv){
 vec2 st=(uv+1.)*.5*dots;
 // Regular square cells; diameter 96% of pitch (previous sparse version: 78%).
 return 1.-smoothstep(.466,.492,length(fract(st)-.5));
}
vec3 surface(vec3 p,vec3 n){
 vec3 w=pow(abs(n),vec3(8.));w/=w.x+w.y+w.z;
 float mask=dotMask(p.zy)*w.x+dotMask(p.xz)*w.y+dotMask(p.xy)*w.z;
 // Two animated hue endpoints; lighting interpolates between coloured dark and bright tones.
 vec3 shadowColor=vec3(.035)+rainbow(time*.61+.46)*.32;
 vec3 lightColor=mix(rainbow(time*.43+.14),vec3(1.),.18);
 vec3 backLight=normalize(vec3(.65,-.5,-.8));
 float diffuse=max(dot(n,backLight),0.);
 float illumination=mix(1.,smoothstep(0.,.85,diffuse),backLit);
 float spotFlow=.5+.5*sin(6.2831853*(dot(p,vec3(.21,.16,.14))*flowScale+time*.22));
 float filmFlow=.5+.5*sin(6.2831853*(dot(p,vec3(-.14,.23,.16))*flowScale-time*.57+.23));
 float spotWeight=illumination*mix(.48,1.,spotFlow);
 float filmWeight=mix(.65,1.,filmFlow)*(.32+.68*illumination);
 return min(vec3(.98),mix(shadowColor,lightColor,mix(filmWeight,spotWeight,mask))*1.15);
}
void main(){
 vec2 q=(gl_FragCoord.xy*2.-res)/min(res.y,res.x*1.3);
 if(res.x/res.y<.8)q.y-=.36;
 vec3 ro=zoom*vec3(sin(yaw)*cos(pitch),sin(pitch),cos(yaw)*cos(pitch));
 vec3 f=normalize(-ro),r=normalize(cross(f,vec3(0,1,0))),u=cross(r,f),rd=normalize(f*2.3+q.x*r+q.y*u);
 vec3 col=vec3(.145,.153,.17);
 float gt=(-1.08-ro.y)/rd.y;vec3 gp=ro+rd*gt;
 if(gt>0.){vec2 grid=abs(fract(gp.xz*.8+.5)-.5);float line=1.-smoothstep(.008,.024,min(grid.x,grid.y));col+=line*.045*exp(-length(gp.xz)*.12);}
 float b=dot(ro,rd),dis=b*b-dot(ro,ro)+3.;
 if(dis>0.){
 float nearT=max(0.,-b-sqrt(dis)),farT=-b+sqrt(dis);
 float t=nearT;bool found=false;
 for(int i=0;i<64;i++){float d=shape(ro+rd*t);if(d<.0007){found=true;break;}t+=d;if(t>farT)break;}
 if(found){
 vec3 front=ro+rd*t,nf=normalAt(front);
 // Trace from the far side to obtain the back-facing surface of the SAME closed cube.
 float backT=farT;
 for(int i=0;i<64;i++){float d=shape(ro+rd*backT);if(d<.0007)break;backT-=d;}
 vec3 back=ro+rd*backT,nb=normalAt(back);
 col=surface(back,nb);
 // Front faces carry only white lighting. Their otherwise transparent pixels reveal the inner pattern.
 // View-following softbox + emissive Fresnel: white remains visible at every orbit angle.
 vec3 light=normalize(-rd+r*.65+u*.8);
 vec3 halfV=normalize(light-rd);
 float facing=max(dot(nf,-rd),0.);
 float fres=pow(1.-facing,2.2/rimScale);
 float spec=pow(max(dot(nf,halfV),0.),36.);
 float softSpec=pow(max(dot(nf,halfV),0.),7.);
 float alpha=clamp(shine*(.08+spec*.62+softSpec*.26)+rimStrength*fres*.85,0.,.96);
 col=mix(col,vec3(1.),alpha);
 }
 }
 gl_FragColor=vec4(col,1.);
}`;
function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
const p=gl.createProgram();gl.attachShader(p,shader(gl.VERTEX_SHADER,vs));gl.attachShader(p,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));gl.useProgram(p);
const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);const a=gl.getAttribLocation(p,'a');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
const uniforms=Object.fromEntries(['res','time','dots','shine','backLit','flowScale','rimScale','rimStrength','yaw','pitch','zoom'].map(k=>[k,gl.getUniformLocation(p,k)]));
let yaw=.52,pitch=.34,zoom=5,phase=0,last=0,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,drag=null,frames=0;
const speed=document.querySelector('#speed'),dots=document.querySelector('#dots'),shine=document.querySelector('#shine'),pause=document.querySelector('#pause'),white=document.querySelector('#white');
const controls=[...document.querySelectorAll('aside input')];
const storageKey='rainbow-box-lab.settings.v1',status=document.querySelector('#save-status');
let saved=null;
try{saved=JSON.parse(localStorage.getItem(storageKey));}catch{status.textContent='本机存储不可用，当前参数仍可调整';}
if(saved&&typeof saved==='object'){
 for(const input of controls){const value=saved.controls?.[input.id];
 if(input.type==='checkbox'){if(typeof value==='boolean')input.checked=value;}
 else if(typeof value==='number'&&Number.isFinite(value))input.value=String(Math.max(Number(input.min),Math.min(Number(input.max),value)));}
 if(typeof saved.paused==='boolean')paused=saved.paused;
 for(const [key,min,max]of [['yaw',-1000,1000],['pitch',-1.2,1.2],['zoom',3,9]]){const v=saved[key];if(typeof v==='number'&&Number.isFinite(v)){if(key==='yaw')yaw=Math.max(min,Math.min(max,v));if(key==='pitch')pitch=Math.max(min,Math.min(max,v));if(key==='zoom')zoom=Math.max(min,Math.min(max,v));}}
}
function readouts(){for(const input of controls){const output=document.querySelector('output[for="'+input.id+'"]');if(output)output.value=Number(input.value).toFixed(2)+'×';}}
let syncTimer;
function syncProject(){clearTimeout(syncTimer);syncTimer=setTimeout(async()=>{const controlsData=Object.fromEntries(controls.map(i=>[i.id,i.type==='checkbox'?i.checked:Number(i.value)]));try{const r=await fetch('/api/rainbow-box-preset',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({controls:controlsData})});if(!r.ok)throw Error('save');status.textContent='参数已保存，游戏已同步';}catch{status.textContent='参数已存本机；项目同步不可用';}},150);}
function save(){try{localStorage.setItem(storageKey,JSON.stringify({controls:Object.fromEntries(controls.map(i=>[i.id,i.type==='checkbox'?i.checked:Number(i.value)])),paused,yaw,pitch,zoom}));status.textContent='参数已自动保存';}catch{status.textContent='本机存储不可用，当前参数仍可调整';}}
for(const input of controls)input.addEventListener('input',()=>{readouts();save();syncProject();});readouts();
let edited=false;for(const input of controls)input.addEventListener('input',()=>{edited=true;});
fetch('rainbow-box-preset.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(data=>{if(edited||!data?.controls)return;for(const i of controls){const v=data.controls[i.id];if(i.type==='checkbox'){if(typeof v==='boolean')i.checked=v;}else if(typeof v==='number'&&Number.isFinite(v))i.value=String(Math.max(Number(i.min),Math.min(Number(i.max),v)));}readouts();save();}).catch(()=>{});
function sync(){pause.textContent=paused?'播放':'暂停';}sync();pause.onclick=()=>{paused=!paused;sync();save();};document.querySelector('#reset').onclick=()=>{yaw=.52;pitch=.34;zoom=5;save();};
canvas.onpointerdown=e=>{drag=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);};canvas.onpointermove=e=>{if(!drag)return;yaw-=(e.clientX-drag[0])*.006;pitch=Math.max(-1.2,Math.min(1.2,pitch+(e.clientY-drag[1])*.006));drag=[e.clientX,e.clientY];};canvas.onpointerup=canvas.onpointercancel=()=>{drag=null;save();};
canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(3,Math.min(9,zoom+e.deltaY*.005));save();},{passive:false});
function draw(now){const dt=Math.min((now-last)/1000,.05);last=now;if(!paused&&!document.hidden)phase+=dt*Number(speed.value);const d=Math.min(devicePixelRatio,2),w=Math.round(innerWidth*d),h=Math.round(innerHeight*d);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}gl.viewport(0,0,w,h);gl.uniform2f(uniforms.res,w,h);for(const [k,v]of Object.entries({time:phase,dots:Number(dots.value),shine:shine.checked?Number(white.value):0,backLit:document.querySelector('#back-light').checked?1:0,flowScale:Number(document.querySelector('#flow-scale').value),rimScale:Number(document.querySelector('#rim-scale').value),rimStrength:shine.checked?Number(document.querySelector('#rim-strength').value):0,yaw,pitch,zoom}))gl.uniform1f(uniforms[k],v);gl.drawArrays(gl.TRIANGLES,0,3);frames++;requestAnimationFrame(draw);}requestAnimationFrame(draw);
globalThis.RainbowBox={gl,get frames(){return frames;},get phase(){return phase;}};
}catch(e){document.querySelector('#error').textContent=e.message;throw e;}
})();

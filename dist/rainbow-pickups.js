(()=>{'use strict';
const states=new WeakMap();let settings={speed:.15,'flow-scale':3.05,'rim-scale':.75,'rim-strength':1.3,dots:3,white:1.8,shine:true,'back-light':true},lastRead=-Infinity,pending=false;
function readSettings(){const now=performance.now();if(now-lastRead>=500&&!pending){lastRead=now;pending=true;fetch('rainbow-box-preset.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('preset');return r.json();}).then(data=>{if(data?.controls)settings=data.controls;}).catch(()=>{}).finally(()=>pending=false);}return settings;}
function value(s,k,f,min,max){const v=s[k];return typeof v==='number'&&Number.isFinite(v)?Math.max(min,Math.min(max,v)):f;}
const vertex=`attribute vec2 a;uniform mat4 vp;uniform vec3 center;uniform float extent;varying vec2 q;void main(){q=a*1.8;vec3 world=center+vec3(q.x,q.y*.53217155,-q.y*.84663655)*extent;gl_Position=vp*vec4(world,1.);}`;
const fragment=`precision highp float;
uniform float time,dots,shine,backLit,flowScale,rimScale,rimStrength,angle;uniform sampler2D icon;uniform float iconEnabled;varying vec2 q;
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

vec3 turn(vec3 p){float a=angle,c=cos(a),s=sin(a);p=vec3(c*p.x-s*p.z,p.y,s*p.x+c*p.z);c=cos(.56);s=sin(.56);p=vec3(p.x,c*p.y+s*p.z,-s*p.y+c*p.z);c=cos(.38);s=sin(.38);return vec3(c*p.x+s*p.y,-s*p.x+c*p.y,p.z);}
// The enlarged billboard can extend past the rotating shell silhouette.
vec4 iconAt(vec2 point){
 vec2 uv=vec2(point.x,-point.y)/(1.35*1.5/.75)+.5;
 if(iconEnabled>.5&&min(uv.x,uv.y)>=0.&&max(uv.x,uv.y)<=1.)return texture2D(icon,uv);
 return vec4(0.);
}
void main(){vec4 ui=iconAt(q);vec3 ro=turn(vec3(q,4.)),rd=turn(vec3(0,0,-1));float b=dot(ro,rd),dis=b*b-dot(ro,ro)+3.;if(dis<=0.){if(ui.a==0.)discard;gl_FragColor=ui;return;}float t=-b-sqrt(dis),farT=-b+sqrt(dis);bool found=false;
for(int i=0;i<56;i++){float d=shape(ro+rd*t);if(d<.001){found=true;break;}t+=d;if(t>farT)break;}if(!found){if(ui.a==0.)discard;gl_FragColor=ui;return;}
vec3 front=ro+rd*t,nf=normalAt(front);float bt=farT;
for(int i=0;i<56;i++){float d=shape(ro+rd*bt);if(d<.001)break;bt-=d;}
vec3 back=ro+rd*bt,col=surface(back,normalAt(back));
// Gameplay-only boost before the icon/front reflection: lift coloured rear film, not white light.
float luminance=dot(col,vec3(.2126,.7152,.0722));
col=max(vec3(0.),mix(vec3(luminance),col,1.22))*1.6;
col/=max(1.,max(col.r,max(col.g,col.b))/.98);
// Billboard UI sits inside the shell, between the coloured rear and front reflection.
float iconAlpha=ui.a;col=mix(col,ui.rgb,iconAlpha);
vec3 light=turn(normalize(vec3(.65,.8,1.))),halfV=normalize(light-rd);float facing=max(dot(nf,-rd),0.);float fres=pow(1.-facing,2.2/rimScale),spec=pow(max(dot(nf,halfV),0.),36.),softSpec=pow(max(dot(nf,halfV),0.),7.);
float alpha=clamp(shine*(.08+spec*.62+softSpec*.26)+rimStrength*fres*.85,0.,.96);alpha*=mix(1.,.20,iconAlpha);col=mix(col,vec3(1),alpha);gl_FragColor=vec4(col,1.);}`;
function init(r){const gl=r.gl,compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};const p=gl.createProgram();gl.attachShader(p,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(p,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,1,1,-1,-1,1,1,-1,1]),gl.STATIC_DRAW);
const textures={};for(const kind of ['shield','health']){const tex=gl.createTexture();textures[kind]=tex;gl.bindTexture(gl.TEXTURE_2D,tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,0]));for(const [key,v]of [[gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,key,v);const image=new Image();image.onload=()=>{if(!gl.isTexture(tex))return;const active=gl.getParameter(gl.ACTIVE_TEXTURE),previous=gl.getParameter(gl.TEXTURE_BINDING_2D);gl.bindTexture(gl.TEXTURE_2D,tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.bindTexture(gl.TEXTURE_2D,previous);gl.activeTexture(active);};image.src='assets/shop-drop-icons/'+kind+'-32.png';}
return {p,buffer,textures,context:r.program,u:Object.fromEntries(['vp','center','extent','time','dots','shine','backLit','flowScale','rimScale','rimStrength','angle','icon','iconEnabled'].map(k=>[k,gl.getUniformLocation(p,k)])),a:gl.getAttribLocation(p,'a')};}
globalThis.RainbowPickups={render(r){const items=r.rainbowPickups;if(!items?.length)return;let state=states.get(r);if(!state||state.context!==r.program){state=init(r);states.set(r,state);}const gl=r.gl,{p,buffer,textures,u,a}=state,s={...readSettings(),...r.rainbowMaterial};gl.useProgram(p);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);gl.uniformMatrix4fv(u.vp,false,r.vp);gl.uniform1i(u.icon,0);gl.activeTexture(gl.TEXTURE0);gl.depthMask(false);gl.disable(gl.CULL_FACE);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
const enabled=s.shine!==false;for(const [k,v]of Object.entries({dots:value(s,'dots',3,3,12),shine:enabled?value(s,'white',1,0,3):0,backLit:s['back-light']===false?0:1,flowScale:value(s,'flow-scale',1,.1,6),rimScale:value(s,'rim-scale',1,.1,4),rimStrength:enabled?value(s,'rim-strength',1,0,3):0}))gl.uniform1f(u[k],v);
for(const q of items){const hasIcon=q.icon!==false;gl.uniform1f(u.iconEnabled,hasIcon?1:0);gl.uniform1f(u.extent,hasIcon?21*.75:21);gl.uniform3f(u.center,q.x-325,q.height,(q.y-300)*1.06);gl.uniform1f(u.time,(q.clock??r.rainbowPickupTime??0)*value(s,'speed',.15,0,1)*3);gl.uniform1f(u.angle,(q.angle??.4)+q.age*2.85);gl.bindTexture(gl.TEXTURE_2D,textures[q.kind]||textures.shield);gl.drawArrays(gl.TRIANGLES,0,6);}gl.disable(gl.BLEND);gl.depthMask(true);},snapshot(r){const s=states.get(r);return s?Object.fromEntries(['time','angle','dots','shine','backLit','flowScale','rimScale','rimStrength'].map(k=>[k,r.gl.getUniform(s.p,s.u[k])])):null;},count(r){return r.rainbowPickups?.length||0;}};
})();

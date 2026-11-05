'use strict';
// One resident mesh, GPU skinning. Per frame only bone matrices and pose uniforms change.
globalThis.CatPlayer=(()=>{
 let model=null,image=null,loading=null,gpu=null,instance=null,uploads=0,error='',selected='cat',emission=.45;
 let scarfPose=null,scarfNodes=null;
 // Disabled in normal play; keep the experiment available for local tuning.
 const scarfEnabled=new URLSearchParams(location.search).get('scarf')==='1';
 const scarfPoints=new Float32Array(13*3);
 const matrices=new Float32Array(17*16),key='neon-player-avatar';
 try{selected=new URLSearchParams(location.search).get('avatar')||localStorage.getItem(key)||'cat';}catch{}
 if(!['cat','bear','robot','fox','bunny'].includes(selected))selected='cat';
 try{const saved=localStorage.getItem('neon-cat-emission');if(saved!==null&&Number.isFinite(+saved))emission=Math.max(0,Math.min(1,+saved));}catch{}
 function setEmission(value){if(!Number.isFinite(+value))return;emission=Math.max(0,Math.min(1,+value));try{localStorage.setItem('neon-cat-emission',String(emission));}catch{}const output=document.getElementById('cat-emission-value');if(output)output.textContent=Math.round(emission*100)+'%';}
 function select(value){selected=['cat','bear','robot','fox','bunny'].includes(value)?value:'cat';try{const url=new URL(location.href);if(url.searchParams.has('avatar')){url.searchParams.set('avatar',selected);history.replaceState(null,'',url);}}catch{}try{localStorage.setItem(key,selected);}catch{}const control=document.getElementById('player-avatar');if(control)control.value=selected;globalThis.CharacterEyes?.sync();globalThis.syncBearTextureSettings?.();}
 function load(){
  globalThis.BearPlayer?.load();
  if(loading)return loading;
  loading=Promise.all([fetch('assets/player-cat/cat.json').then(r=>{if(!r.ok)throw Error('猫模型加载失败');return r.json();}),new Promise((resolve,reject)=>{image=new Image();image.onload=resolve;image.onerror=()=>reject(Error('猫贴图加载失败'));image.src='assets/player-cat/cat.png';})]).then(([data])=>{
   if(data.version!==1||data.bones.length!==17||data.stride!==14||data.vertices.length%42||!data.vertices.every(Number.isFinite))throw Error('猫模型格式错误');
   for(const clip of Object.values(data.clips))for(const frame of clip.frames)if(frame.length!==272||!frame.every(Number.isFinite))throw Error('猫动作格式错误');
   if(!data.bind?.pelvis||!data.bind?.['foot.L'])throw Error('猫骨骼绑定信息缺失');
   // Scarf shares the resident buffer; markers 17/18 bypass bone indexing.
   const cloth=[];
   const vertex=(p,n,uv,kind)=>cloth.push(...p,...n,...uv,kind,0,0,1,0,0);
   const quad=(a,b,c,d,kind)=>{for(const ids of [[a,b,c],[a,c,d],[c,b,a],[d,c,a]])for(const v of ids)vertex(v,[0,0,1],[0,0],kind);};
   for(let i=0;i<40;i++){const a=i/40,b=(i+1)/40;quad([a,-1,0],[b,-1,0],[b,1,0],[a,1,0],17);}
   for(let i=0;i<32;i++){const a=i*Math.PI/16,b=(i+1)*Math.PI/16;quad([Math.cos(a)*.145,.335,Math.sin(a)*.145],[Math.cos(b)*.145,.335,Math.sin(b)*.145],[Math.cos(b)*.15,.405,Math.sin(b)*.15],[Math.cos(a)*.15,.405,Math.sin(a)*.15],18);}
   model={...data,vertices:new Float32Array(scarfEnabled?[...data.vertices,...cloth]:data.vertices)};
  }).catch(e=>{error=e.message;console.warn('猫预览不可用，保留原主角：',e);});return loading;
 }
 function sample(clip,seconds,out){
  const frames=clip.frames,n=frames.length-1,f=((seconds*clip.fps)%n+n)%n,i=Math.floor(f),t=f-i,a=frames[i],b=frames[i+1];
  for(let j=0;j<out.length;j++)out[j]=a[j]+(b[j]-a[j])*t;
 }
 const idle=new Float32Array(272);
 const normalGLSL=`vec3 skinNormal(mat3 m,vec3 v){return normalize(mat3(cross(m[1],m[2]),cross(m[2],m[0]),cross(m[0],m[1]))*v);}`;
 const unit=v=>{const n=Math.hypot(...v)||1;return v.map(x=>x/n);},dot=(a,b)=>a.reduce((sum,v,i)=>sum+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 function basis(a,b){const axis=unit(b.map((v,i)=>v-a[i])),seed=Math.abs(axis[0])<.9?[1,0,0]:[0,0,1],along=dot(seed,axis),side=unit(seed.map((v,i)=>v-axis[i]*along));return [side,axis,cross(side,axis)];}
 function segment(name,a,b){
  const bind=model.bind[name],source=basis(bind.head,bind.tail),target=basis(a,b),stretch=Math.hypot(...b.map((v,i)=>v-a[i]))/Math.hypot(...bind.tail.map((v,i)=>v-bind.head[i])),offset=model.bones.indexOf(name)*16;
  for(let col=0;col<3;col++)for(let row=0;row<3;row++)matrices[offset+col*4+row]=target[0][row]*source[0][col]+target[1][row]*source[1][col]*stretch+target[2][row]*source[2][col];
  for(let row=0;row<3;row++)matrices[offset+12+row]=a[row]-bind.head.reduce((sum,v,col)=>sum+matrices[offset+col*4+row]*v,0);
  matrices[offset+3]=matrices[offset+7]=matrices[offset+11]=0;matrices[offset+15]=1;
 }
 function draw(at){
  if(selected==='bear')return globalThis.BearPlayer?.draw(at)||false;
  if(['fox','bunny'].includes(selected))return globalThis.IslandPlayers?.draw(selected,at)||false;
  if(selected!=='cat'||!model||!image?.naturalWidth)return false;
  sample(model.clips[at.seated?'sit':'idle'],at.time,idle);matrices.set(idle);
  const blend=at.mounted?0:Math.max(0,Math.min(1,at.blend||0));
  // Reuse the robot's actual planted contacts and solved knees, not a walk cycle.
  const bodyLift=at.legPoses&&!at.seated?(at.hipHeight/64-model.bind.pelvis.head[1])-idle[model.bones.indexOf('pelvis')*16+13]:0;
  for(let i=0;i<17;i++)matrices[i*16+13]+=bodyLift;
  const legs=[];
  if(at.legPoses&&!at.seated)for(let j=0;j<2;j++){
   const side=j===0?'L':'R',pose=at.legPoses[j],local=v=>[(v[0]-at.x)/64,v[1]/64,(v[2]-at.z)/64],hip=local(pose.hip),knee=local(pose.knee),foot=local(pose.foot),bind=model.bind['foot.'+side];
   // Robot contacts use y=4; cat sole sits at y=2 on the floor surface.
   const ankle=[foot[0],foot[1]+bind.head[1]-2/64,foot[2]];
   segment('thigh.'+side,hip,knee);segment('shin.'+side,knee,ankle);
   const offset=model.bones.indexOf('foot.'+side)*16;
   for(let i=0;i<16;i++)matrices[offset+i]=i%5===0?1:0;
   for(let i=0;i<3;i++)matrices[offset+12+i]=ankle[i]-bind.head[i];
   legs.push({side,hip,knee,ankle,contact:foot});
  }
  // The face stays towards the camera; the robot's pitch/roll springs are applied
  // around the attached neck, never accumulated into position or travel yaw.
  const pitch=(at.headPitch||0)-(at.cameraTilt??Math.atan2(700,440)),roll=at.headRoll||0,cp=Math.cos(pitch),sp=Math.sin(pitch),cr=Math.cos(roll),sr=Math.sin(roll),pivot=model.bind.head.head[1]+bodyLift;
  for(const name of ['head','ear.L','ear.R']){
   const offset=model.bones.indexOf(name)*16;
   for(let col=0;col<4;col++){
    const x=col===0?1:0,y=col===1?1:col===3?bodyLift:0,z=col===2?1:0,w=col===3?1:0,rx=cr*x-sr*(y-pivot*w),ry=sr*x+cr*(y-pivot*w);
    matrices[offset+col*4]=rx;matrices[offset+col*4+1]=pivot*w+cp*ry-sp*z;matrices[offset+col*4+2]=sp*ry+cp*z;matrices[offset+col*4+3]=w;
   }
  }
  if(scarfEnabled)updateScarf(at,bodyLift);
  instance={...at,blend,bodyLift,legs,emission};return true;
 }
 // World-space particles keep their own trajectory when the neck turns.
 // Only the attachment is pinned; distance constraints pull the loose tail along.
 // Smooth deterministic noise: continuous gusts, independent of particle momentum.
 function scarfNoise(x,seed){const i=Math.floor(x),f=x-i,u=f*f*(3-2*f),hash=n=>{const v=Math.sin(n*127.1+seed*311.7)*43758.5453;return (v-Math.floor(v))*2-1;};return hash(i)*(1-u)+hash(i+1)*u;}
 function updateScarf(at,lift){
  const size=at.size,root=[at.x/size-.125,at.y/size+.375+lift,at.z/size],dt=scarfPose?at.time-scarfPose.time:0;
  const reset=!scarfNodes||dt<0||dt>.5||Math.hypot(...root.map((v,k)=>v-(scarfPose?.root[k]??v)))>2;
  if(reset)scarfNodes=Array.from({length:13},(_,i)=>{const p=[root[0]-i*.076,root[1]+.06*Math.sin(i/12*Math.PI),root[2]-.01*i];return {p,old:[...p]};});
  else if(dt>0){
   const steps=Math.ceil(dt/ (1/120)),h=dt/steps;
   for(let step=1;step<=steps;step++){
    const anchor=root.map((v,k)=>scarfPose.root[k]+(v-scarfPose.root[k])*step/steps),clock=scarfPose.time+h*step;
    for(let i=1;i<13;i++){
     // Light gauze loses 96% of free velocity in 0.1s.
     const n=scarfNodes[i],before=[...n.p],damp=Math.exp(-32*h);
     // Mild ambient air, buoyancy and travelling flutter, rather than a target yaw.
     const force=[-.32,.36*Math.sin(clock*3.2-i*.55)-.10,.24*Math.sin(clock*2.1-i*.6)];
     for(let k=0;k<3;k++)n.p[k]+=(n.p[k]-n.old[k])*damp+force[k]*h*h;
     n.old=before;
    }
    for(let pass=0;pass<8;pass++){
     scarfNodes[0].p=[...anchor];
     for(let i=1;i<13;i++){
      const a=scarfNodes[i-1].p,b=scarfNodes[i].p,d=b.map((v,k)=>v-a[k]),length=Math.hypot(...d);
      // Slack is allowed: the fabric can bunch and bend instead of acting as a rod.
      if(length>.076){const correction=(length-.076)/length;for(let k=0;k<3;k++){if(i>1)a[k]+=d[k]*correction*.5;b[k]-=d[k]*correction*(i===1?1:.5);}}
     }
    }
    scarfNodes[0].p=[...anchor];
   }
  }
  scarfPose={time:at.time,root};
  const origin=[at.x/size,at.y/size,at.z/size];
  for(let i=0;i<13;i++){
   const t=i/12,envelope=t*t*(3-2*t),clock=at.time;
   // Broad floating motion plus smaller travelling wrinkles. Root stays pinned.
   const gust=[
    .025*scarfNoise(clock*.65-t*1.5,1),
    .11*scarfNoise(clock*.85-t*2.1,2)+.035*scarfNoise(clock*1.7-t*4,3),
    .075*scarfNoise(clock*.7-t*1.7,4)+.025*scarfNoise(clock*1.4-t*3.2,5)
   ];
   for(let k=0;k<3;k++)scarfPoints[i*3+k]=scarfNodes[i].p[k]-origin[k]+gust[k]*envelope;
  }
 }
 // All passes interpolate the same particle chain; the resident mesh stays fixed.
 const scarfGLSL=`uniform float scarfTime;uniform vec3 scarfPoints[13];uniform float scarfLift;
 vec3 scarfCenter(float t){float f=clamp(t,0.,1.)*12.;int i=int(min(floor(f),11.));return mix(scarfPoints[i],scarfPoints[i+1],f-float(i));}
 vec3 scarfPoint(vec3 v,float kind){if(kind>17.5)return v+vec3(0.,scarfLift,0.);
 float t=clamp(v.x,0.,1.),w=v.y,phase=scarfTime*4.-t*9.;
 vec3 tangent=scarfCenter(min(t+.025,1.))-scarfCenter(max(t-.025,0.));
 vec3 side=normalize(cross(tangent,vec3(0.,1.,.3))+vec3(0.,0.,.00001));
 float width=.085*(1.-.35*t)*(t>.94?1.-.42*(t-.94)/.06:1.);
 return scarfCenter(t)+side*w*width+vec3(0.,w*.018*sin(phase)*t,0.);}
 vec3 scarfNormal(vec3 v,float kind){if(kind>17.5)return normalize(vec3(v.x,0.,v.z));vec3 a=scarfPoint(v+vec3(.001,0.,0.),kind)-scarfPoint(v-vec3(.001,0.,0.),kind);vec3 b=scarfPoint(v+vec3(0.,.001,0.),kind)-scarfPoint(v-vec3(0.,.001,0.),kind);return normalize(cross(a,b));}`;
 function scarfUniforms(gl,u){gl.uniform1f(u.scarfTime,instance.time);gl.uniform3fv(u['scarfPoints[0]'],scarfPoints);gl.uniform1f(u.scarfLift,instance.bodyLift);}
 function initialize(r){
  if(gpu?.marker===r.program)return gpu;
  const gl=r.gl,compile=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
  const vs=compile(gl.VERTEX_SHADER,`attribute vec3 p;attribute vec3 n;attribute vec2 uv;attribute vec3 joints;attribute vec3 weights;uniform mat4 bones[17];uniform mat4 vp;uniform vec3 origin;uniform float size;uniform float flash;varying vec2 texcoord;varying vec3 tone;varying float cloth;varying float eyeSurface;uniform vec3 keyLightDirection;uniform vec3 topLight;uniform vec2 clubLight;uniform vec3 rearLeftColor;uniform vec3 rearRightColor;${r.surfaceShaderGLSL}${normalGLSL}${scarfGLSL}void main(){mat4 skin=bones[int(joints.x>18.5?4.:min(joints.x,16.))]*weights.x+bones[int(joints.y)]*weights.y+bones[int(joints.z)]*weights.z;vec3 at=(skin*vec4(p,1.)).xyz;vec3 normal=skinNormal(mat3(skin),n);cloth=step(16.5,joints.x)*(1.-step(18.5,joints.x));eyeSurface=step(18.5,joints.x);if(cloth>.5){at=scarfPoint(p,joints.x);normal=scarfNormal(p,joints.x); }float light=.55+.45*max(0.,dot(normal,normalize(vec3(-.4,.85,.45))));tone=surfaceShader>.5?softToonShade(vec3(1.),normal,keyLightDirection,topLight,rearLeftColor*clubLight.x,rearRightColor*clubLight.y,0.,0.):vec3(.3+.8*light);texcoord=uv;gl_Position=vp*vec4(origin+at*size,1.);}`);
  const fs=compile(gl.FRAGMENT_SHADER,`precision mediump float;uniform sampler2D image;uniform float flash;uniform float emission;uniform vec2 gaze;uniform vec3 pupilColor;uniform float pupilSize;uniform vec3 eyeWhiteColor;uniform float pupilSlit;varying vec2 texcoord;varying vec3 tone;varying float cloth;varying float eyeSurface;${globalThis.CharacterEyes.shaderGLSL}void main(){vec4 c=cloth>.5?vec4(.86,.045,.085,1.):texture2D(image,texcoord);if(eyeSurface>.5){c=vec4(characterIris(texcoord,gaze,eyeWhiteColor,pupilColor,pupilSize,pupilSlit),1.);}if(c.a<.1)discard;gl_FragColor=vec4(mix(mix(c.rgb*(eyeSurface>.5?vec3(.9):tone)*.78,c.rgb*1.08,emission),vec3(1.,.95,.7),flash),1.);}`);
  const program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,model.vertices,gl.STATIC_DRAW);uploads++;
  const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
  for(const [p,v]of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,p,v);
  gpu={marker:r.program,program,buffer,texture,u:Object.fromEntries(['scarfTime','scarfPoints[0]','scarfLift','bones[0]','vp','origin','size','image','flash','emission','gaze','pupilColor','pupilSize','eyeWhiteColor','pupilSlit','surfaceShader','keyLightDirection','topLight','clubLight','rearLeftColor','rearRightColor'].map(n=>[n,gl.getUniformLocation(program,n)]))};return gpu;
 }
 function render(r){
  globalThis.IslandPlayers?.render(r);globalThis.BearPlayer?.render(r);
  if(!instance||!model)return;const gl=r.gl,g=initialize(r),u=g.u;
  gl.useProgram(g.program);scarfUniforms(gl,u);gl.disable(gl.BLEND);gl.depthMask(true);gl.uniformMatrix4fv(u.vp,false,r.vp);gl.uniformMatrix4fv(u['bones[0]'],false,matrices);gl.uniform3f(u.origin,instance.x,instance.y,instance.z);gl.uniform1f(u.size,instance.size);gl.uniform1f(u.flash,instance.flash||0);gl.uniform1f(u.emission,emission);const gaze=globalThis.CharacterGaze?.current;gl.uniform2f(u.gaze,gaze?.x||0,gaze?.y||0);gl.uniform3fv(u.pupilColor,globalThis.CharacterEyes?.rgb('cat')||[.38,.72,.84]);gl.uniform1f(u.pupilSize,globalThis.CharacterEyes?.get('cat').size||.676);gl.uniform3fv(u.eyeWhiteColor,globalThis.CharacterEyes.whiteRGB('cat'));gl.uniform1f(u.pupilSlit,globalThis.CharacterEyes.get('cat').slit);
  gl.uniform1f(u.surfaceShader,r.surfaceShaderMode());gl.uniform3fv(u.keyLightDirection,r.keyLightDirection||[.1,1,-.1]);gl.uniform3fv(u.topLight,r.topLight||[.3,.6,.5]);gl.uniform2f(u.clubLight,r.clubCyan??.8,r.clubMagenta??.65);gl.uniform3fv(u.rearLeftColor,r.rearLeftColor||[.12,.92,.78]);gl.uniform3fv(u.rearRightColor,r.rearRightColor||[.85,.12,.48]);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,g.texture);gl.uniform1i(u.image,0);
  gl.bindBuffer(gl.ARRAY_BUFFER,g.buffer);r.attributes(g.program,[['p',3],['n',3],['uv',2],['joints',3],['weights',3]],56);gl.drawArrays(gl.TRIANGLES,0,model.vertices.length/14);
 }
 // Draw the exact same skinned surface into depth/normal and silhouette buffers.
 // These passes must occlude weapons and scenery behind the opaque cat too.
 function renderGeometry(r,matrix,mode){
  globalThis.IslandPlayers?.renderGeometry(r,matrix,mode);globalThis.BearPlayer?.renderGeometry(r,matrix,mode);
  if(!instance||!model)return;
  const gl=r.gl,g=initialize(r);
  if(!g.geometry){
   const compile=(type,src)=>{const shader=gl.createShader(type);gl.shaderSource(shader,src);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));return shader;};
   const vertex=compile(gl.VERTEX_SHADER,`attribute vec3 p;attribute vec3 n;attribute vec3 joints;attribute vec3 weights;uniform mat4 bones[17];uniform mat4 matrix;uniform vec3 origin;uniform float size;varying vec3 normal;${normalGLSL}${scarfGLSL}void main(){mat4 skin=bones[int(joints.x>18.5?4.:min(joints.x,16.))]*weights.x+bones[int(joints.y)]*weights.y+bones[int(joints.z)]*weights.z;vec3 at=(skin*vec4(p,1.)).xyz;normal=skinNormal(mat3(skin),n);if(joints.x>16.5&&joints.x<18.5){at=scarfPoint(p,joints.x);normal=scarfNormal(p,joints.x);}gl_Position=matrix*vec4(origin+at*size,1.);}`);
   const fragment=compile(gl.FRAGMENT_SHADER,`precision highp float;uniform float mode;uniform float emission;varying vec3 normal;vec2 packDepth(float v){vec2 e=fract(min(v,.999999)*vec2(1.,255.));e.x-=e.y/255.;return e;}vec2 octNormal(vec3 n){n/=abs(n.x)+abs(n.y)+abs(n.z);vec2 o=n.xy;if(n.z<0.)o=(1.-abs(o.yx))*sign(o.xy+vec2(.00001));return o*.5+.5;}void main(){vec2 depth=packDepth(gl_FragCoord.z);if(mode<.5)gl_FragColor=vec4(depth,1.,1.);else if(mode<1.5){vec2 oct=octNormal(normalize(normal));gl_FragColor=vec4(depth,oct.x*.49,oct.y);}else if(mode<2.5)gl_FragColor=vec4(depth,0.,1.);else gl_FragColor=vec4(vec3(emission),1.);}`);
   const program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
   g.geometry={program,u:Object.fromEntries(['scarfTime','scarfPoints[0]','scarfLift','bones[0]','matrix','origin','size','mode','emission'].map(n=>[n,gl.getUniformLocation(program,n)]))};
  }
  const {program,u}=g.geometry;gl.useProgram(program);scarfUniforms(gl,u);gl.uniformMatrix4fv(u['bones[0]'],false,matrices);gl.uniformMatrix4fv(u.matrix,false,matrix);gl.uniform3f(u.origin,instance.x,instance.y,instance.z);gl.uniform1f(u.size,instance.size);gl.uniform1f(u.mode,mode);gl.uniform1f(u.emission,emission);
  gl.bindBuffer(gl.ARRAY_BUFFER,g.buffer);r.attributes(program,[['p',3],['n',3],['uv',2],['joints',3],['weights',3]],56);gl.drawArrays(gl.TRIANGLES,0,model.vertices.length/14);
 }
 const card=document.querySelector('#pause-panel .pause-volume');
 if(card){const label=document.createElement('label');label.className='player-avatar-setting';label.innerHTML='主角模型 <select id="player-avatar" aria-label="主角模型"><option value="cat">耳机猫（预览）</option><option value="bear">愤怒熊</option><option value="fox">狐狸</option><option value="bunny">兔子</option><option value="robot">原版机器人</option></select>';card.after(label);label.querySelector('select').value=selected;label.querySelector('select').addEventListener('change',e=>select(e.target.value));
 const glow=document.createElement('label');glow.className='cat-emission-setting';glow.innerHTML='<span>角色自发光 <output id="cat-emission-value">'+Math.round(emission*100)+'%</output></span><input id="cat-emission" aria-label="角色自发光强度" type="range" min="0" max="100" value="'+Math.round(emission*100)+'">';label.after(glow);glow.querySelector('input').addEventListener('input',e=>setEmission(+e.target.value/100));}
 const avatar=document.getElementById('player-avatar');
 if(avatar){const panel=document.createElement('div');panel.className='cat-emission-setting';panel.id='bear-texture-settings';const t=globalThis.BearPlayer.texture;panel.innerHTML='<label>熊头部缩放 <output id="bear-head-scale-value"></output><input id="bear-head-scale" aria-label="熊头部缩放" type="range" min="50" max="150" value="'+Math.round(BearPlayer.headScale*100)+'"></label><button type="button" id="bear-head-reset">恢复头部大小</button><label>熊贴图亮度 <output id="bear-brightness-value"></output><input id="bear-brightness" aria-label="熊贴图亮度" type="range" min="25" max="300" value="'+Math.round(t.brightness*100)+'"></label><label>熊贴图色相 <output id="bear-hue-value"></output><input id="bear-hue" aria-label="熊贴图色相" type="range" min="-180" max="180" value="'+t.hue+'"></label><button type="button" id="bear-texture-reset">恢复熊原贴图</button>';document.getElementById('cat-emission').closest('label').after(panel);
 const update=()=>{panel.hidden=selected!=='bear';const eyes=document.querySelector('.eye-appearance-settings');if(eyes)eyes.hidden=selected==='bear';const t=BearPlayer.texture;document.getElementById('bear-head-scale-value').textContent=Math.round(BearPlayer.headScale*100)+'%';document.getElementById('bear-head-scale').value=Math.round(BearPlayer.headScale*100);document.getElementById('bear-brightness-value').textContent=Math.round(t.brightness*100)+'%';document.getElementById('bear-hue-value').textContent=t.hue+'°';};
 panel.querySelector('#bear-brightness').oninput=e=>{BearPlayer.setTexture({brightness:+e.target.value/100});update();};panel.querySelector('#bear-hue').oninput=e=>{BearPlayer.setTexture({hue:+e.target.value});update();};panel.querySelector('#bear-head-scale').oninput=e=>{BearPlayer.setHeadScale(+e.target.value/100);update();};panel.querySelector('#bear-head-reset').onclick=()=>{BearPlayer.setHeadScale(1);update();};panel.querySelector('#bear-texture-reset').onclick=()=>{BearPlayer.setTexture({brightness:1,hue:0});panel.querySelector('#bear-brightness').value=100;panel.querySelector('#bear-hue').value=0;update();};globalThis.syncBearTextureSettings=update;avatar.addEventListener('change',update);update();}
 // Pause keeps the scene visible; this crop follows the player for live tuning.
 const pausePanel=document.getElementById('pause-panel');
 if(pausePanel){const preview=document.createElement('figure');preview.className='pause-avatar-preview';preview.innerHTML='<canvas width="320" height="384" aria-label="角色实时预览"></canvas><figcaption>已暂停 · 调节实时预览</figcaption>';pausePanel.append(preview);const view=preview.querySelector('canvas'),ctx=view.getContext('2d');
 globalThis.updatePauseAvatarPreview=(source,vp,player)=>{if(pausePanel.hidden||!player)return;const v=[player.x-325,35,(player.y-300)*1.06,1],q=[0,1,2,3].map(row=>v.reduce((sum,n,j)=>sum+vp[j*4+row]*n,0));if(q[3]<=0)return;const rect=source.getBoundingClientRect(),scale=source.width/rect.width,cx=(q[0]/q[3]+1)*source.width/2,cy=(1-q[1]/q[3])*source.height/2,w=110*scale,h=132*scale;ctx.clearRect(0,0,view.width,view.height);ctx.drawImage(source,cx-w/2,cy-h/2,w,h,0,0,view.width,view.height);};}
 return {load,select,setEmission,draw,render,renderGeometry,get scarfSurface(){return Array.from({length:13},(_,i)=>Array.from(scarfPoints.slice(i*3,i*3+3)));},get scarf(){return scarfNodes?.map(n=>[...n.p]);},get emission(){return emission;},get pose(){return {bones:model?.bones,bind:model?.bind,matrices:Array.from(matrices),instance};},begin(){globalThis.BearPlayer?.begin();globalThis.IslandPlayers?.begin();instance=null;},get ready(){return selected==='bear'?!!globalThis.BearPlayer?.ready:['fox','bunny'].includes(selected)?!!globalThis.IslandPlayers?.ready(selected):!!model&&!!image?.naturalWidth;},get selected(){return selected;},get stats(){return {ready:this.ready,selected,uploads,bones:model?.bones.length||0,vertices:(model?.vertices.length||0)/14,instance:instance?{...instance}:null,error};}};
})();

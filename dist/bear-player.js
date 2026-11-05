'use strict';
// One resident mesh, GPU skinning. Per frame only bone matrices and pose uniforms change.
globalThis.BearPlayer=(()=>{
 let model=null,image=null,loading=null,gpu=null,instance=null,uploads=0,error='',emission=.45;
 const matrices=new Float32Array(17*16);
 let brightness=1,hue=0,headScale=1;
 try{const value=JSON.parse(localStorage.getItem("neon-bear-head-scale")||"null");if(Number.isFinite(value))headScale=Math.max(.5,Math.min(1.5,value));}catch{}
 function setHeadScale(value){if(!Number.isFinite(value))return;headScale=Math.max(.5,Math.min(1.5,value));try{localStorage.setItem("neon-bear-head-scale",JSON.stringify(headScale));}catch{}}
 try{const p=JSON.parse(localStorage.getItem('neon-bear-texture')||'{}');brightness=Number.isFinite(p.brightness)?Math.max(.25,Math.min(3,p.brightness)):1;hue=Number.isFinite(p.hue)?Math.max(-180,Math.min(180,p.hue)):0;}catch{}
 function setTexture(values){if(Number.isFinite(values.brightness))brightness=Math.max(.25,Math.min(3,values.brightness));if(Number.isFinite(values.hue))hue=Math.max(-180,Math.min(180,values.hue));try{localStorage.setItem('neon-bear-texture',JSON.stringify({brightness,hue}));}catch{}}
 function load(){
  if(loading)return loading;
  loading=Promise.all([fetch('assets/player-bear/bear.json').then(r=>{if(!r.ok)throw Error('熊模型加载失败');return r.json();}),new Promise((resolve,reject)=>{image=new Image();image.onload=resolve;image.onerror=()=>reject(Error('熊贴图加载失败'));image.src='assets/player-bear/bear.png';})]).then(([data])=>{
   if(data.version!==1||data.bones.length!==17||data.stride!==14||data.vertices.length%42||!data.vertices.every(Number.isFinite))throw Error('熊模型格式错误');
   for(const clip of Object.values(data.clips))for(const frame of clip.frames)if(frame.length!==272||!frame.every(Number.isFinite))throw Error('熊动作格式错误');
   if(!data.bind?.pelvis||!data.bind?.['foot.L'])throw Error('熊骨骼绑定信息缺失');
   model={...data,vertices:new Float32Array(data.vertices)};
  }).catch(e=>{error=e.message;console.warn('熊预览不可用，保留原主角：',e);});return loading;
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

  if(!model||!image?.naturalWidth)return false;
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
   // Scale about the attached neck in bind space, then apply the head spring.
   const anchor=model.bind.head.head;
   for(let row=0;row<3;row++){
    matrices[offset+12+row]+=(1-headScale)*(matrices[offset+row]*anchor[0]+matrices[offset+4+row]*anchor[1]+matrices[offset+8+row]*anchor[2]);
    for(let col=0;col<3;col++)matrices[offset+col*4+row]*=headScale;
   }
  }

  instance={...at,blend,bodyLift,legs,emission};return true;
 }
 function initialize(r){
  if(gpu?.marker===r.program)return gpu;
  const gl=r.gl,compile=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
  const vs=compile(gl.VERTEX_SHADER,`attribute vec3 p;attribute vec3 n;attribute vec2 uv;attribute vec3 joints;attribute vec3 weights;uniform mat4 bones[17];uniform mat4 vp;uniform vec3 origin;uniform float size;uniform float flash;varying vec2 texcoord;varying vec3 tone;varying float cloth;varying float eyeSurface;uniform vec3 keyLightDirection;uniform vec3 topLight;uniform vec2 clubLight;uniform vec3 rearLeftColor;uniform vec3 rearRightColor;${r.surfaceShaderGLSL}${normalGLSL}void main(){mat4 skin=bones[int(joints.x>18.5?4.:min(joints.x,16.))]*weights.x+bones[int(joints.y)]*weights.y+bones[int(joints.z)]*weights.z;vec3 at=(skin*vec4(p,1.)).xyz;vec3 normal=skinNormal(mat3(skin),n);float light=.55+.45*max(0.,dot(normal,normalize(vec3(-.4,.85,.45))));tone=surfaceShader>.5?softToonShade(vec3(1.),normal,keyLightDirection,topLight,rearLeftColor*clubLight.x,rearRightColor*clubLight.y,0.,0.):vec3(.3+.8*light);texcoord=uv;gl_Position=vp*vec4(origin+at*size,1.);}`);
  const fs=compile(gl.FRAGMENT_SHADER,`precision mediump float;uniform sampler2D image;uniform float flash;uniform float emission;uniform float textureBrightness;uniform float textureHue;varying vec2 texcoord;varying vec3 tone;void main(){vec4 c=texture2D(image,texcoord);if(c.a<.1)discard;vec3 axis=normalize(vec3(1.));float cs=cos(textureHue);c.rgb=clamp((c.rgb*cs+cross(axis,c.rgb)*sin(textureHue)+axis*dot(axis,c.rgb)*(1.-cs))*textureBrightness,0.,1.);gl_FragColor=vec4(mix(mix(c.rgb*tone*.78,c.rgb*1.08,emission),vec3(1.,.95,.7),flash),1.);}`);
  const program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,model.vertices,gl.STATIC_DRAW);uploads++;
  const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
  for(const [p,v]of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,p,v);
  gpu={marker:r.program,program,buffer,texture,u:Object.fromEntries(['bones[0]','vp','origin','size','image','flash','emission','textureBrightness','textureHue','surfaceShader','keyLightDirection','topLight','clubLight','rearLeftColor','rearRightColor'].map(n=>[n,gl.getUniformLocation(program,n)]))};return gpu;
 }
 function render(r){

  if(!instance||!model)return;const gl=r.gl,g=initialize(r),u=g.u;
  gl.useProgram(g.program);gl.disable(gl.BLEND);gl.depthMask(true);gl.uniformMatrix4fv(u.vp,false,r.vp);gl.uniformMatrix4fv(u['bones[0]'],false,matrices);gl.uniform3f(u.origin,instance.x,instance.y,instance.z);gl.uniform1f(u.size,instance.size);gl.uniform1f(u.flash,instance.flash||0);gl.uniform1f(u.emission,globalThis.CatPlayer.emission);gl.uniform1f(u.textureBrightness,brightness);gl.uniform1f(u.textureHue,hue*Math.PI/180);
  gl.uniform1f(u.surfaceShader,r.surfaceShaderMode());gl.uniform3fv(u.keyLightDirection,r.keyLightDirection||[.1,1,-.1]);gl.uniform3fv(u.topLight,r.topLight||[.3,.6,.5]);gl.uniform2f(u.clubLight,r.clubCyan??.8,r.clubMagenta??.65);gl.uniform3fv(u.rearLeftColor,r.rearLeftColor||[.12,.92,.78]);gl.uniform3fv(u.rearRightColor,r.rearRightColor||[.85,.12,.48]);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,g.texture);gl.uniform1i(u.image,0);
  gl.bindBuffer(gl.ARRAY_BUFFER,g.buffer);r.attributes(g.program,[['p',3],['n',3],['uv',2],['joints',3],['weights',3]],56);gl.drawArrays(gl.TRIANGLES,0,model.vertices.length/14);
 }
 // Draw the exact same skinned surface into depth/normal and silhouette buffers.
 // These passes must occlude weapons and scenery behind the opaque cat too.
 function renderGeometry(r,matrix,mode){

  if(!instance||!model)return;
  const gl=r.gl,g=initialize(r);
  if(!g.geometry){
   const compile=(type,src)=>{const shader=gl.createShader(type);gl.shaderSource(shader,src);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));return shader;};
   const vertex=compile(gl.VERTEX_SHADER,`attribute vec3 p;attribute vec3 n;attribute vec3 joints;attribute vec3 weights;uniform mat4 bones[17];uniform mat4 matrix;uniform vec3 origin;uniform float size;varying vec3 normal;${normalGLSL}void main(){mat4 skin=bones[int(joints.x>18.5?4.:min(joints.x,16.))]*weights.x+bones[int(joints.y)]*weights.y+bones[int(joints.z)]*weights.z;vec3 at=(skin*vec4(p,1.)).xyz;normal=skinNormal(mat3(skin),n);gl_Position=matrix*vec4(origin+at*size,1.);}`);
   const fragment=compile(gl.FRAGMENT_SHADER,`precision highp float;uniform float mode;uniform float emission;varying vec3 normal;vec2 packDepth(float v){vec2 e=fract(min(v,.999999)*vec2(1.,255.));e.x-=e.y/255.;return e;}vec2 octNormal(vec3 n){n/=abs(n.x)+abs(n.y)+abs(n.z);vec2 o=n.xy;if(n.z<0.)o=(1.-abs(o.yx))*sign(o.xy+vec2(.00001));return o*.5+.5;}void main(){vec2 depth=packDepth(gl_FragCoord.z);if(mode<.5)gl_FragColor=vec4(depth,1.,1.);else if(mode<1.5){vec2 oct=octNormal(normalize(normal));gl_FragColor=vec4(depth,oct.x*.49,oct.y);}else if(mode<2.5)gl_FragColor=vec4(depth,0.,1.);else gl_FragColor=vec4(vec3(emission),1.);}`);
   const program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
   g.geometry={program,u:Object.fromEntries(['bones[0]','matrix','origin','size','mode','emission'].map(n=>[n,gl.getUniformLocation(program,n)]))};
  }
  const {program,u}=g.geometry;gl.useProgram(program);gl.uniformMatrix4fv(u['bones[0]'],false,matrices);gl.uniformMatrix4fv(u.matrix,false,matrix);gl.uniform3f(u.origin,instance.x,instance.y,instance.z);gl.uniform1f(u.size,instance.size);gl.uniform1f(u.mode,mode);gl.uniform1f(u.emission,globalThis.CatPlayer.emission);
  gl.bindBuffer(gl.ARRAY_BUFFER,g.buffer);r.attributes(program,[['p',3],['n',3],['uv',2],['joints',3],['weights',3]],56);gl.drawArrays(gl.TRIANGLES,0,model.vertices.length/14);
 }
 return {load,draw,render,renderGeometry,setTexture,setHeadScale,get headScale(){return headScale;},get pose(){return {bones:model?.bones,bind:model?.bind,matrices:Array.from(matrices)};},begin(){instance=null;},get ready(){return !!model&&!!image?.naturalWidth;},get texture(){return {brightness,hue};},get stats(){return {ready:this.ready,uploads,bones:model?.bones.length||0,vertices:(model?.vertices.length||0)/14,instance,error};}};
})();

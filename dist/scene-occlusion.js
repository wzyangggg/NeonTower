'use strict';
// Geometry-aware SSAO and a directional shadow map. Reuse renderer buffers and
// instance poses; never materialize or re-upload resident model vertices.
(()=>{
 const proto=Elevator3D.prototype,identity=[1,0,0,0,0,1,0,0,0,0,1,0];
 function inverse(a){
  const rows=Array.from({length:4},(_,r)=>Array.from({length:8},(_,c)=>c<4?a[c*4+r]:+(c-4===r)));
  for(let i=0;i<4;i++){let pivot=i;for(let j=i+1;j<4;j++)if(Math.abs(rows[j][i])>Math.abs(rows[pivot][i]))pivot=j;[rows[i],rows[pivot]]=[rows[pivot],rows[i]];const d=rows[i][i];if(Math.abs(d)<1e-12)return null;for(let k=0;k<8;k++)rows[i][k]/=d;for(let j=0;j<4;j++)if(j!==i){const f=rows[j][i];for(let k=0;k<8;k++)rows[j][k]-=f*rows[i][k];}}
  return new Float32Array(Array.from({length:16},(_,i)=>rows[i%4][4+Math.floor(i/4)]));
 }
 function lightMatrix(angle){
  const a=angle*Math.PI/180,l=[Math.cos(a)*.58,.815,Math.sin(a)*.58],len=Math.hypot(...l);for(let i=0;i<3;i++)l[i]/=len;
  const right=[l[2],0,-l[0]],rlen=Math.hypot(...right);for(let i=0;i<3;i++)right[i]/=rlen;
  const up=[l[1]*right[2],l[2]*right[0]-l[0]*right[2],-l[1]*right[0]],extent=1350,depth=4200;
  return new Float32Array([right[0]/extent,up[0]/extent,-l[0]/depth,0,right[1]/extent,up[1]/extent,-l[1]/depth,0,right[2]/extent,up[2]/extent,-l[2]/depth,0,0,0,0,1]);
 }
 function make(r){
  const gl=r.gl,resources={programs:[],textures:[],frames:[],depth:[],buffers:[]},fx={marker:r.program,resources,frames:0};
  fx.dispose=()=>{for(const [key,method]of [['programs','deleteProgram'],['textures','deleteTexture'],['frames','deleteFramebuffer'],['depth','deleteRenderbuffer'],['buffers','deleteBuffer']])for(const obj of resources[key])gl[method](obj);};
  function program(v,f){const p=gl.createProgram();resources.programs.push(p);for(const [type,src]of [[gl.VERTEX_SHADER,v],[gl.FRAGMENT_SHADER,f]]){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const message=gl.getShaderInfoLog(s);gl.deleteShader(s);throw Error(message);}gl.attachShader(p,s);gl.deleteShader(s);}gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return {p,u:new Map()};}
  const vertex=`attribute vec3 p;attribute vec3 n;uniform mat4 matrix;uniform float posed;attribute vec4 pose0;attribute vec4 pose1;attribute vec4 pose2;varying vec3 normal;varying float emissive;varying float fogTag;varying float uiTag;void main(){vec4 point=vec4(p,1.);vec3 world=mix(p,vec3(dot(pose0,point),dot(pose1,point),dot(pose2,point)),posed);vec3 u=vec3(pose0.x,pose1.x,pose2.x),v=vec3(pose0.y,pose1.y,pose2.y),w=vec3(pose0.z,pose1.z,pose2.z);vec3 wn=u*n.x/max(dot(u,u),.000001)+v*n.y/max(dot(v,v),.000001)+w*n.z/max(dot(w,w),.000001);normal=normalize(mix(n,wn,posed));float tag=length(n);uiTag=1.-step(.025,abs(tag-1.8));fogTag=step(3.9,tag);emissive=max(step(1.5,tag)*(1.-step(2.5,tag)),step(4.5,tag));gl_Position=matrix*vec4(world,1.);}`;
  const packing=`vec2 packDepth(float v){vec2 e=fract(min(v,.999999)*vec2(1.,255.));e.x-=e.y/255.;return e;}vec2 octNormal(vec3 n){n/=abs(n.x)+abs(n.y)+abs(n.z);vec2 o=n.xy;if(n.z<0.)o=(1.-abs(o.yx))*sign(o.xy+vec2(.00001));return o*.5+.5;}`;
  fx.geometry=program(vertex,`precision highp float;varying vec3 normal;varying float emissive;varying float fogTag;${packing}void main(){gl_FragColor=vec4(packDepth(gl_FragCoord.z),emissive>.5?vec2(0.):vec2(octNormal(normal).x*.49+fogTag*.51,octNormal(normal).y));}`);
  fx.shadow=program(vertex,`precision highp float;varying float uiTag;${packing}void main(){if(uiTag>.5)discard;gl_FragColor=vec4(packDepth(gl_FragCoord.z),0.,1.);}`);
  const fullVS='attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}';
  const common=`precision highp float;varying vec2 uv;uniform sampler2D geometry;uniform sampler2D shadows;uniform mat4 inverseVP;uniform mat4 lightVP;uniform mat4 cameraVP;uniform vec2 texel;uniform float aoStrength;uniform float aoRadius;uniform float shadowStrength;uniform float shadowBias;uniform float shadowSoftness;float depth(vec2 p){vec2 d=texture2D(geometry,p).rg;return dot(d,vec2(1.,1./255.));}vec3 world(vec2 p,float d){vec4 w=inverseVP*vec4(p*2.-1.,d*2.-1.,1.);return w.xyz/w.w;}vec3 normal(vec2 e){vec2 f=e*2.-1.;vec3 n=vec3(f,1.-abs(f.x)-abs(f.y));if(n.z<0.)n.xy=(1.-abs(n.yx))*sign(n.xy+vec2(.00001));return normalize(n);}`;
  fx.occlusion=program(fullVS,common+`void main(){vec4 g=texture2D(geometry,uv);float d=dot(g.rg,vec2(1.,1./255.));if(d>.9999||g.b+g.a<.0001){gl_FragColor=vec4(0.);return;}vec3 p=world(uv,d),n=normal(vec2((g.b-step(.5,g.b)*.51)/.49,g.a));float ao=0.;vec4 clip=cameraVP*vec4(p,1.);float projection=length(vec3(cameraVP[0][1],cameraVP[1][1],cameraVP[2][1]));float pixels=clamp(aoRadius*projection/max(abs(clip.w),.01)*.5,texel.y*2.,.12);if(aoStrength>0.){for(int i=0;i<12;i++){float a=float(i)*2.399963;float ring=.3+.7*sqrt((float(i)+.5)/12.);vec2 off=vec2(cos(a),sin(a))*pixels*ring;off.x*=texel.x/texel.y;vec2 q=uv+off;if(q.x<=0.||q.x>=1.||q.y<=0.||q.y>=1.)continue;float sd=depth(q);if(sd>.9999)continue;vec3 v=world(q,sd)-p;float distance=length(v);float horizon=max(0.,dot(n,v/max(distance,.001))-.12);ao+=horizon*(1.-smoothstep(aoRadius*.2,aoRadius,distance));}}ao=clamp(ao/12.*aoStrength*3.5,0.,.65);float shadow=0.;vec4 lc=lightVP*vec4(p+n*1.2,1.);vec3 sc=lc.xyz/lc.w*.5+.5;if(shadowStrength>0.&&sc.x>0.&&sc.x<1.&&sc.y>0.&&sc.y<1.&&sc.z>0.&&sc.z<1.){for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){float z=dot(texture2D(shadows,sc.xy+vec2(float(x),float(y))*shadowSoftness/1024.).rg,vec2(1.,1./255.));shadow+=step(z+shadowBias,sc.z);}shadow=shadow/9.*shadowStrength;}float dark=1.-(1.-ao)*(1.-shadow);gl_FragColor=vec4(dark,dark,dark,1.);}`);
  // Fog is affine: fog(surface)=transmission*surface+inscattering.
  // Blend inscattering (fog evaluated on black), rather than black, over the
  // already fogged color. This is exactly fog(surface*(1-occlusion)), so neither
  // the distance fog nor the analytic volume fog is darkened by the shadow.
  fx.composite=program(fullVS,`precision highp float;${r.cityFogGLSL}varying vec2 uv;uniform sampler2D mask;uniform sampler2D geometry;uniform sampler2D selfLight;uniform vec2 texel;uniform mat4 inverseVP;uniform vec4 sceneFogView;uniform float sceneFogDensity;uniform vec3 sceneFogColor;float depth(vec2 p){return dot(texture2D(geometry,p).rg,vec2(1.,1./255.));}void main(){float d=depth(uv),sum=0.,weight=0.;for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 q=uv+vec2(float(x),float(y))*texel;float w=exp(-abs(depth(q)-d)*1800.)*(x==0&&y==0?2.:1.);sum+=texture2D(mask,q).r*w;weight+=w;}float occlusion=sum/max(weight,.001);occlusion*=1.-texture2D(selfLight,uv).r;vec3 inscattering=vec3(0.);if(texture2D(geometry,uv).b>.5&&d<.9999){vec4 world=inverseVP*vec4(uv*2.-1.,d*2.-1.,1.);vec3 point=world.xyz/world.w;float viewDepth=sceneFogView.w-dot(point,sceneFogView.xyz);float fog=1.-exp(-max(0.,viewDepth-900.)*sceneFogDensity);inscattering=cityVolumeFog(sceneFogColor*fog,point,0.);}gl_FragColor=vec4(inscattering,occlusion);}`);
  function target(w,h,withDepth){const texture=gl.createTexture(),frame=gl.createFramebuffer();resources.textures.push(texture);resources.frames.push(frame);gl.bindTexture(gl.TEXTURE_2D,texture);for(const [k,v]of [[gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);gl.bindFramebuffer(gl.FRAMEBUFFER,frame);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0);const t={texture,frame,w:0,h:0};if(withDepth){t.depth=gl.createRenderbuffer();resources.depth.push(t.depth);gl.bindRenderbuffer(gl.RENDERBUFFER,t.depth);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,t.depth);}resizeTarget(t,w,h);return t;}
  function resizeTarget(t,w,h){if(t.w===w&&t.h===h)return;gl.bindTexture(gl.TEXTURE_2D,t.texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);gl.bindFramebuffer(gl.FRAMEBUFFER,t.frame);if(t.depth){gl.bindRenderbuffer(gl.RENDERBUFFER,t.depth);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,w,h);}if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw Error('Occlusion framebuffer incomplete');t.w=w;t.h=h;}
  fx.resize=()=>{const w=Math.max(1,Math.ceil(r.canvas.width/2)),h=Math.max(1,Math.ceil(r.canvas.height/2));resizeTarget(fx.gbuffer,w,h);resizeTarget(fx.mask,w,h);resizeTarget(fx.selfLight,w,h);gl.bindFramebuffer(gl.FRAMEBUFFER,fx.selfLight.frame);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,fx.gbuffer.depth);};
  try{fx.gbuffer=target(1,1,true);fx.map=target(1024,1024,true);fx.mask=target(1,1,false);fx.selfLight=target(1,1,false);fx.buffer=gl.createBuffer();resources.buffers.push(fx.buffer);gl.bindBuffer(gl.ARRAY_BUFFER,fx.buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);}catch(e){fx.dispose();throw e;}finally{gl.bindFramebuffer(gl.FRAMEBUFFER,null);}
  fx.uniform=(p,name)=>{if(!p.u.has(name))p.u.set(name,gl.getUniformLocation(p.p,name));return p.u.get(name);};
  return fx;
 }
 function drawGeometry(r,fx,program,matrix){
  const gl=r.gl,loc=n=>fx.uniform(program,n),ext=r.residentExtension;
  gl.useProgram(program.p);gl.uniformMatrix4fv(loc('matrix'),false,matrix);gl.uniform1f(loc('posed'),0);
  const attrs=['pose0','pose1','pose2'].map(n=>gl.getAttribLocation(program.p,n));
  for(let i=0;i<3;i++)if(attrs[i]>=0){gl.disableVertexAttribArray(attrs[i]);r.enabledAttributes.delete(attrs[i]);gl.vertexAttrib4fv(attrs[i],identity.slice(i*4,i*4+4));}
  const draw=(buffer,count)=>{if(!buffer||!count)return;gl.bindBuffer(gl.ARRAY_BUFFER,buffer);r.attributes(program.p,[['p',3],['n',3]],36);gl.drawArrays(gl.TRIANGLES,0,count);};
  draw(r.sceneBuffer,r.sceneData?.length/9);draw(r.buffer,r.count/9);
  gl.uniform1f(loc('posed'),1);
  for(const mesh of r.residentMeshes.values()){
   if(!mesh.count||!mesh.buffer||(mesh.opacity??1)<1)continue;
   gl.bindBuffer(gl.ARRAY_BUFFER,mesh.buffer);r.attributes(program.p,[['p',3],['n',3]],36);
   if(ext&&mesh.poseBuffer){gl.bindBuffer(gl.ARRAY_BUFFER,mesh.poseBuffer);for(let i=0;i<3;i++){const a=attrs[i];if(a<0)continue;gl.enableVertexAttribArray(a);r.enabledAttributes.add(a);gl.vertexAttribPointer(a,4,gl.FLOAT,false,52,i*16);ext.vertexAttribDivisorANGLE(a,1);}ext.drawArraysInstancedANGLE(gl.TRIANGLES,0,mesh.data.length/9,mesh.count);for(const a of attrs)if(a>=0)ext.vertexAttribDivisorANGLE(a,0);}
   else{for(const a of attrs)if(a>=0){gl.disableVertexAttribArray(a);r.enabledAttributes.delete(a);}for(let j=0;j<mesh.count;j++){for(let k=0;k<3;k++)if(attrs[k]>=0)gl.vertexAttrib4fv(attrs[k],mesh.instances.subarray(j*13+k*4,j*13+k*4+4));gl.drawArrays(gl.TRIANGLES,0,mesh.data.length/9);}}
  }
  globalThis.CatPlayer?.renderGeometry(r,matrix,program===fx.shadow?2:1);
 }
 proto.prepareSceneOcclusion=function(){
  const s=globalThis.NeonPostFX?.settings;
  if(globalThis.NeonPostFX?.active&&s?.shadows){const a=s.shadowAngle*Math.PI/180;this.keyLightDirection=[Math.cos(a)*.58,.815,Math.sin(a)*.58];}
  else this.keyLightDirection=null;
 };
 proto.drawSceneOcclusion=function(){
  const settings=globalThis.NeonPostFX?.settings;
  if(!settings||!NeonPostFX.active||(!(settings.ao&&settings.aoStrength>0)&&!(settings.shadows&&settings.shadowStrength>0))||this.occlusionFailed===this.program)return;
  const gl=this.gl,w=this.canvas.width,h=this.canvas.height;
  let fx=this.sceneOcclusion;
  try{
   if(!fx||fx.marker!==this.program){fx=this.sceneOcclusion=make(this);}
   fx.resize();const inv=inverse(this.vp);if(!inv)return;const light=lightMatrix(settings.shadowAngle);
   gl.activeTexture(gl.TEXTURE0);gl.disable(gl.BLEND);gl.enable(gl.DEPTH_TEST);gl.depthMask(true);
   gl.bindFramebuffer(gl.FRAMEBUFFER,fx.gbuffer.frame);gl.viewport(0,0,fx.gbuffer.w,fx.gbuffer.h);gl.clearColor(1,1,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);drawGeometry(this,fx,fx.geometry,this.vp);
   if(settings.shadows&&settings.shadowStrength>0){gl.bindFramebuffer(gl.FRAMEBUFFER,fx.map.frame);gl.viewport(0,0,1024,1024);gl.clearColor(1,1,1,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(1,1);drawGeometry(this,fx,fx.shadow,light);gl.disable(gl.POLYGON_OFFSET_FILL);}
   // Reuse the geometry pass depth attachment: only visible self-lit surfaces
   // protect their emitted light from SSAO/shadows. Foreground weapons still occlude.
   gl.bindFramebuffer(gl.FRAMEBUFFER,fx.selfLight.frame);gl.viewport(0,0,fx.selfLight.w,fx.selfLight.h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.depthMask(false);gl.depthFunc(gl.LEQUAL);
   globalThis.CatPlayer?.renderGeometry(this,this.vp,3);
   gl.depthFunc(gl.LESS);gl.depthMask(true);
   gl.disable(gl.DEPTH_TEST);gl.depthMask(false);
   function full(p){gl.useProgram(p.p);gl.bindBuffer(gl.ARRAY_BUFFER,fx.buffer);this.attributes(p.p,[['position',2]],8);}
   const loc=n=>fx.uniform(fx.occlusion,n);gl.bindFramebuffer(gl.FRAMEBUFFER,fx.mask.frame);gl.viewport(0,0,fx.mask.w,fx.mask.h);full.call(this,fx.occlusion);
   gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,fx.gbuffer.texture);gl.uniform1i(loc('geometry'),0);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,fx.map.texture);gl.uniform1i(loc('shadows'),1);
   gl.uniformMatrix4fv(loc('inverseVP'),false,inv);gl.uniformMatrix4fv(loc('cameraVP'),false,this.vp);gl.uniformMatrix4fv(loc('lightVP'),false,light);gl.uniform2f(loc('texel'),1/fx.mask.w,1/fx.mask.h);
   gl.uniform1f(loc('aoStrength'),settings.ao?settings.aoStrength:0);gl.uniform1f(loc('aoRadius'),settings.aoRadius);gl.uniform1f(loc('shadowStrength'),settings.shadows?settings.shadowStrength:0);gl.uniform1f(loc('shadowBias'),settings.shadowBias);gl.uniform1f(loc('shadowSoftness'),settings.shadowSoftness);gl.drawArrays(gl.TRIANGLES,0,3);
   gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,w,h);full.call(this,fx.composite);
   this.uploadCityFog(fx.composite.p);gl.uniformMatrix4fv(fx.uniform(fx.composite,'inverseVP'),false,inv);gl.uniform4fv(fx.uniform(fx.composite,'sceneFogView'),this.sceneFogView||[0,.84663655,.53217155,826.801]);gl.uniform1f(fx.uniform(fx.composite,'sceneFogDensity'),this.sceneFogDensity||0);gl.uniform3fv(fx.uniform(fx.composite,'sceneFogColor'),this.sceneFogColor||[0,0,0]);
   gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,fx.mask.texture);gl.uniform1i(fx.uniform(fx.composite,'mask'),0);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,fx.gbuffer.texture);gl.uniform1i(fx.uniform(fx.composite,'geometry'),1);gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,fx.selfLight.texture);gl.uniform1i(fx.uniform(fx.composite,'selfLight'),2);gl.uniform2f(fx.uniform(fx.composite,'texel'),1/fx.mask.w,1/fx.mask.h);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.drawArrays(gl.TRIANGLES,0,3);fx.frames++;
  }catch(error){this.occlusionFailed=this.program;fx?.dispose();this.sceneOcclusion=null;console.warn('场景遮蔽效果已回退',error);}
  finally{gl.depthFunc(gl.LESS);gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,w,h);gl.activeTexture(gl.TEXTURE0);gl.disable(gl.BLEND);gl.disable(gl.POLYGON_OFFSET_FILL);gl.depthMask(true);gl.enable(gl.DEPTH_TEST);}
 };
})();

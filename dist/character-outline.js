'use strict';
// Screen-space silhouettes, independent of face normals. Scene geometry writes
// depth as well, so hidden characters and edges behind foreground stay hidden.
(()=>{
 const proto=Elevator3D.prototype;
 proto.setOutlineGroup=function(group){
  const start=this.outlineStart||0;
  if(this.count>start)(this.outlineRanges??=[]).push([start/9,(this.count-start)/9,this.outlineGroup||0]);
  this.outlineStart=this.count;this.outlineGroup=group;
 };
 const begin=proto.begin;
 proto.begin=function(){begin.call(this);this.outlineRanges=[];this.outlineStart=0;this.outlineGroup=0;};
 function make(r){
  const gl=r.gl,fx={marker:r.program,resources:[],frames:0};
  fx.dispose=()=>{for(const [method,obj]of fx.resources)gl[method](obj);};
  const keep=(method,obj)=>(fx.resources.push([method,obj]),obj);
  function program(v,f){
   const p=keep('deleteProgram',gl.createProgram());
   for(const [type,source]of [[gl.VERTEX_SHADER,v],[gl.FRAGMENT_SHADER,f]]){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);const ok=gl.getShaderParameter(s,gl.COMPILE_STATUS);if(ok)gl.attachShader(p,s);const error=ok?'':gl.getShaderInfoLog(s);gl.deleteShader(s);if(!ok)throw Error(error);}
   gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return {p,u:new Map()};
  }
  try{
   fx.geometry=program(`attribute vec3 p;attribute vec4 pose0;attribute vec4 pose1;attribute vec4 pose2;uniform mat4 vp;uniform float posed;void main(){vec4 v=vec4(p,1.);vec3 at=vec3(dot(pose0,v),dot(pose1,v),dot(pose2,v));gl_Position=vp*vec4(mix(p,at,posed),1.);}`,
    `precision highp float;uniform float group;void main(){vec2 d=fract(min(gl_FragCoord.z,.999999)*vec2(1.,255.));d.x-=d.y/255.;gl_FragColor=vec4(d,group,1.);}`);
   fx.composite=program(`attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`,
    `precision highp float;varying vec2 uv;uniform sampler2D mask;uniform vec2 stepUV;uniform vec2 lightDirection;uniform float glow;uniform float strength;
     float depth(vec4 s){return dot(s.rg,vec2(1.,1./255.));}
     float missile(float group){return max(1.-step(.025,abs(group-.35)),1.-step(.025,abs(group-.95)));}
     float fullEdge(float group){return max(missile(group),max(1.-step(.035,abs(group-.25)),1.-step(.035,abs(group-.65))));}
     vec3 tint(float group){
      if(abs(group-.35)<.025)return vec3(1.,.035,.065);
      if(abs(group-.95)<.025)return vec3(.04,.88,1.);
      if(abs(group-.25)<.035)return vec3(1.,.065,.12);
      if(abs(group-.65)<.035)return vec3(.12,.48,1.);
      return mix(vec3(.64,.24,1.),vec3(.18,.9,.78),step(.75,group));
     }
     void main(){vec4 center=texture2D(mask,uv);vec3 edge=vec3(0.),halo=vec3(0.);
      // A narrow wrap INSIDE the lit silhouette anchors the light to its surface.
      // Neighbor depth prevents a foreground object from masquerading as open sky.
      if(center.b>.1){vec4 outside=texture2D(mask,uv+lightDirection*stepUV*.75);
       float exposed=step(.05,abs(center.b-outside.b))*step(depth(center)-.00003,depth(outside));
       gl_FragColor=vec4(mix(tint(center.b),vec3(1.),.45)*exposed*.32*strength,0.);return;
      }
      for(int i=0;i<16;i++){float a=float(i)*.39269908;vec2 direction=vec2(cos(a),sin(a));
       // direction points toward the silhouette; its outward direction is opposite.
       float facing=smoothstep(.05,.85,dot(-direction,lightDirection));
       vec4 s=texture2D(mask,uv+direction*stepUV);float visible=step(depth(s)-.00003,depth(center))*step(.1,s.b);
       edge=max(edge,mix(tint(s.b),vec3(1.),mix(.3,.08,fullEdge(s.b)))*visible*mix(facing,1.,fullEdge(s.b)));
       // Shift a broad, softly sampled corona toward the light rather than drawing
       // a second concentric outline. Dark-side samples fade away completely.
       for(int ring=1;ring<=2;ring++){float radius=float(ring)*2.;
        vec2 offset=(direction*radius-lightDirection*1.2)*stepUV;
        vec4 h=texture2D(mask,uv+offset);float v=step(depth(h)-.00003,depth(center))*step(.1,h.b);
        float weight=ring==1?.7:.3;halo+=tint(h.b)*v*facing*weight;
       }
      }gl_FragColor=vec4((edge*.65+halo/16.*glow*1.8)*strength,0.);
     }`);
   fx.texture=keep('deleteTexture',gl.createTexture());gl.bindTexture(gl.TEXTURE_2D,fx.texture);
   for(const [k,v]of [[gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);
   fx.frame=keep('deleteFramebuffer',gl.createFramebuffer());fx.depth=keep('deleteRenderbuffer',gl.createRenderbuffer());
   fx.buffer=keep('deleteBuffer',gl.createBuffer());gl.bindBuffer(gl.ARRAY_BUFFER,fx.buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
   fx.uniform=(p,n)=>{if(!p.u.has(n))p.u.set(n,gl.getUniformLocation(p.p,n));return p.u.get(n);};
   fx.resize=(w,h)=>{if(fx.w===w&&fx.h===h)return;gl.bindTexture(gl.TEXTURE_2D,fx.texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);gl.bindFramebuffer(gl.FRAMEBUFFER,fx.frame);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,fx.texture,0);gl.bindRenderbuffer(gl.RENDERBUFFER,fx.depth);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,w,h);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,fx.depth);if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw Error('Outline framebuffer incomplete');fx.w=w;fx.h=h;};
   return fx;
  }catch(e){fx.dispose();throw e;}
 }
 function geometry(r,fx){
  const gl=r.gl,p=fx.geometry,ext=r.residentExtension,u=n=>fx.uniform(p,n),attrs=['pose0','pose1','pose2'].map(n=>gl.getAttribLocation(p.p,n));
  gl.useProgram(p.p);gl.uniformMatrix4fv(u('vp'),false,r.vp);gl.uniform1f(u('posed'),0);
  for(const a of attrs)if(a>=0){gl.disableVertexAttribArray(a);r.enabledAttributes.delete(a);gl.vertexAttrib4f(a,0,0,0,0);}
  const draw=(buffer,start,count,tag)=>{if(!buffer||!count)return;gl.bindBuffer(gl.ARRAY_BUFFER,buffer);r.attributes(p.p,[['p',3]],36);gl.uniform1f(u('group'),tag);gl.drawArrays(gl.TRIANGLES,start,count);};
  draw(r.sceneBuffer,0,r.sceneData?.length/9,0);
  for(const [start,count,tag]of r.outlineRanges)draw(r.buffer,start,count,tag);
  gl.uniform1f(u('posed'),1);
  for(const [key,mesh]of r.residentMeshes){
   if(!mesh.count||!mesh.buffer||(mesh.opacity??1)<1)continue;
   gl.bindBuffer(gl.ARRAY_BUFFER,mesh.buffer);r.attributes(p.p,[['p',3]],36);
   for(let start=0;start<mesh.count;){const tag=/shadow/i.test(key)?0:mesh.outlineTags?.[start]||0;let end=start+1;while(end<mesh.count&&(/shadow/i.test(key)?0:mesh.outlineTags?.[end]||0)===tag)end++;
    gl.uniform1f(u('group'),tag);
    if(ext&&mesh.poseBuffer){gl.bindBuffer(gl.ARRAY_BUFFER,mesh.poseBuffer);for(let k=0;k<3;k++){const a=attrs[k];if(a<0)continue;gl.enableVertexAttribArray(a);r.enabledAttributes.add(a);gl.vertexAttribPointer(a,4,gl.FLOAT,false,52,start*52+k*16);ext.vertexAttribDivisorANGLE(a,1);}ext.drawArraysInstancedANGLE(gl.TRIANGLES,0,mesh.data.length/9,end-start);for(const a of attrs)if(a>=0)ext.vertexAttribDivisorANGLE(a,0);}
    else{for(const a of attrs)if(a>=0){gl.disableVertexAttribArray(a);r.enabledAttributes.delete(a);}for(let j=start;j<end;j++){for(let k=0;k<3;k++)if(attrs[k]>=0)gl.vertexAttrib4fv(attrs[k],mesh.instances.subarray(j*13+k*4,j*13+k*4+4));gl.drawArrays(gl.TRIANGLES,0,mesh.data.length/9);}}
    start=end;
   }
  }
  globalThis.CatPlayer?.renderGeometry(r,r.vp,0);
 }
 proto.drawCharacterOutline=function(){
  this.setOutlineGroup(0);const s=globalThis.NeonPostFX?.settings;
  if(!s?.outline||!NeonPostFX.active||s.outlineStrength<=0||this.outlineFailed===this.program)return;
  const gl=this.gl,w=this.canvas.width,h=this.canvas.height;let fx=this.characterOutline;
  try{
   if(!fx||fx.marker!==this.program)fx=this.characterOutline=make(this);
   gl.activeTexture(gl.TEXTURE0);fx.resize(w,h);gl.bindFramebuffer(gl.FRAMEBUFFER,fx.frame);gl.viewport(0,0,w,h);gl.disable(gl.BLEND);gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.clearColor(1,1,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);geometry(this,fx);
   gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.disable(gl.DEPTH_TEST);gl.depthMask(false);const p=fx.composite,u=n=>fx.uniform(p,n);gl.useProgram(p.p);gl.bindBuffer(gl.ARRAY_BUFFER,fx.buffer);this.attributes(p.p,[['position',2]],8);gl.bindTexture(gl.TEXTURE_2D,fx.texture);gl.uniform1i(u('mask'),0);
   const ratio=w/Math.max(1,this.canvas.clientWidth);gl.uniform2f(u('stepUV'),s.outlineWidth*ratio/w,s.outlineWidth*ratio/h);const angle=(s.outlineAngle??125)*Math.PI/180;gl.uniform2f(u('lightDirection'),Math.cos(angle),Math.sin(angle));gl.uniform1f(u('glow'),s.outlineGlow);gl.uniform1f(u('strength'),s.outlineStrength);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.drawArrays(gl.TRIANGLES,0,3);fx.frames++;
  }catch(e){this.outlineFailed=this.program;fx?.dispose();this.characterOutline=null;console.warn('角色外描边已回退',e);}
  finally{gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,w,h);gl.activeTexture(gl.TEXTURE0);gl.disable(gl.BLEND);gl.depthMask(true);gl.enable(gl.DEPTH_TEST);}
 };
})();

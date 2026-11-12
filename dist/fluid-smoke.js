(() => {
 const columns=144, rows=224, cellSize=6.4, maxSources=8;
 const maxTrails=maxSources*6;
 const quad=`#version 300 es
 out vec2 uv;
 void main(){
  uv=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));
  gl_Position=vec4(uv*2.-1.,0.,1.);
 }`;
 const plane=`#version 300 es
 out vec2 uv;
 uniform mat4 vp;
 uniform vec2 worldSize;
 void main(){
  uv=vec2(float(gl_VertexID&1),float(gl_VertexID>>1));
  vec2 world=(uv-.5)*worldSize;
  gl_Position=vp*vec4(world.x,19.,world.y,1.);
 }`;
 const trailQuads=`#version 300 es
 uniform vec2 grid;
 uniform vec4 trails[${maxTrails}];
 uniform vec2 brushes[${maxTrails}];
 out vec2 uv;
 flat out vec4 segment;
 flat out vec2 brush;
 void main(){
  segment=trails[gl_InstanceID];
  brush=brushes[gl_InstanceID];
  vec2 lo=min(segment.xy,segment.zw)-brush.x;
  vec2 hi=max(segment.xy,segment.zw)+brush.x;
  uv=mix(lo,hi,vec2(float(gl_VertexID&1),float(gl_VertexID>>1)))/grid;
  gl_Position=vec4(uv*2.-1.,0.,1.);
 }`;
 const header=`#version 300 es
 precision highp float;
 precision highp sampler2D;
 in vec2 uv;
 out vec4 value;
 `;
 const sourceUniforms=`
 uniform vec4 sources[${maxSources}];
 uniform int sourceCount;
 uniform vec2 grid;
 uniform float dt;
 `;
 const eddyNoise=`
 float hashCell(vec2 p){
  vec3 q=fract(p.xyx*vec3(.1031,.1099,.0973));
  q+=dot(q,q.yzx+33.33);
  return fract((q.x+q.y)*q.z);
 }
 vec3 eddy(vec2 p){
  vec2 cell=floor(p), f=fract(p);
  vec2 u=f*f*(3.-2.*f), du=6.*f*(1.-f);
  float a=hashCell(cell), b=hashCell(cell+vec2(1.,0.));
  float c=hashCell(cell+vec2(0.,1.)), d=hashCell(cell+vec2(1.,1.));
  float dx=mix(b-a,d-c,u.y)*du.x;
  float dy=mix(c-a,d-b,u.x)*du.y;
  return vec3(dy,-dx,mix(mix(a,b,u.x),mix(c,d,u.x),u.y));
 }
 `;

 function create(sceneCanvas) {
  const layer=document.createElement('canvas');
  const gl=layer.getContext('webgl2',{alpha:true,antialias:false,depth:false,stencil:false});
  if(!gl)return null;
  if(!gl.getExtension('EXT_color_buffer_float')){
   gl.getExtension('WEBGL_lose_context')?.loseContext();
   return null;
  }

  function program(fragment,names,vertex=quad) {
   const compile=(type,source)=>{
    const shader=gl.createShader(type);
    gl.shaderSource(shader,source);
    gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader));
    return shader;
   };
   const vs=compile(gl.VERTEX_SHADER,vertex), fs=compile(gl.FRAGMENT_SHADER,header+fragment);
   const id=gl.createProgram();
   gl.attachShader(id,vs);
   gl.attachShader(id,fs);
   gl.linkProgram(id);
   gl.deleteShader(vs);
   gl.deleteShader(fs);
   if(!gl.getProgramParameter(id,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(id));
   return {id,u:Object.fromEntries(names.map(name=>[name,gl.getUniformLocation(id,name)]))};
  }

  function target(width,height,format,channels,filter) {
   const texture=gl.createTexture(), framebuffer=gl.createFramebuffer();
   gl.bindTexture(gl.TEXTURE_2D,texture);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,filter);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,filter);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
   gl.texImage2D(gl.TEXTURE_2D,0,format,width,height,0,channels,gl.HALF_FLOAT,null);
   gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);
   gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0);
   if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw new Error('Smoke framebuffer unavailable');
   return {texture,framebuffer,width,height};
  }

  const pair=(...args)=>({
   read:target(...args),write:target(...args),
   swap(){[this.read,this.write]=[this.write,this.read];}
  });
  let velocity,dye,pressure,curl,divergence,measureCurl,moveVelocity,measureDivergence,relax,project,moveDye,paintTrails,composite;
  try{
   velocity=pair(columns,rows,gl.RG16F,gl.RG,gl.LINEAR);
   dye=pair(columns*2,rows*2,gl.RG16F,gl.RG,gl.LINEAR);
   pressure=pair(columns,rows,gl.R16F,gl.RED,gl.NEAREST);
   curl=target(columns,rows,gl.R16F,gl.RED,gl.NEAREST);
   divergence=target(columns,rows,gl.R16F,gl.RED,gl.NEAREST);
   measureCurl=program(`
    uniform sampler2D velocity;
    uniform vec2 cell;
    void main(){
     vec2 dx=vec2(cell.x,0.), dy=vec2(0.,cell.y);
     float l=texture(velocity,uv-dx).y, r=texture(velocity,uv+dx).y;
     float b=texture(velocity,uv-dy).x, t=texture(velocity,uv+dy).x;
     value=vec4(.5*(r-l-t+b),0.,0.,1.);
    }`,['velocity','cell']);
   moveVelocity=program(sourceUniforms+`
    uniform sampler2D velocity, curl, dye;
    void main(){
     vec2 cell=1./grid, dx=vec2(cell.x,0.), dy=vec2(0.,cell.y);
     vec2 v=texture(velocity,uv).xy;
     vec2 next=texture(velocity,uv-v*cell*dt).xy*exp(-2.55*dt);
     float c=texture(curl,uv).r;
     float l=abs(texture(curl,uv-dx).r), r=abs(texture(curl,uv+dx).r);
     float b=abs(texture(curl,uv-dy).r), t=abs(texture(curl,uv+dy).r);
     vec2 turn=vec2(t-b,l-r);
     next+=dt*7.5*c*turn/(length(turn)+.2);
     next.y-=dt*3.*texture(dye,uv).r;
     for(int i=0;i<sourceCount;i++){
      vec4 s=sources[i];
      float pulse=min(s.w,1.);
      if(pulse<=0.)continue;
      float reach=.27+.98*(1.-exp(-4.8*(1.-pulse)));
      vec2 delta=(uv*grid-s.xy)/(s.z*reach);
      float d2=dot(delta,delta);
      if(d2>4.)continue;
      float a=atan(delta.y,delta.x+.00001);
      float spin=sin(3.*a+s.x*.31)+.52*cos(5.*a+s.y*.2);
      vec2 shear=vec2(sin(delta.y*5.2+s.x*.71),sin(delta.x*5.9+s.y*.57));
      next+=dt*pulse*690.*exp(-1.02*d2)*(
       delta*(.78+.22*spin)+vec2(-delta.y,delta.x)*.56*spin+.62*shear);
     }
     float edge=min(min(uv.x,1.-uv.x),min(uv.y,1.-uv.y));
     value=vec4(clamp(next,-104.,104.)*smoothstep(0.,.035,edge),0.,1.);
    }`,['velocity','curl','dye','grid','dt','sources[0]','sourceCount']);
   measureDivergence=program(sourceUniforms+`
    uniform sampler2D velocity;
    void main(){
     vec2 cell=1./grid, dx=vec2(cell.x,0.), dy=vec2(0.,cell.y);
     float l=texture(velocity,uv-dx).x, r=texture(velocity,uv+dx).x;
     float b=texture(velocity,uv-dy).y, t=texture(velocity,uv+dy).y;
     float div=.5*(r-l+t-b);
     // Briefly allow expansion inside the burst with a compensating outer flow.
     for(int i=0;i<sourceCount;i++){
      vec4 s=sources[i];
      float pulse=min(s.w,1.);
      if(pulse<=0.)continue;
      float reach=.27+.77*(1.-exp(-4.8*(1.-pulse)));
      vec2 delta=(uv*grid-s.xy)/(s.z*reach);
      float q=dot(delta,delta)*2.45;
      if(q<12.)div-=pulse*25.*(1.-q)*exp(-q);
     }
     value=vec4(div,0.,0.,1.);
    }`,['velocity','grid','sources[0]','sourceCount']);
   relax=program(`
    uniform sampler2D pressure, divergence;
    uniform vec2 cell;
    void main(){
     vec2 dx=vec2(cell.x,0.), dy=vec2(0.,cell.y);
     float l=texture(pressure,uv-dx).r, r=texture(pressure,uv+dx).r;
     float b=texture(pressure,uv-dy).r, t=texture(pressure,uv+dy).r;
     value=vec4((l+r+b+t-texture(divergence,uv).r)*.25,0.,0.,1.);
    }`,['pressure','divergence','cell']);
   project=program(`
    uniform sampler2D velocity, pressure;
    uniform vec2 cell;
    void main(){
     vec2 dx=vec2(cell.x,0.), dy=vec2(0.,cell.y);
     float l=texture(pressure,uv-dx).r, r=texture(pressure,uv+dx).r;
     float b=texture(pressure,uv-dy).r, t=texture(pressure,uv+dy).r;
     vec2 v=texture(velocity,uv).xy-.5*vec2(r-l,t-b);
     value=vec4(v,0.,1.);
    }`,['velocity','pressure','cell']);
   moveDye=program(sourceUniforms+eddyNoise+`
    uniform sampler2D velocity, dye;
    uniform float previousStep, time;
    float blastGrowth(float age){
     return 1.58*(1.-exp(-31.*min(age,.14)));
    }
    void main(){
     vec2 v=texture(velocity,uv).xy;
     vec2 mid=uv-v*dt*.5/grid;
     vec2 back=uv-texture(velocity,mid).xy*dt/grid;
     float dilution=1., injected=0.;
     for(int i=0;i<sourceCount;i++){
      vec4 s=sources[i];
      if(s.w<=0.)continue;
      float seedRadius=max(.11,1.16/s.z);
      if(s.w>1.){
       // Write the entire source at the impact point, only on ignition.
       vec2 seedDelta=(uv*grid-s.xy)/(s.z*seedRadius);
       float d2=dot(seedDelta,seedDelta);
       if(d2<4.)injected+=5.7*exp(-1.75*d2);
       continue;
      }
      float age=.18*(1.-s.w);
      float beforeAge=max(0.,age-previousStep);
      if(beforeAge>=.14)continue;
      vec2 delta=(back*grid-s.xy)/s.z;
      float growth=blastGrowth(age);
      float distance=length(delta);
      if(distance>=(seedRadius+growth)*1.95)continue;
      float a=atan(delta.y,delta.x+.00001);
      float lobe=1.+.19*sin(5.*a+s.x*.18)+.13*cos(7.*a+s.y*.29);
      float radius=seedRadius+growth*lobe;
      float influence=1.-smoothstep(radius*.87,radius*1.44,distance);
      // Trace back through a rapidly expanding radius. The solver then
      // carries that same smoke after the brief outward pulse ends.
      float ratio=(seedRadius+blastGrowth(beforeAge)*lobe)/radius;
      back-=delta*s.z/grid*(1.-ratio)*influence;
      dilution*=mix(1.,pow(ratio,.42),influence);
     }
     // Advect density and density-weighted age together so a new blast can
     // remain solid while its older smoke already breaks up.
     vec2 parcel=texture(dye,back).rg;
     float age=parcel.g/max(parcel.r,.0001);
     float smoke=parcel.r*exp(-1.45*dt)*dilution;
     if(age>.09&&parcel.r>.002){
      vec2 world=back*grid;
      vec3 coarse=eddy(world*.24+vec2(time*.24,-time*.18));
      vec3 fine=eddy(world*.52+vec2(13.-time*.33,7.+time*.27));
      float roll=smoothstep(.09,.36,age)*(1.-smoothstep(1.1,2.,age));
      vec2 eddyFlow=coarse.xy*21.+fine.xy*11.;
      back-=eddyFlow*roll*dt/grid;
      parcel=texture(dye,back).rg;
      age=parcel.g/max(parcel.r,.0001);
      float gaps=smoothstep(.43,.75,coarse.z*.63+fine.z*.37);
      float mixing=smoothstep(.20,.64,age)*(.10+1.75*gaps);
      smoke=max(0.,parcel.r*exp(-1.45*dt)*dilution-mixing*dt);
     }
     float edge=min(min(uv.x,1.-uv.x),min(uv.y,1.-uv.y));
     float fade=smoothstep(0.,.025,edge);
     float total=smoke+injected, density=min(total,6.)*fade;
     value=vec4(density,density*smoke*(age+dt)/max(total,.0001),0.,1.);
    }`,['velocity','dye','grid','dt','previousStep','time','sources[0]','sourceCount']);
   paintTrails=program(`
    uniform vec2 grid;
    flat in vec4 segment;
    flat in vec2 brush;
    void main(){
     vec2 delta=segment.zw-segment.xy;
     vec2 offset=uv*grid-segment.xy;
     float t=clamp(dot(offset,delta)/max(.0001,dot(delta,delta)),0.,1.);
     vec2 distance=(offset-delta*t)/brush.x;
     float d2=dot(distance,distance);
     value=vec4(brush.y*exp(-3.1*d2)*(1.-smoothstep(.65,1.,d2)),0.,0.,0.);
    }`,['grid','trails[0]','brushes[0]'],trailQuads);
   composite=program(sourceUniforms+eddyNoise+`
    uniform sampler2D dye;
    uniform vec2 texel;
    uniform float fade;
    const vec4 lobes[8]=vec4[8](
     vec4(.04,.02,.51,.19), vec4(-.45,.05,.46,.04),
     vec4(.43,.02,.44,.09), vec4(-.25,-.44,.42,.01),
     vec4(.22,-.43,.42,.10), vec4(.31,.36,.38,.15),
     vec4(-.32,.41,.36,.11), vec4(-.09,-.20,.34,.29)
    );
    vec4 fireball(vec2 p,vec2 seed,float age){
     vec3 broad=eddy(p*4.8+seed);
     vec3 grain=eddy(p*18.+seed*1.73);
     float speck=eddy(p*39.-seed).z;
     vec2 q=p+.105*broad.xy+.042*grain.xy;
     float top=-1., underneath=-1.;
     vec3 normal=vec3(0.,0.,1.);
     for(int i=0;i<8;i++){
      vec4 l=lobes[i];
      vec2 d=(q-l.xy)/l.z;
      float h=1.-dot(d,d);
      if(h<=0.)continue;
      h=sqrt(h);
      float surface=h*l.z+l.w;
      if(surface>top){underneath=top;top=surface;normal=vec3(d,h);}
      else underneath=max(underneath,surface);
     }
     if(top<0.)return vec4(0.);
     float seam=1.-smoothstep(.012,.16,top-underneath);
     float rim=1.-normal.z;
     float shadow=dot(normal,vec3(-.32,.48,.51));
     float heat=.40+.42*seam+.29*rim*rim+.29*(grain.z-.5)+.20*(speck-.5)-.21*shadow;
     heat-=.16*smoothstep(.12,.32,age);
     vec3 color=mix(vec3(.24,.043,.009),vec3(1.,.27,.026),smoothstep(.11,.53,heat));
     color=mix(color,vec3(1.,.81,.32),smoothstep(.49,.83,heat));
     color=mix(color,vec3(1.,.97,.73),smoothstep(.83,1.,heat));
     float alpha=smoothstep(0.,.21,normal.z)*smoothstep(.006,.035,age)*(1.-smoothstep(.115,.34,age));
     return vec4(color*alpha,alpha);
    }
    void main(){
     vec2 parcel=texture(dye,uv).rg;
     float d=parcel.r, age=parcel.g/max(d,.0001);
     float light=texture(dye,uv+texel*vec2(-1.,-1.)).r-texture(dye,uv+texel*vec2(1.,1.)).r;
     float smokeOpacity=mix(.58,1.,smoothstep(.045,.32,age));
     float a=(1.-exp(-1.24*max(0.,d-.022)))*.85*fade*smokeOpacity;
     vec3 color=mix(vec3(.73,.76,.80),vec3(.35,.38,.44),smoothstep(.12,2.8,d));
     color+=clamp(light*.26,-.14,.21);
     value=vec4(color*a,a);
     for(int i=0;i<sourceCount;i++){
      vec4 s=sources[i];
      float size=s.z*(.09+1.06*(1.-exp(-23.*max(0.,s.w-.012))));
      vec2 p=(uv*grid-s.xy)/size;
      p.y=(p.y+.18+.88*smoothstep(.025,.28,s.w))*.74;
      if(dot(p,p)>2.15)continue;
      float roll=.28*sin(dot(s.xy,vec2(.51,.87)));
      p=mat2(cos(roll),-sin(roll),sin(roll),cos(roll))*p;
      vec4 fire=fireball(p,s.xy*.17,s.w);
      float glow=exp(-1.25*dot(p,p))*smoothstep(.008,.045,s.w)*(1.-smoothstep(.14,.34,s.w));
      value.rgb+=value.a*vec3(.20,.08,.024)*glow;
      value=fire+value*(1.-fire.a);
     }
    }`,['vp','worldSize','dye','texel','fade','grid','sources[0]','sourceCount'],plane);
  }catch(error){
   gl.getExtension('WEBGL_lose_context')?.loseContext();
   return null;
  }

  const sources=[], sourceData=new Float32Array(maxSources*4);
  const trailData=new Float32Array(maxTrails*4), brushData=new Float32Array(maxTrails*2);
  const fields=[velocity.read,velocity.write,dye.read,dye.write,pressure.read,pressure.write,curl,divergence];
  let remaining=0, previousStep=0, flowTime=0, dirty=true;
  layer.id='fluid-smoke';
  layer.setAttribute('aria-hidden','true');
  layer.style.cssText='pointer-events:none;display:none';
  sceneCanvas.after(layer);
  layer.addEventListener('webglcontextlost',()=>{layer.remove();});
  gl.clearColor(0,0,0,0);

  function use(pass,to,textures) {
   gl.bindFramebuffer(gl.FRAMEBUFFER,to?.framebuffer??null);
   gl.viewport(0,0,to?.width??layer.width,to?.height??layer.height);
   gl.useProgram(pass.id);
   for(let i=0;i<textures.length;i+=2){
    gl.activeTexture(gl.TEXTURE0+i/2);
    gl.bindTexture(gl.TEXTURE_2D,textures[i+1].texture);
    gl.uniform1i(pass.u[textures[i]],i/2);
   }
  }
  const execute=()=>gl.drawArrays(gl.TRIANGLES,0,3);
  function withSources(pass,dt,count) {
   gl.uniform2f(pass.u.grid,columns,rows);
   if(pass.u.dt!==undefined)gl.uniform1f(pass.u.dt,dt);
   gl.uniform1i(pass.u.sourceCount,count);
   if(count)gl.uniform4fv(pass.u['sources[0]'],sourceData,0,count*4);
  }

  function addDebrisTrails(dt) {
   let count=0;
   for(const s of sources){
    for(const f of s.fragments){
     const from=Math.max(.048,s.age-f.delay);
     const to=Math.min(f.life,s.age+dt-f.delay);
     if(to<=from)continue;
     const a=f.point(from), b=f.point(to);
     if(b[1]<3.)continue;
     // Project flying debris onto the shared smoke plane at the camera's tilt.
     const planeZ=p=>(p[2]-(p[1]-19)*440/700)/cellSize+rows/2;
     const offset=count*4;
     trailData[offset]=a[0]/cellSize+columns/2;
     trailData[offset+1]=planeZ(a);
     trailData[offset+2]=b[0]/cellSize+columns/2;
     trailData[offset+3]=planeZ(b);
     brushData[count*2]=(.94+to*.88)*f.thickness;
     brushData[count*2+1]=(f.hot?19:31)*(1-to/f.life)*(to-from);
     count++;
    }
   }
   if(!count)return;
   use(paintTrails,dye.write,[]);
   gl.uniform2f(paintTrails.u.grid,columns,rows);
   gl.uniform4fv(paintTrails.u['trails[0]'],trailData,0,count*4);
   gl.uniform2fv(paintTrails.u['brushes[0]'],brushData,0,count*2);
   gl.enable(gl.BLEND);
   gl.blendFunc(gl.ONE,gl.ONE);
   gl.drawArraysInstanced(gl.TRIANGLE_STRIP,0,4,count);
   gl.disable(gl.BLEND);
  }

  function step(dt) {
   if(dirty){
    for(const field of fields){
     gl.bindFramebuffer(gl.FRAMEBUFFER,field.framebuffer);
     gl.clear(gl.COLOR_BUFFER_BIT);
    }
    dirty=false;
   }
   let count=0;
   for(const s of sources){
    if(s.age>=.18)continue;
    // The first step marks a one-time density injection; later values are the force envelope.
    sourceData.set([s.x,s.z,s.size,s.age===0?2:1-s.age/.18],count++*4);
   }
   use(measureCurl,curl,['velocity',velocity.read]);
   gl.uniform2f(measureCurl.u.cell,1/columns,1/rows);
   execute();
   use(moveVelocity,velocity.write,['velocity',velocity.read,'curl',curl,'dye',dye.read]);
   withSources(moveVelocity,dt,count);
   execute();
   velocity.swap();
   use(measureDivergence,divergence,['velocity',velocity.read]);
   withSources(measureDivergence,dt,count);
   execute();
   use(relax,pressure.write,['divergence',divergence]);
   gl.uniform2f(relax.u.cell,1/columns,1/rows);
   gl.uniform1i(relax.u.pressure,1);
   gl.activeTexture(gl.TEXTURE1);
   for(let i=0;i<16;i++){
    gl.bindFramebuffer(gl.FRAMEBUFFER,pressure.write.framebuffer);
    gl.bindTexture(gl.TEXTURE_2D,pressure.read.texture);
    execute();
    pressure.swap();
   }
   use(project,velocity.write,['velocity',velocity.read,'pressure',pressure.read]);
   gl.uniform2f(project.u.cell,1/columns,1/rows);
   execute();
   velocity.swap();
   use(moveDye,dye.write,['velocity',velocity.read,'dye',dye.read]);
   withSources(moveDye,dt,count);
   gl.uniform1f(moveDye.u.previousStep,previousStep);
   gl.uniform1f(moveDye.u.time,flowTime);
   execute();
   addDebrisTrails(dt);
   dye.swap();
   previousStep=dt;
  }

  function emit(x,z,radius,fragments=[]) {
   if(sources.length===maxSources)sources.shift();
   sources.push({x:x/cellSize+columns/2,z:z/cellSize+rows/2,
    size:Math.max(16,Math.min(radius,130))/cellSize,age:0,fragments,
    end:fragments.reduce((end,f)=>Math.max(end,f.delay+f.life),.34)});
   remaining=2.8;
  }

  function update(dt) {
   flowTime+=dt;
   if(remaining<=0||dt<=0||gl.isContextLost())return;
   remaining-=dt;
   if(remaining<=0){clear();return;}
   step(dt);
   for(let i=sources.length-1;i>=0;i--){
    sources[i].age+=dt;
    if(sources[i].age>=sources[i].end)sources.splice(i,1);
   }
  }

  function draw(renderer) {
   if(remaining<=0||dirty||gl.isContextLost())return;
   const width=Math.min(256,Math.max(2,Math.round(sceneCanvas.width/1.7)));
   const height=Math.min(544,Math.max(2,Math.round(width*sceneCanvas.height/sceneCanvas.width)));
   if(layer.width!==width||layer.height!==height){layer.width=width;layer.height=height;}
   use(composite,null,['dye',dye.read]);
   gl.clear(gl.COLOR_BUFFER_BIT);
   gl.uniformMatrix4fv(composite.u.vp,false,renderer.vp);
   gl.uniform2f(composite.u.worldSize,columns*cellSize,rows*cellSize);
   gl.uniform2f(composite.u.texel,1/dye.read.width,1/dye.read.height);
   gl.uniform1f(composite.u.fade,Math.min(1,remaining/.4));
   let count=0;
   for(const s of sources){
    if(s.age>=.34)continue;
    sourceData.set([s.x,s.z,s.size,s.age],count++*4);
   }
   withSources(composite,0,count);
   gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
   if(layer.style.display==='none')layer.style.display='';
  }

  function clear() {
   sources.length=0;
   remaining=0;
   dirty=true;
   layer.style.display='none';
  }

  return {emit,update,draw,clear,get lost(){return gl.isContextLost();}};
 }

 globalThis.FluidSmoke={create};
})();

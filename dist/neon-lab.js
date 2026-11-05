'use strict';
// Opt-in study only. All layers share the game's actual WebGL context and depth buffer.
(async()=>{
 const frame=document.getElementById('scene'),status=document.getElementById('status');
 const settings={dots:true,notes:true,letters:true,glow:true,spatial:true,paused:false,close:false};
 for(const key of ['dots','notes','letters','glow','spatial'])document.getElementById(key).onchange=e=>settings[key]=e.target.checked;
 document.getElementById('pause').onclick=e=>{settings.paused=!settings.paused;e.target.textContent=settings.paused?'继续动画':'暂停动画';};
 document.getElementById('view').onclick=e=>{settings.close=!settings.close;e.target.textContent=settings.close?'返回场景':'查看近景';};
 document.getElementById('clean').onclick=()=>{document.body.classList.toggle('clean');document.getElementById('clean').textContent=document.body.classList.contains('clean')?'显示说明':'隐藏说明';};
 const waitReady=()=>new Promise((resolve,reject)=>{const start=performance.now(),tick=()=>{if(frame.contentWindow.HexMap?.ready)resolve();else if(performance.now()-start>45000)reject(Error('夜城场景加载超时'));else setTimeout(tick,100);};tick();});
 try{
  await waitReady();const w=frame.contentWindow,r=w.eval('renderer'),gl=r.gl;
  w.document.body.classList.add('clean');const hide=w.document.createElement('style');hide.textContent='.lab-return,.hud,.wavehud,.bottomhud,.shield-hud,.survival-clock,#survival-clock,#test-open{display:none!important}';w.document.head.append(hide);
  const specs=[['record',[1203,616,297,255],1],['subtitle',[322,748,722,134],2],['headline',[67,234,862,476],2],['headphones',[830,116,555,671],1]];
  // Align the unchanged flat glyph faces using measured source-pixel bounds.
  // Glow variants include extra transparent space; expand the quad without moving the text.
  const glowBounds={headline:{old:[11,8,893,488],new:[72,57,1647,873]},subtitle:{old:[2,2,890,163],new:[39,169,2121,547]}};
  const layers=await Promise.all(specs.map(async([name,rect,kind])=>{const image=new Image();image.src=`assets/neon-lab/${name}.png`;await image.decode();const layer={name,rect,kind,image};if(kind===2){const baked=new Image();baked.src=`assets/neon-lab/${name}-glow.png`;await baked.decode();const bounds=glowBounds[name],a=bounds.old,b=bounds.new,sx=(a[2]-a[0])*rect[2]/image.width/(b[2]-b[0]),sy=(a[3]-a[1])*rect[3]/image.height/(b[3]-b[1]);layer.bakedImage=baked;layer.glowRect=[rect[0]+a[0]*rect[2]/image.width-b[0]*sx,rect[1]+a[1]*rect[3]/image.height-b[1]*sy,baked.width*sx,baked.height*sy];}return layer;}));
  const vs=`attribute vec2 p;uniform mat4 vp;uniform vec4 rect;uniform vec3 center;uniform vec2 size;uniform float angle;uniform vec2 pivot;uniform vec3 pose;uniform vec2 tilt;varying vec2 uv;varying vec2 source;
void main(){uv=p;source=(rect.xy+p*rect.zw)/vec2(1536.,1024.);vec2 q=vec2(source.x-.5,.5-source.y)*size;vec2 anchor=vec2(pivot.x-.5,.5-pivot.y)*size;float c=cos(angle),s=sin(angle);vec2 d=q-anchor;vec3 v=vec3(c*d.x-s*d.y,s*d.x+c*d.y,0.);v=vec3(v.x,v.y*cos(tilt.y),v.y*sin(tilt.y));v=vec3(v.x*cos(tilt.x)+v.z*sin(tilt.x),v.y,-v.x*sin(tilt.x)+v.z*cos(tilt.x));v+=vec3(anchor,0.)+pose;gl_Position=vp*vec4(center+vec3(v.x,v.y*.53217155+v.z*.84663655,-v.y*.84663655+v.z*.53217155),1.);}`;
  const fs=`precision mediump float;uniform sampler2D image;uniform float time;uniform float kind;uniform float dots;uniform float letters;uniform float opacity;varying vec2 uv;varying vec2 source;
float box(vec2 p,vec2 lo,vec2 hi){return step(lo.x,p.x)*step(lo.y,p.y)*step(p.x,hi.x)*step(p.y,hi.y);}
void main(){vec3 rgb;float a;
 if(kind>3.5){vec2 p=uv;if(kind<4.5){float left=.035+.11*(1.-p.y),right=.99-.11*p.y;a=step(left,p.x)*step(p.x,right)*step(.13,p.y)*step(p.y,.89);rgb=vec3(.66,.025,.37);}else{a=step(.055*(1.-p.y),p.x)*step(p.x,1.-.055*p.y);rgb=vec3(.045,.025,.18);float edge=step(p.y,.045)+step(.955,p.y);rgb=mix(rgb,vec3(.04,.8,.92),min(1.,edge)*.7);}}
 else if(kind<.5){vec2 p=source;float left=.035+.11*(1.-p.y),right=.99-.11*p.y;float panel=step(left,p.x)*step(p.x,right)*step(.13,p.y)*step(p.y,.89);float edge=panel*(1.-step(left+.009,p.x)*step(p.x,right-.009)*step(.139,p.y)*step(p.y,.881));rgb=vec3(.09,.025,.32);a=panel*.88;vec2 field=vec2(p.x*54.+time*.65,p.y*36.-time*1.1);float wave=.5+.5*sin(p.x*8.+p.y*6.-time*.65);float spot=1.-smoothstep(.13+wave*.07,.17+wave*.07,length(fract(field)-.5));float region=smoothstep(.12,.6,p.y)*(.35+.65*smoothstep(.25,.9,p.x));float ink=spot*region*dots*panel;rgb=mix(rgb,mix(vec3(.04,.85,.98),vec3(1.,.03,.64),step(.5,fract(p.x+p.y*.4))),ink*.65);rgb=mix(rgb,vec3(.02,.95,1.),edge);a=max(a,edge*.95);
 }else if(kind>2.5){vec2 p=uv;float note=1.-smoothstep(.145,.17,length((p-vec2(.32,.73))*vec2(1.,1.15)));float stem=box(p,vec2(.43,.18),vec2(.51,.73));float flag=box(vec2(p.x,p.y-(p.x-.5)*.45),vec2(.48,.17),vec2(.8,.27));a=max(note,max(stem,flag));rgb=vec3(1.,.94,.015);
 }else{vec4 tex=texture2D(image,uv);rgb=tex.rgb;a=tex.a;if(kind>1.5){float breath=.64+.22*sin(time*1.8+source.x*4.);float x=fract(time*.19)*1.5-.25;float sweep=1.-smoothstep(.015,.105,abs(source.x-x+source.y*.1));float gain=mix(1.,breath+sweep*.85,letters);rgb*=gain;a*=mix(1.,.87+.13*sin(time*1.8+source.x*4.),letters);}
 }
 a*=opacity;if(a<.002)discard;gl_FragColor=vec4(rgb,a);}`;
  let program,buffer,loc,last=performance.now(),clock=0,draws=0;
  function initialize(){const compile=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};program=gl.createProgram();const shaders=[compile(gl.VERTEX_SHADER,vs),compile(gl.FRAGMENT_SHADER,fs)];shaders.forEach(s=>gl.attachShader(program,s));gl.linkProgram(program);shaders.forEach(s=>gl.deleteShader(s));if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([0,0,1,0,1,1,0,0,1,1,0,1]),gl.STATIC_DRAW);loc=Object.fromEntries(['vp','rect','center','size','angle','pivot','pose','tilt','time','kind','dots','letters','opacity','image'].map(n=>[n,gl.getUniformLocation(program,n)]));const upload=image=>{let source=image;const limit=Math.min(1024,gl.getParameter(gl.MAX_TEXTURE_SIZE)),ratio=Math.min(1,limit/Math.max(image.width,image.height));if(ratio<1){source=document.createElement('canvas');source.width=Math.max(1,Math.round(image.width*ratio));source.height=Math.max(1,Math.round(image.height*ratio));source.getContext('2d').drawImage(image,0,0,source.width,source.height);}const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return texture;};for(const layer of layers){layer.texture=upload(layer.image);if(layer.bakedImage)layer.glowTexture=upload(layer.bakedImage);}}
  // Local units map into a real world-space billboard frame, with its normal facing the camera.
  // Each layer rotates about a stable content pivot, including when its baked-glow quad expands.
  const design={
   rear:{x:25,y:-22,depth:-80,yaw:-.14,pitch:.16,angle:-.055},
   panel:{depth:-35,yaw:.10,pitch:-.045,angle:.025},
   record:{x:6,y:-10,depth:4,yaw:-.18,pitch:.10,angle:.05},
   headline:{x:-6,y:12,depth:24,yaw:-.12,pitch:.065,angle:.045},
   subtitle:{x:-8,y:-8,depth:48,yaw:-.08,pitch:.10,angle:-.035},
   headphones:{x:7,y:12,depth:76,yaw:.20,pitch:-.10,angle:-.045}
  };
  const byName=Object.fromEntries(layers.map(layer=>[layer.name,layer]));
  function render(t){
   if(!r.ready||gl.isContextLost())return;
   if(!program||!gl.isProgram(program))initialize();
   gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);r.attributes(program,[['p',2]],8);
   gl.uniformMatrix4fv(loc.vp,false,r.vp);gl.uniform1f(loc.time,t);
   for(const key of ['dots','letters'])gl.uniform1f(loc[key],settings[key]?1:0);
   gl.uniform1i(loc.image,0);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,layers[0].texture);
   gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);
   const center=settings.close?[0,450,-60]:[0,620,14],size=settings.close?[660,440]:[610,407];
   const m=r.vp,h=r.canvas.getBoundingClientRect().height,target=settings.close?Math.max(245,h*.43):Math.max(225,h*.29),ndc=1-target/h*2;
   const cw=m[7]*center[1]+m[11]*center[2]+m[15],cy=m[5]*center[1]+m[9]*center[2]+m[13],dy=m[5]*.53217155-m[9]*.84663655,dw=m[7]*.53217155-m[11]*.84663655,shift=(ndc*cw-cy)/(dy-ndc*dw);
   center[1]+=shift*.53217155;center[2]-=shift*.84663655;
   gl.uniform2fv(loc.size,size);gl.uniform3fv(loc.center,center);
   const paint=(rect,kind,texture,options={},baseRect=rect)=>{
    const {opacity=1,float=0,angle=0}=options,pose=settings.spatial?options:{};
    if(texture)gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.uniform4fv(loc.rect,rect);
    gl.uniform2f(loc.pivot,(baseRect[0]+baseRect[2]*.5)/1536,(baseRect[1]+baseRect[3]*.5)/1024);
    gl.uniform3f(loc.pose,pose.x||0,(pose.y||0)+float,pose.depth||0);
    gl.uniform2f(loc.tilt,pose.yaw||0,pose.pitch||0);
    gl.uniform1f(loc.kind,kind);gl.uniform1f(loc.opacity,opacity);
    gl.uniform1f(loc.angle,settings.spatial?angle:(options.motionAngle||0));
    gl.drawArrays(gl.TRIANGLES,0,6);draws++;
   };
   const full=[0,0,1536,1024];
   if(settings.spatial)paint(full,4,null,design.rear);
   paint(full,0,null,design.panel);
   const drawLayer=name=>{const layer=byName[name],baked=settings.glow&&layer.bakedImage,pose=design[name];
    const float=name==='headphones'?Math.sin(t*1.4)*5:0,motionAngle=name==='record'?Math.sin(t*.7)*.045:0;
    paint(baked?layer.glowRect:layer.rect,layer.kind,baked?layer.glowTexture:layer.texture,{...pose,float,angle:pose.angle+motionAngle,motionAngle},layer.rect);
   };
   drawLayer('record');drawLayer('headline');
   if(settings.spatial)paint([285,732,800,170],5,null,{...design.subtitle,depth:42},byName.subtitle.rect);
   drawLayer('subtitle');drawLayer('headphones');
   if(settings.notes)for(let i=0;i<7;i++){
    const life=(t*.19+i/7)%1,x=1120+Math.sin(i*9.3+life*2.2)*170,y=740-life*640,angle=Math.sin(i+life*3.)*.2;
    paint([x,y,75,100],3,null,{opacity:Math.sin(life*Math.PI)*.9,depth:90+i*3,yaw:.1,angle,motionAngle:angle});
   }
   gl.depthMask(true);gl.disable(gl.BLEND);
  }

  const original=r.drawHolograms;r.drawHolograms=function(){original.call(this);const now=performance.now();if(!settings.paused)clock+=Math.min(.1,(now-last)/1000);last=now;render(clock);};
  window.neonLab={settings,layers,design,renderAt(t){render(t);},get time(){return clock;},get draws(){return draws;},get renderer(){return r;},get scene(){return w;}};
  status.textContent='错层倾斜 + 偏移纯色背板 · 字体辉光已烘焙';
 }catch(e){status.textContent='加载失败：'+e.message;console.error(e);}
})();




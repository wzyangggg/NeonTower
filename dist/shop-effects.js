/* Shop materials: adjacent-hue vectors, luminous type, rising fog and sparse GGX glitter.
   One lazy GPU context bakes the normal field once and is reused across shop visits. */
(()=>{
 const previewControls=document.currentScript?.dataset.previewControls==='true';
 // Crisp, resolution-independent adjacent hues, inspired by the reference's cut-paper slashes.
 function vectorBackdrop(a,b,c,wide=false){return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 360" preserveAspectRatio="none"><path fill="${a}" fill-opacity="${wide?.78:.62}" d="${wide?'M-60 200 150 0h150L-20 305Z':'M-60 200 180 0h94L-20 276Z'}"/><path fill="${b}" fill-opacity="${wide?.68:.48}" d="${wide?'M35 360 294 12v180L155 360Z':'M84 360 294 56v115L167 360Z'}"/><path fill="${c}" fill-opacity=".38" d="M-20 323 134 168 92 244-20 354Z"/><g fill="none" stroke="${c}" stroke-opacity=".35"><path d="m12 177 56-49m-23 11 54-47M168 288l48-60"/><path d="m176 48 9-12 4 15Z"/></g><g fill="${c}" fill-opacity=".24"><circle cx="198" cy="195" r="1.4"/><circle cx="204" cy="195" r="1.4"/><circle cx="210" cy="195" r="1.4"/><circle cx="201" cy="201" r="1.4"/><circle cx="207" cy="201" r="1.4"/></g></svg>`)}")`;}
 const style=document.createElement('style');style.textContent=`
 .shop-grid.sugar-grid{position:relative;isolation:isolate}
 .sugar-grid>.shop-buy{isolation:auto}
 .sugar-grid>.shop-buy>.shop-item-fx{z-index:2}
 .sugar-grid>.shop-buy>:not(.shop-item-fx){z-index:3}
 .sugar-grid>.shop-sugar-canvas{position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none}
 .sugar-grid.has-shop-shader :is([data-tier="4"],[data-tier="5"]) .shop-item-fx::before,.sugar-grid.has-shop-shader :is([data-tier="4"],[data-tier="5"]) .shop-item-fx::after{display:none}
 .sugar-grid.has-shop-shader [data-tier="5"] .shop-glitter{display:none}
 .sugar-grid :is([data-tier="3"],[data-tier="4"],[data-tier="5"]):not(:disabled){background-image:linear-gradient(180deg,#10171e99,transparent 48%,#10171e55),var(--shop-vector);background-size:100% 100%;background-repeat:no-repeat}
 .sugar-grid [data-tier="3"]{--shop-vector:${vectorBackdrop('#145e85','#324c98','#4fcddf')}}
 .sugar-grid [data-tier="4"]{--shop-vector:${vectorBackdrop('#a634b8','#246df0','#79c5ff')}}
 .sugar-grid [data-tier="5"]{--shop-vector:${vectorBackdrop('#d18b20','#ee731e','#ffca42',true)}}
 .sugar-grid :is([data-tier="3"],[data-tier="4"],[data-tier="5"])>b,.sugar-grid :is([data-tier="3"],[data-tier="4"],[data-tier="5"])>span:not(.shop-item-fx){text-shadow:0 1px 2px #080d12,0 0 4px #080d12}
 .sugar-grid [data-tier="3"]{--type-mid:#0abaff;--type-low:#2587df;--type-hot:#38deff;--type-glow:#009dff99;--type-aura:#008cff33}
 .sugar-grid [data-tier="4"]{--type-mid:#c269ff;--type-low:#a14ae6;--type-hot:#e48dff;--type-glow:#c443ff99;--type-aura:#ab30ff33}
 .sugar-grid [data-tier="5"]{--type-mid:#ffd600;--type-low:#e7a800;--type-hot:#fff000;--type-glow:#ffc40099;--type-aura:#ff980033}
 @supports (background-clip:text){
 .sugar-grid :is([data-tier="3"],[data-tier="4"],[data-tier="5"]):not(:disabled)>:is(b,.shop-price){
 /* A continuous saturated light core with a tight colored halo and a faint outer spill. */
 background-image:linear-gradient(180deg,var(--type-hot) 0% 38%,var(--type-mid) 66%,var(--type-low));
 background-size:100% 100%;background-position:0 0;background-clip:text;-webkit-background-clip:text;color:transparent;-webkit-text-fill-color:transparent;text-shadow:none;
 filter:drop-shadow(0 1px .5px #080d12) drop-shadow(0 0 .7px var(--type-glow)) drop-shadow(0 0 2px var(--type-glow)) drop-shadow(0 0 4px var(--type-aura));}
 }
 .shop-sugar-controls{display:flex;flex-wrap:wrap;align-items:center;gap:7px;margin:0 0 12px;font-size:10px;color:#b9c6bd}
 .shop-sugar-controls button{padding:7px 9px;background:#21302b;border:1px solid #687d65;border-radius:4px;color:#e9e4c9;font:inherit;touch-action:pan-y}
 `;document.head.appendChild(style);
 const canvas=document.createElement('canvas');canvas.className='shop-sugar-canvas';canvas.setAttribute('aria-hidden','true');
 let gl=null,unavailable=false;
 const toolbar=document.createElement('div');toolbar.className='shop-sugar-controls';toolbar.innerHTML='<span>糖霜材质</span><button type="button" id="sugar-light-toggle" aria-pressed="true">伪光照：开</button><button type="button" id="sugar-palette" aria-pressed="false">配色：金色</button>';
 const vertex=`attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
 const bakeFragment=`precision highp float;varying vec2 uv;
 vec3 hash3(vec3 p){return fract(sin(vec3(dot(p,vec3(127.1,311.7,74.7)),dot(p,vec3(269.5,183.3,246.1)),dot(p,vec3(113.5,271.9,124.6))))*43758.5453);}
 void main(){vec3 p=vec3(uv,.137)*128.,cell=floor(p),f=fract(p),winner=vec3(0.);float best=100.;
 for(int z=-1;z<=1;z++)for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec3 offset=vec3(float(x),float(y),float(z)),delta=offset+hash3(cell+offset)-f;float d=dot(delta,delta);if(d<best){best=d;winner=cell+offset;}}
 vec3 cellColor=hash3(winner+23.7);gl_FragColor=vec4(cellColor,dot(cellColor,vec3(.2126,.7152,.0722)));}`;
 const fragment=`precision highp float;varying vec2 uv;uniform sampler2D normalField;uniform vec2 size,pointer;uniform float time,seed,lighting,palette,normalStrength,tier,smokeAmount;
 const float PI=3.14159265;
 vec3 ramp(float value){if(palette>.5)return mix(vec3(.08,1.,.015),vec3(1.,.015,.85),value);if(tier<4.5)return mix(vec3(.22,.14,.38),vec3(.66,.48,.9),value);return mix(vec3(.23,.115,.022),vec3(1.,.7,.3),value);}
 float ggx(float nh){float a=.1*.1,a2=a*a,d=nh*nh*(a2-1.)+1.;return a2/max(PI*d*d,.00000001);}
 float smith(float nv){float k=1.1*1.1/8.;return nv/(nv*(1.-k)+k+.00001);}
 vec3 lamp(vec3 n,vec3 v,vec3 position,vec3 lightPos,vec3 lightColor,vec3 albedo){vec3 delta=lightPos-position;float distance2=dot(delta,delta);vec3 l=normalize(delta),h=normalize(l+v);float nl=max(dot(n,l),0.),nv=max(dot(n,v),.001),nh=max(dot(n,h),0.),vh=max(dot(v,h),0.);
 vec3 fresnel=vec3(.04)+vec3(.96)*pow(1.-vh,5.);vec3 spec=ggx(nh)*smith(nl)*smith(nv)*fresnel/max(.004,4.*nl*nv);
 return spec*lightColor*nl/(.45+distance2);}
 vec4 shade(vec2 at){float glintTime=time*.68;
 // Same nearest-cell RGB feeds both inputs, matching the supplied node diagram.
 vec2 fieldUV=(at-.5)*size/max(size.x,size.y)+.5;fieldUV=clamp(fieldUV+vec2(seed*.00037,seed*.00019),.001,.999);
 vec4 field=texture2D(normalField,fieldUV);vec3 albedo=ramp(field.a);
 // Tangent RGB normal decoding, blended halfway toward flat (Strength = 0.5).
 vec3 mapped=normalize(vec3((field.rg*2.-1.)*normalStrength,mix(1.,field.b*2.-1.,normalStrength)));
 vec3 base=normalize(vec3((at-.5)*vec2(.24,.18),1.));vec3 tangent=normalize(vec3(base.z,0.,-base.x)),bitangent=cross(base,tangent);
 vec3 n=normalize(tangent*mapped.x+bitangent*mapped.y+base*mapped.z),v=normalize(vec3(pointer*.45,1.));
 vec3 position=vec3((at-.5)*vec2(size.x/size.y,1.),0.);
 vec3 warmPos=vec3(sin(glintTime*.78)*.85,cos(glintTime*.57)*.65,.5),coolPos=vec3(cos(glintTime*.63+2.)*.8,sin(glintTime*.69+1.)*.7,.6);
 // Two moving studio strips form a simple reflection environment for low-roughness normals.
 vec3 reflected=reflect(-v,n);float stripA=(1.-smoothstep(.003,.018,abs(reflected.x-sin(glintTime*.72)*.65)))*(1.-smoothstep(.6,.95,abs(reflected.y-.15)));
 float stripB=(1.-smoothstep(.003,.016,abs(reflected.y-cos(glintTime*.61+1.4)*.6)))*(1.-smoothstep(.55,.9,abs(reflected.x+.2)));
 float front=smoothstep(-.1,.35,reflected.z);
 vec3 environment=(vec3(3.,2.8,2.5)*stripA+vec3(1.8,2.,2.3)*stripB)*front;
 vec3 specular=environment+lamp(n,v,position,warmPos,vec3(3.8,3.25,2.6),albedo)+lamp(n,v,position,coolPos,vec3(1.8,2.2,2.6),albedo);
 float peak=max(specular.r,max(specular.g,specular.b));
 // Only exceptional reflections become opaque; diffuse color stays almost invisible.
 float rare=tier>4.5?smoothstep(.50,.61,field.a):smoothstep(.56,.67,field.a);
 float spark=smoothstep(1.2,3.5,peak)*rare*lighting*(tier>4.5?1.:.55);
 float alpha=.022+spark*.95*mix(.45,1.,1.-smoothstep(.6,.95,at.y));
 vec3 color=mix(albedo,tier>4.5?vec3(1.,.97,.86):vec3(.9,.86,1.),min(1.,spark*(tier>4.5?1.:1.5)));
 return vec4(color*alpha,alpha);
 }
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);vec2 k=vec2(127.1,311.7);float a=fract(sin(dot(i,k))*43758.5453),b=fract(sin(dot(i+vec2(1.,0.),k))*43758.5453),c=fract(sin(dot(i+vec2(0.,1.),k))*43758.5453),d=fract(sin(dot(i+1.,k))*43758.5453);return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}
 float fbm(vec2 p){float v=0.,weight=.5;for(int i=0;i<4;i++){v+=noise(p)*weight;p=mat2(1.6,-1.2,1.2,1.6)*p+3.7;weight*=.5;}return v;}
 vec4 smoke(vec2 at){vec2 p=vec2(at.x*3.2,at.y*2.8-time*.38)+seed*.13;vec2 curl=vec2(fbm(p+1.7),fbm(p+8.3));float cloud=fbm(p+curl*2.4);
 float centerA=.28+.13*sin(at.y*6.-time*.5),centerB=.72+.1*sin(at.y*7.+time*.4);
 float width=.09+.12*at.y;float plume=exp(-pow((at.x-centerA)/width,2.))+exp(-pow((at.x-centerB)/(width*.85),2.));
 float density=pow(smoothstep(.27,.71,cloud),1.15)*min(1.,plume);
 float fade=smoothstep(0.,.12,at.y)*(1.-smoothstep(.72,1.,at.y));
 // Luminous aurora folds: a soft body with brighter narrow crests, not a flat veil.
 float crest=pow(density,3.);float textFade=mix(1.,.62,smoothstep(.58,.92,at.y));
 float alpha=(density*(tier>4.5?.32:.49)+crest*(tier>4.5?.14:.20))*fade*textFade*smokeAmount;
 vec3 color=tier>4.5?mix(vec3(1.,.76,.32),vec3(1.,.97,.78),cloud):mix(vec3(.73,.37,1.),vec3(.52,1.,.94),cloud);
 return vec4(color*alpha,alpha);
 }
 void main(){
 vec4 material=vec4(0.);if(tier>3.5){vec2 d=.28/size;vec4 a=shade(uv+d),b=shade(uv-d),c=shade(uv+vec2(d.x,-d.y)),e=shade(uv+vec2(-d.x,d.y));material=(a+b+c+e)*.25;float peak=max(max(a.a,b.a),max(c.a,e.a));float sharpened=mix(material.a,peak,.55);material.rgb*=sharpened/max(material.a,.0001);material.a=sharpened;}
 vec4 fog=smoke(uv);vec4 combined=material+fog*(1.-material.a);
 vec2 box=abs(uv-.5)*size-size*.5+vec2(7.);float corner=length(max(box,0.))+min(max(box.x,box.y),0.)-5.;if(corner>0.)discard;
 gl_FragColor=vec4(combined.rgb/max(combined.a,.0001),combined.a);
 }`;

 let program,buffer,texture,uniforms,root=null,cards=[],raf=0,last=0,elapsed=0,lost=false,inView=true,lighting=1,palette=0;
 const pointer=[0,0],reduce=matchMedia('(prefers-reduced-motion: reduce)');
 function compile(type,source){const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));return shader;}
 function makeProgram(code){const v=compile(gl.VERTEX_SHADER,vertex),f=compile(gl.FRAGMENT_SHADER,code),p=gl.createProgram();gl.attachShader(p,v);gl.attachShader(p,f);gl.bindAttribLocation(p,0,'position');gl.linkProgram(p);gl.deleteShader(v);gl.deleteShader(f);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p;}
 function init(){program=makeProgram(fragment);const baker=makeProgram(bakeFragment);
 buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
 texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1024,1024,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
 const framebuffer=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0);if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw Error('Normal map bake framebuffer unavailable');gl.viewport(0,0,1024,1024);gl.useProgram(baker);gl.drawArrays(gl.TRIANGLES,0,6);gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.deleteFramebuffer(framebuffer);gl.deleteProgram(baker);gl.bindTexture(gl.TEXTURE_2D,texture);gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
 gl.useProgram(program);gl.uniform1i(gl.getUniformLocation(program,'normalField'),0);uniforms=Object.fromEntries(['size','time','seed','pointer','lighting','palette','normalStrength','tier','smokeAmount'].map(name=>[name,gl.getUniformLocation(program,name)]));canvas.dataset.ready='true';canvas.dataset.material='voronoi-normal-ggx';canvas.dataset.textureSize='1024x1024';canvas.dataset.normalStrength='.5';canvas.dataset.roughness='.1';
 }
 function draw(){if(!gl||!program||lost||!root?.isConnected)return;const bounds=root.getBoundingClientRect();if(bounds.width<=0||bounds.height<=0)return;const dpr=Math.min(devicePixelRatio||1,1.5),w=Math.round(bounds.width*dpr),h=Math.round(bounds.height*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(program);gl.uniform1f(uniforms.time,elapsed);gl.uniform2fv(uniforms.pointer,pointer);gl.uniform1f(uniforms.lighting,lighting);gl.uniform1f(uniforms.palette,palette);gl.uniform1f(uniforms.normalStrength,.5);gl.uniform1f(uniforms.smokeAmount,1.);
 cards.forEach((card,i)=>{if(card.disabled)return;const r=card.getBoundingClientRect();gl.viewport(Math.round((r.left-bounds.left)*dpr),Math.round((bounds.bottom-r.bottom)*dpr),Math.round(r.width*dpr),Math.round(r.height*dpr));gl.uniform2f(uniforms.size,r.width,r.height);gl.uniform1f(uniforms.seed,37.4+i*91.7);gl.uniform1f(uniforms.tier,+card.dataset.tier);gl.drawArrays(gl.TRIANGLES,0,6);});}
 function running(){return !!gl&&!!program&&!lost&&root?.isConnected&&root.getClientRects().length>0&&cards.some(card=>!card.disabled)&&!reduce.matches&&!document.hidden&&inView;}
 function frame(now){raf=0;if(!running())return;if(!last)last=now;if(now-last>=32){elapsed+=Math.min((now-last)/1000,.1);last=now;draw();}raf=requestAnimationFrame(frame);}
 function sync(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;draw();if(running())raf=requestAnimationFrame(frame);}
 const resize=new ResizeObserver(draw),intersection=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync();});
 function mount(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;pointer.fill(0);resize.disconnect();intersection.disconnect();root=document.querySelector('.shop-quality .shop-grid');cards=root?[...root.querySelectorAll('[data-tier="4"],[data-tier="5"]')]:[];canvas.remove();toolbar.remove();if(!root)return;root.classList.add('sugar-grid');if(!cards.length||unavailable)return;
 if(!gl){try{gl=canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:false,preserveDrawingBuffer:true});if(!gl){unavailable=true;return;}init();}catch(error){unavailable=true;canvas.dataset.error=error.message;return;}}
 root.classList.add('has-shop-shader');if(previewControls)root.before(toolbar);root.appendChild(canvas);cards.forEach(card=>{card.querySelector('.shop-glitter')?.remove();card.onpointermove=e=>{if(reduce.matches)return;const r=card.getBoundingClientRect();pointer[0]=(e.clientX-r.left)/r.width-.5;pointer[1]=.5-(e.clientY-r.top)/r.height;};card.onpointerleave=()=>pointer.fill(0);});resize.observe(root);intersection.observe(root);sync();}
 toolbar.querySelector('#sugar-light-toggle').onclick=()=>{lighting=1-lighting;toolbar.querySelector('#sugar-light-toggle').textContent='伪光照：'+(lighting?'开':'关');toolbar.querySelector('#sugar-light-toggle').setAttribute('aria-pressed',String(!!lighting));draw();};
 toolbar.querySelector('#sugar-palette').onclick=()=>{palette=1-palette;toolbar.querySelector('#sugar-palette').textContent='配色：'+(palette?'参考绿粉':'金色');toolbar.querySelector('#sugar-palette').setAttribute('aria-pressed',String(!!palette));draw();};
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;canvas.dataset.ready='false';if(raf)cancelAnimationFrame(raf);raf=0;});canvas.addEventListener('webglcontextrestored',()=>{lost=false;init();sync();});document.addEventListener('visibilitychange',sync);reduce.addEventListener('change',sync);
 const baseRender=renderShop;renderShop=function(...args){baseRender(...args);mount();};
 // Equipment comparisons, terrain shops and leaving can replace/hide the overlay without renderShop.
 const overlay=document.getElementById('overlay');new MutationObserver(()=>{const next=document.querySelector('.shop-quality .shop-grid');if(next!==root)mount();else sync();}).observe(overlay,{childList:true,attributes:true,attributeFilter:['style','class']});mount();
})();

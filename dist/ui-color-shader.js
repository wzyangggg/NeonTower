/* Animated opaque surfaces. Each small canvas is scoped to a geometric specimen. */
(()=>{'use strict';
const vertex='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const fragment=`precision mediump float;
uniform vec2 size;uniform float time;uniform float kind;uniform float selected;
void main(){
 vec2 uv=gl_FragCoord.xy/size;
 float wave=sin(uv.x*4.6+uv.y*2.4+time*.16)*.5+.5;
 vec3 teal=vec3(.08,.83,.82),blue=vec3(.10,.35,.88),pink=vec3(.98,.18,.67),purple=vec3(.43,.19,.86);
 vec3 col=mix(blue,teal,smoothstep(.05,.96,uv.y+wave*.20));
 col=mix(col,pink,smoothstep(.40,1.15,uv.x+wave*.24)*.78);
 if(kind>0.5&&kind<1.5){vec3 enamel=mix(vec3(.28,.94,.88),vec3(.94,.48,.83),smoothstep(.05,1.1,uv.x+(.7-uv.y)*.4+wave*.12));col=mix(vec3(.19,.18,.34),enamel,selected);}
 if(kind>1.5&&kind<2.5){col=mix(vec3(.27,.95,.86),vec3(.65,.76,1.),smoothstep(0.,1.2,uv.x+wave*.15));}
 if(kind>2.5){col=mix(vec3(1.,.43,.78),vec3(1.,.81,.54),smoothstep(0.,1.1,uv.x+wave*.12));}
 float gloss=pow(max(0.,1.-abs(uv.y-.91)*10.),3.);
 col+=vec3(.55,.95,1.)*gloss*.13;
 // Fine diagonal reflection travels slowly, never strobes.
 float sheen=pow(max(0.,1.-abs(uv.x+uv.y*.35-mod(time*.025,1.8)+.35)*8.),5.);
 col+=mix(vec3(.35,.85,1.),vec3(1.,.5,.85),uv.x)*sheen*.13;
 gl_FragColor=vec4(col,1.);
}`;
let frame=0,last=-1000;const reduced=matchMedia('(prefers-reduced-motion: reduce)'),items=[];
const targets=[...document.querySelectorAll('.intro,.gear:not(.locked),.character-header,.reward')];
for(const host of targets){const canvas=document.createElement('canvas');canvas.className='pop-surface';canvas.setAttribute('aria-hidden','true');host.prepend(canvas);const gl=canvas.getContext('webgl',{alpha:false,antialias:false,preserveDrawingBuffer:true});if(!gl){canvas.remove();continue;}
 const compile=(type,source)=>{const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));return shader;};
 const init=()=>{const program=gl.createProgram();const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.deleteShader(vs);gl.deleteShader(fs);gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const pos=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);return Object.fromEntries(['size','time','kind','selected'].map(name=>[name,gl.getUniformLocation(program,name)]));};
 let uniforms=init();const item={host,canvas,gl,visible:true,lost:false,draws:0,get uniforms(){return uniforms;},kind:host.matches('.gear')?1:host.matches('.character-header')?2:host.matches('.reward')?3:0};items.push(item);
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();item.lost=true;});canvas.addEventListener('webglcontextrestored',()=>{uniforms=init();item.lost=false;});
}
const observer=new IntersectionObserver(entries=>{for(const entry of entries){const item=items.find(x=>x.host===entry.target);if(item)item.visible=entry.isIntersecting;}});items.forEach(item=>observer.observe(item.host));
function tick(now){frame=requestAnimationFrame(tick);if(document.hidden||now-last<1000/30)return;last=now;for(const item of items){if(!item.visible||item.lost)continue;const {host,canvas,gl,uniforms:u}=item;const w=Math.max(1,Math.round(host.clientWidth)),h=Math.max(1,Math.round(host.clientHeight));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}gl.uniform2f(u.size,w,h);gl.uniform1f(u.time,reduced.matches?0:now/1000);gl.uniform1f(u.kind,item.kind);gl.uniform1f(u.selected,host.classList.contains('selected')?1:0);gl.drawArrays(gl.TRIANGLES,0,6);item.draws++;}}
frame=requestAnimationFrame(tick);
globalThis.UIColorShader={get items(){return items;},get reduced(){return reduced.matches;}};
addEventListener('pagehide',()=>{cancelAnimationFrame(frame);observer.disconnect();},{once:true});
})();

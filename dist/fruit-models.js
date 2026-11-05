'use strict';

// Offline-converted Back Garden meshes retain their original UVs and palette texture.
globalThis.FruitModels=(()=>{
 const kinds=['apple','watermelon','banana','grape'],models=new Map(),instances=[];
 let loading=null,image=null,gpu=null,uploads=0;
 function load(){
  if(loading)return loading;
  loading=Promise.all(kinds.map(async kind=>{
   const response=await fetch('assets/fruits/'+kind+'.json');if(!response.ok)throw Error('水果模型读取失败：'+kind);
   const mesh=await response.json(),count=mesh.positions.length/3;
   if(!Number.isInteger(count)||count%3||mesh.normals.length!==count*3||mesh.uvs.length!==count*2)throw Error('水果模型格式错误：'+kind);
   const vertices=new Float32Array(count*8);
   for(let i=0;i<count;i++)vertices.set([...mesh.positions.slice(i*3,i*3+3),...mesh.normals.slice(i*3,i*3+3),...mesh.uvs.slice(i*2,i*2+2)],i*8);
   if(!vertices.every(Number.isFinite))throw Error('水果模型坐标错误：'+kind);
   models.set(kind,{vertices,count,source:mesh.source});
  })).then(()=>new Promise((resolve,reject)=>{
   image=new Image();image.onload=resolve;image.onerror=()=>reject(Error('水果贴图读取失败'));
   image.src='assets/fruits/Garden-Palette.png';
  }));
  return loading;
 }
 function initialize(r){
  if(gpu?.marker===r.program)return gpu;
  const gl=r.gl,compile=(type,source)=>{const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));return shader;};
  const vertex=compile(gl.VERTEX_SHADER,`attribute vec3 p;attribute vec3 n;attribute vec2 uv;uniform mat4 vp;uniform vec3 origin;uniform float size;uniform float angle;varying vec2 texcoord;varying float light;varying vec3 surfaceTone;uniform vec3 keyLightDirection;uniform vec3 topLight;uniform vec2 clubLight;uniform vec3 rearLeftColor;uniform vec3 rearRightColor;${r.surfaceShaderGLSL}void main(){float c=cos(angle),s=sin(angle);vec3 at=vec3(p.x*c+p.z*s,p.y,-p.x*s+p.z*c);vec3 normal=normalize(vec3(n.x*c+n.z*s,n.y,-n.x*s+n.z*c));light=.55+.45*max(0.,dot(normal,normalize(vec3(-.4,.85,.45))));surfaceTone=softToonShade(vec3(1.),normal,keyLightDirection,topLight,rearLeftColor*clubLight.x,rearRightColor*clubLight.y,0.,0.);texcoord=uv;gl_Position=vp*vec4(origin+at*size,1.);}`);
  const fragment=compile(gl.FRAGMENT_SHADER,`precision mediump float;uniform sampler2D image;varying vec2 texcoord;varying float light;varying vec3 surfaceTone;uniform float surfaceShader;void main(){vec4 sample=texture2D(image,texcoord);if(sample.a<.1)discard;gl_FragColor=vec4(sample.rgb*(surfaceShader>.5?surfaceTone:vec3(.3+.8*light)),1.);}`);
  const program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
  gl.deleteShader(vertex);gl.deleteShader(fragment);
  const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
  for(const [key,value]of [[gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,key,value);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
  const buffers=new Map();for(const [kind,mesh]of models){const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,mesh.vertices,gl.STATIC_DRAW);buffers.set(kind,buffer);uploads++;}
  gpu={marker:r.program,program,texture,buffers,uniforms:Object.fromEntries(['vp','origin','size','angle','image','surfaceShader','keyLightDirection','topLight','clubLight','rearLeftColor','rearRightColor'].map(name=>[name,gl.getUniformLocation(program,name)]))};return gpu;
 }
 function draw(kind,x,y,z,size=34,angle=0){if(!models.has(kind)||!image?.complete||!image.naturalWidth)return false;instances.push({kind,x,y,z,size,angle});return true;}
 function render(r){
  if(!instances.length||!image?.naturalWidth)return;
  const {program,texture,buffers,uniforms:u}=initialize(r),gl=r.gl;
  gl.useProgram(program);gl.uniform1f(u.surfaceShader,r.surfaceShaderMode());gl.uniform3fv(u.keyLightDirection,r.keyLightDirection||[.1,1,-.1]);gl.uniform3fv(u.topLight,r.topLight||[.3,.6,.5]);gl.uniform2f(u.clubLight,r.clubCyan??.8,r.clubMagenta??.65);gl.uniform3fv(u.rearLeftColor,r.rearLeftColor||[.12,.92,.78]);gl.uniform3fv(u.rearRightColor,r.rearRightColor||[.85,.12,.48]);gl.disable(gl.BLEND);gl.depthMask(true);gl.uniformMatrix4fv(u.vp,false,r.vp);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.uniform1i(u.image,0);
  for(const at of instances){gl.bindBuffer(gl.ARRAY_BUFFER,buffers.get(at.kind));r.attributes(program,[['p',3],['n',3],['uv',2]],32);gl.uniform3f(u.origin,at.x,at.y,at.z);gl.uniform1f(u.size,at.size);gl.uniform1f(u.angle,at.angle);gl.drawArrays(gl.TRIANGLES,0,models.get(at.kind).count);}
 }
 return {load,draw,render,begin(){instances.length=0;},get ready(){return models.size===4&&!!image?.naturalWidth;},get stats(){return {uploads,instances:instances.length,models:[...models].map(([kind,m])=>({kind,vertices:m.count,source:m.source}))};}};
})();

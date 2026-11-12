"use strict";
(() => {
 const canvas = document.createElement('canvas');
 canvas.className = 'title-mixer';
 canvas.setAttribute('aria-hidden','true');
 const rowRatio = 5.2;
 const modelHeight = 2.08;
 const modelWidth = modelHeight*rowRatio;
 canvas.width = 832;
 canvas.height = 160;
 const profiles = [
  {radius:1, facets:64, grip:.055, color:[1,.74,.29], marks:[[.18,.73,2.055,2.195]]},
  {radius:.84, facets:64, grip:.022, color:[.42,1,1], marks:[[.51,.74,1.34,1.56],[.51,.74,1.87,2.09]]},
  {radius:.94, facets:48, grip:0, color:[1,.49,.21], marks:[[.665,.725,0,Math.PI*2]]},
  {radius:.88, facets:8, grip:0, color:[.86,.64,1], marks:[[.52,.72,.63,.84],[.52,.72,2.71,2.92],[.52,.72,4.80,5.01]]}
 ];
 const vertices = [];
 const turn = Math.PI*2;
 function model(profile,index) {
  const {radius,facets,grip,color,marks} = profile;
  const center = (index-1.5)*modelWidth/profiles.length;
  const point = (r,a,h) => [center+r*Math.cos(a),r*Math.sin(a),h];
  const vertex = ([x,y,h],shade) => vertices.push(x/(modelWidth/2),y/(modelHeight/2),-h/3,...shade);
  function strip(r1,h1,r2,h2,start,end,segments,paint,teeth=0) {
   for(let i=0;i<segments;i++) {
    const a=start+(end-start)*i/segments,b=start+(end-start)*(i+1)/segments;
    const notchA=i%2*teeth,notchB=(i+1)%2*teeth;
    const p=point(r1-notchA,a,h1),q=point(r1-notchB,b,h1);
    const r=point(r2-notchB,b,h2),s=point(r2-notchA,a,h2);
    const shade=paint((a+b)/2);
    for(const corner of [p,q,r,p,r,s]) vertex(corner,shade);
   }
  }
  const metal = (base,contrast) => angle => {
   const light = base+contrast*Math.cos(angle-2.2);
   return [light*.82,light*.93,light*1.1];
  };
  strip(radius,0,radius,.13,0,turn,64,metal(.17,.08));
  strip(radius,.13,radius*.86,.20,0,turn,64,metal(.29,.12));
  strip(radius*.83,.20,radius*.83,.46,0,turn,facets,metal(.20,.11),grip);
  strip(radius*.83,.46,radius*.69,.53,0,turn,facets,metal(.39,.13),grip);
  strip(radius*.69,.53,0,.53,0,turn,facets,metal(.24,.035));
  // The viewport bloom extracts bright RGB channels after the canvas is scaled.
  const core = color.map(channel=>.78+channel*.22);
  for(const [inner,outer,start,end] of marks) {
   const segments=Math.max(8,Math.ceil((end-start)*12));
   strip(radius*inner,.542,radius*outer,.542,start,end,segments,()=>color);
   const inset=(outer-inner)*.16;
   const trim=(end-start)*.10;
   const closed=end-start===turn;
   strip(radius*(inner+inset),.545,radius*(outer-inset),.545,
    closed?start:start+trim,closed?end:end-trim,segments,()=>core);
  }
 }
 profiles.forEach(model);
 function render(gl) {
  function shader(type,source) {
   const result=gl.createShader(type);
   gl.shaderSource(result,source);
   gl.compileShader(result);
   return result;
  }
  const program=gl.createProgram();
  const vertex=shader(gl.VERTEX_SHADER,'attribute vec3 position, color; varying vec3 ink; void main(){gl_Position=vec4(position,1.);ink=color;}');
  const fragment=shader(gl.FRAGMENT_SHADER,'precision mediump float; varying vec3 ink; void main(){gl_FragColor=vec4(ink,1.);}');
  gl.attachShader(program,vertex);
  gl.attachShader(program,fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)) {
   gl.deleteProgram(program);
   return;
  }
  gl.useProgram(program);
  const buffer=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
  for(const [name,offset] of [['position',0],['color',12]]) {
   const location=gl.getAttribLocation(program,name);
   gl.enableVertexAttribArray(location);
   gl.vertexAttribPointer(location,3,gl.FLOAT,false,24,offset);
  }
  gl.viewport(0,0,canvas.width,canvas.height);
  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES,0,vertices.length/6);
  gl.deleteBuffer(buffer);
  gl.deleteProgram(program);
  canvas.dataset.rendered='true';
 }
 let mounted=false;
 let boundsKey='';
 globalThis.TitleMixer = {
  layout(viewport,overlay) {
   const panel=overlay.querySelector('.difficulty-panel');
   const nav=document.getElementById('lobby-nav');
   if(!panel||!nav) return;
   const frame=viewport.getBoundingClientRect();
   const card=panel.getBoundingClientRect();
   const gap=nav.getBoundingClientRect().top-card.bottom;
   const previousHeight=Math.floor(Math.min(68,(frame.width-16)/6.5,gap-12));
   const height=Math.min(previousHeight*1.25,gap-2);
   canvas.hidden=height<16;
   if(canvas.hidden) return;
   if(!mounted) {
    mounted=true;
    viewport.append(canvas);
    const gl=canvas.getContext('webgl',{alpha:true,antialias:true,preserveDrawingBuffer:true});
    if(!gl) return;
    canvas.addEventListener('webglcontextlost',event=>event.preventDefault());
    canvas.addEventListener('webglcontextrestored',()=>render(gl));
    render(gl);
   }
   const top=Math.round(card.bottom-frame.top+(gap-height)/2);
   const key=top+':'+height;
   if(boundsKey===key) return;
   boundsKey=key;
   canvas.style.top=top+'px';
   canvas.style.width=height*rowRatio+'px';
   canvas.style.height=height+'px';
  }
 };
})();

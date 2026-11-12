(() => {
 const burstLimit=4, particlesPerBurst=6000, capacity=burstLimit*particlesPerBurst;
 const x=new Float32Array(capacity), z=new Float32Array(capacity);
 const vx=new Float32Array(capacity), vz=new Float32Array(capacity);
 const life=new Float32Array(capacity), variation=new Float32Array(capacity);
 const depthStretch=1.45;
 const airResistance=4.3;
 const flowWidth=256, flowMask=flowWidth-1, flowScale=flowWidth/896;
 const bursts=[];
 let cursor=0, seed=9427, flowTime=0, layer, context, image, density, blur, flowX, flowZ;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};

 function buildFlow() {
  flowX=new Float32Array(flowWidth*flowWidth);
  flowZ=new Float32Array(flowX.length);
  // Take the perpendicular gradient of waves at three scales. Nearby
  // particles share the resulting eddies and carry the smoke into folds.
  const waves=[
   [7,5,.44,2.6],[11,8,.62,.2],[-8,14,.53,1.7],[3,-11,.45,4.5],
   [22,-17,.42,5.6],[14,25,.36,.9],[-25,14,.34,3.4],
   [45,14,.18,2.2],[-36,28,.15,5.1],[28,-48,.12,4.1]
  ];
  const step=Math.PI*2/flowWidth;
  const columnCos=new Float32Array(flowWidth), columnSin=new Float32Array(flowWidth);
  for(const [kx,kz,amplitude,phase] of waves){
   const weight=amplitude/Math.hypot(kx,kz);
   for(let col=0;col<flowWidth;col++){
    columnCos[col]=Math.cos(col*kx*step);
    columnSin[col]=Math.sin(col*kx*step);
   }
   for(let row=0;row<flowWidth;row++){
    const angle=row*kz*step+phase;
    const rowCos=weight*Math.cos(angle), rowSin=weight*Math.sin(angle);
    for(let col=0;col<flowWidth;col++){
     const slope=columnCos[col]*rowCos-columnSin[col]*rowSin;
     const index=row*flowWidth+col;
     flowX[index]+=kz*slope;
     flowZ[index]-=kx*slope;
    }
   }
  }
 }

 function sampleFlow(field, top, right, bottom, fx, fz) {
  const first=field[top]+(field[right]-field[top])*fx;
  const second=field[top+bottom]+(field[right+bottom]-field[top+bottom])*fx;
  return first+(second-first)*fz;
 }

 function pushNearbySmoke(worldX,worldZ,size) {
  const reach2=(size*1.8)**2;
  for(const b of bursts){
   for(let i=b.start,end=i+b.count;i<end;i++){
    if(b.age>=life[i])continue;
    const dx=x[i]-worldX, dz=z[i]-worldZ;
    const distance2=dx*dx+dz*dz;
    if(distance2>=reach2)continue;
    const impulse=1.9*(1-distance2/reach2);
    vx[i]+=dx*impulse;
    vz[i]+=dz*impulse;
   }
  }
 }

 function emit(renderer, worldX, worldZ, radius) {
  if(smoke.mode==='legacy')return false;
  if(smoke.mode==='off')return true;
  if(!layer){
   const target=document.createElement('canvas');
   context=target.getContext('2d');
   if(!context)return false;
   target.id='particle-smoke';
   target.setAttribute('aria-hidden','true');
   target.style.cssText='pointer-events:none;display:none';
   renderer.canvas.after(target);
   layer=target;
  }
  if(!flowX)buildFlow();
  const slot=cursor;
  cursor=(cursor+1)%burstLimit;
  const replaced=bursts.findIndex(burst=>burst.slot===slot);
  if(replaced>=0)bursts.splice(replaced,1);
  const start=slot*particlesPerBurst;
  const count=Math.min(particlesPerBurst,Math.max(1400,Math.round(radius*94)));
  const size=Math.max(16,Math.min(radius,105));
  pushNearbySmoke(worldX,worldZ,size);
  const heading=random()*Math.PI*2;
  for(let i=start;i<start+count;i++){
   const angle=random()*Math.PI*2;
   const dx=Math.cos(angle), dz=Math.sin(angle)*depthStretch;
   const distance=size*.11*Math.sqrt(random());
   const unevenness=1+.12*Math.sin(angle*3+heading)+.065*Math.sin(angle*5-heading);
   const speed=size*(.65+4.4*random()**.68)*unevenness;
   x[i]=worldX+dx*distance;
   z[i]=worldZ+dz*distance;
   vx[i]=dx*speed;
   vz[i]=dz*speed;
   life[i]=1.08+random()*.98;
   variation[i]=random();
  }
  bursts.push({slot,start,count,size,age:0});
  return true;
 }

 function update(dt) {
  flowTime+=dt;
  if(!bursts.length)return;
  for(let i=bursts.length-1;i>=0;i--){
   const b=bursts[i];
   b.age+=dt;
   if(b.age>=2.06)bursts.splice(i,1);
  }
  const damping=Math.exp(-airResistance*dt);
  const impulseTravel=(1-damping)/airResistance;
  // World position and the shared clock are the only inputs to the wind.
  const originX=flowTime*7+37, originZ=-flowTime*5+83;
  for(const b of bursts){
   // Let the burst lead, roll in the wind, then settle as the smoke fades.
   const windTravel=(1-Math.exp(-9*b.age))*Math.exp(-3.15*b.age)*dt;
   for(let i=b.start,end=i+b.count;i<end;i++){
    if(b.age>=life[i])continue;
    const u=x[i]*flowScale+originX, v=z[i]*flowScale+originZ;
    const col=Math.floor(u), row=Math.floor(v), fx=u-col, fz=v-row;
    const rowStart=(row&flowMask)*flowWidth;
    const nextRow=((row+1)&flowMask)*flowWidth-rowStart;
    const top=rowStart+(col&flowMask), right=rowStart+((col+1)&flowMask);
    x[i]+=vx[i]*impulseTravel+(6+132*sampleFlow(flowX,top,right,nextRow,fx,fz))*windTravel;
    z[i]+=vz[i]*impulseTravel+(-8+132*sampleFlow(flowZ,top,right,nextRow,fx,fz))*windTravel;
    vx[i]*=damping;
    vz[i]*=damping;
   }
  }
 }

 function draw(renderer) {
  if(!bursts.length){
   if(layer&&layer.style.display!=='none')layer.style.display='none';
   return;
  }
  const screen=renderer.canvas;
  const width=Math.min(160,Math.max(2,Math.round(screen.width/2.6)));
  const height=Math.min(360,Math.max(2,Math.round(width*screen.height/screen.width)));
  if(!image||image.width!==width||image.height!==height){
   layer.width=width;
   layer.height=height;
   image=context.createImageData(width,height);
   density=new Float32Array(width*height);
   blur=new Float32Array(width*height);
  }
  // Deposit the projected particles into four neighboring density cells.
  density.fill(0);
  const matrix=renderer.vp, halfW=width/2, halfH=height/2;
  for(const b of bursts){
   const lift=13+b.size*.50*(1-Math.exp(-2.35*b.age))**2;
   const clipX=matrix[4]*lift+matrix[12];
   const clipY=matrix[5]*lift+matrix[13];
   const clipW=matrix[7]*lift+matrix[15];
   for(let i=b.start,end=i+b.count;i<end;i++){
    const remaining=life[i]-b.age;
    if(remaining<=0)continue;
    const w=matrix[3]*x[i]+matrix[11]*z[i]+clipW;
    if(w<=0)continue;
    const sx=halfW*(1+(matrix[0]*x[i]+matrix[8]*z[i]+clipX)/w);
    const sy=halfH*(1-(matrix[1]*x[i]+matrix[9]*z[i]+clipY)/w);
    const col=Math.floor(sx), row=Math.floor(sy);
    if(col<0||row<0||col>=width-1||row>=height-1)continue;
    const index=row*width+col, fx=sx-col, fy=sy-row;
    const amount=Math.min(1,b.age*20,remaining*1.45)*(.53+variation[i]*.75);
    density[index]+=amount*(1-fx)*(1-fy);
    density[index+1]+=amount*fx*(1-fy);
    density[index+width]+=amount*(1-fx)*fy;
    density[index+width+1]+=amount*fx*fy;
   }
  }
  for(let row=0;row<height;row++){
   const start=row*width;
   for(let col=0;col<width;col++){
    const i=start+col;
    blur[i]=(density[i]*3+(col?density[i-1]:0)+(col+1<width?density[i+1]:0))*.2;
   }
  }
  const pixels=image.data;
  for(let i=0;i<density.length;i++){
   const above=i>=width?blur[i-width]:0, below=i+width<density.length?blur[i+width]:0;
   const amount=(blur[i]*3+above+below)*.2;
   const offset=i*4;
   if(amount===0){pixels[offset+3]=0;continue;}
   const opacity=amount/(amount+3.4);
   const light=Math.max(-20,Math.min(25,24*(below-above)/(amount+4.5)));
   pixels[offset]=184-60*opacity+light;
   pixels[offset+1]=189-59*opacity+light;
   pixels[offset+2]=201-57*opacity+light;
   pixels[offset+3]=opacity*216;
  }
  context.putImageData(image,0,0);
  if(layer.style.display==='none')layer.style.display='';
 }

 function clear(){
  bursts.length=0;
  cursor=0;
  if(layer)layer.style.display='none';
 }

 let fluid, triedFluid=false;
 function prepareFluid(sceneCanvas){
  if(triedFluid)return;
  triedFluid=true;
  fluid=globalThis.FluidSmoke?.create(sceneCanvas);
 }
 const smoke={
  mode:new URLSearchParams(location.search).get('smoke'),
  get trails(){return smoke.mode==='trails';},
  trail(renderer,point,kind,hue){
   return smoke.trails&&globalThis.EmberExplosions?.emitTrail(renderer,point,kind,hue);
  },
  emit(renderer,x,z,radius,fragments,options){
   if(!smoke.mode||smoke.mode==='ember'||smoke.mode==='shared'||smoke.trails){
    const emitted=globalThis.EmberExplosions?.emitShared(renderer,x,z,radius,options);
    if(emitted)return true;
   }
   if(smoke.mode!=='particles'&&smoke.mode!=='off'&&smoke.mode!=='legacy'){
    prepareFluid(renderer.canvas);
    if(fluid&&!fluid.lost){fluid.emit(x,z,radius,fragments);return true;}
   }
   return emit(renderer,x,z,radius);
  },
  update(dt,missileDt=dt){globalThis.EmberExplosions?.update(globalThis.MissileLab?missileDt:dt);fluid?.update(dt);update(dt);},
  draw(renderer){globalThis.EmberExplosions?.draw(renderer);fluid?.draw(renderer);draw(renderer);},
  clear(release=false){
   if(release)globalThis.EmberExplosions?.dispose();
   else globalThis.EmberExplosions?.clear();
   fluid?.clear();
   clear();
  }
 };
 globalThis.ParticleSmoke=smoke;
})();

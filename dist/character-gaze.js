'use strict';
// Screen-space gaze, independent of head pose, movement direction and weapon yaw.
globalThis.CharacterGaze=(()=>{
 const states=new WeakMap();let current={x:0,y:0,target:null};
 function project(matrix,point){const q=[0,1,3].map(row=>point.reduce((sum,v,col)=>sum+matrix[col*4+row]*v,matrix[12+row]));if(!q.every(Number.isFinite)||q[2]<=1e-6)return null;return [q[0]/q[2],q[1]/q[2]];}
 function direction(matrix,from,to,aspect=1){
  if(!to)return [0,0];const a=project(matrix,from),b=project(matrix,to);if(!a||!b)return [0,0];
  // UV Y is upwards. Correct aspect so diagonal screen angles stay diagonal.
  const dx=(b[0]-a[0])*aspect,dy=b[1]-a[1],length=Math.hypot(dx,dy);return length>1e-6?[dx/length,dy/length]:[0,0];
 }
 function update(owner,target,renderer,time){
  if(!owner)return current={x:0,y:0,target:null};
  const point=o=>[o.x-325,0,(o.y-300)*1.06],goal=direction(renderer.vp,point(owner),target?point(target):null,renderer.canvas.width/Math.max(1,renderer.canvas.height));
  let s=states.get(owner);if(!s||time<s.time||time-s.time>.15){s={x:goal[0],y:goal[1],time};states.set(owner,s);}else{const dt=time-s.time,blend=1-Math.exp(-dt*18);s.x+=(goal[0]-s.x)*blend;s.y+=(goal[1]-s.y)*blend;s.time=time;}
  return current={x:s.x,y:s.y,target};
 }
 // Port of IslandDefenderCatEyeUV.shader. Each eye has its own 0..1 UVs;
 // mirrored UV islands can pass a negative axis sign without changing the gaze.
 const eyeGLSL=`vec3 characterEyeColor(vec2 eyeUV,vec2 gaze,vec2 uvSign,float pupilSize,float travel,vec3 eyeWhite,vec3 pupilColor,sampler2D pupilTexture){
  vec2 direction=gaze/max(1.,length(gaze));
  vec2 center=.5+direction*uvSign*.2*clamp(travel,0.,1.);
  vec2 pupilUV=(eyeUV-center)/clamp(pupilSize,.0001,1.)+.5;
  float inside=step(0.,pupilUV.x)*step(pupilUV.x,1.)*step(0.,pupilUV.y)*step(pupilUV.y,1.);
  vec4 tex=texture2D(pupilTexture,pupilUV);
  float circle=1.-smoothstep(.48,.5,length(pupilUV-.5));
  return mix(eyeWhite,tex.rgb*pupilColor,clamp(tex.a*inside*circle,0.,1.));
 }`;
 const fox=Object.freeze({pupilSize:.676,travel:.55,eyeWhite:[.9339623,.9164405,.86788005],pupilColor:[.015,.01,.005],uvSign:[1,1]});
 return {project,direction,update,eyeGLSL,fox,get current(){return current;}};
})();

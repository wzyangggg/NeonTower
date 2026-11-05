
'use strict';
// Placement handoff: the tray exits, then floor expansion or a brief construction puff.
globalThis.RoomReady=(()=>{
 const duration=.55;
 let active=false,room=0,elapsed=0,stage='idle',resume=null,cells=[],mode='floor',depth=0;
 function cancel(){active=false;stage='idle';elapsed=0;resume=null;cells=[];depth=0;}
 function recordPlacement(placed,kind='floor'){cells=placed.map(c=>({x:c.x,y:c.y}));mode=kind==='floor'?'floor':'smoke';}
 function screenDepth(){
  if(!cells.length||mode!=='floor')return 0;
  renderer.resize();const m=renderer.vp,cr=canvas.getBoundingClientRect(),vr=$('viewport').getBoundingClientRect(),bottom=vr.bottom-cr.top+32,target=1-2*bottom/cr.height;
  let lowest=0;
  for(const c of cells)for(let i=0;i<6;i++){
   const a=Math.PI/6+i*Math.PI/3,x=HexMap.x(c.x,c.y)+Math.cos(a)*HexMap.RADIUS,z=(HexMap.y(c.y)+Math.sin(a)*HexMap.RADIUS)*1.06;
   const denominator=m[5]-target*m[7];if(Math.abs(denominator)<1e-10)continue;
   const y=(target*(m[3]*x+m[11]*z+m[15])-(m[1]*x+m[9]*z+m[13]))/denominator;
   if(Number.isFinite(y))lowest=Math.min(lowest,y-4);
  }
  return Math.max(1,-lowest+8);
 }
 function begin(start){
  if(testMode){cells=[];start?.();return;}
  active=true;room=floor;stage='tray';elapsed=0;resume=start;depth=screenDepth();
  releaseJoy();Object.keys(keys).forEach(k=>keys[k]=false);
 }
 function liftAt(x,z){
  if(!active||mode!=='floor'||!cells.some(c=>Math.abs(HexMap.x(c.x,c.y)-x)<1&&Math.abs(HexMap.y(c.y)*1.06-z)<1))return 0;
  const progress=stage==='tray'?0:Math.min(1,elapsed/duration);return -depth*(1-progress)**3;
 }
 function pose(key,at){
  if(!active||!(/^(electric:|cover:|hex-cover:|pickup-chip:)/.test(key)))return at;
  const lift=liftAt(at[3],at[11]);if(!lift)return at;const next=Array.from(at);next[7]+=lift;return next;
 }
 function tick(dt){
  if(!active)return false;
  if(testMode||floor!==room||['dead','won','menu','upgrade'].includes(state)){cancel();return false;}
  if(paused)return true;
  if(stage==='tray'){
   const copies=[...document.querySelectorAll('.electric-panel.ui-exit-copy')];
   if(copies.some(el=>el.getAnimations().some(a=>a.playState!=='finished'&&a.playState!=='idle')))return true;
   stage=mode==='floor'?'rise':'smoke';elapsed=0;depth=screenDepth();if(cells.length)return true;
  }else elapsed=Math.min(duration,elapsed+Math.max(0,dt));
  if(!cells.length||elapsed>=duration){const start=resume;cancel();start?.();}return true;
 }
 function draw(){
  if(!active||stage!=='smoke')return;
  const u=elapsed/duration,alpha=.5*(1-u),r=renderer;
  for(const c of cells)for(let puff=0;puff<7;puff++){
   const a=puff*Math.PI*2/7,cx=HexMap.x(c.x,c.y)+Math.cos(a)*(4+u*15),cz=HexMap.y(c.y)*1.06+Math.sin(a)*(4+u*13),cy=10+u*(32+puff%3*8),size=7+u*16;
   const center=[cx,cy,cz],at=j=>{const t=j*Math.PI/4;return [cx+Math.cos(t)*size,cy+Math.sin(t)*size*.532,cz-Math.sin(t)*size*.847];};
   for(let j=0;j<8;j++)r.transparentQuad(center,at(j),at(j+1),center,'#a5adb4',[alpha,0,0,alpha]);
  }
 }
 return {begin,cancel,tick,recordPlacement,liftAt,pose,draw,get active(){return active;},get stage(){return stage;},get depth(){return depth;},get progress(){return elapsed/duration;}};
})();

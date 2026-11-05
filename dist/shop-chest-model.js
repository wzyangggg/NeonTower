/* Shared animated rainbow-cube preview: one WebGL surface for all visible shop cards. */
(()=>{'use strict';
let surface,gl,renderer,lost=false,scheduled=false,last=0;let targets=[];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function init(){surface=document.createElement('canvas');surface.width=surface.height=256;gl=surface.getContext('webgl',{alpha:true,antialias:true,preserveDrawingBuffer:true});if(!gl)return false;
const vp=new Float32Array(16);vp[0]=1/32;vp[5]=1/(32*.53217155);vp[15]=1;
// Shop cards show a much larger cube than world pickups: finer dots and a transparent front.
renderer={gl,program:{},vp,rainbowPickups:[],rainbowMaterial:{dots:5,white:.35,'rim-strength':.4}};surface.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;});surface.addEventListener('webglcontextrestored',()=>{renderer.program={};lost=false;refresh();});return true;}
function frame(now){scheduled=false;targets=targets.filter(c=>c.isConnected);if(!targets.length||document.hidden||lost)return;
if(!globalThis.RainbowPickups){schedule();return;}if(!gl&&!init())return;
if(now-last>=33||reduced.matches){last=now;gl.viewport(0,0,256,256);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);renderer.rainbowPickups=[{x:325,y:300,height:0,age:reduced.matches?.25:now/1000,clock:reduced.matches?.5:now/1000,angle:.4,icon:false}];RainbowPickups.render(renderer);
for(const c of targets){const ctx=c.getContext('2d');if(ctx){ctx.clearRect(0,0,c.width,c.height);ctx.drawImage(surface,0,0,c.width,c.height);c.dataset.rendered='true';c.dataset.material='rainbow-cube';}}}
if(!reduced.matches)schedule();}
function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(frame);}}
function pixelateIcon(image){
 if(!image.complete||!image.naturalWidth||image.hidden)return;
 const canvas=document.createElement('canvas');
 const resolution=24;
 canvas.width=canvas.height=resolution;
 const ctx=canvas.getContext('2d');
 if(!ctx)return;
 const scale=resolution/Math.max(image.naturalWidth,image.naturalHeight);
 const width=image.naturalWidth*scale,height=image.naturalHeight*scale;
 ctx.drawImage(image,(resolution-width)/2,(resolution-height)/2,width,height);
 image.hidden=true;
 image.after(canvas);
}
function refresh(){
 targets=[...document.querySelectorAll('.shop-gift-model')];
 if(!targets.length)return;
 document.querySelectorAll('.shop-gift-box .shop-box-pixel-icon img').forEach(pixelateIcon);
 schedule();
}
document.addEventListener('load',event=>{
 if(event.target.matches?.('.shop-gift-box .shop-box-pixel-icon img'))pixelateIcon(event.target);
},true);
new MutationObserver(refresh).observe(document.documentElement,{childList:true,subtree:true});document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});reduced.addEventListener('change',refresh);
window.ShopChestModel={refresh,get vertexCount(){return gl?6:0},get error(){return gl?.getError()??0}};
})();

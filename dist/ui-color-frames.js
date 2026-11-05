/* Contours express hierarchy; shared state never changes the silhouette. */
(()=>{'use strict';
const ns='http://www.w3.org/2000/svg';
function outline(kind,w,h){
 if(kind==='window')return [[0,20],[20,0],[w*.32,0],[w*.32+9,7],[w-34,7],[w-24,0],[w,24],[w,h*.48],[w-6,h*.48+8],[w-6,h-28],[w-24,h-10],[w*.64+12,h-10],[w*.64,h],[18,h],[0,h-18],[0,h*.56+12],[5,h*.56+5],[5,42],[0,37]];
 if(kind==='banner')return [[0,18],[18,0],[w*.24,0],[w*.24+10,7],[w-24,7],[w,31],[w,h-16],[w-16,h],[w*.72,h],[w*.72-10,h-6],[12,h-6],[0,h-18]];
 if(kind==='reward')return [[0,0],[w-28,0],[w-14,14],[w,14],[w,h-14],[w-14,h],[w*.30,h],[w*.30-9,h-7],[16,h-7],[0,h-23]];
 if(kind==='weapon')return [[0,0],[w-17,0],[w,17],[w,h-25],[w-8,h-17],[w-8,h],[0,h]];
 if(kind==='facility')return [[12,0],[w,0],[w,h-13],[w-13,h],[0,h],[0,12]];
 return [[0,0],[w,0],[w,h],[10,h],[0,h-10]];
}
const targets=[['.character','window'],['.intro','banner'],['.reward','reward'],['.gear:nth-child(1)','weapon'],['.gear:nth-child(2)','facility'],['.gear:nth-child(3)','locked']];
const frames=[];
for(const [selector,kind] of targets)for(const host of document.querySelectorAll(selector)){
 host.dataset.contour=kind;const svg=document.createElementNS(ns,'svg');svg.classList.add('contour-frame');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');const line=document.createElementNS(ns,'path'),rail=document.createElementNS(ns,'path');line.classList.add('contour-line');rail.classList.add('contour-rail');svg.append(line,rail);host.append(svg);
 const update=()=>{const w=host.offsetWidth,h=host.offsetHeight,points=outline(kind,w,h);host.style.clipPath=`polygon(${points.map(([x,y])=>`${x}px ${y}px`).join(',')})`;svg.setAttribute('viewBox',`0 0 ${w} ${h}`);line.setAttribute('d','M'+points.map(([x,y])=>[Math.max(1,Math.min(w-1,x)),Math.max(1,Math.min(h-1,y))].join(',')).join(' L')+' Z');let d='';if(kind==='window')d=`M 6,${h*.23} L 6,${h*.23+35} M ${w*.64+18},${h-11} L ${w*.64+64},${h-11} M ${w-1},33 L ${w-1},58`;else if(kind==='banner')d=`M 20,1 L ${Math.min(w*.24-6,108)},1 M ${w-2},${h-38} L ${w-2},${h-20}`;else if(kind==='reward')d=`M 1,16 L 1,${h-30} M ${w-72},1 L ${w-36},1`;else d=`M 14,1 L ${Math.min(w-24,55)},1`;rail.setAttribute('d',d);};
 new ResizeObserver(update).observe(host);update();frames.push({host,kind});
}
globalThis.UIColorFrames={frames};
})();

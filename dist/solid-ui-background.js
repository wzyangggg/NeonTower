'use strict';
// Quiet, static ambient detail; independent of the randomized card composition.
(()=>{
  const viewport=document.querySelector('#viewport'),select=document.querySelector('#background');
  const layer=document.createElement('div');layer.className='scene-backdrop';layer.setAttribute('aria-hidden','true');
  let seed=31827;
  const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<125;i++){
    const x=rand()*100,y=rand()*100;
    // Keep the title and card halo surrounded by calm space.
    if(x>25&&x<75&&y>28&&y<72)continue;
    const star=i%15===0,size=star?10+rand()*12:.7+rand()*1.7;
    const dot=document.createElement('span');dot.className=`scene-speck${star?' scene-star':''}`;
    dot.style.setProperty('--x',`${x}%`);dot.style.setProperty('--y',`${y}%`);
    dot.style.setProperty('--size',`${size}px`);dot.style.setProperty('--alpha',String(star?.09+rand()*.06:.08+rand()*.16));layer.append(dot);
  }
  for(const name of ['scene-planet','scene-horizon']){const detail=document.createElement('div');detail.className=name;layer.append(detail);}
  viewport.prepend(layer);
  const update=()=>viewport.dataset.background=select.value;
  select.addEventListener('change',update);update();
})();

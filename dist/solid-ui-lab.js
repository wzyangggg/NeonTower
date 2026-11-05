'use strict';
// Isolated SVG composition; no game preferences are saved.
document.addEventListener('DOMContentLoaded',()=>{
  Object.assign(NeonPostFX.settings,NeonPostFX.defaults,{enabled:true});NeonPostFX.refresh();
  const panel=document.querySelector('.panel'),svg=document.querySelector('.composition');
  // The halo sits outside the clipped card, so it can diffuse into the background.
  const shell=document.createElement('div');shell.className='panel-shell';
  panel.before(shell);shell.append(panel);
  document.querySelector('#glow').addEventListener('change',event=>shell.classList.toggle('no-glow',!event.target.checked));
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),motion=document.querySelector('#motion');
  motion.checked=!reduced.matches;
  const dots=document.querySelector('.dots');
  const lines=document.querySelector('.soft-lines');
  const lineAnimation=lines.querySelector('g').animate([{transform:'translate(0px,0px)'},{transform:'translate(5px,-4px)'}],{duration:9500,iterations:Infinity,direction:'alternate',easing:'ease-in-out'});
  // Solid pigment dots scroll by whole pattern periods for a seamless loop.
  const dotAnimation=dots.animate([{backgroundPosition:'0px 0px'},{backgroundPosition:'44px 22px'}],{duration:12000,iterations:Infinity,easing:'linear'});
  const ns='http://www.w3.org/2000/svg';
  const edge=document.createElementNS(ns,'svg');edge.classList.add('edge-light');edge.setAttribute('aria-hidden','true');shell.append(edge);
  // A smooth spatial light mask creates uneven illumination without dashed edges.
  const rimDefs=document.createElementNS(ns,'defs');
  const rimGradient=document.createElementNS(ns,'linearGradient');rimGradient.id='rim-light-falloff';
  rimGradient.setAttribute('x2','100%');rimGradient.setAttribute('y2','70%');
  for(const [offset,alpha] of [[0,.2],[.14,1],[.36,.12],[.5,.06],[.7,.85],[.87,.12],[1,.35]]){
    const stop=document.createElementNS(ns,'stop');stop.setAttribute('offset',String(offset));stop.setAttribute('stop-color','white');stop.setAttribute('stop-opacity',String(alpha));rimGradient.append(stop);
  }
  const rimMask=document.createElementNS(ns,'mask');rimMask.id='rim-light-mask';rimMask.setAttribute('maskContentUnits','objectBoundingBox');
  const maskFill=document.createElementNS(ns,'rect');maskFill.setAttribute('x','-.05');maskFill.setAttribute('y','-.05');maskFill.setAttribute('width','1.1');maskFill.setAttribute('height','1.1');maskFill.setAttribute('fill','url(#rim-light-falloff)');rimMask.append(maskFill);
  rimDefs.append(rimGradient,rimMask);edge.append(rimDefs);
  const rim=document.createElementNS(ns,'g');rim.classList.add('edge-rim');rim.setAttribute('mask','url(#rim-light-mask)');edge.append(rim);
  for(const [stroke,width,opacity,blur] of [['var(--panel-color,#70dfff)',2.5,.18,1.5],['#c7f4ff',.9,.36,0],['#f3ffff',.45,.22,0]]){
    const path=document.createElementNS(ns,'path');path.setAttribute('stroke',stroke);path.setAttribute('stroke-width',String(width));path.setAttribute('stroke-opacity',String(opacity));
    if(blur)path.style.filter=`blur(${blur}px)`;rim.append(path);
  }
  const flow=document.createElementNS(ns,'g');flow.classList.add('edge-flow');edge.append(flow);
  const edgeAnimations=[];
  for(let i=0;i<14;i++){
    const path=document.createElementNS(ns,'path');path.setAttribute('pathLength','100');
    path.setAttribute('stroke','#f4ffff');path.setAttribute('stroke-width',String(1.2+1.4*i/13));
    path.setAttribute('stroke-opacity',String(.04+.96*(i/13)**1.7));
    path.setAttribute('stroke-dasharray','1.6 98.4');flow.append(path);
    const offset=-i*1.25;
    edgeAnimations.push(path.animate([{strokeDashoffset:String(offset)},{strokeDashoffset:String(offset-100)}],{duration:4200,iterations:Infinity,easing:'linear'}));
  }
  const updateEdge=()=>{
    const w=panel.clientWidth,h=panel.clientHeight;
    edge.setAttribute('viewBox',`0 0 ${w} ${h}`);
    const d=`M1 1 H${w-12} L${w-1} 12 V${h-1} H12 L1 ${h-12} Z`;
    edge.querySelectorAll('path').forEach(path=>path.setAttribute('d',d));
  };
  new ResizeObserver(updateEdge).observe(panel);updateEdge();
  document.querySelector('#edge').addEventListener('change',event=>{flow.toggleAttribute('hidden',!event.target.checked);syncMotion();});
  document.querySelector('#rim').addEventListener('change',event=>rim.toggleAttribute('hidden',!event.target.checked));
  let animations=[];
  const random=(min,max)=>min+Math.random()*(max-min);
  const area=polygon=>Math.abs(polygon.reduce((sum,p,i)=>{
    const next=polygon[(i+1)%polygon.length];return sum+p[0]*next[1]-next[0]*p[1];
  },0))/2;
  // Clip a convex face against an arbitrary line; preserve shared cut edges.
  function clip(polygon,nx,ny,offset,side){
    const result=[];
    for(let i=0;i<polygon.length;i++){
      const a=polygon[i],b=polygon[(i+1)%polygon.length];
      const da=(a[0]*nx+a[1]*ny-offset)*side,db=(b[0]*nx+b[1]*ny-offset)*side;
      if(da>=0)result.push(a);
      if((da>=0)!==(db>=0)){
        const t=da/(da-db);result.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);
      }
    }
    return result;
  }
  function partition(){
    const root={polygon:[[-50,-45],[490,-45],[490,293],[-50,293]]};
    let leaves=[root];const branches=[];
    const count=Math.floor(random(7,14));
    for(let step=1;step<count;step++){
      // Bias toward larger faces without always choosing the largest one.
      const total=leaves.reduce((sum,node)=>sum+area(node.polygon),0);
      let pick=random(0,total),node=leaves[0];
      for(const candidate of leaves){pick-=area(candidate.polygon);if(pick<=0){node=candidate;break;}}
      for(let attempt=0;attempt<16;attempt++){
        const angle=random(0,Math.PI),nx=Math.cos(angle),ny=Math.sin(angle);
        const projections=node.polygon.map(p=>p[0]*nx+p[1]*ny);
        const min=Math.min(...projections),max=Math.max(...projections);
        const offset=min+(max-min)*random(.25,.75);
        const first=clip(node.polygon,nx,ny,offset,1),second=clip(node.polygon,nx,ny,offset,-1);
        if(area(first)<1700||area(second)<1700)continue;
        node.children=[{polygon:first},{polygon:second}];branches.push(node);
        leaves=leaves.filter(leaf=>leaf!==node).concat(node.children);break;
      }
    }
    // Merge random sibling regions, making some broad faces among the small cuts.
    for(const branch of branches.reverse()){
      if(branch.children.every(child=>leaves.includes(child))&&Math.random()<.24){
        leaves=leaves.filter(leaf=>!branch.children.includes(leaf)).concat(branch);
      }
    }
    return leaves.map(node=>node.polygon);
  }
  function syncMotion(){
    const running=motion.checked&&!document.hidden;
    animations.forEach(a=>running?a.play():a.pause());
    if(running&&!dots.hidden)dotAnimation.play();else dotAnimation.pause();
    if(running&&!lines.hasAttribute('hidden'))lineAnimation.play();else lineAnimation.pause();
    edgeAnimations.forEach(a=>running&&!flow.hasAttribute('hidden')?a.play():a.pause());
  }
  function compose(){
    animations.forEach(a=>a.cancel());animations=[];svg.replaceChildren();
    const ns='http://www.w3.org/2000/svg';
    function shape(tag,attrs,index){
      const group=document.createElementNS(ns,'g'),element=document.createElementNS(ns,tag);
      for(const [key,value] of Object.entries(attrs))element.setAttribute(key,String(value));
      group.append(element);svg.append(group);
      const dx=random(-22,22),dy=random(-18,18),angle=random(-6,6);
      const animation=group.animate([
        {transform:`translate(${-dx}px,${-dy}px) rotate(${-angle}deg)`},
        {transform:`translate(${dx}px,${dy}px) rotate(${angle}deg)`}
      ],{duration:random(5500,12500),iterations:Infinity,direction:'alternate',easing:'ease-in-out',delay:random(-12000,0)});
      animations.push(animation);
    }
    const colors=['var(--shape-a)','var(--shape-b)','var(--shape-c)','var(--panel-color,#70dfff)','var(--panel-end,#b995ff)'];
    const faces=partition();
    faces.forEach((polygon,index)=>{
      // Randomly leave some regions as the base gradient, rather than a uniform mosaic.
      if(Math.random()<.18&&index!==0)return;
      const color=colors[Math.floor(random(0,colors.length))];
      shape('polygon',{points:polygon.map(p=>p.join(',')).join(' '),fill:color,opacity:random(.24,.52)},index);
    });
    syncMotion();
  }
  document.querySelector('#animate').addEventListener('click',compose);
  document.querySelector('#lines').addEventListener('change',event=>{lines.toggleAttribute('hidden',!event.target.checked);syncMotion();});
  document.querySelector('#dots').addEventListener('change',event=>{dots.hidden=!event.target.checked;syncMotion();});
  document.querySelector('#dot-color').addEventListener('input',event=>panel.style.setProperty('--dot-color',event.target.value));
  motion.addEventListener('change',syncMotion);
  reduced.addEventListener('change',()=>{motion.checked=!reduced.matches;syncMotion();});
  document.addEventListener('visibilitychange',syncMotion);
  document.querySelector('#color').addEventListener('input',event=>document.documentElement.style.setProperty('--panel-color',event.target.value));
  document.querySelector('#end').addEventListener('input',event=>document.documentElement.style.setProperty('--panel-end',event.target.value));
  document.querySelector('#palette').addEventListener('change',event=>{
    const lime=event.target.value==='lime',colors=lime?['#fff67a','#9cff70']:['#70dfff','#b995ff'];
    panel.classList.toggle('lime',lime);
    const dotColor=lime?'#759b52':'#8068bf';
    panel.style.setProperty('--dot-color',dotColor);document.querySelector('#dot-color').value=dotColor;
    document.querySelector('#color').value=colors[0];document.querySelector('#end').value=colors[1];
    document.documentElement.style.setProperty('--panel-color',colors[0]);document.documentElement.style.setProperty('--panel-end',colors[1]);
  });
  document.querySelector('#ratio').addEventListener('change',event=>document.body.classList.toggle('square',event.target.value==='square'));
  document.querySelector('#finish').addEventListener('change',event=>document.body.classList.toggle('raw',!event.target.checked));
  document.querySelector('#fx').addEventListener('change',event=>{NeonPostFX.settings.enabled=event.target.checked;NeonPostFX.refresh();});
  compose();
});

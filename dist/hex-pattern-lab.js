'use strict';
(()=>{
 const $=id=>document.getElementById(id),W=54,R=W/Math.sqrt(3),step=R/4,dx=step*Math.sqrt(3)/2;
 const dirs=[[1,0],[0,1],[-1,1],[-1,0],[0,-1],[1,-1]],key=(q,r)=>q+','+r;
 const cellKey=c=>Math.round(c.x*1000)+","+Math.round(c.y*1000);
 const towers=new Map();
 const edits=new Map(),phaseCache=new Map();let phaseSeed="",editSummary="点击实心地块删除，点击虚线地块添加",previousSignatures=new Map();
 const cells=[];for(let r=0;r<11;r++)for(let c=0;c<13;c++)cells.push({x:(c+(r%2)*.5)*W,y:r*W*Math.sqrt(3)/2});
 function random(seed){let h=2166136261;for(const c of seed)h=Math.imul(h^c.charCodeAt(0),16777619);return()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
 const inside=(x,y,c)=>{const a=Math.abs(x-c.x),b=Math.abs(y-c.y);return a<=W/2+.001&&b<=R+.001&&a+Math.sqrt(3)*b<=W+.001;};
 const nodes=new Map();for(let q=-4;q<112;q++)for(let r=-65;r<80;r++){const x=q*dx,y=(r+q/2)*step;if(cells.some(c=>inside(x,y,c)))nodes.set(key(q,r),{q,r,x,y});}
 const polygon=(c,inset)=>Array.from({length:6},(_,i)=>{const a=(30+60*i)*Math.PI/180;return `${(c.x+(R-inset)*Math.cos(a)).toFixed(3)},${(c.y+(R-inset)*Math.sin(a)).toFixed(3)}`;}).join(' ');
 function build(active){
  const graph=new Map(active.map((c,i)=>[i,[]])),networkNodes=new Map(),edges=[],terminals=[],wanted=active.map(()=>new Set());
  const add=(a,b)=>edges.push([a,b]);
  active.forEach((c,i)=>{for(let j=0;j<6;j++){const a=(30+j*60)*Math.PI/180;networkNodes.set(`${i}:${j}`,{x:c.x+R*.5*Math.cos(a),y:c.y+R*.5*Math.sin(a)});}});
  for(let i=0;i<active.length;i++)for(let j=i+1;j<active.length;j++)if(Math.abs(Math.hypot(active[i].x-active[j].x,active[i].y-active[j].y)-W)<.01){graph.get(i).push(j);graph.get(j).push(i);}
  // Shared ports depend only on occupancy of the two adjacent coordinates.
  for(let i=0;i<active.length;i++)for(const j of graph.get(i))if(i<j){
   const a=active[i],b=active[j],dir=(Math.round(Math.atan2(b.y-a.y,b.x-a.x)*3/Math.PI)+6)%6,other=(dir+3)%6,port='port:'+cellKey(a)+'/'+cellKey(b);
   networkNodes.set(port,{x:(a.x+b.x)/2,y:(a.y+b.y)/2});wanted[i].add(dir);wanted[j].add(other);add(`${i}:${dir}`,port);add(port,`${j}:${other}`);
  }
  active.forEach((c,i)=>{
   const rng=random($('seed').value+'|'+cellKey(c));
   // Always keep a local motif, including an isolated tile.
   const localStart=Math.floor(rng()*6);wanted[i].add(localStart);wanted[i].add((localStart+2)%6);
   if(rng()<.45){const j=Math.floor(rng()*6);wanted[i].add(j);terminals.push(`${i}:${j}`);}
   const outlined=rng()<Number($('outline').value)/100;
   if(outlined){const j=Math.floor(rng()*6);for(const n of [j,(j+2)%6,(j+4)%6])wanted[i].add(n);if(rng()<.45)wanted[i].add((j+1)%6);}
   const ring=[...wanted[i]].sort((a,b)=>a-b);if(!ring.length)return;
   // Remove the longest unused arc: all ports remain connected, with no full repeated hex motif.
   let gap=-1,cut=0;for(let j=0;j<ring.length;j++){const d=(ring[(j+1)%ring.length]-ring[j]+6)%6;if(d>gap){gap=d;cut=j;}}
   if(ring.length>1){let j=ring[(cut+1)%ring.length];const end=ring[cut];while(j!==end){add(`${i}:${j}`,`${i}:${(j+1)%6}`);j=(j+1)%6;}}
   if(outlined){
    // A single attached outer arc adds a second lane without closing a repeated hex loop.
    const start=Math.floor(rng()*6);wanted[i].add(start);
    // Attach to an existing main-ring vertex so the accent is never isolated.
    const anchor=ring.reduce((best,j)=>Math.min((j-start+6)%6,(start-j+6)%6)<Math.min((best-start+6)%6,(start-best+6)%6)?j:best,ring[0]);
    const accentStart=anchor,count=2+Math.floor(rng()*3),direction=rng()<.5?1:-1;
    for(let n=0;n<=count;n++){const j=(accentStart+direction*n+12)%6,a=(30+j*60)*Math.PI/180,k=`outline:${i}:${n}`;networkNodes.set(k,{x:c.x+R*.77*Math.cos(a),y:c.y+R*.77*Math.sin(a)});add(n?`outline:${i}:${n-1}`:`${i}:${accentStart}`,k);}
   }
  });
  const tree=new Set(edges.flat()),degrees=new Map();for(const [a,b] of edges){degrees.set(a,(degrees.get(a)||0)+1);degrees.set(b,(degrees.get(b)||0)+1);}for(const [k,d] of degrees)if(d===1&&!terminals.includes(k))terminals.push(k);terminals.forEach(k=>tree.add(k));return {terminals,tree,edges,nodes:networkNodes};
 }
 function towerGeometry(source,occupied){
  const rays=[],pins=[];
  for(let side=0;side<6;side++){
   const a=side*Math.PI/3,nx=Math.cos(a),ny=Math.sin(a),point=(r,t)=>[source.x+nx*r-ny*t,source.y+ny*r+nx*t],neighbor=occupied.has(cellKey({x:source.x+nx*W,y:source.y+ny*W}));
   for(let lane=-1;lane<=1;lane++){
    const p=[point(20,lane*3.3),point(23,lane*3.3),point(neighbor?32:24,lane*6.2),point(neighbor?W-8-Math.abs(lane)*3:24,lane*6.2)],d=p.map((v,i)=>(i?'L':'M')+v.join(',')).join('');
    pins.push(`M${point(19.7,lane*3.3).join(',')}L${point(23.2,lane*3.3).join(',')}`);rays.push({d,end:p[p.length-1],neighbor,side});
   }
  }
  return {rays,pins:pins.join('')};
 }
 let last;
 function render(){
  const seams=$('seams').checked,tilt=$('tilt').checked;
  const palettes={mint:['#72baa9','#182b34'],gold:['#bfab73','#252932'],grey:['#a3b0be','#202a35']},[ink,base]=palettes[$('palette').value];
  const initial=$('scope').value==='all'?cells:cells.filter(c=>{const r=Math.round(c.y/(W*Math.sqrt(3)/2)),col=Math.round(c.x/W-(r%2)*.5),dr=r-5,dq=col-(r-(r&1))/2-4;return Math.max(Math.abs(dr),Math.abs(dq),Math.abs(dr+dq))<=2;});
  const occupied=new Map(initial.map(c=>[cellKey(c),c]));for(const [k,c]of edits){if(c)occupied.set(k,c);else occupied.delete(k);}
  const visible=[...occupied.values()].sort((a,b)=>a.y-b.y||a.x-b.x);
  const candidates=new Map();for(const c of visible)for(let j=0;j<6;j++){const a=j*Math.PI/3,n={x:Math.round((c.x+W*Math.cos(a))*1000000)/1000000,y:Math.round((c.y+W*Math.sin(a))*1000000)/1000000},k=cellKey(n);if(!occupied.has(k))candidates.set(k,n);}
  for(const c of initial)if(!occupied.has(cellKey(c)))candidates.set(cellKey(c),c);
  const decorated=visible.filter(c=>random($('seed').value+'|coverage|'+cellKey(c))()<Number($('density').value)/100);
  last=build(decorated);const {terminals,tree,edges,nodes}=last;
  const path=edges.map(([a,b])=>{const p=nodes.get(a),n=nodes.get(b);return `M${p.x},${p.y}L${n.x},${n.y}`;}).join('');
  const pads=terminals.map(k=>{const n=nodes.get(k);return `<circle cx="${n.x}" cy="${n.y}" r="1.5" fill="${base}"/>`;}).join('');
  // Orient every edge away from one source and carry world-distance phase across tile seams.
  const adjacency=new Map([...tree].map(k=>[k,[]]));for(const [a,b]of edges){adjacency.get(a).push(b);adjacency.get(b).push(a);}
  const nodeKey=k=>{const n=nodes.get(k);return cellKey(n);},config=$('seed').value;
  if(phaseSeed!==config){phaseCache.clear();phaseSeed=config;}
  const distance=new Map(),queue=[],flowPaths=visible.map(()=>[]);let components=0;
  for(const k of tree)if(phaseCache.has(nodeKey(k))){distance.set(k,phaseCache.get(nodeKey(k)));queue.push(k);}
  const expand=()=>{for(let i=0;i<queue.length;i++){const a=queue[i],p=nodes.get(a);for(const b of adjacency.get(a)){if(distance.has(b))continue;const n=nodes.get(b);distance.set(b,distance.get(a)+Math.hypot(n.x-p.x,n.y-p.y));queue.push(b);}}};expand();
  for(const k of tree)if(!distance.has(k)){distance.set(k,random(config+'|'+nodeKey(k))()*128);queue.length=0;queue.push(k);expand();}
  for(const [k,d]of distance)phaseCache.set(nodeKey(k),d);
  const seen=new Set();for(const start of tree)if(!seen.has(start)){components++;const q=[start];seen.add(start);for(let j=0;j<q.length;j++)for(const n of adjacency.get(q[j]))if(!seen.has(n)){seen.add(n);q.push(n);}}
  for(const [u,v]of edges){const [a,b]=distance.get(u)<=distance.get(v)?[u,v]:[v,u],p=nodes.get(a),n=nodes.get(b),d=`M${p.x},${p.y}L${n.x},${n.y}`,owner=visible.findIndex(c=>inside((p.x+n.x)/2,(p.y+n.y)/2,c));
   for(const [dash,opacity,width]of [[14,.14,3],[9,.4,1.8],[3,1,1]])flowPaths[owner].push(`<path class="flow-stroke" d="${d}" stroke-dasharray="${dash} ${128-dash}" stroke-width="${Number($('width').value)*width}" opacity="${opacity}" style="--phase:${distance.get(a)}px;animation-duration:${6/Number($('speed').value)}s;animation-delay:-${performance.now()/1000}s"/>`);
  }
  const flowDefs=`<defs><style>@keyframes circuit-flow{from{stroke-dashoffset:var(--phase)}to{stroke-dashoffset:calc(var(--phase) - 128px)}}.flow-stroke{animation:circuit-flow 6s linear infinite}</style>${flowPaths.map((paths,i)=>`<g id="flow-network-${i}" fill="none" stroke="${{mint:'#d3fff4',gold:'#fff2ba',grey:'#f0f7ff'}[$('palette').value]}" stroke-linecap="round">${paths.join('')}</g>`).join('')}</defs>`;
  const project=(x,y,z=0)=>[x,tilt?y*.65+z:y];
  const points=(c,z=0)=>Array.from({length:6},(_,i)=>{const a=(30+60*i)*Math.PI/180,rad=R-(seams?1.25:0);return project(c.x+rad*Math.cos(a),c.y+rad*Math.sin(a),z);});
  const towerData=[...towers.values()].filter(t=>occupied.has(cellKey(t))).map(t=>({source:t,...towerGeometry(t,occupied)}));
  const signatures=new Map();
  const faces=visible.map((c,i)=>{
   const localEdges=edges.filter(([a,b])=>{const p=nodes.get(a),n=nodes.get(b);return inside((p.x+n.x)/2,(p.y+n.y)/2,c);});
   const localPath=localEdges.map(([a,b])=>{const p=nodes.get(a),n=nodes.get(b);return `M${p.x},${p.y}L${n.x},${n.y}`;}).join('');
   const localPads=terminals.filter(k=>inside(nodes.get(k).x,nodes.get(k).y,c)).map(k=>{const n=nodes.get(k);return `<circle cx="${n.x}" cy="${n.y}" r="1.5" fill="${base}"/>`;}).join('');
   const nearby=towerData.filter(t=>Math.hypot(t.source.x-c.x,t.source.y-c.y)<=W+.01),isTower=towers.has(cellKey(c));
   const towerLines=nearby.map(t=>t.rays.map(ray=>`<path d="${ray.d}"/><circle cx="${ray.end[0]}" cy="${ray.end[1]}" r="1.1" fill="${base}"/>`).join('')).join('');
   const towerGlow=$('flow').checked?nearby.map(t=>t.rays.map(ray=>`<path class="flow-stroke" d="${ray.d}" stroke="#fff4c8" stroke-width="1.1" stroke-dasharray="8 120" style="--phase:0px;animation-duration:${6/Number($('speed').value)}s;animation-delay:-${performance.now()/1000}s"/>`).join('')).join(''):'';
   const chip=isTower?`<g class="chip"><polygon points="${polygon(c,R-23)}" fill="#101923" stroke="#f1cf83" stroke-width="1.2"/><polygon points="${polygon(c,R-19.7)}" fill="#192633" stroke="#9d8f64" stroke-width=".5"/><path d="${towerData.find(t=>cellKey(t.source)===cellKey(c)).pins}" stroke="#f1cf83" stroke-width="1.5"/><text x="${c.x}" y="${c.y+1.7}" text-anchor="middle" font-size="4.4" fill="#ffdf9a" stroke="none">CORE</text></g>`:'';
   const towerMarkup=`<g class="tower-traces" fill="none" stroke="#d9bf85" stroke-width="${$('width').value}">${towerLines}${towerGlow}${chip}</g>`;
   signatures.set(cellKey(c),localPath+localPads+towerLines+chip);

   const top=points(c),middle=points(c,12),bottom=points(c,26),poly=top.map(p=>p.join(',')).join(' ');
   let sides='';if(tilt)for(const j of [0,1,2]){const k=(j+1)%6;sides+=`<polygon points="${[top[j],top[k],middle[k],middle[j]].map(p=>p.join(',')).join(' ')}" fill="${j===1?'#23394a':'#192b3c'}" stroke="#31495b" stroke-width=".4"/><polygon points="${[middle[j],middle[k],bottom[k],bottom[j]].map(p=>p.join(',')).join(' ')}" fill="#070c13" stroke="#172332" stroke-width=".4"/>`;}
   return `<g class="tile" data-cell="${cellKey(c)}">${sides}<polygon points="${poly}" fill="${base}" stroke="#4887a5" stroke-width=".65"/><clipPath id="tile-${i}"><polygon points="${polygon(c,seams?1.25:0)}"/></clipPath>${$('pattern').checked?`<g transform="scale(1 ${tilt?.65:1})"><g clip-path="url(#tile-${i})" stroke="${ink}" stroke-width="${$('width').value}" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="${localPath}"/>${$('flow').checked?`<use href="#flow-network-${i}"/>`:''}${localPads}${towerMarkup}</g></g>`:''}</g>`;
  }).join('');
  const frame=[...initial,...visible,...candidates.values()];
  const xmin=Math.min(...frame.map(c=>c.x))-R-18,xmax=Math.max(...frame.map(c=>c.x))+R+18,ymin=Math.min(...frame.map(c=>project(c.x,c.y)[1]))-(tilt?R*.65:R)-24,ymax=Math.max(...frame.map(c=>project(c.x,c.y)[1]))+(tilt?R*.65+26:R)+24;
  const ghosts=[...candidates.values()].map(c=>`<polygon class="ghost" data-cell="${cellKey(c)}" points="${points(c).map(p=>p.join(',')).join(' ')}" fill="#11222c" fill-opacity=".45" stroke="#526b77" stroke-width=".6" stroke-dasharray="2 2"><title>点击添加地块</title></polygon>`).join('');
  $('view').innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${xmin} ${ymin} ${xmax-xmin} ${ymax-ymin}" role="img" aria-label="立体六边形地块表面的连续线路装饰">${flowDefs}${ghosts}${faces}</svg>`;
  $('outlineValue').value=$('outline').value+'%';
  $('speedValue').value=$('speed').value+'×';
  $('densityValue').value=$('density').value+'%';$('widthValue').value=$('width').value;
  $('stats').textContent=`${visible.length} 块地表 · ${towerData.length} 个芯片塔 · ${decorated.length} 块有花纹 / ${visible.length-decorated.length} 块留白 · ${edges.length} 段走线 · ${tree.size} 个网格接点 · ${components} 个连通网络 · 固定种子可复现 · ${editSummary}`;
  // Expose geometry for independent connectivity/direction checks and future renderer integration.
  window.patternLab={cells,...last,visible,decorated,signatures,candidates,components,towers,towerData};
  previousSignatures=signatures;
 }
 for(const id of ['seed','density','width','palette','seams','tilt','scope','pattern','flow','speed','outline'])$(id).addEventListener('input',render);
 function toggleCell(k){
  const before=new Map(previousSignatures),current=window.patternLab.visible.find(c=>cellKey(c)===k),candidate=window.patternLab.candidates.get(k);
  if(!current&&!candidate)return;
  if(current)towers.delete(k);
  edits.set(k,current?null:candidate);editSummary=current?'已删除地块':'已添加地块';render();
  let changed=0,unchanged=0;for(const [id,sig]of before)if(previousSignatures.has(id)){if(previousSignatures.get(id)!==sig)changed++;else unchanged++;}
  editSummary=`${current?'删除':'添加'}后：${changed} 块邻居调整，${unchanged} 块保持原样`;render();
 }
 $('view').addEventListener('click',e=>{const target=e.target.closest('[data-cell]');if(!target)return;const k=target.dataset.cell,c=window.patternLab.visible.find(c=>cellKey(c)===k);if($('editMode').value==='tower'){if(!c)return;if(towers.has(k))towers.delete(k);else towers.set(k,c);editSummary='芯片塔仅影响本格及相邻地块';render();}else toggleCell(k);});
 $('resetMap').onclick=()=>{edits.clear();towers.clear();editSummary='地图已重置';render();};
 $('scope').addEventListener('change',()=>{edits.clear();towers.clear();editSummary='地图已切换';render();});
 $('generate').onclick=()=>{$('seed').value='circuit-'+crypto.getRandomValues(new Uint32Array(1))[0].toString(36);render();};
 $('export').onclick=()=>{const url=URL.createObjectURL(new Blob([$('view').innerHTML],{type:'image/svg+xml'})),a=document.createElement('a');a.href=url;a.download='hex-surface-circuit.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 function demoTower(){const active=window.patternLab?.visible||cells,center=active.reduce((best,c)=>Math.hypot(c.x-351,c.y-234)<Math.hypot(best.x-351,best.y-234)?c:best,active[0]);if(!center)return;towers.set(cellKey(center),center);$('editMode').value='tower';editSummary='芯片塔演示：点击其他地块放置，点击已有芯片移除';render();}
 $('demoTower').onclick=demoTower;
 render();
 if(new URLSearchParams(location.search).get('tower')==='1')demoTower();
})();


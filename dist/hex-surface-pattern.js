'use strict';
// Coordinate-stable ordinary surface circuits. No tower-specific decoration.
(function(root){
 const W=54,R=W/Math.sqrt(3),cellKey=c=>Math.round(c.x*1000)+','+Math.round(c.y*1000);
 function random(seed){let h=2166136261;for(const c of seed)h=Math.imul(h^c.charCodeAt(0),16777619);return()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
 function build(active,seed,outline){
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
   const rng=random(seed+'|'+cellKey(c));
   // Always keep a local motif, including an isolated tile.
   const localStart=Math.floor(rng()*6);wanted[i].add(localStart);wanted[i].add((localStart+2)%6);
   if(rng()<.45){const j=Math.floor(rng()*6);wanted[i].add(j);terminals.push(`${i}:${j}`);}
   const outlined=rng()<Number(outline)/100;
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

 function generate(cells,seed='floor-circuit',coverage=45,outline=65){
  const centers=cells.map(t=>({...t,wx:root.HexMap.x(t.x,t.y),wy:root.HexMap.y(t.y)})).sort((a,b)=>a.y-b.y||a.x-b.x);
  const active=centers.filter(c=>random(seed+'|coverage|'+c.x+','+c.y)()<coverage/100).map(c=>({x:c.wx,y:c.wy,tile:c}));
  const network=build(active,seed,outline),result=new Map(centers.map(c=>[c.x+','+c.y,{segments:[],pads:[],cx:c.wx,cy:c.wy}]));
  const owner=p=>active.find(c=>{const dx=Math.abs(p.x-c.x),dy=Math.abs(p.y-c.y);return dx<=27+.001&&dy<=R+.001&&dx+Math.sqrt(3)*dy<=54+.001;});
  for(const [a,b]of network.edges){const p=network.nodes.get(a),q=network.nodes.get(b),c=owner({x:(p.x+q.x)/2,y:(p.y+q.y)/2});result.get(c.tile.x+','+c.tile.y).segments.push([[p.x-c.x,p.y-c.y],[q.x-c.x,q.y-c.y]]);}
  for(const k of network.terminals){const p=network.nodes.get(k),c=owner(p);result.get(c.tile.x+','+c.tile.y).pads.push([p.x-c.x,p.y-c.y]);}
  return result;
 }
 function dispose(r,key){const m=r.residentMeshes.get(key);if(!m)return;for(const b of [m.buffer,m.poseBuffer])if(b)r.gl.deleteBuffer(b);r.residentMeshes.delete(key);}
 // Clip every strip against the real tile top. No geometry spans the black seams.
 function mesh(r,pattern,width,color,inset){
  const radius=R-inset,planes=Array.from({length:6},(_,i)=>[Math.cos(i*Math.PI/3),Math.sin(i*Math.PI/3)]),limit=radius*Math.sqrt(3)/2;
  const polygon=vertices=>{let poly=vertices;for(const [nx,ny]of planes){const next=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=limit-a[0]*nx-a[1]*ny,db=limit-b[0]*nx-b[1]*ny;if(da>=0)next.push(a);if((da>=0)!==(db>=0)){const u=da/(da-db);next.push([a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u]);}}poly=next;if(!poly.length)return;}
   const tint=r.color(color);for(let i=1;i<poly.length-1;i++)for(const p of [poly[0],poly[i],poly[i+1]])r.vertex([p[0],2.13,p[1]*1.06],[(pattern.cx+p[0])*.6+(pattern.cy+p[1])*.8,2,0],tint);
  };
  const strip=(a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);if(length<.001)return;const x=-dy/length*width/2,y=dx/length*width/2;polygon([[a[0]+x,a[1]+y],[b[0]+x,b[1]+y],[b[0]-x,b[1]-y],[a[0]-x,a[1]-y]]);};
  for(const [a,b]of pattern.segments)strip(a,b);
  for(const [x,y]of pattern.pads)for(let i=0;i<16;i++){const a=i*Math.PI/8,b=(i+1)*Math.PI/8;polygon([[x+Math.cos(a)*1.5,y+Math.sin(a)*1.5],[x+Math.cos(b)*1.5,y+Math.sin(b)*1.5],[x+Math.cos(b)*(1.5-width),y+Math.sin(b)*(1.5-width)],[x+Math.cos(a)*(1.5-width),y+Math.sin(a)*(1.5-width)]]);}
 }
 function prepare(r,cells){
  const s=root.NeonPostFX?.settings||{},seed=String(root.HexMap.campaignMap?.seed||'floor-circuit'),coverage=s.hexPatternCoverage??45,outline=s.hexPatternOutline??65;
  const stamp=seed+'|'+coverage+'|'+outline+'|'+cells.map(t=>t.x+','+t.y).sort().join(';');
  if(r.hexPatternStamp!==stamp){r.hexPatternData=generate(cells,seed,coverage,outline);r.hexPatternStamp=stamp;}
  r.hexPatternUsed=new Set();return r.hexPatternData;
 }
 function draw(r,t,pattern,lift,inset,clock){
  const s=root.NeonPostFX?.settings||{};if(s.hexPattern===false||!pattern?.segments.length)return;
  const id=t.x+','+t.y,key='hex-pattern:'+id,stamp=JSON.stringify([pattern,s.hexPatternWidth??.6,s.hexPatternColor||'#72baa9',inset]);
  r.hexPatternMeshes??=new Map();if(r.hexPatternMeshes.get(id)!==stamp){dispose(r,key);r.hexPatternMeshes.set(id,stamp);}
  r.hexPatternUsed.add(id);
  r.residentMaterial(key,()=>mesh(r,pattern,s.hexPatternWidth??.6,s.hexPatternColor||'#72baa9',inset),[1,0,0,pattern.cx,0,1,0,lift,0,0,1,pattern.cy*1.06],1,5,s.hexPatternFlow===false?-1:clock*(s.hexPatternSpeed??1));
 }
 function finish(r){for(const id of r.hexPatternMeshes?.keys()||[])if(!r.hexPatternUsed.has(id)){dispose(r,'hex-pattern:'+id);r.hexPatternMeshes.delete(id);}}
 root.HexSurfacePattern={generate,prepare,draw,finish,mesh};
})(typeof globalThis!=='undefined'?globalThis:this);

'use strict';
(function(root){
 const H=typeof module!=='undefined'&&module.exports?require('./hex-map.js'):root.HexMap;
 const cells=[];for(let y=-9;y<=9;y++)for(let x=-4;x<=4;x++)cells.push({x,y});
 const key=c=>c.x+','+c.y,byKey=new Map(cells.map(c=>[key(c),c]));
 const adj=c=>H.neighbors(c.x,c.y).map(([dx,dy])=>byKey.get((c.x+dx)+','+(c.y+dy))).filter(Boolean);
 const axial=c=>[c.x-(c.y-(c.y&1))/2,c.y];
 const distance=(a,b)=>{const [q,r]=axial(a),[s,t]=axial(b);return Math.max(Math.abs(q-s),Math.abs(r-t),Math.abs(q+r-s-t));};
 const center={x:0,y:0},core=new Set([center,...adj(center),{x:0,y:1}].map(key));
 function random(seed){let h=2166136261;for(const c of String(seed))h=Math.imul(h^c.charCodeAt(0),16777619);return ()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
 function components(set){const unseen=new Set(set),groups=[];while(unseen.size){const queue=[byKey.get(unseen.values().next().value)];unseen.delete(key(queue[0]));for(let i=0;i<queue.length;i++)for(const c of adj(queue[i]))if(unseen.delete(key(c)))queue.push(c);groups.push(queue.map(key));}return groups.sort((a,b)=>b.length-a.length);}
 function grow(set,n,rng,compact){while(set.size<n){const frontier=cells.filter(c=>!set.has(key(c))&&adj(c).some(a=>set.has(key(a))));if(!frontier.length)break;const ranked=frontier.map(c=>({c,score:rng()+compact*adj(c).filter(a=>set.has(key(a))).length*.45})).sort((a,b)=>b.score-a.score);set.add(key(ranked[0].c));}return set;}
 // A convex half-plane field provides the island body. Smooth directional cuts
 // lower its coast at bay mouths; high-frequency harmonics add smaller notches.
 function island(n,v,rng,options={}){
  const mode=['convex','eroded','mixed'].includes(options.islandMode)?options.islandMode:'eroded',eroded=mode==='mixed'?rng()>=.25:mode!=='convex';
  const sides=Math.max(4,Math.min(9,Math.round(Number(options.sides)||6))),bayCount=Math.max(1,Math.min(4,Math.round(Number(options.bays)||2))),roughness=Math.max(0,Math.min(1,Number(options.roughness??35)/100));
  const rotation=rng()*Math.PI*2,stretch=.85+rng()*.3;
  const planes=Array.from({length:sides},(_,i)=>{const a=rotation+i*Math.PI*2/sides;return {x:Math.cos(a),y:Math.sin(a),support:.85+rng()*.3};});
  const start=rng()*Math.PI*2,bays=Array.from({length:bayCount},(_,i)=>({angle:start+i*Math.PI*2/bayCount+(rng()-.5)*.6,width:.35+rng()*.30,depth:.8+rng()*.2}));
  const phases=[rng()*Math.PI*2,rng()*Math.PI*2],score=new Map();
  for(const c of cells){const px=(H.x(c.x,c.y)-H.x(0,0))/H.TILE/stretch,py=H.y(c.y)/H.TILE*stretch,a=Math.atan2(py,px);let gauge=Math.max(...planes.map(p=>(px*p.x+py*p.y)/p.support));
   if(eroded){let cut=0;for(const bay of bays){const d=Math.atan2(Math.sin(a-bay.angle),Math.cos(a-bay.angle));cut+=bay.depth*Math.exp(-.5*(d/bay.width)**2);}const detail=roughness*(.5+.32*Math.sin(a*7+phases[0])+.18*Math.sin(a*11+phases[1]));gauge/=Math.max(.08,1-v*(.94*cut+.25*detail));}
   score.set(key(c),gauge);
  }
  // Grow by the field rather than filling bays with generic compact growth.
  const set=new Set(core);while(set.size<n){const frontier=cells.filter(c=>!set.has(key(c))&&adj(c).some(a=>set.has(key(a))));frontier.sort((a,b)=>score.get(key(a))-score.get(key(b)));set.add(key(frontier[0]));}
  set.islandStyle=eroded&&v>0?'侵蚀海岸':'凸多边形';return set;
 }
 // Count substantial bodies rather than treating a tiny tail as a second island.
 function islandBodies(set,n){const minimum=Math.max(10,Math.ceil(n*.2));return components(set).filter(group=>{if(group.length<minimum)return false;const occupied=new Set(group);return group.filter(k=>adj(byKey.get(k)).filter(c=>occupied.has(key(c))).length>=4).length>=2;});}
 function ensureTwoBodies(original,n,portrait=false){
  if(islandBodies(original,n).length>=2)return original;
  const minimum=Math.max(10,Math.ceil(n*.2)),plans=[];
  // Make one broad inlet across the mainland. Other regions can still merge freely.
  for(let direction=0;direction<(portrait?1:6);direction++)for(const offset of (portrait?[-2,2]:[-3,-2.5,2.5,3])){
   const angle=portrait?Math.PI/2:direction*Math.PI/3,nx=Math.cos(angle),ny=Math.sin(angle),side=c=>{const x=(H.x(c.x,c.y)-H.x(0,0))/H.TILE,y=H.y(c.y)/H.TILE,t=-x*ny+y*nx,d=x*nx+y*ny-offset-.2*Math.sin(t*.8);return d< -(portrait?.55:1.05)?0:d>(portrait?.55:1.05)?1:-1;};
   if([...core].some(k=>side(byKey.get(k))<0)||new Set([...core].map(k=>side(byKey.get(k)))).size!==1)continue;
   const allowed=[new Set(),new Set()];for(const c of cells){if(portrait&&Math.abs(c.x)>2)continue;const i=side(c);if(i>=0)allowed[i].add(key(c));}
   if(allowed.some(a=>a.size<minimum+(portrait?0:4))||allowed[0].size+allowed[1].size<n)continue;
   const existing=allowed.map(a=>new Set([...original].filter(k=>a.has(k)))),loss=original.size-existing[0].size-existing[1].size;
   const target0=Math.max(minimum,Math.min(n-minimum,Math.round(n*existing[0].size/Math.max(1,existing[0].size+existing[1].size))));
   if(target0>allowed[0].size||n-target0>allowed[1].size)continue;
   const result=new Set();let valid=true;
   for(let i=0;i<2;i++){
    const group=components(existing[i])[0]||[],target=i===0?target0:n-target0,coreHere=[...core].filter(k=>allowed[i].has(k));
    // Rebuild each shore by compact connected growth, prioritizing its former coastline.
    const start=coreHere.length?coreHere:[group[0]||[...allowed[i]][0]],land=new Set(start),sources=group.length?group:start,base=new Map([...allowed[i]].map(k=>[k,Math.min(...sources.map(source=>distance(byKey.get(k),byKey.get(source))))+(existing[i].has(k)?0:.5)]));
    while(land.size<target){const frontier=cells.filter(c=>allowed[i].has(key(c))&&!land.has(key(c))&&adj(c).some(a=>land.has(key(a))));
     frontier.sort((a,b)=>{const score=c=>base.get(key(c))-adj(c).filter(q=>land.has(key(q))).length*.2;return score(a)-score(b);});
     if(!frontier.length){valid=false;break;}land.add(key(frontier[0]));
    }
    for(const k of land)result.add(k);
   }
   if(valid&&islandBodies(result,n).length>=2)plans.push({set:result,score:loss+[...result].filter(k=>!original.has(k)).length*.5});
  }
  plans.sort((a,b)=>a.score-b.score);if(!plans.length)throw Error('Cannot construct two substantial islands');return plans[0].set;
 }
 // Crop actual landmasses, including merged regions, to a hex-distance radius of 2.
 // Limiting each growth owner alone would still allow merged islands to exceed the cap.
 function capIslandBodies(land){
  const islands=[];
  for(const group of components(land)){
   const occupied=new Set(group),protect=[...core].every(k=>occupied.has(k));let best=null;
   for(const k of group){const center=byKey.get(k);if(protect&&[...core].some(q=>distance(center,byKey.get(q))>2))continue;
    const cropped=new Set(group.filter(q=>distance(center,byKey.get(q))<=2)),parts=components(cropped);let kept=protect?parts.find(part=>part.includes('0,0')):parts[0];if(!kept||!kept.includes(k))continue;
    // Keep a real small island after cropping; refill only inside its radius,
    // with a water gap from other original bodies so it cannot fuse back in.
    const minimum=Math.min(10,group.length),filled=new Set(kept);
    while(filled.size<minimum){const frontier=cells.filter(c=>!filled.has(key(c))&&distance(center,c)<=2&&(!land.has(key(c))||occupied.has(key(c)))&&adj(c).some(q=>filled.has(key(q)))&&!adj(c).some(q=>land.has(key(q))&&!occupied.has(key(q))));frontier.sort((a,b)=>distance(center,a)-distance(center,b));if(!frontier.length)break;filled.add(key(frontier[0]));}
    if(filled.size<minimum)continue;kept=[...filled];
    const radius=Math.max(...kept.map(q=>distance(center,byKey.get(q)))),spread=kept.reduce((sum,q)=>sum+distance(center,byKey.get(q)),0);
    if(!best||kept.length>best.cells.length||kept.length===best.cells.length&&spread<best.spread)best={center:{...center},radius,cells:kept.map(q=>({...byKey.get(q)})),spread};
   }
   if(best){delete best.spread;islands.push(best);}
  }
  return {islands,set:new Set(islands.flatMap(island=>island.cells.map(key)))};
 }
 function corridorWidthFromRoll(min,max,roll){
  const weights=[0,75,20,5],total=Array.from({length:max-min+1},(_,i)=>weights[min+i]).reduce((a,b)=>a+b,0);let threshold=roll*total;
  for(let width=min;width<=max;width++){threshold-=weights[width];if(threshold<0)return width;}return max;
 }
 // Rotate by whole hex turns before centering, preserving adjacency and footprints.
 function rotateCell(c,turns){let [q,r]=axial(c);for(let i=0;i<turns;i++)[q,r]=[-r,q+r];return {x:q+(r-(r&1))/2,y:r};}
 function centerRhythm(terrain){
  const original=[...terrain].map(k=>byKey.get(k)),spawn=H.cellAt(325,350);let best=null;
  const translated=(c,dq,dr)=>{const [q,r]=axial(c),row=r+dr;return {x:q+dq+(row-(row&1))/2,y:row};};
  for(let turns=0;turns<3;turns++){
  const rotated=original.map(c=>rotateCell(c,turns));
  const xs=rotated.map(c=>H.x(c.x,c.y)),ys=rotated.map(c=>H.y(c.y));
  const portrait=(Math.max(...ys)-Math.min(...ys)+H.RADIUS*2)/(Math.max(...xs)-Math.min(...xs)+H.TILE);
  for(let dr=-9;dr<=9;dr++)for(let dq=-8;dq<=8;dq++){
   const moved=rotated.map(c=>translated(c,dq,dr));if(moved.some(c=>!byKey.has(key(c)))||!moved.some(c=>key(c)===key(spawn))||!moved.some(c=>c.x===0&&c.y===0))continue;
   const xs=moved.map(c=>H.x(c.x,c.y)),ys=moved.map(c=>H.y(c.y)),cx=(Math.min(...xs)+Math.max(...xs))/2,cy=(Math.min(...ys)+Math.max(...ys))/2,mx=xs.reduce((a,b)=>a+b,0)/xs.length,my=ys.reduce((a,b)=>a+b,0)/ys.length;
   const score=Math.hypot(cx,cy)+.35*Math.hypot(mx,my),travel=Math.abs(dq)+Math.abs(dr);
   if(!best||portrait>best.portrait+1e-8||Math.abs(portrait-best.portrait)<1e-8&&(score<best.score-1e-8||Math.abs(score-best.score)<1e-8&&travel<best.travel))best={turns,portrait,dq,dr,moved,score,travel};
  }
  }
  const shift=c=>translated(rotateCell(c,best.turns),best.dq,best.dr),result=new Set(best.moved.map(key)),m=terrain.rhythm;
  result.rhythm={...m,placementOffset:{q:best.dq,r:best.dr},rotationTurns:best.turns,islands:m.islands.map(i=>({...i,center:shift(i.center),cells:i.cells.map(shift)})),regions:m.regions.map(r=>({...r,center:shift(r.center),cells:r.cells.map(shift)})),corridors:m.corridors.map(c=>({...c,path:c.path.map(shift),cells:c.cells.map(shift)}))};return result;
 }
 // Grow freely from independent centers; touching regions merge naturally.
 // Add narrow corridors only between landmasses that remain disconnected.
 function rhythm(n,v,rng,options={}){
  const requested=Math.max(2,Math.min(4,Math.round(Number(options.regionCount)||3))),legacyWidth=Math.max(1,Math.min(3,Math.round(Number(options.corridorWidth)||1))),widthA=Math.max(1,Math.min(3,Math.round(Number(options.corridorWidthMin??(options.corridorWidth?legacyWidth:1))))),widthB=Math.max(1,Math.min(3,Math.round(Number(options.corridorWidthMax??(options.corridorWidth?legacyWidth:3))))),widthMin=Math.min(widthA,widthB),widthMax=Math.max(widthA,widthB),spacing=Math.max(0,Math.min(1,Number(options.regionSpacing??75)/100));
  const anchors=[center],limitX=options.orientation==='portrait'?1:3+Math.round(spacing*2),limitY=options.orientation==='portrait'?7:2+Math.round(spacing*2),candidates=cells.filter(c=>Math.abs(c.x)<=limitX&&Math.abs(c.y)<=limitY);
  while(anchors.length<requested){const ranked=candidates.map(c=>({c,d:Math.min(...anchors.map(a=>distance(a,c))),r:rng()})).filter(a=>a.d>=4).sort((a,b)=>(b.d+b.r*1.5)-(a.d+a.r*1.5));if(!ranked.length)break;anchors.push(ranked[0].c);}
  const regions=anchors.map((a,i)=>new Set(i===0?core:[key(a)])),owner=new Map();regions.forEach((set,i)=>{for(const k of set)owner.set(k,i);});
  const noise=new Map(cells.map(c=>[key(c),rng()])),stretch=anchors.map(()=>.8+rng()*.4);
  // Random size ranks avoid nearly equal rooms; weights remain stable as area changes.
  const sizeVariation=Math.max(0,Math.min(1,Number(options.sizeVariation??80)/100)),ranks=anchors.map((_,i)=>i);
  for(let i=ranks.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[ranks[i],ranks[j]]=[ranks[j],ranks[i]];}
  const weights=ranks.map(rank=>Math.exp(sizeVariation*(rank/(anchors.length-1)-.5)*2.6));
  const widthRng=random(String(options.seed??'elevator-01')+'-corridors');
  const roomBudget=n;
  while(owner.size<roomBudget){let best=null;
   for(let i=0;i<regions.length;i++)for(const c of cells){const k=key(c);if(owner.has(k)||!adj(c).some(a=>owner.get(key(a))===i))continue;
    const dx=(H.x(c.x,c.y)-H.x(anchors[i].x,anchors[i].y))/H.TILE,dy=(H.y(c.y)-H.y(anchors[i].y))/H.TILE;
    const score=(Math.hypot(dx*stretch[i],dy/stretch[i])+(noise.get(k)-.5)*v*.8)/Math.sqrt(weights[i])+regions[i].size*.18/weights[i];
    if(!best||score<best.score)best={i,c,score};
   }
   if(!best)break;const k=key(best.c);owner.set(k,best.i);regions[best.i].add(k);
  }
  let set=new Set(owner.keys());
  if(options.ensureMinIslands){set=ensureTwoBodies(set,n);for(const [k,i]of [...owner])if(!set.has(k)){owner.delete(k);regions[i].delete(k);}for(const k of set)if(!owner.has(k)){const c=byKey.get(k);let nearest=0;for(let i=1;i<anchors.length;i++)if(distance(c,anchors[i])<distance(c,anchors[nearest]))nearest=i;owner.set(k,nearest);regions[nearest].add(k);}}
  const capped=capIslandBodies(set);set=capped.set;
  for(const [k,i]of [...owner])if(!set.has(k)){owner.delete(k);regions[i].delete(k);}
  const corridors=[],landmassCount=components(set).length,islandSizes=components(set).map(g=>g.length);

  while(components(set).length>1){
   const groups=components(set),source=new Set(groups[0]),queue=[...source],parent=new Map(queue.map(k=>[k,null]));let end=null;
   // BFS from the entire connected mainland. Already touching regions need no corridor.
   for(let i=0;i<queue.length&&!end;i++)for(const c of adj(byKey.get(queue[i]))){const k=key(c);if(parent.has(k))continue;parent.set(k,queue[i]);if(set.has(k)&&!source.has(k)){end=k;break;}queue.push(k);}
   const path=[];for(let k=end;k!==null&&k!==undefined;k=parent.get(k))path.push(k);path.reverse();
   const width=corridorWidthFromRoll(widthMin,widthMax,widthRng()),corridor=new Set(path.filter(k=>!set.has(k)));
   if(width>1&&path.length>1){const a=byKey.get(path[0]),b=byKey.get(path[path.length-1]),dx=H.x(b.x,b.y)-H.x(a.x,a.y),dy=H.y(b.y)-H.y(a.y);
    for(const k of path){const c=byKey.get(k),cross=q=>dx*(H.y(q.y)-H.y(c.y))-dy*(H.x(q.x,q.y)-H.x(c.x,c.y)),sides=adj(c).filter(q=>!set.has(key(q))).sort((a,b)=>cross(b)-cross(a));
     if(sides[0]&&cross(sides[0])>0)corridor.add(key(sides[0]));
     if(width===3&&sides.length&&cross(sides[sides.length-1])<0)corridor.add(key(sides[sides.length-1]));
    }
   }
   for(const k of corridor)set.add(k);corridors.push({width,from:owner.get(path[0])??null,to:owner.get(path[path.length-1])??null,path:path.map(k=>({...byKey.get(k)})),cells:[...corridor].map(k=>({...byKey.get(k)}))});
  }
  set.rhythm={regionCount:regions.length,landmassCount,islandSizes,maxIslandRadius:2,islands:capped.islands,sizeVariation:sizeVariation*100,corridorWidthMin:widthMin,corridorWidthMax:widthMax,regionSpacing:spacing*100,regions:regions.map((set,i)=>({center:{...anchors[i]},weight:weights[i],cells:[...set].map(k=>({...byKey.get(k)}))})),corridors};
  if(options.orientation==='portrait'){
   const xs=[...set].map(k=>H.x(byKey.get(k).x,byKey.get(k).y)),ys=[...set].map(k=>H.y(byKey.get(k).y));
   if(Math.max(...ys)-Math.min(...ys)+H.RADIUS*2 < (Math.max(...xs)-Math.min(...xs)+H.TILE)*1.15 && (options.portraitAttempt||0)<64){
    const attempt=(options.portraitAttempt||0)+1;return rhythm(n,v,random(options.seed+'-portrait-'+attempt),{...options,portraitAttempt:attempt});
   }
  }
  return options.centered===false?set:centerRhythm(set);
 }
 const algorithms={
  rhythm:{name:'大片区域＋细走廊',desc:'从几个生长中心按不同随机权重扩张，形成大小不同的岛屿片；每条走廊独立随机取宽度。允许大片接触、融合。只在尚未连通的主体之间补细走廊；初始区域数不保证最终仍有同样多片。面积不再为分区强行预留空隙。',param:'块面边缘变化：低值饱满，高值略有侵蚀和不规则。',run:rhythm},
  island:{name:'岛屿：凸多边形＋海岸侵蚀',desc:'先生成凸多边形岛体，再从海岸侵入少量宽海湾，叠加小缺口。连续轮廓为凸形或侵蚀形，落到六角格后呈阶梯边缘；始终保留连通主体。',param:'侵蚀深度：0为凸多边形，越高海湾越深入。凸形模式忽略侵蚀参数。',run:island},
  template:{name:'结构模板＋扰动',desc:'先选择双平台、侧翼或环形结构，再按结构距离生成轮廓。保留宏观形状，边缘有小幅变化。',param:'结构边缘的扰动强度；越高越不规则。',run(n,v,rng){const type=Math.floor(rng()*3),axis=Math.floor(rng()*3),a=axis===0?{x:-2,y:0}:axis===1?{x:-1,y:-2}:{x:1,y:-2},b={x:-a.x,y:-a.y};const scores=cells.map(c=>{const d=distance(c,center),base=type===0?Math.min(distance(c,a),distance(c,b)):type===1?Math.min(d,distance(c,{x:3,y:-1})+.8):Math.abs(d-2);return {c,s:base+(rng()-.5)*v*2};});return new Set(scores.sort((a,b)=>a.s-b.s).slice(0,n).map(a=>key(a.c)));}},
  growth:{name:'受约束区域生长',desc:'从中心开始，每次增加一个相邻六角格。紧凑度控制对多面相邻格的偏好，原始结果始终连通。',param:'紧凑程度；越高越饱满，越低边缘越自由。',run(n,v,rng){return grow(new Set([key(center)]),n,rng,v*3);}},
  walk:{name:'随机游走',desc:'一个游走者逐步踩出地板，偶尔回到已开发格重新出发。容易形成分叉和曲折通道。',param:'重新出发频率；越高分叉通常越多。',run(n,v,rng){const set=new Set([key(center)]);let c=center;for(let i=0;set.size<n&&i<20000;i++){if(rng()<v*.3)c=byKey.get([...set][Math.floor(rng()*set.size)]);const ns=adj(c);c=ns[Math.floor(rng()*ns.length)];set.add(key(c));}return grow(set,n,rng,0);}},
  cellular:{name:'细胞自动机',desc:'按目标密度随机撒点，再根据六邻居数量做多数平滑。原始结果可能分裂或消失，适合观察修复前后差异。',param:'平滑轮数：0～5轮；目标面积仅决定初始撒点密度。',run(n,v,rng){let set=new Set(cells.filter(()=>rng()<n/143).map(key));for(let i=0;i<Math.round(v*5);i++)set=new Set(cells.filter(c=>{const count=adj(c).filter(a=>set.has(key(a))).length;return count>=4||set.has(key(c))&&count>=2;}).map(key));return set;}},
  noise:{name:'平滑值噪声',desc:'在粗网格上生成随机值并平滑插值，取分数最高的目标数量格子。产生团块、半岛和空洞，原始结果不保证连通。',param:'噪声尺度；越高团块越大，越低越碎。',run(n,v,rng){const lattice=new Map(),scale=1.2+v*4.8,smooth=t=>t*t*(3-2*t),value=(x,y)=>{const k=x+','+y;if(!lattice.has(k))lattice.set(k,rng());return lattice.get(k);};const ranked=cells.map(c=>{const px=(c.x+(c.y&1)*.5+7)/scale,py=(c.y+5)*Math.sqrt(3)/2/scale,x=Math.floor(px),y=Math.floor(py),u=smooth(px-x),w=smooth(py-y),a=value(x,y)*(1-u)+value(x+1,y)*u,b=value(x,y+1)*(1-u)+value(x+1,y+1)*u;return {c,s:a*(1-w)+b*w};});return new Set(ranked.sort((a,b)=>b.s-a.s).slice(0,n).map(a=>key(a.c)));}},
  rooms:{name:'房间＋最小生成树',desc:'抽取若干房间中心，用 Prim 最小生成树连接，再沿最短六角路径铺通道。平台大小接近目标，通道会额外增加面积。',param:'房间数量：2～5个；越高平台分支越多。',run(n,v,rng){const k=2+Math.round(v*3),anchors=[center],candidates=cells.filter(c=>Math.abs(c.x)<=4&&Math.abs(c.y)<=3);while(anchors.length<k){const ranked=candidates.map(c=>({c,s:Math.min(...anchors.map(a=>distance(a,c)))+rng()*2})).sort((a,b)=>b.s-a.s);anchors.push(ranked[0].c);}const set=new Set(),radius=Math.max(1,Math.sqrt(n/k/3)-.5);for(const a of anchors)for(const c of cells)if(distance(a,c)<=radius)set.add(key(c));const done=[anchors[0]],todo=anchors.slice(1);while(todo.length){let best=null;for(const a of done)for(const b of todo){const d=distance(a,b);if(!best||d<best.d)best={a,b,d};}let c=best.a;set.add(key(c));while(distance(c,best.b)>0){c=adj(c).sort((a,b)=>distance(a,best.b)-distance(b,best.b))[0];set.add(key(c));}done.push(best.b);todo.splice(todo.indexOf(best.b),1);}return set;}}
 };
 function repair(raw,n,rng){let set=new Set(components(raw)[0]||[]);for(const k of core)set.add(k);
 // Preserve the largest generated landmass and connect it to spawn instead of replacing it.
 while(components(set).length>1){const groups=components(set),first=groups[0];let best=null;for(const a of first)for(const group of groups.slice(1))for(const b of group){const d=distance(byKey.get(a),byKey.get(b));if(!best||d<best.d)best={a:byKey.get(a),b:byKey.get(b),d};}let c=best.a;while(distance(c,best.b)>0){c=adj(c).sort((a,b)=>distance(a,best.b)-distance(b,best.b))[0];set.add(key(c));}}
 grow(set,n,rng,1.5);while(set.size>n){const removable=[...set].filter(k=>!core.has(k)).map(k=>({k,score:distance(byKey.get(k),center)+rng()})).sort((a,b)=>b.score-a.score);let removed=false;for(const {k}of removable){const next=new Set(set);next.delete(k);if(components(next).length===1){set=next;removed=true;break;}}if(!removed)break;}return set;}
 function generate(id,options={}){if(!algorithms[id])throw Error('Unknown algorithm');const n=Math.max(19,Math.min(110,Math.round(Number(options.count)||36))),v=Math.max(0,Math.min(1,(Number(options.variation)||0)/100)),seed=String(options.seed??'elevator-01'),raw=algorithms[id].run(n,v,random(seed),options),set=id==='rhythm'||options.connected===false?raw:repair(raw,n,random(seed+'-repair')),changed=[...cells].filter(c=>raw.has(key(c))!==set.has(key(c))).length;return {algorithm:id,seed,count:n,variation:v*100,...(raw.rhythm?{rhythm:raw.rhythm}:{}),...(id==='island'?{islandMode:options.islandMode||'eroded',sides:Number(options.sides)||6,bays:Number(options.bays)||2,roughness:Number(options.roughness??35),islandStyle:raw.islandStyle}:{}),connected:options.connected!==false,cells:cells.filter(c=>set.has(key(c))).map(c=>({...c})),rawCount:raw.size,rawComponents:components(raw).length,changed,stats:metrics(set)};}
 function metrics(set){const groups=components(set);let perimeter=0,thin=0;for(const k of set){const count=adj(byKey.get(k)).filter(c=>set.has(key(c))).length;perimeter+=6-count;if(count<=2)thin++;}return {area:set.size,components:groups.length,perimeter,thin};}
 // Version this recipe so exported seeds can identify their generation rules.
 function parametersFromSeed(seed='elevator-01'){
  seed=String(seed);const rng=random(seed+'-parameters-v4'),integer=(lo,hi)=>lo+Math.floor(rng()*(hi-lo+1));
  return {seed,orientation:'portrait',count:integer(32,85),regionCount:integer(2,4),regionSpacing:integer(30,100),sizeVariation:integer(60,100),variation:integer(10,85),corridorWidthMin:1,corridorWidthMax:3,ensureMinIslands:true,connected:true,islandMode:'mixed',sides:integer(4,9),bays:integer(1,3),roughness:integer(15,70)};
 }
 function generateFromSeed(seed='elevator-01'){const parameters=parametersFromSeed(seed);return {...generate('rhythm',parameters),recipeVersion:7,parameters};}
 const api={algorithms,cells,generate,components,adj,key,parametersFromSeed,generateFromSeed,corridorWidthFromRoll};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TerrainGenerators=api;
})(globalThis);


'use strict';
// The campaign remains the source of all gameplay. This adapter changes tile geometry only.
(function(root){
 const TILE=54,ROW=TILE*Math.sqrt(3)/2,RADIUS=TILE/Math.sqrt(3);
 const x=(col,row)=>(col+((row&1)-.5)*.5)*TILE,y=row=>row*ROW;
 function cellAt(px,py){const fr=(py-300)/ROW,fq=(px-325+TILE*.25)/TILE-fr/2;let q=Math.round(fq),r=Math.round(fr),s=Math.round(-fq-fr);const dq=Math.abs(q-fq),dr=Math.abs(r-fr),ds=Math.abs(s+fq+fr);if(dq>dr&&dq>ds)q=-r-s;else if(dr>ds)r=-q-s;return {x:q+(r-(r&1))/2,y:r};}
 function neighbors(col,row){const d=row&1;return [[1,0],[-1,0],[d-1,-1],[d,-1],[d-1,1],[d,1]];}
 function initialFloor(){
  // Count the center as the first cell of the requested three-cell radius.
  const cells=[],radius=2;
  // Axial hex distance; convert back to the engine's odd-row offset coordinates.
  for(let r=-radius;r<=radius;r++)for(let q=Math.max(-radius,-r-radius);q<=Math.min(radius,-r+radius);q++){
   const x=q+(r-(r&1))/2,y=r;
   cells.push({x,y,medical:false,shieldTile:false,healProgress:0,healFlash:0,medPack:false});
  }
  return cells;
 }
 let campaignMap=null,campaignSerial=0;
 function campaignFloor(seed){
  const generator=root.TerrainGenerators||(typeof module!=='undefined'&&module.exports?require('./terrain-generators.js'):null);
  if(!generator)throw Error('初始地图生成模块未加载');
  const pinned=root.location?new URLSearchParams(root.location.search).get('mapseed'):null;
  const chosen=seed??pinned??('run-'+(root.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2))+'-'+(++campaignSerial));
  campaignMap=generator.generateFromSeed(String(chosen));
  return campaignMap.cells.map(({x,y})=>({x,y,medical:false,shieldTile:false,healProgress:0,healFlash:0,medPack:false}));
 }
 function inside(t,px,py,padding=0){const dx=Math.abs(px-325-x(t.x,t.y)),dy=Math.abs(py-300-y(t.y));return dx<=TILE/2+padding&&dy<=RADIUS+padding&&Math.sqrt(3)*dy+dx<=TILE+padding*2;}
 const outlines=new WeakMap();
 function outline(cells){
  const signature=cells.map(t=>t.x+','+t.y).join(';'),cached=outlines.get(cells);if(cached?.signature===signature)return cached;
  const occupied=new Set(cells.map(t=>t.x+','+t.y)),edges=[];
  for(const t of cells)for(const [dx,dy]of neighbors(t.x,t.y)){
   if(occupied.has((t.x+dx)+','+(t.y+dy)))continue;
   const cx=325+x(t.x,t.y),cy=300+y(t.y),nx=(x(t.x+dx,t.y+dy)-x(t.x,t.y))/TILE,ny=(y(t.y+dy)-y(t.y))/TILE,mx=cx+nx*TILE/2,my=cy+ny*TILE/2,half=RADIUS/2;
   edges.push({ax:mx-ny*half,ay:my+nx*half,bx:mx+ny*half,by:my-nx*half,nx,ny,tile:t});
  }
  const result={signature,occupied,edges};outlines.set(cells,result);return result;
 }
 function nearest(edge,px,py){const dx=edge.bx-edge.ax,dy=edge.by-edge.ay,t=Math.max(0,Math.min(1,((px-edge.ax)*dx+(py-edge.ay)*dy)/(dx*dx+dy*dy)));return {x:edge.ax+dx*t,y:edge.ay+dy*t};}
 function standOn(shape,px,py,r){const t=cellAt(px,py);if(!shape.occupied.has(t.x+','+t.y))return false;return shape.edges.every(e=>{const q=nearest(e,px,py);return Math.hypot(px-q.x,py-q.y)>=r-1e-6;});}
 function canStand(cells,px,py,r=7){return standOn(outline(cells),px,py,r);}
 function move(cells,px,py,targetX,targetY,r=7){
  const shape=outline(cells),skin=.001;let vx=targetX-px,vy=targetY-py;
  // Correct only tiny existing boundary overlaps, e.g. positions accepted by the old 8 probes.
  for(let pass=0;pass<6;pass++){let corrected=false;for(const e of shape.edges){const q=nearest(e,px,py),dx=px-q.x,dy=py-q.y,d=Math.hypot(dx,dy);if(d<r-skin){const nx=d>1e-8?dx/d:-e.nx,ny=d>1e-8?dy/d:-e.ny;px+=nx*(r+skin-d);py+=ny*(r+skin-d);corrected=true;}}if(!corrected)break;}
  for(let pass=0;pass<6&&Math.hypot(vx,vy)>1e-7;pass++){
   let hit=null;const accept=(t,nx,ny)=>{if(t>=-1e-8&&t<=1&&vx*nx+vy*ny< -1e-8&&(!hit||t<hit.t))hit={t:Math.max(0,t),nx,ny};};
   for(const e of shape.edges){
    const outward=vx*e.nx+vy*e.ny;
    if(outward>1e-9){const distance=(px-e.ax)*e.nx+(py-e.ay)*e.ny,t=(-r-distance)/outward,hx=px+vx*t,hy=py+vy*t,dx=e.bx-e.ax,dy=e.by-e.ay,u=((hx-e.ax)*dx+(hy-e.ay)*dy)/(dx*dx+dy*dy);if(u>=0&&u<=1)accept(t,-e.nx,-e.ny);}
    for(const [cx,cy]of [[e.ax,e.ay],[e.bx,e.by]]){const dx=px-cx,dy=py-cy,a=vx*vx+vy*vy,b=2*(dx*vx+dy*vy),c=dx*dx+dy*dy-r*r,disc=b*b-4*a*c;if(disc<0)continue;const t=(-b-Math.sqrt(disc))/(2*a),hx=px+vx*t-cx,hy=py+vy*t-cy,len=Math.hypot(hx,hy)||1;accept(t,hx/len,hy/len);}
   }
   if(!hit){px+=vx;py+=vy;break;}
   const travel=Math.max(0,hit.t-skin/Math.max(skin,Math.hypot(vx,vy)));px+=vx*travel;py+=vy*travel;vx*=1-travel;vy*=1-travel;
   // Retain tangential motion along the real hex edge instead of rejecting X then Y.
   const into=vx*hit.nx+vy*hit.ny;if(into<0){vx-=hit.nx*into;vy-=hit.ny*into;}
  }
  return {x:px,y:py};
 }
 // Shared six-face geometry for tile fixtures and their collision planes.
 const normals=Array.from({length:6},(_,i)=>[Math.cos(i*Math.PI/3),Math.sin(i*Math.PI/3)]);
 const SPIKES=[[-7.5,-13],[7.5,-13],[-15,0],[0,0],[15,0],[-7.5,13],[7.5,13]];
 function fixture(r,cx,cz,top,height,color,inset=2){
  const rad=(TILE/2-inset)/Math.cos(Math.PI/6),points=Array.from({length:6},(_,i)=>{const a=Math.PI/6+i*Math.PI/3;return [cx+Math.cos(a)*rad,top,cz+Math.sin(a)*rad*1.06];});
  for(let i=0;i<6;i++){const a=points[i],b=points[(i+1)%6];r.quad([cx,top,cz],a,b,[cx,top,cz],color);if(height>0)r.quad(a,b,[b[0],top-height,b[2]],[a[0],top-height,a[2]],color);}
 }
 function coverContains(t,px,py,r=0){const dx=px-325-x(t.x,t.y),dy=py-300-y(t.y);return normals.every(([nx,ny])=>dx*nx+dy*ny<21+r);}
 function coverSegment(t,px,py,ex,ey,r=0){
  const dx=px-325-x(t.x,t.y),dy=py-300-y(t.y),vx=ex-px,vy=ey-py;let enter=0,exit=1,nx=0,ny=0;
  for(const [a,b]of normals){const distance=dx*a+dy*b-21-r,speed=vx*a+vy*b;if(Math.abs(speed)<1e-10){if(distance>=0)return null;continue;}const f=-distance/speed;if(speed<0){if(f>=enter){enter=f;nx=a;ny=b;}}else exit=Math.min(exit,f);if(enter>exit)return null;}
  return exit<=1e-10||enter>1?null:{tile:t,f:Math.max(0,enter),nx,ny};
 }
 function moveAxis(cells,w,dt,speed,r){
  if(!canStand(cells,w.x,w.y,r)){const at=cells.map(t=>({x:325+x(t.x,t.y),y:300+y(t.y)})).filter(p=>canStand(cells,p.x,p.y,r)).sort((a,b)=>Math.hypot(a.x-w.x,a.y-w.y)-Math.hypot(b.x-w.x,b.y-w.y))[0];if(!at)return;Object.assign(w,at);}
  let left=Math.max(0,dt)*speed,stuck=0;const axis=w.axis;
  while(left>1e-7){const step=Math.min(4,left),start=w[axis];w[axis]=start+w.dir*step;if(canStand(cells,w.x,w.y,r)){left-=step;continue;}let lo=0,hi=step;for(let i=0;i<20;i++){const mid=(lo+hi)/2;w[axis]=start+w.dir*mid;if(canStand(cells,w.x,w.y,r))lo=mid;else hi=mid;}w[axis]=start+w.dir*lo;if(lo<1e-5){if(++stuck>=2)return;}else stuck=0;left-=Math.max(lo,1e-5);w.dir=-w.dir;}
 }
 const center=t=>({x:325+x(t.x,t.y),y:300+y(t.y)});
 function turretTrack(cells,side){
  const shape=outline(cells);shape.tracks??={};if(shape.tracks[side])return shape.tracks[side];
  const direction={left:[-1,0],right:[1,0],top:[0,-1],bottom:[0,1]}[side];if(!direction)return {points:[],length:0};
  const vertical=side==='left'||side==='right',axis=vertical?'y':'x',other=vertical?'x':'y';
  const facing=shape.edges.filter(e=>e.nx*direction[0]+e.ny*direction[1]>.75).map(e=>{
   const at={x:(e.ax+e.bx)/2-e.nx*20,y:(e.ay+e.by)/2-e.ny*20};return {tile:e.tile,...(standOn(shape,at.x,at.y,16)?at:center(e.tile))};
  });
  const candidates=facing.filter(a=>!facing.some(b=>Math.abs(b[axis]-a[axis])<TILE*.55&&(b.x-a.x)*direction[0]+(b.y-a.y)*direction[1]>.01)).sort((a,b)=>a[axis]-b[axis]||a[other]-b[other]);
  const points=[],clear=(a,b)=>{const n=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/2);for(let i=0;i<=n;i++){const u=n?i/n:0;if(!standOn(shape,a.x+(b.x-a.x)*u,a.y+(b.y-a.y)*u,16))return false;}return true;};
  const connection=(a,b)=>{
   const ca=center(a),cb=center(b);if(clear(ca,cb))return [];
   // At a hex junction the direct center line can graze a concave vertex.
   // Bend through the interior of an occupied three-cell junction instead.
   for(const [dx,dy]of neighbors(a.x,a.y)){const c={x:a.x+dx,y:a.y+dy};if(!shape.occupied.has(c.x+','+c.y)||Math.hypot(x(c.x,c.y)-x(b.x,b.y),y(c.y)-y(b.y))>TILE+.01)continue;const cc=center(c),via={x:(ca.x+cb.x+cc.x)/3,y:(ca.y+cb.y+cc.y)/3};if(clear(ca,via)&&clear(via,cb))return [via];}return null;
  };
  const add=p=>{if(!points.length||Math.hypot(p.x-points.at(-1).x,p.y-points.at(-1).y)>1e-6)points.push(p);};
  for(const at of candidates){
   const last=points.at(-1);if(last&&!clear(last,at)){
    // Bridge concave corners through adjacent supported cells; never draw or jump across a gap.
    const from=cellAt(last.x,last.y),to=at.tile,key=t=>t.x+','+t.y,queue=[from],parents=new Map([[key(from),null]]),bends=new Map();let found=null;
    for(let i=0;i<queue.length;i++){const t=queue[i];if(key(t)===key(to)){found=t;break;}for(const [dx,dy]of neighbors(t.x,t.y)){const next={x:t.x+dx,y:t.y+dy},k=key(next);if(!shape.occupied.has(k)||parents.has(k))continue;const via=connection(t,next);if(via){parents.set(k,t);bends.set(k,via);queue.push(next);}}}
    if(!found)continue;const bridge=[];for(let t=found;t;t=parents.get(key(t))){bridge.push(center(t));for(const p of [...(bends.get(key(t))||[])].reverse())bridge.push(p);}for(const p of bridge.reverse())add(p);
   }add(at);
  }
  let length=0;for(let i=1;i<points.length;i++)length+=Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y);
  return shape.tracks[side]={points,length};
 }
 function turretEdge(cells,t){
  const track=turretTrack(cells,t.edge);let along=Math.max(0,Math.min(1,t.slide))*track.length;
  if(!track.points.length)return;let at=track.points[0];
  for(let i=1;i<track.points.length;i++){const b=track.points[i],length=Math.hypot(b.x-at.x,b.y-at.y);if(along<=length){const u=along/length;t.x=at.x+(b.x-at.x)*u;t.y=at.y+(b.y-at.y)*u;return;}along-=length;at=b;}t.x=at.x;t.y=at.y;
 }
 function slideTurret(cells,t,dt){const length=turretTrack(cells,t.edge).length;if(length>0){const phase=((t.dir>0?t.slide:2-t.slide)+105*Math.max(0,dt)/length)%2;t.slide=phase<=1?phase:2-phase;t.dir=phase<1?1:-1;}turretEdge(cells,t);}
 function drawTurretTracks(r,cells,turrets){
  for(const side of new Set(turrets.map(t=>t.edge))){const {points}=turretTrack(cells,side);for(let i=1;i<points.length;i++){
   const a=points[i-1],b=points[i],dx=b.x-a.x,dz=(b.y-a.y)*1.06,length=Math.hypot(dx,dz),cx=(a.x+b.x)/2-325,cz=((a.y+b.y)/2-300)*1.06,angle=-Math.atan2(dz,dx);
   r.box(cx,6,cz,length+2,4,9,'#28383b',angle);r.box(cx,8.5,cz,length+2,1,3,'#69766e',angle);
  }}
 }
 function steerSpider(cells,e,vx,vy){
  for(const edge of outline(cells).edges){const q=nearest(edge,e.x,e.y),dx=e.x-q.x,dy=e.y-q.y,d=Math.hypot(dx,dy);if(d<e.r+35&&d>1e-6){const weight=(e.r+35-d)/25;vx+=dx/d*weight;vy+=dy/d*weight;}}
  return {vx,vy};
 }
 function moveSpider(cells,e,dt){
  if(!canStand(cells,e.x,e.y,e.r)){const at=cells.map(center).filter(p=>canStand(cells,p.x,p.y,e.r)).sort((a,b)=>Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(b.x-e.x,b.y-e.y))[0];if(!at)return;Object.assign(e,at);}
  const travel=e.moveSpeed*e.speedFactor*dt,at=move(cells,e.x,e.y,e.x+Math.cos(e.heading)*travel,e.y+Math.sin(e.heading)*travel,e.r);e.x=at.x;e.y=at.y;
 }
 function transform(source){
  for(const required of ['function floorPoint(x,y)','function addFloor(n=6)','function syncGrid()','function draw(dt=1/60)'])if(!source.includes(required))throw Error('六角适配缺少原版接口：'+required);
  let s=source.replace(/\b(t|next|a|b)\.x\*TILE\b/g,(_,v)=>'HexMap.x('+v+'.x,'+v+'.y)').replace(/\b(t|next|a|b)\.y\*TILE\b/g,(_,v)=>'HexMap.y('+v+'.y)');
  const oldReset='function resetFloor(){tiles=[];for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++)tiles.push({x,y,medical:false,shieldTile:false,healProgress:0,healFlash:0,medPack:false})}';
  if(!s.includes(oldReset))throw Error('六角适配无法定位开局地板');
  s=s.replace(oldReset,'function resetFloor(){tiles=HexMap.campaignFloor();}');
  s=s.replace(/Math\.floor\(\((x|p\.x)-325\)\/TILE\+\.5\)/g,(_,v)=>'HexMap.cellAt('+v+','+(v==='x'?'y':'p.y')+').x');
  s=s.replace(/Math\.floor\(\((y|p\.y)-300\)\/TILE\+\.5\)/g,(_,v)=>'HexMap.cellAt('+(v==='y'?'x':'p.x')+','+v+').y');
  const four='[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>hasTile(x+a,y+b))';
  if(!s.includes(four))throw Error('六角适配无法定位扩建相邻规则');s=s.replace(four,'HexMap.neighbors(x,y).some(([a,b])=>hasTile(x+a,y+b))');
  const oldWalk='function walkFloor(o,x,y,r){const oldX=o.x,oldY=o.y;if(onFloor(x,o.y,r))o.x=x;if(onFloor(o.x,y,r))o.y=y;resolveCoverMovement(o,oldX,oldY,r);}';
  if(!s.includes(oldWalk))throw Error('六角适配无法定位行走判定');
  s=s.replace(oldWalk,'function walkFloor(o,x,y,r){const oldX=o.x,oldY=o.y,at=HexMap.move(tiles,oldX,oldY,x,y,r);o.x=at.x;o.y=at.y;resolveCoverMovement(o,oldX,oldY,r);}');
  const oldFloor='function onFloor(x,y,r=7){if(!floorPoint(x,y))return false;return [[r,0],[-r,0],[0,r],[0,-r],[r*.7,r*.7],[-r*.7,r*.7],[r*.7,-r*.7],[-r*.7,-r*.7]].every(([a,b])=>floorPoint(x+a,y+b))}';
  if(!s.includes(oldFloor))throw Error('六角适配无法定位落脚判定');s=s.replace(oldFloor,'function onFloor(x,y,r=7){return HexMap.canStand(tiles,x,y,r);}');
  s=s.replace('const x=canWalkAt(p.x+mx,p.y,7)?p.x+mx:p.x,y=canWalkAt(x,p.y+my,7)?p.y+my:p.y;return Math.hypot(x-p.x,y-p.y)<.001','const at=HexMap.move(tiles,p.x,p.y,p.x+mx,p.y+my,7);return !canWalkAt(at.x,at.y,7)||Math.hypot(at.x-p.x,at.y-p.y)<.001');
  s=s.replace('A.x=325+(grid.minX-.5)*TILE;A.w=(grid.maxX-grid.minX+1)*TILE;A.y=300+(grid.minY-.5)*TILE;A.h=(grid.maxY-grid.minY+1)*TILE','A.x=325+(grid.minX-.75)*TILE;A.w=(grid.maxX-grid.minX+1.5)*TILE;A.y=300+HexMap.y(grid.minY)-HexMap.RADIUS;A.h=HexMap.y(grid.maxY-grid.minY)+HexMap.RADIUS*2');
  s=s.replaceAll('hell-elevator-best','hell-elevator-hex-best');
  s=s.replace("Math.abs(g.x-325-HexMap.x(t.x,t.y))<TILE/2&&Math.abs(g.y-300-HexMap.y(t.y))<TILE/2",'HexMap.inside(t,g.x,g.y,g.r)');
  s=s.replace("Math.abs(p.x-325-HexMap.x(t.x,t.y))<TILE/2-4+drinkPlayerRadius()-4&&Math.abs(p.y-300-HexMap.y(t.y))<TILE/2-4+drinkPlayerRadius()-4",'HexMap.inside(t,p.x,p.y,Math.max(0,drinkPlayerRadius()-8))');
  const replaceFunction=(name,next,body)=>{const start=s.indexOf('function '+name+'('),end=s.indexOf('function '+next+'(',start);if(start<0||end<0)throw Error('六角机关适配缺少接口：'+name);s=s.slice(0,start)+body+'\n'+s.slice(end);};
  s=s.replace('for(const dx of [-15,0,15])for(const dz of [-15,0,15])','for(const [dx,dz]of HexMap.SPIKES)');
  for(const [old,replacement]of [
   ["r.box(x,2.6,z,TILE-4,.6,TILE*1.06-4,'#283132')","HexMap.fixture(r,x,z,2.9,.6,'#283132')"],
   ["r.emissiveBox(x,4.3,z,TILE-5,.4,TILE*1.06-5,flash?'#ff2424':'#9b1717')","HexMap.fixture(r,x,z,4.5,.4,flash?'#ff2424':'#9b1717')"],
   ["r.box(cx,2.6,cz,TILE-4,.5,TILE*1.06-4,'#392c2d')","HexMap.fixture(r,cx,cz,2.85,.5,'#392c2d')"],
   ["r.box(cx,2.6,cz,TILE-4,.6,TILE*1.06-4,'#392d25')","HexMap.fixture(r,cx,cz,2.9,.6,'#392d25')"],
   ['r.emissiveBox(x,4.4,z,TILE-3,.5,TILE*1.06-3,col)','HexMap.fixture(r,x,z,4.65,.5,col,1.5)'],
   ["[x+18,2.3,z+21],[x+21,2.3,z+21],[x+21,2.3,z+24],[x+18,2.3,z+24]","[x-1.5,2.3,z+21],[x+1.5,2.3,z+21],[x+1.5,2.3,z+24],[x-1.5,2.3,z+24]"],
  ]){if(!s.includes(old))throw Error('六角机关适配无法定位：'+old);s=s.replace(old,replacement);}
  replaceFunction('coverContains','canWalkAt','function coverContains(t,x,y,r=0){return HexMap.coverContains(t,x,y,r); }');
  replaceFunction('coverSegment','firstCoverHit','function coverSegment(t,x,y,endX,endY,r=0){return HexMap.coverSegment(t,x,y,endX,endY,r); }');
  replaceFunction('moveFlywheel','eraseNegative','function moveFlywheel(w,dt){HexMap.moveAxis(tiles,w,dt,FLYWHEEL_SPEED,FLYWHEEL_RADIUS); }');
  replaceFunction('syncTurretEdge','createTurret','function syncTurretEdge(t){HexMap.turretEdge(tiles,t); }');
  replaceFunction('slideTurret','beamLength','function slideTurret(t,dt){HexMap.slideTurret(tiles,t,dt); }');
  const railStart=s.indexOf('for(const edge of new Set(turrets.map(t=>t.edge)))'),railEnd=s.indexOf('for(const t of turrets){if(t.rail&&',railStart);
  if(railStart<0||railEnd<0)throw Error('六角适配缺少炮台轨道绘制');
  s=s.slice(0,railStart)+'HexMap.drawTurretTracks(r,tiles,turrets.filter(t=>!t.rail));\n'+s.slice(railEnd);
  const steerStart=s.indexOf(' const {left,right,top,bottom}=goldSpiderBounds(),look=65;'),steerEnd=s.indexOf(' const desired=Math.atan2(vy,vx)',steerStart);
  if(steerStart<0||steerEnd<0)throw Error('六角适配缺少金蛛避边接口');
  s=s.slice(0,steerStart)+' ({vx,vy}=HexMap.steerSpider(tiles,e,vx,vy));\n'+s.slice(steerEnd);
  const spiderMove='e.x=Math.max(left,Math.min(right,e.x+Math.cos(e.heading)*travel));e.y=Math.max(top,Math.min(bottom,e.y+Math.sin(e.heading)*travel));resolveEnemyCover(e,ox,oy);';
  if(!s.includes(spiderMove))throw Error('六角适配缺少金蛛移动接口');
  s=s.replace(spiderMove,'HexMap.moveSpider(tiles,e,dt);resolveEnemyCover(e,ox,oy);');
  s=s.replace('if(hit.nx)targetX=x;if(hit.ny)targetY=y;','const remainX=targetX-x,remainY=targetY-y,into=remainX*hit.nx+remainY*hit.ny;if(into<0){targetX-=into*hit.nx;targetY-=into*hit.ny;}');
  s=s.replace('candidates.push({x:cx-h,y},{x:cx+h,y},{x,y:cy-h},{x,y:cy+h});','for(let i=0;i<6;i++){const a=i*Math.PI/3,nx=Math.cos(a),ny=Math.sin(a),push=h-(x-cx)*nx-(y-cy)*ny;candidates.push({x:x+nx*push,y:y+ny*push});}');
  s=s.replace('TILE*.71);','HexMap.RADIUS);');
  s=s.replace("r.transparentQuad([x-h,3.3,z-d],[x+h,3.3,z-d],[x+h,3.3,z+d],[x-h,3.3,z+d],'#fff2b2',[alpha,alpha,alpha,alpha]);","for(let i=0;i<6;i++){const at=j=>{const a=Math.PI/6+j*Math.PI/3;return [x+Math.cos(a)*(HexMap.RADIUS-3),3.3,z+Math.sin(a)*(HexMap.RADIUS-3)*1.06];};r.transparentQuad([x,3.3,z],at(i),at(i+1),[x,3.3,z],'#fff2b2',[alpha,alpha,alpha,alpha]);}");
  const blockStart=s.indexOf("r.residentMesh('cover:block',"),blockEnd=s.indexOf('// Six visible charge bars',blockStart);
  if(blockStart<0||blockEnd<0)throw Error('六角适配无法定位掩体模型');
  s=s.slice(0,blockStart)+"r.residentMesh('hex-cover:block',()=>{HexMap.fixture(r,0,0,8,6,'#34454c',5);HexMap.fixture(r,0,0,39,31,'#778b91',6);HexMap.fixture(r,0,0,43.5,4.5,'#b0bdba',5);},monsterPose(x,0,z),{flash:hit});\n  "+s.slice(blockEnd);
  s=s.replaceAll('z+23,1,18,1','z+20,1,18,1').replaceAll('z+23,1,20,1','z+20,1,20,1');
  return s+'\nHexMap.installScene(renderer);\n//# sourceURL=hex-campaign-runtime.js\n';
 }
 function plate(r,cx,cz,color,edge,top=2,inset=1){
  const rad=RADIUS-inset,point=(side,u,scale,height=top)=>{
   const a=Math.PI/6+side*Math.PI/3,b=a+Math.PI/3;
   return [cx+(Math.cos(a)*(1-u)+Math.cos(b)*u)*rad*scale,height,cz+(Math.sin(a)*(1-u)+Math.sin(b)*u)*rad*scale*1.06];
  };
  // A recessed, unlit black backing closes the gaps against the bright city below.
  for(let i=0;i<6;i++){
   r.emissiveQuad([cx,top-.35,cz],point(i,0,RADIUS/rad,top-.35),point(i,1,RADIUS/rad,top-.35),[cx,top-.35,cz],'#020507');
   const a=point(i,0,1),b=point(i,1,1);r.quad(a,b,[b[0],-6,b[2]],[a[0],-6,a[2]],'#080f14');
  }
  // Restore the original, even floor color so neighboring tiles read as one deck.
  const start=r.count;
  for(let side=0;side<6;side++)r.quad([cx,top,cz],point(side,0,1),point(side,1,1),[cx,top,cz],color);
  r.markFloor(start);
 }

 function columnColors(){
  const s=globalThis.NeonPostFX?.settings||{};
  return [s.hexSideColor||'#303b55',s.hexSideAltColor||'#3d4762',s.hexCollarColor||'#4d93c9',s.hexLowerColor||'#000000'];
 }
 function tileNeonColor(){
  const s=globalThis.NeonPostFX?.settings||{};
  return s.hexNeonColor||'#2080ff';
 }
 function column(r,kind,rarityColor='#a8b7b5',hasBase=false,neonColor=tileNeonColor(0,0)){
  const rad=RADIUS-1.2,point=(i,h,scale=1)=>{const a=Math.PI/6+i*Math.PI/3;return [Math.cos(a)*rad*scale,h,Math.sin(a)*rad*1.06*scale];};
  const colors=columnColors();
  // Two stacked layers, total thickness 36 (three times the previous 12).
  for(let i=0;i<6;i++){
   const next=(i+1)%6;
   r.quad(point(i,-6),point(next,-6),point(next,-16),point(i,-16),colors[i%2]);
   r.quad(point(i,-16),point(next,-16),point(next,-34),point(i,-34),colors[3]);
   r.quad([0,-34,0],point(next,-34),point(i,-34),[0,-34,0],colors[3]);
  }
  plate(r,0,0,'#455266',rarityColor,2,hasBase?4:1);
  // A narrow neon rim follows the shallow tile edge.
  // Offset each face along its normal to avoid fighting the shaft geometry.
  for(let i=0;i<6;i++){
   const a=point(i,-11),b=point(i+1,-11),dx=b[0]-a[0],dz=b[2]-a[2],length=Math.hypot(dx,dz),nx=dz/length,nz=-dx/length;
   const at=(p,h,offset)=>[p[0]+nx*offset,h,p[2]+nz*offset];
   r.quad(at(a,-9.5,1.2),at(b,-9.5,1.2),at(b,-13,1.2),at(a,-13,1.2),'#101a2c');
   const glowStart=r.count;
   r.emissiveQuad(at(a,-10.75,1.4),at(b,-10.75,1.4),at(b,-11.75,1.4),at(a,-11.75,1.4),neonColor);
   // Strong emissive rim keeps the thin band visible against the bright city.
   for(let v=glowStart;v<r.count;v+=9)for(let c=6;c<9;c++)r.data[v+c]*=3;

  }


 }
 function tileRimGlow(r,color){
  const rad=RADIUS-1.2,point=(i,h)=>{const a=Math.PI/6+i*Math.PI/3;return [Math.cos(a)*rad,h,Math.sin(a)*rad*1.06];};
  for(let i=0;i<6;i++){
   const a=point(i,0),b=point(i+1,0),dx=b[0]-a[0],dz=b[2]-a[2],len=Math.hypot(dx,dz),at=(p,h)=>[p[0]+dz/len*1.5,h,p[2]-dx/len*1.5];
   for(const [top,bottom]of [[-9.25,-10.75],[-10.75,-11.75],[-11.75,-13.25]]){
    const start=r.count;r.emissiveQuad(at(a,top),at(b,top),at(b,bottom),at(a,bottom),color);
    for(let v=start;v<r.count;v+=9){const h=r.data[v+1],fade=Math.min(1,(h+13.25)/1.5,(-9.25-h)/1.5);for(let c=6;c<9;c++)r.data[v+c]*=Math.max(0,fade);}
   }
  }
 }
 function tileBeam(r,color=tileNeonColor(0,0)){
  const rad=RADIUS-2;
  const point=(i,h)=>{const a=Math.PI/6+i*Math.PI/3;return [Math.cos(a)*rad,h,Math.sin(a)*rad*1.06];};
  // Open luminous hexagonal volume; alpha fades to zero in material mode 4.
  for(let i=0;i<6;i++)r.emissiveQuad(point(i,-34),point(i+1,-34),point(i+1,-159),point(i,-159),color);
 }
 // Three stepped armor layers surround a raised LED work surface.
 // Neutral, non-emissive metal is shared by every core.
 function productionBase(r){
  const authored=globalThis.CyberFacilityMeshes?.supply_pad;
  if(authored){r.data=authored;r.count=authored.length;return;}
  const point=(i,rad,h)=>{const a=Math.PI/6+i*Math.PI/3;return [Math.cos(a)*rad,h,Math.sin(a)*rad*1.06];};
  const ring=(outer,oh,inner,ih,color)=>{for(let i=0;i<6;i++)r.quad(point(i,outer,oh),point(i+1,outer,oh),point(i+1,inner,ih),point(i,inner,ih),color);};
  ring(30,-6.8,30,1,'#323232');
  ring(30,1,29,3,'#818181');
  ring(29,3,27.2,3,'#a6a6a6');
  ring(27.2,3,27.2,4.8,'#323232');
  ring(27.2,4.8,26.2,6.2,'#787878');
  ring(26.2,6.2,24.2,6.2,'#b2b2b2');
  ring(24.2,6.2,23,7.1,'#474747');
  ring(23,7.1,23,8.8,'#383838');
  ring(23,8.8,21.5,9.35,'#848484');
  ring(21.5,9.35,0,9.35,'#272727');
  ring(23.04,7.25,23.04,7.8,'#4f4f4f');
  ring(30,-5.8,30,-5.1,'#545454');
  for(let i=0;i<6;i++){
   const a=point(i,30.04,-2.3),b=point(i+1,30.04,-2.3),dx=b[0]-a[0],dz=b[2]-a[2];
   const face=(u,h)=>[a[0]+dx*u,h,a[2]+dz*u];
   // Recessed vents and solid gray inserts on each face.
   r.quad(face(.19,-2),face(.81,-2),face(.81,-4.8),face(.19,-4.8),'#242424');
   r.quad(face(.32,-2.8),face(.68,-2.8),face(.68,-3.55),face(.32,-3.55),'#646464');
   for(const u of [.24,.76])r.quad(face(u-.02,-2.2),face(u+.02,-2.2),face(u+.02,-4.6),face(u-.02,-4.6),'#828282');
   const c=point(i,28.1,3.1);
   r.box(c[0],3.1,c[2],2.2,.6,2.2,'#3c3c3c');
   r.box(c[0],3.44,c[2],.8,.1,.8,'#949494');
   // Segmented metal inlays expose the corner fasteners.
   const topA=point(i,25.7,6.3),topB=point(i+1,25.7,6.3),innerA=point(i,24.9,6.3),innerB=point(i+1,24.9,6.3);
   const mix=(p,q,u)=>p.map((v,j)=>v+(q[j]-v)*u);
   r.quad(mix(topA,topB,.16),mix(topA,topB,.84),mix(innerA,innerB,.84),mix(innerA,innerB,.16),'#686868');
  }
 }
 // Blob lightmap: cached floor-only color, no extra point lights or blended layers.
 function floorBlobStrength(px,pz,sources){
  let light=0;const range=TILE*2.6;
  for(const source of sources){const d=Math.hypot(px-source[0],(pz-source[1])/1.06)/range;if(d<1){const falloff=1-d*d;light=Math.max(light,falloff*falloff);}}
  return light*.65;
 }
 function floorBlob(r,sources,cx,cz,inset){
  const rad=RADIUS-inset,start=r.count,base=r.color('#455266'),tint=r.color(columnColors()[2]);
  const point=(side,u,scale)=>{const a=Math.PI/6+side*Math.PI/3,b=a+Math.PI/3;return [(Math.cos(a)*(1-u)+Math.cos(b)*u)*rad*scale,2.04,(Math.sin(a)*(1-u)+Math.sin(b)*u)*rad*scale*1.06];};
  for(let side=0;side<6;side++)for(let segment=0;segment<2;segment++)for(let ring=0;ring<3;ring++){
   const at=r.count;r.quad(point(side,segment/2,ring/3),point(side,segment/2,(ring+1)/3),point(side,(segment+1)/2,(ring+1)/3),point(side,(segment+1)/2,ring/3),'#455266');
   for(let i=at;i<r.count;i+=9){const light=floorBlobStrength(cx+r.data[i],cz+r.data[i+2],sources);for(let k=0;k<3;k++)r.data[i+6+k]=Math.min(1,base[k]+tint[k]*light);}
  }
  r.markFloor(start);
 }
 // One emitter per luminous facility, shared by the beam and the Blob lightmap.
 function isLightCore(t){
  if(t.coverTile)return false;
  const E=globalThis.ElectricTiles,f=t.electricFacility;
  if(f){
   if(!E?.defs[f.kind]||E.barricadeDefs?.[f.kind])return false;
   const core=E.coreCell(f);return !!core&&core.x===t.x&&core.y===t.y;
  }
  return !!(t.medical||t.shieldTile||t.cashTile||t.shockTile);
 }
 function prepareFloorBlobs(r,cells){
  const sources=[];
  for(const t of cells)if(isLightCore(t))sources.push([x(t.x,t.y),y(t.y)*1.06]);
  const stamp=columnColors()[2]+'|'+sources.map(s=>s.join(',')).sort().join(';');
  if(r.hexBlobStamp!==stamp){for(const [key,mesh]of r.residentMeshes){if(!key.startsWith('hex-floor-blob:'))continue;if(mesh.buffer)r.gl.deleteBuffer(mesh.buffer);if(mesh.poseBuffer)r.gl.deleteBuffer(mesh.poseBuffer);r.residentMeshes.delete(key);}r.hexBlobStamp=stamp;}
  return sources;
 }
 function drawColumns(r){
  if(typeof tiles==='undefined')return;
  const colors=columnColors().join(',')+','+tileNeonColor(0,0)+','+tileNeonColor(1,0);
  if(r.hexColumnColors!==colors){
   for(const [key,mesh] of r.residentMeshes||[]){
    if(!key.startsWith('hex-column:')&&!key.startsWith('hex-circuits:')&&!key.startsWith('hex-tile-beam:')&&!key.startsWith('hex-rim-glow:'))continue;
    if(mesh.buffer)r.gl.deleteBuffer(mesh.buffer);
    if(mesh.poseBuffer)r.gl.deleteBuffer(mesh.poseBuffer);
    r.residentMeshes.delete(key);
   }
   r.hexColumnColors=colors;
  }
  const blobSources=prepareFloorBlobs(r,tiles);
  const enemyBridge=typeof bridgeRoom!=='undefined'&&bridgeRoom&&!globalThis.TileLab?.active?bridgeRoom:null;
  if(enemyBridge&&typeof syncBridgeRoom==='function')syncBridgeRoom();
  const floorKeys=new Set(tiles.map(t=>t.x+','+t.y)),bridgeCells=enemyBridge?enemyBridge.cells.filter(t=>!floorKeys.has(t.x+','+t.y)):[];
  const patterns=globalThis.HexSurfacePattern?.prepare(r,[...tiles,...bridgeCells]);
  const active=new Set(tiles.map(t=>t.x+','+t.y));
  const pending=typeof terrainChange!=='undefined'&&terrainChange?terrainChange.tiles.filter(t=>!active.has(t.x+','+t.y)):[];
  for(const t of [...tiles,...pending]){const kind=t.medical?'medical':t.shieldTile?'shield':t.cashTile?'cash':t.shockTile?'shock':t.coverTile?'cover':'floor',preview=!active.has(t.x+','+t.y),u=preview?Math.min(1,terrainChange.age/.3):1,lift=(preview?-350*(1-u)**3:0)+(globalThis.RoomReady?.liftAt(x(t.x,t.y),y(t.y)*1.06)||0);
   const rarityColor=globalThis.ElectricTiles?.defs[t.electricFacility?.kind]?.rarityColor||'#a8b7b5';
   const facility=t.electricFacility?.kind,core=facility?globalThis.ElectricTiles?.coreCell(t.electricFacility):null,production=core?core.x===t.x&&core.y===t.y:['medical','shield','cash'].includes(kind);
   const neonColor=tileNeonColor(t.x,t.y);
   r.residentMesh('hex-column:'+kind+':'+rarityColor+(production?':base':'')+':'+neonColor,()=>column(r,kind,rarityColor,!!production,neonColor),[1,0,0,x(t.x,t.y),0,1,0,lift,0,0,1,y(t.y)*1.06]);
   const cx=x(t.x,t.y),cz=y(t.y)*1.06;
   if(!preview&&blobSources.some(s=>Math.hypot(cx-s[0],(cz-s[1])/1.06)<TILE*3.2)&&!(typeof terrainHidden==='function'&&terrainHidden(t))){const inset=production?4:1;r.residentMesh('hex-floor-blob:'+t.x+','+t.y+':'+inset,()=>floorBlob(r,blobSources,cx,cz,inset),[1,0,0,cx,0,1,0,lift,0,0,1,cz]);}
   if(!preview&&!(typeof terrainHidden==='function'&&terrainHidden(t)))globalThis.HexSurfacePattern?.draw(r,t,patterns?.get(t.x+','+t.y),lift,production?4:1,typeof time==='number'?time:0);
   const lightCore=isLightCore(t),slowField=globalThis.ElectricTiles?.slowFieldAt(t);
   if(lightCore||slowField){
    const lightColor=lightCore?neonColor:'#b3a1ff';
    r.residentMaterial('hex-rim-glow:'+lightColor+(lightCore?':core':':slow'),()=>tileRimGlow(r,lightColor),[1,0,0,cx,0,1,0,lift,0,0,1,cz],lightCore?.22:.04,4);
   }
   // Underfloor beams belong to every deck cell; core-only lighting applies to the rim.
   const beamColor=slowField&&!lightCore?'#b3a1ff':neonColor;
   const dimBeam=slowField&&!lightCore;
   r.residentMaterial('hex-tile-beam:'+beamColor+(dimBeam?':slow':''),()=>tileBeam(r,beamColor),[1,0,0,cx,0,1,0,lift,0,0,1,cz],dimBeam?.035:.24,4);
   const tower=facility!=='shield_tower'&&globalThis.ElectricTiles?.isDefenseTower(facility)||facility==='repair_turret';
   if(production&&!tower){r.residentMesh('hex-production-base:'+(globalThis.CyberFacilityMeshes?'cyber':'gray'),()=>productionBase(r),[1,0,0,x(t.x,t.y),0,1,0,lift,0,0,1,y(t.y)*1.06]);}
   if(kind!=='floor'&&kind!=='shock'&&kind!=='cover')globalThis.MapIcons?.ground(r,kind,x(t.x,t.y),y(t.y)*1.06,30.4,10.35+(preview?-350*(1-u)**3:0),true);
  }
  for(const t of bridgeCells)globalThis.HexSurfacePattern?.draw(r,t,patterns?.get(t.x+','+t.y),1,1,typeof time==='number'?time:0);
  globalThis.HexSurfacePattern?.finish(r);
 }
 // Finite, tiny impacts confined to the occupied hex tops.
 function drawRainSplashes(r,clock){
  if(typeof tiles==='undefined')return;
  const color='#e1f6ff';
  for(const t of tiles){
   if(typeof terrainHidden==='function'&&terrainHidden(t))continue;
   const cx=x(t.x,t.y),cz=y(t.y)*1.06,lift=globalThis.RoomReady?.liftAt(cx,cz)||0;
   if(lift<-.5)continue;
   const core=t.electricFacility?globalThis.ElectricTiles?.coreCell(t.electricFacility):null;
   const raised=core?core.x===t.x&&core.y===t.y:t.medical||t.shieldTile||t.cashTile;
   const height=(raised?10.6:2.65)+lift;
   for(let j=0;j<3;j++){
    const seed=t.x*127.1+t.y*311.7+j*74.7,hash=n=>{const v=Math.sin(n)*43758.5453;return v-Math.floor(v);};
    const cycle=clock*1.5*(.85+hash(seed+3)*.45)+hash(seed+7),age=cycle-Math.floor(cycle);
    if(age>.62)continue;
    const phase=age/.62,event=seed+Math.floor(cycle)*19.19,angle=hash(event)*Math.PI*2,offset=Math.sqrt(hash(event+1))*12;
    const px=cx+Math.cos(angle)*offset,pz=cz+Math.sin(angle)*offset*1.06,radius=1.2+phase*6.3,alpha=Math.pow(1-phase,.7)*.54;
    for(let n=0;n<8;n++){const a=n*Math.PI/4,b=(n+1)*Math.PI/4,pt=(u,rad)=>[px+Math.cos(u)*rad,height,pz+Math.sin(u)*rad*1.06];r.transparentQuad(pt(a,radius),pt(b,radius),pt(b,Math.max(0,radius-1.05)),pt(a,Math.max(0,radius-1.05)),color,[alpha,alpha,alpha*.3,alpha*.3]);}
    if(phase<.65)for(let n=0;n<3;n++){const a=angle+n*Math.PI*2/3,d=phase*5,xx=px+Math.cos(a)*d,zz=pz+Math.sin(a)*d,h=height+Math.sin(phase/.65*Math.PI)*6.5;
     r.transparentQuad([xx-.65,h,zz],[xx+.65,h,zz],[xx+.45,h+1.8,zz],[xx-.45,h+1.8,zz],color,[alpha,alpha,alpha*.3,alpha*.3]);}
    // Fine satellite droplets travel outward on short ballistic arcs.
    for(let n=0;n<5;n++){
     const scatter=event+n*23.71,life=.48+hash(scatter+2)*.35,u=phase/life;
     if(u>=1)continue;
     const a=angle+n*Math.PI*2/5+(hash(scatter)-.5)*.7,d=u*(4+hash(scatter+1)*3.5);
     const xx=px+Math.cos(a)*d,zz=pz+Math.sin(a)*d*1.06,h=height+4*u*(1-u)*(3.5+hash(scatter+3)*4.5);
     const size=.35+hash(scatter+4)*.3,opacity=alpha*(1-u)*.85;
     r.transparentQuad([xx-size,h,zz],[xx,h-size*.8,zz],[xx+size,h,zz],[xx,h+size*1.5,zz],color,[opacity,opacity,opacity,opacity]);
    }
   }
  }
 }
 function installScene(r){if(typeof StreetScene==='undefined')return;StreetScene.enabled=true;StreetScene.place='abyss';StreetScene.look='violet';
  const camera=r.mapCamera={x:0,z:0,panX:0,panZ:0,time:null};
  const lighting=StreetScene.lighting;StreetScene.lighting=function(render){
   lighting.call(this,render);
   const clock=typeof time==='number'?time:0;
   if(camera.time===null||clock<camera.time){camera.x=0;camera.z=0;camera.time=clock;}
   const dt=Math.max(0,Math.min(.1,clock-camera.time)),blend=1-Math.exp(-dt*2.8),player=typeof p==='undefined'?null:p;
   const targetX=player?player.x-325:0,targetZ=player?(player.y-300)*1.06:0;
   camera.x+=(targetX-camera.x)*blend;camera.z+=(targetZ-camera.z)*blend;camera.time=clock;
   // User size is the sole zoom control; board growth and time never change it.
   render.cameraScale=globalThis.NeonPostFX?.settings.cameraSize??1;
   if(!globalThis.ElectricEditor?.editing){camera.panX=0;camera.panZ=0;}
  };
  const resize=r.resize;r.resize=function(...args){
   resize.apply(this,args);if(!this.vp)return;
   for(let i=0;i<4;i++)this.vp[12+i]-=this.vp[i]*(camera.x+camera.panX)+this.vp[8+i]*(camera.z+camera.panZ);
   // Follow the player at the normal map zoom; the bridge deliberately continues offscreen.
  };
  // Unbuilt cells are empty space. Placement hints belong to ElectricEditor,
  // never to the cached city background that remains visible during combat.
  StreetScene.baseFloor=function(){};
  const hexFloor=StreetScene.baseFloor,cityBuild=StreetScene.build;
  StreetScene.build=function(render,grid,tiles){
   let floorEnd=0,cityStart=0;const mark=render.markPhosphor;
   // Keep the hex floor and city, omit the intervening lift rails, columns and hull.
   this.baseFloor=function(...args){hexFloor.apply(this,args);floorEnd=render.count;};
   render.markPhosphor=function(start,strength){mark.call(this,start,strength);if(strength===.8&&!cityStart)cityStart=this.count;};
   const omitLiftSigns=this.omitLiftSigns;this.omitLiftSigns=true;
   try{cityBuild.call(this,render,grid,tiles);}finally{render.markPhosphor=mark;this.baseFloor=hexFloor;this.omitLiftSigns=omitLiftSigns;}
   if(cityStart<=floorEnd)throw Error('六角场景无法定位电梯底座边界');
   const cityEnd=render.count;render.data.copyWithin(floorEnd,cityStart,cityEnd);render.count=floorEnd+cityEnd-cityStart;
   this.floorGlyphGeometry=new Float32Array();this.glassCircuitGeometry=new Float32Array();this.brandGeometry=new Float32Array();this.glassPanels=[];this.supportColumns=[];this.supportDataRange=[0,0];this.hullCollar=null;
   this.rainCurtainLayers=this.rainCurtainLayers.map(layer=>({...layer,uv:layer.uv.map((v,i)=>i===2?v*.38:v)}));
   // Bring the existing rain sheets in front of the board along the view ray.
   if(this.rainCurtainGeometry){const rain=new Float32Array(this.rainCurtainGeometry),length=Math.hypot(700,440),cy=700/length,cz=440/length;
    for(let i=0;i<rain.length;i+=5){const depth=826.801-rain[i+1]*cy-rain[i+2]*cz,shift=depth-(90+Math.floor(i/30)*105);rain[i+1]+=cy*shift;rain[i+2]+=cz*shift;}this.rainCurtainGeometry=rain;
   }
  };
  const cityDraw=StreetScene.draw;StreetScene.draw=function(render,...args){
   const start=render.transparentCount,glow=render.glow;
   render.glow=function(cx,cy,cz,...rest){if(cy===44&&Math.abs(cx)===(6.5*TILE+26))return;glow.call(this,cx,cy,cz,...rest);};
   try{cityDraw.call(this,render,...args);}finally{render.glow=glow;}
   // Remove the old rectangular deck's wet reflections, retaining city fog and rain.
   let write=start;for(let i=start;i<render.transparentCount;i+=21){const d=render.transparentData,onDeck=[1,8,15].every(j=>d[i+j]>0&&d[i+j]<8);if(!onDeck){d.copyWithin(write,i,i+21);write+=21;}}render.transparentCount=write;
   drawColumns(render);
   if(this.rain)drawRainSplashes(render,this.clock??args[1]??0);
  };
  // Progress fills stay inside the new six-sided footprint.
  r.emissiveSquareScan=function(cx,cz,w,d,progress,color,opacity=1){const p=Math.max(0,Math.min(1,progress));if(!p)return;const cell=cellAt(cx+325,cz/1.06+300),tile=typeof tiles==='undefined'?null:tiles.find(t=>t.x===cell.x&&t.y===cell.y),core=tile?.electricFacility?globalThis.ElectricTiles?.coreCell(tile.electricFacility):null,raised=core?core.x===cell.x&&core.y===cell.y:tile&&(tile.medical||tile.shieldTile||tile.cashTile),height=raised?9.6:2.6,rad=Math.min(w/TILE,d/(TILE*1.06))*(raised?22.8:RADIUS-1.5),end=p*Math.PI*2,angles=[0,end];for(let i=1;i<48;i++)if(i*Math.PI*2/48<end)angles.push(i*Math.PI*2/48);for(let i=0;i<6;i++){const angle=i*Math.PI/3;if(angle>0&&angle<end)angles.push(angle);}angles.sort((a,b)=>a-b);const at=a=>{const theta=a-Math.PI/2,sector=((theta-Math.PI/6)%(Math.PI/3)+Math.PI/3)%(Math.PI/3)-Math.PI/6,len=rad*Math.cos(Math.PI/6)/Math.cos(sector);return [cx+Math.cos(theta)*len,height,cz+Math.sin(theta)*len*1.06];};for(let i=1;i<angles.length;i++){const points=[[cx,height,cz],at(angles[i-1]),at(angles[i]),[cx,height,cz]];if(opacity<1)this.transparentQuad(...points,color,[opacity,opacity,opacity,opacity]);else this.emissiveQuad(...points,color);}};
 }
 const api={isLightCore,floorBlobStrength,SPIKES,fixture,coverContains,coverSegment,moveAxis,turretEdge,turretTrack,slideTurret,drawTurretTracks,steerSpider,moveSpider,TILE,ROW,RADIUS,x,y,cellAt,neighbors,initialFloor,campaignFloor,get campaignMap(){return campaignMap;},inside,outline,canStand,move,transform,plate,column,tileBeam,tileNeonColor,installScene,ready:false};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.HexMap=api;
})(typeof globalThis!=='undefined'?globalThis:this);

'use strict';
// The campaign remains the source of all gameplay. This adapter changes tile geometry only.
(function(root){
 const TILE=54,ROW=TILE*Math.sqrt(3)/2,RADIUS=TILE/Math.sqrt(3);
 const x=(col,row)=>(col+((row&1)-.5)*.5)*TILE,y=row=>row*ROW;
 function cellAt(px,py){const fr=(py-300)/ROW,fq=(px-325+TILE*.25)/TILE-fr/2;let q=Math.round(fq),r=Math.round(fr),s=Math.round(-fq-fr);const dq=Math.abs(q-fq),dr=Math.abs(r-fr),ds=Math.abs(s+fq+fr);if(dq>dr&&dq>ds)q=-r-s;else if(dr>ds)r=-q-s;return {x:q+(r-(r&1))/2,y:r};}
 function neighbors(col,row){const d=row&1;return [[1,0],[-1,0],[d-1,-1],[d,-1],[d-1,1],[d,1]];}
 function inside(t,px,py,padding=0){const dx=Math.abs(px-325-x(t.x,t.y)),dy=Math.abs(py-300-y(t.y));return dx<=TILE/2+padding&&dy<=RADIUS+padding&&Math.sqrt(3)*dy+dx<=TILE+padding*2;}
 const outlines=new WeakMap();
 function outline(cells){
  const signature=cells.map(t=>t.x+','+t.y).join(';'),cached=outlines.get(cells);if(cached?.signature===signature)return cached;
  const occupied=new Set(cells.map(t=>t.x+','+t.y)),edges=[];
  for(const t of cells)for(const [dx,dy]of neighbors(t.x,t.y)){
   if(occupied.has((t.x+dx)+','+(t.y+dy)))continue;
   const cx=325+x(t.x,t.y),cy=300+y(t.y),nx=(x(t.x+dx,t.y+dy)-x(t.x,t.y))/TILE,ny=(y(t.y+dy)-y(t.y))/TILE,mx=cx+nx*TILE/2,my=cy+ny*TILE/2,half=RADIUS/2;
   edges.push({ax:mx-ny*half,ay:my+nx*half,bx:mx+ny*half,by:my-nx*half,nx,ny});
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
 function turretEdge(cells,t){
  if(!['left','right','top','bottom'].includes(t.edge)||!cells.length)return;
  const direction={left:[-1,0],right:[1,0],top:[0,-1],bottom:[0,1]}[t.edge],edges=outline(cells).edges.filter(e=>e.nx*direction[0]+e.ny*direction[1]>.49);if(!edges.length)return;
  const lengths=edges.map(e=>Math.hypot(e.bx-e.ax,e.by-e.ay)),total=lengths.reduce((a,b)=>a+b,0);let along=Math.max(0,Math.min(1,t.slide))*total,index=0;while(index<edges.length-1&&along>lengths[index])along-=lengths[index++];const e=edges[index],f=along/lengths[index];t.x=e.ax+(e.bx-e.ax)*f-e.nx*18;t.y=e.ay+(e.by-e.ay)*f-e.ny*18;
  if(!canStand(cells,t.x,t.y,16)){const at=cells.map(c=>({x:325+x(c.x,c.y),y:300+y(c.y)})).sort((a,b)=>Math.hypot(a.x-t.x,a.y-t.y)-Math.hypot(b.x-t.x,b.y-t.y))[0];if(at){t.x=at.x;t.y=at.y;}}
 }
 function transform(source){
  for(const required of ['function floorPoint(x,y)','function addFloor(n=6)','function syncGrid()','function draw(dt=1/60)'])if(!source.includes(required))throw Error('六角适配缺少原版接口：'+required);
  let s=source.replace(/\b(t|next|a|b)\.x\*TILE\b/g,(_,v)=>'HexMap.x('+v+'.x,'+v+'.y)').replace(/\b(t|next|a|b)\.y\*TILE\b/g,(_,v)=>'HexMap.y('+v+'.y)');
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
   ['for(let i=0;i<4;i++){const a=i*TAU/4;r.emissiveBox(x+Math.cos(a)*20','for(let i=0;i<6;i++){const a=i*TAU/6;r.emissiveBox(x+Math.cos(a)*20']
  ]){if(!s.includes(old))throw Error('六角机关适配无法定位：'+old);s=s.replace(old,replacement);}
  replaceFunction('coverContains','canWalkAt','function coverContains(t,x,y,r=0){return HexMap.coverContains(t,x,y,r); }');
  replaceFunction('coverSegment','firstCoverHit','function coverSegment(t,x,y,endX,endY,r=0){return HexMap.coverSegment(t,x,y,endX,endY,r); }');
  replaceFunction('moveFlywheel','eraseNegative','function moveFlywheel(w,dt){HexMap.moveAxis(tiles,w,dt,FLYWHEEL_SPEED,FLYWHEEL_RADIUS); }');
  replaceFunction('syncTurretEdge','createTurret','function syncTurretEdge(t){HexMap.turretEdge(tiles,t); }');
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
 function plate(r,cx,cz,color,edge,top=2,inset=1){const rad=RADIUS-inset,points=Array.from({length:6},(_,i)=>{const a=Math.PI/6+i*Math.PI/3;return [cx+Math.cos(a)*rad,top,cz+Math.sin(a)*rad*1.06];});const start=r.count;for(let i=0;i<6;i++){const a=points[i],b=points[(i+1)%6];r.quad([cx,top,cz],a,b,[cx,top,cz],color);r.quad(a,b,[b[0],-6,b[2]],[a[0],-6,a[2]],'#253044');}r.markFloor(start);for(let i=0;i<6;i++){const a=points[i],b=points[(i+1)%6],factor=(rad-.7)/rad;r.emissiveQuad(a,b,[cx+(b[0]-cx)*factor,top+.1,cz+(b[2]-cz)*factor],[cx+(a[0]-cx)*factor,top+.1,cz+(a[2]-cz)*factor],edge);}}
 function column(r,kind){
  const rad=RADIUS-1.2,point=(i,h,scale=1)=>{const a=Math.PI/6+i*Math.PI/3;return [Math.cos(a)*rad*scale,h,Math.sin(a)*rad*1.06*scale];};
  const fogMaterial=start=>{for(let i=start;i<r.count;i+=9){const n=Math.hypot(r.data[i+3],r.data[i+4],r.data[i+5])||1,tag=n>1.5&&n<2.5?5:4;for(let j=3;j<6;j++)r.data[i+j]*=tag/n;}};
  // Solid hex shafts descend into the same depth fog as the city's architecture.
  let start=r.count;for(let i=0;i<6;i++){const next=(i+1)%6;for(const [top,bottom]of [[-6,-180],[-180,-520],[-520,-900],[-900,-1250]])r.quad(point(i,top),point(next,top),point(next,bottom),point(i,bottom),i%2?'#3d4762':'#303b55');}
  fogMaterial(start);
  // Separate trim from the shaft and the light from its backing along the face normal.
  for(const i of [0,1,2]){const a=point(i,-12),b=point((i+1)%6,-12),dx=b[0]-a[0],dz=b[2]-a[2],length=Math.hypot(dx,dz),nx=dz/length,nz=-dx/length,at=(u,h,offset)=>[a[0]+dx*u+nx*offset,h,a[2]+dz*u+nz*offset];start=r.count;r.quad(at(.44,-20,.2),at(.56,-20,.2),at(.56,-880,.2),at(.44,-880,.2),'#111c35');fogMaterial(start);start=r.count;r.emissiveQuad(at(.485,-28,.4),at(.515,-28,.4),at(.515,-340,.4),at(.485,-340,.4),i===1?'#6095c9':'#6972bd');fogMaterial(start);}
  const color=kind==='medical'?'#567c70':kind==='shield'?'#4c6b88':kind==='cash'?'#827653':kind==='shock'?'#506e87':kind==='cover'?'#637187':'#627089';
  plate(r,0,0,color,'#7192ad');
  if(kind==='medical'){r.emissiveBox(0,3,0,22,.5,6,'#a4d4bc');r.emissiveBox(0,3,0,6,.5,22,'#a4d4bc');}
  if(kind==='shield'){r.emissiveBox(0,3,-3,20,.5,13,'#96c8e2');r.emissiveBox(0,3,7,12,.5,7,'#96c8e2');}
  if(kind==='cash')for(const [u,v,w,d]of [[0,-8,15,3],[-7,-4,3,8],[0,0,15,3],[7,4,3,8],[0,8,15,3],[0,0,2,24]])r.emissiveBox(u,3,v,w,.4,d,'#eadc91');
 }
 function drawColumns(r){
  if(typeof tiles==='undefined')return;const active=new Set(tiles.map(t=>t.x+','+t.y));
  const pending=typeof terrainChange!=='undefined'&&terrainChange?terrainChange.tiles.filter(t=>!active.has(t.x+','+t.y)):[];
  for(const t of [...tiles,...pending]){const kind=t.medical?'medical':t.shieldTile?'shield':t.cashTile?'cash':t.shockTile?'shock':t.coverTile?'cover':'floor',preview=!active.has(t.x+','+t.y),u=preview?Math.min(1,terrainChange.age/.3):1,lift=preview?-350*(1-u)**3:0;
   r.residentMesh('hex-column:'+kind,()=>column(r,kind),[1,0,0,x(t.x,t.y),0,1,0,lift,0,0,1,y(t.y)*1.06]);
  }
 }
 function installScene(r){if(typeof StreetScene==='undefined')return;StreetScene.enabled=true;StreetScene.place='abyss';StreetScene.look='violet';
  const camera={x:0,z:0,time:null};
  const lighting=StreetScene.lighting;StreetScene.lighting=function(render){
   lighting.call(this,render);
   const clock=typeof time==='number'?time:0;
   if(camera.time===null||clock<camera.time){camera.x=0;camera.z=0;camera.time=clock;}
   const dt=Math.max(0,Math.min(.1,clock-camera.time)),blend=1-Math.exp(-dt*2.8),player=typeof p==='undefined'?null:p;
   const targetX=player?Math.max(-48,Math.min(48,(player.x-325)*.22)):0,targetZ=player?Math.max(-30,Math.min(30,(player.y-300)*1.06*.18)):0;
   camera.x+=(targetX-camera.x)*blend;camera.z+=(targetZ-camera.z)*blend;camera.time=clock;
   // Frame the unlocked columns around the smoothed focus, including breathing clearance.
   const cells=typeof tiles==='undefined'?[]:tiles,extent=cells.reduce((edge,t)=>Math.max(edge,Math.abs(x(t.x,t.y)-camera.x)+TILE/2+10),0),framing=Math.max(.9,extent/(13*TILE/2));
   render.cameraScale*=framing*(1+.012*Math.sin(clock*Math.PI*2/7));
  };
  const resize=r.resize;r.resize=function(...args){resize.apply(this,args);if(!this.vp)return;for(let i=0;i<4;i++)this.vp[12+i]-=this.vp[i]*camera.x+this.vp[8+i]*camera.z;};
  StreetScene.baseFloor=function(render,grid,tiles){for(let row=grid.minY;row<=grid.maxY;row++)for(let col=grid.minX;col<=grid.maxX;col++){
   if(tiles.some(t=>t.x===col&&t.y===row))continue;const cx=x(col,row),cz=y(row)*1.06,rad=RADIUS-1.2;
   for(let i=0;i<6;i++){const at=(j,scale)=>{const a=Math.PI/6+j*Math.PI/3;return [cx+Math.cos(a)*rad*scale,1,cz+Math.sin(a)*rad*1.06*scale];};render.emissiveQuad(at(i,1),at(i+1,1),at(i+1,.984),at(i,.984),'#37365c');}
  }};
  const hexFloor=StreetScene.baseFloor,cityBuild=StreetScene.build;
  StreetScene.build=function(render,grid,tiles){
   let floorEnd=0,cityStart=0;const mark=render.markPhosphor;
   // Keep the hex floor and city, omit the intervening lift rails, columns and hull.
   this.baseFloor=function(...args){hexFloor.apply(this,args);floorEnd=render.count;};
   render.markPhosphor=function(start,strength){mark.call(this,start,strength);if(strength===.8&&!cityStart)cityStart=this.count;};
   try{cityBuild.call(this,render,grid,tiles);}finally{render.markPhosphor=mark;this.baseFloor=hexFloor;}
   if(cityStart<=floorEnd)throw Error('六角场景无法定位电梯底座边界');
   const cityEnd=render.count;render.data.copyWithin(floorEnd,cityStart,cityEnd);render.count=floorEnd+cityEnd-cityStart;
   this.floorGlyphGeometry=new Float32Array();this.glassCircuitGeometry=new Float32Array();this.brandGeometry=new Float32Array();this.glassPanels=[];this.supportColumns=[];this.supportDataRange=[0,0];this.hullCollar=null;
   // The old rain planes crossed the long shafts. Move them away along the view ray;
   // orthographic screen positions and UV animation stay unchanged, with correct occlusion.
   if(this.rainCurtainGeometry){const rain=new Float32Array(this.rainCurtainGeometry),length=Math.hypot(700,440);for(let i=0;i<rain.length;i+=5){rain[i+1]-=700/length*1000;rain[i+2]-=440/length*1000;}this.rainCurtainGeometry=rain;}
  };
  const cityDraw=StreetScene.draw;StreetScene.draw=function(render,...args){
   const start=render.transparentCount,glow=render.glow;
   render.glow=function(cx,cy,cz,...rest){if(cy===44&&Math.abs(cx)===(6.5*TILE+26))return;glow.call(this,cx,cy,cz,...rest);};
   try{cityDraw.call(this,render,...args);}finally{render.glow=glow;}
   // Remove the old rectangular deck's wet reflections, retaining city fog and rain.
   let write=start;for(let i=start;i<render.transparentCount;i+=21){const d=render.transparentData,onDeck=[1,8,15].every(j=>d[i+j]>0&&d[i+j]<8);if(!onDeck){d.copyWithin(write,i,i+21);write+=21;}}render.transparentCount=write;
   drawColumns(render);
  };
  // Progress fills stay inside the new six-sided footprint.
  r.emissiveSquareScan=function(cx,cz,w,d,progress,color){const p=Math.max(0,Math.min(1,progress));if(!p)return;const rad=Math.min(w/TILE,d/(TILE*1.06))*(RADIUS-1.5),end=p*Math.PI*2,angles=[0,end];for(let i=1;i<48;i++)if(i*Math.PI*2/48<end)angles.push(i*Math.PI*2/48);for(let i=0;i<6;i++){const angle=i*Math.PI/3;if(angle>0&&angle<end)angles.push(angle);}angles.sort((a,b)=>a-b);const at=a=>{const theta=a-Math.PI/2,sector=((theta-Math.PI/6)%(Math.PI/3)+Math.PI/3)%(Math.PI/3)-Math.PI/6,len=rad*Math.cos(Math.PI/6)/Math.cos(sector);return [cx+Math.cos(theta)*len,2.6,cz+Math.sin(theta)*len*1.06];};for(let i=1;i<angles.length;i++)this.emissiveQuad([cx,2.6,cz],at(angles[i-1]),at(angles[i]),[cx,2.6,cz],color);};
 }
 const api={SPIKES,fixture,coverContains,coverSegment,moveAxis,turretEdge,TILE,ROW,RADIUS,x,y,cellAt,neighbors,inside,outline,canStand,move,transform,plate,column,installScene,ready:false};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.HexMap=api;
})(typeof globalThis!=='undefined'?globalThis:this);

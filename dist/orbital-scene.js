'use strict';
// Space-elevator study built against tests/orbital-elevator-concept.png.
// Only billboard artwork is raster; architecture, trusses, weather and traffic are meshes.
(()=>{
 const base={build:StreetScene.build,draw:StreetScene.draw,lighting:StreetScene.lighting},revision=Object.getOwnPropertyDescriptor(StreetScene,'revision').get;
 const hash=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
 const ext=g=>({b:(g.minY-.5)*54*1.06,f:(g.maxY+.5)*54*1.06,e:(g.maxX+.5)*54});
 StreetScene.names.abyss='太空电梯 · 夜城';
 Object.defineProperty(StreetScene,'revision',{get(){return this.place==='abyss'?'orbital-34-'+this.look:revision.call(this);},configurable:true});
 Object.assign(StreetScene,{
  lighting(r){base.lighting.call(this,r);if(this.place==='abyss'){r.scenePerspective=false;r.cameraScale=1;r.sceneGrade=.25;r.sceneFogDensity=.00065;r.sceneFogColor=this.look==='green'?[.025,.32,.19]:this.look==='blue'?[.08,.025,.5]:[.105,.095,.48];r.topLight=[.65,.72,.85];r.rearLeftColor=[.16,.52,.72];r.rearRightColor=[.46,.34,.48];r.clubCyan=.65;r.clubMagenta=.35;}},
  // Flat-section member: width lies IN the truss plane; thickness lies normal to it.
  flatBeam(r,a,b,width,thickness,col,normal=[0,0,1]){
   const d=b.map((v,i)=>v-a[i]),len=Math.hypot(...d);if(len<.001)return;const t=d.map(v=>v/len),s=[t[1]*normal[2]-t[2]*normal[1],t[2]*normal[0]-t[0]*normal[2],t[0]*normal[1]-t[1]*normal[0]],sl=Math.hypot(...s)||1,u=s.map(v=>v/sl),v=[t[1]*u[2]-t[2]*u[1],t[2]*u[0]-t[0]*u[2],t[0]*u[1]-t[1]*u[0]];
   const pts=[];for(const p of [a,b])for(const [su,sv]of [[-1,-1],[1,-1],[1,1],[-1,1]])pts.push(p.map((x,i)=>x+u[i]*width*.5*su+v[i]*thickness*.5*sv));
   for(const f of [[0,3,2,1],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]])r.quad(...f.map(i=>pts[i]),col);
  },
  steelTube(r,a,b,radius,col){
   const d=b.map((x,i)=>x-a[i]),len=Math.hypot(...d)||1,t=d.map(v=>v/len),axis=Math.abs(t[1])>.9?[0,0,1]:[0,1,0],s=[t[1]*axis[2]-t[2]*axis[1],t[2]*axis[0]-t[0]*axis[2],t[0]*axis[1]-t[1]*axis[0]],sl=Math.hypot(...s)||1,u=s.map(x=>x/sl),v=[t[1]*u[2]-t[2]*u[1],t[2]*u[0]-t[0]*u[2],t[0]*u[1]-t[1]*u[0]],at=(p,n)=>p.map((x,i)=>x+radius*(Math.cos(n*Math.PI/4)*u[i]+Math.sin(n*Math.PI/4)*v[i]));
   for(let j=0;j<8;j++){r.quad(at(a,j),at(a,j+1),at(b,j+1),at(b,j),col);r.quad(a,at(a,j+1),at(a,j),a,col);r.quad(b,at(b,j),at(b,j+1),b,col);}
  },
  build(r,grid,tiles){if(this.place!=='abyss')return base.build.call(this,r,grid,tiles);
   const {b,f,e}=ext(grid),p=this.palette;this.baseFloor(r,grid,tiles);const deckEnd=r.count;
   // A quiet, wet-looking slate deck; all large supporting walls/halos are gone.
   for(let i=0;i<deckEnd;i+=9){const n=Math.hypot(r.data[i+3],r.data[i+4],r.data[i+5]);if(n>1.5&&n<2.5)continue;const l=r.data[i+6]*.2126+r.data[i+7]*.7152+r.data[i+8]*.0722;for(let c=0;c<3;c++)r.data[i+6+c]=l*[.7,.72,1][c]*.91;}
   const floorGlyphs=[];this.inactiveFloorCells=[];
   for(let y=grid.minY;y<=grid.maxY;y++)for(let x=grid.minX;x<=grid.maxX;x++)if(!tiles.some(t=>t.x===x&&t.y===y)){
    // Stable per-cell atlas choice: ONE large engraved emblem, with quiet margins.
    const seed=(x-grid.minX)*139+(y-grid.minY)*73,col=Math.floor(hash(seed+41)*8),row=Math.floor(hash(seed+67)*7),turn=Math.floor(hash(seed+89)*4);
    this.inactiveFloorCells.push({x,y,col,row,turn});
    for(const [u,v]of [[0,0],[1,0],[1,1],[0,0],[1,1],[0,1]]){
     const [a,c]=turn===0?[u,v]:turn===1?[v,1-u]:turn===2?[1-u,1-v]:[1-v,u];
     floorGlyphs.push(x*54+(u-.5)*27,.55,y*54*1.06+(v-.5)*30,(col+.08+a*.84)/8,(row+.08+c*.84)/7);
    }
   }
   this.floorGlyphGeometry=new Float32Array(floorGlyphs);
   const beam=(...args)=>this.flatBeam(r,...args);
   // Frameless glass balustrade: small black clamps and illuminated pane edges.
   const railStart=r.count;this.glassPanels=[];
   const sides=[{a:[-e-19,0,b-19],b:[e+19,0,b-19]},{a:[-e-19,0,f+19],b:[e+19,0,f+19]},{a:[-e-19,0,b-19],b:[-e-19,0,f+19]},{a:[e+19,0,b-19],b:[e+19,0,f+19]}];
   for(const side of sides){
    const dx=side.b[0]-side.a[0],dz=side.b[2]-side.a[2],len=Math.hypot(dx,dz),segments=Math.ceil(len/130),pt=(u,y)=>[side.a[0]+dx*u,y,side.a[2]+dz*u];
    // Retain only the low load-bearing rim below the walking surface.
    beam(pt(0,-16),pt(1,-16),22,3,'#222131',dx?[0,0,1]:[1,0,0]);
    for(const y of [-26,-6])beam(pt(0,y),pt(1,y),3,13,'#393046',dx?[0,0,1]:[1,0,0]);
    for(let j=0;j<segments;j++){
     const u=(j+.012)/segments,v=(j+.988)/segments,a=pt(u,6),b2=pt(v,6),c=pt(v,78),d=pt(u,78),front=side.a[2]===f+19&&dz===0;
     this.glassPanels.push({corners:[a,b2,c,d],front,alpha:front?.095:.135});
     for(const [p,q]of [[a,b2],[b2,c],[c,d],[d,a]]){const start=r.count;beam(p,q,2,1,'#a185ff');r.markEmissive(start);}
     // No posts or central horizontal pipes. Two compact bottom clamps per pane.
     for(const t of [.18,.82]){const [x,,z]=pt(u+(v-u)*t,0);r.box(x,3,z,9,6,9,'#222032');r.box(x,9,z,dx?5:8,10,dx?8:5,'#30273e');}
    }
   }
   // A resident texture overlay on the actual glass planes, not on a screen layer.
   const circuits=[];let travel=0;
   for(const pane of this.glassPanels){
    const [a,b2,c,d]=pane.corners,len=Math.hypot(b2[0]-a[0],b2[2]-a[2]),side=a[0]===b2[0],offset=side?[Math.sign(a[0])*.35,0,0]:[0,0,a[2]===f+19?.35:-.35];
    for(const [u,v]of [[0,0],[1,0],[1,1],[0,0],[1,1],[0,1]]){const pos=a.map((x,i)=>x+(b2[i]-x)*u+(d[i]-x)*v+offset[i]);circuits.push(...pos,u*len/460,v*72/460,travel);}
    travel+=len/115*1.7;
   }
   this.glassCircuitGeometry=new Float32Array(circuits);
   r.markFloor(railStart);
   // A single continuous black steel structure replaces separate white rails/black legs.
   const supportStart=r.count,steel='#64677c',edge='#8e91a8';this.supportColumns=[];
   const upright=(x,y,z,w,h)=>{r.box(x,y,z,w,h,12,steel);for(const side of [-1,1])r.box(x+side*(w/2-2),y,z,4,h,18,edge);};
   for(const side of [-1,1])for(const z of [b-24,f+24]){
    const x=side*(e+26);upright(x,-425,z,46,3350);this.supportColumns.push({x,z,bottom:-2100,top:1250,width:46});
    // Carriages and joints use the same dark metal, connected to the same member.
    r.box(x,20,z,56,84,25,'#555d74');r.box(x,20,z+14,43,62,5,'#73768b');
    for(const yy of [-32,72])r.box(x,yy,z,58,10,29,edge);
    r.emissiveBox(x,44,z+18,7,15,1,'#c176ff');
   }
   for(const side of [-1,1]){
    const inner=side*(e+26),outer=side*(e+137),z=b-24;upright(outer,-425,z,46,3350);
    for(const y of [130,350,570,790,1010]){r.box((inner+outer)/2,y,z,157,32,12,steel);r.box((inner+outer)/2,y+14,z,157,4,18,edge);}
   }
   r.markFloor(supportStart);this.supportDataRange=[supportStart,r.count];
   // Cut, stepped load-bearing hull. No billboard backing or illustrated fascia.
   const baseStart=r.count;
   // A solid collar overlaps deck underside and hull: no open horizontal slit.
   const collarStart=r.count;r.box(0,-38,(b+f)/2,e*2+48,76,f-b+88,steel);this.hullCollar={start:collarStart,top:0,bottom:-76,front:f+44,back:b-44};
   const section=(y,hw,back,front,cut)=>[[-hw+cut,y,front],[hw-cut,y,front],[hw,y,front-cut],[hw,y,back+cut],[hw-cut,y,back],[-hw+cut,y,back],[-hw,y,back+cut],[-hw,y,front-cut]];
   const sections=[section(0,e+24,b-25,f+40,36),section(-85,e+24,b-25,f+40,36),section(-130,e-5,b+5,f+12,58),section(-365,e-5,b+5,f+12,58),section(-420,e-45,b+36,f-18,78),section(-465,e-26,b+22,f-3,64),section(-600,e-70,b+60,f-40,75),section(-650,e-100,b+85,f-65,70)];
   for(let j=0;j<sections.length-1;j++)for(let k=0;k<8;k++)r.quad(sections[j][k],sections[j][(k+1)%8],sections[j+1][(k+1)%8],sections[j+1][k],j===1||j===3||j===6?'#a8aac0':k%2?'#858ba3':'#7b819a');
   // Asymmetrical overlapping armor plates and dark recessed intake slots.
   for(const side of [-1,1]){
    const x=side*(e-66);r.quad([x-side*23,-144,f+16],[x+side*23,-144,f+16],[x+side*23,-320,f+16],[x-side*9,-350,f+16],'#79829c');
    for(let n=0;n<4;n++)r.box(side*(125+n*33),-501,f-3,23,27,5,'#0b1525');
    beam([side*(e-27),-91,f+43],[side*(e-56),-128,f+15],9,5,'#92a2af');
   }
   r.markFloor(baseStart);
   // Continuous neon follows actual bevel edges, interrupted at armor overlaps.
   const neonStart=r.count;for(const index of [1,4,7]){const ring=sections[index];for(let k=0;k<8;k++){const a=ring[k],b2=ring[(k+1)%8];beam([a[0],a[1]-2,a[2]+2],[b2[0],b2[1]-2,b2[2]+2],index===4?4:2.5,1,index===4?'#dc5cda':'#55d4ed');}}
   r.markPhosphor(neonStart,.8);
   // Generated alpha wordmark on the actual vertical wall. Native aspect, no camera compensation.
   const bx=0,by=-245,bz=f+12.35,bw=480,bh=160,brand=[];
   for(const [u,v]of [[0,0],[1,0],[1,1],[0,0],[1,1],[0,1]])brand.push(bx+(u-.5)*bw,by+(.5-v)*bh,bz,u,v);
   this.brandGeometry=new Float32Array(brand);
   const clock=[];for(const [u,v]of [[0,0],[1,0],[1,1],[0,0],[1,1],[0,1]])clock.push((u-.5)*260,255+(.5-v)*260*(440/Math.hypot(700,440)),b-110-(.5-v)*260*(700/Math.hypot(700,440)),u,v);this.worldClockGeometry=new Float32Array(clock);
   // City profiles have setbacks, chamfered corners, offset crowns and annexes.
   const towers=[[-575,-140,b-260,190,1700,190],[560,-90,b-380,185,2000,180],[-535,-330,f+275,190,2050,165],[570,-440,f+390,225,2300,195],[-300,250,b-1050,235,2600,230],[230,450,b-1320,250,2850,230],[-840,60,b-770,245,2700,240],[900,140,b-940,270,2950,250],[-750,-720,f+850,270,2350,250],[810,-850,f+970,290,2500,270],[-90,730,b-1930,265,3200,245],[80,240,b-940,160,2450,160],[650,800,b-2250,290,3500,270]];
   // A continuous small-scale city under the entire lift, arranged in real depth.
   const lowerCity=[];for(let row=0;row<8;row++)for(let col=0;col<9;col++){
    const seed=row*139+col*73,x=-760+col*185+(row%2)*38+(hash(seed)-.5)*34,y=-1440-(row%3)*170-hash(seed+29)*160,screenDepth=row===6&&col===4?730:-660+row*215+(hash(seed+11)-.5)*65,z=(screenDepth+y*(440/Math.hypot(700,440)))/(700/Math.hypot(700,440)),w=95+hash(seed+13)*52,h=400+hash(seed+19)*510,d=90+hash(seed+23)*58;
    lowerCity.push({x,y,z,w,h,d,row,col});towers.push([x,y,z,w,h,d]);
   }
   this.lowerCityTops=lowerCity.map(({x,y,z})=>[x,y,z]);
   const posters=[],stats=this.orbitalStats={windows:0,lightBands:0,landmarks:3,lowerCityBuildings:72,lowerCitySpheres:6,cityBridges:0,towers:towers.length,structuralRings:0,frameThickness:3,frameMemberWidth:10,trafficCars:98,roundTowers:0,trafficMode:'airborne',roadMeshes:0,facadeWaterfalls:0,facadeCuts:0,facadeKinks:0,facadeGlitches:0,guardrail:'neon-glass',glassPanels:this.glassPanels.length,glassHeight:78,outerFrame:'open-industrial-gantry',brand:'generated-transparent-cyber-wordmark',supportStyle:'continuous-lit-charcoal-steel',baseDepth:650,baseLayers:8,baseNeonEdges:24,facetedTowers:0,windowPanes:0,darkBands:0,bandWidths:[],rectangularRingLights:0,holograms:3,nearTrafficCars:18};
   const sceneStart=r.count;this.facadeAttachments=[];
   // Derive lights directly from the exact wall quad, using an orthonormal face basis.
   const attach=(face,wallStart,u,v,width,height,color,kind='window')=>{
    const [a,b,c,d]=face,sub=(a,b)=>a.map((x,i)=>x-b[i]),dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],unit=a=>{const l=Math.hypot(...a);return a.map(x=>x/l);},U=unit(sub(b,a)),N=unit(Array.from(r.data.slice(wallStart+3,wallStart+6))),V=unit(cross(U,N));
    const at=(u,v)=>a.map((x,i)=>(1-v)*(x+(b[i]-x)*u)+v*(d[i]+(c[i]-d[i])*u)),center=at(u,v),corners=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([s,t])=>center.map((x,i)=>x+U[i]*width*.5*s+V[i]*height*.5*t+N[i]*.35));
    // Reject rectangles crossing a bevel, floor step or edge of this wall face.
    const poly=face.map(p=>[dot(sub(p,a),U),dot(sub(p,a),V)]),inside=p=>{const q=[dot(sub(p,a),U),dot(sub(p,a),V)];let sign=0;for(let j=0;j<4;j++){const x=poly[j],y=poly[(j+1)%4],s=(y[0]-x[0])*(q[1]-x[1])-(y[1]-x[1])*(q[0]-x[0]);if(Math.abs(s)<.001)continue;const side=Math.sign(s);if(sign&&side!==sign)return false;sign=side;}return true;};
    if(!corners.every(inside))return false;const start=r.count;r.emissiveQuad(...corners,color);this.facadeAttachments.push({start,wallStart,kind});return true;
   };

   const cutLight=(face,wallStart,u0,v0,u1,v1,color,kind='cut-light')=>{
    const [a,b,c,d]=face,normal=Array.from(r.data.slice(wallStart+3,wallStart+6)),at=(u,v)=>a.map((x,i)=>(1-v)*(x+(b[i]-x)*u)+v*(d[i]+(c[i]-d[i])*u)+normal[i]*.35),p=at(u0,v0),q=at(u1,v1),t=q.map((x,i)=>x-p[i]),length=Math.hypot(...t),side=[normal[1]*t[2]-normal[2]*t[1],normal[2]*t[0]-normal[0]*t[2],normal[0]*t[1]-normal[1]*t[0]].map(x=>x/length*1.7),offset=(p,s)=>p.map((x,i)=>x+side[i]*s),start=r.count;
    r.emissiveQuad(offset(p,-1),offset(q,-1),offset(q,1),offset(p,1),color);this.facadeAttachments.push({start,wallStart,kind});
   };
   this.towerOrientations=[];
   for(let k=0;k<towers.length;k++){
    const towerStart=r.count,posterStart=posters.length;
    const [x,top,z,w,h,d]=towers[k],bottom=top-h,style=k%4,round=style===3||k===10;if(round)stats.roundTowers++;else stats.facetedTowers++;
    const widths=style===0?[1.18,1.06,1,.83,.66]:style===1?[1.12,1.12,.85,.85,.61]:style===2?[1.18,.99,.99,.76,.76]:[1.12,1.02,.91,.82,.69];
    const levelAt=y=>Math.max(0,Math.min(4,Math.floor((y-bottom)/h*5))),profile=y=>{const j=levelAt(y);return {w:w*widths[j],d:d*(.75+widths[j]*.25),dx:(style===1?1:style===2?-1:0)*j*w*.055};};
    for(let j=0;j<5;j++){
     const yy=bottom+j*h/5,pp=profile(yy+h/10),cx=x+pp.dx,hw=pp.w/2,hd=pp.d/2,cut=Math.min(hw,hd)*(.26+(k%3)*.06);
     const ring=round?Array.from({length:16},(_,j)=>[Math.cos(j*Math.PI/8)*hw,Math.sin(j*Math.PI/8)*hd]):[[-hw+cut,-hd],[hw-cut,-hd],[hw,-hd+cut],[hw,hd-cut],[hw-cut,hd],[-hw+cut,hd],[-hw,hd-cut],[-hw,-hd+cut]];
     const taper=round?1:.73+(j%2)*.16,lean=round?0:(k%2?1:-1)*w*.065;
     // Every wall is planar; its crown and setbacks supply the cut silhouette.
     const low=ring.map(([a,b])=>[cx+a,yy,z+b]),high=ring.map(([a,b])=>[cx+a*taper+lean,yy+h/5,z+b*taper]),light=k%5===0?'#e9ba8b':k%5===1?'#57c9f5':k%5===2?'#779cff':k%5===3?'#9cb9f7':'#ca91d4';
     for(let n=0;n<ring.length;n++){
      const next=(n+1)%ring.length,face=[low[n],low[next],high[next],high[n]],wallStart=r.count;r.quad(...face,n%3===0?'#485879':n%3===1?'#23344f':'#35496b');
      const dx=low[next][0]-low[n][0],dz=low[next][2]-low[n][2],fw=Math.hypot(dx,dz),front=-dx/fw;
      const feature=front>.95&&[4,5,10,11,12,14].includes(k),rows=Math.max(2,Math.floor(h/5/39));
      for(let row=0;row<rows;row++){
       if(feature)break;
       const v=(row+.5)/rows,seed=hash(k*915+j*157+row*83),thick=2+hash(row*87+j*11+k)*15;
       if(seed<.32){if(front>.88)stats.darkBands++;continue;}
       if(seed>.69){if(attach(face,wallStart,.5,v,fw*taper*.86,thick,light,'band')){stats.lightBands++;stats.bandWidths.push(thick);}}
       if(front>.88&&seed<.77){const cols=round?2:5,ww=fw*taper/(cols+1)*(.42+seed*.18),hh=7+hash(k*73+row+j*91)*10;
        for(let col=0;col<cols;col++){if(hash(k*171+j*181+row*11+col*31)<.24)continue;const shade=(row+col+k)%5===0?'#dfb59e':(row+col+k)%5===1?'#70c9e9':(row+col+k)%5===2?'#728dce':(row+col+k)%5===3?'#8cace9':'#b69cd3';if(attach(face,wallStart,(col+1)/(cols+1),v,ww,hh,shade)){stats.windows++;stats.windowPanes++;}}
       }
      }
      // Landmark facades: cascading light curtains and diagonal cuts on real wall faces.
      if(!round&&front>.95&&[4,12].includes(k))attach(face,wallStart,.5,.5,fw*taper*.72,h/5*.84,k===4?'#56b9e6':'#a481ff','waterfall');
      if(!round&&front>.95&&[5,14].includes(k)){
       cutLight(face,wallStart,.12,.12,.85,.88,'#f89ccd');cutLight(face,wallStart,.72,.12,.28,.86,'#96a9ff');
      }
      if(k===11&&front>.95)attach(face,wallStart,.5,.5,fw*taper*.86,h/5*.94,'#7951d8','glitch');
      if(k===10&&front>.95){for(const u of [.18,.39,.6,.81]){const points=[[u,.04],[u,.30],[u+.055,.42],[u+.055,.66],[u-.035,.78],[u-.035,.96]];for(let n=1;n<points.length;n++)cutLight(face,wallStart,...points[n-1],...points[n],u<.5?'#c2a3ff':'#e5b7e9','kink-light');}}
      // Large colored glazing lies on this same plane rather than floating in front.
      if(!round&&front>.95&&j===4&&!feature){if(attach(face,wallStart,.23,.56,fw*taper*.2,h/5*.56,k%2?'#54519a':'#246e96','panel'))stats.windowPanes++;}
     }
     for(let n=1;n<ring.length-1;n++)r.quad(high[0],high[n],high[n+1],high[0],'#596c86');
    }
    const crown=profile(top-1),cx=x+crown.dx;
    r.box(cx,top+13,z,crown.w*.8,25,crown.d*.8,'#60718a');r.box(cx-w*.12,top+39,z+12,w*.25,34,d*.27,'#718196');
    if(style===0||style===3){r.sphere(cx+w*.28,top-160,z-d*.1,w*.26,'#415c76',1,3.3,.9,8,12);r.box(cx+w*.28,top+10,z-d*.1,13,110,13,'#8c9bae');}
    if(style===1){r.box(cx+w*.43,top-140,z-d*.15,w*.32,320,d*.6,'#546a82');r.box(cx+w*.43,top+27,z-d*.15,w*.34,14,d*.62,'#92a0ad');}
    for(let a=0;a<2+k%3;a++){const ax=cx+(a-1)*w*.18,hh=65+hash(k*37+a)*150;r.box(ax,top+hh/2+20,z-20,3,hh,3,'#91a5b9');r.emissiveBox(ax,top+hh+21,z-20,5,4,5,a%2?'#fb7f9a':'#82d7e9');}
    // Large generated advertising art replaces all improvised dot-matrix lettering.
    if([0,1,2,8].includes(k)){
     const width=w*.68,height=width*2.9,cy=top-height*.65-35-(k===5?220:k===10?1000:k===12?850:0),pf=profile(cy-height*.25),pz=z+Math.max(pf.d,d*1.05)/2+8,px=x+pf.dx;
     r.box(px,cy,pz-3,width+10,height+10,7,'#152438');posters.push({x:px,y:cy,z:pz+1,w:width,h:height,slot:k===4?0:k===5?1:k===12?3:k%4,yaw:0});
     for(const side of [-1,1])r.emissiveBox(px+side*(width/2+3),cy,pz+2,1.8,height+5,1,k%2?'#dc6da9':'#6dbed5');
    }
    // Rotate the complete building, including facade details, crowns and ad frames.
    // Independent angles expose side walls without tilting the vertical skyline.
    const yaw=(k%2?1:-1)*(.24+hash(k*53+17)*.48),cs=Math.cos(yaw),sn=Math.sin(yaw);
    for(let i=towerStart;i<r.count;i+=9){
     const px=r.data[i]-x,pz=r.data[i+2]-z,nx=r.data[i+3],nz=r.data[i+5];
     r.data[i]=x+px*cs+pz*sn;r.data[i+2]=z-px*sn+pz*cs;
     r.data[i+3]=nx*cs+nz*sn;r.data[i+5]=-nx*sn+nz*cs;
    }
    for(let i=posterStart;i<posters.length;i++){const q=posters[i],px=q.x-x,pz=q.z-z;q.x=x+px*cs+pz*sn;q.z=z-px*sn+pz*cs;q.yaw+=yaw;}
    this.towerOrientations.push({x,z,yaw,top,bottom,w,h,d,start:towerStart,end:r.count});
   }
   // Three recognizable skyline silhouettes: observation spheres, needle and terraced drum.
   const litSphere=(x,y,z,rr,sx,sy,sz,rings,segments,color)=>{
    const at=(i,j)=>{const a=i*Math.PI/rings,b=j*Math.PI*2/segments;return [x+Math.sin(a)*Math.cos(b)*rr*sx,y+Math.cos(a)*rr*sy,z+Math.sin(a)*Math.sin(b)*rr*sz];};
    for(let i=0;i<rings;i++)for(let j=0;j<segments;j++){const face=[at(i,j),at(i,j+1),at(i+1,j+1),at(i+1,j)],start=r.count;r.quad(face[0],face[3],face[2],face[1],'#415c79');
     // A sphere's latitude quad is planar; use the actual facet, with no oversized hoop.
     if(i>1&&i<rings-2&&i%3===1){const width=Math.hypot(...face[1].map((v,n)=>v-face[0][n]))*.82;if(attach(face,start,.5,.5,width,2.2,color,'sphere-band'))stats.lightBands++;}
    }
   };
   // Slender tripod shaft and two separated spherical observation decks.
   const tx=-470,tz=b-750;
   for(const dx of [-35,0,35])beam([tx+dx,-2200,tz],[tx+dx*.25,290,tz],14,14,'#66768a');
   for(const [yy,rr]of [[-300,112],[175,92]])litSphere(tx,yy,tz,rr,1,.82,1,16,32,'#ffc780');
   beam([tx,250,tz],[tx,460,tz],8,8,'#97a2b3');r.emissiveBox(tx,438,tz,5,38,5,'#ff9a65');
   // Tapered needle with cyan outline and sloping crown.
   const nx=440,nz=b-1250;for(let j=0;j<9;j++){const yy=-2200+j*290,ww=180-j*14;r.box(nx,yy+145,nz,ww,290,ww*.72,'#334965');if(j%3!==1){r.emissiveBox(nx,yy+255,nz+ww*.36+1,ww*.66,10+j*2,1,j%2?'#68bce9':'#df8bc9');stats.lightBands++;}}
   for(const side of [-1,1])beam([nx+side*27,410,nz+30],[nx,740,nz],3,3,'#81dcff');
   // Rounded stacks: changing diameters create a curved silhouette and continuous floors.
   const stackStart=r.count,dx=790,dz=b-420;for(let j=0;j<14;j++){const yy=-1950+j*155,rr=125*Math.sin((j/18+.15)*Math.PI);litSphere(dx,yy,dz,rr,1,.7,.85,8,24,'#e2b4fb');}
   this.stackedLandmarkRange=[stackStart,r.count];
   // Spherical civic buildings and slender stems, spread across the lower city.
   this.lowerCitySpheres=[];for(const index of [4,15,28,40,57,58]){
    const q=lowerCity[index],rr=48+hash(index*91)*23,cy=q.y+rr*.55;litSphere(q.x,cy,q.z,rr,1,.9,1,12,24,index%2?'#f3a5c9':'#89dce7');
    beam([q.x,q.y-120,q.z],[q.x,cy-rr*.65,q.z],14,14,'#465b7b');this.lowerCitySpheres.push([q.x,cy,q.z,rr]);
   }
   // Enclosed pedestrian skybridges belong to the city, independent of airborne cars.
   this.lowerCityBridges=[];
   for(let row=0;row<8;row++)for(let col=0;col<8;col++){
    if(hash(row*97+col*61)<.62&&!(row===6&&col===4))continue;
    const a=lowerCity[row*9+col],b2=lowerCity[row*9+col+1],y=Math.min(a.y,b2.y)-65,start=[a.x+a.w*.28,y,a.z],end=[b2.x-b2.w*.28,y,b2.z],dx=end[0]-start[0],dz=end[2]-start[2],len=Math.hypot(dx,dz),nx=-dz/len,nz=dx/len;
    beam(start,end,30,9,'#405576',[0,1,0]);beam([start[0],y-10,start[2]],[end[0],y-10,end[2]],22,5,'#23384f',[0,1,0]);
    for(const side of [-1,1]){const at=(t,yy)=>[start[0]+dx*t+nx*side*14,yy,start[2]+dz*t+nz*side*14];beam(at(0,y+16),at(1,y+16),3,2,'#7695ab',[0,1,0]);for(let j=0;j<5;j++){beam(at(j/5,y+15),at((j+1)/5,y-2),2.5,2,'#556985');}const lit=r.count;beam(at(.05,y+12),at(.95,y+12),1.8,1,row%2?'#d886b9':'#7cd4dc',[0,1,0]);r.markEmissive(lit);}
    this.lowerCityBridges.push({start,end,row,col});
   }
   stats.cityBridges=this.lowerCityBridges.length;
   // Three resident camera-facing depth planes. All lie behind the entire lift.
   this.rainCurtainLayers=[{depth:2500,tileY:19,uv:[72,1.7,.26,8]},{depth:1750,tileY:14,uv:[52,2.7,.32,5]},{depth:1300,tileY:10,uv:[36,3.6,.42,2]}];
   const rain=[];for(const layer of this.rainCurtainLayers){const depth=826.801-layer.depth,cy=700/Math.hypot(700,440),cz=440/Math.hypot(700,440);for(const [u,v]of [[0,0],[1,0],[1,1],[0,0],[1,1],[0,1]]){const up=(.5-v)*3300;rain.push((u-.5)*2500,cy*depth+cz*up,cz*depth-cy*up,u,v);}}
   this.rainCurtainGeometry=new Float32Array(rain);this.rainForegroundCount=0;
   // World-upright chamfered lightboxes with recessed printed/emissive fascia.
   const signs=[{x:-280,y:245,z:b-320,w:154,h:154,slot:0,yaw:0,shape:'disc',thickness:24},{x:185,y:100,z:b-300,w:96,h:310,slot:1,yaw:0,shape:'asymmetric',thickness:37},{x:-185,y:100,z:b-300,w:88,h:360,slot:2,yaw:0,shape:'capsule',thickness:29},{x:285,y:260,z:b-320,w:150,h:166,slot:3,yaw:0,shape:'hexagon',thickness:33}],signData=[],signRanges=[];
   for(const [i,q]of signs.entries()){
    const side=q.x<0?-1:1,P=(x,y,depth)=>[q.x+x,q.y+y,q.z+depth],hw=q.w*.5,hh=q.h*.5,backZ=-q.thickness-1;
    const outline=(w,h,inset=0)=>{
     if(q.shape==='disc')return Array.from({length:40},(_,j)=>{const a=-Math.PI/2+j*Math.PI/20;return [Math.cos(a)*w,Math.sin(a)*h];});
     if(q.shape==='hexagon')return [[-w*.58,-h],[w*.58,-h],[w,-h*.45],[w,h*.45],[w*.58,h],[-w*.58,h],[-w,h*.45],[-w,-h*.45]];
     if(q.shape==='capsule'){const radius=w*.75,points=[];for(let j=0;j<=10;j++){const a=j*Math.PI/10;points.push([Math.cos(a)*w,h-radius+Math.sin(a)*radius]);}for(let j=0;j<=10;j++){const a=Math.PI+j*Math.PI/10;points.push([Math.cos(a)*w,-h+radius+Math.sin(a)*radius]);}return points;}
     const bl=Math.max(3,6-inset*.25),br=Math.max(5,22-inset*.25),tr=Math.max(3,6-inset*.25),tl=Math.max(5,22-inset*.25);return [[-w+bl,-h],[w-br,-h],[w,-h+br],[w,h-tr],[w-tr,h],[-w+tl,h],[-w,h-tl],[-w,-h+bl]];
    };
    const outer=outline(hw,hh),lip=outline(hw-3,hh-3,2),pane=outline(hw-5,hh-5,4),back=outer.map(([x,y])=>P(x,y,backZ)),N=outer.length,bodyStart=r.count;
    for(const yy of [-q.h*.28,q.h*.28]){const tip=P(side*hw*.8,yy,backZ+4),root=[side*(e+26),tip[1],b-24];beam(root,tip,6,5,'#55536d');r.box(...root,14,14,8,'#74708a');}
    for(let n=0;n<N;n++){
     const next=(n+1)%N,a=P(...outer[n],-7),b2=P(...outer[next],-7),la=P(...lip[n],-1),lb=P(...lip[next],-1);
     r.quad(a,b2,back[next],back[n],outer[n][1]>0?'#7f829c':'#41435d');r.quad(la,lb,b2,a,n%2?'#8b86a2':'#60637f');r.quad(P(...pane[n],-2),P(...pane[next],-2),lb,la,'#252c47');
    }
    for(let n=1;n<N-1;n++)r.quad(back[0],back[n+1],back[n],back[0],'#363b55');r.markFloor(bodyStart);
    for(let n=0;n<N;n++)if(q.shape==='disc'||n%2||n===4){const start=r.count;beam(P(...lip[n],-.6),P(...lip[(n+1)%N],-.6),1.3,.8,i%2?'#ed8cbb':'#80d5ed');r.markEmissive(start);}
    q.depth=q.thickness;q.worldUpright=true;q.shellOutline=outer;q.panelOutline=pane;q.shellRange=[bodyStart,r.count];q.panelHalfWidth=hw-5;q.panelHalfHeight=hh-5;q.backZ=backZ;
    const start=signData.length/5,add=([x,y])=>{const u=(x/(hw-5)+1)*.5,v=(1-y/(hh-5))*.5;signData.push(...P(x,y,-1.5),(q.slot%2)*.5+.004+u*.492,Math.floor(q.slot/2)*.5+.004+v*.492);};
    for(let n=1;n<pane.length-1;n++){add(pane[0]);add(pane[n]);add(pane[n+1]);}signRanges.push({start,count:signData.length/5-start});
   }
   this.sideSignRanges=signRanges;
   this.sideSignGeometry=new Float32Array(signData);this.sideSigns=signs;stats.sideSigns=signs.length;
   // Flight corridors are invisible trajectories, with no road/bridge/support meshes.
   this.trafficRoutes=[{a:[-1250,-370,b+200],b:[1250,-370,b-1650]},{a:[-1200,-480,f-650],b:[1250,-480,f+1050]},{a:[-1400,-1020,f+1050],b:[1400,-1020,f-900]},{a:[-1500,-1390,b-1350],b:[1500,-1390,b+750]}];
   // Close fly-bys run outside both side rails at deck level; never through the arena.
   this.trafficRoutes.push({a:[-e-960,-18,b-1100],b:[-e-110,-18,f+950],near:true},{a:[e+105,-42,f+1100],b:[e+1000,-42,b-1000],near:true},{a:[-1000,-30,b-250],b:[1000,-30,b-1650],near:true});
   const holo=[];this.hologramPlacements=[{x:-280,y:125,z:b-400,w:155,h:250,slot:3,yaw:.22},{x:300,y:95,z:b-350,w:175,h:230,slot:1,yaw:-.3},{x:200,y:-900,z:f+350,w:250,h:180,slot:0,yaw:.1}];
   for(const q of this.hologramPlacements){const cs=Math.cos(q.yaw),sn=Math.sin(q.yaw);for(const [u,v]of [[0,0],[1,0],[1,1],[0,0],[1,1],[0,1]])holo.push(q.x+(u-.5)*q.w*cs,q.y+(.5-v)*q.h,q.z-(u-.5)*q.w*sn,(q.slot+.015+u*.97)/4,.01+v*.98);}
   this.hologramGeometry=new Float32Array(holo);
   r.box(0,-2810,-3000,14000,25,14000,'#17243d');
   for(let k=0;k<24;k++){const x=-1900+k*179%3800,z=-2700+k*281%5400,h=90+k*41%310;r.box(x,-2780+h/2,z,92,h,100,'#293b58');}
   // Tag all city surfaces and window lights for view-distance fog in the shader.
   // The elevator, its glass and actors are deliberately outside this city range.
   this.cityFogRange=[sceneStart,r.count];
   for(let i=sceneStart;i<r.count;i+=9){const length=Math.hypot(r.data[i+3],r.data[i+4],r.data[i+5]);if(length<.001)continue;const tag=length>1.5&&length<2.5?5:4;for(let c=3;c<6;c++)r.data[i+c]*=tag/length;}
   for(const item of this.facadeAttachments){
    const tag=item.kind==='window'?5.2+hash(item.start*.013)*.05:item.kind==='waterfall'?6:item.kind==='cut-light'?7:item.kind==='kink-light'?7.4:item.kind==='glitch'?8:5;
    if(item.kind==='waterfall')stats.facadeWaterfalls++;if(item.kind==='cut-light')stats.facadeCuts++;if(item.kind==='kink-light')stats.facadeKinks++;if(item.kind==='glitch')stats.facadeGlitches++;
    for(let i=item.start;i<item.start+54;i+=9){r.data[i+3]=0;r.data[i+4]=tag;r.data[i+5]=0;}
   }
   const data=[];for(const p of posters){const cs=Math.cos(p.yaw),sn=Math.sin(p.yaw),uv=(u,v)=>[p.x+(u-.5)*p.w*cs,p.y+(.5-v)*p.h,p.z-(u-.5)*p.w*sn,(p.slot+u*.982+.009)/4,.004+v*.992],corners=[uv(0,0),uv(1,0),uv(1,1),uv(0,1)];for(const i of [0,1,2,0,2,3])data.push(...corners[i]);}
   this.billboardGeometry=new Float32Array(data);this.cityPosters=posters;stats.billboards=posters.length;
  },
  trafficAt(t){return this.trafficRoutes.flatMap((road,k)=>{
   const dx=road.b[0]-road.a[0],dz=road.b[2]-road.a[2],len=Math.hypot(dx,dz),nx=-dz/len,nz=dx/len;
   return Array.from({length:road.near?6:20},(_,i)=>{
    const seed=hash(k*37+i*17),phase=i*1.7+k*2.3,w=.95+seed*.65,dir=i%2?1:-1,speed=(road.near?180:75)+seed*90,u=((hash(i*29+k*93)+t*speed/len*dir)%1+1)%1;
    // Independent suspension and gentle lane drift: each car floats at its own cadence.
    const drift=Math.sin(t*w*.55+phase)*5,bob=Math.sin(t*w+phase)*7+Math.sin(t*w*1.73+phase)*1.6;
    return {x:road.a[0]+dx*u+nx*(dir*15+drift),y:road.a[1]+12+bob,z:road.a[2]+dz*u+nz*(dir*15+drift),yaw:-Math.atan2(dz*dir,dx*dir)+Math.cos(t*w*.55+phase)*.018,pitch:Math.cos(t*w+phase)*.035,roll:Math.sin(t*w*.7+phase)*.055,model:(i+k*3)%8,dir,road:k,near:!!road.near,scale:road.near?1.8:1};
   });
  });},
  trafficPose(car){
   const c=Math.cos(car.yaw),s=Math.sin(car.yaw),p=Math.sin(car.pitch),q=Math.cos(car.pitch),u=Math.sin(car.roll),v=Math.cos(car.roll),z=car.scale;
   return [c*q*z,(-c*p*v+s*u)*z,(c*p*u+s*v)*z,car.x,p*z,q*v*z,-q*u*z,car.y,-s*q*z,(s*p*v+c*u)*z,(-s*p*u+c*v)*z,car.z];
  },
  orbitalRainAt(i,t,b){
   const near=i<440,speed=near?350+i%4*35:410,span=near?620:1600,travel=((t*speed-i*(near?71:67))%span+span)%span,len=near?37+i%5*12:55+i%4*18;
   const x=-650+i*181%1300-.22*travel,z=b-1100+i*199%2600+.035*travel,y=near?632-travel:-350-travel;
   const head=[x,y,z],tail=[x+.22*len,y+len,z-.035*len];
   return {head,tail,width:near?1.65:2.2,alpha:near&&Math.abs(x)<190&&z>-100&&z<260?.28:near?.53:.35,travel,span};
  },
  drawTraffic(r,t,cars=this.trafficAt(t)){
   // Shared GPU meshes; only car transforms and lamp points change per frame.
   for(const car of cars){
    const pose=this.trafficPose(car),len=[31,35,27,39,56,43,33,25][car.model],width=[15,17,14,19,19,18,17,14][car.model];
    r.residentMesh('orbital-traffic-'+car.model+'-hover',()=>{
     const c=['#668bad','#be829e','#ddb45b','#579b99','#8596bc','#aa896b','#7192c5','#b56582'][car.model],sport=car.model===2||car.model===7,bus=car.model===4,cargo=car.model===5;
     r.box(0,2,0,len,sport?7:10,width,c);
     r.box(cargo?10:-2,sport?8:11,0,cargo?13:len*(bus?.83:.53),sport?5:bus?13:8,width-2,'#263b51');
     r.box(cargo?10:-3,sport?11:bus?18:15,0,cargo?14:len*(bus?.85:.49),2,width-1,c);
     if(car.model===1){r.box(-2,17,0,8,3,6,'#e8be69');r.emissiveBox(-2,19,0,6,1,4,'#ffe393');}
     if(car.model===3||cargo)r.box(-8,13,0,len*.48,cargo?19:12,width-1,cargo?'#746e87':'#688e9b');
     if(bus)for(let x=-20;x<=20;x+=8)for(const s of [-1,1])r.emissiveBox(x,12,s*(width/2+.1),5,6,.6,'#74c7df');
     if(sport){r.box(-len*.35,10,0,3,2,width+5,c);for(const s of [-1,1])r.box(-len*.35,6,s*5,2,6,1,'#34405b');}
     if(car.model===6){r.emissiveBox(-3,17,-4,8,2,3,'#53baff');r.emissiveBox(-3,17,4,8,2,3,'#ff697e');}
     for(const s of [-1,1]){r.box(-3,-2,s*(width/2+1),sport?17:12,4,4,'#345b76');r.emissiveBox(-3,-4,s*(width/2+1),8,1.5,3,'#63c9f3');r.glow(-3,-5,s*(width/2+1),3,'#4abaff');r.emissiveBox(len/2+1,3,s*width*.33,2,3,3,'#e9eff5');r.glow(len/2+2,3,s*width*.33,3.2,'#c2e7ff');r.emissiveBox(-len/2-1,3,s*width*.33,2,3,3,'#ef657c');r.glow(-len/2-2,3,s*width*.33,3,'#f45d79');}
    },pose);
    // Crossed, feathered light volumes follow the same full pose as the headlights.
    // Bright narrow cores open into a soft blue cone and fade completely at the tip.
    const at=(x,y,z)=>[pose[0]*x+pose[1]*y+pose[2]*z+pose[3],pose[4]*x+pose[5]*y+pose[6]*z+pose[7],pose[8]*x+pose[9]*y+pose[10]*z+pose[11]];
    for(const side of [-1,1])for(const vertical of [false,true])for(let j=0;j<5;j++){
     const a=j/5,b=(j+1)/5,d=car.model===4?110:86,start=len/2+2,lamp=side*width*.33;
     const point=(u,edge)=>at(start+d*u,3+(vertical?edge*(1+u*7):0),lamp+(vertical?0:edge*(1+u*10)));
     const alpha=u=>(car.near?.2:.14)*(1-u)**2;
     r.transparentQuad(point(a,-1),point(a,1),point(b,1),point(b,-1),'#b1deff',[alpha(a),alpha(a),alpha(b),alpha(b)]);
    }
   }
  },
  draw(r,grid,time){if(this.place!=='abyss')return base.draw.call(this,r,grid,time);
   const {b,f,e}=ext(grid),t=this.clock??(typeof window!=='undefined'&&window.sceneLab?performance.now()/1000:time),p=this.palette;r.sceneTime=t;r.setFloorGlyphs(this.floorGlyphGeometry);r.setGlassCircuits(this.glassCircuitGeometry,t);r.setSideSigns(this.sideSignGeometry,t,this.sideSignRanges);if(this.rain)r.setRainCurtains(this.rainCurtainGeometry,t,this.rainCurtainLayers);r.setBillboards(this.billboardGeometry);r.setBrandBillboard(this.brandGeometry);r.setHolograms(this.hologramGeometry,t);if(this.worldClockState)r.setWorldClock(this.worldClockState,this.worldClockGeometry);
   this.drawTraffic(r,t);
   // Visible projectors and fan-shaped light volumes beneath floating ad screens.
   for(const q of this.hologramPlacements){const yy=q.y-q.h*.68;r.box(q.x,yy,q.z,25,9,18,'#34435e');r.glow(q.x,yy+6,q.z,12,'#72e3ff');r.transparentQuad([q.x-6,yy+5,q.z],[q.x+6,yy+5,q.z],[q.x+q.w*.47,q.y-q.h*.38,q.z],[q.x-q.w*.47,q.y-q.h*.38,q.z],'#4ccfff',[.18,.18,.015,.015]);}
   // Rain and fog occupy several true depth layers rather than a flat screen filter.
   const fogColors=this.look==='green'?['#00a553','#00ce81','#45cf23']:this.look==='blue'?['#1800dc','#1739ff','#7c16ed']:['#182ab5','#3842d5','#7945c9'];
   for(const [i,[y,z,rx,rz,a]]of [[-2300,-600,2500,1800,.76],[-1300,b-400,1600,900,.55],[-650,b-280,1050,540,.32]].entries())this.pool(r,0,y,z,rx,rz,fogColors[i],a);
   this.pool(r,420,-1050,f+180,950,650,this.look==='green'?'#06c983':'#2600ff',.4);
   for(const x of [-e-26,e+26])for(const z of [b-24,f+24])r.glow(x,44,z+18,13,'#edb96c');
   // Narrow wet highlights follow safety strips; leave the aiming area uncluttered.
   this.pool(r,-270,3.2,b+37,150,58,'#8fd7e7',.1);this.pool(r,270,3.2,b+37,145,58,'#ce86bf',.1);this.pool(r,0,3.2,f-20,320,45,'#e3b66c',.08);
   for(let i=0;i<65;i++){const x=-330+i*137%660,z=b+15+i*73%620,c=i%3?'#78bcd6':'#d7a8b4';r.transparentQuad([x,2.9,z],[x+9+i%4*4,2.9,z],[x+9+i%4*4,2.9,z+2],[x,2.9,z+2],c,[.06,.18,.18,.06]);}
   // Depth-tested glass remains transparent over characters and the city.
   for(const pane of [...this.glassPanels].sort((a,b)=>a.corners[0][2]-b.corners[0][2])){
    const [a,b2,c,d]=pane.corners,alpha=pane.alpha;r.transparentQuad(a,b2,c,d,'#8b6dd3',[alpha,alpha,alpha*.55,alpha*.55]);
    const at=(u,v)=>a.map((x,i)=>x+(b2[i]-x)*u+(d[i]-x)*v);
    r.transparentQuad(at(.07,.04),at(.17,.04),at(.42,.96),at(.32,.96),'#c9b8ff',[.015,.04,.06,.02]);
    r.transparentQuad(at(.035,.07),at(.045,.07),at(.045,.93),at(.035,.93),'#b59bff',[.06,.06,.025,.025]);
   }
   // Background texture curtains provide rain; no foreground drops or splashes.

  }
 });
})();

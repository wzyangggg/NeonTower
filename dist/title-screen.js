"use strict";
// The entry uses the real city meshes; all composition changes stay in this scene.
(()=>{
 const buildCity=StreetScene.build,params=new URLSearchParams(location.search);
 const enabled=!['lab','weaponlab'].some(k=>params.get(k)==='1'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const key='neon-title-city-v4',fogColor=[.19,.17,.43],tops=[1500,1000,1900,380,-550,650,2300,1450,-1400,-950,1700,-600,2100];
 const hash=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)},wrap=n=>((n%1)+1)%1;
 const rainLayers=[{tileY:20,uv:[68,1.7,.17,6]},{tileY:14,uv:[52,2.5,.19,4]},{tileY:16,uv:[44,2.2,.13,4]}],rain=[];
 for(const [z,w,h]of [[-4200,10000,10000],[-2100,7500,8000],[-650,5200,6000]])for(const [u,v]of [[0,0],[1,0],[1,1],[0,0],[1,1],[0,1]])rain.push((u-.5)*w,900-v*h,z,u,v);
 const rainGeometry=new Float32Array(rain);
 let showing=false,titleBillboards;
 const stats={centralTop:-390,buildings:[],removedStack:true};
 function lens(){
  if(document.getElementById('title-rain-glass'))return;
  const glass=document.createElement('div');glass.id='title-rain-glass';glass.setAttribute('aria-hidden','true');
  for(let i=0;i<5;i++){const drop=document.createElement('i');drop.style.cssText=`left:${3+hash(i+1)*94}%;top:${hash(i+61)*90}%;--drop-w:${2+hash(i+17)*3}px;--drop-h:${5+hash(i+37)*9}px;--drop-time:${11+hash(i+99)*14}s;--drop-delay:${-hash(i+23)*24}s`;glass.append(drop)}
  document.getElementById('viewport').append(glass);
 }
 function traffic(t){
  const cars=[];
  for(let i=0;i<40;i++){
   const mid=i>=26,dir=i%2?1:-1,z=mid?-1800+hash(i+12)*1150:-4400+hash(i+12)*1900;
   const span=mid?3800:5800,phase=wrap(t/(mid?34:52)+hash(i*3+1));
   cars.push({x:(phase-.5)*span*dir,y:mid?-250-hash(i+91)*1100:100-hash(i+91)*1700,z,model:i%8,yaw:dir===1?-.3:Math.PI+.3,pitch:Math.sin(t*.6+i)*.025,roll:Math.sin(t*.8+i)*.025,near:false,scale:mid?1.1:1,dir});
  }
  return cars;
 }
 function atmosphere(r,t){
  // Broad soft mist banks are world geometry; depth testing preserves nearer silhouettes.
  for(let i=0;i<9;i++){
   const x=(hash(i+13)-.5)*4200+Math.sin(t*.025+i)*160,y=180-hash(i+41)*2150,z=-2600+hash(i+22)*3000,w=850+hash(i+83)*950,h=180+hash(i+92)*300,c=[x,y,z];
   for(let j=0;j<20;j++){const a=j*Math.PI/10,b=(j+1)*Math.PI/10;r.transparentQuad(c,[x+Math.cos(a)*w,y+Math.sin(a)*h,z],[x+Math.cos(b)*w,y+Math.sin(b)*h,z],c,'#7472b1',[.115,0,0,.115])}
  }
  for(let i=0;i<54;i++){
   const x=(hash(i+101)-.5)*3100+Math.sin(t*.05+i)*20,y=200-wrap(hash(i+23)+t*.008)*2200,z=-1400+hash(i+72)*2300,size=1.5+hash(i+81)*3;
   r.transparentQuad([x-size,y-size,z],[x+size,y-size,z],[x+size,y+size,z],[x-size,y+size,z],'#afb5ef',[.09,.15,.12,.06]);
  }

 }
 globalThis.TitleScene={stats,traffic,
  draw(state,r,grid,tiles){
   const active=enabled&&state==='menu';
   if(active!==showing){showing=active;document.getElementById('viewport').classList.toggle('title-screen',active);if(active)lens();else{r.sceneKey=null;r.sceneData=null}}
   if(!active)return false;if(!r.ready||r.gl.isContextLost())return true;
   const t=reduced.matches?0:performance.now()/1000,place=StreetScene.place,look=StreetScene.look;
   StreetScene.place='abyss';StreetScene.look='violet';StreetScene.lighting(r);
   r.sceneFogDensity=.00048;r.sceneFogColor=fogColor;r.sceneGrade=.36;r.sceneTime=t;r.scenePerspective=true;r.begin();
   const aspect=r.canvas.width/r.canvas.height,focal=1.52,near=20,far=16000,cy=.13,cz=Math.sqrt(1-cy*cy),ex=Math.sin(t*.065)*18,ey=-80,ez=2400;
   r.sceneFogView=[0,cy,cz,cy*ey+cz*ez];
   const view=[1,0,0,0,0,cz,cy,0,0,-cy,cz,0,-ex,-cz*ey+cy*ez,-cy*ey-cz*ez,1],proj=[focal/aspect,0,0,0,0,focal,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0];r.vp=r.mul(proj,view);
   if(r.sceneKey!==key){
    buildCity.call(StreetScene,r,grid,tiles);
    const [start,end]=StreetScene.cityFogRange,city=r.data.slice(start,end),ranges=StreetScene.towerOrientations;
    stats.buildings=ranges.map((q,i)=>{const top=i<tops.length?tops[i]:q.top+(hash(i+37)-.5)*550,scale=(top-q.bottom)/(q.top-q.bottom);return {...q,targetTop:top,scale,offsetX:i===3?-155:0}});
    const mapY=(y,q)=>q.bottom+(y-q.bottom)*q.scale;
    // Move attached advertising vertices together with their own facade.
    titleBillboards=new Float32Array(StreetScene.billboardGeometry);
    for(let poster=0;poster<StreetScene.cityPosters.length;poster++){
     const p=StreetScene.cityPosters[poster],q=stats.buildings.reduce((best,q)=>Math.hypot(q.x-p.x,q.z-p.z)<Math.hypot(best.x-p.x,best.z-p.z)?q:best,stats.buildings[0]);
     for(let i=poster*30;i<poster*30+30;i+=5){titleBillboards[i]+=q.offsetX;titleBillboards[i+1]=mapY(titleBillboards[i+1],q)}
    }
    r.count=0;const sky=[[-12000,6500,-10500],[12000,6500,-10500],[12000,-7000,-10500],[-12000,-7000,-10500]];
    for(const i of [0,1,2,0,2,3])r.vertex(sky[i],[0,2,0],r.color(i<2?'#161a42':'#494075'));
    let building=0;
    for(let i=0;i<city.length;i+=27){
     const at=start+i;while(building<ranges.length&&at>=ranges[building].end)building++;
     if([0,9,18].some(k=>Math.abs(city[i+k])>6000))continue;
     if(at>=StreetScene.stackedLandmarkRange[0]&&at<StreetScene.stackedLandmarkRange[1])continue;
     if(StreetScene.sideSigns.some(q=>at>=q.shellRange[0]&&at<q.shellRange[1]))continue;
     const q=building<ranges.length&&at>=ranges[building].start?stats.buildings[building]:null;
     for(let k=0;k<27;k+=9){
      const p=Array.from(city.subarray(i+k,i+k+3)),n=Array.from(city.subarray(i+k+3,i+k+6)),c=Array.from(city.subarray(i+k+6,i+k+9));
      if(q){p[0]+=q.offsetX;p[1]=mapY(p[1],q);const tag=Math.hypot(...n);n[1]/=q.scale;const norm=Math.hypot(...n)||1;for(let j=0;j<3;j++)n[j]*=tag/norm}
      const fog=(1-Math.exp(-Math.max(0,ez-p[2]-1250)*.00046))*.15;
      for(let j=0;j<3;j++)c[j]=c[j]*(1-fog)+fogColor[j]*fog;
      r.vertex(p,n,c);
     }
    }
    // The campaign skyline ends near x=900. Continue it beyond the title frustum,
    // including below its bottom edge, rather than exposing the empty backdrop.
    const edgeBuildings=[{source:6,x:900,z:140,top:1700,bottom:-7200,width:2.8},{source:7,x:1220,z:-1700,top:1250,bottom:-6800,width:1.5},{source:4,x:1740,z:-3300,top:1150,bottom:-6500,width:1.8}];
    stats.edgeBuildings=edgeBuildings;
    for(const edge of edgeBuildings){
     edge.start=r.count;
     const q=ranges[edge.source],scaleY=(edge.top-edge.bottom)/(q.top-q.bottom);
     for(let i=q.start-start;i<q.end-start;i+=9){
      const p=[edge.x+(city[i]-q.x)*edge.width,edge.bottom+(city[i+1]-q.bottom)*scaleY,edge.z+(city[i+2]-q.z)*edge.width];
      const n=Array.from(city.subarray(i+3,i+6)),c=Array.from(city.subarray(i+6,i+9)),tag=Math.hypot(...n);
      n[0]/=edge.width;n[1]/=scaleY;n[2]/=edge.width;const norm=Math.hypot(...n)||1;for(let j=0;j<3;j++)n[j]*=tag/norm;
      const fog=(1-Math.exp(-Math.max(0,ez-p[2]-1250)*.00046))*.15;for(let j=0;j<3;j++)c[j]=c[j]*(1-fog)+fogColor[j]*fog;
      r.vertex(p,n,c);
     }
     edge.end=r.count;
    }
    const top=stats.centralTop,bottom=-2800,z=-30,rad=140;
    for(let side=0;side<6;side++){
     const a=side*Math.PI/3,b=(side+1)*Math.PI/3,x1=Math.cos(a)*rad,z1=z+Math.sin(a)*rad,x2=Math.cos(b)*rad,z2=z+Math.sin(b)*rad;
     r.quad([x1,bottom,z1],[x2,bottom,z2],[x2,top,z2],[x1,top,z1],side%2?'#27273f':'#36334c');
     r.emissiveBox(x1,(top+bottom)/2,z1,2.6,top-bottom-30,2.6,side%2?'#af49dc':'#3ba4b9');
     for(let y=bottom+130;y<top-60;y+=210)r.box((x1+x2)/2,y,(z1+z2)/2,15,5,15,'#303750');
    }
    r.disc(0,top,z,rad,'#46506b');r.box(0,top+13,z,68,26,55,'#292c43');r.emissiveBox(0,top+22,z+28,46,7,1,'#47e5e8');r.box(0,top+52,z,3,60,3,'#344366');r.emissiveBox(0,top+85,z,5,5,5,'#f55acb');
    r.sceneData=r.data.slice(0,r.count);r.sceneKey=key;r.count=0;
   }
   r.setBillboards(titleBillboards);if(StreetScene.rain)r.setRainCurtains(rainGeometry,t,rainLayers);
   StreetScene.drawTraffic(r,t,traffic(t));atmosphere(r,t);r.end();r.sceneFogView=null;StreetScene.place=place;StreetScene.look=look;return true;
  }
 };
})();

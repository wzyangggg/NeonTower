'use strict';
// Depth study: actual perspective and structures far below the walkable plane.
// No screen-space illustration, external models or textures.
(()=>{
 const q=typeof location==='undefined'?null:new URLSearchParams(location.search),base={build:StreetScene.build,draw:StreetScene.draw,lighting:StreetScene.lighting};
 const palette=Object.getOwnPropertyDescriptor(StreetScene,'palette').get,revision=Object.getOwnPropertyDescriptor(StreetScene,'revision').get;
 const violet={name:'紫蓝',material:[.66,.6,1],left:[1,.12,.46],right:[.14,.55,1],top:[.58,.57,.93],fog:'#463368',water:'#121b36',accent:'#ff78c8',fill:'#6fcdff'};
 if(q?.get('scene')==='abyss'){StreetScene.enabled=true;StreetScene.place='abyss';StreetScene.look=['green','blue'].includes(q.get('look'))?q.get('look'):'violet';}
 StreetScene.names.abyss='深井悬空升降台';
 Object.defineProperty(StreetScene,'palette',{get(){return this.look==='violet'?violet:palette.call(this);},configurable:true});
 Object.defineProperty(StreetScene,'revision',{get(){return this.place==='abyss'?'depth-2-'+this.look:revision.call(this);},configurable:true});
 const extent=grid=>({back:(grid.minY-.5)*54*1.06,front:(grid.maxY+.5)*54*1.06,edge:(grid.maxX+.5)*54});
 Object.assign(StreetScene,{
  lighting(r){if(this.place!=='abyss'){r.scenePerspective=false;return base.lighting.call(this,r);}const p=this.palette;r.scenePerspective=true;r.cameraScale=1.36;r.clubCyan=.8;r.clubMagenta=.9;r.rearLeftColor=p.left;r.rearRightColor=p.right;r.topLight=p.top;},
  build(r,grid,tiles){if(this.place!=='abyss')return base.build.call(this,r,grid,tiles);
   const {back:b,front:f,edge:e}=extent(grid),p=this.palette;
   this.baseFloor(r,grid,tiles);
   const start=r.count;
   // Thick deck sidewalls, exposed ribs and a mechanical undercarriage.
   for(const s of [-1,1]){r.box(s*(e+12),-43,(b+f)/2,25,86,f-b+34,'#3d455e');r.box(s*(e+12),3,(b+f)/2,30,7,f-b+40,'#7d8198');
    r.emissiveBox(s*(e+20),8,(b+f)/2,2.5,3,f-b+30,p.accent);
    for(let z=b+16;z<f;z+=65)r.box(s*(e+26),-44,z,7,76,11,'#69738a');
   }
   for(const z of [b-12,f+12]){r.box(0,-43,z,e*2+62,86,26,'#354159');r.box(0,3,z,e*2+70,7,30,'#747c96');r.emissiveBox(0,8,z,e*2+64,3,2.5,p.accent);for(let x=-e+8;x<e;x+=68)r.box(x,-43,z+15,11,74,5,'#6e7890');}
   r.box(0,-103,65,625,35,520,'#27354f');r.box(0,-131,70,420,20,420,'#41405c');
   for(const x of [-260,260])r.box(x,-119,62,30,82,570,'#485772');
   // Exposed guide columns below the deck emphasize height without covering play.
   for(const s of [-1,1])for(const z of [b+35,f-40]){const x=s*(e-25);r.box(x,-835,z,19,1540,22,'#3c4666');for(let y=-200;y>-1600;y-=200){r.box(x,y,z,29,12,31,'#5c5a7e');r.emissiveBox(x,y,z+17,10,5,1,p.fill);}}
   // Deck corner pylons and a gate, all below the player's usual silhouette height.
   for(const x of [-e,e])for(const z of [b,f]){r.box(x,20,z,24,42,24,'#434c69');r.emissiveBox(x,43,z,19,4,19,p.accent);}
   r.box(0,26,b-36,168,52,20,'#24324b');this.sign(r,'DEPTH 07',0,20,b-22,168,p.fill,3.8);
   // Nearby towers stop below the deck; the distant skyline rises behind it.
   const towers=[[-580,-180,b-290,180,1500,190],[530,-110,b-370,175,1850,180],[-510,-270,f+260,150,1700,160],[560,-380,f+390,185,2000,180],[-300,230,b-1060,220,2400,210],[230,420,b-1310,195,2650,190],[-870,-120,b-720,220,2400,210],[900,90,b-910,230,2700,230],[-750,-700,f+820,240,2100,230],[790,-820,f+910,270,2300,250],[-95,680,b-1910,230,3000,230],[-590,540,b-1780,260,2900,230],[650,730,b-2240,250,3200,230]];
   for(let k=0;k<towers.length;k++){
    const [x,top,z,w,h,d]=towers[k];
    // Split vertically: fading colors and smaller repeats make the descent legible.
    for(let j=0;j<6;j++){const y=top-(j+.5)*h/6,shade=j<2?'#425073':j<4?'#323d60':'#252f4d';r.box(x,y,z,w,h/6,d,shade);r.box(x,y+h/12,z,w+9,8,d+9,j<3?'#687094':'#394563');
     for(const sx of [-1,1])r.box(x+sx*(w/2-9),y,z+d/2+2,9,h/6,8,j<3?'#7c779b':'#3e4a6b');
     for(let col=0;col<4;col++)for(let row=0;row<3;row++){const yy=y+h/16-row*h/24,c=j<2?(col%2?p.fill:'#c7a9df'):j<4?'#596a99':'#364664';r.emissiveBox(x-w*.31+col*w*.207,yy,z+d/2+6,w*.115,9,1,c);}
     if(j<4)r.emissiveBox(x,y+h/12-10,z+d/2+9,w-22,3,2,k%2?p.fill:p.accent);
    }
    r.box(x,top+7,z,w+15,15,d+15,'#686888');r.box(x,top+17,z,w-13,6,d-13,'#303c5c');
    r.box(x-w*.24,top+40,z+10,w*.25,40,d*.3,'#596183');
    if(k<6){r.box(x+w*.26,top+68,z-10,5,118,5,'#7c86a5');r.emissiveBox(x+w*.26,top+130,z-10,7,5,7,p.accent);}
    if(k<4){this.sign(r,k%2?'SECTOR 7':'NIGHT',x,top-130,z+d/2+12,w*.82,k%2?'#ff73bd':'#82ddff',k%2?4:5);}
   }
   // Lower crossbridges and receding shafts supply intermediate depth landmarks.
   for(let tier=0;tier<4;tier++){const y=-480-tier*420,z=b-150-tier*180,w=850+tier*150;r.box(0,y,z,w,22,42,'#404e72');r.emissiveBox(0,y+13,z+22,w-16,2,2,tier<2?p.fill:'#455b8c');for(let x=-w/2;x<w/2;x+=85)r.box(x,y+24,z+19,3,28,3,'#647399');}
   // A distant floor disappears into indigo; lower elevations carry little contrast.
   r.box(0,-2510,-3000,13000,25,13000,'#1b2642');
   for(let i=0;i<26;i++){const x=-1950+i*157%3900,z=-2550+i*271%4600,h=70+i*29%240;r.box(x,-2480+h/2,z,95,h,100,'#313759');if(i%3===0)r.emissiveBox(x,-2480+h,z,77,2,85,'#405481');}
   // Desaturate/tint the deck as a single quiet material family.
   for(let i=0;i<start;i+=9){const n=Math.hypot(r.data[i+3],r.data[i+4],r.data[i+5]);if(n>1.5&&n<2.5)continue;const l=r.data[i+6]*.2126+r.data[i+7]*.7152+r.data[i+8]*.0722;for(let k=0;k<3;k++)r.data[i+6+k]=l*([.58,.7,1][k])*.9;}
   // True distance grading, including luminous windows: no bright checkerboard at depth.
   const fog=this.colorForDepth();for(let i=start;i<r.count;i+=9){const depth=Math.max(0,-r.data[i+1]-200),a=Math.min(.83,depth/2600);for(let c=0;c<3;c++)r.data[i+6+c]=r.data[i+6+c]*(1-a)+fog[c]*a;}
  },
  colorForDepth(){return this.look==='green'?[.08,.16,.14]:this.look==='blue'?[.08,.13,.24]:[.15,.1,.25];},
  draw(r,grid,time){if(this.place!=='abyss')return base.draw.call(this,r,grid,time);
   const {back:b,front:f,edge:e}=extent(grid),p=this.palette,t=this.clock??(typeof window!=='undefined'&&window.sceneLab?performance.now()/1000:time);
   // Soft depth layers are below the deck, never a veil on the character/bullets.
   for(const [y,z,rx,rz,c,a]of [[-245,b-125,790,350,'#b958cc',.16],[-720,b-300,1250,650,'#786bc6',.32],[-1300,-550,1800,1000,p.fog,.44],[-2050,-700,2500,1700,p.fog,.75]])this.pool(r,0,y,z,rx,rz,c,a);
   for(const x of [-e,e])for(const z of [b,f]){r.glow(x,44,z,15,p.accent);r.glow(x,-80,z,28,p.accent);}
   // Lower luminous shaft cores make the eye travel down instead of along the floor.
   for(const [x,z,col]of [[-420,b-300,'#ff65c8'],[430,b-450,'#6aafff'],[0,b-550,'#a58aff']]){
    for(let n=0;n<4;n++)r.glow(x,-350-n*410,z,45-n*6,col);
    r.transparentQuad([x-22,-240,z],[x+22,-240,z],[x+45,-1950,z],[x-45,-1950,z],col,[.16,.16,0,0]);
   }
   // Sparse descending motes reveal motion parallax at several physical elevations.
   for(let i=0;i<45;i++){const x=-800+i*179%1600,z=b-800+i*211%2100,y=-150-((t*27+i*59)%1550);r.glow(x,y,z,1.5,i%2?p.fill:p.accent);}
   if(this.rain)for(let i=0;i<175;i++){const x=-550+i*181%1100,z=b-500+i*199%1500,h=(((i*71-t*240)%400)+400)%400+5,a=Math.abs(x)<200?.09:.23;r.transparentQuad([x,h,z],[x+1,h,z],[x+10,h+33,z-2],[x+9,h+33,z-2],p.fill,[a,a,0,0]);}
  }
 });
})();

'use strict';
// Three small environment studies. All geometry and weather are drawn in WebGL.
// The grade affects scenery only: projectiles, telegraphs and actors keep their colors.
(()=>{
 const query=typeof location==='undefined'?null:new URLSearchParams(location.search);
 const original={build:StreetScene.build,draw:StreetScene.draw,lighting:StreetScene.lighting};
 const schemes={
  green:{name:'黄绿',material:[.67,1.04,.72],left:[1,.79,.21],right:[.14,.56,.41],top:[.66,.89,.67],fog:'#163b32',water:'#0b2825',accent:'#ffd46c',fill:'#61d6a5'},
  blue:{name:'黄蓝',material:[.55,.83,1.32],left:[1,.65,.17],right:[.15,.42,1],top:[.56,.74,1],fog:'#183451',water:'#0b1b32',accent:'#ffc15b',fill:'#64b7ff'}
 };
 Object.assign(StreetScene,{
  enabled:['street','dock','roof'].includes(query?.get('scene')),
  place:['dock','roof'].includes(query?.get('scene'))?query.get('scene'):'street',
  look:query?.get('look')==='blue'?'blue':'green',rain:query?.get('rain')!=='0',clock:null,
  names:{street:'雨巷街区',dock:'深水检修平台',roof:'高架屋顶机房'},
  baseFloor(r,grid,tiles){original.build.call(this,r,grid,tiles,true);},
  lighting(r){const p=this.palette;r.cameraScale=this.place==='street'?1.12:1.19;r.clubCyan=.95;r.clubMagenta=.85;r.rearLeftColor=p.left;r.rearRightColor=p.right;r.topLight=p.top;},
  build(r,grid,tiles){
   const start=r.count;
   if(this.place==='street'){original.build.call(this,r,grid,tiles);this.streetSigns(r,grid);}
   else {original.build.call(this,r,grid,tiles,true);if(this.place==='dock')this.buildDock(r,grid);else this.buildRoof(r,grid);}
   // One hue family across all non-emissive materials, with brighter signage left intact.
   const tint=this.palette.material,b=(grid.minY-.5)*54*1.06,f=(grid.maxY+.5)*54*1.06;
   // Baked point lights on the existing vertices: actual position-dependent color,
   // rather than a screen filter. No per-frame geometry rebuild or shadow maps.
   const warm=[1,.72,.2],cool=this.look==='blue'?[.12,.48,1]:[.28,.85,.58];
   const lights=this.place==='street'?
    [[0,105,b-75,190,2.7,warm],[-254,145,b-104,155,1.7,[1,.12,.48]],[264,145,b-104,155,1.7,[.12,.65,1]],[-340,90,f-20,135,1.6,warm],[260,30,f+230,140,1.2,warm]]:
    this.place==='dock'?[[-100,130,b-150,220,2.6,warm],[-365,190,b-85,220,2.2,warm],[365,190,b-85,220,2.2,warm],[-335,76,f+200,175,1.9,warm],[190,65,f+300,170,1.9,cool]]:
    [[-200,100,b-90,210,2.7,warm],[220,100,b-70,190,1.8,cool],[-240,75,f+120,170,1.9,warm],[0,80,f+410,200,2.1,[1,.12,.52]]];
   for(let i=start;i<r.count;i+=9){const n=Math.hypot(r.data[i+3],r.data[i+4],r.data[i+5]);if(n>1.5&&n<2.5)continue;
    const l=r.data[i+6]*.2126+r.data[i+7]*.7152+r.data[i+8]*.0722;
    const rgb=tint.map(v=>l*v*.67),length=n||1,normal=[r.data[i+3]/length,r.data[i+4]/length,r.data[i+5]/length];
    for(const [x,y,z,range,power,color]of lights){const dx=x-r.data[i],dy=y-r.data[i+1],dz=z-r.data[i+2],d2=dx*dx+dy*dy+dz*dz,dist=Math.sqrt(d2)||1;
     const facing=.25+.75*Math.max(0,(dx*normal[0]+dy*normal[1]+dz*normal[2])/dist),strength=power*facing/(1+d2/(range*range))**2;
     for(let c=0;c<3;c++)rgb[c]+=l*color[c]*strength;
    }
    for(let c=0;c<3;c++)r.data[i+6+c]=Math.min(.95,rgb[c]);
   }
  },
  text(r,text,x,y,z,size,col){
   const font={A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'011100101101011',H:'101101111101101',I:'111010010010111',J:'001001001101010',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'101111111111101',O:'111101101101111',P:'110101110100100',R:'110101110101101',S:'011100010001110',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',Y:'101101010010010',0:'111101101101111',1:'010110010010111',2:'110001010100111',7:'111001010010010'};
   const left=x-(text.length*4-1)*size/2;
   for(let c=0;c<text.length;c++){const bits=font[text[c]];if(!bits)continue;for(let j=0;j<15;j++)if(bits[j]==='1')r.emissiveBox(left+(c*4+j%3)*size,y+(4-Math.floor(j/3))*size,z,size*.78,size*.78,.7,col);}
  },
  sign(r,text,x,y,z,w,col,size=4){
   r.box(x,y+size*2,z-2,w,size*7+7,7,'#142b35');
   this.text(r,text,x,y,z+2,size,col);
   for(const side of [-1,1]){r.emissiveBox(x+side*(w/2-2),y+size*2,z+2,1.5,size*7,1,col);r.emissiveBox(x,y+size*2+side*size*3.5,z+2,w,1.5,1,col);}
  },
  streetSigns(r,grid){
   const b=(grid.minY-.5)*LIFT_MAP.tile*1.06;
   this.sign(r,'NOODLE',-254,146,b-109,164,'#ff4cba',4.4);
   this.sign(r,'ARCADE',264,145,b-109,161,'#56e4ff',4.1);
   this.sign(r,'OPEN',-344,107,b-77,41,'#ffbc47',2.4);
   // Side-on vertical sign, four stacked letters on a shallow cuboid.
   r.box(364,128,b-112,27,108,8,'#172b38');
   for(let i=0;i<4;i++)this.text(r,'OPEN'[i],364,161-i*24,b-106,3.1,i%2?'#a081ff':'#fa52ba');
   r.emissiveBox(-254,102,b-89,147,2,4,'#ff77b3');
   r.emissiveBox(264,95,b-100,126,2,3,'#62c9ff');
  },
  buildDock(r,grid){
   const b=(grid.minY-.5)*54*1.06,f=(grid.maxY+.5)*54*1.06,e=(grid.maxX+.5)*54;
   // A black-water basin, with isolated catwalks rather than a street frontage.
   r.box(0,-47,80,1800,14,2600,'#102b33');
   r.box(0,-10,b-120,760,15,175,'#3b5660');
   for(const side of [-1,1]){const x=side*(e+45);
    r.box(x,35,b-85,31,160,31,'#526871');r.box(x,151,b-85,44,77,43,'#294951');r.emissiveBox(x,193,b-85,27,4,28,this.palette.accent);
    r.box(x,28,f-6,26,150,26,'#526871');r.box(x,108,f-6,38,9,38,'#70898c');r.emissiveBox(x,115,f-6,17,6,17,'#fa725b');
    r.box(x,117,b-60,6,4,165,'#6c7c79');r.box(x,84,b+25,3,68,3,'#6c7c79');
    for(let n=0;n<5;n++)r.box(x,13,b+n*130,19,19,42,'#576f78');
   }
   // Control hut: a low flat box with panoramic green/blue windows and a lit gantry.
   r.box(-105,71,b-242,285,142,143,'#3f5964');r.box(-105,147,b-242,304,12,160,'#7f8e91');
   for(let n=0;n<5;n++){r.box(-211+n*53,95,b-169,44,39,3,'#172f3c');r.emissiveBox(-211+n*53,95,b-166,36,29,1,n%3?'#68b9bd':'#d1b171');}
   r.box(-92,32,b-165,50,64,6,'#29424a');r.box(-92,32,b-161,43,56,2,'#566c71');
   this.sign(r,'DOCK 07',-105,170,b-158,214,'#ffc75b',5);
   // Two large industrial pipes and a cargo crane make a distinct silhouette.
   for(const z of [b-355,b-392]){r.box(0,26,z,780,33,29,'#45616b');for(let x=-350;x<380;x+=105)r.box(x,26,z,9,43,39,'#72898e');}
   r.box(252,107,b-211,24,214,26,'#668187');r.box(184,217,b-211,196,16,25,'#668187');r.box(103,154,b-211,3,115,3,'#abc0b5');r.box(103,93,b-211,12,13,9,'#a7a47b');
   r.box(240,27,b-175,93,54,70,'#576d6d');for(const x of [212,267])r.box(x,27,b-139,4,45,2,'#96a28a');
   // Foreground floating walkway and moored utility boat.
   r.box(-190,-4,f+211,330,18,87,'#4f6872');for(const x of [-340,-50]){r.box(x,29,f+211,11,92,11,'#526c73');r.emissiveBox(x,76,f+211,11,4,11,this.palette.accent);}
   for(let x=-330;x<-50;x+=45){r.box(x,16,f+173,3,35,3,'#738b8b');r.box(x,16,f+248,3,35,3,'#738b8b');}for(const z of [f+173,f+248])r.box(-190,34,z,290,3,3,'#738b8b');
   r.box(-160,-5,f+97,55,12,155,'#3b5964');
   r.box(179,-15,f+300,125,24,69,'#344e5c');r.box(179,0,f+300,113,9,58,'#63828a');r.box(195,21,f+300,45,38,43,'#446877');r.emissiveBox(195,25,f+323,32,17,1,'#d6b76d');r.box(192,55,f+300,4,31,4,'#839a99');r.emissiveBox(192,72,f+300,8,4,8,'#fb6b87');
   // Distant seawall and repeated bollards: broad shapes stay readable in rain.
   r.box(0,17,b-690,1100,128,89,'#253f4b');
   for(let n=0;n<9;n++){const x=-440+n*110;r.box(x,67,b-650,18,184,20,'#455d67');r.emissiveBox(x,161,b-650,13,4,13,this.palette.accent);}
  },
  buildRoof(r,grid){
   const b=(grid.minY-.5)*54*1.06,f=(grid.maxY+.5)*54*1.06,e=(grid.maxX+.5)*54;
   r.box(0,-31,0,1600,30,2500,'#1a2d44');r.box(0,-9,b-170,820,15,320,'#465972');r.box(0,-7,f+234,830,18,440,'#40546e');
   for(const z of [b-320,f+450]){r.box(0,19,z,840,45,19,'#6a7c8d');r.box(0,44,z,850,5,24,'#8b9b9f');}
   // Asymmetrical access tower with a luminous door and two neon antenna blades.
   r.box(-200,87,b-182,235,174,148,'#475b77');r.box(-200,177,b-182,252,9,163,'#82929e');
   r.box(-200,61,b-105,60,122,8,'#20374e');r.box(-200,61,b-99,48,110,3,'#536b80');for(const x of [-237,-163])r.emissiveBox(x,65,b-93,3,102,2,this.palette.accent);
   this.sign(r,'ROOF 12',-200,136,b-98,175,'#83f4c6',4);
   for(const x of [-263,-137]){r.box(x,238,b-198,5,115,5,'#738798');r.emissiveBox(x,283,b-198,5,34,5,x<0?'#f35cbd':'#52d7ff');}
   // Roof machinery: three large cooling units with readable flat fan discs.
   for(let n=0;n<3;n++){const x=78+n*92,z=b-182;r.box(x,25,z,77,50,112,'#536c83');r.box(x,53,z,81,7,116,'#81929e');for(const dz of [-28,28]){r.disc(x,57,z+dz,24,'#233c50');r.ring(x,58,z+dz,24,'#8caaa9',2);for(let k=0;k<4;k++)r.box(x,59,z+dz,38,1.4,3,'#526e7c',k*Math.PI/4);}r.emissiveBox(x,21,z+57,47,3,1,'#718dff');}
   // Curved water tank silhouette built from low-segment spheres, not a loaded model.
   r.sphere(236,66,f+236,57,'#526f86',1,1.2,1,5,12);r.box(236,106,f+236,87,4,87,'#829ca7');r.box(236,145,f+236,7,51,7,'#819aa8');r.emissiveBox(236,172,f+236,9,6,9,'#f8816b');
   for(const x of [197,275])for(const z of [f+197,f+275])r.box(x,11,z,6,59,6,'#718b9b');
   for(let n=0;n<3;n++){const x=-252+n*82,z=f+218;r.box(x,21,z,65,42,100,'#536a82');for(let i=0;i<5;i++)r.box(x,44,z-39+i*19,53,2,5,'#243d54');r.emissiveBox(x,17,z+51,42,2,1,'#d87bce');}
   r.box(-120,10,f+345,260,17,33,'#617990');r.box(-265,10,f+304,33,17,110,'#617990');
   for(const x of [-135,135])r.box(x,40,f+436,4,80,4,'#6a8094');
   this.sign(r,'NIGHT AIR',0,60,f+436,282,'#ff67b4',5);
   // Perimeter skyline, separated from the roof by a dark gap.
   for(let n=0;n<8;n++){const x=-450+n*130,z=b-640,h=110+n*61%140;r.box(x,h/2-20,z,105,h,120,'#263e56');for(let row=0;row<4;row++)for(let c=0;c<3;c++)if((n+row*3+c)%4===0&&row*43+20<h-25)r.emissiveBox(x-30+c*30,row*43+20,z+61,10,14,1,'#9b927a');}
   for(const side of [-1,1])for(const z of [b-51,f+74]){r.box(side*(e+37),34,z,8,91,8,'#7f92a1');r.emissiveBox(side*(e+37),82,z,11,5,11,this.palette.fill);}
  },
  pool(r,x,y,z,rx,rz,col,strength){for(let i=0;i<20;i++){const a=i*Math.PI/10,b=(i+1)*Math.PI/10;r.transparentQuad([x,y,z],[x+Math.cos(a)*rx,y,z+Math.sin(a)*rz],[x+Math.cos(b)*rx,y,z+Math.sin(b)*rz],[x,y,z],col,[strength,0,0,strength]);}},
  draw(r,grid,time){
   const p=this.palette,b=(grid.minY-.5)*54*1.06,f=(grid.maxY+.5)*54*1.06,e=(grid.maxX+.5)*54;
   const t=this.clock??(typeof window!=='undefined'&&window.sceneLab?performance.now()/1000:time);
   // Large washes and broken colored reflections provide atmosphere without a bloom pass.
   if(this.place==='street'){
    this.pool(r,-254,4,b-43,130,65,'#ff54b6',.29);this.pool(r,264,4,b-41,130,65,'#55d1ff',.29);this.pool(r,0,4,b-30,115,40,p.accent,.32);
    for(const [x,y,z,c]of [[-254,158,b-104,'#f249b1'],[264,157,b-104,'#50c9ff'],[0,104,b-71,p.accent]])r.glow(x,y,z,30,c);
   }else if(this.place==='dock'){
    this.pool(r,-105,1,b-105,190,95,p.accent,.34);r.glow(-105,180,b-150,34,p.accent);
    for(let i=0;i<90;i++){const x=-690+(i*137%1380),z=b-780+(i*157%2250);if(Math.abs(x)<e+14&&z>b-30&&z<f+25)continue;const drift=Math.sin(t*.7+i)*4,w=11+(i%5)*6;const color=i%5===0?p.accent:p.fill;
     r.transparentQuad([x+drift,-38,z],[x+w+drift,-38,z],[x+w+drift,-38,z+1.6],[x+drift,-38,z+1.6],color,[.14,.3,.3,.14]);}
    // Broken vertical reflections beneath the floating dock and utility boat.
    for(const [x,z,c]of [[-335,f+250,p.accent],[-45,f+250,p.accent],[195,f+335,'#ffd38a']])for(let i=0;i<14;i++){
     const zz=z+i*7,w=(20-i*.8)*(1+.3*Math.sin(i*3+t*2)),xx=x+Math.sin(t*1.2+i*2)*4,a=(1-i/14)*.36;
     r.transparentQuad([xx-w/2,-37.5,zz],[xx+w/2,-37.5,zz],[xx+w/2,-37.5,zz+2],[xx-w/2,-37.5,zz+2],c,[a*.5,a,a,a*.5]);
    }
   }else{
    this.pool(r,-200,2,b-43,150,75,p.accent,.3);this.pool(r,0,4,f+355,170,65,'#ff62b7',.3);r.glow(-200,145,b-92,30,'#6cdbaf');r.glow(0,70,f+441,33,'#ef59ae');
   }
   // Wide, soft edge washes split the monochrome surfaces into warm and cool light.
   this.pool(r,-260,3.2,b+55,170,100,p.accent,.16);
   this.pool(r,270,3.2,f-60,160,100,p.fill,.11);
   // Colored wet streaks cluster at the edges, leaving the middle calm for bullets.
   for(let i=0;i<23;i++){const x=-300+(i*113%600),z=b+16+(i*127%88),w=7+(i%4)*7,c=x<0?'#f96cb5':p.fill;
    r.transparentQuad([x,2.7,z],[x+w,2.7,z],[x+w,2.7,z+2],[x,2.7,z+2],c,[.04,.12,.12,.04]);}
   // Two-layer mist strips, deliberately behind actors rather than a screen-wide veil.
   this.pool(r,0,-22,b-430,650,180,p.fog,.4);this.pool(r,0,-20,f+510,650,170,p.fog,.35);
   if(!this.rain)return;
   for(let i=0;i<280;i++){
    const travel=(((t*(220+i%3*28)-i*71)%390)+390)%390;
    const x=-480+(i*181%960)-.22*travel,z=b-710+(i*199%2010)+.035*travel,h=395-travel,len=26+(i%4)*9,dx=.22*len;
    const center=Math.abs(x)<165&&z>-120&&z<220,alpha=center?.14:.36;
    r.transparentQuad([x,h,z],[x+1.1,h,z],[x+dx+1.1,h+len,z-.035*len],[x+dx,h+len,z-.035*len],i%5===0?'#ffe3a4':this.look==='green'?'#aacbb7':'#a8c9e8',[alpha,alpha,0,0]);
   }
   // Sparse spreading ripple rings on the floor: low contrast and finite work.
   for(let i=0;i<14;i++){
    const x=-320+(i*157%640),z=b+8+(i*83%590),age=(t*.83+i*.231)%1,radius=2+age*10,a=(1-age)*.13;
    for(let n=0;n<8;n++){const aa=n*Math.PI/4,bb=(n+1)*Math.PI/4,pt=(u,rad)=>[x+Math.cos(u)*rad,2.9,z+Math.sin(u)*rad];r.transparentQuad(pt(aa,radius),pt(bb,radius),pt(bb,radius-1),pt(aa,radius-1),p.fill,[a,a,0,0]);}
   }
  }
 });
 Object.defineProperty(StreetScene,'palette',{get(){return schemes[this.look]||schemes.green;},configurable:true});
 Object.defineProperty(StreetScene,'revision',{get(){return '6-'+this.place+'-'+this.look;},configurable:true});
})();

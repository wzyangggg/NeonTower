'use strict';
// Procedural scene study: no imported models, image textures or runtime dependencies.
const StreetScene={
 enabled:typeof location!=='undefined'&&new URLSearchParams(location.search).get('scene')==='street',
 revision:3,
 lighting(r){r.cameraScale=1.12;r.clubCyan=.52;r.clubMagenta=.52;r.rearLeftColor=[.68,.42,.2];r.rearRightColor=[.2,.42,.68];r.topLight=[1,1.04,1.12];},
 build(r,grid,tiles,floorOnly=false){
  const tile=LIFT_MAP.tile,back=(grid.minY-.5)*tile*1.06,front=(grid.maxY+.5)*tile*1.06,edge=(grid.maxX+.5)*tile;
  const box=(...v)=>r.box(...v),lit=(...v)=>r.emissiveBox(...v);
  const flat=(x,z,w,d,c,y=2.6)=>box(x,y,z,w,.35,d,c);
  const glyphs={A:['010','101','111','101','101'],B:['110','101','110','101','110'],C:['011','100','100','100','011'],D:['110','101','101','101','110'],E:['111','100','110','100','111'],F:['111','100','110','100','100'],I:['111','010','010','010','111'],L:['100','100','100','100','111'],N:['101','111','111','111','101'],O:['111','101','101','101','111'],P:['110','101','110','100','100'],R:['110','101','110','101','101'],S:['011','100','010','001','110'],T:['111','010','010','010','010'],U:['101','101','101','101','111'],V:['101','101','101','101','010'],0:['111','101','101','101','111'],1:['010','110','010','010','111'],2:['110','001','010','100','111'],4:['101','101','111','001','001'],7:['111','001','010','010','010']};
  const label=(text,x,y,z,size,c,ground=false)=>{let left=x-(text.length*4-1)*size/2;for(let n=0;n<text.length;n++){const g=glyphs[text[n]];if(!g)continue;for(let j=0;j<5;j++)for(let i=0;i<3;i++)if(g[j][i]==='1'){const px=left+(n*4+i)*size;if(ground)lit(px,y,z+j*size,size*.82,.25,size*.82,c);else lit(px,y+(4-j)*size,z,size*.82,size*.82,.4,c);}}};
  const shadow=(x,z,w,d)=>flat(x+5,z+9,w,d,'#101a25',-.3);
  const bollard=(x,z)=>{box(x,14,z,9,28,9,'#566273');for(const y of [8,21])box(x,y,z+4.7,9,5,.5,'#c3a463');box(x,29,z,11,3,11,'#87939e');};
  const crate=(x,z,size=24)=>{shadow(x,z,size+6,size+4);box(x,size/2,z,size,size,size,'#646b6b');box(x,size/2,z+size/2+.2,size-4,size-5,.6,'#3e4c57');for(const side of [-1,1])box(x+side*size*.3,size/2,z+size/2+1,2,size-3,1,'#8c8c7b');};
  // The night-city deck uses cut-corner metal plates; gameplay cells stay square.
  const cutPlate=(x,z,w,d,bottom,top,col)=>{
   const cut=5.5,ring=(inset,y)=>{const hw=w/2-inset,hd=d/2-inset,c=cut-inset*.25;return [[-hw+c,y,-hd],[hw-c,y,-hd],[hw,y,-hd+c],[hw,y,hd-c],[hw-c,y,hd],[-hw+c,y,hd],[-hw,y,hd-c],[-hw,y,-hd+c]].map(p=>[p[0]+x,p[1],p[2]+z]);},lower=ring(0,bottom),shoulder=ring(0,top-1.2),lid=ring(1,top);
   for(let n=0;n<8;n++){const next=(n+1)%8;r.quad(lower[n],lower[next],shoulder[next],shoulder[n],'#30394d');r.quad(shoulder[n],shoulder[next],lid[next],lid[n],n%2?'#6a768c':'#59687c');}
   for(let n=1;n<7;n++)r.quad(lid[0],lid[n],lid[n+1],lid[0],col);
  };
  // Matte modular plates; unavailable cells remain recessed sockets, not walkable road.
  box(0,-14,(back+front)/2,edge*2+16,18,front-back+16,'#111d2b');
  for(let gy=grid.minY;gy<=grid.maxY;gy++)for(let gx=grid.minX;gx<=grid.maxX;gx++){
   const t=tiles.find(t=>t.x===gx&&t.y===gy),x=gx*tile,z=gy*tile*1.06,start=r.count;
   // Keep slab tops below their finish plates to avoid depth flicker on mobile GPUs.
   if(!(t&&this.place==='abyss'))box(x,t?-2.5:-7,z,tile-1.3,t?8:4,tile*1.06-1.3,t?'#344352':this.place==='abyss'?'#2c3448':'#172330');
   if(t){const c=t.medical?'#3f6960':t.shieldTile?'#3b617a':t.cashTile?'#71684a':t.shockTile?'#425b76':(gx+gy)%3===0?'#505e70':'#485669';if(this.place==='abyss')cutPlate(x,z,tile-1.8,tile*1.06-1.8,-6,2,c);else box(x,1.8,z,tile-1.5,.4,tile*1.06-1.5,c);r.markPhosphor(start,.2);
    // Two tiny fasteners per plate, rather than repeated circuit graphics.
    for(const s of [-1,1])flat(x+s*22,z+s*24,1.8,1.8,'#263444',2.15);
    if(t.medical){flat(x,z,23,7,'#a7cfc2',2.4);flat(x,z,7,23,'#a7cfc2',2.4);}
    if(t.shieldTile){flat(x,z-3,21,14,'#90b9cf',2.4);flat(x,z+7,13,7,'#90b9cf',2.4);}
    if(t.cashTile)label('P',x,2.4,z-9,4,'#c3b67f',true);
    for(const [dx,dy]of [[-1,0],[1,0],[0,-1],[0,1]])if(!tiles.some(q=>q.x===gx+dx&&q.y===gy+dy))flat(x+dx*25,z+dy*27,dx?2.2:32,dy?2.2:32,'#899185',2.3);
   }else{box(x,this.place==='abyss'?.15:-4.8,z,tile-6,.5,tile*1.06-6,this.place==='abyss'?'#303b4d':'#202d3c');if(this.place==='abyss')r.markPhosphor(start,.11);if(this.place!=='abyss')flat(x,z,16,2,'#344353',-4.3);}
  }
  // Low curb never hides the player at the bottom edge.
  for(const s of [-1,1]){box(s*(edge+10),5,(back+front)/2,16,18,front-back+20,'#53616c');box(s*(edge+10),15,(back+front)/2,18,3,front-back+20,'#7a8791');for(let z=back+20;z<front;z+=145){box(s*(edge+10),23,z,19,16,19,'#3d5060');lit(s*(edge+10),32,z,9,2,10,'#74b8bb');}}
  box(0,-3,front+8,edge*2+38,14,18,'#4b5866');
  if(this.place!=='abyss')for(let x=-edge+8;x<edge;x+=28){box(x,4.3,front+10,14,.5,11,'#9b8959',-.3);}
  if(floorOnly)return;
  // Upper service sidewalk and three very simple street facades.
  box(0,-6,back-89,900,12,174,'#495361');box(0,1,back-18,900,4,22,'#76828b');
  for(let x=-420;x<440;x+=42)flat(x,back-23,1,12,'#3d4a57',3.2);
  const buildings=[{x:-254,w:220,h:176,d:132,c:'#3d4f66'},{x:0,w:252,h:235,d:160,c:'#445166'},{x:264,w:220,h:164,d:132,c:'#354e60'}];
  for(const b of buildings){const z=back-178,bf=z+b.d/2;
   shadow(b.x,z,b.w+24,b.d+20);box(b.x,b.h/2,z,b.w,b.h,b.d,b.c);
   box(b.x,b.h+2,z,b.w+10,7,b.d+10,'#526179');box(b.x,b.h+7,z,b.w-8,4,b.d-8,'#29394e');
   for(const sx of [-1,1])box(b.x+sx*(b.w/2-2),b.h/2,bf+1,6,b.h,6,'#627083');
   box(b.x,13,bf+3,b.w,25,7,'#263344');
   if(b.x!==0){box(b.x,48,bf+6,122,88,7,'#141f2b');box(b.x,48,bf+11,108,76,3,'#4e5967');for(let y=18;y<85;y+=10)box(b.x,y,bf+13,108,1,1,'#293745');for(const dx of [-50,0,50]){box(b.x+dx,126,bf+3,25,23,3,'#172331');lit(b.x+dx,126,bf+5,18,15,1,'#c99d59');}
    if(b.x<0){box(b.x,98,bf+22,148,5,43,'#3e7b80');for(let i=0;i<7;i++)box(b.x-63+i*21,101,bf+22,10,1,43,'#4c8c8f');for(const s of [-1,1])box(b.x+s*69,49,bf+42,3,97,3,'#546c74');label('SERVICE',b.x,150,bf+4,3,'#b7d0c5');box(b.x,90,bf+10,112,3,4,'#31434e');lit(b.x,87,bf+13,105,2,3,'#c7ac76');
     // A roof duct and paired exhausts give the large flat roof scale.
     box(b.x-35,b.h+14,z-10,67,18,37,'#5e7283');for(let i=0;i<5;i++)box(b.x-35,b.h+24,z-23+i*6,53,1,2,'#263b4c');box(b.x+57,b.h+23,z+18,14,35,14,'#6a7f8d');box(b.x+57,b.h+42,z+18,23,5,23,'#8a9a9f');}
    else {label('DEPOT',b.x,146,bf+4,3,'#81a9b5');box(b.x-30,b.h+22,z+10,46,32,46,'#697789');for(let n=0;n<4;n++)box(b.x-30,b.h+39,z-5+n*8,34,1,2,'#283c4e');}
   }else{
    box(0,86,bf+5,172,172,12,'#142230');for(const s of [-1,1]){box(s*42,84,bf+12,81,156,5,'#596474');box(s*42,84,bf+15,73,145,1,'#454f60');box(s*92,90,bf+14,8,148,9,'#202e3c');lit(s*92,105,bf+20,4,69,2,'#e8b86b');}
    box(0,181,bf+13,185,28,8,'#172838');label('LIFT 01',0,175,bf+18,3.4,'#c9c7a1');
    for(let y=12;y<150;y+=32)box(0,y,bf+16,1,18,1,'#7b8690');
    for(const s of [-1,1]){box(s*43,85,bf+16,65,1,1,'#75808c');box(s*43,39,bf+16,65,1,1,'#75808c');}
    box(35,b.h+22,z-10,53,35,45,'#6a7685');box(-70,b.h+30,z-15,5,58,5,'#66758b');
   }
   // Roof perimeter makes the boxes read as buildings.
   for(const s of [-1,1]){box(b.x+s*(b.w/2),b.h+11,z,5,14,b.d,'#69758a');box(b.x,b.h+11,z+s*b.d/2,b.w,14,5,'#69758a');}
  }
  // Tall, muted silhouettes behind the frontage fill the upper portrait frame.
  for(let n=0;n<9;n++){const x=-440+n*110,h=170+(n*79%150),z=back-450-(n%3)*40;box(x,h/2-35,z,99,h,132,n%2?'#26354a':'#293b50');box(x,h-32,z,103,5,136,'#3c4d66');for(let row=0;row<5;row++)for(let col=0;col<3;col++){if(35+row*51>h-47)continue;const on=(n*7+row*3+col*5)%7<2;box(x-30+col*30,35+row*51,z+67,13,19,1,'#162738');if(on)lit(x-30+col*30,35+row*51,z+68,10,15,1,'#9d8c65');}}
  // Recognizable props assembled from cuboids/cylinders only.
  box(322,34,back-59,32,68,26,'#3d7188');box(322,40,back-45,25,45,2,'#142f42');lit(319,47,back-43,17,23,1,'#91c4bd');for(let n=0;n<3;n++)lit(331,51-n*9,back-43,3,3,1,'#c0ac73');box(322,13,back-43,17,5,2,'#122333');
  crate(-342,back-53,25);crate(-315,back-68,20);crate(172,back-61,27);
  for(const x of [-181,186]){box(x,35,back-104,31,22,12,'#7a8790');for(let y=29;y<44;y+=4)box(x,y,back-97,23,1,1,'#243a4c');}
  for(const x of [-105,105])bollard(x,back-43);
  for(const x of [-391,391]){box(x,70,back-52,5,140,5,'#7d8790');box(x+12,140,back-52,28,5,10,'#506170');lit(x+19,136,back-52,17,2,9,'#dfb877');}
  // Lower service road, crosswalk, small car and clipped sidewalk corners.
  box(0,-17,front+370,1000,20,700,'#252f42');box(0,-5,front+35,960,8,41,'#65707d');
  for(let x=-430;x<470;x+=65)flat(x,front+185,31,4,'#8f969a',-6.5);
  for(let n=0;n<5;n++)flat(-285+n*24,front+147,13,97,'#a5a9a7',-6.3);
  for(const z of [front+65,front+296])flat(0,z,900,2,'#8b805d',-6.2);
  box(0,-1,front+340,960,24,60,'#4b596a');for(let x=-450;x<450;x+=60)flat(x,front+320,1,20,'#2d3c4e',11.2);
  const car=(x,z)=>{shadow(x,z,103,55);for(const a of [-1,1])for(const b of [-1,1])box(x+a*33,-1,z+b*24,16,15,9,'#132231');box(x,10,z,110,22,48,'#596e80');box(x+4,28,z,55,22,43,'#42596f');for(const s of [-1,1])box(x+4,29,z+s*22,43,13,1,'#152a3e');box(x+4,40,z,51,2,39,'#718395');for(const s of [-1,1]){lit(x-56,10,z+s*16,1,8,9,'#e0c187');lit(x+56,10,z+s*16,1,6,7,'#ac6359');}};
  car(205,front+230);
  label('DEPOT 07',0,-6,front+100,5,'#617e7e',true);
  // Bottom roof corners anchor the composition without covering the arena.
  for(const s of [-1,1]){box(s*365,36,front+490,180,110,188,'#2b3c52');box(s*365,94,front+490,194,9,200,'#56667d');box(s*365,103,front+490,177,8,182,'#31435c');box(s*360,120,front+475,45,28,39,'#69788b');for(let n=0;n<4;n++)box(s*360,135,front+460+n*9,34,1,3,'#273d53');}
  // Parking markings and a foreground sidewalk give the bottom space a purpose.
  for(const x of [-188,0,188]){flat(x,front+430,2,104,'#4e5f70',-6);flat(x+68,front+481,138,2,'#4e5f70',-6);}
  for(const x of [-235,235]){box(x,16,front+337,9,34,9,'#506378');lit(x,34,front+337,8,3,8,'#659ba7');}
  crate(-236,front+366,23);crate(-210,front+371,17);
 },
 draw(r,grid,time){
  // Small moving road signal supplies motion without noisy floor animation.
  const back=(grid.minY-.5)*LIFT_MAP.tile*1.06;
  // Low-alpha geometric light pools on the sidewalk; no image or lighting trick in the arena.
  const pool=(x,z,rx,rz,col,strength)=>{for(let i=0;i<20;i++){const a=i*Math.PI/10,b=(i+1)*Math.PI/10;r.transparentQuad([x,3.4,z],[x+Math.cos(a)*rx,3.4,z+Math.sin(a)*rz],[x+Math.cos(b)*rx,3.4,z+Math.sin(b)*rz],[x,3.4,z],col,[strength,0,0,strength]);}};
  pool(0,back-40,122,50,'#e6b46c',.2);pool(-254,back-51,86,32,'#e8c18a',.18);pool(322,back-42,35,28,'#7cd4ce',.18);
  for(const s of [-1,1]){r.glow(s*92,105,back-77,10,'#e8b86b');r.glow(s*391+19,136,back-52,7,'#dfb877');}
 }
};

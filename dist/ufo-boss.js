'use strict';
const UFO_BOSS_HP=360,UFO_REBUILD_TIME=6,UFO_MINION_CAP=8;
const UFO_LAUNCH_DURATION=.8;
function ufoWaveSize(phase){return Math.min(UFO_MINION_CAP,phase*2);}
function livingUFOMinions(){return enemies.filter(e=>e.type==='ufoMinion'&&e.hp>0&&e.parent===ufoBoss);}
function ufoShieldActive(e){return e?.type==='ufoBoss'&&e.hp>0&&livingUFOMinions().length>0;}
function deployUFOWave(e){
 if(e.hp<=0)return;
 e.phase++;e.rebuild=null;e.hadWave=true;
 const count=ufoWaveSize(e.phase);
 for(let i=0;i<count;i++){
  const a=i*TAU/count,hp=5,ux=Math.cos(a),uy=Math.sin(a);
  const x=Math.max(A.x+24,Math.min(A.x+A.w-24,e.x+ux*42)),y=Math.max(A.y+24,Math.min(A.y+A.h-24,e.y+uy*42));
  const distance=Math.max(0,Math.min(150,ux>0?(A.x+A.w-24-x)/ux:ux<0?(A.x+24-x)/ux:Infinity,uy>0?(A.y+A.h-24-y)/uy:uy<0?(A.y+24-y)/uy:Infinity));
  enemies.push({type:'ufoMinion',parent:e,x,y,r:23,hp,max:hp,t:i*.3,seed:i,angle:0,fire:1.5+i*.24,hitAt:-Infinity,roamLeft:0,launchLeft:UFO_LAUNCH_DURATION,launchAngle:a,launchDistance:distance});
 }
 burst(e.x,e.y,'#88ffb0',20);beep(600,.12,'triangle',.025);
}
function spawnUFOBoss(){
 ufoBoss={type:'ufoBoss',x:325,y:245,r:64,hp:UFO_BOSS_HP,max:UFO_BOSS_HP,t:0,seed:0,angle:0,phase:0,rebuild:null,fire:2,hitAt:-Infinity};
 enemies=[ufoBoss];deployUFOWave(ufoBoss);
}
function updateUFOBoss(dt){
 const e=ufoBoss;if(!e||e.hp<=0)return;const coverX=e.x,coverY=e.y;e.t+=dt;
 // The mother moves toward the player, naturally competing for nearest targeting.
 const dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy),move=Math.min(Math.max(0,d-100),58*dt);
 if(d){e.x+=dx/d*move;e.y+=dy/d*move;}
 e.x=Math.max(A.x+70,Math.min(A.x+A.w-70,e.x));e.y=Math.max(A.y+70,Math.min(A.y+A.h-70,e.y));
 resolveEnemyCover(e,coverX,coverY);e.angle=Math.atan2(dx,dy);
 if(!livingUFOMinions().length&&e.hadWave){
  e.hadWave=false;e.rebuild=UFO_REBUILD_TIME;
  burst(e.x,e.y,'#baffef',24);beep(250,.18,'triangle',.03);
 }else if(e.rebuild!==null){e.rebuild=Math.max(0,e.rebuild-dt);if(e.rebuild===0)deployUFOWave(e);}
 updateUFOFire(e,dt,true);
 for(const child of livingUFOMinions()){if(child.terrainStun>0)continue;let coverX=child.x,coverY=child.y;
  child.t+=dt;
  const before=child.launchLeft,launch=Math.min(dt,before);child.launchLeft=Math.max(0,before-launch);
  const travel=child.launchDistance*(before**3-child.launchLeft**3)/UFO_LAUNCH_DURATION**3;
  child.x+=Math.cos(child.launchAngle)*travel;child.y+=Math.sin(child.launchAngle)*travel;
  resolveEnemyCover(child,coverX,coverY);coverX=child.x;coverY=child.y;
  const active=dt-launch;if(active<=0)continue;
  child.roamLeft-=active;
  if(child.roamLeft<=0||Math.hypot(child.roamX-child.x,child.roamY-child.y)<8){child.roamX=A.x+24+Math.random()*(A.w-48);child.roamY=A.y+24+Math.random()*(A.h-48);child.roamLeft=1.5+Math.random()*2;}
  const cx=child.roamX-child.x,cy=child.roamY-child.y,len=Math.hypot(cx,cy),step=Math.min(len,88*active);
  if(len){child.x+=cx/len*step;child.y+=cy/len*step;}child.angle=Math.atan2(cx,cy);
  resolveEnemyCover(child,coverX,coverY);updateUFOFire(child,active,false);if(state!=='combat')return;
 }
}
function updateUFOFire(e,dt,mother){
 e.fire-=dt;e.warn=e.fire<.6;
 if(e.fire<=0){
  const aim=Math.atan2(p.y-e.y,p.x-e.x),count=mother?5:3;
  for(let i=0;i<count;i++){const a=aim+(i-(count-1)/2)*.22;bullets.push({x:e.x,y:e.y,vx:Math.cos(a)*(mother?145:175),vy:Math.sin(a)*(mother?145:175),r:mother?5:4,life:6,c:mother?'#95ffc2':'#ffe58b'});}
  e.fire=mother?2.3:2.8;e.warn=false;
 }
 if(Math.hypot(p.x-e.x,p.y-e.y)<e.r+5+drinkPlayerRadius()-4)hurt(e);
}
function buildUFOShell(){
 const r=renderer;
 // Broad faceted silver saucer, green rim lamps and an open glass cage.
 r.sphere(0,0,0,58,'#929bc5',1,.22,1,4,12);
 r.sphere(0,5,0,49,'#c1d8e5',1,.20,1,3,12);
 r.ring(0,-4,0,51,'#5f789c',5);
 for(let i=0;i<8;i++){const a=i*TAU/8;r.sphere(Math.cos(a)*43,9,Math.sin(a)*43,9,'#5bffac',1,.45,1,3,6);}
 r.sphere(0,-12,0,22,'#91ffc2',1,.3,1,3,10);
 for(const side of [-1,1]){
  r.sphere(side*22,26,-7,3,'#6c8eae',1,7,1,4,6);
  r.sphere(side*16,44,-7,3,'#6c8eae',1.8,1,1,3,6);
 }
 r.ring(0,12,0,28,'#a9dce6',2);
 // Cute green pilot: large head, huge dark eyes, highlights and tiny smile.
 r.sphere(0,23,0,12,'#38de8c',.8,1, .7,4,10);
 r.sphere(0,40,0,21,'#55f59c',1,1,.7,6,12);
 for(const side of [-1,1]){
  r.sphere(side*9,42,13,8,'#253856',.75,1,.28,5,10);
  r.sphere(side*9-2,45,15,2.2,'#eaffdb',1,1,.4,3,6);
  r.sphere(side*16,32,12,4,'#9affbb',1,.45,.3,3,6);
  r.sphere(side*15,25,0,6,'#43ed98',1.4,.65,.7,4,8);
  r.box(side*3,32,15,4,2,1,'#2e6359',side*.35);
 }
 r.box(0,59,0,2,12,2,'#53d68f');r.sphere(0,66,0,5,'#83ffab',1,1,1,4,8);
}
function ufoWobblePose(e,x,y,z,scale){
 // Slow spin plus mismatched rocking rhythms: tipsy, rather than a rigid orbit.
 const t=e.t,offset=(e.seed||0)*1.91,mother=e.type==='ufoBoss';
 const yaw=t*(mother?.96:1.44)+offset+.32*Math.sin(t*1.3+offset);
 const pitch=.10*Math.sin(t*1.8+offset)+.03*Math.sin(t*3.1+offset);
 const roll=.12*Math.cos(t*1.45+offset)+.025*Math.sin(t*2.7-offset);
 const c=Math.cos(yaw),s=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch),cr=Math.cos(roll),sr=Math.sin(roll);
 // R_y * R_x * R_z; tilt around the saucer centre, then spin about world up.
 return [(c*cr+s*sp*sr)*scale,(-c*sr+s*sp*cr)*scale,s*cp*scale,x,
  cp*sr*scale,cp*cr*scale,-sp*scale,y,
  (-s*cr+c*sp*sr)*scale,(s*sr+c*sp*cr)*scale,c*cp*scale,z];
}
function ufoHoverHeight(e){return (e.type==='ufoBoss'?52:30+(e.launchLeft||0)/UFO_LAUNCH_DURATION*22)+Math.sin(e.t*2.1+(e.seed||0))*5;}
function buildUFOGlass(){
 const r=renderer,point=(i,j)=>{const a=i*Math.PI/16,b=j*TAU/24;return [Math.sin(a)*Math.cos(b)*35,37+Math.cos(a)*35,Math.sin(a)*Math.sin(b)*35];};
 for(let i=0;i<16;i++)for(let j=0;j<24;j++)r.emissiveQuad(point(i,j),point(i,j+1),point(i+1,j+1),point(i+1,j),'#89cada');
}
let ufoShieldCells=null;
function ufoHexShieldCells(){
 if(ufoShieldCells)return ufoShieldCells;
 // Dual of a subdivided icosahedron: 150 hexagons and 12 pole pentagons.
 const f=(1+Math.sqrt(5))/2,unit=a=>{const length=Math.hypot(...a);return a.map(v=>v/length);};
 const vertices=[[-1,f,0],[1,f,0],[-1,-f,0],[1,-f,0],[0,-1,f],[0,1,f],[0,-1,-f],[0,1,-f],[f,0,-1],[f,0,1],[-f,0,-1],[-f,0,1]].map(unit);
 let faces=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
 for(let step=0;step<2;step++){
  const cache=new Map(),mid=(a,b)=>{const key=Math.min(a,b)+','+Math.max(a,b);if(!cache.has(key)){cache.set(key,vertices.length);vertices.push(unit(vertices[a].map((v,i)=>v+vertices[b][i])));}return cache.get(key);};
  faces=faces.flatMap(([a,b,c])=>{const ab=mid(a,b),bc=mid(b,c),ca=mid(c,a);return [[a,ab,ca],[b,bc,ab],[c,ca,bc],[ab,bc,ca]];});
 }
 const centres=faces.map(face=>unit([0,1,2].map(i=>face.reduce((sum,index)=>sum+vertices[index][i],0))));
 ufoShieldCells=vertices.map((normal,index)=>{
  const seed=Math.abs(normal[1])<.9?[0,1,0]:[1,0,0],cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],u=unit(cross(normal,seed)),v=cross(normal,u),dot=(a,b)=>a.reduce((sum,n,i)=>sum+n*b[i],0);
  return centres.filter((_,i)=>faces[i].includes(index)).sort((a,b)=>Math.atan2(dot(a,v),dot(a,u))-Math.atan2(dot(b,v),dot(b,u))).map(a=>a.map(n=>n*93));
 });
 return ufoShieldCells;
}
function buildUFOHexShield(edges){
 const r=renderer;
 for(const cell of ufoHexShieldCells()){
  const centre=[0,1,2].map(i=>cell.reduce((sum,p)=>sum+p[i],0)/cell.length);
  for(let i=0;i<cell.length;i++){
   const a=cell[i],b=cell[(i+1)%cell.length];
   if(!edges){r.emissiveQuad(centre,a,b,centre,'#68dfc8');continue;}
   const delta=b.map((n,j)=>n-a[j]),radial=a.map((n,j)=>n+b[j]),cross=[delta[1]*radial[2]-delta[2]*radial[1],delta[2]*radial[0]-delta[0]*radial[2],delta[0]*radial[1]-delta[1]*radial[0]],length=Math.hypot(...cross),u=cross.map(n=>n/length*.38);
   // Slight outward extrusion gives the bright edges thickness from every view.
   const p=(at,side,height)=>at.map((n,j)=>n*(1+height*.006)+side*u[j]);
   r.emissiveQuad(p(a,-1,0),p(b,-1,0),p(b,1,0),p(a,1,0),'#69f9de');
   r.emissiveQuad(p(a,-1,1),p(b,-1,1),p(b,1,1),p(a,1,1),'#69f9de');
  }
 }
}
function buildUFOShieldIcon(){
 const r=renderer,outline=[[-6,6],[6,6],[6,-1],[0,-7],[-6,-1]],point=(p,scale=1)=>[p[0]*scale,p[1]*scale*.53,-p[1]*scale*.85];
 for(let i=0;i<outline.length;i++){const a=outline[i],b=outline[(i+1)%outline.length];r.emissiveQuad(point(a),point(b),point(b,.68),point(a,.68),'#9effe5');}
 r.emissiveBox(0,0,0,2,3,1,'#9effe5');
}
function drawUFOShieldLink(a,b){
 const r=renderer,delta=b.map((value,i)=>value-a[i]),length=Math.hypot(...delta);
 if(length<.001)return;
 const axis=delta.map(value=>value/length),horizontal=Math.hypot(axis[0],axis[2]);
 const u=horizontal>.001?[axis[2]/horizontal,0,-axis[0]/horizontal]:[1,0,0];
 const v=[axis[1]*u[2]-axis[2]*u[1],axis[2]*u[0]-axis[0]*u[2],axis[0]*u[1]-axis[1]*u[0]],width=5;
 const mid=a.map((value,i)=>(value+b[i])/2);
 r.residentMaterial('ufo:shield-link',()=>r.emissiveBox(0,0,0,1,1,1,'#79ffe1'),
  [u[0]*width,delta[0],v[0]*width,mid[0],u[1]*width,delta[1],v[1]*width,mid[1],u[2]*width,delta[2],v[2]*width,mid[2]],.38);
}
function drawUFOEnemy(e){
 const r=renderer,mother=e.type==='ufoBoss',scale=mother?1.15:.43,x=e.x-325,z=(e.y-300)*1.06,y=ufoHoverHeight(e);
 r.residentMesh('ufo:shadow',()=>r.disc(0,0,0,54,'#344950'),monsterPose(x,2,z,0,scale,1,scale));
 r.residentMesh('ufo:shell',buildUFOShell,ufoWobblePose(e,x,y,z,scale),enemyHitFeedback(e));
 r.residentMaterial('ufo:glass',buildUFOGlass,ufoWobblePose(e,x,y,z,scale),.78,2,e.t);
 if(mother&&ufoShieldActive(e)){
  const pulse=1+.035*Math.sin(e.t*5);
  const shieldPose=ufoWobblePose(e,x,y+24,z,pulse);
  r.residentMaterial('ufo:shield-faces',()=>buildUFOHexShield(false),shieldPose,.025);
  r.residentMaterial('ufo:shield-edges',()=>buildUFOHexShield(true),shieldPose,.88,1,e.t);
  if(time-(e.shieldHitAt??-Infinity)<.12)r.glow(x,y+14,z,19,'#b5fff0');
  for(const child of livingUFOMinions()){let coverX=child.x,coverY=child.y;
   const cx=child.x-325,cz=(child.y-300)*1.06,cy=ufoHoverHeight(child)+5;
   drawUFOShieldLink([cx,cy,cz],[x,y+12,z]);
   r.glow(cx,cy,cz,4,'#90ffd4');
  }
 }
 if(!mother){
  r.residentMesh('ufo:shield-icon',buildUFOShieldIcon,monsterPose(x,y+43,z));
  if(e.launchLeft>0)for(let i=1;i<=3;i++)r.glow(x-Math.cos(e.launchAngle)*i*10,y,z-Math.sin(e.launchAngle)*i*10*1.06,7-i,'#b0fff1');
 }
 if(e.warn)r.glow(x,y-10,z,mother?12:5,'#ffeaa1');
 drawMonsterHealthBar(x,y+82*scale,z,e.hp,e.max,mother?10:5,mother?100:30,4,ufoShieldActive(e)?'#83e9ff':'#9affac',e);
}
function ufoBossTestHud(){
 const e=ufoBoss;if(!e)return;const count=livingUFOMinions().length;
 $('zone').textContent='飞碟 BOSS 测试场';$('status').textContent='绿色星际访客 · 阶段 '+e.phase;
 $('wave').textContent=count?'护盾开启 · 小飞碟 '+count+' · 靠近小飞碟转火':e.rebuild!==null?'护盾解除 · '+e.rebuild.toFixed(1)+' 秒后重生 '+ufoWaveSize(e.phase+1)+' 架':'护盾解除 · 准备重生';
 $('ufo-boss-health').textContent=Math.ceil(Math.max(0,e.hp))+' / '+e.max;
 $('ufo-boss-health').style.setProperty('--snake-hp',Math.max(0,e.hp/e.max*100)+'%');
}
function finishUFOBossTest(won){
 state=won?'menu':'dead';cleared=won;paused=false;releaseJoy();enemies=[];bullets=[];shots=[];missiles=[];hazards=[];
 showOverlay('<div class="tag">UFO LAB</div><h2>'+(won?'星际访客已击败':'测试结束')+'</h2><p>清理小飞碟解除护盾，抓住重生前的攻击窗口。</p><button class="primary" id="ufo-again">重新测试</button><a href="index.html">返回普通游戏</a>');$('ufo-again').onclick=startUFOBossTest;syncMusic();
}
function startUFOBossTest(){
 reset();ufoBossTest=true;testMode=true;state='combat';phase=0;scroll=0;cleared=false;paused=false;
 $('viewport').classList.remove('falling','landing','boss-intro','paused');clearTimeout(toast.timer);$('toast').classList.remove('show');
 tiles=[];syncGrid();for(let y=grid.minY;y<=grid.maxY;y++)for(let x=grid.minX;x<=grid.maxX;x++)tiles.push({x,y,healProgress:0,healFlash:0,medPack:false});
 p.x=325;p.y=435;p.hp=p.max=8;p.inv=2;spawnQueue=[];chaserSpawned=999;spawnTimer=999;weapon=createWeapon('rifle');shootTimer=1.5;spawnUFOBoss();renderer.sceneKey=null;renderer.sceneData=null;
 $('overlay').style.display='none';$('ufo-boss-tools').hidden=false;$('ufo-boss-restart').onclick=startUFOBossTest;
 $('ufo-boss-god').onclick=()=>{ufoBossGod=!ufoBossGod;$('ufo-boss-god').textContent='无敌 '+(ufoBossGod?'ON':'OFF');};$('ufo-boss-god').textContent='无敌 '+(ufoBossGod?'ON':'OFF');
 updateUI();ufoBossTestHud();draw();syncMusic();
}

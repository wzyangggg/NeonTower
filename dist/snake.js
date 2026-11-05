'use strict';
// Every segment is a normal combat target. Removal preserves surviving objects,
// so homing shots, hit deduplication and debuffs keep their original identities.
const SNAKE_GAP=34;
const SNAKE_SPEED=135,SNAKE_ROUTE_LENGTH=1300+TAU*90;
// Broad rounded rectangle: its loop is longer than the full body, with enough
// clearance between opposite lanes to keep distant segments from piling up.
function snakeRouteBase(distance){
 let d=((distance%SNAKE_ROUTE_LENGTH)+SNAKE_ROUTE_LENGTH)%SNAKE_ROUTE_LENGTH;
 const arc=(x,y,start)=>{const a=start+d/90;return {x:x+Math.cos(a)*90,y:y+Math.sin(a)*90,angle:a+Math.PI/2};};
 if(d<390)return {x:130+d,y:130,angle:0};d-=390;
 if(d<TAU*90/4)return arc(520,220,-Math.PI/2);d-=TAU*90/4;
 if(d<260)return {x:610,y:220+d,angle:Math.PI/2};d-=260;
 if(d<TAU*90/4)return arc(520,480,0);d-=TAU*90/4;
 if(d<390)return {x:520-d,y:570,angle:Math.PI};d-=390;
 if(d<TAU*90/4)return arc(130,480,Math.PI/2);d-=TAU*90/4;
 if(d<260)return {x:40,y:480-d,angle:-Math.PI/2};d-=260;
 return arc(130,220,Math.PI);
}
function snakeRoutePose(distance){
 const point=d=>{const q=snakeRouteBase(d),wave=Math.sin(d*TAU/260)*20;return {x:q.x-Math.sin(q.angle)*wave,y:q.y+Math.cos(q.angle)*wave};};
 const q=point(distance),next=point(distance+1);return {...q,angle:Math.atan2(next.y-q.y,next.x-q.x)};
}
function sampleSnakeTrail(trail,at){
 let i=0;while(i<trail.length-2&&trail[i+1].at>at)i++;
 const front=trail[i],back=trail[i+1]||front,span=front.at-back.at,t=span>1e-6?Math.max(0,Math.min(1,(front.at-at)/span)):0;
 return {x:front.x+(back.x-front.x)*t,y:front.y+(back.y-front.y)*t,angle:Math.atan2(front.y-back.y,front.x-back.x)};
}
function spawnSnakeBoss(count=36){
 const trail=[];let distance=0,last=null;
 for(let d=350;distance<(count-1)*SNAKE_GAP+100;d-=2){const q=snakeRoutePose(d);if(last)distance+=Math.hypot(q.x-last.x,q.y-last.y);trail.push({x:q.x,y:q.y,at:-distance});last=q;}
 const parts=Array.from({length:count},(_,i)=>({type:'snake',...sampleSnakeTrail(trail,-i*SNAKE_GAP),trailAt:-i*SNAKE_GAP,shooter:i%4===2,hp:18,max:18,r:i===0?26:19,t:0,seed:i*.4,offset:i*SNAKE_GAP,hitAt:-Infinity}));
 snakeBoss={parts,total:count,age:0,fire:2.5,head:parts[0],travel:0,trail,mode:'wander',modeLeft:10,wanderTarget:{x:550,y:490},wanderLeft:4};
 enemies.push(...parts);reconnectSnake();return snakeBoss;
}
function chooseSnakeWanderTarget(){
 const head=snakeBoss.head;let best=null,bestScore=-Infinity;
 for(let i=0;i<20;i++){
  const target={x:65+Math.random()*520,y:145+Math.random()*400},d=Math.hypot(target.x-head.x,target.y-head.y);
  const clearance=Math.min(...snakeBoss.parts.slice(5).map(e=>Math.hypot(target.x-e.x,target.y-e.y)),200);
  const score=Math.min(d,400)+clearance;if(d>220&&score>bestScore){best=target;bestScore=score;}
 }
 snakeBoss.wanderTarget=best||{x:head.x<325?560:80,y:head.y<350?535:160};snakeBoss.wanderLeft=3+Math.random()*2;
}
function setSnakeMode(mode){
 snakeBoss.mode=mode;snakeBoss.modeLeft=mode==='chase'?5:10;snakeBoss.fire=1.2;
 if(mode==='wander')chooseSnakeWanderTarget();
 for(const e of snakeBoss.parts){e.snakeDanger=e.snakeHead||mode==='chase';e.r=e.snakeHead?26:mode==='chase'?23:19;}
}
function reconnectSnake(){
 if(!snakeBoss)return;
 snakeBoss.parts=snakeBoss.parts.filter(e=>e.hp>0);
 const parts=snakeBoss.parts;
 for(let i=0;i<parts.length;i++){
  const e=parts[i];e.previous=parts[i-1]||null;e.next=parts[i+1]||null;
  e.snakeHead=i===0;e.snakeTail=i===parts.length-1&&i>0;e.r=i===0?26:snakeBoss.mode==='chase'?23:19;e.snakeDanger=i===0||snakeBoss.mode==='chase';
 }
 if(parts.length&&snakeBoss.head!==parts[0]){
  // Rebase the recorded path at the promoted head without changing positions.
  const at=parts[0].trailAt;snakeBoss.travel=at;
  snakeBoss.trail=snakeBoss.trail.filter(q=>q.at<at);snakeBoss.trail.unshift({x:parts[0].x,y:parts[0].y,at});
  for(const e of parts)e.offset=at-e.trailAt;
 }
 snakeBoss.head=parts[0]||null;
}
function updateSnakeBoss(dt){
 if(!snakeBoss)return;reconnectSnake();const parts=snakeBoss.parts;if(!parts.length)return;
 const steps=Math.max(1,Math.ceil(dt/(1/120))),h=dt/steps;
 for(let n=0;n<steps;n++){
  const coverPositions=new Map(parts.map(e=>[e,{x:e.x,y:e.y}]));
  snakeBoss.age+=h;snakeBoss.modeLeft-=h;
  if(snakeBoss.modeLeft<=0)setSnakeMode(snakeBoss.mode==='wander'?'chase':'wander');
  const chase=snakeBoss.mode==='chase',head=parts[0];snakeBoss.wanderLeft-=h;
  if(!chase&&(snakeBoss.wanderLeft<=0||Math.hypot(head.x-snakeBoss.wanderTarget.x,head.y-snakeBoss.wanderTarget.y)<75))chooseSnakeWanderTarget();
  const target=chase?p:snakeBoss.wanderTarget;
  let aim=Math.atan2(target.y-head.y,target.x-head.x)+Math.sin(snakeBoss.age*2.3)* (chase?.15:.55);
  if(head.x<A.x+145||head.x>A.x+A.w-145||head.y<A.y+145||head.y>A.y+A.h-145)aim=Math.atan2(350-head.y,325-head.x);
  const delta=Math.atan2(Math.sin(aim-head.angle),Math.cos(aim-head.angle)),turn=(chase?1.15:1.5)*h;
  head.angle+=Math.max(-turn,Math.min(turn,delta));const oldX=head.x,oldY=head.y,speed=chase?160:SNAKE_SPEED;
  head.x=Math.max(A.x+32,Math.min(A.x+A.w-32,head.x+Math.cos(head.angle)*speed*h));head.y=Math.max(A.y+32,Math.min(A.y+A.h-32,head.y+Math.sin(head.angle)*speed*h));
  snakeBoss.travel+=Math.hypot(head.x-oldX,head.y-oldY);head.trailAt=snakeBoss.travel;
  const trail=snakeBoss.trail;if(h>0)trail.unshift({x:head.x,y:head.y,at:snakeBoss.travel});
  for(let i=1;i<parts.length;i++){const e=parts[i];e.offset=Math.max(i*SNAKE_GAP,e.offset-130*h);e.trailAt=snakeBoss.travel-e.offset;Object.assign(e,sampleSnakeTrail(trail,e.trailAt));}
  for(const e of parts){const old=coverPositions.get(e);resolveEnemyCover(e,old.x,old.y);}
  const keep=snakeBoss.travel-parts[parts.length-1].offset-SNAKE_GAP;while(trail.length>2&&trail[trail.length-2].at<keep)trail.pop();
  // Only roaming emits new bullets. Chase raises spikes and uses body contact.
  if(!chase){snakeBoss.fire=attackCooldown(snakeBoss.fire,h);if(snakeBoss.fire<=0){snakeBoss.fire=2.6;for(const e of parts)if(e.shooter){const phase=e.seed+snakeBoss.age*.22;for(let i=0;i<8;i++)bullet(e.x,e.y,phase+i*TAU/8,78,'#ffad62',4);e.shotFlashUntil=snakeBoss.age+.16;}}}
 }
 for(const e of parts){e.t+=dt;if(e.snakeDanger&&Math.hypot(p.x-e.x,p.y-e.y)<e.r+drinkPlayerRadius()-4+7)hurt(e);}
}

// Rounded, tapered rings are rotated in the segment's local frame. A handful
// of profiles supplies a reptile silhouette without textures or frame animation.
function snakeSkin(point,profiles,height,top,bottom=top,glowingTop=false){
 const r=renderer,sides=12;
 const at=(profile,j)=>{const a=j*TAU/sides;return point(profile[0],Math.sin(a)*profile[1],height+Math.cos(a)*profile[2]);};
 for(let i=0;i<profiles.length-1;i++)for(let j=0;j<sides;j++){const upper=Math.cos((j+.5)*TAU/sides)>0,start=r.count;r.quad(at(profiles[i],j),at(profiles[i+1],j),at(profiles[i+1],j+1),at(profiles[i],j+1),upper?top:bottom);if(glowingTop&&upper)r.markEmissive(start);}
}
function buildResidentSnakeSkin(e,chase){
 const r=renderer,x=0,z=0,scale=e.snakeHead?1.85:1.55,point=(forward,side,height)=>[forward*scale,19+(height-19)*1.45,side*scale];
 if(e.snakeHead){
  // Wide temples, narrowed nose, dark mouth opening and pale lower jaw.
  snakeSkin(point,[[-18,0,0],[-12,10,7],[-3,17,10],[8,14,8],[22,7,4],[26,0,0]],24,chase?'#f284b2':'#427c6d',chase?'#9b3d72':'#294d49');
  snakeSkin(point,[[-12,0,0],[-6,13,4],[10,11,3],[24,5,2],[26,0,0]],14,'#e1cfa1','#a38e65');
  snakeSkin(point,[[-5,0,0],[0,14,2],[15,10,1.5],[25,0,0]],18,'#172b2b');
  snakeSkin(point,[[-12,0,0],[-7,11,2],[3,10,3],[15,4,1],[19,0,0]],33,chase?'#ff79b8':'#a4b785',undefined,chase);
  for(const side of [-1,1]){
   const eye=point(4,side*13,29);r.sphere(...eye,8,'#172d28',1,1,.85);
   const iris=point(5,side*14,31);r.sphere(...iris,5,'#ffb143',1,.7,1);r.glow(...iris,3,'#ff853b');
   const slit=point(5,side*14.4,33);r.box(...slit,1.8,4.5,6,'#182721',-e.angle);
   r.quad(point(-9,side*11,31),point(-17,side*18,40),point(2,side*14,34),point(2,side*14,34),'#a1b787');
   // Long curved-looking fangs taper toward the mouth rather than plug prongs.
   r.quad(point(15,side*8,23),point(11,side*8,12),point(19,side*8,22),point(19,side*8,22),'#fff0c4');
   const nostril=point(20,side*4,29);r.sphere(...nostril,2,'#142c27',1,.5,1);
  }
 }else{
  const tail=e.snakeTail;
  snakeSkin(point,tail?[[-30,0,0],[-19,4,4],[-7,8,7],[5,11,9],[14,6,6]]:[[-15,6,6],[-9,10,9],[0,13,11],[9,11,9],[14,6,6]],19,chase?'#f284b2':e.shooter?'#856247':'#538b77',chase?'#b44f83':'#c9ba91');
  // Overlapping pointed back scale and swept side scales break the bead outline.
  snakeSkin(point,[[-14,0,0],[-7,8,2],[1,9,3],[10,6,1.5],[14,0,0]],29,chase?'#ff79b8':e.shooter?'#c99456':'#91ad7a',undefined,chase);
  if(!e.shooter)r.quad(point(-9,-3,29),point(-6,0,39),point(7,0,29),point(-9,3,29),'#d7b577');
  for(const side of [-1,1])r.quad(point(7,side*9,23),point(-5,side*16,20),point(-12,side*8,24),point(-12,side*8,24),chase?'#d6599b':'#759b80');
 }
 if(chase){
  for(const side of [-1,1]){const base=point(-3,side*10,27),tip=point(-8,side*22,45),rear=point(-12,side*7,27);r.quad(base,tip,rear,rear,'#ffd3e7');}
  const a=point(-8,-4,30),b=point(-5,0,51),c=point(5,4,30);r.quad(a,b,c,c,'#ffb8d6');
 }
r.markPhosphor(0,.08);
}
function drawSnakeSegment(e){
 const r=renderer,x=e.x-325,z=(e.y-300)*1.06,start=r.count,glowStart=r.projectileCount,chase=snakeBoss.mode==='chase';
 const cs=Math.cos(e.angle),sn=Math.sin(e.angle),scale=e.snakeHead?1.85:1.55,point=(forward,side,height)=>[x+(cs*forward-sn*side)*scale,19+(height-19)*1.45,z+(sn*forward+cs*side)*scale];
 r.residentMesh('snake-shadow:'+e.r,()=>r.ring(0,3,0,e.r*.8,'#354943',1.5),monsterPose(x,0,z));
 if(e.previous){const dx=e.previous.x-e.x,dz=(e.previous.y-e.y)*1.06,d=Math.hypot(dx,dz);monsterBox(x+dx/2,17,z+dz/2,d,14,14,'#294d49',-Math.atan2(dz,dx),enemyHitFeedback(e));}
 r.residentMesh('snake-skin:'+ (e.snakeHead?'head':e.snakeTail?'tail':'body')+':'+!!e.shooter+':'+chase,()=>buildResidentSnakeSkin({...e,angle:0},chase),monsterPose(x,0,z,-e.angle),enemyHitFeedback(e));
 if(e.shooter)drawSnakeCannon(e,point);
 r.markPhosphor(start,.08);drawPlaneVulnerability(e,x,z);
 if(e.hp<e.max)drawMonsterHealthBar(x,61,z,e.hp,e.max,4,28,3,'#f5c17a',e);
}
function drawSnakeCannon(e,point){
 const r=renderer,base=point(e.snakeHead?-7:0,0,e.snakeHead?37:32),[x,y,z]=base;
 const aim=e.seed+snakeBoss.age*.22;
 const charging=snakeBoss.mode==='wander'&&snakeBoss.fire<=.65,flashing=snakeBoss.mode==='wander'&&(e.shotFlashUntil||0)>snakeBoss.age;
 const light=snakeBoss.mode==='chase'?'#a34d80':flashing?'#fff1cb':charging?'#ffd077':'#ed8a35';
 const hit=enemyHitFeedback(e);
 r.residentMesh('snake-cannon-base:'+light,()=>{r.sphere(0,0,0,10,'#293b3a',1,.55,1);const marker=r.count;r.ring(0,5.5,0,12,light,4);r.markEmissive(marker);r.sphere(0,8,0,7,'#674b35',1,.7,1);r.markPhosphor(0,.08);},monsterPose(x,y,z),hit);
 for(let i=0;i<4;i++){const a=aim+i*TAU/4;r.residentMesh('snake-cannon-barrel:'+light,()=>{r.box(12,8,0,12,6,6,'#293c3a');r.emissiveBox(18,8,0,2,5,5,light);r.markPhosphor(0,.08);},monsterPose(x,y,z,-a),hit);}
 if(charging||flashing)r.glow(x+hit.x,y+12,z+hit.z,charging?7:11,light);
}
function snakeTestHud(){
 if(!snakeBoss)return;$('zone').textContent='蛇形 BOSS 测试场';const parts=snakeBoss.parts,hp=parts.reduce((v,e)=>v+Math.max(0,e.hp),0),ratio=hp/(snakeBoss.total*18);
 $('status').textContent='电缆蛇 · '+(snakeBoss.mode==='chase'?'粉红尖刺追击':'蛇形游走');
 $('wave').textContent='剩余 '+parts.length+' / '+snakeBoss.total+' 节 · '+(snakeBoss.mode==='chase'?'全身碰撞伤害':'发射弹幕 · 身体可穿过')+' · '+Math.ceil(snakeBoss.modeLeft)+'秒';
 $('snake-mode').textContent=snakeBoss.mode==='chase'?'切换游走':'切换追击';
 const bar=$('snake-health');if(bar){bar.textContent='BOSS '+Math.ceil(hp)+' / '+snakeBoss.total*18;bar.style.setProperty('--snake-hp',(ratio*100)+'%');}
}
function finishSnakeTest(won){
 if(!snakeTest)return;state=won?'menu':'dead';cleared=won;paused=false;releaseJoy();bullets=[];shots=[];missiles=[];
 showOverlay('<div class="tag">SNAKE LAB</div><h2>'+(won?'电缆蛇已击败':'测试结束')+'</h2><p>已打掉 '+(snakeBoss.total-snakeBoss.parts.length)+' / '+snakeBoss.total+' 节</p><button class="primary" id="snake-again">重新测试</button><a href="index.html">返回普通游戏</a>');
 $('snake-again').onclick=startSnakeTest;
}
function startSnakeTest(){
 reset();snakeTest=true;testMode=true;state='combat';phase=0;scroll=0;floor=1;cleared=false;paused=false;
 $('viewport').classList.remove('falling','landing','boss-intro','paused');
 clearTimeout(toast.timer);$('toast').classList.remove('show');$('toast').textContent='';
 tiles=[];syncGrid();for(let y=grid.minY;y<=grid.maxY;y++)for(let x=grid.minX;x<=grid.maxX;x++)tiles.push({x,y,healProgress:0,healFlash:0,medPack:false});
 p.x=325;p.y=405;p.hp=p.max=8;p.inv=2;spawnQueue=[];chaserSpawned=999;spawnTimer=999;
 weapon=createWeapon('rifle');shootTimer=1.5;spawnSnakeBoss();renderer.sceneKey=null;renderer.sceneData=null;
 $('overlay').style.display='none';$('test-open').textContent='测试装备';$('zone').textContent='蛇形 BOSS 测试场';
 $('snake-tools').hidden=false;$('snake-restart').onclick=startSnakeTest;
 $('snake-cut').onclick=()=>{if(state!=='combat'||paused||!snakeBoss.parts.length)return;const bodies=[...snakeBoss.parts],e=snakeBoss.parts[Math.floor(snakeBoss.parts.length/2)];e.hp=0;kills++;shatter(e);reconnectSnake();enemies=enemies.filter(e=>e.hp>0);updateUI();snakeTestHud();if(!snakeBoss.parts.length)beginBossDeath(bodies);};
 $('snake-mode').onclick=()=>{if(state!=='combat')return;setSnakeMode(snakeBoss.mode==='chase'?'wander':'chase');snakeTestHud();draw();};
 $('snake-god').onclick=()=>{snakeGod=!snakeGod;$('snake-god').textContent='无敌 '+(snakeGod?'ON':'OFF');};
 $('snake-god').textContent='无敌 '+(snakeGod?'ON':'OFF');updateUI();snakeTestHud();draw();syncMusic();
}

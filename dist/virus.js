'use strict';
const VIRUS_PATTERNS=['环形散射','旋转弹流','瞄准扇形'];
const VIRUS_MAX_GENERATION=3;
const VIRUS_SPLIT_WHITEN=.75,VIRUS_SPLIT_HOLD=.12,VIRUS_SPLIT_FADE=.9;
function virusScale(e){return [1,.85,.75,.7][e.generation||0];}
function virusHealthLayout(e){return {count:Math.max(1,Math.ceil(e.max/52.5)),width:80*Math.sqrt(e.max/420)};}
function livingViruses(){return enemies.filter(e=>e.type==='virus'&&e.hp>0);}
function virusPatrolPose(t){return {x:325+Math.sin(t*.544)*170,y:250-Math.cos(t*.816)*65};}
function spawnVirusBoss(source=null){
 const patrolPhase=source?source.t+source.patrolPhase+.65:0;
 const hp=source?source.hp:420,e={type:'virus',...virusPatrolPose(patrolPhase),hp,max:source?source.max:420,generation:source?source.generation:0,r:36,t:0,patrolPhase,seed:patrolPhase,hitAt:-Infinity,fire:1.8,pattern:source?source.pattern:0,patternAge:0,angle:0,gait:null,birthFlash:source?.7:0};
 if(!source){virusBoss=e;e.encounterMax=420;}
 e.r=36*virusScale(e);if(source){const target=virusPatrolPose(patrolPhase);e.x=Math.max(A.x+e.r,Math.min(A.x+A.w-e.r,source.x+(Math.sign(target.x-source.x)||1)*e.r*1.8));e.y=source.y;e.patrolOffset={x:e.x-target.x,y:e.y-target.y};e.splitWhite=1;e.splitFade=VIRUS_SPLIT_FADE;}enemies.push(e);updateVirusGait(e,0);return e;
}
function resolveVirusSplits(){
 for(const e of livingViruses())if(!e.splitPreparing&&e.generation<VIRUS_MAX_GENERATION&&e.hp<=e.max*.5){e.splitPreparing=true;e.splitAge=0;e.splitWhite=0;e.warn=false;}
}
function completeVirusSplit(e){
 if(e.hp<=0||!e.splitPreparing)return;
 // Divide the health actually remaining after the vulnerable preparation.
 const oldScale=virusScale(e);e.hp*=.5;e.max=e.hp;e.generation++;e.r=36*virusScale(e);
 const ratio=virusScale(e)/oldScale;
 if(e.gait){const x=e.x-325,z=(e.y-300)*1.06,resize=p=>[x+(p[0]-x)*ratio,3+(p[1]-3)*ratio,z+(p[2]-z)*ratio];for(const leg of e.gait.legs){leg.foot=resize(leg.foot);if(leg.swing){leg.swing.from=resize(leg.swing.from);leg.swing.to=resize(leg.swing.to);leg.swing.age*=ratio;leg.swing.duration*=ratio;}}e.gait.stepGap*=ratio;}
 e.splitPreparing=false;e.splitWhite=1;e.splitFade=VIRUS_SPLIT_FADE;
 spawnVirusBoss(e);beep(420,.14,'triangle',.025);
}
function virusFootTarget(e,i,vx=0,vz=0){
 const a=i*TAU/6+Math.PI/6,scale=virusScale(e);
 // Predict the BODY position at touchdown, rather than pushing all contacts
 // forward and clamping them around the current body (which folds rear legs).
 const dx=Math.cos(a)*34*scale+vx*.18*scale,dz=Math.sin(a)*34*scale+vz*.18*scale;
 return [Math.max(A.x-325+5,Math.min(A.x+A.w-325-5,e.x-325+dx)),3,Math.max((A.y-300)*1.06+5,Math.min((A.y+A.h-300)*1.06-5,(e.y-300)*1.06+dz))];
}
function updateVirusGait(e,dt){
 const x=e.x-325,z=(e.y-300)*1.06,scale=virusScale(e);
 let g=e.gait;
 if(!g||Math.hypot(x-g.x,z-g.z)>100)g=e.gait={x,z,pair:0,legs:Array.from({length:6},(_,i)=>({foot:virusFootTarget(e,i),swing:null})),stepGap:0};
 const vx=dt>0?(x-g.x)/dt:0,vz=dt>0?(z-g.z)/dt:0;g.x=x;g.z=z;g.stepGap=Math.max(0,g.stepGap-dt);
 for(const leg of g.legs)if(leg.swing){
  const s=leg.swing;s.age=Math.min(s.duration,s.age+dt);const t=s.age/s.duration,u=t*t*(3-2*t);
  leg.foot=s.from.map((v,j)=>v+(s.to[j]-v)*u);leg.foot[1]+=Math.sin(t*Math.PI)*10*scale;
  if(t>=1){leg.foot=s.to;leg.swing=null;}
 }
 // Each leg owns an outward sector. Anticipate the next body displacement
 // before a contact enters the baseplate, crosses its hip, or overextends.
 const candidates=[];
 for(let i=0;i<6;i++){
  const leg=g.legs[i];if(leg.swing)continue;
  const a=i*TAU/6+Math.PI/6,nx=Math.cos(a),nz=Math.sin(a),dx=leg.foot[0]-x,dz=leg.foot[2]-z;
  const radial=dx*nx+dz*nz,next=(dx-vx*.12*scale)*nx+(dz-vz*.12*scale)*nz;
  const reach=Math.hypot(dx,dz),futureReach=Math.hypot(dx-vx*.12*scale,dz-vz*.12*scale);
  const drift=Math.hypot(dx-nx*34*scale,dz-nz*34*scale);
  const urgent=radial<26*scale||reach>44*scale;
  if(urgent||next<25*scale||futureReach>44*scale||drift>21*scale)candidates.push({i,urgent,score:Math.max(25*scale-next,futureReach-44*scale,drift-21*scale)+(urgent?100:0)});
 }
 candidates.sort((a,b)=>b.score-a.score||((a.i-g.pair+6)%6)-((b.i-g.pair+6)%6));
 let airborne=g.legs.filter(l=>l.swing).length;
 for(const c of candidates){
  // Stagger ordinary lifts. Safety steps do not wait for a whole tripod.
  if(airborne>=3||(!c.urgent&&g.stepGap>0))continue;
  const leg=g.legs[c.i];leg.swing={from:[...leg.foot],to:virusFootTarget(e,c.i,vx,vz),age:0,duration:.14*scale};
  airborne++;g.stepGap=.045*scale;g.pair=(c.i+1)%6;
 }
}
function virusLegPose(e,i,base){
 const x=e.x-325,z=(e.y-300)*1.06,a=i*TAU/6+Math.PI/6,scale=virusScale(e),foot=[...e.gait.legs[i].foot];
 // A body-fixed outward knee pole prevents the bend plane from following
 // the foot around the vertical axis. Contacts are rendered without sliding.
 return solveSpiderLeg([x+Math.cos(a)*12*scale,base,z+Math.sin(a)*12*scale],foot,23*scale,31*scale,[Math.cos(a),.6,Math.sin(a)]);
}
function fireVirusPattern(e){
 const start=bullets.length;
 if(e.pattern===0){const phase=e.t*.24;for(let i=0;i<10;i++)bullet(e.x,e.y,phase+i*TAU/10,157.5,'#eeadff',4);}
 else if(e.pattern===1){for(let i=0;i<10;i++)bullet(e.x,e.y,e.t*.85+i*TAU/10,177,'#ffa875',4);}
 else{const aim=Math.atan2(p.y-e.y,p.x-e.x);for(let i=0;i<10;i++)bullet(e.x,e.y,aim+(i-4.5)*(.48/9),217.5,'#ff8d99',4);}
 for(let i=start;i<bullets.length;i++){bullets[i].wallBounce=true;bullets[i].maxBounces=3;bullets[i].bounces=0;bullets[i].life=Infinity;}
 e.flash=.12;beep(140,.06,'triangle',.018);
}
function updateVirusBoss(dt){
 if(!virusBoss||!livingViruses().length)return;resolveVirusSplits();
 // Fixed smooth patrol, without introducing a chase or extra boss behavior.
 // Substeps keep planted feet stable after slower frames.
 const steps=Math.max(1,Math.ceil(dt/(1/120))),h=dt/steps;
 for(let n=0;n<steps;n++){
  for(const e of livingViruses()){if(globalThis.ElectricTiles?.frozen(e))continue;const coverX=e.x,coverY=e.y;
  if(e.splitPreparing){e.splitAge+=h;e.splitWhite=Math.min(1,e.splitAge/VIRUS_SPLIT_WHITEN);if(e.splitAge>=VIRUS_SPLIT_WHITEN+VIRUS_SPLIT_HOLD)completeVirusSplit(e);continue;}
  if(e.splitFade>0){e.splitFade=Math.max(0,e.splitFade-h);e.splitWhite=e.splitFade/VIRUS_SPLIT_FADE;}
  e.t+=h;e.patternAge+=h;e.flash=Math.max(0,(e.flash||0)-h);e.birthFlash=Math.max(0,e.birthFlash-h);
  Object.assign(e,virusPatrolPose(e.t+e.patrolPhase));
  if(e.patrolOffset){e.patrolOffset.x*=Math.exp(-h*1.8);e.patrolOffset.y*=Math.exp(-h*1.8);e.x+=e.patrolOffset.x;e.y+=e.patrolOffset.y;}
  resolveEnemyCover(e,coverX,coverY);updateVirusGait(e,h);
  if(e.patternAge>=8){e.patternAge-=8;e.pattern=(e.pattern+1)%3;e.fire=Math.max(e.fire,.8);}
  e.fire=attackCooldown(e.fire,h,.55);e.warn=e.fire<.55;
  if(e.fire<=0){fireVirusPattern(e);e.fire+=e.pattern===0?3.2:e.pattern===1?1.1:2.8;}
  if(Math.hypot(p.x-e.x,p.y-e.y)<e.r+drinkPlayerRadius()-4+7){hurt(e);if(state!=='combat')return;}
  }
 }
}

// Fixed monster geometry is retained in GPU buffers and shared by all clones.
function appendVirusMesh(key,build,x,y,z,hit,scale=1){renderer.residentMesh('virus:'+key,()=>{build();renderer.markPhosphor(0,.07);},monsterPose(x,y,z,0,scale,scale,scale),hit);}
function virusJoint(x,y,z,radius,color,sy=1,hit,scale=1){appendVirusMesh('joint:'+radius+':'+color+':'+sy,()=>renderer.sphere(0,0,0,radius,color,1,sy,1,3,6),x,y,z,hit,scale);}
function drawVirusCore(){
 const r=renderer,x=0,z=0,bob=0,base=27,head=108;
 // Contractile sheath, baseplate and collar; no eyes or mechanical guns.
 r.sphere(x,base,z,20,'#648c81',1,.32,1);
 drawSpiderStrut([x,base,z],[x,head-45,z],10,'#bac9b0');
 for(let i=0;i<8;i++){r.ring(x,base+5+i*4.3,z,9+(i%2),i%2?'#9db5a1':'#506e69',3);}
 r.sphere(x,head-45,z,14,'#92ab9b',1,.3,1);
 // Prolate capsid: long straight sides and pointed hexagonal end caps.
 const vertices=[];for(const height of [-31,31])for(let i=0;i<6;i++){const a=i*TAU/6+Math.PI/6;vertices.push([x+Math.cos(a)*26,head+height,z+Math.sin(a)*26]);}
 vertices.push([x,head-45,z],[x,head+45,z]);
 const faces=[],colors=['#97b8a3','#6b988b','#b1c9a8','#82aa9a'];
 for(let i=0;i<6;i++){const j=(i+1)%6;faces.push([12,j,i],[i,j,j+6],[i,j+6,i+6],[13,i+6,j+6]);}
 const edges=new Set();
 for(let i=0;i<faces.length;i++){
  const f=faces[i],v=f.map(j=>vertices[j]);r.quad(v[0],v[1],v[2],v[2],colors[i%4]);
  for(let j=0;j<3;j++){const a=f[j],b=f[(j+1)%3],key=[Math.min(a,b),Math.max(a,b)].join(':');if(!edges.has(key)){edges.add(key);drawSpiderStrut(vertices[a],vertices[b],1.3,'#3e6b63');}}
 }
 for(const v of vertices)r.sphere(...v,2.4,'#c6d6b4',1,1,1,3,6);
}

function drawVirusBoss(e){
 const r=renderer,x=e.x-325,z=(e.y-300)*1.06,start=r.count,glowStart=r.projectileCount,hit=enemyHitFeedback(e);
 if(!bossDeath){hit.white=Math.max(hit.white||0,e.splitWhite||0);}if(e.splitPreparing&&!bossDeath){hit.x=0;hit.z=0;hit.flash=false;}
 if(!e.gait)updateVirusGait(e,0);
 const bob=Math.max(...e.gait.legs.map(l=>l.foot[1]-3))*.12,scale=virusScale(e),base=27*scale+bob,head=108*scale+bob;
 r.residentMesh('virus-shadow',()=>r.disc(0,0,0,39,'#394c46'),monsterPose(x,2.5,z,0,scale,1,scale));
 // Tail fibers use the mount's two-bone IK and world-space foot contacts.
 for(let i=0;i<6;i++){
  const leg=virusLegPose(e,i,base);
  monsterStrut(leg.hip,leg.knee,3.5*scale,'#829c9b',hit);monsterStrut(leg.knee,leg.foot,2.5*scale,'#c3cda4',hit);
  virusJoint(...leg.knee,3,'#b8c1ae',1,hit,scale);virusJoint(...leg.foot,2.5,'#8eaa9e',.45,hit,scale);
 }
 r.markPhosphor(start,.07);appendVirusMesh('core',drawVirusCore,x,bob,z,hit,scale);
 if(e.birthFlash>0){r.ring(x,4,z,(37+e.birthFlash*15)*scale,'#b8f4c7',2*scale);r.glow(x,head,z,8*scale,'#b8f4c7');}
 let light=e.flash>0?'#fff3cd':e.warn?'#ffad85':'#bb91ce';
 if(e.splitWhite>0){const w=Math.round(e.splitWhite*64)/64;light='#'+r.color(light).map(c=>Math.round((c+(1-c)*w)*255).toString(16).padStart(2,'0')).join('');}
 r.ring(x,base+2*scale,z,23*scale,light,2*scale);if(e.warn||e.flash>0)r.glow(x,base+7*scale,z,8*scale,light);
 if(!e.splitPreparing)applyEnemyHit(e,start,glowStart);drawPlaneVulnerability(e,x,z);
 const health=virusHealthLayout(e);drawMonsterHealthBar(x,166*scale+bob,z,e.hp,e.max,health.count,health.width,5,'#b3cea0',e);
}
function virusTestHud(){
 if(!virusBoss)return;const alive=livingViruses(),hp=alive.reduce((sum,e)=>sum+e.hp,0),max=Math.max(virusBoss.encounterMax,hp);$('zone').textContent='病毒 BOSS 测试场';$('status').textContent='噬菌体 · 墙壁反弹弹幕';
 $('wave').textContent='存活 '+alive.length+' 只 · 半血分裂 · 最多三轮';
 const bar=$('virus-health');bar.textContent='总血量 '+Math.ceil(hp)+' / '+max;bar.style.setProperty('--snake-hp',(max?hp/max*100:0)+'%');
}
function finishVirusTest(won){
 if(!virusTest)return;state=won?'menu':'dead';cleared=won;paused=false;releaseJoy();bullets=[];shots=[];missiles=[];
 showOverlay('<div class="tag">VIRUS LAB</div><h2>'+(won?'病毒群已全部击败':'测试结束')+'</h2><p>噬菌体 · 墙壁反弹与半血分裂</p><button class="primary" id="virus-again">重新测试</button><a href="index.html">返回普通游戏</a>');$('virus-again').onclick=startVirusTest;
}
function startVirusTest(){
 reset();virusTest=true;testMode=true;state='combat';phase=0;scroll=0;floor=1;cleared=false;paused=false;
 $('viewport').classList.remove('falling','landing','boss-intro','paused');clearTimeout(toast.timer);$('toast').classList.remove('show');$('toast').textContent='';
 tiles=[];syncGrid();for(let y=grid.minY;y<=grid.maxY;y++)for(let x=grid.minX;x<=grid.maxX;x++)tiles.push({x,y,healProgress:0,healFlash:0,medPack:false});
 p.x=325;p.y=435;p.hp=p.max=8;p.inv=2;spawnQueue=[];chaserSpawned=999;spawnTimer=999;
 weapon=createWeapon('rifle');shootTimer=1.5;spawnVirusBoss();renderer.sceneKey=null;renderer.sceneData=null;
 $('overlay').style.display='none';$('test-open').textContent='测试装备';$('virus-tools').hidden=false;$('virus-restart').onclick=startVirusTest;
 $('virus-god').onclick=()=>{virusGod=!virusGod;$('virus-god').textContent='无敌 '+(virusGod?'ON':'OFF');};
 $('virus-god').textContent='无敌 '+(virusGod?'ON':'OFF');updateUI();virusTestHud();draw();syncMusic();
}

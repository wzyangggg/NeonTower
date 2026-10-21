const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/humanoid.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/cowboy.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/crimson-mech.js','utf8'),sandbox);
vm.runInContext(`
function check(v,m){if(!v)throw Error(m)}
$('humanoid-health').style.setProperty=()=>{};startCrimsonMechTest();sound=false;
check(humanoidBoss.crimson&&humanoidWalking&&tiles.length===143,'walking full arena');
check(Math.abs(CRIMSON_SCALE/1.6-2/3)<1e-12&&Math.abs(humanoidBoss.r-43*2/3)<1e-12,'two thirds scale and hit radius');
$('crimson-auto').onclick();humanoidWalking=false;shootTimer=Infinity;
const origin=[humanoidBoss.x,humanoidBoss.y];
for(let i=0;i<120;i++)step(1/60);
check(humanoidBoss.x===origin[0]&&humanoidBoss.y===origin[1]&&!shots.length,'standing without auto firing');
renderer.begin();drawHumanoidBoss(humanoidBoss);
check(renderer.residentMeshes.has('crimson:pistol')&&renderer.residentMeshes.has('crimson:torso'),'armored dual gun model');
check(renderer.residentSnapshot().every(Number.isFinite),'finite scaled geometry');
const size=renderer.residentMeshes.size;
for(let i=0;i<120;i++){updateHumanoidBoss(1/60);renderer.begin();drawHumanoidBoss(humanoidBoss);}
check(renderer.residentMeshes.size===size,'stable mesh cache');
for(const action of ['dualshoot','strafe','missiles','laser','skyline','blink','slash','thrust']){
 startCrimsonMechTest();humanoidBoss.crimsonAI.enabled=false;startHumanoidSlash(humanoidBoss,action);
 for(let i=0;i<400;i++){updateHumanoidBoss(1/120);renderer.begin();drawHumanoidBoss(humanoidBoss);check(renderer.residentSnapshot().every(Number.isFinite),'finite action '+action);}
}
startCrimsonMechTest();sound=false;shootTimer=Infinity;p.inv=999;
const seen=new Set();let maxBullets=0;
for(let i=0;i<3600;i++){updateHumanoidBoss(1/120);updateEnemyBullets(1/120);if(humanoidBoss.slash)seen.add(humanoidBoss.slash.kind);maxBullets=Math.max(maxBullets,bullets.length);}
check(CRIMSON_ATTACKS.every(k=>seen.has(k))&&humanoidBoss.crimsonAI.count>=4&&maxBullets>15,'automatic four-pattern cycle produces bullets');
check(bullets.every(b=>b.crimson&&b.life<=7&&[b.x,b.y,b.vx,b.vy].every(Number.isFinite)),'bounded real projectiles');
$('crimson-auto').onclick();check(!humanoidBoss.slash&&!bullets.length&&!humanoidBoss.skyEffects.length&&!humanoidBoss.crimsonRockets.length,'toggle clears live attack');
startCrimsonMechTest();humanoidBoss.crimsonAI.enabled=false;startHumanoidSlash(humanoidBoss,'missiles');
const e=humanoidBoss,locked=e.crimsonRockets.map(m=>[m.x,m.y]),at=[e.x,e.y],height=e.gait.height;
check(e.crimsonRockets.length===6&&Math.hypot(e.crimsonRockets[0].x-p.x,e.crimsonRockets[0].y-p.y)<=32,'six fixed irregular targets near player');
p.x+=100;
for(let i=0;i<36;i++)updateHumanoidBoss(1/120);
check(e.gait.height<height-9&&e.x===at[0]&&e.y===at[1],'brief crouch with planted feet');
check(e.crimsonRockets.every(m=>!m.origin),'crouch before upward launch');
renderer.begin();drawCrimsonRockets(e);check(!(renderer.residentMeshes.get('crimson:target-ring')?.count),'no markers before missiles spawn');
for(let i=0;i<24;i++)updateHumanoidBoss(1/120);
check(e.crimsonRockets.filter(m=>m.origin).length===1,'first missile launches alone');
check(e.crimsonRockets.every(m=>Math.abs(m.flight-1.2)<1e-12),'flight speed multiplied by 1.5');
renderer.begin();drawCrimsonRockets(e);check(renderer.residentMeshes.get('crimson:target-ring').count===32,'only spawned missile marker visible');
check(e.crimsonRockets.every((m,i)=>Math.abs(m.delay-(.45+i*.2))<1e-10&&m.r===40.5),'point two second staggering and 1.5x burn radius');
check(e.crimsonRockets.every((m,i)=>m.x===locked[i][0]&&m.y===locked[i][1]),'targets do not follow player');
for(let i=0;i<120;i++)updateHumanoidBoss(1/120);
check(e.crimsonRockets.every(m=>!m.impacted)&&!bullets.length,'visible flight before impact with no ring rounds');
for(let i=0;i<180;i++)updateHumanoidBoss(1/120);
check(e.crimsonRockets.every(m=>m.impacted)&&!bullets.length,'six impacts create burning ground without scattering');
check(e.crimsonRockets.every(m=>m.origin),'all six launched in sequence');
for(const m of e.crimsonRockets){
 const start=crimsonRocketCurve(m,0),end=crimsonRocketCurve(m,m.flight);
 check(start.point.every((v,i)=>Math.abs(v-m.origin[i])<1e-9),'curve starts at launcher');
 check(Math.abs(end.point[0]-(m.x-325))<1e-9&&Math.abs(end.point[1]-7)<1e-9&&Math.abs(end.point[2]-(m.y-300)*1.06)<1e-9,'curve ends at locked marker');
 check(start.tangent[1]>0&&end.tangent[1]<0,'upward launch and downward arrival');
 let previous=start.tangent;
 for(let frame=1;frame<=180;frame++){const q=crimsonRocketCurve(m,m.flight*frame/180);check(crimsonRocketPose(q.point,q.tangent).every(Number.isFinite),'finite tangent-oriented pose');check(Math.hypot(...q.tangent.map((v,i)=>v-previous[i]))<35,'continuous trajectory tangent');previous=q.tangent;}
}
renderer.begin();drawHumanoidBoss(e);check(renderer.residentMeshes.has('crimson:fire-circle')&&!renderer.residentMeshes.has('crimson:flame'),'red circular billboards replace box flames');
p.inv=0;p.shield=0;p.hp=8;p.x=locked[0][0];p.y=locked[0][1];updateHumanoidBoss(1/120);check(p.hp===7,'burning ground hurts');
p.inv=0;updateHumanoidBoss(1/120);check(p.hp===6,'fire persists after explosion');
p.inv=999;for(let i=0;i<650;i++)updateHumanoidBoss(1/120);check(!e.crimsonRockets.length,'burning ground expires');
startCrimsonMechTest();humanoidBoss.crimsonAI.enabled=false;startHumanoidSlash(humanoidBoss,'strafe');
for(let i=0;i<40;i++)updateHumanoidBoss(1/120);
for(const side of [-1,1]){const q=crimsonHeldGun(humanoidBoss,side),local=humanoidUpperPoint(humanoidBoss,side*43,83,7);check(Math.hypot(...q.point.map((v,i)=>v-local[i]))<1e-8,'guns remain beside body slightly raised');}
startCrimsonMechTest();humanoidBoss.crimsonAI.enabled=false;
for(let i=0;i<120;i++)updateHumanoidBoss(1/120);
const bodyHeight=humanoidBoss.gait.height;startHumanoidSlash(humanoidBoss,'strafe');
let lastHeight=humanoidBoss.gait.height;
for(let i=0;i<288;i++){if(i%60===0){p.x=i%120?140:510;p.y=i%120?170:450;}updateHumanoidBoss(1/120);check(Math.abs(humanoidBoss.gait.height-lastHeight)<.1,'no sudden vertical shooting drop');lastHeight=humanoidBoss.gait.height;check(Math.abs(lastHeight-bodyHeight)<.1,'shooting keeps center of mass height');}
startCrimsonMechTest();humanoidBoss.crimsonAI.enabled=false;shootTimer=Infinity;p.inv=999;p.x=520;p.y=300;
startHumanoidSlash(humanoidBoss,'laser');const laser=humanoidBoss.slash,angleBefore=humanoidBoss.angle;
for(let i=0;i<72;i++)updateHumanoidBoss(1/120);
check(Math.abs(humanoidBoss.angle-angleBefore)>.5&&!laser.firing,'charge tracks player through body yaw');
for(let i=0;i<60;i++)updateHumanoidBoss(1/120);
const lockedAngle=humanoidBoss.angle;p.x=130;p.y=220;
for(let i=0;i<42;i++)updateHumanoidBoss(1/120);
check(humanoidBoss.angle===lockedAngle&&!laser.firing,'last .55s charge locks yaw for lateral escape');
for(let i=0;i<24;i++)updateHumanoidBoss(1/120);
check(laser.firing,'laser starts after charge and lock');
const laserOrigin=[humanoidBoss.x,humanoidBoss.y],fireYaw=humanoidBoss.angle;
for(let i=0;i<48;i++)updateHumanoidBoss(1/120);
check(Math.hypot(humanoidBoss.x-laserOrigin[0],humanoidBoss.y-laserOrigin[1])>8,'laser moves while firing');
const yawChange=Math.abs(Math.atan2(Math.sin(humanoidBoss.angle-fireYaw),Math.cos(humanoidBoss.angle-fireYaw)));
check(yawChange>0&&yawChange<=.38*.4+1e-8,'laser corrects body yaw slowly');
const ray=crimsonLaserRay(humanoidBoss),bodyAim=Math.atan2(Math.cos(humanoidBoss.angle)/1.06,Math.sin(humanoidBoss.angle));
check(Math.abs(ray.aim-bodyAim)<1e-10,'beam follows body facing exactly');
p.x=ray.x+Math.cos(ray.aim)*Math.min(70,ray.length*.5);p.y=ray.y+Math.sin(ray.aim)*Math.min(70,ray.length*.5);p.inv=0;p.hp=8;p.shield=0;
updateHumanoidBoss(1/120);check(p.hp===7,'active laser deals real damage');
renderer.begin();drawHumanoidBoss(humanoidBoss);check(renderer.residentMeshes.has('crimson:laser-beam'),'resident laser visual');
p.inv=999;for(let i=0;i<400;i++)updateHumanoidBoss(1/120);check(!humanoidBoss.slash,'laser ends cleanly');
startCrimsonMechTest();humanoidBoss.crimsonAI.enabled=false;startHumanoidSlash(humanoidBoss,'skyline');
const rain=humanoidBoss.crimsonRockets,frontOrigin=[humanoidBoss.x,humanoidBoss.y],frontAngle=humanoidBoss.angle;
check(rain.length===6&&rain.every(m=>m.vertical),'six vertical missiles replace stomp');
const row=rain.map(m=>[m.x-frontOrigin[0],(m.y-frontOrigin[1])*1.06]);
check(row.every(q=>q[0]*Math.sin(frontAngle)+q[1]*Math.cos(frontAngle)>0&&Math.abs(q[0]*Math.cos(frontAngle)-q[1]*Math.sin(frontAngle))<1e-8),'rain is a line in front of body');
const fixed=rain.map(m=>[m.x,m.y]);p.x=140;p.y=200;p.inv=999;
for(let i=0;i<200;i++)updateHumanoidBoss(1/120);
check(rain.every((m,i)=>m.origin&&m.x===fixed[i][0]&&m.y===fixed[i][1]),'front targets fixed after upward launch');
for(const m of rain){
 const a=crimsonRocketCurve(m,.6),b=crimsonRocketCurve(m,.9),c=crimsonRocketCurve(m,m.flight);
 check(a.point[0]===b.point[0]&&a.point[2]===b.point[2]&&b.point[0]===c.point[0]&&b.point[2]===c.point[2]&&a.point[1]>b.point[1]&&b.point[1]>c.point[1],'incoming missiles descend completely vertically');
 check(a.tangent[0]===0&&a.tangent[2]===0&&a.tangent[1]<0,'vertical incoming tangent');
}
for(let i=0;i<150;i++)updateHumanoidBoss(1/120);check(rain.every(m=>m.impacted),'front row explodes and burns');
p.x=rain[0].x;p.y=rain[0].y;p.hp=8;p.shield=0;p.inv=0;updateHumanoidBoss(1/120);check(p.hp===7,'front row fire causes damage');
check(!CRIMSON_ATTACKS.includes('stomp')&&CRIMSON_ATTACKS.includes('laser')&&CRIMSON_ATTACKS.includes('skyline'),'stomp removed from cycle');
check(!CRIMSON_ATTACKS.includes('skyshoot')&&!CRIMSON_ATTACKS.includes('spinshoot'),'ring attacks removed');
for(const px of [A.x+16,A.x+A.w-16])for(const py of [A.y+16,A.y+A.h-16]){startCrimsonMechTest();humanoidBoss.crimsonAI.enabled=false;p.x=px;p.y=py;startCrimsonMissiles(humanoidBoss);const rs=humanoidBoss.crimsonRockets;check(rs.length===6&&rs.every((a,i)=>rs.every((b,j)=>i===j||Math.hypot(a.x-b.x,a.y-b.y)>=38)),'distinct irregular targets even near corners');}
p.inv=0;p.shield=0;p.hp=8;bullets=[];crimsonBullet(p.x,p.y,0,0);updateEnemyBullets(.001);check(p.hp===7,'real bullet damage');
startCrimsonMechTest();check(!bullets.length&&!humanoidBoss.skyEffects?.length,'restart clears projectiles');
for(const kind of [null,'strafe']){
 startCrimsonMechTest();humanoidBoss.crimsonAI.enabled=false;
 if(kind)startHumanoidSlash(humanoidBoss,kind);
 const q=[humanoidBoss.x,humanoidBoss.y];
 for(let i=0;i<12;i++)updateHumanoidBoss(1/120);
 check(Math.hypot(humanoidBoss.x-q[0],humanoidBoss.y-q[1])>7,'moves while '+kind);
 check(humanoidBoss.gait.legs.every(l=>l.foot.every(Number.isFinite)),'finite moving feet');
}
startCrimsonMechTest();humanoidBoss.crimsonAI.enabled=false;
for(let i=0;i<3600;i++){updateHumanoidBoss(1/120);check(humanoidBoss.x>A.x+70&&humanoidBoss.x<A.x+A.w-70&&humanoidBoss.y>A.y+70&&humanoidBoss.y<A.y+A.h-70,'roaming remains in arena');}
startCrimsonMechTest();humanoidBoss.crimsonAI.enabled=false;
let strides=[],steps=0,priorSwing=[false,false];
for(let i=0;i<720;i++){
 updateHumanoidBoss(1/120);
 for(let side=0;side<2;side++){const leg=humanoidBoss.gait.legs[side],s=leg.swing;if(s&&!priorSwing[side]){strides.push(Math.hypot(s.to[0]-s.from[0],s.to[2]-s.from[2]));check(s.duration===.36,'longer swing timing');steps++;}priorSwing[side]=!!s;check(Math.hypot(...humanoidLegPose(humanoidBoss,side).foot.map((v,j)=>v-leg.foot[j]))<1e-6,'long strides preserve actual IK contact');}
}
check(strides.reduce((a,b)=>a+b,0)/strides.length>35&&steps<24,'long purposeful strides rather than small rapid steps');
const old=humanoidBoss;$('humanoid-restart').onclick();check(humanoidBoss!==old&&humanoidBoss.crimson&&humanoidWalking,'restart keeps design');
finishHumanoidTest(true);$('humanoid-again').onclick();check(humanoidBoss.crimson,'victory replay keeps design');
finishHumanoidTest(false);takeTestEquipment('weapon','rifle',1);check(humanoidBoss.crimson,'equipment replay keeps mech');
startHumanoidTest();check(!humanoidBoss.crimson&&humanoidWalking,'original template unchanged');
console.log('Crimson mech: laser tracking/locked warning/moving body-yaw correction/damage, front vertical missile row/fire, no stomp, original missiles, stable strides and replay passed');
`,sandbox);

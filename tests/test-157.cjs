const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);




vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
function close(a,b,m,tol=.002){check(Math.abs(a-b)<tol,m)}
reset();state='combat';p.x=325;p.y=300;p.inv=0;spawnQueue=[{type:'eye',side:0}];spawnTimer=999;shootTimer=999;chaserSpawned=24;
check(EQUIPMENT_LABELS.shoes==='坐骑','mount slot label');
check(!SHOE_TYPES.some(s=>s.id==='tentacle')&&!testEquipmentTypes('shoes').some(s=>s.id==='tentacle'),'retired tentacle absent from shop and test pools');
check(!takeTestEquipment('shoes','tentacle',3)&&!shoes,'test panel cannot grant retired tentacle');equipItem('shoes',createShoes('tentacle',3));check(!shoes,'retired mount cannot be equipped through normal path');
// Keep isolated IK regression for the dormant renderer.
shoes=createShoes('tentacle',3);
check(shoes.prototype&&!shoes.speedBonus&&!shoes.vinylDamage&&!shoes.spiderTurretDamage&&!shoes.ufoLaserDamage&&!shoes.damage,'visual-only independent prototype');
check(equipmentAttributeCard('shoes',shoes,'已装备').includes('无属性加成'),'card explains grounded IK');
function inspect(){const g=p.tentacleGait;check(g.arms.length===8,'eight independent arms');for(let a=0;a<8;a++){const arm=g.arms[a],root=tentacleRoot(a);check(arm.nodes.length===17,'multi-bone IK');for(let j=0;j<3;j++)close(arm.nodes[0][j],root[j],'radial root follows rider');for(let i=1;i<arm.nodes.length;i++){check(arm.nodes[i].every(Number.isFinite),'finite IK');const dx=arm.tip[0]-root[0],dz=arm.tip[2]-root[2],nx=arm.nodes[i][0]-root[0],nz=arm.nodes[i][2]-root[2];close(nx*dz-nz*dx,0,'no tangential spiral bias',.001);close(Math.hypot(...arm.nodes[i].map((v,j)=>v-arm.nodes[i-1][j])),TENTACLE_LENGTH,'bone length preserved');check(arm.nodes[i][1]>=3.4,'chain above floor');}check(Math.hypot(...arm.nodes.at(-1).map((v,j)=>v-arm.tip[j]))<.01,'IK reaches actual contact');if(!arm.swing){close(arm.tip[1],3.5,'suction grounded');check(onFloor(325+arm.tip[0],300+arm.tip[2]/1.06,3),'tip on platform');}}}
updateTentacleGait(0);inspect();const anchors=p.tentacleGait.arms.map(a=>[...a.tip]);
for(let a=0;a<8;a++){const angle=Math.atan2(anchors[a][2],anchors[a][0]);close(Math.cos(angle),Math.cos(a*TAU/8),'radial contact direction x');close(Math.sin(angle),Math.sin(a*TAU/8),'radial contact direction z');}
const idle=JSON.stringify(p.tentacleGait);for(let i=0;i<100;i++){time+=.016;p.dx=Math.cos(i);p.dy=Math.sin(i);updateTentacleGait(.016);}check(JSON.stringify(p.tentacleGait)===idle,'no idle clock/facing animation');
p.x+=4;updateTentacleGait(.03);inspect();check(p.tentacleGait.arms.every((a,i)=>a.tip.every((v,j)=>v===anchors[i][j])),'all planted contacts stay fixed');
let lifted=false,landed=false;keys.d=true;for(let i=0;i<80;i++){step(.016);inspect();if(p.tentacleGait.arms.some(a=>a.tip[1]>4))lifted=true;if(lifted&&p.tentacleGait.arms.some((a,j)=>!a.swing&&Math.hypot(a.tip[0]-anchors[j][0],a.tip[2]-anchors[j][2])>5))landed=true;check(p.tentacleGait.arms.filter(a=>a.swing).length<=2,'six supporting contacts');}keys.d=false;check(lifted&&landed,'movement lifts tip then replants');const x=p.x,stopped=JSON.stringify(p.tentacleGait);for(let i=0;i<30;i++)step(.016);close(p.x,x,'normal release stops');check(JSON.stringify(p.tentacleGait)===stopped,'stopping freezes all poses including unfinished swings');
for(const key of ['a','w','s','d']){keys[key]=true;for(let i=0;i<90;i++){step(.016);inspect();}keys[key]=false;}
const frozen=JSON.stringify(p.tentacleGait);paused=true;step(.2);check(JSON.stringify(p.tentacleGait)===frozen,'pause freezes IK');paused=false;
renderer.begin();drawTentacleMount();check(renderer.count>10000&&renderer.data.slice(0,renderer.count).every(Number.isFinite),'continuous tapered tube and suction mesh finite');const still=JSON.stringify(p.tentacleGait);drawTentacleMount();check(JSON.stringify(p.tentacleGait)===still,'draw never advances gait');
equipItem('armor',createArmor('energy'));draw();check(renderer.data.slice(0,renderer.count).every(Number.isFinite),'full rider armor shield finite');close(mountRiderLift(),14,'rider on tentacle');
p.x=325;p.y=300;tiles=[{x:0,y:0}];updateTentacleGait(.016);inspect();for(let i=0;i<20;i++){p.dx=Math.cos(i);p.dy=Math.sin(i);p.tentacleGait=null;updateTentacleGait(0);inspect();}
p.x+=70;updateTentacleGait(.25);close(p.tentacleGait.arms[0].nodes[0][0],p.x-325+5,'relocation resets root');
beginDescent();check(!p.tentacleGait,'new floor clears anchor');equipItem('shoes',createShoes('runner'));check(!p.tentacleGait&&!mountRiderLift(),'swap clears gait and lift');reset();check(!shoes&&!p.tentacleGait,'restart clears mount');
console.log('Mount labels, neutral tentacle prototype, eight radial arms without tangential spiral, idle/mid-step stop freezes, fixed world contacts, multi-bone IK lengths/endpoints, four-way lift/replant, floor edges/sparse tiles, pause/stop, finite tube/suction/rider mesh and swap/floor/reset passed');
}`,sandbox);

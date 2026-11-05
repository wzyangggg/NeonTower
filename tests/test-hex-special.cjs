const assert=require('node:assert/strict'),H=require('../dist/hex-map.js');
const initial=H.initialFloor();
const full=Array.from({length:143},(_,i)=>({x:i%13-6,y:Math.floor(i/13)-5}));
const concave=full.filter(t=>t.x<1||t.y<-1||t.y>2);
for(const cells of [initial,full,concave]){
 for(const edge of ['left','right','top','bottom']){
  const track=H.turretTrack(cells,edge);assert.ok(track.length>10);assert.equal(H.turretTrack(cells,edge),track);
  const t={edge,slide:.25,dir:1};H.turretEdge(cells,t);
  for(let i=0;i<2400;i++){
   const {x,y}=t;H.slideTurret(cells,t,1/120);assert.ok(H.canStand(cells,t.x,t.y,16),'turret fully supported');
   assert.ok(Math.hypot(t.x-x,t.y-y)<=105/120+1e-6,'continuous physical speed');
  }t.slide=1;t.dir=1;H.slideTurret(cells,t,1/120);assert.equal(t.dir,-1,'track endpoint bounce');
  H.slideTurret(cells,t,30);assert.ok(t.slide>=0&&t.slide<=1&&H.canStand(cells,t.x,t.y,16),'large delta remains supported');
 }
 for(let i=0;i<5;i++){
  const tile=cells[Math.floor(i*cells.length/5)],e={x:325+H.x(tile.x,tile.y),y:300+H.y(tile.y),r:23,heading:i,moveSpeed:200,speedFactor:1};
  let distance=0;
  for(let j=0;j<1800;j++){const {vx,vy}=H.steerSpider(cells,e,Math.cos(j*.013+i),Math.sin(j*.013+i)),desired=Math.atan2(vy,vx),turn=Math.atan2(Math.sin(desired-e.heading),Math.cos(desired-e.heading));e.heading+=Math.max(-.15,Math.min(.15,turn));const {x,y}=e;H.moveSpider(cells,e,1/60);assert.ok(H.canStand(cells,e.x,e.y,23),'whole spider stays on actual ground');distance+=Math.hypot(e.x-x,e.y-y);}
  assert.ok(distance>100,'spider keeps moving');
 }
}
const first=H.turretTrack(initial,'top');initial.push({x:0,y:-2});assert.notEqual(H.turretTrack(initial,'top'),first,'expansion invalidates cached rails');
console.log('Hex special rooms: initial/full/concave maps, continuous supported turret rails and speed/bounce/large delta, moving supported spiders for 30s, expansion cache invalidation passed.');

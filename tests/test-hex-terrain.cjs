const assert=require('node:assert/strict'),H=require('../dist/hex-map.js');
const t={x:0,y:0},cx=325+H.x(0,0),cy=300;
assert.equal(H.SPIKES.length,7);assert.deepEqual([-13,0,13].map(y=>H.SPIKES.filter(p=>p[1]===y).length),[2,3,2]);
for(const [x,y]of H.SPIKES)assert.ok(H.inside(t,cx+x,cy+y, -5));
const quads=[];H.fixture({quad(...p){quads.push(p);}},cx,cy,4,1,'#fff');
assert.equal(quads.length,12);for(const q of quads)for(const p of q.slice(0,4))assert.ok(H.inside(t,p[0],cy+(p[2]-cy)/1.06,0));
assert.ok(!H.coverContains(t,cx+20,cy+20));assert.ok(H.coverContains(t,cx,cy+23));
for(let i=0;i<6;i++){const a=i*Math.PI/3,nx=Math.cos(a),ny=Math.sin(a),hit=H.coverSegment(t,cx+nx*90,cy+ny*90,cx-nx*90,cy-ny*90,7);assert.ok(hit);assert.ok(Math.abs(hit.f-(90-28)/180)<1e-9);assert.ok(Math.abs(hit.nx-nx)<1e-9&&Math.abs(hit.ny-ny)<1e-9);}
assert.equal(H.coverSegment(t,cx+60,cy+70,cx-60,cy+70,7),null);
const cells=[t,...H.neighbors(0,0).map(([x,y])=>({x,y}))];
for(const axis of ['x','y']){const w={x:cx,y:cy,axis,dir:1};let reversed=false;for(let i=0;i<300;i++){const dir=w.dir,other=w[axis==='x'?'y':'x'];H.moveAxis(cells,w,.017,170,25);assert.ok(H.canStand(cells,w.x,w.y,24.999));assert.equal(w[axis==='x'?'y':'x'],other);if(dir!==w.dir)reversed=true;}assert.ok(reversed);}
for(const edge of ['left','right','top','bottom'])for(let i=0;i<=100;i++){const turret={edge,slide:i/100};H.turretEdge(cells,turret);assert.ok(H.canStand(cells,turret.x,turret.y,16));}
console.log('Hex terrain: 2/3/2 spikes, contained fixture geometry, six-face swept cover, axial wheel support/bounce and four turret tracks passed.');

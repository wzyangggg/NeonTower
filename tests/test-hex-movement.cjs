const H=require('../dist/hex-map.js'),assert=require('node:assert/strict');
const single=[{x:0,y:0}],cx=325+H.x(0,0),cy=300;
assert.equal(H.outline(single).edges.length,6);
for(const [dx,dy]of H.neighbors(0,0)){
 const cells=[...single,{x:dx,y:dy}];assert.equal(H.outline(cells).edges.length,10,'shared edge is not a wall');
 const p=H.move(cells,cx,cy,325+H.x(dx,dy),300+H.y(dy),7);
 assert.ok(Math.hypot(p.x-325-H.x(dx,dy),p.y-300-H.y(dy))<1e-6,'cross every shared edge without catching');
}
for(const edge of H.outline(single).edges){
 const px=cx+edge.nx*19.99,py=cy+edge.ny*19.99,tx=-edge.ny,ty=edge.nx;
 const p=H.move(single,px,py,px+edge.nx*2+tx*2,py+edge.ny*2+ty*2,7);
 assert.ok(H.canStand(single,p.x,p.y,7));assert.ok((p.x-px)*tx+(p.y-py)*ty>1.9,'preserve movement along all six boundary slopes');
}
const start={x:cx+.5*19.99,y:cy+Math.sqrt(3)/2*19.99};
const slid=H.move(single,start.x,start.y,start.x,start.y+4,7);
assert.ok(slid.x<start.x-1.6&&slid.y>start.y+.9,'vertical input slides along the diagonal instead of locking');
const stop=H.move(single,cx,cy,cx+1000,cy,7);assert.ok(Math.abs(stop.x-cx-20)<.01&&H.canStand(single,stop.x,stop.y,7),'sweep blocks large-step tunneling');
assert.deepEqual(H.move(single,cx,cy,cx+2,cy+3,7),{x:cx+2,y:cy+3},'free movement speed unchanged');
let seed=23;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
for(let trial=0;trial<80;trial++){
 const cells=[{x:0,y:0}];for(let j=0;j<15;j++){const a=cells[Math.floor(random()*cells.length)],[dx,dy]=H.neighbors(a.x,a.y)[Math.floor(random()*6)],t={x:a.x+dx,y:a.y+dy};if(!cells.some(v=>v.x===t.x&&v.y===t.y))cells.push(t);}
 let p={x:cx,y:cy};for(let j=0;j<250;j++){p=H.move(cells,p.x,p.y,p.x+(random()-.5)*16,p.y+(random()-.5)*16,7);assert.ok(H.canStand(cells,p.x,p.y,6.999),'stay inside concave and convex boundaries');}
}
console.log('Hex movement: 6 shared seams, all boundary tangents, diagonal edge slide, unchanged free speed, anti-tunneling and 20,000 irregular-boundary steps passed.');

'use strict';
// Blender-authored geometry, retained once per graphics context by residentMesh.
globalThis.EnemyVehicles=(()=>{
 const types={eye:'hovercar',skull:'hoverbike',spitter:'bubblepod',moth:'fighter'};
 function draw(e,x,z,bob){
  const kind=e.type==='fighter'?'fighter':types[e.type],data=globalThis.EnemyVehicleMeshes?.[kind];
  if(!data)return false;
  const r=renderer,pose=enemyFlightPose(e,x,z,bob);
  r.residentMesh('enemy-vehicle:'+kind,()=>{
   r.data=new Float32Array(data);r.count=data.length;
  },pose,enemyHitFeedback(e));
  const canopy=globalThis.EnemyVehicleCanopies?.[kind];
  if(canopy?.length){
   const mesh=r.residentMesh('enemy-vehicle-canopy:'+kind,()=>{r.data=new Float32Array(canopy);r.count=canopy.length;},pose,enemyHitFeedback(e));mesh.opacity=.32;
  }
  // Exhaust pulses are sprites; hull geometry and material data stay unchanged.
  const at=(xx,yy,zz)=>[pose[0]*xx+pose[1]*yy+pose[2]*zz+pose[3],pose[4]*xx+pose[5]*yy+pose[6]*zz+pose[7],pose[8]*xx+pose[9]*yy+pose[10]*zz+pose[11]];
  const anchors=kind==='hovercar'?[[-23,19,17],[23,19,17],[-23,19,-19],[23,19,-19]]:kind==='bubblepod'?[[-31,26,23],[31,26,23]]:kind==='hoverbike'?[[-12,16,-9],[12,16,-9]]:[[-12,17,-20],[12,17,-20]];
  for(const anchor of anchors)r.glow(...at(...anchor),2.2+Math.sin(time*12+(e.seed||0))*.4,'#53cfff');
  return true;
 }
 return {types,draw};
})();

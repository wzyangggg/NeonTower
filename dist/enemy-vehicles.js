'use strict';
// Blender-authored geometry, retained once per graphics context by residentMesh.
globalThis.EnemyVehicles=(()=>{
 const creatures={mechanicalRay:'mechanicalRay',mechanicalHornet:'mechanicalHornet'};
 const types={eye:'hovercar',skull:'hoverbike',spitter:'bubblepod',moth:'fighter'};
 const variants={eye:'forge',skull:'mantis',spitter:'wraith',moth:'needle'};
 const marked={moth:'ember',fighter:'cobalt',spitter:'prism'};
 const exhausts={
  hovercar:[[-23,19,17],[23,19,17],[-23,19,-19],[23,19,-19]],
  bubblepod:[[-31,26,23],[31,26,23]],
  hoverbike:[[-12,16,-9],[12,16,-9]],
  fighter:[[-12,17,-20],[12,17,-20]],
  forge:[[-7.8,22,-31.3],[7.8,22,-31.3]],
  mantis:[[-25.2,21,-19.3],[25.2,21,-19.3]],
  wraith:[[-10,21,-25.3],[10,21,-25.3]],
  needle:[[-9.5,21,-31.3],[9.5,21,-31.3]],
  ember:[[-6.3,22,-31.7],[6.3,22,-31.7]],
  cobalt:[[-17.7,24,-27.8],[17.7,24,-27.8]],
  prism:[[-12.2,21,-21.1],[12.2,21,-21.1]],
 };
 const exhaustColors={forge:'#72f1e5',mantis:'#fce272',wraith:'#fb6ebd',needle:'#60f4fb',ember:'#57f8d2',cobalt:'#69e4ff',prism:'#42cfff'};
 function draw(e,x,z,bob,model){
  const base=e.type==='fighter'?'fighter':types[e.type]??creatures[e.type],meshes=globalThis.EnemyVehicleMeshes;
  // Each spawn already has a stable random phase in [0, 2π).
  const alternate=e.vehicleVariant??(e.seed>=Math.PI);
  const useMarked=e.vehicleVariant==='marked'||
   (e.vehicleVariant==null&&e.seed>=(variants[e.type]?1.5:1)*Math.PI);
  const markedModel=useMarked&&marked[e.type];
  const variant=alternate&&variants[e.type];
  const kind=model??e.vehicleModel??(meshes?.[markedModel]?markedModel:meshes?.[variant]?variant:base);
  const data=meshes?.[kind];
  if(!data)return false;
  const r=renderer,pose=enemyFlightPose(e,x,z,bob,e.vehicleScale);
  r.residentMesh('enemy-vehicle:'+kind,()=>{
   r.data=new Float32Array(data);r.count=data.length;
  },pose,enemyHitFeedback(e));
  const wings=globalThis.EnemyVehicleWings?.[kind];
  if(wings){
   const flap=.18*Math.sin(e.t*21+(e.seed||0));
   wings.meshes.forEach((wing,index)=>{
    const side=index===0?-1:1;
    const pivot=[side*wings.pivot[0],wings.pivot[1]];
    const c=Math.cos(flap),s=Math.sin(side*flap),wingPose=pose.slice();
    for(let row=0;row<12;row+=4){
     const x=pose[row],y=pose[row+1];
     wingPose[row]=x*c+y*s;
     wingPose[row+1]=y*c-x*s;
     wingPose[row+3]+=(x-wingPose[row])*pivot[0]+(y-wingPose[row+1])*pivot[1];
    }
    r.residentMesh('enemy-vehicle:'+kind+':wing'+index,()=>{
     r.data=new Float32Array(wing);r.count=wing.length;
    },wingPose,enemyHitFeedback(e));
   });
  }
  const canopy=globalThis.EnemyVehicleCanopies?.[kind];
  if(canopy?.length){
   const mesh=r.residentMesh('enemy-vehicle-canopy:'+kind,()=>{r.data=new Float32Array(canopy);r.count=canopy.length;},pose,enemyHitFeedback(e));mesh.opacity=.32;
  }
  // Exhaust pulses are sprites; hull geometry and material data stay unchanged.
  const exhaustPose=r.residentTransform?.(pose)??pose;
  const at=(xx,yy,zz)=>[exhaustPose[0]*xx+exhaustPose[1]*yy+exhaustPose[2]*zz+exhaustPose[3],exhaustPose[4]*xx+exhaustPose[5]*yy+exhaustPose[6]*zz+exhaustPose[7],exhaustPose[8]*xx+exhaustPose[9]*yy+exhaustPose[10]*zz+exhaustPose[11]];
  for(const anchor of exhausts[kind]??[])r.glow(...at(...anchor),2.2+Math.sin(time*12+(e.seed||0))*.4,exhaustColors[kind]||'#53cfff');
  return true;
 }
 return {types,variants,marked,creatures,draw};
})();

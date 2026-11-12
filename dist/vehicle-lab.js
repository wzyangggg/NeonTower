'use strict';
// Local inspection uses the actual enemies and ordinary game camera.
function showVehicleLab(mode){
 reset();state='combat';paused=true;floor=8;phase=0;scroll=0;spawnQueue=[];enemyTransports=[];timedRoom={remaining:45,nextWaveAt:999};
 const marked=mode==='3',creatures=mode==='4';
 const mapping=creatures?{...EnemyVehicles.creatures,moth:'fighter',fighter:'fighter'}:marked?EnemyVehicles.marked:EnemyVehicles.types;
 const positions=marked?[[220,185],[430,185],[325,420]]:[[220,185],[430,185],[220,400],[430,400]];
 const vehicleVariant=marked?'marked':mode==='2';
 enemies=Object.keys(mapping).map((type,i)=>{
  const [x,y]=positions[i];
  return {type,x,y,homeX:x,homeY:y,r:14,hp:4,max:4,seed:i,t:0,fire:3,warn:false,vehicleVariant,vehicleModel:creatures?mapping[type]:undefined};
 });
 p.x=325;p.y=300;p.inv=999;shoes=null;toast('',0);
 document.getElementById('status').textContent='载具模型预览 · 已暂停';
 const labels={'1':'上：飞车 / 飞摩托　下：球舱 / 战斗机','2':'上：熔炉 / 螳刃　下：幽镰 / 赤针','3':'上：烬翼 / 钴隼　下：棱核','4':'上：机械魔鬼鱼 / 机械黄蜂　下：战斗机亮度对照'};
 document.getElementById('wave').textContent=labels[mode];
 draw();
}

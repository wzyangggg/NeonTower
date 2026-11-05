'use strict';
// Local inspection uses the actual enemies and ordinary game camera.
if(new URLSearchParams(location.search).get('vehiclelab')==='1'){
 reset();state='combat';paused=true;floor=8;phase=0;scroll=0;spawnQueue=[];enemyTransports=[];timedRoom={remaining:45,nextWaveAt:999};
 const positions=[[220,185],[430,185],[220,400],[430,400]];
 enemies=Object.keys(EnemyVehicles.types).map((type,i)=>({type,x:positions[i][0],y:positions[i][1],homeX:positions[i][0],homeY:positions[i][1],r:14,hp:4,max:4,seed:i,t:0,fire:3,warn:false}));
 p.x=325;p.y=300;p.inv=999;shoes=null;toast('',0);
 document.getElementById('status').textContent='载具模型预览 · 已暂停';
 document.getElementById('wave').textContent='上：飞车 / 飞摩托　下：球舱 / 战斗机';
 draw();
}

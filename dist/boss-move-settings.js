'use strict';

globalThis.BossMoveSettings=(()=>{
 const arsenal={
  chevron:{name:'楔形齐射',period:10.5,warn:.54,interval:.46,bursts:2},
  rocket:{name:'定向火箭',period:12.1},
  seeker:{name:'限转追踪导弹',period:13.8,warn:.5},
  curve:{name:'折翼火雨',period:14.5,warn:.72,interval:.23,bursts:5},
  homing:{name:'追猎针弹',period:15.2,warn:.68,interval:.53,bursts:2},
  fan:{name:'交替扇射',period:11.6,interval:.29,bursts:3},
  gatling:{name:'加特林追射',period:12,warn:.35,interval:.05,bursts:60},
  spores:{name:'孢子喷射',period:13,warn:.45,interval:.28,bursts:4},
  brake:{name:'悬停加速弹',period:13.4},
  beam:{name:'翼炮扫线',period:17.5,warn:1.05,length:1.08,turnSpeed:.93,width:11},
  split:{name:'燃星裂变',period:15.1,warn:.85},
  spiral:{name:'逆旋双螺旋',period:16.2,interval:.12,bursts:12},
  dive:{name:'掠地俯冲',kind:'dash',period:20,windup:.96,speed:860,extraPasses:1},
  wave:{name:'蛇形双列',period:14.1,interval:.27,bursts:4},
  ring:{name:'错层环爆',period:16.3,interval:.4,bursts:2},
  bend:{name:'折向弹雨',period:16.5,interval:.19,bursts:5},
  orbit:{name:'卫星弹脱轨',period:18.8},
  wall:{name:'侧墙留门',period:19.3},
  return:{name:'回收镰刃',period:18.2},
  mines:{name:'延时布雷',period:20.3},
  inward:{name:'缩圈留门',period:22.1},
  cross:{name:'横翼冲撞',kind:'dash',period:24,windup:1.08,speed:810,extraPasses:2},
  pulse:{name:'双臂相位脉冲',period:12,warn:.72,interval:.42,bursts:2,craft:'prism'},
  pincer:{name:'螳爪夹击',period:12,warn:.65,interval:.42,bursts:2,craft:'mantis'},
  lance:{name:'锁线贯射',period:11,warn:.9,interval:.19,bursts:3,craft:'needle'},
 };
 const definitions={
  bulletSpeed:['弹速（单位/秒）',10,900,1],
  speedScale:['弹速倍率',.1,3,.05],
  turn:['转向速度（弧度/秒）',.05,8,.05],
  spread:['弹幕间隔角（弧度）',.01,1.5,.01],
  cone:['扇形总角度（度）',1,180,1],
  spacing:['队列横向间隔',3,50,1],
  count:['每组弹数',1,36,1],
  fuse:['引爆时间（秒）',.2,8,.05],
  blast:['爆炸半径',8,100,1],
  track:['追踪时间（秒）',.1,6,.05],
  delay:['转向 / 脱轨延迟（秒）',.1,4,.05],
  sway:['横向摆动速度',0,250,1],
  noiseRate:['漂移变化频率（次/秒）',.2,8,.1],
  bulletRadius:['孢子半径',3,16,1],
  cloudRadius:['散布半径',10,200,1],
  lingerTime:['停留时间（秒）',.2,15,.1],
  frequency:['摆动频率（弧度/秒）',.2,12,.1],
  gap:['安全缺口半宽',25,160,1],
  radius:['环绕半径',15,140,1],
  length:['扫射持续时间（秒）',.1,4,.05],
  aimSpeed:['预警追踪转速（弧度/秒）',.05,6,.05],
  turnSpeed:['开火追踪转速（弧度/秒）',0,4,.05],
  width:['激光判定半宽',2,30,1],
  speed:['冲刺速度',100,1500,10],
  sideScale:['侧向冲刺速度倍率',.2,1.5,.05],
  extraPasses:['追加横穿次数',0,4,1],
  shotSpacing:['沿途开火距离间隔',35,220,1],
  cueTime:['侧翼预警时间（秒）',.2,2,.05],
  recovery:['返场时间（秒）',.2,2,.05],
  acceleration:['加速度',50,1500,10],
  maxSpeed:['最高弹速',50,650,5],
  pause:['悬停结束时间（秒）',.3,3,.05],
  brakeTime:['减速耗时（秒）',.1,2,.05],
  childSpeed:['裂变子弹速度',20,600,1],
  childCount:['裂变子弹数',3,30,1],
 };
 const extras={
  chevron:{bulletSpeed:187,count:7,spacing:17},
  rocket:{bulletSpeed:207,spread:.23,fuse:2.65,blast:35,childSpeed:155,childCount:9},
  seeker:{bulletSpeed:178,turn:.68,track:2.95,fuse:2.95,blast:42},
  curve:{bulletSpeed:144,turn:.63,count:4,spread:.155},
  homing:{bulletSpeed:159,turn:1.16,track:1.42,spread:.36,count:3},
  fan:{bulletSpeed:186,count:7,spread:.17},
  gatling:{bulletSpeed:460,cone:22,count:1},
  spores:{bulletSpeed:112,count:9,cloudRadius:76,brakeTime:1.8,lingerTime:3,sway:95,noiseRate:1.5,bulletRadius:7},
  brake:{bulletSpeed:188,count:9,spread:.145,maxSpeed:300,acceleration:740,pause:1,brakeTime:.65},
  split:{bulletSpeed:202,spread:.53,delay:1.13,childSpeed:159,childCount:11},
  spiral:{bulletSpeed:137,turn:.5,spread:.28},
  wave:{bulletSpeed:144,spread:.21,sway:104,frequency:4.8},
  ring:{bulletSpeed:116,count:15,spread:.2},
  bend:{bulletSpeed:148,turn:4,delay:.48,count:3,spread:.24},
  orbit:{bulletSpeed:152,turn:1.95,radius:73,delay:.76,count:12},
  wall:{bulletSpeed:140,gap:70},
  return:{bulletSpeed:189,turn:3.1,delay:1.13,count:4,spread:.09},
  mines:{fuse:2.45,blast:47,count:3},
  inward:{speedScale:1,count:24},
  pulse:{bulletSpeed:109,count:8,spread:.32},
  pincer:{bulletSpeed:164,turn:1.17,count:3,spread:.14},
  lance:{bulletSpeed:337,spread:.045},
  dive:{bulletSpeed:166,sideScale:.79,shotSpacing:104,cueTime:.58,recovery:.86},
  cross:{bulletSpeed:166,sideScale:.79,shotSpacing:104,cueTime:.58,recovery:.86},
 };
 const fields={},defaults={};
 for(const [id,spec] of Object.entries(arsenal)){
  const values={period:spec.period,warn:spec.warn??.32,...extras[id]};
  if(spec.kind==='dash'){
   delete values.warn;
   Object.assign(values,{windup:spec.windup,speed:spec.speed,extraPasses:spec.extraPasses});
  }else if(id==='beam'){
   Object.assign(values,{length:spec.length,aimSpeed:1.6,turnSpeed:spec.turnSpeed,width:spec.width});
  }else Object.assign(values,{interval:spec.interval??.35,bursts:spec.bursts??1});
  defaults[id]=values;
  const common={period:['出招后冷却（秒，仅连续挑战）',1,60,.1],warn:['出招预警（秒）',.1,4,.05],
   windup:['冲刺蓄力（秒）',.1,4,.05],interval:['连发间隔（秒）',.05,2,.05],bursts:['连发轮数',1,300,1]};
  fields[id]=Object.entries(values).map(([key,value])=>{
   const [label,min,max,initialStep]=common[key]??definitions[key];
   let step=initialStep;
   while(Math.abs((value-min)/step-Math.round((value-min)/step))>.000001)step/=10;
   return {key,value,label:id==='spores'&&key==='sway'?'飞行漂移强度':label,min,max,step};
  });
 }
 function validate(id,values){
  if(!fields[id]||!values||typeof values!=='object'||Array.isArray(values))throw Error('无效的招式参数');
  const result={};
  for(const [key,value] of Object.entries(values)){
   const field=fields[id].find(field=>field.key===key);
   if(!field||!Number.isFinite(value)||value<field.min||value>field.max||(field.step===1&&!Number.isInteger(value)))throw Error('无效的参数 '+key);
   result[key]=value;
  }
  return result;
 }
 return {arsenal,fields,defaults,validate};
})();

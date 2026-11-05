'use strict';
// Category stages are independent of equipment tiers. UI may call set/setAll later.
globalThis.Specializations=(()=>{
 const ids=['pistol','smg','uzi','rifle','sniper','rocket','seeker','laser','tesla','boomerang','bee','sword','shotgun','shotgun_tower','sniper_tower','electric_tower','missile_tower','healing_tower','shield_tower','slow_field','repair_turret'];
 const key='hell-elevator-specializations-v1';let levels={},revision=0;const zones=[],links=[];
 try{const saved=JSON.parse(localStorage.getItem(key)||'{}');for(const id of ids)levels[id]=clamp(saved[id]);}catch{}
 function clamp(n){return Number.isInteger(n)?Math.max(0,Math.min(5,n)):0;}
 function level(id){return levels[id]||0;}
 function set(id,n){if(!ids.includes(id)||!Number.isInteger(n)||n<0||n>5)return false;levels[id]=n;revision++;try{localStorage.setItem(key,JSON.stringify(levels));}catch{}return true;}
 function setAll(n){if(!Number.isInteger(n)||n<0||n>5)return false;for(const id of ids)set(id,n);return true;}
 const family=w=>w.familyId||({pulse:'pistol',barrett:'sniper'}[w.id]||w.id);
 const roll=p=>Math.random()<p;
 function stats(id,n=level(id)){
  const q={id,n,size:1,damage:1,rate:1,range:1,speed:1,blast:1};const at=s=>n>=s;
  if(!n)return q;
  const thresholds={pistol:[2,2,3,1.4,1.25,1.3],smg:[1,1,3,1.35,1.2,1.2],uzi:[2,2,3,1.4,1.2,1.2],rifle:[0,0,2,1,1,1.2],sniper:[2,2,4,1.6,1.3,1.2],rocket:[1,1,3,1.4,1.25,1.2],seeker:[3,3,4,1.4,1.2,1.2],laser:[1,1,3,1.4,1.25,1.2],tesla:[3,3,4,1.5,1.3,1.25],boomerang:[1,1,0,1.4,1.2,1],bee:[2,2,4,1.4,1.25,1.2],sword:[1,1,3,1.3,1.2,1.2],shotgun:[2,2,3,1.4,1.2,1.2],shotgun_tower:[2,2,3,1.5,1.25,1.2],sniper_tower:[2,2,3,1.6,1.3,1.2],electric_tower:[2,2,4,1.5,1.25,1.2],missile_tower:[1,1,4,1.4,1.25,1.2]};
  const t=thresholds[id];if(t){if(t[0]&&at(t[0]))q.size=t[3];if(t[1]&&at(t[1]))q.damage=t[4];if(t[2]&&at(t[2]))q.rate=t[5];}
  if(id==='boomerang'){if(at(2))q.range=1.4;if(at(3))q.speed=1.35;if(at(5))q.size=1.6;}
  if(id==='rocket'&&at(1)||id==='missile_tower'&&at(1))q.blast=1.2;
  if(id==='seeker'&&at(3))q.blast=1.25;
  if(id==='shotgun_tower'&&at(4))q.range=1.3;
  if(id==='healing_tower'&&at(3)||id==='shield_tower'&&at(2)||id==='repair_turret'&&at(2))q.rate=1.2;
  if(id==='slow_field')q.range=1.2;
  if((id==='pistol'&&at(4))||(id==='uzi'&&at(4))||(id==='seeker'&&at(2))||(id==='bee'&&at(3))||(id==='shotgun_tower'&&at(5)))q.weak=.1;
  if(id==='sniper'&&at(3)||id==='laser'&&at(4)||id==='sword'&&at(4)||id==='sniper_tower'&&at(4))q.weak=.15;
  if(id==='smg'&&at(4))q.slow=.15;
  if(id==='tesla'&&at(4)||id==='electric_tower'&&at(3))q.slow=.3;
  if(id==='rocket'&&at(4)||id==='missile_tower'&&at(3))q.burn=true;
  return q;
 }
 function cloneShot(s,damage=1){const q={...s,damage:s.damage*damage,pierce:s.specBasePierce??s.pierce,hitTargets:new Set(),specDerived:true,specRound:null,specBounce:0,specBurst:false,specApplied:true,modelTrail:[],damageApplied:false,modelHitAt:new WeakMap()};if(s.evolution)q.evolution={...s.evolution};return q;}
 function decorate(s,q,round,derived=false){
  if(s.specApplied)return;s.specApplied=true;s.spec=q;s.specRound=round;s.specDerived=derived;s.specBasePierce=s.pierce;
  s.damage*=q.damage;s.hitRadius=(s.hitRadius??4)*q.size;
  if(s.evolution)s.evolution={...s.evolution,size:s.evolution.size*q.size};
  else s.specSize=q.size;
  if(s.slashRadius)s.slashRadius*=q.size;if(s.waveRadius)s.waveRadius*=q.size;
  if(s.blastRadius)s.blastRadius*=q.blast;
  if(s.boomerang){s.returnRange*=q.range;s.vx*=q.speed;s.vy*=q.speed;s.life=Math.max(s.life,s.returnRange*2/Math.max(1,Math.hypot(s.vx,s.vy))+.6);}
 }
 function nearest(origin,exclude=[],distance=Infinity){return combatTargets().filter(e=>e.hp>0&&!exclude.includes(e)&&Math.hypot(e.x-origin.x,e.y-origin.y)<=distance).sort((a,b)=>Math.hypot(a.x-origin.x,a.y-origin.y)-Math.hypot(b.x-origin.x,b.y-origin.y));}
 function arc(origin,first,template,coefficient=1,count=null){
  const chain=arcChain(origin,count??template.arcTargets.length,template.spec?.id==='electric_tower'?135:template.ownerItem?.chainRange||120,first);
  if(!chain.length)return null;const q=cloneShot(template,coefficient);q.arcTargets=chain;q.points=[{x:origin.x,y:origin.y},...chain.map(e=>({x:e.x,y:e.y}))];q.arcSegments=null;q.originX=origin.x;q.originY=origin.y;q.x=chain.at(-1).x;q.y=chain.at(-1).y;q.pierce=chain.length;shots.push(q);return q;
 }
 function afterVolley(start,id,angle,origin){
  const cfg=stats(id);if(!cfg.n)return;
  const round={usedHit:false,usedExplosion:false};const originals=shots.slice(start).filter(s=>!s.drinkEcho&&!s.electricRing&&!s.secondaryCut&&!s.specDerived);
  for(const s of originals)decorate(s,cfg,round);
  if(!originals.length)return;
  const base=originals.find(s=>!s.slash)||originals[0],n=cfg.n;
  const at=s=>n>=s;
  const extra=(count,coefficient,spread=.08)=>{for(let i=0;i<count;i++){
   const q=cloneShot(base,coefficient);q.launchDelay=(base.launchDelay||0)+(i+1)*.04;
   if(q.sustain)q.launchDelay=0;
   const a=angle+(i-(count-1)/2)*spread,v=Math.hypot(q.vx,q.vy);
   q.vx=Math.cos(a)*v;q.vy=Math.sin(a)*v;q.aim=a;
   if(q.beam&&!q.arc){const len=Math.hypot(q.x-q.originX,q.y-q.originY);q.x=q.originX+Math.cos(a)*len;q.y=q.originY+Math.sin(a)*len;}
   if(q.boomerang){const target=nearest(origin)[i+1];if(target){const aim=Math.atan2(target.y-origin.y,target.x-origin.x);q.vx=Math.cos(aim)*v;q.vy=Math.sin(aim)*v;}}
   if(id==='rifle')q.launchDelay=Math.max(...originals.map(s=>s.launchDelay||0))+.075;
   shots.push(q);
  }};
  const pierce=(prob,count,shotsCount=1)=>{if(roll(prob))for(const s of originals.slice(0,shotsCount))s.pierce+=count;};
  if(id==='pistol'){base.specBounce=at(5)?3:at(4)?2:1;base.specBounceRoll=roll(at(5)?.75:at(4)?.6:.3);if(at(5)&&roll(.6))extra(1,.4);}
  if(id==='smg'){if(at(2))pierce(.2,1);if(at(5)&&roll(.6))extra(2,.5);}
  if(id==='uzi'){pierce(.2,1,2);if(at(5)&&roll(.6))extra(2,.5);}
  if(id==='rifle'){if(at(3))for(const s of originals)s.pierce++;if(roll(at(5)?.6:.2))extra(1,1);if(at(4))round.hitBlast=roll(at(5)?.6:.2)?{shot:originals.at(-1),radius:55,coefficient:at(5)?.6:.4}:null;}
  if(id==='sniper'||id==='sniper_tower'){pierce(.25,2);if(at(5)&&roll(.6))round.hitBlast={shot:base,radius:id==='sniper'?60:65,coefficient:.5};}
  if(id==='rocket'||id==='missile_tower'){if(at(2)&&roll(.2))extra(1,.6);if(at(5))round.cluster=roll(.6)?{count:3,coefficient:.25}:null;}
  if(id==='seeker'){if(roll(.25))extra(2,.6,.2);if(at(5))round.cluster=roll(.6)?{count:2,coefficient:.4,seeking:true}:null;}
  if(id==='laser'&&at(2)&&roll(at(5)?.6:.2))extra(at(5)?2:1,.5,.12);
  if(id==='boomerang'&&at(4)&&roll(at(5)?.6:.25))extra(at(5)?3:2,.5,.25);
  if(id==='bee'){if(roll(.25))extra(2,.5,.15);if(at(5)&&roll(.6))round.hitBlast={shot:base,radius:45,coefficient:.6};}
  if(id==='sword'&&at(2))round.blades=roll(at(5)?.6:.2)?at(5)?3:1:0;
  if(id==='shotgun'||id==='shotgun_tower'){
   if(roll(.25))extra(2,1,.14);
   if(id==='shotgun'&&at(4))pierce(.6,1,2);
   if(at(5)&&roll(.6))round.hitBlast={shot:base,radius:id==='shotgun'?40:45,coefficient:.6};
  }
  if(id==='tesla'||id==='electric_tower'){
   const chains=originals.filter(s=>s.arc&&!s.radial),chain=chains[0];if(!chain)return;
   if((id==='electric_tower'||at(2))&&roll(.25)){
    const targets=chain.arcTargets;let from=targets.at(-1);if(from){chain.specChainBaseCount=targets.length;for(let i=0;i<2;i++){const next=nearest(from,targets,135)[0];if(!next)break;targets.push(next);chain.points.push({x:next.x,y:next.y});from=next;}chain.pierce=targets.length;chain.x=from.x;chain.y=from.y;}
   }
   if((id==='tesla'||at(5))&&roll(at(5)?.6:.2)){
    const excluded=chains.map(s=>s.arcTargets[0]),targets=nearest(origin,excluded,id==='electric_tower'?420:Infinity);
    for(const first of targets.slice(0,at(5)?2:1))arc(origin,first,chain,.5,chain.ownerItem?.pierce||Math.max(1,chain.specChainBaseCount||chain.arcTargets.length));
   }
  }
 }
 function emit(w,a,origin,source,callback){
  if(source!=='weapon')return callback();const id=family(w),q=stats(id);if(!q.n)return callback();
   const start=shots.length;
  // Keep the owner's mutable evolution state, but restore temporary cadence values.
  try{if(id==='rifle'&&q.rate>1)w.specBurstGap=.075/q.rate;return callback();}
  finally{delete w.specBurstGap;afterVolley(start,id,a,origin);}
 }
 function damage(s,amount,e){
  if(s.specChainBaseCount!=null&&s.arcTargets.indexOf(e)>=s.specChainBaseCount)amount=s.damage*.4;
  return amount*(e&&time<(e.specWeakUntil||0)?1+(e.specWeak||0):1);
 }
 function status(e,q){
  if(q.weak){if(time>=(e.specWeakUntil||0))e.specWeak=0;e.specWeak=Math.max(e.specWeak||0,q.weak);e.specWeakUntil=time+(q.id==='sniper'||q.id==='sniper_tower'||q.id==='bee'?3:2);}
  if(q.slow){if(time>=(e.specSlowUntil||0))e.specSlow=0;e.specSlow=Math.max(e.specSlow||0,q.slow);e.specSlowUntil=time+(q.id==='smg'?1:2);e.specElectric=q.id==='tesla'||q.id==='electric_tower';}
 }
 function radial(x,y,radius,amount,source,spec=null){
  const targets=nearest({x,y}).filter(e=>Math.hypot(e.x-x,e.y-y)<=(e.r||0)+radius);
  const s={beam:true,arc:true,radial:true,arcTargets:targets,x,y,originX:x,originY:y,vx:0,vy:0,life:.18,damage:amount,pierce:targets.length+1,hitTargets:new Set(),damageApplied:false,critChance:0,color:'#ffe2b0',source,weaponId:'spec-burst',radius,height:12,spec,specDerived:true,specApplied:true};shots.push(s);return s;
 }
 function onHit(s,e){
  if(!s.spec)return;status(e,s.spec);if(s.specDerived)return;
  const round=s.specRound;if(!round)return;
  if(s.specBounceRoll&&s.specBounce>0){
   const visited=[...(s.hitTargets||[]),e],target=nearest(e,visited,220)[0];if(target){
    const q=cloneShot(s);q.specBounce=s.specBounce-1;q.specBounceRoll=true;q.specDerived=false;q.specRound=round;q.hitTargets=new Set(visited);
    q.x=e.x;q.y=e.y;q.lastX=e.x;q.lastY=e.y;q.launchDelay=0;q.life=1;q.damage=(s.specOriginalDamage||s.damage)*.4;q.specOriginalDamage=s.specOriginalDamage||s.damage;q.pierce=1;
    const a=Math.atan2(target.y-e.y,target.x-e.x),v=Math.hypot(s.vx,s.vy)||1100;q.vx=Math.cos(a)*v;q.vy=Math.sin(a)*v;shots.push(q);
   }s.specBounce=0;
  }
  if(round.hitBlast?.shot===s&&!round.usedHit){round.usedHit=true;const b=round.hitBlast,base=s.towerSniper?ElectricTiles.sniperDamage(s,e):s.damage;radial(e.x,e.y,b.radius,base*b.coefficient,s.source,s.spec);spawnExplosionFX(e.x,e.y,b.radius);}
  if(round.blades&&!round.usedHit){round.usedHit=true;const a=s.aim??Math.atan2(s.vy,s.vx);for(let i=0;i<round.blades;i++){const angle=a+(i-(round.blades-1)/2)*.3;shots.push({x:e.x,y:e.y,vx:Math.cos(angle)*850,vy:Math.sin(angle)*850,life:2,damage:s.damage*.5,pierce:3,hitTargets:new Set(),source:s.source,weaponId:'sword',crescent:true,waveRadius:26,hitRadius:6,height:s.height||24,color:s.color,evolution:s.evolution?{...s.evolution}:null,spec:s.spec,specDerived:true,specApplied:true});}}
 }
 function explosion(s){
  if(!s.spec||s.specDerived||s.specExplosionHandled)return;s.specExplosionHandled=true;const round=s.specRound;
  if(s.spec.burn)zones.push({x:s.x,y:s.y,radius:s.blastRadius,damage:s.damage*.15,source:s.source,left:2,clock:0});
  if(round?.cluster&&!round.usedExplosion){round.usedExplosion=true;const b=round.cluster;
   for(let i=0;i<b.count;i++){const angle=i*Math.PI*2/b.count;
    if(b.seeking){const q=cloneShot(s,b.coefficient);q.x=s.x;q.y=s.y;q.vx=Math.cos(angle)*500;q.vy=Math.sin(angle)*500;q.life=3;q.exploded=false;q.age=0;q.homingTarget=null;q.blastRadius=s.blastRadius*.6;q.launchDelay=0;shots.push(q);}
    else{const x=s.x+Math.cos(angle)*s.blastRadius*.65,y=s.y+Math.sin(angle)*s.blastRadius*.65;radial(x,y,s.blastRadius*.4,s.damage*b.coefficient,s.source);spawnExplosionFX(x,y,s.blastRadius*.4);}
   }
  }
 }
 function factor(e){let k=time<(e.specSlowUntil||0)?1-(e.specSlow||0):1;if(time<(e.specRootUntil||0))k=0;return k;}
 function pulse(origin,radius){for(const e of nearest(origin,[],radius)){status(e,{slow:.4,id:'shield_tower'});}burst(origin.x,origin.y,'#69f9de',16);}
 function tick(dt){
  if(paused||!['combat','survival'].includes(state))return;
  for(let i=links.length-1;i>=0;i--){links[i].left-=dt;if(links[i].left<=0)links.splice(i,1);}
  for(const z of zones){const used=Math.min(dt,z.left);z.clock+=used;z.left-=used;while(z.clock>=.5-1e-8){z.clock-=.5;const s=radial(z.x,z.y,z.radius,z.damage*.5,z.source);s.specDot=true;for(const e of s.arcTargets)e.specBurnUntil=time+.6;}}
  for(let i=zones.length-1;i>=0;i--)if(zones[i].left<=0)zones.splice(i,1);
  if(level('shield_tower')>=5&&p.towerShieldLeft>0){p.specShieldClock=(p.specShieldClock||0)+dt;if(p.specShieldClock>=1){p.specShieldClock%=1;pulse(p,100);}}else p.specShieldClock=0;
  for(const t of tiles){if(t.specRegenLeft>0&&coverAlive(t)){const used=Math.min(dt,t.specRegenLeft);t.specRegenLeft-=used;t.coverHp=Math.min(coverMaximum(t),t.coverHp+used*(t.specRegenRate||1));}}
  if(p.specRegenLeft>0&&p.hp>0){const used=Math.min(dt,p.specRegenLeft);p.specRegenLeft-=used;p.hp=Math.min(p.max,p.hp+used*(p.specRegenRate||1));}
 }
 function draw(){
  if(!['combat','survival'].includes(state))return;
  const r=renderer;for(const e of combatTargets()){
   const weak=time<(e.specWeakUntil||0),slow=time<(e.specSlowUntil||0),burn=time<(e.specBurnUntil||0);if(!weak&&!slow&&!burn)continue;
   const x=e.x-325,z=(e.y-300)*1.06,c=weak?'#ffb96b':burn?'#ff954f':e.specElectric?'#c2f4ff':'#d6c3ff';
   r.residentMesh('specialization-status:'+c,()=>{r.emissiveRing(0,0,0,1,c,.06);r.emissiveBox(0,2,0,.15,.6,.1,c);},monsterPose(x,6,z,0,(e.r||14)+3,1,(e.r||14)+3));
   if(weak)r.emissiveBox(x,65,z,8,3,2,c,.65);if(slow&&e.specElectric)r.emissiveBox(x+Math.sin(time*30)*8,37,z,2,9,2,c,.4);
  }
  for(const z of zones)r.emissiveRing(z.x-325,3,(z.y-300)*1.06,z.radius,'#ff9c55',1.2);
  for(const l of links)monsterStrut([l.from.x-325,32,(l.from.y-300)*1.06],[l.to.x-325,16,(l.to.y-300)*1.06],1.5,'#71ffad');
 }
 function clear(){zones.length=0;links.length=0;if(typeof p!=='undefined'){delete p.specRegenLeft;delete p.specShieldClock;}for(const t of typeof tiles==='undefined'?[]:tiles){delete t.specRegenLeft;delete t.specRegenRate;}for(const e of typeof enemies==='undefined'?[]:enemies)for(const k of Object.keys(e))if(k.startsWith('spec'))delete e[k];}
 function cadence(w){return stats(family(w)).rate;}
 function facilityRange(f,base){return base*stats(f.kind).range;}
 function shield(f,duration){if(level('shield_tower')>=1)duration++;grantTemporaryShield(duration);if(level('shield_tower')>=4)pulse(p,100);p.specShieldClock=0;}
 function healTarget(unit,field,max,amount,f,scale=1){const n=level('healing_tower');unit[field]=Math.min(max,unit[field]+(amount+(n>=1?1:0))*scale);if(n>=4){unit.specRegenLeft=3;unit.specRegenRate=scale;}updateUI();}
 function heal(f,targets,amount){
  const n=level('healing_tower'),prob=n>=5?.6:.25,count=n>=5?3:1;
  if(!targets.length)return false;
  const first=targets[0];healTarget(first.unit,first.field,first.max,amount,f);
  const selected=n>=2&&roll(prob)?targets.slice(1,1+count):[];for(const t of selected){healTarget(t.unit,t.field,t.max,amount,f,.5);links.push({from:ElectricTiles.facilityCenter(f),to:{x:t.at.x,y:t.at.y},left:.4});burst(t.at.x,t.at.y,'#71ffad',6);}
  return true;
 }
 function init(){
  const params=new URLSearchParams(location.search);if(params.get('dev')==='1'&&params.has('spec')){const n=Number(params.get('spec'));if(Number.isInteger(n)&&n>=0&&n<=5)setAll(n);}
 }
 return {ids,level,set,setAll,view:()=>({...levels}),get catalog(){return globalThis.SpecializationCatalog||[];},stats,family,cadence,emit,afterVolley,decorate,damage,onHit,explosion,factor,tick,draw,clear,facilityRange,shield,heal,roll,get revision(){return revision;},zones,init};
})();

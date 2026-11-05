from pathlib import Path
root=Path(__file__).resolve().parents[1]
def edit(name,changes):
 p=root/name;s=p.read_text(encoding='utf-8')
 for a,b in changes:
  if a not in s:raise RuntimeError(f'{name}: missing {a[:100]}')
  s=s.replace(a,b)
 p.write_text(s,encoding='utf-8')
edit('dist/game.js',[
 ("function emitWeaponShots(w,a,origin,source='weapon'){return globalThis.TalentRuntime?TalentRuntime.withWeapon(w,source,()=>emitWeaponShotsBase(w,a,origin,source)):emitWeaponShotsBase(w,a,origin,source);}","function emitWeaponShots(w,a,origin,source='weapon'){const emit=()=>globalThis.TalentRuntime?TalentRuntime.withWeapon(w,source,()=>emitWeaponShotsBase(w,a,origin,source)):emitWeaponShotsBase(w,a,origin,source);return globalThis.Specializations?Specializations.emit(w,a,origin,source,emit):emit();}"),
 ('shootTimer=weapon.interval;applyWeaponRecoil','shootTimer=weapon.interval/(globalThis.Specializations?.cadence(weapon)||1);applyWeaponRecoil'),
 ('baseDamage=globalThis.TalentRuntime?.damage(s,baseDamage)??baseDamage;','baseDamage=globalThis.TalentRuntime?.damage(s,baseDamage)??baseDamage;baseDamage=globalThis.Specializations?.damage(s,baseDamage,target)??baseDamage;'),
 ('onDrinkHit(s,e,hit.damage);onModelWeaponHit(s,e);','onDrinkHit(s,e,hit.damage);globalThis.Specializations?.onHit(s,e);onModelWeaponHit(s,e);'),
 ('const w=s.ownerItem;if(!w||s.secondaryCut)return;','const w=s.ownerItem;if(!w||s.secondaryCut||s.specDerived)return;'),
 ('s.exploded=true;s.life=0;','s.exploded=true;s.life=0;globalThis.Specializations?.explosion(s);'),
 ('elementTheme:s.elementTheme});if(s.elementTheme)','elementTheme:s.elementTheme,spec:s.spec,specDerived:true,specApplied:true});if(s.elementTheme)'),
 ('globalThis.TalentRuntime?.tick(realDt);','globalThis.TalentRuntime?.tick(realDt);globalThis.Specializations?.tick(realDt);'),
 ('factor:globalThis.ElectricTiles?.movementFactor(e)??1','factor:Math.min(globalThis.ElectricTiles?.movementFactor(e)??1,globalThis.Specializations?.factor(e)??1)'),
 ('globalThis.TalentRuntime?.draw();r.end();','globalThis.TalentRuntime?.draw();globalThis.Specializations?.draw();r.end();'),
 ('tagModelShots(at,w,source,n*.075)','tagModelShots(at,w,source,n*(w.specBurstGap||.075))'),
 ('s.returnRange=Math.max(220,nearest);','s.returnRange=Math.max(220,nearest);'),
 ('function reset(){','function reset(){globalThis.Specializations?.clear();'),
 ("drawFriendlyShot(s);if(s.drinkScale", "drawFriendlyShot(s);if(s.specSize>1&&!s.evolution&&!s.beam)scaleDrinkPlayer(meshStart,glowStart,s.specSize,X(s.x),Z(s.y),s.height||12);if(s.drinkScale")
])
edit('dist/index.html',[( '<script src="talents.js"></script>','<script src="talents.js"></script><script src="specializations.js"></script>')])
edit('dist/hex-loader.js',[("  await Promise.all([", "  globalThis.Specializations?.init();\n  await Promise.all([")])
edit('dist/electric-tiles.js',[
 (' const defs={',' const specLevel=id=>globalThis.Specializations?.level(id)||0;\n const attackRange=kind=>(globalThis.Specializations?.facilityRange({kind},defs[kind].attackRange)??defs[kind].attackRange);\n const defs={'),
 ('source?defs.repair_turret.wallBonus:0','source?defs.repair_turret.wallBonus+(specLevel(\'repair_turret\')>=1?2:0):0'),
 ('}else f.products++;',"}else {f.products++;if(f.kind==='shield_tower'&&!echo&&specLevel('shield_tower')>=3&&Math.random()<.2)f.products++;}"),
 ('grantTemporaryShield(1+towerLevel(f));',"if(globalThis.Specializations)Specializations.shield(f,1+towerLevel(f));else grantTemporaryShield(1+towerLevel(f));"),
 ('f.cool-(delta+boostedTime*.3*boosts)*(supplyProducer(f.kind)?1+buffs.production:1)','f.cool-(delta+boostedTime*.3*boosts)*(supplyProducer(f.kind)?1+buffs.production:1)*(globalThis.Specializations?.stats(f.kind).rate||1)'),
 ('<=defs[f.kind].attackRange','<=attackRange(f.kind)'),
 ('life:defs[f.kind].attackRange/speed','life:attackRange(f.kind)/speed'),
 ('function defenseStep(f,dt){','function defenseStep(f,dt){\n  const specStart=shots.length;'),
 ('  if(rotatingTower(f.kind)){f.aimLockLeft=',"  globalThis.Specializations?.afterVolley(specStart,f.kind,f.aim||0,origin);\n  if(rotatingTower(f.kind)){f.aimLockLeft="),
 ('const towerMissileRadius=s=>Math.min(150,30+Math.hypot(s.x-s.originX,s.y-s.originY)*.2);','const towerMissileRadius=s=>Math.min(150,30+Math.hypot(s.x-s.originX,s.y-s.originY)*.2)*(s.spec?.blast||1);'),
 (' function startRoom({preserveRepair=false}={}){',' function startRoom({preserveRepair=false}={}){globalThis.Specializations?.clear();'),
 ('return {activateEquipmentBomb,','return {attackRange,activateEquipmentBomb,'),
 ('if(inside)factor=Math.min(factor,.8-.1*towerLevel(f));',"if(inside){const n=specLevel('slow_field');if(unit!==p||n<2)factor=Math.min(factor,Math.max(.3,.8-.1*towerLevel(f)-(unit!==p&&n>=3?.1:0)));if(unit!==p&&n>=4){unit.specSlow=Math.max(unit.specSlow||0,1-factor);unit.specSlowUntil=time+2;}}"),
 ("<=f.range;","<=f.range*(f.kind==='slow_field'&&specLevel('slow_field')>=1?1.2:1);"),
 ('   const target=targets.filter(t=>distance(t.at)<=attackRange(f.kind)).sort((a,b)=>distance(a.at)-distance(b.at))[0];',"   const sorted=targets.filter(t=>distance(t.at)<=attackRange(f.kind)).sort((a,b)=>distance(a.at)-distance(b.at));\n   const target=sorted[0];"),
 ("const field=target.unit===p?'hp':'coverHp',amount=Math.min(towerLevel(f),target.max-target.unit[field]);target.unit[field]+=amount;", "const field=target.unit===p?'hp':'coverHp',amount=Math.min(towerLevel(f),target.max-target.unit[field]);if(globalThis.Specializations&&specLevel(f.kind)>0)Specializations.heal(f,sorted.map(t=>({...t,field:t.unit===p?'hp':'coverHp'})),towerLevel(f));else target.unit[field]+=amount;"),
 ("for(const f of live){if(f.kind==='biogenerator')", "for(const f of live){specialSupportStep(f,delta);if(f.kind==='biogenerator')"),
 (' function repairStep(f,dt,live){',' function repairStep(f,dt,live){\n  dt*=globalThis.Specializations?.stats(f.kind).rate||1;'),
 ('function fresh(f){','function fresh(f){delete f.specSupportClock;delete f.specAux;delete f.specTaskId;'),
 (' function update(dt){',' function update(dt){')
])
# Attack overlay uses exactly the combat range, not a facility effect radius.
edit('dist/electric-editor.js',[("E.defs[kind].attackRange}","(E.attackRange?.(kind)??E.defs[kind].attackRange)}")])

const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
// Explicitly exercise the retained energy system; production defaults to disabled.
await page.route('**/game.js',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const ENERGY_SYSTEM_ENABLED=false;','const ENERGY_SYSTEM_ENABLED=true;')});});
await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>globalThis.HexMap?.ready&&globalThis.ElectricTiles&&globalThis.MapIcons?.ready);
const result=await page.evaluate(()=>{
window.requestAnimationFrame=()=>0;reset();testMode=true;startWave();RoomReady?.cancel();state='combat';paused=false;p.inv=999;drone=null;turrets=[];p.x=ElectricTiles.center({x:1,y:0}).x;p.y=300;
const core=ElectricTiles.list().find(f=>f.initialCore);if(!core)throw Error('missing core');
enemies=[{type:'eye',x:470,y:300,homeX:470,homeY:300,hp:100000,max:100000,r:12,t:0,fire:999,seed:0,terrainStun:999}];spawnQueue=[];timedRoom={duration:60,remaining:60,nextWaveAt:999};
for(let i=0;i<1650;i++)step(.01);
const depleted=p.energy,stored=core.products;const old=shootTimer;step(.1);if(p.energy!==depleted||depleted>=weaponEnergyRate()*weapon.interval)throw Error('gun did not stop');
const at=ElectricTiles.center(core.anchor);p.x=at.x;p.y=at.y;step(.01);const after=p.energy;
if(after<28||stored!==1)throw Error('pickup did not resume');
// Hold the core for the rest of a long room: normal production must support the gun.
let outage=0,spentFrames=0;for(let i=0;i<4000;i++){const before=p.energy;step(.01);if(p.energy<before)spentFrames++;if(p.energy<weaponEnergyRate()*weapon.interval)outage++;}if(spentFrames<150)throw Error('gun did not continue firing');
const sustained=p.energy;if(state!=='combat'||timedRoom.remaining<3||timedRoom.remaining>4)throw Error('combat did not run forty seconds: '+state+' '+timedRoom?.remaining);if(outage)throw Error('starter cannot sustain on supply');
p.x=ElectricTiles.center({x:1,y:1}).x;p.y=ElectricTiles.center({x:1,y:1}).y;core.cool=0;p.energy=7;ElectricTiles.update(.01);paused=true;cashPopups=[];updateUI();draw();
return {depleted,stored,after,sustained,core:core.anchor,duration:normalRoomDuration(),spentFrames};});
for(const [width,height]of [[390,844],[320,568],[1280,900]]){await page.setViewportSize({width,height});await page.evaluate(()=>draw());const box=await page.locator('#energy-hud').boundingBox();assert.ok(box&&box.x>=0&&box.y>=0&&box.x+box.width<=width);await page.screenshot({path:`tests/energy-${width}x${height}.png`});}
await page.setViewportSize({width:390,height:844});
for(const value of [60,30,0]){const bars=await page.evaluate(value=>{p.energy=value;updateUI();if(value===0){p.energyWarningUntil=-Infinity;shootWeapon(0);}draw();const y=91+playerUpperLift()-playerHeadDrop()+skateJumpHeight()+mountRiderLift(),health=renderer.screenPoint(p.x-325,y,(p.y-300)*1.06),mana=renderer.screenPoint(p.x-325,y-17,(p.y-300)*1.06);return {health:health.y,mana:mana.y};},value);assert.ok(bars.mana>bars.health,'mana projects below health');if(value===0)await page.locator('#toast.show').filter({hasText:'蓝量不足'}).waitFor();await page.screenshot({path:`tests/energy-bar-${value}.png`});}
assert.deepEqual(errors,[]);console.log('Real Edge/WebGL energy depletion, core pickup, 40s sustained resupply and three viewports passed',result);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});

{const r=require('node:child_process').spawnSync(process.execPath,['tests/test-specializations.cjs'],{cwd:require('node:path').resolve(__dirname,'..'),stdio:'inherit'});if(r.status!==0)process.exit(r.status||1)}
for(const test of ['test-research-wallet.cjs','test-difficulty-music.cjs','test-difficulty.cjs','test-geometry-buffers.cjs','test-baked-particles.cjs']){const r=require('node:child_process').spawnSync(process.execPath,[require('node:path').join(__dirname,test)],{cwd:require('node:path').resolve(__dirname,'..'),stdio:'inherit'});if(r.status!==0)process.exit(r.status||1)}
{const r=require('node:child_process').spawnSync(process.execPath,[require('node:path').join(__dirname,'test-bomb-equipment.cjs')],{cwd:require('node:path').resolve(__dirname,'..'),stdio:'inherit'});if(r.status!==0)process.exit(r.status||1)}
{const r=require('node:child_process').spawnSync(process.execPath,[require('node:path').join(__dirname,'test-clock-repair.cjs')],{cwd:require('node:path').resolve(__dirname,'..'),stdio:'inherit'});if(r.status!==0)process.exit(r.status||1)}
for(const test of ['test-economy-pool.cjs','test-terrain-seed.cjs','test-terrain-generators.cjs','test-defense-towers.cjs','test-more-towers.cjs','test-designer-bomb-migration.cjs','test-pickup-feedback.cjs','test-missile-tile.cjs','test-bomb-facilities.cjs','test-strong-forecast.cjs','test-energy-disabled.cjs','test-energy.cjs','test-stealth-drone.cjs','test-enemy-diversity.cjs','test-rail-room.cjs','test-spider-pressure.cjs','test-bridge-pressure.cjs','test-bridge-room.cjs','test-saw-room.cjs','test-enemy-flight.cjs','test-machine-turret.cjs','test-drink-truck.cjs','test-enemy-waves.cjs','test-tile-feedback.cjs','test-music-ownership.cjs','test-particle-surfaces.cjs','test-fruit-model-assets.cjs','test-electric-tiles.cjs','test-farm-shapes.cjs','test-builder.cjs','test-hex-city.cjs','test-hex-terrain.cjs','test-hex-special.cjs','test-enemy-transports.cjs','test-hex-campaign.cjs']){const r=require('node:child_process').spawnSync(process.execPath,[require('node:path').join(__dirname,test)],{cwd:require('node:path').resolve(__dirname,'..'),stdio:'inherit'});if(r.status!==0)process.exit(r.status||1)}
{const r=require('node:child_process').spawnSync(process.execPath,[require('node:path').join(__dirname,'test-talents.cjs')],{cwd:require('node:path').resolve(__dirname,'..'),stdio:'inherit'});if(r.status!==0)process.exit(r.status||1)}
const {spawnSync}=require('node:child_process');const path=require('node:path');const root=path.resolve(__dirname,'..');for(const n of [52,54,55,56,57,58,59,60,61,62,63,64,69,70,73,74,75,76,77,78,80,82,84,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,104,105,106,107,108,109,110,111,112,114,122,123,124,125,127,128,129,130,131,132,137,138,139,140,141,142,143,144,145,146,147,148,149,151,152,156,157,160,162,164,165,167,171,177,181,183,184,185,186,187,188]){const r=spawnSync(process.execPath,[path.join(__dirname,'test-'+n+'.cjs')],{cwd:root,stdio:'inherit'});if(r.status!==0)process.exit(r.status||1)}


{const r=spawnSync(process.execPath,[path.join(__dirname,"test-humanoid.cjs")],{cwd:root,stdio:"inherit"});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,"test-humanoid-motion.cjs")],{cwd:root,stdio:"inherit"});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,"test-humanoid-slash.cjs")],{cwd:root,stdio:"inherit"});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,"test-humanoid-thrust.cjs")],{cwd:root,stdio:"inherit"});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,"test-humanoid-trail.cjs")],{cwd:root,stdio:"inherit"});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,"test-humanoid-charge.cjs")],{cwd:root,stdio:"inherit"});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,"test-humanoid-combo.cjs")],{cwd:root,stdio:"inherit"});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,"test-humanoid-stop.cjs")],{cwd:root,stdio:"inherit"});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,"test-humanoid-shoot.cjs")],{cwd:root,stdio:"inherit"});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,"test-humanoid-barrage.cjs")],{cwd:root,stdio:"inherit"});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,"test-humanoid-special.cjs")],{cwd:root,stdio:"inherit"});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,"test-cowboy.cjs")],{cwd:root,stdio:"inherit"});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,"test-campaign.cjs")],{cwd:root,stdio:"inherit"});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,"test-background-perf.cjs")],{cwd:root,stdio:"inherit"});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,"test-performance.cjs")],{cwd:root,stdio:"inherit"});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,"test-gpu-residency.cjs")],{cwd:root,stdio:"inherit"});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,"test-drone-boss.cjs")],{cwd:root,stdio:"inherit"});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,"test-crimson-mech.cjs")],{cwd:root,stdio:"inherit"});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,"test-ufo-boss.cjs")],{cwd:root,stdio:"inherit"});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,'test-settlement.cjs')],{cwd:root,stdio:'inherit'});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,'test-drinks.cjs')],{cwd:root,stdio:'inherit'});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,'test-greed-room.cjs')],{cwd:root,stdio:'inherit'});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,'test-shock-tile.cjs')],{cwd:root,stdio:'inherit'});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,'test-cover-tile.cjs')],{cwd:root,stdio:'inherit'});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,'test-timed-floors.cjs')],{cwd:root,stdio:'inherit'});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,'test-economic-drinks.cjs')],{cwd:root,stdio:'inherit'});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,'test-terrain-shop.cjs')],{cwd:root,stdio:'inherit'});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,"test-room-pressure.cjs")],{cwd:root,stdio:"inherit"});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,'test-ranged-movement.cjs')],{cwd:root,stdio:'inherit'});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,"test-fish-school.cjs")],{cwd:root,stdio:"inherit"});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,"test-weapon-evolution.cjs")],{cwd:root,stdio:"inherit"});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,"test-weapon-vfx.cjs")],{cwd:root,stdio:"inherit"});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,'test-shop-stock.cjs')],{cwd:root,stdio:'inherit'});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,'test-player-death.cjs')],{cwd:root,stdio:'inherit'});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,"test-shovel-attacks.cjs")],{cwd:root,stdio:"inherit"});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,"test-starter-enemies.cjs")],{cwd:root,stdio:"inherit"});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,"test-category-boxes.cjs")],{cwd:root,stdio:"inherit"});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,"test-hex-city.cjs")],{cwd:root,stdio:"inherit"});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,"test-added-enemies.cjs")],{cwd:root,stdio:"inherit"});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,'test-mounted-rider.cjs')],{cwd:root,stdio:'inherit'});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,"test-juicy-pistol.cjs")],{cwd:root,stdio:"inherit"});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,"test-death-feedback.cjs")],{cwd:root,stdio:"inherit"});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,'test-game-feedback.cjs')],{cwd:root,stdio:'inherit'});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,'test-tower-range.cjs')],{cwd:root,stdio:'inherit'});if(r.status!==0)process.exit(r.status||1)}

{const r=spawnSync(process.execPath,[path.join(__dirname,'test-cash-crystals.cjs')],{cwd:root,stdio:'inherit'});if(r.status!==0)process.exit(r.status||1)}

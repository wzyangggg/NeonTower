'use strict';

const fs = require('node:fs');
const { parseArgs } = require('node:util');
const { values } = parseArgs({ options: {
 url: { type: 'string', default: 'http://127.0.0.1:4173/' },
 floors: { type: 'string', default: '5' },
 seeds: { type: 'string', default: '1,2,3' },
 difficulty: { type: 'string', default: '1' },
 policy: { type: 'string', default: 'output' },
 profile: { type: 'string' },
 curve: { type: 'string' },
 out: { type: 'string' },
} });
const floors = Number(values.floors);
const difficulty = Number(values.difficulty);
const seeds = values.seeds.split(',').map(Number);
const policy = values.policy;
if (!Number.isInteger(floors) || floors < 1 || ![1, 2, 3, 4, 5].includes(difficulty)
 || seeds.some(seed => !Number.isInteger(seed) || seed < 1 || seed > 0xffffffff)
 || !['equip', 'save', 'output'].includes(policy)) throw Error('Invalid floors, difficulty, seeds or policy');
const profile = values.profile ? JSON.parse(fs.readFileSync(values.profile, 'utf8')) : {};
const curve = values.curve ? JSON.parse(fs.readFileSync(values.curve === '-' ? 0 : values.curve, 'utf8')) : null;
const validFactor = value => Number.isFinite(value) && value > 0;
const floorCurves = curve?.floorMultipliers?.[difficulty - 1];
const starHp = curve?.stars?.[difficulty - 1];
const shopTuning = {upgrade: 1, price: 1, power: 1, ...curve?.shopTuning};
if (Object.values(shopTuning).some(value => !Number.isFinite(value) || value < .1 || value > 5)) {
 throw Error('Shop tuning multipliers must be between 0.1 and 5.');
}
if (curve && (!validFactor(starHp) || !Array.isArray(floorCurves) || !floorCurves.length ||
 floorCurves.some((row, index) => row?.floor !== index + 1 || !validFactor(row.hp)))) {
 throw Error('Export a valid difficulty curve JSON from the editor.');
}
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

async function prepare(page) {
 const placed = await page.evaluate(() => {
  const stock = ElectricEditor.stock.sort((a, b) =>
   Number(b.upgrade) - Number(a.upgrade) || Number(ElectricTiles.isDefenseTower(b.kind)) - Number(ElectricTiles.isDefenseTower(a.kind)));
  for (const item of stock) {
   const cells = ElectricEditor.isFloor(item.kind) ? ElectricEditor.frontier(item.kind)
    : item.kind === 'erase' ? ElectricEditor.demolitionCells() : tiles.filter(cell => ElectricEditor.canPlace(item.kind, cell));
   const cell = [...cells].sort((a, b) => Math.hypot(a.x, a.y) - Math.hypot(b.x, b.y))[0];
   if ((item.upgrade || cell) && ElectricEditor.placeDraft(item.id, cell)) {
    sim.build = item.kind;
    return item;
   }
  }
  if (stock.length) throw Error('No supported placement on B' + floor);
  return null;
 });
 if (placed?.upgrade) {
  await page.waitForFunction(() => {
   ElectricEditor.draw();
   return !document.querySelector('#electric-panel [data-run]').disabled;
  });
 }
 await page.evaluate(() => {
  ElectricEditor.run();
  if (ElectricEditor.preparing) throw Error('Draft did not finish on B' + floor);
 });
}
async function simulate(browser, seed) {
 const started = performance.now();
 const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
 const errors = [];
 page.on('pageerror', error => errors.push(error.message));
 try {
  await page.addInitScript(entries => {
   for (const [key, value] of Object.entries(entries)) localStorage.setItem(key, value);
  }, profile);
  const url = new URL(values.url);
  url.searchParams.set('mapseed', 'growth-' + seed);
  await page.goto(url.href);
  await page.waitForFunction(() => HexMap.ready && globalThis.AirBossLab);
  await page.evaluate(({ seed, difficulty, starHp, floorCurves, shopTuning }) => {
   // Stop the regular loop. Each batch below drives the same step function.
   const animationFrame = window.requestAnimationFrame.bind(window);
   window.requestAnimationFrame = callback => callback === loop ? 0 : animationFrame(callback);
   let rng = seed;
   Math.random = () => ((rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0) / 4294967296);
   let shopRng = (seed ^ 0x85ebca6b) >>> 0;
   const shopRandom = () => ((shopRng = (Math.imul(shopRng, 1664525) + 1013904223) >>> 0) / 4294967296);
   sound = false;
   globalThis.sim = { rows: [], loadouts: {}, totalEarned: 0, seconds: 0, damage: {}, peak: 0, capped: 0, build: null, fighting: false, shopRandom };
   const creditCash = gainCash;
   gainCash = (...args) => {
    const before = cash;
    const amount = creditCash(...args);
    sim.totalEarned += Math.max(0, cash - before);
    return amount;
   };
   if (floorCurves) {
    const floorHp = openingCampaignHpFactor;
    openingCampaignHpFactor = () => floorCurves[floor - 1]?.hp ?? floorHp();
    const difficultyValue = difficultyFactor;
    difficultyFactor = key => key === 'hp' ? starHp : difficultyValue(key);
   }
   for (let i = 0; i < SHOP_UPGRADE_COSTS.length; i++) {
    SHOP_UPGRADE_COSTS[i] = Math.max(1, Math.round(SHOP_UPGRADE_COSTS[i] * shopTuning.upgrade));
   }
   const getPrice = shopPrice;
   shopPrice = item => EQUIPMENT_LABELS[item.key] ? Math.max(1, Math.round(getPrice(item) * shopTuning.price)) : getPrice(item);
   const stock = rollShop;
   const adjusted = new WeakSet();
   rollShop = () => {
    stock();
    if (shopTuning.power === 1) return;
    for (const offer of shopItems) {
     if (!EQUIPMENT_LABELS[offer.key] || adjusted.has(offer)) continue;
     adjusted.add(offer);
     const item = itemEquipment(offer);
     for (const field of ['damage', 'meleeDamage', 'auraDamage', 'ufoLaserDamage', 'vinylDamage',
      'spiderTurretDamage', 'planeDamage', 'attackSpeedBonus', 'critChanceBonus', 'critDamageBonus']) {
      if (Number.isFinite(item[field])) item[field] *= shopTuning.power;
     }
    }
   };
   const resolve = resolveShotDamage;
   resolveShotDamage = (shot, damage, target) => {
    const hit = resolve(shot, damage, target);
    if (sim.fighting && !hit.shielded && target?.hp > 0) {
     const source = shot.towerShot || shot.terrainShot ? 'tower' : shot.source || 'other';
     sim.damage[source] = (sim.damage[source] || 0) + Math.min(target.hp, Math.max(0, hit.damage));
    }
    return hit;
   };
   activeDifficulty = difficulty;
   reset();
   sim.entry = { attributes: TalentRuntime.summary().levels, chips: Chips.view().filter(Boolean).length,
    towerResearch: TalentRuntime.store.view().towerPaths ?? {}, weapon: weapon.itemId };
  }, { seed, difficulty, starHp, floorCurves, shopTuning });

  let status;
  for (let batch = 0; batch < 2000; batch++) {
   status = await page.evaluate(({ floors, policy }) => {
    const dt = 1 / 60;
    const round = n => Math.round(n * 100) / 100;
    const equipment = value => value ? { id: value.itemId || value.modelId || value.id, tier: value.tier } : null;
    function outputValue(item, key) {
     if (!item) return 0;
     if (key === 'weapon') return weaponEnergyDps(item);
     const damage = Math.max(0, item.damage || 0);
     if (key === 'drone') {
      const interval = item.interval || 1;
      return damage * (item.pellets || item.burstCount || 1) / interval +
       (item.auraDamage || 0) / (item.auraInterval || 1);
     }
     if (key === 'bomb') return damage / (item.cooldown || item.interval || 12);
     if (key === 'armor') return weaponEnergyDps(weapon) * ((item.critChanceBonus || 0) + (item.attackSpeedBonus || 0)) +
       (item.auraDamage || 0) / (item.auraInterval || 1);
     return weaponEnergyDps(weapon) * ((item.critChanceBonus || 0) + (item.attackSpeedBonus || 0)) +
      (item.ufoLaserDamage || 0) / (item.ufoLaserInterval || 1) +
      (item.vinylDamage || 0) / (item.vinylInterval || 1) +
      (item.spiderTurretDamage || 0) * (item.spiderTurretBurst || 0) / (item.spiderTurretCycle || 1);
    }
    function defenseValue(item, key) {
     if (!item || !['armor', 'shoes'].includes(key)) return 0;
     return (item.maxHp || 0) + .5 * (item.shieldBonus || 0) + 2 * (item.invBonus || 0) +
      4 * ((item.speedBonus || 0) - (item.speedPenalty || 0));
    }
    function buyPreferred(row) {
     const current = { weapon, drone, armor, shoes, bomb: bombEquipment };
     const outputFirst = sim.shopRandom() < .8;
     const primary = outputFirst ? outputValue : defenseValue;
     const secondary = outputFirst ? defenseValue : outputValue;
     const choices = shopItems.flatMap((offer, index) => {
      if (!Object.hasOwn(current, offer.key) || offer.sold || offer.price > cash || !shopUsable(offer)) return [];
      const item = itemEquipment(offer);
      const delta = score => score(item, offer.key) - score(current[offer.key], offer.key);
      return [{offer, index, item, gain: delta(primary), fallback: delta(secondary)}];
     });
     const choice = choices.sort((a, b) => b.gain - a.gain || b.fallback - a.fallback || a.offer.price - b.offer.price)
      .find(item => item.gain > 0 || (item.gain === 0 && item.fallback > 0));
     if (!choice || !buyShopItem(choice.index)) return;
     if (!confirmEquipmentPurchase()) throw Error('Equipment confirmation failed');
     row?.shop.push({action: 'buy', preference: outputFirst ? 'output' : 'defense',
      slot: choice.offer.key, item: equipment(choice.item), price: choice.offer.price, cash: round(cash)});
    }
   function steer() {
    const speed = movementSpeed();
    const projectiles = bullets.filter(b => b.life > 0 && Math.hypot(b.x - p.x, b.y - p.y) < 180);
    const contacts = enemies.filter(e => e.hp > 0 && isMeleeEnemy(e));
    let best = -Infinity;
    joy.x = joy.y = 0;
    for (let i = 0; i < 16; i++) {
     const angle = i * Math.PI / 8;
     const x = Math.cos(angle), y = Math.sin(angle);
     let score = 0;
     for (const ahead of [.12, .25]) {
      const px = p.x + x * speed * ahead, py = p.y + y * speed * ahead;
      if (!canWalkAt(px, py)) { score -= 100; continue; }
      score -= .006 * Math.hypot(px - 325, py - 300);
      for (const e of contacts) score -= 12 / Math.max(5, Math.hypot(px - e.x, py - e.y) - (e.r || 0));
      for (const b of projectiles) {
       const gap = Math.hypot(px - b.x - b.vx * ahead, py - b.y - b.vy * ahead);
       score -= Math.max(0, 26 - gap) * .5;
      }
     }
     if (score > best) { best = score; joy.x = x; joy.y = y; }
    }
   }
    for (let tick = 0; tick < 360; tick++) {
     if (ElectricEditor.preparing) return 'prepare';
     if (state === 'won') return 'won';
     if (state === 'dead' || (state === 'stageClear' && stageSettlement?.ready)) {
      if (sim.rows.at(-1)?.floor !== floor) {
       const stats = stageResultStats();
       sim.rows.push({
        floor, outcome: state === 'dead' ? 'dead' : stageSettlement.perfect ? 'full-clear' : 'survived',
        combatSeconds: round(sim.seconds), defeated: stats.defeated, roster: stats.total,
        peakThreat: round(sim.peak), nearThreatLimitSeconds: round(sim.capped),
        shotDps: round(Object.values(sim.damage).reduce((a, b) => a + b, 0) / (sim.seconds || 1)),
        shotDpsBySource: Object.fromEntries(Object.entries(sim.damage).map(([k, v]) => [k, round(v / (sim.seconds || 1))])),
        hp: p.hp, maxHp: p.max, shield: p.shield, earned: round(stats.earned),
        cumulativeEarned: round(sim.totalEarned), cash: round(cash), shopLevel,
        loadout: { weapon: equipment(weapon), drone: equipment(drone), armor: equipment(armor), shoes: equipment(shoes) },
        build: sim.build, shop: [],
       });
      }
      if (state === 'dead') return 'dead';
      if (stageSettlement.finalCampaign) { continueStageResult(); return 'won'; }
      continueStageResult();
     }
     if (state === 'upgrade') {
      const row = sim.rows.at(-1);
      if (pendingEquipment) {
       const item = pendingEquipment.item;
       const candidate = itemEquipment(item);
       const current = { weapon, drone, armor, shoes, bomb: bombEquipment }[item.key];
       if ((policy === 'equip' && (!current || candidate.tier > current.tier)) ||
           (policy === 'output' && (outputValue(candidate, item.key) > outputValue(current, item.key) ||
            (outputValue(candidate, item.key) === outputValue(current, item.key) &&
             defenseValue(candidate, item.key) > defenseValue(current, item.key))))) {
        confirmEquipmentPurchase();
        row?.shop.push({ action: 'equip-drop', slot: item.key, item: equipment(candidate) });
       } else cancelEquipmentPurchase();
      } else if (terrainView === 'drinkChoice') {
       const id = drinkTruck.offers[0]?.drinkId;
       if (!chooseTruckDrink(0)) return 'blocked-drink';
       row?.shop.push({ action: 'free-drink', id });
      } else {
       if (terrainView === 'equipment' && policy === 'equip') {
        const current = { weapon, drone, armor, shoes, bomb: bombEquipment };
        for (const [index, item] of shopItems.entries()) {
         if (!EQUIPMENT_LABELS[item.key] || !Object.hasOwn(current, item.key) || item.sold) continue;
         const candidate = itemEquipment(item);
         if (current[item.key] && candidate.tier <= current[item.key].tier) continue;
         if (!buyShopItem(index)) continue;
         if (!confirmEquipmentPurchase()) throw Error('Equipment confirmation failed');
         current[item.key] = candidate;
         row?.shop.push({ action: 'buy', slot: item.key, item: equipment(candidate), price: item.price, cash: round(cash) });
        }
        if (floor < floors) {
         const price = shopUpgradeCost();
         if (upgradeShop()) row?.shop.push({ action: 'upgrade-shop', level: shopLevel, price, cash: round(cash) });
        }
       }
       if (terrainView === 'equipment' && policy === 'output' && floor < floors) {
        const price = shopUpgradeCost();
        if (floor >= 5 && upgradeShop()) row?.shop.push({action: 'upgrade-shop', level: shopLevel, price, cash: round(cash)});
        buyPreferred(row);
       }
       if (terrainView === 'equipment' && row) {
        row.cashAfterShop = round(cash);
        row.shopLevelAfter = shopLevel;
        if (floor >= floors) return 'floor-limit';
        Object.assign(sim, { seconds: 0, damage: {}, peak: 0, capped: 0, build: null });
       }
       leaveShop();
      }
      continue;
     }
     sim.fighting = ['combat', 'survival'].includes(state) && !timedRoom?.introLeft && !sawRoom?.introLeft && !RoomReady.active;
     if (sim.fighting) {
      sim.loadouts[floor] ??= structuredClone({weapon, drone, armor, shoes, bomb: bombEquipment,
       featherStacks: p.featherStacks || 0});
      sim.seconds += dt;
      const threat = normalThreat();
      sim.peak = Math.max(sim.peak, threat);
      if (threat >= .9 * normalThreatLimit()) sim.capped += dt;
      if (Math.round(sim.seconds / dt) % 6 === 1) steer();
     }
     step(dt);
     sim.fighting = false;
    }
    return 'running';
   }, { floors, policy });
   if (status === 'prepare') await prepare(page);
   else if (status !== 'running') break;
  }
  if (errors.length) throw Error(errors.join('\n'));
  if (!['dead', 'won', 'floor-limit'].includes(status)) throw Error('Simulation stopped in ' + status);
  const {rows, entry} = await page.evaluate(() => {
   const dt = 1 / 60, warmup = 3, seconds = 30, distance = 110;
   const displayedHp = 1000000;
   // Hold equipment evolution at its floor-entry state and remove enemy spawns.
   updateModelGrowth = () => {};
   for (const row of sim.rows) {
    const loadout = sim.loadouts[row.floor];
    if (!loadout) continue;
    let rng = 842701;
    Math.random = () => ((rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0) / 4294967296);
    reset();
    RoomReady.cancel();
    ElectricEditor.reset();
    ElectricTiles.reset();
    for (const key of ['weapon', 'drone', 'armor', 'shoes', 'bomb']) {
     if (loadout[key]) equipItem(key, loadout[key]);
    }
    state = 'combat';
    floor = row.floor;
    p.x = 325;
    p.y = 300;
    p.featherStacks = loadout.featherStacks;
    spawnQueue = [];
    chaserSpawned = Infinity;
    const x = p.x, y = p.y - distance;
    let damageTaken = 0;
    const target = {type: 'eye', x, y, homeX: x, homeY: y, max: displayedHp, r: 14, t: 0,
     fire: Infinity, warn: false, seed: 0, terrainStun: Infinity, weaponLabTarget: true};
    // Keep normal HP reads finite for the engine. Damage writes count toward DPS without lowering HP.
    Object.defineProperty(target, 'hp', {
     get: () => displayedHp,
     set: value => { if (value < displayedHp) damageTaken += displayedHp - value; }
    });
    enemies = [target];
    let measuredFrom = 0;
    for (let tick = 0; tick < (warmup + seconds) * 60; tick++) {
     if (tick === warmup * 60) measuredFrom = damageTaken;
     p.x = 325;
     p.y = 300;
     target.x = x;
     target.y = y;
     step(dt);
     if (state !== 'combat' || enemies.length !== 1 || enemies[0] !== target) {
      throw Error('Single-target bench left its fixed scenario on B' + row.floor);
     }
    }
    row.singleTargetDps = Math.round((damageTaken - measuredFrom) / seconds * 100) / 100;
   }
   return {rows: sim.rows, entry: sim.entry};
  });
  return { seed, status, entry, wallSeconds: Math.round((performance.now() - started) / 10) / 100, rows };
 } finally {
  await page.close();
 }
}

(async () => {
 const browser = await chromium.launch({ channel: 'msedge', headless: true });
 try {
  const runs = [];
  for (const seed of seeds) runs.push(await simulate(browser, seed));
  const median = data => {
   const sorted = [...data].sort((a, b) => a - b);
   const center = Math.floor(sorted.length / 2);
   return sorted.length % 2 ? sorted[center] : (sorted[center - 1] + sorted[center]) / 2;
  };
  const summary = Array.from({length: Math.max(...runs.map(run => run.rows.length))}, (_, i) => {
   const samples = runs.flatMap(({rows}) => {
    const row = rows[i], baseline = rows[0]?.singleTargetDps;
    return row?.singleTargetDps != null && baseline > 0 ? [{...row, multiplier: row.singleTargetDps / baseline}] : [];
   });
   const entered = runs.flatMap(run => run.rows[i] ? [run.rows[i]] : []);
   const levels = Object.fromEntries(Array.from({length: 5}, (_, j) =>
    [j + 1, entered.filter(row => row.shopLevel === j + 1).length]));
   const values = samples.map(row => row.multiplier);
   return {floor: i + 1, samples: samples.length, measuredDps: samples.length ? median(samples.map(row => row.singleTargetDps)) : null,
    measuredMultiplier: samples.length ? median(values) : null,
    minMultiplier: samples.length ? Math.min(...values) : null, maxMultiplier: samples.length ? Math.max(...values) : null,
    hpMultiplier: floorCurves?.[i] && starHp * floorCurves[i].hp,
    deaths: entered.filter(row => row.outcome === 'dead').length, shopLevels: levels,
    upgrades: entered.flatMap(row => row.shop.filter(action => action.action === 'upgrade-shop')).length,
    cashMedian: median(entered.map(row => row.cash)),
    cumulativeEarnedMedian: median(entered.map(row => row.cumulativeEarned))};
  });
  const result = JSON.stringify({type: 'hell-elevator-dps-simulation', metric: 'single-target', target: 'infinite-hp',
   difficulty, policy, floors, shopTuning, summary, runs}, null, 2);
  if (values.out) fs.writeFileSync(values.out, result + '\n');
  else console.log(result);
 } finally {
  await browser.close();
 }
})().catch(error => { console.error(error); process.exitCode = 1; });


'use strict';

const fs = require('node:fs');
const [inputPath, outputPath] = process.argv.slice(2);
if (!inputPath || !outputPath) throw Error('Usage: node tools/validate-growth-model.cjs <batch.json> <report.html>');
const report = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
if (report.metric !== 'single-target' || !Array.isArray(report.runs)) throw Error('Expected a single-target batch report');

const samples = [];
const moneyChecks = [];
for (const run of report.runs) {
 const baseline = run.rows[0]?.singleTargetDps;
 let spent = 0, bombEquipped = false;
 for (let index = 0; index < run.rows.length; index++) {
  const row = run.rows[index];
  const previous = run.rows[index - 1];
  if (Number.isFinite(row.cash) && Number.isFinite(row.earned) && (!previous || Number.isFinite(previous.cashAfterShop))) {
   moneyChecks.push(Math.abs(row.cash - (previous?.cashAfterShop ?? 0) - row.earned));
  }
  if (baseline > 0 && row.singleTargetDps > 0) {
   samples.push({seed: run.seed, floor: row.floor, dps: row.singleTargetDps / baseline, spent, earned: row.earned,
    hp: (report.summary?.[index]?.hpMultiplier ?? 1) / (report.summary?.[0]?.hpMultiplier || 1),
    slots: Number(bombEquipped) + ['weapon', 'drone', 'armor', 'shoes'].filter(slot =>
     row.loadout?.[slot] && (slot !== 'weapon' || row.loadout.weapon.id !== 'pistol_t1')).length,
    shop: row.shopLevel || 1});
  }
  for (const action of row.shop || []) {
   if (action.action === 'buy') spent += action.price;
   if (action.slot === 'bomb' && ['buy', 'equip-drop'].includes(action.action)) bombEquipped = true;
  }
 }
}
const train = samples.filter(row => row.seed % 3 !== 0);
const test = samples.filter(row => row.seed % 3 === 0);
if (!train.length || !test.length) throw Error('Need both fit and held-out seeds');

// The DPS feature sets are zero at B01, anchoring those models at 1×.
function fit(rows, features, target = row => row.dps) {
 const size = features(rows[0]).length;
 const system = Array.from({length:size}, (_, i) => Array.from({length:size + 1}, (_, j) => i === j ? 1e-6 : 0));
 for (const row of rows) {
  const values = features(row);
  const response = Math.log(target(row));
  for (let i = 0; i < size; i++) {
   for (let j = 0; j < size; j++) system[i][j] += values[i] * values[j];
   system[i][size] += values[i] * response;
  }
 }
 for (let i = 0; i < size; i++) {
  const diagonal = system[i][i];
  for (let j = i; j <= size; j++) system[i][j] /= diagonal;
  for (let k = 0; k < size; k++) {
   if (k === i) continue;
   const ratio = system[k][i];
   for (let j = i; j <= size; j++) system[k][j] -= ratio * system[i][j];
  }
 }
 const coefficients = system.map(row => row[size]);
 return {coefficients, predict: row => Math.exp(features(row).reduce((sum, value, i) => sum + value * coefficients[i], 0))};
}
const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;
const median = values => {
 const ordered = [...values].sort((a,b) => a - b);
 const middle = Math.floor(ordered.length / 2);
 return ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2;
};
const score = (rows, predict) => ({
 mae: mean(rows.map(row => Math.abs(predict(row) - row.dps))),
 mape: mean(rows.map(row => Math.abs(predict(row) / row.dps - 1))) * 100
});
const definitions = [
 {name:'楼层模型', features: row => [Math.log(row.floor)], terms:['ln(楼层)']},
 {name:'支出模型', features: row => [Math.log1p(row.spent / 18)], terms:['ln(1 + 装备支出 / 18)']},
 {name:'装备与商店模型', features: row => [Math.log1p(row.spent / 18), row.slots, row.shop - 1],
  terms:['ln(1 + 装备支出 / 18)', '非初始装备槽数', '(商店等级 − 1)']}
];
const models = definitions.map(definition => {
 const model = fit(train, definition.features);
 return {...definition, ...model, ...score(test, model.predict)};
});
const primary = models.at(-1);
const incomeFeatures = row => [1, Math.log(row.floor), Math.log(row.dps / row.hp), Number(row.floor % 5 === 0)];
const income = fit(train, incomeFeatures, row => 1 + row.earned);
const floorIncome = fit(train, row => [1, Math.log(row.floor), Number(row.floor % 5 === 0)], row => 1 + row.earned);
const predictedIncome = row => Math.max(0, income.predict({...row, dps:primary.predict(row)}) - 1);
const incomeMae = mean(test.map(row => Math.abs(predictedIncome(row) - row.earned)));
const floorIncomeMae = mean(test.map(row => Math.abs(Math.max(0, floorIncome.predict(row) - 1) - row.earned)));
const lateTest = test.filter(row => row.floor > 10);
const earlyTrain = train.filter(row => row.floor <= 10);
const extrapolated = lateTest.length ? score(lateTest, fit(earlyTrain, primary.features).predict) : null;
const floors = Array.from({length:20}, (_, i) => {
 const floor = i + 1;
 const rows = test.filter(row => row.floor === floor);
 const all = samples.filter(row => row.floor === floor);
 return {floor, samples: all.length, heldOut: rows.length,
  actual: rows.length ? median(rows.map(row => row.dps)) : null,
  predicted: rows.length ? median(rows.map(primary.predict)) : null,
  earned: rows.length ? median(rows.map(row => row.earned)) : null,
  predictedIncome: rows.length ? median(rows.map(predictedIncome)) : null};
});
const f = value => value == null ? '—' : value.toFixed(2);
const floorLabel = floor => 'B' + String(floor).padStart(2, '0');
const modelRows = models.map(model => {
 const equation = model.coefficients.map((coefficient, i) => (coefficient < 0 ? '−' : i ? '+' : '') +
  Math.abs(coefficient).toFixed(3) + ' × ' + model.terms[i]).join(' ');
 return `<tr><th>${model.name}</th><td>${equation}</td><td>${f(model.mae)}×</td><td>${f(model.mape)}%</td></tr>`;
}).join('');
const floorRows = floors.map(row => `<tr><th>${floorLabel(row.floor)}</th><td>${row.samples}</td><td>${row.heldOut}</td><td>${f(row.predicted)}</td><td>${f(row.actual)}</td><td>${f(row.predictedIncome)}</td><td>${f(row.earned)}</td></tr>`).join('');
const max = Math.max(1, ...floors.flatMap(row => [row.actual ?? 0, row.predicted ?? 0]));
const x = floor => 48 + (floor - 1) * 34;
const y = value => 240 - value / max * 215;
const grid = Array.from({length:5}, (_, i) => {
 const value = max * i / 4;
 return `<line x1="48" x2="694" y1="${y(value)}" y2="${y(value)}"/><text x="40" y="${y(value) + 4}" text-anchor="end">${f(value)}</text>`;
}).join('');
const chart = ['predicted', 'actual'].map((key,i) => {
 const color = ['#7ae1c2','#8fb9ff'][i];
 const points = floors.filter(row => row[key] != null);
 return `<polyline fill="none" stroke="${color}" stroke-width="2.5" points="${points.map(row => x(row.floor)+','+y(row[key])).join(' ')}"/>` +
  points.map(row => `<circle cx="${x(row.floor)}" cy="${y(row[key])}" r="3" fill="${color}"><title>${floorLabel(row.floor)} · ${f(row[key])}×</title></circle>`).join('');
}).join('');
const labels = [1,5,10,15,20].map(floor => `<text x="${x(floor)}" y="263" text-anchor="middle">${floorLabel(floor)}</text>`).join('');
const html = `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>一星 B01–B20 成长模型验证</title>
<style>html{color-scheme:dark;background:#111622;color:#ebf2ff;font:16px system-ui}main{max-width:920px;margin:auto;padding:22px}p{color:#bbc9dd}svg{width:100%;background:#192236;border-radius:10px}svg text{fill:#bccbe0;font-size:12px}svg line{stroke:#3a4c65}table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}th,td{border-bottom:1px solid #3a4c65;padding:8px;text-align:left}.scroll{overflow:auto}</style>
<main><h1>一星 B01–B20 成长模型验证</h1>
<p>${report.runs.length} 局空档。拟合 ${new Set(train.map(row=>row.seed)).size} 局、${train.length} 条记录。留出 ${new Set(test.map(row=>row.seed)).size} 局、${test.length} 条记录。</p>
<h2>装备与商店模型</h2><p>绿色为预测，蓝色为实测。每层对留出种子取中位数。B01 木桩 DPS 为 1×。</p>
<svg viewBox="0 0 720 272" role="img" aria-label="B01 到 B20 木桩 DPS 预测与实测">${grid}${labels}${chart}</svg>
<h2>留出种子误差</h2>
<div class="scroll"><table><thead><tr><th>模型</th><th>ln(DPS 倍率)</th><th>平均绝对误差</th><th>平均相对误差</th></tr></thead><tbody>${modelRows}</tbody></table></div>
<p>${extrapolated ? '只用拟合种子的 B01–B10 校准，再预测留出种子的 B11–B20，平均相对误差 ' + f(extrapolated.mape) + '%。' : '留出种子在 B11 以后没有可用样本。'}</p>
<h2>金币模型</h2><p>进店金币 = 上层进店消费后余额 + 本层实际获得金币。核对 ${moneyChecks.length} 条，最大差额 ${f(Math.max(0,...moneyChecks))} 金币。这个检查使用实测收入。</p>
<p>另用楼层、首领标记和 DPS ÷ 血量成长拟合 ln(1 + 本层收入)。将装备模型预测的 DPS 代入后，留出种子的每层收入平均绝对误差为 ${f(incomeMae)} 金币。仅用楼层和首领标记的误差为 ${f(floorIncomeMae)} 金币。</p>
<h2>逐层数据</h2><div class="scroll"><table><thead><tr><th>楼层</th><th>总样本</th><th>留出样本</th><th>预测倍率</th><th>实测倍率</th><th>预测金币</th><th>实得金币</th></tr></thead><tbody>${floorRows}</tbody></table></div>
<p>模型使用进战前已发生的购买和装备状态。阵亡后的楼层没有样本。命中和走位由战役决定，输出用固定木桩测量。</p></main></html>`;
fs.writeFileSync(outputPath, html);
console.log(JSON.stringify({train:train.length, test:test.length, models:models.map(({name,coefficients,mae,mape}) =>
 ({name,coefficients,mae,mape})), extrapolated, money:{count:moneyChecks.length,maxError:Math.max(0,...moneyChecks),
 incomeMae, floorIncomeMae, incomeCoefficients:income.coefficients}, floors}, null, 2));

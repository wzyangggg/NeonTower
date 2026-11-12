'use strict';
// Legacy ranks are retained for save refunds and for the existing battle effects.
globalThis.TowerResearch=(()=>{
 const catalog={
  shotgun_tower:{name:"霰弹枪塔",nodes:[
   {"id":"close","name":"近身暴击","direction":"↖","parent":null,"max":3,"tier":"basic","description":"距塔 110 单位内命中的原始弹丸伤害 +8% / +16% / +24%。"},
   {"id":"choke","name":"集中收束","direction":"↑","parent":"close","max":3,"tier":"advanced","description":"五弹的散布角缩小 8% / 16% / 24%。"},
   {"id":"breach","name":"破门齐射","direction":"←","parent":"choke","max":1,"tier":"key","description":"一轮有至少 3 颗原始弹丸命中同一敌人时，对该敌人追加一次伤害，等于该轮命中它的原始弹丸伤害总和的 20%。"},
   {"id":"wide","name":"宽幅喷口","direction":"→","parent":null,"max":3,"tier":"basic","description":"每轮追加 2 / 4 / 6 颗外侧弹，保留原五弹角度。外侧弹的单发伤害固定为标准单弹的 20%。"},
   {"id":"stagger","name":"火力压制","direction":"↗","parent":"wide","max":3,"tier":"advanced","description":"敌人被该轮任一弹丸首次命中时减速 10% / 15% / 20%，持续 0.8 秒。"},
   {"id":"gate","name":"拦门冲击","direction":"↘","parent":"stagger","max":1,"tier":"key","disabled":true,"description":"每轮首次命中第 3 个不同敌人时，以该目标为中心触发半径 60 的压制环，范围敌人减速 35%，持续 1 秒。"},
   {"id":"turn","name":"快速横摆","direction":"↓","parent":"wide","max":3,"tier":"basic","description":"让瞄准转速提高 50% / 100% / 150%。"},
   {"id":"reverse","name":"回身首发","direction":"↙","parent":"turn","max":1,"tier":"key","description":"在射击方向相对上次偏转至少 90° 时，让当轮原始弹丸伤害 +15%。每座塔独立记录上次开火方向，首次开火建立记录。"},
  ]},
  sniper_tower:{name:"狙击枪塔",nodes:[
   {"id":"distance","name":"远距校准","direction":"↑","parent":null,"max":3,"tier":"basic","description":"距塔至少 500 单位的首次命中伤害 +5% / +10% / +15%。"},
   {"id":"elite","name":"重型识别","direction":"↗","parent":"distance","max":3,"tier":"advanced","description":"从距塔至少 400 单位的射程内候选中优先锁定首领、再锁定精英。同一类别按最近选。命中这样锁定的目标时伤害 +5% / +10% / +15%。"},
   {"id":"execute","name":"处决弹头","direction":"↖","parent":"distance","max":1,"tier":"key","description":"首次命中前目标生命不高于 25%，且该次命中距塔至少 500 单位时，直接伤害再乘 1.25。"},
   {"id":"pierce","name":"贯穿弹芯","direction":"↙","parent":null,"max":3,"tier":"basic","description":"额外穿透 1 个敌人。第二目标承受其所在距离下普通狙击伤害的 35% / 50% / 65%。"},
   {"id":"recovery","name":"稳定复位","direction":"↓","parent":"pierce","max":3,"tier":"advanced","description":"开火后的转向锁定时间缩短 15% / 30% / 45%。"},
   {"id":"column","name":"纵列穿透","direction":"←","parent":"pierce","max":1,"tier":"key","description":"再增加第 3 个命中位，伤害为其所在距离下普通狙击伤害的 45%。"},
   {"id":"idle","name":"静候准星","direction":"→","parent":null,"max":3,"tier":"basic","description":"在连续 2 秒没有射程内目标后，使下一发弹速 +15% / +30% / +45%。"},
   {"id":"mark","name":"哨戒标记","direction":"↘","parent":"idle","max":1,"tier":"key","description":"让这发子弹首次命中时标记敌人 3 秒，角色下一次直接命中该敌人时伤害 +15% 并消耗标记。多座塔的标记刷新时长。"},
  ]},
  electric_tower:{name:"电塔",nodes:[
   {"id":"reach","name":"延伸电弧","direction":"↖","parent":null,"max":3,"tier":"basic","description":"后续跳距 +12 / +24 / +36。"},
   {"id":"capacity","name":"备用电容","direction":"↑","parent":null,"max":3,"tier":"advanced","description":"链长上限 +1。超出基础上限的末段伤害为标准单段的 35% / 50% / 65%。"},
   {"id":"fork","name":"末端分叉","direction":"↑","parent":"capacity","max":1,"tier":"key","description":"主链结束后，从末端再搜 1 名未命中敌人，搜索距离为当前跳距的 75%，造成标准单段伤害的 45%。"},
   {"id":"slow","name":"余电迟滞","direction":"→","parent":null,"max":3,"tier":"basic","description":"主链命中施加 8% / 12% / 16% 减速，持续 1.2 秒。"},
   {"id":"tail","name":"蓄压末端","direction":"↗","parent":"slow","max":3,"tier":"advanced","description":"主链至少命中 3 人时，末端目标的减速提高到 22% / 28% / 34%，持续 1.5 秒。"},
   {"id":"pulse","name":"接地脉冲","direction":"→","parent":"tail","max":1,"tier":"key","description":"满足蓄压条件时，主链末端再发半径 70 的脉冲，对周围本轮未命中的敌人施加相同减速，最多 3 名。"},
   {"id":"solo","name":"电荷回流","direction":"↓","parent":null,"max":3,"tier":"basic","description":"在主链只命中一人时使首段伤害 +10% / +20% / +30%。"},
   {"id":"conduct","name":"持续导通","direction":"↙","parent":"solo","max":1,"tier":"key","description":"让同一座塔连续两轮主链都只命中同一个敌人时，从第二轮起返还该轮 0.25 秒冷却。转火或命中多人重置记录。"},
  ]},
  missile_tower:{name:"导弹塔",nodes:[
   {"id":"range","name":"长航引信","direction":"←","parent":null,"max":3,"tier":"basic","description":"导弹实际飞行至少 300 单位时，爆炸半径在基础公式结果上 +8% / +16% / +24%。"},
   {"id":"shrapnel","name":"外围破片","direction":"↖","parent":"range","max":3,"tier":"advanced","description":"上述远程爆炸对外侧三分之一环带内敌人的伤害 +10% / +20% / +30%。"},
   {"id":"aftershock","name":"延时震爆","direction":"↙","parent":"range","max":1,"tier":"key","description":"上述远程爆炸 0.45 秒后在原落点释放第二波，半径为首次爆炸的 70%，伤害为该弹基础爆炸伤害的 35%。"},
   {"id":"center","name":"聚焦弹头","direction":"↗","parent":null,"max":3,"tier":"basic","description":"首次爆炸半径的内侧三分之一，伤害 +10% / +20% / +30%。"},
   {"id":"speed","name":"急速引导","direction":"↘","parent":null,"max":3,"tier":"advanced","description":"弹速 +10% / +20% / +30%。"},
   {"id":"zone","name":"落点封锁","direction":"↑","parent":"center","max":1,"tier":"key","description":"首次爆炸后在落点留下持续 1.5 秒的区域，半径为该爆炸的 50%，区内敌人减速 25%。"},
   {"id":"radar","name":"警戒雷达","direction":"↓","parent":null,"max":3,"tier":"basic","description":"让塔在瞄准距塔 120 单位内的敌人时转速提高 15% / 30% / 45%，范围预览同时画出警戒圈。"},
   {"id":"ready","name":"近迫预装","direction":"↙","parent":"radar","max":1,"tier":"key","description":"在警戒圈从无敌人变为有敌人时扣减当前冷却 0.6 秒，每座塔每 6 秒最多触发一次，实际开火仍需完成瞄准。"},
  ]},
  healing_tower:{name:"治疗塔",nodes:[
   {"id":"priority","name":"救护优先","direction":"↖","parent":null,"max":3,"tier":"basic","description":"角色在范围内且生命不高于 25% / 40% / 55% 时优先治疗，否则仍按距离排序。"},
   {"id":"amount","name":"急救加量","direction":"↖","parent":"priority","max":3,"tier":"advanced","description":"治疗生命不高于 55% 的角色时，额外回复 1 / 2 / 3 点。"},
   {"id":"care","name":"持续护理","direction":"←","parent":"priority","max":1,"tier":"key","description":"治疗后 2 秒仍存活且仍在该塔范围内，再回复 1 点生命。同一角色同时只保留一个待触发护理，新效果刷新计时。"},
   {"id":"wallRange","name":"远程检修","direction":"→","parent":null,"max":3,"tier":"basic","description":"仅掩体治疗距离 +40 / +80 / +120。"},
   {"id":"wallAmount","name":"补片加固","direction":"↗","parent":"wallRange","max":3,"tier":"advanced","description":"治疗掩体时额外修复 1 / 2 / 3 点耐久。"},
   {"id":"double","name":"双路修补","direction":"→","parent":"wallAmount","max":1,"tier":"key","description":"主目标为掩体时，同时修复范围内次近的受损掩体，回复主目标计算量的 50%，向下取整、至少 1 点，且不超过目标缺损。"},
   {"id":"enter","name":"接应信号","direction":"↓","parent":"priority","max":3,"tier":"basic","description":"在受损角色从圈外进入治疗范围时扣减塔当前冷却 0.3 / 0.6 / 0.9 秒，每座塔间隔至少 8 秒。"},
   {"id":"receive","name":"接应光束","direction":"↙","parent":"enter","max":1,"tier":"key","description":"让该塔下一次治疗优先选这个角色，机会保留 2 秒，角色离开范围或恢复满血时清除。"},
  ]},
  shield_tower:{name:"护盾生产格",nodes:[
   {"id":"rate","name":"装配提速","direction":"↖","parent":null,"max":3,"tier":"basic","description":"生产间隔缩短 5% / 10% / 15%。"},
   {"id":"shift","name":"换班库存","direction":"←","parent":"rate","max":3,"tier":"advanced","description":"当前场地第一次拾取该格护盾后，下一轮生产用时缩短 20% / 35% / 50%。每格每场地触发一次。"},
   {"id":"storage","name":"双格储存","direction":"↙","parent":"shift","max":1,"tier":"key","description":"库存上限 +1。第一份完成后可继续生产第二份，满库存时停产。"},
   {"id":"duration","name":"强化外壳","direction":"↗","parent":null,"max":3,"tier":"basic","description":"每次拾取的无敌时间延长 0.3 / 0.6 / 0.9 秒。"},
   {"id":"wave","name":"排斥波纹","direction":"→","parent":"duration","max":3,"tier":"advanced","description":"拾取时释放半径 70 / 90 / 110 的波纹，范围敌人减速 25%，持续 1 秒。"},
   {"id":"sprint","name":"开路护盾","direction":"↘","parent":"wave","max":1,"tier":"key","description":"拾取后前 1 秒内，角色移速 +20%。再次拾取刷新持续时间。"},
   {"id":"preload","name":"预充电","direction":"↓","parent":"rate","max":3,"tier":"basic","description":"缩短每座生产格每场地的首次正常生产 10% / 20% / 30%。"},
   {"id":"emergency","name":"应急接收","direction":"↓","parent":"preload","max":1,"tier":"key","description":"在角色生命不高于 25% 时将该格的护盾拾取半径提高 50%。走近即可拾取，仍按正常库存结算。"},
  ]},
  slow_field:{name:"减速领域",nodes:[
   {"id":"radius","name":"扩张力场","direction":"←","parent":null,"max":3,"tier":"basic","description":"半径 +8% / +16% / +24%，以该领域配置的基础半径为准。"},
   {"id":"friend","name":"友军校验","direction":"↙","parent":"radius","max":3,"tier":"advanced","description":"该领域施加给角色的减速量减少 40% / 70% / 100%。"},
   {"id":"linger","name":"离场滞留","direction":"↖","parent":"radius","max":1,"tier":"key","description":"敌人从仍在运作的领域主动离开后，保留离开前该领域减速量的 50%，持续 1.5 秒。"},
   {"id":"core","name":"重力核心","direction":"↑","parent":null,"max":3,"tier":"basic","description":"内半径为当前领域半径的 50%，核心区敌人减速额外 +5 / +10 / +15 个百分点。"},
   {"id":"charge","name":"引力积蓄","direction":"↗","parent":"core","max":3,"tier":"advanced","description":"普通敌人连续在该核心内停留 1.8 / 1.5 / 1.2 秒，受到一次 0.5 秒定身。每名敌人全局冷却 4 秒。"},
   {"id":"anchor","name":"锚定延续","direction":"→","parent":"charge","max":1,"tier":"key","description":"触发定身后，随后 1 秒该敌人的移速额外减 15 个百分点，减速总上限 70%。"},
   {"id":"support","name":"滞留测距","direction":"↘","parent":null,"max":3,"tier":"basic","description":"使攻击塔直接命中领域内的普通敌人时追加 3% / 6% / 9% 该次伤害。同一敌人每 2 秒最多触发一次，多领域取最高。"},
   {"id":"tag","name":"穿线标记","direction":"→","parent":"support","max":1,"tier":"key","description":"在普通敌人进入领域时施加标记，其下一次触发滞留测距的额外伤害再增加 6 个百分点并消耗标记。同一敌人两次挂标记至少间隔 6 秒，离开领域即清除。"},
  ]},
  repair_turret:{name:"修理炮塔",nodes:[
   {"id":"cut","name":"快速切割","direction":"↖","parent":null,"max":3,"tier":"basic","description":"主线拆除耗时缩短 8% / 16% / 24%。"},
   {"id":"arm","name":"副臂施工","direction":"↑","parent":"cut","max":3,"tier":"advanced","description":"主线开工时，若范围内还有可施工的不同目标，开启一条副线，施工速度为主线的 25% / 35% / 45%。"},
   {"id":"relay","name":"接力作业","direction":"↖","parent":"arm","max":1,"tier":"key","description":"主线完成且副线仍有效时，将副线提为主线，保留已完成比例，并用主线速度继续施工。"},
   {"id":"wall","name":"承重支架","direction":"→","parent":null,"max":3,"tier":"basic","description":"范围内掩体最大耐久额外 +1 / +2 / +3。"},
   {"id":"mend","name":"巡回修补","direction":"↗","parent":"wall","max":3,"tier":"advanced","description":"每 6 秒修复范围内耐久比例最低的一块受损掩体 1 / 2 / 3 点耐久，比例相同优先最近。"},
   {"id":"emergency","name":"应急支撑","direction":"↘","parent":"wall","max":1,"tier":"key","description":"受炮塔覆盖的掩体首次跌至最大耐久的 30% 或以下且仍存活时，立即修复 2 点。每块掩体每场地一次。"},
   {"id":"patrol","name":"优先巡检","direction":"↓","parent":null,"max":3,"tier":"basic","description":"让新开工的主线优先选择距角色 80 / 110 / 140 单位内且在炮塔作用区域内的危险源，同组按离角色最近选。"},
   {"id":"patch","name":"清障补片","direction":"↙","parent":"patrol","max":1,"tier":"key","description":"在完成这类主线任务后修复一块受损掩体 2 点，掩体须处于炮塔作用区域，优先选离已拆危险源最近的目标。"},
  ]},
 };
 const costs={basic:[20,30,40],advanced:[30,45,60],key:[75]};
 const routeCosts={4:[30,60,90,120],5:[20,40,60,80,100],6:[15,25,40,55,70,95]};
 const upgrade=(id,name,flow,effects,description,options)=>({id,name,flow,effects,description,...options});
 const rows={
  shotgun_tower:[
   [upgrade('turn','快速横摆','基础强化',{turn:1},'瞄准转速 +50%。')],
   [upgrade('choke','集中收束','集束流',{choke:2},'原五弹散布角缩小 16%。'),upgrade('wide','宽幅喷口','覆盖流',{wide:2},'向原五弹外侧增发 4 颗弹，每颗造成标准单弹伤害的 20%。')],
   [upgrade('close','近身增压','近战流',{close:1},'距塔 110 单位内，原始弹丸伤害 +8%。',{from:['choke']}),
    upgrade('reverse','回身首发','转向流',{reverse:1},'射击方向相比上次偏转至少 90° 时，原始弹丸伤害 +15%。',{from:['wide']})],
   [upgrade('breach','破门齐射','爆发流',{breach:1},'同轮至少 3 颗原始弹丸命中同一敌人，追加这些弹丸总伤害的 20%。',{from:['close']}),
    upgrade('stagger','火力压制','压制流',{stagger:2},'每轮首次命中目标时使其减速 15%，持续 0.8 秒。',{from:['reverse']})],
   [upgrade('cycle','连发机构','速射流',{cycle:.10},'开火间隔缩短 10%。',{from:['breach']}),
    upgrade('power','重型弹丸','重弹流',{power:.08},'所有弹丸伤害 +8%。',{from:['stagger']})],
  ],
  sniper_tower:[
   [upgrade('distance','远距校准','基础强化',{distance:1},'距塔至少 500 单位时，首个命中伤害 +5%。')],
   [upgrade('rapid','快速装填','速射流',{cycle:.15},'开火间隔缩短 15%。'),upgrade('pierce','贯穿弹芯','穿透流',{pierce:2},'多穿透 1 名敌人，第二名承受其所在距离下标准狙击伤害的 50%。')],
   [upgrade('recovery','快速复位','速射流 · 转向',{recovery:2},'开火后的转向锁定时间缩短 30%。',{from:['rapid'],choice:'rapid-tuning'}),
    upgrade('ballistic','加速弹道','速射流 · 弹速',{ballistic:.20},'弹速 +20%。',{from:['rapid'],choice:'rapid-tuning'}),
    upgrade('column','纵列穿透','穿透流 · 后继',{column:1},'再穿透 1 名敌人，第三名承受其所在距离下标准狙击伤害的 45%。',{from:['pierce']})],
   [upgrade('caliber','远距增压','共用强化',{distance:2},'远距校准的伤害加成由 +5% 提高到 +10%。')],
   [upgrade('mark','哨戒标记','协同流',{mark:1,markAny:1},'首个命中标记目标 3 秒，角色下一次直接命中时伤害 +15% 并消耗标记。'),upgrade('bounty','赏金弹头','打钱流',{bounty:2},'狙击弹击杀可获常规赏金的普通敌人时，基础赏金 +2。')],
  ],
  electric_tower:[
   [upgrade('reach','延伸电弧','基础强化',{reach:1},'后续跳距 +12。')],
   [upgrade('surge','首段增压','共用强化',{surge:.08},'主链首段伤害 +8%。')],
   [upgrade('capacity','备用电容','扩链流',{capacity:2},'主链上限 +1，额外一段造成标准单段伤害的 50%。'),upgrade('slow','余电迟滞','控场流',{slow:2},'主链命中施加 12% 减速，持续 1.2 秒。')],
   [upgrade('fork','末端分叉','扩链流 · 后继',{fork:1},null,{from:['capacity']}),upgrade('pulse','接地脉冲','控场流 · 后继',{pulse:1},'主链命中至少 3 名敌人时，从末端向半径 70 内至多 3 名未命中的敌人施加余电迟滞。',{from:['slow']})],
   [upgrade('solo','电荷回流','共用强化',{solo:2},'主链只命中 1 名敌人时，首段伤害额外增加 20 个百分点。')],
   [upgrade('cycle','快速蓄电','共用强化',{cycle:.10},'放电间隔缩短 10%。')],
  ],
  missile_tower:[
   [upgrade('speed','急速引导','基础强化',{speed:1},'弹速 +10%。')],
   [upgrade('radar','警戒雷达','共用强化',{radar:2},'瞄准距塔 120 单位内的敌人时转速 +30%。')],
   [upgrade('range','长航引信','共用强化',{range:2},'实际飞行至少 300 单位时，爆炸半径在距离公式结果上 +16%。')],
   [upgrade('cycle','快速装填','共用强化',{cycle:.10},'发射间隔缩短 10%。')],
   [upgrade('aftershock','延时震爆','爆破流',{aftershock:1},'飞行至少 300 单位后触发的爆炸会在 0.45 秒后追加一波，半径为首爆的 70%，伤害为基础爆炸伤害的 35%。'),upgrade('zone','落点封锁','封锁流',{zone:1})],
  ],
  healing_tower:[
   [upgrade('scan','广域扫描','基础强化',{scan:30},'角色和掩体的治疗距离均 +30。')],
   [upgrade('priority','救护优先','救护流',{priority:2},'范围内角色生命不高于 40% 时优先治疗角色。'),upgrade('wallRange','远程检修','工事流',{wallRange:2},'掩体治疗距离额外 +80。')],
   [upgrade('care','持续护理','救护流 · 后继',{care:1},null,{from:['priority']}),upgrade('double','双路修补','工事流 · 后继',{double:1},null,{from:['wallRange']})],
   [upgrade('cycle','快速诊疗','共用强化',{cycle:.10},'治疗间隔从 4 秒缩短至 3.6 秒。')],
   [upgrade('heal','高效补片','共用强化',{heal:1},'主目标额外回复 1 点生命或耐久。')],
  ],
  shield_tower:[
   [upgrade('rate','装配提速','基础强化',{rate:2},'生产间隔缩短 10%。')],
   [upgrade('preload','预充电','共用强化',{preload:2},'每场地的首次正常生产在装配提速的基础上再缩短 20%。')],
   [upgrade('storage','双格储存','备货流',{storage:1}),upgrade('duration','强化外壳','长盾流',{duration:2},'拾取的无敌时间延长 0.6 秒。')],
   [upgrade('stable','稳定供能','共用强化',{stable:.3},'拾取的无敌时间额外延长 0.3 秒，可与强化外壳叠加。')],
   [upgrade('wave','排斥波纹','控场流',{wave:2},'拾取时使周围半径 90 内的敌人减速 25%，持续 1 秒。'),upgrade('sprint','开路护盾','机动流',{sprint:1})],
  ],
  slow_field:[
   [upgrade('radius','扩张力场','基础强化',{radius:2},'领域半径 +16%。')],
   [upgrade('friend','友军校验','通行流',{friend:2},'该领域施加给角色的减速量减少 70%。'),upgrade('core','重力核心','压制流',{core:2},'领域内侧一半半径的敌人额外减速 10 个百分点。')],
   [upgrade('field','力场增幅','共用强化',{field:.05},'领域内敌人的减速量增加 5 个百分点。')],
   [upgrade('intercept','入场拦截','共用强化',{intercept:1},'普通敌人进入领域时额外减速 10 个百分点，持续 0.6 秒。每名敌人共用 4 秒冷却。')],
  ],
  repair_turret:[
   [upgrade('cut','快速切割','基础强化',{cut:2},'主线拆除耗时缩短 16%。')],
   [upgrade('wall','承重支架','共用强化',{wall:2},'覆盖内掩体最大耐久额外 +2。多塔覆盖取最高。')],
   [upgrade('patrol','优先巡检','共用强化',{patrol:2},'主线优先拆除作用区域内距角色 110 单位内的危险源，优先最近。')],
   [upgrade('arm','副臂施工','清障流',{arm:2},'主线开工时可开启副线，处理另一处空闲危险源，施工速度为主线的 35%。'),upgrade('mend','巡回修补','养护流',{mend:2},'每 6 秒修复耐久比例最低的受损掩体 2 点，比例相同优先最近。')],
   [upgrade('patch','清障补片','清障流 · 后继',{patch:1,patchAll:1},'每次主线或副线拆除危险源，修复范围内距离该危险源最近的受损掩体 2 点。',{from:['arm']}),upgrade('emergency','应急支撑','养护流 · 后继',{emergency:1},null,{from:['mend']})],
  ],
 };
 const trees=Object.fromEntries(Object.entries(rows).map(([kind,stages])=>{
  const nodes=stages.flatMap((stage,index)=>stage.map((entry,column)=>({
   ...entry,stage:index+1,x:(column+.5)/stage.length,
   description:entry.description??catalog[kind].nodes.find(n=>n.id===entry.id).description,
   from:entry.from??(stages[index-1]?.map(n=>n.id)||[]),
   choice:entry.choice??(stage.length>1&&stage.every(n=>!n.from)?`stage-${index+1}`:null),
   cost:routeCosts[stages.length][index],
  })));
  return [kind,{name:catalog[kind].name,depth:stages.length,nodes}];
 }));
 function routeState(tree,paid){
  const states={};
  const choices=new Map(tree.nodes.filter(n=>n.choice&&Object.hasOwn(paid,n.id)).map(n=>[n.choice,n]));
  for(const n of tree.nodes){
   const chosen=choices.get(n.choice);
   if(Object.hasOwn(paid,n.id))states[n.id]={status:'done'};
   else if(chosen)states[n.id]={status:'excluded',chosen};
   else if(n.from.length&&n.from.every(id=>states[id].status==='excluded'))states[n.id]=states[n.from[0]];
   else if(!n.from.length||n.from.some(id=>states[id].status==='done'))states[n.id]={status:'available'};
   else states[n.id]={status:'locked'};
  }
  return states;
 }
 function validRoute(tree,saved){
  const paid={};
  for(const n of tree.nodes){
   const cost=saved?.[n.id];
   if(Number.isSafeInteger(cost)&&cost>0&&routeState(tree,paid)[n.id].status==='available')paid[n.id]=cost;
  }
  return paid;
 }
 function effects(routes){
  return Object.fromEntries(Object.entries(routes||{}).map(([kind,paid])=>[kind,Object.assign({},...trees[kind].nodes.filter(n=>Object.hasOwn(paid,n.id)).map(n=>n.effects))]));
 }
 function legacyRefund(kind,saved){
  const ranks={};let refund=0;
  for(const n of catalog[kind].nodes){
   const rank=Number.isSafeInteger(saved?.[n.id])?Math.min(n.max,saved[n.id]):0;
   if(rank>0&&(!n.parent||ranks[n.parent]>=2)){ranks[n.id]=rank;refund+=costs[n.tier].slice(0,rank).reduce((a,b)=>a+b,0);}
  }
  return refund;
 }
 let run=null;
 function start(levels){
  run=levels&&Object.fromEntries(Object.entries(levels).map(([kind,{gate,...ranks}])=>[kind,ranks]));
 }
 function level(kind,id){return run?.[kind]?.[id]||0;}
 function levels(kind){return run?.[kind];}
 return {catalog,trees,routeState,validRoute,effects,legacyRefund,start,level,levels,get active(){return run!==null;}};
})();

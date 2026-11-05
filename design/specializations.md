# 武器与防御设施专精

2026-11-02，本地实现。21 个分类、每类 0–5 阶，0 阶关闭。装备 Tier、设施合成等级和专精阶位独立。已接入主菜单研究网格、五阶向上技能树弹窗和技能点购买；内容解锁规则尚未接入。

## 主菜单与研究购买

底部从左到右为出战、角色、研究三栏。三块赛博切角底板分别为橙黄、蓝青、紫粉渐变，直接相连并贴住屏幕底边，无额外底座；图标文字放大、横向排列。选中底板更宽更高且明亮，未选中压暗。出战沿用下移后的难度选择，角色复用原有属性加点面板（详细说明默认收起、可展开，费用字体放大），研究按武器/防御设施分组；天赋入口暂不展示。

每阶临时费用依次为 20、40、80、140、220 技能点，配置在 `talents.js` 的 `researchCosts`。只能购买下一阶；已掌握节点可查看，后续节点显示前置限制。研究效果立即生效。

`TalentRuntime.store.purchaseResearch(id, expectedLevel)` 在同一条主存档中更新余额、研究阶位和 revision，再同步战斗模块。角色加点、掉落入账与属性重置都会保留研究记录；旧草稿不能覆盖购买后的余额。研究不参与角色属性的免费重置。

主存档 `hell-elevator-talents-v1` 的可选 `research` 字段是已购买阶位的依据，菜单进入与出战时同步至战斗模块；原加点数据无需重置。无研究记录的旧存档仍兼容开发测试阶位。

## 测试入口

- 全部五阶：`http://127.0.0.1:4173/?dev=1&spec=5`
- 武器测试场五阶：`http://127.0.0.1:4173/?weaponlab=1&dev=1&spec=5`
- 地块测试场五阶：`http://127.0.0.1:4173/?electriclab=1&dev=1&spec=5`
- 关闭并保存全部专精：`http://127.0.0.1:4173/?dev=1&spec=0`

URL 阶位参数仅在 `dev=1` 下处理。开发测试阶位仍使用独立键 `hell-elevator-specializations-v1`，不扣费；但普通菜单会恢复已购买的正式研究阶位。测试场未进入菜单时可独立试验。未购买且未设置的分类默认 0 阶。

## 正式 UI 可调用的接口

```js
Specializations.catalog;             // 21 类、105 节点的名称/描述/画面说明
Specializations.view();              // 当前各类阶位
Specializations.set('pistol', 4);     // 依次拥有前四阶；返回是否成功
Specializations.setAll(0);           // 开发测试重置
Specializations.level('shotgun_tower');
```

接口允许立即切换用于测试；已发射攻击保留发射时的专精快照。正式购买使用 `TalentRuntime.store.purchaseResearch` 校验余额、当前阶位和前置；直接 `Specializations.set` 仅供开发测试，不承担付费事务。

## 运行逻辑

- `specializations.js` 统一处理发射、命中、爆炸、易伤、减速、燃烧与治疗再生；`electric-tiles.js` 接入设施射程、生产、治疗、领域与辅助施工。
- 概率按一整轮原始攻击判定一次。连发组、双枪、多弹群和持续光束不逐弹重抽；增加的是单颗弹/单条链，不是复制整轮。
- 新增弹体不触发专精弹射、分裂、气刃或爆炸节点。保留原装备固有多弹、穿透、进化与元素/配色。
- 手枪弹射为 30% / 高阶 60% / 末阶 75%，每跳原弹 40%，不得回跳已命中目标。末阶追加弹另有 60% 概率，造成 40% 伤害。
- 易伤在施加命中之后生效；多来源取最强。减速取最强，不累乘；领域定身不限制首领动作。状态标记绘制在敌人身上，不统一改变武器配色。
- 霰弹枪塔四阶射程 260→338，索敌、弹丸存活距离和设计器攻击范围提示同步；不使用加成区域当攻击射程。
- 修理辅助线半速施工；主线更换目标后保留仍然有效的辅助进度，避免辅助线因主线先完成而永远不能完成。换层和拆除继续沿用既有危险源清理约束。
- 新效果使用共享常驻网格和已有投射物/爆炸渲染，不修改敌人网格生成方式。

数据说明从项目外设计 CSV 生成到 `specialization-catalog.js`：`python tools/build-specialization-catalog.py`。效果由手写逻辑实现；修改描述不会自动更改战斗数值。

## 验证

`npm run check`、`npm run test:specializations`，以及防御塔、更多防御塔、钟表/修理、武器进化、旧属性加点回归。`node tests/preview-specializations.cjs` 在真实 Edge/WebGL 中验证全部 39 型武器、三种视口、GPU 重建、保存/刷新和零页面/GL 错误。

完整 `npm test` 当前停止在既有 `test-economy-pool.cjs` 的 `fixed enlarged pool 1`。`python tools/check-specialization-baseline.py` 在内存撤销本次全部 game.js 修改后重跑，复现同一失败。详见 `tests/specializations-baseline.log`，未为本次功能改动经济池预期。

以上浏览器检查为桌面验证，不是手机实机验收。

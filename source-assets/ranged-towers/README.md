# 霰弹枪塔与狙击塔

与现有赛博防御塔共用银白切角装甲、石墨内构、四脚底座和发光槽。

- 霰弹枪塔：橙色识别，短粗双枪管、宽枪口、六发弹鼓、后坐活塞。
- 狙击塔：青蓝识别，长枪管、外露双导轨、侧置瞄准镜、散热箍。

建模脚本 `../../tools/build-ranged-towers.py` 复用 `build-cyber-facilities.py` 的材质与基础几何定义，仅构建这两款新塔，创建新场景并保留原场景。底座与炮头分别导出，方便之后独立旋转炮头。

当前状态：用户已在当前 Blender 执行脚本。两款塔、可编辑 blend、预览图与独立底座/炮头网格已生成，并已查看总览渲染。霰弹枪塔 3064 三角面，狙击塔 2296 三角面。已接入现有 shotgun_tower 与 sniper_tower：底座固定，炮头沿原 aim 独立旋转，共享 residentMesh 常驻缓冲；原战斗参数保留。npm run check、test-more-towers/defense-towers/tower-range、真实 Edge/WebGL 三尺寸模型/瞄准/固定底座/射弹/缓冲重建检查通过。已查看游戏内截图，仅本地未发布。

本地预览：`http://127.0.0.1:4173/?electriclab=1&facilitypreview=rangedtowers`，左侧霰弹枪塔，右侧狙击塔。

在当前 Blender 的 3D 视图按 Shift+F4，执行：

```python
exec(compile(open(r'H:/CodexProjects/hell-elevator-codex/hell-elevator/tools/build-ranged-towers.py',encoding='utf-8').read(),'build-ranged-towers.py','exec'))
```

预期输出本目录 `ranged-towers.blend`、`ranged-towers-overview.png`、`manifest.json`、`build-complete.json`，以及 `../../dist/assets/ranged-towers.js`。需实际执行后检查文件与渲染图。

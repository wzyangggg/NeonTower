# Blender 赛博设施

建模源脚本：`../../tools/build-cyber-facilities.py`。

设计包含电塔、双舱四孔导弹塔、治疗塔、护盾塔、维修塔、四向折叠物资平台。
参考用户提供的六张图片，采用石墨色内构、银白装甲、分层切角、发光槽；物资平台参考第四张图的低矮部署结构。

当前状态：用户已在当前打开的 Blender 5.2.3 执行脚本，六款模型、可编辑 blend、预览图和网格均已生成，已查看预览图。已接入本地游戏的四种防御塔、维修塔和六角物资平台；防御塔自带底座，不叠加物资平台。

在当前 Blender 的 Python Console 中执行：

```python
exec(compile(open(r'H:/CodexProjects/hell-elevator-codex/hell-elevator/tools/build-cyber-facilities.py', encoding='utf-8').read(), 'build-cyber-facilities.py', 'exec'))
```

脚本创建新场景并保留原场景，输出可编辑 `cyber-facilities.blend`、预览图 `cyber-facilities-overview.png`、三角面统计 `manifest.json`、游戏常驻网格 `../../dist/assets/cyber-facilities.js`。游戏入口已加载网格，沿用 residentMesh 常驻共享缓冲，未修改设施玩法。已通过 npm run check、防御塔/独立射程/维修塔/电力设施回归及真实 Edge/WebGL 三尺寸预览、平台 GPU 恢复与入场升降检查。仅本地，未发布或进行手机实机验收。

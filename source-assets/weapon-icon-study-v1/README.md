# 武器图标流程试验 v1

原生 image_gen 生成一张3×3卡通武器图集，完整生成提示词为 generation-prompt.txt。Seedream拆图提示词为 decompose-prompt.txt，原始透明图层与坐标在 layers/layers.json，背景层z_index=0不接入图标。原始API响应包含临时下载URL，仅内部缓存，不部署。

已成功提交并缓存本批；不得重新提交付费任务。需要补下载时仅运行：

```powershell
python -B .agents/skills/seedream-decompose/scripts/decompose.py --out source-assets/weapon-icon-study-v1/layers --resume
```

像素滤镜可离线重复运行：

```powershell
python -B tools/pixelize-weapon-study.py
node tests/preview-weapon-icon-study.cjs
```

归一：API透明层按alpha有效边界裁去留白，主体等比缩至208px以内并居中256px透明画布。下采样到48或32px，再用全批共享64色MEDIANCUT调色板量化，无抖动；alpha阈值128转换二值边缘。像素预览统一96px（48的2倍/32的3倍），使用nearest-neighbor。原始透明层不覆盖。comparison.png为原画/48/32三行对照。

网页接入 dist/assets/weapon-icon-study-v1/，默认48px，无后处理。不是手绘原生像素，也不使用Aseprite前台。

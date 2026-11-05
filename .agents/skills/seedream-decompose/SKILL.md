---
name: seedream-decompose
description: 使用 TreasureIsland6000 的 Seedream 官方 API 将图集或 UI 原稿拆为独立透明 PNG 图层，保留坐标与来源；用于本项目拆图，不用于生成或重绘素材。
---

# Seedream API 拆图

沿用 `H:/UnityProject/TreasureIsland6000` 的 SeedreamLayerize API 协议和本机凭据。随附脚本是项目内通用入口，不依赖 Unity 启动，也不复制密钥。实现来源为该项目 `Assets/HotFix/BusinessLogic/EditorTools/Editor/PCX/SeedreamLayerize/` 和 `Artifacts/IslandDefenderEquipmentIcons/2026-09-27/seedream_extract.py`。

- 生图、重绘使用原生 imagegen；需要拆图时必须调用本 API，不以本地网格裁切、阈值抠图替代。
- 检查源图，列出英文图层 ID 和目标区域。每批最多16个主体，每个完整物体一层；提示词明确保留轮廓、细节、颜色，去掉背景、文字和槽位。指定区域用 `<bbox>left top right bottom</bbox>`，输入坐标为0～999。
- 在任务输出目录保存源图和 UTF-8 提示词，然后执行：

```powershell
python .agents/skills/seedream-decompose/scripts/decompose.py --source <原图.png> --prompt <提示词.txt> --out <输出目录>
```

脚本优先读取 `ARK_API_KEY`，其次读取 TreasureIsland 工具使用的 Windows EditorPrefs 键。只确认凭据可用性，不打印或保存密钥。模型和接口默认值来自上述本机实现；实现变更时核对后更新，勿用额外计费请求探测连通性。

提交前写入 submitted.json；已有响应时只补下载，不重新计费。已提交但没有响应、响应为错误时停止并核查，不能盲目删除标记重试。仅恢复下载可运行：

```powershell
python .agents/skills/seedream-decompose/scripts/decompose.py --out <输出目录> --resume
```

保存脱敏请求、原始响应、原始透明 PNG 和 layers.json。API Key 只发送到固定官方 HTTPS API，图片下载不携带鉴权。返回URL有时效，立即缓存；不将含签名的原始响应发布到网站。

检查每层主体完整、镂空透明、无多余背景、命名与内容一致，再接入资源。z_index=0 是底图，不当作透明主体。保留 bounding_box、z_index、名称、来源路径；absolute 是底图像素 `[left,top,right,bottom]`，显示尺寸为坐标差，可能不同于 PNG 像素尺寸。normalized 响应范围0～1000；二次拆图保留父子映射和可见性，不重复缩放。

API 独立图层可以做 alpha 裁边、等比缩放、居中留白；保留原层并记录正式资源映射。缺少凭据或 API 拒绝时报告实际障碍，保留可用缓存，不冒充拆图成功。

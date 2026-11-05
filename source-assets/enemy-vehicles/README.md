# 空中敌人模型

根据用户提供的飞车、飞摩托和黄色球舱参考制作的精简俯视造型；战斗机使用后掠翼与双引擎轮廓。全部为实际 Blender 网格，不依赖运行时建模库。

| 模型 | 对应现有敌人 | 三角面 |
| --- | --- | --- |
| hovercar.blend | eye，单发四涵道飞车 | 4976 |
| hoverbike.blend | skull，环射飞摩托 | 3356 |
| bubblepod.blend | spitter，脉冲球舱 | 4304主体 + 160玻璃 |
| fighter.blend | moth，三连散射战斗机 | 1316 |

坐标沿用游戏：X左右、Y向上、+Z机头。主体由可编辑的独立壳体、玻璃、武器与推进器部件构成。球舱的前向玻璃使用单独透明常驻网格，座椅和机器人驾驶员位于舱内；双翼延伸到X±38，双臂推进器外移到X±31，保留主舱尺寸以强化顶视轮廓。飞车按新四涵道参考重建，白侧壳与黑玻璃占比明确；摩托改为宽高前罩、开放脚踏和厚后行李壳。

重建：使用 Blender 后台分别运行 `tools/build-hovercar.py`、`tools/build-hoverbike.py`、`tools/build-bubblepod.py`、`tools/build-fighter.py`。公共导出逻辑为 `tools/vehicle_mesh_common.py`，输出同目录 `.blend` 及 `dist/assets/enemy-vehicles/*.js`。运行时使用 residentMesh 共享几何、受击反馈与实例变换；推进器亮点单独绘制。保留原攻击、生命值、碰撞及自主飞行规则。

本地游戏预览：`http://127.0.0.1:4173/?vehiclelab=1`。真实桌面 Edge/WebGL 检查与对照截图由 `node tests/preview-enemy-vehicles.cjs` 生成。

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

## 第二批外观

| 模型 | 对应现有敌人 | 轮廓 |
| --- | --- | --- |
| needle.blend 赤针 | moth | 珊瑚红三角翼、青色座舱、双垂尾 |
| mantis.blend 螳刃 | skull | 酸绿色双爪、镂空支臂、琥珀色座舱 |
| forge.blend 熔炉 | eye | 橙色宽体装甲、双炮、双升力风扇 |
| wraith.blend 幽镰 | spitter | 紫色镰翼、双环形脉冲线圈、品红座舱 |

使用 Blender 后台运行 `tools/build-enemy-vehicle-fleet.py` 可重建四份源模型及运行时网格。可在 Blender 命令末尾传入 `-- <目录>` 导出四张斜俯视预览。游戏按每架敌机已有的随机相位选择原版或新外观，攻击规则沿用其原有类型。打开 `http://127.0.0.1:4173/?vehiclelab=2` 可集中查看四款新外观。

## 红圈指定的三款

| 模型 | 对应现有敌人 | 三角面 |
| --- | --- | --- |
| ember.blend 烬翼，橙白三角翼与双后掠白鳍 | moth | 1024 |
| cobalt.blend 钴隼，蓝白双进气机身与琥珀双段座舱 | fighter | 1424 |
| prism.blend 棱核，品红双臂与蓝色多面体核心 | spitter | 1488 |

运行同一构建脚本，传入 `-- marked` 可重建这三款，追加目录可生成预览图。三款均为游戏内的轮换外观。本地预览为 `http://127.0.0.1:4173/?vehiclelab=3`。

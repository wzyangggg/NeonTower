# 愤怒熊

原始模型：用户提供的 Model_AngryBear.fbx，原贴图内嵌，眼睛保留原网格/UV/贴图。

AngryBear_Rigged.blend 是 Blender 5.2.3 建立的蒙皮源文件，AngryBear_Rigged.fbx 是静态绑定交换文件。17 骨无臂双足层级沿用猫：root / pelvis / spine / neck / head、两组 thigh/shin/foot/ear、三段 tail 和 weapon_socket。模型无双臂，因此无臂骨。每点最多3权重、归一化。眉毛跟随头，耳朵和尾巴独立绑定，衣服随躯干。

Blender 内含 idle/walk/sit 三个演示 Action；游戏用猫同类落脚 IK 和头部弹簧，GPU蒙皮、一次上传顶点，深度/法线/描边同步变形。模型按1.9倍统一到猫附近尺寸。

重建：Blender --background --python tools/inspect-bear.py，再运行 tools/build-player-bear.py。输出 dist/assets/player-bear/bear.json 和 bear.png。

游戏暂停菜单 → 主角模型 → 愤怒熊；自发光下面是熊贴图亮度（25%—300%）、色相（-180°—180°）及恢复按钮。本机保存，不改原图。

验证：npm run check、node tests/preview-player-bear.cjs、node tests/preview-player-cat.cjs。桌面 Edge WebGL 验证，不代表手机实机验收。

头部缩放：暂停菜单熊调参区50%—150%，以颈部连接点缩放头、耳朵、眉毛；独立恢复头部大小并保存本机。

斗篷权重修正：上领口逐渐绑定head（z .35—.515平滑过渡），中下部继续pelvis/spine；适配游戏独立head弹簧。不是布料物理。运行tools/verify-bear-clothing.py可检查领口跟头/下摆稳定并生成渲染。

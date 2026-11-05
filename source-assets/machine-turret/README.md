# 机枪炮台

用户参考图的低多边形蓝色护板炮塔，1040三角形。源文件 machine-turret.blend 使用标准Z-up，参考图已打包。

运行 Blender 后台脚本 tools/build-machine-turret.py 可重新生成源文件、工作室PNG及 dist/assets/machine-turret.js。游戏数据使用Y-up、+X为炮口方向，分为base/head/barrel三部分；通过renderer.residentMesh共享固定网格，仅更新旋转与后坐实例。

沿用敌方危险源：首轮2秒充能，然后锁定方向以0.13秒间隔连射7次，末发后充能3.2秒；末0.75秒预警。不可攻击摧毁或自动选中，无血条。地块试验场→场地/预设/测试工具→添加机枪炮台→开始测试。

蓝色护板为面向+X的薄前盾，左右宽面各接一段向后折的外翼，中央U形开口露出炮管和上方活塞；后方机匣开放。

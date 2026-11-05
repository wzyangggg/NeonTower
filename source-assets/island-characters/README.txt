狐狸 / 兔子外观迁移包

来源：H:/UnityProject/TreasureIsland6000/Assets，仅复制，原项目未修改。
Assets/IslandDefender/Models/FoxRigged.fbx：狐狸，29骨骼，含完整双臂、手腕、尾巴。
Assets/IslandDefender/Models/BunnyRigged.fbx：兔子，25骨骼，含完整双臂、手腕。
Assets/IslandDefender/Models/Materials 和 Textures：原材质、贴图、导入设置。
Assets/IslandDefender/Animations：待机 Idle.fbx、跑步 Running.fbx。
fox-imported.blend、bunny-imported.blend：从复制品导入，保留骨架/蒙皮，将颜色贴图重定位到本包并打包，可直接打开检查。

manifest.json：复制的32个文件的来源相对路径、尺寸、SHA256校验和、每角色依赖与未复制的Unity依赖。
inspection.json：Blender读取的骨骼、网格、绑定和动画信息。

注意：两只角色FBX没有内嵌动画；独立动画尚未重定向或接入WebGL游戏。
Prefab为原始参考快照，仍引用原项目角色基类、Animancer和脚本，不能当作独立可运行Unity角色。
只搬外观，没有引入AI、NodeCanvas、战斗/伤害/装备系统。
狐狸Mat_FoxEye.mat的_EyeWhiteTex引用GUID 2baf78b5e60fc7947abd4344ef5aa3bb，在原项目磁盘中未找到；瞳孔fx_circle.png已复制。眼睛专用Unity Shader已保留供后续转换，Blender并未复刻Unity眼睛/卡通着色器。
角色衣服/帽子/背包属于源模型自身部件；不是此前给猫叠加的通用护甲块。
当前游戏仍保留猫与机器人；本次尚未增加狐狸/兔子的运行时加载与选择。
未进行Unity验收，未启动Unity或修改Unity项目。

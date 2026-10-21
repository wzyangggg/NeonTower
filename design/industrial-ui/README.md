# 工业矩阵 UI 实验 · 2026-10-19

分支 ui/industrial-matrix-reference，前版冷蓝星月 UI 保留在 ui/starlit-rose-reference（b377339）。两张用户参考原图保存于本目录。

使用工业黑灰底、淡点阵、切角硬边、细线分区、橙/青/浅灰类别带和蓝色主操作。商店卡片顺序为类别条、菱形线框图标、名称、简介、价格与序号；交互高亮蓝色价格栏。既有图标在本主题关闭柔光、保留品质颜色。竖屏仍三列商品，短屏可滚动。主菜单、HUD、永久技能、装备对比与酒吧保持同一视觉规则。

独立样式 dist/industrial-ui.css，原版/六角入口共同加载。game.js仅为商店商品添加类别数据属性；购买、价格与揭晓逻辑不变。离线脚本同步内联主题。

验证 npm run check，test-category-boxes、test-terrain-shop、test-talents 通过；preview-industrial-ui 在真实 Edge/WebGL 覆盖 390×680、390×844、1280×900，技能底部操作、开局、商店扩容/刷新/离开、短屏滚动、酒吧与六角入口。无脚本及GL错误。已查看 tests/industrial-*.png；桌面浏览器，非手机实机，未发布，未重跑完整 npm test。

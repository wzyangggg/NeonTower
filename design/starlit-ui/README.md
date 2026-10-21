# 星月玫瑰 UI 风格实验 · 2026-10-19

分支：`ui/starlit-rose-reference`。改动前源码快照：`04df0c8`。

用户参考图见 reference.png。提取酒红紫、奶金描边、玫瑰按钮、半透明卡牌、星点和轨道环，应用于原版与六角入口的主菜单、HUD、商店、装备面板及永久加点面板。新增独立 dist/starlit-ui.css；测试入口折叠收纳。保留既有游戏逻辑和场景。

本地预览：http://127.0.0.1:4173/ ，六角入口：http://127.0.0.1:4173/hex-city.html 。未发布。

验证：npm run check；test-talents、test-category-boxes、test-terrain-shop；preview-starlit-ui 真实 Edge/WebGL，390×680、390×844、1280×900，开局、技能页脚、商店扩容/刷新/离店、六角入口、脚本错误与 GL 检查通过。未重跑完整 npm test（既有 test-63 商店旧断言问题见 HANDOFF.md）。桌面浏览器验收，非手机实机。

效果图：tests/starlit-menu-390x680.png、starlit-shop-390x844.png、starlit-talents-390x680.png、starlit-combat-390x844.png。

## 夜城配色修订

根据用户的六角夜城实景反馈，将粉色/酒红底板改为深蓝灰、午夜蓝与低饱和靛蓝按钮，次级文字改为冷灰蓝。保留奶金标题/金额、细边和星月装饰。HUD/底栏采用接近六角地板的深蓝灰。粉色版本保留在提交 32bb94c，可通过 Git 回退。

本轮 npm run check、preview-starlit-ui 的三窗口与原版/六角真实 Edge/WebGL 检查通过，无脚本或 GL 错误；已检查六角战斗、商店、菜单截图。新增存档截图 tests/starlit-hex-390x844.png。未发布，未重跑完整 npm test。

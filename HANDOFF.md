## 2026-11-03 本地：商店彩虹盒加密与减弱白光

- 商店独立材质覆盖 dots=5（原3）、white=.35（原1.8）、rim-strength=.4（原1.3）；保留彩色流动、旋转与共享离屏绘制。RainbowPickups支持renderer.rainbowMaterial覆盖，场景与实验页保存参数不变。
- npm run check、preview-rainbow-shop、preview-rainbow-pickups通过。商店覆盖320/390/1280、动画、购买锁定、减少动态及零页面/GL错误；查看390截图，波点与商品图标可见。两项浏览器测试需顺序运行：场景测试临时写共享预设，与商店静态截图断言并行会干扰。
- tests/rainbow-shop-before-density.png保留改前截图；本地未发布，桌面Edge验证，非手机实机验收。

## 2026-11-03 本地：恢复时间色相、提亮与商店彩虹盒

- 按用户新要求实验页/掉落共享surface改回随时间变化的亮暗双色端点受光插值，波点/间隙保持不同节奏；共享背面输出提亮15%，掉落背面增益1.5→1.6（总体进一步变亮），保留有色暗部、正面参数、dots=3与固定倾斜恒速旋转。
- shop-chest-model替换原宝箱几何，使用RainbowPickups共享Shader的一个256px WebGL离屏表面，约30fps绘制后复制至所有卡片2DCanvas；无每卡WebGL上下文，离页/隐藏停止，减少动态偏好下静态。商品图标居中，深色小衬底防高光淹没。原卡片内容/锁定/购买逻辑未改。掉落shader新增iconEnabled以供商店不绘制盾/血图标。
- 实验页和掉落实机Edge WebGL回归通过；新增preview-rainbow-shop覆盖3卡模型/动画、320/390/1280布局、锁定购买放弃、减少动态及零页面/GL错误；shop-stock/health/enemy-buffs与npm run check通过。查看390商店截图。本地未发布。

## 2026-11-03 本地：属性页一体工业面板与自动保存

- 统一青色边框、右上/左下折角、连续蓝紫底；Header/列表/底部重置共享skill-frame，去掉逐行卡片底色与通用战斗/操控/机体分组，保留13属性顺序、分段条和运行时像素图标。
- 移除保存分配按钮与未保存草稿提示；每次已完成加减/重置操作从最新共享钱包取草稿并立即save，失败刷新状态提示重试，沿用升级按钮闪烁确认和下局属性快照规则。
- npm run check、test-research-wallet、preview-attribute-icons、preview-button-confirm通过；浏览器验证320/390/1280无横向溢出/列表与footer分离，升级/退款/重置及刷新持久化、按钮锁定与确认音清理。查看320/390截图。桌面Edge验证，仅本地未发布，非手机实机验收。

## 2026-11-03 本地：修复入场遮罩主菜单左移

- 转场副本使用实际屏幕left后仍继承.viewport的translateX(-50%)，造成重复偏移；显式清除transform/right/bottom。CSS根选择器统一:is(#viewport,.difficulty-transition-cover)，保留原ID specificity，副本无须重复根ID即可沿用主菜单布局。
- 复制后同步并暂停CSS动画当前时间，防止入场动画重播导致标题/按钮再位移。
- npm run check、preview-difficulty-transition通过；真实桌面Edge/WebGL覆盖390/320/1280，逐帧断言副本边界与游戏重合、标题/难度面板/底栏位置尺寸不变，约1秒展开、无页面/GL错误。仅本地未发布，非手机实机视觉验收。

## 2026-11-03 本地：进入下一关统一闪烁确认

- 普通商店“进入下一关”接入data-confirm-delay，复用调试台节奏、操作锁定和完成激励音；闪烁结束后仅推进一关。酒吧“前往普通商店”保留原行为。
- npm run check及preview-next-stage-confirm通过；真实桌面Edge验证等待期间楼层/余额不变、重复点击/刷新拦截、结束只推进一次且完成音仅触发一次。仅本地未发布。
## 2026-11-03 本地：进入游戏圆形转场放缓

- 原750ms cubic ease-out前段展开过快；改为1000ms smoothstep，让圆形展开过程更清楚。每帧最多推进50ms，卡顿时延长动画而不跳过大段；沿用转场期间暂停战斗与输入锁定。
- npm run check、preview-difficulty-transition通过。真实桌面Edge/WebGL覆盖390/320/1280宽，测得约1008/1001/993ms，验证中间圆形、开场暂停、结束清理及零页面/GL错误。未手机实机验收，仅本地未发布。

## 2026-11-03 本地：恢复属性升级分段进度条

- 用户澄清保留进度条，只去掉文字说明。恢复属性名称下分段条与升级点亮，保持无等级数字/进度文本；蓝紫背景、运行时像素图标与紧凑对齐沿用。
- npm run check、preview-attribute-icons通过，新增13条可见/无文本/分段数量及升级点亮断言；查看390截图，覆盖320/390/1280与升级保存。桌面Edge验证，本地未发布。

## 2026-11-03 本地：属性图标运行时像素滤镜

- 属性图标改读现有-original.png透明原图，Canvas2D运行时最近邻采样至24×24，再以48px像素方式显示；不改写任何PNG。采样结果按资源缓存，加点重绘复用；Canvas失败回退原图。
- preview-attribute-icons更新原图映射、13个Canvas就绪/非空像素/采样尺寸与显示尺寸断言，并兼容现有按钮确认延迟。
- npm run check、preview-attribute-icons、test-research-wallet通过，320/390/1280布局、升级保存、零页面资源错误；查看390截图颗粒效果。桌面Edge验证，本地未发布，非手机实机验收。

## 2026-11-03 本地：闪烁按钮调试台与完成奖励音

- 新增button-confirm-lab.html/js：白色/原色/总时长、完成音量，滑杆与数字输入、按钮实测、单独试听、恢复默认与保存；当前浏览器保存并同步同源游戏页。
- ButtonConfirm增加参数校验及持久化，完成后播放共享上扬四音奖励提示；游戏遵循静音与音效总线，取消不响完成音。实验页复用正式确认与奖励音逻辑。
- npm run check、preview-button-confirm、preview-button-confirm-lab通过。真实Edge验证保存/刷新/跨页同步/完成后仅响一次/390宽无溢出，查看390全页截图。仅本地未发布，非手机实机及音色听感验收。
## 2026-11-03 本地：修正熊斗篷领口跟随

- 检查确认Clothing已蒙皮，但原领口仅spine/neck、无head权重，游戏头弹簧独立覆盖head矩阵，因此围巾状上缘几乎不随头动。
- build-player-bear.py 为Clothing单独分配连续权重：z .35—.515用smoothstep从躯干过渡到head；保留下摆pelvis/spine绑定。重新生成Rigged.blend/FBX与bear.json/png。未增加布料物理或改眼睛。
- tools/audit-bear-clothing.py报告区域权重；tools/verify-bear-clothing.py在Blender验证20°头旋转：领口平均位移.0296、下摆0，三档头缩放顶点有限；clothing-audit.json与neutral/tilted渲染保存source-assets/player-bear。查看抬头渲染及游戏截图；npm run check与完整熊Edge WebGL回归通过。仅本地未发布，非手机实机验收。

## 2026-11-03 本地：统一闪烁延迟按钮

- ButtonConfirm 统一处理开始挑战/进入游戏、属性加点＋、研究升级；按用户反馈提速为立即白底黑字25ms、原色100ms，1秒闪8次后执行一次原逻辑。timing可调，data-confirm-delay可接入其他按钮。
- 等待时拦截菜单点击和按键，防连点/跨属性/关闭/切Tab；切后台或按钮移除取消。保留属性草稿与保存规则。减少动态效果偏好下保留延迟与锁定，取消闪烁。
- 确认脉冲音效共用游戏音效总线和静音设置，完成/取消停止；移除enterDifficulty原有额外闪烁与等待，保留转场。
- npm run check、test-research-wallet、preview-button-confirm、preview-research-sequential通过。真实桌面Edge验证延迟前不扣点、白底黑字、全局锁定、单次提交与音效清理；未手机实机验收或发布。
## 2026-11-03 本地：属性行统一蓝紫底色

- 根据用户反馈移除属性行六色轮换，全部统一低饱和蓝紫渐变，按钮/边线同步淡蓝紫；保留原属性图标。
- npm run check、preview-attribute-icons通过，查看390截图；本地未发布。

## 2026-11-03 本地：研究后自动选中下一阶

- lobby.js 购买成功后自动选中下一可研究节点并滚动至可见区域，底部固定研究按钮立即更新费用，可在同一位置连续点击；满五阶保留第五阶已研究状态，余额不足时仍选中下一阶并禁用购买。
- npm run check、test-research-wallet、preview-research-sequential 通过。新增真实 Edge 浏览器回归覆盖同坐标连续购买五阶、选中/可见状态、满阶、余额不足及刷新持久化。仅本地未发布，非手机实机验收。

## 2026-11-03 本地：属性升级界面精简与对齐

- 移除顶部系统英文、已投入/本局拾取、统一强化范围、说明开关和列标题，仅保留彩色几何折角属性升级Header；沿用右上共享钱包。
- 移除属性图标下等级数字和分段进度条；属性行左右垂直居中，最小高度86缩至74，保留右侧当前/下一级、费用与加减按钮。
- npm run check、test-research-wallet、preview-attribute-icons通过，覆盖320/390/1280、13图标加载、升级保存和零页面/资源错误；查看390截图。桌面Edge验证，本地未发布，非手机实机验收。

## 2026-11-03 本地：角色加点13项像素图标

- 用户提供并批准4×4图集，source-assets/attribute-icons-v1/source.png保留；项目Seedream API一次拆出13前景层与背景，原始响应/透明层/坐标保留于raw-layers。未重新生图。
- 统一256px原画、共享64色32/48px、二值透明；正式资源dist/assets/attribute-icons-v1，中文对照source-assets/attribute-icons-v1/review.png。talents.js用48px图标替换SVG，critDamage映射crit_damage；图标列48px，整数像素显示。
- npm run check、test-research-wallet、preview-attribute-icons通过：13映射/图片加载、320/390/1280布局、升级保存、零页面/资源错误；目视查看320顶部和390底部截图与全图对照。保留现有页面后处理，桌面Edge验证，未手机实机验收。仅本地未发布。

## 2026-11-03 本地：暂停时边调边看角色

- 暂停设置改为底部48%以内的可滚动面板，去掉全屏遮罩与模糊；继续/返回按钮紧凑并固定在滚动区底部。地图上半部分可见。
- 右上增加跟随玩家的实时放大画面：同帧主画布裁取，不另建WebGL上下文；暂停帧绘制完成后更新，调头/亮度/色相立即看到效果，战斗时间保持冻结。
- npm run check、熊WebGL回归与新增preview-pause-live通过。真实Edge 320/390/1280验证预览像素变化、无全屏遮挡/模糊、预览和面板不重叠、无横溢出、继续游戏与零GL/页面错误；查看截图。本地未发布，非手机实机验收。

## 2026-11-03 本地：熊头部缩放

- 暂停菜单熊调参区新增头部缩放50%—150%、独立恢复按钮，本机保存；以颈部连接点等比缩放头/耳/眉，沿用头弹簧，身体不变。主渲染和深度/法线/描边共享骨矩阵。
- npm run check、新增头缩放UI/保存恢复/颈部锚点不移动/身体矩阵不变断言及熊完整Edge WebGL回归通过；查看130%设置截图。仅本地未发布。

## 2026-11-03 本地：愤怒熊无臂双足绑定与角色接入

- 用户提供 Bear/Model_AngryBear.fbx；通过 Blender 建立猫同类17骨无臂双足与部件权重，保留眼睛原贴图。source-assets/player-bear 保存原模型、Rigged.blend、带贴图 Rigged.fbx 和重建说明；tools/inspect-bear.py + build-player-bear.py 可重建。
- bear-player.js 使用常驻GPU蒙皮，沿用猫落脚IK、头弹簧及坐骑姿态，深度/法线/描边同步。暂停角色选择新增愤怒熊；自发光下面新增熊亮度/色相/恢复，本机持久化。熊不显示动态眼睛设置。
- npm run check、猫原回归和新增熊真实Edge WebGL回归通过：行走不重复上传、九坐骑、切换、亮度色相保存恢复、上下文恢复；已查看游戏与调参截图。仅本地未发布，非手机实机验收。

## 2026-11-03 本地：研究卡片双色工业折角与紧凑比例

- 根据反馈取消多色渐变，统一左紫右暖金双色；圆角改左上/右下8px工业折角。
- 卡片宽高比.84改1，去掉窄屏126px最小高度；名称12增14px（窄屏12），星星14增17px（窄屏15），星条24增27px，星间距7缩3px，取消名称独立暗底。
- npm run check、preview-research-icons、test-research-wallet通过；查看390截图，三尺寸三列/21类详情/105星/购买点亮/零资源错误通过。本地未发布，桌面浏览器验证。

## 2026-11-03 本地：研究卡片右侧竖排星条

- 按参考将每张卡片五星改为右侧紫青渐变条内竖排；类型名称叠在图标背景底部，保持三列。
- npm run check、preview-research-icons、test-research-wallet通过；查看390截图。预览覆盖320/390/1280、21类/105星、详情映射与购买点亮、零页面资源错误。桌面浏览器验证，本地未发布。

## 2026-11-03 本地：研究CARD紧凑布局与去装饰

- 按用户反馈图标随卡片宽度放大（最大144），取消320屏图标降48px，图片区改宽高比1.1，名称星级区70缩至55px（窄屏51）。保持每行三列。
- 删除椭圆底座、图上亮膜、青色折线/凸台分隔及分隔发光，仅保留渐变背景、图标、名称与五星。
- npm run check、preview-research-icons通过：三尺寸三列、图标填充与不溢出、无底座、21映射/105星/点亮、零资源页面错误。已查看390/320截图。本地未发布。

## 2026-11-03 本地：免费商用 UI 字体与自动子集

- 中文 UI 统一未来荧黑 SC Normal Medium/Bold；数字及常用数值符号用 Rajdhani SemiBold。fonts.css 覆盖既有组件字体，保留字号、字重与布局；缺字回退系统字体。当前替换 HTML UI，Canvas/场景贴图中的既有字体未批量改动。
- 完整字体与 OFL 放 source-assets/fonts（不上线），tools/build-fonts.py 扫描 dist 的 HTML/CSS/JS/JSON（含 Unicode 转义），自动生成三个 WOFF2。当前共约629.4 KiB；开发机依赖 fonttools[woff]。npm run dev/build/package 自动更新，直接上传 dist 前须先 npm run build。
- 离线打包自动更新子集、内嵌 WOFF2 并附授权；顺便兼容 hex-loader 当前 const modules 列表，保留 promo 模块。npm run package 生成0.250.0本地离线/Web包，未发布。
- npm run build/check、research-wallet、真实 Edge 字体加载及实际自定义字形、320/390/1280三个Tab无横溢出检查通过；截图 tests/fonts-{battle,character,research}-390.png 已查看研究页。离线 file:// 两套字体加载通过。截图测试等待切换动画结束。桌面浏览器验收，非手机实机。

## 2026-11-03 本地：未激活 Tab 压暗

- 用户纠正淡紫过亮，未选中改暗紫渐变与灰紫文字图标，选中继续橙黄色。
- npm run check、真实 Edge 三个 Tab 状态配色验证通过，查看底部截图。本地未发布。

## 2026-11-03 本地：底部 Tab 双色状态

- 三个 Tab 统一按选中状态配色：选中橙黄色、未选中淡紫色，取消各 Tab 独立配色及未选中亮度压暗。
- npm run check 与真实 Edge 三个 Tab 切换配色检查通过，查看底部截图。本地未发布。

## 2026-11-03 本地：难度标题去底色、开始按钮贴边

- 按用户纠正取消选择难度 Header 独立背景和分隔线，标题直接共享光盘渐变；开始挑战按钮扩展至卡片左右边框并贴合底边。
- npm run check 通过；真实 Edge 验证320×740、390×844、390×660、1280×900标题透明及按钮三边贴合，底部不越过导航，查看390截图。本地未发布。

## 2026-11-03 本地：难度光盘卡片整合

- 选择难度标题、光盘背景和底部切换条收进 difficulty-media-card；标题与光盘无间隙，取消旧阶梯分隔，左右发光切换按钮贴合卡片底部两侧，星级居中。
- npm run check、research-wallet 通过；真实 Edge 在320/390/1280验证无缝衔接、切换操作与底部导航间距，查看390截图。本地未发布。

## 2026-11-03 本地：三个主菜单 Tab 统一右上角技能点

- 出战、角色、研究共用固定右上角钱包；移除研究标题余额和角色页原余额显示，角色草稿加点实时同步右上角数值。
- npm run check、test-research-wallet 通过；真实 Edge 验证 320/390/1280 三个 Tab 钱包可见且位置一致，查看角色截图。原 preview-lobby 在开始战斗后导航隐藏断言失败（历史已记录同一问题），此前研究购买和角色保存流程通过。本地未发布。

## 2026-11-03 本地：三列研究CARD与用户新版21图标

- 研究首页改上方渐变图区+下方名称/五星CARD，星级对应已研究阶数。按用户最新要求固定三列，渐变紫/蓝/玫紫轮换、青色分隔与台座；48px素材通常显示96px，320窄屏显示48px保持整数倍与完整边界。
- 用户提供3列7行图集保存source-assets/research-icons-v3/source.png，Seedream分12+9两批完整透明拆图，21层合并统一64色32/48px与256px原画。原API层/响应/提示词保留，正式资源在dist/assets/research-icons-v3，包含manifest与三档comparison。21类含全部防御设施，首页与详情均换新图标。
- npm run check、test-research-wallet、preview-research-icons通过：21图标、320/390/1280固定三列无溢出、全部详情映射、105星及购买后点亮、零页面/资源错误。已查看源图、三档对照、320与390实际截图。仅本地未发布。

## 2026-11-03 本地：恢复空间彩虹、最低波点密度

- 用户放弃随时间变化的双色受光模型。实验页/掉落物surface同步改成盒体连续坐标完整彩虹色带，time仅平移色带；浅色间隙仍采用独立空间方向和反向节奏。保持有色环境亮度、掉落背面提亮、前表面高光、恒速倾斜旋转及掉落3倍动画速度。
- 共享preset仅改dots=3（当前滑杆最低），保持其他用户参数。同步HTML和无配置默认值。
- 实验页和掉落物真实Edge WebGL回归通过（新shader编译绘制、参数同步、刷新恢复、恒速移动、拾取和GPU重建），npm run check通过；查看更新掉落物截图。本地未发布。

## 2026-11-03 本地：研究首页13类赛博像素武器图标

- 按 pixel-icon-production Skill：内置image_gen图集、Seedream API 13透明前景层、共享64色32/48px及256px归一原画。v1原版保留，用户要求保持比例和卡通画风增加赛博设计，v2银白/石墨装甲、荧光绿/青能量细节。多参考生图长时间无输出，用户建议减少参考，改仅传v1图集后82秒返回。
- 源图、全部参考、最终提示词generation-prompt-final.txt和API缓存在source-assets/research-weapon-icons-v2；正式资源与comparison.png在dist/assets/research-weapon-icons-v2。lobby.js首页13类武器与详情标题使用v2原生48px，lobby.css整数显示pixelated且无图标滤镜。防御设施继续原图标。
- npm run check、test-research-wallet、preview-research-icons通过：13资源、全部分类与详情映射、320/390/1280布局无溢出、无页面/资源错误。已查看原画、三档对照与390实际页面。完整旧preview-lobby在开始战斗后导航隐藏断言失败，未声称全回归通过。本地未发布。

## 2026-11-03 本地：背面虹光提亮与吸附时恒速旋转

- 按用户要求直接提亮掉落物背面：图标与正面反光合成之前，背面彩色输出增益1.5倍、饱和度1.22倍，超范围按比例限制以保留色相；不更改实验页参数、前表面高光或全局后处理。
- 修复角度混入实时(x+y)*.005导致吸附速度抵消角速度：改为生成时固定angle初相+age*2.85，保留倾斜和3倍转速/变色。
- npm run check、健康/护盾逻辑回归与真实Edge掉落测试通过；新增位置改变不影响角度、移动同时推进age仍为2.85rad/s断言。查看更新截图。仅本地未发布。

## 2026-11-03 本地：统一彩虹盒参数与掉落动画3倍速

- 读取用户IAB可见控件确认实际参数：speed .15 / flowScale 3.05 / rimScale .75 / rimStrength 1.3 / dots 4 / white 1.8，白光与背面受光开启。写入dist/rainbow-box-preset.json。
- 本地server增加受限PUT /api/rainbow-box-preset，校验允许的控件类型范围；实验页调参自动同步项目JSON，游戏500ms读取共享配置，不再依赖另一浏览器的localStorage。重启4173服务生效。仍保留本机视角/暂停存储；静态环境可读取已保存JSON但无API时只在本机保存。
- 掉落物旋转 .95→2.85rad/s，颜色时间乘用户speed后再×3。实验页预览速度本身不改。
- npm run check、JS/server语法、health/shield逻辑回归、实验页WebGL保存恢复、掉落真实WebGL通过；断言shader uniform与实际preset逐项相符、修改项目配置后自动重新同步、旋转/颜色倍率均×3。测试恢复原preset。IAB工具本次后续刷新报browser.user unavailable，未能替用户刷新当前页，需用户刷新实验页/游戏加载新代码。本地未发布。

## 2026-11-03：保存全局“像素图标制作”Skill

- 用户认可9武器图集→Seedream拆图→像素滤镜的质量，要求保存参考物料与流程。已创建 C:/Users/Administrator/.codex/skills/pixel-icon-production/（界面名“像素图标制作”）。
- 保存用户风格参考、认可图集/提示词/三档对照、9个API透明层与相对元数据、27张正式图和manifest；未复制API凭据、签名URL或付费提交标记。内置Seedream helper及通用化pixelize_layers.py，可指定layers/out/sizes/colors，不依赖原项目运行离线处理。
- Skill quick_validate通过，离线复现27张PNG与认可版本逐像素一致，检查了链接与样例JSON无绝对机器路径/远程URL。仅整理Skill，无新付费调用。

## 2026-11-03 本地：怪物掉落改倾斜旋转彩虹盒

- 新增rainbow-pickups.js：现有怪物护盾/回血掉落物使用共享GPU四边形局部SDF绘制倒角立方体，固定双轴倾斜+随age旋转；盒内复用原蓝盾/绿心UI，图标保持朝向镜头，位于背面波点与正面反光之间，图标区域降低反光避免过曝。读取实验页已存材质参数，约500ms同步；不读取暂停/视角。
- game.drawEnemyBuffs仅提交原掉落列表；renderer.begin清队列，end透明物之后绘制，深度测试保留，GPU重建时重建资源。原掉率、吸附、回血+1、临时无敌2秒不改，未改变地块产物/现金。
- npm run check、test-health-drops、test-enemy-buffs与真实Edge preview-enemy-buffs/preview-rainbow-pickups通过；检查两类图标、旋转像素差异、GPU重建、实际吸附获益、零页面/GL错误。已查看游戏及放大截图。仅本地未发布。

## 2026-11-03 本地：9武器图集→Seedream拆图→像素滤镜

- 按用户参考卡通工具画风，原生imagegen生成一张3×3图集（剑/手枪/步枪各3款）。源图与完整提示词在 source-assets/weapon-icon-study-v1/。
- 使用项目 seedream-decompose API 实际拆出背景+9个完整透明武器层，原始层、脱敏请求、响应、layers元数据都缓存于该目录layers/。保留命名与bounding_box；未使用本地网格裁切或阈值抠图。
- tools/pixelize-weapon-study.py 消费API透明层，按已有alpha测边、等比归一256画布（主体最长208），生成32/48px版本，统一64色、无抖动、二值alpha；dist/assets/weapon-icon-study-v1/含27张图和manifest、原始图集。API原层不覆盖。
- ui-color-lab顶部新增9物品Grid，原画/48/32即时切换，像素版本以96px整数倍显示，无后处理；支持选中与展开源图。早期试画对照保留在下方。
- npm run check、独立JS语法、旧样板与新增preview-weapon-icon-study真实Edge测试通过（9图片/三档原生尺寸/选中/1100与390与320无溢出/源图加载/零页面资源错误）。已查看1100和390截图及全9图三档QA图。本地未发布。

## 2026-11-03 本地：彩虹盒子参数保存与Scale/Rim控件

- 新增流光Scale(.1–6)、Rim范围(.1–4，越大越宽)、Rim强度(0–3)；Rim与白光强度独立计算，白光开关同时控制前表面两项。流光Scale只改盒体连续色带频率，不改波点密度/速度。
- 独立localStorage键rainbow-box-lab.settings.v1自动保存全部材质控件、视角/缩放、暂停；加载验证类型/范围，存储不可用降级提示。移动端面板限高可滚动并上移预览。
- npm run check、JS语法与真实Edge WebGL测试通过：三新滑杆像素变化、调参/开关/暂停刷新恢复、原亮度单调/旋转/布局；已查看390截图。仅本地未发布。

## 2026-11-03 本地：参考玫红弯刃风格试画

- 根据用户参考继续Aseprite后台Lua原生绘制：上弯刀尖、酒红/深紫轮廓、玫红刀身、橙黄刃口、紫色钩形护手。tools/draw-item-rose-saber.lua；32×32，实际13色、二值alpha、透明安全边。分层源与8倍检查图在 source-assets/ui-item-aseprite/rose-saber-v1.*；网页PNG在 dist/assets/ui-item-aseprite/rose-saber-v1.png。
- 样板顶部改为上一版原生短剑与新弯刃32/64/96px对照，保持无后处理；上一版素材保留。
- npm run check、preview-ui-color-lab真实Edge三尺寸回归通过；额外检查4预览原生32px、alpha和透明外边，已查看新对照截图。本地未发布，全程未操作前台。

## 2026-11-03 本地：背面双色受光插值

- 依据用户观察试作双色模型：背面改为两个全局随时间变化的亮/暗颜色端点插值，方向受光控制权重；不再使用空间全彩虹乘近黑系数。暗色保留青/紫/绿等色相，波点与间隙用独立连续坐标节奏调制插值权重。正面白光/Rim未改。此为截图近似假设，非确认原Shader。
- npm run check、独立JS语法与真实Edge WebGL回归通过（暂停、背面受光对照、白光0/1/3单调、三视角、桌面/手机）；已查看新版桌面截图。仅本地未发布。

## 2026-11-03 本地：Aseprite 后台原生像素试画

- 用户要求避免屏幕绘制占用电脑，改用本机 Aseprite --batch + Lua。tools/draw-item-sword.lua 绘制32×32短剑，14个不透明颜色、二值alpha、无抗锯齿；分层源文件 source-assets/ui-item-aseprite/short-sword-v1.aseprite，原生PNG在 dist/assets/ui-item-aseprite/short-sword-v1.png。含8倍检查图。
- ui-color-lab 顶部增加上一版64px与原生32/64/96px并排对照；独立于#viewport后处理区域，整数倍清晰显示。原8图标保留用于对照。
- npm run check、preview-ui-color-lab真实Edge三尺寸与原交互通过；额外确认原生宽32、整数显示比例、无滤镜，14色和0/255透明度；已查看对照截图。本地未发布，未操作Aseprite前台。

## 2026-11-03 本地：背面方向受光压暗

- 按用户观察将暗部归于背面受光方案实现：背面虹彩乘固定世界方向光 Lambert（沿原外法线）与低环境项，背光面明显压暗；正面白光/Rim及强度计算保持原样。新增背面受光对照开关。此为参考效果的可验证实现，并非确认原游戏Shader。
- npm run check、独立脚本语法、真实Edge WebGL测试通过，新增背面受光开关亮度差异断言，原白光强度/暂停/三角度/手机布局检查继续通过；已查看更新桌面截图。仅本地未发布。

## 2026-11-03 本地：移除样板波点与像素物品网格

- ui-color-lab 移除波点四版区、纹理开关及 shader 波点逻辑，保留原渐变受光。新增8个独立透明PNG：短剑、手斧、重锤、护盾、生命药水、金色晶簇、秘境钥匙、补给宝箱。原生 imagegen 分别生成，短而饱满比例、像素阶梯轮廓，资源在 dist/assets/ui-item-study/。
- 页面新增响应式Grid（桌面8列/中屏4列/手机3列）、48/64/80px切换与单选预览。未写游戏存档。
- npm run check、样板两脚本语法和 preview-ui-color-lab 真实Edge测试通过；覆盖1440/390/320无溢出、8张图片加载、尺寸切换、选中及原交互，零页面/资源/GL错误；已查看桌面和390截图。本地未发布。

## 2026-11-03 本地：规则波点、白光强度与独立底色虹彩

- 波点恢复方格 Cell 规则排列，直径约96%点距。新增白光强度0–3倍滑杆与读数，保留开关。浅色间隙采用独立空间方向与反向0.57倍速虹彩，保持浅色，不再与波点固定相位同步。
- 窄屏按宽度适配盒体，控制栏充分利用屏宽。npm run check、WebGL编译渲染、白光0/1/3倍亮度单调、读数、暂停、三角度高光及桌面/390布局测试通过。仅本地。

## 2026-11-03 本地：盒体彩虹场与加强前表面白光

- 彩虹 phase 统一使用盒体 object-space 连续坐标，与波点单元/密度解耦，去掉逐点径向色相；波点改交错紧密排列，直径约96%点距。
- 正面使用随视角移动的柔光高光 + 不依赖场景灯的白色 Fresnel/基础发光项，提高每个观察角度的前表面可读性。
- npm run check、真实 Edge WebGL 编译/绘制、变色暂停、三个旋转角度高光开关像素差异、桌面/手机布局通过，已查看截图。本地未发布。

## 2026-11-03 本地：彩虹盒子倒角与正反面材质

- rainbow-box-lab 改为 SDF 圆角闭合立方体，分别求前后表面。背面波点使用连续 UV 与点内灰度轮廓采样彩虹，倒角混合投影；正面透明叠白色镜面高光及 Fresnel，移除纯白描边。
- npm run check 和真实 Edge WebGL 测试通过；测试含动画推进/暂停、高光开关像素差异、桌面和390布局、零页面/GL错误；查看更新截图。本地未发布。

## 2026-11-03 本地：彩虹盒子空场景

- 新增 rainbow-box-lab.html/js，独立 WebGL 空场景，五面内侧盒子、程序波点、时间驱动彩虹渐变、菲涅耳/高光与边线；支持旋转、缩放、流速、密度、暂停和高光开关。按截图近似重建，未获得 Unity 原纹理/自定义函数；当前直角。
- npm run check、独立 JS 语法与 preview-rainbow-box.cjs 真实 Edge WebGL 编译渲染、桌面/390布局、零页面/GL错误通过，已查看桌面截图。仅本地，未发布。

## 2026-11-03 本地：包边局部明暗

- solid-ui-lab 常亮边界叠加7站点渐变光照遮罩，局部较亮、局部柔和变暗，保留连续轮廓；独立流光不受遮罩影响。保持此前低亮度预算。
- npm run check和脚本语法通过；Edge检查遮罩、独立流光及390方形无溢出，零页面错误。本地未发布。
## 2026-11-03 本地：减弱常亮包边

- 按反馈将包边亮线2→.9px、透明度.95→.36，核心.8→.45px、透明度.95→.22；彩色扩散6→2.5px、透明度.65→.18。移除边界与流光共用的强柔光，包边仅留低强度2px光晕，流光独立保留高亮。
- npm run check和脚本语法通过；Edge零页面错误，截图检查。本地未发布。
## 2026-11-03 本地：整圈常亮边界并保留流光

- solid-ui-lab 将弱轮廓替换为三层持续发光边界（彩色扩散、青白亮边、细白核心），流光独立叠加额外柔光；常亮边界与高亮流光分别开关，暂停动画后整圈亮边继续显示。
- npm run check、独立脚本语法通过；Edge验证三层边界、两组独立开关、暂停与390方形布局，零页面错误；查看截图。本地未发布。
## 2026-11-03 本地：高亮边际流光

- solid-ui-lab 在裁切外的shell叠SVG折角路径，用14段渐强白色短弧组成渐隐拖尾，4.2秒绕边循环，双层drop-shadow产生边缘柔光；ResizeObserver同步精确12px折角尺寸，视频/方形/窄屏适配。高亮流光开关、统一暂停及减少动态偏好生效。
- npm run check与独立脚本语法通过；Edge检查offset运动、开关、暂停、390方形路径尺寸及减少动态偏好，零页面错误；已查看实际截图。本地未发布。
## 2026-11-03 本地：两种简约场景背景

- solid-ui-lab 新增 solid-ui-background.css/js：深紫星空（淡行星轮廓/底部远景暗纹）与深蓝星屑（柔和蓝青渐变/低对比五角星），稀疏固定星点，中央留白；可切原始黑底。纯CSS/DOM无图片依赖，背景静止不与卡片流动争抢。
- npm run check及两独立脚本语法通过；Edge检查两背景、黑底对照、卡片可见、320/390布局无溢出，零页面/资源错误；已查看两种桌面截图。本地未发布。
## 2026-11-03 本地：色块外柔和背光

- solid-ui-lab 在折角裁切外增加 panel-shell，两层同色渐变模糊背光（32/72px，透明度.44/.2），随起终色变化；柔和背光开关可对照。保持卡片本身清晰，兼容比例切换。
- npm run check与独立脚本语法通过；Edge检查开关、配色同步、320/390正方形布局，零页面错误，已查看蓝紫截图。本地未发布。
## 2026-11-03 本地：参考图柔和装饰曲线

- solid-ui-lab 添加4条平行圆滑阶梯曲线，右侧浅薄荷白向内渐隐，细线无硬折角，9.5秒微幅漂移；支持柔和曲线开关与统一暂停/减少动态偏好。重启4173本地服务，调用Codex打开测试页（queued）。
- npm run check与独立语法通过；Edge检查曲线开关、暂停、两配色与390正方形无溢出，零页面错误；已查看蓝紫截图。本地未发布。
## 2026-11-02 本地：波点与色面协调

- 按截图反馈调整 solid-ui-lab：波点半径2→1.2px、间距18→22px，局限右下椭圆遮罩渐隐，中央文字区域留白；保留独立实色填充，蓝紫配柔紫、黄绿配草绿，循环7→12秒。色面辅助色收拢至邻近色相，透明度上限.7→.52。
- npm run check与独立脚本语法通过；真实Edge检查遮罩、运动/暂停、黄绿点色、390布局，零页面错误，已查看蓝紫截图。本地未发布。
## 2026-11-02 本地：纯色运动波点层

- solid-ui-lab 在色面与文字之间加入实色波点（18px间距、2px半径），normal混合/不透明，按整周期斜向平移无缝循环。蓝紫配紫色点、黄绿配橙色点，支持点色选择与波点开关，随图形流动暂停、后台及减少动态偏好暂停。
- npm run check/独立脚本语法通过；真实Edge检查运动、暂停、开关、配色、390宽无溢出及减少动态偏好，零页面错误；已查看蓝紫截图。本地未发布。
## 2026-11-02 本地：随机构图改递归空间分割

- solid-ui-lab 去除四角固定模板，改为按面积加权抽取区域、随机角度/比例半平面裁剪，再随机合并兄弟分区；小于1700面积的细碎区域拒绝。随机保留底色，色面配色/透明度及动画时长/相位独立抽样；仍仅多边形，无圆环/线条。
- npm run check与独立脚本语法通过；真实Edge连续40组均唯一，本次可见面数量5–11，检查有限顶点、动画数量无累积、暂停、390正方形与黄绿配色通过，零页面错误；查看两组截图。本地未发布。
## 2026-11-02 本地：动态构图仅保留色面

- 按用户要求移除 solid-ui-lab 内部圆环和折线，只保留4组随机多边形色面流动；沿用配色、随机构图与暂停。
- npm run check及独立脚本语法检查通过。本地未发布。
## 2026-11-02 本地：内部随机矢量动态构图（替代散块）

- 按用户澄清移除12块散开方案。solid-ui-lab 改为面板内10组SVG图形：随机斜切色面、圆环、折线，缓慢平移旋转，裁切在固定折角轮廓内，文字保持稳定。随机构图按钮重建布局，图形流动可暂停，蓝紫/黄绿联动配色。
- npm run check、独立脚本语法通过；Edge验证流动、暂停、连续10次随机重建无动画累积、配色、390正方形及减少动态偏好，零页面错误；已查看蓝紫截图。本地未发布。
## 2026-11-02 本地：折角渐变面板切块动画

- solid-ui-lab 加入12块错位散开、短暂停留、回弹拼合，渐变/黑字随原位置切片；保留折角和项目滤镜，播放后移除临时节点。提供按钮重复播放，兼容正方形/手机与减少动态偏好。
- npm run check与脚本语法通过；Edge检查12块生成、回收、重复播放、390宽正方形及减少动态模式，零页面错误。本地未发布。
## 2026-11-02 本地：UI样板波点四版比较

- ui-color-lab新增原版暗点、半透明白32%、纯白、互补对色72%并排样板，点击应用到整页；默认半透明白，沿用原动态点径与后处理。
- npm run check、两份样板JS语法、preview-ui-color-lab真实Edge检查通过，覆盖四方案像素差异、三尺寸及原交互；已查看1440截图。本地未发布，未手机实机验收。

## 2026-11-02 本地：黑底纯色 UI 测试

- 新增 solid-ui-lab.html/js：偏黑背景、440×247.5 淡紫纯色面板，复用项目默认后处理；可切商品正方形、底色、边缘质感及滤镜对照，不保存游戏设置。
- npm run check、独立脚本语法通过；真实 Edge 无头浏览器检查滤镜挂载、开关与390宽无横向溢出，零页面错误；已查看1280截图。本地未发布。

## 2026-11-02 本地：修复空地块拖拽绿色预览消失

- scopeLoops 仅对防御塔调用 attackRange；空地块没有设施 defs，原先无条件查询射程抛异常，中断 drawGround 后面的半透明绿/红预览。保留原颜色、透明度及放置判定。
- 新增 preview-floor-placement.cjs，真实 Edge/WebGL 覆盖四种地块有效绿色/无效红色半透明绘制、取消拖拽及零页面/GL错误，已查看截图。npm run check、test-tower-range、preview-tower-placement-range 通过。既有 preview-first-drag 长时间无输出后手动终止，未计为通过。本地未发布，未手机实机验收。

## 2026-11-02 本地：主菜单跟随所选难度音乐

- syncMusic在主菜单读取selectedDifficulty对应专辑，战斗读取activeDifficulty；主菜单允许播放，切换难度同步曲目，角色/研究页保持播放，进入对应战斗不重载同曲。
- 主菜单首次点击调用现有unlockAudio，适配浏览器交互解锁；保留音量/静音、暂停、后台和跨页面播放所有权规则。五个难度src目前仍为空，继续回退现有relentless-minor.mp3，不伪造独立曲目。
- npm run check、难度专辑/播放所有权单元测试及真实Edge菜单音乐检查通过，覆盖真实本地音频切换、首触解锁、菜单/研究/战斗续播、暂停返回、静音、失焦与空曲目回退。本地未发布。

## 2026-11-02 本地：赛博连体导航、主菜单下移与属性说明收起

- LOGO与难度面板在普通高度下分别下移至可用区域8%/27%；短屏单独压缩唱片并调整位置，保持难度卡不遮挡导航。
- 底栏改为赛博切角、横向图标文字，字体18px/窄屏17px、图标32px/窄屏28px；保留橙黄/蓝青/紫粉底色。三个TAB无间距相连，去掉外层底座/边框/内边距并紧贴屏幕底部；选中项宽度权重1.25、高72px，未选中59px且压暗。安全区计入按钮底板和文字内距。
- 原属性加点的详细说明每次打开默认收起，可用“显示说明/收起说明”切换。升级技能点费用字号从10px提升至17px，窄屏16px；购买/保存逻辑保持。
- npm run check、旧属性回归与真实Edge/WebGL preview-lobby通过；覆盖研究购买/存档、说明开关、成本字号、三视口、主菜单与战斗往返，已查看实际截图。本地未发布，未手机实机验收。

## 2026-11-02 本地：导航改为彩色底板

- 按用户参考修正“彩色”含义：出战橙黄、角色蓝青、研究紫粉的大面积渐变底板，带圆角、高光、细点纹理与底边厚度；图标文字恢复浅色，不再使用彩虹字。
- 选中底板明亮并轻微发光，未选中整体压暗但保留各自底色。三栏顺序与原功能保持。
- npm run check、真实Edge/WebGL preview-lobby通过，已查看390实际彩色底板截图；本地未发布。

## 2026-11-02 本地：三栏彩虹导航

- 用户调整为仅“出战、角色、研究”三栏，移除天赋入口；出战保持最左。底栏三等分，键盘左右切换同步适配三栏。
- 三个入口的图标和文字均使用彩虹渐变。选中项高亮发光并显示彩虹指示条，未选中项保留彩虹色相并压暗。
- npm run check、preview-lobby真实Edge/WebGL通过：导航、21分类网格、研究购买/保存、旧加点、三视口与战斗往返；已查看彩虹导航截图。本地未发布，非手机实机。

## 2026-11-02 本地：四栏菜单与研究技能树

- 底部导航左起“出战、角色、研究、天赋”。出战沿用现有难度选择；角色复用13项属性加点，保留保存/重置及未保存提示；研究以3列网格列出13类武器和8类防御设施；天赋仅保留明确的未开放页面。
- 点击分类打开五阶向上技能树弹窗：第一阶在底部、第五阶在顶部，显示已研究/可研究/未解锁、详细效果、费用与当前余额。支持滚动、关闭、Esc和焦点循环。进入战斗隐藏菜单，暂停返回主菜单恢复。
- 用户确认共用现有技能点逐阶研究。临时单阶费用20/40/80/140/220；余额和研究阶位在主加点存档的同一次写入中保存，再同步专精效果。前置/余额/重复购买/过期草稿均校验；角色属性重置不返还研究投入。旧存档兼容。
- 新增lobby.js/lobby.css、test-research-wallet.cjs、preview-lobby.cjs。npm run check、旧加点、研究钱包、专精效果、难度/音乐及启动加载回归通过；真实Edge/WebGL验证21分类、技能树购买与刷新、三个视口、导航/战斗往返和零页面/GL错误。已查看出战、研究、角色及树弹窗截图。本地未发布，未手机实机验收。

## 2026-11-02 本地：启动资源加载进度条

- 首页静态加载遮罩在引擎执行前可见；hex-loader 按引擎、21 个扩展模块、宣传模块及三组角色/水果模型贴图的实际完成任务更新百分比与状态，准备完成后关闭。百分比表示任务完成比例，非下载字节比例。沿用角色加载器原有失败回退行为。
- 失败保留进度并显示错误与重新加载按钮；未增加人为等待。新增 loading.css 与 preview-resource-loading.cjs。
- npm run check、真实 Edge/WebGL 加载回归通过：阻塞猫模型时进度可见、320/390/1280 布局、100% 完成、引擎503失败及按钮重试；已查看加载截图，正常启动零页面/GL错误。本地未发布，未手机实机验收。

## 2026-11-02 本地：21 类五阶专精效果接入

- 根据 `outputs/progression-design/防御塔与武器分类增强候选.csv` 接入 21 类、105 节点的战斗效果，新增 `specializations.js` 与可供未来 UI 读取的 `specialization-catalog.js`。按整轮判定概率多发/弹射/电链/气刃与爆炸，保留原武器 Tier、进化和配色；易伤、电击减速、燃烧、再生与设施生产/修理已接入。
- 霰弹枪塔四阶攻击射程 260→338，选敌、弹丸寿命、攻击范围提示同步；辅助施工保留有效进度，避免半速辅助线因主线先完成而无法结束。共享常驻网格规则保持。
- 正式技能树 UI、购买和解锁流程未接。默认 0 阶，独立本地存储。`?dev=1&spec=5` 全五阶；`?weaponlab=1&dev=1&spec=5` 武器测试；`?electriclab=1&dev=1&spec=5` 地块测试；`?dev=1&spec=0` 关闭。接口与验证细节见 `design/specializations.md`。
- npm run check、新增 test-specializations、防御塔、更多塔、钟表/修理、39 型武器进化、旧加点回归通过；真实 Edge/WebGL 验证39型号、三视口、GPU 重建与本地保存，零页面/GL错误，已查看效果截图。本地未发布，非手机实机。
- 完整 npm test 停在既有经济池断言 `fixed enlarged pool 1`。内存撤销本次全部 game.js 改动后仍复现，日志 `tests/specializations-baseline.log`。未改动无关经济池预期。

## 2026-11-02 本地：修复100%竖缝仍像圆瞳

- 原实现只压窄内层黑色core，外层瞳色区域一直是圆形，使用深色瞳色时外观仍像圆瞳。改为整个可见瞳孔（瞳色区域及内层黑瞳）一起收窄，100%横向宽度为圆形的12%，保留竖向尺寸、眼白、无高光及追踪偏移。
- npm run check、preview-eye-panel、preview-eye-shape通过。新增有色和纯黑两组GPU轮廓回归：100%完整可见瞳孔从约202×202变为24×202；实际猫模型深色瞳孔0/100%切换有727像素变化，已查看开启后处理的黑色竖缝截图。测试修复CharacterEyes加载早于CatPlayer引起的等待表达式竞态。本地未发布，非手机实机验收。

## 2026-11-02 本地：敌人生命回复掉落

- 有效普通击杀同一随机池：护盾6%、生命6%、其余不掉临时增益；护盾概率/宝箱规则保持。生命掉落复用178.125匀速、30吸收半径、60尺寸平面图标与同关清理。
- imagegen制作pickup-health-green.png，绿色六边形边框、白色爱心/绿色加号；背光与0.25秒圆柱拾取效果使用绿色调。
- 实际拾取回复1点生命且不超过上限，闪烁跟随跳字“生命 +1！”，满血显示“生命已满”，死亡不复活，播放medical拾取音。预览页增加掉落类型选择。
- npm run check、test-health-drops、test-enemy-buffs、test-enemy-chests、preview-health-drops、preview-popup-lab通过，已查看真实Edge/WebGL游戏截图，零页面/GL错误。逻辑测试覆盖击杀去重/概率分流、暂停、吸收回血、上限/满血/死亡及绿色特效。本地未发布，未手机验收。

## 2026-11-01 本地：去掉眼睛高光，眼白颜色和猫眼竖缝控制

- 按用户要求移除猫眼程序高光。CharacterEyes新增whiteColor（默认#f2f2ed）和slit（0–1）配置，沿用既有存储键，旧颜色/大小设置兼容；暂停面板增加“眼白颜色”“猫眼竖缝程度”，按角色实时生效、保存与刷新恢复。
- 猫和狐狸共用characterIris GLSL；圆形虹膜保留颜色与尺寸，中央黑瞳从圆形逐步收窄、竖向延长成猫眼竖缝，追踪UV偏移独立。兔子原图集眼睛仍未拆分。暂停卡片高度受限并可滚动，避免新增控件挤出屏幕。
- npm run check、preview-eye-panel、preview-cat-eyes、preview-eye-shape通过；真实GPU读回竖缝0/50/100%黑瞳宽高分别76×76、42×106、8×136，眼白指定RGB读回误差<=1，无额外白高光，零GL错误。已检查游戏截图。本地未发布。

## 2026-11-01 本地：关卡结算即时清理敌人护盾掉落

- beginStageClear 在进入结算前清空 enemyBuffs，避免护盾停止吸附后仍显示至下一关；不为未拾取护盾授予效果。
- test-enemy-buffs 新增战斗/生存结算清理及无残留绘制回归。npm run check、test-enemy-buffs、test-settlement 通过（mock 渲染，非实机视觉验收）。本地未发布。

## 2026-11-01 本地：清除基础镜头对地图尺寸的历史依赖

- 追踪调用链：post-process的cameraSize保存值由hex-map写入cameraScale，但renderer基础视野历史上使用columns*tile/2，存在早于本轮修改的隐藏耦合；此前固定13列仅恢复尺度，仍保留地图单位写法。
- 改用独立CAMERA_BASE_HALF_WIDTH=351世界单位，基础视野完全不读取地图列数或格子尺寸，用户cameraSize及屏幕比例适配照常生效。当前镜头数值不变。
- npm run check及preview-portrait-boundary真实Edge/WebGL通过，halfX=351，9×19边界与纵向投影正常，三视口零GL/页面错误。本地未发布。

## 2026-11-01 本地：恢复地图改向前的镜头取景

- 上次columns从13改9，renderer.resize仍用LIFT_MAP.columns算halfY，导致视野缩至9/13、画面放大13/9。新增独立CAMERA_FRAME_COLUMNS=13恢复原取景尺度，9×19可玩边界保持。
- npm run check、preview-portrait-boundary真实Edge/WebGL通过：390下halfX=351（原13列镜头），171格边界、投影仍纵向、320/1280零GL/页面错误。本地未发布。

## 2026-11-01 本地：修正地图实际边界仍横向且偏小

- 按用户后续反馈，将固定玩法边界从13×11改为9×19（171格），同步renderer取景、game派生grid与随机生成候选范围（x±4/y±9）；AGENTS固定尺寸约定同步更新。仍不随屏幕尺寸改变地图范围。
- 取消上次纵向配方32格上限及主体x±2限制，恢复32–85目标规模与半径2岛屿规则；中心允许沿y±7分布，刚性居中搜索适配19行，配方升为7。
- npm run check、100种子test-terrain-seed、test-hex-city含移动通过。新增preview-portrait-boundary真实Edge/WebGL验证grid 9×19/171、390投影地图宽195高404（确实纵向），320/1280视口零GL/页面错误；已查看tests/portrait-boundary-390.png。本地未发布，未手机实机验收。

## 2026-11-01 本地：重新绑定拆眼版猫，动态瞳孔与面板生效

- 使用23:16:38更新的355136字节NeonTowerCat_EyeModified.fbx，包含R_Eye/L_Eye各19顶点及身体2111顶点。复制到source-assets/player-cat，旧工程源文件备份为NeonTowerCat_PreEyes.blend。tools/rebind-cat-eyes.py重用原17骨架和动作，身体最近顶点复制原权重（最大距离2.4e-6模型单位），两眼100%绑定head；赋独立NeonCat_DynamicEye材质。
- 项目NeonTowerCat_Rigged.blend与dist/assets/player-cat/cat.json更新；两眼UV归一化并修正镜像方向，保持14-float布局，用19/20标记独立眼睛（17/18围巾标记仍保留），颜色/深度/阴影/自发光统一映射到head。瞳孔按CharacterGaze朝目标移动，支持CharacterEyes面板“瞳色”“瞳孔大小”及按角色保存。颜色为虹膜，中央保留黑瞳和白高光。
- Maya可导入的新绑定文件另存于C:/Users/Administrator/Documents/maya/projects/default/scenes/Cat/NeonTowerCat_EyesRigged.fbx，原用户导出文件不覆盖；该FBX含基础材质预览，动态眼睛shader和面板效果在游戏运行时实现。Blender重新导入确认17骨架、两眼19顶点、head单一100%权重及独立材质。
- npm run check、preview-player-cat、preview-eye-panel、preview-cat-eyes、preview-cat-depth通过。真实Edge/WebGL读回：瞳孔左右位移约19像素、上下24像素，大小25%→80%着色面积900→9234像素；面板颜色/大小与持久化、原运动/坐骑/上下文恢复、眼部遮挡及静态缓冲复用均通过。已检查游戏截图。本地未发布，非手机实机/Maya应用验收。

## 2026-11-01 本地：猫独立眼睛材质等待完整眼睛导出

- 用户提供NeonTowerCat_EyeModified.fbx，最初40400字节只有骨架/空节点，polySeparate历史导致网格导出失败。用户重新导出后，22:53:35版本440864字节包含NeonCat:Body(1578顶点)、NeonCat:EarPhone(571顶点)及骨架，但仍无R_Eye/L_Eye；通过FBX二进制Objects/Connections确认只有2个Mesh Geometry，不是Blender漏读。旁边NeonCat.ma(22:30:50)可读到R_Eye/L_Eye及对应Shape，已请求用户一并导出眼睛；没有拿不完整版本替换游戏猫。
- 新增dist/character-eyes.js，暂停面板瞳色/瞳孔大小(15–90%)，按cat/fox/bunny分别保存；选择角色同步控件。狐狸现有眼材质已消费对应uniform。猫的材质绑定待眼网格到齐；兔子仍待眼区域拆分。当前控件准备不代表猫眼效果完成。
- npm run check、preview-island-players通过；新增preview-eye-panel验证面板颜色、大小及刷新持久化。本地未发布。

## 2026-11-01 本地：再次同步更新后的猫手绘贴图

- 重新读取同一Maya手绘路径，采用21:40:42更新、255343字节的最新版JPG，替换项目源贴图、Blender打包图片和游戏cat.png。来源及复制品SHA256一致，texture-source.json已更新。
- npm run check、preview-player-cat真实Edge/WebGL通过，已查看更新后截图。本地未发布。

## 2026-11-01 本地：猫贴图换为Maya手绘版本

- 按用户指定使用maya/projects/default/sourceimages/3dPaintTextures/NeonCat/tripo_image_9426549d-46ae-4d5b-8128-528e2d54c21e_0_0.jpg（1024×1024）。原样复制为source-assets/player-cat/NeonCat-painted.jpg，SHA256与原图一致；在项目NeonTowerCat_Rigged.blend中替换材质图像并打包，更新dist/assets/player-cat/cat.png。texture-source.json记录来源和校验。
- 模型、UV、骨架和动画不改；源Blender更新后再次运行export-player-cat.py也会导出新贴图。npm run check、preview-player-cat真实Edge/WebGL通过，已查看游戏截图。用户原Maya贴图未修改，本地未发布。

## 2026-11-01 本地：狐狸、兔子加入主角选择

- 暂停菜单主角模型新增fox/狐狸、bunny/兔子，支持?avatar=fox/bunny和本机记忆，猫/机器人完整保留。新增tools/export-island-players.py，转换迁入资产的网格/贴图、骨架、原Idle/Running旋转重定向采样；dist/island-players.js用压缩3x4骨骼uniform做GPU蒙皮，颜色/描边/法线深度/阴影/自发光遮罩全部共用姿态，静态几何首次上传及上下文恢复时重建。
- 头部沿用朝镜头和pitch/roll；狐狸独立眼睛材质绑定CharacterGaze屏幕视线，白纹理回退。兔子保留原图集眼睛，独立瞳孔追踪仍待材质拆分；新角色当前使用导入的待机/跑步动画，尚未接猫的落地脚掌IK、手部握枪IK或专用坐姿。坐骑仍跟随角色高度。衣服装备不额外叠加通用护甲块。自发光滑条改名“角色自发光”，沿用原值和存储。
- npm run check、preview-island-players真实Edge/WebGL验证四角色实际显示、菜单选择及保存；已查看狐狸/兔子截图。本地未发布，非手机实机验收。

## 2026-11-01 本地：狐狸/兔子平面视线映射准备

- 用户明确要求头朝镜头、眼睛按敌人屏幕方向移动。新增dist/character-gaze.js：与drawHeldWeapon共用最近可攻击目标，将玩家与目标地面位置通过当前VP及视口宽高比投影为屏幕方向；18/s平滑、无目标回正、暂停时间冻结、死亡清空目标，不修改头部姿态。
- 移植IslandDefenderCatEyeUV的UV瞳孔函数characterEyeColor和狐狸材质参数（size .676，travel .55，movementRange .2），支持UV镜像轴修正；source-assets/island-characters/gaze-migration.json记录配置。原狐狸眼白贴图缺失，用白色底色可回退；兔子迁入材料只有身体图集shader，独立眼睛材质尚需拆分。
- 这是运行时视线控制器和眼睛GLSL准备，不宣称狐狸/兔子已加入游戏角色菜单或完成眼材质绑定；现有猫眼贴图保持不变。
- npm run check及preview-character-gaze真实Edge/WebGL通过：实际选敌右/左/上方向、无敌人回正；GPU读回瞳孔质心验证四方向/对角/超限clamp，误差小于1像素。无页面或GL错误。本地未发布。

## 2026-11-01 本地：迁入狐狸、兔子外观源资产

- 按用户指定从TreasureIsland6000/Assets只读复制FoxRigged.fbx、BunnyRigged.fbx及5材质/3贴图/2Shader/待机与跑步FBX/原Prefab参考和meta到source-assets/island-characters，保留Assets相对结构。32文件共约4.24MB，逐项SHA256与来源一致；manifest.json记录依赖与缺失项。原Unity项目未修改、未打开Unity。
- Blender磁盘导入确认狐狸29骨骼/4221顶点、兔子25骨骼/5205顶点，均有肩/上臂/前臂/手腕；另保存fox-imported.blend、bunny-imported.blend，颜色贴图已重定位到复制品并打包。Idle为1–60帧，Running为1–22帧，尚未重定向或接入游戏。现有猫/机器人保留。
- 狐狸眼白材质引用GUID 2baf78b5e60fc7947abd4344ef5aa3bb在原项目缺失；瞳孔fx_circle已复制，Unity眼睛自定义Shader保留待后续WebGL转换。Prefab为参考快照，脚本、继承Prefab和AI依赖未迁入，不宣称可独立运行。
- tools/import-island-characters.py为可重复的只读源资产迁移脚本，inspect-island-characters.py用于Blender导入检查。未进行Unity验收（按来源项目常驻规则），未发布。

## 2026-11-01 本地：自发光不再被AO/阴影后处理压暗

- 按用户要求逐项检查后处理。猫颜色通道已含自发光，但scene-occlusion最终合成仍对它统一乘AO/阴影暗度。新增半分辨率selfLight遮罩，与gbuffer共享深度附件，用LEQUAL仅绘制可见猫表面，记录自发光强度；AO合成按1-selfLight衰减压暗。保持正常深度遮挡，猫继续投射阴影；不改全局AO/阴影强度，不重复上传网格。
- npm run check、preview-cat-postfx真实Edge/WebGL通过：最强AO/阴影下，自发光100%的2667个内部采样像素颜色通道与AO合成后完全一致；50%仍有正常明暗。preview-scene-occlusion通过（场景AO、阴影方向、缓存、视口缩放及上下文恢复）。已查看开启全部后处理的游戏截图，本地未发布，非手机实机验收。

## 2026-11-01 本地：猫穿衣服不再叠实体护甲外观

- 用户反馈调高自发光后身体仍黑。复现确认黑色为旧drawEquipmentModels叠在猫身体前方的衣服护甲板；按用户澄清，猫模型跳过衣服的胸前护甲、肩块和能量护甲实体徽标，保留衣服属性/技能、范围环和护盾效果，原机器人外观完整保留。猫本体自发光不变。
- 放弃了临时护甲自发光方案，renderer没有保留额外材质标签。npm run check、preview-cat-clothes真实Edge/WebGL通过：全部12种衣服在猫上不绘制方块护甲，猫/机器人装备属性相同、渲染不修改属性、原机器人仍有护甲外观、GL错误0。已查看穿黑色风衣后的猫截图。本地未发布，非手机实机验收。

## 2026-11-01 本地：猫接机器人落地IK、头部倾斜及自发光

- cat.json新增bind骨骼头尾位置；猫的thigh/shin/foot蒙皮矩阵直接映射现有playerBipedLegPose的髋/膝/世界脚掌接触点，双脚保留地面支撑、距离触发迈步、抬脚及停止归位规则。骨架腿长按解算结果拉伸，身体跟随髋高；坐姿保留坐骑姿态，站立坐骑不走步。
- 头部接入机器人pitch/roll弹簧，颈部固定；静止脸正对58度镜头，移动不随运动方向转头。颜色、描边、AO/阴影共用同一组蒙皮矩阵；拉伸法线用余因子变换。猫血条上移24世界单位，避免遮住朝镜头的耳朵。
- 新增贴图自发光，默认45%，暂停菜单“猫自发光”可调0–100%并保存；与角色头顶点光独立，保留眼睛/耳机的深色贴图细节。原版机器人保留。本地未发布。
- npm run check、preview-player-cat及preview-cat-depth通过；新增preview-cat-ik真实Edge/WebGL覆盖30/60/120fps的双脚支撑及骨骼端点，误差<0.000001世界单位，头部颈点误差<0.000001模型单位，静止面向镜头且移动pitch/roll均生效；自发光独立画面读回亮度提升约51%、滑条与持久化通过。已检查游戏截图，非手机实机验收。

## 2026-11-01 本地：修复猫主角看似半透明

- 原因是猫只有颜色通道接入，未写入描边深度及AO/阴影几何通道，身后武器的背光轮廓会覆盖在猫脸上。新增 CatPlayer.renderGeometry，复用同一GPU蒙皮网格、动画矩阵及头部姿态，写入描边、法线/深度和阴影贴图；不重复上传顶点。
- npm run check、preview-cat-depth（真实Edge/WebGL：描边5583像素、AO1391像素，深度漏挡均0）、preview-player-cat（移动/9坐骑/切换/上下文恢复）、preview-character-outline及preview-scene-occlusion通过；后两项旧预览URL补dev=1并显式使用robot，修复调节面板隐藏引起的超时。查看修复后截图，脸部不再出现武器的竖向亮边。原版机器人保留。本地未发布，非手机实机验收。

## 2026-11-01 本地：耳机猫主角预览，保留机器人

- 新增 source-assets/player-cat/NeonTowerCat_Rigged.blend 与 tools/export-player-cat.py，离线导出原UV贴图、3权重蒙皮和17骨骼的待机/行走/坐姿采样矩阵。dist/cat-player.js 使用独立GPU蒙皮，网格只首次上传，后续更新骨骼uniform；WebGL上下文恢复自动重建。
- 默认耳机猫；暂停菜单“主角模型”可切换原版机器人并记住选择，URL ?avatar=cat / ?avatar=robot 可覆盖。原角色绘制完整保留，资源失败回退机器人。武器、装备、血条、受击闪烁/拾取闪光、坐骑升高沿用现有入口；猫头向俯视镜头抬起并接入头部pitch弹簧。
- 此为游戏内初步预览：猫用导出的步行动作，尚未将脚掌接到原角色落地IK；滑板腾空高度已跟随，滑板身体俯仰尚未同步；死亡碎片仍沿用原通用效果。未发布。
- npm run check、test-player-death、preview-player-cat（真实headless Edge/WebGL：移动、9坐骑、菜单切换与属性保留、选择持久化、上下文恢复、零页面/GL错误、静态网格不重复上传）及原preview-player-biped通过。已查看390截图，非手机实机验收。

## 2026-11-01 本地：随机地图改为纵向

- 种子配方升级为6：生成中心沿纵向分布，主体限制横向宽度，必要时沿上下分隔成两块岛；固定13×11范围不变。纵向房间预算上限32，仍保留半径2岛屿、细走廊及安全出生点。完整六角旋转与平移同步所有岛屿/走廊元数据，最终优先长轴纵向。
- npm run check、100种子test-terrain-seed（新增纵横比例>=1.15断言）、test-hex-city（含移动）通过。实际Edge/WebGL正常开始进入摆放，390截图已检查，零页面/GL错误；非手机实机验收。本地未发布。
- 旧preview-campaign-islands等待HexMap.ready（当前为false）会挂起；改为等待已加载模块。

## 2026-11-01 本地：护盾贴图纯蓝边与再次提速

- 按用户澄清修改护盾图标贴图的六边形外框：imagegen编辑新增pickup-shield-blue-border.png，外框纯饱和蓝，取消白亮线；中心白盾保留。游戏与预览统一新贴图。
- 飞行速度在142.5基础上再乘1.25为178.125，仍全程匀速，30吸收半径沿用。
- npm run check、test-enemy-buffs、preview-popup-lab、preview-enemy-buffs通过，已检查生图素材，真实WebGL无页面/GL错误。本地未发布。

## 2026-11-01 本地：过关清除彩虹墨水

- 统一过关入口 beginStageClear 在确认可结算后清除所有地块的死亡墨水画布、脏标记和计数，并释放对应 GPU 纹理，避免带入下一关。
- npm run check、test-settlement（新增墨水与纹理清理断言）、test-particle-surfaces（方形/六边形）通过。本地未发布，未做实机视觉验收。

## 2026-11-01 本地：护盾吸收提速、扩大判定与蓝色外圈

- 按用户“细收速度/判定”理解为吸收：护盾全程匀速95→142.5（1.5倍），吸收半径从精确到点扩大到30世界单位，判定包含本帧飞行距离以避免穿越；预览同步。
- 拾取底部外圈由近白青#a2f7ff改明确蓝色#268cff，同径固定大小规则保持。
- npm run check、test-enemy-buffs（142.5匀速与30/31半径边界）、preview-popup-lab、preview-enemy-buffs通过，真实WebGL无页面/GL错误。本地未发布。

## 2026-11-01 本地：拾取光效缩短到0.25秒

- shieldPickup生命周期.7→.25秒，外围圆柱光40ms明暗交替、136高度随进度缩到0；底环半径仍固定36并跟随玩家。
- 中央粗光沿用拉长变细轨迹，所有进度下高度乘3、半径/直径乘1.5，随本次短光效结束。预览同步新时长。
- npm run check、test-enemy-buffs、preview-popup-lab、preview-enemy-buffs通过；包含中央尺寸倍率、外围缩短、.251秒清理断言；已查看真实WebGL截图，零页面/GL错误。本地未发布。

## 2026-11-01 本地：背光蓝青配色、不均匀光束与软边

- 使用imagegen编辑新增pickup-reward-cyan-soft.png，金色改护盾同系蓝青色；光束的宽窄、长短、间隔和明暗拉开差异，侧边和末端羽化渐隐。游戏/独立预览共用新素材，原素材保留；旋转速度、图标大小、匀速飞行及拾取圆柱规则沿用。
- npm run check、test-enemy-buffs、preview-popup-lab真实Edge/WebGL通过，已查看背光截图确认蓝青色与柔边，无页面/GL错误。本地未发布。

## 2026-11-01 本地：按两张奖励参考制作柔光、生图光柱贴图

- 用户补充金币/帽子奖励参考，背光改为imagegen按参考生成的pickup-reward-sunburst.png，宽直扇形金色光束柔和渐隐、缓慢旋转；替代旧分段环，弃用带螺旋杂纹的pickup-soft-backlight.png（原素材保留）。
- 拾取外围与中心圆柱均改用imagegen透明PNG：pickup-column-generated.png、pickup-core-generated.png，移除程序像素纹理。加载缓存/上下文重建、WebGL1 POT上传及垂直UV方向已处理；图标绘制时预热。
- 脚下圆环固定半径36，与外围圆柱同半径、同底部高度，不再随时间缩放。中心光柱独立拉长收细沿用。
- npm run check、test-enemy-buffs（同径/固定半径）、preview-popup-lab、preview-enemy-buffs通过；已查看背光及圆柱真实WebGL截图，无页面/GL错误。本地未发布，未做手机验收。

## 2026-11-01 本地：匀速护盾、旋转背光与圆柱拾取光效

- 护盾独立advanceShieldPickup，全程95世界单位/秒直接追向玩家，取消散落减速/加速阶段；图标100→60（3/5），背后增加三段缓慢旋转光环。
- 拾取光效每帧读取玩家位置/坐骑高度，底环半径21–24→42–48、外围光幕高136。中心为真实圆柱，随生命周期高度90→240、半径13.5→1.5。外围也是48段圆柱，使用缓存256×128起伏阶梯行情状RGBA光纹并滚动UV；取消旧7根Billboard光条。GL上下文恢复按spriteProgram重建缓存；sprite draw支持vertexCount，默认仍6。
- 预览页改直接复用renderer的WebGL圆柱/光纹/旋转背光，拖动角色跟随，固定速度飞入；不再用CSS光条模拟。地块护盾拾取也只使用新光效和奖励音。
- npm run check、test-enemy-buffs（95匀速、双圆柱、中心变长变细、跟随、有限顶点）、test-particle-surfaces、test-pickup-feedback、preview-enemy-buffs、preview-popup-lab通过；已查看真实WebGL新预览截图，零页面/GL错误。本地未发布，未做手机验收。

## 2026-11-01 本地：护盾拾取圆环与上升光柱

- 结合用户两张参考图，新增一次性蓝青色光柱：地面圆环半径21–24、中央光条最高78、6条短光条与14个上升方形光点；持续.7秒渐入淡出，尺寸略大于常规角色。不使用方形底座。
- grantTemporaryShield改触发独立shieldPickupFeedback，替代旧通用爆散反馈；同类效果最多1个、暂停与粒子生命周期沿用。popup-lab同步展示拾取瞬间光柱。
- test-enemy-buffs覆盖触发、有限透明顶点、重复授予数量；test-pickup-feedback、preview-enemy-buffs、preview-popup-lab与npm run check通过；已查看真实Edge/WebGL截图，零页面/GL错误。本地未发布，未做手机验收。

## 2026-11-01 本地：护盾图标去掉装饰光刺

- 经imagegen编辑生成pickup-invincible-shield-calm.png，去除放射光刺、菱形星点、环线和中心星芒，保留蓝色六边形、白盾与边缘柔光。游戏和预览同步引用简洁版，旧素材保留。
- npm run check、test-enemy-buffs、preview-enemy-buffs真实Edge/WebGL通过，已检查新素材；本地未发布。

## 2026-11-01 本地：护盾掉落改为平面Billboard

- 参考用户霓虹六边形增益图标风格，经imagegen生成透明PNG assets/pickup-invincible-shield.png。掉落取消立体网格与地面环，使用100世界单位、固定朝镜头的imageQuad；共享原散落/吸附轨迹与保护、跳字、音效。
- popup-lab同步展示平面图标吸附后跳字。npm run check、test-enemy-buffs、preview-enemy-buffs真实Edge/WebGL通过，零页面/GL错误；无3D拾取网格、纹理加载与有限顶点检查通过。本地未发布。

## 2026-11-01 本地：粒子全面改为共享常驻几何

- particles绘制拆成drawParticle统一入口，所有分支复用常驻几何：普通方块、冷热碎块、弹壳、命中火花、电击闪光、拾取光环/闪点/拖尾、金钱晶体、枪击飞溅；glow继续GPU点精灵。形状首次使用构建一次并STATIC_DRAW上传，后续只传实例变换与RGBA；不减粒子数量，不改运动/碰撞/寿命。
- 新particleSurface缓存+实例化透明绘制，光环内外半径、渐细拖尾与两端alpha由实例参数控制；fxPuff/fxCloud/fxDisc/juicyShape调用也共享预生成轮廓。死亡火花长度移至实例缩放，避免连续长度产生无界缓存；支持无ANGLE实例化回退与context恢复。
- 性能面板/导出计入新缓存、实例、顶点与CPU/GPU缓冲。透明表面按形状批处理，叠加排序与旧逐面提交不同，已查看Edge截图；未做手机实机验收、未重现用户B09存档，本地未发布。
- npm run check；test-baked-particles、test-geometry-buffers、test-performance、test-weapon-vfx、test-particle-surfaces（方/六边形）、test-cash-crystals、test-pickup-feedback通过。旧动态几何断言改查展开的常驻快照，保持有限坐标/负高度/烟雾寿命/透明度校验。
- preview-baked-particles真实headless Edge：覆盖全部粒子分支，预热后60帧动态不透明/透明几何均0、STATIC_DRAW上传0，实例上传正常、缓冲复用、长周期死亡火花缓存稳定、回退与context恢复GL错误0。preview-death-debris、preview-juicy-pistol通过，已查看粒子与手枪命中截图。修正旧手枪预览冷却时间.6不足剩余.63的问题，改.7。旧preview-particle-surfaces的builderlab入口等待超时，逻辑版及新真实Edge粒子测试通过，未宣称该旧预览通过。

## 2026-11-01 本地：护盾跳字固定跟随

- 无敌跳字去掉按年龄向上飘的位移，仅保持玩家上方固定锚点并跟随玩家；预览页同步。黄蓝闪色、回黄淡出和音效沿用。
- npm run check、test-enemy-buffs（含translateY(0px)断言）、preview-popup-lab通过。本地未发布。

## 2026-11-01 本地：独立跳字预览页

- 新增 /popup-lab.html，自动循环护盾跳字、暂停/重播、拖动角色验证跟随、可选奖励音效；复用游戏CSS与当前60ms黄蓝/末.3秒回黄淡出参数。
- 修复原bomb-name-popup的!important字色覆盖蓝色问题，无敌跳字内联色增加优先级。npm run check、test-enemy-buffs、preview-popup-lab真实Edge computed颜色检查通过，已查看截图。本地未发布。

## 2026-11-01 本地：无敌跳字加速黄蓝闪色

- 护盾跳字独立shieldCue标记，每60ms黄/蓝切换，保持满亮；最后.3秒固定黄色并淡出。继续跟随玩家与奖励音效，炸弹原明暗闪烁保持。
- npm run check、test-enemy-buffs通过，覆盖初始黄、60ms蓝、120ms黄、末尾回黄及淡出。本地未发布。

## 2026-11-01 本地：护盾奖励音效与闪烁跟随验证

- 无敌拾取改用独立五音上行奖励琶音（C5/E5/G5/C6/E6），75ms逐音进入、320ms衰减，遵守静音设置；护盾跳字保持120ms明暗闪烁并实时投影跟随玩家。
- npm run check、test-enemy-buffs通过；增加闪烁明暗、同年龄玩家移动跟随、奖励音阶/调度/静音断言。本地未发布，音效尚未真人试听。

## 2026-11-01 本地：敌人临时无敌护盾掉落

- 普通有效击杀独立6%掉落大型青绿盾牌（常驻共享网格），先散落.65秒再自动吸附；场上最多12个，排除机关、清场、逃离、自爆、实验目标，逐敌去重，每关清空。
- 吸附复用towerShieldLeft保护2秒，跟随跳字“无敌2秒！”，拾取闪光与声音；已有更长保护不会缩短。护盾生产格同样走共享授予函数并显示实际秒数。
- 现有六边形无敌护罩面透明度.06→.24、边缘.8→1并增强发光。
- npm run check、test-enemy-buffs、test-enemy-chests、test-pickup-feedback、test-electric-tiles通过；preview-enemy-buffs真实Edge/WebGL零页面/GL错误，已查看390截图。未做手机实机验收，本地未发布。

## 2026-11-01 本地：绘制热路径临时分配优化

- 用户截图B09：40 FPS / P95 33.4ms；逻辑1.81ms、绘制19.99ms（包含提交1.99ms），503粒子、每帧13074动态顶点。优先排查CPU几何构建；30秒堆下降52.3MB只能说明发生回收，不能据此断定泄漏或锁定全部卡顿原因。
- renderer.quad法线改标量计算，transparentQuad直接写复用Float32Array，减少逐顶点展开数组；保持几何、颜色、透明度、数量及玩法。
- npm run check、test-performance、test-weapon-vfx、test-particle-surfaces、test-geometry-buffers通过。新测试覆盖1000随机/退化面与扩容，输出逐值一致。真实headless Edge独立基准（每轮1000不透明+1000透明面，中位数）1.004→0.250ms；不代表B09整局FPS提升。preview-death-debris真实Edge通过、GL错误0。未重现用户当前存档、未做手机验收、本地未发布。

## 2026-10-31 本地：恢复全地板下方六边形光柱

- 定位此前核心高光改动将光柱提交也放入核心/减速范围条件，普通地板不再绘制。光柱恢复全地板覆盖，保持125长度、蓝色与.24透明度；核心亮边、BLOB及减速范围紫色.035暗光沿用。
- npm run check、test-hex-city（含移动）、preview-tile-beams、preview-floor-blob通过。真实Edge/WebGL验证27格光柱、GPU可见像素、缓存复用，减速场81格覆盖/18格暗光，无页面/GL错误；已查看390截图。更新BLOB预览中的旧核心限定断言。本地未发布，未做手机实机验收。

## 2026-10-31 本地：飞行弹幕怪攻击降频

- 普通飞行射手每轮攻击间隔乘3：扇射飞蛾1.3→3.9秒、导弹战斗机3.1→9.3秒、脉冲哨机3.2→9.6秒等；双发的一轮内部间隔沿用。数量、移动速度沿用，Boss/地面怪/场地炮台不变。
- 激光眼保持蓄力/锁定/扫射时长，冷却额外增加两轮完整周期，使完整攻击周期乘3。隐形无人机绕行等待、瞄准、暴露阶段计时乘3（实际攻击周期还取决于追逐距离）。
- npm run check、test-ranged-entry --hex、test-early-roster --hex、test-stealth-drone、test-enemy-flight通过。新增实际step下多机型三倍冷却/提前不重复开火及激光周期断言；修正隐形测试旧固定距离已不处于当前迟滞区的问题，以当前范围动态取点并缩小检查步长避免越界。逻辑/mock验证，本地未发布，未做实机手感验收。

## 2026-10-31 本地：子弹仅保留贴图柔光

- 按用户要求移除bulletBloom两层加法增亮及所有调用，普通弹/高阶枪弹不额外叠加辉光，金属导弹去除弹身外光；导弹喷焰沿用。
- 圆弹改为缓存RGBA透明贴图：暖白芯、彩色边缘、低透明度柔光渐隐，采用普通透明混合；移除常驻球体与单独加法白芯。贴图面向固定相机方向，不受灯光压黑，尺寸与闪色保持。
- 普通轮廓弹柔光写入RGBA alpha，整体亮度限制在普通颜色范围，不新增HDR或专用后期。场景原后期设置保持。
- npm run check、test-weapon-vfx、preview-enemy-bullets、preview-reference-missiles通过。真实Edge/WebGL零页面/GL错误；新增圆弹贴图缓存与无加法点断言，已查看两张390截图。未做手机实机验收，本地未发布。

## 2026-10-31 本地：炸弹半透明UI与释放跳字

- 42px方形炸弹UI整体65%不透明度；实际释放成功时弹出装备名加全角叹号，1.15秒上浮放大跳字，按游戏年龄每120ms明暗闪烁，暂停时同步停住。无目标释放失败不提示。
- npm run check、test-bomb-equipment、真实Edge preview-bomb-head-cooldown通过，验证电浆炸弹名称、闪烁明暗、UI透明度和冷却状态，零页面/GL错误。本地未发布。

## 2026-10-31 本地：偏白亮芯和彩色边

- 按用户最新要求，普通弹纹理改为小范围偏白暖色内核、清晰橙红/黄色边；高阶图集同样恢复局部暖白芯。闪烁圆弹在朝镜头表面叠暖白亮芯，外圈继续原色/蓝/红循环。
- 同色辉光外层增益.55→.85、内层1.1→1.65，外层范围3.2→3.6倍；基础尺寸、碰撞、无拖尾不变。
- npm run check、test-weapon-vfx、test-ranged-entry --hex、preview-enemy-bullets、preview-reference-missiles通过，真实Edge/WebGL零页面/GL错误；已查看390截图。圆弹亮芯前移后重新运行preview-reference-missiles通过。本地未发布，未做手机验收。

## 2026-10-31 本地：弹幕怪入场120、前期远程上限20

- 飞行射手入场速度75→120；前六关远程同屏上限12→20（蜂巢倍率沿用），后续仍由总威胁预算控制。三章总威胁上限27/39/51→45/65/85，避免仅提高远程上限却被旧预算卡住。每批5只、刷怪间隔、有限总池、巡航及近战分段规则沿用。
- npm run check、test-ranged-entry --hex、test-enemy-balance --hex、test-early-roster --hex、test-bridge-pressure --hex通过。逻辑/mock验证，本地未发布，未做实机画面/性能验收。

## 2026-10-31 本地：彩色死亡飞溅、多变体与1–2倍尺寸

- 尺寸按此前半径随机放大1–2倍；6种轮廓（放射、厚团、细刺、扁长、偏向、密集碎点）和8种实色随机组合，继续跨格烘焙并复用缓存，碎屑落地不转贴图。
- npm run check、preview-death-debris、preview-death-tumbling、test-particle-surfaces方形/六边形通过，真实Edge/WebGL零错误。变体预览 tests/death-scorch-color-variants.png；本地未发布。

## 2026-10-31 本地：近战密度提前递增

- 原浮桥近战前十关均上限3只/2秒补1只，改为1–3关保持3只/2秒，4–6关6只/1秒，7–10关10只/.7秒，11–22关14只/.55秒，23关起18只/.45秒。继续从有限怪物池补充并遵守总威胁、出生间距和末尾停止入场规则。
- npm run check、test-bridge-pressure --hex、test-spider-pressure、test-enemy-balance --hex、test-early-roster --hex通过；密度回归覆盖分段边界、补怪间隔及同屏限制。逻辑/mock验证，未做实机视觉和性能验收，本地未发布。

## 2026-10-31 本地：子弹可见同色辉光

- 用户要求亮到有辉光：renderer.bulletBloom新增两层同色加法柔光（3.2倍半径/0.55增益、1.8倍半径/1.1增益），覆盖普通敌我弹体、闪烁圆弹、高阶枪弹与金属导弹。
- 保留有色主体与正常透明混合，由独立柔光层形成明亮核心和向外衰减光晕，不依赖屏幕后处理；基础5.25尺寸、碰撞、无拖尾与闪色规则保持。
- npm run check、test-weapon-vfx、test-ranged-entry --hex、preview-enemy-bullets、preview-reference-missiles通过。真实Edge/WebGL零页面/GL错误；已查看两张390截图，确认橙色、蓝色弹体外侧有明显辉光，未做手机实机验收。本地未发布。

## 2026-10-31 本地：弹幕怪更多、缓慢飞入

- 飞行射手入场速度190→75，巡航移动倍率降至75%；入场禁火、近身退让沿用。
- 普通关三章有限总池60/100/150→90/150/225，威胁上限18/26/34→27/39/51，前六层远程上限8→12；每批仍5只，间隔3/3.5/3.6→2/2.3/2.4秒。浮桥独立数量上限保持，怪物配比与单只收益沿用，总可获得收入随总池增加。
- npm run check、test-ranged-entry --hex、test-enemy-flight、test-early-roster --hex、test-enemy-balance --hex通过。入场回归新增75速度断言，每个用例重置房间剩余时间以隔离慢速入场与关卡超时。逻辑/mock验证，未做实机视觉和性能验收；本地未发布。

## 2026-10-31 本地：弹体保色、导弹提亮与基础尺寸

- 新增BASIC_BULLET_RADIUS=7*.75=5.25：初始闪烁圆弹由7缩至5.25，普通敌弹默认显示尺寸按碰撞r/4相对该基准缩放，玩家基础枪械同用此基准；碰撞半径不变。
- 普通枪弹透明纹理降低浅白RGB、采用正常透明混合代替加法叠白；高阶图集亮芯保留各型号主色。圆形闪烁弹/普通圆弹改用共享常驻自发光球体，移除白色亮点和叠加光晕，三色循环保持。
- 金属导弹提亮为暖金属弹体、浅金高光和橙色尾翼，模型自发光避免被场景灯光压黑，保留暗束环、尾喷焰、飞行和伤害规则。
- npm run check、test-weapon-vfx、test-ranged-entry --hex、preview-enemy-bullets、preview-reference-missiles通过。真实Edge/WebGL验证5.25基准、碰撞不变、导弹自发光标记、缓存复用与零页面/GL错误；已查看两张390截图，弹体呈橙红/蓝而非白、导弹呈亮金色。本地未发布，未做手机实机验收。

## 2026-10-31 本地：放置后选项即时清空

- 修正合成升级期间renderBag提前返回导致剩余卡片停留约1.25秒：已消耗本关选择且库存为空时立即刷新清空，不再等待庆祝动画。场上建筑之间合成仍保留未消耗选择。
- npm run check、preview-building-upgrade、preview-chip-confirm通过。真实Edge验证pointerup同一事件内三张选项已全部移除，升级庆祝仍播放，确认锁/手动开始/重置与已有建筑合成保留选择正常。同步修正旧升级预览对无限CSS动画的等待及旧SVG星星断言。本地未发布。

## 2026-10-31 本地：炸弹冷却底框放大为方形

- 按用户更正为原尺寸3/2：28px→42px，底框改直角正方形，保留扫描遮罩和血条上方锚点。

## 2026-10-31 本地：我方弹幕不再被旧矩形电梯边界吞掉

- 用户澄清左上碰撞是我方弹幕。定位step的shots过滤仍按A矩形删除普通弹，火箭越界强制爆炸且爆心钳回矩形；顶部外侧横射也会立即消失。
- 六边形开放场景通过friendlyShotOutside跳过旧边界清理/提前爆炸；爆心使用真实位置，回旋及追踪弹初始移动同样不被旧边界截断。寿命/命中仍正常清理，旧矩形模式保留原规则。
- npm run check、test-weapon-vfx、test-missile-tile通过；新增preview-friendly-open-air真实Edge验证玩家/无人机上下两种高度左右穿界8条路径、火箭不提前爆炸/爆心不钳回、寿命清理和旧模式边界，页面/GL零错误。本地未发布。
## 2026-10-31 本地：延迟金钱吸附

## 2026-10-31 本地：补修装备炸弹激光渲染分流

- 用户复查仍无变化，重新运行preview-bomb-equipment截图确认黄色宽矩形。上一轮仅验证旧设施路径；activateEquipmentBomb会删除electricFacilityShot，导致装备光束落入普通短时beam绘制，3秒寿命还被用作宽度倍率。drawFriendlyShot改按bombLaser显式分流至ElectricTiles.drawShot，装备与设施共用流动纹理。
- 新增浏览器断言每束装备激光确实提交两层laserFlow，npm run check、test-bomb-equipment、test-bomb-facilities、preview-bomb-equipment通过，无页面/GL错误。已查看修复后tests/bomb-equipment-laser_bomb-390x844.png，粉色细光束替代黄色矩形。本地未发布。

- 敌人掉落金钱晶体第一阶段由0.38–0.52秒延长到0.9–1.2秒；第二阶段初速度70→35、加速度900→400，保留加速追踪玩家。技能点维持原节奏，收益规则不变。
- npm run check、test-cash-crystals、test-talents、test-pickup-feedback通过；未做实机视觉验收，本地未发布。

## 2026-10-31 本地：头顶炸弹扫描冷却

- 在角色血条正上方添加28px炸弹图标，复用实际bombCooldown/interval，以12点起顺时针退去的扇形遮罩显示CD；就绪完整亮起。投影跟随实际血条（含坐骑高度），空槽/死亡/商店隐藏。
- npm run check、test-bomb-equipment通过；preview-bomb-head-cooldown真实Edge验证满CD/半CD/就绪角度、血条间距、空槽隐藏及零页面/GL错误，已查看390宽截图。未做手机实机验收，本地未发布。

## 2026-10-31 本地：清除六边形场景遗留广告牌

- HexMap 场景构建期间设置 omitLiftSigns，orbital-scene 不再生成旧电梯附属的4块侧广告牌、支架、外壳及发光面；普通场景仍沿用原设置，构建后恢复标志。
- npm run check、test-hex-movement、test-hex-city通过。新增 preview-corner-cleanup，真实Edge验证侧牌/面片/绘制范围均为0、实际walkFloor遍历146条邻接通路无阻挡、页面/GL零错误；已查看左上截图 tests/corner-cleanup-upper-left.png。
- 额外检查50个地图种子的所有相邻格通路，无异常。用户报告的左上隐形碰撞尚未复现，未将其标为已修复；若仍出现需按当局地图与具体位置继续排查。本地未发布。
## 2026-10-31 本地：按参考图改为实黑放射飞溅焦痕

- 死亡焦痕取消柔光渐变，改为纯黑不规则实心、尖锐放射笔触与周围细小飞溅；每次随机形状，跨格共用同一轮廓。保持碎屑落地不转贴图。
- npm run check、preview-death-debris真实Edge、test-particle-surfaces方形/六边形通过，GL零错误；已查看实际烘焙Canvas放大预览 tests/death-scorch-reference-preview.png。本地未发布。

## 2026-10-31 本地：拾钱降音量、电浆炸弹补声、敌人换科幻狙击音

- 捡钱比特音增益.55→.25。原样复制 Sci Fi Sniper 10.wav 为 assets/audio/enemy-sci-fi-sniper10.wav，SHA256一致；敌人共用发射入口换采样、增益倍率.65→1.2，保留独立3声/总12声上限及射击音量控制。
- 定位装备电浆炸弹activateEquipmentBomb漏调声音（仅有通用拾取提示）；在fireTower成功非自动放电时统一播放，移除拾取电浆路径重复调用与装备电浆通用提示。电浆炸弹单独80ms节流/并发组，不与电塔电枪互吞；全局满额优先淘汰非敌人/非电浆炸弹声。无命中目标不启动电浆炸弹冷却。
- npm run check、test-bomb-equipment、test-electric-tiles、test-cash-crystals通过；preview-enemy-shot-audio验证新WAV实际发射、提高增益及密集交火/静音/上限；扩展preview-electric-tower-audio真实Edge验证电塔与装备电浆炸弹同帧两声、各自节流、静音/无目标不响与拾钱.25增益、零页面/GL错误。未做主观听感验收，本地未发布。

## 2026-10-31 本地：死亡碎屑不再转贴图，改留黑色爆炸焦痕

- 保留死亡碎屑空中翻滚，落地直接消失；移除灰色碎屑贴图加载与落地烘焙。shatterVisual在死亡位置烘焙一片纯黑中心、柔化不规则边缘的焦痕，跨格绘制并按六边形裁切，复用原地板纹理缓存与GPU清理。
- npm run check、test-particle-surfaces（方形/六边形）、真实Edge preview-death-debris及preview-death-tumbling通过：40碎屑、落地无贴图、纯黑焦痕、缓存复用、移除地板清理及GL零错误。截图已查看，未做手机实机视觉验收。本地未发布。

## 2026-10-31 本地：修复敌人枪声被玩家枪声挤掉

- 排查确认指定敌人WAV可解码且开头有有效信号，原敌人枪声与玩家共用shot并发池，连续玩家射击会淘汰敌人voice。playStarterSample增加可选sampleGroup及levelScale；敌人独立3声上限，总12声满额时优先淘汰非敌人声音。仍共享shot音量设置/静音。
- 敌人增益系数.35提升至.65，倍率计入mixScale，调整射击音量或切换静音后仍保持倍率。玩家采样默认参数保持。
- npm run check、test-ranged-entry --hex、test-enemy-flight通过；扩展preview-enemy-shot-audio真实Edge验证六种实际fire流程、九种声音入口、玩家24轮密集射击/命中/爆炸下敌人voice存活、敌人3声/总12声上限、静音/零音量。preview-enemy-death通过。未做主观听感验收，本地未发布。

## 2026-10-31 本地：所有爆炸统一死亡音效

- 按最新要求，explosionSound直接共用deathSound的Explosion Grenade_02采样、缓存、此前低音量、60ms节流和并发控制，移除Cannon独立预加载。覆盖火箭筒、导弹塔、敌方导弹、自爆、落弹；Boss死亡连爆及无人机Boss轰炸同时换为统一入口。
- npm run check、test-missile-tile、test-weapon-vfx通过；preview-enemy-death真实Edge验证六条爆炸入口对应同一死亡buffer、死亡/武器爆炸交叉节流、静音、零页面/GL错误。未做主观听感验收，本地未发布。

## 2026-10-31 本地：商店装备与建造统一装填音效

- 原样复制用户 ShotGun Reload 1.wav 为 assets/audio/equipment-build-shotgun-reload1.wav，SHA256一致。商店成功确认装备与地块成功放置/扩建/移动/合成/拆除共用tilePlacement缓存采样，取代旧装备随机双音和旧建造音。沿用.55增益、静音/主音量/并发控制。
- npm run check通过；更新preview-equipment-confirm-audio，真实Edge验证统一样本、确认播放、取消/重复确认/静音无声；preview-chip-confirm真实拖放验证成功播放一次与静音及原确认流程通过。未做主观听感验收，本地未发布。

## 2026-10-31 本地：建筑仅核心高光、减速领域暗光

- 六边形亮边/光柱仅核心绘制，普通格及非核心建筑格保留BLOB；修理炮塔等塔类霓虹底座限制为核心。
- 减速范围复用实际减速判定，非核心范围格使用紫色暗光（亮边.04、光柱.035，核心保持.22/.24）；保留范围淡紫底色。核心/暗光独立材质缓存，避免共享透明度。
- npm run check、test-clock-repair、test-defense-towers、真实Edge preview-floor-blob通过；范围测试1个亮核心/18个暗光格，BLOB GPU/缓存/移除检查通过，GL无错误。未做主观视觉验收，本地未发布。

## 2026-10-31 本地：芯片卡片稍加长

- 按用户要求将卡片最小高度204→224px，其余字体、名字色带和流光保持。
- npm run check、preview-chip-confirm通过；已查看真实Edge 390宽截图，布局正常。本地未发布。

## 2026-10-31 本地：捡钱改为短促比特音

- 用 tools/build-bit-cash-pickup.py 生成130ms上行双音脉冲波比特拾取声 assets/audio/cash-pickup-bit.wav，替换cashPickup铃声映射，覆盖cash/gem与掉落晶体。保留.55增益、90ms节流、预加载/缓存、主音量/静音及并发限制。
- npm run check、test-cash-crystals、test-pickup-feedback通过；真实Edge验证新WAV解码/130ms长度、cash/gem对应buffer、静音/密集节流及零页面错误。未做主观听感验收，本地未发布。

## 2026-10-31 本地：地块选择界面简化

- 地块选择面板可见期间隐藏底部战斗HUD（地板/钱/击杀/武器等），退出选择动画后恢复。该界面隐藏镜头归位；确认开始按钮独占一行并在游戏区水平居中。
- npm run check、preview-chip-confirm通过；真实Edge验证HUD隐藏/恢复、镜头按钮隐藏、开始按钮中心误差小于1px，放置音效与显式确认流程保持。已查看390宽截图。本地未发布。

## 2026-10-31 本地：缩短芯片卡与放置音效

- 卡片最小高度228→204px，图标72→50px；底部名字条35→46px，名字11→14px、描述10→11px。保持黑底、细边与流光。
- 原样复制 Gun_Weapon_Pickup04.wav 为 assets/audio/tile-placement-pickup04.wav，SHA256一致。成功新放置/扩建/拆除、移动及合成时通过tilePlacementSound播放指定采样；替换合成初始提示音，保留升级揭示提示。失败拖放不触发，沿用采样缓存、预加载、主音量与静音，基础增益.55。
- npm run check、preview-chip-confirm通过；真实Edge验证WAV解码、拖放成功使用指定buffer且仅一次、静音、边框流光和确认流程。已查看390宽缩短卡片截图。本地未发布，未做主观听感验收。

## 2026-10-31 本地：敌人死亡指定手雷爆炸音效

- 原样复制用户 Explosion Grenade_02.wav 为 assets/audio/enemy-death-grenade02.wav，SHA256一致。共用deathSound改播新采样；武器爆炸独立保留Cannon_Turret_Shot1采样及缓存/节流，不随死亡声替换。
- 死亡声保持此前增益.65*4/9、60ms节流、主音量/静音和声音并发上限；原始采样约8.71秒，未剪裁。
- npm run check、test-weapon-vfx通过；更新preview-enemy-death，真实Edge验证死亡新buffer播放、静音/节流、五条武器爆炸仍使用原buffer及零页面/GL错误。未做主观听感验收，本地未发布。

## 2026-10-31 本地：初始双发敌人恢复圆形闪烁弹

- 用户指定初始敌人仍用圆形闪烁弹：spitter初始射击及twinGun/飞行eye双管明确指定flashOrb外观，复用圆形亮芯与原橙红→蓝→红循环，不带拖尾。
- 保持放大的drawRadius7、碰撞半径4和弹速/瞄准/延迟；其余敌弹形状保留。bullet新增可选显式shape，默认规则不变。
- npm run check、preview-enemy-bullets（新增初始双枪shape断言）、test-ranged-entry --hex、test-enemy-diversity通过；浏览器零页面/GL错误。本地未发布。

## 2026-10-31 本地：参考卡片布局与流光

- 三选一按用户参考改为黑底细切角卡：顶部图标、中间描述、底部实色名字标签，移除编号与触点。三栏金/紫/青，保留既有设施图标。
- 细边使用4秒conic-gradient角度动画形成环绕流光，底部名字标签独立扫光并错开三卡节奏；减少动态偏好下停用动画。
- npm run check、preview-chip-confirm通过；真实Edge确认边框动画角度随时间改变、名字位于描述下方且不出卡，放置后等待确认/默认测试入口隔离保持。已查看390宽截图。本地未发布。

## 2026-10-31 本地：捡钱指定铃声音效

- 原样复制用户 Pickup_GemBells19.wav 为 assets/audio/cash-pickup-gembells19.wav，SHA256一致。pickupSound的cash/gem共用指定样本，覆盖钱袋/旧现金物资与掉落晶体吸收；保留其他拾取声音。
- 复用预加载与缓存、主音量/静音/并发，基础增益.55、90ms全局节流，密集捡钱不逐颗叠响。
- npm run check、test-cash-crystals、test-pickup-feedback通过；真实Edge验证两入口对应样本、音频解码、节流、静音及零页面错误。本地未发布，未做主观听感验收。

## 2026-10-31 本地：商店确认装备指定音效

- 原样复制用户 Gun_Weapon_Pickup03/10.wav 为 assets/audio/equipment-pickup03/10.wav，SHA256一致。商店确认装备成功（武器/护甲/鞋/无人机/炸弹）随机播放其中一个；对比揭示/取消/重复确认/被动返回不触发。
- 沿用音频预加载与buffer缓存、主音量/静音和并发限制，固定基础增益.55，不随射击音量变化。
- npm run check、test-category-boxes、test-shop-stock通过；新增preview-equipment-confirm-audio真实Edge验证两种随机分支播放对应buffer、取消/重复确认无声、静音和零页面错误。本地未发布，未做主观听感验收。

## 2026-10-31 本地：芯片黑底与细侧边

- 按用户反馈移除米白说明底板，图标/说明区统一近黑色，标题与说明恢复浅色文字；顶部编号板与底部触点保留实色色块。两侧去掉额外5px内框，外缘收细至1px；悬停同样无白底。
- npm run check、preview-chip-confirm通过；已查看真实Edge 390宽截图，确认黑底/细边及原确认流程正常。本地未发布。

## 2026-10-31 本地：敌人共用指定枪声

- 原样复制 Gun_Pistol_Shot09.wav 为 assets/audio/enemy-pistol-shot09.wav，SHA256一致。敌人共用enemyShotSound入口替换旧程序比特音（普通弹、双枪、散射、隐形机及现有导弹/激光发射路径）；补齐牛仔Boss枪声、无人机Boss普通弹和射击子机。
- 缓存预加载，沿用射击音量35%、主音量/静音、35ms节流和并发限制。
- npm run check、test-ranged-entry --hex、test-enemy-flight通过；新增preview-enemy-shot-audio，真实Edge验证九种入口共用buffer、Boss入口、解码、增益、静音/零音量/节流与零页面错误。未做主观听感验收，本地未发布。

## 2026-10-31 本地：芯片卡片实色外壳

- 按用户补充参考，将三选一卡片调整为大面积实色外壳：彩色编号顶板/侧框/底部触点条、深色元件展示窗、米白说明铭牌与深色文字。去除卡片自身大范围霓虹投影及图标辉光，保留游戏既有全局后处理。
- npm run check、preview-chip-confirm通过；已查看真实Edge 390宽三卡截图 tests/chip-choices-390.png，确认纯色分区与文字承托。本地未发布。

## 2026-10-31 本地：统一指定爆炸音效

- 原样导入用户 Cannon_Turret_Shot1.wav 为 assets/audio/explosion-cannon-turret-shot1.wav，SHA256一致。共用爆炸入口覆盖火箭筒/追踪导弹、导弹塔、敌方导弹/抛射重弹、自爆、死亡爆炸与Boss落弹；移除对应旧合成爆炸提示音。电击等独立元素声音保留。
- 共用预加载/缓存、此前死亡爆炸增益 .65*4/9、主音量/静音、60ms节流及声音并发上限。
- npm run check、test-missile-tile、test-weapon-vfx通过；扩展preview-enemy-death，真实Edge/WebGL验证五条爆炸路径使用指定buffer、静音/节流及零页面错误。未做主观听感验收，本地未发布。

## 2026-10-31 本地：地块确认与芯片选项卡

- 普通关放置/合成后保持准备和暂停，点击“确定 · 开始本关”才进入开场；未选择前按钮禁用，无可放选项时可直接确认。已摆放后可整理场上建筑，不可再领取第二块。
- 三选一卡片改为切角霓虹芯片、编号、蚀刻底纹与底部触点，三栏青/紫/金区分，使用CSS实现。
- 默认隐藏装备测试、地块测试、准备界面测试格子与画面调节；装备测试F2同样受限。显式 ?dev=1 保留开发入口；这是入口隔离，测试源码仍在dist中，未作发行包剥离。
- npm run check、preview-expansion-choice、preview-chip-confirm通过；真实Edge验证拖放后等待仍暂停、确认后退出准备、默认入口及F2禁用。已查看390宽三卡截图 tests/chip-choices-390.png；本地未发布，未做手机实机验收。

## 2026-10-31 本地：早期刷怪丰富与普通关强建机器人

- 默认普通关第一层怪物池为单发脉冲哨机、导弹战斗机、扇射飞蛾（单发权重3/5）；第二层加入激光，第四层加入双发eye，第八层加入骷髅，第十四层加入隐形机。首个远程队列固定spitter。脉冲哨机改为两侧枪口轮换单发，原弹速/间隔/伤害保持。
- 强建机器人不再被默认地面怪总开关屏蔽，第7层起每个普通关后续批次混入1只，保持有限总量、威胁/远程上限和施工行为。默认仍走普通计时关；仅旧地面模式保留每4层施工专关。
- 新增test-early-roster（33层怪物池/实际普通关入场/总量/威胁/单发）；修正test-builder血量断言以遵守此前远程血量倍率。
- npm run check、test-early-roster --hex、test-enemy-balance --hex、test-builder（方形/六边形）、test-ranged-entry --hex、test-enemy-diversity通过。test-bridge-pressure --hex在旧fill aerial capacity断言失败，尚未调整该测试；旧test-enemy-waves仍含双发spitter与延后解锁的过时断言。逻辑/mock验证，未做实机视觉/手感验收，本地未发布。

## 2026-10-31 本地：狙击炮塔指定音效

- 原样复制用户 Laser_Turret_Shot2.wav 为 assets/audio/sniper-tower-laser-shot2.wav，SHA256一致。狙击炮塔独立映射 sniperTower，共用枪声预加载、缓存、射击音量、静音及并发控制；玩家狙击枪声音保持。
- npm run check、test-more-towers通过；真实Edge验证WAV解码/指定buffer播放、静音、零射击音量与玩家映射。本地未发布，未做主观听感验收。

## 2026-10-31 本地：再次降低死亡爆炸音量

- 按用户要求，将死亡爆炸增益从.65*2/3再次乘2/3，改为.65*4/9（约.2889），为本次修改前的2/3。
- npm run check、preview-enemy-death真实Edge/WebGL通过（音频路由、静音、节流及零页面/GL错误）。本地未发布。

## 2026-10-31 本地：双发飞机子弹增大、普通弹去拖尾

- spitter双枪与twinGun/飞行eye双管弹drawRadius从4增至7（1.75倍），碰撞半径仍4；弹速、双枪延迟与瞄准保持。
- 普通敌我梭形/光矛/短条弹改成以实际位置为中心的紧凑稳定弹体，删除尾部延伸；玩家高阶枪弹图集改为对称短弹体，移除旧版狙击弹后方光点。飞剑/轮刃轨迹与持续光束是独立攻击表现，保留。
- 导弹喷焰单独exhaust纹理缓存，保留脉动与尾焰；三色球状火箭保留既定闪色。
- npm run check、test-weapon-vfx、test-ranged-entry --hex、preview-enemy-bullets、preview-reference-missiles通过。真实Edge验证双枪r4/drawRadius7、普通弹位置居中且跨时间几何一致、纹理复用及零页面/GL错误；已查看enemy-bullet-shapes-390.png。本地未发布，未做手机实机验收。

## 2026-10-31 本地：统一电击声音与命中火花

- 将用户指定 EnergyRifle_Shot23.wav 原样复制为 assets/audio/electric-energy-rifle-shot23.wav，SHA256一致；电枪（含双枪/无人机）、电塔、电浆炸弹共用采样，保留现有音量、静音、80ms节流。
- 共用 cyberHit 入口为电击添加100ms蓝白光火花、240ms渐隐贴地柔光blob及8片160–260ms飞散亮碎屑；同时活动电击粒子上限256，暂停/生命周期沿用现有粒子系统。普通武器命中不变。
- npm run check、test-weapon-vfx、test-electric-tiles、test-bomb-equipment通过。扩展preview-electric-tower-audio，真实Edge/WebGL验证新WAV解码/播放、静音/节流、三条命中标记路径、有限绘制数据、blob、闪光时长与粒子清理，零页面/GL错误；已查看electric-hit-feedback-390.png。未发布，未做手机实机或主观听感验收。

## 2026-10-31 本地：金属导弹与三色球状火箭弹

- 敌方导弹与玩家追踪导弹改为共享常驻金属模型：圆钝弹头、灰绿分节弹体、亮金属高光、暗色束环和尾翼；尾部暖白/橙色喷焰按时间轻微脉动并跟随方向。
- 玩家非追踪爆炸火箭改为有偏心亮点的球状弹，敌方抛射重弹同步使用；按原色→蓝→红循环，每色约111ms，全循环约333ms。其余普通敌弹继续统一暖色。
- 保留速度、追踪、碰撞、伤害与爆炸效果；未发布。npm run check、test-weapon-vfx、test-enemy-diversity、test-ranged-entry --hex通过。preview-reference-missiles真实Edge/WebGL验证三色、有限几何、常驻网格复用与零页面/GL错误，已查看tests/reference-missiles-390.png；未做手机实机验收。

## 2026-10-31 本地：参考合金弹头调整纺锤弹与短条弹

- 菱形（飞蛾散射）改为对称尖端、弧形肩部的饱满纺锤形，宽暖白亮芯与薄橙色边，无长尾。新增短条曳光弹（平行侧边、钝圆前端、短不规则尾部），敌方默认枪弹使用；保持其余梭形/光矛可用。
- 玩家1–2阶手枪/冲锋枪/步枪/Uzi以及旧版对应枪械使用短条弹；敌人橙红、玩家偏黄。共享纹理缓存随上下文恢复重建，保留伤害、碰撞与速度；新玩家纹理尺寸计入drinkScale。
- npm run check、test-weapon-vfx、test-ranged-entry --hex、preview-enemy-bullets通过。真实Edge/WebGL验证4种敌弹、两条玩家渲染路径、5张缓存纹理复用及零页面/GL错误；已查看tests/enemy-bullet-shapes-390.png。本地未发布，非手机实机验收。

## 2026-10-31 本地：敌人射击比特音效

- 敌人射击改为缓存的程序8-bit方波阶梯下扫与量化噪声，普通弹85ms、导弹/重弹130ms、激光160ms；补齐双枪每管与隐形机实际射击路径，替换旧轻提示音。
- 共用射击音量、静音、主音量、限幅和现有声音并发上限；35ms全局节流，散射每轮只响一次，音量为玩家射击设置的35%。
- npm run check、test-ranged-entry --hex、test-enemy-flight通过；真实Edge验证三种非静音音频buffer、时长、缓存、节流、静音及零射击音量通过。未做主观听感验收，本地未发布。

## 2026-10-31 本地：随机放大落地残骸

- 用户要求残骸为当前1–2倍随机大小，落地烘图时为每片固定随机debrisScale（1+Math.random），放大灰色伪立体贴图；保持此前透明度与地块贴图复用。
- npm run check、preview-death-debris通过；本地未发布。

## 2026-10-31 本地：丰富敌人子弹轮廓

- 参考尖头能量弹新增梭形、细长光矛、菱形三种程序透明纹理；喷射怪使用梭形，普通枪弹使用光矛，飞蛾散射使用菱形，骷髅环弹保留圆形。全部绘制为橙红外光与暖白亮芯，抛物线弹同步橙红；弹速、伤害和碰撞半径保持。
- 新纹理每种只上传一次并复用，显卡上下文恢复时重建；渲染方向跟随实际速度。新尾部仅为视觉拖尾。
- npm run check、test-ranged-entry --hex、preview-enemy-bullets通过；真实Edge/WebGL验证9颗、3张纹理复用与零页面/GL错误，已查看tests/enemy-bullet-shapes-390.png。本地未发布，未做手机验收。

## 2026-10-31 本地：生成灰色伪立体落地残骸

- 按用户要求用内置imagegen独立生成三个透明PNG：assets/debris/gray-block-a.png（缺角短块）、b（长楔块）、c（三角块）。顶面/暗侧面/轻接触阴影形成顶视角伪立体，原始素材与提示词保存在同目录，未裁切拆图。
- 空中翻滚碎片按i%3分配落地素材；落地烘入地块共享贴图，取消按怪物颜色画平面矩形，改用灰色素材并以.48不透明度降低存在感。预加载；未加载完成则等加载后烘入，原地块已移除时丢弃等待项。
- 地块画布64提升至128以保留细小侧面层次，每格仍128印记上限，按需上传与单地块绘制，纹理复用及清理保留。143格RGBA原图约8.94MiB（不含Canvas与驱动开销），不随碎片总数无界增长；未做手机性能测试。
- npm run check、preview-death-debris（新增3素材加载、灰度色差6、单印记alpha121/255、128尺寸断言）、preview-death-tumbling、test-particle-surfaces通过；真实Edge/WebGL零错误。已查看三种生成素材与death-debris-decals-390.png，确认灰色低存在感；本地未发布。

## 2026-10-31 本地：多轴翻滚碎片、数量与持续亮粒子

- 普通敌人每次死亡固定40片、Boss64片，替代按体型网格取样导致小怪仅数片；同时活动上限384。长宽厚比例随机，三个旋转轴各16–34rad/s；共享residentMesh单位块与实例矩阵，热色/冷色有限缓存，不逐帧重建几何。
- 多数碎片以90–240速度落在附近，1/4以260–460远射；保留真实地面落地烘入贴图，空洞坠落规则。
- 飞散亮光线持续时间由.48延长至.85秒，长度衰减放慢；几何碎片heatLeft由.3延长至.7秒，约.58秒可见炽亮与小辉光。中心高光仍150ms缩小消失。
- 用户要求降低声音，死亡爆炸增益由.65调至.65*2/3（约.4333）。
- npm run check、test-particle-surfaces、preview-enemy-death、preview-death-debris、新增preview-death-tumbling通过；真实Edge验证小体型也40片、XYZ角位移、resident GPU缓冲复用、实际死亡后落地残骸及384上限、持续炽亮和零页面/GL错误。已查看death-debris-tumbling-390.png。本地未发布，未做手机性能验收。音量调整后node --check通过。

## 2026-10-31 本地：比特爆炸音与落地残骸贴图

- 用tools/build-bit-explosion.py原创程序合成0.38秒8-bit风格爆炸（阶梯方波下扫、采样保持噪声及量化），输出assets/audio/enemy-death-bit.wav，死亡音效改用新文件，保留音量/静音/并发控制。
- 普通敌人死亡碎片标记deathDebris，飞行寿命1.8秒、同时最多160片；碰到实际地面后停止模拟，将冷却色碎片烘入所属地块64×64透明Canvas。每格最多128次印记，满后保留已有；无地面继续坠落，掩体顶仍走现有反弹。
- 地块共用单张贴图，仅变脏时上传，每个有残骸地块一个绘制；六边形画布裁切、随地面升降。移除地块时释放GPU贴图，换层随旧地块清理。显存按有残骸地块数增长，不按残骸片数增长；143格RGBA原图约2.24MiB，不含CPU画布/驱动开销，未做手机性能基准。
- npm run check、test-particle-surfaces（方/六边形）、preview-enemy-death（真实Edge音频解码0.38秒/静音/节流/高光边界）、preview-death-debris通过；后者验证真实落地转换、128上限、持久保留、贴图复用与删除清理，零页面/GL错误，已查看death-debris-decals-390.png。本地未发布，未做主观听感与手机实机验收。

## 2026-10-31 本地：简化新增枪口火花

- 按用户反馈以 imagegen 重绘为三个大尖角，移除碎火星和密集锯齿，橙/黄/白三层主体，保留底层辉光。新素材 gun-muzzle-simple-v2.png 已接入共享 renderer.muzzleFlash。
- npm run check、preview-angular-muzzles真实Edge/WebGL通过，4张枪口火花，零页面/GL错误；已查看截图。本地未发布。

## 2026-10-31 本地：死亡高光缩小消失与柔边

- 按用户要求，高光改为约27ms快速展开、随后持续缩小，150ms时尺寸归零；外圈柔光同步收束，替代仅透明度消失。
- 收窄放射尖角，去掉大面积实心火团，用中心到边缘的透明度渐变叠出模糊柔边、橙黄色晕光与细暖白亮芯；复用程序几何，无新增图片资源。
- npm run check、preview-enemy-death真实Edge/WebGL、test-particle-surfaces通过；新增收缩尺寸递减/150ms归零断言。已查看更新的enemy-death-highlight-390.png，确认细光刺及柔光。本地未发布，非手机实机验收。

## 2026-10-31 本地：补齐枪口尖角火花

- 检查主武器共用 drawGunMuzzle / 初始手枪特效均已有火花；补齐只有辉光的机枪炮台（含生存临时炮台）、旧版枪支/Uzi，以及无枪口效果的霰弹塔双管和狙击塔。保留已有主武器效果。
- imagegen 生成单张透明橙红/亮黄/白芯尖角素材 assets/gun-muzzle-angular-v1.png；renderer.muzzleFlash 共享图片缓存，先绘圆形辉光，再叠透明火花，跟随枪口朝向。防御塔独立 muzzleLeft=.11 秒，与设施工作 flash 分离。
- npm run check、test-machine-turret、test-more-towers、test-weapon-vfx通过。preview-angular-muzzles真实Edge/WebGL加载纹理，确认双管/狙击/机枪共4张火花，零页面/GL错误；已查看 tests/angular-muzzle-towers-390.png。截图固定开火瞬间；未做手机实机验收。本地未发布。

## 2026-10-31 本地：远程飞入与安全射距

- 普通飞行射手按当前renderer.vp（含镜头跟随/缩放）在画面外25%余量处生成，190速度连续飞入，入场禁火，进入可见射距后保留开火延迟；Boss、浮桥与地面运输独立规则保留。
- 普通射手保留200–235目标射距，180以内加快退让，150以内禁火、取消待发双枪/激光；飞行退让不再被地图边界钳住。隐形机伏击半径108改175，显形/攻击阈值205/190。
- npm run check、test-ranged-entry --hex（模拟镜头缩放、七类远程、连续入场/禁火/退让）、test-enemy-balance --hex、test-enemy-flight、test-bridge-pressure --hex通过。逻辑和渲染mock测试，未做实机视觉/手感验收，本地未发布。

# 本次更新：2026-10-31 本地敌人数量平衡

- 普通关前6层每批5只由3接触/2远程改为1接触/4远程，之后2接触/3远程；有限关卡总量保持。前6层远程血量为原60%，之后75%；前期远程在场上限由5提高至8。
- 浮桥独立增援间隔按章节由0.65/0.55/0.45秒改为2/1.6/1.2秒，地面在场上限12/18/24降至3/5/7，批量入场也遵守上限。
- npm run check、test-enemy-balance --hex、test-bridge-pressure --hex通过；基础手枪守口模拟不再被蜘蛛突破，因此test-spider-pressure改为验证可守住且有击杀。仅逻辑模拟，未做实机手感验收，本地未发布。

# 地狱电梯：当前状态

## 2026-10-31 本地：加强短促大面积死亡爆炸

- 用户反馈此前高光与声音难辨认，按合金弹头参考加强：高光线性尺寸约为上版2.5倍，增加填充面积与叠加火团；前0.10秒保持全亮，0.10–0.15秒快速收掉。高光移到死亡烟雾之后绘制，避免早期烟雾压暗。
- 死亡录音增益从.22提高至.65（约2.95倍）；保留静音、总音量、限幅和并发控制。飞散光线速度倍率1.4提高至2.1，实体碎片水平速度180–540。
- npm run check、preview-enemy-death真实Edge/WebGL、test-particle-surfaces通过；已查看更新的tests/enemy-death-highlight-390.png，确认爆炸显著大于角色轮廓。验证0.15秒结束、静音/节流、有限几何和零GL/页面错误；未做主观听感或手机验收，本地未发布。


## 2026-10-31 本地：敌人死亡爆炸音效与高光

- 使用用户提供的 Explosion Grenade_02.wav，原样复制至 assets/audio/enemy-death-grenade.wav，替换 deathSound 合成音；音频解锁时预载，复用总音量、静音、限幅与并发上限，60ms密集触发节流，默认混音22%。
- 敌人死亡前0.15秒新增稳定随机尖角高光：橙红外沿、亮黄主体、暖白核心与柔光，短促闪动淡出；复用现有程序几何。飞散光线速度提高40%，实体碎片水平速度由80–260提高至130–390，竖直速度由90–190提高至125–270；敌人死亡烟雾扩散与烟团半径增加22%。
- npm run check、test-particle-surfaces、preview-enemy-death通过；真实Edge/WebGL验证录音解码与路由、静音/节流、0.15秒高光边界、碎片力度、有限几何及零页面/GL错误。已查看tests/enemy-death-highlight-390.png和enemy-death-smoke-390.png。本地未发布；未做主观听感或手机实机验收。


## 2026-10-31 本地：掉血端点纵向闪光

- 掉血后的新端点闪出三倍血条厚度的纵向光线，白色亮芯、两层暖白柔光、上下渐隐，持续0.3秒。记录本次掉血比例，随角色移动但不追随后续血量变化；沿用原掉血碎片与96项上限，不受灯光/阴影影响。
- npm run check、preview-health-bars真实Edge/WebGL通过，验证2/3降至1/3时端点位置、30/10三倍长度和移动跟随，零页面/GL错误；已查看截图。本地未发布。

## 2026-10-31 本地：怪物血条可读性

- 根据用户截图，将非主角血条宽度缩至78%，高度从6增加到10；大胶囊端头改为小圆角，配合深蓝灰空血底与亮暖米色血量，接近主角硬朗色块风格。保持无框、无分格、无光照/投影与常驻网格复用。掉血反馈记录使用调整后的尺寸。
- npm run check、preview-health-bars真实Edge/WebGL通过：标记、缓冲复用、AO/阴影、零页面/GL错误。已查看tests/health-bars-rounded-390.png近景，本地未发布。

## 2026-10-31 本地：修正侧面灯带位置并增加窄柔光

- 用户截图显示仅提亮仍难辨认。原灯带在-3.25至-4.25的顶板下沿，顶板外伸黑底衬遮挡且仅偏移.4。移至上层厚板外露侧壁-10.75至-11.75，向外偏移1.4越过顶板投影边缘，暗衬对应移至-9.5至-13并偏移1.2。保留1单位亮芯及3倍自发光。
- 新增共享resident窄柔光网格，垂直边缘渐弱，以透明加法材质绘制，保持遮挡，不改变光柱或全局亮度。配色改变时释放旧柔光缓冲。
- npm run check、test-hex-city（含移动）、preview-tile-beams、preview-hex-floor-finish通过。新增preview-rim-visibility固定相机/时间做旧位置无柔光与新位置柔光对比，真实Edge/WebGL有712个明显增亮像素，无页面/GL错误；已查看390修复截图。本地未发布。


## 2026-10-31 本地：角色血条光影与圆角

- 血条使用专用UI法线标记1.8：普通/常驻着色器直接保留原色，SSAO不压暗，阴影贴图丢弃该标记。主角保留外框与分格；非主角改为无外框、无分格的连续圆角条，三部分常驻网格复用，血量变化仅更新实例。
- npm run check、preview-health-bars实际Edge/WebGL通过（标记、缓冲复用、AO/阴影通道86帧、零GL/页面错误），已查看tests/health-bars-rounded-390.png；preview-scene-occlusion输出阴影/AO像素变化与复用通过。test-game-feedback未通过既有开场飞机类型断言，未到血条部分；旧preview-character-outline首次运行等待开场超时。本地未发布，非手机实机验收。

## 2026-10-31 本地：激光炸弹矩形光束修复

- 根因：炸弹光束使用两层纯色stroke矩形。改用已有laserFlow程序纹理，粉色柔边光晕与窄亮芯双层流动，增加轻微脉动及结束淡出；renderer.laserFlow新增可选颜色参数，原调用默认效果保留。伤害、旋转、跟随与升级范围不变。
- npm run check、test-bomb-facilities、test-bomb-equipment、preview-bomb-facilities通过；真实Edge/WebGL四束旋转、GPU恢复及零页面/GL错误，已查看tests/bomb-facilities-laser-390x844.png。本地未发布，非手机实机验收。

## 2026-10-31 本地：统一蓝色并增强灯带发光

- 按用户要求取消蓝橙交替，所有地块灯带与光柱统一基础蓝色#2080ff；调色面板合并成单项“地块灯带与光柱颜色”，使用hexNeonColor避免旧交替配色覆盖。
- 灯带自发光顶点强度提升至3倍，保持此前2/3厚度；光柱保留125长度、不透明度.24与连续渐隐。
- npm run check、test-hex-city（含移动）、preview-tile-beams通过；实际Edge/WebGL验证统一蓝色、灯带强度与光柱颜色对应、27实例及缓冲复用、无页面/GL错误，已查看390最终截图。本地未发布。


## 2026-10-31 本地：统一特殊设施地板柔光 BLOB

- 根因：hex-map基础光斑已覆盖设施，但electric-tiles的明显柔光池仅电塔调用。将electricLampFloor改为共享facilityFloorBlob，在每个设施核心调用一次；电塔保持原青色，其他设施跟随defs.color，掩体/普通地块不新增光源。保留电塔球体光晕、实际地板裁切、黑缝、洞口与地块升降处理。
- npm run check、test-defense-towers、test-electric-tiles、preview-floor-blob、preview-electric-lamp通过。新增preview-facility-blob真实Edge/WebGL逐一验证电塔/导弹塔/霰弹塔/狙击塔/维修塔/矿机/导弹补给的柔光开关像素差异（每种超过14000像素），零页面/GL错误；已查看导弹塔390截图。本地未发布，非手机实机性能验收。


## 2026-10-31 本地：地块灯光改蓝橙交替

- 按用户要求将地块固定交替配色改为高亮蓝色#268cff、橙色#ff8a24，灯带与对应光柱同色。调色配置使用hexNeonBlue/hexNeonOrange，避免旧保存的青粉默认值覆盖新配色。
- npm run check、preview-tile-beams通过：两色、逐格灯带/光柱对应、灯带厚度、全地形覆盖与GPU缓冲复用，无页面/GL错误。本地未发布。


## 2026-10-31 本地：怪物着色器中间调提亮

- 画面调节 → 光照与着色器新增“怪物中间调提亮（%）”，默认25，范围0–60，0恢复原效果；即时生效、自动本机保存、恢复默认支持，独立于后处理总开关。
- 两种表面着色器共用亮度权重 4Y(1−Y)，按原色同比例提亮，黑色与白色端点保持；发光材质不提亮。复用既有怪物分组（.5），排除阴影网格；普通几何按现有范围绘制，常驻网格按连续实例分组设置uniform，保留实例布局与显存常驻，不新增贴图/后处理pass。角色、塔、背景不提亮。
- npm run check、preview-surface-shader、preview-character-outline及新增preview-enemy-midtone通过：实际Edge/WebGL两种着色器像素增亮、0精确恢复、面板保存/刷新、原描边与GPU常驻复用。截图tests/enemy-midtone-before.png、enemy-midtone-after.png，已查看后图；非手机实机视觉验收。本地未发布。


## 2026-10-31 本地：青粉交替灯带与同色光柱

- 侧面霓虹灯带高度1.5减至1（原2/3），按地块坐标x+y奇偶固定分配高亮青色#35ffff/粉色#ff52cf，无时间变色；每块光柱使用对应同色。光柱保留125长度与.24不透明度。新增画面调节灯光A/B颜色，原包边颜色项改为设施地板光斑。
- 柱体与光柱缓存键包含颜色，两类光柱共享网格，修改配色时统一释放重建，平时复用。
- npm run check、test-hex-city（含移动）、preview-tile-beams、preview-floor-blob通过；真实Edge/WebGL验证两色、逐格对应、灯带高度1、全27格光柱、缓冲复用、125长度与无页面/GL错误，已查看390截图。本地未发布。


## 2026-10-31 本地：电塔接入项目电流音效

- 电塔成功自动放电后调用既有plasmaLightningSound，复用assets/audio/plasma-lightning-impact.wav，与电浆炸弹拾取同源；沿用音量、静音、预加载及80ms防密集播放。无目标/冷却/暂停不额外发声。
- npm run check、test-defense-towers（新增攻击声音触发及无目标/冷却/暂停断言）、test-electric-tiles通过；新增preview-electric-tower-audio实际Edge/WebAudio确认电塔声音节点使用正确解码WAV缓冲、密集限制、静音及无目标不播放，无页面错误。本地未发布。

## 2026-10-31 本地：截图复查并增强地板 Blob

- 用户反馈不明显，新增preview-blob-visibility固定电塔、镜头与暂停时钟，隐藏开场横幅，输出同视角开关截图。原Blob峰值.3，实际受影响像素平均RGB增亮约9.7/255，视觉容易被电球与背景抢走。
- 将峰值提高至.65，保留2.6格衰减、仅设施核心为源、黑缝及重叠取最大值。相同场景增亮均值约18.8/255，无额外点光或pass。
- npm run check、preview-floor-blob、preview-blob-visibility通过；实际Edge/WebGL无页面/GL错误，范围/重叠封顶/旧缓冲释放/复用通过。已查看tests/blob-visibility-before-390.png与blob-visibility-on-390.png。新增诊断脚本只在测试页面停止RAF以固定对比画面。本地未发布。

## 2026-10-31 本地：恢复连续光柱

- 按用户要求移除刚加入的波点遮罩，恢复连续渐隐蓝色光柱；保留125长度、不透明度.24及全地形覆盖。
- npm run check、preview-tile-beams通过。本地未发布。


## 2026-10-31 本地：光柱波点纹理

- 光柱材质模式4加入规则圆形波点透明遮罩，环向18列、竖向12单位间距，边缘柔化并沿柱长继续渐隐；保留125长度、蓝色、不透明度.24及全部地形覆盖。程序纹理无需新增贴图或顶点上传。
- npm run check、修改间node --check dist/renderer.js及preview-tile-beams通过；实际Edge/WebGL 27实例、蓝色与长度、GPU缓冲复用及零GL/页面错误，390/1280截图，已查看390最终效果。本地未发布。


## 2026-10-31 本地：电塔顶部电球缩为3/4

- 电球半径14→10.5，球面渐变按新半径归一化；球外Blob半径35→26.25同步缩小。球心高度、塔身、地面照明与背光参数保持原值。
- npm run check、test-defense-towers、preview-electric-lamp通过；实际Edge/WebGL验证模型最高点67.5、缓冲复用、地板照明及零GL错误，已查看tests/electric-lamp-after-closeup.png。本地未发布。


## 2026-10-31 本地：光柱长度减半

- 光柱长度250减至125，底板下方-34至-159；同步渐隐范围，保留全地形覆盖、蓝色与不透明度.24。
- npm run check、preview-tile-beams通过：27地形实例、125长度、蓝色、缓冲复用及零页面/GL错误。本地未发布。


## 2026-10-31 本地：全地块短蓝光柱与半透明度

- 按用户纠正，所有地形格均提交光柱实例，设施核心限制只继续用于地板Blob。光柱恢复250单位（底板下-34至-284），固定蓝色#2080ff并移除提白；最新要求将不透明度.48减半至.24。保留三倍厚度双层地块、下层黑色及平面敌人浮桥。
- npm run check、test-hex-city（含移动）、test-hex-terrain、preview-tile-beams通过；后者验证27格均有光柱、长度250、蓝色顶点、GPU缓冲复用与零页面/GL错误，已查看390完整场景截图。本地未发布。


## 2026-10-31 本地：水花透明度、速度与飞溅小水滴

- 水花透明度按当前3/4调整（峰值.72→.54），水圈及溅滴共用动画时钟加速1.5倍；每次落点追加最多5颗细小水滴，按不同方向、距离和高度走短抛物线并渐隐，沿用雨开关与地块高度。光照和前景雨幕参数保持原样。
- npm run check、test-hex-terrain、preview-rain-foreground通过；实际Edge/WebGL 390/1280截图、有限顶点、灯光一致与零页面/GL错误验证通过，已查看390截图。本地未发布，未手机实机性能验收。


## 2026-10-31 本地：三倍厚度双层地块与长光柱

- 打开本地预览检查原光柱难以辨识。光柱从250延长至1200单位，移至加厚底板下方-34至-1234，渐隐指数2改.85、透明度.26改.48，提白并使用专用加法混合；保留仅设施核心发光规则。
- 地块总厚度12改36，上层保留原色，下层18单位默认黑色；画面调节新增独立下层颜色，旧保存配置自然使用新黑色默认值。敌人浮桥保持无厚度。
- npm run check、test-hex-city（含移动）、test-hex-terrain、preview-tile-beams、preview-hex-floor-finish、preview-floor-blob通过，真实Edge/WebGL验证光柱像素、常驻缓冲及零GL/页面错误；已查看390完整场景截图，光柱可辨识。未发布，未手机实机验收。


## 2026-10-31 本地：发光源限定设施核心

- 光柱与Blob共用isLightCore判定：所有ElectricTiles.defs设施（含防御塔、生产格、农田、炸弹及辅助设施）仅核心格发光；非核心占地、空白地板、掩体不独立发光。旧医疗/护盾/金钱/震荡单格同样适用。Blob依然可照亮周围已有板面。
- 修正此前每个占地都提交光柱的规则。多格设施用ElectricTiles.coreCell既有核心定义，炸弹等中心核心不改成锚点。
- npm run check、test-hex-city（含移动）、test-hex-terrain、preview-floor-blob、preview-tile-beams通过；真实Edge/WebGL验证全部设施定义恰好一个发光核心、掩体/空地排除、单核心单光柱、Blob像素增亮/范围/重叠封顶与缓冲复用/释放，无页面/GL错误。本地未发布。

## 2026-10-31 本地：薄地块、无厚度浮桥与六边形光柱

- 主地块从深柱改为顶面+2、底部-10的薄板，移除侧壁流光网格，保留窄霓虹包边和地板Blob。敌人浮桥去掉侧壁、底面与下缘，只留平面填充、边框和方向标记。调色面板改名“六边形地块颜色”，移除流光选项。
- 按追加要求，每块薄板下方增加开放式半透明六边形光柱，沿用霓虹包边颜色，向下250单位渐隐；共享resident材质和缓冲，新材质模式4控制透明度，常态不重建顶点。
- npm run check、test-hex-city（含移动）、test-hex-terrain、test-bridge-room、preview-hex-floor-finish、preview-bridge-visible通过。preview-tile-beams实际Edge/WebGL验证34673个发光像素、27个地块实例、共享缓冲复用、浮桥平面和零页面/GL错误；已查看390截图。本地未发布，未手机实机验收。原preview-hex-circuits针对已移除的侧壁网格，不再适用于当前造型。


## 2026-10-31 本地：设施地板 Blob 假光

- 设施核心及医疗/护盾/金钱/震荡格为光斑中心，半径2.6格柔和衰减，颜色沿用顶部霓虹包边。只在已有六边形板面内提亮，保持黑缝，重叠取最大值并封顶，不新增点光源。
- Blob作为板面颜色光照贴片烘入独立resident网格，平时只提交实例；设施源位置或包边颜色变化时释放旧缓冲并重建，无逐帧顶点重建或多层透明叠加。跟随地板升降，设施 raised 核心保留原基座。
- npm run check、test-hex-city（含移动）、test-hex-terrain、preview-hex-floor-finish、preview-hex-circuits通过；新增preview-floor-blob实际Edge/WebGL验证11294个增亮像素、板面边界、远处零贡献、100光源重叠封顶、移除后缓冲释放及常态复用，390/1280截图无页面/GL错误。已查看390截图。本地未发布，未手机实机性能验收。

## 2026-10-31 本地：六边形柱体颜色配置

- 画面调节新增“六边形柱体颜色”：侧壁底色、侧壁交替色、顶部霓虹包边、侧面网格流光四个颜色选择器，沿用自动保存与恢复默认，独立于后处理开关。默认保持原色；修改时释放对应柱体/流光GPU缓冲并重建，平时继续常驻复用。
- npm run check、test-hex-city（含移动）、test-hex-terrain、preview-hex-circuits通过；额外真实Edge/WebGL检查实时网格颜色、旧GPU缓冲释放、新缓冲复用、刷新保存、恢复默认及零页面/GL错误通过。本地未发布，未手机实机验收。


## 2026-10-30 本地：提高雨滴水花可见度

- 按反馈将地面水圈最大半径3.6增至7.5、线宽.45增至1.05，峰值透明度.32增至.72并改浅冰白色；溅滴高度2.8增至6.5、加宽加长，单次可见周期.46增至.62。落点范围15收至12，扩大后仍留在六边形内部。保持场景光照与前景雨参数。
- npm run check、test-hex-terrain、preview-rain-foreground通过，真实Edge/WebGL 390/1280截图、有限顶点、雨开关与灯光一致检查通过，无页面/GL错误；已查看390截图。本地未发布。


## 2026-10-30 本地：关末场景倒计时跳字

- 普通、生存/巡弋、电锯及金蛛计时最后3秒共用屏幕跳字“3、2、1”，保留普通关原有5秒提示音；通关进入结算时弹出“胜利！”。按用户纠正，固定游戏画面水平50%、垂直32%处，不跟随角色或相机；复用cashPopups上浮和淡出，加大字号与缩放弹出，暂停遵循现有效果时钟。
- npm run check、test-saw-room、test-rail-room通过；新增preview-stage-countdown实际Edge/WebGL检查3/2/1及胜利DOM、390截图和零页面错误，已查看倒计时截图。test-game-feedback在开场敌群数量断言失败（发生在倒计时逻辑之前），未改动该断言或生成规则。本地未发布，未手机实机验收。


## 2026-10-30 本地：防御塔接入方向背光

- electric-tiles 为六类防御设施（电塔、治疗、导弹、霰弹、狙击、减速）与修理炮塔的实体网格提交包裹背光分组，固定基座和可瞄准炮头均覆盖；使用主角同款青色、同一来光方向/宽度/强度/柔光。try/finally恢复原分组，不把地面霓虹填充、工作指示、弹丸和其他设施纳入。沿用现有遮罩和常驻缓冲，无新增渲染pass。
- 面板改名“角色、怪物与防御塔背光”。护盾生产格属于补给设施，生产的护盾道具不按防御塔处理。
- npm run check、test-defense-towers、preview-defense-towers、preview-character-outline通过。新增preview-tower-backlight实际Edge/WebGL验证7类设施/9组实体网格标记、地面填充分组排除、1196个实际增亮像素、零重复静态上传、缓冲复用及390/1280截图，无页面/GL错误；已查看tests/tower-backlight-390.png。本地未发布，未手机实机性能验收。


## 2026-10-30 本地：柱体侧壁改十字网格

- 按用户要求用规则横竖交叉几何网格替换随机折线，每侧两列、横线间距约30世界单位，竖屏下保持可辨识的网格。保留顶部包边、深度雾和常驻缓冲；各柱仅流光相位/速度/方向不同，亮度下限从.055提至.16。
- npm run check、test-hex-city、test-hex-terrain通过；preview-hex-circuits实际Edge/WebGL隔离验证9860像素随时间变化、同时间零差、缓冲复用及无GL/页面错误；390/1280截图，已查看390截图。本地未发布。


## 2026-10-30 本地：均匀外描边改为有方向的背光

- 用户反馈首版像描边，缺乏背光感。character-outline 改用屏幕空间方向权重：迎光侧窄亮边、背光侧消失，剪影内缘增加窄幅亮色包裹，外部柔光朝来光侧偏移。仍不依赖低模法线，保留遮挡与缓冲复用。属于剪影背光近似，不提供真实光源投影或表面受光求解。
- 面板改名“角色与怪物背光”，新增来光方向0–360°（90°上、180°左，默认125°左上）；新默认宽0.9px、柔光1.1，已有保存参数继续保留。
- npm run check、preview-character-outline通过；后者追加实际GPU亮部重心随左右来光移动（约20像素）的验证，遮挡、双分组颜色、零静态重复上传、三尺寸、保存及上下文恢复继续通过。已查看tests/character-outline-closeup.png。仅本地未发布，未手机性能验收。


## 2026-10-30 本地：前景雨与六边形地面小水花

- hex-map 将三层常驻雨幕沿视线移到地图前（深度90/195/300），降低透明度保证地图可读；保留原雨纹动画、深度测试及现有场景光照。
- 已占用六边形内生成细小扩散水圈与短促溅滴，位置逐次变化，跟随普通/抬高板面高度，跳过隐藏及尚未升起的地块，沿用雨效开关。
- npm run check、test-hex-city（含移动）、test-hex-terrain通过。新增preview-rain-foreground实际Edge/WebGL检查三层深度、雨开关、水花有限顶点及灯光参数一致；390/1280截图无页面/GL错误，已查看390截图。本地未发布，未手机实机性能验收。


## 2026-10-30 本地：六边形柱体侧壁几何流光

- 移除重复固定竖直灯条，增加六侧贴面折线带：暗槽与青蓝窄线分层法线偏移；32组常驻网格变体，由格子坐标稳定选择，独立于设施类型和升降高度。保留顶部霓虹包边和原地板。
- 普通与resident片元着色器增加专用5.4–5.49法线长度材质标记，以时间与世界高度控制亮头/拖尾强度，速度、方向和相位逐线路变化。线体不移动，亮度沿单调下降折线传播，交给现有后处理产生辉光，保留深度测试和城市雾；不新增灯光或逐帧线路上传。
- npm run check、test-hex-city（含移动）、test-hex-terrain、preview-hex-floor-finish通过。新增preview-hex-circuits实际Edge/WebGL隔离线路验证时间变化5330像素、同时间回放零差、场景21种变体、有限顶点、GPU缓冲复用及无GL错误；390/1280截图，无页面错误。已查看390宽实际截图。仅本地未发布，未手机性能验收。

## 2026-10-30 本地：角色与怪物屏幕空间霓虹外描边

- 新增 dist/character-outline.js：全分辨率 RGBA 遮罩存储打包深度与角色分组，复用场景、动态几何、resident 网格及实例姿态缓冲；主角/坐骑/装备青色，怪物（含特殊敌人与运输中的载荷）紫色。基于剪影外扩生成细亮边和弱外围柔光，不依赖法线或面数。不描血条、地面影圈、易伤提示及普通设施。
- 普通场景几何同时写遮罩深度，完全遮挡的角色无描边，外扩采样也比较深度避免覆盖前景。位于场景遮蔽之后、半透明与粒子之前合成。相互接触的角色共享可见剪影，不生成每只敌人的内部 ID 分界；贴图水果尚未纳入此深度预通道，与原场景遮蔽的覆盖范围一致。
- 画面调节新增“角色与怪物外描边”：默认开启，宽1.25 CSS px、亮度0.8、柔光0.45，可调、保存、恢复默认；遵循后处理总开关及 postfx=off/bloom 绕过。GPU目标按尺寸复用，显卡上下文恢复后重建；失败回退并警告。
- npm run check、test-performance、test-added-enemies、test-defense-towers、test-enemy-transports、test-enemy-flight 通过。新增 preview-character-outline 真实 Edge/WebGL 验证主角/怪物两色实际像素、完全遮挡零轮廓、零重复静态上传、缓冲复用、320/390/1280窗口、面板参数保存及上下文恢复；preview-post-process、preview-scene-occlusion回归通过，无页面/GL错误。已查看 tests/character-outline-closeup.png。仅本地未发布；新增全场景遮罩pass和全屏采样，未手机实机性能验收。


## 2026-10-30 本地：游戏外底座霓虹调试台

- 新增 /tower-neon-debug.html 和独立JS：调中心/中段/边缘亮度、中段位置、透明度、提白；明亮/柔和预设、恢复默认、复制参数。通过同源localStorage storage事件同步到游戏，自动保存；首次需刷新原游戏加载新代码，同一浏览器窗口并排使用。
- electric-tiles 读取并限制参数，只有编辑后才释放旧填充缓冲并重建对应小型共享网格，平时保持常驻复用。默认中心1.4/中段1/边缘.5，比上一版提亮。保持塔模型与战斗行为。
- npm run check、node --check dist/tower-neon-debug.js、test-defense-towers、preview-defense-towers及新增preview-tower-neon-debug通过。实际Edge/WebGL验证跨页即时颜色变化、两页刷新持久化、恢复默认、编辑间GPU缓冲复用、390/900布局、无页面/GL错误；已查看390调试台截图。本地未发布，未手机实机验收。

## 2026-10-30 本地：底座霓虹改为中心亮、边缘暗

- 按用户要求反转填充渐变：中心强度1.25，半径60%处.72，边缘.22，保持原塔色和常驻网格复用。
- npm run check、test-defense-towers、preview-defense-towers通过；已查看390宽WebGL截图，三尺寸无页面/GL错误。本地未发布。

## 2026-10-30 本地：底座填充提亮至机器人脸部观感

- 按用户截图继续提高霓虹填充：透明度 .68→.96，中心自发光 .42→.95，边缘最高1.2，颜色混入30%白色，形成明亮彩色发光板面。仍复用常驻网格。
- npm run check、test-defense-towers、preview-defense-towers通过；已查看390宽实际WebGL截图，五类塔底座明显发亮，三尺寸无页面/GL错误。本地未发布。

## 2026-10-30 本地：防御塔六边形霓虹填充

- electric-tiles 给防御塔、修理炮塔及护盾塔的占地六边形增加半透明自发光填充，按设施颜色从浅色中心渐变到明亮边缘，保留原外框；避开隐藏和升降中的地块。
- 每种塔共享 residentMaterial 网格，首次生成后复用，保持原塔模型及战斗行为。npm run check、test-defense-towers、preview-defense-towers通过；真实Edge/WebGL三尺寸截图，无页面/GL错误，已查看390截图。仅本地未发布，未手机实机验收。

## 2026-10-30 本地：电塔地面受光增强

- 用户反馈首版看不出照明：原半径24脚下Blob基本被底座遮住。改为对塔周边真实地板多边形投射青色柔光，使用世界距离连续衰减，三角形细分采样；覆盖相邻地块，保持黑缝、空洞、地图外不染光。普通透明混合限制多塔叠加，不新增点光/Bloom。电球外光晕半径29→35并加强透明度。
- npm run check、test-defense-towers、preview-electric-lamp通过。新增实际GPU光斑开关对照：关闭Bloom和角色点光时，390拉近视图有26590像素的绿蓝通道增亮超过12色阶。两着色器、390/1280、模型缓冲复用和无GL错误验证通过。已查看新版tests/electric-lamp-after-closeup.png。地面光片为逐帧透明几何，尚未手机性能验收。本地未发布。

## 2026-10-30 本地：电塔柔光灯样板与顶部大电球

- electric-tiles 保留电塔原有线圈、支架和底座，resident 构建时复制原导出网格并提亮冷色金属，不修改原资产。顶部新增半径14、中心高度57的青蓝电球，烘焙球面渐变并使用自发光标记；总高度由47增至71。两套表面着色器均可用，无需点光或Bloom。
- 球外与脚下加入低透明度、径向羽化的Blob光片，沿用深度测试与普通透明混合；地面半径24，避免越出单格。未增加点光、屏幕模糊或全局曝光调整。实体模型保持常驻缓冲复用；Blob透明几何随帧提交。
- npm run check、test-defense-towers、preview-defense-towers通过。后者同步旧护盾塔分类断言为现有supply，并允许电塔保留原位置且追加电球和灯具材质。新增preview-electric-lamp，真实Edge/WebGL验证三塔、两套着色器、关闭后处理和角色点光、390/1280视口、有限顶点和缓冲复用，无页面/GL错误。已查看tests/electric-lamp-after-closeup.png。仅本地未发布，未手机实机验收。

## 2026-10-30 本地：恢复地板亮度、顶部侧面霓虹包边

- 按用户反馈取消逐格径向暗化，恢复原 #455266 均匀板面亮度，减少格子的独立明暗感；保留黑缝和未建造位置不显示勾线。
- 每个地块柱体六个竖直侧面在顶部下方10–12.5单位增加连续蓝色霓虹包边，配下沉暗色衬底，沿面法线错开避免闪烁；共享 resident 网格一次生成。
- npm run check、test-hex-city（含移动）、test-hex-terrain、preview-hex-floor-finish通过。真实Edge/WebGL专项验证原板面均匀亮度、六侧灯带、黑缝、空位零勾线、缓冲复用及390/1280宽截图，已查看390截图，无页面/GL错误。本地未发布。

## 2026-10-30 本地：六边形地板径向光泽与黑色接缝

- 移除 hex-map 静态背景中未建造格子的常驻勾线；摆放扩建提示仍由 ElectricEditor 动态绘制。
- 地板删除原有自发光亮边，加入下沉近黑背板遮住缝隙下的明亮城市；板面改为蓝灰色中心亮、边缘暗的平滑径向光泽。渐变顶点色仅在共享 resident 网格首次构建时生成，保留场景光照与角色点光，不新增着色器或逐帧网格上传。
- npm run check、test-hex-city（含移动）、test-hex-terrain 通过；新增 preview-hex-floor-finish 真实 Edge/WebGL 验证空白背景零勾线、板面径向亮度差、黑色接缝材质、常驻缓冲复用和390/1280宽战斗截图，无页面/GL错误。已查看 tests/hex-floor-finish-390.png。本地未发布，非手机实机验收。

## 2026-10-30 本地：暂停调光照后键盘移动恢复

- 复现后处理滑条持有焦点时P被面板stopPropagation拦截，无法恢复；运行中焦点留在INPUT/SELECT会被原键盘处理忽略，松键也可能被面板拦截。game增加统一focusGameControls，恢复游戏时清理旧按键并聚焦Canvas；关闭画面面板时同样交还焦点。
- 游戏keydown/keyup改捕获阶段监听：P在非文本控件上可暂停/恢复且忽略按住重复；运行中画面/宣传面板内WASD可交还焦点并移动；暂停时滑条/下拉框的方向键继续原生调参；文本输入不接管。keyup始终清除移动状态，避免按住移动键后点入面板造成卡键。
- 新preview-controls-focus真实Edge/WebGL先复现旧P失败，再验证暂停调点光滑条/切换柔和卡通→P恢复、WASD与方向键实际位移、运行面板WASD、跨面板松键、关面板、暂停菜单继续游戏后的焦点与移动，无页面/GL错误。npm run check、preview-post-process、preview-pause-menu、preview-promo-mode通过。暂停菜单旧测试音乐基准从过时.35校正为当前music.js既有.32，未改音乐实现。截图tests/controls-focus-restored-390.png。本地未发布。

## 2026-10-30 本地：光照面板切换实体着色器

- “画面调节”顶部增加“光照与着色器”，下拉选择“原版 · 霓虹光照”或“推荐 · 柔和卡通”。默认保留原版，实时切换、保存到 neon-postfx-v1，刷新恢复，恢复默认回原版；非法保存值回退原版。着色器独立于后处理总开关及 postfx=off。已打开本地预览并选中推荐效果，未发布。
- renderer 共用 Soft Toon GLSL：柔和三段漫反射、冷色阴影、窄霓虹边缘光和小面积高光，地板降低高光、远景实体降低亮度。普通/静态网格、resident 角色敌人与设施、贴图水果接入同一规则；保留灯带招牌自发光、雾、受击闪白及专用透明/粒子效果。切换仅更新 uniform，无重编译、模型重建或重复静态上传。
- npm run check、test-performance、test-fruit-model-assets、preview-player-light、preview-post-process、preview-scene-occlusion 通过；新增 preview-surface-shader 真实 Edge/WebGL 验证像素变化、切回原版零像素差、普通/resident模式一致、程序与缓冲复用、贴图水果、UI切换/持久化/默认/非法值、三尺寸、上下文恢复和实战，无页面/GL错误。已查看 tests/surface-shader-controls-390.png、surface-shader-combat-toon-390.png 等截图。仅本地，未手机实机性能验收。

## 2026-10-30 本地：CRT RGB 色散

- 按老游戏机显像管方向增加 RGB 色散：辉光/色彩增益后拆分三通道，红蓝水平反向偏移，再合成并应用原有曲面畸变；完整场景及 HTML UI 一起生效，调参面板维持独立。默认开启、偏移0.6px，面板新增“CRT 色散”开关与0–4px强度，复用本机保存和恢复默认。
- 关闭色散、强度归零、总开关关闭、postfx=off/bloom 时绕过通道分离。未增加 JS 逐帧循环或 WebGL 几何上传。
- npm run check、test-performance、preview-post-process 通过；实际 Edge/WebGL 黑白边缘像素验证蓝/青/红分色、零强度/独立关闭/总开关精确还原，参数刷新保存/恢复、原 RGB/辉光/扫描线/暗角、三尺寸、上下文恢复及实战通过。已查看 tests/postfx-ui-arcade-390.png。仅本地未发布，未做手机实机性能验收。


## 2026-10-30 本地：固定镜头大小、摆放平移与点光颜色

- “画面调节 / 镜头”新增镜头大小（0.4–2，默认1，越小越近），独立于后处理总开关，实时保存。删除六边形地图宽度自动缩放和呼吸缩放，也删除电力编辑器 fitBoard 的面板避让缩放，地图扩张及进入摆放阶段均不再改变视野大小；正常战斗仍平滑跟随角色。
- 摆放/地块测试阶段从空白处、空地板或不可移动的初始核心拖动可平移镜头，已有建筑保持搬移手势；新增“镜头归位”。相机平移应用于统一视图矩阵，拾取、地板预览、拖放连线和强敌方向指示共用；支持CRT坐标反算、指针捕获/取消。退出摆放恢复角色跟随，重开清空平移。
- “角色头顶点光”新增原生颜色选择器与HEX显示（默认#ffdba3）；颜色同步世界点光和头顶天线发光点。保存值校验六位HEX，旧存储缺字段使用默认，恢复默认包含颜色。
- npm run check、test-electric-tiles、test-performance、preview-hex-camera、preview-post-process、preview-camera-controls 通过；preview-player-light 新增实际红/蓝GPU像素差、独立几何零强度/关闭一致性和颜色保存测试并通过。新增镜头专项覆盖准备阶段/空白处/空地板平移、固定缩放、地图扩张/时间不影响视野、平移后的放置与搬移、归位、CRT、三尺寸及退出恢复。已查看 tests/camera-size-controls-390.png、camera-panned-placement-390.png、player-light-controls-390.png。旧 preview-core-placement 在 electriclab 工具组隐藏处超时，未宣称该旧脚本通过。仅本地未发布，非手机实机验收。

## 2026-10-30 本地：角色头顶随行点光

- 在现有动态/静态网格及 resident 实例共用的顶点光照中增加暖白点光，按世界距离平方平滑衰减及表面法线受光；不增加绘制 pass、纹理或几何上传。每帧清空灯源，再按角色位置、上身/跳跃/坐骑高度设置；死亡后停止照明，无敌闪烁不闪灯。保留现有头顶天线发光造型。
- “画面调节”新增“角色头顶点光”折叠组：开关、强度（默认2.4）、范围（默认190）、高度（默认85，额外叠加角色姿态高度），实时生效、自动保存、恢复默认。点光属于场景照明，独立于后处理总开关及 postfx=off，便于单独关闭后处理时仍可照亮地板。
- npm run check、test-performance、preview-post-process、preview-scene-occlusion 及新增 preview-player-light 通过。真实 Edge/WebGL 验证亮度增加、零强度/关闭差≤1色阶、移动跟随、动态/常驻网格同一灯源、面板保存/恢复、上下文恢复，无页面/GL错误；已查看 tests/player-light-on-390.png、player-light-off-390.png、player-light-controls-390.png。仅本地未发布，未手机实机验收。

## 本地：扫描线可调滚动

- 扫描线分组新增scanSpeed（-40至40px/s），默认4，正数向下、负数向上、0静止；复用原设置持久化键，保留用户原强度/间距。关闭扫描线、强度归零或关闭总开关时暂停动画。CSS平移一个完整扫描线周期，使用上下各一周期的覆盖余量避免露边，无新增JS逐帧循环。
- preview-post-process实际Edge截图30像素纵条验证相位变化、正反向、静止状态、负速度刷新保存，原RGB/辉光/暗角、三尺寸及上下文恢复通过。npm run check通过。截图../outputs/scanline-scroll-controls.jpg。本地未发布，未手机实机验收。

## 2026-10-29 本地：修正CRT右侧残片与穿雾阴影

- 用户截图指出畸变右侧重复窄条。SVG filter/primitive统一使用userSpaceOnUse和游戏区实际像素尺寸，feImage与feDisplacementMap显式设置相同x/y/width/height，避免百分比区域与外层SVG/CSS视口错配造成越界重复采样。保留原曲率和指针反算公式。
- 原黑色遮蔽覆盖层会把已混入画面的雾色一起压暗。现复用renderer同一cityFogGLSL及参数，将雾视为T*surface+B：遮蔽合成用B（在黑色上计算的距离雾+四层解析体积雾散射色）替代纯黑，输出严格等价于先遮蔽表面再施加雾。预通道压缩法线X以存储独立城市雾标记，非城市表面不额外添雾；自发光和透明效果规则保留。
- npm run check、preview-scene-occlusion、preview-post-process、preview-promo-mode均通过。新增preview-fog-warp-fix实际Edge/WebGL：固定主光照、受遮挡城市标记方块，验证清晰场景阴影仍存在，距离雾后阴影差值降至24%、体积雾后降至9%，不透明雾下最大开关差≤1色阶；320/390/668/1280宽×三档曲率×七条水平扫描线无独立窄条，中心画面保持连通。无页面/GL错误。已查看tests/fog-warp-fixed-668.png。仅本地未发布，未手机实机验收。

## 2026-10-29 本地：街机曲面、SSAO 与主光源阴影

- 新增 dist/scene-occlusion.js，在 renderer 的不透明场景/常驻模型/水果之后、半透明/招牌/雨/弹丸之前执行场景遮蔽。半分辨率RGBA纹理存储16位打包深度和八面体法线，12方向SSAO加深接触处，深度感知柔化后合成。1024²方向光阴影贴图、3×3 PCF、法线偏移/深度偏移，光源方位同步主顶光方向。自发光标记不接收遮蔽；透明及弹丸不参与阴影投射。水果独立贴图网格尚不参与遮蔽预通道，主要角色/敌人/设施/地形及城市实体均使用现有几何缓冲。
- 所有预通道直接复用原静态/动态/常驻网格和实例姿态缓冲，不复制常驻模型顶点；关闭对应效果跳过采样/阴影pass，关闭总开关直接绕过。GPU资源按尺寸复用、上下文恢复重建；不支持时回退并记录console警告。
- post-process增加全UI+场景的CRT径向畸变，按尺寸生成一次位移贴图，ResizeObserver更新；Canvas/摆地块PointerEvent反向映射至源画面坐标，DOM控件保留浏览器原生操作。三组开关及曲率、AO强度/半径、阴影强度/方向/柔和度/偏移并入原紧凑面板和本机参数保存。调参面板本身在效果层之外。
- npm run check、preview-scene-occlusion（真实Edge/WebGL可控方块场景AO/投影/变向、零重复静态上传、曲面UI色块位移及反算坐标、三尺寸、实战、上下文恢复）、preview-post-process、preview-promo-mode（真实拖放/换装备/跳关）、test-weapon-vfx、test-performance通过；无页面/GL错误。已查看tests/occlusion-arcade-combat-390.png、occlusion-controls-390.png。仅本地未发布，未手机实机性能验收。
- 旧test-gpu-residency在“no per-frame static buffer upload”失败；从渲染源码读入内容中移除本轮drawSceneOcclusion接入后同样复现，未修改该旧基线；新增真实GPU专项已验证本次额外pass零重复静态上传。

## 2026-10-29 本地：后处理覆盖 UI、缩小参数面板

- 用户要求 UI 及以下统一受影响，覆盖下条“仅 WebGL 场景”方案。移除 WebGL 复制/模糊 pass，改为浏览器合成层 SVG 高亮提取、模糊、加法辉光及 RGB 矩阵，对整个 #viewport（Canvas、HTML菜单/血条/文字/按钮）生效；扫描线/暗角以最上层不拦截输入的覆盖层统一作用。调参面板为 body 下独立兄弟元素，不受效果影响。保留原参数和持久化键。
- 面板从280px宽大长面板改为218px宽，各效果默认折叠、一次只展开一组，参数区最高40dvh/340px并可滚动。面板默认关闭，只留小按钮；位置继续跟随居中游戏区右上角。
- npm run check、test-performance、preview-promo-mode与改写的preview-post-process通过；后者从浏览器截图实际读取HTML色块和下方Canvas像素，验证RGB/辉光/扫描线/暗角、全部关闭与原画面一致、紧凑面板/手风琴、参数保存/恢复默认、320/390/1280边界及限高、上下文恢复与实战，无页面/GL错误。已查看tests/postfx-compact-390.png；实战tests/postfx-ui-arcade-390.png。仅本地未发布，未手机实机性能验收。

## 2026-10-29 本地：可调复古街机后处理

- 新增 dist/post-process.js/css，在 index 的 renderer 后加载独立扩展，不改已有渲染源码。默认轻量辉光、扫描线和暗角；RGB 通道提供各自开关和增益。右上角“画面调节”有总开关、各效果开关及强度，辉光阈值/范围、扫描线间距、恢复默认；实时生效、独立 localStorage 持久化。URL postfx=off 强制绕过，postfx=bloom 仅辉光。
- 保留 WebGL1 画布抗锯齿，将不透明 RGB 画面复制到复用纹理，四分之一尺寸高亮提取/双向模糊再合成；高阈值控制紫雾溢光，属于画面高亮提取，并非单独自发光遮罩。HTML 文字/血条/控件不参与后处理。关闭辉光跳过三道低分辨率 pass，关闭总开关直接绕过。支持窗口变化、上下文丢失后重建，初始化失败回退原画面。
- npm run check、test-performance、test-weapon-vfx、preview-promo-mode 通过；新增 preview-post-process 实际 Edge/WebGL 验证中性参数与原画面像素一致、RGB 独立/辉光/扫描线/暗角实际像素变化、资源复用、UI调节、保存/刷新/恢复默认、320/390/1280布局、上下文恢复、实战及 URL 关闭，无页面/GL错误。已查看 tests/postfx-arcade-390.png 和 tests/postfx-controls-390.png。仅本地未发布，未做手机实机性能验收。

## 2026-10-28 本地：采用重新出图的透明 LOGO

- 用户要求参照原图重新生成透明底近似款，随后明确同意替换。使用 imagegen 重新绘制版本 dist/assets/neon-tower-logo-generated.png（1946×808 RGBA），替换上一版背景提取图；更新标题固有尺寸。无滤色混合。
- npm run check与../outputs/check-logo.cjs真实Edge/WebGL三尺寸320/390/1280加载、比例、边界、进入游戏准备与无页面/GL错误通过。已查看../outputs/logo-generated-preview-390.png。仅本地未发布，非手机实机验收。


## 2026-10-28 本地：宣传拍摄环境配色控制

- F4拍摄面板新增“环境光与城市配色”，原色/橙色/青色/玫红预设，主色色相、氛围强度、灯光亮度、雾浓度四项实时调节及恢复原色。橙色直达 `?promo=1&env=orange`，默认新用户保持蓝紫原色。
- 宣传模块包装StreetScene.lighting/draw，联动顶光、两侧光、真实距离雾及四层城市雾；自定义氛围去掉固定紫色grade，保留招牌/武器原色。无全屏滤镜、不重建场景几何，不改正式模式。设置保存在独立localStorage键，跳关/重拍/刷新保留，URL显式env优先。
- 面板增加限高滚动，320短屏能访问所有控制。npm run check、原preview-promo-mode与test-performance通过；新增preview-promo-environment真实Edge/WebGL验证滑条、四预设、恢复灯光/雾原值、保留几何引用、关雾、跨关/刷新/URL与普通入口隔离及三尺寸控件可达。橙色实景变化326995像素，平均R-B从-72.51变60.50，无页面/GL错误。已查看tests/promo-environment-orange-390.png，原色对照tests/promo-environment-original-390.png。仅本地未发布，未手机实机验收。

## 2026-10-28 本地：宣传面板快捷键避让性能检测

- 修复新增宣传面板与既有性能检测共同绑定F3的问题：宣传面板改为F4，性能检测保留F3；同步面板提示与README。下方宣传模式初始记录中的F3已由本条覆盖。
- preview-promo-mode增加交叉按F3/F4断言，确保两个面板独立切换；连续摆放测试固定随机选项，避免选项随机造成拖放用例波动。npm run check、test-performance及真实Edge/WebGL宣传专项全部通过。

## 2026-10-28 本地：宣传拍摄模式

- 新入口 `http://127.0.0.1:4173/?promo=1`，主页“试验场与场景预览”内也可进入。新增 dist/promo-mode.js，普通URL不激活。
- 每关沿用正式三选一拖放，成功摆放或合成后重抽可放选项，可连续多次；点“开始本关”再开战，可跳过摆放。普通模式仍限一次并自动进入准备动画。
- 面板支持全部33层、三个章节六种指定BOSS、五槽任意可用装备/品质；武器型号自带固定Tier。跳关/重拍保留装备、重置场地/酒/金币并补满生命。F3隐藏/恢复拍摄面板及F2入口，手机可收起面板。拍摄局不记录最高层/技能点。
- 根据追加要求，宣传模式关闭BGM，保留音效；暂停、跳关、BOSS换曲、声音开关均不能重新开启BGM。普通入口音乐规则保留。
- 追加音频验证：preview-promo-mode加入BGM停播/禁用、保留音效AudioContext、暂停/声音切换/BOSS换曲仍停播及普通音乐恢复断言，真实Edge/WebGL通过；test-music-ownership通过。npm run check再次通过。
- npm run check、test-electric-tiles、test-hex-campaign及其依赖（category-boxes/shop-stock/weapon-evolution/added-enemies）、test-talents通过。preview-promo-mode真实Edge/WebGL验证同层两次真实拖放、合成后继续选、开始开战、五槽换装、跨章节指定BOSS/保留装备/非法关卡、F3与320/390/1280布局、普通模式一次即结束、无页面/GL错误；截图tests/promo-mode-{width}.png，已查看390宽截图。preview-expansion-choice通过。
- 额外旧preview-building-merge在第20行失败：未拖动时断言两个“可合成”标签，当前既有实现仅drag同类时显示，该标签逻辑本轮未修改，不声称旧脚本通过；宣传专项已单独验证真实拖放合成后的继续选择。仅本地未发布，未手机实机验收。

## 2026-10-28 本地：LOGO 黑底抠成真实透明

- 按用户纠正，使用 imagegen 对原图做背景提取，保存 dist/assets/neon-tower-logo-transparent.png（1947×808 RGBA），标题页改用透明版。保留原始黑底资源作来源。
- 取消 screen 混合与上轮为混合而设置的 isolation/z-index/animation 覆盖，恢复普通图片合成；字面、紫色立体阴影、装饰与辉光保留。
- 已验证 alpha 同时包含0/255及半透明边缘、四角全透明；npm run check与真实Edge三尺寸320/390/1280标题加载、等比/边界、进入准备、无页面/GL错误检查通过。截图 ../outputs/logo-transparent-preview-390.png。仅本地未发布。


## 2026-10-28 本地：浮桥恢复从屏幕外接入

- 用户纠正“入口留在屏幕内”的方向，覆盖10月27日短桥要求。保留原岛屿落点/四个对角方向/每十层身份，将敌用桥沿同一射线延长至24格；固定13×11建筑地图与玩家可走格不变。去掉HexMap镜头强制容纳整桥的缩放和平移，保留正常缩放与角色平滑跟随。
- 敌人沿桥从距当前屏幕边缘48px外最近的可用位置进入，保留安全距离、体型间距、有限怪物池和独立增援；无有效投影时保留四格距离的多出生槽回退。实际从屏幕外进场会增加抵达岛口的时间；spider-pressure首接触mock12.46秒、真实Edge15.12秒，回归改为18秒内接触，生命/速度/击退不变。
- npm run check、bridge-room方/六角、bridge-pressure方/六角、spider-pressure通过。真实Edge/WebGL preview-bridge-visible覆盖13种子×3尺寸×5角色位置195组，检查桥尾/出生点在屏外、浮桥不改变镜头；preview-spider-pressure、preview-persistent-bridge、preview-hex-camera通过，已查看390宽浮桥接出屏幕截图。仅本地，未发布，未手机实机验收。


## 2026-10-28 本地：替换游戏开场 LOGO

- 使用用户提供的原始 PNG（1947×808）保存为 dist/assets/neon-tower-logo.png，开场标题引用新资源并更新固有尺寸，保持等比缩放。
- 新图黑底通过 CSS screen 混合融入夜城；标题菜单取消 isolation/独立层叠和入场动画隔离，避免混合只作用于透明菜单而残留黑色矩形，原图文件不加工。
- npm run check通过；../outputs/check-logo.cjs真实Edge/WebGL验证320×568、390×844、1280×900图片加载、比例、边界、进入游戏准备与无页面/GL错误。已查看390截图，预览../outputs/logo-preview-390.png。既有preview-title-screen已通过三尺寸前段，但其上下文恢复等待超时，未宣称该完整脚本通过。仅本地，未发布/重打试玩包，未手机实机验收。


## 2026-10-27 本地：装备电浆炸弹双色电弧与分叉

- 修复装备炸弹去除electricFacilityShot归属后落入旧drawArc的表现问题：独立plasmaDischarge标记继续经ElectricTiles.drawShot复用电塔/tesla_t3的双色细线、电弧路径与宽度，source仍为bomb。
- 电浆炸弹增加显式arcSegments树：玩家先发三路，之后每个命中点最多分两路；端点引用玩家/目标，持续0.8秒随对象移动。保留原选敌名单、数量、伤害递减顺序及一次命中；自动电塔原串联规则保留。
- test-bomb-equipment新增五品质实际装备绘制路由、双色、三根分支、命中双分叉、无环/不重复、移动、原伤害、危险炮台排除、暂停和消失验证。npm run check及bomb-equipment、electric-tiles、defense-towers、weapon-vfx、bomb-facilities通过。
- 新preview-plasma-branches真实Edge/WebGL验证320/390/1280宽实际双色渲染和分叉，无页面/GL错误，已查看390截图。仅本地未发布；未做手机实机验收。

## 2026-10-27 本地：猎蛛加血与初始手枪守桥压制修正

- 固定种子spider-pressure，角色站桥口/无敌观察、初始手枪、仅保留同一有限名单的猎蛛队列，旧配置18秒无任何接触（击杀16）；根因是B01猎蛛2.16生命（3发）、手枪1伤害/0.19秒且每击210初速×0.15秒指数衰减，完整推退13.16像素。手枪击退还绕过HexMap地面约束，可能推离窄桥。
- crawler生命倍率0.6→1（比当前+66.7%），B01 3.6生命/4发；速度108.16、模型70%、半径10保留。浮桥普通怪受到初始手枪35%击退（4.61像素），铁球15%（1.97像素）；其他敌人原短击退保留。浮桥击退改走HexMap.move(bridgeRoom.surface,...,7)，遵守实际桥+岛边缘/覆盖格变更，保留掩体处理和暂停。
- 新tools/audit-spider-pressure.cjs复现守桥口实际射击；test-spider-pressure加入npm test，验证新配置1.98秒首次接触、持续队列不被无伤守住、6方向连续推击不离桥、铁球抗推/暂停。preview-spider-pressure真实Edge/WebGL复测同种子前三秒4击杀/3存活、1.98秒接触，320/390/1280三尺寸与无页面GL错误，已看390截图。
- 沿原生命关联赏金公式更新经济审计，B01/13/23全池84/315/533；不改商店/金币公式。同步test-61基线阶段B04/09/15/23、economy-pool与bridge-pressure生命断言。enemy-waves的纯波次测试将玩家移出出生安全半径影响，旧“至多补5只”断言改为核查真实威胁与远程上限，涵盖既有独立浮桥增援。
- npm run check、spider-pressure、juicy-pistol、bridge-pressure六角、bridge-room六角、61、economy-pool、timed-floors、enemy-waves通过。仅本地未发布，非手机实机/完整难度平衡验收。

## 2026-10-27 本地：浮桥入口留在屏幕内

- 浮桥不再朝地图外追线。保持13×11固定地图、原四个对角方向和每十层持久身份，改为完全在地图内的四格短桥；候选优先兼顾靠内位置和足够出生距离。
- 六角镜头在原平滑跟随之后，以实际透视投影约束浮桥、连接点、玩家及近战模型余量，必要时适度缩小/平移取景，预留左右11%、顶部18%、底部29%观察边距；随玩家走到岛屿边缘仍保留完整来路。不改变地图大小或建筑/玩家可走范围。
- 出生位置改为沿桥连续等距采样，保留至少32及体型间距、145安全距离；间距比较容许1e-7浮点误差，避免玩家守桥口时第三只近战被误判重叠，触发整批入场回滚。
- npm run check、bridge-room/bridge-pressure方格与六角、hex-campaign、enemy-waves通过。真实Edge/WebGL新增preview-bridge-visible覆盖13种子×3尺寸×5玩家位置共195组投影边界；320/390/1280截图、近战实战与无页面/GL错误通过，已查看320/390截图。preview-hex-camera、preview-persistent-bridge（实际拖地块覆盖/跨层保留/新十层换桥）、preview-bridge-pressure通过。未手机实机验收，未全量npm test；仅本地未发布。

## 2026-10-27 本地：升级成本乘2/3、武器最终价翻倍

- 用户最新要求覆盖之前经济节奏：四次升级280/400/1000/1600各乘2/3、四舍五入为187/267/667/1067。
- 仅weapon槽最终商品价格乘2，放在品质倍率、向上取整和楼层加价之后，保证精确翻倍；其他槽位原价。武器各品质无深度加价20/30/44/62/84，深层五级90。锁定商品沿用原滚动时价格的既有规则。
- 同步test-61/test-63与preview-economy价格、支付边界；五槽五品质验证仅武器在最终结算后翻倍。npm run check、61、63、shop-stock通过，preview-economy真实Edge/WebGL验证20金币武器揭晓/装备、187精确升级与下一档267、三尺寸布局与无页面GL错误。仅本地未发布。
- 同步经济测算报告：原基线（普通理论赏金60%、每2关购买均价装备/每3关刷新、无矿机）升级B04/10/15/24；全清B03/05/12/16，一矿机理想拾取B03/05/12/17。此前目标B05/12/20/27已由本轮用户数值要求覆盖。固定种子输出示例按当前运行结果重算，售价20不再断言单关必回本。

## 2026-10-27 本地：猎蛛再加速与30关经济重算

- 用户要求猎蛛在83.2基础上再快30%，现108.16；保留70%模型/10碰撞半径/60%生命，距离驱动步态同步自然加快。原64速度的累计1.69倍。
- 原普通关全清120/200/300金币，商店升级40/60/100/150总350；零消费全清攒钱可B01连升两级、B03满级。按用户选择的约B05/12/20/27升级目标，四次成本改280/400/1000/1600。
- 装备base/qualityStep改weapon10/3、armor8/2、shoes7/2、drone12/4、bomb10/3；商店倍率1/1.15/1.35/1.6/1.9，深度加价仍0～3。武器槽各品质基础价格10/15/22/31/42，5级深层实际45（旧131）。刷新成本保持，买装备更轻、升科技更重；不加楼层硬锁。
- 普通敌人通用击杀赏金为max(1,ceil(sqrt(maxHP)/2))，按最大生命而非残血/过量伤害：4/16/36/64生命对应1/2/3/4金币。绿色货币晶体随基础赏金增加，数量上限12，保留总粒子预算96、实际收益/倍率/吸收跳字与结算；原特殊BOSS/金蛛奖励路径保留。普通池全清基础B01/13/23现84/285/489，不再固定每只2。
- 新tools/audit-economy.cjs读取实际33关名单/生命/价格，输出design/economy-audit.json。模拟前30关，基线为领取普通关理论赏金60%、每2关买一件当前品质平均价装备、每3关刷新、无矿机/酒/收益加成，允许同一商店连升，落在B05/12/20/27；全清相同消费B04/09/14/23；同基线加一矿机理想及时拾取且打满时间为B04/08/14/23。理论全池不保证时限内可杀完；BOSS仅计固定通关奖金20，未算可变分裂体/召唤物赏金；不是实战难度验收。
- 额外实际伤害对照：固定种子economy-output、第一关20秒、静止无敌，仅换武器，pistol_t1击杀30/收入32，商店1级可买的sword_t1击杀44/收入56，价格10，额外24超过成本，验证同科技购买改善输出可回本；这是确定性示例，不代表所有购买都回本。
- 重写已过时test-61经济回归：目标阶段、完美输出上界、消费空间、真实四次升级边界/五槽五品质支付揭晓、赏金单调/过量伤害与同级武器收益。同步金币、浮桥、怪物池、速度断言。npm run check及61、54、63、shop-stock、category-boxes、bomb-equipment、cash-crystals、bridge-pressure方/六角、enemy-waves、timed-floors、settlement通过；preview-economy与preview-bridge-pressure真实Edge/WebGL验证低价实购、首层不能升科技、精确升级支付、速度、掉落/三尺寸及无页面/GL错误，已看390商店截图。仅本地未发布，未全量npm test或手机实机验收。

## 2026-10-27 本地：猎蛛改快速轻型杂兵

- 四足猎蛛crawler整体模型等比缩为70%（身体、四肢位置、连杆粗细、关节/脚全部同步，复用原常驻网格），碰撞半径14→10。移动速度64→83.2，精确提高30%；生命乘0.6，降低40%，浮桥/直接生成/旧运输入口共用类型生命修正。其他怪物数值保留。
- 距离驱动步伐系数2.6→4，结合移动速度1.3倍，同等时间迈步频率为原2倍；仍仅实际移动推动步态，暂停/静止不原地踏步，保留四足对角交替。
- bridge-pressure新增实际0.1秒位移、生成生命/半径、完整身体与四足三轴包围盒70%及网格共享验证；原铁球/过桥/密集增援/金币测试保留。npm run check、bridge-pressure方格/六角、bridge-room六角、enemy-waves与真实Edge/WebGL preview-bridge-pressure通过，390/320/1280宽无页面/GL错误，已看390宽轻型猎蛛与铁球同屏截图。仅本地未发布，未做手机实机验收。

## 2026-10-27 本地：金钱/技能点吸收粒子改圆球

- cashGlint共用绘制分支改为三维自发光球体配小型圆形光晕，不再绘制原来的菱形/十字高光片。金钱绿色、技能点蓝色及近白粒子均使用同一球形样式；保留当前大小、速度、寿命、数量上限、角色轻微闪白和跳字。
- 球体按颜色共享常驻网格，运行时只更新位置和随寿命收缩的等比尺寸；其他设施原拾取特效保留。
- npm run check、cash-crystals、talents、pickup-feedback通过。preview-cash-crystals真实Edge/WebGL在320/390/1280宽验证绿色/蓝色球形网格实际绘制，无页面/GL错误；已查看390宽两种吸收截图。仅本地未发布，未手机实机验收。


## 2026-10-27 本地：恢复浮桥铁球、密集陆行增援与金币

- bridgeRoster此前把所有近战强制替换成crawler/bomber，spawnBridgeRoller又只允许这两类，导致铁球完全消失。恢复B05起每4名陆行怪1只ironball，首批即有，半径30/移速82，生命普通陆行怪2.5倍，沿原浮桥导航登岛、滚动和接触伤害；未全局开启旧陆地远程怪/运输机。
- 浮桥按章节每.65/.55/.45秒独立从本关spawnQueue抽取1名陆行怪，目标同屏12/18/24名，不再被混合批次的空中名额卡死；空场仍用原.35秒混合补波，未成功入场保留排队，最后两秒停止入场。有限总池60/100/150及60%陆行占比保留，暂停/准备/慢时间共用房间时钟。
- 同屏威胁上限14/20/26提高到18/26/34，狭窄浮桥陆行怪占原威胁系数65%，使密集队列能实际出现；入口间距按半径和至少32动态避免出生重叠。HUD威胁取一位小数，防止浮点长尾挤坏文字。
- 用户补充浮桥怪不掉金币：通用击杀管线对bridgeRoller取消近战零赏金限制，每只2金币，包含铁球；复用绿色货币晶体/吸附/倍率与统计，普通武器、塔和炸弹共用。非浮桥旧追逐怪规则保留，倒计时清场不发赏金。普通池全清基础金币现为120/200/300，取代之前仅远程赏金48/80/120的理论值。
- 新test-bridge-pressure加入npm test，方格/六角验证解锁、体型/生命、独立增援/空中满额、有限总池、威胁、暂停、过桥登岛/滚动/接触、截止和常驻渲染；三类陆行怪×武器/塔/炸弹来源击杀，及真实电塔/炸弹激活均确认2金币和绿色晶体/不重复支付/清场不支付。同步enemy-waves、timed-floors和economy-pool预期。
- npm run check及bridge-pressure方格/六角、bridge-room方格/六角、enemy-waves、timed-floors、strong-forecast六角、economy-pool、cash-crystals、hex-campaign通过。真实Edge/WebGL preview-bridge-pressure覆盖390/320/1280宽与金币截图，无页面/GL错误；B05不攻击运行8秒，同配置关闭独立补充6名陆行/2球，开启后11名陆行/3球，总池60，威胁17.825/18。已查看截图。仅本地未发布，未做手机实机或完整难度平衡验收。

## 2026-10-27 本地：手枪恢复指定普通单发录音

- 按用户最新选择，手枪改回 Pistol 01/Pistol Single Shot.wav，重建pistol.wav及来源清单；沿用枪声混音系数.9。npm run check、真实Edge音频专项通过，仅本地未发布。

## 2026-10-27 本地：吸收金钱跳字

- 金钱晶体吸收到角色时显示绿色「金钱 +金额」，跟随角色在头顶短暂放大、上浮并淡出；0.16秒内连续接收合并金额，寿命0.85秒，复用有上限的浮字层。
- 普通敌人和贪欲蜘蛛将已结算的实际收益金额附在本批一颗晶体上，吸收才触发跳字，移除击杀地点的提前跳字；粒子达到96颗上限时，将待显示金额附到已有晶体，避免漏掉数值。矿机/现金补给等实际拾取收益同步使用头顶跳字。收益计算/倍率/到账与结算不变，跳字不重复加钱。
- npm run check及cash-crystals、54、economy-pool、settlement、talents、pickup-feedback、106、electric-tiles通过；cash-crystals新增实际击杀无提前跳字/吸收金额/连续合并/满粒子上限不丢金额验证。preview-cash-crystals真实Edge/WebGL验证320/390/1280宽实际吸收后的「金钱 +4」DOM跳字及原晶体动画，无页面或GL错误，已查看390宽截图。未跑全量npm test；仅本地未发布。


## 2026-10-27 本地：金币/技能点共享飞行拖尾与增强拾取反馈

- 绿色金币晶体增加连续的镜头朝向光带：亮色细芯、彩色外层，按真实轨迹采样，保留最近0.22秒，向尾部渐细/渐隐；每颗最多16个采样点，绘制不修改轨迹。散射及吸附均可见，随加速自然拉长。
- 技能点改为复用makePickupCrystal/advancePickupCrystal的向上半球散射→指数减速→加速追向玩家上身流程，替代落地等待；保留蓝色晶体、蓝色拖尾，与绿色货币区分。原概率/合并上限/价值/到账存储/音效和结算收取规则保留；sweep直接切入吸附。
- 金币/技能点接收时统一增强碎光：每次基础12颗，尺寸2.4–4.4、初速度500–800、寿命0.26–0.44秒，共享84颗上限；分别绿色/蓝色配近白高光。缩小单颗光晕，避免聚集时大面积遮住角色。角色闪白0.12秒，最大白色混合42%，暂停冻结，自然淡出。
- npm run check及cash-crystals、talents、pickup-feedback、death-feedback、54、92、106、economy-pool、settlement通过；专项覆盖限时轨迹、透明几何有限值、绘制不推进状态、技能点与金币相同轨迹、增强粒子和角色闪光。
- preview-cash-crystals真实Edge/WebGL验证320/390/1280宽拖尾/移动吸收/碎光、轻微角色闪白、蓝色技能点共享轨迹及GPU重建，无页面/GL错误；已查看390宽绿色吸附拖尾、增强拾取截图及蓝色技能点拖尾截图。未全量npm test或手机实机验收，仅本地未发布。


## 2026-10-27 本地：炮塔开火锁向与绿色货币晶体

- 霰弹塔/狙击塔/导弹塔每次发射后分别锁定朝向0.24/0.32/0.28秒，期间不追踪、不因刷新冷却再次开火；结束按原有限角速度重新选近目标。暂停冻结，进入新房间清理锁定；场地机枪原整轮锁向机制保留。
- 敌人死亡、旧现金来源的cashBurst改为亮绿色八面体晶体，使用同一常驻自发光网格与小光晕，最多96颗。先向上半球散射，约0.38–0.52秒内指数减速，再以70初速、900加速度追向玩家上身实际高度；逐帧追随移动/坐骑，大步长拆分避免越过玩家。
- 吸收后生成短命的小型绿色/近白高光碎片（最多84），播放独立两音拾取提示并90ms限频；不触发大光环/整身白闪。cash/miner拾取配色同步亮绿；BOSS崩解阶段也继续推进粒子。保留当前击杀即时收益、倍率、统计与结算，视觉吸收不重复发钱。
- 新test-cash-crystals纳入npm test，覆盖三塔锁向/刷新/暂停/复位、实际击杀、散射减速/吸附加速/移动接收、分帧、声音和粒子上限、常驻模型、BOSS阶段、重开及收益。同步旧钞票测试为新晶体，物理地面回归移除已删除钞票；106旧渲染钩子改为当前drawTilePickupChip。
- npm run check及cash-crystals、more-towers、defense-towers、machine-turret、54、92、particle-surfaces（方格/六角）、pickup-feedback、death-feedback、economy-pool、settlement、missile-tile、106通过。preview-cash-crystals真实Edge/WebGL验证320/390/1280宽散射/吸附/移动吸收、高光/音效路由、狙击塔锁向恢复与GPU重建，无页面/GL错误；已查看390宽散射/吸收截图。未跑全量npm test，未人工听验或手机实机验收；仅本地未发布。


## 2026-10-27 本地：炸弹槽紧跟武器槽

- 按用户要求，商店装备栏顺序调整为武器→炸弹→护甲→坐骑→无人机；F2装备类型同步顺序。


## 2026-10-27 本地：矿机收益与普通关怪物池

- 电能矿机每4秒3金币→8金币，理想效率0.75→2金币/秒（+166.7%）；保留7格占地、走近拾取、未捡停产及供电/回响/钟表加成。设计档中的矿机说明统一读取当前数值，避免旧3/5金币文案覆盖。
- 普通关三章节有限怪物池20/30/40→60/100/150；保留5只一批、同屏威胁14/20/26、刷怪间隔、清空加速补波、原限时和截止规则。结算分母仍含未入场敌人。近战仍无赏金、远程每只2金币，标准全清收入16/24/32→48/80/120，特殊关独立规则不变。
- B1/B13/B23时长20/44/60秒：及时拾取、无加成且打满时长时，单矿机原15/33/45→40/88/120金币；提前清关、移动拾取会降低实际收入。这是配置理论值，不代表实战收益。
- 新增test-economy-pool并纳入npm test：验证三阶段实际怪物池、赏金与固定分母；20秒实际伤害管线的脚本齐射周期3秒→0.8秒，击杀6→24、击杀率10%→40%、收入4→20，证明火力能转化为更多收入；该脚本用于机制回归，不是玩家难度验收。
- npm run check、economy-pool、electric-tiles、enemy-waves（33层/威胁/固定分母）、timed-floors、hex-campaign（含商店/武器/敌人）、clock-repair、settlement、strong-forecast、bridge-room通过。同步旧矿机测试/浏览器预览数值，并将enemy-waves旧固定3锯刃断言同步当前ceil(地板数/10)。未运行全量npm test或浏览器预览，未做手机实机和人工难度验收；仅本地未发布。


## 2026-10-27 本地：炸弹装备统一罐装图标

- 新增 assets/shop-equipment/canister-bomb.svg，沿用单色透明剪影，表现倾斜罐体、拉环、释放压杆、上下卷边与闪电镂空。炸弹盲盒、开盒对比、F2装备卡及已装备/空炸弹槽统一使用该图标，不再借用雪花或激光图案。
- npm run check、test-bomb-equipment、test-category-boxes通过；preview-bomb-equipment真实Edge/WebGL验证实际SVG路径/资源加载、盲盒指定描述、五槽、320/390/1280布局、四类实际效果和15秒HUD，以及候选池/无页面GL错误通过。已查看390宽商店截图。仅本地未发布，未做手机实机验收。


## 2026-10-27 本地：手枪指定消音录音

- 手枪素材改为用户指定 Pistol 01/Pistol Single Shot (Suppressed) 3.wav，重建 recorded-guns/pistol.wav 与来源清单；沿用当前.9枪声混音系数及响度校准。
- npm run check通过；音频专项结果见本次执行。仅本地未发布。

## 2026-10-27 本地：炸弹CD与商店文案修正

- 按用户要求，独立炸弹装备固定CD由24秒改为15秒；商店类别描述精确改为「获得一份CD较长的爆发武器。」。同步炸弹专项、品质回归与浏览器预览断言。


## 2026-10-27 本地：炸弹迁为角色独立装备槽

- 新增第五个装备槽「炸弹」，电浆/冰冻/激光/导弹四种互斥装备；不占地、不生产产物，四类退出正式关前三选一。旧设施定义仅保留测试/兼容，其他地块不变。
- 经普通装备盲盒购买、支付后揭晓/替换/放弃，接入五品质、装备栏、独立HUD剩余秒数与F2炸弹测试；复用原炸弹图标。品质逐级提升效果，固定CD从原生产12秒延长为24秒，不受设施供电/生产加速影响。
- 战斗/生存自动释放；没有可攻击目标保持就绪，冰冻需范围内敌人或敌弹。危险炮台不触发。暂停、商店、关前准备不走CD，下楼保留装备与剩余CD，替换重新冷却，重开清空。复用原战斗效果，射弹来源标记bomb，移除设施/地块伤害标签。
- npm run check、test-bomb-equipment（四类×五品质/实际伤害/冷却/状态/跨层/商店/F2）、test-bomb-facilities、test-missile-tile、test-category-boxes、test-shop-stock、test-63、test-timed-floors、test-defense-towers、test-electric-tiles、test-hex-campaign通过。额外test-61停在旧finite reinforcement pool maximum earned income断言，未改旧收益预期，未宣称全量通过。
- 新preview-bomb-equipment真实Edge/WebGL验证实际购买、五槽、320/390/1280宽布局、四类自动效果/HUD、60轮候选无炸弹和无页面/GL错误；preview-shop-loadout同步五槽后通过。已查看320宽商店及390战斗截图。桌面浏览器验证，未做手机实机验收；仅本地未发布。


## 2026-10-27 本地：九项建筑与计时反馈

- shield_tower保留兼容ID，公开名称改“护盾生产格”，退出防御塔分类、设计台归补给，仅保留生产平台与拾取无敌道具；旧设计档名称分类同步迁移。护盾修复monsterPose只传sx的问题，三轴均.46，中心随上身/坐骑抬升，复用原常驻球形网格。
- 塔/炸弹/维修塔描述压缩为一句，避免旧设计档长文覆盖。摆位建筑与背包显示“名称：Lv1”，建筑标签避让并连接真实位置；可合成提示仅拖动同类时出现。
- 黑色风衣触发时普通/锯刃/贪欲/生存倒计时与刷怪时钟同步8%速度，修正大步长截止截断；生产仍按原真实秒。暂停逻辑保留并在浏览器验证冻结。最后5秒计时条闪烁，暂停冻结闪烁。
- 减速领域取消圆环，作用范围内已持有格子淡紫染色，重叠不加深。炸弹产物停止上下浮动、缩小光晕，设施拾取粒子数量/高度/光晕降低，保留全部建筑种类。
- 锯刃回廊按当前地板数ceil(tiles.length/10)生成，至少1把，受安全位置数量限制。模型剑移除持有分支固定剑，保留攻击分支挥砍剑。
- npm run check及timed-floors、saw-room方格/六角（9/10/11/20/21/60地板边界）、more-towers、defense-towers、tower-range、bomb-facilities、designer-bomb-migration、electric-tiles、tile-feedback、clock-repair、test-98/99、weapon-vfx、rail-room通过。新增preview-content-feedback真实Edge/WebGL验证8%扣时/暂停、计时闪烁与冻结、球形三轴、染色、持有剑无重复网格、390/320/1280宽名称等级及无页面/GL错误；截图已查看。仅本地未发布，未做手机实机验收。

## 2026-10-27 本地：按听感反馈提高枪声

- 用户反馈枪声相对BGM过小：SAMPLE_MIX.shot从.35提高到.9，线性增益约2.57倍（+8.2dB）；BGM、命中、弹壳及用户音量存档保持当前值，所有共用枪声的武器/塔同步生效。
- npm run check与真实Edge preview-combat-audio通过；两首BGM+密集连射/命中混音峰值.375/.355，无削波，枪型路由/静音/总音量/并发限制通过。仅本地未发布，未人工听验。


## 2026-10-27 本地：按枪型替换实录枪声与护甲命中音效

- 从用户指定 E:/AudioDatabase/Ultimate Sound FX Bundle/Real Recorded Guns 导入9段枪声：pulse→Pistol 01、smg→Submachine Gun_01、uzi→Submachine Gun_03、rifle→Assault Rifle 01、twin/场地机枪→M4 AR、shotgun/霰弹塔→Shotgun 01、sniper/rail/狙击塔→Sniper Semi Auto、barrett→同库较重的第3段、magnum→Magnum Revolver。能量/近战原效果保留。
- 全武器普通命中统一随机使用 Body armor Impact 的10段录音。tools/build-gun-audio.py 可重建，recorded-guns/manifest.json 记录逐素材来源/时长/增益；去首尾静音、按攻击段响度匹配、短尾淡出，输出单声道PCM。
- 枪声/命中/弹壳固定混音系数 .35/.28/.2，再乘用户原有分项/总音量；保留用户存档。BGM战斗增益.32、商店.12；效果总线软压缩，枪声最多6声/命中3声，总计12声，叠加衰减，命中45ms限频。零音量不发声。
- npm run check、test-juicy-pistol、test-more-towers、test-machine-turret、test-music-ownership通过。真实Edge preview-combat-audio验证19段解码、10个枪型实际发射路由、每轮一声、护甲共路、静音/零/总音量/并发上限，并对两首BGM+密集SMG+连续命中离线渲染：峰值.257/.236，无削波，混合RMS约.052，BGM约.023。preview-music-ownership通过。test-game-feedback在首批敌人同时包含近战/远程飞机的断言失败（该段敌群此前已改），未宣称全量通过。音量设置旧预览已同步新混音断言，但执行在第8行等待combat时超时，尚未进入音频断言（当前开局有关前准备流程）；未宣称该预览通过。仅本地未发布，未人工听验。


## 2026-10-27 本地：十二项战斗与关前体验反馈

- 普通关中央存活提示由1.5秒压至1秒（短暂弹出后飞入HUD）；锯刃回廊共用相同提示、时间条与1秒冻结准备期，并修复深渊场景隐藏HUD/残留世界时钟的问题。保持原递增关卡时长。
- 角色回位提前到结算后进入商店（消费开始），下楼、普通关/特殊关开战均保留准备位置；新开局仍安全出生，掩体重建只对实际重叠执行安全迁移。
- 初始冲锋枪与伍兹降低射速并保留升级空间；击中声换原创短促低频撞击impact-thud.wav。导弹/霰弹/狙击塔以180度/秒转向，误差2度内才发射；霰弹与各类导弹视觉放大。
- 初始桥怪改四腿机械蜘蛛，移速48→64；远程双炮同刻双发。持久桥仅用60/120/240/300四斜向，每批接触名额全部由桥进入（桥怪2→3），保留敌群总数和威胁预算。迭戈巡弋火网暂从正式关卡关闭，原关位进入普通战斗，手动实验入口保留。
- 防御塔放置以虚线圆显示独立战斗射程；护盾设施改同炸弹的物资平台并生产立体可拾取补给，未拾取停产，拾取获得2/3/4秒无敌护盾，不再直接远程赋予。
- npm run check和普通计时、锯刃方/六角、商店结算、塔射程、音乐所有权、hex-campaign集成通过；子任务覆盖敌人/桥/转向/产物相关回归。真实Edge/WebGL普通提示、锯刃、炮塔转向/射弹、虚线射程及盾产物预览通过，已查看相关截图；新WAV解码/音量/静音/节流通过。扩展全套回归未全绿：历史test-56的finite total despite kills断言失败；本次敌群/33层/桥专项通过。另同步旧能源续航/双炮数量/蜘蛛网格断言，补齐农场mock缺失terrainProtected并固定运输测试地图，相关复测通过。仅本地，未发布；音效尚未人工听验、未做手机实机验收。

## 2026-10-27 本地：霰弹枪塔与狙击塔替换为 Blender 网格

- index 加载 dist/assets/ranged-towers.js，把用户在当前 Blender 执行生成的两塔实际网格接到现有 shotgun_tower/sniper_tower。分别缓存底座与炮头，底座保持原姿态，炮头按原 aim 旋转；共享常驻网格，保留原三级伤害、散射、距离增伤与冷却。
- 新增显式预览参数 ?electriclab=1&facilitypreview=rangedtowers，测试场默认19格上放左霰弹枪塔/右狙击塔，方便用户直接查看与开火。无参数原流程保留。
- npm run check、资产语法检查、test-more-towers/defense-towers/tower-range通过。增强preview-more-towers真实Edge/WebGL验证实际Blender头/底座数组、三方向炮头朝向与底座不转、共享缓存、真实射弹、GPU缓冲重建、两组390/320/1280宽截图及无页面/GL错误；已查看390宽编辑与战斗截图。仅本地未发布，未做手机实机验收。


## 2026-10-27 本地：霰弹枪塔、狙击枪塔与双向减速领域

- 新增 shotgun_tower：每1.5秒瞄准260内最近敌人，扇形5枚弹丸，各为基础塔伤害60%；sniper_tower：每3秒瞄准800内最近敌人，高速直线弹，基础塔伤害2倍，命中距离每100额外+50%。均沿用三级伤害、脉冲强化、无目标保持就绪、危险炮台不可选敌与换层清理射弹。
- 新增 slow_field：默认140半径常驻，玩家和敌人移动速度降低30/40/50%，只取最强领域，实时查询范围，移出/移动/移除后立即恢复；普通移动和滑板均接入，不改变生产/攻击冷却或全局时间。领域范围读取设计台作用区域，支持半径/自定义/相邻/全场。共用 residentMesh 的三种模型、子弹效果和紫色边界圈；范围圈按真实平面比例缩放。
- 接入三级合成、关前候选、测试库存、设计台防御塔分类与旧存档目录版本7迁移，保留已有显式关闭和升级后删除。图标复用已有塔/导弹/冰冻图标。
- npm run check、test-more-towers、defense-towers、tower-range、designer-bomb-migration、electric-tiles、bomb-facilities通过。新 preview-more-towers 真实 Edge/WebGL 验证共享有限网格、实际生成射弹/减速、候选、旧设计台迁移和390/320/1280宽截图，无页面/GL错误；已查看390截图。未做手机实机验收，仅本地未发布。


## 2026-10-27 本地：Blender 赛博防御塔与物资平台

- 按用户提供的六张参考图制作五款塔（电塔、双舱四孔导弹塔、治疗塔、护盾塔、维修塔）和图四风格的四脚部署物资平台，统一石墨内构、银白切角装甲、青蓝/绿/橙能量槽。用户在当前打开的 Blender 5.2.3 执行 tools/build-cyber-facilities.py，创建新场景保留原场景；source-assets/cyber-facilities 保存可编辑 blend、已查看的总览渲染、面数清单。use_nodes 弃用提示未影响生成。
- Blender 实际网格导出 dist/assets/cyber-facilities.js，由 index 加载；electric-tiles 四塔及维修塔读取实际导出数组，hex-map 物资平台复用同一导出网格。使用原 residentMesh 缓冲与实例变换；塔自带底座，不再叠加生产平台。原图标、产物高度/生产扫描与玩法保留，缺资产时仍可使用旧模型。
- npm run check、独立资产语法检查、test-defense-towers/tower-range/clock-repair/electric-tiles 通过。真实 Edge/WebGL defense-towers 与 production-base 三尺寸预览通过：Blender 网格实际接入/有限值/缓存共享、无叠加底座、实际攻击治疗、平台仅核心格/扫描高于顶面/图标辉光、上下文恢复与入场升降、无页面/GL 错误。已查看 Blender 总览、390宽防御塔与平台截图。仅本地，未发布、未做手机实机验收。


## 2026-10-27 本地修正：原关卡时长与中心入场计时动画

- 用户明确60秒只是示例：普通关恢复原时长min(60,20+(floor-1)*2)，保留饮品修正；提示文字和时间条读取本关实际duration，轨道关重新共用原时长函数。
- 同一横条组件在1.5秒准备期先于屏幕中心弹出缩放（前0.32秒），大字停留至0.82秒，再平滑飞到上方并将文字30px缩到15px，数值逐渐出现。动画进度由introLeft驱动，暂停冻结；落位才首波刷怪并启动计时。最后5秒音效保留。
- npm run check、test-timed-floors（20/22/24/34/44/60秒、准备期不刷怪不扣时、暂停、最后5秒逐次音效）、test-rail-room通过。Edge preview-normal-timer验证390/320/1280宽中心/途中/落位几何与截图、大小字30→15、1.5秒首波、递增时长、护盾共享网格及无页面/GL错误通过；已查看320宽中心大字和落位截图。仅本地未发布。

## 2026-10-27 本地：普通关时间条、无敌护盾塔、恢复扩地候选

- 此版曾误将普通关统一60秒，已由上方修正条目恢复原时长与中心入场动画。显示实际存活目标和横向时间条；准备1.5秒期间冻结战斗、计时和生产，到时才生成首波。暂停冻结准备期。最后5秒每秒单次提示音，沿用声音开关。横条放到顶部信息区下方，深渊场景也显示横条；特殊关计时保持原规则，有限敌群提前清空规则保留。
- 新增shield_tower无敌护盾塔：单格、12秒冷却、420独立射程，三级护盾2/3/4秒，无目标保持就绪。免疫伤害且不消耗已有护盾格；按真实战斗秒消退、暂停冻结、换关清除，重复提供刷新不相加。接入候选、合成、背包、辅助分类、设计台、防御塔共享模型和护盾图标；设计目录版本6补齐旧存档，保留显式关闭/后续删除。
- 玩家和飞碟共用常驻护盾网格，细分从两次减至一次：162片变42片（30六边形+12五边形），玩家按比例缩小，面/边共享缓存。
- 恢复四种扩地形状参与关前候选，按完整13×11边界搜索真实可放位置；满盘排除无法放置的扩地，设计台开关仍有效。
- npm run check及timed-floors、defense-towers、designer-bomb-migration、electric-tiles、enemy-waves、bridge-room、strong-forecast、tower-range、rail-room通过。新增/更新Edge WebGL预览normal-timer、expansion-choice、defense-towers：1.5秒无怪/不扣时、准点刷怪、横条三尺寸、护盾模型有限值/常驻、四种扩地候选和设计分类均通过，无页面/GL错误；已查看320/390计时与玩家护盾截图。仅本地，未发布、未做手机实机验收。

## 2026-10-27 本地：每10关持久浮桥与近战入场

- 浮桥从旧B09/20/31临时双侧铁球关改为全程可见的单条敌人通道；按floor段1～10/11～20/21～30/31～33，桥的对象/目标/几何不随单层重建。进入新段或整局重开才重新选取。seed+段号确定方向与真实岛体的外露格，方向仅0/60/120/180/240，沿轴坐标直线延伸至地图外；不改13×11可建造边界。桥直接完整存在，不每关重新施工。
- clearBridgeRoom仅force=true时清空；reset强制清空，beginDescent/startWave按段ensure。syncBridgeRoom把铺成永久地板的桥格真正删除并更新独立敌人surface/导航缓存；即使下层也不恢复。桥不进tiles，继续玩家不可走/建筑不可放；ElectricEditor.expand允许原有空地形状覆盖场内桥格，重叠格强制纯空白（不随机陷阱），随后可走/可建。未改关前三选一不刷扩地的既有规则。
- 普通有限敌人名单中的部分近战（每五个保留一个飞行pursuitDrone，其余接触名额改crawler/bomber）由桥上进入，绕开运输机路径；保留原名单总数/五个一波/威胁上限。采用桥+永久地板的六邻接BFS引导，进入岛屿后仍可通过岛间通道追玩家，保留击退/掩体/接触伤害。酒车/Boss/电锯/轨道生存保留原遇敌规则，浮桥几何仍保留。
- 预告改为持久桥单入口并保留飞行强敌预告；桥与飞行预告不再按相同side合并。透明棱柱复用原绘制，箭头按桥角度对齐。顺便修复居中平移可能移走(0,0)导致中心出生/能源兼容断言偶发失败：保留中心格与原安全出生格。
- npm run check、持久桥方格/六角、40种子5个方向精确角度/真实岛体挂接、enemy-waves、timed-floors、strong-forecast、rail/saw六角、electric-tiles、hex-city/movement、hex-campaign八路线/武器/商店/敌人、energy-disabled、settlement及terrain-seed通过。波次测试在直接触发下一波前推进桥怪让入口腾空，保留整批回滚/威胁检查；旧临时桥断言已按新生命周期重写。
- 新preview-persistent-bridge真实Edge/WebGL验证1～10几何一致、桥禁建、实际拖放空砖覆盖/纯空格/可建造、近战入场、跨层不长回、11关新段、390/320/1280宽及无页面/GL错误通过；已查看斜桥与怪物截图。仅本地，刷新并重新开局体验，未发布/未做手机实机验收。


## 2026-10-27 本地：地图整体居中与镜头边缘跟随

- rhythm输出新增轴坐标刚性平移：枚举合法位移，按包围盒中心与面积重心偏移评分，尽量让整张地图相对场地中点均衡。保持13×11边界与固定出生点安全；不镜像/重画岛屿，不改半径/宽度/连通/大小权重。islands、regions、corridors的中心/占地/路径一并平移，记录placementOffset；参考面积变动时允许重新居中。生成配方版本5（参数随机流仍v4），游戏/测试页同种子坐标继续一致。
- HexMap.installScene原镜头目标仅跟随22%/18%并硬夹±48/±30，导致边缘停住。改为完整玩家世界位置+既有指数平滑，移除人工限位；缩放仅依地图宽度，不随镜头偏移增大而反向拉远。暂停/重开/固定13×11范围保持。
- npm run check、hex-city/movement、hex-terrain、terrain-seed 100种子半径/出生/复现/刚性平移/居中不变差、生成3840组+岛屿600/节奏360/随机宽度60组通过。strong-forecast重开断言固定相同地形fixture，避免随机开局几何不同导致入口坐标预期失效，六角通过。
- preview-hex-camera真实Edge/WebGL验证平滑完整跟随、越过旧限位、实际地图左/右/上/下边缘玩家居中、暂停/重开、390/390短屏/1280宽及无GL/页面错误通过，已查看左右边缘截图。preview-campaign-islands验证居中后精确种子/拖放/开战/下楼/重开通过。仅本地，需刷新游戏并重新开局体验，未发布或做手机实机验收。


## 2026-10-27 本地：正式游戏开局接入单种子岛屿算法

- index按hex-map→terrain-generators→hex-loader顺序加载；HexMap.transform的resetFloor改调用HexMap.campaignFloor。campaignFloor使用已确认recipe v4，返回白板地块完整初始状态。每次无固定参数的重开生成新种子，正常下楼不重生成；可用?mapseed=任意种子复现测试页地图，HexMap.campaignMap记录完整参数/岛体/走廊与种子。原initialFloor保留作测试台19格参考盘。
- 半径2/至少两明显岛/大小权重/75-20-5走廊概率直接共用生成函数，不复制算法。地图仍13×11/143容量，出生区保持安全，普通地形/设施/扩建/特殊关逻辑不改。
- VM六角测试加载器补齐terrain-generators依赖；test-hex-city改验证固定种子与测试页精确坐标一致、白板/出生/状态干净、新种子重开及测试台参考盘独立。npm run check、hex-city/movement、hex-terrain、hex-campaign全8路线/商店/武器/敌人、energy-disabled、enemy-diversity、enemy-waves、electric-tiles、bridge/rail/saw/strong-forecast六角及terrain-seed通过；另40次随机开局检查半径/两岛/出生/扩建空间通过。
- 新增preview-campaign-islands真实Edge/WebGL：固定种子游戏/测试页一致、390/320/1280宽准备截图、实际拖放首个合法设施并开战、下楼保留地图、固定种子重开复现、无固定种子重开换种子、无页面/资源/GL错误通过；两次运行放置多格掩体/脉冲设施通过。已查看390准备和战斗截图。open_in_codex已请求打开本地游戏。仅本地未发布，未做手机实机验收。


## 2026-10-27 本地：最大岛半径2，走廊偏细概率

- 用户要求再缩小一格以给后续改造留空间。rhythm实际岛体半径上限3→2（中心0），完整盘最多19格。裁剪导致明显第二岛不足10格时，只在本岛半径2内紧凑补到10格，并与其他原始岛体保留水隙，继续保证至少两片明显岛体与出生安全；不为凑预算扩张超半径。
- 走廊1/2/3宽抽样从均匀改为75%/20%/5%；受限范围按剩余权重归一化（2～3为80%/20%），固定宽度仍固定。新增corridorWidthFromRoll可测试入口；页面摘要/手动选项/说明同步。配方版本4/parameters-v4，种子继续可复现，正式游戏未改。
- npm run check、test-terrain-seed 100种子半径2/主体大小/连通/出生/复现检查与1000等距采样75/20/5概率断言通过；真实Edge页面回归通过，已查看默认两小岛截图。通用回归已更新半径2/最多19格断言。


## 2026-10-27 本地：每片岛体最大六角半径3

- 用户明确每片岛从各自中心最大3格（中心距离0），不是全图半径。rhythm在合并/双主体检查后，逐实际岛体选择保留面积最多的合法中心，裁到六角距离<=3并保持连通；含出生区的岛保护完整核心。融合后的整体也受限，单个完整半径3盘最多37格，不为凑面积扩张。走廊独立连接，不计入岛体半径。
- 导出新增maxIslandRadius=3和islands[{center,radius,cells}]；页面摘要/统计/说明同步。自动配方升级为3，parameters-v3，默认示例37+16格两岛。参考面积可因半径上限缩减。只改测试算法，正式游戏未改。
- 单种子100组检查通过：逐岛每格到其实际中心距离<=3、中心属于岛体、两明显主体/出生/复现；Edge页面回归与npm run check通过，已查看默认37+16截图。通用生成测试同步取消“必须凑满参考面积”旧假设，检查融合岛仍最多37格。


## 2026-10-27 本地：单种子模式至少两片明显岛体

- 用户截图反馈“2片主体”仍可能是一大片+极小尾巴。自动参数新增ensureMinIslands；rhythm在铺走廊前检查至少两片各>=max(10,总预算20%)的岛体，每片至少两个格有>=4个岛内邻居，排除狭长尾巴。
- 不满足时，确定性评估不同方向/位置的宽海湾，保护出生区、保留总岛体面积，选择改动较少的两岸布局，再按原1～3宽走廊相连。未强制所有生长中心分开；手动模式保持允许自然融合。JSON与页面改显示实际主体面积islandSizes，避免原分配区域数误导。
- 自动配方版本更新为2，参数随机流parameters-v2，旧种子在新配方下形状会变化；同版本单种子/完整参数可精确复现。npm run check、100种子复现/至少两片面积检查及另100种子形状审计通过；Edge页面8算法/参数/种子/导出/窄屏回归通过，已查看默认40+10格两岛截图。仅本地，正式游戏未改。


## 2026-10-27 本地：测试页单种子决定全部参数

- 用户明确选择仅测试页，不接正式游戏。默认开启seedOnly，隐藏参数控件；种子自动抽预算32～85格、起点2～4、间距30～100、大小差异60～100、边缘10～85等，逐条走廊宽度仍1～3。可取消勾选进入原手动调参，自动参数摘要可见。
- TerrainGenerators.parametersFromSeed(seed)与generateFromSeed(seed)新增统一入口；独立parameters-v1随机流，返回recipeVersion=1及完整parameters。测试页自动模式所有比较算法共享由该种子决定的参数；导出记录参数与版本。同种子重算不依赖此前滑条值。
- npm run check、test-terrain-seed的100种子参数/地图/JSON复现/连通/出生/走廊范围检查通过，新增测试纳入run；Edge页面验证默认隐藏参数、同种子重算/换种子改变/改回完全复原，以及原手动模式所有控件/比较/导出/窄屏通过。已查看terrain-seed-only.png。仅本地，正式游戏未改。


## 2026-10-27 本地：岛屿片大小权重与逐条走廊宽度随机

- rhythm从近似平均增长改为按打乱的指数权重增长，新增sizeVariation默认80；空间距离/已占面积按权重调整，形成主岛/中岛/小岛。种子固定时区域中心/权重不随参考面积变化，面积仍独立，接触自然融合。默认55格/elevator-01的区域为17/32/6格。
- 走廊默认每条独立在1～3格间抽宽度，可选1～2、2～3或固定1/2/3；独立种子流不影响块面大小。1格沿脊线，2格向一侧加列，3格向两侧加列，转弯/入口/地图边界可能局部变化。保留旧corridorWidth数值参数兼容；新导出有widthMin/Max、每条width、每片weight。
- 测试页新增大小差异控件，显示每片面积及各条走廊名义宽度；Edge预览8图/控件/种子/下载/移动端与npm run check通过，已查看桌面截图。生成测试新增60种子检验大小悬殊、权重随面积稳定、宽度全1～3覆盖/同图不同宽、固定范围、宽度不改变块面、复现与连通。仅本地，正式游戏未改。


## 2026-10-27 本地：大片允许自然融合，面积与起点数量解耦

- 按用户新要求移除rhythm的强制空隙/最近中心边界约束，以及按区域数量预扣走廊预算。初始其他区域从单格种子开始，不再每片至少7格；区域总扩张量直接等于面积参数，允许接触融合。
- 先按实际连通主体判断是否需要走廊，多源BFS只连接仍分离的主体；已融合不人为挖开、不新增空走廊。JSON记录初始regionCount、铺走廊前landmassCount和实际corridors，页面改称“初始区域数”，显示起点/主体/走廊数量。面积仍不包括额外连接格，说明已同步。
- 浏览器预览8算法/参数/下载/移动布局通过；新增大面积110格融合成1片/0走廊验证和截图terrain-rhythm-merged.png，已查看。生成回归同步取消强制分离/最小7格/固定走廊数断言，增加19与110格在2/3/4中心下预算独立、中心位置不随面积变化及大面积自然融合。仅本地，正式游戏未改。


## 2026-10-27 本地：大片区域＋细走廊地图节奏

- 新增第八算法rhythm，先放置2～4个分离宽阔块面（至少7格/片），限制不同块面间保留空格，再按MST以多源BFS连接块面边界。默认单格通道，可选双格通道（弯折与入口局部变化），块面边缘变化与间距可调。保持白板、固定13×11，正式游戏未改。
- 独立保存regions/corridors拓扑到导出JSON。跳过通用面积修复，防止填平块面间的水域；面积是参考预算，优先保留结构。页面默认3大片/单格走廊/参考55格，当前种子实际48格；显示大片/走廊数量。
- npm run check通过。通用3840组及原始模式、岛屿600组通过；新增360组rhythm验证大片分离/至少7格/自身连通、树边数量、通道六邻接连续、单格仅沿脊线铺设、原始全图连通/出生安全/不被修复填平。真实Edge预览8图1144格、宽度切换、4大片控制、参数/下载/种子/移动布局通过，已查看默认桌面图。仅本地，已有测试页刷新后使用。


## 2026-10-27 本地：岛屿凸形与海岸侵蚀算法

- 用户参考侵蚀岛屿，新增第七算法island：随机4～9边半平面凸形场+1～4个方向性宽海湾+海岸谐波小缺口。沿形状场六邻接生长，保留中心安全区，原始结果即精确面积且连通；为视觉轮廓生成，不是水动力侵蚀模拟。连续凸轮廓栅格化后有六角阶梯，不宣称逐边严格凸。
- 试验页默认island/70格/侵蚀80，新增侵蚀/凸形/随机混合（25%凸形）、边数、海湾数、海岸缺口参数；比较自动变为7图，JSON记录新增参数和实际风格。正式游戏未改。
- npm run check通过；通用生成回归3360组及原始模式，新增岛屿600组模式/海湾/边数/粗糙度/零侵蚀等价验证。Edge真实浏览器7图/1001格、凸形与侵蚀切换/下载/参数/移动布局均通过；已查看凸形与侵蚀截图。仅本地，用户已有测试页需要刷新。


## 2026-10-27 本地：白板六边形地图算法试验场

- 新增独立terrain-lab.html/css/js和terrain-generators.js，地址http://127.0.0.1:4173/terrain-lab.html。复用HexMap几何/六邻接，固定13×11，仅白板地板，不生成资源/设施/危险，不改变正式开局。
- 六算法：结构模板+扰动、受约束区域生长、随机游走、六邻居细胞自动机、平滑值噪声、房间+Prim最小生成树。支持面积19～110、各算法形态参数说明、种子复现/随机、六图比较/点击放大、JSON下载。
- 可关闭统一修复查看原始结果；开启后保留最大原始陆地、连接中心出生区，增减到目标面积且保持连通。显示面积/连通区/窄格/修复增删格数/原始面积及连通区。
- npm run check通过。test-terrain-generators覆盖2880组修复地图及对应原始地图，验证精确面积/边界/连通/种子/安全出生；纳入tests/run。真实Edge preview-terrain-lab验证六图858个格子、参数/种子/模式/放大/下载和1440、390、320宽无横溢出/无页面错误；已检查桌面比较图及390竖屏图。仅本地；open_in_codex已请求打开测试页。


## 2026-10-27 本地：恢复电塔并加入治疗塔、导弹塔

- 保留现有电浆/冰冻/激光/导弹补给地块，独立新增electric_tower、healing_tower、missile_tower三种自动设施，默认单格、三级合成。电塔每2秒从塔身就近放电，首目标420/后续连锁135，三级分别3/4/5目标，基础6伤害逐级×1.8。治疗塔每4秒治疗420范围内最近的受损玩家或存活掩体，每次1/2/3点且不溢出；无目标保持就绪，不复活破损掩体。
- 导弹塔每3秒向600内最近合法目标发射直线导弹（速度300），目标移动不转向；从塔心到实际碰撞点距离计算爆炸半径min(150,30+距离×0.2)，基础12伤害逐级×1.8。碰撞点保持在弹道上，共用既有单次爆炸伤害/击杀与元素表现，危险炮台仍排除。攻击射程独立于设计台设施作用区域。
- 设计台catalog=5补齐旧存档缺失的三种塔，保留原配置/关闭状态，升级后删除仍保留删除；三种均归防御塔。关前候选/测试背包/测试分类/实时CD信息接入，复用已有闪电/医疗/导弹图标。三种塔身使用独立共享residentMesh，导弹共用已有模型与拖尾。独立设计页加载设施脚本时兼容缺少游戏能源常量。
- npm run check及test-defense-towers、designer-bomb-migration、electric-tiles、missile-tile、tower-range、clock-repair通过。新专项接入run，覆盖三级实际伤害/治疗、就近选择/满血跳过/破损掩体/射程、直线不追踪/距离爆炸/真实一次溅射、陷阱排除、暂停/生存/换层及旧存档。
- preview-defense-towers真实Edge/WebGL三尺寸验证模型有限值/共享网格、实际发射/治疗、关前候选和设计台三种塔，无页面/GL错误；已查看390×844截图。全量npm test仍在此前记录的test-tile-feedback.cjs设施place返回null处失败，未宣称全量通过。仅本地未发布，未做手机实机验收。


## 2026-10-27 本地：取消关前三选一扩建空地

- ElectricEditor.prepareFloor从候选源排除全部isFloor类型，取消第一项保底扩建；三个位置均抽合法设施/掩体/拆除，候选不足只重复非扩建，无合法候选可直接开战。测试台扩建工具保留。
- preview-expansion-choice更新并通过80组抽样、满地图、仅扩建启用时空选择、单设施重复和无落点；npm run check、test-electric-tiles、test-hex-city（含movement）、test-hex-terrain通过。
- preview-floor-shapes关前末段同步为无扩建；实际运行在此前测试台扩建拖放第66行库存数量断言失败（77 != 76），未到关前断言，不宣称该预览通过或完成视觉验收。
- 初始地形仍为HexMap.initialFloor固定19格六角盘。向用户建议结构模板+受约束生长+连通/出生安全/摆放空间验证；本轮仅讨论方案，尚未接入地形生成。仅本地未发布。


## 2026-10-26 本地：地形设计加入可编辑多格掩体

- 共享ElectricTiles.barricadeDefs：单格、双格、三格直线、三格弯折四款掩体；独立于生产设施defs。设计台地形分类接入，catalog=4一次补齐旧目录，保留原配置与升级后的删除。profile校验连通占地并同步名称/说明/开关到游戏与测试目录。
- 多格逐格生成既有掩体，独立耐久/阻挡/每关恢复，组装与拆除沿用已有分组逻辑。放置检查直接逐格使用free，不再借用可能被用户改成多格的battery占地，保留至少一个安全站立格。
- npm run check、electric-tiles和设计台存档迁移回归通过。preview-barricade-shapes真实Edge/WebGL验证四种预设、额外五格用户存档（含六格电池）、奇偶行拖放、全部占地冲突、无落脚点拒绝、独立伤害/恢复/安全迁移/整组拆除、关闭拒放及不连通回退；三尺寸无页面/GL错误。旧test-cover-tile在new room rebuilds at floor 7断言失败，该测试仅加载未被本次修改的game等源码，不读取本次编辑器/设施改动；未宣称全量回归通过。
- 用户IAB设计台已刷新，地形分类可见四款掩体并选中三格弯折，原配置保留。截图tests/designer-multicell-cover.png；仅本地未发布。

## 2026-10-26 本地：炸弹基础冷却改为12秒

- 电浆、冰冻、激光、导弹四种炸弹的基础生产间隔统一4→12秒，首次生产与拾取后的下一轮均生效；三级沿用同一基础间隔，原生产加速设施继续生效。玩家说明同步为12秒。
- npm run check、bomb-facilities、missile-tile、electric-tiles、tower-range及pickup-feedback通过，覆盖11.99秒无产物/12秒产出、未领取停产、拾取重置和生产加速。三份炸弹浏览器预览的生产等待同步更新。仅本地未发布。


## 2026-10-26 本地：统一拾取奖励反馈

- 地块医疗/金钱/护盾/脉冲与设施炸弹/矿机/水果/钟表/能源实际消费入口统一调用pickupFeedback。角色中心扩散圆环逐渐透明、柔和径向辉光渐隐，22枚高光小粒子随机三维发射并按指数阻力减速，专用分支不受重力/地面反弹影响；金钱金黄、回血绿色、护盾蓝、四种炸弹按元素区分颜色。
- 角色拾取时0.14秒白色混合，通过现有hitModel覆盖身体与手持武器，末段淡出；拾取闪白期间不被受击无敌间歇隐藏。反馈沿用particles暂停/到期/重开机制，总数最多276，不移除战斗/死亡粒子，不更改奖励与伤害。
- npm run check、test-pickup-feedback、bomb-facilities、missile-tile、electric-tiles及particle-surfaces方格/六角通过。新专项已接入run，验证实际消费、配色、无重力解析运动/减速、闪白/暂停、透明几何、上限与重开。
- preview-pickup-feedback真实Edge/WebGL验证6种配色、22粒子、身体白色混合、透明几何、390×844/320×568/1280×900及GPU恢复，无页面/GL错误；已查看金色扩散和绿色闪白截图。npm test仍在既有test-tile-feedback.cjs设施place返回null处中断，与此前记录一致。仅本地未发布，未做手机实机性能验收。


## 2026-10-26 本地：地块设计台补齐旧存档的新增炸弹

- 旧设施库存档整体覆盖默认目录，导致冰冻/激光/导弹未出现在编辑器。新增designCatalogVersion=3一次迁移，仅补缺失的三个ID，保留已有名称、形状、范围、禁用状态与自定义种类；升级后主动删除的种类不会在刷新时重新添加。
- npm run check与test-designer-bomb-migration通过，覆盖旧目录补齐、已有配置/关闭状态保留、重复加载及升级后删除。真实IAB刷新用户页面后设施23→26、防御塔2→5，三种炸弹均显示；已选中冰冻炸弹供编辑，截图tests/designer-bombs-restored.png。仅本地未发布。

## 2026-10-26 本地：激光图标按参考增加左下冲击点

- 用户提供两张构图参考：右上主束汇聚到左下亮点，左下有爆发尖角和飞溅光刺。使用内置image_gen结合两张构图参考重出透明PNG，保留粉紫纯色平面风格，替换laser_bomb正式及源PNG；上一版单长条存档为plain-bar-rejected。实际激光战斗不改。
- 提示词/参考记录保存在source-assets/tile-icons-flat/laser-impact-prompt.json并同步manifest。游戏继续按生成alpha纯色显示，无渐变/外发光。
- preview-bomb-tile-icons真实Edge/WebGL三尺寸、GPU透明四角/纯色/无辉光/上下文恢复及npm run check通过，已查看游戏内放大图确认右上光束与左下冲击尖角构图。仅本地未发布。



## 2026-10-26 本地：浮桥统一在0.2秒内建成

- 滚球关取消进关后1.4秒等待，整座浮桥从进关开始0.2秒建成（原铺设1.5秒）；轨道关临时砖块同用TEMPORARY_BRIDGE_BUILD_TIME=.2，炮台原1.6秒行动准备保留。仅调整临时砖块施工时序，保持敌人专用通行/不可建造规则。
- npm run check、bridge-room与rail-room方格/六角、strong-forecast、timed-floors、enemy-waves通过；回归断言三章每块砖在0.2秒时全部完成并保留暂停行为。preview-bridge-room真实Edge/WebGL验证0.2秒完整建成、两侧滚球入场/行走、玩家边界、暂停/清理、三种尺寸与无页面/GL错误通过。仅本地未发布，未做手机实机验收。

## 2026-10-26 本地：激光图标改为单根斜向光束

- 用户明确激光图标应是左下→右上的一根激光，不要风扇。使用内置image_gen重新生成粉紫色单根45度斜光束透明PNG（粗实心主体/细透明内槽），替换正式laser_bomb.png与源文件；保留上一版放射图为rejected来源。未改旋转激光战斗行为。
- 最终提示词/生成路径保存在source-assets/tile-icons-flat/laser-single-beam-prompt.json，并同步manifest；继续使用纯色alpha显示/无bloom。
- npm run check、preview-bomb-tile-icons真实Edge/WebGL三尺寸、GPU透明角/纯色/无辉光/上下文恢复通过，已查看游戏内新版放大图确认斜向单束。仅本地未发布。



## 2026-10-26 本地：出图生成彩色纯色平面炸弹图标

- 用户明确要求直接使用出图功能，拒绝矢量重画，并提供纯色平面UI参考，要求彩色且实心/空心交替。使用内置image_gen分别生成冰晶、旋转激光和导弹三张透明PNG；首轮材质高光方向被用户否定，未接入。按参考重出三张平面剪影，无方形背景，冰晶粗实体臂/镂空臂、激光实心楔形/镂空楔形、导弹实心主体/透明舷窗与空心翼交替。
- 原始生成文件与完整最终提示词/参考路径保存在source-assets/tile-icons-flat/及manifest.json；正式dist/assets/map-icons/{freeze_bomb,laser_bomb,missile_bomb}.png直接复制所选生成文件，已替换上一版SVG栅格图。没有绘制新SVG或本地切图，既有SVG不再被这三种图标引用。
- 三张图标使用独立flat标记，经sprite shader按生成PNG的alpha显示统一青蓝/粉紫/橙黄色，平滑alpha阈值抑制生成透明边缘噪点，去掉原图轻微色差，关闭这三张的bloom；其他图标保留原材质/辉光。原始1280图保留；运行时一次性缓存128画布缩略纹理，避免小图标占用高分辨率GPU纹理，GPU恢复复用画布，无每帧绘制或上传。
- npm run check、bomb-facilities、missile-tile、electric-tiles、gpu-residency、weapon-vfx通过。preview-bomb-tile-icons真实Edge/WebGL覆盖GPU透明四角/超过50%透明区域、flat标记/无辉光/纯色色块、三尺寸生产中与待拾取及上下文恢复；已查看新版图标放大截图。preview-production-base验证其余图标辉光/灰色基座/三尺寸/GPU恢复仍通过。仅本地未发布，非手机实机验收。



## 2026-10-26 本地：冰冻炸弹初始范围提升1.5倍

- 按用户要求将基础半径160→240；保留每级增加50，因此1/2/3级范围为240/290/340。冻结、清弹和范围波共用freezeStats，说明同步，冻结时长保持2/3/4秒。
- npm run check、test-bomb-facilities（三级内外范围、冻结/清弹/施工）和test-missile-tile通过。仅本地未发布。



## 2026-10-26 本地：按用户纠正修复罐子下方图标面片

- 用户明确前述截图指罐子下方亮色正方形面片，而非罐身。本轮撤回上一轮罐身markPhosphor亮度改动，恢复原罐身材质；删除不再适用的preview-bomb-material脚本。上一条“罐身发黑定位”不代表用户问题根因。
- 底部是MapIcons图标/辉光贴片，新增冰冻/激光/导弹原来直接上传SVG。当前Edge未复现用户截图中的实心方片（旧SVG GPU角落alpha同样为0），因此未宣称已证实根因。针对SVG直接上传的兼容路径，将现有SVG经浏览器透明canvas按128×128栅格化为透明RGBA PNG，保留SVG源文件，正式MapIcons.url统一读取这三种PNG；图案/颜色/几何/充能/玩法不改。
- 新增preview-bomb-tile-icons真实Edge/WebGL：直接附加实际GPU图标纹理读取alpha，三张PNG均超过50%像素全透明且四角alpha=0、具有足够实色图案像素、无GL错误。390×844/320×568/1280×900生产中/待拾取底板截图、图标放大图及上下文纹理重建通过；已查看放大图与390待拾取图，底部正确显示雪花/旋转激光/导弹图案。npm run check、bomb-facilities、missile-tile、electric-tiles通过。仅本地未发布，用户旧标签需刷新，尚需用户原设备验证截图现象是否消失。



## 2026-10-26 本地：炸弹罐弱光下罐身发黑修正

- 用户截图反馈罐身像缺贴图。检查四种罐体共享模型：颜色与标记由顶点色/几何绘制，没有依赖罐身贴图；放大正常光下颜色完整，暗场sceneGrade与高亮充能底板反差使罐身偏黑。仅对paint主侧壁调用markPhosphor(.25)，补低强度自发光并保留方向光明暗；银色罐盖/拉环/底沿仍正常受光，光环/图案/占地/玩法不改，不修改全局渲染器。
- 新增preview-bomb-material真实Edge/WebGL：四种罐体弱光GPU像素A/B（关闭两侧灯和顶灯，夜间调色）逐体RGB总值提升超过25%；正常/弱光放大截图已查看。A/B仅在隔离预览中移除/恢复新法线标记，生产继续共享常驻CPU/GPU模型，不逐帧重建；验证连续绘制buffer复用、上下文恢复、无页面/GL错误。
- npm run check、bomb-facilities、missile-tile、electric-tiles、gpu-residency及preview-bomb-facilities三尺寸通过。仅本地未发布，用户旧标签需刷新，非手机实机验收。



## 2026-10-26 本地：导弹地块、元素爆发与冻结泛白

- 新增missile_bomb“导弹地块”，沿用每4秒生产/24单位拾取/库存停产/三格占地/三级合成。拾取从角色朝全场最近3/4/5个不同合法敌人各射1枚追踪导弹，初选不包含敌方导弹、隐藏目标或危险炮台；复用友军seeker曲线跟踪移动目标，目标失效按就近重新锁定。基础伤害12、逐级×1.8（支持脉冲增伤），爆炸半径58/66/74，正常护盾/伤害/击杀管线单次结算。无目标也消费补给并出反馈；暂停停计时，生存/电锯关正常推进寿命，换层清理。接入关前候选、测试背包、攻击分类、设计台防御类别、旧存档缺新ID默认启用、生产加速/回响/补给体系及卡片不展示攻击范围规则。
- 增加橙色补给罐/独立SVG导弹图标，飞行导弹常驻共享模型，有尾焰/烟迹；只更新实例姿态。新增32枚会旋转、下落和落地弹跳的元素碎片，复用敌人死亡物理粒子并按元素发光冷却，元素碎片最多256个。
- 复用敌人死亡的完整分层特效（短白闪、冲击形状、30道减速光刺、多层有色烟雾、常驻体积烟团）并放大，支持冰蓝/电浆蓝/激光粉/导弹橙四套配色。电浆/冰冻/激光拾取和导弹发射/命中使用对应颜色；原敌人/玩家/Boss死亡默认表现保留，视觉发射器不触发击杀/奖金/死亡声音。共享死亡特效仍最多16个，粒子暂停/到期/重开沿用原机制。
- 冻结状态由enemyHitFeedback传入现有resident实例着色器white混合值0.68，冻结全程持续向白色混合；受击闪白取最大值，解冻恢复0，不重建/复制模型网格，普通敌人及使用同通道的Boss均生效。
- 新增test-missile-tile并接入run，覆盖生产/升级/最近不同目标/玩家出射/追踪与目标死亡重选、实际爆炸伤害且只结算一次、危险炮台排除、无目标/暂停/生存到期/换层、GPU白色混合/受击/解冻/常驻复用、四套粒子配色/无奖励副作用/上限。npm run check、missile-tile、electric-tiles、bomb-facilities、particle-surfaces方格/六角、weapon-vfx、death-feedback、gpu-residency、clock-repair、tower-range通过。
- preview-missile-tile真实Edge/WebGL覆盖390×844、320×568、1280×900待拾取模型、三级5个不同目标出射/飞行/实际命中、GPU冻结0.68与解冻0、四套配色/物理碎片、上下文恢复/共享模型与无页面/GL错误，已查看导弹飞行、橙色爆发和冰冻泛白截图。全量npm test仍在此前记录的test-tile-feedback中place返回null处中断；未宣称全量通过。仅本地未发布，非手机实机验收。



## 2026-10-26 本地：卡片排除攻击覆盖范围

- 用户要求地块卡片只考虑占地+有效范围，不显示攻击范围。thumbnail对电浆/冰冻/激光炸弹排除范围outputs，SVG绘制和viewBox缩放均仅取占地；兼容用户旧tower七格+radius420存档，避免旧攻击圈将占地图形缩小。供电/灌溉/修理等非炸弹卡片保留作用范围；存档、地图预览和实际战斗不改。
- npm run check通过；真实IAB用户存档核对：电浆炸弹7占地/0范围、电池8作用格保留，截图tests/card-footprint-effective-range.png已查看。已新开本地测试页展示修改，原设计台数据未改。


## 2026-10-26 本地：冰冻炸弹与旋转激光炸弹

- 沿用电浆炸弹三格生产/24单位拾取/未领取停产/每4秒生产及同类同级合成规则，新增freeze_bomb与laser_bomb。接入关前候选、测试背包、地块测试攻击分类、设计台防御类别、平面图标与青色雪花/粉色激光罐共享常驻模型。旧设计台存档没有新ID时默认启用，显式关闭仍生效；电池/涡轮/回响/钟表生产加速及脉冲增伤兼容。
- 冰冻拾取以角色为中心：1/2/3级半径160/210/260，冻结2/3/4秒；清除范围内普通弹、抛射弹、导弹与落点危险，不引爆被清导弹。敌人停止行动/开火，打断双发后续弹与激光眼，强建施工目标与进度清零，解冻重新施工。普通敌人及Boss更新入口接入冻结，UFO母体/子机、病毒个体分别判断；蛇连体以冻结段暂停整条运动。常驻冰环标记与扩散波可见。
- 激光1/2/3级分别2/3/4道，宽8/12/16，持续3秒，每道独立随机顺逆时针，以每秒1.25圈旋转并跟随角色。沿用友军伤害/护盾/击杀结算，每道对每目标0.1秒间隔，基础每tick伤害2并随等级×1.8与脉冲增伤；连续角度扫掠避免大帧漏判。危险炮台排除；无目标也触发并正常到期，生存/电锯关同样推进寿命。暂停冻结效果，换层清理光束与冻结。
- 新增test-bomb-facilities并接入run：生产/库存/拾取/升级、冰冻范围时长/清弹/施工与激光打断、真实伤害/短间隔/双向扫掠/随身旋转/炮台排除、暂停/生存/到期/换层、旧存档开关与电池支持、常驻模型。npm run check、新专项、electric-tiles、builder方格/六角、tower-range、clock-repair、gpu-residency、drone-boss、ufo-boss、humanoid、test-52/63通过。
- preview-bomb-facilities真实Edge/WebGL三尺寸390×844、320×568、1280×900、冰冻施工清弹、三级四道光束/宽度/跟随、共享模型GPU恢复、页面/GL无错误通过，已查看待拾取/冰冻/激光390截图。修复新增SVG图标未指定尺寸造成的GL上传错误。既有preview-electric-pickup也通过。全量npm test仍在既有test-tile-feedback遍历设施place返回null处中断，未宣称全量通过。仅本地未发布，非手机实机验收。



## 2026-10-26 本地：电浆炸弹全屏电击

- 按用户要求，将电浆炸弹首目标420及后续135的距离门槛全部取消；从全场合法combatTargets按就近顺序连锁选敌，1/2/3级仍分别最多8/12/16个、不重复选中，原伤害/拾取/音效保持，危险炮台与未进入可攻击状态目标继续排除。
- 玩家描述及设计台说明同步为全屏、目标间无距离限制；设施加成范围仍独立。
- npm run check、test-electric-tiles（两侧远距目标跨越旧首目标/连锁限制）、test-tower-range（六种设施作用范围下0–1200距离实际伤害及炮台排除）、preview-electric-pickup真实Edge/WebGL通过。仅本地未发布。


## 2026-10-26 本地：电浆炸弹按等级增加电击人数

- 用户要求炸弹能电更多敌人且升级继续增加。原各级固定5目标改为1/2/3级分别最多8/12/16个，统一towerTargetLimit读取设施等级；既有伤害逐级×1.8、首目标420与后续135连锁距离、就近选敌和炮台排除保持。连锁距离不足/敌人数不足时按实际可连接目标数结算。
- 玩家说明显示三级目标上限，测试背包与选中状态显示当前级最多电击人数。合成后立即按新等级结算下一次拾取。
- npm run check、test-electric-tiles（新增真实合成到三级、8/12/16个不重复目标、实际伤害数量及持续特效不重复扣血）、test-tower-range、preview-electric-pickup真实Edge/WebGL通过。仅本地未发布。


## 2026-10-26 本地：电浆炸弹指定闪电音效

- 从用户指定Unity工程复制Hit_LightningShieldImpact2.wav到dist/assets/audio/plasma-lightning-impact.wav，原文件不修改。电浆炸弹拾取放电替换原护盾拾取和弦，播放指定样本一次，无目标放电反馈同样播放。
- 原始样本约0.933秒，峰值0.851/RMS 0.188；独立lightning增益设0.16（约-16dB），接入既有effectsOutput总音量、静音及暂停/失焦时声音清理。音频解锁时预加载并缓存，80ms内密集拾取限制一次，复用12路样本上限，避免叠音。
- npm run check、test-electric-tiles、test-music-ownership、preview-electric-pickup通过；真实Edge额外确认WAV解码、0.16实际AudioParam增益、50%总音量、静音与密集触发限制通过。未做用户设备主观听感验收，仅本地未发布。


## 2026-10-26 本地：电浆罐倾斜与轻微自发光

- 按用户纠正的“倾斜”要求，将电浆罐围绕罐身中心倾斜约24°，保留轻微悬浮。仅更新实例矩阵，常驻网格继续共享。
- 罐身上下细光带、侧面高光与闪电标志使用自发光材质，增加低强度青蓝呼吸光晕，银色盖/拉环和蓝色主体保留正常受光。
- npm run check、test-electric-tiles、preview-electric-pickup通过；真实Edge/WebGL三尺寸、单次拾取伤害与GPU重建无错误，已查看390×844截图。仅本地未发布。


## 2026-10-26 本地：电能防御塔改为拾取式电浆炸弹

- 按用户参考图，将tower替换为“电浆炸弹”：每4秒生产1个蓝色罐装炸弹，无敌人也生产；未拾取时暂停生产，走近任意占用格24单位拾取，每份从玩家位置释放一次闪电。无目标也正常消费并播放拾取放电反馈，不创建无效伤害弹。保留原三格占地/设计台自定义形状、同级合成、基础伤害6/逐级×1.8、420首目标范围及原闪电连锁与单次伤害结算，危险炮台仍排除。
- 移除自动电塔模型与塔身射程圈，蓝罐/银色盖和拉环/浅色闪电标记使用electric:plasma-bomb共享residentMesh，仅待拾取时出现。背包、说明、选中状态改为生产/拾取语义，已有设计台tower名称/说明由新玩法统一显示，几何与作用范围仍按原保存值。钟表店生产加速现在覆盖炸弹；电池、涡轮、回响、脉冲强化继续兼容。
- npm run check、test-electric-tiles、test-tower-range、test-clock-repair、test-gpu-residency通过。preview-electric-pickup真实Edge/WebGL验证未拾取无攻击/停产、玩家出射、只结算一次伤害、三尺寸蓝罐及GPU重建，无页面/GL错误；已查看390×844待拾取截图。旧preview-electric-tower入口转发至新拾取预览。test-tile-feedback仍在既有遍历设施place返回null处失败（此前HANDOFF已记录），未宣称全量通过。仅本地未发布，非手机实机验收。


## 2026-10-26 本地：关前纸飞机平铺与向内流光

- 按用户迭代，将连续长空心箭头改为重复的空心纸飞机轮廓（尖头、双翼、仅外轮廓，无中间折线），沿世界地面方向逐格平铺。每个形状24×18世界单位（缩小约1/3），间距最多32（更密）；第一片后缘从游戏视口边缘开始，最后一片尖头落在原场地外缘终点，保留世界投影和屏幕边缘反算。
- 全部纸飞机共用strong-entry:paper-plane常驻网格，每帧仅变更实例位置与white高亮值。按用户后续反馈改高饱和亮橙#ff6a00，流光泛白上限.92降至.22、角点光色改#ff7900，避免褪成灰白；中线已移除。基于performance.now让高亮波峰按序从屏幕边缘流向场内，战斗因准备阶段暂停时仍播放；波峰仅在轮廓尖角加小范围光点，保持空心内部。屏幕感叹号辉光、拖放穿透和开战隐藏保持。
- npm run check、test-strong-forecast六角及preview-strong-forecast真实Edge/WebGL通过：强建/浮桥/普通强敌/无强敌三种尺寸，小尺寸/4段外轮廓/高饱和基础色/更密重复数量、边缘投影误差<0.1px、终点世界位置不变、准备暂停期间高亮变化而几何不动、常驻buffer/网格复用、屏幕警告边界/互不重叠、交接隐藏和无页面/GL错误。已查看390×844浮桥和强建截图，并刷新用户当前forecastlab=1测试关。仅本地未发布，非手机实机验收。


## 2026-10-26 本地：扩建空地仅出现在第一个选择

- 用户要求关前刷出的空地块只在三选一第一个选项出现。prepareFloor先从合法扩建中抽取首项，再从后续候选池移除全部扩建类型，第二/三项仅抽非扩建设施。
- 补足候选数量时仅重复非扩建候选；若只有扩建可放则只提供一个选项，避免旧stock[0]兜底将空地复制到第二/三项。场地已满无扩建时继续提供可放设施；全部无合法落点时保持空选择并允许开战。
- npm run check和新增真实Edge preview-expansion-choice通过：80组抽样、满地图、仅扩建可放、仅一种设施可重复补足、零合法落点。旧preview-floor-shapes末尾原来强制三个扩建的过时断言同步为仅首项扩建，本轮仅语法检查该脚本，未宣称全量通过。仅本地未发布，用户游戏旧标签需刷新后使用新代码。


## 2026-10-26 本地：钟表店平面化、电锯关提速与生存结算

- 钟表店移除额外立体店铺和高悬钟面，沿用生产核心灰色底座、平面图标及普通图标补给芯片；10秒生产与三项叠加加成保持。
- 电锯关锯刃速度105→240，三章基础时长统一15秒（仍应用酒水时长倍率）；保留三锯预警、45度反弹、扫掠碰撞、暂停、危险源拆除与奖金。
- 结算按冻结的本关敌人总数判断：0敌人显示“成功存活 / SURVIVED”，隐藏整行杀敌进度；有敌人保留胜利/完胜与击杀统计，切换时恢复行显示。
- npm run check、saw-room方格/六角、clock-repair、settlement通过。真实Edge/WebGL的stage-result与saw-room预览通过，生存结算覆盖390×844、320×568、1280×900；已查看320窄屏结算与390钟表底座截图。clock-repair预览的模型/交互断言已运行到末尾，但设计台报ENERGY_SYSTEM_ENABLED未定义；全量npm test在test-tile-feedback遍历设施时因place返回null而中断，未宣称全量通过。仅本地未发布，未做手机实机验收。

## 2026-10-26 本地：关前世界箭头与简洁强敌警告

- 按用户修正，箭头使用世界坐标地面上的空心轮廓，从游戏视口边缘朝房间外缘指向。通过拟合后相机vp矩阵求世界射线与屏幕四边交点，起点随屏幕边缘变化、终点保持世界位置；7条轮廓线共用strong-entry:arrow-outline常驻网格，线宽/箭头头部以世界单位定义，随场景投影和深度处理。屏幕层每路仅一个带框三角感叹号，双层橙色drop-shadow持续辉光，跟随箭头尾部投影并限位，不显示文字或屏幕箭头；不拦截拖放，离开准备阶段隐藏。
- 强建三路与普通房战斗机、激光眼、隐形无人机、飞蛾、骷髅机使用strongEntryPoint共享预告/实际出场点；普通名单带strongEntry标记。浮桥通过纯bridgeLayout共用当前地形的左右入口，预告不创建桥、不生成敌人、不改统计。实际出场取消这些强敌原来的全圆随机偏移，以保证方向一致。强建常规出场原有GROUND_ENEMIES关闭开关保持，启用时才显示，未重新启用旧敌人。
- 新增test-strong-forecast并纳入tests/run，覆盖预告无副作用、强建/三章浮桥/普通强敌方向与数量、特殊关排除和重开；方格/六角均通过。npm run check、enemy-diversity、enemy-waves、bridge-room、builder两种地图及campaign八路线通过。
- preview-strong-forecast真实Edge/WebGL检查390×844、320×568、1280×900的强建/浮桥/普通强敌/无强敌、警告边界与互不重叠、每路7段常驻空心轮廓、尾部投影落在视口边缘误差小于0.1px、终点世界坐标跨尺寸固定、辉光已启用、无屏幕箭头/文字、交接隐藏、无页面/GL错误；已查看空心长箭头版浮桥/强建390×844截图，并通过CUA刷新用户当前forecastlab=1页面，确认B09准备阶段两侧辉光警告和空心世界箭头。新增forecastlab=1入口直接跳B09准备阶段，可正常摆地块开战。仅本地未发布，未做手机实机验收。

## 2026-10-26 本地：暂时关闭能量系统

- 用户反馈战斗中关注能量过于困难，要求先关闭。生产默认ENERGY_SYSTEM_ENABLED=false：主武器与移动产蜂不扣蓝、0蓝也正常开火，不显示蓝条、能量HUD、装备基础耗能及“蓝量不足”；初始中心不再生成能源站，恢复普通地块，不占用/保护中心。
- 能量数值、设施、保护和视觉代码保留，通过同一开关控制；原test-energy与preview-energy显式在隔离测试中开启，继续覆盖保留机制。新增test-energy-disabled覆盖默认关闭时39型武器0蓝连续开火、无提示/蓝条/耗能属性/核心、普通中心及重开，纳入tests/run。设施测试按enabled筛选，重开断言恢复空设施。
- npm run check、energy-disabled、隔离启用energy、builder方形/六角、electric-tiles、weapon-vfx、timed-floors、settlement、clock-repair通过；preview-energy-disabled真实Edge/WebGL验证0蓝连续200次开火、无HUD/核心及三尺寸，已查看390×844截图。仅本地未发布，非手机实机。


## 2026-10-26 本地：能源核心与脚下地块不可破坏

- 审查现有战斗敌人：强建机器人将普通格转换为陷阱，原有electricFacility占用检查已经排除核心；本轮进一步给核心脚下地块添加terrainProtected标记及统一terrainProtected判断，强建选格、过期施工目标、最终改造和普通地形奖励选格均排除。设施摆放也不能覆盖保护格，原有核心不可拆除/移动/合成规则保留。
- 地形规划与提交两个入口通过preserveProtectedTerrain保留保护格及原能源站，删除底板、覆盖设施、旧规划漏掉核心时均保留原地块对象及生产状态；普通格照常处理。新开局/测试场显式reset仍清理保护标记并按原流程建立新核心。
- 新增test-energy回归：真实强建过期目标取消、直接转换拒绝、计划删除底板/覆盖为墙或陷阱/过期计划漏格均保留核心，同时普通格改造成功。npm run check、energy、builder方形/六角、electric-tiles、settlement、timed-floors、clock-repair、hex-city通过。逻辑改动，无新视觉验收；仅本地未发布。


## 2026-10-26 本地：玩家血条下方蓝条与蓝量不足提示

- 玩家头顶血条正下方新增连续蓝条，宽度跟随生命+护盾条总宽，随角色移动/坐骑/跳跃高度一起变化；按当前能量/60填充，0能量保留空槽，死亡随血条隐藏。原有耗能和补给数值保持。
- 射击所需蓝量不足时弹出“蓝量不足”，同一玩家每2秒最多一次，提示显示1.2秒，避免自动开火刷屏；开新关重置提示冷却。
- npm run check、test-energy（新增半蓝宽度/血条下方位置/空蓝槽/提示内容与限频）、test-player-death通过。preview-energy真实Edge/WebGL三尺寸与满蓝/半蓝/空蓝截图、血条和蓝条屏幕投影上下关系、蓝量不足可见提示通过；已查看半蓝及空蓝截图。仅本地未发布，非手机实机。


## 2026-10-26 本地：核心能源补给站与主武器射击耗能

- 初始中心(0,0)固定为单格能源补给站，复用现有生产核心机械底座、进度、悬浮补给芯片和电池图案。每4秒生产1份30能量补给，库存1份、未领取停产；24单位内自动拾取，满能量保留产物。核心不能移动、拆除或合成，不进入关前三选一；设计台关闭设施不关闭核心。每关重置生产周期，沿用现有设施换层规则。
- 每关开场60/60能量，离开核心无自动回能。主武器每轮预扣耗能，能量不足不发射，拾取后自动续射；连发整轮只扣一次，多弹丸纳入DPS，持续激光计7次伤害tick，旋转武器按实际帧dt扣费；蜜蜂枪移动额外产蜂也扣费。无人机/坐骑/防御设施保持独立。
- DPS按单目标名义输出计入弹丸、连发、期望暴击、剑/剑气、回旋往返、持续光束及进化伤害；不把不定数量的穿透/爆炸/连锁目标乘入。基础耗能=clamp(4×sqrt(DPS/初始手枪DPS),3,24)，按轮间隔折算单次扣费，攻速加成自然提高每秒消耗。按用户进一步澄清拉开轻重武器：初始手枪4/秒，60能量连续15秒，覆盖首关20秒的75%；天穹裁决约17.2/秒，储备约3.5秒，30能量仅支撑约1.7秒的理论火力，一级站每4秒才补一份，故必然存在明显停火。取消此前7.5/秒的低上限，安全上限改24/秒（确保最慢武器单轮也能由满能量启动）。HUD显示余量/低能量补给提示，装备面板新增基础耗能。
- 关卡时长保持：普通B01为20秒、每层+2秒、B21起60秒封顶，酒水倍率照常；Boss不限时、酒车休息等原有分支保持。持续射击才要求补给，提前击杀/躲避超时仍可完成原有关卡，未强行添加拾取通关条件。
- 新增test-energy覆盖39型耗尽/禁射/续射、生产/库存/满能量/暂停/换层/重开与连续武器，以及40秒补给循环中手枪无等待、高耗能狙击累计等待超过15秒，纳入tests/run；更新旧设施重开空布局断言为保留唯一核心、农田摆放避让核心，烟花视觉循环用例补满能量后独立取样。
- npm run check及energy、electric-tiles、timed-floors、settlement、enemy-waves、campaign八路线、clock-repair、tower-range、hex-city、hex-terrain、tile-feedback、juicy-pistol、weapon-vfx、gpu-residency通过。preview-energy真实Edge/WebGL验证耗尽、回核心拾取续射、40秒持续补给及390×844/320×568/1280×900，已查看390×844截图，未做手机实机验收或全量npm test。仅本地未发布。


## 2026-10-26 本地：Bloom降强度、扩半径，恢复图标清晰边界

- 用户反馈辉光仍不够柔和却已过亮。本轮将辉光强度1.25降至.65，扩散半径.4增至.52，padding由2倍增至2.4倍；采样32增至48并相应归一权重，避免扩圈稀疏。去掉图标主体额外提亮，恢复原纹理RGB×原色，保留锐利细节；外围只有低强度柔光。灰色底座及非核心勾边保持。
- npm run check、test-electric-tiles、test-tile-feedback、preview-production-base通过；真实Edge/WebGL三尺寸像素比较、灰色无发光材质、核心高度/位置、显存复用及context丢失恢复通过。390×844光晕累计增亮从54721降至30762，增亮超过20RGB总值像素由341扩至357，验证覆盖略广且能量下降；已查看更新截图，币符等内部边界更清楚。仅本地未发布，非手机实机。

## 2026-10-26 本地：关闭LED点阵、增强柔和Bloom

- 按用户偏好移除图案LED网格/圆点alpha调制，恢复连续图案并保留原纹理RGB内部明暗细节；核心参数从led更名bloom，仅控制柔光与轻微提亮。灰色无自发光底座、非核心勾边保持。
- 图案柔光改32点黄金角高斯权重采样，半径由UV .24扩大到.4，padding从1.75倍扩大到2倍，强度由.95增至1.25，使衰减更连续、外扩更柔和。复用原图案纹理与缓存，保留深度遮挡。
- npm run check、test-electric-tiles、test-tile-feedback、test-gpu-residency和preview-production-base通过。真实Edge/WebGL三尺寸、灰色非发光顶点、核心位置/高度/共享网格、context丢失恢复及像素开关对比通过；390×844柔光ROI中341个像素增亮超过20RGB总值，累计增亮54721（上一版约25647），已查看更新截图。仅本地未发布，非手机实机。

## 2026-10-25 本地：灰色无发光底座与可见LED辉光

- 按用户反馈，核心三层底座全部改中性灰普通受光材质：灯线、发光固定件、侧壁状态灯均换灰色金属嵌条，去掉所有emissive顶点，所有核心共用hex-production-base:gray网格。非核心勾边保持。
- 查明此前图标实际屏幕约十几像素，48列点阵小于像素且明暗对比仅17%，柔光半径最多原图UV的.065，约一像素，且同大quad裁切外溢。现改12列高对比点阵；辉光quad扩大1.75倍并复用缓存，UV反映射保证图案不放大，三圈.065/.14/.24轮廓采样形成可见外溢，调低近圈避免糊掉图形。辉光保持深度遮挡，仅核心启用。
- npm run check、test-electric-tiles、test-tile-feedback、test-gpu-residency通过。preview-production-base三尺寸通过，包括灰色/无自发光顶点检查及真实GPU像素对比：390×844单图标ROI中242个像素因辉光增亮超过20RGB总值，76个像素因点阵产生超过25RGB总差，390×680及1280×900同样可见；另保留核心实例、进度高度、显存缓存及context丢失恢复检查。已查看更新的tests/production-base-390x844.png。仅本地未发布，非手机实机，未跑全量npm test。

## 2026-10-25 本地：核心三层包边、抬高台面与LED图案

- 核心底座改三层阶梯装甲包边，加入明暗分层/金属倒角/夹层灯线，中心面从2.35抬至9.35。非核心格保持原勾边。核心图案位于10.35，进度填充缩至内台面并抬到9.6，立体模型/水果/库存标记与相关光点同步抬升，塔出射高度随线圈改65（方格保持58）。
- MapIcons.ground增加可选led模式，仅核心启用；共享原图案纹理/顶点，添加沿图案alpha轮廓的两圈柔光采样加色层及明亮LED点阵主层，保持深度遮挡。普通拾取物及其他图片保持原模式，不改素材或引入依赖。
- npm run check、test-electric-tiles、test-tile-feedback、test-gpu-residency、test-hex-city通过；preview-production-base真实Edge/WebGL三尺寸验证仅核心实例、图案/辉光共享缓存、台面/进度高度、升起同步、GPU重建及真实context丢失/恢复，已查看390×844及1280×900截图。旧preview-electric-tiles在开头“select数量应为0”断言失败（现有编辑器有2个select，未进入本轮渲染检查）；本次不修改无关界面。仅本地未发布，非手机实机，未跑全量npm test。

## 2026-10-25 本地：机械底座仅保留在设施核心

- 按用户澄清，多格设施仅coreCell显示凸起机械底座；其他占用格恢复原柱顶及勾边，原设施外轮廓保持。旧单格医疗/护盾/印钞底座保留。
- npm run check、test-electric-tiles、test-tile-feedback和preview-production-base通过。真实Edge/WebGL三尺寸验证底座数量与核心坐标严格对应（七格矿机只有一个底座）、共享buffer、GPU重建及升起同步；已查看更新后的tests/production-base-390x844.png。仅本地未发布。

## 2026-10-25 本地：生产六角格赛博机械底座

- 六角生产/电力设施占用格及旧医疗、护盾、印钞格增加低矮实体机械底座：倒角金属圈、凹入工作面、六面暗槽/状态灯、分段青色顶灯、角部固定件及下沿灯线。保留原图标高度、生产进度及玩法；普通空格和陷阱保持原样。柱顶收窄给装甲侧壁留出空间，底座按灯色共享residentMesh并随RoomReady升起。
- npm run check、test-hex-terrain、test-hex-city、test-electric-tiles、test-tile-feedback、test-gpu-residency通过。新增preview-production-base，真实Edge/WebGL三尺寸检查占用格实例数、有限顶点、网格/buffer复用、GPU重建及升起位移；已查看tests/production-base-390x844.png。仅本地未发布，非手机实机，未跑全量npm test。

## 2026-10-25 本地：结算击杀统计防误计与清场前冻结

- 用户反馈还剩几个敌人却显示100%，怀疑超时清场计入击杀。检查确认finishTimedRoom原本只走shatterVisual、不直接派发击杀；未复现用户原局具体调用，但复现recordStageKill接受hp>0活体及结算后回调的漏洞（新增用例在修复前失败）。
- recordStageKill仅接受hp<=0、非roomCleanup/逃走/自毁且未冻结的对象；stageResultStats再次过滤不合法死亡，100%仅允许精确全歼，部分击杀四舍五入最多99%。
- 超时先标记存活敌人为roomCleanup并冻结{total,defeated,ratio}快照，再播放碎裂并清空；其他正常结算也在事件前冻结。统计不能被后续hp=0或延迟死亡回调抬高，结算奖金收入仍可累加。分母保持开局固定总名单，文案从“已登场敌人”修正为“本关敌人”。
- 新增真实友方伤害杀17/20、留下3个后通过真实step截止清场，验证结算85%、不获完胜；另覆盖活体拒收/晚回调/201只剩1只不四舍五入为100%。更新浏览器构造例先扣血后登记。
- npm run check、settlement、enemy-waves、timed-floors、campaign八路线通过；preview-stage-result真实Edge/WebGL四尺寸、真实伤害→deadline→17/20=85%及点击继续通过。截图tests/stage-result-timeout-85-390x844.png，非手机实机。仅本地未发布。


## 2026-10-25 本地：弹射锯刃与场景电锯同尺寸

- 按用户截图反馈，锯刃回廊弹射电锯与固定电锯共用 drawSceneSawBlade / trap:saw-blade 常驻模型，统一锯盘、12齿、中心、厚度与1倍缩放；保留原转速、预警、路线和场景底座。环绕电锯原有1.15倍保持。
- 弹射碰撞/边缘反弹半径从15改21，对齐固定电锯原有效接触半径25-4。
- npm run check、test-saw-room方形/六角、test-gpu-residency及preview-saw-room真实Edge/WebGL三尺寸通过；新增同场固定+三个弹射锯刃共用网格/等比例断言，已查看saw-room-same-size-390x844.png。仅本地未发布，非手机实机。



## 2026-10-25 本地：隐形无人机绕侧伏击

- 新增stealthDrone，从第14层加入普通房有限名单，威胁3，保持房间总名单/威胁预算。独立深蓝双环旋翼无人机常驻模型，显形瞄准亮粉色警示，射击有短促枪口光。
- STEALTH_DRONE统一配置：距离玩家超过210隐形，潜行绕到选定方向再靠近；155以内解除隐形，0.55秒显形瞄准，只有125以内且无遮挡才射一颗205速度直线子弹。攻击后保持显形0.65秒，再退到210外隐形并换方向。155/210迟滞防止临界闪烁；八方向按场地边界/掩体选潜行与退路，移动遵守掩体碰撞、速度酒水倍率与模拟时间。
- 隐形期间不会攻击；模型/影子/血条不画，不进入自动瞄准和新追踪目标，旧追踪飞弹/蜜蜂及挂载跟踪丢失隐藏目标。combatTargets增加includeHidden参数，实际子弹/火箭碰撞、剑刃、酒水范围伤害和护甲脉冲保留隐形实体受击，隐形不等于无敌。隐藏敌人继续占威胁和通关名单。暂停/受控停止潜行，死亡取消攻击。
- npm run check、test-stealth-drone（完整绕侧/显形/近射/暴露/撤离再隐形、距离不等式、隐藏禁射、自动瞄准排除与流弹伤害、暂停/受控/死亡、两角落、常驻网格、普通名单）、enemy-waves、enemy-diversity、enemy-flight、added-enemies、enemy-transports、timed-floors、gpu-residency、campaign八路线通过。
- preview-stealth-drone真实Edge/WebGL三个尺寸验证隐形无模型/瞄准、显形预警与近距离单发、网格buffer复用和无页面/GL错误；已查看stealth-drone-reveal-390x844.png。仅本地未发布，未做手机实机或全量npm test验收。


## 2026-10-25 本地：每条巡弋轨道仅一座炮塔

- 按用户反馈将巡弋火网由每轨两座改为每轨一座，共六座；去掉成对间距与缩短活动区间，单炮塔沿整条轨道在两个端点间往返。保持60移动速度、1.05秒射击间隔、临时陷阱和其余关卡规则。
- npm run check、test-rail-room六角及preview-rail-room真实Edge/WebGL三尺寸通过，确认六个共享炮塔模型、直射/暂停/清理；已查看更新后的rail-room-390x844.png。仅本地未发布。


## 2026-10-25 本地：导弹战斗机与斜射追踪激光眼

- 新增fighter导弹战斗机，第7层起加入普通房有限名单，威胁3.5；复用现有fighter常驻机体/座舱模型，原moth扇射保留。每3.1秒发射一枚可击毁的追踪导弹，速度35起步，1.2秒二次加速至320，随后保持；尾焰随速度拉长。积分距离与1/120秒细分/扫掠碰撞避免高速穿透，旧missile发射器保持150速度。
- laser改为悬浮激光眼，第12层起加入普通房，威胁4。充能1秒固定玩家初始脚底坐标；斜射到地板，开火先停留0.22秒，再以105速度追踪脚底1.6秒，冷却2.4秒。预警线/地面环、眼部光团、立体交叉光束和落点光斑配合；伤害只算地面落点/扫过路径，不沿水平投影整线伤害。沿途掩体阻挡并单次承伤，暂停/死亡停止攻击。陷阱激光炮台保持原横向机制和不可攻击规则。
- 新增test-enemy-diversity并纳入tests/run，更新enemy-waves与enemy-transports的旧地面激光/预警时长断言。npm run check、专项、enemy-waves、enemy-flight、added-enemies、ranged-movement、enemy-transports、gpu-residency、timed-floors、campaign八路线、settlement、machine-turret通过。test-cover-tile在既有第7层房间恢复断言失败，临时移除本次名单扩充并恢复激光地面分类后同样失败，未改动该无关逻辑；未宣称全量npm test通过。
- preview-enemy-diversity真实Edge/WebGL三尺寸通过，验证共享机体buffer、加速速度、开火原点锁定、后续落点追踪、无页面/GL错误；已查看390×844开火/追踪截图。仅本地未发布，非手机实机。


## 2026-10-25 本地：巡弋火网与三轴临时炮塔轨道

- 每章第十层B10/B21/B32新增“巡弋火网”生存挑战：根据已铺房间的六角外接半径，在外侧升起六条互不相连的直线六角轨道，三组方向0/60/120度。轨道调用浮桥共用的24单位厚半透明六角砖（顶面紫色），1.6秒按格从下方升起；不加入tiles，玩家不可走、不可建造。原三行滚石浮桥保持。
- 每条轨道两座机枪炮塔，共12座，沿直轨往返。成对保持48间距，同步换向避免重叠；速度60，间隔1.05秒交错射出一颗160速度的直线子弹，每次射击按玩家当前位置瞄准。复用既有机枪炮塔常驻网格/炮口/后坐力，temporary+invulnerable陷阱，无生命条、不进攻击/追踪/连锁目标；修理炮塔和危险源拆除不处理临时炮台。轨道升起前不移动射击。
- 复用生存计时/奖金（普通层时长及酒水倍率，20+层数×2）。暂停冻结；超时、结算、重开、下坠、返回主界面清理临时轨道、炮台和子弹；永久危险源保留。独立?raillab=1直达测试。调整六角适配绘制边界并排除新轨道炮台的旧边界导轨。
- npm run check、test-rail-room方形/六角、test-enemy-waves、test-timed-floors、test-campaign八路线、test-machine-turret、test-hex-terrain、test-settlement、test-clock-repair、test-bridge-room六角通过。preview-rail-room真实Edge/WebGL三尺寸验证12个共享炮塔模型、三种角度、射击、玩家地板隔离、暂停、奖金/清理，查看rail-room-390x844.png；preview-bridge-room真实浏览器回归通过。仅本地未发布，非手机实机。

## 2026-10-25 本地：浮桥六角砖增加实体厚度

- 浮桥由平面改为厚24单位的半透明六角棱柱，增加六面分色侧壁、底面、下沿与竖向亮边；整体随既有升起动画移动。三行宽、玩家禁行和怪物通路保持。
- npm run check及preview-bridge-room真实Edge/WebGL三尺寸、滚球/弹幕、玩家边界、暂停和清理通过；查看bridge-room-390x844.png，侧壁和上下双层轮廓可见。仅本地未发布，非手机实机。

## 2026-10-25 本地：三行浮桥由外向内逐列升起

- 按最新反馈将左右浮桥加宽为相邻三行六角砖，每行分别衔接玩家地板边缘，保持六角错排、暖橙半透明描边和敌用独立通路。
- 架桥演出改为两侧从外向内按列依次从下方240单位升到地板高度，缓出落定；总时长1.5秒，同列三行同步升起，接上玩家边界后才放行滚球。按列数推进动画，避免三行数量使整桥同时显现。玩家仍不能踏上或建造，原滚球/弹幕配置保持。
- npm run check、test-bridge-room方形/六角及preview-bridge-room真实Edge/WebGL三尺寸、玩家边界、滚球支撑/预算和暂停/清理通过；查看三行完成截图。仅本地未发布，非手机实机。

## 2026-10-25 本地：敌用浮桥与滚石横桥挑战

- 每章第九层B09/B20/B31新增“滚石横桥”，保留普通弹幕怪与原定时/有限名单结算。开场1.4秒后左右暖橙半透明六角浮桥从画面外向内逐格伸展，0.85秒完成，接至房间该行两侧边缘；独立bridgeRoom.surface供滚球行走，从不加入tiles，玩家行走、扩建、建筑/修理选区保持原有地板，无法走上或占用浮桥。
- 复用现有ironball模型、82速度、30碰撞半径、近战血量、受击/滚动/碰撞攻击及residentMesh。首批五只保留原构成，后续每批四个滚球+一个普通弹幕怪，两侧交替入场；桥上排队留间距，到达房间后追击玩家并受墙体阻挡。总名单沿用20/30/40等预算，浮桥层威胁上限三章22/28/34，普通层14/20/26保持；真实预览6.2秒时至少8个滚球同时在场且预算内。不开启其他暂停中的地面敌种，不走空投逻辑。
- 暂停冻结架桥和滚球；超时、提前清完、重开、下坠、返回主菜单清理临时通路，不修改永久地块。提供?bridgelab=1直达测试。
- npm run check、test-bridge-room方形/六角、test-enemy-waves、test-timed-floors、test-campaign八路线、test-added-enemies、test-settlement、test-enemy-transports、test-electric-tiles、test-saw-room六角和test-hex-terrain通过。preview-bridge-room真实Edge/WebGL验证逐格延伸、旧滚球共享模型、弹幕同场、玩家实际走到桥口仍被限制、怪物通路支撑、双波至少8球/威胁预算、暂停、清理及三尺寸；已查看bridge-room-390x844.png。仅本地未发布，非手机实机。

## 2026-10-25 本地：中心出生与锯刃回廊

- 每层下坠及正式开战重新定位到中心地块，实际六角坐标读取中心格（不是旧的325/350）；清空方向输入并同步碰撞帧起点。中心被墙体占据时回退最近可站地块，避免出生在障碍物内；酒车休息层同步处理。
- 新增每章第六层B06/B17/B28“锯刃回廊”：三个分散地块错峰1.5/1.95/2.4秒预警后放出电锯，不投放敌人，以普通层时长及酒水倍率计时。电锯固定45度斜行，按实际已铺地板边缘反弹，细分移动与扫掠碰撞防穿透；不属于攻击目标。源地块使用现有flywheel危险字段，修理炮塔可正常施工移除。结束清除临时电锯并发20+层数×2奖金；永久陷阱不受影响。
- 电锯复用residentMesh共享网格；预警/起点标记、HUD与世界倒计时已接入；暂停冻结。提供?sawlab=1本地直达测试，默认关卡按正常三选一准备流程进入。
- npm run check、test-saw-room方形/六角、test-timed-floors、test-enemy-waves、test-settlement、test-builder、test-clock-repair、test-campaign及test-hex-terrain通过。preview-saw-room真实Edge/WebGL覆盖三个尺寸、中心、预警、共享网格、移动边界、暂停、修理塔实际拆除、奖金/清理；查看saw-room-moving-390x844.png。仅本地，未发布，非手机实机。

## 2026-10-25 本地：暂停页图标操作、整体音量与返回主界面

- 暂停页改居中青色卡片，播放/扬声器/主页SVG图标配中文标签。整体音量滑杆控制音乐和所有音效（含cowboy），独立音效比例保持；支持静音与自动保存，下次打开恢复。调整保持暂停，恢复游戏时按新音量播放。
- 返回主界面结束本局，取消准备/摆放和残留结算/输入/场上对象，恢复原主菜单与属性入口；重新进入正常从B01开始。处理hex-loader加载时主按钮被禁用的初始快照，返回后显式恢复按钮可用。
- npm run check、test-60、test-62、test-music-ownership、test-settlement、test-campaign八路线、test-juicy-pistol及test-cowboy通过。新增preview-pause-menu真实Edge/WebGL覆盖390×844、320×568、390×680、1280×900边界/按钮等宽、音量与时钟冻结、静音/恢复、音乐和音效实际音量、返回/新开局、刷新持久化；已查看tests/pause-menu-390x844.png。仅本地未发布，非手机实机。


## 2026-10-25 本地：建筑合成等待与升星激励反馈

- 用户要求合成后等展示完再结束摆放，让玩家看见1星→2星并加入激励效果。ElectricEditor合成成功后保留摆放界面1.25秒：前0.24秒显示原星级，再切到新星级、弹性放大、扩散金色光环、14道金/青火花、“升星成功！”及两段上行音效。效果锚定核心格屏幕位置，少动效模式保留星级揭示/文字、取消弹跳与粒子。
- 播放期间锁住拖动/运行/收回，保持战斗和楼层计时冻结。本关新选项合成在效果结束后才退托盘并经RoomReady进入战斗，不再追加合成烟雾；普通地块升起与新建筑施工烟雾保持。场上两建筑合成也展示，播完留在准备界面、不消耗选项；测试场同样可体验。重置清除待展示效果，切层/目标失效不遗留回调。
- npm run check、test-electric-tiles、preview-building-stars、preview-building-merge、preview-room-ready通过。新增preview-building-upgrade真实Edge/WebGL验证原星→新星、粒子、运行锁定、玩家/世界时间冻结、效果后正式开战、重置取消、2→3级现有建筑合成和选项守恒；已查看building-upgrade-celebration.png。仅本地未发布，非手机实机验收。


## 2026-10-25 本地：击杀槽连续填充、百分比移入槽内

- 按用户要求去掉进度槽重复分段遮罩，改整段连续青色渐变填充；槽高28px，保留斜切端框与辉光。
- 将百分比DOM从标题行移至槽内绝对居中，反向skew保证字不倾斜，18px数字/12px百分号及深色字影保持在亮色填充上可读；0→真实比例动画与aria语义保留，无独立外置数字。
- npm run check、preview-stage-result真实Edge/WebGL四尺寸/数值在槽内居中/无分段伪元素/连续填充/两种结算/暂停/少动效/任意位置继续通过；已查看390×844截图。仅本地未发布，非手机实机。


## 2026-10-25 本地：刷怪改按敌人威胁系数累计

- 用户要求每种敌人有威胁系数。用统一ENEMY_PRESSURE冻结表与enemyThreat替代上一轮10/12/15纯人数上限；普通房三章总威胁预算14/20/26。追逐无人机/缓行机兵/旧bomber为0.75，单发哨机2，双发飞机2.5，骷髅圆形弹幕/飞蛾扇射4，自毁无人机3、铁球1.5、弹跳机2.5；其余已实现敌种（含特殊怪/BOSS及召唤物）均有显式值，未知种回退2，不会零成本入场。BOSS房保持独立规则。
- 定时批次最多5只，按队列顺序累计预留威胁，只放入剩余额度容纳的前缀；直接spawn与旧spawnGroup共用系数/预算。存活运输载荷也预留威胁，死亡立即释放；前6层远程数量的辅助保护仍保留。HUD分开显示敌人数、当前/上限威胁及待入场。每房固定总名单、击杀比例分母、截止及提前清完规则保持。
- npm run check、enemy-waves（同预算18个轻型追逐 vs 3个圆形弹幕，重怪击杀后按权重补1只、直接入场防超额、每种系数、未知回退、运输预留、死亡释放、BOSS豁免）、timed-floors、settlement、economic-drinks、added-enemies、enemy-transports及campaign八路线通过。room-pressure九层×两装备×五种子通过：B08初始装备场上峰值8，B13峰值13，B23峰值17，说明相同人数不再等价；初始手枪B01仍约20秒。仅本地未发布；mock回归，未宣称本轮实机视觉或全量npm test验收。


## 2026-10-25 本地：按参考图修正45°错排菱形与整体梯形

- 用户指出上一轮菱形角度/排布错误，要求原图整体梯形。横幅主片重排为45°等边菱形格阵：三行中心高度76/106/136，第二行横向错半格，保留窄缝；共享梯形裁切M12,74 H588 L528,134 H72形成上宽下窄、上下水平与两端45°收边。两翼合为梯形带，中央原六边徽章保留。
- 不再用扁菱形散落两排；主体轻微浮动收至±.5px并取消单片旋转，防止破坏共同斜边与整体轮廓。外围小片、青色玻璃材质、旋转光/标题辉光、统计和任意位置继续保持。
- test-settlement、preview-stage-result真实Edge/WebGL四尺寸/少动效/暂停/两种结算/粒子清理/任意位置继续通过，查看390×844截图确认梯形收边和错排菱形。仅本地未发布，非手机实机。


## 2026-10-25 本地：横幅大菱形玻璃片为主、青白黑比例收敛

- 用户圈出胜利横幅，要求减少小三角、增加真正菱形，白黑仅少量点缀，主体玻璃色。本轮将两翼各15片三角密阵换为各12片：6片大菱形、2片小菱形、2片边缘小三角和白/黑微小短片各1。共16个完整四边菱形，错层留隙，保留逐片入场/浮动。
- 移除上一轮按nth-child大面积实心青/白/黑覆盖；主体全部青色半透明玻璃渐变、对角折射亮带与细边，三档透明度。白黑只用于4个小装饰短片。
- 外围动态片由约1/3白色、1/7黑色改为各至多2片，剩余均青色，青色alpha上限约.35/.52。烟花、旋转光、字光、进度槽和点击屏幕继续保持。
- npm run check、test-settlement、preview-stage-result真实Edge/WebGL四尺寸/暂停/少动效/任意位置继续通过；查看390×844完胜入场截图，菱形主体清楚且白黑不再抢眼。仅本地未发布，非手机实机。


## 2026-10-25 本地：结算菱形与青白黑纯色粒子加强

- 延续结算UI，按用户反馈增加实心菱形/方片/短片/圆点粒子，普通胜利56个、完胜72个预算，确定性分配青色#00e5ff/#73faff、白色#ffffff、黑色#02070b；分三档大小/速度、错峰散开、旋转、下落和淡出。前景独立SVG不套整体辉光，只有青白高光片带小范围drop-shadow，黑片保持纯黑剪影。
- 标题中央读字区域避让，粒子只覆盖横幅附近，不进入统计区；原细线烟花保留作后层，纯色片作前层。几何横幅也提高青色/白色实心片占比并穿插黑片，不再主要依靠轮廓线。
- 粒子生命周期上限2.6秒，结束清空、不循环；退出结算/重开同步清理两层DOM。继续使用游戏时钟与确定性种子，不消耗玩法随机数；暂停冻结、少动效隐藏。
- npm run check、test-settlement、preview-stage-result真实Edge/WebGL四尺寸/任意位置继续/两种判定/暂停/少动效通过；已查看390×844完胜入场截图，青白黑片可见、无标题遮挡。构造统计截图，非手机实机，仅本地未发布。


## 2026-10-25 本地：非 BOSS 房场上上限、固定总敌数与安全追逐无人机

- 普通定时房新增总存活上限，三章分别10/12/15，近战与远程、运输预留均计入。每批最多5只并按剩余空位截取；满员保留队列，后续按既有定时/清空加速补入；spawn入口也拦截超额。前6层远程5只规则、末2秒停止入场、超时无奖励清场及BOSS/酒车特殊分支保留。HUD显示当前/上限。
- 每房开场记录plannedTotal，结算分母包含没来得及入场的敌人，基础三章20/30/40；酒水时长及蜂巢倍率在开场一次折算进有限名单，取消普通批次出场时动态追加蜂巢队列。比如只杀首批5只、其余15未登场，结算5/20=25%，不会显示100%。
- 默认普通房60%的接近型敌人改为pursuitDrone（追逐无人机），速度72，保持近战生命及碰撞伤害，接触不自毁、被击杀不发圆形弹幕；复用既有无人机几何结构、蓝色机身及residentMesh/飞行姿态。旧suicideDrone保留给显式测试，解锁定义改为9，默认关卡名单不投放。
- npm run check、enemy-waves新增总上限/空位补2只/直接入场防超限/固定统计/超时未入场/追逐接触及死亡无弹幕/蜂巢固定名单通过；timed-floors、settlement、economic-drinks、campaign八路线、added-enemies、enemy-flight、enemy-transports、gpu-residency通过。room-pressure九层×两装备×五种子通过，初始手枪B01约20秒、B13峰值12、B23峰值15；增强装备可提前清完。测试使用mock渲染，未做本轮实机视觉验收、未宣称全量npm test。仅本地未发布。


## 2026-10-25 本地：青色碎片几何、旋转柔光与加粗赛博击杀槽

- 用户要求几何真正碎开、独立动效、背后旋转光、胜利字辉光，击杀进度槽移至胜利下方加粗赛博辉光，并取消过强金色。
- 将连续金属板替换为30个有间隙的独立三角/梯形碎片，各自错峰入场、按不同周期轻微浮动和旋转；中心保留断线六边轮廓与分离角片。标题、碎片、烟花、金币、完胜全部使用青色系，完胜只稍亮。
- 背后新增两层低透明青色放射光，32/47秒反向缓慢旋转，径向遮罩柔和淡出；标题使用三层青白text-shadow辉光。暂停冻结全部CSS动画，少动效静止放射光、停碎片且隐藏烟花/扫光。
- 击杀统计独立放在胜利横幅正下方，条高2→18px，斜切双端框、13px间距分段填充、青色渐变、框/填充辉光；保留0→实际比例快速增长，aria进度同步。金币及点击屏幕继续保持。
- npm run check、test-settlement通过；preview-stage-result真实Edge/WebGL四尺寸、碎片数/独立浮动、旋转光实际变化、暂停冻结、少动效、进度条位置/厚度/65%语义、两种结算/鼠标与触屏任意位置继续通过。已查看390×844与320×568截图，无裁切重叠。仅本地未发布，非手机实机。


## 2026-10-25 本地：金色几何胜利横幅、分层拼合与点击屏幕继续

- 用户提供新的金色VICTORY横幅参考并指出适合动效。本轮用内联SVG重做横向多层金属几何翼、中心六边徽章、三角碎片与发光短线，中文“胜利/完胜”保留，完胜光效更强；去掉原竖向菱形与青粉错位字光。
- 两翼从左右拼合（.42秒）、中心徽章点亮、标题入场、一道有限高光横扫（.6秒）与既有有限烟花配合。均仅入场一次，暂停冻结，少动效禁用拼合/扫光/烟花。更新stage-result.css，纯SVG/CSS无新增依赖。
- 移除继续按钮，改无底板文字“点击屏幕任意位置继续”；最终关提示“点击屏幕任意位置完成通关”。保留约1.08秒统计入场后接受点击与手动等待。window capture click统一处理游戏区及宽屏外空白，吞掉本次事件避免穿透新商店；暂停不继续、未就绪不跳过。结算层保留可聚焦键盘Enter/空格支持。
- npm run check、test-settlement、test-timed-floors、test-campaign八路线通过。preview-stage-result真实Edge/WebGL四尺寸、无button断言、屏幕上下角与宽屏外侧点击、两种判定、统计/奖金/暂停/烟花结束/少动效通过；已查看390×844完胜与320×568胜利截图，无横向溢出。截图构造统计，非手机实机，仅本地未发布。


## 2026-10-25 本地：手动继续、胜利/完胜与入场烟花

- 按用户最新要求取消结算自动跳转；保留快速依次计数，约1.08秒完成后“继续”按钮启用，必须点击才进入商店，最终BOSS按钮为“完成通关”。暂停禁止继续、重复点击幂等、重开取消旧结算。
- 主标题改为中文霓虹“胜利”或金色“完胜”，对应VICTORY/PERFECT VICTORY副题。完胜要求定时关卡剩余时间>0、整批待入场队列已清、所有实际登场敌人均被击杀、无存活敌人/导弹；时间到自动清场、自毁/逃走、截止入场时被丢弃的队列、无敌人/无时限不误算完胜。队列截止新增unspawnedExpired记录，判定快照在结算事件前保存。
- 入场使用游戏时钟驱动有限SVG烟花：胜利3簇青粉，完胜5簇金色，每簇18条火星、爆闪环、向外散开并下落淡出，1.65秒后清理且不循环；随暂停冻结，少动效隐藏。不用计时器、不改玩法随机数。
- npm run check、test-settlement（增加完胜/普通/未入场/过时队列/手动等待/提前与暂停点击/去重/烟花产生与结束）、test-timed-floors、test-campaign八条随机路线通过。preview-stage-result真实Edge/WebGL四尺寸、两种标题、真实按钮点击、入场粒子/清理、暂停与少动效通过；已查看390×844完胜烟花、320×568胜利截图，无文字溢出。截图构造统计场景，非手机实机；仅本地未发布。


## 2026-10-25 本地：每关霓虹胜利结算与快速统计动效

- 按用户参考图，把原“结束”改为 VICTORY 霓虹艺术字、胜利层号、抽象菱形/双翼/网格装饰，场景色调使用青粉、深渊紫粉或轨道冰蓝。新增 stage-result.css，纯 HTML/CSS/内联 SVG，无新依赖。
- 标题先出现，0.24秒开始击杀比例、0.62秒开始金币，约1.08秒全部到位，1.65秒自动进入商店。装备/酒水原结算事件保留在胜利卡之前，不再因有事件而跳过胜利卡；最终BOSS同样先展示统计再进入原通关页。暂停冻结游戏时钟和动画，少动效模式数字直接到终值。
- stageStats 每关 startFloorTracking 清零，实际登场单位去重统计；shatter记录玩家/设施击杀，自毁触碰、逃走、倒计时清场不计击杀，飞弹/陷阱不参与，BOSS各部件合为1个，击败时计1。gainCash记录本关总收入（含设施和结算奖金），不受消费/前层余额影响；失败入场回滚移除预记人数。
- npm run check、test-settlement（补充统计/重复击杀/自毁/超时/进场顺序/暂停/收入/跨关清零）、test-timed-floors、test-game-feedback、test-electric-tiles通过；test-campaign八条随机路线、最终结算/通关/重开/音乐通过。
- preview-stage-result真实Edge/WebGL覆盖390×844、320×568、390×680、1280×900、依次计数/终值/奖金/暂停/商店/少动效，页面及GL无错误；已查看390×844与320×568截图。截图 tests/stage-result-*.png 为构造13/20击杀、$48的结算场景，非手机实机。仅本地，未发布，原页刷新加载。


## 2026-10-25 本地：星星放大1.7倍并改霓虹发光

- 按用户参考图，将MapIcons.stars五角星半径5→8.5、星间距10→17，精确放大1.7倍；去掉黑色描边，改浅金白细边、亮金色内芯与两层暖金色drop-shadow光晕。合成提示上移4px留间距。
- 保留核心格上方的固定屏幕尺寸与仅摆放界面显示规则，战斗隐藏；未改等级或属性。npm run check、preview-building-stars（三等级、三尺寸、战斗隐藏、无页面/GL错误）通过，已查看390×844截图。仅本地未发布。


## 2026-10-25 本地：星级改为仅摆放界面的屏幕标记

- 用户进一步指定屏幕级星星挂在建筑核心格子上方，战斗中不显示。移除MapIcons.groundStars及战斗绘制入口；改由ElectricEditor的SVG覆盖层绘制固定屏幕尺寸1/2/3星，以E.coreCell的地面投影向上22px定位，不随地图缩小。可合成提示置于星星上方，保留背包缩略图星级。
- 星级随移动、合成、视口变化更新，覆盖层只在编辑/准备界面显示，开始测试/开战后随其隐藏；不改建筑等级和属性。
- npm run check及更新的preview-building-stars真实Edge/WebGL通过，覆盖三等级/三尺寸、屏幕星标和战斗无可见星标；已查看390×844截图。仅本地未发布。


## 2026-10-25 本地：建筑图标星级

- 用户要求用星星标注地块等级。所有ElectricTiles建筑核心图标下方加入1/2/3颗金色五角星，背包缩略图读取item.level同步显示；场上绘制走MapIcons.groundStars，编辑/准备/战斗均显示，合成和恢复等级直接驱动颗数，不改属性。
- 准备界面保留“可合成”提示，移除原重复的数字等级浮牌，DOM等级元数据保留供回归检查。星星不拦截拾取/拖动，沿用地面深度测试及RoomReady升降。
- npm run check、test-tile-feedback、test-electric-tiles、preview-building-merge通过。新增preview-building-stars真实Edge/WebGL验证地图1/2/3级、3级卡片三颗星、编辑/运行均绘制、390×844/390×680/1280×900及页面/GL无错误；已查看building-stars-390x844.png，非手机实机。仅本地未发布，原游戏页刷新加载。


## 2026-10-25 本地：按用户明确语义分离设施作用范围与电塔攻击射程

- 用户纠正：格子的范围是加成/作用范围，电塔应有独立防御塔攻击范围。此前将effectMode/effectCells/range接进电塔选敌、以及上一轮对空custom回退radius的修补均被本轮取代。
- tower.defs.attackRange=420是独立战斗属性，fireTower首目标只按占地中心到敌人的距离420选最近目标，后续135连锁规则保留。完全不读取设施scopeMode/range/outputs；none/custom空/custom非空/adjacent/global及任意作用半径均不再限制或放大攻击范围，旧已放置快照同样生效。塔默认无加成作用区域，七格等设计占地仍按存档保留。
- 删除空custom范围回退圆形及设计台相关警告；设计台范围标签改“加成/作用范围”、圆形“作用半径”，电塔文案明确攻击射程独立420。游戏编辑器青色虚线仍按作用范围绘制，独立金色实线显示420攻击圈，说明和DOM标记区分两者；所有种类的radius作用范围均可显示圆形预览。
- 未再次修改用户浏览器保存的设施范围数据；上一轮曾把当前电塔改成radius420的存档仍是加成/作用区域配置，现无论用户如何绘制它均不影响电塔攻击。相关语义写入AGENTS.md。
- test-tower-range改为6种作用模式×距离0/30/100/419/420/421矩阵：验证作用配置完整保留、实际6伤害、420边界、旧快照和危险炮台排除。electric-tiles/game-feedback/clock-repair及npm run check通过。preview-tower-saved-range真实Edge/WebGL保留七格custom空区域、实际近身命中、设计台无误报及独立射程文案通过；preview-designer-geometry跨页导入/形状/落点/加成联动/持久化通过，作用半径80时距离100仍被攻击，验证两套范围独立。未宣称全量npm test或手机实机验收，仅本地未发布。


## 2026-10-25 本地：按用户真实设计存档修复电塔完全不攻击

- 用户再次反馈电塔贴身也不打。本轮通过IAB打开同源设计台，直接读取当前配置：tower名称电塔、七格占地[[0,0],[1,0],[0,-1],[-1,0],[-1,1],[0,1],[1,-1]]、effectMode=custom、effectCells=[]、range=420、enabledInGame=true。根因是此前接通设计范围后，fireTower在custom模式要求首目标所在格属于outputs；空列表过滤掉所有敌人，range=420不会参与custom选敌。上轮仅默认/缺字段配置测试没有覆盖用户这份存档，冷却修复未解决此根因。
- 已在用户实际设计台将影响方式切回radius，保留七格占地及所有其他设施设计；刷新确认radius/420/7持久化。保存截图tests/tower-user-config-fixed.png。无需供电才能攻击，原逻辑自动4秒冷却，电池仅加速。
- ElectricTiles.profile把tower空/非法自定义目标列表兼容为圆形射程；towerScope统一处理已有场上空custom快照与旧无scopeMode快照，fireTower与ElectricEditor范围预览共用。非空custom、显式none及radius=0保留原语义。设计台不强改用户正在绘制的自定义范围，空范围时明确警告游戏回退圆形射程，替换此前误导的“配置有效”。
- 新增test-tower-range先复现原实现失败再修复通过：真实七格配置、贴身/占地内、419/420/421边界、真实6伤害、已放置旧快照、非空custom/none/0及危险炮台排除；已加入tests/run.cjs。npm run check、electric-tiles、clock-repair、game-feedback及新专项通过。
- preview-tower-saved-range真实Edge/WebGL使用同一七格custom空列表存档验证30距离敌人100→94、radius420、网格有限/GL无错误；并验证设计台空范围警告、UI切换圆形、刷新后420/7保留。未沿用上轮仅默认配置的浏览器测试，未宣称手机实机或全量npm test通过。仅本地未发布；已打开的游戏页需刷新加载新代码，新局使用修正后的设计配置。





## 2026-10-25 本地：属性描述下方恢复升级进度槽

- 用户要求保留升级进度槽，恢复到attribute-copy描述之后，按等级上限显示分段并随草稿加减点更新，补充progressbar等级语义。图标、名称＋当前数值及右侧控件保持。进度槽底部去掉多余外边距。
- npm run check通过；浏览器验证沿用preview-talents四尺寸与实际加减保存流程。仅本地未发布。


## 2026-10-25 本地：属性槽图标与左侧信息对齐

- 按用户排版反馈，仅调整属性行左半部：13种内联SVG属性图标固定左上角，图标右侧为名称＋当前累计加成，描述在其下完整换行，等级缩至图标下方。移除左侧分段条，右侧当前/下级预览、价格与加减控件结构和样式保持。
- npm run check、preview-talents真实Edge/WebGL四尺寸320×568、390×680/844、1280×900通过，包含加减/保存/放弃/刷新/滚动、晶片与六角回归，零页面或GL错误。已查看talents-menu-390x844.png及talents-menu-320x568.png，图标与文字无重叠/横向溢出。仅本地，未发布，非手机实机。


## 2026-10-25 本地：13项通用属性升级与青蓝终端界面

- 按确认后的属性修改表实装13项：伤害加成、攻速、暴击率、暴击伤害倍率、散布角减少、弹丸速度、爆炸范围、击退强度、后坐位移减少、减速免疫、移动速度、拾取范围、受击无敌时间。名称、每级收益、等级上限和独立递增费用沿用确认值。减速免疫仍为武器减速按比例减免，每级5%、满级25%，不是完全免疫。
- 属性页改为连续分组列表，当前/下级加成、等级、分段进度、费用与加减按钮同排；深蓝网格底、青蓝双线框、浅绿等级段参考用户两张HUD图。固定余额/保存区，窄屏独立列表滚动，重绘保留滚动和键盘焦点，描述完整换行；菜单入口同步余额。保存、免费重置、未保存二次退出、出发前分配/本局快照保持。
- 伤害与暴击经统一命中入口应用，覆盖玩家主武器、无人机、坐骑/机甲攻击及玩家派生伤害；爆炸半径和已有击退经幂等prepare应用，派生爆炸不重复强化。实体枪弹散布/速度覆盖各来源武器工厂及小飞机枪弹。攻速共享到主武器、伤害无人机和坐骑已有攻击周期，治疗/补盾/拦弹及生产周期保持。地块/炮塔伤害不纳入玩家装备加成；危险炮台仍不可攻击。
- 激光宽度、电弧距离和独立无人机伤害移除；生命、开局护盾、概率穿透留待后续技能树，本轮不提供节点。上述旧项目和已退役铲子投资按paid实际金额退还一次，保留其余13项等级、实际费用及余额。本地存档key保持hell-elevator-talents-v1。
- npm run check；test-talents（13项/费用退款/全部旧项一次迁移/快照/各来源真实扣血/爆炸范围及派生仅一次/攻击与治疗周期/晶片全生命周期）、weapon-vfx、test-167、category-boxes、economic-drinks、clock-repair、electric-tiles、hex-campaign通过。preview-talents真实Edge/WebGL覆盖320×568、390×680/844、1280×900，加减/放弃/保存/刷新、滚动保留、正式入口、掉落/拾取/死亡、六角与测试场隔离，零页面/GL错误。已查看talents-menu-390x844.png、talents-menu-320x568.png、talents-body-390x844.png；非手机实机，未发布，未宣称全量npm test通过。


## 2026-10-25 本地：准备阶段全建筑拖动与合成测试

- 按用户最后要求，仅接通所有已实现建筑的同类同级合成与等级记录，最高3级；不新增升级属性，电塔既有伤害升级保留。地板扩建、路障和拆除仍走地形规则，不参与设施合成。
- 正式每关准备界面放开所有 ElectricTiles 建筑拖动，移动/场上合成不消耗三选一；三选一的新建筑放置/合成仍沿用自动开战。没有空位但存在同级合成目标的建筑也能进入选择池。
- 建筑上方显示等级，有场上或本关候选同类同级伙伴时显示“可合成”；合成后即时重算，三级不再提示。标签不拦截拖动。背包/测试目录与测试布局保存恢复保留所有建筑等级。
- npm run check、test-electric-tiles（新增全种类合成/异级/自身/满级/跨关/移动/恢复）、test-clock-repair、test-farm-shapes通过；新增preview-building-merge真实Edge/WebGL通过，覆盖电池/钟表店实际拖动合成、提示更新、选项保留、原电塔升级及取消、三尺寸；已查看building-merge-available.png，非手机实机验收。仅本地未发布。
- 额外长流程preview-electric-campaign未通过：先修正脚本仅按空位挑落点、不处理合成目标和电塔核心拖动参照的旧假设，重跑在后续楼层verifyChoices等待准备界面超时；未宣称全量通过。旧preview-tower-merge的测试场景背包收回断言也失败（TileLab激活时收回只移除、不入背包），本轮新专项已覆盖其正式准备阶段移动/升级/取消。


## 2026-10-25 本地：首关混合敌群、20秒起递增、收益与设施反馈

- 用户六点反馈及补充：第一关需接近型+远程，前期约20秒后续更长，移动齿轮范围疑似异常，来钱过快，电塔似乎不攻击，紫/金卡移除烟雾保留Glitter、改暗紫/暗金背景。
- 空中自毁无人机从B01解锁；默认所有普通定时层每批3接近+2远程，地面怪仍关闭。普通房时长 min(60,20+2*(floor-1))，B01/02/03为20/22/24秒；保留清完有限敌群提前结束、酒水时长增益与特殊房规则。普通远程击杀$4→$2，接近怪仍无收益；矿机4秒产$5→$3，BOSS奖励不动。
- 移动飞轮每最多4像素采样完整反弹路径，按玩家本帧相对位移扫掠碰撞，避免只查终点漏判；地形改变导致重定位不沿传送路径造成伤害。半径25与现有模型齿尖相符，未任意扩大伤害圈。test-game-feedback覆盖穿过/范围外/500帧边界。
- 电塔冷却结束无目标时保持就绪，目标进入范围下一更新发射，不再空耗4秒CD；旧设计缺失effectMode/range时回退电塔半径420，显式自定义/none/0等配置仍保留。矿机原默认文案精确匹配旧$5时同步新金额，自定义描述保留。
- shop-effects删去烟雾shader与噪声，CSS fallback禁用紫/金烟雾伪元素；暗紫#21152f、暗金#302411，固定Voronoi法线/GGX Glitter与字光保留。preview-shop-sugar真实Edge三尺寸/动态Glitter/无光不动/无烟雾/少动效/GPU恢复/购买清理通过；已查看shop-sugar-390x844.png。
- npm run check与相关enemy-waves/timed-floors/room-pressure/electric-tiles/game-feedback/economic-drinks/clock-repair/added-enemies/enemy-flight/hex-city回归通过。压力测试九层×两套装备×五种子：初始手枪B01均20秒。preview-game-feedback真实Edge/WebGL验证首批3+2、20秒、电塔空场蓄好后即时锁定并真实造成6伤害、网格有限且GL无错误；已查看game-feedback-tower-390x844.png。该浏览器战斗测试跳过准备UI，不宣称完成手机实机体验验收。
- 全量npm test在既有test-56「finite total despite kills」失败：旧测试要求独立地面追逐流，但此前GROUND_ENEMIES已关闭；将本轮时长/敌池/解锁/击杀收益临时还原后同样失败。未修改无关旧断言，未宣称全量通过。旧preview-electric-tower在隐藏的测试工具summary超时；由新真实战斗回归验证当前设施逻辑。仅本地未发布。


## 2026-10-24 本地：前期弹速与04层弹幕难度过渡

- 用户反馈前三层弹速慢、要求+25%，04层开花散射过早且过密。spitter基础弹速85→106.25（该怪后续楼层也沿用），不改怪物移动速度；空中池01—03仅spitter，04—07按3个spitter+2个eye循环，08起按spitter/eye/skull/eye/spitter循环，skull八向弹每批最多1只；moth三向扇射从06推迟到10层起的偶数层每房1只。
- 旧twinGun属于已暂停的地面怪，继续关闭；将其左右枪口间隔0.22秒的瞄准双发复用到空中eye，周期2.1秒，复用现有飞机模型/飞行姿态与待发更新，暂停/死亡不补发。显式启用地面怪的隔离模式保留eye原单发及旧怪池。
- 默认空中模式远程同屏5只上限由前三层延伸至06层，保持整批入场/清场加速/有限敌群规则；蜂巢酒水仍按既有比例扩容。07层为酒车，08层恢复后续密度；未改血量或场地陷阱。
- npm run check、test-enemy-waves（含01—10出场顺序/弹速/04—06上限/双发间隔与暂停死亡回归）、test-added-enemies、test-enemy-flight通过。test-room-pressure扩充04/05/06/08楼层覆盖，使用无敌玩家验证推进/输出与人口上限，不作为真人可躲避性验收。仅本地未发布。


## 2026-10-24 本地：设计台形状与范围实际同步游戏

- 用户反馈修改地块后游戏仍显示原形状。ElectricTiles.profile从只接clockshop/repair_turret改为读取全部已实现设施及四种扩建；扩建通过expansionIds映射设计台ID。验证连通性/轴坐标后应用占地、范围模式/格子/半径、名称和玩家文案；错误数据回退默认，不实现自定义种类玩法。
- ElectricEditor.defs改为动态profile getter，背包图、格数、名称/描述、落点预览、frontier/canExpand、真实expand与正式三选一均读取同一配置。扩建开关同步选择池/测试目录/直接扩建判定，旧无扩建配置的designCatalogVersion<2草稿保持旧扩建默认开启。storage事件取消过时拖动并重绘，修复背包最后一项被禁用时空字符串缓存导致旧卡片残留的问题。
- 全部既有设施新放置/移动读取设计占地与范围，供电/回响/灌溉/脉冲联动使用配置outputs；电塔实际首目标射程及预览使用配置范围，支持相邻/自定义/全图/无范围，后续连锁仍原135。数值/产物/拾取等机制未开放编辑。已放置设施保留几何快照，重新移动时应用；已经扩出的地板不追溯重铺。
- 设计台清除“形状待接入”提示并更新接入说明、扩建开发说明旧文案迁移。用户配置持续编辑中，未覆盖：本轮实际核对地块7格、地块2从7增到14格、地块3/4各8格；原游戏IAB tab1已刷新并选中地形，四卡显示7/14/8/8且名称同步。tests/designer-geometry-user-game.png已查看，保留设计台和游戏页。
- npm run check；test-electric-tiles/test-clock-repair/test-farm-shapes/test-tile-feedback通过。新增preview-designer-geometry真实Edge验证跨页导入修改、四格缩略图/真实鼠标拖放落地、扩建开关/合法落点、配置电池双格+自定义作用目标、电塔单格80射程实际100不打79打、刷新持久化；preview-facility-designer和preview-facility-integration通过。仅本地未发布，非手机实机验收。


## 2026-10-24 本地：补齐四种实际扩建地板

- 用户指出扩建有多类型，确认ElectricEditor原有floor双格、floorLine三格直线、floorBend三格弯折、floorTriangle三格三角。将原定义原样集中至ElectricTiles.floorDefs，游戏编辑器与设计台共享数据，不改实际扩地行为。
- 设计台新增floor_expansion_double/line/bend/triangle四个地形条目，独立形状/玩家描述/开发说明。designCatalogVersion=2一次性迁移；未编辑的旧通用floor_expansion自动替换，已编辑的旧条目保留。后续删除不重新添加。仍明确设计修改与开关尚未应用到游戏扩建逻辑。
- 原IAB刷新显示21条、地形5条，选中三格直线；四份design/floor-expansion-*.json备份与tests/facility-designer-floor-types.png已保存并查看，原有用户修改保留。
- npm run check、test-electric-tiles、preview-facility-designer真实Edge（三尺寸/18默认条目/四扩建删除后持久化）通过。额外旧preview-floor-shapes在line66库存扣减断言失败（56实际、55预期，测试按消耗库存断言，当前测试场景无限取用）；未修改此无关断言，未宣称全部通过。仅本地未发布。


## 2026-10-24 本地：扩建地板设计条目与修理跨关进度

- 用户确认将游戏“扩建地板”加入设计台，新增floor_expansion地形条目，基础3格形状、玩家/开发描述，可复用绘制/范围/旋转/镜像/撤销/导入导出。扩建格数专用标签和说明明确：形状与开关目前为设计稿，游戏仍按既有随机扩地逻辑；没有将其伪装成可放置的ElectricTiles建筑，也未修改实际扩地规则。
- 老草稿通过designCatalogVersion=1一次性补入，保留全部原有条目/形状；删除后刷新不会重新添加。当前用户库18种，已刷新原IAB并选中扩建地板；design/floor-expansion.json备份与tests/facility-designer-expansion.png截图已保存。
- startFloorTracking调用ElectricTiles.startRoom({preserveRepair:true})，有效修理目标及剩余时间跨关保留；无效目标仍清零，暂停/商店冻结，钟表buff与产品照常清空。默认startRoom()保留显式测试重置语义。设计台旧开发说明“换层重新开始施工”同步迁移为继承规则，备份已更新。
- npm run check、test-clock-repair（新增实际楼层入口10+15秒累计、商店冻结、显式重置及无效目标）、test-electric-tiles、真实Edge preview-facility-designer通过。设计台回归同步15种默认条目并检查扩建及删除后刷新持久化。仅本地未发布。


## 2026-10-24 本地：暂停明显地面普通敌人

- 用户要求先关掉包边铁球等明显地面怪物。GROUND_ENEMIES.enabled=false统一过滤正式敌人池：crawler/bomber/ironball/ricochet/missile/laser/twinGun/lobber/stormCaller/builder/goldSpider；保留实现与隔离测试，不改造模型。正式普通敌人仅spitter/eye/skull/moth/suicideDrone，自毁无人机仍按第9层解锁，之前无空中近战时由远程补足波次。
- 原每4层工程车房改为普通定时空中敌人房；酒车/BOSS优先级不变，旧独立追逐怪及蜂巢追逐入口也停止生成地面怪。每批仍5只，前三层远程上限从3适配为5，避免全远程批次永远无法入场；运输继续关闭。BOSS、玩家无人机、场地炮台规则未改。
- test-enemy-waves新增默认配置完整33层分支/全空中名单/数量/波次/倒计时结束/自毁解锁/旧追逐入口检查，再显式开启地面配置验证保留的旧波次逻辑；builder和added-enemies回归显式开启隔离旧怪覆盖。定时房与经济酒水测试改为当前空中构成。
- npm run check、test-enemy-waves、test-enemy-flight、test-builder、test-enemy-transports、test-hex-campaign（八路线战役及商店/武器/新增敌人）、test-timed-floors、test-economic-drinks通过。仅本地，未发布；本轮未做视觉验收。
- test-room-pressure同步空中构成与早期上限后，5楼层×两套装备×5种子全部通过。基础手枪后期可能只造成伤害未击杀（自毁机接触退场），因此压力用例记录实际命中伤害并要求强化装备仍有击杀；未改变武器或敌人血量。

## 2026-10-24 本地：飞行敌人运动倾角与惯性回正

- eye/skull/spitter/moth/suicideDrone 加入实际位移驱动的俯仰/侧倾：前进压头、后退抬头、横移与转向侧倾，加减速附加倾角；航向取最短角平滑跟踪玩家，临界阻尼平滑回正，俯仰限约19.5度、侧倾限约25.2度。暂停与慢动作使用模拟时间，传送重置姿态，地面类型不变；不改移动路径、速度、攻击与命中坐标。
- 以机身高度24为旋转中心更新residentMesh实例矩阵，原共享网格/GPU缓存保留；四款Blender飞机机身/透明罩/喷口灯共用完整三维变换，旧哨机灯光同步支持倾斜。运输无人机仍默认关闭。
- npm run check；新增test-enemy-flight（已加入npm test）、test-enemy-transports、test-enemy-waves、test-gpu-residency通过。preview-enemy-vehicles及新增preview-enemy-flight真实Edge/WebGL通过，验证四机实际战斗倾斜、透明罩对齐、暂停、显存复用、无页面或GL错误；已查看tests/enemy-flight-moving.png。非手机实机验收。
- npm test运行到旧test-59的“all five slots available”商店断言失败；禁用本轮飞行更新调用后同样失败，未修改无关旧测试。此前各相关战役/装备/设施/敌人回归通过，未宣称全量通过。仅本地，未发布。


## 2026-10-24 本地：暂时关闭敌人运输无人机与现役敌人盘点

- 用户希望核心聚焦四面围攻的弹幕飞机、直接撞击玩家的飞机。新增 ENEMY_TRANSPORTS.enabled=false，普通怪/工程车恢复既有直接入场，金蛛测试也不再运输；运输模型和逻辑保留以便后续调整。没有将所有旧地面造型改成飞机，也没有删除工程车、落雷等现役机制。
- 当前普通敌人15种：远程9种 spitter/eye/skull/moth/missile/laser/twinGun/lobber/stormCaller，碰撞5种 crawler/bomber/ironball/suicideDrone/ricochet，施工1种 builder。前3层普通房仅crawler+spitter；后续按buildNormalRoster解锁。builder另有每4层特殊房（酒车/BOSS优先）。
- 正式BOSS六种：蛇/噬菌体、枪手机械蜘蛛/赤红裁决者、大无人机/飞碟，分别B11/B22/B33二选一。大无人机BOSS及玩家装备无人机不属于本次关闭范围。机械金蛛黄金猎场当前isGreedFloor=false，仅测试；fishSchool与原人形机甲有测试入口，旧boss类型保留但正式战役不生成。炮台属于不可攻击陷阱，导弹rocket属于可击落弹体，不计普通怪种类。
- npm run check、test-enemy-transports（新增默认关闭/十类直接入场/金蛛无运输断言，保留开启后的旧运输回归）、test-enemy-waves、test-builder、test-hex-campaign通过；后者连带八路线战役/装备/商店/新增敌人回归通过。仅本地，未发布，本轮未做视觉验收。

## 2026-10-24 本地：钟表店与25秒修理炮塔实际接入游戏

- 用户确认钟表店每10秒产1钟表，拾取攻速/移速/全图补给生产各+10%，本层可叠加、换层清零；随后明确修理炮塔拆除周期从5秒改为25秒，墙体当前/上限+2、同类不叠加保持。
- ElectricTiles新增clockshop与repair_turret，进入正式三选一及测试目录；钟表未拾取停产、整占地拾取，暂停/商店冻结，换层清产品与buff。全图加速覆盖矿机/农田/脉冲/钟表及旧医盾现金补给，不加速武器/供电/施工。复用共享residentMesh新钟表店、浮动钟表、修理炮塔模型与上下文恢复，新增SVG图标并给出明确64像素尺寸，避免WebGL texImage2D INVALID_VALUE。
- 修理对范围内地刺/锯/轨道锯/飞轮/永久危险炮台持续25秒后按场地规则移除；永久炮台仍不可攻击、无血条，不处理临时生存炮台。目标失效/离场/移动重计时，多塔目标预约避免重复。绿色双层光束、目标六角边、地面进度条、环绕上升光点沿强建机器人表现。
- 墙体增益通过repairWallBonus和coverMaximum(t)贯通受伤/显示/每关重建；离开或移除最后来源扣回加成并保留伤害，不复活已坏墙。修理占地/相邻/自定义/圆形/全图范围，钟表占地读取设计台配置。
- 设计台旧custom_1钟表店/custom_3修理炮塔按名称迁移为canonical clockshop/repair_turret且开启，形状/文案保留，其余设计不动；用户当前钟表店7格、修理炮塔1格，已用于真实预览并更新design两份JSON。开发说明已更新为已实现及25秒规则，其他新建筑仍为设计稿。
- npm run check；test-clock-repair（已加入npm test）、electric-tiles/farm-shapes/tile-feedback/gpu-residency/builder通过；preview-facility-designer/integration/tile-lab通过；新增preview-clock-repair真实Edge验证旧草稿迁移、真实拖放、10秒生产拾取/三项实际属性、25秒精确施工、墙体、三尺寸、常驻数据复用与GPU重建、正式三选一投放及跨页关闭开关。相关截图clock-repair-working-*已查看。旧test-cover-tile单测仍在floor7酒车关“new room rebuilds”旧断言失败（该测试不加载新设施模块）；未宣称全量回归通过。
- 新增专用本地预览 ?electriclab=1&facilitypreview=clockrepair，19格开局平台预放两建筑、地刺与墙体，不覆盖已保存测试布局；点击开始测试运行。已在新IAB页打开并保留，设计台原页保留，tests/clock-repair-user-preview.png。server.mjs增加SVG MIME并重启4173预览服务。仅本地未发布，非手机实机验收。

## 2026-10-24 本地：设计台左侧建筑列表独立滚动

- 桌面/平板左侧设施库限制为视口高度，分类/新增按钮/底部说明固定在列表外；建筑列表独立竖向滚动，显示细滚动条，侧栏随页面粘附。重绘保留scrollTop，避免选择/编辑时跳回开头。手机保留横向滑动列表。
- 60种建筑真实Edge检查通过：两种桌面/平板尺寸列表高度不超视口、滚轮可滚动且重绘保留位置、手机无页面横向溢出；npm run check通过。已刷新当前设计台，17种设计保留，截图tests/facility-designer-library-scroll.png。仅本地未发布。

## 2026-10-24 本地：设计台接入游戏开关

- 每种建筑新增enabledInGame布尔字段与右侧Toggle，支持本地保存、撤销重做及JSON导入导出/类型验证；旧配置的12种已实现设施默认开启、自定义设计默认关闭，新建/复制种类默认关闭。已实现种类显示已接入，自定义开启显示待实现并明确不会凭开关生成玩法；占地/范围设计修改仍未自动接入。
- ElectricTiles.enabled读取同源浏览器设计草稿开关（无草稿保留默认全开；草稿已删除的设施视为关闭）。正式三选一、测试目录/背包、直接放置与合成使用同一过滤。storage事件跨页同步清除已关闭的场上设施和背包；游戏页需加载本轮代码，旧标签先刷新。关闭范围仅限当前浏览器同源本地游戏，未发布全局配置。
- 新增preview-facility-integration真实Edge验证开关刷新保存/跨页移除/拒绝放置/目录隐藏/恢复开启/40次正式准备选择均不含禁用设施/撤销重做/自定义待实现/JSON往返及非法类型/手机无溢出；通过。preview-facility-designer、test-electric-tiles/farm-shapes/tile-feedback及npm run check通过。
- 已刷新用户设计台、保留17种及全部既有设计，选中分解激光展示关闭状态，截图tests/facility-designer-toggle-open.png已查看。未擅自更改任何现有开关；迁移默认值如上。仅本地未发布。

## 2026-10-24 本地：设计台新增防空领域与分解激光

- 当前IAB设计台新增防空领域(custom_4)，归运转：降低领域内子弹飞行速度，以子弹位置判定范围。减速幅度/范围/阵营筛选/特殊弹体/叠加与离场恢复等待定，单格及相邻一圈仅编辑预览。自动保存并备份design/air-defense-field.json，截图tests/facility-designer-air-defense-field.png。
- 新增分解激光(custom_5)，归防御塔：激光击杀敌人后获得正常收益之外的额外金钱；开发说明记录伤害归属、致死一次结算避免重复。伤害/射速/奖励数额等待定。单格、圆形420仅为编辑预览。已保存并选中，备份design/disintegration-laser.json，截图tests/facility-designer-disintegration-laser.png。两者均未接入游戏。
- 修复射程输入仅依赖change导致部分输入途径未立即保存的问题，改为input更新；新增即时数值保存断言，npm run check、preview-facility-designer通过。用户原设计全部保留。仅本地。

## 2026-10-24 本地：修理效果参考强建机器人，改绿色

- 阅读game.js的drawBuilderWork，确认原施工特效为红色双层光束、目标六角发光描边、贴地进度条、环绕上升光点和接触光晕。按用户要求将相同表现结构写入当前设计台修理炮塔(custom_3)开发说明，修理主光/描边/进度条/粒子绿色、光芯浅绿；建议主色#54e58b、光芯#d4ffe3。
- 只参考视觉结构，不直接套用强建机器人施工时长/改造机制；用户原描述、占地及其他设计保留。已自动保存用户草稿并更新design/repair-turret.json，截图tests/facility-designer-repair-green.png。本轮只更新设计说明，未实现游戏特效。

## 2026-10-24 本地：设计台新增修理炮塔

- 在用户当前IAB设计台新增修理炮塔(custom_3)，归地形，玩家描述“缓慢拆除范围内的负面地形，并提高墙体的生命值。”双描述已保存，开发说明记录随时间拆除与墙体生命强化；处理周期/候选/数量、生命加成、作用范围及叠加等待定。
- 单格占地及外沿一圈仅作编辑预览，未接入游戏运行。用户其他设计与钟表店/雷达保留。已选中修理炮塔并核对界面，备份design/repair-turret.json，截图tests/facility-designer-repair-turret.png。本轮仅填设计数据，无源码修改。

## 2026-10-24 本地：设计台新增雷达

- 通过用户当前IAB设计台新增雷达(custom_2)，归运转，玩家描述“增加防御塔的射程，并提高玩家的暴击率。”开发说明分别记录两项加成，幅度、影响塔范围、玩家站位条件、叠加与拆除规则待定。
- 单格占地、外沿相邻一圈仅为可修改的编辑预览，未认定实际生效范围；未接入游戏运行。已自动保存用户浏览器并选中雷达，其他设计保留。备份design/radar.json为当前配置参考，截图tests/facility-designer-radar.png已检查。本轮仅填写设计数据，无源码修改。

## 2026-10-24 本地：设计台钟表店与全图范围

- 按用户要求，通过当前IAB设计台新增自定义“钟表店”（custom_1），归补给；玩家描述为产出钟表，拾取后提升攻速/移速/全图设施生产速度。开发说明记录拾取同时触发和不受距离限制；占地/生产周期/提升幅度/持续时间/重复叠加与跨层规则待定。单格仅为设计起点，未接入游戏运行。原用户全部设计保留。
- 设计台新增global全图影响方式、全画布范围预览、全图计数提示与JSON校验/导出/导入支持。全图语义独立于画布格数。钟表店现已自动保存到用户浏览器；另保存设计参考design/clock-shop.json（当前配置对象，不是完整库导入包）。
- npm run check、preview-facility-designer通过，新增全图预览/刷新/JSON往返回归。已在用户页选中钟表店并查看双描述与全图范围，截图tests/facility-designer-clock-shop.png。本地未发布。

## 2026-10-24 本地：设施设计台四类建筑

- 新增category字段：defense防御塔、supply补给、operation运转、terrain地形。默认塔归防御塔，矿机/四农田/脉冲归补给，其余供电/回响/灌溉等归运转。地形指改变场地/处理负面格子的建筑，可用双描述定义每层消除负面格等效果；未添加虚构默认建筑，也未接入游戏效果。
- 左侧分类筛选及实时数量，右侧分类选择，新增种类对话框选择分类并跟随当前筛选。空地形分类显示引导；旧草稿缺分类自动补齐，原形状/描述保留。分类支持撤销、本地保存、JSON导入导出并校验枚举。
- npm run check、preview-facility-designer真实Edge通过；新增分类筛选/空类提示、从地形分类创建净化站、修改分类与撤销、刷新/导入导出保留和无效分类保护。已刷新用户当前页，原设计保留，截图tests/facility-designer-categories-open.png。仅本地未发布。

## 2026-10-24 本地：机枪炮塔改为前向折面盾牌

- 按用户纠正，删除包围机匣的蓝色纵向侧板及后方长立柱，改成枪口前方的左右薄护盾：宽正面、向后折的外翼、银色上缘、酒红下缘及小银色铭牌，中央开放U形缺口供炮管与上方活塞穿出。后方机匣外露。工作室相机改为与参考相同的枪口朝左构图。
- Blender脚本/源文件/工作室图与游戏三组常驻网格同步更新，现1040三角形；统一重算外法线。充能后七连射机制保持。
- npm run check、test-machine-turret通过；preview-machine-turret真实Edge/WebGL验证添加/运行、七发、三尺寸、上下文恢复与零错误。已查看Blender新盾牌渲染及游戏截图。本地未发布。


## 2026-10-24 本地：参考蓝色机枪炮台 Blender 模型与七连射

- tools/build-machine-turret.py 在 Blender 中制作蓝色双护板、银灰炮管/深色炮口、上方活塞、酒红结构、切面支座与四脚底座，1268 三角形。source-assets/machine-turret/machine-turret.blend 为标准 Z-up 可编辑源，内嵌参考图，工作室图 machine-turret-studio.png；已启动 Blender 打开源文件。
- dist/assets/machine-turret.js 导出 base/head/barrel 三个常驻网格，index 加载；游戏机枪危险源共用模型，炮身跟随瞄准、炮管逐发后坐及枪口闪光。保持无敌/不可自动瞄准/无血条、原六角边缘移动与激光炮台规则。
- 首轮充能2秒，之后每轮7次独立射击、间隔0.13秒；末发后再充能3.2秒，最后0.75秒预警，连射方向在首发锁定。发射点改为真实炮口。计时保留帧超时，避免低帧率漏弹；换层重置剩余弹数/间隔/后坐/闪光。
- npm run check、test-machine-turret/test-108/test-hex-special/test-gpu-residency通过。新增七发/下一轮/多帧率/大dt/暂停/重置/真实网格复用回归，纳入npm test。preview-machine-turret真实headless Edge/WebGL通过从地块试验场按钮添加/运行、恰好7弹、3组常驻网格、390×844/390×680/1280×900截图与上下文恢复，零页面/GL错误；已查看工作室图和390×844游戏截图。
- 全量 npm test通过本轮测试、设施/六角/完整八路线战役后，仍停在已记录的 test-59“all five slots available”旧商店断言；日志 tests/machine-turret-regression.log。仅本地未发布，非手机实机验收。


## 2026-10-24 本地：设计台双描述

- 右侧新增玩家描述(playerDescription)和开发说明(developerDescription)多行输入。内置设施原desc作为玩家描述默认值，开发说明留空；旧本地/JSON配置缺字段时补齐，不改已有占地、范围或种类集合。
- 两字段输入即自动保存，按一次编辑会话记录撤销，支持复制种类、JSON导入导出及当前配置复制。空白自定义种类双字段为空，恢复默认回到原玩家文案/空开发说明。导入校验长度和类型；适配描述后将导入文件上限调整4MB。
- npm run check、preview-facility-designer真实Edge通过，新增默认文案/空开发说明、输入保存/撤销重做/刷新、JSON字段与复制种类保留描述回归，三尺寸无溢出。已刷新用户当前页，确认其7格电塔与其他修改保留，截图tests/facility-designer-descriptions-open.png。仅本地未发布。

## 2026-10-24 本地：设计台增删格子种类

- 左侧新增格子种类，可从空白单格或复制当前配置创建；右侧可编辑名称、删除当前种类，内置与自定义均可删除，至少保留一种。新增/删除/重命名均纳入撤销重做与本地草稿。自定义恢复默认时回到单格无范围并保留名称。
- JSON升级version 2，兼容读取version 1，按导入种类集合完整恢复，避免已删除的内置种类被自动补回；允许自定义安全标识与名称，名称转义后显示。
- npm run check与preview-facility-designer真实Edge通过；回归新增空白/复制创建、重命名特殊字符、刷新保存、自定义与内置删除、撤销重做、导出/导入不复活删除种类、最后一种删除保护，保留原编辑与三尺寸检查。已刷新用户当前设计台并确认此前7格电塔设计保留，截图tests/facility-designer-kinds-open.png。仅本地未发布。

## 2026-10-24 本地：独立设施设计台网页

- 按用户最新要求，不进入游戏，新增 dist/facility-designer.html / .css / .js，地址 /facility-designer.html。独立页面只复用electric-tiles.js中的12种设施定义，不加载游戏引擎。
- 左侧设施库、中间127格轴坐标编辑画布、右侧参数。支持点选/连续绘制占地及范围、外沿相邻一圈/自定义/圆形射程/无范围、60度旋转/镜像、撤销重做、坐标显示、恢复单设施默认配置、自动本地草稿、JSON导入导出及复制。范围与占地分离，导出前验证非空/连通、唯一整数坐标和合法范围；导入失败保留当前设计。原西瓜锚点可在占地之外，设计台沿用锚点作为坐标基准。
- 配置仅为独立设计草稿，尚未接入游戏运行规则。未修改游戏内占地/范围算法。原地块试验场仍保留。
- npm run check通过；preview-facility-designer.cjs真实Edge验证12设施/不加载游戏、编辑占地与自动/自定义范围、旋转撤销重做、刷新恢复、最少一格及连通性、JSON下载导入/无效导入保护、1440/1024/390三尺寸无横向溢出和零页面错误；截图已查看。已导航用户IAB当前页至独立设计台，tests/facility-designer-open.png。仅本地未发布。

## 2026-10-24 本地：地块试验场改回游戏开局场地

- 按用户纠正，独立试验场默认使用 HexMap.initialFloor() 的19格空白开局地板，全部设施由玩家从无限目录手动拖放。移除URL tilepreset=all的自动满图展示；旧预览链接刷新也进入19格。143格与展示预设保留为手动工具。
- 更新preview-tile-lab，从旧tilepreset链接断言19格/零设施；真实Edge拖放、保存恢复、撤销和运行测试通过。已刷新用户现有IAB页，截图tests/tile-lab-initial-19.png确认19格空场。

## 2026-10-24 本地：独立地块试验场

- 新增 dist/tile-lab.js，?electriclab=1 进入143格空白六角平台；追加 &tilepreset=all 预摆13种现役设施。现有浮动“地块测试”按钮进入独立试验场。原三选一和旧指定格子工具保留。
- 分类无限目录、直接选择1至3级电塔、运行/编辑、143格/19格底板、全设施/电力/农田预设、重置测试、撤销、清空、浏览器本地保存/恢复、靶群、无敌、调生命及1/2/4倍速。危险源沿用原添加工具随机合法放置；未实现危险源指定落点、旧版地块拖放、复制按钮和简洁背景切换。
- 试验场使用正式生产/辅助/攻击逻辑；仅active时阻止追逐怪自动生成和自动结算，默认无怪无倒计时。reset离开时保存布局并恢复正式流程。编辑目录拖放不消耗卡片，正式三选一消耗行为保持。
- npm run check、test-electric-tiles/farm-shapes/tile-feedback通过。tests/preview-tile-lab.cjs 在真实headless Edge/WebGL验证143/19底板、全部13设施预设、同卡连续实际拖放、保存/刷新/恢复、撤销、18秒无波次运行、切回编辑、三尺寸和零页面/GL错误。截图tests/tile-lab-390x680.png、390x844、1280x900已检查。仅本地，非手机实机验收；已请求在Codex面板打开全部设施预览。

## 2026-10-23 本地：Bar改用生成的霓虹贴图

- 按用户要求通过内置imagegen生成透明手写连笔Bar霓虹PNG，保留原始alpha与柔和粉色光晕，保存到dist/assets/bar-neon.png。移除上一版几何灯管字，保留车顶底板/支架/前灯。
- Blender源改为有UV的发光透明贴图面片，图片已pack进night-bar-van.blend；工作室图及OBJ/MTL同步更新。游戏车身常驻网格现33637三角形，文字另用一张贴合原招牌倾角的RGBA四边形绘制；imageQuad沿用原sprite通道和正常alpha混合，贴图按图形上下文缓存并在恢复时重传。
- npm run check、test-drink-truck/gpu-residency、preview-drink-truck三尺寸真实WebGL通过；新增实际贴图加载/一张贴图面片/显卡恢复后新纹理断言。已查看工作室图和390×844游戏画面，文字方向与alpha正确。仅本地未发布。

## 2026-10-23 本地：车顶霓虹Bar招牌与发光前灯

- 在Blender酒车顶增加带黄铜支架、深色底板的Bar立体灯管招牌：B/a/r由独立可编辑圆管与浅色发光芯组成，后倾35度使俯视游戏镜头仍清晰可读。两只车头圆灯改用暖白自发光材质；游戏补充招牌小光晕、前灯及前方暖色光晕。
- Blender的Emission颜色/强度与游戏自发光法线标记一起导出，不依赖临时UI文字；更新night-bar-van.blend/OBJ/MTL、工作室渲染与dist/assets/drink-truck.js（36549三角形）。仍按顶部格子外14单位、离地10单位、正向右停靠。
- npm run check、test-drink-truck及preview-drink-truck三尺寸真实WebGL通过（含无UI遮挡/朝向/间距/悬浮/实际网格/暂停/GPU恢复），检查并更新法线断言允许专用自发光标记。已查看Blender工作室图与390×844游戏图，游戏中Bar和右前灯明确可见。仅本地未发布。

## 2026-10-23 本地：酒车在顶部格子外悬浮、正朝右

- 按用户要求，酒车停靠不再落在平台内：drinkTruckDock按当前真实地板的最上排格子计算中心与上边缘，车体距上边缘14世界单位，离地高度10单位悬浮；车头沿+X正朝右，飞入和停稳均yaw=0。
- 停靠点随扩地后的顶部变化，酒关相机偏移增加顶部17%安全区限制，避免顶部扩到边界后车模被HUD遮挡。保留原16种酒/三选一/无怪流程。
- npm run check、test-drink-truck、preview-drink-truck三尺寸真实WebGL通过，更新为车轮均在平台外、水平间距14/悬浮高度10/朝向0、完整车模不被面板遮挡的断言；已查看390×844选酒时的停靠截图。仅本地未发布。

## 2026-10-23 本地：参考照片的复古餐酒车 Blender 模型

- 用户提供大众复古酒车照片并打开Blender，要求制作合理车模。新增tools/build-drink-truck.py，以标准Z-up建立可编辑模型：奶油白/酒红双色、V形前脸/圆标/圆灯、双片倾斜挡风玻璃/雨刷/后视镜、真实轮拱/四轮/车轴、曲面帆布顶/花边/黄铜支架、双层38瓶酒架/吧台3瓶酒/4只酒杯/侧面招牌。原照片已打包在blend中。
- source-assets/drink-truck/night-bar-van.blend为可编辑源，另有OBJ/MTL与drink-truck-studio.png。已在第二个Blender窗口打开，不动原未保存窗口；Windows截图接口超时，因此以实际Blender后台渲染核对模型外观。
- dist/assets/drink-truck.js导出33361三角形的顶点色网格；index.html加载，drawDrinkTruck改为共享residentMesh，不再使用原方块占位车。保留飞入/停靠/选酒流程；车辆停到初始平台内，四轮实际地板支撑，酒关相机向上偏移14%以便下方选酒同时显示完整车模。
- npm run check、test-drink-truck、test-gpu-residency通过；扩展网格有限值/单位法线/颜色/三角形预算与实际常驻数据断言。preview-drink-truck三尺寸真实WebGL通过，按全部导出顶点实际投影验证面板不挡车，检查四轮落点、点击选择/商店/换层、暂停/常驻网格与GPU恢复。查看Blender工作室渲染及游戏截图。未发布。
- 尝试刷新用户当前浏览器页被URL安全策略拒绝，未尝试绕过；已请用户手动刷新后F2打开酒车测试。

## 2026-10-23 本地：选酒时保留酒车可见

- 修复三选一复用全屏商店遮罩导致只见UI、不见酒车的问题：drink-choice遮罩仅覆盖下方52%，取消背景模糊；下方保留工业风三列选酒卡，压缩标题与酒图标。长说明可在下方面板滚动，上方场景保持可见。
- 酒车停靠点向后移28单位，完整车身与选酒面板之间留空。npm run check、test-drink-truck通过；preview-drink-truck三尺寸真实WebGL通过，并新增投影车身底缘高于面板顶缘及无模糊断言。已查看390×680/844画面，重新打开当前酒车测试预览。仅本地未发布。

## 2026-10-23 本地：酒说明去标签

- 酒车三选一、旧酒吧卡片、酒商品说明去掉“醉酒效果/醒酒/增益”前缀，直接显示负面与正面效果；延后获得的正面效果前加“之后，”，三种即时生效酒不加。HUD的效果说明也去掉对应标签。数值、时机和结算不变。
- npm run check、test-drinks/economic-drinks/drink-truck通过；当前预览已刷新并重新打开酒车测试关。仅本地未发布。

## 2026-10-23 本地：屏蔽金蜘蛛、接入无怪酒车关

- 正式流程的金蜘蛛关已屏蔽，原B07/B18/B29改为酒关；保留内部金蛛机制便于以后恢复，装备测试里的入口改为“酒车关卡测试”。酒关直接进入独立drinkArrival状态，不经过地块准备/战斗计时/怪物生成，不触发旧酒房间结算。
- 一台带酒柜、驾驶室和悬浮推进器的酒车从场外飞入，2.6秒减速靠站、0.6秒下降停稳后弹出免费三选一。复用已有16种酒、适用性筛选和consumeDrink，三杯不重复；选一杯立即进入本层普通商店，不能重复领/刷新/跳过。旧醉酒和醒酒机制保留，休息层不扣旧酒的剩余战斗房间次数。
- 三选一沿用商店的shop-panel/shop-grid/choice/drink-card、现有酒图标和工业深色UI，显示醉酒代价/醒酒增益；购物时隐藏悬浮地块测试按钮。酒车使用固定常驻网格，暂停/切后台冻结进场，重开/下一层清理。
- npm run check及test-drink-truck/shop-stock/gpu-residency/drinks/economic-drinks/timed-floors/greed-room通过；旧金蛛专项改为显式调用内部关卡，完整campaign回归识别和平酒关。新增test-drink-truck纳入npm test。全量npm test通过完整六角campaign和八条BOSS路线后，在此前已记录的test-59“all five slots available”旧商店断言处停止；另行运行test-terrain-shop在旧夹具假设初始自带医疗格处失败（当前新局地板已全空白），本轮未扩大修改这些无关测试。
- preview-drink-truck真实headless Edge/WebGL验证390×844、390×680、1280×900的飞入/停稳时序、三列无溢出、真实点击免费领取/商店/下一层、暂停、常驻网格及GPU恢复，零页面/GL错误；已查看酒车和三选一截图。仅本地未发布，非手机实机。

## 2026-10-23 本地：大果田、扩地保底与脉冲强化

- 四种果田占地由2/3/4/5扩大到6/7/8/9：苹果三角6格、香蕉六边形7格、葡萄梯形8格、西瓜大月牙9格；固定方向，保留月牙缺口嵌塔、整座生产/拾取、核心图标和进度。初始19格各有6/7/5/1个合法落点，都能与3格电塔共存。生产周期和上轮复合加成保持。
- 正式prepareFloor先从当前有合法落点的扩地形状中随机保留1个，再从剩余合法池随机抽2个；同一层重复prepare不重抽、选择一次自动开始/未选消失保持。没有合法扩建位置时保留原满图拆除/整理/无动作开始回退，不突破13×11地图边界。
- 电能脉冲独立冷却从35秒改为15秒；旧医疗/护盾/旧震荡补给的SHOCK_COOLDOWN保持。拾取仍清全屏敌弹，同时将完整占地外沿相邻格触及的友方电塔伤害提高30%，持续5秒；每塔只结算一次，多次触发刷新、不叠倍数。伤害计入实际攻击/连锁伤害快照，暂停/商店冻结，换层清零；炮台、敌人和其他生产/辅助设施不获得加伤。卡片及范围显示同步。
- npm run check及test-electric-tiles/farm-shapes/tile-feedback/hex-campaign通过；扩展脉冲回归验证15秒、支援、近远目标、真实7.8伤害、暂停、刷新不叠加、5秒到期和换层清零。同步因大形状扩大测试场地及旧固定落点。
- preview-large-farms真实headless Edge验证64组随机数×楼层×拥挤状态的扩地保底及不重抽、四果田初始19格真实拖放/6至9格缩略图/单份水果；preview-farm-packing、core-placement、electric-campaign、fruit-supplies、electric-pulse通过，覆盖奇偶行核心拖放/移动、正式每关三选一/转场/满图回退、复合水果属性、清弹/真实电塔强化与支援。已查看大苹果/西瓜及脉冲截图，零页面/GL错误。仅本地未发布，非手机实机。

## 2026-10-23 本地：价格/锁定按钮无间距

- 按用户进一步要求，将shop-purchase-row横向间距由6px改为0，价格与锁按钮独立横排且紧贴。npm run check、preview-shop-no-tiles通过，真实Edge三尺寸验证左右按钮边界相接、购买/锁定及商店操作正常，零页面/GL错误。本地未发布。

## 2026-10-23 本地：杂项反馈10—17

- 新增 EQUIPMENT-GRID-AUDIT.md：逐项核对12件衣服；拾荒风衣的回血/拾取半径、狂笑西服的印钞加速、暗红西装的医疗包强化未接入新设施，另外列出裂变德鲁伊/盛宴舞鞋的相同问题。保留现有效果，仅列待决定方向。
- 功能格/扩地/路障说明去掉占地重复文字，水果不再说明本层叠加/换层清零，实际叠加与清零保持；回响改为“虚线内电力设施会重放它的效果”。霓虹巡演效果与属性卡改为靠近危险源使用特技的滑板，保留数值机制。
- 搬运无人机离场8秒改为2秒，进场10.4秒/卸载0.3秒保持。矿机每4秒产出一份5金币，沿用实体拾取、未捡停产、回响和金币倍率。
- 水果全部复合：苹果5秒/回1血+移速10%；西瓜8秒/回3血+攻速10%；香蕉8秒/回1血+移速20%；葡萄10秒/回1血+攻速20%。回复和属性同时结算，满血也可加属性；果实贴图增加30%自发光底色、80%原光照，并加小光晕。食用均绘制0.9秒绿色光辉与9根上升细丝。
- 飞碟填充/边界/波纹alpha降低，边界最高0.24，减速半径/强度保持。
- npm run check及test-electric-tiles/farm-shapes/enemy-transports/hex-campaign/fruit-model-assets/tile-feedback/125/127/128/129/130/131/132/165通过。相关旧文案/亮度/数值断言同步；水果回归扩展到四种均回血。preview-fruit-supplies/electric-miner/ufo-field/fruit-models/fruit-healing在真实headless Edge/WebGL通过，含实际拖放/四种复合效果/满血/叠加/换层清零/矿机5金币与回响10金币/共享显存与上下文恢复/治疗两尺寸截图。已查看水果、治疗和飞碟截图，零页面/GL错误，非手机实机。本地未发布。

## 2026-10-23 本地：建筑仅核心格显示CD

- ElectricTiles.draw将CD扫描填充限制到coreCell：多格电塔、矿机、农田等只在核心格显示进度，完整占地轮廓及冷却/生产规则保持。
- npm run check、test-tile-feedback、test-electric-tiles、test-farm-shapes通过；覆盖所有设施、奇偶行核心位置及0/25/50/100%进度。preview-tile-feedback真实headless Edge/WebGL三尺寸通过，preview-tile-progress两尺寸通过，零页面/GL错误；已查看390×844半CD截图。旧progress预览固定摆位与当前多格形状冲突，已改用合法落点。仅本地，未发布，非手机实机。


## 2026-10-23 本地：射击敌人提前首发与整波刷新

- 普通射击敌人首发改为出生/运输落地后0.4～0.56秒，后续保持原CD；激光首次立即进入0.55秒可见预警再发射，后续0.9秒预警/2.1秒间隔保持。近战/工程车/BOSS不使用快速首发。
- 普通计时关卡开场及后续改为5个一波，保持原3/3.5/3.6秒章节间隔与空场0.35秒加速。射击人数额度不足时整波等待，落地点失败回滚整批并重试；不再绕过受限远程队列逐只送出近战。末尾6个合为一波，避免留下单只尾怪。蜂巢额外敌人纳入后续批次，保留有限总数和50%增量。
- 新增test-enemy-waves接入npm test，覆盖5楼层开局/正常/空场整波、人数额度保留、落地失败原子重试、蜂巢/暂停以及9种射击敌人非瞬发和快速首发（六角运行时含运输落地）。npm run check及test-enemy-waves/enemy-transports/hex-campaign/room-pressure/timed-floors/economic-drinks通过；room-pressure覆盖5楼层×两装备×5随机种子。同步旧刷怪断言，并修正两份旧测试对当前1倍生产时钟与第4层已改工程车后仍假定生存模式的夹具。仅本地，未发布；本轮未做实机视觉验收。

## 2026-10-23 本地：商店价格与锁定按钮独立横排

- 按用户截图反馈，将价格从商品卡内部拆为真实购买按钮，与锁定按钮放在同一shop-purchase-row横排，两按钮独立边框且间距6px、同高43px，价格左侧自适应、锁定右侧32px；取消锁按钮绝对定位及价格预留锁位置。商品主体和价格按钮均可触发原购买逻辑，锁定仍独立且不触发购买。
- npm run check、test-shop-stock、preview-shop-no-tiles通过；真实headless Edge覆盖390×680、390×844、1280×900，检查按钮相邻不重叠/同高、锁定不扣款/白底锁态、价格按钮真实购买与确认、升级刷新保留锁定商品、售后锁禁用和下一关，零页面/GL错误。已查看390×680截图。仅本地，未发布，非手机实机。


## 2026-10-23 本地：玩家造墙回调为单格

- 按用户平衡要求移除双格、三格直线/弯折/三角、菱形与六边形6种路障，正式三选一、测试背包补充及指定格子入口均只保留单格barricade。说明明确每次仅放1格，单次成功摆放消耗一张卡；放置入口拒绝非路障种类。
- 单格4耐久、挡弹/碰撞、每关恢复、最后安全落脚位置保护、取消不消耗及拆除规则保持，保留已有分组路障的拆除兼容。
- npm run check、test-cover-tile、test-tile-feedback通过。preview-barricade真实Edge验证正式单格选项/摆放后仅1墙/自动开战和挡弹耐久；preview-barricade-shapes改为单格回归，验证旧6种入口/背包/放置均不可用、奇偶行真实拖放与1格占用、冲突/安全保护/恢复/拆除及三尺寸，零页面/GL错误。仅本地，未发布，非手机实机。


## 2026-10-23 本地：轮廓淡化、冷却填充增强与单核心电塔

- 功能地块细轮廓改走真实alpha混合，opacity=.65，保留2.4线宽及无缝斜接。CD填充色亮度系数由稀有度色×.45提高到×.65，并以opacity=.8绘制，使转CD区域更明确、仍可透出地板；六角与基础方形scan新增可选opacity，默认1保持其他调用。深度测试保留，图标在后续sprite通道仍可见。
- 电塔删除左右两格圆盘底座、发光环及跨格连接支架，只保留核心格单塔身/底座，绘制触发也改为coreCell。占地仍为3格，塔心、射程和伤害保持。
- npm run check、test-tile-feedback/electric-tiles/farm-shapes/hex-city/hex-terrain/gpu-residency通过。preview-tile-feedback真实Edge三尺寸验证轮廓alpha=.65、CD alpha=.8、塔常驻网格X范围≤21且无两侧模型，零页面/GL错误；已查看390×844半CD截图。preview-electric-tower更新为核心参考落点，验证自动攻击与原伤害、三尺寸、模型复用和GPU恢复通过。仅本地，未发布，非手机实机。


## 2026-10-23 本地：功能地块细轮廓与转角接缝

- 功能地块轮廓总宽由4.8降为2.4（减半）。替换独立平头线段为共享内外转角顶点的斜接边带，消除凸角/西瓜月牙凹角的三角缺口。按实际渲染XZ比例计算法线，使各方向等宽；轮廓几何按HexMap.outline对象WeakMap缓存，移动/占地变化自动重建，不逐帧生成。
- npm run check、test-tile-feedback/electric-tiles/farm-shapes通过。新增全部设施×奇偶行的实际绘制几何检查：每边半宽1.2、有限坐标、每个内外接点被两条边精确共用。preview-tile-feedback真实headless Edge/WebGL三尺寸通过，零页面/GL错误，已查看tile-feedback-390x844.png。仅本地，未发布，非手机实机。


## 2026-10-23 本地：核心点摆放与选项连线

- ElectricTiles.coreCell统一可见核心格：横向三格塔为中间塔身格，农田与其他设施为原产物/图标格；西瓜取实际首占格，避免把月牙空洞当参考点。背包新放与场内任意占用格抓取后移动，都以核心格对齐指针落点，内部anchor/固定形状/占用和合成规则保持。缩略图、场内图标与产物共用核心选择。
- 取消选项卡随指针移动和旋转。鼠标/触屏拖动选项时卡片留在原位上浮10px、轻放大，单根细线从卡片上沿连到预览核心格；随相机适配刷新，合法绿线、无效红线，不拦截输入。取消/无效落点复位且不消耗选项，成功放置/合成/关闭/重置清除连线。背包顶部留12px浮起空间。
- npm run check、test-tile-feedback/electric-tiles/farm-shapes通过；preview-core-placement真实headless Edge验证塔和四种农田×奇偶行的背包新放、抓非核心格后移动均核心对齐。preview-core-drag-link验证正式三选一卡片位置不跟随指针、连线两端、鼠标/触屏取消复位、无效落点保留与成功消耗，零页面/GL错误；已查看core-drag-link-390x844.png。preview-tower-merge最终放回落点由旧左锚点更新到核心格，沿用升级与合成回归。仅本地，非手机实机，未发布。全量测试上轮已知test-59商店旧断言问题未在此扩大处理。


## 2026-10-23 本地：激光越界与功能地块辨识（反馈5—9）

- 玩家进化激光统一使用覆盖全场并越过地图边缘的长度，三连发首束与延迟两束、无人机及持续激光共用；敌方激光和路障挡敌方激光规则保持。
- 功能设施按完整占地外沿绘制清晰稀有度轮廓，剔除内部共边，支持西瓜月牙凹边；场内与背包缩略图均只显示一份核心图标，电塔取三格中心，其他设施取锚点（空锚点月牙取首个实际占格）。路障移除悬浮图标，保留实体与耐久条。
- 正式拖放扩地逐格随机：5%路障、5%地刺、2.5%固定锯、1%环绕锯、2.5%飞轮，其余84%空白。路障满耐久，陷阱正常初始化；卡片说明提示可能开出陷阱或路障。初始地板与测试用扩建空白地板保持。
- 新增test-tile-feedback并接入npm test：三连发/无人机四方向越界命中、延迟束、整块凹形外轮廓、场内和背包单核心图标、无路障图标、各随机分支及真实expand。npm run check、test-tile-feedback/electric-tiles/farm-shapes/cover-tile/weapon-vfx/hex-campaign通过。preview-tile-feedback真实headless Edge/WebGL三尺寸通过，零页面/GL错误，已查看390×844截图；非手机实机。
- 全量npm test未全通过：先同步test-hex-city中上轮已取消的开局医疗/护盾旧断言为0，继续运行后在test-59“all five slots available”商店断言失败，此处未扩大修改商店。旧preview-tile-clarity因过时固定设施坐标放置冲突失败，本轮新增独立三尺寸预览验证。仅本地修改，未发布。


## 2026-10-23 本地：开局全空白地板

- 移除初始自带的医疗/护盾格，仅改为空白地板，保留3/4/5/4/3共19格。HexMap.initialFloor与game.js基础resetFloor一致修改，HexMap.transform的精确匹配字符串同步；农田/后续补给机制保持。
- 空出两格后，四种农田初始合法落点变为苹果14、香蕉9、葡萄6、西瓜7；形状和数值保持。更新test-farm-shapes并检查初始全部为空白，preview-farm-packing增加真实reset后19格/零医疗/零护盾断言，仍验证农田与电塔共存及余16格却放不下西瓜的卡位。
- npm run check、test-farm-shapes、test-hex-terrain、test-electric-tiles、preview-farm-packing通过。真实headless Edge/WebGL验证新局开局无两种补给格，零页面/GL错误。本地未发布，非手机实机。


## 2026-10-23 本地：农田拼接与占地补偿初版

- 初始地图保持3/4/5/4/3共19格（含原医疗/护盾格），地图最大13×11不变。四种水果改称农田、固定方向多格形状：苹果[[0,0],[0,1]]2格斜田；香蕉[[0,0],[0,1],[0,2]]3格斜长条；葡萄[[0,0],[1,0],[1,1],[2,1]]4格错位折线；西瓜[[0,-1],[1,-1],[-1,0],[-1,1],[0,1]]5格月牙，右侧开口，中心锚点不占格，允许电塔/辅助设施嵌入。没有增加旋转功能。
- 占地补偿首轮数值：苹果5秒/回1血；香蕉8秒/+50%移速；葡萄10秒/+60%攻速；西瓜8秒/回3血。生产和拾取仍按整座农田结算1份，满血可吃、未拾取停产、支援不按接触格重复计算、本层属性可叠加/换层清零保持。拾取浮字改从真实bonus生成，防止旧25%/30%显示残留。月牙农田的共享水果显示在首个实际占用格，避免因中心为空不绘制。
- 枚举保留医疗/护盾的19格初始地图，苹果/香蕉/葡萄/西瓜各有10/5/2/5个合法落点，每种都能分别与三格电塔共存；有一类电塔摆法会使西瓜无合法落点，仍余14格空地，证明确有形状卡位。test-farm-shapes已加入tests/run入口，验证上述形状/数值、初始落点、奇偶行/连通性/完整占用/冲突/移动原子性/非锚点拆除及缺口嵌塔。
- npm run check、test-electric-tiles、test-farm-shapes、test-fruit-model-assets、test-hex-campaign通过。preview-fruit-supplies、preview-fruit-models、preview-electric-irrigator、preview-farm-packing在真实headless Edge/WebGL通过，含四种真实拖放与卡片格数、原水果贴图/共享模型/GPU恢复、回血/移速/攻速/叠加与清零、灌溉与三种支援、逐种初始19格与电塔同场，零页面/GL错误。已查看fruit-supplies-awaiting-390x680及farm-packing-watermelon-390x844截图。数值为首轮设计，尚未进行长期游玩平衡验证。本地未发布，非手机实机。


## 2026-10-23 本地：路障多种形状

- 路障新增双格、横向三格、三格弯折、紧凑三角、4格菱形（左下/右上锐角）及7格六边形（2/3/2），保留单格，共7种，接入正式三选一、测试背包/指定格子、缩略图、占格说明和完整拖放预览。仅在全形状可放且留有安全落脚位置时提供/放置，成功只消耗一张卡。
- 同次放置的各格以barricadeGroup关联，整组原子放置，各格独立沿用原4耐久、碰撞/挡弹和每关恢复规则。拆除任意格（含已破损格）整组移除、保留地板；拆除预览显示完整形状。已有非分组路障仍按单格处理。
- npm run check、test-electric-tiles、test-cover-tile、preview-barricade通过；原浏览器回归的正式选项更新为新增六边形路障。新增preview-barricade-shapes在真实headless Edge/WebGL验证7种形状×奇偶行真实拖放、卡片格数、次格冲突/越界、最后落脚格保护、全格占用、独立破损/重生、安全移位及非锚点整组拆除，三尺寸截图，零页面/GL错误。已查看barricade-shape-barricadeHex/barricadeDiamond-390x844.png。本地未发布，非手机实机。


## 2026-10-23 本地：生产设施占地修正

- 原电能炸弹现为电能激荡塔，保留横向连续3格。电能脉冲（用户称震撼弹）改为轴坐标[[0,0],[1,0],[1,-1],[2,-1]]的2×2菱形4格，左下/右上为锐角。矿机按用户进一步澄清改为三行2、3、2共7格六边形（中心及一圈相邻格），不是19格。
- 卡片缩略图、预览、占用、移动与整件拆除沿用多格管线；多格生产设施只显示一份产物，走入任意占用格可拾取，同一设施不重复结算。路障空位检查改用单格电池形状，避免借用矿机导致必须空出一整片才能摆路障。生产周期/金额/清弹/电塔攻击与合成规则保持。
- npm run check、test-electric-tiles、test-hex-campaign通过。新增回归覆盖奇偶行、菱形锐角方向、矿机1+6格、次格冲突、移动原子性、非锚点拾取/拆除、产物仅绘制一次。preview-production-shapes、preview-electric-miner、preview-electric-pulse在真实headless Edge/WebGL通过，包含实际拖放、3/4/7格卡片、三窗口截图、GPU重建、单格路障与供电/拾取效果；零页面/GL错误。已查看production-shape-miner/pulse-390x844.png。本地未发布，非手机实机。


## 2026-10-22 本地：横向三格电塔、拖动与合成升级

- 电塔占地改为[[0,0],[1,0],[2,0]]横向连续3格，三座底座/连接支架共用常驻塔身；射击原点与射程仍取占地中心。两座同级塔拖到一起合成，目标原位升级、源塔整件移除并释放3格，最高3级。基础伤害6，每级×1.8（UI沿用伤害×100显示为600/1080/1944），4秒/420射程/5目标保持，辅助设施仍每座只加成一次。塔身底部1/2/3枚青/紫/金标记表示等级。
- 正式每层三选一界面允许移动/合成已有电塔，抓任意占用格保留拖动偏移，落到同级目标任意一格即可合成；整理已有塔不消耗选择也不提前开战。新选塔可直接用于合成并消耗本层选择，满场但有可合成1级塔时仍提供电塔选项。合成落点金色高亮并提示目标等级，不同级/满级/无效落点不消耗。测试背包收回/放出保留等级；换层/重置生产及移动保留等级，新局移除设施。
- npm run check、test-electric-tiles、test-hex-campaign、preview-electric-tower、preview-electric-campaign、preview-tower-merge通过。核心回归包含横向占地、真实三级伤害、同级/异级/自身/满级合成、完整源格释放和等级生命周期；真实headless Edge覆盖正式整理移动、非锚点合成至2/3级、取消保留选择、满场新选塔合成并进入战斗、升级塔背包往返等级保持、三尺寸塔身/攻击/GPU恢复及零页面/GL错误。已查看tower-merge-level3-390x844.png。本地未发布，非手机实机。

## 2026-10-22 本地：电塔扩大为三格占地

- 按用户确认仅调整塔：电能激荡塔改为[[0,0],[1,0],[0,1]]紧凑三角形，占相邻3格，其余设施占地保持。卡片缩略图/说明、拖放预览、完整占用、移动与任意占用格整件拆除沿用多格设施管线；路障不再借用塔的占地检查，保持单格。
- 塔身仅绘制一次，新增覆盖三个格心的共享金属底座/连接支架，主体、电极射击原点与420射程圈统一放在三格中心。原4秒/6伤害/最多5目标机制保持，residentMesh复用。电池/回响/涡轮按目标设施任意占用格接触范围供电，同一目标只加成一次。
- npm run check、test-electric-tiles、test-hex-campaign、preview-electric-tower、preview-electric-campaign通过。新增奇偶行三格绑定、边界/次格冲突、移动原子性、非锚点拆除与供电、仅一塔身回归；真实headless Edge验证三格卡片及实际拖放、三尺寸、中心原点自动攻击、单次伤害、GPU重建及零页面/GL错误。已查看390×844截图。本地未发布，非手机实机。

## 2026-10-22 本地：水果属性仅本层叠加

- 修复葡萄攻速加成跨层保留：ElectricTiles.startRoom在换层初始化时清零水果属性；同机制香蕉移速同步仅本层叠加。同层重复拾取继续累加，不随时间衰减，移除生产设施不回收本层已得属性；下一层重新拾取从第一层加成开始。
- 香蕉/葡萄说明改为“本层可叠加，换层清零”，HUD改为“本层累计”。此规则取代历史整局保留/跨层不清空说明。
- npm run check、test-electric-tiles、test-hex-campaign、preview-fruit-supplies通过。回归覆盖实际floor++/startWave后属性归零、实际移速/攻速恢复基值、新层葡萄重新累计、重开清零；真实headless Edge/WebGL验证两次拾取+50%移速/+60%攻速、本层HUD和换层隐藏，零页面/GL错误。本地未发布，非手机实机验收。

## 2026-10-22 本地：商店操作排版

- 锁定改为价格栏右侧32px独立图标按钮，保留无障碍名称、白底锁态与独立点击；移除原整行锁定按钮及价格栏编号。
- 商品下方第一排并列升级/刷新，第二排整行“进入下一关”；原顶部升级提示栏移除，升级说明保留在按钮title。
- npm run check、test-shop-stock、preview-shop-no-tiles通过。真实headless Edge/WebGL覆盖390×680、390×844、1280×900的价格栏内锁按钮/两排操作布局，以及锁定不购买、升级刷新保留原商品、购买与进入下一关；零页面/GL错误。已查看390×680截图。本地未发布，非手机实机。


## 2026-10-22 本地：按用户澄清修正雾片穿楼硬边

- 用户澄清是“雾的片像截断建筑”，上一轮针对建筑底部的解释不完整。实际夜城四张水平透明雾池参与深度测试，和楼体相交时透明度从无到有跳变，造成切面。
- 夜城四张雾片改为四个有厚度的椭球高斯密度区，在静态建筑/常驻城市网格片元和灯海点顶点中沿相机方向积分雾光学厚度，再连续混色/衰减。保留原四层位置、色彩、.76/.55/.32/.4峰值透明度及.00065距离雾；不关闭建筑遮挡，不对角色/地板/子弹叠全屏滤镜。灯海独立闪烁保持。
- 撤回上一轮新增楼体向-3300延长及全城按高度染雾的临时处理；保留底平面在深处。新雾参数随帧设置、程序uniform位置缓存，上下文恢复重新定位。
- npm run check、test-hex-city（含movement）、preview-city-bottom通过。真实Edge三尺寸/三配色、闪烁/缓存/纹理/上下文恢复保持；新增实际GPU墙面贯穿雾中心回归，亮度跨度55而最大相邻像素变化1，无硬切跳变，零页面/GL错误。已查看390×844截图。本地未发布，非手机实机。


## 2026-10-22 本地：城市建筑切边与灯海闪烁

- 用户截图指出建筑硬切边：上一版抬升至-1550的大面积底平面截断楼体。本次恢复底平面至-2810，并将各楼最低层轮廓向下延续到-3300，城市表面在-1700至-3100逐渐融入深雾，消除浮空平底切口。原距离雾密度与雾池透明度保持。
- 圆形辉光点着色器按世界位置散列选择约28%灯点，独立相位/频率做平滑明暗闪烁，其余保持常亮。使用sceneTime，暂停冻结；每帧仅更新uniform，原点数据/GPU缓存复用。
- npm run check、test-hex-city（含movement）、preview-city-bottom通过。真实Edge/WebGL三尺寸/三配色、圆形贴图透明度、上下文恢复/缓存/零GL错误保持；新增灯光独立绘制GPU像素对比：不同时间24216像素变化、29671亮像素保持，同一时间零差异，暂停时钟稳定。已查看390×844截图。本地未发布，非手机实机验收。


## 2026-10-22 本地：重建飞车/摩托/球舱与扩大球舱翼臂

- 按新PERSONAL SKYPOD参考重建四涵道飞车：连续白色侧围/C形后肩、中央深黑玻璃、四个实际中空涵道/七叶风扇和白悬臂，4976三角。摩托重建宽高前整流罩、开放脚踏、黑U形坐垫/高靠背及厚白后侧行李壳，3356三角。
- 球舱改为纵向黄色蛋壳、前向透明泡泡窗、内置机器人驾驶员/座椅、奶白机械圆舱。按用户最新顶视反馈，将双宽翼伸至X±38，宽12–15，双粗臂/推进器移至X±31，保持主球体尺寸并留臂间空隙；4304主体+160透明玻璃三角。战斗机保持。
- 公共Blender导出按材质canopy标记分出玻璃网格；游戏玻璃使用opacity .32常驻透明通道，与主体共享受击位移/白闪，稳定复用GPU缓冲。推进器光点改贴合实际型号部件。
- npm run check、test-enemy-transports、preview-enemy-vehicles通过；真实Edge/WebGL覆盖三窗口、四种攻击数、有限网格、GPU缓存、透明网格/主体受击姿态一致、零页面/GL错误。已查看最新tests/enemy-vehicles-models.png及实际俯视缩小图。已刷新用户现有?vehiclelab=1标签页。本地未发布，非手机实机。


## 2026-10-22 本地：电塔恢复自动防御塔

- 用户要求电塔回调为防御塔。tower内部键保持，名称恢复电能激荡塔，移除电能炸弹拾取机制。每4秒从塔身自动攻击首选420范围内最近敌人，后续135距离，最多5个连锁目标；基础伤害6及正式闪电链每跳0.7衰减、0.8秒共享电击枪特效、单次结算沿用。无目标不生成伤害弹/产物，塔不阻挡移动，不加入敌方炮台/可攻击列表。
- 当前源码未保留旧塔绘制代码，本次补建金属底座、多层发光线圈与顶部电极，electric:tesla-tower共享residentMesh，不逐帧上传几何；枪弹从实际顶部58高度发射。恢复摆放/选中时420静止虚线圈，更新背包、说明和攻击计数。电池开局10秒30%加速/涡轮减CD/回响延迟0.18秒额外攻击继续有效，回响不递归，移除源或目标取消待执行项。其他生产设施仍需拾取。
- npm run check、test-electric-tiles、test-gpu-residency、test-hex-campaign、test-weapon-vfx通过。preview-electric-tower真实headless Edge/WebGL覆盖自动攻击、塔原点、伤害494/495.8/497.06、单次结算、无产物、三尺寸、常驻模型复用/有限坐标、GPU重建与零页面/GL错误；已查看electric-defense-tower-390x844.png。preview-electric-campaign通过。旧preview-electric-pickup入口重定向到新防御塔预览。
- preview-electric-tiles的原空白落点(22,180)/(360,220)可能落入扩建形状有效区，改为顶端y30后通过该段和电塔实战/鼠标交互，后在触屏扩地断言失败（81行，19 !== 21），整份脚本未通过，未声明完整拖拽验收。此处未改扩地实现。本地未发布，非手机实机验收。


## 2026-10-22 本地：弹道去除横杠和箭头

- 按用户卡宾枪截图反馈，15种手枪/机枪/双枪/卡宾/狙击共用弹体图集改为圆润亮芯与单轴连续渐隐尾迹，移除箭头、多边形弹头、横向刻线、箭簇、侧翼、方片和分离装饰；收窄弹体贴图宽度，保留各型号颜色及细微长宽差异。命中/伤害/速度/连发规则不变。
- npm run check、test-weapon-vfx、test-juicy-pistol、test-167通过。weapon-vfx增加所有15图块的横向亮度单调、纵向居中衰减断言，防止重新出现独立横杠/箭簇/侧翼。
- preview-weapon-vfx真实headless Edge/WebGL通过，多尺寸及图集/上下文恢复检查无页面和GL错误；已查看tests/cyber-bullet-models-contact.png，卡宾为平滑细尾迹。本地未发布，非手机实机验收。


## 2026-10-22 本地：四种 Blender 空中载具敌人

- 按俯视游戏需求用三个 SubAgent 并行制作飞车、飞摩托、黄色球舱和战斗机，实际 Blender 后台导出低面数网格：1164/1656/1661/1316三角；可编辑源文件位于source-assets/enemy-vehicles，生成脚本tools/build-*.py及vehicle_mesh_common.py。
- enemy-vehicles.js将eye/skull/spitter/moth分别接入上述模型，保留单发/环射/脉冲/三发散射、原生命碰撞和自主飞行规则。白蓝车壳、开放座舱、黄色深蓝球舱、尖鼻后掠双翼区分轮廓。residentMesh共享常驻网格/GPU缓冲，实例处理朝向和受击，推进器亮点独立绘制。
- 新增?vehiclelab=1四种实际敌人暂停预览；已请求在Codex浏览器打开。tests/enemy-vehicles-models.png为模型及俯视缩小对照，enemy-vehicles-game-*为三种游戏窗口截图。
- npm run check、test-enemy-transports、test-hex-campaign通过；preview-enemy-vehicles真实headless Edge/WebGL通过390×844、390×680、1280×900、四网格有限坐标/几何与GPU缓冲复用、受击白闪、预警复用、攻击数1/8/1/3及空中分类，零页面/GL错误。已查看模型与竖屏截图，桌面浏览器验收，非手机实机。本地未发布。


## 2026-10-22 本地：恢复原雾效、灯海改圆形辉光贴图

- 按用户纠正，城市距离雾密度恢复.00065，原三层雾池透明度.76/.55/.32与侧雾.4恢复；保留灯海街区分布。
- 移除31278盏灯的实体矩形发光面，改为共享64×64径向透明辉光贴图的GL_POINTS批量绘制，圆形亮芯与柔和光晕、透明边角。保持真实深度测试、距离雾衰减和雾池覆盖；静态点数据每场景/上下文只上传一次，无逐帧灯网格重建。新程序/纹理/缓存支持上下文恢复。
- npm run check、test-hex-city（含movement）与preview-city-bottom通过。真实headless Edge/WebGL覆盖三尺寸/三配色、灯海缓存、上传纹理透明四角/径向衰减/对称性、WEBGL_lose_context丢失恢复、零页面/GL错误；已查看390×844截图。本地未发布，非手机实机验收。


## 2026-10-22 本地：城市底部星光灯海

- 按参考图为夜城底部加入31278盏细碎暖色地面灯，穿插少量冷色，按不规则街区、暗院落及断续道路排布。使用实际地面发光网格、深度遮挡和距离雾，随场景静态缓存上传，不逐帧重建。
- 降低底层雾池透明度和城市距离雾密度；调整远处72栋低层街区的高宽、间距及底部地面高度，露出楼群间的灯海，保留近景高楼、广告、雨幕和原配色。地图143格容量保持。
- npm run check、test-hex-city（含movement）及preview-city-bottom通过；真实headless Edge/WebGL覆盖390×844、390×680、1280×900和三种配色，静态数据/上传缓存复用、有限顶点与零页面/GL错误。已查看双竖屏截图，非手机实机验收。本地未发布。


## 2026-10-22 本地：拖拽卡片上锚点避让与反馈

- 正式选项卡继续移动同一DOM，不复制。改为卡片顶部在鼠标下方36px、触控下方54px，水平居中并限制左右视口，避免卡片覆盖指针落点；临近底边允许底部被视口裁切，优先保持落点可见。
- 增加180ms拿起缩放弹性、轻微抬起阴影、横移±4°倾斜与停手归正、可放/不可放轻量光影反馈；取消/无效落点原卡220ms回弹归位，不重播入场。减少动态效果设置跳过缩放/倾斜/回弹。放置判定/库存/原面板退场与开战时序不变。
- npm run check、test-electric-tiles、preview-first-drag、preview-room-ready、preview-electric-campaign通过；first-drag覆盖同DOM/原内容、鼠标/触控、双竖屏/跨层、top边至少低于指针20px、无效落点及取消回弹后精确回位、减少动态效果和背包横滚。已查看tests/drag-original-card-390x844.png，零页面/GL错误。本地未发布，非手机实机。


## 2026-10-22 本地：强建机器人改为履带工程车

- 用户要求更好的模型并参考工地作业车。drawBuilderGeometry改为工程黄紧凑履带工程车，带独立履带/轮毂、防护驾驶舱、后配重/散热格栅、排气管、警示灯和前推土铲；保留原移动、半径、HP和盲盒施工逻辑。
- 新增共享常驻网格机械臂/工具头，液压套筒与活塞杆跟随机械臂连杆变换；施工时伸展并轻微作业振动，红色光束从实际工具头出口连接目标。静态车身/活动部件网格复用，不逐帧重建整份模型。
- npm run check、test-builder（方格/六角）、test-enemy-transports通过。真实headless Edge preview-builder-room通过双竖屏、三机器人施工/四种陷阱揭晓/击杀通关，零页面或GL错误。新增preview-builder-model验证实际模型三个角度、工作姿态变化与网格复用，已查看tests/builder-construction-model.png和builder-room-working-390x844.png。本地未发布，非手机实机。


## 2026-10-22 本地：开局拖动原选项卡本身

- 按用户纠正，删除跟随指针的复制说明UI。正式三选一拖拽直接对原electric-stock-card DOM节点施加translate，整张卡的图标/名称/效果/稀有度描边一起移动；保留原网格占位，其余两卡不挤位。不创建卡片副本或独立说明框。
- 无效放置/取消/丢失捕获恢复原卡与坐标，不重播入场动画、不消耗库存；成功放置隐藏被用卡再沿用面板退场→地块升起/设施烟雾→开战。测试背包横向滚动规则保持。
- npm run check、test-electric-tiles、preview-first-drag、preview-room-ready、preview-electric-campaign通过；真实Edge覆盖鼠标/触屏、390×844/680、开局/跨层，验证拖动的是同一个DOM节点且内容不变、无复制说明、无效落点回位/取消/正常放置及动画时序，零页面/GL错误。已查看tests/drag-original-card-390x844.png。本地未发布，非手机实机。


## 2026-10-22 本地：装备栏武器图标按稀有度着色

- 用户指出普通勤务手枪仍橙色。equipmentVisualPalette的weapon分支改为WEAPON_GRADES统一主体/点缀色，普通灰、改良绿、精良蓝、史诗紫、传奇金；护甲实际材质配色与空槽灰保持。
- npm run check、test-shop-stock、preview-shop-loadout通过。浏览器新增开局普通勤务手枪灰色断言，以及五品质武器主体/点缀一致性断言；已有衣服配色/空槽/购买替换/刷新与多尺寸验证保持。已查看tests/shop-starter-pistol-gray-390x680.png，零页面/GL错误。本地未发布。

## 2026-10-22 本地：多页面音乐叠播防护

- 用户反馈听到两路不同步音乐，Codex标签静音后仍有一路。检查源码为单个bgm/GameMusic，但原blur只在战斗等状态暂停游戏，商店/选格以及编辑准备仍可持续播放；本聊天浏览器清单无标签，未定位当前另一音源，不能声称已关闭它。
- GameMusic增加独立foreground/页面生命周期门控，失焦、隐藏和pagehide直接pause，逐帧setState不能重启；focus/pageshow恢复资格，保留原游戏暂停规则、曲目进度、音效及商店压低音量。BroadcastChannel同源多页面播放权互斥，失去播放权的页面不会逐帧抢回；异源/不同端口及未刷新旧页不在互斥范围。异步play完成后重新同步完整播放条件，防止失焦后复播。
- npm run check、test-music-ownership（加入run入口）、test-60、test-62、test-campaign通过。preview-music-ownership真实headless Edge验证音频解码/播放、WebAudio、商店失焦/恢复、两页面消息互斥与静音，生命周期事件为测试派发，非Codex静音按钮/人工听音验收。本地未发布，旧页面需刷新才能生效。

## 2026-10-22 本地：强建机器人施工陷阱盲盒

- 用户明确要求建造类型为盲盒。新增builderTrapPool/buildRandomTrap，五秒完工时才等概率抽取地刺、固定电锯、移动飞轮、环绕电锯（后者受原ORBIT_SAW_ENABLED开关控制）；不提前确定或显示类型，三机器人每次施工独立抽取。直接复用既有陷阱初始化，已占用/正面设施仍保护，不修改边界炮台规则。
- 保留目标预留、施工范围/五秒进度、三秒冷却、中断/死亡/暂停、三机器人房与击杀通关。更新旧“必须地刺”断言为实际危险设施，并增加四个分支、完工前零随机揭晓、每格仅一陷阱、不可重抽、方格/六角飞轮初始坐标与有限模型检查。
- npm run check、test-builder（方格/六角）、test-hex-campaign、test-particle-surfaces通过。真实Edge preview-builder-room通过双竖屏/实际三机器人施工/四种受控揭晓/击杀通关和零页面/GL错误；已查看builder-blind-orbitSaw/flywheel-390x844截图。本地未发布，非手机实机。


## 2026-10-22 本地：15–23细化与追加图标/锁态/粒子地面修正

- 爆炸亮闪统一0.15秒，普通/武器爆炸共享云烟/火星逻辑：烟稍大更浓，先径向四散再缓慢升高；火星距离+18%、寿命0.7→0.85秒，伤害与半径保持。
- 仅floor形状扩建升起，RoomReady按当前相机投影计算每个新六角顶点从viewport底+32之外进入；功能设施/路障在原地板上放置独立烟雾，不升起。等待面板实际退场→升起/烟雾0.55秒→开战，玩法/关卡计时冻结，取消/重开/暂停保持。
- 地面图标38→30.4、卡片图标32→25.6，实际水果/芯片产物尺寸不变。MapIcons集中语义配色：苹果红/西瓜绿/香蕉黄/葡萄紫/金币金/护盾蓝/电蓝/脉冲靛蓝，地图/卡片/芯片顶部复用，稀有度只由边框/进度表达。拖拽名称与描述跟随鼠标或触控，避开落点并限制在视口，释放/取消清理。
- 苹果/西瓜满血也拾取并重新生产，不超上限；满血反馈“已吃下”避免+0。伤害飘字和装备/武器测试攻击数值统一按内部伤害×100取整（正值最小1），内部伤害/HP/攻击节奏不变，合并伤害先累计原值再格式化，暴击保留!。
- 空装备槽中性灰。loadout图标使用PNG alpha mask与实际装备材质palette，不再全部cyan；护甲12种按名称配色，穿戴模型胸甲/肩甲与UI共用armorVisualPalette，品质边框和标签保持。锁定按钮为闭锁/开锁SVG，锁态白底黑锁，未锁深底，aria与独立点击保持。
- 普通商店无地块加成/应急修复入口与已拥有加成折叠栏，旧对象仍拒购。核对散射飞行怪moth（三发扇形）与单发悬浮spitter均独立飞入、不运输；地面怪运输规则保持，新增分类/实际发射/自主移动回归。
- 用户询问机器人只造一类：只读确认updateBuilder完工直接生成trap，无多类池。临时模拟三机器人在B7/B17/B99各连续施工120秒，每组六角地图17次完工全为地刺；未擅自改建造类型。
- 地图外粒子修正：装饰碎片/弹壳/钞票与Boss碎片不再被全图height固定平面托住，只在真实已解锁可见地块或路障顶触地，地图外持续重力坠落，绘制保留负高度；实际落地才有弹壳声，金币结算不变。test-timed-floors仍在旧production shares clock:1/4断言失败（本次未改生产时钟），未计入通过项。新增test-particle-surfaces已加入tests/run入口，方格/六角及空洞/撤地/隐藏地/路障/格下不吸附通过。真实Edge preview-particle-surfaces验证49格奇偶行×六向内外、格外下落/GPU负高度/声音/金额/缓存，双竖屏零页面和GL错，已查看falling截图。
- 专项检查：npm run check、electric、juicy-pistol、talents、weapon-vfx、test-167、cover/shock、terrain-shop/shop-stock、category-boxes/test-63、enemy-transports、fruit-assets、hex-terrain/campaign通过。真实Edge验证room-ready/first-drag/campaign、fruit-supplies（含满血）、juicy-pistol（机枪38整数且真实扣血不变）、shop-no-tiles/loadout、map-icons、enemy-transports，以及爆炸关键时刻/全武器预览。截图包括shop-lock-white-390x680、shop-armor-color-renewal、drag-description-390x844、integer-machine-gun-damage。未发布，非手机实机。


## 2026-10-22 本地：商店商品顶部标签改为稀有度

- 用户截图指出工业风商品顶部Tab仍显示品类。本次renderShop增加data-rarity，Tab改显示普通/改良/精良/史诗/传奇并使用同一WEAPON_GRADES颜色，移除武器/无人机固定橙色、加成固定青色覆盖；普通级颜色与统一灰色一致。品类仍由商品名称/图标表达。
- npm run check、test-shop-stock、preview-shop-loadout通过；后者新增五级×三品类的真实伪元素文字/底色一致性检查，以及已购/锁定状态保持稀有度，原三窗口/替换/刷新检查保持。已查看tests/shop-rarity-tabs-390x844.png，零页面/GL错误。本地未发布。

## 2026-10-22 本地：稀有度/芯片产物/原水果模型/机器人运输/锁商品与开场时序

- 格子卡片描边、地块边框和进度色统一按固定稀有度（普通灰、改良绿、精良蓝、史诗紫）。路障描述为“阻挡敌人的子弹，每关开始重生。”，放置和重生共用安全移位，禁止堵死最后落脚格；地面图标30→38。
- 非水果产物统一为简单实体芯片+顶部白色种类图标，边框表达稀有度，无模糊光晕；涵盖电能炸弹/矿机金币/脉冲和原医疗/护盾/印钞/特殊补给。电能炸弹不再电环，拾取电击420范围内最近两个可攻击敌人；原清弹脉冲功能保持，炮台仍排除。
- 按后续指示水果例外：从 H:/UnityProject/TaptapJam/TaptapJamProject/TaptapGameJam/Assets/Models/Back Garden 复制 Apple_01/Watermelon_01/Banana_01/Grape_05 的原FBX、材质和Garden-Palette.png，来源/哈希保存在source-assets/fruits。tools/export-fruit-fbx.py离线导出LOD0原UV/法线到dist/assets/fruits。fruit-models.js使用真实贴图、常驻GPU顶点缓冲与逐实例变换，不每帧重建；上下文恢复重传，加载完成才开放游戏。水果原回血/属性叠加/拾取规则保持。
- 强建房为三个机器人，无弹幕辅助怪。施工完成不再朝向玩家，工作冷却期提前选下个合法地块，无目标保持朝向待机。运输无人机进出速度减半，卸货后沿入场直线路径返航并反向机头。
- 单件商品锁按钮独立于购买，刷新/升级/跨关保留锁定未购商品对象、词条和原价，购买后正常补货，新局清空。商店只售装备和拆除，移除地块加成与应急修复商品/奖励，旧对象拒购；AK47使用已有步枪种类图。
- 用户澄清“每关突然”不是要倒数：成功放置后等待真实面板下滑动画完成，再让新增占地从地下110高度升起0.5秒，完成才startWave。room-ready.js只推进过渡时钟，敌人/生产/关卡计时冻结，暂停冻结升起；无倒数UI。重开/下降取消旧回调，测试局不等待。
- npm run check、test-fruit-model-assets、test-electric-tiles、test-builder（方格/六角）、test-enemy-transports、test-shop-stock、test-terrain-shop、test-cover-tile、test-shock-tile、test-63、test-settlement、test-talents、test-hex-terrain/city/campaign通过。更新旧商店断言但保留非商店功能覆盖。未宣称全量npm test通过：旧test-59仍要求五槽；test-61旧房间收入断言未同步强建房。
- 真实Edge/WebGL：preview-room-ready、preview-electric-campaign、preview-first-drag、preview-builder-room、preview-enemy-transports、preview-shop-no-tiles/loadout、preview-electric-pickup、preview-tile-clarity、preview-fruit-supplies、preview-fruit-models通过；覆盖双竖屏/相关宽屏、真实拖放/安全路障/放电两敌/锁定购买/三机器人/半速原路返航/面板→升起→开战/水果贴图缓存与上下文恢复，零页面/GL错误。已查看水果与芯片、路障、机器人及升起起始/中间截图。非手机实机，未发布。


## 2026-10-22 本地：移除挖掘工具、商店顶部四格装备与 API 拆图技能

- 删除铲子装备/工厂/动画、商店池、F2领取和HUD显示；旧shovel商品拒购。旧金钱格改为按既有30/40/20秒周期自动生产，保留实体拾取、容量、暂停和限时房规则，进度遮罩改为正向。删除铲掘效率天赋，旧有效投资按paid记录一次性退回并保存，新增迁移回归。
- 商店顶部固定显示武器/护甲/坐骑/无人机四格；复用现有独立种类PNG，显示当前名称、品质及空槽状态；替换装备和刷新商店同步更新。无需新增生图或计费拆图。
- 新增项目级 `.agents/skills/seedream-decompose/SKILL.md` 和通用CLI脚本，AGENTS.md加入入口。沿用TreasureIsland6000官方API协议和环境变量/EditorPrefs凭据读取，保存脱敏请求、响应与图层坐标；已有响应补下载，结果不明禁止盲重发。技能校验及离线缓存/坐标/重复恢复/提交保护验证通过，本次未调用外部API。
- npm run check、test-shop-stock、test-talents、test-shovel-attacks（现验证自动生产和旧商品拒购）、test-terrain-shop、test-electric-tiles、test-hex-campaign通过；更新旧类别断言去掉挖掘工具。preview-shop-no-tiles、preview-shop-loadout真实Edge/WebGL通过，覆盖390×680/844和1280×900、空槽/四件装备、真实购买替换和刷新，零页面/GL错误。已查看tests/shop-loadout-390x680.png与空槽截图；非手机实机验收，未发布，未宣称全量npm test通过。


## 2026-10-22 本地：三选一拆成独立工业风卡片

- 按用户要求移除正式三选一共用横条底板、外边框和圆角，改为三张相隔12px的独立卡片，间隙透出场景；标题与拖拽提示悬置。沿用industrial-ui的炭灰渐变、青色强调、切角、细边框与商店字体层级，测试背包样式保持。
- npm run check、preview-first-drag、preview-electric-campaign通过；查看390×680截图确认三片独立底板和文字布局，390×844同样生成截图，鼠标/模拟触屏拖放与跨关通过，零页面错误。本地未发布，非手机实机验收。

## 2026-10-22 本地：三选一拖拽误判为背包滚动

- 复现起手横移12px/上移8px后拖往合法格仍无法放置：moveDrag在超过7px时按方向锁定scroll，三选一无横向溢出也进入该分支，此后整次手势不再进入放置。并非首次必败，取决于起手方向。
- 三选一统一进入place；仅测试背包确有横向溢出时保留横向scroll。放置/取消/库存及入场动画规则保持。
- 新增preview-first-drag，真实Edge/WebGL覆盖鼠标和CDP触屏、390×844/680、开局及下一关的第一次斜向拖拽，并验证测试背包仍能横向滚动且库存不变。修复前复现失败，修复后通过；npm run check、test-electric-tiles、test-hex-campaign、preview-electric-campaign通过，零页面错误。本地未发布，非手机实机验收。

## 2026-10-22 本地：格子描述改为玩家效果说明

- 电能炸弹按进一步反馈改为“每4秒产生1个电能炸弹，拾取后电击周围敌人。”，不再使用电荷、闪电链和命中数量的表述。
- 精简四种水果、炸弹、矿机、脉冲、灌溉机、回响线圈和生物发电机的卡片说明，只保留产出频率、效果和关键数值；删除满血不拾取、待拾取时停产、回响延迟/防递归、供电兼容和扣血保护等细则。水果改用“吃下回复/增加属性”，香蕉和葡萄保留本局可叠加说明。生产与拾取逻辑未改。
- 同步矿机预览中的文案断言。npm run check、test-electric-tiles通过；本次仅文案修改，未进行浏览器视觉验收，本地未发布。

## 2026-10-22 本地：格子进度统一六边形遮罩

- 电力设施和四种水果格移除圆形进度环，统一调用医疗/护盾/印钞/震荡已使用的 emissiveSquareScan，由六角适配器绘制贴地六边形扫掠遮罩；多格设施每个占地一致。颜色沿用设施色系并降低填充亮度，白色图标保持在遮罩上方。生产/供电计时、电池剩余窗口与待拾取满进度保持。
- npm run check、test-electric-tiles（新增全部设施0/25/50/100%进度、多格占地、待拾取和电池窗口断言）、test-hex-terrain、test-hex-campaign通过。新增 preview-tile-progress 真实Edge/WebGL覆盖全部设施及医疗/护盾/印钞/震荡格，两种竖屏截图、零圆形进度调用、零页面/GL错误；已查看 tests/tile-progress-390x844.png。本地未发布，非手机实机验收。
- test-shock-tile 在旧断言 real shop purchase reserves shock tile 失败：仍要求现已取消的商店格子购买，本次未修改购买规则。


## 2026-10-22 本地：强建施工提示贴地与六边形

- 按用户反馈撤回高悬进度条，改为目标格前侧贴地横条（底板高度5、填充6.5），保留独立深度与左端固定增长；施工标记由圆环改为与地块同方向、同纵向比例的六边形内轮廓，共享residentMesh。施工仍为5秒。
- npm run check、test-builder（方格/六角）、真实Edge/WebGL preview-builder-room通过；已查看50%截图确认六边形与贴地条，双竖屏及页面/GL错误检查通过。本地未发布。


## 2026-10-22 本地：强建机器人五秒施工与进度条修复

- ADDED_ENEMIES.builder.buildTime 从16改为5秒；原3秒工作间隔、144开始/216保持范围、中断和地块保护规则保持。
- 原进度填充与底板同厚同位置，存在共面深度冲突且容易与玩家血条遮挡。改为独立residentMesh底板/发光填充，填充突出底板，移至目标格上方及后侧；只更新实例缩放，左端固定，五秒完成后隐藏。
- npm run check、test-builder（原方格/默认六角）、test-hex-campaign及真实Edge/WebGL preview-builder-room通过。新增1秒20%、2.5秒50%、4.99秒99.8%、5秒改造/消失断言，保留暂停/眩晕/击杀中断、房间通关与双竖屏检查；已查看50%/99%截图，零页面/GL错误。截图 tests/builder-progress-{20,50,99}-390x844.png。本地未发布，非手机实机验收。


## 2026-10-22 本地：开局半径计数修正为包含中心格

- 用户确认半径3格包含中心格，因此开局改为轴向距离≤2，中心加两圈，共19格（1+6+12），行宽3/4/5/4/3；替代此前37格版本。医疗/护盾、重开清理和扩地边界保持。
- 同步test-hex-city范围/圈数/重置断言。npm run check、test-hex-city、test-hex-special、test-hex-campaign、test-electric-tiles全部通过；真实Edge验证19格正式开局准备、390×680/844、重新开局及零页面/GL错误，已查看tests/opening-19-cells-390x844.png。本地未发布。

## 2026-10-22 本地：商店停止出售格子

- 删除普通商店固定扩容按钮及扩容购买函数；扩建和五类地块建造从商品池排除。shopUsable 同时拒绝 floor/medical/shield/cashTile/shockTile/coverTile，旧商品对象无法扣款或预留地形。保留装备、回复、拆除和地块强化被动，升级提示移除扩容说明；开局三选一摆放及非商店地形奖励保持。
- 更新 test-shop-stock/test-terrain-shop 的商品池、各等级旧格子商品拒购和无扩容入口断言，移除 test-63 对已删除函数的调用。新增 preview-shop-no-tiles，验证正式开局三选一、五等级3000件商品无格子、390×844/680及1280×900商店、回复/被动购买、升级/刷新/离店及零页面/GL错误；已查看390×680截图。
- npm run check、test-shop-stock、test-terrain-shop、test-hex-campaign、test-electric-tiles、test-builder及preview-shop-no-tiles通过。全量npm test在test-enemy-transports的 incoming drone can be targeted 失败（此次未改运输/目标逻辑）；单跑旧test-63在 shelf hides identity and stats 失败，该断言禁止现商店已有的shop-item-description元素。未宣称全量通过。旧历史预览preview-shop-rework/hex-city/industrial-ui/starlit-ui仍含原扩容点击步骤，应使用本次新增专项验证当前商店。本地未发布。


## 2026-10-22 本地：格子纯色生图图标

- 按用户参考改为纯白剪影 PNG。内置 image_gen 生成两张总图，复用 H:/UnityProject/TreasureIsland6000/Artifacts/IslandDefenderEquipmentIcons/2026-09-27/seedream_extract.py 的官方 Seedream 接口及凭据读取，两个 layer_decomposition 请求返回16+8个命名层（含修正）。未本地分割总图；仅对 API 独立图层 alpha 裁边、等比缩放和居中留白。20张256×256透明PNG位于 dist/assets/map-icons/，原图/API响应/映射和总览位于 ../outputs/map-icons/。
- map-icons.js 共用透明纹理/缓存地面四边形，替换电力与水果格、医疗/护盾/印钞/震荡和路障顶部标记；选格卡片以 SVG image 引用同一 PNG，已删除原手绘 symbol 与 electric floor-icon 几何。六角底板/范围/充能进度/实体产物与玩法保持。纹理按 spriteProgram 生命周期重传，使用标准透明混合而非加色发光。
- preview-electric-tiles的旧屏幕坐标用例在floorLine red preview outside floor失败（屏幕点现在被判为合法）；未改变摆放规则，保留用例与失败记录。
- npm run check、test-electric-tiles、test-hex-campaign、test-shock-tile、test-cover-tile、preview-electric-campaign、preview-electric-irrigator、preview-map-icons通过；后者验证20图加载、地图/卡片位图、几何/纹理复用、WebGL丢失恢复及390×844/680截图。已查看两张地图截图、正式三选一卡片截图和最终20图总览。桌面Edge/WebGL验证，非手机实机；本地未发布。


## 2026-10-22 本地：半径三格六边形开局

- 六边形适配器的 resetFloor 改用 HexMap.initialFloor：轴向距离不超过 3，中心加三圈（1+6+12+18），共37格，行宽4/5/6/7/6/5/4。保留医疗格、护盾格及原始地块状态；重新开局恢复全新37格。固定13×11扩地边界、旧方格存档入口保持。
- test-hex-city 增加真实转换后 resetFloor 的完整范围、圈数、初始设施、出生位置及重置验证；test-hex-special 的初始场地同步为37格。
- npm run check、test-hex-city（含行走）、test-hex-special、test-hex-campaign通过。真实Edge/WebGL验证正式开局准备、390×680/844布局、重开与零页面/GL错误；已查看 tests/opening-radius3-390x844.png。全量npm test曾被并行模型改动阻断：先是震荡格旧字符串适配（随后工作区已修复），后为test-electric-tiles读取缺失electric:floor-icon:tower模型；未声称全量通过。本地未发布。

## 2026-10-22 本地：路障格接入开局与指定测试

- 确认原掩体的六边形适配已存在：hex-cover:block共享六边形模型、HexMap.coverContains/coverSegment六面碰撞。新增开局“路障格”选项，复用原coverTile及全部掩体规则，不创建新的电力生产设施。占1格，基础4耐久（沿用加固被动），挡角色/小怪/敌弹，小怪可拆、Boss可撞碎；损坏后保留可走地板，每关恢复耐久并安全移出重建占位的角色，支持拆除。
- 正式三选一、指定格子测试及测试背包接入（现18种）；拖放共用空闲地块保护、红绿预览、一次放置自动开战规则，路障不覆盖既有设施、不接受生产加成。原商店和旧测试入口继续沿用同一掩体实现。
- npm run check、test-electric-tiles、test-cover-tile、test-hex-campaign、preview-electric-campaign、preview-tile-test-tools、preview-floor-shapes及新增preview-barricade通过。新增奇偶行/六个方向防穿透与射线拦截、实际六边形网格/行走/敌弹先后碰撞、4→3耐久、破坏可走/跨关重建和安全移位、实际指定拖放/取消/保护格拒绝/拆除/正式自动开战及两种竖屏布局验证。已查看tests/barricade-hex-390x680.png和barricade-choices-390x844.png，本地未发布，非手机实机验收。

## 2026-10-22 本地：扩地提示显示完整可覆盖范围

- 空地块拖放的白色提示改为所有合法摆法的完整占地并集，不再只画锚点；SVG拾取层与WebGL地面提示使用同一floorCoverage。frontier保留合法锚点语义，当前整片红绿预览及放置规则保持。
- npm run check、test-electric-tiles、test-hex-campaign、preview-electric-campaign及扩展preview-floor-shapes通过。覆盖四种形状、奇偶行、原始场地、地图边角/满图、提示去重与不覆盖已有地板，明确回归“左边缘格不能作锚点但可被整片覆盖”；真实Edge拖放逐项验证提示完整并保留重叠/越界/取消/库存和正式自动开战流程。已查看tests/floor-coverage-390x680.png，本地未发布，非手机实机验收。

## 2026-10-22 本地：拆除支持正面设施

- 开局“拆除”扩展到全部电力/水果/生物设施及原医疗、护盾、印钞、震荡、掩体格，保留原危险源拆除。多格设施拖到任一占地均整件移除，预览高亮完整占地，只消耗一次机会并保留所有地板；卡片缩略图仍固定单格拆除标记。
- 电力设施沿用ElectricTiles.remove清理占用和待执行回响，补充记录回响来源，使拆掉线圈也会取消未执行额外生产。原功能格清理补给队列/拾取中产品、冷却/耐久等状态；已获得水果属性保留。空地不可拆、临时生存炮台仍不参与，正式地图满设施时可抽拆除腾位。边缘炮台与地块重叠时优先拆炮台。
- npm run check、test-electric-tiles、test-hex-campaign、preview-electric-campaign及扩展preview-demolition真实Edge/WebGL通过；遍历全部12类电力设施、5类原正面设施及6类负面设施，验证多格整拆、产物清理、取消库存、保留地板/无关设施/已得属性、仅正面设施时正式抽取与自动开战。满图回归改为可拆正面设施，并保留无动作兜底。已查看tests/demolition-positive-turbine-390x680.png，本地未发布，非手机实机验收。

## 2026-10-22 本地：生物发电机卖血刷新循环

- 新增单格生物发电机，走入时直接支付1点生命，立即将周围6格内生产设施/涡轮的剩余冷却清零，当次即可生产/供电；多格涡轮任一占地触及范围即可被刷新。支持水果、炸弹、矿机、脉冲、灌溉机、涡轮；电池开局窗口、被动回响及其他生物发电机不作为刷新目标，避免自动递归。
- 入格锁存：站立不连续扣血，必须离开再进入；至少保留1生命（含小数生命），无有效冷却目标不收费，未捡完/等待回响的产品不被覆盖且不预存刷新。生命支付不经护盾/无敌或伤害倍率抵扣，不授予受击无敌；有正常血条损失、飘字和粉色供能反馈。
- 加入正式三选一、测试背包与指定格子测试（现17种），心形图标/六格虚线范围及供血次数/刷新数量显示，图标使用residentMesh。逻辑和真实Edge/WebGL测试均连续跑通3轮“苹果回血→回踩扣血→苹果立即再生产”。
- npm run check、test-electric-tiles、test-hex-campaign、preview-electric-campaign、preview-tile-test-tools及新增preview-bio-generator通过；覆盖实际拖放/走位循环、站立锁存、范围/多目标/多格设施、1血/小数生命、护盾无敌真实支付、满产物和无目标不扣、暂停/商店冻结、跨关重置及正式卡片。已查看tests/bio-generator-loop-390x680.png和bio-generator-choices-390x844.png。本地未发布，非手机实机验收。

## 2026-10-22 本地：电能脉冲复用原震荡清屏

- 新增单格“电能脉冲”，使用原SHOCK_COOLDOWN=35秒生产1份实体脉冲，走近拾取后调用原terrainEmitShock（source=tile及对应地块），直接复用清除全屏bullets、shockWaves冲击波、音效/震动及原震荡被动规则。不新增默认减速、眩晕或伤害；不清除敌人/友方攻击/机关/炮台，原震荡格保持。
- 产物模型直接复用drawShockPickup/terrain:shock-pickup，贴地同心圆图标使用residentMesh；未捡完不生产下一轮，接受电池、涡轮和回响额外产物，回响不递归。加入正式三选一、测试背包与指定格子测试（现16种），测试面板显示清屏次数及待拾取数量。
- npm run check、test-electric-tiles、test-shock-tile、test-hex-campaign、preview-electric-campaign、preview-tile-test-tools和新增preview-electric-pulse真实Edge/WebGL通过。验证原35秒周期、等待停产、清屏范围及保留对象、原震荡被动、真实帧先清弹后碰撞、三个供电加成/回响两份依次清屏、实体模型/冲击波共享及正式抽取。已查看tests/electric-pulse-clear-390x680.png与electric-pulse-choices-390x844.png，本地未发布，非手机实机验收。

## 2026-10-22 本地：电能灌溉机

- 新增单格电能灌溉机，周围6格为灌溉范围：每4秒自动灌溉一次，使范围内正在生产的水果格剩余冷却减少1.5秒，无需拾取；水果有未拾取产品或等待同轮回响时不减冷却、不预存加成。多个灌溉机可叠加减冷却，仅作用于水果，不影响矿机/炸弹或其他灌溉机。
- 灌溉机自身接受电池前10秒30%加速、涡轮1.5秒减冷却以及回响延迟0.18秒额外灌溉；回响不递归。灌溉在水果生产判定前执行，降至0可当次产出。加入正式三选一、测试背包及指定格子测试（现15种）；绿色喷灌图标/六格虚线范围、灌溉连线和进度环，测试显示次数及剩余冷却，固定图标使用residentMesh。
- npm run check、test-electric-tiles、test-hex-campaign、preview-electric-campaign、preview-fruit-supplies、preview-tile-test-tools、preview-floor-shapes及新增preview-electric-irrigator通过。验证实际水果冷却/产出加快、范围和移动、待拾取不偷跑、暂停/商店/跨关、三种供电单项及组合、回响移除取消、多机叠加与无循环；真实Edge/WebGL测试1次普通灌溉与同布局全供电4秒4次灌溉。截图tests/electric-irrigator-powered-390x680.png和electric-irrigator-choices-390x844.png已查看。本地未发布，非手机实机验收。

## 2026-10-22 本地：水果属性整局累加

- 香蕉/葡萄取消8秒持续时间与刷新机制，改为每次拾取分别累加25%移速/30%攻速，无叠加上限，整局保留且跨关不清空，重新开局清零。直接累计到水果独立属性，沿用真实movementSpeed/attackSpeedMultiplier入口，不修改装备。苹果/西瓜回血与水果生产/拾取规则保持。
- 卡片说明改为本局累加、跨关保留；HUD显示实际累计百分比，移除倒计时。回响额外水果逐个拾取也可继续叠加。
- npm run check、test-electric-tiles、preview-fruit-supplies及preview-electric-campaign通过，验证两次香蕉/葡萄变为移速+50%/攻速+60%、60秒不衰减、跨关保留、移除生产设施不回收已得属性、新局清零及实际拾取/HUD。真实Edge/WebGL截图tests/fruit-stacking-390x844.png已查看，本地未发布，非手机实机验收。

## 2026-10-22 本地：四种水果补给生产格

- 新增四种单格水果生产设施：苹果8秒/恢复1生命，西瓜14秒/恢复2生命，香蕉8秒/移速+25%持续8秒，葡萄8秒/攻速+30%持续8秒。每关三选一、测试背包和指定格子测试均接入，测试选择现共14种；四种卡片图标、贴地标记和悬浮水果分别绘制，固定几何共用residentMesh。
- 水果需要走近拾取，未捡完暂停下一轮，继承电池/回响/涡轮加成与同轮回响等待规则；满血保留回血水果，不溢出生命上限。香蕉/葡萄可同时生效，同种重复只刷新8秒，BUFF接入真实movementSpeed/attackSpeedMultiplier，HUD显示剩余时间；暂停/商店冻结，每关和新局清空，装备属性不被修改。回血飘字读取实际恢复量。
- npm run check、test-electric-tiles、test-hex-campaign、preview-electric-campaign、preview-tile-test-tools、preview-electric-miner及preview-floor-shapes通过。新增preview-fruit-supplies真实Edge/WebGL覆盖四种指定领取/实际拖放、实体水果、等待停产、行走拾取回血/真实移速攻速/BUFF HUD到期及正式卡片；VM补充满血不消耗、BUFF刷新/独立到期/暂停冻结、跨关重置及三类供电组合。已查看tests/fruit-supplies-awaiting-390x680.png、fruit-supplies-buffs-390x844.png和fruit-supplies-choices-390x844.png。本地未发布，非手机实机验收。

## 2026-10-22 本地：产品拾取后才开始下一轮

- 按新反馈撤销矿机自动入账：产出实体金色金币，走近拾取后才通过gainCash入账；金币使用共享residentMesh、光晕和待拾取数量标记。矿机和电能炸弹统一为有待拾取产物时暂停生产冷却，最后一份捡完后从完整4秒重新开始；等待期间不预存电池加速/涡轮减冷却。
- 回响保留同轮额外产物，全部拾取才解锁下一轮；原产物抢先拾取时仍等待已安排的回响，避免回响间隙偷跑生产。三种发电加成继续作用于实际生产阶段。卡片说明及测试统计改为待拾取/生产暂停/已拾取收入，未拾取不计收入。暂停、商店及跨关原生命周期保持。
- npm run check、test-electric-tiles、test-hex-campaign、preview-electric-miner、preview-electric-pickup及preview-electric-tiles通过。新增两类产品长时间不捡无增产、拾取重新完整计时、回响部分拾取/提前拾取、三加成下仍等待，以及矿机实体金币/行走拾取/零自动收入的真实Edge/WebGL验证。已查看tests/electric-miner-awaiting-pickup-390x680.png，本地未发布，非手机实机验收。

## 2026-10-22 本地：电能矿机与通用生产加成

- 新增单格“电能矿机”，默认每4秒生产1金币并自动入账，沿用gainCash的正常金币倍率与飘字，金色贴地钱币图标/冷却进度环使用residentMesh。加入正式每关三选一、测试背包和指定格子选择；测试选择现共10种，矿机选中显示本关实际收入及下次生产倒计时。
- 将生产目标统一为电能炸弹和矿机：电池前10秒加快30%冷却，涡轮每次扣减1.5秒，回响延迟额外生产同种产物且不递归；支持叠加、范围变化与移除。回响说明同步覆盖两种生产设施。矿机无需拾取、不发射攻击；暂停/商店冻结，跨关重置生产计时及本关统计，保留钱包。
- npm run check、test-electric-tiles、test-hex-campaign、preview-electric-campaign、preview-tile-test-tools、preview-floor-shapes通过；新增preview-electric-miner真实Edge/WebGL验证指定领取/单格拖放、实际金币到账、金色共享网格、三种加成共同覆盖及正式卡片说明。基础4秒1金币，测试组合4秒4金币。已检查tests/electric-miner-choices-390x844.png；本地未发布，非手机实机验收。

## 2026-10-22 本地：指定格子测试工具

- 战前改造面板新增“测试格子”入口，可保留当前场地并显式切换到测试局；F2面板入口统一为“指定格子测试”，原场内“地块测试”和?electriclab=1仍可用。测试局不记录最高楼层，重开恢复普通流程。
- 测试面板新增“指定格子 / 添加拆除目标”：9种候选均可直接点选，每次补3份并排到背包最前面，自动收起选择器，支持反复补充及混合摆放。可一键添加地刺、轮锯、飞轮、机枪/激光炮台，并自动补充拆除格；炮台满4台时提示，不使用原添加函数的地刺降级分支。沿用开始测试/整理背包、重置充能、扩建和靶群工具。所有补充/目标添加均限测试编辑状态，普通三选一隐藏这些工具。
- npm run check、test-electric-tiles、preview-electric-campaign、preview-electric-tiles通过；新增preview-tile-test-tools真实Edge/WebGL覆盖开局/F2入口、九种点选+3/前置、实际拖放、五种拆除目标、炮台上限、运行/编辑切换及390×680/844和1280×900布局。已检查tests/tile-test-tools-390x680.png和390x844截图；本地未发布，非手机实机验收。

## 2026-10-22 本地：UI 方向动画与地块面板下滑退场

- 新增 dist/ui-motion.js / ui-motion.css，由 index 在主逻辑前加载。战前地块面板从底部滑入、三卡依次出现；成功放置后使用 inert、aria-hidden、无重复 ID 的纯视觉副本向下滑出180ms，原面板立即隐藏并沿用自动开战、音乐连续和库存清理规则。无效/取消拖放保留面板；新局/编辑器重置清理退场副本。
- 商店初次底部入场，同一商店刷新/购买不重播整体动画；装备揭晓右侧进入，离店向下退场。技能面板右侧进出；暂停、音量、测试面板、结果、BOSS/过关提示和toast增加短动画，常驻HUD保持稳定。支持系统减少动态效果。
- npm run check通过。preview-ui-motion与更新后的preview-electric-campaign真实Edge/WebGL通过：覆盖地块下滑关键帧/副本不可交互与清理、实际拖放和取消/跨关/自动开战/音乐、技能进出、商店刷新/揭晓/退场、减少动态效果。已查看tests/ui-motion-reveal-390x844.png。桌面浏览器验证，非手机实机；本地未发布。
- npm test在旧tests/test-61.cjs收入断言中止：用例仍将B4按生存房处理，期望首四关32/32/32/28，当前强建房流程测得32/32/32/0；动画模块未载入该VM用例，未改动经济或关卡逻辑，也未改该断言。中止前的回归通过。


## 2026-10-22 本地：开局定点拆除格

- 每关三选一新增“拆除”，场上有可拆负面设施才进入候选池；测试背包同步增加。拖到目标格移除该设施并保留地板，支持地刺、固定/环绕轮锯、移动飞轮及永久机枪/激光炮台；移动危险源可从所属格或当前位置拆除，临时生存炮台不参与。普通地板、医疗格及电力设施不能被此选项误拆。
- 复用红绿预览，拖动时标出可拆目标；无效落点/取消不消耗，成功后用掉本关一次改造机会并自动开战。沿用独立场地移除规则，炮台不进入攻击目标。
- npm run check、test-electric-tiles、test-hex-campaign、preview-electric-campaign、preview-floor-shapes及preview-electric-tiles通过；新增preview-demolition真实Edge/WebGL覆盖各危险源定点移除、多目标保留、空地/正面设施拒绝、取消库存、正式抽取/自动开战及临时炮台排除。已查看tests/demolition-saw-390x680.png，本地未发布，非手机实机验收。

## 2026-10-22 本地：电能炸弹改名与多格扩地

- 电能激荡格统一改名为“电能炸弹”，同步回响说明及测试背包提示；原产电、拾取闪电链规则保持。
- 移除单格普通地块，改为双格、三格直线、三格弯折、三格三角四种固定形状，均进入正式每关三选一和测试背包。缩略图、红绿预览、可选过滤和提交共用实际形状；全部占地须为空且在13×11范围内，整块至少一格邻接现有地板，校验通过才一次性扩张。跨关保留、一次摆放自动开战规则保持。
- npm run check、test-electric-tiles、test-hex-campaign、preview-electric-tiles、preview-electric-campaign通过。新增preview-floor-shapes覆盖四种地块奇偶行实际拖放、整块重叠/边界/连通性、取消库存守恒及正式三选一多格自动开战；真实Edge/WebGL截图tests/floor-shapes-390x680.png。本地未发布，非手机实机验收。

## 2026-10-22 本地：技能点水晶放大并提亮

- 普通及Boss技能点水晶统一放大至原来的1.5倍（高度27/30），同步放大光晕；提高晶体表面、发光边框和中心亮芯的蓝色亮度。保留共享residentMesh及原掉落、拾取、奖励规则。
- npm run check与test-talents通过；专项真实Edge/WebGL渲染验证两类水晶、三个常驻网格及无脚本/GL错误，截图outputs/skill-crystals-1_5x-brighter.png。旧preview-talents因当前标题页隐藏skill-wallet而超时，未完成全套旧浏览器流程。本地未发布，非手机实机验收。


## 2026-10-22 本地：拖入场地即显示红绿占地预览

- 拖拽拾取由“只命中已有地板/扩地邻域”改为当前相机矩阵下的指针射线与地面平面求交，再按HexMap.cellAt吸附六角网格。任何场地内空白区域（含固定地图边界外）均显示实际形状的红色不可放预览；合法位置绿色。保留13×11边界和原放置/扩地校验，不增加可放区域；拖回卡片区或移出视口隐藏预览。
- npm run check、preview-electric-tiles及preview-electric-campaign真实Edge/WebGL通过。新增普通地块/电池/回响/涡轮在空白处实际红色顶点和无效释放库存守恒验证，原鼠标/触屏拖放、取消、绿预览、三窗口、自动开战及音乐连续验证继续通过。已查看electric-drag-empty-red截图，本地未发布，非手机实机验收。


## 2026-10-22 本地：涡轮一秒起步逐次加快

- 涡轮发电机描述统一为“每一秒减少一次虚线内电力格的冷却，而且逐渐加快”，正式卡片引用同一描述。首次供电由6秒改为1秒；沿用每次供电间隔缩短18%、最低0.8秒及每次减少范围内电力格1.5秒冷却的规则，每关重置。地面进度环同步读取新初始间隔。
- npm run check、test-electric-tiles（1秒首供电、1.5秒冷却扣减、范围外不受影响、0.82→0.8秒加速下限、暂停/商店冻结与每关重置）、preview-electric-tiles真实Edge/WebGL回归通过。本地未发布。


## 2026-10-22 本地：电池改为开局限时冷却加速

- 用户确认只改电池，涡轮和回响保持原功能。电池描述统一为“开局10秒内，虚线内电力格的冷却加快30%”，正式卡片直接引用同一描述。移除原0.8秒/1.5秒扣减/4次电量机制，改为开战前10秒范围内电力格冷却按1.3倍推进；同范围多个电池每个叠加30%速度。
- 使用全场战斗时钟，10秒边界只加速有效时间片；暂停、商店和布置不计时，每关开战重置。移动/拆除电池立即更新范围，临时补放电池不重启开局窗口。电池地面环显示剩余窗口，测试面板移除旧电量描述。
- npm run check、test-electric-tiles（新增实际产出加速、范围外无效、10秒跨界精度、过期/暂停/商店/重置/移除/移动验证）、test-hex-campaign、preview-electric-tiles及preview-electric-campaign真实Edge/WebGL回归通过。本地未发布。


## 2026-10-22 本地：地块摆放不停音乐、成功后自动开战

- 正式地块准备只冻结玩法，音乐继续播放：准备标记在冻结前生效，syncMusic允许准备期间继续播放，避免先暂停再恢复音乐。手动暂停、静音和切后台规则保持。
- 成功拖放后清理指针捕获与选项，立即结束准备并进入本关，无需点击开始；无效落点和取消仍停留选择。满图无合法落点时保留开始兜底按钮，测试背包仍沿用手动开始/暂停。
- npm run check、test-electric-tiles、test-hex-campaign及preview-electric-campaign真实Edge/WebGL通过；新增音乐媒体时间持续推进/准备期间零pause调用/正常暂停仍停音乐/成功放置自动退出准备并启动各关卡分支验证。本地未发布。


## 2026-10-22 本地：精简地块选择信息

- 正式地块面板第一行改为“修改地形！”，每张卡片直接显示名称与简洁效果描述；回响/电池/涡轮统一以“虚线格子内的电能激荡格……”说明加成。底部只保留“拖拽格子以放置。”，隐藏楼层/次数/占地数/说明菜单及动态冗余提示。开始按钮在摆放完成后出现；选择与一次摆放规则保持。
- npm run check、preview-electric-campaign真实Edge/WebGL回归通过；已查看390×680截图，三列描述完整可见。本地未发布。


## 2026-10-22 本地：每关地块三选一、一次摆放

- 正式战前地块环节从第一关起生效：底部同屏三个选项，按当前场地过滤可放形状，随机不重复抽取；不足三种时补同类选项。无跨关库存，成功拖放一个后立即清空全部选项，并解锁“开始本关”。取消/无效落点保留原选项与本关机会，正式环节禁止移动/收回已有设施；已摆设施和扩张地板跨关保留，新局清空。
- 正式面板改地块三选一、每关1次提示，三列无横向背包滚动；测试入口仍保留补满/背包/移动工具。地图无任何合法落点时显示提示并允许开始，避免满图卡关。原13×11地图和商店地形更新时序保持。
- npm run check、test-electric-tiles、test-hex-campaign通过；更新preview-electric-campaign真实Edge/WebGL覆盖首关三选一、390×844/680三列、放错/取消不扣、一次放置锁定、跨关重新抽取、实际商店下降落地、普通/强建/Boss分支、新局重置及满图兜底，无脚本错误。已查看390×680截图。本地未发布，非手机实机验收。


## 2026-10-22 本地：两台厚血慢施工强建机器人

- 按新反馈将特殊关卡强建机器人5台减为2台，仍保留spitter/eye/moth三台弹幕辅助，总5台。强建生命从普通远程怪3倍提高至6倍（原生命翻倍），施工8秒延长至16秒，面板从配置读取秒数。普通关卡中的该怪同步采用厚血慢施工参数；144起手/216打断、3秒施工后冷却保持。
- npm run check、test-builder（方格/六角验证6倍生命、15.9秒尚未完成/16秒完成、144/216及手枪击退持续）、test-hex-campaign通过；preview-builder-room真实Edge/WebGL验证两台同时施工、最终改造两格、3台辅助真实弹幕、全5台杀光结算、双窗口与无GL/脚本错误。未发布。


## 2026-10-22 本地：强建施工距离与弹幕辅助

- 按新反馈，强建测试关卡保留5台强建机器人，新增3台固定弹幕辅助（脉冲哨机spitter、eye、moth各1台），不追加追逐怪/常规波次，全部8台击败后结算；URL/F2入口和正式替代分支共用配置。
- 强建机器人workRange从72加倍至144；开始施工后可维持到216（施工距离×1.5），手枪击退越过144仍持续计时/光束。超过216重置施工进度，飞回144才能重新开始；目标失效、死亡、暂停/眩晕规则保持。此距离调整同时作用于普通关卡中的强建机器人。
- npm run check、test-builder（方格/六角均验证144起手、真实手枪击退持续、216边界、217打断及返回重启）、test-hex-campaign通过；preview-builder-room真实Edge/WebGL验证8台构成、5台施工/5格改造、辅助实际14发在场弹幕、无额外增援、杀光结算与双窗口，无脚本/GL错误，已查看施工截图。本地未发布。


## 2026-10-22 本地：强建机器人特殊测试关卡

- 暂停正式流程中原 floor%4 火力封锁分支，改为固定5台强建机器人；BOSS/黄金猎场仍优先分流。原火力封锁实现保留，当前不由正式流程触发。关卡无倒计时、不补刷普通怪/追逐怪，全部击败后正常结算，施工沿用8秒将玩家附近普通地块改为地刺，保留保护设施/特殊格和击杀中断规则。
- 新增 ?builderlab=1 直达B4测试局及F2装备面板“强建机器人关卡”入口；测试局不更新纪录，重开回普通流程。正常关卡保留战前布置。
- npm run check、test-builder（方格/六角均新增仅5台、无炮台/混怪、实际改造、暂停、65秒不超时、杀光结算、入口/重置验证）、test-hex-campaign、test-electric-tiles、test-gpu-residency通过。preview-builder-room真实Edge/WebGL验证URL/按钮入口、5台施工与5格改造、无增援、杀光结算及390×844/680；preview-electric-campaign同步更新B4/B8预期并通过。已查看builder-room-working-390x844截图，无脚本/GL错误；本地未发布，非手机实机验收。


## 2026-10-22 本地：电荷接近医疗包大小与放电延长

- 电荷拾取物核心由12宽改30宽、16.5高、24深，接近医疗包32×14×26；外围光环18→36宽，悬浮中心14、辉光12，仍共享同一residentMesh。拾取半径/产出/伤害保持。
- 统一DISCHARGE_TIME=0.8秒：闪电链0.2→0.8秒，周身电环与粒子0.25→0.8秒，复用电击枪特效；正式beam damageApplied维持只伤害一次，无持续电击增伤。
- npm run check、test-electric-tiles与preview-electric-pickup通过。新增模型36宽轮廓断言、0.5秒仍有闪电/电粒子、延长期间敌血固定494及0.85秒后回收验证；主武器/拾取原点与无目标伤害规则继续通过。已查看放大电荷及electric-charge-discharge-0_5s-390x844截图，未发布。


## 2026-10-22 本地：拾取放电复用电击枪特效

- 删除电荷拾取放电的自制5段简单电弧，直接复用tesla_t3雷鸣电弧枪的drawModelShot/electricPath/modelBeam双股动态电弧、白色亮芯、命中辉光；角色拾取脉冲也复用drawElectricRing周身断续电环及共享电粒子纹理。仅传绘制代理的evolution，不修改正式伤害弹字段，拾取/射程/连锁/6伤害/主武器CD规则不变，无额外电环伤害。
- npm run check、test-electric-tiles（新增两种绘制路径顶点/辉光完全一致及不修改伤害弹断言）、test-weapon-vfx、preview-electric-pickup与preview-electric-tiles通过。真实Edge确认共享electricTexture和12个电粒子、未拾取伤害0、拾取后500→494、主武器不变及GL无错误；已查看electric-charge-collected-discharge-390x844。未发布。


## 2026-10-22 本地：电塔改为拾取电荷后放电

- 根据用户反馈移除自动防御塔机制及立体塔模型，玩家名称改“电能激荡格”（内部tower键兼容现有布局）。贴地闪电图标每4秒生产1份可积累电荷；无敌人照常生产，未拾取绝不发射/伤害。角色走近24单位拾取1份，从角色位置释放一次闪电链，最多5敌人/首选420范围/后续135距离/基础伤害6；每份只消费一次，堆叠产品以0.25秒拾取间隔逐份处理。无目标也消费并显示角色放电脉冲，不生成无效伤害弹。主武器及其冷却独立。
- 电池/涡轮改为缩短产出CD；回响线圈在正常产出后0.18秒追加产物，不自动攻击、不递归回响。产品以共享residentMesh悬浮电荷/地面存量点显示，地块仍可穿行。新战斗重置产品与生产统计；移动设施保留其当场存量、移除设施取消未完成回响。编辑器改待拾取/产出CD说明，取消地块自身射程圈及“射程420”卡片提示。
- npm run check、test-electric-tiles、test-gpu-residency、preview-electric-tiles与preview-electric-campaign通过。新preview-electric-pickup真实Edge/WebGL验证生产后伤害0、可见产品、无塔模型、走近拾取一次、发射原点为角色、主武器和开火时钟不变、实际敌人500→494、GL/脚本无错误；已查看electric-charge-awaiting-pickup/collected-discharge截图。补充单测覆盖无目标生产/消费、暂停/商店冻结、非递归回响产物与房间清理。已重启4173本地服务，未发布，非手机实机。


## 2026-10-21 本地：关卡开始前正式布置阶段

- startWave入口接入ElectricEditor.prepareFloor：正式局第一关跳过，从第二关起在落地/商店地形闪烁结算完成后进入战前布置，未刷怪、未启动本关计时/饮品/电池等战斗初始化。准备时暂停游戏并屏蔽暂停快捷入口绕过；点击“开始本关”隐藏编辑UI并仅一次继续原startWave分流（普通/生存/黄金猎场/Boss）。
- 正式准备UI显示楼层与开始本关，隐藏收起、扩建6格/补满/靶群等测试入口，保留横向库存、地块扩张/设施拖放/说明。背包与摆放跨关保留，不自动补满；新局重置。电力测试模式保留独立开始/暂停测试，不触发正式准备，不改变正式局testMode与纪录逻辑。
- npm run check、test-electric-tiles、test-hex-campaign及preview-electric-tiles通过；新增preview-electric-campaign真实Edge验证第一关跳过、商店退出下降/落地及地形更新后进入第二关、暂停/刷怪冻结、真实拖塔、确认开战、同关不重弹、3/4/7/8层全部房间分支、库存/摆放保留与重开重置，无脚本错误；已查看390x844准备画面并保存390x680截图。本地未发布。正式流程请从根URL进入，electriclab=1仍为测试模式。


## 2026-10-21 本地：地图外作用格与拖拽扩地

- 辅助设施作用域不再按已存在地板过滤，完整显示所有邻接作用虚线格；整理镜头预留地板周围一圈空间。地图固定13×11规则保持。
- 背包新增8件普通单格地块，可左右浏览、向上拖至已有地板六方向邻接空位拼接。拖动地块时显示可拼接空位，绿/红判断现有占用、邻接与固定地图边界；成功创建无随机机关的普通地板并扣1库存，取消/无效落点不扣。新增地板支持正式行走与继续摆设施，补满背包可补充地块。
- npm run check、test-electric-tiles、test-hex-movement与preview-electric-tiles通过。真实Edge/WebGL新增鼠标/模拟触屏扩地、占用/离散落点拒绝、取消库存守恒、扩地后摆电塔、6个完整作用格及地图外虚线实际顶点验证；原遮挡/滚动/实战/GPU回归继续通过。已查看electric-floor-expansion-390x844，未发布，非手机实机验收。


## 2026-10-21 本地：静止逐格作用域

- 按用户新反馈取消作用域虚线流动与合并轮廓。背包辅助设施每个outputs格单独绘制静止虚线六边形，自身占地继续实线；地面显示同一组实际存在的邻接作用格，逐格保留内部边界。电塔攻击半径保持静止范围圆，红绿放置闪烁保持。移除不再使用的轮廓合并逻辑与CSS动画。
- npm run check与preview-electric-tiles通过：四类卡片影响格数量符合outputs、虚线无动画、暂停前后范围顶点相同而放置透明度仍变化；原滚动/拖拽/遮挡/三窗口/实战/GPU恢复通过。已查看更新electric-drag-valid-flow截图，未发布。


## 2026-10-21 本地：横向设施背包

- 背包改为单行横向ScrollView，卡片固定132px宽，预览48→88px，保留真实占地与流动影响虚线。左右拖动浏览/滚轮横向滚动，向上拖出放置；首段移动方向区分滚动与摆放，点击查看说明，取消不消耗库存。保留地面设施拖回背包。
- npm run check与preview-electric-tiles通过，新增单行溢出/固定卡片尺寸、鼠标水平拖动与CDP触屏左右滑动不误放置验证，其余拖拽/遮挡/战斗/GPU回归通过。已重启4173本地服务并请求打开更新测试页，未发布。


## 2026-10-21 本地：修正设施遮挡与背包占地缩略图

- 用户截图中的白色地格边覆盖电塔，原因是可见地面标记位于独立SVG屏幕层。改为WebGL地面透明三角面与线段，复用现有深度测试/透明渲染管线，在电塔和角色之后绘制时仍正确被实体遮挡；SVG只保留透明地板拾取多边形。红绿闪烁和作用域流动改为performance.now驱动，暂停整理仍连续播放。
- 背包保持普通四列Grid卡片，卡片内显示真实固定占地六角形、每格设施图标，以及合并邻接影响范围的流动虚线。与地面共用六角外轮廓计算；电塔大范围在卡片中以示意圆加“射程420”标注，地面仍为真实420投影范围。
- npm run check、test-electric-tiles、preview-electric-tiles通过。真实Edge/WebGL新增塔身5个高度像素在开启/关闭地面标记时完全一致的深度遮挡验证、四类卡片占地数量/流动范围、暂停地面动画有限几何检查；保留鼠标与CDP触屏拖放/取消、三窗口、战斗和GPU恢复验证。已查看electric-tower-depth-390x844与electric-backpack-390x680，无脚本/GL错误；未发布，非手机实机验收。

## 2026-10-21 本地：卡片背包、闪烁落点与流动作用域

- 按用户反馈将库存改为普通四列GridLayout卡片，不再模拟背包内部六角占地；保留设施实际地面占地及拖拽操作。移除光标旁悬浮预览，只在地面显示有效绿色/无效红色占地，以CSS动画持续闪烁，暂停摆放时仍播放。
- 选中设施或拖至地板时显示青色流动虚线作用域。电池、涡轮、回响按实际邻接地块合并外轮廓，去除内部边线；电塔显示420攻击范围投影圆。虚线只作展示，不截断地板拾取事件。
- npm run check、test-electric-tiles、preview-electric-tiles通过。真实Edge/WebGL验证普通卡片库存、无浮动预览、红绿有效性、暂停时透明度与dashoffset实际变化、闭合范围轮廓、鼠标/CDP触屏拖拽与取消、库存守恒、三窗口、实战伤害及GPU恢复，无脚本/GL错误。已查看electric-drag-valid-flow及electric-backpack-390x680截图。未发布，非手机实机验收。

## 2026-10-21 本地：设施背包拖拽与取消旋转

- 用户明确取消旋转，改为类似背包整理的拖拽放置。新增 dist/electric-editor.js，将编辑器与 electric-tiles 战斗模块分离。底部7×3六角背包预装两座涡轮、两组回响、两座电塔、三块电池，按真实固定占地拼放；拖出成功扣除一件，拖回背包收回。更多菜单可补充测试库存、收回选中、重置充能和添加靶群。
- 移除旋转、下拉菜单、点两次确认、移动工具。使用统一 Pointer Events 支持鼠标/触屏拖出、原地抓取移动（包括多格设施非锚点抓取）、取消拖拽；冲突/机关/地图外落点不扣库存、不改变原设施。拖动时显示绿/红占地及相邻作用范围。短屏整理时适配视野，把地板保持在背包上方；结束整理恢复战斗相机。
- 辅助效果改为固定形状周围一圈邻接生效，取消固定出口与朝向箭头，多个占地同时贴住同一电塔只算一个设施效果。电池/涡轮仍只给电塔供电，不给彼此充电；原战斗参数、非阻挡及贴地图标保持。
- npm run check、test-electric-tiles、test-hex-city/movement、test-builder、test-gpu-residency通过。更新preview-electric-tiles真实Edge/WebGL验证鼠标与CDP触屏拖拽、库存守恒、无效落点、取消、移动、收回、三窗口、实战伤害、邻接供电与GPU恢复，无脚本/GL错误。已查看electric-backpack-390x680及electric-backpack-touch-390x844；非手机实机。未重新打包或发布。

## 2026-10-21 本地：电塔设施与地板摆放测试

- 新增 dist/electric-tiles.js，由 hex-loader 加载。主地图右侧“地块测试”或 ?electriclab=1 进入暂停摆放；选择设施后点地板预览、再点确认，支持六向旋转、选中移动、移除、扩建6格空地、添加靶群、重置本场充能与开始/暂停测试。测试局不记纪录，未接普通商店。
- 单格电能激荡塔：共享 residentMesh 常驻三维模型，4秒一道闪电、首目标420范围、最多5目标/后续135连锁距离，沿正式shots伤害/死亡/奖励管线，不攻击敌方不可摧毁炮台。双格回响线圈：宽侧出口电塔额外延迟0.18秒攻击一次，额外攻击不再触发回响；多线圈按次数追加。单格电池：0.8秒供电、每次减少出口电塔1.5秒CD、每场4次。三格三角涡轮：首次6秒，每次供电后间隔乘0.82，最低0.8秒，供电同样减少1.5秒CD。
- 辅助设施均为贴地扁平图标/进度环，无立体建筑；包括电塔在内全部不新增角色或敌人碰撞。固定出口配合多格占地限制围绕主塔吃满辅助。电池/涡轮仅供电给电塔，不互相充电。楼层间保留摆放，新战斗重置电池电量/涡轮启动；暂停、商店、下潜冻结，新局清空。现有医疗/护盾/机关及新设施互斥，建造机器人和随机地块奖励不能覆盖设施。
- npm run check、新 test-electric-tiles（接入runner）、test-hex-city/movement、test-builder、test-gpu-residency、test-shock-tile、test-terrain-shop通过；npm test仍在既有test-63的 shelf hides identity and stats 失败。preview-electric-tiles真实Edge/WebGL覆盖点击预览/放置/旋转/扩建/移动/移除/暂停运行、实际闪电伤害与回响、全设施可穿行、三窗口布局及GPU恢复，无脚本/GL错误。已查看electric-placement-390x844/390x680与electric-combat-390x844截图。
- 默认值是首轮测试数值，未实现暴击分叉、塔间供电接力或额外设施。未重新打包/发布，非手机实机验收。保留此前hex-map与特殊关卡的本地修改。

## 2026-10-21 本地：特殊关卡六角地图修复

- 真实Edge/WebGL截图确认火力封锁仍绘制基于完整矩形A的悬空长轨，旧炮台将未排序外露边当作移动路径，会跨侧跳位；黄金猎场逃跑仍受矩形边界推力/钳制影响，与已解锁六角地面约束冲突，持续顶边。修复集中在hex-map适配器，保留原方格源码。
- 炮台按四侧实际外轮廓生成可支撑完整16半径的连续轨道，凹角通过内部相邻地块/三格交点连接，绘制和定位共用同一路径；按真实路径长度105单位/秒连续折返，大dt不越界，地块增减使缓存失效。八台临时炮台、射击、不可攻击和正常退场规则保持。
- 金蛛避边依据实际六角外露边，完整23半径沿边滑行，移除旧矩形钳制；保留随机转向、玩家/同类避让、运输入场、15秒时限和逐只奖励。
- 新test-hex-special接入runner，覆盖初始9格、完整13×11及凹形缺口地图：炮台持续速度/支撑/折返/大dt、五只金蛛各30秒运动与全身落地、扩建缓存更新。npm run check、test-hex-terrain/movement/campaign、test-greed-room、test-enemy-transports及test-gpu-residency通过。完整npm test仍在既有test-63的shelf hides identity and stats失败，日志tests/hex-special-regression.log。
- 新preview-hex-special保存修复前及修复后初始/44格地图三窗口截图，真实浏览器验证八炮台支撑/实弹、金蛛落地运动、暂停、实际武器击杀获奖、超时保留赏金、耐久结束清临时炮台与GPU重建，无脚本/GL错误；日志tests/hex-special-browser.log。已查看两关扩建版390×844截图。桌面浏览器验收，未打包/发布。

## 2026-10-20 本地：三阶段死亡、厚烟雾与血条脱落

- 用户确认同时覆盖玩家、普通敌人、BOSS。新增共享deathBursts：前65ms短促白热闪、25ms起手绘能量爆裂+18/30条高初速强阻力直射火星，随后深浅软边烟团与有正常光照的半透明三维烟核叠加、上升消散。普通1.05秒/玩家1.65秒/BOSS2.85秒；复用原方块碎屑、普通怪灼热冷却与金钱奖励，16个死亡层发射器上限，烟核几何以有限离散透明度键residentMesh共享。
- BOSS由原两秒闪烁完整机体改为55ms白闪后迅速解体，保留3秒结算演出与既有胜利/清理回调；多部位最多4个烟雾发射中心，解体碎块继续使用原共享常驻几何，战斗和攻击在死亡期间仍冻结。玩家仍保留2秒信号中断UI延迟，粒子和新增死亡层以真实时间推进。
- 世界血条按角色身份记录布局，真实扣血（含致命一枪）生成1–3段损失血条带短拖影下落、0.48秒回收；新血量端点0.2秒纵向白亮线跟随血条当前位置。玩家、常规怪、运输机货物及各BOSS/召唤物血条接入；不为不可破坏陷阱生成血条。顶部BOSS长血条也立即扣血、分段脱落及竖向边缘闪光，暂停冻结，回血/重复绘制不重复发射；世界血条效果总96项、顶部24项上限，重开清空。
- 新增test-death-feedback并接入runner，更新test-campaign原“机体保持两秒/交替闪烁”断言以匹配用户新节奏。npm run check、test-death-feedback、test-player-death、test-92/94、test-juicy-pistol、test-enemy-transports、test-gpu-residency及test-hex-campaign（完整8路线6种BOSS）通过。完整npm test仍在既有test-63的shelf hides identity and stats失败，见tests/death-feedback-regression.log。
- 新增preview-death-layers，真实Edge/WebGL分时截图验证三类死亡闪/爆/烟、机体迅速解体、血条掉落与新端点高光、三窗口有限几何且GL/脚本无错误。已查看death-layers-enemy-0_4、death-layers-boss-0_5、health-bar-falling-390x844；第二轮加强BOSS烟雾三维核与竖向堆叠并重拍检查。本地未打包/发布，刷新游戏后生效，非手机实机验收。

## 2026-10-20 本地：修复入口右边缘空背景与下部截面

- 用户标注的右侧竖条来自入口透视镜头超出原战斗城市的有限楼群范围。新增3组入口专用外围建筑，复用原城市第6/7/4栋完整三维网格，延伸至右侧画外、底部至Y=-6500～-7200，沿原窗灯/切面/距离雾绘制；主流程城市不受影响。
- 入口revision v4。静态复制网格只在构建/上下文恢复时上传；preview-title-screen新增右边缘2%/25%/50%/75%/98%高度的实际楼体三角形覆盖检查，三个窗口均通过，防止只靠平面或单次截图掩盖缺口。原布局/中央塔/远车/上下文恢复/主流程切换检查继续通过，无GL或脚本错误。已查看最新实景，未发布。


## 2026-10-20 本地：入口收回近景车雨并平衡右侧构图

- 按用户反馈去掉78根近处粗雨线和4辆放大近景车。车流改40辆中远景，Z≤-650、缩放≤1.1，最大投影宽度小于画面3.5%；3层纹理雨幕退到城市中远处并降透明度，屏幕雨滴17→5颗、尺寸和亮度减小。
- 右侧前排楼体在入口中向中心移155世界单位并提升屋顶，后排右楼提高；左侧超高楼略收敛，形成两侧框景、中间留出主塔和雾中纵深。保持平面生图标题、中央塔顶中心位置、远景雾与原战斗场景。
- npm run check与preview-title-screen真实Edge/WebGL通过：3窗口布局/主塔位置/高低楼、远景车投影上限、5颗非交互雨滴、静态缓存、上下文恢复、进入原主流程及实验室兼容，无脚本/GL错误。已查看更新tests/neon-title-390x844.png，未发布。


## 2026-10-20 本地：入口平面生图LOGO、层次楼群与近景雨雾

- 按用户反馈使用内置image_gen重新生成平面青粉彩虹字标，只保留细边；透明RGBA 2172×724，dist/assets/neon-tower-logo-flat.png。主入口h1只承载该图片，不再由字体或SVG拼标题。最终提示词保存tests/neon-title-logo-prompt.txt；第一轮较立体的废稿未接入。
- 入口仅排除orbital串珠圆盘塔，不影响战斗城市；楼群按各自原建筑网格范围拉开高度，立面广告同步变换，超高楼出框与较低屋顶并存，中央塔顶设为世界Y=-390，在三个窗口均投影到屏幕中心附近。原城市网格补充高度/边界元数据供入口读取。
- 独立44辆入口车流：远26、中14、近4，复用8类resident模型；近景2.2–3.5倍并靠近镜头，实际平均投影宽度至少远车5倍。入口3层雨幕加粗加近，78根前景雨线、17颗非交互屏幕雨滴、9组世界薄雾和54颗弱光微粒。
- renderer主/常驻着色器新增sceneFogView可选视线向量，默认精确保留原俯视相机参数；入口传入平视相机并提高远景雾浓度。离开标题恢复默认，静态城市/雨幕缓存与上下文恢复不变。
- npm run check、test-gpu-residency、test-hex-city/campaign通过；preview-title-screen新增3窗口中央塔/高低楼、前后车投影比例、平面PNG载入、雾相机参数、屏幕雨滴非交互和进入主流程恢复验证，含真实Edge/WebGL恢复/实验室兼容，无GL或脚本错误。已查看最新实景并另开入口预览，保留用户原B03商店局。未发布。


## 2026-10-20 本地：运输无人机血条补漏

- 原因：运输敌人跳过普通敌人绘制（含血条），drawEnemyTransports 仅补机体/吊挂模型，可攻击运输机缺少血条。运输机上方新增共享常驻怪物血条，读取 cargo.hp/max，显示运输阶段实际血量；落地后仅显示原地面血条，空机飞离/击毁不显示。
- npm run check、test-enemy-transports（新增全部10种货物的半血/挂点/落地/空机/击毁回归）、test-gpu-residency、test-hex-campaign通过；preview-enemy-transports真实Edge/WebGL验证半血/满血、三窗口、拦截/常驻复用及无脚本/GL错误，已查看tests/transports-390x844.png。本地未发布，非手机实机验收。

## 2026-10-20 本地：霓虹高塔三维进入界面

- 主入口命名为“霓虹高塔 / NEON TOWER”。新增 title-screen.js/css：青→蓝→紫→粉彩虹字标与矢量高塔标记，进入游戏复用 industrial-ui 的蓝色切角 primary 按钮，技能加点/试验场入口保留在底部。
- 入口直接渲染 orbital 城市原三维网格、广告、8类共享常驻悬浮车与分层雨幕，独立接近平视的透视镜头和轻微横移；中央六面高塔由现有网格原语搭建。无需背景整图。捕获六角适配器压缩前的原始城市构造器，正确提取 cityFogRange，排除入口无关的地平面和平台侧牌外壳。静态几何/雨幕只上传一次，恢复上下文后重建。
- 仅 state=menu 使用入口；开始后恢复原战斗镜头、HUD、固定13×11范围与初始9格；实验室独立入口不启用标题镜头。
- npm run check、test-hex-city/campaign、test-gpu-residency、test-enemy-transports通过。新增 preview-title-screen 真实Edge/WebGL验证390×844、390×680、1280×900布局、三维缓存/8类车流、上下文恢复、进入主流程及实验室兼容，无脚本/GL错误；已查看 tests/neon-title-390x844.png。桌面浏览器验证，未发布。


## 2026-10-20 本地：夸张抛壳与纯白短促受击

- 基础手枪弹壳侧抛初速100–155→220–310，后抛25→40，竖直初速100–145→170–205，空气阻力2→1.45，旋转初速提高到随机正负26–40。仍保持重力420、弹跳/1.7秒回收/40上限/首次落地一次声音。新增age记录及starterCaseScale：初始2.2倍，随飞行指数缩至约0.85倍，末0.25秒归零，常驻共享网格不变。
- 敌人受击从淡青材质提亮改纯白：命中前12ms全白，接着43ms二次衰减回原色，55ms白色完全结束；既有140ms小幅模型抖动保留。动态网格hitModel与residentMesh/附属发光点同步，常驻实例通过已有white通道在光照后混白，GPU固定几何不重建。激光怪底座原先把整个反馈对象当flash布尔值，改传完整反馈以便正确恢复。
- npm run check、test-92/94（随纯白语义更新）、test-juicy-pistol（新增大壳/高弧/远抛/飞行缩小）、test-gpu-residency、test-weapon-vfx、preview-juicy-pistol通过。新增preview-hit-white真实Edge/WebGL读取敌人模型区域像素，命中帧747个RGB>=250纯白像素、30ms剩余白强度0.338、60ms归零；实际抛壳2.2→1.30→0.96倍、0.45秒侧移90/高度69，并保存检查hit-white与casing-arc截图，GL/脚本无错误。全量npm test仍停在既有test-63商店断言，日志tests/juicy-regression.log。未打包或发布，本地页刷新后可用。

## 2026-10-20 本地：弹壳独立音量

- 用户要求弹壳落地声音也可调大小。音量面板新增“弹壳落地”0–100%滑条、百分比及试听按钮，默认55%，soundLevels新增casing字段并复用既有自动保存键；旧存档缺字段时使用默认，不改变开枪/命中的已存数值。
- 实际首次落地与20项素材试听使用casing独立增益，滑动会15ms平滑更新正在播放的弹壳声源，开枪/命中音量互不影响，总静音优先。
- npm run check、test-juicy-pistol及preview-sound-settings通过；真实Edge新增独立0/99%增益、弹壳试听、37%刷新恢复、其他通道不变及三窗口布局验证，已查看更新tests/sound-settings-390x844.png。未打包/发布，本地页刷新后可用。

## 2026-10-20 本地：20段弹壳落地素材库与首次落地音效

- 按用户要求把Bullet Impacts & Flybys/Bullet Falling on Metal的10段WAV和Real Recorded Guns/Bullet Falling on Concrete的10段WAV全部复制到dist/assets/audio/bullet-falling-metal与bullet-falling-concrete；原始字节SHA256逐文件匹配，Unity .meta不作为游戏素材导入。混凝土组保留原手枪5/步枪3/霰弹枪2的名字，界面共20项，按金属/混凝土分组。原音频库文件未改动。
- 音量面板增加下拉选择、试听选中、上一段/下一段。选择立即用于基础手枪弹壳首次触地，并通过hell-elevator-casing-sound-v1按资源URL自动保存，刷新恢复；默认金属1。与命中音效共用已保存的命中音量，遵守声音总开关。试听切换/关闭取消旧试听和过期加载，按需fetch+解码并缓存，正在加载的选择不会补播过期落地事件。开火时预加载当前弹壳音效。
- updateParticles仅在casing的bounces从0到1时调用playCasingLanding；后续弹跳/停留/缩小回收不再触发，即使第一次落地静音也不会在取消静音后补播。20项资源URL为显式常量，现有WAV离线内嵌流程可覆盖。
- npm run check、test-juicy-pistol新增一次落地事件回归、test-weapon-vfx通过。preview-sound-settings真实Edge逐个选择并解码试听全部20段、缓存复用/上一下一、选择保存刷新、实际弹壳多次弹跳只播一次，以及原音量/静音/损坏存储/三窗口布局通过；已查看更新tests/sound-settings-390x844.png。全量npm test仍有既有test-63商店断言失败，日志tests/sound-settings-regression.log。未重新打包或发布；本地预览刷新后可用。

## 2026-10-20 本地：强建机器人

- 新增 builder“强建机器人”，从第7层起进入普通远程怪池（当前流程首个可遇到的普通战斗层为B9），压力4、普通远程怪3倍生命、碰撞半径22。自身悬浮飞近玩家附近的普通地块，速度58，距目标72单位悬停；不走地面运输机，不发射伤人弹幕。
- 锁定地块后红激光持续8秒，显示红色施工环、进度条与火花，完成后设置原生地刺trap.clock=0，沿用安全/预警/激活伤害循环及拆除规则；冷却3秒后重新选点。玩家移动不改变当前施工目标。施工中击杀取消未完成改造；暂停/眩晕冻结进度。多个机器人避开存活同伴已占目标，目标消失或变成功能地块时清零重选，特殊功能格与现有陷阱不覆盖。
- 黄铜重甲、双蓝色推进舱、红色传感器/施工发射器，身体/施工环/光束共享residentMesh常驻，朝向跟随目标；tile中心表达式复用正式HexMap转换，方格对照与六角入口均可用。
- 新增test-builder（接入runner前序）覆盖两种地图的刷怪/血量/飞行/选点/完整8秒/冷却/暂停眩晕/实际玩家射杀中断/地块变更/保护/互斥/常驻复用；npm run check、test-gpu-residency、test-hex-campaign通过。preview-builder真实Edge/WebGL三窗口验证施工/精确完成/常驻复用/GPU重建/无脚本与GL错误，已查看tests/builder-working-390x844.png。完整npm test仍在既有test-63的shelf hides identity and stats断言失败，见tests/builder-regression.log。本地修改，未打包或发布，非手机实机验收。

## 2026-10-20 本地：方格机关全面适配六角地块

- 保持共同 game.js 与方格封存入口，改动集中在 hex-map 适配器。地刺由3×3改为2/3/2七根，底板和警告填充改六边形，实际伤害与滑板危险范围跟随六角边界。
- 固定/环绕电锯与轴向飞轮的底板、扩建/拆除闪光、印钞铲击外圈改为六角；普通格角落节拍灯移入轮廓，震荡格四灯改六灯。原补给/震荡进度填充与中心/格子拾取已适配，圆形范围技能与环绕电锯保留原半径玩法。
- 掩体改共享常驻六角柱模型，六面半平面判定、连续线段扫掠、斜面滑动与六向重叠排出一起接入，仍保留原耐久/拆毁/修复。飞轮沿实际已解锁地面可容纳完整碰撞半径的连续轴线折返，不跨缺口/脱离边缘；炮台定位按实际六角外露边界并保留无敌陷阱规则。
- npm run check、test-hex-terrain（新接入runner）、test-hex-city/movement、test-hex-campaign、test-enemy-transports通过。preview-hex-city与新增preview-hex-terrain真实Edge/WebGL三窗口通过：七根刺实际渲染、旧方格角不伤/六角尖端实扣血、混合机关、红色预警与无脚本/GL错误；已查看hex-terrain-390x844.png。完整npm test仍在既有test-63“shelf hides identity and stats”失败，日志tests/hex-terrain-regression.log。未重新打包或发布，非手机实机验收。


## 2026-10-20 本地：Pistol Shot_24 与音量自动保存面板

- 用户指定Pistol Shot_24.wav按原样导入dist/assets/audio/pistol-shot-24.wav，基础手枪开火采样切换至该文件（约1.524秒），命中Metal Light 6保持。
- HUD新增“音量”按钮，打开非模态基础手枪音量面板：开枪/命中分别0–100%，默认48%/55%，独立试听按钮。拖动input立即更新后续和仍在播放的对应采样增益（15ms平滑），音乐沿原总声音开关；静音优先，试听静音时提示先开启声音，调整滑条不自动取消静音。
- 以hell-elevator-sound-levels-v1保存到localStorage，每次input自动写入，重开不重置、刷新恢复；类型/有限值校验及范围钳制，损坏存档回默认，写入被拒则明确提示本次有效未保存。共用合成开枪/命中后备音也按相应比例调整。
- npm run check、test-juicy-pistol、test-94、test-weapon-vfx及更新的preview-juicy-pistol通过。新增preview-sound-settings真实Edge验证原始24采样、滑条键盘操作、实际声源增益、独立保存/刷新恢复、面板开关、静音/试听、损坏存储恢复/范围钳制及三种窗口布局，无脚本错误；已查看tests/sound-settings-390x844.png。全量npm test仍在既有test-63商店断言失败，见tests/sound-settings-regression.log。未重新打包/发布，当前本地页刷新后生效。

## 2026-10-20 本地：手枪第二轮 Juicy 与指定采样音效

- pistol_t1 命中主轮廓峰值尺寸为上一版1.4倍，持续0.19→0.11秒；5种预定义手绘尖刺变体，每次生成随机0–360度朝向，保持帧间稳定。主形状保持不透明，以缩放归零消失，颜色提亮白黄，附13条短寿命小火花，保留24主迸溅/192火花上限。
- 基础手枪弹速680→1100；命中存活普通敌人沿弹道施加210初速、14/s衰减、0.15秒约13像素轻击退，复用掩体/六角地面边缘约束，BOSS/飞行运输阶段/导弹目标除外。弹壳改亮金自发光及淡金端盖，常驻共享与回收不变。
- 枪口除尖芒外加46世界单位镜头朝向圆形柔光、25点光晕和54地面暖色投影光斑，快速收回，模拟开火照明。
- 用户指定原始WAV按原样复制到dist/assets/audio/pistol-shot-19.wav和metal-light-6.wav，分别来自Pistol Shot_19和Metal Light 6。仅基础手枪使用，WebAudio预加载/一次解码/每次独立声源，开火音量.48、命中.55，命中45ms限频、共12声源上限、结束断开。静音/音频挂起不播放，未加载就绪时保留原合成音作为后备，不补播过期事件。离线打包器新增WAV内嵌支持，本地server添加audio/wav MIME。
- npm run check、test-juicy-pistol（实扣血、随机朝向/5变体、不透明缩放、击退/免疫、加速及原生命周期）、test-weapon-vfx、test-94、test-hex-campaign通过；preview-juicy-pistol真实Edge/WebGL验证两WAV解码/播放/命中限频、三窗口、特效与弹壳/碎块/跳字无GL或脚本错误，已查看更新截图。test-54的金钱浮字断言排除新增伤害数字，仍严格验证近战怪无现金/美钞；全量npm test继续通过此前序后，在既有test-63商店断言失败。本地未发布/未重新打包；用户当前预览保留原局，刷新后载入新改动。

## 2026-10-20 本地：基础手枪 Juicy、弹壳与伤害跳字

- 基础手枪 pistol_t1 枪口改为朝向随动的不对称尖芒，白热芯/橙金外沿、短促辉光及细小星屑；直接在现有透明通道绘制手绘轮廓，枪口贴实际枪管端点。其他枪型特效保留。
- 基础手枪实际命中使用三层不规则尖刺迸溅与九条橙金/白热火星，沿入射反向扇形飞散，沿用命中限频与192火花上限。每次主手枪开火侧抛一枚黄铜弹壳，重力/阻力、旋转、落地弹跳、尾段缩小及1.7秒回收，最多40枚，共享residentMesh。
- 敌人死亡碎块从白热到橙热再在0.52秒内回到原色；发光随热度减弱，离散24级颜色限制缓存，玩家死亡碎块不加热。
- 统一实际扣血管线加入伤害数字，包含击杀、主武器/无人机/范围攻击；普通浅色，暴击加大金色带!，同目标同种暴击状态65ms内合计，使用既有24项浮字队列、暂停/世界时间/重开清理和相机投影。原暴击提示及金钱文字保留。
- npm run check、test-juicy-pistol（新增并接入runner）、test-weapon-vfx、test-92/94/97、test-player-death、test-hex-city/campaign通过。完整npm test仍在既有test-63的 shelf hides identity and stats 失败，见tests/juicy-regression.log。
- 新增preview-juicy-pistol，真实Edge/WebGL三窗口验证实际扣血及DOM数字、火花/弹壳/热碎块有限数据、弹跳/回收/上限/重开/常驻复用与GL无错误；截图juicy-pistol-muzzle/impact/hot-fragments/cooled-fragments.png已查看。本地修改，未发布、未重新打包，非手机实机验收。

## 2026-10-19 本地：手电筒锥形辉光

- 用户认为前方贴图过细像激光，要求稍短、明确锥形。前灯长度210→155、半宽48→72；炮口长度170→130、半宽32→48。共享贴图改为窄灯口向外线性展开、锥体内部宽而均匀的亮度与柔边，后半段平滑消隐，去除原高斯细亮中心；竖向交叉面亮度降至45%，减少中心叠加亮线。原灯色与较弱圆形光晕保持。
- npm run check、test-starter-enemies、真实 Edge/WebGL preview-spitter-lighting 通过：三窗口、朝向跟随、纹理/常驻复用、GPU重建和无脚本/GL错误。已查看更新的 tests/spitter-lighting-390x844.png 确认宽锥形光区。本地未发布，非手机实机验收。

## 2026-10-19 本地：柔边贴图辉光与灯具本色

- 用户要求弱化圆形辉光、前方使用柔和贴图并避免惨白。spitter 前灯/推进器/炮口/顶灯光晕半径降至 7/9/7（蓄力10）/4；灯芯与辉光统一为青蓝 #16d6ed、蓝 #248aff、橙 #ff6a20（蓄力暖橙 #ff9a26）。
- renderer 新增 softLightBeam：128×64 共享程序化 RGBA 贴图，横向高斯柔边、前方渐扩与纵向平滑消隐，沿现有 sprite 着色器按灯色染色。替换分段透明光束为两盏青蓝前灯与一盏橙色炮口的交叉贴图平面；前灯长210/半宽48、炮口长170/半宽32，保留朝向跟随机身。纹理初次上传，CPU 像素缓存及GPU重新初始化恢复接入。
- npm run check、test-starter-enemies、test-gpu-residency 通过。真实 Edge/WebGL preview-spitter-lighting 验证三窗口、彩色贴图/有限坐标、纹理复用/GPU重新初始化重建、方向跟随及无脚本/GL错误；已查看更新的 tests/spitter-lighting-390x844.png。本地未发布，非手机实机验收。

## 2026-10-19 本地：无人机可拦截、旋翼加大收紧、抵达直接生成

- 按用户反馈，运输无人机进入可攻击区域后纳入原有就近自动瞄准/弹道/激光/连锁等目标。运输中的怪物作为同一份人数/奖励实体承担无人机生命，目标坐标按 renderer.vp 投影到共享子弹平面，射击命中点对应屏幕上无人机机身，而非预定落点。受击机身闪白；击落时爆炸并取消所载怪物的投放，只结算一次原怪物奖励，金蛛赏金也只结算一次；成功抵达时生成原血量地面怪物。
- 旋翼半径 18→25、桨叶直径 30→44，横向中心间距 90→70、纵向 70→58，机臂缩短并加粗，保持小型四旋翼轮廓但旋翼更明显紧凑。原怪物仍在下方可见，机头朝向目的地、5.2 秒平滑进场不变。
- 删除投放下降阶段、进场高度下坠与落点指示圈；机体/所载怪物全程保持高度，抵达边界的瞬间直接生成可行动地面怪物，无额外行动缓冲，随后无人机松脱飞离。掩体变化重选落点、原浮空怪物及普通战斗不变。
- npm run check、test-enemy-transports、test-hex-campaign、test-timed-floors 通过；真实 Edge/WebGL preview-enemy-transports 覆盖三窗口、四桨动画、常驻复用、直接生成、自动瞄准激光真实拦截和屏幕投影命中对齐，GL/脚本无错误。已查看 transports-390x844.png 确认旋翼紧凑、怪物悬挂、无指示圈，另存 transports-intercepted.png。本地未发布，非手机实机验收。

## 2026-10-19 本地：前方辉光继续拉长拉宽

- 用户明确重点是前方辉光。spitter 前灯光束长度 96→210，末端水平半宽 18→43、垂直半高 10.5→22；衰减指数 2→1.35，使中远段更明显并保持末端归零，机身各处光晕半径保持。
- npm run check、test-starter-enemies 与真实 Edge/WebGL preview-spitter-lighting 三窗口通过；已查看更新的 tests/spitter-lighting-390x844.png。朝向跟随/常驻复用/GL 正常，本地未发布。

## 2026-10-19 本地：弹幕哨机大范围赛博辉光

- 按用户要求明显放大 spitter 光晕：前灯半径 4→18、推进器 5→24、炮口 4.5→20（蓄力 7→30）、顶灯 3→12；推进器改更饱和的青蓝。前方渐隐光束长度 58→96，横向/竖向扩散约翻倍，起始透明度 .19→.26，灯位继续跟随朝向玩家的机身。
- npm run check、test-starter-enemies、preview-spitter-lighting 通过。真实 Edge/WebGL 三窗口、朝向跟随、常驻复用及无脚本/GL 错误；已查看更新的 tests/spitter-lighting-390x844.png，大范围蓝白辉光清晰可见。本地未发布，非手机实机验收。

## 2026-10-19 本地：初始弹幕哨机朝向玩家与灯光

- spitter 悬浮哨机以本地 +Z 朝向玩家，按实际世界纵深 1.06 修正方向，持续随玩家位置更新。仅改该初始弹幕怪，实体继续 residentMesh 共享常驻网格。
- 前方蓝色灯条新增与城市飞车相同的交叉分段渐隐蓝白光束，侧推进器、橙色炮口和顶灯添加光晕；全部灯光使用同一机身变换与悬浮高度，蓄力炮口变亮。
- npm run check、test-starter-enemies（新增五向朝向/渐隐/灯点检查）、test-hex-city/movement、test-gpu-residency、test-enemy-transports 通过。新增 preview-spitter-lighting 真实 Edge/WebGL 验证跟随玩家、常驻复用、蓄力变体、三窗口及无脚本/GL 错误；已查看 tests/spitter-lighting-390x844.png，另存 390x680/1280x900。未发布，非手机实机验收。

## 2026-10-19 本地：运输机改成小型四旋翼无人机、慢速朝向运输

- 用户要求朝向目的地、缓慢运入、缩小体积，并明确看出是无人机。机体缩放为原来的 55%，去除飞机机翼/尾翼造型，改为紧凑中央吊装机身、X 形机臂、四个独立桨叶保护圈/电机、四套可见旋转十字桨叶、前方蓝色传感器与前后导航灯。四旋翼/灯/吊索挂点统一按飞行航向旋转；固定机体与共享桨叶几何 residentMesh 常驻，仅更新实例姿态。
- 提取 TRANSPORT_FLIGHT 与 transportPose：进场路径从 850 单位/1.8 秒的强减速突入改为 500 单位水平距离并带 100 单位纵深偏移、5.2 秒 smoothstep 平滑飞入，逐渐减速到目的地。机头本地 +Z 按真实运动向量朝向落点；投放 0.8 秒、松脱 0.3 秒、沿同一朝向继续平滑飞离 4 秒。怪物仍原尺寸悬挂、边界接地激活，浮空怪物不变。
- npm run check、test-enemy-transports（新增两侧/两纵深航向、连续速度上限、精确悬停、离场方向和缩放检查）、test-hex-campaign、test-timed-floors 通过。真实 Edge/WebGL preview-enemy-transports 三窗口通过，已查看 transports-390x844.png 确认四旋翼轮廓、缩小体积与原怪物悬挂；补充每架四桨、桨叶动画及常驻复用检查。本地未发布，非手机实机验收。

## 2026-10-19 本地：镜头继续拉近、增强呼吸与轻跟随

- 六角镜头基础scale从1降至0.9（再放大约11%），呼吸保留7秒周期，幅度从±0.8%增至±1.2%。按平滑后的关注点计算外围柱顶留边，扩建后适当放宽视野。
- hex-map内封装renderer.resize，在原投影矩阵上平移关注点，保留原震屏叠加。水平跟随人物位移22%、纵向18%，上限48/30世界单位；按游戏时间指数平滑（2.8/s），暂停保持、重开时间回退立即回正。背景/雨幕/世界倒计时与角色共享同一相机，屏幕UI不平移。原方格封存/显式实验室不变。
- npm run check、test-hex-city含movement、preview-hex-city和新增preview-hex-camera通过：拉近/呼吸/暂停、缓入跟随/幅度上限/复位、三窗口、原商店/战斗/扩建/网格。查看hex-camera-follow-390x844.png。输入移动回归主动清除遗留结算并阻止空场自动跳商店，避免验证过程中提前离开combat；未改游戏业务。
- 0.250.0离线/Web包重新生成，preview-map-promotion验证Web/file离线战斗/技能点/39武器/实验室正常、离线无外部HTTP请求，GL无错误。本地未发布，非手机实机验收。


## 2026-10-19 本地：地面怪物由运输机悬挂运至六角边界

- 六角战役的 crawler/bomber/ironball/ricochet/missile/laser/twinGun/lobber/stormCaller 以及贪财房机械金蛛改由运输机从场景外运入。按实际模型区分：spitter 是悬浮哨机，和 eye/skull/moth/suicideDrone 保留原刷怪；方格封存入口及独立场景/武器实验室沿原方式。
- 运输机下方全程显示原怪物 residentMesh 本体，金蛛复用身体/八腿/关节，不使用货箱替代。双吊索悬挂，1.8 秒飞入、0.6 秒降低怪物到地面、0.3 秒松脱、1.1 秒飞离；未投放前不行动/不开火/不进攻击目标，接地后可受击并有 0.65 秒行动缓冲。机体/怪物固定几何全部显存常驻。
- 落点从 HexMap.outline 的真实外露边界内缩怪物完整碰撞半径选择，检查完整地面支撑、掩体、玩家距离、已占用落点；无落点时保留原队列重试，金蛛等待可用落点。飞行中掩体变化则保留同一怪物重选，避免丢失金蛛身份/赏金。落地后的普通怪物及金蛛统一沿六角并集边缘扫掠滑动，弹跳机保留反弹。运输中仍计入人数/上限/清场判断；暂停、慢时间、超时清场、死亡及离层清理接入原时钟和生命周期。
- npm run check、test-enemy-transports、test-hex-city/movement、test-hex-campaign、test-timed-floors 通过。真实 Edge/WebGL preview-enemy-transports 覆盖三窗口、悬挂原怪物/蜘蛛腿、边缘投放、暂停/接地、浮空怪物、常驻复用与脚本/GL 无错误；已查看 tests/transports-390x844.png。preview-hex-city 也通过；其移动检查原先清空敌人和队列，会在慢帧等待按键期间提前清层，现保留一个待刷条目让移动检查维持战斗状态。完整 npm test 仍在既有 test-63 的 shelf hides identity and stats 断言失败，日志 tests/transports-regression.log。本地未发布，非手机实机验收。

## 2026-10-19 本地正式接入：六角柱体地图（0.250.0）

- 用户决定封存方格地图、正式使用六角柱体版。切换前完整dist/源资源及工具/配置/交接文档98文件封存至 archives/square-map-20261019-182429/square-map-snapshot.zip，ZIP内SHA256清单已逐文件验证；解压运行node server.mjs即可恢复当时原入口。dist/square-archive.html只作共享当前资源的对照入口，真正冻结版本以ZIP为准。
- 以当前index界面作为正式界面，主页加载hex-map/hex-loader，默认完整六角战役；去掉原“六角实验版”入口文案。hex-city.html保留查询参数/锚点跳转主页，现有链接继续工作。原game.js仍为共同玩法源，由正式加载器转换坐标/碰撞/相邻/场景，不维护复制的游戏逻辑；最高纪录沿六角键，技能点存档共用不变。
- 默认加载器补回scene-lab/weapon-lab；显式lab/weaponlab查询继续运行其原本的引擎/场景，避免预览场景无电梯壳时触发六角裁剪定位错误。正常战役启用柱体/升起/近镜/呼吸/深度修复。
- 离线打包自动发现全部模块、内联雨幕/场景/六角/鱼群/实验室与所有素材；提前生成相同六角引擎，单文件中同步注入，不再依赖fetch和动态外部模块。版本0.250.0的Web与offline ZIP均生成并校验，真实file://打开无外部HTTP请求、启动战斗成功。
- npm run check、test-hex-city含movement、test-hex-campaign（以真实六角转换引擎运行完整战役/商店/39武器/新增敌人）、test-talents通过；新增六角专项接入npm test前序。preview-hex-city通过正式主页三窗口、购买/扩容/战斗/移动/常驻/呼吸、旧六角地址跳转和方格对照入口；preview-map-promotion通过Web/离线、技能点、GL、武器/场景测试入口。实景map-promotion-web/offline.png。
- 完整npm test仍在既有test-63断言“shelf hides identity and stats”失败，与已有商店描述设计冲突，日志tests/map-promotion-regression.log。本轮更新战役测试对模块加载顺序的读取，以适配正式加载器。未发布线上、非手机实机验收。

## 2026-10-19 发布：Seedream装备独立图标

- 用户授权发布当前本地版本，沿用原公开站点 https://hell-elevator.wzyanggg.chatgpt.site，访问权限不变。Sites版本97，源码28524c5d252719e5d13bdcb6c23c6d9c565670c3，版本ID appgprj_6ac74d5c19748191bc27adbcb8926213~appgver_dbbbe885f1088191be67ec360f635bc8，部署ID appgdep_6ad5ee12c2bc81919dec053fc7fb11f5，返回succeeded。
- 发布副本npm run check、test-category-boxes、test-shop-stock通过；额外完整npm test在test-63旧断言“shelf hides identity and stats”失败：其要求完全没有shop-item-description，但当前商店已有描述文案。未改动该业务或测试。本次图标浏览器验证见下方拆图交接。
- Git代理上传阻塞后改为发布副本直连，成功同步源码；打包通过临时PATH加入Git Bash和TAR_OPTIONS=--force-local解决Windows兼容，未把凭据写入文件。部署包equipment-icons-deploy.tar.gz与上述源码一致。此发布记录仅写入本地开发交接。
- 部署后额外HTTP资源哈希核验被403访问限制拦截，未完成线上资源/页面复验；Sites原生部署结果明确succeeded。站点已请求在Codex浏览器中打开。


## 2026-10-19 本地：六角柱身深度闪烁排查与修复

- 排查确认两项：柱身暗槽/光条与实体柱壁共面，导致真正的Z-fighting；截图下部密集雨丝则是旧雨幕1300/1750深度平面穿过长柱，雨幕隔离截图证实，并非柱壁自身重叠。
- 将暗槽沿面法线外移0.2、光条外移0.4，三层真实分离；仅六角场景将三层雨幕沿视线向远方平移1000，正交投影位置/UV保持，雨幕被柱身正常遮挡，背景雨景保留。原版入口/镜头呼吸/常驻网格不变。
- npm run check、test-hex-city含新增三面装饰净空回归/移动专项通过，真实Edge/WebGL preview-hex-city覆盖三窗口、商店/扩建/原角色敌人/常驻网格/镜头及GL。浏览器移动检查改为等实际位移，避免固定200ms在慢帧下误报。已检查hex-campaign-expanded.png确认下部雨丝穿柱消除，隔离截图hex-columns-depth-rain.png与hex-columns-depth-no-rain.png记录诊断。本地未发布，非手机实机验收。

## 2026-10-19 本地：六角柱体镜头拉近与呼吸

- 六角入口基础cameraScale从1.08调至1，画面约放大8%；用游戏time驱动7秒周期、±0.8%的平滑缩放，暂停时保持。按最外围已解锁柱顶留10世界单位边距，扩建到外围时适当放宽镜头，呼吸最靠近时仍完整保留柱顶。
- 仅修改hex-map场景适配，原方格入口保持。npm run check、test-hex-city（含movement）及真实Edge/WebGL preview-hex-city通过；浏览器增加拉近/呼吸极值/暂停稳定/外围不裁切检查，覆盖三种窗口、原战斗/商店/移动/常驻网格。已查看hex-campaign-390x844.png。本地未发布，非手机实机验收。

## 2026-10-19 本地：六角地块改为升起的六角柱体

- 按用户要求，仅六角入口将已激活地块改成有完整六面侧壁的高柱，柱身带暗槽和细光条，下部使用城市深度雾材质融入夜城。未解锁地块改为淡线框，保留绚丽城市、雨幕和飞车。
- 新扩建地块在原terrainChange落地预览阶段从下方升至地面，原0.3秒节奏与落地提交规则保持；原角色/敌人/商店五种地块/碰撞不变。柱体按地块类型residentMesh共享常驻网格，仅更新位置和升起高度。
- npm run check、test-hex-city（含movement）、真实Edge/WebGL preview-hex-city通过，覆盖原商店购买/扩建/战斗、120帧常驻复用、边缘滑动与三种窗口；已查看hex-campaign-390x844.png和hex-campaign-expanded.png确认柱体与夜城背景。本地未发布，未做手机实机验收，未重跑完整npm test。

## 2026-10-19 本地：夜城斜向车流与错落建筑朝向

- 按反馈将7条飞车航线改为不同方向的斜向穿行，屏幕投影与最近水平/竖直轴夹角约21–32度；两侧近景航线随纵深向外展开，背后近景航线斜穿远离场地，98车、8车型、浮动与完整姿态双前灯保持。
- 85栋背景塔楼独立绕竖直轴旋转约±14–41度，增加可见侧面。整栋几何/法线/窗灯/楼冠/广告实体框统一旋转，广告纹理同步位置与角度；场景revision升为orbital-34，静态几何仅构建时处理。
- npm run check、test-hex-city（含movement）、test-gpu-residency通过；扩展真实Edge/WebGL preview-city-traffic覆盖两入口全部航线投影倾角、85栋朝向差异、98车/8网格、前进方向/近景安全/90帧复用与GL无错误。已查看city-traffic-hex-390.png确认斜向车流与楼体侧面；本地未发布，未做手机实机验收，未重跑完整npm test。

## 2026-10-19 本地：夜城飞车前灯光柱、浮动与八种车型

- orbital-scene夜城98辆飞车增加跟随完整车身姿态的双前灯蓝白渐隐光柱，以交叉透明渐扩平面绘制；保留原有发光灯芯与尾灯。行驶增加各车独立节奏的双频上下浮动、轻微横向漂移、俯仰/侧倾/偏航，近处航线仍在场地外。
- 车型从5种扩展为8种：轿车、出租车、跑车、厢式车、巴士、货车、巡逻车、短轴运动款，包含不同长宽/车顶/货箱/尾翼/车窗/顶灯。固定模型仍residentMesh共享常驻，仅更新实例姿态；原版和六角入口共享生效。
- npm run check、test-hex-city（含movement）、test-gpu-residency、真实Edge/WebGL tests/preview-city-traffic.cjs通过。浏览器覆盖两入口390/1280宽、98车/8种网格、运动/方向/航线安全/90帧网格复用、无脚本及GL错误；已查看city-traffic-models.png近景确认双光柱与车型差异。未跑完整npm test，未做手机实机验收；本地未发布。
## 2026-10-19 本地：六角边界行走滑动修复

- 用户反馈六角边界行走卡顿。根因为原版walkFloor按X/Y分别接受或拒绝位移，斜向六角边界会阻断有效切向移动；原8点落脚采样也不是精确圆形净空。
- 仅hex-map适配：提取已激活地块并集的暴露边界，消除共边；以角色半径做连续圆形扫掠，接触后保留边界切向位移，处理端点/凹凸转角及细小历史重叠。落脚判定改为到实际外边界的净空距离。正常移速不改；原掩体碰撞仍在移动后运行。黑色风衣的静止缓时检查同步使用实际可滑动位移，避免贴斜边移动时误判静止。
- npm run check、test-hex-city（含新test-hex-movement）及真实Edge/WebGL preview-hex-city通过。覆盖六向内部共边、六边切向滑动、垂直输入贴斜边、原移速、大步长不穿边与20,000步不规则凹凸边界；实景验证walkFloor和原掩体阻挡、原商店/战役/3窗口保持。原方格版源码不变，本地未发布，非手机实机验收。


## 2026-10-19 本地 技能晶片亮蓝发光多面体外框

- 按用户反馈将晶片改为12条完整亮蓝自发光棱线包围的八面体，实体蓝色切面衬底、加粗蓝青亮边与蓝色光晕；减少中央白亮块，飞行尾迹统一亮蓝。棱线使用独立residentMesh常驻网格与emissive材质，不依赖环境光；尺寸、落地0.6秒后自动吸附与全程自旋保持。
- npm run check、test-talents和真实Edge/WebGL preview-talents通过，已检查talents-crystals.png与talents-hex.png；原版/六角、三窗口、掉落与自动吸附、存档/洗点、GL均正常。非手机实机，本地未发布。


## 2026-10-19 本地：铁球放大与垂直交叉包边修正

- 按用户反馈，ironball由半径19放大到约30（直径约+60%），刷怪碰撞半径同步30，中心高度31。球面增细分保持圆球感。
- 移除同向三圈，改成XY/XZ/YZ三个相互垂直的大圆金属箍，每圈沿球面有实际宽度与凸起侧边，均带铆钉。全体几何仍只在residentMesh首次构建；滚动以实际位移/30推进，转轴随移动方向更新。
- npm run check、新敌人/掩体/限时房专项通过；真实Edge/WebGL六模型三窗口及战斗通过。新增tests/preview-ironball.cjs，关闭测试页RAF后单独取景三个滚动角度，已查看tests/ironball-cross-bands-1.png确认圆球放大及交叉包边，无GL错误。未重跑完整npm test，本地未发布，非手机实机验收。

## 2026-10-19 本地 技能点掉落与永久属性加点

- 新增dist/talents.js与talents.css，原版和六角入口共同加载。普通敌人25%掉1点，首领整场一次20点，近战也参与；首领召唤物、测试模式和武器测试场不产出。技能点与金币独立，拾取写入hell-elevator-talents-v1永久存档，死亡保留已拾取，清层吸附、离层补齐回收，未拾取死亡丢失。
- 按用户最新要求，普通晶片约18世界单位高，约角色高度三分之一，蓝紫切面菱晶；0.25秒弹起落地后停留0.6秒，无需靠近即自动追向玩家，地面与飞行全程3.4rad/s自旋，飞行带短尾迹。使用residentMesh共享常驻几何，暂停冻结，最多64个实体并按数值合并。
- 主菜单/结算可进入20项加点，四分类、逐项独立涨价（基础费用×下一级等级）、草稿保存、免费按实际投入洗点，下一局固定属性快照。生命/开局盾单级；枪械覆盖伤害/频率/暴击/散布/弹速/后坐/重武器减速/概率穿透，另有特殊武器、无人机与铲子属性，均限制适用来源并避免派生伤害重复加成。拾取属性仅提升补给范围，技能晶片使用定时自动吸附。
- npm run check、新增test-talents、战役/饮品/铲子/地块商店/39武器进化与VFX/角色死亡/六角/限时房/新增敌人/GPU常驻/商店专项通过。真实Edge/WebGL tests/preview-talents.cjs通过390×680/844、1280×900，加减/保存/洗点/重载、实际杀敌掉落/自动吸附/入账/死亡、六角落点与测试场隔离，无脚本或GL错误。已查看tests/talents-menu-390x680.png、talents-crystals.png和talents-auto-flight.png；非手机实机验收。
- npm test仍停在交接既有test-63商店旧断言shelf hides identity and stats，日志tests/talents-regression.log。新增专项已加入npm test首项。离线打包脚本包含新模块及内联样式；本地未发布。设计文档位于上级outputs/talent-tree/地狱电梯基础天赋树设计草案.md。

## 2026-10-19 本地：六角版移除电梯底座与框架

- 按用户要求，仅六角入口移除原电梯实体底座/字标、护栏、立柱与边框。hex-map场景适配保留六角地板段和城市段，跳过中间电梯结构，清空玻璃/线路/底座字标通道，并移除旧矩形甲板的动态反光与角灯。赛博城市、雨幕、飞车、世界倒计时及原战役保持。
- npm run check、六角核心专项、真实Edge/WebGL三窗口及购买/扩容/战斗检查通过，已查看tests/hex-campaign-390x844.png：六角地板直接悬于夜城，无底座/护栏。原版场景源码未修改。本地未发布，非手机实机验收。

## 2026-10-19 本地：六角入口回归原版完整模式

- 用户澄清“就是原版模式，只是地图换成六边形版本”。已撤下独立经营界面/简化战斗及五种新经济设施，删除不再加载的hex-core.js、hex-city.js、hex-city.css。hex-city.html改用原版完整界面，原入口仍保留。
- 新增hex-map.js/hex-loader.js：六角页直接读取当前game.js，在独立文档里转换地块世界坐标、六向扩建、精确六角归属、供给/铲子/陷阱/掩体的格中心与进度形状，再按原顺序加载全部战役模块。原版game.js与renderer/场景模块不作本轮修改，避免复制模型或另造敌人行为。
- 角色电脑头/表情/弹簧与双足IK、原普通敌人（含新增六种）/BOSS、39种武器/装备/随从、三关战役、商店/地块被动直接运行原代码；商店建造为医疗/护盾/金钱/震荡/掩体五种，金钱格恢复靠近下铲。六角地图沿用固定13×11/143格、初始9格，本轮不延续独立经济版无限地图。背景强制赛博夜城abyss/violet，相机留出六角边缘。
- 六角最高纪录用hell-elevator-hex-best；原版纪录不变，不读取旧独立经济存档。更新主页入口文案与README。
- 核心专项通过：负行/正行中心归属、六邻居等距/互逆、六角边界、完整引擎编译及旧格子定义。真实Edge/WebGL专项通过：原角色/六敌人/39武器、9/143格、购买医疗格及扩容/落地、原生产常量、行走、120帧常驻网格复用及390×680/844、1280×900；实景tests/hex-campaign-*.png。本地未发布，非手机实机验收。完整npm test既有test-63商店旧断言失败仍见此前记录，本轮只运行相关专项。
- 将六角适配后的同一份引擎代入原版专项，test-campaign全部8种BOSS路线、test-added-enemies、test-category-boxes、test-weapon-evolution（39型号）均通过。

## 2026-10-19 本地：坐骑上的角色腿部停止步行

- 修复双腿IK仅排除坐姿载具、导致飞星/霓虹飞剑等站姿坐骑移动时仍迈步的问题。统一识别九种坐骑，骑乘时脚部接触点随玩家平移、固定本地位置，清除摆腿与步行骨盆起伏；骑乘/步行切换重建接触，普通鞋保留原步行。坐骑自身悬浮、旋转、特技及坐姿造型沿用原逻辑。
- 新增test-mounted-rider并接入npm test，覆盖九种坐骑四向/斜向移动、停止、冻结时钟、传送、步行中上下坐骑及普通鞋。扩展preview-player-biped真实Edge/WebGL，九种坐骑各120帧移动，双脚本地偏移误差0、GL错误0；原步行30/60/120fps启停、IK与三窗口检查通过。
- npm run check、骑乘专项及test-140/148/131/151/152/156/157通过。未重跑完整npm test，未做手机实机视觉验收。本地未发布。

## 2026-10-19 本地：预警竖直落雷敌人

- 新增stormCaller「落雷机」，B17起进入普通远程轮换，每3.4秒在玩家当前坐标锁定一次落雷；1.1秒地面红色警示圈、收缩蓝圈与闪电符号，之后竖直蓝白锯齿雷电劈下，伤害半径33，活动窗沿hazards既有1.1–1.5秒规则，1.7秒清理。预警期间无伤害、标记不跟随玩家，可走出范围躲避；暂停/慢时间沿敌方时钟，结算清理沿原规则。
- 独立双线圈电极模型与闪电/警示符号均用residentMesh共享常驻几何。正常可攻击击杀，刷怪60/40比例、特殊关规则保持。
- 扩展test-added-enemies：预警无伤害/锁点躲避/暂停/命中/消退/清理/真实循环施放/模型有限性。npm run check、新敌人/定时层/战役/掩体/战斗压力回归通过；真实Edge/WebGL六模型、180帧战斗、三窗口通过，已查看tests/storm-caller-strike.png。未重跑完整npm test（既有test-63商店旧断言见上一条）。本地未发布，非手机实机验收。

## 2026-10-19 本地：五类普通敌人与前30层组合扩展

- 现有常规敌人：crawler缓行机兵、spitter脉冲哨机、bomber追逐球形机、eye单眼射手、skull骷髅环射、missile导弹机、moth扇射飞蛾、laser激光机；goldSpider为特殊贪欲房敌人，BOSS召唤物不计普通刷怪。
- 新增ironball包边铁球（B5，82速度，金属球/包边铆钉，按实际位移旋转，碰撞伤害）、twinGun双发枪机（B6，左右枪口间隔.22秒交替瞄准射击，轮间隔2.1秒）、suicideDrone自毁无人机（B9，100速度追击，接触自毁/击杀死亡一次性12发115速度环弹，接触自毁不给击杀数或金钱）、ricochet弹跳碰撞机（B13，145速度，不追踪改向，边界/掩体反弹，分段移动检测接触）、lobber抛射机（B15，每3秒朝发射时玩家落点抛弹，1.1秒可见弧线/33半径预警，落地爆炸伤害）。
- 接入buildNormalRoster原60%接触/40%远程轮换与压力预算，不增加基础总数；前3层仅原入门敌人，生存/贪欲/BOSS房规则不变。全部可正常索敌/击杀；双枪待发随敌人死亡取消；暂停冻结；新模型通过residentMesh共享常驻，铁球滚动仅实例矩阵变化。
- 新增tests/test-added-enemies.cjs并纳入npm test，覆盖30层池/解锁/比例、实际接触伤害、枪口延迟/暂停/死亡、玩家武器击杀和接触环弹、掩体/边界反射、抛射落点/空中无接触伤害/暂停/落地伤害、眩晕与常驻数据复用。原定时层刷怪测试将观察玩家移远，避免无人机接触自毁改变活体数断言。
- npm run check、上述专项及starter/ranged/timed-floors/room-pressure/campaign/cover/drinks/settlement/weapon-evolution/gpu-residency通过。真实Edge/WebGL tests/preview-added-enemies.cjs通过五模型、180帧战斗、390×844/390×680/1280×900与GL检查；已查看tests/added-enemies-390x844.png，非手机实机验收。
- 完整npm test仍停在既有test-63「shelf hides identity and stats」商店旧断言，日志tests/added-enemies-regression.log。本地未发布。

## 2026-10-19 本地：三连发步枪、三连发激光枪、双手雷电枪

- 在既有12系列固定品质体系新增3件型号，总数36→39：rifle_t2「三连发步枪」、laser_t2「三连发激光枪」、tesla_t4「双手雷电枪」。沿用商店类别/品质随机池、付费揭晓、F2与武器测试场；未发布。
- 两种三连发按0/.075/.15秒依次射出；激光每束穿透4目标，轮间隔.72秒，步枪轮间隔.65秒。修复延迟瞬发激光发射时被原弹丸逻辑重置终点的问题，延迟束从发射时玩家位置完整射出，保持齐射朝向；暂停冻结延迟。步枪复用三连卡宾弹体纹理。
- 双手雷电枪左右两把独立模型、发光线圈，分别就近瞄准两敌，单敌集火；每枪最多连锁4敌，伤害递减，不带电环，间隔.65秒，每枪伤害按同阶基准×.6。索敌/连锁沿用可攻击过滤，排除炮台。
- npm run check、test-weapon-evolution（新增独立三段伤害、激光穿透/移动/暂停、双枪分头索敌/集火/链数/炮台排除/F2）、test-weapon-vfx、test-category-boxes、test-shop-stock、test-terrain-shop通过。真实Edge/WebGL preview-weapon-evolution及test-weapon-lab-browser通过，39型号渲染/GL、固定品质、实际购买与三窗口检查通过；已查看weapon-model-tesla_t4.png、weapon-model-laser_t2.png，非手机实机验收。
- 完整npm test仍因交接中已记录的test-63「shelf hides identity and stats」旧商店断言失败，日志tests/burst-dual-regression.log；未修改该无关断言。

## 2026-10-19 本地：独立六角夜城经济实验版

- 按用户要求先提交原版源码、素材与测试快照 `2a0e94c`，再开发。新增 dist/hex-city.html、hex-city.css、hex-core.js、hex-city.js。主页仅增实验入口链接，原13×11战役地图/玩法不改。
- 原orbital赛博夜城静态建筑/霓虹、GPU雨幕与常驻飞车复用；仅实验入口局部截取城市网格，去掉原方形电梯甲板/底座，以常驻六角平台和小型设备替代。原renderer/场景源码不改。
- 轴向六邻接，开局19格、边界$6扩建、无预设地图边界，拖动/缩放/角色归位；扩建障碍$10清理。五种独立设施：矿机、插屏广告、冷却塔、数据贩子、订阅服务，8秒统一结算并显示单格收入公式；广告抑制邻居、冷却加成、同类及不同业务邻接实际计入收入。选卡连续放置，拆除半价返还。
- 独立命名空间本地存档，暂停/后台不推进，无离线收益；WASD/方向键与触屏摇杆。可选20秒简化战斗压力测试（自动射击、击杀+$2、结束+$15），失败返回核心，保留建设；非完整原版战役移植。
- 增加核心回归与真实Edge/WebGL浏览器验证（建设/扩容实际点击、结算/存档/暂停/移动/战斗/GL恢复、390×680/844及1280×900、原版143格入口隔离）。截图tests/hex-city-*.png。本地未发布，非手机实机验收。
- npm run check、六角核心与真实浏览器专项通过，包括沿轴向扩建到(30,0)、拖动视口后的远端可见性与独立存档恢复。完整npm test在原版test-63因“货架隐藏简介”旧断言失败；工作区并行商店修改恢复了类别简介。本轮前快照2a0e94c的game.js代入同一test-63通过，未改动该商店逻辑或旧断言。完整回归日志tests/hex-city-regression.log。

## 2026-10-19 本地：扩容收益随商店升级

- 常驻扩容由固定3格改为Lv.1–5分别3/4/5/6/7格，整次价格沿用现有等级与深度定价；剩余空间不足时按当前等级整次格数折算，已预留地块继续计入容量。升级说明补充扩容提升。
- npm run check、test-terrain-shop、test-shop-stock、test-category-boxes通过；地块专项覆盖五等级整次价格、实际预留/落地数量、尾单折算及满地图拒绝重复购买。本地未发布。

## 2026-10-19 本地：随机商品品质标题与类别简介

- 装备标题使用“随机 + 原品质名 + 类别”，如“随机 精良装甲坐骑”；沿用普通/改良/精良/史诗/传奇品质名称，地块被动显示“随机 稀有护盾格加成”等。
- 恢复所有货架的说明：18种装备类别与地块加成使用简短的随机获取/能力方向简介，如“获得一件随机的强化生存能力的载具。”；具体型号与属性仍在付费揭晓后显示。
- npm run check、test-category-boxes、test-shop-stock、test-terrain-shop通过，类别专项覆盖所有品质标题及简介。本地未发布。

## 2026-10-19 本地：补全受击无敌说明

- 稳步靴及同类护甲效果统一显示“受击后无敌时间+数值秒”，移除商店将“受击无敌”缩写为“无敌”的处理，明确增加的是受击后的无敌时长。数值及触发逻辑不变。
- npm run check、test-category-boxes、test-shop-stock通过。本地未发布。

## 2026-10-19 本地：商店随机商品标题

- 装备与地块加成货架标题统一加上“随机 ”前缀，如“随机 轻武器”“随机 护盾格加成”；其他明牌商品保留原文案。类别、图标与购买揭晓规则保持原逻辑。
- npm run check、test-category-boxes、test-shop-stock通过。本地未发布。

## 2026-10-19 本地：Seedream 重新拆分18类装备图标

- 按用户授权复用 TreasureIsland6000 的 Seedream API 拆图流程，使用已配置的本机凭据，模型 doubao-seedream-5-0-pro-260628、layer_decomposition=true，分两批各9件；每批返回底图和9个命名透明图层，无重复提交。脱敏请求、响应、原始PNG与bbox保存在 ../outputs/equipment-seedream-20261019/batch-{1,2}/。
- 18个独立RGBA PNG保存到 dist/assets/shop-equipment/，统一256×256、主体最长边208像素、边界居中误差不超过1像素、最小留白24像素。清理23个微小孤立像素，保留安全帽/背心等有意义的分离部件；逐件查看原始与最终总览，主体完整，无相邻物品与周边杂点。asset-mapping.json记录来源、alpha裁边、最终边界与资源映射。
- shopItemIcon改为逐类加载独立PNG，不再等分裁切装备大图，去掉冷兵器特殊偏移。原有品质色、饱和度、亮度渐变、扫描纹、双尺度光晕与外框保持。补给仍使用既有图集。离线打包扫描改为递归，支持新子目录PNG内嵌；本轮未生成新发行包。
- npm run check、test-category-boxes、test-shop-stock通过；真实Edge/WebGL核查18图解码、六组类别、390×844/390×680/1280×900与付费揭晓比较，无页面或资源错误。已实际查看 game-all-equipment.png 和 game-comparison.png。证据位于 ../outputs/equipment-seedream-20261019/。本地未发布，非手机实机验收；未重跑完整npm test。

## 2026-10-19 本地：全部可购买物品图标接入与亮度完善

- 延续用户要求提高暗部/亮部：普通品质使用冷银色发光，彩色图标渐变强度1/1/.96/.76，扫描暗纹减半。余额不足不再整张装备卡降低透明度，仍保留价格不可购买状态；已售保持半透明。
- 内置imagegen生成两张图集：dist/assets/shop-equipment-categories.png（1774×887，6×3，18个装备类别），shop-supplies.png（1254×1254，4×4，16个物品/补给类别）。提示词../outputs/equipment-icon-style/prompt-all-shop-icons.txt。shopIconDescriptor明确映射类别，shopItemIcon统一透明轮廓蒙版、品质/商品色、明暗与光晕。
- 正式renderShop全部货架均有图标：18类装备、医疗/护盾/金钱/震荡/掩体五种建造及五种地块加成、回血/拆除等；常驻扩容入口使用36px紧凑框，商品卡64px框/48px图形。装备比较页显示当前和新装备类别图标；保留的renderBar饮品路径也有鸡尾酒图标，未恢复正常酒吧入口。
- 取景页加载shop-icons-preview.js，12页分类商品、左右按钮浏览；URL icons=0..11选页，仅本地预览样品，不影响主入口随机商店。实际桌面浏览器检查装备/比较/地块建造/加成/补给，截图../outputs/equipment-icon-style/shop-all-icons-*.png。
- npm run check、test-category-boxes、test-shop-stock、test-63/59/74均通过。预览已打开保留。本地未发布；未重跑完整npm test。

## 2026-10-19 本地：高饱和彩色高光修正

- 用户明确要纯净饱和的高光，撤掉上一轮白色混合和screen提白。按现有品质色保留色相，提高彩色品质饱和度至94%、峰值通道255；渐变只做1/.94/.78/.45的RGB强度变化。普通品质保持中性色。双尺度同色光晕与清晰主体合成，外框光晕使用同一高饱和发光色。
- 实景../outputs/equipment-icon-style/shop-rarity-saturated-glow.png，已刷新保留。npm run check、node tests/test-category-boxes.cjs通过。本地未发布。


## 2026-10-19 本地：Icon略过曝加强

- 按用户要求增强光感：顶部高光向白色混合92%、中部72%/38%，底部保留品质色；双尺度柔光（图形高度3.5%/7.5%）+ screen叠加提高中心亮度，外框两层品质光晕。保持64px尺寸与原轮廓。实景截图../outputs/equipment-icon-style/shop-rarity-overexposed.png，已刷新保留。
- npm run check、node tests/test-category-boxes.cjs通过；本地未发布。

## 2026-10-19 本地：选定第二种符号风格、品质配色与实时全息辉光

- 用户选定第二种单色符号，要求图标/外框跟随商品色，并增加内部明暗与参考图的光晕。正式shopEquipmentIcon改用第二种轻武器/护甲/无人机透明图集；铲子/坐骑/冷兵器保留原类别轮廓作为alpha蒙版，同样用单色全息材质绘制。品质颜色直接取WEAPON_GRADES，与商品边框/标题一致。
- 实时SVG alpha mask + 同色系四段线性渐变（顶部浅亮、底部暗色）+ 轻微扫描纹 + GaussianBlur/SourceGraphic合成，保留清晰主体并带柔和光晕；CSS为64px外框增加低强度品质色发光。不是全场WebGL HDR bloom，静态UI无需另开GL上下文/每帧重绘；底图只负责轮廓。
- 取景页移除三方案对比脚本加载，刷新后直接显示选定成品（绿/蓝/紫三个样品），旧对比素材与脚本保留。截图../outputs/equipment-icon-style/shop-rarity-hologram.png。
- npm run check和node tests/test-category-boxes.cjs通过；实际浏览器查看了符号/内部渐变/品质色/光晕并保留当前预览。本地，未发布。
## 2026-10-19 本地：三参考Icon风格游戏内对比

- 根据用户提供的三种参考分别用内置imagegen生成同一组轻武器/护甲/守卫无人机的透明图集，保存dist/assets/icon-study-color.png、icon-study-cyan.png、icon-study-industrial.png（各2172×724）。完整三组提示词../outputs/equipment-icon-style/prompt-three-references.txt。
- 仅在现有取景页icon-style-reference.html加载icon-style-study.js/css，顶部按钮切换彩色剪影/青色符号/工业标识；所有外框均代码绘制64×64、图形视口48×48。三组统一商品/价格/卡片尺寸，切换不购买或改变货架。正式主入口继续上轮试装，不因本轮默认推荐而全局替换。
- 浏览器逐项点击确认并保存shop-style-1-color.png、shop-style-2-cyan.png、shop-style-3-industrial.png到../outputs/equipment-icon-style/，默认停在青色符号。node --check dist/icon-style-study.js与npm run check通过。本地预览，未发布。
## 2026-10-19 本地：商店小 Icon 外框与卡通矢量生图试装

- 按用户要求先在游戏绘制独立64×64外框，48×48内部展示区域，品质色边线/深墨绿底/简洁内衬；正式renderShop装备卡加入类别图标，不暴露盲盒具体型号。轻武器、冷兵器、护甲、无人机、铲子、坐骑共用简化的卡通矢量赛博生图图集dist/assets/equipment-category-icons-v3.png，以SVG视窗展示各类别；无真实金属纹理。当前为风格试装。
- 独立取景页dist/icon-style-reference.html以正式商店渲染器显示三个固定样品，便于反复比较，不影响主入口开局。实际浏览器截图../outputs/equipment-icon-style/shop-framed-icons-in-game.png，生图完整提示词同目录prompt-flat-icons-v3.txt。外框由代码绘制，图内外框试稿未用于本轮游戏试装。
- npm run check、node tests/test-category-boxes.cjs通过，实际游戏浏览器已检查并保留预览。未发布。

## 2026-10-19 本地：全分类盲盒与独立随从无人机

- 用户最终授权落实分类盲盒。普通货架装备只展示稳定的类别名、原品质颜色/材质、价格；预先固定具体内容与属性，购买立即扣款并揭晓，不再免费比较；装备可替换/装备或放弃，放弃不退钱，已售不能再开，确认不会二次扣款，余额花光仍可装备。完整短字段/逐行属性仅在揭晓比较显示。
- 武器：轻武器（含激光/电击）、重武器（步枪/狙击/加特林）、冷兵器（剑）、爆破武器（火箭/飞弹）；回旋镖/蜜蜂枪按轻武器归入。衣服：建筑工服饰、游侠服饰、便装、轻便护甲、重型防弹衣、绚丽服装；建筑工对应杀毒工装现有每关清理危险机关，未为分类另加未经讨论的新服饰属性。坐骑：装甲/迅捷/火力/辅助，飞碟含装甲；允许装备跨池，进货时选定展示类别，重绘不换。
- 地块被动按金钱/医疗/护盾/震荡/掩体格加成隐藏名字/效果，付费后揭晓并立即获得，互斥提示在揭晓时显示，旧一次性购买限制保留。建造、拆除、回血、常驻金币扩容继续明牌；酒仍不进店、无酒吧正常入口；刷新/升级费用不变。
- 获得途径（商店、F2列表）无人机切换COMPANION_TYPES独立随从，不出售原枪械复制版：攻击型撞针（自行冲撞/返回）；守卫型哨环（环绕接触/触碰拦弹有冷却）、原裂齿电锯；辅助型弱点探针（定时易伤/过期消失）、医疗萤（周期回血）、充能萤（周期补盾）。支援战斗/生存生效，暂停/商店不推进；换装/换层从完整周期开始，无瞬间补给。新模型共享residentMesh；原武器无人机工厂只为既有弹道回归夹具保留，不在可获得池。旧弹道回归保留，复制版商店获取断言迁移为主武器获取，由新专项覆盖无复制版出货。
- npm run check、完整npm test通过（tests/category-boxes-regression.log），新增test-category-boxes纳入npm test：全部类别可达/未暴露内容/先付费/无退款/单次生效、真实冲撞命中、炮台排除、易伤过期、拦弹冷却、支援周期/暂停/换装/生存与常驻模型。真实Edge/WebGL preview-shop-rework和preview-shop-game通过，390×680/390×844/1280×900、品质GPU懒加载/复用/降级保持；查看shop-rework-390x680.png、shop-rework-comparison.png和companion-interceptor.png。本地4173服务已启动；未发布，非手机实机验收。

## 2026-10-18 本地：铲子直接下落与四倍基础挖掘效率

- 铲子模型整体放大25%，以铲头底部为锚点补偿高度，保持格中心和触地点不变；共享网格只改实例缩放。
- 用户要求删除空中停顿：铲子出现即沿世界Y匀速下落，攻击周期32%触地，随后立刻原位渐隐，无悬空等待/拔起；触地高光与逐击扣进度保留。
- T1–T5基础攻速改为2/2.5/3/3.5/4次每秒，每铲进度1→2。普通格仍30点：基础铲15次，首次产出7.16秒（旧29.44秒）；钱袋40点/流水20点不改。装备浮动及既有生产倍率沿原规则乘算，离开/暂停/BOSS禁用保持。
- 铲子专项新增出现后前两帧持续下降、基础铲7.15秒未完成/7.16秒触地出钱、0.16/0.66/1.16/1.66秒逐击扣2点断言；同步更新限时房/生产加速/经济饮品的产出期望。npm run check、完整npm test（tests/shovel-faster-regression.log）、铲子/限时房/生产/经济饮品专项及真实Edge/WebGL三窗口通过；模型放大后重跑语法/铲子专项与浏览器检查通过。截图tests/shovel-inserted-close.png、shovel-inserted-full.png更新。本地未发布，非手机实机验收。

## 2026-10-18 本地：商店短字段、属性逐行与加高卡片

- 按用户连续反馈，普通货架/替换提示/购买比较中的名称移除品质文字和T等级，品质仍由原颜色/材质表达；商店效果中不再附加武器系列名。装备原始数据、暂停HUD/测试详情名称保留。
- 商店字段改为攻击/攻速/生命/护盾/移速/范围/进度/挥砍/暴击/爆伤等短标签，受击无敌等效果措辞精简，保留数值及触发条件。货架属性以br逐条换行，分号分隔的效果各占一行；比较属性继续独立行。
- 普通商店商品卡最低280px并随内容自动撑高，描述左对齐、1.75行高，超屏沿既有商店纵向滚动，不裁切内容。
- npm run check、test-63/test-59/test-74、真实Edge/WebGL preview-shop-rework和preview-shop-game通过；查看390×680截图，三窗口无横向溢出，购买/返回及品质GPU效果正常。未重跑完整npm test，本地未发布，非手机实机验收。

## 2026-10-18 本地：按异步回复暂缓酒吧入口

- 用户确认地块扩容/被动统一使用金币；酒只移出普通商店，酒吧层入口稍后设计。已撤销上一条记录中临时“每两层先酒吧”的自动进入规则，每层结算直接打开普通商店，结束后仅下降一层。
- 酒吧酒单/界面函数保留为未接入的后续基础，不生成酒吧商品、不提供正常流程入口；已有酒效果和测试饮用功能保留。
- npm run check、地块/饮品/商店专项、真实Edge/WebGL tests/preview-shop-rework.cjs通过，验证偶数层也无酒吧/酒卡，金币扩容与装备比较保持，退出正常下降。此小改未重跑完整npm test；上一轮完整回归已通过。本地未发布。

## 2026-10-18 本地：普通商店合并、装备明牌与独立酒吧

- 按用户决定：普通商店常驻地块扩容按钮，每次最多+3格，按剩余空间计费，保留随机发现地形和落地时结算。地块建造/拆除/稀有被动并入三件普通货架，装备占每槽65%、回血8%、地块27%；地块被动原效果/互斥/购买一次限制保留，并显示已拥有列表。
- 装备直接展示真实名称、品质、属性和效果，已有装备时另行显示“需要替换：XXX”；点击比较可免费返回，商品和浮动属性不变，确认购买并替换才扣款，复核余额/原商品/已售状态，阻止重复支付；空槽也沿用确认界面。
- 保留金币升级路线和40/60/100/150升级费用；普通刷新基础5/8/12/18/26，每次追加3/5/7/10/14。此次未对升级策略另改数值。
- 两项未指定细节已异步询问，未获回复后按已说明默认实现：取消蓝晶，地块统一金币；原每两层地块店时机改为酒吧，再进入同一份普通货架，普通店结束才下降一层。酒吧3杯独立酒单、刷新5起每次+3，酒不进普通池，价格沿原饮品公式，暂用既有界面无专用场景美术。后续用户回复可调整这两项默认。
- npm run check、完整npm test、商店/饮品/地块专项和真实Edge/WebGL tests/preview-shop-rework.cjs、既有tests/preview-shop-game.cjs通过；覆盖免费返回/确认扣款/扩容预留/被动购买/酒吧切店与不跳层、390×680/390×844/1280×900无横向溢出，原GPU材质复用/停绘/降级保持。完整日志tests/shop-rework-regression.log。已查看shop-rework-390x680.png、shop-rework-comparison.png、shop-rework-bar.png；本地未发布，非手机实机验收。

## 2026-10-18 本地：前期怪机械造型与单发慢弹

- 用户反馈造型不够科幻、开局应单颗子弹。crawler改为「缓行机兵」：低矮金属装甲/双履带舱/分段履带/青色传感器条；spitter改为「脉冲哨机」：悬浮棱角机身/侧推进器/独立单炮口/灯条和天线。继续以residentMesh共享固定模型，保留受击和开火预警表现。
- spitter从三颗宽角散弹改为单颗瞄准慢脉冲，弹色珊瑚橙；85弹速、3.2秒间隔、初始延迟及其他前期平衡规则保持。
- npm run check、新怪专项、限时房/经济饮品专项、桌面Edge/WebGL双窗口预览通过；实测每次仅一弹、速度85、无GL错误，截图tests/starter-enemies-390x844.png已更新并检查。本地未发布，非手机实机验收。


## 2026-10-18 本地：关卡结算逐条跳字，未醒酒保持静默

- 结算改为每条头顶提示独立播放2秒，下一条替换上一条，不再合并分行；对应奖励/地形清理按顺序执行，地形仍先完成三闪。最后一条结束进入商店；没有提示时保留2秒结束牌，暂停冻结与大帧结算保留。
- 普通酒购买不弹醉酒提示，未醒酒过关只推进剩余房间、不跳字且不占播放时长；醒酒获得增益和立即获得正面效果的酒继续显示简短效果提示，状态栏仍保留具体效果/进度。
- npm run check、完整npm test、结算/饮品/经济饮品/64专项与真实Edge/WebGL逐条播放验证通过；截图tests/settlement-head-start.png、settlement-head-mid.png、settlement-head-second.png。完整回归见tests/settlement-sequential-regression.log。本地未发布，非手机实机验收。

## 2026-10-18 本地：酒类玩家文案修正

- 商店酒卡、饮用提示、特调状态栏、过关结算及全部入口F2酒测试文案移除“筹码”，统一直接描述醉酒效果；过关未醒酒提示补充具体效果与剩余房间数。数值、生效和醒酒规则不变。
- npm run check、test-drinks、test-economic-drinks及16款酒描述/状态栏/结算文案检查通过；dist内无“筹码”残留。本地未发布。



## 2026-10-18 本地：饱和城市远景、中性近景受光

- 按用户 修正，恢复夜城violet高饱和距离雾(.105,.095,.48)、三层靛蓝/紫蓝雾原配色与透明度。城市静态几何沿既有城市fogTag范围，在主shader中选完整grade1；电梯/地板/角色不在该tag范围，保留sceneGrade0.25及上一轮冷白蓝灯和低紫侧光。镜头继续cameraScale1，revision orbital-33。
- npm run check、真实Edge/WebGL三窗口与经典镜头范围一致/低近景grade灯光/无GL错误、上下文恢复回归通过；截图tests/city-neutral-390x844.png显示背景恢复强紫蓝，近景维持中性色。本地未发布。
## 2026-10-18 本地：商店材质正式接入游戏

- 用户确认当前效果并要求应用游戏。将预览材质脚本迁移为dist/shop-effects.js，所有加载game.js的正式入口加入共用脚本，预览改用同一脚本并通过data-preview-controls保留实验控件；正式游戏无材质调参/画廊。保留T3蓝矢量/横扫、T4紫蓝矢量/较强升腾烟雾/弱闪粉、T5大范围金橙矢量/升腾烟雾/强闪粉/随机星芒、连续饱和发光标题与价格。npm check与离线打包脚本同步加入新模块。
- GPU上下文与1024²法线烘焙改首次遇到高阶商品才初始化；低阶商店也有矢量/字体，且不开额外GPU上下文。单画布跨商店复用；观察overlay替换/隐藏，进入开盒比较/地块商店/退出及时停帧并卸下画布。减少动态/离屏/隐藏暂停；GPU不可用保留CSS后备，材质控件仅预览显示。
- npm run check、tests/preview-shop-game.cjs真实Edge/WebGL生产入口专项、原烟雾专项/材质画廊、test-shop-stock/test-terrain-shop/test-economic-drinks通过。覆盖低档懒初始化、无实验控件、三窗口、购买/比较停绘/确认、刷新/升级/离店停绘/重进单上下文、减少动态、GPU不可用仍可买；烟雾专项继续覆盖GL恢复。预览商品现为护甲（另一路更新），同步两个旧浏览器测试定位/确认步骤以适配开盒，未恢复已删小被动。已查看tests/shop-game-390x844.png，打开正式游戏入口http://127.0.0.1:4173/。本地未发布，非手机实机。


## 2026-10-18 本地：删除24种随身被动

- 按用户要求删除本轮新增的24种随身被动及全部Tier版本：目录、独立持有状态、累计属性、商店定价/出货、卡片与持有列表/CSS均移除。原饮品、地块被动、装备特效、关卡奖励和铲子采矿保留。
- 原被动出货份额转给装备；饮品约18.3%、回血约8.3%、装备约73.3%，继续每次3件。未恢复生命核心/轻量骨架进金币商店。
- shop-preview.html五档品质样品改用护甲，保留既有品质动效预览和T5武器；移除过期test-small-passives.cjs/preview-small-passives.cjs，以test-shop-stock.cjs覆盖移除后的商品池和基础属性，同步更新饮品混合货架测试。
- npm run check、test-shop-stock、test-drinks、test-57/59/61/63、test-terrain-shop、test-shovel-attacks、test-weapon-evolution及git diff --check通过。真实Edge/WebGL验证主商店3件商品/无随身被动UI与五档品质预览6张装备卡，无页面异常；截图tests/shop-passives-removed.png。未重跑完整npm test；本地未发布。

## 2026-10-18 本地：夜城恢复原游戏镜头、减弱紫光

- 按用户反馈，orbital夜城cameraScale1.18→1，与原游戏相同正交可视范围；固定13×11地图不变。revision orbital-32。
- 场景染色sceneGrade1→0.25，顶光改冷白蓝(.65,.72,.85)，青/紫侧光降低，clubMagenta .82→.35；violet距离雾由饱和靛蓝改(.08,.12,.18)，三层氛围雾改低饱和蓝灰并透明度乘.65，保留建筑灯窗/招牌霓虹与雨幕。
- npm run check、真实Edge/WebGL tests/preview-city-neutral.cjs通过：390×680、390×844、1280×900下城市/经典cameraScale与halfX/halfY逐项相等、低染色灯光/GL正常。截图tests/city-neutral-*.png；原氛围浏览器专项预期cameraScale/grade同步更新。本地未发布。

## 2026-10-18 本地：前3层独立低威胁怪物

- 用户要求降低实际威胁，新增crawler「缓行虫」与spitter「吐泡怪」，普通B01–B03刷怪表完全换用二者，保留60%近战、原低血量/远程上限及近战豁免；B04生存/B05起原怪不变。
- 缓行虫48速度追近（原bomber110），低矮绿色虫体；吐泡怪18速度绕行（原eye38），蘑菇状体/圆嘴，首次开火2.2秒+错峰，0.9秒预警，每3.2秒发三颗间隔0.5弧度的85速度慢弹（原前期147–161弹速、1.7秒周期）。怪物速度受原饮品/时间减速/地块规则影响，接触仍有伤害。
- isMeleeEnemy统一近战分类，接入生成位置/HP/队列豁免/蜂巢复制/击退/金币与HUD；原bomber模型保留，新模型均renderer.residentMesh共享复用，无逐帧静态顶点复制。
- tests/test-starter-enemies.cjs加入npm test，验证前期限定/后期不变、实际位移/弹速/开火间隔、接触伤害/击退/猎犬酒、有限常驻模型复用。npm run check、npm test完整回归（tests/starter-enemies-regression.log）、限时房/经济饮品/远程移动/五种子压力模拟通过；真实桌面Edge/WebGL双窗口无脚本/GL错误，截图tests/starter-enemies-390x844.png和starter-enemies-arena.png。本地未发布，非手机实机。


## 2026-10-18 本地：铲子提亮与触地高光

- 铲头换亮银白、柄/握把换浅金与浅青，主体增加0.4弱自亮，铲头中线/柄/握把加独立自亮亮条；保留原位透明渐隐与尺寸、攻速、触地工作结算。
- 每次铲头触地同时触发0.18秒地面高光：格内暖金透明整面+中心白色亮斑，快速衰减；只覆盖被铲中的金钱格，包含最后一下产钱。沿现有透明几何批次绘制，不新增纹理/定时器，暂停冻结。
- npm run check、铲子/地块专项及真实Edge/WebGL三窗口通过；专项验证触地前不亮、触地瞬间触发、两击之间消退。截图tests/shovel-inserted-close.png、shovel-inserted-full.png已更新并视觉检查。本地未发布；桌面浏览器验证，非手机实机。

## 2026-10-18 本地：铲子按攻速连续攻击，触地逐次扣进度

- 用户纠正语义：删除连续计时推进/最后一次铲动画。现在靠近1.5格内每个金钱格反复出现铲子，按攻速垂直下插；铲头触地（周期44%）才结算一次工作，插入后原位透明渐隐，无拔起或缩小。离开/暂停冻结当前攻击。
- T1–T5基础攻速1/1.25/1.5/1.75/2次每秒，单铲1点；普通格需30点、钱袋40点、流水20点。原生产倍率乘到攻速；剩余进度轮廓逐击减少，扣完的当次触地立刻生成原面值金钱，铲子继续完成渐隐。库存满停止新攻击；实际拾取规则保留。
- 换铲不改已完成工作，攻击周期保留相位；震荡生产推进先存入待结算工作，下一次铲头触地才生效，远处不累积。装备卡/暂停面板显示攻速和每铲进度，商店说明同步。
- tests/test-shovel-attacks.cjs加入npm test；专项与真实Edge/WebGL tests/preview-shovel.cjs验证逐帧只有0.44/1.44/2.44/3.44秒触地时工作+1、高品质更多次攻击、最后一下产钱、渐隐不抬起、范围/暂停/换铲/加速/库存/购买/BOSS禁用。npm run check、完整npm test（tests/shovel-attacks-regression.log）、新增铲子专项及地块/限时房/生产加速专项通过；截图tests/shovel-inserted-full.png、shovel-inserted-close.png。本地未发布；桌面浏览器验证，非手机实机。

## 2026-10-18 本地：近战怪豁免前期刷怪数量限制

- 按用户要求，前3层人数限制改为仅统计远程存活怪，基础上限3只；bomber近战不计数也不被阻止。队列findIndex会跳过受限远程项继续寻找可刷近战，避免队首阻塞；蜂巢额外近战同样豁免，额外远程仍按扩展上限等待。降血量保留。
- 相关回归覆盖远程满员后继续刷近战、被阻远程排队、远程死亡后补位、蜂巢额外近战绕过上限。五种子真实伤害模拟前3层远程峰值均3只，总敌人数允许超过3只。npm run check、限时房、压力模拟、经济饮品、饮品专项通过。本地未发布，mock模拟不代表实机体验验收。


## 2026-10-18 本地：前3层降血量与同屏围攻限制

- 用户反馈第二层初始武器来不及消化、无防御地块时五怪围攻。普通限时房前3层远程血量倍率1.6→1、贴身1.5→1；B02初始手枪远程12→8枪、贴身7→5枪。后续层/BOSS/生存规则保持。
- 开场仍两只、每3秒尝试补怪，前3层基础同屏最多3只，spawnGroup按存活人数逐只检查，未入场保留队列。蜂巢酒上限ceil(3*(1+.5*份数))，额外怪超限排队、hiveExtra避免重复复制；候选总量/60%近战组成/最后2秒停刷规则保持。
- 更新限时房/蜂巢经济/真实伤害压力模拟回归。五随机种子初始手枪B01约21.3–21.67秒、B02约25.38–25.73秒、B03约29.05–30秒，峰值均3只；后期压力模拟不变。npm run check、npm test完整回归及刷怪/饮品/经济饮品/战役专项通过（完整日志tests/early-room-balance-regression.log）。本地未发布；模拟使用mock渲染，不代表实机操作体验验收。



## 2026-10-18 本地：受击直接整块红屏

- 按用户小尺寸可读性反馈，移除碎心→X_X序列，实际掉血/护盾受击立即整块屏幕显示#ff334b亮红色0.42游戏秒，再恢复薄荷绿圆眼微笑；红屏期间不画五官/裂纹，原受击期间防闪烁隐藏、暂停冻结/无敌攻击忽略/重开清空规则保留。
- npm run check、真实Edge/WebGL表情专项验证立即/0.1秒后均红屏、红色屏幕48顶点且无五官、恢复绿屏、护盾/重开与无GL错误，饮品回归通过。截图tests/player-face-red.png。本地未发布。


## 2026-10-18 本地：轻微黏脚，按距离跟步

- 按用户要求取消固定步频/黏脚时长与stepClock：移动时脚偏离对应髋部下方超过7世界单位即跟步，优先处理偏离更远的一脚。摆腿时间按速度自适应0.025–0.10秒、落点只比预计落脚时身体位置前探2单位，抬脚4→2；停步逐脚回正。实际移速不变。
- 保留世界锁脚与轻度弹性腿，但不再等待0.32秒而拉出长腿；曲线移动专项最大伸长约1.34倍（上一版4.51倍）。骨盆/起停平滑、静止2.38头身/18.17度轻屈膝保留。
- npm run check、真实Edge/WebGL双足/黏脚/六坐骑/三窗口、头部/表情/饮品回归通过；新增距离触发检查：累计6单位走0.8秒不迈步，超过7单位立即触发，不依赖时间间隔。30/60/120fps反复起停范围检查通过。本地未发布。


## 2026-10-18 本地测试：黏脚小人式弹性长腿

- 按用户参考，步态改为脚先锁在世界接触点、身体前移时腿被拉长，再交替抬脚追赶。常规最短步间隔0.32秒（约每秒3步），移动摆腿0.14秒/抬高4，超大拉伸才允许0.24秒应急释放；停步逐脚0.18秒回正，暂停/传送/坐骑切换自动重置规则保留。
- 两段IK骨长按髋脚距离等比例伸长，裤腿/膝节/侧线随sqrt(stretch)收细，鞋体保持原尺寸；支撑脚不随身体平移，实际人物移速/碰撞不变。骨盆继续只按blend在19.8–19.2小幅平滑变化，不受拉伸距离压低；静止恢复原腿长/18.17度轻屈膝/约2.38头身。
- npm run check、真实Edge/WebGL黏脚专项tests/preview-player-sticky.cjs验证30个支撑样本世界锁脚、实际draw下腿伸至3.08倍且无GL异常；双足曲线移动专项最大4.51倍/两秒6次迈步、精确IK/伸缩骨长/30–120fps反复起停/六坐骑/三窗口、三视图、表情、头部弹性与饮品回归通过。
- 动态帧截图tests/player-sticky-detail.png与player-sticky-walk.png。本地未发布，仍为角色表现测试。


## 2026-10-18 本地：稳定短步节奏与平滑起停

- 用户反馈步频异常高/静动切换偶发重心骤降。原因是短腿按世界脚接触距离不断补步（旧时长最多0.08秒），骨盆又直接取最远脚的可达高度。改为独立有界节奏的卡通短步：正常140速度约每秒3次交替落脚，±4.5步幅/2抬脚高，不改变实际人物移速。
- 步态blend按14/s指数平滑起停，方向向量按12/s平滑转向、相位连续，停步后双脚回正。骨盆从19.8到19.2仅随blend变化，不再每帧受最吃力脚直接压低，无骤降/恢复反跳。该卡通步态移动时随身体平移，不再强求高速小短腿的世界锁脚；静止脚保持固定，双骨IK接触准确、每次仅一脚离地。
- npm run check、真实Edge/WebGL双足节奏/骨长/两秒6次迈步/单帧高度差约0.125、六坐骑/三窗口、表情/头部弹性、饮品回归通过。双足专项增加30/60/120fps反复短起停的高度范围与变化率检查。静止屈膝18.17度和约2.38头身保留；本地未发布。


## 2026-10-18 本地：站姿仅轻微屈膝，维持约2.38头身

- 用户经三视图确认误将前突膝盖当鞋头，要求站立不要深蹲。腿骨保留7.5/8.5，静止髋高12→19.8，踝高4，实际站姿膝盖屈曲约18.17度（完全伸直=0），原约120度的前顶消除。
- 站姿躯干局部高度压为65%，头部只下移6.65、不缩放，骨盆抬高与短身躯抵消，整体约2.38头身；装甲同步压短，头部/表情/天线保持原形、角度和弹性。坐姿保持原变换。
- 每帧按双脚真实世界接触与15.85安全伸展计算髋高，走路时骨盆适度下降，保持两段骨长/脚接触准确、单脚交替，停步站稳。三视图直接反映新模型，侧视可辨鞋尖/浅色鞋头。
- npm run check、真实Edge/WebGL双足专项（新增静止屈膝<30度断言，实测双腿18.17度）、三视图/鞋特写/手机、表情时序、头部弹性、饮品/上下文恢复回归通过。tests/robot-three-views.png已更新；本地未发布。


## 2026-10-18 本地：三视图白色背景

- 按用户要求将robot-views页面及三台WebGL场景背景改纯白，文字/边框调为深色和浅灰绿，底座改浅灰。renderer增加可选backgroundColor，默认游戏背景值保留，只有三视图实例设置白色。
- renderer/预览脚本语法与真实Edge/WebGL三视图/鞋特写/手机布局专项通过，截图tests/robot-three-views.png更新。本地未发布。


## 2026-10-18 本地：机器人空场景三视图预览

- 用户要求查看鞋子方向，新增独立robot-views.html/js：正面(+Z)、右侧(+X)、背面(-Z)三台等比例正交相机，空背景/简洁底座，方向标签明确身体前后，可切鞋子特写，手机纵排支持。
- 隐藏同源index iframe只作为当前模型来源；通过实际drawPlayerBiped至drawHeldWeapon之间的绘制区间提取当前玩家网格与辉光，再由三台Elevator3D渲染，未复制重做模型、未更改正式玩家源码。静止站立、无装备/武器/血条/敌人遮挡。
- 侧视图直观看到当前静止膝盖明显前弯、鞋子落在膝盖之后，可能是用户反复反馈鞋子像反向的来源；本轮按要求先展示不改模型，等待观察反馈。
- node --check与真实Edge/WebGL tests/preview-robot-views.cjs通过：6084个实际模型顶点、三上下文无GL错误、三视向、鞋特写切换、390px无横向溢出。截图tests/robot-three-views.png、robot-shoe-three-views.png、robot-three-views-mobile.png。本地未发布。
## 2026-10-18 本地试作：去字体栅格、饱和亮芯与紧边辉光

- 用户提供蓝/绿/红霓虹CRT图指出光感不足，要求去像素栅格。移除字体全部点阵背景、三个注册CSS属性、点闪动画；标题/价格改固定纵向饱和亮芯梯度，蓝/紫各按品质色，金字#fff000→#ffd600→#e7a800，保持纯黄且无白色扫光。
- 发光结构为黑色极窄分隔+0.7px紧边光/2px同色光晕/4px低alpha外溢，字面保持连续，不再通过像素点形成质感。此前暖色矢量/烟雾/Glitter保留，正文保持原可读样式。
- node语法、npm run check与真实Edge/WebGL商店专项通过，覆盖三窗口/减少动态/上下文恢复/实际购买清理；已检查tests/shop-sugar-390x844.png并刷新用户预览。本地未发布，非手机实机。

## 2026-10-18 本地试作：取消字面扫白、纯黄点闪与扩大暖色金卡

- 用户指出仍有整片白光扫字，要求高光纯黄；追加金卡矢量覆盖更大、红偏橙、不要冷色色块。字体完全移除横向扫光，底色仅固定纵向暗亮差；三层0.35–0.4px固定细点经注册CSS数值属性错相改变强度，点阵不移动，金色type-hot改#fff000且底色减少白分量，0.65px窄辉光保留。减少动态关闭点闪。
- 金色SVG开启wide几何：两大斜块拓宽、alpha .78/.68，主色金黄#d18b20、副块橙#ee731e、细块金黄#ffca42，去掉蓝色装饰。紫色及蓝色矢量不变。
- node语法、npm run check、真实Edge/WebGL商店回归通过；额外浏览器验证点闪属性随时间改变而background-position恒定、纯黄高光/暖色SVG、减少动态冻结；已检查三窗口截图之一tests/shop-sugar-390x844.png并刷新用户测试页。本地未发布，非手机实机。



## 2026-10-18 本地：约2.33头身与紧凑短靴

- 按用户再次反馈，移除原双足版为腿部增加的大幅抬高：站姿上半身抬升14→4，髋高22→12，腿骨14/15→7.5/8.5，腰带下移。保留31×25大头、原瘦躯干与低位圆眼，模型头壳顶至鞋底约为正面25单位头高的2.33倍。
- 独立drawPlayerBoot重做小短靴：鞋底长度18→9、靴筒高度缩短，脚接触基点由身前3单位移回身体下方；鞋子整个几何在踝后最多3、踝前最多6单位，清除大段后突/拖尾，鞋头仍向身体前方。步幅与抬脚高度同步缩短（3单位），支持脚保持固定，骨长/IK接触精度保留。
- npm run check、真实Edge/WebGL双足/六坐骑/三窗口、表情三阶段、头部与饮品回归通过。双足专项新增实际鞋网格前后界限(-3,+6)及2–3头身几何检查，测得2.334。截图tests/player-face-smile.png、player-biped-detail.png；本地未发布。
## 2026-10-18 本地试作：细密字内光点、收窄光晕

- 用户指出字体光晕Scale太大，要求CRT参考的细密光点。预览标题/价格去掉2px+5px双层泛光，仅留0.65px窄泛光；字形遮罩内加两层半径0.3–0.35px、间距2.2/3.7px的固定细点，缓慢流光只移动明暗渐变，点阵不漂移。减少动态保持静止，多层clip与已购回退规则保留。
- node语法、npm run check、真实Edge/WebGL商店专项通过；三窗口截图更新，查看390×844效果，已刷新用户测试页。本地未发布，非手机实机。

## 2026-10-18 本地试作：字内明暗流光与辉光

- 用户参考CRT字体要求字体明暗对比/亮处璀璨并询问UI发光与后处理。测试页T3/T4/T5标题和价格用CSS background-clip:text渐变遮罩形成有暗部的窄白亮带，5.8秒流动（蓝7.2秒），字形drop-shadow叠近/远同品质光晕；正文保持原样。说明这是CSS模拟Bloom而非实际HDR后处理，保留DOM文字和布局；不支持clip时回退原色、已购停效、减少动态冻结。
- node语法、npm run check、真实Edge/WebGL商店烟雾回归通过（包括三窗口/减少动态/上下文恢复/购买清理），检查tests/shop-sugar-390x844.png并刷新用户测试页。本地未发布，非手机实机。

## 2026-10-18 本地试作：明确紫蓝与金红矢量配色

- 用户要求紫色背景包含蓝色，金色背景加入红色。预览矢量第二大斜块由蓝紫改鲜蓝#246df0、金棕改红#e13b4b；紫色细装饰改浅蓝，金色保留金主块并加少量蓝色细装饰。烟雾/闪粉和布局保持。
- node语法、npm run check与真实Edge/WebGL烟雾回归通过，三窗口截图更新，已查看390×844截图并刷新用户测试页。本地未发布，非手机实机。

## 2026-10-18 本地试作：紫雾增强与邻色矢量底纹

- 用户提供音乐UI顶部斜切图形参考，要求紫烟更强且背景叠邻色矢量。预览shop-sugar-preview.js紫烟软雾系数.35→.49，亮褶.14→.20；金色烟雾/两档闪粉不变。
- 为T3/T4/T5卡面叠内联SVG矢量大斜切色带/细线/小三角/点阵，分别蓝青+靛蓝、紫红+蓝紫、琥珀+橙金，背景上方用暗色渐变保护正文，烟雾和闪粉继续位于矢量底纹上方。仅本地材质测试页启用，已购禁用匹配避免残留。
- node语法、npm run check、真实Edge/WebGL烟雾专项和原材质画廊通过，覆盖三窗口/动态/减少动态/上下文恢复/实际购买；已检查tests/shop-sugar-390x844.png并刷新用户测试页。本地未发布，非手机实机。

## 2026-10-18 本地试作：接近极光亮度的烟雾

- 用户要求烟雾亮度接近极光、略弱一点。预览Shader烟雾以density软雾+.14*density³亮褶组合，金/紫基础强度.32/.35，顶部文字区域系数降至.62；金色暖金到奶金、紫色紫到青绿，保留原卷动/闪粉速度与密度。提升局部光带存在感，避免整面均匀抬亮。
- npm run check、材质画廊、真实Edge/WebGL烟雾专项通过；三窗口、灯光/法线/独立烟雾动画、紫色弱闪粉、减少动态、GL恢复与购买清理正常。更新测试区分明亮雾和稀少闪粉：约95%组合像素alpha≤100/255，alpha>128少于2%；单独闪粉98% alpha≤40/255。检查截图tests/shop-aurora-review.png与三窗口，并刷新用户测试页。本地未发布，非手机实机。



## 2026-10-18 本地：正向鞋头、瘦身与低位圆眼

- 按用户反馈重塑站姿靴前后轮廓：身体正前+Z，脚踝下为后跟/高靴筒，鞋底/浅色圆鞋头向+Z延长，前侧两条绑带分布在脚背与筒口，后跟保留深色短块，避免鞋头/靴筒颠倒的观感。脚接触和IK不变。
- 躯干宽18→14、深15→11；肩部中心±13→±10、肩球半径5→3.5，手臂/手掌收细，护甲前板和肩甲同步缩窄。头宽31保留，含双臂肩部最大宽27，突出大头小身比例。
- 圆眼中心局部Y42.5→38.2（头中线Y39下方），半径3.2→2.8、左右中心±7→±6.1；X眼与微笑/受伤嘴一起下移以留出额头。碎心时序/图案、参考配色、固定颈部弹簧不变。
- npm run check、真实Edge/WebGL双足支撑/骨长/六坐骑/三窗口、表情三阶段、头部快速回弹/不露底与饮品/上下文恢复回归通过。截图tests/player-face-smile.png、player-biped-detail.png；本地未发布。
## 2026-10-18 本地试作：更亮的烟雾与慢速密集闪粉

- 用户要求烟雾更明显/更明亮且轻透，Glitter略慢更密，紫色也有但弱于金色。shop-sugar-preview.js将烟柱宽度从.07+.09y扩大为.09+.12y，增加卷雾覆盖、提亮金色/紫青色；峰值alpha仍保留0.14/0.24，避免重新遮字。虚拟反射时间缩放0.68，金色晶面筛选范围增大/反光阈值降低；紫色新增偏紫闪粉，强度0.55且筛选更稀。
- npm run check、随身被动、材质画廊和tests/preview-shop-sugar.cjs通过。真实Edge/WebGL采样金色约97.4% alpha≤40/255，强高光约0.84%；同种子/光照/时刻紫色闪粉alpha能量13150，金色41591，验证紫色存在且更弱。独立烟雾运动、三窗口、减少动态、上下文恢复和实际购买清理通过。已检查截图tests/shop-sugar-390x844.png并刷新用户测试页；本地试作未发布，非手机实机。



## 2026-10-18 本地：参考机器人屏幕、裤装与靴子配色

- 按用户参考图，头部屏幕改为#35f7b0薄荷绿自发光CRT屏、切角圆润轮廓、灰绿边框和米白侧板/三道散热槽，并加左上角细裂纹。圆眼/微笑/X_X笔画改深青#08786e，粉红碎心颜色和0.1秒时序保留，原角度弹簧/头部姿态不变。
- 玩家裤装改近黑#172b2b，髋部/膝部连贯为深色裤腿，外侧细薄荷绿走线；靴子改青绿#329e9a，独立高靴筒/翻边、两道浅青绑带/浅色圆鞋头、深色厚鞋底和侧扣。保留鞋装备品质的小边灯。坐姿腿同步深色裤装/青绿靴，原站姿IK和坐姿姿态不变。
- npm run check、真实Edge/WebGL头部弹性/不露底、双足脚接触/骨长/暂停/六坐骑/三窗口、表情时序/重开和饮品回归通过。截图tests/player-face-smile.png、player-biped-detail.png及三窗口。本地未发布；桌面WebGL检查，非手机实机。

## 2026-10-18 本地试作：稀少强高光、近透明底纹与高阶升腾烟雾

- 用户指出糖霜导致文字不可读，要求极少强高光、非高光近透明；追加要求蓝色保留横扫，紫色及以上改升腾烟雾。Shader去掉漫反射底板，底纹alpha0.022；仅高阈值GGX/窄柔光箱反射叠少量晶面选择成为强高光，4采样以峰值适量提亮，标题附近高光降权。避免整块材质覆盖文字。
- shop-sugar-preview.js共享画布扩展到T4/T5，四层FBM域扭曲生成两股向上卷动的烟雾，金色max alpha0.14、紫色0.24，边缘/顶部淡出，与金色稀少晶面按预乘alpha合成。T4不绘制糖霜；蓝色仍用横扫。预览禁用高阶旧伪元素扫光/放射光；style.css正式样式为高阶添加双层向上柔雾CSS后备，保留品质色/绕边/大星芒。
- npm run check、随身被动、原材质画廊、tests/preview-shop-sugar.cjs、本次git diff --check通过。Edge/WebGL当前金色采样约98.97% alpha≤40/255，alpha>128约0.188%，峰值177；验证低档隔离、蓝横扫/紫升腾样式、独立法线/灯光/烟雾时间响应、减少动态、三窗口、GL烘焙恢复、实际购买/已购透明与上下文复用。截图tests/shop-sugar-*.png与shop-sparse-smoke-first.png；已刷新用户测试页，本地未发布，非手机实机。



## 2026-10-18 本地：对称粉红碎心

- 碎心改为#ff4f91粉红偏红色，半边像素轮廓严格镜像，去除两半高低错位及不对称删点，窄折线裂口保留；0.10秒碎心→0.42秒X_X→圆眼微笑时序不变。
- 修复头部旋转误转[0,2,0]自发光材质标记的问题，脸部显示笔画不再因仰角失去自发光而被灯光染黄；实体表面法线照常变换。
- npm run check、真实Edge/WebGL表情时序与头部专项通过；截图tests/player-face-heart.png确认粉红色对称两半。本地未发布。


## 2026-10-18 本地：受击先闪碎心，再X_X

- 实际掉血/护盾受击时，机器人脸部屏幕先显示0.10游戏秒的像素碎心（中央折线裂口、两半错位），随即显示0.42秒X_X，再恢复圆眼微笑。表情整体继续跟随头部，暂停冻结/无敌攻击忽略/重开清空规则保留。
- npm run check、真实Edge/WebGL表情专项验证0.099秒仍碎心/0.101秒已X_X、恢复微笑、护盾与重开/无GL异常，饮品回归通过。截图tests/player-face-heart.png；本地未发布。

## 2026-10-18 本地试作：按用户Blender节点图重做法线糖霜与伪光照

- 用户提供Object→3D Voronoi F1/Euclidean/Scale128/Randomness1的Color同时连接ColorRamp与Normal Map(Color)，Normal Strength0.5接Principled Normal，Metallic0/Specular0.5/Roughness0.1，并明确需要伪光照。按该结构近似实现，替换双重底色图片滚动；旧生成贴图文件保留但不加载。
- shop-sugar-preview.js在GPU首次/上下文恢复时将27邻域3D Voronoi最近点随机RGB与RGB亮度烘成1024² RGBA法线/色阶场；逐帧用同一RGB做切线法线Strength0.5、alpha做ColorRamp。默认金色，按钮可切参考绿粉。材质坐标固定；GGX粗糙度0.1/介电F0 0.04，两盏移动虚拟点灯与两条移动柔光箱环境反射生成受光闪烁。4次亚像素采样缓和细闪的像素块感；单画布/6常驻顶点/30fps、减少动态/离屏/已购规则保留。
- 新增预览专用伪光照开关和金色/参考绿粉按钮，renderShop重建保留控件/上下文。当前为本地测试页近似材质试作，并非完整Blender渲染器；正式商店尚未切换。
- npm run check、被动回归、原材质画廊专项、本次git diff --check通过。真实Edge/WebGL tests/preview-shop-sugar.cjs验证>99%覆盖、法线Strength/粗糙度参数、关光后0/0.8秒像素差0、开光差19.18/255、启停法线差28.76/255，实际光照/配色控件、三窗口、减少动态、GPU法线烘焙恢复、实际开盒/购买/已购清理均通过。截图tests/shop-sugar-*.png与shop-normal-reference.png；已刷新用户预览，本地未发布，非手机实机验收。


## 2026-10-18 本地：死亡粒子与两秒后失败 UI

- 致命伤保留 dead 状态，立即隐藏角色/坐骑/装备/头顶血条，爆出42块角色配色碎片和亮色粒子；停止战斗并清理弹幕、危险预警和浮字。先展示死亡效果，累计2秒后才打开“信号中断”重开 UI。
- 死亡等待使用帧真实时间，不受时停/滑板减速或普通玩法帧步长上限影响；隐藏页面沿用原暂停渲染规则。无异步定时器，重复受伤不重启，reset 清除待弹窗状态。复用原粒子更新/绘制。
- 新增 tests/test-player-death.cjs 并接入 npm test，覆盖粒子移动/角色隐藏、1.999秒不弹/2秒弹、真实时间、冻结战斗、重复受伤、重开取消与非致命伤。npm run check、死亡专项与完整 npm test 均通过；完整回归结果见 tests/player-death-regression.log。自动化渲染为 mock，未做实机视觉验收；本地未发布。


## 2026-10-18 本地试作：改为闪粉贴图真实流动

- 用户指出固定晶面没有流动、矩形细节人工感强，要求更简洁的贴图方式。使用imagegen生成自然密铺、细碎不规则/圆润糖霜晶粒金色虹彩贴图，复制到dist/assets/sugar-glitter-gold.png（1254×1254，约4.36MB）；不再使用Voronoi晶格/逐格法线/hash噪声生成材质细节。
- shop-sugar-preview.js只采样同一张GPU纹理的两层UV（主层约33/21 CSSpx每秒，次层反向约22.5/30px每秒）并轻微弯曲/明暗混合。自然纹理真正移动；镜像平铺配LINEAR过滤避免边缝和像素块。单次上传/上下文恢复上传，常驻6顶点/单画布继续保留；异步图像加载完成再挂载，正式版未接入。
- npm run check、node --check、被动回归、原材质画廊专项、本次git diff --check通过。真实Edge/WebGL tests/preview-shop-sugar.cjs新增纹理加载标记与像素位移相关分析：0.4秒图像细节最佳匹配偏移−13/+11像素，相关0.220对原地−0.009，确认是真流动而非仅高光改变；>99%覆盖/三窗口/减少动态/GL纹理恢复/实际购买重用和已购清理均通过。截图tests/shop-sugar-390x844.png、390x680.png、1280x900.png。已刷新用户预览，本地未发布；桌面浏览器验证，非手机实机。


## 2026-10-18 本地试作：满铺糖霜晶体 Shader

- 用户强调彩虹糖完全密的裹粉，要求Shader而非粒子。新增shop-sugar-preview.js，仅shop-preview.html加载；金色卡面用单WebGL上下文/6个常驻顶点/多个viewport绘制。9邻域Voronoi将每个像素分配给约1.6 CSS像素的固定晶面，面法线/金色与虹彩色/晶界/微面明暗共同形成连续涂层，移动光线与指针改变反射高光。无粒子、纹理图集或动态顶点。
- 测试页移除旧SVG闪粉DOM，保留大星芒/流光；Shader画布处于底板上、装饰与文字下，顶部减光以便阅读。重用同一画布/上下文应对renderShop重建，已购买区域透明；离屏/页面隐藏/减少动态停止动画，GL恢复重建资源，约30fps、DPR上限1.25。正式商店仍用前一版，当前为独立本地试作待评估。
- npm run check、node --check dist/shop-sugar-preview.js、被动回归、材质画廊专项与本次git diff --check通过。真实Edge/WebGL tests/preview-shop-sugar.cjs验证内部>99%像素连续覆盖/500+采样颜色、随时间反光、低Tier透明、减少动态冻结、GL丢失恢复、实际开盒/购买保留同一上下文和已购清理、三窗口无溢出/页面异常。截图tests/shop-sugar-390x844.png、390x680.png、1280x900.png；已刷新用户测试页，本地未发布，非手机实机验收。


## 2026-10-18 本地：较慢随机星芒与细密虹彩闪粉

- 用户要求星星略慢、位置随机，背景升起光点加密或改细密闪粉。T5星芒改为单次亮起后完全熄灭，每轮约0.64–0.86秒（Lv5），animationiteration仅在不可见边界换新位置，限定left8–88%/top10–86%，各星独立周期/错相。initShopSparkles使用独立LCG，不消耗玩法Math.random，无JS定时循环。
- 删除原8颗缓慢上升光点；装饰层新增shop-glitter与3个s图层，各用自写SVG点阵25颗、100×120像素重复，约百颗级0.35–0.85像素闪粉。金/暖白为主，少量粉/青/紫，各层1.3/1.67/2.04秒错相明灭与极小漂移。保留暖金底色/加粗扫光/3px追光边框，正文仍在上层。
- disabled整体隐藏装饰，减少动态关闭星芒与闪粉动画。npm run check、随身被动回归、材质画廊真实浏览器专项与本次git diff --check通过。额外Edge/WebGL验证1.1秒后星芒位置真实变化、范围/独立分布、样例0.8385秒周期、renderShop不消费Math.random、三层SVG闪粉与无旧上升光点、减少动态冻结/购买停效、三窗口无横向溢出/无页面异常。截图tests/shop-random-glitter-390x844.png、390x680.png、1280x900.png；已刷新用户测试页，本地未发布。


## 2026-10-18 本地：恢复暖金卡面、加快星芒与增强流光

- 用户撤销黑金武器卡面，恢复上一版T5统一暖金底色；移除gold-weapon-card类标记与专属覆盖样式，保留预览里的T5武器样张。
- T5星芒改为独立shop-quality-twinkle，周期为商店周期×0.1（Lv5为0.375秒，原2.625秒），四星按0/−0.09/−0.19/−0.28秒错相，明暗/大小快速变化。扫光从32–62%拓宽为22–72%，暖白核心更宽且alpha提高；追光边框从2px加粗到3px。减少动态/disabled停效沿用。
- npm run check、随身被动回归与本次git diff --check通过；真实Edge/WebGL验证暖金底色恢复、无黑金专用类、0.375秒周期、星芒在0/75/160ms的opacity为0.08/1/0.133、3px边框/宽亮扫光、减少动态停止与实际购买/装备。截图tests/shop-gold-fast-spark.png；已刷新用户测试页，本地未发布。


## 2026-10-18 本地：金色武器购买卡面改黑金

- 用户明确仅改商店武器卡面。renderShop仅对key=weapon且Tier5添加gold-weapon-card类；黑色漆面底板（#171719/#060708/#11100c）、金色标题/边框/价格、收窄金色扫光和减弱放射底光，保留金色绕边/星芒。其他T5装备/被动仍用原品质样式，战斗武器模型不改。
- shop-preview.html货架追加一张真实T5武器盲盒供黑金对照，可正常购买/装备；材质画廊继续保留。
- npm run check、随身被动回归、材质画廊真实Edge/WebGL专项及本次git diff --check通过。额外浏览器验证仅武器命中样式、黑底/金字计算样式、实际开盒/扣款/装备及已购停效，无页面错误。截图tests/shop-black-gold-weapon.png；已刷新用户预览，右下为黑金武器。本地未发布。



## 2026-10-18 本地：微笑表情恢复圆眼

- 按用户要求，正常表情的弧形笑眼改为青绿色圆形发光眼睛（局部半径3.2），保留U形微笑嘴和受击0.42秒X_X。
- npm run check与真实Edge/WebGL表情专项tests/preview-player-face.cjs通过；圆眼实景tests/player-face-smile.png，受击player-face-hurt.png。本地未发布。

## 2026-10-18 本地预览：小丑牌风格材质样张

- 按用户要求，在shop-preview.html顶部加入原版/闪箔/镭射/多彩/负片五张并排材质试作，下方保留原T1–T5动效货架。仅该预览页加载shop-editions-preview.css/js，不修改正式商品材质或出货规则。
- 共享一张320×400原创Canvas电梯核心图案，包含纸面、蓝灰机器人、红/蓝眼睛和金色装饰；一套WebGL上下文/纹理/常驻顶点，5个viewport展示四种自写近似Shader：蓝银波纹、彩虹亮斑、整面色相流动、HSL明暗/色相反转加冷色光泽。属于风格复现，不是原版Shader/美术。标签和说明为清晰DOM层。
- 点击选择材质说明；暂停/强度0–100可调、指针改变反光、减少动态/页面隐藏/离屏停动画，渲染约30fps、DPR上限1.5。预览购买/刷新货架会重新挂载同一画廊/上下文，WebGL上下文丢失恢复可重建。
- npm run check、node --check dist/shop-editions-preview.js、随身被动回归及本次git diff --check通过。真实Edge/WebGL tests/preview-shop-editions.cjs验证五材质像素不同、四材质时间动画/原版静态、暂停像素不变、零强度恢复原图、选择、减少动态、GL丢失恢复、购买保留画廊与三尺寸无横向溢出/无页面错误。截图tests/shop-editions-first.png、shop-editions-390x844.png、390x680.png、1280x900.png。本地未发布；桌面浏览器检查，非手机实机。


## 2026-10-18 本地：高阶商店追光边框与金色放射光

- 用户要求更浮夸的网页高阶流光。参考web.dev CSS border animations（https://web.dev/articles/css-border-animations）的锥形渐变/注册角度思路，自写T4紫青追光边框与极光底纹，T5双头金白追光边框、缓慢旋转放射光、8颗上浮微粒、更大的4颗闪烁星芒和更宽扫光。T1–T3原效果保留。
- 仅dist/style.css：@property --shop-orbit-angle与mask-composite:exclude将渐变裁成圆角细边，光效不拦截点击，正文/价格在内部效果上层。高阶disabled状态不生成新增伪元素；prefers-reduced-motion同时停止边框/微粒/极光/放射动画。注册角度无支持时保留静态边框；无新增依赖或JS循环。
- npm run check、tests/test-small-passives.cjs、本次CSS的git diff --check通过。真实Edge/WebGL验证T4/T5动画与遮罩、0.5/1.6秒角度56.47/180.71度、实际金色购买与已购停效、减少动态设置、390×844/390×680/1280×900无横向溢出和无页面异常。截图tests/shop-quality-extra-500.png、1600.png与尺寸截图；已刷新用户shop-preview.html五档对比页。本地未发布；桌面浏览器验证，非手机实机。



## 2026-10-18 本地：玩家微笑与受击X_X

- 正常表情改为弧形笑眼与U形笑嘴；实际掉血/护盾受击时，双眼短暂变X、嘴变下划线，持续0.42游戏秒后恢复微笑。drawPlayerFace的发光笔画随原头部/角度弹簧/坐骑/缩放一起变换。
- hurt通过无敌/闪避/拦截判断后记录p.faceHurtUntil；无敌期间忽略的攻击不刷新，补盾/回血不触发。受击表情期间暂缓人物/装甲闪烁隐藏，确保X_X可见，之后恢复原闪烁；无敌时长/伤害数值不变，新玩家自动清空。
- npm run check、真实Edge/WebGL tests/preview-player-face.cjs验证实际扣血、护盾受击、忽略攻击、0.42秒恢复、重开与GL正常；头部角度/固定锚点专项、饮品与上下文恢复回归通过。实景tests/player-face-smile.png、player-face-hurt.png；已刷新?headspring=1预览，本地未发布。


## 2026-10-18 本地测试：降低仰角、快速到位与更Q弹回摆

- 用户反馈头仰高/露底、到位慢并要求更Q弹：头部基础仰角由跟随镜头约58度降为42度，保留固定颈部角度动画，无独立平移。极限侧倾/点头下底面法线与镜头方向点积仍小于-0.218，底面朝离镜头。
- roll弹簧刚度150→650、阻尼12→16，pitch刚度170→700、阻尼14→20，加大起停角速度激励，降低相对阻尼以带短促过冲/衰减余摆。实际120单位/秒起步首峰0.10秒、约40%过冲，停步多次衰减过零；最大角度/固定颈部约束沿用。
- npm run check、真实Edge/WebGL头部与双足/六坐骑/三窗口专项、饮品/上下文恢复回归通过。头部专项新增首峰≤0.15秒、过冲/余摆、极限角度不露底断言。截图tests/player-biped-detail.png；本地未发布，预览?headspring=1。

## 2026-10-18 本地：独立铲子槽与靠近挖钱

- 新增独立铲子装备槽，开局基础掘金铲；T1–T5基础CD为30/26/22/18/14秒，商店盲盒、品质/价格/浮动、购买比较与测试装备接入。换铲保留金钱格完成比例，重开恢复基础铲，暂停面板显示铲子槽/CD。测试面板新增添加金钱格。
- 金钱格仅在玩家距离中心≤1.5格时推进；离开暂停，回到范围继续。原生产倍率叠加，钱袋/流水改为铲子CD×4/3、×2/3；震荡推进同样遵守距离，不能跳过最后挖掘。原限时房/BOSS禁用、库存和物理拾取规则保留。
- CD最后0.8生产秒显示铲子凭空出现、垂直下插、停在插入位置渐隐，无拔起环节；全程固定尺寸，通过材质透明度渐隐（32档常驻网格批次复用），完成才产钱。固定在格子中心正上方，仅下插阶段世界Y平移，范围外隐藏并冻结动作。专项增加无上移、透明度递减、模型不缩小断言。
- npm run check、完整npm test（tests/shovel-regression.log）、地块经济/被动专项通过。tests/preview-shovel.cjs实际Edge/WebGL验证范围/中途离开/换铲进度/五品质/付费替换/垂直轨迹/产钱时序/拾取/BOSS/重开/三窗口与无GL异常；截图tests/shovel-vertical-preview.png。桌面浏览器验证，非手机实机。本地未发布。

## 2026-10-18 本地：商店品质动效与升级正反馈

- 装备盲盒（武器/护甲/鞋/无人机）与随身被动的购买按钮按实际商品Tier显示动效：T1静态，T2品质柔光呼吸，T3斜向扫光，T4紫色双层流光，T5金色流光/暖金底光/4颗错时星芒/价格辉光。沿用WEAPON_GRADES品质色；饮品和无Tier补给保持原样。
- 商店Lv1–5通过父级CSS变量提高效果可见度（0.58→0.98）并缩短周期（5.55→3.75秒），金色周期再乘0.8；货架流光错相。upgradeShop成功后只在当次renderShop(true)给标题/升级区0.85秒亮起反馈。价格、出货、属性与购买规则不变。
- 动效裁在按钮内部，装饰层aria-hidden/pointer-events:none，正文/价格独立上层；已购买或其他disabled按钮隐藏动效；prefers-reduced-motion关闭动画。仅CSS transform/opacity驱动循环，无JS粒子/定时器。
- npm run check、完整npm test（tests/shop-quality-regression.log）、被动/饮品/地块商店专项及本次修改git diff --check通过。真实Edge/WebGL验证五档样式和动画、实际金色被动购买、金色武器开盒/装备、升级反馈和周期变化、禁用状态、减少动态设置、390×844/390×680/1280×900无横向溢出与无页面异常。截图tests/shop-quality-legendary.png、shop-quality-gold.png和shop-quality-*.png；桌面浏览器验证，非手机实机。本地未发布。



## 2026-10-18 本地测试：头部改为固定颈部的角度弹簧

- 按用户反馈删除lagX/lagZ位置弹簧、独立上下bob和相关速度状态；改由速度/加速度驱动roll与小幅pitch角度弹簧。头部绕局部Y27的固定底部中心旋转，保持原镜头正脸基准；转向与停步回弹，侧倾最多约6.9度、点头最多约3.2度，没有独立平移。正常120单位/秒移动专项实际峰值约4.7度。
- 专项tests/preview-head-spring.cjs改验固定锚点误差<1e-5、极限角度下头部中心仅沿约1.58单位短弧摆动、起步/反向/停步角度回弹、暂停、正脸基准与身体隔离。Edge/WebGL检查、双足/六坐骑/三窗口专项、饮品与上下文恢复回归、npm run check通过。已刷新用户?headspring=1预览；本地未发布。布偶效果仍为可撤销测试。


## 2026-10-18 本地测试：玩家正对镜头的脸与双足

- 头部采用现有700/440镜头的正交基：局部+Z正对镜头，局部+Y沿屏幕向上，侧倾在该平面内旋转；眼睛/面罩/天线/辉光及法线一起变换。头部惯性追赶身体继续保留，?headspring=0仅关闭弹簧，正脸和双足仍保留。
- 参考humanoid.js的世界脚接触/交替抬脚/两段IK方式，复用solveSpiderLeg、drawSpiderStrut。玩家双腿14/15单位长、独立膝关节/脚掌/鞋头灯，脚抬高5单位；支撑脚固定、按速度缩短步时，停步后逐脚站稳。上半身抬高14单位让双腿可读，装甲跟随；武器保留原出弹高度，手部提升后在腰部持枪。头顶血条上移，避免挡住天线。
- spider/ufo/sharkblimp/smallplane沿用原坐姿，其他站姿与原坐骑/跳跃/饮品缩放衔接。独立playerBipedGaits WeakMap随玩家重置，暂停冻结/传送重置，不改碰撞与玩法数值。
- npm run check、完整npm test通过（tests/player-biped-regression.log）。真实Edge/WebGL tests/preview-player-biped.cjs验证曲线移动时支撑脚320个样本不滑动、两腿交替/无双脚悬空、IK接触误差约3.6e-15、骨长/停步/暂停、六坐骑与三窗口无GL错误。tests/preview-head-spring.cjs验证真实面部法线始终对齐镜头，布偶回弹保留。
- 近景tests/player-biped-detail.png、全景player-biped-front.png、三窗口player-biped-*.png；已刷新用户?headspring=1预览。本地未发布；桌面WebGL检查，非手机实机。

## 2026-10-18 本地：随身被动接入T1–T5品质成长

- 用户否决全等级固定小数值：24种小被动现均有T1普通/T2改良/T3精良/T4史诗/T5传奇，共120种品质组合；共享装备WEAPON_GRADES颜色与rollShopTier出货规则（Lv1仅T1，Lv2–5有80%当前Tier/20%低一Tier）。装备原概率不变。
- 正面属性按Tier乘1/2/3/4/5，负面固定为T1代价。例如磨刀石伤害+3/6/9/12/15%，T5加重螺栓伤害+25%、攻速−2%。所有品质仍无生命上限/回血/护盾加成。
- 被动价格改为ceil((基础价4或5 + 2×(Tier−1))×既有商店倍率)+楼层加价，T5在Lv5商店为$48或52再加0–3深度价。已拥有道具按id:Tier分开计数；购买时按实际Tier累加，换装/升级商店不追溯放大。货架标题含Tier，边框/字色/品质标记和持有列表使用一致品质色。
- npm run check、完整npm test通过（tests/passive-tiers-regression.log），git diff --check通过。专项扩展五档正面/负面/价格、80/20出货、混合Tier叠加/持有/升级保留；饮品混合货架专项通过。真实Edge/WebGL验证T1与T5购买、金色边框和混合持有列表，三窗口截图tests/small-passives-390x680.png、390x844.png、1280x900.png。桌面浏览器验证，非手机实机；本地未发布。

## 2026-10-18 本地测试：布偶头部追赶身体

- 用户反馈上一版不明显，当前改成真正位置滞后：身体移动时头部世界位置由二维阻尼弹簧追赶，水平/纵深合计偏移最多11世界单位（约头宽1/3），反向甩动、停步越过中位后回弹。轻微颈部roll跟随偏移，上限约7.4度；身体仍直立，无yaw/pitch，脸持续朝前。眼睛/天线/辉光整体跟随，暂停、传送重置及坐骑/饮品后续变换沿用。
- 原独立开关/WeakMap/helper保留，方便整块删除。用户当时打开?headspring=0关闭对比页，本轮已将当前页导航至?headspring=1明确开启。
- npm run check、Edge/WebGL专项通过：移动/反向偏移约8.6/9.6单位，停步回弹越位约3.4单位，2秒后残留0.00012；身体顶点不变、暂停冻结、面部无转向、GL正常。专项tests/preview-head-spring.cjs，截图tests/head-spring-preview.png。本地未发布；用户待评估。


## 2026-10-18 本地测试：玩家头部轻微弹性

- 仅玩家头部增加临时阻尼弹簧：按实际移动距离驱动轻微步态弹动，横向速度变化产生颈部滞后回弹，停步收敛。身体保持直立，头部只绕颈部小幅侧倾（上限约5.4度）/上下位移（上限1.3世界单位），无yaw/pitch；眼睛、面罩、天线及辉光整体跟随，法线同步旋转。继续复用原坐骑/跳跃/饮品缩放变换。
- 独立 PLAYER_HEAD_SPRING_TEST 开关与两个 helper，WeakMap 随新玩家自动重置；?headspring=0 可关闭对比。跟随游戏time暂停，传送/较大时间跳变归零，无碰撞/数值改动，方便后续整块撤除。
- npm run check、完整npm test及真实Edge/WebGL专项tests/preview-head-spring.cjs通过：实际移动/反向/收敛、暂停冻结、身体顶点不变、头部深度不变、关闭开关、无GL错误。截图tests/head-spring-preview.png；完整回归日志tests/head-spring-regression.log。已刷新4173主游戏，本地未发布；临时测试效果，待用户评估。

## 2026-10-18 本地：小幅随身被动填充商店

- 新增24种不占装备槽的随身被动，约占金币货架1/3；16种纯增益/组合、8种轻微取舍。七类属性：伤害、攻速、移速、暴击率、暴击伤害、拾取半径、补给生产速度。典型单件2–3%，取舍款最多5%常规增益，暴击伤害最多10个百分点。全部本局永久、同款加法叠加，重开清空。
- 基础价$4–5，加既有封顶$3楼层加价；不受商店等级价格倍率/效果倍率放大。原轻量骨架和生命核心退出普通商店池，回血保留；已有关卡奖励和装备独立属性不改，新被动均不加生命/护盾/回血。
- 战斗伤害结算、攻击冷却、移动、暴击、拾取和补给生产均接入；累计值缓存，避免每次攻击遍历目录。攻速/移速/伤害/生产最低倍率0.25，暴击率限定0–100%。商店明确标记永久叠加，并可展开已持有数量、单件效果和累计属性。
- 专项tests/test-small-passives.cjs覆盖24种出货、固定价格/效果、购买扣款/重复点击、叠加/取舍、真实属性入口、换装保留、无血量膨胀、重开重置及极端叠加边界。同步更新饮品混合货架测试。
- npm run check、完整npm test通过（tests/small-passives-regression.log）；git diff --check通过。Edge真实WebGL购买和三窗口验证通过（tests/preview-small-passives.cjs），截图tests/small-passives-390x680.png、390x844.png、1280x900.png。桌面浏览器验证，非手机实机；本地未发布。

## 2026-10-17 本地：未激活格进一步压暗、每格仅一个固定随机符号

- 用户确认旧效果已显示，但要求更暗且每格一个符号。未激活板底色#454f63→#303b4d、弱自亮0.14→0.11；暗纹颜色/alpha调整为(.18,.21,.31)/0.50。实景亮度中位数激活46.03/未激活34.02，未激活约低26.1%（上一轮低14.4%）。
- 使用现有生成图集8列×7行，每格按固定坐标hash选一格，裁掉8%边缘，随机固定四向旋转；27×30世界单位的单个纹样居中，不再以48×51面积满铺4×4纹样。扩建不会改变其他格的符号，不随时间跳变。revision orbital-31。
- npm run check及实际Edge/WebGL专项通过：单格UV不跨图集单元、44个未激活格264顶点、多于10种符号、重建选择稳定、实际暗度<激活75%，同时保留异形招牌独立断电、9/49/99/143格扩建、GL恢复与三窗口。日志tests/single-glyph-check.log、single-glyph-browser.log、single-glyph-abyss.log。正式流程重新加载后亦截图验证，旧的已运行页面需重新加载JS才能看到新样式。
- 实景tests/inactive-floor-single-symbol-final.png及atmosphere-single-glyph-final-abyss-campaign.png。本地未发布；桌面浏览器验证，非手机实机。


## 2026-10-17 本地：切角激活地板、暗纹未激活地板、异形招牌与独立闪灭

- 用户新增两项地板要求：仅夜城激活板改为8点切角实体，含低侧壁/1.2单位斜面和缩入面板，保留功能图标、边界线与13×11碰撞规则。其他场景继续原方板。未激活板颜色调整并升到顶面Y0.4（原负高度会被闭合底座Y0遮住），符号纹样叠层Y0.55，已激活板顶面Y2。
- 内置image_gen参考用户几何符号背景生成透明assets/inactive-floor-glyphs.png，仅未激活格贴图，每格约4×4几何符号。独立静态纹理/缓冲复用及上下文恢复，扩建时移除对应格暗纹。实景普通激活/未激活亮度中位数46.03/39.38，未激活低约14.4%，符号低对比不抢功能标记。
- 用户反馈旧招牌同模且碎：另生图assets/side-neon-signs-distinct.png，四个独立身份分别圆形“夜”、不对称切角“星港遊藝”、胶囊长牌“雲際商店”、多边形面碗图标。各为真实世界XY实体（24/37/29/33厚），不同截面轮廓与面片范围；全部仍正面无yaw。背景改为1–3个完整大色面/平滑渐变，不保留原碎纹；原图集文件保留。
- 招牌shader新增错相故障事件：每7.3秒周期的伪随机事件，短暂预闪0.08秒、断电0.29秒、恢复错位0.16秒，约75%的周期触发，4牌不同phase；常态仅很浅呼吸。UV错位限制在自身atlas格，仍缓存静态几何，不重传图集。
- 实际Edge/WebGL专项tests/preview-deck-signs.cjs验证地板实际像素明度、2376个斜面顶点、仅未激活264贴图顶点、9/49/99/143格扩建对应暗纹数、4种招牌轮廓、逐牌断电/恢复和无同步全灭、资源复用/GL恢复及三窗口。结果tests/deck-signs-results.json，日志deck-design-browser.log。实景deck-signs-9/49/99/143-tiles.png及三窗口。
- npm run check、完整npm test、深渊真实WebGL/六种其他场景兼容、玻璃流动电路专项通过；日志deck-signs-check.log、deck-signs-regression.log、deck-signs-abyss.log、deck-signs-compat.log、glass-circuit-browser.log。后景贴图雨保留、无前景粒子雨；玻璃alpha波保持。桌面浏览器验证，非手机实机；本地未发布。


## 2026-10-17 本地：一体赛博灯箱、仅后景雨幕与流动电路玻璃

- 按新增三张参考重新用内置image_gen生成不透明一体字形/背景图集 assets/side-neon-signs-integrated.png：四列完整竖牌，紫色碎片、青紫渐变电路线框、粉橙工业斜纹与竖向定制字形融合。保留旧资产。
- 四个真实世界XY灯箱均四角切角，其中两牌采用交替大小切角；外壳厚37、前唇真实斜面、内凹开口/背面/侧面/支架与断续光槽，图集按同一切角多边形裁切，避免矩形贴纸露边。每牌18个贴图顶点，renderer按静态ranges批次绘制，GPU缓存/恢复沿用。
- 用户要求去掉前景粒子雨：删除96根雨线与30组落地涟漪绘制，rainForegroundCount=0；三层后景贴图雨幕、动态UV/受光/雨开关完整保留。回归的几何雨数量/运动断言相应改为无前景几何，贴图雨真实像素动画仍有独立检查。
- 24片真实玻璃新增资产glass-circuit-traces.png，用PCB线路/45度拐弯/焊盘纹理。静态叠层沿实际玻璃外偏0.35单位，144顶点，独立GPU纹理/缓冲缓存；shader只改变局部alpha波，周期约8.38秒，线路位置不滚动，暗部alpha约0.002、亮带最高0.722乘线条mask。玻璃原底色/低alpha不改。纹理显示尺度460世界单位，抑制生成光晕以免变成不透明底板或噪点。正式战斗沿游戏时间暂停，实验室沿环境时间，其他场景不绘制。
- npm run check、实际Edge/WebGL玻璃专项、完整深渊回归及完整npm test通过。玻璃专项验证实际像素显隐/同时间静止、真实贴面误差、24片/144顶点、GPU缓存、其他场景隔离、实际GL丢失恢复及三窗口；日志glass-circuit-browser.log、glass-circuit-results.json、glass-circuit-abyss.log、glass-circuit-regression.log。灯箱专项glass-circuit-signs.log验证世界竖直/真实顶部与37厚/四切角/面片在外壳内部/无前景雨/后景雨存在。
- 实景tests/urban-circuit-final.png，glass-circuit-time-0/2.6/4.png，glass-circuit-390x680/390x844/1280x900.png；已刷新用户4173原预览页并隐藏界面，内嵌浏览器实际观察线路显隐。桌面浏览器验证，非手机实机；本地未发布。保留同工作区其他修改。


## 2026-10-17 本地：简洁枪口尖芒/火花与独立枪身后坐

- 按用户开枪参考，为主武器枪械增加0.10秒（狙击/火箭0.12秒）的暖白中心、主题色长尖芒、两侧短芒和3条向外迸射的亮线碎片，枪口前方短焰延伸以避免角色/血条把核心完全遮住；使用少量透明面片和辉光，不生成额外伤害对象。低阶暖黄/白，高阶随弹体主题色，重型枪闪光更大。
- 以真实每轮shots的launchDelay排入纯视觉事件：五连点射每0.075秒各自闪光/回弹，双枪有两个枪口，追踪弹按逐管延迟发射。持续束仅启动时触发，剑/回旋镖不套枪械效果。事件最多32个，存于装备非枚举fireVisuals，避免改变商店揭示/装备数值序列化；换枪及过层清理待播放事件。
- 全枪模沿瞄准反向整体位移，0.014秒达到后坐峰值后指数复位，0.22秒精确回到原位；手枪/机枪/卡宾幅度有别，狙击/火箭更重。普通枪不推动角色，原狙击/火箭的实际玩家后退继续保留；暂停随游戏时钟冻结。替换旧shootTimer阈值圆光点和仅重型枪的简化模型回弹。
- npm run check、完整npm test、武器进化/VFX专项、商店真实装备值回归test-63、git diff --check通过；日志tests/muzzle-recoil-regression.log。专项验证枪模每个顶点整体后退/精确复位、普通枪玩家不动、闪光过期、连点射/双管对应时刻、非枪隔离和换枪清理。
- 真实Edge/WebGL测试通过，20组阶段截图（pistol_t1/smg_t2/uzi_t4/rifle_t4/sniper_t5，0.02/0.06/0.14/0.32秒）在tests/weapon-vfx-*.png；日志tests/muzzle-recoil-browser.log，原弹体/刀光/烟火/激光/金属与GL恢复仍通过。桌面浏览器验收，非手机实机；本地未发布。

## 2026-10-17 本地：细密分层雨与靛蓝夜城

- 新增dist/rain-curtain.js独立GPU雨幕扩展，index在renderer后加载。生成竖直柔化雨纹assets/rain-dense-vertical.png，三层真实深度2500/1750/1300，横向重复72/52/36、纵向19/14/10，错开相位/速度/模糊。alpha阈值抑制源图灰底，避免宽光带/极光；保留96根近景雨丝。雨幕接受场景灯色及空间衰减、距离雾，开启深度测试但不写深度，位于整座电梯后方；静态GPU数据复用、关闭雨及上下文恢复已验证。提示词tests/rain-curtain-prompt.txt。
- 四块侧挂生图霓虹招牌、切角实体底板、独立呼吸/故障变暗，另有动态块状故障建筑立面。招牌当前布局/素材可能由并行本地招牌迭代继续更新，不覆盖其修改。
- 按最新参考将默认violet夜城向靛蓝调整：距离雾RGB(.105,.095,.48)，顶光(.38,.46,1)，左光(.14,.51,1)，右光(.62,.27,.72)，三层氛围雾改靛蓝/蓝紫。建筑窗灯和灯带增加青蓝、冰蓝、蓝灰色，保留少量暖窗/粉紫点缀。URL仍使用look=violet；场景revision orbital-25。倒计时仍紫橙。
- npm run check、完整npm test通过（tests/rain-curtain-check.log、rain-curtain-regression.log）；深渊真实WebGL、多窗口、雨幕动画/受光/深度/资源复用、关闭雨及上下文恢复通过tests/indigo-rain-browser.log，其他六种场景配色兼容通过tests/indigo-compat.log。截图tests/atmosphere-indigo-rain-abyss-violet.png。已刷新4173场景预览并隐藏界面供观察。本地桌面浏览器验证，未发布，非手机实机。

## 2026-10-17 本地：电梯暗部提亮、定制竖排实体灯箱

- 先截图 tests/urban-lighting-before.png，内置 image_gen 按实景与用户港式霓虹参考制作明度调整稿 tests/urban-lighting-concept.png，再生成招牌图集。用户否决普通字体后重做为粗笔切角/断笔/嵌线的四组定制中文字标，最终资产 dist/assets/side-neon-signs-designed.png；保留旧资产。
- 用户随后明确灯箱须沿世界竖直、有实体厚度。最终四牌均为世界XY正面、yaw=0，不使用朝镜头面片；实体前后面相隔35单位，含真实顶部/侧面/背面及支架，正交俯视自然看见顶部。文字竖排，牌位不挡中央倒计时及战斗区域。最初朝镜头版本已被此要求取代。
- 仅调整该场景立柱、滑靴与底座分层材质底色，保留深色金属，分清棱边/切面；招牌呼吸亮度下限提高并减轻故障暗闪。固定13×11地图、镜头、玻璃护栏、城市和玩法不变。
- npm run check、完整npm test及实际Edge/WebGL深渊回归通过；tests/urban-neon-check.log、urban-neon-regression.log、urban-neon-browser.log。测试原黑钢低亮度断言随材质更新为可读深灰区间。专项 tests/preview-urban-lighting.cjs 验证四牌世界竖直、投影上沿水平、真实顶部前后顶点和35厚度、最终纹理、GPU缓存及无GL错误。实景 tests/urban-lighting-after.png；包含三窗口/战斗/GL恢复的实景 atmosphere-urban-neon-final-*。桌面浏览器验收，非手机实机；本地未发布。


## 2026-10-17 本地：玻璃护栏、真实距离雾与三类动态霓虹立面

- 替换原工地钢管栏杆为24块透明玻璃护栏（前侧6块，高78世界单位），少量黑色底夹，紫蓝发光边与很淡的斜向反射；无中间横管/金属网。玻璃alpha前0.095、其他0.135，深度测试但不写深度，保持人物/城市通透。原黑色主支架、底座与固定13×11场地不变。
- 回答并修复下层建筑“不受雾”问题：旧方案主要是高度染色/几层透明雾片；现在城市实体、窗灯和实体广告使用视线深度的指数距离雾，颜色与原饱和雾层一致。用法线长度标签区分城市普通面/发光面，避免改变9-float顶点布局；电梯/玻璃/角色不在城市雾化范围。不是体积光线步进雾，保留原氛围雾层。其他场景sceneFogDensity归0。
- 新增三类直接贴合实际墙面的立面：两栋瀑布霓虹（10块跨楼层光幕，着色器纵向流动）、两栋斜切交叉灯带（10条），中央圆楼前侧竖向错位折线灯（200个相连片段）。选中装饰面不叠普通窗/普通灯带，避免共面Z-fighting；对应旧广告面移开，其他生图广告和投影广告保留。光幕为宽光丝/长尾，符合既有块面风格。
- 2413片小矩形窗各自编码固定相位，GPU shader约15–25秒周期平滑呼吸明灭，不同步闪烁；仅更新时间uniform，不改写/重传城市网格。实验室随环境时钟动画，正式流程随游戏时间/暂停。瀑布、切线、窗灯一起受距离雾。
- 实景tests/atmosphere-neon-facades-final-abyss-violet.png及三窗口/实战/正式流程截图。真实浏览器验证218个可见窗取样：0.05秒RGB总差均值约0.29，8秒约10.73，45个窗有显著变化；下层雾强度约0.566–0.782，关/开雾实际底部像素变化约54,659，静态几何仍复用。玻璃数量/透明度/矩形/边界外，三立面数量、贴面误差/矩形、原车流/雨向/倒计时/三窗口/上下文恢复均通过。
- npm run check、六种氛围兼容、深渊实际WebGL检查通过：tests/glass-fog-check.log、glass-fog-browser.log、glass-fog-compat.log。完整npm test通过，日志tests/neon-facades-regression.log。已刷新并保留4173实验室预览，隐藏UI观察动态。桌面浏览器验收，非手机实机；未发布。git diff --check通过。


## 2026-10-17 本地：平滑椭圆刀光、同色模糊剑气与三顺三逆

- 天顶剑刀光不再依赖每帧位置历史直接连片：抽出共享zenithPose解析椭圆，在每次绘制时按最大0.018弧度角步重建最近0.18秒连续扫掠。内外边使用三条跨宽度alpha渐变带并在刃身附近柔化，保留无白色故障边。运动/碰撞仍走原0.41秒完整椭圆，不改变伤害；33FPS与200FPS相同时间生成完全相同的刀光几何。
- 应用户后续指定，逐剑方向从交替改为固定“顺时针3刀 → 逆时针3刀”循环；仍0.14秒逐把出手，六色与独立随机短轴/倾角保留。每剑存储orbitDirection，解析运动和刀光共用方向，专项连续12次出手及实际四分之一圈位移验证3+3重复。
- 普通剑挥砍沿用旧刀光贴图/扫掠算法，但增加型号主题色着色，T1蓝/T2绿/T4金与发射剑气一致。sprite着色器新增可选tint，旧未指定色的贴图和场景广告保持原色。
- 剑气从硬实色弧面改为128×128 RGBA柔边贴图：亮弧前缘＋Gaussian模糊边＋沿速度反方向指数衰减的长尾，端点也渐隐；三档共用白色mask再按型号着色，每帧仅一面片，纹理延迟创建/复用/GL恢复重传。两道剑气原同方向/0.12秒延迟、碰撞与伤害不变。
- npm run check与武器进化/VFX专项通过，包含无历史仍绘制平滑刀光、低高帧率一致、刀光/剑气tint相等、亮前缘/模糊尾部alpha关系、3+3方向。真实Edge/WebGL浏览器检查通过，新增三档剑气截图tests/weapon-vfx-sword_t1-0_27.png、sword_t2-0_27.png、sword_t4-0_27.png、sword_t5-0_23.png，颜色和新剑气纹理真实上下文丢失/恢复检查。日志tests/smooth-sword-browser.log、smooth-sword-regression.log。桌面浏览器验收，非手机实机；本地未发布。

## 2026-10-17 本地：紫橙统一受光、紫色光条、朝镜头倒计时与细窗

- 深渊场景新增sceneGrade=1着色开关，静态/动态普通几何及常驻角色共享相同场景参数：紫色顶光、紫色左侧光、橙色右侧光，环境/前光改为偏紫暖光，降低原地板88%去色处理以接受场景染色。第二轮把地板烘焙底色调回偏紫灰金属，避免整片过亮粉红。默认/其他场景重置sceneGrade=0，原灯光路径保留。
- 删除该场景所有黄黑踢脚斜纹及baseFloor原前沿斜纹，改为连续紫色发光条，卡扣/四角状态灯同步偏紫，黑色主支架保留。
- 背后时钟按用户新要求改为面向镜头的世界平面，260×260在正交投影下为正圆，仍位于背景深度并受遮挡，不改回HTML UI。仅该场景的剩余扇区改紫至橙水平渐变，频谱条为同一紫/洋红/橙色域；读数/标签为暖白。计时/音乐/暂停/透明消逝及结束隐藏沿用原逻辑，其他场景彩虹钟不变。
- 楼房窗组垂直间距从65降至39，单层列数3→5、圆楼1→2，矩形窗高度7–17、最大宽约20.47世界单位；贴墙/矩形检查继续通过，保留暗窗/粗细灯带和大块立面。
- 两轮WebGL实景截图tests/atmosphere-cohesion-final-abyss-violet.png及三窗口/正式流程截图；已刷新并保留4173实验室预览。npm run check、完整npm test（tests/violet-cohesion-regression.log）、六种其他氛围兼容、完整深渊浏览器检查通过；日志tests/violet-cohesion-check.log、violet-cohesion-browser.log、violet-cohesion-compat.log。
- 新检查验证主/常驻角色实际GLSL场景uniform均1，退出场景归0；时钟投影正圆、实际Canvas左右采样为紫(129,45,213)/橙(239,146,106)，无黄色斜纹顶点；窗尺寸与贴面、计时/暂停/上下文恢复、动态投影、车流/城市等检查保留。桌面浏览器验收，非手机实机；未发布。git diff --check通过。


## 2026-10-17 本地：竖直原比例生图字标、闭合底座与统一黑色支架

- 按用户四项反馈重新处理底座：新增与平台底面/底座重叠的实体闭合领圈（Y0至-76），首层底座从Y0接起，封住原先透出紫色背景的横缝。真实GPU采样前缘29点，紫色漏空像素为0。
- 字标改为内置image_gen生成的赛博定制字形“云际交通 / SKYLINE TRANSIT”，透明PNG dist/assets/elevator-cyber-wordmark.png（2172×724，alpha0–255），切角/断笔/青紫嵌线。完整提示词tests/elevator-cyber-wordmark-prompt.txt。移除Canvas系统字体生成逻辑，保留透明混合/缓存/上下文恢复。
- 招牌仍为真正世界XY竖面，贴前壁Z=f+12外偏0.35，取消先前为可读性进行的纵向拉高：世界宽高480×160严格保持图片3:1原比例，不做朝镜头旋转或比例补偿，自然接受俯视投影的压缩。
- 删除原四条白/银导轨及偏内侧独立黑支腿，重建同一组四角黑色工字钢柱（X±377，Z=b-24/f+24，Y-2100至1250全程连续），滑靴/接头及后方开放横框统一深黑材质。保留原工地灰色细管护栏、黄黑安全条、少量状态灯、块面底座/霓虹和完整下层城市。
- npm run check、GPU residency、六种氛围兼容与深渊真实WebGL回归通过：新测试直接验证原图宽高比、世界竖面/贴壁、PNG透明、四角钢柱范围/黑色材质、实体领圈/实际漏空像素，并保留计时暂停/消隐、雨向、98车、72小楼/6球体/27桥、贴面矩形灯窗、三窗口/移动战斗和上下文恢复。日志tests/black-frame-check.log、black-frame-browser.log、black-frame-compat.log；git diff --check通过（其他线程CRLF提示保留）。
- 实景tests/atmosphere-black-frame-v1-abyss-violet.png及三窗口/正式流程截图；已刷新并保留用户4173预览。桌面浏览器验收、非手机实机，未发布。


## 2026-10-17 本地：连续下层城市、球形建筑/天桥与镜头拉近

- 下层城市由四栋改为8×9共72栋小楼，交错布置实际高度/进深，覆盖电梯下方、周边和可见底部；混合倒角、退台、圆柱和高低屋顶。所有窗/灯带继续由真实墙面构造矩形，保持0.35贴合间距，无菱形窗。
- 新增六座球形建筑与支撑细柱，27座独立连接邻楼的步行天桥（桥面、双侧扶手、桁架斜撑及灯边），城市桥梁不承载车流，98辆飞车/18辆近车仍走独立凌空航路。第二轮下移一座中央球体，使底座下面的球体轮廓和相连天桥更清楚。
- 按用户“镜头近点”，正交cameraScale从1.36改为1.18，画面物体约放大15.3%；13×11地图范围不变，四角仍在画面内，最外侧工业框允许贴近/出画。不同窗口下可见城市范围随构图变化，短屏裁到部分装饰球体不影响战斗区域。
- 两轮真实WebGL截图：tests/atmosphere-dense-final-abyss-violet.png及390×680/844、宽屏/实战/正式流程截图。npm run check、六种氛围兼容、GPU residency及深渊完整浏览器检查通过，日志tests/dense-city-check.log、dense-city-browser.log、dense-city-compat.log。检查中36个小楼屋顶在画面内、底部五个横向分区均覆盖楼群；6099个贴面发光四边形/1108窗、球体6、桥27、正交近景比例、场地四角、雨向/飞车/动态投影/计时暂停与上下文恢复均通过。
- 已在4173打开并保留更新后的实验室预览，隐藏UI可直接看场景。真实桌面浏览器验收，非手机实机，未发布。


## 2026-10-17 本地：15型号独立赛博弹体图集

- 根据用户赛博弹体参考，为4手枪/3机枪/2双枪/3卡宾/3狙击分别配置15种独立轮廓：火花尖梭、哨兵菱晶、北极星芒、裁决光矛、灼热短镖、分段曳光、三线电芯、双叶飞梭、双生毒牙、缺口箭头、三节箭簇、破晓长刃、贯穿长针、熔芯重矛、天穹轨道晶。不同型号分别搭配空心方片、括形翼、并行短线、分段光块、箭簇、刻线、背鳍；高阶形状/细节更多，保留白芯/鲜艳对比色/透明渐隐尾迹。
- CYBER_BULLET_ART逐型号配置形状，首次用多边形光栅化生成512×256 RGBA共用图集（15枚128×64单元、透明边距、抗锯齿），每发仅一个平面sprite＋辉光，不恢复实体模型。保留原伤害/碰撞/速度/发射节奏及成长尺寸。GPU图集仅创建/上传一次，普通帧复用，GL恢复用缓存像素重传；其他武器/敌弹沿用现有路径。
- 新专项验证15个alpha轮廓hash全部不同（不是只换色）、全部型号选用正确格、可见/半透明像素与透明边距、有限sprite、零实体几何、同一纹理复用。真实Edge/WebGL逐枪截图、15弹体对照与图集导出、实际GL丢失/恢复通过；tests/cyber-bullet-models-contact.png、cyber-bullet-atlas.png、cyber-bullet-browser.log，结果包含15型号与恢复检查。桌面浏览器验收，非手机实机；未发布。
- npm run check、完整npm test、测试场真实控件回归和git diff --check通过；日志tests/cyber-bullet-regression.log、cyber-bullet-lab.log。保留并行场景工作。

## 2026-10-17 本地：灯光贴合实际墙面、矩形窗与正交下层城市

- 删除独立近似轮廓的surfaceAt灯光生成：每块窗/灯带/大面发光玻璃直接由对应实际墙面四顶点与法线生成，沿该面正交基构造矩形，统一法线外偏0.35单位防止Z-fighting，并检查四角不越过倒角/楼层接缝。切削收分墙面保持为平面，删除窗户人为斜切/剪切；当前468片窗均为真实矩形，不再菱形。
- 去掉不跟随楼体收分的竖条、层间漂浮横条和基于椭圆公式的悬空环。圆楼灯带按16边真实面分段；观景球和圆盘塔按各自实际球面分片贴灯，不再套过大的独立圆环。保留明暗/粗细变化、立面大色块和块色城市广告/投影效果。
- 保持用户要求的正交相机，新增四栋更深层城市楼体，其屋顶重新摆在正交画面下方可见范围，填回底座下面的空洞并保留车流空间，未恢复透视。原楼群/格子/底座/护栏和玩法不变。
- npm run check、真实WebGL深渊场景回归、六氛围兼容和GPU residency专项通过，日志tests/attached-lights-check.log、attached-lights-browser.log、attached-lights-compat.log。新增从实际sceneData读取2984个发光矩形与对应实际墙面，最大贴面距离误差0.000222、相邻边非垂直误差0.000051，四栋下层屋顶均在画面下部可见。其余倒计时/雨向/车流/着色器动态像素/静态缓存/三窗口/上下文恢复检查保持通过。
- 实景tests/atmosphere-attached-v2-abyss-violet.png及正式战斗/三窗口截图，已刷新用户4173原标签页并隐藏界面。桌面浏览器验收，非手机实机；未发布。git diff --check通过（其他线程CRLF提示不属于本轮修改）。


## 2026-10-17 本地：命中冲击、金属回旋刃、加速椭圆剑与流动激光

- 火箭T3/T4/T5命中增加0.18秒白热中心面片/尖芒/辉光，56颗不同仰角和速度的弹道火花，以及1.15秒冲天翻滚烟柱。原能量网格/断环与T5蘑菇云保留，T3/T4效果寿命延长至1.15秒；伤害判定不变。逐帧截图tests/weapon-vfx-rocket_t*-0_025.png、0_08/0_3/0_6/0_95。
- 天网追猎者T4也改为四向分散发射（相邻90度），与T5六向一致先分向再追踪，保留发射间隔；旧非型号飞弹/无人机严格向上。
- 按用户指定，荧光绿机械三刃升为最高T5日蚀王冠：深色钢脊、宽绿色切削刃、每刃8个背齿、发光轮芯，原金紫四刃移至T2。全部回旋镖旋转改为-time*19，锋口朝前。四档金属表面新增独立surfaceMode=3：片元着色器使用经过实例旋转的真实法线计算宽反射与窄白高光，发光面片不参与金属反射；仅回旋镖启用。GPU缓存与上下文恢复保留，其他材质模式不变。
- T5剑完整回旋从0.82秒缩为0.41秒，保持0.14秒逐把发射。出手后固定中心/起点，移除随机剪切，随机短轴与倾斜继续保留；每4毫秒内细分采样，最多96点、0.18秒色带，删除白色外沿并在刀身附近渐隐。新增椭圆方程/移动玩家不变形/整圈精确返回/速度2倍/无白边回归。
- 群星追缉令改为高度24的真实命中点立即炸开，移除升空阶段、延迟和高空爆心。删除双环/螺旋两款，FIREWORK_STYLES现为[0,1,3,4,6]，五种向外散射/垂落/二次分裂火花，低空展开并保留近地淡出；伤害半径55、装饰半径210不变。
- 白昼终点光束用128×32真实RGBA平铺贴图替代硬实色面，U按90世界单位一周期平铺并沿时间滚动，每帧只改UV；纹理有白芯、青色流纹和软透明侧边，延迟创建/缓存/上下文恢复重建。底部光晕/起点圆斑扩大柔边、降低外缘不透明度；原激光命中不变，T4分叉束仍原路径。
- npm run check、完整npm test及武器专项通过；新增透明侧边/UV多次平铺与滚动/纹理复用、真实命中点烟火/无回环、T4分向、T5绿色金属/旋向、火箭亮闪/56火花/上升烟雾等断言。真实Edge/WebGL浏览器回归通过，验证金属/无金属数千个GPU像素差、滚动激光实际像素变化和GL丢失恢复，无脚本/GL错误。日志tests/weapon-impact-flow-browser.log、weapon-impact-flow-regression.log；图片tests/weapon-ornate-wheels-detail.png、weapon-zenith-rapid.png、weapon-laser-flow.png。本地开发，未发布，验收为桌面浏览器而非手机实机。

## 2026-10-17 本地：恢复正交镜头、透明文字与叠层切面底座

- 按用户最新要求，orbital场景覆盖原depth模块的透视开关，恢复renderer既有58度正交投影，cameraScale保持1.36以容纳工地框架；远近等宽结构投影尺寸一致，地图仍固定13×11。其他场景相机不变。
- 底座移除广告图片/背景板，改为透明Canvas双语文字“云际交通 / SKYLINE TRANSIT”，保留世界竖直面，与底座正面一体。品牌绘制流启用透明混合且关闭深度写入，透明像素不会盖住实体；纹理只在初次/上下文恢复时上传。城市广告和投影广告继续使用前轮块色生图图集。
- 原整块舱壁改为八层截面的厚底座（世界Y -30至-650），含八边切角、收分、内凹/外凸叠层、重叠装甲和进气槽；三组霓虹跟随真实壳体切边。厚度针对正交构图调整，避免旧1120厚度出框，工地护栏/钢框、近远车流、降雨与世界倒计时保留。
- npm run check、GPU residency及background waterfall专项、六种氛围兼容、深渊真实WebGL浏览器验证通过。深渊验证更新为正交等尺寸/四角/震动、透明文字零背景alpha及有效字像素、底座层数/霓虹数；原计时/暂停/消隐、投影着色器像素变化/缓存、98车/18近车、雨向、三窗口与实际上下文恢复均通过。日志tests/orthographic-check.log、orthographic-browser.log、orthographic-compat.log。git diff --check通过。
- 实景tests/atmosphere-ortho-v1-abyss-violet.png及三窗口/正式战斗截图；已刷新用户原4173实验室标签页并隐藏界面。真实桌面浏览器验收，非手机实机，未发布。


## 2026-10-17 本地：华丽回旋刃、机械能量剑与分层赛博弹

- 按两组用户参考重做四档回旋镖：T1银钢三弯刃，T2深色机械三刃/荧光绿刃口/背齿，T4长短交错冰晶八芒/镶嵌晶石，T5四向金色弯刃/副翼/紫晶/24齿轮芯。使用切面厚刃、凸起脊线、金属侧壁和镂空叠层轴承，保留既有×2体积和透明拖尾。四份共享residentMesh只构建/上传一次，位姿负责旋转缩放，未改变飞行/伤害。
- T4/T5剑参考金属骨架＋宽发光刃面：切削钢脊、白亮能量刃、分段包柄、开口环形护手、发光嵌件/配重；持握、挥砍、飞剑共用对应型号。低阶沿用原剑身和旧挥砍贴图；六色T5飞剑也共享各色常驻网格。
- T5星陨圣剑从一次6剑改为每0.14秒只投一剑，六色按出手轮换。每剑独立随机椭圆短轴比例0.28–1（原轨迹为最大幅度）、平面倾角±0.4弧度、侧向剪切±0.25；保留目标处通过、完整往返/扫掠伤害，增加真实高度变化并保证不穿地；每剑0.18倍伤害，维持原总体伤害量级。移除手持处三把装饰剑避免误读为齐射。
- 普通手枪/机枪/卡宾/狙击弹取消不透明立体方块，改为彩色外焰＋热色内层＋白色尖头三层平面形状、透明度和宽度向后渐退、中心辉光；保留大而明亮的弹头/高Tier色彩成长，伤害判定不变。火箭与蜂仍保留其实体造型。
- npm run check、完整npm test（tests/ornate-weapons-regression.log）、武器专项和真实测试场控件兼容（tests/ornate-weapons-lab.log）通过。真实Edge/WebGL预览增加四刃型细节、T4/T5剑细节、单剑轨迹各阶段和连续逐剑投出，验证网格有限/复用、发射年龄错开、随机范围与高度、透明枪弹无实体几何，原36型号和GL恢复检查仍通过。图片tests/weapon-ornate-wheels-detail.png、weapon-energy-swords-detail.png、weapon-zenith-rapid.png；日志tests/weapon-vfx-browser.log。真实桌面浏览器验收，非手机实机，未发布。
- 顺手修复旧追踪飞弹初始水平速度应严格为0的兼容：仅seeker_t5使用三角函数分向速度，其他型号保留精确向上。

## 2026-10-17 本地：随机递归电弧与烟火离地

- 电弧从等距法向交替锯齿改为带时间连续随机噪声的递归中点扰动：粗层决定主路径，细层依各自局部线段同时扰动沿向与法向，段长不等、无规则交替；双主束独立随机场，端点固定。周身九段电环也使用同一递归算法细分，电纹理粒子保留。
- 烟火爆点提高到视觉半径+32的高度，升空线/爆心闪光同步；下坠粒子和尾迹在离地12至36高度内淡出，低于12的尾迹段不绘制，保留重力和七种形状，避免穿地或堆积在地板。
- npm run check、武器进化/VFX专项、git diff --check通过。专项新增随机电弧端点/确定性/时间连续性/不等段长，以及七种烟火五阶段透明顶点均高于地面。真实Edge/WebGL预览复测通过，截图tests/weapon-vfx-*.png，日志tests/weapon-vfx-browser.log；未发布。

## 2026-10-17 本地：群星追缉令分向发射

- seeker_t5的六枚飞弹初始朝向改为360度均匀分散，相邻60度，保留逐枚0.09秒发射间隔；各自先直飞0.18秒，再沿原追踪曲线转向可攻击目标。T4和旧无人机发射方式保持原样，伤害/速度/烟火不变。
- npm run check、tests/test-weapon-evolution.cjs、tests/test-weapon-vfx.cjs、git diff --check通过；专项新增六个独立朝向、速度、初始分向位移和随后进入追踪的验证。未发布。

## 2026-10-17 本地：厚底座、切面窗组、投影广告与近景车流

- 平台下新增1120世界单位深的承重厚底座，包含前舱壁、收分底壳、侧面加筋、金属框、检修通风口和嵌入式广告。前方招牌保持XY竖面，改为本地生图纹理，删除原Canvas品牌文字生成逻辑及旧品牌名称。原工地钢管护栏、外侧薄粗钢框、固定13×11地图及世界倒计时保留。
- 按新增建筑参考加强9栋非圆楼的斜切倒角、楼层收分、错位和斜屋顶，按真实收分表面放置窗面。451个有面积的矩形/斜切玻璃窗面混合宽色块立面、201组不等宽灯带和158层暗带，少量点状窗留为局部细节；针塔改直线灯带，椭圆霓虹只用于圆形楼体/观景球，不给方楼套环。
- 三块独立悬浮世界广告，投影器/扇形光束与专用GLSL着色器：透明亮度遮罩、扫描线、扫光和轻微闪烁/扰动。静态广告网格只上传一次，上下文恢复重建；固定车流和关闭雨后改变时间，实际GPU读回约数千像素变化，验证并非仅静态贴图。
- 车流由80增至98辆，其中18辆从两侧与后缘的近景航线通过，保持在战斗区域之外，模型共享原residentMesh，近景缩放1.8倍。浏览器投影平均车宽约28.3px对远景11.1px，确有视差/大小层次；雨向及饱和深雾保留。
- 根据后续反馈重新生成全部广告统一画风：大色块、少量渐变、简洁装饰图形和清晰大字；最终城市图集 dist/assets/orbital-billboards-flat.png，底座 dist/assets/elevator-transit-ad-flat.png，底座生图直接含“云际交通 / SKYLINE TRANSIT”。使用内置image_gen；完整最终提示词 tests/cyber-ads-prompts.txt。较写实的第一轮广告仅保留为中间资产，不再加载。
- 三轮WebGL实景迭代，最终 tests/atmosphere-flat-ads-final-abyss-violet.png 及正式战斗/三窗口截图。扩展浏览器回归验证厚度、生成图资源、近远车比例/安全航线、切面窗组/明暗粗细、投影着色器实际像素/缓存及上下文恢复，原倒计时暂停/消隐、雨向、移动战斗/地图和六种其他氛围检查均通过。日志 tests/plinth-browser.log、tests/plinth-compat.log；npm run check与完整npm test通过，tests/plinth-check.log、tests/plinth-regression.log。未发布，真实桌面WebGL浏览器验收、非手机实机。
- 已在用户原4173标签页刷新，并打开 ?scene=abyss&look=violet&rain=1&lab=1 的冻结预览，隐藏界面供观察，可点击右下“显示界面”恢复控制。


## 2026-10-17 本地：竖直世界招牌/倒计时与线状灯带楼群

- 纠正上轮倾斜招牌：比特吗啡 / BitMaffi 横牌挂在平台前沿下方，所有顶点Z相同，沿世界Y轴垂直向下；增加牌面高度以适应俯视透视，不再朝向镜头。
- 深渊倒计时改为后缘之外的固定XY竖直世界平面，真实深度测试、透明贴图与透视；源数据沿用正常/黄金/生存计时、彩虹剩余扇区和音乐频谱，数字/标签在同一Canvas纹理内绘制。该场景隐藏HTML时钟，其他场景恢复原UI；场景实验室使用28.9秒静态预览。新增独立GPU纹理与常驻几何缓冲，实际倒计时/频谱更新纹理，WebGL恢复重建，下降/结算不保留旧时钟。
- 楼群大幅减少碎点窗灯，增加连续环绕楼层灯带、宽窄成组窗带、竖向轮廓线；增加双球观景塔、收尖高塔与圆盘叠层塔三种地标，保留原有退台/圆形楼体及生成广告图集。两轮截图调整双球塔高度，避免球体顶部出框。工地护栏、开放粗钢架、80辆凌空车、680条方向一致雨线和高饱和雾保持。
- `npm run check`、完整 `npm test` 通过，日志 tests/skyline-check.log / tests/skyline-regression.log。六种其他场景氛围浏览器兼容检查通过 tests/skyline-compat.log。深渊浏览器检查扩展为招牌/时钟竖面、时钟实际减少/暂停/透明像素/经典UI切回/消隐与上下文恢复，另保留场地、战斗、三窗口、雨向/车流和缓存检查，日志 tests/skyline-browser.log。
- 第二轮实景 tests/atmosphere-skyline-final-abyss-violet.png，正式战斗 tests/atmosphere-skyline-final-abyss-campaign.png。本地开发，未发布；验收为真实桌面WebGL浏览器，非手机实机。


## 2026-10-17 本地：按手绘增加工业粗框与比特吗啡招牌

- 根据用户手绘 `tests/bitmaffi-paintover-reference.png` 增加两侧宽而浅的深色工字钢立框及大开口横档、前方支腿、带螺栓的前缘品牌横梁。框体仅在战斗边界外和下方，保留原工地钢管护栏和背景可视开口；色调为深蓝灰钢材，保持平面薄结构与四角导轨。未改变13×11地图、碰撞或场地扩建。
- 品牌采用用户提供的“比特吗啡 / BitMaffi”。新增1536×256的本地Canvas双语字标纹理，用清晰系统中文/英文字体与薄荷青色，与原城市生图广告图集独立。第一轮发现竖面招牌被视角压扁，第二轮改成朝上倾斜的钢制招牌面，使字标在390×680/844中可读。字标快照 `tests/bitmaffi-wordmark.png`，运行时无需外部字体/图片下载。
- renderer支持广告图集和品牌字标两个独立静态纹理/几何缓冲，按需生成/上传且切换其他场景时不绘制；WebGL丢失恢复后从缓存Canvas重建。保留原城市广告、剑光/光晕、雨与车流。
- `node tests/preview-scene-atmosphere.cjs bitmaffi-final --abyss` 验证品牌文字/66,569个有效字标像素、纹理与几何缓存、WebGL恢复，且原有80辆凌空车流、680雨向、饱和雾、场地规模/移动/战斗/透视/震动/三窗口和默认入口均通过；六氛围兼容浏览器检查通过。日志 `tests/bitmaffi-browser.log` / `tests/bitmaffi-atmosphere-compat.log`，结果 `tests/abyss-browser-results.json`。
- 两轮实景截图见 `tests/atmosphere-bitmaffi-final-abyss-violet.png`、三窗口及实战截图；直接访问当前4173实拍 `tests/bitmaffi-live-preview.png`，无脚本错误。npm run check、完整npm test（tests/bitmaffi-regression.log）和git diff --check通过。浏览器验收、非手机实机，未发布。


## 2026-10-17 本地：凌空车流、高饱和雾、工地钢管围栏与雨向修复

- 按用户纠正删除四层道路/桥面/标线/道路边框的所有建模，仅保留不可见飞行航线；80辆车沿四个深度的航路双向凌空穿行，加入轻微悬浮起伏与蓝色底部推进器。车体仍5种共享residentMesh（orbital-traffic-*-hover），不参与战斗目标或碰撞。
- 雾显著提高饱和度：远景顶点深度色由灰蓝变为强紫蓝/蓝或绿色，三层体积感平面分别使用浓紫、蓝紫、洋红，新增偏右下方的蓝色雾区，保持在战斗地面以下。紫色预览实测深处几何平均HSV饱和度约0.808。
- 移除原型感薄条桁架围笼，改为原电梯工地风：八面圆截面钢管扶手/中横杆、圆立柱、连接套、底板及四颗螺栓、窄护脚板与黄黑斜纹、后侧和侧边少量金属网片。下部改浅I形边梁；金属采用中性灰/旧钢色并压低彩色灯染，保留四角导轨、滑靴和背景通透性，无下方光圈。
- 修复用户指出的雨线倾向和位移不一致：近/远雨都以统一风向对头部位置进行斜向平移，尾部沿同一轨迹向后延伸，近亮远暗。共享街区/水上/屋顶的同类问题同步修正。浏览器对680条雨、连续两帧、投影后的位移与头尾方向检查，最小余弦约0.9999999999999997（含透视），亮端沿雨线指向运动。
- `node tests/preview-scene-atmosphere.cjs airborne-final --abyss` 通过：无道路、80车真实移动/升沉/双向/常驻网格、钢管工地围栏标识、高饱和雾、680雨向、透视/四角/震动、四种格数、实际战斗、图集/缓存、三窗口、WebGL实际丢失恢复和正式入口。日志 `tests/airborne-browser.log`；结果 `tests/abyss-browser-results.json`。六氛围兼容验证通过 `tests/airborne-atmosphere-compat.log`。
- 实拍 `tests/atmosphere-airborne-final-abyss-violet.png` 及三窗口/实战/初始9格/满场；本地4173的实拍 `tests/airborne-live-preview.png` 与后一帧 `tests/airborne-rain-next-frame.png`。npm run check与git diff --check通过。完整npm test通过，日志 `tests/airborne-regression.log`。未发布，浏览器验收、非手机实机。


## 2026-10-17 本地：武器视觉反馈、能量爆炸与强力后坐

- 爆炸依照用户Unity参考改为发光核心、圆形裁切地面网格、半球经纬线、三层倾斜旋转断环、上浮方形粒子。恒星重炮额外生成1.8秒的上升云柱和宽滚动蘑菇云顶，不再只有裸光圈。
- 群星追缉令循环七种烟火：球形菊花、金柳、双环、爱心、棕榈扇、螺旋、二次十字炸花；有发射上升、亮点、长尾与下坠。装饰半径210，伤害半径仍55，扩大表现不扩大攻击判定。
- 棱镜主束/分叉增粗，主束命中停止、两条子束也只命中一次；白昼终点更粗，增加地面长条光晕与起点圆形光斑。电弧为两根高频变化的尖锐锯齿路径，周身九段多电弧环与12个向外释放的真实电纹理粒子；电纹理延迟创建、缓存和上下文恢复重建。
- 全系回旋镖模型与碰撞尺寸×2，附透明渐隐宽拖尾。工蜂发射器恢复旧drawBee模型；普通剑恢复原剑光贴图路径，双重剑气仅延迟0.12秒且同方向。天顶剑沿玩家到目标的完整宽椭圆回旋，剑身朝椭圆外侧，六色宽轨迹覆盖扫过区域，保留剑身扫掠命中。
- 手枪/机枪/卡宾等弹体显著加大、加长，并加强白色核心与辉光。火箭筒T3/T4/T5后退30/44/60世界单位，狙击T2/T3/T5后退23/38/54，指数衰减、地板/障碍碰撞，暂停冻结，换枪/过层清理；枪模也有短暂回弹。
- npm run check、完整npm test（tests/weapon-vfx-regression.log）、新增专项tests/test-weapon-vfx.cjs（换枪/过层清理及36型号有限几何等）、git diff --check通过。真实Edge/WebGL逐帧预览tests/preview-weapon-vfx.cjs验证蘑菇云四阶段、七种烟火、重点型号、三窗口及电纹理真实上下文丢失/恢复，无脚本或GL错误；tests/weapon-vfx-*.png、weapon-vfx-browser-results.json、weapon-vfx-browser.log。测试场真实控件兼容通过tests/weapon-vfx-lab-browser.log；补靶断言先清除残留飞行弹以隔离0.4秒补靶时钟。浏览器验收，非手机实机，未发布；保留并行场景工作。

## 2026-10-17 本地：太空电梯薄型桁架、异形楼群、生图招牌、暴雨与车流

- 按用户要求先内置image_gen生成高完成度目标图 `tests/orbital-elevator-concept.png`，再生成四列竖幅招牌图集 `dist/assets/orbital-billboards.png`（ORBITAL / NIGHT MARKET / SECTOR 07 / SKYLINE TRANSIT）；提示词集合 `tests/orbital-generation-prompts.txt`。目标图只作参考，运行时仅招牌使用生成贴图，其余仍为基础几何。
- 新 `dist/orbital-scene.js` 取代abyss的建模/动态表现，沿用 `?scene=abyss&lab=1&look=violet&rain=1`。四周改为宽10、厚3的薄条桁架，三条水平框线和开放斜撑、四角上下连续的导轨与小型滑靴；移除实心厚侧壁、庞大底座和两层环形结构，旧abyss源文件内大环调用也删除。没有平台下方结构光圈。
- 13座楼使用五层不等退台、偏移附属体、斜切角/天线和四座圆弧主截面，改变同质火柴盒轮廓；13,160个灯窗使用确定性随机占用、楼层簇、不同宽高、暗区和暖/冷/紫色，按深度融雾。8块广告位采样生成图集，取代点阵文字；根据截图下移顶部裁切的主要广告。
- renderer增加按需加载的单张图集、独立缓存广告几何与纹理绘制（位于天气之前，雨可经过广告前方），仅首次/上下文恢复上传纹理和静态广告缓冲；非太空场景不下载图集、不绘制广告。保留既有剑光/光晕贴图与其他场景渲染。
- 四层真实高度的道路上有80辆双向交通，含小车/巴士、车头白灯与红色尾灯/短尾迹，轨迹/速度错开且在视野外循环；5份residentMesh共享车体，只更新姿态。680条近景/城市雨线与30组小型落地涟漪，加强可见度，辅以克制的地板湿亮条纹。观察模式天气/车流持续，实际战役沿游戏时钟；雨开关保留，车流不参加战斗碰撞/伤害。
- 两轮对图截图调整，最终 `tests/atmosphere-orbital-final-abyss-violet.png`，以及蓝色/三窗口/实战/9格/满场/正式流程；直接访问4173成功且无脚本错误，实拍 `tests/orbital-live-preview.png`。
- `node tests/preview-scene-atmosphere.cjs orbital-final --abyss` 通过：13×11固定地图、实际透视/四角/震动、9/49/99/143格、实战、80车真实位移/双向/低于地面/常驻网格、密集灯窗/圆弧楼体、图集加载与缓存/实际WebGL丢失恢复后再上传、雨动画/开关、三窗口、原入口隔离。结果 `tests/abyss-browser-results.json`，日志 `tests/orbital-browser.log`。
- npm run check、完整npm test（tests/orbital-regression.log）、原街区/六氛围浏览器兼容（tests/orbital-street-compat.log / orbital-atmosphere-compat.log）、git diff --check通过。浏览器验收，非手机实机；未发布，保留工作区其他武器迭代。



## 2026-10-17 本地：独立武器测试场

- 主页新增“武器测试场”入口，直接进入 `/?weaponlab=1`，无需跑战役或商店。可加`&weapon=boomerang_t5`等型号ID；切枪自动同步URL。新dist/weapon-lab.js只在该参数下启用，默认蓝色屋顶、143格固定13×11、恒星重炮、无敌及自动射击；不记纪录、不发击杀金币、不进入结算或商店。
- 面板可选择全部36型号、上一把/下一把、单重靶/直线穿透靶/九只密集群靶/五只移动靶、30/300/3000HP。靶子受真实攻击、击破后0.4秒自动补充，显示有效伤害、平均DPS和击杀数。支持开关自动射击、单发、重新布靶，主暂停与F2装备继续可用。
- “更多”可开关无敌、生成12枚真实敌弹测试清弹、进化+1、测试受击、重置当前武器及切换蓝色屋顶/原电梯。北极星和成长手枪的自然成长仍走真实机制；进化按钮只作测试捷径。重置换枪清理旧弹、效果与靶子并归零统计，暂停换枪保留暂停状态。面板在390×680可收起，场地可继续WASD/触屏移动。
- npm run check、武器专项与旧F2回归、git diff --check通过。真实Edge测试tests/test-weapon-lab-browser.cjs验证固定地图、36型号/真实控件、12秒36次击杀及重生、无金币/不结算、伤害统计、四种靶阵、暂停/切枪/单发、进化/受击/重置、敌弹/震荡、F2、390×844/390×680/1280×900及原主页隔离；无脚本错误。日志tests/weapon-lab-browser.log和tests/weapon-lab-regression.log，截图tests/weapon-lab-*.png。浏览器验收，非手机实机，未发布。


## 2026-10-17 本地：参考悬空战场的真实透视深井场景

- 用户提供铁男大招截图，希望改进纵深。新增 `dist/abyss-scene.js`，以真实高差/透视取代同层摆件：有厚度的升降台、下挂环形检修结构、延伸至下方的导轨、13座分段塔楼、四层连接桥、更深处的结构与雾光。深处顶点/窗灯按高度衰减到雾色，景物不遮挡战斗平面。全部基础几何，无外部图片或模型。
- `renderer.scenePerspective` 仅在深井开启：保留原相机倾角，镜头距离1800、近远裁剪20/14000、cameraScale=1.36；增加可选真实透视矩阵。镜头震动按裁剪w统一屏幕偏移；其他场景恢复原正交。游戏普通入口和地图13×11保持原规则，世界投影跳字原实现已支持齐次除法。
- 支持 `?scene=abyss&lab=1&look=violet&rain=1`，默认99格观察；也可不带lab试正式9格战役。场景选择器增加深井，配色增加紫蓝；原黄绿/黄蓝仍可切换。场景面板和浏览器标题同步名称，场景依然仅作本地可选预览，未发布。
- 两轮截图对照后，填补第一轮顶部过多空白、增加远处高楼、扩展深处背景消除截断边缘，并略放大战斗区。实拍 `tests/atmosphere-depth-final-abyss-violet.png` / `abyss-blue.png`、`depth-final-390x680.png`、`depth-final-combat.png`、初始9格/满场和正式流程截图（均带 atmosphere- 前缀）。
- `node tests/preview-scene-atmosphere.cjs depth-final --abyss` 验证真实透视使下方结构缩小（1200高差的尺寸比>1.3）、四角完整入镜、不同深度震动为相同屏幕像素、9/49/99/143格和敌人站位、正式流程/默认99格、材质/天气有限、雨动画/开关、约91,260静态顶点GPU缓存复用、实战、三窗口尺寸、切回原场景和实际GPU丢失恢复。无脚本/GL错误，日志 `tests/abyss-browser.log`、结果 `tests/abyss-browser-results.json`。浏览器验收，非手机实机。
- npm run check、完整npm test（tests/abyss-regression.log）、原街区和六氛围兼容浏览器验证（tests/abyss-street-compat.log / abyss-atmosphere-compat.log）、git diff --check通过。保留工作区其他武器/怪物迭代。



## 2026-10-17 本地：固定Tier武器型号与高阶攻击进化

- 按用户修订设计表落地12系列36件主武器，每件固定Tier/独立itemId。狙击与重狙合为狙击系列，机枪含AK47/加特林，原步枪位改卡宾枪；T3才出现火箭筒，T4才出现追踪飞弹，不填满各系档次。商店先定档再从该档实际型号抽取，保留20%低一档出货与一次随机属性快照；起始勤务手枪。无人机/坐骑及旧测试使用的内部旧工厂保留兼容，未扩展这两槽的型号体系。
- 高档枪体增加鲜亮装甲、自发光导光槽/电极/镜组、对比色与独立结构；AK木托/弹匣、六管加特林、北极星环、成长手枪展开侧翼、重狙制退器/浮动镜组。弹体/尾迹/火花按型号配色，红橙火箭升级蓝白火焰与金色约束环，爆炸边缘清晰、内部通透。回旋镖4/8/16/24刺，T4三轮/T5五轮扇形；大刃体有对应命中宽度，远目标延后回收，保持主武器覆盖全场。
- 狙击始终慢速单发：T3巴雷特最多命中2目标，T5天穹裁决最多4目标。火箭始终一轮一枚，T3/4/5半径90/120/155，射击间隔1.1/1.35/1.65秒；恒星重炮每次爆炸触发一次现有地块式清弹震荡（全场敌弹清除，沿现有震荡被动，非踩格触发，不触发激发），保留飞行与射击空档，未加入可选的下一炮伤害增益。追踪飞弹4/6枚，爆炸半径维持55，T5烟火装饰不额外伤害。
- 北极星固定T3，存在有效敌人的战斗中每12秒升一段，最多三段，实际受击含护盾扣除退12秒；最后通牒固定T4，由本枪实际击杀8/20敌人进化，最多三段，仅本局保留，不计拦截导弹/无人机击杀。成长增加弹体/发光与伤害，Tier不变，HUD显示进化级数，暂停/空房/结算不积累。
- 卡宾枪T3三连/T4五连，连发间隔.075秒且保留轮间停顿。T4棱镜首次命中向附近两个目标分裂衰减光束，不递归；T5白昼终点持续.8秒，轮间隔1.65秒，起点/高度跟随角色与坐骑、方向锁定，按目标每.12秒伤害。新友方激光穿过友方掩体。电击最多3/4/7目标，T3起附加周身低伤电环脉冲。剑为蓝/绿/金/蓝紫成长，T2/T4剑气命中追加一次延迟斩切，T4双剑气各自结算；T5六色实体飞剑沿弧线往返，按剑身扫掠判定、每剑往返分别命中一次。
- F2按具体型号列出固定T，武器档次选择锁定；商店/对比/HUD显示型号与T。参数集中在game.js的WEAPON_MODELS注册表、createWeaponModel及model效果函数，依赖仍为原生WebGL/JS。
- 验证：npm run check、完整npm test（tests/weapon-evolution-final-regression.log）、新增test-weapon-evolution与git diff --check通过。专项覆盖36型号/出货档次、真实穿透/远距回旋/成长/爆炸清弹、分裂/持续激光/掩体/坐骑高度、剑气两段/飞剑、暂停与陷阱排除；旧获取测试同步固定档次规则，保留原战斗断言。
- 实际Edge/WebGL逐件渲染36型号，F2真实控件、支付/开箱/确认换装与390×844/390×680/1280×900通过，无脚本/GL错误。可复跑node tests/preview-weapon-evolution.cjs，结果tests/weapon-evolution-browser-results.json，截图tests/weapon-model-*.png。浏览器验收，非手机实机；首版数值尚需试玩微调，未发布。


## 2026-10-17 本地：三场景 × 黄绿/黄蓝夜雨氛围

- 按用户要求继续基础WebGL几何制作，新 `dist/scene-atmosphere.js` 扩展原街区小样，统一非发光环境材质的主色，保留独立彩色霓虹；利用静态顶点烘焙局部黄色/青色光照，配合透明渐变光斑，压暗环境并增强明暗层次。角色、敌人、子弹与预警保持原配色。
- 原街区加入粉色NOODLE、青色ARCADE及竖向OPEN招牌；新增深水检修平台（控制室/吊架/管线/浮桥/小船/水面碎片反光）与高架屋顶机房（入口塔/风机/HVAC/水箱/屋顶霓虹）。所有静态场景仍用原renderer常驻场景缓冲，换场景/配色/地块才重建。无新贴图、模型或运行时依赖。
- 280条低透明度雨线＋14组地面涟漪，观察模式冻结敌人时天气独立播放，实际战役随游戏时间；雨可开关。雨的中心透明度低于外围，光斑和反光集中边缘。水面反光持续漂移。修复烘焙过程中退化法线产生NaN的情况；截图检查后增加雨的可见度、局部光照与水面倒影，抬高被栏杆遮挡的屋顶招牌。
- 预览支持 `?scene=street|dock|roof&look=green|blue&lab=1`，控制台可切换场景、配色、雨、地块数量与实战，并将选择同步URL及正式流程试玩链接。普通不带参数入口保持原场景，未发布。
- 三轮浏览器截图与调整，最终 `tests/atmosphere-final-{street,dock,roof}-{green,blue}.png`；控制面板、390×680/390×844/1280×900、实战亦有截图。`node tests/preview-scene-atmosphere.cjs final` 验证六组合的真实网格颜色变化、有限顶点、雨动画/开关、静态GPU缓冲复用、真实控件/URL、固定13×11、窗口尺寸、战斗、原场景与实际WebGL丢失恢复，无脚本/GL错误。结果 `tests/atmosphere-browser-results.json`，日志 `tests/atmosphere-browser.log`。浏览器验收，非手机实机。
- npm run check、完整npm test（tests/atmosphere-regression.log）、原街区专项（tests/atmosphere-street-regression.log）与git diff --check通过。


## 2026-10-17 本地：街区升降台场景小样（概念图→WebGL→三轮截图）

- 新增 `dist/street-scene.js`：基础长方体/平面/程序化文字，组合三间门面、货运电梯、远处楼群、雨棚、售货机、路灯、道路/斑马线、简化汽车和停车位。静态约42,804顶点按地块变化缓存并常驻GPU，暖色光斑采用低透明度三角面；场景无新增纹理、外部模型或依赖。
- 使用 `?scene=street` 在真实战役中试用；`?scene=street&lab=1` 打开独立小样控制台，共用原游戏角色、移动、射击与地块机制。支持9/49/99/143格、冻结/实战、隐藏界面及原场景对照。地图保持13×11。主页增加预览链接，普通入口仍为原场景，未发布。
- 相机允许可选cameraScale，街区取1.12以展示窄边路沿，普通入口取1。游戏静态场景键包含主题修订号，切换/扩地/恢复上下文均重建正确缓存。
- 内置image_gen概念图 `tests/street-scene-concept.png`；原提示词 `tests/street-scene-design-prompt.txt`。第一轮定布局，第二轮补屋顶/门面/道路细节和光斑，第三轮拉开钢板底座与表层高度，修复部分分辨率的深度条纹。生成图仅作设计参考，运行时完全由几何体绘制。
- 实景 `tests/street-scene-final.png`、`street-scene-final-ui.png`、`street-scene-combat.png`、`street-scene-campaign.png` 及三个窗口尺寸截图。真实Edge/Playwright验证四种格数、敌人站在已开发地板、实际移动和战斗、原场景切换、静态GPU缓存复用、实际WebGL丢失/恢复、390×844/390×680/1280×900、街区正式流程和原入口；无脚本错误/GL错误。可复跑 `node tests/preview-street-scene.cjs final --verify`，日志 `tests/street-scene-browser.log`。非手机实机验收。
- npm run check、完整npm test、git diff --check通过；完整回归日志 `tests/street-scene-regression.log`。


## 2026-10-17 本地：机械鱼长方机身、面甲与短翼

- 按参考图将机身改为44×18×21的长方装甲块，底盘48长；前端独立加深色衬框与凸出浅色面甲，面甲保留两道竖眼缝。双后掠翼从肩部到翼尖长度约46→27，横向外伸39→29，并缩短翼尖饰片。
- 使用 long-shell-v3/short-wings-v3 常驻网格；鱼群行为和间距沿用。npm run check、鱼群专项及git diff --check通过；真实浏览器刷新复核长方机身、面甲与短翼轮廓，截图 tests/fish-school-long-body-preview.jpg。非手机实机验收，未发布。


## 2026-10-17 本地：鱼群放疏与双飞翼

- 按用户反馈将出生分布系数19→31、分离范围40→76、分离力度340→500；邻域112→155，局部聚合0.8→0.28、弱群体约束0.16→0.08，离群回收阈值135→185。保留真实Boids与13尾数量，6组随机状态60秒模拟的平均最近邻距离约50–53世界单位，转向、聚群、边界和离群恢复通过。
- 移除中央长尾和摆尾姿态，换为机身后部左右两片实心后掠飞翼，带装甲连接、浅色翼尖与厚度，和机身朝向一致；使用共享常驻 wings-v2 网格。
- npm run check、鱼群专项（含间距回归）、额外5组随机状态、git diff --check通过；真实浏览器已刷新并检查双翼轮廓和分散队形，截图 tests/fish-school-wings-preview.jpg。未做手机实机验收，未发布。


## 2026-10-17 本地：结束跳字立即在玩家头顶显示

- 取消结算首秒等待和逐条0.4秒间隔：金币、无伤护甲及酒房效果立即结算，以玩家世界坐标投影到头顶，多条合并分行；使用14px小字，随坐骑抬升，2秒内上浮44px并线性淡出，结束后进入商店。结算隐藏旧顶部toast，避免其淡出残影；生存奖金取消重复的普通金币跳字。无文字时保留2秒结束牌。
- 危险机关仍完整闪烁三次再移除，连续目标不再额外等待；其反馈完成后保留2秒展示。暂停冻结，重置/进店清理，普通战斗跳字保持原规则。
- npm run check与git diff --check通过；完整回归按分段运行全部通过：npm test前段通过至地块商店，压力测试旧“等1秒”断言更新后，压力/远程/鱼群剩余项通过（tests/settlement-head-popup-regression.log及settlement-head-popup-final-regression.log）。结算/酒/64/限时关专项最终复测通过。
- 真实浏览器390×844验证14px、多条同时出现、1秒时上浮22px且透明度0.5、2秒消失进入商店、顶部toast完全隐藏、无脚本错误；截图tests/settlement-head-start.png及settlement-head-mid.png，脚本tests/preview-settlement-head.cjs。非手机实机验收，未发布。


## 2026-10-17 本地：噬菌体弹幕增强

- 三种弹幕统一每次10发；环形/旋转/瞄准扇形速度105/118/145→157.5/177/217.5（提高50%）。扇形保持原±.24弧度张角，10发关于玩家方向对称；攻击间隔、轮换、反弹和分裂保持。战役与独立测试场共享逻辑。
- npm run check、test-177、test-181、test-campaign、完整npm test及git diff --check通过；更新数量/速度/扇形对称与24秒120发回归，完整日志tests/virus-buff-regression.log。本轮未做浏览器或手机实机验收，未发布。

## 2026-10-17 本地：机械鱼群怪物与 Boids 测试场

- 新增 `dist/fish-school.js` 与 `fish-school.html`，主页可进入「机械鱼群测试」。13尾机械鱼保留参考图方形面罩、短装甲机身、长蓝尾鳍轮廓；机身、尾鳍及阴影通过 residentMesh 共享常驻网格。
- 按用户纠正，最终使用真实 Boids 邻域算法，移除固定队形/整体旋转。每尾鱼持有世界位置、速度、朝向，按邻域分离、速度对齐、位置聚合及边界避让计算力；全体基于同一帧快照求力后再积分，有限转弯速度。弱群体约束回收离群鱼，无固定站位。
- 鱼群只共享巡游目的地与偶尔靠近玩家的意图，不给每尾鱼独立玩家追逐逻辑；共享一个受击/生命实体，普通子弹按真实鱼体位置碰撞。暂停、眩晕和酒减速冻结/缩放整个 Boids 模拟。悬浮鱼从地块掩体上方通过。
- 测试场默认无敌/观察开启，可切换实战、手动整群游向玩家、重开与F2装备；未加入战役随机名单，未发布。专项验证三种邻域力、快照顺序无关、各鱼不同转速与动态间距、离群回收、60秒边界/聚合、实际鱼体命中、暂停/眩晕/减速与常驻模型复用。浏览器已刷新最终算法并检查画面，预览 `tests/fish-school-preview.jpg`；非手机实机验收。
- npm run check、鱼群/远程移动专项、额外5组随机状态模拟与 git diff --check通过；浏览器实际开启射击后确认鱼群掉血、击破和重开，无脚本错误。完整 npm test 在 test-room-pressure「real clear waits one second」停止：当前 beginStageClear 内 wait=0，与其要求1秒不符；未调整该结算规则，日志 tests/fish-school-regression.log。


## 2026-10-17 本地：金蛛独立快速随机游走

- 移除共享椭圆路线与固定角度推进，改为每只金蛛独立随机方向、0.18–0.6秒决策间隔和0.85–1.15速度倍率；章节基础移速80/90/100→170/185/200，转向上限2.6→9弧度/秒。保留连续位移、玩家/同伴避让、边缘引导、掩体碰撞与实际路程驱动步态。
- 金蛛专项新增受控随机序列验证独立方向/间隔/速度，验证实际快速位移、零dt/暂停冻结，并同步转向/位移边界回归。npm run check、金蛛专项、完整npm test及git diff --check通过；完整回归日志tests/greed-random-movement-regression.log。本轮未做浏览器/手机实机验收，未发布。

## 2026-10-17 本地：地块建造文案明确动作

- 五种地块建造商品标题统一为“建造{地块名} ×1”，描述为“建造一个{地块名}。”换行后显示“{地块名}：{原作用说明}”；保留现有印钞格等名称与购买逻辑。
- npm run check、test-terrain-shop及git diff --check通过；本轮未做浏览器/手机实机验收，未发布。

## 2026-10-17 本地：黄金猎场全清提前结算

- 修复五只金蛛全部击破后仍等待完整倒计时：全清即停止猎场计时并进入原有1秒等待及结算流程，隐藏倒计时；小红帽尸爆预警存在时先正常完成再结算。部分击杀超时清除、逐只即时赏金及酒房结算次数保持。
- test-greed-room新增B07/B18/B29全清提前结束、倒计时隐藏、结算幂等/暂停、全清反馈和尸爆后提前结束回归；test-timed-floors同步全清提前结算规则。npm run check、金蛛/关卡专项、完整npm test及git diff --check通过，完整回归记录tests/greed-early-clear-regression.log。本轮未做浏览器/手机实机验收，未发布。

## 2026-10-17 本地：地块商店先于普通商店依次弹出

- 移除双店自由切换页签。偶数层先弹出地块商店，点击“结束”后进入普通（装备）商店，再点“结束”才下降至下一层；奇数层沿原开放频率只弹出普通商店。两店结束按钮统一为“结束”。
- 切店保留两种钱包、独立货架/刷新次数与已购地形预留；普通商店阶段禁止继续地块交易，装备对比未完成时不能结束。
- npm run check、test-terrain-shop、test-settlement及最终完整npm test通过（tests/shop-sequence-regression.log）；新增真实按钮顺序、切店不下降/不丢预留、禁止回店交易、对比阻塞与重复结束防跳层回归。未做浏览器/手机实机验收，未发布。

## 2026-10-17 本地：远程小怪保持距离并游走

- 普通眼怪、骷髅、导弹发射怪、飞蛾、激光怪从出生点±7像素晃动改为持续侧移，按类型以32–44像素/秒走位，围绕200–235像素的目标距离平滑接近/后退；每约2.4–4秒换向，个体seed错开，到竞技场边缘选择更通畅的方向，并沿现有掩体碰撞处理。近身追逐怪沿原主动追逐逻辑。
- 激光怪仅在idle时走位，预警/发射锁定位置；普通射击冷却不变。移动使用enemyDt并乘现有猎犬怪物移速倍率，眩晕沿原主循环冻结。BOSS及机关保留现有逻辑。
- 新test-ranged-movement加入npm test，覆盖五类持续移动/近退远进/距离/边缘、激光站定与恢复、玩家换位、零步长、眩晕、移动射击与掩体。电锯接触伤害专项的固定靶显式眩晕，避免靶子新后退行为影响接触冷却验证。
- 50局真实AI/武器模拟：前三层初始手枪射击怪峰值7/7/8，总怪峰值10/10/12；基础局约29.94–30/30/30秒，高输出约8.05–8.55/8–9.05/8.55–9.51秒。压力断言同步移动靶观测，不引入人数硬限制，不改射速/刷怪/耐久。
- npm run check、移动专项、经济酒/地形商店专项与git diff --check通过。完整npm test在test-timed-floors原有“completed hunt waits”断言停止：当前金蛛全杀会提前结算，测试仍预期等待截止；用修改前的远程晃动逻辑复测同样失败，确认为既有矛盾，本轮未修改金蛛规则。日志tests/ranged-movement-regression.log。
- 真实浏览器390×844验证五类怪4秒内实际位移、无脚本错误并检查前后截图tests/ranged-movement-before.png/after.png；非手机实机验收，未发布。


## 2026-10-17 本地：飞碟坐骑力场增强

- 将原本边缘完全透明、仅12个暗刻度的减速力场改为连续青蓝色亮边、半透明区域与两道错峰向外扩散的波纹，保留提亮的刻度。亮边对应实际减速半径，发光带向内收，随品质范围和玩家位置变化；减速与激光机制保持。
- npm run check、test-165/146/147通过；test-165补充各品质完整亮边、范围边界、波纹动画、跟随与非战斗隐藏回归。真实浏览器390×844两帧预览无脚本错误，截图tests/ufo-field-preview.png及tests/ufo-field-wave-preview.png；已检查角色、地板和敌弹仍可辨认。非手机实机验收，未发布。
- 完整npm test通过，日志tests/ufo-field-regression.log；git diff --check通过。

## 2026-10-17 本地：三只混合批次与增加总量

- 按用户实测“出一个杀一个、总量不足”改普通层后续入场为整批3只，保留开场2只缓冲；普通章节总量15/20/25→20/30/40（+33%/+50%/+60%），间隔2/2.2/2.4→3/3.5/3.6秒。30/45/60秒、60%贴身、无同屏人数硬限制、活怪不阻挡后续批次继续保持。按批次和总量提升吞吐，不再单只滴灌。
- 远程HP倍率2→1.6，贴身HP沿原数值，抵消多批次叠加后的弹幕压力；不改变怪物射速、攻击行为或玩家武器。第一层初始仍1贴身+1眼怪，后续保留普通怪解锁与安全出生检查。
- 空场0.35秒提前入场改为下一整批3只，有限队列全部打完仍等1秒结束。蜂巢复制改为逐个实际基础怪累积50%信用并复制该个体，避免每批总取前几个产生类型偏差；额外怪不递归复制。第一章基础20只含12贴身8远程，蜂巢完整30只含18贴身12远程；现有赏金规则不变，前三层全杀收益各$32，首层买武器后第二层可升Lv.2。
- test-timed-floors同步三只整批/活怪继续补批/空场加速整批/新总量/拥挤仍不拦截/暂停慢时间，保留全套截止与超时零收益死亡特效；酒专项验证混合复制60%配比和三秒整批；经济专项同步名单收入。
- 50局真实AI/武器模拟（无敌隔离生存伤害）：基础手枪B01约29.74–30秒、B02/B03均30秒，总敌人峰值8–9/9–10/11，射击怪峰值6/7/7；高输出约8.05–8.55/8.00–9.05/8.55–9.51秒清场。B13/B23基础手枪撑到45/60秒，高输出约28.95–30.17/49.80–53.30秒；所有数据是数值观测、不是硬上限。压力回归新增基础组合接近时限、至少6只积累、不逐批清空的断言，保留高输出提前清场。
- npm run check、关卡/酒/经济/50局模拟专项通过；完整npm test通过，日志tests/batch-spawns-regression.log。本轮未做浏览器/手机实机验收，未发布。

## 2026-10-17 本地：彩虹填充倒计时与圆周音乐频谱

- 按真实浏览器截图先用内置image_gen制图；用户纠正为钟面内部铺满彩虹、倒计时划过的扇区透明，随后按第二版图实现。设计tests/rainbow-clock-design-v2.png，提示词tests/rainbow-clock-design-prompt.txt；实际截图tests/rainbow-clock-after-v2.png及390×844/680两个尺寸截图。
- 原survival-clock保留数字和房间标签，新增高DPI Canvas：彩虹填充剩余时间扇区，从12点顺时针清除经过区域（alpha=0，直接露出场景），白字与阴影保证可读性；外圈72条径向音乐频谱共用music.spectrumAt，无伪造节拍。普通限时/金蛛/生存房共用，倒计时与结算规则保持；暂停冻结采样，静音频谱回落。按屏幕高度缩放，避免遮挡上方HUD与战斗区。
- npm run check、test-64/78/106/132、test-greed-room及git diff --check通过。浏览器preview-rainbow-clock.cjs --verify验证满盘/四分之一/半盘/末段/清空的真实像素alpha、各象限色彩、暂停冻结、实际音频变化及静音回落；无脚本错误。非手机实机验收，未发布。
- 最终完整npm test通过，日志tests/rainbow-clock-regression.log（含当前30/45/60秒关卡与人数规则回归）。

## 2026-10-17 本地：取消人数硬拦截，贴身怪占六成

- 按用户纠正移除normalRangedCap及spawn/spawnGroup中的场上人数判断，取消满员队列规则和独立hiveSpawnQueue。普通层的积累由数值决定：章节总量15/20/25只，间隔2/2.2/2.4秒一只，时限30/45/60秒；没有以人数为条件的停刷或消失。单次批次原压力预算、出生点安全距离和2秒收尾保留。
- buildNormalRoster按每5只3个bomber贴身、2个远程组成有限名单。B01开场1贴身+1眼怪，B02远程加入骷髅，B03加入导弹发射怪，B05加入激光，B06起偶数普通层可有飞蛾。普通层禁用原独立追逐流，消除前两层不刷近战和第三层起额外刷十几只导致配比失真的问题；非限时旧追逐辅助函数保留，不影响普通房。
- 普通房远程耐久继续(5+楼层×1.1)×2；贴身耐久改为(3+楼层×0.6)×1.5，绝对耐久约为同层远程的四成，仍是较易处理的近身目标。非限时旧追逐仍原0.5倍率，BOSS/特殊房不变。贴身怪沿原无金币掉落规则；经济专项同步真实名单，前三层全杀收益各$24，购买首层武器后升Lv.2约需第三层收入，未改升级价/赏金规则。
- 蜂巢额外怪按实际入场基础批次累计50%信用，直接按原类型复制，出生入口暂时不安全时标记hiveExtra排入同一队列；额外怪不再复制额外怪，也不吞掉基础名单。长夜扩充有限名单后仍保持约60%贴身。普通房无额外追逐渠道。0.35秒空场加速、全清1秒等待、超时无收益碎裂特效沿用。
- test-timed-floors改测混合开场/章节名单与六成配比/存活不阻挡入场/直接刷出8只射击怪后仍正常按表入场/无隐含独立追逐流/暂停慢时间与截止；保留超时特效/零收益/结算/特殊房等回归。酒专项改测真实混合额外批次及不递归；经济专项同步有限名单收入与进度。
- 50局真实AI/射击模拟（无敌隔离伤害风险）：基础手枪B01约27.20–27.36秒、B02约29.55–30秒、B03为30秒，前三层射击怪峰值2/3/5、总敌人峰值3/4/4–6；高输出约7.61/7.61/10.01秒。B13/B23初始手枪会撑满45/60秒（弱装备可自然积累到8/10个射击怪），五级电弧+五级激光无人机约23.51/43.44秒清场。这些是数值形成的观测，不是硬限制，也不是手机实机难度或视觉验收。
- npm run check、关卡/酒/经济/50局模拟专项通过；完整npm test通过，日志tests/mixed-roster-regression.log。本轮未做浏览器/手机实机视觉验收，未发布。

## 2026-10-17 本地：30/45/60秒、4/5/6射击怪上限与超时碎裂

- 按三个章节设普通层30/45/60秒（B01–B10/B12–B21/B23–B32内的普通房），替换此前错误的12/14/16/20秒；特殊炮台20秒、金蛛15秒、BOSS不限时沿原规则。开场2只，后续每2秒最多补1只，同屏射击怪硬上限4/5/6，队列满额保留；spawn本身也保护上限。眼/骷髅/导弹发射怪/飞蛾/激光怪都计入，追逐怪和机关不属于射击怪。
- 前两层有限基础怪池各12只，后续各章14/18/22只，不再按时间片生成几十只。普通房远程怪HP取原值×2，以小群耐打怪替代大量堆怪；追逐怪、特殊房及BOSS耐久不变。空场仍0.35秒加速补下一只，耗尽所有队列全清后等待1秒显示结束；最后2秒停刷。
- 蜂巢酒额外怪放独立hiveSpawnQueue，和基础怪共用硬上限；满员时既不越限，也不丢掉应有的额外怪。半只余量只由实际入场基础怪积累，额外怪不递归复制；HUD/清场/截止共同识别额外队列。长夜延长房时和有限怪池，仍有同屏限制。
- 将shatter拆出纯shatterVisual。普通层超时对每个存活普通怪/导弹去重播放碎裂粒子、光谱冲击和死亡音效后移除；金蛛超时同样显示金色碎裂，HUD改为“超时清除不发钱”。此路径不经过伤害/击杀/死亡被动，不加金币/击杀、不触发蜂巢连锁/红帽尸爆/焦糖燃烧/小无人机自爆，不影响正常击杀和已发赏金；粒子保留到结算中正常退场。
- test-timed-floors覆盖章节时长/人数上限/满员保留与腾位补入/直接spawn保护/渐进开场/额外队列截止/暂停慢时间/1秒清场/每个存活目标超时特效/零收益零死亡被动/幂等/结算中粒子及有限渲染/金蛛。酒、地块、经济专项同步新时长与怪池，经济全杀上限前三层48/48/56。
- test-room-pressure扩为50局（B01/B02/B03/B13/B23×基础/五级电弧枪+五级激光无人机×5种子），真实AI/射击/扣血、无敌隔离火力。基础组合各自撑到30/45/60秒；射击怪峰值4/4/4/5/6，基础前两层总敌人峰值4。高输出前两层约9.34秒清场，所有组合遵守射击上限，没有长空场。追逐怪另有原人数上限，因此较后层总敌人数会高于射击怪人数。该测试不是关闭无敌后的难度或视觉验收。
- 语法与关卡/50局火力/永久酒/金蛛/地块/经济专项通过；完整npm test通过，日志tests/capped-spawns-regression.log。本轮未做浏览器/手机实机视觉验收，未发布。

## 2026-10-16 本地：地块反馈降亮与震荡产物模型

- 医疗、护盾、印钞格生产扫描、库存就绪和领取完成闪光统一降低亮度与饱和度，保留绿/蓝/金的类型识别；震荡格就绪标记和冷却扫描同步压暗。
- 震荡格就绪新增缓慢旋转的立体震荡装置，耗尽充能后隐藏，恢复后再显示，双次充能保留额外库存标记。工业转型产生的震荡补给共用同一常驻模型，替换原悬空光环，吸取时随补给移动。触发、生产、拾取及冷却规则保持。
- npm run check、test-shock-tile、test-terrain-shop、test-cover-tile及git diff --check通过；新增实际模型存在/消失、共享网格和吸取位置回归。浏览器4221临时fixture核对生产/完成三类地块与两种震荡产物，console无警告/错误。未做手机实机验收，未发布。

## 2026-10-16 本地：飞碟保留玩家正常尺寸

- 移除飞碟乘员的0.5倍模型缩放，玩家、手持武器、护甲及光效保留正常尺寸，仅跟随坐骑抬升与悬浮；护盾提示和血条同步恢复正常尺寸/高度。
- 玻璃驾驶舱水平半径增至34、高度增至62，连同舱口、座椅靠背与前方仪表台扩大并调整位置，容纳正常尺寸的头盔和天线；碟身外径与激光机制保持。
- 更新test-146/147，验证扩大舱罩、正常头盔宽度、舱内空间与光效尺寸。npm run check、飞碟145/146/147专项、完整npm test（tests/ufo-rider-regression.log）与git diff --check通过。本轮未做浏览器/手机实机视觉验收，未发布。

## 2026-10-16 本地：短开局、累积怪群与火力清场

- 修复前两层只有6/7只、刷完仍空等20秒的问题。普通层时长取min(20,10+楼层×2)：B01/B02/B03分别12/14/16秒，后续普通层20秒；炮台/金蛛/BOSS沿原规则。开场最多2只，后续每1.5真实战斗秒补批，每批仍最多3只且沿用6/8压力预算、单批飞蛾限制。有限基础怪池按房间实际时长与批次预算构建，前两层20/23只；长夜同步增加有限怪池，蜂巢额外怪与半只余量保留。
- 当前敌人和导弹清空但仍有待入场怪时，0.35秒加速下一批，不能通过清掉开场2只跳过整层。敌人/导弹/有限队列都清空后沿beginStageClear(1)等待1秒再结束展示；后续结算事件和1.5秒结束牌保留。未来追逐时点不阻塞已经耗尽的房间；存活敌弹按原清场管线清理。提前结束即停止印钞等生产，没有等满时长的补偿。
- 末段停刷由最后6秒缩短至最后2秒，仍使用真实倒计时，暂停冻结，慢时间不延后生成。过期队列取消，大步长跨收尾区不补刷错过波次；超时撤离不算击杀、不发赏金。HUD显示存活或提前清空，并显示场上人数/待入场人数。
- test-timed-floors覆盖短层时长/2只开场/存活继续补批/有限池加速/不能跳批/全清等1秒/导弹阻挡/追逐不续命/暂停慢时间/大步长/2秒收尾/提前结束停产；酒和地块专项同步新时长。test-61经济模拟同步完整有限怪池，原超出竞技场的长横排fixture改为场内目标，继续验证真实击杀赏金及交易记账；全部击杀的收入上限会随怪池提高，实际基础输出仅能杀一部分。
- 新test-room-pressure加入npm test：前三层×基础/五级电弧枪及五级激光无人机×5随机种子，共30局，真实AI/武器/伤害，无敌仅用于隔离火力测试。基础组合分别12/14/16秒到时通关，峰值14/17–18/22只，战斗中无空等；高输出组合约6.51/7.51/8.44–8.46秒耗尽敌群，进入1秒清场等待。该模拟不是无敌关闭后的难度或手机实机视觉验收。
- npm run check、关卡/酒/地块/战役/经济/30局火力专项与git diff --check通过；完整npm test通过，日志tests/room-pressure-regression.log。本轮无浏览器/手机实机验收，未发布。

## 2026-10-16 本地：减轻迷路小丑视野惩罚

- 按用户要求将饮用后的清晰半径最终按用户调整为3格，保留外侧0.5格渐暗，完全纯黑边界调整为3.5格；商店/HUD共用说明同步。持续2房和醒酒暴击奖励保持原值。
- npm run check、test-drinks、test-economic-drinks与git diff --check通过；酒专项同步检查3.5格投影半径与3格清晰区。未做浏览器或手机实机视觉验收，未发布。

## 2026-10-16 本地：酒回归横排三格、每格混池刷新

- 移除酒卡独占整行及单独字号/高度覆盖，酒与装备、补给共用三列等宽布局。三个货位独立从相同类别池抽取，任意位置均可出现酒/补给/装备，允许多杯酒同时上架；保留原货架平均类别比例、定价、可用性、购买及升级规则。
- test-drinks增加三格全酒/全补给/全装备和各位置类别覆盖，旧57/59测试移除固定第二格装备/最多一酒假设；preview-drinks改为实际三个商品。
- npm run check、酒/永久酒/地块商店/盲盒专项通过，git diff --check通过。首轮完整npm test在test-61的early earned income断言失败；随后原rollShop对照与当前实现单独运行均通过，重跑完整npm test全部通过（tests/shop-mixed-slots-regression.log）。浏览器4212复核装备+两杯酒同一行等宽（top均317px，宽约116.33px）；未做手机实机验收，未发布。

## 2026-10-16 本地：双商店、蓝色方块货币与39项地块商品

- 装备店保留金币和Lv.1–5升级，货架移除扩建/拆除/特殊地块；地块店每偶数层开放，独立三货位混池、独立刷新，无商店等级。每层结算进入商店获得3份独立货币，同层不重复发放；金币、印钞和金钱倍率不能增加它。扩建常驻，每份货币对应1格，每次最多3格，地图不足3格按实收取；其他建造/拆除继续预留并在下层落地闪烁提交。
- UI不再称“建材”，余额、货架价格、刷新和提示/F2领取按钮统一使用深蓝三面、亮蓝勾线、CSS发光的内联SVG方块图标加数量；无障碍名称“蓝晶”。没有新增图片或运行时依赖。保留两店独立消费、刷新次数和装备升级；商店货架不固定地块种类。
- 补充版CSV共39项数据内嵌TERRAIN_CATALOG，玩家卡片使用16字以内的简述。32项稀有被动本局限购一次，现有及未来同类地块受益；钱袋/流水互斥替换且不退款。普通随机商品权重50、稀有1，已拥有对应地块时稀有权重翻倍。F2增加被动选择/领取和蓝晶+30，测试局不记纪录。
- 基础医疗30秒/1血、护盾40秒/1盾、印钞30秒/$3、震荡35秒、掩体4耐久。三种生产地块实现独立带类型/生成规格的库存队列，跨层保留；储药柜3份、备用电池仓2份，单格领取间隔0.5秒。扩容不白送产物，已有产物不被后购被动改写，变周期保留进度百分比；同时更新商店预留地形，防止落地提交覆盖进度。
- 医疗实现急救箱周期×1.5/治疗2、激素主动使用降至1血清盾及永久增益、汤剂上限、时间药丸、溢出先补盾再回收、加速；护盾实现大型电池、库存/加速、满盾拾取例外、静电、破盾推进/全场CD、移动敌弹减速场、回收和工业转型。BOSS不生成永久成长药剂、不回收换钱；保留正常治疗/补盾，海盐禁补盾规则有效。
- 印钞实现钱袋/流水规格、督工范围倍率、拾钞金币弹、带CD的一次临时防护；震荡实现余震、固定清弹场、推怪、眩晕、双次充能和手动踩格推进；掩体实现加固、碎裂震荡、脱战修复、占位延后重建和带方向碎片。余震不派生震荡事件，工业/碎裂震荡不触发激发，地块弹不触发命中酒被动。BOSS不受推怪/眩晕，身体仍撞碎掩体；小无人机/飞碟召唤物接入眩晕。清弹将已有弹丸置为失效，避免同帧旧迭代继续造成伤害。
- tests/test-terrain-shop.cjs覆盖39项真实交易、两钱包/刷新、结算幂等、扩建容量预留、互斥限购、库存快照/跨层、各被动族效果/上限/CD/防循环、真实伤害/护盾交互、预留地形进度和共享渲染。旧产出/耐久/冷却回归已同步新数值；与新16酒专项兼容。npm run check、完整npm test（tests/terrain-shop-regression.log）、追加地块/酒/掩体/震荡专项和git diff --check通过。浏览器4220独立fixture核对购买扣款、切店、蓝晶图标和钱袋/药剂等场景，console无warning/error；截图tests/terrain-shop-preview.png。非手机实机验收，未发布。

## 2026-10-16 本地：三杯永久筹码酒

- 新增蜂巢蜜酒($18)、猎犬波本($16)、长夜金酒($20)，进入原三商品酒池与F2下拉，总酒数16。饮用立即获得本局奖励，永久筹码不倒计时、不进入房间结算；HUD同时保留永久代价和增益，提示只显示简短效果名。价格沿用商店等级/深度规则，多杯线性叠加，重开清空。
- 蜂巢：普通怪每批/追逐增援数量+50%。远程基础批次保留原压力预算与队列，额外怪从本批复制，半只余量跨批累计，不抢后续基础波次；追逐时点同样累计额外数量、每层总配额+50%，场上10只上限/预警与末段停止增援保留。额外怪正常走现有赏金/击杀/死亡管线（追逐怪本来不掉钱仍不掉）。奖励：每个实际敌人死亡从尸体发出一次连锁电弧，最多3个目标，伤害为当前主武器60%，沿用连锁衰减/距离和真实扣血击杀；不攻击陷阱，尸体去重，额外击杀可继续连锁。
- 猎犬：普通巡游与追逐怪移动+30%，射击间隔/预警不变；奖励玩家最终移速+20%。巡游使用独立移动时钟，追逐只缩放主动行走，保留击退/掩体规则；BOSS及专用召唤物移动不加速。
- 长夜：普通/炮台层20→26秒，金蛛15→19.5秒；BOSS仍不限时。普通层使用本房duration计算时间表，延长后16秒等额外批次会在原队列耗尽时继续补充，仍保留最后6秒停止所有增援，暂停与大步长截止规则保持。金蛛仍为原5只，不额外复制赏金，炮台继续原攻击，补给/印钞可使用更多真实战斗时间。
- 长夜增益：每8个真实战斗秒，敌人/敌弹/机关半速2秒；玩家移动、己方射击、补给/印钞、关卡时限不随之减速。周期按帧区间积分，跨边界按实际覆盖时间减速，暂停冻结，每房重置周期；重复饮用缩短周期至8/N秒（N最高按4计），活动窗取2秒与周期一半的较小值。蓝色地面环提示生效。
- tests/test-economic-drinks.cjs验证真实交易/立即生效/跨层永久、普通批次与追逐增量/安全上限、赏金/真实连锁伤害、移动与射速分离、三个限时房/末段增援/无BOSS时限、全场半速不干扰玩家与产出、暂停/周期边界/叠加/重开。旧酒专项更新为16种并区分限期/永久模式。npm run check、新专项（tests/economic-drinks-special.log）、16酒专项、追逐专项和完整8路线战役专项通过。
- 完整npm test已运行，当前停在test-61的“cash tile recovers 15 dollars in three cycles”旧经济断言；现有test-timed-floors的旧印钞大步长断言亦失败。把本次时长/怪速/周期减速函数在VM内禁用后test-61仍同样失败，关联工作区新地块补给队列，不为通过而改动这些断言。完整日志tests/economic-drinks-regression.log；战役日志tests/economic-drinks-campaign.log。
- 接入时发现game.js已有一次字符串替换造成的后半源码重复和现金HUD语法错误，先备份到系统临时目录hell-elevator-game-before-duplicate-repair.js，再保留首份新地块逻辑去重并修正现金/建材显示。其余工作区地块/建材改动保留。
- 浏览器4218核对三酒说明、真实同时购买/即时3醒0醉/简短效果提示，console无警告错误；tests/economic-drinks-preview.jpg。未做手机实机验收，未发布，旧4173局未强制刷新。

## 2026-10-16 本地：按关卡时间排刷怪，末段停止增援

- 普通层远程怪固定在开场、4/8/12秒按原数量/压力预算分批入场，不等待清怪；没有待刷怪的时间点自然跳过。第14秒起全部停止新增怪物，最后6秒只处理已有敌人与弹幕，未刷队列直接取消，大步长跨入收尾区也不补刷错过的怪物。
- 追逐怪采用同一个关卡真实时间轴，从0.65秒起按楼层间隔排生成时点，不再受慢时间或清光远程怪影响；保留场上10只、每层最多24只等限制。人数满或入口被挡的时点作废，不积压到末段补刷。暂停冻结时间表；BOSS召唤、炮台层和金蛛房不受本次普通层刷怪修改影响。
- test-timed-floors追加4/8/12秒边界、存活怪物不阻塞后批、最后6秒清场/释放人数上限后仍不刷怪、末段积压/大步长不补刷、追逐时点不受慢时间与暂停影响等断言。npm run check、新增专项、原追逐怪专项、完整npm test（tests/spawn-timing-regression.log）及git diff --check通过。未做本轮浏览器/手机实机视觉验收，未发布。

## 2026-10-16 本地：固定时长普通层与不限时关卡停用印钞

- 普通层新增20秒固定存活倒计时，不要求击杀；开场首批、后续每4秒从原有限队列刷一批，不再等待清怪。到时撤去存活怪物、导弹与未刷队列，不产生击杀赏金，沿用正常结算和商店。原炮台生存层保持20秒；B07/B18/B29贪财房固定15秒，全杀不再提前结束，已击杀赏金仍立即支付。
- 普通层、炮台层和贪财房倒计时使用真实游戏秒数，暂停冻结，慢时间/滑板慢速不延长时限；印钞生产与吸取同步使用该时钟。大步长截断至本层剩余时间，禁止跨截止时间生产或取得贪财击杀赏金。
- 印钞格仅在限时战斗中工作。战役BOSS、六种独立BOSS测试、预警/下潜/落地/结算和商店均不生产或吸取，已有生产进度、存货与吸取位置冻结保留；停用时隐藏产物与生产扫描，显示灰色停用标记。医疗/护盾保持原规则。未改变基础产出和价格，未实现此前讨论的双商店/建材/被动设计。
- 新增test-timed-floors并加入完整测试：不杀怪到时通关、清光不提前结束、未清怪时按时刷新下一批、快慢清场印钞一致、暂停/慢时间/大步长、六种真实BOSS冻结产出及存货/医疗保留、贪财全杀等待截止、重开与有限渲染。旧装备生产测试补充限时房上下文，贪财/慢时间断言同步新规则。
- npm run check、完整npm test（tests/timed-floors-regression.log）、追加装备生产/慢时间/六BOSS印钞专项通过；git diff --check通过。未做浏览器或手机实机视觉验收，未发布。

## 2026-10-15 本地：简短醒酒提示与可操作的快速地块闪烁

- 13种酒醒酒结算统一只显示效果短名，如“暴击率增加”“获得玻璃幻影”“两侧追加攻击”，去掉酒名和“醒酒”前缀；F2直接领取奖励同样显示效果短名，已醒酒HUD详情不再重复“醒酒”标签，商店保留完整机制说明。
- 地块明/暗半周期0.05秒，一个完整闪烁0.1秒，三次总共0.3秒后提交并开战；商店预留变化和杀毒工装结算共用快速闪烁。
- 修复landing闪烁在移动更新之前提前return、并在预览启动时releaseJoy导致冻结输入的问题。闪烁期间键盘/方向键/触屏摇杆与正常行走/坐骑移动保持响应；保留旧地块通行和掩体碰撞，新地块第三闪结束才提交，不提前刷怪或推进补给生产；暂停仍冻结预览和移动。
- test-settlement使用统一闪烁常量，新增实际键盘与摇杆移动、进入预览保留已按住摇杆、0.3秒精确开战/暂停验证；test-drinks新增所有13种提示无酒名/无醒酒前缀、真实落寞香槟结算提示验证。preview-terrain步进同步为半周期。npm run check、完整npm test（tests/brief-wake-fast-terrain-regression.log）、追加滑板/生产时序专项和git diff --check通过；本轮未做浏览器/手机实机视觉验收，未发布。

## 2026-10-15 本地：每关恢复的掩体格

- 掩体格6点耐久，每关开始恢复满耐久（普通、生存、贪财、BOSS共用startFloorTracking），碎裂后保留可通行底座；玩家若站在碎裂底座上跨层，恢复时移至最近合法空格。重开清空。
- 玩家/滑板及所有小怪不能穿过；追逐怪含击退、普通巡游、金蛛、无人机三类小机、飞碟小机均接入扫掠阻挡。出舱喷射也阻挡，重叠出生推出掩体，接触每只怪每秒敲掉1点；敌弹（包括反弹每段路径）、追踪导弹命中扣1点并消失，共用激光被遮挡且每次射击扣1点。友方攻击穿过，掩体不加入自动攻击目标。
- 六种BOSS身体碰到/移动扫过即碎，蛇各节和病毒分体按BOSS身体处理；大无人机/蛇/病毒/人形（蜘蛛/机甲）的子步移动及飞碟移动均接入，不阻挡BOSS行走。地刺/锯/地面危险区等保持原机制。
- 扩地1%生成；商店功能格池加入，基础价$14，沿用商店等级数量和价格、延后地块提交与占位保护；碎裂底座不会被其他功能格或陷阱覆盖。所有游戏页F2增加“添加掩体格”。完整和残骸模型共享residentMesh，顶面六段耐久灯、受击闪光、裂痕与碎裂反馈。
- 新tests/test-cover-tile.cjs覆盖真实追逐移动/拆除/穿行、玩家高速/滑动、弹丸最先碰撞顺序/反弹/激光、六个真实BOSS AI、召唤小机喷射/普通移动、每类关卡恢复/玩家安全挪位、真实交易及预留、共享网格。npm run check、完整npm test（tests/cover-tile-regression.log）、git diff --check通过。
- 浏览器核对F2领取与测试场完整/受损/撞碎/下关恢复，console无warning/error；tests/cover-tile-preview.png，fixture tests/preview-cover.mjs（4216）。未做手机实机验收，未发布。

## 2026-10-15 本地：震荡格

- 新增蓝色同心圆震荡格：初始可用，战斗/生存踩入立即清除全场 bullets 敌弹并显示0.7秒扩散光环/音效，20秒战斗时间冷却；需要离开再踩入，停留不自动反复触发。保留友方攻击、敌人、追踪导弹实体、激光及地面机关。
- 扩地2%生成；商店功能格池加入，基础价$18，沿用品质数量/价格及三商品规则；购买预留/落地闪烁提交，防止被其他功能格和陷阱覆盖。F2新增“添加震荡格”。
- npm run check、完整npm test（tests/shock-tile-regression.log）和git diff --check通过。tests/test-shock-tile.cjs覆盖全屏清弹、停留/重入/冷却、暂停及非战斗状态、生存、真实帧先清弹后碰撞、扩地、真实交易/预留/防覆盖及有限渲染数据。未做浏览器或手机实机视觉验收，未发布。

## 2026-10-15 本地：场地变化三次闪烁后生效

- 商店扩地、医疗/护盾/印钞地板、拆除及附带危险机关先付款预留。下一层落地刹停后显示实际目标位置，按0.2秒亮/暗闪烁三次（共1.2秒），结束统一生效，再开始普通/生存/BOSS/贪财房。商店与下坠期间不执行，闪烁期间不刷怪、不推进生产或碰撞。
- 杀毒工装结算先等待原1秒，再对选中的机关闪烁三次，结束时实际移除并同步“减少陷阱”文字；多次清理按顺序执行，原0.4秒条目间隔及结束牌保留。闪烁不修改静态场景缓存，地块提交后才更新；保留原地块对象引用及已有补给状态。
- 预留地图用于可购买性检查，防止扩地超容量、功能地板重复占位和超量拆除；暂停冻结、重开清空，价格/酒/装备逻辑不变。
- test-settlement覆盖三次明暗边界、实际购买/延后提交、所有机关模型隐藏、功能地板/容量预留、开战顺序、暂停/重开、超大步长及渲染；108/61旧时机断言同步。浏览器4213核对扩地/清理明暗与最终地图，截图tests/terrain-flash-preview.png；非手机实机验收。未发布。
- npm run check、完整npm test（tests/terrain-flash-regression.log）、追加机关/重开专项及git diff --check通过；浏览器无console警告或错误。

## 2026-10-15 本地：特调酒纳入三商品

- rollShop将特调放入第三个商品位，取消额外追加第四件；沿用55%出现概率、可用酒过滤、定价及购买规则，保留扩地位与装备保底位。
- test-drinks覆盖实际货架始终三件、酒占第三位、实际购买/重复扣款、渲染三张购买卡，以及刷新/升级后仍保持三件；57/59回归更新货架数量断言。
- npm run check、酒/武器/装备商店专项、完整npm test及git diff --check通过；完整回归日志tests/drinks-three-slot-regression.log。未做本轮浏览器/手机实机视觉验收，未发布。

## 2026-10-15 本地 0.249.0：五只机械金蛛限时贪财房

- B07/B18/B29各一间贪财房，不替换生存或BOSS；1秒入场提示后真实15秒倒计时。每间5只金色机械蜘蛛，单只HP13/30/54、赏金$12/$20/$32，随章节提高。保留既有永久陷阱，不刷普通敌人与追逐怪，金蛛仅逃跑、不攻击或接触伤人。
- 每只击杀立即gainCash入账/浮字/纸钞，贪婪护甲倍率作用一次；排除普通敌人$4掉落。超时剩余目标逃走，不产生死亡筹码，保留已赚赏金；全部击破提前结算。HUD显示倒计时、击杀数、单只赏金与已赚金额。死亡尸爆筹码结束后再正常结算，酒按一个房间计数，商店/下潜/重开清理房间状态。
- 根据用户反馈从单只全有全无改为五只独立奖励，并从有机蜘蛛改为方形装甲机身、后置钱匣、发光传感器、八条分节腿/液压杆/机械关节/脚垫。所有固定几何通过共享residentMesh，腿部仅更新实例变换。
- 出生前syncGrid，5只沿合法椭圆分散；使用路点巡游、避人/避同类与提前避墙，转向上限2.6rad/s，实际移动距离驱动步态。修复出生边界不一致与即时转向造成的跳动。每步暂停直接冻结。
- F2增加「机械金蛛房测试」，重置本局并标记testMode，从第一章房间开始；正常4173旧标签需刷新加载。所有游戏HTML的倒计时small增加survival-label，由贪财/生存恢复对应名称。
- 新tests/test-greed-room.cjs覆盖五只分散生成/逐帧位移与转向上限/共享网格稳定、每只即时赏金与部分成功、最后时间边界、超时不支付未杀目标、真爆炸/其他伤害入口、翻倍、暂停慢时间、尸爆酒、完整商店衔接与重开。经济模拟纳入实际金蛛收入。
- npm run check、完整npm test（tests/greed-room-regression.log）与git diff --check通过。浏览器核对五只机械造型/倒计时/实际5只击破+$60/商店衔接，无console警告或错误，截图tests/gold-spider-room-preview.png。未做手机实机验收，未发布。

## 2026-10-15 本地：高等级商店物价与重掷费用

- 商品等级倍率统一为Lv.1–5：1/1.4/2/2.8/4，装备先计算品质基础价再乘倍率，补给替换旧每级20%的加价，特调及直接构建入口同步；楼层附加费仍封顶$3，风险补给保留75折。一级价格与升级费用不变。
- 重掷起价$2/4/7/11/16，每次追加$2/3/4/6/8，界面显示当前等级增量。新商店清零次数，升级保留次数。
- 经济专项覆盖五级物价/特调入口一致、真实购买与重掷精确扣款/不足余额、风险折扣、楼层封顶和攒钱可达满级；频繁购买/重掷会推迟满级。盲盒价格回归同步。
- npm run check、完整npm test（tests/shop-pricing-regression.log）及git diff --check通过；未做浏览器/实机视觉验收，未发布。

## 2026-10-15 本地 0.248.0：十三款特调酒接入商店与战斗

- 新增酒被动池：青蟹莫吉托、贝拉多娜、灌铅苦艾、翩翩教父、琉璃伏特加、落寞香槟、铁屑拉格、焦糖威士忌、海盐世涛、比特吗啡、小红帽、迷路小丑、艾尔激流。沿用已有商店，每次生成/刷新有55%概率追加一款酒，不替换原来的三件商品；价格14～24加原深度加价，不随商店品质改变效果。可同时购买多杯，包括同款；独立记录筹码和奖励，不占装备槽。
- 饮用商店不计数，下一个实际战斗/生存/BOSS房间开始承担筹码；结算队列逐杯减少房间数，最后一次结算时兑现本局永久奖励。过场/商店/暂停不推进；重开清空。剩余战役房间不足的酒不再出售；满级商店及已预留升级不会售出无效艾尔激流。
- 青蟹：横向限定2房→每次主武器向左右90°各复制一轮；贝拉多娜：完全反转3房→向后180°复制一轮。按已发出的完整攻击复制，保留Uzi双枪、追踪飞弹初始朝向、五蜂延迟、剑挥砍/剑气、激光与电弧及独立命中/暴击快照；复制之间不递归相乘。移动奖励蜜蜂同步受益，无人机不会额外复制。电弧复制限制方向并保留连锁距离，内部旋星复制保留跨帧伤害冷却。
- 灌铅：敌弹半径×1.5持续2房→主武器实体弹半径×1.5/伤害+15%，不扩大爆炸/激光；翩翩：敌弹速度+40%持续2房→真实位移3秒累积主武器攻速+100%，静止2秒消退，停下/撞墙不累计；落寞：最终移速-25%持续3房→主武器暴击率+25个百分点。
- 琉璃：下一房有效受击即死、绕过护盾，正常无敌/滑板免伤保留→每房4个共享常驻网格的半透明玻璃幻影，各50%主武器伤害，各自就近瞄准/受击，一击碎裂。沿玩家历史路径按36单位间隔跟随，停下不重叠；走过足够距离后逐个出队；子弹、敌人接触、激光、地刺/锯/飞轮、尸爆、燃烧地等可打碎。下一房补齐，已发射攻击正常保留。复制攻速/暴击奖励可与幻影组合，但幻影不再触发侧射/后射，防止递归。
- 铁屑：2个斜向反弹飞轮持续3房，出生1秒预警→3个环绕护卫飞轮，实际位置拦截实体子弹、每0.25秒接触伤害为当前主武器伤害50%；不拦激光/爆炸。新模型共享residentMesh，飞轮与临时地面区房间结束清理。
- 焦糖：敌人死亡0.5秒预警后留下半径1格/5秒火焰持续3房→主武器命中减速25%/灼烧3秒，刷新不无限叠层，灼烧每0.5秒为命中伤害20%。火焰复用机甲红色圆形Billboard。海盐：立即清盾、2房无法补盾→每房3颗盐晶，每颗挡1次伤害并喷射12枚穿透碎片；与琉璃即死重叠时不能抵消即死。
- 比特：立即永久支付1格基础生命上限，不能靠换甲归还或支付最后1格；敌弹速度+40%持续3房→主武器伤害/攻速+25%、暴击率+15个百分点、暴击倍率+0.5。相同弹速筹码按增量叠加，子弹统一入口/直接push的BOSS子弹均仅处理一次。
- 小红帽：3房敌人死亡0.6秒预警后尸爆（最后一只也必须结算后通关）→主武器/复制命中产生半径1格、持续3秒毒雾，共享2秒冷却，每0.5秒造成命中伤害35%（最低0.5），毒雾/灼烧不自触发。尸爆不伤敌、不连锁；死亡去重。
- 迷路小丑：2房玩家周围2格清晰、外侧0.5格渐变、2.5格外完全纯黑，投影椭圆跟随角色，HUD保持可读→暴击率+20个百分点/倍率+1。艾尔：2房玩家外观/受击半径×1.5（地形通行不变）→商店等级+1，最高5级。
- HUD可展开查看每杯筹码剩余房间/醒酒说明；商店酒卡明示两阶段。所有主流程/独立场HTML增加遮罩和状态节点。F2增加特调下拉与“饮用·承担筹码”“直接测试醒酒”，后者用于直接检验奖励，测试局不写记录。
- tests/test-drinks.cjs覆盖13种真实交易/全池/不可重复扣款、多种叠加/结算时间/生存计数/暂停重开、永久血上限与换甲、晚期过滤/满级、四种武器复制方向与实际伤害/追踪/快照、大小/速度、即死/盐晶、幻影轨迹/碎裂/重生、飞轮拦截伤害、尸爆/燃烧/毒雾实际伤害、纯黑投影与常驻网格。57/59商店回归保留原三件货并允许追加酒。
- npm run check、完整npm test及相关追加专项通过；最终完整日志tests/drinks-full-regression.log。浏览器4212专项核对商店卡、局部纯黑、幻影复制、燃烧/飞轮，无console警告错误；截图tests/drinks-shop-preview.jpg。非手机实机验收。未打包、未发布；正常4173旧局未强制刷新，刷新后加载0.248.0。


## 2026-10-15 本地：逐条关卡结算与商店拆除延迟反馈

- 普通关卡结束先等真实1秒，再执行结算队列，每条间隔0.4秒：杀毒工装每次“减少陷阱 ×1”与真实移除同刻，翎羽无伤层数与“攻速 +10%”同刻，生存奖金与入账同刻；最后一条展示0.4秒后接原1.5秒结束牌/商店，无事件保持旧时长。BOSS保留死亡演出与现有等待。
- 商店拆除危险源购买时扣款并预留次数，陷阱保留到下一层combat/survival实际开始1秒后；人物头顶“消除陷阱 ×1”随人物投影，同刻移除最近永久危险源，多个购买按0.4秒执行。过场/预警/商店不计时，暂停冻结，静止减速不延长真实等待和浮字寿命，重开清空。预留次数避免重复购买超出永久陷阱数。
- tests/test-settlement.cjs覆盖精确时间边界、真实地形/浮字同步、多事件、暂停/重开、真实购买/预留、预警排除与慢时间；相关纯净/翎羽/经济/生存/战役测试按新生效点更新。浏览器4211 fixture已核对头顶浮字与结算提示，无console警告/错误，预览tests/shop-erase-preview.png。npm run check、完整npm test（tests/settlement-final-regression.log）、最终浮字寿命/投影相关专项及git diff --check通过；未发布。


## 2026-10-15 本地 0.247.0：大血条、死亡演出、延迟结束、三飞轮与关闭触手

- 六个BOSS与独立场共用顶部大血条；排除小机，病毒用encounterMax固定总量。所有游戏HTML已加入HUD。
- bossDying状态持续真实3秒，冻结模型动作/时间并清空所有弹丸、锯刃、危险区和机甲导弹；前2秒身体多点常驻爆炸球/火花及residentMesh白色着色器闪烁，2秒生成常驻碎块飞散，3秒结束并清空实体，支持暂停、重开和音乐。最后一击延迟shatter，未过3秒不支付最终奖励/进入结局。
- 普通战斗/生存层先安静等1秒，再展示1.5秒结束牌；STAGE_CLEAR_TIME=2.5。BOSS已经碎裂后等1秒，finishCampaignBoss用beginStageClear(0)保留1.5秒结束牌。
- 电锯无人机固定3枚，120°均匀轨道，绘制与碰撞共用dronePosition(index)，三枚都有接触伤害且共享原攻击周期；陷阱不成为目标。
- SHOE_CATALOG保留触手内部原型，SHOE_TYPES筛掉tentacle，测试面板和商店均关闭，equipItem也拒绝；保留旧IK内部回归。
- campaign专项覆盖8条路线每种BOSS的3秒时间边界、姿态冻结、多点爆炸/闪白、碎块网格稳定及实际结局；原商店/生存/蛇/病毒/无人机/飞碟测试按新延时更新，蛇运动回归固定随机种子以便复现。
- npm run check、完整npm test、更新后campaign/病毒/飞轮专项及git diff --check通过，完整日志tests/latest-regression.log。
- 浏览器在4210战役fixture实际检查大血条、三飞轮、爆炸与碎裂，无console警告/错误。正常游戏4173用户正在玩的旧标签未强制刷新；代码更新需刷新后生效。本地未发布。

## 2026-10-15 本地 0.246.0：六 BOSS 分成三关随机二选一

- 三关分别为蛇/噬菌体、枪手机械蜘蛛/赤红裁决者、大无人机/飞碟，每组50%概率；保持每关10轮（含生存），B11/B22/B33挑战，第三场胜利通关，撤掉B44固定BOSS。
- campaignBoss表示关卡序号，campaignBossKind表示本场选定类型；在预警开始时随机一次，HUD与实体统一使用选择结果，早期胜利/重开清空选择。
- 提取spawnCrimsonMechBoss供战役与独立场共用，保留420HP、四招AI、巡游及常驻模型；避免战役动作调用实验HUD缺失节点。主index及离线打包加入crimson-mech.js，正常运行不切测试标志、不重置装备/血量/地板。
- 飞碟/无人机母机死亡即结束，即使仍有子机；结束清空所有BOSS引用、子机、锯刃、机甲燃烧导弹与爆炸效果。
- campaign专项覆盖全部8条随机路线、六种真实AI/伤害击杀、病毒分裂、飞碟护盾/无盾窗口、无人机支援、正常音乐/商店衔接、第三关结局/重开和主脚本加载。npm run check、完整npm test与git diff --check通过，日志tests/latest-regression.log。未做本次浏览器/实机视觉验收，未发布。


## 2026-10-14 小飞碟上限8与扇形射击

- 小机每批2→4→6→8→8……，使用统一ufoWaveSize控制生成数量与HUD下一批预告；6秒固定无盾窗口与每批喷射出生保护保持。
- 小机单发改三发扇射，以射击时玩家位置为中心、左右各.22弧度（总约25°）。保留175速度、6秒寿命、2.8秒射击间隔与.6秒预警，发出后直飞不追踪。母机五发扇射不变。
- npm run check、飞碟专项、git diff --check通过；专项覆盖前八批实际生成数量到8后不再增长，以及真实三发数量/对称夹角/恒速/释放后不追踪。本地未发布。

## 2026-10-14 明亮球形玻璃与固定窗口偶数递增

- 玻璃由半径29/高度62的椭圆半罩改为半径35、中心y37的完整球形，底部自然嵌入飞碟；颜色深青蓝→明亮淡蓝，保留78%不透明度，反光shader法线改为球心37的等比例法线。
- 首批改2架、后续4/6/8……，每批+2。撤掉五阶段上限与最后永久无盾：每次全部小机死亡后固定6秒无盾窗口，母机存活则继续整批喷射重生；输出足够可在任意早期窗口击杀，无强制阶段锁血。HUD移除阶段总数并显示下一批偶数数量。
- npm run check、飞碟专项、GPU常驻/上下文恢复回归、git diff --check通过。专项真实清理并验证前八批2→16及固定窗口，补充球面顶点半径校验、同360HP下360伤害一轮/90伤害四轮的真实胜利对比。浏览器确认淡蓝球罩/首批两架，无console警告错误，截图tests/ufo-spherical-glass-preview.png。本地未发布。

## 2026-10-14 六边形球形护盾、玻璃舱与喷射出舱

- 倾斜约缩小到原来的45%（俯仰最大约7.4°/侧倾8.3°），自转与变速项均翻倍：母机基础55°/秒、小机82.5°/秒。
- 原环形护盾换为细分二级二十面体的对偶球壳：150个六边形与闭合球面必需的12个五边形，半径93、球心舱体上方24；格心alpha .025，亮边alpha .88并由shader根据局部高度/方位/战斗时间产生流动亮光。固定球壳几何常驻，运行时仅更新姿态和shader时间。
- 新增半球玻璃舱（深青蓝、78%不透明度、视角反光）；驾驶员有实际遮挡。大小飞碟共享glass常驻网格。小机尺寸.34→.43（约+26%）、半径18→23，头顶新增独立水平护盾图标。
- 供能连线改为5单位粗、alpha .38的能量束，随大小机浮动高度连接，子机死后对应线立刻消失，全部清空即球壳消失。线共用一个常驻网格。
- 小机出舱参照drone-boss的.8秒三次缓出解析积分：母舰42半径舱口出生，向外喷射最长150（边界预先裁剪），逐渐减速到静止，再把剩余帧时间交给巡游/射击。出舱高度从52落到30，有拖尾；出生期间不进入isAttackable、不射击/接触伤害，但提供母机护盾。重生每批均复用此过程。
- renderer residentMaterial支持静态共享网格的透明材质/流动时间：不透明和透明分两遍，透明用标准alpha混合并关闭深度写入，末尾恢复状态；保留原resident LED着色、实例渲染/无扩展回退、上下文恢复。
- npm run check、完整npm test（含飞碟专项，日志tests/ufo-regression.log）、git diff --check通过，实际浏览器显示六边球壳/粗连线/玻璃/图标且无console警告错误；预览 `tests/ufo-hex-shield-preview.png`。专项增加连线数量/死亡清理、材质透明度、150六边格、真实出生免伤、.8秒积分距离/无AI及跨帧一致性；本地未发布。

## 2026-10-14 飞碟醉酒式倾斜与旋转

- 大小飞碟加入围绕中心的俯仰/侧倾（分别最高约17°/19°）、慢速自转与轻微变速，叠加不同频率摇晃；母机自转约27.5°/秒、小机约41°/秒，各小机按seed错开姿态。高度起伏幅度3→5。外星人与舱体整体随动，护盾同步倾斜旋转，血条保持水平。
- 动画只更新residentMesh实例矩阵，依赖战斗时间，暂停/慢动作自然同步；位置、碰撞、最近索敌、护盾/阶段机制保持既有逻辑。
- npm run check、飞碟专项与git diff --check通过；真实浏览器确认倾斜与旋转姿态变化，无console警告/错误。预览 `tests/ufo-wobble-preview.png`。本地改动，未发布。

## 2026-10-14 飞碟 BOSS 本地测试场

- 新增 `dist/ufo-boss.js` / `ufo-boss.html`，主页新增入口；沿用其他新 BOSS 的独立测试场模式，普通四 BOSS 战役次序保持现状。
- 银灰扁圆飞碟、绿色舷灯、驾驶舱框架与可爱绿色外星人（大头/深色大眼/高光/小笑脸）。大小飞碟共享 `ufo:shell` 常驻网格，护盾/阴影亦使用有限 residentMesh key。
- 五批阶段分别 3/4/5/6/7 架小飞碟，每架 5HP，母机 360HP。任意存活小机提供母机护盾；母机仍在 combatTargets 中，保留最近索敌和实体拦弹，resolveShotDamage 集中免伤，阻断易伤叠层及常规受伤闪白，护盾另有受击闪光/限频音效。玩家靠近小机正常转火。
- 小机独立随机巡游/单发射击，母机以58速度接近玩家至100距离并发五发扇射。清空一批立即可伤母机；随后完整6秒无盾窗口，整批重生且数量加一；第五批清空后不再重生，永久暴露。不是部分补兵。
- 支持重开、无敌、装备领取后重启当前实验、胜负/普通重置清理、BOSS音乐。包生成器已包含新脚本；本次未打包或发布。
- npm run check、完整npm test（含飞碟专项）与git diff --check通过，完整日志 `tests/ufo-regression.log`。实际浏览器确认首批模型/护盾及真实战斗HUD，未发现console警告/错误；截图 `tests/ufo-boss-preview.png`。专项覆盖真实各武器免伤、母/子最近索敌、逐只真实击杀、五批数量/完整计时/最终暴露、胜负/装备重启/清理、常驻网格共享/有限值。

## 2026-10-14 喷射0.8秒后静止衔接自身移动

- 喷射持续.8秒，固定最远150单位目标点；按三次缓出曲线接近目标，速度逐渐降至零，而非降至巡航速度。目标距离预先按边界截断，避免先撞墙硬停。解析积分保持跨帧一致，余下帧时间才交给自身移动/射击/维修；出生保护覆盖整个喷射阶段。
- 高度下降按归一化进度维持原幅度。射击48.33、维修155、自杀195速度与既有尺寸保留。
- 语法、无人机专项、campaign、git diff --check通过；测试覆盖.7秒仍不行动、最后.09秒趋近静止、.8秒后开始AI、固定距离与不同帧分段一致性。未做新版浏览器视觉复核，未发布。

## 2026-10-14 喷射减速曲线与小机尺寸/速度调整

- 出舱.32秒改为二次减速：从1200快速喷出，按剩余时间平方减速到各自巡航速度，然后才执行自身AI。采用解析积分，跨帧分段不改变喷射距离；原出生免伤和边界约束保留。
- 射击型正常移动145→145/3（约48.33），保留4HP和.28尺寸；自杀式尺寸.13→.18（放大约38%）、碰撞半径9→12，核心同步放大，保留195追踪和持续补充。维修速度155不变。
- 语法、无人机专项、campaign与git diff --check通过；专项验证等时段位移逐段减少、积分总距离、喷射结束可攻击与恢复巡航，以及三种角色不同帧分段下的喷射一致性。新版未做浏览器视觉验收，未发布。

## 2026-10-14 小机体型/耐久与喷射出舱

- 射击型2→4HP，模型比例.24→.28、碰撞半径15→18；自杀式比例.24→.13、半径15→9，核心与血条同步缩放。维修维持原尺寸/2HP。
- 自杀式取消整场配额，独立每1.5秒检查补足2架；小机总上限6仍保留。射击/维修保持6秒补兵、两类共享18架后备；minionsSpawned现统计这两类消耗，HUD改称支援后备。
- 全部小机沿出生点相对母机方向以520速度喷射.32秒，边界限制与拖尾，随后恢复射击145/维修155随机游走或自杀195追踪。喷射期间isAttackable排除，防止自动锁定与真实武器伤害，期间也不攻击/维修/接触伤害；结束立即恢复可攻击。
- npm run check、无人机专项、campaign与git diff --check通过，新增出生免伤真实射击、喷射位移/结束恢复速度与可攻击、无限自杀补兵及上限测试。未做新版浏览器视觉复核，未发布。

## 2026-10-14 本地 0.245.0：移除跺脚，新增身体转向激光与前方垂直轰炸

- 用户明确撤掉跺脚：删除跺脚动作/伤害/指示器/测试按钮，自动循环改为双枪扇射→蓄能激光→原随机燃烧导弹→前方纵列轰炸。新增「激光测试」「前方轰炸」按钮直接测试。
- 激光原地蓄力跟踪1秒（直接转动身体、最高3rad/s），随后.55秒完全锁定身体方向，给横向躲避时间；开火2.4秒时保持巡游，身体以最高.38rad/s缓慢追转玩家。光束角度完全来自e.angle，没有独立追踪枪口。地面细预警线→红色激光/白热芯，胸口蓄能光；光束沿场地边界截断，真实线段伤害走护盾/无敌帧/滑板系统，收束.25秒后清理动作。
- 新前方轰炸从背部朝天发6发，.2秒间隔，起手锁定身体前方纵列六个落点，非玩家周围随机圈。升空.35秒至1000高度，上空转场段不画横飞，.55秒后只在各固定目标x/z处垂直加速落下，1.2秒落地。每发指示器仍随出生出现，半径40.5、燃烧5秒、红色圆形Billboard与原导弹共享；保留此前连续弧线的随机落点导弹。
- 继续保留长步幅与稳定重心；激光移动时步态取实际位移，双腿可达约束继续生效。新几何均residentMesh且只有有限key，飞弹/燃烧与激光在重开、胜负、关闭弹幕时清理。
- npm run check、git diff --check和机甲专项通过，覆盖激光跟踪/锁向逃生段/移动/身体限速追转/真实伤害/退场，前方共线且固定的六点、严格垂直下降及燃烧伤害、四招轮换和跺脚移除；旧导弹/长步IK/稳定高度/重试隔离均保持。完整npm test亦通过（含同期无人机专项）；未做本版浏览器视觉验收，未发布。刷新4173/crimson-mech.html加载。


## 2026-10-14 射击/维修随机游走与显眼治疗反馈

- 两类小机独立选择全场随机目的地，每.9～2.3秒或接近目的地时重新选择；朝移动方向转身，不再以玩家/母机为移动目标。保留145/155速度；射击预警锁定玩家，维修仅路过母机90范围内生效，自杀式仍195追踪玩家。
- 治疗实际生效时光束宽1.2→3.5，增加三枚向母机流动的绿色光点、两端高亮、母机脚下脉冲绿圈及上方大绿色十字；中断/耗尽/离开范围即隐藏。十字和连接使用常驻网格。
- npm run check、无人机专项、campaign及git diff --check通过；新增两类独立于玩家/母机位置的位移、长期随机换点/边界、治疗十字与缓存稳定测试。未进行新版浏览器视觉验收，未发布。

## 2026-10-14 小无人机加速与自杀式恢复

- 用户要求小机比母机快，尤其自杀式。恢复自杀式，空场每批射击/维修/自杀各2架；2HP、场上6架、总投放18架、6秒间隔与其他招式并行继续保留。
- 母机最高125，小机原95改为射击145、维修155、自杀195。自杀式持续追踪，接触或击毁产生6发环形弹，重复死亡保护；寿命退场与母机胜负清理不爆炸。橙色爆炸核心区分青色射击枪管和绿色维修十字。
- 语法、无人机专项、campaign及git diff --check通过；测试覆盖各类真实位移快于母机、自杀195速度、接触/击毁六发且不重复，以及原并行投放/总量限制。未做新版浏览器视觉验收，未发布。

## 2026-10-14 本地 0.244.0：提前抬脚蓄势与恢复长步幅

- 踩地在预警开始时即抬脚：.18秒平滑抬至离地48单位，保持至.88秒，再用.12秒快速落脚；预警共1秒，落脚同刻造成一次范围伤害，1.35秒收势、1.55秒清理冲击圈。自动踩地跳过通用.85秒空等预警，直接同步进入抬脚和地面指示，避免HUD先预警、脚最后才抬的观感。
- 机甲步态从.18秒小步恢复.36秒长步，向前预判.26秒、落脚触发28单位、抬脚高21单位；重心保持62平滑收敛。长步转弯/落地时将根节点约束在双腿可达圆交集，不压低身体、不改变真实落脚；保持双腿IK实际接地。
- 专项通过：预警20%时脚已高举，85%时仍悬停，末段下降、1秒同刻伤害/冲击、自动预警同步、动作清理；6秒步态平均步距>35且换脚<24次，实际IK接触误差<1e-6；射击高度稳定断言仍通过。npm run check、git diff --check及原人形弹幕/停止动作回归通过，未进行本版浏览器视觉验收，未发布。刷新当前机甲测试页加载。
- 测试时复现原随机导弹角落采样偶发不足间距，增加仅在随机失败时的候选搜索，防止角落落点重叠；正常落点继续随机。


## 2026-10-14 无人机投放与招式并行确认

- 用户要求撒无人机与其他招式同步。现有投放为独立6秒计时，已确认无独占招式或等待攻击结束限制，保留现有节奏与配额。补充代码注释与回归：四招均可在投放的同一步产生真实攻击，满6架/后备耗尽不阻断武器，锯刃同步回收期间仍可投放。
- npm run check、无人机专项、主流程campaign及git diff --check通过。

## 2026-10-14 无人机补充：有限射击型与维修型

- 小无人机仅保留射击/维修两类，撤去尸爆；两类均2HP。首批2秒，之后每6秒检查补兵，空场一批4射击+2维修，场上最多6架、整场累计最多18架；20秒未清掉的子机无奖励退场，仍消耗生产配额。
- 射击型与玩家保持约120～180距离，贴近后退、远离后追赶；.65秒预警锁定方向，三发直线弹间隔.16秒、速度175、寿命6秒。维修型绕母机飞行，90范围内每秒修2HP，每架累计最多10HP、母机共享维修预算60HP；受击暂停.8秒，不超最大血量、不复活。
- 自动瞄准继续按最近目标选择，玩家靠近子机即可转火清理。两种核心颜色/维修十字区分角色，维修连接使用常驻共享网格；HUD显示两类数量及剩余后备。母机胜负、重开清理子机并重置配额。锯刃玩法保留。
- 语法、完整npm test（tests/drone-regression.log）、git diff --check及无人机专项通过，覆盖有限补兵、角色比例、走位/锁向三连发、维修中断/预算、两类2点伤害击杀、最近自动瞄准和清理。新版尚未浏览器视觉验收；未发布。

## 2026-10-14 本地 0.243.0：导弹提速、逐发指示与稳定重心/踩地

- 用户要求导弹加速1.5倍：同一曲线飞行时间1.8→1.2秒，保留每发.2秒间隔。落点依然起手锁定，但每个指示器只在对应导弹实际出生（age>=0且origin存在）时出现，进度从出生开始计算，不再六个同时显示。
- 横向射击下沉原因是模板barrage每帧强制g.height<=62（起手可能从68突降），以及射击起手/瞄准直接跳转朝向。机甲专用步态以62为稳定重心、.18秒较短步长及提前落脚；去除机甲的射击压低上限与躯干前倾，射击转身限速3弧度/秒。原人形与机械蜘蛛仍沿用原逻辑。
- 当前自动循环原本没有踩地，已补成「双枪扇射→背部导弹→重踏」：原地抬起右脚32单位，.65秒地面半径140预警后落脚，圈内一次真实伤害，1.05秒恢复，1.2秒清理地面冲击效果，无环形弹丸。工具栏新增「踩地测试」直接触发。重开/胜负/关闭弹幕清除踩地状态；保留红色圆形燃烧和导弹下蹲。
- 机甲专项通过：1.2秒飞行、出生前无标记/首发仅一个标记、逐发出弹、固定目标、曲线/燃烧/清理；射击变向连续288帧无高度突降；踩地预警抬脚、一次伤害、恢复和自动循环。相关人形弹幕/单枪/站定回归另行运行，未对新版做浏览器视觉验收，刷新4173/crimson-mech.html加载。未发布。


## 2026-10-14 本地 0.242.0：背部导弹、自然弧线与红色圆形燃烧

- 机甲背部两块组件改为各三孔导弹发射器；原高抛/旋转环形弹幕移除，自动循环仅双枪扇射与背部导弹，旧动作按钮映射新招式。双枪固定身体两侧，射击只略抬高，实际枪口和模型姿态共用crimsonHeldGun。
- 导弹起手下蹲约11单位，.45秒首发，随后每.2秒一发，共6发；最后一发1.45秒发出，1.85秒结束下蹲并恢复巡游。每发1.8秒飞行，连续三次贝塞尔曲线从发射器向上、过弧顶后向固定目标俯冲，弹体+Y跟随曲线切线，无水平平移/瞬间倒转分段。短尾光沿真实轨迹。
- 起手锁定全部目标，首个随机在玩家32单位附近，其余在180单位范围内随机取点并最小距离拒绝采样；边界内采样避免等间距网格和墙边堆叠。所有标记固定，不随玩家追踪；每发有独立发射/落地时刻及收缩预警圈。
- 燃烧半径27→40.5（×1.5），持续5秒，最后.8秒视觉与伤害范围同步收缩；真实伤害复用hurt（护盾/无敌帧/滑板），落地不产生散射子弹。方块火苗改为GPU常驻圆形网格的红色Billboard，朝向固定相机，轻微上浮叠层；保留地面红斑。标记/飞弹/圆片固定网格常驻，缓存key不随时间变化。
- 重开/胜负/弹幕关闭清空飞弹和燃烧，旧人形及机械蜘蛛不改变。全场仍143格，未发布。
- 专项验证六发固定随机目标（含角落）、.2秒间隔、先蹲后发、曲线起终点/切线连续/姿态有限、1.5倍半径、红色圆片几何、持续燃烧伤害和到时退场、无环弹、移动/重试隔离。早期六发版本曾完成浏览器WebGL预警/燃烧复核；最新曲线和红色圆片版本自动刷新被浏览器安全策略拦截，未完成新版浏览器视觉验收，需用户手动刷新当前4173/crimson-mech.html。
- 最新语法检查、git diff --check及机甲专项通过；完整npm test在现有test-drone-boss的「retargets moving player」断言失败，单独复跑同样失败。该无人机模块有其他同期修改，本次未修改无人机源码或其测试，未宣称全量通过。


## 2026-10-14 本地 0.240.0：缩小机甲、三招实弹与持续移动

- 赤红机甲相对0.239缩小至2/3（最终比例1.0667），阴影/枪口位置/受击半径同步。独立场自动三招循环：双枪三发扇射205速度/.24秒间隔、旋身双向螺旋150速度/.11秒间隔、高抛两颗陨弹各扩散10发145速度环弹，首颗锁定释放时玩家位置。全部真实伤害，7秒寿命，.85秒招前预警、1.2秒换招间隔。
- 用户追加空闲和射击都要走动：默认开启85单位/秒四点巡游，休息/预警/三种枪械动作中持续位移，复用人形双腿IK；旋身与行进独立。保留手动停止行走和弹幕开关。玩家步枪恢复自动开火，F2死后装备重试仍进入机甲场；重开/胜负清除弹幕与落弹。
- 固定模型继续residentMesh；落弹世界预警取消模型缩放，避免实际落点与显示错位。未接入主流程、未发布。
- npm run check、完整npm test和git diff --check通过。机甲专项覆盖2/3比例、三招循环、落点锁定/落弹时刻/10发散射、实弹伤害、清理/装备重试及空闲和各射击动作期间位移、长时间场内巡游。浏览器WebGL已检查机甲与旋身弹幕，无error/warn，未手机实机验收。


## 2026-10-14 本地 0.239.0：赤红双枪人形机甲

- 基于原人形BOSS模板新增独立 crimson-mech.html / crimson-mech.js 造型场，CR-02「赤红裁决者」。默认站定、常驻双手手炮，模型1.6倍，完整机械上臂/前臂、红色分层胸肩腿甲、深色骨架、金色面罩与枪械导光、背部散热组件。复用双腿IK和原动作，不改变主流程BOSS阵容。
- 首页与原人形测试场新增入口；动作面板移至底部并折叠。展示时默认关闭玩家自动开火（shootTimer=Infinity），F2装备仍可启用武器测试。重开与胜负重试保持机甲造型；原模板不变。
- 全部固定几何使用residentMesh，活动部件仅变换。新增 test-crimson-mech 覆盖站定/双枪常驻/几何有限/缓存稳定/七种动作/重开与模板隔离。
- npm run check、完整npm test、新增机甲专项和git diff --check通过。真实浏览器WebGL已复核站立造型，控制台无error/warn；未手机实机验收，未发布。预览 http://127.0.0.1:4173/crimson-mech.html。


## 2026-10-14 本地 0.238.0：全周大型锯刃与整批同步回收

- 用户追加特殊攻击：发射锯子、撞墙卡住、这一段发出的锯子一起收回；随后明确要求与场景锯子一样大、朝四周多发且其中一把瞄准玩家。最终作为第四招「回收锯刃」，.8秒起手后一次发12把，30度均匀分布，以当前玩家方向为第一把的基准；出手后不追踪。
- blade与普通场景锯子采用相同17盘半径、14内环、18齿心半径及9x3x5齿尺寸，25伤害范围；固定网格residentMesh，旋转仅更新实例姿态，三种状态核心颜色key有限。锯子240速度，按半径内缩的场地边界精确计算首次交点、卡墙停止位移。
- 招式第5.3秒开始.7秒闪圈/文字预警，第6秒整批同步回收（包括尚在飞行的同批锯子），以300速度飞回移动母机；这一招固定9秒，过载仍保留回收预警和停墙时间。去程、墙上与回程均造成真实伤害，使用相对玩家位移的扫掠碰撞，走原护盾/无敌帧/滑板逻辑；锯子作为危险源不参加自动瞄准。
- 整批最多24把/18秒保险寿命；正常每招12把并回收退场。母机胜利、玩家死亡和重开清理，性能面板/诊断增加锯刃数。独立场新增「锯刃测试」按钮，直接切入该招，不重置玩家装备/血量。
- npm run check、完整npm test通过；最终test-drone-boss再次验证12向均匀分布且仅一把对准玩家、场景同尺寸、四面及斜向卡墙、墙上固定、统一时刻回收、移动母机回收退场、去程/回程扫掠与墙上真实伤害、非瞄准目标、GPU缓存稳定、死亡/胜利/重开清理与手动测试按钮。test-campaign验证第四招进主流程。
- 使用独立浏览器测试页进行真实WebGL复核，确认整圈卡墙、预警及同步回收HUD，无error/warn。截图tests/drone-saws-preview.png。用户原测试页未刷新，刷新后有「锯刃测试」按钮。未手机实机验收，未发布。

## 2026-10-14 本地 0.237.0：恢复间隔释放、每批六架

- 用户撤回持续释放，要求间隔性释放、一次6架。改为开战2秒首发6架，之后每6秒一批；保留场上6架上限，如仍有存活只补空位，间隔内不补充。六个不同释放位置，防止同批重叠；子机追踪和六发尸爆保持。
- npm run check、test-drone-boss与test-campaign通过，验证六架首发、间隔内无补兵、下一批及数量上限、六机共享常驻网格。未发布。


## 2026-10-14 本地 0.236.0：攻击中持续释放与六发尸爆

- 按用户反馈将子机释放由首发2秒/间隔6秒改为首发.8秒/间隔1.2秒，与母机攻击并行，在全部三种攻击期间持续补充；每批最多2架，仍保留场上6架上限，有空位继续补充。
- 小无人机尸爆12发改6发，每60度一发，速度145与寿命9秒保持。
- npm run check、test-drone-boss、test-campaign与git diff --check通过；专项同步六发环弹、实际尸爆伤害与重开计时，增加三种攻击中持续释放/补充断言。未重新做浏览器视觉验收或发布，当前测试页刷新后加载新版。


## 2026-10-14 本地 0.235.0：大无人机释放追踪子机与环形尸爆

- 用户要求大无人机排出小无人机、各自追踪玩家并产生环形尸爆子弹。母机开战2秒首发两架，此后每6秒补充两架，场上最多6架（空槽才补充）。子机6HP/15受击半径，.45秒释放展开后以95单位/秒持续追踪玩家，接触伤害走原护盾/无敌帧系统。
- 子机作为正常enemies目标参与就近自动瞄准及全部友方伤害。共同shatter死亡结算调用尸爆：在实际死亡位置一次性放出12发均匀环弹，145速度、9秒寿命，真实伤害；标记防止重复爆炸。火箭范围击杀也走共同结算。接触不自爆，击毁后才尸爆。
- 小机复用母机外壳/旋翼显存常驻网格，缩放.24、35单位悬浮、橙色核心和独立血条。新增阴影/核心也是residentMesh，运动/旋翼动画不增长缓存。
- BOSS测试HUD显示小无人机数量。母机击败直接结束第四场或独立测试，清理活子机与弹幕；玩家死亡、重开、普通reset同样清理。场地清理不触发尸爆。
- npm run check、完整npm test及git diff --check通过。test-drone-boss增加定时排出/上限/补空槽、追踪玩家变位、展开接触保护、实弹/火箭击杀一次性12环弹、尸爆真实伤害、父子共享网格/缓存稳定及胜负/重开清理。test-campaign改为只击杀B44母机，验证仍有活子机也正确通关。
- 在4173/drone-boss.html真实WebGL测试页复核释放与击杀表现，无error/warn，截图tests/drone-minions-preview.png。未手机实机验收、未发布。


## 2026-10-14 本地 0.234.0：全部装备描述极简化

- 按用户截图反馈，检查全部武器目录（含内部旧武器）、护甲、坐骑与无人机；基础描述去掉外观、模型、推荐搭配和重复说明。共享 equipmentSpecialEffects 同时用于盲盒比较和 F2 装备卡，仅展示属性增幅、攻击方式与必要的触发/持续时间/叠层/冷却。
- 飞行星星仅显示实际攻速与暴击率；鲨鱼仅显示爆炸半径；飞机、飞碟、蜘蛛、飞剑、唱片仅保留实战数值和效果。滑板保留持续滑行、转弯减速、边缘反弹、自动特技条件、攻速层数和无敌冷却；章鱼标明无属性加成。
- 属性继续从实际装备实例读取，保留品质、坐骑平衡缩放和商店随机浮动。未修改属性数值、模型与战斗逻辑。
- 更新旧测试中针对外观长文的断言，并扩展 test-122 覆盖所有类型/五品质/随机属性的描述长度、无外观冗文与实际加成显示。
- npm run check、完整 npm test 和 git diff --check 通过。本次未刷新用户当前游戏局、未进行浏览器或手机实机视觉验收，未打包或发布。


## 2026-10-14 本地 0.233.0：大无人机 BOSS · 空域镇压者

- 新增 dist/drone-boss.js / drone-boss.html，参考现有蛇、噬菌体、机械蜘蛛的独立测试场和共享战斗接口，设计为四个涵道旋翼、宽装甲机身、下挂双炮/传感器与悬浮阴影。900HP，受击半径52，正常武器/无人机/暴击/护盾/坐骑机制继续复用。
- 三招顺序循环：横移点射（双炮交替发三发锁定扇形弹，205速度/.85秒间隔）；锁定轰炸（锁定玩家当前地面位置，1.1秒圈内预警后落弹，半径33伤害并扩散8发135速度环弹）；旋转十字弹幕（4发155速度、.48秒间隔，转动发射方向）。发射后无追踪。轰炸每轮三颗；招式初始留.8秒起手，弹幕有限寿命9秒、危险区1.7秒清理。
- 飞行限制在场内，不摧毁地板；半血后永久过载，普通招式6秒改5秒、攻击间隔乘.8，保留.8秒起手和1.1秒地面预警。固定外壳/旋翼/核心/落弹全用renderer.residentMesh，旋翼只更新实例变换，缓存key不随时间增长。
- 主流程延长为40轮普通关+4场BOSS：B11蛇、B22噬菌体、B33机械蜘蛛、B44大无人机；前三场仍去商店，第四场通关。首页入口/胜利文案/双音乐切换/离线脚本模块清单一起更新。
- 独立场保留143格、8生命、步枪、重开、无敌、F2装备和性能面板；败后装备领取重开正确无人机场；重开/死亡/胜利清理落弹和弹幕。
- npm run check、完整npm test及新增test-drone-boss通过，test-campaign更新为实际连续40轮四场击杀通关。专项涵盖完整攻击循环/边界、锁定/1.1秒预警/单次散射/危险区退场、敌弹与爆炸真实伤害、半血过载、共享模型/缓存稳定、宽受击范围、胜负/重开/装备恢复。
- 使用computer-use在独立4173/drone-boss.html浏览器页进行真实WebGL模型与落弹预警复核，无error/warn，截图tests/drone-boss-preview.png。原有游戏页未刷新，未手机实机验收、未发布。测试入口：http://127.0.0.1:4173/drone-boss.html。


## 2026-10-14 本地 0.232.0：静态场景/背景/鲨鱼模型显存常驻

- 用户当前B26商店143格、无敌弹/粒子仍绘制15.29ms，背景6.09ms；缓存30秒无增长。用户要求把每帧绘制放进显存。导出原局确定电击枪/羽毛护甲/鲨鱼飞艇/火箭无人机。
- 地板/线路/护栏等静态sceneData用独立STATIC_DRAW缓冲，只在地图/视口几何变化时上传；缓存命中不再每帧复制到动态数组。缓存key去掉纯战斗状态，商店/战斗无需无效重建。WebGL恢复时重建缓冲。
- 光瀑改为一个六顶点显存面片，fragment shader计算原7条光带的速度/宽度/重叠/色相/渐隐和LED格点；CPU每帧仅更新28个光带参数、8个色相、背景色和24字节真实FFT纹理。预先对流动相位取模，避免长时/移动端精度放大；低高fragment精度路径匹配varying，NPOT纹理用LINEAR+CLAMP，uniform数量符合WebGL1最低标准。
- 鲨鱼飞艇固定外壳/阴影用residentMesh，姿态更新取代每帧重新建模及逐顶点旋转；尾巴摆动仍保留动态几何，悬浮/骑姿/碰撞/装备机制不变。
- 性能面板显示总顶点、每帧生成/静态常驻/背景GPU/模型常驻分项，已知GPU缓冲估算包含新场景和背景缓冲。减少的是CPU构建/上传，常驻几何仍参与绘制。
- npm run check及完整npm test通过。新增test-gpu-residency验证移动30帧固定网格/背景/鲨鱼只上传一次、地图变化及上下文恢复重建；背景专项检查20250组GPU颜色参数与原函数差异<.003（FFT8bit），测试55/151/152/184适配独立GPU几何而保留视觉/实例化检查。
- 独立B26同装备/143普通格/569x1012浏览器复测，角色无无敌闪烁且持续显示，绘制约1.34ms、背景0.02ms、提交0.12ms；每帧7062动态顶点、35976静态顶点、3252模型常驻、背景6顶点。原局地形和永久升级没有完整复制，不能直接当作原局同一帧速度比；未手机实机/GPU计时验收。结果tests/gpu-residency-results.json。
- 真实WebGL新shader成功编译、背景/地板/鲨鱼画面复核；原用户局不刷新或重置，刷新后加载新版。未发布。


## 2026-10-14 本地 0.231.0：实时性能与残留对象检测

- 用户要求加入性能检测，怀疑空场景卡顿源于存储残留。新增dependency-free dist/performance.js，在主游戏及全部BOSS测试入口加载。右上角「性能」/F3开关面板，不暂停游戏。
- 每秒记录真实RAF FPS/P95（保留>35ms真实间隔，不使用玩法dt截断）、>50ms帧、浏览器长任务、逻辑/绘制/背景/音频/CPU提交分项；隐藏页/上下文不可用期间排除帧间隔。提交不代表GPU执行。
- 追踪敌人/死亡残留、敌友弹/目标引用、导弹、粒子/爆炸/危险区/浮字和DOM节点、待刷、蛇路径、天降及坐骑拖尾；显示JS堆（不支持明确不可用）、网格/颜色/闲置缓存、实例数、CPU网格/场景/动态容量和已知GPU缓冲估算、顶点、画布和实例化支持。JS堆及已知缓冲不是浏览器或显卡总内存。
- 最近30秒趋势明确显示堆/网格/颜色/粒子变化；初次加载缓存、闲置常驻模型及容量高水位不会直接当作泄漏。只读采样，不自动清理游戏内容。
- 「导出诊断JSON」包含约20分钟一秒采样、64个尖峰及当前网格名称/实例/CPU/GPU缓冲清单；「重置记录」只清检测数据。history上限1200、spikes64、帧窗口240；不写入localStorage，不积累无限逐帧记录。
- npm run check及完整npm test通过。新增test-performance验证真实帧间隔、分项时间、后台排除、全部缓冲上限、导出、不可用内存、非破坏重置和异常传播。浏览器菜单/战斗/失败面板和JSON下载实际通过，无控制台error/warn；独立2分钟测试缓存6网格/100颜色稳定、堆有回落，不能据此排除原用户场景其他问题。
- 原用户局不刷新、不重置；用户刷新后加载新版检测。离线打包已包含performance.js，未发布。


## 2026-10-14 本地 0.230.0：背景光瀑重复计算优化

- 用户反馈少量敌弹时卡顿；现场DOM在B07商店、33格、冲锋枪改良，控制台无error/warn。保留原局，独立浏览器场景测量无敌人/子弹时绘制8.26ms，其中背景6.30ms、逻辑0.02ms、FFT0.01ms。两次复现均约60FPS，所以确认昂贵背景开销，但不能声称已复现/解释全部掉帧。
- 原光瀑每个横向单元两次重新计算7条光带范围、色相、渐变、频谱、场景光色，导致大量重复三角函数/数组临时对象。改为每帧一次光带范围/背景色、每行边缘一次7条光带色阶、每列一次FFT，再在单元内合成。保留完整网格、带宽/速度/漂移/重叠/光色、真实频谱与下坠锚定。
- 浏览器同背景优化后1.47ms（约减少77%），总绘制3.39ms，仍约60FPS；空背景对照1.77ms。背景均29520顶点。随机地形不同，非背景部分1.8/1.77ms基本相同。VM mock基准56.05→5.97ms不能作为浏览器帧率。
- 新test-background-perf在多色相、FFT、滚动和视口高度验证138560个单元两端RGB与原解析效果差异<1e-12、有限几何和计算量上限；test-55与语法检查通过。结果见tests/background-perf-results.json，复现入口tests/preview-performance.mjs（4211）。
- 原用户4173页面不自动刷新，以保留当前局；刷新后加载优化且重新开始。未发布。


## 2026-10-14 本地 0.229.0：双背景音乐与三场 BOSS 通关

- 用户提供的 Downloads/Relentless Minor (1).mp3 已复制为 dist/audio/normal-theme.mp3，作为普通关卡/过场/商店背景音乐；原 relentless-minor.mp3 保留为 BOSS 战音乐，警告开始切换，前两场结束恢复普通音乐。两首独立保存播放进度，共用媒体/WebAudio/真实FFT，保留商店降音量、暂停、静音和后台挂起。
- 主流程为 10 轮关卡 → 蛇（B11）→ 10 轮 → 噬菌体（B22）→ 10 轮 → 枪手机械蜘蛛（B33）→ 通关。十轮中保留现有生存关。取消原每三层旧守层者；蛇、噬菌体分裂与机械蜘蛛四招均复用真实战斗模型，BOSS 关不刷追逐小怪，不重置装备/血量/地板。
- 击败前两场后仍进入商店；噬菌体必须击杀全部分裂体才结束。第三场显示通关成功，停止音乐/战斗且不再进入商店或第四场，支持重新开始。独立测试场保留。
- npm run check 与完整 npm test 通过；新增 test-campaign 覆盖连续30轮、三场顺序、实际子弹击杀、病毒分裂存活阻止清关、蜘蛛AI、最终结束/重开和两首播放进度/静音；原 test-69 的每三层旧BOSS出场断言按新流程更新，旧伤害清关回归保留。
- 本地浏览器验证普通音乐199.88秒与BOSS音乐170秒均成功加载和实际播放，机械蜘蛛在主游戏B33渲染，控制台无error/warn。未进行手机实机验收，未发布。
- 离线打包更新：包含全部四个BOSS模块和双音乐，音乐切换路径嵌入data URI。


## 2026-10-13 本地 0.228.0：霓虹机械蜘蛛BOSS与扩大受击范围

- 牛仔实战改为「机械蜘蛛 BOSS · 霓虹守卫」，原cowboy.html路径保留。仅显示四足机械底座与装甲机体，去掉人形头身、双足切换、帽子/背心；保留四种攻击、移动、稀疏弹幕、音效和680HP。
- 新增浅色装甲壳、炮台支架与双炮、前置双传感眼、关节青绿灯、侧边霓虹条、淡紫尾灯、通风口、天线和呼吸反应堆。炮管姿态从原武器轨迹压缩到机械机体高度，真实子弹从新炮口产生。网格GPU常驻，运行时仅更新姿态。
- 受击半径21→48（直径约2.3倍），模型尺寸不扩大。专项验证偏离中心40单位的擦边子弹由原来落空变为实际造成10伤害。
- npm run check、机械蜘蛛和原人形专项通过；检查完整四招/移动/IK、双炮/四足/霓虹显示、无人形牛仔模型、独立落弹、扩大伤害范围及重开。WebGL截图tests/neon-spider-boss-preview.jpg，无error；4173已刷新。未发布。


## 2026-10-13 本地 0.227.0：紧凑四足粗腿与直立跑步

- 蜘蛛底座六足→四足，两组对角脚交替落地；足点半径60→45，底盘59x51→46x42，腿长48/58→38/46，腿宽8/6→12/10，关节与脚掌增厚。短腿补步阈值14→10，摆腿90→70ms，保持高速移动触地IK可达。
- 披风默认关闭且停止模拟；跑步前倾40度→0，保持直立朝玩家。移动速度、四种攻击、弹速与稀疏弹量继续保留，仍可切换双足比较。
- npm run check及牛仔专项通过，覆盖完整战斗四足触点、四足/双足切换、无披风、直立跑步及攻击/伤害/音效。实际WebGL截图tests/cowboy-quadruped-preview.jpg，无error；4173已刷新。未发布。


## 2026-10-13 本地 0.226.0：可切换蜘蛛底座的牛仔

- 牛仔默认使用六足蜘蛛底座：复用advancePlantedGait世界落脚和solveSpiderLeg双节IK，两组三足交替抬脚；底盘保持支撑朝向，上身瞄准/旋转不拖转落地足点。原四种攻击、根节点移动、披风、枪口缩放、伤害和音效全部沿用。
- 蜘蛛底盘/髋连接/六腿替换原骨盆和双腿显示，均共享GPU常驻网格。保留双足虚拟状态供现有上身逻辑取高度，无需重写攻击。
- 实战新增「切换双足 / 切换蜘蛛底座」按钮，战斗和暂停中均可切换，位置/血量/攻击状态保持，重开记住当前选择。
- npm run check、牛仔及原人形基础专项通过；新增完整战斗六足IK触地、上身转向不移动足点、六足/双足显隐及现场切换保留状态检查。实际WebGL截图tests/cowboy-spider-preview.jpg，无error，按钮切换实测通过；4173已刷新默认蜘蛛版。未发布。


## 2026-10-13 本地 0.225.0：只跑步换位、减密弹幕与40度跑姿

- 牛仔自动循环取消滑移和闪现，攻击之间全部跑步换位。跑步前倾40度、重心高度54，身体/头部继续朝玩家，移动与持续射击速度175→230单位/秒。
- 牛仔横移连射间隔75→150ms，2.4秒32→16发；落地环24→12发。双枪/横移连射/旋转弹幕/天降环速度270/215/165/155→300/250/190/185。人形动作实验原连射节奏保留。
- npm run check、牛仔及人形连射/特殊动作专项通过；新增自动循环无滑移/冲刺/闪现、16发/12发实弹数量与速度、40度前倾/低重心验证。WebGL跑步和减密效果截图tests/cowboy-run-preview.jpg、tests/cowboy-sparse-preview.jpg，无error；4173刷新并暂停待测试。未发布。


## 2026-10-13 本地 0.224.0：牛仔放大与跑步面向玩家

- 模型缩放由.45调至.675，即上一版的1.5倍；帽子/披风/枪口一起放大，碰撞半径14→21。
- 跑步换位时身体/头部朝向玩家并实时追踪，moveYaw独立控制移动方向与脚步，保留175单位/秒及腿IK。
- npm run check与牛仔专项通过，新增跑步中玩家变位、上身朝向/足部方向解耦和IK可达验证。实际WebGL截图tests/cowboy-enlarged-preview.jpg，无error；4173已刷新并暂停待测试。未发布。


## 2026-10-13 本地 0.223.0：小型牛仔、柔软披风与移动射击

- 牛仔模型统一按脚底根节点缩放为.45（含帽约75高，主角约64），碰撞半径降至14，真实枪口同步缩放；独立缩放实例矩阵，场景/落弹/闪现光环保持世界大小。
- 新增35节点、6x4面片的动态柔软披风：肩部锚定，移动拖后、转身滞后、微风摆动，闪现平移重置速度；共享常驻三角网格，只更新面片变换。
- 取消牛仔原75度冲刺动画；招式间依次滑移、旋身闪现、跑步换位。滑移.18秒保持正常上身，跑步及两种持续射击速度统一175单位/秒；横移连射沿玩家视线横向移动，旋转弹幕旋身同时向目标点移动，2.4秒内移动约400单位。
- 闪现目标距玩家至少145，执行帧重新选安全位置，滑移/跑步优先避开玩家近身路径。朝天大子弹改为19半径球形，落地散射节奏保留。
- npm run check及完整npm test通过；最后横移路径调整后牛仔专项复测通过。新增缩放与作用域恢复、40共享布片、静止摆动/转身滞后、两种射击完整位移/腿IK、边界玩家及闪现执行安全距离、球形几何范围验证。实际WebGL截图tests/cowboy-cape-preview.jpg、tests/cowboy-sphere-preview.jpg。未发布。


## 2026-10-13 本地 0.222.0：牛仔BOSS实战与无收手枪械

- 新增cowboy.html/cowboy.js独立实战入口「荒原枪手」，680HP，宽檐帽/皮背心/红领巾共享GPU常驻模型。按左右双枪、朝天双枪、横移连射、旋转弹幕自动循环，攻击之间交替使用冲刺与旋身闪现，.32秒下一招提示，无普通巡逻；保留humanoid.html手动动作场及互链。
- 枪械recover统一为0，单枪.09秒、双枪.18秒、朝天双枪.24秒、持续连射2.44秒释放动作。朝天落弹迁移到独立skyEffects，换位/下一招期间继续下落并散射；死亡和重开清理。
- 牛仔枪击和落地24发环使用现有敌弹系统，真实伤害/护盾/无敌帧/躲避与胜负重开；实战关闭重复展示弹道，动作实验仍只显示效果。合成双层枪声、落地重击、换位及起招提示音，遵守声音开关和音频暂停，节点结束断开。
- npm run check、完整npm test及牛仔专项通过；牛仔新增完整循环、每招间换位、无巡逻、落弹独立、快速动作释放、真实伤害、音效/静音/暂停与重开检查。WebGL截图tests/cowboy-preview.jpg；实战失败/重开界面实测，控制台无error。未发布。


## 2026-10-13 本地 0.221.0：朝天双枪陨弹与芭蕾旋身闪现

- 新增「朝天双枪 · 陨弹」：双枪朝上，.12/.20秒各开一枪；随机选择两个分开的场内落点，圆圈提示后大子弹自高空加速落下，1.05/1.25秒落地，各自扩散24发圆形弹幕。弹丸/提示/冲击环均共享GPU常驻网格。
- 新增「旋身闪现」：.16秒单脚提膝，右手上举左手展开，.26秒开始转一整圈，.43秒瞬移约145单位，原地/落点星光与光环，.82秒完成收势。真实根节点瞬移，手足IK随身体换位，目标限制在场内，结束恢复原步态/站定。
- npm run check及全部人形专项通过，验证朝天枪线、两落点分离及边界、下落和24发环、无武器闪现、仅一次位移、360度旋身、提膝、IK及清理。实际WebGL截图tests/humanoid-sky-preview.jpg、tests/humanoid-blink-preview.jpg，无控制台error。延续动作视觉测试，未添加伤害，未发布。


## 2026-10-13 本地 0.220.0：横移连射与站姿旋转弹幕

- 新增「横移连射 · 卢锡安R」：40ms开火，持续2.4秒，以75ms间隔左右手交替32发，身体持续瞄准玩家并沿视线横向往返移动，双腿IK补步。
- 新增「旋转弹幕 · 萨米拉R」：保持站姿，双手侧向展开，2.4秒转三圈，以45ms间隔交替54发覆盖四周。每颗弹道保存发射点和方向，发出后不随身体旋转。共享GPU常驻弹丸模型、独立枪口闪光/后坐，结束恢复原步态/站定。延续动作实验语义，弹幕为视觉展示，未添加伤害。
- npm run check及全部人形专项通过，新增16组方向/步态的32/54发、交替顺序、玩家追踪、横移/旋转、八方向覆盖、IK、边界、互斥与收招验证。
- 实际WebGL检查两动作，无控制台error；tests/humanoid-barrage-preview.jpg和tests/humanoid-strafe-preview.jpg。4173已刷新，未发布。


## 2026-10-13 本地 0.219.0：快速开枪、顿帧突刺与左右双枪

- 单枪缩至.04秒开火；新增「左右双枪」，右手.04秒、左手.14秒依次开火，各自后坐/火光/曳光。开枪起手身体立即面向玩家，过程中快速追踪玩家朝向；动作结束清理收脚状态并恢复行走或站定。
- 突刺改为.14秒后抽、.12秒定势、.055秒前扑：根节点后退40再前冲140，保留下盘朝向与身体被带动的效果，短剑光补足极快出手，末端隐剑，.16秒恢复。
- npm run check通过；完整测试在人形运动旧「停止直立」预期处中断，其余此前均通过。已将该预期同步既有6度准备站姿，全部人形专项复测通过。新增单/双枪16组朝向步态、50ms出枪、100ms双发间隔、玩家追踪与突刺定势/55ms位移回归。
- 真实WebGL双枪与快速突刺截图tests/humanoid-dualshoot-preview.jpg、tests/humanoid-fast-thrust-preview.jpg；按钮分行，4173已刷新。仅动作及视觉测试，未增加伤害，未发布。


## 2026-10-13 本地 0.218.0：右手开枪动作

- 新增「右手开枪」按钮：.28秒抬枪瞄准、.18秒开火后坐、.28秒收枪。右手（本地-X）虚拟双节臂IK持枪，瞄向玩家并在开火时锁定射线，枪口闪光与短曳光表现单发，后坐使枪上扬/手回缩。下盘保持前后脚准备姿势，动作结束恢复来源步态或站定。
- 手枪、火光、曳光使用共享GPU常驻网格，按动作阶段显隐；目前为动作和射击视觉测试，未增加玩家伤害。开枪与剑连招互斥，枪动作期间不显示剑。
- npm run check及开枪/连招/蓄力专项通过，新增八组方向/来源步态的右手、恒定骨长/腿IK、固定下盘、单发/后坐/火光/显隐/恢复与按钮检查。真实WebGL截图tests/humanoid-shoot-preview.jpg，无error；4173已刷新，node tests/preview-humanoid-shoot.mjs可在4196复现。未发布。


## 2026-10-13 本地 0.217.0：前后脚准备站姿与轻微蓄力扭腰

- 蓄力胸腰扭转从.85rad降至.12rad（约7度）。停止和蓄力共用角色自身右脚后16/左脚前20、横向±18的准备站姿；停止高度由68降至60，前倾6度；蓄力高度56，保留低位竖剑和1秒星光节奏。
- npm run check、停止/蓄力/连招专项通过，新增按角色朝向验证右脚后、左脚前及蓄力扭腰<.15rad。真实WebGL站姿截图tests/humanoid-ready-stance-preview.jpg。未发布。


## 2026-10-13 本地 0.216.0：原地蓄力与停止收脚站定

- 取消蓄力漂移，根节点位置/朝向固定，双脚平滑落到宽站姿后保持，低位竖剑、1秒星光和双向横斩/连招保留。
- 「停止行走」新增独立收脚状态：保留当前足点，.24秒落脚并错开地面双足.12秒，约.4秒站稳直立；走路、跑步、冲刺途中均可停止。站定后不再原地追踪玩家旋转；再次行走或中途切步态会安全退出收脚状态。
- npm run check通过；完整测试先遇旧“停止仍朝向玩家”预期，按新站定语义更新后所有人形专项复测通过，其余此前已通过。新增12组步态/停止时刻的无瞬移、腿IK可达、双足中立站姿、静止及中途恢复；蓄力测试改验固定位置和双足落地。WebGL站定和蓄力截图tests/humanoid-stop-preview.jpg、tests/humanoid-planted-charge-preview.jpg；4173已刷新。未发布。


## 2026-10-13 本地 0.215.0：纠正角色自身左右坐标

- 模型+Z朝前、+Y朝上，角色自身右侧是本地-X；之前将+X误认为右侧。持剑IK绑定统一为handSide=-1，横斩使用swingSide=-direction将语义上的右→左/左→右映射到正确坐标，蓄力持剑、辅助手、胸腰扭转和侧倾同步校正。
- npm run check及蓄力/横斩/刀光/连招专项通过；连招新增四朝向下右肩世界坐标校验，避免只验证错误的侧别标记。实际WebGL截图tests/humanoid-anatomical-right-preview.jpg；4173已刷新。未发布。


## 2026-10-13 本地 0.214.0：双向右手横斩与连续衔接

- 新增「右→左横斩」「左→右横斩」「双向连斩」。持剑手固定右手，方向参数独立；握柄轨迹对称±1.55rad，剑身±2.6rad。起刀胸腰向起刀侧明显预转，随斩向另一侧转动，侧倾随方向变化，最后收势回正；下盘yaw仍固定。
- 动作斩出结束前点击反向横斩可缓存下一刀，也可一键双向连斩。第一刀到末端直接继承握柄/剑角/胸口角度与速度/高度/足点，.06秒反向准备后出下一刀，中间剑不消失、不先回正；新刀尾迹清空，最后一刀末端隐剑。蓄力漂移横斩也可接反向刀，过渡让悬空脚落地。
- npm run check与完整npm test通过，落脚修正后连招专项复测通过。新增双方向/四朝向起止胸腰旋转、同右手、手剑上身根节点连续、连招显隐/刀光清理、按钮与蓄力接反向回归。实际WebGL连招过渡截图tests/humanoid-combo-preview.jpg，无error，4173已刷新；node tests/preview-humanoid-combo.mjs可在4194复现。未发布。


## 2026-10-13 本地 0.213.0：持续幽魂漂移与右手起刀

- 蓄力漂移改为90单位/秒目标速度，.08秒起速后沿缓慢变化的随机初始方向持续行进；星光期间也保持运动，直到1.16秒出刀。根节点实际移动，足点约束与边界可限制速度；补步改.16秒、24单位触发距离，避免根节点频繁被落脚拖停。
- 用户澄清右手向左横斩：普通/蓄力横斩统一右手，握柄/辅助手/胸口偏转镜像，蓄力和起刀上身向角色自身右侧偏移侧倾。突刺保留原持剑手。
- npm run check及蓄力/横斩/刀光/突刺专项通过。中场八个相位验证近1秒路径长度>65单位、闪光末段仍移动>10单位、腿可达、右侧牵拉和出刀位置锁定；无控制台error。截图tests/humanoid-ghost-right-charge-preview.jpg，4173已刷新。未发布。


## 2026-10-13 本地 0.212.0：一秒蓄力与缓慢小幅漂移

- 蓄力至1秒开始星光，闪.1秒、再.06秒出刀。漂移双轴振幅降至10/7，频率降至.55π/.7π，单次蓄力只缓慢弯曲，不要求反复变向；每次仍使用不同相位。蓄力补步时长.24秒、抬脚6，突刺维持原补步参数。
- npm run check、蓄力和突刺专项通过；八组固定相位验证漂移速度<45单位/秒、各轴最多一次反向、腿IK可达和1秒闪光时机。预览定格时间更新为1.05秒，真实WebGL截图tests/humanoid-slow-charge-preview.jpg，4173已刷新。未发布。


## 2026-10-13 本地 0.211.0：醉酒式蓄力游移与左侧牵拉

- 蓄力移动改为双轴不同频率的摇晃轨迹，每次随机相位，前后左右反复变向；起停平滑，.68秒星光时锁定当前位置。以落脚的48单位水平可达范围约束根节点快速折返，双足独立补步。
- 蓄力和普通横斩新增角色自身左侧的上身偏移4单位、侧倾约12.6度；横斩中段略增强，收势平滑回正。变换围绕腰部、沿角色前向轴侧倾，不额外旋转下盘朝向；头/肩/手IK使用相同上身变换。
- npm run check及蓄力/横斩/刀光专项通过。新增八组确定相位的双轴反向、腿部可达、左偏方向和收势衰减检查，原竖剑、支撑脚固定及出刀位置锁定保持。真实WebGL检查无error，截图tests/humanoid-drunk-charge-preview.jpg；4173已刷新。未发布。


## 2026-10-13 本地 0.210.0：蓄力期间弧线漂移

- 蓄力根节点沿侧向48单位、前向弧高12单位的短弧平移，smoothstep起停，在.68秒星光开始时停住；受场地边界约束。上身保持腰腹前竖剑姿势及朝向，双足独立补步，落地脚固定。出刀以移动后的坐标为基准，结束从新位置继续巡游。
- 复用突刺补步逻辑，蓄力不再覆盖足点为固定站姿；收势期间允许未完成补步落地。普通横斩仍固定下盘。
- npm run check和蓄力/横斩专项通过，验证八组来源步态/方向的局部持剑稳定、真实位移及补步，并验证落地脚不滑移、腿IK精确可达、下盘不转、出刀位置固定。真实WebGL星光定格确认、无控制台error，截图tests/humanoid-charge-drift-preview.jpg；4173已刷新。未发布。


## 2026-10-13 本地 0.209.0：腰腹前低持剑蓄力

- 按用户示意图，握柄从110高度降到70，局部位置改为左24/前30，收近腰腹；另一手收至握柄下侧，出刀后.1秒松开回位。剑仍竖直指天。蓄力骨盆高度50、上身前倾10度、双足横向间距52，形成低重心宽站姿。
- npm run check及蓄力/横斩专项通过，补充握柄低位近身、辅助手靠近断言。真实WebGL确认，截图tests/humanoid-charge-low-guard-preview.jpg，无控制台error；4173已刷新。未发布。


## 2026-10-13 本地 0.208.0：蓄力竖剑指天

- 蓄力剑身固定沿世界Y轴向上（pitch=90度），手抬起后定住，星光闪过也保持竖剑直到出刀；删除原末段压刀过渡，出刀直接切到横斩。
- npm run check及蓄力/横斩/剑光专项回归通过，验证竖直角度、闪光后仍保持手位置和竖剑姿态。真实WebGL画面确认，截图tests/humanoid-charge-vertical-preview.jpg。未发布。


## 2026-10-13 本地 0.207.0：举剑蓄力与星光横斩

- 新增独立「蓄力横斩」按钮：.18秒举剑，保持到.68秒，剑身前端闪.1秒四角星光，随后.08秒压刀进入既有.24秒先快后慢横斩，.4秒身体收势。举剑握柄升到110高度、剑仰起约37度；定势手/剑/胸口保持静止，下盘位置朝向固定。
- 星光为共享常驻发光网格，仅在提示窗口显示；压刀阶段不生成刀光，横斩末端立即隐剑。普通横斩和醉剑突刺保留。
- npm run check、完整npm test通过，新增八组步态/方向的定势静止、星光时机、斩出衔接、下盘固定、隐剑恢复、按钮和重开回归。真实WebGL确认举剑与星光，截图tests/humanoid-charge-preview.jpg；node tests/preview-humanoid-charge.mjs可在4193复现定格，4173正常页面已刷新。未发布。


## 2026-10-13 本地 0.206.0：横斩先快后慢

- 横斩握柄与剑身共用三次ease-out进度，斩出立即高速挥动并持续减速；前半段完成87.5%的扫幅，末端速度归零。总时长、起止角度及末端隐剑保持，继续同步起动与自适应刀光细分。
- npm run check和完整npm test通过。更新轨迹回归验证四个等时段的转角依次减少及前半段完成大部分扫幅，原有起手同步、无折段和动作恢复回归保持。4173浏览器刷新并触发横斩，无控制台error。未发布。


## 2026-10-13 本地 0.205.0：修复横斩起手剑光折段

- 原剑身转角在斩出前8%（约19毫秒）保持不动，但握柄已开始移动，尾迹先生成平移直段再接旋转弧。握柄与剑身改用同步smoothstep进度，去除转角延迟，起止速度平滑。
- 尾迹按转角最多.055rad、握柄位移最多3单位细分；无转角的平移只更新起点，不生成直段。发光带取剑身45～98段，保留最近.09秒，继续使用常驻GPU网格。
- npm run check及完整npm test通过。新增八组步态/方向的起手同步、采样间距、三角形绕序回归，以及静止剑转角/大角度帧细分验证。真实WebGL起手画面弧线连续，无控制台error，截图tests/humanoid-trail-fixed-preview.jpg。可运行node tests/preview-humanoid-trail.mjs在4192复现定格；正常4173预览已恢复。未发布。


## 2026-10-13 本地 0.204.0：扩大横斩、末端立即隐剑

- 横斩握柄轨迹起止角由-1.2/+0.8改-1.55/+1.35rad（左手），剑身起止角由-2/+2改-2.6/+2.6rad，约-149/+149度，总扫幅约298度。保留独立握柄/甩腕、真实剑身尾迹、上半身/双节手臂求解及下盘支撑。
- 剑和刀光在引刀+斩出段结束（.14+.24=.38秒）即隐藏；后续.4秒只收手、身体回正。隐藏期间保留剑末端转角，不再执行剑的回正转动。
- npm run check和完整npm test通过。横斩回归新增两端绝对角>2.5rad/总扫幅>5rad、收势第一帧无剑/无刀光、隐藏剑角度保持终点；其余回正/IK/共享GPU及醉剑突刺回归保持。浏览器刷新检查起手与恢复，无error/warn；截图tests/humanoid-wide-slash-preview.jpg。未发布。


## 2026-10-13 本地 0.203.0：醉剑式后抽再前扑

- 突刺改为.55秒大幅后抽、.65秒反向前扑、.4秒收势；世界握柄目标先后拉到起手位置后方220/前方260，武器牵引身体平移。上身先后仰25度，再前倾65度；牵引速度上限440。下盘和脚yaw锁定、真实支撑/补步/恒定骨长保持。
- 中场实测后退约100，再从后撤点前移约188单位；场地边界限制实际位移。结束仍从新位置继续巡游。用户已在浏览器观察效果。
- npm run check和完整npm test通过，新增后退/反向前移及中场大位移边界回归；截图tests/humanoid-drunken-thrust-preview.jpg。未发布。


## 2026-10-13 本地 0.202.0：突刺牵引位置、锁定下盘朝向

- 用户澄清要身体被武器拽动位置，只是不让下盘跟随旋转。突刺改为世界手目标超出虚拟手臂61舒适距离时产生根节点弹簧/阻尼平移；速度上限320，场地和真实足点55水平可达距离约束保持。身体朝向e.angle始终起手角，骨盆不被牵引旋转。
- 双足独立补步（.12秒、抬12），落地脚点在世界空间固定；补步/落地保持各脚起手时的yaw。上身保持65度前探及少量独立转动，头部朝前。真实肩位置在骨盆可达高度修正后再次求臂IK，手臂30/36骨长不变。
- 请求握柄前伸从104提升到160，恢复普通剑长，远距来自身体被拉出而非加长武器。结束保留新位置，以平滑巡游偏移衔接，不瞬移回起手站位。横斩保留上半身版本。
- npm run check与完整npm test通过。突刺专项更新八组起手的根节点位移>20/实际补步、下盘及脚yaw恒定、落地脚无滑移、肩臂连接/恒定骨长、剑尖从原站位探出>210、收势后巡游不跳位；现有横斩/跑步/即时冲刺回归保持。浏览器刷新检查，无error/warn；截图tests/humanoid-thrust-pull-preview.jpg。未发布。


## 2026-10-13 本地 0.201.0：远距突刺动作测试

- 新增「远距突刺」按钮，沿起手朝向直刺：.16秒准备、.14秒迅速前探、.16秒最远处停留、.4秒收势。与横斩共用动作互斥/显隐生命周期，但有独立突刺姿态，剑方向固定，不做横扫甩腕。
- 腰部位置/朝向与下半身支撑点固定。上身前倾18→65度，虚拟双节手臂30/36求解真实可达握柄；请求握柄前伸104，超出手臂长度时限制端点，不拉动腰或拉长骨骼。突刺剑沿长度轴放大1.4倍（横斩保持原长），剑尖可探到站立中心前方210单位以上，约4格以上。
- 暂为动作测试，无额外玩家伤害。前探阶段显示短直线剑光，不生成退化的共线横斩三角尾迹；头部仍抬起朝前，收势回正后隐藏剑与剑光并恢复原走路/跑步。共享GPU网格保持。
- npm run check和完整npm test通过，新增test-humanoid-thrust覆盖两种来源步态/四方向：远端>210、直线剑朝向、65度前倾停留、腰/足固定、双节臂骨长/腿IK、动作互斥、有限GPU几何、结束模型清理及原步态恢复。浏览器刷新按钮/姿态检查，无error/warn；截图tests/humanoid-thrust-preview.jpg。未发布。


## 2026-10-13 本地 0.200.0：剑身转角与握柄轨迹分离

- 根据用户扇扫示意图，握柄位置与剑身朝向不再共用同一角度：手沿较短约2rad弧线、55～63半径运动，剑身另有约4rad的延迟甩腕转角，绕握柄在水平斩击平面中独立旋转。引刀、横扫、收势的武器角度连续衔接。
- 虚拟肩约束采用hand.pathAngle作为连续方向参考，避免剑身甩腕误影响胸口求解；双节手臂端点、固定腰部、上半身限幅/回正与武器仅动作可见保持。
- 刀光不再用角色中心固定扇形：记录最近.09秒实际IK握柄位置与剑身角度，连接前后帧剑身内缘/剑尖的两片三角形，共享静态GPU网格，仅更新每片的变换，跟随实际扫过区域。
- npm run check与完整npm test通过，新增八组起手下剑身相对握柄轨迹角度变化>1.5rad、拖后/甩出两端差异和尾迹采样上限；其余腰部/腿/双节手臂/回正/GPU资源回归保持。浏览器刷新检查横斩，控制台无error/warn；截图tests/humanoid-wrist-sweep-preview.jpg。未发布。


## 2026-10-13 本地 0.199.0：上下半身分工、腰部固定横斩

- 用户在实施前将方案简化为上半身打击，下半身不参与全身级牵引。首先Git初始快照f317e62保存0.198当前源码/资源/测试（此前仓库无提交），未纳入部署身份、发布归档或本地日志。
- 横斩移除根节点位移/骨盆追手/踉跄补步。固定起手位置和腰部朝向；引刀时落好支撑脚、轻微下蹲，斩出和收势期间脚点固定。胸口围绕腰部局部枢轴旋转，骨盆保持独立姿态；头部跟胸口并抬起。
- 隐藏的肩—肘—手双节IK（30/36）吸收伸展余量，超出可达范围只限制手的端点，不拉动腰。左手横扫驱动胸口，转幅限1.2rad。收势明确以起手方向为胸口目标，渐退扭转至0后隐藏刀剑和刀光，恢复原走路/跑步。普通步态和即时位移冲刺保持。
- npm run check、完整npm test通过；横斩专项改验八种起手/朝向的腰部位置/朝向恒定、固定支撑、双节手臂骨长/肘部余量、局部胸口限幅和回正、结束无朝向跳变、武器显隐/共享网格、手目标只改变胸口不改变根。浏览器刷新检查上半身横斩，控制台无error/warn；截图tests/humanoid-upper-only-preview.jpg。未发布。


## 2026-10-13 本地 0.198.0：牵引横斩朝向修复

- 持刀手统一为左手（handSide=-1），从左扫向右；手模型、预备/收势位置、世界横扫轨迹和虚拟肩部偏移使用同一手侧，消除右肩假设与动作预期不符。
- 关键修复：肩部角偏移相减后再wrap到±PI会把远侧持续右转错误变为左转。先围绕武器扫向连续展开真实手方向，再扣肩偏移、做扭腰限幅，避免跨PI反向。
- 胸口阻尼响应加快（625/50），骨盆响应225/30保留滞后；相对胸腰扭转限幅.55→.95弧度。头部朝向跟随胸口实际渲染方向，而非仅跟较慢的骨盆，保持水平抬头。
- npm run check与完整npm test通过。横斩回归新增四个基础朝向在右侧终段胸口右转>0.5rad、左手/肩约束一致、头部与胸口实际矩阵一致；原位移/IK/足支撑/武器显隐/手目标驱动回归保持。浏览器刷新核对横斩，无error/warn；截图tests/humanoid-pull-turn-preview.jpg。未发布。


## 2026-10-13 本地 0.197.0：武器牵引全身的横斩

- 0.196首次横斩：新增手动横斩按钮、低身位引刀/横扫/收势，刀剑仅动作期间出现，使用共享GPU网格，测试场仅验证动作，未加玩家伤害。
- 当前改为手的世界轨迹驱动虚拟肩部约束：手按世界空间70～90半径横扫，胸口阻尼跟随目标方向，骨盆以较慢阻尼追胸口，根节点按手位置减去虚拟握持偏移求追随目标，再用弹簧/阻尼推进。根节点不再按时间曲线给定平移；可出现约一格以上的甩身偏移。
- 牵引根速度上限360，扭腰限幅，根位移受场地和实际脚点55水平距离约束；脚点超出支撑阈值独立补步（.12秒），落地脚不拖动。骨盆与上身拆成独立共享网格，胸口可领先骨盆。保持两段34/36精确IK、独立抬头、结束隐藏武器/刀光并恢复原步态。
- 引刀.14秒、横扫.24秒、收势.4秒；世界手轨迹仍预设，身体跟随由约束/阻尼求解，是虚拟牵引+腿IK原型，不是完整Maya全身求解器或刀具刚体物理。
- npm run check与完整npm test通过；test-humanoid-slash覆盖八组来源/方向、低姿态/全身牵引/补步支撑、精确IK、共享网格、武器仅动作显示、并发动作保护/重开，并验证同一时间人为改变手目标会改变根节点结果。浏览器核对横斩及正常恢复，控制台无error/warn；截图tests/humanoid-hand-pull-preview.jpg。未发布。


## 2026-10-13 本地 0.195.0：冲刺无蓄势、直接硬切

- 删除冲刺.12秒蓄势等待（prep=0）。点击事件立即硬切75度前倾/44髋高并设置滑冲足姿，不等待0.1秒前倾；跑步和收势仍保留0.1秒过渡。
- 位移插值改为ease-out quadratic，起步直接有高速而非零速度smoothstep启动，第一帧即快速移动；.23秒最多160单位、.2秒收势、边界截短/锁方向/结束恢复保持。后脚固定蹬地缩到前8%移动时间，随后快速收腿，保证更快起步仍精确IK触地。
- npm run check和完整npm test通过。回归更新为零蓄势、跑步切冲刺立即硬切、首帧位移超过总距离4%、四向终点/边界、后足蹬地、30次连续冲刺与后续巡游不跳位。浏览器刷新并检查即冲及收势，无error/warn；截图tests/humanoid-instant-dash-preview.jpg。未发布。


## 2026-10-13 本地 0.194.0：上身姿态0.1秒到位

- 上身前倾统一使用固定0.1秒smoothstep插值，精确抵达目标，不再使用渐近指数缓动。跑步50度、位移75度及收势回到原姿态均用同一过渡；中途切换从当前实际倾角开始，不跳变。
- 位移保留.12秒蓄势，身体在.1秒时已达75度；腿部重心/步态和.23秒位移/.2秒收势时序不变。头部抬起朝前、颈部连接与共享GPU姿态保持。
- npm run check和完整npm test通过，新增30/60/120Hz下0.1秒精确角度、冲刺前倾先于位移、半途跑步切位移连续过渡测试。浏览器刷新并核对跑步50度/位移75度，无error/warn；截图tests/humanoid-fast-lean-preview.jpg。未发布。


## 2026-10-13 本地 0.193.0：冲刺改为短促位移

- 用户澄清冲刺是卢锡安/八神式位移，移除持续4倍速循环跑步。按钮改「位移冲刺 · 75°」：单击触发一次，当前面朝方向锁定；.12秒蓄势、.23秒直线滑冲最多160世界单位、.2秒落地收势。场地提前截短位移，已有冲刺不被重复按键重启。
- 蓄势压低重心，移动段75度前倾；后脚短暂世界固定蹬地，随后前后腿收拢成滑冲姿态，不更新跑步周期。保持解析IK骨长/真实足点及头部抬起面罩朝前。收势恢复此前走路/跑步模式；冲刺中选走路/跑步只更改结束后的模式。
- 位移后从终点继续，巡游偏移缓慢衰减回原路线，落脚前瞻同步考虑偏移衰减，避免身体瞬移回巡游位置/后续高速拉断脚点。停止行走会冻结正在进行的位移动作。
- npm run check和完整npm test通过；test-humanoid-motion保留跑步回归，新增两种来源步态/四向位移的蓄势不移动、75度前倾、后足固定蹬地、双腿无循环跑步、精确端点、边界截短、重复按键、结束恢复/后续巡游无瞬移、30次连续位移触地点验证。浏览器核对滑冲及自动恢复，控制台无error/warn；截图tests/humanoid-displacement-preview.jpg。未发布。


## 2026-10-13 本地 0.192.0：前倾时抬头看向前方

- 原头部与躯干共用前倾矩阵，跑步/冲刺时面罩朝地。将头部拆成独立共享常驻网格，颈部抵消躯干俯仰，头部保持世界竖直、面罩水平朝向当前行进方向。躯干50/75度前倾与双腿步态保持。
- 头部位置跟随躯干颈端，并随前倾轻微向前上方伸颈，短颈杆/球形关节连接，避免抬头后头壳压进胸甲。头顶血条跟随独立头部。直立颈杆长度为零时不绘制，避免通用杆件零方向造成NaN。
- 人形专项回归增加跑步/冲刺头部竖直、面罩水平、朝向一致、短颈连接范围与有限模型检查。浏览器已刷新检查冲刺抬头。npm run check和完整npm test通过；未发布。


## 2026-10-13 本地 0.191.0：人形跑步/冲刺姿态测试

- 测试场新增走路、跑步50°、冲刺75°三按钮。机器人跑速2.2倍、冲刺4倍（巡游实测峰值约138/251单位每秒），加速和前倾平滑过渡；停止平移后恢复直立。新增行为仅限人形测试BOSS，不改变玩家普通行走规则。
- 上身在腰部/髋部高度绕横轴向前旋转，角度相对世界竖直+Y轴；跑步/冲刺沿真实运动方向转身。骨盆基础高度68→54/44，倾斜身体、悬浮双手和头顶血条同步变换；腰部两侧锚点与双腿IK髋部严格重合。
- 跑步采用.58秒完整左右周期/.42接地占比，冲刺.42秒/.34接地占比，左右相差半周期，有短暂双脚腾空。固定支撑足、曲线路径预判落脚、高抬膝25/30与后足蹬伸；骨长34/36和共享GPU几何保持。两种动作膝内角约42～149°/17～163°。高速转回走路按足点可达范围限制平移/转身，待后脚恢复，避免端点滑动及骨盆塌到地面。
- npm run check与完整npm test通过；新增test-humanoid-motion，覆盖每模式60秒真实速度/边界、50/75度矩阵、腰髋连接、精确IK触地点、接地固定、双足腾空、蹬伸/收膝、缓存复用、停止恢复直立及60秒频繁切换无身体瞬移/脚点越界。浏览器检查两个模式和按钮，控制台无error/warn；截图tests/humanoid-run-preview.jpg、tests/humanoid-dash-preview.jpg。未发布。


## 2026-10-13 本地 0.190.0：人形长步幅与交替朝向

- 修复初版小碎步/持续半蹲：落点预判.22→.44秒，步距门槛17→38，单步.24→.4秒，抬脚10→23。髋部默认高度58→68，并根据实际足点可达距离调整骨盆高度，支撑腿伸展、摆动腿收膝；固定世界脚点和34/36骨长保持，无IK端点夹位滑动。
- 朝向循环：6秒面向玩家巡游、4秒面向实际行进方向；转速上限2.4rad/s平滑切换。停止行走始终面向玩家。HUD显示当前朝向与切换倒计时。
- 两分钟巡游/转向回归平均步幅约39（旧22），膝盖内角约70～163度（旧81～119）；至少一足支撑、精确触地点、场地边界和共享网格/恢复保持。test-humanoid新增步幅/膝盖变化、朝向循环、沿速度方向和转速约束检查。语法、完整回归及最新人形专项通过，浏览器预览已刷新；未发布。


## 2026-10-13 本地 0.189.0：人形机器人 IK 测试场

- 新增 dist/humanoid.html / humanoid.js，首页「人形 BOSS 测试」入口；本地 http://127.0.0.1:4173/humanoid.html。固定13×11测试场，420血、默认步枪、F2装备测试、重开及停止/继续行走。机器人暂不发弹幕和接触伤害，供观察造型与运动；可被现有武器攻击，胜败停留测试场。
- 双节机械腿复用解析IK（34/36长度），固定世界落脚点，左右交替抬脚、预判落点、至少一脚支撑。身体场内平滑巡游，向玩家方向限速转身；停止平移仍会转身并重排足点。胸口和面罩明确标识正面，两侧悬浮拳头，不建胳膊。
- 身体、脚、手、关节及腿杆使用共享GPU常驻网格，每帧仅更新姿态；显卡上下文恢复复用资源。game.js加入独立场景的更新/渲染/胜败/装备重开与清理钩子。
- npm run check与完整npm test通过。test-humanoid覆盖两分钟巡游/边界、固定落脚无滑动、精确骨长和触地端点、交替支撑、面向玩家、停止行走、缓存复用/恢复、实际伤害与胜败重开。真实WebGL浏览器检查造型及停止/重开，控制台无error/warn；截图tests/humanoid-preview.jpg。本地开发，未发布。


## 2026-10-13 本地 0.188.0：分裂停顿、渐白与更大的终代

- 四代模型/碰撞尺寸调整为100/85/75/70%。共享GPU几何保持，只更新实例缩放；腿与足点按实际相邻代比例缩放。
- 半血先进入准备态：身体、腿、巡游和攻击计时冻结，0.75秒渐白，纯白保持0.12秒后分裂。新个体在来源旁边出现，两只恢复移动并在0.9秒内褪回原材质；新个体位置偏移平滑衰减到独立巡游相位。
- 准备期间仍可受伤，实际分裂均分当时剩余血量，致死则不生成后代。白色使用现有实例flash槽的负值编码，shader在照明后混合纯白，模型不重新构建/上传。
- npm run check与完整npm test通过；test-188覆盖冻结、渐白/白色保持、同场生成、移动褪白、血量守恒、准备期间死亡取消、GPU缓存复用与终代70%。旧血量/尺寸回归同步。真实WebGL预览核对全白与褪白，正式4173页面已刷新；未发布。


## 2026-10-13 本地 0.187.0：反弹子弹按次数退场

- 病毒弹取消9秒TTL，发射时life=Infinity、maxBounces=3、bounces=0。前三次墙壁碰撞正常镜面反射，第四次碰墙时停在碰撞位置并退场，产生3粒短火花。墙角同时反射两轴但按一次反弹事件计数。击中玩家/场景结束仍按原规则清除。普通非反弹子弹保留计时寿命。
- 反弹积分按完整dt推进，不再被旧life值截断；飞碟减速/长帧多段反射保持。测试fixture手造有限life的反弹弹也不随计时消失。
- npm run check与完整npm test通过；test-181更新次数预算；新增test-187覆盖20秒慢速飞行不消失且位移完整、前三次反射存活/第四次贴墙退场及火花、墙角计数、普通TTL与实际玩家受伤消弹。本地已刷新，未发布。


## 2026-10-13 本地 0.186.0：分裂缩小体型与血条容量

- 各代尺寸为.8^generation（100/80/64/51.2%），模型由同一常驻GPU网格变换缩放；碰撞半径同步36×scale。头壳/尾管/腿杆/关节/阴影/光环整体缩小。原个体分裂时以自身位置为中心缩放已落地脚点和摆动端点，不重置步态或移动到另一处。
- 足点半径、IK两段长度、抬脚高度/时长/前瞻安全范围随尺寸缩放；120Hz子步维持小体型快速巡游时的脚部稳定。
- 个体血条长80×sqrt(max/420)，格数ceil(max/52.5)、最少1格。正常分裂各代max420/105/26.25/6.5625，对应长80/40/20/10、8/2/1/1格；跨阈值的额外伤害会让新max和血条进一步减少。血条高度跟随新头顶。全场总血条继续固定420，不因分裂恢复。
- npm run check及完整npm test通过；新增test-186覆盖四代模型/碰撞缩放、血条长度/格数、共享GPU资源不增殖、缩放IK长度、分裂脚点原位缩放。浏览器已刷新检查，未发布。


## 2026-10-13 本地 0.185.0：半血分裂替代定时复制

- 移除12秒周期复制。每只噬菌体hp>0且降到自身max的50%或以下时分裂为两只，双方均分当时剩余hp并以该份hp设定自己的新max；继承下一代generation，子代再次受到半血伤害可继续分裂。大伤害跨过门槛保留超额伤害，致死命中直接击杀，不分裂。
- 初始420血打到210→两只各105；各自105打到52.5→分成两只各26.25。总血量不因分裂增加，主HUD固定初始420基准，不重置进度。最多三轮（generation 0～3），最多8只终代。
- 在更新前与本帧友军伤害完成后统一检查分裂，保留原反弹弹幕、GPU常驻模型、步态、复制体独立对象/装备伤害。原始个体死亡时剩余子代可继续分裂，全部清除后胜利；重开恢复一只初代。
- npm run check与完整npm test通过。test-181改验半血门槛与独立子代；新增test-185覆盖三轮倍增/总HP守恒、固定总血条、超额伤害不恢复、实际子弹触发分裂、时间不复制、致死跳过分裂与重开。压力测试fixture移除旧周期计时字段。浏览器试玩检查分裂与总血量下降，未发布。


## 2026-10-13 本地 0.184.0：全部怪物改为显存常驻网格

- Elevator3D新增residentMesh共享资源：几何首次构建，STATIC_DRAW上传一次；同网格按ANGLE_instanced_arrays批量绘制，每实例仅上传3×4变换矩阵和受击flash（13 floats）。不支持扩展时用常量属性逐实例绘制，仍复用静态VBO。法线在GPU按非等比缩放正确变换，灯光/弱自发光/发光标记保留。每帧清空实例数量，WebGL恢复时只重建缓冲、按需各重传一次，保留CPU资源。
- 眼球/骷髅/飞蛾/自爆怪/导弹发射怪/激光怪/普通BOSS、敌方可攻击导弹、蛇形头身尾/连接/炮座/旋转炮口、病毒身体/关节点/活动腿杆均接入。飞蛾翅膀、蛇炮口和病毒双段IK只更新部件变换。怪物阴影和血条也共享常驻网格。碰撞、血量、复制、攻击规则不变。
- 受击抖动/闪光改走实例变换与shader属性；独立光点仍由原点精灵批次绘制。背景/玩家/装备保持原管线。residentSnapshot仅用于回归诊断，不用于正常渲染。
- 同浏览器基准1/8/16只病毒：模型CPU提交.1/.3/.5ms、整次draw调用7.9/7.7/8.1ms（GPU完成时间未计）。16只共享9种网格和9个实例化批次（含血条、阴影）；连续动画与受击不再上传模型几何。结果更新tests/virus-perf-results.json。
- npm run check和完整npm test通过。test-184新增静态上传次数/缓存身份/实例批次与divisor归零、受击属性、GPU恢复、无扩展回退、普通怪物和蛇共享模型检查；test-92/171/183改验常驻资源与shader状态；test-90屏蔽随机暴击以稳定原单次伤害断言。
- 浏览器核对全部普通怪物、正式snake.html游走与粉红尖刺追击、病毒压力场景，正式页面无error/warn；截图tests/monster-resident-preview.png、tests/snake-resident-preview.png、tests/virus-gpu-resident-preview.png。未发布。


## 2026-10-13 本地 0.183.0：多噬菌体渲染性能修复

- 定位每帧重建固定头壳/尾管/关节球引发三角函数与临时数组开销。同一浏览器CPU基准16只：模型23.3ms→3.4ms，整次draw调用34.2ms→11.8ms，移动约.1ms；没有测GPU完成时间，不等同实际FPS承诺。
- 固定头壳/尾管和两种关节网格构建一次、按CPU Float32Array共享缓存，每帧平移复制；活动腿杆与IK仍实时更新。静态材质法线预处理一次，受击效果仅改当前帧拷贝，不污染共享网格。小关节/头壳接点球采用3×6细分，其他sphere默认5×10保持。每只顶点12288→7296（约减少41%）。复制/血量/弹幕规则不变。
- 新增test-183覆盖16只顶点预算、共享缓存固定3项、连续动画有限网格、受击不污染缓存、显卡上下文恢复复用CPU缓存。语法/完整npm test通过，浏览器16只活动压力场景检查，无error/warn。
- 可复测：node tools/bench-virus.cjs（mock CPU）；node tests/perf-virus.mjs后访问4186/virus.html（真实浏览器CPU基准），?stress为16只活动压力场景。结果tests/virus-perf-results.json。未发布。


## 2026-10-13 本地 0.182.0：复制继承当前血量、大幅减少弹幕

- 新复制体hp读取来源当时的hp，而非max；max仍保持来源最大血量供血条显示。受伤复制体继续复制同样继承当前剩余血量，不恢复来源生命。复制间隔仍为全场12秒新增一只。
- 环形散射18→6发、间隔1.7→3.2秒；旋转弹流4→2发、间隔.24→1.1秒；瞄准扇形7→3发、间隔1.05→2.8秒（扇形角距.24）。单只完整24秒攻击轮换发弹不超过50发，较此前约减少八成；弹速、墙壁反弹与9秒寿命保持。
- npm run check、test-177、test-181通过。新增受伤来源17血→复制17血、受伤复制体5血→子代5血及24秒整轮弹量上限验证，保留反弹、伤害、复制后胜利与清理检查。浏览器已刷新检查稀疏弹幕，未发布。


## 2026-10-13 本地 0.181.0：病毒反弹弹幕与周期复制

- 病毒三种弹幕全部标记wallBounce，按固定场地A边界减弹丸半径进行镜面反射；角点同时反射两轴，保留帧内剩余位移与速度，原9秒寿命不重置。按每段真实时间处理飞碟减速，并对反射分段检查玩家移动轨迹命中。普通敌弹原行为保持。
- 全场每12秒从存活噬菌体轮流选择一只生成一个满血复制体（源最大血量，默认420）；全场一次只新增一只，不按存活数指数增殖。复制体拥有独立血量、步态、移动路径相位、攻击计时与受击效果。新生位置优先选择与玩家/存活BOSS有距离的巡游点，并加绿色生成闪光。
- 原始本体死亡后复制体仍可继续战斗和复制；全部存活噬菌体被击败才结束测试场。HUD增加存活数量、复制倒计时和群体总血量，重开恢复一只/12秒。
- 新增test-181：所有弹幕反弹、墙角双轴、长帧多次反弹一致性、寿命、普通弹退出、飞碟减速、复制体满血不恢复母体、对象/索敌独立、移动/攻击、本体死亡后继续复制、实际击杀与胜利/重开清理。语法、完整npm test通过。旧test-63修正飞剑坐骑blades运行状态重置造成的随机属性快照断言失败，装备逻辑未改。
- 本地浏览器检查已生成多个复制体与弹幕，控制台无error/warn，截图tests/virus-copy-preview.png。未发布。


## 2026-10-13 本地 0.180.0：病毒提前迈步、固定膝盖弯曲方向

- 原因：旧步态必须等整个三足组落地，前向腿容易被身体追过；所有脚点统一前推并按当前中心夹半径，会把后足折进身体；向上IK极向量缺少每条腿稳定的向外弯曲方向。
- 病毒改为每足独立安全调度：前瞻.12秒，预测脚点进入底板/本腿扇区内侧或过伸就提前抬脚；普通抬脚错开.045秒、最多三足同时悬空，安全抬脚不用等完整三足组。落点预测身体.18秒后的位置，摆动.14秒、直线平滑位移+竖向抬脚10。保持提速后的巡游/原弹幕。
- solveSpiderLeg新增可选bend参数，默认向上兼容蜘蛛坐骑；病毒按每条腿的固定径向外侧+上方设置膝盖极向量。取消渲染时径向强夹脚点，IK足端与实际脚点对齐，落地不滑脚。
- test-177覆盖60秒巡游：脚点在各自径向外侧>20、膝盖>24、膝盖水平偏角<30度、至少三足落地、脚点无渲染夹位/无滑移、腿部半径<=51、精确两段长度；保留速度、有限模型、弹幕、伤害与重开验证。npm run check、完整npm test通过，浏览器无error/warn。未发布。


## 2026-10-13 本地 0.179.0：病毒提速、减少碎步

- 巡游路径频率同步乘1.7，原路径及范围不变，相同路径位置的速度提高70%；弹幕时间与轮换不受移动提速影响。
- 病毒迈步阈值22（原7）、抬落脚时长.26秒（原.16），抬脚12；落点按速度前瞻.24秒、最多20距离，并限制在42半径内，维持六足交替三足与紧凑外形。蜘蛛坐骑共用步态函数未修改。
- npm run check、test-177通过。新增12距离移动固定脚点、90速度下三秒5～12组三足迈步/平均步幅>28、首秒水平移动>85验证，保留60秒边界/关节范围/弹幕/真实击杀与重开验证。本地浏览器已刷新，无error/warn。未发布。


## 2026-10-13 本地 0.178.0：病毒头壳细长、六足收拢

- 按参考图改为带尖顶/尖底的长六边柱衣壳，头部宽约52、高90；原头壳宽约58、高69。尾管/颈圈位置与新衣壳底端对齐，血条抬到新头顶上方。
- 六足落脚半径67→34，双段长度43/52→23/31，步距阈值15→7、抬脚高度20→10、步时.22→.16；渲染时足尖半径限制43，腿更细，收拢在身体附近。保留原本体碰撞与三种基础弹幕。
- npm run check、test-177及蜘蛛相关test-137/138通过；test-177用真实virusLegPose验证60秒巡游中腿部紧凑范围和两段长度。浏览器检查新版造型，控制台无error/warn，截图tests/virus-slim-preview.png。未发布。


## 2026-10-13 本地 0.177.0：病毒 BOSS 独立测试场

- 新增 dist/virus.html / virus.js，首页提供入口，本地 http://127.0.0.1:4173/virus.html。噬菌体轮廓：20面三角衣壳、尾鞘/底板和六条尾丝支撑足，原生 WebGL 网格。
- 从蜘蛛坐骑抽取共用 advancePlantedGait，保留坐骑四足参数；病毒使用交替三足、固定世界脚点、平滑抬落脚，复用 solveSpiderLeg / drawSpiderStrut。BOSS 在场内平滑巡游，420血、接触伤害，接入现有友军伤害/易伤/索敌。
- 每8秒轮换18向环形散射（105速度、1.7秒间隔）、四向旋转弹流（118速度、.24秒间隔）、7发瞄准扇形（145速度、1.05秒间隔）；切换保留.8秒缓冲。仅本体碰撞，不给足部另加伤害。
- 固定13×11完整地板、8生命、默认步枪，无普通敌群/陷阱；重开、无敌、F2装备测试，击败/死亡留在独立场景。正常关卡暂不加入病毒。
- npm run check 与完整 npm test通过；test-177覆盖60秒巡游/边界、固定脚点/交替三足/IK长度、弹幕数量速度及瞄准、真实击杀与胜败重开清理、有限模型。浏览器检查模型和环形/旋转弹幕，无error/warn，截图 tests/virus-boss-preview.png。未发布。


## 2026-10-13 本地 0.176.0：双状态与蛇形随缘游走

- 改为游走10秒 / 追击5秒循环。游走速度135、随机选择远处目标并叠加左右摆动，身体按真实蛇头轨迹弧长跟随，开局路径也有波形；不再锁定直线矩形巡游。
- 追击速度160、朝玩家转向，转向限制1.15rad/s防止急折；全身粉红、背部粉红自发光保持环境灯下辨识，长出侧刺与高背刺，全身碰撞伤害。游走收刺恢复原色，仅头部碰撞并发射8向慢弹；追击停止发射新弹幕，已发出的自然消散。
- 轨迹缓存有上限，固定34弧长间距；断节缩短及头部晋升重定位沿实际轨迹继续，无瞬移。滑板危险源筛选随状态开关身体碰撞。HUD显示模式/伤害规则/状态倒计时，测试场新增「切换追击/游走」按钮。
- test-171 更新长时间双状态移动/边界/间距/缓存验证，增加自动模式切换、追玩家转向、切换无瞬移、粉红刺几何、全身伤害与收刺恢复、追击不发弹/游走发弹、初始波形。语法和完整回归通过，浏览器检查两状态造型；未发布。


## 2026-10-13 本地 0.175.0：提速、不追人、均匀巡游

- 蛇本体改为135恒速，移除玩家追踪与小圈追击。按场内大圆角矩形闭合路线巡游，范围x40～610/y130～570、转弯半径90，总长约1865，大于完整蛇身1190。
- 所有节段按路线弧长固定34间距采样，开局已均匀铺在路线中；销毁节段后后部沿路径补位，蛇头接任从原位置继续，不跳跃。移除历史路径缓存，避免急转挤作一团。8向慢弹及仅头碰撞保留。
- test-171 加入连续60秒巡游、固定弧长间距/边界、隔三节以上距离>75、移动独立于玩家位置、蛇头晋升无瞬移验证；原分节重连/伤害/炮节/渲染保持。语法/完整回归通过，浏览器检查大范围均匀分布，控制台无error/warn；本地已刷新，未发布。


## 2026-10-13 本地 0.174.0：慢速环形散射与安全蛇身

- 炮节每 2.6 秒发射 8 发全周均匀环形弹幕，弹速 78（原125）；相位由节段 seed 和时间决定，不读取玩家位置。炮口改为四向发射口并缓慢旋转，保留橙色标记、蓄力与短闪。
- 蛇游走/追击速度降至55/75（原90/125）。仅当前蛇头触碰伤害玩家，身体/尾巴可穿过并仍可被攻击；新晋升蛇头正常碰撞。滑板危险源筛选同步排除无害蛇身，避免误触发跳跃奖励。
- test-171 覆盖实际8向均匀角度/速度/非瞄准相位、炮节删减后弹数、身体/尾巴接触无伤、头与晋升头接触受伤；保留连接和渲染检查。语法/完整回归通过，预览刷新，未发布。


## 2026-10-13 本地 0.173.0：蛇身炮节区分

- 原始第 3 节起每四节配置固定 shooter 标记，共 9 个炮节。伤害删除/重连后保留原节的标记，不再按幸存列表下标重新选择发射点；摧毁炮节减少弹幕数，普通节不接任炮节。
- 炮节使用暖铜色背甲、独立旋转炮口与常亮橙色环，普通节保留绿色背鳞/背脊。开火前 .65 秒变亮加光晕，真实开火后 .16 秒白热短闪。炮节晋升为头/尾时仍显示炮口并继续发射。
- test-171 覆盖普通节销毁后原炮节实际发射位置、炮节销毁后数量减少、真实开火短闪、炮节晋升蛇头及有限渲染。语法/完整回归通过，浏览器检查模型差异、控制台无 error/warn；本地预览已刷新，未发布。


## 2026-10-13 本地 0.172.0：放大蛇形 BOSS 并重做造型

- 根据试玩反馈去掉插头蛇头与盒子身体。以旋转的截面网格形成宽颞部、尖吻、上下颌、暗色口缝、侧眼竖瞳、獠牙和眉角；身体为圆润鳞节、浅色腹部、叠覆背鳞/背脊与侧鳞，尾巴逐渐收尖，无逐帧动画素材。
- 默认节数 18→36、节距 23→34、身体造型水平尺寸 ×1.55、蛇头 ×1.85，碰撞半径同步至头26/身19。开局以场内 U 形铺开，避免长身体超出地图。
- 仍为独立本地测试场，保持分节血量及重连规则。test-171 增加体量、完整头身尾有限网格及网格规模检查。语法/完整回归通过；浏览器实际检查造型与体量，控制台无 error/warn。未发布。


## 2026-10-13 本地 0.171.0：蛇形 BOSS 独立测试场

- 新增 dist/snake.html，普通游戏首页可进入；本地地址 http://127.0.0.1:4173/snake.html。固定 13×11 格完整安全地板，8 格生命，默认普通步枪，F2 可替换装备；无普通敌群和陷阱，不记录最高楼层。
- 18 节机械电缆蛇，每节 18 血，全部接入现有索敌、子弹、穿透、爆炸、无人机及坐骑伤害。重复硬质模型由平移/旋转形成动作，先游走再追击，隔几节低频发射瞄准弹。
- 蛇身按蛇头历史路径的弧长跟随，限制历史长度。击杀身体节保留其余部件对象/血量/效果，重连前后引用，后段沿路径补位并缩短；打掉头/尾自动晋升相邻节，最后一节死亡才完成测试。
- 测试场提供重开、打掉中间节、无敌开关和总血量；胜利/死亡留在测试流程，可以重新测试或返回普通游戏。
- test-171 覆盖实际子弹击杀、前后连接/身份保持、头尾晋升、连续多节删除、缺口闭合、急转间距、有限坐标/路径缓存、弹幕、完成/失败/重开/正常重置。语法检查与完整回归通过。浏览器实际画面和中间节按钮检查通过，控制台无 error/warn；未发布。


## 2026-10-12 本地 0.170.0：扩大爆炸火花/烟雾/地面光照

- 火光参数从min(32,0.25R)改为0.42R，去掉大爆炸亮核尺寸上限；六个火花瓣从核心0.23倍改为0.34倍，扩散偏移从0.12R改为0.28R并在起始即少量展开。
- 七簇烟雾中心分布到约0.4R，每簇柔边半径约0.55～0.63R，组合覆盖接近实际爆炸半径；降低单簇透明度避免大面积烟遮盖，仍持续0.9秒。
- 底部暖光斑初始半径从0.9R提高到2.4R，亮芯从0.48R提高到1.05R，并改更亮的暖白色，模拟超出伤害范围的地面照明。保持快速收缩，冲击圈/伤害/层寿命不变。
- npm run check与完整npm test通过；新增烟覆盖半径与大爆炸火光同比例放大检查。mock验证，无本轮实机截图。已发布原站点，本地0.170.0 / Sites版本96，deployment appgdep_6accbc3d7824819199255269a976efe0 状态succeeded；源码提交36867ebd9029875ed7eedd34a2a684145783825b。

## 2026-10-12 本地 0.169.0：新坐骑进入商店

- 修复商店坐骑池仍按prototype过滤，现有13种坐骑均可从随机坐骑盲盒获得，含黑胶唱片、蜘蛛机甲、飞行星星、飞碟、霓虹飞剑、小鲨鱼飞艇、小飞机和章鱼触手。prototype保留为新坐骑初始化标记，避免带入旧鞋默认移速；属性、品质、价格、盲盒规则保持。章鱼触手当前仍只有贴地跟随效果。
- npm run check与完整npm test通过；test-162覆盖13种坐骑各商店品质的实际购买、揭晓、装备与移动数值，旧商店池测试同步。mock检查，无本轮实机视觉验收。未发布。

## 2026-10-12 本地 0.168.0：护甲说明精简

- 护甲特殊效果改为短属性行，例如暴击率+32.8%、暴击伤害+42.5%、移速-15%；删除重复作用对象和零防御说明，其余护甲能力以短句呈现。杀毒工装统一为“每层清理一个危险机关。”
- 普通衣服取消原品质附带的小额受击无敌加成，统一基础1.5秒；琉璃铁布衫保留专属延长，卡片只显示实际增加量，不混入当前坐骑加成。坐骑受击无敌仍独立叠加。
- npm run check 与完整 npm test通过；桌面浏览器核对精简对比卡片，控制台无警告/错误，截图 tests/armor-concise.png。test-122覆盖各品质普通无敌一致、专属实际增量、坐骑加成不混入及精确文案。
- 本地预览测试场景：tests/preview-equipment.mjs 的 ?concise。未发布。

## 2026-10-12 发布：本地0.167.0已更新原站点

- 原公开站点 https://hell-elevator.wzyanggg.chatgpt.site 已成功部署本地0.167.0，Sites保存版本95，保持既有project_id与公开访问设置。
- 源码提交c924136ef637babcc3558c2144fb4a950bf70ae6；saved version appgprj_6ac74d5c19748191bc27adbcb8926213~appgver_04b6940696f88191860ab21e7110693d；deployment appgdep_6accb7b8aa2c819184b31fcb6da3f68f，后端状态succeeded。
- 发布checkout H:\CodexProjects\hell-elevator-codex\publish-0.167.0，归档 H:\CodexProjects\hell-elevator-codex\hell-elevator-0.167.0-deploy.tar.gz；原开发目录保留。发布helper在Windows需把Git bin加入PATH，并设置TAR_OPTIONS=--force-local；凭据仅会话内存/stdin，不写文件。
- 发布前代码检查与完整回归已通过；未做本轮线上浏览器/GPU视觉验收。

## 2026-10-12 本地 0.167.0：四层爆炸视觉

- 火箭/追踪飞弹及敌方导弹爆炸共用独立explosionFX视觉：白热核心/橙色火光0.095秒（加法点精灵最后绘制，强亮优先）、7簇柔边烟雾上升外散0.9秒、透明范围冲击圈0.34秒、底部暖白光斑0.28秒。
- 圈半径前0.035秒三次缓出从0.1R迅速到0.96R，后以指数缓出少量外扩至约1.08R；圈宽和透明度快速衰减。底部光斑起始即最大范围，按幂函数收缩，高度3.2/3.3低于圈/烟/火光。烟雾使用相机朝向径向渐隐透明三角扇，火光结束后仍保留烟。
- 爆炸视觉与实际radial伤害弹分离，.18秒伤害弹结束不删烟，BOSS结束阶段保留爆炸并自然消散；32个视觉上限，.9秒释放，商店/重开清理。范围从实际blastRadius读取，伤害/命中去重/奖励保持，旧火箭范围圈与导弹线性圈停画，原小碎屑保留为次要细节。
- npm run check 与完整 npm test通过。test-167覆盖各层寿命/有限网格、光斑最大值与收缩、冲击圈快慢速度/半径同步、实际一次伤害、视觉独立寿命/数量上限、敌方导弹/阶段/商店/重开。mock验证，无本轮实机截图。未发布。

## 2026-10-12 本地 0.166.0：坐骑构筑增益统一降至2/3

- 用户要求数值降低：createShoes完成原品质参数后统一缩放构筑加成2/3，含滑板基础/特技攻速、蜘蛛站桩暴击、飞星攻速/暴击、飞剑每敌暴击、黑胶触发攻速、飞机每层易伤；鲨鱼半径乘数按1+(原倍率-1)×2/3，飞碟按减速百分比×2/3处理。
- 新普通→传奇：滑板基础攻速20～46.67%，满层总60～126.67%；蜘蛛暴击26.67～53.33个百分点；飞星攻速16.67～36.67%/暴击13.33～26.67个百分点；鲨鱼半径×1.5～2.1667；飞剑每敌暴击6.67～13.33个百分点（五敌33.33～66.67）；唱片攻速40～80%；飞机每层易伤6.67～13.33%（满层伤害×1.6667～2.3333）；飞碟减速40～53.33%。
- 触发条件、品质梯度、层数上限、持续时间、作用半径和坐骑独立攻击/移动参数保持，装备卡读取新值。新建装备即应用缩放，不在运行中重复缩放。
- npm run check 与完整 npm test通过。现有真实伤害/爆炸覆盖/减速位移/边界积分测试更新预期。mock验证，无本轮实机截图，刷新预览即可。未发布。

## 2026-10-12 本地 0.165.0：飞碟子弹减速防御场

- 飞碟新增随人物移动的防御场，普通→传奇半径2/2.25/2.5/2.75/3格，敌方实体子弹在场内速度降低60/65/70/75/80%。combat/survival生效，离开范围或换装立即恢复原速；保留独立激光。
- 使用直线/圆交点分段积分进入、减速、离开时间，长帧高速穿越也受影响；不修改子弹基础vx/vy，不累计减速，寿命按原世界时间消耗，子弹接触仍伤害。不影响友军攻击/敌方激光/陷阱/追踪导弹。
- 地面淡蓝柔和透明径向渐隐场，边缘12个低亮刻度提示半径；防御场不随人物受击闪烁消失。装备卡显示范围/减速数值与作用对象。
- npm run check 与完整 npm test通过。test-165覆盖品质/实际位移、边界进出/整段穿越/帧步一致性、基础速度/寿命保持、移动/换装/阶段、正常受伤/友军不受影响、有限场模型和重开。mock验证，本轮无实机截图。未发布。

## 2026-10-12 本地 0.164.0：飞机弹叠加敌人易伤

- 飞机小子弹实际命中活的可攻击敌人后叠易伤，每层增伤10/12.5/15/17.5/20%，最多10层，满层友军伤害×2/2.25/2.5/2.75/3。持续4秒，命中（包括满层）刷新全层时间，到期全部失效，下次从一层开始。
- 伤害先按命中前层数结算，再添加本次层数；主武器/无人机/坐骑及其爆炸、近战、连锁均通过共用伤害路径享受目标易伤，乘在暴击结果之后。其他攻击不叠层，无敌陷阱炮台不受伤/不叠层；弹体携带品质/上限/持续时间快照。
- 敌人血条下橙色小标显示当前层数，过期隐藏，装备卡显示数值/上限/时间。换装清理飞机弹，敌人已有易伤自然持续到到期；过层/重开随旧敌人销毁。飞机速度/密度/模型保留。
- npm run check 与完整 npm test通过。test-164覆盖实际命中与单发去重、层数上限/刷新/过期/重叠、目标隔离/所有来源增伤/暴击、品质快照/陷阱免疫、层数模型/卡片、换装与实际击杀奖励。mock验证，本轮无实机截图。未发布。

## 2026-10-12 本地 0.163.0：坐骑核心数值大幅增强

- 用户要求坐骑成为三系统构筑的高数值组件，所有0.162.0触发条件保持。滑板基础攻速30/40/50/60/70%，特技每层12/15/18/21/24%，五层合计攻速90/115/140/165/190%。
- 蜘蛛站桩暴击率40/50/60/70/80个百分点；飞星攻速25/32.5/40/47.5/55%，暴击率20/25/30/35/40个百分点；鲨鱼爆炸半径×1.75/2/2.25/2.5/2.75（面积约×3.06～7.56）。
- 霓虹飞剑每个近敌加暴击率10/12.5/15/17.5/20个百分点，最多五个合计50/62.5/75/87.5/100个百分点；黑胶刮中后攻速60/75/90/105/120%，仍为3秒刷新不叠加。暴击率总上限100%，攻速与护甲加成相加。
- npm run check 与完整 npm test通过。测试同步更新强化后的数值、爆炸范围/品质及属性叠加期望。mock验证，本轮无实机截图，刷新预览即可。未发布。

## 2026-10-12 本地 0.162.0：坐骑流派属性

- 滑板新增基础攻速10/12.5/15/17.5/20%，原特技攻速叠层保留。蜘蛛实际静止0.6秒后暴击率+12/15/18/21/24个百分点，实际移动立即解除；只在战斗积攒，暂停不积攒。
- 飞星泛用攻速+10/12.5/15/17.5/20%，暴击率+8/10/12/14/16个百分点；脚下贴图光圈改为原生圆形Glow（高度2.8、半径参数15、暖金），星体3.5秒旋转/渐变/星屑保持。
- 机械鲨鱼友军爆炸半径×1.25/1.35/1.45/1.55/1.65，发射时快照应用于主武器和无人机的火箭/追踪飞弹，实际受击范围与爆炸视觉同步，不扩大敌方危险源。
- 霓虹飞剑按2格内可攻击活敌数加暴击，每个+3/3.5/4/4.5/5个百分点，最多5个；排除死亡/无敌炮台，不计导弹。黑胶实际刮中敌人后攻速+15/19/23/27/31%，持续3秒，命中刷新不叠加，发射未命中不奖励。
- 攻速加成与翎羽/滑板叠层相加，作用于主武器/无人机/坐骑；暴击率与武器/护甲相加并上限100%，发射快照。条件状态换装/新楼层重置，非combat不生效。装备卡展示所有数值和条件。
- npm run check 与完整 npm test通过。test-162覆盖品质/属性叠加、站桩/移动/暂停、敌人数/排除/上限/快照、实际刮伤奖励/刷新/过期、实际扩大爆炸范围、装备卡和生命周期；test-125更新基础攻速期望，test-143更新飞星Glow验证并保留渲染资源恢复测试。mock验证，本轮无实机截图。未发布。

## 2026-10-12 本地 0.161.0：密集高速细长飞机弹

- 用户要求子弹细长、密集且更快：飞机发射基准间隔0.105→0.021秒，平均约48发/秒（原约10发/秒），随机扇形角度/间隔保留；弹速540→760，约提高41%。单发伤害保留。
- 圆点弹改为22×1.2×1.6亮黄细长弹体，内含14×0.6×0.7白芯；沿实际可视速度朝向旋转，小光晕保留。骑乘/移动速度未改。
- npm run check、test-156/160通过；test-160更新密度检查、弹速检查，单发伤害测试隔离自动连射以检查单次碰撞。mock验证，无本轮实机截图，刷新预览即可，未发布。

## 2026-10-12 本地 0.160.0：小飞机前向散射

- smallplane 新增机头朝向的连续扇形小子弹：前向±0.55弧度，单发射角均匀随机，发射间隔为0.105秒×随机0.65～1.35，形成不等间隔散射。沿机头方向出膛，不自动转向敌人；仅combat且未暂停时开火，可无目标持续开火。
- 子弹速度540、寿命1.6秒、单次接触、品质伤害0.55/0.825/1.1/1.375/1.65；source=mount，共用实际扫掠碰撞、护甲暴击/暴击回血、攻速、击杀奖励和BOSS清场，敌方陷阱炮台仍无敌。2.2半径亮黄小弹和小光晕，与机头的世界朝向/高度同步。
- 换装清理发射计时与已有飞机弹；现有原尺寸骑乘和小飞机模型保留。test-160覆盖不均匀角度/节奏、方向/出膛位置、实际伤害/单发去重/奖励、品质/暴击/攻速、状态/暂停/换装/重开和炮台免伤。
- npm run check 与完整 npm test通过。mock验证，本轮无实机截图；本地预览源文件即时更新，未发布。

## 2026-10-12 本地 0.159.0：去除触手同向螺旋偏向

- 用户指出八根触手都像顺时针/逆时针卷曲：原因是 FABRIK 初始曲线统一加入切向偏移 side*9。去掉该偏移，使用竖直向上弯曲极向量，骨链保持在各自根部/接地点的竖直平面内，形成向外展开的弧形，不再统一侧旋。
- 保持八根独立吸附、步态、骨长和静止完全冻结。npm run check 与 test-157通过；在既有四向移动/稀疏地板测试中追加所有骨点无切向偏移检查。桌面浏览器复核展开造型，控制台无警告/错误；截图 tests/tentacle-radial-plane-preview.png。未发布。

## 2026-10-12 本地 0.158.0：八根四散触手与静止冻结

- 用户要求触手向四周展开并在静止时停止：tentacle 改为8根等角度触手，独立末端/16节 IK 链与吸盘，根部沿角色脚下小环展开；管身减细，正常落点半径33，仍收缩到实际地板。
- 真实位移驱动步态：对侧两根错开重新吸附，其余六根支撑；无实际位移直接冻结整个触手状态，包括未完成的抬脚。不使用时间/朝向产生待机摆动，松开方向或撞墙即停止，再次移动继续动作。
- 装备说明和预览提示同步。npm run check 与完整 npm test通过；test-157 更新八链骨长/落点、八方向分布、待机时间与转向不动、抬脚中松开完全冻结、支撑数量、四向走动、稀疏地板及生命周期测试。
- 桌面实际浏览器复核展开及移动，控制台无警告/错误，截图 tests/tentacle-radial-preview.png；未做手机实机验收。预览沿用 http://127.0.0.1:4180/?tentacle&ride，需刷新。未发布。

## 2026-10-12 本地 0.157.0：坐骑名称与章鱼触手 IK

- 装备槽、测试面板、商店及属性卡共用名称由“鞋子”改为“坐骑”；说明中的“当前鞋子/换鞋”改为“当前坐骑/更换坐骑”。内部 shoes 槽位 ID 保持兼容，既有装备专名保留。
- 新增 tentacle「章鱼触手」测试坐骑，prototype:true，零额外属性、不进商店，仅实现单条触手贴地跟随，无新增战斗效果。
- 紫粉色连续渐细管状触手、双排浅色吸盘，根部随角色、末端吸附世界落点；16 节等长骨骼用 FABRIK 求解，超过伸展阈值时末端用 .16 秒抬起再吸附，落点收缩到实际地板，长帧/重定位恢复落点。人物原尺寸抬高14，护甲/武器/护盾/血条同步。
- 暂停冻结，松开停止；换装/新楼层/重开清理落点。新增 ?tentacle / ?tentacle&ride 预览，当前预览服务器 http://127.0.0.1:4180/?tentacle&ride 。
- npm run check 与完整 npm test 通过；test-157 覆盖多节骨长/端点、落点固定、四向移动/抬落、稀疏格与边缘、暂停/停止、模型有限数值及换装/过层/重开。桌面实际浏览器复核静止及向右移动画面，未发现控制台警告/错误；未做手机实机验收。未发布。

## 2026-10-12 本地 0.156.0：小飞机坐骑

- 新增 smallplane「小飞机」测试坐骑，prototype:true，零额外属性、不进商店；专属战斗效果待设计。
- 程序化大块红白机身、奶油短机翼/红色翼尖、蓝色水平尾翼与红色垂直尾翼、开放驾驶位、透明前风挡、发光翼灯、前置十字螺旋桨。保持紧凑轮廓与暗场自发光；机头按最后移动方向转向，网格/灯/透明风挡同步，轻微浮动。
- 人物原尺寸跨骑，抬高29.5+悬浮；武器/护甲/护盾/血条同步，取消步行摆动。普通移动输入与松开停止，不继承其他坐骑攻击。
- 预览新增 ?smallplane / ?smallplane&ride。npm run check 与完整 npm test通过；test-156覆盖独立测试目录、有限紧凑模型、四向/斜向透明风挡同步、灯/骑乘比例、移动停步、护甲/换装/重开。mock验证，无本轮实机截图。未发布。

## 2026-10-12 本地 0.155.0：大块机械鲨鱼外壳

- 根据用户截图去掉鱼身逐面嵌板裂缝、交替小块颜色、侧面铆钉和细灯条；横截面24→12，连续共享边界外壳与逐顶点曲率明暗，保留短胖轮廓和原尺寸人物。
- 大块蓝色背甲/银白腹甲/橙色鼻甲与胸鳍、背鳍形成机械配色；五条小鳃槽简化为两条宽槽，保留发光眼睛、牙齿和尾部关节/摆尾。自发光保证暗场可见。
- npm run check、test-151/152通过。mock验证，无本轮实机截图；刷新本地预览即可，未发布。

## 2026-10-12 本地 0.154.0：机械鲨鱼暗场可读性

- 根据用户截图，保留现有几何与人物比例，提高背部装甲为浅青/冰蓝；装甲面使用固定曲率明暗与自发光，暗场中仍保留分块和体积辨识。鱼鳍/牙齿改为自发光材质，底盘/金属附件补弱自发光。
- npm run check、test-151/152通过，覆盖方向、有限网格、骑乘位置及摆尾。本轮未实机截图，预览源文件即时更新，未发布。

## 2026-10-12 本地 0.153.0：短胖机械鲨鱼

- 鲨鱼骑乘人物恢复原尺寸，骑乘高度调整为31.5+悬浮，跨骑腿部、武器/护甲/护盾附件/血条同步；仅飞碟继续使用50%驾驶员比例。
- 缩短鱼身并加宽加厚，改为深色底盘和分块蓝青/银灰金属装甲，装甲缝、铆钉、机械尾关节、短金属胸鳍与背鳍；眼睛改为发光传感器，鳃裂改为发光散热槽，侧面增加青紫霓虹灯条。保留上下牙、摆尾、方向旋转和悬浮。
- npm run check 与完整 npm test通过。更新现有test-151/152模型/骑乘断言。mock验证，无本轮实机截图。预览 ?sharkblimp&ride。未发布。

## 2026-10-12 本地 0.152.0：背骑飞行鲨鱼

- 用户纠正为类似猪鲨的直接背骑坐骑；保留 sharkblimp ID和名称，模型从鲨鱼气囊飞艇改为流线飞行鲨鱼，删除吊索/下挂座舱/箍带/螺旋桨。
- 新截面曲面形成宽肩、尖吻与细尾柄，蓝灰背/浅色腹，较小侧眼、五道鳃裂、侧面口裂与上下牙、后置大背鳍/胸鳍/腹鳍、不对称尾鳍；尾部随时间摆动。鲨鱼身体降低到y约15～33，最高背鳍47，背部小鞍。
- 人物继续50%尺寸，但骑乘高度13→28.5+悬浮；专属腿部模型两腿分跨鱼身， torso位于背部上方，护甲/武器/护盾/血条同步。保留方向移动与轻微浮动，专属战斗效果仍待设计。
- npm run check 与完整 npm test 通过。更新test-151模型/骑乘断言，test-152检查骑乘腿/躯干高度、牙齿鳃裂、摆尾及旧飞艇结构移除。mock验证，无本轮实机截图。预览沿用 ?sharkblimp&ride。未发布。

## 2026-10-12 本地 0.151.0：小鲨鱼飞艇

- 测试坐骑目录新增 sharkblimp「小鲨鱼飞艇」，prototype:true，零额外属性、不进商店，专属战斗效果待设计。
- 程序化蓝灰鲨鱼形气囊：圆鼓身体、浅色腹部、嘴与上下小牙、大眼/鱼鳃、背鳍/胸鳍/尾鳍、两条气囊箍带，尾部发动机与双叶旋转螺旋桨。下方吊索连接青色灯带小座舱，人物坐姿缩为50%，高度13+悬浮，头像/武器/护甲/护盾附件/血条同步；艇身按最后方向输入转向，轻微起伏。
- 预览新增 ?sharkblimp / ?sharkblimp&ride，默认侧向展示鲨鱼造型；本地预览session10258。
- npm run check 与完整 npm test 通过。test-151 覆盖目录/无其他坐骑攻击继承、各方向与动画时刻有限网格/气囊尺寸/鳍和座舱灯、骑乘高度/移动停步、护甲/换装/重开。mock验证，本轮无实机截图。未发布。

## 2026-10-12 本地 0.150.0：霓虹飞剑画风统一

- 脚踩主剑与三把护卫剑共用 drawNeonSwordModel：相同青白剑脊、青紫发光刃、紫色剑镡、金属握柄、装饰纹与尾部宝石。护卫剑以50%比例绘制，去掉旧暖黄薄刃/品质色护手，刺击亮光与短光尾同步改为青色。
- 仅修改模型与配色；三剑槽位、瞄准、伤害、间隔和刺击/收回逻辑保持。主剑原外观和移动光尾保留。
- npm run check、test-90/91/148/149 通过，覆盖三剑动画/伤害、悬浮瞄准、主剑模型和坐骑迁移生命周期。复用模型，不新增镜像实现的外观测试。本轮无实机截图。未发布。

## 2026-10-12 本地 0.149.0：三才护卫迁移到霓虹飞剑

- 原三才飞剑无人机的效果迁移到 neonsword 坐骑：三剑固定等距悬浮、最近目标瞄准、交错刺击/收回，参数保持每剑品质伤害3.2/4.8/6.4/8/9.6、间隔.7秒、悬浮半径52、刺击范围120。脚踩长剑及移动光尾保留，另可装备其他无人机。
- swordBlades/swordHome/swordPose 改从 shoes 读取状态与参数，updateMountedSwords/drawMountedSwords 由坐骑触发；伤害source=mount、mountedSword=true，共用实际碰撞/单次去重/护甲暴击/攻速/击杀奖励。换装清理已有攻击，过层/重装重置三剑，暂停/非战斗不刺击。
- flysword 从 DRONE_TYPES、商店与F2测试入口移除，equipItem拒绝直接装备，旧运行实例不再攻击/绘制。保留内部旧工厂参数供回归比较及未来恢复。霓虹飞剑仍是测试坐骑，暂不进入正式商店。
- 预览 ?neonsword&ride 改为近距离敌人以展示护卫刺击，本地预览session42454。npm run check 与完整 npm test 通过；原test-90/91/97/114迁移为坐骑效果测试，test-93/148更新退役目录断言，test-149覆盖参数保持、实际坐骑伤害、与其他无人机共存、旧入口/运行关闭和生命周期。mock验证，无本轮实机截图。未发布。

## 2026-10-12 本地 0.148.0：脚踩霓虹飞剑

- 测试坐骑目录新增 neonsword「霓虹飞剑」，prototype:true，零额外属性、不进商店，独立于 flysword 飞剑无人机。先实现脚踩坐骑模型，专属战斗效果待设计。
- 程序化细长尖剑：青白剑脊/青紫发光刃、紫色剑镡、金属握柄和尾部宝石。人物站姿抬高11.5+±1.5悬浮，与武器/护甲/血条同步，取消步行摆腿；剑尖按实际移动方向旋转，停下保持朝向。
- 从剑柄后方按实际位移采样光尾，透明带0.3秒渐隐、最多16点；绘制不推进采样，停步消散，瞬移/换装/重开清理。普通方向移动可停止，没有增加伤害或改变自动瞄准。
- 预览新增 ?neonsword / ?neonsword&ride，本地预览已重启加载入口。npm run check 与完整 npm test 通过，test-148 覆盖独立目录/无人机区别、四向/斜向/停步、尖剑有限网格/骑乘高度、尾迹衰减/上限/瞬移与护甲/换装。mock验证，本轮无实机截图。未发布。

## 2026-10-12 本地 0.147.0：实心唱片光环与激光飞碟

- 黑胶唱片盘内霓虹带改为连续实心青色环，保留内缩位置与旋转纸标/螺旋/定位标。test-147 用逐角度三角形覆盖验证环无断口。
- 飞碟轮廓重做：碟身最大半径34→44，扁平分层船体；玻璃穹顶高度65→28、顶92→48，水平半径22/20，保留透明反光与金属舱肋、环形霓虹及舷灯。UFO专属人物/武器/护甲模型缩至50%，坐姿高度13+悬浮，护盾附件与血条同步，驾驶员与天线包入低穹顶。其他坐骑不缩放。
- 飞碟新增腹下独立激光：自动最近可攻击目标，间隔 .55秒，品质伤害2/3/4/5/6，穿透3目标。source=mount、ufoLaser=true，共用友军瞬发激光碰撞/单次去重/护甲暴击/攻速/击杀与清场。仅combat作战，暂停/其他阶段不攻击；排除无敌敌方炮台，换装清理计时与已有光束。
- npm run check 与完整 npm test 通过。test-145/146 更新轮廓/座舱范围，test-147 验证实心环、宽扁低穹顶与舱内人物、激光实际穿透/重复伤害/BOSS奖励/品质/暴击/攻速/状态/换装。浏览器预览此前被安全策略拒绝，本轮按模型尺寸与mock渲染验证，无实机截图。未发布。

## 2026-10-12 本地 0.146.0：完整玻璃驾驶舱与唱片旋转辨识

- 飞碟原半后罩改为完整椭圆透明驾驶舱（底27、顶92；横向半径28/25），包围坐姿人物及天线。前方透明度 .10、后方 .18，局部玻璃反光 .38，增加细金属舱肋、基座封边与青紫霓虹装饰带，舱罩与坐骑一起悬浮。
- 黑胶虚线光带从盘缘半径30～33/y8移到盘面半径23～25/y12.2（最终整体放大后约30～33，距外缘43留约10单位间隔）。放大中心标签，增加非对称奶油色纸标、印字、螺旋刻纹和三角定位标；全部随time×4旋转，唱针保持固定，令盘面旋转可独立辨识。刮伤效果/范围保留。
- npm run check、test-144/145/146 通过。test-146 校验舱罩四面范围/高度/反光/舱肋与霓虹、光带位于盘内顶面、纸标和螺旋实际转动、唱针不转。mock验证，本轮未实机截图。未发布。

## 2026-10-12 本地 0.145.0：大黑胶唱片与独立飞碟

- vinyl 更名「黑胶唱片」，模型横向整体扩大43/33（约30%），保留人物尺寸和站姿高度；外壳改为薄暗色盘缘（y8～12），音槽/标签/唱针同步放大，削弱银色飞碟感。近身刮伤半径33→43，与新盘缘匹配，其他伤害/间隔/击退机制保留。
- 新增 ufo「飞碟」测试坐骑，prototype:true：银色碟形船体、中央座椅/操纵面板、半透明蓝色后罩、青紫环形灯与底部引擎，坐姿高度20+悬浮，支持普通方向移动/停步。独立目录ID与卡片，不继承黑胶伤害；专属能力待设计。两者仍暂不进入商店。
- 预览 ?vinyl&ride 与 ?ufo&ride，本地服务器已重启加载两个入口。npm run check 与完整 npm test 通过。test-144 更新名称与尺寸断言；test-145 验证扩大网格/接触范围、新飞碟独立装备/无伤害继承、有限船体/透明罩、坐姿/停步/换装。mock验证，本轮无实机截图。未发布。

## 2026-10-12 本地 0.144.0：黑胶飞碟与近身刮伤

- 原待设计 vinyl「黑胶皮鞋」现为测试坐骑「黑胶飞碟」，仍 prototype:true、不进入商店。脚踩厚唱片飞碟，暗色唱片/细音槽、旋转粉紫标签/青紫外缘、固定唱针与音臂；圆盘半径33，人物站姿抬高11.5+轻微悬浮，武器/护甲/血条同步，停止摆腿。
- updateVinylCutter 在 combat 自动刮伤半径33+目标半径内所有可攻击敌人/导弹，间隔 .18秒，品质伤害1/1.5/2/2.5/3；共用友军射弹路径，source=mount、vinylCutter=true、radial/arcTargets，单次去重，正常暴击/护甲吸血/击杀/BOSS清场。受攻速加成。
- 命中追逐者时沿人物向外轻推130，沿用月牙波的追逐者击退路径；不攻击无敌敌方炮台，不提供额外无敌。攻击闪亮外缘与近身命中火花，不额外画普通径向黄圈。换装清除伤害计时/已有刮擦射弹，重开清空。
- 预览新增 ?vinyl / ?vinyl&ride，本地预览 session28767。npm run check 与完整 npm test 通过；test-144 覆盖范围/多目标/陷阱排除、实际重复伤害/去重/BOSS奖励、击退、品质/暴击/攻速、状态/暂停、站姿/紧凑有限网格/移动停步/换装。mock验证，本轮无实机截图。未发布。

## 2026-10-12 本地 0.143.0：星下光晕贴图与3.5秒自转

- 飞行星星自转改为 time×2π/3.5，准确3.5秒一圈，仍与移动无关。
- 新增 dist/assets/star-halo.png（128×128 RGBA）：透明中心/边角、暖金柔光环与渐隐外晕。星体下方 y2.8、90单位贴图面，轻微亮度呼吸，代替原实色阴影圆盘。
- 复用现有纹理四边形管线，新增独立 haloTexture/加载上传与 haloSprite；shader 的 halo 模式绘完整贴图并乘透明度，使用 SRC_ALPHA/ONE 加法混合。剑光保留原纹理、扇区裁切与标准透明混合；缺失光晕不阻断剑光，上下文恢复重建并重传两个纹理。
- npm run check、完整 npm test 通过。test-143 覆盖精确转速、光晕UV/高度、换装、独立纹理/混合/模式和显卡恢复；PNG已检查透明中心/边角及环部alpha（0/0/242）。本轮仅检查贴图与mock管线，没有游戏实机截图。未发布。

## 2026-10-12 本地 0.142.0：星体自转与中心渐变

- 飞行星星改由世界时间以 .9 弧度/秒持续自转（约7秒一圈），去掉尾迹状态中的移动朝向。移动、停步及阻挡均不改变自转规律；暂停自然冻结，人物与武器不随星体转动。
- 上一版各圈纯色改为逐顶点连续径向渐变：中心奶白亮金→金黄→边缘橙金；曲面下腹额外降低亮度形成体积感。drawStarGradientQuad 写入常规发光顶点，三角形内由 GPU 插值，共享边顶点颜色一致，无纯色分圈断层。保留胖星造型、悬浮与星屑。
- npm run check、test-140、test-141、test-142 通过。test-141 原位移朝向断言更新为时间自转；test-142 检验中心/边缘色差、共享顶点接缝、三角形渐变和输入独立性。mock 验证，本轮未做实机截图。未发布。

## 2026-10-12 本地 0.141.0：圆鼓星体与移动朝向

- 飞行星星从折线薄板改为平滑五瓣星轮廓：外半径27、凹口半径17，60段连续轮廓，8圈体积曲面。厚度7→18（y5～23），饱满上表面、鼓起侧边与圆润下腹，金色亮暗层次保持自发光。
- 人物骑乘高度随星面升到22.5+悬浮量，脚底/装备/血条继续同步。星尖朝向实际位移 atan2(dy×1.06,dx)，停下保持最后朝向，撞墙只有输入而无位移时不转；瞬移不改变方向。
- npm run check、test-140、test-141 通过。test-141 校验厚度/中间曲面/宽凹口、紧凑有限网格、星尖全角度朝向、四向/斜向位移、停步/阻挡与绘制不改状态。测试使用 mock，本轮没有实机截图。未发布。

## 2026-10-12 本地 0.140.0：脚踩飞行星星

- 测试坐骑目录新增 warpstar「飞行星星」，prototype:true，零额外数值，暂不进入正式商店。用户要求类似 Warp Star 的脚踩式星体；先做造型与骑乘表现，专属战斗效果待设计。
- 程序化金色五角星：半径27/内角12.5，平顶、倒角与厚侧壁，金色自发光和五个角的轻微辉光；星体 y=5～12，随世界时间 ±2 轻微悬浮。
- mountRiderLift 统一骑乘高度，星星站姿抬高11.5+悬浮量，脚底衔接星面；武器/护甲/护盾附件和血条同步抬高，乘星时停止步行摆腿。蜘蛛坐姿原逻辑保留。
- 移动每3世界单位生成星屑，0.38秒消散，最多24个；只按实际位移生成，静止不喷尾迹，瞬移清除，换装/重开清理，绘制不推进动画状态。
- 预览新增 ?warpstar / ?warpstar&ride。npm run check 与完整 npm test 通过；test-140 覆盖测试选择/属性、有限紧凑网格、脚底/辉光高度、移动/停步、尾迹衰减/上限/瞬移，以及护甲/换装/重开。本轮仍未做浏览器实机画面验收。未发布。

## 2026-10-12 本地 0.139.0：蜘蛛腹下旋转机枪

- 中央座舱腹部下方新增固定轴承/发光转盘/垂直悬挂与独立旋转枪架，双枪管、侧弹箱和枪口闪光；整圈旋转仍保持 1.5×1.5 格外廓。
- updateSpiderTurret 独立最近可攻击目标瞄准，角速度 8π/秒，朝向误差小于 .06 弧度才开火；只在 combat 作战，暂停及下降/落地/开场/生存/商店不攻击。敌方无敌炮台不纳入目标。
- 每轮4发，连发间隔 .09秒，点射周期 .75秒；单发伤害 .65×(1+.5×品质增量)，速度900，source=mount、spiderTurret=true，腹下高度14+步态浮动。共用友军射弹碰撞、护甲暴击、攻速与击杀/通关奖励；近敌缩短枪口生成距离以免越过目标。
- 换鞋清理炮塔状态及其已有子弹，重开清空。装备卡补充炮塔数值，仍处于测试坐骑目录、不进入商店。
- npm run check、完整 npm test 通过。test-139 覆盖目标/转向/连发/无目标/陷阱排除、实际远近碰撞伤害/BOSS奖励、品质/暴击/攻速、状态/暂停/换装，以及枪管整圈网格边界。实机画面未复核，沿用本地 ?spider&ride 预览。未发布。

## 2026-10-12 本地 0.138.0：蜘蛛机甲收拢至 1.5 格

- 四足默认落点从 ±43/±36 收为 ±24/±23，提前量 .065→.04，步幅触发阈值 13→9；腿根从 ±17/±12 收为 ±14/±10，双骨腿长 30/36→20/27，保留对角 IK 步态及座舱。
- compactSpiderFoot 限制用于渲染求解的脚中心相对人物为 x±34、z±36，包含脚掌厚度后的完整机甲网格不超过 1.5×1.5 格（格边54，z投影1.06）。快速转向/加速/长帧遗留支撑点也收回外廓，避免迈步重新摊开。
- npm run check、test-137、test-138 通过。test-138 直接检验机甲全部网格顶点的世界 X/Z 边界，覆盖静止、各向移动/急转、步态全阶段、2倍及更高速度、长帧与异常远足目标；使用 mock，不代表本轮浏览器视觉验收。未发布。

## 2026-10-12 本地 0.137.0：蜘蛛机甲模型与四足 IK

- 鞋子槽测试目录新增 spider「蜘蛛机甲」，prototype:true，零额外数值；不进商店。先实现用户要求的坐骑模型，战斗效果待设计。
- 纯程序化开放座舱、座椅/靠背/侧扶手/脚踏与四条双节机械腿，青紫发光关节；人物改为坐姿并抬高 21 单位，武器、护甲、护盾附件和血条同步抬高，去掉普通鞋子地面模型。
- 每帧由实际位移驱动步态，支撑脚使用世界坐标落点，对角两腿交替以 0.12 秒弧线迈步；两段腿长 30/36，由解析双骨 IK 解膝位置，上方 pole 保持膝盖朝上。包含不可达/重合目标保护、停步收势、地板边缘目标收近、瞬移重锚定与换装/重开清理。
- tests/preview-equipment.mjs 新增 ?spider 静态预览及 ?spider&ride 可控预览，默认端口 4174，可通过 PORT 改端口。本地预览 session 86716。
- npm run check 与完整 npm test 通过；步长最后收至 0.12 秒后单独重跑 test-137。test-137 覆盖四足落点、对角交替/抬脚/停步、IK 固定腿长/退化目标、多方向实际移动、稀疏地板与有限 mock 网格。test-77 商店索引同步排除待设计原型。
- 浏览器工具对本地 http 标签页绑定触发安全策略拒绝，本轮无法截图及实机视觉验收；没有尝试替代浏览器绕过。未发布。

## 2026-10-12 本地 0.136.0：敌方炮塔负面文案

- 机枪与激光炮塔的负面效果统一改为「- 地图边界增加一座无敌的敌方炮塔。」。仅调整文案。
- npm run check、test-108 通过。未发布。

## 2026-10-11 本地 0.135.0：黑胶皮鞋待设计装备

- 新增鞋子 vinyl「黑胶皮鞋」，用户仅确定名称，效果暂不设计。标记 prototype:true，移速/受击无敌加成为 0，效果说明「效果待设计。」；F2 测试装备可选与装备，各品质均可用。
- 正式商店鞋子池过滤 prototype，保留现有五件装备概率；滑板商店回归改为使用正式池计算随机索引。
- npm run check、test-59、test-125 通过；额外 VM 检查测试选择/装备、零属性、待设计说明与 100 次商店抽取排除。未发布。

## 2026-10-11 本地 0.134.0：其他鞋子命名

- runner「波点水上漂」、catalyst「裂变德鲁伊」、magnet「盛宴舞鞋」。稳步靴暂留原名，滑板仍为霓虹巡演。统一目录名称自动用于商店、装备卡与测试装备入口；数值与效果保持。
- npm run check、装备与催化/磁吸相关 test-59、test-77 通过。未发布。

## 2026-10-11 本地 0.133.0：舞台与迪厅命名

- 滑板装备名改为「霓虹巡演」，装备目录、商店、测试装备与强化状态随名称同步显示。
- 四种英文特技浮字改为 NEON 720!、DISCO KICKFLIP!、BACKBEAT HEELFLIP!、ENCORE VARIAL!，对应旋板、正翻板、反翻板和旋转翻板。沿用现有动作与数值。
- 更新已有浮字断言，语法检查与完整回归通过。未发布。

## 2026-10-11 本地 0.132.0：首次输入滑行与命中型特技

- 滑板装备后保持静止，首次键盘或摇杆方向输入直接按该方向启动持续滑行；下降、落地、战斗和生存开场统一使用滑板移动，松手、过层及受击不重置启动状态，重新装备鞋子重置。解决开场几秒使用普通行走的问题。
- 移速加成 +30%～42%（原 +16%～24%），转向 612°/秒（原 720°/秒），保留急转减速与边缘反弹。
- 激光只在 firing 且 beamHits 时触发，地面圆形攻击只在 1.1<t<1.5 且距离<33 时触发；预警和额外接近范围均不触发。实际伤害入口仍先开特技保护，遵守 1.5 秒 CD；其他危险源维持接近触发。
- npm run check 与完整 npm test 通过。test-132 覆盖启动/松手/状态切换、键盘/摇杆、激光及圆形攻击预警与近距离排除、激活瞬间脚下命中保护和 CD。渲染使用 mock，本轮未做浏览器手感验收。未发布。

## 2026-10-11 本地 0.131.0：英文特技、1.5 秒 CD 圆环与提速

- 特技浮字改为英文：720 SHOVE-IT!、DOUBLE KICKFLIP!、DOUBLE HEELFLIP!、VARIAL FLIP!，对应四种现有动作。
- 特技新增固定 1.5 秒 CD，从起跳开始按真实时间计时；触发入口、接近检测和伤害兜底均遵守 CD，不因受击清空奖励而重置。0.5 秒特技无敌结束后 CD 仍需等待。CD 内新遇到的危险保留待触发，CD 到期仍在附近时可开特技；同源已经保护过且一直贴近仍不重复。暂停/商店冻结，换鞋/过层/重开清除。
- 角色右侧新增屏幕空间 SVG 圆环，显示剩余秒数与恢复进度，满环显示就绪勾；随人物及跳跃位置投影移动，保持正圆。换下滑板或死亡隐藏。
- 滑板移速加成从 +8%～16% 提至 +16%～24%（各品质 +8 个百分点），保留急转自动减速、720°/秒转向与现有慢镜头。
- 新增 test-131 验证 CD 触发/伤害入口/受击不绕过、冷却结束处理待触发危险、真实时间/商店/换装、圆环结构/隐藏、英文和品质速度；更新现有滑板测试。本地浏览器检查英文浮字与角色右侧圆环，截图 tests/skateboard-cooldown.png。npm run check、完整 npm test 通过。未发布。

## 2026-10-11 本地 0.130.0：接近危险自动特技、多动作与慢镜头

- 用户接受调低后的数值：滑板移速 +8%～16%，急转最多自动降至直行速度的 50%，转向仍为 720°/秒。保留持续滑行与边缘反弹。
- 关闭子弹擦弹奖励判定，改成接近危险源自动特技。子弹、敌人、导弹、陷阱、锯/飞轮、炮台、激光束及 BOSS 地板攻击均检测其危险范围外额外 24 世界单位；移动前后检测，伤害路径携带来源作兜底，危险新生成或直接重叠也先触发保护。高速子弹扫掠检测包含直接碰撞，不要求擦过。
- 每个特技只加一次原攻速叠层（每层 +5%～9%、上限 5 层、持续 4 秒并刷新），同源持续贴近不重复，离开范围后重新进入可触发。陷阱/激光/BOSS 地板从预警变为攻击时使用新的阶段标识，以免预警起跳结束后实际攻击毫无保护。空中遇到其他危险已有保护，不叠加启动动画。
- 特技依序轮换 720°旋板、双翻板、反向翻板、旋转翻板；分别为两周水平转、两周纵向翻、反向两周翻加一周水平转、一周翻加一周水平转。模型与发光点的坐标/法线同步变换，人物不跟板翻转。跳高由 72 翻倍至 144 单位；0.5 秒全程无敌，起跳后 0.18 秒世界以 55% 速度运行，特技动画与无敌按真实时间计时。
- 卡片/HUD/浮字更新为自动特技文案；换鞋、过层、结算、重开清除保护、慢镜头及奖励。新增 test-130 验证脚下直接生成陷阱与子弹、阶段激活、危险范围/重入、各类危险、慢镜头与真实计时、双倍跳高、四种不同动作、单次奖励及换装/重开。旧滑板测试按新行为更新。
- npm run check、完整 npm test 及增加炮台接近覆盖后的 test-130 通过；本地浏览器检查双翻板与更高腾空，截图 tests/skateboard-auto-trick.png。特技预览 /?skateboard&trick&variant=0～3，动态滑行 /?skateboard&ride。仅本地修改，未发布。

## 2026-10-11 本地 0.128.0：高跳与滑板 720° 水平旋转

- 擦弹腾空峰值由 28 提高为 72 世界单位。滑板独立水平旋转两整圈，前后各 8% 动画时间留给起跳/回正，使用平滑插值完成 720°；人物与衣服只腾空轻微俯仰，不跟板旋转。空中滑板与脚下分离 10 单位，并增加彩色旋转弧形拖尾，顶视角更明显；落地恢复原滑行朝向。
- 浮字更新为“720°旋板！”，高度提高以避开高跳角色；装备卡描述同步。保留 0.5 秒动画、0.35 秒无敌、攻速叠层和滑行/地板碰撞规则。
- 新增 test-128 验证 72 单位峰值、两圈角度、实际顶点水平旋转、人物独立、脚下分离、全动画有限值与落地回正。npm run check、完整 npm test（含 test-125/127/128）通过。本地浏览器检查高跳、旋板与浮字显示，截图 tests/skateboard-spin.png；预览 /?skateboard&trick；未发布。

## 2026-10-11 本地 0.127.0：滑板流光与豚跳擦弹特技

- 滑板由七段离散变色改成 28 段空间/时间连续插值的彩虹流光，边缘同步流动，并有三道亮光从尾向头掠过；沿用自发光轮架和轮子。
- 成功擦弹保留攻速叠层，并触发“豚跳！”世界坐标浮字：人物、手持武器、衣服、滑板一起腾空，滑板翘头后落回，0.5 秒动画、最大抬升 28 世界单位；血条随腾空升高、地面阴影保留。特技浮字白青发光、粉色光晕，与现金/暴击浮字共用有上限的生命周期。
- 擦弹后额外获得 0.35 秒独立特技无敌，所有 hurt 路径均保护生命与护盾，期间不记受击；不用受击无敌计时，因此不触发闪烁隐藏动画。无敌期间不能再次擦弹叠层/重启特技。到期恢复伤害，换鞋、过层/结算/重开立即清除特技与无敌。动画不改变真实二维坐标或滑行速度，不能跨越缺口。
- test-125 更新连续擦弹测试的时间间隔；新增 test-127 验证实际子弹擦弹触发、浮字及投影样式、无敌保护/禁止连锁/到期、实际腾空几何与回落、连续流光变化、换装/过层/结算/重开/商店及卡片时长。npm run check、完整 npm test 通过，本地浏览器检查豚跳浮字和腾空显示；未发布。
- 本地静态特技预览 /?skateboard&trick，动态滑行 /?skateboard&ride；截图 tests/skateboard-trick.png。

## 2026-10-11 本地 0.126.0：增强滑板转向

- 按用户体验反馈，转向从 180°/秒提高到 720°/秒（四倍），90° 约 0.125 秒、掉头约 0.25 秒，保留有限转向、持续滑行及边缘反弹。缩小转弯半径，缓解少格子场地反复撞边问题；卡片同步更新。
- test-125 更新角速度与卡片验证，增加初始九格、距边缘 20 单位的 90° 转弯验证，确认及时转向而不反弹。npm run check、test-125 通过。未发布。

## 2026-10-11 本地 0.125.0：炫彩滑板与擦弹攻速

- 鞋子新增 skateboard / 滑板，盲盒和装备测试可获取。普通至传奇移速 +20%～32%，保留 ±15% 浮动；作战/生存/入场时持续滑行，松开方向不停止，输入控制目标方向，最大转向 180°/秒，掉头至少 1 秒。碰地板边缘反弹；移动按小步检查地板，避免大帧跨越缺口。暂停、商店及结算停止推进。装备滑板时黑色风衣不触发静止慢动作。
- 敌方子弹（含炮台弹）擦弹：角色与子弹相对运动的线段最近距离，在原碰撞半径外 14 世界单位内经过并安全离开后触发；不包含激光束、敌方导弹或场地陷阱。同弹终生一次，直接碰撞/无敌期间不奖励，进入后被命中不奖励。滑板使用扫掠子弹碰撞，避免快速弹穿过角色后误计擦弹。
- 每次擦弹叠 1 层主武器/无人机攻速，普通至传奇每层 +5%～9%，最多 5 层，4 秒后整体到期，擦弹刷新时长；与翎羽攻速相加。受击（包括盾）、换鞋、新楼层/结算/重开清空；奖励机制不随机浮动。HUD、提示和卡片显示真实奖励及代价。滑行实际位移继续触发蜜蜂枪移动放蜂。
- 人物脚下新增程序化滑板模型，随滑行朝向旋转，七色自发光板面循环变色、青粉发光边缘、两端翘板、发光轮架与四个圆柱轮子；擦弹充能白青提亮。用户要求炫彩自发光，已取代初版暗色板面。独立于环境灯光，不引入图片依赖。
- 新增 test-125 覆盖品质、持续滑行、转向、反弹/缺口、减速组合、慢动作互斥、擦弹扫掠/同弹去重/直接命中/无敌/上限/刷新/到期、受击与换装/结算/重开、实际主武器/无人机输出提升、蜜蜂与翎羽配合、获取/卡片及模型有限值。npm run check 与完整 npm test 通过；模型在本地浏览器检查，非手机操作手感验收。未发布。
- 本地模型预览：node tests/preview-equipment.mjs，/?skateboard 静态，/?skateboard&ride 动态。截图 tests/skateboard-preview.png。

## 2026-10-11 本地 0.124.0：巴雷特重型狙击枪

- 新增 barrett / 巴雷特，普通品质单发伤害 30、间隔 1.4 秒、弹速 1800、单发单目标，保留狙击枪 35% 暴击率和 2.5 倍暴击倍率。基础 DPS 21.43，对比狙击枪 12.94 提升约 65.6%；品质同比放大伤害，以慢速重弹与高单体持续输出定位 BOSS 战。保持最近目标自动瞄准与炮台排除规则。
- 主武器装备时固定降低玩家移速 25%，与护甲减速乘算，鞋子/护甲移速加成和永久升级保留；换下立即解除，重开恢复。随机浮动与品质不改变减速。属性卡独有效果明确展示负面代价。
- 沿现有目录加入主武器与对应无人机盲盒/装备测试；无人机伤害沿用 65% 系数，无人机不会降低玩家移速。增加更长更粗的重型枪身、枪口制退器、弹匣、狙击镜、重弹拖尾及低沉枪声。
- 新增 test-124 覆盖全品质 DPS/间隔、实战持续输出、BOSS 普通/暴击伤害与击杀结算、实际移动/叠加/换装/重开、浮动减速固定、暴击快照、获取/卡片与 mock 渲染；同步目录回归。
- npm run check、全部 npm test 通过。仅本地开发，未发布；渲染检查使用 mock，未做浏览器视觉验收。


## 2026-10-11 本地 0.123.0：双手乌兹枪

- 新增 uzi / 双手乌兹枪，按现有目录规则加入主武器及对应无人机的盲盒、装备测试与属性卡。每次开火按发射者距离选最近的两个可攻击目标，两枪分别瞄准；只有一个目标时双枪集中射击，无目标时不自动开火。继承现有敌人/可拦截飞弹目标规则，排除死亡目标、无敌目标及陷阱炮台。
- 普通品质每枪单发伤害 0.38、射击间隔 0.065 秒、弹速 900，每轮两发；品质提升伤害，沿用属性浮动、攻速和暴击快照。双枪独立朝向模型与弹丸共用索敌/手部位置计算，保持全场攻击覆盖。
- 新增 test-123 覆盖最近两目标、单目标集火、死亡重选、炮台排除、无目标、实际命中伤害、品质、暴击快照、获取与 mock 渲染；更新目录回归。
- npm run check、全部 npm test 通过。仅本地修改，未发布；渲染检查使用 mock，未做浏览器视觉验收。


## 2026-10-11 本地 0.122.0：装备卡片与特殊效果文案

- 护甲仅以生命上限、护盾上限进行属性对比，零加成也显示；受击无敌时间和其他独有效果使用卡片属性下方的文字段落。鞋子的受击无敌与功能效果也移入该区域，武器描述移到属性下方，标题下面不再重复详细描述。效果数值按实际装备（包括随机浮动）生成。
- 单件卡片居中，宽度等于双件对比的一张卡，按同一间距公式适配窄屏。本地浏览器实测单卡和双卡单张宽度均为 178.5px，并检查文字排版。
- 所有场地负面效果以“-”开头，明确炮塔向玩家射击、陷阱伤害玩家；移动减速与生命受伤增加同样按玩家视角描述。增加仅本地预览的 penalties 参数。
- npm run check、全部 npm test（含新增 test-122 卡片结构与实际数值回归）通过。截图位于 tests/armor-single-card.png 与 tests/equipment-penalties.png；未发布。


## 2026-10-11 本地 0.121.0：删除暴击护甲，纯净铠甲改名杀毒工装

- 删除 critical / 暴击护甲的装备目录和专属创建逻辑，盲盒及测试列表不再提供；通用暴击系统及现有衣服的暴击属性保留。狙击枪描述推荐更新为伏击斗篷。
- purity 纯净铠甲改为杀毒工装，保留每层结束清理一个负面设施的效果，衣服总数为 12。
- 旧暴击系统/剑暴击回归改用伏击斗篷，按其实际属性更新伤害与快照期望；目录及清理测试补充删除检查和新名称验证。npm run check、全部 npm test 通过。
- 未发布，未生成本版交付包；未做实机视觉验收。


## 2026-10-11 本地 0.120.0：回收铠甲改名拾荒风衣

- salvage 回收铠甲改名拾荒风衣，拾取半径 +1 格、加速吸附及拾钞回血效果保留。统一装备目录更新名称。
- npm run check、相关 test-106 通过。未发布，未生成本版交付包。


## 2026-10-11 本地 0.119.0：灼环护甲改名蓝焰卫衣

- aura 灼环护甲改名蓝焰卫衣，属性与原光环效果保留，仅变更统一装备目录名称。
- npm run check、相关 test-78 通过。未发布，未生成本版交付包。


## 2026-10-11 本地 0.118.0：恢复型衣服改名暗红西装

- renewal 黑鸦大衣改为暗红西装，保留医疗包回复 2 格与作战每 15 秒自愈 1 格及全部基础属性。统一装备目录、展示名称断言同步。
- npm run check、相关 test-109 通过。仅改名，未发布，未生成本版交付包。


## 2026-10-11 本地 0.117.0：现代衣服命名调整

- falcon 游隼羽衣 → 游隼冲锋衣；wine 红酒西装 → 夜宴礼服；renewal 复苏铠甲 → 黑鸦大衣。属性及内部 ID 不变，装备卡、盲盒揭晓、测试列表通过统一装备目录显示新名，名称断言同步。
- npm run check、相关 test-109、test-110、test-111 通过。仅改名，未发布，未生成本版交付包。


## 2026-10-11 本地 0.116.0：防御衣服再次改名

- shell 忧郁防弹衣改为防弹毛衣，energy 解离衬衫改为琉璃铁布衫；狂笑西服保留。属性及内部 ID 不变，展示及名称断言同步。
- npm run check、相关 test-105 通过。仅改名，未发布，未生成本版交付包。


## 2026-10-11 本地 0.115.0：衣服命名风格调整

- 按用户命名：shell 壁垒重甲 → 忧郁防弹衣；energy 能量铠甲 → 解离衬衫；greed 贪婪铠甲 → 狂笑西服。内部 ID 与全部属性保留，盲盒揭晓、装备卡和测试面板从同一列表取新名称。
- 名称展示断言同步更新。npm run check 与相关 test-105、test-107、test-63 通过。本次仅改名，未重复完整战斗回归；未发布，未生成本版交付包。


## 2026-10-11 本地 0.114.0：翎羽天衣与无伤攻速叠层

- 新增 plume / 翎羽天衣：全层穿着且没有有效受击地通关，叠加 1 层攻速，每层 +10%，上限 5 层 / +50%。普通层、BOSS 层、生存层都在 beginStageClear 同一入口结算，只触发一次。普通至传奇及盲盒浮动不改变叠层规则，品质提升基础防御。
- 每层 startWave/startSurvival 重置受击与穿戴资格。hurt 成功执行时记录受击，包括护盾吸收；受击无敌期间被挡下的 hurt 不算。回血不能恢复本层无伤资格，战斗/入场期间换铠甲会取消本层叠层资格，避免末尾换装获奖。
- 层数保存在本局玩家状态中，受击不清层；换下失去加成，重新装备或更换品质保留本局层数，重开清零。
- 攻速加成加快主武器和无人机冷却推进，包括电锯和飞剑；旋星持续接触伤害间隔也对应缩短。射击/刺击动画、弹丸飞行、蜜蜂按移动距离产出与护甲恢复时间不被加速。武器属性卡攻速显示实际加成，升级栏及铠甲卡显示层数/上限/当前攻速。
- 新增 test-114 验证叠层上限、有效受击/护盾/回血/无敌、实际 BOSS/生存结算、重复触发/末尾换装、跨品质保留/换下停用、实际主武器与无人机发射次数、锯/飞剑/旋星频率、卡片/盲盒/测试面板/重开。npm run check、全部 npm test 通过。
- 未发布，未生成本版交付包；渲染回归使用 mock，未做实机视觉验收。


## 2026-10-11 本地 0.113.0：伏击斗篷增加暴击伤害

- 伏击斗篷新增 critDamageBonus，普通至传奇 +0.3～0.5 倍，每品质 +0.05 倍；与武器本身暴击倍率相加，主武器和无人机均生效。例如普通狙击枪 2.5 倍变为配普通斗篷 2.8 倍，配传奇斗篷 3.0 倍。
- 保留暴击率 +25～45 个百分点、固定 15% 减速、零防御加成。暴击伤害加成沿用盲盒 ±15% 浮动，装备卡已有对应属性行，说明更新。
- test-112 更新全品质主武器/无人机倍率、浮动范围、实际狙击命中伤害（普通狙击枪配普通斗篷暴击 30.8）、空中弹丸倍率快照与换装解除、卡片展示。npm run check、全部 npm test 通过。
- 未发布，未生成本版交付包；未做实机视觉验收。


## 2026-10-11 本地 0.112.0：伏击斗篷

- 新增 ambush / 伏击斗篷：普通至传奇暴击率 +25～45 个百分点，每品质 +5 个百分点；主武器与无人机均生效。不加暴击伤害、不附带吸血，以暴击率为主要收益。
- 代价：固定移速降低 15%，所有品质生命/护盾容量/受击无敌加成都为 0，保留角色基础防御。减速与鞋子及永久移速按现有公式叠加；换装即时解除减速及新攻击暴击加成，已发射弹丸保留暴击快照，防御上限按换装规则钳制且不免费补血盾。
- 暴击率保留 ±15% 盲盒浮动，减速和零防御固定。装备卡、盲盒、测试装备列表加入斗篷。
- 新增 test-112 覆盖品质属性/随机范围、实际移速与鞋子叠加、同随机数狙击命中暴击差异、无吸血、防御钳制/不补血盾、弹丸快照、换装/重开、展示/获取。原全铠甲容量测试允许斗篷零加成。
- npm run check、全部 npm test 通过。未发布，未生成本版交付包；未做实机视觉验收。


## 2026-10-11 本地 0.111.0：红酒西装

- 新增 wine / 红酒西装：普通至传奇暴击率 +10～18 个百分点，每品质 +2 个百分点；主武器与无人机均受益。每次实际暴击命中独立以 20% 概率回复 1 格生命，不超过生命上限，满血不触发；不增加护盾。
- 沿共享伤害命中路径触发，包括穿透/范围/无人机、蜜蜂移动奖励蜂和致死/BOSS 暴击；命中去重保留，显示“吸血 +1”与酒红色粒子。炮台不可攻击，不能触发吸血。吸血依据命中时穿着的铠甲，换下红酒西装立即停止吸血；暴击率仍按原弹丸发射快照规则。
- 保留偏输出铠甲的基础生命和少量无敌时间，护盾容量只 +1。暴击率有现有 ±15% 盲盒浮动，吸血概率/回复量固定。属性卡、盲盒及测试装备列表更新。
- 新增 test-111 验证品质暴击、独立概率成功/失败、普通命中不吸血、满血/上限、无人机/范围/实际狙击/移动蜜蜂、致死/BOSS 结算、不重复、炮台防护、换装与获取/展示/重开。
- npm run check、全部 npm test 通过。未发布，未生成本版交付包；未做实机视觉验收。


## 2026-10-11 本地 0.110.0：游隼羽衣

- 新增 falcon / 游隼羽衣，普通至传奇移速 +30%～50%（每品质 +5 个百分点）、暴击率 +5～9 个百分点（每品质 +1 个百分点）。主武器与无人机共用暴击加成，不额外加暴击伤害；适合狙击走位与蜜蜂枪移动产蜂，不限制武器搭配。
- 防御代价：所有品质生命上限加成、护盾容量加成与受击无敌加成都为 0，保留角色基础生命/护盾/无敌时间。防御铠甲换成羽衣按现有换装规则钳制超出的生命与护盾，换回不免费补充。
- 铠甲与鞋子的移速加成相加，再乘永久移速升级与重甲减速。羽衣移速和暴击加成保留盲盒 ±15% 浮动；防御不随随机浮动补回。装备卡显示移速、暴击及薄弱防御说明，盲盒/测试装备列表加入羽衣。
- 新增 test-110：各品质及随机属性边界、实际移动、实际狙击暴击、等时移动更多蜜蜂及主武器/无人机暴击、鞋子叠加、换装上限/无免费补血盾、获取/展示/重开。原全铠甲容量测试允许羽衣的零加成。
- npm run check、全部 npm test 通过。未发布，未生成本版交付包；渲染回归使用 mock，未做实机视觉验收。


## 2026-10-11 本地 0.109.0：复苏铠甲

- 新增 renewal / 复苏铠甲：吃下医疗包回复 2 格生命，作战（combat/survival）累计每 15 秒自愈 1 格，全部回复不超过生命上限。磁吸医疗包仍在到达玩家后才回复；金钱和护盾补给不触发此效果。
- 满血时清空自愈积攒，暂停/商店/下坠/过层等非作战阶段不推进自愈计时。换铠甲重置 regenCharge，重新装备需要完整计时，不补血；重开随玩家状态清理。大步长按完整周期结算。
- 品质提升基础防御；医疗回复量、自愈量和 15 秒间隔固定，不参与属性随机浮动。属性卡、盲盒与测试装备列表已更新。
- 新增 test-109 覆盖全品质医疗回复/上限、吸附到达时机、自动周期回复/满血不积攒、多周期大步长、非作战/暂停、换装/重开及展示/获取。npm run check、全部 npm test 通过。
- 未发布，未生成本版交付包；未做实机视觉验收。


## 2026-10-11 本地 0.108.0：纯净铠甲与炮台不可摧毁修正

- 新增 purity / 纯净铠甲，每层结束时清理最近的一个永久危险源（陷阱、锯齿、环绕锯、飞轮或炮台），保留地板和补给。复用 eraseNegative，忽略临时炮台；没有危险源时不储存次数。通关转换处触发，普通/BOSS/生存层均生效且不重复，商店换装不追溯本层。
- 激光炮台此前残留在自动瞄准、连锁、蜜蜂/飞弹追踪、剑/无人机/光环及共享伤害目标中，并带血条。现在机枪/激光炮台统一 invulnerable、无 hp/max，不进入 combatTargets；共享伤害另用 isAttackable 拒绝显式/遗留炮台目标，飞弹遇到旧炮台目标重选。
- 移除炮台受击闪光、血条和按 hp 过滤删除；手持武器及无人机模型朝向使用可攻击目标。炮台滑行、预警和攻击保留，拆除危险源/纯净铠甲仍可按场地规则移除；生存临时炮台按原流程退场。
- AGENTS.md 固化用户的炮台不可攻击摧毁要求。旧飞剑/命中反馈测试同步调整；新增 test-108 验证各种危险源的一次清理、实际 BOSS/生存结算、空层/重复/换装、所有可获得武器和无人机不摧毁炮台、旧显式命中及追踪防护、炮台正常攻击、装备卡/盲盒/测试列表。
- npm run check 与全部 npm test 通过。未发布，未生成本版交付包；渲染回归使用 mock，未做实机视觉验收。


## 2026-10-11 本地 0.107.0：贪婪铠甲

- 新增 greed / 贪婪铠甲，盲盒及测试装备均可获取。周围欧氏距离 1 格内的印钞格生产速度 ×2，与催化靴乘算；医疗、护盾生产不受此铠甲影响。新增金色范围圈。
- 金钱获得倍率固定 ×2，涵盖地板钞票、击杀和生存过关奖金。gainCash 返回实际收益，金钱浮字及生存奖金提示显示实得金额。
- 生命受伤固定 ×2；护盾仍只扣 1 格并完全挡住该次攻击，不穿透、不额外扣血，受击无敌规则保留。生命扣到零触发死亡，换装或重开解除加成和代价。
- 品质提升基础生命、护盾与无敌时间；生产倍率、半径、收益倍率与伤害倍率固定，不参与随机浮动。属性卡展示全部倍率与范围。
- 新增 test-107 验证实际印钞生产、范围/移动/催化叠加、拾钞/击杀/过关收益、各品质真实伤害及护盾、无敌、换装、重开、盲盒、测试装备与渲染。npm run check 和全部 npm test 通过。
- 未发布，未生成本版交付包；渲染测试使用 mock，未做实机视觉验收。


## 2026-10-11 本地 0.106.0：回收铠甲与加速吸附

- 回收护甲改称回收铠甲，新增固定拾取半径 +1 格（TILE），与磁吸靴半径叠加，装备卡显示加成。原地板钞票回血 1 格 / 8 秒冷却保留，吃下钞票时才触发。
- 扩大拾取范围由瞬间领取改为实际吸附：医疗包、护盾和地板钞票进入范围后，从地板位置以初速 80、加速度 1600、上限 1000 世界单位/秒追向玩家，接触后领取。锁定后离开范围或换装仍继续跟随；生产格在吃下前保留一个补给，吃下后重新生产。
- 补给模型随实际位置移动，地板生产扫描保持原位置。近距离原接触拾取保留。满盾不启动护盾吸附，飞行途中满盾则保留补给直到有容量。
- test-77 更新磁吸靴领取时机；新增 test-106 覆盖范围叠加、加速、移动目标及换装、到达结算/回血、满盾保留、渲染位置、不同步长一致性、商店冻结和重开清理。
- npm run check、全部 npm test 通过；未发布，未生成本版交付包。模型位置验证使用 mock 渲染，未做实机动态视觉验收。


## 2026-10-11 本地 0.105.0：生存铠甲调整

- 堡垒护甲改为壁垒重甲，保留按品质增加的生命与护盾容量，新增固定 20% 移速降低；与鞋子及永久移速加成乘算，换下即解除。装备卡展示减速。
- 相位护甲与蓄能护甲合并为能量铠甲（energy），旧 phase/capacitor 从盲盒和测试装备列表移除。受击无敌加成由普通 +0.8 秒至传奇 +2.0 秒，不含鞋子的总时长为 2.3～3.5 秒；每 16～10 秒恢复一格护盾，保留品质及随机属性浮动、容量限制、商店停止充能和换装不补血补盾规则。
- 缓时铠甲改名黑色风衣，原静止 8% 世界速度机制保留。回收护甲、灼环护甲及暴击护甲保留。
- 旧装备相关回归与预览使用 energy。新增 test-105 验证全品质重甲减速、移速叠加与换装解除、能量铠甲实际受击无敌与充能、装备卡及盲盒名单。
- npm run check、全部 npm test 通过。未发布，未生成本版交付包；渲染回归使用 mock，未做实机视觉验收。


## 2026-10-10 本地 0.104.0：剑停火与飞弹无爆炸消失修复

- 已复现：剑气复用 crescent 碰撞类型，命中存活追逐敌人后调用击退，但剑气没有 knockback；敌人速度及坐标变为 NaN，后续自动瞄准、剑角度和飞弹曲线随之失效。
- pushMeleeEnemy 仅对有限且大于零的 knockback 执行击退。剑气正常伤害且不附加击退，原月牙波击退保留。
- test-104 在修复前因敌人坐标非有限而失败，修复后通过。覆盖手持剑、飞弹 + 剑无人机、剑 + 飞弹无人机，各在 10/16/33ms 步长下连续战斗 8 秒，验证持续攻击、近远敌人伤害、有限坐标/剑角度和飞弹正常爆炸。
- npm run check、全部 npm test 通过；0.104.0 Web/离线包已生成并校验。本项未发布，渲染测试使用 mock，未做实机视觉验收。


## 2026-10-10 16:54 发布：彩虹瀑布与悬浮心电图

- 当前本地 0.100.0 已发布到原公开站点 https://hell-elevator.wzyanggg.chatgpt.site，保留 public 访问。
- Sites 保存版本 85，源码提交 b224acb23d66569b52b37ca156d848970caa71ac；版本 ID appgprj_6ac74d5c19748191bc27adbcb8926213~appgver_8b9b01d02f8c8191b249f7dc6b7c9c84。
- 部署 ID appgdep_6ac9fd2995408191b53e9e528432af6c，返回 succeeded。发布 checkout 的 npm run check、全部 npm test 通过；包含当前点阵叠加彩虹瀑布、抬高楼层数字和音乐能量驱动悬浮心电图/渐隐光墙。
- 该发布结果记录仅写入本地开发交接文件，源提交为发布前验证的快照。

## 2026-10-10 本地背景：彩虹光瀑

- 最新真实频谱/整体配色修正：移除固定心电图形状，24 个真实 FFT 对数频段分别控制左右各 12 个折点的正负振幅，端点回到基线；已有频段平滑保留，高频适度补偿，静音平线，时间不制造虚假峰值。计数与频谱统一高度 280、前移投影平面，取消后墙独立计数盒体，改为共同低位投射底座、横向渐隐光墙及中央透明计数底板，连接成完整控制台。
- 瀑布使用与头灯相同的 12 秒主色相周期；重叠光流的头尾与各条颜色仅在主色附近偏移，保留高亮覆盖、独立快落及横向重叠。test-55 验证瀑布与头灯色相相近、单低频/高频只改变对应折点、时间不伪造形状、静音平线及投影透明渐隐。npm run check、全部 npm test 通过，浏览器音乐播放观察真实变化且无警告/错误。

- 最新叠加与投影改版：楼层显示由高度 54 抬至 280，数字横向 1.8 倍、纵向 2.8 倍；移除两侧实体小屏，在其下方的前移空间设置双侧悬浮心电图和低位投射器，透明光墙横向铺开、上下及两端渐隐。波形改为每侧 16 个明确折点、直线连接，按真实音乐频段能量的平滑包络改变振幅（22→140）与光晕，避免原始时域波形碎抖；缓慢呼吸而非逐帧换形。
- 后墙瀑布长度增至 960–1440、速度增至 640–1020；七条矩形光流在横向缓慢移位且宽度互相重叠，合成明亮彩虹底光，头尾色相差扩大并保留各自时间变色周期。沿真实光流边界切分，持续保持细 LED 点阵与地板下方覆盖，无固定泳道或大面积黑底。检查与全部回归通过；新增检查验证叠加、跨列、背景最低亮度、渐隐透明光墙、高潮放大及平滑音乐包络。浏览器实际音乐播放验证安静/强段和真实透明投影，无警告/错误。未做手机性能验收，未发布。以下内容为历史迭代。

- 中央楼层计数两侧新增心电图/示波器式电波屏，替换原水平彩灯条；左青绿、右冰蓝连续细线带暗色外沿，读取 BGM analyser 的真实时域采样（96 点峰值保留），音乐停止/静音/上下文挂起时为水平线。保留中央楼层数字和细点阵光瀑。test-62 覆盖正负波形、静音及缺失分析器；test-55 验证两侧实际波形几何、避开计数和屏幕范围。npm run check、全部 npm test 通过，新增针对性检查通过。浏览器实际播放音乐验证动态电波，未记录警告/错误；未发布。

- 最新节奏修正：七条光带分别以 280/410/325/470/360/300/440 世界单位/秒下落，约原速的 1.9–3.2 倍；采用不等起始位置和不同长度，打破斜阶梯齐步循环。每条独立以 4.1–7.1 秒周期持续变色，保留异色渐淡拖尾及细点阵。渲染边界和颜色计算共用对应列参数，避免色带头部错位。npm run check、全部 npm test 通过；浏览器无警告/错误。未发布。

- 最新渐变修正：保留七列笔直矩形光带，改为亮色头部 → 异色渐暗尾部，尾端接近黑底（如黄色头部拖红色尾部）；各列错峰循环下落，色相按 14 秒周期变化。LED 点距由 10×18 缩至 5×9，每轴点数翻倍、总密度约四倍；保持连续上下覆盖。按头部边界切分并以 8 世界单位纵向插值，避免回卷接缝被混成极光。test-55 覆盖下落相位、头尾亮度及色相差异、随时间变色和连续覆盖；npm run check、全部 npm test 通过。浏览器复核细点阵/渐变拖尾正常，无警告或错误。未发布。下列纯色矩形及极光记录为历史迭代。

- 最新样式按用户修正为银行门口显示屏式圆点 LED 阵列：七色硬边矩形，120 世界单位高的色块行正反交替、以 145 单位/秒向下滚动；连续铺满相机可见后墙，去掉原柔和极光渐变和面板之间的大黑带。音乐控制亮度，保留上下背景覆盖及场景灯光。LED 圆点在片元着色器生成，无需逐点增加网格；直接 RGB 颜色不进入缓存。test-55 覆盖平坦矩形、交替色序、横纵密集覆盖及下方实际顶点。检查与全部回归通过，浏览器真实 WebGL 编译及点阵画面复核正常，无警告/错误；未发布。下列渐变条目为此前迭代。

- 后墙柱状频谱替换为同时呈现多种颜色的连续 RGB 渐变光瀑，以 145 世界单位/秒向下流动；音乐真实频段控制各列亮度，静音保留低亮环境流动。保留井道面板位置、现有场景灯光与玩法。
- 每面板固定 28 × 30 网格，顶点渐变直接传 RGB，不把动画颜色写入 renderer.colors 缓存。test-55 新增下落方向、同时 RGB 色相、真实音乐响应、有限几何及颜色缓存上限检查，均通过。
- 本地浏览器已复核多帧渐变画面，未记录警告/错误；未做手机实机性能验收。本项未发布到线上。
- 六点钟黑区修复：旧面板枚举以 -60 为最低高度，漏画俯视相机可见的地板下方井道。现在由相机投影计算后墙可见上下界，补齐负高度面板并剔除屏外上方面板。保留面板间的窄暗色接缝。test-55 覆盖三种视野高度、四种井道滚动位置及实际下方 LED 顶点；npm run check、全部 npm test 通过。浏览器确认地板下方光瀑可见且无警告/错误；未部署。

本地开发版本：第 104 版（0.104.0），BOSS 地板圆圈攻击能量爆发特效；剑横向挥砍与独立剑气判定；暴击属性与暴击护甲、狙击枪暴击定位；蜜蜂枪按移动距离发射奖励蜂；蜜蜂枪及五蜂分散追踪；受击淡青提亮、赛博火花与命中音效；主武器收束为九种并简化名称；敌人受击闪白与模型微震、钞票快速爆出与加强阻尼；飞剑固定悬浮、等待时指向最近敌人及无目标朝下；三才飞剑近战无人机；弦月波发射器与近战击退；无目标飞弹场内巡游；恒速贝塞尔追踪飞弹；寻迹双连飞弹发射器；电锯改为绕玩家旋转及薄机身；裂齿电锯近战无人机；旋星加粗与连续接触伤害；旋星机关枪与任意装备测试面板；静止时 8% 慢动作；火箭筒/回旋十字刃；保留无敌时间说明与零盾槽隐藏；保留停时/灼环护甲与护盾上限；保留创意护甲与鞋子；保留慢速枪提速；保留雷鸣电弧枪与无人机；保留新增步枪、狙击枪与马格南；保留差异化武器与棱镜激光；保留地板受光低饱和；保留减弱场景灯光染色；保留收紧并增强霰弹枪；保留击败 BOSS 立即通关；保留玩家亮黄色子弹；保留盲盒立即付费不可退款与整屏同色灯光；保留精简装备界面；保留关卡结束提示；保留装备单件盲盒与属性浮动；保留真实 BGM 频谱和调整后的商店经济，第 98 版已公开发布。下面的第 58 版 commit 是交接基线。

## 第 100 版本地 BOSS 地板攻击特效

- 保留自发光红色危险圈；预警阶段新增八枚向内收束的红橙刻度。1.1 秒后爆发红橙分段能量柱、两道向外扩散的冲击环、中心高亮和上扬火花，随后收缩消失。
- 效果由 hazard.t 直接驱动，无附加持久粒子或随机绘制状态；随世界慢动作、暂停及关卡清理。所有特效网格自发光，危险圈固定半径 33、伤害仍在 1.1–1.5 秒、1.7 秒清理，保留原攻击玩法。
- npm run check、全部 npm test 通过。test-55 保留两阶段红圈和灯光隔离检查；新增 test-100 验证收束/爆发/变化、自发光/有限且有界网格、原范围与时机、慢动作和关卡结束清理。使用 mock 渲染，本轮尚未浏览器动态视觉验收。
- 本地版本及 Web/离线包为 0.100.0，本项未部署。

## 第 94 版本地赛博命中反馈

- 闪白改为原材质 42% + 淡青高亮 58%（RGB 0.6/0.95/1），保留各部件的颜色差异，避免纯白色块；保持 0.075 秒闪光与 0.14 秒模型微震。
- 共享伤害命中生成青蓝/品红/薄荷色自发光短条、亮点与小光晕，出现在目标模型前侧；寿命 0.12–0.21 秒，快速减速并收缩。普通射击、穿透、范围伤害、无人机均沿共用路径触发，包括致死命中。单目标 0.045 秒节流，全局最多 192 个命中粒子，随世界时间与暂停。
- 新增双层降频电子撞击声（triangle 主层 + square 高频层），持续约 0.04–0.07 秒；按 AudioContext 时间限频 0.045 秒，避免密集命中或慢动作叠音。遵循现有声音开关与音频解锁，结束后释放节点。
- npm run check、npm test 全部通过。test-92 更新为淡青材质验证；test-94 覆盖实际伤害触发火花/音效、材质差异、粒子寿命/上限、有限渲染、声音限频/静音/挂起及节点释放。渲染和音频均使用 mock，尚未做浏览器动态视觉验收或实际试听。
- Web/离线包更新至 0.94.0；未部署，线上仍为 0.93.0。

## 第 92 版本地受击反馈与钞票阻尼

- 所有共享伤害路径命中时刷新 hitAt，敌人模型闪白 0.075 秒、微震 0.14 秒，最大横向位移约 1.7 世界单位。普通敌人、BOSS、可攻击激光炮台与敌方飞弹均覆盖；仅变换模型顶点和附属光晕，不改变碰撞坐标、血条或地面预警。闪白使用自发光白色，不受场景彩灯染色；随世界慢动作和暂停。
- 钞票平面初速 280–480 → 560–840，移动阻尼 8 → 16，旋转阻尼 0.8 → 10；移动与旋转均用指数解析积分，保证不同帧率下一致。数量上限、垂直运动、寿命与奖励保留。
- npm run check、npm test 全部通过；新增 test-92 覆盖共享命中、重复刷新、慢动作、九种模型绘制路径、模型变白与场景隔离、钞票速度/阻尼/帧率一致性及数量上限。渲染测试使用 mock，本轮尚未做浏览器动态视觉验收。
- Web 与离线包更新至 0.92.0；本版本仅本地开发，线上仍为 0.91.0。

## 最新发布记录

- 2026-10-10 已重新公开发布本地 0.90.0 到 https://hell-elevator.wzyanggg.chatgpt.site 。
- Sites 保存版本号 77；source commit 5835b6dc0f91106bfc2de70970f44ac623199541。
- 版本 ID：appgprj_6ac74d5c19748191bc27adbcb8926213~appgver_9d39261b1900819184e0759fbf4b1916。
- 本次重新部署 ID：appgdep_6ac9e32026348191b1637860a4cbc9f4，返回 succeeded，保留 public 访问权限；npm run check 与 npm test 通过。


- 2026-10-10 本地提示器修复：BOSS 圆形地面攻击的预警与爆发阶段统一使用 #ff3030 自发光红色，不受场景灯光染色；保留半径、阶段宽度及伤害时机。npm run check、npm test 通过，test-55 覆盖完整 draw 路径中两阶段与四种灯光时刻的颜色和自发光标记；已随 0.78.0 发布；该预警修复尚未单独进行浏览器视觉验收。

- 2026-10-10 本地暂停调整随 0.77.0 发布：暂停显示居中面板，“继续 ▶”置于“已暂停”下方；暂停期间隐藏右上角暂停按钮。切回游戏仍须手动继续，P 键和重开逻辑保留。npm run check、npm test 以及后台暂停/点击继续/重开检查通过；尚未进行浏览器视觉验收。

- 2026-10-10 已公开发布本地 0.98.0 到 https://hell-elevator.wzyanggg.chatgpt.site 。
- Sites 保存版本号 83（与本地迭代版号 98 独立），source commit 5835b6dc0f91106bfc2de70970f44ac623199541。
- 版本 ID：appgprj_6ac74d5c19748191bc27adbcb8926213~appgver_9d39261b1900819184e0759fbf4b1916。
- 部署 ID：appgdep_6ac9f58086788191b5c289eb8e531509，返回 succeeded，保留 public 访问权限。
- Windows 打包需要 Git Bash 加入进程 PATH，并设 TAR_OPTIONS=--force-local，避免盘符被 GNU tar 误作远程主机。
- 发布 checkout 位于 ../publish-checkout，保留站点源仓库历史；日常开发仍使用本目录。源仓库提交不包含部署完成后的本段记录。

## Web 与离线交付包

- tools/package-offline.py 从当前 dist 生成 releases/hell-elevator-0.98.0-web.zip（标准静态网页资源、约 4 MB）及 hell-elevator-0.98.0-offline.zip（内嵌 JS/CSS/MP3 的 game.html 和说明）。
- Web 包可上传任意兼容静态托管，保留 audio 相对目录；离线包用于电脑解压后由 Chrome/Edge 打开。移动系统文件预览器兼容性未验证。
- 已校验 ZIP 完整性、Web 每个文件与 dist 字节一致、离线音频内嵌字节一致且无外置 JS/CSS。当前浏览器工具禁止 file 协议，未完成直接 file 打开验证，不绕过浏览器限制。
- 生成命令：python tools/package-offline.py。本地交付包不包含 Sites 身份配置、凭据或开发测试。

## 第 88 版恒速贝塞尔追踪

- 删除距目标 120 内降低速度的逻辑。追踪阶段使用三次贝塞尔路径：起点与当前切线、终点与目标位置、背后目标加入侧向控制点避开直线折返尖点。
- 48 段弧长表按 speed × dt 推进；目标移动超过 8 单位或死亡换目标时重建路径，保持当前位置及前进切线。曲线控制点限制在地图内。
- 碰撞检测覆盖这一帧经过的所有路径段，防止曲线扫过敌人但仅检测端点连线漏判。
- test-87 检查远近区域均保持 450 速度和每帧弧长、近处/身后/侧面及移动敌人击杀、重规划恒速及曲线扫掠判定；原两发朝上、延迟追踪、边缘及 BOSS 结算回归保留。

- npm run check 与全部回归通过，Web/离线包为 0.88.0；本轮未进行浏览器动态视觉复核。

## 第 86 版寻迹飞弹发射器

- 寻迹飞弹发射器普通伤害 3.8，间隔 0.8 秒，每轮朝 12 点方向两发连射，发间隔 0.09 秒；每发飞行 0.18 秒后追踪最近可攻击目标，目标死亡后重新选择。速度 450、转向限制 12 rad/s，贴近目标减速，寿命 4 秒。
- 命中半径 55 小范围爆炸，沿用共用伤害与 BOSS 结束结算。靠上边缘发射保持在地图内，追踪后仍能击中下方敌人，避免主武器死角。
- 第二发延时发射时取当前玩家/无人机位置，弹体黄白机身与尾焰，主武器双竖管模型；同步新增寻迹无人机与对应盲盒/测试列表。
- test-86 验证向上方向、两发先后时序、第二发跟随发射位置、延迟转向、侧面/上边缘实击杀、目标死亡后重选、BOSS 结算及无人机/装备池。

- npm run check 与全部回归通过；浏览器确认双飞弹及薄电锯模型，无浏览器错误；Web 与离线包为 0.86.0。

## 第 85 版环绕电锯与薄机身

- 电锯位置由玩家坐标 + 半径 80 的圆形轨道计算，角速度 2.4 rad/s，约 2.6 秒一圈。跟随玩家平移，不追敌、不按地图边界压缩轨道。
- 保留轨道接触切割、伤害 CD、无人机专属池与 BOSS 结算；世界慢动作同步减缓公转和锯齿自转。
- 机身厚度 14 → 4，顶部发光板 2 → 0.8，锯齿 3 → 1.2，支架及旋翼同步压薄、降低，保留半径与伤害范围。
- test-84 改为验证完整圆周、跟随移动、远敌不追、边界圆形轨道、持续接触与慢动作、BOSS 奖励。第 84 版追敌描述为历史行为。

## 第 84 版裂齿电锯无人机

- 新增独立 DRONE_TYPES 池，包含原有全部远程无人机与 chainsaw；主武器池不含电锯，测试面板按槽位选择正确池。
- 普通电锯伤害 2.4、间隔 0.16 秒，品质成长为每档 +50%，同款伤害与间隔继续浮动。攻击半径 24，飞行速度 350，主动追最近敌人，可离开已铺设格子，保持在固定地图边界内。
- 接触圆内所有可攻击目标等额持续伤害，远处无伤害；无目标返回玩家附近。圆锯片、14 个旋转齿、悬浮机身与接触火花，沿用共用伤害/BOSS 结算。
- 位置为独立运行状态，换装不污染装备属性；下一层召回。随暂停与缓时护甲的世界时间，商店不行动。
- test-84 验证格子外追敌击杀、接触范围与持续 CD、主/副武器池及测试槽分离、缓时、返回、BOSS 奖励与换层召回。

- npm run check 与全部回归通过；浏览器检查电锯模型、无人机列表与实际领取成功，无浏览器错误。Web/离线包更新为 0.84.0。

## 第 83 版旋星接触判定与加强

- 普通旋星伤害 0.32 → 2.2，伤害 CD 0.12 → 0.06 秒。半宽 1.4 → 6，碰撞半宽同步为 6，保持分叉、旋转速度与品质成长。
- 逐帧发出当前叉线接触检查；每个敌人使用武器实例 WeakMap 保存下次可伤害的世界时刻。接触时立刻伤害、持续接触每 CD 再伤害，转走不造成伤害；同帧多叉不重复伤害，武器与无人机独立。
- 沿用共用伤害路径和 BOSS 奖励，随世界慢动作和暂停；测试验证两个敌人分别进入叉线、普通 B1 杂兵在 10/20/33ms 帧间隔下一次扫过击杀。

- npm run check 与全部回归通过；本地浏览器截图验证弹流宽度，未记录浏览器错误；Web/离线包更新至 0.83.0。

## 第 82 版旋转分叉机关枪与装备测试

- 新增旋星机关枪及旋星无人机；普通到传奇为 3/4/5/6/7 叉，均匀覆盖 360°，每秒旋转 0.75 弧度；亮黄色连续弹流和转轮枪管单独逐帧绘制。普通伤害 0.32，判定间隔 0.12 秒；保留品质成长、浮动和无人机 65% 伤害。
- 伤害沿每根叉线穿过敌人，使用共享命中集合防止一轮多叉重叠重复扣血；遵循世界慢动作、暂停和 BOSS 通关结算。新增武器加入两种盲盒。
- 左下“测试装备”按钮或电脑 F2 打开面板，任选四类装备与五档品质，免费立即换装，支持随机浮动和旋星 2～12 叉测试。菜单领取会开始测试局；面板暂停模拟，返回恢复之前的运行状态，切后台后保持暂停。
- 测试局不更新最高楼层；重开清除测试装备并恢复普通局。装备不额外补血，沿用正常换装规则。
- test-82 验证实际伤害 CD、共享判定、角度与旋转、连续显示、BOSS 结算、所有装备品质领取、免费换装、后台暂停及重开；57/59 的通用发射数量断言覆盖旋星分叉。

- npm run check 与全部回归测试通过；本地浏览器验证任意装备面板领取、默认精良 5 叉和实际分叉渲染；浏览器未记录错误。

## 第 81 版缓时装备

- chrono 护甲改名“缓时铠甲”，静止时世界以 8% 速度继续，移动后恢复正常；撞墙仍算静止。
- 敌人、弹幕、攻击、生产、无敌时间与生存计时均同步减缓；音乐正常播放，关卡结束等待不减速。提示改为“时间减缓”。
- test-78 验证静止时仍推进模拟、8% 弹速与计时、移动恢复正常速度及结束提示时长。

## 第 80 版 AOE 武器

- 轰鸣火箭筒：普通伤害 5.5，间隔 0.8 秒，速度 500；命中最近接触目标爆炸，半径 90 内各目标结算一次（直击不额外叠伤）；地图边缘或寿命结束也爆炸。爆炸不伤害玩家。
- 回旋十字刃：普通伤害 2.2，间隔 0.7 秒，速度 620；飞出约 220 单位或靠近边界后回到当前持有者位置。去程/回程各命中每个目标一次，无限量穿过普通敌群（内部上限 99），回到角色或无人机时消失。
- 同步加入对应无人机与武器盲盒，继承品质成长、浮动与 65% 无人机伤害。亮黄火箭/黄白旋转十字刃、爆炸扩散环；卡片仍只显示攻击力和攻速及攻击方式。
- test-80 检查实际爆炸范围、直击单次结算、BOSS 溅射通关、刀刃两段命中与移动回收、边界转向、无人机快照及盲盒。

## 第 79 版装备文字、盾槽与狙击伤害

- 护甲卡“受击无敌加成”改为“受击无敌时间”，数值显示基础 1.5 秒 + 该护甲 + 当前鞋子的实际总时长；战斗公式未改变，鞋子仍描述其加成。
- 角色血条仅显示已有护盾，零护盾不画盾槽；左上盾值/容量提示和容量限制保留。
- 狙击枪普通单发攻击力 8→11（+37.5%），保持 0.85 秒间隔、单目标和高速弹道；对应无人机/品质成长/盲盒浮动自动继承，UI 不显示 DPS。

## 第 78 版奇异护甲与护盾上限

- 停时铠甲：战斗/耐久关实际无法移动时停止世界模拟；移动恢复，主武器/无人机攻击、生产、敌人、弹幕及耐久倒计时都停止。进场/结束计时不受影响，BGM 保持播放。
- 灼环护甲：半径 1.5–1.9 格每 0.8 秒伤害周围敌人，普通伤害 1.2，品质增长及浮动；共享射击伤害结算与 BOSS 结束/奖金逻辑，范围外不受伤。
- 基础盾容量 2；护甲均增加容量。普通至传奇：堡垒 +2–10，相位 +2–6，蓄能/回收 +2–4，灼环 +1–2，停时 +1。强特效护甲容量较少。
- 蓄盾使用总容量上限；满盾时护盾格保留补给，降容量换装裁去超额盾，不补血/盾。UI 显示当前盾/容量，角色血条绘制空盾槽，卡显示容量加成。保留催化靴。
- test-78 覆盖停时及移动恢复、耐久/结束、容量与换装、地板补给、蓄能、周身伤害和 BOSS 通关。保留此前本地 BOSS 红色自发光预警修复。

## 第 77 版创意护甲与鞋子

- 催化靴：角色半径 1.5 格内，医疗/护盾/印钞格生产速度 +35% 至 +75%（普通至传奇），保留 ±15% 属性浮动；绿色移动光圈与加速格提示。离开或换装立即失效，不修改陷阱速度。
- 磁吸靴：医疗/护盾/钞票拾取半径由 20 提至 55–75 世界单位，保留浮动。
- 蓄能护甲：战斗/耐久关每 16–10 秒补 1 护盾（间隔浮动），当前护盾达到 2 时停止蓄能；护盾格仍可继续叠加。装备时不立即发盾。
- 回收护甲：拾取印钞格的钞票时回复 1 生命，8 秒冷却；换装不能重置冷却，不改变击杀金钱奖励。
- 四种均加入各自单件盲盒，属性卡独立显示机制与对应数值；保留此前本地的居中暂停面板。test-77 覆盖生产范围/换装、真实拾取、蓄能、回血冷却、盲盒与卡片。

## 第 76 版慢速枪提速

- 射击间隔：狙击枪 1.5→0.85 秒，马格南 1.15→0.65 秒，轨道枪 1.05→0.62 秒，电弧枪 0.7→0.5 秒，霰弹枪 0.64→0.5 秒。单发伤害、弹型及特效保留，对应无人机同步提速。
- 品质成长与随机属性仍继承新基础间隔；手枪、步枪、冲锋枪、双联机枪和激光枪不变。
- test-76 以实际战斗循环测量三秒内的主武器/无人机发射次数，检查提速与单发伤害保留；历史测试更新慢速武器相对定位断言。

## 第 75 版电弧枪

- 雷鸣电弧枪普通品质攻击力 2.8，间隔 0.7 秒；瞬发最近目标后连锁附近最多两个敌人，每次跳跃范围 120，伤害为前次的 70%。
- 黄白折线闪电持续 0.18 秒，只结算一次；双电极枪身。无人机同攻击模式及 65% 基础伤害，主武器/无人机盲盒同步可开出。
- 保留就近瞄准、装备属性浮动和攻击力/攻速两项 UI。test-75 检查连锁顺序、范围、衰减、伤害不重复、消退、无人机、盲盒和 BOSS 通关。

## 第 74 版步枪 / 狙击枪 / 马格南

- 武器与无人机盲盒同步加入卫士步枪（1.35 / 0.22 秒）、鹰眼狙击枪（8 / 1.5 秒）、重锤马格南（5.8 / 1.15 秒），保留品质成长和属性浮动。
- 步枪长枪身加弹匣、中等连射；狙击长枪身加瞄准镜、高速细弹与短尾迹；马格南粗短枪身加转轮、大颗黄色重弹。狙击与马格南只命中一个目标，轨道枪保留穿透定位。
- 保留就近自动瞄准与简化攻击力/攻速属性卡。test-74 覆盖真实伤害、无人机射击/冷却、盲盒池与模型数值。

## 第 73 版武器差异

- 新增棱镜激光枪/棱镜无人机：瞬发至地图边缘，按距离命中最多四个目标，单发只结算一次伤害，光束视觉持续 0.14 秒。普通品质攻击力 1.8、间隔 0.42 秒。
- 冲锋枪改为攻击力 0.38、间隔 0.065、弹速 900；双联机枪攻击力 0.8、间隔 0.3；轨道枪攻击力 5、间隔 1.05、弹速 1250、穿透 3。手枪与霰弹枪保留已有参数。
- 友方弹体继续亮黄：手枪为发光球、冲锋枪细长弹、双联双列、霰弹五发、轨道粗长重弹、激光整段黄光束带浅色核心；激光枪模型增加发光能量环。
- 武器/无人机卡只显示攻击力、攻速（次/秒）与简短攻击方式，不显示 DPS、弹数、穿透表格。品质与 ±15% 属性浮动保留。
- test-73 检查瞬发、近到远穿透、视觉期间只伤害一次、消退、换装快照、无人机、简化 UI 与 BOSS 通关。

## 第 72 版地板受光低饱和

- 地板网格独立标记，将其入射光与轮廓光向同亮度灰色混合 88%，仅保留 12% 彩色染光，原地板/特殊格材质颜色保留。
- 用法线长度 3/3.25 标记普通/微弱自发光地板，shader 恢复原弱自发光强度并避免误作全自发光；颜色缓存及静态网格缓存兼容。
- 角色、敌人、屏幕、护栏与子弹沿用原光照。特殊格地面标识同样降低彩色受光。

## 第 71 版柔和灯光

- 用户反馈地板染色过艳、掩盖特殊格子。背光增益 1.12→0.82，背光着色系数 1.65→1.15，顶光 0.95→0.38，轮廓染色 0.48→0.32，回到较弱染色效果。
- 保留整屏同色的渐变频谱、同步灯光和亮黄色友方子弹。

## 第 70 版霰弹枪

- 五发散射相邻角度由 0.11 改为 0.035 弧度，总散角由约 25° 收紧至 8°。普通品质单发伤害 0.8→0.95，射击间隔 0.72→0.64 秒，弹速 560→680。对应无人机同步弹型/基础参数，保留 65% 伤害系数和品质浮动。
- test-70 用真实发射及线段碰撞逻辑检查半径 14 的静止目标：距离 100/200/350/450，命中数由 3/1/1/1 变为 5/5/3/3。实际移动目标仍取决于射击时机、路径和自动瞄准。

## 第 69 版 BOSS 通关

- 原 BOSS 关包含 BOSS/眼怪/导弹怪的分波队列，导致 BOSS 死亡后继续补刷小怪。现在 BOSS 被主武器或无人机击败即通关，清空已在场敌人和待刷队列、危险弹幕，显示结束 1.5 秒后购物。
- BOSS 击杀仍发 $20，清除的小怪不额外奖励。普通关清场与耐久关逻辑不变；BOSS 存活期间仍按原有规则作战。
- test-69 检查两种攻击来源、剩余小怪和队列、单次奖金、延迟结束；经济测试按真实击杀路径重新核算 BOSS 关收入（未击杀小怪不发钱）。

## 第 68 版亮黄色子弹

- 主武器、无人机的友方子弹统一亮黄色 #fff23b；弹体改用自发光材质，不随场景灯染色。弹体、光晕及枪口火光同色，光晕半径由 4 增至 5。
- 敌方弹幕、装备模型品质颜色及攻击参数保持原样。test-57/59 覆盖全部武器/无人机弹型的颜色。

## 第 67 版盲盒与同色屏幕

- 点击盲盒立即扣款并标售出，随后揭晓。装备/替换不再扣款；放弃保留原装备，丢弃新装备且不退款，不可再次开该盒。对比页显示已支付金额与不可退款，货架脚注提示购买规则。
- 频谱取消横向彩虹，同一时间整屏为同一色相，柱体上亮下暗，12 秒渐变轮回。左右背光、顶光、底部 LED 使用同色；频段能量只影响柱高。
- 强化角色/场景光照：背光系数 1.65、顶光 0.95、轮廓染色 0.48，左右增益 1.12。自发光标识保留可读性。
- test-57/59/63 更新交易规则，覆盖立即支付、零余额换装、放弃无退款、重复操作保护；test-55 检查整屏同色及光色一致性。

## 第 66 版彩虹屏幕灯光

- 屏幕频谱沿横向呈彩虹渐变，12 秒一轮流动；柱高仍由真实 BGM 决定。颜色量化为 120 个色相档，限制渲染颜色缓存增长。
- 左右背光按同侧频段颜色和实际频谱能量加权，顶灯取两侧平均，底部 LED 同步彩虹色。取代原固定青绿/洋红背光与半秒硬切顶灯。
- 背光着色系数改为 1.35、顶光 0.58、轮廓染色 0.4，使地板和角色更明显受屏幕颜色影响；危险光束及自发光危险标识仍保留自身颜色。
- test-55 检查周期、空间色差、光色同步与频谱能量对灯色的影响；保留真实频谱与上下文恢复回归。

## 第 65 版装备展示

- 装备盒保留品质/类别/数量标题，描述仅为“获得一件随机改良品质的无人机。”，移除开盒说明与重复数量说明。
- 空槽揭晓只展示新装备一张卡，仍由购买按钮确认扣款。已有同类装备显示当前与新装备两张卡，各自框内列出实际属性，移除下方统一对比表格；不显示为零的加成。
- 交易、库存随机值、价格及属性生效规则保持原有实现。test-63 同时覆盖简短描述、空槽单卡、已有装备双卡与移除表格。

## 第 64 版关卡结束

- 普通清场与耐久躲避完成统一进入 stageClear 状态，居中显示“结束”，1.5 秒后进入商店。取代普通清场旧的 0.9 秒延迟与耐久关立即进入商店。
- 期间保留场景、粒子和音乐，停止移动、攻击、受伤与补给生产；耐久奖励在结束时只发一次。暂停/后台/上下文丢失冻结计时，重开清除提示。
- tests/test-64.cjs 检查延迟、冻结战斗、耐久奖金、暂停、重开及待出场敌人/导弹阻止提前结束。

## 第 63 版装备盲盒

- 用户最终要求每盒仅一件，暂不做多件盲盒、背包或回收。四类装备商品只显示“普通 随机鞋子X1”等品质、类别与数量，不提前公开款式/数值。
- 库存生成时一次确定内容、属性和价格，点击直接揭晓并对比；空槽也进入对比。确认后才扣款并装备，返回不扣款，重开同一盒不会重新随机。此流程取代第 61 版空槽直接购买。
- 同款同品质的武器/无人机伤害和射击间隔、护甲无敌时间、鞋子移速及已有无敌时间分别独立浮动 ±15%，精度 0.001。整格生命、弹数、穿透及原本为零的加成固定。价格仍按类别、品质及楼层计算，不因浮动变化。
- 初始武器和基础工厂保留固定数值，仅商店生成装备时抽取浮动；装备后射击/移动/受伤逻辑直接使用揭晓值。
- tests/test-63.cjs 覆盖货架隐藏、直接揭晓、空槽对比、取消/重复开启内容稳定、单次交易及属性边界。

## 第 62 版真实频谱

- BGM 通过 MediaElementAudioSource → AnalyserNode → BGM GainNode → destination；射击/购买等音效保持独立，不混入音乐频谱。
- FFT 大小 2048，24 个对数频段覆盖 60–16000 Hz，由屏幕左侧低频到右侧高频；快速上升、平滑回落。
- 每帧采样一次、复用数组，多个井壁屏幕使用同一份数据；不再用 120 BPM 或随机正弦模拟柱高。击杀仅给峰顶染色，不影响真实频谱高度。
- 分析节点位于商店音量控制之前，购物降音时保留频谱形状。暂停/静音/后台时回落；无分析能力时显示安静底线，不假造音乐数据。
- 地板小灯改为响应 BGM 实际低频能量；顶部灯光仍保持原有每半秒硬切规则。
- tests/test-62.cjs 检查低/高频映射、音频路由、降音和静音、移除模拟频谱。

## 第 61 版商店

- 用户指定升级费用 $40/$60/$100/$150（分别升到 2/3/4/5 级），取代原 $100/$200/$350/$550。
- 前两层无钱格收入为 $24、$28。第一层买 $12 武器后剩 $12，第二层收入后正好可花 $40 升二级。连续买扩地并偶尔刷新会更慢，钱格可加快后续换装和升级。
- 武器/护甲/鞋子/无人机普通品质起价为 $12/$10/$8/$16；每升一档品质分别加 $5/$4/$3/$6。同品质装备不会因商店升级而额外涨价。
- 楼层加价每四层 +$1，最多 +$3；不再每层 +$2 后乘商店倍率。
- 扩地/移速/修复/生命核心/拆除/医疗格/护盾格/钱格基础价 $8/$8/$4/$12/$8/$14/$14/$18。随商店等级每级加 20%，效果仍随等级增强；带危险代价的商品保留 75% 价格。
- 刷新费用 $2/$4/$6/...，新商店重置；钱格仍每 15 秒产出 $5，商店中不生产。
- 商店移除当前装备摘要。空槽直接扣款并装备，不弹对比；已有同类装备才弹替换对比，取消不扣钱。
- tests/test-61.cjs 验证真实关卡收益、早期升级预算、连续购物进度、楼层涨价上限及钱格回本。模拟每层购买扩地、隔层刷新，在无钱格条件下分别于 B03/B07/B12/B20 升级；实际进度取决于购买选择。

## 第 60 版 BGM

- 用户提供的 Relentless Minor.mp3 已复制到 dist/audio/relentless-minor.mp3，保留原音频。
- dist/music.js 管理单个循环播放器，启动/重开时播放，跨层和商店保持歌曲进度。
- WebAudio 独立 GainNode 控制 BGM：正常 0.35，商店及装备对比 0.12，音量转换 0.35 秒；购买音效不受此压低影响。无 WebAudio 路由时回退媒体元素音量。
- 声音开关同时控制音乐与音效。暂停、后台、WebGL 上下文丢失及死亡暂停 BGM；恢复时遵循游戏的手动继续规则。
- 音频由启动按钮的用户操作解锁，自动播放被浏览器拒绝时不抛未处理错误，后续交互可重试。
- tests/test-60.cjs 检查循环、商店降音、平滑增益、静音及生命周期。真实音量听感仍以用户设备为准。

## 第 59 版装备

- 武器、护甲、鞋子、无人机各一个槽，跨层保留，重开清空新增槽位。
- 三个商品位保持不变：第二位必为四类随机装备，第三位 60% 概率是装备；其余地板、修复等商品保留。
- 各类装备沿用五品质和商店品质上限，20% 概率低一档。已有装备时先对比，取消不扣钱；确认才替换并标售出，比较期间不能刷新、升级或离店。第 61 版空槽改为直接购买装备。
- 堡垒护甲：品质 1–5 增加 1–5 格生命上限，无敌时间 +0.1×品质秒。相位护甲：生命上限 +ceil(品质/2)，无敌时间 +0.2+0.1×品质秒。
- 护甲加成独立于生命核心，替换时移除旧加成；装备不回血，上限降低时截断当前生命。护盾数值不受换装影响。
- 疾行靴：移速 +12%/18%/24%/30%/36%。稳步靴：移速 +8%/12%/16%/20%/24%，无敌时间 +0.12/0.16/0.20/0.24/0.28 秒。鞋子与已有移速强化相乘。
- 无人机对应五种枪型，独立冷却、独立以自身位置选择最近目标；伤害为同品质主武器的 65%，其余弹道、射速、穿透规则一致。只在普通战斗射击，耐久关继续只躲避。
- 弹丸保存发射时的武器类型、伤害、穿透与高度，换装不会改变已发射弹丸。
- 玩家护甲和鞋子有品质颜色装饰，无人机有跟随悬浮模型；第 61 版移除商店四槽装备摘要。
- tests/test-59.cjs 检查交易、属性替换、无人机射击/收益、耐久关和上下文恢复。node tests/preview-equipment.mjs 提供仅测试用的浏览器视觉场景（4174 端口，?combat 查看模型）。

源码基线：第 58 版，commit 732314fb2028dd17fb8aaaf39a9ddb52d25ac353。
原站点 https://hell-elevator.wzyanggg.chatgpt.site 。现有 Sites project_id 已保存在 .openai/hosting.json。

## 已确定的玩法

- 电梯逐层下坠战斗。初始 3 格生命、3×3 共 9 块激活地板，可买扩地。
- 最大地图固定 13×11（143 格），坐标由 LIFT_MAP 决定。分辨率只改变投影和画面缩放。
- 下半屏按下出现自适应摇杆，按下点为中心；普通行走，自动就近射击，无冲刺。
- 弹幕敌人分波，当前远程敌人和导弹清掉后才出下一波。追逐怪从四侧边缘连续入场，但每层总量有限：第三层起 10 只、随层数增至最多 24 只，同时最多 10 只。
- 追逐怪无金钱收益，仍算击杀；没有额外目标优先级。普通敌人 $4，Boss $20。
- 散弹怪数量受控、弹速较慢。追踪导弹可射爆（3 HP）。激光警示与光束是鲜红色。
- 每 4 层是 20 秒“耐久躲避”：边缘临时机枪单发射击，时间结束消失；Boss 和耐久关有慢镜头入场提示。
- 地刺快速循环，红色地面提示加白色感叹号，刺尖白色；固定电锯、低概率环绕电锯、轴向巡航飞轮。边缘机枪不可射掉，只能用奖励拆除；激光炮停下瞄准再发射。
- 血包 15 秒产出、护盾 24 秒产出；每次 +1 格护盾，永久叠加、跨层保留，受伤先扣护盾。钱格 15 秒产出 $5。
- 成品补给未拾取时会留在原地，格子满槽高亮并停止 CD；满血也可消耗血包。

## 武器与商店

- 三个横排商品孔位；可多次购物，可刷新，刷新价 2+2×本店刷新次数。
- 商店 1–5 级，升级费用 $40/$60/$100/$150。本局跨层保留，重开归 1 级。
- 武器：脉冲手枪、蜂鸣冲锋枪、双联机枪、撕裂霰弹枪、穿透轨道枪。
- 五品质灰/绿/蓝/紫/橙；品质上限随商店级别，20% 概率比商店低一档。同品质各枪理论火力接近，弹道和穿透不同。
- 武器伤害按 1+0.5×(品质−1) 提升；射速等属于武器本身。多弹、射速、伤害被动已退出奖励池；移速、修复、生命上限、扩地等仍是奖励。
- 点击武器先对比，确认才扣钱并替换旧枪；取消不扣钱、保留原货架。确认后商品标售出，避免重复扣款。
- 掩体暂未启用；拆除危险源不会附带“新增陷阱”的代价。

## 视觉和声音

- 可爱小机器人；头顶分格生命/护盾条。
- 暗色实心地板，未激活格有灰边，电路板装饰；已激活地板和角色微弱自发光。
- 后方井壁独立频谱屏幕，有边框和各自底线；屏幕随下坠整体上移，落层停到另一块。第 62 版接入 BGM 的实际频率数据，移除模拟节拍；击杀仅对峰顶染色。
- 青绿/洋红后方背光，顶光每半秒青绿/粉紫硬切，按接近亮度配平。发光子弹有光晕，危险提示不随光色变化。
- 下坠过程无震动，只在下一层重停时震动。
- 敌人碎裂为方块粒子和碎裂音效；击杀撒单张弯曲美钞，强初速度与强阻力，末尾缩放消失。拾取金额飘字，商店购买和拾补给有音效。

## 技术与验证限制

- 经典 script 共用全局状态；并非模块系统。music.js、renderer.js 先于 game.js 加载。
- 实际 WebGL 网格和光照，自写批处理，静态场景缓存，投射物另行绘制。
- webglcontextlost 要 preventDefault 并暂停；restored 重建全部 GPU 对象、重置容量和缓存，保留游戏状态。后台自动暂停，回来手动继续。
- 修改模型时保留属性槽位切换和深度/混合状态恢复，过去存在重开黑屏问题。
- 地图固定修复已用多个窗口比例与 DPR 检查；同随机种子下怪物出生坐标和追逐路径一致。
- tests 是 mock DOM/GL 的 Node 回归检查；浏览器实际图像、设备切屏、音效仍须实机确认。
- 后续可在能用浏览器的本地 Codex 环境补足视觉验收。用户此前反馈硬核，主要追求机制取舍和压迫氛围。

## 第 88 版：无目标飞弹巡游

- 无目标或目标死亡后，飞弹沿场内八个巡游点循环飞行，继续使用恒速贝塞尔路径；到达巡游点后将本帧剩余路程用于下一段，避免停顿。
- 新敌人出现立即切回就近追踪，原有朝上双连射、寿命和命中爆炸保留。主武器与无人机共用。
- test-88 覆盖场内边界、多个巡游点恒速、顶墙脱离、目标出现/死亡、寿命及慢动作缩放；npm run check 与全部 npm test 通过；未单独进行浏览器动态视觉验收。

## 第 89 版：弦月波与近战击退

- 新增弦月波发射器及弦月无人机，亮黄色宽幅月牙波两端渐细，沿自动瞄准方向飞行，可覆盖全场并穿透多个敌人，每道波对每个目标只伤害一次。基础伤害 2.6、间隔 0.65 秒、速度 560、月牙跨度 80。
- 击中存活的近战追逐怪（bomber）时，沿远离玩家方向施加 0.32 秒衰减击退，约 89 像素；击退后恢复追逐，边界限制保留。远程怪和 BOSS 只受伤害。
- 商店单件装备盲盒和任意装备测试面板均可获得新装备，属性界面沿用攻击力/攻速。
- npm run check 与全部 npm test 通过；test-89 验证宽幅扫掠、穿透和单次命中、真实战斗击退/恢复/边界、BOSS 通关、远端覆盖、无人机及模型有限数值。尚未单独进行浏览器视觉验收。

## 第 90 版：三才飞剑无人机

- 专用无人机装备 flysword：三把刀以 120° 均匀分布、半径 52 环绕玩家，跟随移动；在 120 范围内独立选择近目标，以错峰冷却刺出并收回。基础单剑伤害 3.2，单剑间隔 0.7 秒，伸出 0.14 秒、收回 0.18 秒，品质与属性浮动照常。
- 刀刃扫掠碰撞，单次刺击对同一目标只伤害一次；真实近战接触伤害共用击杀、金钱、BOSS 通关逻辑。慢动作同步缩放，不向远处发射投射物；不进入主武器池。
- 商店无人机单件盲盒、任意装备测试面板可取得；替换装备和进入新战斗清理飞剑动作状态。
- npm run check 与全部 npm test 通过；test-90 覆盖三剑等分环绕、跟随和旋转、错峰刺出/回收、局部范围、去重及连续伤害、慢动作、BOSS、无人机盲盒和测试面板、模型有限数值。旧盲盒定向测试修正为按实际槽位池长度选索引，消除新增无人机引起的错误假设。尚未单独进行浏览器视觉验收。

## 第 91 版：飞剑待机朝向与固定站位

- 三才飞剑取消持续环绕旋转，保留三处等分固定悬浮站位并跟随玩家移动。等待刺击/冷却期间，每把剑从自身站位指向最近的存活可攻击目标（包括范围外目标）；无目标统一朝下。
- 目标移动或死亡立即更新待机朝向；刺出与收回仍锁定本次刺击方向，结束后恢复自动朝向。保持近战范围、错峰冷却、伤害及单次命中规则。
- npm run check 与全部 npm test 通过。test-90 更新持续旋转断言，test-91 验证固定站位、冷却及范围外瞄准、最近/移动/死亡目标、无目标朝下、导弹及可攻击炮台、模型有限数值。尚未单独进行浏览器视觉验收。

## 第 93 版：九种主武器与极简命名

- 可获取主武器按用户顺序仅保留：追踪飞弹、火箭筒、手枪、冲锋枪、步枪、狙击枪、激光枪、电击枪、回旋镖。初始武器仍为手枪。
- 对应远程无人机按同样九种收束，名称为对应武器名 + 无人机；保留飞剑与电锯两种专用近战无人机。商店单件盲盒、装备属性卡、测试面板同步。
- 马格南、双联机枪、霰弹枪、轨道枪、旋星、弦月波下架，不再从两槽盲盒或测试面板获取；机制代码保留在内部 WEAPON_CATALOG，以便后续恢复。WEAPON_TYPES 是唯一可获取主武器表，工厂不影响公开入口校验。
- 保留工作区既有第 92 版敌人受击反馈及钞票粒子改动，一起发布。npm run check 与全部 npm test 通过；test-93 覆盖精确九种列表/顺序/名称、两槽盲盒全池、属性卡、测试面板、下架项拒绝与初始手枪。保留内部下架武器机制回归，更新其可获取性断言。此次未单独进行浏览器视觉验收。

## 第 95 版：蜜蜂枪

- 主武器在收束九种的基础上新增蜜蜂枪（bee），同步新增蜜蜂枪无人机。每次五只蜜蜂，0.025 秒错峰出膛，短距离扇形散开后追踪附近最多三个目标；目标死亡重新选目标，无目标场内巡游。
- 每只蜜蜂基础伤害 0.8、速度 380、寿命 3.2 秒，发射间隔 0.7 秒，单次接触伤害后消失，无爆炸；伤害随品质和属性浮动，空中蜜蜂保留发射时的伤害快照，沿用恒速曲线及扫掠碰撞。
- 黄色蜂巢造型枪身、黄黑条纹小蜜蜂及快速振翅，与原追踪飞弹模型区分；装备界面仍只显示攻击力与攻速，说明标明五只蜜蜂。商店盲盒与测试面板可获取。
- 保留既有第 94 版本地淡青受击提亮、赛博火花及命中音效改动，一起发布。npm run check 与全部 npm test 通过；test-95 覆盖蜂群数量/散射/分散追踪/目标死亡/巡游、实际五蜂总伤害与单次命中、远端命中、寿命、BOSS、无人机伤害快照与测试面板、模型有限值。test-93 的收束列表允许新增蜜蜂枪。此次未单独进行浏览器视觉验收。

## 第 96 版：蜜蜂枪移动距离奖励

- 装备蜜蜂枪或对应无人机时，战斗中角色每实际移动 TILE（一格）距离额外发射一只蜜蜂；移速提高会在相同时间内产生更多奖励。未满一格的余量保留，两槽独立累计，奖励蜂使用当前装备伤害且正常追踪/巡游。
- 在 walkFloor 完成后按实际起终点欧氏距离计量，斜走不双倍、撞墙/站立不累计，过场、商店、生存关和暂停不累计；不把外部重定位计为行走。原五蜂定时攻击及射击冷却保留。
- 累计状态放在装备实例的 WeakMap，避免进入装备属性/商店快照；替换装备和重开自然清空，跨普通战斗保留不足一格的进度。说明增加移动奖励机制。
- npm run check 与全部 npm test 通过；test-96 覆盖阈值/余量/跨多个阈值、真实行走、移速翻倍、斜走、撞墙、不动/重定位、非战斗及暂停、两槽奖励伤害、替换/重开、原五蜂发射保留。此次未单独进行浏览器视觉验收。

## 待开发武器设计（用户明确要求暂不实装）

- 寒冰枪：使用类似步枪的枪身模组与精准单发连射弹道；命中造成直接伤害并冻结敌人。冻结期间敌人不能移动或发动新攻击，已发出的弹幕继续存在。建议使用冰蓝枪身细节、冰晶命中特效及冻结覆盖层；普通敌人冻结时长、连续冻结限制、BOSS 抗性和伤害数值待实装时调校，不能未经确认把 BOSS 永久控制。
- 毒枪：使用类似散弹枪的多弹丸扇形弹道；命中造成直接伤害并施加持续掉血的中毒状态。毒弹需保留主武器全场覆盖能力；建议绿色毒液枪身细节及敌人身上的绿色中毒提示。中毒时长、每秒伤害、层数上限及同一发多个弹丸的叠加规则待实装时调校。
- 弓箭：加入待开发武器清单，暂不实装。使用弓身与箭矢的独立模型；具体攻击节奏、弹道、特殊机制和装备配合待后续设计，主武器需保留全场覆盖能力。
- 本次仅记录概念和后续设计方向：没有加入 WEAPON_CATALOG/WEAPON_ROSTER，没有新增射击、冻结或中毒逻辑，没有进入商店/测试面板，没有更新版本、打包或发布。当前游戏仍为 0.96.0。

## 第 97 版：暴击与装备配合

- 狙击枪及对应无人机基础暴击率 35%、暴击倍率 2.5，其余武器基础无暴击。新增暴击护甲：普通品质暴击率 +10 个百分点、暴击倍率 +0.5，品质每级额外 +2 个百分点/+0.1；护盾上限只加 1，生命上限按原特殊护甲增长、受击无敌加成较低。暴击率上限 100%。
- 护甲增益覆盖主武器、远程无人机、飞剑、电锯和移动奖励蜜蜂；狙击枪配普通暴击护甲的基础组合为 45% 暴击率、3 倍暴击伤害。武器自身暴击属性与护甲增益延用 ±15% 单件浮动。护甲光环不参与武器暴击。
- 发射/开始刺击时保存暴击属性快照，空中换装不改变已发出的攻击；爆炸沿用飞弹快照，各目标命中独立判定暴击，共用原扣血/击杀/BOSS 管线。金色暴击文字有单目标限频并共享有上限的浮字队列。
- 狙击装备卡增加暴击率/暴击伤害，暴击护甲卡显示两项加成；其他武器卡仍默认攻击力和攻速，无 DPS。商店盲盒及测试面板加入暴击护甲。
- npm run check 与全部 npm test 通过。test-97 覆盖暴击/非暴击、概率加成和上限、实际扣血、文字反馈、空中换甲与爆炸快照、远程/近战无人机及移动奖励、BOSS、属性卡/盲盒/测试和重开。原 test-74 的直接伤害断言显式关闭暴击，单独测试基础伤害。保留工作区已有 RGB 光瀑与其回归。此次未单独进行浏览器视觉验收；寒冰枪/毒枪仍只保留设计草案。

## 第 98 版：横向挥砍与剑气主武器

- 新增主武器剑（sword）及对应无人机；朝自动瞄准方向在 0.22 秒内横扫 2.2 弧度，刀刃半径 80，0.07 秒时释放亮黄色月牙剑气。主武器通过剑气覆盖全场，专用三才飞剑无人机仍保留。
- 刀刃逐帧采样实际扫过的角度及剑尖位移，跟随玩家/无人机位置；同一次挥砍只命中每个目标一次，不在挥砍开始瞬间对整片扇区结算。剑气独立扫掠碰撞、穿透敌群，同一目标可以吃到刀刃和剑气各一次。
- 普通基础挥砍伤害 4.5、剑气伤害 2.8、间隔 0.65 秒、剑气速度 600；品质及浮动同时缩放两段伤害，卡片额外显示挥砍伤害。两段攻击独立保存暴击快照并沿用原击杀/BOSS 通关。
- 枪身替换为会随挥砍角度运动的剑刃，显示短暂扇形刀光与飞出剑气，商店盲盒和测试面板加入剑。
- npm run check 与全部 npm test 通过；test-98 覆盖近身双判定实际伤害、远端剑气覆盖、左右侧延迟扫中/去重/前后范围、跟随及角度变化、暴击快照、BOSS、无人机、属性浮动及卡片/测试面板、模型有限值。旧统一弹丸测试排除两段攻击的剑，改由专项测试覆盖。保留现有工作区背景光带改动与其回归；此次未单独进行浏览器视觉验收。


## 第 99 版：整段剑刃拖尾与挥砍时显示

- 剑的轨迹从剑身/剑柄连接处（半径 32）覆盖到剑尖（半径 80），16 段顶点透明度从尾部 0 渐变到前缘 0.72。新增透明三角形渲染通道，以标准 alpha 混合保留场景透出，关闭深度写入，保留深度测试；GPU 上下文恢复时重建资源。
- 主武器与同型无人机只在有效挥砍期间显示剑，平时隐藏；无人机刀光与剑身高度统一为 48。近战、剑气、暴击和攻速机制保持。
- test-99 验证全剑刃跨度、透明拖尾、待机/挥砍/结束显示、无人机显示以及上下文恢复；test-98 继续验证两种独立伤害。

- 验证：npm run check 与全部 npm test 通过；已生成 0.99.0 Web/离线 ZIP。公开发布成功：Sites version 84，commit `6bafed5b7f054e180a9f0dcfac60741a645a106a`，version `appgprj_6ac74d5c19748191bc27adbcb8926213~appgver_6079f27c915c81918600ed8a636e1587`，deployment `appgdep_6ac9f7e8328081919727608a5954f7ee`。本轮未进行浏览器画面复核。


## 第 100 版：逆时针快挥与贴图刀光

- 剑从 aim+1.1 扫到 aim-1.1，屏幕坐标中为逆时针；挥砍从 0.22 秒缩至 0.14 秒，剑气释放从 0.07 秒提前到 0.035 秒。伤害与攻击间隔不变。采样数取角度变化绝对值，保证逆向快速挥砍和大帧间隔不漏判。
- 使用 imagegen 内置工具生成的透明 PNG `dist/assets/sword-slash.png`，单张固定贴图四边形代替逐帧拼接刀光网格；shader 仅按刀刃角度显示贴图范围和渐隐尾部。仍只在挥砍时显示剑；无人机共用效果。纹理采用线性过滤、边缘钳制，无需 mipmap，支持 WebGL 1 非二次幂纹理；上下文恢复后重新上传。
- 离线打包将 PNG 嵌入 game.html，Web 包保留 assets 目录。test-98/99 随行为更新，test-100 验证逆向先后扫中、加快时序和大帧完整采样。npm run check 与全部 npm test 通过；本地真实浏览器截图复核刀光贴图已显示，WebGL 无警告或错误。未做手机实机验收。

- 0.100.0 已公开发布：Sites version 85，commit `b224acb23d66569b52b37ca156d848970caa71ac`，version `appgprj_6ac74d5c19748191bc27adbcb8926213~appgver_8b9b01d02f8c8191b249f7dc6b7c9c84`，deployment `appgdep_6ac9fd0c7a7c8191bdb5c7edc88d7884` succeeded。Web/离线 ZIP 已生成。


## 第 101 版：左右交替挥砍与双倍攻速

- 剑每次攻击交替逆时针/顺时针横扫，主武器与无人机各自保存交替状态，重开清空。单次挥砍仍 0.14 秒，剑气仍 0.035 秒释放；攻击间隔由 0.65 减至 0.325 秒，各品质与对应无人机同步，伤害保持。
- 贴图 shader 根据挥砍方向反转尾部渐隐及贴图取样，正反挥击均保持刀光跟随。test-101 覆盖左右交替、端点、贴图方向、无人机独立状态、重开及真实战斗攻击频率；既有判定回归保留。

- npm run check 与全部 npm test 通过；真实模拟 3 秒内攻击由 5 次到 10 次。本轮未单独浏览器画面复核。0.101.0 Web/离线 ZIP 已生成；公开发布成功：Sites version 86，commit `b7949e6a79250b5fd13fdb6538596a8a00dd8aed`，version `appgprj_6ac74d5c19748191bc27adbcb8926213~appgver_f18c5e741c8c8191b9128297c18c0c46`，deployment `appgdep_6ac9ff0dab908191954c69d96b5601c7` succeeded。

## 2026-10-10 频谱与瀑布统一效果发布
- Sites 版本 87 已成功发布到原站点 https://hell-elevator.wzyanggg.chatgpt.site 。
- 源码提交：ad10e4122ece401868e0b2b13408860b4671258a；部署：appgdep_6aca000fa5c881919229c855c9fb75b8。
- 背景主色跟随头灯，计数与真实 24 频段折线共用悬浮投影装置；本地检查、全部回归与音乐预览已通过。


## 2026-10-10 光带收窄与真实频谱形状
- 瀑布每条光带宽度减半，保留不等速、漂移、重叠和头灯同步渐变。
- 删除按索引强制正负交替、两端强制归零及高频额外倍率；24 个实测 FFT 频段以相同映射直接连线，各侧 12 点。相等频段为平线、连续增强频段为上升线，没有人为波谷。

- npm run check 与全部 npm test 通过；真实浏览器音乐播放预览无警告/错误，已保存 natural-spectrum-preview.jpg。Sites version 88 已成功发布；commit 32da5619afc440ac79d8df590d5539ec4c8a56d4，deployment appgdep_6aca02d0231081918b3d80dbe1fad7bd。


## 第 102 版：剑挥砍扩大到 240 度

- 剑扇区统一为 SWORD_SWEEP=4π/3，瞄准方向左右各 120 度，保留左右交替、0.14 秒挥砍与 0.325 秒攻击间隔，伤害和半径不变。正后方保留 120 度缺口。无人机同步。
- 固定贴图随当前剑刃角度旋转，局部前缘与渐隐尾部保持在贴图有效区间，避免扩大挥砍后刀光在两侧消失。test-102 检验完整 240 度、两侧新增覆盖、后方缺口及全角度有限刀光；历史剑回归对应更新角度断言。

## 2026-10-10 矩形光柱投影
- 左右各 12 根真实 FFT 矩形光柱，保留新悬浮位置、中央楼层计数与渐隐光墙。npm run check 与全部 npm test 通过。


- 检查与全部回归通过，0.102.0 Web/离线 ZIP 已生成；未单独做浏览器画面复核。Sites version 89 公开发布成功，commit `67268d3bcc3b29551aa9339c9b9808034feac86f`，version `appgprj_6ac74d5c19748191bc27adbcb8926213~appgver_881ec86a2230819194bdbe46b2ef1fe8`，deployment `appgdep_6aca03c3048c8191826d2dd1fcd215df` succeeded。
- 已确认矩形光柱包含在 Sites version 89 并发布成功，commit 67268d3bcc3b29551aa9339c9b9808034feac86f；deployment appgdep_6aca03c3048c8191826d2dd1fcd215df。同步包含第 102 版剑改动；发布源码回归全部通过。

## 2026-10-10 后沿实体频谱装置
- 将频谱和光墙底部移动到平台后沿 wallZ+14 的实体底座，底座下缘贴地 y=2.1、光墙与柱体从底座顶 y=9 发出；24 根立体方柱有深度、顶面和亮面，仍由真实 FFT 控制高度。
- 楼层牌降到 y=110，实体金属外框、屏面及左右两根立柱和脚座连续接地。

- 追加用户要求：瀑布光带宽度再缩为当前的 2/3（初始宽度的 1/3），各自下落速度翻倍；色相、长度、漂移与亮底保留。相关回归通过。
- Sites version 90 发布成功，commit 8beb8a44b5fd04184643635808bd6a9063c849ac，deployment appgdep_6aca05be80848191b00e646b3ffd5536；包含落地频谱牌支架与更窄更快瀑布。浏览器已复核实体落地装置，无渲染警告/错误。

## 2026-10-10 光柱连续渐变与明暗对比
- 去掉窄亮面和独立顶片，改成等宽连续三维方柱，各面发光不受侧面暗光影响；底色 .23、顶色近白，色相跟随顶光并混合白色降低饱和度。
- 真实频段用阈值 .08、上界 .8、1.8 次幂映射到 300 高度，弱频段压低、强频段抬高。瀑布亮底从 .52 调为 .36，流头增强、流尾压暗，提升明暗差异。

- 检查与全部回归通过，真实音乐浏览器预览无警告/错误；Sites version 91 已发布成功，commit 7970454fda114a5155e01a92aac31024b94f001c，deployment appgdep_6aca09cc23688191be5e374d1a381d13。截图 gradient-spectrum-preview.jpg。

## 2026-10-10 鲜艳侧面与亮顶
- 侧面白色混合降至 18%，保持顶光色相并从暗底渐变到鲜艳亮侧；顶面单独为 87% 白色，尺寸与柱体完全一致，无加宽顶帽和黑边。
- 高度上限从 300 增至 420，映射指数 1.8 增至 2.4、低频能量阈值 .1，使弱频段更低、强频段更高。检查与全套回归通过。

- 真实音乐浏览器预览无警告/错误，截图 vivid-spectrum-preview.jpg；Sites version 92 已成功发布，commit 9eafb4872ac7d0380ef1390a35bcfc69eaae4fbc，deployment appgdep_6aca0b97e04881918e91a2a00e8519d7。

## 2026-10-10 柱顶降低亮度增加饱和度
- 顶面白色混合从 87% 降为 50%，总亮度乘 .9，保留场景顶光色相和鲜艳侧面的区别。npm run check 与相关 test-55 回归通过。

- 音乐浏览器预览无警告/错误，截图 tinted-top-preview.jpg；Sites version 93 成功发布，commit 2723973c76c4cbc30cc9ebff4ec2e619d4e28e2f，deployment appgdep_6aca1988d1c8819192574c9048d16725。


## 第 103 版：扩张地板的随机陷阱概率减半

- addFloor 新格子的地刺概率 15% → 7.5%，固定锯 5% → 2.5%，环绕锯 2% → 1%，移动飞轮 8% → 4%；总危险地板概率 30% → 15%，释放的概率归普通地板。补给格概率保持；奖励选择中的主动添加危险源及炮台满额后的地刺替代不属于扩张随机概率，保留原机制。

- npm run check 与全部 npm test 通过；2000 个均匀采样验证地刺150、固定锯50、环绕锯20、飞轮80，补给概率保持。0.103.0 Web/离线包已生成；Sites version 94 公开发布成功：commit `10d2838611e2f4bd11598ff1ee2082b38b2d93ea`，version `appgprj_6ac74d5c19748191bc27adbcb8926213~appgver_c12de8d8ffcc8191958814eb81103c9e`，deployment `appgdep_6aca30f379308191b3d2d089d1b139a7` succeeded。

- 最终验证：npm run check、完整 npm test（含新增背景专项）均通过；原局保留并由用户继续至B08。

## 2026-10-25 本地：Flat 霓虹投影动画测试场景

- 新增独立入口 /neon-lab.html，复用现有 ?lab=1&scene=abyss 夜城与同一个真实 WebGL 上下文/深度缓冲，仅在该测试页挂接全息绘制，不修改正式游戏入口、战斗或存档。移动屏幕自动调整广告位置；提供近景、暂停、隐藏说明、波普/音符/文字/光晕独立开关。
- 按项目 Seedream 拆图技能，将用户认可的 Flat 音乐广告拆成耳机、主标题、副标题、唱片和音符层。源图、提示词、提交/响应/原始PNG保存在 source-assets/neon-music-flat/；正式测试页只使用四个独立 PNG 与脱敏 manifest，不发布含签名URL的API响应。保留 API 原始 bounding_box、z_index 和实际像素尺寸映射，不重复缩放。
- 着色器实时生成纯色色板、流动波普斑点、七个独立发射/上浮/消退的音符；文字按源图Alpha做呼吸明暗与移动扫光，耳机轻微浮动、唱片小幅摆动。单一常驻quad buffer和四张常驻纹理，仅更新uniform；GPU恢复后重建。音符使用程序形状，未将音符图中的两个符号当成一个粒子。
- npm run check、新脚本语法检查与 tests/preview-neon-lab.cjs通过。真实Edge/WebGL覆盖390x844、320x568、1280x900、暂停/恢复、四项独立开关GPU像素差异、重复同时间确定性、上下文丢失恢复、固定143格，页面和GL无错误。查看三尺寸与近景截图并修复顶部裁切及小屏平台遮挡；非手机实机性能验收。仅本地，未发布。


## 2026-10-25 本地：字体专用烘焙辉光

- 按用户要求只给主标题/副标题添加粉紫、金黄色辉光，使用内置image_gen编辑已拆分字体层，保存headline-glow.png、subtitle-glow.png；保留原始平面字体用于“字体辉光”开关对照。生成提示词保存source-assets/neon-music-flat/font-glow-prompts.md；manifest记录来源与变体。按字面核心像素边界校准扩展矩形，保留文字位置、尺寸和原呼吸/扫光。
- 删除原运行时四邻域取样辉光。当前纹理片元仅一次texture2D，辉光随字体同一绘制提交，不加模糊/Bloom pass；原贴图和辉光变体均常驻以支持即时对照，增加相应贴图内存，上传时长边限制1024px（兼容设备MAX_TEXTURE_SIZE）。字体内部保持Flat色块，其余图层不新增辉光。
- npm run check、node --check dist/neon-lab.js及真实Edge/WebGL preview-neon-lab通过；三种视口、字体辉光开关GPU像素差异、开关前后相同12次draw、暂停、确定性复画及上下文恢复均通过。已查看正常/近景截图，未宣称手机实机性能基准。仅本地未发布。

## 2026-10-25 本地：霓虹广告空间错层与偏移背板

- 用户要求略带倾斜、非同一平面、后方偏移纯色色板。仅修改neon-lab独立测试：加入后移80单位的偏移玫红纯色板；波普板、主标题、唱片、副标题、耳机有独立yaw/pitch/roll、位置和真实世界深度，耳机最前；副标题垫独立深紫条板。保留Flat色块、烘焙字体辉光、扫光/音符与暂停。
- 顶点着色器围绕各原始内容中心旋转，辉光开关扩展矩形时保持相同旋转枢轴，不挪动字面；保持游戏真实深度测试。新增空间错层开关对照平面排版，近景缩至660宽防止后方色板出屏。两块程序纯色板额外2次draw，无新贴图或运行时模糊，常驻quad只更新uniform。
- npm run check、脚本语法检查、真实Edge/WebGL preview-neon-lab通过：三尺寸/近景、五个效果开关GPU像素差异、文字辉光开关前后相同14次draw、暂停、确定性、GPU上下文恢复和固定13x11。已看390x844、320x568与近景截图，修复近景色板右缘出屏；仅本地未发布，不宣称手机实机性能验收。

## 2026-10-27 云端试玩发布（Sites v98）

- 用户授权发布当前项目供他人试玩；沿用 .openai/hosting.json 原项目与 public 权限。公开网址：https://hell-elevator.wzyanggg.chatgpt.site 。
- 发布工作目录：H:/CodexProjects/hell-elevator-codex/publish-20261027；从原 Sites 远程历史开出独立发布目录，再复制本地最新源文件，避免与本地 GitHub 初始备份历史冲突。dist 共209文件逐一SHA256一致，无缺失/多余；原本地未提交修改保留。
- 云端源码提交：5acafdfc42689d01b9de0052b347cbb16c5608f6；保存版本98；部署appgdep_6ae0904a84788191a346addd8f4fb23b返回succeeded。发布包：../hell-elevator-20261027-deploy.tar.gz。
- npm run check通过；npm test在旧test-56的finite total despite kills断言失败，未宣称全量回归通过。timed-floors、shop-stock及真实Edge/WebGL spider-pressure专项通过。
- 正式开局浏览器脚本旧计时断言未等待introLeft，临时发布检查脚本补等准备时长后，实际拖放、地块升起、进入战斗、时间推进、暂停/重开等通过；公开生产网址同一脚本复测通过、无页面/GL错误；HTTP200。检查脚本在../outputs/publish-room-ready.cjs与publish-live-room-ready.cjs。非手机实机或完整平衡验收。

## 2026-10-27 试玩交付打包

- 应用户要求重建 releases/hell-elevator-0.250.0-offline.zip（61,558,223字节）及 web.zip（53,585,772字节），游戏资源与刚发布的Sites v98相同。
- 修复tools/package-offline.py：自动内联所有入口样式；单份资源表覆盖PNG/SVG/JSON/WAV/MP3；保留动态水果JSON/地图图标/录音枪声路径解析；脚本结束标签安全转义。修改仅打包脚本，游戏源码未变化。
- ZIP完整性与Web资源逐字节比对通过。../outputs/check-offline-package.cjs使用真实Edge直接file://打开单文件game.html，验证开局界面、进入准备、六角战斗、5名敌人/倒计时推进、FruitModels.load、MapIcons.ready、枪声音频48554字节、全部内联样式、无外部资源请求/页面/GL错误。截图../outputs/offline-package-390.png；非手机实机验收。

## 2026-10-31 本地：连续六边形表面花纹实验页

- 新增 dist/hex-pattern-lab.html、hex-pattern-lab.js，独立实验，不接入游戏。143格共用细分三角网，分散焊盘通过BFS逐步接入同一树状网络，三组方向平行六边形边线，最后用各地块表面联合裁切；固定种子可复现。
- 提供密度、线宽、三套配色、缝隙、倾斜预览与SVG导出。使用已有4173本地服务，预览地址 /hex-pattern-lab.html。
- npm run check、独立脚本语法检查通过；实际Edge浏览器验证4种子网络连通、树边数、方向约束、种子复现、控制项、SVG下载、390宽无溢出及零页面错误。截图 tests/hex-pattern-lab-desktop.png、hex-pattern-lab-mobile.png，已查看桌面截图。本地未发布，未接入游戏渲染。

### 花纹实验页：增加立体地块近景
- 按反馈，默认切换19格近景和立体预览，用矢量投影展示顶部包边、上层侧壁及黑色下层；花纹按每块顶面裁切，按远近顺序绘制。增加19/143格切换和花纹显隐对照。
- 独立脚本语法检查、npm run check及实际Edge预览验证通过：19/143地块、默认立体、花纹开关、俯视切换、390无溢出、零页面错误。已查看更新后的桌面截图。仍为独立SVG效果原型，未接入游戏。

### 花纹实验页：消除外沿裁切感
- 算法改为相邻地块图的随机生成树，共享边接口先确定，块内沿内缩六边形连接接口与完整圆环，删去最长无用弧避免整圈模板重复。所有线路末端补空心圆；无外邻居的边不设接口。近景19格作为独立地图生成，避免截取143格后出现断线。
- 真实Edge检查19/143格、3种子、网络连通/树边数、30/90/150方向约束、圆环不在接缝及零页面错误通过，npm run check通过；已查看截图 tests/hex-pattern-lab-ports.png。末端补圆后独立语法检查通过。本地原型，未接游戏。

### 花纹实验页：表面线路流光
- 默认开启线路流光，按同一网络源头的累计路径距离设置各段相位，跨共享接口连续向分支推进；叠加三层短亮段形成渐隐尾迹，限定在顶面线路并被板缝遮挡。新增流光开关、0.3–2.5倍速度，配色跟随线路。
- SVG defs共享流光几何并由每块use引用，不逐帧重建网络；动画样式随SVG导出。
- npm run check、独立语法检查通过，真实Edge比较实际像素验证动画变化/关闭静止、速度3秒周期、19/143块引用与零页面错误通过。截图tests/hex-pattern-lab-flow.png。仍仅本地实验页。

### 参考图方向：断续六边形勾边
- 部分地块主线路延展为4–5边的开口六边形，接入第二层2–4边的外侧平行弧线，保留共享接口和全图连通树。新增断续六边形比例0–100%，默认65%；线宽默认.6，端环半径1.5。外侧弧线半径.77R，圆环安全内缩，无完整闭环重复图案。
- 流光按地块分组引用，避免每块复制全图动画线路造成全图预览负担。实际Edge验证19/143格×0/65/100比例的连通树、六边形方向约束、流光像素变化和零页面错误通过。npm run check、独立语法检查通过；截图tests/hex-pattern-lab-outlines.png。本地实验页，未接游戏。

### 花纹实验页：增删地块与局部稳定
- 从全图随机生成树改为坐标种子驱动的局部花纹＋相邻占用共享接口。增删一块仅影响其直接邻居（最多6块），其余地块花纹逐段保持一致；同坐标删后加回完全还原。相邻区域保持连通，拆成多岛则分别计数，孤立格和空地图均支持。
- 点击实心格删除、虚线格添加，支持边缘连续扩建、原位恢复、重置地图及底部显示修改/未修改的格子数。范围切换重置编辑，参数调整保留编辑。稳定流光节点相位缓存并用绝对动画时钟避免每次操作从头播放。
- 新增tests/preview-hex-pattern-edit.cjs，真实Edge验证19/143地图的增删、最多6邻居变化/远处完全一致、删加精确恢复、边缘扩建、两孤岛、单格、空地图与恢复、重置、390无溢出及零页面错误。npm run check与独立语法检查通过；已查看tests/hex-pattern-lab-edit.png。本地实验，尚未接入游戏。

### 花纹覆盖率修复
- 原焊盘覆盖率仅控制额外圆环，基础花纹始终全覆盖。现改名花纹覆盖率，0–100%，按种子＋坐标独立阈值决定整块是否装饰，未选中格完整留白；仅相邻装饰格生成共享接口。覆盖选择随比例单调增加，不依赖地图总格数，保留增删局部稳定。默认45%，底部显示实际有花纹/留白格数。
- 新增tests/preview-hex-pattern-coverage.cjs，实际Edge验证0/10/50/100覆盖、真实渲染格数、单调选取与调回精确复现、零页面错误。默认种子10%对应2/19及15/143格。原增删回归明确以100%覆盖验证连通性，整套通过；npm run check通过。已查看tests/hex-pattern-lab-coverage.png。本地未发布。

### 六边形芯片塔表面发散线路原型
- 增加点击操作模式：增删地块／放置移除芯片塔，以及中心演示按钮；?tower=1自动演示中心塔。芯片是双层六边形面板、六侧各3引脚，共18路向外线路和端环，金色线路流光从核心向外。仅铺在塔格及直接邻格，没有邻居时本格安全收尾；低普通花纹覆盖率也能显示塔专属线路。
- 放置/移除只改本格及6邻居的装饰签名，移除恢复原图；删地块清除所属塔，重置/切范围清除塔。当前仅视觉占位，未接入游戏防御塔。
- 新增tests/preview-hex-pattern-tower.cjs，真实Edge验证18线路/6方向、仅7格受影响、移除精确恢复、地图边缘收尾、删除塔格清理与零页面错误。增删与覆盖率回归、npm run check通过；已查看tests/hex-pattern-lab-tower.png。

## 2026-10-31 本地：普通六边形表面纹路接入游戏，修复启动

- 新增dist/hex-surface-pattern.js并在index.html载入，普通空心圆、六边形方向线路、断续双层勾边接入hex-map的实际顶面；不接入芯片塔专属图案。按地图种子和坐标稳定选取，默认45%花纹覆盖、65%断续勾边、.6线宽及青铜绿色；增删仅影响最多6个直接邻居，同坐标删加还原。纹路按真实顶面（普通内缩1/核心底座内缩4）裁切，跟随地块升降和设施遮挡。
- 地块纹路使用每格resident网格，拓扑变化时只释放/重建几何发生变化的网格，常态缓冲复用；材质模式5通过顶点相位和时间uniform驱动跨缝连续流光，无逐帧顶点重建。画面调节新增纹路/流光开关、覆盖率、断续比例、线宽、速度和颜色，沿用本地保存。
- 接入初期新增surfaceMode在顶点和片元着色器精度不一致导致初始化失败、开始按钮无法使用；已将顶点uniform显式声明mediump，与片元一致。实际正常首页点击可进入首关摆放，零页面/GL错误；promo路径进入战斗也通过。
- npm run check、test-hex-city（含移动）、test-hex-terrain、preview-floor-blob、preview-tile-beams通过。新增preview-hex-surface-pattern实际Edge/WebGL验证2163纹路像素、541流光变化像素、六边形顶面裁切/有限顶点、缓存复用/删除释放、最多6邻居更新、删加精确恢复、0覆盖清空、390/1280截图及零GL/页面错误。新增preview-pattern-start正常按钮启动检查通过。
- 额外运行现有preview-first-drag，在reduced-motion分支旋转样式断言处失败（实际空字符串，期望0deg）；本次未修改拖放代码或该断言，未宣称其全套通过。已查看tests/hex-surface-pattern-390.png及pattern-normal-start.png。全部本地未发布，未手机实机性能验收。

## 2026-10-31 本地：怪物浮桥表面纹路与移除中央叉

- drawTemporaryHexCell移除中心箭头/叉形emissiveBox标记，保留浮桥的平面透明填充与六边形边框。
- hex-map按主地块与怪物浮桥并集生成同款普通纹路，共享覆盖率、断续六边形、颜色、线宽与流光设置。浮桥纹路实例比普通地板上移1单位，贴在3.13高度；使用现有resident材质5、逐格缓存与移除释放，入口相邻装饰格共用接口。未改怪物移动/浮桥路径规则。
- npm run check、test-bridge-room、test-hex-city（含移动）、preview-hex-surface-pattern通过；新增preview-bridge-surface-pattern实际Edge/WebGL验证24桥格纹路、中央无标记、实例高度、流光339像素变化、缓冲复用和释放、390/1280截图及零页面/GL错误。已查看tests/bridge-surface-pattern-390.png。本地未发布。

## 2026-10-31 本地：怪物路径箭头改小号实心暖黄

- electric-editor强敌来袭路径的空心纸飞机轮廓改为两个填充三角组成的实心箭头，长宽同时缩为原2/3（长度24→16、宽度18→12）；颜色橙色改#ffd044，流动微光改#ffda62且半径4→2.5。沿用共享resident网格、视口边缘至入口排列和暂停期间微光；未恢复浮桥中央叉。
- npm run check通过。新增preview-solid-path-arrows真实Edge/WebGL验证实心108顶点数据、长宽2/3、暖黄色、缓存复用、390/320/1280截图及零页面/GL错误，已查看tests/solid-path-arrows-390.png。
- 更新原preview-strong-forecast的实心几何/黄色断言；该旧综合测试本次在warning cards overlap（警示卡重叠）处失败，早于新箭头断言，未修改警示卡布局或绕过断言。本地未发布。

## 2026-10-31 本地：夜城灯牌冷暖配色

- 对照用户蓝紫夜景、暖黄灯条与橙红/粉色灯牌参考，部分楼体灯带采用固定金黄、橙红、亮粉与青蓝配色；窗灯、重点立面、广告边框和侧灯箱边缘对应调整。保持冷色雾、建筑、地块灯光和全部几何不变，背景缓存版本更新orbital-39。
- npm run check、test-hex-city（含移动）、preview-city-bottom通过。真实Edge/WebGL覆盖三视口、三配色、缓存复用、闪烁确定性与上下文恢复，无页面/GL错误。已查看outputs/background-color-after.png。本地未发布。

## 2026-10-31 本地：敌人死亡烟火迸射加强
- 普通敌人亮线18→28，初速1100–2900，阻尼9→4.5；独立可见期1.45秒（原约.85），发射器寿命1.55秒。
- 改为相机平面无重力径向迸射，长度随当前速度缩短；复用常驻程序softLight贴图加法混合，叠加细白亮芯。其他爆炸和实体碎块保持原路径。
- npm run check、test-death-feedback、真实Edge/WebGL preview-enemy-death通过；preview-death-fireworks验证.12/.6/1.2/1.47秒均28贴片且坐标有限、GL无错误。截图tests/enemy-death-fireworks-390.png已检查。仅本地，非手机实机验收，未发布。

### 死亡迸射修正：收紧范围并加强速度拉伸
- 根据用户反馈，初速降为560–840，阻尼7.5，最大扩散半径约112世界单位（前版约644）；保留1.45秒和28粒子。
- 按Unity Stretched Billboard思路：长度=2.5+当前速度*.16（上限为已飞行距离），拉伸系数由.024提高到.16，运动轨迹与长度独立调节。加宽纯白亮芯、softLight加法叠加强度2.8倍。
- 项目Bloom为post-process.js对整屏RGB阈值提取后模糊，无独立发光通道；未更改全局Bloom参数。
- npm run check、test-death-feedback、真实Edge/WebGL preview-death-fireworks通过（4时间点/有限坐标/GL无错误）；已查看更新截图。未做Bloom开关像素定量对比，未发布。

### 死亡迸射比例微调
- 按用户要求：单颗粗细缩为60%，初速乘1.3，速度拉伸系数.16→.18，数量28→21（3/4）；持续时间不变。
- npm run check、test-death-feedback、真实Edge/WebGL preview-death-fireworks通过；四时间点21贴片、坐标有限、GL无错误。本地未发布。

### 死亡迸射彩色化
- 普通敌人迸射改为红/橙/黄/绿/青/紫/粉七色，每颗配同色浅亮芯；颜色由粒子编号与发射器种子稳定选取，不逐帧闪色。保留21颗、现有粗细/速度/拉伸/寿命。
- npm run check、test-death-feedback、真实Edge/WebGL preview-death-fireworks通过（四时间点21贴片、有限坐标、GL无错误）。本地未发布。

## 2026-10-31 本地：像素BOOM死亡跳字
- 根据用户街机参考图，用内置image_gen生成真实透明RGBA贴图dist/assets/enemy-death-boom.png；黄橙粉渐变、浅黄边线、洋红粗描边、紫色立体阴影，文字BOOM!。原始生成图保留于Codex generated_images。
- 普通敌人死亡drawDeathBursts接入drawEnemyDeathWord：相机朝向平面，108世界单位宽、轻微倾斜，.1秒放大回弹、上浮、.85秒淡出；共享deathBursts时钟/数量上限，暂停与重置沿用现有机制。复用renderer.imageQuad纹理缓存和上下文恢复。
- npm run check、test-death-feedback通过；新增preview-death-boom真实Edge/WebGL检查shatterVisual路径、贴图加载、7时间点弹出/淡出/到期、有限坐标、零页面/GL错误。已查看tests/enemy-death-boom-390.png，跳字可读。仅本地未发布，非手机实机验收。

### 死亡跳字扩展：四款词语与配色
- 内置image_gen新增真实透明PNG：enemy-death-zap.png（青蓝电光/紫影）、enemy-death-pow.png（黄橙红/酒红影）、enemy-death-pop.png（薄荷绿/淡紫边/紫影）。保留原BOOM黄粉款。
- ENEMY_DEATH_WORDS基于每次死亡seed稳定随机选四款之一，动画和其他参数不变，同次播放不切词，不消耗玩法随机数。
- npm run check、test-death-feedback、真实Edge/WebGL preview-death-boom及新增preview-death-words通过：四独立纹理全部加载、有限坐标、淡出到期、零页面/GL错误。已检查tests/enemy-death-words-390.png四款实景并排。本地未发布。

## 2026-10-31 本地：敌人装备宝箱、结算战利品与逐件替换
- 普通有效击杀4%掉落、每关最多3箱；recordStageKill按敌人对象去重，排除机关/导弹/测试靶/逃逸/清场/自爆/尚未抵达的运输机，BOSS维持原有独立路径。复用商店randomEquipmentShopItem，掉落时固定物品/属性（当前shopLevel，沿用商店80%同级、20%低一级规则），免费。
- 新增共享常驻宝箱模型（金属带/高亮锁扣），短暂散射后自动吸附拾取；暂停冻结。beginStageClear自动收齐剩余箱，避免最后击杀或场外掉落丢失。
- stageStats.loot记本关装备，结算页显示图标/实际名称/槽位/品质等级。点击继续先逐件复用装备对比，显示免费来源与序号；装备或放弃均前进，后件对比实时读取上一件已换装备；全处理完再进商店，最终关则继续通关。队列中禁止离店；重开/新关清空。
- 改动dist/game.js、index.html、stage-result.css。新增test-enemy-chests.cjs与preview-enemy-chests.cjs；后者使用正常入口并关闭准备编辑器，实际点击三尺寸390x844/320x568/1280x900的结算→装备→放弃→装备→商店，检查3战利品不溢出、现金不变、零页面/GL错误。已查看结算及小屏对比截图，修复图标被全局商店样式撑大的问题。
- npm run check、test-enemy-chests、test-death-feedback、test-shop-stock、test-settlement通过。test-terrain-shop在plannedMed.healProgress处因找不到医疗地块失败；禁用宝箱掉落/更新/绘制/收集路径后同处复现，未宣称全量通过。仅本地未发布，非手机实机验收。

### 死亡跳字：横向柔光亮底
- 用内置image_gen逐张编辑四款原透明贴图，新增enemy-death-{boom,zap,pow,pop}-soft.png，保留原图。亮底分别为金粉/冰青蓝/黄橙红/薄荷淡紫，横向椭圆光带、中心亮横线、柔边渐隐，真实RGBA透明背景。
- ENEMY_DEATH_WORDS切换新版资产，贴片宽108→128给光带留边，字面仍接近原显示尺度；随机选择、弹跳/上浮/.85秒消失不变。
- npm run check、test-death-feedback、真实Edge/WebGL preview-death-boom及preview-death-words通过（加载四独立纹理、有限几何、淡出边界、零页面/GL错误）。已查看四款原图和游戏并排截图tests/enemy-death-words-390.png。仅本地未发布。

## 2026-11-01 本地：死亡加分跳字
- Boom/Zap/Pow/Pop 下方新增 +分数，默认 +200，敌人 scoreValue 可配置；此为死亡反馈数值，尚无独立累计积分系统。逃逸/清场/自爆/测试靶不显示加分。
- imagegen 参照原 BOOM 生成透明 enemy-death-score-atlas.png，含 + 和 0–9，黄橙粉渐变、浅黄边、洋红描边与紫色立体阴影；单张图集以 UV 采样，无本地拆图。手工校准各字符采样范围。
- drawEnemyDeathScore 复用死亡时钟与 imageQuad 缓存/上下文恢复，延后 .045 秒弹出、上浮和淡出；随现有暂停/重置/数量上限。
- npm run check、test-death-feedback、preview-death-words、新增真实 Edge/WebGL preview-death-score 通过；覆盖全部字符、零分不显示、动画到期、有限坐标与零页面/GL错误。已查看 tests/enemy-death-score-390.png。本地未发布，非手机实机验收。

## 2026-11-01 本地：猫角色红色飘动围巾

- cat-player增加红色颈圈和约角色身高长度的窄长围巾，长尾按移动反方向平滑跟随，静止仍有低幅波浪。围巾跟随身体升高和坐骑；不改变装备属性。当前是程序风动效果，未做布料碰撞模拟。
- 围巾几何与猫共用常驻顶点缓冲，GPU按时间/方向变形，颜色、描边、AO/阴影共用相同形变；不逐帧上传顶点。
- npm run check、preview-player-cat（移动/9坐骑/切换/上下文恢复）、preview-cat-depth（outline 6975/AO 1747样本、漏挡0、GL=0）通过。新增preview-cat-scarf验证静止动画像素变化、四方向移动/停步后无重复网格上传与零页面/GL错误。已查看近景与tests/player-cat-scarf.png。本地未发布，非手机实机验收。

### 2026-11-01 围巾改为分段惯性轨迹拖尾
- 根据用户反馈移除整条围巾按运动方向旋转的scarfWind。改为13个世界空间Verlet节点，仅颈侧连接点固定；尾部保持各自历史位置，通过允许松弛的最大段长约束逐段被拉动，转弯保留旧轨迹、停止继续缓动，并加入轻微环境气流/浮动。
- 每步最多1/120秒积分；时间倒退、长间隔或传送重置，暂停不推进。颜色/描边/AO/阴影共享13点uniform，不重新上传网格。
- npm run check、preview-cat-scarf（新增90度转弯尾端保留旧方向/位置、段长界限、停步继续运动、暂停固定、30/60/120fps尾端误差<.04模型单位）、preview-cat-depth（漏挡0/GL0）、preview-player-cat（坐骑/切换/上下文恢复）通过。已查看截图，本地未发布，非手机实机验收。未加入布料碰撞。

### 2026-11-01 围巾调整为轻纱高空气阻力
- 按用户反馈将节点速度阻尼2.8/s提高到32/s，自由速度约0.1秒衰减96%，快速抑制转向/停步后的惯性甩动；保留世界空间轨迹、松弛分段拉动及微弱漂浮，不改变连接点和长度约束。
- npm run check、preview-cat-scarf、preview-cat-depth通过。围巾回归增加停步0.2秒后至0.5秒内所有节点位移<.025模型单位（1.6世界单位）的检查，覆盖30/60/120fps；旧转弯轨迹、暂停、网格复用检查均通过。深度漏挡0、页面/GL错误0。本地未发布，未做手机实机验收。

### 2026-11-01 围巾增加持续噪声漂浮
- 保留32/s高阻力和分段轨迹。额外以平滑value noise叠加低频浮动和细小行进波纹，沿长度渐强，颈部为零、尾端最明显；三轴相位不同，避免规则整条摆动。扰动不注入节点速度，避免重新引入惯性甩动。颜色/描边/阴影继续共用同一组uniform。
- npm run check、preview-cat-scarf通过，新增静止10秒采样确认尾端上下变化>.06且<.35模型单位、颈部固定、暂停噪声冻结，原阻力/转弯/帧率检查仍通过。本地未发布。

### 2026-11-01 暂时关闭围巾
- 按用户要求正常游戏默认关闭围巾与颈圈，网格不追加围巾几何，停止节点模拟。保留实验代码，仅显式URL scarf=1可用于以后调试；围巾专项预览使用该参数。
- npm run check与preview-player-cat通过，本地未发布。

## 2026-11-02 本地：五档难度
- 首页新增五颗星、共用黑胶唱片、各档独立进度和金币倍率。五档15/20/20/25/30普通波，BOSS额外插入；五星保留30+3，全部暂时可选，未接首通奖励与秘宝。
- 复用现有队列及威胁限制，调整血量、安静攻击冷却、增援间隔；包边铁球/弹跳碰撞机/强建机器人提拔精英，血条左侧共享常驻骷髅。最终普通关或BOSS关均正确进入通关，选择页返回修复加载期按钮禁用状态。
- 配置及已知旧回归断言差异见 design/difficulty.md。新增test-difficulty与真实Edge/WebGL preview-difficulty，三尺寸、开始返回、实际精英、通关保存重载通过。语法、浮桥、宝箱、结算、隐形无人机通过。仅本地，未发布。

### 五档难度直接嵌入首页
- 按用户反馈移除点击开始后再选择的二级页面：引擎与角色资源加载完毕后，首页直接显示难度槽位。沿用夜城背景、Logo、属性升级与试验场入口；面板复用商店深灰渐变、青色顶线、切角和角部斜纹视觉，内部包含星级、进度、唱片、描述、金币与直接开始按钮。
- 选档不离开首页，暂停返回与通关后选难度均回到同一首页。320/390/1280三尺寸实际Edge/WebGL与全部选档、直接开始、暂停返回、通关保存重载通过，已查看截图；npm run check与test-difficulty通过。本地未发布。

### 难度槽位改为窄长地块芯片风格
- 按用户要求去掉五个编号按钮，仅用左右箭头切换。Header为选择难度，光盘下方依次星级选择、明确进度x/y波+状态+进度条、描述、收益与开始挑战。
- 使用当前地块选择槽位的黑底、霓虹流动边框、双切角与实色标签，改成窄长矩形；小屏进一步缩窄并压缩间距。真实Edge三尺寸截图已检查，左右切换、布局上下顺序/高宽比、直接开始、暂停返回、通关保存重载均通过；npm run check与test-difficulty通过。本地未发布。

### 难度卡片加宽、放大黑胶与最高进度
- 槽位宽度266→292、小屏224→246；黑胶直径精确按CSS原值乘5/3。进度改称最高进度，波数居中放在24px（小屏21px）厚条内，移除状态文字及独立矩形背景；进度、描述、金币共用底板，以横线分隔。
- 微调上下间距和属性升级入口，真实浏览器检查全部五档在320/390/1280尺寸内的按钮、进度、槽位与下方入口无重叠，保留原进度数据。语法检查与test-difficulty通过，未发布。

### 难度禁止跳档
- 初始仅一星可挑战，读取连续的低档正常通关记录逐档开放；未解锁难度仍可左右查看，开始按钮禁用并提示先通关的星级，startDifficulty入口再次检查。抵达最后一波、失败、测试局、不连续旧高档记录不会绕过。
- test-difficulty验证五档真实胜利逐档开放、非法直接开始/末波未通关/测试局拒绝；实际Edge三尺寸验证2至5星禁用、入口拒绝、正常一星胜利重载只开放二星及二星开始通过。语法检查通过，本地未发布。

### 暂时隐藏最高进度与Lv唱片标签
- 按用户要求，最高进度区域通过hidden暂时关闭，数据保存和逐档解锁逻辑保留；黑胶中心编号改为Lv1至Lv5，随左右选择同步。
- npm run check及真实Edge/WebGL三尺寸与五档标签/进度不可见检查通过，通关保存与逐档解锁回归通过。已查看小屏截图，本地未发布。

### 五档光盘专辑与参考图分区
- 用户确认先预留五个BGM名称与音频配置，稍后提供音乐。DIFFICULTY_DISCS保存霓虹启程/失控脉冲/蛇影回路/赤红裁决/深渊终曲，src均为null；当前继续原BGM，无生成音乐或虚构音频文件。
- 黑胶换银色虹彩光盘，五套专属颜色/反射角度，保留Lv标签；上半区渐变承载光盘与其下曲名，折线青色发光边界分隔下方星级选择，参照用户示例。
- GameMusic预接音频配置，填src后按档切换且独立续播；空配置保持原曲。check、difficulty、music-ownership、新增difficulty-music通过。真实Edge三尺寸与五张专辑截图、曲名、空src、解锁/开始/重载通过；已查看1/3/5档及小屏截图。本地未发布。

### 光盘外发光与虹彩流动
- 外包独立光晕容器，以各档配色柔和发光，避免中心孔mask裁掉外部光圈。盘面与反射层共用注册角度变量，20秒周期匀速流动；Lv与盘体位置固定。减少动态效果时停动画保留光晕。
- npm run check与真实Edge/WebGL三尺寸/五档浏览通过；额外验证0/5秒背景与角度确有变化、标签位置/变换稳定、光晕存在、减少动态效果分支。已查看一星实景截图。仅本地未发布。

### 光盘内环改黑
- 按用户光盘参考图，中心孔外内环改为黑色，增加细暗边与内圈层次；Lv略下移避免叠在黑环上。外部发光与虹彩20秒流动保留。
- npm run check、真实Edge/WebGL三尺寸及虹彩/标签稳定回归通过；已检查390与320实景截图。本地未发布。


## 2026-11-02 本地：黑胶载具改为炫彩光盘
- vinyl 对外名称改为「炫彩光盘」，描述改为「光盘近身切割并击退；命中提升攻速」。保留内部ID、伤害/半径/间隔/品质/攻速与存档兼容。
- 移除黑胶刻纹、纸标、唱针及青色盘内光带，改为银色薄盘边、开放中心孔和金属内环，盘面径向虹彩随时间流动；命中仍有盘缘闪光。装备材质色同步银色/青色。
- check、test-144/145/146/162通过；真实Edge/WebGL preview-chromatic-disc通过且已查看截图，页面/GL错误0。test-147在飞碟next shot follows interval旧断言失败，用旧drawVinylRecord替换重跑仍同样失败，与本次盘面无关。本地未发布，非手机实机验收。

## 2026-11-02 本地：进入关卡闪烁与圆形揭幕
- 难度页开始按钮新增 enterDifficulty：反色提亮闪烁3次（每次200ms），然后保留选择界面的DOM/Canvas快照，在其上从关卡角色投影位置向四角展开透明圆形遮罩（750ms），露出真实关卡。底层关卡在揭幕期间暂停，结束恢复原暂停状态。
- 点击/键盘在动画期间拦截，重复启动受锁保护；动画结束清理快照和监听器。startDifficulty保持同步接口及解锁校验，供现有回归和实验场调用。
- npm run check、test-difficulty、preview-difficulty-transition（真实Edge/WebGL，320/390/1280三尺寸，3次闪烁、闪烁期间停留菜单、圆形mask、清理及页面/GL零错误）通过。原preview-difficulty在旧skill-entry底部布局断言失败（当前大厅入口已改版），未宣称该套通过。未做手机实机视觉验收，未发布。

## 2026-11-02 本地：角色加点彩虹配色
- 仅追加 dist/talents.css 视觉覆盖：13项属性底板按橙黄/粉/紫/蓝/青/绿循环渐变，图标、等级条、加减按钮随行配色；技能点卡与保存按钮使用蓝紫粉渐变，背景改为紫蓝霓虹点纹。
- 保留原排版尺寸、滚动、说明开关、分配与保存逻辑。真实Edge/WebGL查看320/390/1280三尺寸，六组配色生效、行内容无横向溢出、GL错误0；已查看tests/character-rainbow-390.png。
- npm run check、test-talents通过。preview-lobby在本次CSS修改前运行即于第48行“开始后导航隐藏”断言失败；不宣称完整大厅回归通过。本地未发布。

### 进入按钮改为快速白底黑字闪烁与确认音
- 按用户最新要求，移除 invert/brightness，按钮显式白底黑字与原配色交替3次，每次100ms，总计约0.3秒。闪完播放一次880Hz、0.16秒的triangle确认音，沿用音量/静音设置。
- 用户明确确认闪完需停约1秒再转场；音效后等待1000ms，再沿用750ms角色位置圆形揭幕。等待期间保留菜单和防重复输入锁。
- npm run check、test-difficulty、真实Edge/WebGL preview-difficulty-transition三尺寸通过，验证白/黑关键帧、三次100ms、确认音调用一次、约1秒等待、圆形揭幕和清理；页面/GL零错误。本地未发布，未做听感或手机实机验收。

## 2026-11-02 本地：独立UI色彩与光照规范场景
- 新增dist/ui-color-lab.html/css/js独立空白样板，不加载游戏运行时、不写存档。沿用商店切角/斜纹/编号/几何轮廓，展示不透明紫色面板、普通/高饱和选中/锁定装备、彩色属性图标、冷暖资源点缀、主按钮渐变。
- 环境柔光/选中光晕可单独开关，装备可切换，属性加点/保存/重置为纯内存样例。外层绘制光晕避免切角裁剪，收窄光晕绘制边界避免小屏横向溢出。
- design/ui-color-lighting.md记录色彩令牌、渐变、受光/发光分层、状态与亮色面积建议。未替换现有主菜单和商店样式。
- npm run check及新JS语法检查通过；preview-ui-color-lab真实Edge验证1440/390/320尺寸、状态切换/光照开关/加点上限/保存重置、运行时隔离、零页面与资源错误。已查看桌面与390全页截图。仅本地未发布，非手机实机。

### UI光照样板v2：项目Bloom、移动波普纹理与青粉闪亮
- 样板直接加载原post-process.js/css，使用本页内存预设，不更改共享滤镜源文件或保存游戏偏好。Bloom阈值.74/强度.52/半径1.15，轻色散/扫描线/暗角，关闭畸变。
- 新增ui-color-shader.js：5个局部WebGL表面，像素点阵缓慢移动、青蓝/粉紫色相波动、窄幅反光；保持切角轮廓、文字DOM在上层。限制30fps、离屏/后台停绘、减少动态时间固定、上下文恢复、无WebGL时CSS底色可见。
- 页面增加纹理开关，Bloom开关联动真实合成增益；强化青粉图标与青紫粉按钮、白色星芒。规范文档更新v2。
- npm run check、新JS语法检查及preview-ui-color-lab通过；真实Edge三尺寸无溢出，纹理运动/静止/开关像素检查、Bloom增益关闭、GL0、页面资源错误0。已查看宽屏截图。仅独立本地样板，未应用正常游戏或发布。

### UI样板v3：提高色块亮度与Header合并
- 根据用户反馈移除属性Header和奖励着色器的深色混合，提高选中装备为亮青粉渐变。浅色区域使用深色文字，点阵降低强度，保留Bloom及运动。
- 属性Header直接贴合父窗口顶部与左右边，移除独立内嵌切角；普通/锁定装备状态不变。CSS回退配色同步。
- ui-color-shader语法、preview-ui-color-lab三尺寸/交互/纹理运动/减少动态/Bloom/GL与页面错误检查通过。已查看宽屏截图；规范更新v3。仍仅本地样板，未发布。

### UI样板v4：按层级区分几何轮廓
- 新增ui-color-frames.js，响应式生成大窗口多段台阶/侧边内收/底部折线，SVG细框与局部2–4px加厚短边同源坐标。介绍/属性/奖励轮廓不同，三装备卡各有切角方案；同卡选中轮廓固定。
- 普通按钮改为左上单角，保存按钮向右箭头，加点右下单角；次要说明卡减少装饰。保留青粉明亮材质、Bloom与着色器纹理，更新规范v4。
- 真实Edge preview-ui-color-lab三尺寸/交互/运动/减少动态/Bloom/GL及资源错误检查通过，已查看宽屏截图。新增脚本语法检查通过。仅本地样板，未发布。

## 2026-11-03 本地：商店商品卡上下分区与装备礼盒
- 普通商店商品卡改为上方渐变展示区、青色发光折线、下方名称与说明区；品质标签放右上，原名称/说明/价格及购买锁定逻辑保留。装备展示使用新的代码原生SVG金属礼盒，正面直接复用shopItemIcon原图标与品质色；酒吧不受影响。
- npm run check、test-shop-stock通过。preview-shop-gift真实Edge/WebGL验证320/390/1280尺寸、礼盒资源、面板无横向溢出、锁定、购买确认，页面/GL错误0；已查看390截图。仅本地未发布，非手机实机验收。

### 商店宝箱改为3D模型并补齐倒角背景
- 移除SVG礼盒壳，shop-chest-model.js创建带倒角的箱体/箱盖/提手/金属扣/徽章板真实三维网格，单个共享WebGL上下文静态绘制后复制到各商品Canvas，无逐帧循环。正面继续复用原装备图标。
- 修复折线SVG填充闭合方向：下方信息色只填折线以下，上方渐变完整保留到不规则边缘，消除黑槽。
- check、test-shop-stock及更新后的preview-shop-gift通过；真实Edge/WebGL三尺寸、模型网格/Canvas、购买确认/锁定、页面与两套GL错误0，已查看390截图。本地未发布，非手机实机。

### 商店正式入口与稀有度背景
- 3D宝箱已在主游戏index.html和renderShop中接入；通过正常reward结算入口验证自动进入商品卡商店并挂载模型，不依赖独立预览页。
- 移除展示区固定紫蓝底色，整段渐变跟随现有WEAPON_GRADES：普通灰、改良绿、精良蓝、史诗紫、传奇金；下方说明区使用同品质深色，分隔倒角填充同步以保持连续。
- npm run check、test-shop-stock、preview-shop-gift（三尺寸与购买锁定）、preview-shop-gift-rarity（正常结算入口与五档背景不同）通过，已查看灰/蓝/金同屏截图。仅本地主游戏，未发布。





# 个人站改造计划(Lin_eclipse / AlexBybye.github.io)

> 技术基调:**深度改版 + 引入 Tailwind v4**
> 视觉主题:**中性暗色(zinc/stone)+ 单点拜仁红 `#e30613`**
> 数据层:**自建评论/点赞 UI + 免费 Cloudflare Worker + GitHub Discussions 存储**
> 不动:路由结构 / URL / hash 模式 / 足球叙事三段式入口 / Pinia 音乐系统 / 文章 markdown 管线

---

## 一、现状诊断(已通读全部核心代码)

### 架构
- Vue 3 + Vite + Pinia + vue-router(hash),纯前端,部署 GitHub Pages。
- 产物:JS 199K / CSS 52K;`public/resources` 17M、`images` 3.6M(图片是首屏主要包袱)。
- 作者已有模块化范式:`welcomeResources.ts`(资源清单 + JSON 配置 + 解析器 + 组件只渲染)、`musicStore.ts`(Pinia + JSON)。**本计划把这套范式推广到全站。**

### 三大问题域
1. **主题/配色打架**:入口橙红 → Animation2 红黑 → 内容页蓝青玻璃(`#00f3ff`/`#03dac6`/`#6200ea`/`#bb86fc`)。违反 Page Theme Lock + Color Consistency Lock。
2. **运行性能**:
   - `TagCloud.vue:153` 每帧 `tagStates.value = [...]` 重建数组触发 Vue 全量重渲染(rAF 驱动响应式 state,禁忌)。
   - `Music.vue:130` 渲染期 `Math.random()`;`.float-anim-*` + Music 无限动画无 `prefers-reduced-motion` 兜底。
   - About 页 5 个第三方实时服务阻塞首屏 LCP。
   - 全站 `100vh`(iOS 跳动);大图未压缩/未懒加载。
3. **数据层不共享 + 可冒充**:评论/点赞/"登录"全存 localStorage,换设备归零,输个用户名即可冒充任何人删评论。

---

## 二、数据层重构(核心新增)

### 目标
真正的跨用户/跨设备共享 + 真实身份防冒充,且保持零数据库。

### 方案:GitHub Discussions 作存储 + Cloudflare Worker 做 OAuth 交换 + 自建 UI

```
浏览器(自建红黑 UI)
   │  1. 点"用 GitHub 登录" → 跳 GitHub OAuth authorize
   │  2. 回调带 code → 打到 Worker
   ▼
Cloudflare Worker(仅存 client_secret,做 code→token 交换)
   │  3. 返回 user access token
   ▼
浏览器持 token 直接调 GitHub GraphQL API
   │  4. 读/写 Discussions(评论)、Reactions(点赞)
   ▼
GitHub Discussions(数据真源,任何人可见)
```

- **为什么要 Worker**:纯静态站无法安全保管 `client_secret`,OAuth code→token 交换必须在服务端。Worker 免费额度足够个人站,一次性配置。
- **身份**:token 来自真实 GitHub 授权,评论作者 = 真实登录名,无法冒充;删除权限由后端身份决定。
- **存储映射**:每篇文章/每首歌 = 一个 Discussion(用 slug 映射);评论 = discussion comment;点赞 = discussion/comment 的 reaction(👍)。

### 落地模块(替换现有 service)
```
src/service/
  auth/
    githubOAuth.ts      # 发起授权、处理回调、token 存取(sessionStorage,不落库)
    workerClient.ts     # 与 Cloudflare Worker 通信
  discussions/
    githubGraphql.ts    # GraphQL 客户端(octokit/graphql 或轻量 fetch 封装)
    commentsRepo.ts     # 评论 CRUD(按 slug 查/建 discussion)
    reactionsRepo.ts    # 点赞(reaction)读写
  (删除)LikeService.ts / githubAuthService.ts 的 localStorage 实现
```
- 保留 localStorage 仅作**乐观更新缓存 + 离线降级**,不再是唯一真源。
- Worker 代码单独放 `worker/` 目录,附部署说明(wrangler)。

### 评论/点赞组件复用(含音乐页)
```
src/components/social/
  AuthButton.vue        # GitHub 登录/登出
  ReactionBar.vue       # 通用点赞条(文章/评论/歌曲通用,props: targetType, targetId)
  CommentThread.vue     # 通用评论区(重构自 CommentSection.vue,套红黑主题)
```
- **音乐页复用**:每首歌映射一个 discussion,`<ReactionBar target="song" :id="song.slug" />` + `<CommentThread :slug="song.slug" />` 直接挂上,实现"给歌曲点赞/评论"。

---

## 三、地基:Tailwind v4 + Less + 设计 token + 资源模块化

### 3.1 Tailwind v4 + Less 共存策略(重要)
Tailwind 与 Less 分工,不冲突:
- **Tailwind v4**:出工具类 + 设计 token。装 `tailwindcss @tailwindcss/vite`,`vite.config.ts` 加插件(不用 PostCSS 老写法)。
- **Less**:组件内复杂作用域样式(嵌套、mixin、函数、循环生成阵型/路线图坐标)。装 `less`(Vite 原生支持,无需额外插件),组件用 `<style lang="less" scoped>`。
- **边界规则**:
  - `@theme` 定义必须留在 `src/styles/main.css`(`@import "tailwindcss"`),不要放进 `.less`(Less 不解析 Tailwind at-rule)。
  - 简单排版/间距/颜色 → 模板里用 Tailwind 工具类。
  - 需要嵌套逻辑/mixin/计算(斜切 clip-path、阵型坐标、路线图节点)→ Less。
  - Less 变量镜像 token:`src/styles/tokens.less` 用 `@accent: #e30613;` 等,与 `@theme` 保持同源(单一事实来源在 `tokens.ts`,构建时或手工同步到两侧)。
- **Less 组织**:
  ```
  src/styles/
    main.css          # Tailwind 入口 + @theme(唯一)
    tokens.less       # Less 变量(镜像 @theme)
    mixins.less       # 复用 mixin:斜切、玻璃、reduced-motion 守卫、断点
  ```
- 现有 scoped `<style>` 逐页迁移为 `lang="less"`,不一次性全删,降低风险。

### 3.2 设计 token(单一事实来源,写在 `@theme`)
- 中性阶:`zinc-950 → zinc-100`(近黑底,非纯黑 `#000`)。
- 强调色**唯一**:`--color-accent: #e30613`(承接 Animation2 拜仁红)。
- 语义:`--surface / --surface-raised / --text / --text-muted / --line`。
- 圆角锁一套(Shape Lock):卡片 `rounded-2xl`,交互元素统一。
- 字体:自托管 **Geist + Geist Mono**(替换 Inter/Arial/Courier),`font-display: swap`,数字统一 `font-mono`。
- 对应 TS 常量放 `src/design/tokens.ts`(动画时长、断点),给 JS 动画复用。

### 3.3 资源模块化层(把 welcome 范式推广全站)
```
src/content/           # 内容配置,增删内容不碰组件
  profile.ts           # 个人信息/技能(阵型)/爱好
  timeline.ts          # 成就里程碑(供"路线图"分步交互)
  repos.ts             # 精选仓库
  friends.ts           # 友链(从硬编码搬来)
src/design/
  tokens.ts            # 设计 token 的 TS 侧镜像
  icons.ts             # 统一图标出口(@phosphor-icons/vue)
src/components/ui/     # 原子组件
  Section.vue / Card.vue / Tag.vue / IconButton.vue / RevealOnScroll.vue
```
- 组件只渲染,内容全部来自 `content/`。新增一条成就 = 改数组,不碰 `.vue`。

---

## 四、逐页改造

### 4.1 入口 Animation1(保留射门交互)
- 橙红渐变 → 承接红黑主题,做到主题从入口即贯穿。射门轨迹保留,改红。

### 4.2 Animation2(已成熟,微调)
- 红黑斜切是全站主题锚点,基本保留;仅统一 token 化颜色变量。

### 4.3 主布局 Animation3
- 导航单行 ≤72px;玻璃拟态**只留音乐播放器一处**,其余用 token 暗色。
- 滚动进度用 IntersectionObserver / CSS scroll-timeline,复用"射门轨迹"作阅读进度线索(motion 有动机)。

### 4.4 About(重点炫技页)—— 放弃三列玻璃田字格 + 全员浮动
创意交互(均带明确动机,遵守 reduced-motion):
1. **成就路线图 = 足球推进**:里程碑做成从中场到球门的推进路径,**点击"下一步"球前进一格**逐个揭示(2023→2025),射入球门触发 `canvas-confetti`(已装)。直接落地"点击前进一步"。
2. **技能栈 = 阵型图**:技能按 4-3-3 摆位(前锋=主攻语言/中场=框架/后卫=工具链),hover 出球员卡式说明。替代 skillicons 横条。
3. **头像磁吸微交互**:`requestAnimationFrame + transform`,不碰 Vue state(遵守禁忌),reduced-motion 降级。
4. **精选仓库真卡片**:构建时抓一次 GitHub 数据存 JSON(或懒加载 + 骨架屏),替代第三方实时图片。
5. **滚动揭示 stagger**:IntersectionObserver 一次性,非无限循环。

### 4.5 Music(重构 + 复用社交组件)
- 去蓝青霓虹,改中性暗底 + 红点缀;遥测数字 `font-mono`。
- 每首歌挂 `ReactionBar` + `CommentThread`(复用数据层)。
- 波形可视化接真实 audio 数据(motion 有动机)。

### 4.6 Article / Album / TagCloud / Friends
- 统一卡片 token,emoji 换 Phosphor 图标。
- **TagCloud 重写**:位置用 CSS 变量 + transform,rAF 不触 Vue state;或改 scroll-snap 药丸组。
- **Friends**:数据搬进 `content/friends.ts`。
- **Article**:评论区换成新的 `CommentThread`,点赞换 `ReactionBar`。

---

## 五、性能提升方案(全量清单)

### 5.1 资源与加载
- 大图转 **WebP/AVIF** + 尺寸压缩(17M resources + 3.6M images 是首屏主因);背景图按视口出多尺寸(`srcset` / `<picture>`)。
- 首屏图 `fetchpriority="high"` + `<link rel="preload">`;非首屏图 `loading="lazy"` + `decoding="async"`。
- GIF(球员动图)转 **WebM/MP4 video**(体积降 5-10 倍)或 `<img>` 懒加载 + IntersectionObserver 进视口才播。
- 字体自托管 + `font-display: swap` + `preload` 首屏字重,子集化(只留用到的字形)。
- 音频 `<audio preload="none">`,点播放才加载;封面图懒加载。

### 5.2 打包与代码分割
- 路由级懒加载 `() => import(...)`,每页独立 chunk。
- 重库按需/懒载:`canvas-confetti`、GraphQL 客户端、GSAP(若用)动态 import,不进主包。
- `manualChunks` 拆 vendor(vue/router/pinia 一组,社交/数据层一组)。
- 生产关 `vueDevTools`;`build.sourcemap: false` 已开。
- 用 `rollup-plugin-visualizer` 出包体报告,盯 199K JS 的下降。

### 5.3 运行时(渲染性能)
- **TagCloud 重写**:废弃每帧 `tagStates = [...]` 全量重渲染,改 rAF 直接写 DOM `style.transform`(motion values 思路),Vue 不参与每帧。
- 移除渲染期 `Math.random()`(`Music.vue`),预生成一次。
- 动画只碰 `transform` / `opacity`;`will-change` 仅加在真正动的元素。
- 长列表(文章/歌单)`v-memo` 或虚拟滚动(歌单 38+ 首,列表长了上 `vue-virtual-scroller`)。
- 滚动/尺寸监听用 IntersectionObserver / ResizeObserver / `passive` 事件,禁 `window.addEventListener('scroll')` 驱动 state。
- 图片网格用 `content-visibility: auto` + `contain-intrinsic-size`,视口外不排版。

### 5.4 数据层性能
- GraphQL 请求去重 + 缓存(同一 slug 的评论/点赞只拉一次,SWR 式);点赞乐观更新,后台对账。
- 评论分页(`first: 20` + 游标),不一次拉全。
- Worker 侧加缓存头,减少重复 token 交换。

### 5.5 无障碍与稳定性收口
- 全站 `100vh → 100dvh`;所有 `MOTION > 3` 动画包 `prefers-reduced-motion`(Less mixin 统一守卫)。
- 修 `router.ts` 的 `import path` 死引用。
- 按钮对比度(WCAG AA)/ CTA 不换行 / `letter-spacing` 替代手动空格,逐项 Pre-Flight 自检。
- 预留图片宽高(`aspect-ratio`)防 CLS;骨架屏占位。
- 目标 Core Web Vitals:LCP < 2.5s / INP < 200ms / CLS < 0.1,ship 前跑 Lighthouse。

---

## 六、炫技方案库(按主题一致性 + 有动机原则挑选)

> 全部遵守:单点红、reduced-motion 降级、transform/opacity 硬件加速、Vue state 不参与每帧。

### 6.1 已在计划内(About/入口)
- **成就路线图 = 足球推进**:点击"下一步"球逐格前进揭示里程碑,入门触发 confetti。
- **技能栈 = 4-3-3 阵型图**:球员卡式 hover 说明。
- **头像磁吸微交互**:rAF + transform。
- **射门轨迹作滚动进度线索**。

### 6.2 新增候选(可挑选启用)
1. **入口射门 → 主页转场缝合**:射门命中后用 Motion `layoutId` 式共享元素,把球/轨迹平滑过渡进主页,而非硬跳路由。
2. **数字滚动计数**:成就年份、访客数、歌曲数用 `requestAnimationFrame` 数字滚入(IntersectionObserver 触发一次)。
3. **文字揭示(text reveal)**:标题按字/词 `clip-path` 或 `translateY` stagger 进场,纯 CSS `animation-timeline: view()`(scroll-driven,零 JS)。
4. **磁吸/方向感知按钮**:CTA 填充从光标进入的方向展开(Less 计算方向)。
5. **卡片光标聚光边框(spotlight border)**:CSS 变量存指针坐标,`radial-gradient` 跟随,单点红光,仅 hover 时启用。
6. **音乐页真实波形可视化**:`AnalyserNode`(Web Audio)读频谱驱动柱状条,只在播放时 rAF,暂停即停。
7. **专辑/相册 3D coverflow 或倾斜视差卡**:`rotateY` 跟指针,`perspective` 容器,reduced-motion 退化为平面网格。
8. **标签云重构为力导向/scroll-snap 药丸**:替代掉抖动的绝对定位版。
9. **滚动驱动的红黑斜切分隔条**:section 之间用 Animation2 的斜切语言做过场,`animation-timeline: view()` 纯 CSS。
10. **骨架 shimmer**:评论/仓库加载态用形状匹配的骨架 + 单向微光,而非转圈 spinner。
11. **命令面板(⌘K)**:快速跳转文章/歌曲/页面,键盘可达,技术受众加分。
12. **暗色内的"球场草皮"纹理背景**:极低透明度 SVG pattern + `content-visibility`,不伤性能。

### 6.3 库选型
- 默认 **CSS scroll-driven animations**(`animation-timeline: view()/scroll()`)优先,零 JS。
- 需要 pin/scrub 才上 **GSAP + ScrollTrigger**,隔离在 `'use client'` 式的独立组件 + `onUnmounted` 清理。
- UI 状态过渡用 Vue `<Transition>` / Motion(motion/vue)。
- **禁止**同一组件里混用 GSAP 与其它 rAF 动画库(抢帧)。

---

## 七、移动端适配(全程纳入,不做事后补丁)

### 7.1 断点与基线
- 统一断点(Less mixin + Tailwind 默认):`sm 640 / md 768 / lg 1024 / xl 1280`。
- **移动优先**:默认写窄屏样式,向上用 `md:` / `min-width` 递进,避免 desktop-first 反复覆盖。
- 容器 `max-w-[1200px] mx-auto px-4`;高变体布局(阵型、路线图)在 `< 768px` 强制单列。

### 7.2 视口与安全区
- Hero/满屏用 `min-h-[100dvh]`,禁 `100vh`(iOS 地址栏跳动)。
- 刘海屏适配:`padding` 加 `env(safe-area-inset-*)`;固定导航/播放器避开安全区。
- `<meta viewport>` 确认含 `viewport-fit=cover`。

### 7.3 交互降级(桌面炫技 → 移动可用)
- **hover 类效果**(磁吸、聚光边框、阵型 hover 卡)→ 移动端用 `@media (hover: hover)` 守卫,触屏改为点击展开/直接展示,不依赖悬停。
- **成就路线图**:桌面横向推进;移动端转纵向时间线,"下一步"按钮保留,球沿竖直路径走。
- **阵型图**:移动端缩为紧凑网格或可横向 scroll-snap,不强塞 4-3-3 横排。
- **Animation2 红黑斜切**:已有 `@media (max-width: 980px/620px)` 降级,继续保留并 token 化。
- **自定义光标 / 视差**:移动端一律关闭。

### 7.4 触控与可读性
- 可点目标 ≥ 44×44px(播放控制、点赞、标签)。
- 字号移动端下限:正文 ≥ 15px,标题用 `clamp()` 自适应缩放(`text-4xl md:text-6xl`)。
- 表单输入 `font-size: 16px`(防 iOS 聚焦自动放大)。
- 横向溢出自查:斜切/负 margin/`skew` 元素加 `overflow-x: hidden` 兜底。

### 7.5 移动端性能
- 移动端默认降低 `MOTION_INTENSITY`:无限动画、粒子、波形柱数量减半或关闭。
- 图片按 DPR + 视口出更小尺寸(`srcset`),移动端不下发桌面大图。
- 首屏 JS 更激进懒加载;confetti/GSAP 仅桌面或交互时加载。
- 真机验证:iOS Safari + Android Chrome,查地址栏收缩、滚动 jank、点击延迟。

### 7.6 组件级移动规则(每个组件必须显式声明)
- 每个多列组件在自身 Less/模板里写明 `< 768px` 的塌陷方式,禁"Tailwind 会自动处理"的假设。
- 导航移动端 → 汉堡菜单;悬浮播放器移动端 → 底部精简条,不占左上大块。
- 评论/点赞条移动端纵向堆叠,按钮全宽或图标化。

---

## 八、实施顺序(每阶段跑 `npm run build` + `type-check` + 真机自查)
1. **阶段 0 地基**:Tailwind v4 + Less + 设计 token + `content/` 模块化骨架 + UI 原子组件 + 断点 mixin。
2. **阶段 1 数据层**:Worker + OAuth + GraphQL 封装 + 社交组件(AuthButton / ReactionBar / CommentThread),先在文章页跑通。
3. **阶段 2 About 样板页**:落地创意交互 + 移动降级,验证"模块化 + 新主题 + 炫技 + 移动端"完整样板。
4. **阶段 3 音乐页**:重构界面 + 复用社交组件。
5. **阶段 4 其余页 + 性能收口**:入口/主布局/Article/Album/TagCloud/Friends 统一,图片/动画/移动端优化。

## 九、不改清单(SEO / 习惯 / 稳定性)
- 路由结构、URL、hash 模式;足球叙事三段式;Pinia 音乐系统;评论 markdown 管线的数据形状(仅换存储后端与 UI)。


# Lin_eclipse Personal Web

以拜仁慕尼黑足球叙事为主线的开发者个人站。Vue 3 + Vite 构建，纯前端部署 GitHub Pages。视觉系统为中性暗色 + 单一拜仁红 `#e30613`，全站桌面与移动端分别设计，动画均带 `prefers-reduced-motion` 兜底。

## 特色

- **四段式足球入口**：射门开场（点球触发彩带）→ 红黑斜切 showcase 轮播 → 球星卡抽卡翻牌 → 进入主页。
- **足球隐喻贯穿全站**：技能栈做成 4-3-3 阵型图、成就里程碑做成点球推进、GitHub 贡献做成球场上的「进攻心率图」、球星对战组件 GitFutDuel。
- **音乐系统**：Pinia 驱动的全局播放器，悬浮播放条常驻，独立播放列表页。
- **GitHub 社交**：基于 GitHub Discussions 的真实评论 / 点赞，OAuth 经 Cloudflare Worker 交换，防冒充、零数据库。

## 技术栈

- Vue 3、TypeScript、Pinia、Vue Router（hash 模式）
- Tailwind CSS v4 与 Less 共存（工具类 + 组件级作用域样式）
- Geist Variable 与 Geist Mono Variable 自托管字体
- Phosphor Icons、canvas-confetti、marked
- GitHub OAuth + GitHub Discussions + Cloudflare Worker（社交数据层）
- Sharp 图片优化脚本

## 本地运行

```bash
npm install
npm run dev
```

生产检查：

```bash
npm run type-check   # vue-tsc
npm run lint         # eslint --fix
npm run build        # type-check + vite build
npm run preview
```

## 目录

```text
src/
  views/landing/        路由入口：KickoffView（射门开场）与 ShowcaseView（红黑斜切过场）
  views/blog/           BlogLayout 及 About / Article / Music / Album 等路由页面
  components/ui/       可复用 UI 组件（Section / Card / Tag / TagCloud / IconButton / RevealOnScroll）
  components/profile/   AttackPulse 进攻心率图、GitFutDuel 球星对战、RepositoryShowcase
  components/social/    AuthButton 登录、ReactionBar 点赞、CommentThread 评论
  content/              内容配置：profile / timeline / repos / friends / welcome（改数组即改内容，不碰组件）
  design/               tokens.ts 设计 token(JS 侧) 与 icons.ts 图标统一出口
  service/auth/         GitHub OAuth(githubOAuth / workerClient)
  service/discussions/  GitHub GraphQL 数据层(githubGraphql / commentsRepo / reactionsRepo)
  service/              githubPublic(公共事件) 与 articleService
  stores/               Pinia：musicStore / audioManager
  styles/               main.css(Tailwind 入口 + @theme) / tokens.less / mixins.less
  router/router.ts      hash 路由；/Animation3 父路由 redirect 到默认子路由
worker/                 Cloudflare OAuth Worker(wrangler)
scripts/                内容索引与图片处理脚本
```

### 设计 token

单一事实来源为两份镜像，改一处需同步另一处：`src/design/tokens.ts`（JS 侧：动画时长 / 断点 / zIndex）与 `src/styles/tokens.less`（Less 变量）。圆角锁两档：卡片 `@radius-card 16px`、控件 `@radius-control 12px`。

## 内容维护

内容尽量数据驱动，多数「增删内容 = 改数组 / 改 JSON，不碰组件」。

文章放在 `public/article/`，更新后运行：

```bash
npm run generate-articles
```

相册放在 `public/album/<相册名>/`，更新后运行：

```bash
npm run generate-albums
npm run optimize-images
```

音乐文件放在 `public/music/`，清单为 `public/music/musiccontext.json`（可用 `scripts/generate-songs-json.ts` 生成）。

欢迎页 showcase 内容与切换时序位于 `public/resources/welcomeShowcase.json`，资源映射集中在 `src/content/welcome.ts`。

`npm run optimize-images` 会为 JPG、PNG 生成最大边长 1600px 的 WebP 衍生文件，不覆盖原图，可安全重复运行。

个人资料、技能阵型、成就里程碑、精选仓库、友链分别在 `src/content/` 下的 `profile.ts` / `timeline.ts` / `repos.ts` / `friends.ts`。

## GitHub 社交功能

复制 `.env.example` 并配置：

```bash
VITE_GITHUB_CLIENT_ID=
VITE_GITHUB_WORKER_URL=
VITE_GITHUB_REDIRECT_URI=https://alexbybye.github.io/
VITE_GITHUB_REPO_OWNER=AlexBybye
VITE_GITHUB_REPO_NAME=AlexBybye.github.io
VITE_GITHUB_DISCUSSION_CATEGORY=site-comments
```

然后按 `worker/README.md` 部署 Cloudflare Worker，并在目标 GitHub 仓库启用 Discussions。

- OAuth token 仅保存在浏览器 `sessionStorage`；本地存储只用于评论缓存与离线降级，不作为身份或数据真源。
- 评论作者身份来自真实 GitHub 授权，无法冒充。
- 未配置 GitHub 环境变量时，文章、音乐和相册仍可正常阅读，社交组件会显示明确的未配置状态。

## 部署

纯前端静态站，部署 GitHub Pages，hash 路由无需服务端 rewrite。`public/.nojekyll` 已禁用 Jekyll 处理。

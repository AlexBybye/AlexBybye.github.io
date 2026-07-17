# Lin_eclipse Personal Web

Vue 3 + Vite 的个人站，保留三段式足球入口、Hash 路由、Pinia 音乐系统与 Markdown 文章管线。当前视觉系统使用中性暗色与单一拜仁红 `#e30613`，页面针对桌面与移动端分别设计。

## 技术栈

- Vue 3、TypeScript、Pinia、Vue Router
- Tailwind CSS v4 与 Less
- Geist Variable 与 Geist Mono Variable 自托管字体
- Phosphor Icons
- GitHub OAuth、GitHub Discussions、Cloudflare Worker
- Sharp 图片优化脚本

## 本地运行

```bash
npm install
npm run dev
```

生产检查：

```bash
npm run type-check
npx eslint .
npm run build
npm run preview
```

## 目录

```text
src/
  components/ui/        原子 UI 组件
  components/social/    登录、点赞、评论组件
  component/Pages/      页面组件
  component/welcome/    射门入口与红黑过场
  content/              个人资料、里程碑、仓库、友链数据
  design/               TS 设计 token 与图标出口
  service/auth/         GitHub OAuth
  service/discussions/  GitHub GraphQL 数据层
  styles/               Tailwind 入口、Less token 与 mixin
worker/                  Cloudflare OAuth Worker
scripts/                 内容索引与图片处理脚本
```

## 内容维护

文章放在 `public/article/`，更新后运行：

```bash
npm run generate-articles
```

相册放在 `public/album/<相册名>/`，更新后运行：

```bash
npm run generate-albums
npm run optimize-images
```

音乐清单位于 `public/music/musiccontext.json`。欢迎页内容与切换时序位于 `public/resources/welcomeShowcase.json`，资源映射集中在 `src/component/welcome/welcomeResources.ts`。

`npm run optimize-images` 会为 JPG、PNG 生成最大边长 1600px 的 WebP 衍生文件，不覆盖原图，可安全重复运行。

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

然后按 `worker/README.md` 部署 Cloudflare Worker，并在目标 GitHub 仓库启用 Discussions。OAuth token 仅保存在浏览器 `sessionStorage`；本地存储只用于评论缓存与离线降级，不作为身份或数据真源。

未配置 GitHub 环境变量时，文章、音乐和相册仍可正常阅读，社交组件会显示明确的未配置状态。

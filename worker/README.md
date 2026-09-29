# GitHub OAuth Worker

1. 在 GitHub 创建 OAuth App，回调 URL 指向站点根地址。
2. 将 `wrangler.toml` 中的 `GITHUB_CLIENT_ID` 与 `ALLOWED_ORIGIN` 改为真实值。
3. 在 `worker/` 下安装依赖，运行 `npx wrangler secret put GITHUB_CLIENT_SECRET`。
4. 创建并绑定 `GITHUB_PUBLIC_CACHE` KV；Worker 的 Cron Trigger 每天刷新 GitHub 公共数据快照，并结算前一天的世界波助威数。
5. 运行 `npm run deploy`，把 Worker 地址写入站点的 `VITE_GITHUB_WORKER_URL`。
6. 在目标仓库启用 Discussions，并把评论分类 slug 写入 `VITE_GITHUB_DISCUSSION_CATEGORY`。

GitHub 公共快照存储在固定 KV key `github-public-snapshot:v1`，世界波助威累计数据单独存放在 `worldie-support:v1`。计数接口为 `GET/POST /worldie-support`：页面读取全站累计数，点击助威会记入当天计数，Cron 在 UTC 日期切换后将当天计数结算进累计总数。若 GitHub 快照已过期，首次读取也会尝试同步刷新，避免访客一直看到过期数据。

更新博客或重新部署 Worker 不会清空 KV；
只有删除命名空间、删除 key 或改绑新的 namespace id 才会丢失快照。

Worker 只负责 code 到 token 的交换及公共快照/助威计数。访问 token 默认由浏览器保存到 `localStorage`；前端会兼容迁移旧的 `sessionStorage` token。Worker 不持久化用户访问 token。

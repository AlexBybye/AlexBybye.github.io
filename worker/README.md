# GitHub OAuth Worker

1. 在 GitHub 创建 OAuth App，回调 URL 指向站点根地址。
2. 将 `wrangler.toml` 中的 `GITHUB_CLIENT_ID` 与 `ALLOWED_ORIGIN` 改为真实值。
3. 在 `worker/` 下安装依赖，运行 `npx wrangler secret put GITHUB_CLIENT_SECRET`。
4. 创建并绑定 `GITHUB_PUBLIC_CACHE` KV；Worker 的 Cron Trigger 会每 12 小时刷新一次 GitHub 公共数据快照。
5. 运行 `npm run deploy`，把 Worker 地址写入站点的 `VITE_GITHUB_WORKER_URL`。
6. 在目标仓库启用 Discussions，并把评论分类 slug 写入 `VITE_GITHUB_DISCUSSION_CATEGORY`。

公共快照存储在固定 KV key `github-public-snapshot:v1`。更新博客或重新部署 Worker 不会清空 KV；
只有删除命名空间、删除 key 或改绑新的 namespace id 才会丢失快照。

Worker 只负责 code 到 token 的交换。访问 token 由浏览器保存到 `sessionStorage`，关闭会话后失效。

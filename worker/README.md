# GitHub OAuth Worker

1. 在 GitHub 创建 OAuth App，回调 URL 指向站点根地址。
2. 将 `wrangler.toml` 中的 `GITHUB_CLIENT_ID` 与 `ALLOWED_ORIGIN` 改为真实值。
3. 在 `worker/` 下安装依赖，运行 `npx wrangler secret put GITHUB_CLIENT_SECRET`。
4. 运行 `npm run deploy`，把 Worker 地址写入站点的 `VITE_GITHUB_WORKER_URL`。
5. 在目标仓库启用 Discussions，并把评论分类 slug 写入 `VITE_GITHUB_DISCUSSION_CATEGORY`。

Worker 只负责 code 到 token 的交换。访问 token 由浏览器保存到 `sessionStorage`，关闭会话后失效。

interface KvNamespace {
  get<T>(key: string, type: 'json'): Promise<T | null>
  put(key: string, value: string): Promise<void>
}

interface WorkerContext {
  waitUntil(promise: Promise<unknown>): void
}

interface Env {
  ALLOWED_ORIGIN: string
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
  GITHUB_PUBLIC_TOKEN?: string
  GITHUB_PUBLIC_CACHE: KvNamespace
}

interface GithubRepositoryResponse {
  name: string
  full_name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  updated_at: string
  topics?: string[]
  license?: { spdx_id: string } | null
}

interface GithubEventResponse {
  type: string
  created_at: string
  repo: { name: string }
  payload?: {
    commits?: unknown[]
    size?: number
  }
}

interface PublicRepoMetrics {
  name: string
  fullName: string
  description: string
  href: string
  language: string
  stars: number
  forks: number
  openIssues: number
  updatedAt: string
  topics: string[]
  license: string
}

interface AttackDay {
  date: string
  label: string
  actions: number
  events: number
}

interface AttackSummary {
  days: AttackDay[]
  totalActions: number
  eventCount: number
  activeDays: number
  repositories: number
  topEvent: string
  lastActionAt: string | null
}

interface GithubPublicSnapshot {
  version: 1
  username: string
  repositories: Record<string, PublicRepoMetrics>
  attackSummary: AttackSummary
  fetchedAt: string
  expiresAt: string
}

interface PublicDiscussionComment {
  id: string
  author: string
  avatarUrl: string
  authorUrl: string
  body: string
  createdAt: string
  reactionCount: number
}

interface PublicDiscussion {
  id: string
  number: number
  slug: string
  reactionCount: number
  comments: PublicDiscussionComment[]
}

const SNAPSHOT_KEY = 'github-public-snapshot:v1'
const SNAPSHOT_TTL_MS = 12 * 60 * 60 * 1000
const ATTACK_DAY_COUNT = 30
// GitHub 事件接口单页上限 100，取 200 条需要翻页；该接口总量最多 300 条 / 90 天。
const ATTACK_EVENT_LIMIT = 200
const ATTACK_EVENT_PAGE_SIZE = 100
const GITHUB_USERNAME = 'AlexBybye'
const GITHUB_REPOSITORIES = [
  { owner: 'AlexBybye', name: 'Make_Video_Great_Again' },
  { owner: 'AlexBybye', name: 'SCUT_CS' }
]

let activeRefresh: Promise<GithubPublicSnapshot> | null = null

function corsHeaders(origin: string, allowedOrigin: string) {
  return {
    'access-control-allow-origin': origin === allowedOrigin ? origin : allowedOrigin,
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    vary: 'origin'
  }
}

function githubHeaders(env: Env) {
  const headers: Record<string, string> = {
    accept: 'application/vnd.github+json',
    'user-agent': 'lin-eclipse-public-snapshot',
    'x-github-api-version': '2022-11-28'
  }
  if (env.GITHUB_PUBLIC_TOKEN) headers.authorization = `Bearer ${env.GITHUB_PUBLIC_TOKEN}`
  return headers
}

async function githubJson<T>(path: string, env: Env): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: githubHeaders(env),
    signal: AbortSignal.timeout(15_000)
  })
  if (!response.ok) {
    const remaining = response.headers.get('x-ratelimit-remaining')
    throw new Error(`GitHub request failed (${response.status}, remaining: ${remaining ?? 'unknown'})`)
  }
  return response.json() as Promise<T>
}

function repoMetrics(data: GithubRepositoryResponse): PublicRepoMetrics {
  return {
    name: data.name,
    fullName: data.full_name,
    description: data.description || '',
    href: data.html_url,
    language: data.language || 'Mixed',
    stars: data.stargazers_count,
    forks: data.forks_count,
    openIssues: data.open_issues_count,
    updatedAt: data.updated_at,
    topics: data.topics?.slice(0, 3) || [],
    license: data.license?.spdx_id || 'No license'
  }
}

function eventWeight(event: GithubEventResponse) {
  if (event.type === 'PushEvent') return Math.max(2, event.payload?.commits?.length || event.payload?.size || 0)
  if (event.type === 'PullRequestEvent') return 4
  if (event.type === 'PullRequestReviewEvent') return 3
  if (event.type === 'ReleaseEvent') return 5
  if (event.type === 'IssuesEvent' || event.type === 'ForkEvent') return 2
  return 1
}

function isoDay(date: Date) {
  return date.toISOString().slice(0, 10)
}

function attackSummary(events: GithubEventResponse[]): AttackSummary {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const days: AttackDay[] = Array.from({ length: ATTACK_DAY_COUNT }, (_, index) => {
    const date = new Date(today)
    date.setUTCDate(today.getUTCDate() - (ATTACK_DAY_COUNT - 1 - index))
    return {
      date: isoDay(date),
      label: isoDay(date),
      actions: 0,
      events: 0
    }
  })
  const dayMap = new Map(days.map((day) => [day.date, day]))
  const eventTypes = new Map<string, number>()
  const repositories = new Set<string>()

  events.forEach((event) => {
    const day = dayMap.get(event.created_at.slice(0, 10))
    if (!day) return
    day.actions += eventWeight(event)
    day.events += 1
    repositories.add(event.repo.name)
    eventTypes.set(event.type, (eventTypes.get(event.type) || 0) + 1)
  })

  const topType = Array.from(eventTypes.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || ''
  return {
    days,
    totalActions: days.reduce((sum, day) => sum + day.actions, 0),
    eventCount: days.reduce((sum, day) => sum + day.events, 0),
    activeDays: days.filter((day) => day.events > 0).length,
    repositories: repositories.size,
    topEvent: topType || 'OtherEvent',
    lastActionAt: events[0]?.created_at || null
  }
}

async function fetchAttackEvents(env: Env): Promise<GithubEventResponse[]> {
  const user = encodeURIComponent(GITHUB_USERNAME)
  const events: GithubEventResponse[] = []
  const pageCount = Math.ceil(ATTACK_EVENT_LIMIT / ATTACK_EVENT_PAGE_SIZE)

  for (let page = 1; page <= pageCount; page += 1) {
    const perPage = Math.min(ATTACK_EVENT_PAGE_SIZE, ATTACK_EVENT_LIMIT - events.length)
    const path = `/users/${user}/events/public?per_page=${perPage}&page=${page}`
    let batch: GithubEventResponse[]
    try {
      batch = await githubJson<GithubEventResponse[]>(path, env)
    } catch (error) {
      // 首页失败视为抓取失败；后续页失败（分页上限、限流）保留已取到的事件。
      if (page === 1) throw error
      break
    }
    events.push(...batch)
    if (batch.length < perPage) break
  }
  return events
}

async function buildSnapshot(env: Env): Promise<GithubPublicSnapshot> {
  const [events, ...repositories] = await Promise.all([
    fetchAttackEvents(env),
    ...GITHUB_REPOSITORIES.map(({ owner, name }) =>
      githubJson<GithubRepositoryResponse>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`, env)
    )
  ])
  const fetchedAt = new Date()
  const repositoryMap = Object.fromEntries(repositories.map((repository) => {
    const metrics = repoMetrics(repository)
    return [metrics.fullName.toLowerCase(), metrics]
  }))
  const snapshot: GithubPublicSnapshot = {
    version: 1,
    username: GITHUB_USERNAME,
    repositories: repositoryMap,
    attackSummary: attackSummary(events),
    fetchedAt: fetchedAt.toISOString(),
    expiresAt: new Date(fetchedAt.getTime() + SNAPSHOT_TTL_MS).toISOString()
  }
  await env.GITHUB_PUBLIC_CACHE.put(SNAPSHOT_KEY, JSON.stringify(snapshot))
  return snapshot
}

function refreshSnapshot(env: Env) {
  if (activeRefresh) return activeRefresh
  activeRefresh = buildSnapshot(env).finally(() => { activeRefresh = null })
  return activeRefresh
}

async function publicSnapshot(env: Env, headers: Record<string, string>) {
  const cached = await env.GITHUB_PUBLIC_CACHE.get<GithubPublicSnapshot>(SNAPSHOT_KEY, 'json')
  if (cached) {
    const stale = Date.parse(cached.expiresAt) <= Date.now()
    return Response.json({ ...cached, stale }, {
      headers: {
        ...headers,
        'cache-control': 'public, max-age=300, stale-while-revalidate=43200',
        'x-github-snapshot': stale ? 'stale' : 'fresh'
      }
    })
  }

  try {
    const snapshot = await refreshSnapshot(env)
    return Response.json({ ...snapshot, stale: false }, {
      headers: {
        ...headers,
        'cache-control': 'public, max-age=300, stale-while-revalidate=43200',
        'x-github-snapshot': 'fresh'
      }
    })
  } catch (error) {
    return Response.json({
      error: error instanceof Error ? error.message : 'GitHub snapshot refresh failed'
    }, { status: 503, headers: { ...headers, 'cache-control': 'no-store' } })
  }
}

async function publicDiscussions(env: Env, headers: Record<string, string>) {
  const query = `query PublicSiteDiscussions($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      discussions(first: 100, orderBy: { field: UPDATED_AT, direction: DESC }) {
        nodes {
          id number title
          reactionGroups { content users { totalCount } }
          comments(first: 100) { nodes { id body createdAt author { login avatarUrl url } reactionGroups { content users { totalCount } } } }
        }
      }
    }
  }`
  const data = await githubGraphqlPublic<{
    repository: { discussions: { nodes: Array<{ id: string; number: number; title: string; reactionGroups: Array<{ content: string; users: { totalCount: number } }>; comments: { nodes: Array<{ id: string; body: string; createdAt: string; author: { login: string; avatarUrl: string; url: string } | null; reactionGroups: Array<{ content: string; users: { totalCount: number } }> }> } }> } }
  }>(query, env, { owner: 'AlexBybye', name: 'AlexBybye.github.io' })
  const discussions: Record<string, PublicDiscussion> = {}
  for (const node of data.repository.discussions.nodes) {
    if (!node.title.startsWith('[site:') || !node.title.endsWith(']')) continue
    const slug = node.title.slice(6, -1)
    const thumbs = (groups: Array<{ content: string; users: { totalCount: number } }>) => groups.find((group) => group.content === 'THUMBS_UP')?.users.totalCount || 0
    discussions[slug] = {
      id: node.id, number: node.number, slug, reactionCount: thumbs(node.reactionGroups),
      comments: node.comments.nodes.map((comment) => ({ id: comment.id, author: comment.author?.login || 'ghost', avatarUrl: comment.author?.avatarUrl || '/images/avatar.jpg', authorUrl: comment.author?.url || 'https://github.com', body: comment.body, createdAt: comment.createdAt, reactionCount: thumbs(comment.reactionGroups) }))
    }
  }
  return Response.json({ version: 1, discussions, fetchedAt: new Date().toISOString() }, { headers: { ...headers, 'cache-control': 'public, max-age=300, stale-while-revalidate=43200' } })
}

async function githubGraphqlPublic<T>(query: string, env: Env, variables: Record<string, string>): Promise<T> {
  const response = await fetch('https://api.github.com/graphql', { method: 'POST', headers: { ...githubHeaders(env), 'content-type': 'application/json' }, body: JSON.stringify({ query, variables }) })
  const payload = await response.json() as { data?: T; errors?: Array<{ message: string }> }
  if (!response.ok || payload.errors?.length || !payload.data) throw new Error(payload.errors?.[0]?.message || `GitHub request failed (${response.status})`)
  return payload.data
}

async function exchangeToken(request: Request, env: Env, headers: Record<string, string>) {
  const payload = await request.json() as { code?: string; redirect_uri?: string }
  if (!payload.code || !payload.redirect_uri) {
    return Response.json({ error: 'Missing OAuth code or redirect URI' }, {
      status: 400,
      headers: { ...headers, 'cache-control': 'no-store' }
    })
  }

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code: payload.code,
      redirect_uri: payload.redirect_uri
    })
  })
  const token = await tokenResponse.json() as Record<string, string>
  if (!tokenResponse.ok || token.error || !token.access_token) {
    return Response.json({ error: token.error_description || 'Token exchange failed' }, {
      status: 400,
      headers: { ...headers, 'cache-control': 'no-store' }
    })
  }
  return Response.json({ access_token: token.access_token }, {
    headers: { ...headers, 'cache-control': 'no-store' }
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const origin = request.headers.get('origin') || env.ALLOWED_ORIGIN
    const headers = corsHeaders(origin, env.ALLOWED_ORIGIN)

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers })
    if (origin !== env.ALLOWED_ORIGIN) {
      return Response.json({ error: 'Origin not allowed' }, {
        status: 403,
        headers: { ...headers, 'cache-control': 'no-store' }
      })
    }
    if (url.pathname === '/github/public-snapshot' && request.method === 'GET') {
      return publicSnapshot(env, headers)
    }
    if (url.pathname === '/github/discussions' && request.method === 'GET') {
      try { return await publicDiscussions(env, headers) } catch (error) { return Response.json({ error: error instanceof Error ? error.message : 'Discussion snapshot failed' }, { status: 503, headers }) }
    }
    if (url.pathname === '/oauth/token' && request.method === 'POST') {
      return exchangeToken(request, env, headers)
    }
    return Response.json({ error: 'Not found' }, {
      status: 404,
      headers: { ...headers, 'cache-control': 'no-store' }
    })
  },

  async scheduled(_controller: unknown, env: Env, context: WorkerContext) {
    context.waitUntil(
      refreshSnapshot(env)
        .then((snapshot) => { console.log(`GitHub snapshot refreshed at ${snapshot.fetchedAt}`) })
        .catch((error) => { console.error('GitHub snapshot refresh failed', error) })
    )
  }
}

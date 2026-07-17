const GITHUB_API = 'https://api.github.com'
const CACHE_TTL = 15 * 60 * 1000

interface CacheEntry<T> {
  expires: number
  value: T
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
  id: string
  type: string
  created_at: string
  repo: { name: string }
  payload?: {
    action?: string
    commits?: unknown[]
    size?: number
  }
}

export interface PublicRepoMetrics {
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

export interface AttackDay {
  date: string
  label: string
  actions: number
  events: number
}

export interface AttackSummary {
  days: AttackDay[]
  totalActions: number
  eventCount: number
  activeDays: number
  repositories: number
  topEvent: string
  lastActionAt: string | null
}

function cacheKey(key: string) {
  return `lin_eclipse.github_public.${key}`
}

function readCache<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(cacheKey(key))
    if (!raw) return null
    const entry = JSON.parse(raw) as CacheEntry<T>
    if (entry.expires <= Date.now()) {
      sessionStorage.removeItem(cacheKey(key))
      return null
    }
    return entry.value
  } catch {
    return null
  }
}

function writeCache<T>(key: string, value: T) {
  try {
    sessionStorage.setItem(cacheKey(key), JSON.stringify({ expires: Date.now() + CACHE_TTL, value }))
  } catch {
    // Metrics can still render when storage is unavailable.
  }
}

async function githubJson<T>(path: string, key: string): Promise<T> {
  const cached = readCache<T>(key)
  if (cached) return cached

  const response = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })
  if (!response.ok) {
    const reason = response.status === 403 ? 'GitHub 公共接口请求次数已达上限' : `GitHub 数据加载失败 (${response.status})`
    throw new Error(reason)
  }
  const value = await response.json() as T
  writeCache(key, value)
  return value
}

export async function loadPublicRepository(owner: string, name: string): Promise<PublicRepoMetrics> {
  const data = await githubJson<GithubRepositoryResponse>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`, `repo.${owner}.${name}`)
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

function eventLabel(type: string) {
  const labels: Record<string, string> = {
    PushEvent: '推进代码',
    PullRequestEvent: '发起合并',
    PullRequestReviewEvent: '参与评审',
    IssuesEvent: '处理议题',
    IssueCommentEvent: '参与讨论',
    CreateEvent: '创建项目',
    ForkEvent: '分支推进',
    ReleaseEvent: '发布版本',
    WatchEvent: '关注项目'
  }
  return labels[type] || '公开动作'
}

function isoDay(date: Date) {
  return date.toISOString().slice(0, 10)
}

export async function loadAttackSummary(username: string, dayCount = 42): Promise<AttackSummary> {
  const events = await githubJson<GithubEventResponse[]>(`/users/${encodeURIComponent(username)}/events/public?per_page=100`, `events.${username}`)
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const days: AttackDay[] = Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(today)
    date.setUTCDate(today.getUTCDate() - (dayCount - 1 - index))
    return {
      date: isoDay(date),
      label: new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(date),
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
    topEvent: eventLabel(topType),
    lastActionAt: events[0]?.created_at || null
  }
}

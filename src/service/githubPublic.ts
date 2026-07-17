const CACHE_KEY = 'lin_eclipse.github_public.snapshot.v1'
const CACHE_TTL = 12 * 60 * 60 * 1000
const STALE_RETRY_TTL = 60 * 60 * 1000

interface CacheEntry {
  nextRefreshAt: number
  value: GithubPublicSnapshot
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
  fetchedAt: string
  stale: boolean
}

type SnapshotAttackSummary = Omit<AttackSummary, 'fetchedAt' | 'stale'>

interface GithubPublicSnapshot {
  version: 1
  username: string
  repositories: Record<string, PublicRepoMetrics>
  attackSummary: SnapshotAttackSummary
  fetchedAt: string
  expiresAt: string
  stale: boolean
}

let snapshotRequest: Promise<GithubPublicSnapshot> | null = null

function repositoryKey(owner: string, name: string) {
  return `${owner}/${name}`.toLowerCase()
}

function readCache(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const entry = JSON.parse(raw) as CacheEntry
    if (entry.value?.version !== 1 || !entry.value.repositories || !entry.value.attackSummary) return null
    return entry
  } catch {
    return null
  }
}

function writeCache(value: GithubPublicSnapshot) {
  try {
    const expiresAt = Date.parse(value.expiresAt)
    const freshUntil = Number.isFinite(expiresAt) ? expiresAt : Date.now() + CACHE_TTL
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      nextRefreshAt: value.stale ? Date.now() + STALE_RETRY_TTL : freshUntil,
      value
    } satisfies CacheEntry))
  } catch {
    // The in-memory singleton still prevents duplicate requests for this page load.
  }
}

function workerSnapshotUrl() {
  const workerUrl = import.meta.env.VITE_GITHUB_WORKER_URL
  if (!workerUrl) throw new Error('VITE_GITHUB_WORKER_URL is not configured')
  return `${workerUrl.replace(/\/$/, '')}/github/public-snapshot`
}

async function fetchSnapshot(): Promise<GithubPublicSnapshot> {
  const response = await fetch(workerSnapshotUrl(), {
    headers: { accept: 'application/json' }
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string } | null
    throw new Error(payload?.error || `GitHub 快照加载失败 (${response.status})`)
  }
  const snapshot = await response.json() as GithubPublicSnapshot
  if (snapshot.version !== 1 || !snapshot.repositories || !snapshot.attackSummary) {
    throw new Error('GitHub 快照格式不兼容')
  }
  writeCache(snapshot)
  return snapshot
}

async function loadSnapshot() {
  const cached = readCache()
  if (cached && cached.nextRefreshAt > Date.now()) return cached.value
  if (snapshotRequest) return snapshotRequest

  snapshotRequest = fetchSnapshot()
    .catch((error) => {
      if (cached) {
        const staleSnapshot = { ...cached.value, stale: true }
        writeCache(staleSnapshot)
        return staleSnapshot
      }
      throw error
    })
    .finally(() => { snapshotRequest = null })
  return snapshotRequest
}

export async function loadPublicRepository(owner: string, name: string): Promise<PublicRepoMetrics> {
  const snapshot = await loadSnapshot()
  const repository = snapshot.repositories[repositoryKey(owner, name)]
  if (!repository) throw new Error(`GitHub 快照中没有 ${owner}/${name}`)
  return repository
}

export async function loadAttackSummary(username: string, dayCount = 42): Promise<AttackSummary> {
  const snapshot = await loadSnapshot()
  if (snapshot.username.toLowerCase() !== username.toLowerCase()) {
    throw new Error(`GitHub 快照中没有用户 ${username}`)
  }
  const days = snapshot.attackSummary.days.slice(-dayCount)
  return {
    ...snapshot.attackSummary,
    days,
    totalActions: days.reduce((sum, day) => sum + day.actions, 0),
    eventCount: days.reduce((sum, day) => sum + day.events, 0),
    activeDays: days.filter((day) => day.events > 0).length,
    fetchedAt: snapshot.fetchedAt,
    stale: snapshot.stale
  }
}

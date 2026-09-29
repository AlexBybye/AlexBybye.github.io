export interface SiteFansSnapshot {
  total: number
}

export type ContentKind = 'article' | 'album' | 'song'
export type ContentKey = `${ContentKind}:${string}`

function endpoint(path: string) {
  const workerUrl = import.meta.env.VITE_GITHUB_WORKER_URL
  if (!workerUrl) throw new Error('VITE_GITHUB_WORKER_URL is not configured')
  return `${workerUrl.replace(/\/$/, '')}${path}`
}

export function contentKey(kind: ContentKind, id: string): ContentKey {
  return `${kind}:${encodeURIComponent(id)}`
}

let currentSiteVisit: Promise<SiteFansSnapshot> | null = null

export function recordSiteVisit(): Promise<SiteFansSnapshot> {
  if (!currentSiteVisit) currentSiteVisit = requestSiteFans('POST')
  return currentSiteVisit
}

export function loadSiteFans(): Promise<SiteFansSnapshot> {
  return currentSiteVisit ?? requestSiteFans('GET')
}

async function requestSiteFans(method: 'GET' | 'POST'): Promise<SiteFansSnapshot> {
  const response = await fetch(endpoint('/site-fans'), { method, headers: { accept: 'application/json' } })
  if (!response.ok) throw new Error(`Site fan counter failed (${response.status})`)
  return response.json() as Promise<SiteFansSnapshot>
}

export async function loadContentCounts(keys: ContentKey[], visitKey?: ContentKey): Promise<Record<string, number>> {
  const response = await fetch(endpoint('/view-counts'), {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify({ keys, ...(visitKey ? { visitKey } : {}) })
  })
  if (!response.ok) throw new Error(`Content view counter failed (${response.status})`)
  const result = await response.json() as { counts: Record<string, number> }
  return result.counts
}

export interface WorldieSupportSnapshot {
  totalCount: number
  dailyCount: number
  day: string
  previousDayCount: number
  updatedAt: string
}

function endpoint() {
  const workerUrl = import.meta.env.VITE_GITHUB_WORKER_URL
  if (!workerUrl) throw new Error('VITE_GITHUB_WORKER_URL is not configured')
  return `${workerUrl.replace(/\/$/, '')}/worldie-support`
}

async function request(method: 'GET' | 'POST'): Promise<WorldieSupportSnapshot> {
  const response = await fetch(endpoint(), {
    method,
    headers: { accept: 'application/json' }
  })
  if (!response.ok) throw new Error(`Worldie support counter failed (${response.status})`)
  return response.json() as Promise<WorldieSupportSnapshot>
}

export function loadWorldieSupport() {
  return request('GET')
}

export function addWorldieSupport() {
  return request('POST')
}

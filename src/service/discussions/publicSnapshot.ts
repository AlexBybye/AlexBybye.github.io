export interface PublicComment {
  id: string
  author: string
  avatarUrl: string
  authorUrl: string
  body: string
  createdAt: string
  reactionCount: number
}

export interface PublicDiscussion {
  id: string
  number: number
  slug: string
  reactionCount: number
  comments: PublicComment[]
}

interface PublicDiscussionSnapshot { discussions: Record<string, PublicDiscussion> }

export async function loadPublicDiscussion(slug: string): Promise<PublicDiscussion | null> {
  const workerUrl = import.meta.env.VITE_GITHUB_WORKER_URL
  if (!workerUrl) return null
  try {
    const response = await fetch(`${workerUrl.replace(/\/$/, '')}/github/discussions`, { headers: { accept: 'application/json' } })
    if (!response.ok) return null
    const snapshot = await response.json() as PublicDiscussionSnapshot
    return snapshot.discussions?.[slug] || null
  } catch {
    return null
  }
}

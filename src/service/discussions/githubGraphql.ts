import { getGithubToken } from '../auth/githubOAuth'

interface GraphqlEnvelope<T> {
  data?: T
  errors?: Array<{ message: string }>
}

export async function githubGraphql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const token = getGithubToken()
  if (!token) throw new Error('GitHub login required')

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({ query, variables })
  })

  const payload = await response.json() as GraphqlEnvelope<T>
  if (!response.ok || payload.errors?.length || !payload.data) {
    throw new Error(payload.errors?.[0]?.message || `GitHub request failed (${response.status})`)
  }
  return payload.data
}

export function getGithubRepositoryConfig() {
  const owner = import.meta.env.VITE_GITHUB_REPO_OWNER || 'AlexBybye'
  const name = import.meta.env.VITE_GITHUB_REPO_NAME || 'AlexBybye.github.io'
  const category = import.meta.env.VITE_GITHUB_DISCUSSION_CATEGORY || 'site-comments'
  return { owner, name, category }
}

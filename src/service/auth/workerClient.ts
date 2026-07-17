interface TokenResponse {
  access_token: string
}

export async function exchangeOAuthCode(code: string, redirectUri: string): Promise<string> {
  const workerUrl = import.meta.env.VITE_GITHUB_WORKER_URL
  if (!workerUrl) throw new Error('VITE_GITHUB_WORKER_URL is not configured')

  const response = await fetch(`${workerUrl.replace(/\/$/, '')}/oauth/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ code, redirect_uri: redirectUri })
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'GitHub token exchange failed')
  }

  const payload = await response.json() as TokenResponse
  if (!payload.access_token) throw new Error('GitHub did not return an access token')
  return payload.access_token
}

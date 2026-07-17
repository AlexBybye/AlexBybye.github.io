interface Env {
  ALLOWED_ORIGIN: string
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
}

function corsHeaders(origin: string, allowedOrigin: string) {
  return {
    'access-control-allow-origin': origin === allowedOrigin ? origin : allowedOrigin,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'cache-control': 'no-store',
    vary: 'origin'
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const origin = request.headers.get('origin') || env.ALLOWED_ORIGIN
    const headers = corsHeaders(origin, env.ALLOWED_ORIGIN)

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers })
    if (url.pathname !== '/oauth/token' || request.method !== 'POST') {
      return Response.json({ error: 'Not found' }, { status: 404, headers })
    }
    if (origin !== env.ALLOWED_ORIGIN) {
      return Response.json({ error: 'Origin not allowed' }, { status: 403, headers })
    }

    const payload = await request.json() as { code?: string; redirect_uri?: string }
    if (!payload.code || !payload.redirect_uri) {
      return Response.json({ error: 'Missing OAuth code or redirect URI' }, { status: 400, headers })
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
      return Response.json({ error: token.error_description || 'Token exchange failed' }, { status: 400, headers })
    }

    return Response.json({ access_token: token.access_token }, { headers })
  }
}

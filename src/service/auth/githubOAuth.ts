import { readonly, ref } from 'vue'
import { exchangeOAuthCode } from './workerClient'

export interface GithubUser {
  login: string
  name: string | null
  avatarUrl: string
  url: string
}

const TOKEN_KEY = 'lin_eclipse.github_token'
const STATE_KEY = 'lin_eclipse.github_oauth_state'
const RETURN_KEY = 'lin_eclipse.github_oauth_return'

const user = ref<GithubUser | null>(null)
const isAuthLoading = ref(false)
const authError = ref('')

export const githubUser = readonly(user)
export const githubAuthLoading = readonly(isAuthLoading)
export const githubAuthError = readonly(authError)

function getRedirectUri() {
  if (import.meta.env.VITE_GITHUB_REDIRECT_URI) return import.meta.env.VITE_GITHUB_REDIRECT_URI
  return `${window.location.origin}${window.location.pathname}`
}

export function getGithubToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function isGithubConfigured() {
  return Boolean(import.meta.env.VITE_GITHUB_CLIENT_ID && import.meta.env.VITE_GITHUB_WORKER_URL)
}

async function loadViewer() {
  const token = getGithubToken()
  if (!token) {
    user.value = null
    return
  }

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({ query: 'query Viewer { viewer { login name avatarUrl url } }' })
  })

  const payload = await response.json()
  if (!response.ok || payload.errors) {
    sessionStorage.removeItem(TOKEN_KEY)
    throw new Error(payload.errors?.[0]?.message || 'Unable to load GitHub identity')
  }
  user.value = payload.data.viewer
}

export async function beginGithubOAuth() {
  if (!isGithubConfigured()) throw new Error('GitHub OAuth is not configured')
  const state = crypto.randomUUID()
  const redirectUri = getRedirectUri()
  sessionStorage.setItem(STATE_KEY, state)
  sessionStorage.setItem(RETURN_KEY, window.location.href)

  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: 'read:user public_repo',
    state
  })
  window.location.assign(`https://github.com/login/oauth/authorize?${params}`)
}

export async function completeGithubOAuth() {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const returnedState = params.get('state')

  isAuthLoading.value = true
  authError.value = ''
  try {
    if (code) {
      const expectedState = sessionStorage.getItem(STATE_KEY)
      if (!returnedState || returnedState !== expectedState) throw new Error('GitHub OAuth state check failed')
      const token = await exchangeOAuthCode(code, getRedirectUri())
      sessionStorage.setItem(TOKEN_KEY, token)
      sessionStorage.removeItem(STATE_KEY)

      const returnUrl = sessionStorage.getItem(RETURN_KEY)
      sessionStorage.removeItem(RETURN_KEY)
      if (returnUrl) {
        const target = new URL(returnUrl)
        history.replaceState({}, '', `${target.pathname}${target.search}${target.hash}`)
      } else {
        history.replaceState({}, '', `${window.location.pathname}${window.location.hash}`)
      }
    }
    await loadViewer()
  } catch (error) {
    authError.value = error instanceof Error ? error.message : 'GitHub login failed'
    throw error
  } finally {
    isAuthLoading.value = false
  }
}

export function logoutGithub() {
  sessionStorage.removeItem(TOKEN_KEY)
  user.value = null
  authError.value = ''
}

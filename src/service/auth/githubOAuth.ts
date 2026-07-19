import { readonly, ref } from 'vue'
import { exchangeOAuthCode } from './workerClient'

export interface GithubUser {
  login: string
  name: string | null
  avatarUrl: string
  url: string
}

interface GithubOAuthAttempt {
  createdAt: number
  mode: 'popup'
  redirectUri: string
}

export type GithubOAuthPopupOutcome = 'closed' | 'timeout'

export interface GithubOAuthPopupSession {
  result: Promise<GithubOAuthPopupOutcome>
}

const TOKEN_KEY = 'lin_eclipse.github_token'
const ATTEMPT_KEY_PREFIX = 'lin_eclipse.github_oauth_attempt.'
const ATTEMPT_TTL_MS = 15 * 60 * 1000

const user = ref<GithubUser | null>(null)
const isAuthLoading = ref(false)
const authError = ref('')
let activePopupSession: GithubOAuthPopupSession | null = null

export const githubUser = readonly(user)
export const githubAuthLoading = readonly(isAuthLoading)
export const githubAuthError = readonly(authError)

function getRedirectUri() {
  if (import.meta.env.VITE_GITHUB_REDIRECT_URI) return import.meta.env.VITE_GITHUB_REDIRECT_URI
  return `${window.location.origin}${window.location.pathname}`
}

function getAttemptKey(state: string) {
  return `${ATTEMPT_KEY_PREFIX}${state}`
}

function removeStoredToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Storage can be unavailable in locked-down/private browsing modes.
  }
  // Remove the old per-tab token too, including tokens created before this flow changed.
  try {
    sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    // Nothing else to clear when the browser blocks session storage.
  }
}

function storeToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    throw new Error('浏览器无法保存 GitHub 登录状态，请允许本站使用本地存储后重试。')
  }

  try {
    sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    // The persistent token is already available to every same-origin tab.
  }
}

function pruneExpiredAttempts() {
  const now = Date.now()

  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index)
    if (!key?.startsWith(ATTEMPT_KEY_PREFIX)) continue

    try {
      const attempt = JSON.parse(localStorage.getItem(key) || '') as Partial<GithubOAuthAttempt>
      if (!attempt.createdAt || now - attempt.createdAt > ATTEMPT_TTL_MS) localStorage.removeItem(key)
    } catch {
      localStorage.removeItem(key)
    }
  }
}

function storeOAuthAttempt(state: string, attempt: GithubOAuthAttempt) {
  try {
    pruneExpiredAttempts()
    localStorage.setItem(getAttemptKey(state), JSON.stringify(attempt))
  } catch {
    throw new Error('浏览器无法保存 GitHub 授权请求，请允许本站使用本地存储后重试。')
  }
}

function getOAuthAttempt(state: string) {
  try {
    const key = getAttemptKey(state)
    const rawAttempt = localStorage.getItem(key)
    if (!rawAttempt) return null

    const attempt = JSON.parse(rawAttempt) as GithubOAuthAttempt
    const isValid = attempt.mode === 'popup'
      && typeof attempt.redirectUri === 'string'
      && typeof attempt.createdAt === 'number'
      && Date.now() - attempt.createdAt <= ATTEMPT_TTL_MS

    if (!isValid) {
      localStorage.removeItem(key)
      return null
    }

    return attempt
  } catch {
    return null
  }
}

function removeOAuthAttempt(state: string) {
  try {
    localStorage.removeItem(getAttemptKey(state))
  } catch {
    // The attempt will expire naturally if storage has become unavailable.
  }
}

function clearOAuthCallbackParams() {
  const url = new URL(window.location.href)
  ;['code', 'state', 'error', 'error_description', 'error_uri'].forEach((key) => {
    url.searchParams.delete(key)
  })
  history.replaceState(history.state, '', `${url.pathname}${url.search}${url.hash}`)
}

function monitorOAuthPopup(popup: Window, state: string): GithubOAuthPopupSession {
  let pollTimer: number | undefined
  let timeoutTimer: number | undefined
  let settled = false

  const result = new Promise<GithubOAuthPopupOutcome>((resolve) => {
    const finish = (outcome: GithubOAuthPopupOutcome) => {
      if (settled) return
      settled = true

      if (pollTimer !== undefined) window.clearInterval(pollTimer)
      if (timeoutTimer !== undefined) window.clearTimeout(timeoutTimer)
      removeOAuthAttempt(state)

      if (outcome === 'timeout' && !popup.closed) popup.close()
      resolve(outcome)
    }

    pollTimer = window.setInterval(() => {
      if (popup.closed) finish('closed')
    }, 400)
    timeoutTimer = window.setTimeout(() => finish('timeout'), ATTEMPT_TTL_MS)

    if (popup.closed) finish('closed')
  })

  const session = { result }
  void result.then(() => {
    if (activePopupSession === session) activePopupSession = null
  })
  return session
}

export function getGithubToken() {
  if (typeof window === 'undefined') return null

  let persistedToken: string | null = null
  try {
    persistedToken = localStorage.getItem(TOKEN_KEY)
  } catch {
    // Fall back to the legacy per-tab token below when persistent storage is blocked.
  }
  if (persistedToken) return persistedToken

  // Preserve an existing login once while migrating from sessionStorage.
  let legacySessionToken: string | null = null
  try {
    legacySessionToken = sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
  if (!legacySessionToken) return null

  try {
    localStorage.setItem(TOKEN_KEY, legacySessionToken)
  } catch {
    return legacySessionToken
  }

  try {
    sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    // The migration itself succeeded, so the legacy copy can be left in place.
  }
  return legacySessionToken
}

export function isGithubConfigured() {
  return Boolean(import.meta.env.VITE_GITHUB_CLIENT_ID && import.meta.env.VITE_GITHUB_WORKER_URL)
}

export function isGithubOAuthCallback() {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  return params.has('code') || params.has('error')
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
    removeStoredToken()
    throw new Error(payload.errors?.[0]?.message || 'Unable to load GitHub identity')
  }
  user.value = payload.data.viewer
}

export function beginGithubOAuth(): GithubOAuthPopupSession {
  if (!isGithubConfigured()) throw new Error('GitHub OAuth is not configured')
  if (activePopupSession) return activePopupSession

  const state = crypto.randomUUID()
  const redirectUri = getRedirectUri()
  const popupWidth = 680
  const popupHeight = 760
  const popupLeft = Math.max(0, window.screenX + (window.outerWidth - popupWidth) / 2)
  const popupTop = Math.max(0, window.screenY + (window.outerHeight - popupHeight) / 2)
  const popup = window.open(
    'about:blank',
    `lin-eclipse-github-oauth-${state}`,
    `popup=yes,width=${popupWidth},height=${popupHeight},left=${popupLeft},top=${popupTop}`
  )

  if (!popup) {
    throw new Error('GitHub 登录窗口被浏览器拦截。请允许本站打开弹出式窗口后重试。')
  }

  try {
    popup.opener = null
    storeOAuthAttempt(state, {
      createdAt: Date.now(),
      mode: 'popup',
      redirectUri
    })

    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_GITHUB_CLIENT_ID,
      redirect_uri: redirectUri,
      scope: 'read:user public_repo',
      state
    })
    popup.location.replace(`https://github.com/login/oauth/authorize?${params}`)
    popup.focus()
    const session = monitorOAuthPopup(popup, state)
    activePopupSession = session
    return session
  } catch (error) {
    removeOAuthAttempt(state)
    popup.close()
    throw error
  }
}

export async function completeGithubOAuth() {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const returnedState = params.get('state')
  const returnedError = params.get('error')
  const hasCode = params.has('code')
  const hasError = params.has('error')
  const isOAuthCallback = hasCode || hasError

  isAuthLoading.value = true
  authError.value = ''
  try {
    if (hasError) {
      const attempt = returnedState ? getOAuthAttempt(returnedState) : null
      if (!returnedError || !returnedState || !attempt) {
        throw new Error('GitHub 授权校验失败或请求已过期，请从原页面重新登录。')
      }

      removeOAuthAttempt(returnedState)
      const description = params.get('error_description')
      throw new Error(
        returnedError === 'access_denied'
          ? '你已取消 GitHub 授权，本站没有读取或保存任何新凭证。'
          : description || `GitHub authorization failed: ${returnedError}`
      )
    }

    if (hasCode) {
      const attempt = returnedState ? getOAuthAttempt(returnedState) : null
      if (!code || !returnedState || !attempt) {
        throw new Error('GitHub 授权校验失败或请求已过期，请从原页面重新登录。')
      }

      removeOAuthAttempt(returnedState)
      const token = await exchangeOAuthCode(code, attempt.redirectUri)
      storeToken(token)
    }

    await loadViewer()
  } catch (error) {
    authError.value = error instanceof Error ? error.message : 'GitHub login failed'
    throw error
  } finally {
    if (isOAuthCallback) clearOAuthCallbackParams()
    isAuthLoading.value = false
  }
}

export function logoutGithub() {
  removeStoredToken()
  user.value = null
  authError.value = ''
}

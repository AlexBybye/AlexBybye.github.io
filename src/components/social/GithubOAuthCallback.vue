<template>
  <main class="oauth-callback-shell">
    <section class="oauth-callback-card" :class="`is-${status}`" aria-live="polite">
      <div class="status-icon" aria-hidden="true">
        <PhSpinnerGap v-if="status === 'loading'" class="spin" :size="34" weight="bold" />
        <PhGithubLogo v-else-if="status === 'success'" :size="36" weight="fill" />
        <PhWarningCircle v-else :size="36" weight="fill" />
      </div>

      <p class="eyebrow">{{ t('social.authEyebrow') }}</p>
      <h1>{{ title }}</h1>
      <p class="status-copy">{{ message }}</p>

      <a
        v-if="status === 'success' && githubUser"
        class="identity"
        :href="githubUser.url"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img :src="githubUser.avatarUrl" :alt="t('social.avatarAlt', { author: githubUser.login })">
        <span>
          <small>{{ t('social.authenticatedAs') }}</small>
          <strong>@{{ githubUser.login }}</strong>
        </span>
      </a>

      <button v-if="status !== 'loading'" class="close-button" type="button" @click="closeWindow">
        <PhX :size="18" weight="bold" aria-hidden="true" />
        {{ t('social.closeAuth') }}
      </button>

      <p v-if="status === 'success'" class="footnote">
        {{ t('social.authCloseHint') }}
      </p>
      <p v-else-if="status === 'error'" class="footnote">
        {{ t('social.authUnchanged') }}
      </p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { PhGithubLogo, PhSpinnerGap, PhWarningCircle, PhX } from '@/design/icons'
import { completeGithubOAuth, githubAuthError, githubUser } from '@/service/auth/githubOAuth'

const status = ref<'loading' | 'success' | 'error'>('loading')
const { t } = useI18n()
let closeTimer: number | undefined

const title = computed(() => {
  if (status.value === 'success') return t('social.loginSuccess')
  if (status.value === 'error') return t('social.authIncomplete')
  return t('social.completingAuth')
})

const message = computed(() => {
  if (status.value === 'success') return t('social.credentialSaved')
  if (status.value === 'error') return githubAuthError.value || t('social.authError')
  return t('social.checkingAuth')
})

function closeWindow() {
  window.close()
}

onMounted(async () => {
  try {
    await completeGithubOAuth()
    status.value = 'success'
    closeTimer = window.setTimeout(closeWindow, 2200)
  } catch {
    status.value = 'error'
  }
})

onBeforeUnmount(() => {
  if (closeTimer !== undefined) window.clearTimeout(closeTimer)
})
</script>

<style scoped lang="less">
.oauth-callback-shell {
  box-sizing: border-box;
  display: grid;
  min-height: 100dvh;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(circle at 18% 12%, rgb(255 255 255 / 10%), transparent 34%),
    #070707;
  color: #f7f7f4;
  font-family: 'Geist Variable', system-ui, sans-serif;
}

.oauth-callback-card {
  width: min(100%, 480px);
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: 20px;
  padding: clamp(28px, 7vw, 44px);
  background: rgb(15 15 15 / 94%);
  box-shadow: 0 24px 80px rgb(0 0 0 / 52%);
  text-align: center;
}

.status-icon {
  display: grid;
  width: 64px;
  height: 64px;
  margin: 0 auto 22px;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: 18px;
  background: #f7f7f4;
  color: #090909;
}

.is-error .status-icon {
  background: #ff8a92;
}

.eyebrow {
  margin: 0 0 10px;
  color: rgb(247 247 244 / 55%);
  font-family: 'Geist Mono Variable', monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .14em;
}

h1 {
  margin: 0;
  font-size: clamp(27px, 7vw, 38px);
  letter-spacing: -.045em;
}

.status-copy {
  margin: 15px auto 0;
  color: rgb(247 247 244 / 72%);
  font-size: 15px;
  line-height: 1.65;
}

.identity {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
  border: 1px solid rgb(255 255 255 / 14%);
  border-radius: 14px;
  padding: 12px;
  background: rgb(255 255 255 / 6%);
  color: inherit;
  text-align: left;
  text-decoration: none;
  transition: border-color 160ms ease, transform 160ms ease;
}

.identity:hover { border-color: rgb(255 255 255 / 30%); }
.identity:active { transform: scale(.98); }
.identity:focus-visible,
.close-button:focus-visible { outline: 2px solid #f7f7f4; outline-offset: 3px; }

.identity img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
}

.identity span {
  display: grid;
  gap: 2px;
}

.identity small {
  color: rgb(247 247 244 / 50%);
  font-family: 'Geist Mono Variable', monospace;
  font-size: 9px;
  letter-spacing: .12em;
}

.identity strong {
  font-size: 15px;
}

.close-button {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  width: 100%;
  margin-top: 24px;
  border: 1px solid #f7f7f4;
  border-radius: 12px;
  padding: 10px 16px;
  background: #f7f7f4;
  color: #090909;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: transform 160ms ease;
}

.close-button:active { transform: scale(.98); }

.footnote {
  margin: 14px 0 0;
  color: rgb(247 247 244 / 48%);
  font-size: 12px;
  line-height: 1.55;
}

.spin {
  animation: spin 900ms linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .spin { animation: none; }
  .identity,
  .close-button { transition: none; }
}
</style>

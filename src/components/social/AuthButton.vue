<template>
  <div class="auth-wrap">
    <button
      v-if="githubUser"
      class="auth-button signed-in"
      type="button"
      :aria-label="t('social.logout', { login: githubUser.login })"
      @click="logoutGithub"
    >
      <span class="kickoff-ball" aria-hidden="true">
        <PhSoccerBall :size="19" weight="fill" />
      </span>
      <img :src="githubUser.avatarUrl" :alt="t('social.avatarAlt', { author: githubUser.login })">
      <span class="player-label"><small>{{ t('social.signedIn') }}</small><strong>@{{ githubUser.login }}</strong></span>
      <PhSignOut :size="18" weight="bold" aria-hidden="true" />
    </button>
    <button
      v-else
      class="auth-button"
      type="button"
      :disabled="!configured || githubAuthLoading || popupActive"
      @click="login"
    >
      <span class="kickoff-ball" aria-hidden="true">
        <PhSpinnerGap v-if="githubAuthLoading || popupActive" class="spin" :size="19" />
        <PhSoccerBall v-else :size="19" weight="fill" />
      </span>
      <span>{{ buttonLabel }}</span>
      <span class="provider-mark" aria-hidden="true"><PhGithubLogo :size="18" weight="fill" /></span>
    </button>
    <p v-if="errorMessage || githubAuthError" class="auth-error">{{ errorMessage || githubAuthError }}</p>
    <p v-else-if="popupStatus === 'opened'" class="auth-note" role="status">
      {{ t('social.loginPageOpened') }}
    </p>
    <p v-else-if="popupStatus === 'closed'" class="auth-note" role="status">
      {{ t('social.popupClosed') }}
    </p>
    <p v-else-if="popupStatus === 'timeout'" class="auth-error" role="alert">
      {{ t('social.loginTimeout') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { PhGithubLogo, PhSignOut, PhSoccerBall, PhSpinnerGap } from '@/design/icons'
import {
  beginGithubOAuth,
  githubAuthError,
  githubAuthLoading,
  githubUser,
  isGithubConfigured,
  logoutGithub
} from '@/service/auth/githubOAuth'

const configured = isGithubConfigured()
const { t } = useI18n()
const errorMessage = ref('')
const popupActive = ref(false)
const popupStatus = ref<'idle' | 'opened' | 'closed' | 'timeout'>('idle')

const buttonLabel = computed(() => {
  if (!configured) return t('social.loginUnavailable')
  if (githubAuthLoading.value) return t('social.checkingIdentity')
  if (popupActive.value) return t('social.waitingConfirmation')
  return t('social.login')
})

async function login() {
  if (popupActive.value) return

  errorMessage.value = ''
  popupStatus.value = 'idle'
  popupActive.value = true
  try {
    const session = beginGithubOAuth()
    popupStatus.value = 'opened'
    popupStatus.value = await session.result
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : t('social.loginFailed')
  } finally {
    popupActive.value = false
  }
}
</script>

<style scoped lang="less">
@import '../../styles/tokens.less';

.auth-wrap { display: grid; gap: .6rem; }
.auth-button {
  position: relative;
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  gap: .7rem;
  overflow: hidden;
  border: 1px solid #ff5963;
  border-radius: 12px;
  padding: .5rem .65rem;
  background:
    linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px) center / 42px 100%,
    linear-gradient(135deg, #e30613, #b8000b);
  color: @text;
  font-weight: 720;
  white-space: nowrap;
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.2);
  transition: border-color 180ms ease, background 180ms ease, transform 180ms ease;

  &::after { position: absolute; inset: 0 auto 0 50%; border-left: 1px solid rgba(255,255,255,.12); content: ''; pointer-events: none; }
  > * { position: relative; z-index: 1; }
  &:hover:not(:disabled) { border-color: @text; background-color: #bd0712; transform: translateY(-2px); }
  &:active:not(:disabled) { transform: scale(.98); }
  &:focus-visible { outline: 2px solid @text; outline-offset: 3px; }
  &:disabled { cursor: not-allowed; opacity: .58; }
  &.signed-in { justify-content: flex-start; border-color: @line; background: @surface-soft; color: @text; box-shadow: none; }
  img { width: 26px; height: 26px; border-radius: 50%; }
}
.kickoff-ball { display: grid; width: 32px; min-width: 32px; height: 32px; place-items: center; border-radius: 50%; background: @text; color: @surface; transition: transform 240ms cubic-bezier(.16,1,.3,1); }
.auth-button:hover:not(:disabled) .kickoff-ball { transform: translateX(3px) rotate(46deg); }
.provider-mark { display: grid; min-height: 28px; place-items: center; margin-left: .1rem; border-left: 1px solid rgba(255,255,255,.24); padding-left: .7rem; }
.player-label { display: grid; min-width: 0; flex: 1; gap: 1px; text-align: left; }
.player-label small { color: @text-muted; font-size: .58rem; font-weight: 600; letter-spacing: .08em; }
.player-label strong { overflow: hidden; font-size: .82rem; text-overflow: ellipsis; }
.auth-error { margin: 0; color: #ff8a92; font-size: .875rem; }
.auth-note { margin: 0; color: fade(@text, 66%); font-size: .8125rem; line-height: 1.5; }
.spin { animation: spin 900ms linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 767px) { .auth-button { width: 100%; } }
@media (prefers-reduced-motion: reduce) {
  .auth-button, .kickoff-ball { transition: none; }
  .auth-button:hover:not(:disabled), .auth-button:hover:not(:disabled) .kickoff-ball { transform: none; }
  .spin { animation: none; }
}
</style>

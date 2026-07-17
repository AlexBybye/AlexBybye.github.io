<template>
  <div class="auth-wrap">
    <button v-if="githubUser" class="auth-button signed-in" type="button" @click="logoutGithub">
      <img :src="githubUser.avatarUrl" :alt="`${githubUser.login} 的 GitHub 头像`">
      <span>{{ githubUser.login }}</span>
      <PhSignOut :size="18" weight="bold" aria-hidden="true" />
    </button>
    <button v-else class="auth-button" type="button" :disabled="!configured || githubAuthLoading" @click="login">
      <PhSpinnerGap v-if="githubAuthLoading" class="spin" :size="19" aria-hidden="true" />
      <PhGithubLogo v-else :size="19" weight="fill" aria-hidden="true" />
      <span>{{ configured ? '使用 GitHub 登录' : 'GitHub 社交功能未配置' }}</span>
    </button>
    <p v-if="errorMessage || githubAuthError" class="auth-error">{{ errorMessage || githubAuthError }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PhGithubLogo, PhSignOut, PhSpinnerGap } from '@/design/icons'
import {
  beginGithubOAuth,
  githubAuthError,
  githubAuthLoading,
  githubUser,
  isGithubConfigured,
  logoutGithub
} from '@/service/auth/githubOAuth'

const configured = isGithubConfigured()
const errorMessage = ref('')

async function login() {
  errorMessage.value = ''
  try {
    await beginGithubOAuth()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '登录失败，请稍后重试。'
  }
}
</script>

<style scoped lang="less">
@import '../../styles/tokens.less';

.auth-wrap { display: grid; gap: .6rem; }
.auth-button {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  gap: .65rem;
  border: 1px solid @line;
  border-radius: 12px;
  padding: .7rem 1rem;
  background: @text;
  color: @surface;
  font-weight: 650;
  white-space: nowrap;
  cursor: pointer;

  &:disabled { cursor: not-allowed; opacity: .58; }
  &.signed-in { background: @surface-soft; color: @text; }
  img { width: 24px; height: 24px; border-radius: 50%; }
}
.auth-error { margin: 0; color: #ff8a92; font-size: .875rem; }
.spin { animation: spin 900ms linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 767px) { .auth-button { width: 100%; } }
</style>

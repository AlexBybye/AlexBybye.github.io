<template>
  <div class="friends-page"><div class="page-shell">
    <header><h1>{{ t('friends.title') }}</h1><p>{{ t('friends.description') }}</p></header>
    <section class="friends-list" :aria-label="t('friends.listLabel')">
      <a v-for="friend in friendLinks" :key="friend.url" :href="friend.url" target="_blank" rel="noreferrer">
        <img :src="friend.avatar" :alt="t('friends.avatarAlt', { name: friend.name })" loading="lazy" decoding="async">
        <div><h2>{{ friend.name }}</h2><p>{{ friend.description }}</p><span class="mono">{{ cleanUrl(friend.url) }}</span></div>
        <PhArrowRight :size="23" weight="bold" aria-hidden="true" />
      </a>
    </section>
  </div></div>
</template>

<script setup lang="ts">
import { PhArrowRight } from '@/design/icons'
import { useI18n } from 'vue-i18n'
import { friendLinks } from '@/content/friends'
const { t } = useI18n()
function cleanUrl(url: string) { return url.replace(/^https?:\/\//, '').replace(/\/$/, '') }
</script>

<style scoped lang="less">
@import '../../styles/tokens.less';
.friends-page { min-height: 100dvh; background: transparent; color: @text; }
header { max-width: 760px; padding-block: clamp(2.5rem, 7vw, 6rem); } header h1 { margin: 0; font-size: clamp(3rem, 9vw, 7rem); letter-spacing: -.08em; line-height: .9; } header p { margin: 1.3rem 0 0; color: @text-muted; font-size: 1.08rem; }
.friends-list { border-top: 1px solid @line; }.friends-list a { display: grid; grid-template-columns: 80px 1fr auto; gap: 1.25rem; align-items: center; border-bottom: 1px solid @line; padding-block: 1.5rem; color: @text; text-decoration: none; transition: color 160ms ease, padding 200ms ease; }.friends-list a:hover { padding-inline: 1rem; color: @accent-strong; }.friends-list img { width: 80px; height: 80px; border-radius: 16px; object-fit: cover; }.friends-list h2 { margin: 0; font-size: 1.5rem; }.friends-list p { margin: .35rem 0; color: @text-muted; }.friends-list span { color: @text-muted; font-size: .75rem; }
@media (max-width: 767px) { .friends-list a { grid-template-columns: 60px 1fr; }.friends-list img { width: 60px; height: 60px; }.friends-list a > :last-child { display: none; } }
@media (prefers-reduced-motion: reduce) { .friends-list a { transition: none; } }
</style>

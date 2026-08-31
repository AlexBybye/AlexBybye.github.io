<template>
  <div class="site-layout">
    <div class="reading-progress" aria-hidden="true"><span /><PhSoccerBall :size="17" weight="fill" /></div>

    <header class="site-header">
      <div class="legacy-marquee" role="img" :aria-label="t('nav.marquee')">
        <div class="marquee-track">
          <div v-for="group in 2" :key="group" class="marquee-group" :aria-hidden="group === 2">
            <img v-for="image in 8" :key="image" src="/images/rolling.webp" alt="" decoding="async">
          </div>
        </div>
      </div>

      <nav class="site-nav" :aria-label="t('nav.main')">
        <LocaleSwitcher theme="blog" />

        <button class="menu-button" type="button" :aria-expanded="menuOpen" aria-controls="primary-links" @click="menuOpen = !menuOpen">
          <PhX v-if="menuOpen" :size="23" weight="bold" aria-hidden="true" />
          <PhList v-else :size="23" weight="bold" aria-hidden="true" />
          <span class="sr-only">{{ menuOpen ? t('nav.close') : t('nav.open') }}</span>
        </button>

        <div id="primary-links" class="nav-links" :class="{ open: menuOpen }">
          <div class="page-links">
            <RouterLink v-for="link in navLinks" :key="link.to" :to="link.to" @click="menuOpen = false">
              <span>{{ link.label }}</span>
            </RouterLink>
          </div>
          <RouterLink class="friends-link" to="/Animation3/friends" :aria-label="t('nav.friends')" @click="menuOpen = false">
            <PhUsers :size="20" aria-hidden="true" /><span>{{ t('nav.friends') }}</span>
          </RouterLink>
        </div>
      </nav>
    </header>

    <aside class="floating-player" :aria-label="t('nav.player')">
      <button class="track-link" type="button" @click="goToMusicPlaylist">
        <img :src="currentTrackCover" :alt="currentTrack ? currentTrack.title : t('nav.noCover')" decoding="async">
        <span><strong>{{ currentTrack?.title || t('nav.chooseTrack') }}</strong><small>{{ currentTrack?.artist || t('nav.player') }}</small></span>
      </button>
      <div class="player-controls">
        <IconButton :label="t('nav.previous')" @click="musicStore.playPrevious"><PhSkipBack :size="18" weight="fill" /></IconButton>
        <IconButton :label="musicStore.isPlaying ? t('nav.pause') : t('nav.play')" @click="musicStore.togglePlay">
          <PhPause v-if="musicStore.isPlaying" :size="19" weight="fill" />
          <PhPlay v-else :size="19" weight="fill" />
        </IconButton>
        <IconButton :label="t('nav.next')" @click="musicStore.playNext"><PhSkipForward :size="18" weight="fill" /></IconButton>
      </div>
    </aside>

    <main class="site-content">
      <RouterView v-slot="{ Component, route }">
        <Transition name="route-slice" mode="out-in">
          <div :key="route.path" class="route-stage">
            <component :is="Component" />
          </div>
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { PhList, PhPause, PhPlay, PhSkipBack, PhSkipForward, PhSoccerBall, PhUsers, PhX } from '@/design/icons'
import { useMusicStore } from '@/stores/musicStore'
import IconButton from '@/components/ui/IconButton.vue'
import LocaleSwitcher from '@/components/ui/LocaleSwitcher.vue'

const router = useRouter()
const musicStore = useMusicStore()
const menuOpen = ref(false)
const { t } = useI18n()

const navLinks = computed(() => [
  { label: t('nav.about'), to: '/Animation3/about' },
  { label: t('nav.article'), to: '/Animation3/article' },
  { label: t('nav.music'), to: '/Animation3/music' },
  { label: t('nav.album'), to: '/Animation3/album' }
])

const currentTrack = computed(() => musicStore.currentTrack)
const currentTrackCover = computed(() => currentTrack.value?.coverImage ? `/music/${currentTrack.value.coverImage.replace(/\.(jpe?g|png)$/i, '.webp')}` : '/music/img/soccer.webp')
const goToMusicPlaylist = () => router.push('/Animation3/music/playlist')
watch(() => router.currentRoute.value.fullPath, () => { menuOpen.value = false })
</script>

<style scoped lang="less">
@import '../../styles/tokens.less';

.site-layout { position: relative; min-height: 100dvh; overflow-x: clip; background: @surface; isolation: isolate; }
/* 夜场灯光、草坪切纹与一道贯穿页面的拜仁红斜线，共用原有红黑令牌。 */
.site-layout::before {
  content: ''; position: fixed; z-index: 0; inset: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 92% 58% at 5% -10%, rgba(227, 6, 19, .18), transparent 62%),
    radial-gradient(ellipse 68% 54% at 104% 42%, rgba(244, 244, 245, .075), transparent 66%),
    linear-gradient(116deg, transparent 0 39%, rgba(227, 6, 19, .052) 39.15% 39.55%, transparent 39.7% 100%),
    repeating-linear-gradient(90deg, rgba(244, 244, 245, .022) 0 7vw, transparent 7vw 14vw),
    linear-gradient(180deg, #111116 0%, @surface 52%, #0e0e12 100%);
}
/* 固定在视口的细线只提供景深，不随滚动容器重绘。 */
.site-layout::after {
  content: ''; position: fixed; z-index: 0; inset: 0; pointer-events: none; opacity: .42;
  background-image:
    linear-gradient(rgba(244, 244, 245, .025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(244, 244, 245, .018) 1px, transparent 1px);
  background-size: clamp(68px, 8vw, 124px) clamp(68px, 8vw, 124px);
  mask-image: radial-gradient(ellipse 96% 78% at 50% 34%, #000 0 38%, transparent 86%);
}
.site-header { position: sticky; z-index: 20; top: 0; border-bottom: 1px solid rgba(63,63,70,.86); background: rgba(9,9,11,.92); backdrop-filter: blur(16px); }
.legacy-marquee { height: 22px; overflow: hidden; border-bottom: 1px solid rgba(244,244,245,.12); background: @accent; }
.marquee-track { display: flex; width: max-content; height: 100%; will-change: transform; animation: legacy-marquee 34s linear infinite; }
.marquee-group { display: flex; height: 100%; flex-shrink: 0; }
.marquee-group img { width: auto; height: 100%; flex: none; object-fit: contain; }
.legacy-marquee:hover .marquee-track { animation-play-state: paused; }
@keyframes legacy-marquee { to { transform: translate3d(-50%, 0, 0); } }

.site-nav { display: flex; width: min(100% - 2rem, 1200px); height: 64px; align-items: center; justify-content: space-between; gap: 2rem; margin-inline: auto; }
.site-mark { display: inline-flex; align-items: center; gap: .75rem; color: @text; text-decoration: none; white-space: nowrap; }
.site-mark > span { display: grid; width: 38px; height: 38px; place-items: center; border-radius: 12px; background: @accent; color: @text; font-family: 'Geist Mono Variable', monospace; font-size: .8rem; font-weight: 750; }
.site-mark strong { font-size: .95rem; }
.nav-links { display: flex; align-items: center; gap: 1rem; margin-left: auto; }
.page-links { display: flex; width: clamp(420px, 48vw, 610px); height: 44px; align-items: stretch; }
.page-links a {
  position: relative; display: grid; min-width: 0; flex: 1; place-items: center; overflow: hidden; color: @text-muted;
  font-size: .91rem; font-weight: 640; text-decoration: none; white-space: nowrap;
  transition: flex 560ms cubic-bezier(.16, 1, .3, 1), color 220ms ease, opacity 300ms ease;
}
.page-links a::before { content: ''; position: absolute; inset: 3px -10px; z-index: -1; background: @accent; opacity: 0; transform: translate3d(-108%, 0, 0) skewX(-16deg); transition: transform 420ms cubic-bezier(.16,1,.3,1), opacity 160ms ease; }
.page-links a span { transition: transform 420ms cubic-bezier(.16,1,.3,1), letter-spacing 420ms cubic-bezier(.16,1,.3,1); }
.page-links:hover a { flex: .34; opacity: .34; }
.page-links:hover a:hover { flex: 2.6; color: @text; opacity: 1; }
.page-links a:hover::before, .page-links a.router-link-active::before { opacity: 1; transform: translate3d(0,0,0) skewX(-16deg); }
.page-links a:hover span { letter-spacing: .14em; transform: translate3d(.08em, 0, 0); }
.page-links a.router-link-active { color: @text; }
.friends-link { position: relative; display: inline-flex; min-height: 44px; align-items: center; gap: .4rem; color: @text-muted; font-size: .88rem; font-weight: 620; text-decoration: none; white-space: nowrap; transition: color 180ms ease, transform 180ms ease; }
.friends-link:hover, .friends-link.router-link-active { color: @text; transform: translateY(-2px); }
.menu-button { display: none; width: 44px; height: 44px; place-items: center; border: 1px solid @line; border-radius: 12px; background: @surface-raised; color: @text; }
.reading-progress { position: fixed; z-index: 30; top: 0; right: 0; left: 0; height: 3px; pointer-events: none; }
.reading-progress span { position: absolute; width: 100%; height: 100%; background: @accent; transform: scaleX(0); transform-origin: left; animation: reading-progress linear both; animation-timeline: scroll(root); }
.reading-progress :deep(svg) { position: absolute; top: -7px; left: 0; color: black; animation: reading-ball linear both; animation-timeline: scroll(root); filter: drop-shadow(0 3px 7px rgba(227,6,19,.4)); }
@keyframes reading-progress { to { transform: scaleX(1); } }
@keyframes reading-ball { to { transform: translate3d(calc(100vw - 17px), 0, 0) rotate(720deg); } }
.site-content { position: relative; z-index: 1; min-height: calc(100dvh - 86px); padding-bottom: 4rem; }
.route-stage { position: relative; min-height: calc(100dvh - 86px); }
.route-stage::before { content: ''; position: fixed; z-index: 45; top: 86px; bottom: 0; left: -24vw; width: 24vw; pointer-events: none; background: @accent; opacity: 0; transform: skewX(-10deg) translate3d(-140%,0,0); }
.route-slice-enter-active { transition: opacity 520ms ease, transform 680ms cubic-bezier(.16,1,.3,1); }
.route-slice-leave-active { transition: opacity 220ms ease, transform 260ms ease; }
.route-slice-enter-active::before { animation: route-curtain 760ms cubic-bezier(.7,0,.2,1) both; }
.route-slice-enter-from { opacity: 0; transform: translate3d(38px,0,0); }
.route-slice-leave-to { opacity: 0; transform: translate3d(-22px,0,0); }
@keyframes route-curtain {
  0% { opacity: 1; transform: skewX(-10deg) translate3d(-140%,0,0); }
  48% { opacity: 1; }
  100% { opacity: 0; transform: skewX(-10deg) translate3d(720%,0,0); }
}

.floating-player {
  position: fixed; z-index: 30; right: max(1rem, env(safe-area-inset-right)); bottom: max(1rem, env(safe-area-inset-bottom));
  display: flex; width: 64px; height: 64px; align-items: center; justify-content: center; gap: 1rem;
  overflow: hidden; border: 1px solid rgba(244,244,245,.16); border-radius: 16px; padding: .45rem;
  background: rgba(24,24,27,.88); color: @text; backdrop-filter: blur(22px) saturate(135%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 20px 60px rgba(9,9,11,.42);
  transition: width 420ms cubic-bezier(.16,1,.3,1), height 260ms ease, border-color 220ms ease, background 220ms ease;
}
.floating-player::before { position: absolute; z-index: -1; top: -80%; bottom: -80%; left: -22%; width: 30%; content: ''; background: @accent; opacity: 0; transform: translateX(-180%) skewX(-18deg); transition: transform 520ms cubic-bezier(.16,1,.3,1), opacity 180ms ease; }
.floating-player:hover,.floating-player:focus-within { width: min(430px, calc(100vw - 2rem)); height: auto; justify-content: space-between; border-color: rgba(227,6,19,.72); background: rgba(24,24,27,.94); }
.floating-player:hover::before,.floating-player:focus-within::before { opacity: .9; transform: translateX(720%) skewX(-18deg); }
.track-link { display: grid; min-width: 0; flex: 1; grid-template-columns: 46px 1fr; gap: .7rem; align-items: center; border: 0; padding: 0; background: transparent; color: @text; text-align: left; cursor: pointer; }
.track-link img { width: 46px; height: 46px; border-radius: 12px; object-fit: cover; }
.track-link span { display: grid; min-width: 0; gap: .18rem; opacity: 0; transform: translateX(-8px); transition: opacity 220ms ease, transform 320ms ease; }
.floating-player:hover .track-link span,.floating-player:focus-within .track-link span { opacity: 1; transform: none; }
.track-link strong, .track-link small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.track-link strong { font-size: .83rem; } .track-link small { color: @text-muted; font-size: .72rem; }
.player-controls { display: flex; gap: .35rem; opacity: 0; pointer-events: none; transform: translateX(8px); transition: opacity 220ms ease, transform 320ms ease; }
.floating-player:hover .player-controls,.floating-player:focus-within .player-controls { opacity: 1; pointer-events: auto; transform: none; }
.player-controls :deep(.icon-button) { width: 38px; height: 38px; border-color: transparent; background: transparent; }
.floating-player:not(:hover):not(:focus-within) .player-controls :deep(.icon-button:nth-child(2)) { opacity: 1; pointer-events: auto; }
.floating-player:not(:hover):not(:focus-within) .player-controls { position: absolute; right: .45rem; opacity: 1; pointer-events: auto; transform: none; }
.floating-player:not(:hover):not(:focus-within) .player-controls :deep(.icon-button:first-child),.floating-player:not(:hover):not(:focus-within) .player-controls :deep(.icon-button:last-child) { display: none; }

@media (max-width: 767px) {
  .site-layout::before {
    background:
      radial-gradient(ellipse 120% 46% at 0 -4%, rgba(227, 6, 19, .16), transparent 66%),
      radial-gradient(ellipse 90% 38% at 110% 40%, rgba(244, 244, 245, .06), transparent 70%),
      linear-gradient(108deg, transparent 0 49%, rgba(227, 6, 19, .045) 49.2% 49.8%, transparent 50% 100%),
      repeating-linear-gradient(90deg, rgba(244, 244, 245, .018) 0 16vw, transparent 16vw 32vw),
      linear-gradient(180deg, #111116 0%, @surface 52%, #0e0e12 100%);
  }
  .site-layout::after { opacity: .3; background-size: 72px 72px; }
  .site-nav { width: min(100% - 1.25rem, 1200px); gap: .5rem; }
  .menu-button { display: grid; }
  .nav-links { position: absolute; top: 86px; right: 0; left: 0; display: none; align-items: stretch; gap: 0; margin-left: 0; border-bottom: 1px solid @line; padding: .6rem; background: @surface; }
  .nav-links.open { display: grid; }
  .page-links { display: grid; width: 100%; height: auto; }
  .page-links:hover a, .page-links:hover a:hover { flex: none; opacity: 1; }
  .page-links a, .friends-link { display: flex; min-height: 50px; justify-content: space-between; border-radius: 12px; padding-inline: 1rem; }
  .page-links a::before { inset: 4px; border-radius: 10px; transform: translate3d(-104%,0,0); }
  .page-links a:hover::before, .page-links a.router-link-active::before { transform: translate3d(0,0,0); }
  .page-links a:hover span { letter-spacing: normal; transform: none; }
  .friends-link:hover { transform: none; }
  .floating-player { right: max(1rem, env(safe-area-inset-right)); bottom: max(1rem, env(safe-area-inset-bottom)); left: auto; width: 64px; height: 64px; border-radius: 16px; padding: .45rem; }
  .floating-player .track-link span { display: none; }
  .floating-player .player-controls { position: absolute; right: .45rem; opacity: 1; pointer-events: auto; transform: none; }
  .floating-player .player-controls :deep(.icon-button:first-child),.floating-player .player-controls :deep(.icon-button:last-child) { display: none; }
  .site-content { padding-bottom: 5rem; }
  .route-stage::before { top: 86px; width: 42vw; }
}

@media (prefers-reduced-transparency: reduce) {
  .site-header, .floating-player { background: @surface-raised; backdrop-filter: none; }
}

@media (prefers-reduced-motion: reduce) {
  .marquee-track { animation: none; transform: none; }
  .page-links a, .page-links a::before, .page-links a span, .friends-link, .floating-player, .floating-player::before, .track-link span, .player-controls, .route-slice-enter-active, .route-slice-leave-active { transition: none; }
  .route-slice-enter-active::before { animation: none; }
  .route-slice-enter-from, .route-slice-leave-to { opacity: 1; transform: none; }
  .reading-progress { display: none; }
}
</style>

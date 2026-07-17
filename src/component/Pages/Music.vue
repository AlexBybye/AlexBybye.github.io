<template>
  <div class="music-page">
    <div class="page-shell">
      <section class="music-hero" aria-labelledby="music-title">
        <RevealOnScroll class="music-copy">
          <h1 id="music-title">Late nights. Match days.</h1>
          <p>Browse the collection, play a track, and leave a reaction through GitHub.</p>
          <RouterLink to="/Animation3/music/playlist">
            打开播放列表 <PhArrowRight :size="19" weight="bold" aria-hidden="true" />
          </RouterLink>
        </RevealOnScroll>

        <RevealOnScroll :delay="80" class="now-playing">
          <img :src="cover" :alt="currentTrack ? currentTrack.title : '音乐封面'" fetchpriority="high" decoding="async">
          <div class="track-copy">
            <span class="mono">{{ musicStore.isPlaying ? 'PLAYING' : 'PAUSED' }}</span>
            <h2>{{ currentTrack?.title || 'Loading library' }}</h2>
            <p>{{ currentTrack?.artist || 'Please wait' }}</p>
          </div>
          <button class="play-button" type="button" :aria-label="musicStore.isPlaying ? '暂停' : '播放'" @click="musicStore.togglePlay">
            <PhPause v-if="musicStore.isPlaying" :size="24" weight="fill" aria-hidden="true" />
            <PhPlay v-else :size="24" weight="fill" aria-hidden="true" />
          </button>
        </RevealOnScroll>
      </section>

      <section class="genre-section" aria-labelledby="genre-title">
        <div class="genre-heading">
          <div>
            <h2 id="genre-title">Find a frequency</h2>
            <p>Choose a moving tag to open that part of the library.</p>
          </div>
          <RouterLink to="/Animation3/music/playlist">
            全部歌曲 <PhArrowRight :size="18" weight="bold" aria-hidden="true" />
          </RouterLink>
        </div>
        <TagCloud :tags="musicTypes" :model-value="musicStore.selectedType" @tag-click="openGenre" />
      </section>

      <section class="wave-section" aria-labelledby="wave-title">
        <div class="wave-heading">
          <h2 id="wave-title">Live waveform</h2>
          <dl>
            <div><dt>Position</dt><dd class="mono">{{ formatTime(musicStore.currentTime) }}</dd></div>
            <div><dt>Duration</dt><dd class="mono">{{ formatTime(musicStore.totalTime || Number(currentTrack?.duration)) }}</dd></div>
            <div><dt>Tracks</dt><dd class="mono">{{ musicStore.tracks.length }}</dd></div>
          </dl>
        </div>
        <div class="waveform" :class="{ active: musicStore.isPlaying }" aria-hidden="true">
          <span v-for="index in 48" :key="index" :ref="(el) => setBar(el as HTMLElement, index - 1)" />
        </div>
      </section>

      <section v-if="currentTrack" class="track-social" aria-labelledby="track-social-title">
        <div class="social-heading">
          <div><h2 id="track-social-title">React to this track</h2><p>{{ currentTrack.title }} by {{ currentTrack.artist }}</p></div>
          <ReactionBar target-type="song" :target-id="trackSlug" />
        </div>
        <CommentThread :slug="`song:${trackSlug}`" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { PhArrowRight, PhPause, PhPlay } from '@/design/icons'
import { useAudioManager } from '@/stores/audioManager'
import { useMusicStore } from '@/stores/musicStore'
import CommentThread from '@/components/social/CommentThread.vue'
import ReactionBar from '@/components/social/ReactionBar.vue'
import RevealOnScroll from '@/components/ui/RevealOnScroll.vue'
import TagCloud from './TagCloud.vue'

const musicStore = useMusicStore()
const audioManager = useAudioManager()
const router = useRouter()
const bars: HTMLElement[] = []
let animationFrame = 0
let reducedMotionQuery: MediaQueryList | null = null

const currentTrack = computed(() => musicStore.currentTrack)
const cover = computed(() => currentTrack.value?.coverImage ? `/music/${currentTrack.value.coverImage.replace(/\.(jpe?g|png)$/i, '.webp')}` : '/music/img/soccer.webp')
const trackSlug = computed(() => encodeURIComponent(currentTrack.value?.filename || 'unknown-track').replace(/%/g, '').toLowerCase())
const musicTypes = computed(() => musicStore.getMusicTypes())

function setBar(element: HTMLElement | null, index: number) { if (element) bars[index] = element }
function formatTime(seconds: number | string | undefined) {
  const value = Number(seconds) || 0
  const minutes = Math.floor(value / 60)
  return `${minutes}:${Math.floor(value % 60).toString().padStart(2, '0')}`
}

function stopWaveform() {
  cancelAnimationFrame(animationFrame)
  bars.forEach((bar) => { bar.style.transform = 'scaleY(.08)' })
}

function drawWaveform() {
  cancelAnimationFrame(animationFrame)
  if (reducedMotionQuery?.matches) {
    bars.forEach((bar, index) => { bar.style.transform = `scaleY(${.12 + index % 5 * .08})` })
    return
  }
  const render = () => {
    if (!musicStore.isPlaying) return
    const values = audioManager.getFrequencyData()
    if (values) {
      bars.forEach((bar, index) => {
        const sourceIndex = Math.min(values.length - 1, Math.floor(index * values.length / bars.length))
        bar.style.transform = `scaleY(${Math.max(.08, values[sourceIndex] / 255)})`
      })
    }
    animationFrame = requestAnimationFrame(render)
  }
  render()
}

function openGenre(name: string) {
  musicStore.filterByType(name)
  void router.push('/Animation3/music/playlist')
}

function handleMotionPreference() {
  if (reducedMotionQuery?.matches) drawWaveform()
  else if (musicStore.isPlaying) drawWaveform()
}

watch(() => musicStore.isPlaying, (playing) => playing ? drawWaveform() : stopWaveform())
onMounted(async () => {
  reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotionQuery.addEventListener('change', handleMotionPreference)
  if (!musicStore.tracks.length) await musicStore.loadTracks()
  if (musicStore.isPlaying) drawWaveform()
})
onBeforeUnmount(() => {
  stopWaveform()
  reducedMotionQuery?.removeEventListener('change', handleMotionPreference)
})
</script>

<style scoped lang="less">
@import '../../styles/tokens.less';
.music-page { min-height: 100dvh; background: @surface; color: @text; }
.music-page > .page-shell { padding-block: 0; }
.music-hero { display: grid; grid-template-columns: 1.05fr .95fr; gap: clamp(2rem, 7vw, 6rem); min-height: calc(100dvh - 86px); align-items: center; padding-block: clamp(2.5rem, 6vw, 5rem); }
.music-copy h1 { max-width: 11ch; margin: 0; font-size: clamp(3rem, 7vw, 6.3rem); font-weight: 700; letter-spacing: -.07em; line-height: .92; }
.music-copy p { max-width: 45ch; margin: 1.5rem 0 0; color: @text-muted; font-size: 1.1rem; line-height: 1.6; }
.music-copy a { display: inline-flex; min-height: 46px; align-items: center; gap: .55rem; margin-top: 2rem; border-radius: 12px; padding: .75rem 1rem; background: @accent; color: @text; font-weight: 680; text-decoration: none; white-space: nowrap; }
.now-playing { position: relative; overflow: hidden; min-height: 520px; border: 1px solid @line; border-radius: 16px; background: @surface-raised; }
.now-playing > img { position: absolute; width: 100%; height: 100%; object-fit: cover; filter: saturate(.65) contrast(1.08); }
.now-playing::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(9,9,11,.05), rgba(9,9,11,.95)); }
.track-copy { position: absolute; z-index: 1; right: 1.5rem; bottom: 1.5rem; left: 1.5rem; }
.track-copy span { color: @accent-strong; font-size: .75rem; font-weight: 650; letter-spacing: .12em; }
.track-copy h2 { max-width: 16ch; margin: .7rem 0 .35rem; font-size: clamp(1.8rem, 4vw, 3.2rem); letter-spacing: -.05em; line-height: 1; }
.track-copy p { margin: 0; color: #d4d4d8; }
.play-button { position: absolute; z-index: 2; top: 1rem; right: 1rem; display: grid; width: 52px; height: 52px; place-items: center; border: 0; border-radius: 12px; background: @accent; color: @text; cursor: pointer; }
.genre-section { padding-block: clamp(4rem, 8vw, 7rem); border-top: 1px solid @line; }
.genre-heading { display: flex; align-items: end; justify-content: space-between; gap: 2rem; margin-bottom: 1.5rem; }
.genre-heading h2 { margin: 0; font-size: clamp(2rem, 5vw, 4.3rem); letter-spacing: -.06em; line-height: .95; }
.genre-heading p { margin: .8rem 0 0; color: @text-muted; }
.genre-heading a { display: inline-flex; min-height: 44px; align-items: center; gap: .45rem; color: @text; font-weight: 650; text-decoration: none; white-space: nowrap; }
.genre-heading a:hover { color: @accent-strong; }
.wave-section { padding-block: clamp(4rem, 9vw, 8rem); border-top: 1px solid @line; }
.wave-heading { display: grid; grid-template-columns: 1fr auto; gap: 2rem; align-items: end; }
.wave-heading h2, .social-heading h2 { margin: 0; font-size: clamp(2rem, 5vw, 4.3rem); letter-spacing: -.06em; line-height: .95; }
.wave-heading dl { display: flex; gap: 1.5rem; margin: 0; }
.wave-heading dl div { display: grid; gap: .35rem; }.wave-heading dt { color: @text-muted; font-size: .75rem; }.wave-heading dd { margin: 0; }
.waveform { display: grid; height: 210px; grid-template-columns: repeat(48, 1fr); gap: clamp(2px, .35vw, 6px); align-items: center; margin-top: 2.5rem; overflow: hidden; border-radius: 16px; padding: 1rem; background: @surface-raised; }
.waveform span { height: 100%; border-radius: 4px; background: @accent; transform: scaleY(.08); transition: transform 100ms linear; }
.waveform span:nth-child(3n) { opacity: .72; }
.track-social { padding-block: clamp(4rem, 9vw, 8rem); border-top: 1px solid @line; }
.social-heading { display: flex; align-items: end; justify-content: space-between; gap: 2rem; }
.social-heading p { margin: .8rem 0 0; color: @text-muted; }
@media (max-width: 767px) {
  .music-hero { grid-template-columns: 1fr; min-height: auto; }
  .music-copy h1 { font-size: clamp(3rem, 15vw, 4.8rem); }
  .now-playing { min-height: 400px; }
  .genre-heading { align-items: stretch; flex-direction: column; }
  .wave-heading, .social-heading { grid-template-columns: 1fr; flex-direction: column; align-items: stretch; }
  .wave-heading dl { display: grid; grid-template-columns: repeat(3, 1fr); gap: .7rem; }
  .wave-heading dl div { min-width: 0; }
  .waveform { height: 160px; grid-template-columns: repeat(24, 1fr); }
  .waveform span:nth-child(n+25) { display: none; }
}
@media (prefers-reduced-motion: reduce) { .waveform span { transition: none; } }
</style>
